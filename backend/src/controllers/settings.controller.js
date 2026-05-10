const pool = require('../config/db');

const getSettings = async (req, res) => {
    try {
        const result = await pool.query('SELECT key, value FROM app_settings');
        const settings = {};
        result.rows.forEach(row => { settings[row.key] = row.value; });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        await pool.query(
            'INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
            [key, value]
        );
        res.json({ message: 'Setting updated', key, value });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateMultipleSettings = async (req, res) => {
    try {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            await pool.query(
                'INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
                [key, String(value)]
            );
        }
        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getSettings, updateSetting, updateMultipleSettings };
