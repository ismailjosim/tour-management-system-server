# 🚀 Traveler — Tour Management System (Backend API)

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=flat-square&logo=github)](https://github.com/ismailjosim/tour-management-system-server)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-5.x-DC382D?logo=redis)](https://redis.io/)

> A robust and scalable **Node.js + TypeScript** backend API for managing tours, bookings, payments, and user authentication — the backbone of the Traveler tour management platform.

---

## 🔗 Related Repositories

- **Frontend Client:** [Traveler Client](https://github.com/ismailjosim/tour-management-system-client)

---

## ✨ Core Features

### 🔐 Authentication & Authorization

- **JWT-based authentication** with access tokens
- **Google OAuth 2.0** integration via Passport.js
- **Local authentication** with email/password
- **Role-based access control** (Traveler, Guide, Admin)
- **Session management** with Express Session
- **Password reset flow** with email verification
- **OTP verification** for secure operations

### 🧭 Tour Management

- **CRUD operations** for tours
- **Tour type categorization** (Adventure, Cultural, Beach, etc.)
- **Division-based filtering** for location-specific tours
- **Slug-based tour retrieval** for SEO-friendly URLs
- **Image upload** with Cloudinary integration
- **Tour statistics** and analytics

### 📅 Booking System

- **Secure booking creation** and management
- **User booking history** tracking
- **Booking status** updates (Pending, Confirmed, Cancelled)
- **Booking statistics** for analytics

### 💳 Payment Processing

- **Payment invoice generation** with PDFKit
- **Payment tracking** and history
- **Payment statistics** for revenue insights
- **Secure payment workflow**

### 👥 User Management

- **User registration** and profile management
- **Guide application** system with admin approval/rejection
- **User role management** (Admin only)
- **Profile updates** with image upload
- **User statistics** and activity tracking

### ⭐ Review System

- **Tour review submission** with ratings
- **Review retrieval** by tour
- **Review moderation** capabilities

### 📊 Statistics & Analytics

- **User statistics** (Total users, growth trends)
- **Tour statistics** (Popular tours, bookings)
- **Booking statistics** (Revenue, booking rates)
- **Payment statistics** (Transaction insights)

---

## 🧩 Tech Stack

| Category               | Technologies                  |
| ---------------------- | ----------------------------- |
| **Runtime**            | Node.js 20.x                  |
| **Language**           | TypeScript 5.x                |
| **Framework**          | Express 5.x                   |
| **Database**           | MongoDB 8.x (Mongoose ODM)    |
| **Caching**            | Redis 5.x                     |
| **Authentication**     | JWT, Passport.js, bcryptjs    |
| **Validation**         | Zod                           |
| **File Upload**        | Multer + Cloudinary           |
| **Email**              | Nodemailer                    |
| **PDF Generation**     | PDFKit                        |
| **Template Engine**    | EJS                           |
| **API Client**         | Axios                         |
| **Security**           | CORS, Cookie Parser           |

---

## 📋 API Endpoints

### 🔐 Authentication

```
POST   /api/auth/login                    - User login
POST   /api/auth/logout                   - User logout
POST   /api/auth/change-password          - Change password
POST   /api/auth/forgot-password          - Request password reset
POST   /api/auth/reset-password           - Reset password with token
POST   /api/auth/set-password-google      - Set password for Google OAuth users
POST   /api/auth/generate-access-token    - Generate new access token
```

### 👤 User Management

```
POST   /api/user/create                   - Create new user
GET    /api/user/all                      - Get all users
GET    /api/user/single                   - Get single user
GET    /api/user/me                       - Get current user profile
PATCH  /api/user/update                   - Update user information
```

### 🧭 Guide Management

```
POST   /api/guide/apply                   - Apply to become a guide
PATCH  /api/guide/approve-reject          - Admin approve/reject guide application
GET    /api/guide/all                     - Get all guides (Admin)
GET    /api/guide/single                  - Get single guide
GET    /api/guide/me                      - Get current guide profile
PATCH  /api/guide/update                  - Update guide information
```

### 🗺️ Tour Management

```
POST   /api/tour/create                   - Create new tour
GET    /api/tour/all                      - Get all tours
GET    /api/tour/single/:slug             - Get single tour by slug
PATCH  /api/tour/update                   - Update tour
DEL    /api/tour/delete                   - Delete single tour
```

### 🏷️ Tour Type Management

```
POST   /api/tour-type/create              - Create tour type
GET    /api/tour-type/all                 - Get all tour types
PATCH  /api/tour-type/update              - Update tour types
DEL    /api/tour-type/delete              - Delete single tour type
```

### 📍 Division Management

```
POST   /api/division/create               - Create division
GET    /api/division/all                  - Get all divisions
GET    /api/division/single               - Get single division
PATCH  /api/division/update               - Update division
DEL    /api/division/delete               - Delete single division
```

### 📅 Booking Management

```
POST   /api/booking/create                - Create booking
GET    /api/booking/all                   - Get all bookings
GET    /api/booking/user                  - Get user's bookings
```

### 💳 Payment Management

```
POST   /api/payment/booking               - Process payment for booking
GET    /api/payment/invoice               - Get payment invoice
```

### 🔢 OTP Management

```
POST   /api/otp/send                      - Send OTP
POST   /api/otp/verify                    - Verify OTP
```

### ⭐ Review Management

```
POST   /api/review/create                 - Create review
GET    /api/review/tour                   - Get specific tour's reviews
```

### 📊 Statistics

```
GET    /api/stats/user                    - Get user statistics
GET    /api/stats/tour                    - Get tour statistics
GET    /api/stats/booking                 - Get booking statistics
GET    /api/stats/payment                 - Get payment statistics
```

---

## ⚙️ Project Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/ismailjosim/tour-management-system-server.git
cd tour-management-system-server
```

### 2️⃣ Install Dependencies

```bash
npm install
# or
yarn install
```

### 3️⃣ Configure Environment

Create a `.env` file at the project root:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/traveler
# or MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/traveler

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT Secrets
JWT_ACCESS_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Session Secret
SESSION_SECRET=your_session_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@traveler.com

# Frontend URL
FRONTEND_URL=http://localhost:5173

# API Configuration
API_VERSION=v1
```

### 4️⃣ Run Development Server

```bash
npm run start:dev
```

Server will start at ➜ [http://localhost:5000](http://localhost:5000)

### 5️⃣ Build for Production

```bash
npm run build
npm run start:prod
```

---

## 🧱 Folder Structure

```
src/
├── config/                  # Configuration files
│   ├── database.ts          # MongoDB connection
│   ├── redis.ts             # Redis connection
│   └── cloudinary.ts        # Cloudinary setup
├── controllers/             # Request handlers
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── tour.controller.ts
│   ├── booking.controller.ts
│   └── ...
├── models/                  # Mongoose schemas
│   ├── User.model.ts
│   ├── Tour.model.ts
│   ├── Booking.model.ts
│   └── ...
├── routes/                  # API routes
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── tour.routes.ts
│   └── ...
├── middlewares/             # Custom middlewares
│   ├── auth.middleware.ts   # JWT verification
│   ├── role.middleware.ts   # Role-based access
│   ├── upload.middleware.ts # File upload handling
│   └── error.middleware.ts  # Error handling
├── validators/              # Zod validation schemas
│   ├── auth.validator.ts
│   ├── user.validator.ts
│   └── ...
├── services/                # Business logic
│   ├── auth.service.ts
│   ├── email.service.ts
│   ├── payment.service.ts
│   └── ...
├── utils/                   # Helper utilities
│   ├── jwt.util.ts
│   ├── bcrypt.util.ts
│   ├── email.util.ts
│   └── ...
├── types/                   # TypeScript types
│   └── index.ts
├── app.ts                   # Express app setup
└── server.ts                # Server entry point
```

---

## 📦 Key Dependencies

| Package                      | Purpose                       |
| ---------------------------- | ----------------------------- |
| `express`                    | Web framework                 |
| `mongoose`                   | MongoDB ODM                   |
| `redis`                      | Caching layer                 |
| `jsonwebtoken`               | JWT authentication            |
| `passport`                   | Authentication strategies     |
| `passport-google-oauth20`    | Google OAuth integration      |
| `passport-local`             | Local authentication          |
| `bcryptjs`                   | Password hashing              |
| `zod`                        | Schema validation             |
| `multer`                     | File upload handling          |
| `cloudinary`                 | Cloud image storage           |
| `nodemailer`                 | Email sending                 |
| `pdfkit`                     | PDF generation                |
| `cors`                       | Cross-origin resource sharing |
| `cookie-parser`              | Cookie handling               |
| `express-session`            | Session management            |
| `axios`                      | HTTP client                   |
| `ejs`                        | Template engine               |

---

## 🔒 Authentication Flow

### JWT Authentication

1. User logs in with credentials
2. Server validates and generates JWT access token
3. Token sent to client (stored in localStorage/cookies)
4. Client includes token in Authorization header: `Bearer <token>`
5. Server validates token on protected routes

### Google OAuth Flow

1. User initiates Google login
2. Redirected to Google consent screen
3. Google redirects back with authorization code
4. Server exchanges code for user profile
5. Creates/updates user in database
6. Issues JWT token to client

---

## 🛡️ Security Features

- **Password hashing** with bcryptjs (10 salt rounds)
- **JWT token expiration** and refresh mechanism
- **Role-based access control** (RBAC)
- **CORS protection** with whitelisted origins
- **Input validation** with Zod schemas
- **Session security** with secure cookies
- **Rate limiting** (recommended to add)
- **Helmet.js** for HTTP headers security (recommended to add)

---

## 📧 Email Templates

The server uses EJS templates for sending emails:

- **Welcome email** on registration
- **Booking confirmation** with tour details
- **Payment invoice** as PDF attachment
- **Password reset** with secure token
- **OTP verification** for sensitive operations
- **Guide application status** updates

---

## 📊 Database Schema Overview

### User Schema

```typescript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['traveler', 'guide', 'admin'],
  avatar: String (Cloudinary URL),
  phone: String,
  address: Object,
  isVerified: Boolean,
  googleId: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Tour Schema

```typescript
{
  title: String,
  slug: String (unique),
  description: String,
  tourType: ObjectId (ref: 'TourType'),
  division: ObjectId (ref: 'Division'),
  guide: ObjectId (ref: 'User'),
  price: Number,
  duration: Number,
  maxGroupSize: Number,
  images: Array<String>,
  itinerary: Array<Object>,
  included: Array<String>,
  excluded: Array<String>,
  status: Enum ['active', 'inactive'],
  rating: Number,
  reviewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Schema

```typescript
{
  user: ObjectId (ref: 'User'),
  tour: ObjectId (ref: 'Tour'),
  guide: ObjectId (ref: 'User'),
  bookingDate: Date,
  numberOfPeople: Number,
  totalPrice: Number,
  status: Enum ['pending', 'confirmed', 'cancelled'],
  paymentStatus: Enum ['pending', 'paid', 'refunded'],
  specialRequests: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Deployment

### Prerequisites

- Node.js 20.x or higher
- MongoDB instance (local or MongoDB Atlas)
- Redis instance (local or Redis Cloud)
- Cloudinary account
- Email service (Gmail, SendGrid, etc.)

### Deployment Steps

1. Set all environment variables on your hosting platform
2. Build the application: `npm run build`
3. Start the production server: `npm run start:prod`

### Recommended Platforms

- **Railway** - Easy Node.js deployment
- **Render** - Free tier available
- **Heroku** - Classic PaaS
- **AWS EC2** - Full control
- **DigitalOcean** - Droplets or App Platform

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run prettier:fix
```

---

## 📈 Performance Optimizations

- **Redis caching** for frequently accessed data
- **Database indexing** on commonly queried fields
- **Pagination** for large data sets
- **Lazy loading** for relationships
- **Query optimization** with Mongoose
- **Connection pooling** for MongoDB
- **Compression** middleware (recommended to add)

---

## 🔮 Roadmap

- [ ] WebSocket integration for real-time notifications
- [ ] Stripe/PayPal payment gateway integration
- [ ] Rate limiting with Redis
- [ ] API documentation with Swagger/OpenAPI
- [ ] Unit and integration testing with Jest
- [ ] GraphQL API endpoint
- [ ] Microservices architecture migration
- [ ] Docker containerization
- [ ] CI/CD pipeline with GitHub Actions

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m "Add some AmazingFeature"`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🧑‍💻 Developer

**Ismail Josim**

- 🌐 [Portfolio](https://ismailjosim.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/ismailjosim)
- 🐙 [GitHub](https://github.com/ismailjosim)
- 📧 [ismailjosim@yahoo.com](mailto:ismailjosim@yahoo.com)

---

## 📜 License

This project is licensed under the **ISC License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

⭐ **Star this project** if you find it helpful!

[Report Bug](https://github.com/ismailjosim/tour-management-system-server/issues) • [Request Feature](https://github.com/ismailjosim/tour-management-system-server/issues)

Made with ❤️ by [Ismail Josim](https://github.com/ismailjosim)

</div>
