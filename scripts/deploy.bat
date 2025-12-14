@echo off
setlocal enabledelayedexpansion

echo 🚀 Price Checker SEM Deployment Script (Windows)
echo ===============================================

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Environment setup
set "ENVIRONMENT=%1"
if "%ENVIRONMENT%"=="" set "ENVIRONMENT=production"
echo 📋 Environment: %ENVIRONMENT%

REM Validate environment
if not "%ENVIRONMENT%"=="production" if not "%ENVIRONMENT%"=="development" (
    echo ❌ Invalid environment. Use 'production' or 'development'
    pause
    exit /b 1
)

REM Check environment file
if "%ENVIRONMENT%"=="production" (
    set "ENV_FILE=.env.production"
) else (
    set "ENV_FILE=.env"
)

if not exist "%ENV_FILE%" (
    echo ❌ Environment file %ENV_FILE% not found. Please create it from .env.example
    pause
    exit /b 1
)

REM Create directories
if not exist "nginx\ssl" mkdir "nginx\ssl"
if not exist "logs\nginx" mkdir "logs\nginx"

REM Generate SSL certificates if not exist (requires OpenSSL or use Docker)
if not exist "nginx\ssl\server.crt" (
    echo 🔐 Generating self-signed SSL certificates...
    docker run --rm -v "%cd%\nginx\ssl:/certs" alpine/openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /certs/server.key -out /certs/server.crt -subj "/C=FI/ST=Southwest Finland/L=Turku/O=TUAS/OU=SEM/CN=localhost"
    echo ✅ SSL certificates generated
)

REM Build and start services
echo 🔨 Building and starting services...

if "%ENVIRONMENT%"=="development" (
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml --env-file "%ENV_FILE%" up --build -d
) else (
    docker-compose --env-file "%ENV_FILE%" up --build -d
)

REM Wait for services
echo ⏳ Waiting for services to be ready...
timeout /t 10 >nul

REM Run database migrations
echo 🗄️ Running database migrations...
docker-compose exec app npm run db:deploy

REM Seed database if development
if "%ENVIRONMENT%"=="development" (
    echo 🌱 Seeding development database...
    docker-compose exec app npm run db:seed 2>nul || echo ⚠️ Seeding failed or already completed
)

REM Health check
echo 🏥 Performing health check...
timeout /t 5 >nul

if "%ENVIRONMENT%"=="production" (
    curl -k https://localhost/api/v1/health 2>nul || echo ⚠️ Health check failed - service may still be starting
) else (
    curl http://localhost:3000/api/v1/health 2>nul || echo ⚠️ Health check failed - service may still be starting
)

echo.
echo ✅ Deployment completed!
echo.
echo 📡 Service URLs:
if "%ENVIRONMENT%"=="production" (
    echo    🔒 HTTPS API: https://localhost/api/v1/
    echo    📊 Health:   https://localhost/api/v1/health
) else (
    echo    🔓 HTTP API:  http://localhost:3000/api/v1/
    echo    📊 Health:   http://localhost:3000/api/v1/health
)
echo.
echo 📋 Management Commands:
echo    docker-compose logs -f           # View logs
echo    docker-compose exec app npm run db:studio  # Database UI
echo    docker-compose down              # Stop services
echo    docker-compose down -v          # Stop and remove data
echo.
echo 🎯 Ready for testing!
pause