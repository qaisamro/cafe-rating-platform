const pool = require('../config/db');

const getSpinWheelRewards = async (req, res) => {
    try {
        const { cafe_id } = req.query;
        let query = 'SELECT * FROM spin_wheel_rewards WHERE active = true';
        let params = [];
        if (cafe_id) {
            query += ' AND cafe_id = $1';
            params.push(cafe_id);
        }
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getOwnerSpinWheelRewards = async (req, res) => {
    try {
        const cafeRes = await pool.query('SELECT id FROM cafes WHERE owner_id = $1', [req.user.id]);
        if (cafeRes.rows.length === 0) return res.status(404).json({ message: 'Cafe not found' });

        const result = await pool.query('SELECT * FROM spin_wheel_rewards WHERE cafe_id = $1', [cafeRes.rows[0].id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createSpinWheelReward = async (req, res) => {
    try {
        const { reward_type, value, probability, image_url, active } = req.body;
        const cafeRes = await pool.query('SELECT id FROM cafes WHERE owner_id = $1', [req.user.id]);
        if (cafeRes.rows.length === 0) return res.status(404).json({ message: 'Cafe not found' });

        const result = await pool.query(
            'INSERT INTO spin_wheel_rewards (cafe_id, reward_type, value, probability, image_url, active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [cafeRes.rows[0].id, reward_type, value, probability || 10.0, image_url, active !== false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteSpinWheelReward = async (req, res) => {
    try {
        const { id } = req.params;
        const cafeRes = await pool.query('SELECT id FROM cafes WHERE owner_id = $1', [req.user.id]);
        if (cafeRes.rows.length === 0) return res.status(404).json({ message: 'Cafe not found' });

        await pool.query('DELETE FROM spin_wheel_rewards WHERE id = $1 AND cafe_id = $2', [id, cafeRes.rows[0].id]);
        res.json({ message: 'Reward deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const spinWheel = async (req, res) => {
    try {
        const user_id = req.user.id;

        // Check 24-hour limit
        const userRes = await pool.query('SELECT last_spin_time FROM users WHERE id = $1', [user_id]);
        const lastSpin = userRes.rows[0].last_spin_time;
        if (lastSpin) {
            const msSinceLast = Date.now() - new Date(lastSpin).getTime();
            const hoursSinceLast = msSinceLast / (1000 * 60 * 60);
            if (hoursSinceLast < 24) {
                return res.status(403).json({
                    message: 'لقد قمت بلف العجلة مسبقاً، يرجى الانتظار.',
                    hoursRemaining: 24 - hoursSinceLast
                });
            }
        }

        // Fetch all active rewards across all cafes
        // We join with cafes to get the cafe name for non-point rewards
        const query = `
            SELECT r.*, c.name as cafe_name 
            FROM spin_wheel_rewards r 
            LEFT JOIN cafes c ON r.cafe_id = c.id 
            WHERE r.active = true
        `;
        const rewardsResult = await pool.query(query);
        const rewards = rewardsResult.rows;

        if (rewards.length === 0) return res.status(404).json({ message: 'No rewards available' });

        // Calculate weighted probability
        const totalWeight = rewards.reduce((sum, r) => sum + parseFloat(r.probability), 0);
        let randomNum = Math.random() * totalWeight;

        let prize = rewards[0];
        for (const reward of rewards) {
            if (randomNum < parseFloat(reward.probability)) {
                prize = reward;
                break;
            }
            randomNum -= parseFloat(reward.probability);
        }

        // Apply reward
        if (prize.reward_type === 'points') {
            const points = parseInt(prize.value) || 0;
            // ensure valid number
            if (points > 0) {
                await pool.query('UPDATE users SET points = points + $1 WHERE id = $2', [points, user_id]);
                await pool.query('INSERT INTO points_transactions (user_id, points_change, reason) VALUES ($1, $2, $3)', [user_id, points, 'spin_wheel']);
            }
        } else {
            // Save to user wallet
            await pool.query('INSERT INTO user_rewards_wallet (user_id, reward_id) VALUES ($1, $2)', [user_id, prize.id]);
        }

        // Update last spin time
        await pool.query('UPDATE users SET last_spin_time = NOW() WHERE id = $1', [user_id]);

        res.json({ message: 'You won!', prize });
    } catch (err) {
        console.error("Spin error:", err);
        res.status(500).json({ error: err.message });
    }
};

const getSpinStatus = async (req, res) => {
    try {
        const userRes = await pool.query('SELECT last_spin_time FROM users WHERE id = $1', [req.user.id]);
        const lastSpin = userRes.rows[0].last_spin_time;
        if (!lastSpin) return res.json({ canSpin: true, hoursRemaining: 0 });
        const msSinceLast = Date.now() - new Date(lastSpin).getTime();
        const hoursSinceLast = msSinceLast / (1000 * 60 * 60);
        if (hoursSinceLast < 24) {
            return res.json({ canSpin: false, hoursRemaining: 24 - hoursSinceLast });
        }
        res.json({ canSpin: true, hoursRemaining: 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getMyWallet = async (req, res) => {
    try {
        const query = `
            SELECT w.id as wallet_id, w.is_used, w.created_at, r.*, c.name as cafe_name 
            FROM user_rewards_wallet w
            JOIN spin_wheel_rewards r ON w.reward_id = r.id
            LEFT JOIN cafes c ON r.cafe_id = c.id
            WHERE w.user_id = $1
            ORDER BY w.created_at DESC
        `;
        const result = await pool.query(query, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getSpinWheelRewards,
    getOwnerSpinWheelRewards,
    createSpinWheelReward,
    deleteSpinWheelReward,
    spinWheel,
    getSpinStatus,
    getMyWallet
};
