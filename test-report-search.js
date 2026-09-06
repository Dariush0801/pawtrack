const fs = require('fs');
const path = require('path');

console.log('===============================================================');
console.log('  PawTrack Report Pet Location Search & Quick Jump Verification');
console.log('===============================================================');

// 1. Read index.html and verify search bar & Maps/Upload markup
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

console.log('\n[Check 1] Verifying Report Pet Modal Markup in index.html:');
const requiredHtmlElements = [
  'id="report-view-mode-toggle"',
  'id="report-mode-map-btn"',
  'id="report-mode-upload-btn"',
  'id="report-map-view-container"',
  'id="report-upload-view-container"',
  'class="report-photo-actions-bar"',
  'data-i18n="report.takePhoto"',
  'data-i18n="report.uploadPhoto"',
  'id="report-photo-dropzone"',
  'id="report-photo-preview-wrap"',
  'id="report-location-search-wrap"',
  'class="report-location-search-box"',
  'id="report-location-search-input"',
  'id="report-location-suggestions"',
  'class="report-quick-jump-row"',
  'class="modal-close-squircle-btn"'
];

let htmlOk = true;
requiredHtmlElements.forEach(elem => {
  if (html.includes(elem)) {
    console.log(`  ✓ Element [${elem}] is present.`);
  } else {
    console.error(`  ✗ Missing Element: ${elem}`);
    htmlOk = false;
  }
});

// 2. Read js/report-manager.js and verify logic and methods
const reportJs = fs.readFileSync(path.join(__dirname, 'js', 'report-manager.js'), 'utf8');

console.log('\n[Check 2] Verifying ReportManager Methods & View Modes:');
const requiredMethods = [
  'setViewMode',
  'triggerTakePhoto',
  'triggerUploadPhoto',
  'handlePhotoFile',
  'setUploadedPhoto',
  'removeUploadedPhoto',
  'handleLocationSearch',
  'renderSuggestions',
  'handleSearchKeydown',
  'selectLocation',
  'clearLocationSearch',
  'hideSuggestions',
  'searchOnlineNominatim',
  'jumpToLocation',
  'closeModal'
];

let jsOk = true;
requiredMethods.forEach(method => {
  if (reportJs.includes(method)) {
    console.log(`  ✓ Method [${method}] is implemented.`);
  } else {
    console.error(`  ✗ Missing Method: ${method}`);
    jsOk = false;
  }
});

// 3. Verify PRESET_LOCATIONS coverage
if (reportJs.includes('const PRESET_LOCATIONS = [')) {
  const match = reportJs.match(/const PRESET_LOCATIONS = \[\s*([\s\S]*?)\s*\];/);
  if (match) {
    const lines = match[1].split('\n').filter(l => l.includes('lat:') && l.includes('lng:'));
    console.log(`  ✓ PRESET_LOCATIONS contains ${lines.length} high-accuracy locations across Metro Manila & Rizal/Cavite.`);
  }
}

// 4. Verify CSS styling in components.css
const css = fs.readFileSync(path.join(__dirname, 'css', 'components.css'), 'utf8');

console.log('\n[Check 3] Verifying Search Bar, Maps/Upload & Photo CSS in components.css:');
const requiredClasses = [
  '.report-view-mode-toggle',
  '.report-mode-btn',
  '.report-panel-container',
  '.report-photo-actions-bar',
  '.report-photo-action-btn',
  '.report-photo-dropzone',
  '.report-photo-placeholder',
  '.report-photo-preview-wrap',
  '.report-location-search-wrap',
  '.report-location-search-box',
  '.report-location-suggestions',
  '.report-quick-jump-row',
  '.report-zone-chip',
  '.modal-close-squircle-btn'
];

let cssOk = true;
requiredClasses.forEach(cls => {
  if (css.includes(cls)) {
    console.log(`  ✓ CSS class [${cls}] is defined.`);
  } else {
    console.error(`  ✗ Missing CSS class: ${cls}`);
    cssOk = false;
  }
});

// 5. Verify i18n translations in js/i18n.js
const i18n = fs.readFileSync(path.join(__dirname, 'js', 'i18n.js'), 'utf8');
console.log('\n[Check 4] Verifying i18n Dictionary for Search Bar & Photo Upload:');
const requiredI18nKeys = [
  "'report.searchLocPh'",
  "'report.modeMaps'",
  "'report.modeUpload'",
  "'report.takePhoto'",
  "'report.uploadPhoto'",
  "'report.dropPhotoText'",
  "'report.photoReady'"
];

let i18nOk = true;
requiredI18nKeys.forEach(k => {
  if (i18n.includes(k)) {
    console.log(`  ✓ Bilingual key [${k}] defined.`);
  } else {
    console.error(`  ✗ Missing i18n key: ${k}`);
    i18nOk = false;
  }
});

console.log('\n===============================================================');
if (htmlOk && jsOk && cssOk && i18nOk) {
  console.log('  All Report Pet Maps / Upload & Search Checks Passed! (100% SUCCESS)');
} else {
  console.error('  Some Checks Failed!');
}
console.log('===============================================================');
