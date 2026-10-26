const http = require('http');

const cleanNfcTags = [
  { id: 'tag-1', code: 'NFC-882194', status: 'available', petId: null, petName: null, frequency: '13.56 MHz NTAG213', battery: '100%', lastScanned: null },
  { id: 'tag-2', code: 'NFC-449102', status: 'available', petId: null, petName: null, frequency: '13.56 MHz NTAG213', battery: '100%', lastScanned: null },
  { id: 'tag-3', code: 'NFC-109283', status: 'available', petId: null, petName: null, frequency: '13.56 MHz NTAG213', battery: '100%', lastScanned: null },
  { id: 'tag-4', code: 'NFC-331908', status: 'available', petId: null, petName: null, frequency: '13.56 MHz NTAG213', battery: '100%', lastScanned: null },
  { id: 'tag-5', code: 'NFC-771829', status: 'available', petId: null, petName: null, frequency: '13.56 MHz NTAG213', battery: '100%', lastScanned: null },
  { id: 'tag-6', code: 'NFC-904123', status: 'available', petId: null, petName: null, frequency: '13.56 MHz NTAG213', battery: '100%', lastScanned: null },
  { id: 'tag-7', code: 'NFC-662310', status: 'available', petId: null, petName: null, frequency: '13.56 MHz NTAG213', battery: '100%', lastScanned: null },
  { id: 'tag-8', code: 'NFC-551980', status: 'available', petId: null, petName: null, frequency: '13.56 MHz NTAG213', battery: '100%', lastScanned: null }
];

const postData = JSON.stringify({
  action: 'set_all',
  fullDatabase: {
    pets: [],
    impoundments: [],
    sightings: [],
    cases: [],
    notifications: [],
    nfcTags: cleanNfcTags
  }
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/sync',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Cleared all pets and synced clean database. Status code:', res.statusCode);
  });
});

req.on('error', e => {
  console.error('Error clearing pets:', e.message);
});

req.write(postData);
req.end();
