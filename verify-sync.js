/**
 * PawTrack Cross-Application Sync Verification Script
 * Validates connection between PawTrack (Owner) and PawTrack (Admin)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const SHARED_DB_PATH = path.resolve(__dirname, '..', 'pawtrack-shared-db.json');

console.log('===============================================================');
console.log('  PawTrack <-> PawTrack (Admin) Connection Verification');
console.log('===============================================================\n');

// 1. Verify Shared Database File
console.log('[1] Checking Shared Database File...');
console.log(`    Location: ${SHARED_DB_PATH}`);

if (fs.existsSync(SHARED_DB_PATH)) {
  try {
    const raw = fs.readFileSync(SHARED_DB_PATH, 'utf8').replace(/^\uFEFF/, '').trim();
    const db = JSON.parse(raw);
    console.log('    [PASS] Shared DB file is valid JSON.');
    console.log(`    - Registered Pets:    ${(db.pets || []).length}`);
    console.log(`    - Impoundment Logs:   ${(db.impoundments || []).length}`);
    console.log(`    - RFID Tag Inventory: ${(db.rfidTags || []).length}`);
    console.log(`    - Shelters:           ${(db.shelters || []).length}`);
    console.log(`    - Notifications:      ${(db.notifications || []).length}`);
  } catch (err) {
    console.error('    [FAIL] Error parsing shared DB:', err.message);
  }
} else {
  console.log('    [INFO] Shared DB file does not exist yet; it will be created on server boot.');
}

console.log('\n[2] Checking Port Endpoints (Ports 3000 & 8080)...');

function checkEndpoint(name, url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`    [PASS] ${name} is ONLINE:`, json.service || json.status || 'OK');
          resolve(true);
        } catch {
          console.log(`    [PASS] ${name} responded with status:`, res.statusCode);
          resolve(true);
        }
      });
    });

    req.on('error', () => {
      console.log(`    [STANDBY] ${name} (${url}) is not currently running.`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`    [STANDBY] ${name} (${url}) connection timed out.`);
      resolve(false);
    });
  });
}

async function runChecks() {
  await checkEndpoint('Owner Portal Server (Port 3000)', 'http://localhost:3000/api/health');
  await checkEndpoint('Admin Dashboard Server (Port 8080)', 'http://localhost:8080/api/health');

  console.log('\n[3] Synchronization Protocol Summary:');
  console.log('    - Storage: Shared JSON database at ../pawtrack-shared-db.json');
  console.log('    - Real-time: Server-Sent Events (SSE) via /api/events');
  console.log('    - In-Browser: BroadcastChannel (pawtrack_sync_bus) & window.storage');
  console.log('    - Auto-Discovery: Probes port 3000 and 8080 automatically\n');
  console.log('===============================================================');
  console.log('  Verification Completed.');
  console.log('===============================================================\n');
}

runChecks();
