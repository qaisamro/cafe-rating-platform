const pool = require('../config/db');

const getAllProducts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getProductsByCafe = async (req, res) => {
    try {
        const { cafeId } = req.params;
        const result = await pool.query('SELECT * FROM products WHERE cafe_id = $1', [cafeId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const { cafe_id, name, description, price, image_url, show_price, points_reward, category } = req.body;

        // Check ownership
        const cafeCheck = await pool.query('SELECT owner_id FROM cafes WHERE id = $1', [cafe_id]);
        if (cafeCheck.rows.length === 0) return res.status(404).json({ message: 'Cafe not found' });
        if (cafeCheck.rows[0].owner_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const result = await pool.query(
            'INSERT INTO products (cafe_id, name, description, price, image_url, show_price, points_reward, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [cafe_id, name, description, price || 0, image_url, show_price !== false, points_reward || 10, category || 'عام']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, image_url, show_price, points_reward, category } = req.body;

        const result = await pool.query(
            'UPDATE products SET name = $1, description = $2, price = $3, image_url = $4, show_price = $5, points_reward = $6, category = $7 WHERE id = $8 RETURNING *',
            [name, description, price, image_url, show_price, points_reward, category || 'عام', id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    getProductsByCafe,
    createProduct,
    updateProduct,
    deleteProduct,
    addProduct: createProduct // Alias for backward compatibility if needed
};
