const pool = require('./src/config/db');

async function migrateGamification() {
    try {
        console.log("Starting Gamification Phase 7 Migration...");

        try {
            await pool.query('ALTER TABLE users ADD COLUMN last_spin_time TIMESTAMP;');
            console.log("Success: Added last_spin_time to users.");
        } catch (e) {
            console.log("Note: " + e.message);
        }

        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS user_rewards_wallet (
                    id SERIAL PRIMARY KEY,
                    user_id INT REFERENCES users(id),
                    reward_id INT REFERENCES spin_wheel_rewards(id),
                    is_used BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log("Success: Created user_rewards_wallet.");
        } catch (e) {
            console.log("Note: " + e.message);
        }

        console.log("Migration finished.");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

migrateGamification();
