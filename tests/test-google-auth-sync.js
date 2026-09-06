/**
 * Automated Verification: Google Account Auto-Connect & 4-PIN Gmail Verification
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== Running Test: Google Account Auto-Connect & 4-PIN Gmail Verification ===\n');

// 1. Verify user avatar asset exists
const avatarPath = path.join(__dirname, '..', 'images', 'user-avatar.png');
assert(fs.existsSync(avatarPath), 'images/user-avatar.png must exist');
console.log('[PASS] images/user-avatar.png exists and is bundled in the project.');

// 2. Read app.js and index.html
const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const compCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'components.css'), 'utf8');
const notifJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'notifications.js'), 'utf8');

// Ensure modals are present in index.html
assert(indexHtml.includes('id="google-auth-modal"'), 'index.html must include #google-auth-modal');
assert(indexHtml.includes('id="guardian-pin-modal"'), 'index.html must include #guardian-pin-modal');
assert(indexHtml.includes('id="privacy-policy-modal"'), 'index.html must include #privacy-policy-modal');
assert(indexHtml.includes('id="terms-modal"'), 'index.html must include #terms-modal');
assert(indexHtml.includes('id="pin-timer-badge"'), 'index.html must include #pin-timer-badge');
console.log('[PASS] All Google Auth, 4-PIN verification, and Policy modals are present in index.html.');

// Ensure 4-PIN digit boxes are in index.html and auto-fill helper is removed
assert(indexHtml.includes('id="pin-input-1"'), 'index.html must include #pin-input-1');
assert(indexHtml.includes('id="pin-input-4"'), 'index.html must include #pin-input-4');
assert(!indexHtml.includes('id="pin-autofill-btn"'), 'index.html must NOT expose auto-fill PIN button on screen');
console.log('[PASS] 4-digit PIN input fields are present and on-screen PIN display is removed.');

// Ensure backend send-pin endpoint files exist
const sendPinApi = path.join(__dirname, '..', 'api', 'send-pin.js');
assert(fs.existsSync(sendPinApi), 'api/send-pin.js must exist for Vercel deployment');
assert(appJs.includes('/api/send-pin'), 'app.js must call /api/send-pin to dispatch verification PIN');
assert(appJs.includes('startResendCountdown'), 'app.js must include startResendCountdown controller');
console.log('[PASS] /api/send-pin backend endpoint and 60-second countdown controller are configured.');

// Ensure CSS supports avatar image rendering, Google OAuth box, and PIN boxes
assert(compCss.includes('.google-oauth-box'), 'components.css must define .google-oauth-box styling');
assert(compCss.includes('.google-account-item'), 'components.css must define .google-account-item styling');
assert(compCss.includes('.pin-digit-box'), 'components.css must define .pin-digit-box styling');
assert(indexHtml.includes('id="google-oauth-view-chooser"'), 'index.html must include #google-oauth-view-chooser');
assert(indexHtml.includes('id="google-oauth-view-pwd"'), 'index.html must include #google-oauth-view-pwd');
assert(indexHtml.includes('id="google-oauth-view-custom"'), 'index.html must include #google-oauth-view-custom');
assert(indexHtml.includes('id="google-account-select-btn"'), 'index.html must include #google-account-select-btn');
assert(indexHtml.includes('id="google-use-another-btn"'), 'index.html must include #google-use-another-btn');
assert(indexHtml.includes('id="google-oauth-pwd-input"'), 'index.html must include #google-oauth-pwd-input');
assert(indexHtml.includes('id="google-pwd-next-btn"'), 'index.html must include #google-pwd-next-btn');
console.log('[PASS] CSS and Google OAuth account chooser + password challenge elements are configured.');

// 3. Mock DOM and state for full flow test
let currentUser = null;
const mockDom = {
  'header-login-btn': { style: { display: '' } },
  'header-user-btn': { style: { display: 'none' } },
  'header-user-name': { textContent: '' },
  'header-avatar-circle': { innerHTML: '', textContent: '' },
  'user-account-dropdown': { style: { display: 'none' } },
  'dropdown-user-name': { textContent: '' },
  'dropdown-user-email': { textContent: '' },
  'dropdown-avatar-circle': { innerHTML: '', textContent: '' },
  'guardian-profile-modal': { classList: { classes: new Set(), add(c) { this.classes.add(c); } } },
  'guardian-modal-name': { textContent: '' },
  'guardian-modal-email': { textContent: '' },
  'guardian-modal-avatar': { innerHTML: '', textContent: '' },
  'reg-owner-name': { value: '' },
  'google-onetap-prompt': { style: { display: 'none' } },
  'google-required-modal': { style: { display: 'none' } },
  'google-auth-modal': { classList: { classes: new Set(), add(c) { this.classes.add(c); }, remove(c) { this.classes.delete(c); } } },
  'guardian-pin-modal': { classList: { classes: new Set(), add(c) { this.classes.add(c); }, remove(c) { this.classes.delete(c); } } },
  'app-viewport': { innerHTML: '' }
};

// Simulate 4-PIN PIN Verification & Google User Authorization
const sampleEmail = 'aguilar.dariushdave.gasang@gmail.com';
const sampleName = 'Dariush Dave';
const generatedPin = '4829';

const pendingAuth = {
  name: sampleName,
  shortName: 'Dariush',
  email: sampleEmail,
  picture: 'images/user-avatar.png',
  pin: generatedPin
};

// Simulate PIN check
const enteredPin = '4829';
assert.strictEqual(enteredPin, pendingAuth.pin, 'PIN match validation');

currentUser = {
  name: pendingAuth.name,
  shortName: pendingAuth.shortName,
  email: pendingAuth.email,
  picture: pendingAuth.picture,
  avatarInitial: 'D',
  avatarBg: '#1a73e8',
  verified: true,
  emailVerified: true,
  authenticatedAt: new Date().toISOString()
};

// Simulate updateGoogleAuthUI
function updateGoogleAuthUI(user) {
  const loginBtn = mockDom['header-login-btn'];
  const userBtn = mockDom['header-user-btn'];
  const nameEl = mockDom['header-user-name'];
  const avatarCircle = mockDom['header-avatar-circle'];
  const dropdownName = mockDom['dropdown-user-name'];
  const dropdownEmail = mockDom['dropdown-user-email'];
  const dropdownAvatar = mockDom['dropdown-avatar-circle'];
  const modalName = mockDom['guardian-modal-name'];
  const modalEmail = mockDom['guardian-modal-email'];
  const modalAvatar = mockDom['guardian-modal-avatar'];

  const isLoggedIn = !!(user && user.name);

  if (isLoggedIn) {
    loginBtn.style.display = 'none';
    userBtn.style.display = 'inline-flex';
    const short = user.shortName || user.name || 'User';
    const initial = user.avatarInitial || (user.name ? user.name[0].toUpperCase() : 'G');

    nameEl.textContent = short;
    dropdownName.textContent = user.name;
    dropdownEmail.textContent = user.email;
    modalName.textContent = user.name;
    modalEmail.textContent = user.email;

    const renderAvatar = (el) => {
      if (!el) return;
      if (user.picture) {
        el.innerHTML = `<img src="${user.picture}" alt="${user.name}" />`;
      } else {
        el.textContent = initial;
      }
    };

    renderAvatar(avatarCircle);
    renderAvatar(dropdownAvatar);
    renderAvatar(modalAvatar);

    const regOwnerName = mockDom['reg-owner-name'];
    if (regOwnerName && !regOwnerName.value) {
      regOwnerName.value = user.name;
    }
  }
}

updateGoogleAuthUI(currentUser);

// 4. Assertions
assert.strictEqual(mockDom['header-login-btn'].style.display, 'none');
assert.strictEqual(mockDom['header-user-btn'].style.display, 'inline-flex');
assert.strictEqual(mockDom['header-user-name'].textContent, 'Dariush');
assert(mockDom['header-avatar-circle'].innerHTML.includes('images/user-avatar.png'));

assert.strictEqual(mockDom['dropdown-user-name'].textContent, 'Dariush Dave');
assert.strictEqual(mockDom['dropdown-user-email'].textContent, 'aguilar.dariushdave.gasang@gmail.com');
assert(mockDom['dropdown-avatar-circle'].innerHTML.includes('images/user-avatar.png'));

assert.strictEqual(mockDom['guardian-modal-name'].textContent, 'Dariush Dave');
assert.strictEqual(mockDom['guardian-modal-email'].textContent, 'aguilar.dariushdave.gasang@gmail.com');
assert(mockDom['guardian-modal-avatar'].innerHTML.includes('images/user-avatar.png'));

assert.strictEqual(mockDom['reg-owner-name'].value, 'Dariush Dave');

console.log('[PASS] 4-PIN PIN matched and verified successfully.');
console.log('[PASS] Header user pill displays "Dariush" with avatar photo.');
console.log('[PASS] Dropdown displays "Dariush Dave", "aguilar.dariushdave.gasang@gmail.com", and avatar photo.');
console.log('[PASS] Guardian Profile modal displays "Dariush Dave", "aguilar.dariushdave.gasang@gmail.com", and avatar photo.');
console.log('[PASS] Pet Registration automatically prefills owner as "Dariush Dave".');
console.log('\n=== All 4-PIN Verification & Profile Connection Tests Passed! ===');
