# Admin Account Configuration

## Overview

This document provides details about the admin account system in the Price Checker SEM backend service.

## Default Admin Account

### Credentials
- **Email**: `admin@pricechecker.com`
- **Password**: `admin123`
- **Role**: `SUPER_ADMIN`
- **Created**: December 16, 2025

> ⚠️ **Security Notice**: Change the default password immediately in production environments!

## User Roles

The system supports two administrative roles:

### SUPER_ADMIN
- Full system access
- Can create and manage other admin users
- Can manage all store users and their status
- Access to audit logs and system statistics
- Can perform all administrative operations

### ADMIN
- Standard admin privileges
- Can manage store users (approve, lock, unlock)
- Can view audit logs
- Cannot create other admin users (only SUPER_ADMIN can)

## Admin Capabilities

### User Management
- Create new admin users (SUPER_ADMIN only)
- Update user information
- Delete users
- Track user creation history (self-referential tracking)

### Store Management
- View all stores with pagination and filtering
- Approve pending store registrations
- Lock/unlock store accounts
- Delete store accounts
- Update store information

### System Monitoring
- Access audit logs for all admin operations
- View system statistics (users, stores, products, prices)
- Monitor login attempts and security events

### Audit Trail
All admin operations are logged with:
- User ID of the admin performing the action
- Action type (USER_CREATED, STORE_APPROVED, etc.)
- Target type and ID
- IP address and user agent
- Timestamp

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Admin login
- `POST /api/v1/auth/logout` - Admin logout
- `GET /api/v1/auth/me` - Get current admin info

### Admin Operations
- `GET /api/v1/admin/stores` - List all stores
- `PUT /api/v1/admin/stores/:id/status` - Update store status
- `DELETE /api/v1/admin/stores/:id` - Delete store
- `GET /api/v1/admin/users` - List all admin users
- `POST /api/v1/admin/users` - Create new admin user
- `PUT /api/v1/admin/users/:id` - Update admin user
- `DELETE /api/v1/admin/users/:id` - Delete admin user
- `GET /api/v1/admin/audit-logs` - View audit logs
- `GET /api/v1/admin/statistics` - System statistics

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'ADMIN',
  createdBy INTEGER REFERENCES users(id),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id VARCHAR(30) PRIMARY KEY,
  userId INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL,
  targetType VARCHAR(50),
  targetId VARCHAR(255),
  details JSON,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Instructions

### Creating the Default Admin
1. Ensure the database is set up and migrated:
   ```bash
   npm run db:migrate
   ```

2. Run the seed script to create the default admin:
   ```bash
   npm run db:seed
   ```

3. Verify the admin was created:
   ```bash
   node scripts/check-admin.js
   ```

### Creating Additional Admins
1. Log in with the SUPER_ADMIN account
2. Use the admin API endpoints or admin dashboard
3. Only SUPER_ADMIN users can create other admin accounts

### Changing Default Password
1. Log in with the default credentials
2. Use the user update endpoint or admin interface
3. Or directly update in the database (remember to hash the password)

## Security Considerations

### Password Security
- Passwords are hashed using bcrypt with salt rounds of 10
- Minimum password requirements should be enforced in production
- Consider implementing password complexity rules

### Access Control
- All admin endpoints require JWT authentication
- Role-based access control (RBAC) is enforced
- Audit logging for accountability

### Production Deployment
- Change default admin credentials immediately
- Use strong passwords and consider 2FA
- Monitor audit logs regularly
- Implement rate limiting for admin endpoints
- Use HTTPS for all admin communications

## Troubleshooting

### Admin User Not Found
If no admin users exist:
```bash
# Re-run the seed script
npm run db:seed
```

### Check Current Admin Users
```bash
# Use the check script
node scripts/check-admin.js
```

### Reset Admin Password
If you need to reset the admin password, you can:
1. Update directly in database (hash the new password)
2. Or recreate by clearing users table and re-running seed script

### Database Connection Issues
Ensure your `.env` file has the correct DATABASE_URL:
```env
DATABASE_URL="file:./dev.db"
```

## Related Documentation

- [User Management Requirements](REQUIREMENT_01_USER_MANAGEMENT.md)
- [Database Migration Guide](DATABASE_MIGRATION.md)
- [API Documentation](../README.md#api-endpoints)
- [Deployment Guide](DEPLOYMENT.md)