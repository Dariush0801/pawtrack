/**
 * PawTrack Animal Control & Shelter Staff Terminal View
 */

class ShelterView {
  constructor() {
    this.currentScannedResult = null;
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
    const activeCount = impoundments.filter(i => i.status === 'active_impounded').length;
    const claimedCount = impoundments.filter(i => i.status === 'claimed').length;

    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h1>${t('shelter.title', 'Animal Control & Shelter Terminal')}</h1>
          <div class="view-subtitle">${t('shelter.subtitle', 'Rapid RFID pet intake, owner notification dispatcher, and impoundment ledger management.')}</div>
        </div>
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <span class="badge badge-safe">
            <span class="hardware-led-status"></span> Reader Online: USB / NFC Hardware Ready
          </span>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="stats-grid">
        <div class="stat-card glass-card" data-label="Animals in Holding Bay" title="Animals in Holding Bay">
          <div class="stat-icon" style="background:linear-gradient(135deg, #b85410, #54280e); color:#ffffff;">
            <i data-lucide="building-2"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">${activeCount}</div>
            <div class="stat-label">Animals in Holding Bay</div>
          </div>
        </div>

        <div class="stat-card glass-card" data-label="Reunited with Owners" title="Reunited with Owners">
          <div class="stat-icon" style="background:linear-gradient(135deg, #ea9d1e, #b85410); color:#180d07;">
            <i data-lucide="check-circle-2"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">${claimedCount}</div>
            <div class="stat-label">Reunited with Owners</div>
          </div>
        </div>

        <div class="stat-card glass-card" data-label="RFID Scans Processed Today" title="RFID Scans Processed Today">
          <div class="stat-icon" style="background:linear-gradient(135deg, #54280e, #241208); color:#ea9d1e;">
            <i data-lucide="scan-line"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">${impoundments.length + 8}</div>
            <div class="stat-label">RFID Scans Processed Today</div>
          </div>
        </div>
      </div>

      <!-- Scanner HUD and Result Screen -->
      <div class="scanner-hud-container">
        <!-- Left: RFID Reader Interface -->
        <div class="scanner-box glass-card">
          <div class="scanner-frequency-tag">
            <span class="hardware-led-status"></span> 13.56 MHz (HF) / 125 kHz (LF) Active
          </div>

          <div class="scanner-radar-disk" onclick="window.shelterView.triggerDemoScan('RFID-882194')" title="Click or scan RFID Tag">
            <div class="scanner-pulse-wave"></div>
            <div class="scanner-pulse-wave"></div>
            <div class="rfid-core-chip">
              <i data-lucide="radio" style="width:36px; height:36px;"></i>
            </div>
          </div>

          <h3 style="margin-bottom:0.35rem; font-size:1.2rem;">Position RFID Tag Near Reader</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); max-width:320px; margin-bottom:1.25rem;">
            Interrogate tag UID to retrieve verified owner information and initialize intake.
          </p>

          <form id="rfid-manual-form" onsubmit="window.shelterView.handleManualScan(event)" style="display:flex; gap:0.5rem; width:100%; max-width:380px; flex-wrap:wrap;">
            <input type="text" id="rfid-manual-input" placeholder="Enter RFID UID or Microchip..." autocomplete="off" style="flex:1; min-width:180px;" />
            <button type="submit" class="btn btn-primary btn-sm" style="white-space:nowrap;">
              <i data-lucide="search"></i> Interrogate
            </button>
          </form>

          <!-- Quick Test Demo Chips -->
          <div class="demo-rfid-picker">
            <div style="font-size:0.75rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em;">
              Hardware Simulation Presets (Click to scan):
            </div>
            <div class="demo-tags-list">
              ${pets.map(p => `
                <button class="demo-tag-chip" onclick="window.shelterView.triggerDemoScan('${p.rfidTag}')">
                  Tag #${p.rfidTag} (${p.name} - ${p.breed})
                </button>
              `).join('')}
              <button class="demo-tag-chip" onclick="window.shelterView.triggerDemoScan('RFID-999000')">
                Tag #RFID-999000 (Unregistered Stray)
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Scan Result & Intake Action Box -->
        <div class="glass-card scan-result-card" id="scan-result-card">
          ${this.renderInitialScanPrompt()}
        </div>
      </div>

      <!-- Impoundment Records Ledger -->
      <div style="margin-top:2.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:1rem;">
          <div>
            <h2 style="font-size:1.35rem;">Impounded Animals Management Ledger</h2>
            <div style="font-size:0.85rem; color:var(--text-muted);">Current facility holding register, claim logs, and holding timelines.</div>
          </div>
        </div>

        <div class="table-container glass-card">
          <table class="ledger-table">
            <thead>
              <tr>
                <th>Pet & RFID UID</th>
                <th>Facility & Kennel</th>
                <th>Intake Date & Officer</th>
                <th>Holding Period Status</th>
                <th>Registered Guardian</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${impoundments.map(imp => this.renderLedgerRow(imp)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons({ root: container });
  }

  renderInitialScanPrompt() {
    return `
      <div class="scan-idle-state">
        <i data-lucide="scan-line"></i>
        <h3>Awaiting RFID Reader Signal</h3>
        <p style="font-size:0.875rem; max-width:340px; margin-top:0.5rem;">
          Hold an RFID collar tag to the scanner or select a test tag to view registry data and trigger notifications.
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

    const { rfidTag, pet, registered } = this.currentScannedResult;

    if (!registered || !pet) {
      card.innerHTML = `
        <div style="border-left:4px solid var(--danger); padding-left:1rem; margin-bottom:1.5rem;">
          <div style="font-size:0.8rem; text-transform:uppercase; color:var(--danger); font-weight:700;">Interrogation Result: Unregistered Transponder</div>
          <h3 style="font-size:1.35rem; margin-top:0.25rem;">UID: <code>${rfidTag}</code></h3>
          <p style="color:var(--text-muted); font-size:0.875rem; margin-top:0.25rem;">
            This RFID tag is not yet linked to any pet record in the national database.
          </p>
        </div>

        <div style="background:var(--bg-surface-elevated); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1.5rem;">
          <h4 style="font-size:0.95rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
            <i data-lucide="info"></i> Intake Protocol for Unidentified Animals
          </h4>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">
            Log this animal under the temporary shelter intake ledger or assign this UID to an existing pet record.
          </p>
          <button class="btn btn-primary btn-sm" onclick="window.ownerView.openRegisterModal('${rfidTag}')">
            <i data-lucide="plus"></i> Register Pet with UID: ${rfidTag}
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
          <img src="${pet.photoUrl}" style="width:64px; height:64px; border-radius:var(--radius-md); object-fit:cover; border:2px solid var(--primary);" />
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <h3 style="font-size:1.35rem; font-weight:800;">${pet.name}</h3>
              <span class="badge badge-safe">Verified Match</span>
            </div>
            <div style="font-size:0.825rem; color:var(--text-muted);">${pet.breed} • ${pet.gender} • UID: <strong style="color:var(--primary);">${pet.rfidTag}</strong></div>
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
          <input type="text" id="intake-health" value="Active, healthy, scanned collar RFID tag verified." required />
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

    return `
      <tr>
        <td>
          <div style="font-weight:700;">${imp.petName}</div>
          <div style="font-size:0.75rem; color:var(--primary); font-family:monospace;">${imp.rfidTag}</div>
        </td>
        <td>
          <div style="font-weight:600; font-size:0.85rem;">${imp.shelterName}</div>
          <div style="font-size:0.75rem; color:var(--primary); font-weight:600;">${imp.cageNumber}</div>
        </td>
        <td>
          <div style="font-size:0.85rem;">${new Date(imp.intakeDate).toLocaleDateString()} ${new Date(imp.intakeDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${imp.intakeOfficer}</div>
        </td>
        <td>
          ${isHolding ? `
            <span style="color: ${isExpired ? 'var(--danger)' : 'var(--primary)'}; font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;">
              ${isExpired ? 'Holding Expired' : '72h Active Window'}
            </span>
          ` : `
            <span style="color: var(--success); font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;">
              Claimed & Released
            </span>
          `}
        </td>
        <td>
          <div style="font-size:0.85rem;">${imp.petId ? window.pawStore.getPetById(imp.petId)?.owner?.name || 'Registered Guardian' : 'Registered Guardian'}</div>
          <div style="font-size:0.75rem; color:var(--primary); font-weight:600;">${imp.petId ? window.pawStore.getPetById(imp.petId)?.owner?.phone || 'Contact' : 'Contact'}</div>
        </td>
        <td>
          ${isHolding ? `
            <button class="btn btn-primary btn-sm" onclick="window.ownerView.simulateClaim('${imp.id}', '${imp.petName}')">
              <i data-lucide="check"></i> Release / Claim
            </button>
          ` : `
            <span style="font-size:0.8rem; color:var(--text-muted);">Completed</span>
          `}
        </td>
      </tr>
    `;
  }

  triggerDemoScan(rfidTag) {
    const input = document.getElementById('rfid-manual-input');
    if (input) input.value = rfidTag;
    window.rfidScanner.scanTag(rfidTag);
  }

  handleManualScan(e) {
    e.preventDefault();
    const input = document.getElementById('rfid-manual-input');
    if (input && input.value) {
      window.rfidScanner.scanTag(input.value);
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
      rfidTag: pet.rfidTag,
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
      rfidTag: pet.rfidTag,
      shelterName: shelter.name,
      shelterAddress: shelter.address,
      shelterPhone: shelter.phone,
      cageNumber
    });

    this.clearScan();
  }
}

window.shelterView = new ShelterView();
