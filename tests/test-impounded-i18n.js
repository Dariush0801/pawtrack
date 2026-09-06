const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting PawTrack Impounded View Filipino / English i18n Test Suite...');

// Mock browser environment
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = String(value); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

global.document = {
  documentElement: {
    setAttribute(k, v) { this[k] = v; },
    getAttribute(k) { return this[k]; }
  },
  querySelectorAll(sel) { return []; },
  getElementById(id) {
    if (id === 'app-viewport') {
      return { innerHTML: '', setAttribute() {} };
    }
    return null;
  }
};

global.window = {
  localStorage: global.localStorage,
  document: global.document
};

// Load i18n
const i18nCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'i18n.js'), 'utf8');
eval(i18nCode);

assert(window.pawI18n, 'pawI18n must be initialized on window');

console.log('✓ pawI18n successfully initialized');

// Verify key bilingual translations
const requiredKeys = [
  'impounded.title',
  'impounded.subtitle',
  'impounded.terminalBtn',
  'impounded.statActiveTitle',
  'impounded.statActive',
  'impounded.statClaimedTitle',
  'impounded.statClaimed',
  'impounded.statSheltersTitle',
  'impounded.statShelters',
  'impounded.facilitiesTitle',
  'impounded.facilitiesSubtitle',
  'impounded.petSingular',
  'impounded.petPlural',
  'impounded.phoneLabel',
  'impounded.hoursLabel',
  'impounded.capacityLabel',
  'impounded.kennels',
  'impounded.holdingWindow',
  'impounded.searchPlaceholder',
  'impounded.filterAllFacilities',
  'impounded.emptyTitle',
  'impounded.emptyDesc',
  'impounded.badgeImpounded',
  'impounded.defaultBreed',
  'impounded.holdingWindowHeader',
  'impounded.hoursRemaining',
  'impounded.detailFacility',
  'impounded.detailHoldingBay',
  'impounded.detailKennel',
  'impounded.detailOfficer',
  'impounded.detailDailyFee',
  'impounded.dailyFeeRate',
  'impounded.btnRedeemClaim',
  'impounded.btnViewMap'
];

console.log('\n--- 1. Verifying English Dictionary ---');
window.pawI18n.setLang('en', false);
requiredKeys.forEach(k => {
  const trans = window.pawI18n.t(k);
  assert(trans && trans !== k, `Missing English translation for ${k}`);
});
console.log(`✓ All ${requiredKeys.length} keys verified in English dictionary`);

console.log('\n--- 2. Verifying Filipino Dictionary ---');
window.pawI18n.setLang('fil', false);
requiredKeys.forEach(k => {
  const trans = window.pawI18n.t(k);
  assert(trans && trans !== k, `Missing Filipino translation for ${k}`);
});
console.log(`✓ All ${requiredKeys.length} keys verified in Filipino dictionary`);

console.log('\n--- 3. Testing ImpoundedView Rendering with Language Switching ---');
// Mock store
window.pawStore = {
  getPets: () => [
    { id: 'pet-1', name: 'Max', breed: 'Golden Retriever', photoUrl: 'images/sample-pets/max.jpg', rfidTag: 'RFID-990218' }
  ],
  getImpoundments: () => [
    { id: 'imp-1', petId: 'pet-1', shelterId: 'shelter-1', shelterName: 'Quezon City Animal Care & Adoption Facility', rfidTag: 'RFID-990218', status: 'active_impounded', cageNumber: 'B-04', intakeOfficer: 'Dr. Fernando Gomez, DVM' }
  ],
  getShelters: () => [
    { id: 'shelter-1', name: 'Quezon City Animal Care & Adoption Facility', address: 'Payatas, Quezon City', phone: '+63 (2) 8988-4242', hours: 'Mon - Fri: 8:00 AM - 5:00 PM', capacity: 65, holdingPeriodDays: 3 }
  ],
  getImpoundCountdownData: () => ({ hoursLeft: 58, percentElapsed: 20 })
};

const viewCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'views', 'impounded-view.js'), 'utf8');
eval(viewCode);

assert(window.impoundedView, 'impoundedView must be initialized');

const testContainer = { innerHTML: '' };

// Render English
window.pawI18n.setLang('en', false);
window.impoundedView.render(testContainer);
const enHtml = testContainer.innerHTML;

assert(enHtml.includes('Municipal Impound &amp; 72-Hour Holding Bay') || enHtml.includes('Municipal Impound & 72-Hour Holding Bay'), 'English title rendered');
assert(enHtml.includes('NCR Municipal Pound Facilities'), 'English facilities title rendered');
assert(enHtml.includes('Search by pet name, RFID UID, or shelter...'), 'English search placeholder rendered');
assert(enHtml.includes('Redeem &amp; Claim') || enHtml.includes('Redeem & Claim'), 'English redeem button rendered');
assert(enHtml.includes('Hours Remaining'), 'English hours remaining rendered');
assert(enHtml.includes('Phone:'), 'English phone label rendered');
assert(enHtml.includes('Holding Bay:'), 'English holding bay label rendered');
console.log('✓ English view rendering verified successfully');

// Toggle to Filipino
window.pawI18n.setLang('fil', false);
window.impoundedView.render(testContainer);
const filHtml = testContainer.innerHTML;

assert(filHtml.includes('Pasilidad ng Munisipyo para sa mga Nahuling Hayop'), 'Filipino title rendered');
assert(filHtml.includes('Mga Pasilidad ng Pound sa NCR'), 'Filipino facilities sidebar title rendered');
assert(filHtml.includes('Maghanap gamit ang pangalan ng alaga, RFID UID, o shelter...'), 'Filipino search placeholder rendered');
assert(filHtml.includes('Tubusin at Kunin'), 'Filipino redeem button rendered');
assert(filHtml.includes('Oras ang Natitira'), 'Filipino hours remaining rendered');
assert(filHtml.includes('Telepono:'), 'Filipino phone label rendered');
assert(filHtml.includes('Lalagyan / Bay:'), 'Filipino holding bay label rendered');
assert(filHtml.includes('Arawang Bayad sa Pound:'), 'Filipino daily fee label rendered');
assert(filHtml.includes('Lunes - Biyernes'), 'Filipino hours format rendered');

console.log('✓ Filipino view rendering verified successfully');

console.log('\n🎉 ALL IMPOUNDED I18N TESTS PASSED!\n');
