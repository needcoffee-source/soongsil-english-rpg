/**
 * 🏃 숭실 언덕길 등교 챌린지 (Soongsil Uphill Sprint Mini-Game)
 * - 숭실중학교 정문 오른쪽 급경사 언덕길 등교 챌린지 미니게임
 * - 위에서 쏟아지는 장애물(축구공, 농구공, 드럼통, 바나나)을 피하고 부스터 패드를 밟으며 꼭대기(500m)까지 최속 질주!
 * - 타블렛(Galaxy Tab S7 FE) 터치 버튼 및 키보드(방향키/WASD/Space) 완벽 지원
 */

class UphillRushGame {
  constructor() {
    this.modal = null;
    this.canvas = null;
    this.ctx = null;
    this.timerEl = null;
    this.distEl = null;
    this.heartsEl = null;
    this.overlayEl = null;

    this.isRunning = false;
    this.isPaused = false;
    this.animFrameId = null;

    // Game stats
    this.totalDistance = 500; // 500 meters
    this.traveled = 0;
    this.startTime = 0;
    this.elapsedMs = 0;
    this.hearts = 3;
    this.maxHearts = 3;

    // Player state
    this.playerX = 240;
    this.playerY = 430;
    this.playerW = 24;
    this.playerH = 30;
    this.baseSpeed = 3.8;
    this.currentSpeed = 3.8;
    this.isBoosting = false;
    this.megaBoostUntil = 0;
    this.invincibleUntil = 0;
    this.shakeTimer = 0;

    // Road definition
    this.roadLeft = 60;
    this.roadRight = 420;
    this.roadWidth = 360;
    this.roadScroll = 0;

    // Objects & Effects
    this.obstacles = [];
    this.particles = [];
    this.confetti = [];
    this.speedLines = [];
    this.lastSpawnTime = 0;

    // Controls
    this.keys = { left: false, right: false, up: false, down: false, boost: false };

    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initDOM());
      } else {
        this.initDOM();
      }
    }
  }

  initDOM() {
    this.modal = document.getElementById('modal-uphill-rush');
    this.canvas = document.getElementById('canvas-uphill');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
    this.timerEl = document.getElementById('uphill-timer');
    this.distEl = document.getElementById('uphill-dist');
    this.heartsEl = document.getElementById('uphill-hearts');
    this.overlayEl = document.getElementById('uphill-overlay');

    const btnClose = document.getElementById('btn-close-uphill');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.close());
    }

    // Touch controls
    const btnLeft = document.getElementById('btn-uphill-left');
    const btnRight = document.getElementById('btn-uphill-right');
    const btnBoost = document.getElementById('btn-uphill-boost');

    const bindTouch = (btn, key) => {
      if (!btn) return;
      const start = (e) => { e.preventDefault(); this.keys[key] = true; };
      const end = (e) => { e.preventDefault(); this.keys[key] = false; };
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('mouseleave', end);
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
    };

    bindTouch(btnLeft, 'left');
    bindTouch(btnRight, 'right');
    bindTouch(btnBoost, 'boost');

    // Global keyboard listener
    window.addEventListener('keydown', (e) => {
      if (!this.modal || this.modal.classList.contains('hidden')) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.keys.left = true;
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keys.right = true;
        e.preventDefault();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        this.keys.boost = true;
        e.preventDefault();
      } else if (e.key === ' ' || e.key === 'Shift') {
        this.keys.boost = true;
        e.preventDefault();
      } else if (e.key === 'Escape') {
        this.close();
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!this.modal || this.modal.classList.contains('hidden')) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.keys.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keys.right = false;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ' || e.key === 'Shift') {
        this.keys.boost = false;
      }
    });
  }

  open() {
    if (!this.modal) this.initDOM();
    if (!this.modal) return;

    this.modal.classList.remove('hidden');
    this.reset();
    this.showReadyScreen();
  }

  close() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }

  reset() {
    this.traveled = 0;
    this.elapsedMs = 0;
    this.hearts = this.maxHearts;
    this.playerX = 240;
    this.playerY = 430;
    this.currentSpeed = this.baseSpeed;
    this.megaBoostUntil = 0;
    this.invincibleUntil = 0;
    this.shakeTimer = 0;
    this.obstacles = [];
    this.particles = [];
    this.confetti = [];
    this.speedLines = [];
    this.lastSpawnTime = 0;
    this.keys.left = false;
    this.keys.right = false;
    this.keys.boost = false;

    this.updateHUD();
  }

  updateHUD() {
    if (this.timerEl) {
      const sec = (this.elapsedMs / 1000).toFixed(2);
      this.timerEl.innerText = `${sec}초`;
    }
    if (this.distEl) {
      const dist = Math.max(0, this.totalDistance - Math.floor(this.traveled));
      this.distEl.innerText = `${dist}m`;
    }
    if (this.heartsEl) {
      let heartStr = '';
      for (let i = 0; i < this.maxHearts; i++) {
        heartStr += (i < this.hearts) ? '❤️' : '🤍';
      }
      this.heartsEl.innerText = heartStr;
    }
  }

  showReadyScreen() {
    if (!this.overlayEl) return;
    this.overlayEl.classList.remove('hidden');

    const app = (typeof window !== 'undefined') ? window.MainApp : null;
    const bestMs = (app && app.playerData && app.playerData.uphillBestTime) ? app.playerData.uphillBestTime : null;
    const bestStr = bestMs ? `${(bestMs / 1000).toFixed(2)}초` : '기록 없음';

    this.overlayEl.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.95); border: 2.5px solid #f59e0b; border-radius: 14px; padding: 22px 20px; max-width: 420px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
        <div style="font-size: 32px; margin-bottom: 4px;">🏃‍♂️💨</div>
        <h2 style="margin: 0 0 6px; color: #fef08a; font-size: 20px; font-weight: 900;">숭실 언덕길 등교 챌린지</h2>
        <p style="font-size: 13px; color: #cbd5e1; margin: 0 0 14px; line-height: 1.5;">
          위에서 굴러떨어지는 <b>축구공, 농구공, 드럼통, 바나나</b>를 피하고<br>
          도로 위 <b>초록빛 부스터 패드</b>를 밟으며 정상(500m)까지 전력 질주하세요!
        </p>

        <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #475569; border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; font-size: 12.5px; text-align: left;">
          <div style="color: #38bdf8; font-weight: 800; margin-bottom: 4px;">🎮 조작 안내:</div>
          <div style="color: #e2e8f0;">• <b>[← →] / [A D]</b>: 좌우 차선 이동</div>
          <div style="color: #e2e8f0;">• <b>[↑] / [W] / [Space]</b>: 부스트 전력 질주</div>
          <div style="color: #fbbf24; margin-top: 6px;">🏆 내 최고 기록: <b>${bestStr}</b></div>
          <div style="color: #a7f3d0;">🏅 S랭크 기준: <b>23.00초 미만 (칭호 해금!)</b></div>
        </div>

        <button id="btn-start-uphill" style="width: 100%; padding: 12px; font-size: 16px; font-weight: 900; background: linear-gradient(135deg, #f59e0b, #d97706); border: 2px solid #fbbf24; border-radius: 10px; color: #fff; cursor: pointer; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);">
          ▶ 챌린지 시작!
        </button>
      </div>
    `;

    const btnStart = document.getElementById('btn-start-uphill');
    if (btnStart) {
      btnStart.addEventListener('click', () => this.startCountdown());
    }
  }

  startCountdown() {
    if (!this.overlayEl) return;

    let count = 3;
    this.overlayEl.innerHTML = `
      <div id="uphill-count-num" style="font-size: 80px; font-weight: 900; color: #fef08a; text-shadow: 0 0 20px #f59e0b; animation: pulse 0.5s;">${count}</div>
      <div style="font-size: 18px; color: #fff; font-weight: 800; margin-top: 10px;">준비하시고...</div>
    `;

    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }

    const timer = setInterval(() => {
      count--;
      const numEl = document.getElementById('uphill-count-num');
      if (count > 0) {
        if (numEl) numEl.innerText = count;
        if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
          window.AudioManager.playSelect();
        }
      } else if (count === 0) {
        if (numEl) {
          numEl.innerText = 'START!! 🏃';
          numEl.style.color = '#4ade80';
        }
        if (window.AudioManager && typeof window.AudioManager.playWhistle === 'function') {
          window.AudioManager.playWhistle();
        }
      } else {
        clearInterval(timer);
        this.overlayEl.classList.add('hidden');
        this.startGame();
      }
    }, 750);
  }

  startGame() {
    this.reset();
    this.isRunning = true;
    this.startTime = Date.now();
    this.lastFrameTime = performance.now();
    this.loop();
  }

  loop(currentTime = performance.now()) {
    if (!this.isRunning) return;

    const dt = Math.min((currentTime - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = currentTime;

    this.update(dt);
    this.render();

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.elapsedMs = Date.now() - this.startTime;

    const isMega = Date.now() < this.megaBoostUntil;
    let targetSpeed = this.baseSpeed;

    if (isMega) {
      targetSpeed = 8.5; // Super Booster Speed
    } else if (this.keys.boost) {
      targetSpeed = 6.0; // Normal Running Boost
    }

    this.currentSpeed += (targetSpeed - this.currentSpeed) * 0.15;
    this.traveled += this.currentSpeed * dt * 28;

    this.roadScroll += this.currentSpeed * 4;

    // Player horizontal steering
    const steerSpeed = 260 * dt;
    if (this.keys.left) {
      this.playerX -= steerSpeed;
    }
    if (this.keys.right) {
      this.playerX += steerSpeed;
    }

    // Keep on road boundaries
    const minX = this.roadLeft + 16;
    const maxX = this.roadRight - 16;
    this.playerX = Math.max(minX, Math.min(maxX, this.playerX));

    // Spawn dust particles while running
    if (Math.random() < 0.4) {
      this.particles.push({
        x: this.playerX + (Math.random() * 10 - 5),
        y: this.playerY + 16,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() * 2 + 1),
        radius: Math.random() * 2.5 + 1.5,
        alpha: 0.6,
        color: isMega ? '#38bdf8' : (this.keys.boost ? '#f59e0b' : '#cbd5e1')
      });
    }

    // Spawn obstacles from top
    const now = Date.now();
    const spawnInterval = Math.max(550, 900 - Math.floor(this.traveled / 10) * 8);
    if (now - this.lastSpawnTime > spawnInterval) {
      this.lastSpawnTime = now;
      this.spawnObstacle();
    }

    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      // Obstacles roll down towards player: their own downhill speed + the relative road scroll speed
      obs.y += (obs.speed + this.currentSpeed * 2.2) * (dt * 60);

      // Sine wave zigzag for soccer balls
      if (obs.type === 'soccer') {
        obs.x += Math.sin((obs.y + obs.seed) * 0.05) * 2.2;
      }

      // Check collision with player
      const dx = Math.abs(obs.x - this.playerX);
      const dy = Math.abs(obs.y - this.playerY);
      const hitRadius = (obs.radius || 14) + 10;

      if (dx < hitRadius && dy < hitRadius) {
        if (obs.type === 'booster') {
          // Beneficial speed pad
          this.megaBoostUntil = Date.now() + 2600;
          if (window.AudioManager && typeof window.AudioManager.playPowerup === 'function') {
            window.AudioManager.playPowerup();
          }
          this.obstacles.splice(i, 1);
          continue;
        } else {
          // Harmful obstacle
          if (Date.now() > this.invincibleUntil) {
            this.handlePlayerHit(obs);
            this.obstacles.splice(i, 1);
            continue;
          }
        }
      }

      // Remove off-screen obstacles
      if (obs.y > 560) {
        this.obstacles.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= dt * 1.5;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update confetti
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += dt * 8;
      c.rot += c.vRot;
      if (c.y > 540) {
        this.confetti.splice(i, 1);
      }
    }

    this.updateHUD();

    // Check Goal
    if (this.traveled >= this.totalDistance) {
      this.finishGame();
    }
  }

  spawnObstacle() {
    const lanes = [
      this.roadLeft + 35,
      this.roadLeft + 105,
      this.roadLeft + 180,
      this.roadLeft + 255,
      this.roadLeft + 325
    ];
    const spawnX = lanes[Math.floor(Math.random() * lanes.length)] + (Math.random() * 20 - 10);

    const rand = Math.random();
    let obs = null;

    if (rand < 0.18) {
      // Booster pad (beneficial)
      obs = {
        type: 'booster',
        x: spawnX,
        y: -30,
        radius: 16,
        speed: 1.0
      };
    } else if (rand < 0.45) {
      // ⚽ Bouncing Soccer Ball
      obs = {
        type: 'soccer',
        x: spawnX,
        y: -30,
        radius: 13,
        speed: 2.2,
        seed: Math.random() * 100
      };
    } else if (rand < 0.70) {
      // 🏀 Fast Basketball
      obs = {
        type: 'basketball',
        x: spawnX,
        y: -30,
        radius: 13,
        speed: 3.0
      };
    } else if (rand < 0.88) {
      // 🛢️ Rolling Heavy Barrel
      obs = {
        type: 'barrel',
        x: spawnX,
        y: -30,
        radius: 17,
        speed: 1.8
      };
    } else {
      // 🍌 Slippery Banana Peel
      obs = {
        type: 'banana',
        x: spawnX,
        y: -30,
        radius: 12,
        speed: 1.2
      };
    }

    this.obstacles.push(obs);
  }

  handlePlayerHit(obs) {
    this.hearts--;
    this.invincibleUntil = Date.now() + 1500;
    this.currentSpeed = 1.2;
    this.shakeTimer = 15;

    if (window.AudioManager && typeof window.AudioManager.playHit === 'function') {
      window.AudioManager.playHit();
    } else if (window.AudioManager && typeof window.AudioManager.playWrong === 'function') {
      window.AudioManager.playWrong();
    }

    // Impact burst particles
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      this.particles.push({
        x: this.playerX,
        y: this.playerY,
        vx: Math.cos(angle) * (Math.random() * 3 + 2),
        vy: Math.sin(angle) * (Math.random() * 3 + 2),
        radius: Math.random() * 3 + 2,
        alpha: 0.9,
        color: '#ef4444'
      });
    }

    this.updateHUD();

    if (this.hearts <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (window.AudioManager && typeof window.AudioManager.playWrong === 'function') {
      window.AudioManager.playWrong();
    }

    if (!this.overlayEl) return;
    this.overlayEl.classList.remove('hidden');

    const reached = Math.floor(this.traveled);

    this.overlayEl.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.96); border: 2.5px solid #ef4444; border-radius: 14px; padding: 24px 20px; max-width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.85);">
        <div style="font-size: 38px; margin-bottom: 6px;">💥😵</div>
        <h2 style="margin: 0 0 6px; color: #f87171; font-size: 21px; font-weight: 900;">언덕길에서 넘어졌습니다!</h2>
        <p style="font-size: 13.5px; color: #cbd5e1; margin: 0 0 12px; line-height: 1.5;">
          지킴이 선생님: <i>"어이쿠, 학생 괜찮나? 숭실 언덕길은 방심하면 순식간에 구르는 법이지! 다시 숨을 고르고 도전해보게나!"</i>
        </p>

        <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #475569; border-radius: 10px; padding: 10px; margin-bottom: 16px; font-size: 13px; color: #fcd34d;">
          🏁 도달 거리: <b>${reached}m / 500m</b>
        </div>

        <div style="display: flex; gap: 8px;">
          <button id="btn-uphill-retry" style="flex: 1; padding: 12px; font-size: 15px; font-weight: 900; background: linear-gradient(135deg, #f59e0b, #d97706); border: 1.5px solid #fbbf24; border-radius: 8px; color: #fff; cursor: pointer;">
            🔄 다시 도전하기
          </button>
          <button id="btn-uphill-quit" style="flex: 1; padding: 12px; font-size: 15px; font-weight: 800; background: #334155; border: 1.5px solid #64748b; border-radius: 8px; color: #cbd5e1; cursor: pointer;">
            🚪 포기하기
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-uphill-retry').addEventListener('click', () => this.startCountdown());
    document.getElementById('btn-uphill-quit').addEventListener('click', () => this.close());
  }

  finishGame() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    const clearTimeSec = (this.elapsedMs / 1000);
    const clearTimeStr = clearTimeSec.toFixed(2);

    // Determine Rank
    let rank = 'C';
    let rankColor = '#94a3b8';
    let rankBadge = '🥉 C-RANK';
    let titleUnlocked = false;

    if (clearTimeSec < 23.0) {
      rank = 'S';
      rankColor = '#fbbf24';
      rankBadge = '🥇 S-RANK (초특급 질주!)';
      titleUnlocked = true;
    } else if (clearTimeSec < 29.0) {
      rank = 'A';
      rankColor = '#38bdf8';
      rankBadge = '🥈 A-RANK (우수 러너!)';
    } else if (clearTimeSec < 37.0) {
      rank = 'B';
      rankColor = '#4ade80';
      rankBadge = '🥉 B-RANK (완주 성공!)';
    }

    // Award rewards through MainApp
    const app = (typeof window !== 'undefined') ? window.MainApp : null;
    let isNewRecord = false;

    if (app && app.playerData) {
      // 1. EXP & Gold
      if (typeof app.addExp === 'function') app.addExp(150);
      if (typeof app.addGold === 'function') app.addGold(100);

      // 2. Best Time
      if (!app.playerData.uphillBestTime || this.elapsedMs < app.playerData.uphillBestTime) {
        app.playerData.uphillBestTime = this.elapsedMs;
        isNewRecord = true;
      }

      // 3. S-Rank Title: [🏃 폭풍의 언덕 질주왕]
      if (titleUnlocked) {
        if (!app.playerData.titles) app.playerData.titles = [];
        const tId = 'title_uphill_master';
        const tName = '🏃 폭풍의 언덕 질주왕';
        if (!app.playerData.titles.includes(tId) && !app.playerData.titles.includes(tName)) {
          app.playerData.titles.push(tId);
          app.playerData.titles.push(tName);
        }
      }

      if (typeof app.saveProgress === 'function') {
        app.saveProgress();
      }
    }

    // Audio Fanfare & Confetti
    if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
      window.AudioManager.playFanfare();
    }

    // Spawn 80 confetti pieces
    this.confetti = [];
    const colors = ['#f59e0b', '#ef4444', '#38bdf8', '#4ade80', '#e879f9', '#fde047'];
    for (let i = 0; i < 70; i++) {
      this.confetti.push({
        x: Math.random() * 480,
        y: Math.random() * 120 - 50,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 4 + 2,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    if (!this.overlayEl) return;
    this.overlayEl.classList.remove('hidden');

    this.overlayEl.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.96); border: 2.5px solid #22c55e; border-radius: 14px; padding: 24px 20px; max-width: 420px; box-shadow: 0 10px 40px rgba(0,0,0,0.85);">
        <div style="font-size: 38px; margin-bottom: 4px;">🏆🎉</div>
        <h2 style="margin: 0 0 4px; color: #4ade80; font-size: 22px; font-weight: 900;">언덕길 꼭대기 골인!! (GOAL)</h2>
        <div style="font-size: 14px; color: ${rankColor}; font-weight: 900; margin-bottom: 12px;">${rankBadge}</div>

        <div style="background: rgba(30, 41, 59, 0.85); border: 1.5px solid #475569; border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; font-size: 13.5px; text-align: left; line-height: 1.6;">
          <div>⏱️ 완주 기록: <b style="color: #fef08a; font-size: 16px;">${clearTimeStr}초</b> ${isNewRecord ? '<span style="color:#ef4444; font-weight:900;">[NEW 신기록!]</span>' : ''}</div>
          <div>🎁 기본 보상: <span style="color: #60a5fa;">EXP +150</span> · <span style="color: #fcd34d;">골드 +100G</span></div>
          ${titleUnlocked ? '<div style="margin-top:6px; color:#fde047; font-weight:900;">🏅 [신규 칭호 해금!]: <b>[🏃 폭풍의 언덕 질주왕]</b> 영구 획득!</div>' : '<div style="margin-top:4px; color:#94a3b8; font-size:12px;">💡 23.00초 미만으로 완주 시 S랭크 칭호 [폭풍의 언덕 질주왕] 해금!</div>'}
        </div>

        <div style="display: flex; gap: 8px;">
          <button id="btn-uphill-retry" style="flex: 1; padding: 12px; font-size: 15px; font-weight: 900; background: linear-gradient(135deg, #10b981, #059669); border: 1.5px solid #34d399; border-radius: 8px; color: #fff; cursor: pointer;">
            🔄 다시 도전하기
          </button>
          <button id="btn-uphill-quit" style="flex: 1; padding: 12px; font-size: 15px; font-weight: 800; background: #334155; border: 1.5px solid #64748b; border-radius: 8px; color: #cbd5e1; cursor: pointer;">
            🚪 학교로 복귀
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-uphill-retry').addEventListener('click', () => this.startCountdown());
    document.getElementById('btn-uphill-quit').addEventListener('click', () => this.close());
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();

    // Screen Shake Effect when hit
    if (this.shakeTimer > 0) {
      this.shakeTimer--;
      const shakeX = (Math.random() - 0.5) * 8;
      const shakeY = (Math.random() - 0.5) * 8;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Grass / Retaining Wall Sides
    ctx.fillStyle = '#064e3b'; // deep green grass
    ctx.fillRect(0, 0, w, h);

    // Left Concrete Retaining Wall (x: 0..roadLeft)
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, this.roadLeft, h);
    ctx.fillStyle = '#334155';
    ctx.fillRect(this.roadLeft - 4, 0, 4, h);
    // Expansion joints
    ctx.fillStyle = '#1e293b';
    for (let y = (this.roadScroll % 40) - 40; y < h; y += 40) {
      ctx.fillRect(0, y, this.roadLeft, 2);
    }

    // 2. Asphalt Road Surface
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(this.roadLeft, 0, this.roadWidth, h);

    // 3. Right Hazard Striped Guardrail Curb (x: roadRight..roadRight+14)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(this.roadRight, 0, 14, h);
    for (let y = (this.roadScroll % 32) - 32; y < h; y += 32) {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(this.roadRight, y, 14, 16);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(this.roadRight, y + 16, 14, 16);
    }

    // 4. Double Solid Yellow Road Dividing Lines in Center
    const midX = this.roadLeft + this.roadWidth / 2;
    ctx.fillStyle = '#eab308';
    ctx.fillRect(midX - 3, 0, 2, h);
    ctx.fillRect(midX + 1, 0, 2, h);

    // White shoulder lines
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.roadLeft + 6, 0, 2, h);
    ctx.fillRect(this.roadRight - 8, 0, 2, h);

    // 5. Road Chevrons (▲ ▲ ▲ pointing up)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let y = (this.roadScroll % 120) - 120; y < h; y += 120) {
      // Left lane chevron
      ctx.beginPath();
      ctx.moveTo(midX - 90, y + 15);
      ctx.lineTo(midX - 90, y);
      ctx.lineTo(midX - 90 - 8, y + 8);
      ctx.moveTo(midX - 90, y);
      ctx.lineTo(midX - 90 + 8, y + 8);
      ctx.stroke();

      // Right lane chevron
      ctx.beginPath();
      ctx.moveTo(midX + 90, y + 15);
      ctx.lineTo(midX + 90, y);
      ctx.lineTo(midX + 90 - 8, y + 8);
      ctx.moveTo(midX + 90, y);
      ctx.lineTo(midX + 90 + 8, y + 8);
      ctx.stroke();
    }

    // 6. Draw Distance Signposts on road
    const distLeft = Math.max(0, this.totalDistance - Math.floor(this.traveled));
    if (distLeft < 20) {
      // Finish Checkered Line
      const finishY = Math.max(40, 420 - (20 - distLeft) * 20);
      const cellW = 16;
      for (let rx = this.roadLeft; rx < this.roadRight; rx += cellW) {
        const isBlack = (Math.floor(rx / cellW) % 2 === 0);
        ctx.fillStyle = isBlack ? '#000000' : '#ffffff';
        ctx.fillRect(rx, finishY, cellW, 14);
      }
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏁 GOAL (정상 꼭대기) 🏁', midX, finishY - 6);
    }

    // 7. Render Obstacles
    for (const obs of this.obstacles) {
      if (obs.type === 'booster') {
        // Glowing Neon Speed Booster Pad
        ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
        ctx.fillRect(obs.x - 20, obs.y - 12, 40, 24);
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x - 20, obs.y - 12, 40, 24);

        // Green chevrons pointing up
        ctx.fillStyle = '#86efac';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('▲▲ BOOST ▲▲', obs.x, obs.y);
      } else if (obs.type === 'soccer') {
        // ⚽ Soccer Ball
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(obs.x, obs.y + 10, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'basketball') {
        // 🏀 Basketball
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(obs.x, obs.y + 10, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.strokeStyle = '#431407';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(obs.x - 11, obs.y);
        ctx.lineTo(obs.x + 11, obs.y);
        ctx.moveTo(obs.x, obs.y - 11);
        ctx.lineTo(obs.x, obs.y + 11);
        ctx.stroke();
      } else if (obs.type === 'barrel') {
        // 🛢️ Rolling Heavy Metal Drum / Barrel
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(obs.x, obs.y + 12, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.roundRect(obs.x - 16, obs.y - 10, 32, 20, [3, 3, 3, 3]);
        ctx.fill();
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.fillRect(obs.x - 14, obs.y - 2, 28, 4);
      } else if (obs.type === 'banana') {
        // 🍌 Banana Peel
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 8, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#713f12';
        ctx.fillRect(obs.x - 2, obs.y, 4, 3);
      }
    }

    // 8. Render Particles
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // 9. Render Player Character
    const isInvincible = Date.now() < this.invincibleUntil;
    const isBlinking = isInvincible && (Math.floor(Date.now() / 100) % 2 === 0);

    if (!isBlinking) {
      // Ground Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(this.playerX, this.playerY + 16, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mega Boost Aura
      const isMega = Date.now() < this.megaBoostUntil;
      if (isMega) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.beginPath();
        ctx.arc(this.playerX, this.playerY + 2, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Classic Student Body
      ctx.fillStyle = '#1e3a8a'; // Blue school uniform
      ctx.beginPath();
      ctx.arc(this.playerX, this.playerY - 2, 9, 0, Math.PI * 2); // Head
      ctx.fill();
      ctx.fillRect(this.playerX - 7, this.playerY + 4, 14, 12); // Torso

      // Running Legs Animation
      const legOffset = Math.sin(Date.now() / 60) * 5;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(this.playerX - 6, this.playerY + 15, 4, 8 + legOffset);
      ctx.fillRect(this.playerX + 2, this.playerY + 15, 4, 8 - legOffset);

      // Red Headband
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(this.playerX - 8, this.playerY - 4, 16, 3);
    }

    // 10. Render Confetti on Victory
    for (const c of this.confetti) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
      ctx.restore();
    }

    ctx.restore();
  }
}

// Global instance & class exposure
if (typeof window !== 'undefined') {
  window.UphillRushGame = UphillRushGame;
  window.UphillRush = new UphillRushGame();
}
if (typeof globalThis !== 'undefined') {
  globalThis.UphillRushGame = UphillRushGame;
  globalThis.UphillRush = (typeof window !== 'undefined' && window.UphillRush) || new UphillRushGame();
}
