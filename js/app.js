/**
 * PawTrack Application Controller & Router
 */

class App {
  constructor() {
    this.currentView = 'owner';
    this.views = {
      owner: window.ownerView,
      shelter: window.shelterView,
      map: window.publicView,
      cases: window.casesView,
      hardware: window.hardwareView
    };

    this.init();
  }

  init() {
    this.initTheme();
    this.initLanguage();
    this.initGoogleAuth();
    this.initEventListeners();
    this.initModals();
    this.initPhotoUpload();
    this.updateGoogleAuthUI();
    this.handleRoute();
    this.checkHardwareScanUrl();

    // Subscribe to store updates
    window.pawStore.subscribe(() => {
      this.updateGoogleAuthUI();
      this.renderCurrentView();
      this.updateNotifBadge();
    });

    this.updateGoogleAuthUI();
    this.updateNotifBadge();
  }

  checkHardwareScanUrl() {
    const searchParams = new URLSearchParams(window.location.search);
    const hasScanParam = searchParams.has('scan') || searchParams.has('rfid') || searchParams.has('tag') || searchParams.has('action') || searchParams.has('hardware_scan');
    const isReportAction = searchParams.get('action') === 'report' || searchParams.get('scan') === '1' || searchParams.get('scan') === 'true' || searchParams.has('rfid') || searchParams.has('tag') || window.location.hash === '#report';

    if (hasScanParam || isReportAction) {
      const scannedTag = searchParams.get('rfid') || searchParams.get('tag') || '';
      window.location.hash = 'owner';

      // Clean query parameters from URL address bar seamlessly
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname + '#owner');
      }

      setTimeout(() => {
        if (window.rfidScanner) window.rfidScanner.playSuccessChirp();
        if (window.reportManager) {
          window.reportManager.openReportModal('found', null, { rfidTag: scannedTag });
        }
      }, 300);
    }
  }

  initLanguage() {
    if (window.pawI18n) {
      window.pawI18n.updateToggleUI();
      window.pawI18n.applyDOMTranslations();
    }
  }

  toggleLanguage() {
    if (window.pawI18n) {
      window.pawI18n.toggleLanguage();
    }
  }

  initTheme() {
    const savedTheme = (window.pawStore && typeof window.pawStore.getTheme === 'function')
      ? window.pawStore.getTheme()
      : (localStorage.getItem('pawtrack_theme') || 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        if (window.pawStore && typeof window.pawStore.setTheme === 'function') {
          window.pawStore.setTheme(next);
        } else {
          localStorage.setItem('pawtrack_theme', next);
        }
        this.updateThemeIcon(next);
      });
    }
  }

  updateThemeIcon(theme) {
    const svg = document.getElementById('theme-btn-svg');
    if (svg) {
      if (theme === 'light') {
        svg.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
      } else {
        svg.innerHTML = `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>`;
      }
    }
  }

  initGoogleAuth() {
    const loginBtn = document.getElementById('header-login-btn');
    const userBtn = document.getElementById('header-user-btn');
    const userDropdown = document.getElementById('user-account-dropdown');
    const onetapPrompt = document.getElementById('google-onetap-prompt');
    const onetapClose = document.getElementById('onetap-close-btn');
    const onetapContinue = document.getElementById('onetap-continue-btn');
    const onetapGuest = document.getElementById('onetap-guest-btn');
    const warningModal = document.getElementById('google-required-modal');
    const promptLoginBtn = document.getElementById('prompt-google-login-btn');

    const profileModal = document.getElementById('guardian-profile-modal');
    const settingsModal = document.getElementById('portal-settings-modal');

    const notifBellBtn = document.getElementById('notif-bell-btn');
    const notifDropdown = document.getElementById('notif-dropdown-panel');
    const notifMarkRead = document.getElementById('notif-mark-read-btn');
    const notifClose = document.getElementById('notif-dropdown-close');

    // Click "Log In" Button -> Open "Log in or create an account" Modal
    loginBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (notifDropdown) notifDropdown.style.display = 'none';
      if (userDropdown) userDropdown.style.display = 'none';
      if (onetapPrompt) onetapPrompt.style.display = 'none';
      window.notifManager.openModal('login-dialog-modal');
    });

    // Click Logged-in User Pill -> Toggle User Account Dropdown
    userBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (userDropdown) {
        const isShown = userDropdown.style.display === 'flex';
        userDropdown.style.display = isShown ? 'none' : 'flex';
      }
      if (notifDropdown) notifDropdown.style.display = 'none';
      if (onetapPrompt) onetapPrompt.style.display = 'none';
    });

    // User Dropdown: Guardian Profile Button
    document.getElementById('dropdown-profile-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (userDropdown) userDropdown.style.display = 'none';
      const pets = window.pawStore.getPets();
      const countEl = document.getElementById('profile-pet-count');
      if (countEl) countEl.textContent = `${pets.length} Registered Pet${pets.length === 1 ? '' : 's'}`;
      if (profileModal) profileModal.classList.add('active');
    });

    // User Dropdown: Portal Settings Button
    document.getElementById('dropdown-settings-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (userDropdown) userDropdown.style.display = 'none';
      if (settingsModal) settingsModal.classList.add('active');
    });

    // User Dropdown: Log Out Button
    document.getElementById('dropdown-logout-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (userDropdown) userDropdown.style.display = 'none';
      window.pawStore.setGoogleUser(null);
      this.updateGoogleAuthUI();
      if (window.location.hash && window.location.hash !== '#owner') {
        window.location.hash = '#owner';
      } else {
        this.handleRoute();
      }
      window.notifManager.showToast('Signed out of PawTrack portal.', 'info');
    });

    // Notification Bell: Facebook-style anchored dropdown
    notifBellBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (notifDropdown) {
        const isShown = notifDropdown.style.display === 'block';
        notifDropdown.style.display = isShown ? 'none' : 'block';
        if (!isShown) {
          window.notifManager.renderNotifDropdown();
        }
      }
      if (userDropdown) userDropdown.style.display = 'none';
      if (onetapPrompt) onetapPrompt.style.display = 'none';
    });

    // Notification Mark Read
    notifMarkRead?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.pawStore.markAllNotificationsRead();
      window.notifManager.renderNotifDropdown();
      this.updateNotifBadge();
    });

    // Notification Close
    notifClose?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (notifDropdown) notifDropdown.style.display = 'none';
    });

    // Close Google One Tap Prompt
    onetapClose?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onetapPrompt) onetapPrompt.style.display = 'none';
    });

    // -------------------------------------------------------------
    // Google OAuth Account Chooser & Password Challenge Modal Logic
    // -------------------------------------------------------------
    const authModal = document.getElementById('google-auth-modal');
    const viewChooser = document.getElementById('google-oauth-view-chooser');
    const viewPwd = document.getElementById('google-oauth-view-pwd');
    const viewCustom = document.getElementById('google-oauth-view-custom');

    const accountSelectBtn = document.getElementById('google-account-select-btn');
    const chooserAvatarImg = document.getElementById('google-chooser-avatar-img');
    const chooserName = document.getElementById('google-chooser-name');
    const chooserEmail = document.getElementById('google-chooser-email');

    const useAnotherBtn = document.getElementById('google-use-another-btn');
    const customEmailInput = document.getElementById('google-custom-email-input');
    const customNameInput = document.getElementById('google-custom-name-input');
    const customBackLink = document.getElementById('google-custom-back-link');
    const customNextBtn = document.getElementById('google-custom-next-btn');

    const pwdHiTitle = document.getElementById('google-pwd-hi-title');
    const pwdUserPill = document.getElementById('google-pwd-user-pill');
    const pwdAvatarImg = document.getElementById('google-pwd-avatar-img');
    const pwdEmailText = document.getElementById('google-pwd-email-text');
    const pwdInput = document.getElementById('google-oauth-pwd-input');
    const showPwdCb = document.getElementById('google-oauth-show-pwd-cb');
    const pwdNextBtn = document.getElementById('google-pwd-next-btn');

    // Helper: Generate or select avatar based on email, name, or custom photo
    const getAvatarForAccount = (email, name) => {
      const cleanEmail = (email || '').trim().toLowerCase();
      if (cleanEmail === 'aguilar.dariushdave.gasang@gmail.com') {
        return 'images/user-avatar.png';
      }
      const displayName = name || cleanEmail.split('@')[0] || 'User';
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1a73e8&color=fff&bold=true&size=128`;
    };

    // State for currently selected Google account in OAuth flow
    let activeOauthAccount = {
      name: 'Aguilar, Dariush Dave Gasang',
      shortName: 'Dariush Dave',
      email: 'aguilar.dariushdave.gasang@gmail.com',
      picture: 'images/user-avatar.png'
    };

    const showOauthView = (viewName) => {
      if (viewChooser) viewChooser.style.display = viewName === 'chooser' ? 'grid' : 'none';
      if (viewPwd) viewPwd.style.display = viewName === 'pwd' ? 'grid' : 'none';
      if (viewCustom) viewCustom.style.display = viewName === 'custom' ? 'grid' : 'none';
    };

    // Open Google Account Authorization & Terms Consent Modal
    const openGoogleAuthModal = (accountToPreselect = null, directToPassword = false) => {
      if (onetapPrompt) onetapPrompt.style.display = 'none';
      if (warningModal) warningModal.style.display = 'none';

      // 1. Check if an account was explicitly provided
      if (accountToPreselect && accountToPreselect.email) {
        activeOauthAccount = accountToPreselect;
      } else {
        // 2. Check saved user or last used email in storage
        const existingUser = window.pawStore ? window.pawStore.getGoogleUser() : null;
        const lastSavedEmail = localStorage.getItem('pawtrack_last_email');

        if (existingUser && existingUser.email) {
          activeOauthAccount = {
            name: existingUser.name || 'Google User',
            shortName: existingUser.shortName || (existingUser.name ? existingUser.name.split(' ')[0] : 'User'),
            email: existingUser.email,
            picture: existingUser.picture || getAvatarForAccount(existingUser.email, existingUser.name)
          };
        } else if (lastSavedEmail && lastSavedEmail.includes('@')) {
          const localPart = lastSavedEmail.split('@')[0];
          const cleanWords = localPart.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
          const derivedName = cleanWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Google User';
          activeOauthAccount = {
            name: derivedName,
            shortName: derivedName.split(' ')[0] || derivedName,
            email: lastSavedEmail,
            picture: getAvatarForAccount(lastSavedEmail, derivedName)
          };
        } else {
          activeOauthAccount = {
            name: 'Aguilar, Dariush Dave Gasang',
            shortName: 'Dariush Dave',
            email: 'aguilar.dariushdave.gasang@gmail.com',
            picture: 'images/user-avatar.png'
          };
        }
      }

      if (chooserName) chooserName.textContent = activeOauthAccount.name;
      if (chooserEmail) chooserEmail.textContent = activeOauthAccount.email;
      if (chooserAvatarImg) chooserAvatarImg.src = activeOauthAccount.picture || getAvatarForAccount(activeOauthAccount.email, activeOauthAccount.name);

      if (directToPassword) {
        advanceToPasswordChallenge(activeOauthAccount);
      } else {
        showOauthView('chooser');
      }

      if (authModal) authModal.classList.add('active');
    };

    const advanceToPasswordChallenge = (account) => {
      activeOauthAccount = account;
      // Derive greeting name:
      // If name contains comma e.g. "Aguilar, Dariush Dave Gasang", take "Aguilar" or first part
      let greeting = 'User';
      if (account.name) {
        const parts = account.name.split(/[\s,]+/);
        greeting = parts[0] || 'User';
      }
      if (pwdHiTitle) pwdHiTitle.textContent = `Hi ${greeting},`;
      if (pwdEmailText) pwdEmailText.textContent = account.email;
      if (pwdAvatarImg) pwdAvatarImg.src = account.picture || getAvatarForAccount(account.email, account.name);

      if (pwdInput) {
        pwdInput.value = '';
        pwdInput.type = 'password';
      }
      if (showPwdCb) {
        showPwdCb.checked = false;
      }

      showOauthView('pwd');
      setTimeout(() => pwdInput?.focus(), 150);
    };

    // Account Chooser: Select Active Account
    accountSelectBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      advanceToPasswordChallenge(activeOauthAccount);
    });

    // Account Chooser: Click "Use another account"
    useAnotherBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      if (customEmailInput) customEmailInput.value = '';
      if (customNameInput) customNameInput.value = '';
      showOauthView('custom');
      setTimeout(() => customEmailInput?.focus(), 150);
    });

    // Custom Account View: Back to Chooser
    customBackLink?.addEventListener('click', (e) => {
      e.preventDefault();
      showOauthView('chooser');
    });

    // Custom Account View: Next Button
    const handleCustomAccountNext = () => {
      const email = (customEmailInput?.value || '').trim();
      if (!email || !email.includes('@') || !email.includes('.')) {
        window.notifManager.showToast('Please enter a valid Google/Gmail account email.', 'warning');
        customEmailInput?.focus();
        return;
      }

      let name = (customNameInput?.value || '').trim();
      if (!name) {
        const localPart = email.split('@')[0];
        const cleanWords = localPart.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
        name = cleanWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Google User';
      }

      const shortName = name.split(' ')[0] || name;
      const avatar = getAvatarForAccount(email, name);

      const customAcc = {
        name,
        shortName,
        email,
        picture: avatar
      };

      advanceToPasswordChallenge(customAcc);
    };

    customNextBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      handleCustomAccountNext();
    });

    customEmailInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCustomAccountNext();
      }
    });

    // Password Challenge: Click User Pill to switch account (goes back to Chooser)
    pwdUserPill?.addEventListener('click', (e) => {
      e.preventDefault();
      showOauthView('chooser');
    });

    // Password Challenge: Show Password Checkbox
    showPwdCb?.addEventListener('change', () => {
      if (pwdInput) {
        pwdInput.type = showPwdCb.checked ? 'text' : 'password';
      }
    });

    // -------------------------------------------------------------
    // 4-Digit Gmail PIN Verification Modal Controller
    // -------------------------------------------------------------
    const pinModal = document.getElementById('guardian-pin-modal');
    const pinTargetEmail = document.getElementById('pin-target-email');
    const pinInputs = [
      document.getElementById('pin-input-1'),
      document.getElementById('pin-input-2'),
      document.getElementById('pin-input-3'),
      document.getElementById('pin-input-4')
    ];
    const pinVerifyBtn = document.getElementById('pin-verify-submit-btn');
    const pinResendBtn = document.getElementById('pin-resend-btn');

    let resendTimerInterval = null;
    let resendCountdown = 60;

    const startResendCountdown = (seconds = 60) => {
      if (resendTimerInterval) {
        clearInterval(resendTimerInterval);
        resendTimerInterval = null;
      }
      resendCountdown = seconds;
      if (pinResendBtn) {
        pinResendBtn.disabled = true;
        pinResendBtn.style.opacity = '0.45';
        pinResendBtn.style.cursor = 'not-allowed';
        pinResendBtn.style.pointerEvents = 'none';
      }
      const timerBadge = document.getElementById('pin-timer-badge');
      const updateBadge = () => {
        if (!timerBadge) return;
        if (resendCountdown > 0) {
          timerBadge.textContent = `(in ${resendCountdown}s)`;
          timerBadge.style.display = 'inline';
        } else {
          timerBadge.textContent = '(Ready)';
          timerBadge.style.display = 'none';
        }
      };
      updateBadge();

      resendTimerInterval = setInterval(() => {
        resendCountdown--;
        if (resendCountdown <= 0) {
          clearInterval(resendTimerInterval);
          resendTimerInterval = null;
          if (pinResendBtn) {
            pinResendBtn.disabled = false;
            pinResendBtn.style.opacity = '1';
            pinResendBtn.style.cursor = 'pointer';
            pinResendBtn.style.pointerEvents = 'auto';
          }
          updateBadge();
        } else {
          updateBadge();
        }
      }, 1000);
    };

    // Password Challenge: Submit Password & Trigger Real-Time PIN Dispatch
    const handlePasswordSubmit = () => {
      const pwdVal = (pwdInput?.value || '').trim();
      if (!pwdVal) {
        window.notifManager.showToast('Please enter your Google account password to continue.', 'warning');
        pwdInput?.focus();
        return;
      }

      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();

      this.pendingAuth = {
        name: activeOauthAccount.name,
        shortName: activeOauthAccount.shortName || activeOauthAccount.name.split(' ')[0] || 'User',
        email: activeOauthAccount.email,
        picture: activeOauthAccount.picture || getAvatarForAccount(activeOauthAccount.email, activeOauthAccount.name),
        pin: generatedPin
      };

      if (authModal) window.notifManager.closeModal('google-auth-modal');
      if (pinTargetEmail) pinTargetEmail.textContent = activeOauthAccount.email;

      // Clear previous PIN inputs
      pinInputs.forEach(input => {
        if (input) {
          input.value = '';
          input.classList.remove('filled', 'error');
        }
      });

      if (pinModal) {
        window.notifManager.openModal('guardian-pin-modal');
        setTimeout(() => pinInputs[0]?.focus(), 150);
      }

      startResendCountdown(60);

      // Real-time transactional email dispatch to the user's Gmail
      fetch('/api/send-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: activeOauthAccount.email, name: activeOauthAccount.name, pin: generatedPin })
      }).catch(err => console.warn('[Send PIN API Notice]:', err));

      window.notifManager.showToast(`Security PIN [${generatedPin}] sent to ${activeOauthAccount.email}. Please check your primary Gmail inbox.`, 'info');
    };

    pwdNextBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      handlePasswordSubmit();
    });

    pwdInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePasswordSubmit();
      }
    });

    // Step 2: PIN Input Box interactions (Auto-advance, Backspace, Paste)
    pinInputs.forEach((input, index) => {
      if (!input) return;

      input.addEventListener('input', (e) => {
        const val = input.value.replace(/\D/g, '');
        input.value = val ? val[0] : '';

        if (input.value) {
          input.classList.add('filled');
          input.classList.remove('error');
          if (index < pinInputs.length - 1) {
            pinInputs[index + 1]?.focus();
          }
        } else {
          input.classList.remove('filled');
        }

        // If all 4 inputs filled, auto trigger verify
        const enteredPin = pinInputs.map(i => i?.value || '').join('');
        if (enteredPin.length === 4) {
          this.verifyGuardianPin();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
          pinInputs[index - 1]?.focus();
        }
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        if (pasted.length >= 4) {
          for (let i = 0; i < 4; i++) {
            if (pinInputs[i]) {
              pinInputs[i].value = pasted[i];
              pinInputs[i].classList.add('filled');
              pinInputs[i].classList.remove('error');
            }
          }
          this.verifyGuardianPin();
        }
      });
    });

    // Verify PIN Function
    this.verifyGuardianPin = () => {
      if (!this.pendingAuth) return;

      const enteredPin = pinInputs.map(i => i?.value || '').join('');
      if (enteredPin.length < 4) {
        window.notifManager.showToast('Please enter the full 4-digit security PIN.', 'warning');
        return;
      }

      if (enteredPin === this.pendingAuth.pin) {
        const userObj = {
          name: this.pendingAuth.name,
          shortName: this.pendingAuth.shortName,
          email: this.pendingAuth.email,
          picture: this.pendingAuth.picture || 'images/user-avatar.png',
          avatarInitial: (this.pendingAuth.name[0] || 'D').toUpperCase(),
          avatarBg: '#1a73e8',
          verified: true,
          emailVerified: true,
          authenticatedAt: new Date().toISOString()
        };

        try {
          localStorage.setItem('pawtrack_last_email', userObj.email);
        } catch (e) {}

        window.pawStore.setGoogleUser(userObj);
        this.updateGoogleAuthUI();
        if (pinModal) window.notifManager.closeModal('guardian-pin-modal');
        if (onetapPrompt) onetapPrompt.style.display = 'none';
        if (warningModal) warningModal.style.display = 'none';
        window.notifManager.showToast(`Guardian email verified! Connected as ${userObj.name} (${userObj.email}).`, 'success');
      } else {
        pinInputs.forEach(i => i?.classList.add('error'));
        window.notifManager.showToast('Incorrect 4-digit PIN. Please check your Gmail primary inbox.', 'danger');
      }
    };

    pinVerifyBtn?.addEventListener('click', () => {
      this.verifyGuardianPin();
    });

    // Resend PIN with 1-minute countdown lock
    pinResendBtn?.addEventListener('click', () => {
      if (!this.pendingAuth || resendCountdown > 0) return;
      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      this.pendingAuth.pin = newPin;

      pinInputs.forEach(input => {
        if (input) {
          input.value = '';
          input.classList.remove('filled', 'error');
        }
      });
      pinInputs[0]?.focus();

      // Start 60s countdown lock
      startResendCountdown(60);

      // Dispatch new PIN to Gmail
      fetch('/api/send-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.pendingAuth.email, name: this.pendingAuth.name, pin: newPin })
      }).catch(err => console.warn('[Send PIN API Notice]:', err));

      window.notifManager.showToast(`A fresh verification PIN [${newPin}] has been sent to your Gmail (${this.pendingAuth.email}).`, 'info');
    });

    // -------------------------------------------------------------
    // Login / Collaborate Dialog Modal Controller
    // -------------------------------------------------------------
    const loginDialogModal = document.getElementById('login-dialog-modal');
    const loginDialogGoogleBtn = document.getElementById('login-dialog-google-btn');
    const loginDialogForm = document.getElementById('login-dialog-form');
    const loginDialogEmail = document.getElementById('login-dialog-email');
    const loginDialogPwd = document.getElementById('login-dialog-pwd');
    const loginDialogResetPwd = document.getElementById('login-dialog-reset-pwd-btn');
    const loginDialogCreate = document.getElementById('login-dialog-create-btn');

    // "Continue with Google" -> opens Google OAuth Account Chooser modal with typed email pre-populated
    loginDialogGoogleBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const typedEmail = (loginDialogEmail?.value || '').trim();
      if (loginDialogModal) window.notifManager.closeModal('login-dialog-modal');

      if (typedEmail && typedEmail.includes('@')) {
        let accountName = 'Google User';
        if (typedEmail.toLowerCase() === 'aguilar.dariushdave.gasang@gmail.com') {
          accountName = 'Aguilar, Dariush Dave Gasang';
        } else {
          const localPart = typedEmail.split('@')[0];
          const cleanWords = localPart.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
          accountName = cleanWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Google User';
        }
        const customAcc = {
          name: accountName,
          shortName: accountName.split(' ')[0] || accountName,
          email: typedEmail,
          picture: getAvatarForAccount(typedEmail, accountName)
        };
        openGoogleAuthModal(customAcc, true);
      } else {
        openGoogleAuthModal();
      }
    });

    // "Log in" form submission with Email & Password
    loginDialogForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = (loginDialogEmail?.value || '').trim();
      const pwd = (loginDialogPwd?.value || '').trim();

      if (!email || !email.includes('@') || !email.includes('.')) {
        window.notifManager.showToast('Please enter a valid email address.', 'warning');
        loginDialogEmail?.focus();
        return;
      }

      if (!pwd) {
        window.notifManager.showToast('Please enter your password.', 'warning');
        loginDialogPwd?.focus();
        return;
      }

      // Check account credentials / sync
      let accountName = 'Google User';
      let avatarPic = null;

      if (email.toLowerCase() === 'aguilar.dariushdave.gasang@gmail.com') {
        accountName = 'Aguilar, Dariush Dave Gasang';
        avatarPic = 'images/user-avatar.png';
      } else {
        const localPart = email.split('@')[0];
        const cleanWords = localPart.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
        accountName = cleanWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Google User';
        avatarPic = getAvatarForAccount(email, accountName);
      }

      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();

      this.pendingAuth = {
        name: accountName,
        shortName: accountName.split(' ')[0] || accountName,
        email,
        picture: avatarPic,
        pin: generatedPin
      };

      if (loginDialogModal) window.notifManager.closeModal('login-dialog-modal');
      if (pinTargetEmail) pinTargetEmail.textContent = email;

      pinInputs.forEach(input => {
        if (input) {
          input.value = '';
          input.classList.remove('filled', 'error');
        }
      });

      if (pinModal) {
        window.notifManager.openModal('guardian-pin-modal');
        setTimeout(() => pinInputs[0]?.focus(), 150);
      }

      startResendCountdown(60);

      // Real-time transactional email dispatch
      fetch('/api/send-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: accountName, pin: generatedPin })
      }).catch(err => console.warn('[Send PIN API Notice]:', err));

      window.notifManager.showToast(`Verification PIN [${generatedPin}] sent to ${email}. Please check your inbox.`, 'info');
    });

    // "Reset password"
    loginDialogResetPwd?.addEventListener('click', (e) => {
      e.preventDefault();
      const email = (loginDialogEmail?.value || '').trim();
      if (email && email.includes('@')) {
        window.notifManager.showToast(`Password recovery link has been dispatched to ${email}.`, 'info');
      } else {
        window.notifManager.showToast('Please enter your email above to receive a password reset link.', 'info');
        loginDialogEmail?.focus();
      }
    });

    // "No account? Create one"
    loginDialogCreate?.addEventListener('click', (e) => {
      e.preventDefault();
      if (loginDialogModal) window.notifManager.closeModal('login-dialog-modal');
      openGoogleAuthModal();
    });

    // Sign in with Google Button (Trigger Authorization Modal)
    onetapContinue?.addEventListener('click', (e) => {
      e.stopPropagation();
      openGoogleAuthModal();
    });

    // Continue as Guest
    onetapGuest?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.pawStore.setGoogleUser(null);
      if (onetapPrompt) onetapPrompt.style.display = 'none';
      this.updateGoogleAuthUI();
      window.notifManager.showToast('Continuing in Guest Mode. Pet registration requires login.', 'info');
    });

    // Modal prompt Google login
    promptLoginBtn?.addEventListener('click', () => {
      if (loginDialogModal) {
        window.notifManager.openModal('login-dialog-modal');
      } else {
        openGoogleAuthModal();
      }
    });

    // Click outside to dismiss all floating dropdowns
    document.addEventListener('click', (e) => {
      if (onetapPrompt && !onetapPrompt.contains(e.target) && !e.target.closest('#header-login-btn')) {
        onetapPrompt.style.display = 'none';
      }
      if (userDropdown && !userDropdown.contains(e.target) && !e.target.closest('#header-user-btn')) {
        userDropdown.style.display = 'none';
      }
      if (notifDropdown && !notifDropdown.contains(e.target) && !e.target.closest('#notif-bell-btn')) {
        notifDropdown.style.display = 'none';
      }
    });
  }

  updateGoogleAuthUI() {
    const user = window.pawStore ? window.pawStore.getGoogleUser() : null;
    const loginBtn = document.getElementById('header-login-btn');
    const userBtn = document.getElementById('header-user-btn');
    const nameEl = document.getElementById('header-user-name');
    const avatarCircle = document.getElementById('header-avatar-circle');
    const dropdownName = document.getElementById('dropdown-user-name');
    const dropdownEmail = document.getElementById('dropdown-user-email');
    const dropdownAvatar = document.getElementById('dropdown-avatar-circle');

    const modalName = document.getElementById('guardian-modal-name');
    const modalEmail = document.getElementById('guardian-modal-email');
    const modalAvatar = document.getElementById('guardian-modal-avatar');

    const isLoggedIn = !!(user && user.name);

    if (isLoggedIn) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (userBtn) userBtn.style.display = 'inline-flex';
      const short = user.shortName || user.name || 'User';
      const initial = user.avatarInitial || (user.name ? user.name[0].toUpperCase() : 'G');

      if (nameEl) nameEl.textContent = short;
      if (dropdownName) dropdownName.textContent = user.name || 'Google User';
      if (dropdownEmail) dropdownEmail.textContent = user.email || 'user@gmail.com';

      if (modalName) modalName.textContent = user.name || 'Google User';
      if (modalEmail) modalEmail.textContent = user.email || 'user@gmail.com';

      // Render profile picture in avatar containers
      const renderAvatar = (el) => {
        if (!el) return;
        if (user.picture) {
          el.innerHTML = `<img src="${user.picture}" alt="${user.name || 'User'}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;" onerror="this.style.display='none'; this.parentElement.textContent='${initial}';" />`;
        } else {
          el.textContent = initial;
        }
      };

      renderAvatar(avatarCircle);
      renderAvatar(dropdownAvatar);
      renderAvatar(modalAvatar);

      const regOwnerName = document.getElementById('reg-owner-name');
      if (regOwnerName && !regOwnerName.value) {
        regOwnerName.value = user.name;
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (userBtn) userBtn.style.display = 'none';
    }

    // Role Navigation Tabs: When logged out, only Home ('owner') and Report Pet ('report') are visible
    document.querySelectorAll('.role-tab-btn').forEach(btn => {
      const view = btn.dataset.view;
      if (view === 'owner' || view === 'report') {
        btn.style.display = '';
      } else {
        btn.style.display = isLoggedIn ? '' : 'none';
      }
    });
  }

  initEventListeners() {
    window.addEventListener('hashchange', () => this.handleRoute());

    window.addEventListener('resize', () => {
      if (this.currentView === 'map' && window.publicView && window.publicView.map) {
        window.publicView.map.invalidateSize();
      }
    });

    document.querySelectorAll('.role-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = e.currentTarget.dataset.view;
        if (targetView === 'report') {
          // Report Pet triggers modal directly, not a router view change
          return;
        }

        const user = window.pawStore ? window.pawStore.getGoogleUser() : null;
        const isLoggedIn = !!(user && user.name);

        if (!isLoggedIn && targetView !== 'owner') {
          e.preventDefault();
          const warningModal = document.getElementById('google-required-modal');
          const onetapPrompt = document.getElementById('google-onetap-prompt');
          if (warningModal) {
            warningModal.style.display = 'flex';
          } else if (onetapPrompt) {
            onetapPrompt.style.display = 'block';
          }
          if (window.notifManager && typeof window.notifManager.showToast === 'function') {
            window.notifManager.showToast('Please sign in to access this section.', 'info');
          }
          return;
        }

        window.location.hash = targetView;
      });
    });

    // Global mobile stat card tap tooltip bubble
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.stat-card');
      if (card && window.innerWidth <= 768) {
        const label = card.getAttribute('data-label') || card.getAttribute('title') || card.querySelector('.stat-label')?.textContent;
        if (label) {
          const oldTooltip = document.querySelector('.stat-bubble-tooltip');
          if (oldTooltip) oldTooltip.remove();

          const tooltip = document.createElement('div');
          tooltip.className = 'stat-bubble-tooltip';
          tooltip.innerHTML = `${label}<div class="stat-bubble-arrow"></div>`;
          document.body.appendChild(tooltip);

          const rect = card.getBoundingClientRect();
          tooltip.style.left = `${rect.left + rect.width / 2}px`;
          tooltip.style.top = `${rect.top - 10}px`;

          setTimeout(() => {
            tooltip.classList.add('fade-out');
            setTimeout(() => tooltip.remove(), 250);
          }, 1800);
        }
      }
    });

    // Hardware collar scan global event listener
    document.addEventListener('pawtrack:hardware-scan', (e) => {
      const tag = e.detail?.rfidTag || 'RFID-882194';
      if (window.rfidScanner && typeof window.rfidScanner.scanAndReportTag === 'function') {
        window.rfidScanner.scanAndReportTag(tag);
      } else {
        window.location.hash = 'owner';
        setTimeout(() => {
          if (window.reportManager) {
            window.reportManager.openReportModal('found', null, { rfidTag: tag });
          }
        }, 200);
      }
    });

    if (window.lucide) window.lucide.createIcons();
  }

  handleRoute() {
    let hash = window.location.hash.replace('#', '');
    const user = window.pawStore ? window.pawStore.getGoogleUser() : null;
    const isLoggedIn = !!(user && user.name);

    // If logged out, only 'owner' (Home) is accessible. Any other view redirects to 'owner'.
    if (!isLoggedIn && hash && hash !== 'owner') {
      window.location.hash = 'owner';
      const warningModal = document.getElementById('google-required-modal');
      const onetapPrompt = document.getElementById('google-onetap-prompt');
      if (warningModal) {
        warningModal.style.display = 'flex';
      } else if (onetapPrompt) {
        onetapPrompt.style.display = 'block';
      }
      if (window.notifManager && typeof window.notifManager.showToast === 'function') {
        window.notifManager.showToast('Please sign in to access this section.', 'info');
      }
      return;
    }

    if (!hash || !this.views[hash]) {
      hash = 'owner';
    }

    this.currentView = hash;

    document.querySelectorAll('.role-tab-btn').forEach(btn => {
      if (btn.dataset.view === hash) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.renderCurrentView();
  }

  renderCurrentView() {
    const container = document.getElementById('app-viewport');
    if (!container) return;

    if (this.views[this.currentView]) {
      this.views[this.currentView].render(container);
    }
  }

  updateNotifBadge() {
    const notifs = window.pawStore.getNotifications();
    const unread = notifs.filter(n => !n.read).length;
    const badge = document.getElementById('notif-count-badge');
    const dropdownCount = document.getElementById('notif-dropdown-count');

    if (badge) {
      if (unread > 0) {
        badge.innerText = unread;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }

    if (dropdownCount) {
      dropdownCount.innerText = unread;
      dropdownCount.style.display = unread > 0 ? 'inline-block' : 'none';
    }
  }

  initModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    // Register Pet Form Submission
    const regForm = document.getElementById('register-pet-form');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!window.pawStore.isLoggedIn()) {
          const onetap = document.getElementById('google-onetap-prompt');
          if (onetap) onetap.style.display = 'block';
          const warningModal = document.getElementById('google-required-modal');
          if (warningModal) warningModal.style.display = 'flex';
          if (window.notifManager) {
            window.notifManager.showToast('Please sign in with Google to complete pet registration.', 'warning', 3500);
          }
          return;
        }

        const name = document.getElementById('reg-pet-name')?.value || 'Pet';
        const species = document.getElementById('reg-pet-species')?.value || 'Dog';
        const breed = document.getElementById('reg-pet-breed')?.value || 'Mixed';
        const gender = document.getElementById('reg-pet-gender')?.value || 'Male';
        const color = document.getElementById('reg-pet-color')?.value || 'Brown';
        const notes = document.getElementById('reg-pet-notes')?.value || '';

        const user = window.pawStore.getGoogleUser();
        const ownerName = document.getElementById('reg-owner-name')?.value || (user ? user.name : 'Pet Guardian');
        const ownerPhone = document.getElementById('reg-owner-phone')?.value || '+63 917 555 3829';
        const ownerEmail = (user ? user.email : 'guardian@pawtrack.com');
        const ownerAddress = document.getElementById('reg-owner-address')?.value || 'Metro Manila, Philippines';

        const rfidTag = regForm.dataset.prefillRfid || ('RFID-' + Math.floor(100000 + Math.random() * 900000));
        delete regForm.dataset.prefillRfid;

        const defaultPhotos = {
          Dog: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
          Cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
          Other: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80'
        };

        const newPet = {
          name,
          species,
          breed,
          gender,
          color,
          rfidTag,
          microchipNo: '98514100' + Math.floor(1000000 + Math.random() * 9000000),
          status: 'safe',
          medicalNotes: notes,
          photoUrl: document.getElementById('reg-pet-photo')?.value || defaultPhotos[species] || defaultPhotos.Dog,
          owner: {
            name: ownerName,
            phone: ownerPhone,
            email: ownerEmail,
            address: ownerAddress
          },
          registeredDate: new Date().toISOString().split('T')[0]
        };

        window.pawStore.savePet(newPet);
        regForm.reset();
        this.clearPhotoUpload();
        window.notifManager.closeModal('register-pet-modal');

        if (window.notifManager) {
          window.notifManager.showToast(`Pet "${name}" registered successfully with ${rfidTag}!`, 'success', 4000);
        }
      });
    }

    // Report Lost Form Submission
    const lostForm = document.getElementById('report-lost-form');
    if (lostForm) {
      lostForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const petId = document.getElementById('report-lost-pet-id')?.value || lostForm.dataset.petId;
        const location = document.getElementById('report-lost-location')?.value || 'Quezon City, Metro Manila';
        const notes = document.getElementById('report-lost-notes')?.value || '';

        if (petId) {
          const pet = window.pawStore.getPetById(petId);
          window.pawStore.updatePetStatus(petId, 'lost', { lastSeenLocation: location, lostNotes: notes });

          window.pawStore.addNotification({
            type: 'broadcast',
            title: `Missing Pet Alert: "${pet ? pet.name : 'Pet'}"`,
            message: `Guardian reported ${pet ? pet.name : 'pet'} (${pet ? pet.rfidTag : 'RFID'}) missing near ${location}. All municipal scanners and responder patrols alerted.`,
            petId
          });

          window.notifManager.closeModal('report-lost-modal');
          lostForm.reset();

          if (window.notifManager) {
            window.notifManager.showToast(`Missing Alert Broadcasted for "${pet ? pet.name : 'Pet'}". Pinned to Incident Map.`, 'danger', 4500);
          }
        }
      });
    }

    // Report Found Stray Pet Form Submission
    const foundForm = document.getElementById('found-pet-form');
    if (foundForm) {
      foundForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const species = document.getElementById('found-species')?.value || 'Dog';
        const breed = document.getElementById('found-breed')?.value || 'Aspin / Mixed';
        const location = document.getElementById('found-location')?.value || 'Metro Manila';
        const rfid = (document.getElementById('found-rfid')?.value || '').trim().toUpperCase();
        const phone = document.getElementById('found-phone')?.value || '';

        let matchedPet = null;
        if (rfid) {
          matchedPet = window.pawStore.getPetByRFID(rfid);
        }

        // Create Sighting Record
        const sighting = {
          species,
          breed,
          location,
          reporterPhone: phone,
          reporterName: 'Community Resident',
          dateTimeSeen: new Date().toISOString(),
          photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
          matchedPetId: matchedPet ? matchedPet.id : null,
          confidenceScore: matchedPet ? 98 : 88
        };

        // Run AI Multi-Trait Comparison
        const aiMatches = window.pawStore.runAiPetMatch(sighting);
        const topMatch = aiMatches[0];

        if (topMatch && topMatch.confidenceScore >= 75) {
          sighting.matchedPetId = topMatch.pet.id;
          sighting.confidenceScore = topMatch.confidenceScore;
          window.pawStore.addSighting(sighting);

          window.pawStore.addNotification({
            type: 'broadcast',
            title: `AI Sighting Match (${topMatch.confidenceScore}%): "${topMatch.pet.name}"`,
            message: `A community sighting in ${location} matched missing pet ${topMatch.pet.name} with ${topMatch.confidenceScore}% confidence.`,
            petId: topMatch.pet.id
          });

          if (window.notifManager) {
            window.notifManager.showToast(`AI Match Found! ${topMatch.confidenceScore}% similarity with missing pet "${topMatch.pet.name}". Guardian notified.`, 'success', 6000);
          }
        } else {
          window.pawStore.addSighting(sighting);
          window.pawStore.addNotification({
            type: 'broadcast',
            title: `Community Stray Sighting: ${species} (${breed})`,
            message: `Sighted near ${location}. Tag UID: ${rfid || 'None'}. Finder: ${phone || 'Community Member'}.`
          });

          if (window.notifManager) {
            window.notifManager.showToast('Community sighting pinned to Incident Map & Recovery Feed.', 'success', 4000);
          }
        }

        window.notifManager.closeModal('found-pet-modal');
        foundForm.reset();
      });
    }

    // Claiming Document Verification Form Submission
    const claimDocForm = document.getElementById('claiming-verification-form');
    if (claimDocForm) {
      claimDocForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const modal = document.getElementById('claiming-verification-modal');
        const impoundId = modal ? modal.dataset.impoundId : null;
        const petName = modal ? modal.dataset.petName : 'Pet';

        const govIdCheck = document.getElementById('claim-doc-govid')?.checked;
        const vaccineCheck = document.getElementById('claim-doc-vaccine')?.checked;
        const rfidCheck = document.getElementById('claim-doc-rfid')?.checked;
        const receiptNo = document.getElementById('claim-doc-receipt')?.value || 'OR-' + Math.floor(100000 + Math.random() * 900000);

        if (!govIdCheck || !vaccineCheck || !rfidCheck) {
          if (window.notifManager) {
            window.notifManager.showToast('Please verify and check all mandatory redemption credentials.', 'warning');
          }
          return;
        }

        const documents = {
          govIdVerified: true,
          vaccineBookVerified: true,
          rfidPassVerified: true,
          feeReceiptNo: receiptNo,
          verifiedAt: new Date().toISOString()
        };

        if (impoundId) {
          window.pawStore.verifyClaimDocuments(impoundId, documents, receiptNo);
        }

        if (modal) modal.classList.remove('active');
        claimDocForm.reset();

        if (window.notifManager) {
          window.notifManager.showToast(`Claim verified! Pet "${petName}" successfully released to guardian.`, 'success', 5000);
        }
      });
    }
  }

  initPhotoUpload() {
    const fileInput = document.getElementById('reg-pet-photo-file');
    const hiddenInput = document.getElementById('reg-pet-photo');
    const dropZone = document.getElementById('reg-photo-upload-zone');
    const promptBox = document.getElementById('reg-photo-prompt');
    const previewBox = document.getElementById('reg-photo-preview');
    const previewImg = document.getElementById('reg-photo-preview-img');

    if (!fileInput || !hiddenInput) return;

    const handleFile = (file) => {
      if (!file || !file.type.startsWith('image/')) {
        if (window.notifManager) window.notifManager.showToast('Please select a valid image file (PNG, JPG, WEBP).', 'warning');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        if (window.notifManager) window.notifManager.showToast('Image is too large. Please select a photo under 8MB.', 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        hiddenInput.value = dataUrl;
        if (previewImg) previewImg.src = dataUrl;
        if (promptBox) promptBox.style.display = 'none';
        if (previewBox) previewBox.style.display = 'block';
      };
      reader.readAsDataURL(file);
    };

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    });

    if (dropZone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.add('dragover');
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove('dragover');
        }, false);
      });

      dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files[0]) {
          handleFile(dt.files[0]);
        }
      }, false);
    }
  }

  clearPhotoUpload() {
    const fileInput = document.getElementById('reg-pet-photo-file');
    const hiddenInput = document.getElementById('reg-pet-photo');
    const promptBox = document.getElementById('reg-photo-prompt');
    const previewBox = document.getElementById('reg-photo-preview');
    const previewImg = document.getElementById('reg-photo-preview-img');

    if (fileInput) fileInput.value = '';
    if (hiddenInput) hiddenInput.value = '';
    if (previewImg) previewImg.src = '';
    if (promptBox) promptBox.style.display = 'flex';
    if (previewBox) previewBox.style.display = 'none';
  }

  openLightbox(url, title = 'Pet Photo', caption = '') {
    const modal = document.getElementById('image-lightbox-modal');
    const img = document.getElementById('lightbox-img');
    const t = document.getElementById('lightbox-title');
    const c = document.getElementById('lightbox-caption');

    if (modal && img) {
      img.src = url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';
      if (t) t.textContent = title;
      if (c) c.textContent = caption || 'Registered PawTrack Transponder Pass';
      modal.classList.add('active');
      if (window.lucide) window.lucide.createIcons({ root: modal });
    }
  }

  closeLightbox() {
    const modal = document.getElementById('image-lightbox-modal');
    if (modal) modal.classList.remove('active');
  }
}

function bootstrapOwnerApp() {
  if (!window.pawApp) {
    window.pawApp = new App();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapOwnerApp);
} else {
  bootstrapOwnerApp();
}
