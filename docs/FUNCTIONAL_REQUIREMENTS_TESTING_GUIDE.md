# Testing Functional Requirements with Swagger API

This guide shows you how to verify each functional requirement using the interactive Swagger UI.

## 🚀 Getting Started

### 1. Access Swagger UI
1. Make sure server is running: `npm run dev`
2. Open: http://localhost:3000/api-docs
3. You'll see all API endpoints organized by categories

### 2. Understanding the Interface
- **Tags**: Endpoints grouped by functionality (Health, Authentication, Admin, Stores, Prices)
- **Methods**: HTTP methods (GET, POST, PUT, DELETE) with color coding
- **Locks**: 🔒 indicates authentication required
- **Try it out**: Button to test endpoints interactively

## 🎯 Testing Each Functional Requirement

### FR1: User Management (Admin Functions)

#### **Requirement**: Backend administrator can review sign-up requests from store users

**Test Steps:**
1. **Find the endpoint**: `GET /admin/stores` (Admin tag)
2. **Click "Try it out"**
3. **Authentication needed**: You'll need admin JWT token first
4. **Expected Result**: List of store users with status (PENDING, ACTIVE, SUSPENDED)

```json
// Expected Response Structure
{
  "stores": [
    {
      "store": { "id": 1, "name": "Test Store", "latitude": 60.1699, "longitude": 24.9384 },
      "user": { "id": 1, "username": "store_user", "status": "PENDING", "role": "STORE_USER" }
    }
  ]
}
```

#### **Requirement**: Backend administrator can lock and unlock store user accounts

**Lock Account Test:**
1. **Endpoint**: `POST /admin/stores/{id}/suspend`
2. **Parameters**: Enter store user ID (e.g., 1)
3. **Request Body** (optional):
```json
{
  "reason": "Policy violation detected"
}
```
4. **Expected Result**: Status 200, message confirming suspension

**Unlock Account Test:**
1. **Endpoint**: `POST /admin/stores/{id}/reactivate`  
2. **Parameters**: Same store user ID
3. **Expected Result**: Status 200, user status changed to ACTIVE

#### **Requirement**: Backend administrator can remove store user accounts

**Test Steps:**
1. **Endpoint**: `DELETE /admin/stores/{id}` (requires Super Admin)
2. **Parameters**: Store user ID to remove
3. **Expected Result**: Status 200, permanent removal confirmation

#### **Requirement**: Backend administrator can create another backend administrator

**Test Steps:**
1. **Endpoint**: `POST /admin/users`
2. **Request Body**:
```json
{
  "username": "new_admin",
  "email": "admin2@company.com", 
  "password": "securePassword123",
  "role": "ADMIN"
}
```
3. **Expected Result**: Status 201, new admin user created

---

### FR2: Store Users Can Offer Discounts

#### **Requirement**: Store users can offer discounts for some products for App users only

**Test Steps:**
1. **First authenticate as store user** (see Authentication section below)
2. **Endpoint**: `POST /prices/products`
3. **Request Body**:
```json
{
  "products": [
    {
      "barcode": "1234567890123",
      "barcodeType": "EAN13",
      "price": 15.99,
      "productName": "Premium Coffee Beans",
      "discount": {
        "percentage": 15.5,
        "validFrom": "2025-12-17T00:00:00Z",
        "validTo": "2025-12-31T23:59:59Z"
      }
    }
  ]
}
```
4. **Expected Result**: Status 201, discount mapping created

#### **Requirement**: Backend considers reductions when returning prices

**Test Steps:**
1. **Endpoint**: `GET /prices/nearby`
2. **Parameters**:
   - `barcode`: 1234567890123
   - `latitude`: 60.1699
   - `longitude`: 24.9384
3. **Expected Result**: Response includes `discountedPrice` field showing reduced price for app users

```json
{
  "stores": [
    {
      "store": {"name": "Test Store"},
      "price": 15.99,
      "discountedPrice": 13.51,  // 15.5% discount applied
      "hasDiscount": true
    }
  ]
}
```

---

### FR3: Location-Store List Management

#### **Requirement**: Backend maintains location-store mapping

**Test Steps:**
1. **Endpoint**: `GET /stores`
2. **Parameters** (optional):
   - `latitude`: 60.1699
   - `longitude`: 24.9384  
   - `radius`: 10
3. **Expected Result**: List of stores with coordinates and distance calculations

#### **Requirement**: Store provides location during sign-up

**Test Steps:**
1. **Endpoint**: `POST /auth/signup-store`
2. **Request Body**:
```json
{
  "username": "new_store_user",
  "email": "store@example.com",
  "password": "password123", 
  "storeName": "Downtown Grocery",
  "address": "123 Main St, Helsinki",
  "latitude": 60.1699,
  "longitude": 24.9384
}
```
3. **Expected Result**: Status 201, store registered with location data

---

### FR4: Price Comparison System

#### **Requirement**: Backend receives barcode data, location, price, and timestamp

**Test Steps:**
1. **Endpoint**: `POST /prices/observations`
2. **Request Body**:
```json
{
  "barcode": "1234567890123",
  "barcodeType": "EAN13",
  "price": 15.99,
  "latitude": 60.1699,
  "longitude": 24.9384,
  "timestamp": "2025-12-17T12:00:00Z"
}
```
3. **Expected Result**: Status 201, price observation saved

#### **Requirement**: Returns sorted list with store info and price labels

**Test Steps:**
1. **Endpoint**: `GET /prices/nearby`
2. **All required parameters**: barcode, latitude, longitude
3. **Optional preferences**: maxDistance, maxAge
4. **Expected Result**:
```json
{
  "stores": [
    {"store": {"name": "Store A"}, "price": 12.99, "distance": 0.5},
    {"store": {"name": "Store B"}, "price": 15.99, "distance": 1.2}
  ],
  "priceLabel": "inexpensive",  // Label based on price analysis
  "product": {"barcode": "1234567890123"}
}
```

---

### FR5: Batch Operations

#### **Requirement**: Store users can add prices in batches

**Test Steps:**
1. **Authenticate as store user first**
2. **Endpoint**: `POST /prices/batch`
3. **Request Body**:
```json
{
  "observations": [
    {
      "barcode": "1111111111111",
      "barcodeType": "EAN13", 
      "price": 10.99
    },
    {
      "barcode": "2222222222222",
      "barcodeType": "EAN13",
      "price": 25.50
    }
  ]
}
```
4. **Expected Result**: Status 201, batch processing summary

---

### FR6: Security and Auditing

#### **Requirement**: Admin operations are logged for auditing

**Test Steps:**
1. **Perform any admin action** (approve store, create user, etc.)
2. **Endpoint**: `GET /admin/audit-logs`
3. **Expected Result**: Log entries showing admin actions with timestamps

```json
{
  "logs": [
    {
      "action": "APPROVE_STORE_USER",
      "adminId": 1,
      "targetUserId": 5,
      "timestamp": "2025-12-17T12:00:00Z",
      "details": {"storeId": 3}
    }
  ]
}
```

## 🔐 Authentication Setup

### Getting JWT Token for Testing

1. **Register or use existing user**:
   - **Store User**: `POST /auth/signup-store` → Get approved by admin
   - **Admin**: Use seeded admin or create via super admin

2. **Login**: `POST /auth/login`
```json
{
  "username": "admin@pricechecker.com",
  "password": "admin123"
}
```

3. **Copy JWT token** from response
4. **Click "Authorize" button** in Swagger UI (top right, lock icon)
5. **Enter**: `Bearer <your-jwt-token>`
6. **Click "Authorize"**

Now all protected endpoints will use your token automatically!

## ✅ Verification Checklist

For each functional requirement, verify:

- [ ] **FR1 User Management**
  - [ ] Can list stores for review
  - [ ] Can approve/reject store users  
  - [ ] Can lock/unlock accounts
  - [ ] Can remove accounts
  - [ ] Can create admin users

- [ ] **FR2 Discount Management**
  - [ ] Store users can add discounts
  - [ ] Discounts apply in price comparison
  - [ ] App-exclusive discount logic works

- [ ] **FR3 Location Mapping**
  - [ ] Store registration includes coordinates
  - [ ] Store list shows locations
  - [ ] Geographic filtering works

- [ ] **FR4 Price Comparison**
  - [ ] Price observations accepted
  - [ ] Nearby search works
  - [ ] Results sorted by price
  - [ ] Price labels generated

- [ ] **FR5 Batch Operations**
  - [ ] Batch price uploads work
  - [ ] Processing feedback provided

- [ ] **FR6 Security & Audit**
  - [ ] JWT authentication required
  - [ ] Admin actions logged
  - [ ] Audit logs accessible

## 💡 Tips for Testing

1. **Start Simple**: Test health endpoint first: `GET /health`
2. **Follow Authentication Flow**: Register → Approve → Login → Test
3. **Check Response Codes**: 200/201 = success, 4xx = client error, 5xx = server error
4. **Read Error Messages**: Swagger shows detailed validation errors
5. **Use Examples**: Click "Example Value" to auto-fill request bodies
6. **Test Edge Cases**: Try invalid data to verify validation works

This systematic approach ensures all functional requirements are properly implemented and testable!