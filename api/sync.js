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

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      pets: [],
      impoundments: [],
      notifications: [],
      sightings: [],
      cases: [],
      shelters: SEED_SHELTERS,
      rfidTags: SEED_RFID_TAGS,
      settings: {
        systemName: 'PawTrack Municipal Gateway (Cloud)',
        holdingWindowHours: 72,
        dailyHoldingFeeDefault: 500,
        currency: 'PHP',
        autoNotifyOwnerOnIntake: true,
        autoNotifyOwnerOnExpiryWarning: true,
        expiryWarningHours: 12,
        rfidScannerBaudRate: 9600,
        municipalJurisdiction: 'National Capital Region (Metro Manila)',
        syncStatus: 'Vercel Serverless Ready'
      }
    });
    return;
  }

  if (req.method === 'POST') {
    const payload = req.body || {};
    res.status(200).json({
      success: true,
      message: 'State synced successfully on cloud function',
      payload
    });
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
};
