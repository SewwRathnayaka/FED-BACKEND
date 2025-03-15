# E-Commerce Backend API

## Overview
RESTful API backend for an e-commerce platform built with Node.js, Express, and MongoDB.

## Tech Stack
- Node.js & Express.js
- TypeScript
- MongoDB with Mongoose
- Clerk Authentication
- Zod Validation

## Setup
1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret
```

3. Run the server:
```bash
npm run dev
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details