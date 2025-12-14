#!/usr/bin/env node

/**
 * Deployment Validation Script
 * Validates the deployment environment and configuration
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

class DeploymentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.environment = process.argv[2] || 'production';
  }

  async validate() {
    console.log(`\n🔍 Validating ${this.environment} deployment...\n`);

    await this.checkDocker();
    await this.checkEnvironmentFile();
    await this.checkSSLCertificates();
    await this.checkServices();
    await this.checkHealthEndpoint();
    await this.checkDatabaseConnection();
    
    this.printSummary();
    return this.errors.length === 0;
  }

  async checkDocker() {
    try {
      execSync('docker --version', { stdio: 'pipe' });
      log.success('Docker is installed');
      
      execSync('docker-compose --version', { stdio: 'pipe' });
      log.success('Docker Compose is available');
    } catch (error) {
      this.errors.push('Docker or Docker Compose is not installed');
      log.error('Docker or Docker Compose is not installed');
    }
  }

  async checkEnvironmentFile() {
    const envFile = this.environment === 'production' ? '.env.production' : '.env';
    
    if (!fs.existsSync(envFile)) {
      this.errors.push(`Environment file ${envFile} not found`);
      log.error(`Environment file ${envFile} not found`);
      return;
    }
    
    log.success(`Environment file ${envFile} exists`);
    
    const envContent = fs.readFileSync(envFile, 'utf8');
    const requiredVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'NODE_ENV'
    ];
    
    for (const varName of requiredVars) {
      if (!envContent.includes(varName)) {
        this.warnings.push(`${varName} not found in ${envFile}`);
        log.warning(`${varName} not found in ${envFile}`);
      }
    }
    
    // Check JWT secret strength
    const jwtMatch = envContent.match(/JWT_SECRET=["']?([^"'\n]+)["']?/);
    if (jwtMatch && jwtMatch[1].length < 32) {
      this.warnings.push('JWT_SECRET should be at least 32 characters long');
      log.warning('JWT_SECRET should be at least 32 characters long');
    }
  }

  async checkSSLCertificates() {
    const sslDir = 'nginx/ssl';
    const certFile = path.join(sslDir, 'server.crt');
    const keyFile = path.join(sslDir, 'server.key');
    
    if (!fs.existsSync(sslDir)) {
      this.warnings.push('SSL directory not found');
      log.warning('SSL directory not found');
      return;
    }
    
    if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
      this.warnings.push('SSL certificates not found');
      log.warning('SSL certificates not found');
    } else {
      log.success('SSL certificates found');
    }
  }

  async checkServices() {
    try {
      const output = execSync('docker-compose ps', { encoding: 'utf8' });
      
      const services = ['app', 'mysql'];
      if (this.environment === 'production') {
        services.push('nginx');
      }
      
      for (const service of services) {
        if (output.includes(service) && output.includes('Up')) {
          log.success(`${service} service is running`);
        } else {
          this.errors.push(`${service} service is not running`);
          log.error(`${service} service is not running`);
        }
      }
    } catch (error) {
      this.warnings.push('Could not check service status');
      log.warning('Could not check service status');
    }
  }

  async checkHealthEndpoint() {
    const urls = this.environment === 'production' 
      ? ['https://localhost/api/v1/health', 'http://localhost:3000/api/v1/health']
      : ['http://localhost:3000/api/v1/health'];
    
    let healthOk = false;
    
    for (const url of urls) {
      try {
        await this.makeRequest(url);
        log.success(`Health check passed: ${url}`);
        healthOk = true;
        break;
      } catch (error) {
        log.warning(`Health check failed: ${url}`);
      }
    }
    
    if (!healthOk) {
      this.errors.push('Health endpoint is not accessible');
      log.error('Health endpoint is not accessible');
    }
  }

  async checkDatabaseConnection() {
    try {
      execSync('docker-compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "SELECT 1;"', 
        { stdio: 'pipe' });
      log.success('Database connection successful');
    } catch (error) {
      this.warnings.push('Could not verify database connection');
      log.warning('Could not verify database connection');
    }
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https:') ? https : http;
      const options = {
        rejectUnauthorized: false, // Allow self-signed certificates
        timeout: 5000
      };
      
      const req = client.get(url, options, (res) => {
        if (res.statusCode === 200) {
          resolve(res);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Timeout')));
    });
  }

  printSummary() {
    console.log('\n📊 Validation Summary:');
    console.log('=====================');
    
    if (this.errors.length === 0) {
      log.success(`Deployment validation passed for ${this.environment}`);
    } else {
      log.error(`Deployment validation failed with ${this.errors.length} errors`);
      this.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  ${this.warnings.length} warnings:`);
      this.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    console.log('');
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DeploymentValidator();
  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

export default DeploymentValidator;