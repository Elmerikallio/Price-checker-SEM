# 📋 How to Present Functional Requirement #1: User Management
### take admin token
$loginData = '{"email":"admin@pricechecker.com","password":"admin123"}'; $response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginData; Write-Host "Login Response:"; $response | ConvertTo-Json -Depth 3; Write-Host "`nToken: $($response.token)"

## Step A: Admin Login
```bash
cmd /c 'curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@pricechecker.com\",\"password\":\"admin123\"}"'
```
**Expected Response:** `{"success": true, "token": "JWT_TOKEN", ...}`

## 1. Review Sign-up Requests from Store Users ✅

### Create a test store signup:
```bash
cmd /c 'curl -X POST "http://localhost:3000/api/v1/auth/signup-store" -H "Content-Type: application/json" -d "{\"email\":\"teststore@example.com\",\"password\":\"password123\",\"name\":\"Test Store\",\"address\":\"123 Test Street\",\"phone\":\"555-0123\",\"latitude\":60.4518,\"longitude\":22.2666}"'
```

### Admin reviews all pending signups:
```bash
cmd /c 'curl -X GET "http://localhost:3000/api/v1/admin/stores" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5Mjk1MzcsImV4cCI6MTc2NjAxNTkzN30.yy2_mRYskvxCgd74elRaPp77VZ7Kl124tWx-1XRMcKk" -H "Content-Type: application/json"'
```

### Approve the store:
```bash
cmd /c 'curl -X POST "http://localhost:3000/api/v1/admin/stores/1/approve" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json"'
```

## 2. Lock and Unlock Store User Accounts ✅

### Lock (suspend) a store account:
```bash
cmd /c 'curl -X POST "http://localhost:3000/api/v1/admin/stores/1/suspend" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json" -d "{\"reason\":\"Policy violation\"}"'
```

### Unlock (reactivate) the store account:
```bash
cmd /c 'curl -X POST "http://localhost:3000/api/v1/admin/stores/1/reactivate" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json"'
```

## 3. Remove Store User Accounts ✅

### Remove (soft delete) a store account:
```bash
cmd /c 'curl -X DELETE "http://localhost:3000/api/v1/admin/stores/1" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json"'
```

## 4. Create Another Backend Administrator ✅

### Create a regular admin:
```bash
cmd /c 'curl -X POST "http://localhost:3000/api/v1/admin/users" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json" -d "{\"email\":\"admin2@pricechecker.com\",\"password\":\"admin123\",\"role\":\"ADMIN\"}"'
```

### Create a super admin:
```bash
cmd /c 'curl -X POST "http://localhost:3000/api/v1/admin/users" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json" -d "{\"email\":\"superadmin2@pricechecker.com\",\"password\":\"admin123\",\"role\":\"SUPER_ADMIN\"}"'
```

## 📊 Bonus: View Admin Audit Logs
```bash
cmd /c 'curl -X GET "http://localhost:3000/api/v1/admin/audit-logs" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5MjY1NDAsImV4cCI6MTc2NjAxMjk0MH0.46Vn6tmI7X76dFftMuYebsYzBXMgEoc3MI4B7yJRFw0" -H "Content-Type: application/json"'
```

---

## ✅ All Four Requirements Implemented & Tested
1. ✅ **Admin reviews store sign-up requests** → `GET /admin/stores` + `POST /admin/stores/{id}/approve`
2. ✅ **Admin locks/unlocks store accounts** → `POST /admin/stores/{id}/suspend` + `POST /admin/stores/{id}/reactivate`  
3. ✅ **Admin removes store accounts** → `DELETE /admin/stores/{id}`
4. ✅ **Admin creates other administrators** → `POST /admin/users` with role: ADMIN or SUPER_ADMIN

**Comprehensive audit logging included for all operations!** 🎯