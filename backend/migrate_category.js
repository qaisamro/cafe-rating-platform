const pool = require('./src/config/db');

async function run() {
    try {
        console.log("Adding category column to products table...");
        await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT \'عام\';');
        console.log("Migration complete.");
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
run();
