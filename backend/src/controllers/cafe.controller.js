const pool = require('../config/db');

const getAllCafes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cafes ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getCafeById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM cafes WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Cafe not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createCafe = async (req, res) => {
    try {
        const { name, description, address, image_url } = req.body;
        const owner_id = req.user.id;
        const result = await pool.query(
            'INSERT INTO cafes (name, description, address, image_url, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, address, image_url, owner_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateCafe = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, address, image_url } = req.body;

        // Only owner or admin can update
        const cafeCheck = await pool.query('SELECT owner_id FROM cafes WHERE id = $1', [id]);
        if (cafeCheck.rows.length === 0) return res.status(404).json({ message: 'Cafe not found' });

        if (req.user.role !== 'admin' && cafeCheck.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const result = await pool.query(
            'UPDATE cafes SET name = $1, description = $2, address = $3, image_url = $4 WHERE id = $5 RETURNING *',
            [name, description, address, image_url, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getMyCafe = async (req, res) => {
    try {
        const owner_id = req.user.id;
        const result = await pool.query('SELECT * FROM cafes WHERE owner_id = $1', [owner_id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'No cafe found for this owner' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllCafes, getCafeById, createCafe, updateCafe, getMyCafe };

