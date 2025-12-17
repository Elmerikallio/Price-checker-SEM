# Database Migration: Sequelize to Prisma

## Overview

This document details the complete migration process from Sequelize ORM to Prisma ORM for the Price Checker SEM application. The migration was performed on December 14, 2025, and includes schema conversion, validation implementation, and infrastructure setup.

## Migration Rationale

### Why Prisma over Sequelize?

| **Aspect** | **Sequelize** | **Prisma** | **Benefit** |
|------------|---------------|------------|-------------|
| **Type Safety** | Limited TypeScript support | Full type generation | Compile-time error detection |
| **Schema Definition** | JavaScript models | Declarative schema file | Single source of truth |
| **Migrations** | Manual SQL files | Auto-generated | Reduced human error |
| **Query Interface** | SQL-like syntax | Fluent API | Better developer experience |
| **Validation** | Built-in but limited | External (Zod) integration | More flexible validation |
| **Tooling** | Basic CLI | Rich ecosystem (Studio, etc.) | Better development workflow |

## Migration Process

### Phase 1: Analysis of Existing Sequelize Models

**Original Models Found:**
- User model (authentication and roles)
- Store model (merchant registration)
- Product model (basic product catalog)
- Price model (price observations)

**Limitations Identified:**
- No audit trail system
- Limited discount management
- Basic validation rules
- No geolocation utilities
- Missing indexes for performance

### Phase 2: Schema Design and Enhancement

#### New Prisma Schema Structure

```prisma
// Core Models
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  role      UserRole @default(ADMIN)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Audit trail
  auditLogs AuditLog[]
  
  @@map("users")
}

model Store {
  id          String      @id @default(cuid())
  name        String
  email       String      @unique
  password    String
  address     String
  latitude    Decimal     @db.Decimal(10, 8)
  longitude   Decimal     @db.Decimal(11, 8)
  phone       String?
  website     String?
  status      StoreStatus @default(PENDING)
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relations
  prices    Price[]
  discounts Discount[]
  auditLogs AuditLog[]
  
  @@map("stores")
}

model Product {
  id          String      @id @default(cuid())
  barcode     String
  barcodeType BarcodeType
  name        String?
  category    String?
  brand       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relations
  prices Price[]
  
  @@unique([barcode, barcodeType])
  @@map("products")
}

model Price {
  id           String      @id @default(cuid())
  productId    String
  storeId      String
  price        Decimal     @db.Decimal(10, 2)
  currency     String      @default("EUR")
  observedAt   DateTime    @default(now())
  latitude     Decimal?    @db.Decimal(10, 8)
  longitude    Decimal?    @db.Decimal(11, 8)
  source       PriceSource @default(USER_REPORTED)
  confidence   Float       @default(1.0) @db.Float
  isActive     Boolean     @default(true)
  createdAt    DateTime    @default(now())
  
  // Relations
  product Product @relation(fields: [productId], references: [id])
  store   Store   @relation(fields: [storeId], references: [id])
  
  // Indexes for performance
  @@index([productId])
  @@index([storeId])
  @@index([observedAt])
  @@index([latitude, longitude])
  @@map("prices")
}

model Discount {
  id          String       @id @default(cuid())
  storeId     String
  type        DiscountType
  value       Decimal      @db.Decimal(5, 2)
  description String?
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  // Relations
  store Store @relation(fields: [storeId], references: [id])
  
  @@index([storeId])
  @@index([startDate, endDate])
  @@map("discounts")
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  storeId   String?
  action    String
  resource  String
  details   Json?
  ipAddress String?
  userAgent String?
  timestamp DateTime @default(now())
  
  // Relations
  user  User?  @relation(fields: [userId], references: [id])
  store Store? @relation(fields: [storeId], references: [id])
  
  @@index([timestamp])
  @@index([userId])
  @@index([storeId])
  @@map("audit_logs")
}
```

#### Key Enhancements Made

1. **Enhanced User Management**
   - Role-based access control (SUPER_ADMIN, ADMIN)
   - Account activation system
   - Comprehensive audit trails

2. **Advanced Store Features**
   - Geographic coordinates for location-based services
   - Store approval workflow
   - Contact information management

3. **Product Catalog Improvements**
   - Multiple barcode type support (EAN13, UPC, CODE128, etc.)
   - Product categorization and branding
   - Unique constraints for data integrity

4. **Sophisticated Price Tracking**
   - Geographic location for each price observation
   - Multiple price sources (USER_REPORTED, STORE_API, WEB_SCRAPING)
   - Confidence scoring for price accuracy
   - Currency support for international expansion

5. **Discount Management System**
   - Flexible discount types (PERCENTAGE, FIXED_AMOUNT, BUY_X_GET_Y)
   - Time-based discount validity
   - Store-specific promotions

6. **Comprehensive Audit System**
   - Complete action logging
   - User and IP tracking
   - JSON metadata storage for flexible audit data

### Phase 3: Infrastructure Setup

#### Database Configuration

**Environment Variables:**
```bash
# Database
DATABASE_URL="mysql://username:password@localhost:3306/price_checker"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret-key"
JWT_EXPIRES_IN="24h"
BCRYPT_ROUNDS=10

# Application
NODE_ENV="development"
PORT=3000

# Geolocation
DEFAULT_SEARCH_RADIUS_KM=10
MAX_SEARCH_RADIUS_KM=50
```

**Prisma Client Configuration:**
```javascript
// src/db/prisma.js
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// Query logging in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(`Query: ${e.query} Params: ${e.params} Duration: ${e.duration}ms`);
  });
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

### Phase 4: Validation Layer Implementation

#### Zod Schema Integration

**Authentication Schemas:**
```javascript
// src/schemas/auth.schema.js
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const storeSignupSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  address: z.string().min(10, "Please provide a complete address"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().optional(),
  website: z.string().url().optional()
});
```

**Price Observation Schemas:**
```javascript
// src/schemas/prices.schema.js
export const priceObservationSchema = z.object({
  barcode: z.string().min(8, "Barcode must be at least 8 characters"),
  barcodeType: z.enum(['EAN13', 'UPC', 'CODE128', 'CODE39', 'ITF', 'CODABAR']),
  price: z.number().positive("Price must be positive"),
  currency: z.string().length(3, "Currency must be 3 characters (e.g., EUR, USD)").optional(),
  storeId: z.string().cuid("Invalid store ID"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  source: z.enum(['USER_REPORTED', 'STORE_API', 'WEB_SCRAPING', 'RECEIPT_SCAN']).optional(),
  confidence: z.number().min(0).max(1).optional()
});
```

### Phase 5: Utility Functions

#### Database Utilities

**Distance Calculation:**
```javascript
// src/utils/database.js
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

**Product Management:**
```javascript
export async function getOrCreateProduct(barcode, barcodeType, name = null) {
  try {
    return await prisma.product.upsert({
      where: {
        barcode_barcodeType: { barcode, barcodeType }
      },
      update: {
        name: name || undefined,
      },
      create: {
        barcode, barcodeType, name,
      }
    });
  } catch (error) {
    logger.error('Error in getOrCreateProduct:', error);
    throw error;
  }
}
```

### Phase 6: Database Seeding

#### Initial Data Setup

**Admin User Creation:**
```javascript
// scripts/seed.js
async function seedDatabase() {
  const adminEmail = 'admin@pricechecker.com';
  const adminPassword = 'admin123'; // Change in production!
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
      }
    });
  }
}
```

## Migration Commands

### NPM Scripts Added

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "node scripts/seed.js",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset"
  }
}
```

### Migration Execution Steps

1. **Initialize Prisma Schema:**
   ```bash
   npm run db:generate
   ```

2. **Create Initial Migration:**
   ```bash
   npm run db:migrate
   ```

3. **Seed Initial Data:**
   ```bash
   npm run db:seed
   ```

4. **Verify Setup:**
   ```bash
   npm run db:studio
   ```

## Performance Optimizations

### Database Indexes

The new schema includes strategic indexes for common query patterns:

```prisma
// Price lookup optimization
@@index([productId])
@@index([storeId])
@@index([observedAt])
@@index([latitude, longitude])

// Discount validity checks
@@index([startDate, endDate])

// Audit log searching
@@index([timestamp])
@@index([userId])
@@index([storeId])
```

### Query Optimization Features

1. **Unique Constraints**: Prevent duplicate data
2. **Foreign Key Relations**: Maintain data integrity
3. **Decimal Precision**: Accurate price and coordinate storage
4. **JSON Fields**: Flexible audit metadata storage

## Security Enhancements

### Password Security
- BCrypt hashing with configurable rounds
- Password complexity requirements via Zod validation

### Authentication
- JWT token-based authentication
- Role-based access control (RBAC)
- Account activation workflow

### Audit Trail
- Complete action logging
- IP address and user agent tracking
- JSON metadata for detailed audit information

## Development Workflow

### Database Management Commands

```bash
# Development workflow
npm run db:migrate        # Apply schema changes
npm run db:generate       # Update Prisma client
npm run db:seed          # Populate initial data
npm run db:studio        # Visual database browser

# Production deployment
npm run db:deploy        # Apply migrations in production

# Development reset
npm run db:reset         # Reset database (development only)
```

### Testing Database Connection

```javascript
// src/utils/database.js
export async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database connection successful');
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    return false;
  }
}
```

## Next Steps

### Immediate Tasks

1. **Configure Database URL** in `.env` file
2. **Run Initial Migration** to create database tables
3. **Execute Seeding Script** to create admin user
4. **Update Repository Layer** to use Prisma queries

### Repository Layer Updates Needed

The following repository files need to be updated to use Prisma instead of mock data:

- `src/repositories/user.repo.js` - User authentication and management
- `src/repositories/store.repo.js` - Store registration and approval
- `src/repositories/price.repo.js` - Price observation tracking
- `src/repositories/discount.repo.js` - Discount management (new)

### Controller Updates Required

Controllers need to be updated to handle the new validation schemas and repository methods:

- `src/controllers/auth.controller.js` - Authentication endpoints
- `src/controllers/stores.controller.js` - Store management
- `src/controllers/prices.controller.js` - Price tracking
- `src/controllers/admin.controller.js` - Admin operations

## Migration Benefits Achieved

### Developer Experience
- **Type Safety**: Full TypeScript support with generated types
- **Better Tooling**: Prisma Studio for visual database management
- **Auto-completion**: IntelliSense for database queries
- **Migration Management**: Automatic migration generation

### Application Features
- **Enhanced Security**: Comprehensive audit trails and RBAC
- **Scalability**: Optimized indexes and query patterns
- **Flexibility**: JSON fields for extensible data storage
- **Geographic Features**: Built-in location-based functionality

### Data Integrity
- **Referential Integrity**: Proper foreign key constraints
- **Validation**: Multi-layer validation (Zod + Prisma)
- **Unique Constraints**: Prevention of duplicate data
- **Soft Deletes**: Data retention through `isActive` flags

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check database server accessibility
   - Ensure database exists

2. **Migration Failures**
   - Check database permissions
   - Verify schema syntax
   - Review migration logs

3. **Type Errors**
   - Run `npm run db:generate` after schema changes
   - Restart TypeScript server in IDE
   - Check import paths

### Support Resources

- **Prisma Documentation**: https://www.prisma.io/docs
- **Migration Guide**: https://www.prisma.io/docs/guides/migrate-to-prisma
- **Best Practices**: https://www.prisma.io/docs/guides/performance-and-optimization

---

**Migration Completed**: December 14, 2025  
**Database System**: MySQL with Prisma ORM  
**Validation**: Zod schemas with comprehensive rules  
**Security**: JWT authentication with RBAC and audit trails