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
    origin: '*' // Permisivo temporalmente para asegurar conexión
}));
app.use(express.json());

// Health Check & DB Test
app.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        res.json({
            status: 'ok',
            service: 'Radar Fiscal API',
            environment: process.env.NODE_ENV || 'development',
            db_connection: 'connected'
        });
    } catch (error) {
        console.error('Health Check Failed:', error);
        res.status(503).json({
            status: 'error',
            message: 'Database connection failed',
            environment: process.env.NODE_ENV || 'development'
        });
    }
});

// Endpoint: Capture Lead (Robustecido para evitar undefined)
app.post('/api/leads', async (req, res) => {
    // Extracción segura con fallbacks
    const email = req.body.email;
    const full_name = req.body.full_name || 'Anonymous Lead';
    const phone = req.body.phone || null;
    const business_sector = req.body.business_sector || null;
    const risk_score_captured = req.body.risk_score_captured || 0;

    // Validación mínima
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO leads (email, full_name, phone, business_sector, risk_score_captured) VALUES (?, ?, ?, ?, ?)',
            [email, full_name, phone, business_sector, risk_score_captured]
        );

        console.log('✅ Lead saved ID:', result.insertId);
        res.status(201).json({
            message: 'Lead captured successfully',
            leadId: result.insertId
        });
    } catch (error) {
        console.error('❌ Error saving lead:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// Endpoint: Generate Session Token
app.post('/api/session/token', (req, res) => {
    const { leadId, email } = req.body;

    if (!leadId || !email) {
        return res.status(400).json({ error: 'Missing lead data' });
    }

    const token = jwt.sign(
        { leadId, email, role: 'visitor' },
        process.env.JWT_SECRET || 'dev_secret_key',
        { expiresIn: '1h' }
    );

    res.json({ token, expiresIn: 3600 });
});

// Endpoint: Blacklists Metadata (Mock)
app.get('/api/blacklists/metadata', (req, res) => {
    res.json({
        last_update: new Date().toISOString(),
        total_efos: 12450,
        sources: ['SAT 69', 'SAT 69-B']
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Radar Fiscal Backend running on port ${PORT}`);
});
