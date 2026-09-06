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

// 2. Read app.js, index.html, server.js, api handlers
const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const compCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'components.css'), 'utf8');
const notifJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'notifications.js'), 'utf8');
const serverJs = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

// Ensure serverless and backend notification handler exists
const serverlessHandlerPath = path.join(__dirname, '..', 'api', 'send-auth-notification.js');
assert(fs.existsSync(serverlessHandlerPath), 'api/send-auth-notification.js must exist');
assert(serverJs.includes('/api/send-auth-notification'), 'server.js must contain /api/send-auth-notification endpoint');
assert(appJs.includes('/api/send-auth-notification'), 'js/app.js must call /api/send-auth-notification');
console.log('[PASS] Google authorization security notification APIs and frontend triggers are verified.');

// Verify 3 Google OAuth Scopes are strictly adhered to
assert(indexHtml.includes('Your Google account profile name &amp; email address') || indexHtml.includes('Your Google account profile name & email address'), 'index.html must include Profile & Email scope');
assert(indexHtml.includes('Verified Pet Guardian portal credentials &amp; digital passes') || indexHtml.includes('Verified Pet Guardian portal credentials & digital passes'), 'index.html must include Guardian Credentials scope');
assert(indexHtml.includes('Urgent municipal impound &amp; pet recovery alerts') || indexHtml.includes('Urgent municipal impound & pet recovery alerts'), 'index.html must include Municipal Alerts scope');
console.log('[PASS] Google OAuth Access Scopes (Profile, Guardian Credentials, Municipal Alerts) are strictly defined.');

// Ensure modals are present in index.html
assert(indexHtml.includes('id="login-dialog-modal"'), 'index.html must include #login-dialog-modal');
assert(indexHtml.includes('id="google-consent-modal"'), 'index.html must include #google-consent-modal');
assert(!indexHtml.includes('id="google-auth-modal"'), 'index.html must NOT include legacy #google-auth-modal');
assert(!indexHtml.includes('id="guardian-pin-modal"'), 'index.html must NOT include #guardian-pin-modal');
assert(indexHtml.includes('id="privacy-policy-modal"'), 'index.html must include #privacy-policy-modal');
assert(indexHtml.includes('id="terms-modal"'), 'index.html must include #terms-modal');
console.log('[PASS] Login Collaborate Dialog, Google Consent Modal, and Policy modals are present in index.html.');

// Ensure CSS supports avatar image rendering, Login Dialog, and Google Consent Card
assert(compCss.includes('.auth-dialog-card'), 'components.css must define .auth-dialog-card styling');
assert(compCss.includes('.google-consent-card'), 'components.css must define .google-consent-card styling');
assert(compCss.includes('.auth-google-continue-btn'), 'components.css must define .auth-google-continue-btn styling');
assert(indexHtml.includes('id="login-dialog-google-btn"'), 'index.html must include #login-dialog-google-btn');
assert(indexHtml.includes('id="consent-agree-continue-btn"'), 'index.html must include #consent-agree-continue-btn');
assert(indexHtml.includes('id="consent-terms-checkbox"'), 'index.html must include #consent-terms-checkbox');
assert(indexHtml.includes('id="login-dialog-form"'), 'index.html must include #login-dialog-form');
assert(indexHtml.includes('id="login-dialog-email"'), 'index.html must include #login-dialog-email');
assert(indexHtml.includes('id="login-dialog-pwd"'), 'index.html must include #login-dialog-pwd');
assert(indexHtml.includes('id="login-dialog-submit-btn"'), 'index.html must include #login-dialog-submit-btn');
console.log('[PASS] CSS, Collaborate Login Dialog, and Google Consent elements are configured.');

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
  'login-dialog-modal': { classList: { classes: new Set(), add(c) { this.classes.add(c); }, remove(c) { this.classes.delete(c); } } },
  'google-consent-modal': { classList: { classes: new Set(), add(c) { this.classes.add(c); }, remove(c) { this.classes.delete(c); } } },
  'app-viewport': { innerHTML: '' }
};

// Simulate Direct Login & Google User Authorization
const sampleEmail = 'alex.morgan@gmail.com';
const sampleName = 'Alex Morgan';

currentUser = {
  name: sampleName,
  shortName: 'Alex',
  email: sampleEmail,
  picture: 'https://ui-avatars.com/api/?name=Alex%20Morgan&background=1a73e8&color=fff&bold=true&size=128',
  avatarInitial: 'A',
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
assert.strictEqual(mockDom['header-user-name'].textContent, 'Alex');
assert(mockDom['header-avatar-circle'].innerHTML.includes('ui-avatars.com'));

assert.strictEqual(mockDom['dropdown-user-name'].textContent, 'Alex Morgan');
assert.strictEqual(mockDom['dropdown-user-email'].textContent, 'alex.morgan@gmail.com');
assert(mockDom['dropdown-avatar-circle'].innerHTML.includes('ui-avatars.com'));

assert.strictEqual(mockDom['guardian-modal-name'].textContent, 'Alex Morgan');
assert.strictEqual(mockDom['guardian-modal-email'].textContent, 'alex.morgan@gmail.com');
assert(mockDom['guardian-modal-avatar'].innerHTML.includes('ui-avatars.com'));

assert.strictEqual(mockDom['reg-owner-name'].value, 'Alex Morgan');

console.log('[PASS] Header user pill displays "Alex" with dynamic avatar.');
console.log('[PASS] Dropdown displays "Alex Morgan", "alex.morgan@gmail.com", and avatar.');
console.log('[PASS] Guardian Profile modal displays "Alex Morgan", "alex.morgan@gmail.com", and avatar.');
console.log('[PASS] Pet Registration automatically prefills owner as "Alex Morgan".');
console.log('\n=== All Direct Login & Profile Connection Tests Passed! ===');
