const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // Nuevo: Manejo de archivos
const { XMLParser } = require('fast-xml-parser'); // Nuevo: Parser de XML
require('dotenv').config();

const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURACIÓN DE MULTER (RAM ONLY) ---
// Los archivos se guardan en buffer, nunca en disco.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // Límite 5MB por archivo
});

// --- CONFIGURACIÓN XML PARSER ---
const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ""
});

// --- MOCK DATABASE DE EFOS (Listas Negras) ---
// En producción, esto vendría de TiDB o una API del SAT
const BLACKLIST_EFOS = [
    'ESO1202108R2', // Empresa Simuladora (Ejemplo real)
    'XAXX010101000', // RFC Genérico (Para pruebas de riesgo)
    'BAD800101XX1'   // Fake EFO
];

// Middleware
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health Check
app.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        res.json({ status: 'ok', service: 'Radar Fiscal API', db: 'connected' });
    } catch (error) {
        console.error('DB Connection Failed:', error);
        res.status(503).json({ status: 'error', message: error.message });
    }
});

// Endpoint: Capture Lead
app.post('/api/leads', async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ error: 'Request body is missing' });

        const email = req.body.email;
        const full_name = req.body.full_name || 'Anonymous Lead';
        const phone = req.body.phone || null;
        const business_sector = req.body.business_sector || null;
        const risk_score_captured = req.body.risk_score_captured || 0;

        if (!email) return res.status(400).json({ error: 'Email is required' });

        const [result] = await pool.execute(
            'INSERT INTO leads (email, full_name, phone, business_sector, risk_score_captured) VALUES (?, ?, ?, ?, ?)',
            [email, full_name, phone, business_sector, risk_score_captured]
        );

        console.log('✅ Lead saved ID:', result.insertId);
        res.status(201).json({ message: 'Lead captured successfully', leadId: result.insertId });

    } catch (error) {
        console.error('❌ Error saving lead:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// Endpoint: Generate Session Token
app.post('/api/session/token', (req, res) => {
    res.json({ token: 'mock-token-12345', expiresIn: 3600 });
});

// 🚀 NUEVO ENDPOINT: AUDITORÍA DE XMLs
// Acepta múltiples archivos en el campo 'xmls'
app.post('/api/audit', upload.array('xmls', 20), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No se subieron archivos XML' });
        }

        const auditResults = [];
        let totalRiskAmount = 0;
        let risksFound = 0;

        req.files.forEach(file => {
            try {
                // 1. Parsing del Buffer a Texto
                const xmlContent = file.buffer.toString('utf-8');

                // 2. Parsing de Texto a Objeto JS
                const jsonObj = xmlParser.parse(xmlContent);
                const comprobante = jsonObj['cfdi:Comprobante'];

                if (!comprobante) {
                    auditResults.push({ fileName: file.originalname, status: 'error', reason: 'No es un CFDI válido' });
                    return;
                }

                // 3. Extracción de Datos Clave
                const emisor = comprobante['cfdi:Emisor'] || {};
                const receptor = comprobante['cfdi:Receptor'] || {};
                const total = parseFloat(comprobante.Total) || 0;
                const rfcEmisor = emisor.Rfc || 'DESCONOCIDO';
                const timbre = comprobante['cfdi:Complemento']?.['tfd:TimbreFiscalDigital'] || {};
                const uuid = timbre.UUID || 'SIN UUID';

                // 4. Lógica de Riesgo (Audit Logic)
                let riskLevel = 'low';
                let riskReason = 'Validado OK';

                // CHECK A: ¿Es EFO?
                if (BLACKLIST_EFOS.includes(rfcEmisor)) {
                    riskLevel = 'critical';
                    riskReason = 'EMISOR EN LISTA NEGRA (EFO)';
                    totalRiskAmount += total;
                    risksFound++;
                }

                auditResults.push({
                    fileName: file.originalname,
                    uuid,
                    rfcEmisor,
                    total: total,
                    riskLevel,
                    riskReason
                });

            } catch (innerError) {
                // Error parsing individual file
                auditResults.push({ fileName: file.originalname, status: 'error', reason: 'Error de parsing XML' });
            }
        });

        // 5. Respuesta Final (JSON) - Nada guardado en disco
        res.json({
            status: 'success',
            summary: {
                total_files_processed: req.files.length,
                risks_detected: risksFound,
                risk_amount: totalRiskAmount
            },
            details: auditResults
        });

    } catch (error) {
        console.error('Error en auditoría:', error);
        res.status(500).json({ error: 'Error procesando auditoría' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Radar Fiscal Backend running on port ${PORT}`);
});
