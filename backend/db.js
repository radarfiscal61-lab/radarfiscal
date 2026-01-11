const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: (process.env.DB_SSL === 'true') ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    } : undefined,
    connectTimeout: 10000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

const pool = mysql.createPool(dbConfig);

// Test connection on startup
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to TiDB database successfully!');
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
})();

module.exports = pool;
