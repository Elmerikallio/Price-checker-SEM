# API Documentation with Swagger

This document explains the Swagger/OpenAPI documentation implementation for the Price Checker API.

## Accessing the Documentation

- **Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Raw OpenAPI JSON**: [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)

## Functional Requirements Coverage

The Swagger documentation comprehensively covers all functional requirements:

### 1. User Management
- **✅ Backend administrator can review sign-up requests**: `GET /admin/stores`
- **✅ Backend administrator can lock and unlock store accounts**: 
  - `POST /admin/stores/{id}/suspend`
  - `POST /admin/stores/{id}/reactivate`
- **✅ Backend administrator can remove store accounts**: `DELETE /admin/stores/{id}`
- **✅ Backend administrator can create another administrator**: `POST /admin/users`

### 2. Store Users Can Offer Discounts
- **✅ Store users can offer discounts for App users**: `POST /prices/products` (with discount information)
- **✅ Add mappings of products and reductions**: Included in product submission endpoints
- **✅ Backend considers reductions when returning prices**: `GET /prices/nearby` returns discounted prices

### 3. Location-Store List
- **✅ Backend maintains location-store mapping**: `GET /stores`
- **✅ Store name-location mapping during sign-up**: `POST /auth/signup-store`
- **✅ Store users keep information up-to-date**: Through store management endpoints

### 4. Price Comparison
- **✅ Backend receives barcode data, location, price, timestamp**: `POST /prices/observations`, `GET /prices/nearby`
- **✅ Data is saved on backend**: All price endpoints persist data
- **✅ Additional user preferences supported**: `maxDistance`, `maxAge` parameters
- **✅ Query nearby stores for same product**: `GET /prices/nearby`
- **✅ Compare prices across nearby stores**: Returns sorted price list
- **✅ Returns sorted list by price**: Ascending order implementation
- **✅ Include store name, location, and price**: Complete store information returned
- **✅ Returns price labels**: "very inexpensive" to "very expensive" categories

### 5. Batch Price Operations
- **✅ Store users can add prices in batches**: `POST /prices/batch`
- **✅ List of product-price information objects**: Supports bulk operations

### 6. Data Integrity and Security
- **✅ HTTPS communication**: Configured in deployment
- **✅ Data validation**: Zod schemas for all endpoints
- **✅ Error handling**: Comprehensive error responses
- **✅ Admin operation logging**: `GET /admin/audit-logs`

## Authentication

The API uses JWT (JSON Web Token) authentication. In Swagger UI:

1. Click the "Authorize" button in the top right
2. Enter your JWT token in the format: `Bearer <your-jwt-token>`
3. The token will be automatically included in requests to protected endpoints

## API Testing with Swagger

### Testing Authentication Flow:
1. **Register a store user**: `POST /auth/signup-store`
2. **Admin approval**: `POST /admin/stores/{id}/approve` (requires admin access)
3. **Login**: `POST /auth/login`
4. **Use JWT token**: Add to Authorization header in Swagger UI

### Testing Price Comparison:
1. **Submit price observations**: `POST /prices/observations`
2. **Add store prices**: `POST /prices/products` (with discounts)
3. **Compare prices**: `GET /prices/nearby`

### Testing Batch Operations:
1. **Batch price upload**: `POST /prices/batch`
2. **View store prices**: `GET /prices/store/prices`

## Response Schemas

All endpoints return consistent response schemas:

- **Success responses**: Include relevant data and status information
- **Error responses**: Follow the `Error` schema with status, message, timestamp, and path
- **Pagination**: Consistent pagination schema across list endpoints

## Rate Limiting and Performance

- Batch operations support up to 1000 items per request
- Pagination limits: 1-100 items per page
- Geographic search radius: 0.1-100 km
- Price age filtering: 1-168 hours

## Development Notes

- The server can run without database connection for documentation purposes (set `ALLOW_NO_DB=true`)
- All geographic coordinates are validated (latitude: -90 to 90, longitude: -180 to 180)
- Barcode types supported: EAN13, EAN8, UPC, CODE128
- Price labels are automatically calculated based on price distribution analysis

## API Versioning

The API is versioned with `/api/v1` prefix to support future versions without breaking existing clients (Functional Requirement #21).

## Security Features

- All admin operations are logged for auditing
- Sensitive data is not exposed in logs
- JWT tokens have appropriate expiration
- Role-based access control (RBAC) implemented
- Input validation on all endpoints