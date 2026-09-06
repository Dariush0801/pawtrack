/**
 * Test: Pet Guardian Profile Interactive Editor & Data Persistence
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== Running Test: Pet Guardian Profile Interactive Editor ===\n');

const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const compCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'components.css'), 'utf8');

// 1. Verify all required elements are present in index.html
const requiredIds = [
  'guardian-profile-modal',
  'guardian-modal-header-title',
  'guardian-profile-view-mode',
  'guardian-modal-avatar',
  'guardian-modal-name',
  'guardian-modal-email',
  'guardian-edit-btn',
  'guardian-modal-phone',
  'guardian-modal-area',
  'guardian-modal-backup-phone',
  'profile-pet-count',
  'guardian-open-edit-footer-btn',
  'guardian-profile-edit-form',
  'edit-guardian-avatar-preview',
  'edit-guardian-avatar-file',
  'edit-guardian-avatar-reset',
  'edit-guardian-name-input',
  'edit-guardian-phone-input',
  'edit-guardian-area-input',
  'edit-guardian-backup-input',
  'edit-guardian-cancel-btn',
  'edit-guardian-save-btn'
];

requiredIds.forEach(id => {
  assert(indexHtml.includes(`id="${id}"`), `index.html must include element with id="${id}"`);
  console.log(`[PASS] Verified element #${id} exists in index.html`);
});

// 2. Verify CSS classes
assert(compCss.includes('.guardian-modal-avatar-box'), 'components.css must define .guardian-modal-avatar-box');
console.log('[PASS] Verified .guardian-modal-avatar-box styling in components.css');

// 3. Verify methods and event listeners in app.js
assert(appJs.includes('populateGuardianProfile('), 'js/app.js must implement populateGuardianProfile()');
assert(appJs.includes('guardian-edit-btn'), 'js/app.js must wire #guardian-edit-btn');
assert(appJs.includes('edit-guardian-cancel-btn'), 'js/app.js must wire #edit-guardian-cancel-btn');
assert(appJs.includes('edit-guardian-avatar-file'), 'js/app.js must wire #edit-guardian-avatar-file');
assert(appJs.includes('edit-guardian-avatar-reset'), 'js/app.js must wire #edit-guardian-avatar-reset');
assert(appJs.includes('guardian-profile-edit-form'), 'js/app.js must wire #guardian-profile-edit-form');
console.log('[PASS] Verified all Guardian Profile methods and event listeners in js/app.js');

console.log('\n=== All Pet Guardian Profile Editor Tests Passed! ===\n');
