/**
 * PawTrack Municipal Impound & 72-Hour Holding Bay View
 */

class ImpoundedView {
  constructor() {
    this.searchQuery = '';
    this.filterShelter = 'all';
  }

  setFilterShelter(shelterId) {
    this.filterShelter = shelterId;
    const container = document.getElementById('app-viewport');
    if (container) this.render(container);
  }

  handleSearch(e) {
    this.searchQuery = (e.target.value || '').toLowerCase().trim();
    const container = document.getElementById('app-viewport');
    if (container) this.render(container);
  }

  render(container) {
    const t = (k, d) => (window.pawI18n ? window.pawI18n.t(k, d) : d);
    const pets = window.pawStore.getPets();
    const impoundments = window.pawStore.getImpoundments();
    const shelters = window.pawStore.getShelters();

    // Calculate metrics
    const activeImpoundments = impoundments.filter(i => i.status === 'active_impounded' || i.status === 'active');
    const claimedImpoundments = impoundments.filter(i => i.status === 'claimed');

    // Filter by shelter and search
    let filteredList = activeImpoundments;
    if (this.filterShelter !== 'all') {
      filteredList = filteredList.filter(i => i.shelterId === this.filterShelter || i.shelterName?.toLowerCase().includes(this.filterShelter.toLowerCase()));
    }
    if (this.searchQuery) {
      filteredList = filteredList.filter(i => {
        const pet = pets.find(p => p.id === i.petId);
        const name = (pet?.name || i.petName || '').toLowerCase();
        const tag = (i.rfidTag || pet?.rfidTag || '').toLowerCase();
        const shelter = (i.shelterName || '').toLowerCase();
        return name.includes(this.searchQuery) || tag.includes(this.searchQuery) || shelter.includes(this.searchQuery);
      });
    }

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h1>${t('impounded.title', 'Municipal Impound & 72-Hour Holding Bay')}</h1>
          <div class="view-subtitle">
            ${t('impounded.subtitle', 'Real-time municipal animal shelter holding ledger, legal countdown monitor, and pet redemption gateway.')}
          </div>
        </div>
        <div style="display:flex; gap:0.65rem; flex-wrap:wrap;">
          <a href="#shelter" class="btn btn-outline btn-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M9 10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v11H9z"/></svg>
            <span>Shelter Intake Terminal</span>
          </a>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="stats-grid">
        <div class="stat-card glass-card" data-label="Active Impounded Animals" title="Active Impounded Animals">
          <div class="stat-icon" style="background:linear-gradient(135deg, #b85410, #54280e); color:#ffffff;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value" style="color:#ffd085;">${activeImpoundments.length}</div>
            <div class="stat-label">Animals in Holding Bay</div>
          </div>
        </div>

        <div class="stat-card glass-card" data-label="Successfully Redeemed" title="Successfully Redeemed">
          <div class="stat-icon" style="background:linear-gradient(135deg, #16a34a, #14532d); color:#ffffff;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value" style="color:#86efac;">${claimedImpoundments.length}</div>
            <div class="stat-label">Reunited via RFID Verification</div>
          </div>
        </div>

        <div class="stat-card glass-card" data-label="Connected Municipal Pounds" title="Connected Municipal Pounds">
          <div class="stat-icon" style="background:linear-gradient(135deg, #ea9d1e, #b85410); color:#180d07;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M9 10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v11H9z"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value" style="color:#ea9d1e;">${shelters.length}</div>
            <div class="stat-label">NCR Municipal Shelters Active</div>
          </div>
        </div>
      </div>

      <!-- Search & Filter Controls -->
      <div class="glass-card" style="padding:14px 18px; margin-bottom:1.5rem; display:flex; gap:12px; align-items:center; justify-content:space-between; flex-wrap:wrap;">
        <div style="position:relative; flex:1; min-width:240px; max-width:420px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search by pet name, RFID UID, or shelter..." value="${this.searchQuery}" oninput="window.impoundedView.handleSearch(event)" style="width:100%; padding-left:36px; height:38px; border-radius:var(--radius-full); font-size:0.85rem;" />
        </div>

        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="btn btn-sm ${this.filterShelter === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="window.impoundedView.setFilterShelter('all')">
            All Facilities (${activeImpoundments.length})
          </button>
          ${shelters.map(s => `
            <button type="button" class="btn btn-sm ${this.filterShelter === s.id ? 'btn-primary' : 'btn-outline'}" onclick="window.impoundedView.setFilterShelter('${s.id}')">
              ${s.name.split(' ')[0]}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Impounded Animals Cards List -->
      ${filteredList.length === 0 ? `
        <div class="glass-card" style="padding:48px 24px; text-align:center; color:var(--text-muted);">
          <div style="width:56px; height:56px; border-radius:50%; background:rgba(22,163,74,0.12); color:#16a34a; display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          </div>
          <h3 style="font-size:1.15rem; margin-bottom:6px; color:var(--text-main);">No Impounded Animals in Selected Facility</h3>
          <p style="font-size:0.85rem; max-width:420px; margin:0 auto;">All registered pets are currently safe at home or monitored under the municipal RFID grid.</p>
        </div>
      ` : `
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:1.25rem;">
          ${filteredList.map(imp => {
            const pet = pets.find(p => p.id === imp.petId) || { name: imp.petName || 'Unknown Pet', breed: 'Domestic Companion', photoUrl: 'images/sample-pets/max.jpg' };
            const timeData = window.pawStore.getImpoundCountdownData ? window.pawStore.getImpoundCountdownData(imp.id) : null;
            const hoursLeft = timeData ? timeData.hoursLeft : 58;
            const percent = timeData ? timeData.percentElapsed : 20;
            const isUrgent = hoursLeft <= 24;

            return `
              <div class="glass-card" style="padding:20px; border:1px solid ${isUrgent ? 'rgba(239,68,68,0.35)' : 'var(--border-subtle)'}; display:flex; flex-direction:column; gap:14px; position:relative;">
                <div style="display:flex; gap:14px; align-items:flex-start;">
                  <img src="${pet.photoUrl || 'images/sample-pets/max.jpg'}" alt="${pet.name}" style="width:68px; height:68px; border-radius:12px; object-fit:cover; border:2px solid var(--border-subtle);" />
                  <div style="flex:1; min-width:0;">
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
                      <h3 style="margin:0; font-size:1.1rem; font-weight:700; color:var(--text-main);">${pet.name}</h3>
                      <span class="badge badge-impounded" style="font-size:10.5px;">IMPOUNDED</span>
                    </div>
                    <div style="font-size:0.8rem; font-family:var(--font-mono); color:var(--primary); margin:2px 0;">RFID: ${imp.rfidTag}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">${pet.breed || 'Companion Pet'}</div>
                  </div>
                </div>

                <!-- 72-Hour Holding Window Progress -->
                <div style="background:var(--bg-surface-elevated); padding:12px 14px; border-radius:10px; border:1px solid var(--border-subtle);">
                  <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; margin-bottom:6px;">
                    <span style="color:var(--text-muted); font-weight:600;">72-Hour Legal Holding Window:</span>
                    <strong style="color:${isUrgent ? '#ef4444' : '#ffd085'};">${hoursLeft} Hours Remaining</strong>
                  </div>
                  <div style="width:100%; height:8px; background:rgba(255,255,255,0.08); border-radius:99px; overflow:hidden;">
                    <div style="width:${percent}%; height:100%; background:${isUrgent ? '#ef4444' : 'var(--primary)'}; border-radius:99px; transition:width 0.3s ease;"></div>
                  </div>
                </div>

                <!-- Intake Details -->
                <div style="font-size:0.82rem; line-height:1.6; color:var(--text-muted);">
                  <div><strong>Facility:</strong> ${imp.shelterName || 'Quezon City Animal Care Facility'}</div>
                  <div><strong>Holding Bay:</strong> Kennel #${imp.cageNumber || 'B-04'}</div>
                  <div><strong>Intake Officer:</strong> ${imp.intakeOfficer || 'Dr. Fernando Gomez, DVM'}</div>
                  <div><strong>Daily Pound Fee:</strong> PHP 500 / day</div>
                </div>

                <!-- Action Buttons -->
                <div style="display:flex; gap:8px; margin-top:auto; pt:4px;">
                  <button type="button" class="btn btn-primary btn-sm" style="flex:1;" onclick="window.ownerView ? window.ownerView.simulateClaim('${imp.id}', '${pet.name}') : null">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                    <span>Redeem &amp; Claim</span>
                  </button>
                  <a href="#map" class="btn btn-outline btn-sm" onclick="window.publicView ? window.publicView.focusPetOnMap('${pet.id}') : null" title="View Facility on Map">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
                  </a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}

      <!-- Participating Municipal Pounds Directory -->
      <div style="margin-top:2.5rem;">
        <h2 style="font-size:1.25rem; margin-bottom:1rem;">NCR Municipal Pound Facilities</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:1rem;">
          ${shelters.map(s => `
            <div class="glass-card" style="padding:16px 18px; border-radius:12px;">
              <h4 style="margin:0 0 4px; font-size:1rem; color:var(--text-main);">${s.name}</h4>
              <p style="font-size:0.8rem; color:var(--text-muted); margin:0 0 10px; line-height:1.4;">${s.address}</p>
              <div style="font-size:0.78rem; color:var(--text-muted); line-height:1.6;">
                <div><strong>Phone:</strong> ${s.phone}</div>
                <div><strong>Hours:</strong> ${s.hours}</div>
                <div><strong>Capacity:</strong> ${s.capacity} Kennels (${s.holdingPeriodDays}-Day Holding Window)</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }
}

window.impoundedView = new ImpoundedView();
