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
  playLevelUp() {
    this.playFanfare();
  }

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

  /**
   * Combat Hit / Damage Sound (Punchy Retro 8-Bit Hit)
   */
  playHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.14);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch (e) {}
  }

  /**
   * Revival / Divine Light Sound (Glittering Chimes)
   */
  playRevive() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const arpeggio = [
        { f: 440.00, t: 0.00, d: 0.12 }, // A4
        { f: 554.37, t: 0.08, d: 0.12 }, // C#5
        { f: 659.25, t: 0.16, d: 0.14 }, // E5
        { f: 880.00, t: 0.24, d: 0.22 }, // A5
        { f: 1108.73, t: 0.32, d: 0.35 }  // C#6
      ];

      arpeggio.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, now + n.t);

        gain.gain.setValueAtTime(0.18, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + n.t);
        osc.stop(now + n.t + n.d);
      });
    } catch (e) {}
  }
  /**
   * Referee Whistle Sound for Brawl Ball (Double Trill: ~2650Hz & 2950Hz)
   */
  /**
   * Spatial Warp / Teleport Sound Effect (Ascending high-speed shimmer)
   */
  playWarp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const warpTones = [
        { f: 380, t: 0.00, d: 0.09 },
        { f: 560, t: 0.06, d: 0.10 },
        { f: 820, t: 0.12, d: 0.12 },
        { f: 1200, t: 0.18, d: 0.20 }
      ];

      warpTones.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        osc.frequency.exponentialRampToValueAtTime(n.f * 1.3, now + n.t + n.d);

        gain.gain.setValueAtTime(0.16, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + n.t);
        osc.stop(now + n.t + n.d);
      });
    } catch (e) {}
  }

  playWhistle() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.16].forEach(offset => {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'square';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(2650, now + offset);
        osc2.frequency.setValueAtTime(2950, now + offset);

        gain.gain.setValueAtTime(0.12, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.13);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now + offset);
        osc2.start(now + offset);
        osc1.stop(now + offset + 0.13);
        osc2.stop(now + offset + 0.13);
      });
    } catch (e) {}
  }

  /**
   * 🦘 Jump sound (rising pitch 160Hz -> 380Hz)
   */
  playJump() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  /**
   * 🔔 Westminster School Bell Chime (Ding-Dong-Dang-Dong)
   */
  playSchoolBell() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [
        { f: 659.25, t: 0.0, d: 0.35 },  // Mi
        { f: 523.25, t: 0.32, d: 0.35 }, // Do
        { f: 587.33, t: 0.64, d: 0.35 }, // Re
        { f: 392.00, t: 0.96, d: 0.65 }  // Sol
      ];
      notes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        gain.gain.setValueAtTime(0.18, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d);
      });
    } catch (e) {}
  }

  /**
   * Soccer Ball Kick / Shoot Sound (Deep Punchy Thump)
   */
  playBallKick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  /**
   * Sliding Tackle Hit / Clash Sound
   */
  /**
   * Super Gauge Ready Jingle
   */
  playSuperReady() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.15);
      });
    } catch (e) {}
  }

  /**
   * Blazing Hyper Super Shot Sound (Explosive Roar & Thunder)
   */
  playSuperShot() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  /**
   * Power-up Drink Pickup Chime
   */
  playPowerup() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [440, 554, 659, 880].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.06);
        gain.gain.setValueAtTime(0.25, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.12);
      });
    } catch (e) {}
  }

  playCollect() {
    this.playPowerup();
  }

  playDeny() {
    this.playWrong();
  }

  /**
   * Play realistic double-honk bus horn sound ("빵! 빵~!")
   */
  playBusHorn() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Dual-tone bus horn: F#4 (370Hz) & A4 (440Hz)
      const playBeep = (startTime, dur) => {
        const freqs = [370, 440];
        freqs.forEach(f => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, startTime);
          gain.gain.setValueAtTime(0.18, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(startTime);
          osc.stop(startTime + dur);
        });
      };
      // Honk 1 (0.13s) -> pause (0.07s) -> Honk 2 (0.22s)
      playBeep(now, 0.13);
      playBeep(now + 0.20, 0.22);
    } catch (e) {}
  }

  /**
   * Play comic electric zap / static shock sound ("⚡ BZZZZT-ZAP!")
   */
  playElectricShock() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';

      // Rapidly fluctuating frequency for comic electric buzzing
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.05);
      osc.frequency.linearRampToValueAtTime(220, now + 0.10);
      osc.frequency.linearRampToValueAtTime(960, now + 0.18);
      osc.frequency.linearRampToValueAtTime(150, now + 0.28);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.30);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.30);
    } catch (e) {}
  }

  playTackleHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  /**
   * Authentic 8-Bit Drum Kit Synthesizer (Rock Drum Beat)
   */
  playDrumBeat() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this._playKick(now);
      this._playSnare(now + 0.16);
      this._playKick(now + 0.32);
      this._playKick(now + 0.40);
      this._playSnare(now + 0.48);
      this._playCymbal(now + 0.48);
    } catch (e) {}
  }

  _playKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.12);
  }

  _playSnare(time) {
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(time);
    noise.stop(time + 0.12);

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.08);
    oscGain.gain.setValueAtTime(0.18, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.08);
  }

  _playCymbal(time) {
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 4500;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(time);
    noise.stop(time + 0.35);
  }

  /**
   * 🐲 Ancient Bronze Dragon Heavy Landing Impact SFX
   */
  playDragonLanding() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(135, now);
      osc.frequency.exponentialRampToValueAtTime(26, now + 0.55);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {}
  }

  /**
   * 🐲 Ancient Bronze Dragon Fierce Roar SFX
   */
  playDragonRoar() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(52, now + 0.78);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.82);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.82);
    } catch (e) {}
  }

  /**
   * 🐲 Ancient Bronze Dragon Flame Breath SFX
   */
  playDragonBreath() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.65);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(620, now);
      filter.frequency.exponentialRampToValueAtTime(180, now + 0.65);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.65);
    } catch (e) {}
  }

  /**
   * 😈 Midterm Exam Archdemon Dark Thunder Impact SFX
   */
  playDemonThunder() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.65);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.68);
    } catch (e) {}
  }

  /**
   * 😈 Midterm Exam Archdemon Red Scoring Spear Slash SFX
   */
  playDemonSlash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.35);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    } catch (e) {}
  }

  /**
   * 🐕 3-Headed Cerberus Triple Roar & Hellfire SFX
   */
  playCerberusRoar() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [190, 240, 145].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + idx * 0.06);
        osc.frequency.exponentialRampToValueAtTime(48, now + 0.65 + idx * 0.06);
        gain.gain.setValueAtTime(0.14, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7 + idx * 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + 0.7 + idx * 0.06);
      });
    } catch (e) {}
  }

  /**
   * 💀 Final Exam Oblivion God: Eerie 4-Note School Bell Chime (딩-동-댕-동—)
   */
  playFinalGodSchoolBell() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [369.99, 293.66, 329.63, 220.0];
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.16;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, t);
        osc2.frequency.setValueAtTime(freq * 2.01, t);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.62);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.65);
        osc2.stop(t + 0.65);
      });
    } catch (e) {}
  }

  /**
   * 💀 Final Exam Oblivion God: Spatial Glass-Shatter Rift + OMR Optical Scanner Sweep
   */
  playFinalGodRiftAndScan() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // 1. Glass shatter noise burst
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.42);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.14));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.35, now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      noise.connect(filter);
      filter.connect(ng);
      ng.connect(this.ctx.destination);
      noise.start(now);

      // 2. OMR Optical Scanner electronic sweep
      const scanOsc = this.ctx.createOscillator();
      const scanG = this.ctx.createGain();
      scanOsc.type = 'sawtooth';
      scanOsc.frequency.setValueAtTime(620, now + 0.12);
      scanOsc.frequency.linearRampToValueAtTime(180, now + 0.92);
      scanG.gain.setValueAtTime(0.16, now + 0.12);
      scanG.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
      scanOsc.connect(scanG);
      scanG.connect(this.ctx.destination);
      scanOsc.start(now + 0.12);
      scanOsc.stop(now + 0.95);
    } catch (e) {}
  }

  /**
   * 💀 Final Exam Oblivion God: Screen-Splitting Dimension Slash + Giant 'F' Seal Stamp
   */
  playFinalGodDimensionSlash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // 1. Razor-sharp spatial slice
      const slice = this.ctx.createOscillator();
      const sg = this.ctx.createGain();
      slice.type = 'sawtooth';
      slice.frequency.setValueAtTime(1600, now + 0.10);
      slice.frequency.exponentialRampToValueAtTime(65, now + 0.44);
      sg.gain.setValueAtTime(0.26, now + 0.10);
      sg.gain.exponentialRampToValueAtTime(0.001, now + 0.46);
      slice.connect(sg);
      sg.connect(this.ctx.destination);
      slice.start(now + 0.10);
      slice.stop(now + 0.46);

      // 2. Heavy '[F · 파멸]' Stamp impact
      const stamp = this.ctx.createOscillator();
      const stg = this.ctx.createGain();
      stamp.type = 'sine';
      stamp.frequency.setValueAtTime(135, now + 0.48);
      stamp.frequency.exponentialRampToValueAtTime(28, now + 0.88);
      stg.gain.setValueAtTime(0.42, now + 0.48);
      stg.gain.exponentialRampToValueAtTime(0.001, now + 0.90);
      stamp.connect(stg);
      stg.connect(this.ctx.destination);
      stamp.start(now + 0.48);
      stamp.stop(now + 0.90);
    } catch (e) {}
  }

  /**
   * 🦥 Sloth Titan (Season 1 Final Boss): 07:50 School Alarm Ring + Giant Hand Smash
   */
  playSlothAlarmAndSmash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < 6; i++) {
        const t = now + i * 0.07;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(i % 2 === 0 ? 1180 : 1480, t);
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.008, t + 0.06);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.065);
      }

      const smash = this.ctx.createOscillator();
      const sg = this.ctx.createGain();
      smash.type = 'sawtooth';
      smash.frequency.setValueAtTime(180, now + 0.48);
      smash.frequency.exponentialRampToValueAtTime(32, now + 0.85);
      sg.gain.setValueAtTime(0.35, now + 0.48);
      sg.gain.exponentialRampToValueAtTime(0.001, now + 0.88);
      smash.connect(sg);
      sg.connect(this.ctx.destination);
      smash.start(now + 0.48);
      smash.stop(now + 0.88);
    } catch (e) {}
  }

  /**
   * 🦥 Sloth Titan: Waterpark Tsunami Wave Sweep + Mega Cannonball Splash
   */
  playSlothTsunamiAndSplash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 1.0);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.5);
      filter.frequency.exponentialRampToValueAtTime(260, now + 1.0);
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.32, now);
      ng.gain.exponentialRampToValueAtTime(0.008, now + 1.0);
      noise.connect(filter);
      filter.connect(ng);
      ng.connect(this.ctx.destination);
      noise.start(now);

      [140, 220, 330, 440, 660].forEach((freq, idx) => {
        const t = now + 0.22 + idx * 0.05;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 0.6, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.4, t + 0.22);
        g.gain.setValueAtTime(0.16, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.26);
      });
    } catch (e) {}
  }

  /**
   * 🦥 Sloth Titan: Drowsy Yawn + Dopamine Shorts Prism Beam + Golden Tube Slam
   */
  playSlothHypnosisAndDopamine() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const yawn = this.ctx.createOscillator();
      const yg = this.ctx.createGain();
      yawn.type = 'triangle';
      yawn.frequency.setValueAtTime(420, now);
      yawn.frequency.exponentialRampToValueAtTime(130, now + 0.45);
      yg.gain.setValueAtTime(0.24, now);
      yg.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      yawn.connect(yg);
      yg.connect(this.ctx.destination);
      yawn.start(now);
      yawn.stop(now + 0.48);

      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((f, idx) => {
        const t = now + 0.32 + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.28);
      });

      const boing = this.ctx.createOscillator();
      const bg = this.ctx.createGain();
      boing.type = 'sine';
      boing.frequency.setValueAtTime(95, now + 0.60);
      boing.frequency.exponentialRampToValueAtTime(280, now + 0.80);
      boing.frequency.exponentialRampToValueAtTime(140, now + 1.02);
      bg.gain.setValueAtTime(0.34, now + 0.60);
      bg.gain.exponentialRampToValueAtTime(0.001, now + 1.05);
      boing.connect(bg);
      bg.connect(this.ctx.destination);
      boing.start(now + 0.60);
      boing.stop(now + 1.05);
    } catch (e) {}
  }

  /**
   * 🎆 Season 1 Grand Finale: Fireworks Fanfare & Confetti Celebration
   */
  playSlothGrandFinale() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // 1. Victory Fanfare Arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((f, idx) => {
        const t = now + idx * 0.085;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.22, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.52);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.54);
      });

      // 2. Periodic Firework Cracker Pops
      [0.2, 0.45, 0.75, 1.05, 1.4].forEach((delay) => {
        const pt = now + delay;
        const pop = this.ctx.createOscillator();
        const pg = this.ctx.createGain();
        pop.type = 'sawtooth';
        pop.frequency.setValueAtTime(440, pt);
        pop.frequency.exponentialRampToValueAtTime(60, pt + 0.16);
        pg.gain.setValueAtTime(0.24, pt);
        pg.gain.exponentialRampToValueAtTime(0.001, pt + 0.18);
        pop.connect(pg);
        pg.connect(this.ctx.destination);
        pop.start(pt);
        pop.stop(pt + 0.19);
      });
    } catch (e) {}
  }
}

window.AudioManager = new AudioManager();
