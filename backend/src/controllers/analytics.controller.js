const pool = require('../config/db');

const getAdminStats = async (req, res) => {
    try {
        const userCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'");
        const ownerCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'owner'");
        const cafeCount = await pool.query('SELECT COUNT(*) FROM cafes');
        const reviewCount = await pool.query('SELECT COUNT(*) FROM reviews');
        const pendingReviews = await pool.query('SELECT COUNT(*) FROM reviews WHERE approved = false');
        const totalPoints = await pool.query('SELECT SUM(points) FROM users');
        const productCount = await pool.query('SELECT COUNT(*) FROM products');
        const notifCount = await pool.query('SELECT COUNT(*) FROM notifications');

        // Top users by points
        const topUsers = await pool.query(`
            SELECT id, name, email, points, level FROM users
            WHERE role = 'user'
            ORDER BY points DESC LIMIT 5
        `);

        // Recent reviews
        const recentReviews = await pool.query(`
            SELECT r.*, u.name as user_name, c.name as cafe_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN cafes c ON r.cafe_id = c.id
            ORDER BY r.created_at DESC LIMIT 5
        `);

        // Level distribution
        const levelDist = await pool.query(`
            SELECT level, COUNT(*) as count FROM users WHERE role = 'user' GROUP BY level
        `);

        res.json({
            totalUsers: parseInt(userCount.rows[0].count),
            totalOwners: parseInt(ownerCount.rows[0].count),
            totalCafes: parseInt(cafeCount.rows[0].count),
            totalReviews: parseInt(reviewCount.rows[0].count),
            pendingModeration: parseInt(pendingReviews.rows[0].count),
            totalPoints: parseInt(totalPoints.rows[0].sum || 0),
            totalProducts: parseInt(productCount.rows[0].count),
            totalNotifications: parseInt(notifCount.rows[0].count),
            topUsers: topUsers.rows,
            recentReviews: recentReviews.rows,
            levelDistribution: levelDist.rows,
        });
    } catch (err) {
        console.error('Analytics Error:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAdminStats };
