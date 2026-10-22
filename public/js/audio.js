/**
 * 8-Bit Retro Sound Synthesizer for Soongsil Open World RPG
 * Authentic GBC/NES Chiptune Audio via Web Audio API (Zero external assets required)
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initialized = false;

    // Restore mute preference
    try {
      const saved = localStorage.getItem('soongsil_audio_muted');
      if (saved !== null) {
        this.muted = saved === 'true';
      }
    } catch (e) {}

    // Unlock AudioContext on first user interaction (browser policy)
    const unlockAudio = () => {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } catch (e) {
      console.warn('[Audio] Web Audio API not supported', e);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem('soongsil_audio_muted', this.muted);
    } catch (e) {}
    this.updateMuteButtonUI();
    return this.muted;
  }

  updateMuteButtonUI() {
    const btn = document.getElementById('btn-toggle-sound');
    if (btn) {
      btn.innerText = this.muted ? '🔇' : '🔊';
      btn.title = this.muted ? '소리 켜기' : '소리 끄기';
    }
  }

  // =========================================================================
  // 8-BIT CHIPTUNE SYNTHESIS HELPERS
  // =========================================================================

  /**
   * Play a clean retro square/triangle pulse note
   */
  playTone(freq, duration, type = 'square', startGain = 0.15, endGain = 0.001) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(startGain, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, endGain), now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  /**
   * 8-Bit Menu Select / Button Tap Blip
   */
  playSelect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  /**
   * Retro Pokemon Dialogue Typewriter Chirp (Soft click)
   */
  playTextBlip() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch (e) {}
  }

  /**
   * 8-Bit Dialogue Open Chime
   */
  playDialogOpen() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [
        { f: 523.25, t: 0 },    // C5
        { f: 659.25, t: 0.05 }, // E5
        { f: 783.99, t: 0.1 }   // G5
      ].forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(n.f, now + n.t);

        gain.gain.setValueAtTime(0.08, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + n.t);
        osc.stop(now + n.t + 0.08);
      });
    } catch (e) {}
  }

  /**
   * Quiz Correct Fanfare! (Bright 8-bit Arpeggio)
   */
  playCorrect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [
        { f: 523.25, t: 0, d: 0.08 },     // C5
        { f: 659.25, t: 0.07, d: 0.08 },  // E5
        { f: 783.99, t: 0.14, d: 0.08 },  // G5
        { f: 1046.50, t: 0.21, d: 0.22 }  // C6
      ];

      notes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(n.f, now + n.t);

        gain.gain.setValueAtTime(0.14, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + n.t);
        osc.stop(now + n.t + n.d);
      });
    } catch (e) {}
  }

  /**
   * Quiz Wrong / Error Buzzer (Low 8-bit Thud)
   */
  playWrong() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.22);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  /**
   * Potion Drink / Gulp Sound (Liquid frequency bend)
   */
  playPotion() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.08].forEach((t, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260 + i * 80, now + t);
        osc.frequency.exponentialRampToValueAtTime(520 + i * 80, now + t + 0.07);

        gain.gain.setValueAtTime(0.12, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + 0.07);
      });
    } catch (e) {}
  }

  /**
   * Crafting Complete / Level Up Fanfare (Triumphant 8-Bit Melody)
   */
  playFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const melody = [
        { f: 523.25, t: 0, d: 0.1 },      // C5
        { f: 523.25, t: 0.1, d: 0.08 },   // C5
        { f: 523.25, t: 0.18, d: 0.08 },  // C5
        { f: 659.25, t: 0.26, d: 0.18 },  // E5
        { f: 783.99, t: 0.44, d: 0.14 },  // G5
        { f: 1046.50, t: 0.58, d: 0.35 }  // C6 (Grand Finale)
      ];

      melody.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(n.f, now + n.t);

        gain.gain.setValueAtTime(0.16, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + n.t);
        osc.stop(now + n.t + n.d);
      });
    } catch (e) {}
  }
}

window.AudioManager = new AudioManager();
