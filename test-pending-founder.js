/**
 * Verification Test Suite: Registered Pets "Pending" Founder Info Button & Admin Sync
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const SHARED_DB_PATH = path.resolve(__dirname, '..', 'pawtrack-shared-db.json');

async function runTests() {
  console.log('===============================================================');
  console.log('   PAWTRACK TEST: REGISTERED PETS PENDING BUTTON & ADMIN SYNC  ');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, msg) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // 1. Verify CSS rules for pending status
  console.log('--- 1. Verifying CSS Classes ---');
  const cssContent = fs.readFileSync(path.join(__dirname, 'css', 'components.css'), 'utf8');
  assert(cssContent.includes('.badge-pending'), 'badge-pending class is defined in components.css');
  assert(cssContent.includes('.pet-card-matched-pending'), 'pet-card-matched-pending class is defined');
  assert(cssContent.includes('.pending-founder-banner'), 'pending-founder-banner class is defined');
  assert(cssContent.includes('.pending-pulse-dot'), 'pending-pulse-dot class is defined');
  assert(cssContent.includes('.pending-btn-pill'), 'pending-btn-pill class is defined');
  assert(cssContent.includes('.btn-pending-action'), 'btn-pending-action class is defined');

  // 2. Verify i18n bilingual keys
  console.log('\n--- 2. Verifying Bilingual i18n Translations ---');
  const i18nContent = fs.readFileSync(path.join(__dirname, 'js', 'i18n.js'), 'utf8');
  assert(i18nContent.includes("'owner.btnPending': 'Pending'"), 'English owner.btnPending defined');
  assert(i18nContent.includes("'owner.statusPending': 'Found (Pending)'"), 'English owner.statusPending defined');
  assert(i18nContent.includes("'owner.founderFoundAlert': 'Founder Located Your Pet'"), 'English owner.founderFoundAlert defined');
  assert(i18nContent.includes("'owner.statusPending': 'Nakita (Pending)'"), 'Filipino owner.statusPending defined');

  // 3. Verify OwnerView logic
  console.log('\n--- 3. Verifying OwnerView Code Logic ---');
  const ownerViewContent = fs.readFileSync(path.join(__dirname, 'js', 'views', 'owner-view.js'), 'utf8');
  assert(ownerViewContent.includes('showPendingFinderInfo('), 'showPendingFinderInfo method is defined in OwnerView');
  assert(ownerViewContent.includes('matchingSighting'), 'matchingSighting detection logic is implemented in renderPetCard');
  assert(ownerViewContent.includes('pending-founder-banner'), 'pending-founder-banner is rendered in renderPetCard');
  assert(ownerViewContent.includes('pending-btn-pill'), 'pending-btn-pill is rendered in renderPetCard');
  assert(ownerViewContent.includes('btn-pending-action'), 'btn-pending-action is rendered in pet-card-actions');

  // 4. Test Backend Sync & Shared DB Mutation
  console.log('\n--- 4. Verifying Backend & Admin DB Sync ---');
  const testRfid = 'TEST-RFID-998811';
  const testPetId = 'test-pet-pending-' + Date.now();

  const testPet = {
    id: testPetId,
    name: 'Buster Test',
    species: 'Dog',
    breed: 'Golden Retriever',
    gender: 'Male',
    color: 'Golden Amber',
    rfidTag: testRfid,
    microchipNo: '982000109988112',
    status: 'lost',
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d',
    owner: {
      name: 'Maria Santos',
      phone: '+63 917 555 1234',
      address: 'Diliman, Quezon City'
    }
  };

  // POST save_pet to local server
  const savePetRes = await new Promise((resolve) => {
    const data = JSON.stringify({ action: 'save_pet', pet: testPet });
    const req = http.request('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (e) => resolve({ error: e }));
    req.write(data);
    req.end();
  });

  assert(savePetRes.status === 200, `POST /api/sync save_pet succeeded with HTTP ${savePetRes.status}`);

  // Submit Found Sighting with matching RFID
  const testSighting = {
    id: 'SIGHT-TEST-' + Date.now(),
    species: 'Dog',
    breed: 'Golden Retriever',
    location: 'Katipunan Ave, Quezon City',
    coords: [14.6400, 121.0700],
    rfidTag: testRfid,
    reporterPhone: '+63 918 777 4321',
    reporterName: 'Carlos Dalisay',
    comments: 'Found friendly golden dog waiting near the convenience store.',
    timestamp: new Date().toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d',
    reportType: 'found'
  };

  const sightingRes = await new Promise((resolve) => {
    const data = JSON.stringify({ action: 'create_sighting', sighting: testSighting });
    const req = http.request('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (e) => resolve({ error: e }));
    req.write(data);
    req.end();
  });

  assert(sightingRes.status === 200, `POST /api/sync create_sighting succeeded with HTTP ${sightingRes.status}`);

  // Verify shared DB file content
  if (fs.existsSync(SHARED_DB_PATH)) {
    const rawDb = fs.readFileSync(SHARED_DB_PATH, 'utf8');
    const parsedDb = JSON.parse(rawDb);
    const dbSighting = (parsedDb.sightings || []).find(s => s.id === testSighting.id);
    const dbNotif = (parsedDb.notifications || []).find(n => n.rfidTag === testRfid || n.petId === testPetId);
    const dbCase = (parsedDb.cases || []).find(c => c.petId === testPetId || c.rfidTag === testRfid);

    assert(Boolean(dbSighting), 'Sighting was persisted directly into pawtrack-shared-db.json for Admin Portal sync');
    assert(Boolean(dbNotif && dbNotif.type === 'pet_found_match'), 'High-priority pet_found_match notification was created in shared DB');
    assert(Boolean(dbCase && dbCase.status === 'sighted'), 'Pet case status updated to sighted with sighting timeline in shared DB');
    if (dbNotif) {
      assert(dbNotif.finderName === 'Carlos Dalisay', `Founder name recorded accurately: ${dbNotif.finderName}`);
      assert(dbNotif.finderPhone === '+63 918 777 4321', `Founder phone recorded accurately: ${dbNotif.finderPhone}`);
    }
  } else {
    console.error('[FAIL] Shared DB file does not exist at ' + SHARED_DB_PATH);
    failed++;
  }

  // Clean up test pet
  const deletePetRes = await new Promise((resolve) => {
    const data = JSON.stringify({ action: 'delete_pet', petId: testPetId });
    const req = http.request('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode }));
    });
    req.on('error', (e) => resolve({ error: e }));
    req.write(data);
    req.end();
  });

  console.log('\n===============================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================');

  if (failed === 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
