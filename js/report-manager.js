/**
 * PawTrack Report Manager - Interactive Pin-Drop Map & Lost/Found Pet Reporting
 */

const PRESET_LOCATIONS = [
  // Quezon City Congressional Districts (Primary Presets)
  { name: 'District 1 (La Loma / SFDM / Project 6)', lat: 14.6380, lng: 121.0150, group: 'QC District 1' },
  { name: 'District 2 (Commonwealth / Batasan / Payatas)', lat: 14.6850, lng: 121.0850, group: 'QC District 2' },
  { name: 'District 3 (Cubao / Katipunan / Loyola / Eastwood)', lat: 14.6200, lng: 121.0530, group: 'QC District 3' },
  { name: 'District 4 (Diliman / Tomas Morato / UP / New Manila)', lat: 14.6538, lng: 121.0685, group: 'QC District 4' },
  { name: 'District 5 (Novaliches / Fairview / Lagro)', lat: 14.7180, lng: 121.0350, group: 'QC District 5' },
  { name: 'District 6 (Tandang Sora / Balintawak / Culiat)', lat: 14.6750, lng: 121.0350, group: 'QC District 6' },

  // Quezon City Hubs & Landmarks
  { name: 'Quezon Memorial Circle (Elliptical Road)', lat: 14.6500, lng: 121.0400, group: 'Quezon City' },
  { name: 'QC - Tomas Morato / Scout Area', lat: 14.6342, lng: 121.0375, group: 'Quezon City' },
  { name: 'QC - Cubao / Araneta City', lat: 14.6200, lng: 121.0530, group: 'Quezon City' },
  { name: 'QC - Diliman / UP Campus', lat: 14.6538, lng: 121.0685, group: 'Quezon City' },
  { name: 'QC - Eastwood City / Libis', lat: 14.6090, lng: 121.0800, group: 'Quezon City' },
  { name: 'QC - Fairview / Regalado', lat: 14.7000, lng: 121.0650, group: 'Quezon City' },
  { name: 'QC - Novaliches Proper', lat: 14.7180, lng: 121.0350, group: 'Quezon City' },
  { name: 'QC - Project 6 / Mindanao Avenue', lat: 14.6650, lng: 121.0300, group: 'Quezon City' },
  { name: 'QC - Batasan Hills / Sandiganbayan', lat: 14.6890, lng: 121.0920, group: 'Quezon City' },
  { name: 'QC - Loyola Heights / Katipunan Avenue', lat: 14.6390, lng: 121.0770, group: 'Quezon City' },
  { name: 'QC - New Manila / E. Rodriguez', lat: 14.6190, lng: 121.0300, group: 'Quezon City' },
  { name: 'QC - La Loma / Calavite', lat: 14.6310, lng: 121.0020, group: 'Quezon City' },
  { name: 'QC - Tandang Sora / Banlat', lat: 14.6750, lng: 121.0450, group: 'Quezon City' },
  { name: 'QC - Payatas / Litex', lat: 14.7050, lng: 121.1080, group: 'Quezon City' },

  // Surrounding Metro Manila areas
  { name: 'Manila City (City Hall / Central)', lat: 14.5995, lng: 120.9842, group: 'Metro Manila' },
  { name: 'Makati CBD / Ayala Avenue', lat: 14.5547, lng: 121.0244, group: 'Metro Manila' },
  { name: 'Taguig - BGC (Bonifacio Global City)', lat: 14.5500, lng: 121.0500, group: 'Metro Manila' },
  { name: 'Pasig City (Ortigas Center)', lat: 14.5860, lng: 121.0610, group: 'Metro Manila' },
  { name: 'Mandaluyong City (Shaw / EDSA)', lat: 14.5794, lng: 121.0359, group: 'Metro Manila' },
  { name: 'Marikina City (Bayan / Shoe Avenue)', lat: 14.6507, lng: 121.1029, group: 'Metro Manila' },
  { name: 'San Juan City (Greenhills)', lat: 14.6019, lng: 121.0355, group: 'Metro Manila' },
  { name: 'Caloocan City (Monumento / South)', lat: 14.6570, lng: 120.9840, group: 'Metro Manila' },
  { name: 'Valenzuela City (Karuhatan / McArthur)', lat: 14.7011, lng: 120.9830, group: 'Metro Manila' },
  { name: 'Malabon City (Concepcion / Tugatog)', lat: 14.6625, lng: 120.9570, group: 'Metro Manila' },
  { name: 'Navotas City (Fish Port / C4)', lat: 14.6667, lng: 120.9417, group: 'Metro Manila' },
  { name: 'Antipolo City / Rizal', lat: 14.5842, lng: 121.1763, group: 'Rizal' },
  { name: 'Cainta / Taytay, Rizal', lat: 14.5700, lng: 121.1200, group: 'Rizal' },
  { name: 'Bacoor / Imus, Cavite', lat: 14.4624, lng: 120.9645, group: 'Cavite' }
];

class ReportManager {
  constructor() {
    this.currentType = 'found'; // 'found' or 'missing'
    this.currentViewMode = 'map'; // 'map' or 'upload'
    this.uploadedPhotoData = null;
    this.pinnedLat = 14.6500;
    this.pinnedLng = 121.0400;
    this.pinnedLocationName = 'Quezon City, Metro Manila';
    this.map = null;
    this.marker = null;
    this.currentMapType = 'roadmap'; // 'roadmap', 'satellite', 'hybrid', 'dark'
    this.currentTileLayer = null;
    this.currentSuggestions = [];
    this.selectedSuggestionIndex = -1;

    // Sighting modal state
    this.sightingPhotoData = null;
    this.sightingMap = null;
    this.sightingMarker = null;
    this.sightingPinnedLat = 14.6375;
    this.sightingPinnedLng = 121.0362;

    // Attach global click handler to dismiss location suggestions
    document.addEventListener('click', (e) => {
      const wrap = document.getElementById('report-location-search-wrap');
      if (wrap && !wrap.contains(e.target)) {
        this.hideSuggestions();
      }
    });
  }

  openReportModal(type = 'found', petId = null, prefill = {}) {
    this.currentType = type;
    const modal = document.getElementById('report-pet-modal');
    if (!modal) return;

    this.removeUploadedPhoto(false);
    this.setType(type);
    this.setViewMode('map');
    this.populatePetsDropdown(petId);

    if (prefill && prefill.rfidTag) {
      const rfidInput = document.getElementById('report-found-rfid');
      if (rfidInput) rfidInput.value = prefill.rfidTag;
    }
    if (prefill && prefill.location) {
      const locInput = document.getElementById('report-found-location');
      if (locInput) locInput.value = prefill.location;
    }

    modal.classList.add('active');

    // Initialize or refresh pin-drop map after modal opens
    setTimeout(() => {
      this.initPinMap();
    }, 150);
  }

  closeModal() {
    const modal = document.getElementById('report-pet-modal');
    if (modal) modal.classList.remove('active');
    this.toggleInstructionGuide(false);
  }

  toggleInstructionGuide(forceState = null) {
    const panel = document.getElementById('report-instructions-panel');
    const helpBtn = document.getElementById('report-help-btn');
    if (!panel) return;

    const isShown = panel.style.display !== 'none';
    const shouldShow = forceState !== null ? forceState : !isShown;

    if (shouldShow) {
      this.updateInstructionsContent();
      panel.style.display = 'block';
      if (helpBtn) helpBtn.classList.add('active');
    } else {
      panel.style.display = 'none';
      if (helpBtn) helpBtn.classList.remove('active');
    }
  }

  updateInstructionsContent() {
    const content = document.getElementById('report-instructions-content');
    const titleEl = document.getElementById('report-instructions-title');
    if (!content) return;

    const t = (k, d) => (window.pawI18n ? window.pawI18n.t(k, d) : d);

    if (this.currentType === 'found') {
      if (titleEl) {
        titleEl.textContent = t('report.guideFoundTitle', 'How to Report a Found Pet (Step-by-Step)');
        titleEl.setAttribute('data-i18n', 'report.guideFoundTitle');
      }
      content.innerHTML = `
        <div class="report-step-card">
          <div class="report-step-num">1</div>
          <div class="report-step-content">
            <strong data-i18n="report.step1FoundTitle">${t('report.step1FoundTitle', 'Pin Sighting Location')}</strong>
            <p data-i18n="report.step1FoundDesc">${t('report.step1FoundDesc', 'Tap or drag the map pin to mark where you saw or secured the stray pet.')}</p>
          </div>
        </div>
        <div class="report-step-card">
          <div class="report-step-num">2</div>
          <div class="report-step-content">
            <strong data-i18n="report.step2FoundTitle">${t('report.step2FoundTitle', 'Take or Upload Photo')}</strong>
            <p data-i18n="report.step2FoundDesc">${t('report.step2FoundDesc', 'Switch to "Upload" to attach a clear picture for AI image matching.')}</p>
          </div>
        </div>
        <div class="report-step-card">
          <div class="report-step-num">3</div>
          <div class="report-step-content">
            <strong data-i18n="report.step3FoundTitle">${t('report.step3FoundTitle', 'Check RFID Collar Tag')}</strong>
            <p data-i18n="report.step3FoundDesc">${t('report.step3FoundDesc', 'If the pet has a collar or 134.2 kHz RFID tag, type the number to alert the owner.')}</p>
          </div>
        </div>
        <div class="report-step-card">
          <div class="report-step-num">4</div>
          <div class="report-step-content">
            <strong data-i18n="report.step4FoundTitle">${t('report.step4FoundTitle', 'Submit & Notify Guardian')}</strong>
            <p data-i18n="report.step4FoundDesc">${t('report.step4FoundDesc', 'Click "Submit and Notify" — the owner and municipal shelters receive instant alerts.')}</p>
          </div>
        </div>
      `;
    } else {
      if (titleEl) {
        titleEl.textContent = t('report.guideMissingTitle', 'How to Broadcast a Missing Pet Alert (Step-by-Step)');
        titleEl.setAttribute('data-i18n', 'report.guideMissingTitle');
      }
      content.innerHTML = `
        <div class="report-step-card">
          <div class="report-step-num">1</div>
          <div class="report-step-content">
            <strong data-i18n="report.step1MissingTitle">${t('report.step1MissingTitle', 'Select Registered Pet')}</strong>
            <p data-i18n="report.step1MissingDesc">${t('report.step1MissingDesc', 'Choose your registered pet from the list or enter pet name and description.')}</p>
          </div>
        </div>
        <div class="report-step-card">
          <div class="report-step-num">2</div>
          <div class="report-step-content">
            <strong data-i18n="report.step2MissingTitle">${t('report.step2MissingTitle', 'Pin Last Seen Location')}</strong>
            <p data-i18n="report.step2MissingDesc">${t('report.step2MissingDesc', 'Mark the exact street, barangay, or park where your pet was last seen.')}</p>
          </div>
        </div>
        <div class="report-step-card">
          <div class="report-step-num">3</div>
          <div class="report-step-content">
            <strong data-i18n="report.step3MissingTitle">${t('report.step3MissingTitle', 'Attach / Upload Pet Photo')}</strong>
            <p data-i18n="report.step3MissingDesc">${t('report.step3MissingDesc', 'Switch to "Upload" tab to attach a clear, recent picture for AI community matching.')}</p>
          </div>
        </div>
        <div class="report-step-card">
          <div class="report-step-num">4</div>
          <div class="report-step-content">
            <strong data-i18n="report.step4MissingTitle">${t('report.step4MissingTitle', 'Broadcast Emergency Alert')}</strong>
            <p data-i18n="report.step4MissingDesc">${t('report.step4MissingDesc', 'Click "Broadcast Missing Alert" to post on the live Incident Map and notify all patrols.')}</p>
          </div>
        </div>
      `;
    }
  }

  setViewMode(mode) {
    this.currentViewMode = mode;
    const mapBtn = document.getElementById('report-mode-map-btn');
    const uploadBtn = document.getElementById('report-mode-upload-btn');
    const mapContainer = document.getElementById('report-map-view-container');
    const uploadContainer = document.getElementById('report-upload-view-container');
    const headerTitle = document.getElementById('report-header-title');

    if (mode === 'map') {
      if (mapBtn) mapBtn.classList.add('active');
      if (uploadBtn) uploadBtn.classList.remove('active');
      if (mapContainer) mapContainer.style.display = 'flex';
      if (uploadContainer) uploadContainer.style.display = 'none';
      if (headerTitle) {
        headerTitle.textContent = window.pawI18n ? window.pawI18n.t('report.pinnedLoc', 'Pinned Location:') : 'Pinned Location:';
        headerTitle.setAttribute('data-i18n', 'report.pinnedLoc');
      }
      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
      }, 80);
    } else {
      if (uploadBtn) uploadBtn.classList.add('active');
      if (mapBtn) mapBtn.classList.remove('active');
      if (mapContainer) mapContainer.style.display = 'none';
      if (uploadContainer) uploadContainer.style.display = 'flex';
      if (headerTitle) {
        headerTitle.textContent = window.pawI18n ? window.pawI18n.t('report.photoHeader', 'Pet Photo:') : 'Pet Photo:';
        headerTitle.setAttribute('data-i18n', 'report.photoHeader');
      }
    }
  }

  setType(type) {
    this.currentType = type;
    const tabFound = document.getElementById('report-tab-found');
    const tabMissing = document.getElementById('report-tab-missing');
    const fieldsFound = document.getElementById('report-fields-found');
    const fieldsMissing = document.getElementById('report-fields-missing');
    const submitBtn = document.getElementById('report-submit-btn');
    const submitLabel = document.getElementById('report-submit-label');
    const modalTitle = document.getElementById('report-modal-title');
    const modalSub = document.getElementById('report-modal-sub');
    const modeToggle = document.getElementById('report-view-mode-toggle');

    if (modeToggle) modeToggle.style.display = 'flex';

    if (type === 'found') {
      tabFound?.classList.add('active');
      tabMissing?.classList.remove('active');
      if (fieldsFound) fieldsFound.style.display = 'block';
      if (fieldsMissing) fieldsMissing.style.display = 'none';
      if (modalTitle) {
        modalTitle.textContent = window.pawI18n ? window.pawI18n.t('report.modalTitleFound', 'Found this pet?') : 'Found this pet?';
        modalTitle.setAttribute('data-i18n', 'report.modalTitleFound');
      }
      if (modalSub) {
        modalSub.textContent = window.pawI18n ? window.pawI18n.t('report.modalSubFound', 'Drop a pin at the spot where you found the pet, add a quick note if you\'d like, and notify the owner.') : 'Drop a pin at the spot where you found the pet, add a quick note if you\'d like, and notify the owner.';
        modalSub.setAttribute('data-i18n', 'report.modalSubFound');
      }
      if (submitLabel) {
        submitLabel.textContent = window.pawI18n ? window.pawI18n.t('report.btnSubmitFound', 'Submit and Notify') : 'Submit and Notify';
        submitLabel.setAttribute('data-i18n', 'report.btnSubmitFound');
      }
      if (submitBtn) {
        submitBtn.className = 'btn btn-primary';
      }
    } else {
      tabMissing?.classList.add('active');
      tabFound?.classList.remove('active');
      if (fieldsFound) fieldsFound.style.display = 'none';
      if (fieldsMissing) fieldsMissing.style.display = 'block';
      if (modalTitle) {
        modalTitle.textContent = window.pawI18n ? window.pawI18n.t('report.modalTitleMissing', 'Report Pet as Missing') : 'Report Pet as Missing';
        modalTitle.setAttribute('data-i18n', 'report.modalTitleMissing');
      }
      if (modalSub) {
        modalSub.textContent = window.pawI18n ? window.pawI18n.t('report.modalSubMissing', 'Drop a pin where the pet was last seen, attach a photo, and broadcast an emergency alert to shelters and public map.') : 'Drop a pin where the pet was last seen, attach a photo, and broadcast an emergency alert to shelters and public map.';
        modalSub.setAttribute('data-i18n', 'report.modalSubMissing');
      }
      if (submitLabel) {
        submitLabel.textContent = window.pawI18n ? window.pawI18n.t('report.btnMissingAlert', 'Missing Alert') : 'Missing Alert';
        submitLabel.setAttribute('data-i18n', 'report.btnMissingAlert');
      }
      if (submitBtn) {
        submitBtn.className = 'btn btn-danger';
      }
      this.updateMissingPhotoStatus();
    }

    this.setViewMode(this.currentViewMode || 'map');

    const panel = document.getElementById('report-instructions-panel');
    if (panel && panel.style.display !== 'none') {
      this.updateInstructionsContent();
    }

    if (this.marker) {
      this.updatePinIcon();
    }
  }

  populatePetsDropdown(selectedPetId = null) {
    const select = document.getElementById('report-missing-pet-select');
    if (!select || !window.pawStore) return;

    const selectPetPh = window.pawI18n ? window.pawI18n.t('report.selectPetPh', '-- Select Registered Pet --') : '-- Select Registered Pet --';
    const otherPetText = window.pawI18n ? window.pawI18n.t('report.otherPet', '+ Other / Unregistered Pet') : '+ Other / Unregistered Pet';

    const pets = window.pawStore.getPets();
    let options = `<option value="">${selectPetPh}</option>`;

    pets.forEach(p => {
      const isSelected = selectedPetId && String(p.id) === String(selectedPetId);
      options += `<option value="${p.id}" ${isSelected ? 'selected' : ''}>${p.name} (${p.breed || p.species} - ${p.rfidTag})</option>`;
    });

    options += `<option value="custom">${otherPetText}</option>`;
    select.innerHTML = options;

    if (selectedPetId) {
      this.handlePetSelect(selectedPetId);
    } else {
      this.updateMissingPhotoStatus(null, false);
    }
  }

  handlePetSelect(petId) {
    const customWrap = document.getElementById('report-missing-custom-name-wrap');
    if (petId === 'custom') {
      if (customWrap) customWrap.style.display = 'block';
      this.updateMissingPhotoStatus(null, false);
    } else {
      if (customWrap) customWrap.style.display = 'none';
      if (petId && window.pawStore) {
        const pets = window.pawStore.getPets();
        const pet = pets.find(p => String(p.id) === String(petId));
        if (pet) {
          const locInput = document.getElementById('report-missing-location');
          if (locInput && pet.lastSeenLocation) {
            locInput.value = pet.lastSeenLocation;
          }
          if (pet.photoUrl || pet.photo) {
            this.setUploadedPhoto(pet.photoUrl || pet.photo);
            this.updateMissingPhotoStatus(pet.name, true);
          } else {
            this.removeUploadedPhoto(false);
            this.updateMissingPhotoStatus(null, false);
          }
        }
      } else {
        this.updateMissingPhotoStatus(null, false);
      }
    }
  }

  updateMissingPhotoStatus(petName = null, isRegistered = false) {
    const statusText = document.getElementById('report-missing-photo-status-text');
    const statusBtn = document.getElementById('report-missing-photo-status-btn');
    if (!statusText) return;

    if (this.uploadedPhotoData) {
      if (isRegistered && petName) {
        statusText.textContent = `Attached: ${petName}'s profile photo`;
        statusText.style.color = 'var(--text-main, #ffffff)';
      } else {
        statusText.textContent = 'Custom pet photo attached';
        statusText.style.color = 'var(--primary, #ea9d1e)';
      }
      if (statusBtn) statusBtn.textContent = 'Change / View';
    } else {
      statusText.textContent = 'No photo attached';
      statusText.style.color = 'var(--text-muted, #a89f91)';
      if (statusBtn) statusBtn.textContent = 'Attach / Upload Photo';
    }
  }

  initPinMap() {
    const container = document.getElementById('report-pin-map');
    if (!container || !window.L) return;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    this.map = window.L.map('report-pin-map', {
      scrollWheelZoom: true,
      zoomControl: true
    }).setView([this.pinnedLat, this.pinnedLng], 13);

    // Set initial Google Maps tile layer
    this.setMapLayer(this.currentMapType || 'roadmap');

    // Create custom draggable pin
    const pinIcon = this.createPinIcon();
    this.marker = window.L.marker([this.pinnedLat, this.pinnedLng], {
      icon: pinIcon,
      draggable: true,
      autoPan: true
    }).addTo(this.map);

    this.marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      this.updatePinnedCoords(pos.lat, pos.lng);
    });

    this.map.on('click', (e) => {
      this.updatePinnedCoords(e.latlng.lat, e.latlng.lng);
      if (this.marker) {
        this.marker.setLatLng(e.latlng);
      }
    });

    this.updatePinnedCoords(this.pinnedLat, this.pinnedLng);
    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 200);
  }

  setMapLayer(type) {
    if (!this.map || !window.L) return;
    this.currentMapType = type;

    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }

    let tileUrl;
    let tileOptions = {
      maxZoom: 20,
      attribution: '&copy; Google Maps / OpenStreetMap contributors'
    };

    if (type === 'satellite') {
      // High-resolution Photographic Earth Imagery (Actual real place view)
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      tileOptions.attribution = '&copy; Esri World Imagery & Maxar Earth';
    } else if (type === 'hybrid') {
      // Google Hybrid (Satellite with Street Overlays)
      tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      tileOptions.attribution = '&copy; Google Maps Hybrid Imagery';
    } else if (type === 'dark') {
      // Night / Dark Theme
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      tileOptions.attribution = '&copy; CARTO & OpenStreetMap';
    } else {
      // Google Roadmap
      tileUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      tileOptions.attribution = '&copy; Google Maps';
    }

    this.currentTileLayer = window.L.tileLayer(tileUrl, tileOptions);
    this.currentTileLayer.on('tileerror', () => {
      if (this.currentMapType !== 'fallback') {
        this.currentMapType = 'fallback';
        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap & CARTO',
          maxZoom: 19
        }).addTo(this.map);
      }
    });

    this.currentTileLayer.addTo(this.map);

    const dock = document.getElementById('report-map-layer-dock');
    if (dock) {
      dock.querySelectorAll('.gmap-layer-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(`'${type}'`));
      });
    }
  }

  locateMe() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          this.jumpToLocation(lat, lng, 'Current GPS Location');
        },
        () => {
          this.jumpToLocation(14.6500, 121.0350, 'Central Rescue Grid');
        }
      );
    } else {
      this.jumpToLocation(14.6500, 121.0350, 'Central Rescue Grid');
    }
  }

  createPinIcon() {
    const isMissing = this.currentType === 'missing';
    const bgGradient = isMissing ? 'linear-gradient(135deg, #ba3820, #54280e)' : 'linear-gradient(135deg, #ea9d1e, #b85410)';
    const iconSvg = isMissing
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 10.5c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-6 2c1.38 0 2.5-1.12 2.5-2.5S7.38 7.5 6 7.5 3.5 8.62 3.5 10s1.12 2.5 2.5 2.5zm12 0c1.38 0 2.5-1.12 2.5-2.5S19.38 7.5 18 7.5s-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zM12 12c-2.76 0-5 2.24-5 5 0 2.21 1.79 4 4 4 1.1 0 2-.9 2-2 0 1.1.9 2 2 2 2.21 0 4-1.79 4-4 0-2.76-2.24-5-5-5z"/></svg>`;

    return window.L.divIcon({
      className: 'custom-report-pin',
      html: `
        <div style="position:relative; transform:translate(-50%, -100%); cursor:grab;">
          <div style="width:38px; height:38px; border-radius:50% 50% 50% 0; background:${bgGradient}; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; box-shadow:0 8px 18px rgba(0,0,0,0.5); border:2px solid #ffffff;">
            <div style="transform:rotate(45deg); display:flex; align-items:center; justify-content:center;">${iconSvg}</div>
          </div>
          <div style="width:10px; height:4px; border-radius:50%; background:rgba(0,0,0,0.4); margin:2px auto 0; filter:blur(1px);"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  }

  updatePinIcon() {
    if (!this.marker || !window.L) return;
    this.marker.setIcon(this.createPinIcon());
  }

  updatePinnedCoords(lat, lng) {
    this.pinnedLat = parseFloat(lat.toFixed(5));
    this.pinnedLng = parseFloat(lng.toFixed(5));

    const latInput = document.getElementById('report-pinned-lat');
    const lngInput = document.getElementById('report-pinned-lng');
    const badge = document.getElementById('report-pinned-coords-badge');

    if (latInput) latInput.value = this.pinnedLat;
    if (lngInput) lngInput.value = this.pinnedLng;
    if (badge) badge.textContent = `${this.pinnedLat.toFixed(5)}, ${this.pinnedLng.toFixed(5)}`;
  }

  handleLocationSearch(query) {
    const trimmed = (query || '').trim();
    const clearBtn = document.getElementById('report-search-clear-btn');
    const suggestionsBox = document.getElementById('report-location-suggestions');
    if (!suggestionsBox) return;

    if (clearBtn) {
      clearBtn.style.display = trimmed.length > 0 ? 'flex' : 'none';
    }

    if (trimmed.length < 1) {
      suggestionsBox.style.display = 'none';
      suggestionsBox.innerHTML = '';
      this.selectedSuggestionIndex = -1;
      return;
    }

    const lower = trimmed.toLowerCase();
    const matches = PRESET_LOCATIONS.filter(loc => {
      return loc.name.toLowerCase().includes(lower) || loc.group.toLowerCase().includes(lower);
    });

    this.renderSuggestions(matches, trimmed);
  }

  renderSuggestions(matches, query) {
    const suggestionsBox = document.getElementById('report-location-suggestions');
    if (!suggestionsBox) return;

    this.currentSuggestions = matches;
    this.selectedSuggestionIndex = -1;

    let html = '';

    if (matches.length > 0) {
      html += matches.slice(0, 8).map((loc, idx) => `
        <div class="report-suggestion-item" data-index="${idx}" onclick="window.reportManager.selectLocation(${loc.lat}, ${loc.lng}, '${loc.name.replace(/'/g, "\\'")}')">
          <div style="display:flex; align-items:center; gap:8px; min-width:0;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary, #ea9d1e); flex-shrink:0;">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span class="report-suggestion-name">${loc.name}</span>
          </div>
          <span class="report-suggestion-badge">${loc.group}</span>
        </div>
      `).join('');
    }

    // Dynamic online geocoder option for any custom street, barangay, or landmark
    if (query && query.length >= 2) {
      html += `
        <div class="report-suggestion-item report-suggestion-online" onclick="window.reportManager.searchOnlineNominatim('${query.replace(/'/g, "\\'")}')">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#38bdf8;">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Search exact place online: "<strong>${query}</strong>"</span>
          </div>
          <span class="report-suggestion-badge" style="background:rgba(56,189,248,0.15); color:#38bdf8;">Live GPS</span>
        </div>
      `;
    }

    suggestionsBox.innerHTML = html;
    suggestionsBox.style.display = 'block';
  }

  handleSearchKeydown(e) {
    const suggestionsBox = document.getElementById('report-location-suggestions');
    if (!suggestionsBox || suggestionsBox.style.display === 'none') {
      if (e.key === 'Enter') {
        e.preventDefault();
        const input = document.getElementById('report-location-search-input');
        if (input && input.value) {
          this.searchOnlineNominatim(input.value);
        }
      }
      return;
    }

    const items = suggestionsBox.querySelectorAll('.report-suggestion-item:not(.report-suggestion-online)');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % items.length;
      this.highlightSuggestion(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedSuggestionIndex = (this.selectedSuggestionIndex - 1 + items.length) % items.length;
      this.highlightSuggestion(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.selectedSuggestionIndex >= 0 && this.currentSuggestions && this.currentSuggestions[this.selectedSuggestionIndex]) {
        const sel = this.currentSuggestions[this.selectedSuggestionIndex];
        this.selectLocation(sel.lat, sel.lng, sel.name);
      } else {
        const input = document.getElementById('report-location-search-input');
        if (input && input.value) {
          this.searchOnlineNominatim(input.value);
        }
      }
    } else if (e.key === 'Escape') {
      this.hideSuggestions();
    }
  }

  highlightSuggestion(items) {
    items.forEach((item, idx) => {
      item.classList.toggle('active', idx === this.selectedSuggestionIndex);
      if (idx === this.selectedSuggestionIndex) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  selectLocation(lat, lng, name) {
    const input = document.getElementById('report-location-search-input');
    if (input) input.value = name;
    this.hideSuggestions();
    this.jumpToLocation(lat, lng, name);
  }

  clearLocationSearch() {
    const input = document.getElementById('report-location-search-input');
    const clearBtn = document.getElementById('report-search-clear-btn');
    if (input) {
      input.value = '';
      input.focus();
    }
    if (clearBtn) clearBtn.style.display = 'none';
    this.hideSuggestions();
  }

  hideSuggestions() {
    const suggestionsBox = document.getElementById('report-location-suggestions');
    if (suggestionsBox) {
      suggestionsBox.style.display = 'none';
      suggestionsBox.innerHTML = '';
    }
    this.selectedSuggestionIndex = -1;
  }

  async searchOnlineNominatim(query) {
    this.hideSuggestions();
    if (!query) return;

    if (window.notifManager) {
      window.notifManager.showToast(`Locating "${query}"...`, 'info', 2000);
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Philippines')}&limit=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        const displayName = result.display_name.split(',').slice(0, 3).join(',');
        this.selectLocation(lat, lon, displayName);
        if (window.notifManager) {
          window.notifManager.showToast(`Jumped to: ${displayName}`, 'success', 3000);
        }
      } else {
        const match = PRESET_LOCATIONS.find(l => l.name.toLowerCase().includes(query.toLowerCase()));
        if (match) {
          this.selectLocation(match.lat, match.lng, match.name);
        } else if (window.notifManager) {
          window.notifManager.showToast(`Location "${query}" not found. Try another landmark or drag pin.`, 'warning', 3500);
        }
      }
    } catch (err) {
      const match = PRESET_LOCATIONS.find(l => l.name.toLowerCase().includes(query.toLowerCase()));
      if (match) {
        this.selectLocation(match.lat, match.lng, match.name);
      } else if (window.notifManager) {
        window.notifManager.showToast(`Jumped pin near ${query}.`, 'info', 2500);
      }
    }
  }

  jumpToLocation(lat, lng, name) {
    this.updatePinnedCoords(lat, lng);
    if (this.map) {
      this.map.flyTo([lat, lng], 15, { duration: 0.8 });
      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      }
    }

    // Highlight matching quick jump chips
    const chips = document.querySelectorAll('.report-zone-chip');
    chips.forEach(chip => {
      const chipText = chip.textContent.trim().toLowerCase();
      const nLower = name.toLowerCase();
      const distMatch = nLower.match(/district\s*(\d)/);
      const chipDistMatch = chipText.match(/district\s*(\d)/);
      let match = false;
      if (distMatch && chipDistMatch && distMatch[1] === chipDistMatch[1]) {
        match = true;
      } else {
        match = nLower.includes(chipText) || chipText.includes(nLower);
      }
      chip.classList.toggle('active', !!match);
    });

    const formattedLoc = name.toLowerCase().includes('quezon city') ? name : `${name}, Quezon City`;

    if (this.currentType === 'found') {
      const locInput = document.getElementById('report-found-location');
      if (locInput) {
        locInput.value = formattedLoc;
      }
    } else {
      const locInput = document.getElementById('report-missing-location');
      if (locInput) {
        locInput.value = formattedLoc;
      }
    }
  }

  triggerTakePhoto() {
    const camInput = document.getElementById('report-photo-camera-input');
    if (camInput) camInput.click();
  }

  triggerUploadPhoto() {
    const fileInput = document.getElementById('report-photo-file-input');
    if (fileInput) fileInput.click();
  }

  handlePhotoFile(input) {
    if (!input || !input.files || !input.files[0]) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      if (window.notifManager) window.notifManager.showToast('Please select a valid image file (JPG, PNG, WEBP).', 'warning', 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.setUploadedPhoto(e.target.result);
      if (window.notifManager) {
        window.notifManager.showToast('Pet photo attached successfully.', 'success', 3000);
      }
    };
    reader.readAsDataURL(file);
  }

  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('report-photo-dropzone');
    if (dropzone) dropzone.classList.add('drag-over');
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('report-photo-dropzone');
    if (dropzone) dropzone.classList.remove('drag-over');
  }

  handlePhotoDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('report-photo-dropzone');
    if (dropzone) dropzone.classList.remove('drag-over');

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        if (window.notifManager) window.notifManager.showToast('Please drop a valid image file.', 'warning', 3000);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.setUploadedPhoto(ev.target.result);
        if (window.notifManager) {
          window.notifManager.showToast('Pet photo attached successfully.', 'success', 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  setUploadedPhoto(dataUrl) {
    this.uploadedPhotoData = dataUrl;
    const placeholder = document.getElementById('report-photo-placeholder');
    const previewWrap = document.getElementById('report-photo-preview-wrap');
    const previewImg = document.getElementById('report-photo-preview-img');

    if (placeholder) placeholder.style.display = 'none';
    if (previewWrap) previewWrap.style.display = 'block';
    if (previewImg) previewImg.src = dataUrl;

    this.updateMissingPhotoStatus();
  }

  removeUploadedPhoto(showToast = true) {
    this.uploadedPhotoData = null;
    const placeholder = document.getElementById('report-photo-placeholder');
    const previewWrap = document.getElementById('report-photo-preview-wrap');
    const previewImg = document.getElementById('report-photo-preview-img');
    const camInput = document.getElementById('report-photo-camera-input');
    const fileInput = document.getElementById('report-photo-file-input');

    if (camInput) camInput.value = '';
    if (fileInput) fileInput.value = '';
    if (previewImg) previewImg.src = '';
    if (previewWrap) previewWrap.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';

    this.updateMissingPhotoStatus();

    if (showToast && window.notifManager) {
      window.notifManager.showToast('Photo removed.', 'info', 2000);
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    if (!window.pawStore) return;

    if (this.currentType === 'found') {
      this.submitFoundReport();
    } else {
      this.submitMissingReport();
    }
  }

  submitFoundReport() {
    const species = document.getElementById('report-found-species')?.value || 'Dog';
    const breed = document.getElementById('report-found-breed')?.value || (species === 'Dog' ? 'Aspin' : 'Domestic Shorthair');
    const location = document.getElementById('report-found-location')?.value || 'Quezon City';
    const rfid = (document.getElementById('report-found-rfid')?.value || '').trim();
    const phone = document.getElementById('report-found-phone')?.value || '';
    const notes = document.getElementById('report-found-notes')?.value || 'Stray animal spotted by community member.';

    const finalPhoto = this.uploadedPhotoData || (species === 'Cat' ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500' : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500');

    const sightingId = 'SIGHT-' + Date.now().toString().slice(-6);

    // Check if the entered RFID matches any registered pet in the system BEFORE building sighting object
    let matchedPet = null;
    if (rfid && window.pawStore) {
      matchedPet = window.pawStore.getPetByRFID(rfid);
    }

    const sighting = {
      id: sightingId,
      species: species,
      breed: breed,
      location: location,
      coords: [this.pinnedLat, this.pinnedLng],
      rfidTag: rfid,
      reporterPhone: phone,
      community: matchedPet ? (matchedPet.community || (matchedPet.owner && matchedPet.owner.community) || '') : '',
      reporterName: 'Community Good Samaritan',
      comments: notes,
      timestamp: new Date().toISOString(),
      confidenceScore: 92,
      photo: finalPhoto,
      photoUrl: finalPhoto,
      reportType: 'found'
    };

    window.pawStore.addSighting(sighting);

    if (matchedPet) {
      // Create high-priority notification for the pet owner with complete finder info
      const ownerNotif = {
        id: 'notif-match-' + Date.now(),
        title: `GOOD SAMARITAN FOUND YOUR PET: "${matchedPet.name.toUpperCase()}"!`,
        message: `Your pet was found and reported near ${location}. Finder Contact: ${phone || 'Available in details'}. Notes: "${notes}"`,
        type: 'pet_found_match',
        petId: matchedPet.id,
        petName: matchedPet.name,
        rfidTag: matchedPet.rfidTag,
        finderName: 'Community Good Samaritan',
        finderPhone: phone || '+63 9XX XXX XXXX',
        finderNotes: notes,
        location: location,
        coords: [this.pinnedLat, this.pinnedLng],
        photoUrl: finalPhoto,
        timestamp: new Date().toISOString(),
        read: false
      };

      window.pawStore.addNotification(ownerNotif);

      // Add timeline event to pet case if available
      window.pawStore.addCaseTimelineEvent(matchedPet.id, {
        type: 'sighting',
        title: 'Pet Located by Good Samaritan',
        location: location,
        finder: `Community Good Samaritan (${phone || 'Phone on file'})`,
        notes: notes,
        photoUrl: finalPhoto,
        timestamp: new Date().toISOString()
      });

      if (window.notifManager) {
        window.notifManager.showToast(`MATCH CONFIRMED: Registered pet "${matchedPet.name}" (RFID: ${rfid}) found! Owner notification sent.`, 'success', 6000);
        setTimeout(() => {
          window.notifManager.showFinderInfo(ownerNotif);
        }, 600);
      }
    } else {
      // Standard general notification
      window.pawStore.addNotification({
        id: 'notif-sight-' + Date.now(),
        title: `Sighting Pinned: ${breed} (${species})`,
        message: `Community sighting logged at ${location} [${this.pinnedLat}, ${this.pinnedLng}]. ${rfid ? 'Collar RFID: ' + rfid + '.' : ''} Notes: "${notes}"`,
        type: 'sighting',
        rfidTag: rfid,
        location: location,
        coords: [this.pinnedLat, this.pinnedLng],
        finderPhone: phone,
        finderName: 'Community Good Samaritan',
        finderNotes: notes,
        photoUrl: finalPhoto,
        timestamp: new Date().toISOString(),
        read: false
      });

      if (window.notifManager) {
        window.notifManager.showToast(`Sighting recorded & pinned to Incident Map at [${this.pinnedLat}, ${this.pinnedLng}].`, 'success', 5000);
      }
    }

    this.closeModal();

    // If currently on owner or map view, re-render to reflect new report
    if (window.location.hash === '#owner' && window.ownerView) {
      window.ownerView.render(document.getElementById('app-viewport'));
    }
    if (window.location.hash === '#map' && window.publicView) {
      window.publicView.render(document.getElementById('app-viewport'));
    }
  }

  submitMissingReport() {
    const select = document.getElementById('report-missing-pet-select');
    const petId = select?.value;
    let petName = 'Pet';
    let rfid = 'RFID-TAG';
    let pet = null;

    if (petId && petId !== 'custom') {
      const pets = window.pawStore.getPets();
      pet = pets.find(p => String(p.id) === String(petId));
      if (pet) {
        petName = pet.name;
        rfid = pet.rfidTag;
      }
    } else {
      petName = document.getElementById('report-missing-custom-name')?.value || 'Beloved Pet';
    }

    const location = document.getElementById('report-missing-location')?.value || 'Metro Manila';
    const date = document.getElementById('report-missing-date')?.value || new Date().toISOString();
    const phone = document.getElementById('report-missing-phone')?.value || '+63 917 555 3829';
    const notes = document.getElementById('report-missing-notes')?.value || '';

    const finalPhoto = this.uploadedPhotoData || (pet ? (pet.photoUrl || pet.photo) : null) || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500';

    if (pet) {
      window.pawStore.updatePetStatus(pet.id, 'lost', {
        lastSeenLocation: location,
        lastSeenDate: date,
        lastSeenCoords: [this.pinnedLat, this.pinnedLng],
        ownerPhone: phone,
        notes: notes,
        photoUrl: finalPhoto,
        photo: finalPhoto
      });
    }

    // Create First-Class Missing Report Entity
    const missingReport = window.pawStore.createMissingReport({
      petId: pet ? pet.id : 'pet-temp',
      petName: petName,
      species: pet ? pet.species : 'Pet',
      breed: pet ? pet.breed : 'Mixed Breed',
      photoUrl: finalPhoto,
      photo: finalPhoto,
      ownerEmail: pet && pet.owner ? pet.owner.email : 'user@gmail.com',
      ownerPhone: phone,
      community: (pet && pet.community) ? pet.community : (pet && pet.owner && pet.owner.address ? pet.owner.address : 'Metro Manila'),
      lastSeenLocation: location,
      lastSeenCoords: [this.pinnedLat, this.pinnedLng],
      lastSeenDate: date,
      notes: notes,
      status: 'active'
    });

    // Add Missing Pet Alert to Cases and Notifications
    const newCase = {
      id: 'CASE-' + Date.now().toString().slice(-4),
      petId: pet ? pet.id : 'pet-temp',
      missingReportId: missingReport.id,
      petName: petName,
      rfidTag: rfid,
      status: 'missing',
      location: location,
      coords: [this.pinnedLat, this.pinnedLng],
      photoUrl: finalPhoto,
      photo: finalPhoto,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      timeline: [
        {
          timestamp: new Date().toISOString(),
          type: 'missing',
          title: 'Missing Alert Broadcast Activated',
          location: location,
          notes: `Guardian reported missing with pinned coordinates [${this.pinnedLat}, ${this.pinnedLng}]. Notes: ${notes}`,
          photoUrl: finalPhoto
        }
      ]
    };
    window.pawStore.saveCase(newCase);

    window.pawStore.addNotification({
      title: `Emergency Alert: "${petName}" Missing`,
      message: `Guardian reported ${petName} (${rfid}) missing near ${location}. Checkpoints & public map notified.`,
      type: 'missing',
      missingReportId: missingReport.id,
      petId: pet ? pet.id : null,
      photoUrl: finalPhoto,
      timestamp: new Date().toISOString()
    });

    if (window.notifManager) {
      window.notifManager.showToast(`Emergency Alert Broadcasted for "${petName}". Pinned on Incident Map.`, 'danger', 5000);
    }

    this.closeModal();

    if (window.location.hash === '#map' && window.publicView) {
      window.publicView.render(document.getElementById('app-viewport'));
    }
    if (window.location.hash === '#owner' && window.ownerView) {
      window.ownerView.render(document.getElementById('app-viewport'));
    }
  }

  // =========================================================
  // COMMUNITY SIGHTING SUBMISSION FLOW METHODS
  // =========================================================

  openSightingModal(missingReportId = null, petId = null) {
    const modal = document.getElementById('sighting-submission-modal');
    if (!modal) return;

    // Reset previous inputs
    this.sightingPhotoData = null;
    const photoInput = document.getElementById('sighting-photo-input');
    if (photoInput) photoInput.value = '';
    const previewWrap = document.getElementById('sighting-preview-wrap');
    const promptWrap = document.getElementById('sighting-dropzone-prompt');
    if (previewWrap) previewWrap.style.display = 'none';
    if (promptWrap) promptWrap.style.display = 'block';

    const hiddenReportId = document.getElementById('sighting-missing-report-id');
    const hiddenPetId = document.getElementById('sighting-pet-id');
    const prefillBanner = document.getElementById('sighting-prefill-banner');
    const petPickerGroup = document.getElementById('sighting-pet-picker-group');
    const modalTitle = document.getElementById('sighting-modal-title');
    const locInput = document.getElementById('sighting-location-input');
    const notesInput = document.getElementById('sighting-notes-input');
    const dateInput = document.getElementById('sighting-datetime-input');
    const phoneInput = document.getElementById('sighting-reporter-phone');
    const nameInput = document.getElementById('sighting-reporter-name');

    if (notesInput) notesInput.value = '';
    if (phoneInput) phoneInput.value = '';
    if (nameInput)  nameInput.value  = '';

    // Set default datetime to now
    if (dateInput) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      dateInput.value = now.toISOString().slice(0, 16);
    }

    // Determine target pet / missing report
    let targetPet = null;
    let targetReport = null;

    if (missingReportId) {
      targetReport = window.pawStore.getMissingReportById(missingReportId);
      if (targetReport) {
        targetPet = window.pawStore.getPetById(targetReport.petId);
      }
    }
    if (!targetPet && petId) {
      targetPet = window.pawStore.getPetById(petId);
      if (targetPet) {
        targetReport = window.pawStore.getActiveMissingReportForPet(petId);
      }
    }

    if (targetPet || targetReport) {
      const resolvedPetName = targetPet ? targetPet.name : (targetReport ? targetReport.petName : 'Missing Pet');
      const resolvedReportId = targetReport ? targetReport.id : (missingReportId || 'mr-' + Date.now());
      const resolvedPetId = targetPet ? targetPet.id : (targetReport ? targetReport.petId : petId);

      if (hiddenReportId) hiddenReportId.value = resolvedReportId;
      if (hiddenPetId) hiddenPetId.value = resolvedPetId;

      if (modalTitle) modalTitle.textContent = `Report Sighting: "${resolvedPetName}"`;

      if (prefillBanner) {
        prefillBanner.style.display = 'flex';
        const thumb = document.getElementById('sighting-prefill-pet-thumb');
        const nameEl = document.getElementById('sighting-prefill-pet-name');
        const metaEl = document.getElementById('sighting-prefill-pet-meta');
        if (thumb) thumb.src = targetPet ? targetPet.photoUrl : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=120&q=80';
        if (nameEl) nameEl.textContent = resolvedPetName;
        if (metaEl) metaEl.textContent = `${targetPet ? targetPet.breed : 'Registered Pet'} · Last seen: ${targetPet ? (targetPet.lastSeenLocation || 'Metro Manila') : (targetReport ? targetReport.lastSeenLocation : 'Area')}`;
      }

      if (petPickerGroup) petPickerGroup.style.display = 'none';

      // Default pinned coords to last seen location
      if (targetPet && targetPet.lastSeenCoords) {
        this.sightingPinnedLat = targetPet.lastSeenCoords[0] + (Math.random() - 0.5) * 0.005;
        this.sightingPinnedLng = targetPet.lastSeenCoords[1] + (Math.random() - 0.5) * 0.005;
      } else if (targetReport && targetReport.lastSeenCoords) {
        this.sightingPinnedLat = targetReport.lastSeenCoords[0] + (Math.random() - 0.5) * 0.005;
        this.sightingPinnedLng = targetReport.lastSeenCoords[1] + (Math.random() - 0.5) * 0.005;
      }

      if (locInput && (!locInput.value || locInput.value === '')) {
        locInput.value = targetPet ? `Near ${targetPet.lastSeenLocation || 'Quezon City'}` : 'Metro Manila';
      }
    } else {
      // General sighting flow: populate missing pets dropdown
      if (hiddenReportId) hiddenReportId.value = '';
      if (hiddenPetId) hiddenPetId.value = '';
      if (modalTitle) modalTitle.textContent = 'Report Pet Sighting';
      if (prefillBanner) prefillBanner.style.display = 'none';
      if (petPickerGroup) {
        petPickerGroup.style.display = 'block';
        const select = document.getElementById('sighting-pet-picker-select');
        if (select) {
          const pets = window.pawStore.getPets().filter(p => p.status === 'lost');
          let opts = '<option value="">-- General Unlinked Stray / Community Sighting --</option>';
          pets.forEach(p => {
            opts += `<option value="${p.id}">Link to Missing Alert: ${p.name} (${p.breed || 'Pet'} - RFID: ${p.rfidTag})</option>`;
          });
          select.innerHTML = opts;
        }
      }
      this.sightingPinnedLat = 14.6375;
      this.sightingPinnedLng = 121.0362;
    }

    this.updateSightingCoords(this.sightingPinnedLat, this.sightingPinnedLng);

    modal.classList.add('active');
    modal.style.display = 'flex';

    setTimeout(() => {
      this.initSightingPinMap();
    }, 180);
  }

  closeSightingModal() {
    const modal = document.getElementById('sighting-submission-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
    if (this.sightingMap) {
      try {
        this.sightingMap.remove();
      } catch (e) {}
      this.sightingMap = null;
    }
  }

  handleSightingPetPicker(petId) {
    const hiddenReportId = document.getElementById('sighting-missing-report-id');
    const hiddenPetId = document.getElementById('sighting-pet-id');
    const locInput = document.getElementById('sighting-location-input');

    if (!petId) {
      if (hiddenReportId) hiddenReportId.value = '';
      if (hiddenPetId) hiddenPetId.value = '';
      return;
    }

    const pet = window.pawStore.getPetById(petId);
    if (pet) {
      const activeReport = window.pawStore.getActiveMissingReportForPet(petId);
      if (hiddenPetId) hiddenPetId.value = pet.id;
      if (hiddenReportId) hiddenReportId.value = activeReport ? activeReport.id : 'mr-' + pet.id;
      if (locInput && pet.lastSeenLocation) {
        locInput.value = `Near ${pet.lastSeenLocation}`;
      }
      if (pet.lastSeenCoords) {
        this.sightingPinnedLat = pet.lastSeenCoords[0] + (Math.random() - 0.5) * 0.005;
        this.sightingPinnedLng = pet.lastSeenCoords[1] + (Math.random() - 0.5) * 0.005;
        this.updateSightingCoords(this.sightingPinnedLat, this.sightingPinnedLng);
        if (this.sightingMap) {
          this.sightingMap.setView([this.sightingPinnedLat, this.sightingPinnedLng], 14);
          if (this.sightingMarker) this.sightingMarker.setLatLng([this.sightingPinnedLat, this.sightingPinnedLng]);
        }
      }
    }
  }

  initSightingPinMap() {
    const container = document.getElementById('sighting-pin-map');
    if (!container || !window.L) return;

    if (this.sightingMap) {
      try { this.sightingMap.remove(); } catch (e) {}
      this.sightingMap = null;
    }

    this.sightingMap = window.L.map('sighting-pin-map', {
      scrollWheelZoom: true,
      zoomControl: true
    }).setView([this.sightingPinnedLat, this.sightingPinnedLng], 14);

    // OpenStreetMap standard tile layer (lightweight, zero billing)
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.sightingMap);

    // Green Draggable Sighting Marker
    const greenSightingIcon = window.L.divIcon({
      className: 'sighting-pin-leaflet-icon',
      html: `
        <div style="position:relative; transform:translate(-50%, -100%); cursor:grab;">
          <div style="width:34px; height:34px; border-radius:50% 50% 50% 0; background:linear-gradient(135deg, #22c55e, #15803d); transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; box-shadow:0 6px 16px rgba(0,0,0,0.4); border:2px solid #ffffff;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(45deg);"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          </div>
          <div style="width:8px; height:3px; border-radius:50%; background:rgba(0,0,0,0.3); margin:2px auto 0;"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    this.sightingMarker = window.L.marker([this.sightingPinnedLat, this.sightingPinnedLng], {
      icon: greenSightingIcon,
      draggable: true
    }).addTo(this.sightingMap);

    this.sightingMarker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      this.updateSightingCoords(pos.lat, pos.lng);
    });

    this.sightingMap.on('click', (e) => {
      this.updateSightingCoords(e.latlng.lat, e.latlng.lng);
      if (this.sightingMarker) this.sightingMarker.setLatLng(e.latlng);
    });

    setTimeout(() => {
      if (this.sightingMap) this.sightingMap.invalidateSize();
    }, 150);
  }

  updateSightingCoords(lat, lng) {
    this.sightingPinnedLat = parseFloat(lat.toFixed(5));
    this.sightingPinnedLng = parseFloat(lng.toFixed(5));

    const latInput = document.getElementById('sighting-pinned-lat');
    const lngInput = document.getElementById('sighting-pinned-lng');
    const badge = document.getElementById('sighting-coords-badge');

    if (latInput) latInput.value = this.sightingPinnedLat;
    if (lngInput) lngInput.value = this.sightingPinnedLng;
    if (badge) badge.textContent = `${this.sightingPinnedLat.toFixed(5)}, ${this.sightingPinnedLng.toFixed(5)}`;
  }

  handleSightingPhotoInput(input) {
    if (!input || !input.files || !input.files[0]) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      if (window.notifManager) window.notifManager.showToast('Please select a valid image file (JPG, PNG, WEBP).', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.sightingPhotoData = e.target.result;
      const previewImg = document.getElementById('sighting-preview-img');
      const previewWrap = document.getElementById('sighting-preview-wrap');
      const promptWrap = document.getElementById('sighting-dropzone-prompt');

      if (previewImg) previewImg.src = this.sightingPhotoData;
      if (previewWrap) previewWrap.style.display = 'block';
      if (promptWrap) promptWrap.style.display = 'none';

      if (window.notifManager) {
        window.notifManager.showToast('Sighting photo attached successfully.', 'success', 2500);
      }
    };
    reader.readAsDataURL(file);
  }

  removeSightingPhoto() {
    this.sightingPhotoData = null;
    const photoInput = document.getElementById('sighting-photo-input');
    if (photoInput) photoInput.value = '';
    const previewWrap = document.getElementById('sighting-preview-wrap');
    const promptWrap = document.getElementById('sighting-dropzone-prompt');
    if (previewWrap) previewWrap.style.display = 'none';
    if (promptWrap) promptWrap.style.display = 'block';
  }

  submitCommunitySighting(e) {
    if (e && e.preventDefault) e.preventDefault();

    // 1. Validate Photo (REQUIRED)
    if (!this.sightingPhotoData) {
      if (window.notifManager) {
        window.notifManager.showToast('A sighting photo is required as photographic evidence.', 'danger', 4000);
      }
      const dropzone = document.getElementById('sighting-dropzone');
      if (dropzone) {
        dropzone.scrollIntoView({ behavior: 'smooth', block: 'center' });
        dropzone.classList.add('drag-over');
        setTimeout(() => dropzone.classList.remove('drag-over'), 1500);
      }
      return;
    }

    // 2. Validate Location (REQUIRED)
    const locInput = document.getElementById('sighting-location-input');
    const location = (locInput ? locInput.value : '').trim();
    if (!location) {
      if (window.notifManager) window.notifManager.showToast('Please describe the location / landmark where the pet was spotted.', 'warning');
      if (locInput) locInput.focus();
      return;
    }

    // 3. Validate Date & Time (REQUIRED)
    const dateInput = document.getElementById('sighting-datetime-input');
    const dateTimeSeen = (dateInput ? dateInput.value : '').trim();
    if (!dateTimeSeen) {
      if (window.notifManager) window.notifManager.showToast('Please provide the date and time when you saw the pet.', 'warning');
      if (dateInput) dateInput.focus();
      return;
    }

    const notes = (document.getElementById('sighting-notes-input')?.value || '').trim();
    const phone = (document.getElementById('sighting-reporter-phone')?.value || '').trim();
    const reporterNameRaw = (document.getElementById('sighting-reporter-name')?.value || '').trim();
    const reporterName = reporterNameRaw || 'Community Good Samaritan';
    const missingReportId = document.getElementById('sighting-missing-report-id')?.value || null;
    const petId = document.getElementById('sighting-pet-id')?.value || null;

    let matchedPet = null;
    if (petId) {
      matchedPet = window.pawStore.getPetById(petId);
    } else if (missingReportId) {
      const rep = window.pawStore.getMissingReportById(missingReportId);
      if (rep) matchedPet = window.pawStore.getPetById(rep.petId);
    }

    const sightingId = 'sight-' + Date.now().toString().slice(-6);

    const sighting = {
      id: sightingId,
      missing_report_id: missingReportId || (matchedPet ? (matchedPet.missingReportId || 'mr-' + matchedPet.id) : null),
      petId: petId || (matchedPet ? matchedPet.id : null),
      community: matchedPet ? (matchedPet.community || (matchedPet.owner && matchedPet.owner.community) || '') : '',
      species: matchedPet ? matchedPet.species : 'Dog',
      breed: matchedPet ? matchedPet.breed : 'Spotted Pet',
      color: matchedPet ? matchedPet.color : 'Mixed',
      location: location,
      coords: [this.sightingPinnedLat, this.sightingPinnedLng],
      lat: this.sightingPinnedLat,
      lng: this.sightingPinnedLng,
      dateTimeSeen: dateTimeSeen,
      comments: notes || 'Possible pet sighting observed in the community.',
      notes: notes || 'Possible pet sighting observed in the community.',
      photoUrl: this.sightingPhotoData,
      photo: this.sightingPhotoData,
      reporterName: reporterName,
      reporterPhone: phone || '+63 9XX XXX XXXX',
      status: 'possible_sighting',
      createdAt: new Date().toISOString()
    };

    window.pawStore.addSighting(sighting);

    // Trigger In-App Notification specifically for the pet owner
    const petDisplayName = matchedPet ? matchedPet.name : 'COMMUNITY PET';
    const ownerNotif = {
      id: 'notif-sight-' + Date.now(),
      type: 'sighting_verification',
      title: `POSSIBLE SIGHTING: "${petDisplayName.toUpperCase()}"`,
      message: `${reporterName} reported a possible sighting of ${petDisplayName} near ${location}. Please review the photo and verify.`,
      petId: matchedPet ? matchedPet.id : null,
      ownerEmail: matchedPet && matchedPet.owner ? matchedPet.owner.email : null,
      missingReportId: sighting.missing_report_id,
      sightingId: sighting.id,
      location: location,
      coords: sighting.coords,
      photoUrl: this.sightingPhotoData,
      timestamp: new Date().toISOString(),
      read: false
    };
    window.pawStore.addNotification(ownerNotif);

    if (window.notifManager) {
      window.notifManager.showToast(`Possible Sighting pinned on Community Map! Notification dispatched to pet owner.`, 'success', 5000);
    }

    this.closeSightingModal();

    // Re-render views
    if (window.publicView && window.location.hash === '#map') {
      window.publicView.render(document.getElementById('app-viewport'));
    }
    if (window.ownerView && window.location.hash === '#owner') {
      window.ownerView.render(document.getElementById('app-viewport'));
    }
    if (window.sightingsView && window.location.hash === '#sightings') {
      window.sightingsView.render(document.getElementById('app-viewport'));
    }
  }
}

window.reportManager = new ReportManager();
