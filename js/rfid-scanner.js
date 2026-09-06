/**
 * PawTrack RFID Scanner Hardware Integration & Audio Synthesizer
 */

class RFIDScannerModule {
  constructor() {
    this.audioCtx = null;
    this.isScanning = false;
    this.hardwareConnected = true;
    this.initAudio();
  }

  initAudio() {
    // Audio context on first user interaction
    const unlockAudio = () => {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      document.removeEventListener('click', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
  }

  playBeep(frequency = 2400, type = 'sine', duration = 0.12) {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioCtx = new AudioContext();
      }
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio feedback failed', e);
    }
  }

  playSuccessChirp() {
    this.playBeep(2200, 'sine', 0.08);
    setTimeout(() => {
      this.playBeep(2900, 'sine', 0.12);
    }, 90);
  }

  playErrorBuzz() {
    this.playBeep(320, 'sawtooth', 0.25);
  }

  /**
   * Scan an RFID tag with realistic delay & sound
   */
  async scanTag(rfidTagCode) {
    if (this.isScanning) return;
    this.isScanning = true;

    // Trigger visual scan state
    document.dispatchEvent(new CustomEvent('pawtrack:scan-start', { detail: { rfidTagCode } }));

    // Simulate RFID reader interrogation time (400ms)
    await new Promise(res => setTimeout(res, 450));

    const cleanCode = (rfidTagCode || '').trim().toUpperCase();
    const pet = window.pawStore.getPetByRFID(cleanCode);

    if (pet) {
      this.playSuccessChirp();
      if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
      
      const result = {
        success: true,
        rfidTag: cleanCode,
        pet: pet,
        registered: true,
        timestamp: new Date().toISOString()
      };

      document.dispatchEvent(new CustomEvent('pawtrack:scan-success', { detail: result }));
      this.isScanning = false;
      return result;
    } else {
      this.playErrorBuzz();
      if (navigator.vibrate) navigator.vibrate(150);

      const result = {
        success: true,
        rfidTag: cleanCode,
        pet: null,
        registered: false,
        timestamp: new Date().toISOString()
      };

      document.dispatchEvent(new CustomEvent('pawtrack:scan-unregistered', { detail: result }));
      this.isScanning = false;
      return result;
    }
  }

  /**
   * Scan hardware tag and immediately navigate to owner landing page with Report Pet modal
   */
  scanAndReportTag(rfidTagCode = 'RFID-882194') {
    this.playSuccessChirp();
    const cleanCode = (rfidTagCode || '').trim().toUpperCase();

    if (window.notifManager && typeof window.notifManager.showToast === 'function') {
      window.notifManager.showToast(`Hardware RFID tag [${cleanCode}] scanned! Directing to Report Pet...`, 'success');
    }

    // Direct directly to owner landing page
    window.location.hash = 'owner';

    setTimeout(() => {
      if (window.reportManager) {
        window.reportManager.openReportModal('found', null, { rfidTag: cleanCode });
      }
    }, 200);
  }
}

window.rfidScanner = new RFIDScannerModule();
