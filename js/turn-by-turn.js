/**
 * PawTrack turn-by-turn navigation
 * Follows the guardian's live position along a route that PublicView already drew and speaks each
 * instruction with the browser's speech engine (free; it is not Google's Maps voice).
 * Steps come from the same Google Routes request that draws the route, so a trip costs one request,
 * plus one more each time the guardian leaves the route and it is recalculated.
 */
class TurnByTurn {
  constructor(view) {
    this.view = view;
    this.running = false;
    this.voiceOn = true;
    this.following = true;
    this.watchId = null;
    this.marker = null;
    this.wakeLock = null;
    this.reset();
  }

  reset() {
    this.route = null;
    this.ctx = null;
    this.stepIndex = 0;
    this.announced = new Set();
    this.offRouteHits = 0;
    this.lastReroute = 0;
    this.rerouting = false;
    this.position = null;
    this.remainingM = 0;
  }

  t(key, fallback) {
    return window.pawI18n ? window.pawI18n.t(key, fallback) : fallback;
  }

  get isFil() {
    return window.pawI18n && window.pawI18n.getLang() === 'fil';
  }

  // ───────────────────────── start / stop ─────────────────────────
  start(route, ctx) {
    if (!route || !route.steps || !route.steps.length || !this.view.map) return false;
    if (!navigator.geolocation) {
      this.toast(this.t('nav.noGps', 'This device cannot share its location.'), 'warning');
      return false;
    }
    this.stop(true);
    this.running = true;
    this.following = true;
    this.route = route;
    this.ctx = ctx;
    this.remainingM = route.distanceKm * 1000;

    const map = this.view.map;
    this.onDrag = () => { this.following = false; this.renderUI(); };
    map.on('dragstart', this.onDrag);

    this.renderUI();
    this.speakOpening();
    this.requestWakeLock();

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.onPosition(pos),
      (err) => {
        if (err.code === 1) {
          this.toast(this.t('nav.denied', 'Location access was blocked. Allow it to use navigation.'), 'warning');
          this.exit();
        }
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 }
    );
    return true;
  }

  // keepRoute: only clean up (a new start follows); otherwise the whole directions panel is closed too
  stop(keepRoute = false) {
    if (this.watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(this.watchId);
    this.watchId = null;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    this.releaseWakeLock();
    const map = this.view.map;
    if (map && this.onDrag) map.off('dragstart', this.onDrag);
    if (map && this.marker) map.removeLayer(this.marker);
    this.marker = null;
    this.onDrag = null;
    this.running = false;
    if (!keepRoute) this.reset();
  }

  exit() {
    this.stop();
    this.view.closeDirections();
  }

  async requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this.visHandler = this.visHandler || (() => { if (this.running && !document.hidden) this.requestWakeLock(); });
        document.addEventListener('visibilitychange', this.visHandler);
      }
    } catch (e) { /* the screen may sleep; navigation still works while it is on */ }
  }

  releaseWakeLock() {
    try { if (this.wakeLock) this.wakeLock.release(); } catch (e) {}
    this.wakeLock = null;
    if (this.visHandler) document.removeEventListener('visibilitychange', this.visHandler);
  }

  // ───────────────────────── position handling ─────────────────────────
  onPosition(pos) {
    if (!this.running) return;
    const here = [pos.coords.latitude, pos.coords.longitude];
    this.position = here;
    const accuracy = pos.coords.accuracy || 0;
    const heading = typeof pos.coords.heading === 'number' && !isNaN(pos.coords.heading) ? pos.coords.heading : null;

    this.drawMarker(here, heading);
    if (this.following) this.view.map.setView(here, Math.max(this.view.map.getZoom(), 17), { animate: true });

    const steps = this.route.steps;
    const walking = this.ctx.travelMode === 'walk';
    const farM = walking ? 120 : 400;
    const nearM = walking ? 40 : 120;
    const nowM = walking ? 15 : 30;

    // Arrived?
    const toDest = this.view.calculateDistance(here[0], here[1], this.ctx.destLat, this.ctx.destLng) * 1000;
    if (toDest < Math.max(30, Math.min(accuracy, 60))) {
      this.arrive();
      return;
    }

    // Advance past maneuvers that are behind us
    while (this.stepIndex < steps.length - 1 && this.dist(here, steps[this.stepIndex].end) < nowM) {
      this.stepIndex++;
    }
    const step = steps[this.stepIndex];
    const next = steps[this.stepIndex + 1];
    const toEnd = this.dist(here, step.end);
    this.remainingM = toEnd + steps.slice(this.stepIndex + 1).reduce((sum, s) => sum + (s.dist || 0), 0);

    // Spoken prompts for the upcoming maneuver (each is said once)
    if (next) {
      const id = (tag) => `${this.stepIndex}:${tag}`;
      if (toEnd <= nowM && !this.announced.has(id('now'))) {
        this.announced.add(id('now')); this.announced.add(id('near')); this.announced.add(id('far'));
        this.say(next.text);
      } else if (toEnd <= nearM && !this.announced.has(id('near'))) {
        this.announced.add(id('near')); this.announced.add(id('far'));
        this.say(this.inDistance(toEnd, next.text));
      } else if (toEnd <= farM && !this.announced.has(id('far'))) {
        this.announced.add(id('far'));
        this.say(this.inDistance(toEnd, next.text));
      }
    }

    this.checkOffRoute(here, accuracy);
    this.renderUI();
  }

  checkOffRoute(here, accuracy) {
    if (this.rerouting || accuracy > 80) return;
    const off = this.distanceToPath(here, this.route.path);
    const limit = Math.max(60, accuracy * 1.5);
    this.offRouteHits = off > limit ? this.offRouteHits + 1 : 0;
    if (this.offRouteHits >= 3 && Date.now() - this.lastReroute > 20000) this.reroute(here);
  }

  async reroute(here) {
    this.rerouting = true;
    this.lastReroute = Date.now();
    this.offRouteHits = 0;
    this.say(this.t('nav.rerouting', 'Rerouting.'));
    this.renderUI();
    try {
      const route = await this.view.fetchRoute(here, [this.ctx.destLat, this.ctx.destLng], this.ctx.travelMode);
      if (!this.running) return;
      if (route && route.steps && route.steps.length) {
        this.route = route;
        this.stepIndex = 0;
        this.announced = new Set();
        this.view.drawRoute(route, this.ctx.travelMode);
        this.say(route.steps[0].text);
      }
    } finally {
      this.rerouting = false;
      this.renderUI();
    }
  }

  arrive() {
    const name = this.ctx.destName;
    this.say(`${this.t('nav.arrived', 'You have arrived at')} ${name}.`, true);
    this.toast(`${this.t('nav.arrived', 'You have arrived at')} ${name}.`, 'success');
    this.stop();
    this.view.closeDirections();
  }

  // ───────────────────────── geometry ─────────────────────────
  dist(a, b) {
    return this.view.calculateDistance(a[0], a[1], b[0], b[1]) * 1000;
  }

  // Shortest distance in metres from a point to the route line (flat-earth approximation is fine at city scale)
  distanceToPath(p, path) {
    const kx = 111320 * Math.cos(p[0] * Math.PI / 180);
    const ky = 110540;
    let best = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
      const ax = (path[i][1] - p[1]) * kx, ay = (path[i][0] - p[0]) * ky;
      const bx = (path[i + 1][1] - p[1]) * kx, by = (path[i + 1][0] - p[0]) * ky;
      const dx = bx - ax, dy = by - ay;
      const len2 = dx * dx + dy * dy;
      const u = len2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
      best = Math.min(best, Math.hypot(ax + u * dx, ay + u * dy));
    }
    return best;
  }

  // ───────────────────────── voice ─────────────────────────
  speakOpening() {
    const first = this.route.steps[0];
    const lead = this.t('nav.starting', 'Starting navigation.');
    this.say(`${lead} ${first.text}`, true);
  }

  inDistance(meters, text) {
    return `${this.t('nav.in', 'In')} ${this.spokenDistance(meters)}, ${text}`;
  }

  spokenDistance(m) {
    if (m >= 950) return `${(Math.round(m / 100) / 10).toString()} ${this.t('nav.kilometers', 'kilometers')}`;
    const rounded = m >= 100 ? Math.round(m / 50) * 50 : Math.max(10, Math.round(m / 10) * 10);
    return `${rounded} ${this.t('nav.meters', 'meters')}`;
  }

  say(text, interrupt = true) {
    if (!this.voiceOn || !text || !window.speechSynthesis) return;
    try {
      if (interrupt) window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const want = this.isFil ? ['fil', 'tl'] : ['en-PH', 'en-US', 'en'];
      const voices = window.speechSynthesis.getVoices();
      const voice = want.map((code) => voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(code.toLowerCase()))).find(Boolean);
      if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = this.isFil ? 'fil-PH' : 'en-US'; }
      u.rate = 1;
      window.speechSynthesis.speak(u);
    } catch (e) { /* speech is optional */ }
  }

  toggleVoice() {
    this.voiceOn = !this.voiceOn;
    if (!this.voiceOn && window.speechSynthesis) window.speechSynthesis.cancel();
    else if (this.voiceOn) this.say(this.t('nav.voiceOn', 'Voice guidance on.'));
    this.renderUI();
  }

  recenter() {
    this.following = true;
    if (this.position) this.view.map.setView(this.position, Math.max(this.view.map.getZoom(), 17), { animate: true });
    this.renderUI();
  }

  toast(message, type) {
    if (window.notifManager) window.notifManager.showToast(message, type, 4000);
  }

  // ───────────────────────── marker and UI ─────────────────────────
  drawMarker(pos, heading) {
    const rotate = heading === null ? '' : `transform:rotate(${heading}deg);`;
    const icon = window.L.divIcon({
      className: 'custom-map-icon-wrap',
      html: `<div class="tbt-me"><div class="tbt-me-arrow" style="${rotate}"><svg width="30" height="30" viewBox="0 0 24 24"><path d="M12 2 20 21l-8-4-8 4z" fill="#2563eb" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/></svg></div></div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
    if (!this.marker) this.marker = window.L.marker(pos, { icon, zIndexOffset: 2000 }).addTo(this.view.map);
    else { this.marker.setLatLng(pos); this.marker.setIcon(icon); }
    // The pulsing "start" dot from the preview is replaced by this live marker
    if (this.view.startMarker && this.view.map.hasLayer(this.view.startMarker)) this.view.map.removeLayer(this.view.startMarker);
  }

  iconFor(maneuver) {
    const m = String(maneuver || '');
    if (/UTURN/.test(m)) return 'undo-2';
    if (/ROUNDABOUT/.test(m)) return 'rotate-cw';
    const gentle = /SLIGHT|KEEP|FORK/.test(m);
    if (/LEFT/.test(m)) return gentle ? 'arrow-up-left' : 'corner-up-left';
    if (/RIGHT/.test(m)) return gentle ? 'arrow-up-right' : 'corner-up-right';
    return 'arrow-up';
  }

  formatDistance(m) {
    return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.max(10, Math.round(m / 10) * 10)} m`;
  }

  renderUI() {
    const host = document.getElementById('gmap-directions-hud-container');
    if (!host || !this.running) return;
    const steps = this.route.steps;
    const step = steps[this.stepIndex];
    const next = steps[this.stepIndex + 1];
    const toEnd = this.position ? this.dist(this.position, step.end) : step.dist;
    const after = steps[this.stepIndex + 2];

    const totalM = this.route.distanceKm * 1000 || 1;
    const minLeft = Math.max(1, Math.round(this.route.durationMin * Math.min(1, this.remainingM / totalM)));
    const arrival = new Date(Date.now() + minLeft * 60000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const esc = (v) => this.view.escapeHtml(v);

    const main = next
      ? `<div class="tbt-icon"><i data-lucide="${this.iconFor(next.maneuver)}"></i></div>
         <div class="tbt-text">
           <div class="tbt-dist">${this.formatDistance(toEnd)}</div>
           <div class="tbt-instr">${esc(next.text)}</div>
           ${after ? `<div class="tbt-then">${esc(this.t('nav.then', 'Then'))} ${esc(after.text)}</div>` : ''}
         </div>`
      : `<div class="tbt-icon"><i data-lucide="flag"></i></div>
         <div class="tbt-text">
           <div class="tbt-dist">${this.formatDistance(toEnd)}</div>
           <div class="tbt-instr">${esc(this.t('nav.arriveAt', 'Arrive at'))} ${esc(this.ctx.destName)}</div>
         </div>`;

    host.innerHTML = `
      <div class="tbt-banner" role="status" aria-live="polite">${main}</div>
      ${this.rerouting ? `<div class="tbt-reroute">${esc(this.t('nav.rerouting', 'Rerouting.'))}</div>` : ''}
      <div class="tbt-bar">
        <div class="tbt-eta">
          <strong>${minLeft} min</strong>
          <span>${this.formatDistance(this.remainingM)} · ${esc(this.t('nav.arrival', 'Arrive'))} ${esc(arrival)}</span>
        </div>
        <div class="tbt-controls">
          ${this.following ? '' : `<button type="button" class="tbt-btn" onclick="window.publicView.navigator.recenter()" title="${esc(this.t('nav.recenter', 'Recenter'))}"><i data-lucide="locate-fixed"></i></button>`}
          <button type="button" class="tbt-btn${this.voiceOn ? '' : ' is-off'}" onclick="window.publicView.navigator.toggleVoice()" title="${esc(this.t('nav.voice', 'Voice guidance'))}"><i data-lucide="${this.voiceOn ? 'volume-2' : 'volume-x'}"></i></button>
          <button type="button" class="tbt-btn tbt-exit" onclick="window.publicView.navigator.exit()">${esc(this.t('nav.exit', 'Exit'))}</button>
        </div>
      </div>`;
    if (window.lucide) window.lucide.createIcons({ root: host });
  }
}
