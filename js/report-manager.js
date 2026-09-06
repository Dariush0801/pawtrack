/**
 * PawTrack Report Manager - Interactive Pin-Drop Map & Lost/Found Pet Reporting
 */

const PRESET_LOCATIONS = [
  { name: 'Quezon City (Central / Elliptical)', lat: 14.6500, lng: 121.0400, group: 'City' },
  { name: 'QC - Commonwealth / Batasan', lat: 14.6850, lng: 121.0850, group: 'District' },
  { name: 'QC - Tomas Morato / Timog', lat: 14.6342, lng: 121.0375, group: 'District' },
  { name: 'QC - Cubao / Araneta City', lat: 14.6200, lng: 121.0530, group: 'District' },
  { name: 'QC - Diliman / UP Campus', lat: 14.6538, lng: 121.0685, group: 'District' },
  { name: 'QC - Eastwood City / Libis', lat: 14.6090, lng: 121.0800, group: 'District' },
  { name: 'QC - Novaliches / Quirino', lat: 14.7180, lng: 121.0350, group: 'District' },
  { name: 'QC - Fairview / Regalado', lat: 14.7000, lng: 121.0650, group: 'District' },
  { name: 'QC - Project 4 / Katipunan', lat: 14.6280, lng: 121.0730, group: 'District' },
  { name: 'QC - West Triangle / EDSA', lat: 14.6450, lng: 121.0330, group: 'District' },

  { name: 'Manila City (City Hall / Central)', lat: 14.5995, lng: 120.9842, group: 'City' },
  { name: 'Manila - Intramuros', lat: 14.5895, lng: 120.9747, group: 'District' },
  { name: 'Manila - Malate / Ermita', lat: 14.5750, lng: 120.9850, group: 'District' },
  { name: 'Manila - Sampaloc / UST', lat: 14.6050, lng: 120.9950, group: 'District' },
  { name: 'Manila - Binondo (Chinatown)', lat: 14.6000, lng: 120.9750, group: 'District' },
  { name: 'Manila - Tondo / Gagalangin', lat: 14.6200, lng: 120.9700, group: 'District' },
  { name: 'Manila - Sta. Mesa / PUP', lat: 14.5980, lng: 121.0120, group: 'District' },

  { name: 'Makati CBD / Ayala Avenue', lat: 14.5547, lng: 121.0244, group: 'City' },
  { name: 'Makati - Poblacion / Rockwell', lat: 14.5670, lng: 121.0320, group: 'District' },
  { name: 'Makati - Legazpi / Salcedo Village', lat: 14.5580, lng: 121.0180, group: 'District' },
  { name: 'Makati - Guadalupe / EDSA', lat: 14.5680, lng: 121.0450, group: 'District' },
  { name: 'Makati - San Antonio / Chino Roces', lat: 14.5600, lng: 121.0080, group: 'District' },

  { name: 'Taguig - BGC (Bonifacio Global City)', lat: 14.5500, lng: 121.0500, group: 'City' },
  { name: 'Taguig - McKinley Hill', lat: 14.5340, lng: 121.0530, group: 'District' },
  { name: 'Taguig - Arca South / FTI', lat: 14.5050, lng: 121.0450, group: 'District' },
  { name: 'Taguig - Ususan / C5 Road', lat: 14.5280, lng: 121.0650, group: 'District' },

  { name: 'Pasig City (City Hall / Kapasigan)', lat: 14.5800, lng: 121.0600, group: 'City' },
  { name: 'Pasig - Ortigas Center', lat: 14.5860, lng: 121.0610, group: 'District' },
  { name: 'Pasig - Kapitolyo', lat: 14.5750, lng: 121.0620, group: 'District' },
  { name: 'Pasig - Rosario / C5', lat: 14.5880, lng: 121.0820, group: 'District' },
  { name: 'Pasig - Manggahan / Santolan', lat: 14.6050, lng: 121.0950, group: 'District' },

  { name: 'Mandaluyong City (Shaw / EDSA)', lat: 14.5794, lng: 121.0359, group: 'City' },
  { name: 'Mandaluyong - Pioneer / Boni Avenue', lat: 14.5700, lng: 121.0450, group: 'District' },
  { name: 'Mandaluyong - Highway Hills', lat: 14.5820, lng: 121.0480, group: 'District' },

  { name: 'Marikina City (Bayan / Shoe Avenue)', lat: 14.6507, lng: 121.1029, group: 'City' },
  { name: 'Marikina - Concepcion / Riverbanks', lat: 14.6380, lng: 121.0950, group: 'District' },
  { name: 'Marikina - Heights / Lilac Street', lat: 14.6450, lng: 121.1200, group: 'District' },

  { name: 'San Juan City (Greenhills / Ortigas Ave)', lat: 14.6019, lng: 121.0355, group: 'City' },

  { name: 'Caloocan City (Monumento / South)', lat: 14.6570, lng: 120.9840, group: 'City' },
  { name: 'Caloocan North (Bagong Silang / Camarin)', lat: 14.7600, lng: 121.0450, group: 'District' },

  { name: 'Pasay City (Mall of Asia / Bay Area)', lat: 14.5350, lng: 120.9820, group: 'City' },
  { name: 'Pasay - NAIA Airport Terminal Area', lat: 14.5150, lng: 121.0150, group: 'District' },

  { name: 'Parañaque City (BF Homes)', lat: 14.4500, lng: 121.0200, group: 'City' },
  { name: 'Parañaque - Sucat / Dr. A. Santos', lat: 14.4800, lng: 121.0450, group: 'District' },
  { name: 'Parañaque - Baclaran / Roxas Blvd', lat: 14.5320, lng: 120.9920, group: 'District' },

  { name: 'Muntinlupa City (Alabang / Filinvest)', lat: 14.4250, lng: 121.0400, group: 'City' },
  { name: 'Muntinlupa - Tunasan / National Road', lat: 14.3900, lng: 121.0450, group: 'District' },

  { name: 'Las Piñas City (Alabang-Zapote Road)', lat: 14.4445, lng: 120.9939, group: 'City' },

  { name: 'Valenzuela City (Karuhatan / McArthur)', lat: 14.7011, lng: 120.9830, group: 'City' },
  { name: 'Malabon City (Concepcion / Tugatog)', lat: 14.6625, lng: 120.9570, group: 'City' },
  { name: 'Navotas City (Fish Port / C4)', lat: 14.6667, lng: 120.9417, group: 'City' },

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
            <strong data-i18n="report.step3MissingTitle">${t('report.step3MissingTitle', 'Set Contact Phone')}</strong>
            <p data-i18n="report.step3MissingDesc">${t('report.step3MissingDesc', 'Provide your active mobile number so finders and animal pound officers can call you.')}</p>
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

    if (type === 'found') {
      tabFound?.classList.add('active');
      tabMissing?.classList.remove('active');
      if (fieldsFound) fieldsFound.style.display = 'block';
      if (fieldsMissing) fieldsMissing.style.display = 'none';
      if (modeToggle) modeToggle.style.display = 'flex';
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
      if (modeToggle) modeToggle.style.display = 'none';
      this.setViewMode('map');
      if (modalTitle) {
        modalTitle.textContent = window.pawI18n ? window.pawI18n.t('report.modalTitleMissing', 'Report Pet as Missing') : 'Report Pet as Missing';
        modalTitle.setAttribute('data-i18n', 'report.modalTitleMissing');
      }
      if (modalSub) {
        modalSub.textContent = window.pawI18n ? window.pawI18n.t('report.modalSubMissing', 'Drop a pin where the pet was last seen, add details, and broadcast an emergency alert to shelters and public map.') : 'Drop a pin where the pet was last seen, add details, and broadcast an emergency alert to shelters and public map.';
        modalSub.setAttribute('data-i18n', 'report.modalSubMissing');
      }
      if (submitLabel) {
        submitLabel.textContent = window.pawI18n ? window.pawI18n.t('report.btnMissingAlert', 'Missing Alert') : 'Missing Alert';
        submitLabel.setAttribute('data-i18n', 'report.btnMissingAlert');
      }
      if (submitBtn) {
        submitBtn.className = 'btn btn-danger';
      }
    }

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
    }
  }

  handlePetSelect(petId) {
    const customWrap = document.getElementById('report-missing-custom-name-wrap');
    if (petId === 'custom') {
      if (customWrap) customWrap.style.display = 'block';
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
        }
      }
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
      const match = name.toLowerCase().includes(chipText);
      chip.classList.toggle('active', match);
    });

    if (this.currentType === 'found') {
      const locInput = document.getElementById('report-found-location');
      if (locInput) {
        locInput.value = `${name}, Metro Manila`;
      }
    } else {
      const locInput = document.getElementById('report-missing-location');
      if (locInput) {
        locInput.value = `${name}, Metro Manila`;
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
    const location = document.getElementById('report-found-location')?.value || 'Metro Manila';
    const rfid = (document.getElementById('report-found-rfid')?.value || '').trim();
    const phone = document.getElementById('report-found-phone')?.value || '';
    const notes = document.getElementById('report-found-notes')?.value || 'Stray animal spotted by community member.';

    const finalPhoto = this.uploadedPhotoData || (species === 'Cat' ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500' : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500');

    const sightingId = 'SIGHT-' + Date.now().toString().slice(-6);

    const sighting = {
      id: sightingId,
      species: species,
      breed: breed,
      location: location,
      coords: [this.pinnedLat, this.pinnedLng],
      rfidTag: rfid,
      reporterPhone: phone,
      reporterName: 'Community Good Samaritan',
      comments: notes,
      timestamp: new Date().toISOString(),
      confidenceScore: 92,
      photo: finalPhoto,
      photoUrl: finalPhoto,
      reportType: 'found'
    };

    window.pawStore.addSighting(sighting);

    // Check if the entered RFID matches any registered pet in the system
    let matchedPet = null;
    if (rfid && window.pawStore) {
      matchedPet = window.pawStore.getPetByRFID(rfid);
    }

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

    if (pet) {
      window.pawStore.updatePetStatus(pet.id, 'lost', {
        lastSeenLocation: location,
        lastSeenDate: date,
        lastSeenCoords: [this.pinnedLat, this.pinnedLng],
        ownerPhone: phone,
        notes: notes
      });
    }

    // Add Missing Pet Alert to Cases and Notifications
    const newCase = {
      id: 'CASE-' + Date.now().toString().slice(-4),
      petId: pet ? pet.id : 'pet-temp',
      petName: petName,
      rfidTag: rfid,
      status: 'missing',
      location: location,
      coords: [this.pinnedLat, this.pinnedLng],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      timeline: [
        {
          timestamp: new Date().toISOString(),
          type: 'missing',
          title: 'Missing Alert Broadcast Activated',
          location: location,
          notes: `Guardian reported missing with pinned coordinates [${this.pinnedLat}, ${this.pinnedLng}]. Notes: ${notes}`
        }
      ]
    };
    window.pawStore.saveCase(newCase);

    window.pawStore.addNotification({
      title: `Emergency Alert: "${petName}" Missing`,
      message: `Guardian reported ${petName} (${rfid}) missing near ${location}. Checkpoints & public map notified.`,
      type: 'missing',
      timestamp: new Date().toISOString()
    });

    if (window.notifManager) {
      window.notifManager.showToast(`Emergency Alert Broadcasted for "${petName}". Pinned on Incident Map.`, 'danger', 5000);
    }

    this.closeModal();

    if (window.location.hash === '#map' && window.publicView) {
      window.publicView.render(document.getElementById('app-viewport'));
    }
  }
}

window.reportManager = new ReportManager();
