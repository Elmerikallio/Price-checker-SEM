# 🚀 Server Startup Script
# This script ensures the server starts properly and stays running

Write-Host "🚀 Starting Price Checker Server..." -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Kill any existing node processes
Write-Host "🔧 Cleaning up existing processes..." -ForegroundColor Cyan
Get-Process | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Check if the database is running
Write-Host "🔍 Checking database connection..." -ForegroundColor Cyan
try {
    mysql -h localhost -P 3307 -u app_user -p'app_password' -e "SELECT 1;" | Out-Null
    Write-Host "✅ Database is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Database connection failed. Make sure MySQL is running." -ForegroundColor Red
    Write-Host "   Try: docker compose up -d" -ForegroundColor Yellow
    exit 1
}

# Start the server
Write-Host "🚀 Starting Node.js server..." -ForegroundColor Cyan
Write-Host "   Server will start at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Run the server
node src/server.js