const pool = require('../config/db');

const getUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, role, points, level as "level" FROM users ORDER BY id DESC');
        res.json(result.rows);
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
        res.json({ message: 'User updated successfully', user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Step 1: Delete points transactions & reviews written by user
        await client.query('DELETE FROM points_transactions WHERE user_id = $1', [id]);
        await client.query('DELETE FROM reviews WHERE user_id = $1', [id]);

        // Step 2: If user is an owner, delete their cafe's dependent data
        // Find cafes owned by user
        const cafes = await client.query('SELECT id FROM cafes WHERE owner_id = $1', [id]);
        if (cafes.rows.length > 0) {
            const cafeIds = cafes.rows.map(c => c.id);
            // Delete products, qr_codes, rewards, reviews tied to those cafes
            await client.query('DELETE FROM products WHERE cafe_id = ANY($1)', [cafeIds]);
            await client.query('DELETE FROM qr_codes WHERE cafe_id = ANY($1)', [cafeIds]);
            await client.query('DELETE FROM rewards WHERE cafe_id = ANY($1)', [cafeIds]);
            await client.query('DELETE FROM reviews WHERE cafe_id = ANY($1)', [cafeIds]);
            await client.query('DELETE FROM cafes WHERE owner_id = $1', [id]);
        }

        // Step 3: Finally delete the user
        const deleteResult = await client.query('DELETE FROM users WHERE id = $1', [id]);
        if (deleteResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found' });
        }

        await client.query('COMMIT');
        res.json({ message: 'User and all related data deleted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Delete user error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

module.exports = { getUsers, updateUser, deleteUser };
