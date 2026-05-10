const pool = require('../src/config/db');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

const seedAdmin = async () => {
    try {
        const email = 'admin@cafe.com';
        const password = 'adminpassword123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            console.log('Admin user already exists');
            return;
        }

        await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
            ['System Admin', email, hashedPassword, 'admin']
        );

        console.log('Admin user created successfully');
        console.log('Email: admin@cafe.com');
        console.log('Password: adminpassword123');
    } catch (err) {
        console.error('Error seeding admin:', err);
    } finally {
        pool.end();
    }
};

seedAdmin();
