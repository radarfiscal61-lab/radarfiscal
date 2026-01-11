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
app.use(cors({
    origin: '*' // Permisivo para asegurar conexión desde Hostinger
}));
app.use(express.json());

// Health Check
app.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        res.json({ status: 'ok', db: 'connected' });
    } catch (error) {
        console.error('DB Error:', error);
        res.status(503).json({ status: 'error', message: error.message });
    }
});

// Endpoint: Capture Lead (FIX DEFINTIVO PARA UNDEFINED)
app.post('/api/leads', async (req, res) => {
    console.log('📥 Recibiendo Lead:', req.body);

    // 1. Extracción con valores por defecto OBLIGATORIOS
    // Si viene undefined, se convierte en null o string válido
    const email = req.body.email;
    const full_name = req.body.full_name || 'Anonymous';
    const phone = req.body.phone || null;
    const business_sector = req.body.business_sector || null;
    const risk_score_captured = req.body.risk_score_captured || 0;

    // 2. Validación
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // 3. Ejecución segura
        const [result] = await pool.execute(
            'INSERT INTO leads (email, full_name, phone, business_sector, risk_score_captured) VALUES (?, ?, ?, ?, ?)',
            [email, full_name, phone, business_sector, risk_score_captured]
        );

        console.log('✅ Lead guardado ID:', result.insertId);
        res.status(201).json({ message: 'Saved', leadId: result.insertId });

    } catch (error) {
        console.error('❌ Error saving lead:', error);
        // Devolvemos 500 pero con info JSON válida
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// Endpoint Token (Mock)
app.post('/api/session/token', (req, res) => {
    res.json({ token: 'mock-token', expiresIn: 3600 });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
