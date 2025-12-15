# 🚀 Deployment Guide

Complete deployment guide for Price Checker SEM backend service with Docker, HTTPS, and multi-platform support.

## 📋 Prerequisites

### Required Software
- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** v2.0+
- **Git** for cloning the repository

### System Requirements
- **Memory**: 2GB RAM minimum, 4GB recommended
- **Storage**: 5GB free disk space
- **Ports**: 80 (HTTP), 443 (HTTPS), 3000 (direct API), 3306 (MySQL)

## 🏗️ Deployment Options

### 1. Quick Start (Recommended)

#### Windows
```batch
# Clone repository
git clone https://github.com/Elmerikallio/Price-checker-SEM.git
cd Price-checker-SEM

# Run deployment script
scripts\deploy.bat production
```

#### Linux/macOS/WSL
```bash
# Clone repository
git clone https://github.com/Elmerikallio/Price-checker-SEM.git
cd Price-checker-SEM

# Make script executable and run
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

### 2. Manual Deployment

```bash
# 1. Environment setup
cp .env.example .env.production
# Edit .env.production with your values

# 2. Generate SSL certificates (development only)
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/server.key \
    -out nginx/ssl/server.crt \
    -subj "/C=FI/ST=Southwest Finland/L=Turku/O=TUAS/CN=localhost"

# 3. Deploy with Docker Compose
docker-compose --env-file .env.production up -d --build

# 4. Run database migrations
docker-compose exec app npm run db:deploy
```

## 🔧 Configuration

### Environment Variables (.env.production)

**Critical Settings** (Change these!)
```env
JWT_SECRET="your-super-secure-jwt-secret-min-32-characters-long"
MYSQL_ROOT_PASSWORD="your-strong-mysql-root-password"
CORS_ORIGIN="https://yourdomain.com"
```

**Database Configuration**
```env
DATABASE_URL="mysql://app_user:app_password@mysql:3306/price_checker"
```

**Security Settings**
```env
NODE_ENV="production"
LOG_LEVEL="warn"
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX_REQUESTS=50
```

### SSL/TLS Configuration

#### Development (Self-Signed)
The deployment script automatically generates self-signed certificates for development.

#### Production (Let's Encrypt)
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com

# Copy to nginx directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/server.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/server.key
```

#### Production (Custom Certificates)
Place your certificates in:
- `nginx/ssl/server.crt` (certificate)
- `nginx/ssl/server.key` (private key)

## 🌐 Network & Security

### Port Configuration
- **80** → Redirects to HTTPS
- **443** → HTTPS API access
- **3000** → Direct API access (development)
- **3306** → MySQL (internal network only)

### Security Features
- **HTTPS by default** with security headers
- **Rate limiting** (configurable)
- **CORS protection** (whitelist domains)
- **SQL injection protection** (Prisma ORM)
- **JWT token security** with expiration
- **Non-root container** execution

### Firewall Rules (Production)
```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3000/tcp  # Block direct API access
sudo ufw deny 3306/tcp  # Block direct DB access
```

## 🏢 Platform-Specific Deployment

### 1. Linux (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Deploy
git clone https://github.com/Elmerikallio/Price-checker-SEM.git
cd Price-checker-SEM
./scripts/deploy.sh production
```

### 2. Windows 10/11

```powershell
# Install Docker Desktop from https://docker.com/products/docker-desktop
# Ensure WSL2 is enabled

# Clone and deploy
git clone https://github.com/Elmerikallio/Price-checker-SEM.git
cd Price-checker-SEM
scripts\\deploy.bat production
```

### 3. macOS

```bash
# Install Docker Desktop from https://docker.com/products/docker-desktop

# Deploy using script
git clone https://github.com/Elmerikallio/Price-checker-SEM.git
cd Price-checker-SEM
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

### 4. Cloud Platforms

#### AWS EC2
```bash
# Launch Ubuntu 20.04 LTS instance
# Security group: Allow ports 80, 443, 22

# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-ip

# Follow Linux deployment steps above
```

#### Google Cloud Platform
```bash
# Create Compute Engine instance
gcloud compute instances create price-checker \
    --image-family=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud \
    --machine-type=e2-medium \
    --tags=http-server,https-server

# SSH and deploy
gcloud compute ssh price-checker
# Follow Linux deployment steps
```

#### Azure VM
```bash
# Create Ubuntu VM via Azure Portal
# Allow ports 80, 443 in NSG

# Connect and deploy
ssh azureuser@your-vm-ip
# Follow Linux deployment steps
```

## 🔍 Testing & Validation

### Health Checks
```bash
# Production (HTTPS)
curl -k https://localhost/api/v1/health

# Development (HTTP)
curl http://localhost:3000/api/v1/health
```

### API Testing
```bash
# Test user registration
curl -k -X POST https://localhost/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### Load Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test 1000 requests, 10 concurrent
ab -n 1000 -c 10 https://localhost/api/v1/health
```

## 📊 Monitoring & Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f nginx
docker-compose logs -f mysql

# Nginx access logs
tail -f logs/nginx/access.log
```

### Database Management
```bash
# Access Prisma Studio (Database GUI)
docker-compose exec app npm run db:studio
# Open http://localhost:5555

# Direct MySQL access
docker-compose exec mysql mysql -u root -p price_checker
```

### System Monitoring
```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean up unused resources
docker system prune -f
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :443

# Kill process
sudo kill -9 <PID>
```

#### SSL Certificate Issues
```bash
# Regenerate self-signed certificates
rm -rf nginx/ssl/*
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/server.key \
    -out nginx/ssl/server.crt \
    -subj "/C=FI/ST=Finland/L=Turku/O=TUAS/CN=localhost"
```

#### Database Connection Issues
```bash
# Check MySQL container
docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES;"

# Reset database
docker-compose down -v
docker-compose up -d mysql
docker-compose exec app npm run db:deploy
```

#### Container Won't Start
```bash
# Check logs for errors
docker-compose logs app

# Rebuild without cache
docker-compose build --no-cache app
docker-compose up -d
```

## 🔄 Updates & Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d

# Run any new migrations
docker-compose exec app npm run db:deploy
```

### Backup & Restore
```bash
# Backup database
docker-compose exec mysql mysqldump -u root -p price_checker > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u root -p price_checker < backup.sql
```

### SSL Certificate Renewal
```bash
# Let's Encrypt renewal (if using certbot)
sudo certbot renew

# Copy renewed certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/server.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/server.key

# Restart nginx
docker-compose restart nginx
```

## 📝 Production Checklist

### Before Going Live
- [ ] Change all default passwords and secrets
- [ ] Configure proper CORS origins
- [ ] Set up real SSL certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Create backup strategy
- [ ] Test all API endpoints
- [ ] Perform load testing
- [ ] Document rollback procedures

### Security Hardening
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable fail2ban for SSH protection
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Implement proper logging and alerting
- [ ] Regular database backups
- [ ] Network segmentation

---

**🎓 Academic Project**: Turku University of Applied Sciences  
**📚 Course**: Software Engineering and Modelling - TeamWork  
**📅 Last Updated**: December 14, 2025