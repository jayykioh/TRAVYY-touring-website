# TRAVYY Touring Website - Backend

A comprehensive Node.js backend for a touring website with booking, payment processing, and user management features.

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Tour Booking**: Complete booking system with quote calculation and management
- **Payment Processing**: Integrated MoMo and PayPal payment gateways
- **Cart Management**: Session-based shopping cart functionality
- **Wishlist**: User favorite tours management
- **Admin Panel**: Administrative features for content and user management
- **Email Notifications**: Automated email service for user communications

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Gateways**: MoMo, PayPal
- **Testing**: Jest with Supertest for integration tests
- **Validation**: Zod schemas
- **Email**: Nodemailer

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TRAVYY-touring-website/touring-be
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Ensure MongoDB is running
   # Database connection configured in config/db.js
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## Testing

### Test Coverage
- **Unit Tests**: 54 tests (87% passing)
- **Integration Tests**: 31 tests (100% passing)
- **Overall Coverage**: ~27%

### Running Tests

#### All Tests
```bash
npm test
```

#### Unit Tests Only
```bash
npm run test:unit
# or
npx jest test/unit/
```

#### Integration Tests Only
```bash
npm run test:integration
# or
npx jest test/integration/
```

#### Specific Test Files
```bash
# Authentication tests
npx jest test/unit/auth.controller.test.js

# Booking tests
npx jest test/unit/bookingController.test.js

# Payment integration tests
npx jest test/integration/payment.routes.integration.test.js

# Booking integration tests
npx jest test/integration/booking.routes.integration.test.js
```

### Test Structure
```
test/
├── unit/                          # Unit tests for individual functions
│   ├── auth.controller.test.js    # Authentication controller
│   ├── bookingController.test.js  # Booking controller
│   ├── cart.controller.test.js    # Cart controller (partial)
│   └── wishlistController.test.js # Wishlist controller
├── integration/                   # API endpoint integration tests
│   ├── booking.routes.integration.test.js
│   └── payment.routes.integration.test.js
└── setup.js                       # Test configuration
```

### Test Results Summary

#### ✅ Fully Tested Features
- **Authentication**: User registration, login, JWT validation
- **Booking System**: Quote calculation, booking retrieval
- **Payment Processing**: MoMo payments, IPN handling, session management

#### ⚠️ Partially Tested Features
- **Cart Management**: Integration tests pass, unit tests have mocking issues

#### ❌ Not Yet Tested
- Wishlist functionality (tests created but failing)
- Email service
- Admin features
- Additional utility functions

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

### Booking Endpoints
- `POST /api/booking/quote` - Get booking quote
- `GET /api/booking/user` - Get user bookings

### Payment Endpoints
- `POST /api/payment/momo/create` - Create MoMo payment
- `POST /api/payment/momo/ipn` - MoMo IPN callback
- `GET /api/payment/momo/status/:orderId` - Check payment status

### Cart Endpoints
- `GET /api/cart` - Get cart contents
- `POST /api/cart/add` - Add item to cart
- `DELETE /api/cart/remove/:itemId` - Remove item from cart

### Wishlist Endpoints
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:tourId` - Remove from wishlist

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/travyy

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# MoMo Payment Gateway
MOMO_PARTNER_CODE=your-partner-code
MOMO_ACCESS_KEY=your-access-key
MOMO_SECRET_KEY=your-secret-key
MOMO_CREATE_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
PORT=3000
NODE_ENV=development
```

## Development

### Code Quality
- ESLint configuration for code linting
- Prettier for code formatting
- Jest for comprehensive testing

### Project Structure
```
touring-be/
├── config/                 # Database and app configuration
├── controller/             # Route controllers
│   ├── admin/             # Admin controllers
│   └── *.controller.js    # Feature controllers
├── models/                # Mongoose models
├── routes/                # API route definitions
│   ├── admin/            # Admin routes
│   └── *.routes.js       # Feature routes
├── middlewares/           # Express middlewares
├── utils/                 # Utility functions
├── test/                  # Test files
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
├── server.js              # Application entry point
└── package.json
```

## Contributing

1. Follow the existing code style and structure
2. Write tests for new features
3. Ensure all tests pass before submitting PR
4. Update documentation for API changes

## License

This project is licensed under the MIT License.