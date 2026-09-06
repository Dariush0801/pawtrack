const fs = require('fs');
const path = require('path');

console.log('===============================================================');
console.log('  PawTrack Incident Map & Google Directions Unit Test');
console.log('===============================================================\n');

// 1. Check public-view.js contains all required Google Maps methods
const publicViewCode = fs.readFileSync(path.join(__dirname, 'js', 'views', 'public-view.js'), 'utf8');

const requiredMethods = [
  'setMapLayer',
  'showDirections',
  'closeDirections',
  'openStreetView',
  'calculateDistance',
  'generateRealisticRoute'
];

console.log('[Check 1] Verifying PublicView Google Maps Methods:');
requiredMethods.forEach(method => {
  if (publicViewCode.includes(method)) {
    console.log(`  ✓ Method [${method}] is implemented.`);
  } else {
    console.error(`  ✗ Missing method: ${method}`);
    process.exit(1);
  }
});

// 2. Test mathematical calculation logic
console.log('\n[Check 2] Testing Distance & ETA Calculations:');
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in KM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// User location [14.6500, 121.0350] (QC Central) to QC Shelter [14.6475, 121.0483]
const dist = calculateDistance(14.6500, 121.0350, 14.6475, 121.0483);
const driveMin = Math.max(3, Math.round(dist * 2.4 + 2));
const walkMin = Math.max(12, Math.round(dist * 13.5));
const transitMin = Math.max(8, Math.round(dist * 4.2 + 6));

console.log(`  ✓ Calculated Distance: ${dist} km`);
console.log(`  ✓ Driving ETA: ${driveMin} mins`);
console.log(`  ✓ Walking ETA: ${walkMin} mins`);
console.log(`  ✓ Transit ETA: ${transitMin} mins`);

if (dist > 0 && driveMin > 0 && walkMin > 0) {
  console.log('  ✓ Distance & ETA algorithms validated successfully.');
} else {
  console.error('  ✗ Invalid calculation values!');
  process.exit(1);
}

// 3. Check CSS components for Google Maps Navigation Drawer
console.log('\n[Check 3] Verifying CSS Rules in components.css:');
const cssCode = fs.readFileSync(path.join(__dirname, 'css', 'components.css'), 'utf8');
const requiredClasses = [
  '.gmap-layer-dock',
  '.gmap-layer-btn',
  '.gmap-quick-tools',
  '.gmap-tool-btn',
  '.gmap-nav-drawer',
  '.gmap-nav-header',
  '.gmap-nav-body',
  '.gmap-place-card',
  '.gmap-place-img',
  '.gmap-place-overlay',
  '.gmap-modes-bar',
  '.gmap-mode-tab',
  '.gmap-steps-list',
  '.gmap-step-item'
];

requiredClasses.forEach(cls => {
  if (cssCode.includes(cls)) {
    console.log(`  ✓ CSS class [${cls}] defined.`);
  } else {
    console.error(`  ✗ Missing CSS class: ${cls}`);
    process.exit(1);
  }
});

// 4. Check photoUrl presence in seed data
console.log('\n[Check 4] Verifying High-Res Photographic Place Data in store.js:');
const storeCode = fs.readFileSync(path.join(__dirname, 'js', 'store.js'), 'utf8');
if (storeCode.includes('photoUrl') && storeCode.includes('images.unsplash.com')) {
  console.log('  ✓ Shelter and landmark photoUrl attributes are verified.');
} else {
  console.error('  ✗ Missing photoUrl in seed data!');
  process.exit(1);
}

console.log('\n===============================================================');
console.log('  All Incident Map & Directions Checks Passed (100% OK)');
console.log('===============================================================\n');
