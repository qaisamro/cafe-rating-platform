const pool = require('../config/db');

const createReview = async (req, res) => {
    try {
        const { cafe_id, product_id, rating, comment } = req.body;
        const user_id = req.user.id;

        const result = await pool.query(
            'INSERT INTO reviews (user_id, cafe_id, product_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, cafe_id, product_id, rating, comment]
        );

        // Points will be awarded only after admin approval in moderateReview()

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getReviewsForModeration = async (req, res) => {
    try {
        const result = await pool.query('SELECT r.*, u.name as user_name, c.name as cafe_name FROM reviews r JOIN users u ON r.user_id = u.id JOIN cafes c ON r.cafe_id = c.id WHERE r.approved = false');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const moderateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { approved } = req.body;

        // Check if it's already approved to prevent double-awarding points
        const checkRes = await pool.query('SELECT approved, user_id, product_id FROM reviews WHERE id = $1', [id]);
        if (checkRes.rows.length === 0) return res.status(404).json({ message: 'Review not found' });

        const review = checkRes.rows[0];

        const result = await pool.query('UPDATE reviews SET approved = $1 WHERE id = $2 RETURNING *', [approved, id]);

        // Award points if shifting from false to true
        if (approved === true && review.approved === false) {
            let pointsToAward = 10;
            if (review.product_id) {
                const prodRes = await pool.query('SELECT points_reward FROM products WHERE id = $1', [review.product_id]);
                if (prodRes.rows.length > 0 && prodRes.rows[0].points_reward != null) {
                    pointsToAward = prodRes.rows[0].points_reward;
                }
            }
            await pool.query('UPDATE users SET points = points + $1 WHERE id = $2', [pointsToAward, review.user_id]);
            await pool.query('INSERT INTO points_transactions (user_id, points_change, reason) VALUES ($1, $2, $3)', [review.user_id, pointsToAward, 'review_approval']);
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getReviewsByCafe = async (req, res) => {
    try {
        const { cafeId } = req.params;
        const result = await pool.query(
            'SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.cafe_id = $1 AND r.approved = true ORDER BY r.created_at DESC',
            [cafeId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createReview, getReviewsForModeration, moderateReview, getReviewsByCafe };

