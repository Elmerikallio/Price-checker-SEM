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


 Working Admin Test Commands
1. Get Admin Token (run this first)

$loginData = '{"email":"admin@pricechecker.com","password":"admin123"}'
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginData
$token = $response.token
Write-Host "Admin Token: $token"



## new admin token admin token:
$loginData = '{"email":"admin@pricechecker.com","password":"admin123"}'
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginData
$token = $response.token


eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwcmljZWNoZWNrZXIuY29tIiwidHlwZSI6InVzZXIiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJpYXQiOjE3NjU5NTcxNDcsImV4cCI6MTc2NjA0MzU0N30.810qKeYUsJCXUNl1Dmsb2NX3YqpDjXmWU5UZuFUntCc


2. Create Test Store Signups

# Create first test store
$storeData1 = '{"email":"teststore1@example.com","password":"password123","name":"Test Store 1","address":"123 Test Street","phone":"555-0123","latitude":60.4518,"longitude":22.2666}'
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/signup-store" -Method POST -ContentType "application/json" -Body $storeData1

# Create second test store  
$storeData2 = '{"email":"teststore2@example.com","password":"password123","name":"Test Store 2","address":"456 Second Street","phone":"555-0456","latitude":60.4518,"longitude":22.2666}'
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/signup-store" -Method POST -ContentType "application/json" -Body $storeData2

3. View All Stores (Admin)

$headers = @{"Authorization" = "Bearer $token"}
$stores = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores" -Method GET -Headers $headers
Write-Host "Stores found: $($stores.stores.Count)"
$stores.stores | Format-Table id, name, email, status, address, phone -AutoSize

4. Approve Store Signup

# Replace '1' with actual store ID from the list above
$headers = @{"Authorization" = "Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores/1/approve" -Method POST -Headers $headers
Write-Host "Store 1 approved!"

5. Reject Store Signup

# Replace '2' with actual store ID
$headers = @{"Authorization" = "Bearer $token"}  
$rejectData = '{"reason":"Incomplete documentation"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores/2/reject" -Method POST -Headers $headers -Body $rejectData -ContentType "application/json"
Write-Host "Store 2 rejected!"

6. Suspend (Lock) Store Account

$headers = @{"Authorization" = "Bearer $token"}
$suspendData = '{"reason":"Policy violation"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores/1/suspend" -Method POST -Headers $headers -Body $suspendData -ContentType "application/json"
Write-Host "Store 1 suspended!"

7. Reactivate (Unlock) Store Account

$headers = @{"Authorization" = "Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores/1/reactivate" -Method POST -Headers $headers
Write-Host "Store 1 reactivated!"

8. Delete Store Account (Super Admin Only)

$headers = @{"Authorization" = "Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores/2" -Method DELETE -Headers $headers
Write-Host "Store 2 deleted!"

9. Create New Admin User

$headers = @{"Authorization" = "Bearer $token"}
$adminData = '{"email":"admin2@pricechecker.com","password":"admin123","role":"ADMIN"}'
$newAdmin = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users" -Method POST -Headers $headers -Body $adminData -ContentType "application/json"
Write-Host "New admin created: $($newAdmin.user.email)"

10. Create New Super Admin

$headers = @{"Authorization" = "Bearer $token"}
$superAdminData = '{"email":"superadmin2@pricechecker.com","password":"admin123","role":"SUPER_ADMIN"}'  
$newSuperAdmin = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/users" -Method POST -Headers $headers -Body $superAdminData -ContentType "application/json"
Write-Host "New super admin created: $($newSuperAdmin.user.email)"

11. View System Statistics

$headers = @{"Authorization" = "Bearer $token"}
$stats = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/statistics" -Method GET -Headers $headers
$stats | ConvertTo-Json -Depth 3

12. View Audit Logs

$headers = @{"Authorization" = "Bearer $token"}
$logs = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/audit-logs" -Method GET -Headers $headers
Write-Host "Audit logs found: $($logs.logs.Count)"
$logs.logs | Format-Table action, userId, createdAt -AutoSize

🚀 Complete Test Sequence
Run this complete sequence to test all functionalities:

# 1. Login
$loginData = '{"email":"admin@pricechecker.com","password":"admin123"}'
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginData
$token = $response.token
$headers = @{"Authorization" = "Bearer $token"}

# 2. Create test stores
$storeData1 = '{"email":"teststore1@example.com","password":"password123","name":"Test Store 1","address":"123 Test Street","phone":"555-0123","latitude":60.4518,"longitude":22.2666}'
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/signup-store" -Method POST -ContentType "application/json" -Body $storeData1

# 3. View stores
$stores = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores" -Method GET -Headers $headers
$stores.stores | Format-Table id, name, email, status -AutoSize

Write-Host "✅ All admin functionalities are ready for testing!"


Note: Make sure your server is still running. If not, restart it with:

node src/server.js

These commands will test all four required admin functionalities:

✅ Review store signups
✅ Approve/reject stores
✅ Lock/unlock store accounts
✅ Create admin users