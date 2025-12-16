# 📋 How to Present Functional Requirement #1: User Management

### Step A: Admin Login
cmd /c 'curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@pricechecker.com\",\"password\":\"admin123\"}"'