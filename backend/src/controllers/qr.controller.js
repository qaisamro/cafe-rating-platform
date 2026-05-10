const pool = require('../config/db');

const generateQRCode = async (req, res) => {
    try {
        const { cafe_id } = req.body;
        const qr_data = `cafe_${cafe_id}_${Date.now()}`;
        const result = await pool.query(
            'INSERT INTO qr_codes (cafe_id, qr_data) VALUES ($1, $2) RETURNING *',
            [cafe_id, qr_data]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const scanQRCode = async (req, res) => {
    try {
        const { qr_data } = req.body;
        const user_id = req.user.id;

        const qrResult = await pool.query('SELECT * FROM qr_codes WHERE qr_data = $1', [qr_data]);
        if (qrResult.rows.length === 0) return res.status(404).json({ message: 'Invalid QR code' });

        const cafe_id = qrResult.rows[0].cafe_id;

        // Give bonus points for scanning
        await pool.query('UPDATE users SET points = points + 5 WHERE id = $1', [user_id]);
        await pool.query('INSERT INTO points_transactions (user_id, points_change, reason) VALUES ($1, $2, $3)', [user_id, 5, `scan_qr_${cafe_id}`]);

        res.json({ message: 'QR Scanned successfully', cafe_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { generateQRCode, scanQRCode };
