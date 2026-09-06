/**
 * PawTrack Hardware & Universal Smartphone NFC Collar Tag View
 */

class HardwareView {
  constructor() {
    this.tagCode = 'RFID-882194';
    this.patterns = ['paw', 'bone', 'cat'];
    this.selectedPatternIndex = 0;
    this.selectedPattern = 'paw'; // 'paw' (default signature), 'bone', 'cat'
    this.cycleInterval = null;
  }

  getPatternSvg(pattern) {
    switch (pattern) {
      case 'bone':
        return `
          <svg viewBox="0 0 100 100" class="tag-svg-emblem" fill="#121212">
            <g transform="rotate(-26 50 52)">
              <circle cx="23" cy="45" r="9.5" />
              <circle cx="23" cy="57" r="9.5" />
              <circle cx="77" cy="45" r="9.5" />
              <circle cx="77" cy="57" r="9.5" />
              <rect x="22" y="44.5" width="56" height="13" rx="2.5" />
            </g>
          </svg>
        `;
      case 'cat':
        return `
          <svg viewBox="0 0 100 100" class="tag-svg-emblem" fill="#121212">
            <path d="M 64 26 C 63 22 59 19 55 21 C 53 22 52 25 54 28 C 50 28 46 31 45 35 C 44 38 46 41 48 42 L 42 45 C 37 47 35 52 38 56 C 41 59 45 58 48 54 L 51 50 L 50 62 C 44 63 36 60 30 65 C 25 69 27 76 33 76 C 39 76 43 72 46 68 L 52 68 C 53 77 58 83 67 83 C 74 83 78 77 77 70 C 75 64 69 63 65 67 C 63 69 63 72 66 74 C 65 75 64 76 62 76 C 59 76 57 73 57 66 L 57 48 L 63 50 C 68 52 72 49 72 44 C 72 39 68 37 63 39 L 58 37 C 60 34 62 31 65 30 C 67 29 69 27 68 25 C 67 24 65 24 64 26 Z" />
          </svg>
        `;
      case 'paw':
      default:
        return `
          <svg viewBox="0 0 100 100" class="tag-svg-emblem" fill="#121212">
            <!-- 4 Raised Toe Pads -->
            <ellipse cx="23" cy="38" rx="7.5" ry="11.5" transform="rotate(-22 23 38)" />
            <ellipse cx="40.5" cy="25" rx="8" ry="12.5" transform="rotate(-7 40.5 25)" />
            <ellipse cx="59.5" cy="25" rx="8" ry="12.5" transform="rotate(7 59.5 25)" />
            <ellipse cx="77" cy="38" rx="7.5" ry="11.5" transform="rotate(22 77 38)" />
            <!-- Large Arched Palm Pad -->
            <path d="M 23 68 C 21 53 34 44.5 50 44.5 C 66 44.5 79 53 77 68 C 75 74.5 64 74 50 72 C 36 74 25 74.5 23 68 Z" />
          </svg>
        `;
    }
  }

  startCycleTimer() {
    this.stopCycleTimer();
    this.cycleInterval = setInterval(() => {
      const slot = document.getElementById('tag-emblem-slot');
      if (!slot) {
        this.stopCycleTimer();
        return;
      }
      this.selectedPatternIndex = (this.selectedPatternIndex + 1) % this.patterns.length;
      const nextPattern = this.patterns[this.selectedPatternIndex];
      this.morphToPattern(nextPattern);
    }, 3000);
  }

  stopCycleTimer() {
    if (this.cycleInterval) {
      clearInterval(this.cycleInterval);
      this.cycleInterval = null;
    }
  }

  morphToPattern(pattern) {
    this.selectedPattern = pattern;
    const slot = document.getElementById('tag-emblem-slot');
    if (!slot) return;

    slot.classList.add('tag-morph-out');
    setTimeout(() => {
      slot.innerHTML = this.getPatternSvg(pattern);
      slot.classList.remove('tag-morph-out');
      slot.classList.add('tag-morph-in');
      setTimeout(() => {
        slot.classList.remove('tag-morph-in');
      }, 350);
    }, 200);
  }

  setPattern(pattern) {
    this.selectedPattern = pattern;
    const idx = this.patterns.indexOf(pattern);
    if (idx !== -1) {
      this.selectedPatternIndex = idx;
    }
    const emblemSlot = document.getElementById('tag-emblem-slot');
    if (emblemSlot) {
      emblemSlot.innerHTML = this.getPatternSvg(pattern);
    }
  }

  render(container) {
    const t = (k, d) => (window.pawI18n ? window.pawI18n.t(k, d) : d);

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h1>${t('hardware.title', 'Universal NFC & RFID Collar Tag Specifications')}</h1>
          <div class="view-subtitle">${t('hardware.subtitle', 'Review the standardized smartphone NFC collar tag, reader architecture, and municipal pet recovery integration.')}</div>
        </div>
      </div>

      <div class="hardware-studio-grid">
        <!-- Left: Interactive 3D Tag Preview (Unified Circular Design with Keychain) -->
        <div class="glass-card filament-preview-stage">
          <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700; letter-spacing:0.05em; margin-bottom:0.75rem;">
            ${t('hardware.previewHeading', 'Standardized Collar Tag Prototype')}
          </div>

          <div class="tag-preview-wrapper">
            <!-- Metallic Split Ring & Keychain Rig -->
            <div class="tag-keychain-rig">
              <div class="tag-keychain-splitring"></div>
              <div class="tag-keychain-chain">
                <div class="tag-chain-link"></div>
                <div class="tag-chain-link"></div>
              </div>
              <div class="tag-jumpring"></div>
            </div>

            <!-- White Circular Tag Model with Embossed Emblem (Auto-morphing every 3s) -->
            <div class="tag-3d-model" id="tag-3d-preview" onclick="window.hardwareView.scanAndReport()" title="${t('hardware.tagClickTitle', 'Tap or click to simulate phone NFC collar scan')}">
              <div class="tag-hole"></div>
              <div class="tag-emboss-graphic" id="tag-emblem-slot">
                ${this.getPatternSvg(this.selectedPattern)}
              </div>
              <div class="tag-nfc-subtle-indicator">NFC • RFID</div>
            </div>
          </div>

          <!-- Simulate Phone NFC Scan Button -->
          <div style="margin-top:1.25rem; width:100%;">
            <button class="btn btn-primary" onclick="window.hardwareView.scanAndReport()" style="width:100%; display:flex; align-items:center; justify-content:center; gap:8px; font-weight:700; box-shadow:0 4px 14px rgba(234,157,30,0.35);">
              <i data-lucide="scan-line" style="width:18px; height:18px;"></i>
              <span>${t('hardware.scanNfcBtn', 'Simulate Phone NFC Tap (Report Pet)')}</span>
            </button>
          </div>

          <!-- Smartphone NFC Detection Feature Card -->
          <div style="margin-top:1.25rem; width:100%; background:var(--bg-surface-elevated, rgba(35,19,10,0.6)); border:1px solid var(--border-subtle, rgba(234,157,30,0.25)); border-radius:var(--radius-md, 12px); padding:1rem; text-align:left;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:0.5rem;">
              <div style="width:28px; height:28px; border-radius:6px; background:linear-gradient(135deg, #ea9d1e, #b85410); color:#180d07; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <i data-lucide="smartphone" style="width:16px; height:16px;"></i>
              </div>
              <strong style="font-size:0.88rem; color:var(--text-main);">${t('hardware.nfcPhoneTitle', 'Smartphone NFC Instant Sighting')}</strong>
            </div>
            <p style="font-size:0.78rem; color:var(--text-muted); line-height:1.45; margin:0 0 0.75rem;">
              ${t('hardware.nfcPhoneDesc', 'Standardized single-mold design with integrated NTAG213 NFC chip. Anyone finding the pet can simply tap their NFC-enabled smartphone against the tag to open the pet profile and report dialog instantly.')}
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              <span class="badge" style="background:rgba(234,157,30,0.15); color:var(--primary, #ea9d1e); font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:99px; border:1px solid rgba(234,157,30,0.25);">
                ✓ 13.56 MHz NFC Type 2
              </span>
              <span class="badge" style="background:rgba(22,163,74,0.15); color:#16a34a; font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:99px; border:1px solid rgba(22,163,74,0.25);">
                ✓ Zero Battery (Passive)
              </span>
              <span class="badge" style="background:rgba(184,84,16,0.15); color:#b85410; font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:99px; border:1px solid rgba(184,84,16,0.25);">
                ✓ IP67 Waterproof Tag
              </span>
            </div>
          </div>
        </div>

        <!-- Right: Hardware System Specifications -->
        <div class="glass-card" style="padding:1.75rem; display:flex; flex-direction:column; gap:1.25rem;">
          <h3 style="font-size:1.2rem; display:flex; align-items:center; gap:0.5rem;">
            <i data-lucide="cpu" style="color:var(--primary);"></i> ${t('hardware.archTitle', 'Hardware & Reader Architecture')}
          </h3>

          <div style="display:flex; flex-direction:column; gap:1rem;">
            <div style="background:var(--bg-surface-elevated); padding:1rem; border-radius:var(--radius-md); border-left:3px solid var(--primary);">
              <strong style="font-size:0.9rem; color:var(--text-main);">${t('hardware.card1Title', '1. Dual-Frequency (13.56 MHz NFC + 134.2 kHz RFID)')}</strong>
              <p style="font-size:0.825rem; color:var(--text-muted); margin-top:0.25rem;">
                ${t('hardware.card1Desc', 'Encapsulated inside a sealed waterproof enclosure. Features high-frequency NTAG213 NFC for citizen phone taps and 134.2 kHz FDX-B for municipal scanner reads.')}
              </p>
            </div>

            <div style="background:var(--bg-surface-elevated); padding:1rem; border-radius:var(--radius-md); border-left:3px solid var(--secondary);">
              <strong style="font-size:0.9rem; color:var(--text-main);">${t('hardware.card2Title', '2. Smartphone NFC Tap-to-Report (No App Needed)')}</strong>
              <p style="font-size:0.825rem; color:var(--text-muted); margin-top:0.25rem;">
                ${t('hardware.card2Desc', 'Works natively on Apple iOS and Android smartphones. Tapping the collar tag launches the PawTrack web portal and opens the report dialog with one touch.')}
              </p>
            </div>

            <div style="background:var(--bg-surface-elevated); padding:1rem; border-radius:var(--radius-md); border-left:3px solid var(--warning);">
              <strong style="font-size:0.9rem; color:var(--text-main);">${t('hardware.card3Title', '3. Standardized Impact-Resistant Enclosure')}</strong>
              <p style="font-size:0.825rem; color:var(--text-muted); margin-top:0.25rem;">
                ${t('hardware.card3Desc', 'Unified single-design casing fabricated with durable weather-sealed PETG, reinforced steel eyelet for collar attachment, and IP67 water resistance.')}
              </p>
            </div>

            <div style="background:var(--bg-surface-elevated); padding:1rem; border-radius:var(--radius-md); border-left:3px solid #16a34a;">
              <strong style="font-size:0.9rem; color:var(--text-main);">${t('hardware.card4Title', '4. Recorded Checkpoint Detection (No Battery or GPS Needed)')}</strong>
              <p style="font-size:0.825rem; color:var(--text-muted); margin-top:0.25rem;">
                ${t('hardware.card4Desc', 'Passively powered by the interrogating NFC/RFID field. Eliminates heavy batteries and satellite fees while ensuring instant identification during recovery.')}
              </p>
            </div>
          </div>

          <div style="border-top:1px solid var(--border-subtle); padding-top:1rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <span style="font-size:0.8rem; color:var(--text-muted);">${t('hardware.audioVerify', 'Acoustic Hardware Verification')}</span>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-outline btn-sm" onclick="window.rfidScanner.playSuccessChirp()">
                <i data-lucide="volume-2"></i> ${t('hardware.testBeeperBtn', 'Test Reader Audio Beeper')}
              </button>
              <button class="btn btn-primary btn-sm" onclick="window.hardwareView.scanAndReport()">
                <i data-lucide="scan-line"></i> <span>${t('hardware.scanCollarBtn', 'Simulate Phone NFC Tap')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons({ root: container });
    this.startCycleTimer();
  }

  scanAndReport(rfidTag = 'RFID-882194') {
    if (window.rfidScanner && typeof window.rfidScanner.scanAndReportTag === 'function') {
      window.rfidScanner.scanAndReportTag(rfidTag);
    } else {
      window.location.hash = 'owner';
      setTimeout(() => {
        if (window.reportManager) {
          window.reportManager.openReportModal('found', null, { rfidTag });
        }
      }, 200);
    }
  }

  setFilament(colorHex, nameOrKey, defaultFallback) {
    // Retained for backward compatibility
    this.selectedFilament = colorHex || '#ea9d1e';
  }
}

window.hardwareView = new HardwareView();

