# Test the admin login
$loginData = '{"email":"admin@pricechecker.com","password":"admin123"}'

Write-Host "Testing admin login..."
Write-Host "Login data: $loginData"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginData -TimeoutSec 5
    Write-Host "✅ SUCCESS! Login worked!"
    Write-Host "Response:"
    $response | ConvertTo-Json -Depth 3
    
    if ($response.token) {
        Write-Host ""
        Write-Host "🎯 Token: $($response.token)"
        Write-Host ""
        Write-Host "You can now use this token for admin operations!"
    }
} catch {
    Write-Host "❌ LOGIN FAILED:"
    Write-Host "Error: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseContent = $reader.ReadToEnd()
        Write-Host "Response: $responseContent"
    }
}