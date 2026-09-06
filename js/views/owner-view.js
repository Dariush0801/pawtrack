/**
 * PawTrack Pet Owner View
 */

class OwnerView {
  constructor() {
    this.timerInterval = null;
    this.currentUnregisteredFilter = 'all'; // 'all', 'found', 'missing'
  }

  render(container) {
    const t = (k, d) => (window.pawI18n ? window.pawI18n.t(k, d) : d);
    const pets = window.pawStore.getPets();
    const impoundedPet = pets.find(p => p.status === 'impounded');
    const activeImpoundment = impoundedPet ? window.pawStore.getActiveImpoundmentForPet(impoundedPet.id) : null;

    let heroLeftHtml = '';
    if (impoundedPet && activeImpoundment) {
      heroLeftHtml = `
        <div class="impound-alert-banner">
          <div class="impound-alert-header">
            <div class="alert-title-tag">
              <i data-lucide="alert-triangle" style="width:22px; height:22px; color:var(--danger); flex-shrink:0;"></i>
              <div>
                <div style="font-weight:700;">${t('owner.heroImpoundTitle', 'IMPOUNDMENT NOTICE')}: "${impoundedPet.name.toUpperCase()}" RECORDED</div>
                <div style="font-size:0.78rem; font-weight:400; color:var(--text-muted);">RFID Tag: ${impoundedPet.rfidTag} · Intake Officer: ${activeImpoundment.intakeOfficer || 'Animal Control Personnel'}</div>
              </div>
            </div>
            <div class="countdown-timer-box">
              <i data-lucide="clock" style="color:var(--danger); width:16px; height:16px;"></i>
              <div>
                <div style="font-size:0.62rem; text-transform:uppercase; color:var(--text-muted); font-weight:600;">${t('owner.heroClaimWindow', 'Holding Period Left')}</div>
                <div class="timer-digits" id="holding-countdown-display">Calculating...</div>
              </div>
            </div>
          </div>

          <div class="impound-details-grid">
            <div class="detail-item">
              <span class="detail-label">Holding Facility</span>
              <span class="detail-value">${activeImpoundment.shelterName}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Facility Address</span>
              <span class="detail-value">${activeImpoundment.shelterAddress}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Kennel / Cage ID</span>
              <span class="detail-value" style="color:var(--primary); font-weight:700;">${activeImpoundment.cageNumber}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Impound Location</span>
              <span class="detail-value">${activeImpoundment.impoundLocation || activeImpoundment.shelterAddress || 'Metro Manila Facility'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Health & Notes</span>
              <span class="detail-value" style="font-size:0.82rem;">${activeImpoundment.healthCondition || 'Healthy, vaccinated status verified.'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Hotline</span>
              <span class="detail-value" style="color:var(--primary); font-weight:700;">${activeImpoundment.shelterPhone}</span>
            </div>
          </div>

          <div class="claim-checklist">
            <h4><i data-lucide="shield-alert" style="width:15px; height:15px;"></i> Mandatory Claiming Documentation:</h4>
            <ul>
              <li><i data-lucide="check" style="width:13px; height:13px;"></i> Valid Government Issued ID</li>
              <li><i data-lucide="check" style="width:13px; height:13px;"></i> Pet Registration / Vaccination Book</li>
              <li><i data-lucide="check" style="width:13px; height:13px;"></i> RFID Tag Verification Proof</li>
              <li><i data-lucide="check" style="width:13px; height:13px;"></i> Standard Daily Care Fee</li>
            </ul>
            <div style="margin-top: 0.85rem; display:flex; gap:0.65rem; flex-wrap:wrap;">
              <button class="btn btn-primary btn-sm" onclick="window.ownerView.openDirections('${activeImpoundment.shelterAddress}')">
                <i data-lucide="navigation"></i> ${t('owner.heroDirectionsBtn', 'Directions')}
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.ownerView.simulateClaim('${activeImpoundment.id}', '${impoundedPet.name}')">
                <i data-lucide="check-circle-2"></i> ${t('owner.heroRedeemBtn', 'Confirm Claim')}
              </button>
              <button class="btn btn-outline btn-sm" onclick="window.notifManager.showSmsSimulation({
                ownerPhone: '${impoundedPet.owner ? impoundedPet.owner.phone : '+63 917 555 3829'}',
                petName: '${impoundedPet.name}',
                rfidTag: '${impoundedPet.rfidTag}',
                shelterName: '${activeImpoundment.shelterName}',
                shelterAddress: '${activeImpoundment.shelterAddress}',
                shelterPhone: '${activeImpoundment.shelterPhone}',
                cageNumber: '${activeImpoundment.cageNumber}'
              })">
                <i data-lucide="smartphone"></i> View SMS Alert
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      heroLeftHtml = `
        <div class="owner-status-card glass-card">
          <div>
            <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
              <div style="width:40px; height:40px; border-radius:var(--radius-md); background:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center;">
                <i data-lucide="shield-check" style="width:22px; height:22px;"></i>
              </div>
              <div>
                <h3 style="font-size:1.15rem; font-weight:700;">${t('owner.heroProtectedTitle', 'PawTrack Protection Active')}</h3>
                <div style="font-size:0.8rem; color:var(--text-muted);">${t('owner.heroProtectedDesc', 'All registered pets are currently safe at home or monitored under the NCR Municipal RFID grid.')}</div>
              </div>
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.45; margin-bottom:1rem;">
              ${t('owner.heroProtectedDesc', 'All registered pets are currently safe at home or monitored under the NCR Municipal RFID grid.')}
            </p>
          </div>
          <div style="display:flex; gap:0.65rem; flex-wrap:wrap; padding-top:0.75rem; border-top:1px solid var(--border-subtle);">
            <span class="badge badge-safe">
              <span class="badge-dot"></span> System Online
            </span>
            <span class="badge badge-safe">
              <span class="badge-dot"></span> ${t('owner.heroSheltersConnected', '3 Municipal Shelters Connected')}
            </span>
          </div>
        </div>
      `;
    }

    const hasImpound = Boolean(impoundedPet && activeImpoundment);
    const layoutClass = hasImpound ? 'owner-hero-layout impound-active' : 'owner-hero-layout status-active';
    const statsGridClass = hasImpound ? 'stats-sidebar-col-1' : 'stats-sidebar-grid-2x2';

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h1>${t('owner.title', 'Pet Owner Portal')}</h1>
          <div class="view-subtitle">${t('owner.subtitle', 'Monitor registered pets, manage RFID tags, and receive immediate impoundment notifications.')}</div>
        </div>
        <div style="display:flex; gap:0.6rem; align-items:center; width:auto;">
          <button class="btn-help-circle" id="owner-guide-header-btn" onclick="window.ownerView.openOwnerGuideModal()" title="${t('owner.guideBtnTitle', 'Owner System Guide: What to do Before, During & After')}" aria-label="Owner System Guide">
            <i data-lucide="help-circle"></i>
          </button>
          <button class="btn btn-primary" onclick="window.ownerView.openRegisterModal()">
            <i data-lucide="plus-circle"></i> ${t('owner.regBtn', 'Register Pet with RFID')}
          </button>
        </div>
      </div>

      <!-- Hero Layout: Impoundment Notice / Status Card on Left, 4 Categories on Right -->
      <div class="${layoutClass}">
        <!-- Left Side: Impoundment Notice or Status Card -->
        <div style="height:100%;">
          ${heroLeftHtml}
        </div>

        <!-- Right Side: 4 Stat Categories -->
        <div class="${statsGridClass}">
          <div class="stat-card glass-card" data-label="${t('owner.statTotalPets', 'Total Registered Pets')}" title="Click to view all registered pets" style="cursor:pointer;" onclick="document.getElementById('registered-pets-heading')?.scrollIntoView({behavior:'smooth'})">
            <div class="stat-icon" style="background:linear-gradient(135deg, #ea9d1e, #b85410); color:#180d07;">
              <i data-lucide="shield-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">${pets.length}</div>
              <div class="stat-label">${t('owner.statTotalPets', 'Total Registered Pets')}</div>
            </div>
          </div>

          <div class="stat-card glass-card" data-label="${t('owner.statActiveRfid', 'Active RFID Transponders')}" title="Click to view hardware transponder specs" style="cursor:pointer;" onclick="window.location.hash='#hardware'">
            <div class="stat-icon" style="background:linear-gradient(135deg, #b85410, #54280e); color:#ffffff;">
              <i data-lucide="radio"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">${pets.filter(p => p.rfidTag).length}</div>
              <div class="stat-label">${t('owner.statActiveRfid', 'Active RFID Transponders')}</div>
            </div>
          </div>

          <div class="stat-card glass-card" data-label="${t('owner.statActiveAlerts', 'Active Alerts / In Recovery')}" title="Click to view active recovery alerts on Incident Map" style="cursor:pointer;" onclick="window.location.hash='#map'; window.publicView.setFilter('lost');">
            <div class="stat-icon" style="background:linear-gradient(135deg, #ba3820, #54280e); color:#ffffff;">
              <i data-lucide="alert-circle"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">${pets.filter(p => p.status === 'lost' || p.status === 'impounded').length}</div>
              <div class="stat-label">${t('owner.statActiveAlerts', 'Active Alerts / In Recovery')}</div>
            </div>
          </div>

          <div class="stat-card glass-card" data-label="${t('owner.statSafePets', 'Safe / Reunited Pets')}" title="Click to view registered safe & reunited pets" style="cursor:pointer;" onclick="document.getElementById('registered-pets-heading')?.scrollIntoView({behavior:'smooth'})">
            <div class="stat-icon" style="background:linear-gradient(135deg, #54280e, #241208); color:#ea9d1e;">
              <i data-lucide="check-circle-2"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">${pets.filter(p => p.status === 'safe' || p.status === 'reunited').length}</div>
              <div class="stat-label">${t('owner.statSafePets', 'Safe / Reunited')}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pets Grid -->
      <div style="margin-bottom: 1.25rem; display:flex; justify-content:space-between; align-items:center;">
        <h2 id="registered-pets-heading" style="font-size:1.35rem;">${t('owner.registeredHeading', 'Registered Pets')} (${pets.length})</h2>
      </div>

      <div class="pets-grid">
        ${pets.length === 0 ? `
          <div class="glass-card" style="grid-column: 1 / -1; text-align:center; padding: 3rem 1.5rem; display:flex; flex-direction:column; align-items:center; gap: 0.75rem; border: 1.5px dashed var(--border-subtle, #cbd5e1);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--bg-surface-elevated, #f8fafc); display:flex; align-items:center; justify-content:center; color:var(--primary);">
              <i data-lucide="shield-plus" style="width:28px; height:28px;"></i>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 700; margin:0;">${t('owner.noPetsTitle', 'No Registered Pets Yet')}</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted, #64748b); max-width: 420px; margin:0; line-height: 1.45;">${t('owner.noPetsDesc', 'Register your pet with an RFID collar tag and microchip to enable municipal protection and real-time impoundment alerts.')}</p>
            <div style="display:flex; gap:0.6rem; align-items:center; margin-top: 0.5rem; justify-content:center;">
              <button class="btn-help-circle" onclick="window.ownerView.openOwnerGuideModal()" title="${t('owner.guideBtnTitle', 'Owner System Guide: What to do Before, During & After')}" aria-label="Owner System Guide">
                <i data-lucide="help-circle"></i>
              </button>
              <button class="btn btn-primary" onclick="window.ownerView.openRegisterModal()">
                <i data-lucide="plus-circle"></i> ${t('owner.regBtn', 'Register Pet with RFID')}
              </button>
            </div>
          </div>
        ` : pets.map(pet => this.renderPetCard(pet)).join('')}
      </div>

      <!-- Unregistered & Community Reported Pets Section -->
      ${this.renderUnregisteredSection(t)}
    `;

    if (window.lucide) window.lucide.createIcons({ root: container });

    if (activeImpoundment) {
      this.startCountdownTimer(activeImpoundment.claimDeadline);
    }
  }

  renderPetCard(pet) {
    const t = (k, d) => (window.pawI18n ? window.pawI18n.t(k, d) : d);
    let badgeClass = 'badge-safe';
    let badgeText = t('owner.statusSafe', 'Safe');

    // Check if a community founder submitted a Found report matching this pet's RFID
    const sightings = window.pawStore ? (window.pawStore.getSightings() || []) : [];
    const cleanPetRfid = (pet.rfidTag || '').trim().toUpperCase();
    const matchingSighting = sightings.find(s => 
      (cleanPetRfid && s.rfidTag && s.rfidTag.trim().toUpperCase() === cleanPetRfid) ||
      (s.matchedPetId && s.matchedPetId === pet.id)
    );

    if (matchingSighting) {
      badgeClass = 'badge-pending';
      badgeText = t('owner.statusPending', 'Found (Pending)');
    } else if (pet.status === 'lost') {
      badgeClass = 'badge-lost';
      badgeText = t('owner.statusLost', 'Missing / Lost');
    } else if (pet.status === 'impounded') {
      badgeClass = 'badge-impounded';
      badgeText = t('owner.statusImpounded', 'Impounded');
    } else if (pet.status === 'reunited') {
      badgeClass = 'badge-reunited';
      badgeText = t('owner.statusReunited', 'Reunited');
    }

    const safePetName = (pet.name || 'Pet').replace(/'/g, "\\'");
    const safeCaption = `${pet.breed} · ${pet.species} | RFID: ${pet.rfidTag}`.replace(/'/g, "\\'");

    return `
      <div class="pet-card glass-card ${matchingSighting ? 'pet-card-matched-pending' : ''}">
        <div class="pet-card-image-wrap" onclick="window.pawApp.openLightbox('${pet.photoUrl}', '${safePetName}', '${safeCaption}')" title="Click to view full photo of ${safePetName}" style="cursor:zoom-in;">
          <img src="${pet.photoUrl}" alt="${pet.name}" class="pet-card-img" onerror="this.src='https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'" />
          <div class="pet-img-zoom-hint">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 3 21 3 21 9"/>
              <polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
            <span>${t('owner.viewFullPhoto', 'View Full Photo')}</span>
          </div>
          <div class="pet-badge-pos">
            <span class="badge ${badgeClass}">
              <span class="badge-dot"></span> ${badgeText}
            </span>
          </div>
        </div>

        <div class="pet-card-body">
          <div class="pet-card-header">
            <div>
              <h3 class="pet-name">${pet.name}</h3>
              <div class="pet-meta">${pet.breed} · ${pet.gender} · ${pet.species}</div>
            </div>
            <div style="text-align:right;">
              <span class="badge badge-outline" style="font-family:var(--font-mono); font-size:0.75rem;">${pet.rfidTag}</span>
            </div>
          </div>

          ${matchingSighting ? `
            <!-- Pending Founder Sighting Banner (Visible strictly to registered owner with matching RFID) -->
            <div class="pending-founder-banner">
              <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                <span class="pending-pulse-dot"></span>
                <div style="font-size:0.76rem; font-weight:700; color:#ea9d1e; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${t('owner.founderFoundAlert', 'Founder Located Your Pet')}
                </div>
              </div>
              <button type="button" class="pending-btn-pill" onclick="window.ownerView.showPendingFinderInfo('${pet.id}')" title="${t('owner.viewFinderInfoTitle', 'View Founder Contact & Sighting Details')}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>${t('owner.btnPending', 'Pending')}</span>
              </button>
            </div>
          ` : ''}

          <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.75rem; background:var(--bg-surface); padding:0.5rem 0.75rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <strong>Medical / ID Notes:</strong> ${pet.medicalNotes || 'Standard vaccination profile recorded.'}
          </div>

          <div class="pet-card-actions">
            ${matchingSighting ? `
              <button class="btn btn-pending-action btn-sm" style="flex:1; min-width:0; color:#ffffff !important; display:flex; align-items:center; justify-content:center; gap:5px;" onclick="window.ownerView.showPendingFinderInfo('${pet.id}')" title="${t('owner.viewFinderInfoTitle', 'View Founder Contact & Sighting Details')}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>${t('owner.btnPending', 'Pending')}</span>
              </button>
              <button class="btn btn-primary btn-sm" style="flex-shrink:0; background: #16a34a; border-color: #16a34a; color:#ffffff !important; display:flex; align-items:center; gap:4px;" onclick="window.ownerView.markPetSafe('${pet.id}')" title="Reunited and Safe at Home">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>${t('owner.btnMarkSafe', 'Mark Safe')}</span>
              </button>
            ` : pet.status === 'lost' ? `
              <button class="btn btn-primary btn-sm" style="flex:1; min-width:0; background: #16a34a; border-color: #16a34a; color:#ffffff !important; display:flex; align-items:center; justify-content:center; gap:5px;" onclick="window.ownerView.markPetSafe('${pet.id}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>${t('owner.btnMarkSafe', 'Mark Safe')}</span>
              </button>
              <button class="btn btn-outline btn-sm" style="color: #dc2626; border-color: #dc2626; flex-shrink:0; display:flex; align-items:center; gap:4px;" onclick="window.location.hash='#map'" title="View on Map">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>Map</span>
              </button>
            ` : pet.status === 'impounded' ? `
              <button class="btn btn-danger btn-sm" style="flex:1; min-width:0; color:#ffffff !important; display:flex; align-items:center; justify-content:center; gap:5px;" onclick="window.location.hash='#owner'">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span>Impound Details</span>
              </button>
            ` : `
              <button class="btn btn-danger btn-sm" style="flex:1; min-width:0; color:#ffffff !important; display:flex; align-items:center; justify-content:center; gap:5px;" onclick="window.ownerView.openReportLostModal('${pet.id}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span>${t('owner.btnReportLost', 'Report Missing')}</span>
              </button>
            `}
            <button class="btn btn-outline btn-sm" style="flex-shrink:0; display:flex; align-items:center; gap:4px;" onclick="window.ownerView.showDigitalTagPass('${pet.id}')" title="View Digital RFID & QR Tag Pass">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="5" height="5" x="3" y="3" rx="1"/>
                <rect width="5" height="5" x="16" y="3" rx="1"/>
                <rect width="5" height="5" x="3" y="16" rx="1"/>
                <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
                <path d="M21 21v.01"/>
                <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
                <path d="M3 12h.01"/>
                <path d="M12 3h.01"/>
                <path d="M12 16v.01"/>
                <path d="M16 12h1"/>
                <path d="M21 12v.01"/>
                <path d="M12 21v-1"/>
              </svg>
              <span>${t('owner.btnDigitalPass', 'Tag Pass')}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  setUnregisteredFilter(filter) {
    this.currentUnregisteredFilter = filter;
    this.render(document.getElementById('app-viewport'));
  }

  viewUnregisteredOnMap(lat, lng, name) {
    window.location.hash = '#map';
    if (window.publicView) {
      setTimeout(() => {
        if (window.publicView && window.publicView.map) {
          window.publicView.map.flyTo([lat, lng], 16, { duration: 0.8 });
        }
      }, 250);
    }
  }

  renderUnregisteredSection(t) {
    const sightings = window.pawStore ? (window.pawStore.getSightings() || []) : [];
    const cases = window.pawStore ? (window.pawStore.getCases() || []) : [];
    const registeredPets = window.pawStore ? (window.pawStore.getPets() || []) : [];

    // Found / Sighted Stray Pet reports
    const foundReports = sightings.map(s => ({
      id: s.id,
      species: s.species || 'Dog',
      breed: s.breed || (s.species === 'Dog' ? 'Aspin' : 'Domestic Shorthair'),
      name: s.breed ? `${s.breed} (${s.species || 'Stray'})` : `${s.species || 'Stray'} Sighting`,
      location: s.location || 'Metro Manila',
      coords: s.coords || [14.6500, 121.0400],
      rfidTag: s.rfidTag || '',
      reporterPhone: s.reporterPhone || '',
      reporterName: s.reporterName || 'Community Good Samaritan',
      notes: s.comments || s.notes || 'Sighted stray pet in community.',
      photoUrl: s.photoUrl || s.photo || (s.species === 'Cat' ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500' : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500'),
      timestamp: s.timestamp || s.createdAt || new Date().toISOString(),
      reportType: 'found'
    }));

    // Missing Pet reports from non-registered or custom community cases
    const missingReports = cases
      .filter(c => c.status === 'missing' && (!c.petId || c.petId === 'pet-temp' || c.petId === 'custom' || !registeredPets.some(p => p.id === c.petId)))
      .map(c => ({
        id: c.id,
        species: c.species || 'Pet',
        breed: c.breed || 'Mixed Breed',
        name: c.petName || 'Missing Pet',
        location: c.location || 'Metro Manila',
        coords: c.coords || [14.6500, 121.0400],
        rfidTag: c.rfidTag || '',
        reporterPhone: c.ownerPhone || c.phone || '',
        reporterName: 'Pet Guardian',
        notes: c.notes || (c.timeline && c.timeline[0] ? c.timeline[0].notes : 'Reported missing in community.'),
        photoUrl: c.photoUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
        timestamp: c.createdAt || new Date().toISOString(),
        reportType: 'missing'
      }));

    const allUnregistered = [...foundReports, ...missingReports].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const filteredList = this.currentUnregisteredFilter === 'all'
      ? allUnregistered
      : allUnregistered.filter(r => r.reportType === this.currentUnregisteredFilter);

    const foundCount = allUnregistered.filter(r => r.reportType === 'found').length;
    const missingCount = allUnregistered.filter(r => r.reportType === 'missing').length;

    return `
      <div class="unregistered-pets-section">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom: 1.25rem;">
          <div>
            <h2 id="unregistered-pets-heading" style="font-size:1.35rem; display:flex; align-items:center; gap:8px; margin:0;">
              <span data-i18n="owner.unregisteredHeading">${t('owner.unregisteredHeading', 'Unregistered Pets')}</span>
              <span class="badge badge-outline" style="font-size:0.75rem;">(${allUnregistered.length})</span>
            </h2>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:3px;" data-i18n="owner.unregisteredSub">
              ${t('owner.unregisteredSub', 'Community stray sightings and public missing reports submitted through Report Pet.')}
            </div>
          </div>

          <!-- Filter Pills -->
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <div class="report-filter-toggle-pills">
              <button type="button" class="report-filter-pill ${this.currentUnregisteredFilter === 'all' ? 'active' : ''}" onclick="window.ownerView.setUnregisteredFilter('all')">
                <span data-i18n="owner.filterAll">${t('owner.filterAll', 'All')}</span> (${allUnregistered.length})
              </button>
              <button type="button" class="report-filter-pill ${this.currentUnregisteredFilter === 'found' ? 'active' : ''}" onclick="window.ownerView.setUnregisteredFilter('found')">
                <span data-i18n="owner.filterFound">${t('owner.filterFound', 'Found')}</span> (${foundCount})
              </button>
              <button type="button" class="report-filter-pill ${this.currentUnregisteredFilter === 'missing' ? 'active' : ''}" onclick="window.ownerView.setUnregisteredFilter('missing')">
                <span data-i18n="owner.filterMissing">${t('owner.filterMissing', 'Missing')}</span> (${missingCount})
              </button>
            </div>
          </div>
        </div>

        <!-- Unregistered Pets Grid -->
        <div class="pets-grid">
          ${filteredList.length === 0 ? `
            <div class="glass-card" style="grid-column: 1 / -1; text-align:center; padding: 2.5rem 1.5rem; display:flex; flex-direction:column; align-items:center; gap: 0.6rem; border: 1.5px dashed var(--border-subtle);">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
              <h3 style="font-size: 1.05rem; font-weight: 700; margin:0;">No Unregistered Reports</h3>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin:0;">No reports match the current filter. Community sightings and missing reports will appear here.</p>
            </div>
          ` : filteredList.map(item => this.renderUnregisteredPetCard(item, t)).join('')}
        </div>
      </div>
    `;
  }

  renderUnregisteredPetCard(item, t) {
    const isFound = item.reportType === 'found';
    const badgeClass = isFound ? 'badge-safe' : 'badge-lost';
    const badgeText = isFound ? t('owner.statusFoundSighting', 'Found / Sighted') : t('owner.statusReportedMissing', 'Reported Missing');

    // Check if RFID matches any registered pet
    let matchedPet = null;
    if (item.rfidTag && window.pawStore) {
      matchedPet = window.pawStore.getPetByRFID(item.rfidTag);
    }

    const safeName = (item.name || 'Pet').replace(/'/g, "\\'");
    const safeCaption = `${item.breed} · ${item.species} | ${item.location}`.replace(/'/g, "\\'");
    const itemDataStr = JSON.stringify({
      id: item.id,
      petName: matchedPet ? matchedPet.name : item.name,
      breed: item.breed,
      species: item.species,
      rfidTag: item.rfidTag,
      photoUrl: item.photoUrl,
      finderName: item.reporterName,
      finderPhone: item.reporterPhone,
      finderNotes: item.notes,
      location: item.location,
      coords: item.coords,
      timestamp: item.timestamp
    }).replace(/"/g, '&quot;');

    return `
      <div class="pet-card glass-card" style="${matchedPet ? 'border: 2px solid rgba(34, 197, 94, 0.6); box-shadow: 0 4px 18px rgba(34, 197, 94, 0.2);' : ''}">
        <div class="pet-card-image-wrap" onclick="window.pawApp.openLightbox('${item.photoUrl}', '${safeName}', '${safeCaption}')" title="Click to view full photo" style="cursor:zoom-in;">
          <img src="${item.photoUrl}" alt="${item.name}" class="pet-card-img" onerror="this.src='https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'" />
          <div class="pet-img-zoom-hint">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 3 21 3 21 9"/>
              <polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
            <span>${t('owner.viewFullPhoto', 'View Full Photo')}</span>
          </div>
          <div class="pet-badge-pos">
            <span class="badge ${badgeClass}">
              <span class="badge-dot"></span> ${badgeText}
            </span>
          </div>
        </div>

        <div class="pet-card-body">
          <div class="pet-card-header">
            <div>
              <h3 class="pet-name">${item.name}</h3>
              <div class="pet-meta">${item.species} · ${item.breed}</div>
            </div>
            <div style="text-align:right;">
              ${item.rfidTag ? `
                <span class="badge badge-outline" style="font-family:var(--font-mono); font-size:0.75rem;">${item.rfidTag}</span>
              ` : `
                <span class="badge badge-outline" style="font-size:0.7rem; color:var(--text-muted);">No RFID</span>
              `}
            </div>
          </div>

          ${matchedPet ? `
            <div style="background:rgba(34, 197, 94, 0.15); border:1px solid rgba(34, 197, 94, 0.4); padding:6px 10px; border-radius:8px; margin-bottom:0.6rem; display:flex; align-items:center; justify-content:space-between; gap:6px;">
              <span style="font-size:0.75rem; font-weight:700; color:#22c55e;">MATCHED: "${matchedPet.name}"</span>
              <button type="button" class="btn btn-primary btn-sm" style="font-size:10px; padding:2px 8px; border-radius:6px;" onclick="window.notifManager.showFinderInfo(${itemDataStr})">
                View Finder Info
              </button>
            </div>
          ` : ''}

          <div style="display:flex; align-items:center; gap:6px; font-size:0.78rem; color:var(--primary); font-weight:600; margin-bottom:4px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.location}</span>
          </div>

          <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.75rem; background:var(--bg-surface); padding:0.5rem 0.75rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); line-height:1.35;">
            <strong>${isFound ? 'Finder Notes:' : 'Circumstances:'}</strong> ${item.notes}
            ${item.reporterPhone ? `<div style="margin-top:4px; font-family:monospace; color:var(--text-main); font-size:0.74rem;">Contact: ${item.reporterPhone}</div>` : ''}
          </div>

          <div class="pet-card-actions">
            <button class="btn btn-primary btn-sm" style="flex:1; min-width:0;" onclick="window.ownerView.viewUnregisteredOnMap(${item.coords[0]}, ${item.coords[1]}, '${safeName}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              <span>View on Map</span>
            </button>
            <button class="btn btn-outline btn-sm" style="flex-shrink:0;" onclick="window.notifManager.showFinderInfo(${itemDataStr})" title="View Full Report & Finder Details">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  startCountdownTimer(deadlineStr) {
    if (this.timerInterval) clearInterval(this.timerInterval);

    const updateDisplay = () => {
      const displayElem = document.getElementById('holding-countdown-display');
      if (!displayElem) {
        clearInterval(this.timerInterval);
        return;
      }

      const diff = new Date(deadlineStr).getTime() - Date.now();
      if (diff <= 0) {
        displayElem.innerText = '00:00:00 (EXPIRED)';
        displayElem.style.color = 'var(--danger)';
        clearInterval(this.timerInterval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      displayElem.innerText = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    updateDisplay();
    this.timerInterval = setInterval(updateDisplay, 1000);
  }

  openRegisterModal(prefillRfid = null) {
    if (!window.pawStore.isLoggedIn()) {
      const onetap = document.getElementById('google-onetap-prompt');
      if (onetap) onetap.style.display = 'block';
      const warningModal = document.getElementById('google-required-modal');
      if (warningModal) warningModal.style.display = 'flex';
      if (window.notifManager) {
        window.notifManager.showToast('Google Login Required: Please sign in to register pets.', 'warning', 3500);
      }
      return;
    }
    const modal = document.getElementById('register-pet-modal');
    const form = document.getElementById('register-pet-form');
    if (form) {
      if (prefillRfid) {
        form.dataset.prefillRfid = prefillRfid;
        const notes = document.getElementById('reg-pet-notes');
        if (notes && !notes.value) {
          notes.value = `Assigned Tag UID: ${prefillRfid}`;
        }
      } else {
        delete form.dataset.prefillRfid;
      }
    }
    if (modal) modal.classList.add('active');
  }

  openReportLostModal(petId) {
    const pet = window.pawStore.getPetById(petId);
    if (!pet) return;

    const modal = document.getElementById('report-lost-modal');
    const form = document.getElementById('report-lost-form');
    const petIdInput = document.getElementById('report-lost-pet-id');
    const petNameDisplay = document.getElementById('report-lost-pet-name');
    const locationInput = document.getElementById('report-lost-location');

    if (form) form.dataset.petId = pet.id;
    if (petIdInput) petIdInput.value = pet.id;
    if (petNameDisplay) petNameDisplay.textContent = pet.name || 'Pet';
    if (locationInput) locationInput.value = pet.lastSeenLocation || 'Quezon City, Metro Manila';

    if (modal) {
      modal.classList.add('active');
      if (window.lucide) window.lucide.createIcons({ root: modal });
    }
  }

  markPetSafe(petId) {
    window.pawStore.updatePetStatus(petId, 'safe');

    // Also resolve any active cases for this pet to synchronize with Admin Portal
    if (window.pawStore) {
      const cases = window.pawStore.getCases() || [];
      const activeCase = cases.find(c => c.petId === petId && c.status !== 'reunited');
      if (activeCase) {
        activeCase.status = 'reunited';
        activeCase.lastUpdated = new Date().toISOString();
        if (!Array.isArray(activeCase.timeline)) activeCase.timeline = [];
        activeCase.timeline.unshift({
          timestamp: new Date().toISOString(),
          type: 'reunited',
          title: 'Pet Reunited & Safe at Home',
          location: 'Home / Safe',
          notes: 'Guardian confirmed pet is safely recovered.'
        });
        window.pawStore.saveCase(activeCase);
      }
    }

    if (window.notifManager) {
      window.notifManager.showToast('Pet status updated to Safe at Home', 'success');
    }
    this.render(document.getElementById('app-viewport'));
  }

  showPendingFinderInfo(petId) {
    const pet = window.pawStore ? window.pawStore.getPetById(petId) : null;
    if (!pet) return;

    const sightings = window.pawStore ? (window.pawStore.getSightings() || []) : [];
    const cleanPetRfid = (pet.rfidTag || '').trim().toUpperCase();
    const match = sightings.find(s => 
      (cleanPetRfid && s.rfidTag && s.rfidTag.trim().toUpperCase() === cleanPetRfid) ||
      (s.matchedPetId && s.matchedPetId === pet.id)
    );

    if (match) {
      const finderData = {
        id: match.id,
        petId: pet.id,
        petName: pet.name,
        breed: pet.breed || match.breed,
        species: pet.species || match.species,
        rfidTag: pet.rfidTag,
        photoUrl: match.photoUrl || match.photo || pet.photoUrl,
        finderName: match.reporterName || 'Community Good Samaritan',
        finderPhone: match.reporterPhone || '+63 9XX XXX XXXX',
        finderNotes: match.comments || match.notes || 'Pet is safe with community finder.',
        location: match.location || 'Metro Manila',
        coords: match.coords || [14.6500, 121.0400],
        timestamp: match.timestamp || match.createdAt || new Date().toISOString()
      };
      if (window.notifManager) {
        window.notifManager.showFinderInfo(finderData);
      }
    } else {
      const notifs = window.pawStore ? (window.pawStore.getNotifications() || []) : [];
      const notifMatch = notifs.find(n => (n.petId === pet.id || (cleanPetRfid && n.rfidTag && n.rfidTag.toUpperCase() === cleanPetRfid)) && n.type === 'pet_found_match');
      if (notifMatch && window.notifManager) {
        window.notifManager.showFinderInfo(notifMatch);
      } else if (window.notifManager) {
        window.notifManager.showToast('No active pending founder reports for this pet.', 'info');
      }
    }
  }

  simulateClaim(impoundId, petName) {
    const modal = document.getElementById('claiming-verification-modal');
    if (modal) {
      modal.dataset.impoundId = impoundId;
      modal.dataset.petName = petName;
      const petNameEl = document.getElementById('claim-doc-pet-name');
      if (petNameEl) petNameEl.textContent = petName;
      modal.classList.add('active');
      if (window.lucide) window.lucide.createIcons({ root: modal });
    } else {
      if (confirm(`Confirm physical redemption and release of pet "${petName}"?`)) {
        window.pawStore.claimImpoundment(impoundId);
        window.notifManager.showToast(`Pet "${petName}" has been successfully claimed and released`, 'success');
      }
    }
  }

  openDirections(address) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  }

  showDigitalTagPass(petId) {
    const pet = window.pawStore.getPetById(petId);
    if (!pet) return;

    const modal = document.getElementById('digital-pass-modal');
    const passBody = document.getElementById('digital-pass-content');

    passBody.innerHTML = `
      <div style="text-align:center; padding:0.5rem 0;">
        <div style="width:84px; height:84px; border-radius:50%; overflow:hidden; margin:0 auto 1rem; border:3px solid var(--primary); box-shadow:var(--shadow-md); cursor:pointer;" onclick="window.pawApp.openLightbox('${pet.photoUrl}', '${(pet.name || 'Pet').replace(/'/g, "\\'")}', '${pet.breed} · ${pet.species}')" title="Click to view full photo">
          <img src="${pet.photoUrl}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80'" />
        </div>
        <h3 style="font-size:1.4rem; margin-bottom:0.25rem;">${pet.name}</h3>
        <div style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1.25rem;">${pet.breed} · ${pet.gender} · ${pet.species}</div>

        <div style="background:var(--bg-surface-elevated); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-glass); margin-bottom:1.25rem; text-align:left;">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <span style="color:var(--text-muted); font-size:0.8rem;">RFID Transponder ID</span>
            <strong style="color:var(--primary); font-family:monospace;">${pet.rfidTag}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <span style="color:var(--text-muted); font-size:0.8rem;">ISO 11784 Microchip</span>
            <strong style="font-family:monospace; font-size:0.8rem;">${pet.microchipNo}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <span style="color:var(--text-muted); font-size:0.8rem;">Registered Guardian</span>
            <strong>${pet.owner.name}</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-muted); font-size:0.8rem;">Emergency Contact</span>
            <strong style="color:var(--primary); font-weight:700;">${pet.owner.phone}</strong>
          </div>
        </div>

        <div style="background:#ffffff; padding:1rem; border-radius:var(--radius-md); display:inline-block; margin-bottom:1rem; box-shadow:var(--shadow-sm);">
          <div style="font-family:monospace; font-weight:900; font-size:1.15rem; color:#180d07; letter-spacing:2px; border:2px dashed #180d07; padding:0.6rem 1.2rem; border-radius:var(--radius-sm);">
            * ${pet.rfidTag} *
          </div>
          <div style="font-size:0.65rem; color:#666; margin-top:0.4rem; text-transform:uppercase;">134.2 kHz FDX-B RFID Encoded</div>
        </div>

        <div style="font-size:0.75rem; color:var(--text-muted); line-height:1.4;">
          Scannable by all Quezon City & Metro Manila Municipal Animal Control Handheld Transponders.
        </div>
      </div>
    `;

    modal.classList.add('active');
    if (window.lucide) window.lucide.createIcons({ root: modal });
  }

  openOwnerGuideModal() {
    const modal = document.getElementById('owner-guide-modal');
    if (modal) {
      this.filterGuidePhase('all');
      modal.classList.add('active');
      if (window.lucide) window.lucide.createIcons({ root: modal });
    }
  }

  filterGuidePhase(phase) {
    const navBtns = document.querySelectorAll('.owner-guide-nav .guide-nav-btn');
    navBtns.forEach(btn => {
      if (btn.dataset.phase === phase) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const sections = {
      before: document.getElementById('guide-phase-before'),
      during: document.getElementById('guide-phase-during'),
      after: document.getElementById('guide-phase-after')
    };

    if (phase === 'all') {
      Object.values(sections).forEach(sec => {
        if (sec) sec.style.display = 'block';
      });
    } else {
      Object.entries(sections).forEach(([key, sec]) => {
        if (sec) {
          sec.style.display = (key === phase) ? 'block' : 'none';
        }
      });
    }
  }
}

window.ownerView = new OwnerView();
