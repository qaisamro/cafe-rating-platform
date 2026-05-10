const pool = require('../config/db');

const getAdminStats = async (req, res) => {
    try {
        const userCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['user']);
        const cafeCount = await pool.query('SELECT COUNT(*) FROM cafes');
        const reviewCount = await pool.query('SELECT COUNT(*) FROM reviews');
        const pendingReviews = await pool.query('SELECT COUNT(*) FROM reviews WHERE approved = false');

        res.json({
            totalUsers: parseInt(userCount.rows[0].count),
            totalCafes: parseInt(cafeCount.rows[0].count),
            totalReviews: parseInt(reviewCount.rows[0].count),
            pendingModeration: parseInt(pendingReviews.rows[0].count)
        });
    } catch (err) {
        console.error('Analytics Error:', err);
        res.status(500).json({
            error: 'Database connection failed or tables missing. Have you run database/init.sql?',
            details: err.message
        });
    }

};

module.exports = { getAdminStats };
