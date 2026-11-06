/**
 * 🏃 언덕길 등교 챌린지 (Soongsil Uphill Sprint Mini-Game)
 * - 숭실중학교 정문 오른쪽 급경사 2,500m 언덕길 등교 챌린지 미니게임
 * - 위에서 쏟아지는 장애물(축구공, 농구공, 드럼통, 타이어, 바나나)을 피하고 
 *   부스터 패드(⚡)와 회복 하트(💖)를 챙기며 2,500m 정상 꼭대기까지 최속 주파!
 * - 개인 기록 최고 3위까지 랭킹 대시보드(🥇 1위, 🥈 2위, 🥉 3위) 지원
 * - 28.00초 미만 주파 시 특별 신규 칭호 [🏃 폭풍의 지각생] 영구 해금!
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

    // Game stats (2,500m Course)
    this.totalDistance = 2500; // 2,500 meters
    this.traveled = 0;
    this.startTime = 0;
    this.elapsedMs = 0;
    this.hearts = 5;
    this.maxHearts = 5;

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

  getTopRecords() {
    const app = (typeof window !== 'undefined') ? window.MainApp : null;
    if (!app || !app.playerData) return [];
    let recs = app.playerData.uphillTopRecords;
    if (!Array.isArray(recs)) {
      recs = app.playerData.uphillBestTime ? [app.playerData.uphillBestTime] : [];
    }
    return recs;
  }

  formatDashboardHTML(recs, highlightIdx = -1) {
    const formatRec = (val) => val ? `${(val / 1000).toFixed(2)}초` : '-';
    const r1 = formatRec(recs[0]);
    const r2 = formatRec(recs[1]);
    const r3 = formatRec(recs[2]);

    const border1 = highlightIdx === 0 ? 'border: 2px solid #facc15; box-shadow: 0 0 10px rgba(250, 204, 21, 0.5);' : 'border: 1px solid #f59e0b;';
    const border2 = highlightIdx === 1 ? 'border: 2px solid #38bdf8; box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);' : 'border: 1px solid #64748b;';
    const border3 = highlightIdx === 2 ? 'border: 2px solid #fb923c; box-shadow: 0 0 10px rgba(251, 146, 60, 0.5);' : 'border: 1px solid #78350f;';

    return `
      <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid #334155; border-radius: 10px; padding: 10px 12px; margin: 10px 0 14px;">
        <div style="font-weight: 900; color: #38bdf8; font-size: 12.5px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
          <span>📊 개인 최고 기록 대시보드 (TOP 3)</span>
          <span style="font-size: 11px; color: #94a3b8;">2,500m 정규 코스</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; text-align: center;">
          <div style="background: rgba(245, 158, 11, 0.15); ${border1} border-radius: 8px; padding: 6px 3px;">
            <div style="font-size: 11px; color: #fde047; font-weight: 800;">🥇 1위 (최고)</div>
            <div style="font-size: 13.5px; font-weight: 900; color: #fff; margin-top: 2px;">${r1}</div>
          </div>
          <div style="background: rgba(148, 163, 184, 0.15); ${border2} border-radius: 8px; padding: 6px 3px;">
            <div style="font-size: 11px; color: #cbd5e1; font-weight: 800;">🥈 2위</div>
            <div style="font-size: 13.5px; font-weight: 900; color: #fff; margin-top: 2px;">${r2}</div>
          </div>
          <div style="background: rgba(217, 119, 6, 0.15); ${border3} border-radius: 8px; padding: 6px 3px;">
            <div style="font-size: 11px; color: #fca5a5; font-weight: 800;">🥉 3위</div>
            <div style="font-size: 13.5px; font-weight: 900; color: #fff; margin-top: 2px;">${r3}</div>
          </div>
        </div>
      </div>
    `;
  }

  showReadyScreen() {
    if (!this.overlayEl) return;
    this.overlayEl.classList.remove('hidden');

    const topRecs = this.getTopRecords();
    const dashboardHtml = this.formatDashboardHTML(topRecs);

    this.overlayEl.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.95); border: 2.5px solid #f59e0b; border-radius: 14px; padding: 20px 18px; max-width: 440px; box-shadow: 0 10px 30px rgba(0,0,0,0.85);">
        <div style="font-size: 32px; margin-bottom: 2px;">🏃‍♂️💨</div>
        <h2 style="margin: 0 0 4px; color: #fef08a; font-size: 20px; font-weight: 900;">언덕길 등교 챌린지</h2>
        <p style="font-size: 12.5px; color: #cbd5e1; margin: 0 0 10px; line-height: 1.5;">
          지각 위기! 쏟아지는 장애물을 피하고 <b>부스터(⚡)</b>와 <b>하트(💖)</b>를 챙기며<br>
          언덕길 꼭대기(<b>2,500m 정상 골인 지점</b>)까지 가장 빠른 시간 안에 주파하세요!
        </p>

        ${dashboardHtml}

        <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #475569; border-radius: 10px; padding: 9px 12px; margin-bottom: 14px; font-size: 12px; text-align: left;">
          <div style="color: #38bdf8; font-weight: 800; margin-bottom: 3px;">🎮 조작 안내:</div>
          <div style="color: #e2e8f0;">• <b>[← →] / [A D]</b>: 좌우 차선 이동</div>
          <div style="color: #e2e8f0;">• <b>[↑] / [W] / [Space]</b>: 부스트 전력 질주 (속도 UP!)</div>
          <div style="color: #a7f3d0; margin-top: 5px; font-weight: 800;">🏅 S랭크 기준: <b>28.00초 미만 주파 시 칭호 해금!</b></div>
          <div style="color: #fde047;">✨ 달성 보상: 신규 특별 칭호 <b>[🏃 폭풍의 지각생]</b> 영구 해금</div>
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
      targetSpeed = 9.2; // Mega Booster Pad Speed
    } else if (this.keys.boost) {
      targetSpeed = 6.2; // Normal Sprint Boost
    }

    this.currentSpeed += (targetSpeed - this.currentSpeed) * 0.18;
    // 2,500m pacing: at speed 6.2, travel ~102 m/s -> ~24.5s full course
    this.traveled += this.currentSpeed * dt * 16.5;

    this.roadScroll += this.currentSpeed * 4.2;

    // Player horizontal steering (nimble responsiveness)
    const steerSpeed = 310 * dt;
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
    if (Math.random() < 0.45) {
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

    // Dense obstacle spawning (substantially more obstacles as requested)
    const now = Date.now();
    // Fast dynamic interval between 180ms ~ 360ms
    const spawnInterval = Math.max(180, 360 - Math.floor(this.traveled / 200) * 15);
    if (now - this.lastSpawnTime > spawnInterval) {
      this.lastSpawnTime = now;
      this.spawnObstacleWave();
    }

    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      // Obstacles roll down towards player
      obs.y += (obs.speed + this.currentSpeed * 1.9) * (dt * 60);

      // Sine wave zigzag for soccer balls
      if (obs.type === 'soccer') {
        obs.x += Math.sin((obs.y + obs.seed) * 0.055) * 2.5;
      }
      // Bouncing tire wobble
      if (obs.type === 'tire') {
        obs.x += Math.cos((obs.y + obs.seed) * 0.04) * 1.8;
      }

      // Check collision with player
      const dx = Math.abs(obs.x - this.playerX);
      const dy = Math.abs(obs.y - this.playerY);
      const hitRadius = (obs.radius || 14) + 10;

      if (dx < hitRadius && dy < hitRadius) {
        if (obs.type === 'booster') {
          // ⚡ Booster pad (beneficial)
          this.megaBoostUntil = Date.now() + 2600;
          if (window.AudioManager && typeof window.AudioManager.playPowerup === 'function') {
            window.AudioManager.playPowerup();
          }
          // Particle burst
          for (let p = 0; p < 8; p++) {
            this.particles.push({
              x: obs.x, y: obs.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              radius: Math.random() * 3 + 2,
              alpha: 0.9,
              color: '#38bdf8'
            });
          }
          this.obstacles.splice(i, 1);
          continue;
        } else if (obs.type === 'heart') {
          // 💖 Recovery Heart (beneficial: heals +1 HP up to 5)
          if (this.hearts < this.maxHearts) {
            this.hearts++;
          }
          if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
            window.AudioManager.playSelect();
          }
          // Heart glitter particles
          for (let p = 0; p < 10; p++) {
            this.particles.push({
              x: obs.x, y: obs.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              radius: Math.random() * 3 + 2,
              alpha: 1.0,
              color: '#f43f5e'
            });
          }
          this.updateHUD();
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

    // Check Goal (2,500m)
    if (this.traveled >= this.totalDistance) {
      this.finishGame();
    }
  }

  spawnObstacleWave() {
    const lanes = [
      this.roadLeft + 35,
      this.roadLeft + 105,
      this.roadLeft + 180,
      this.roadLeft + 255,
      this.roadLeft + 325
    ];

    // Pick 1st lane
    const idx1 = Math.floor(Math.random() * lanes.length);
    const lane1 = lanes[idx1] + (Math.random() * 16 - 8);
    this.createObstacleAt(lane1);

    // Multi-obstacle wave: ~40% chance to spawn an obstacle in another lane simultaneously
    if (Math.random() < 0.40) {
      let idx2 = Math.floor(Math.random() * lanes.length);
      if (idx2 === idx1) idx2 = (idx1 + 2) % lanes.length;
      const lane2 = lanes[idx2] + (Math.random() * 16 - 8);
      this.createObstacleAt(lane2);
    }
  }

  createObstacleAt(spawnX) {
    const rand = Math.random();
    let obs = null;

    if (rand < 0.11) {
      // ⚡ Booster pad (beneficial)
      obs = {
        type: 'booster',
        x: spawnX,
        y: -30,
        radius: 16,
        speed: 1.0
      };
    } else if (rand < 0.17) {
      // 💖 Heart Recovery Pickup (beneficial: heals 1 HP)
      obs = {
        type: 'heart',
        x: spawnX,
        y: -30,
        radius: 14,
        speed: 1.2
      };
    } else if (rand < 0.41) {
      // ⚽ Bouncing Soccer Ball (zigzag)
      obs = {
        type: 'soccer',
        x: spawnX,
        y: -30,
        radius: 13,
        speed: 2.2,
        seed: Math.random() * 100
      };
    } else if (rand < 0.63) {
      // 🏀 Fast Basketball
      obs = {
        type: 'basketball',
        x: spawnX,
        y: -30,
        radius: 13,
        speed: 2.9
      };
    } else if (rand < 0.81) {
      // 🛢️ Rolling Heavy Barrel
      obs = {
        type: 'barrel',
        x: spawnX,
        y: -30,
        radius: 17,
        speed: 1.9
      };
    } else if (rand < 0.93) {
      // 🛞 Heavy Rolling Rubber Tire
      obs = {
        type: 'tire',
        x: spawnX,
        y: -30,
        radius: 15,
        speed: 2.4,
        seed: Math.random() * 100
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

  // Alias for backward compatibility with existing tests
  spawnObstacle() {
    this.spawnObstacleWave();
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
    const topRecs = this.getTopRecords();
    const dashboardHtml = this.formatDashboardHTML(topRecs);

    this.overlayEl.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.96); border: 2.5px solid #ef4444; border-radius: 14px; padding: 22px 18px; max-width: 420px; box-shadow: 0 10px 40px rgba(0,0,0,0.85);">
        <div style="font-size: 38px; margin-bottom: 4px;">💥😵</div>
        <h2 style="margin: 0 0 6px; color: #f87171; font-size: 20px; font-weight: 900;">언덕길에서 넘어졌습니다!</h2>
        <p style="font-size: 13px; color: #cbd5e1; margin: 0 0 10px; line-height: 1.5;">
          지킴이 선생님: <i>"어이쿠, 학생 괜찮나? 숭실 언덕길 2,500m는 방심하면 순식간에 구르는 법이지! 다시 숨을 고르고 도전해보게나!"</i>
        </p>

        <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #475569; border-radius: 10px; padding: 10px; margin-bottom: 12px; font-size: 13px; color: #fcd34d;">
          🏁 도달 거리: <b>${reached}m / 2,500m</b>
        </div>

        ${dashboardHtml}

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

    // Determine Rank for 2,500m Course
    let rank = 'C';
    let rankColor = '#94a3b8';
    let rankBadge = '🥉 C-RANK';
    let titleUnlocked = false;

    if (clearTimeSec < 28.0) {
      rank = 'S';
      rankColor = '#fbbf24';
      rankBadge = '🥇 S-RANK (초특급 질주!)';
      titleUnlocked = true;
    } else if (clearTimeSec < 38.0) {
      rank = 'A';
      rankColor = '#38bdf8';
      rankBadge = '🥈 A-RANK (우수 러너!)';
    } else if (clearTimeSec < 52.0) {
      rank = 'B';
      rankColor = '#4ade80';
      rankBadge = '🥉 B-RANK (완주 성공!)';
    }

    // Award rewards & Update Top 3 Personal Records through MainApp
    const app = (typeof window !== 'undefined') ? window.MainApp : null;
    let isNewRecord = false;
    let highlightRankIdx = -1;

    if (app && app.playerData) {
      // 1. EXP & Gold
      if (typeof app.addExp === 'function') app.addExp(250);
      if (typeof app.addGold === 'function') app.addGold(150);

      // 2. Personal Top 3 Records Dashboard management
      if (!Array.isArray(app.playerData.uphillTopRecords)) {
        app.playerData.uphillTopRecords = app.playerData.uphillBestTime ? [app.playerData.uphillBestTime] : [];
      }
      app.playerData.uphillTopRecords.push(this.elapsedMs);
      app.playerData.uphillTopRecords.sort((a, b) => a - b);
      if (app.playerData.uphillTopRecords.length > 3) {
        app.playerData.uphillTopRecords = app.playerData.uphillTopRecords.slice(0, 3);
      }
      highlightRankIdx = app.playerData.uphillTopRecords.indexOf(this.elapsedMs);
      isNewRecord = (highlightRankIdx === 0);
      app.playerData.uphillBestTime = app.playerData.uphillTopRecords[0];

      // 3. S-Rank Title: [🏃 폭풍의 지각생]
      if (titleUnlocked) {
        if (!app.playerData.titles) app.playerData.titles = [];
        const tId = 'title_uphill_master';
        const tName = '🏃 폭풍의 지각생';
        if (!app.playerData.titles.includes(tId)) {
          app.playerData.titles.push(tId);
        }
        if (!app.playerData.titles.includes(tName)) {
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

    // Spawn confetti pieces
    this.confetti = [];
    const colors = ['#f59e0b', '#ef4444', '#38bdf8', '#4ade80', '#e879f9', '#fde047'];
    for (let i = 0; i < 75; i++) {
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

    const topRecs = this.getTopRecords();
    const dashboardHtml = this.formatDashboardHTML(topRecs, highlightRankIdx);

    this.overlayEl.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.96); border: 2.5px solid #22c55e; border-radius: 14px; padding: 22px 18px; max-width: 440px; box-shadow: 0 10px 40px rgba(0,0,0,0.85);">
        <div style="font-size: 38px; margin-bottom: 2px;">🏆🎉</div>
        <h2 style="margin: 0 0 2px; color: #4ade80; font-size: 21px; font-weight: 900;">2,500m 정상 골인 성공!!</h2>
        <div style="font-size: 14px; color: ${rankColor}; font-weight: 900; margin-bottom: 10px;">${rankBadge}</div>

        <div style="background: rgba(30, 41, 59, 0.85); border: 1.5px solid #475569; border-radius: 10px; padding: 10px 14px; margin-bottom: 10px; font-size: 13px; text-align: left; line-height: 1.6;">
          <div>⏱️ 이번 완주 기록: <b style="color: #fef08a; font-size: 16px;">${clearTimeStr}초</b> ${isNewRecord ? '<span style="color:#ef4444; font-weight:900;">[🎉 1위 신기록 달성!]</span>' : (highlightRankIdx >= 0 ? '<span style="color:#38bdf8; font-weight:900;">[✨ TOP 3 랭크인!]</span>' : '')}</div>
          <div>🎁 기본 보상: <span style="color: #60a5fa;">EXP +250</span> · <span style="color: #fcd34d;">골드 +150G</span></div>
          ${titleUnlocked ? '<div style="margin-top:5px; color:#fde047; font-weight:900;">🏅 [신규 칭호 해금!]: <b>[🏃 폭풍의 지각생]</b> 영구 획득!</div>' : '<div style="margin-top:4px; color:#94a3b8; font-size:11.5px;">💡 28.00초 미만 주파 시 S랭크 칭호 [🏃 폭풍의 지각생] 해금!</div>'}
        </div>

        ${dashboardHtml}

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
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
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

    // 6. Milestone Signboards & Finish Checkered Line
    const distLeft = Math.max(0, this.totalDistance - Math.floor(this.traveled));

    // Distance Milestone signs on road (every 500m markers)
    const milestones = [
      { at: 2000, label: '⚠️ 급경사 진입 (2,000m 남음)' },
      { at: 1500, label: '🌲 중간 능선 (1,500m 남음)' },
      { at: 1000, label: '🏛️ 본관 턱밑 고개 (1,000m 남음)' },
      { at: 500, label: '⚡ 막판 스퍼트! (500m 남음)' },
      { at: 200, label: '🔥 최종 스프린트! (200m 남음)' }
    ];

    for (const ms of milestones) {
      const diff = distLeft - ms.at;
      if (diff >= -5 && diff <= 25) {
        const signY = 150 + diff * 12;
        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.fillRect(midX - 110, signY - 14, 220, 26);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(midX - 110, signY - 14, 220, 26);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ms.label, midX, signY);
      }
    }

    // Finish Checkered Line at 0m
    if (distLeft < 30) {
      const finishY = Math.max(40, 420 - (30 - distLeft) * 14);
      const cellW = 16;
      for (let rx = this.roadLeft; rx < this.roadRight; rx += cellW) {
        const isBlack = (Math.floor(rx / cellW) % 2 === 0);
        ctx.fillStyle = isBlack ? '#000000' : '#ffffff';
        ctx.fillRect(rx, finishY, cellW, 14);
      }
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏁 GOAL (2,500m 정상 꼭대기) 🏁', midX, finishY - 8);
    }

    // 7. Render Obstacles & Powerups
    for (const obs of this.obstacles) {
      if (obs.type === 'booster') {
        // Glowing Neon Speed Booster Pad
        ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
        ctx.fillRect(obs.x - 22, obs.y - 13, 44, 26);
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x - 22, obs.y - 13, 44, 26);

        // Green chevrons pointing up
        ctx.fillStyle = '#86efac';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('▲▲ BOOST ▲▲', obs.x, obs.y);
      } else if (obs.type === 'heart') {
        // 💖 Floating Recovery Heart
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(obs.x, obs.y + 12, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💖', obs.x, obs.y);
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
      } else if (obs.type === 'tire') {
        // 🛞 Heavy Rubber Tire
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(obs.x, obs.y + 12, 15, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 6, 0, Math.PI * 2);
        ctx.fill();
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
