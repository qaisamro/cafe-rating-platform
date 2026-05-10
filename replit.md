# Café Management Platform

## Overview

A full-stack café management platform with:
- **admin-web**: React + Vite admin dashboard (port 5000) — manage users, cafes, products, reviews, and analytics
- **backend**: Node.js/Express REST API (port 3000) — handles auth, cafes, products, reviews, gamification, rewards, QR codes, analytics
- **database**: PostgreSQL (Replit managed) — initialized from `database/init.sql`
- **mobile_app**: Flutter mobile app (iOS/Android) — for end users

## Architecture

- Frontend calls backend at `http://localhost:3000/api`
- Backend uses Replit PostgreSQL via `DATABASE_URL` environment variable
- JWT-based authentication
- File uploads stored in `backend/src/uploads/`

## Running the Project

Two workflows run simultaneously:
1. **Start application** — Vite dev server on port 5000 (`cd admin-web && npm run dev`)
2. **Backend API** — Express server on port 3000 (`PORT=3000 node backend/server.js`)

## User Preferences

- Keep frontend on port 5000 (webview)
- Keep backend on port 3000 (console)
- Use Replit PostgreSQL (`DATABASE_URL`) for database connections
