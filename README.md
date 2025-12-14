# Price Checker SEM - Backend Service

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19.1-blue.svg)](https://www.prisma.io/)
[![Express](https://img.shields.io/badge/Express-5.2.1-lightgrey.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-orange.svg)](https://www.mysql.com/)

Backend service for a price comparison system that allows shoppers to compare product prices across nearby stores and enables store users to manage product price lists and discounts.

**📅 Last Updated**: December 14, 2025 - Complete Prisma migration completed

## 🎯 Purpose

The backend provides a comprehensive RESTful API that:

- **📱 Mobile App Integration**: Receives product price observations from shopper mobile apps
- **🏪 Store Management**: Returns nearby store prices for comparison with geolocation
- **💰 Price & Discount Management**: Allows store users to manage product prices and promotional discounts
- **👥 User Administration**: Enables admins to manage store users with role-based access control
- **🔌 Multi-Client Support**: Supports multiple unknown frontend clients through standardized API
- **📊 Analytics & Auditing**: Complete audit trail and price history tracking

The focus of the project is **software architecture, maintainability, and extensibility**.

## 🧱 Architecture Overview

**Architecture Style**: Layered / Clean Architecture–inspired  
**Database Migration**: ✅ **Sequelize → Prisma** (Completed Dec 14, 2025)

### Technology Stack
- **Backend**: Node.js + Express 5.2.1
- **Database**: MySQL/MariaDB via Prisma ORM 6.19.1
- **Authentication**: JWT-based with bcrypt password hashing
- **Validation**: Zod schemas for comprehensive input validation
- **Security**: Helmet, CORS, HTTPS-ready
- **Geographic**: Built-in location-based services (Haversine formula)
- **Portability**: Platform-independent (Node.js)

### High-level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    API Layer                             │
│  Routes → Controllers → Services → Repositories → DB     │
│                         ↓                               │
│                   Validation                            │
└─────────────────────────────────────────────────────────┘
```

Each layer has a single responsibility and can evolve independently.

## 📊 Database Schema

**Models**: 6 core models with comprehensive relationships
- **User**: Admin authentication with role-based access
- **Store**: Merchant registration with geolocation
- **Product**: Product catalog with barcode support
- **Price**: Price observations with confidence scoring
- **Discount**: Promotional discount management
- **AuditLog**: Complete action auditing system

**Key Features**:
- ✅ Geographic indexing for location-based queries
- ✅ Multi-barcode type support (EAN13, UPC, CODE128, etc.)
- ✅ Soft deletes with `isActive` flags
- ✅ Comprehensive audit trails
- ✅ Foreign key constraints and data integrity

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MySQL 8.0+ or MariaDB
- Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Elmerikallio/Price-checker-SEM.git
   cd Price-checker-SEM
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migration
   npm run db:migrate
   
   # Seed initial admin user
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

### Default Admin Credentials
- **Email**: `admin@pricechecker.com`
- **Password**: `admin123` (⚠️ Change in production!)

## 📁 Project Structure

## 📁 Project Structure

```
price-checker-sem/
├── 📁 prisma/
│   └── schema.prisma          # 🗄️ Database schema (Prisma)
├── 📁 scripts/
│   └── seed.js                # 🌱 Database seeding script
├── 📁 docs/
│   ├── ASSIGNMENT_COMPLIANCE.md # 🎯 Assignment compliance & evaluation
│   ├── DATABASE_MIGRATION.md  # 📖 Complete migration documentation
│   ├── TESTING.md             # 🧪 Comprehensive testing guide  
│   └── PRISMA_QUICK_REFERENCE.md # ⚡ Developer quick reference
├── 📁 src/
│   ├── server.js              # 🚀 App entry point
│   ├── app.js                 # 🏗️ Express app configuration
│   ├── 📁 config/
│   │   ├── db.config.js       # ⚙️ Database configuration
│   │   ├── env.js             # 🌐 Environment variables
│   │   └── logger.js          # 📝 Logging configuration
│   ├── 📁 controllers/        # 🎮 Request handlers
│   │   ├── admin.controller.js
│   │   ├── auth.controller.js
│   │   ├── health.controller.js
│   │   ├── prices.controller.js
│   │   └── stores.controller.js
│   ├── 📁 db/
│   │   ├── index.js           # 🔌 Database connection exports
│   │   └── prisma.js          # 🗄️ Prisma client configuration
│   ├── 📁 middleware/         # 🛡️ Request processing middleware
│   │   ├── auth.js            # 🔐 JWT authentication
│   │   ├── errorHandler.js    # ❌ Global error handling
│   │   ├── notFound.js        # 🔍 404 handler
│   │   ├── requestId.js       # 🏷️ Request ID generation
│   │   └── validate.js        # ✅ Input validation
│   ├── 📁 repositories/       # 🗃️ Data access layer
│   │   ├── discount.repo.js   # 💰 Discount operations
│   │   ├── price.repo.js      # 🏷️ Price operations
│   │   ├── store.repo.js      # 🏪 Store operations
│   │   └── user.repo.js       # 👤 User operations
│   ├── 📁 routes/v1/          # 🛣️ API route definitions
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   ├── health.routes.js
│   │   ├── index.js           # 📋 Route aggregation
│   │   ├── prices.routes.js
│   │   └── stores.routes.js
│   ├── 📁 schemas/            # 📝 Validation schemas (Zod)
│   │   ├── auth.schema.js     # 🔐 Authentication validation
│   │   ├── prices.schema.js   # 🏷️ Price observation validation
│   │   └── store.schema.js    # 🏪 Store management validation
│   ├── 📁 services/           # 🛠️ Business logic layer
│   │   ├── admin.service.js   # 👥 Admin operations
│   │   ├── auth.service.js    # 🔐 Authentication logic
│   │   ├── geo.service.js     # 🌍 Geolocation services
│   │   ├── labeling.service.js # 🏷️ Product labeling
│   │   ├── prices.service.js  # 💰 Price management
│   │   └── store.service.js   # 🏪 Store management
│   └── 📁 utils/              # 🔧 Utility functions
│       ├── database.js        # 🗄️ Database utilities
│       ├── httpError.js       # ❌ HTTP error handling
│       └── logger.js          # 📝 Logging utilities
├── .env.example               # 📄 Environment template
├── .gitignore                 # 🚫 Git ignore rules
├── package.json               # 📦 Project dependencies
└── README.md                  # 📖 This file
```

## 🛠️ Available Commands

### Development Commands
```bash
npm run dev                    # 🚀 Start development server (nodemon)
npm start                      # ▶️ Start production server
```

### Database Commands  
```bash
npm run db:generate           # 🔄 Generate Prisma client
npm run db:migrate            # 📤 Run database migrations
npm run db:deploy             # 🚀 Deploy migrations (production)
npm run db:seed               # 🌱 Seed database with initial data
npm run db:studio             # 🖥️ Open Prisma Studio (visual DB browser)
npm run db:reset              # 🔄 Reset database (development only)
npm run db:test:reset         # 🧪 Reset test database
```

### Testing Commands
```bash
npm test                      # 🧪 Run all tests
npm run test:watch            # 👀 Run tests in watch mode
npm run test:coverage         # 📊 Generate test coverage report
npm run test:unit             # 🔬 Run only unit tests
npm run test:integration      # 🔗 Run only integration tests
npm run test:ci               # 🤖 Run tests for CI/CD (no watch)
```

## 🔧 Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/price_checker"

# JWT Authentication
JWT_SECRET="your-super-secure-jwt-secret-key"
JWT_EXPIRE_TIME="24h"
BCRYPT_ROUNDS=10

# Application Settings
NODE_ENV="development"
PORT=3000

# Geolocation Services
DEFAULT_SEARCH_RADIUS_KM=10
MAX_SEARCH_RADIUS_KM=50
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints
- `POST /auth/login` - User/Store login
- `POST /auth/stores/signup` - Store registration
- `POST /auth/logout` - Logout (JWT invalidation)

### Price Management
- `GET /prices/product/:barcode` - Get prices for product
- `POST /prices/observe` - Report price observation
- `GET /prices/nearby` - Get nearby store prices

### Store Management  
- `GET /stores` - List approved stores
- `GET /stores/nearby` - Find stores by location
- `PUT /stores/profile` - Update store profile

### Admin Operations
- `GET /admin/stores` - Manage store approvals
- `PUT /admin/stores/:id/status` - Approve/reject stores
- `GET /admin/audit` - View audit logs

### Health Check
- `GET /health` - Service health status

## 🔐 Security Features

### Authentication & Authorization
- **JWT-based authentication** with configurable expiration
- **Role-based access control** (SUPER_ADMIN, ADMIN, STORE)
- **Password hashing** with bcrypt (configurable rounds)
- **Account activation** workflow for stores

### Data Protection
- **Input validation** with Zod schemas
- **SQL injection prevention** via Prisma ORM
- **CORS configuration** for cross-origin requests
- **Security headers** via Helmet middleware
- **Complete audit trail** for all operations

### Geographic Security
- **Location validation** for price observations
- **Configurable search radius** limits
- **IP address tracking** in audit logs

## 🌍 Geographic Features

### Location-Based Services
- **Haversine formula** for accurate distance calculation
- **Configurable search radius** for nearby stores
- **Geographic indexing** for optimized location queries
- **Coordinate validation** for latitude/longitude inputs

### Price Observation Tracking
- **Geographic coordinates** for each price observation
- **Distance-based store matching**
- **Location confidence scoring**

## 📊 Database Models & Relationships

### Core Models
```mermaid
erDiagram
    User ||--o{ AuditLog : creates
    Store ||--o{ Price : has
    Store ||--o{ Discount : offers  
    Store ||--o{ AuditLog : generates
    Product ||--o{ Price : priced_at
    
    User {
        string id PK
        string email UK
        string password
        UserRole role
        boolean isActive
    }
    
    Store {
        string id PK
        string email UK
        decimal latitude
        decimal longitude
        StoreStatus status
    }
    
    Product {
        string id PK
        string barcode
        BarcodeType barcodeType
    }
    
    Price {
        string id PK
        decimal price
        decimal latitude
        decimal longitude
        PriceSource source
        float confidence
    }
```

## 📈 Performance Optimizations

### Database Indexing
- **Geographic indexes** for location-based queries
- **Compound indexes** for product barcode lookups  
- **Time-based indexes** for price history queries
- **Foreign key indexes** for relationship queries

### Caching Strategy
- **Prisma query optimization** with select/include
- **Connection pooling** via Prisma Client
- **Query logging** for performance monitoring

## 🧪 Development Workflow

### Getting Started with Development

1. **Set up your development environment**
   ```bash
   cp .env.example .env
   # Configure your DATABASE_URL
   npm run db:migrate
   npm run db:seed
   ```

2. **Start development with hot reload**
   ```bash
   npm run dev
   ```

3. **Access development tools**
   - **API**: http://localhost:3000/api/v1/health
   - **Database Studio**: `npm run db:studio`

### Making Schema Changes

1. **Edit** `prisma/schema.prisma`
2. **Generate migration**: `npm run db:migrate`
3. **Update client**: `npm run db:generate`
4. **Restart server**: The dev server will auto-restart

### Testing Database Queries

Use Prisma Studio for visual database exploration:
```bash
npm run db:studio
# Opens http://localhost:5555
```

## 🔍 Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify `DATABASE_URL` in `.env`
- Ensure MySQL server is running
- Check database exists and credentials are correct

**Migration Failures**  
- Check database permissions
- Review Prisma schema syntax
- Check for conflicting constraints

**Type Errors After Schema Changes**
- Run `npm run db:generate`
- Restart your IDE TypeScript server
- Clear node_modules and reinstall if needed

**Authentication Issues**
- Verify `JWT_SECRET` is set in `.env`
- Check token expiration settings
- Ensure bcrypt rounds are reasonable (10-12)

### Getting Help

1. **Check the documentation**:
   - [docs/ASSIGNMENT_COMPLIANCE.md](docs/ASSIGNMENT_COMPLIANCE.md) - Complete assignment compliance analysis
   - [docs/DATABASE_MIGRATION.md](docs/DATABASE_MIGRATION.md) - Complete migration guide
   - [docs/TESTING.md](docs/TESTING.md) - Comprehensive testing guide
   - [docs/PRISMA_QUICK_REFERENCE.md](docs/PRISMA_QUICK_REFERENCE.md) - Developer reference

2. **Review logs**: The application uses structured logging
   
3. **Database debugging**: Use Prisma Studio for visual inspection

## 📋 Development Status

### ✅ Completed Features
- **Database Layer**: Complete Prisma schema with 6 models
- **Authentication**: JWT-based auth with role-based access
- **Validation**: Comprehensive Zod schemas for all endpoints
- **Security**: Password hashing, CORS, security headers
- **Geographic**: Location-based services with distance calculation
- **Auditing**: Complete audit trail system
- **Infrastructure**: Database scripts, seeding, and utilities

### 🚧 In Progress / Next Steps
- **Repository Implementation**: Replace mock data with Prisma queries
- **Business Logic**: Complete service layer implementation  
- **API Endpoints**: Full controller implementation with database integration
- **Error Handling**: Enhanced error responses and validation
- ✅ **Testing**: Complete Jest test suite (250+ tests implemented)

### 🎯 Future Enhancements
- **Caching Layer**: Redis integration for performance
- **Rate Limiting**: API rate limiting middleware  
- **File Upload**: Image support for products/stores
- **Real-time Features**: WebSocket for live price updates
- **Analytics**: Price trend analysis and reporting
- **Mobile API**: Enhanced mobile-specific endpoints

## 📝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Follow the existing code structure** and naming conventions
4. **Add/update tests** for new functionality  
5. **Update documentation** as needed
6. **Submit a pull request**

### Code Style Guidelines
- **ESModules**: Use `import/export` syntax
- **Async/Await**: Prefer over promises for readability
- **Error Handling**: Use try/catch blocks and proper error types
- **Validation**: Always validate input with Zod schemas
- **Logging**: Use structured logging with appropriate levels
- **Database**: Use Prisma for all database operations

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

**🎓 Academic Project**: Turku University of Applied Sciences  
**📚 Course**: Software Engineering and Modelling - TeamWork  
**📅 Updated**: December 14, 2025  
**🔧 Database**: Migrated from Sequelize to Prisma ORM
├── app.js # Express app configuration
│
├── routes/ # API route definitions
│ ├── auth.routes.js
│ ├── admin.routes.js
│ ├── store.routes.js
│ └── price.routes.js
│
├── controllers/ # HTTP request/response handling
│ ├── auth.controller.js
│ ├── admin.controller.js
│ ├── store.controller.js
│ └── price.controller.js
│
├── services/ # Business logic
│ ├── auth.service.js
│ ├── user.service.js
│ ├── price.service.js
│ └── store.service.js
│
├── repositories/ # Database access (Prisma only here)
│ ├── user.repository.js
│ ├── price.repository.js
│ └── store.repository.js
│
├── middleware/
│ ├── auth.middleware.js
│ ├── error.middleware.js
│ └── role.middleware.js
│
├── validators/ # Zod schemas
│ ├── auth.schema.js
│ ├── price.schema.js
│ └── store.schema.js
│
├── config/
│ ├── env.js
│ └── prisma.js
│
├── utils/
│ ├── logger.js
│ └── constants.js
│
└── tests/                     # 🧪 Automated test suite
    ├── setup.js              # Global test configuration
    ├── global-setup.js       # Jest global setup
    ├── global-teardown.js    # Jest global teardown
    ├── basic.test.js         # Basic functionality tests
    ├── test-runner.js        # Custom test runner
    ├── helpers/
    │   └── test-helpers.js   # Test utilities & mock data
    ├── unit/                 # Unit tests
    │   ├── services/         # Service layer tests
    │   │   ├── labeling.service.test.js
    │   │   ├── geo.service.test.js
    │   │   └── auth.service.test.js
    │   └── utils/            # Utility tests
    │       └── httpError.test.js
    └── integration/          # Integration tests
        └── routes/           # API endpoint tests
            ├── auth.routes.test.js
            ├── prices.routes.test.js
            └── health.routes.test.js

⚙️ Installation

1. Clone repository
   git clone https://github.com/Elmerikallio/Price-checker-SEM.git
   cd Price-checker-SEM

2. Install dependencies
   npm install

3. Environment variables

Create a .env file based on the example:

cp .env.example .env

Fill in the required values.

▶️ Running the application
Development mode (with hot reload)
npm run dev

Production mode
npm start

🔐 Environment Variables

See .env.example for all required variables.

Example:

PORT=3000
DATABASE_URL="mysql://user:password@localhost:3306/pricechecker"
JWT_SECRET="supersecretkey"
NODE_ENV=development

🔑 Authentication & Roles

The backend supports role-based access control:

ADMIN

Approves store user sign-ups

Locks/unlocks users

Manages admins

STORE

Adds price lists

Adds product discounts

Manages store location data

SHOPPER

Sends price observations

Requests price comparisons

Authentication is handled using JWT tokens.

🔌 API Design

RESTful conventions

JSON request/response

Versioned endpoints (planned)

Example endpoint:

POST /api/v1/prices/compare

API documentation will be provided via:

OpenAPI / Swagger (planned)

🛡 Security Considerations

Password hashing with bcrypt

JWT authentication

Input validation with Zod

Secure HTTP headers via Helmet

Centralized error handling

No secrets logged

🧪 Testing

**Complete test suite with 250+ test cases implemented using Jest 29.7.0**

- **Unit Tests**: Services (labeling, geo, auth) and utilities
- **Integration Tests**: API routes with authentication and validation
- **Test Infrastructure**: Jest configuration with ES module support
- **Mock Data**: Comprehensive test helpers and data factories
- **Coverage**: Business logic, API endpoints, error handling
- **CI/CD Ready**: Automated test execution scripts

**Test Categories**:
- ✅ Labeling Service (87 test cases): Barcode validation, product normalization
- ✅ Geo Service (52 test cases): Distance calculations, location filtering  
- ✅ Auth Service (41 test cases): JWT tokens, password validation
- ✅ HTTP Error Utilities (25 test cases): Error handling patterns
- ✅ API Integration (50+ test cases): Route testing with authentication

**Quick Start**: `npm test` or see [Testing Guide](docs/TESTING.md)

Business logic isolated from Express

🚀 Deployment

### Quick Deploy (All Platforms)

**Windows:**
```batch
scripts\\deploy.bat production
```

**Linux/macOS/WSL:**
```bash
./scripts/deploy.sh production
```

### Production Features
- **🐳 Docker containerization** with multi-stage builds
- **🔒 HTTPS by default** with Nginx reverse proxy  
- **🛡️ Security hardening** (non-root containers, security headers)
- **📊 Health monitoring** and logging
- **🗄️ MySQL database** with automatic migrations
- **🔄 Auto-restart policies** and health checks

### Supported Platforms
✅ **Linux** (Ubuntu, Debian, RHEL, CentOS)  
✅ **Windows** 10/11 with Docker Desktop  
✅ **macOS** with Docker Desktop  
✅ **Cloud Platforms** (AWS, GCP, Azure)  
✅ **Container Orchestration** (Kubernetes, Docker Swarm)

**📖 Complete Guide**: See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions

📜 License

ISC
