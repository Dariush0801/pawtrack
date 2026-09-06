const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting PawTrack Impounded View Filipino / English i18n & Accordion Test Suite...');

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
  'impounded.btnViewMap',
  'impounded.expandDetails',
  'impounded.collapseDetails'
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

console.log('\n--- 3. Testing ImpoundedView Rendering & Semi-Minimized Accordion ---');
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

// Render English (Default Collapsed / Semi-Minimized)
window.pawI18n.setLang('en', false);
window.impoundedView.render(testContainer);
let html = testContainer.innerHTML;

assert(html.includes('Quezon City Animal Care &amp; Adoption Facility') || html.includes('Quezon City Animal Care & Adoption Facility'), 'Facility title visible');
assert(html.includes('Payatas, Quezon City'), 'Facility location visible');
assert(html.includes('facility-expand-btn'), 'Dropdown arrow button rendered');
assert(html.includes('display:none;'), 'Extra facility details hidden by default (semi-minimized)');
console.log('✓ Semi-minimized default view verified (Title & Location visible, extra details collapsed)');

// Expand facility card
window.impoundedView.toggleShelterExpand('shelter-1');
window.impoundedView.render(testContainer);
html = testContainer.innerHTML;

assert(html.includes('display:block;'), 'Extra facility details displayed when expanded');
assert(html.includes('Phone:'), 'Phone visible when expanded');
assert(html.includes('Hours:'), 'Hours visible when expanded');
assert(html.includes('Capacity:'), 'Capacity visible when expanded');
assert(html.includes('facility-expand-btn expanded'), 'Expand button has expanded class');
console.log('✓ Accordion expand toggle verified successfully');

// Toggle to Filipino while expanded
window.pawI18n.setLang('fil', false);
window.impoundedView.render(testContainer);
html = testContainer.innerHTML;

assert(html.includes('Pasilidad ng Munisipyo para sa mga Nahuling Hayop'), 'Filipino title rendered');
assert(html.includes('Mga Pasilidad ng Pound sa NCR'), 'Filipino facilities sidebar title rendered');
assert(html.includes('Telepono:'), 'Filipino phone label rendered');
assert(html.includes('Lunes - Biyernes'), 'Filipino operating hours rendered');
assert(html.includes('Tubusin at Kunin'), 'Filipino redeem button rendered');
console.log('✓ Filipino view rendering with expanded accordion verified');

console.log('\n🎉 ALL IMPOUNDED I18N & ACCORDION TESTS PASSED!\n');
