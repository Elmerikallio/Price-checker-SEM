# Quick Reference: Prisma Development Guide

## Essential Commands

```bash
# Database Operations
npm run db:generate     # Generate Prisma client (after schema changes)
npm run db:migrate      # Create and apply new migration
npm run db:seed         # Populate database with initial data
npm run db:studio       # Open visual database browser
npm run db:reset        # Reset database (development only)

# Development Workflow
npm run dev            # Start development server
npm start              # Start production server
```

## Common Prisma Queries

### User Operations
```javascript
// Find user by email
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
});

// Create new user
const newUser = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: hashedPassword,
    firstName: 'John',
    lastName: 'Doe',
    role: 'ADMIN'
  }
});

// Update user
await prisma.user.update({
  where: { id: userId },
  data: { isActive: false }
});
```

### Store Operations
```javascript
// Find stores near location
const nearbyStores = await prisma.store.findMany({
  where: {
    isActive: true,
    status: 'APPROVED'
  },
  select: {
    id: true,
    name: true,
    latitude: true,
    longitude: true,
    address: true
  }
});

// Create store
const store = await prisma.store.create({
  data: {
    name: 'Local Market',
    email: 'store@example.com',
    password: hashedPassword,
    address: '123 Main St',
    latitude: 60.1699,
    longitude: 24.9384,
    phone: '+358401234567'
  }
});
```

### Product & Price Operations
```javascript
// Get or create product
const product = await prisma.product.upsert({
  where: {
    barcode_barcodeType: {
      barcode: '1234567890123',
      barcodeType: 'EAN13'
    }
  },
  update: {},
  create: {
    barcode: '1234567890123',
    barcodeType: 'EAN13',
    name: 'Sample Product'
  }
});

// Add price observation
const priceObservation = await prisma.price.create({
  data: {
    productId: product.id,
    storeId: store.id,
    price: 4.99,
    currency: 'EUR',
    latitude: 60.1699,
    longitude: 24.9384,
    source: 'USER_REPORTED',
    confidence: 0.95
  }
});

// Get price history
const prices = await prisma.price.findMany({
  where: {
    productId: productId,
    isActive: true
  },
  include: {
    store: {
      select: {
        name: true,
        address: true
      }
    }
  },
  orderBy: {
    observedAt: 'desc'
  },
  take: 10
});
```

### Audit Logging
```javascript
// Create audit log entry
await prisma.auditLog.create({
  data: {
    userId: req.user?.id,
    storeId: req.store?.id,
    action: 'PRICE_ADDED',
    resource: 'Price',
    details: {
      productId: product.id,
      price: 4.99,
      storeId: store.id
    },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  }
});
```

## Database Schema Quick Reference

### Models & Relations
```
User (admin/superadmin)
├─ auditLogs: AuditLog[]

Store (merchants)
├─ prices: Price[]
├─ discounts: Discount[]
└─ auditLogs: AuditLog[]

Product (catalog)
└─ prices: Price[]

Price (observations)
├─ product: Product
└─ store: Store

Discount (promotions)
└─ store: Store

AuditLog (tracking)
├─ user: User?
└─ store: Store?
```

### Enums
```javascript
UserRole: 'SUPER_ADMIN' | 'ADMIN'
StoreStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
BarcodeType: 'EAN13' | 'UPC' | 'CODE128' | 'CODE39' | 'ITF' | 'CODABAR'
PriceSource: 'USER_REPORTED' | 'STORE_API' | 'WEB_SCRAPING' | 'RECEIPT_SCAN'
DiscountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y'
```

## Environment Variables

```bash
# Required
DATABASE_URL="mysql://user:pass@localhost:3306/price_checker"
JWT_SECRET="your-super-secure-secret"

# Optional
JWT_EXPIRE_TIME="24h"
BCRYPT_ROUNDS=10
NODE_ENV="development"
PORT=3000
DEFAULT_SEARCH_RADIUS_KM=10
MAX_SEARCH_RADIUS_KM=50
```

## Validation Schemas (Zod)

### Authentication
```javascript
// Login
{ email: string, password: string }

// Store Signup
{
  name: string (min: 2),
  email: string (email),
  password: string (min: 8),
  address: string (min: 10),
  latitude: number (-90 to 90),
  longitude: number (-180 to 180),
  phone?: string,
  website?: string (url)
}
```

### Price Observation
```javascript
{
  barcode: string (min: 8),
  barcodeType: BarcodeType,
  price: number (positive),
  currency?: string (length: 3),
  storeId: string (cuid),
  latitude?: number (-90 to 90),
  longitude?: number (-180 to 180),
  source?: PriceSource,
  confidence?: number (0 to 1)
}
```

## Development Tips

### 1. Schema Changes Workflow
```bash
# Edit prisma/schema.prisma
# Then run:
npm run db:migrate     # Creates migration
npm run db:generate    # Updates client types
```

### 2. Transaction Example
```javascript
const result = await prisma.$transaction(async (tx) => {
  const product = await tx.product.upsert({...});
  const price = await tx.price.create({...});
  await tx.auditLog.create({...});
  return { product, price };
});
```

### 3. Error Handling
```javascript
try {
  const result = await prisma.user.create({...});
} catch (error) {
  if (error.code === 'P2002') {
    // Unique constraint violation
    throw new Error('Email already exists');
  }
  throw error;
}
```

### 4. Useful Utilities
```javascript
// Distance calculation
import { calculateDistance } from '../utils/database.js';
const distance = calculateDistance(lat1, lon1, lat2, lon2);

// Database connection test
import { testDatabaseConnection } from '../utils/database.js';
const isConnected = await testDatabaseConnection();
```

## Troubleshooting

### Common Errors
- **P2002**: Unique constraint violation
- **P2025**: Record not found
- **P2003**: Foreign key constraint violation

### Quick Fixes
```bash
# Client out of sync
npm run db:generate

# Migration issues
npm run db:reset  # Development only

# See actual SQL
# Add to prisma client: log: ['query']
```

---
*Last updated: December 14, 2025*