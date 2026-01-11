const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({ origin: '*' })); // CORS permisivo para evitar bloqueos
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

// Endpoint: Capture Lead (VALIDACIÓN ESTRICTA)
app.post('/api/leads', async (req, res) => {
    try {
        console.log('📝 Payload recibido:', req.body);

        if (!req.body) {
            return res.status(400).json({ error: 'Request body is missing' });
        }

        // Extracción con fallback a NULL explícito (Evita 'undefined' en SQL)
        // Usamos (val !== undefined ? val : null) para ser precisos, o el operador ||
        const email = req.body.email;
        const full_name = req.body.full_name || 'Anonymous Lead';
        const phone = req.body.phone || null;
        const business_sector = req.body.business_sector || null;
        const risk_score_captured = req.body.risk_score_captured || 0;

        // Validación de campos requeridos
        if (!email) {
            console.error('❌ Intento de guardar lead sin email');
            return res.status(400).json({ error: 'Email is required' });
        }

        // Query SQL con parámetros saneados
        const query = 'INSERT INTO leads (email, full_name, phone, business_sector, risk_score_captured) VALUES (?, ?, ?, ?, ?)';
        const params = [email, full_name, phone, business_sector, risk_score_captured];

        // Verificación final antes de ejecutar (Debug)
        if (params.some(p => p === undefined)) {
            throw new Error('FATAL: Parameter sanitizer failed, undefined value detected');
        }

        const [result] = await pool.execute(query, params);

        console.log('✅ Lead guardado exitosamente. ID:', result.insertId);
        res.status(201).json({
            message: 'Lead captured successfully',
            leadId: result.insertId
        });

    } catch (error) {
        console.error('❌ Error crítico en /api/leads:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
});

// Mock Token
app.post('/api/session/token', (req, res) => {
    res.json({ token: 'mock-token-12345', expiresIn: 3600 });
});

app.listen(PORT, () => {
    console.log(`🚀 Radar Fiscal Backend running on port ${PORT}`);
});
