const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/cafes', require('./routes/cafe.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/gamification', require('./routes/gamification.routes'));
app.use('/api/rewards', require('./routes/reward.routes'));
app.use('/api/qr', require('./routes/qr.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

module.exports = app;
