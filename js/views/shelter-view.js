/**
 * PawTrack Animal Control & Shelter Staff Terminal View
 */

class ShelterView {
  constructor() {
    this.currentScannedResult = null;
    this.ledgerFilter = 'holding';
    this.setupScanListeners();
  }

  setupScanListeners() {
    document.addEventListener('pawtrack:scan-start', () => {
      const disk = document.querySelector('.scanner-radar-disk');
      if (disk) disk.style.borderColor = 'var(--primary)';
    });

    document.addEventListener('pawtrack:scan-success', (e) => {
      this.currentScannedResult = e.detail;
      this.renderScanResult();
    });

    document.addEventListener('pawtrack:scan-unregistered', (e) => {
      this.currentScannedResult = e.detail;
      this.renderScanResult();
    });
  }

  render(container) {
    const t = (k, d) => (window.pawI18n ? window.pawI18n.t(k, d) : d);
    const pets = window.pawStore.getPets();
    const impoundments = window.pawStore.getImpoundments();
    const holding = impoundments.filter(i => i.status === 'active_impounded');
    const activeCount = holding.length;
    const claimedCount = impoundments.filter(i => i.status === 'claimed').length;
    const overdueCount = holding.filter(i => Date.now() > new Date(i.claimDeadline).getTime()).length;

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h1>${t('shelter.title', 'Shelter Intake Terminal')}</h1>
          <div class="view-subtitle">${t('shelter.subtitle', 'Scan a collar tag to look up the owner, log the intake, and alert them by SMS.')}</div>
        </div>
      </div>

      <!-- Compact Summary Strip -->
      <div class="owner-summary glass-card">
        <div class="owner-summary-status ${overdueCount > 0 ? 'is-alert' : ''}">
          <span class="owner-summary-dot"></span>
          <div>
            <div class="owner-summary-title">${overdueCount > 0
              ? `${overdueCount} past the 72h holding window`
              : 'Reader online'}</div>
            <div class="owner-summary-sub">USB / NFC reader ready · 13.56 MHz &amp; 125 kHz</div>
          </div>
        </div>
        <div class="owner-summary-stats">
          <button type="button" class="owner-summary-stat" onclick="window.shelterView.setLedgerFilter('holding', true)" title="Animals in Holding Bay">
            <span class="owner-summary-value">${activeCount}</span>
            <span class="owner-summary-label">In holding</span>
          </button>
          <button type="button" class="owner-summary-stat ${overdueCount > 0 ? 'is-alert' : ''}" onclick="window.shelterView.setLedgerFilter('holding', true)" title="Holding window expired">
            <span class="owner-summary-value">${overdueCount}</span>
            <span class="owner-summary-label">Overdue</span>
          </button>
          <button type="button" class="owner-summary-stat" onclick="window.shelterView.setLedgerFilter('released', true)" title="Reunited with Owners">
            <span class="owner-summary-value">${claimedCount}</span>
            <span class="owner-summary-label">Released</span>
          </button>
        </div>
      </div>

      <!-- Scanner HUD and Result Screen -->
      <div class="scanner-hud-container">
        <!-- Left: NFC Reader Interface -->
        <div class="scanner-box glass-card">
          <div class="scanner-radar-disk" onclick="window.shelterView.triggerDemoScan('NFC-882194')" title="Click or scan NFC Tag">
            <div class="scanner-pulse-wave"></div>
            <div class="scanner-pulse-wave"></div>
            <div class="nfc-core-chip">
              <i data-lucide="radio" style="width:36px; height:36px;"></i>
            </div>
          </div>

          <h3 style="margin-bottom:0.35rem; font-size:1.2rem;">Hold Tag Near Reader</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); max-width:320px; margin-bottom:1.25rem;">
            Or type the NFC / microchip number below.
          </p>

          <form id="nfc-manual-form" onsubmit="window.shelterView.handleManualScan(event)" style="display:flex; gap:0.5rem; width:100%; max-width:380px; flex-wrap:wrap;">
            <input type="text" id="nfc-manual-input" placeholder="NFC UID or microchip no." autocomplete="off" style="flex:1; min-width:180px;" />
            <button type="submit" class="btn btn-primary btn-sm" style="white-space:nowrap;">
              <i data-lucide="search"></i> Look Up
            </button>
          </form>

          <!-- Sample tags for testing (collapsed by default) -->
          <details class="ux-collapsible is-plain" style="width:100%; max-width:380px; margin:1rem 0 0;">
            <summary>
              <span class="ux-collapsible-hint">Test with a sample tag (${pets.length + 1})</span>
              <i data-lucide="chevron-down" class="ux-collapsible-chevron"></i>
            </summary>
            <div class="ux-collapsible-body">
              <div class="demo-tags-list">
                ${pets.map(p => `
                  <button class="demo-tag-chip" onclick="window.shelterView.triggerDemoScan('${p.nfcTag}')">
                    ${p.name} · ${p.nfcTag}
                  </button>
                `).join('')}
                <button class="demo-tag-chip" onclick="window.shelterView.triggerDemoScan('NFC-999000')">
                  Unregistered stray · NFC-999000
                </button>
              </div>
            </div>
          </details>
        </div>

        <!-- Right: Scan Result & Intake Action Box -->
        <div class="glass-card scan-result-card" id="scan-result-card">
          ${this.renderInitialScanPrompt()}
        </div>
      </div>

      <!-- Impoundment Records Ledger -->
      <div id="shelter-ledger-section" style="margin-top:2.5rem;">
        <div class="home-section-header">
          <div>
            <h2>Impound Ledger</h2>
            <div class="home-section-sub">Animals logged at your facilities and their claim status.</div>
          </div>
          <div class="home-filter-chips" id="shelter-ledger-filters">
            ${this.renderLedgerFilters(impoundments)}
          </div>
        </div>

        <div class="table-container glass-card" id="shelter-ledger-table">
          ${this.renderLedgerTable(impoundments)}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons({ root: container });

    // Keep an in-progress scan visible across re-renders
    if (this.currentScannedResult) this.renderScanResult();
  }

  renderLedgerFilters(impoundments) {
    const counts = {
      holding: impoundments.filter(i => i.status === 'active_impounded').length,
      released: impoundments.filter(i => i.status !== 'active_impounded').length,
      all: impoundments.length
    };
    const labels = { holding: 'In holding', released: 'Released', all: 'All' };
    return Object.keys(labels).map(key => `
      <button type="button" class="btn btn-sm ${this.ledgerFilter === key ? 'btn-primary' : 'btn-outline'}" onclick="window.shelterView.setLedgerFilter('${key}')">
        ${labels[key]} (${counts[key]})
      </button>
    `).join('');
  }

  renderLedgerTable(impoundments) {
    const rows = impoundments.filter(imp => {
      if (this.ledgerFilter === 'holding') return imp.status === 'active_impounded';
      if (this.ledgerFilter === 'released') return imp.status !== 'active_impounded';
      return true;
    });

    if (rows.length === 0) {
      return `
        <div style="padding:2.5rem 1.5rem; text-align:center; color:var(--text-muted); font-size:0.875rem;">
          ${this.ledgerFilter === 'holding' ? 'No animals are currently in holding.' : 'No records in this view yet.'}
        </div>
      `;
    }

    return `
      <table class="ledger-table">
        <thead>
          <tr>
            <th>Pet</th>
            <th>Facility</th>
            <th>Intake</th>
            <th>Guardian</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(imp => this.renderLedgerRow(imp)).join('')}
        </tbody>
      </table>
    `;
  }

  setLedgerFilter(filter, scroll = false) {
    this.ledgerFilter = filter;
    const impoundments = window.pawStore.getImpoundments();
    const filters = document.getElementById('shelter-ledger-filters');
    const table = document.getElementById('shelter-ledger-table');
    if (filters) filters.innerHTML = this.renderLedgerFilters(impoundments);
    if (table) {
      table.innerHTML = this.renderLedgerTable(impoundments);
      if (window.lucide) window.lucide.createIcons({ root: table });
    }
    if (scroll) document.getElementById('shelter-ledger-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  renderInitialScanPrompt() {
    return `
      <div class="scan-idle-state">
        <i data-lucide="scan-line"></i>
        <h3>Awaiting NFC Reader Signal</h3>
        <p style="font-size:0.875rem; max-width:340px; margin-top:0.5rem;">
          Hold an NFC collar tag to the scanner or select a test tag to view registry data and trigger notifications.
        </p>
      </div>
    `;
  }

  renderScanResult() {
    const card = document.getElementById('scan-result-card');
    if (!card) return;

    if (!this.currentScannedResult) {
      card.innerHTML = this.renderInitialScanPrompt();
      if (window.lucide) window.lucide.createIcons({ root: card });
      return;
    }

    const { nfcTag, pet, registered } = this.currentScannedResult;

    if (!registered || !pet) {
      card.innerHTML = `
        <div style="border-left:4px solid var(--danger); padding-left:1rem; margin-bottom:1.5rem;">
          <div style="font-size:0.8rem; text-transform:uppercase; color:var(--danger); font-weight:700;">Interrogation Result: Unregistered Transponder</div>
          <h3 style="font-size:1.35rem; margin-top:0.25rem;">UID: <code>${nfcTag}</code></h3>
          <p style="color:var(--text-muted); font-size:0.875rem; margin-top:0.25rem;">
            This NFC tag is not yet linked to any pet record in the national database.
          </p>
        </div>

        <div style="background:var(--bg-surface-elevated); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1.5rem;">
          <h4 style="font-size:0.95rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
            <i data-lucide="info"></i> Intake Protocol for Unidentified Animals
          </h4>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">
            Log this animal under the temporary shelter intake ledger or assign this UID to an existing pet record.
          </p>
          <button class="btn btn-primary btn-sm" onclick="window.ownerView.openRegisterModal('${nfcTag}')">
            <i data-lucide="plus"></i> Register Pet with UID: ${nfcTag}
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons({ root: card });
      return;
    }

    const shelters = window.pawStore.getShelters();

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.25rem; border-bottom:1px solid var(--border-subtle); padding-bottom:1rem;">
        <div style="display:flex; gap:1rem; align-items:center;">
          <img src="${pet.photoUrl || window.PET_PHOTO_PLACEHOLDER}" style="width:64px; height:64px; border-radius:var(--radius-md); object-fit:cover; border:2px solid var(--primary);" />
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h3 style="font-size:1.35rem; font-weight:800;">${pet.name}</h3>
              <span class="badge badge-safe">Verified Match</span>
            </div>
            <div style="font-size:0.825rem; color:var(--text-muted);">${pet.breed} • ${pet.gender} • UID: <strong style="color:var(--primary);">${pet.nfcTag}</strong></div>
          </div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="window.shelterView.clearScan()">Reset</button>
      </div>

      <!-- Owner Info Box -->
      <div style="background:var(--bg-surface-elevated); padding:1rem; border-radius:var(--radius-md); margin-bottom:1.25rem; border-left:3px solid var(--primary);">
        <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700; margin-bottom:0.25rem;">Verified Guardian Information</div>
        <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="font-weight:700; font-size:0.95rem;">${pet.owner.name}</div>
            <div style="font-size:0.825rem; color:var(--text-muted);">${pet.owner.address}</div>
          </div>
          <div>
            <div style="color:var(--primary); font-weight:700; font-size:0.95rem;">Contact: ${pet.owner.phone}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">${pet.owner.email}</div>
          </div>
        </div>
      </div>

      <!-- Fast Intake Form -->
      <form id="intake-form" onsubmit="window.shelterView.submitIntake(event, '${pet.id}')">
        <h4 style="font-size:0.95rem; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem;">
          <i data-lucide="file-text"></i> Log Facility Intake & Dispatch Alerts
        </h4>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Receiving Facility</label>
            <select id="intake-shelter-id" required>
              ${shelters.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Kennel / Bay ID</label>
            <input type="text" id="intake-cage-num" value="Kennel Bay B-12" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Impoundment / Retrieval Location</label>
            <input type="text" id="intake-location" value="Tomas Morato Ave cor. Scout Gandia" required />
          </div>
          <div class="form-group">
            <label class="form-label">Intake Officer ID</label>
            <input type="text" id="intake-officer" value="Officer Rafael Garcia (ACO-412)" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Physical Assessment & Health Observations</label>
          <input type="text" id="intake-health" value="Active, healthy, scanned collar NFC tag verified." required />
        </div>

        <div style="display:flex; gap:0.75rem; margin-top:1rem;">
          <button type="submit" class="btn btn-danger" style="flex:1;">
            <i data-lucide="bell-ring"></i> Record Impound & Dispatch SMS Alert
          </button>
        </div>
      </form>
    `;

    if (window.lucide) window.lucide.createIcons({ root: card });
  }

  renderLedgerRow(imp) {
    const isHolding = imp.status === 'active_impounded';
    const deadline = new Date(imp.claimDeadline);
    const isExpired = Date.now() > deadline.getTime();
    const owner = imp.petId ? window.pawStore.getPetById(imp.petId)?.owner : null;

    return `
      <tr>
        <td>
          <div style="font-weight:700;">${imp.petName}</div>
          <div style="font-size:0.75rem; color:var(--primary); font-family:monospace;">${imp.nfcTag}</div>
        </td>
        <td>
          <div style="font-weight:600; font-size:0.85rem;">${imp.shelterName}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${imp.cageNumber}</div>
        </td>
        <td>
          <div style="font-size:0.85rem;">${new Date(imp.intakeDate).toLocaleDateString()} ${new Date(imp.intakeDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${imp.intakeOfficer}</div>
        </td>
        <td>
          <div style="font-size:0.85rem;">${owner?.name || 'Registered Guardian'}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${owner?.phone || ''}</div>
        </td>
        <td>
          ${isHolding ? `
            <span class="ledger-status" style="color:${isExpired ? 'var(--danger)' : 'var(--primary)'};">
              ${isExpired ? 'Holding Expired' : 'Within 72h'}
            </span>
            <div>
              <button class="btn btn-primary btn-sm" onclick="window.ownerView.simulateClaim('${imp.id}', '${imp.petName}')">
                <i data-lucide="check"></i> Release
              </button>
            </div>
          ` : `
            <span class="ledger-status" style="color:var(--success);">Claimed &amp; Released</span>
          `}
        </td>
      </tr>
    `;
  }

  triggerDemoScan(nfcTag) {
    const input = document.getElementById('nfc-manual-input');
    if (input) input.value = nfcTag;
    window.nfcScanner.scanTag(nfcTag);
  }

  handleManualScan(e) {
    e.preventDefault();
    const input = document.getElementById('nfc-manual-input');
    if (input && input.value) {
      window.nfcScanner.scanTag(input.value);
    }
  }

  clearScan() {
    this.currentScannedResult = null;
    this.renderScanResult();
  }

  submitIntake(e, petId) {
    e.preventDefault();
    const pet = window.pawStore.getPetById(petId);
    if (!pet) return;

    const shelterId = document.getElementById('intake-shelter-id').value;
    const shelter = window.pawStore.getShelters().find(s => s.id === shelterId);
    const cageNumber = document.getElementById('intake-cage-num').value;
    const location = document.getElementById('intake-location').value;
    const officer = document.getElementById('intake-officer').value;
    const health = document.getElementById('intake-health').value;

    const newImpound = window.pawStore.createImpoundment({
      petId: pet.id,
      petName: pet.name,
      nfcTag: pet.nfcTag,
      shelterId: shelter.id,
      shelterName: shelter.name,
      shelterAddress: shelter.address,
      shelterPhone: shelter.phone,
      cageNumber,
      impoundLocation: location,
      intakeOfficer: officer,
      healthCondition: health
    });

    window.notifManager.showToast(`Impoundment recorded. Automated SMS dispatched to ${pet.owner.phone}`, 'danger');

    // Show simulated SMS alert popup
    window.notifManager.showSmsSimulation({
      ownerPhone: pet.owner.phone,
      petName: pet.name,
      nfcTag: pet.nfcTag,
      shelterName: shelter.name,
      shelterAddress: shelter.address,
      shelterPhone: shelter.phone,
      cageNumber
    });

    this.clearScan();
  }
}

window.shelterView = new ShelterView();
