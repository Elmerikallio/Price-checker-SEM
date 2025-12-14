#!/bin/bash

# Price Checker SEM - Deployment Script
# Supports Linux, macOS, and Windows (WSL)

set -e

echo "🚀 Price Checker SEM Deployment Script"
echo "======================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Environment setup
ENVIRONMENT=${1:-production}
echo "📋 Environment: $ENVIRONMENT"

# Validate environment
if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "development" ]; then
    echo "❌ Invalid environment. Use 'production' or 'development'"
    exit 1
fi

# Check environment file
if [ "$ENVIRONMENT" = "production" ]; then
    ENV_FILE=".env.production"
else
    ENV_FILE=".env"
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file $ENV_FILE not found. Please create it from .env.example"
    exit 1
fi

# Generate SSL certificates if not exist (for development)
if [ ! -d "nginx/ssl" ]; then
    echo "🔐 Generating self-signed SSL certificates..."
    mkdir -p nginx/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/server.key \
        -out nginx/ssl/server.crt \
        -subj "/C=FI/ST=Southwest Finland/L=Turku/O=TUAS/OU=SEM/CN=localhost"
    echo "✅ SSL certificates generated"
fi

# Create logs directory
mkdir -p logs/nginx

# Build and start services
echo "🔨 Building and starting services..."

if [ "$ENVIRONMENT" = "development" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml --env-file "$ENV_FILE" up --build -d
else
    docker-compose --env-file "$ENV_FILE" up --build -d
fi

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec app npm run db:deploy

# Seed database if development
if [ "$ENVIRONMENT" = "development" ]; then
    echo "🌱 Seeding development database..."
    docker-compose exec app npm run db:seed || echo "⚠️ Seeding failed or already completed"
fi

# Health check
echo "🏥 Performing health check..."
sleep 5

if [ "$ENVIRONMENT" = "production" ]; then
    HEALTH_URL="https://localhost/api/v1/health"
    curl -k $HEALTH_URL || echo "⚠️ Health check failed - service may still be starting"
else
    HEALTH_URL="http://localhost:3000/api/v1/health"
    curl $HEALTH_URL || echo "⚠️ Health check failed - service may still be starting"
fi

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📡 Service URLs:"
if [ "$ENVIRONMENT" = "production" ]; then
    echo "   🔒 HTTPS API: https://localhost/api/v1/"
    echo "   📊 Health:   https://localhost/api/v1/health"
else
    echo "   🔓 HTTP API:  http://localhost:3000/api/v1/"
    echo "   📊 Health:   http://localhost:3000/api/v1/health"
fi
echo ""
echo "📋 Management Commands:"
echo "   docker-compose logs -f           # View logs"
echo "   docker-compose exec app npm run db:studio  # Database UI"
echo "   docker-compose down              # Stop services"
echo "   docker-compose down -v          # Stop and remove data"
echo ""
echo "🎯 Ready for testing!"