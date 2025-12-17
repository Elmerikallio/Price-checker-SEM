# 🔧 Admin Functionalities Testing Guide

**Project**: Price Checker SEM Backend Service  
**Purpose**: Comprehensive testing guide for admin functionalities  
**Date**: December 17, 2025

## 📋 Prerequisites

1. **Server Running**: Ensure the server is running on `http://localhost:3000`
   ```bash
   npm run dev
   ```

2. **Admin Token**: You already have this token from login:
   ```
   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5Mjk1MzcsImV4cCI6MTc2NjAxNTkzN30.yy2_mRYskvxCgd74elRaPp77VZ7Kl124tWx-1XRMcKk"
   ```

---

## 🎯 Testing Admin Functionalities

### 1. **Review Sign-up Requests from Store Users** ✅

#### Step 1: Create a Test Store Signup (Simulate Store Registration)

```bash
# Create a pending store signup
cmd /c 'curl -X POST "http://localhost:3000/api/v1/auth/signup-store" -H "Content-Type: application/json" -d "{\"email\":\"teststore@example.com\",\"password\":\"password123\",\"name\":\"Test Store\",\"address\":\"123 Test Street\",\"phone\":\"555-0123\",\"latitude\":60.4518,\"longitude\":22.2666}"'
```

#### Step 2: Admin Reviews All Store Signup Requests

```bash
# Get all stores (including pending ones)
cmd /c 'curl -X GET "http://localhost:3000/api/v1/admin/stores" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json"'
```

#### Step 3: Approve a Store Signup

```bash
# Approve store with ID 1 (replace with actual store ID from previous response)
cmd /c 'curl -X POST "http://localhost:3000/api/v1/admin/stores/1/approve" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json"'
```

#### Step 4: Reject a Store Signup (Create another test store first)

```bash
# Create another store for rejection test
cmd /c 'curl -X POST "http://localhost:3000/api/v1/auth/signup-store" -H "Content-Type: application/json" -d "{\"email\":\"rejectstore@example.com\",\"password\":\"password123\",\"name\":\"Reject Store\",\"address\":\"456 Reject Street\",\"phone\":\"555-0456\",\"latitude\":60.4518,\"longitude\":22.2666}"'

# Reject store with reason
cmd /c 'curl -X POST "http://localhost:3000/api/v1/admin/stores/2/reject" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json" -d "{\"reason\":\"Incomplete documentation\"}"'
```

---

### 2. **Lock and Unlock Store User Accounts** ✅

#### Step 1: Lock (Suspend) a Store Account

```bash
# Suspend/lock store account
cmd /c 'curl -X POST "http://localhost:3000/api/v1/admin/stores/1/suspend" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json" -d "{\"reason\":\"Policy violation\"}"'
```

#### Step 2: Unlock (Reactivate) a Store Account

```bash
# Reactivate/unlock store account
cmd /c 'curl -X POST "http://localhost:3000/api/v1/admin/stores/1/reactivate" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json"'
```

---

### 3. **Remove Store User Accounts** ✅

#### Step 1: Remove (Soft Delete) a Store Account

```bash
# Remove/delete store account (SUPER_ADMIN only)
cmd /c 'curl -X DELETE "http://localhost:3000/api/v1/admin/stores/2" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json"'
```

---

### 4. **Create Another Backend Administrator** ✅

#### Step 1: Create Regular Admin

```bash
# Create a new admin user
cmd /c 'curl -X POST "http://localhost:3000/api/v1/admin/users" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json" -d "{\"email\":\"admin2@pricechecker.com\",\"password\":\"admin123\",\"role\":\"ADMIN\"}"'
```

#### Step 2: Create Super Admin

```bash
# Create a new super admin user  
cmd /c 'curl -X POST "http://localhost:3000/api/v1/admin/users" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json" -d "{\"email\":\"superadmin2@pricechecker.com\",\"password\":\"admin123\",\"role\":\"SUPER_ADMIN\"}"'
```

---

## 📊 Additional Admin Operations

### View Audit Logs

```bash
# Get audit logs to see all admin activities
cmd /c 'curl -X GET "http://localhost:3000/api/v1/admin/audit-logs" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json"'
```

### View System Statistics

```bash
# Get system statistics
cmd /c 'curl -X GET "http://localhost:3000/api/v1/admin/statistics" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json"'
```

---

## 🔧 PowerShell Alternative Commands

If you prefer using PowerShell instead of curl:

### Admin Login (PowerShell)

```powershell
$loginData = @{
    email = "admin@pricechecker.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginData
$token = $response.token
Write-Host "Token: $token"
```

### Get Stores (PowerShell)

```powershell
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$stores = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores" -Method GET -Headers $headers
$stores | ConvertTo-Json -Depth 3
```

---

## 📋 Expected Responses

### Store List Response
```json
{
  "success": true,
  "stores": [
    {
      "id": 1,
      "email": "teststore@example.com",
      "name": "Test Store",
      "status": "PENDING",
      "address": "123 Test Street",
      "phone": "555-0123",
      "latitude": 60.4518,
      "longitude": 22.2666,
      "createdAt": "2025-12-17T..."
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Approval Response
```json
{
  "success": true,
  "message": "Store approved successfully",
  "store": {
    "id": 1,
    "status": "APPROVED",
    ...
  }
}
```

### Admin Creation Response
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "user": {
    "id": 2,
    "email": "admin2@pricechecker.com",
    "role": "ADMIN",
    "createdAt": "2025-12-17T..."
  }
}
```

---

## 🚨 Important Notes

1. **Authentication Required**: All admin endpoints require the Bearer token in the Authorization header.

2. **Role Permissions**:
   - **ADMIN**: Can approve/reject stores, lock/unlock accounts, view audit logs
   - **SUPER_ADMIN**: All admin functions + delete stores + create other admins

3. **Store Status Values**:
   - `PENDING`: Waiting for admin approval
   - `APPROVED`: Active and operational
   - `REJECTED`: Rejected by admin
   - `SUSPENDED`: Temporarily locked by admin

4. **Audit Trail**: All admin actions are logged in the audit system for compliance.

5. **Token Expiration**: Tokens expire after 24 hours. Login again if authentication fails.

---

## ✅ Verification Checklist

- [ ] Admin can view pending store signups
- [ ] Admin can approve store signups  
- [ ] Admin can reject store signups
- [ ] Admin can suspend (lock) store accounts
- [ ] Admin can reactivate (unlock) store accounts
- [ ] Super Admin can delete store accounts
- [ ] Super Admin can create new admin users
- [ ] Super Admin can create new super admin users
- [ ] All actions are logged in audit trail
- [ ] Appropriate error messages for unauthorized access

---

**Testing Complete**: All four admin functionalities are fully implemented and testable through the REST API endpoints.