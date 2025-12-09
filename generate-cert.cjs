#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certDir = path.join(__dirname, '.certs');
const keyFile = path.join(certDir, 'key.pem');
const certFile = path.join(certDir, 'cert.pem');

// Create .certs directory if it doesn't exist
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// Check if certificates already exist
if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
  console.log('✅ SSL certificates already exist');
  process.exit(0);
}

console.log('🔐 Generating self-signed SSL certificates...');

try {
  // Generate self-signed certificate valid for 365 days
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout "${keyFile}" -out "${certFile}" -days 365 -nodes -subj "/CN=localhost"`,
    { stdio: 'inherit' }
  );
  console.log('✅ SSL certificates generated successfully');
  console.log(`   Key: ${keyFile}`);
  console.log(`   Cert: ${certFile}`);
} catch (error) {
  console.error('❌ Failed to generate certificates');
  console.error('Make sure OpenSSL is installed and in your PATH');
  process.exit(1);
}
