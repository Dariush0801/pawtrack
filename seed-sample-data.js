const http = require('http');

const pets = [
  {
    id: 'pet-seed-01',
    name: 'Max',
    species: 'Dog',
    breed: 'Golden Retriever',
    gender: 'Male',
    color: 'Golden brown with white chest patch',
    rfidTag: 'RFID-882194',
    microchipNo: '98514100882194',
    status: 'lost',
    medicalNotes: 'Friendly, microchipped, floppy ears, distinctive white patch on chest.',
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
    owner: {
      name: 'Maria Santos',
      phone: '+63 917 555 3829',
      email: 'maria.santos@gmail.com',
      address: 'Scout Gandia, Brgy. South Triangle, Quezon City'
    },
    lastSeenLocation: 'Scout Gandia cor. Tomas Morato, Quezon City',
    lastSeenDate: new Date(Date.now() - 6 * 3600000).toISOString(),
    lastSeenLat: 14.6360,
    lastSeenLng: 121.0370,
    registeredDate: '2026-08-01'
  },
  {
    id: 'pet-seed-02',
    name: 'Luna',
    species: 'Cat',
    breed: 'Calico / Domestic Shorthair',
    gender: 'Female',
    color: 'Tri-color (Orange, Black, White)',
    rfidTag: 'RFID-441920',
    microchipNo: '98514100441920',
    status: 'impounded',
    medicalNotes: 'Spayed, calico coat pattern, wearing blue collar with bell.',
    photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    owner: {
      name: 'Maria Santos',
      phone: '+63 918 222 9182',
      email: 'maria.santos@gmail.com',
      address: 'Brgy. Payatas, Quezon City'
    },
    lastSeenLocation: 'Lupang Pangako, Payatas, Quezon City',
    lastSeenDate: new Date(Date.now() - 18 * 3600000).toISOString(),
    lastSeenLat: 14.7118,
    lastSeenLng: 121.1037,
    registeredDate: '2026-07-15'
  },
  {
    id: 'pet-seed-03',
    name: 'Rocky',
    species: 'Dog',
    breed: 'Beagle',
    gender: 'Male',
    color: 'Tricolor (White, Brown, Black)',
    rfidTag: 'RFID-912044',
    microchipNo: '98514100912044',
    status: 'safe',
    medicalNotes: 'Fully vaccinated, active tracker collar, highly energetic.',
    photoUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80',
    owner: {
      name: 'Carlos Mendoza',
      phone: '+63 920 444 8812',
      email: 'carlos.m@gmail.com',
      address: 'Kapitolyo, Pasig City'
    },
    lastSeenLocation: 'Kapitolyo, Pasig City',
    lastSeenLat: 14.5750,
    lastSeenLng: 121.0620,
    registeredDate: '2026-08-10'
  }
];

const sightings = [
  {
    id: 'sight-2026-001',
    species: 'Dog',
    breed: 'Golden Retriever Mix',
    color: 'Golden brown with white chest patch',
    location: 'Near Scout Gandia & Timog Ave., Quezon City',
    lat: 14.6375,
    lng: 121.0362,
    dateTimeSeen: new Date(Date.now() - 3 * 3600000).toISOString(),
    comments: 'Spotted friendly golden dog near convenience store wearing brown leather collar. Approached by local guard.',
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
    reporterName: 'Resident in South Triangle',
    reporterPhone: '+63 928 333 4411',
    matchedPetId: 'pet-seed-01',
    confidenceScore: 94,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    status: 'verified'
  },
  {
    id: 'sight-2026-002',
    species: 'Cat',
    breed: 'Calico Shorthair',
    color: 'Tri-color orange and black patches',
    location: 'Near Payatas Animal Care Facility Gate',
    lat: 14.7122,
    lng: 121.1040,
    dateTimeSeen: new Date(Date.now() - 20 * 3600000).toISOString(),
    comments: 'Cat secured by animal welfare officer outside facility perimeter.',
    photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    reporterName: 'Officer J. Ramos',
    reporterPhone: '+63 2 8988 4242',
    matchedPetId: 'pet-seed-02',
    confidenceScore: 98,
    createdAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    status: 'verified'
  }
];

const impoundments = [
  {
    id: 'imp-2026-001',
    petId: 'pet-seed-02',
    petName: 'Luna',
    species: 'Cat',
    breed: 'Calico / Domestic Shorthair',
    rfidTag: 'RFID-441920',
    photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    shelterId: 'sh-1',
    shelterName: 'Quezon City Animal Care & Adoption Facility',
    shelterAddress: 'Clemente St., Lupang Pangako, Payatas, Quezon City',
    shelterPhone: '+63 (2) 8988-4242 loc 8036',
    cageNumber: 'Kennel Bay C-14',
    intakeOfficer: 'Officer J. Ramos (ID #QC-ACO-240)',
    intakeDate: new Date(Date.now() - 16 * 3600000).toISOString(),
    claimDeadline: new Date(Date.now() + 56 * 3600000).toISOString(),
    healthCondition: 'Healthy, stable, verified microchip scan.',
    status: 'active_impounded'
  }
];

const cases = [
  {
    id: 'CASE-2026-0001',
    petId: 'pet-seed-01',
    petName: 'Max',
    rfidTag: 'RFID-882194',
    status: 'sighted',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    lastUpdated: new Date(Date.now() - 3 * 3600000).toISOString(),
    timeline: [
      {
        timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
        type: 'sighting',
        title: 'Community Sighting Verified (94% AI Match)',
        location: 'Scout Gandia cor. Timog Ave., Quezon City',
        finder: 'Resident in South Triangle',
        notes: 'Photo cross-referenced with 94% confidence score across color, breed, and proximity traits.',
        photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80'
      },
      {
        timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
        type: 'missing',
        title: 'Emergency Missing Alert Broadcast Activated',
        location: 'Scout Gandia, Brgy. South Triangle, Quezon City',
        notes: 'Guardian reported missing. RFID-882194 tagged on all patrol scanners.'
      }
    ]
  },
  {
    id: 'CASE-2026-0002',
    petId: 'pet-seed-02',
    petName: 'Luna',
    rfidTag: 'RFID-441920',
    status: 'impounded',
    createdAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    lastUpdated: new Date(Date.now() - 16 * 3600000).toISOString(),
    timeline: [
      {
        timestamp: new Date(Date.now() - 16 * 3600000).toISOString(),
        type: 'impounded',
        title: 'Shelter Intake Logged (72-Hour Holding Window Active)',
        location: 'Quezon City Animal Care & Adoption Facility',
        officer: 'Officer J. Ramos',
        notes: 'Admitted to Kennel Bay C-14. Verified RFID-441920.'
      },
      {
        timestamp: new Date(Date.now() - 20 * 3600000).toISOString(),
        type: 'sighting',
        title: 'Animal Welfare Officer Sighting & Custody',
        location: 'Lupang Pangako, Payatas, Quezon City',
        officer: 'Officer J. Ramos',
        notes: 'Secured near facility gate.'
      }
    ]
  }
];

const postData = JSON.stringify({
  action: 'set_all',
  fullDatabase: {
    pets,
    sightings,
    impoundments,
    cases
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
    console.log('Seeding result:', res.statusCode, body);
  });
});

req.on('error', e => {
  console.error('Seeding error:', e.message);
});

req.write(postData);
req.end();
