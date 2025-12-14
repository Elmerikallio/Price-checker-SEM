/**
 * Jest Global Setup
 * Runs once before all tests
 */

export default async function globalSetup() {
  // Set Node.js experimental features
  process.env.NODE_OPTIONS = '--experimental-vm-modules';
  
  console.log('🔧 Setting up test environment...');
  
  // Any global setup logic here
  return Promise.resolve();
}
