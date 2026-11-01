/**
 * Soongsil RPG - 3v3 Brawl Ball (브롤볼) Enhanced Engine
 * 1. Super Skill (궁극기 게이지 0~100%, 불꽃 하이퍼 슛, 메가 바디체크)
 * 2. Obstacles & Trick Shots (골대 앞 목재 상자, 벽 반사 트릭샷, 점선 조준 가이드)
 * 5. Random Power-up Drinks (⚡ 신속 드링크, 🛡️ 무적 실드)
 */

class BrawlBallManager {
  constructor() {
    this.engine = null;
    this.network = null;
    this.inQueue = false;
    this.queue = [];
    this.myTeam = null; // 'blue' | 'red' | null
    this.match = null;
    this.tackleCooldown = 0;
    this.stunnedUntil = 0;
    this.lastKickTime = 0;
    this.particles = [];
    this.floatingTexts = [];
    this.goalBanner = { text: '', subtext: '', timer: 0 };

    // 1. Super Gauge (0 ~ 100)
    this.superGauge = 0;
    this.superChargedNotified = false;

    // 2. Obstacles (Wooden Crates & Covers)
    this.obstacles = [
      // North Goal Barricades (Blocks direct middle shots)
      { id: 'obs_n1', x: 41 * 32, y: 25 * 32, w: 32, h: 32, brokenUntil: 0 },
      { id: 'obs_n2', x: 45 * 32, y: 25 * 32, w: 32, h: 32, brokenUntil: 0 },
      // South Goal Barricades (Blocks direct middle shots)
      { id: 'obs_s1', x: 41 * 32, y: 45 * 32, w: 32, h: 32, brokenUntil: 0 },
      { id: 'obs_s2', x: 45 * 32, y: 45 * 32, w: 32, h: 32, brokenUntil: 0 },
      // Midfield Side Barricades (Tactical cover for bounces)
      { id: 'obs_m1', x: 36 * 32, y: 35 * 32, w: 32, h: 32, brokenUntil: 0 },
      { id: 'obs_m2', x: 50 * 32, y: 35 * 32, w: 32, h: 32, brokenUntil: 0 }
    ];

    // 5. Power-up Drinks & Active Buffs
    this.powerups = [];
    this.nextPowerupSpawnTime = Date.now() + 10000;
    this.speedBuffUntil = 0;
    this.hasShield = false;

    // Court boundaries in pixels (x: 31~55, y: 22~48)
    this.court = {
      minX: 31 * 32,
      maxX: 55 * 32,
      minY: 22 * 32,
      maxY: 48 * 32,
      midX: 43 * 32,
      midY: 35 * 32,
      goalWidth: 6 * 32,
      goalMinX: 40 * 32,
      goalMaxX: 46 * 32,
      northGoalY: 22 * 32,
      southGoalY: 48 * 32
    };

    // Ball state
    this.ball = {
      x: 43 * 32,
      y: 35 * 32,
      vx: 0,
      vy: 0,
      radius: 12,
      carrierId: null,
      carrierName: '',
      carrierTeam: null,
      pickupCooldown: 0,
      isSuper: false // Blazing Hyper Shot flag
    };
  }

  init(engine, network) {
    this.engine = engine;
    this.network = network;
    this.bindDOM();
  }

  bindDOM() {
    // Modal buttons
    const btnClose = document.getElementById('btn-close-brawl-queue-x');
    if (btnClose) btnClose.addEventListener('click', () => this.closeQueueModal());

    const btnJoin = document.getElementById('btn-brawl-queue-toggle');
    if (btnJoin) {
      btnJoin.addEventListener('click', () => {
        if (this.inQueue) {
          this.leaveQueue();
        } else {
          this.joinQueue();
        }
      });
    }

    const btnTest = document.getElementById('btn-brawl-start-test');
    if (btnTest) {
      btnTest.addEventListener('click', () => this.startTestMatch());
    }

    // Mobile Super Button
    const btnSuper = document.getElementById('btn-mobile-super');
    if (btnSuper) {
      btnSuper.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.trySuper();
      });
    }
  }

  openQueueModal() {
    const modal = document.getElementById('modal-brawl-ball-queue');
    if (modal) {
      modal.classList.remove('hidden');
      this.renderQueueUI();
      if (window.AudioManager) window.AudioManager.playSelect();
    }
  }

  closeQueueModal() {
    const modal = document.getElementById('modal-brawl-ball-queue');
    if (modal) {
      modal.classList.add('hidden');
      if (window.AudioManager) window.AudioManager.playSelect();
    }
  }

  joinQueue() {
    if (!this.network || !this.engine || !this.engine.player) return;
    const p = this.engine.player;
    this.network.joinBrawlQueue({
      studentId: p.studentId || 'std_' + Math.floor(Math.random() * 1000),
      name: p.name || '학생',
      avatar: p.avatar || 'boy_blue'
    });
    this.inQueue = true;
    this.renderQueueUI();
    if (window.AudioManager) window.AudioManager.playSelect();
  }

  leaveQueue() {
    if (!this.network) return;
    this.network.leaveBrawlQueue();
    this.inQueue = false;
    this.renderQueueUI();
    if (window.AudioManager) window.AudioManager.playSelect();
  }

  startTestMatch() {
    if (!this.network) return;
    this.network.startBrawlTest();
    if (window.AudioManager) window.AudioManager.playFanfare();
  }

  onQueueUpdated(data) {
    this.queue = (data && data.queue) || [];
    const myId = (this.network && this.network.socket) ? this.network.socket.id : null;
    this.inQueue = this.queue.some(p => p.socketId === myId);
    this.renderQueueUI();
  }

  renderQueueUI() {
    const countEl = document.getElementById('brawl-queue-count');
    if (countEl) countEl.innerText = `${this.queue.length} / 6명`;

    const toggleBtn = document.getElementById('btn-brawl-queue-toggle');
    if (toggleBtn) {
      if (this.inQueue) {
        toggleBtn.innerText = '🚪 대기열 나가기';
        toggleBtn.style.background = '#ef4444';
      } else {
        toggleBtn.innerText = '⚽ 대기열 참가 신청';
        toggleBtn.style.background = '#2563eb';
      }
    }

    const grid = document.getElementById('brawl-queue-slots');
    if (grid) {
      let html = '';
      for (let i = 0; i < 6; i++) {
        const p = this.queue[i];
        if (p) {
          html += `
            <div style="background: rgba(30, 41, 59, 0.9); border: 2px solid #38bdf8; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <span style="font-size: 26px;">👤</span>
              <span style="font-weight: 800; color: #ffffff; font-size: 13px;">${p.name}</span>
              <span style="font-size: 11px; color: #4ade80; background: rgba(74, 222, 128, 0.2); padding: 2px 6px; border-radius: 4px;">대기 완료</span>
            </div>
          `;
        } else {
          html += `
            <div style="background: rgba(15, 23, 42, 0.6); border: 2px dashed #475569; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-height: 80px;">
              <span style="font-size: 20px; opacity: 0.4;">⏳</span>
              <span style="font-size: 12px; color: #94a3b8;">${i + 1}번 참가자 대기 중</span>
            </div>
          `;
        }
      }
      grid.innerHTML = html;
    }
  }

  onMatchStarted(match) {
    this.match = match;
    this.closeQueueModal();
    this.inQueue = false;
    this.superGauge = 20; // Starting 20% bonus
    this.superChargedNotified = false;
    this.hasShield = false;
    this.speedBuffUntil = 0;
    this.powerups = [];
    this.nextPowerupSpawnTime = Date.now() + 8000;

    // Reset obstacles
    this.obstacles.forEach(obs => { obs.brokenUntil = 0; });

    // Reset ball
    if (match.ball) {
      this.ball = { ...this.ball, ...match.ball, isSuper: false };
    } else {
      this.ball.x = this.court.midX;
      this.ball.y = this.court.midY;
      this.ball.vx = 0;
      this.ball.vy = 0;
      this.ball.carrierId = null;
      this.ball.isSuper = false;
    }

    // Determine my team
    const myId = (this.network && this.network.socket) ? this.network.socket.id : null;
    const bluePlayer = match.teams.blue.find(p => p.socketId === myId);
    const redPlayer = match.teams.red.find(p => p.socketId === myId);

    if (bluePlayer) {
      this.myTeam = 'blue';
      if (this.engine) {
        this.engine.teleportTo(0, 'playground', bluePlayer.spawnX, bluePlayer.spawnY);
      }
      this.showGoalBanner('🔵 블루팀 배정!', '남쪽 진영 (North 골대를 향해 공격!)', 3);
    } else if (redPlayer) {
      this.myTeam = 'red';
      if (this.engine) {
        this.engine.teleportTo(0, 'playground', redPlayer.spawnX, redPlayer.spawnY);
      }
      this.showGoalBanner('🔴 레드팀 배정!', '북쪽 진영 (South 골대를 향해 공격!)', 3);
    } else {
      this.myTeam = null;
      this.showGoalBanner('⚽ 3v3 브롤볼 경기 시작!', '관전 모드로 진행됩니다', 2.5);
    }

    if (window.AudioManager) {
      window.AudioManager.playWhistle();
    }
  }

  onMatchTick(data) {
    if (this.match) {
      this.match.timeRemaining = data.timeRemaining;
      this.match.score = data.score;
    }
  }

  // ========================================================
  // SUPER GAUGE SYSTEM (Feature 1)
  // ========================================================

  addSuperGauge(amount) {
    const prev = this.superGauge;
    this.superGauge = Math.min(100, Math.max(0, this.superGauge + amount));

    if (this.superGauge >= 100 && prev < 100) {
      if (window.AudioManager) {
        window.AudioManager.playSuperReady();
      }
      this.addFloatingText('⚡ SUPER READY!! (Q키)', this.engine.player.x, this.engine.player.y - 28, '#fde047');
    }
  }

  trySuper() {
    if (!this.engine || !this.engine.player) return false;
    const p = this.engine.player;
    if (p.room !== 'playground' || !this.isPlayerInCourt(p.x, p.y)) return false;

    const now = Date.now();
    if (now < this.stunnedUntil) {
      if (window.MainApp && window.MainApp.showToast) {
        window.MainApp.showToast('💫 기절 상태여서 슈퍼를 사용할 수 없습니다!', 'warning');
      }
      return false;
    }

    if (this.superGauge < 100) {
      if (window.MainApp && window.MainApp.showToast) {
        window.MainApp.showToast(`⏳ 궁극기 게이지 충전 중: ${Math.floor(this.superGauge)}%`, 'warning');
      }
      return false;
    }

    const myId = (this.network && this.network.socket) ? this.network.socket.id : null;
    const isCarrier = (this.ball.carrierId === myId);

    // Consume 100% Super Gauge
    this.superGauge = 0;

    if (isCarrier) {
      // 1-A. [🔥 HYPER SUPER SHOT] (Blazing fireball kick)
      const dir = p.direction || 'up';
      let vx = 0, vy = 0;
      const speed = 25; // Super high speed (vs 14 normal)
      if (dir === 'up') vy = -speed;
      else if (dir === 'down') vy = speed;
      else if (dir === 'left') vx = -speed;
      else if (dir === 'right') vx = speed;

      this.ball.vx = vx;
      this.ball.vy = vy;
      this.ball.carrierId = null;
      this.ball.carrierName = '';
      this.ball.carrierTeam = null;
      this.ball.isSuper = true;
      this.ball.pickupCooldown = now + 500;

      if (window.AudioManager) {
        window.AudioManager.playSuperShot();
      }

      this.addFloatingText('🔥 HYPER SUPER SHOT!!', p.x, p.y - 24, '#f97316');
      this.createSuperFireParticles(this.ball.x, this.ball.y);

      if (this.network) {
        this.network.sendBrawlSuperShot({
          vx,
          vy,
          shooterId: myId,
          shooterName: p.name,
          team: this.myTeam
        });
      }
    } else {
      // 1-B. [⚡ MEGA BODY-CHECK TACKLE] (Golden lightning dash & area knockback)
      const dir = p.direction || 'down';
      let dx = 0, dy = 0;
      const dashDist = 76;
      if (dir === 'up') dy = -dashDist;
      else if (dir === 'down') dy = dashDist;
      else if (dir === 'left') dx = -dashDist;
      else if (dir === 'right') dx = dashDist;

      p.x = Math.max(this.court.minX + 16, Math.min(this.court.maxX - 16, p.x + dx));
      p.y = Math.max(this.court.minY + 16, Math.min(this.court.maxY - 16, p.y + dy));

      if (window.AudioManager) {
        window.AudioManager.playTackleHit();
      }

      this.addFloatingText('⚡ MEGA BODY-CHECK!!', p.x, p.y - 24, '#eab308');

      // Golden shockwave particles
      for (let i = 0; i < 20; i++) {
        this.particles.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          color: '#fde047',
          size: 5 + Math.random() * 5,
          life: 0.5,
          maxLife: 0.5
        });
      }

      // Knock back & stun all nearby enemies in 68px radius
      this.executeMegaTackleHits(p.x, p.y);

      if (this.network) {
        this.network.sendBrawlMegaTackle({
          tacklerId: myId,
          tacklerName: p.name,
          x: p.x,
          y: p.y,
          team: this.myTeam
        });
      }
    }

    return true;
  }

  executeMegaTackleHits(tx, ty) {
    if (!this.match) return;
    const enemyTeamKey = (this.myTeam === 'blue') ? 'red' : 'blue';
    const enemies = this.match.teams[enemyTeamKey] || [];

    for (const enemy of enemies) {
      const dist = Math.hypot(enemy.x - tx, enemy.y - ty);
      if (dist < 68) {
        if (this.network) {
          this.network.sendBrawlTackleHit({
            tacklerId: (this.network.socket ? this.network.socket.id : 'me'),
            tacklerName: this.engine.player.name,
            victimId: enemy.socketId,
            victimName: enemy.name,
            ballX: enemy.x,
            ballY: enemy.y,
            ballVx: (enemy.x - tx) * 0.25,
            ballVy: (enemy.y - ty) * 0.25
          });
        }
      }
    }
  }

  onSuperShot(data) {
    this.ball.vx = data.vx;
    this.ball.vy = data.vy;
    this.ball.carrierId = null;
    this.ball.carrierName = '';
    this.ball.carrierTeam = null;
    this.ball.isSuper = true;
    this.ball.pickupCooldown = Date.now() + 500;

    if (window.AudioManager) {
      window.AudioManager.playSuperShot();
    }
    this.createSuperFireParticles(this.ball.x, this.ball.y);
  }

  onMegaTackle(data) {
    if (window.AudioManager) {
      window.AudioManager.playTackleHit();
    }
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: data.x,
        y: data.y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: '#fde047',
        size: 5 + Math.random() * 5,
        life: 0.5,
        maxLife: 0.5
      });
    }
  }

  // ========================================================
  // OBSTACLES & TRICK SHOT BOUNCE (Feature 2)
  // ========================================================

  isObstacleBlocked(px, py) {
    const now = Date.now();
    for (const obs of this.obstacles) {
      if (obs.brokenUntil && now < obs.brokenUntil) continue;
      if (px >= obs.x && px <= obs.x + obs.w && py >= obs.y && py <= obs.y + obs.h) {
        return true;
      }
    }
    return false;
  }

  checkBallObstacleCollisions() {
    const now = Date.now();
    const bx = this.ball.x;
    const by = this.ball.y;
    const r = this.ball.radius;

    for (const obs of this.obstacles) {
      if (obs.brokenUntil && now < obs.brokenUntil) continue;

      // Circle vs AABB collision
      const closestX = Math.max(obs.x, Math.min(bx, obs.x + obs.w));
      const closestY = Math.max(obs.y, Math.min(by, obs.y + obs.h));
      const dist = Math.hypot(bx - closestX, by - closestY);

      if (dist < r) {
        // If ball is blazing Hyper Super Shot: BLAST THROUGH AND BREAK CRATE!
        if (this.ball.isSuper) {
          obs.brokenUntil = now + 10000; // Break for 10 seconds
          this.createWoodDebris(obs.x + 16, obs.y + 16);
          this.addFloatingText('💥 장애물 파괴!!', obs.x + 16, obs.y, '#f59e0b');

          if (this.network) {
            this.network.sendBrawlObstacleBreak({ obstacleId: obs.id });
          }
          continue;
        }

        // Normal bounce (Trick Shot)
        const overlapX = (obs.w / 2 + r) - Math.abs(bx - (obs.x + obs.w / 2));
        const overlapY = (obs.h / 2 + r) - Math.abs(by - (obs.y + obs.h / 2));

        if (overlapX < overlapY) {
          // Horizontal bounce
          this.ball.vx = -this.ball.vx * 0.85;
          this.ball.x += (bx > obs.x + obs.w / 2 ? overlapX : -overlapX);
        } else {
          // Vertical bounce
          this.ball.vy = -this.ball.vy * 0.85;
          this.ball.y += (by > obs.y + obs.h / 2 ? overlapY : -overlapY);
        }

        // Sparks & wood sound
        for (let i = 0; i < 6; i++) {
          this.particles.push({
            x: closestX,
            y: closestY,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            color: '#b45309',
            size: 3 + Math.random() * 3,
            life: 0.3,
            maxLife: 0.3
          });
        }
      }
    }
  }

  onObstacleBroken(data) {
    const obs = this.obstacles.find(o => o.id === data.obstacleId);
    if (obs) {
      obs.brokenUntil = Date.now() + 10000;
      this.createWoodDebris(obs.x + 16, obs.y + 16);
    }
  }

  createWoodDebris(x, y) {
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 7,
        vy: (Math.random() - 0.5) * 7,
        color: ['#78350f', '#92400e', '#b45309', '#d97706'][Math.floor(Math.random() * 4)],
        size: 4 + Math.random() * 5,
        life: 0.6,
        maxLife: 0.6
      });
    }
  }

  // ========================================================
  // RANDOM POWER-UP DRINKS (Feature 5)
  // ========================================================

  updatePowerupSpawns() {
    const now = Date.now();
    if (now >= this.nextPowerupSpawnTime && this.powerups.length < 2) {
      this.nextPowerupSpawnTime = now + 18000 + Math.random() * 6000;

      const spawnPoints = [
        { x: 36 * 32, y: 29 * 32 },
        { x: 50 * 32, y: 29 * 32 },
        { x: 36 * 32, y: 41 * 32 },
        { x: 50 * 32, y: 41 * 32 }
      ];

      // Pick an unoccupied point
      const available = spawnPoints.filter(sp => !this.powerups.some(p => Math.hypot(p.x - sp.x, p.y - sp.y) < 20));
      if (available.length > 0) {
        const spot = available[Math.floor(Math.random() * available.length)];
        const type = Math.random() < 0.5 ? 'speed' : 'shield';
        const newDrink = {
          id: 'pw_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          type,
          x: spot.x,
          y: spot.y,
          spawnedAt: now
        };
        this.powerups.push(newDrink);
      }
    }

    // Check pickup by local player
    if (!this.engine || !this.engine.player) return;
    const p = this.engine.player;

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pw = this.powerups[i];
      const dist = Math.hypot(p.x - pw.x, p.y - pw.y);

      if (dist < 26) {
        // Collect!
        this.powerups.splice(i, 1);
        this.addSuperGauge(25); // +25% Super charge on drink pickup!

        if (pw.type === 'speed') {
          this.speedBuffUntil = now + 6000; // 6s speed boost
          this.addFloatingText('⚡ 신속 버프 획득 (+35% 속도)!', p.x, p.y - 20, '#4ade80');
        } else {
          this.hasShield = true;
          this.addFloatingText('🛡️ 무적 실드 획득 (태클 1회 반사)!', p.x, p.y - 20, '#38bdf8');
        }

        if (window.AudioManager) {
          window.AudioManager.playPowerup();
        }

        if (this.network) {
          this.network.sendBrawlPowerupCollected({
            id: pw.id,
            collectorId: (this.network.socket ? this.network.socket.id : 'me'),
            collectorName: p.name,
            type: pw.type
          });
        }
      }
    }
  }

  onPowerupCollected(data) {
    const idx = this.powerups.findIndex(p => p.id === data.id);
    if (idx !== -1) {
      this.powerups.splice(idx, 1);
    }
  }

  // ========================================================
  // CORE MECHANICS (Kick, Tackle, Physics)
  // ========================================================

  tryTackle() {
    if (!this.engine || !this.engine.player) return;
    const p = this.engine.player;
    if (p.room !== 'playground' || !this.isPlayerInCourt(p.x, p.y)) return;

    const now = Date.now();
    if (now < this.stunnedUntil) {
      if (window.MainApp && window.MainApp.showToast) {
        window.MainApp.showToast('💫 기절 상태여서 행동할 수 없습니다!', 'warning');
      }
      return;
    }

    if (now < this.tackleCooldown) {
      const sec = ((this.tackleCooldown - now) / 1000).toFixed(1);
      if (window.MainApp && window.MainApp.showToast) {
        window.MainApp.showToast(`⏳ [태클 쿨타임] ${sec}초`, 'warning');
      }
      return;
    }

    // Execute Tackle Dash: 48px dash in facing direction
    this.tackleCooldown = now + 3000;
    const dir = p.direction || 'down';
    let dx = 0, dy = 0;
    if (dir === 'up') dy = -48;
    else if (dir === 'down') dy = 48;
    else if (dir === 'left') dx = -48;
    else if (dir === 'right') dx = 48;

    p.x = Math.max(this.court.minX + 16, Math.min(this.court.maxX - 16, p.x + dx));
    p.y = Math.max(this.court.minY + 16, Math.min(this.court.maxY - 16, p.y + dy));

    if (this.network) {
      this.network.sendBrawlTackle({
        x: p.x,
        y: p.y,
        dir,
        tacklerId: this.network.socket ? this.network.socket.id : 'me',
        tacklerName: p.name,
        team: this.myTeam
      });
    }

    this.checkTackleCollision(p.x, p.y);
  }

  checkTackleCollision(tacklerX, tacklerY) {
    if (!this.match) return;
    const enemyTeamKey = (this.myTeam === 'blue') ? 'red' : 'blue';
    const enemies = this.match.teams[enemyTeamKey] || [];

    for (const enemy of enemies) {
      const dist = Math.hypot(enemy.x - tacklerX, enemy.y - tacklerY);
      if (dist < 52) {
        // Successful tackle! Charges 35% Super Gauge
        this.addSuperGauge(35);

        let scatterVx = (enemy.x - tacklerX) * 0.15;
        let scatterVy = (enemy.y - tacklerY) * 0.15;
        if (Math.abs(scatterVx) < 2) scatterVx = 4;
        if (Math.abs(scatterVy) < 2) scatterVy = 4;

        if (this.network) {
          this.network.sendBrawlTackleHit({
            tacklerId: (this.network.socket ? this.network.socket.id : 'me'),
            tacklerName: this.engine.player.name,
            victimId: enemy.socketId,
            victimName: enemy.name,
            ballX: enemy.x,
            ballY: enemy.y,
            ballVx: scatterVx,
            ballVy: scatterVy
          });
        }
        break;
      }
    }
  }

  onTackleHit(data) {
    if (window.AudioManager) {
      window.AudioManager.playTackleHit();
    }

    const myId = (this.network && this.network.socket) ? this.network.socket.id : null;

    if (data.victimId === myId) {
      // 🛡️ Check if local player has Shield! (Feature 5)
      if (this.hasShield) {
        this.hasShield = false; // Shield pops!
        this.addFloatingText('🛡️ SHIELD DEFLECT!! 상대 태클 반사!', this.engine.player.x, this.engine.player.y - 20, '#38bdf8');
        return; // Deflected! No stun, doesn't drop ball
      }

      this.stunnedUntil = Date.now() + 1200; // 1.2s stun
      this.addFloatingText('💫 기절 (1.2초)!', this.engine.player.x, this.engine.player.y - 20, '#ef4444');
    }

    this.addFloatingText('⚡ TACKLE! 상대 기절!', data.ballX || this.ball.x, data.ballY || this.ball.y, '#f59e0b');

    // Ball scatters loose
    this.ball.x = data.ballX || this.ball.x;
    this.ball.y = data.ballY || this.ball.y;
    this.ball.vx = data.ballVx || (Math.random() * 6 - 3);
    this.ball.vy = data.ballVy || (Math.random() * 6 - 3);
    this.ball.carrierId = null;
    this.ball.carrierName = '';
    this.ball.carrierTeam = null;
    this.ball.isSuper = false;
    this.ball.pickupCooldown = Date.now() + 500;
  }

  tryKick() {
    if (!this.engine || !this.engine.player) return false;
    const p = this.engine.player;
    const myId = (this.network && this.network.socket) ? this.network.socket.id : null;

    if (this.ball.carrierId !== myId) return false;

    // Normal Shoot in facing direction with speed 14
    const dir = p.direction || 'up';
    let vx = 0, vy = 0;
    const speed = 14;
    if (dir === 'up') vy = -speed;
    else if (dir === 'down') vy = speed;
    else if (dir === 'left') vx = -speed;
    else if (dir === 'right') vx = speed;

    this.addSuperGauge(15); // +15% Super gauge on shooting

    if (this.network) {
      this.network.sendBrawlKick({
        vx,
        vy,
        shooterId: myId,
        shooterName: p.name,
        team: this.myTeam
      });
    }

    this.ball.vx = vx;
    this.ball.vy = vy;
    this.ball.carrierId = null;
    this.ball.carrierName = '';
    this.ball.carrierTeam = null;
    this.ball.isSuper = false;
    this.ball.pickupCooldown = Date.now() + 400;

    if (window.AudioManager) {
      window.AudioManager.playBallKick();
    }
    this.createKickParticles(this.ball.x, this.ball.y);
    return true;
  }

  onBallKicked(data) {
    this.ball.vx = data.vx;
    this.ball.vy = data.vy;
    this.ball.carrierId = null;
    this.ball.carrierName = '';
    this.ball.carrierTeam = null;
    this.ball.isSuper = false;
    this.ball.pickupCooldown = Date.now() + 400;

    if (window.AudioManager) {
      window.AudioManager.playBallKick();
    }
    this.createKickParticles(this.ball.x, this.ball.y);
  }

  onPlayerTackled(data) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: data.x + (Math.random() - 0.5) * 20,
        y: data.y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: 'rgba(251, 191, 36, 0.8)',
        size: 4 + Math.random() * 4,
        life: 0.4,
        maxLife: 0.4
      });
    }
  }

  onBallSynced(data) {
    if (!this.ball.carrierId) {
      this.ball.x = data.x;
      this.ball.y = data.y;
      this.ball.vx = data.vx;
      this.ball.vy = data.vy;
    }
  }

  onGoalScored(data) {
    const isBlue = (data.team === 'blue');
    const teamName = isBlue ? '🔵 블루팀' : '🔴 레드팀';
    const sub = `${data.scorerName} 선수의 환상적인 골! (스코어 ${data.score.blue} : ${data.score.red})`;

    this.showGoalBanner(`⚽ GOAL!! ${teamName} 득점! 🔥`, sub, 3);
    this.addSuperGauge(50); // Scoring or being on field awards super energy!

    if (window.AudioManager) {
      window.AudioManager.playWhistle();
      setTimeout(() => {
        if (window.AudioManager) window.AudioManager.playFanfare();
      }, 300);
    }

    // Confetti celebration
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: this.court.midX + (Math.random() - 0.5) * 300,
        y: this.court.midY + (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 3,
        color: ['#38bdf8', '#f87171', '#fde047', '#4ade80', '#c084fc'][Math.floor(Math.random() * 5)],
        size: 5 + Math.random() * 5,
        life: 2.2,
        maxLife: 2.2
      });
    }
  }

  onBallReset(ball) {
    this.ball.x = ball.x;
    this.ball.y = ball.y;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.carrierId = null;
    this.ball.carrierName = '';
    this.ball.carrierTeam = null;
    this.ball.isSuper = false;
    this.ball.pickupCooldown = Date.now() + 500;
  }

  onMatchRewards(data) {
    const title = data.isWinner ? '🏆 [3v3 브롤볼 승리 보상]' : '⚽ [3v3 브롤볼 참가 보상]';
    const toast = `${title}\n+${data.expGain} EXP & +${data.goldGain} Gold 획득!`;
    if (window.MainApp && window.MainApp.showToast) {
      window.MainApp.showToast(toast, data.isWinner ? 'success' : 'info');
    }
    if (this.engine && this.engine.player) {
      this.engine.player.exp = (this.engine.player.exp || 0) + data.expGain;
      this.engine.player.gold = (this.engine.player.gold || 0) + data.goldGain;
      if (window.MainApp && window.MainApp.updateHUD) {
        window.MainApp.updateHUD();
      }
    }
  }

  onMatchEnded(data) {
    const isDraw = data.winnerTeam === 'draw';
    const winnerText = isDraw ? '무승부!' : (data.winnerTeam === 'blue' ? '🔵 블루팀 최종 승리!' : '🔴 레드팀 최종 승리!');
    this.showGoalBanner(`🏁 경기 종료! ${winnerText}`, `최종 스코어 [블루 ${data.score.blue} : ${data.score.red} 레드]`, 4);

    setTimeout(() => {
      this.match = null;
      this.myTeam = null;
      this.superGauge = 0;
      this.hasShield = false;
      this.speedBuffUntil = 0;
    }, 4500);
  }

  showGoalBanner(text, subtext, durationSec = 3) {
    this.goalBanner = { text, subtext, timer: durationSec };
  }

  addFloatingText(text, x, y, color = '#ffffff') {
    this.floatingTexts.push({ text, x, y, color, life: 1.2, maxLife: 1.2 });
  }

  createKickParticles(x, y) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color: '#ffffff',
        size: 3 + Math.random() * 3,
        life: 0.35,
        maxLife: 0.35
      });
    }
  }

  createSuperFireParticles(x, y) {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        color: ['#ef4444', '#f97316', '#fde047'][Math.floor(Math.random() * 3)],
        size: 5 + Math.random() * 6,
        life: 0.55,
        maxLife: 0.55
      });
    }
  }

  isPlayerInCourt(px, py) {
    return (
      px >= this.court.minX - 32 &&
      px <= this.court.maxX + 32 &&
      py >= this.court.minY - 32 &&
      py <= this.court.maxY + 32
    );
  }

  // ========================================================
  // UPDATE LOOP
  // ========================================================

  update(dt) {
    if (!this.engine || !this.engine.player) return;
    if (this.engine.player.room !== 'playground') return;

    const myId = (this.network && this.network.socket) ? this.network.socket.id : null;
    const now = Date.now();

    // 1. Goal banner timer
    if (this.goalBanner.timer > 0) {
      this.goalBanner.timer -= dt;
      if (this.goalBanner.timer < 0) this.goalBanner.timer = 0;
    }

    // 2. Particle update
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    // 3. Floating texts update
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 24 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // 4. Stun freeze
    if (now < this.stunnedUntil) {
      this.engine.player.vx = 0;
      this.engine.player.vy = 0;
    }

    // 5. Passive Dribble Super Charge
    if (this.ball.carrierId === myId) {
      this.addSuperGauge(dt * 8); // +8% per second while dribbling!
    }

    // 6. Spawn and collect powerups (Feature 5)
    this.updatePowerupSpawns();

    // 7. Ball physics & Obstacle Collisions (Feature 2)
    if (this.ball.carrierId) {
      let carrierObj = null;
      if (this.ball.carrierId === myId) {
        carrierObj = this.engine.player;
      } else if (this.match) {
        const all = [...this.match.teams.blue, ...this.match.teams.red];
        carrierObj = all.find(p => p.socketId === this.ball.carrierId);
      }

      if (carrierObj) {
        const dir = carrierObj.direction || 'down';
        if (dir === 'up') {
          this.ball.x = carrierObj.x;
          this.ball.y = carrierObj.y - 18;
        } else if (dir === 'down') {
          this.ball.x = carrierObj.x;
          this.ball.y = carrierObj.y + 20;
        } else if (dir === 'left') {
          this.ball.x = carrierObj.x - 18;
          this.ball.y = carrierObj.y;
        } else if (dir === 'right') {
          this.ball.x = carrierObj.x + 18;
          this.ball.y = carrierObj.y;
        }
      }
    } else {
      // Loose moving ball
      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;
      this.ball.vx *= 0.965;
      this.ball.vy *= 0.965;

      if (Math.abs(this.ball.vx) < 0.05) this.ball.vx = 0;
      if (Math.abs(this.ball.vy) < 0.05) this.ball.vy = 0;

      // Obstacle bounces & Super shot destruction
      this.checkBallObstacleCollisions();

      // Side wall bounces (West: 31*32, East: 55*32)
      if (this.ball.x <= this.court.minX + 12) {
        this.ball.x = this.court.minX + 12;
        this.ball.vx = -this.ball.vx * 0.8;
      } else if (this.ball.x >= this.court.maxX - 12) {
        this.ball.x = this.court.maxX - 12;
        this.ball.vx = -this.ball.vx * 0.8;
      }

      // North Goal Check (Red Team Net: x: 40~46*32, y: 22*32)
      if (this.ball.y <= this.court.northGoalY + 8) {
        if (this.ball.x >= this.court.goalMinX && this.ball.x <= this.court.goalMaxX) {
          if (this.network && this.match && this.match.status === 'playing') {
            this.network.notifyBrawlGoal('blue', this.ball.carrierName || '블루팀');
            this.match.status = 'goal_celebration';
          }
          this.ball.vy = 0;
          this.ball.vx = 0;
        } else {
          this.ball.y = this.court.northGoalY + 8;
          this.ball.vy = -this.ball.vy * 0.7;
        }
      }

      // South Goal Check (Blue Team Net: x: 40~46*32, y: 48*32)
      if (this.ball.y >= this.court.southGoalY - 8) {
        if (this.ball.x >= this.court.goalMinX && this.ball.x <= this.court.goalMaxX) {
          if (this.network && this.match && this.match.status === 'playing') {
            this.network.notifyBrawlGoal('red', this.ball.carrierName || '레드팀');
            this.match.status = 'goal_celebration';
          }
          this.ball.vy = 0;
          this.ball.vx = 0;
        } else {
          this.ball.y = this.court.southGoalY - 8;
          this.ball.vy = -this.ball.vy * 0.7;
        }
      }

      // Ball pickup by local player
      if (now >= this.ball.pickupCooldown && now >= this.stunnedUntil) {
        const dist = Math.hypot(this.engine.player.x - this.ball.x, this.engine.player.y - this.ball.y);
        if (dist < 26) {
          this.ball.carrierId = myId;
          this.ball.carrierName = this.engine.player.name;
          this.ball.carrierTeam = this.myTeam;
          this.ball.vx = 0;
          this.ball.vy = 0;
          this.ball.isSuper = false;

          if (this.network) {
            this.network.sendBrawlBallSync({
              x: this.ball.x,
              y: this.ball.y,
              vx: 0,
              vy: 0,
              carrierId: myId,
              carrierName: this.engine.player.name,
              carrierTeam: this.myTeam
            });
          }
        }
      }
    }

    // 8. Update Bots AI
    this.updateBotAI(dt);

    // 9. Toggle mobile Super Button visibility
    const mobileSuperBtn = document.getElementById('btn-mobile-super');
    if (mobileSuperBtn) {
      if (this.isPlayerInCourt(this.engine.player.x, this.engine.player.y)) {
        mobileSuperBtn.classList.remove('hidden');
        if (this.superGauge >= 100) {
          mobileSuperBtn.classList.add('super-ready');
        } else {
          mobileSuperBtn.classList.remove('super-ready');
        }
      } else {
        mobileSuperBtn.classList.add('hidden');
      }
    }
  }

  updateBotAI(dt) {
    if (!this.match || this.match.status !== 'playing') return;
    const allBots = [...this.match.teams.blue, ...this.match.teams.red].filter(p => p.isBot);
    const now = Date.now();

    for (const bot of allBots) {
      if (bot.stunnedUntil && now < bot.stunnedUntil) continue;

      const isBlue = (bot.team === 'blue');
      const targetGoalY = isBlue ? this.court.northGoalY : this.court.southGoalY;
      const isCarrier = (this.ball.carrierId === bot.socketId);

      if (isCarrier) {
        const targetX = this.court.midX;
        const targetY = targetGoalY;
        const angle = Math.atan2(targetY - bot.y, targetX - bot.x);
        const speed = 1.6;
        bot.x += Math.cos(angle) * speed;
        bot.y += Math.sin(angle) * speed;

        bot.direction = Math.abs(targetY - bot.y) > Math.abs(targetX - bot.x)
          ? (targetY > bot.y ? 'down' : 'up')
          : (targetX > bot.x ? 'right' : 'left');

        const distToGoal = Math.hypot(targetX - bot.x, targetY - bot.y);
        if (distToGoal < 170) {
          const shootSpeed = 13;
          this.ball.vx = Math.cos(angle) * shootSpeed;
          this.ball.vy = Math.sin(angle) * shootSpeed;
          this.ball.carrierId = null;
          this.ball.carrierName = '';
          this.ball.carrierTeam = null;
          this.ball.pickupCooldown = now + 400;

          if (this.network) {
            this.network.sendBrawlKick({
              vx: this.ball.vx,
              vy: this.ball.vy,
              shooterId: bot.socketId,
              shooterName: bot.name,
              team: bot.team
            });
          }
          if (window.AudioManager) window.AudioManager.playBallKick();
        }
      } else {
        if (!this.ball.carrierId) {
          const angle = Math.atan2(this.ball.y - bot.y, this.ball.x - bot.x);
          const speed = 1.8;
          bot.x += Math.cos(angle) * speed;
          bot.y += Math.sin(angle) * speed;

          const distToBall = Math.hypot(this.ball.x - bot.x, this.ball.y - bot.y);
          if (distToBall < 24 && now >= this.ball.pickupCooldown) {
            this.ball.carrierId = bot.socketId;
            this.ball.carrierName = bot.name;
            this.ball.carrierTeam = bot.team;
            this.ball.vx = 0;
            this.ball.vy = 0;
          }
        } else {
          const carrierTeam = this.ball.carrierTeam;
          if (carrierTeam && carrierTeam !== bot.team) {
            const angle = Math.atan2(this.ball.y - bot.y, this.ball.x - bot.x);
            const speed = 1.7;
            bot.x += Math.cos(angle) * speed;
            bot.y += Math.sin(angle) * speed;

            const dist = Math.hypot(this.ball.x - bot.x, this.ball.y - bot.y);
            if (dist < 44 && (!bot.tackleCooldown || now >= bot.tackleCooldown)) {
              bot.tackleCooldown = now + 4000;
              if (this.network) {
                this.network.sendBrawlTackleHit({
                  tacklerId: bot.socketId,
                  tacklerName: bot.name,
                  victimId: this.ball.carrierId,
                  victimName: this.ball.carrierName,
                  ballX: this.ball.x,
                  ballY: this.ball.y,
                  ballVx: (Math.random() - 0.5) * 8,
                  ballVy: (Math.random() - 0.5) * 8
                });
              }
            }
          } else {
            const forwardY = isBlue ? (bot.y - 1.2) : (bot.y + 1.2);
            bot.y = Math.max(this.court.minY + 32, Math.min(this.court.maxY - 32, forwardY));
          }
        }
      }

      bot.x = Math.max(this.court.minX + 16, Math.min(this.court.maxX - 16, bot.x));
      bot.y = Math.max(this.court.minY + 16, Math.min(this.court.maxY - 16, bot.y));
    }
  }

  // ========================================================
  // RENDERING METHODS
  // ========================================================

  renderCourt(ctx) {
    const c = this.court;
    ctx.save();

    // 1. West Dividing LED Barrier Board
    const barrierX = c.minX;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(barrierX - 4, c.minY, 8, 11 * 32);
    ctx.fillRect(barrierX - 4, c.minY + 15 * 32, 8, 11 * 32);

    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    for (let by = c.minY + 12; by < c.minY + 11 * 32; by += 24) {
      ctx.fillRect(barrierX - 2, by, 4, 12);
    }
    for (let by = c.minY + 15 * 32 + 12; by < c.maxY; by += 24) {
      ctx.fillRect(barrierX - 2, by, 4, 12);
    }
    ctx.shadowBlur = 0;

    if (this.engine && this.engine.drawSharpLabel) {
      this.engine.drawSharpLabel(barrierX, c.midY, '🚪 브롤볼 전장 입구', {
        bgColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#38bdf8',
        textColor: '#38bdf8',
        fontSize: 11,
        height: 20
      });
    }

    // 2. High-Res North Goal (Red Team)
    this.drawBrawlGoal(ctx, c.goalMinX, c.northGoalY, c.goalWidth, true, '#ef4444', '🔴 레드팀 골대 (RED GOAL)');

    // 3. High-Res South Goal (Blue Team)
    this.drawBrawlGoal(ctx, c.goalMinX, c.southGoalY, c.goalWidth, false, '#3b82f6', '🔵 블루팀 골대 (BLUE GOAL)');

    // 4. North-South Court Markings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(c.minX, c.midY);
    ctx.lineTo(c.maxX, c.midY);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(c.midX, c.midY, 75, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(c.midX, c.midY, 5, 0, Math.PI * 2);
    ctx.fill();

    const penW = 12 * 32;
    const penH = 6 * 32;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.strokeRect(c.midX - penW / 2, c.northGoalY, penW, penH);

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.strokeRect(c.midX - penW / 2, c.southGoalY - penH, penW, penH);

    if (this.engine && this.engine.drawSharpLabel) {
      this.engine.drawSharpLabel(c.midX, c.midY + 48, '⚡ 숭실 3v3 브롤볼 하프코트 ARENA ⚽', {
        bgColor: 'rgba(15, 23, 42, 0.92)',
        borderColor: '#f59e0b',
        textColor: '#fde047',
        fontSize: 12.5,
        height: 24,
        paddingX: 14
      });
    }

    // 5. Render Obstacles (Wooden Crates & Barriers) (Feature 2)
    this.renderObstacles(ctx);

    // 6. Coach NPC
    this.drawCoachNPC(ctx, c.midX, 19 * 32);

    ctx.restore();
  }

  renderObstacles(ctx) {
    const now = Date.now();
    for (const obs of this.obstacles) {
      if (obs.brokenUntil && now < obs.brokenUntil) {
        // Broken crate placeholder
        ctx.fillStyle = 'rgba(120, 53, 15, 0.3)';
        ctx.fillRect(obs.x + 4, obs.y + 4, obs.w - 8, obs.h - 8);
        continue;
      }

      ctx.save();
      // Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h + 2, obs.w / 2, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wooden Box base
      ctx.fillStyle = '#854d0e';
      ctx.beginPath();
      ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 4);
      ctx.fill();

      // Wood Planks
      ctx.fillStyle = '#a16207';
      ctx.fillRect(obs.x + 3, obs.y + 3, obs.w - 6, obs.h - 6);

      // Metal braces & rivets
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x + 2, obs.y + 2, obs.w - 4, obs.h - 4);

      // Cross Bracing
      ctx.beginPath();
      ctx.moveTo(obs.x + 4, obs.y + 4);
      ctx.lineTo(obs.x + obs.w - 4, obs.y + obs.h - 4);
      ctx.moveTo(obs.x + obs.w - 4, obs.y + 4);
      ctx.lineTo(obs.x + 4, obs.y + obs.h - 4);
      ctx.stroke();

      ctx.restore();
    }
  }

  drawBrawlGoal(ctx, gx, gy, gw, isNorth, teamColor, labelText) {
    ctx.save();
    const depth = isNorth ? -30 : 30;

    ctx.fillStyle = isNorth ? 'rgba(239, 68, 68, 0.18)' : 'rgba(59, 130, 246, 0.18)';
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + 14, gy + depth);
    ctx.lineTo(gx + gw - 14, gy + depth);
    ctx.lineTo(gx + gw, gy);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let nx = gx + 16; nx < gx + gw; nx += 16) {
      ctx.beginPath();
      ctx.moveTo(nx, gy);
      ctx.lineTo(nx, gy + depth);
      ctx.stroke();
    }

    ctx.strokeStyle = teamColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + gw, gy);
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + 14, gy + depth);
    ctx.moveTo(gx + gw, gy);
    ctx.lineTo(gx + gw - 14, gy + depth);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(gx - 4, gy - 4, 8, 8);
    ctx.fillRect(gx + gw - 4, gy - 4, 8, 8);

    if (this.engine && this.engine.drawSharpLabel) {
      const bannerY = isNorth ? (gy - 24) : (gy + 24);
      this.engine.drawSharpLabel(gx + gw / 2, bannerY, labelText, {
        bgColor: isNorth ? 'rgba(153, 27, 27, 0.95)' : 'rgba(30, 58, 138, 0.95)',
        borderColor: teamColor,
        textColor: '#ffffff',
        fontSize: 11.5,
        height: 22,
        paddingX: 10
      });
    }

    ctx.restore();
  }

  drawCoachNPC(ctx, cx, cy) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 22, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.roundRect(cx - 10, cy + 2, 20, 18, 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 2, cy + 2, 4, 18);

    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(cx, cy - 6, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(cx, cy - 9, 8, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 8, cy - 9, 16, 3);
    ctx.fillRect(cx + 2, cy - 8, 8, 2.5);

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx, cy + 6, 3, 0, Math.PI * 2);
    ctx.fill();

    if (this.engine && this.engine.drawSharpLabel) {
      this.engine.drawSharpLabel(cx, cy - 22, '⚽ 브롤볼 코치', {
        bgColor: 'rgba(15, 23, 42, 0.94)',
        borderColor: '#38bdf8',
        textColor: '#ffffff',
        fontSize: 12,
        height: 22,
        paddingX: 8
      });
    }
    ctx.restore();
  }

  renderEntities(ctx) {
    if (!this.engine || !this.engine.player) return;
    if (this.engine.player.room !== 'playground') return;

    ctx.save();

    // 1. Render Power-up Drinks (Feature 5)
    this.renderPowerups(ctx);

    // 2. Render AI Bots
    if (this.match && this.match.teams) {
      const allBots = [...this.match.teams.blue, ...this.match.teams.red].filter(p => p.isBot);
      for (const bot of allBots) {
        this.renderBot(ctx, bot);
      }
    }

    // 3. Render Aiming Trajectory Guide (Feature 2)
    this.renderAimingTrajectory(ctx);

    // 4. Render Soccer Ball (Normal or Blazing Super)
    this.renderBall(ctx);

    // 5. Render Shield & Speed Auras on Player
    this.renderPlayerAuras(ctx);

    // 6. Render Particles
    for (const pt of this.particles) {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size * (pt.life / pt.maxLife), 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Render Stun Stars
    const now = Date.now();
    if (now < this.stunnedUntil) {
      this.drawStunStars(ctx, this.engine.player.x, this.engine.player.y - 28);
    }

    // 8. Render Floating Texts
    for (const ft of this.floatingTexts) {
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 14px "Pretendard", sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    // 9. Big Goal Announcement Banner
    if (this.goalBanner.timer > 0) {
      this.renderGoalBanner(ctx);
    }

    ctx.restore();
  }

  // Trajectory Dashed Aiming Line (Feature 2)
  renderAimingTrajectory(ctx) {
    const myId = (this.network && this.network.socket) ? this.network.socket.id : null;
    if (this.ball.carrierId !== myId) return;

    const p = this.engine.player;
    const dir = p.direction || 'up';
    let dx = 0, dy = 0;
    if (dir === 'up') dy = -1;
    else if (dir === 'down') dy = 1;
    else if (dir === 'left') dx = -1;
    else if (dir === 'right') dx = 1;

    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 3;
    const isSuperReady = (this.superGauge >= 100);
    ctx.strokeStyle = isSuperReady ? 'rgba(249, 115, 22, 0.85)' : 'rgba(56, 189, 248, 0.8)';
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 8;

    let startX = p.x;
    let startY = p.y;
    let endX = startX + dx * 190;
    let endY = startY + dy * 190;

    // Check bounce against side borders (x: 31*32 or 55*32)
    let hasBounce = false;
    let bounceX = endX, bounceY = endY;
    let reflectDx = dx, reflectDy = dy;

    if (endX <= this.court.minX + 12) {
      hasBounce = true;
      bounceX = this.court.minX + 12;
      bounceY = startY + dy * Math.abs(bounceX - startX);
      reflectDx = -dx;
    } else if (endX >= this.court.maxX - 12) {
      hasBounce = true;
      bounceX = this.court.maxX - 12;
      bounceY = startY + dy * Math.abs(bounceX - startX);
      reflectDx = -dx;
    }

    ctx.beginPath();
    if (hasBounce) {
      ctx.moveTo(startX, startY);
      ctx.lineTo(bounceX, bounceY);
      ctx.lineTo(bounceX + reflectDx * 80, bounceY + reflectDy * 80);
      ctx.stroke();

      // Target circle
      ctx.beginPath();
      ctx.arc(bounceX + reflectDx * 80, bounceY + reflectDy * 80, 8, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Target circle
      ctx.beginPath();
      ctx.arc(endX, endY, 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  renderPowerups(ctx) {
    const time = Date.now() * 0.005;
    for (const pw of this.powerups) {
      ctx.save();
      const bobY = pw.y + Math.sin(time) * 4;

      // Ground pulsing ring
      ctx.strokeStyle = (pw.type === 'speed') ? '#4ade80' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(pw.x, pw.y + 12, 14, 5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Floating Icon
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icon = (pw.type === 'speed') ? '⚡' : '🛡️';
      ctx.fillText(icon, pw.x, bobY);

      // Name tag
      if (this.engine && this.engine.drawSharpLabel) {
        const title = (pw.type === 'speed') ? '신속 드링크' : '무적 실드';
        this.engine.drawSharpLabel(pw.x, bobY - 18, title, {
          bgColor: (pw.type === 'speed') ? 'rgba(21, 128, 61, 0.9)' : 'rgba(3, 105, 161, 0.9)',
          borderColor: (pw.type === 'speed') ? '#86efac' : '#7dd3fc',
          textColor: '#ffffff',
          fontSize: 10,
          height: 18,
          paddingX: 6
        });
      }

      ctx.restore();
    }
  }

  renderPlayerAuras(ctx) {
    const p = this.engine.player;
    const now = Date.now();

    // Golden Shield Bubble
    if (this.hasShield) {
      ctx.save();
      ctx.strokeStyle = '#fde047';
      ctx.fillStyle = 'rgba(253, 224, 71, 0.22)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y + 8, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Speed Wind Trail
    if (now < this.speedBuffUntil) {
      ctx.save();
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const ox = (Math.random() - 0.5) * 16;
        const oy = (Math.random() - 0.5) * 16;
        ctx.moveTo(p.x + ox, p.y + oy);
        ctx.lineTo(p.x + ox - p.vx * 3, p.y + oy - p.vy * 3);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  renderBall(ctx) {
    const bx = this.ball.x;
    const by = this.ball.y;

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(bx, by + 10, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blazing Hyper Super Shot Trail & Glow! (Feature 1)
    if (this.ball.isSuper) {
      ctx.save();
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 16;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(bx, by, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Fire trail particles
      if (Math.abs(this.ball.vx) > 1 || Math.abs(this.ball.vy) > 1) {
        this.particles.push({
          x: bx + (Math.random() - 0.5) * 8,
          y: by + (Math.random() - 0.5) * 8,
          vx: -this.ball.vx * 0.15 + (Math.random() - 0.5) * 2,
          vy: -this.ball.vy * 0.15 + (Math.random() - 0.5) * 2,
          color: ['#ef4444', '#f97316', '#fde047'][Math.floor(Math.random() * 3)],
          size: 4 + Math.random() * 4,
          life: 0.3,
          maxLife: 0.3
        });
      }
      ctx.restore();
    } else if (this.ball.carrierId) {
      const isBlue = (this.ball.carrierTeam === 'blue');
      ctx.strokeStyle = isBlue ? '#38bdf8' : '#f87171';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(bx, by, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 3D Soccer Ball Sprite / Emoji
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚽', bx, by);
  }

  renderBot(ctx, bot) {
    const bx = bot.x;
    const by = bot.y;
    const isBlue = (bot.team === 'blue');

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(bx, by + 14, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isBlue ? '#2563eb' : '#dc2626';
    ctx.beginPath();
    ctx.roundRect(bx - 8, by - 4, 16, 16, 3);
    ctx.fill();

    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(bx, by - 10, 7, 0, Math.PI * 2);
    ctx.fill();

    if (this.engine && this.engine.drawSharpLabel) {
      this.engine.drawSharpLabel(bx, by - 24, bot.name, {
        bgColor: isBlue ? 'rgba(30, 58, 138, 0.92)' : 'rgba(153, 27, 27, 0.92)',
        borderColor: isBlue ? '#60a5fa' : '#f87171',
        textColor: '#ffffff',
        fontSize: 10.5,
        height: 18,
        paddingX: 6
      });
    }

    if (bot.stunnedUntil && Date.now() < bot.stunnedUntil) {
      this.drawStunStars(ctx, bx, by - 26);
    }
  }

  drawStunStars(ctx, x, y) {
    ctx.save();
    const time = Date.now() * 0.006;
    for (let i = 0; i < 3; i++) {
      const angle = time + (i * Math.PI * 2) / 3;
      const sx = x + Math.cos(angle) * 14;
      const sy = y + Math.sin(angle) * 6;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💫', sx, sy);
    }
    ctx.restore();
  }

  renderGoalBanner(ctx) {
    const canvasW = ctx.canvas.width;
    const bannerH = 90;
    const bannerY = 120;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.fillRect(0, bannerY, canvasW, bannerH);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, bannerY);
    ctx.lineTo(canvasW, bannerY);
    ctx.moveTo(0, bannerY + bannerH);
    ctx.lineTo(canvasW, bannerY + bannerH);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.font = '900 28px "Pretendard", sans-serif';
    ctx.fillText(this.goalBanner.text, canvasW / 2, bannerY + 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 15px "Pretendard", sans-serif';
    ctx.fillText(this.goalBanner.subtext, canvasW / 2, bannerY + 70);

    ctx.restore();
  }

  // Scoreboard HUD at top of screen (with Super Gauge Bar & Buff Icons)
  renderHUD(ctx) {
    if (!this.engine || !this.engine.player) return;
    const p = this.engine.player;
    if (p.room !== 'playground' || !this.isPlayerInCourt(p.x, p.y)) return;

    ctx.save();

    const hudW = 490;
    const hudH = 58;
    const hudX = (ctx.canvas.width - hudW) / 2;
    const hudY = 14;

    // Dark container
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, hudH, 12);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    const score = (this.match && this.match.score) || { blue: 0, red: 0 };
    const timeRemaining = (this.match && this.match.timeRemaining !== undefined) ? this.match.timeRemaining : 150;
    const min = Math.floor(timeRemaining / 60);
    const sec = timeRemaining % 60;
    const timeStr = `${min}:${sec < 10 ? '0' : ''}${sec}`;

    // Blue Team Score
    ctx.fillStyle = '#60a5fa';
    ctx.font = '900 16px "Pretendard", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🔵 블루 ${score.blue}`, hudX + 16, hudY + 26);

    // Timer
    ctx.fillStyle = '#fde047';
    ctx.font = '900 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`⏱️ ${timeStr}`, hudX + hudW / 2, hudY + 26);

    // Red Team Score
    ctx.fillStyle = '#f87171';
    ctx.font = '900 16px "Pretendard", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${score.red} 레드 🔴`, hudX + hudW - 16, hudY + 26);

    // Super Gauge Progress Bar (Feature 1)
    const gaugeW = 140;
    const gaugeH = 10;
    const gaugeX = hudX + (hudW - gaugeW) / 2;
    const gaugeY = hudY + 38;

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(gaugeX, gaugeY, gaugeW, gaugeH, 5);
    ctx.fill();

    const fillW = Math.max(0, Math.min(gaugeW, (this.superGauge / 100) * gaugeW));
    if (fillW > 0) {
      const grad = ctx.createLinearGradient(gaugeX, gaugeY, gaugeX + gaugeW, gaugeY);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(1, '#ef4444');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(gaugeX, gaugeY, fillW, gaugeH, 5);
      ctx.fill();
    }

    // Super Label
    ctx.font = '800 10.5px "Pretendard", sans-serif';
    ctx.textAlign = 'center';
    const isSuperReady = (this.superGauge >= 100);
    ctx.fillStyle = isSuperReady ? '#fde047' : '#94a3b8';
    const superText = isSuperReady ? '⚡ SUPER READY! (Q키)' : `⚡ 궁극기 ${Math.floor(this.superGauge)}%`;
    ctx.fillText(superText, gaugeX + gaugeW / 2, gaugeY - 2);

    // Active Buffs Indicators (Feature 5)
    const now = Date.now();
    let buffStr = '';
    if (this.hasShield) buffStr += ' 🛡️실드 ';
    if (now < this.speedBuffUntil) {
      const rem = ((this.speedBuffUntil - now) / 1000).toFixed(0);
      buffStr += ` ⚡신속(${rem}s) `;
    }

    // Sub-bar indicators: Team & Tackle Status
    const canTackle = (now >= this.tackleCooldown);
    const tackleRemaining = canTackle ? 'READY' : `${((this.tackleCooldown - now) / 1000).toFixed(1)}s`;

    ctx.font = '700 11px "Pretendard", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = canTackle ? '#4ade80' : '#f59e0b';

    const myId = (this.network && this.network.socket) ? this.network.socket.id : null;
    const isCarrier = (this.ball.carrierId === myId);
    const carrierPrompt = isCarrier ? ' | ⚽ A키: 강슛' : '';
    const teamText = this.myTeam ? (this.myTeam === 'blue' ? '🔵 내 팀: 블루' : '🔴 내 팀: 레드') : '👀 관전 중';

    ctx.fillText(`${teamText} | ⚡ B키 태클 [${tackleRemaining}]${carrierPrompt}${buffStr ? ` | ${buffStr}` : ''}`, hudX + hudW / 2, hudY + hudH + 16);

    ctx.restore();
  }
}

window.BrawlBall = new BrawlBallManager();
