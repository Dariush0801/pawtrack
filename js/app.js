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

    // Click "Log In" Button -> Open Google One Tap Prompt
    loginBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onetapPrompt) {
        onetapPrompt.style.display = (onetapPrompt.style.display === 'block') ? 'none' : 'block';
      }
      if (notifDropdown) notifDropdown.style.display = 'none';
      if (userDropdown) userDropdown.style.display = 'none';
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

    // Continue as Lifegiver BSM
    onetapContinue?.addEventListener('click', (e) => {
      e.stopPropagation();
      const googleUser = {
        name: 'Lifegiver BSM Social Media',
        shortName: 'Lifegiver BSM',
        email: 'socialmedialifegiverbsm@gmail.com',
        avatarInitial: 'L',
        avatarBg: '#689f38',
        verified: true,
        authenticatedAt: new Date().toISOString()
      };
      window.pawStore.setGoogleUser(googleUser);
      if (onetapPrompt) onetapPrompt.style.display = 'none';
      if (warningModal) warningModal.style.display = 'none';
      this.updateGoogleAuthUI();
      window.notifManager.showToast('Signed in as Lifegiver BSM via Google.', 'success');
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
      onetapContinue?.click();
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

    const isLoggedIn = !!(user && user.name);

    if (isLoggedIn) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (userBtn) userBtn.style.display = 'inline-flex';
      if (nameEl) nameEl.textContent = user.shortName || user.name || 'Lifegiver BSM';
      if (avatarCircle) avatarCircle.textContent = user.avatarInitial || 'L';
      if (dropdownName) dropdownName.textContent = user.name || 'Lifegiver BSM Social Media';
      if (dropdownEmail) dropdownEmail.textContent = user.email || 'socialmedialifegiverbsm@gmail.com';
      if (dropdownAvatar) dropdownAvatar.textContent = user.avatarInitial || 'L';
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
        const ownerName = document.getElementById('reg-owner-name')?.value || (user ? user.name : 'Lifegiver BSM');
        const ownerPhone = document.getElementById('reg-owner-phone')?.value || '+63 917 555 3829';
        const ownerEmail = (user ? user.email : 'socialmedialifegiverbsm@gmail.com');
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
