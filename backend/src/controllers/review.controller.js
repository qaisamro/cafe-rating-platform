const pool = require('../config/db');

const createReview = async (req, res) => {
    try {
        const { cafe_id, product_id, rating, comment } = req.body;
        const user_id = req.user.id;

        const result = await pool.query(
            'INSERT INTO reviews (user_id, cafe_id, product_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, cafe_id, product_id || null, rating, comment]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getReviewsForModeration = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, u.name as user_name, c.name as cafe_name, p.name as product_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN cafes c ON r.cafe_id = c.id
            LEFT JOIN products p ON r.product_id = p.id
            WHERE r.approved = false
            ORDER BY r.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const moderateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { approved } = req.body;

        const checkRes = await pool.query('SELECT approved, user_id, product_id FROM reviews WHERE id = $1', [id]);
        if (checkRes.rows.length === 0) return res.status(404).json({ message: 'Review not found' });

        const review = checkRes.rows[0];
        const result = await pool.query('UPDATE reviews SET approved = $1 WHERE id = $2 RETURNING *', [approved, id]);

        if (approved === true && review.approved === false) {
            let pointsToAward = 10;
            if (review.product_id) {
                const prodRes = await pool.query('SELECT points_reward FROM products WHERE id = $1', [review.product_id]);
                if (prodRes.rows.length > 0 && prodRes.rows[0].points_reward != null) {
                    pointsToAward = prodRes.rows[0].points_reward;
                }
            } else {
                const settingRes = await pool.query("SELECT value FROM app_settings WHERE key = 'review_points'");
                if (settingRes.rows.length > 0) pointsToAward = parseInt(settingRes.rows[0].value) || 10;
            }
            await pool.query('UPDATE users SET points = points + $1 WHERE id = $2', [pointsToAward, review.user_id]);
            await pool.query('INSERT INTO points_transactions (user_id, points_change, reason) VALUES ($1, $2, $3)', [review.user_id, pointsToAward, 'review_approval']);

            // Update user level after points change
            const userPoints = await pool.query('SELECT points FROM users WHERE id = $1', [review.user_id]);
            if (userPoints.rows.length > 0) {
                const settings = await pool.query("SELECT key, value FROM app_settings WHERE key LIKE 'level_%_min'");
                const thresholds = {};
                settings.rows.forEach(r => { thresholds[r.key] = parseInt(r.value || '0'); });
                const pts = userPoints.rows[0].points;
                let level = 'برونزي';
                if (pts >= (thresholds['level_diamond_min'] || 2500)) level = 'ألماسي';
                else if (pts >= (thresholds['level_platinum_min'] || 1000)) level = 'بلاتيني';
                else if (pts >= (thresholds['level_gold_min'] || 500)) level = 'ذهبي';
                else if (pts >= (thresholds['level_silver_min'] || 100)) level = 'فضي';
                await pool.query('UPDATE users SET level = $1 WHERE id = $2', [level, review.user_id]);
            }

            // Update cafe average rating
            await pool.query(`
                UPDATE cafes SET 
                    average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE cafe_id = $1 AND approved = true),
                    review_count = (SELECT COUNT(*) FROM reviews WHERE cafe_id = $1 AND approved = true)
                WHERE id = $1
            `, [checkRes.rows[0].cafe_id ?? result.rows[0].cafe_id]);
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getReviewsByCafe = async (req, res) => {
    try {
        const { cafeId } = req.params;
        const result = await pool.query(`
            SELECT r.*, u.name as user_name, u.level as user_level, p.name as product_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            LEFT JOIN products p ON r.product_id = p.id
            WHERE r.cafe_id = $1 AND r.approved = true
            ORDER BY r.created_at DESC
        `, [cafeId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createReview, getReviewsForModeration, moderateReview, getReviewsByCafe };
