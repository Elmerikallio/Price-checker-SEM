# Price-checker-SEM

Price Checker Backend

Backend service for a price comparison system that allows shoppers to compare product prices across nearby stores and enables store users to manage product price lists and discounts.

This project is developed as part of the Practical Software Architecture teamwork commission.

🎯 Purpose

The backend provides a RESTful API that:

Receives product price observations from shopper mobile apps

Returns nearby store prices for comparison

Allows store users to manage product prices and discounts

Enables admins to manage store users

Supports multiple unknown frontend clients

The focus of the project is software architecture, maintainability, and extensibility, not UI development.

🧱 Architecture Overview

Architecture style: Layered / Clean Architecture–inspired

Backend: Node.js + Express

Database: Relational DB via Prisma ORM (MySQL / MariaDB)

Authentication: JWT-based

Validation: Zod schemas

Security: Helmet, bcrypt, HTTPS-ready

Portability: Platform-independent (Node.js)

High-level layers
Routes → Controllers → Services → Repositories → Database
↓
Validation

Each layer has a single responsibility and can evolve independently.

📂 Project Structure
src/
├── server.js # App entry point
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
└── tests/ # Automated tests (future)

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

Automated testing planned using Jest

Architecture supports unit and integration tests

Business logic isolated from Express

🚀 Deployment

Platform-independent Node.js app

Environment-based configuration

Works on:

Linux

Windows

Cloud platforms (Docker-ready)

Deployment instructions will be expanded during the project.

📜 License

ISC
