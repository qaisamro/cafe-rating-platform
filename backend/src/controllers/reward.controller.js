const pool = require('../config/db');

const getRewards = async (req, res) => {
    try {
        const { cafeId } = req.query;
        let query = 'SELECT * FROM rewards';
        let params = [];
        if (cafeId) {
            query += ' WHERE cafe_id = $1';
            params.push(cafeId);
        }
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createReward = async (req, res) => {
    try {
        const { cafe_id, title, description, points_cost, expiry_date, image_url } = req.body;
        const result = await pool.query(
            'INSERT INTO rewards (cafe_id, title, description, points_cost, expiry_date, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [cafe_id, title, description, points_cost, expiry_date, image_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const redeemReward = async (req, res) => {
    try {
        const { rewardId } = req.params;
        const user_id = req.user.id;

        const rewardResult = await pool.query('SELECT * FROM rewards WHERE id = $1', [rewardId]);
        if (rewardResult.rows.length === 0) return res.status(404).json({ message: 'Reward not found' });
        const reward = rewardResult.rows[0];

        const userResult = await pool.query('SELECT points FROM users WHERE id = $1', [user_id]);
        const userPoints = userResult.rows[0].points;

        if (userPoints < reward.points_cost) {
            return res.status(400).json({ message: 'Insufficient points' });
        }

        await pool.query('UPDATE users SET points = points - $1 WHERE id = $2', [reward.points_cost, user_id]);
        await pool.query('INSERT INTO points_transactions (user_id, points_change, reason) VALUES ($1, $2, $3)', [user_id, -reward.points_cost, `redeem_${reward.title}`]);

        res.json({ message: 'Reward redeemed successfully', reward });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getRewards, createReward, redeemReward };
