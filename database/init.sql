-- Users with roles and gamification stats
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password TEXT,
    role VARCHAR(20) DEFAULT 'user', -- user, owner, admin
    points INT DEFAULT 0,
    level VARCHAR(20) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cafés
CREATE TABLE cafes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    owner_id INT REFERENCES users(id),
    address TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products within cafés
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    cafe_id INT REFERENCES cafes(id),
    name VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2), -- Optional price
    show_price BOOLEAN DEFAULT true,
    points_reward INT DEFAULT 10, -- Owner defined points
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews and Ratings
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    cafe_id INT REFERENCES cafes(id),
    product_id INT REFERENCES products(id), -- Optional: Rate specific product
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Points Transaction History
CREATE TABLE points_transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    points_change INT,
    reason VARCHAR(255), -- review, purchase, spin_wheel, scan_qr
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Available Rewards
CREATE TABLE rewards (
    id SERIAL PRIMARY KEY,
    cafe_id INT REFERENCES cafes(id), -- If specific to a cafe
    title VARCHAR(255),
    description TEXT,
    points_cost INT,
    image_url TEXT,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ads Banners for Homepage
CREATE TABLE ads_banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    image_url TEXT,
    link_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spin Wheel Prizes
CREATE TABLE spin_wheel_rewards (
    id SERIAL PRIMARY KEY,
    cafe_id INT REFERENCES cafes(id),
    reward_type VARCHAR(50), -- points, coupon, item
    value VARCHAR(255),
    probability DECIMAL(5, 2), -- 0.0 to 100.0
    image_url TEXT,
    active BOOLEAN DEFAULT true
);

-- QR Codes for Cafés
CREATE TABLE qr_codes (
    id SERIAL PRIMARY KEY,
    cafe_id INT REFERENCES cafes(id),
    qr_data TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
