/**
 * 🏃 언덕길 등교 챌린지 (Dynamic Pseudo-3D Uphill Sprint Mini-Game)
 * - 숭실중학교 정문 급경사 2,500m 언덕길 등교 챌린지 미니게임
 * - 🦘 [조작감 혁신] Space / W / ↑ / 점프 버튼으로 공중 점프 (장애물 뛰어넘기!)
 * - 🏎️ [시각 연출] 유사 3D 원근법 도로(Pseudo-3D Perspective) & 광속 스피드선
 * - 🏃‍♂️ [추격 연출] 옆 차선에서 가방 메고 헉헉대며 함께 달리는 라이벌 학생 NPC '철수'
 * - 🔔 [피날레 연출] 결승 300m 전 "8시 19분... 지각 10초 전!" 종소리와 학교 교문 셔터 하강
 * - 개인 기록 최고 3위 대시보드(🥇 1위, 🥈 2위, 🥉 3위) 및 체력 3칸 시스템
 * - S랭크(< 28초) 달성 시 특별 신규 칭호 [🏃 폭풍의 지각생] 영구 해금!
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
    this.totalDistance = 2500;
    this.traveled = 0;
    this.startTime = 0;
    this.elapsedMs = 0;
    this.hearts = 3;
    this.maxHearts = 3;

    // Player state
    this.playerX = 240;
    this.playerY = 430;
    this.playerZ = 0;
    this.playerVz = 0;
    this.isJumping = false;
    this.jumpGravity = 720;
    this.playerW = 24;
    this.playerH = 30;
    this.baseSpeed = 3.8;
    this.currentSpeed = 3.8;
    this.isBoosting = false;
    this.megaBoostUntil = 0;
    this.invincibleUntil = 0;
    this.shakeTimer = 0;

    // Road definition (Pseudo-3D)
    this.horizonY = 35;
    this.roadScroll = 0;

    // Rival Student NPC ('철수')
    this.rival = {
      x: 180,
      y: 420,
      z: 0,
      vz: 0,
      isJumping: false,
      laneRatio: -0.4,
      targetLane: -0.4,
      speed: 3.8,
      stumbleTimer: 0,
      bubbleText: '늦었다! 서둘러!',
      bubbleTimer: 90
    };

    // Finale Gate & Bell
    this.finaleTriggered = false;
    this.finaleBannerTimer = 0;

    // Objects & Effects
    this.obstacles = [];
    this.particles = [];
    this.confetti = [];
    this.floatingTexts = [];
    this.speedLines = [];
    this.lastSpawnTime = 0;

    // Controls
    this.keys = { left: false, right: false, up: false, down: false, jump: false, boost: false };

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
    const btnJump = document.getElementById('btn-uphill-jump');
    const btnBoost = document.getElementById('btn-uphill-boost');

    const bindTouch = (btn, key) => {
      if (!btn) return;
      const start = (e) => {
        e.preventDefault();
        if (key === 'jump') {
          this.triggerJump();
        } else {
          this.keys[key] = true;
        }
      };
      const end = (e) => {
        e.preventDefault();
        if (key !== 'jump') {
          this.keys[key] = false;
        }
      };
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('mouseleave', end);
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
    };

    bindTouch(btnLeft, 'left');
    bindTouch(btnRight, 'right');
    bindTouch(btnJump, 'jump');
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
      } else if (e.key === ' ' || e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        this.triggerJump();
        e.preventDefault();
      } else if (e.key === 'Shift' || e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
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
      } else if (e.key === 'Shift' || e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        this.keys.boost = false;
      }
    });
  }

  triggerJump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.playerVz = 320;
      if (window.AudioManager && typeof window.AudioManager.playJump === 'function') {
        window.AudioManager.playJump();
      }
      // Jump burst dust
      for (let i = 0; i < 5; i++) {
        this.particles.push({
          x: this.playerX + (Math.random() * 14 - 7),
          y: this.playerY + 16,
          vx: (Math.random() - 0.5) * 2.5,
          vy: Math.random() * 1.5,
          radius: Math.random() * 2 + 1,
          alpha: 0.6,
          color: '#e2e8f0'
        });
      }
    }
  }

  addFloatingText(text, x, y, color = '#facc15') {
    this.floatingTexts.push({
      text,
      x,
      y,
      alpha: 1.0,
      color,
      vy: -1.2
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
    this.playerZ = 0;
    this.playerVz = 0;
    this.isJumping = false;
    this.currentSpeed = this.baseSpeed;
    this.megaBoostUntil = 0;
    this.invincibleUntil = 0;
    this.shakeTimer = 0;

    // Reset Rival
    this.rival.x = 180;
    this.rival.y = 420;
    this.rival.z = 0;
    this.rival.vz = 0;
    this.rival.isJumping = false;
    this.rival.laneRatio = -0.4;
    this.rival.targetLane = -0.4;
    this.rival.speed = this.baseSpeed;
    this.rival.stumbleTimer = 0;
    this.rival.bubbleText = '늦었다! 서둘러!';
    this.rival.bubbleTimer = 90;

    // Reset Finale
    this.finaleTriggered = false;
    this.finaleBannerTimer = 0;

    this.obstacles = [];
    this.particles = [];
    this.confetti = [];
    this.floatingTexts = [];
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

  getPerspective(y) {
    const horizonY = this.horizonY;
    const t = Math.max(0, Math.min(1, (y - horizonY) / (500 - horizonY)));
    const p = Math.pow(t, 1.35); // quadratic perspective for steep incline
    const roadWidth = 135 + p * 265; // 135px at horizon, 400px at bottom
    const midX = 240;
    return {
      t,
      p,
      roadWidth,
      left: midX - roadWidth / 2,
      right: midX + roadWidth / 2,
      scale: 0.50 + p * 0.70
    };
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
          언덕길 꼭대기까지 가장 빠른 시간 안에 주파하세요!
        </p>

        ${dashboardHtml}

        <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #475569; border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; font-size: 12.5px; text-align: left;">
          <div style="color: #38bdf8; font-weight: 800; margin-bottom: 4px;">🎮 조작 안내:</div>
          <div style="color: #e2e8f0; line-height: 1.6;">• <b>[← →] / [A D]</b>: 좌우 차선 이동</div>
          <div style="color: #e2e8f0; line-height: 1.6;">• <b>[Space] / [W] / [↑] / [🦘 점프]</b>: 공중 점프 (장애물 뛰어넘기!)</div>
          <div style="color: #e2e8f0; line-height: 1.6;">• <b>[Shift] / [S] / [↓] / [⚡ 질주]</b>: 전력 질주 (속도 UP!)</div>
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
      targetSpeed = 9.2;
    } else if (this.keys.boost) {
      targetSpeed = 6.2;
    }

    this.currentSpeed += (targetSpeed - this.currentSpeed) * 0.18;
    this.traveled += this.currentSpeed * dt * 16.5;
    this.roadScroll += this.currentSpeed * 4.5;

    // 1. Player Jump Physics
    if (this.isJumping) {
      this.playerZ += this.playerVz * dt;
      this.playerVz -= this.jumpGravity * dt;
      if (this.playerZ <= 0) {
        this.playerZ = 0;
        this.playerVz = 0;
        this.isJumping = false;
        // Landing dust
        for (let i = 0; i < 4; i++) {
          this.particles.push({
            x: this.playerX + (Math.random() * 14 - 7),
            y: this.playerY + 16,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 1.5,
            radius: Math.random() * 2 + 1,
            alpha: 0.5,
            color: '#cbd5e1'
          });
        }
      }
    }

    // 2. Player Steering with Perspective Boundaries
    const pPersp = this.getPerspective(this.playerY);
    const steerSpeed = 320 * dt;
    if (this.keys.left) {
      this.playerX -= steerSpeed;
    }
    if (this.keys.right) {
      this.playerX += steerSpeed;
    }

    const minX = pPersp.left + 16;
    const maxX = pPersp.right - 16;
    this.playerX = Math.max(minX, Math.min(maxX, this.playerX));

    // Dust particles while running
    if (Math.random() < 0.45 && !this.isJumping) {
      this.particles.push({
        x: this.playerX + (Math.random() * 10 - 5),
        y: this.playerY + 16,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 2 + 1,
        radius: Math.random() * 2.5 + 1.5,
        alpha: 0.6,
        color: isMega ? '#38bdf8' : (this.keys.boost ? '#f59e0b' : '#cbd5e1')
      });
    }

    // 3. Dense Obstacle Spawning
    const now = Date.now();
    const spawnInterval = Math.max(180, 360 - Math.floor(this.traveled / 200) * 15);
    if (now - this.lastSpawnTime > spawnInterval) {
      this.lastSpawnTime = now;
      this.spawnObstacleWave();
    }

    // 4. Update Obstacles with Perspective
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      // Move down perspective hill
      obs.y += (obs.speed + this.currentSpeed * 1.8) * (dt * 60);

      const oPersp = this.getPerspective(obs.y);
      // Sine wave zigzag for soccer balls
      if (obs.type === 'soccer') {
        obs.laneRatio += Math.sin((obs.y + obs.seed) * 0.05) * 0.016;
      } else if (obs.type === 'tire') {
        obs.laneRatio += Math.cos((obs.y + obs.seed) * 0.04) * 0.012;
      }
      obs.laneRatio = Math.max(-0.85, Math.min(0.85, obs.laneRatio));

      // Calculate screen X based on road width at depth
      obs.x = 240 + obs.laneRatio * (oPersp.roadWidth / 2);
      obs.scale = oPersp.scale;

      // Collision Check
      const dx = Math.abs(obs.x - this.playerX);
      const dy = Math.abs(obs.y - this.playerY);
      const hitRadius = ((obs.radius || 14) * obs.scale) + 12;

      if (dx < hitRadius && dy < hitRadius) {
        if (obs.type === 'booster') {
          // ⚡ Booster pad
          this.megaBoostUntil = Date.now() + 2600;
          if (window.AudioManager && typeof window.AudioManager.playPowerup === 'function') {
            window.AudioManager.playPowerup();
          }
          this.addFloatingText('BOOST!! ⚡', this.playerX, this.playerY - 25, '#38bdf8');
          this.obstacles.splice(i, 1);
          continue;
        } else if (obs.type === 'heart') {
          // 💖 Recovery Heart
          if (this.hearts < this.maxHearts) {
            this.hearts++;
          }
          if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
            window.AudioManager.playSelect();
          }
          this.addFloatingText('+1 HEART 💖', this.playerX, this.playerY - 25, '#f43f5e');
          this.updateHUD();
          this.obstacles.splice(i, 1);
          continue;
        } else {
          // Harmful Obstacle
          // 🦘 JUMP OVER CHECK!
          if (this.playerZ > 14) {
            // Successfully jumped over!
            this.addFloatingText('JUMP! 🦘', this.playerX, this.playerY - this.playerZ - 10, '#4ade80');
            // Little sparkle
            for (let s = 0; s < 4; s++) {
              this.particles.push({
                x: obs.x, y: obs.y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                radius: 2, alpha: 0.8, color: '#fef08a'
              });
            }
          } else if (Date.now() > this.invincibleUntil) {
            // Player hit on ground
            this.handlePlayerHit(obs);
            this.obstacles.splice(i, 1);
            continue;
          }
        }
      }

      // Remove off-screen obstacles
      if (obs.y > 540) {
        this.obstacles.splice(i, 1);
      }
    }

    // 5. Update Rival Student NPC ('철수')
    this.updateRival(dt);

    // 6. Finale 300m Check & School Bell
    const distLeft = Math.max(0, this.totalDistance - Math.floor(this.traveled));
    if (distLeft <= 300 && !this.finaleTriggered) {
      this.finaleTriggered = true;
      this.finaleBannerTimer = 180;
      this.rival.bubbleText = '교문 닫힌다아악!! 😱';
      this.rival.bubbleTimer = 120;
      if (window.AudioManager && typeof window.AudioManager.playSchoolBell === 'function') {
        window.AudioManager.playSchoolBell();
      }
    }
    if (this.finaleBannerTimer > 0) {
      this.finaleBannerTimer--;
    }

    // 7. Update Particles, Speed Lines, Floating Texts
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= dt * 1.5;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= dt * 1.8;
      if (ft.alpha <= 0) this.floatingTexts.splice(i, 1);
    }

    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += dt * 8;
      c.rot += c.vRot;
      if (c.y > 540) this.confetti.splice(i, 1);
    }

    this.updateHUD();

    // 8. Goal In (2,500m)
    if (this.traveled >= this.totalDistance) {
      this.finishGame();
    }
  }

  updateRival(dt) {
    const r = this.rival;

    // Rival Jump Physics
    if (r.isJumping) {
      r.z += r.vz * dt;
      r.vz -= this.jumpGravity * dt;
      if (r.z <= 0) {
        r.z = 0;
        r.vz = 0;
        r.isJumping = false;
      }
    }

    // Rival target Y dynamically matches race pacing
    const isMega = Date.now() < this.megaBoostUntil;
    let targetRivalY = 410;
    if (isMega || this.keys.boost) {
      targetRivalY = 460; // falls behind player
    } else {
      targetRivalY = 380; // pushes ahead of player
    }

    if (r.stumbleTimer > 0) {
      r.stumbleTimer--;
      targetRivalY = 475;
    }

    r.y += (targetRivalY - r.y) * 0.04;

    // Rival AI: Check obstacles in path and dodge or jump
    for (const obs of this.obstacles) {
      const dy = obs.y - r.y;
      const dx = Math.abs(obs.x - r.x);
      if (dy > -60 && dy < 20 && dx < 36) {
        // Danger ahead
        if (Math.random() < 0.6 && !r.isJumping) {
          // Rival jumps!
          r.isJumping = true;
          r.vz = 300;
        } else {
          // Rival steers away
          r.targetLane = obs.laneRatio > 0 ? -0.55 : 0.55;
        }
      }
    }

    r.laneRatio += (r.targetLane - r.laneRatio) * 0.08;
    const rPersp = this.getPerspective(r.y);
    r.x = 240 + r.laneRatio * (rPersp.roadWidth / 2);

    // Bubble timer
    if (r.bubbleTimer > 0) {
      r.bubbleTimer--;
    } else if (Math.random() < 0.005) {
      const shouts = ['지각이야아-!', '헉헉.. 같이 가!', '놓치지 않는다!', '살려줘-!'];
      r.bubbleText = shouts[Math.floor(Math.random() * shouts.length)];
      r.bubbleTimer = 80;
    }
  }

  spawnObstacleWave() {
    const laneRatios = [-0.68, -0.34, 0.0, 0.34, 0.68];
    const idx1 = Math.floor(Math.random() * laneRatios.length);
    this.createObstacleAtRatio(laneRatios[idx1]);

    if (Math.random() < 0.40) {
      let idx2 = Math.floor(Math.random() * laneRatios.length);
      if (idx2 === idx1) idx2 = (idx1 + 2) % laneRatios.length;
      this.createObstacleAtRatio(laneRatios[idx2]);
    }
  }

  createObstacleAtRatio(laneRatio) {
    const rand = Math.random();
    let obs = null;

    if (rand < 0.11) {
      // ⚡ Booster pad
      obs = { type: 'booster', laneRatio, y: 35, x: 240, scale: 0.5, radius: 16, speed: 1.0 };
    } else if (rand < 0.17) {
      // 💖 Heart Recovery
      obs = { type: 'heart', laneRatio, y: 35, x: 240, scale: 0.5, radius: 14, speed: 1.2 };
    } else if (rand < 0.41) {
      // ⚽ Soccer Ball
      obs = { type: 'soccer', laneRatio, y: 35, x: 240, scale: 0.5, radius: 13, speed: 2.2, seed: Math.random() * 100 };
    } else if (rand < 0.63) {
      // 🏀 Basketball
      obs = { type: 'basketball', laneRatio, y: 35, x: 240, scale: 0.5, radius: 13, speed: 2.9 };
    } else if (rand < 0.81) {
      // 🛢️ Heavy Barrel
      obs = { type: 'barrel', laneRatio, y: 35, x: 240, scale: 0.5, radius: 17, speed: 1.9 };
    } else if (rand < 0.93) {
      // 🛞 Heavy Rubber Tire
      obs = { type: 'tire', laneRatio, y: 35, x: 240, scale: 0.5, radius: 15, speed: 2.4, seed: Math.random() * 100 };
    } else {
      // 🍌 Banana Peel
      obs = { type: 'banana', laneRatio, y: 35, x: 240, scale: 0.5, radius: 12, speed: 1.2 };
    }

    this.obstacles.push(obs);
  }

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

    this.addFloatingText('CRASH! 💥', this.playerX, this.playerY - 20, '#ef4444');

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
          지킴이 선생님: <i>"어이쿠, 학생 괜찮나? 등굣길에 방심하면 순식간에 구르는 법이지! 다시 숨을 고르고 도전해보게나!"</i>
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

    const app = (typeof window !== 'undefined') ? window.MainApp : null;
    let isNewRecord = false;
    let highlightRankIdx = -1;

    if (app && app.playerData) {
      if (typeof app.addExp === 'function') app.addExp(250);
      if (typeof app.addGold === 'function') app.addGold(150);

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

      if (titleUnlocked) {
        if (!app.playerData.titles) app.playerData.titles = [];
        const tId = 'title_uphill_master';
        const tName = '🏃 폭풍의 지각생';
        if (!app.playerData.titles.includes(tId)) app.playerData.titles.push(tId);
        if (!app.playerData.titles.includes(tName)) app.playerData.titles.push(tName);
      }

      if (typeof app.saveProgress === 'function') app.saveProgress();
    }

    if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
      window.AudioManager.playFanfare();
    }

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
        <h2 style="margin: 0 0 2px; color: #4ade80; font-size: 21px; font-weight: 900;">교문 통과! 오늘도 살아남았다!! 🏁</h2>
        <div style="font-size: 14px; color: ${rankColor}; font-weight: 900; margin-bottom: 10px;">${rankBadge}</div>

        <div style="background: rgba(30, 41, 59, 0.85); border: 1.5px solid #475569; border-radius: 10px; padding: 10px 14px; margin-bottom: 10px; font-size: 13px; text-align: left; line-height: 1.6;">
          <div>⏱️ 이번 완주 기록: <b style="color: #fef08a; font-size: 16px;">${clearTimeStr}초</b> ${isNewRecord ? '<span style="color:#ef4444; font-weight:900;">[🎉 1위 신기록 달성!]</span>' : (highlightRankIdx >= 0 ? '<span style="color:#38bdf8; font-weight:900;">[✨ TOP 3 랭크인!]</span>' : '')}</div>
          <div>🎁 기본 보상: <span style="color: #60a5fa;">EXP +250</span> · <span style="color: #fcd34d;">골드 +150G</span></div>
          ${titleUnlocked ? '<div style="margin-top:5px; color:#fde047; font-weight:900;">🏅 [신규 칭호 해금!]: <b>[🏃 폭풍의 지각생]</b> 영구 획득!</div>' : ''}
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

    // 1. Sky & Horizon Mountain Slope
    ctx.fillStyle = '#064e3b'; // deep green grass mountain background
    ctx.fillRect(0, 0, w, h);

    // Distant school building silhouettes on top
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(160, 10, 160, 25);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(190, 4, 100, 14);

    // 2. Draw Pseudo-3D Perspective Road Surface
    const topPersp = this.getPerspective(this.horizonY);
    const btmPersp = this.getPerspective(h);

    // Concrete side walls
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(topPersp.left, this.horizonY);
    ctx.lineTo(btmPersp.left, h);
    ctx.lineTo(0, h);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(topPersp.right, this.horizonY);
    ctx.lineTo(btmPersp.right, h);
    ctx.lineTo(w, h);
    ctx.fill();

    // Asphalt Road Trapezoid
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(topPersp.left, this.horizonY);
    ctx.lineTo(topPersp.right, this.horizonY);
    ctx.lineTo(btmPersp.right, h);
    ctx.lineTo(btmPersp.left, h);
    ctx.closePath();
    ctx.fill();

    // Curbs & Hazard Striping on Right
    for (let y = this.horizonY; y < h; y += 16) {
      const p1 = this.getPerspective(y);
      const p2 = this.getPerspective(y + 16);
      const isYellow = (Math.floor((y + this.roadScroll) / 20) % 2 === 0);
      ctx.fillStyle = isYellow ? '#eab308' : '#0f172a';
      ctx.beginPath();
      ctx.moveTo(p1.right, y);
      ctx.lineTo(p1.right + 10 * p1.scale, y);
      ctx.lineTo(p2.right + 10 * p2.scale, y + 16);
      ctx.lineTo(p2.right, y + 16);
      ctx.fill();
    }

    // Double Center Yellow Lines in Perspective
    for (let y = this.horizonY; y < h; y += 8) {
      const p = this.getPerspective(y);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(240 - 3 * p.scale, y, 2 * p.scale, 8);
      ctx.fillRect(240 + 1 * p.scale, y, 2 * p.scale, 8);
    }

    // White Shoulder Lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(topPersp.left + 8 * topPersp.scale, this.horizonY);
    ctx.lineTo(btmPersp.left + 8 * btmPersp.scale, h);
    ctx.moveTo(topPersp.right - 8 * topPersp.scale, this.horizonY);
    ctx.lineTo(btmPersp.right - 8 * btmPersp.scale, h);
    ctx.stroke();

    // Road Chevrons (▲ ▲ ▲ pointing uphill)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    for (let y = (this.roadScroll % 100) + this.horizonY - 100; y < h; y += 100) {
      if (y < this.horizonY) continue;
      const p = this.getPerspective(y);
      const chevW = 10 * p.scale;
      const chevH = 14 * p.scale;
      // Left lane chevron
      const lx = 240 - p.roadWidth * 0.25;
      ctx.beginPath();
      ctx.moveTo(lx, y - chevH);
      ctx.lineTo(lx - chevW, y);
      ctx.lineTo(lx + chevW, y);
      ctx.closePath();
      ctx.fill();

      // Right lane chevron
      const rx = 240 + p.roadWidth * 0.25;
      ctx.beginPath();
      ctx.moveTo(rx, y - chevH);
      ctx.lineTo(rx - chevW, y);
      ctx.lineTo(rx + chevW, y);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Milestone Signs Along 2,500m
    const distLeft = Math.max(0, this.totalDistance - Math.floor(this.traveled));
    const milestones = [
      { at: 2000, label: '⚠️ 급경사 진입 (2,000m 남음)' },
      { at: 1500, label: '🌲 중간 능선 (1,500m 남음)' },
      { at: 1000, label: '🏛️ 본관 턱밑 고개 (1,000m 남음)' },
      { at: 500, label: '⚡ 막판 스퍼트! (500m 남음)' },
      { at: 200, label: '🔥 최종 스프린트! (200m 남음)' }
    ];

    for (const ms of milestones) {
      const diff = distLeft - ms.at;
      if (diff >= -5 && diff <= 30) {
        const signY = 120 + diff * 10;
        const p = this.getPerspective(signY);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(240 - 110 * p.scale, signY - 12 * p.scale, 220 * p.scale, 24 * p.scale);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(240 - 110 * p.scale, signY - 12 * p.scale, 220 * p.scale, 24 * p.scale);
        ctx.fillStyle = '#fef08a';
        ctx.font = `bold ${Math.max(10, 12 * p.scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ms.label, 240, signY);
      }
    }

    // 4. 🔔 피날레 연출: 결승선 교문 셔터 & 골인선
    if (distLeft < 90) {
      const goalY = Math.max(40, 420 - (90 - distLeft) * 4.5);
      const gPersp = this.getPerspective(goalY);

      // Checkered Line
      const cellW = 16 * gPersp.scale;
      for (let rx = gPersp.left; rx < gPersp.right; rx += cellW) {
        const isBlack = (Math.floor(rx / cellW) % 2 === 0);
        ctx.fillStyle = isBlack ? '#000000' : '#ffffff';
        ctx.fillRect(rx, goalY, cellW, 12 * gPersp.scale);
      }

      // School Gate Pillars (숭실 정문 기둥)
      ctx.fillStyle = '#78350f'; // brick pillar
      ctx.fillRect(gPersp.left - 18 * gPersp.scale, goalY - 90 * gPersp.scale, 20 * gPersp.scale, 95 * gPersp.scale);
      ctx.fillRect(gPersp.right - 2 * gPersp.scale, goalY - 90 * gPersp.scale, 20 * gPersp.scale, 95 * gPersp.scale);

      // School Gate Descending Shutter Bars
      const shutterH = Math.min(65 * gPersp.scale, (90 - distLeft) * 1.5 * gPersp.scale);
      ctx.fillStyle = '#475569';
      ctx.fillRect(gPersp.left, goalY - 85 * gPersp.scale, gPersp.roadWidth, shutterH);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2 * gPersp.scale;
      for (let barX = gPersp.left + 10; barX < gPersp.right; barX += 14 * gPersp.scale) {
        ctx.beginPath();
        ctx.moveTo(barX, goalY - 85 * gPersp.scale);
        ctx.lineTo(barX, goalY - 85 * gPersp.scale + shutterH);
        ctx.stroke();
      }

      ctx.fillStyle = '#fef08a';
      ctx.font = `bold ${Math.max(11, 13 * gPersp.scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🏁 교문 통과! 오늘도 살아남았다!! 🏁', 240, goalY - 92 * gPersp.scale);
    }

    // 5. Render Obstacles
    for (const obs of this.obstacles) {
      const s = obs.scale;
      if (obs.type === 'booster') {
        // Glowing Neon Speed Booster Pad
        ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
        ctx.fillRect(obs.x - 22 * s, obs.y - 12 * s, 44 * s, 24 * s);
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2 * s;
        ctx.strokeRect(obs.x - 22 * s, obs.y - 12 * s, 44 * s, 24 * s);
        ctx.fillStyle = '#86efac';
        ctx.font = `bold ${Math.max(9, 12 * s)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('▲▲ BOOST ▲▲', obs.x, obs.y);
      } else if (obs.type === 'heart') {
        // 💖 Floating Recovery Heart
        ctx.font = `${Math.max(12, 20 * s)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💖', obs.x, obs.y);
      } else if (obs.type === 'soccer') {
        // ⚽ Soccer Ball
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(obs.x, obs.y + 10 * s, 12 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 11 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5 * s;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 4 * s, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'basketball') {
        // 🏀 Basketball
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(obs.x, obs.y + 10 * s, 12 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 11 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 1.5 * s;
        ctx.stroke();

        ctx.strokeStyle = '#431407';
        ctx.lineWidth = s;
        ctx.beginPath();
        ctx.moveTo(obs.x - 11 * s, obs.y);
        ctx.lineTo(obs.x + 11 * s, obs.y);
        ctx.moveTo(obs.x, obs.y - 11 * s);
        ctx.lineTo(obs.x, obs.y + 11 * s);
        ctx.stroke();
      } else if (obs.type === 'barrel') {
        // 🛢️ Rolling Heavy Barrel
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(obs.x, obs.y + 12 * s, 16 * s, 6 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.roundRect(obs.x - 16 * s, obs.y - 10 * s, 32 * s, 20 * s, [3, 3, 3, 3]);
        ctx.fill();
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 1.5 * s;
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.fillRect(obs.x - 14 * s, obs.y - 2 * s, 28 * s, 4 * s);
      } else if (obs.type === 'tire') {
        // 🛞 Heavy Rubber Tire
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(obs.x, obs.y + 12 * s, 15 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 13 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2 * s;
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 6 * s, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'banana') {
        // 🍌 Banana Peel
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 8 * s, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#713f12';
        ctx.fillRect(obs.x - 2 * s, obs.y, 4 * s, 3 * s);
      }
    }

    // 6. 🏃‍♂️ Render Rival Student NPC ('철수')
    const r = this.rival;
    const rPersp = this.getPerspective(r.y);
    const rs = rPersp.scale;

    // Rival Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(r.x, r.y + 16 * rs, 11 * rs * Math.max(0.4, 1 - r.z / 70), 5 * rs, 0, 0, Math.PI * 2);
    ctx.fill();

    const rRenderY = r.y - r.z;

    // Red Backpack on back
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(r.x - 10 * rs, rRenderY + 2 * rs, 7 * rs, 13 * rs);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(r.x - 9 * rs, rRenderY + 6 * rs, 5 * rs, 4 * rs);

    // Rival Body (Brown blazer & grey pants)
    ctx.fillStyle = '#78350f'; // brown uniform jacket
    ctx.beginPath();
    ctx.arc(r.x, rRenderY - 2 * rs, 8 * rs, 0, Math.PI * 2); // head
    ctx.fill();
    ctx.fillRect(r.x - 6 * rs, rRenderY + 4 * rs, 13 * rs, 12 * rs); // torso

    // Brown hair
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(r.x, rRenderY - 4 * rs, 8.5 * rs, Math.PI, Math.PI * 2);
    ctx.fill();

    // Rival Legs
    const rLegOffset = Math.sin(Date.now() / 50) * 5 * rs;
    ctx.fillStyle = '#334155';
    ctx.fillRect(r.x - 5 * rs, rRenderY + 15 * rs, 4 * rs, 8 * rs + rLegOffset);
    ctx.fillRect(r.x + 2 * rs, rRenderY + 15 * rs, 4 * rs, 8 * rs - rLegOffset);

    // Sweat drops
    if (Math.sin(Date.now() / 80) > 0.3) {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(r.x + 9 * rs, rRenderY - 6 * rs, 2 * rs, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rival Speech Bubble
    if (r.bubbleTimer > 0 && r.bubbleText) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(r.x - 45, rRenderY - 32 * rs, 90, 18);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.strokeRect(r.x - 45, rRenderY - 32 * rs, 90, 18);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(r.bubbleText, r.x, rRenderY - 23 * rs);
    }

    // 7. 🦘 Render Player Character (with Jump & Shadows)
    const isInvincible = Date.now() < this.invincibleUntil;
    const isBlinking = isInvincible && (Math.floor(Date.now() / 100) % 2 === 0);

    if (!isBlinking) {
      const pScale = pPersp.scale;

      // Ground Shadow (shrinks when high in air)
      const shadowScale = Math.max(0.35, 1 - (this.playerZ / 75));
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(this.playerX, this.playerY + 16 * pScale, 12 * pScale * shadowScale, 5 * pScale * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      const pRenderY = this.playerY - this.playerZ;

      // Mega Boost Aura
      const isMega = Date.now() < this.megaBoostUntil;
      if (isMega) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.beginPath();
        ctx.arc(this.playerX, pRenderY + 2 * pScale, 22 * pScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Classic Student Body
      ctx.fillStyle = '#1e3a8a'; // Blue school uniform
      ctx.beginPath();
      ctx.arc(this.playerX, pRenderY - 2 * pScale, 9 * pScale, 0, Math.PI * 2); // Head
      ctx.fill();
      ctx.fillRect(this.playerX - 7 * pScale, pRenderY + 4 * pScale, 14 * pScale, 12 * pScale); // Torso

      // Running Legs Animation (or tucked jump legs in air)
      ctx.fillStyle = '#0f172a';
      if (this.isJumping) {
        // Tucked Jump Legs
        ctx.fillRect(this.playerX - 6 * pScale, pRenderY + 14 * pScale, 4 * pScale, 5 * pScale);
        ctx.fillRect(this.playerX + 2 * pScale, pRenderY + 14 * pScale, 4 * pScale, 5 * pScale);
      } else {
        const legOffset = Math.sin(Date.now() / 60) * 5 * pScale;
        ctx.fillRect(this.playerX - 6 * pScale, pRenderY + 15 * pScale, 4 * pScale, 8 * pScale + legOffset);
        ctx.fillRect(this.playerX + 2 * pScale, pRenderY + 15 * pScale, 4 * pScale, 8 * pScale - legOffset);
      }

      // Red Headband
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(this.playerX - 8 * pScale, pRenderY - 4 * pScale, 16 * pScale, 3 * pScale);
    }

    // 8. 🏎️ Optical Speed Lines (Anime Streaks during Boost)
    const isMega = Date.now() < this.megaBoostUntil;
    if (this.keys.boost || isMega) {
      ctx.strokeStyle = isMega ? 'rgba(56, 189, 248, 0.45)' : 'rgba(254, 240, 138, 0.35)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 12; i++) {
        const lx = Math.random() * w;
        const ly = Math.random() * h;
        const len = Math.random() * 45 + 25;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx, ly + len);
        ctx.stroke();
      }
    }

    // 9. Floating Pop-up Texts ("JUMP! 🦘", "BOOST! ⚡", "CRASH!")
    for (const ft of this.floatingTexts) {
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
    }

    // 10. 🔔 피날레 배너: 300m 지각 10초 전 경보!
    if (this.finaleBannerTimer > 0) {
      const pulse = Math.sin(Date.now() / 80) > 0;
      ctx.fillStyle = pulse ? 'rgba(220, 38, 38, 0.92)' : 'rgba(180, 83, 9, 0.92)';
      ctx.fillRect(20, 18, w - 40, 36);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 18, w - 40, 36);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔔 8시 19분... 지각 10초 전! 교문 셔터가 닫힙니다! 🏃💨', w / 2, 36);
    }

    // 11. Render Particles & Confetti
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

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
