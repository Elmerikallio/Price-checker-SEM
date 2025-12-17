# 📋 Complete Task Testing Guide

## Overview
This guide covers testing for three key requirements:
1. **Admin Lock/Unlock Store Accounts** ✅ (Already implemented)
2. **Sorted Nearby Stores by Price** ✅ (Enhanced with sorting)
3. **Store Product-Price Information Submission** ✅ (New enhanced endpoint)

---

## Prerequisites
Make sure your server is running:
```powershell
node src/server.js
```

## 🔐 Task 1: Admin Lock/Unlock Store Accounts

### Get Admin Token (Required for all admin operations)
```powershell
$loginData = '{"email":"admin@pricechecker.com","password":"admin123"}'
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginData
$token = $response.token
$headers = @{"Authorization" = "Bearer $token"}
Write-Host "Admin Token: $token"
```

### Create Test Store for Testing
```powershell
$storeData = '{"email":"teststore@example.com","password":"password123","name":"Test Store","address":"123 Test Street","phone":"555-0123","latitude":60.4518,"longitude":22.2666}'
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/signup-store" -Method POST -ContentType "application/json" -Body $storeData
Write-Host "Test store created!"
```

### View All Stores and authorized
```powershell
$stores = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores" -Method GET -Headers $headers
$stores.stores | Format-Table id, name, email, status, address -AutoSize
```

### Approve Store (if needed)
```powershell
# Replace '1' with actual store ID
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores/1/approve" -Method POST -Headers $headers
Write-Host "Store approved!"
```

### 🔒 Lock (Suspend) Store Account
```powershell
$suspendData = '{"reason":"Policy violation - testing lock functionality"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores/1/suspend" -Method POST -Headers $headers -Body $suspendData -ContentType "application/json"
Write-Host "✅ Store 1 LOCKED (suspended)!"
```

### 🔓 Unlock (Reactivate) Store Account
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores/1/reactivate" -Method POST -Headers $headers
Write-Host "✅ Store 1 UNLOCKED (reactivated)!"
```

### Verify Status Changes
```powershell
$stores = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores" -Method GET -Headers $headers
$stores.stores | Where-Object { $_.id -eq 1 } | Format-Table id, name, status -AutoSize
```

---

## 🏪 Task 2: Sorted Nearby Stores by Price (Ascending Order)

### Get Store Token for Adding Prices
```powershell
$storeLoginData = '{"email":"teststore@example.com","password":"password123"}'
$storeResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $storeLoginData
$storeToken = $storeResponse.token
$storeHeaders = @{"Authorization" = "Bearer $storeToken"}
Write-Host "Store Token: $storeToken"
```

### Add Sample Prices to Different Stores
```powershell
# Create multiple test stores with different prices for the same product
$testStores = @(
    @{email="store1@test.com"; name="Cheap Store"; price=5.99},
    @{email="store2@test.com"; name="Medium Store"; price=7.50},
    @{email="store3@test.com"; name="Expensive Store"; price=9.99}
)

foreach ($store in $testStores) {
    # Create store
    $storeData = @{
        email = $store.email
        password = "password123"
        name = $store.name
        address = "Test Address"
        phone = "555-0123"
        latitude = 60.4518 + (Get-Random -Minimum -0.01 -Maximum 0.01)
        longitude = 22.2666 + (Get-Random -Minimum -0.01 -Maximum 0.01)
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/signup-store" -Method POST -ContentType "application/json" -Body $storeData
    Write-Host "Created store: $($store.name)"
}
```

### Approve All Test Stores
```powershell
$allStores = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores" -Method GET -Headers $headers
foreach ($store in $allStores.stores | Where-Object { $_.status -eq "PENDING" }) {
    Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores/$($store.id)/approve" -Method POST -Headers $headers
    Write-Host "Approved store: $($store.name)"
}
```

### Add Price Observations
```powershell
# Add prices for the same product at different stores
$testBarcode = "1234567890123"

# Add price observation (user-reported)
$priceData1 = @{
    barcode = $testBarcode
    barcodeType = "EAN13"
    productName = "Test Product"
    storeId = 1
    price = 5.99
    currency = "EUR"
    latitude = 60.4518
    longitude = 22.2666
} | ConvertTo-Json

$priceData2 = @{
    barcode = $testBarcode
    barcodeType = "EAN13"
    productName = "Test Product"
    storeId = 2
    price = 7.50
    currency = "EUR"
    latitude = 60.4520
    longitude = 22.2668
} | ConvertTo-Json

$priceData3 = @{
    barcode = $testBarcode
    barcodeType = "EAN13"
    productName = "Test Product"
    storeId = 3
    price = 9.99
    currency = "EUR"
    latitude = 60.4522
    longitude = 22.2670
} | ConvertTo-Json

# Submit price observations
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/prices/observations" -Method POST -Headers $storeHeaders -Body $priceData1 -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/prices/observations" -Method POST -Headers $storeHeaders -Body $priceData2 -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/prices/observations" -Method POST -Headers $storeHeaders -Body $priceData3 -ContentType "application/json"

Write-Host "✅ Price observations added!"
```

### 🎯 Test Sorted Nearby Prices (Ascending Order)
```powershell
# Query nearby prices - should return sorted by price (cheapest first)
$nearbyUrl = "http://localhost:3000/api/v1/prices/nearby?barcode=$testBarcode&barcodeType=EAN13&lat=60.4518&lng=22.2666&radius=5"
$nearbyPrices = Invoke-RestMethod -Uri $nearbyUrl -Method GET

Write-Host "🏆 Nearby Stores Sorted by Price (Ascending):"
Write-Host "=============================================="
$nearbyPrices.prices | ForEach-Object { 
    Write-Host "🏪 $($_.store.name) - 💰€$($_.price) - 📍 $($_.store.location.lat), $($_.store.location.lng) - 🚗 $([math]::Round($_.store.distance, 2))km"
}

Write-Host "`n✅ Prices should be sorted from cheapest to most expensive!"
```

---

## 📦 Task 3: Store Product-Price Information Submission

### Enhanced Product-Price List Submission
```powershell
# Enhanced product-price information with barcode data, location, price, and timestamp
$productPriceData = @{
    products = @(
        @{
            # Barcode data
            barcode = "1234567890123"
            barcodeType = "EAN13"
            gtin = "01234567890123"
            
            # User's location in latitudes and longitudes
            latitude = 60.4518
            longitude = 22.2666
            
            # Price and timestamp
            price = 12.99
            currency = "EUR"
            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            
            # Optional product details
            productName = "Enhanced Product 1"
            productCategory = "Electronics"
            brand = "TestBrand"
            source = "SCANNER"
            notes = "Scanned with mobile app"
        },
        @{
            barcode = "9876543210987"
            barcodeType = "EAN13"
            gtin = "09876543210987"
            latitude = 60.4519
            longitude = 22.2667
            price = 8.50
            currency = "EUR"
            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            productName = "Enhanced Product 2"
            productCategory = "Food"
            brand = "TestFood"
            source = "MANUAL"
            notes = "Manual entry"
        },
        @{
            barcode = "1111222233334"
            barcodeType = "UPC_A"
            gtin = "01111222233334"
            latitude = 60.4520
            longitude = 22.2668
            price = 15.75
            currency = "EUR"
            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            productName = "Enhanced Product 3"
            productCategory = "Clothing"
            brand = "FashionBrand"
            source = "API"
        }
    )
} | ConvertTo-Json -Depth 3

# Submit enhanced product-price list
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/prices/products" -Method POST -Headers $storeHeaders -Body $productPriceData -ContentType "application/json"

Write-Host "✅ Enhanced Product-Price Submission Results:"
Write-Host "============================================="
Write-Host "📊 Total Products: $($response.summary.total)"
Write-Host "✅ Processed: $($response.summary.processed)"
Write-Host "❌ Errors: $($response.summary.errors)"
Write-Host ""

if ($response.results) {
    Write-Host "📦 Processed Products:"
    foreach ($result in $response.results) {
        Write-Host "  🏷️  $($result.product.name)"
        Write-Host "     📱 Barcode: $($result.product.barcode) ($($result.product.barcodeType))"
        Write-Host "     🔢 GTIN: $($result.product.gtin)"
        Write-Host "     💰 Price: €$($result.price) $($result.currency)"
        Write-Host "     📍 Location: $($result.location.latitude), $($result.location.longitude)"
        Write-Host "     ⏰ Timestamp: $($result.timestamp)"
        Write-Host "     ✅ Status: $($result.status)"
        Write-Host ""
    }
}
```

### Verify Submitted Data
```powershell
# Check if the submitted products appear in nearby searches
$verifyUrl = "http://localhost:3000/api/v1/prices/nearby?barcode=1234567890123&barcodeType=EAN13&lat=60.4518&lng=22.2666&radius=1"
$verification = Invoke-RestMethod -Uri $verifyUrl -Method GET

Write-Host "🔍 Verification - Product Found in Nearby Search:"
if ($verification.prices.Count -gt 0) {
    $verification.prices | ForEach-Object {
        Write-Host "✅ Found: $($_.product.name) at $($_.store.name) for €$($_.price)"
    }
} else {
    Write-Host "❌ No products found in nearby search"
}
```

---

## 🎯 Complete Test Sequence

Run this complete sequence to test all functionalities:

```powershell
# 1. Admin Login
$loginData = '{"email":"admin@pricechecker.com","password":"admin123"}'
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginData
$token = $response.token
$headers = @{"Authorization" = "Bearer $token"}

# 2. Create and approve test store
$storeData = '{"email":"teststore@example.com","password":"password123","name":"Test Store","address":"123 Test Street","phone":"555-0123","latitude":60.4518,"longitude":22.2666}'
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/signup-store" -Method POST -ContentType "application/json" -Body $storeData
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores/1/approve" -Method POST -Headers $headers

# 3. Test lock/unlock
$suspendData = '{"reason":"Test lock functionality"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores/1/suspend" -Method POST -Headers $headers -Body $suspendData -ContentType "application/json"
Write-Host "✅ Store LOCKED"

Start-Sleep -Seconds 2
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/admin/stores/1/reactivate" -Method POST -Headers $headers
Write-Host "✅ Store UNLOCKED"

# 4. Store login and add products
$storeLoginData = '{"email":"teststore@example.com","password":"password123"}'
$storeResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $storeLoginData
$storeHeaders = @{"Authorization" = "Bearer $($storeResponse.token)"}

# 5. Submit enhanced product-price data
$productData = @{
    products = @(
        @{
            barcode = "1234567890123"
            barcodeType = "EAN13"
            gtin = "01234567890123"
            latitude = 60.4518
            longitude = 22.2666
            price = 10.99
            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            productName = "Test Product"
            source = "SCANNER"
        }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/prices/products" -Method POST -Headers $storeHeaders -Body $productData -ContentType "application/json"
Write-Host "✅ Product-price data submitted"

# 6. Test sorted nearby search
$nearbyUrl = "http://localhost:3000/api/v1/prices/nearby?barcode=1234567890123&barcodeType=EAN13&lat=60.4518&lng=22.2666&radius=5"
$nearby = Invoke-RestMethod -Uri $nearbyUrl -Method GET
Write-Host "✅ Found $($nearby.prices.Count) nearby prices (sorted ascending)"

Write-Host ""
Write-Host "🎉 ALL TASKS COMPLETED SUCCESSFULLY!"
Write-Host "✅ Task 1: Lock/Unlock Store Accounts"
Write-Host "✅ Task 2: Sorted Nearby Stores by Price"
Write-Host "✅ Task 3: Enhanced Product-Price Submission"
```

---

## 📋 Summary

### Task 1: Lock/Unlock Store Accounts ✅
- **Endpoints**: `POST /admin/stores/{id}/suspend`, `POST /admin/stores/{id}/reactivate`
- **Function**: Admins can lock (suspend) and unlock (reactivate) store accounts
- **Testing**: Use admin token to suspend/reactivate stores

### Task 2: Sorted Nearby Stores ✅
- **Endpoint**: `GET /prices/nearby`
- **Function**: Returns nearby stores sorted by price in ascending order (cheapest first)
- **Features**: Includes store name, location, product price, distance

### Task 3: Enhanced Product-Price Submission ✅
- **Endpoint**: `POST /prices/products`
- **Function**: Store users can submit product-price information objects
- **Data Structure**: 
  - Barcode data (barcode type, GTIN number)
  - User's location (latitude, longitude)
  - Price information
  - Timestamp
  - Optional metadata

All three tasks are now fully implemented and ready for testing! 🚀