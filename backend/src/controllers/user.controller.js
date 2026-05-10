const pool = require('../config/db');

const getUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, email, role, points, level, phone, city, bio, avatar_url, profile_completed, created_at
            FROM users ORDER BY id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, email, role, points, level, phone, city, bio, avatar_url, profile_completed, created_at
            FROM users WHERE id = $1
        `, [req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const { name, phone, city, bio, avatar_url } = req.body;
        const userId = req.user.id;

        // Check current profile state
        const current = await pool.query('SELECT profile_completed, name, phone, city, bio FROM users WHERE id = $1', [userId]);
        const user = current.rows[0];

        const result = await pool.query(
            `UPDATE users SET 
                name = COALESCE($1, name),
                phone = COALESCE($2, phone),
                city = COALESCE($3, city),
                bio = COALESCE($4, bio),
                avatar_url = COALESCE($5, avatar_url)
            WHERE id = $6 RETURNING id, name, email, role, points, level, phone, city, bio, avatar_url, profile_completed`,
            [name, phone, city, bio, avatar_url, userId]
        );

        const updated = result.rows[0];

        // Check if profile is now complete and award points if first time
        const isComplete = updated.name && updated.phone && updated.city && updated.bio;
        if (isComplete && !user.profile_completed) {
            // Get reward points from settings
            const settingRes = await pool.query("SELECT value FROM app_settings WHERE key = 'profile_completion_points'");
            const pts = parseInt(settingRes.rows[0]?.value || '50');

            await pool.query('UPDATE users SET profile_completed = true, points = points + $1 WHERE id = $2', [pts, userId]);
            await pool.query('INSERT INTO points_transactions (user_id, points_change, reason) VALUES ($1, $2, $3)', [userId, pts, 'profile_completion']);

            return res.json({ ...updated, profile_completed: true, points_awarded: pts, message: `🎉 تم اكتمال ملفك الشخصي! حصلت على ${pts} نقطة!` });
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, points, level } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2, role = $3, points = $4, level = $5 WHERE id = $6 RETURNING id, name, email, role, points, level',
            [name, email, role, points, level, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ message: 'User not found' });

        // Auto-update level based on points
        await _updateUserLevel(id, points);

        res.json({ message: 'User updated successfully', user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deductPoints = async (req, res) => {
    try {
        const { id } = req.params;
        const { points, reason } = req.body;
        const pointsNum = parseInt(points);
        if (isNaN(pointsNum) || pointsNum <= 0) return res.status(400).json({ message: 'Invalid points amount' });

        const userRes = await pool.query('SELECT points FROM users WHERE id = $1', [id]);
        if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found' });

        const currentPoints = userRes.rows[0].points;
        const newPoints = Math.max(0, currentPoints - pointsNum);

        await pool.query('UPDATE users SET points = $1 WHERE id = $2', [newPoints, id]);
        await pool.query(
            'INSERT INTO points_transactions (user_id, points_change, reason) VALUES ($1, $2, $3)',
            [id, -pointsNum, reason || 'admin_deduction']
        );

        // Update level
        await _updateUserLevel(id, newPoints);

        res.json({ message: 'Points deducted', new_points: newPoints, deducted: pointsNum });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addPoints = async (req, res) => {
    try {
        const { id } = req.params;
        const { points, reason } = req.body;
        const pointsNum = parseInt(points);
        if (isNaN(pointsNum) || pointsNum <= 0) return res.status(400).json({ message: 'Invalid points amount' });

        const result = await pool.query('UPDATE users SET points = points + $1 WHERE id = $2 RETURNING points', [pointsNum, id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'User not found' });

        await pool.query(
            'INSERT INTO points_transactions (user_id, points_change, reason) VALUES ($1, $2, $3)',
            [id, pointsNum, reason || 'admin_grant']
        );

        const newPoints = result.rows[0].points;
        await _updateUserLevel(id, newPoints);

        res.json({ message: 'Points added', new_points: newPoints });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateUserLevel = async (req, res) => {
    try {
        const { id } = req.params;
        const { level } = req.body;
        await pool.query('UPDATE users SET level = $1 WHERE id = $2', [level, id]);
        res.json({ message: 'Level updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const syncAllLevels = async (req, res) => {
    try {
        const users = await pool.query('SELECT id, points FROM users');
        for (const u of users.rows) {
            await _updateUserLevel(u.id, u.points);
        }
        res.json({ message: 'All user levels synced' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

async function _updateUserLevel(userId, points) {
    const settings = await pool.query('SELECT key, value FROM app_settings WHERE key LIKE $1', ['level_%_min']);
    const thresholds = {};
    settings.rows.forEach(r => { thresholds[r.key] = parseInt(r.value || '0'); });

    let level = 'برونزي';
    if (points >= (thresholds['level_diamond_min'] || 2500)) level = 'ألماسي';
    else if (points >= (thresholds['level_platinum_min'] || 1000)) level = 'بلاتيني';
    else if (points >= (thresholds['level_gold_min'] || 500)) level = 'ذهبي';
    else if (points >= (thresholds['level_silver_min'] || 100)) level = 'فضي';

    await pool.query('UPDATE users SET level = $1 WHERE id = $2', [level, userId]);
    return level;
}

const deleteUser = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM points_transactions WHERE user_id = $1', [id]);
        await client.query('DELETE FROM user_notification_reads WHERE user_id = $1', [id]);
        await client.query('DELETE FROM user_rewards_wallet WHERE user_id = $1', [id]);
        await client.query('DELETE FROM reviews WHERE user_id = $1', [id]);
        const cafes = await client.query('SELECT id FROM cafes WHERE owner_id = $1', [id]);
        if (cafes.rows.length > 0) {
            const cafeIds = cafes.rows.map(c => c.id);
            await client.query('DELETE FROM products WHERE cafe_id = ANY($1)', [cafeIds]);
            await client.query('DELETE FROM qr_codes WHERE cafe_id = ANY($1)', [cafeIds]);
            await client.query('DELETE FROM rewards WHERE cafe_id = ANY($1)', [cafeIds]);
            await client.query('DELETE FROM spin_wheel_rewards WHERE cafe_id = ANY($1)', [cafeIds]);
            await client.query('DELETE FROM reviews WHERE cafe_id = ANY($1)', [cafeIds]);
            await client.query('DELETE FROM cafes WHERE owner_id = $1', [id]);
        }
        const deleteResult = await client.query('DELETE FROM users WHERE id = $1', [id]);
        if (deleteResult.rowCount === 0) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'User not found' }); }
        await client.query('COMMIT');
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

const getMyPoints = async (req, res) => {
    try {
        const result = await pool.query('SELECT points, level FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ points: result.rows[0].points, level: result.rows[0].level });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getPointsHistory = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM points_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getUsers, getMyProfile, updateMyProfile, updateUser, deductPoints, addPoints, updateUserLevel, syncAllLevels, deleteUser, getMyPoints, getPointsHistory };
