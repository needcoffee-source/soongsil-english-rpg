/**
 * Soongsil RPG - 3v3 Brawl Ball (브롤볼) Enhanced Engine
 * 1. Super Skill (궁극기 게이지 0~100%, 불꽃 하이퍼 슛, 메가 바디체크)
 * 2. Obstacles & Trick Shots (골대 앞 목재 상자, 벽/상자 반사 트릭샷, 2단 반사 점선 조준 가이드)
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
    this.stunImmuneUntil = 0;
    this.lastKickTime = 0;
    this.particles = [];
    this.floatingTexts = [];
    this.goalBanner = { text: '', subtext: '', timer: 0 };
    this.kickoffUntil = 0;

    // 8-Directional & Trick-Shot Aiming Vector
    this.aimDx = 0;
    this.aimDy = -1;

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
      lastTouchName: '',
      lastTouchTeam: null,
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

  isTeacherUser() {
    return !!(
      (this.engine && this.engine.player && this.engine.player.isTeacher) ||
      (window.MainApp && window.MainApp.playerData && window.MainApp.playerData.isTeacher)
    );
  }

  startTestMatch() {
    if (!this.network || !this.engine || !this.engine.player) return;
    if (!this.isTeacherUser()) {
      if (window.MainApp && window.MainApp.showToast) {
        window.MainApp.showToast('⚠️ 교사만 사용할 수 있는 기능입니다.', 'warning');
      }
      return;
    }
    const p = this.engine.player;
    const userData = {
      studentId: p.studentId || 'teacher',
      name: p.name || '선생님',
      avatar: p.avatar || 'teacher'
    };
    if (this.queue.length === 0 && !this.inQueue) {
      this.network.joinBrawlQueue(userData);
      this.inQueue = true;
    }
    this.network.startBrawlTest(userData);
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

    const btnTest = document.getElementById('btn-brawl-start-test');
    if (btnTest) {
      btnTest.style.display = this.isTeacherUser() ? 'inline-block' : 'none';
    }

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
    this.stunnedUntil = 0;
    this.stunImmuneUntil = 0;
    this.powerups = Array.isArray(match.powerups) ? [...match.powerups] : [];
    this.kickoffUntil = match.kickoffUntil || (Date.now() + 3000);

    // Reset obstacles
    this.obstacles.forEach(obs => { obs.brokenUntil = 0; });

    // Reset ball
    if (match.ball) {
      this.ball = { ...this.ball, ...match.ball, lastTouchName: '', lastTouchTeam: null, isSuper: false };
    } else {
      this.ball.x = this.court.midX;
      this.ball.y = this.court.midY;
      this.ball.vx = 0;
      this.ball.vy = 0;
      this.ball.carrierId = null;
      this.ball.carrierName = '';
      this.ball.carrierTeam = null;
      this.ball.lastTouchName = '';
      this.ball.lastTouchTeam = null;
      this.ball.isSuper = false;
    }

    // Determine my team
    const myId = (this.network && this.network.socket) ? this.network.socket.id : null;
    const bluePlayer = match.teams.blue.find(p => p.socketId === myId);
    const redPlayer = match.teams.red.find(p => p.socketId === myId);

    if (bluePlayer) {
      this.myTeam = 'blue';
      this.aimDx = 0;
      this.aimDy = -1;
      this.teleportMatchPlayer(bluePlayer.spawnX, bluePlayer.spawnY, 'up');
      this.showGoalBanner('🔵 블루팀 배정!', '남쪽 진영 (북쪽 RED 골대를 향해 공격하세요!)', 3);
    } else if (redPlayer) {
      this.myTeam = 'red';
      this.aimDx = 0;
      this.aimDy = 1;
      this.teleportMatchPlayer(redPlayer.spawnX, redPlayer.spawnY, 'down');
      this.showGoalBanner('🔴 레드팀 배정!', '북쪽 진영 (남쪽 BLUE 골대를 향해 공격하세요!)', 3);
    } else {
      this.myTeam = null;
      this.showGoalBanner('⚽ 3대3 브롤볼 경기 시작!', '관전 모드로 진행됩니다', 2.5);
    }

    if (window.AudioManager) {
      window.AudioManager.playWhistle();
    }
  }

  teleportMatchPlayer(targetX, targetY, dir = 'down') {
    if (!this.engine || !this.engine.player) return;
    const p = this.engine.player;
    p.direction = dir;
    if (p.room === 'playground') {
      p.x = targetX;
      p.y = targetY;
      for (let i = 0; i < 16; i++) {
        this.particles.push({
          x: targetX,
          y: targetY,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          color: '#38bdf8',
          size: 4 + Math.random() * 4,
          life: 0.45,
          maxLife: 0.45
        });
      }
      if (this.network && typeof this.network.sendMove === 'function') {
        this.network.sendMove(p.x, p.y, p.direction);
      }
    } else {
      this.engine.teleportTo(p.floor || 1, 'playground', targetX, targetY);
    }
  }

  onMatchTick(data) {
    if (this.match) {
      this.match.timeRemaining = data.timeRemaining;
      this.match.score = data.score;
    }
  }

  // ========================================================
  // HELPER: AIMING VECTOR, SAFE DASH & LIVE ENTITY LOOKUP
  // ========================================================

  getShotDirectionVector() {
    const p = (this.engine && this.engine.player) ? this.engine.player : null;
    if (!p) return { dx: 0, dy: -1 };

    const keys = (this.engine && this.engine.keys) ? this.engine.keys : {};
    let kx = 0, ky = 0;
    if (keys.left) kx -= 1;
    if (keys.right) kx += 1;
    if (keys.up) ky -= 1;
    if (keys.down) ky += 1;

    // 1. Diagonal keyboard input held (e.g., Up+Left, Up+Right, Down+Left, Down+Right)
    if (kx !== 0 && ky !== 0) {
      const len = Math.hypot(kx, ky);
      return { dx: kx / len, dy: ky / len };
    }

    const dir = p.direction || 'up';
    if (dir === 'up') return { dx: 0, dy: -1 };
    if (dir === 'down') return { dx: 0, dy: 1 };

    // 2. Facing Left or Right: angle bank shot (~28 deg) toward target goal so wall-bounce trick shots work on both keyboard & mobile D-pad!
    let attackGoalSign = -1; // Default: North goal
    if (this.myTeam === 'red') {
      attackGoalSign = 1; // Red attacks South goal
    } else if (this.myTeam === 'blue') {
      attackGoalSign = -1; // Blue attacks North goal
    } else {
      attackGoalSign = (p.y < this.court.midY) ? -1 : 1;
    }

    const rawDx = (dir === 'left') ? -0.88 : 0.88;
    const rawDy = attackGoalSign * 0.47;
    const norm = Math.hypot(rawDx, rawDy);
    return { dx: rawDx / norm, dy: rawDy / norm };
  }

  safeDashMove(entity, totalDx, totalDy) {
    if (!entity) return;
    const steps = 8;
    const stepX = totalDx / steps;
    const stepY = totalDy / steps;

    for (let i = 0; i < steps; i++) {
      const nextX = Math.max(this.court.minX + 16, Math.min(this.court.maxX - 16, entity.x + stepX));
      const nextY = Math.max(this.court.minY + 16, Math.min(this.court.maxY - 16, entity.y + stepY));
      if (!this.isObstacleBlocked(nextX, entity.y)) {
        entity.x = nextX;
      }
      if (!this.isObstacleBlocked(entity.x, nextY)) {
        entity.y = nextY;
      }
    }
  }

  getEntityLiveState(member) {
    if (!member) return null;
    if (member.isBot) return member;
    const myId = (this.network && this.network.socket) ? this.network.socket.id : null;
    const myStudentId = (this.engine && this.engine.player) ? this.engine.player.studentId : null;
    if (
      this.engine &&
      this.engine.player &&
      ((myId && member.socketId === myId) || (myStudentId && member.studentId === myStudentId))
    ) {
      member.x = this.engine.player.x;
      member.y = this.engine.player.y;
      member.direction = this.engine.player.direction;
      return member;
    }
    if (this.engine && this.engine.otherPlayers) {
      let liveOther = this.engine.otherPlayers[member.socketId];
      if (!liveOther && member.studentId) {
        liveOther = Object.values(this.engine.otherPlayers).find(op => op && op.studentId === member.studentId);
      }
      if (liveOther) {
        member.x = liveOther.x;
        member.y = liveOther.y;
        member.direction = liveOther.direction;
      }
    }
    return member;
  }

  // Exact visual center & feet coordinates matching engine.renderPlayer (px + 12, py + 29) vs renderBot (bx, by + 14)
  getEntityVisualPos(entity) {
    if (!entity) return { cx: 0, cy: 0, feetY: 0, headY: 0 };
    if (entity.isBot) {
      return {
        cx: entity.x,
        cy: entity.y,
        feetY: entity.y + 14,
        headY: entity.y - 26
      };
    }
    return {
      cx: entity.x + 12,
      cy: entity.y + 15,
      feetY: entity.y + 29,
      headY: entity.y - 18
    };
  }

  getPlayerTeam(p, isLocal = false) {
    if (!this.match || !this.match.teams || !p) return null;
    if (isLocal && this.myTeam) return this.myTeam;
    const pid = p.socketId || p.id || ((isLocal && this.network && this.network.socket) ? this.network.socket.id : null);
    if (pid) {
      if ((this.match.teams.blue || []).some(m => m.socketId === pid)) return 'blue';
      if ((this.match.teams.red || []).some(m => m.socketId === pid)) return 'red';
    }
    if (p.studentId) {
      if ((this.match.teams.blue || []).some(m => m.studentId && m.studentId === p.studentId)) return 'blue';
      if ((this.match.teams.red || []).some(m => m.studentId && m.studentId === p.studentId)) return 'red';
    }
    return null;
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
      if (this.engine && this.engine.player) {
        this.addFloatingText('⚡ SUPER READY!! (Q키)', this.engine.player.x + 12, this.engine.player.y - 28, '#fde047');
      }
    }
  }

  trySuper() {
    if (!this.engine || !this.engine.player) return false;
    const p = this.engine.player;
    if (p.room !== 'playground' || !this.isInsideCourtBox(p.x, p.y)) return false;

    const now = Date.now();
    if (this.kickoffUntil && now < this.kickoffUntil) return false;
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

    const myId = (this.network && this.network.socket) ? this.network.socket.id : 'me';
    const isCarrier = (this.ball.carrierId === myId);

    // Consume 100% Super Gauge
    this.superGauge = 0;

    if (isCarrier) {
      // 1-A. [🔥 HYPER SUPER SHOT] (Blazing fireball kick)
      const vec = this.getShotDirectionVector();
      const speed = 24; // Super high speed (vs 14 normal)
      const vx = vec.dx * speed;
      const vy = vec.dy * speed;

      this.ball.vx = vx;
      this.ball.vy = vy;
      this.ball.lastTouchName = p.name || '선수';
      this.ball.lastTouchTeam = this.myTeam;
      this.ball.carrierId = null;
      this.ball.carrierName = '';
      this.ball.carrierTeam = null;
      this.ball.isSuper = true;
      this.ball.pickupCooldown = now + 500;

      if (window.AudioManager) {
        window.AudioManager.playSuperShot();
      }

      this.addFloatingText('🔥 HYPER SUPER SHOT!!', p.x + 12, p.y - 24, '#f97316');
      this.createSuperFireParticles(this.ball.x, this.ball.y);

      if (this.network) {
        this.network.sendBrawlSuperShot({
          x: this.ball.x,
          y: this.ball.y,
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

      this.safeDashMove(p, dx, dy);
      if (this.network && typeof this.network.sendMove === 'function') {
        this.network.sendMove(Math.round(p.x), Math.round(p.y), p.direction);
      }

      if (window.AudioManager) {
        window.AudioManager.playTackleHit();
      }

      const pos = this.getEntityVisualPos(p);
      this.addFloatingText('⚡ MEGA BODY-CHECK!!', pos.cx, p.y - 24, '#eab308');

      // Golden shockwave particles
      for (let i = 0; i < 20; i++) {
        this.particles.push({
          x: pos.cx,
          y: pos.cy,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          color: '#fde047',
          size: 5 + Math.random() * 5,
          life: 0.5,
          maxLife: 0.5
        });
      }

      // Knock back & stun all nearby enemies in 72px radius
      this.executeMegaTackleHits(pos.cx, pos.cy);

      if (this.network) {
        this.network.sendBrawlMegaTackle({
          tacklerId: myId,
          tacklerName: p.name,
          x: pos.cx,
          y: pos.cy,
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

    for (const rawEnemy of enemies) {
      const enemy = this.getEntityLiveState(rawEnemy);
      if (!enemy) continue;
      const ePos = this.getEntityVisualPos(enemy);
      const dist = Math.hypot(ePos.cx - tx, ePos.cy - ty);
      if (dist < 72) {
        const hitPayload = {
          tacklerId: (this.network && this.network.socket) ? this.network.socket.id : 'me',
          tacklerName: this.engine.player.name,
          victimId: enemy.socketId,
          victimName: enemy.name,
          ballX: ePos.cx,
          ballY: ePos.cy,
          ballVx: (ePos.cx - tx) * 0.25,
          ballVy: (ePos.cy - ty) * 0.25
        };
        if (this.network && this.network.socket && this.network.socket.connected) {
          this.network.sendBrawlTackleHit(hitPayload);
        } else {
          this.onTackleHit(hitPayload);
        }
      }
    }
  }

  onSuperShot(data) {
    if (data.x !== undefined) this.ball.x = data.x;
    if (data.y !== undefined) this.ball.y = data.y;
    this.ball.vx = data.vx;
    this.ball.vy = data.vy;
    this.ball.lastTouchName = data.shooterName || this.ball.lastTouchName || '선수';
    this.ball.lastTouchTeam = data.team || this.ball.lastTouchTeam;
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
      if (px >= obs.x - 10 && px <= obs.x + obs.w + 10 && py >= obs.y - 10 && py <= obs.y + obs.h + 10) {
        return true;
      }
    }
    return false;
  }

  isInsideCourtBox(px, py) {
    return (
      px >= this.court.minX &&
      px <= this.court.maxX &&
      py >= this.court.minY &&
      py <= this.court.maxY
    );
  }

  isCollisionBlocked(curX, curY, nextX, nextY) {
    // 0. Freeze matched players at kickoff spot during 3-2-1 countdown
    if (this.match && this.myTeam && this.kickoffUntil && Date.now() < this.kickoffUntil) {
      return true;
    }

    // 1. Wooden Crate Obstacles inside the court
    if (this.isObstacleBlocked(nextX, nextY) && !this.isObstacleBlocked(curX, curY)) {
      return true;
    }

    // 2. 4-Sided Stadium Perimeter Wall around Brawl Ball Court (minX..maxX, minY..maxY)
    const c = this.court;
    const wallOuterMinX = c.minX - 12;
    const wallOuterMaxX = c.maxX + 12;
    const wallOuterMinY = c.minY - 12;
    const wallOuterMaxY = c.maxY + 12;

    const wallInnerMinX = c.minX + 14;
    const wallInnerMaxX = c.maxX - 14;
    const wallInnerMinY = c.minY + 14;
    const wallInnerMaxY = c.maxY - 14;

    const currentlyInside = this.isInsideCourtBox(curX, curY);

    if (currentlyInside) {
      // Players inside the court (during an active match) cannot walk out through the 4 walls
      const wasSafelyInside = (curX >= wallInnerMinX && curX <= wallInnerMaxX && curY >= wallInnerMinY && curY <= wallInnerMaxY);
      const nextSafelyInside = (nextX >= wallInnerMinX && nextX <= wallInnerMaxX && nextY >= wallInnerMinY && nextY <= wallInnerMaxY);
      if (wasSafelyInside && !nextSafelyInside) {
        return true;
      }
      if (nextX < c.minX + 8 || nextX > c.maxX - 8 || nextY < c.minY + 8 || nextY > c.maxY - 8) {
        return true;
      }
    } else {
      // Players outside the court cannot walk into the walled court area
      const wasOutsideWall = (curX < wallOuterMinX || curX > wallOuterMaxX || curY < wallOuterMinY || curY > wallOuterMaxY);
      const nextInsideWall = (nextX >= wallOuterMinX && nextX <= wallOuterMaxX && nextY >= wallOuterMinY && nextY <= wallOuterMaxY);
      if (wasOutsideWall && nextInsideWall) {
        return true;
      }
      if (this.isInsideCourtBox(nextX, nextY)) {
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
          this.ball.vx = -this.ball.vx * 0.88;
          this.ball.x += (bx > obs.x + obs.w / 2 ? overlapX : -overlapX);
        } else {
          // Vertical bounce
          this.ball.vy = -this.ball.vy * 0.88;
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
  // SERVER-SYNCHRONIZED POWER-UP DRINKS (Feature 5)
  // ========================================================

  onPowerupSpawned(drink) {
    if (!drink || !drink.id) return;
    if (!this.powerups.some(p => p.id === drink.id)) {
      this.powerups.push(drink);
    }
  }

  updatePowerupSpawns() {
    const now = Date.now();
    // Check pickup by local player inside court
    if (!this.engine || !this.engine.player) return;
    const p = this.engine.player;
    if (!this.isInsideCourtBox(p.x, p.y)) return;
    const pos = this.getEntityVisualPos(p);

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pw = this.powerups[i];
      const dist = Math.hypot(pos.cx - pw.x, pos.cy - pw.y);

      if (dist < 28) {
        // Collect!
        this.powerups.splice(i, 1);
        this.addSuperGauge(25); // +25% Super charge on drink pickup!

        if (pw.type === 'speed') {
          this.speedBuffUntil = now + 6000; // 6s speed boost
          this.addFloatingText('⚡ 신속 버프 획득 (+35% 속도)!', pos.cx, p.y - 20, '#4ade80');
        } else {
          this.hasShield = true;
          this.addFloatingText('🛡️ 무적 실드 획득 (태클 1회 반사)!', pos.cx, p.y - 20, '#38bdf8');
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
    if (p.room !== 'playground' || !this.isInsideCourtBox(p.x, p.y)) return;

    const now = Date.now();
    if (this.kickoffUntil && now < this.kickoffUntil) return;
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

    // Execute Safe Tackle Dash: 48px dash in facing direction without getting stuck in crates
    this.tackleCooldown = now + 3000;
    const dir = p.direction || 'down';
    let dx = 0, dy = 0;
    if (dir === 'up') dy = -48;
    else if (dir === 'down') dy = 48;
    else if (dir === 'left') dx = -48;
    else if (dir === 'right') dx = 48;

    this.safeDashMove(p, dx, dy);
    if (this.network && typeof this.network.sendMove === 'function') {
      this.network.sendMove(Math.round(p.x), Math.round(p.y), p.direction);
    }

    const pos = this.getEntityVisualPos(p);
    if (this.network) {
      this.network.sendBrawlTackle({
        x: pos.cx,
        y: pos.cy,
        dir,
        tacklerId: this.network.socket ? this.network.socket.id : 'me',
        tacklerName: p.name,
        team: this.myTeam
      });
    }

    this.checkTackleCollision(pos.cx, pos.cy);
  }

  checkTackleCollision(tacklerX, tacklerY) {
    if (!this.match) return;
    const now = Date.now();
    const enemyTeamKey = (this.myTeam === 'blue') ? 'red' : 'blue';
    const enemies = this.match.teams[enemyTeamKey] || [];

    for (const rawEnemy of enemies) {
      const enemy = this.getEntityLiveState(rawEnemy);
      if (!enemy) continue;
      if (enemy.stunImmuneUntil && now < enemy.stunImmuneUntil) continue;

      const ePos = this.getEntityVisualPos(enemy);
      const dist = Math.hypot(ePos.cx - tacklerX, ePos.cy - tacklerY);
      if (dist < 52) {
        // Successful tackle! Charges 35% Super Gauge
        this.addSuperGauge(35);

        let scatterVx = (ePos.cx - tacklerX) * 0.15;
        let scatterVy = (ePos.cy - tacklerY) * 0.15;
        if (Math.abs(scatterVx) < 2) scatterVx = (ePos.cx >= tacklerX ? 4 : -4);
        if (Math.abs(scatterVy) < 2) scatterVy = (ePos.cy >= tacklerY ? 4 : -4);

        const hitPayload = {
          tacklerId: (this.network && this.network.socket) ? this.network.socket.id : 'me',
          tacklerName: this.engine.player.name,
          victimId: enemy.socketId,
          victimName: enemy.name,
          ballX: ePos.cx,
          ballY: ePos.cy,
          ballVx: scatterVx,
          ballVy: scatterVy
        };

        if (this.network && this.network.socket && this.network.socket.connected) {
          this.network.sendBrawlTackleHit(hitPayload);
        } else {
          this.onTackleHit(hitPayload);
        }
        break;
      }
    }
  }

  onTackleHit(data) {
    const now = Date.now();
    if (window.AudioManager) {
      window.AudioManager.playTackleHit();
    }

    const myId = (this.network && this.network.socket) ? this.network.socket.id : 'me';

    // 1. Check if victim is local player
    if (data.victimId === myId) {
      // 🛡️ Check if local player has Shield! (Feature 5)
      if (this.hasShield) {
        this.hasShield = false; // Shield pops!
        this.addFloatingText('🛡️ SHIELD DEFLECT!! 상대 태클 반사!', this.engine.player.x + 12, this.engine.player.y - 20, '#38bdf8');
        return; // Deflected! No stun, doesn't drop ball
      }
      if (now < this.stunImmuneUntil) return;

      this.stunnedUntil = now + 1200; // 1.2s stun
      this.stunImmuneUntil = now + 2700; // 1.5s post-stun immunity
      this.addFloatingText('💫 기절 (1.2초)!', this.engine.player.x + 12, this.engine.player.y - 20, '#ef4444');
    }

    // 2. Apply stun & slight knockback to victim in match.teams (AI bots & other players)
    if (this.match && this.match.teams) {
      const allMembers = [...(this.match.teams.blue || []), ...(this.match.teams.red || [])];
      const victim = allMembers.find(m => m.socketId === data.victimId);
      if (victim) {
        victim.stunnedUntil = now + 1200;
        victim.stunImmuneUntil = now + 2700;
        if (victim.isBot) {
          this.safeDashMove(victim, (data.ballVx || 0) * 3, (data.ballVy || 0) * 3);
        }
      }
    }
    if (this.engine && this.engine.otherPlayers && this.engine.otherPlayers[data.victimId]) {
      this.engine.otherPlayers[data.victimId].stunnedUntil = now + 1200;
    }

    this.addFloatingText('⚡ TACKLE! 상대 기절!', data.ballX || this.ball.x, data.ballY || this.ball.y, '#f59e0b');

    // 3. Ball scatters loose if the victim was carrying the ball (or if ball was already loose)
    if (!this.ball.carrierId || this.ball.carrierId === data.victimId) {
      this.ball.x = data.ballX || this.ball.x;
      this.ball.y = data.ballY || this.ball.y;
      this.ball.vx = data.ballVx || (Math.random() * 6 - 3);
      this.ball.vy = data.ballVy || (Math.random() * 6 - 3);
      this.ball.carrierId = null;
      this.ball.carrierName = '';
      this.ball.carrierTeam = null;
      this.ball.isSuper = false;
      this.ball.pickupCooldown = now + 500;
    }
  }

  tryKick() {
    if (!this.engine || !this.engine.player) return false;
    const p = this.engine.player;
    if (this.kickoffUntil && Date.now() < this.kickoffUntil) return false;
    const myId = (this.network && this.network.socket) ? this.network.socket.id : 'me';

    if (this.ball.carrierId !== myId) return false;

    // Shoot along 8-directional / tactical bank-shot vector with speed 14
    const vec = this.getShotDirectionVector();
    const speed = 14;
    const vx = vec.dx * speed;
    const vy = vec.dy * speed;

    this.addSuperGauge(15); // +15% Super gauge on shooting

    this.ball.vx = vx;
    this.ball.vy = vy;
    this.ball.lastTouchName = p.name || '선수';
    this.ball.lastTouchTeam = this.myTeam;
    this.ball.carrierId = null;
    this.ball.carrierName = '';
    this.ball.carrierTeam = null;
    this.ball.isSuper = false;
    this.ball.pickupCooldown = Date.now() + 400;

    if (this.network) {
      this.network.sendBrawlKick({
        x: this.ball.x,
        y: this.ball.y,
        vx,
        vy,
        shooterId: myId,
        shooterName: p.name,
        team: this.myTeam
      });
    }

    if (window.AudioManager) {
      window.AudioManager.playBallKick();
    }
    this.createKickParticles(this.ball.x, this.ball.y);
    return true;
  }

  onBallKicked(data) {
    if (data.x !== undefined) this.ball.x = data.x;
    if (data.y !== undefined) this.ball.y = data.y;
    this.ball.vx = data.vx;
    this.ball.vy = data.vy;
    this.ball.lastTouchName = data.shooterName || this.ball.lastTouchName || '선수';
    this.ball.lastTouchTeam = data.team || this.ball.lastTouchTeam;
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
    if (data.x !== undefined) this.ball.x = data.x;
    if (data.y !== undefined) this.ball.y = data.y;
    if (data.vx !== undefined) this.ball.vx = data.vx;
    if (data.vy !== undefined) this.ball.vy = data.vy;
    if (data.carrierId !== undefined) {
      this.ball.carrierId = data.carrierId;
      this.ball.carrierName = data.carrierName || '';
      this.ball.carrierTeam = data.carrierTeam || null;
      if (data.carrierName) this.ball.lastTouchName = data.carrierName;
      if (data.carrierTeam) this.ball.lastTouchTeam = data.carrierTeam;
    }
  }

  onGoalScored(data) {
    if (this.match && data.score) {
      this.match.score = data.score;
      this.match.status = 'goal_celebration';
    }
    const isBlue = (data.team === 'blue');
    const teamName = isBlue ? '🔵 블루팀' : '🔴 레드팀';
    const sub = `${data.scorerName} 선수의 환상적인 골! (스코어 ${data.score.blue} : ${data.score.red})`;

    this.showGoalBanner(`⚽ GOAL!! ${teamName} 득점! 🔥`, sub, 2.5);
    this.addSuperGauge(50); // Scoring or being on field awards super energy!

    if (window.AudioManager) {
      window.AudioManager.playWhistle();
      setTimeout(() => {
        if (window.AudioManager) window.AudioManager.playFanfare();
      }, 300);
    }

    // Confetti celebration
    this.spawnGoalConfetti();
  }

  spawnGoalConfetti() {
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

  onBallReset(ball, kickoffUntil) {
    this.ball.x = (ball && ball.x !== undefined) ? ball.x : this.court.midX;
    this.ball.y = (ball && ball.y !== undefined) ? ball.y : this.court.midY;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.carrierId = null;
    this.ball.carrierName = '';
    this.ball.carrierTeam = null;
    this.ball.isSuper = false;
    this.ball.pickupCooldown = Date.now() + 500;
    this.stunnedUntil = 0;

    // Restore match playing state & kickoff positions for players and AI bots!
    if (this.match) {
      this.match.status = 'playing';
      this.kickoffUntil = kickoffUntil || (Date.now() + 3000);
      const myId = (this.network && this.network.socket) ? this.network.socket.id : null;
      const allMembers = [...(this.match.teams.blue || []), ...(this.match.teams.red || [])];
      for (const m of allMembers) {
        if (m.spawnX !== undefined && m.spawnY !== undefined) {
          m.x = m.spawnX;
          m.y = m.spawnY;
        }
        m.stunnedUntil = 0;
        if (m.socketId === myId && this.engine && this.engine.player && this.engine.player.room === 'playground') {
          this.engine.player.x = m.spawnX;
          this.engine.player.y = m.spawnY;
        }
      }
      if (window.AudioManager) {
        window.AudioManager.playWhistle();
      }
    }
  }

  onMatchRewards() {
    // 브롤볼은 보상(EXP/Gold) 없이 순수 미니게임으로 진행
  }

  onMatchEnded(data) {
    if (this.match) {
      this.match.status = 'ended';
    }
    this.kickoffUntil = 0;
    this.powerups = [];

    if (data.winnerTeam === 'aborted') {
      this.showGoalBanner('⚠️ 경기 중단! 참가자 이탈로 종료', data.reason || '참가자 중 한 명이 경기를 이탈하여 매치가 종료되었습니다', 3.5);
    } else {
      const isDraw = data.winnerTeam === 'draw';
      const winnerText = isDraw ? '무승부!' : (data.winnerTeam === 'blue' ? '🔵 블루팀 최종 승리!' : '🔴 레드팀 최종 승리!');
      this.showGoalBanner(`🏁 경기 종료! ${winnerText}`, `최종 스코어 [블루 ${data.score.blue} : ${data.score.red} 레드]`, 4);
    }

    const cleanupDelay = (data.winnerTeam === 'aborted') ? 2200 : 4500;
    setTimeout(() => {
      this.match = null;
      this.myTeam = null;
      this.superGauge = 0;
      this.hasShield = false;
      this.speedBuffUntil = 0;
      this.stunnedUntil = 0;
      if (this.engine && this.engine.player && this.engine.player.room === 'playground' && this.isInsideCourtBox(this.engine.player.x, this.engine.player.y)) {
        const exitX = (41 + Math.floor(Math.random() * 5)) * 32;
        const exitY = 20 * 32;
        this.teleportMatchPlayer(exitX, exitY, 'up');
      }
    }, cleanupDelay);
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
      px >= this.court.minX - 64 &&
      px <= this.court.maxX + 64 &&
      py >= this.court.minY - 4 * 32 &&
      py <= this.court.maxY + 64
    );
  }

  // ========================================================
  // UPDATE LOOP
  // ========================================================

  update(dt) {
    if (!this.engine || !this.engine.player) return;
    if (this.engine.player.room !== 'playground') return;

    // Ensure players cannot stay trapped inside the walled court when no active match is assigned to them
    if ((!this.match || !this.myTeam) && this.isInsideCourtBox(this.engine.player.x, this.engine.player.y)) {
      this.teleportMatchPlayer(43 * 32, 20 * 32, 'up');
    }

    const myId = (this.network && this.network.socket) ? this.network.socket.id : 'me';
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

    // 4. Stun & Kickoff Countdown freeze
    if (now < this.stunnedUntil || (this.match && this.myTeam && this.kickoffUntil && now < this.kickoffUntil)) {
      this.engine.player.vx = 0;
      this.engine.player.vy = 0;
      if (this.match && this.myTeam && this.kickoffUntil && now < this.kickoffUntil) {
        const allMembers = [...(this.match.teams.blue || []), ...(this.match.teams.red || [])];
        const me = allMembers.find(m => m.socketId === myId);
        if (me && me.spawnX !== undefined && me.spawnY !== undefined) {
          this.engine.player.x = me.spawnX;
          this.engine.player.y = me.spawnY;
        }
      }
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
        const found = all.find(p => p.socketId === this.ball.carrierId);
        carrierObj = this.getEntityLiveState(found);
      }

      if (carrierObj) {
        const pos = this.getEntityVisualPos(carrierObj);
        const dir = carrierObj.direction || 'down';
        if (dir === 'up') {
          this.ball.x = pos.cx;
          this.ball.y = pos.cy - 18;
        } else if (dir === 'down') {
          this.ball.x = pos.cx;
          this.ball.y = pos.feetY + 6;
        } else if (dir === 'left') {
          this.ball.x = pos.cx - 18;
          this.ball.y = pos.feetY - 4;
        } else if (dir === 'right') {
          this.ball.x = pos.cx + 18;
          this.ball.y = pos.feetY - 4;
        }
      }
    } else {
      // Loose moving ball
      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;
      this.ball.vx *= 0.965;
      this.ball.vy *= 0.965;

      if (Math.abs(this.ball.vx) < 0.08 && Math.abs(this.ball.vy) < 0.08) {
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.isSuper = false;
      }

      // Obstacle bounces & Super shot destruction
      this.checkBallObstacleCollisions();

      // Side wall bounces (West: 31*32, East: 55*32)
      if (this.ball.x <= this.court.minX + 12) {
        this.ball.x = this.court.minX + 12;
        this.ball.vx = -this.ball.vx * 0.85;
      } else if (this.ball.x >= this.court.maxX - 12) {
        this.ball.x = this.court.maxX - 12;
        this.ball.vx = -this.ball.vx * 0.85;
      }

      // North Goal Check (Red Team Net: x: 40~46*32, y: 22*32)
      if (this.ball.y <= this.court.northGoalY + 8) {
        if (this.ball.x >= this.court.goalMinX && this.ball.x <= this.court.goalMaxX) {
          this.ball.vy = 0;
          this.ball.vx = 0;
          if (this.match && this.match.status === 'playing' && this.network) {
            const scorer = this.ball.carrierName || this.ball.lastTouchName || '블루팀';
            this.match.status = 'goal_celebration';
            this.network.notifyBrawlGoal('blue', scorer);
          }
        } else {
          this.ball.y = this.court.northGoalY + 8;
          this.ball.vy = -this.ball.vy * 0.75;
        }
      }

      // South Goal Check (Blue Team Net: x: 40~46*32, y: 48*32)
      if (this.ball.y >= this.court.southGoalY - 8) {
        if (this.ball.x >= this.court.goalMinX && this.ball.x <= this.court.goalMaxX) {
          this.ball.vy = 0;
          this.ball.vx = 0;
          if (this.match && this.match.status === 'playing' && this.network) {
            const scorer = this.ball.carrierName || this.ball.lastTouchName || '레드팀';
            this.match.status = 'goal_celebration';
            this.network.notifyBrawlGoal('red', scorer);
          }
        } else {
          this.ball.y = this.court.southGoalY - 8;
          this.ball.vy = -this.ball.vy * 0.75;
        }
      }

      // Ball pickup by local player
      const canPickupMatch = this.match && this.match.status === 'playing' && (!this.kickoffUntil || now >= this.kickoffUntil);
      if (canPickupMatch && this.isInsideCourtBox(this.engine.player.x, this.engine.player.y) && now >= this.ball.pickupCooldown && now >= this.stunnedUntil) {
        const pPos = this.getEntityVisualPos(this.engine.player);
        const dist = Math.hypot(pPos.cx - this.ball.x, pPos.cy - this.ball.y);
        if (dist < 28) {
          this.ball.carrierId = myId;
          this.ball.carrierName = this.engine.player.name || '선수';
          this.ball.carrierTeam = this.myTeam;
          this.ball.lastTouchName = this.engine.player.name || '선수';
          this.ball.lastTouchTeam = this.myTeam;
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

  moveBotWithObstacleAvoidance(bot, moveDx, moveDy) {
    const nextX = bot.x + moveDx;
    const nextY = bot.y + moveDy;
    if (!this.isObstacleBlocked(nextX, bot.y)) {
      bot.x = nextX;
    } else {
      bot.x += (bot.x < this.court.midX ? -2.0 : 2.0);
    }
    if (!this.isObstacleBlocked(bot.x, nextY)) {
      bot.y = nextY;
    } else {
      // Steer laterally around goal/midfield crates
      bot.x += (bot.x < this.court.midX ? -2.2 : 2.2);
    }
  }

  updateBotAI(dt) {
    if (!this.match || this.match.status !== 'playing') return;
    const now = Date.now();
    if (this.kickoffUntil && now < this.kickoffUntil) return;
    const allBots = [...this.match.teams.blue, ...this.match.teams.red].filter(p => p.isBot);

    for (const bot of allBots) {
      if (bot.stunnedUntil && now < bot.stunnedUntil) continue;

      const isBlue = (bot.team === 'blue');
      const targetGoalY = isBlue ? this.court.northGoalY : this.court.southGoalY;
      const isCarrier = (this.ball.carrierId === bot.socketId);

      if (isCarrier) {
        // Aim through open gap between the two goal crates (43*32 is open between 41*32 and 45*32)
        const targetX = this.court.midX;
        const targetY = targetGoalY;
        const angle = Math.atan2(targetY - bot.y, targetX - bot.x);
        const speed = 1.65;
        this.moveBotWithObstacleAvoidance(bot, Math.cos(angle) * speed, Math.sin(angle) * speed);

        bot.direction = Math.abs(targetY - bot.y) > Math.abs(targetX - bot.x)
          ? (targetY > bot.y ? 'down' : 'up')
          : (targetX > bot.x ? 'right' : 'left');

        const distToGoal = Math.hypot(targetX - bot.x, targetY - bot.y);
        if (distToGoal < 165) {
          const shootSpeed = 13;
          this.ball.vx = Math.cos(angle) * shootSpeed;
          this.ball.vy = Math.sin(angle) * shootSpeed;
          this.ball.lastTouchName = bot.name;
          this.ball.lastTouchTeam = bot.team;
          this.ball.carrierId = null;
          this.ball.carrierName = '';
          this.ball.carrierTeam = null;
          this.ball.pickupCooldown = now + 450;

          if (this.network) {
            this.network.sendBrawlKick({
              x: this.ball.x,
              y: this.ball.y,
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
          this.moveBotWithObstacleAvoidance(bot, Math.cos(angle) * speed, Math.sin(angle) * speed);

          const distToBall = Math.hypot(this.ball.x - bot.x, this.ball.y - bot.y);
          if (distToBall < 24 && now >= this.ball.pickupCooldown) {
            this.ball.carrierId = bot.socketId;
            this.ball.carrierName = bot.name;
            this.ball.carrierTeam = bot.team;
            this.ball.lastTouchName = bot.name;
            this.ball.lastTouchTeam = bot.team;
            this.ball.vx = 0;
            this.ball.vy = 0;
          }
        } else {
          const carrierTeam = this.ball.carrierTeam;
          if (carrierTeam && carrierTeam !== bot.team) {
            const angle = Math.atan2(this.ball.y - bot.y, this.ball.x - bot.x);
            const speed = 1.7;
            this.moveBotWithObstacleAvoidance(bot, Math.cos(angle) * speed, Math.sin(angle) * speed);

            const dist = Math.hypot(this.ball.x - bot.x, this.ball.y - bot.y);
            if (dist < 42 && (!bot.tackleCooldown || now >= bot.tackleCooldown)) {
              bot.tackleCooldown = now + 4200;
              const hitPayload = {
                tacklerId: bot.socketId,
                tacklerName: bot.name,
                victimId: this.ball.carrierId,
                victimName: this.ball.carrierName,
                ballX: this.ball.x,
                ballY: this.ball.y,
                ballVx: (Math.random() - 0.5) * 8,
                ballVy: (Math.random() - 0.5) * 8
              };
              if (this.network && this.network.socket && this.network.socket.connected) {
                this.network.sendBrawlTackleHit(hitPayload);
              } else {
                this.onTackleHit(hitPayload);
              }
            }
          } else {
            const forwardY = isBlue ? (bot.y - 1.2) : (bot.y + 1.2);
            const clampedY = Math.max(this.court.minY + 32, Math.min(this.court.maxY - 32, forwardY));
            this.moveBotWithObstacleAvoidance(bot, 0, clampedY - bot.y);
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

    // 1. 4-Sided Enclosed Stadium LED Perimeter Wall (West, East, North, South)
    const courtW = c.maxX - c.minX;
    const courtH = c.maxY - c.minY;

    ctx.fillStyle = '#0f172a';
    // West & East full-height walls
    ctx.fillRect(c.minX - 4, c.minY - 4, 8, courtH + 8);
    ctx.fillRect(c.maxX - 4, c.minY - 4, 8, courtH + 8);
    // North & South walls flanking the goals
    ctx.fillRect(c.minX - 4, c.minY - 4, c.goalMinX - c.minX + 4, 8);
    ctx.fillRect(c.goalMaxX, c.minY - 4, c.maxX - c.goalMaxX + 4, 8);
    ctx.fillRect(c.minX - 4, c.maxY - 4, c.goalMinX - c.minX + 4, 8);
    ctx.fillRect(c.goalMaxX, c.maxY - 4, c.maxX - c.goalMaxX + 4, 8);

    // Glowing LED strips along West & East walls
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    for (let by = c.minY + 12; by < c.maxY - 8; by += 24) {
      ctx.fillRect(c.minX - 2, by, 4, 12);
      ctx.fillRect(c.maxX - 2, by, 4, 12);
    }

    // Glowing Red LED strips along North wall
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    for (let bx = c.minX + 12; bx < c.goalMinX - 8; bx += 24) {
      ctx.fillRect(bx, c.minY - 2, 12, 4);
    }
    for (let bx = c.goalMaxX + 8; bx < c.maxX - 8; bx += 24) {
      ctx.fillRect(bx, c.minY - 2, 12, 4);
    }

    // Glowing Blue LED strips along South wall
    ctx.fillStyle = '#3b82f6';
    ctx.shadowColor = '#3b82f6';
    for (let bx = c.minX + 12; bx < c.goalMinX - 8; bx += 24) {
      ctx.fillRect(bx, c.maxY - 2, 12, 4);
    }
    for (let bx = c.goalMaxX + 8; bx < c.maxX - 8; bx += 24) {
      ctx.fillRect(bx, c.maxY - 2, 12, 4);
    }
    ctx.shadowBlur = 0;

    // 4 Corner Stadium Pillars
    const corners = [
      [c.minX, c.minY],
      [c.maxX, c.minY],
      [c.minX, c.maxY],
      [c.maxX, c.maxY]
    ];
    for (const [cx, cy] of corners) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 6, cy - 6, 12, 12);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 6, cy - 6, 12, 12);
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
      this.engine.drawSharpLabel(c.midX, c.midY + 48, '⚡ 3대3 브롤볼 ARENA ⚽', {
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

    // 0. Render Team Floor Aura Rings & Badges under all 6 match participants (Item 1)
    this.renderTeamRings(ctx);

    // 1. Render Power-up Drinks (Feature 5)
    this.renderPowerups(ctx);

    // 2. Render AI Bots
    if (this.match && this.match.teams) {
      const allBots = [...this.match.teams.blue, ...this.match.teams.red].filter(p => p.isBot);
      for (const bot of allBots) {
        this.renderBot(ctx, bot);
      }
    }

    // 3. Render Aiming Trajectory Guide Arrow (Item 2)
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

    // 7. Render Stun Stars on local player & other human players
    const now = Date.now();
    if (now < this.stunnedUntil) {
      const myPos = this.getEntityVisualPos(this.engine.player);
      this.drawStunStars(ctx, myPos.cx, myPos.headY);
    }
    if (this.engine.otherPlayers) {
      for (const id in this.engine.otherPlayers) {
        const op = this.engine.otherPlayers[id];
        if (op && op.room === 'playground' && op.stunnedUntil && now < op.stunnedUntil) {
          const opPos = this.getEntityVisualPos(op);
          this.drawStunStars(ctx, opPos.cx, opPos.headY);
        }
      }
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

    ctx.restore();
  }

  // Team Color Aura Rings under all 6 match participants (Item 1)
  renderTeamRings(ctx) {
    if (!this.match || !this.match.teams) return;
    const myId = (this.network && this.network.socket) ? this.network.socket.id : 'me';
    const myStudentId = (this.engine && this.engine.player) ? this.engine.player.studentId : null;
    const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.08;
    const allMembers = [...(this.match.teams.blue || []), ...(this.match.teams.red || [])];

    for (const member of allMembers) {
      const live = this.getEntityLiveState(member);
      if (!live || live.x === undefined || live.y === undefined) continue;

      const isBlue = (member.team === 'blue');
      const isMe = (member.socketId === myId) || !!(myStudentId && member.studentId === myStudentId);
      const pos = this.getEntityVisualPos(live);
      const rx = pos.cx;
      const ry = pos.feetY;

      ctx.save();

      // Highlight outer ring for local player
      if (isMe) {
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(rx, ry, 22 * pulse, 8.5 * pulse, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Glowing Team Floor Ring (Blue vs Red) locked to character's exact ground shadow
      ctx.fillStyle = isBlue ? 'rgba(37, 99, 235, 0.38)' : 'rgba(220, 38, 38, 0.38)';
      ctx.strokeStyle = isBlue ? '#60a5fa' : '#f87171';
      ctx.lineWidth = 3;
      ctx.shadowColor = isBlue ? '#3b82f6' : '#ef4444';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(rx, ry, 17, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.restore();
    }
  }

  // 2-Segment Raycast Trajectory Dashed Aiming Arrow (Item 2)
  renderAimingTrajectory(ctx) {
    const myId = (this.network && this.network.socket) ? this.network.socket.id : 'me';
    if (this.ball.carrierId !== myId) return;

    const p = this.engine.player;
    const pPos = this.getEntityVisualPos(p);
    const vec = this.getShotDirectionVector();
    let dx = vec.dx;
    let dy = vec.dy;

    ctx.save();
    const isSuperReady = (this.superGauge >= 100);
    const mainColor = isSuperReady ? '#f97316' : '#38bdf8';
    const glowColor = isSuperReady ? 'rgba(249, 115, 22, 0.3)' : 'rgba(56, 189, 248, 0.25)';

    const startX = pPos.cx;
    const startY = pPos.cy;
    const now = Date.now();
    const totalDist = isSuperReady ? 230 : 195;
    const stepSize = 4;
    const maxSteps = Math.floor(totalDist / stepSize);

    let curX = startX;
    let curY = startY;
    let bouncePoint = null;

    for (let s = 0; s < maxSteps; s++) {
      const nextX = curX + dx * stepSize;
      const nextY = curY + dy * stepSize;

      // Check side walls
      if (!bouncePoint && (nextX <= this.court.minX + 12 || nextX >= this.court.maxX - 12)) {
        bouncePoint = { x: nextX, y: nextY };
        dx = -dx;
        curX = nextX;
        curY = nextY;
        continue;
      }

      // Check obstacle crate bounce (only when not Super, since Super breaks crates!)
      if (!bouncePoint && !isSuperReady) {
        let hitObs = null;
        for (const obs of this.obstacles) {
          if (obs.brokenUntil && now < obs.brokenUntil) continue;
          if (nextX >= obs.x - 8 && nextX <= obs.x + obs.w + 8 && nextY >= obs.y - 8 && nextY <= obs.y + obs.h + 8) {
            hitObs = obs;
            break;
          }
        }
        if (hitObs) {
          bouncePoint = { x: curX, y: curY };
          const cx = hitObs.x + hitObs.w / 2;
          const cy = hitObs.y + hitObs.h / 2;
          if (Math.abs(curX - cx) > Math.abs(curY - cy)) {
            dx = -dx;
          } else {
            dy = -dy;
          }
          continue;
        }
      }

      curX = nextX;
      curY = nextY;
    }

    // 1. Soft outer directional track
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    if (bouncePoint) ctx.lineTo(bouncePoint.x, bouncePoint.y);
    ctx.lineTo(curX, curY);
    ctx.stroke();

    // 2. Animated marching dashed guide line
    ctx.setLineDash([9, 6]);
    ctx.lineDashOffset = -((now * 0.045) % 15);
    ctx.lineWidth = 3;
    ctx.strokeStyle = mainColor;
    ctx.shadowColor = mainColor;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    if (bouncePoint) {
      ctx.lineTo(bouncePoint.x, bouncePoint.y);
    }
    ctx.lineTo(curX, curY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Bounce indicator ring if trajectory ricochets off wall/crate
    if (bouncePoint) {
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(bouncePoint.x, bouncePoint.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Crisp Directional Arrowhead (▶) at trajectory tip
    const endAngle = Math.atan2(dy, dx);
    const headLen = 14;
    ctx.fillStyle = isSuperReady ? '#fde047' : '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(curX + Math.cos(endAngle) * 4, curY + Math.sin(endAngle) * 4);
    ctx.lineTo(
      curX - headLen * Math.cos(endAngle - Math.PI / 6),
      curY - headLen * Math.sin(endAngle - Math.PI / 6)
    );
    ctx.lineTo(
      curX - headLen * Math.cos(endAngle + Math.PI / 6),
      curY - headLen * Math.sin(endAngle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

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
    const pPos = this.getEntityVisualPos(p);
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
      ctx.arc(pPos.cx, pPos.cy - 3, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Speed Wind Trail (computed from p.direction so coordinates are never NaN)
    if (now < this.speedBuffUntil) {
      ctx.save();
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      const dir = p.direction || 'down';
      let trailX = 0, trailY = 0;
      if (dir === 'up') trailY = 14;
      else if (dir === 'down') trailY = -14;
      else if (dir === 'left') trailX = 14;
      else if (dir === 'right') trailX = -14;

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const ox = (Math.random() - 0.5) * 16;
        const oy = (Math.random() - 0.5) * 16;
        ctx.moveTo(pPos.cx + ox, pPos.cy + oy);
        ctx.lineTo(pPos.cx + ox + trailX, pPos.cy + oy + trailY);
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
    const screenW = (this.engine && this.engine.width) ? this.engine.width : 860;
    const bannerH = 90;
    const bannerY = 120;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.fillRect(0, bannerY, screenW, bannerH);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, bannerY);
    ctx.lineTo(screenW, bannerY);
    ctx.moveTo(0, bannerY + bannerH);
    ctx.lineTo(screenW, bannerY + bannerH);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.font = '900 26px "Pretendard", sans-serif';
    ctx.fillText(this.goalBanner.text, screenW / 2, bannerY + 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 14.5px "Pretendard", sans-serif';
    ctx.fillText(this.goalBanner.subtext, screenW / 2, bannerY + 68);

    ctx.restore();
  }

  renderKickoffCountdown(ctx) {
    if (!this.match || this.match.status !== 'playing' || !this.kickoffUntil) return;
    const remMs = this.kickoffUntil - Date.now();
    if (remMs <= -650) return;

    let label = '';
    let color = '#fde047';
    if (remMs > 2000) {
      label = '⏳ 킥오프 3';
      color = '#38bdf8';
    } else if (remMs > 1000) {
      label = '⏳ 킥오프 2';
      color = '#fde047';
    } else if (remMs > 0) {
      label = '⏳ 킥오프 1';
      color = '#f97316';
    } else {
      label = '⚽ START!!';
      color = '#4ade80';
    }

    const screenW = (this.engine && this.engine.width) ? this.engine.width : 860;
    const boxW = 220;
    const boxH = 48;
    const boxX = (screenW - boxW) / 2;
    const boxY = (this.goalBanner.timer > 0) ? 222 : 128;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 24);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = '900 24px "Pretendard", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, screenW / 2, boxY + boxH / 2 + 1);
    ctx.restore();
  }

  // Scoreboard HUD at top of screen (with Super Gauge Bar, Buff Icons & Screen-Space Goal Banner)
  renderHUD(ctx) {
    if (!this.engine || !this.engine.player) return;
    const p = this.engine.player;
    if (p.room !== 'playground') return;

    // Always render goal/announcement banner in screen-space if active on playground
    if (this.goalBanner.timer > 0) {
      this.renderGoalBanner(ctx);
    }

    if (!this.isPlayerInCourt(p.x, p.y)) return;

    // Render 3-2-1 Kickoff Countdown overlay (Item 3)
    this.renderKickoffCountdown(ctx);

    ctx.save();

    const screenW = this.engine.width || 860;
    const hudW = 490;
    const hudH = 66;
    const hudX = (screenW - hudW) / 2;
    const hudY = 12;

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
    ctx.fillText(`🔵 블루 ${score.blue}`, hudX + 16, hudY + 24);

    // Timer
    ctx.fillStyle = '#fde047';
    ctx.font = '900 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`⏱️ ${timeStr}`, hudX + hudW / 2, hudY + 24);

    // Red Team Score
    ctx.fillStyle = '#f87171';
    ctx.font = '900 16px "Pretendard", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${score.red} 레드 🔴`, hudX + hudW - 16, hudY + 24);

    // Super Gauge Progress Bar (Feature 1)
    const gaugeW = 150;
    const gaugeH = 10;
    const gaugeX = hudX + (hudW - gaugeW) / 2;
    const gaugeY = hudY + 46;

    // Super Label (above progress bar with clean vertical clearance)
    ctx.font = '800 10.5px "Pretendard", sans-serif';
    ctx.textAlign = 'center';
    const isSuperReady = (this.superGauge >= 100);
    ctx.fillStyle = isSuperReady ? '#fde047' : '#94a3b8';
    const superText = isSuperReady ? '⚡ SUPER READY! (Q키)' : `⚡ 궁극기 ${Math.floor(this.superGauge)}%`;
    ctx.fillText(superText, gaugeX + gaugeW / 2, gaugeY - 4);

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

    let teamText = '⚽ 매치 대기 중 (코치에게 3v3 신청)';
    if (this.match) {
      teamText = this.myTeam ? (this.myTeam === 'blue' ? '🔵 내 팀: 블루' : '🔴 내 팀: 레드') : '👀 관전 중';
    }

    ctx.fillText(`${teamText} | ⚡ SHIFT/B키 태클 [${tackleRemaining}] | ⚽ SPACE키: 슛 / Q키: 필살슛${buffStr ? ` | ${buffStr}` : ''}`, hudX + hudW / 2, hudY + hudH + 15);

    ctx.restore();
  }
}

window.BrawlBall = new BrawlBallManager();
