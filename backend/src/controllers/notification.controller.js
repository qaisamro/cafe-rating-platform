const pool = require('../config/db');

const sendNotification = async (req, res) => {
    try {
        const { title, message, type, media_url, target_type, target_user_id } = req.body;
        const created_by = req.user.id;

        const result = await pool.query(
            'INSERT INTO notifications (title, message, type, media_url, target_type, target_user_id, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
            [title, message, type || 'message', media_url || null, target_type || 'all', target_user_id || null, created_by]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getMyNotifications = async (req, res) => {
    try {
        const user_id = req.user.id;
        const result = await pool.query(`
            SELECT n.*, 
                CASE WHEN unr.id IS NOT NULL THEN true ELSE false END as is_read
            FROM notifications n
            LEFT JOIN user_notification_reads unr ON unr.notification_id = n.id AND unr.user_id = $1
            WHERE n.target_type = 'all' OR (n.target_type = 'individual' AND n.target_user_id = $1)
            ORDER BY n.created_at DESC
        `, [user_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        await pool.query(
            'INSERT INTO user_notification_reads (user_id, notification_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [user_id, id]
        );
        res.json({ message: 'Marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const user_id = req.user.id;
        const notifs = await pool.query(`
            SELECT n.id FROM notifications n
            WHERE n.target_type = 'all' OR (n.target_type = 'individual' AND n.target_user_id = $1)
        `, [user_id]);
        for (const n of notifs.rows) {
            await pool.query(
                'INSERT INTO user_notification_reads (user_id, notification_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [user_id, n.id]
            );
        }
        res.json({ message: 'All marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const user_id = req.user.id;
        const result = await pool.query(`
            SELECT COUNT(*) FROM notifications n
            LEFT JOIN user_notification_reads unr ON unr.notification_id = n.id AND unr.user_id = $1
            WHERE (n.target_type = 'all' OR (n.target_type = 'individual' AND n.target_user_id = $1))
            AND unr.id IS NULL
        `, [user_id]);
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAllNotifications = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT n.*, u.name as sender_name, tu.name as target_user_name
            FROM notifications n
            LEFT JOIN users u ON n.created_by = u.id
            LEFT JOIN users tu ON n.target_user_id = tu.id
            ORDER BY n.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM user_notification_reads WHERE notification_id = $1', [id]);
        await pool.query('DELETE FROM notifications WHERE id = $1', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { sendNotification, getMyNotifications, markAsRead, markAllAsRead, getUnreadCount, getAllNotifications, deleteNotification };
