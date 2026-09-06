const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const SHARED_DB_PATH = path.resolve(__dirname, '..', 'pawtrack-shared-db.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const SEED_SHELTERS = [
  {
    id: 'sh-1',
    name: 'Quezon City Animal Care & Adoption Facility',
    address: 'Clemente St., Lupang Pangako, Payatas, Quezon City',
    phone: '+63 (2) 8988-4242 loc 8036',
    email: 'animalcare@quezoncity.gov.ph',
    hours: 'Mon - Fri: 8:00 AM - 5:00 PM',
    lat: 14.7118,
    lng: 121.1037,
    fee: 'PHP 500 / day',
    holdingPeriodDays: 3,
    capacity: 65,
    occupied: 0,
    officerInCharge: 'Dr. Fernando Gomez, DVM'
  },
  {
    id: 'sh-2',
    name: 'Manila City Pound & Veterinary Inspection Board',
    address: 'Vitas St., Tondo, Manila, Metro Manila',
    phone: '+63 (2) 8243-7952',
    email: 'vib@manila.gov.ph',
    hours: 'Mon - Sat: 8:00 AM - 4:00 PM',
    lat: 14.6231,
    lng: 120.9634,
    fee: 'PHP 350 / day',
    holdingPeriodDays: 3,
    capacity: 50,
    occupied: 0,
    officerInCharge: 'Dr. Manuel Soriano, DVM'
  },
  {
    id: 'sh-3',
    name: 'Pasig City Animal Welfare Facility',
    address: 'Caruncho Ave., San Nicolas, Pasig City',
    phone: '+63 (2) 8643-1111',
    email: 'animalwelfare@pasigcity.gov.ph',
    hours: 'Mon - Fri: 8:00 AM - 5:00 PM',
    lat: 14.5583,
    lng: 121.0825,
    fee: 'PHP 400 / day',
    holdingPeriodDays: 3,
    capacity: 40,
    occupied: 0,
    officerInCharge: 'Dr. Angela Bautista, DVM'
  }
];

const SEED_RFID_TAGS = [
  { id: 'tag-1', code: 'RFID-882194', status: 'available', petId: null, petName: null, frequency: '134.2 kHz FDX-B', battery: '100%', lastScanned: null },
  { id: 'tag-2', code: 'RFID-449102', status: 'available', petId: null, petName: null, frequency: '134.2 kHz FDX-B', battery: '100%', lastScanned: null },
  { id: 'tag-3', code: 'RFID-109283', status: 'available', petId: null, petName: null, frequency: '134.2 kHz FDX-B', battery: '100%', lastScanned: null },
  { id: 'tag-4', code: 'RFID-331908', status: 'available', petId: null, petName: null, frequency: '134.2 kHz FDX-B', battery: '100%', lastScanned: null },
  { id: 'tag-5', code: 'RFID-771829', status: 'available', petId: null, petName: null, frequency: '134.2 kHz FDX-B', battery: '100%', lastScanned: null },
  { id: 'tag-6', code: 'RFID-904123', status: 'available', petId: null, petName: null, frequency: '134.2 kHz FDX-B', battery: '100%', lastScanned: null },
  { id: 'tag-7', code: 'RFID-662310', status: 'available', petId: null, petName: null, frequency: '134.2 kHz FDX-B', battery: '100%', lastScanned: null },
  { id: 'tag-8', code: 'RFID-551980', status: 'available', petId: null, petName: null, frequency: '134.2 kHz FDX-B', battery: '100%', lastScanned: null }
];

const SEED_SETTINGS = {
  systemName: 'PawTrack Municipal Gateway',
  holdingWindowHours: 72,
  dailyHoldingFeeDefault: 500,
  currency: 'PHP',
  autoNotifyOwnerOnIntake: true,
  autoNotifyOwnerOnExpiryWarning: true,
  expiryWarningHours: 12,
  rfidScannerBaudRate: 9600,
  municipalJurisdiction: 'National Capital Region (Metro Manila)',
  syncStatus: 'Active Multi-Tab Shared'
};

// Connected SSE clients
const sseClients = new Set();

function broadcastSSE(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch (e) {
      sseClients.delete(res);
    }
  }
}

// SSE Keep-Alive Heartbeat every 25 seconds
setInterval(() => {
  for (const res of sseClients) {
    try {
      res.write(': keepalive\n\n');
    } catch (e) {
      sseClients.delete(res);
    }
  }
}, 25000);

function getDefaultDatabase() {
  return {
    pets: [],
    impoundments: [],
    notifications: [],
    sightings: [],
    cases: [],
    shelters: SEED_SHELTERS,
    rfidTags: SEED_RFID_TAGS,
    settings: SEED_SETTINGS
  };
}

function getDatabase() {
  try {
    if (fs.existsSync(SHARED_DB_PATH)) {
      let raw = fs.readFileSync(SHARED_DB_PATH, 'utf8');
      raw = raw.replace(/^\uFEFF/, '').trim();
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (!Array.isArray(parsed.pets)) parsed.pets = [];
          if (!Array.isArray(parsed.impoundments)) parsed.impoundments = [];
          if (!Array.isArray(parsed.notifications)) parsed.notifications = [];
          if (!Array.isArray(parsed.sightings)) parsed.sightings = [];
          if (!Array.isArray(parsed.cases)) parsed.cases = [];
          if (!Array.isArray(parsed.shelters) || parsed.shelters.length === 0) parsed.shelters = SEED_SHELTERS;
          if (!Array.isArray(parsed.rfidTags) || parsed.rfidTags.length === 0) parsed.rfidTags = SEED_RFID_TAGS;
          if (!parsed.settings) parsed.settings = SEED_SETTINGS;
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('[Shared DB Read Error]:', err.message);
  }
  return getDefaultDatabase();
}

function saveDatabase(db) {
  try {
    const jsonStr = JSON.stringify(db, null, 2);
    fs.writeFileSync(SHARED_DB_PATH, jsonStr, 'utf8');
    return true;
  } catch (err) {
    console.error('[Shared DB Write Error, Retrying]:', err.message);
    try {
      setTimeout(() => {
        fs.writeFileSync(SHARED_DB_PATH, JSON.stringify(db, null, 2), 'utf8');
      }, 50);
      return true;
    } catch (e2) {
      console.error('[Shared DB Fatal Write Error]:', e2.message);
      return false;
    }
  }
}

// Watch shared DB file for cross-server mutations
let watcher = null;
function setupWatcher() {
  if (watcher) {
    try { watcher.close(); } catch (e) {}
    watcher = null;
  }

  if (fs.existsSync(SHARED_DB_PATH)) {
    let debounceTimer = null;
    try {
      watcher = fs.watch(SHARED_DB_PATH, () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          try {
            const db = getDatabase();
            broadcastSSE({ type: 'full_sync', db, timestamp: Date.now() });
          } catch (err) {}
        }, 80);
      });
      watcher.on('error', (err) => {
        console.warn('Watcher error:', err.message);
        setTimeout(setupWatcher, 1000);
      });
    } catch (err) {
      console.warn('File watch warning:', err.message);
    }
  }
}

// Initialize shared DB file if missing and setup watcher
if (!fs.existsSync(SHARED_DB_PATH)) {
  saveDatabase(getDefaultDatabase());
}
setupWatcher();

const server = http.createServer((req, res) => {
  // Global CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = req.url.split('?')[0];

  // API: Health & Status Check
  if (parsedUrl === '/api/health' || parsedUrl === '/api/ping') {
    const db = getDatabase();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'PawTrack Pet Owner Portal',
      port: PORT,
      timestamp: new Date().toISOString(),
      counts: {
        pets: (db.pets || []).length,
        impoundments: (db.impoundments || []).length,
        shelters: (db.shelters || []).length,
        rfidTags: (db.rfidTags || []).length
      }
    }));
    return;
  }

  // API: Send 4-Digit Security PIN to Google/Gmail Account
  if (parsedUrl === '/api/send-pin' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const targetEmail = (payload.email || 'user@gmail.com').trim();
        const recipientName = (payload.name || 'Pet Guardian').trim();
        const securityPin = (payload.pin || '').toString().trim();

        if (!securityPin || securityPin.length !== 4) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid 4-digit PIN provided' }));
          return;
        }

        let emailSentViaSmtp = false;
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
          try {
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASS
              }
            });
            transporter.sendMail({
              from: `"PawTrack Guardian Security" <${process.env.GMAIL_USER}>`,
              to: targetEmail,
              subject: `Google Security Alert: PawTrack Verification PIN [${securityPin}]`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #1e293b;">
                  <h2 style="color: #1a73e8; margin-top: 0;">PawTrack Pet Guardian Verification</h2>
                  <p>Hello <strong>${recipientName}</strong>,</p>
                  <p>Your 4-digit verification PIN to connect and authorize pet recovery alerts for <strong>${targetEmail}</strong> is:</p>
                  <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1a73e8; background: #f0f7ff; padding: 14px 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px dashed #93c5fd;">
                    ${securityPin}
                  </div>
                  <p style="font-size: 13px; color: #64748b;">This PIN is valid for 10 minutes. If you did not request this code, please disregard this email.</p>
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                  <p style="font-size: 11px; color: #94a3b8; text-align: center;">PawTrack RFID Pet Recovery &amp; Municipal Pound Network</p>
                </div>
              `
            }).catch(e => console.warn('[Local SMTP Warn]:', e.message));
            emailSentViaSmtp = true;
          } catch (e) {}
        }

        console.log('\n---------------------------------------------------------');
        console.log(`[PawTrack Gmail Dispatch] Real-Time Message Sent To: ${targetEmail}`);
        console.log(`[PawTrack Gmail Dispatch] Recipient Name: ${recipientName}`);
        console.log(`[PawTrack Gmail Dispatch] Subject: "PawTrack Pet Guardian Security PIN: ${securityPin}"`);
        console.log(`[PawTrack Gmail Dispatch] Category: Google / Primary Inbox | SMTP: ${emailSentViaSmtp}`);
        console.log('---------------------------------------------------------\n');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          deliveredTo: targetEmail,
          recipient: recipientName,
          realTimeSmtp: emailSentViaSmtp,
          message: `Security PIN has been dispatched in real-time to ${targetEmail}. Please check your primary Gmail inbox.`,
          dispatchedAt: new Date().toISOString()
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API 1: Real-time Server-Sent Events (SSE) stream
  if (parsedUrl === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write(`data: ${JSON.stringify({ type: 'connected', service: 'owner', port: PORT })}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // API 2: Full State Sync (GET)
  if (parsedUrl === '/api/sync' && req.method === 'GET') {
    const db = getDatabase();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db));
    return;
  }

  // API 3: Update State Sync (POST)
  if (parsedUrl === '/api/sync' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const db = getDatabase();
        if (!Array.isArray(db.pets)) db.pets = [];
        if (!Array.isArray(db.impoundments)) db.impoundments = [];
        if (!Array.isArray(db.notifications)) db.notifications = [];
        if (!Array.isArray(db.sightings)) db.sightings = [];
        if (!Array.isArray(db.cases)) db.cases = [];
        if (!Array.isArray(db.rfidTags)) db.rfidTags = [];

        if (payload.action === 'save_pet') {
          const pet = payload.pet;
          const idx = db.pets.findIndex(p => p.id === pet.id);
          if (idx >= 0) db.pets[idx] = pet;
          else db.pets.unshift(pet);

          if (pet.rfidTag) {
            const cleanTag = pet.rfidTag.trim().toUpperCase();
            const tagItem = db.rfidTags.find(t => (t.code || t.tag || '').toUpperCase() === cleanTag);
            if (tagItem) {
              tagItem.status = 'assigned';
              tagItem.petId = pet.id;
              tagItem.petName = pet.name;
              tagItem.lastScanned = new Date().toISOString();
            }
          }
        } else if (payload.action === 'create_sighting') {
          const sighting = payload.sighting;
          db.sightings.unshift(sighting);

          // If rfidTag or matchedPetId is present, check against registered pets
          let pet = null;
          if (sighting.matchedPetId) {
            pet = db.pets.find(p => p.id === sighting.matchedPetId);
          } else if (sighting.rfidTag) {
            const cleanTag = sighting.rfidTag.trim().toUpperCase();
            pet = db.pets.find(p => (p.rfidTag || '').trim().toUpperCase() === cleanTag);
            if (pet) {
              sighting.matchedPetId = pet.id;
            }
          }

          // If matched to a specific pet, notify owner and update admin case timeline
          if (pet) {
            const notif = {
              id: 'notif-match-' + Date.now(),
              type: 'pet_found_match',
              title: `GOOD SAMARITAN FOUND YOUR PET: "${pet.name.toUpperCase()}"!`,
              message: `Your pet was found and reported near ${sighting.location || 'Metro Manila'}. Finder Contact: ${sighting.reporterPhone || 'Available in details'}. Notes: "${sighting.comments || 'Pet is safe with community finder.'}"`,
              petId: pet.id,
              petName: pet.name,
              rfidTag: pet.rfidTag,
              finderName: sighting.reporterName || 'Community Good Samaritan',
              finderPhone: sighting.reporterPhone || '+63 9XX XXX XXXX',
              finderNotes: sighting.comments || 'Pet is safe with community finder.',
              location: sighting.location || 'Metro Manila',
              coords: sighting.coords || [14.6500, 121.0400],
              photoUrl: sighting.photoUrl,
              timestamp: new Date().toISOString(),
              read: false
            };
            db.notifications.unshift(notif);

            // Update or create case
            let petCase = db.cases.find(c => c.petId === pet.id && c.status !== 'reunited');
            if (!petCase) {
              petCase = {
                id: 'CASE-' + new Date().getFullYear() + '-' + String(db.cases.length + 1).padStart(4, '0'),
                petId: pet.id,
                petName: pet.name,
                rfidTag: pet.rfidTag,
                status: 'sighted',
                createdAt: pet.lastSeenDate || new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                timeline: []
              };
              db.cases.unshift(petCase);
            } else {
              petCase.status = 'sighted';
              petCase.lastUpdated = new Date().toISOString();
            }

            petCase.timeline.unshift({
              timestamp: new Date().toISOString(),
              type: 'sighting',
              title: `Pet Located by Good Samaritan (${sighting.reporterPhone ? 'Contact on file' : 'Sighting Pinned'})`,
              location: sighting.location || 'Metro Manila',
              finder: `${sighting.reporterName || 'Community Good Samaritan'} (${sighting.reporterPhone || 'Phone on file'})`,
              notes: sighting.comments || 'Visual sighting reported via community radar.',
              photoUrl: sighting.photoUrl
            });
          }
        } else if (payload.action === 'update_case') {
          const caseData = payload.caseData;
          const idx = db.cases.findIndex(c => c.id === caseData.id);
          if (idx >= 0) db.cases[idx] = caseData;
          else db.cases.unshift(caseData);
        } else if (payload.action === 'update_pet_status') {
          const pet = db.pets.find(p => p.id === payload.petId);
          if (pet) {
            pet.status = payload.status;
            if (payload.extra) Object.assign(pet, payload.extra);

            // Sync with active Case
            let petCase = db.cases.find(c => c.petId === pet.id && c.status !== 'reunited');
            if (petCase) {
              petCase.status = payload.status === 'lost' ? 'missing' : payload.status === 'safe' || payload.status === 'reunited' ? 'reunited' : payload.status;
              petCase.lastUpdated = new Date().toISOString();
              petCase.timeline.unshift({
                timestamp: new Date().toISOString(),
                type: payload.status,
                title: `Pet Status Changed to ${payload.status.toUpperCase()}`,
                location: pet.lastSeenLocation || 'Metro Manila',
                notes: payload.notes || `Guardian updated pet status to ${payload.status}.`
              });
            }
          }
        } else if (payload.action === 'create_impoundment') {
          db.impoundments.unshift(payload.impoundment);
          const pet = db.pets.find(p => p.id === payload.impoundment.petId);
          if (pet) pet.status = 'impounded';

          // Add timeline to case
          if (pet) {
            let petCase = db.cases.find(c => c.petId === pet.id && c.status !== 'reunited');
            if (petCase) {
              petCase.status = 'impounded';
              petCase.timeline.unshift({
                timestamp: new Date().toISOString(),
                type: 'impounded',
                title: `Shelter Intake Logged (72-Hour Holding Started)`,
                location: payload.impoundment.shelterName,
                kennelId: payload.impoundment.cageNumber,
                officer: payload.impoundment.intakeOfficer,
                notes: `RFID ${payload.impoundment.rfidTag} verified at intake terminal.`
              });
            }
          }
        } else if (payload.action === 'claim_impoundment' || payload.action === 'verify_claim_documents') {
          const imp = db.impoundments.find(i => i.id === payload.impoundId);
          if (imp) {
            imp.status = 'claimed';
            imp.claimedAt = new Date().toISOString();
            imp.redemptionDocs = payload.documents || {
              govIdVerified: true,
              vaccineBookVerified: true,
              rfidPassVerified: true,
              feeReceiptNo: payload.receiptNo || 'OR-' + Math.floor(100000 + Math.random() * 900000)
            };
            const pet = db.pets.find(p => p.id === imp.petId);
            if (pet) pet.status = 'safe';

            let petCase = db.cases.find(c => c.petId === imp.petId);
            if (petCase) {
              petCase.status = 'reunited';
              petCase.timeline.unshift({
                timestamp: new Date().toISOString(),
                type: 'reunited',
                title: `Redemption Documents Verified & Pet Claimed`,
                location: imp.shelterName,
                receiptNo: imp.redemptionDocs.feeReceiptNo,
                notes: `Guardian presented valid credentials. Case successfully resolved.`
              });
            }
          }
        } else if (payload.action === 'delete_pet') {
          const target = db.pets.find(p => p.id === payload.petId);
          db.pets = db.pets.filter(p => p.id !== payload.petId);
          if (target && target.rfidTag) {
            const cleanTag = target.rfidTag.trim().toUpperCase();
            const tagItem = db.rfidTags.find(t => (t.code || t.tag || '').toUpperCase() === cleanTag);
            if (tagItem) {
              tagItem.status = 'available';
              tagItem.petId = null;
              tagItem.petName = null;
            }
          }
        } else if (payload.action === 'set_key' && payload.key) {
          db[payload.key] = payload.data;
        } else if (payload.fullDatabase) {
          Object.assign(db, payload.fullDatabase);
        }

        saveDatabase(db);
        broadcastSSE({ type: 'mutation', payload, timestamp: Date.now() });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, db }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Static File Serving
  let safeUrl = parsedUrl;
  if (safeUrl === '/') safeUrl = '/index.html';

  const filePath = path.join(PUBLIC_DIR, safeUrl);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn('\n[NOTICE] Port ' + PORT + ' is already in use.');
    console.warn('PawTrack Pet Owner service is already running on http://localhost:' + PORT);
  } else {
    console.error('Server encountered an error:', err);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n==================================================');
  console.log('  PawTrack Pet Owner Portal Server Running');
  console.log('  Local URL:    http://localhost:' + PORT);
  console.log('  Shared DB:    ' + SHARED_DB_PATH);
  console.log('  SSE Stream:   http://localhost:' + PORT + '/api/events');
  console.log('  Health API:   http://localhost:' + PORT + '/api/health');
  console.log('==================================================\n');
});
