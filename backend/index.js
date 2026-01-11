const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const pool = require('./db');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*' // En producción, Render inyectará el dominio correcto
}));
app.use(express.json());

// 1. Health Check & DB Verify (Critical for Render Deployment Success)
app.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        res.json({
            status: 'ok',
            service: 'Radar Fiscal API',
            environment: process.env.NODE_ENV,
            db_connection: 'connected'
        });
    } catch (error) {
        console.error('Database Health Check Failed:', error.message);
        res.status(503).json({
            status: 'error',
            message: 'Database connection failed',
            environment: process.env.NODE_ENV
        });
    }
});

// 2. Leads Capture Route
app.post('/api/leads', async (req, res) => {
    const { email, full_name, phone, business_sector, risk_score_captured } = req.body;

    if (!email || !full_name) {
        return res.status(400).json({ error: 'Email and Full Name are required' });
    }

    try {
        const [result] = await pool.execute(
            `INSERT INTO leads (email, full_name, phone, business_sector, risk_score_captured) 
             VALUES (?, ?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
             full_name = VALUES(full_name), 
             risk_score_captured = VALUES(risk_score_captured),
             updated_at = NOW()`,
            [email, full_name, phone, business_sector, risk_score_captured]
        );

        // Audit Log (Non-blocking)
        pool.execute(
            `INSERT INTO system_audit (event_type, risk_level_detected, meta_json) VALUES (?, ?, ?)`,
            ['LEAD_CAPTURED', risk_score_captured > 80 ? 'CRITICO' : 'MEDIO', JSON.stringify({ email, score: risk_score_captured })]
        ).catch(err => console.error('Audit Log Error:', err));

        res.status(201).json({ message: 'Lead captured successfully', leadId: result.insertId });
    } catch (error) {
        console.error('Error saving lead:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. Session Token (Gatekeeper)
app.post('/api/session/token', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    // En producción, JWT_SECRET viene de Render Environment
    const token = jwt.sign({ email, scope: 'read:report' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// 4. Blacklist Metadata (Public)
app.get('/api/blacklists/metadata', (req, res) => {
    res.json({
        last_updated: new Date().toISOString(),
        total_records: 12500,
        source: 'SAT 69-B'
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Radar Fiscal Backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Database Host: ${process.env.DB_HOST}`);
});
