/**
 * PawTrack Pet Recovery Case System & Municipal Analytics Dashboard View
 */

class CasesView {
  constructor() {
    this.currentCaseFilter = 'all';
    this.searchQuery = '';
    this.analyticsOpen = false;
  }

  render(container) {
    const analytics = window.pawStore.getAnalyticsSummary();
    const hotspots = window.pawStore.getHotspotAreas();
    const cases = window.pawStore.getCases();
    const pets = window.pawStore.getPets();

    // Auto-generate initial cases if none exist
    if (cases.length === 0 && pets.length > 0) {
      pets.forEach((pet, index) => {
        let status = pet.status === 'lost' ? 'missing' : pet.status === 'impounded' ? 'impounded' : pet.status === 'reunited' ? 'reunited' : 'safe';
        if (status !== 'safe') {
          const sampleCase = {
            id: 'CASE-2026-' + String(index + 1).padStart(4, '0'),
            petId: pet.id,
            petName: pet.name,
            rfidTag: pet.rfidTag,
            status: status,
            createdAt: pet.lastSeenDate || new Date(Date.now() - (index + 1) * 3600000 * 8).toISOString(),
            lastUpdated: new Date().toISOString(),
            timeline: [
              {
                timestamp: pet.lastSeenDate || new Date(Date.now() - 3600000 * 6).toISOString(),
                type: status,
                title: status === 'missing' ? 'Missing Alert Broadcast Activated' : 'Initial Incident Logged',
                location: pet.lastSeenLocation || 'Quezon City, Metro Manila',
                notes: 'Incident recorded in national municipal registry.'
              }
            ]
          };
          window.pawStore.saveCase(sampleCase);
        }
      });
    }

    const currentCases = window.pawStore.getCases();
    const t = (k, d) => (window.pawI18n ? window.pawI18n.t(k, d) : d);
    const countBy = status => currentCases.filter(c => c.status === status).length;
    const openCount = currentCases.filter(c => c.status === 'missing' || c.status === 'sighted').length;

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h1>${t('cases.title', 'Cases & Analytics')}</h1>
          <div class="view-subtitle">
            ${t('cases.subtitle', 'Follow every lost-pet case from first report to reunion.')}
          </div>
        </div>
        <div style="display:flex; gap:0.65rem; flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm" onclick="window.publicView.openFoundPetModal()">
            <i data-lucide="eye"></i> ${t('cases.reportSightingBtn', 'Report Community Sighting')}
          </button>
        </div>
      </div>

      <!-- Compact Summary Strip (each stat filters the case list) -->
      <div class="owner-summary glass-card">
        <div class="owner-summary-status ${openCount > 0 ? 'is-alert' : ''}">
          <span class="owner-summary-dot"></span>
          <div>
            <div class="owner-summary-title">${openCount > 0
              ? `${openCount} open case${openCount === 1 ? ' needs' : 's need'} follow-up`
              : 'No open cases'}</div>
            <div class="owner-summary-sub">${t('cases.statRecoveryRate', 'Reunification Rate')}: <strong>${analytics.recoveryRate}%</strong></div>
          </div>
        </div>
        <div class="owner-summary-stats">
          <button type="button" class="owner-summary-stat ${analytics.missingCount > 0 ? 'is-alert' : ''}" onclick="window.casesView.setFilter('missing')" title="${t('cases.statMissing', 'Active Missing')}">
            <span class="owner-summary-value">${analytics.missingCount}</span>
            <span class="owner-summary-label">${t('cases.filterMissing', 'Missing')}</span>
          </button>
          <button type="button" class="owner-summary-stat" onclick="window.casesView.setFilter('sighted')" title="${t('cases.statSighted', 'Community Sightings')}">
            <span class="owner-summary-value">${analytics.sightedCount}</span>
            <span class="owner-summary-label">${t('cases.filterSighted', 'Sighted')}</span>
          </button>
          <button type="button" class="owner-summary-stat" onclick="window.casesView.setFilter('impounded')" title="${t('cases.statImpounded', 'Facility Impounds')}">
            <span class="owner-summary-value">${analytics.impoundedCount}</span>
            <span class="owner-summary-label">${t('cases.filterImpounded', 'Impounded')}</span>
          </button>
          <button type="button" class="owner-summary-stat" onclick="window.casesView.setFilter('reunited')" title="${t('cases.statReunited', 'Safely Reunited')}">
            <span class="owner-summary-value">${analytics.reunitedCount}</span>
            <span class="owner-summary-label">${t('cases.filterReunited', 'Reunited')}</span>
          </button>
        </div>
      </div>

      <!-- Recovery Cases Master Ledger -->
      <div id="cases-ledger-section" style="margin-bottom:2rem;">
        <div class="home-section-header">
          <div>
            <h2>${t('cases.ledgerTitle', 'Pet Recovery Case Files')} (${currentCases.length})</h2>
            <div class="home-section-sub">${t('cases.ledgerSubtitle', 'Open a case to see its full timeline and evidence photos.')}</div>
          </div>
        </div>

        <div class="ux-section-tools">
          <input type="text" id="cases-search-input" placeholder="Search by pet name, case ID, or RFID…" value="${this.searchQuery.replace(/"/g, '&quot;')}" oninput="window.casesView.handleSearch(this.value)" autocomplete="off" />
          <div class="home-filter-chips">
            ${[
              ['all', t('cases.filterAll', 'All'), currentCases.length],
              ['missing', t('cases.filterMissing', 'Missing'), countBy('missing')],
              ['sighted', t('cases.filterSighted', 'Sighted'), countBy('sighted')],
              ['impounded', t('cases.filterImpounded', 'Impounded'), countBy('impounded')],
              ['reunited', t('cases.filterReunited', 'Reunited'), countBy('reunited')]
            ].map(([key, label, count]) => `
              <button type="button" class="btn btn-sm ${this.currentCaseFilter === key ? 'btn-primary active' : 'btn-outline'}" onclick="window.casesView.setFilter('${key}')">
                ${label} (${count})
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Cases Cards Grid -->
        <div id="cases-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap:1.25rem;">
          ${this.renderCasesList(currentCases)}
        </div>
      </div>

      <!-- Hotspot Analytics (secondary, collapsed by default) -->
      <details class="ux-collapsible glass-card" ${this.analyticsOpen ? 'open' : ''} ontoggle="window.casesView.analyticsOpen = this.open">
        <summary>
          <span class="ux-collapsible-title">
            <i data-lucide="map-pin" style="color:var(--primary); width:18px; height:18px;"></i>
            ${t('cases.hotspotTitle', 'Incident Hotspots & Metrics')}
          </span>
          <span style="display:flex; align-items:center; gap:0.5rem;">
            <span class="ux-collapsible-hint">${hotspots.length} areas</span>
            <i data-lucide="chevron-down" class="ux-collapsible-chevron"></i>
          </span>
        </summary>
        <div class="ux-collapsible-body">
          <p style="font-size:0.825rem; color:var(--text-muted); line-height:1.4; margin-bottom:1rem;">
            ${t('cases.hotspotSubtitle', 'Areas with the most stray sightings or missing pet reports, to help plan patrols.')}
          </p>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:0.75rem;">
            ${hotspots.map(h => `
              <div style="background:var(--bg-surface-elevated); padding:12px 14px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:6px;">
                  <span style="font-weight:600; color:var(--text-main);">${h.name}</span>
                  <span style="font-weight:700; color:var(--primary);">${h.count} ${t('cases.incidents', 'Incidents')}</span>
                </div>
                <div style="width:100%; height:8px; background:var(--bg-surface); border-radius:99px; overflow:hidden; border:1px solid var(--border-subtle);">
                  <div style="width:${h.percent}%; height:100%; background:linear-gradient(90deg, #ea9d1e, #ba3820); border-radius:99px;"></div>
                </div>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:1rem; padding-top:0.85rem; border-top:1px solid var(--border-subtle); display:flex; gap:1.5rem; font-size:0.8rem; color:var(--text-muted); flex-wrap:wrap;">
            <span>${t('cases.avgResolution', 'Avg. Case Resolution:')} <strong>${analytics.avgRecoveryHours}</strong></span>
            <span>${t('cases.rfidAdoption', 'RFID Transponder Adoption:')} <strong>${analytics.rfidScanAdoption}</strong></span>
          </div>
        </div>
      </details>
    `;

    if (window.lucide) window.lucide.createIcons({ root: container });
  }

  renderCasesList(cases) {
    const t = (k, d) => (window.pawI18n ? window.pawI18n.t(k, d) : d);
    const pets = window.pawStore.getPets();
    const q = this.searchQuery.trim().toLowerCase();
    let filtered = cases.filter(c => {
      if (this.currentCaseFilter !== 'all' && c.status !== this.currentCaseFilter) return false;
      if (!q) return true;
      return [c.petName, c.id, c.rfidTag].some(v => (v || '').toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      return `
        <div class="glass-card" style="grid-column: 1 / -1; padding: 2.5rem 1.5rem; text-align:center; color:var(--text-muted);">
          <i data-lucide="folder-check" style="width:44px; height:44px; margin-bottom:0.75rem; opacity:0.4;"></i>
          <h4 style="font-size:1.1rem; margin-bottom:0.25rem; color:var(--text-main);">${t('cases.emptyTitle', 'No Cases in this Status Category')}</h4>
          <p style="font-size:0.85rem;">${t('cases.emptyDesc', 'All registered recovery cases are updated in real-time across owner and municipal nodes.')}</p>
        </div>
      `;
    }

    return filtered.map(c => {
      const pet = pets.find(p => p.id === c.petId) || { name: c.petName || 'Pet', breed: 'Domestic', photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80', rfidTag: c.rfidTag || 'RFID-TAG' };

      let badgeBg = '#ba3820';
      let badgeText = `${t('cases.filterMissing', 'Missing')}`;
      if (c.status === 'sighted') { badgeBg = '#ea9d1e'; badgeText = `${t('cases.filterSighted', 'Sighted')}`; }
      if (c.status === 'impounded') { badgeBg = '#b85410'; badgeText = `${t('cases.filterImpounded', 'Impounded')}`; }
      if (c.status === 'reunited' || c.status === 'safe') { badgeBg = '#16a34a'; badgeText = `${t('cases.filterReunited', 'Reunited')}`; }

      const timelineCount = (c.timeline || []).length;
      const latestEvent = (c.timeline && c.timeline[0]) ? c.timeline[0] : { title: 'Case Opened', location: 'Metro Manila', timestamp: c.createdAt };

      return `
        <div class="glass-card" style="padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:1rem; border-top:3px solid ${badgeBg};">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
              <div>
                <span style="font-family:monospace; font-weight:800; font-size:0.75rem; color:var(--primary);">${c.id}</span>
                <h3 style="font-size:1.15rem; margin-top:2px; font-weight:700;">${pet.name}</h3>
                <div style="font-size:0.78rem; color:var(--text-muted);">${pet.breed} · ${pet.rfidTag || 'Collar Tagged'}</div>
              </div>
              <span class="badge" style="background:${badgeBg}22; color:${badgeBg}; border:1px solid ${badgeBg}66; font-size:0.7rem;">
                ${badgeText}
              </span>
            </div>

            <!-- Latest Timeline Stepper Preview -->
            <div style="background:var(--bg-surface-elevated); padding:10px 12px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); margin-bottom:0.5rem; font-size:0.8rem;">
              <div style="display:flex; justify-content:space-between; color:var(--text-muted); font-size:0.7rem; margin-bottom:3px;">
                <span>${t('cases.latestActivity', 'Latest Activity')}</span>
                <span>${new Date(latestEvent.timestamp).toLocaleDateString()}</span>
              </div>
              <div style="font-weight:600; color:var(--text-main); margin-bottom:2px;">${latestEvent.title}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);"><i data-lucide="map-pin" style="width:11px; height:11px; display:inline;"></i> ${latestEvent.location}</div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; padding-top:0.75rem; border-top:1px solid var(--border-subtle);">
            <span style="font-size:0.75rem; color:var(--text-muted);">${timelineCount} ${t('cases.auditLogs', 'Audit Log')}${timelineCount === 1 ? '' : 's'}</span>
            <button class="btn btn-outline btn-sm" onclick="window.casesView.openCaseDossier('${c.id}')">
              <i data-lucide="file-text"></i> ${t('cases.openDossierBtn', 'Open Dossier')}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  setFilter(filter) {
    this.currentCaseFilter = filter;
    const container = document.getElementById('app-viewport');
    if (container) this.render(container);
  }

  // Refresh only the grid so the search box keeps focus while typing
  handleSearch(value) {
    this.searchQuery = value || '';
    const grid = document.getElementById('cases-grid');
    if (!grid) return;
    grid.innerHTML = this.renderCasesList(window.pawStore.getCases());
    if (window.lucide) window.lucide.createIcons({ root: grid });
  }

  openCaseDossier(caseId) {
    const t = (k, d) => (window.pawI18n ? window.pawI18n.t(k, d) : d);
    const cases = window.pawStore.getCases();
    const petCase = cases.find(c => c.id === caseId || c.petId === caseId);
    if (!petCase) return;

    const pet = window.pawStore.getPetById(petCase.petId) || { name: petCase.petName || 'Pet', breed: 'Domestic', photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80', rfidTag: petCase.rfidTag || 'RFID-TAG', owner: { name: 'Verified Guardian', phone: '+63 917 555 3829' } };

    const modal = document.getElementById('case-dossier-modal');
    const content = document.getElementById('case-dossier-content');
    if (!modal || !content) return;

    let badgeBg = '#ba3820';
    let badgeText = t('cases.dossierActiveMissing', 'ACTIVE MISSING');
    if (petCase.status === 'sighted') { badgeBg = '#ea9d1e'; badgeText = t('cases.dossierSighted', 'SIGHTING VERIFIED'); }
    if (petCase.status === 'impounded') { badgeBg = '#b85410'; badgeText = t('cases.dossierImpounded', 'IN SHELTER HOLDING'); }
    if (petCase.status === 'reunited' || petCase.status === 'safe') { badgeBg = '#16a34a'; badgeText = t('cases.dossierReunited', 'SAFELY REUNITED'); }

    content.innerHTML = `
      <div style="margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-subtle); padding-bottom:1rem;">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <img src="${pet.photoUrl || window.PET_PHOTO_PLACEHOLDER}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid ${badgeBg};" onerror="this.src='https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80'" />
          <div>
            <h3 style="font-size:1.25rem; margin:0;">${pet.name}</h3>
            <div style="font-size:0.8rem; color:var(--text-muted);">${pet.breed} · Case ${petCase.id}</div>
          </div>
        </div>
        <span class="badge" style="background:${badgeBg}22; color:${badgeBg}; border:1px solid ${badgeBg}66; font-size:0.75rem; padding:4px 10px;">
          ${badgeText}
        </span>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1.5rem; font-size:0.82rem;">
        <div style="background:var(--bg-surface-elevated); padding:10px; border-radius:var(--radius-sm);">
          <span style="color:var(--text-muted); font-size:0.72rem;">${t('cases.dossierRfidUid', 'RFID UID:')}</span>
          <strong style="display:block; font-family:monospace; color:var(--primary);">${pet.rfidTag || 'N/A'}</strong>
        </div>
        <div style="background:var(--bg-surface-elevated); padding:10px; border-radius:var(--radius-sm);">
          <span style="color:var(--text-muted); font-size:0.72rem;">${t('cases.dossierGuardianContact', 'Guardian Contact:')}</span>
          <strong style="display:block;">${pet.owner ? pet.owner.phone : '+63 917 555 3829'}</strong>
        </div>
      </div>

      <h4 style="font-size:0.95rem; margin-bottom:0.85rem; display:flex; align-items:center; gap:0.4rem;">
        <i data-lucide="history" style="width:16px; height:16px; color:var(--primary);"></i> ${t('cases.dossierTimelineTitle', 'Case Audit Trail & Recovery Stepper')}
      </h4>

      <div class="case-timeline-stepper">
        ${(petCase.timeline || []).map((tItem, idx) => `
          <div class="case-timeline-item">
            <div class="case-timeline-dot ${idx === 0 ? 'active' : ''}"></div>
            <div class="case-timeline-content">
              <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--text-muted); margin-bottom:2px;">
                <span>${tItem.type.toUpperCase()}</span>
                <span>${new Date(tItem.timestamp).toLocaleString()}</span>
              </div>
              <div style="font-weight:700; font-size:0.88rem; color:var(--text-main); margin-bottom:3px;">${tItem.title}</div>
              <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:4px;">Location: ${tItem.location}</div>
              ${tItem.notes ? `<div style="font-size:0.78rem; background:var(--bg-surface); padding:6px 10px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">${tItem.notes}</div>` : ''}
              ${tItem.photoUrl ? `<img src="${tItem.photoUrl}" style="margin-top:6px; max-height:100px; border-radius:var(--radius-sm); object-fit:cover; border:1px solid var(--border-subtle);" />` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    modal.classList.add('active');
    if (window.lucide) window.lucide.createIcons({ root: modal });
  }

  openAiMatchingTester() {
    const modal = document.getElementById('ai-match-modal');
    if (!modal) return;

    const pets = window.pawStore.getPets();
    const missingPet = pets.find(p => p.status === 'lost') || pets[0] || { name: 'Max', breed: 'Golden Retriever', color: 'Golden brown with white chest patch', photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80' };

    // Simulate Sighting
    const testSighting = {
      species: 'Dog',
      breed: 'Golden Retriever Mix',
      color: 'Golden brown with white chest patch',
      comments: 'Friendly golden dog seen roaming near Scout Gandia street corner, wearing brown collar with tag.',
      location: 'Near Scout Gandia & Tomas Morato, QC',
      lat: 14.6360,
      lng: 121.0370,
      dateTimeSeen: new Date().toISOString(),
      photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80'
    };

    const matches = window.pawStore.runAiPetMatch(testSighting, pets);
    const topMatch = matches[0] || { pet: missingPet, confidenceScore: 94, distanceKm: '1.2 km', traitBreakdown: { color: 96, breed: 92, markings: 90, proximity: 95, recency: 98, species: 100 } };

    const content = document.getElementById('ai-match-modal-content');
    if (content) {
      content.innerHTML = `
        <div style="text-align:center; margin-bottom:1.25rem;">
          <div style="display:inline-flex; align-items:center; gap:0.5rem; background:rgba(234, 157, 30, 0.16); color:#ea9d1e; border:1px solid rgba(234, 157, 30, 0.35); padding:4px 14px; border-radius:99px; font-weight:800; font-size:0.85rem; margin-bottom:0.75rem;">
            <span>AI Match Confidence:</span>
            <strong style="font-size:1.1rem;">${topMatch.confidenceScore}%</strong>
          </div>
          <p style="font-size:0.82rem; color:var(--text-muted); max-width:440px; margin:0 auto;">
            SkinWise-style multi-trait comparison computed a high-probability correlation between the community sighting and registered pet <strong>${topMatch.pet.name}</strong>.
          </p>
        </div>

        <!-- Side-by-Side Comparison -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.85rem; margin-bottom:1.5rem;">
          <div style="background:var(--bg-surface-elevated); padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-glass); text-align:center;">
            <div style="font-size:0.72rem; text-transform:uppercase; font-weight:700; color:var(--text-muted); margin-bottom:6px;">Community Sighting Photo</div>
            <img src="${testSighting.photoUrl || window.PET_PHOTO_PLACEHOLDER}" style="width:100%; height:130px; object-fit:cover; border-radius:var(--radius-sm);" />
            <div style="font-size:0.75rem; color:var(--text-main); font-weight:600; margin-top:6px;">Spotted in Quezon City</div>
          </div>

          <div style="background:var(--bg-surface-elevated); padding:10px; border-radius:var(--radius-md); border:1px solid var(--border-glass); text-align:center;">
            <div style="font-size:0.72rem; text-transform:uppercase; font-weight:700; color:var(--primary); margin-bottom:6px;">Registered Missing Pet: ${topMatch.pet.name}</div>
            <img src="${topMatch.pet.photoUrl || window.PET_PHOTO_PLACEHOLDER}" style="width:100%; height:130px; object-fit:cover; border-radius:var(--radius-sm);" />
            <div style="font-size:0.75rem; color:var(--text-main); font-weight:600; margin-top:6px;">RFID: ${topMatch.pet.rfidTag || 'Protected'}</div>
          </div>
        </div>

        <!-- Trait Breakdown Meters -->
        <div style="display:flex; flex-direction:column; gap:0.6rem; font-size:0.8rem; margin-bottom:1.25rem;">
          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
              <span>Coat Color & Pattern Match</span>
              <strong>${topMatch.traitBreakdown.color}%</strong>
            </div>
            <div style="height:6px; background:var(--bg-surface-elevated); border-radius:99px; overflow:hidden;">
              <div style="width:${topMatch.traitBreakdown.color}%; height:100%; background:#ea9d1e; border-radius:99px;"></div>
            </div>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
              <span>Breed Silhouette & Facial Anatomy</span>
              <strong>${topMatch.traitBreakdown.breed}%</strong>
            </div>
            <div style="height:6px; background:var(--bg-surface-elevated); border-radius:99px; overflow:hidden;">
              <div style="width:${topMatch.traitBreakdown.breed}%; height:100%; background:#b85410; border-radius:99px;"></div>
            </div>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
              <span>Location Proximity (${topMatch.distanceKm})</span>
              <strong>${topMatch.traitBreakdown.proximity}%</strong>
            </div>
            <div style="height:6px; background:var(--bg-surface-elevated); border-radius:99px; overflow:hidden;">
              <div style="width:${topMatch.traitBreakdown.proximity}%; height:100%; background:#16a34a; border-radius:99px;"></div>
            </div>
          </div>
        </div>

        <div style="display:flex; gap:0.65rem;">
          <button type="button" class="btn btn-outline" style="flex:1;" onclick="window.notifManager.closeModal('ai-match-modal')">Close</button>
          <button type="button" class="btn btn-primary" style="flex:1.5;" onclick="window.notifManager.closeModal('ai-match-modal'); window.notifManager.showToast('Match confirmed. Incident alert dispatched to guardian.', 'success');">Confirm & Alert Owner</button>
        </div>
      `;
    }

    modal.classList.add('active');
    if (window.lucide) window.lucide.createIcons({ root: modal });
  }
}

window.casesView = new CasesView();
