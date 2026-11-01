/**
 * Soongsil RPG - 3v3 Brawl Ball (브롤볼) Minigame
 * Right Half-Court (x: 31~55, y: 22~48), North-South Layout
 * 6-Player Real-time Queue, Random 3:3 Team Assignment (Blue vs Red),
 * Dribbling, Shooting, Sliding Tackle, Stun, AI Bots, Scoreboard HUD
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

    // Default ball
    this.ball = {
      x: 43 * 32,
      y: 35 * 32,
      vx: 0,
      vy: 0,
      radius: 12,
      carrierId: null,
      carrierName: '',
      carrierTeam: null,
      pickupCooldown: 0
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

    // Reset ball
    if (match.ball) {
      this.ball = { ...this.ball, ...match.ball };
    } else {
      this.ball.x = this.court.midX;
      this.ball.y = this.court.midY;
      this.ball.vx = 0;
      this.ball.vy = 0;
      this.ball.carrierId = null;
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

  onBallKicked(data) {
    this.ball.vx = data.vx;
    this.ball.vy = data.vy;
    this.ball.carrierId = null;
    this.ball.carrierName = '';
    this.ball.carrierTeam = null;
    this.ball.pickupCooldown = Date.now() + 400; // 0.4s cooldown

    if (window.AudioManager) {
      window.AudioManager.playBallKick();
    }
    this.createKickParticles(this.ball.x, this.ball.y);
  }

  onPlayerTackled(data) {
    // Sliding dust line
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

  onTackleHit(data) {
    if (window.AudioManager) {
      window.AudioManager.playTackleHit();
    }

    this.addFloatingText('⚡ TACKLE! 상대 기절!', data.ballX || this.ball.x, data.ballY || this.ball.y, '#f59e0b');

    const myId = (this.network && this.network.socket) ? this.network.socket.id : null;
    if (data.victimId === myId) {
      this.stunnedUntil = Date.now() + 1200; // 1.2s stun
      this.addFloatingText('💫 기절 (1.2초)!', this.engine.player.x, this.engine.player.y - 20, '#ef4444');
    }

    // Ball scatters loose
    this.ball.x = data.ballX || this.ball.x;
    this.ball.y = data.ballY || this.ball.y;
    this.ball.vx = data.ballVx || (Math.random() * 6 - 3);
    this.ball.vy = data.ballVy || (Math.random() * 6 - 3);
    this.ball.carrierId = null;
    this.ball.carrierName = '';
    this.ball.carrierTeam = null;
    this.ball.pickupCooldown = Date.now() + 500;
  }

  onBallSynced(data) {
    // Smooth ball position update
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

    if (window.AudioManager) {
      window.AudioManager.playWhistle();
      setTimeout(() => {
        if (window.AudioManager) window.AudioManager.playFanfare();
      }, 300);
    }

    // Confetti celebration particles
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
    }, 4500);
  }

  showGoalBanner(text, subtext, durationSec = 3) {
    this.goalBanner = {
      text,
      subtext,
      timer: durationSec
    };
  }

  addFloatingText(text, x, y, color = '#ffffff') {
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      life: 1.2,
      maxLife: 1.2
    });
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

  isPlayerInCourt(px, py) {
    return (
      px >= this.court.minX - 32 &&
      px <= this.court.maxX + 32 &&
      py >= this.court.minY - 32 &&
      py <= this.court.maxY + 32
    );
  }

  // Called when player presses B / Shift (Tackle)
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
    this.tackleCooldown = now + 3000; // 3초 쿨타임
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

    // Check collision with opposing carrier or bots
    this.checkTackleCollision(p.x, p.y);
  }

  checkTackleCollision(tacklerX, tacklerY) {
    if (!this.match) return;

    // Check opposing players & bots
    const enemyTeamKey = (this.myTeam === 'blue') ? 'red' : 'blue';
    const enemies = this.match.teams[enemyTeamKey] || [];

    for (const enemy of enemies) {
      const dist = Math.hypot(enemy.x - tacklerX, enemy.y - tacklerY);
      if (dist < 52) {
        // Hit enemy!
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

  // Called when player presses A / Space (Shoot / Kick)
  tryKick() {
    if (!this.engine || !this.engine.player) return false;
    const p = this.engine.player;
    const myId = (this.network && this.network.socket) ? this.network.socket.id : null;

    if (this.ball.carrierId !== myId) return false;

    // Shoot in facing direction with speed 14
    const dir = p.direction || 'up';
    let vx = 0, vy = 0;
    const speed = 14;
    if (dir === 'up') vy = -speed;
    else if (dir === 'down') vy = speed;
    else if (dir === 'left') vx = -speed;
    else if (dir === 'right') vx = speed;

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
    this.ball.pickupCooldown = Date.now() + 400;

    if (window.AudioManager) {
      window.AudioManager.playBallKick();
    }
    this.createKickParticles(this.ball.x, this.ball.y);
    return true;
  }

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

    // 5. Ball physics
    if (this.ball.carrierId) {
      // Pin ball to carrier
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
      // Moving loose ball
      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;
      this.ball.vx *= 0.965;
      this.ball.vy *= 0.965;

      if (Math.abs(this.ball.vx) < 0.05) this.ball.vx = 0;
      if (Math.abs(this.ball.vy) < 0.05) this.ball.vy = 0;

      // Side wall bounces (West: 31*32, East: 55*32)
      if (this.ball.x <= this.court.minX + 12) {
        this.ball.x = this.court.minX + 12;
        this.ball.vx = -this.ball.vx * 0.7;
      } else if (this.ball.x >= this.court.maxX - 12) {
        this.ball.x = this.court.maxX - 12;
        this.ball.vx = -this.ball.vx * 0.7;
      }

      // North Goal Check (Red Team Net: x: 40~46*32, y: 22*32)
      if (this.ball.y <= this.court.northGoalY + 8) {
        if (this.ball.x >= this.court.goalMinX && this.ball.x <= this.court.goalMaxX) {
          // GOAL FOR BLUE TEAM!
          if (this.network && this.match && this.match.status === 'playing') {
            this.network.notifyBrawlGoal('blue', this.ball.carrierName || '블루팀');
            this.match.status = 'goal_celebration';
          }
          this.ball.vy = 0;
          this.ball.vx = 0;
        } else {
          // Bounce off North wall
          this.ball.y = this.court.northGoalY + 8;
          this.ball.vy = -this.ball.vy * 0.7;
        }
      }

      // South Goal Check (Blue Team Net: x: 40~46*32, y: 48*32)
      if (this.ball.y >= this.court.southGoalY - 8) {
        if (this.ball.x >= this.court.goalMinX && this.ball.x <= this.court.goalMaxX) {
          // GOAL FOR RED TEAM!
          if (this.network && this.match && this.match.status === 'playing') {
            this.network.notifyBrawlGoal('red', this.ball.carrierName || '레드팀');
            this.match.status = 'goal_celebration';
          }
          this.ball.vy = 0;
          this.ball.vx = 0;
        } else {
          // Bounce off South wall
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

    // 6. AI Bot logic (if match contains bots)
    this.updateBotAI(dt);
  }

  updateBotAI(dt) {
    if (!this.match || this.match.status !== 'playing') return;
    const allBots = [...this.match.teams.blue, ...this.match.teams.red].filter(p => p.isBot);
    const now = Date.now();

    for (const bot of allBots) {
      if (bot.stunnedUntil && now < bot.stunnedUntil) continue;

      const isBlue = (bot.team === 'blue');
      const targetGoalY = isBlue ? this.court.northGoalY : this.court.southGoalY;
      const ownGoalY = isBlue ? this.court.southGoalY : this.court.northGoalY;
      const isCarrier = (this.ball.carrierId === bot.socketId);

      if (isCarrier) {
        // Path toward target goal center
        const targetX = this.court.midX;
        const targetY = targetGoalY;
        const angle = Math.atan2(targetY - bot.y, targetX - bot.x);
        const speed = 1.6;
        bot.x += Math.cos(angle) * speed;
        bot.y += Math.sin(angle) * speed;

        bot.direction = Math.abs(targetY - bot.y) > Math.abs(targetX - bot.x)
          ? (targetY > bot.y ? 'down' : 'up')
          : (targetX > bot.x ? 'right' : 'left');

        // Shoot when in range! (within 160px of goal)
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
        // Not carrier: chase ball or defend
        if (!this.ball.carrierId) {
          // Chase loose ball
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
          // An opposing player carries ball: pursue and tackle!
          const carrierTeam = this.ball.carrierTeam;
          if (carrierTeam && carrierTeam !== bot.team) {
            const angle = Math.atan2(this.ball.y - bot.y, this.ball.x - bot.x);
            const speed = 1.7;
            bot.x += Math.cos(angle) * speed;
            bot.y += Math.sin(angle) * speed;

            const dist = Math.hypot(this.ball.x - bot.x, this.ball.y - bot.y);
            if (dist < 44 && (!bot.tackleCooldown || now >= bot.tackleCooldown)) {
              bot.tackleCooldown = now + 4000;
              // Bot tackles!
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
            // Teammate has ball: move forward into open space
            const forwardY = isBlue ? (bot.y - 1.2) : (bot.y + 1.2);
            bot.y = Math.max(this.court.minY + 32, Math.min(this.court.maxY - 32, forwardY));
          }
        }
      }

      // Constrain bot inside court
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

    // 1. West Dividing LED Stadium Barrier Board (x = 31 * 32)
    const barrierX = c.minX;
    ctx.fillStyle = '#0f172a';
    // Top segment (y: 22 ~ 33)
    ctx.fillRect(barrierX - 4, c.minY, 8, 11 * 32);
    // Bottom segment (y: 37 ~ 48)
    ctx.fillRect(barrierX - 4, c.minY + 15 * 32, 8, 11 * 32);

    // Glowing LED electronic lights
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

    // Entrance Gate Sign at midfield (y: 33 ~ 37)
    if (this.engine && this.engine.drawSharpLabel) {
      this.engine.drawSharpLabel(barrierX, c.midY, '🚪 브롤볼 전장 입구', {
        bgColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#38bdf8',
        textColor: '#38bdf8',
        fontSize: 11,
        height: 20
      });
    }

    // 2. High-Res North Goal (Red Team) at y = 22 * 32, x: 40~46
    this.drawBrawlGoal(ctx, c.goalMinX, c.northGoalY, c.goalWidth, true, '#ef4444', '🔴 레드팀 골대 (RED GOAL)');

    // 3. High-Res South Goal (Blue Team) at y = 48 * 32, x: 40~46
    this.drawBrawlGoal(ctx, c.goalMinX, c.southGoalY, c.goalWidth, false, '#3b82f6', '🔵 블루팀 골대 (BLUE GOAL)');

    // 4. North-South Court Markings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2.5;

    // Brawl Halfway Line (y = 35 * 32 from x: 31 to 55)
    ctx.beginPath();
    ctx.moveTo(c.minX, c.midY);
    ctx.lineTo(c.maxX, c.midY);
    ctx.stroke();

    // Center Circle (Radius: 75px) & Kickoff Spot
    ctx.beginPath();
    ctx.arc(c.midX, c.midY, 75, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(c.midX, c.midY, 5, 0, Math.PI * 2);
    ctx.fill();

    // North Penalty Box (Red side)
    const penW = 12 * 32;
    const penH = 6 * 32;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.strokeRect(c.midX - penW / 2, c.northGoalY, penW, penH);

    // South Penalty Box (Blue side)
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.strokeRect(c.midX - penW / 2, c.southGoalY - penH, penW, penH);

    // Center Pitch Banner
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

    // 5. Coach NPC at (43 * 32, 19 * 32)
    this.drawCoachNPC(ctx, c.midX, 19 * 32);

    ctx.restore();
  }

  drawBrawlGoal(ctx, gx, gy, gw, isNorth, teamColor, labelText) {
    ctx.save();
    const depth = isNorth ? -30 : 30;

    // Hexagonal Net Mesh Backing
    ctx.fillStyle = isNorth ? 'rgba(239, 68, 68, 0.18)' : 'rgba(59, 130, 246, 0.18)';
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + 14, gy + depth);
    ctx.lineTo(gx + gw - 14, gy + depth);
    ctx.lineTo(gx + gw, gy);
    ctx.closePath();
    ctx.fill();

    // Net Lattice
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let nx = gx + 16; nx < gx + gw; nx += 16) {
      ctx.beginPath();
      ctx.moveTo(nx, gy);
      ctx.lineTo(nx, gy + depth);
      ctx.stroke();
    }

    // Goal Frame Posts & Crossbar (Color coded)
    ctx.strokeStyle = teamColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + gw, gy); // Main crossbar
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + 14, gy + depth); // Left post back
    ctx.moveTo(gx + gw, gy);
    ctx.lineTo(gx + gw - 14, gy + depth); // Right post back
    ctx.stroke();

    // Uprights base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(gx - 4, gy - 4, 8, 8);
    ctx.fillRect(gx + gw - 4, gy - 4, 8, 8);

    // Goal Label Banner
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

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 22, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red/Blue track coach outfit
    ctx.fillStyle = '#1e3a8a'; // Blue tracksuit body
    ctx.beginPath();
    ctx.roundRect(cx - 10, cy + 2, 20, 18, 4);
    ctx.fill();

    // White sports stripes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 2, cy + 2, 4, 18);

    // Coach Head / Cap
    ctx.fillStyle = '#fbcfe8'; // Face
    ctx.beginPath();
    ctx.arc(cx, cy - 6, 8, 0, Math.PI * 2);
    ctx.fill();

    // Red coach cap
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(cx, cy - 9, 8, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 8, cy - 9, 16, 3);
    ctx.fillRect(cx + 2, cy - 8, 8, 2.5); // Cap visor

    // Golden Whistle hanging around neck
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx, cy + 6, 3, 0, Math.PI * 2);
    ctx.fill();

    // Label
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

    // 1. Render AI Bots
    if (this.match && this.match.teams) {
      const allBots = [...this.match.teams.blue, ...this.match.teams.red].filter(p => p.isBot);
      for (const bot of allBots) {
        this.renderBot(ctx, bot);
      }
    }

    // 2. Render Soccer Ball
    this.renderBall(ctx);

    // 3. Render Particles
    for (const pt of this.particles) {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size * (pt.life / pt.maxLife), 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Render Stun Stars (above player if stunned)
    const now = Date.now();
    if (now < this.stunnedUntil) {
      this.drawStunStars(ctx, this.engine.player.x, this.engine.player.y - 28);
    }

    // 5. Render Floating Texts
    for (const ft of this.floatingTexts) {
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 14px "Pretendard", sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    // 6. Big Goal Announcement Banner
    if (this.goalBanner.timer > 0) {
      this.renderGoalBanner(ctx);
    }

    ctx.restore();
  }

  renderBall(ctx) {
    const bx = this.ball.x;
    const by = this.ball.y;

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(bx, by + 10, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Carrier aura ring if held
    if (this.ball.carrierId) {
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

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(bx, by + 14, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Team Jersey body
    ctx.fillStyle = isBlue ? '#2563eb' : '#dc2626';
    ctx.beginPath();
    ctx.roundRect(bx - 8, by - 4, 16, 16, 3);
    ctx.fill();

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(bx, by - 10, 7, 0, Math.PI * 2);
    ctx.fill();

    // Name tag & Bot indicator
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

    // If stunned
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

  // Scoreboard HUD at top of screen
  renderHUD(ctx) {
    if (!this.engine || !this.engine.player) return;
    const p = this.engine.player;
    if (p.room !== 'playground' || !this.isPlayerInCourt(p.x, p.y)) return;

    ctx.save();

    const hudW = 460;
    const hudH = 50;
    const hudX = (ctx.canvas.width - hudW) / 2;
    const hudY = 16;

    // Dark sleek container
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
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
    ctx.fillText(`🔵 블루 ${score.blue}`, hudX + 20, hudY + 32);

    // Timer & Status
    ctx.fillStyle = '#fde047';
    ctx.font = '900 17px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`⏱️ ${timeStr}`, hudX + hudW / 2, hudY + 32);

    // Red Team Score
    ctx.fillStyle = '#f87171';
    ctx.font = '900 16px "Pretendard", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${score.red} 레드 🔴`, hudX + hudW - 20, hudY + 32);

    // Sub-bar indicators: Team badge & Tackle status
    const now = Date.now();
    const canTackle = (now >= this.tackleCooldown);
    const tackleRemaining = canTackle ? 'READY' : `${((this.tackleCooldown - now) / 1000).toFixed(1)}s`;

    ctx.font = '700 11px "Pretendard", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = canTackle ? '#4ade80' : '#f59e0b';

    const myId = (this.network && this.network.socket) ? this.network.socket.id : null;
    const isCarrier = (this.ball.carrierId === myId);
    const carrierPrompt = isCarrier ? ' | ⚽ A키/SPACE: 강슛!' : '';

    const teamText = this.myTeam ? (this.myTeam === 'blue' ? '🔵 내 팀: 블루' : '🔴 내 팀: 레드') : '👀 관전 중';
    ctx.fillText(`${teamText} | ⚡ B키 태클 [${tackleRemaining}]${carrierPrompt}`, hudX + hudW / 2, hudY + hudH + 16);

    ctx.restore();
  }
}

window.BrawlBall = new BrawlBallManager();
