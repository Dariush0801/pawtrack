/**
 * Found a Pet: a finder uploads a photo, the AI reads it and writes a description, and the system lists
 * every missing pet that looks similar. Choosing one sends the owner a found-pet alert.
 */

class FoundView {
  constructor() {
    this.reset();
  }

  reset() {
    this.photo = null;        // downscaled JPEG data URL
    this.status = 'idle';     // 'idle' | 'scanning' | 'done' | 'error'
    this.error = '';
    this.traits = null;
    this.description = '';
    this.matches = [];
    this.checked = 0;
    this.selectedId = null;   // a missing pet, or 'none' for "none of these"
    this.token = 0;           // ignores a scan reply that arrives after the photo changed
    this.sent = null;         // { name } once an alert has gone out
    this.mode = 'pick';       // 'pick' (choose it from the missing list) | 'scan' (find the pet from a photo)
    this.query = '';          // search text in the missing list
    this.form = { location: '', phone: '', notes: '' };
  }

  esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // The view is rebuilt from its saved state, so a store update while the page is open loses nothing
  render(container) {
    this.container = container || document.getElementById('app-viewport');
    if (!this.container) return;
    this.keepForm();
    if (!this.form.phone) {
      const user = window.pawStore.getGoogleUser();
      if (user && user.phone) this.form.phone = user.phone;
    }

    this.container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h1>Found a Pet</h1>
          <div class="view-subtitle">Choose the missing pet you found, or scan a photo and let the AI find a match. Then alert the owner.</div>
        </div>
      </div>
      ${this.sent ? `<div class="found-flow">${this.sentHtml()}</div>` : `
        ${this.stepperHtml()}
        <div class="found-grid${this.mode === 'scan' && !this.photo ? ' is-empty' : ''}">
          <div class="found-col found-col-photo">${this.photoHtml()}</div>
          <div class="found-col found-col-main">${this.mainHtml()}</div>
        </div>`}`;
    this.bind();
    if (window.lucide) window.lucide.createIcons({ root: this.container });
  }

  keepForm() {
    ['location', 'phone', 'notes'].forEach((k) => {
      const el = document.getElementById(`found-${k}`);
      if (el) this.form[k] = el.value;
    });
  }

  // ---------- sections ----------

  stepperHtml() {
    const hasPhoto = !!this.photo;
    const scanned = this.status === 'done';
    const picked = !!this.selectedId;
    // [title, hint, done, active]
    const steps = this.mode === 'pick' ? [
      ['Choose the pet', 'From missing pets', picked, !picked],
      ['Add details', 'Where you found it', false, picked],
      ['Notify the owner', 'One tap to send', false, false]
    ] : [
      ['Photo', 'Add a clear photo', hasPhoto, !hasPhoto],
      ['Find matches', this.status === 'scanning' ? 'Scanning now...' : 'AI compares it', scanned, hasPhoto && !scanned],
      ['Alert the owner', 'Send your details', false, scanned]
    ];
    return `<ol class="found-stepper glass-card" aria-label="Progress">${steps.map(([title, hint, done, active], i) =>
      `<li class="${done ? 'is-done' : ''}${active && !done ? ' is-active' : ''}"${active && !done ? ' aria-current="step"' : ''}>
        <span class="found-dot">${done ? '<i data-lucide="check"></i>' : i + 1}</span>
        <span class="found-step-text"><span class="found-step-label">${title}</span><span class="found-step-hint">${hint}</span></span>
      </li>`).join('')}</ol>`;
  }

  photoHtml() {
    const scanning = this.status === 'scanning';
    return `
      <section class="glass-card found-card found-photo-card">
        <h3 class="found-card-title">Photo of the pet${this.mode === 'pick' ? ' <span class="found-optional">(optional)</span>' : ''}</h3>
        ${this.photo
          ? `<div class="found-photo"><img src="${this.esc(this.photo)}" alt="The pet you found" />
              ${scanning ? '<div class="found-scanline" aria-hidden="true"></div>' : ''}</div>
              <div class="found-photo-actions">
                <button type="button" class="btn btn-outline btn-sm" id="found-change" ${scanning ? 'disabled' : ''}><i data-lucide="image"></i> Change photo</button>
                ${this.status === 'done' || this.status === 'error' ? '<button type="button" class="btn btn-outline btn-sm" id="found-scan"><i data-lucide="refresh-cw"></i> Scan again</button>' : ''}
              </div>`
          : `<div class="found-drop" id="found-drop" tabindex="0" role="button" aria-label="Choose a photo">
              <span class="found-drop-icon"><i data-lucide="camera"></i></span>
              <strong>Add a photo of the pet</strong>
              <p>Drop it here, or choose one. A clear photo of the face and body works best.</p>
              <div class="found-drop-actions">
                <button type="button" class="btn btn-primary btn-sm" id="found-upload"><i data-lucide="upload"></i> Upload photo</button>
                <button type="button" class="btn btn-outline btn-sm" id="found-camera"><i data-lucide="camera"></i> Take photo</button>
              </div>
            </div>`}
        <input type="file" id="found-file" accept="image/*" hidden />
        <input type="file" id="found-cam" accept="image/*" capture="environment" hidden />
      </section>`;
  }

  modeHtml() {
    const tab = (key, icon, label) => `<button type="button" class="found-mode-btn${this.mode === key ? ' is-active' : ''}" data-mode="${key}" role="tab" aria-selected="${this.mode === key}"><i data-lucide="${icon}"></i> ${label}</button>`;
    return `<div class="found-mode" role="tablist" aria-label="How do you want to find the pet?">${tab('pick', 'list', 'Choose a missing pet')}${tab('scan', 'scan-search', 'Scan a photo')}</div>`;
  }

  // The whole list of missing pets, one per row, filtered by the search box
  missingPets() {
    const q = this.query.trim().toLowerCase();
    return window.pawStore.getPets()
      .filter((p) => p.name && p.status === 'lost')
      .filter((p) => !q || [p.name, p.species, p.breed, p.color, p.lastSeenLocation].filter(Boolean).join(' ').toLowerCase().includes(q));
  }

  pickRowsHtml() {
    const pets = this.missingPets();
    if (!pets.length) {
      const any = window.pawStore.getPets().some((p) => p.status === 'lost');
      return `<div class="found-nomatch"><i data-lucide="search-x"></i><p>${any ? 'No missing pet matches your search.' : 'No pets are reported missing right now.'}</p></div>`;
    }
    return pets.map((pet) => {
      const picked = String(this.selectedId) === String(pet.id);
      const seen = this.timeAgo(pet.lastSeenDate);
      return `<button type="button" class="found-match${picked ? ' is-selected' : ''}" data-pet="${this.esc(pet.id)}" role="radio" aria-checked="${picked}">
        ${this.avatar(pet)}
        <span class="found-match-text">
          <span class="found-match-name"><strong>${this.esc(pet.name)}</strong></span>
          <span class="found-match-meta">${this.esc([pet.species, pet.breed, pet.color].filter(Boolean).join(' \u00b7 '))}</span>
          <span class="found-match-meta"><i data-lucide="map-pin"></i>${this.esc(pet.lastSeenLocation || 'Last seen unknown')}${seen ? ` \u00b7 ${seen}` : ''}</span>
        </span>
        <span class="found-check" aria-hidden="true"><i data-lucide="check"></i></span>
      </button>`;
    }).join('');
  }

  pickHtml() {
    const total = window.pawStore.getPets().filter((p) => p.name && p.status === 'lost').length;
    return `
      <section class="glass-card found-card">
        <div class="found-section-head">
          <h3 class="found-card-title">Missing pets</h3>
          <span>${total} reported</span>
        </div>
        <p class="found-hint">Pick the pet you found. You can add a photo on the left if you have one.</p>
        <input type="search" class="form-control" id="found-search" placeholder="Search by name, breed, color or area" value="${this.esc(this.query)}" autocomplete="off" />
        <div class="found-matches" id="found-pick-list" role="radiogroup" aria-label="Missing pets">${this.pickRowsHtml()}</div>
      </section>`;
  }

  mainHtml() {
    const body = this.mode === 'pick' ? `${this.pickHtml()}${this.alertHtml()}` : this.scanHtml();
    return this.modeHtml() + body;
  }

  scanHtml() {
    if (!this.photo) {
      return `<section class="glass-card found-card found-empty">
        <h3><i data-lucide="search-check"></i> How it works</h3>
        <ol class="found-how">
          <li><b>1</b><span>Upload a photo of the pet you found.</span></li>
          <li><b>2</b><span>The AI describes it and lists missing pets that look similar.</span></li>
          <li><b>3</b><span>Pick the matching pet and send its owner your location and number.</span></li>
        </ol>
      </section>`;
    }
    if (this.status === 'scanning') return this.scanningHtml();
    if (this.status === 'error') {
      return `<section class="glass-card found-card">
        <div class="found-note is-error"><i data-lucide="alert-circle"></i><span>${this.esc(this.error)}</span></div>
        <button type="button" class="btn btn-primary btn-sm found-retry" id="found-scan"><i data-lucide="refresh-cw"></i> Try again</button>
      </section>`;
    }
    if (this.status === 'done') return `${this.resultsHtml()}${this.alertHtml()}`;
    return `<section class="glass-card found-card"><button type="button" class="btn btn-primary found-scan" id="found-scan"><i data-lucide="scan-search"></i> Scan for similar missing pets</button></section>`;
  }

  scanningHtml() {
    const skeleton = '<div class="found-skeleton"><span class="sk-img"></span><span class="sk-lines"><span></span><span></span></span><span class="sk-score"></span></div>';
    return `<section class="glass-card found-card" aria-busy="true">
      <div class="found-note"><span class="found-spinner"></span><span>Reading the photo, then comparing it with the pets reported missing...</span></div>
      <div class="found-skeletons">${skeleton}${skeleton}${skeleton}</div>
    </section>`;
  }

  resultsHtml() {
    const rows = this.matches.map((m, i) => {
      const pet = m.pet;
      const tone = m.confidenceScore >= 75 ? 'high' : m.confidenceScore >= 55 ? 'mid' : 'low';
      const label = tone === 'high' ? 'Strong match' : tone === 'mid' ? 'Possible match' : 'Weak match';
      const picked = String(this.selectedId) === String(pet.id);
      const seen = this.timeAgo(pet.lastSeenDate);
      return `<button type="button" class="found-match is-${tone}${picked ? ' is-selected' : ''}" data-pet="${this.esc(pet.id)}" role="radio" aria-checked="${picked}">
        ${this.avatar(pet)}
        <span class="found-match-text">
          <span class="found-match-name"><strong>${this.esc(pet.name)}</strong>${i === 0 ? '<em class="found-badge">Best match</em>' : ''}</span>
          <span class="found-match-meta">${this.esc([pet.species, pet.breed, pet.color].filter(Boolean).join(' · '))}</span>
          <span class="found-match-meta"><i data-lucide="map-pin"></i>${this.esc(pet.lastSeenLocation || 'Last seen unknown')}${seen ? ` · ${seen}` : ''}</span>
          <span class="found-bar" aria-hidden="true"><span style="width:${m.confidenceScore}%"></span></span>
        </span>
        <span class="found-score"><b>${m.confidenceScore}%</b><small>${label}</small></span>
        <span class="found-check" aria-hidden="true"><i data-lucide="check"></i></span>
      </button>`;
    }).join('');

    return `
      <section class="glass-card found-card">
        <div class="found-ai">
          <span class="found-ai-tag"><i data-lucide="sparkles"></i> AI description</span>
          <p>${this.esc(this.description || 'No description was produced.')}</p>
        </div>
        <div class="found-section-head">
          <h3 class="found-card-title">${this.matches.length ? `${this.matches.length} similar missing ${this.matches.length === 1 ? 'pet' : 'pets'}` : 'Similar missing pets'}</h3>
          <span>${this.checked} checked</span>
        </div>
        ${this.matches.length
          ? `<p class="found-hint">Tap the pet you found. Scores are estimates, so check the details.</p>
             <div class="found-matches" role="radiogroup" aria-label="Similar missing pets">${rows}</div>`
          : `<div class="found-nomatch"><i data-lucide="search-x"></i><p>${this.checked ? `None of the ${this.checked} missing pets look like this one.` : 'No pets are reported missing right now.'}</p></div>`}
        <button type="button" class="found-none${this.selectedId === 'none' ? ' is-selected' : ''}" id="found-none">
          <i data-lucide="${this.selectedId === 'none' ? 'check-circle-2' : 'circle'}"></i> None of these. Post it as a sighting instead.
        </button>
      </section>`;
  }

  alertHtml() {
    if (!this.selectedId) return '';
    const pet = this.selectedId === 'none' ? null : window.pawStore.getPetById(this.selectedId);
    return `
      <section class="glass-card found-card found-alert" id="found-alert">
        <div class="found-alert-head">
          ${pet ? `${this.avatar(pet)}<div><span class="found-alert-kicker">Alert the owner of</span><h3>${this.esc(pet.name)}</h3></div>`
            : `<span class="found-match-img found-match-blank"><i data-lucide="eye"></i></span><div><span class="found-alert-kicker">No match selected</span><h3>Post a sighting</h3></div>`}
        </div>
        <form id="found-form" class="found-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="found-location">Where did you find it? *</label>
            <input type="text" class="form-control" id="found-location" placeholder="e.g. Near the park gate, Brgy. Commonwealth" value="${this.esc(this.form.location)}" autocomplete="off" />
          </div>
          <div class="form-group">
            <label class="form-label" for="found-phone">Your phone number *</label>
            <input type="tel" class="form-control" id="found-phone" placeholder="e.g. 0917 555 3829" value="${this.esc(this.form.phone)}" autocomplete="tel" />
            <small class="found-fine">${pet ? 'Only the owner sees this so they can reach you.' : 'Shared with the shelters that review sightings.'}</small>
          </div>
          <div class="form-group">
            <label class="form-label" for="found-notes">Notes <span class="found-optional">(optional)</span></label>
            <textarea class="form-control" id="found-notes" rows="2" placeholder="How the pet looks, where it is now...">${this.esc(this.form.notes)}</textarea>
          </div>
          <button type="submit" class="btn btn-primary found-send"><i data-lucide="send"></i> ${pet ? `This is ${this.esc(pet.name)}. Notify the owner` : 'Post the sighting'}</button>
        </form>
      </section>`;
  }

  sentHtml() {
    return `
      <section class="glass-card found-card found-sent">
        <span class="found-sent-icon"><i data-lucide="check"></i></span>
        <h3>${this.sent.name ? `${this.esc(this.sent.name)}'s owner has been alerted` : 'Sighting posted'}</h3>
        <p>${this.sent.name ? 'They received your photo, location and phone number.' : 'It is now on the Incident Map and the Sightings board.'} Thank you for helping.</p>
        <div class="found-sent-actions">
          <button type="button" class="btn btn-primary" id="found-again"><i data-lucide="plus"></i> Report another pet</button>
          <button type="button" class="btn btn-outline" onclick="window.location.hash = '#owner'"><i data-lucide="map-pin"></i> See missing pets</button>
        </div>
      </section>`;
  }

  avatar(pet) {
    const photo = pet.photoUrl || pet.photo;
    return photo ? `<img class="found-match-img" src="${this.esc(photo)}" alt="" loading="lazy" />`
      : '<span class="found-match-img found-match-blank"><i data-lucide="paw-print"></i></span>';
  }

  timeAgo(iso) {
    const t = iso ? new Date(iso).getTime() : NaN;
    if (!Number.isFinite(t)) return '';
    const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
    if (mins < 60) return `${mins || 1} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} h ago`;
    const days = Math.round(hrs / 24);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  // ---------- events ----------

  bind() {
    const $ = (id) => document.getElementById(id);
    $('found-upload')?.addEventListener('click', (e) => { e.stopPropagation(); $('found-file').click(); });
    $('found-change')?.addEventListener('click', () => $('found-file').click());
    $('found-camera')?.addEventListener('click', (e) => { e.stopPropagation(); $('found-cam').click(); });
    ['found-file', 'found-cam'].forEach((id) => $(id)?.addEventListener('change', (e) => this.pickPhoto(e.target.files[0])));
    $('found-scan')?.addEventListener('click', () => this.scan());
    $('found-none')?.addEventListener('click', () => this.select('none'));
    $('found-again')?.addEventListener('click', () => { this.reset(); this.render(); });
    $('found-form')?.addEventListener('submit', (e) => { e.preventDefault(); this.send(); });
    this.container.querySelectorAll('.found-match').forEach((b) => b.addEventListener('click', () => this.select(b.dataset.pet)));
    this.container.querySelectorAll('.found-mode-btn').forEach((b) => b.addEventListener('click', () => this.setMode(b.dataset.mode)));
    $('found-search')?.addEventListener('input', (e) => {
      this.query = e.target.value;
      const list = $('found-pick-list');
      list.innerHTML = this.pickRowsHtml();
      list.querySelectorAll('.found-match').forEach((b) => b.addEventListener('click', () => this.select(b.dataset.pet)));
      if (window.lucide) window.lucide.createIcons({ root: list });
    });

    const drop = $('found-drop');
    if (drop) {
      drop.addEventListener('click', () => $('found-file').click());
      drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('found-file').click(); } });
      ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
      ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
      drop.addEventListener('drop', (e) => this.pickPhoto(e.dataTransfer && e.dataTransfer.files[0]));
    }
  }

  setMode(mode) {
    if (mode === this.mode) return;
    this.keepForm();
    this.mode = mode;
    this.selectedId = null; // a choice made one way does not carry over to the other
    this.render();
  }

  select(id) {
    this.keepForm();
    this.selectedId = id;
    this.render();
    document.getElementById('found-alert')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Shrinks the photo before anything is sent or stored, then scans it straight away
  pickPhoto(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      window.notifManager?.showToast('Please choose an image file (JPG, PNG or WEBP).', 'warning', 3500);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 768 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        this.token++;
        this.photo = canvas.toDataURL('image/jpeg', 0.85);
        this.status = 'idle';
        this.traits = null; this.matches = []; this.description = '';
        if (this.mode === 'pick') { this.status = 'idle'; this.render(); } else { this.selectedId = null; this.scan(); }
      };
      img.onerror = () => window.notifManager?.showToast('That photo could not be opened. Try another one.', 'warning', 3500);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  async scan() {
    if (!this.photo || this.status === 'scanning') return;
    this.keepForm();
    const token = ++this.token;
    this.status = 'scanning';
    this.selectedId = null;
    this.render();
    try {
      const traits = await window.petAI.readPhoto(this.photo);
      if (token !== this.token) return;
      if (traits.isPet === false) throw new Error('No pet was detected in this photo. Try a clearer photo of the animal.');
      const { matches, checked } = window.petAI.matchMissing(traits, 50);
      this.traits = traits;
      this.description = window.petAI.describeTraits(traits);
      this.matches = matches;
      this.checked = checked;
      this.status = 'done';
    } catch (err) {
      if (token !== this.token) return;
      this.status = 'error';
      this.error = err.message || 'The photo could not be scanned. Please try again.';
    }
    this.render();
  }

  // ---------- sending ----------

  fieldError(id, message) {
    const el = document.getElementById(id);
    if (!el) return;
    const group = el.closest('.form-group');
    group.classList.add('has-error');
    if (!group.querySelector('.field-error')) {
      const note = document.createElement('small');
      note.className = 'field-error';
      note.setAttribute('role', 'alert');
      group.appendChild(note);
    }
    group.querySelector('.field-error').textContent = message;
    el.addEventListener('input', () => { group.classList.remove('has-error'); group.querySelector('.field-error')?.remove(); }, { once: true });
  }

  send() {
    this.keepForm();
    document.querySelectorAll('#found-form .has-error').forEach((g) => { g.classList.remove('has-error'); g.querySelector('.field-error')?.remove(); });
    const { location, phone, notes } = this.form;
    const problems = [];
    if (!location.trim()) problems.push(['found-location', 'Say where you found the pet.']);
    if (!phone.trim()) problems.push(['found-phone', 'Add a phone number the owner can call.']);
    if (problems.length) {
      problems.forEach(([id, msg]) => this.fieldError(id, msg));
      const first = document.getElementById(problems[0][0]);
      first.scrollIntoView({ block: 'center', behavior: 'smooth' });
      first.focus({ preventScroll: true });
      return;
    }

    const store = window.pawStore;
    const pet = this.selectedId === 'none' ? null : store.getPetById(this.selectedId);
    const t = this.traits || {};
    const coords = (pet && pet.lastSeenCoords) || [14.6760, 121.0437];
    const now = new Date().toISOString();
    const comments = [this.description, notes.trim()].filter(Boolean).join(' | ');
    const evidence = this.photo || (pet && (pet.photoUrl || pet.photo)) || '';

    try {
      store.addSighting({
        id: 'SIGHT-' + Date.now().toString().slice(-6),
        species: pet ? pet.species : (t.species && t.species !== 'Unknown' ? t.species : 'Other'),
        breed: pet ? pet.breed : (t.breed && t.breed !== 'Unknown' ? t.breed : 'Mixed Breed'),
        location: location.trim(),
        coords,
        nfcTag: pet ? (pet.nfcTag || '') : '',
        reporterPhone: phone.trim(),
        reporterName: 'Community Good Samaritan',
        comments,
        timestamp: now,
        confidenceScore: pet ? (this.matches.find((m) => m.pet.id === pet.id) || {}).confidenceScore || 0 : 0,
        photo: evidence,
        photoUrl: evidence,
        reportType: 'found',
        ...(pet ? { matchedPetId: pet.id } : {})
      });

      if (pet) {
        store.addNotification({
          id: 'notif-match-' + Date.now(),
          title: `GOOD SAMARITAN FOUND YOUR PET: "${String(pet.name).toUpperCase()}"!`,
          message: `Your pet was found and reported near ${location.trim()}. Finder Contact: ${phone.trim()}. Notes: "${comments}"`,
          type: 'pet_found_match',
          petId: pet.id,
          petName: pet.name,
          nfcTag: pet.nfcTag,
          finderName: 'Community Good Samaritan',
          finderPhone: phone.trim(),
          finderNotes: comments,
          location: location.trim(),
          coords,
          photoUrl: evidence,
          timestamp: now,
          read: false
        });
        window.pawApp?.alertOwnerFound(pet.id, phone.trim(), location.trim(), comments);
        store.addCaseTimelineEvent(pet.id, {
          type: 'sighting',
          title: 'Pet Located by Good Samaritan',
          location: location.trim(),
          finder: `Community Good Samaritan (${phone.trim()})`,
          notes: comments,
          photoUrl: evidence,
          timestamp: now
        });
      } else {
        store.addNotification({
          id: 'notif-sight-' + Date.now(),
          title: `Sighting Pinned: ${t.breed && t.breed !== 'Unknown' ? t.breed : 'Pet'} (${t.species || 'Pet'})`,
          message: `Community sighting logged at ${location.trim()}. Notes: "${comments}"`,
          type: 'sighting',
          location: location.trim(),
          coords,
          finderPhone: phone.trim(),
          finderName: 'Community Good Samaritan',
          finderNotes: comments,
          photoUrl: evidence,
          timestamp: now,
          read: false
        });
      }
    } catch (err) {
      console.error('[Found] send failed:', err);
      window.notifManager?.showToast(`Could not send the alert: ${err.message || 'unknown error'}. Please try again.`, 'error', 6000);
      return;
    }

    window.notifManager?.showToast(pet ? `${pet.name}'s owner has been alerted.` : 'Sighting posted.', 'success', 4500);
    const sent = { name: pet ? pet.name : '' };
    this.reset();
    this.sent = sent;
    this.render();
  }
}

window.foundView = new FoundView();
