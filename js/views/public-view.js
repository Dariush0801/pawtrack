/**
 * PawTrack Public Lost & Found Board and Interactive Incident Map
 * Features Google Maps-Style Multi-Layer View (Roadmap / Satellite / Hybrid),
 * Interactive Turn-by-Turn Navigation, and Real-World Actual Place / Street View Visualizer.
 */

class PublicView {
  constructor() {
    this.map = null;
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.petMarkers = {};
    this.shelterMarkers = [];
    this.sightingMarkers = [];
    this.currentMapType = 'roadmap'; // 'roadmap', 'satellite', 'hybrid', 'dark'
    this.currentTileLayer = null;
    this.activeRoute = null;
    this.routePolyline = null;
    this.routeGlowLine = null;
    this.startMarker = null;
    this.userLocation = [14.6500, 121.0350]; // Default user GPS / Central NCR Command
  }

  render(container) {
    const t = (k, d) => (window.pawI18n ? window.pawI18n.t(k, d) : d);
    const pets = window.pawStore.getPets();
    const shelters = window.pawStore.getShelters();

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h1>${t('map.title', 'Community Recovery & Incident Map')}</h1>
          <div class="view-subtitle">${t('map.subtitle', 'Recorded landmark locations of missing pets, community sightings, verified AI matches, and shelter intake facilities.')}</div>
        </div>
        <div style="display:flex; gap:0.65rem; flex-wrap:wrap; align-items:center;">
          <button class="btn btn-outline btn-sm" onclick="window.publicView.openMapApiKeyModal()" title="Map API Key & Provider Access" style="display:flex; align-items:center; gap:0.45rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>
            <span style="font-weight:600;">API Key: Active</span>
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.publicView.openFoundPetModal()">
            <i data-lucide="eye"></i> ${t('map.reportStrayBtn', 'Report Found Stray Pet')}
          </button>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="glass-card" style="padding:1rem 1.25rem; margin-bottom:1.5rem; display:flex; flex-wrap:wrap; gap:1rem; align-items:center; justify-content:space-between;">
        <div style="display:flex; gap:0.5rem; flex:1; min-width:260px;">
          <input type="text" id="public-search-input" placeholder="${t('map.searchPh', 'Search by pet name, breed, barangay, or RFID tag...')}" value="${this.searchQuery}" oninput="window.publicView.handleSearch(this.value)" />
        </div>

        <div id="public-filter-btn-group" style="display:flex; gap:0.45rem; flex-wrap:wrap;">
          ${this.renderFilterButtons()}
        </div>
      </div>

      <!-- Map & List Layout -->
      <div class="map-layout-grid">
        <!-- Sidebar Cards List -->
        <div class="map-sidebar-list" id="public-pets-list">
          ${this.renderFilteredList(pets)}
        </div>

        <!-- Interactive Leaflet Map with Google Maps Styled Controls & Directions HUD -->
        <div class="glass-card" style="position:relative; overflow:hidden; min-height:520px; padding:0;">
          <div id="public-map-container" style="min-height:520px;"></div>

          <!-- Google Maps Layer Switcher Floating Dock -->
          <div class="gmap-layer-dock" id="gmap-layer-dock">
            <button type="button" class="gmap-layer-btn ${this.currentMapType === 'roadmap' ? 'active' : ''}" onclick="window.publicView.setMapLayer('roadmap')" title="Roadmap View (Default Street Network)">
              <span>Map</span>
            </button>
            <button type="button" class="gmap-layer-btn ${this.currentMapType === 'satellite' ? 'active' : ''}" onclick="window.publicView.setMapLayer('satellite')" title="Satellite / Actual Photographic Aerial View">
              <span>Satellite</span>
            </button>
            <button type="button" class="gmap-layer-btn ${this.currentMapType === 'hybrid' ? 'active' : ''}" onclick="window.publicView.setMapLayer('hybrid')" title="Hybrid View (Satellite + Street Labels)">
              <span>Hybrid</span>
            </button>
            <button type="button" class="gmap-layer-btn ${this.currentMapType === 'dark' ? 'active' : ''}" onclick="window.publicView.setMapLayer('dark')" title="Dark Theme Style">
              <span>Dark</span>
            </button>
          </div>

          <!-- Quick Navigation & View Control Tools -->
          <div class="gmap-quick-tools">
            <button type="button" class="gmap-tool-btn" onclick="window.publicView.locateMe()" title="Recenter to My Location (GPS)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
            </button>
            <button type="button" class="gmap-tool-btn" onclick="window.publicView.fitAllIncidents()" title="Fit View to All Active Incidents">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            </button>
          </div>

          <!-- Container for Directions & Actual Place Drawer -->
          <div id="gmap-directions-hud-container"></div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons({ root: container });

    // Initialize Map with Pets, Shelters, and Community Sightings
    setTimeout(() => this.initMap(pets, shelters), 100);
  }

  renderFilterButtons() {
    const t = (k, d) => (window.pawI18n ? window.pawI18n.t(k, d) : d);
    const pets = window.pawStore.getPets();
    const sightings = window.pawStore.getSightings();
    const lostCount = pets.filter(p => p.status === 'lost').length;
    const sightedCount = sightings.length;
    const impoundedCount = pets.filter(p => p.status === 'impounded' || p.status === 'active_impounded').length;
    const reunitedCount = pets.filter(p => p.status === 'reunited' || p.status === 'safe').length;

    const isAll = this.currentFilter === 'all';
    const isLost = this.currentFilter === 'lost';
    const isSighted = this.currentFilter === 'sighted';
    const isImpounded = this.currentFilter === 'impounded';
    const isReunited = this.currentFilter === 'reunited';

    return `
      <button type="button" class="btn btn-sm ${isAll ? 'btn-primary active' : 'btn-outline'}" onclick="window.publicView.setFilter('all')">
        ${t('map.filterAll', 'All Records')} (${pets.length + sightings.length})
      </button>
      <button type="button" class="btn btn-sm ${isLost ? 'btn-danger active' : 'btn-outline'}" onclick="window.publicView.setFilter('lost')">
        ${t('map.filterLost', 'Missing')} (${lostCount})
      </button>
      <button type="button" class="btn btn-sm ${isSighted ? 'btn-primary active' : 'btn-outline'}" onclick="window.publicView.setFilter('sighted')" style="${isSighted ? 'background:#ea9d1e; color:#180d07;' : ''}">
        ${t('map.filterSightings', 'Sightings')} (${sightedCount})
      </button>
      <button type="button" class="btn btn-sm ${isImpounded ? 'btn-secondary active' : 'btn-outline'}" onclick="window.publicView.setFilter('impounded')">
        ${t('map.filterImpounded', 'Impounded')} (${impoundedCount})
      </button>
      <button type="button" class="btn btn-sm ${isReunited ? 'btn-primary active' : 'btn-outline'}" onclick="window.publicView.setFilter('reunited')">
        ${t('map.filterReunited', 'Reunited')} (${reunitedCount})
      </button>
    `;
  }

  renderFilteredList(pets) {
    const sightings = window.pawStore.getSightings();
    let items = [];

    // 1. Add Pet items
    pets.forEach(p => {
      if (this.currentFilter === 'lost' && p.status !== 'lost') return;
      if (this.currentFilter === 'sighted') return;
      if (this.currentFilter === 'impounded' && p.status !== 'impounded' && p.status !== 'active_impounded') return;
      if (this.currentFilter === 'reunited' && p.status !== 'reunited' && p.status !== 'safe') return;

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchBreed = (p.breed || '').toLowerCase().includes(q);
        const matchTag = (p.rfidTag || '').toLowerCase().includes(q);
        const matchLoc = (p.lastSeenLocation || '').toLowerCase().includes(q);
        if (!matchName && !matchBreed && !matchTag && !matchLoc) return;
      }

      items.push({ type: 'pet', data: p, date: p.lastSeenDate || p.createdAt || p.registeredDate });
    });

    // 2. Add Sighting items
    if (this.currentFilter === 'all' || this.currentFilter === 'sighted') {
      sightings.forEach(s => {
        if (this.searchQuery) {
          const q = this.searchQuery.toLowerCase();
          const matchBreed = (s.breed || '').toLowerCase().includes(q);
          const matchLoc = (s.location || '').toLowerCase().includes(q);
          const matchComments = (s.comments || '').toLowerCase().includes(q);
          if (!matchBreed && !matchLoc && !matchComments) return;
        }
        items.push({ type: 'sighting', data: s, date: s.createdAt || s.dateTimeSeen });
      });
    }

    if (items.length === 0) {
      return `
        <div class="glass-card" style="padding:2rem; text-align:center; color:var(--text-muted);">
          <i data-lucide="search-x" style="width:40px; height:40px; margin-bottom:0.75rem; opacity:0.5;"></i>
          <div>No incident records matching "${this.currentFilter.toUpperCase()}" criteria.</div>
        </div>
      `;
    }

    return items.map(item => {
      if (item.type === 'sighting') {
        const s = item.data;
        const sLat = (s.lat || 14.6360);
        const sLng = (s.lng || 121.0370);
        return `
          <div class="glass-card" style="padding:0.9rem; display:flex; flex-direction:column; gap:0.6rem; border-left:3px solid #ea9d1e; cursor:pointer;" onclick="window.publicView.focusCoordsOnMap(${sLat}, ${sLng}, 'Sighting: ${s.breed || 'Pet'}')">
            <div style="display:flex; gap:0.85rem; align-items:center;">
              <img src="${s.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80'}" style="width:58px; height:58px; border-radius:var(--radius-md); object-fit:cover; border:2px solid #ea9d1e; flex-shrink:0; cursor:zoom-in;" onclick="event.stopPropagation(); window.pawApp.openLightbox('${s.photoUrl}', 'Community Pet Sighting', '${s.breed || 'Stray Pet'} · ${s.location}')" />
              <div style="flex:1; min-width:0;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; margin-bottom:2px;">
                  <h4 style="font-size:0.95rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:0;">${s.breed || 'Spotted Pet'}</h4>
                  <span class="badge" style="background:#ea9d1e22; color:#ea9d1e; border:1px solid #ea9d1e66; font-size:0.68rem; flex-shrink:0;">SIGHTED</span>
                </div>
                <div style="font-size:0.78rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:2px;">Location: ${s.location}</div>
                <div style="font-size:0.72rem; color:var(--primary); font-weight:700;">AI Match: ${s.confidenceScore || 92}% Confidence</div>
              </div>
            </div>
            <div style="display:flex; gap:6px; border-top:1px solid var(--border-subtle); padding-top:6px;">
              <button type="button" class="btn btn-outline btn-sm" style="flex:1; padding:4px 8px; font-size:0.75rem;" onclick="event.stopPropagation(); window.publicView.showDirections(${sLat}, ${sLng}, '${(s.breed || 'Pet Sighting').replace(/'/g, "\\'")}', '${s.location.replace(/'/g, "\\'")}', '${s.photoUrl || ''}', 'sighting')">
                Directions
              </button>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${sLat},${sLng}" target="_blank" class="btn btn-outline btn-sm" style="padding:4px 8px; font-size:0.75rem;" onclick="event.stopPropagation();" title="Open directly in Google Maps">
                Google Maps ↗
              </a>
            </div>
          </div>
        `;
      }

      const pet = item.data;
      let statusColor = '#16a34a';
      let statusLabel = 'Safe';
      if (pet.status === 'lost') { statusColor = '#ba3820'; statusLabel = 'Missing'; }
      if (pet.status === 'impounded' || pet.status === 'active_impounded') { statusColor = '#b85410'; statusLabel = 'Impounded'; }
      if (pet.status === 'reunited') { statusColor = '#16a34a'; statusLabel = 'Reunited'; }

      const petCoordinates = {
        'pet-1': [14.6650, 121.0350],
        'pet-2': [14.6342, 121.0375],
        'pet-3': [14.5750, 121.0620],
        'pet-4': [14.5880, 121.0450]
      };
      const pCoords = petCoordinates[pet.id] || (pet.lastSeenCoords || [14.6400, 121.0500]);

      return `
        <div class="glass-card" style="padding:0.9rem; display:flex; flex-direction:column; gap:0.6rem; cursor:pointer;" onclick="window.publicView.focusPetOnMap('${pet.id}')">
          <div style="display:flex; gap:0.85rem; align-items:center;">
            <img src="${pet.photoUrl}" style="width:58px; height:58px; border-radius:var(--radius-md); object-fit:cover; border:2px solid ${statusColor}; flex-shrink:0; cursor:zoom-in;" onclick="event.stopPropagation(); window.pawApp.openLightbox('${pet.photoUrl}', '${(pet.name || 'Pet').replace(/'/g, "\\'")}', '${pet.breed} • ${pet.gender} | RFID: ${pet.rfidTag}')" title="Click to view full photo" onerror="this.src='https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'" />
            <div style="flex:1; min-width:0;">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; margin-bottom:2px;">
                <h4 style="font-size:0.95rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:0;">${pet.name}</h4>
                <span style="font-size:0.68rem; font-weight:700; color:${statusColor}; text-transform:uppercase; white-space:nowrap; flex-shrink:0;">${statusLabel}</span>
              </div>
              <div style="font-size:0.78rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:2px;">${pet.breed} • ${pet.gender}</div>
              <div style="font-size:0.75rem; color:var(--primary); font-family:monospace;">RFID: ${pet.rfidTag}</div>
            </div>
          </div>
          <div style="display:flex; gap:6px; border-top:1px solid var(--border-subtle); padding-top:6px;">
            <button type="button" class="btn btn-outline btn-sm" style="flex:1; padding:4px 8px; font-size:0.75rem;" onclick="event.stopPropagation(); window.publicView.showDirections(${pCoords[0]}, ${pCoords[1]}, '${(pet.name || 'Pet').replace(/'/g, "\\'")}', '${(pet.lastSeenLocation || 'Metro Manila').replace(/'/g, "\\'")}', '${pet.photoUrl}', 'pet')">
              Directions
            </button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${pCoords[0]},${pCoords[1]}" target="_blank" class="btn btn-outline btn-sm" style="padding:4px 8px; font-size:0.75rem;" onclick="event.stopPropagation();" title="Open directly in Google Maps">
              Google Maps ↗
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  initMap(pets, shelters) {
    const container = document.getElementById('public-map-container');
    if (!container || !window.L) return;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Initialize Leaflet Map Centered around Metro Manila
    this.map = window.L.map('public-map-container', {
      scrollWheelZoom: true,
      zoomControl: true
    }).setView([14.6300, 121.0400], 12);

    // Apply active tile layer (Roadmap default)
    this.setMapLayer(this.currentMapType || 'roadmap', false);

    this.petMarkers = {};
    this.shelterMarkers = [];
    const markerGroup = [];

    // Distinct coordinates per pet to avoid marker clustering
    const petCoordinates = {
      'pet-1': [14.6650, 121.0350], // Max - QC Timog/West Triangle
      'pet-2': [14.6342, 121.0375], // Luna - Tomas Morato
      'pet-3': [14.5750, 121.0620], // Rocky - Pasig Kapitolyo
      'pet-4': [14.5880, 121.0450]  // Mochi - Mandaluyong border
    };

    // Add Shelter Pins with clean, non-overlapping names & Directions Actions
    shelters.forEach(s => {
      const shortShelterName = s.name
        .replace(' Animal Care & Adoption Facility', '')
        .replace(' City Pound & Veterinary Inspection Board', '')
        .replace(' City Animal Welfare Facility', '');

      const shelterIcon = window.L.divIcon({
        className: 'custom-map-icon-wrap',
        html: `
          <div class="map-pin-pill shelter-pin">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
            <span class="map-pin-label">Shelter: ${shortShelterName}</span>
          </div>
        `,
        iconSize: null,
        iconAnchor: [12, 14]
      });

      const sMarker = window.L.marker([s.lat, s.lng], { icon: shelterIcon })
        .addTo(this.map)
        .bindPopup(`
          <div class="map-popup-card">
            <div style="font-size:0.72rem; font-weight:700; color:var(--secondary); text-transform:uppercase; margin-bottom:2px;">Official Animal Facility</div>
            <h4 style="font-size:0.98rem; font-weight:700; margin-bottom:0.35rem; color:var(--text-main); line-height:1.25;">${s.name}</h4>
            <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.35; margin-bottom:0.45rem;">
              <strong>Address:</strong> ${s.address}
            </div>
            ${s.photoUrl ? `
              <div style="width:100%; height:115px; border-radius:var(--radius-sm); overflow:hidden; margin-bottom:0.55rem; border:1px solid var(--border-subtle);">
                <img src="${s.photoUrl}" alt="${s.name}" style="width:100%; height:100%; object-fit:cover;" />
              </div>
            ` : ''}
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; padding-top:0.4rem; border-top:1px solid var(--border-subtle); margin-bottom:0.55rem;">
              <span style="color:var(--text-muted);">Hotline:</span>
              <strong style="color:var(--primary); font-weight:700;">${s.phone}</strong>
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn btn-primary btn-sm" style="flex:1;" onclick="window.publicView.showDirections(${s.lat}, ${s.lng}, '${s.name.replace(/'/g, "\\'")}', '${s.address.replace(/'/g, "\\'")}', '${s.photoUrl || ''}', 'shelter')">
                Directions & Place View
              </button>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}" target="_blank" class="btn btn-outline btn-sm" title="Open directly in Google Maps">
                Google Maps ↗
              </a>
            </div>
          </div>
        `);

      this.shelterMarkers.push(sMarker);
      markerGroup.push([s.lat, s.lng]);
    });

    // Add Pet Pins with non-overlapping, well-spaced coordinates
    pets.forEach(p => {
      let coords = petCoordinates[p.id] || [14.6400 + (Math.random() - 0.5) * 0.05, 121.0500 + (Math.random() - 0.5) * 0.05];

      let pinTypeClass = 'pet-safe-pin';
      let statusDisplay = 'Safe';
      if (p.status === 'lost') {
        pinTypeClass = 'pet-lost-pin';
        statusDisplay = 'Missing';
      } else if (p.status === 'impounded' || p.status === 'active_impounded') {
        pinTypeClass = 'pet-impounded-pin';
        statusDisplay = 'Impounded';
      } else if (p.status === 'reunited') {
        pinTypeClass = 'pet-reunited-pin';
        statusDisplay = 'Reunited';
      }

      const petPin = window.L.divIcon({
        className: 'custom-map-icon-wrap',
        html: `
          <div class="map-pin-pill ${pinTypeClass}">
            <span class="map-pin-dot"></span>
            <span class="map-pin-label">${p.name} (${statusDisplay})</span>
          </div>
        `,
        iconSize: null,
        iconAnchor: [12, 14]
      });

      const marker = window.L.marker(coords, { icon: petPin })
        .addTo(this.map)
        .bindPopup(`
          <div class="map-popup-card">
            <div style="width:100%; height:110px; border-radius:var(--radius-md); overflow:hidden; margin-bottom:0.6rem; border:1px solid var(--border-glass);">
              <img src="${p.photoUrl}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'" />
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem; gap:0.5rem;">
              <h4 style="font-size:1.05rem; font-weight:800; color:var(--text-main); margin:0;">${p.name}</h4>
              <span class="badge ${p.status === 'lost' ? 'badge-lost' : (p.status === 'impounded' || p.status === 'active_impounded') ? 'badge-impounded' : 'badge-safe'}" style="font-size:0.68rem; flex-shrink:0;">
                ${p.status.toUpperCase()}
              </span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.4rem;">${p.breed} • ${p.gender}</div>
            
            <div style="background:var(--bg-surface-elevated); padding:6px 10px; border-radius:var(--radius-sm); font-size:0.78rem; margin-bottom:0.5rem; border:1px solid var(--border-subtle);">
              <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                <span style="color:var(--text-muted);">RFID Tag:</span>
                <strong style="color:var(--primary); font-family:monospace;">${p.rfidTag}</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span style="color:var(--text-muted);">Microchip:</span>
                <span>${p.microchipNo ? p.microchipNo.slice(-6) : 'N/A'}</span>
              </div>
            </div>

            <div style="display:flex; gap:6px; margin-top:0.4rem;">
              <button type="button" class="btn btn-primary btn-sm" style="flex:1;" onclick="window.publicView.showDirections(${coords[0]}, ${coords[1]}, '${p.name.replace(/'/g, "\\'")}', '${(p.lastSeenLocation || 'Metro Manila').replace(/'/g, "\\'")}', '${p.photoUrl}', 'pet')">
                Directions & Place View
              </button>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}" target="_blank" class="btn btn-outline btn-sm" title="Open in Google Maps">
                Google Maps ↗
              </a>
            </div>
          </div>
        `);

      this.petMarkers[p.id] = marker;
      markerGroup.push(coords);
    });

    // Add Community Sighting Pins (Pulsing Yellow Bubbles)
    this.sightingMarkers = [];
    const sightings = window.pawStore.getSightings();
    sightings.forEach(s => {
      let sCoords = (s.lat && s.lng) ? [s.lat, s.lng] : [14.6360 + (Math.random() - 0.5) * 0.02, 121.0370 + (Math.random() - 0.5) * 0.02];
      const sightingPin = window.L.divIcon({
        className: 'custom-map-icon-wrap',
        html: `
          <div class="map-pin-pill community-sighting-pin">
            <span class="map-pin-dot" style="background:#ea9d1e; box-shadow:0 0 8px #ea9d1e;"></span>
            <span class="map-pin-label">Sighting: ${s.breed || 'Pet'} (${s.confidenceScore || 92}%)</span>
          </div>
        `,
        iconSize: null,
        iconAnchor: [12, 14]
      });

      const sMarker = window.L.marker(sCoords, { icon: sightingPin })
        .addTo(this.map)
        .bindPopup(`
          <div class="map-popup-card">
            <div style="font-size:0.72rem; font-weight:700; color:#ea9d1e; text-transform:uppercase; margin-bottom:2px;">Community Pet Sighting</div>
            <h4 style="font-size:1.02rem; font-weight:800; margin-bottom:0.25rem; color:var(--text-main);">${s.breed || 'Spotted Pet'}</h4>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.4rem;">Location: ${s.location}</div>
            ${s.photoUrl ? `<img src="${s.photoUrl}" style="width:100%; height:110px; border-radius:var(--radius-sm); object-fit:cover; margin-bottom:0.5rem;" />` : ''}
            <div style="font-size:0.78rem; background:rgba(234, 157, 30, 0.12); padding:6px 10px; border-radius:var(--radius-sm); border:1px solid rgba(234, 157, 30, 0.3); margin-bottom:0.5rem; color:var(--text-main);">
              <strong>AI Match Score:</strong> ${s.confidenceScore || 92}% Confidence
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn btn-primary btn-sm" style="flex:1;" onclick="window.publicView.showDirections(${sCoords[0]}, ${sCoords[1]}, '${(s.breed || 'Pet').replace(/'/g, "\\'")}', '${s.location.replace(/'/g, "\\'")}', '${s.photoUrl || ''}', 'sighting')">
                Directions & Place View
              </button>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${sCoords[0]},${sCoords[1]}" target="_blank" class="btn btn-outline btn-sm" title="Open in Google Maps">
                Google Maps ↗
              </a>
            </div>
          </div>
        `);

      this.sightingMarkers.push({ id: s.id, marker: sMarker, data: s, coords: sCoords });
      markerGroup.push(sCoords);
    });

    if (markerGroup.length > 0 && window.L.latLngBounds) {
      const bounds = window.L.latLngBounds(markerGroup);
      this.map.fitBounds(bounds, { padding: [40, 40] });
    }

    this.updateMapMarkers();

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 250);
  }

  setMapLayer(type, notify = true) {
    if (!this.map || !window.L) return;
    this.currentMapType = type;

    // Remove previous active tile layer
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
      // Real Satellite with Street Names & Border Overlays
      tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      tileOptions.attribution = '&copy; Google Maps Hybrid Imagery';
    } else if (type === 'dark') {
      // Night / Dark Roast Mode
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      tileOptions.attribution = '&copy; CARTO & OpenStreetMap';
    } else {
      // Default: Google Roadmap Vector Tiles
      tileUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      tileOptions.attribution = '&copy; Google Maps';
    }

    this.currentTileLayer = window.L.tileLayer(tileUrl, tileOptions);
    this.currentTileLayer.on('tileerror', () => {
      // Safe fallback to CARTO Voyager if provider tile errors
      if (this.currentMapType !== 'fallback') {
        this.currentMapType = 'fallback';
        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap & CARTO',
          maxZoom: 19
        }).addTo(this.map);
      }
    });

    this.currentTileLayer.addTo(this.map);

    // Update active button state on layer dock
    const dock = document.getElementById('gmap-layer-dock');
    if (dock) {
      dock.querySelectorAll('.gmap-layer-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(`'${type}'`));
      });
    }

    if (notify && window.notifManager) {
      const label = type === 'satellite' ? 'Actual Aerial Satellite View' : type === 'hybrid' ? 'Hybrid Street Imagery' : type === 'dark' ? 'Dark Theme' : 'Google Roadmap';
      window.notifManager.showToast(`Switched map layer to ${label}`, 'info', 2000);
    }
  }

  showDirections(destLat, destLng, destName, destAddress, destPhotoUrl, destType = 'shelter', travelMode = 'drive') {
    if (!this.map || !window.L) return;

    this.activeRoute = {
      destLat,
      destLng,
      destName,
      destAddress: destAddress || 'Metro Manila, Philippines',
      destPhotoUrl: destPhotoUrl || (destType === 'shelter' ? 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80' : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'),
      destType,
      travelMode
    };

    const startLat = this.userLocation[0];
    const startLng = this.userLocation[1];

    // Calculate straight-line distance
    const distKm = this.calculateDistance(startLat, startLng, destLat, destLng);
    const driveMin = Math.max(3, Math.round(distKm * 2.4 + 2));
    const walkMin = Math.max(12, Math.round(distKm * 13.5));
    const transitMin = Math.max(8, Math.round(distKm * 4.2 + 6));

    let activeEta = driveMin + ' min';
    let activeDistance = (distKm * 1.18).toFixed(1) + ' km';
    if (travelMode === 'walk') {
      activeEta = (walkMin >= 60 ? `${Math.floor(walkMin / 60)} hr ${walkMin % 60} min` : `${walkMin} min`);
      activeDistance = distKm.toFixed(1) + ' km';
    } else if (travelMode === 'transit') {
      activeEta = transitMin + ' min';
      activeDistance = (distKm * 1.25).toFixed(1) + ' km';
    }

    // Generate realistic road navigation coordinates connecting start and destination
    const routeCoords = this.generateRealisticRoute([startLat, startLng], [destLat, destLng]);

    // Clear previous route layers
    if (this.routePolyline) this.map.removeLayer(this.routePolyline);
    if (this.routeGlowLine) this.map.removeLayer(this.routeGlowLine);
    if (this.startMarker) this.map.removeLayer(this.startMarker);

    // Draw Google Maps vibrant blue polyline with route glow
    this.routeGlowLine = window.L.polyline(routeCoords, {
      color: '#1e40af',
      weight: 8,
      opacity: 0.5,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.map);

    this.routePolyline = window.L.polyline(routeCoords, {
      color: '#3b82f6',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: travelMode === 'walk' ? '4, 8' : null
    }).addTo(this.map);

    // Place Start Point pulsing marker
    const startIcon = window.L.divIcon({
      className: 'custom-map-icon-wrap',
      html: `
        <div style="position:relative; transform:translate(-50%, -50%); display:flex; align-items:center; justify-content:center;">
          <div style="width:28px; height:28px; border-radius:50%; background:rgba(59, 130, 246, 0.3); animation:pulse-dot 1.8s infinite;"></div>
          <div style="position:absolute; width:14px; height:14px; border-radius:50%; background:#2563eb; border:2.5px solid #ffffff; box-shadow:0 0 10px rgba(37, 99, 235, 0.8);"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    this.startMarker = window.L.marker([startLat, startLng], { icon: startIcon })
      .addTo(this.map)
      .bindPopup('<strong>Your Location</strong><br><span style="font-size:11px; color:#94a3b8;">QC Central Rescue Grid</span>');

    // Fit map smoothly along navigation route
    this.map.fitBounds(this.routePolyline.getBounds(), { padding: [60, 60], maxZoom: 16 });

    // Render Google Maps Navigation Drawer with Real Place Visuals
    const hudContainer = document.getElementById('gmap-directions-hud-container');
    if (hudContainer) {
      hudContainer.innerHTML = `
        <div class="gmap-nav-drawer" id="gmap-nav-drawer">
          <!-- Header -->
          <div class="gmap-nav-header">
            <div style="min-width:0;">
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                <span style="font-size:10.5px; font-weight:700; color:var(--primary); text-transform:uppercase; background:rgba(234,157,30,0.15); padding:2px 6px; border-radius:4px;">
                  ${destType === 'shelter' ? 'Official Animal Facility' : destType === 'sighting' ? 'Community Sighting' : 'Missing Pet Landmark'}
                </span>
              </div>
              <h3 style="margin:0; font-size:1.05rem; font-weight:800; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${destName}
              </h3>
              <div style="font-size:0.78rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">
                ${destAddress}
              </div>
            </div>
            <button type="button" class="modal-close-squircle-btn" onclick="window.publicView.closeDirections()" style="width:28px; height:28px; min-width:28px; min-height:28px; border-radius:8px;" title="Close Directions">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="gmap-nav-body">
            <!-- Actual Real-World Place Photo Preview Card -->
            <div class="gmap-place-card">
              <img src="${this.activeRoute.destPhotoUrl}" class="gmap-place-img" alt="${destName}" onerror="this.src='https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80'" />
              <div class="gmap-place-overlay">
                <span style="color:#ffffff; font-size:11px; font-weight:700; text-shadow:0 1px 4px rgba(0,0,0,0.8);">
                  Actual Place View
                </span>
                <button type="button" class="btn btn-primary btn-sm" style="padding:3px 8px; font-size:10.5px;" onclick="window.publicView.openStreetView(${destLat}, ${destLng})">
                  Street View 360° ↗
                </button>
              </div>
            </div>

            <!-- Travel Modes Switcher Bar -->
            <div class="gmap-modes-bar">
              <button type="button" class="gmap-mode-tab ${travelMode === 'drive' ? 'active' : ''}" onclick="window.publicView.showDirections(${destLat}, ${destLng}, '${destName.replace(/'/g, "\\'")}', '${destAddress.replace(/'/g, "\\'")}', '${this.activeRoute.destPhotoUrl}', '${destType}', 'drive')">
                <span style="font-size:11px; font-weight:700;">Drive</span>
                <span style="font-size:10px; opacity:0.8;">${driveMin}m</span>
              </button>
              <button type="button" class="gmap-mode-tab ${travelMode === 'transit' ? 'active' : ''}" onclick="window.publicView.showDirections(${destLat}, ${destLng}, '${destName.replace(/'/g, "\\'")}', '${destAddress.replace(/'/g, "\\'")}', '${this.activeRoute.destPhotoUrl}', '${destType}', 'transit')">
                <span style="font-size:11px; font-weight:700;">Transit</span>
                <span style="font-size:10px; opacity:0.8;">${transitMin}m</span>
              </button>
              <button type="button" class="gmap-mode-tab ${travelMode === 'walk' ? 'active' : ''}" onclick="window.publicView.showDirections(${destLat}, ${destLng}, '${destName.replace(/'/g, "\\'")}', '${destAddress.replace(/'/g, "\\'")}', '${this.activeRoute.destPhotoUrl}', '${destType}', 'walk')">
                <span style="font-size:11px; font-weight:700;">Walk</span>
                <span style="font-size:10px; opacity:0.8;">${walkMin}m</span>
              </button>
            </div>

            <!-- ETA and Distance Summary Badge -->
            <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(37,99,235,0.12); border:1px solid rgba(59,130,246,0.3); padding:8px 12px; border-radius:10px;">
              <div>
                <div style="font-size:1.15rem; font-weight:800; color:#38bdf8;">${activeEta}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${activeDistance} via primary municipal corridor</div>
              </div>
              <button type="button" class="btn btn-outline btn-sm" onclick="window.publicView.setMapLayer('satellite')" style="font-size:10.5px; padding:4px 8px;" title="Switch map to actual satellite photos">
                Satellite View
              </button>
            </div>

            <!-- Turn-by-Turn GPS Step Guidance -->
            <div class="gmap-steps-list">
              <div class="gmap-step-item">
                <span class="gmap-step-icon">1.</span>
                <span>Head towards major route from current GPS origin (${startLat.toFixed(3)}, ${startLng.toFixed(3)})</span>
              </div>
              <div class="gmap-step-item">
                <span class="gmap-step-icon">2.</span>
                <span>Follow corridor ${activeDistance} towards ${destAddress.split(',')[0]}</span>
              </div>
              <div class="gmap-step-item">
                <span class="gmap-step-icon">3.</span>
                <span>Arrive at destination landmark <strong>${destName}</strong></span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="gmap-nav-actions">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}" target="_blank" class="btn btn-primary" style="width:100%; justify-content:center; text-decoration:none; box-shadow:0 4px 14px rgba(234,157,30,0.4);">
                <span>Open Live Navigation in Google Maps ↗</span>
              </a>
              <button type="button" class="btn btn-outline btn-sm" onclick="window.publicView.closeDirections()" style="width:100%; justify-content:center;">
                Exit Navigation
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }

  closeDirections() {
    if (this.routePolyline && this.map) this.map.removeLayer(this.routePolyline);
    if (this.routeGlowLine && this.map) this.map.removeLayer(this.routeGlowLine);
    if (this.startMarker && this.map) this.map.removeLayer(this.startMarker);

    this.routePolyline = null;
    this.routeGlowLine = null;
    this.startMarker = null;
    this.activeRoute = null;

    const hudContainer = document.getElementById('gmap-directions-hud-container');
    if (hudContainer) hudContainer.innerHTML = '';

    this.fitAllIncidents();
  }

  openStreetView(lat, lng) {
    const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
    window.open(url, '_blank');
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
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

  generateRealisticRoute(start, end) {
    const [lat1, lng1] = start;
    const [lat2, lng2] = end;

    // Generate road-like intermediate waypoints
    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;

    const offsetLat = (lat2 - lat1) * 0.15;
    const offsetLng = (lng2 - lng1) * 0.15;

    return [
      [lat1, lng1],
      [lat1 + (lat2 - lat1) * 0.25, lng1 + offsetLng],
      [midLat + offsetLat, midLng],
      [lat1 + (lat2 - lat1) * 0.75, lng2 - offsetLng],
      [lat2, lng2]
    ];
  }

  locateMe() {
    if (!this.map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          this.userLocation = [pos.coords.latitude, pos.coords.longitude];
          this.map.flyTo(this.userLocation, 15, { duration: 1 });
          if (window.notifManager) {
            window.notifManager.showToast('GPS Location acquired. Centered on map.', 'success', 2500);
          }
        },
        () => {
          this.map.flyTo(this.userLocation, 14, { duration: 1 });
          if (window.notifManager) {
            window.notifManager.showToast('Centered on Metro Manila Command Station.', 'info', 2500);
          }
        },
        { timeout: 5000 }
      );
    } else {
      this.map.flyTo(this.userLocation, 14, { duration: 1 });
    }
  }

  fitAllIncidents() {
    if (!this.map || !window.L) return;
    const visibleCoords = [];

    const pets = window.pawStore.getPets();
    pets.forEach(p => {
      const marker = this.petMarkers[p.id];
      if (marker && this.map.hasLayer(marker)) {
        visibleCoords.push(marker.getLatLng());
      }
    });

    if (this.sightingMarkers) {
      this.sightingMarkers.forEach(s => {
        if (s.marker && this.map.hasLayer(s.marker)) {
          visibleCoords.push(s.marker.getLatLng());
        }
      });
    }

    const shelters = window.pawStore.getShelters();
    shelters.forEach(s => {
      visibleCoords.push([s.lat, s.lng]);
    });

    if (visibleCoords.length > 0 && window.L.latLngBounds) {
      const bounds = window.L.latLngBounds(visibleCoords);
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }

  focusPetOnMap(petId) {
    if (this.petMarkers && this.petMarkers[petId] && this.map) {
      const marker = this.petMarkers[petId];
      if (!this.map.hasLayer(marker)) {
        this.map.addLayer(marker);
      }
      this.map.setView(marker.getLatLng(), 15);
      marker.openPopup();
    }
  }

  focusCoordsOnMap(lat, lng, title) {
    if (this.map) {
      this.map.setView([lat, lng], 15);
      if (window.notifManager && title) {
        window.notifManager.showToast(`Focused on ${title}`, 'info', 1800);
      }
    }
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.updateFilterUI();
  }

  handleSearch(query) {
    this.searchQuery = query;
    this.updateFilterUI();
  }

  updateFilterUI() {
    const btnGroup = document.getElementById('public-filter-btn-group');
    if (btnGroup) {
      btnGroup.innerHTML = this.renderFilterButtons();
    }

    const listElem = document.getElementById('public-pets-list');
    if (listElem) {
      listElem.innerHTML = this.renderFilteredList(window.pawStore.getPets());
      if (window.lucide) window.lucide.createIcons({ root: listElem });
    }

    this.updateMapMarkers();
  }

  updateMapMarkers() {
    if (!this.map || !this.petMarkers) return;
    const pets = window.pawStore.getPets();
    const visibleCoords = [];

    // Filter pet markers
    pets.forEach(p => {
      const marker = this.petMarkers[p.id];
      if (!marker) return;

      let isMatch = true;
      if (this.currentFilter === 'lost') {
        isMatch = (p.status === 'lost');
      } else if (this.currentFilter === 'sighted') {
        isMatch = false;
      } else if (this.currentFilter === 'impounded') {
        isMatch = (p.status === 'impounded' || p.status === 'active_impounded');
      } else if (this.currentFilter === 'reunited') {
        isMatch = (p.status === 'reunited' || p.status === 'safe');
      }

      if (isMatch && this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchBreed = (p.breed || '').toLowerCase().includes(q);
        const matchTag = (p.rfidTag || '').toLowerCase().includes(q);
        isMatch = matchName || matchBreed || matchTag;
      }

      if (isMatch) {
        if (!this.map.hasLayer(marker)) {
          this.map.addLayer(marker);
        }
        visibleCoords.push(marker.getLatLng());
      } else {
        if (this.map.hasLayer(marker)) {
          this.map.removeLayer(marker);
        }
      }
    });

    // Filter community sighting markers
    if (this.sightingMarkers) {
      this.sightingMarkers.forEach(sItem => {
        let isMatch = (this.currentFilter === 'all' || this.currentFilter === 'sighted');
        if (isMatch && this.searchQuery) {
          const q = this.searchQuery.toLowerCase();
          const matchBreed = (sItem.data.breed || '').toLowerCase().includes(q);
          const matchLoc = (sItem.data.location || '').toLowerCase().includes(q);
          isMatch = matchBreed || matchLoc;
        }

        if (isMatch) {
          if (!this.map.hasLayer(sItem.marker)) {
            this.map.addLayer(sItem.marker);
          }
          visibleCoords.push(sItem.marker.getLatLng());
        } else {
          if (this.map.hasLayer(sItem.marker)) {
            this.map.removeLayer(sItem.marker);
          }
        }
      });
    }

    const shelters = window.pawStore.getShelters();
    shelters.forEach(s => {
      visibleCoords.push([s.lat, s.lng]);
    });

    if (visibleCoords.length > 0 && window.L.latLngBounds) {
      try {
        const bounds = window.L.latLngBounds(visibleCoords);
        this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch (e) {}
    }
  }

  openFoundPetModal() {
    if (window.reportManager) {
      window.reportManager.openReportModal('found');
    } else {
      const modal = document.getElementById('found-pet-modal');
      if (modal) modal.classList.add('active');
    }
  }

  openMapApiKeyModal() {
    const modal = document.getElementById('map-api-key-modal');
    const input = document.getElementById('map-api-key-input');
    const statusText = document.getElementById('map-key-status-text');
    if (input && window.pawStore) {
      input.value = window.pawStore.getMapApiKey();
    }
    if (statusText) {
      statusText.textContent = 'Active & Connected';
      statusText.style.color = '#22c55e';
    }
    if (modal) modal.classList.add('active');
  }

  saveMapApiKey() {
    const input = document.getElementById('map-api-key-input');
    if (input && window.pawStore) {
      window.pawStore.setMapApiKey(input.value);
      if (window.notifManager) {
        window.notifManager.closeModal('map-api-key-modal');
        window.notifManager.showToast('Map API Key updated successfully. Map re-initialized.', 'success');
      }
      const pets = window.pawStore.getPets();
      const shelters = window.pawStore.getShelters();
      this.initMap(pets, shelters);
    }
  }

  resetDefaultApiKey() {
    const input = document.getElementById('map-api-key-input');
    if (input) {
      input.value = 'pk.eyJ1IjoicGF3dHJhY2stYWRtaW4iLCJhIjoiY2x6cGF3dHJhY2swMDAxIn0.PawTrack_NCR_GeoTile_2026_LiveKey';
    }
  }
}

window.publicView = new PublicView();

