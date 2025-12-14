/**
 * Test Runner Script
 * Utility for running different test suites and generating reports
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

class TestRunner {
  constructor() {
    this.results = {
      unit: null,
      integration: null,
      coverage: null
    };
  }

  /**
   * Run all tests
   */
  async runAll() {
    console.log('🏃 Running Price Checker SEM Test Suite\n');
    console.log('========================================\n');

    try {
      await this.runUnitTests();
      await this.runIntegrationTests();
      await this.generateCoverageReport();
      this.printSummary();
    } catch (error) {
      console.error('❌ Test run failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Run unit tests only
   */
  async runUnitTests() {
    console.log('🔍 Running Unit Tests...');
    this.results.unit = await this.runJest('--testPathPattern=unit');
  }

  /**
   * Run integration tests only
   */
  async runIntegrationTests() {
    console.log('\n🔗 Running Integration Tests...');
    this.results.integration = await this.runJest('--testPathPattern=integration');
  }

  /**
   * Generate coverage report
   */
  async generateCoverageReport() {
    console.log('\n📊 Generating Coverage Report...');
    this.results.coverage = await this.runJest('--coverage --watchAll=false');
  }

  /**
   * Run Jest with specific arguments
   */
  runJest(args = '') {
    return new Promise((resolve, reject) => {
      const jest = spawn('npx', ['jest', ...args.split(' ')], {
        stdio: 'inherit',
        shell: true
      });

      jest.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, code });
        } else {
          resolve({ success: false, code });
        }
      });

      jest.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Print test summary
   */
  printSummary() {
    console.log('\n📊 Test Summary');
    console.log('================');
    
    const unitStatus = this.results.unit?.success ? '✅ PASSED' : '❌ FAILED';
    const integrationStatus = this.results.integration?.success ? '✅ PASSED' : '❌ FAILED';
    const coverageStatus = this.results.coverage?.success ? '✅ GENERATED' : '❌ FAILED';
    
    console.log(`Unit Tests:        ${unitStatus}`);
    console.log(`Integration Tests:  ${integrationStatus}`);
    console.log(`Coverage Report:    ${coverageStatus}`);
    
    const allPassed = this.results.unit?.success && 
                     this.results.integration?.success && 
                     this.results.coverage?.success;
    
    if (allPassed) {
      console.log('\n🎉 All tests passed successfully!');
      console.log('Coverage report available in coverage/index.html');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the output above.');
      process.exit(1);
    }
  }

  /**
   * Clean test artifacts
   */
  async clean() {
    console.log('🧹 Cleaning test artifacts...');
    
    const dirsToClean = ['coverage', 'test.db'];
    
    for (const dir of dirsToClean) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`Removed ${dir}`);
      }
    }
    
    console.log('✅ Cleanup completed');
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner();
  const command = process.argv[2];

  switch (command) {
    case 'unit':
      runner.runUnitTests();
      break;
    case 'integration':
      runner.runIntegrationTests();
      break;
    case 'coverage':
      runner.generateCoverageReport();
      break;
    case 'clean':
      runner.clean();
      break;
    case 'all':
    default:
      runner.runAll();
      break;
  }
}

export default TestRunner;