# Café Rating & Loyalty Platform API Documentation

## Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and get JWT token

## Cafés
- `GET /api/cafes`: Get all cafes
- `POST /api/cafes`: Create a new cafe (Admin/Owner)
- `GET /api/cafes/:id`: Get cafe details

## Products
- `GET /api/products/cafe/:cafeId`: Get all products for a cafe
- `POST /api/products`: Add a product (Admin/Owner)

## Reviews & Moderation
- `POST /api/reviews`: Submit a review
- `GET /api/reviews/moderation`: Get reviews pending approval (Admin)
- `PUT /api/reviews/:id/moderate`: Approve or reject a review (Admin)

## Gamification & Rewards
- `GET /api/gamification/rewards`: Get spin wheel prizes
- `POST /api/gamification/spin`: Spin the lucky wheel
- `GET /api/rewards`: Get available rewards
- `POST /api/rewards/:rewardId/redeem`: Use points to redeem a reward

## QR System
- `POST /api/qr/generate`: Generate QR for a cafe (Admin/Owner)
- `POST /api/qr/scan`: Scan QR and earn points

## Analytics
- `GET /api/analytics/stats`: System-wide stats (Admin)
