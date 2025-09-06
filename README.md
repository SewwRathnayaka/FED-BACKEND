# E-Commerce Backend API

## Overview
A robust, scalable RESTful API backend for an e-commerce platform built with Node.js, Express, TypeScript, and MongoDB. Features comprehensive product management, order processing, payment integration, and secure authentication.

## 🚀 Key Features

### 🛍️ Core E-Commerce Features
- **Product Management** - CRUD operations with image handling
- **Category Management** - Organize products with hierarchical categories
- **Order Processing** - Complete order lifecycle management
- **User Authentication** - Secure authentication with Clerk integration
- **Payment Integration** - Stripe payment processing with webhooks
- **Image Storage** - Vercel Blob integration for optimized image handling

### 🔒 Security & Authentication
- **Clerk Integration** - JWT-based authentication and authorization
- **Role-Based Access** - Admin and user permission levels
- **Request Validation** - Zod schema validation for all endpoints
- **Error Handling** - Comprehensive error handling middleware
- **CORS Configuration** - Secure cross-origin resource sharing

### 📊 Advanced Features
- **Database Indexing** - Optimized MongoDB queries with proper indexing
- **Image Optimization** - Automatic image resizing and format optimization
- **Webhook Processing** - Real-time payment status updates
- **Data Migration** - Scripts for database setup and data migration
- **API Documentation** - Comprehensive endpoint documentation

## 🛠️ Tech Stack

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Type-safe development
- **MongoDB** - NoSQL database with Mongoose ODM

### Authentication & Security
- **Clerk** - Authentication and user management
- **JWT** - JSON Web Token handling
- **Zod** - Runtime type validation
- **CORS** - Cross-origin resource sharing

### Payment & Storage
- **Stripe** - Payment processing and webhooks
- **Vercel Blob** - Image storage and optimization
- **Multer** - File upload handling

### Development Tools
- **Nodemon** - Development server with auto-restart
- **Mongoose** - MongoDB object modeling
- **Express Middleware** - Custom middleware for authentication and error handling

## 📁 Project Structure

```
src/
├── api/                    # API route handlers
│   ├── middleware/         # Custom middleware
│   │   ├── authentication-middleware.ts
│   │   ├── authorization-middleware.ts
│   │   └── global-error-handling-middleware.ts
│   ├── product.ts         # Product endpoints
│   ├── category.ts        # Category endpoints
│   ├── order.ts           # Order endpoints
│   ├── payment.ts         # Payment processing
│   ├── address.ts         # Address management
│   └── upload.ts          # File upload handling
├── application/            # Business logic layer
│   ├── product.ts         # Product business logic
│   ├── category.ts        # Category business logic
│   ├── order.ts           # Order processing logic
│   ├── payment.ts         # Payment processing logic
│   └── address.ts         # Address management logic
├── domain/                 # Domain models and DTOs
│   ├── dto/               # Data Transfer Objects
│   └── errors/            # Custom error classes
├── infrastructure/         # External service integrations
│   ├── db.ts              # Database connection
│   ├── schemas/           # MongoDB schemas
│   ├── stripe.ts          # Stripe configuration
│   └── vercel-blob.ts     # Vercel Blob integration
├── scripts/               # Database and migration scripts
│   ├── seed-products.ts   # Product seeding
│   ├── migrate-images.ts  # Image migration
│   └── clean-db.ts        # Database cleanup
└── index.ts               # Application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Clerk account for authentication
- Stripe account for payments
- Vercel account for blob storage

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd FED-BACKEND
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication
CLERK_SECRET_KEY=your_clerk_secret_key

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Image Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

4. **Set up the database**
```bash
# Run database setup scripts
npm run setup:db
```

5. **Start the development server**
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📚 API Endpoints

### Products
- `GET /api/products` - Get all products with pagination
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (Admin only)

### Payments
- `POST /api/payments/create-checkout-session` - Create Stripe checkout session
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/session/:sessionId` - Get payment session status

### Address Management
- `POST /api/addresses` - Create address
- `GET /api/addresses` - Get user addresses
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

### File Upload
- `POST /api/upload` - Upload images to Vercel Blob

## 🔧 Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run setup:db` - Run database setup scripts
- `npm run seed:products` - Seed database with sample products
- `npm run migrate:images` - Migrate images to Vercel Blob
- `npm run clean:db` - Clean database (development only)

## 🗄️ Database Schema

### Product Schema
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  price: number,
  image: string,
  categoryId: ObjectId,
  stock: number,
  stripePriceId: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```typescript
{
  _id: ObjectId,
  userId: string,
  items: [{
    product: {
      _id: string,
      name: string,
      price: number,
      image: string,
      description: string,
      stripePriceId: string
    },
    quantity: number
  }],
  orderStatus: "PENDING" | "CONFIRMED" | "CANCELLED",
  paymentStatus: "PENDING" | "PAID" | "FAILED",
  shippingAddress: Address,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication & Authorization

### Clerk Integration
- JWT token validation
- User session management
- Role-based access control
- Admin permission checking

### Middleware
- `isAuthenticated` - Verify user authentication
- `isAdmin` - Verify admin privileges
- `globalErrorHandler` - Centralized error handling

## 💳 Payment Processing

### Stripe Integration
- Checkout session creation
- Webhook handling for payment updates
- Order fulfillment automation
- Payment status tracking

### Webhook Events
- `checkout.session.completed` - Order confirmation
- `payment_intent.succeeded` - Payment success
- `payment_intent.payment_failed` - Payment failure

## 🖼️ Image Management

### Vercel Blob Integration
- Optimized image storage
- Automatic image resizing
- CDN delivery
- Format optimization (WebP, AVIF)

### Image Processing
- Multiple size variants
- Quality optimization
- Format conversion
- Lazy loading support

## 🚀 Deployment

### Environment Setup
1. Set up MongoDB Atlas or local MongoDB
2. Configure Clerk authentication
3. Set up Stripe account and webhooks
4. Configure Vercel Blob storage
5. Set environment variables

### Production Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Recommended Platforms
- **Render** - Easy deployment with environment variables
- **Railway** - Full-stack deployment platform
- **Heroku** - Traditional PaaS with add-ons
- **AWS/GCP/Azure** - Cloud platform deployment

## 📊 Database Optimization

### Indexing
- Product name and category indexes
- Order user and date indexes
- Payment session indexes
- Optimized query performance

### Migration Scripts
- Database schema setup
- Sample data seeding
- Image migration to Vercel Blob
- Index creation and optimization

## 🧪 Testing

### API Testing
- Use Postman collection for endpoint testing
- Test authentication flows
- Verify payment webhooks
- Test file upload functionality

### Database Testing
- Test CRUD operations
- Verify data relationships
- Test query performance
- Validate data integrity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the code comments
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ using Node.js, Express, TypeScript, and MongoDB**