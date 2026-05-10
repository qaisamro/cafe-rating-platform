const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

const initDb = async () => {
    try {
        const sqlPath = path.join(__dirname, '../../database/init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Initializing database...');
        await pool.query(sql);
        console.log('Database initialized successfully with all tables.');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        pool.end();
    }
};

initDb();
