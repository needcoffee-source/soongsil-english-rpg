/**
 * Acid Rain English Word Defense Game (산성비 타자 게임)
 * - 1학년 3반 영어 타자 컴퓨터실 전용 게이미피케이션 콘텐츠
 * - 천재교육(이재영) 1학년 1~5단원 교과서 필수 어휘 기반
 * - 영단어 타이핑 연습 + 어휘 한글 뜻 즉시 매칭
 */

class AcidRainGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.modal = null;
    this.inputEl = null;

    this.isRunning = false;
    this.isPaused = false;
    this.animationId = null;

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.wordsCleared = 0;
    this.lives = 5;
    this.maxLives = 5;
    this.bombs = 1;
    this.level = 1;
    this.difficulty = 'easy'; // easy, normal, hard

    this.fallingWords = [];
    this.particles = [];
    this.lastSpawnTime = 0;
    this.spawnInterval = 2200; // ms between drops
    this.baseSpeed = 0.8; // px per frame

    // 1학년 단원별 필수 어휘 데이터베이스 (총 120개 이상)
    this.wordBank = {
      easy: [
        // 1단원 & 기초 단어 (3~5글자)
        { en: 'name', ko: '이름' },
        { en: 'cat', ko: '고양이' },
        { en: 'dog', ko: '개' },
        { en: 'sun', ko: '태양' },
        { en: 'book', ko: '책' },
        { en: 'desk', ko: '책상' },
        { en: 'tree', ko: '나무' },
        { en: 'walk', ko: '걷다' },
        { en: 'love', ko: '사랑하다' },
        { en: 'like', ko: '좋아하다' },
        { en: 'sing', ko: '노래하다' },
        { en: 'game', ko: '게임' },
        { en: 'food', ko: '음식' },
        { en: 'good', ko: '좋은' },
        { en: 'help', ko: '돕다' },
        { en: 'time', ko: '시간' },
        { en: 'look', ko: '보다' },
        { en: 'play', ko: '놀다/경기하다' },
        { en: 'star', ko: '별' },
        { en: 'blue', ko: '파란색' },
        { en: 'pink', ko: '분홍색' },
        { en: 'song', ko: '노래' },
        { en: 'bird', ko: '새' },
        { en: 'room', ko: '방/교실' },
        { en: 'open', ko: '열다' },
        { en: 'door', ko: '문' },
        { en: 'warm', ko: '따뜻한' },
        { en: 'cool', ko: '시원한/멋진' },
        { en: 'fast', ko: '빠른' },
        { en: 'jump', ko: '뛰다' }
      ],
      normal: [
        // 2~3단원 학교 및 환경 단어 (5~7글자)
        { en: 'sweet', ko: '달콤한' },
        { en: 'smile', ko: '미소 짓다' },
        { en: 'happy', ko: '행복한' },
        { en: 'sport', ko: '운동' },
        { en: 'music', ko: '음악' },
        { en: 'hobby', ko: '취미' },
        { en: 'candy', ko: '사탕' },
        { en: 'green', ko: '녹색의' },
        { en: 'earth', ko: '지구' },
        { en: 'water', ko: '물' },
        { en: 'plant', ko: '식물' },
        { en: 'clean', ko: '깨끗한' },
        { en: 'paper', ko: '종이' },
        { en: 'glass', ko: '유리' },
        { en: 'lunch', ko: '점심 식사' },
        { en: 'class', ko: '수업/반' },
        { en: 'clock', ko: '시계' },
        { en: 'chair', ko: '의자' },
        { en: 'pencil', ko: '연필' },
        { en: 'friend', ko: '친구' },
        { en: 'school', ko: '학교' },
        { en: 'family', ko: '가족' },
        { en: 'player', ko: '선수' },
        { en: 'winter', ko: '겨울' },
        { en: 'spring', ko: '봄' },
        { en: 'summer', ko: '여름' },
        { en: 'autumn', ko: '가을' },
        { en: 'flower', ko: '꽃' },
        { en: 'nature', ko: '자연' },
        { en: 'bottle', ko: '병' },
        { en: 'energy', ko: '에너지' },
        { en: 'listen', ko: '듣다' },
        { en: 'story', ko: '이야기' },
        { en: 'golden', ko: '황금빛의' }
      ],
      hard: [
        // 4~5단원 속담/지혜 및 문화/스포츠 긴 단어 (7글자 이상)
        { en: 'special', ko: '특별한' },
        { en: 'favorite', ko: '가장 좋아하는' },
        { en: 'library', ko: '도서관' },
        { en: 'hallway', ko: '복도' },
        { en: 'teacher', ko: '선생님' },
        { en: 'student', ko: '학생' },
        { en: 'recycle', ko: '재활용하다' },
        { en: 'protect', ko: '보호하다' },
        { en: 'together', ko: '함께' },
        { en: 'practice', ko: '연습하다' },
        { en: 'morning', ko: '아침' },
        { en: 'english', ko: '영어' },
        { en: 'delicious', ko: '맛있는' },
        { en: 'wonderful', ko: '멋진/훌륭한' },
        { en: 'soongsil', ko: '숭실' },
        { en: 'basketball', ko: '농구' },
        { en: 'traditional', ko: '전통적인' },
        { en: 'forsythia', ko: '개나리(교화)' },
        { en: 'ginkgo', ko: '은행나무(교목)' },
        { en: 'adventure', ko: '모험' },
        { en: 'champion', ko: '챔피언' },
        { en: 'remember', ko: '기억하다' },
        { en: 'important', ko: '중요한' },
        { en: 'introduce', ko: '소개하다' },
        { en: 'exercise', ko: '운동/연습' },
        { en: 'knowledge', ko: '지식' },
        { en: 'beautiful', ko: '아름다운' },
        { en: 'classroom', ko: '교실' }
      ]
    };

    // DOM Binding
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initDOM());
    } else {
      this.initDOM();
    }
  }

  initDOM() {
    this.modal = document.getElementById('modal-acid-rain');
    this.canvas = document.getElementById('acid-rain-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
    this.inputEl = document.getElementById('acid-rain-input');

    const btnCloseX = document.getElementById('btn-close-acid-rain-x');
    if (btnCloseX) btnCloseX.addEventListener('click', () => this.close());

    const btnStart = document.getElementById('btn-ar-start');
    if (btnStart) btnStart.addEventListener('click', () => this.start());

    const btnRetry = document.getElementById('btn-ar-retry');
    if (btnRetry) btnRetry.addEventListener('click', () => this.start());

    const btnExit = document.getElementById('btn-ar-exit');
    if (btnExit) btnExit.addEventListener('click', () => this.close());

    const btnBomb = document.getElementById('btn-ar-bomb');
    if (btnBomb) btnBomb.addEventListener('click', () => this.useBomb());

    const btnSubmit = document.getElementById('btn-ar-submit');
    if (btnSubmit) btnSubmit.addEventListener('click', () => this.handleInput());

    if (this.inputEl) {
      this.inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleInput();
        }
      });
    }

    // Canvas size fix on resize
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    }
  }

  open() {
    if (!this.modal) return;
    this.modal.classList.remove('hidden');
    this.resizeCanvas();

    // Show Start Overlay
    const overlayStart = document.getElementById('ar-overlay-start');
    const overlayOver = document.getElementById('ar-overlay-gameover');
    if (overlayStart) overlayStart.classList.remove('hidden');
    if (overlayOver) overlayOver.classList.add('hidden');

    this.resetStats();
    this.renderInitialScreen();
  }

  close() {
    this.stop();
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }

  resetStats() {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.wordsCleared = 0;
    this.lives = this.maxLives;
    this.bombs = 1;
    this.level = 1;
    this.fallingWords = [];
    this.particles = [];
    this.updateUI();
  }

  start() {
    // Read chosen difficulty
    const diffRadios = document.querySelectorAll('input[name="ar-diff"]');
    for (const r of diffRadios) {
      if (r.checked) {
        this.difficulty = r.value;
        break;
      }
    }

    if (this.difficulty === 'easy') {
      this.spawnInterval = 2300;
      this.baseSpeed = 0.85;
    } else if (this.difficulty === 'normal') {
      this.spawnInterval = 1850;
      this.baseSpeed = 1.15;
    } else {
      this.spawnInterval = 1500;
      this.baseSpeed = 1.45;
    }

    this.resetStats();
    this.isRunning = true;
    this.isPaused = false;
    this.lastSpawnTime = Date.now();

    const overlayStart = document.getElementById('ar-overlay-start');
    const overlayOver = document.getElementById('ar-overlay-gameover');
    if (overlayStart) overlayStart.classList.add('hidden');
    if (overlayOver) overlayOver.classList.add('hidden');

    if (this.inputEl) {
      this.inputEl.value = '';
      setTimeout(() => this.inputEl.focus(), 80);
    }

    if (window.AudioManager) {
      window.AudioManager.playSelect();
    }

    this.resizeCanvas();
    this.lastFrameTime = performance.now();
    cancelAnimationFrame(this.animationId);
    this.loop();
  }

  stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationId);
  }

  getWordPool() {
    if (this.difficulty === 'easy') {
      return this.wordBank.easy;
    } else if (this.difficulty === 'normal') {
      return [...this.wordBank.easy, ...this.wordBank.normal];
    } else {
      return [...this.wordBank.easy, ...this.wordBank.normal, ...this.wordBank.hard];
    }
  }

  spawnWord() {
    const pool = this.getWordPool();
    const item = pool[Math.floor(Math.random() * pool.length)];

    // Prevent duplicate words on screen
    if (this.fallingWords.some(w => w.en.toLowerCase() === item.en.toLowerCase())) {
      return;
    }

    const cW = this.canvas.width || 700;
    const padding = 70;
    const spawnX = padding + Math.random() * (cW - padding * 2);

    // Random slight speed variance
    const speed = this.baseSpeed * (0.88 + Math.random() * 0.25) * (1 + (this.level - 1) * 0.08);

    this.fallingWords.push({
      en: item.en,
      ko: item.ko,
      x: spawnX,
      y: -20,
      speed: speed,
      color: this.getWordColor(item.en.length),
      alpha: 1
    });
  }

  getWordColor(len) {
    if (len <= 4) return '#38bdf8'; // Sky blue
    if (len <= 6) return '#a78bfa'; // Purple
    return '#f43f5e'; // Rose gold
  }

  loop() {
    if (!this.isRunning) return;

    this.update();
    this.render();

    this.animationId = requestAnimationFrame(() => this.loop());
  }

  update() {
    const now = Date.now();

    // Spawning words
    if (now - this.lastSpawnTime >= this.spawnInterval) {
      this.spawnWord();
      this.lastSpawnTime = now;
    }

    // Dynamic Level Up based on score
    const newLevel = Math.min(8, Math.floor(this.score / 600) + 1);
    if (newLevel !== this.level) {
      this.level = newLevel;
      this.spawnInterval = Math.max(900, this.spawnInterval * 0.92);
      this.baseSpeed *= 1.05;
      if (window.AudioManager) {
        if (typeof window.AudioManager.playLevelUp === 'function') window.AudioManager.playLevelUp();
        else if (typeof window.AudioManager.playFanfare === 'function') window.AudioManager.playFanfare();
      }
    }

    const cH = this.canvas.height || 380;
    const defenseLineY = cH - 35;

    // Move falling words
    for (let i = this.fallingWords.length - 1; i >= 0; i--) {
      const w = this.fallingWords[i];
      w.y += w.speed;

      // Reached defense baseline (Acid hit)
      if (w.y >= defenseLineY) {
        this.createAcidImpactParticles(w.x, defenseLineY);
        this.fallingWords.splice(i, 1);
        this.onWordHitGround();
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  onWordHitGround() {
    this.lives--;
    this.combo = 0;
    this.updateUI();

    if (window.AudioManager) {
      window.AudioManager.playWrong();
    }

    // Screen Shake effect
    this.shakeTimer = 8;

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  handleInput() {
    if (!this.isRunning || !this.inputEl) return;
    const rawVal = this.inputEl.value.trim().toLowerCase();
    this.inputEl.value = '';

    if (!rawVal) return;

    // Search for match in falling words (prefer closest to bottom)
    let matchIdx = -1;
    let maxY = -999;

    for (let i = 0; i < this.fallingWords.length; i++) {
      const w = this.fallingWords[i];
      if (w.en.toLowerCase() === rawVal) {
        if (w.y > maxY) {
          maxY = w.y;
          matchIdx = i;
        }
      }
    }

    if (matchIdx !== -1) {
      const target = this.fallingWords[matchIdx];
      this.createExplosionParticles(target.x, target.y, target.color);
      this.fallingWords.splice(matchIdx, 1);

      // Scoring & Combo
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      this.wordsCleared++;

      const comboMultiplier = Math.min(3.5, 1 + (this.combo - 1) * 0.15);
      const wordScore = Math.round(target.en.length * 15 * comboMultiplier);
      this.score += wordScore;

      if (window.AudioManager) {
        window.AudioManager.playCorrect();
      }

      this.updateUI();
    } else {
      // Missed typing
      if (this.combo > 0) {
        this.combo = 0;
        this.updateUI();
      }
    }
  }

  useBomb() {
    if (!this.isRunning || this.bombs <= 0 || this.fallingWords.length === 0) return;
    this.bombs--;

    for (const w of this.fallingWords) {
      this.createExplosionParticles(w.x, w.y, '#f59e0b');
      this.score += w.en.length * 10;
      this.wordsCleared++;
    }
    this.fallingWords = [];

    if (window.AudioManager) {
      window.AudioManager.playSelect();
    }

    this.updateUI();
  }

  createExplosionParticles(x, y, color) {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 2.5,
        color: color,
        alpha: 1,
        decay: 0.03 + Math.random() * 0.02
      });
    }
  }

  createAcidImpactParticles(x, y) {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = Math.PI + Math.random() * Math.PI; // upward spray
      const speed = 1.2 + Math.random() * 3;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 2,
        color: '#ef4444',
        alpha: 1,
        decay: 0.04
      });
    }
  }

  gameOver() {
    this.stop();

    // Reward Calculation
    let rewardGold = Math.min(250, Math.floor(this.score / 25) + this.wordsCleared * 2);
    let rewardExp = Math.min(400, Math.floor(this.score / 15) + this.wordsCleared * 4);

    if (this.score >= 3000) {
      rewardGold += 50;
      rewardExp += 80;
    }

    // Grant rewards to MainApp
    if (window.MainApp) {
      if (rewardGold > 0) window.MainApp.addGold(rewardGold);
      if (rewardExp > 0) window.MainApp.addExp(rewardExp);
    }

    // Show Game Over Overlay
    const overlayOver = document.getElementById('ar-overlay-gameover');
    if (overlayOver) {
      overlayOver.classList.remove('hidden');

      const titleEl = document.getElementById('ar-result-title');
      const iconEl = document.getElementById('ar-result-icon');
      if (this.score >= 2500) {
        if (titleEl) {
          titleEl.innerText = '🎉 방어전 완료 (타자 마스터!)';
          titleEl.style.color = '#38bdf8';
        }
        if (iconEl) iconEl.innerText = '🏆';
      } else {
        if (titleEl) {
          titleEl.innerText = '💥 방어 실패 (Defense Failed)';
          titleEl.style.color = '#f87171';
        }
        if (iconEl) iconEl.innerText = '💥';
      }

      const resScore = document.getElementById('ar-res-score');
      if (resScore) resScore.innerText = this.score.toLocaleString();

      const resWords = document.getElementById('ar-res-words');
      if (resWords) resWords.innerText = this.wordsCleared;

      const resCombo = document.getElementById('ar-res-combo');
      if (resCombo) resCombo.innerText = this.maxCombo;

      const resReward = document.getElementById('ar-res-reward');
      if (resReward) resReward.innerText = `🪙 +${rewardGold}G, 🌟 +${rewardExp} EXP`;
    }
  }

  updateUI() {
    const elScore = document.getElementById('ar-score');
    if (elScore) elScore.innerText = this.score.toLocaleString();

    const elCombo = document.getElementById('ar-combo');
    if (elCombo) elCombo.innerText = this.combo;

    const elLevel = document.getElementById('ar-level');
    if (elLevel) elLevel.innerText = `Lv.${this.level}`;

    const elLives = document.getElementById('ar-lives');
    if (elLives) {
      let hearts = '';
      for (let i = 0; i < this.maxLives; i++) {
        hearts += (i < this.lives) ? '💖' : '🖤';
      }
      elLives.innerText = hearts;
    }

    const elBomb = document.getElementById('btn-ar-bomb');
    if (elBomb) {
      elBomb.innerText = `💣 폭탄 (${this.bombs}/1)`;
      elBomb.disabled = (this.bombs <= 0);
      elBomb.style.opacity = (this.bombs > 0) ? '1' : '0.4';
    }
  }

  renderInitialScreen() {
    if (!this.ctx || !this.canvas) return;
    const cW = this.canvas.width;
    const cH = this.canvas.height;
    this.ctx.fillStyle = '#030712';
    this.ctx.fillRect(0, 0, cW, cH);
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const cW = this.canvas.width;
    const cH = this.canvas.height;

    this.ctx.save();

    // Screen Shake on hit
    if (this.shakeTimer && this.shakeTimer > 0) {
      const sx = (Math.random() - 0.5) * 8;
      const sy = (Math.random() - 0.5) * 8;
      this.ctx.translate(sx, sy);
      this.shakeTimer--;
    }

    // 1. Cyber Dark Background with Digital Grid
    this.ctx.fillStyle = '#030712';
    this.ctx.fillRect(0, 0, cW, cH);

    // Subtle Digital Grid Lines
    this.ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < cW; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, cH);
      this.ctx.stroke();
    }
    for (let y = 0; y < cH; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(cW, y);
      this.ctx.stroke();
    }

    // 2. Chemical Defense Baseline (Bottom)
    const defY = cH - 35;
    this.ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    this.ctx.fillRect(0, defY, cW, 35);

    // Glowing Neon Baseline
    this.ctx.strokeStyle = (this.lives <= 1) ? '#ef4444' : '#38bdf8';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(0, defY);
    this.ctx.lineTo(cW, defY);
    this.ctx.stroke();

    // Defense Line Label
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = 'bold 11px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('⚡ 숭실 컴퓨터실 단어 방화벽 (DEFENSE LINE) ⚡', cW / 2, defY + 22);

    // 3. Falling Word Capsules
    for (const w of this.fallingWords) {
      this.renderWordCapsule(w);
    }

    // 4. Explosion Particles
    for (const p of this.particles) {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;

    this.ctx.restore();
  }

  renderWordCapsule(w) {
    const enText = w.en;
    const koText = w.ko;

    this.ctx.font = 'bold 16px monospace';
    const enWidth = this.ctx.measureText(enText).width;
    this.ctx.font = '11px sans-serif';
    const koWidth = this.ctx.measureText(koText).width;

    const boxWidth = Math.max(enWidth, koWidth) + 24;
    const boxHeight = 40;
    const boxX = w.x - boxWidth / 2;
    const boxY = w.y - boxHeight / 2;

    // Glowing Acid Droplet Line behind capsule
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(w.x, 0);
    this.ctx.lineTo(w.x, boxY);
    this.ctx.stroke();

    // Capsule Card Background
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    // Glowing Border
    this.ctx.strokeStyle = w.color;
    this.ctx.lineWidth = 1.8;
    this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // English Text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 15px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(enText, w.x, boxY + 18);

    // Korean Meaning Subtext
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = '10.5px sans-serif';
    this.ctx.fillText(koText, w.x, boxY + 33);
  }
}

// Global Export
window.AcidRain = new AcidRainGame();
