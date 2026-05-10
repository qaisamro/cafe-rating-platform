const User = require('../models/user.model');
const bcrypt = require('bcrypt');

const createOwner = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role: 'owner' });

        res.status(201).json({ message: 'Owner created successfully', user: { id: user.id, name, email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createOwner };
