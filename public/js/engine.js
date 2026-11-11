/**
 * 2D Canvas Engine for Soongsil Open World RPG
 * Authentic GBC Pokemon Gold Style Renderer (Image 3)
 * With Smooth Fade-to-Black Transitions (암전 효과) for all Room & Floor Warps
 */

class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Safe polyfill for roundRect across all mobile & older browsers
    if (this.ctx && !this.ctx.roundRect) {
      this.ctx.roundRect = function(x, y, w, h, r) {
        const rad = typeof r === 'number' ? r : (Array.isArray(r) ? r[0] : 4);
        this.moveTo(x + rad, y);
        this.arcTo(x + w, y, x + w, y + h, rad);
        this.arcTo(x + w, y + h, x, y + h, rad);
        this.arcTo(x, y + h, x, y, rad);
        this.arcTo(x, y, x + w, y, rad);
      };
    }

    // 2x Retina Super-Sampling for Razor-Sharp Korean Typography & Pixel Art
    this.renderScale = 2;
    this.width = 860;
    this.height = 610;
    this.canvas.width = this.width * this.renderScale;
    this.canvas.height = this.height * this.renderScale;

    // Camera
    this.camera = { x: 0, y: 0 };

    // Player state (Unified to 남학생 A - Pokemon Trainer style)
    this.player = {
      x: 14 * 32,
      y: 11 * 32,
      w: 24,
      h: 28,
      speed: 3.8,
      isDashing: false,
      hasRunningShoes: false,
      direction: 'down',
      isMoving: false,
      floor: 7,
      room: 'hallway',
      roomName: '1학년 복도',
      animFrame: 0,
      animTimer: 0,
      isTeacher: false,
      noclip: false
    };

    // Easter Egg Visual Effects in Gym Plaza
    this.busHornEffectUntil = 0;
    this.electricZapEffectUntil = 0;

    // Other players in room
    this.otherPlayers = {};

    // Cute School Mascot Puppy (숭실이 - spaced away from NPCs)
    this.mascots = [
      { x: 19, y: 11, name: "숭실이", dir: "down", anim: 0 }
    ];

    // Screen Fade Transition (암전 효과)
    this.fade = {
      active: false,
      alpha: 0,
      phase: 'none', // 'fade_out' -> 'black_hold' -> 'fade_in'
      speed: 0.14,
      holdFrames: 0,
      onMidpoint: null
    };

    // Keys state
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    // Nearby interactive target
    this.activeInteractable = null;
    this.floatingTexts = [];

    // Teacher Exclusive Dash Particle System (질주 ✨ 황금빛 별가루 이펙트)
    this.teacherDashParticles = [];

    // Movement callbacks
    this.onMoveCallback = null;
    this.onLocationChangeCallback = null;
    this.onInteractCallback = null;

    this.plantWaterCount = 0;
    try {
      this.plantWaterCount = parseInt(localStorage.getItem('soongsil_plant_water_count') || '0', 10);
    } catch(e) {}
    this.initTouchAndMouse();
  }

  resize() {
    this.canvas.width = this.width * this.renderScale;
    this.canvas.height = this.height * this.renderScale;
  }

  initTouchAndMouse() {
    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.fade.active) return; // ignore clicks during fade
      if (this.player.isFallen) return; // 기절 상태 시 터치 조작/이동 전면 차단

      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX + this.camera.x;
      const clickY = (e.clientY - rect.top) * scaleY + this.camera.y;

      // Check if clicking another player to trade
      for (const id in this.otherPlayers) {
        const p = this.otherPlayers[id];
        const dist = Math.hypot(p.x - clickX, p.y - clickY);
        if (dist < 32) {
          if (window.NetworkManager) {
            window.NetworkManager.requestTrade(id, p.name);
          }
          return;
        }
      }

      // Check interactive object click
      const nearby = this.getInteractableAt(clickX, clickY);
      if (nearby) {
        if (nearby.type === 'exit') {
          this.exitClassroom();
        } else if (this.onInteractCallback) {
          this.onInteractCallback(nearby);
        }
      }
    });
  }

  setDirectionInput(dir, active) {
    if (this.player.isFallen) {
      if (this.keys.hasOwnProperty(dir)) this.keys[dir] = false;
      return;
    }
    if (this.keys.hasOwnProperty(dir)) {
      this.keys[dir] = active;
    }
  }

  triggerLibraryShh() {
    this.libraryShhTimer = Date.now() + 2500;
    if (window.AudioManager && typeof window.AudioManager.playWrong === 'function') {
      window.AudioManager.playWrong();
    }
    if (!this.lastShhToast || Date.now() - this.lastShhToast > 3000) {
      this.lastShhToast = Date.now();
      if (window.MainApp && typeof window.MainApp.showToast === 'function') {
        window.MainApp.showToast("🤫 사서 선생님: '쉿! 학생, 도서관에서는 뛰지 말고 조용히 걸어야지!'", 'warning');
      }
    }
  }

  setDashing(isDashing) {
    // 5번 구현: 2층 도서관 정숙 이스터에그 (대시 1번이라도 시도 시 즉시 해제 + 사서 선생님 정숙 팝업)
    if (isDashing && this.player && this.player.room === 'hallway' && this.player.floor === 2) {
      this.player.isDashing = false;
      this.player.speed = this.player.isTeacher ? 4.0 : 3.8;
      this.triggerLibraryShh();
      return;
    }

    // 초록 물약 버프: 1분간 기본 이동속도 10% 증가 (질주 속도가 아닌 기본 걷기 속도에 적용)
    const hasSpeedBuff = !!(window.MainApp && window.MainApp.isBuffActive && window.MainApp.isBuffActive('speed_boost'));
    const speedBuffMult = hasSpeedBuff ? 1.10 : 1.0;

    if (this.player.isTeacher) {
      this.player.isDashing = isDashing;
      this.player.speed = isDashing ? 7.6 : 4.0 * speedBuffMult; // 교사: 기본 이동속도 4.0(버프 시 4.4), Shift 누르면 7.6
      return;
    }
    const isSpeedJob = (window.MainApp && window.MainApp.playerData && (window.MainApp.playerData.job === 'engineer' || window.MainApp.playerData.job === 'runner'));
    const runnerMult = isSpeedJob ? 1.10 : 1.0; // 러너: 기본 걷기 속도 +10% 상시 증가

    // 기본 이동속도: 기본 3.8에 초록물약 버프(+10%) 및 러너 직업 효과(+10%) 적용
    const baseWalkSpeed = 3.8 * speedBuffMult * runnerMult;

    if (!this.player.hasRunningShoes) {
      this.player.isDashing = false;
      this.player.speed = baseWalkSpeed;
      return;
    }
    this.player.isDashing = isDashing;
    // 신발 종류 확인: 1티어 실내화(4.37), 2티어 가죽 운동화(4.56), 3티어 청동 스파이크(4.75), 4티어 헤리티지 부츠(4.75)
    const equippedShoes = window.MainApp && window.MainApp.playerData && window.MainApp.playerData.equipment && window.MainApp.playerData.equipment.shoes;
    let dashSpeed = 4.37; // 기본 1티어 실내화 (+15% 속도)
    if (equippedShoes) {
      if (equippedShoes.item === 'equip_heritage_boots') {
        dashSpeed = 4.75; // 4티어 헤리티지 부츠 (+25% 고속 질주)
      } else if (equippedShoes.item === 'equip_bronze_shoes') {
        dashSpeed = 4.75; // 3티어 청동 스파이크 (+25% 고속 질주)
      } else if (equippedShoes.item === 'equip_leather_shoes') {
        dashSpeed = 4.56; // 2티어 가죽 운동화 (+20% 질주)
      }
    }
    this.player.speed = isDashing ? dashSpeed : baseWalkSpeed;
  }

  // ========================================================
  // FADE TO BLACK TRANSITION SYSTEM (암전 효과)
  // ========================================================
  triggerFadeWarp(onMidpoint) {
    if (this.fade.active) return;
    if (window.AudioManager) window.AudioManager.playSelect();
    this.fade.active = true;
    this.fade.alpha = 0;
    this.fade.phase = 'fade_out';
    this.fade.holdFrames = 3;
    this.fade.onMidpoint = onMidpoint;
  }

  updateFade() {
    if (!this.fade.active) return;

    if (this.fade.phase === 'fade_out') {
      this.fade.alpha += this.fade.speed;
      if (this.fade.alpha >= 1) {
        this.fade.alpha = 1;
        this.fade.phase = 'black_hold';
        // Execute warp at absolute midpoint of pitch black
        if (this.fade.onMidpoint) {
          this.fade.onMidpoint();
          this.fade.onMidpoint = null;
        }
        // 방/층 이동 시 이전 구역의 잔상 파티클 및 플로팅 텍스트 초기화
        this.teacherDashParticles = [];
        this.floatingTexts = [];
      }
    } else if (this.fade.phase === 'black_hold') {
      this.fade.holdFrames--;
      if (this.fade.holdFrames <= 0) {
        this.fade.phase = 'fade_in';
      }
    } else if (this.fade.phase === 'fade_in') {
      this.fade.alpha -= this.fade.speed;
      if (this.fade.alpha <= 0) {
        this.fade.alpha = 0;
        this.fade.phase = 'none';
        this.fade.active = false;
      }
    }
  }

  update() {
    // Update screen fade transition
    this.updateFade();

    // If fading out or in hold, pause movement
    if (this.fade.active && this.fade.phase !== 'fade_in') {
      this.player.isMoving = false;
      return;
    }

    // 기절(isFallen 또는 brawl stunned) 및 브롤볼 킥오프 대기 상태 시 플레이어 이동만 정지 (월드/브롤볼 업데이트는 계속 실행)
    const isTeacherNoclip = !!(this.player.isTeacher && this.player.noclip);
    const isBrawlStunned = !isTeacherNoclip && !!(window.BrawlBall && Date.now() < window.BrawlBall.stunnedUntil);
    const isBrawlKickoffWait = !isTeacherNoclip && !!(window.BrawlBall && window.BrawlBall.match && window.BrawlBall.myTeam && window.BrawlBall.kickoffUntil && Date.now() < window.BrawlBall.kickoffUntil);
    const isMovementLocked = !!((!isTeacherNoclip && this.player.isFallen) || isBrawlStunned || isBrawlKickoffWait || (this.player.stunnedUntil && Date.now() < this.player.stunnedUntil));
    if (this.player.isFallen || isBrawlStunned || (this.player.stunnedUntil && Date.now() < this.player.stunnedUntil)) {
      this.keys.up = false;
      this.keys.down = false;
      this.keys.left = false;
      this.keys.right = false;
    }

    if (this.player.isDashing && this.player.room === 'hallway' && this.player.floor === 2) {
      this.player.isDashing = false;
      this.player.speed = this.player.isTeacher ? 4.0 : 3.8;
      this.triggerLibraryShh();
    }

    let dx = 0;
    let dy = 0;

    if (!isMovementLocked) {
      if (this.keys.up) { dy -= 1; this.player.direction = 'up'; }
      if (this.keys.down) { dy += 1; this.player.direction = 'down'; }
      if (this.keys.left) { dx -= 1; this.player.direction = 'left'; }
      if (this.keys.right) { dx += 1; this.player.direction = 'right'; }
    }

    this.player.isMoving = !isMovementLocked && (dx !== 0 || dy !== 0);

    if (this.player.isMoving) {
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const speedMult = (window.BrawlBall && Date.now() < window.BrawlBall.speedBuffUntil) ? 1.35 : 1.0;
      const nextX = this.player.x + dx * this.player.speed * speedMult;
      const nextY = this.player.y + dy * this.player.speed * speedMult;

      if (!this.checkCollision(nextX, this.player.y)) {
        this.player.x = nextX;
      }
      if (!this.checkCollision(this.player.x, nextY)) {
        this.player.y = nextY;
      }

      // Animation cycle
      this.player.animTimer++;
      if (this.player.animTimer > 6) {
        this.player.animFrame = (this.player.animFrame + 1) % 4;
        this.player.animTimer = 0;
      }

      // Check warp tiles / doors
      this.checkWarps();

      // Emit movement with throttling (~30 FPS / 33ms inside Brawl Ball arena, ~15 FPS / 66ms elsewhere)
      const now = performance.now();
      const inBrawlCourt = (this.player.room === 'playground' && window.BrawlBall && window.BrawlBall.isInsideCourtBox(this.player.x, this.player.y));
      const emitInterval = inBrawlCourt ? 33 : 66;
      if (!this.lastMoveEmitTime || now - this.lastMoveEmitTime >= emitInterval || this.lastMoveDir !== this.player.direction) {
        this.lastMoveEmitTime = now;
        this.lastMoveDir = this.player.direction;
        if (this.onMoveCallback) {
          this.onMoveCallback({
            x: Math.round(this.player.x),
            y: Math.round(this.player.y),
            direction: this.player.direction
          });
        }
      }
    } else {
      if (this.isMovingPrev) {
        // Send exact stop position once when stopping
        if (this.onMoveCallback) {
          this.onMoveCallback({
            x: Math.round(this.player.x),
            y: Math.round(this.player.y),
            direction: this.player.direction
          });
        }
      }
      this.player.animFrame = 0;
    }
    this.isMovingPrev = this.player.isMoving;

    // Update roaming basketball monsters on playground
    this.updateBasketballMonsters();
    this.updateFutsalMonsters();
    this.updateHistoryMonsters();
    this.updateCafeteriaMonsters();

    // 3v3 Brawl Ball Logic Update
    if (window.BrawlBall) {
      window.BrawlBall.update(0.016);
    }

    // Update Teacher Exclusive Golden Stardust Dash Effect (교사 전용 질주 황금빛 별가루 이펙트)
    this.updateTeacherDashParticles();

    // Check nearby interactable
    this.checkNearbyInteractable();

    // Camera follow player
    const curMapWidth = this.getMapWidth();
    const curMapHeight = this.getMapHeight();
    this.camera.x = Math.max(0, Math.min(curMapWidth * 32 - this.width, this.player.x - this.width / 2));
    this.camera.y = Math.max(0, Math.min(curMapHeight * 32 - this.height, this.player.y - this.height / 2));
  }

  getMapWidth() {
    if (this.player && this.player.room === 'playground') {
      return WORLD_DATA.PLAYGROUND_WIDTH || 90;
    }
    if (this.player && this.player.room === 'playground_gym') {
      return WORLD_DATA.GYM_PLAZA_WIDTH || 56;
    }
    if (this.player && this.player.room === 'hallway') {
      if (this.player.floor === 2) {
        return WORLD_DATA.LIBRARY_WIDTH || 20;
      }
      if (this.player.floor === 3) {
        return WORLD_DATA.HALLWAY_FLOOR_3_WIDTH || 30;
      }

      return WORLD_DATA.HALLWAY_WIDTH || 60;
    }
    if (this.player && this.player.room === 'room_staff_office') {
      return WORLD_DATA.STAFF_OFFICE_WIDTH || 90;
    }
    if (this.player && this.player.room === 'room_career') {
      return WORLD_DATA.CAREER_WIDTH || 60;
    }
    if (this.player && this.player.room === 'room_secret_history') {
      return WORLD_DATA.SECRET_HISTORY_WIDTH || 16;
    }
    if (this.player && (this.player.room === 'room_health' || this.player.room === 'room_wee')) {
      return WORLD_DATA.HEALTH_WEE_WIDTH || 20;
    }
    if (this.player && this.player.room === 'room_cafeteria') {
      return WORLD_DATA.CAFETERIA_WIDTH || 42;
    }
    return WORLD_DATA.MAP_WIDTH || 30;
  }

  getMapHeight() {
    if (this.player && this.player.room === 'hallway') {
      if (this.player.floor === 2) {
        return WORLD_DATA.LIBRARY_HEIGHT || 20;
      }
      if (this.player.floor === 3) {
        return WORLD_DATA.HALLWAY_FLOOR_3_HEIGHT || 15;
      }
      return WORLD_DATA.MAP_HEIGHT || 20;
    }
    if (this.player && this.player.room === 'playground') {
      return WORLD_DATA.PLAYGROUND_HEIGHT || 54;
    }
    if (this.player && this.player.room === 'playground_gym') {
      return WORLD_DATA.GYM_PLAZA_HEIGHT || 36;
    }
    if (this.player && this.player.room === 'room_staff_office') {
      return WORLD_DATA.STAFF_OFFICE_HEIGHT || 26;
    }
    if (this.player && this.player.room === 'room_secret_history') {
      return WORLD_DATA.SECRET_HISTORY_HEIGHT || 20;
    }
    if (this.player && (this.player.room === 'room_health' || this.player.room === 'room_wee')) {
      return WORLD_DATA.HEALTH_WEE_HEIGHT || 20;
    }
    if (this.player && this.player.room === 'room_cafeteria') {
      return WORLD_DATA.CAFETERIA_HEIGHT || 24;
    }
    return WORLD_DATA.MAP_HEIGHT || 20;
  }

  addFloatingText(text, x, y, color = '#4ade80', fontSize = 16) {
    if (!this.floatingTexts) this.floatingTexts = [];
    const px = x !== undefined ? x : (this.player ? this.player.x + 16 : 0);
    const py = y !== undefined ? y : (this.player ? this.player.y - 12 : 0);
    this.floatingTexts.push({
      text,
      x: px,
      y: py,
      startY: py,
      color,
      fontSize,
      startTime: Date.now(),
      duration: 1200
    });
  }

  setPlantWaterCount(count) {
    this.plantWaterCount = Math.max(0, count || 0);
    try {
      localStorage.setItem('soongsil_plant_water_count', this.plantWaterCount.toString());
    } catch(e) {}
  }

  getPlantStage() {
    const count = this.plantWaterCount || 0;
    if (count >= 3000) return 3;
    if (count >= 1000) return 2;
    if (count >= 100) return 1;
    return 0;
  }

  getNextPlantWaterGoal() {
    const count = this.plantWaterCount || 0;
    if (count < 100) return { current: count, target: 100, stage: 0, nextStage: 1, name: '🌱 아기 새싹' };
    if (count < 1000) return { current: count, target: 1000, stage: 1, nextStage: 2, name: '🌿 무럭무럭 식물' };
    if (count < 3000) return { current: count, target: 3000, stage: 2, nextStage: 3, name: '🌳 거대 생명수' };
    return { current: count, target: 3000, stage: 3, nextStage: 3, name: '🌸 생명의 만개목', max: true };
  }

  checkCollision(x, y) {
    // Teacher Noclip (공간돌파 무적 벽통과: 브롤볼 경기장 및 모든 장애물 자유 관전/통과)
    if (this.player.noclip) return false;

    // Active Brawl Ball match boundaries & crates apply for regular match players
    if (this.player.room === 'playground' && window.BrawlBall && window.BrawlBall.match && window.BrawlBall.myTeam) {
      if (window.BrawlBall.isCollisionBlocked(this.player.x, this.player.y, x, y)) return true;
    }

    const tileX = Math.floor(x / 32);
    const tileY = Math.floor(y / 32);

    const curMapWidth = this.getMapWidth();
    const curMapHeight = this.getMapHeight();

    // Map bounds
    if (tileX < 1 || tileX >= curMapWidth - 1) return true;
    if (tileY < 1) return true;

    if (this.player.room === 'playground') {
      if (window.BrawlBall && window.BrawlBall.isCollisionBlocked(this.player.x, this.player.y, x, y)) return true;
      if (tileY >= curMapHeight - 1) return true; // bottom fence
      if (tileY <= 2) {
        // Top boundary: Elevator area (x: 78~82, y: 3) and Cafeteria door (x: 84~88, y: 3) are passable
        const isElevator = (tileX >= 78 && tileX <= 82 && tileY >= 3);
        const isCafeteria = (tileX >= 84 && tileX <= 88 && tileY >= 3);
        if (!isElevator && !isCafeteria) return true;
      }
      return false;
    }

    if (this.player.room === 'playground_gym') {
      // East gate opening to playground (tileX >= curMapWidth - 3, tileY between 28 and 32) is passable
      const curW = curMapWidth;
      if (tileX >= curW - 3 && tileY >= 28 && tileY <= 32) return false;
      // Outer boundaries
      if (tileX < 1 || tileX >= curMapWidth - 1) return true;
      if (tileY < 1 || tileY >= curMapHeight - 1) return true;
      // Left Hillside retaining wall (tx <= 1)
      if (tileX <= 1) return true;
      // Gym Building North Wall (tx >= 9, ty <= 10)
      // Entrance portico is passable between EV Charger & School Bus at tx 45..48, ty >= 9
      if (tileX >= 9 && tileY <= 10) {
        if (tileX >= 45 && tileX <= 48 && tileY >= 9) return false;
        return true;
      }
      // Granite Columns flanking the entrance
      if ((tileX === 42 || tileX === 51) && (tileY === 9 || tileY === 10)) {
        return true;
      }
      // Vertical School Bus pushed tight against the right wall (tx: 52..54, ty: 13..19)
      if (tileX >= 52 && tileX <= 54 && tileY >= 13 && tileY <= 19) return true;
      // Parking bays cars (tx: 11..40, ty: 13..18)
      if (tileX >= 11 && tileX <= 40 && tileY >= 13 && tileY <= 18) return true;
      // Main gate barrier post at start of uphill road (tx: 7..8, ty: 31..33)
      if ((tileX === 7 || tileX === 8) && tileY >= 31 && tileY <= 33) return true;
      // Guard teacher beside main gate (tx: 10, ty: 33)
      if (tileX === 10 && tileY === 33) return true;
      return false;
    }
    if (this.player.room === 'hallway') {
      if (this.player.floor === 2) {
        return this.checkLibraryFloor2Collision(tileX, tileY);
      }
      if (tileY >= curMapHeight - 1) return true;
      // Top wall boundary except doors
      if (tileY <= 4) {
        const floorData = WORLD_DATA.floors[this.player.floor];
        if (floorData) {
          const isDoor = floorData.rooms.some(r => ((r.id === "room_career" || r.id === "room_staff_office") ? (tileX >= r.doorX - 1 && tileX <= r.doorX + 2) : r.doorX === tileX) && r.doorY === tileY);
          const isElevator = (floorData.elevator && Math.abs(tileX - floorData.elevator.x) <= 1 && tileY >= floorData.elevator.y);
          if (!isDoor && !isElevator) return true;
        }
      }
      // 6층 디벗 수리함 & 분리수거함 장애물 충돌 판정 (가로 4배: 타일 14~18)
      if (this.player.floor === 6 && tileY === 16 && (tileX === 8 || (tileX >= 14 && tileX <= 18))) {
        return true;
      }
      if (this.player.floor === 3 && tileY === 12 && tileX === 21) {
        return true;
      }
    } else {
      // Inside Classroom (room_701 or room_702 or room_staff_office)
      const cr = this.getCurrentClassroomData();

      if (this.player.room === 'room_staff_office') {
        const mapW = this.getMapWidth();
        // 서쪽 앞문 입구(tx: 1..4, ty: 11..13) 및 동쪽 뒷문 입구(tx: mapW-5..mapW-1, ty: 11..13) 통행 허용
        if ((tileX >= 1 && tileX <= 4 && tileY >= 11 && tileY <= 13) ||
            (tileX >= mapW - 5 && tileX <= mapW - 1 && tileY >= 11 && tileY <= 13)) {
          return false;
        }
        if (tileY <= 2 || tileY >= curMapHeight - 2) return true;

        // 소회의실 (tx: 7..28, ty: 3..10) 출입 통제: 12레벨 이상 모범 학생만 출입 가능
        if (tileX >= 7 && tileX <= 28 && tileY >= 3 && tileY <= 10) {
          const pLevel = (window.MainApp && window.MainApp.playerData && window.MainApp.playerData.level) || (this.player && this.player.level) || 1;
          const isTeacher = (this.player && this.player.isTeacher) || (window.MainApp && window.MainApp.playerData && window.MainApp.playerData.isTeacher);
          if (!isTeacher && pLevel < 12) {
            const currentTileY = Math.floor(this.player.y / 32);
            const currentTileX = Math.floor(this.player.x / 32);
            const isCurrentlyInside = (currentTileX >= 7 && currentTileX <= 28 && currentTileY >= 3 && currentTileY <= 10);
            if (!isCurrentlyInside) {
              if (!this._lastMeetingRoomNotice || Date.now() - this._lastMeetingRoomNotice > 2500) {
                this._lastMeetingRoomNotice = Date.now();
                if (window.MainApp && typeof window.MainApp.showToast === 'function') {
                  window.MainApp.showToast(`🚫 [소회의실 출입 제한] 12레벨 이상부터 출입할 수 있습니다! (현재: Lv.${pLevel} / 필요: Lv.12)`, 'warning');
                }
              }
              return true;
            }
          }
        }

        if (this.isStaffOfficeWall(tileX, tileY)) return true;
        return false;
      }

      if (this.player.room === 'room_career') {
        if (tileY <= 2 || tileY >= curMapHeight - 2) return true;
        if (tileX <= 1 || tileX >= curMapWidth - 2) return true;
        // Exit Door area is ALWAYS passable
        if (cr && cr.exitDoor && Math.abs(tileX - cr.exitDoor.x) <= 1 && tileY >= cr.exitDoor.y) {
          return false;
        }
        if (this.isCareerRoomWall(tileX, tileY)) return true;
        return false;
      }

      if (this.player.room === 'room_cafeteria') {
        // Exit Door area (tx: 23..25, ty >= 21) is ALWAYS passable
        if (tileX >= 23 && tileX <= 25 && tileY >= 21) {
          return false;
        }
        if (tileY <= 2 || tileY >= curMapHeight - 2) return true;
        if (tileX <= 0 || tileX >= curMapWidth - 1) return true;
        return this.checkCafeteriaCollision(tileX, tileY);
      }

      // Exit Door area is ALWAYS passable
      if (Math.abs(tileX - cr.exitDoor.x) <= 1 && tileY >= cr.exitDoor.y) {
        return false;
      }

      if (this.player.room === 'room_health') {
        if ((tileX >= 14 && tileX <= 16) && ((tileY >= 6 && tileY <= 7) || (tileY >= 11 && tileY <= 12))) return true;
        if ((tileX >= 5 && tileX <= 7) && (tileY >= 6 && tileY <= 7)) return true;
        if (tileX === 10 && tileY === 4) return true;
        if (tileX === 3 && (tileY === 6 || tileY === 11)) return true;
      }

      if (this.player.room === 'room_wee') {
        if ((tileX >= 5 && tileX <= 7) && (tileY >= 6 && tileY <= 7)) return true;
        if ((tileX >= 14 && tileX <= 16) && ((tileY >= 6 && tileY <= 7) || (tileY >= 11 && tileY <= 12))) return true;
        if (tileX === 3 && (tileY === 6 || tileY === 11)) return true;
      }

      if (tileY >= cr.exitDoor.y + 1) return true; // bottom wall
      if (tileY <= 3) return true; // front blackboard & wall
      if (cr.teacherDesk && tileX === cr.teacherDesk.x && tileY === cr.teacherDesk.y) return true;
      if (cr.acidRain && Math.abs(tileX - cr.acidRain.x) <= 1 && tileY === cr.acidRain.y) return true;

      for (const d of (cr.desks || [])) {
        if (tileX === d.x && tileY === d.y) return true;
      }
    }

    return false;
  }

  getCurrentClassroomData() {
    if (this.player.room === 'room_cafeteria' && WORLD_DATA.classroom_cafeteria) return WORLD_DATA.classroom_cafeteria;
    if (this.player.room === 'room_health' && WORLD_DATA.classroom_health) return WORLD_DATA.classroom_health;
    if (this.player.room === 'room_wee' && WORLD_DATA.classroom_wee) return WORLD_DATA.classroom_wee;
    if (this.player.room === 'room_history' && WORLD_DATA.classroom_history) return WORLD_DATA.classroom_history;
    if (this.player.room === 'room_secret_history' && WORLD_DATA.classroom_secret_history) return WORLD_DATA.classroom_secret_history;
    if (this.player.room === 'room_staff_office' && WORLD_DATA.classroom_staff_office) return WORLD_DATA.classroom_staff_office;
    if (this.player.room === 'room_204' && WORLD_DATA.classroom_204) return WORLD_DATA.classroom_204;
    if (this.player.room === 'room_205' && WORLD_DATA.classroom_205) return WORLD_DATA.classroom_205;
    if (this.player.room === 'room_206' && WORLD_DATA.classroom_206) return WORLD_DATA.classroom_206;
    if (this.player.room === 'room_career' && WORLD_DATA.classroom_career) return WORLD_DATA.classroom_career;
    if (this.player.room === 'room_501' && WORLD_DATA.classroom_501) return WORLD_DATA.classroom_501;
    if (this.player.room === 'room_502' && WORLD_DATA.classroom_502) return WORLD_DATA.classroom_502;
    if (this.player.room === 'room_503' && WORLD_DATA.classroom_503) return WORLD_DATA.classroom_503;
    if (this.player.room === 'room_505' && WORLD_DATA.classroom_505) return WORLD_DATA.classroom_505;
    if (this.player.room === 'room_506' && WORLD_DATA.classroom_506) return WORLD_DATA.classroom_506;
    if (this.player.room === 'room_706' && WORLD_DATA.classroom_706) {
      return WORLD_DATA.classroom_706;
    }
    if (this.player.room === 'room_705' && WORLD_DATA.classroom_705) {
      return WORLD_DATA.classroom_705;
    }
    if (this.player.room === 'room_704' && WORLD_DATA.classroom_704) {
      return WORLD_DATA.classroom_704;
    }
    if (this.player.room === 'room_703' && WORLD_DATA.classroom_703) {
      return WORLD_DATA.classroom_703;
    }
    if (this.player.room === 'room_702' && WORLD_DATA.classroom_702) {
      return WORLD_DATA.classroom_702;
    }
    if (this.player.room === 'room_701' && WORLD_DATA.classroom_701) {
      return WORLD_DATA.classroom_701;
    }
    return WORLD_DATA.classroom_701 || WORLD_DATA.classroom;
  }

  checkWarps() {
    if (this.fade.active) return;

    const tileX = Math.floor(this.player.x / 32);
    const tileY = Math.floor(this.player.y / 32);

    if (this.player.room === 'hallway') {
      const floorData = WORLD_DATA.floors[this.player.floor];
      if (!floorData) return;

      // 1. Enter classroom through door
      for (const r of floorData.rooms) {
        const isAtDoor = ((r.id === "room_career" || r.id === "room_staff_office")) ? (tileX >= r.doorX - 1 && tileX <= r.doorX + 2 && r.doorY === tileY) : (r.doorX === tileX && r.doorY === tileY);
        if (isAtDoor) {
          if (r.id === 'room_702' && !this.player.isTeacher) {
            const curHp = this.player.hp !== undefined ? this.player.hp : 100;
            const maxHp = this.player.maxHp || 100;
            const hpRatio = curHp / maxHp;
            if (hpRatio < 0.7) {
              this.player.y = (r.doorY + 1.2) * 32;
              if (!this._lastLockedDoorNotice || Date.now() - this._lastLockedDoorNotice > 2000) {
                this._lastLockedDoorNotice = Date.now();
                const curPct = Math.floor(hpRatio * 100);
                alert(`⚠️ [1학년 2반 입장 불가 - 체력 부족]\n\n"보스방에 입장하기엔 체력이 너무 부족합니다!\n(현재 체력: ${curPct}% / 최소 70% 필요)\n\n복도에서 안전하게 휴식을 취해 체력을 회복(3초당 1 HP)하거나, 가방에서 회복 물약을 마시고 도전하세요!"`);
              }
              return;
            }
          }
          if (r.locked) {
            if (this.player.isTeacher) {
              this.triggerFadeWarp(() => {
                this.warpToRoom(r.id, r.name, r.targetX * 32, r.targetY * 32);
              });
              return;
            } else {
              this.player.y = (r.doorY + 1.2) * 32;
              if (!this._lastLockedDoorNotice || Date.now() - this._lastLockedDoorNotice > 1500) {
                this._lastLockedDoorNotice = Date.now();
                if (this.onLockedDoorCallback) {
                  this.onLockedDoorCallback(r);
                } else {
                  alert("🚪 [" + r.name + "]\n\n\"" + (r.lockMessage || "지금은 스포츠(체육) 시간입니다. 타반 학생은 출입금지입니다! ⚽") + "\"");
                }
              }
              return;
            }
          }
          this.triggerFadeWarp(() => {
            this.warpToRoom(r.id, r.name, r.targetX * 32, r.targetY * 32);
          });
          return;
        }
      }

      // 2. Stairs down
      if (floorData.stairsDown && floorData.stairsDown.x === tileX && floorData.stairsDown.y === tileY) {
        this.triggerFadeWarp(() => {
          this.warpToFloor(floorData.stairsDown.targetFloor, floorData.stairsDown.targetX * 32, floorData.stairsDown.targetY * 32);
        });
        return;
      }

      // 3. Stairs up
      if (floorData.stairsUp && floorData.stairsUp.x === tileX && floorData.stairsUp.y === tileY) {
        this.triggerFadeWarp(() => {
          this.warpToFloor(floorData.stairsUp.targetFloor, floorData.stairsUp.targetX * 32, floorData.stairsUp.targetY * 32);
        });
        return;
      }
    } else if (this.player.room === 'playground') {
      const pg = WORLD_DATA.playground;
      const gymGate = (pg && pg.gymGate) || { x: 2, y: 48 };
      // Check if player stepped on the west gym gate (x: 1~3, y: 47~49)
      if (Math.abs(tileX - gymGate.x) <= 1 && tileY >= 47 && tileY <= 51) {
        if (!this.player.isTeacher) {
          this.player.x = 4.2 * 32;
          if (!this._lastGymNotice || Date.now() - this._lastGymNotice > 2000) {
            this._lastGymNotice = Date.now();
            alert('🚫 [교직원 전용 시설 관리 구역]\n\n"🚗 숭실 체육관 및 주차장 구역은 교직원 전용 시설 관리 구역입니다.\n(교사 계정으로 로그인 후 출입할 수 있습니다.)"');
          }
          return;
        }

        // 0.3s fade warp to Gym Plaza
        this.triggerFadeWarp(() => {
          this.warpToRoom('playground_gym', '🏛️ 숭실 체육관 & 주차장', 50 * 32, 30 * 32);
        });
        return;
      }
    } else if (this.player.room === 'playground_gym') {
      const curW = this.getMapWidth();
      // Stepping on east exit gate leading back to soccer field (tx >= curW - 3, ty around 30)
      if (tileX >= curW - 3 && Math.abs(tileY - 30) <= 2) {
        this.triggerFadeWarp(() => {
          this.warpToRoom('playground', '숭실 운동장', 4 * 32, 48 * 32);
        });
        return;
      }
    } else if (this.player.room && (this.player.room.startsWith('room_') || this.player.room.startsWith('classroom'))) {
      // 교실 내부에서만 출구 문 밟았을 때 복도로 나가기 실행
      if (this.player.room === 'room_staff_office') {
        const mapW = this.getMapWidth();
        // 6층 교무실: 좌측 앞문 입구(tx <= 2, ty 11..13) 또는 우측 뒷문 입구(tx >= mapW - 3, ty 11..13)로 퇴장
        if ((tileX <= 2 || tileX >= mapW - 3) && tileY >= 11 && tileY <= 13) {
          const exitDoorType = (tileX <= 2) ? 'west' : 'east';
          this.triggerFadeWarp(() => {
            this.exitClassroom(exitDoorType);
          });
        }
      } else if (this.player.room === 'room_career') {
        const cr = this.getCurrentClassroomData();
        const exit = (cr && cr.exitDoor) || { x: 30, y: 17 };
        // 진로실 바닥(y=17) 횡단 시 비의도적 퇴장 방지: 문 바깥(y >= exit.y + 1, 즉 y >= 18)으로 완전히 나갈 때만 퇴장
        if (Math.abs(tileX - exit.x) <= 1 && tileY >= exit.y + 1) {
          this.triggerFadeWarp(() => {
            this.exitClassroom();
          });
        }
      } else {
        const cr = this.getCurrentClassroomData();
        const exit = (cr && cr.exitDoor) || WORLD_DATA.classroom.exitDoor;
        // 교실 바닥(y=17) 횡단 시 비의도적 퇴장 방지: 문 바깥(y >= exit.y + 1, 즉 y >= 18)으로 완전히 나갈 때만 퇴장
        if (Math.abs(tileX - exit.x) <= 1 && tileY >= exit.y + 1) {
          this.triggerFadeWarp(() => {
            this.exitClassroom();
          });
        }
      }
    }
  }

  exitClassroom(doorType = 'default') {
    if (this.player.isFallen) return; // 기절 상태에서는 교실 밖으로 걸어나갈 수 없음
    if (this.player.room === 'room_career') {
      if (window.MainApp && typeof window.MainApp.resetCareerEscapeProgress === 'function') {
        window.MainApp.resetCareerEscapeProgress();
      }
      this.player.floor = 5;
      const f5 = WORLD_DATA.floors[5];
      const r = f5 && f5.rooms ? f5.rooms.find(rm => rm.id === 'room_career') : null;
      const rx = r ? r.doorX * 32 : 13 * 32;
      const ry = r ? (r.doorY + 2) * 32 : 7 * 32;
      this.warpToRoom('hallway', f5 ? f5.name : '5층 복도 (진로 & 선배 구역)', rx, ry);
      return;
    }
    if (this.player.room === 'room_cafeteria') {
      this.warpToRoom('playground', '야외 운동장', 86 * 32, 5 * 32);
      return;
    }
    if (this.player.room === 'room_history') {
      this._lastHistoryHallExitTime = Date.now() + 1500;
      this.warpToRoom('playground', '숭실 운동장', 87 * 32, 51 * 32);
      return;
    }
    if (this.player.room === 'room_secret_history') {
      this.warpToRoom('room_history', '🏛️ 숭실역사관 (History Hall)', 2 * 32, 10 * 32);
      return;
    }
    if (this.player.room === 'room_staff_office') {
      this.player.floor = 6;
      const f6 = WORLD_DATA.floors[6];
      let r = null;
      if (f6 && f6.rooms) {
        if (doorType === 'east') {
          r = f6.rooms.find(rm => rm.id === 'room_staff_office' && rm.doorId === 'east');
        } else if (doorType === 'west') {
          r = f6.rooms.find(rm => rm.id === 'room_staff_office' && rm.doorId === 'west');
        }
        if (!r) r = f6.rooms.find(rm => rm.id === 'room_staff_office');
      }
      const rx = r ? (r.doorX + 1) * 32 : 13 * 32;
      const ry = r ? (r.doorY + 2) * 32 : 7 * 32;
      this.warpToRoom('hallway', f6 ? f6.name : '6층 복도 (교무실 & 2학년 구역)', rx, ry);
      return;
    }
    const floorData = WORLD_DATA.floors[this.player.floor] || WORLD_DATA.floors[7];
    const currentRoomInfo = floorData && floorData.rooms ? floorData.rooms.find(r => r.id === this.player.room) : null;
    const returnX = currentRoomInfo ? currentRoomInfo.doorX * 32 : 15 * 32;
    const returnY = currentRoomInfo ? (currentRoomInfo.doorY + 2) * 32 : 10 * 32;
    this.warpToRoom('hallway', floorData ? floorData.name : '7층 복도 (1학년 구역)', returnX, returnY);
  }

  warpToRoom(roomId, roomName, x, y) {
    if (roomId && roomId.startsWith('playground') && roomId !== 'playground_gym') {
      roomId = 'playground';
    }
    if (this.player.room === 'room_career' && roomId !== 'room_career') {
      if (window.MainApp && typeof window.MainApp.resetCareerEscapeProgress === 'function') {
        window.MainApp.resetCareerEscapeProgress();
      }
    }
    if (roomId === 'room_career') {
      if (window.MainApp && typeof window.MainApp.resetCareerEscapeProgress === 'function') {
        window.MainApp.resetCareerEscapeProgress();
      }
    }
    this.player.room = roomId;
    if (roomId === 'playground') this.player.floor = 1;
    else if (roomId === 'room_health' || roomId === 'room_wee') this.player.floor = 3;
    else if (roomId === 'room_career') this.player.floor = 5;
    else if (roomId === 'room_staff_office') this.player.floor = 6;
    else if (roomId === 'room_history' || roomId === 'room_secret_history') this.player.floor = 0;
    else if (roomId === 'room_cafeteria') this.player.floor = 1;
    this.player.roomName = roomName;
    this.player.x = x;
    this.player.y = y;
    if (this.onLocationChangeCallback) {
      this.onLocationChangeCallback({
        floor: this.player.floor,
        room: this.player.room,
        roomName: this.player.roomName,
        x: this.player.x,
        y: this.player.y
      });
    }
  }

  warpToFloor(floor, x, y) {
    this.player.floor = floor;
    this.player.room = 'hallway';
    this.player.roomName = WORLD_DATA.floors[floor].name;
    this.player.x = x;
    this.player.y = y;
    if (this.onLocationChangeCallback) {
      this.onLocationChangeCallback({
        floor: this.player.floor,
        room: this.player.room,
        roomName: this.player.roomName,
        x: this.player.x,
        y: this.player.y
      });
    }
  }

  // Easter Egg Triggers (주차장 이스터에그 시각 효과)
  triggerBusHornEffect() {
    this.busHornEffectUntil = Date.now() + 1400;
  }

  triggerElectricZapEffect() {
    this.electricZapEffectUntil = Date.now() + 1400;
  }

  // Teacher Instant Teleport (순간이동)
  teleportTo(floor, room, customX = null, customY = null) {
    this.triggerFadeWarp(() => {
      this.player.floor = parseInt(floor) || 7;
      if (this.player.isTeacher) {
        this.player.speed = this.player.isDashing ? 7.6 : 4.0; // 교사 기본 이동속도 4.0 유지 (Shift 시 7.6)
      }
      if (customX !== null && customY !== null) {
        this.player.room = room || 'hallway';
        this.player.x = customX;
        this.player.y = customY;
        if (room === 'playground') {
          this.player.roomName = '숭실 운동장';
        } else if (room === 'hallway') {
          this.player.roomName = WORLD_DATA.floors[this.player.floor] ? WORLD_DATA.floors[this.player.floor].name : `${this.player.floor}층 복도`;
        } else {
          const fData = WORLD_DATA.floors[this.player.floor];
          const rData = fData && fData.rooms ? fData.rooms.find(r => r.id === this.player.room) : null;
          this.player.roomName = rData ? rData.name : '교실 내부';
        }
      } else if (room === 'playground_soccer') {
        this.player.room = 'playground';
        this.player.roomName = '숭실 운동장 (축구장)';
        this.player.x = 22 * 32; // 천연잔디 축구장 서쪽 구역
        this.player.y = 35 * 32;
      } else if (room === 'playground_basketball') {
        this.player.room = 'playground';
        this.player.roomName = '숭실 운동장 (농구장)';
        this.player.x = 74 * 32; // 우레탄 농구장 센터서클
        this.player.y = 16 * 32;
      } else if (room === 'playground_futsal') {
        this.player.room = 'playground';
        this.player.roomName = '숭실 운동장 (풋살장)';
        this.player.x = 74 * 32; // 인조잔디 풋살장 센터
        this.player.y = 40 * 32;
      } else if (room === 'playground_gym') {
        this.player.room = 'playground_gym';
        this.player.roomName = '🏛️ 숭실 체육관 & 주차장';
        this.player.x = 50 * 32;
        this.player.y = 30 * 32;
      } else if (room === 'playground') {
        this.player.room = 'playground';
        this.player.roomName = '숭실 운동장';
        this.player.x = 80 * 32;
        this.player.y = 5 * 32;
      } else if (room === 'hallway') {
        this.player.room = 'hallway';
        if (this.player.floor === 2) {
          this.player.x = 16 * 32;
          this.player.y = 5 * 32;
          this.player.roomName = WORLD_DATA.floors[2] ? WORLD_DATA.floors[2].name : '2층 도서관 (독립 전용층)';
        } else if (this.player.floor === 3) {
          this.player.x = 25 * 32;
          this.player.y = 6 * 32;
          this.player.roomName = WORLD_DATA.floors[3] ? WORLD_DATA.floors[3].name : '3층 복도 (보건실 & Wee클래스)';
        } else {
          this.player.x = 15 * 32;
          this.player.y = 10 * 32;
          this.player.roomName = WORLD_DATA.floors[this.player.floor] ? WORLD_DATA.floors[this.player.floor].name : `${this.player.floor}층 복도`;
        }
      } else if (room === 'room_health') {
        this.player.floor = 3;
        this.player.room = 'room_health';
        this.player.x = 10 * 32;
        this.player.y = 15 * 32;
        this.player.roomName = '🏥 보건실 (Health Care)';
      } else if (room === 'room_wee') {
        this.player.floor = 3;
        this.player.room = 'room_wee';
        this.player.x = 10 * 32;
        this.player.y = 15 * 32;
        this.player.roomName = '🕊️ Wee클래스 (상담실)';
      } else if (room === 'room_career') {
        this.player.floor = 5;
        this.player.room = 'room_career';
        this.player.x = 30 * 32;
        this.player.y = 13 * 32;
        this.player.roomName = '🌟 진로상담실';
      } else if (room === 'room_staff_office') {
        this.player.floor = 6;
        this.player.room = 'room_staff_office';
        this.player.x = 45 * 32;
        this.player.y = 13 * 32;
        this.player.roomName = '🏛️ 교무실';
      } else if (room === 'room_history') {
        this.player.floor = 0;
        this.player.room = 'room_history';
        this.player.x = 15 * 32;
        this.player.y = 13 * 32;
        this.player.roomName = '🏛️ 숭실역사관';
      } else if (room === 'room_secret_history') {
        this.player.floor = 0;
        this.player.room = 'room_secret_history';
        this.player.x = 8 * 32;
        this.player.y = 14 * 32;
        this.player.roomName = '🗝️ 역사관 비밀의 방 (Secret Archive)';
      } else {
        this.player.room = room || 'room_701';
        this.player.x = 15 * 32;
        this.player.y = 13 * 32;
        const fData = WORLD_DATA.floors[this.player.floor];
        const rData = fData && fData.rooms ? fData.rooms.find(r => r.id === this.player.room) : null;
        this.player.roomName = rData ? rData.name : '교실 내부';
      }
      if (this.player.room === 'playground') this.player.floor = 1;
      else if (this.player.room === 'room_career') this.player.floor = 5;
      else if (this.player.room === 'room_staff_office') this.player.floor = 6;
      else if (this.player.room === 'room_history' || this.player.room === 'room_secret_history') this.player.floor = 0;
      if (this.onLocationChangeCallback) {
        this.onLocationChangeCallback({
          floor: this.player.floor,
          room: this.player.room,
          roomName: this.player.roomName,
          x: this.player.x,
          y: this.player.y
        });
      }
    });
  }

  checkNearbyInteractable() {
    if (this.player.isFallen) {
      this.activeInteractable = null;
      const promptEl = document.getElementById('interaction-prompt');
      if (promptEl) promptEl.classList.add('hidden');
      return;
    }

    let closest = null;
    let minDist = 80;

    if (this.player.room === 'hallway') {
      const floorData = WORLD_DATA.floors[this.player.floor];
      if (floorData) {
        // NPCs
        if (floorData.npcs) {
          for (const npc of floorData.npcs) {
            const dist = Math.hypot(npc.x * 32 - this.player.x, npc.y * 32 - this.player.y);
            const qStatus = (npc.questId && window.MainApp && typeof window.MainApp.getTeacherQuestStatus === 'function')
              ? window.MainApp.getTeacherQuestStatus(npc.questId || npc.id)
              : null;
            let prompt = `대화하기 (${npc.name})`;
            if (qStatus === 'locked') {
              prompt = `🔒 의뢰 잠김 (레벨 부족) (SPACE)`;
            } else if (qStatus === 'available') {
              prompt = `📜 퀘스트 수락 (SPACE) [ ! ]`;
            } else if (qStatus === 'in_progress') {
              prompt = `📋 퀘스트 진행 확인 (SPACE) [ ? ]`;
            } else if (qStatus === 'completed') {
              prompt = `🎉 퀘스트 완료 & 보상 수령 (SPACE) [ ? ]`;
            }
            const interactRadius = (npc.questId ? 75 : 64);
            if (dist < interactRadius && dist < minDist) {
              closest = { type: 'npc', data: npc, name: npc.name, prompt: prompt };
              minDist = dist;
            }
          }
        }
        // Objects
        if (floorData.interactive) {
          for (const obj of floorData.interactive) {
            if (obj.noInteract || !obj.prompt) continue;
            let dist;
            if (obj.type === 'recycle_bin') {
              const clampedX = Math.max(obj.x * 32, Math.min(this.player.x, (obj.x + 4.5) * 32));
              dist = Math.hypot(clampedX - this.player.x, (obj.y + 0.5) * 32 - this.player.y);
            } else {
              dist = Math.hypot(obj.x * 32 - this.player.x, obj.y * 32 - this.player.y);
            }
            if (dist < minDist) {
              if (obj.type === 'plant_zone') {
                const goal = this.getNextPlantWaterGoal();
                const prog = goal.max ? '만개 완료!' : `${goal.current}/${goal.target}💧`;
                closest = {
                  type: obj.type,
                  data: obj,
                  name: (this.player && this.player.isTeacher) ? `${goal.name} (${prog})` : goal.name,
                  prompt: '물 주기 (SPACE) 💧'
                };
              } else {
                closest = { type: obj.type, data: obj, name: obj.name, prompt: obj.prompt };
              }
              minDist = dist;
            }
          }
        }
        // Central Elevator (지상 운동장 이동)
        if (floorData.elevator) {
          const eDist = Math.hypot(floorData.elevator.x * 32 - this.player.x, (floorData.elevator.y + 1.5) * 32 - this.player.y);
          if (eDist < minDist) {
            const status = this.getElevatorStatus();
            closest = {
              type: 'elevator',
              name: status.name,
              prompt: status.prompt
            };
            minDist = eDist;
          }
        }
        // School Mascot Puppy (숭실이 - 1층 복도 전용 조작법 가이드)
        if (this.mascots && (this.player.floor === 1 || !this.player.floor)) {
          for (const m of this.mascots) {
            const dist = Math.hypot(m.x * 32 - this.player.x, m.y * 32 - this.player.y);
            if (dist < minDist) {
              closest = {
                type: 'mascot',
                data: m,
                name: m.name,
                prompt: `조작법 배우기 (${m.name})`
              };
              minDist = dist;
            }
          }
        }
        // Locked Classroom Doors in Hallway
        if (floorData.rooms) {
          for (const r of floorData.rooms) {
            if (r.locked) {
              const dDist = Math.hypot(r.doorX * 32 - this.player.x, (r.doorY + 0.5) * 32 - this.player.y);
              if (dDist < 54 && dDist < minDist) {
                closest = {
                  type: 'locked_door',
                  data: r,
                  name: `🚪 ${r.name}`,
                  prompt: `문 열기 (${r.name})`
                };
                minDist = dDist;
              }
            }
          }
        }
      }
    } else if (this.player.room === 'playground_gym') {
      const gymData = WORLD_DATA.playground_gym;
      if (gymData) {
        // 1. Exit gate back to playground
        if (gymData.exitGate) {
          const egDist = Math.hypot(gymData.exitGate.x * 32 - this.player.x, gymData.exitGate.y * 32 - this.player.y);
          if (egDist < 64 && egDist < minDist) {
            closest = {
              type: 'gym_exit_gate',
              name: gymData.exitGate.name,
              prompt: gymData.exitGate.prompt
            };
            minDist = egDist;
          }
        }
        // 2. Gym main entrance
        if (gymData.gymEntrance) {
          const geDist = Math.hypot(gymData.gymEntrance.x * 32 - this.player.x, (gymData.gymEntrance.y + 1) * 32 - this.player.y);
          if (geDist < 64 && geDist < minDist) {
            closest = {
              type: 'gym_entrance',
              name: gymData.gymEntrance.name,
              prompt: gymData.gymEntrance.prompt
            };
            minDist = geDist;
          }
        }
        // 3. School bus (이스터에그: 평상시 안내 프롬프트 숨김 처리 - 버스 외곽 거리 계산)
        if (gymData.schoolBus) {
          const sbDx = Math.max(0, Math.abs(this.player.x - 53.3 * 32) - 1.3 * 32);
          const sbDy = Math.max(0, Math.abs(this.player.y - 15.75 * 32) - 2.75 * 32);
          const sbDist = Math.hypot(sbDx, sbDy);
          if (sbDist < 48 && sbDist < minDist) {
            closest = {
              type: 'gym_school_bus',
              name: gymData.schoolBus.name,
              prompt: gymData.schoolBus.prompt || '',
              hiddenPrompt: true
            };
            minDist = sbDist;
          }
        }
        // 4. EV charger (이스터에그: 평상시 안내 프롬프트 숨김 처리 - 충전 베이 6 외곽 거리 계산)
        if (gymData.evCharger) {
          const evDx = Math.max(0, Math.abs(this.player.x - 38.8 * 32) - 1.8 * 32);
          const evDy = Math.max(0, Math.abs(this.player.y - 15.5 * 32) - 2.8 * 32);
          const evDist = Math.hypot(evDx, evDy);
          if (evDist < 48 && evDist < minDist) {
            closest = {
              type: 'gym_ev_charger',
              name: gymData.evCharger.name,
              prompt: gymData.evCharger.prompt || '',
              hiddenPrompt: true
            };
            minDist = evDist;
          }
        }
        // 5. Teacher Luxury Sedan & Parked Cars (교직원 럭셔리 세단 이스터에그)
        if (gymData.teacherCar) {
          const carBayXs = [13.1, 18.1, 23.1, 28.1, 33.1];
          let closestCarDist = 99999;
          for (const cx of carBayXs) {
            const carDx = Math.max(0, Math.abs(this.player.x - cx * 32) - 1.3 * 32);
            const carDy = Math.max(0, Math.abs(this.player.y - 16.0 * 32) - 2.5 * 32);
            const cDist = Math.hypot(carDx, carDy);
            if (cDist < closestCarDist) closestCarDist = cDist;
          }
          if (closestCarDist < 52 && closestCarDist < minDist) {
            closest = {
              type: 'gym_teacher_car',
              name: gymData.teacherCar.name || '🚗 교직원 럭셔리 세단',
              prompt: gymData.teacherCar.prompt || '',
              hiddenPrompt: true
            };
            minDist = closestCarDist;
          }
        }
        // 6. 숭실고 체육선생님 (주차장 1분 체력장)
        if (gymData.peTeacher) {
          const peDist = Math.hypot(gymData.peTeacher.x * 32 - this.player.x, (gymData.peTeacher.y + 0.5) * 32 - this.player.y);
          if (peDist < 56 && peDist < minDist) {
            closest = {
              type: 'gym_pe_teacher',
              name: gymData.peTeacher.name || '👨‍🏫 숭실고 체육선생님',
              prompt: gymData.peTeacher.prompt || '체력 단련 도전하기 (SPACE)'
            };
            minDist = peDist;
          }
        }
        // 7. 배움터 지킴이 선생님 (정문 오른쪽 언덕길 미니게임)
        if (gymData.guardTeacher) {
          const gDist = Math.hypot(gymData.guardTeacher.x * 32 - this.player.x, (gymData.guardTeacher.y + 0.5) * 32 - this.player.y);
          if (gDist < 60 && gDist < minDist) {
            closest = {
              type: 'gym_guard_teacher',
              name: gymData.guardTeacher.name || '👮 배움터 지킴이 선생님',
              prompt: gymData.guardTeacher.prompt || '언덕길 오르기 (SPACE)'
            };
            minDist = gDist;
          }
        }
        // 8. 📜 떨어진 개발자노트 (제4편) (tx: 31, ty: 33)
        if (gymData.devNote4) {
          const dnDist = Math.hypot((gymData.devNote4.x + 0.5) * 32 - this.player.x, (gymData.devNote4.y + 0.5) * 32 - this.player.y);
          if (dnDist < 56 && dnDist < minDist) {
            closest = {
              type: 'dev_note_4',
              name: gymData.devNote4.name || '📜 떨어진 개발자노트 (제4편)',
              prompt: gymData.devNote4.prompt || '개발자노트 4편 읽기 (SPACE)'
            };
            minDist = dnDist;
          }
        }
      }
    } else if (this.player.room === 'playground') {
      const pg = WORLD_DATA.playground;
      if (pg) {
        // 1. Elevator back to 1F Hallway
        if (pg.elevator) {
          const eDist = Math.hypot(pg.elevator.x * 32 - this.player.x, (pg.elevator.y + 1.5) * 32 - this.player.y);
          if (eDist < minDist) {
            closest = { type: 'elevator', name: '중앙 엘리베이터', prompt: '7층 복도로 올라가기' };
            minDist = eDist;
          }
        }
        // 2. Cafeteria entrance
        if (pg.cafeteria) {
          const cDist = Math.hypot(pg.cafeteria.x * 32 - this.player.x, (pg.cafeteria.y + 1.5) * 32 - this.player.y);
          if (cDist < 64 && cDist < minDist) {
            closest = { type: 'cafeteria', name: '학생 급식실', prompt: '급식실 입장' };
            minDist = cDist;
          }
        }
                // 2-E. Gym Gate to West (체육관 & 주차장 게이트: x: 2, y: 35)
        if (pg.gymGate) {
          const gDist = Math.hypot(pg.gymGate.x * 32 - this.player.x, (pg.gymGate.y + 0.5) * 32 - this.player.y);
          if (gDist < 64 && gDist < minDist) {
            closest = {
              type: 'gym_gate',
              data: pg.gymGate,
              name: pg.gymGate.name || '🚗 숭실 체육관 & 주차장 진입 게이트',
              prompt: this.player.isTeacher ? '체육관 & 주차장 진입 (SPACE)' : '교직원 전용 구역 (출입 제한)'
            };
            minDist = gDist;
          }
        }
        // 2-D. History Hall Entrance (숭실역사관 입구: x: 87, y: 52)
        if (pg.historyHall && (!this._lastHistoryHallExitTime || Date.now() > this._lastHistoryHallExitTime)) {
          const hDist = Math.hypot(pg.historyHall.x * 32 - this.player.x, (pg.historyHall.y + 0.5) * 32 - this.player.y);
          if (hDist < 64 && hDist < minDist) {
            closest = {
              type: 'history_hall',
              data: pg.historyHall,
              name: pg.historyHall.name || '🏛️ 숭실역사관',
              prompt: pg.historyHall.prompt || '🏛️ 숭실역사관'
            };
            minDist = hDist;
          }
        }

        // 2-B. Store (매점)
        if (pg.store) {
          const sDist = Math.hypot(pg.store.x * 32 - this.player.x, (pg.store.y + 0.5) * 32 - this.player.y);
          if (sDist < 64 && sDist < minDist) {
            closest = { type: 'store', name: pg.store.name || '매점', prompt: pg.store.prompt || '물품 매각' };
            minDist = sDist;
          }
        }
        // 2-C. Title Exchange (호칭 교환소)
        if (pg.titleExchange) {
          const tDist = Math.hypot(pg.titleExchange.x * 32 - this.player.x, (pg.titleExchange.y + 0.5) * 32 - this.player.y);
          if (tDist < 64 && tDist < minDist) {
            closest = { type: 'title_exchange', name: pg.titleExchange.name || '🏅 호칭 교환소', prompt: pg.titleExchange.prompt || '호칭 교환' };
            minDist = tDist;
          }
        }
        // 2-D. Brawl Ball Coach (3v3 브롤볼 코치)
        if (pg.brawlCoach) {
          const bcDist = Math.hypot(pg.brawlCoach.x * 32 - this.player.x, (pg.brawlCoach.y + 0.5) * 32 - this.player.y);
          if (bcDist < 64 && bcDist < minDist) {
            closest = {
              type: 'brawl_coach',
              data: pg.brawlCoach,
              name: pg.brawlCoach.name || '⚽ 브롤볼 코치',
              prompt: pg.brawlCoach.prompt || '3v3 브롤볼 참가 신청'
            };
            minDist = bcDist;
          }
        }
        // 2-E. Kim Mi-jin Art Quest Sketchbook (운동장 벤치 왼쪽편: x: 24, y: 16)
        if (pg.sketchbook) {
          if (!window.MainApp || typeof window.MainApp.isQuestSketchbookCollected !== 'function' || !window.MainApp.isQuestSketchbookCollected()) {
            const sbDist = Math.hypot((pg.sketchbook.x + 0.5) * 32 - this.player.x, (pg.sketchbook.y + 0.5) * 32 - this.player.y);
            if (sbDist < 64 && sbDist < minDist) {
              closest = {
                type: 'quest_kimmijin_book',
                data: pg.sketchbook,
                name: pg.sketchbook.name || '🎨 김진믜의 풍경화 스케치북',
                prompt: pg.sketchbook.prompt || '스케치북 회수하기 (SPACE)'
              };
              minDist = sbDist;
            }
          }
        }
        // 2-G. 2004 Time Capsule & 4 Bleacher Clues
        if (pg.timeCapsule) {
          const tcDist = Math.hypot((pg.timeCapsule.x + 0.5) * 32 - this.player.x, (pg.timeCapsule.y + 0.5) * 32 - this.player.y);
          if (tcDist < 64 && tcDist < minDist) {
            closest = {
              type: 'time_capsule',
              data: pg.timeCapsule,
              name: pg.timeCapsule.name || '🕰️ [2004년] 선배들의 비밀 타임캡슐',
              prompt: pg.timeCapsule.prompt || '타임캡슐 조사 (SPACE)'
            };
            minDist = tcDist;
          }
        }
        for (let i = 1; i <= 4; i++) {
          const clue = pg['capsuleClue' + i];
          if (clue) {
            const clDist = Math.hypot((clue.x + 0.5) * 32 - this.player.x, (clue.y + 0.5) * 32 - this.player.y);
            if (clDist < 64 && clDist < minDist) {
              closest = {
                type: 'capsule_clue',
                data: clue,
                name: clue.name || ('📜 [단서 ' + i + '] 스탠드 쪽지'),
                prompt: clue.prompt || '단서 쪽지 읽기 (SPACE)'
              };
              minDist = clDist;
            }
          }
        }
        // 2-F. Library Missing Book on Playground Bleachers
        if (pg.libraryBook) {
          if (!window.MainApp || typeof window.MainApp.isQuestLibBookPgCollected !== 'function' || !window.MainApp.isQuestLibBookPgCollected()) {
            const lbDist = Math.hypot((pg.libraryBook.x + 0.5) * 32 - this.player.x, (pg.libraryBook.y + 0.5) * 32 - this.player.y);
            if (lbDist < 64 && lbDist < minDist) {
              closest = {
                type: 'quest_library_book_pg',
                data: pg.libraryBook,
                name: pg.libraryBook.name || '📘 [대출도서] 운동장 스탠드에 떨어진 소설책',
                prompt: pg.libraryBook.prompt || '소설책 회수하기 (SPACE)'
              };
              minDist = lbDist;
            }
          }
        }
        // 3. Playground Boss (축구장 서쪽 골대 앞 신규 보스 레이드)
        const isSoccerRaid = !!(window.BOSS_CONFIG && window.BOSS_CONFIG.active &&
          (window.BOSS_CONFIG.name.includes('대마왕') || window.BOSS_CONFIG.name.includes('케르베로스') ||
           window.BOSS_CONFIG.name.includes('파멸신') || window.BOSS_CONFIG.name.includes('나태')));
        const soccerBossObj = pg.boss || (isSoccerRaid ? {
          id: 'boss_soccer_raid',
          type: 'boss_raid',
          x: 13,
          y: 35,
          name: window.BOSS_CONFIG.name,
          prompt: '보스 레이드'
        } : null);
        if (soccerBossObj) {
          const bDist = Math.hypot(soccerBossObj.x * 32 - this.player.x, (soccerBossObj.y + 0.5) * 32 - this.player.y);
          if (bDist < 96 && bDist < minDist) {
            closest = {
              type: 'boss_raid',
              data: soccerBossObj,
              name: soccerBossObj.name,
              prompt: soccerBossObj.prompt || '보스 레이드'
            };
            minDist = bDist;
          }
        }
        // 4. Basketball Monsters (1:1 퀴즈 배틀)
        if (pg.basketballMonsters) {
          for (const mob of pg.basketballMonsters) {
            if (mob.defeated) continue;
            const mDist = Math.hypot(mob.x * 32 - this.player.x, (mob.y + 0.5) * 32 - this.player.y);
            if (mDist < 48 && mDist < minDist) {
              closest = {
                type: 'field_monster',
                data: mob,
                name: `${mob.icon} ${mob.name}`,
                prompt: '1:1 퀴즈 배틀'
              };
              minDist = mDist;
            }
          }
        }
        // 5. Futsal Monsters (1:1 퀴즈 배틀)
        if (pg.futsalMonsters) {
          for (const mob of pg.futsalMonsters) {
            if (mob.defeated) continue;
            const mDist = Math.hypot(mob.x * 32 - this.player.x, (mob.y + 0.5) * 32 - this.player.y);
            if (mDist < 48 && mDist < minDist) {
              closest = {
                type: 'field_monster',
                data: mob,
                name: `${mob.icon} ${mob.name}`,
                prompt: '1:1 퀴즈 배틀'
              };
              minDist = mDist;
            }
          }
        }
        if (false) {
          for (const mob of pg.basketballMonsters) {
            if (mob.defeated) continue;
            const mDist = Math.hypot(mob.x * 32 - this.player.x, (mob.y + 0.5) * 32 - this.player.y);
            if (mDist < 48 && mDist < minDist) {
              closest = {
                type: 'field_monster',
                data: mob,
                name: `${mob.icon} ${mob.name}`,
                prompt: '1:1 퀴즈 배틀'
              };
              minDist = mDist;
            }
          }
        }
      }
    } else {
      // Inside Classroom (room_701: 노가다 채집장 / room_702: 보스 레이드 / room_703: 컴퓨터실 산성비)
      const cr = this.getCurrentClassroomData();
      if (cr.npcs) {
        for (const npc of cr.npcs) {
          const nDist = Math.hypot(npc.x * 32 - this.player.x, npc.y * 32 - this.player.y);
          const qStatus = (npc.questId && window.MainApp && typeof window.MainApp.getTeacherQuestStatus === 'function')
            ? window.MainApp.getTeacherQuestStatus(npc.questId || npc.id)
            : null;
          let prompt = `대화하기 (${npc.name})`;
          if (qStatus === 'locked') {
            prompt = `🔒 의뢰 잠김 (레벨 부족) (SPACE)`;
          } else if (qStatus === 'available') {
            prompt = `📜 퀘스트 수락 (SPACE) [ ! ]`;
          } else if (qStatus === 'in_progress') {
            prompt = `📋 퀘스트 진행 확인 (SPACE) [ ? ]`;
          } else if (qStatus === 'completed') {
            prompt = `🎉 퀘스트 완료 & 보상 수령 (SPACE) [ ? ]`;
          }
          const interactRadius = (npc.questId ? 75 : 64);
          if (nDist < interactRadius && nDist < minDist) {
            closest = {
              type: 'npc',
              data: npc,
              name: npc.name,
              prompt: prompt
            };
            minDist = nDist;
          }
        }
      }
      if (this.player.room === 'room_703') {
        for (let i = 0; i < (cr.desks || []).length; i++) {
          const d = cr.desks[i];
          const dist = Math.hypot(d.x * 32 - this.player.x, (d.y + 0.5) * 32 - this.player.y);
          if (dist < 48 && dist < minDist) {
            closest = {
              type: 'acid_rain',
              data: { id: `pc_seat_${i+1}`, name: `🖥️ 컴퓨터 좌석 (${i+1}번석)` },
              name: `🖥️ 컴퓨터 좌석 (${i+1}번석)`,
              prompt: '산성비 타자 연습'
            };
            minDist = dist;
          }
        }
      }
      if (cr.acidRain) {
        const arDist = Math.hypot(cr.acidRain.x * 32 - this.player.x, (cr.acidRain.y + 0.5) * 32 - this.player.y);
        if (arDist < 72 && arDist < minDist) {
          closest = {
            type: 'acid_rain',
            data: cr.acidRain,
            name: cr.acidRain.name,
            prompt: cr.acidRain.prompt
          };
          minDist = arDist;
        }
      }
      if (this.player.room === 'room_704' && cr.desks) {
        for (let i = 0; i < cr.desks.length; i++) {
          const d = cr.desks[i];
          const dist = Math.hypot(d.x * 32 - this.player.x, (d.y + 0.5) * 32 - this.player.y);
          if (dist < 52 && dist < minDist) {
            closest = {
              type: 'moral_desk',
              data: { ...d, seatIndex: i + 1 },
              name: `🪑 학생 의자 (${i + 1}번석)`,
              prompt: '도덕 퀴즈 풀기 (SPACE)'
            };
            minDist = dist;
          }
        }
      }
      if (this.player.room === 'room_cafeteria') {
        if (cr.cafeteriaMonsters) {
          for (const mob of cr.cafeteriaMonsters) {
            if (mob.defeated) continue;
            const mDist = Math.hypot(mob.x * 32 - this.player.x, (mob.y + 0.5) * 32 - this.player.y);
            if (mDist < 48 && mDist < minDist) {
              closest = {
                type: 'field_monster',
                data: mob,
                name: `${mob.icon} ${mob.name}`,
                prompt: '1:1 퀴즈 배틀'
              };
              minDist = mDist;
            }
          }
        }
      }
      if (this.player.room === 'room_history') {
        if (cr.historyMonsters) {
          for (const mob of cr.historyMonsters) {
            if (mob.defeated) continue;
            const mDist = Math.hypot(mob.x * 32 - this.player.x, (mob.y + 0.5) * 32 - this.player.y);
            if (mDist < 48 && mDist < minDist) {
              closest = {
                type: 'field_monster',
                data: mob,
                name: `${mob.icon} ${mob.name}`,
                prompt: '1:1 퀴즈 배틀'
              };
              minDist = mDist;
            }
          }
        }
        if (cr.interactive) {
          for (const item of cr.interactive) {
            const dist = Math.hypot((item.x + 0.5) * 32 - this.player.x, (item.y + 0.5) * 32 - this.player.y);
            if (dist < 64 && dist < minDist) {
              closest = {
                type: item.type,
                data: item,
                name: item.name,
                prompt: item.prompt || '조사하기 (SPACE)'
              };
              minDist = dist;
            }
          }
        }
      }
      if ((this.player.room === 'room_career' || this.player.room === 'room_staff_office' || this.player.room === 'room_702' || this.player.room === 'room_history' || this.player.room === 'room_secret_history' || this.player.room === 'room_cafeteria') && cr.interactive) {
        for (const item of cr.interactive) {
          if (item.type === 'quest_memo') {
            if (window.MainApp && typeof window.MainApp.isQuestMemoCollected === 'function' && window.MainApp.isQuestMemoCollected()) {
              continue;
            }
          }
          if (item.type === 'quest_okchohan_book') {
            if (window.MainApp && typeof window.MainApp.isQuestSocialBookCollected === 'function' && window.MainApp.isQuestSocialBookCollected()) {
              continue;
            }
          }
          if (item.type === 'quest_kimmijin_book') {
            if (window.MainApp && typeof window.MainApp.isQuestSketchbookCollected === 'function' && window.MainApp.isQuestSketchbookCollected()) {
              continue;
            }
          }
          if (item.type === 'quest_yosunyu_usb') {
            if (window.MainApp && typeof window.MainApp.isQuestUsbCollected === 'function' && window.MainApp.isQuestUsbCollected()) {
              continue;
            }
          }
          if (item.type === 'quest_career_book') {
            if (window.MainApp && typeof window.MainApp.isQuestCareerBookCollected === 'function' && window.MainApp.isQuestCareerBookCollected()) {
              continue;
            }
          }
          const dist = Math.hypot((item.x + 0.5) * 32 - this.player.x, (item.y + 0.5) * 32 - this.player.y);
          const maxDist = (item.type === 'cafeteria_key_safe' || item.type === 'quest_library_book_of') ? 80 : 64;
          if (dist < maxDist && dist < minDist) {
            let promptText = item.prompt || '조사하기 (SPACE)';
            if (item.type === 'door_secret_history') {
              const isUnlocked = !!(window.MainApp && window.MainApp.playerData && window.MainApp.playerData.secretHistoryRoomUnlocked);
              promptText = isUnlocked ? '비밀의 방 들어가기 (SPACE)' : '비밀의 방 결계 봉인 해제 (SPACE)';
            }
            closest = {
              type: item.type,
              data: item,
              name: item.name,
              prompt: promptText
            };
            minDist = dist;
          }
        }
      }
      if (cr.drumKit) {
        const drumDist = Math.hypot(cr.drumKit.x * 32 - this.player.x, (cr.drumKit.y + 0.5) * 32 - this.player.y);
        if (drumDist < 72 && drumDist < minDist) {
          closest = {
            type: 'drum_kit',
            data: cr.drumKit,
            name: cr.drumKit.name || '🥁 숭실 드럼 세트',
            prompt: cr.drumKit.prompt || '드럼 연주하기 (SPACE)'
          };
          minDist = drumDist;
        }
      }
      if (cr.teacherDesk) {
        const tdDist = Math.hypot(cr.teacherDesk.x * 32 - this.player.x, (cr.teacherDesk.y + 0.5) * 32 - this.player.y);
        if (tdDist < 64 && tdDist < minDist) {
          closest = {
            type: 'teacher_desk',
            data: cr.teacherDesk,
            name: cr.teacherDesk.name || '교탁(골드)',
            prompt: cr.teacherDesk.prompt || '골드 문제 풀기'
          };
          minDist = tdDist;
        }
      }
      if (cr.blackboard) {
        const bDist = Math.hypot(cr.blackboard.x * 32 - this.player.x, cr.blackboard.y * 32 - this.player.y);
        if (bDist < 72 && bDist < minDist) {
          closest = {
            type: (this.player.room === 'room_704') ? 'moral_board' : 'teacher_desk',
            data: cr.blackboard,
            name: cr.blackboard.name || '교탁(골드)',
            prompt: cr.blackboard.prompt || '골드 문제 풀기'
          };
          minDist = bDist;
        }
      }
      if (cr.gatherSpots) {
        for (const spot of cr.gatherSpots) {
          const sDist = Math.hypot(spot.x * 32 - this.player.x, spot.y * 32 - this.player.y);
          if (sDist < 64) {
            closest = { type: spot.type, data: spot, name: spot.name, prompt: spot.prompt };
            minDist = sDist;
          }
        }
      }
      if (cr.boss) {
        const isGolemSolo = (this.player.room === 'room_702');
        const isRaidActive = isGolemSolo || !!(window.BOSS_CONFIG && window.BOSS_CONFIG.active);
        if (isRaidActive) {
          const bossDist = Math.hypot(cr.boss.x * 32 - this.player.x, cr.boss.y * 32 - this.player.y);
          if (bossDist < 96 && bossDist < minDist) {
            const bossPrompt = isGolemSolo ? '1:1 가죽 골렘 레이드 도전 (SPACE)' : (cr.boss.prompt || '보스 레이드');
            const bossObj = {
              ...cr.boss,
              name: (window.BOSS_CONFIG && window.BOSS_CONFIG.active && window.BOSS_CONFIG.name.includes('골렘'))
                ? window.BOSS_CONFIG.name
                : (cr.boss.name || '🪵 가죽 골렘'),
              maxHp: (window.BOSS_CONFIG && window.BOSS_CONFIG.active && window.BOSS_CONFIG.name.includes('골렘'))
                ? window.BOSS_CONFIG.maxHp
                : (cr.boss.maxHp || 2000),
              atk: (window.BOSS_CONFIG && window.BOSS_CONFIG.active && window.BOSS_CONFIG.name.includes('골렘'))
                ? window.BOSS_CONFIG.atk
                : (cr.boss.atk || 30),
              def: (window.BOSS_CONFIG && window.BOSS_CONFIG.active && window.BOSS_CONFIG.name.includes('골렘'))
                ? window.BOSS_CONFIG.def
                : (cr.boss.def || 14),
              prompt: bossPrompt
            };
            closest = { type: 'boss_raid', data: bossObj, name: bossObj.name, prompt: bossPrompt };
            minDist = bossDist;
          }
        }
      }
      if (cr.craftTable) {
        const cDist = Math.hypot(cr.craftTable.x * 32 - this.player.x, cr.craftTable.y * 32 - this.player.y);
        if (cDist < minDist) {
          closest = { type: 'craft', data: cr.craftTable, name: cr.craftTable.name, prompt: cr.craftTable.prompt };
          minDist = cDist;
        }
      }
      // Exit Door Proximity
      const exitDist = Math.hypot(cr.exitDoor.x * 32 - this.player.x, cr.exitDoor.y * 32 - this.player.y);
      if (exitDist < 48 && exitDist < minDist) {
        let exitPrompt = '복도로 나가기 (SPACE)';
        let exitName = '복도 출구';
        if (this.player.room === 'room_cafeteria' || this.player.room === 'room_history') {
          exitPrompt = '운동장으로 나가기 (SPACE)';
          exitName = '운동장 출구';
        } else if (this.player.room === 'room_secret_history') {
          exitPrompt = '숭실역사관으로 나가기 (SPACE)';
          exitName = '숭실역사관 출구';
        }
        closest = { type: 'exit', name: exitName, prompt: exitPrompt };
        minDist = exitDist;
      }
    }

    this.activeInteractable = closest;
    const promptEl = document.getElementById('interaction-prompt');
    const promptText = document.getElementById('prompt-text');
    if (closest && closest.prompt && !closest.hiddenPrompt) {
      promptEl.classList.remove('hidden');
      promptText.innerText = closest.prompt;
    } else {
      promptEl.classList.add('hidden');
    }
  }

  getInteractableAt(x, y) {
    if (this.player.room === 'hallway') {
      const floorData = WORLD_DATA.floors[this.player.floor];
      if (floorData) {
        for (const npc of (floorData.npcs || [])) {
          if (Math.hypot(npc.x * 32 - x, npc.y * 32 - y) < 32) return { type: 'npc', data: npc };
        }
        for (const obj of (floorData.interactive || [])) {
          if (obj.noInteract || !obj.prompt) continue;
          if (obj.type === 'recycle_bin') {
            if (x >= obj.x * 32 - 10 && x <= obj.x * 32 + 175 && Math.abs(y - (obj.y + 0.5) * 32) < 36) {
              return { type: obj.type, data: obj };
            }
            continue;
          }
          if (Math.hypot(obj.x * 32 - x, obj.y * 32 - y) < 32) return { type: obj.type, data: obj };
        }
        if (floorData.elevator && Math.hypot(floorData.elevator.x * 32 - x, (floorData.elevator.y + 1.5) * 32 - y) < 48) {
          const status = this.getElevatorStatus();
          return {
            type: 'elevator',
            name: status.name,
            prompt: status.prompt
          };
        }
        for (const r of (floorData.rooms || [])) {
          if (r.locked && Math.hypot(r.doorX * 32 - x, (r.doorY + 0.5) * 32 - y) < 48) {
            return {
              type: 'locked_door',
              data: r,
              name: `🚪 ${r.name}`,
              prompt: `문 열기 (${r.name})`
            };
          }
        }
      }
    } else if (this.player.room === 'playground') {
      const pg = WORLD_DATA.playground;
      if (pg) {
        if (pg.elevator && Math.hypot(pg.elevator.x * 32 - x, (pg.elevator.y + 1.5) * 32 - y) < 48) {
          return { type: 'elevator', name: '중앙 엘리베이터', prompt: '1학년 복도로 올라가기' };
        }
        if (pg.cafeteria && Math.hypot(pg.cafeteria.x * 32 - x, (pg.cafeteria.y + 1.5) * 32 - y) < 56) {
          return { type: 'cafeteria', name: '학생 급식실', prompt: '급식실 입장' };
        }
        if (pg.historyHall && Math.hypot(pg.historyHall.x * 32 - x, (pg.historyHall.y + 0.5) * 32 - y) < 56) {
          return { type: 'history_hall', name: pg.historyHall.name, prompt: pg.historyHall.prompt };
        }
        if (pg.store && Math.hypot(pg.store.x * 32 - x, (pg.store.y + 0.5) * 32 - y) < 56) {
          return { type: 'store', name: pg.store.name || '매점', prompt: pg.store.prompt || '물품 매각' };
        }
        if (pg.titleExchange && Math.hypot(pg.titleExchange.x * 32 - x, (pg.titleExchange.y + 0.5) * 32 - y) < 56) {
          return { type: 'title_exchange', name: pg.titleExchange.name || '🏅 호칭 교환소', prompt: pg.titleExchange.prompt || '호칭 교환' };
        }
        if (pg.brawlCoach && Math.hypot(pg.brawlCoach.x * 32 - x, (pg.brawlCoach.y + 0.5) * 32 - y) < 56) {
          return {
            type: 'brawl_coach',
            data: pg.brawlCoach,
            name: pg.brawlCoach.name || '⚽ 브롤볼 코치',
            prompt: pg.brawlCoach.prompt || '3v3 브롤볼 참가 신청'
          };
        }
        if (pg.lostBox) {
          const boxCenterX = pg.lostBox.x * 32 + 16;
          const boxCenterY = pg.lostBox.y * 32 + 16;
          if (Math.hypot(boxCenterX - x, boxCenterY - y) < 36) {
            const distToPlayer = Math.hypot(boxCenterX - this.player.x, boxCenterY - this.player.y);
            if (distToPlayer < 72) {
              return { type: 'lost_box', name: '낡은 철제 분실물 상자' };
            }
          }
        }
        if (pg.sketchbook) {
          if (!window.MainApp || typeof window.MainApp.isQuestSketchbookCollected !== 'function' || !window.MainApp.isQuestSketchbookCollected()) {
            const sbCenterX = (pg.sketchbook.x + 0.5) * 32;
            const sbCenterY = (pg.sketchbook.y + 0.5) * 32;
            if (Math.hypot(sbCenterX - x, sbCenterY - y) < 48) {
              const distToPlayer = Math.hypot(sbCenterX - this.player.x, sbCenterY - this.player.y);
              if (distToPlayer < 72) {
                return {
                  type: 'quest_kimmijin_book',
                  data: pg.sketchbook,
                  name: pg.sketchbook.name || '🎨 김진믜의 풍경화 스케치북',
                  prompt: pg.sketchbook.prompt || '스케치북 회수하기 (SPACE)'
                };
              }
            }
          }
        }
        if (pg.timeCapsule) {
          const tcX = (pg.timeCapsule.x + 0.5) * 32;
          const tcY = (pg.timeCapsule.y + 0.5) * 32;
          if (Math.hypot(tcX - x, tcY - y) < 48) {
            const dist = Math.hypot(tcX - this.player.x, tcY - this.player.y);
            if (dist < 72) {
              return {
                type: 'time_capsule',
                data: pg.timeCapsule,
                name: pg.timeCapsule.name || '🕰️ [2004년] 선배들의 비밀 타임캡슐',
                prompt: pg.timeCapsule.prompt || '타임캡슐 조사 (SPACE)'
              };
            }
          }
        }
        for (let i = 1; i <= 4; i++) {
          const clue = pg['capsuleClue' + i];
          if (clue) {
            const clX = (clue.x + 0.5) * 32;
            const clY = (clue.y + 0.5) * 32;
            if (Math.hypot(clX - x, clY - y) < 48) {
              const dist = Math.hypot(clX - this.player.x, clY - this.player.y);
              if (dist < 72) {
                return {
                  type: 'capsule_clue',
                  data: clue,
                  name: clue.name || ('📜 [단서 ' + i + '] 스탠드 쪽지'),
                  prompt: clue.prompt || '단서 쪽지 읽기 (SPACE)'
                };
              }
            }
          }
        }
        if (pg.libraryBook) {
          if (!window.MainApp || typeof window.MainApp.isQuestLibBookPgCollected !== 'function' || !window.MainApp.isQuestLibBookPgCollected()) {
            const lbCenterX = (pg.libraryBook.x + 0.5) * 32;
            const lbCenterY = (pg.libraryBook.y + 0.5) * 32;
            if (Math.hypot(lbCenterX - x, lbCenterY - y) < 48) {
              const distToPlayer = Math.hypot(lbCenterX - this.player.x, lbCenterY - this.player.y);
              if (distToPlayer < 72) {
                return {
                  type: 'quest_library_book_pg',
                  data: pg.libraryBook,
                  name: pg.libraryBook.name || '📘 [대출도서] 운동장 스탠드에 떨어진 소설책',
                  prompt: pg.libraryBook.prompt || '소설책 회수하기 (SPACE)'
                };
              }
            }
          }
        }
        const isSoccerRaid = !!(window.BOSS_CONFIG && window.BOSS_CONFIG.active &&
          (window.BOSS_CONFIG.name.includes('대마왕') || window.BOSS_CONFIG.name.includes('케르베로스') ||
           window.BOSS_CONFIG.name.includes('파멸신') || window.BOSS_CONFIG.name.includes('나태')));
        const soccerBossObj = pg.boss || (isSoccerRaid ? {
          id: 'boss_soccer_raid',
          type: 'boss_raid',
          x: 13,
          y: 35,
          name: window.BOSS_CONFIG.name,
          prompt: '보스 레이드'
        } : null);
        if (soccerBossObj && Math.hypot(soccerBossObj.x * 32 - x, (soccerBossObj.y + 0.5) * 32 - y) < 96) {
          return { type: 'boss_raid', data: soccerBossObj, name: soccerBossObj.name, prompt: soccerBossObj.prompt || '보스 레이드' };
        }
        if (pg.basketballMonsters) {
          for (const mob of pg.basketballMonsters) {
            if (mob.defeated) continue;
            if (Math.hypot(mob.x * 32 - x, (mob.y + 0.5) * 32 - y) < 48) {
              return { type: 'field_monster', data: mob, name: `${mob.icon} ${mob.name}`, prompt: '1:1 퀴즈 배틀' };
            }
          }
        }
        if (pg.futsalMonsters) {
          for (const mob of pg.futsalMonsters) {
            if (mob.defeated) continue;
            if (Math.hypot(mob.x * 32 - x, (mob.y + 0.5) * 32 - y) < 48) {
              return { type: 'field_monster', data: mob, name: `${mob.icon} ${mob.name}`, prompt: '1:1 퀴즈 배틀' };
            }
          }
        }
      }
    } else if (this.player.room === 'playground_gym') {
      const gymData = WORLD_DATA.playground_gym;
      if (gymData) {
        if (gymData.exitGate && Math.hypot(gymData.exitGate.x * 32 - x, gymData.exitGate.y * 32 - y) < 56) {
          return { type: 'gym_exit_gate', name: gymData.exitGate.name, prompt: gymData.exitGate.prompt };
        }
        if (gymData.gymEntrance && Math.hypot(gymData.gymEntrance.x * 32 - x, (gymData.gymEntrance.y + 1) * 32 - y) < 64) {
          return { type: 'gym_entrance', name: gymData.gymEntrance.name, prompt: gymData.gymEntrance.prompt };
        }
        if (gymData.schoolBus && Math.abs(x - 53.3 * 32) < 2.5 * 32 && Math.abs(y - 15.75 * 32) < 3.5 * 32) {
          const distToPlayer = Math.hypot(this.player.x - 53.3 * 32, this.player.y - 15.75 * 32);
          if (distToPlayer < 140) {
            return { type: 'gym_school_bus', name: gymData.schoolBus.name, prompt: '', hiddenPrompt: true };
          }
        }
        if (gymData.evCharger && Math.abs(x - 38.8 * 32) < 2.5 * 32 && Math.abs(y - 15.5 * 32) < 3.5 * 32) {
          const distToPlayer = Math.hypot(this.player.x - 38.8 * 32, this.player.y - 15.5 * 32);
          if (distToPlayer < 140) {
            return { type: 'gym_ev_charger', name: gymData.evCharger.name, prompt: '', hiddenPrompt: true };
          }
        }
        if (gymData.peTeacher && Math.hypot(gymData.peTeacher.x * 32 - x, (gymData.peTeacher.y + 0.5) * 32 - y) < 56) {
          return { type: 'gym_pe_teacher', name: gymData.peTeacher.name, prompt: gymData.peTeacher.prompt };
        }
        if (gymData.guardTeacher && Math.hypot(gymData.guardTeacher.x * 32 - x, (gymData.guardTeacher.y + 0.5) * 32 - y) < 56) {
          return { type: 'gym_guard_teacher', name: gymData.guardTeacher.name, prompt: gymData.guardTeacher.prompt };
        }
        if (gymData.devNote4 && Math.hypot((gymData.devNote4.x + 0.5) * 32 - x, (gymData.devNote4.y + 0.5) * 32 - y) < 48) {
          return { type: 'dev_note_4', name: gymData.devNote4.name, prompt: gymData.devNote4.prompt };
        }
      }
    } else {
      const cr = this.getCurrentClassroomData();
      if (Math.hypot(cr.exitDoor.x * 32 - x, cr.exitDoor.y * 32 - y) < 40) {
        return { type: 'exit' };
      }
      for (const npc of (cr.npcs || [])) {
        if (Math.hypot(npc.x * 32 - x, npc.y * 32 - y) < 48) {
          return { type: 'npc', data: npc, name: npc.name };
        }
      }
      if (this.player.room === 'room_703') {
        for (let i = 0; i < (cr.desks || []).length; i++) {
          const d = cr.desks[i];
          if (Math.hypot(d.x * 32 - x, (d.y + 0.5) * 32 - y) < 48) {
            return {
              type: 'acid_rain',
              data: { id: `pc_seat_${i+1}`, name: `🖥️ 컴퓨터 좌석 (${i+1}번석)` },
              name: `🖥️ 컴퓨터 좌석 (${i+1}번석)`
            };
          }
        }
      }
      if (this.player.room === 'room_704' && cr.desks) {
        for (let i = 0; i < cr.desks.length; i++) {
          const d = cr.desks[i];
          if (Math.hypot(d.x * 32 - x, (d.y + 0.5) * 32 - y) < 48) {
            return {
              type: 'moral_desk',
              data: { ...d, seatIndex: i + 1 },
              name: `🪑 학생 의자 (${i + 1}번석)`
            };
          }
        }
      }
      if (this.player.room === 'room_cafeteria') {
        if (cr.cafeteriaMonsters) {
          for (const mob of cr.cafeteriaMonsters) {
            if (mob.defeated) continue;
            if (Math.hypot(mob.x * 32 - x, (mob.y + 0.5) * 32 - y) < 48) {
              return { type: 'field_monster', data: mob, name: `${mob.icon} ${mob.name}`, prompt: '1:1 퀴즈 배틀' };
            }
          }
        }
      }
      if (this.player.room === 'room_history') {
        if (cr.historyMonsters) {
          for (const mob of cr.historyMonsters) {
            if (mob.defeated) continue;
            if (Math.hypot(mob.x * 32 - x, (mob.y + 0.5) * 32 - y) < 48) {
              return { type: 'field_monster', data: mob, name: `${mob.icon} ${mob.name}`, prompt: '1:1 퀴즈 배틀' };
            }
          }
        }
        if (cr.interactive) {
          for (const item of cr.interactive) {
            const tapDist = (item.type === 'cafeteria_key_safe') ? 80 : 48;
          if (Math.hypot((item.x + 0.5) * 32 - x, (item.y + 0.5) * 32 - y) < tapDist) {
              return { type: item.type, data: item, name: item.name };
            }
          }
        }
      }
      if ((this.player.room === 'room_career' || this.player.room === 'room_staff_office' || this.player.room === 'room_702' || this.player.room === 'room_history' || this.player.room === 'room_secret_history' || this.player.room === 'room_cafeteria') && cr.interactive) {
        for (const item of cr.interactive) {
          if (item.type === 'quest_memo') {
            if (window.MainApp && typeof window.MainApp.isQuestMemoCollected === 'function' && window.MainApp.isQuestMemoCollected()) {
              continue;
            }
          }
          if (item.type === 'quest_okchohan_book') {
            if (window.MainApp && typeof window.MainApp.isQuestSocialBookCollected === 'function' && window.MainApp.isQuestSocialBookCollected()) {
              continue;
            }
          }
          if (item.type === 'quest_kimmijin_book') {
            if (window.MainApp && typeof window.MainApp.isQuestSketchbookCollected === 'function' && window.MainApp.isQuestSketchbookCollected()) {
              continue;
            }
          }
          if (item.type === 'quest_yosunyu_usb') {
            if (window.MainApp && typeof window.MainApp.isQuestUsbCollected === 'function' && window.MainApp.isQuestUsbCollected()) {
              continue;
            }
          }
          if (item.type === 'quest_career_book') {
            if (window.MainApp && typeof window.MainApp.isQuestCareerBookCollected === 'function' && window.MainApp.isQuestCareerBookCollected()) {
              continue;
            }
          }
          const tapDist = (item.type === 'cafeteria_key_safe') ? 80 : 48;
          if (Math.hypot((item.x + 0.5) * 32 - x, (item.y + 0.5) * 32 - y) < tapDist) {
            return { type: item.type, data: item, name: item.name };
          }
        }
      }
      if (cr.acidRain && Math.hypot(cr.acidRain.x * 32 - x, (cr.acidRain.y + 0.5) * 32 - y) < 60) {
        return { type: 'acid_rain', data: cr.acidRain, name: cr.acidRain.name };
      }
      if (cr.drumKit && Math.hypot(cr.drumKit.x * 32 - x, (cr.drumKit.y + 0.5) * 32 - y) < 60) {
        return { type: 'drum_kit', data: cr.drumKit, name: cr.drumKit.name || '🥁 숭실 드럼 세트' };
      }
      if (cr.teacherDesk && Math.hypot(cr.teacherDesk.x * 32 - x, (cr.teacherDesk.y + 0.5) * 32 - y) < 48) {
        return { type: 'teacher_desk', data: cr.teacherDesk, name: cr.teacherDesk.name || '교탁(골드)' };
      }
      if (cr.blackboard && Math.hypot(cr.blackboard.x * 32 - x, cr.blackboard.y * 32 - y) < 60) {
        return { type: (this.player.room === 'room_704') ? 'moral_board' : 'teacher_desk', data: cr.blackboard, name: cr.blackboard.name || '교탁(골드)' };
      }
      for (const spot of (cr.gatherSpots || [])) {
        if (Math.hypot(spot.x * 32 - x, spot.y * 32 - y) < 48) {
          return { type: spot.type, data: spot, name: spot.name };
        }
      }
      if (cr.boss) {
        const isGolemSolo = (this.player.room === 'room_702');
        const isRaidActive = isGolemSolo || !!(window.BOSS_CONFIG && window.BOSS_CONFIG.active);
        if (isRaidActive && Math.hypot(cr.boss.x * 32 - x, cr.boss.y * 32 - y) < 76) {
          const bossPrompt = isGolemSolo ? '1:1 가죽 골렘 레이드 도전 (SPACE)' : (cr.boss.prompt || '보스 레이드');
          const bossObj = {
            ...cr.boss,
            name: (window.BOSS_CONFIG && window.BOSS_CONFIG.active && window.BOSS_CONFIG.name.includes('골렘'))
              ? window.BOSS_CONFIG.name
              : (cr.boss.name || '🪵 가죽 골렘'),
            maxHp: (window.BOSS_CONFIG && window.BOSS_CONFIG.active && window.BOSS_CONFIG.name.includes('골렘'))
              ? window.BOSS_CONFIG.maxHp
              : (cr.boss.maxHp || 2000),
            atk: (window.BOSS_CONFIG && window.BOSS_CONFIG.active && window.BOSS_CONFIG.name.includes('골렘'))
              ? window.BOSS_CONFIG.atk
              : (cr.boss.atk || 30),
            def: (window.BOSS_CONFIG && window.BOSS_CONFIG.active && window.BOSS_CONFIG.name.includes('골렘'))
              ? window.BOSS_CONFIG.def
              : (cr.boss.def || 14),
            prompt: bossPrompt
          };
          return { type: 'boss_raid', data: bossObj, name: bossObj.name, prompt: bossPrompt };
        }
      }
      if (cr.craftTable && Math.hypot(cr.craftTable.x * 32 - x, cr.craftTable.y * 32 - y) < 48) {
        return { type: 'craft', data: cr.craftTable, name: cr.craftTable.name };
      }
      // 1학년 2반 가장 오른쪽 철제 사물함 이스터에그 (클릭/터치 감지)
      if (this.player.room === 'room_702') {
        const lockerCenterX = 26 * 32 + 16;
        const lockerCenterY = 17 * 32 + 16;
        if (Math.hypot(lockerCenterX - x, lockerCenterY - y) < 36) {
          const distToPlayer = Math.hypot(lockerCenterX - this.player.x, lockerCenterY - this.player.y);
          if (distToPlayer < 72) {
            return { type: 'secret_locker', name: '1학년 2반 구석 사물함' };
          }
        }
      }
    }
    return null;
  }

  interact() {
    const peModal = document.getElementById('modal-pe-jump-challenge');
    if (peModal && !peModal.classList.contains('hidden')) return;
    const uphillModal = document.getElementById('modal-uphill-rush');
    if (uphillModal && !uphillModal.classList.contains('hidden')) return;
    if (this.player.isFallen) {
      if (window.MainApp && window.MainApp.showToast) {
        window.MainApp.showToast('💀 기절한 상태에서는 행동할 수 없습니다. 부활을 선택하세요!', 'error');
      }
      return;
    }

    // 1학년 2반 가장 오른쪽 철제 사물함 이스터에그 (UI 프롬프트 버튼 없이 비밀 상호작용)
    if (this.player.room === 'room_702') {
      const lockerCenterX = 26 * 32 + 16;
      const lockerCenterY = 17 * 32 + 16;
      const distToLocker = Math.hypot(lockerCenterX - this.player.x, lockerCenterY - this.player.y);
      if (distToLocker < 56) {
        if (this.onInteractCallback) {
          this.onInteractCallback({ type: 'secret_locker', name: '1학년 2반 구석 사물함' });
        }
        return;
      }
    }

    // 숭실 운동장 스탠드 구석 비밀 분실물 상자 이스터에그 (UI 프롬프트 버튼 없이 비밀 상호작용)
    if (this.player.room === 'playground') {
      const lostBox = WORLD_DATA.playground && WORLD_DATA.playground.lostBox;
      if (lostBox) {
        const boxCenterX = lostBox.x * 32 + 16;
        const boxCenterY = lostBox.y * 32 + 16;
        const distToBox = Math.hypot(boxCenterX - this.player.x, boxCenterY - this.player.y);
        if (distToBox < 56) {
          if (this.onInteractCallback) {
            this.onInteractCallback({ type: 'lost_box', name: '낡은 철제 분실물 상자' });
          }
          return;
        }
      }
    }

    if (this.activeInteractable) {
      if (this.activeInteractable.type === 'exit') {
        this.triggerFadeWarp(() => {
          this.exitClassroom();
        });
        return;
      }
      if (this.onInteractCallback) {
        this.onInteractCallback(this.activeInteractable);
      }
    }
  }

  // ========================================================
  // RENDERING ENGINE - 2x Retina High-Clarity Renderer
  // ========================================================
  render() {
    this.ctx.save();
    this.ctx.scale(this.renderScale, this.renderScale);
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);

    // Defer world, NPC, material and guidance labels so they render in front of player nameplates
    this.deferredWorldLabels = [];
    this.deferWorldLabels = true;

    if (this.player.room === 'hallway') {
      this.renderHallway();
    } else if (this.player.room === 'playground') {
      this.renderPlayground();
    } else if (this.player.room === 'playground_gym') {
      this.renderGymPlaza();
    } else {
      this.renderClassroom();
    }

    // Render Mascots
    this.renderMascots();

    // Render NPCs
    this.renderNPCs();

    // End deferral: characters and player nameplates render now
    this.deferWorldLabels = false;

    // Render other players
    for (const id in this.otherPlayers) {
      this.renderOtherPlayer(this.otherPlayers[id]);
    }

    // Render Teacher Exclusive Golden Stardust Dash Particles (교사 전용 질주 황금빛 별가루)
    this.renderTeacherDashParticles();

    // Render Local Player
    this.renderPlayer(this.player, true);

    // Render deferred World, NPC, Material, and Guidance Labels ON TOP of characters!
    if (this.deferredWorldLabels && this.deferredWorldLabels.length > 0) {
      const activeName = (this.activeInteractable && !this.activeInteractable.hiddenPrompt && this.activeInteractable.name) ? this.activeInteractable.name : null;
      let activeItem = null;

      // Single-pass render: 일반 라벨을 먼저 그리고, 활성 대상은 마지막에 최상단으로 렌더 (매 프레임 .sort() 제거)
      for (let i = 0; i < this.deferredWorldLabels.length; i++) {
        const item = this.deferredWorldLabels[i];
        if (activeName && item.text && item.text.includes(activeName)) {
          activeItem = item;
        } else {
          this._renderSharpLabelDirect(item.cx, item.cy, item.text, item.options);
        }
      }

      if (activeItem) {
        const opts = { ...activeItem.options, borderColor: '#fbbf24', borderWidth: 2.2 };
        this._renderSharpLabelDirect(activeItem.cx, activeItem.cy, activeItem.text, opts);
      }
      this.deferredWorldLabels.length = 0;
    }

    // Render and update floating texts (Heal, Gold, Exp) in world space
    if (this.floatingTexts && this.floatingTexts.length > 0) {
      const now = Date.now();
      const aliveTexts = [];
      for (let i = 0; i < this.floatingTexts.length; i++) {
        const ft = this.floatingTexts[i];
        const elapsed = now - ft.startTime;
        if (elapsed < ft.duration) {
          const progress = elapsed / ft.duration; // 0 to 1
          const currentY = ft.startY - Math.sin(progress * Math.PI * 0.5) * 45;
          const alpha = progress < 0.7 ? 1 : (1 - (progress - 0.7) / 0.3);
          const scale = progress < 0.2 ? (0.7 + (progress / 0.2) * 0.4) : (1.1 - (progress - 0.2) * 0.12);

          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
          this.ctx.font = `900 ${Math.round(ft.fontSize * scale)}px "Pretendard", "Segoe UI", sans-serif`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';

          // Dark outline shadow
          this.ctx.lineWidth = 4;
          this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
          this.ctx.strokeText(ft.text, ft.x, currentY);

          // Glowing text fill
          this.ctx.fillStyle = ft.color;
          this.ctx.fillText(ft.text, ft.x, currentY);
          this.ctx.restore();

          aliveTexts.push(ft);
        }
      }
      this.floatingTexts = aliveTexts;
    }

    this.ctx.restore();

    // 3v3 Brawl Ball Scoreboard HUD
    if (window.BrawlBall) {
      window.BrawlBall.renderHUD(this.ctx);
    }

    // ========================================================
    // RENDER POKEMON FADE TO BLACK (암전 오버레이)
    // ========================================================
    if (this.fade.alpha > 0) {
      this.ctx.fillStyle = `rgba(0, 0, 0, ${this.fade.alpha})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    this.ctx.restore();
  }

  /**
   * High-Legibility Pill Badge & Outlined Korean Typography Renderer
   */
  drawSharpLabel(cx, cy, text, options = {}) {
    if (this.deferWorldLabels) {
      if (!this.deferredWorldLabels) this.deferredWorldLabels = [];
      this.deferredWorldLabels.push({ cx, cy, text, options });
      return;
    }
    this._renderSharpLabelDirect(cx, cy, text, options);
  }

  _renderSharpLabelDirect(cx, cy, text, options = {}) {
    const {
      bgColor = 'rgba(15, 23, 42, 0.94)',
      borderColor = '#cbd5e1',
      borderWidth = 1.5,
      textColor = '#ffffff',
      fontSize = 12.5,
      paddingX = 10,
      height = 22
    } = options;

    this.ctx.save();
    this.ctx.font = `800 ${fontSize}px "Pretendard", "Malgun Gothic", "Noto Sans KR", sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const textWidth = this.ctx.measureText(text).width;
    const boxW = Math.max(48, textWidth + paddingX * 2);
    const boxH = height;
    const bx = cx - boxW / 2;
    const by = cy - boxH / 2;

    // Soft drop shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.ctx.beginPath();
    this.ctx.roundRect(bx + 1, by + 2, boxW, boxH, 6);
    this.ctx.fill();

    // Pill background
    this.ctx.fillStyle = bgColor;
    this.ctx.beginPath();
    this.ctx.roundRect(bx, by, boxW, boxH, 6);
    this.ctx.fill();

    // Crisp border
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = borderWidth;
    this.ctx.stroke();

    // Dark stroke outline around letters for 100% legibility
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.lineWidth = 2.8;
    this.ctx.lineJoin = 'round';
    this.ctx.strokeText(text, cx, cy + 0.5);

    // Bright fill
    this.ctx.fillStyle = textColor;
    this.ctx.fillText(text, cx, cy + 0.5);
    this.ctx.restore();
  }

  // ========================================================
  // HIGH-RESOLUTION SCHOOL PIXEL ART RENDERING PIPELINE
  // ========================================================

  // 1. High-Res Warm Wood Plank Flooring (Classroom Interior)
  drawHighResWoodPlankFloor(tx, ty) {
    const px = tx * 32;
    const py = ty * 32;

    // 4 horizontal floor planks per 32x32 tile (8px per plank)
    const plankColors = ['#e6b56e', '#dfad64', '#d8a459', '#eab974'];
    for (let i = 0; i < 4; i++) {
      const plankY = py + i * 8;
      const cIdx = (ty * 4 + i + tx) % 4;
      this.ctx.fillStyle = plankColors[cIdx];
      this.ctx.fillRect(px, plankY, 32, 8);

      // Top 1px soft highlight
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      this.ctx.fillRect(px, plankY, 32, 1);

      // Bottom 1px dark plank groove
      this.ctx.fillStyle = '#8f5f24';
      this.ctx.fillRect(px, plankY + 7, 32, 1);

      // Subtle fine wood grain streak
      this.ctx.fillStyle = 'rgba(120, 80, 28, 0.14)';
      const grainOffset = ((tx * 17 + ty * 7 + i * 5) % 18) + 2;
      this.ctx.fillRect(px + grainOffset, plankY + 3, 14, 1);

      // Vertical staggered butt joint
      const jointX = ((ty * 19 + i * 11) % 26) + 3;
      this.ctx.fillStyle = '#6f4514';
      this.ctx.fillRect(px + jointX, plankY, 1, 7);

      // Tiny nail dots at plank end
      this.ctx.fillStyle = '#543209';
      this.ctx.fillRect(px + jointX + 2, plankY + 2, 1, 1);
      this.ctx.fillRect(px + jointX + 2, plankY + 5, 1, 1);
    }
  }

  // 2. High-Res Clean School Terrazzo / Linoleum Floor (Hallway Corridor)
  drawHighResHallwayTile(tx, ty) {
    const px = tx * 32;
    const py = ty * 32;

    // Alternating clean warm-ivory checkerboard
    const isAlt = (tx + ty) % 2 === 0;
    this.ctx.fillStyle = isAlt ? '#faf8f2' : '#f0ede4';
    this.ctx.fillRect(px, py, 32, 32);

    // 1px crisp grout border
    this.ctx.strokeStyle = '#dcd8ce';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(px + 0.5, py + 0.5, 31, 31);

    // Subtle terrazzo marble micro-specks
    const seed = (tx * 31 + ty * 17);
    this.ctx.fillStyle = '#a8a29e';
    this.ctx.fillRect(px + (seed % 24) + 4, py + ((seed * 3) % 24) + 4, 1.5, 1.5);
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px + ((seed * 7) % 24) + 4, py + ((seed * 11) % 24) + 4, 1.5, 1.5);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px + ((seed * 13) % 24) + 4, py + ((seed * 5) % 24) + 4, 1.5, 1.5);

    // Polished corner reflection sheen
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    this.ctx.fillRect(px + 2, py + 2, 8, 2);
    this.ctx.fillRect(px + 2, py + 4, 3, 4);
  }

  // 3. High-Res School Wall System (Ceiling molding, ivory plaster, chair rail & wood wainscoting)
  drawHighResWall(tx, ty, isClassroom = false) {
    const px = tx * 32;
    const py = ty * 32;

    if (ty <= 1) {
      // Ceiling Crown Molding (Upper Wall)
      this.ctx.fillStyle = '#451a03';
      this.ctx.fillRect(px, py, 32, 8);
      this.ctx.fillStyle = '#78350f';
      this.ctx.fillRect(px, py + 8, 32, 10);
      this.ctx.fillStyle = '#b45309';
      this.ctx.fillRect(px, py + 8, 32, 2); // 1px highlight line
      this.ctx.fillStyle = '#fefce8'; // Ivory wall plaster
      this.ctx.fillRect(px, py + 18, 32, 14);
    } else if (ty === 2) {
      // Middle Wall (Clean Ivory plaster with vertical subtle texture)
      this.ctx.fillStyle = '#fefce8';
      this.ctx.fillRect(px, py, 32, 24);
      this.ctx.fillStyle = 'rgba(234, 179, 8, 0.08)';
      this.ctx.fillRect(px + 8, py, 1, 24);
      this.ctx.fillRect(px + 20, py, 1, 24);

      // Chair-rail wooden molding band
      this.ctx.fillStyle = '#92400e';
      this.ctx.fillRect(px, py + 24, 32, 8);
      this.ctx.fillStyle = '#d97706';
      this.ctx.fillRect(px, py + 24, 32, 2); // top highlight
      this.ctx.fillStyle = '#451a03';
      this.ctx.fillRect(px, py + 31, 32, 1); // bottom shadow
    } else if (ty === 3 || (isClassroom && ty >= this.getMapHeight() - 2)) {
      // Lower Wall Wainscoting (나무 루바 패널) with vertical slats
      this.ctx.fillStyle = '#b45309';
      this.ctx.fillRect(px, py, 32, 26);

      // Vertical wooden slats (4px spacing)
      for (let s = 0; s < 32; s += 8) {
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.fillRect(px + s, py, 1, 26);
        this.ctx.fillStyle = '#78350f';
        this.ctx.fillRect(px + s + 7, py, 1, 26);
      }

      // Baseboard Molding (하단 걸레받이 몰딩)
      this.ctx.fillStyle = '#451a03';
      this.ctx.fillRect(px, py + 26, 32, 6);
      this.ctx.fillStyle = '#78350f';
      this.ctx.fillRect(px, py + 26, 32, 1);

      // Drop shadow on floor
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      this.ctx.fillRect(px, py + 32, 32, 4);
    } else {
      // Side vertical architectural column walls (tx === 0 or tx === MAP_WIDTH - 1)
      this.ctx.fillStyle = '#78350f';
      this.ctx.fillRect(px, py, 32, 32);
      this.ctx.fillStyle = '#b45309';
      this.ctx.fillRect(px + 4, py, 24, 32);
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.fillRect(px + 4, py, 2, 32);
      this.ctx.fillStyle = '#451a03';
      this.ctx.fillRect(px + 26, py, 2, 32);
    }
  }

  // 4. High-Res Corridor Sunny Window (Blue sky, clouds, sunlight cast on floor)
  drawHighResWindow(tx, ty) {
    const px = tx * 32;
    const py = ty * 32;

    // Window Outer Frame
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(px - 2, py + 4, 36, 44);
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(px, py + 6, 32, 40);

    // Sky gradient inside window
    const sky = this.ctx.createLinearGradient(px, py + 8, px, py + 44);
    sky.addColorStop(0, '#38bdf8');
    sky.addColorStop(1, '#bae6fd');
    this.ctx.fillStyle = sky;
    this.ctx.fillRect(px + 2, py + 8, 28, 36);

    // Fluffy pixel clouds
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px + 6, py + 14, 10, 4);
    this.ctx.fillRect(px + 8, py + 12, 6, 3);
    this.ctx.fillRect(px + 18, py + 20, 8, 3);

    // Campus green treetops at bottom
    this.ctx.fillStyle = '#15803d';
    this.ctx.beginPath();
    this.ctx.arc(px + 10, py + 42, 8, Math.PI, 0, false);
    this.ctx.arc(px + 22, py + 42, 9, Math.PI, 0, false);
    this.ctx.fill();

    // Window Cross Sashes
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(px + 15, py + 8, 2, 36);
    this.ctx.fillRect(px + 2, py + 24, 28, 2);

    // Diagonal glass sheen
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 4, py + 8);
    this.ctx.lineTo(px + 12, py + 8);
    this.ctx.lineTo(px + 4, py + 32);
    this.ctx.fill();

    // Soft warm sunlight shaft projected onto hallway floor
    this.ctx.fillStyle = 'rgba(254, 240, 138, 0.12)';
    this.ctx.beginPath();
    this.ctx.moveTo(px - 4, py + 48);
    this.ctx.lineTo(px + 36, py + 48);
    this.ctx.lineTo(px + 52, py + 140);
    this.ctx.lineTo(px - 20, py + 140);
    this.ctx.closePath();
    this.ctx.fill();
  }

  // 5. High-Res Classroom Sliding Door with Brass Plaque
  drawHighResDoor(r) {
    const isCareer = (r.id === 'room_career');
    const isStaffOffice = (r.id === 'room_staff_office');
    const px = r.doorX * 32;
    if (isCareer || isStaffOffice) {
      // 🌟 대형 슬라이딩 도어 (약 96px 폭, 3타일 확장)
      const py = 3 * 32 - 12;
      const dw = 96; // 2배 너비
      // 상단 러너 트랙
      this.ctx.fillStyle = isStaffOffice ? '#c084fc' : '#f59e0b';
      this.ctx.fillRect(px - 14, py + 8, dw + 28, 6);
      this.ctx.fillStyle = isStaffOffice ? '#f3e8ff' : '#fef08a';
      this.ctx.fillRect(px - 14, py + 8, dw + 28, 1.5);

      // 외곽 도어 프레임
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(px - 6, py + 14, dw + 12, 43);
      this.ctx.fillStyle = isStaffOffice ? '#581c87' : '#1e3a8a';
      this.ctx.fillRect(px - 4, py + 16, dw + 8, 40);

      // 좌/우 2개의 대형 유리 패널
      const panelW = 42;
      this.ctx.fillStyle = isStaffOffice ? '#c084fc' : '#38bdf8';
      this.ctx.fillRect(px, py + 19, panelW, 34);
      this.ctx.fillRect(px + panelW + 4, py + 19, panelW, 34);

      // 유리 반사광
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      this.ctx.fillRect(px + 5, py + 22, 6, 26);
      this.ctx.fillRect(px + panelW + 9, py + 22, 6, 26);

      // 황금 손잡이 쌍
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.fillRect(px + panelW - 5, py + 28, 3, 16);
      this.ctx.fillRect(px + panelW + 6, py + 28, 3, 16);

      // 대형 명패
      const plaqueTitle = r.plaqueName || (isStaffOffice ? '🏛️ 교무실' : '🌟 진로상담실');
      const plaqueBg = isStaffOffice ? 'rgba(88, 28, 135, 0.95)' : 'rgba(30, 58, 138, 0.95)';
      const plaqueBorder = isStaffOffice ? '#c084fc' : '#fbbf24';
      this.drawSharpLabel(px + dw / 2, py - 4, plaqueTitle, {
        bgColor: plaqueBg,
        borderColor: plaqueBorder,
        textColor: '#fef08a',
        fontSize: 12.5,
        paddingX: 14,
        height: 22
      });
      return;
    }
    const py = 3 * 32 - 12;

    // Sliding Door Overhead Runner Track
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(px - 6, py + 12, 44, 4);
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(px - 6, py + 12, 44, 1);

    // Door Outer Frame
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(px - 4, py + 16, 40, 48);

    // Door Wood Body
    this.ctx.fillStyle = '#92400e';
    this.ctx.fillRect(px, py + 18, 32, 44);

    // Upper Glass Observation Pane
    this.ctx.fillStyle = '#0284c7';
    this.ctx.fillRect(px + 4, py + 22, 24, 16);
    this.ctx.fillStyle = '#e0f2fe';
    this.ctx.fillRect(px + 5, py + 23, 22, 14);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.fillRect(px + 7, py + 24, 6, 12);

    // Lower Door Wood Slats
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px + 4, py + 42, 24, 16);
    for (let dy = 0; dy < 16; dy += 4) {
      this.ctx.fillStyle = '#b45309';
      this.ctx.fillRect(px + 5, py + 43 + dy, 22, 2);
    }

    // Stainless Steel Door Pull Handle
    this.ctx.fillStyle = '#f1f5f9';
    this.ctx.fillRect(px + 26, py + 34, 3, 14);
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(px + 28, py + 34, 1, 14);

    // Class Nameplate Plaque mounted above door
    let doorTitle = r.locked ? `🚪 ${r.name} 🔒` : `🚪 ${r.name}`;
    let isLowHp = false;
    if (r.id === 'room_702' && !this.player.isTeacher && this.player.hp !== undefined && this.player.maxHp) {
      if ((this.player.hp / this.player.maxHp) < 0.7) {
        doorTitle = `⚠️ ${r.name} (체력 70% 필요)`;
        isLowHp = true;
      }
    }
    this.drawSharpLabel(px + 16, py + 4, doorTitle, {
      bgColor: (r.locked || isLowHp) ? '#450a0a' : '#1e1b4b',
      borderColor: (r.locked || isLowHp) ? '#f87171' : '#f59e0b',
      textColor: (r.locked || isLowHp) ? '#fecaca' : '#fef08a',
      fontSize: 13,
      paddingX: 11,
      height: 22
    });
  }

  // 6. High-Res Classroom Blackboard with Aluminum Frame & School Motto
  drawHighResBlackboard(cr, centerTileX = 15) {
    const bw = 14 * 32;
    const bx = Math.round((centerTileX * 32) - (bw / 2));
    const by = 10;
    const bh = 2 * 32 + 6;

    // Outer Aluminum & Wood Trim
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(bx - 4, by - 4, bw + 8, bh + 8);
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);

    // Deep Green Magnetic Blackboard Surface
    const boardGrad = this.ctx.createLinearGradient(bx, by, bx, by + bh);
    boardGrad.addColorStop(0, '#064e3b');
    boardGrad.addColorStop(1, '#022c22');
    this.ctx.fillStyle = boardGrad;
    this.ctx.fillRect(bx, by, bw, bh);

    // Top Center School Motto Crest
    this.drawSharpLabel(bx + bw / 2, by - 3, '🏫 교훈: 참과 사랑에 사는 사명인', {
      bgColor: '#1e1b4b',
      borderColor: '#f59e0b',
      textColor: '#fef08a',
      fontSize: 11.5,
      paddingX: 14,
      height: 20
    });

    // 5층 및 진로실은 칠판을 완전히 빈 칸으로 유지
    const isEmptyRoom = (this.player.floor === 5 || this.player.room === 'room_career' || (cr && cr.teacherDesk === null && this.player.room !== 'room_705'));
    if (this.player.room === 'room_705') {
      this.ctx.save();
      this.ctx.font = '800 13px "Pretendard", "Malgun Gothic", sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.lineWidth = 2.5;
      this.ctx.lineJoin = 'round';

      this.ctx.strokeText('⚗️ 1-5 연금과학 연구실: 원소 변환의 법칙 ✨', bx + 16, by + 25);
      this.ctx.fillStyle = '#c084fc';
      this.ctx.fillText('⚗️ 1-5 연금과학 연구실: 원소 변환의 법칙 ✨', bx + 16, by + 25);

      this.ctx.font = '700 11px "Pretendard", "Malgun Gothic", sans-serif';
      this.ctx.strokeText('• 등가교환: Gold ➔ 목재(10G) / 허브(10G) / 개나리(25G)', bx + 18, by + 43);
      this.ctx.fillStyle = '#fde047';
      this.ctx.fillText('• 등가교환: Gold ➔ 목재(10G) / 허브(10G) / 개나리(25G)', bx + 18, by + 43);

      this.ctx.strokeText('• 대형 연금술 솥과 졍경슉 선생님 앞에서 SPACE를 눌러 연성하세요!', bx + 18, by + 59);
      this.ctx.fillStyle = '#67e8f9';
      this.ctx.fillText('• 대형 연금술 솥과 졍경슉 선생님 앞에서 SPACE를 눌러 연성하세요!', bx + 18, by + 59);

      // Right Side: Alchemy Crest Box
      this.ctx.strokeStyle = '#c084fc';
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(bx + bw - 144, by + 13, 128, 46);
      this.ctx.fillStyle = 'rgba(88, 28, 135, 0.45)';
      this.ctx.fillRect(bx + bw - 144, by + 13, 128, 46);

      this.ctx.font = '800 11px "Pretendard", "Malgun Gothic", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.lineWidth = 2.5;
      this.ctx.strokeText('[ ⚗️ 재료 연성실 ]', bx + bw - 80, by + 30);
      this.ctx.fillStyle = '#fde047';
      this.ctx.fillText('[ ⚗️ 재료 연성실 ]', bx + bw - 80, by + 30);

      this.ctx.font = '700 10.5px "Pretendard", "Malgun Gothic", sans-serif';
      this.ctx.strokeText('담임 졍경슉 👩‍🏫', bx + bw - 80, by + 48);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText('담임 졍경슉 👩‍🏫', bx + bw - 80, by + 48);
      this.ctx.restore();
    } else if (!isEmptyRoom) {
      // Crisp Chalk Writing on Blackboard for regular classrooms
      this.ctx.save();
      this.ctx.font = '800 13.5px "Pretendard", "Malgun Gothic", sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.lineWidth = 2.5;
      this.ctx.lineJoin = 'round';

      this.ctx.strokeText('Lesson 1: Nice to Meet You! ✨', bx + 16, by + 25);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText('Lesson 1: Nice to Meet You! ✨', bx + 16, by + 25);

      this.ctx.font = '700 11.5px "Pretendard", "Malgun Gothic", sans-serif';
      this.ctx.strokeText('• Key Words: dream, wisdom, future, courage', bx + 18, by + 43);
      this.ctx.fillStyle = '#fef08a';
      this.ctx.fillText('• Key Words: dream, wisdom, future, courage', bx + 18, by + 43);

      this.ctx.strokeText('• Today\'s Mission: English Word Quest & Crafting', bx + 18, by + 59);
      this.ctx.fillStyle = '#bae6fd';
      this.ctx.fillText('• Today\'s Mission: English Word Quest & Crafting', bx + 18, by + 59);

      // Right Side: Neat Vocabulary Quiz Note Box
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(bx + bw - 144, by + 13, 128, 46);
      this.ctx.font = '800 11px "Pretendard", "Malgun Gothic", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.lineWidth = 2.5;
      this.ctx.strokeText('[ 칠판 퀴즈 풀기 ]', bx + bw - 80, by + 30);
      this.ctx.fillStyle = '#fde047';
      this.ctx.fillText('[ 칠판 퀴즈 풀기 ]', bx + bw - 80, by + 30);

      this.ctx.font = '700 10.5px "Pretendard", "Malgun Gothic", sans-serif';
      this.ctx.strokeText('골드 획득!', bx + bw - 80, by + 48);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText('골드 획득!', bx + bw - 80, by + 48);
      this.ctx.restore();
    }

    // Bottom Full-Length Aluminum Chalk Ledge
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(bx - 6, by + bh, bw + 12, 6);
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(bx - 6, by + bh, bw + 12, 2);

    // Chalk Sticks (White, Yellow, Pink, Sky Blue)
    const chalks = ['#ffffff', '#facc15', '#f472b6', '#38bdf8'];
    for (let c = 0; c < chalks.length; c++) {
      this.ctx.fillStyle = chalks[c];
      this.ctx.fillRect(bx + 40 + c * 14, by + bh - 2, 9, 3);
    }

    // Felt Blackboard Eraser
    this.ctx.fillStyle = '#78350f'; // wooden back
    this.ctx.fillRect(bx + 110, by + bh - 4, 18, 4);
    this.ctx.fillStyle = '#e2e8f0'; // felt with chalk dust
    this.ctx.fillRect(bx + 110, by + bh - 1, 18, 2);
  }

  // 7. High-Res Teacher Podium Desk with Laptop & Books
  drawHighResTeacherDesk(cr) {
    const dx = cr.teacherDesk.x * 32 - 18;
    const dy = cr.teacherDesk.y * 32;
    const dw = 68;
    const dh = 32;

    // Floor Drop Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(dx + 4, dy + dh - 2, dw - 4, 6);

    // Desk Body (Rich Warm Walnut)
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(dx, dy + 10, dw, dh - 10);
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(dx + 2, dy + 12, dw - 4, dh - 14);

    // Beveled Desk Top Surface
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(dx - 2, dy, dw + 4, 12);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(dx - 2, dy, dw + 4, 2); // 1px highlight

    // Open Teacher Laptop
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.fillRect(dx + 8, dy + 2, 16, 8); // keyboard base
    this.ctx.fillStyle = '#0284c7';
    this.ctx.fillRect(dx + 8, dy - 7, 16, 9); // screen
    this.ctx.fillStyle = '#e0f2fe';
    this.ctx.fillRect(dx + 9, dy - 6, 14, 7); // LCD display glow

    // Desktop Microphone
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(dx + 28, dy + 2, 3, 3);
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(dx + 29, dy + 2);
    this.ctx.lineTo(dx + 30, dy - 4);
    this.ctx.stroke();

    // Stacked English Textbooks
    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(dx + 42, dy + 3, 16, 3);
    this.ctx.fillStyle = '#2563eb';
    this.ctx.fillRect(dx + 41, dy + 6, 17, 3);

    // Pen Holder with Pens
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(dx + 35, dy + 2, 5, 6);
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(dx + 36, dy - 2, 1, 4);
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.fillRect(dx + 38, dy - 3, 1, 5);

    // Desk Label
    this.drawSharpLabel(dx + dw / 2, dy + 22, '📑 교탁(골드)', {
      bgColor: 'rgba(28, 25, 23, 0.94)',
      borderColor: '#f59e0b',
      textColor: '#fef08a',
      fontSize: 11.5,
      paddingX: 8,
      height: 19
    });
  }

  // 8. High-Res Student Desk & Ergonomic Chair
  drawHighResStudentDesk(d) {
    const px = d.x * 32;
    const py = d.y * 32;

    // Drop Shadow on floor
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    this.ctx.fillRect(px + 2, py + 26, 28, 5);

    // --- CHAIR (Tucked Behind Desk) ---
    // Curved Wooden Backrest
    this.ctx.fillStyle = '#92400e';
    this.ctx.fillRect(px + 6, py - 4, 20, 5);
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(px + 7, py - 4, 18, 1); // highlight
    // Chair Vertical Backrest Spindles
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(px + 10, py + 1, 2, 6);
    this.ctx.fillRect(px + 20, py + 1, 2, 6);
    // Chair Seat
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px + 5, py + 6, 22, 5);

    // --- DESK BODY ---
    // Tubular Steel Desk Frame
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(px + 3, py + 18, 3, 10);
    this.ctx.fillRect(px + 26, py + 18, 3, 10);
    this.ctx.fillRect(px + 3, py + 22, 26, 2); // foot bar

    // Under-desk Book Slot with Blue Textbook Spine
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px + 4, py + 14, 24, 6);
    this.ctx.fillStyle = '#2563eb';
    this.ctx.fillRect(px + 7, py + 15, 12, 4); // textbook spine
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px + 9, py + 16, 7, 1);

    // Smooth Beech Wood Desk Top Surface
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(px, py + 8, 32, 10);
    this.ctx.fillStyle = '#fef3c7';
    this.ctx.fillRect(px, py + 8, 32, 1); // 1px front highlight
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px, py + 17, 32, 1); // 1px bottom edge

    // Recessed Pencil Groove on Desk with Green Pencil
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px + 5, py + 10, 22, 2);
    this.ctx.fillStyle = '#22c55e';
    this.ctx.fillRect(px + 8, py + 10, 10, 1); // pencil
  }

  // 8-B. Render 1학년 3반: 영어 타자 컴퓨터실 & 산성비 방어 기지
  renderAcidRainComputerLab(cr) {
    const termX = 15 * 32;
    const termY = 5 * 32;

    // 1. Digital Cyber Floor Mat under Central Terminal
    this.ctx.fillStyle = 'rgba(14, 165, 233, 0.12)';
    this.ctx.fillRect(termX - 64, termY - 16, 128, 48);
    this.ctx.strokeStyle = '#0284c7';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(termX - 64, termY - 16, 128, 48);

    // 2. Central Acid Rain Mainframe Terminal (크고 웅장한 중앙 메인 단말기)
    const px = termX - 32;
    const py = termY - 24;

    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(px, py + 18, 64, 22);
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px + 2, py + 20, 60, 18);

    const now = Date.now();
    const blink = Math.sin(now / 220) > 0;

    // Left Screen (Terminal matrix rain)
    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(px + 4, py, 26, 18);
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.font = 'bold 7px monospace';
    this.ctx.fillText(blink ? '> RAIN' : '> WORD', px + 7, py + 12);

    // Right Screen (Status radar)
    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(px + 34, py, 26, 18);
    this.ctx.fillStyle = '#10b981';
    this.ctx.font = 'bold 7px monospace';
    this.ctx.fillText('TYPING', px + 36, py + 12);

    // Keyboard & Glowing Mouse
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(px + 14, py + 22, 22, 6);
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillRect(px + 40, py + 23, 5, 4);

    // Terminal Nameplate
    this.drawSharpLabel(termX, termY - 32, '🖥️ 산성비 타자 컴퓨터 (방어전)', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#38bdf8',
      textColor: '#ffffff',
      fontSize: 11.5,
      paddingX: 10,
      height: 22
    });

    // 3. Server Rack Cabinet (선생님 메인 서버 x: 8, y: 4)
    if (cr.teacherDesk) {
      const sx = cr.teacherDesk.x * 32;
      const sy = cr.teacherDesk.y * 32;

      this.ctx.fillStyle = '#020617';
      this.ctx.fillRect(sx - 4, sy - 12, 40, 48);
      this.ctx.strokeStyle = '#334155';
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(sx - 4, sy - 12, 40, 48);

      for (let s = 0; s < 4; s++) {
        const slotY = sy - 8 + s * 10;
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(sx, slotY, 32, 7);
        this.ctx.fillStyle = ((now + s * 300) % 800 < 400) ? '#10b981' : '#3b82f6';
        this.ctx.fillRect(sx + 4, slotY + 2, 3, 3);
        this.ctx.fillStyle = ((now + s * 500) % 600 < 300) ? '#f59e0b' : '#64748b';
        this.ctx.fillRect(sx + 9, slotY + 2, 3, 3);
      }

      this.drawSharpLabel(sx + 16, sy - 20, '🎛️ 메인 서버', {
        bgColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: '#10b981',
        textColor: '#a7f3d0',
        fontSize: 10.5,
        paddingX: 7,
        height: 19
      });
    }

    // 4. Computer Workstation Desks (학생 컴퓨터 책상들)
    for (const d of (cr.desks || [])) {
      this.drawHighResComputerDesk(d);
    }
  }

  // 8-B-2. Render 1학년 4반: 드럼 치는 도덕쌤의 락스피릿 교실
  renderDrumMoralClassroom(cr) {
    const drumX = (cr.drumKit ? cr.drumKit.x : 19) * 32;
    const drumY = (cr.drumKit ? cr.drumKit.y : 5) * 32;

    // 1. Stage Lighting & Soundproof Velvet Mat
    this.ctx.fillStyle = 'rgba(136, 19, 55, 0.45)';
    this.ctx.beginPath();
    this.ctx.ellipse(drumX, drumY + 10, 68, 40, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Stage Spot Light Aura
    const grad = this.ctx.createRadialGradient(drumX, drumY - 5, 8, drumX, drumY + 8, 80);
    grad.addColorStop(0, 'rgba(253, 224, 71, 0.22)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.ellipse(drumX, drumY + 5, 80, 50, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. High-Res Drum Kit on Stage
    this.drawHighResDrumKit(drumX, drumY);

    // 3. Teacher Desk (도덕 교탁)
    if (cr.teacherDesk) {
      this.drawHighResTeacherDesk(cr);
    }

    // 4. Student Desks with Sheet Music
    for (const d of (cr.desks || [])) {
      this.drawHighResStudentDesk(d);
      const sx = d.x * 32;
      const sy = d.y * 32;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(sx + 5, sy + 6, 10, 8);
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(sx + 7, sy + 8, 6, 1);
      this.ctx.fillRect(sx + 7, sy + 10, 6, 1);

      this.drawSharpLabel(sx + 16, sy - 18, `🪑 ${d.seatIndex || (cr.desks.indexOf(d) + 1)}번 의자`, {
        bgColor: 'rgba(15, 23, 42, 0.92)',
        borderColor: '#38bdf8',
        textColor: '#e0f2fe',
        fontSize: 9.5,
        paddingX: 5,
        height: 17
      });
    }
  }

  // Draw High-Res 8-Bit Drum Kit (Bass, Snare, Toms, Cymbals, Amps, Throne)
  drawHighResDrumKit(x, y) {
    this.ctx.save();

    // 1. Vintage Stage Amplifiers (Left & Right)
    // Left Amp
    this.ctx.fillStyle = '#18181b';
    this.ctx.fillRect(x - 56, y - 10, 22, 28);
    this.ctx.fillStyle = '#78350f'; // vintage gold tweed grill
    this.ctx.fillRect(x - 54, y - 6, 18, 20);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 6px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('ROCK', x - 45, y + 6);

    // Right Amp
    this.ctx.fillStyle = '#18181b';
    this.ctx.fillRect(x + 36, y - 10, 22, 28);
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(x + 38, y - 6, 18, 20);
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillText('ETHIC', x + 47, y + 6);

    // 2. Drum Throne (Stool behind bass drum)
    this.ctx.fillStyle = '#09090b';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y - 16, 10, 5, 0, 0, Math.PI * 2);
    this.ctx.fill();
    // Crossed Drumsticks on throne
    this.ctx.strokeStyle = '#fef08a';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 7, y - 20);
    this.ctx.lineTo(x + 7, y - 12);
    this.ctx.moveTo(x + 7, y - 20);
    this.ctx.lineTo(x - 7, y - 12);
    this.ctx.stroke();

    // 3. Central Bass Drum (22" Big Kick Drum)
    // Shell Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + 14, 20, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Bass Drum Outer Rim (Sparkling Wine Red / Crimson Velvet)
    this.ctx.fillStyle = '#881337';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + 2, 20, 18, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Chrome Rim & Lugs
    this.ctx.strokeStyle = '#e2e8f0';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Front Resonant Head (Glossy Black with Gold Text)
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + 2, 17, 15, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Logo on Bass Drum Head
    this.ctx.fillStyle = '#fde047';
    this.ctx.font = 'bold 7px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('SOONGSIL', x, y - 1);
    this.ctx.font = 'bold 6px monospace';
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillText('BEAT 4', x, y + 7);

    // Kick Legs
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 16, y + 14);
    this.ctx.lineTo(x - 22, y + 18);
    this.ctx.moveTo(x + 16, y + 14);
    this.ctx.lineTo(x + 22, y + 18);
    this.ctx.stroke();

    // 4. Mounted Toms (Rack Toms) over bass drum
    // High Tom (Left)
    this.ctx.fillStyle = '#9f1239';
    this.ctx.beginPath();
    this.ctx.ellipse(x - 9, y - 11, 8, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#cbd5e1';
    this.ctx.lineWidth = 1.2;
    this.ctx.stroke();

    // Mid Tom (Right)
    this.ctx.fillStyle = '#9f1239';
    this.ctx.beginPath();
    this.ctx.ellipse(x + 9, y - 11, 8, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#cbd5e1';
    this.ctx.lineWidth = 1.2;
    this.ctx.stroke();

    // 5. Snare Drum on Chrome Stand (Left side)
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 23, y + 2);
    this.ctx.lineTo(x - 23, y + 12);
    this.ctx.stroke();

    this.ctx.fillStyle = '#e2e8f0'; // White Coated Head
    this.ctx.beginPath();
    this.ctx.ellipse(x - 23, y + 2, 9, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#38bdf8'; // Blue Accent Ring
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // 6. Floor Tom (Right side)
    this.ctx.fillStyle = '#881337';
    this.ctx.beginPath();
    this.ctx.ellipse(x + 24, y + 5, 11, 8, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#e2e8f0';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // 7. Cymbals (Gleaming Brass / Gold)
    // Hi-Hat Cymbals (Far Left)
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 36, y - 10);
    this.ctx.lineTo(x - 36, y + 14);
    this.ctx.stroke();

    this.ctx.fillStyle = '#f59e0b';
    this.ctx.beginPath();
    this.ctx.ellipse(x - 36, y - 8, 12, 4, -0.1, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#fef08a';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Crash Cymbal (Top Left Boom Stand)
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 22, y - 24);
    this.ctx.lineTo(x - 26, y - 6);
    this.ctx.stroke();

    this.ctx.fillStyle = '#fbbf24';
    this.ctx.beginPath();
    this.ctx.ellipse(x - 22, y - 24, 13, 4.5, -0.2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#fffbeb';
    this.ctx.stroke();

    // Ride Cymbal (Top Right Boom Stand)
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x + 24, y - 22);
    this.ctx.lineTo(x + 28, y - 4);
    this.ctx.stroke();

    this.ctx.fillStyle = '#f59e0b';
    this.ctx.beginPath();
    this.ctx.ellipse(x + 24, y - 22, 15, 5, 0.2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#fef08a';
    this.ctx.stroke();

    // 8. Music Stand with Sheet Music (Right of Drum)
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x + 44, y + 8);
    this.ctx.lineTo(x + 44, y + 20);
    this.ctx.stroke();
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(x + 39, y + 2, 10, 8);
    this.ctx.fillStyle = '#0f172a';
    this.ctx.font = 'bold 6px monospace';
    this.ctx.fillText('♪♫', x + 44, y + 8);

    // 9. Floating World Label
    this.drawSharpLabel(x, y - 36, '🥁 락앤롤 드럼 세트', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#fbbf24',
      textColor: '#ffffff',
      fontSize: 11,
      paddingX: 9,
      height: 20
    });

    this.ctx.restore();
  }

  // ========================================================
  // 🌟 5층 대형 진로실: 진로 방탈출 6대 단서 & 직업 패시브 아카데미
  // ========================================================
  renderCareerEscapeRoom(cr) {
    const app = window.MainApp;
    const clues = (app && app.playerData && Array.isArray(app.playerData.careerClues)) ? app.playerData.careerClues : [false, false, false, false, false, false];
    const hasEscaped = !!(app && app.playerData && app.playerData.hasEscapedCareerRoom);
    const solvedCount = clues.filter(Boolean).length;

    // 1. Zone Carpets / Mats (좌측 공간으로 정돈 배치)
    // Clue 1: Aptitude PC (x: 6, y: 6) - Cyan carpet
    this.ctx.fillStyle = 'rgba(6, 182, 212, 0.16)';
    this.ctx.fillRect(4.5 * 32, 4.8 * 32, 3.5 * 32, 2.8 * 32);
    this.ctx.strokeStyle = '#0891b2';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(4.5 * 32, 4.8 * 32, 3.5 * 32, 2.8 * 32);

    // Clue 2: Science Lab (x: 14, y: 6) - Emerald carpet
    this.ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
    this.ctx.fillRect(12.5 * 32, 4.8 * 32, 3.5 * 32, 2.8 * 32);
    this.ctx.strokeStyle = '#059669';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(12.5 * 32, 4.8 * 32, 3.5 * 32, 2.8 * 32);

    // Clue 5: Mentoring Desk (x: 22, y: 6) - Blue carpet
    this.ctx.fillStyle = 'rgba(59, 130, 246, 0.16)';
    this.ctx.fillRect(20.5 * 32, 4.8 * 32, 3.5 * 32, 2.8 * 32);
    this.ctx.strokeStyle = '#2563eb';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(20.5 * 32, 4.8 * 32, 3.5 * 32, 2.8 * 32);

    // Clue 3: IT Coding Desk (x: 6, y: 10) - Violet carpet
    this.ctx.fillStyle = 'rgba(139, 92, 246, 0.16)';
    this.ctx.fillRect(4.5 * 32, 8.8 * 32, 3.5 * 32, 2.8 * 32);
    this.ctx.strokeStyle = '#7c3aed';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(4.5 * 32, 8.8 * 32, 3.5 * 32, 2.8 * 32);

    // Clue 4: Art Easel (x: 14, y: 10) - Amber carpet
    this.ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
    this.ctx.fillRect(12.5 * 32, 8.8 * 32, 3.5 * 32, 2.8 * 32);
    this.ctx.strokeStyle = '#d97706';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(12.5 * 32, 8.8 * 32, 3.5 * 32, 2.8 * 32);

    // Clue 6: Astronomy Lab (x: 22, y: 10) - Indigo carpet
    this.ctx.fillStyle = 'rgba(99, 102, 241, 0.16)';
    this.ctx.fillRect(20.5 * 32, 8.8 * 32, 3.5 * 32, 2.8 * 32);
    this.ctx.strokeStyle = '#4f46e5';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(20.5 * 32, 8.8 * 32, 3.5 * 32, 2.8 * 32);

    // Central Exit Carpet Runner at Doorlock (x: 28.5 ~ 31.5, y: 5.2 ~ 7.0)
    this.ctx.fillStyle = hasEscaped ? 'rgba(34, 197, 94, 0.22)' : 'rgba(239, 68, 68, 0.22)';
    this.ctx.fillRect(28.5 * 32, 5.2 * 32, 3 * 32, 1.8 * 32);
    this.ctx.strokeStyle = hasEscaped ? '#22c55e' : '#ef4444';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(28.5 * 32, 5.2 * 32, 3 * 32, 1.8 * 32);

    // 2. Draw Station 1: 🏥 Aptitude PC (x: 6, y: 6)
    this.drawCareerStationPC(6 * 32, 6 * 32);
    this.drawCareerClueLabel(6 * 32 + 16, 6 * 32 - 18, 1, '적성검사 PC', 'D', clues[0]);

    // 3. Draw Station 2: 🔬 Science Lab (x: 14, y: 6)
    this.drawCareerStationLab(14 * 32, 6 * 32);
    this.drawCareerClueLabel(14 * 32 + 16, 6 * 32 - 18, 2, '과학 연구대', 'R', clues[1]);

    // 4. Draw Station 5: 🤝 Mentoring Desk (x: 22, y: 6)
    this.drawCareerStationMentor(22 * 32, 6 * 32);
    this.drawCareerClueLabel(22 * 32 + 16, 6 * 32 - 18, 5, '멘토링 데스크', 'M', clues[4]);

    // 5. Draw Station 3: 💻 Engineering / IT Desk (x: 6, y: 10)
    this.drawCareerStationTech(6 * 32, 10 * 32);
    this.drawCareerClueLabel(6 * 32 + 16, 10 * 32 - 18, 3, '공학 작업대', 'E', clues[2]);

    // 6. Draw Station 4: 🎨 Art Easel (x: 14, y: 10)
    this.drawCareerStationArt(14 * 32, 10 * 32);
    this.drawCareerClueLabel(14 * 32 + 16, 10 * 32 - 18, 4, '예술 이젤', 'A', clues[3]);

    // 7. Draw Station 6: 🔭 Astronomy Lab (x: 22, y: 10)
    this.drawCareerStationSpace(22 * 32, 10 * 32);
    this.drawCareerClueLabel(22 * 32 + 16, 10 * 32 - 18, 6, '우주 탐구관', 'S', clues[5]);

    // 8. Draw Decoy Clue Station 7: 💼 Vintage Briefcase (x: 10, y: 14)
    this.drawCareerStationDecoy(10 * 32, 14 * 32);
    this.drawCareerClueLabel(10 * 32 + 16, 14 * 32 - 18, 7, '골동품 서류가방', 'P', clues[6]);

    // 8-B. Draw Decoy Clue Station 8: 🎙️ Broadcast Studio & Sound Booth (x: 18, y: 14)
    this.drawCareerStationBroadcast(18 * 32, 14 * 32);
    this.drawCareerClueLabel(18 * 32 + 16, 14 * 32 - 18, 8, '방송 마이크 부스', 'K', clues[7]);

    // 9. Draw Fallen Developer Note #2 (가장 왼쪽 아래편: x: 4, y: 16)
    this.drawHighResDevNote(4 * 32, 16 * 32, '📜 떨어진 개발자노트 (제2편)');

    // 10. Draw Digital Escape Keypad (x: 30, y: 6)
    this.drawCareerKeypadStation(30 * 32, 6 * 32, hasEscaped, solvedCount);

    // 11. Chalkboard Mission Header on the Top Wall (x: 30, y: 2)
    this.drawCareerBlackboardBanner(clues, solvedCount, hasEscaped);

    // 12. 💬 우측 1:1 상담실 1 & 1:1 상담실 2 (세로 상/하 배치) 렌더링 호출
    this.renderCareerCounselingRooms();
  }
  // =========================================================================
  // 💬 5층 진로상담실 우측: 1:1 상담실 1 & 1:1 상담실 2 렌더러
  // =========================================================================
  renderCareerCounselingRooms() {
    const ctx = this.ctx;
    ctx.save();

    // ========================================================
    // [1:1 상담실 1 - 상단 세로 배치 (x: 43..57, y: 4..9)]
    // 가로 폭 14타일 & 서쪽(왼쪽) 출입문
    // ========================================================
    // 1-A. 바닥 프리미엄 카펫 (세이지 민트)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.fillRect(43.5 * 32, 4.5 * 32, 13.5 * 32, 4.5 * 32);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(43.5 * 32, 4.5 * 32, 13.5 * 32, 4.5 * 32);

    // 1-B. 서쪽 출입구 웰컴 러너 (x: 42..44, y: 6..8)
    ctx.fillStyle = 'rgba(6, 95, 70, 0.7)';
    ctx.fillRect(42 * 32, 6 * 32, 1.8 * 32, 2 * 32);

    // 1-C. 파티션 벽체 (북쪽, 동쪽, 남쪽, 서쪽 출입문 분리)
    this.drawCareerPartitionWall(43, 4, 57, 4);  // 북쪽 벽체
    this.drawCareerPartitionWall(57, 4, 57, 9);  // 동쪽 벽체
    this.drawCareerPartitionWall(43, 9, 57, 9);  // 남쪽 벽체 (아래쪽 완전 차단)
    this.drawCareerPartitionWall(43, 4, 43, 5);  // 서쪽 상단벽
    this.drawCareerPartitionWall(43, 8, 43, 9);  // 서쪽 하단벽 (y 6..7은 출입구)

    // 1-D. 내부 가구 및 원형 상담 테이블 (x: 50*32+16, y: 6*32+16)
    this.drawCareerCounselDesk1(50 * 32 + 16, 6 * 32 + 16);

    // 1-F. 가장 구석 책상 위 진로 적성 검사 안내서 (x: 55, y: 5)
    if (!window.MainApp || typeof window.MainApp.isQuestCareerBookCollected !== 'function' || !window.MainApp.isQuestCareerBookCollected()) {
      this.drawCareerQuestGuideBook(55 * 32, 5 * 32);
    }

    // 1-E. 서쪽 출입구 상단 도어 명패 현판
    this.drawSharpLabel(42.5 * 32, 5.2 * 32, '💬 1:1 상담실 1', {
      bgColor: 'rgba(6, 78, 59, 0.95)',
      borderColor: '#34d399',
      textColor: '#ecfdf5',
      fontSize: 11.5,
      paddingX: 10,
      height: 22
    });

    // ========================================================
    // [1:1 상담실 2 - 하단 세로 배치 (x: 43..57, y: 11..16)]
    // 가로 폭 14타일 & 서쪽(왼쪽) 출입문
    // ========================================================
    // 2-A. 바닥 프리미엄 카펫 (포근한 웜 피치)
    ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
    ctx.fillRect(43.5 * 32, 11.5 * 32, 13.5 * 32, 4.5 * 32);
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(43.5 * 32, 11.5 * 32, 13.5 * 32, 4.5 * 32);

    // 2-B. 서쪽 출입구 웰컴 러너 (x: 42..44, y: 13..15)
    ctx.fillStyle = 'rgba(136, 19, 55, 0.7)';
    ctx.fillRect(42 * 32, 13 * 32, 1.8 * 32, 2 * 32);

    // 2-C. 파티션 벽체 (북쪽, 동쪽, 남쪽, 서쪽 출입문 분리)
    this.drawCareerPartitionWall(43, 11, 57, 11); // 북쪽 벽체
    this.drawCareerPartitionWall(57, 11, 57, 16); // 동쪽 벽체
    this.drawCareerPartitionWall(43, 16, 57, 16); // 남쪽 벽체 (아래쪽 완전 차단)
    this.drawCareerPartitionWall(43, 11, 43, 12); // 서쪽 상단벽
    this.drawCareerPartitionWall(43, 15, 43, 16); // 서쪽 하단벽 (y 13..14는 출입구)

    // 2-D. 내부 가구 및 타원 코칭 테이블 (x: 50*32+16, y: 13*32+16)
    this.drawCareerCounselDesk2(50 * 32 + 16, 13 * 32 + 16);

    // 2-E. 서쪽 출입구 상단 도어 명패 현판
    this.drawSharpLabel(42.5 * 32, 12.2 * 32, '💬 1:1 상담실 2', {
      bgColor: 'rgba(136, 19, 55, 0.95)',
      borderColor: '#fda4af',
      textColor: '#fff1f2',
      fontSize: 11.5,
      paddingX: 10,
      height: 22
    });

    ctx.restore();
  }

  // 방음 파티션 벽체 렌더링 헬퍼
  drawCareerPartitionWall(x1, y1, x2, y2) {
    const ctx = this.ctx;
    const px1 = x1 * 32;
    const py1 = y1 * 32;
    const px2 = x2 * 32;
    const py2 = y2 * 32;

    const minX = Math.min(px1, px2);
    const maxX = Math.max(px1, px2);
    const minY = Math.min(py1, py2);
    const maxY = Math.max(py1, py2);

    const isHoriz = (y1 === y2);
    const thick = 8;

    ctx.fillStyle = '#451a03'; // 다크 월넛 원목
    if (isHoriz) {
      ctx.fillRect(minX, minY - thick / 2, (maxX - minX) + 32, thick);
      ctx.fillStyle = 'rgba(226, 232, 240, 0.55)'; // 안개 유리창
      ctx.fillRect(minX + 4, minY - thick / 2 + 2, (maxX - minX) + 24, thick - 4);
    } else {
      ctx.fillRect(minX - thick / 2, minY, thick, (maxY - minY) + 32);
      ctx.fillStyle = 'rgba(226, 232, 240, 0.55)';
      ctx.fillRect(minX - thick / 2 + 2, minY + 4, thick - 4, (maxY - minY) + 24);
    }
  }

  // [1:1 상담실 1] 원형 상담 테이블 & 의자 & 소품 렌더링
  drawCareerCounselDesk1(cx, cy) {
    const ctx = this.ctx;

    // 북쪽 상담 교사용 원목 암체어
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(cx, cy - 22, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 남쪽 학생용 패브릭 체어
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.arc(cx, cy + 22, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 원형 상담 테이블 상판
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.arc(cx + 2, cy + 3, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#78350f'; // 원목 브라운
    ctx.beginPath();
    ctx.arc(cx, cy, 23, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.arc(cx, cy, 21, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 테이블 위 소품: 진로 상담 파일철 (하늘색)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(cx - 12, cy - 8, 12, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 10, cy - 6, 8, 12);

    // 따뜻한 앰버 스탠드 조명 (골드 갓)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx + 10, cy - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.beginPath();
    ctx.arc(cx + 10, cy - 5, 10, 0, Math.PI * 2);
    ctx.fill();

    // 미니 다육이 화분
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx + 8, cy + 6, 6, 6);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(cx + 11, cy + 6, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // [1:1 상담실 2] 타원형 코칭 테이블 & 의자 & 소품 렌더링
  drawCareerCounselDesk2(cx, cy) {
    const ctx = this.ctx;

    // 북쪽 코칭 교사용 가죽 체어
    ctx.fillStyle = '#4c0519';
    ctx.beginPath();
    ctx.arc(cx, cy - 22, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 남쪽 학생용 체어
    ctx.fillStyle = '#831843';
    ctx.beginPath();
    ctx.arc(cx, cy + 22, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 타원형 코칭 테이블 상판
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(cx + 2, cy + 3, 26, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 25, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#581c87';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 23, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e9d5ff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 테이블 위 소품: 자기주도학습 플래너 (보라색)
    ctx.fillStyle = '#9333ea';
    ctx.fillRect(cx - 14, cy - 6, 12, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 12, cy - 4, 8, 10);

    // 따뜻한 차 찻잔과 모락모락 김
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx + 8, cy - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(cx + 8, cy - 4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 탁상 비전 캘린더 (우측 하단)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cx + 4, cy + 4, 10, 8);
    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(cx + 4, cy + 4, 10, 8);
  }

  // Clue 1: Medical / Aptitude PC Desk
  drawCareerStationPC(px, py) {
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(px - 4, py + 8, 40, 20);
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px - 2, py + 10, 36, 16);

    // Glowing Cyan Medical Monitor
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(px + 4, py - 6, 24, 16);
    this.ctx.fillStyle = '#0284c7';
    this.ctx.fillRect(px + 6, py - 4, 20, 12);
    // Medical Cross
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px + 14, py - 2, 4, 8);
    this.ctx.fillRect(px + 12, py, 8, 4);

    // Keyboard & Mouse
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(px + 4, py + 16, 16, 6);
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillRect(px + 23, py + 17, 5, 5);
  }

  // Clue 2: Science Lab Bench with Flask & Microscope
  drawCareerStationLab(px, py) {
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px - 6, py + 8, 44, 20);
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(px - 4, py + 10, 40, 16);

    // Glass Beaker & Flask with Bubbling Liquid
    this.ctx.fillStyle = '#10b981';
    this.ctx.beginPath();
    this.ctx.arc(px + 6, py + 16, 6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.fillRect(px + 4, py + 7, 4, 6);

    // Test Tube Rack
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px + 16, py + 14, 14, 5);
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(px + 17, py + 9, 3, 6);
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.fillRect(px + 21, py + 9, 3, 6);
    this.ctx.fillStyle = '#10b981';
    this.ctx.fillRect(px + 25, py + 9, 3, 6);
  }

  // Clue 3: Engineering Workstation with Dual Monitors
  drawCareerStationTech(px, py) {
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(px - 6, py + 8, 44, 20);
    this.ctx.fillStyle = '#1e1b4b';
    this.ctx.fillRect(px - 4, py + 10, 40, 16);

    // Dual Monitors (Left: Code, Right: Circuit)
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px - 2, py - 4, 16, 13);
    this.ctx.fillStyle = '#10b981';
    this.ctx.fillRect(px, py - 2, 12, 9);
    // Green code lines
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(px + 1, py, 10, 1.5);
    this.ctx.fillRect(px + 1, py + 3, 8, 1.5);

    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px + 18, py - 4, 16, 13);
    this.ctx.fillStyle = '#8b5cf6';
    this.ctx.fillRect(px + 20, py - 2, 12, 9);

    // Cyber Keyboard
    this.ctx.fillStyle = '#6366f1';
    this.ctx.fillRect(px + 6, py + 16, 20, 6);
  }

  // Clue 4: Wooden Art Easel with Sunset Canvas
  drawCareerStationArt(px, py) {
    // Easel Legs (Wooden A-frame)
    this.ctx.strokeStyle = '#b45309';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 16, py - 8);
    this.ctx.lineTo(px + 4, py + 24);
    this.ctx.moveTo(px + 16, py - 8);
    this.ctx.lineTo(px + 28, py + 24);
    this.ctx.moveTo(px + 16, py - 8);
    this.ctx.lineTo(px + 16, py + 24);
    this.ctx.stroke();

    // Canvas
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px + 4, py - 4, 24, 18);
    this.ctx.strokeStyle = '#d97706';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(px + 4, py - 4, 24, 18);

    // Sunset Painting on Canvas
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(px + 6, py - 2, 20, 8);
    this.ctx.fillStyle = '#ec4899';
    this.ctx.fillRect(px + 6, py + 6, 20, 6);
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 6, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Palette on Stool
    this.ctx.fillStyle = '#d97706';
    this.ctx.beginPath();
    this.ctx.ellipse(px + 26, py + 18, 6, 4, 0.3, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(px + 24, py + 17, 2, 2);
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.fillRect(px + 27, py + 17, 2, 2);
  }

  // Clue 5: Executive Mentoring Desk with Globe
  drawCareerStationMentor(px, py) {
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(px - 4, py + 8, 40, 20);
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px - 2, py + 10, 36, 16);

    // Glowing World Globe
    this.ctx.strokeStyle = '#fbbf24';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(px + 8, py + 2, 7, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.beginPath();
    this.ctx.arc(px + 8, py + 2, 5.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Stacked Books with Ribbon
    this.ctx.fillStyle = '#1e3a8a';
    this.ctx.fillRect(px + 20, py + 13, 14, 4);
    this.ctx.fillStyle = '#be123c';
    this.ctx.fillRect(px + 21, py + 9, 12, 4);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(px + 26, py + 8, 2, 10);
  }

  // Clue 6: Astronomical Telescope Station
  drawCareerStationSpace(px, py) {
    // Telescope Tripod
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 16, py + 10);
    this.ctx.lineTo(px + 6, py + 24);
    this.ctx.moveTo(px + 16, py + 10);
    this.ctx.lineTo(px + 26, py + 24);
    this.ctx.moveTo(px + 16, py + 10);
    this.ctx.lineTo(px + 16, py + 24);
    this.ctx.stroke();

    // Brass Telescope Barrel pointing upper right
    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 8, py + 14);
    this.ctx.lineTo(px + 24, py + 4);
    this.ctx.stroke();
    this.ctx.strokeStyle = '#fbbf24';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 24, py + 4);
    this.ctx.lineTo(px + 28, py + 1.5);
    this.ctx.stroke();

    // Star particle sparkle
    this.ctx.fillStyle = '#fde047';
    this.ctx.fillRect(px + 29, py, 2, 2);
    this.ctx.fillRect(px + 28, py - 1, 4, 1);
  }

  // Decoy Clue 7: Vintage Briefcase on Small Table
  drawCareerStationDecoy(px, py) {
    // Red/Gold carpet runner
    this.ctx.fillStyle = 'rgba(180, 83, 9, 0.16)';
    this.ctx.fillRect(px - 14, py - 6, 60, 42);
    this.ctx.strokeStyle = '#d97706';
    this.ctx.lineWidth = 1.2;
    this.ctx.strokeRect(px - 14, py - 6, 60, 42);

    // Wooden table
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(px - 4, py + 8, 40, 18);
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px - 2, py + 10, 36, 14);

    // Vintage Leather Briefcase
    this.ctx.fillStyle = '#713f12';
    this.ctx.fillRect(px + 4, py, 24, 16);
    this.ctx.strokeStyle = '#ca8a04';
    this.ctx.lineWidth = 1.2;
    this.ctx.strokeRect(px + 4, py, 24, 16);

    // Brass latches & handle
    this.ctx.fillStyle = '#facc15';
    this.ctx.fillRect(px + 7, py + 4, 3, 5);
    this.ctx.fillRect(px + 22, py + 4, 3, 5);
    this.ctx.fillRect(px + 13, py - 3, 6, 3);
  }

  // Decoy Clue 8: Broadcast Studio & Sound Booth (x: 18, y: 14)
  drawCareerStationBroadcast(px, py) {
    // Studio acoustic mat
    this.ctx.fillStyle = 'rgba(79, 70, 229, 0.16)';
    this.ctx.fillRect(px - 14, py - 6, 60, 42);
    this.ctx.strokeStyle = '#6366f1';
    this.ctx.lineWidth = 1.2;
    this.ctx.strokeRect(px - 14, py - 6, 60, 42);

    // Studio audio console desk
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(px - 4, py + 8, 40, 18);
    this.ctx.fillStyle = '#1e1b4b';
    this.ctx.fillRect(px - 2, py + 10, 36, 14);

    // Mixer sliders & knobs
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillRect(px + 2, py + 13, 3, 7);
    this.ctx.fillRect(px + 8, py + 12, 3, 8);
    this.ctx.fillRect(px + 14, py + 15, 3, 5);
    // Green/Yellow/Red VU meter
    this.ctx.fillStyle = '#22c55e';
    this.ctx.fillRect(px + 20, py + 14, 5, 2);
    this.ctx.fillStyle = '#eab308';
    this.ctx.fillRect(px + 20, py + 12, 5, 2);
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(px + 20, py + 10, 5, 2);

    // Boom arm & Studio Condenser Microphone
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 30, py + 10);
    this.ctx.lineTo(px + 26, py - 2);
    this.ctx.lineTo(px + 16, py - 4);
    this.ctx.stroke();

    // Mic body (silver cylinder)
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.fillRect(px + 12, py - 8, 8, 12);
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(px + 12, py - 8, 8, 12);
    // Pop filter circle
    this.ctx.strokeStyle = '#0284c7';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(px + 9, py - 2, 5, 0, Math.PI * 2);
    this.ctx.stroke();

    // Glowing ON AIR red box
    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(px + 2, py - 8, 10, 5);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 3px sans-serif';
    this.ctx.fillText('ON AIR', px + 3, py - 4);
  }

  // Digital Escape Keypad
  drawCareerKeypadStation(kx, ky, hasEscaped, solvedCount) {
    // Pedestal
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(kx + 6, ky + 8, 20, 22);
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(kx + 8, ky + 10, 16, 18);

    // Glowing Keypad Screen
    this.ctx.fillStyle = hasEscaped ? '#14532d' : (solvedCount >= 6 ? '#78350f' : '#450a0a');
    this.ctx.fillRect(kx + 8, ky - 4, 16, 12);
    this.ctx.strokeStyle = hasEscaped ? '#22c55e' : (solvedCount >= 6 ? '#f59e0b' : '#ef4444');
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(kx + 8, ky - 4, 16, 12);

    // Status Icon
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 8px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(hasEscaped ? 'OPEN' : (solvedCount >= 6 ? 'READY' : `${solvedCount}/6`), kx + 16, ky + 4);

    const keypadLabel = hasEscaped ? '🔓 탈출 도어락 (전직 아카데미)' : `🔐 탈출 도어락 (단서 ${solvedCount}/6)`;
    this.drawSharpLabel(kx + 16, ky - 20, keypadLabel, {
      bgColor: hasEscaped ? 'rgba(6, 78, 59, 0.94)' : 'rgba(15, 23, 42, 0.94)',
      borderColor: hasEscaped ? '#22c55e' : (solvedCount >= 6 ? '#f59e0b' : '#ef4444'),
      textColor: '#ffffff',
      fontSize: 10.5,
      paddingX: 8,
      height: 19
    });
  }

  // Clue Floating Label
  drawCareerClueLabel(x, y, index, name, letter, isSolved) {
    if (isSolved) {
      this.drawSharpLabel(x, y, `✅ ${name}: [ ${letter} ]`, {
        bgColor: 'rgba(6, 78, 59, 0.95)',
        borderColor: '#22c55e',
        textColor: '#dcfce7',
        fontSize: 10,
        paddingX: 7,
        height: 18
      });
    } else {
      this.drawSharpLabel(x, y, `🔍 ${name}`, {
        bgColor: 'rgba(15, 23, 42, 0.92)',
        borderColor: '#38bdf8',
        textColor: '#e0f2fe',
        fontSize: 10,
        paddingX: 7,
        height: 18
      });
    }
  }

  // Blackboard Mission Banner (Top Wall, centerTileX = 30)
  drawCareerBlackboardBanner(clues, solvedCount, hasEscaped) {
    const bw = 18 * 32;
    const bx = Math.round((30 * 32) - (bw / 2));
    const by = 12;

    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.font = '800 13px "Pretendard", "Malgun Gothic", sans-serif';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('🌟 [5층 진로 방탈출] 6대 직업 단서를 모아 비밀 암호를 완성하라! 🌟', bx + bw / 2, by + 23);

    // Clue letter blocks
    const letters = ['D', 'R', 'E', 'A', 'M', 'S'];
    const startX = bx + bw / 2 - 130;
    for (let i = 0; i < 6; i++) {
      const lx = startX + i * 52;
      const isFound = !!clues[i];

      this.ctx.fillStyle = isFound ? '#14532d' : 'rgba(15, 23, 42, 0.6)';
      this.ctx.fillRect(lx, by + 34, 40, 24);
      this.ctx.strokeStyle = isFound ? '#22c55e' : '#475569';
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(lx, by + 34, 40, 24);

      this.ctx.fillStyle = isFound ? '#fde047' : '#94a3b8';
      this.ctx.font = 'bold 13px monospace';
      this.ctx.fillText(isFound ? letters[i] : '?', lx + 20, by + 51);
    }
    this.ctx.restore();
  }

  drawHighResComputerDesk(d) {
    const px = d.x * 32;
    const py = d.y * 32;

    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px, py + 4, 32, 20);
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(px + 2, py + 6, 28, 16);

    // Desktop LCD Monitor
    this.ctx.fillStyle = '#09090b';
    this.ctx.fillRect(px + 6, py - 4, 20, 14);
    this.ctx.fillStyle = '#0284c7';
    this.ctx.fillRect(px + 8, py - 2, 16, 10);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px + 10, py + 1, 10, 1.5);
    this.ctx.fillRect(px + 10, py + 4, 12, 1.5);

    // Stand & Keyboard
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(px + 14, py + 10, 4, 3);
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(px + 7, py + 12, 14, 5);

    // Tower PC Case
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(px + 23, py + 6, 7, 16);
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillRect(px + 26, py + 9, 2, 2);
  }

  // 9. High-Res Student Lockers Row (개인 사물함)
  drawHighResLockers(startX, startY, count = 4) {
    for (let i = 0; i < count; i++) {
      const lx = (startX + i) * 32;
      const ly = startY * 32;

      // Drop shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      this.ctx.fillRect(lx, ly + 28, 32, 4);

      // Locker Body (Soft Mint Blue-Gray)
      this.ctx.fillStyle = '#0f766e';
      this.ctx.fillRect(lx, ly, 32, 28);
      this.ctx.fillStyle = '#14b8a6';
      this.ctx.fillRect(lx + 2, ly + 2, 28, 24);

      // Seam & Highlight
      this.ctx.fillStyle = '#5eead4';
      this.ctx.fillRect(lx + 2, ly + 2, 28, 1);

      // Ventilation Louvers (3 Slits)
      this.ctx.fillStyle = '#0f766e';
      this.ctx.fillRect(lx + 8, ly + 6, 16, 1);
      this.ctx.fillRect(lx + 8, ly + 9, 16, 1);
      this.ctx.fillRect(lx + 8, ly + 12, 16, 1);

      // Number Tag Badge
      this.ctx.fillStyle = '#fef08a';
      this.ctx.fillRect(lx + 11, ly + 16, 10, 5);
      this.ctx.fillStyle = '#000000';
      this.ctx.font = 'bold 5px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`0${i + 1}`, lx + 16, ly + 20);

      // Silver Keyhole & Pull Handle
      this.ctx.fillStyle = '#cbd5e1';
      this.ctx.fillRect(lx + 24, ly + 16, 2, 6);
    }
  }

  // 10. High-Res Wall Clock (Above Blackboard)
  drawHighResWallClock(x, y) {
    // Clock Rim
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 12, 0, Math.PI * 2);
    this.ctx.fill();

    // Clock Face
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 10, 0, Math.PI * 2);
    this.ctx.fill();

    // 12, 3, 6, 9 Hour Marks
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(x - 1, y - 9, 2, 2);
    this.ctx.fillRect(x - 1, y + 7, 2, 2);
    this.ctx.fillRect(x - 9, y - 1, 2, 2);
    this.ctx.fillRect(x + 7, y - 1, 2, 2);

    // Clock Hands (9:30 AM English Class!)
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x - 5, y); // hour hand to 9
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x, y + 6); // minute hand to 6
    this.ctx.stroke();

    // Red Center Pivot & Second Hand
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // 11. High-Res Crafting Workbench
  drawHighResCraftTable(obj) {
    const px = obj.x * 32 - 12;
    const py = obj.y * 32 - 8;
    const w = 56;
    const h = 48;

    // Floor shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(px + 4, py + h - 6, w - 8, 8);

    if (obj.category === 'accessory') {
      // 💍 교화·교목 장신구 세공대 (벨벳 보석 세공 작업대)
      this.ctx.fillStyle = '#78350f';
      this.ctx.fillRect(px, py + 14, w, h - 14);
      this.ctx.fillStyle = '#92400e';
      this.ctx.fillRect(px + 4, py + 18, w - 8, h - 22);

      // 버건디 와인 벨벳 상판
      this.ctx.fillStyle = '#831843';
      this.ctx.fillRect(px - 2, py, w + 4, 16);
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.fillRect(px - 2, py, w + 4, 2);

      // 반짝이는 보석 및 교화(개나리) 장식
      this.ctx.save();
      this.ctx.font = '13px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('💍', px + 16, py + 13);
      this.ctx.fillText('🌼', px + 38, py + 13);
      this.ctx.restore();

      const labelText = obj.name ? `💍 ${obj.name}` : '💍 장신구 세공대';
      this.drawSharpLabel(px + w / 2, py + h + 8, labelText, {
        bgColor: 'rgba(131, 24, 67, 0.95)',
        borderColor: '#f59e0b',
        textColor: '#fef08a',
        fontSize: 12,
        paddingX: 10,
        height: 21
      });
      return;
    }

    if (obj.category === 'potion') {
      // 🧪 소비품 제작대 (신비한 포션 & 주문서 연금 작업대)
      this.ctx.fillStyle = '#1e293b';
      this.ctx.fillRect(px, py + 14, w, h - 14);
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(px + 4, py + 18, w - 8, h - 22);

      // 에메랄드 그린 상판
      this.ctx.fillStyle = '#065f46';
      this.ctx.fillRect(px - 2, py, w + 4, 16);
      this.ctx.fillStyle = '#34d399';
      this.ctx.fillRect(px - 2, py, w + 4, 2);

      // 반짝이는 물약 플라스크 및 마법 주문서
      this.ctx.save();
      this.ctx.font = '13px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('🧪', px + 16, py + 13);
      this.ctx.fillText('📜', px + 38, py + 13);
      this.ctx.restore();

      const labelText = obj.name ? `🧪 ${obj.name}` : '🧪 소비품 제작대';
      this.drawSharpLabel(px + w / 2, py + h + 8, labelText, {
        bgColor: 'rgba(6, 78, 59, 0.95)',
        borderColor: '#34d399',
        textColor: '#ecfdf5',
        fontSize: 12,
        paddingX: 10,
        height: 21
      });
      return;
    }

    // Heavy Oak Bench Body
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px, py + 14, w, h - 14);
    this.ctx.fillStyle = '#92400e';
    this.ctx.fillRect(px + 4, py + 18, w - 8, h - 22);

    // Top Work Surface
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(px - 2, py, w + 4, 16);
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillRect(px - 2, py, w + 4, 2); // highlight

    // Steel Carpenter Vice on side
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(px - 4, py + 4, 4, 12);
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(px - 6, py + 8, 6, 4);

    // Blue Unrolled Parchment Blueprint
    this.ctx.fillStyle = '#1e3a8a';
    this.ctx.fillRect(px + 8, py + 3, 22, 10);
    this.ctx.strokeStyle = '#60a5fa';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(px + 8, py + 3, 22, 10);

    // Steel Hammer & Inkpot
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(px + 34, py + 5, 8, 4); // hammer head
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px + 37, py + 9, 2, 6); // wooden handle

    // Title Badge
    const labelText = obj.name ? `🔨 ${obj.name}` : '🔨 학습 제작대';
    this.drawSharpLabel(px + w / 2, py + h + 8, labelText, {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#f59e0b',
      textColor: '#fef08a',
      fontSize: 12,
      paddingX: 10,
      height: 21
    });
  }

  // 11-B. High-Res Timber Pile (🪵 목재 채집터 - 5% 드랍)
  drawHighResWoodPile(obj) {
    const px = obj.x * 32 + 16;
    const py = obj.y * 32 + 16;

    // Floor Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 20, 24, 9, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Stacked Oak Logs (Bottom 3 logs, Top 2 logs)
    const logs = [
      { x: px - 14, y: py + 8 },
      { x: px, y: py + 8 },
      { x: px + 14, y: py + 8 },
      { x: px - 7, y: py - 2 },
      { x: px + 7, y: py - 2 }
    ];
    logs.forEach(lg => {
      // Bark cylinder
      this.ctx.fillStyle = '#78350f';
      this.ctx.fillRect(lg.x - 10, lg.y - 6, 20, 12);
      // Cut wood ring face
      this.ctx.fillStyle = '#fde68a';
      this.ctx.beginPath();
      this.ctx.arc(lg.x - 8, lg.y, 6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#92400e';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    });

    this.drawSharpLabel(px, py + 34, '🪵 목재', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#f59e0b',
      textColor: '#fde68a',
      fontSize: 11.5,
      paddingX: 9,
      height: 20
    });
  }

  // 11-C. High-Res Medicinal Herb Planter (🌿 허브)
  drawHighResHerbPlanter(obj) {
    const px = obj.x * 32 + 16;
    const py = obj.y * 32 + 16;

    // Floor Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 20, 22, 8, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Wooden Greenhouse Planter Box
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px - 20, py + 4, 40, 16);
    this.ctx.fillStyle = '#3f2e21'; // rich soil
    this.ctx.fillRect(px - 18, py + 2, 36, 6);

    // Lush Green Medicinal Herb Leaves
    const herbs = [
      { x: px - 12, y: py - 4 },
      { x: px, y: py - 8 },
      { x: px + 12, y: py - 4 }
    ];
    herbs.forEach(h => {
      this.ctx.fillStyle = '#16a34a';
      this.ctx.beginPath();
      this.ctx.ellipse(h.x - 4, h.y, 6, 10, -0.4, 0, Math.PI * 2);
      this.ctx.ellipse(h.x + 4, h.y, 6, 10, 0.4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#4ade80';
      this.ctx.beginPath();
      this.ctx.arc(h.x, h.y - 4, 3, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.drawSharpLabel(px, py + 34, '🌿 허브', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#4ade80',
      textColor: '#bbf7d0',
      fontSize: 11.5,
      paddingX: 9,
      height: 20
    });
  }

  // 11-C2. High-Res Hallway Leaderboard Blackboard (실시간 랭킹보드)
  drawHighResLeaderboard(obj) {
    const px = obj.x * 32 - 14;
    const py = obj.y * 32 - 12;
    const w = 60;
    const h = 42;

    // Floor shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.fillRect(px + 4, py + h - 4, w - 8, 6);

    // Ornate Golden Oak Frame
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px, py, w, h);
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px + 2, py + 2, w - 4, h - 4);
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(px + 4, py + 4, w - 8, h - 8);

    // Dark Forest Green Chalkboard Slate
    this.ctx.fillStyle = '#064e3b';
    this.ctx.fillRect(px + 6, py + 6, w - 12, h - 12);

    // Chalkboard Header: Centered Trophy & 랭킹보드
    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.font = '13px sans-serif';
    this.ctx.fillText('🏆', px + w / 2, py + 17);

    this.ctx.fillStyle = '#fef08a';
    this.ctx.font = 'bold 8.5px "Noto Sans KR", sans-serif';
    this.ctx.fillText('랭킹보드', px + w / 2, py + 28);
    this.ctx.restore();

    // Chalk tray with chalk sticks
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(px + 4, py + h - 4, w - 8, 4);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px + 12, py + h - 3, 6, 2);
    this.ctx.fillStyle = '#fde047';
    this.ctx.fillRect(px + 22, py + h - 3, 5, 2);

    this.drawSharpLabel(px + w / 2, py + h + 16, '🏆 랭킹보드', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#fbbf24',
      textColor: '#ffffff',
      fontSize: 12,
      paddingX: 10,
      height: 21
    });
  }

  // 11-D. High-Res Season 1 Boss: Ancient Tree Golem (1학년 2반 보스 레이드)
  drawHighResBossGolem(boss) {
    const px = boss.x * 32 + 16;
    const py = boss.y * 32 + 16;
    const bob = Math.sin(Date.now() / 260) * 3;

    // Glowing Crimson Raid Magic Circle on Floor
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 24, 52, 24, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(153, 27, 27, 0.28)';
    this.ctx.fill();

    // Boss Body (Toughened Stitched Leather Golem - 가죽 골렘)
    const by = py + bob;
    // Giant Tanned Leather Torso
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(px - 28, by - 26, 56, 42);
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px - 24, by - 22, 48, 34);

    // Stitched Heavy Leather Shoulder Pads
    this.ctx.fillStyle = '#92400e';
    this.ctx.fillRect(px - 32, by - 28, 18, 12);
    this.ctx.fillRect(px + 14, by - 28, 18, 12);
    // Leather Studs on Shoulders
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillRect(px - 30, by - 26, 3, 3);
    this.ctx.fillRect(px - 22, by - 26, 3, 3);
    this.ctx.fillRect(px + 17, by - 26, 3, 3);
    this.ctx.fillRect(px + 25, by - 26, 3, 3);

    // Thick Leather Harness Straps (X-Chest)
    this.ctx.strokeStyle = '#291d12';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(px - 20, by - 22);
    this.ctx.lineTo(px + 20, by + 12);
    this.ctx.moveTo(px + 20, by - 22);
    this.ctx.lineTo(px - 20, by + 12);
    this.ctx.stroke();

    // Stitched Leather Mask & Horns
    this.ctx.fillStyle = '#291d12';
    this.ctx.fillRect(px - 16, by - 44, 32, 22);
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px - 14, by - 42, 28, 18);

    // Leather Seam Stitches
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px - 1, by - 42, 2, 4);
    this.ctx.fillRect(px - 1, by - 36, 2, 4);
    this.ctx.fillRect(px - 1, by - 30, 2, 4);

    // Glowing Crimson Boss Eyes
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(px - 10, by - 36, 7, 5);
    this.ctx.fillRect(px + 3, by - 36, 7, 5);
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px - 8, by - 35, 3, 3);
    this.ctx.fillRect(px + 5, by - 35, 3, 3);

    // Glowing Rune Core on Chest
    this.ctx.fillStyle = '#dc2626';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 6, 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#fca5a5';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 6, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Massive Leather Wrapped Fists
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px - 42, by - 14, 14, 26);
    this.ctx.fillRect(px + 28, by - 14, 14, 26);
    this.ctx.fillStyle = '#92400e';
    this.ctx.fillRect(px - 40, by - 10, 10, 18);
    this.ctx.fillRect(px + 30, by - 10, 10, 18);
    this.ctx.restore();

    // 1학년 2반 가죽 골렘 전용 네임플레이트 (외부 협동 레이드와 완전 분리)
    const bName = '🪵 가죽 골렘';
    const bMaxHp = (boss && boss.maxHp) || 2000;
    const bCurHp = (boss && boss.currentHp !== undefined) ? boss.currentHp : bMaxHp;
    const labelText = `${bName} (HP ${bCurHp}/${bMaxHp})`;

    this.drawSharpLabel(px, py - 58, labelText, {
      bgColor: 'rgba(69, 26, 3, 0.96)',
      borderColor: '#f59e0b',
      textColor: '#fef08a',
      fontSize: 13,
      paddingX: 12,
      height: 24
    });
  }

  // 11-E. High-Res Season 1 Boss: Ancient Bronze Dragon (1학년 2반 숭실 청동 드래곤 레이드)
  drawHighResBossDragon(boss) {
    const px = boss.x * 32 + 16;
    const py = boss.y * 32 + 16;
    const now = Date.now();
    const bob = Math.sin(now / 280) * 4;
    const wingFlap = Math.sin(now / 220) * 9;
    const tailSway = Math.sin(now / 340) * 8;

    this.ctx.save();
    // 1.5x Scale for Ancient Bronze Dragon
    this.ctx.translate(px, py);
    this.ctx.scale(1.5, 1.5);
    this.ctx.translate(-px, -py);

    // 1. Ancient Bronze & Verdigris (청동 녹청) Magic Circle on Floor
    this.ctx.strokeStyle = 'rgba(180, 83, 9, 0.92)'; // Deep Metallic Bronze
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 26, 60, 26, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(120, 53, 15, 0.28)';
    this.ctx.fill();

    // Inner Antique Verdigris (청동 녹빛 옥색) Runed Ring
    this.ctx.strokeStyle = 'rgba(20, 184, 166, 0.75)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 26, 42, 18, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    // Ancient Draconic Bronze Rune Lines
    for (let r = 0; r < 4; r++) {
      const angle = (Math.PI / 4) * r + (now / 3200);
      const rx = Math.cos(angle) * 38;
      const ry = Math.sin(angle) * 16;
      this.ctx.strokeStyle = (r % 2 === 0) ? 'rgba(217, 119, 6, 0.55)' : 'rgba(45, 212, 191, 0.55)';
      this.ctx.beginPath();
      this.ctx.moveTo(px - rx, py + 26 - ry);
      this.ctx.lineTo(px + rx, py + 26 + ry);
      this.ctx.stroke();
    }

    const by = py + bob;

    // 2. Heavy Bronze Dragon Tail (With Antiqued Bronze Spikes)
    this.ctx.fillStyle = '#5c2b09';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 10, by + 12);
    this.ctx.quadraticCurveTo(px + 36 + tailSway, by + 18, px + 44 + tailSway, by + 8);
    this.ctx.lineTo(px + 40 + tailSway, by + 3);
    this.ctx.quadraticCurveTo(px + 28 + tailSway * 0.7, by + 12, px + 8, by + 6);
    this.ctx.closePath();
    this.ctx.fill();

    // Spiked Bronze Fin at Tail Tip with Verdigris Spine
    this.ctx.fillStyle = '#b45309';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 44 + tailSway, by + 8);
    this.ctx.lineTo(px + 56 + tailSway, by + 5);
    this.ctx.lineTo(px + 46 + tailSway, by - 2);
    this.ctx.closePath();
    this.ctx.fill();
    // Verdigris Patina Spine Highlight
    this.ctx.fillStyle = '#14b8a6';
    this.ctx.fillRect(px + 43 + tailSway, by + 3, 3, 4);

    // 3. Massive Armored Bronze Wings (Dark Cast Bronze Spines & Antique Copper Membranes)
    // Left Wing
    const lTipY = by - 36 + wingFlap;
    this.ctx.fillStyle = 'rgba(154, 52, 18, 0.88)'; // Antique Copper/Bronze Membrane
    this.ctx.beginPath();
    this.ctx.moveTo(px - 14, by - 12);
    this.ctx.lineTo(px - 58, lTipY);
    this.ctx.quadraticCurveTo(px - 44, lTipY + 22, px - 34, by + 4);
    this.ctx.quadraticCurveTo(px - 22, by + 14, px - 12, by + 6);
    this.ctx.closePath();
    this.ctx.fill();

    // Verdigris Patina Rib Veins on Wing
    this.ctx.strokeStyle = '#0d9488';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(px - 26, by - 2);
    this.ctx.lineTo(px - 46, lTipY + 12);
    this.ctx.moveTo(px - 18, by + 4);
    this.ctx.lineTo(px - 34, by + 10);
    this.ctx.stroke();

    // Cast Bronze Main Wing Bone Spine
    this.ctx.strokeStyle = '#451a03';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(px - 12, by - 10);
    this.ctx.lineTo(px - 36, lTipY - 6);
    this.ctx.lineTo(px - 58, lTipY);
    this.ctx.stroke();

    // Left Wing Bronze Claw Spur
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(px - 37, lTipY - 8, 5, 4);

    // Right Wing
    const rTipY = by - 36 + wingFlap;
    this.ctx.fillStyle = 'rgba(154, 52, 18, 0.88)'; // Antique Copper/Bronze Membrane
    this.ctx.beginPath();
    this.ctx.moveTo(px + 14, by - 12);
    this.ctx.lineTo(px + 58, rTipY);
    this.ctx.quadraticCurveTo(px + 44, rTipY + 22, px + 34, by + 4);
    this.ctx.quadraticCurveTo(px + 22, by + 14, px + 12, by + 6);
    this.ctx.closePath();
    this.ctx.fill();

    // Verdigris Patina Rib Veins on Right Wing
    this.ctx.strokeStyle = '#0d9488';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 26, by - 2);
    this.ctx.lineTo(px + 46, rTipY + 12);
    this.ctx.moveTo(px + 18, by + 4);
    this.ctx.lineTo(px + 34, by + 10);
    this.ctx.stroke();

    // Cast Bronze Main Wing Bone Spine
    this.ctx.strokeStyle = '#451a03';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 12, by - 10);
    this.ctx.lineTo(px + 36, rTipY - 6);
    this.ctx.lineTo(px + 58, rTipY);
    this.ctx.stroke();

    // Right Wing Bronze Claw Spur
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(px + 33, rTipY - 8, 5, 4);

    // 4. Heavy Bronze Hind Legs & Grounded Talons
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px - 28, by + 8, 14, 18);
    this.ctx.fillRect(px + 14, by + 8, 14, 18);
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px - 26, by + 10, 10, 14);
    this.ctx.fillRect(px + 16, by + 10, 10, 14);

    // Heavy Dark Iron Talons
    this.ctx.fillStyle = '#1c1917';
    this.ctx.fillRect(px - 30, by + 24, 6, 4);
    this.ctx.fillRect(px - 22, by + 24, 6, 4);
    this.ctx.fillRect(px + 14, by + 24, 6, 4);
    this.ctx.fillRect(px + 22, by + 24, 6, 4);

    // 5. Scaled Heavy Bronze Torso & Metallic Armor Plates
    this.ctx.fillStyle = '#451a03'; // Deep shadow bronze
    this.ctx.fillRect(px - 18, by - 16, 36, 32);
    this.ctx.fillStyle = '#78350f'; // Mid bronze
    this.ctx.fillRect(px - 16, by - 14, 32, 28);
    this.ctx.fillStyle = '#b45309'; // Polished bronze plates
    this.ctx.fillRect(px - 14, by - 12, 28, 24);

    // Segmented Antiqued Underbelly Plates (Heavy Riveted Bronze)
    this.ctx.fillStyle = '#9a3412';
    this.ctx.fillRect(px - 8, by - 12, 16, 6);
    this.ctx.fillRect(px - 7, by - 4, 14, 6);
    this.ctx.fillRect(px - 6, by + 4, 12, 6);
    this.ctx.fillRect(px - 5, by + 12, 10, 5);

    // Verdigris Patina Edge on Belly Plates
    this.ctx.fillStyle = '#14b8a6';
    this.ctx.fillRect(px - 8, by - 7, 16, 1.5);
    this.ctx.fillRect(px - 7, by + 1, 14, 1.5);
    this.ctx.fillRect(px - 6, by + 9, 12, 1.5);

    // 6. Molten Bronze Draconic Core in Chest (청동 드래곤의 심장)
    this.ctx.fillStyle = '#ea580c';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 2, 7, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#f97316';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 2, 4.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#fed7aa';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 2, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // 7. Muscular Armored Forelegs & Bronze Gauntlets
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px - 22, by + 2, 9, 20);
    this.ctx.fillRect(px + 13, by + 2, 9, 20);
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px - 21, by + 4, 7, 16);
    this.ctx.fillRect(px + 14, by + 4, 7, 16);
    // Foreleg Talons
    this.ctx.fillStyle = '#1c1917';
    this.ctx.fillRect(px - 23, by + 20, 11, 4);
    this.ctx.fillRect(px + 12, by + 20, 11, 4);

    // 8. Long Plated Bronze Neck
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(px - 10, by - 30, 20, 16);
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px - 8, by - 28, 16, 14);
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px - 6, by - 26, 12, 10);

    // 9. Angular Armored Bronze Dragon Head
    this.ctx.fillStyle = '#5c2b09';
    this.ctx.fillRect(px - 14, by - 46, 28, 20);
    this.ctx.fillStyle = '#9a3412';
    this.ctx.fillRect(px - 12, by - 44, 24, 16);
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px - 10, by - 42, 20, 12);

    // Sweeping Heavy Ancient Bronze Horns (With Verdigris Ridges)
    this.ctx.fillStyle = '#451a03';
    // Left Horn
    this.ctx.beginPath();
    this.ctx.moveTo(px - 10, by - 46);
    this.ctx.lineTo(px - 26, by - 64);
    this.ctx.lineTo(px - 5, by - 46);
    this.ctx.closePath();
    this.ctx.fill();
    // Right Horn
    this.ctx.beginPath();
    this.ctx.moveTo(px + 10, by - 46);
    this.ctx.lineTo(px + 26, by - 64);
    this.ctx.lineTo(px + 5, by - 46);
    this.ctx.closePath();
    this.ctx.fill();

    // Horn Verdigris Patina & Bronze Highlights
    this.ctx.fillStyle = '#14b8a6'; // Verdigris Patina
    this.ctx.fillRect(px - 22, by - 61, 3, 5);
    this.ctx.fillRect(px + 20, by - 61, 3, 5);
    this.ctx.fillStyle = '#d97706'; // Polished bronze edge
    this.ctx.fillRect(px - 25, by - 63, 2, 4);
    this.ctx.fillRect(px + 24, by - 63, 2, 4);

    // Fierce Mystic Cyan/Turquoise Draconic Eyes (신비로운 청동 고대 안광)
    this.ctx.fillStyle = '#0f766e'; // Dark Teal Socket
    this.ctx.fillRect(px - 9, by - 40, 6, 5);
    this.ctx.fillRect(px + 3, by - 40, 6, 5);
    this.ctx.fillStyle = '#06b6d4'; // Bright Cyan Eye
    this.ctx.fillRect(px - 8, by - 39, 4, 3);
    this.ctx.fillRect(px + 4, by - 39, 4, 3);
    this.ctx.fillStyle = '#a5f3fc'; // Piercing Mystic Pupil
    this.ctx.fillRect(px - 7, by - 38, 2, 2);
    this.ctx.fillRect(px + 5, by - 38, 2, 2);

    // Snout & Armored Jaw with Sharp Ivory Fangs
    this.ctx.fillStyle = '#5c2b09';
    this.ctx.fillRect(px - 8, by - 30, 16, 4); // mouth line
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(px - 6, by - 28, 3, 3); // fangs
    this.ctx.fillRect(px + 3, by - 28, 3, 3);

    // Drifting Molten Bronze Embers & Mystic Verdigris Sparks
    for (let i = 0; i < 5; i++) {
      const pOffset = (now / 340 + i * 1.3) % 4;
      const spX = px + Math.sin(now / 220 + i * 1.8) * 22;
      const spY = by - 28 - pOffset * 10;
      const spAlpha = Math.max(0, 1 - pOffset / 4);
      this.ctx.fillStyle = (i % 2 === 0)
        ? `rgba(249, 115, 22, ${spAlpha})` // Molten Bronze Ember
        : `rgba(45, 212, 191, ${spAlpha})`; // Verdigris Mystic Sparkle
      this.ctx.fillRect(spX, spY, 3, 3);
    }

    this.ctx.restore();

    // Boss Nameplate (청동 & 청록 녹청 하이테크 네임플레이트)
    const isRaidActive = !!(window.BOSS_CONFIG && window.BOSS_CONFIG.active);
    const bName = isRaidActive ? (window.BOSS_CONFIG.name || boss.name) : (boss.name || '🐉 숭실 청동 드래곤');
    const bMaxHp = isRaidActive ? (window.BOSS_CONFIG.maxHp || 5000) : (boss.maxHp || 5000);
    const bCurHp = isRaidActive ? (window.BOSS_CONFIG.currentHp ?? bMaxHp) : bMaxHp;
    const labelText = isRaidActive
      ? `🔥 ${bName} (HP ${bCurHp}/${bMaxHp})`
      : `${bName} (HP ${bMaxHp})`;

    this.drawSharpLabel(px, py - 95, labelText, {
      bgColor: isRaidActive ? 'rgba(69, 26, 3, 0.96)' : 'rgba(30, 41, 59, 0.94)',
      borderColor: isRaidActive ? '#14b8a6' : '#94a3b8',
      textColor: isRaidActive ? '#fed7aa' : '#e2e8f0',
      fontSize: 13,
      paddingX: 12,
      height: 24
    });
  }


  // 11-F. High-Res Boss: Midterm Exam Archdemon (1학년 2반 중간고사 대마왕)
  drawHighResBossDemon(boss) {
    const px = boss.x * 32 + 16;
    const py = boss.y * 32 + 16;
    const now = Date.now();
    const bob = Math.sin(now / 260) * 4;
    const wingFlap = Math.sin(now / 190) * 8;
    const tailSway = Math.sin(now / 290) * 9;
    const glowPulse = 0.7 + Math.sin(now / 220) * 0.3;

    this.ctx.save();

    // 1. Dark Violet & Crimson Cursed Magic Circle on Floor
    this.ctx.strokeStyle = 'rgba(168, 85, 247, 0.85)';
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 26, 62, 26, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(88, 28, 135, 0.28)';
    this.ctx.fill();

    // Inner Cursed Blood Ring
    this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 26, 44, 18, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    // Inverted Demonic Pentagram lines
    this.ctx.strokeStyle = 'rgba(220, 38, 38, 0.5)';
    this.ctx.lineWidth = 1.5;
    const starPts = 5;
    const sRadX = 40, sRadY = 16;
    this.ctx.beginPath();
    for (let i = 0; i < starPts * 2 + 1; i++) {
      const idx = (i * 2) % starPts;
      const ang = (Math.PI * 2 * idx) / starPts - Math.PI / 2 + (now / 4000);
      const sx = px + Math.cos(ang) * sRadX;
      const sy = py + 26 + Math.sin(ang) * sRadY;
      if (i === 0) this.ctx.moveTo(sx, sy);
      else this.ctx.lineTo(sx, sy);
    }
    this.ctx.stroke();

    // Cursed Exam Marks on Floor Glyphs (F, 0점, X)
    this.ctx.fillStyle = `rgba(239, 68, 68, ${glowPulse})`;
    this.ctx.font = 'bold 10px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('F', px - 46, py + 28);
    this.ctx.fillText('0점', px + 46, py + 28);
    this.ctx.fillText('X', px, py + 40);

    const by = py + bob;

    // 2. Barbed Demonic Tail
    this.ctx.fillStyle = '#18181b';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 8, by + 12);
    this.ctx.quadraticCurveTo(px + 34 + tailSway, by + 20, px + 44 + tailSway, by + 10);
    this.ctx.lineTo(px + 40 + tailSway, by + 5);
    this.ctx.quadraticCurveTo(px + 26 + tailSway * 0.7, by + 14, px + 6, by + 7);
    this.ctx.closePath();
    this.ctx.fill();

    // Spade Barbed Tip on Tail
    this.ctx.fillStyle = '#dc2626';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 44 + tailSway, by + 10);
    this.ctx.lineTo(px + 55 + tailSway, by + 7);
    this.ctx.lineTo(px + 45 + tailSway, by + 1);
    this.ctx.closePath();
    this.ctx.fill();

    // 3. Giant Demonic Bat Wings (Left & Right)
    // Left Wing
    const lTipY = by - 38 + wingFlap;
    this.ctx.fillStyle = 'rgba(59, 7, 100, 0.92)'; // Dark royal purple membrane
    this.ctx.beginPath();
    this.ctx.moveTo(px - 14, by - 14);
    this.ctx.lineTo(px - 62, lTipY);
    this.ctx.quadraticCurveTo(px - 48, lTipY + 24, px - 36, by + 6);
    this.ctx.quadraticCurveTo(px - 24, by + 16, px - 12, by + 8);
    this.ctx.closePath();
    this.ctx.fill();

    // Wing Bone Spines (Left)
    this.ctx.strokeStyle = '#09090b';
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.moveTo(px - 12, by - 12);
    this.ctx.lineTo(px - 38, lTipY - 8);
    this.ctx.lineTo(px - 62, lTipY);
    this.ctx.stroke();

    // Wing Claws / Spikes (Left)
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.moveTo(px - 38, lTipY - 8);
    this.ctx.lineTo(px - 43, lTipY - 14);
    this.ctx.lineTo(px - 35, lTipY - 8);
    this.ctx.closePath();
    this.ctx.fill();

    // Right Wing
    const rTipY = by - 38 - wingFlap;
    this.ctx.fillStyle = 'rgba(59, 7, 100, 0.92)';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 14, by - 14);
    this.ctx.lineTo(px + 62, rTipY);
    this.ctx.quadraticCurveTo(px + 48, rTipY + 24, px + 36, by + 6);
    this.ctx.quadraticCurveTo(px + 24, by + 16, px + 12, by + 8);
    this.ctx.closePath();
    this.ctx.fill();

    // Wing Bone Spines (Right)
    this.ctx.strokeStyle = '#09090b';
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 12, by - 12);
    this.ctx.lineTo(px + 38, rTipY - 8);
    this.ctx.lineTo(px + 62, rTipY);
    this.ctx.stroke();

    // Wing Claws / Spikes (Right)
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 38, rTipY - 8);
    this.ctx.lineTo(px + 43, rTipY - 14);
    this.ctx.lineTo(px + 35, rTipY - 8);
    this.ctx.closePath();
    this.ctx.fill();

    // 4. Demon Lord Torso & Magma Plates
    this.ctx.fillStyle = '#1e1b4b'; // Midnight Obsidian Torso
    this.ctx.fillRect(px - 22, by - 26, 44, 38);
    this.ctx.fillStyle = '#312e81';
    this.ctx.fillRect(px - 18, by - 22, 36, 30);

    // Glowing Crimson Magma Veins on Chest
    this.ctx.strokeStyle = '#dc2626';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(px - 14, by - 16);
    this.ctx.lineTo(px, by - 4);
    this.ctx.lineTo(px + 14, by - 16);
    this.ctx.moveTo(px, by - 4);
    this.ctx.lineTo(px, by + 6);
    this.ctx.stroke();

    // Pulsing Core Rune (Cursed Eye / F mark)
    this.ctx.fillStyle = '#b91c1c';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 6, 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#fef08a';
    this.ctx.font = 'bold 9px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('F', px, by - 3);

    // Spiked Shoulder Pauldrons
    this.ctx.fillStyle = '#581c87';
    this.ctx.fillRect(px - 28, by - 28, 14, 14);
    this.ctx.fillRect(px + 14, by - 28, 14, 14);
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(px - 26, by - 33, 4, 6);
    this.ctx.fillRect(px + 22, by - 33, 4, 6);

    // 5. Demon Lord Head & Towering Horns
    // Head Base
    this.ctx.fillStyle = '#09090b';
    this.ctx.fillRect(px - 15, by - 46, 30, 24);

    // Great Curved Obsidian Horns with Glowing Blood-Red Tips
    // Left Horn
    this.ctx.fillStyle = '#18181b';
    this.ctx.beginPath();
    this.ctx.moveTo(px - 11, by - 44);
    this.ctx.quadraticCurveTo(px - 32, by - 56, px - 28, by - 70);
    this.ctx.quadraticCurveTo(px - 20, by - 58, px - 5, by - 46);
    this.ctx.closePath();
    this.ctx.fill();
    // Left Horn Glowing Tip
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.moveTo(px - 27, by - 64);
    this.ctx.lineTo(px - 28, by - 70);
    this.ctx.lineTo(px - 22, by - 64);
    this.ctx.closePath();
    this.ctx.fill();

    // Right Horn
    this.ctx.fillStyle = '#18181b';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 11, by - 44);
    this.ctx.quadraticCurveTo(px + 32, by - 56, px + 28, by - 70);
    this.ctx.quadraticCurveTo(px + 20, by - 58, px + 5, by - 46);
    this.ctx.closePath();
    this.ctx.fill();
    // Right Horn Glowing Tip
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 27, by - 64);
    this.ctx.lineTo(px + 28, by - 70);
    this.ctx.lineTo(px + 22, by - 64);
    this.ctx.closePath();
    this.ctx.fill();

    // Glowing Yellow-Red Slit Eyes
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(px - 10, by - 38, 7, 5);
    this.ctx.fillRect(px + 3, by - 38, 7, 5);
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(px - 8, by - 37, 3, 3);
    this.ctx.fillRect(px + 5, by - 37, 3, 3);

    // Sinister Fanged Grin
    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(px - 8, by - 29, 16, 4);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px - 6, by - 29, 3, 2);
    this.ctx.fillRect(px - 1, by - 29, 3, 2);
    this.ctx.fillRect(px + 4, by - 29, 3, 2);

    // 6. Right Hand: The Cursed Blood-Red Scoring Spear (피빛 채점창 / 채점펜)
    const spearX = px + 36;
    const spearY = by - 18;
    this.ctx.fillStyle = '#0f172a'; // Obsidian shaft
    this.ctx.fillRect(spearX - 2, spearY - 42, 4, 70);
    // Gold Band
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillRect(spearX - 3, spearY - 26, 6, 4);
    // Oversized Red Fountain Pen Nib (채점펜촉)
    this.ctx.fillStyle = '#dc2626';
    this.ctx.beginPath();
    this.ctx.moveTo(spearX - 5, spearY - 26);
    this.ctx.lineTo(spearX, spearY - 48); // Sharp Nib Tip
    this.ctx.lineTo(spearX + 5, spearY - 26);
    this.ctx.closePath();
    this.ctx.fill();
    // Nib Center Slit & Ink Drop
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(spearX - 0.5, spearY - 44, 1, 10);
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(spearX, spearY - 51, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    // 7. Left Hand: Burning Midterm Exam Paper (불타는 0점 시험지)
    const paperX = px - 36;
    const paperY = by - 12;
    this.ctx.save();
    this.ctx.translate(paperX, paperY);
    this.ctx.rotate(-0.18 + Math.sin(now / 350) * 0.08);
    // Parchment Sheet
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(-12, -18, 24, 32);
    this.ctx.strokeStyle = '#d97706';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(-12, -18, 24, 32);
    // Test lines
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(-9, -13, 18, 2);
    this.ctx.fillRect(-9, -8, 18, 2);
    this.ctx.fillRect(-9, -3, 18, 2);
    this.ctx.fillRect(-9, 2, 18, 2);
    // Huge Red "0점" & Big Red "X"
    this.ctx.strokeStyle = '#ef4444';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(-8, -14);
    this.ctx.lineTo(8, 10);
    this.ctx.moveTo(8, -14);
    this.ctx.lineTo(-8, 10);
    this.ctx.stroke();
    this.ctx.fillStyle = '#dc2626';
    this.ctx.font = 'bold 8px monospace';
    this.ctx.fillText('0점', -8, 11);
    this.ctx.restore();

    // 8. Orbiting Cursed Exam Sheets (시험지의 망령들)
    for (let i = 0; i < 3; i++) {
      const orbAng = (now / 700) + (i * (Math.PI * 2 / 3));
      const orbX = px + Math.cos(orbAng) * 48;
      const orbY = by - 8 + Math.sin(orbAng) * 20;
      this.ctx.save();
      this.ctx.translate(orbX, orbY);
      this.ctx.rotate(orbAng * 0.5);
      this.ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
      this.ctx.fillRect(-6, -8, 12, 16);
      this.ctx.fillStyle = '#dc2626';
      this.ctx.font = 'bold 8px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(i % 2 === 0 ? 'F' : 'X', 0, 3);
      this.ctx.restore();
    }

    this.ctx.restore();

    // 9. Boss Nameplate (교사 설정 및 레이드 상태 표시)
    const isRaidActive = !!(window.BOSS_CONFIG && window.BOSS_CONFIG.active);
    const bName = isRaidActive ? (window.BOSS_CONFIG.name || boss.name) : (boss.name || '😈 중간고사 대마왕');
    const bMaxHp = isRaidActive ? (window.BOSS_CONFIG.maxHp || 7500) : (boss.maxHp || 7500);
    const bCurHp = isRaidActive ? (window.BOSS_CONFIG.currentHp ?? bMaxHp) : bMaxHp;
    const labelText = isRaidActive
      ? `🔥 ${bName} (HP ${bCurHp}/${bMaxHp})`
      : `⏳ [시즌 이벤트 보스] ${bName} (HP ${bMaxHp})`;

    this.drawSharpLabel(px, py - 78, labelText, {
      bgColor: isRaidActive ? 'rgba(76, 5, 25, 0.96)' : 'rgba(30, 41, 59, 0.94)',
      borderColor: isRaidActive ? '#f43f5e' : '#a855f7',
      textColor: isRaidActive ? '#fef08a' : '#f5d0fe',
      fontSize: 13,
      paddingX: 12,
      height: 24
    });
  }

  // 11-H. High-Res Boss: Speaking/Writing/Listening Cerberus (수행평가 3두마수 케르베로스)
  drawHighResBossCerberus(boss) {
    const px = boss.x * 32 + 16;
    const py = boss.y * 32 + 16;
    const now = Date.now();
    const bob = Math.sin(now / 240) * 3;
    const tailWag = Math.sin(now / 150) * 8;
    const breathL = Math.sin(now / 200) * 2;
    const breathR = Math.cos(now / 200) * 2;

    this.ctx.save();

    // 1. Fiery Lava & Evaluation Ring on Floor
    this.ctx.strokeStyle = 'rgba(234, 88, 12, 0.85)';
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 26, 60, 24, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(194, 65, 12, 0.25)';
    this.ctx.fill();

    this.ctx.fillStyle = '#fdba74';
    this.ctx.font = 'bold 9px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('SPEAK', px - 38, py + 28);
    this.ctx.fillText('WRITE', px, py + 38);
    this.ctx.fillText('LISTEN', px + 38, py + 28);

    const by = py + bob;

    // 2. Cerberus Hound Body
    this.ctx.fillStyle = '#1c1917';
    this.ctx.fillRect(px - 28, by - 16, 56, 34);
    this.ctx.fillStyle = '#44403c';
    this.ctx.fillRect(px - 24, by - 12, 48, 26);

    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px - 32, by - 14, 64, 5);
    this.ctx.fillStyle = '#f59e0b';
    for (let sp = 0; sp < 6; sp++) {
      this.ctx.fillRect(px - 28 + sp * 10, by - 17, 3, 3);
    }

    // 3. Tail
    this.ctx.strokeStyle = '#292524';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 24, by + 8);
    this.ctx.quadraticCurveTo(px + 40 + tailWag, by + 12, px + 44 + tailWag, by - 4);
    this.ctx.stroke();

    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(px + 44 + tailWag, by - 4, 5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.beginPath();
    this.ctx.arc(px + 44 + tailWag, by - 4, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    // 4. Head 1 (Left): Speaking Head (말하기 머리 - 파란 헤드셋 & 마이크)
    const h1X = px - 22;
    const h1Y = by - 26 + breathL;
    this.ctx.fillStyle = '#292524';
    this.ctx.fillRect(h1X - 9, h1Y - 12, 18, 20);
    this.ctx.fillStyle = '#1c1917';
    this.ctx.beginPath();
    this.ctx.moveTo(h1X - 9, h1Y - 12);
    this.ctx.lineTo(h1X - 14, h1Y - 20);
    this.ctx.lineTo(h1X - 4, h1Y - 12);
    this.ctx.fill();
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillRect(h1X - 6, h1Y - 6, 4, 4);
    this.ctx.fillRect(h1X + 2, h1Y - 6, 4, 4);
    this.ctx.strokeStyle = '#0284c7';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.arc(h1X, h1Y - 6, 12, Math.PI, 0);
    this.ctx.stroke();
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillRect(h1X - 14, h1Y - 8, 4, 8);
    this.ctx.fillRect(h1X + 10, h1Y - 8, 4, 8);
    this.ctx.strokeStyle = '#0284c7';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(h1X - 12, h1Y);
    this.ctx.lineTo(h1X - 4, h1Y + 7);
    this.ctx.stroke();
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(h1X - 4, h1Y + 7, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // 5. Head 2 (Center): Writing Head (쓰기 머리 - 황금 만년필 문 머리)
    const h2X = px;
    const h2Y = by - 32;
    this.ctx.fillStyle = '#44403c';
    this.ctx.fillRect(h2X - 11, h2Y - 14, 22, 22);
    this.ctx.fillStyle = '#ea580c';
    this.ctx.beginPath();
    this.ctx.moveTo(h2X - 9, h2Y - 14);
    this.ctx.lineTo(h2X - 5, h2Y - 24);
    this.ctx.lineTo(h2X, h2Y - 15);
    this.ctx.lineTo(h2X + 5, h2Y - 24);
    this.ctx.lineTo(h2X + 9, h2Y - 14);
    this.ctx.fill();
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(h2X - 7, h2Y - 6, 5, 4);
    this.ctx.fillRect(h2X + 2, h2Y - 6, 5, 4);
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(h2X - 16, h2Y + 4, 32, 4);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(h2X - 18, h2Y + 3, 5, 6);
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillRect(h2X + 8, h2Y + 4, 4, 4);

    // 6. Head 3 (Right): Listening Head (듣기 머리 - 쫑긋 솟은 귀 & 음파)
    const h3X = px + 22;
    const h3Y = by - 26 + breathR;
    this.ctx.fillStyle = '#292524';
    this.ctx.fillRect(h3X - 9, h3Y - 12, 18, 20);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.beginPath();
    this.ctx.moveTo(h3X + 9, h3Y - 12);
    this.ctx.lineTo(h3X + 16, h3Y - 24);
    this.ctx.lineTo(h3X + 3, h3Y - 12);
    this.ctx.fill();
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillRect(h3X - 6, h3Y - 6, 4, 4);
    this.ctx.fillRect(h3X + 2, h3Y - 6, 4, 4);
    this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(h3X + 16, h3Y - 20, 6, -Math.PI / 3, Math.PI / 3);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(h3X + 16, h3Y - 20, 10, -Math.PI / 3, Math.PI / 3);
    this.ctx.stroke();

    // 7. Paws
    this.ctx.fillStyle = '#1c1917';
    this.ctx.fillRect(px - 26, by + 16, 14, 12);
    this.ctx.fillRect(px + 12, by + 16, 14, 12);
    this.ctx.fillStyle = '#ea580c';
    this.ctx.fillRect(px - 24, by + 25, 10, 3);
    this.ctx.fillRect(px + 14, by + 25, 10, 3);

    this.ctx.restore();

    const isRaidActive = !!(window.BOSS_CONFIG && window.BOSS_CONFIG.active);
    const bName = isRaidActive ? (window.BOSS_CONFIG.name || boss.name) : (boss.name || '🐕 수행평가 3두마수 케르베로스');
    const bMaxHp = isRaidActive ? (window.BOSS_CONFIG.maxHp || 6000) : (boss.maxHp || 6000);
    const bCurHp = isRaidActive ? (window.BOSS_CONFIG.currentHp ?? bMaxHp) : bMaxHp;
    const labelText = isRaidActive
      ? `🔥 ${bName} (HP ${bCurHp}/${bMaxHp})`
      : `${bName} (HP ${bMaxHp})`;

    this.drawSharpLabel(px, py - 115, labelText, {
      bgColor: isRaidActive ? 'rgba(124, 45, 18, 0.96)' : 'rgba(30, 41, 59, 0.94)',
      borderColor: isRaidActive ? '#ea580c' : '#fdba74',
      textColor: isRaidActive ? '#ffedd5' : '#fed7aa',
      fontSize: 13,
      paddingX: 12,
      height: 24
    });
  }

  // 11-I. High-Res Boss: Final Exam Oblivion God (기말고사 파멸신)
  drawHighResBossFinalGod(boss) {
    const px = boss.x * 32 + 16;
    const py = boss.y * 32 + 16;
    const now = Date.now();
    const hover = Math.sin(now / 280) * 4;
    const wingFloat = Math.sin(now / 210) * 6;
    const scytheGlow = 0.6 + Math.sin(now / 160) * 0.4;

    this.ctx.save();
    // 1.4x Scale for Final Exam God of Ruin
    this.ctx.translate(px, py);
    this.ctx.scale(1.4, 1.4);
    this.ctx.translate(-px, -py);

    // 1. OMR Answer Sheet Grid on Floor
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(px - 54, py + 12, 108, 28);
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.ctx.fillRect(px - 54, py + 12, 108, 28);

    for (let r = 0; r < 5; r++) {
      const bx = px - 40 + r * 20;
      this.ctx.fillStyle = (r === 2 || r === 4) ? '#0284c7' : '#000000';
      this.ctx.beginPath();
      this.ctx.ellipse(bx, py + 26, 6, 4, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    const by = py + hover;

    // 2. Wings made of Floating OMR Test Cards
    this.ctx.save();
    this.ctx.translate(px - 28, by - 12 + wingFloat);
    this.ctx.rotate(-0.25);
    for (let c = 0; c < 3; c++) {
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.fillRect(-22 - c * 8, -12 + c * 8, 20, 26);
      this.ctx.strokeStyle = '#dc2626';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(-22 - c * 8, -12 + c * 8, 20, 26);
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(-18 - c * 8, -8 + c * 8, 4, 3);
      this.ctx.fillRect(-12 - c * 8, -8 + c * 8, 4, 3);
      this.ctx.fillRect(-18 - c * 8, -2 + c * 8, 4, 3);
    }
    this.ctx.restore();

    this.ctx.save();
    this.ctx.translate(px + 28, by - 12 - wingFloat);
    this.ctx.rotate(0.25);
    for (let c = 0; c < 3; c++) {
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.fillRect(8 + c * 8, -12 + c * 8, 20, 26);
      this.ctx.strokeStyle = '#dc2626';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(8 + c * 8, -12 + c * 8, 20, 26);
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(12 + c * 8, -8 + c * 8, 4, 3);
      this.ctx.fillRect(18 + c * 8, -8 + c * 8, 4, 3);
      this.ctx.fillRect(12 + c * 8, -2 + c * 8, 4, 3);
    }
    this.ctx.restore();

    // 3. Ethereal Grim Reaper Robes
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.moveTo(px, by - 36);
    this.ctx.lineTo(px - 22, by + 18);
    this.ctx.lineTo(px + 22, by + 18);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = '#0284c7';
    for (let t = -3; t <= 3; t++) {
      this.ctx.beginPath();
      this.ctx.moveTo(px + t * 6 - 3, by + 18);
      this.ctx.lineTo(px + t * 6, by + 26 + Math.sin(now / 180 + t) * 3);
      this.ctx.lineTo(px + t * 6 + 3, by + 18);
      this.ctx.fill();
    }

    // 4. Skull Hood & Spectral Glowing Eyes
    this.ctx.fillStyle = '#020617';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 26, 13, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    this.ctx.fillStyle = '#38bdf8';
    this.ctx.beginPath();
    this.ctx.arc(px - 5, by - 26, 3, 0, Math.PI * 2);
    this.ctx.arc(px + 5, by - 26, 3, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px - 6, by - 27, 2, 2);
    this.ctx.fillRect(px + 4, by - 27, 2, 2);

    // 5. Giant Computerized Sign Pen Scythe (컴싸 사신 낫)
    const scytheX = px + 28;
    const scytheY = by - 8;
    this.ctx.fillStyle = '#09090b';
    this.ctx.fillRect(scytheX - 3, scytheY - 48, 6, 76);
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.font = 'bold 7px sans-serif';
    this.ctx.fillText('OMR', scytheX - 7, scytheY - 14);
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(scytheX - 4, scytheY - 48, 8, 4);

    this.ctx.strokeStyle = `rgba(56, 189, 248, ${scytheGlow})`;
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(scytheX, scytheY - 48);
    this.ctx.quadraticCurveTo(scytheX - 36, scytheY - 64, scytheX - 52, scytheY - 32);
    this.ctx.stroke();

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(scytheX, scytheY - 48);
    this.ctx.quadraticCurveTo(scytheX - 34, scytheY - 62, scytheX - 50, scytheY - 32);
    this.ctx.stroke();

    this.ctx.restore();

    const isRaidActive = !!(window.BOSS_CONFIG && window.BOSS_CONFIG.active);
    const bName = isRaidActive ? (window.BOSS_CONFIG.name || boss.name) : (boss.name || '💀 기말고사 파멸신');
    const bMaxHp = isRaidActive ? (window.BOSS_CONFIG.maxHp || 8000) : (boss.maxHp || 8000);
    const bCurHp = isRaidActive ? (window.BOSS_CONFIG.currentHp ?? bMaxHp) : bMaxHp;
    const labelText = isRaidActive
      ? `🔥 ${bName} (HP ${bCurHp}/${bMaxHp})`
      : `${bName} (HP ${bMaxHp})`;

    this.drawSharpLabel(px, py - 105, labelText, {
      bgColor: isRaidActive ? 'rgba(15, 23, 42, 0.98)' : 'rgba(30, 41, 59, 0.94)',
      borderColor: isRaidActive ? '#38bdf8' : '#94a3b8',
      textColor: isRaidActive ? '#e0f2fe' : '#cbd5e1',
      fontSize: 13,
      paddingX: 12,
      height: 24
    });
  }

  // 11-J. High-Res Boss: Sloth Titan of Summer Vacation (방학 직전 나태의 거인)
  drawHighResBossSlothTitan(boss) {
    const px = boss.x * 32 + 16;
    const py = boss.y * 32 + 16;
    const now = Date.now();
    const breath = Math.sin(now / 320) * 3;
    const zFloat = (now / 400) % 30;

    this.ctx.save();
    // 2.0x Scale for God of Sloth / Sloth Titan
    this.ctx.translate(px, py);
    this.ctx.scale(2.0, 2.0);
    this.ctx.translate(-px, -py);

    // 1. Water Ripple Pool
    this.ctx.strokeStyle = 'rgba(14, 165, 233, 0.8)';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 24, 58, 22, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    this.ctx.fill();

    const by = py + breath;

    // 2. Giant Tube
    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.lineWidth = 12;
    this.ctx.beginPath();
    this.ctx.ellipse(px, by + 10, 42, 16, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.strokeStyle = '#ef4444';
    this.ctx.lineWidth = 12;
    this.ctx.setLineDash([16, 16]);
    this.ctx.beginPath();
    this.ctx.ellipse(px, by + 10, 42, 16, 0, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // 3. Lazy Giant Sloth Torso
    this.ctx.fillStyle = '#67e8f9';
    this.ctx.beginPath();
    this.ctx.ellipse(px, by - 6, 26, 22, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 4. Soft Plush Neck Pillow
    this.ctx.strokeStyle = '#fde047';
    this.ctx.lineWidth = 9;
    this.ctx.beginPath();
    this.ctx.arc(px, by - 20, 14, 0.2, Math.PI - 0.2);
    this.ctx.stroke();

    // 5. Sleepy Sloth Head
    this.ctx.fillStyle = '#a5f3fc';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 26, 14, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(px - 9, by - 27);
    this.ctx.lineTo(px - 3, by - 27);
    this.ctx.moveTo(px + 3, by - 27);
    this.ctx.lineTo(px + 9, by - 27);
    this.ctx.stroke();

    this.ctx.fillStyle = '#38bdf8';
    this.ctx.beginPath();
    this.ctx.arc(px + 6, by - 19 + Math.sin(now / 150) * 1.5, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    // 6. Left Hand: Smartphone
    const phoneX = px - 28;
    const phoneY = by - 2;
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(phoneX - 6, phoneY - 12, 12, 22);
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(phoneX - 4, phoneY - 10, 8, 18);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.moveTo(phoneX - 2, phoneY - 4);
    this.ctx.lineTo(phoneX + 2, phoneY - 1);
    this.ctx.lineTo(phoneX - 2, phoneY + 2);
    this.ctx.fill();

    // 7. Right Hand: Ice Cream Bar
    const iceX = px + 28;
    const iceY = by - 2;
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(iceX - 2, iceY + 2, 4, 10);
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillRect(iceX - 6, iceY - 10, 12, 14);

    // 8. Floating Zzz
    this.ctx.fillStyle = 'rgba(167, 139, 250, 0.85)';
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.fillText('Z', px + 16, by - 36 - zFloat);
    this.ctx.font = 'bold 9px sans-serif';
    this.ctx.fillText('z', px + 22, by - 44 - zFloat);
    this.ctx.font = 'bold 7px sans-serif';
    this.ctx.fillText('z', px + 26, by - 50 - zFloat);

    this.ctx.restore();

    const isRaidActive = !!(window.BOSS_CONFIG && window.BOSS_CONFIG.active);
    const bName = isRaidActive ? (window.BOSS_CONFIG.name || boss.name) : (boss.name || '🦥 방학 직전 나태의 거인');
    const bMaxHp = isRaidActive ? (window.BOSS_CONFIG.maxHp || 10000) : (boss.maxHp || 10000);
    const bCurHp = isRaidActive ? (window.BOSS_CONFIG.currentHp ?? bMaxHp) : bMaxHp;
    const labelText = isRaidActive
      ? `🔥 ${bName} (HP ${bCurHp}/${bMaxHp})`
      : `⏳ [축구장 보스] ${bName} (HP ${bMaxHp})`;

    this.drawSharpLabel(px, py - 66, labelText, {
      bgColor: isRaidActive ? 'rgba(8, 47, 73, 0.96)' : 'rgba(30, 41, 59, 0.94)',
      borderColor: isRaidActive ? '#38bdf8' : '#f59e0b',
      textColor: isRaidActive ? '#e0f2fe' : '#fef08a',
      fontSize: 13,
      paddingX: 12,
      height: 24
    });
  }

  // 11-K. High-Res Boss: Sacred White Tiger of Soongsil (숭실 백호 성수)
  drawHighResBossWhiteTiger(boss) {
    const px = boss.x * 32 + 16;
    const py = boss.y * 32 + 16;
    const now = Date.now();
    const breathe = Math.sin(now / 260) * 3;
    const tailWhip = Math.sin(now / 180) * 7;
    const sparkPulse = 0.7 + Math.sin(now / 140) * 0.3;

    this.ctx.save();
    // 🐯 숭실 백호 성수 1.5배 거대화 스케일 변환 (1.5x Scale Transformation)
    this.ctx.translate(px, py);
    this.ctx.scale(1.5, 1.5);
    this.ctx.translate(-px, -py);

    // 1. Sacred Azure Lightning Circle
    this.ctx.strokeStyle = `rgba(56, 189, 248, ${sparkPulse})`;
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 26, 62, 25, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(2, 132, 199, 0.2)';
    this.ctx.fill();

    for (let l = 0; l < 4; l++) {
      const lAng = (now / 600) + (l * Math.PI / 2);
      const lx = px + Math.cos(lAng) * 48;
      const ly = py + 26 + Math.sin(lAng) * 18;
      this.ctx.fillStyle = (l % 2 === 0) ? '#f59e0b' : '#facc15';
      this.ctx.beginPath();
      this.ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    const by = py + breathe;

    // 2. Powerful White Tiger Tail
    this.ctx.strokeStyle = '#f8fafc';
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 22, by + 8);
    this.ctx.quadraticCurveTo(px + 44 + tailWhip, by + 14, px + 48 + tailWhip, by - 6);
    this.ctx.stroke();

    this.ctx.strokeStyle = '#0284c7';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // 3. Pure White Muscular Tiger Body
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.beginPath();
    this.ctx.ellipse(px, by - 4, 30, 20, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#0284c7';
    for (let s = -2; s <= 2; s++) {
      this.ctx.beginPath();
      this.ctx.moveTo(px + s * 9 - 2, by - 20);
      this.ctx.lineTo(px + s * 9, by - 6);
      this.ctx.lineTo(px + s * 9 + 2, by - 20);
      this.ctx.fill();
    }

    // 4. Regal White Tiger Head
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 26, 17, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#f8fafc';
    this.ctx.beginPath();
    this.ctx.moveTo(px - 14, by - 36);
    this.ctx.lineTo(px - 19, by - 46);
    this.ctx.lineTo(px - 6, by - 39);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.moveTo(px + 14, by - 36);
    this.ctx.lineTo(px + 19, by - 46);
    this.ctx.lineTo(px + 6, by - 39);
    this.ctx.fill();

    // Golden Royal Seal on Forehead
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.font = 'bold 10px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('王', px, by - 31);

    this.ctx.fillStyle = '#0284c7';
    this.ctx.fillRect(px - 9, by - 28, 5, 4);
    this.ctx.fillRect(px + 4, by - 28, 5, 4);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px - 8, by - 29, 2, 2);
    this.ctx.fillRect(px + 5, by - 29, 2, 2);

    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(px - 2, by - 21, 4, 3);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px - 4, by - 18, 2, 4);
    this.ctx.fillRect(px + 2, by - 18, 2, 4);

    // 5. Fore Paws
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(px - 22, by + 10, 14, 16);
    this.ctx.fillRect(px + 8, by + 10, 14, 16);
    this.ctx.fillStyle = '#0284c7';
    this.ctx.fillRect(px - 20, by + 22, 10, 3);
    this.ctx.fillRect(px + 10, by + 22, 10, 3);

    this.ctx.restore();

    const isRaidActive = !!(window.BOSS_CONFIG && window.BOSS_CONFIG.active);
    const bName = isRaidActive ? (window.BOSS_CONFIG.name || boss.name) : (boss.name || '🐯 숭실 백호 성수');
    const bMaxHp = isRaidActive ? (window.BOSS_CONFIG.maxHp || 12000) : (boss.maxHp || 12000);
    const bCurHp = isRaidActive ? (window.BOSS_CONFIG.currentHp ?? bMaxHp) : bMaxHp;
    const labelText = isRaidActive
      ? `✨ ${bName} (HP ${bCurHp}/${bMaxHp})`
      : `⏳ [성스러운 대기] ${bName} (HP ${bMaxHp})`;

    this.drawSharpLabel(px, py - 90, labelText, {
      bgColor: isRaidActive ? 'rgba(2, 44, 84, 0.96)' : 'rgba(30, 41, 59, 0.94)',
      borderColor: isRaidActive ? '#38bdf8' : '#fbbf24',
      textColor: isRaidActive ? '#ffffff' : '#fef08a',
      fontSize: 13,
      paddingX: 12,
      height: 24
    });
  }


  // 12. High-Res Ginkgo Tree in Ornate Ceramic Planter
  drawHighResGinkgoPot(obj) {
    const px = obj.x * 32 + 16;
    const py = obj.y * 32 + 16;

    // Floor Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 22, 18, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Terracotta Planter Pot
    this.ctx.fillStyle = '#7c2d12';
    this.ctx.fillRect(px - 14, py + 6, 28, 16);
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px - 12, py + 8, 24, 12);
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(px - 16, py + 4, 32, 4); // rim

    // Tree Trunk
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(px - 3, py - 8, 6, 14);

    // Layered Golden Ginkgo Foliage Clusters
    const clusters = [
      { x: px, y: py - 18, r: 16, c: '#ca8a04' },
      { x: px - 10, y: py - 14, r: 13, c: '#eab308' },
      { x: px + 10, y: py - 14, r: 13, c: '#eab308' },
      { x: px - 5, y: py - 24, r: 12, c: '#facc15' },
      { x: px + 5, y: py - 24, r: 12, c: '#facc15' },
      { x: px, y: py - 22, r: 9, c: '#fef08a' }
    ];

    clusters.forEach(c => {
      this.ctx.fillStyle = c.c;
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Swirling Golden Leaf Sparkles
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px - 16, py - 8, 3, 3);
    this.ctx.fillRect(px + 18, py - 12, 3, 3);
    this.ctx.fillRect(px + 12, py + 2, 2, 2);

    // Label
    this.drawSharpLabel(px, py + 36, '🍂 교목 은행나무', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#eab308',
      textColor: '#fef08a',
      fontSize: 12,
      paddingX: 10,
      height: 21
    });
  }

  // 12-B. High-Res Forsythia (교화 개나리 - 꽃말: 성실) in Ceramic Planter
  drawHighResForsythiaPot(obj) {
    const px = obj.x * 32 + 16;
    const py = obj.y * 32 + 16;

    // Floor Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 22, 18, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // White & Blue Ceramic Planter Pot
    this.ctx.fillStyle = '#1e3a8a';
    this.ctx.fillRect(px - 14, py + 6, 28, 16);
    this.ctx.fillStyle = '#eff6ff';
    this.ctx.fillRect(px - 12, py + 8, 24, 12);
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.fillRect(px - 16, py + 4, 32, 4); // rim

    // Arching Green-Brown Forsythia Stems
    this.ctx.strokeStyle = '#3f6212';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(px, py + 4);
    this.ctx.quadraticCurveTo(px - 16, py - 14, px - 22, py - 4);
    this.ctx.moveTo(px, py + 4);
    this.ctx.quadraticCurveTo(px + 16, py - 14, px + 22, py - 4);
    this.ctx.moveTo(px, py + 4);
    this.ctx.quadraticCurveTo(px - 6, py - 24, px - 12, py - 20);
    this.ctx.moveTo(px, py + 4);
    this.ctx.quadraticCurveTo(px + 6, py - 24, px + 12, py - 20);
    this.ctx.stroke();

    // Lush Green Spring Leaves Base
    const leafSpots = [
      { x: px - 6, y: py - 6, r: 7 },
      { x: px + 6, y: py - 6, r: 7 },
      { x: px, y: py - 12, r: 8 }
    ];
    leafSpots.forEach(ls => {
      this.ctx.fillStyle = '#15803d';
      this.ctx.beginPath();
      this.ctx.arc(ls.x, ls.y, ls.r, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Bright Golden-Yellow 4-Petal Forsythia Blossoms (개나리 꽃송이)
    const blossoms = [
      { x: px - 18, y: py - 6 }, { x: px - 12, y: py - 11 }, { x: px - 8, y: py - 18 },
      { x: px - 3, y: py - 14 }, { x: px, y: py - 21 }, { x: px + 4, y: py - 15 },
      { x: px + 9, y: py - 18 }, { x: px + 13, y: py - 11 }, { x: px + 18, y: py - 6 },
      { x: px - 7, y: py - 5 }, { x: px + 7, y: py - 5 }, { x: px, y: py - 8 }
    ];
    blossoms.forEach(b => {
      this.ctx.fillStyle = '#facc15';
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#fef08a';
      this.ctx.fillRect(b.x - 1.5, b.y - 1.5, 3, 3);
      this.ctx.fillStyle = '#ca8a04';
      this.ctx.fillRect(b.x - 0.5, b.y - 0.5, 1.5, 1.5);
    });

    // Label
    this.drawSharpLabel(px, py + 36, '🌼 개나리', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#facc15',
      textColor: '#fef08a',
      fontSize: 12,
      paddingX: 10,
      height: 21
    });
  }

  // 13. High-Res Staircase with Anti-Slip Edge & Rails
  drawHighResStairs(st, isUp = false) {
    const px = st.x * 32;
    const py = st.y * 32;

    // Stair Steps (4 Treads)
    for (let s = 0; s < 4; s++) {
      const sy = py + s * 8;
      this.ctx.fillStyle = '#475569';
      this.ctx.fillRect(px, sy, 32, 6);
      // High-visibility yellow safety edge
      this.ctx.fillStyle = '#eab308';
      this.ctx.fillRect(px, sy, 32, 2);
      // Step riser shadow
      this.ctx.fillStyle = '#1e293b';
      this.ctx.fillRect(px, sy + 6, 32, 2);
    }

    // Stainless Steel Handrail on side
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.fillRect(px + 1, py, 2, 32);
    this.ctx.fillRect(px + 29, py, 2, 32);

    this.drawSharpLabel(px + 16, py + 16, isUp ? '▲ 올라감' : '▼ 내려감', {
      bgColor: isUp ? '#1d4ed8' : '#b91c1c',
      borderColor: '#fef08a',
      textColor: '#ffffff',
      fontSize: 11.5,
      paddingX: 8,
      height: 20
    });
  }

  isStudentClearedGolem() {
    const app = window.MainApp || window.app;
    if (app && app.playerData) {
      if (app.playerData.isTeacher) return true;
      if (app.playerData.hasClearedFirstBoss) return true;
      const sId = app.playerData.studentId || '';
      if (sId && typeof localStorage !== 'undefined' && localStorage.getItem('soongsil_first_boss_cleared_' + sId) === 'true') {
        app.playerData.hasClearedFirstBoss = true;
        return true;
      }
    }
    return false;
  }

  isElevatorPassEquipped() {
    const app = window.MainApp || window.app;
    if (!app || !app.playerData) return false;
    if (app.playerData.isTeacher) return true;
    if (typeof app.isElevatorPassEquipped === 'function') {
      return app.isElevatorPassEquipped();
    }
    if (app.playerData.equipment) {
      return Object.values(app.playerData.equipment).some(eq => eq && eq.item === 'equip_elevator_pass');
    }
    return false;
  }

  getElevatorStatus() {
    const app = window.MainApp || window.app;
    const isTeacher = app && app.playerData && app.playerData.isTeacher;
    if (isTeacher) {
      return {
        state: 'ready',
        name: '중앙 엘리베이터 (가동 중)',
        prompt: '운동장으로 이동 (교사 무료)',
        ledText: '[ 7F 가동 ]',
        ledColor: '#38bdf8'
      };
    }

    const hasCleared = this.isStudentClearedGolem();
    if (!hasCleared) {
      return {
        state: 'maintenance',
        name: '중앙 엘리베이터 (점검 중)',
        prompt: '점검 중',
        ledText: '[ 7F 점검 ]',
        ledColor: '#ef4444'
      };
    }

    // 골렘 토벌 완료 상태: 작동권 장착 여부 확인
    const isEquipped = this.isElevatorPassEquipped();
    if (isEquipped) {
      return {
        state: 'ready',
        name: '중앙 엘리베이터 (가동 중)',
        prompt: '운동장으로 이동 (10G)',
        ledText: '[ 7F 가동 ]',
        ledColor: '#10b981'
      };
    } else {
      return {
        state: 'need_pass',
        name: '중앙 엘리베이터 (작동권 필요)',
        prompt: '작동권 장착 필요',
        ledText: '[ 키 필요 ]',
        ledColor: '#f59e0b'
      };
    }
  }

  isElevatorUnderMaintenance() {
    return this.getElevatorStatus().state === 'maintenance';
  }

  // 14. High-Res Stainless Steel Elevator with Floor LED Indicator
  drawHighResElevator(el, currentFloor = 7) {
    const px = el.x * 32 - 4;
    const py = el.y * 32 - 12;
    const w = 40;
    const h = 44;

    const isHallway = (currentFloor === 7);
    const status = (currentFloor === 6) ? {
      state: 'ready',
      ledText: '[ 6F ]',
      ledColor: '#c084fc',
      name: '중앙 엘리베이터 (6층)',
      prompt: '엘리베이터 층 선택 (SPACE)'
    } : (currentFloor === 5) ? {
      state: 'ready',
      ledText: '[ 5F ]',
      ledColor: '#38bdf8',
      name: '중앙 엘리베이터 (5층)',
      prompt: '엘리베이터 층 선택 (SPACE)'
    } : (currentFloor === 3) ? {
      state: 'ready',
      ledText: '[ 3F ]',
      ledColor: '#34d399',
      name: '중앙 엘리베이터 (3층)',
      prompt: '엘리베이터 층 선택 (SPACE)'
    } : (isHallway ? this.getElevatorStatus() : {
      state: 'ready',
      ledText: '[ 1F ▲ ]',
      ledColor: '#10b981',
      name: '중앙 엘리베이터',
      prompt: '엘리베이터 층 선택 (SPACE)'
    });

    // Floor shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(px, py + h, w, 4);

    // Outer Stainless Steel Frame (If ready, nice subtle blue-steel tint)
    this.ctx.fillStyle = status.state === 'ready' ? '#334155' : (status.state === 'need_pass' ? '#3e3a2f' : '#475569');
    this.ctx.fillRect(px, py, w, h);
    this.ctx.fillStyle = status.state === 'ready' ? '#94a3b8' : (status.state === 'need_pass' ? '#a39e82' : '#94a3b8');
    this.ctx.fillRect(px + 2, py + 2, w - 4, h - 2);

    // Digital Floor Indicator Panel (Black glass with LED)
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(px + 8, py + 4, w - 16, 10);
    this.ctx.fillStyle = status.ledColor;
    this.ctx.font = 'bold 9px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(status.ledText, px + w / 2, py + 12);

    // Double Sliding Doors (Brushed Stainless Steel)
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.fillRect(px + 4, py + 16, (w - 8) / 2 - 1, h - 18);
    this.ctx.fillRect(px + w / 2 + 1, py + 16, (w - 8) / 2 - 1, h - 18);

    // Center Vertical Seam Line
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(px + w / 2 - 0.5, py + 16, 1, h - 18);

    // Vertical Door Texture Grooves
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.fillRect(px + 7, py + 18, 2, h - 22);
    this.ctx.fillRect(px + w - 9, py + 18, 2, h - 22);

    // Call Button Plate on Right
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px + w + 2, py + 18, 7, 16);
    // Upper Indicator Lamp (Red if maintenance, Amber if need_pass, Green/Cyan if ready)
    this.ctx.fillStyle = status.state === 'maintenance' ? '#ef4444' : (status.state === 'need_pass' ? '#f59e0b' : '#10b981');
    this.ctx.fillRect(px + w + 3, py + 20, 5, 4);
    // Lower Call Button
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px + w + 3, py + 26, 5, 6);

    // Ready Aura Light (가동 중일 때 문 위 은은한 에메랄드/청록 네온 바)
    if (status.state === 'ready') {
      this.ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
      this.ctx.fillRect(px + 6, py + 14, w - 12, 2);
    } else if (status.state === 'need_pass') {
      this.ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';
      this.ctx.fillRect(px + 6, py + 14, w - 12, 2);
    }

    // Label placed at TOP (py - 12)
    if (status.state === 'maintenance') {
      this.drawSharpLabel(px + w / 2, py - 12, '🛗 엘리베이터 (점검 중)', {
        bgColor: 'rgba(15, 23, 42, 0.94)',
        borderColor: '#ef4444',
        textColor: '#fca5a5',
        fontSize: 11.5,
        paddingX: 9,
        height: 20
      });
    } else if (status.state === 'need_pass') {
      this.drawSharpLabel(px + w / 2, py - 12, '🛗 중앙 엘리베이터 (작동권 필요)', {
        bgColor: 'rgba(15, 23, 42, 0.94)',
        borderColor: '#f59e0b',
        textColor: '#fef08a',
        fontSize: 11.5,
        paddingX: 9,
        height: 20
      });
    } else {
      this.drawSharpLabel(px + w / 2, py - 12, isHallway ? '🛗 중앙 엘리베이터 (가동 중)' : '🛗 중앙 엘리베이터', {
        bgColor: 'rgba(15, 23, 42, 0.94)',
        borderColor: '#10b981',
        textColor: '#ffffff',
        fontSize: 11.5,
        paddingX: 9,
        height: 20
      });
    }
  }

  // ========================================================
  // SCENE RENDERING: HALLWAY (복도)
  // ========================================================
  renderHallway() {
    if (this.player.floor === 2) {
      this.renderLibraryFloor2();
      return;
    }
    const fData = WORLD_DATA.floors[this.player.floor];
    const mapW = this.getMapWidth();
    const mapH = this.getMapHeight();

    // 1. Base Flooring & Walls (2배 확장된 60타일 복도)
    for (let tx = 0; tx < mapW; tx++) {
      for (let ty = 0; ty < mapH; ty++) {
        if (ty <= 3 || tx === 0 || tx === mapW - 1 || ty === mapH - 1) {
          this.drawHighResWall(tx, ty, false);
        } else {
          this.drawHighResHallwayTile(tx, ty);
        }
      }
    }

    // 2. Sunny Windows along Top Wall (between classroom doors & across expanded corridor)
    const windowCols = [3, 4, 6, 12, 14, 16, 24, 27, 33, 36, 42, 45, 50, 52];
    windowCols.forEach(col => {
      // Don't draw window if there is a classroom door or elevator at this position
      const hasDoor = fData && fData.rooms && fData.rooms.some(r => Math.abs(r.doorX - col) <= 2);
      const hasElevator = fData && fData.elevator && Math.abs(fData.elevator.x - col) <= 2;
      if (!hasDoor && !hasElevator && col > 0 && col < mapW - 1) {
        this.drawHighResWindow(col, 1);
      }
    });

    // 3. Classroom Sliding Doors with Room Plaques & Hallway School Motto Frame
    if (fData && fData.rooms) {
      for (const r of fData.rooms) {
        this.drawHighResDoor(r);
      }
    }

    // Official School Motto Banner mounted in Center Hallway
    if (this.player.floor !== 3) {
      this.drawSharpLabel(15 * 32 + 16, 26, '🏫 교훈: 참과 사랑에 사는 사명인', {
        bgColor: '#1e1b4b',
        borderColor: '#f59e0b',
        textColor: '#fef08a',
        fontSize: 12.5,
        paddingX: 14,
        height: 22
      });
    }

    // 4. Staircases & Elevator
    if (fData && fData.stairsDown) {
      this.drawHighResStairs(fData.stairsDown, false);
    }
    if (fData && fData.stairsUp) {
      this.drawHighResStairs(fData.stairsUp, true);
    }
    if (fData && fData.elevator) {
      this.drawHighResElevator(fData.elevator, this.player.floor);
    }

    // 5. Interactive Props (게시판, 제작대, 은행목)
    if (fData && fData.interactive) {
      for (const obj of fData.interactive) {
        if (obj.type === 'board') {
          const bx = obj.x * 32 - 12;
          const by = obj.y * 32 - 14;
          // Notice Board with Green Felt & Brass Frame
          this.ctx.fillStyle = '#b45309';
          this.ctx.fillRect(bx - 3, by - 3, 58, 34);
          this.ctx.fillStyle = '#065f46';
          this.ctx.fillRect(bx, by, 52, 28);
          // Pinned Paper Memos
          this.ctx.fillStyle = '#fef08a';
          this.ctx.fillRect(bx + 4, by + 4, 18, 18);
          this.ctx.fillStyle = '#ef4444';
          this.ctx.fillRect(bx + 11, by + 5, 3, 3); // red pin
          this.ctx.fillStyle = '#e0f2fe';
          this.ctx.fillRect(bx + 26, by + 4, 20, 18);
          this.ctx.fillStyle = '#3b82f6';
          this.ctx.fillRect(bx + 34, by + 5, 3, 3); // blue pin

          this.drawSharpLabel(bx + 26, by + 42, '📝 퀴즈 게시판', {
            bgColor: 'rgba(15, 23, 42, 0.94)',
            borderColor: '#34d399',
            textColor: '#ffffff',
            fontSize: 12,
            paddingX: 10,
            height: 21
          });
        } else if (obj.type === 'leaderboard') {
          this.drawHighResLeaderboard(obj);
        } else if (obj.type === 'craft') {
          this.drawHighResCraftTable(obj);
        } else if (obj.type === 'ginkgo') {
          this.drawHighResGinkgoPot(obj);
        } else if (obj.type === 'forsythia') {
          this.drawHighResForsythiaPot(obj);
        } else if (obj.type === 'water_purifier') {
          this.drawHighResWaterPurifier(obj.x * 32, obj.y * 32);
        } else if (obj.type === 'mirror') {
          this.drawHighResMirror(obj.x * 32, obj.y * 32);
        } else if (obj.type === 'club_board') {
          this.drawHighResClubBoard(obj.x * 32, obj.y * 32);
        } else if (obj.type === 'plant_zone') {
          this.drawHighResHallwayPlant(obj.x * 32, obj.y * 32, obj.subType || 'monstera', this.getPlantStage(), this.plantWaterCount);
        } else if (obj.type === 'dev_note' || obj.type === 'dev_note_2') {
          this.drawHighResDevNote(obj.x * 32, obj.y * 32, obj.name || (obj.type === 'dev_note_2' ? '📜 떨어진 개발자노트 (제2편)' : '📜 떨어진 개발자노트 (제1편)'));
        } else if (obj.type === 'dibut_repair_box' || obj.type === 'diba_repair_box') {
          this.drawHighResDibutCabinet(obj.x * 32, obj.y * 32);
        } else if (obj.type === 'recycle_bin') {
          this.drawHighResRecycleBin(obj.x * 32, obj.y * 32);
        }
      }
    }
  }

  // ========================================================
  // SCENE RENDERING: CLASSROOM (1반 노가다 채집장 / 2반 보스 레이드장)
  // ========================================================
  renderClassroom() {
    const cr = this.getCurrentClassroomData();
    const isBossRoom = (this.player.room === 'room_702');

    // 1. Polished Wood Plank Flooring & Interior Walls
    const curW = this.getMapWidth();
    const curH = this.getMapHeight();
    for (let tx = 0; tx < curW; tx++) {
      for (let ty = 0; ty < curH; ty++) {
        if (ty <= 2 || tx === 0 || tx === curW - 1 || ty >= curH - 2) {
          this.drawHighResWall(tx, ty, true);
        } else if (this.player.room === 'room_health') {
          this.drawHealthRoomFloorTile(tx, ty);
        } else if (this.player.room === 'room_wee') {
          this.drawWeeRoomFloorTile(tx, ty);
        } else if (this.player.room === 'room_staff_office') {
          this.drawStaffOfficeFloorTile(tx, ty);
        } else if (this.player.room === 'room_history') {
          this.drawHighResMarbleFloor(tx, ty);
        } else if (this.player.room === 'room_705') {
          this.drawHighResAlchemyFloor(tx, ty);
        } else if (this.player.room === 'room_cafeteria') {
          this.drawCafeteriaFloorTile(tx, ty);
        } else {
          this.drawHighResWoodPlankFloor(tx, ty);
        }
      }
    }

    // 2. High-Res Classroom Blackboard & School Motto
    const isCareerRoom = (this.player.room === 'room_career');
    const isStaffOffice = (this.player.room === 'room_staff_office');
    const isSecretHistory = (this.player.room === 'room_secret_history');
    const isHealthRoom = (this.player.room === 'room_health');
    const isWeeRoom = (this.player.room === 'room_wee');
    const isCafeteria = (this.player.room === 'room_cafeteria');
    const centerTileX = isStaffOffice ? 45 : (isCareerRoom ? 30 : ((isHealthRoom || isWeeRoom) ? 10 : 15));
    if (!isStaffOffice && !isSecretHistory && !isCafeteria) {
      this.drawHighResBlackboard(cr, centerTileX);
      this.drawHighResWallClock(centerTileX * 32, 16);
    }

    // 4. Back Wall Student Lockers (Row of Lockers along Back Wall)
    if (isStaffOffice) {
      // 교무실: 학생용 사물함 대신 파티션 및 회의실 전용 인테리어 적용
    } else if (isCareerRoom) {
      this.drawHighResLockers(4, 17, 6);
      this.drawHighResLockers(50, 17, 6);
    } else if (this.player.room === 'room_history' || this.player.room === 'room_705' || this.player.room === 'room_secret_history' || this.player.room === 'room_health' || this.player.room === 'room_wee' || this.player.room === 'room_cafeteria') {
      // Museum, Alchemy Lab, Health Room, Wee Class, and Cafeteria have custom atmospheric layouts without standard school lockers
    } else {
      this.drawHighResLockers(3, 17, 5);
      this.drawHighResLockers(22, 17, 5);
    }

    if (isBossRoom) {
      // === 1학년 2반: 가죽 골렘 1:1 솔로 상시 레이드 전용 구역 ===
      // Red Raid Carpet Runner from Door to Boss
      this.ctx.fillStyle = 'rgba(153, 27, 27, 0.45)';
      this.ctx.fillRect(13 * 32, 6 * 32, 4 * 32, 11 * 32);
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(13 * 32, 6 * 32, 4 * 32, 11 * 32);

      if (cr.boss) {
        // 1학년 2반은 외부 레이드와 완전히 분리된 1:1 가죽 골렘 상시 토벌 고정
        const effectiveBoss = {
          ...cr.boss,
          id: 'boss_leather_golem',
          name: '🪵 가죽 골렘',
          maxHp: 2000,
          currentHp: 2000,
          atk: 30,
          def: 14
        };
        this.drawHighResBossGolem(effectiveBoss);
      }
      // 1학년 2반 상호작용 오브젝트 (요션유의 알고리즘 USB 등)
      if (cr.interactive) {
        for (const obj of cr.interactive) {
          if (obj.type === 'quest_yosunyu_usb') {
            this.drawStaffOfficeUsb(obj.x * 32, obj.y * 32);
          }
        }
      }
    } else if (this.player.room === 'room_703') {
      // === 1학년 3반: 영어 타자 컴퓨터실 (산성비 단어 방어 기지) ===
      this.renderAcidRainComputerLab(cr);
    } else if (this.player.room === 'room_704') {
      // === 1학년 4반: 드럼 치는 도덕쌤의 락스피릿 교실 ===
      this.renderDrumMoralClassroom(cr);
    } else if (this.player.room === 'room_705') {
      // === 1학년 5반: 졍경슉 선생님의 신비한 연금과학 연구실 ===
      this.renderAlchemyLabClassroom(cr);
    } else if (this.player.room === 'room_career') {
      // === 5층 대형 진로실: 진로 방탈출 6대 단서 & 직업 패시브 아카데미 ===
      this.renderCareerEscapeRoom(cr);
    } else if (this.player.room === 'room_history') {
      this.renderHistoryMuseum(cr);
    } else if (this.player.room === 'room_secret_history') {
      this.renderSecretHistoryRoom(cr);
    } else if (this.player.room === 'room_health') {
      this.renderHealthRoom(cr);
    } else if (this.player.room === 'room_wee') {
      this.renderWeeClassRoom(cr);
    } else if (this.player.room === 'room_staff_office') {
      this.renderStaffOffice(cr);
    } else if (this.player.room === 'room_cafeteria') {
      this.renderCafeteria(cr);
      this.renderCafeteriaMonsters();
    } else if (this.player.floor === 5) {
      // 5층 잠긴 교실들: 깨끗한 빈 공간 연출
    } else {
      // === 1학년 1반: 시즌1 기초 재료 노가다 채집장 연출 ===
      if (cr.teacherDesk) {
        this.drawHighResTeacherDesk(cr);
      }
      for (const d of (cr.desks || [])) {
        this.drawHighResStudentDesk(d);
      }
      if (cr.gatherSpots) {
        for (const spot of cr.gatherSpots) {
          if (spot.type === 'gather_wood') {
            this.drawHighResWoodPile(spot);
          } else if (spot.type === 'gather_herb') {
            this.drawHighResHerbPlanter(spot);
          } else if (spot.type === 'gather_forsythia') {
            this.drawHighResForsythiaPot(spot);
          } else if (spot.type === 'gather_ginkgo') {
            this.drawHighResGinkgoPot(spot);
          }
        }
      }
    }

    // 8-C. Classroom NPCs (e.g. 1학년 3반 오예슉 선생님, 1학년 5반 졍경슉 선생님)
    if (cr.npcs && cr.npcs.length > 0) {
      for (const npc of cr.npcs) {
        const px = npc.x * 32;
        const py = npc.y * 32;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(px + 16, py + 26, 12, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();

        const isKyungsook = (npc.id === 'npc_teacher_kyungsook' || (npc.name && (npc.name.includes('졍경슉') || npc.name.includes('정경숙'))));
        const isOyesook = (npc.id === 'npc_teacher_computer' || (npc.name && (npc.name.includes('오예슉') || npc.name.includes('오예숙'))));
        const isTeacherNpc = (npc.avatar === 'teacher' || npc.avatar === 'teacher_joshua' || npc.name.includes('선생님'));

        if (isKyungsook) {
          this.ctx.fillStyle = '#581c87';
          this.ctx.beginPath();
          this.ctx.arc(px + 16, py + 12, 10, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillRect(px + 8, py + 18, 16, 14);

          // 연금술사 졍경슉 선생님 전용 신비한 룬 장식 펜던트
          this.ctx.fillStyle = '#f59e0b';
          this.ctx.fillRect(px + 14, py + 22, 4, 4);
        } else if (isOyesook) {
          // 🧵 가정 오예슉 선생님 전용 코랄 로즈 & 에이프런 스프라이트
          this.ctx.fillStyle = '#be123c';
          this.ctx.beginPath();
          this.ctx.arc(px + 16, py + 12, 10, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillRect(px + 8, py + 18, 16, 14);

          // 화사한 아이보리 에이프런 & 로즈 단추
          this.ctx.fillStyle = '#fff1f2';
          this.ctx.fillRect(px + 11, py + 20, 10, 10);
          this.ctx.fillStyle = '#f43f5e';
          this.ctx.fillRect(px + 15, py + 23, 2, 2);
        } else {
          // 교사 NPC (조슈아, 옥촣한, 김진믜 등) - 단정한 딥블루 교사 스프라이트
          this.ctx.fillStyle = isTeacherNpc ? '#1e3a8a' : '#047857';
          this.ctx.beginPath();
          this.ctx.arc(px + 16, py + 12, 10, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillRect(px + 8, py + 18, 16, 14);
        }

        const labelText = `${isKyungsook ? '⚗️' : (isOyesook ? '👩‍🏫' : (isTeacherNpc ? '👨‍🏫' : (npc.icon || '💬')))} ${npc.name}`;
        this.drawSharpLabel(px + 16, py + 38, labelText, {
          bgColor: isKyungsook ? 'rgba(88, 28, 135, 0.95)' : (isOyesook ? 'rgba(159, 18, 57, 0.95)' : (isTeacherNpc ? 'rgba(30, 58, 138, 0.95)' : 'rgba(6, 78, 59, 0.95)')),
          borderColor: isKyungsook ? '#c084fc' : (isOyesook ? '#fb7185' : (isTeacherNpc ? '#60a5fa' : '#34d399')),
          textColor: '#fef08a',
          fontSize: 12,
          paddingX: 8,
          height: 20
        });

        // 8-C-1. 머리 위 플로팅 퀘스트 상태 마커 (! / ?)
        if (npc.questId) {
          const qStatus = (window.MainApp && typeof window.MainApp.getTeacherQuestStatus === 'function')
            ? window.MainApp.getTeacherQuestStatus(npc.questId || npc.id)
            : 'available';
          if (qStatus && qStatus !== 'done') {
            this.drawFloatingQuestMarker(px + 16, py - 18, qStatus);
          }
        }
      }
    }

    // 9. Classroom Exit Door & Plush Red Carpet
    if (!isStaffOffice) {
      const ex = cr.exitDoor.x * 32;
      const ey = cr.exitDoor.y * 32;

      // Double Sliding Door Archway
      this.ctx.fillStyle = '#451a03';
      this.ctx.fillRect(ex - 48, ey - 4, 128, 6);
      this.ctx.fillStyle = '#78350f';
      this.ctx.fillRect(ex - 48, ey - 4, 128, 2);

      // Plush Red Welcome Exit Carpet
      this.ctx.fillStyle = '#991b1b';
      this.ctx.fillRect(ex - 44, ey + 2, 120, 28);
      this.ctx.fillStyle = '#dc2626';
      this.ctx.fillRect(ex - 42, ey + 4, 116, 24);
      this.ctx.strokeStyle = '#fef08a';
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(ex - 42, ey + 4, 116, 24);

      let exitText = '🚪 ▼ 복도로 나가기 (EXIT)';
      if (this.player.room === 'room_cafeteria' || this.player.room === 'room_history') {
        exitText = '🚪 ▼ 운동장으로 나가기 (EXIT)';
      } else if (this.player.room === 'room_secret_history') {
        exitText = '🚪 ▼ 숭실역사관 (EXIT)';
      }
      this.drawSharpLabel(ex + 16, ey + 16, exitText, {
        bgColor: '#7f1d1d',
        borderColor: '#fef08a',
        textColor: '#ffffff',
        fontSize: 12.5,
        paddingX: 12,
        height: 22
      });
    }
  }

  // ========================================================
  // SCENE RENDERING: PLAYGROUND (숭실 야외 운동장: 축구장 2/3, 농구장 1/3)
  // - 복도(60타일)의 2배 규모인 90 x 28 타일 광활한 야외 운동장
  // - 좌측 상단: 중앙 엘리베이터(복도 이동) & 급식실 입구
  // - 좌측/중앙 2/3: 우레탄 트랙, 천연 잔디 축구장, 3D 골대, 코너 플래그
  // - 우측 1/3: 올림픽 블루 우레탄 농구 코트, 아크릴 백보드 골대
  // ========================================================
  renderPlayground() {
    const mapW = this.getMapWidth();
    const mapH = this.getMapHeight();

    // 1. Sandy Clay Ground Foundation (운동장 마사토 흙바닥 베이스)
    this.ctx.fillStyle = '#dfd5c5';
    this.ctx.fillRect(0, 0, mapW * 32, mapH * 32);

    // Fine Playground Gravel Dots (흙바닥 질감)
    this.ctx.fillStyle = 'rgba(120, 113, 108, 0.2)';
    for (let gx = 0; gx < mapW; gx += 3) {
      for (let gy = 0; gy < mapH; gy += 3) {
        this.ctx.fillRect(gx * 32 + 10, gy * 32 + 8, 2, 2);
        this.ctx.fillRect(gx * 32 + 22, gy * 32 + 20, 1.5, 1.5);
      }
    }

    // 2. School South Building Annex Wall (Top Border: ty <= 2)
    for (let tx = 0; tx < mapW; tx++) {
      // Red Brick Facade
      this.ctx.fillStyle = '#991b1b';
      this.ctx.fillRect(tx * 32, 0, 32, 2 * 32);
      this.ctx.fillStyle = '#7f1d1d';
      this.ctx.fillRect(tx * 32, 0, 32, 4); // brick trim
      // Mortar Lines
      this.ctx.fillStyle = '#78350f';
      this.ctx.fillRect(tx * 32, 16, 32, 1);
      this.ctx.fillRect(tx * 32, 32, 32, 1);
      this.ctx.fillRect(tx * 32, 48, 32, 1);
      // Concrete Foundation Base
      this.ctx.fillStyle = '#475569';
      this.ctx.fillRect(tx * 32, 2 * 32, 32, 14);
      this.ctx.fillStyle = '#64748b';
      this.ctx.fillRect(tx * 32, 2 * 32, 32, 3);
    }

    // 3. Central Elevator (Ground Station at right end: x: 80, y: 3)
    const pgEl = (WORLD_DATA.playground && WORLD_DATA.playground.elevator) || { x: 80, y: 3 };
    this.drawHighResElevator(pgEl, 0);

    // 4. Cafeteria Entrance (Right next to elevator: x: 86, y: 3)
    const pgCaf = (WORLD_DATA.playground && WORLD_DATA.playground.cafeteria) || { x: 86, y: 3 };
    this.drawHighResCafeteriaEntrance(pgCaf.x * 32, pgCaf.y * 32);

    // 4-B. 숭실역사관 입구 (풋살장 우측 하단: x: 87, y: 52)
    this.drawHighResHistoryEntrance(87 * 32, 52 * 32);

    // 4-C. 서쪽 숭실 체육관 & 주차장 진입 게이트 (트랙 서쪽 하단 x: 2, y: 48)
    this.drawHighResGymGate(2 * 32, 48 * 32);

    // 4-B. Store NPC (매점 - 엘리베이터 좌측 넓은 공터: x: 72, y: 4)
    const pgStore = (WORLD_DATA.playground && WORLD_DATA.playground.store) || { x: 72, y: 4 };
    this.drawHighResStoreNPC(pgStore.x * 32, pgStore.y * 32);

    // ========================================================
    // 5. TOP: OUTDOOR SPECTATOR BLEACHERS (야외 스탠드 관람석)
    // 위치: x: 6 ~ 54, y: 5 ~ 15 (관람석과 축구장 위치 맞바꿈 / 야외 체력단련장 삭제)
    // ========================================================
    this.drawHighResBleachers(6 * 32, 5 * 32, 48 * 32, 11 * 32);

    // 5-B. Title Exchange (호칭 교환소 - 관람석 스탠드 중앙: x: 30, y: 15)
    const pgTitle = (WORLD_DATA.playground && WORLD_DATA.playground.titleExchange) || { x: 30, y: 15 };
    this.drawHighResTitleExchange(pgTitle.x * 32, pgTitle.y * 32);

    // 5-C. Secret Lost & Found Box (스탠드 서쪽 구석 비밀 분실물 상자: x: 4, y: 6)
    const pgLostBox = (WORLD_DATA.playground && WORLD_DATA.playground.lostBox) || { x: 4, y: 6 };
    this.drawHighResLostBox(pgLostBox.x * 32, pgLostBox.y * 32);

    // ========================================================
    // 6. BOTTOM: SOCCER FIELD (축구장 & 우레탄 트랙)
    // 위치: x: 4 ~ 58, y: 19 ~ 51 (서쪽 골대 앞 신규 보스 레이드 전장)
    // ========================================================
    const trackX = 4 * 32;
    const trackY = 19 * 32;
    const trackW = 54 * 32;
    const trackH = 32 * 32;

    // Tartan Red Running Track
    this.ctx.fillStyle = '#991b1b';
    this.ctx.beginPath();
    this.ctx.roundRect(trackX, trackY, trackW, trackH, 48);
    this.ctx.fill();

    // White Running Lane Lines (3 lanes)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    this.ctx.lineWidth = 2;
    for (let lane = 0; lane < 3; lane++) {
      const inset = lane * 18 + 6;
      this.ctx.beginPath();
      this.ctx.roundRect(trackX + inset, trackY + inset, trackW - inset * 2, trackH - inset * 2, 42 - lane * 6);
      this.ctx.stroke();
    }

    // Lush Natural Grass Pitch (잔디 축구장: x: 7 ~ 55, y: 22 ~ 48)
    const pitchX = 7 * 32;
    const pitchY = 22 * 32;
    const pitchW = 48 * 32;
    const pitchH = 26 * 32;

    // Grass Turf Mowing Stripes (4-tile stripes)
    for (let sx = 0; sx < 48; sx += 4) {
      this.ctx.fillStyle = (sx / 4) % 2 === 0 ? '#15803d' : '#16a34a';
      this.ctx.fillRect(pitchX + sx * 32, pitchY, 4 * 32, pitchH);
    }

    // Soccer Field Markings (Crisp Pure White Lines)
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2.5;

    // Touchlines (Outer border)
    this.ctx.strokeRect(pitchX, pitchY, pitchW, pitchH);

    // Halfway Line
    const midX = pitchX + pitchW / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(midX, pitchY);
    this.ctx.lineTo(midX, pitchY + pitchH);
    this.ctx.stroke();

    // Center Circle (Radius: 100px) & Center Spot (중앙선 y = 35 * 32)
    const midY = pitchY + pitchH / 2;
    this.ctx.beginPath();
    this.ctx.arc(midX, midY, 100, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(midX, midY, 5, 0, Math.PI * 2);
    this.ctx.fill();

    // Left Penalty Box (West 18-yard box)
    const penW = 8 * 32;
    const penH = 12 * 32;
    const penY = midY - penH / 2;
    this.ctx.strokeRect(pitchX, penY, penW, penH);

    // Left Goal Area (West 6-yard box)
    const gAreaW = 3.5 * 32;
    const gAreaH = 6 * 32;
    const gAreaY = midY - gAreaH / 2;
    this.ctx.strokeRect(pitchX, gAreaY, gAreaW, gAreaH);

    // Left Penalty Spot & Arc
    const lSpotX = pitchX + 5.5 * 32;
    this.ctx.beginPath();
    this.ctx.arc(lSpotX, midY, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(lSpotX, midY, 50, -0.9, 0.9);
    this.ctx.stroke();

    // West Corner Arcs & Checkered Corner Flags
    const cornerR = 14;
    this.ctx.beginPath(); this.ctx.arc(pitchX, pitchY, cornerR, 0, Math.PI / 2); this.ctx.stroke();
    this.ctx.beginPath(); this.ctx.arc(pitchX, pitchY + pitchH, cornerR, -Math.PI / 2, 0); this.ctx.stroke();

    this.drawCornerFlag(pitchX - 2, pitchY - 2);
    this.drawCornerFlag(pitchX - 2, pitchY + pitchH + 2);

    // High-Res Goalpost (West)
    this.drawHighResGoalPost(pitchX, midY - 60, true);

    // Soccer Field West Label
    this.drawSharpLabel(pitchX + penW, midY + 54, '⚽ 숭실 천연잔디 축구장 (서쪽)', {
      bgColor: 'rgba(21, 128, 61, 0.94)',
      borderColor: '#86efac',
      textColor: '#ffffff',
      fontSize: 12.5,
      paddingX: 12,
      height: 24
    });

    // ========================================================
    // 6-B. RIGHT HALF-COURT: 3v3 BRAWL BALL ARENA (남북방향 x: 31~55, y: 22~48)
    // ========================================================
    if (window.BrawlBall) {
      window.BrawlBall.renderCourt(this.ctx);
      window.BrawlBall.renderEntities(this.ctx);
    }

    // ========================================================
    // 7. NEW BOSS RAID ARENA: 축구장 청동 드래곤 레이드 전장 (x: 18, y: 35)
    // ========================================================
    const pg = WORLD_DATA.playground;
    const isSoccerRaid = !!(window.BOSS_CONFIG && window.BOSS_CONFIG.active &&
      (window.BOSS_CONFIG.name.includes('대마왕') || window.BOSS_CONFIG.name.includes('케르베로스') ||
       window.BOSS_CONFIG.name.includes('파멸신') || window.BOSS_CONFIG.name.includes('나태') ||
       window.BOSS_CONFIG.name.includes('드래곤') || window.BOSS_CONFIG.name.includes('dragon')));
    const soccerBossObj = (window.BOSS_CONFIG && window.BOSS_CONFIG.active && !window.BOSS_CONFIG.name.includes('골렘')) ? {
      id: 'boss_soccer_raid',
      type: 'boss_raid',
      x: 18,
      y: 35,
      name: window.BOSS_CONFIG.name,
      prompt: '청동 드래곤 레이드 (SPACE)'
    } : (pg && pg.boss);
    if (soccerBossObj) {
      const bx = (soccerBossObj.x || 18) * 32 + 16;
      const by = (soccerBossObj.y || 35) * 32 + 16;
      this.drawSoccerBossArena(bx, by, soccerBossObj);
    }

    // ========================================================
    // 8. RIGHT TOP: BASKETBALL COURT (우레탄 농구장: x: 61 ~ 87, y: 6 ~ 26)
    // ========================================================
    const bCourtX = 61 * 32;
    const bCourtY = 6 * 32;
    const bCourtW = 26 * 32;
    const bCourtH = 20 * 32;

    // Navy Border Buffer
    this.ctx.fillStyle = '#1e3a8a';
    this.ctx.fillRect(bCourtX - 10, bCourtY - 8, bCourtW + 20, bCourtH + 16);

    // Olympic Acrylic Blue Court Surface
    this.ctx.fillStyle = '#0284c7';
    this.ctx.fillRect(bCourtX, bCourtY, bCourtW, bCourtH);

    // Basketball Court Markings
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeRect(bCourtX, bCourtY, bCourtW, bCourtH);

    // Halfcourt Line & Jump Circle
    const bMidX = bCourtX + bCourtW / 2;
    const bMidY = bCourtY + bCourtH / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(bMidX, bCourtY);
    this.ctx.lineTo(bMidX, bCourtY + bCourtH);
    this.ctx.stroke();

    this.ctx.fillStyle = '#0369a1';
    this.ctx.beginPath();
    this.ctx.arc(bMidX, bMidY, 60, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Left Key & 3-pt
    const bKeyW = 6.5 * 32;
    const bKeyH = 6 * 32;
    const bKeyY = bMidY - bKeyH / 2;
    this.ctx.fillStyle = '#ea580c';
    this.ctx.fillRect(bCourtX, bKeyY, bKeyW, bKeyH);
    this.ctx.strokeRect(bCourtX, bKeyY, bKeyW, bKeyH);
    this.ctx.beginPath();
    this.ctx.arc(bCourtX + bKeyW, bMidY, bKeyH / 2, -Math.PI / 2, Math.PI / 2);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(bCourtX + 32, bMidY, 150, -1.0, 1.0);
    this.ctx.stroke();

    // Right Key & 3-pt
    this.ctx.fillStyle = '#ea580c';
    this.ctx.fillRect(bCourtX + bCourtW - bKeyW, bKeyY, bKeyW, bKeyH);
    this.ctx.strokeRect(bCourtX + bCourtW - bKeyW, bKeyY, bKeyW, bKeyH);
    this.ctx.beginPath();
    this.ctx.arc(bCourtX + bCourtW - bKeyW, bMidY, bKeyH / 2, Math.PI / 2, Math.PI * 1.5);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(bCourtX + bCourtW - 32, bMidY, 150, Math.PI - 1.0, Math.PI + 1.0);
    this.ctx.stroke();

    // Basketball Hoops
    this.drawHighResBasketballHoop(bCourtX + 28, bMidY, true);
    this.drawHighResBasketballHoop(bCourtX + bCourtW - 28, bMidY, false);

    // Basketball Court Center Label
    this.drawSharpLabel(bMidX, bMidY + 44, '🏀 숭실 야외 농구장', {
      bgColor: 'rgba(2, 132, 199, 0.94)',
      borderColor: '#7dd3fc',
      textColor: '#ffffff',
      fontSize: 13,
      paddingX: 12,
      height: 24
    });

    // ========================================================
    // 9. RIGHT BOTTOM: FUTSAL COURT (신규 인조잔디 풋살장: x: 61 ~ 87, y: 30 ~ 50)
    // ========================================================
    this.drawHighResFutsalCourt(61 * 32, 30 * 32, 26 * 32, 20 * 32);

    // ========================================================
    // 10. Sidelines, Benches, Water Fountain, and Perimeter Fences
    // ========================================================
    this.drawHighResBench(26 * 32, 16 * 32 + 6);
    this.drawHighResBench(34 * 32, 16 * 32 + 6);
    this.drawHighResBench(70 * 32, 5 * 32 + 6);
    this.drawHighResBench(76 * 32, 5 * 32 + 6);
    this.drawHighResBench(70 * 32, 28 * 32 + 6);
    this.drawHighResBench(76 * 32, 28 * 32 + 6);

    // 10-B. Kim Mi-jin Art Quest Sketchbook (운동장 벤치 왼쪽편: x: 24, y: 16)
    const pgSketchbook = (WORLD_DATA.playground && WORLD_DATA.playground.sketchbook) || { x: 20, y: 7 };
    this.drawStaffOfficeArtSketchbook(pgSketchbook.x * 32, pgSketchbook.y * 32);

    // 10-C. Library Missing Book (운동장 관람석 스탠드: x: 23, y: 7)
    if (WORLD_DATA.playground && WORLD_DATA.playground.libraryBook) {
      if (!window.MainApp || typeof window.MainApp.isQuestLibBookPgCollected !== 'function' || !window.MainApp.isQuestLibBookPgCollected()) {
        const pgBook = WORLD_DATA.playground.libraryBook;
        this.drawQuestLibraryBook(pgBook.x * 32, pgBook.y * 32, 'blue');
      }
    }

    // 10-D. 2004 Secret Time Capsule (스탠드 틈새: x: 27, y: 7)
    if (WORLD_DATA.playground && WORLD_DATA.playground.timeCapsule) {
      const tc = WORLD_DATA.playground.timeCapsule;
      this.drawHighResTimeCapsule(tc.x * 32 + 16, tc.y * 32 + 16);
    }

    // 10-E. 4 Bleacher Clue Notes (x: 10, 21, 33, 44, y: 9)
    for (let i = 1; i <= 4; i++) {
      const clue = WORLD_DATA.playground && WORLD_DATA.playground['capsuleClue' + i];
      if (clue) {
        this.drawHighResCapsuleNote(clue.x * 32 + 16, clue.y * 32 + 16, i, clue.name);
      }
    }

    // Drinking Fountain between fields (x: 59, y: 5)
    this.drawHighResDrinkingFountain(59 * 32 + 16, 5 * 32 + 10);

    // Perimeter Fence along Bottom Edge (ty === 53)
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 53 * 32 + 16);
    this.ctx.lineTo(mapW * 32, 53 * 32 + 16);
    this.ctx.stroke();

    for (let fx = 0; fx < mapW * 32; fx += 64) {
      this.ctx.fillStyle = '#64748b';
      this.ctx.fillRect(fx, 53 * 32, 4, 28);
    }

    // 11. Render Playground Field Monsters (Basketball & Futsal)
    this.renderBasketballMonsters();
    this.renderFutsalMonsters();
  }

  // Roaming & Respawn Logic for Basketball Monsters
  updateBasketballMonsters() {
    if (!this.player || this.player.room !== 'playground') return;
    const pg = WORLD_DATA.playground;
    if (!pg || !pg.basketballMonsters) return;

    const now = Date.now();
    for (const mob of pg.basketballMonsters) {
      if (mob.defeated) {
        if (mob.respawnAt && now >= mob.respawnAt) {
          mob.defeated = false;
          mob.hp = mob.maxHp;
          if (mob.fixed) {
            mob.x = 63;
            mob.y = 16;
          } else {
            mob.x = Math.round(65 + Math.random() * 19);
            mob.y = Math.round(8 + Math.random() * 16);
            mob.targetX = mob.x;
            mob.targetY = mob.y;
          }
        }
        continue;
      }

      // If mob is currently in active battle, do not roam
      if (mob.inBattle) continue;

      // Rim Guardian stands firmly by the left basket hoop
      if (mob.fixed) {
        mob.x = 63;
        mob.y = 16;
        continue;
      }

      // Roaming monsters wander inside the court (x: 65 ~ 84, y: 8 ~ 24)
      if (mob.roam) {
        if (mob.targetX === undefined || mob.targetY === undefined) {
          mob.targetX = mob.x;
          mob.targetY = mob.y;
          mob.nextMoveTime = now + 1000 + Math.random() * 2000;
        }

        const dx = mob.targetX - mob.x;
        const dy = mob.targetY - mob.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 0.1) {
          mob.x = mob.targetX;
          mob.y = mob.targetY;
          if (now >= (mob.nextMoveTime || 0)) {
            // Pick a new target within court
            mob.targetX = Math.round((65 + Math.random() * 19) * 10) / 10;
            mob.targetY = Math.round((8 + Math.random() * 16) * 10) / 10;
            mob.nextMoveTime = now + 2500 + Math.random() * 3500;
          }
        } else {
          // Smooth walking movement (~0.014 tiles/frame)
          const step = 0.014;
          mob.x += (dx / dist) * Math.min(dist, step);
          mob.y += (dy / dist) * Math.min(dist, step);
        }
      }
    }
  }

  // 8. Basketball Monsters Rendering
  renderBasketballMonsters() {
    const pg = WORLD_DATA.playground;
    if (!pg || !pg.basketballMonsters) return;

    const now = Date.now();
    for (const mob of pg.basketballMonsters) {
      if (mob.defeated) continue;

      // Floating / bouncing anim
      const floatY = Math.sin((now + mob.x * 200) / 200) * 3;
      const px = mob.x * 32;
      const py = mob.y * 32 + floatY;

      // Drop shadow on ground
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      this.ctx.beginPath();
      this.ctx.ellipse(px + 16, mob.y * 32 + 28, 14, 6, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Monster Sprite
      if (mob.avatar === 'dunk_goblin') {
        this.drawDunkGoblin(px, py, now);
      } else if (mob.avatar === 'flame_dribbler') {
        this.drawFlameDribbler(px, py, now);
      } else if (mob.avatar === 'rim_guardian') {
        this.drawRimGuardian(px, py, now);
      }

      // HP Bar above monster
      const hpW = 42;
      const hpH = 6;
      const hpX = px + 16 - hpW / 2;
      const hpY = py - 14;
      const hpPct = Math.max(0, Math.min(1, mob.hp / mob.maxHp));

      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      this.ctx.fillRect(hpX - 1, hpY - 1, hpW + 2, hpH + 2);
      this.ctx.fillStyle = '#dc2626';
      this.ctx.fillRect(hpX, hpY, hpW, hpH);
      this.ctx.fillStyle = hpPct > 0.5 ? '#16a34a' : (hpPct > 0.25 ? '#f59e0b' : '#ef4444');
      this.ctx.fillRect(hpX, hpY, hpW * hpPct, hpH);

      // Name & Icon Label below monster
      const isElite = (mob.type === 'elite');
      this.drawSharpLabel(px + 16, mob.y * 32 + 40, `${mob.icon} ${mob.name}`, {
        bgColor: isElite ? 'rgba(127, 29, 29, 0.95)' : 'rgba(30, 41, 59, 0.92)',
        borderColor: isElite ? '#f59e0b' : '#38bdf8',
        textColor: isElite ? '#fef08a' : '#ffffff',
        fontSize: isElite ? 11.5 : 10.5,
        paddingX: 8,
        height: 20
      });
    }
  }

  drawDunkGoblin(px, py, now) {
    this.ctx.save();
    // Head & Pointy Ears (Green)
    this.ctx.fillStyle = '#15803d';
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 10, 8, 0, Math.PI * 2);
    this.ctx.fill();
    // Ears
    this.ctx.beginPath();
    this.ctx.moveTo(px + 8, py + 10);
    this.ctx.lineTo(px + 3, py + 6);
    this.ctx.lineTo(px + 8, py + 14);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.moveTo(px + 24, py + 10);
    this.ctx.lineTo(px + 29, py + 6);
    this.ctx.lineTo(px + 24, py + 14);
    this.ctx.fill();

    // Headband (Blue)
    this.ctx.fillStyle = '#2563eb';
    this.ctx.fillRect(px + 9, py + 6, 14, 3);

    // Eyes
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px + 12, py + 9, 2.5, 2.5);
    this.ctx.fillRect(px + 17, py + 9, 2.5, 2.5);

    // Basketball Jersey (Red #7)
    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(px + 10, py + 18, 12, 10);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 7px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('7', px + 16, py + 25);

    // Shorts & Shoes
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px + 11, py + 27, 4, 4);
    this.ctx.fillRect(px + 17, py + 27, 4, 4);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px + 10, py + 30, 5, 2);
    this.ctx.fillRect(px + 17, py + 30, 5, 2);

    // Bouncing Basketball beside him
    const bounceY = py + 18 + Math.abs(Math.sin((now + px) / 120)) * 8;
    this.ctx.fillStyle = '#ea580c';
    this.ctx.beginPath();
    this.ctx.arc(px + 27, bounceY, 6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawFlameDribbler(px, py, now) {
    this.ctx.save();
    // Swirling Flame Aura
    const flameFlicker = Math.sin(now / 90) * 2;
    this.ctx.fillStyle = '#ea580c';
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 16 + flameFlicker, 14, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#f59e0b';
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 16, 10, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#fef08a';
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 15, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // Intense Glowing Eyes
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px + 12, py + 13, 3, 2);
    this.ctx.fillRect(px + 17, py + 13, 3, 2);

    // Spinning Flaming Basketball at hand
    const rot = now / 150;
    const bX = px + 16 + Math.cos(rot) * 16;
    const bY = py + 20 + Math.sin(rot) * 6;
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(bX, bY, 7, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#fef08a';
    this.ctx.beginPath();
    this.ctx.arc(bX, bY, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawRimGuardian(px, py, now) {
    this.ctx.save();
    // Heavy Stone Titan Body
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(px + 4, py + 10, 24, 20);
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(px + 6, py + 12, 20, 16);

    // Golden Basketball Rim around shoulders
    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.ellipse(px + 16, py + 14, 15, 6, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    // White Net Mesh hanging down
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(px + 6 + i * 5, py + 17);
      this.ctx.lineTo(px + 8 + i * 4, py + 28);
      this.ctx.stroke();
    }

    // Glowing Horn Crown
    this.ctx.fillStyle = '#facc15';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 8, py + 10);
    this.ctx.lineTo(px + 5, py + 2);
    this.ctx.lineTo(px + 11, py + 7);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.moveTo(px + 24, py + 10);
    this.ctx.lineTo(px + 27, py + 2);
    this.ctx.lineTo(px + 21, py + 7);
    this.ctx.fill();

    // Glowing Red Runed Eyes
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(px + 10, py + 13, 3, 2);
    this.ctx.fillRect(px + 19, py + 13, 3, 2);
    this.ctx.restore();
  }

  // Corner Pennant Flag
  drawCornerFlag(fx, fy) {
    this.ctx.save();
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.fillRect(fx - 1, fy - 18, 2, 18); // Pole
    this.ctx.fillStyle = '#ef4444'; // Red Flag
    this.ctx.beginPath();
    this.ctx.moveTo(fx + 1, fy - 18);
    this.ctx.lineTo(fx + 12, fy - 13);
    this.ctx.lineTo(fx + 1, fy - 8);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  // High-Res Soccer Goalpost with Mesh Net
  drawHighResGoalPost(gx, gy, isLeft) {
    this.ctx.save();
    const gh = 120;
    const depth = isLeft ? -28 : 28;

    // Net Backing (Semitransparent Hexagon Mesh)
    this.ctx.fillStyle = 'rgba(241, 245, 249, 0.28)';
    this.ctx.beginPath();
    this.ctx.moveTo(gx, gy);
    this.ctx.lineTo(gx + depth, gy + 10);
    this.ctx.lineTo(gx + depth, gy + gh + 10);
    this.ctx.lineTo(gx, gy + gh);
    this.ctx.closePath();
    this.ctx.fill();

    // Net Lattice Lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    this.ctx.lineWidth = 1;
    for (let ny = gy + 12; ny < gy + gh; ny += 14) {
      this.ctx.beginPath();
      this.ctx.moveTo(gx, ny);
      this.ctx.lineTo(gx + depth, ny + 10);
      this.ctx.stroke();
    }

    // Goal Frame Posts (Pure White Tubular Steel)
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.moveTo(gx, gy);
    this.ctx.lineTo(gx, gy + gh); // Main upright
    this.ctx.moveTo(gx, gy);
    this.ctx.lineTo(gx + depth, gy + 10); // Top back bar
    this.ctx.lineTo(gx + depth, gy + gh + 10); // Back upright
    this.ctx.stroke();

    this.ctx.restore();
  }

  // High-Res Basketball Hoop with Acrylic Backboard & Orange Rim
  drawHighResBasketballHoop(hx, hy, isLeft) {
    this.ctx.save();
    const dir = isLeft ? 1 : -1;

    // Heavy-Duty Black Steel Support Pole
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(hx - dir * 14, hy - 40, 6, 80);

    // Blue Protective Foam Padding at Base
    this.ctx.fillStyle = '#2563eb';
    this.ctx.fillRect(hx - dir * 16, hy + 16, 10, 24);

    // Angled Gooseneck Boom Arm
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(hx - dir * 11, hy - 20);
    this.ctx.lineTo(hx - dir * 2, hy - 16);
    this.ctx.stroke();

    // Acrylic Transparent Backboard
    this.ctx.fillStyle = 'rgba(224, 242, 254, 0.82)';
    this.ctx.fillRect(hx - dir * 2, hy - 38, 4, 46);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(hx - dir * 2, hy - 38, 4, 46);

    // Red Inner Target Box on Backboard
    this.ctx.strokeStyle = '#dc2626';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(hx - dir * 2, hy - 24, 4, 18);

    // Spring-Loaded Orange Metal Rim
    this.ctx.strokeStyle = '#ea580c';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(hx, hy - 6);
    this.ctx.lineTo(hx + dir * 16, hy - 6);
    this.ctx.stroke();

    // White Triangular Hanging Net
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this.ctx.beginPath();
    this.ctx.moveTo(hx, hy - 6);
    this.ctx.lineTo(hx + dir * 16, hy - 6);
    this.ctx.lineTo(hx + dir * 8, hy + 10);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  // High-Res Cafeteria Entrance (학생 급식실 입구)
  // 17. High-Res Soongsil History Hall Entrance (풋살장 우하단 야외 기념 아치문)
  drawHighResHistoryEntrance(px, py) {
    this.ctx.save();

    // Red carpet runner leading to entrance
    this.ctx.fillStyle = 'rgba(185, 28, 28, 0.45)';
    this.ctx.fillRect(px - 16, py - 4, 32, 36);
    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.lineWidth = 1.2;
    this.ctx.strokeRect(px - 16, py - 4, 32, 36);

    // Historic Granite & Marble Pillars
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px - 18, py - 18, 8, 32);
    this.ctx.fillRect(px + 10, py - 18, 8, 32);
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(px - 16, py - 16, 4, 28);
    this.ctx.fillRect(px + 12, py - 16, 4, 28);

    // Arch header with golden crest
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(px - 22, py - 24, 44, 8);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(px - 20, py - 22, 40, 4);

    // Entrance gate aperture (deep dark portal)
    this.ctx.fillStyle = '#090d16';
    this.ctx.fillRect(px - 10, py - 16, 20, 24);

    // Sharp badge label
    this.drawSharpLabel(px, py - 36, '🏛️ 숭실역사관', {
      bgColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#f59e0b',
      textColor: '#fef08a',
      fontSize: 12,
      paddingX: 10,
      height: 22
    });

    this.ctx.restore();
  }

  drawHighResCafeteriaEntrance(cx, cy) {
    this.ctx.save();
    const w = 5 * 32;
    const h = 2 * 32;

    // Automatic Sliding Door Frame (Brushed Stainless Steel)
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(cx - w / 2, cy - 8, w, h + 8);

    // Double Glass Sliding Doors (Cyan / Sky Tinted)
    const dw = (w - 16) / 2;
    this.ctx.fillStyle = '#0284c7';
    this.ctx.fillRect(cx - w / 2 + 6, cy, dw, h - 4);
    this.ctx.fillRect(cx + 2, cy, dw, h - 4);

    this.ctx.fillStyle = '#38bdf8'; // Glass reflection
    this.ctx.fillRect(cx - w / 2 + 8, cy + 4, dw - 4, 16);
    this.ctx.fillRect(cx + 4, cy + 4, dw - 4, 16);

    // Stainless Steel Vertical Handles
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.fillRect(cx - 6, cy + 18, 3, 26);
    this.ctx.fillRect(cx + 3, cy + 18, 3, 26);

    // Welcome Floor Mat in Deep Navy
    this.ctx.fillStyle = '#1e3a8a';
    this.ctx.fillRect(cx - w / 2 + 12, cy + h - 2, w - 24, 12);
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(cx - w / 2 + 12, cy + h - 2, w - 24, 12);

    // Grand Overhead Signboard
    this.drawSharpLabel(cx, cy - 14, '🍽️ 학생 급식실 (조리실)', {
      bgColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#fbbf24',
      textColor: '#fef08a',
      fontSize: 12.5,
      paddingX: 12,
      height: 22
    });

    this.ctx.restore();
  }

  // High-Res Wood Team Bench
  drawHighResBench(bx, by) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    this.ctx.fillRect(bx - 20, by + 12, 44, 4);

    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(bx - 20, by, 40, 6);
    this.ctx.fillStyle = '#92400e';
    this.ctx.fillRect(bx - 20, by + 6, 40, 6);

    this.ctx.fillStyle = '#334155'; // Metal Legs
    this.ctx.fillRect(bx - 16, by + 10, 4, 6);
    this.ctx.fillRect(bx + 12, by + 10, 4, 6);
    this.ctx.restore();
  }

  // Outdoor Drinking Water Fountain
  drawHighResDrinkingFountain(fx, fy) {
    this.ctx.save();
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(fx - 8, fy, 16, 20);
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(fx - 10, fy - 4, 20, 6); // basin
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillRect(fx - 6, fy - 2, 12, 3); // water pool
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(fx - 1, fy - 8, 3, 5); // faucet
    this.ctx.restore();
  }

  renderMascots() {
    if (this.player.room !== 'hallway' || (this.player.floor && this.player.floor !== 1)) return;

    for (const m of this.mascots) {
      const px = m.x * 32;
      const py = m.y * 32;

      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.beginPath();
      this.ctx.ellipse(px + 16, py + 24, 10, 5, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Dog Mascot from Image 3
      this.ctx.fillStyle = '#ea580c';
      this.ctx.beginPath();
      this.ctx.arc(px + 16, py + 14, 9, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#fef08a';
      this.ctx.beginPath();
      this.ctx.arc(px + 16, py + 8, 4, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#c2410c';
      this.ctx.fillRect(px + 8, py + 8, 3, 5);
      this.ctx.fillRect(px + 21, py + 8, 3, 5);

      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(px + 13, py + 12, 2, 2);
      this.ctx.fillRect(px + 17, py + 12, 2, 2);

      this.drawSharpLabel(px + 16, py - 9, `🐶 ${m.name}`, {
        bgColor: 'rgba(15, 23, 42, 0.94)',
        borderColor: '#fb923c',
        textColor: '#fef08a',
        fontSize: 12,
        paddingX: 9,
        height: 20
      });
    }
  }

  renderNPCs() {
    if (this.player.room !== 'hallway') return;
    const fData = WORLD_DATA.floors[this.player.floor];
    if (!fData || !fData.npcs) return;

    for (const npc of fData.npcs) {
      const px = npc.x * 32;
      const py = npc.y * 32;

      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.beginPath();
      this.ctx.ellipse(px + 16, py + 26, 12, 6, 0, 0, Math.PI * 2);
      this.ctx.fill();

      const isTeacherNpc = (npc.avatar === 'teacher' || npc.name.includes('선생님'));
      this.ctx.fillStyle = npc.avatar === 'baird' ? '#854d0e' : (isTeacherNpc ? '#1e3a8a' : '#047857');
      this.ctx.beginPath();
      this.ctx.arc(px + 16, py + 12, 10, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillRect(px + 8, py + 18, 16, 14);

      if (npc.id === 'npc_student_worried') {
        const app = window.MainApp;
        const q = (app && app.playerData && app.playerData.quests) ? app.playerData.quests['quest_kwimjinsyong_career'] : null;
        if (q && q.status === 'in_progress' && q.guidebookCollected && !q.studentComforted) {
          this.drawFloatingQuestMarker(px + 16, py - 18, 'completed');
        } else if (q && q.status === 'in_progress' && !q.guidebookCollected) {
          this.drawFloatingQuestMarker(px + 16, py - 18, 'in_progress');
        }
      } else if (npc.questId && npc.id !== 'npc_librarian') {
        const qStatus = (window.MainApp && typeof window.MainApp.getTeacherQuestStatus === 'function')
          ? window.MainApp.getTeacherQuestStatus(npc.questId || npc.id)
          : 'available';
        if (qStatus && qStatus !== 'done') {
          this.drawFloatingQuestMarker(px + 16, py - 18, qStatus);
        }
      }

      // 학생 NPC 밑의 이름 안내 라벨 제거 (깔끔한 시각 디자인 유지)
      if (npc.id === 'npc_student_worried' || (npc.name && npc.name.includes('학생'))) {
        continue;
      }

      const labelIcon = isTeacherNpc ? '👨‍🏫' : (npc.avatar === 'graduate' || npc.name.includes('졸업') ? '🎓' : '💬');
      this.drawSharpLabel(px + 16, py + 38, `${labelIcon} ${npc.name}`, {
        bgColor: isTeacherNpc ? 'rgba(30, 58, 138, 0.95)' : 'rgba(6, 78, 59, 0.95)',
        borderColor: isTeacherNpc ? '#60a5fa' : '#34d399',
        textColor: '#fef08a',
        fontSize: 12.5,
        paddingX: 10,
        height: 21
      });
    }
  }

  // ========================================================
  // CHARACTER SPRITE SYSTEM (포켓몬 금/은 스타일 도트 캐릭터)
  // - 16x23 도트 그리드 · 4방향 · 4프레임 걷기 · 눈 깜빡임 · 외곽선
  // - 교사: 여성 긴머리 캐릭터 (단정한 정장 & 찰랑이는 롱헤어)
  // - 학생: 남학생 캐릭터 고정 (머리색 3종: 흑발/갈색/금발, 옷색 3종: 레드/블루/그린)
  // - 착용 장비(투구/갑옷/무기/장신구)가 외형에 그대로 표시
  // ========================================================
  getCharacterPalette(isTeacher, hairColor = 'black', outfitColor = 'red') {
    if (isTeacher) {
      // 👩‍🏫 교사 (여성 긴머리):
      // 다크 브라운 찰랑이는 볼륨 롱헤어 + 눈부신 황금빛 로열 골드 정장 (화려한 골드 & 샴페인 펄!)
      const TEACHER_THEMES = {
        gold: {
          name: '황금빛 로열 골드',
          jacket: '#f59e0b', jacketShade: '#b45309', jacketHi: '#fef08a',
          skirt: '#d97706', skirtShade: '#92400e'
        },
        teal: {
          name: '딥 에메랄드 틸',
          jacket: '#0f766e', jacketShade: '#115e59', jacketHi: '#14b8a6',
          skirt: '#115e59', skirtShade: '#042f2e'
        },
        burgundy: {
          name: '와인 버건디',
          jacket: '#9f1239', jacketShade: '#881337', jacketHi: '#be123c',
          skirt: '#881337', skirtShade: '#4c0519'
        },
        camel: {
          name: '카멜 베이지',
          jacket: '#b46b2c', jacketShade: '#8c4a16', jacketHi: '#d98b48',
          skirt: '#78350f', skirtShade: '#451a03'
        },
        purple: {
          name: '로얄 퍼플',
          jacket: '#7e22ce', jacketShade: '#6b21a8', jacketHi: '#9333ea',
          skirt: '#581c87', skirtShade: '#3b0764'
        }
      };
      const theme = (outfitColor && TEACHER_THEMES[outfitColor]) ? TEACHER_THEMES[outfitColor] : TEACHER_THEMES.gold;
      return Object.assign({
        isTeacher: true,
        hair: '#382216', hairHi: '#5a3825', hairShade: '#22130b',
        inner: '#ffffff', accent: '#f59e0b',
        legs: '#fcd5b0',
        shoe: '#451a03', sole: '#1c0a00',
        bag: '#78350f', bagShade: '#451a03'
      }, theme);
    }

    // 👦 남학생 머리색 3종 (흑발, 갈색, 금발)
    const HAIR_COLORS = {
      black: { hair: '#221f24', hairHi: '#3d3842', hairShade: '#121013' },
      brown: { hair: '#5c3317', hairHi: '#824c24', hairShade: '#3b200e' },
      blonde: { hair: '#b87a1d', hairHi: '#eab308', hairShade: '#784c0c' }
    };
    const H = HAIR_COLORS[hairColor] || HAIR_COLORS.black;

    // 👦 남학생 옷 색상 3종 (레드, 블루, 그린)
    const OUTFIT_COLORS = {
      red: {
        cap: '#dc2626', capShade: '#991b1b', capAccent: '#ffffff',
        jacket: '#ef4444', jacketShade: '#b91c1c', jacketHi: '#f87171',
        inner: '#1f2937',
        pants: '#1e40af', pantsShade: '#172554',
        shoe: '#dc2626', sole: '#f1f5f9',
        bag: '#eab308', bagShade: '#a16207'
      },
      blue: {
        cap: '#2563eb', capShade: '#1d4ed8', capAccent: '#ffffff',
        jacket: '#3b82f6', jacketShade: '#1d4ed8', jacketHi: '#60a5fa',
        inner: '#0f172a',
        pants: '#0f172a', pantsShade: '#020617',
        shoe: '#2563eb', sole: '#f1f5f9',
        bag: '#f59e0b', bagShade: '#b45309'
      },
      green: {
        cap: '#16a34a', capShade: '#15803d', capAccent: '#ffffff',
        jacket: '#22c55e', jacketShade: '#15803d', jacketHi: '#4ade80',
        inner: '#1e293b',
        pants: '#334155', pantsShade: '#1e293b',
        shoe: '#16a34a', sole: '#f1f5f9',
        bag: '#eab308', bagShade: '#a16207'
      }
    };
    const O = OUTFIT_COLORS[outfitColor] || OUTFIT_COLORS.red;

    return Object.assign({ isTeacher: false }, H, O);
  }

  hashString(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h) % 1000;
  }

  // Paints one character frame onto an offscreen context in grid units (1 unit = 1 game px)
  paintCharacter(g, o) {
    const P = this.getCharacterPalette(o.teacher, o.hairColor, o.outfitColor);
    const S = { skin: '#fcd5b0', skinShade: '#e8a87c', blush: '#f9a8a8', eye: '#1e1b2e' };
    const W = {
      wood: { blade: '#e3b778', hi: '#f5d7a1', shade: '#a0703c', guard: '#6b4423', hilt: '#3f2a14' },
      leather: { blade: '#e2e8f0', hi: '#ffffff', shade: '#94a3b8', guard: '#854d0e', hilt: '#451a03' },
      bronze: { blade: '#f2c14e', hi: '#fff1b8', shade: '#c27c0e', guard: '#7c2d12', hilt: '#3b1a08' },
      forsythia: { blade: '#fde047', hi: '#fef08a', shade: '#ca8a04', guard: '#15803d', hilt: '#166534' },
      ginkgo: { blade: '#f59e0b', hi: '#fef08a', shade: '#b45309', guard: '#78350f', hilt: '#451a03' }
    };
    const A = {
      wood: { base: '#b7791f', hi: '#d69e2e', shade: '#7b4f12', dark: '#5c3d0e' },
      leather: { base: '#854d0e', hi: '#a16207', shade: '#713f12', dark: '#451a03' },
      bronze: { base: '#d97706', hi: '#fcd34d', shade: '#92400e', dark: '#78350f' },
      forsythia: { base: '#22c55e', hi: '#86efac', shade: '#15803d', dark: '#14532d' },
      ginkgo: { base: '#eab308', hi: '#fef08a', shade: '#a16207', dark: '#713f12' }
    };
    const gear = o.gear || {};
    const f = o.frame || 0;
    const bob = (f % 2 === 1) ? 1 : 0; // 걸음 프레임에서 상체가 살짝 내려앉음

    // r: 상체(머리·몸통·팔) / rl: 다리·신발 (bob 미적용)
    const r = (x, y, w, h, c) => { if (!c) return; g.fillStyle = c; g.fillRect(4 + x, 4 + y + bob, w, h); };
    const rl = (x, y, w, h, c) => { if (!c) return; g.fillStyle = c; g.fillRect(4 + x, 4 + y, w, h); };

    const drawKoEyes = (cx) => {
      r(cx - 1, 6, 1, 1, S.eye); r(cx + 1, 6, 1, 1, S.eye);
      r(cx, 7, 1, 1, S.eye);
      r(cx - 1, 8, 1, 1, S.eye); r(cx + 1, 8, 1, 1, S.eye);
    };

    const drawHelmet = (side) => {
      const h = A[gear.helmet] || A.wood;
      if (!h) return;
      if (side) {
        r(6, -1, 5, 1, h.base); r(5, 0, 7, 1, h.base); r(4, 1, 8, 2, h.base);
        r(6, 0, 2, 1, h.hi); r(5, 1, 1, 1, h.hi);
        if (gear.helmet === 'wood') { r(7, -1, 1, 4, h.shade); r(10, 0, 1, 3, h.shade); }
        r(3, 3, 10, 1, h.dark);
        if (gear.helmet === 'bronze') {
          r(8, -3, 3, 2, '#dc2626'); r(8, -3, 1, 1, '#f87171');
          r(8, 4, 1, 3, h.base);
        }
      } else {
        r(5, -1, 6, 1, h.base); r(4, 0, 8, 1, h.base); r(3, 1, 10, 2, h.base);
        r(5, 0, 2, 1, h.hi); r(4, 1, 1, 1, h.hi);
        if (gear.helmet === 'wood') { r(6, -1, 1, 4, h.shade); r(9, -1, 1, 4, h.shade); }
        r(2, 3, 12, 1, h.dark);
        if (gear.helmet === 'bronze') {
          r(7, -3, 2, 2, '#dc2626'); r(7, -3, 1, 1, '#f87171');
          if (o.dir === 'down') { r(7, 4, 2, 3, h.base); r(7, 4, 1, 3, h.hi); }
        }
      }
    };

    // Upright sword held at the side (front/back view)
    const drawSwordUpright = (bx, dy) => {
      const w = W[gear.weapon] || W.wood;
      if (!w) return;
      r(bx, 9 + dy, 2, 7, w.blade); r(bx, 9 + dy, 1, 7, w.hi);
      r(bx, 8 + dy, 1, 1, w.hi); r(bx + 1, 15 + dy, 1, 1, w.shade);
      r(bx - 1, 16 + dy, 4, 1, w.guard);
      r(bx, 17 + dy, 2, 2, w.hilt);
      r(bx, 19 + dy, 2, 1, w.guard);
    };

    if (o.dir === 'down' || o.dir === 'up') {
      const front = o.dir === 'down';
      const lUp = f === 1 ? 1 : 0;
      const rUp = f === 3 ? 1 : 0;
      const lDy = f === 1 ? 1 : (f === 3 ? -1 : 0);
      const rDy = -lDy;

      // Legs & shoes
      if (o.teacher) {
        // 교사 (여성): 단정한 H라인 스커트 + 다리/스타킹 + 브라운 단화
        rl(4, 18, 8, 3, P.skirt);
        rl(4, 20, 8, 1, P.skirtShade);
        rl(5, 21 - lUp, 2, 1, P.legs);
        rl(9, 21 - rUp, 2, 1, P.legs);
        rl(5, 22 - lUp, 3, 1, P.shoe);
        rl(9, 22 - rUp, 3, 1, P.shoe);
        rl(5, 23 - lUp, 3, 1, P.sole);
        rl(9, 23 - rUp, 3, 1, P.sole);
      } else {
        // 남학생: 팬츠 + 스니커즈
        rl(4, 18, 4, 3 - lUp, P.pants); rl(8, 18, 4, 3 - rUp, P.pants);
        rl(7, 18, 1, 3 - lUp, P.pantsShade);
        rl(4, 21 - lUp, 4, 1, P.shoe); rl(4, 22 - lUp, 4, 1, P.sole);
        rl(8, 21 - rUp, 4, 1, P.shoe); rl(8, 22 - rUp, 4, 1, P.sole);
      }

      // Arms (팔 흔들기)
      r(2, 12 + lDy, 2, 5, P.jacket); r(2, 12 + lDy, 1, 5, P.jacketShade); r(2, 17 + lDy, 2, 1, S.skin);
      r(12, 12 + rDy, 2, 5, P.jacket); r(13, 12 + rDy, 1, 5, P.jacketShade); r(12, 17 + rDy, 2, 1, S.skin);

      // Torso
      r(4, 11, 8, 7, P.jacket);
      r(4, 11, 1, 7, P.jacketShade); r(11, 11, 1, 7, P.jacketShade);
      r(5, 11, 6, 1, P.jacketHi);
      r(4, 17, 8, 1, P.jacketShade);
      if (front) {
        if (o.teacher) {
          // 여성 교사: 화이트 이너 블라우스 + 골드 펜던트
          r(6, 11, 4, 2, P.inner);
          r(7, 12, 2, 1, P.accent);
        } else {
          r(6, 11, 4, 1, P.inner);
          r(7, 12, 2, 2, P.inner);
        }
      }

      // Armor plate (장비 착용 시)
      if (gear.armor) {
        const a = A[gear.armor] || A.wood;
        if (a) {
          r(5, 12, 6, 5, a.base); r(5, 12, 6, 1, a.hi); r(5, 16, 6, 1, a.shade);
          if (gear.armor === 'wood') r(5, 14, 6, 1, a.shade);
          else { r(6, 13, 1, 1, a.hi); r(9, 13, 1, 1, a.hi); r(7, 14, 2, 1, a.hi); }
        }
      }

      // Backpack / satchel strap (뒷모습)
      if (!front) {
        if (!o.teacher) {
          r(5, 12, 6, 5, P.bag); r(5, 13, 6, 1, P.bagShade); r(5, 16, 6, 1, P.bagShade);
          r(5, 11, 1, 1, P.bagShade); r(10, 11, 1, 1, P.bagShade);
        } else {
          // 여성 교사 가죽 숄더백 끈
          for (let i = 0; i < 7; i++) r(4 + i, 11 + i, 1, 1, P.bag);
        }
      }

      // Shoulder pads (장비 착용 시)
      if (gear.armor) {
        const a = A[gear.armor] || A.wood;
        if (a) {
          if (gear.armor === 'bronze') {
            r(1, 11, 4, 2, a.base); r(1, 11, 4, 1, a.hi);
            r(11, 11, 4, 2, a.base); r(11, 11, 4, 1, a.hi);
          } else {
            r(2, 11, 3, 2, a.dark); r(2, 11, 3, 1, a.base);
            r(11, 11, 3, 2, a.dark); r(11, 11, 3, 1, a.base);
          }
        }
      }

      // --- HEAD & HAIR ---
      if (front) {
        r(4, 5, 8, 5, S.skin); r(5, 10, 6, 1, S.skin);
        r(3, 7, 1, 2, S.skin); r(12, 7, 1, 2, S.skin);

        if (o.teacher) {
          // 👩‍🏫 여성 교사 (긴머리):
          // 볼륨감 있는 둥근 정수리 라인 (납작함 완전 해소!)
          r(5, 1, 6, 1, P.hair); r(6, 1, 4, 1, P.hairHi); // row 1 (최상단 부드러운 아치 곡선)
          r(4, 2, 8, 1, P.hair); r(5, 2, 5, 1, P.hairHi); // row 2 (정수리 볼륨)
          r(3, 3, 10, 2, P.hair); r(4, 3, 3, 1, P.hairHi); // row 3-4 (풍성한 상단)
          r(3, 5, 2, 2, P.hair); r(11, 5, 2, 2, P.hair);
          r(5, 5, 2, 1, P.hair); r(9, 5, 2, 1, P.hair);
          // 양 어깨 너머로 가슴까지 흘러내리는 풍성한 긴 생머리!
          r(2, 6, 2, 9, P.hair); r(2, 7, 1, 7, P.hairHi); r(2, 14, 2, 1, P.hairShade);
          r(12, 6, 2, 9, P.hair); r(13, 7, 1, 7, P.hairHi); r(12, 14, 2, 1, P.hairShade);
          // 골드 펄 헤어핀 포인트
          r(3, 3, 2, 2, '#fde047'); r(4, 4, 1, 1, '#ca8a04');

          // 여성스러운 눈매 (속눈썹 라인)
          if (o.ko) { drawKoEyes(5); drawKoEyes(10); }
          else if (o.blink) { r(4, 7, 3, 1, S.eye); r(9, 7, 3, 1, S.eye); }
          else {
            r(4, 6, 3, 1, '#1e1b2e'); // 상단 속눈썹 라인
            r(5, 7, 1, 2, S.eye);
            r(9, 6, 3, 1, '#1e1b2e');
            r(10, 7, 1, 2, S.eye);
          }
          r(4, 9, 1, 1, '#fca5a5'); r(11, 9, 1, 1, '#fca5a5'); // 핑크 볼터치
          r(7, 9, 2, 1, '#f43f5e'); // 로즈 립
        } else {
          // 👦 남학생:
          r(3, 4, 10, 2, P.hair);
          r(5, 5, 2, 1, S.skin); r(8, 5, 3, 1, S.skin);
          r(3, 6, 1, 1, P.hair); r(12, 6, 1, 1, P.hair);
          if (o.ko) { drawKoEyes(5); drawKoEyes(10); }
          else if (o.blink) { r(5, 8, 1, 1, S.eye); r(10, 8, 1, 1, S.eye); }
          else { r(5, 7, 1, 2, S.eye); r(10, 7, 1, 2, S.eye); }
          r(4, 9, 1, 1, S.blush); r(11, 9, 1, 1, S.blush);
          r(7, 9, 2, 1, o.ko ? '#7f1d1d' : S.skinShade);
        }
      } else {
        // 뒷모습 (Facing Up)
        if (o.teacher) {
          // 👩‍🏫 교사 뒷모습: 볼륨 정수리 & 등 뒤 허리선까지 풍성하게 내려오는 긴 생머리!
          r(5, 1, 6, 1, P.hair); r(6, 1, 4, 1, P.hairHi);
          r(4, 2, 8, 1, P.hair); r(5, 2, 5, 1, P.hairHi);
          r(3, 3, 10, 11, P.hair);
          r(5, 3, 4, 2, P.hairHi);
          r(4, 13, 8, 2, P.hair);
          r(5, 14, 6, 1, P.hairShade);
          r(2, 6, 1, 7, P.hair); r(13, 6, 1, 7, P.hair);
        } else {
          // 👦 남학생 뒷머리
          r(3, 4, 10, 6, P.hair); r(5, 5, 3, 1, P.hairHi);
          r(3, 7, 1, 2, S.skin); r(12, 7, 1, 2, S.skin);
          r(5, 10, 6, 1, S.skinShade);
        }
      }

      // Headwear (투구 > 남학생 모자 / 교사는 긴머리 유지)
      if (gear.helmet) {
        drawHelmet(false);
      } else if (!o.teacher) {
        // 남학생 캡 모자
        r(5, 0, 6, 1, P.cap); r(4, 1, 8, 1, P.cap); r(3, 2, 10, 1, P.cap);
        if (front) { r(6, 1, 4, 2, P.capAccent); r(2, 3, 12, 1, P.capShade); }
        else { r(3, 3, 10, 1, P.cap); r(6, 3, 4, 1, P.capShade); }
      }

      // Weapon (캐릭터의 오른손)
      if (gear.weapon) drawSwordUpright(front ? 0 : 14, front ? lDy : rDy);

      // Accessory
      if (gear.accessory === 'forsythia') {
        if (front) r(13, 17 + rDy, 1, 1, '#facc15'); else r(2, 17 + lDy, 1, 1, '#facc15');
      } else if (gear.accessory === 'ginkgo' && front) {
        r(6, 12, 1, 1, '#78350f'); r(9, 12, 1, 1, '#78350f');
        r(7, 13, 2, 2, '#fbbf24'); r(7, 13, 1, 1, '#fef3c7');
      } else if (gear.accessory === 'heritage') {
        if (front) {
          r(13, 17 + rDy, 2, 2, '#38bdf8');
          r(13, 17 + rDy, 1, 1, '#ffffff');
        } else {
          r(2, 17 + lDy, 2, 2, '#38bdf8');
          r(2, 17 + lDy, 1, 1, '#ffffff');
        }
      }
      return;
    }

    // ---- Side view (facing left; right is mirrored by the caller) ----
    const step = f % 2 === 1;
    const aDx = f === 1 ? -1 : (f === 3 ? 1 : 0);

    // Backpack / satchel (등 뒤)
    if (!o.teacher) {
      r(9, 12, 4, 5, P.bag); r(12, 12, 1, 5, P.bagShade); r(9, 16, 4, 1, P.bagShade);
    } else {
      r(10, 13, 3, 4, P.bag); r(12, 13, 1, 4, P.bagShade);
    }

    // Legs & shoes
    if (o.teacher) {
      // 교사 측면 스커트 & 다리
      rl(5, 18, 5, 3, P.skirt); rl(8, 18, 2, 3, P.skirtShade);
      if (step) {
        rl(4, 21, 2, 1, P.legs); rl(3, 22, 3, 1, P.shoe); rl(3, 23, 3, 1, P.sole);
        rl(8, 21, 2, 1, P.legs); rl(8, 22, 3, 1, P.shoe); rl(8, 23, 3, 1, P.sole);
      } else {
        rl(6, 21, 3, 1, P.legs); rl(5, 22, 4, 1, P.shoe); rl(5, 23, 4, 1, P.sole);
      }
    } else {
      // 남학생 팬츠 & 스니커즈
      if (step) {
        const frontC = f === 1 ? P.pants : P.pantsShade;
        const backC = f === 1 ? P.pantsShade : P.pants;
        rl(9, 18, 3, 3, backC); rl(9, 21, 3, 1, P.shoe); rl(9, 22, 3, 1, P.sole);
        rl(4, 18, 3, 3, frontC); rl(3, 21, 4, 1, P.shoe); rl(3, 22, 4, 1, P.sole);
      } else {
        rl(6, 18, 4, 3, P.pants); rl(8, 18, 1, 3, P.pantsShade);
        rl(5, 21, 5, 1, P.shoe); rl(5, 22, 5, 1, P.sole);
      }
    }

    // Torso
    r(5, 11, 6, 7, P.jacket); r(10, 11, 1, 7, P.jacketShade);
    r(5, 11, 5, 1, P.jacketHi); r(5, 17, 6, 1, P.jacketShade);
    r(5, 11, 1, 2, P.inner);
    if (o.teacher) r(5, 12, 1, 1, P.accent);

    if (gear.armor) {
      const a = A[gear.armor] || A.wood;
      if (a) {
        r(5, 12, 4, 5, a.base); r(5, 12, 4, 1, a.hi); r(5, 16, 4, 1, a.shade);
        if (gear.armor === 'wood') r(5, 14, 4, 1, a.shade);
      }
    }
    if (gear.accessory === 'ginkgo') r(5, 13, 1, 2, '#fbbf24');

    // Head
    r(4, 5, 5, 5, S.skin); r(5, 10, 4, 1, S.skin); r(3, 8, 1, 1, S.skin);

    if (o.teacher) {
      // 👩‍🏫 교사 측면 긴머리: 볼륨 정수리 & 등 뒤로 흘러내리는 롱헤어 실루엣
      r(6, 1, 4, 1, P.hair); r(7, 1, 2, 1, P.hairHi);
      r(5, 2, 6, 1, P.hair); r(6, 2, 3, 1, P.hairHi);
      r(4, 3, 7, 2, P.hair); r(4, 5, 2, 2, P.hair);
      r(8, 4, 5, 11, P.hair);
      r(9, 5, 2, 4, P.hairHi);
      r(8, 14, 4, 2, P.hairShade);

      if (o.ko) drawKoEyes(5);
      else if (o.blink) r(4, 7, 2, 1, S.eye);
      else {
        r(4, 6, 2, 1, '#1e1b2e'); // 속눈썹 라인
        r(5, 7, 1, 2, S.eye);
      }
      r(6, 9, 1, 1, '#fca5a5');
      r(4, 9, 1, 1, S.skinShade);
    } else {
      // 👦 남학생 측면
      r(4, 4, 9, 1, P.hair); r(9, 5, 4, 5, P.hair); r(4, 5, 1, 1, P.hair); r(8, 5, 1, 1, P.hair);
      r(10, 6, 2, 1, P.hairHi);
      r(9, 7, 1, 2, S.skin); r(9, 8, 1, 1, S.skinShade);
      if (o.ko) drawKoEyes(5);
      else if (o.blink) r(5, 8, 1, 1, S.eye);
      else r(5, 7, 1, 2, S.eye);
      r(6, 9, 1, 1, S.blush);
      r(4, 9, 1, 1, S.skinShade);

      // 남학생 측면 캡 모자
      if (!gear.helmet) {
        r(6, 0, 5, 1, P.cap); r(5, 1, 7, 1, P.cap); r(4, 2, 8, 1, P.cap);
        r(5, 1, 3, 2, P.capAccent);
        r(1, 3, 8, 1, P.capShade); r(9, 3, 3, 1, P.cap);
      }
    }

    if (gear.helmet) {
      drawHelmet(true);
    }

    // Near arm (앞쪽 팔 흔들기)
    const hx = 7 + aDx;
    r(hx, 12, 2, 5, P.jacket); r(hx + 1, 12, 1, 5, P.jacketShade);
    if (gear.armor) {
      const a = A[gear.armor] || A.wood;
      if (a) {
        if (gear.armor === 'bronze') { r(6, 11, 4, 2, a.base); r(6, 11, 4, 1, a.hi); }
        else { r(6, 11, 3, 2, a.dark); r(6, 11, 3, 1, a.base); }
      }
    }

    // Weapon pointing forward (전방 겨누기)
    if (gear.weapon) {
      const w = W[gear.weapon] || W.wood;
      if (w) {
        r(hx - 7, 16, 6, 1, w.hi); r(hx - 7, 17, 6, 1, w.blade);
        r(hx - 8, 17, 1, 1, w.blade); r(hx - 3, 17, 2, 1, w.shade);
        r(hx - 1, 15, 1, 4, w.guard);
        r(hx, 16, 2, 1, w.hilt); r(hx + 2, 17, 1, 1, w.guard);
      }
    }
    r(hx, 17, 2, 1, S.skin);
    if (gear.accessory === 'forsythia') r(hx, 17, 1, 1, '#facc15');
    else if (gear.accessory === 'heritage') r(hx, 17, 1, 1, '#38bdf8');
  }

  // Builds (or reuses) an outlined sprite canvas for the given look
  getCharacterSprite(opts) {
    const gr = opts.gear || {};
    const key = [
      opts.dir, opts.frame, opts.teacher ? 1 : 0, opts.blink ? 1 : 0, opts.ko ? 1 : 0,
      opts.hairColor || 'black', opts.outfitColor || 'red',
      gr.weapon || '-', gr.helmet || '-', gr.armor || '-', gr.accessory || '-'
    ].join('|');

    if (!this.spriteCache) this.spriteCache = new Map();
    const cached = this.spriteCache.get(key);
    if (cached) return cached;

    const GW = 24, GH = 32, U = this.renderScale || 2;
    const mk = () => {
      const c = document.createElement('canvas');
      c.width = GW * U;
      c.height = GH * U;
      return c;
    };

    const base = mk();
    const b = base.getContext('2d');
    b.scale(U, U);
    let paintDir = opts.dir;
    if (opts.dir === 'right') {
      b.translate(GW, 0);
      b.scale(-1, 1);
      paintDir = 'left';
    }
    this.paintCharacter(b, Object.assign({}, opts, { dir: paintDir }));

    // 1px dark outline (Pokemon-style)
    const sil = mk();
    const s = sil.getContext('2d');
    s.drawImage(base, 0, 0);
    s.globalCompositeOperation = 'source-in';
    s.fillStyle = '#14111f';
    s.fillRect(0, 0, sil.width, sil.height);

    const out = mk();
    const oc = out.getContext('2d');
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => oc.drawImage(sil, dx, dy));
    oc.drawImage(base, 0, 0);

    if (this.spriteCache.size > 400) this.spriteCache.clear();
    this.spriteCache.set(key, out);
    return out;
  }

  // Draw Pokemon Gold/Silver style trainer sprite with visible gear
  renderPlayer(p, isLocal = false) {
    const px = p.x;
    const py = p.y;
    const isTeacher = !!p.isTeacher;
    const isFallen = !!p.isFallen;
    const now = Date.now();

    // Teacher Noclip Glowing Aura (Green pulse when 공간돌파 is active)
    if (isTeacher && p.noclip) {
      this.ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
      this.ctx.beginPath();
      this.ctx.arc(px + 12, py + 4, 36, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#34d399';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    // Walk frame: 내 캐릭터는 실제 입력 기반, 다른 학생은 최근 이동 시각 기반
    let frame = 0;
    if (p === this.player) {
      frame = p.isMoving ? (p.animFrame % 4) : 0;
    } else if (now - (p.lastMoveAt || 0) < 180) {
      frame = Math.floor(now / 120) % 4;
    }

    const seed = this.hashString(String(p.id || p.name || 'me'));
    const blink = !isFallen && ((now + seed * 97) % 3600) < 130;

    const gearSrc = p.gear || {};
    const tier = (id) => {
      if (!id) return null;
      if (id.includes('heritage')) return 'heritage';
      if (id.includes('bronze')) return 'bronze';
      if (id.includes('leather')) return 'leather';
      if (id.includes('forsythia')) return 'forsythia';
      if (id.includes('ginkgo')) return 'ginkgo';
      return 'wood';
    };
    // 2배 크기 렌더링 (24x32 -> 48x64)
    const SCALE = 2.0;
    const drawW = Math.round(24 * SCALE);
    const drawH = Math.round(32 * SCALE);
    const drawX = Math.round(px + 12 - drawW / 2); // 가로 중앙 정렬
    const drawY = Math.round(py + 29 - 27 * SCALE); // 발끝 위치(py+29)에 정확히 착지

    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;
    try {
      const sprite = this.getCharacterSprite({
        dir: isFallen ? 'down' : (p.direction || 'down'),
        frame: isFallen ? 0 : frame,
        teacher: isTeacher,
        blink,
        ko: isFallen,
        hairColor: p.hairColor || 'black',
        outfitColor: p.outfitColor || 'red',
        gear: {
          weapon: tier(gearSrc.weapon),
          helmet: tier(gearSrc.helmet),
          armor: tier(gearSrc.armor),
          accessory: tier(gearSrc.accessory)
        }
      });

      if (isFallen) {
        // 쓰러진 모습: 바닥에 누워 있고 머리 위로 별이 빙글빙글
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(px + 12, py + 28, 22, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.save();
        this.ctx.globalAlpha = 0.8;
        this.ctx.translate(px + 12, py + 18);
        this.ctx.rotate(-Math.PI / 2);
        if (sprite) this.ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
        this.ctx.restore();

        this.ctx.fillStyle = '#fde047';
        for (let i = 0; i < 3; i++) {
          const a = now / 260 + i * (Math.PI * 2 / 3);
          const sx = px + Math.cos(a) * 10;
          const sy = py + 6 + Math.sin(a) * 4;
          this.ctx.fillRect(sx - 1, sy - 2, 2, 4);
          this.ctx.fillRect(sx - 2, sy - 1, 4, 2);
        }
      } else {
        // 2배 크기에 맞춘 안정적인 발밑 타원 그림자
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
        this.ctx.beginPath();
        this.ctx.ellipse(px + 12, py + 29, 15, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // === 👩‍🏫 선생님 전용 황금빛 반짝이 아우라 이펙트 (뒷쪽에서 은은하게 발광) ===
        if (isTeacher) {
          this.renderTeacherGoldenAura(px, py, now);
        }

        if (sprite) this.ctx.drawImage(sprite, drawX, drawY, drawW, drawH);
      }
    } catch (sprErr) {
      console.warn('[Engine] renderPlayer sprite draw fallback:', sprErr);
    }
    this.ctx.restore();

    // Nameplate & Crown (2배 캐릭터 높이에 맞춰 머리 위로 배치)
    const name = p.name || '학생';
    const plateY = py - 32;
    const title = p.equippedTitle;
    const displayName = isFallen ? `💀 [기절] ${name}` : (title ? `[${title}] ${name}` : name);
    const brawlTeam = (this.player.room === 'playground' && window.BrawlBall && typeof window.BrawlBall.getPlayerTeam === 'function')
      ? window.BrawlBall.getPlayerTeam(p, isLocal)
      : null;
    const finalDisplayName = brawlTeam ? `${brawlTeam === 'blue' ? '🔵' : '🔴'} ${displayName}` : displayName;
    const plateBgColor = isFallen
      ? 'rgba(153, 27, 27, 0.96)'
      : (brawlTeam === 'blue'
        ? 'rgba(30, 58, 138, 0.96)'
        : (brawlTeam === 'red'
          ? 'rgba(153, 27, 27, 0.96)'
          : (isTeacher ? 'rgba(180, 83, 9, 0.96)' : (isLocal ? 'rgba(185, 28, 28, 0.96)' : 'rgba(15, 23, 42, 0.92)'))));
    const plateBorderColor = isFallen
      ? '#f87171'
      : (brawlTeam === 'blue'
        ? '#60a5fa'
        : (brawlTeam === 'red'
          ? '#f87171'
          : (isTeacher ? '#fde047' : (isLocal ? '#fca5a5' : '#94a3b8'))));

    this.drawSharpLabel(px + 12, plateY, finalDisplayName, {
      bgColor: plateBgColor,
      borderColor: plateBorderColor,
      textColor: isFallen ? '#fca5a5' : '#ffffff',
      fontSize: 12.5,
      paddingX: 10,
      height: 21
    });

    if (p.stunnedUntil && now < p.stunnedUntil) {
      this.drawSharpLabel(px + 12, plateY - 18, '⚡ 1초 마비!', {
        bgColor: 'rgba(234, 88, 12, 0.95)',
        borderColor: '#fde047',
        borderWidth: 1.5,
        textColor: '#ffffff',
        fontSize: 10,
        paddingX: 6,
        height: 16
      });
    }

    // Chat speech bubble if active
    if (p.chatBubble && Date.now() < p.chatBubbleExpires) {
      this.renderChatBubble(px + 12, plateY - 16, p.chatBubble);
    }
  }

  renderOtherPlayer(p) {
    this.renderPlayer(p, false);
  }

  // ========================================================
  // ✨ 교사 전용 질주 황금빛 별가루 이펙트 시스템
  // (오직 교사 계정이 Shift 질주할 때만 발밑에 반짝이는 황금빛 십자별 파티클 발생)
  // ========================================================
  updateTeacherDashParticles() {
    // 방/층 변경 시 이전 구역 좌표에 남은 파티클 즉시 제거
    const curLocKey = `${this.player ? this.player.floor : 7}_${this.player ? this.player.room : 'hallway'}`;
    if (this._lastParticleLocKey && this._lastParticleLocKey !== curLocKey) {
      this.teacherDashParticles = [];
    }
    this._lastParticleLocKey = curLocKey;

    // 1. 내 캐릭터가 교사 계정이고 질주 중이며 이동 중일 때 파티클 방출
    if (this.player && this.player.isTeacher && this.player.isDashing && this.player.isMoving) {
      const pColors = ['#fef08a', '#fde047', '#fbbf24', '#f59e0b', '#ffffff'];
      const spawnCount = Math.random() < 0.7 ? 2 : 1;
      for (let i = 0; i < spawnCount; i++) {
        const spawnX = this.player.x + 12 + (Math.random() * 14 - 7);
        const spawnY = this.player.y + 27 + (Math.random() * 6 - 3);

        let oppX = 0;
        let oppY = 0;
        if (this.player.direction === 'left') oppX = 1.0;
        else if (this.player.direction === 'right') oppX = -1.0;
        if (this.player.direction === 'up') oppY = 1.0;
        else if (this.player.direction === 'down') oppY = -1.0;

        const vx = oppX * (Math.random() * 1.3 + 0.4) + (Math.random() - 0.5) * 1.0;
        const vy = oppY * (Math.random() * 1.3 + 0.4) - (Math.random() * 0.9 + 0.3);

        const maxLife = Math.floor(Math.random() * 10) + 18;
        this.teacherDashParticles.push({
          x: spawnX,
          y: spawnY,
          vx: vx,
          vy: vy,
          size: Math.random() * 3.5 + 2.5,
          color: pColors[Math.floor(Math.random() * pColors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.28,
          life: maxLife,
          maxLife: maxLife
        });
      }
    }

    // 2. 다른 플레이어 중 교사 계정이 질주 중일 때도 동기화 연출
    const now = Date.now();
    for (const id in this.otherPlayers) {
      const op = this.otherPlayers[id];
      if (op && op.isTeacher && op.isDashing && (now - (op.lastMoveAt || 0) < 180)) {
        const pColors = ['#fef08a', '#fde047', '#fbbf24', '#f59e0b', '#ffffff'];
        const spawnX = op.x + 12 + (Math.random() * 14 - 7);
        const spawnY = op.y + 27 + (Math.random() * 6 - 3);
        const maxLife = 20;
        this.teacherDashParticles.push({
          x: spawnX,
          y: spawnY,
          vx: (Math.random() - 0.5) * 1.4,
          vy: -Math.random() * 1.1 - 0.3,
          size: Math.random() * 3.2 + 2.2,
          color: pColors[Math.floor(Math.random() * pColors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.25,
          life: maxLife,
          maxLife: maxLife
        });
      }
    }

    // 3. 물리 연산 및 수명 감소
    for (let i = this.teacherDashParticles.length - 1; i >= 0; i--) {
      const p = this.teacherDashParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.rotation += p.rotSpeed;
      p.life--;
      if (p.life <= 0) {
        this.teacherDashParticles.splice(i, 1);
      }
    }

    // 최대 파티클 수 제한 (퍼포먼스 보호)
    if (this.teacherDashParticles.length > 120) {
      this.teacherDashParticles.splice(0, this.teacherDashParticles.length - 120);
    }
  }

  // ========================================================
  // ✨ 교사 전용 질주 황금빛 별가루 이펙트 렌더러
  // ========================================================
  renderTeacherDashParticles() {
    if (!this.teacherDashParticles || this.teacherDashParticles.length === 0) return;
    const ctx = this.ctx;
    ctx.save();
    for (let i = 0; i < this.teacherDashParticles.length; i++) {
      const p = this.teacherDashParticles[i];
      const alpha = Math.max(0, p.life / p.maxLife);
      const scale = (p.life > p.maxLife * 0.75)
        ? ((p.maxLife - p.life) / (p.maxLife * 0.25)) // 팝인 스케일
        : (p.life / (p.maxLife * 0.75)); // 페이드아웃 스케일
      const currentSize = p.size * Math.max(0.2, scale);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;

      // 1. 은은한 황금빛 구체 글로우 후광 (Golden Halo)
      const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize * 2.2);
      glowGrad.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
      glowGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.3)');
      glowGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, currentSize * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // 2. 반짝반짝 4-Point 황금 십자별 (✦ Starburst)
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -currentSize);
      ctx.quadraticCurveTo(0, 0, currentSize * 0.28, 0);
      ctx.quadraticCurveTo(0, 0, 0, currentSize);
      ctx.quadraticCurveTo(0, 0, -currentSize * 0.28, 0);
      ctx.quadraticCurveTo(0, 0, 0, -currentSize);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-currentSize, 0);
      ctx.quadraticCurveTo(0, 0, 0, currentSize * 0.28);
      ctx.quadraticCurveTo(0, 0, currentSize, 0);
      ctx.quadraticCurveTo(0, 0, 0, -currentSize * 0.28);
      ctx.quadraticCurveTo(0, 0, -currentSize, 0);
      ctx.closePath();
      ctx.fill();

      // 3. 별 중심부 화이트 다이아몬드 코어 글린트
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1, currentSize * 0.32), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  // ========================================================
  // 👩‍🏫 선생님 전용 황금빛 반짝반짝 후광 아우라 렌더러
  // ========================================================
  renderTeacherGoldenAura(px, py, now) {
    this.ctx.save();

    const cx = px + 12;
    const cy = py + 4; // 캐릭터 몸통 중심

    // 1. 은은하게 호흡하는 황금빛 펄스 후광 글로우 (Soft Pulsing Radiant Glow)
    const pulse = Math.sin(now / 360) * 3;
    const glowRadius = 28 + pulse;
    const grad = this.ctx.createRadialGradient(cx, cy, 4, cx, cy, glowRadius);
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.58)'); // 화사한 골드빛
    grad.addColorStop(0.45, 'rgba(245, 158, 11, 0.32)'); // 따뜻한 앰버 골드
    grad.addColorStop(1, 'rgba(217, 119, 6, 0)');        // 자연스러운 페이드아웃
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. 반짝반짝 회전하는 황금 십자별 파티클 (Twinkling Sparkle Starbursts ✦)
    const starCount = 6;
    for (let i = 0; i < starCount; i++) {
      const angle = (now / 1400) + (i * Math.PI * 2 / starCount);
      const rx = 19 + Math.sin(now / 450 + i * 2) * 5;
      const ry = 23 + Math.cos(now / 550 + i * 2) * 5;
      const sx = cx + Math.cos(angle) * rx;
      const sy = cy + Math.sin(angle) * ry;

      // 트윙클 애니메이션 (크기 & 투명도 숨쉬기)
      const twinkle = Math.sin(now / 220 + i * 1.8);
      const alpha = Math.max(0.25, 0.55 + twinkle * 0.45);
      const size = 3 + Math.abs(twinkle) * 3.2;

      // 4포인트 십자 반짝이 (✦)
      this.ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.moveTo(sx, sy - size);
      this.ctx.lineTo(sx + size * 0.35, sy);
      this.ctx.lineTo(sx, sy + size);
      this.ctx.lineTo(sx - size * 0.35, sy);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.moveTo(sx - size, sy);
      this.ctx.lineTo(sx, sy + size * 0.35);
      this.ctx.lineTo(sx + size, sy);
      this.ctx.lineTo(sx, sy - size * 0.35);
      this.ctx.closePath();
      this.ctx.fill();

      // 별 중심부 반짝이는 화이트 보석 코어
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.fillRect(sx - 1, sy - 1, 2, 2);
    }

    // 3. 위로 솟아오르는 황금 미세 글리터 입자 (Upward Rising Gold Glitters)
    for (let j = 0; j < 5; j++) {
      const phase = ((now * 0.045 + j * 55) % 100) / 100;
      const gx = cx - 14 + ((j * 9 + Math.sin(now / 400 + j) * 8 + 20) % 28);
      const gy = (py + 24) - phase * 36;
      const gAlpha = Math.sin(phase * Math.PI) * 0.8;
      this.ctx.fillStyle = `rgba(253, 224, 71, ${gAlpha})`;
      this.ctx.fillRect(gx, gy, 2, 2);
    }

    this.ctx.restore();
  }

  renderChatBubble(x, y, text) {
    this.ctx.save();
    this.ctx.font = '800 13px "Pretendard", "Malgun Gothic", sans-serif';
    const textWidth = this.ctx.measureText(text).width;
    const bubbleWidth = textWidth + 20;
    const bubbleHeight = 24;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.roundRect(x - bubbleWidth / 2, y - bubbleHeight, bubbleWidth, bubbleHeight, 8);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#0f172a';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x, y - bubbleHeight / 2 + 0.5);
    this.ctx.restore();
  }

  // ========================================================
  // OUTDOOR SPECTATOR BLEACHERS RENDERING (야외 스탠드 관람석)
  // ========================================================
  drawHighResBleachers(sx, sy, sw, sh) {
    this.ctx.save();

    // Bleacher Concrete Base Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    this.ctx.fillRect(sx - 4, sy - 2, sw + 8, sh + 8);

    // 5 Tiered Concrete Stadium Steps
    const tiers = 5;
    const tierH = sh / (tiers + 1);

    const stepColors = ['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];
    const seatColors = ['#1e3a8a', '#1d4ed8', '#15803d', '#16a34a', '#b45309'];

    for (let i = 0; i < tiers; i++) {
      const ty = sy + i * tierH;
      this.ctx.fillStyle = stepColors[i % stepColors.length];
      this.ctx.fillRect(sx, ty, sw, tierH);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.fillRect(sx, ty, sw, 2);

      const seatY = ty + 4;
      const seatH = tierH - 8;
      for (let bx = sx + 16; bx < sx + sw - 16; bx += 36) {
        if (Math.abs(bx - (sx + sw / 2)) < 50) continue;
        if (Math.abs(bx - (sx + sw / 4)) < 24) continue;
        if (Math.abs(bx - (sx + (sw * 3) / 4)) < 24) continue;

        this.ctx.fillStyle = seatColors[i % seatColors.length];
        this.ctx.beginPath();
        this.ctx.roundRect(bx, seatY, 28, seatH, 4);
        this.ctx.fill();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(bx + 2, seatY + 1, 24, 2);
      }
    }

    // Center Grandstand Canopy / Awning
    const canopyW = 20 * 32;
    const canopyH = 6 * 32;
    const canopyX = sx + (sw - canopyW) / 2;
    const canopyY = sy - 14;

    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.ctx.beginPath();
    this.ctx.roundRect(canopyX, canopyY, canopyW, canopyH, 8);
    this.ctx.fill();
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(canopyX + 10, canopyY + canopyH, 6, sh - canopyH);
    this.ctx.fillRect(canopyX + canopyW - 16, canopyY + canopyH, 6, sh - canopyH);

    this.drawSharpLabel(sx + sw / 2, sy - 18, '🏫 숭실 야외 스탠드 관람석', {
      bgColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#fbbf24',
      textColor: '#fef08a',
      fontSize: 13,
      paddingX: 14,
      height: 24
    });

    this.ctx.restore();
  }

  // ========================================================
  // SOCCER BOSS RAID ARENA (축구장 서쪽 골대 앞 신규 보스 레이드 장소)
  // ========================================================
  drawSoccerBossArena(bx, by, boss) {
    this.ctx.save();
    const now = Date.now();
    const pulse = 0.7 + Math.sin(now / 180) * 0.3;
    const rot = now / 1200;

    // Draw Active Boss Sprite
    const bCfg = (window.BOSS_CONFIG && window.BOSS_CONFIG.active) ? window.BOSS_CONFIG : boss;
    const bName = ((bCfg && bCfg.name) || boss.name || '').toLowerCase();

    // Dynamically scale arena magic circle and prompt offset depending on boss scale
    let arenaRadius = 78;
    let promptOffsetY = 48;
    if (bName.includes('나태') || bName.includes('거인') || bName.includes('sloth')) {
      arenaRadius = 126; // 2.0x Sloth Titan
      promptOffsetY = 88;
    } else if (bName.includes('파멸신') || bName.includes('기말고사') || bName.includes('final')) {
      arenaRadius = 96;  // 1.4x Final Exam God of Ruin
      promptOffsetY = 74;
    } else if (bName.includes('드래곤') || bName.includes('dragon')) {
      arenaRadius = 104; // 1.5x Ancient Bronze Dragon
      promptOffsetY = 82;
    }

    // Sacred Magic Circle
    this.ctx.save();
    this.ctx.translate(bx, by);

    this.ctx.strokeStyle = `rgba(250, 204, 21, ${pulse})`;
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, arenaRadius, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(234, 88, 12, 0.18)';
    this.ctx.fill();

    this.ctx.rotate(rot);
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    for (let r = 0; r < 8; r++) {
      const ang = (r * Math.PI) / 4;
      this.ctx.moveTo(Math.cos(ang) * (arenaRadius * 0.6), Math.sin(ang) * (arenaRadius * 0.6));
      this.ctx.lineTo(Math.cos(ang) * (arenaRadius * 0.94), Math.sin(ang) * (arenaRadius * 0.94));
    }
    this.ctx.stroke();

    for (let r = 0; r < 6; r++) {
      const ang = (r * Math.PI) / 3;
      this.ctx.fillStyle = '#fef08a';
      this.ctx.beginPath();
      this.ctx.arc(Math.cos(ang) * (arenaRadius * 0.78), Math.sin(ang) * (arenaRadius * 0.78), 3.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();

    if (bName.includes('대마왕') || bName.includes('중간고사') || bName.includes('demon') || bName.includes('마왕')) {
      this.drawHighResBossDemon(boss);
    } else if (bName.includes('케르베로스') || bName.includes('수행평가') || bName.includes('cerberus')) {
      this.drawHighResBossCerberus(boss);
    } else if (bName.includes('파멸신') || bName.includes('기말고사') || bName.includes('final')) {
      this.drawHighResBossFinalGod(boss);
    } else if (bName.includes('나태') || bName.includes('거인') || bName.includes('sloth')) {
      this.drawHighResBossSlothTitan(boss);
    } else {
      this.drawHighResBossDragon(boss);
    }

    const promptText = (boss && boss.prompt) ? boss.prompt : '⚔️ [SPACE: 청동 드래곤 레이드 도전]';
    this.drawSharpLabel(bx, by + promptOffsetY, promptText.includes('SPACE') ? promptText : `⚔️ [SPACE: ${promptText}]`, {
      bgColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: '#ef4444',
      textColor: '#ffffff',
      fontSize: 11,
      paddingX: 10,
      height: 20
    });

    this.ctx.restore();
  }

  // ========================================================
  // NEW FUTSAL COURT RENDERING (신규 인조잔디 풋살장)
  // 위치: x: 61 ~ 87, y: 30 ~ 50
  // ========================================================
  drawHighResFutsalCourt(fx, fy, fw, fh) {
    this.ctx.save();

    this.ctx.fillStyle = '#064e3b';
    this.ctx.fillRect(fx - 10, fy - 8, fw + 20, fh + 16);

    this.ctx.fillStyle = '#059669';
    this.ctx.fillRect(fx, fy, fw, fh);

    for (let s = 0; s < fw; s += 64) {
      this.ctx.fillStyle = ((s / 64) % 2 === 0) ? '#047857' : '#10b981';
      this.ctx.fillRect(fx + s, fy, 64, fh);
    }

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeRect(fx, fy, fw, fh);

    const fMidX = fx + fw / 2;
    const fMidY = fy + fh / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(fMidX, fy);
    this.ctx.lineTo(fMidX, fy + fh);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(fMidX, fMidY, 50, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(fMidX, fMidY, 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(fx, fMidY, 90, -Math.PI / 2, Math.PI / 2);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(fx + fw, fMidY, 90, Math.PI / 2, Math.PI * 1.5);
    this.ctx.stroke();

    this.drawHighResGoalPost(fx, fMidY - 45, true);
    this.drawHighResGoalPost(fx + fw, fMidY - 45, false);

    this.drawSharpLabel(fMidX, fMidY + 44, '⚽ 숭실 인조잔디 풋살장', {
      bgColor: 'rgba(5, 150, 105, 0.94)',
      borderColor: '#6ee7b7',
      textColor: '#ffffff',
      fontSize: 13,
      paddingX: 12,
      height: 24
    });

    this.ctx.restore();
  }

  // ========================================================
  // FUTSAL MONSTERS ROAMING & RENDERING LOGIC
  // ========================================================
  updateFutsalMonsters() {
    if (!this.player || this.player.room !== 'playground') return;
    const pg = WORLD_DATA.playground;
    if (!pg || !pg.futsalMonsters) return;

    const now = Date.now();
    for (const mob of pg.futsalMonsters) {
      if (mob.defeated) {
        if (mob.respawnAt && now >= mob.respawnAt) {
          mob.defeated = false;
          mob.hp = mob.maxHp;
          if (mob.fixed) {
            mob.x = 63;
            mob.y = 40;
          } else {
            mob.x = Math.round(66 + Math.random() * 18);
            mob.y = Math.round(33 + Math.random() * 14);
            mob.targetX = mob.x;
            mob.targetY = mob.y;
          }
        }
        continue;
      }

      if (mob.inBattle) continue;

      if (mob.fixed) {
        mob.x = 63;
        mob.y = 40;
        continue;
      }

      if (mob.roam) {
        if (mob.targetX === undefined || mob.targetY === undefined) {
          mob.targetX = mob.x;
          mob.targetY = mob.y;
          mob.nextMoveTime = now + 1000 + Math.random() * 2000;
        }

        const dx = mob.targetX - mob.x;
        const dy = mob.targetY - mob.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 0.1) {
          mob.x = mob.targetX;
          mob.y = mob.targetY;
          if (now >= (mob.nextMoveTime || 0)) {
            mob.targetX = Math.round((66 + Math.random() * 18) * 10) / 10;
            mob.targetY = Math.round((33 + Math.random() * 14) * 10) / 10;
            mob.nextMoveTime = now + 2500 + Math.random() * 3500;
          }
        } else {
          const step = 0.014;
          mob.x += (dx / dist) * Math.min(dist, step);
          mob.y += (dy / dist) * Math.min(dist, step);
        }
      }
    }
  }

  renderFutsalMonsters() {
    const pg = WORLD_DATA.playground;
    if (!pg || !pg.futsalMonsters) return;

    const now = Date.now();
    for (const mob of pg.futsalMonsters) {
      if (mob.defeated) continue;

      const floatY = Math.sin((now + mob.x * 200) / 200) * 3;
      const px = mob.x * 32;
      const py = mob.y * 32 + floatY;

      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      this.ctx.beginPath();
      this.ctx.ellipse(px + 16, mob.y * 32 + 28, 14, 6, 0, 0, Math.PI * 2);
      this.ctx.fill();

      if (mob.avatar === 'tackle_goblin') {
        this.drawTackleGoblin(px, py, now);
      } else if (mob.avatar === 'flame_striker') {
        this.drawFlameStriker(px, py, now);
      } else if (mob.avatar === 'spider_keeper') {
        this.drawSpiderKeeper(px, py, now);
      }

      const hpW = 42;
      const hpH = 6;
      const hpX = px + 16 - hpW / 2;
      const hpY = py - 14;
      const hpPct = Math.max(0, Math.min(1, mob.hp / mob.maxHp));

      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      this.ctx.fillRect(hpX - 1, hpY - 1, hpW + 2, hpH + 2);
      this.ctx.fillStyle = '#dc2626';
      this.ctx.fillRect(hpX, hpY, hpW, hpH);
      this.ctx.fillStyle = hpPct > 0.5 ? '#16a34a' : (hpPct > 0.25 ? '#f59e0b' : '#ef4444');
      this.ctx.fillRect(hpX, hpY, hpW * hpPct, hpH);

      const isElite = (mob.type === 'elite');
      this.drawSharpLabel(px + 16, mob.y * 32 + 40, `${mob.icon} ${mob.name}`, {
        bgColor: isElite ? 'rgba(127, 29, 29, 0.95)' : 'rgba(30, 41, 59, 0.92)',
        borderColor: isElite ? '#f59e0b' : '#34d399',
        textColor: isElite ? '#fef08a' : '#ffffff',
        fontSize: isElite ? 11.5 : 10.5,
        paddingX: 8,
        height: 20
      });
    }
  }

  // Futsal: Tackle Goblin
  drawTackleGoblin(px, py, now) {
    this.ctx.save();
    this.ctx.fillStyle = '#16a34a';
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 10, 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.moveTo(px + 8, py + 10);
    this.ctx.lineTo(px + 2, py + 6);
    this.ctx.lineTo(px + 8, py + 14);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.moveTo(px + 24, py + 10);
    this.ctx.lineTo(px + 30, py + 6);
    this.ctx.lineTo(px + 24, py + 14);
    this.ctx.fill();

    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(px + 9, py + 6, 14, 3);

    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px + 12, py + 9, 2.5, 2.5);
    this.ctx.fillRect(px + 17, py + 9, 2.5, 2.5);

    this.ctx.fillStyle = '#2563eb';
    this.ctx.fillRect(px + 10, py + 18, 12, 10);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 7px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('10', px + 16, py + 25);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px + 11, py + 27, 4, 4);
    this.ctx.fillRect(px + 17, py + 27, 4, 4);
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px + 10, py + 30, 5, 2);
    this.ctx.fillRect(px + 17, py + 30, 5, 2);

    const ballX = px + 26;
    const ballY = py + 24 + Math.sin(now / 150) * 3;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(ballX - 1.5, ballY - 1.5, 3, 3);
    this.ctx.restore();
  }

  // Futsal: Flame Striker
  drawFlameStriker(px, py, now) {
    this.ctx.save();
    const flicker = Math.sin(now / 80) * 3;
    this.ctx.fillStyle = '#ea580c';
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 16 + flicker, 15, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#f59e0b';
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 16, 11, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#fef08a';
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 15, 7, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px + 12, py + 13, 3, 2);
    this.ctx.fillRect(px + 17, py + 13, 3, 2);

    const rot = now / 140;
    const fbX = px + 16 + Math.cos(rot) * 18;
    const fbY = py + 20 + Math.sin(rot) * 8;
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(fbX, fbY, 7, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#fef08a';
    this.ctx.beginPath();
    this.ctx.arc(fbX, fbY, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  // Futsal: Spider Keeper
  drawSpiderKeeper(px, py, now) {
    this.ctx.save();
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px + 3, py + 8, 26, 22);
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(px + 5, py + 10, 22, 18);

    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 16, 20, 0, Math.PI * 2);
    this.ctx.stroke();

    for (let w = 0; w < 4; w++) {
      const wAng = (w * Math.PI) / 4;
      this.ctx.beginPath();
      this.ctx.moveTo(px + 16 - Math.cos(wAng) * 20, py + 16 - Math.sin(wAng) * 20);
      this.ctx.lineTo(px + 16 + Math.cos(wAng) * 20, py + 16 + Math.sin(wAng) * 20);
      this.ctx.stroke();
    }

    const gloveWave = Math.sin(now / 150) * 2;
    this.ctx.fillStyle = '#facc15';
    this.ctx.fillRect(px - 4, py + 12 + gloveWave, 8, 12);
    this.ctx.strokeStyle = '#d97706';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(px - 4, py + 12 + gloveWave, 8, 12);

    this.ctx.fillStyle = '#facc15';
    this.ctx.fillRect(px + 28, py + 12 - gloveWave, 8, 12);
    this.ctx.strokeRect(px + 28, py + 12 - gloveWave, 8, 12);

    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(px + 9, py + 14, 14, 3);
    this.ctx.restore();
  }

  // ========================================================
  // HIGH-RES INDOOR WATER PURIFIER (복도 정수기)
  // ========================================================
  drawHighResWaterPurifier(px, py) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.beginPath();
    this.ctx.ellipse(px + 16, py + 30, 16, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    const bx = px + 4;
    const by = py - 4;
    const bw = 24;
    const bh = 34;

    this.ctx.fillStyle = '#f1f5f9';
    this.ctx.fillRect(bx, by, bw, bh);
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(bx, by, bw, bh);

    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.fillRect(bx + 1, by + 1, 4, bh - 2);

    const tankY = by - 10;
    this.ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
    this.ctx.beginPath();
    this.ctx.roundRect(bx + 3, tankY, bw - 6, 12, [6, 6, 2, 2]);
    this.ctx.fill();
    this.ctx.strokeStyle = '#0284c7';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.fillRect(bx + 5, tankY + 2, 3, 7);
    this.ctx.fillRect(bx + 14, tankY + 4, 2, 2);

    const alcoveX = bx + 4;
    const alcoveY = by + 7;
    const alcoveW = bw - 8;
    const alcoveH = 14;
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(alcoveX, alcoveY, alcoveW, alcoveH);

    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillRect(alcoveX + 3, alcoveY + 1, 3, 5);
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(alcoveX + alcoveW - 6, alcoveY + 1, 3, 5);

    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(alcoveX + 1, alcoveY + alcoveH - 3, alcoveW - 2, 3);

    this.ctx.fillStyle = '#4ade80';
    this.ctx.beginPath();
    this.ctx.arc(bx + 8, by + 4, 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#38bdf8';
    this.ctx.beginPath();
    this.ctx.arc(bx + 16, by + 4, 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.drawSharpLabel(px + 16, py - 22, '🚰 복도 정수기', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#38bdf8',
      textColor: '#e0f2fe',
      fontSize: 11.5,
      paddingX: 8,
      height: 20
    });

    this.ctx.restore();
  }

  // High-Res Hallway Full-length Mirror (복도 전신 거울 이스터에그 - 왼쪽 복도를 바라보는 각도)
  drawHighResMirror(px, py) {
    this.ctx.save();

    // 1. Shadow under the mirror stand (slanted towards bottom-left)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.beginPath();
    this.ctx.ellipse(px + 14, py + 29, 17, 6, -0.15, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Wooden Easel / Pivot Stand (왼쪽을 향해 기울어진 이젤 거울 지지대)
    // 뒷면 대각 지지대 다리 (오른쪽 바닥으로 뻗어나감)
    this.ctx.strokeStyle = '#38200f';
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 17, py + 4);
    this.ctx.lineTo(px + 28, py + 29);
    this.ctx.stroke();

    this.ctx.strokeStyle = '#5c3a21';
    this.ctx.lineWidth = 2.2;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 17, py + 4);
    this.ctx.lineTo(px + 28, py + 29);
    this.ctx.stroke();

    // 바닥 수평 발 지지대
    this.ctx.fillStyle = '#422a16';
    this.ctx.fillRect(px + 3, py + 27, 27, 3.5);
    this.ctx.fillStyle = '#5c3a21';
    this.ctx.fillRect(px + 3, py + 27, 27, 1.2);

    // 수직 사이드 지지 기둥
    this.ctx.fillStyle = '#5c3a21';
    this.ctx.fillRect(px + 15, py - 6, 4, 34);
    this.ctx.strokeStyle = '#38200f';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(px + 15, py - 6, 4, 34);

    // 3. Mirror Body (왼쪽 복도를 향해 3/4 각도로 회전된 전신 거울)
    // 거울 원목 프레임 외곽 (왼쪽으로 비스듬히 기울어진 원목 테두리)
    const fx = px + 4;
    const fy = py - 20;
    const fw = 18;
    const fh = 45;

    // 목재 프레임 백보드 (두께감 표현)
    this.ctx.fillStyle = '#4a2c11';
    this.ctx.beginPath();
    this.ctx.roundRect(fx + 3, fy - 1, fw - 1, fh, [4, 6, 4, 2]);
    this.ctx.fill();

    // 메인 목재 프레임 (마호가니 브라운)
    this.ctx.fillStyle = '#8b5a2b';
    this.ctx.beginPath();
    this.ctx.roundRect(fx, fy, fw, fh, [5, 4, 3, 5]);
    this.ctx.fill();
    this.ctx.strokeStyle = '#3e1f08';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // 골드/황동 안쪽 몰딩 라인
    this.ctx.strokeStyle = '#d4af37';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(fx + 2, fy + 2, fw - 5, fh - 4);

    // 4. Mirror Glass Surface (왼쪽을 바라보는 반사 유리)
    const glassX = fx + 3;
    const glassY = fy + 3;
    const glassW = fw - 7;
    const glassH = fh - 6;

    const grad = this.ctx.createLinearGradient(glassX, glassY, glassX + glassW, glassY + glassH);
    grad.addColorStop(0, '#e0f2fe');
    grad.addColorStop(0.25, '#bae6fd');
    grad.addColorStop(0.65, '#38bdf8');
    grad.addColorStop(1, '#e0f2fe');

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(glassX, glassY, glassW, glassH);

    // 유리 반사 광택 (왼쪽에서 들어오는 복도 빛을 반사하는 대각선 셰인)
    if (this.ctx.clip) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(glassX, glassY, glassW, glassH);
      this.ctx.clip();

      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      this.ctx.beginPath();
      this.ctx.moveTo(glassX - 4, glassY + 10);
      this.ctx.lineTo(glassX + 8, glassY - 2);
      this.ctx.lineTo(glassX + 12, glassY - 2);
      this.ctx.lineTo(glassX, glassY + 15);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.beginPath();
      this.ctx.moveTo(glassX - 2, glassY + 24);
      this.ctx.lineTo(glassX + 10, glassY + 10);
      this.ctx.lineTo(glassX + 13, glassY + 10);
      this.ctx.lineTo(glassX + 2, glassY + 27);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
    } else {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.fillRect(glassX + 1, glassY + 2, 2.5, glassH - 4);
    }

    // 황동 피벗 회전 노브 (프레임과 지지대 연결 축)
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.beginPath();
    this.ctx.arc(px + 17, py + 3, 3, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#b45309';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // 5. Sparkle glint on the reflective left edge
    const pulse = Math.sin(Date.now() / 280) * 0.35 + 0.65;
    this.ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
    const sx = glassX + 2;
    const sy = glassY + 3;
    this.ctx.beginPath();
    this.ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
    this.ctx.fill();

    // 6. Floating Name Label
    this.drawSharpLabel(px + 14, py - 34, '🪞 복도 전신 거울', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: 'rgba(56, 189, 248, 0.85)',
      textColor: '#e0f2fe',
      fontSize: 11.5,
      paddingX: 8,
      height: 20
    });

    this.ctx.restore();
  }

  // High-Res Dibut Repair Cabinet (6층 복도 디벗 5단 스마트 수리/보관함)
  drawHighResDibutCabinet(px, py) {
    this.ctx.save();

    const w = 36;
    const h = 58;
    const bx = px - 2;
    const by = py - 24;

    // 1. Soft Floor Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    this.ctx.beginPath();
    this.ctx.ellipse(px + 16, by + h + 2, 20, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Heavy-duty Rubber & Steel Base Feet
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(bx + 4, by + h - 2, 6, 4);
    this.ctx.fillRect(bx + w - 10, by + h - 2, 6, 4);
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(bx + 4, by + h, 6, 2);
    this.ctx.fillRect(bx + w - 10, by + h, 6, 2);

    // 3. Main Cabinet Chassis (Industrial Tech Metal Locker)
    this.ctx.fillStyle = '#090d16';
    this.ctx.beginPath();
    this.ctx.roundRect(bx, by, w, h - 2, [4, 4, 2, 2]);
    this.ctx.fill();

    this.ctx.fillStyle = '#1e293b';
    this.ctx.beginPath();
    this.ctx.roundRect(bx + 1.5, by + 1.5, w - 3, h - 5, [3, 3, 1, 1]);
    this.ctx.fill();

    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // 4. Side Ventilation Louvers (좌우 공기 순환 루버 그릴)
    this.ctx.fillStyle = '#0f172a';
    for (let vi = 0; vi < 4; vi++) {
      this.ctx.fillRect(bx + 2, by + 16 + vi * 8, 1.5, 4);
      this.ctx.fillRect(bx + w - 3.5, by + 16 + vi * 8, 1.5, 4);
    }

    // 5. Header Display Panel (스마트 디벗 스테이션 LCD & 시스템 상태)
    const headH = 10;
    this.ctx.fillStyle = '#0c4a6e';
    this.ctx.fillRect(bx + 3, by + 3, w - 6, headH);
    this.ctx.strokeStyle = '#0284c7';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(bx + 3, by + 3, w - 6, headH);

    // Mini LCD Screen shine
    this.ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    this.ctx.fillRect(bx + 4, by + 4, (w - 8) * 0.6, 2);

    // Mini tablet icon on LCD
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillRect(bx + 5, by + 5, 4, 6);
    this.ctx.fillStyle = '#0c4a6e';
    this.ctx.fillRect(bx + 6, by + 6, 2, 4);

    // LCD text dot lines
    this.ctx.fillStyle = '#bae6fd';
    this.ctx.fillRect(bx + 11, by + 6, 11, 1.5);
    this.ctx.fillRect(bx + 11, by + 9, 7, 1.5);

    // Main Power / System Online LED (Emerald pulse)
    this.ctx.fillStyle = '#22c55e';
    this.ctx.beginPath();
    this.ctx.arc(bx + w - 7, by + 7, 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#86efac';
    this.ctx.fillRect(bx + w - 7.5, by + 6.5, 1, 1);

    // 6. Distinct 5-Tier Repair & Storage Compartments (5단 수납/수리 도어)
    const startY = by + 15;
    const tierH = 7.5;
    const tierGap = 0.5;
    const tierColors = [
      { led: '#22c55e', ledGlow: 'rgba(34, 197, 94, 0.5)', tag: '1', tablet: '#0284c7' }, // 1단: 충전 완료
      { led: '#22c55e', ledGlow: 'rgba(34, 197, 94, 0.5)', tag: '2', tablet: '#0284c7' }, // 2단: 충전 완료
      { led: '#f59e0b', ledGlow: 'rgba(245, 158, 11, 0.5)', tag: '3', tablet: '#d97706' }, // 3단: 수리 점검중
      { led: '#38bdf8', ledGlow: 'rgba(56, 189, 248, 0.5)', tag: '4', tablet: '#2563eb' }, // 4단: 진단중
      { led: '#22c55e', ledGlow: 'rgba(34, 197, 94, 0.5)', tag: '5', tablet: '#0284c7' }, // 5단: 대기 완료
    ];

    for (let i = 0; i < 5; i++) {
      const ty = startY + i * (tierH + tierGap);
      const conf = tierColors[i];

      // Shelf Divider Line (단 분할 메탈 바)
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(bx + 2, ty - 1, w - 4, 1);

      // Drawer Compartment Face (다크 아크릴 & 브러시드 메탈)
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(bx + 3, ty, w - 6, tierH);

      // Inner Bay Slot (스마트 슬롯 베이)
      this.ctx.fillStyle = '#1e293b';
      this.ctx.fillRect(bx + 4, ty + 1, w - 8, tierH - 2);

      // Docked Dibut Tablet profile (태블릿 슬롯 삽입 실루엣)
      this.ctx.fillStyle = conf.tablet;
      this.ctx.fillRect(bx + 5, ty + 2.5, 12, 3);
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(bx + 6, ty + 3, 10, 2);

      // Chrome Drawer Handle (메탈 핸들)
      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.fillRect(bx + 19, ty + 2.5, 6, 2.5);
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.fillRect(bx + 19, ty + 4, 6, 1);

      // Individual Tier Status LED (5단 개별 상태 인디케이터)
      this.ctx.fillStyle = conf.ledGlow;
      this.ctx.beginPath();
      this.ctx.arc(bx + w - 7, ty + 3.5, 2.5, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = conf.led;
      this.ctx.beginPath();
      this.ctx.arc(bx + w - 7, ty + 3.5, 1.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Tier Number etched on door (1단~5단 번호)
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.font = 'bold 5.5px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(conf.tag, bx + 27, ty + 3.8);
    }

    // 7. Prominent Floating Sharp Label
    this.drawSharpLabel(px + 16, by - 12, '📱 디벗 수리함', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#38bdf8',
      textColor: '#e0f2fe',
      fontSize: 11.5,
      paddingX: 8,
      height: 20
    });

    this.ctx.restore();
  }

  // High-Res Recycle Bin Station (6층 복도 분리수거함 - 가로 4배 대형 4구 분리배출 스테이션)
  drawHighResRecycleBin(px, py) {
    this.ctx.save();

    const w = 168; // 가로 4배 확장 (42 -> 168)
    const h = 46;
    const bx = px - 4;
    const by = py - 14;

    // 1. 바닥 넓은 부드러운 그림자
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.beginPath();
    this.ctx.ellipse(bx + w / 2, by + h + 2, w / 2 + 6, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. 바닥 고무 & 스틸 지지대 다리 (4개 구역 균등 배치)
    const legPositions = [bx + 8, bx + 50, bx + 104, bx + w - 16];
    for (const lx of legPositions) {
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(lx, by + h - 2, 8, 4);
      this.ctx.fillStyle = '#334155';
      this.ctx.fillRect(lx, by + h, 8, 2);
    }

    // 3. 메인 스테인리스 스틸 캐비닛 몸체 (수평 와이드 브러시드 메탈 그라데이션)
    const metalGrad = this.ctx.createLinearGradient(bx, by, bx + w, by);
    metalGrad.addColorStop(0, '#64748b');
    metalGrad.addColorStop(0.12, '#94a3b8');
    metalGrad.addColorStop(0.28, '#cbd5e1');
    metalGrad.addColorStop(0.5, '#f1f5f9');
    metalGrad.addColorStop(0.72, '#cbd5e1');
    metalGrad.addColorStop(0.88, '#94a3b8');
    metalGrad.addColorStop(1, '#475569');

    this.ctx.fillStyle = metalGrad;
    this.ctx.beginPath();
    if (typeof this.ctx.roundRect === 'function') {
      this.ctx.roundRect(bx, by, w, h - 2, [5, 5, 2, 2]);
    } else {
      this.ctx.rect(bx, by, w, h - 2);
    }
    this.ctx.fill();

    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 1.4;
    this.ctx.stroke();

    // 은은한 스테인리스 헤어라인 질감 라인
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 0.8;
    this.ctx.beginPath();
    this.ctx.moveTo(bx + 4, by + 19);
    this.ctx.lineTo(bx + w - 4, by + 19);
    this.ctx.stroke();

    // 4. 상단 후드 인테이크 베벨 (어두운 투입구 상판)
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(bx + 2, by + 2, w - 4, 15);
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(bx + 2, by + 2, w - 4, 15);

    // 5. 4대 전용 분리배출 구역 (캔·병류 / 플라스틱 / 종이류 / 일반쓰레기)
    const sectionW = (w - 8) / 4; // 160 / 4 = 40px each
    const slots = [
      { ring: '#38bdf8', label: '캔·병류', icon: '🥫', sub: 'CAN/BOTTLE' },
      { ring: '#4ade80', label: '플라스틱', icon: '🥤', sub: 'PLASTIC' },
      { ring: '#fbbf24', label: '종이류', icon: '📦', sub: 'PAPER' },
      { ring: '#94a3b8', label: '일반쓰레기', icon: '🗑️', sub: 'TRASH' }
    ];

    for (let i = 0; i < 4; i++) {
      const secX = bx + 4 + i * sectionW;
      const s = slots[i];

      // 상단 투입구 슬롯
      const slotW = sectionW - 8;
      const slotH = 9;
      const slotX = secX + 4;
      const slotY = by + 5;

      this.ctx.fillStyle = '#090d16';
      this.ctx.fillRect(slotX, slotY, slotW, slotH);

      this.ctx.strokeStyle = s.ring;
      this.ctx.lineWidth = 1.2;
      this.ctx.strokeRect(slotX, slotY, slotW, slotH);

      // 슬롯 내부 색상 텍스트 (한글 명칭)
      this.ctx.fillStyle = s.ring;
      this.ctx.font = 'bold 7px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(s.label, slotX + slotW / 2, slotY + slotH / 2);

      // 하단 도어 분할 및 전면 패널 연출
      if (i > 0) {
        // 도어 간 세로 구분선
        this.ctx.strokeStyle = '#475569';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(secX, by + 18);
        this.ctx.lineTo(secX, by + h - 3);
        this.ctx.stroke();
      }

      // 각 도어의 손잡이
      this.ctx.fillStyle = '#1e293b';
      this.ctx.fillRect(secX + sectionW / 2 - 5, by + 30, 2, 7);
      this.ctx.fillRect(secX + sectionW / 2 + 3, by + 30, 2, 7);

      // 각 도어 중앙 아이콘 및 엠블럼
      this.ctx.font = '10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(s.icon, secX + sectionW / 2, by + 24);

      // 영문 서브 레이블
      this.ctx.fillStyle = '#475569';
      this.ctx.font = 'bold 5.5px sans-serif';
      this.ctx.fillText(s.sub, secX + sectionW / 2, by + 39);
    }

    // 6. 중앙 상단 초록색 ♻️ 에코 마크
    this.ctx.fillStyle = '#16a34a';
    this.ctx.font = 'bold 13px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('♻️', bx + w / 2, by + 25);

    // 7. 정중앙 상단 플로팅 라벨
    this.drawSharpLabel(bx + w / 2, by - 12, '♻️ 분리수거함', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#22c55e',
      textColor: '#86efac',
      fontSize: 12,
      paddingX: 10,
      height: 21
    });

    this.ctx.restore();
  }

  // ========================================================
  // 📚 SCENE RENDERING: 2층 도서관 (독립 전용 층, 20 x 20 타일)
  // ========================================================
  checkLibraryFloor2Collision(tileX, tileY) {
    // 20 x 20 boundaries:
    // ty <= 3: North wall (except elevator opening at tileX === 16, ty === 3)
    if (tileY < 3) return true;
    if (tileY === 3) {
      if (tileX === 16) return false; // elevator entry passable
      return true;
    }
    if (tileX <= 0 || tileX >= 19 || tileY >= 19) return true;

    // Librarian Counter & Reception:
    // Counter: x: 12..14, y: 5. Librarian stands at x: 13, y: 4
    if (tileX >= 12 && tileX <= 14 && (tileY === 4 || tileY === 5)) return true;

    // Book Search PC Station (spaced beside Dibut station): x: 8, y: 17
    if (tileX === 8 && tileY === 17) return true;

    // North-West Grand Bookshelves:
    // Lit bookshelf: x: 2..4, y: 4..5
    if (tileX >= 2 && tileX <= 4 && (tileY === 4 || tileY === 5)) return true;
    // Sci bookshelf: x: 7..9, y: 4..5
    if (tileX >= 7 && tileX <= 9 && (tileY === 4 || tileY === 5)) return true;

    // West Aisle Bookshelves (English & History):
    // English bookshelf: x: 2, y: 8..10
    if (tileX === 2 && tileY >= 8 && tileY <= 10) return true;
    // History bookshelf: x: 5, y: 8..10
    if (tileX === 5 && tileY >= 8 && tileY <= 10) return true;

    // South-West Arts Bookshelf: x: 2..4, y: 13..14
    if (tileX >= 2 && tileX <= 4 && (tileY === 13 || tileY === 14)) return true;

    // East Wall Bookshelves (Magazines & Comics):
    // Magazine bookshelf: x: 17..18, y: 9..10
    if ((tileX === 17 || tileX === 18) && (tileY === 9 || tileY === 10)) return true;
    // Comic bookshelf: x: 17..18, y: 13..14
    if ((tileX === 17 || tileX === 18) && (tileY === 13 || tileY === 14)) return true;

    // Central Wisdom Lectern: x: 10, y: 8
    if (tileX === 10 && tileY === 8) return true;

    // Central Reading Table (Oak study table with banker lamps): x: 8..12, y: 11
    // (Note: Chair tiles at y: 10 and y: 12 are PASSABLE so player can sit on them!)
    if (tileX >= 8 && tileX <= 12 && tileY === 11) return true;

    // Smart Dibut Station: x: 3..5, y: 17
    if (tileX >= 3 && tileX <= 5 && tileY === 17) return true;

    // Reading Armchairs: (16, 12) & (16, 16)
    if ((tileX === 16 && tileY === 12) || (tileX === 16 && tileY === 16)) return true;

    return false;
  }

  renderLibraryFloor2() {
    const mapW = this.getMapWidth(); // 20
    const mapH = this.getMapHeight(); // 20
    const ctx = this.ctx;

    // 1. Classical Warm Walnut Parquet Flooring & Boundary Walls
    for (let tx = 0; tx < mapW; tx++) {
      for (let ty = 0; ty < mapH; ty++) {
        if (ty <= 3 || tx === 0 || tx === mapW - 1 || ty === mapH - 1) {
          this.drawHighResWall(tx, ty, false);
        } else {
          // Warm polished parquet tiles
          const isAlt = (tx + ty) % 2 === 0;
          ctx.fillStyle = isAlt ? '#78350f' : '#854d0e';
          ctx.fillRect(tx * 32, ty * 32, 32, 32);

          // Subtle wood plank grain
          ctx.strokeStyle = 'rgba(69, 26, 3, 0.35)';
          ctx.lineWidth = 1;
          ctx.strokeRect(tx * 32, ty * 32, 32, 32);

          ctx.fillStyle = 'rgba(254, 243, 199, 0.04)';
          ctx.fillRect(tx * 32 + 2, ty * 32 + 2, 28, 14);
        }
      }
    }

    // 2. High Arched Stained Glass Windows on North Wall (tx: 4, 7, 10 at ty: 1)
    [4, 7, 10].forEach(col => {
      this.drawLibraryStainedGlassWindow(col * 32, 1 * 32);
    });

    // 3. Central Library Crest & Official Motto Plaque (cx: 10 * 32, cy: 26)
    this.drawSharpLabel(10 * 32, 26, '📖 숭실 도서관 — 지혜와 진리의 샘', {
      bgColor: '#0f172a',
      borderColor: '#38bdf8',
      textColor: '#bae6fd',
      fontSize: 12.5,
      paddingX: 14,
      height: 23
    });

    // 4. Central Royal Teal Reading Plaza Carpet Runner (tx: 7..13, ty: 7..13)
    ctx.fillStyle = '#064e3b'; // royal emerald teal
    ctx.fillRect(7 * 32 + 8, 7 * 32 + 8, 6 * 32 - 16, 6 * 32 - 16);
    ctx.strokeStyle = '#f59e0b'; // golden filigree border
    ctx.lineWidth = 2;
    ctx.strokeRect(7 * 32 + 8, 7 * 32 + 8, 6 * 32 - 16, 6 * 32 - 16);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(7 * 32 + 12, 7 * 32 + 12, 6 * 32 - 24, 6 * 32 - 24);

    // 5. Elevator at (16, 3)
    this.drawLibraryElevator(16 * 32, 3 * 32);

    // 6. Grand Bookshelves (장르별 7종 서가)
    // 6-A. [문학·철학 서가] 윤동주 시집 & 고전문학 (tx: 2..4, ty: 4)
    this.drawLibraryBookshelf(2 * 32, 4 * 32, 3, 'lit', '📚 [문학·철학]');
    // 6-B. [자연과학·연금 서가] 졍경슉 비전서 & 실험일지 (tx: 7..9, ty: 4)
    this.drawLibraryBookshelf(7 * 32, 4 * 32, 3, 'sci', '🔬 [자연과학·연금]');
    // 6-C. [외국어·어학 서가] Joshua 영단어 비법전서 (tx: 2, ty: 8..10)
    this.drawLibraryVerticalBookshelf(2 * 32, 8 * 32, 'eng', '🇬🇧 [외국어·어학]');
    // 6-D. [역사·사회 서가] 1897 숭실 독립사 & 인문 (tx: 5, ty: 8..10)
    this.drawLibraryVerticalBookshelf(5 * 32, 8 * 32, 'his', '📜 [역사·사회]');
    // 6-E. [예술·체육 서가] 명화 도록 & 스포츠 교본 (tx: 2..4, ty: 13)
    this.drawLibraryBookshelf(2 * 32, 13 * 32, 3, 'art', '🎨 [예술·체육]');
    // 6-F. [정기간행물 서가] 최신 과학 잡지 & 교지 (tx: 17..18, ty: 9)
    this.drawLibraryBookshelf(17 * 32, 9 * 32, 2, 'mag', '📰 [정기간행물]');
    // 6-G. [교양만화 서가] 세계 역사 & 과학 그래픽노블 (tx: 17..18, ty: 13)
    this.drawLibraryBookshelf(17 * 32, 13 * 32, 2, 'comic', '💬 [교양만화]');

    // 7. Central Wisdom Lectern (오늘의 지혜 명언 독서대 at tx: 10, ty: 8)
    this.drawLibraryWisdomLectern(10 * 32, 8 * 32);

    // 8. Central Reading Table with Chairs (가운데 앉을 수 있는 책상과 의자 at tx: 8..12, ty: 11)
    this.drawLibraryStudyTable(8 * 32, 11 * 32, 5);

    // 9. Smart Dibut Tablet Docking Station (스마트 디벗 거치대 존 at tx: 3..5, ty: 17)
    this.drawLibraryDibutStation(3 * 32, 17 * 32);

    // 10. Book Search PC Station (도서 검색기 컴퓨터 at tx: 8, ty: 17 디벗 단말기와 2칸 여유 간격)
    this.drawLibrarySearchPC(8 * 32, 17 * 32);

    // 11. Cozy Reading Armchairs & Side Tables (tx: 16, ty: 12 & ty: 16)
    this.drawLibraryArmchair(16 * 32, 12 * 32);
    this.drawLibraryArmchair(16 * 32, 16 * 32);

    // 12. Greenhouse Planters (만개목 at tx: 18, ty: 18)
    this.drawHighResHallwayPlant(1 * 32, 4 * 32, 'monstera', 3, 5);
    this.drawHighResHallwayPlant(18 * 32, 18 * 32 - 16, 'areca', 3, 5);

    // 13. Reception Counter at tx: 12..14, ty: 5 (in front of librarian)
    this.drawLibraryReceptionCounter(12 * 32, 5 * 32);

    // 14. Librarian Quest Marker & '쉿! 정숙!' Comic Popup
    this.renderLibrarianOverhead();
  }

  // High Arched Stained Glass Window with warm amber sunbeams streaming down
  drawLibraryStainedGlassWindow(px, py) {
    const ctx = this.ctx;
    ctx.save();

    // Arch Frame
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(px + 16, py + 12, 14, Math.PI, 0);
    ctx.rect(px + 2, py + 12, 28, 20);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Stained glass colored panes
    const colors = ['#38bdf8', '#818cf8', '#f472b6', '#34d399', '#fbbf24'];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(px + 5 + i * 6, py + 8 + (i % 2) * 6, 5, 14);
    }

    // Leaded glass divider grid
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 16, py);
    ctx.lineTo(px + 16, py + 32);
    ctx.moveTo(px + 2, py + 18);
    ctx.lineTo(px + 30, py + 18);
    ctx.stroke();

    // Translucent golden sunbeam ray streaming downwards onto parquet floor
    const grad = ctx.createLinearGradient(px + 16, py + 20, px + 36, py + 120);
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
    grad.addColorStop(1, 'rgba(254, 240, 138, 0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(px + 8, py + 24);
    ctx.lineTo(px + 24, py + 24);
    ctx.lineTo(px + 56, py + 120);
    ctx.lineTo(px - 10, py + 120);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Elevator Frame for Floor 2 Library
  drawLibraryElevator(px, py) {
    const ctx = this.ctx;
    ctx.save();

    const w = 48;
    const h = 54;
    const ex = px - 8;
    const ey = py - 18;

    // Outer Polished Bronze / Stainless Steel Architrave
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(ex, ey, w, h);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.strokeRect(ex, ey, w, h);

    // Inner Doorway Cavity
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(ex + 4, ey + 14, w - 8, h - 14);

    // Sliding Bronze Doors
    ctx.fillStyle = '#334155';
    ctx.fillRect(ex + 6, ey + 16, (w - 14) / 2, h - 18);
    ctx.fillRect(ex + 6 + (w - 14) / 2 + 2, ey + 16, (w - 14) / 2, h - 18);

    // Door seam & brass handles
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(ex + 6 + (w - 14) / 2 - 2, ey + 30, 2, 10);
    ctx.fillRect(ex + 6 + (w - 14) / 2 + 2, ey + 30, 2, 10);

    // Top Digital Display Badge: [ 2F 도서관 ]
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(ex + 6, ey + 3, w - 12, 9);
    ctx.fillStyle = '#f0f9ff';
    ctx.font = 'bold 6.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('2F 도서관 ▲', ex + w / 2, ey + 7.5);

    // Elevator Plaque Label
    this.drawSharpLabel(px + 16, ey - 10, '🛗 도서관 엘리베이터', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#38bdf8',
      textColor: '#bae6fd',
      fontSize: 11.5,
      paddingX: 8,
      height: 20
    });

    ctx.restore();
  }

  // 3-Tile Wide Double-Height Bookshelf (Literature / Science)
  drawLibraryBookshelf(px, py, widthTiles, type, label) {
    const ctx = this.ctx;
    ctx.save();

    const w = widthTiles * 32;
    const h = 56;
    const bx = px;
    const by = py - 24;

    // Floor shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(bx + w / 2, by + h + 2, w / 2 + 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Solid Mahogany Wooden Case
    ctx.fillStyle = '#3b1803';
    ctx.fillRect(bx, by, w, h);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, w, h);

    // Shelves (3 shelves)
    const shelfY = [by + 16, by + 32, by + 48];
    ctx.fillStyle = '#542306';
    shelfY.forEach(sy => ctx.fillRect(bx + 3, sy, w - 6, 4));

    // Books on shelves (rows of colorful book spines)
    let bookColors = ['#991b1b', '#1e3a8a', '#14532d', '#78350f', '#581c87', '#b45309'];
    let borderColor = '#f59e0b';
    if (type === 'lit') {
      bookColors = ['#991b1b', '#1e3a8a', '#14532d', '#78350f', '#581c87', '#b45309'];
      borderColor = '#f59e0b';
    } else if (type === 'sci') {
      bookColors = ['#047857', '#0369a1', '#d97706', '#0f766e', '#1d4ed8', '#0284c7'];
      borderColor = '#10b981';
    } else if (type === 'art') {
      bookColors = ['#7c3aed', '#c026d3', '#db2777', '#4f46e5', '#9333ea', '#ec4899'];
      borderColor = '#a855f7';
    } else if (type === 'mag') {
      bookColors = ['#0284c7', '#0d9488', '#ea580c', '#e11d48', '#2563eb', '#16a34a'];
      borderColor = '#06b6d4';
    } else if (type === 'comic') {
      bookColors = ['#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#f97316', '#3b82f6'];
      borderColor = '#f97316';
    }

    shelfY.forEach((sy, rowIdx) => {
      let curX = bx + 6;
      while (curX < bx + w - 10) {
        const bw = (type === 'mag') ? 6 : (4 + (curX % 3));
        const bh = (type === 'mag') ? 14 : (11 + ((curX + rowIdx) % 3));
        const color = bookColors[(curX + rowIdx * 2) % bookColors.length];
        ctx.fillStyle = color;
        ctx.fillRect(curX, sy - bh, bw, bh);

        // Gold title foil on spine
        ctx.fillStyle = (type === 'mag') ? '#ffffff' : 'rgba(254, 240, 138, 0.6)';
        ctx.fillRect(curX + 1, sy - bh + 2, bw - 2, 1.5);

        curX += bw + 1.5;
      }
    });

    if (type === 'lit') {
      // Rolling Brass Library Ladder leaned on left
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx + 8, by + 4);
      ctx.lineTo(bx + 4, by + h + 2);
      ctx.moveTo(bx + 16, by + 4);
      ctx.lineTo(bx + 12, by + h + 2);
      ctx.stroke();
      // Rungs
      for (let r = by + 12; r < by + h; r += 9) {
        ctx.beginPath();
        const t = (r - by) / h;
        const lx1 = (bx + 8) * (1 - t) + (bx + 4) * t;
        const lx2 = (bx + 16) * (1 - t) + (bx + 12) * t;
        ctx.moveTo(lx1, r);
        ctx.lineTo(lx2, r);
        ctx.stroke();
      }
    } else if (type === 'sci') {
      // Glassware / Armillary Sphere on top shelf
      // Glowing Alchemy Flask
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(bx + w - 16, by + 12, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(bx + w - 17, by + 6, 2, 4);

      // Brass Armillary Rings
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bx + w - 32, by + 11, 5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === 'art') {
      // Golden Music Clef / Palette Icon on top
      ctx.fillStyle = '#fef08a';
      ctx.font = '12px sans-serif';
      ctx.fillText('🎵', bx + w - 20, by + 14);
      ctx.fillText('🎨', bx + 6, by + 14);
    } else if (type === 'mag') {
      // Magazine slanted rack indicator
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px sans-serif';
      ctx.fillText('NEWS', bx + w / 2 - 14, by + 13);
    } else if (type === 'comic') {
      // Comic Pop star icon
      ctx.fillStyle = '#fbbf24';
      ctx.font = '11px sans-serif';
      ctx.fillText('✦', bx + w - 16, by + 13);
      ctx.fillText('COMIC', bx + 6, by + 13);
    }

    // Brass Label Badge
    this.drawSharpLabel(bx + w / 2, by - 12, label, {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: borderColor,
      textColor: '#fef08a',
      fontSize: 11.5,
      paddingX: 8,
      height: 20
    });

    ctx.restore();
  }

  // Vertical Bookshelf against West Wall (English & History)
  drawLibraryVerticalBookshelf(px, py, type, label) {
    const ctx = this.ctx;
    ctx.save();

    const w = 28;
    const h = 76;
    const bx = px + 2;
    const by = py - 16;

    // Floor shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(bx + w / 2, by + h + 2, w / 2 + 3, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden Frame
    ctx.fillStyle = '#3b1803';
    ctx.fillRect(bx, by, w, h);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, w, h);

    // Shelves
    const shelfY = [by + 20, by + 38, by + 56, by + 72];
    ctx.fillStyle = '#542306';
    shelfY.forEach(sy => ctx.fillRect(bx + 2, sy, w - 4, 3));

    // Books & Decor
    const colors = (type === 'his')
      ? ['#7f1d1d', '#991b1b', '#78350f', '#b45309', '#451a03']
      : ['#dc2626', '#2563eb', '#16a34a', '#d97706'];

    shelfY.forEach((sy, idx) => {
      let curX = bx + 4;
      while (curX < bx + w - 6) {
        const bw = 3.5;
        const bh = 12;
        ctx.fillStyle = colors[(curX + idx) % colors.length];
        ctx.fillRect(curX, sy - bh, bw, bh);
        curX += bw + 1.5;
      }
    });

    if (type === 'his') {
      // Antique 1897 Parchment Scroll on top
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(bx + 6, by + 4, 16, 7);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 6, by + 4, 16, 7);
      ctx.fillStyle = '#b45309';
      ctx.font = '8px sans-serif';
      ctx.fillText('1897', bx + 7, by + 10);
    } else {
      // Desktop Mini World Globe on top
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(bx + w / 2, by + 8, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bx + w / 2, by + 8, 5, 0, Math.PI);
      ctx.stroke();
    }

    // Label
    this.drawSharpLabel(bx + w / 2 + 10, by - 12, label, {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: (type === 'his') ? '#f43f5e' : '#38bdf8',
      textColor: (type === 'his') ? '#fecdd3' : '#bae6fd',
      fontSize: 11.5,
      paddingX: 8,
      height: 20
    });

    ctx.restore();
  }

  // Central Wisdom Lectern (오늘의 지혜 명언 독서대)
  drawLibraryWisdomLectern(px, py) {
    const ctx = this.ctx;
    ctx.save();

    const now = Date.now();
    const pulse = Math.sin(now / 300);
    const lx = px + 16;
    const ly = py + 16;

    // 1. Soft Floor Shadow & Golden Radial Aura
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(lx, ly + 14, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const auraGrad = ctx.createRadialGradient(lx, ly, 4, lx, ly, 32 + pulse * 4);
    auraGrad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
    auraGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.12)');
    auraGrad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(lx, ly, 36, 0, Math.PI * 2);
    ctx.fill();

    // 2. Baroque Ornate Brass Pedestal
    ctx.fillStyle = '#78350f';
    ctx.fillRect(lx - 5, ly + 2, 10, 12);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(lx - 8, ly + 12, 16, 3);
    ctx.fillRect(lx - 10, ly + 14, 20, 2);

    // Angled Book Rest Surface
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(lx - 15, ly);
    ctx.lineTo(lx + 15, ly);
    ctx.lineTo(lx + 12, ly + 4);
    ctx.lineTo(lx - 12, ly + 4);
    ctx.closePath();
    ctx.fill();

    // 3. Open Ancient Illuminated Codex
    // Cover edges
    ctx.fillStyle = '#881337'; // royal burgundy binding
    ctx.beginPath();
    ctx.roundRect(lx - 14, ly - 10, 28, 12, [2, 2, 1, 1]);
    ctx.fill();

    // Glowing Gold & Ivory Pages
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.moveTo(lx - 13, ly - 9);
    ctx.lineTo(lx, ly - 7);
    ctx.lineTo(lx + 13, ly - 9);
    ctx.lineTo(lx + 12, ly - 1);
    ctx.lineTo(lx, ly + 1);
    ctx.lineTo(lx - 12, ly - 1);
    ctx.closePath();
    ctx.fill();

    // Red Ribbon Bookmark
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(lx - 1, ly - 7, 2, 10);

    // Text Lines on Pages
    ctx.fillStyle = 'rgba(120, 53, 15, 0.6)';
    ctx.fillRect(lx - 10, ly - 7, 7, 1);
    ctx.fillRect(lx - 10, ly - 5, 8, 1);
    ctx.fillRect(lx - 10, ly - 3, 6, 1);
    ctx.fillRect(lx + 3, ly - 7, 7, 1);
    ctx.fillRect(lx + 2, ly - 5, 8, 1);
    ctx.fillRect(lx + 4, ly - 3, 6, 1);

    // 4. Brass Candleholder with Flickering Flame on Left
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(lx - 17, ly - 2, 4, 3);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(lx - 16, ly - 7, 2, 5); // candle body
    // Flame
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(lx - 15, ly - 9 + Math.sin(now / 120) * 1, 1.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(lx - 15, ly - 8.5, 1, 0, Math.PI * 2);
    ctx.fill();

    // 5. Rising Floating Sparkle Particle (✦)
    const sparkleY = ly - 16 + Math.sin(now / 200) * 3;
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', lx + 12, sparkleY);

    // 6. Prominent Floating Sharp Label
    this.drawSharpLabel(lx, ly - 22, '📖 오늘의 지혜 명언 독서대', {
      bgColor: 'rgba(15, 23, 42, 0.96)',
      borderColor: '#f59e0b',
      borderWidth: 2,
      textColor: '#fef08a',
      fontSize: 12,
      paddingX: 10,
      height: 22
    });

    ctx.restore();
  }

  // Smart Dibut Tablet Docking Station (스마트 디벗 거치대 존)
  drawLibraryDibutStation(px, py) {
    const ctx = this.ctx;
    ctx.save();

    const w = 3 * 32;
    const h = 26;
    const bx = px;
    const by = py - 4;

    // Floor shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(bx + w / 2, by + h + 2, w / 2 + 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sleek White Matte Desk Body with Cyan LED Underglow
    ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.fillRect(bx + 4, by + h, w - 8, 3);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, [4, 4, 2, 2]);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Aluminum Top Surface
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(bx + 2, by + 2, w - 4, 7);

    // 5 Docked Tablets resting at 60-degree angle
    const tabletSpacing = (w - 24) / 5;
    for (let i = 0; i < 5; i++) {
      const tx = bx + 12 + i * tabletSpacing;
      const ty = by - 8;

      // Tablet Frame
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.roundRect(tx, ty, 10, 14, [2, 2, 1, 1]);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Glowing Cyan Display Screen
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(tx + 1, ty + 1, 8, 11);

      // Home bar & LED
      ctx.fillStyle = '#a5f3fc';
      ctx.fillRect(tx + 3, ty + 10, 4, 1);
    }

    // Charging & Status LED bar
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(bx + w - 8, by + 16, 2, 0, Math.PI * 2);
    ctx.fill();

    // Floating Label
    this.drawSharpLabel(bx + w / 2, by - 16, '📱 스마트 디벗 단말기', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#38bdf8',
      textColor: '#e0f2fe',
      fontSize: 11.5,
      paddingX: 8,
      height: 20
    });

    ctx.restore();
  }

  // Oak Study Table with Chairs (가운데 앉을 수 있는 독서용 책상 & 의자)
  drawLibraryStudyTable(px, py, widthTiles) {
    const ctx = this.ctx;
    ctx.save();

    const w = widthTiles * 32;
    const h = 26;
    const bx = px;
    const by = py;

    // Floor shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(bx + w / 2, by + h + 4, w / 2 + 8, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    const chairSpacing = w / 4;

    // 1. Top Chairs (North Row - facing table)
    for (let c = 0; c < 4; c++) {
      const cx = bx + 8 + c * chairSpacing;
      // Chair Backrest
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.roundRect(cx, by - 12, 14, 5, [2, 2, 0, 0]);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Velvet Cushion
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(cx + 1, by - 7, 12, 6);
    }

    // 2. Polished Solid Oak Table Surface
    ctx.fillStyle = '#451a03';
    ctx.fillRect(bx, by, w, h);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, w, h);

    // Beveled Edge Highlight
    ctx.fillStyle = '#92400e';
    ctx.fillRect(bx + 2, by + 2, w - 4, 4);

    // 3. 2 Classic Green Glass Banker Lamps with Warm Amber Glow
    [bx + w * 0.28, bx + w * 0.72].forEach(lx => {
      // Warm Light Cone on table
      ctx.fillStyle = 'rgba(254, 240, 138, 0.22)';
      ctx.beginPath();
      ctx.ellipse(lx, by + 12, 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Brass Pedestal & Arm
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(lx - 1, by - 6, 2, 10);
      ctx.fillRect(lx - 3, by + 4, 6, 2);

      // Emerald Green Glass Shade
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.roundRect(lx - 6, by - 8, 12, 5, [2, 2, 1, 1]);
      ctx.fill();
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Open books and notebook on table
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(bx + w * 0.46, by + 6, 14, 9);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(bx + w * 0.46 + 6, by + 6, 2, 9);

    // 4. Bottom Chairs (South Row - facing table)
    for (let c = 0; c < 4; c++) {
      const cx = bx + 8 + c * chairSpacing;
      // Velvet Cushion
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(cx + 1, by + h - 1, 12, 6);
      // Chair Backrest & Legs
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.roundRect(cx, by + h + 5, 14, 5, [0, 0, 2, 2]);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Legs
      ctx.fillStyle = '#3b1803';
      ctx.fillRect(cx + 1, by + h + 10, 2, 4);
      ctx.fillRect(cx + 11, by + h + 10, 2, 4);
    }

    // Floating Label
    this.drawSharpLabel(bx + w / 2, by - 22, '🪑 중앙 독서 열람석', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#f59e0b',
      textColor: '#fef08a',
      fontSize: 11.5,
      paddingX: 8,
      height: 20
    });

    ctx.restore();
  }

  // Library Catalog Search PC Station (도서 검색기 컴퓨터)
  drawLibrarySearchPC(px, py) {
    const ctx = this.ctx;
    ctx.save();

    // Floor shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(px + 16, py + 26, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Metal Computer Stand Desk
    ctx.fillStyle = '#334155';
    ctx.fillRect(px + 4, py + 14, 24, 14);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 4, py + 14, 24, 14);

    // Keyboard & Mouse
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(px + 8, py + 18, 12, 4);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(px + 22, py + 19, 3, 3);

    // Monitor Stand
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(px + 14, py + 10, 4, 5);
    ctx.fillRect(px + 12, py + 14, 8, 2);

    // LCD Monitor Bezel
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(px + 4, py - 4, 24, 16, [2, 2, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Glowing Blue Search Screen
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(px + 6, py - 2, 20, 12);

    // Search Screen Content: Header Bar & Search Box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 8, py, 16, 2);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(px + 8, py + 3, 10, 1.5);
    ctx.fillRect(px + 8, py + 6, 14, 1);
    ctx.fillRect(px + 8, py + 8, 12, 1);

    // Tiny Glowing Search Magnifier Glass Icon
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(px + 21, py + 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Pulsing Status LED
    const ledOn = Math.floor(Date.now() / 600) % 2 === 0;
    ctx.fillStyle = ledOn ? '#22c55e' : '#15803d';
    ctx.fillRect(px + 24, py + 10, 2, 2);

    // Sharp Label
    this.drawSharpLabel(px + 16, py - 14, '🖥️ 도서 검색기', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#38bdf8',
      textColor: '#7dd3fc',
      fontSize: 11,
      paddingX: 7,
      height: 19
    });

    ctx.restore();
  }

  // Cozy Velvet Club Armchair
  drawLibraryArmchair(px, py) {
    const ctx = this.ctx;
    ctx.save();

    const bx = px + 4;
    const by = py - 4;

    // Floor shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(bx + 12, by + 22, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Burgundy Velvet Armchair Backrest
    ctx.fillStyle = '#881337';
    ctx.beginPath();
    ctx.roundRect(bx, by, 24, 18, [6, 6, 2, 2]);
    ctx.fill();

    // Cushion
    ctx.fillStyle = '#9f1239';
    ctx.beginPath();
    ctx.roundRect(bx + 2, by + 8, 20, 12, [3, 3, 2, 2]);
    ctx.fill();

    // Armrests
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(bx - 1, by + 5, 4, 14);
    ctx.fillRect(bx + 21, by + 5, 4, 14);

    // Brass Tacks on Armrests
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(bx, by + 8, 2, 2);
    ctx.fillRect(bx + 22, by + 8, 2, 2);

    ctx.restore();
  }

  // Reception & Loan Counter in front of Librarian
  drawLibraryReceptionCounter(px, py) {
    const ctx = this.ctx;
    ctx.save();

    const w = 3 * 32;
    const h = 24;
    const bx = px;
    const by = py;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.beginPath();
    ctx.ellipse(bx + w / 2, by + h + 2, w / 2 + 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Polished Mahogany Counter Front with Paneling
    ctx.fillStyle = '#3b1803';
    ctx.fillRect(bx, by, w, h);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, w, h);

    // Raised wood mouldings
    ctx.fillStyle = '#542306';
    ctx.fillRect(bx + 8, by + 4, 22, 14);
    ctx.fillRect(bx + 37, by + 4, 22, 14);
    ctx.fillRect(bx + 66, by + 4, 22, 14);

    // Brass Top Counter Rail
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(bx - 2, by - 2, w + 4, 3);

    // On Counter: Green Banker Lamp at left
    ctx.fillStyle = '#047857';
    ctx.fillRect(bx + 6, by - 7, 8, 4);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(bx + 9, by - 3, 2, 3);

    // Book Return Slot Box: [도서반납]
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(bx + 68, by - 6, 20, 8);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx + 68, by - 6, 20, 8);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(bx + 71, by - 3, 14, 2);

    ctx.restore();
  }

  // Librarian Overhead Marker & '쉿! 정숙!' Comic Popup
  renderLibrarianOverhead() {
    const ctx = this.ctx;
    const lx = 13 * 32 + 16;
    const ly = 4 * 32 + 4;

    // 1. '쉿! 정숙!' Easter Egg Popup
    if (this.libraryShhTimer && Date.now() < this.libraryShhTimer) {
      ctx.save();
      const shake = Math.sin(Date.now() / 40) * 3;
      const bx = lx + shake;
      const by = ly - 36;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.5;

      // Comic talk bubble
      ctx.beginPath();
      ctx.roundRect(bx - 60, by - 12, 120, 26, [8, 8, 8, 8]);
      ctx.fill();
      ctx.stroke();

      // Tail pointing down to librarian
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(bx - 6, by + 14);
      ctx.lineTo(bx + 6, by + 14);
      ctx.lineTo(bx, by + 22);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bx - 6, by + 14);
      ctx.lineTo(bx, by + 22);
      ctx.lineTo(bx + 6, by + 14);
      ctx.stroke();

      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#b91c1c';
      ctx.fillText('💢 쉿! 정숙! (뛰지마!)', bx, by + 1);

      ctx.restore();
      return;
    }

    // 2. Quest Marker (! or ? or 🔒)
    const app = window.MainApp;
    if (app && typeof app.getTeacherQuestStatus === 'function') {
      const qStatus = app.getTeacherQuestStatus('quest_library_missing_books');
      if (qStatus && qStatus !== 'done') {
        this.drawFloatingQuestMarker(lx, ly - 14, qStatus);
      }
    }
  }

  // Floating Glowing Quest Library Book (Blue, Green, Red)
  drawQuestLibraryBook(px, py, color = 'blue') {
    const ctx = this.ctx;
    ctx.save();

    // Floating animation
    const bob = Math.sin(Date.now() / 250) * 3;
    const by = py + bob;

    // Glowing aura
    const auraColor = (color === 'blue') ? 'rgba(56, 189, 248, 0.4)' : (color === 'green' ? 'rgba(74, 222, 128, 0.4)' : 'rgba(248, 113, 113, 0.4)');
    const mainColor = (color === 'blue') ? '#0284c7' : (color === 'green' ? '#16a34a' : '#dc2626');
    const spineColor = (color === 'blue') ? '#0369a1' : (color === 'green' ? '#15803d' : '#b91c1c');

    ctx.fillStyle = auraColor;
    ctx.beginPath();
    ctx.ellipse(px + 16, by + 16, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Book Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(px + 16, py + 26, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Book Cover (Angled Hardcover)
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.roundRect(px + 6, by + 6, 20, 16, [2, 4, 4, 2]);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Book Pages (Gold / Ivory edges)
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(px + 10, by + 9, 14, 10);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(px + 11, by + 12, 12, 1);
    ctx.fillRect(px + 11, by + 15, 9, 1);

    // Spine
    ctx.fillStyle = spineColor;
    ctx.fillRect(px + 6, by + 6, 4, 16);

    // Ribbon Bookmark hanging out
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(px + 17, by + 18);
    ctx.lineTo(px + 20, by + 26);
    ctx.lineTo(px + 17, by + 24);
    ctx.lineTo(px + 14, by + 26);
    ctx.closePath();
    ctx.fill();

    // Sparkle
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px sans-serif';
    ctx.fillText('✦', px + 21, by + 5);

    ctx.restore();
  }


  // High-Res Secret Lost & Found Box (운동장 스탠드 구석 비밀 분실물 상자)
  drawHighResLostBox(px, py) {
    this.ctx.save();

    // Natural grass patch / clovers around the box
    this.ctx.fillStyle = '#166534';
    this.ctx.beginPath();
    this.ctx.ellipse(px + 8, py + 22, 6, 3, 0, 0, Math.PI * 2);
    this.ctx.ellipse(px + 26, py + 20, 7, 4, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Shadow underneath box
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.ctx.beginPath();
    this.ctx.ellipse(px + 16, py + 22, 17, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    const bx = px + 2;
    const by = py + 2;
    const bw = 28;
    const bh = 19;

    // Main steel chest body (military olive-drab weathered iron)
    const boxGrad = this.ctx.createLinearGradient(bx, by, bx, by + bh);
    boxGrad.addColorStop(0, '#475569');
    boxGrad.addColorStop(0.5, '#334155');
    boxGrad.addColorStop(1, '#1e293b');

    this.ctx.fillStyle = boxGrad;
    this.ctx.beginPath();
    this.ctx.roundRect(bx, by, bw, bh, 3);
    this.ctx.fill();

    // Heavy iron edge bevel / reinforcement brackets
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // Chest lid seam
    const lidH = 7;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    this.ctx.fillRect(bx + 1, by + 1, bw - 2, lidH);
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(bx, by + lidH);
    this.ctx.lineTo(bx + bw, by + lidH);
    this.ctx.stroke();

    // Steel corner brackets & rivets
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(bx, by, 4, lidH);
    this.ctx.fillRect(bx + bw - 4, by, 4, lidH);
    this.ctx.fillRect(bx, by + bh - 6, 4, 6);
    this.ctx.fillRect(bx + bw - 4, by + bh - 6, 4, 6);

    // Rivet dots
    this.ctx.fillStyle = '#cbd5e1';
    [bx + 2, bx + bw - 2].forEach(rx => {
      this.ctx.fillRect(rx - 0.5, by + 2, 1, 1);
      this.ctx.fillRect(rx - 0.5, by + bh - 3, 1, 1);
    });

    // Antique Brass latch & keyhole / padlock
    const lockX = bx + bw / 2 - 4;
    const lockY = by + lidH - 2;
    this.ctx.fillStyle = '#d97706';
    this.ctx.beginPath();
    this.ctx.roundRect(lockX, lockY, 8, 8, 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#78350f';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Keyhole
    this.ctx.fillStyle = '#1c1917';
    this.ctx.beginPath();
    this.ctx.arc(lockX + 4, lockY + 3, 1.2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillRect(lockX + 3.5, lockY + 3.5, 1, 2.5);

    // Mysterious glint / pulse
    const shimmer = Math.sin(Date.now() / 250);
    if (shimmer > 0.4) {
      this.ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';
      this.ctx.beginPath();
      this.ctx.arc(bx + 6, by + 4, 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  // High-Res School Canteen (매점 - 학생급식실 앞)
  // ========================================================
  // 👨‍🏫 숭실고 체육선생님 (주차장 1분 체력장 NPC: tx 44, ty 15)
  // - 교무실/복도 교사들과 100% 동일한 외형/스프라이트/라벨 적용
  // ========================================================
  drawHighResPETeacher(cx, cy) {
    const px = cx;
    const py = cy;
    this.ctx.save();

    // 1. Ground shadow (교무실 교사들과 100% 동일)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(px + 16, py + 26, 12, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Teacher Classic Blue Sprite (교무실 교사들과 100% 동일)
    this.ctx.fillStyle = '#1e3a8a';
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 12, 10, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillRect(px + 8, py + 18, 16, 14);

    // 3. Overhead Nameplate (교무실 교사들과 100% 동일)
    this.drawSharpLabel(px + 16, py + 38, '👨‍🏫 숭실고 체육선생님', {
      bgColor: 'rgba(30, 58, 138, 0.95)',
      borderColor: '#60a5fa',
      textColor: '#fef08a',
      fontSize: 12,
      paddingX: 8,
      height: 20
    });

    this.ctx.restore();
  }

  // 👮 숭실 정문 배움터 지킴이 선생님 (형태는 교사와 동일: Classic Blue Sprite)
  drawHighResGuardTeacher(cx, cy) {
    const px = cx;
    const py = cy;
    this.ctx.save();

    // 1. Ground shadow (교사와 100% 동일)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(px + 16, py + 26, 12, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Teacher Classic Blue Sprite (형태는 교사와 동일)
    this.ctx.fillStyle = '#1e3a8a';
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 12, 10, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillRect(px + 8, py + 18, 16, 14);

    // 3. Overhead Nameplate
    this.drawSharpLabel(px + 16, py + 38, '👮 배움터 지킴이 선생님', {
      bgColor: 'rgba(30, 58, 138, 0.95)',
      borderColor: '#60a5fa',
      textColor: '#fef08a',
      fontSize: 12,
      paddingX: 8,
      height: 20
    });

    this.ctx.restore();
  }

  drawHighResStoreNPC(cx, cy) {
    this.ctx.save();
    const w = 72;
    const h = 56;

    // Ground shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    this.ctx.beginPath();
    this.ctx.ellipse(cx + 36, cy + 44, 38, 12, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Wooden Counter base
    this.ctx.fillStyle = '#78350f';
    this.ctx.beginPath();
    this.ctx.roundRect(cx + 4, cy + 18, 64, 28, 4);
    this.ctx.fill();

    // Counter wood planks texture
    this.ctx.strokeStyle = '#451a03';
    this.ctx.lineWidth = 1.5;
    for (let py = cy + 24; py < cy + 44; py += 7) {
      this.ctx.beginPath();
      this.ctx.moveTo(cx + 6, py);
      this.ctx.lineTo(cx + 66, py);
      this.ctx.stroke();
    }

    // Glass display counter / snack showcase
    this.ctx.fillStyle = 'rgba(186, 230, 253, 0.55)';
    this.ctx.beginPath();
    this.ctx.roundRect(cx + 8, cy + 20, 56, 12, 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#0284c7';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Counter top marble / polished board
    this.ctx.fillStyle = '#fde68a';
    this.ctx.beginPath();
    this.ctx.roundRect(cx + 2, cy + 15, 68, 5, 2);
    this.ctx.fill();

    // Canteen Clerk NPC (Behind counter)
    const clerkX = cx + 36;
    const clerkY = cy + 10;
    // Clerk Hat / Cap
    this.ctx.fillStyle = '#f87171';
    this.ctx.beginPath();
    this.ctx.arc(clerkX, clerkY - 6, 8, Math.PI, Math.PI * 2);
    this.ctx.fill();
    // Head / Face
    this.ctx.fillStyle = '#fed7aa';
    this.ctx.beginPath();
    this.ctx.arc(clerkX, clerkY - 4, 7, 0, Math.PI * 2);
    this.ctx.fill();
    // Eyes
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(clerkX - 3, clerkY - 5, 2, 2);
    this.ctx.fillRect(clerkX + 1, clerkY - 5, 2, 2);
    // Smile
    this.ctx.strokeStyle = '#e11d48';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(clerkX, clerkY - 3, 3, 0.1 * Math.PI, 0.9 * Math.PI);
    this.ctx.stroke();
    // Clerk Uniform & Apron
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(clerkX - 7, clerkY + 3, 14, 12);
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(clerkX - 5, clerkY + 5, 10, 8);

    // Awning Canopy (Striped red & white)
    const awningW = 76;
    const awningH = 16;
    const ax = cx - 2;
    const ay = cy - 4;
    const stripeW = 9.5;
    for (let s = 0; s < 8; s++) {
      this.ctx.fillStyle = (s % 2 === 0) ? '#dc2626' : '#ffffff';
      this.ctx.beginPath();
      this.ctx.roundRect(ax + s * stripeW, ay, stripeW, awningH, [3, 3, 4, 4]);
      this.ctx.fill();
    }
    this.ctx.strokeStyle = '#b91c1c';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(ax, ay, awningW, awningH);

    // Support poles
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(cx + 2, ay + awningH, 3, 24);
    this.ctx.fillRect(cx + 67, ay + awningH, 3, 24);

    // Sign label
    this.drawSharpLabel(cx + 36, cy - 18, '🏪 매점', {
      bgColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#f59e0b',
      textColor: '#fef08a',
      fontSize: 12.5,
      paddingX: 11,
      height: 22
    });

    this.ctx.restore();
  }

  // High-Res Title Exchange (호칭 교환소 - 스탠드 관람석 구역)
  drawHighResTitleExchange(cx, cy) {
    this.ctx.save();

    // Ground Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(cx + 36, cy + 38, 42, 14, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Royal Ceremonial Rug / Dais
    this.ctx.fillStyle = '#831843'; // Deep crimson
    this.ctx.beginPath();
    this.ctx.roundRect(cx + 2, cy + 18, 68, 22, 6);
    this.ctx.fill();
    this.ctx.strokeStyle = '#fbbf24'; // Gold border
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Pedestal stand
    this.ctx.fillStyle = '#475569';
    this.ctx.beginPath();
    this.ctx.roundRect(cx + 18, cy + 6, 36, 18, 4);
    this.ctx.fill();
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Golden Laurel / Trophy on stand
    const time = Date.now() / 400;
    const floatY = Math.sin(time) * 3;

    // Golden Medal Trophy
    const tx = cx + 36;
    const ty = cy - 2 + floatY;

    // Golden radial aura
    const grad = this.ctx.createRadialGradient(tx, ty, 2, tx, ty, 20);
    grad.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
    grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(tx, ty, 20, 0, Math.PI * 2);
    this.ctx.fill();

    // Golden Medal
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.beginPath();
    this.ctx.arc(tx, ty, 11, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#fef08a';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Medal Ribbon
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.beginPath();
    this.ctx.moveTo(tx - 6, ty - 10);
    this.ctx.lineTo(tx, ty - 2);
    this.ctx.lineTo(tx + 6, ty - 10);
    this.ctx.closePath();
    this.ctx.fill();

    // Medal Star Icon
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '10px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('★', tx, ty);

    // Sparkles
    const spX1 = tx + Math.cos(time * 1.5) * 16;
    const spY1 = ty + Math.sin(time * 1.5) * 12;
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(spX1, spY1, 2, 2);

    // Sign label
    this.drawSharpLabel(cx + 36, cy - 24, '🏅 호칭 교환소', {
      bgColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#38bdf8',
      textColor: '#7dd3fc',
      fontSize: 12.5,
      paddingX: 11,
      height: 22
    });

    this.ctx.restore();
  }

  // ========================================================
  // HIGH-RES SCHOOL CLUB NOTICE BOARD (동아리 홍보 게시판)
  // ========================================================
  drawHighResClubBoard(px, py) {
    this.ctx.save();

    // Floor Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.beginPath();
    this.ctx.ellipse(px + 24, py + 28, 28, 8, 0, 0, Math.PI * 2);
    this.ctx.fill();

    const bx = px - 4;
    const by = py - 8;
    const bw = 56;
    const bh = 36;

    // Wooden Frame Outer Trim
    this.ctx.fillStyle = '#451a03';
    this.ctx.beginPath();
    this.ctx.roundRect(bx - 3, by - 3, bw + 6, bh + 6, 4);
    this.ctx.fill();
    this.ctx.fillStyle = '#78350f';
    this.ctx.beginPath();
    this.ctx.roundRect(bx - 1, by - 1, bw + 2, bh + 2, 2);
    this.ctx.fill();

    // Cork Board Surface
    const corkGrad = this.ctx.createLinearGradient(bx, by, bx, by + bh);
    corkGrad.addColorStop(0, '#d97706');
    corkGrad.addColorStop(1, '#b45309');
    this.ctx.fillStyle = corkGrad;
    this.ctx.fillRect(bx, by, bw, bh);

    // Cork texture speckles
    this.ctx.fillStyle = 'rgba(120, 53, 15, 0.4)';
    this.ctx.fillRect(bx + 4, by + 6, 2, 2);
    this.ctx.fillRect(bx + 18, by + 20, 2, 2);
    this.ctx.fillRect(bx + 38, by + 8, 2, 2);
    this.ctx.fillRect(bx + 46, by + 24, 2, 2);

    // Pinned Club Flyer 1 (Top-Left: Band '소리마루')
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(bx + 4, by + 4, 22, 13);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(bx + 6, by + 7, 18, 2);
    this.ctx.fillRect(bx + 6, by + 11, 12, 2);
    // Pin (yellow pushpin)
    this.ctx.fillStyle = '#fde047';
    this.ctx.beginPath();
    this.ctx.arc(bx + 15, by + 5, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Pinned Club Flyer 2 (Top-Right: Soccer/Futsal)
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.fillRect(bx + 30, by + 4, 22, 13);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(bx + 32, by + 7, 18, 2);
    this.ctx.fillRect(bx + 32, by + 11, 14, 2);
    // Pin (red pushpin)
    this.ctx.fillStyle = '#dc2626';
    this.ctx.beginPath();
    this.ctx.arc(bx + 41, by + 5, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Pinned Club Flyer 3 (Bottom-Left: Coding & English RPG)
    this.ctx.fillStyle = '#10b981';
    this.ctx.fillRect(bx + 4, by + 19, 22, 13);
    this.ctx.fillStyle = '#ecfdf5';
    this.ctx.fillRect(bx + 6, by + 22, 18, 2);
    this.ctx.fillRect(bx + 6, by + 26, 14, 2);
    // Pin (blue pushpin)
    this.ctx.fillStyle = '#60a5fa';
    this.ctx.beginPath();
    this.ctx.arc(bx + 15, by + 20, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Pinned Club Flyer 4 (Bottom-Right: Webtoon & Illustration)
    this.ctx.fillStyle = '#a855f7';
    this.ctx.fillRect(bx + 30, by + 19, 22, 13);
    this.ctx.fillStyle = '#faf5ff';
    this.ctx.fillRect(bx + 32, by + 22, 18, 2);
    this.ctx.fillRect(bx + 32, by + 26, 10, 2);
    // Pin (emerald pushpin)
    this.ctx.fillStyle = '#34d399';
    this.ctx.beginPath();
    this.ctx.arc(bx + 41, by + 20, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Sharp Badge Label
    this.drawSharpLabel(px + 24, py - 20, '🎸 동아리 홍보 게시판', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#f59e0b',
      textColor: '#fef08a',
      fontSize: 11.5,
      paddingX: 8,
      height: 20
    });

    this.ctx.restore();
  }

  // ========================================================
  // HIGH-RES HALLWAY PLANTERS (복도 공기정화 식물 & 대형 관엽식물)
  // ========================================================
  drawHighResHallwayPlant(px, py, subType, stage = 0, waterCount = 0) {
    this.ctx.save();
    const cx = px + 16;
    const cy = py + 12;
    const isTeacher = !!(this.player && this.player.isTeacher);

    // =========================================================================
    // STAGE 0: 0 ~ 99 WATER (아기 새싹 화분)
    // =========================================================================
    if (stage === 0) {
      // Floor Shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy + 18, 12, 5, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Cute Little White Ceramic Pot
      const potW = 18;
      const potH = 14;
      const potX = cx - 9;
      const potY = cy + 4;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.roundRect(potX, potY, potW, potH, [1, 1, 3, 3]);
      this.ctx.fill();
      this.ctx.strokeStyle = '#cbd5e1';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      // Soil
      this.ctx.fillStyle = '#5c2c10';
      this.ctx.fillRect(potX + 2, potY + 1, potW - 4, 3);

      // Baby Sprout Stem
      this.ctx.strokeStyle = '#22c55e';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, potY + 2);
      this.ctx.quadraticCurveTo(cx, cy - 2, cx, cy - 6);
      this.ctx.stroke();

      // Two Tender Twin Sprout Leaves
      this.ctx.fillStyle = '#4ade80';
      // Left leaf
      this.ctx.beginPath();
      this.ctx.ellipse(cx - 5, cy - 6, 5, 3, -0.5, 0, Math.PI * 2);
      this.ctx.fill();
      // Right leaf
      this.ctx.beginPath();
      this.ctx.ellipse(cx + 5, cy - 6, 5, 3, 0.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Morning Dewdrop
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.beginPath();
      this.ctx.arc(cx - 3, cy - 8, 1.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Badge
      const bText0 = isTeacher ? `🌱 아기 새싹 (${waterCount}/100 💧)` : '🌱 아기 새싹';
      this.drawSharpLabel(cx, py - 18, bText0, {
        bgColor: 'rgba(15, 23, 42, 0.94)',
        borderColor: '#4ade80',
        textColor: '#bbf7d0',
        fontSize: 11,
        paddingX: 7,
        height: 19
      });
    }

    // =========================================================================
    // STAGE 1: 100 ~ 999 WATER (1차 성장 - 무럭무럭 관엽식물)
    // =========================================================================
    else if (stage === 1) {
      // Floor Shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy + 18, 16, 6, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Modern Ceramic Planter Pot
      const potW = 24;
      const potH = 17;
      const potX = cx - 12;
      const potY = cy + 2;
      const potGrad = this.ctx.createLinearGradient(potX, potY, potX + potW, potY);
      potGrad.addColorStop(0, '#e2e8f0');
      potGrad.addColorStop(0.5, '#ffffff');
      potGrad.addColorStop(1, '#cbd5e1');
      this.ctx.fillStyle = potGrad;
      this.ctx.beginPath();
      this.ctx.roundRect(potX, potY, potW, potH, [1, 1, 4, 4]);
      this.ctx.fill();
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.fillRect(potX - 1, potY - 1, potW + 2, 3);
      this.ctx.fillStyle = '#451a03';
      this.ctx.fillRect(potX + 2, potY + 1, potW - 4, 3);

      // Lush Bushy Leaves
      this.ctx.fillStyle = '#065f46';
      this.ctx.beginPath();
      this.ctx.ellipse(cx - 10, cy - 6, 9, 6, -0.4, 0, Math.PI * 2);
      this.ctx.ellipse(cx + 10, cy - 5, 9, 6, 0.4, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#059669';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy - 10, 11, 7, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#10b981';
      this.ctx.beginPath();
      this.ctx.ellipse(cx - 6, cy - 9, 7, 4, -0.2, 0, Math.PI * 2);
      this.ctx.ellipse(cx + 6, cy - 8, 7, 4, 0.2, 0, Math.PI * 2);
      this.ctx.fill();

      // Badge
      const bText1 = isTeacher ? `🌿 무럭무럭 식물 (${waterCount}/1,000 💧)` : '🌿 무럭무럭 식물';
      this.drawSharpLabel(cx, py - 20, bText1, {
        bgColor: 'rgba(6, 78, 59, 0.94)',
        borderColor: '#34d399',
        textColor: '#ecfdf5',
        fontSize: 11.5,
        paddingX: 8,
        height: 20
      });
    }

    // =========================================================================
    // STAGE 2: 1000 ~ 2999 WATER (2차 성장 - 거대 대형 생명수)
    // =========================================================================
    else if (stage === 2) {
      // Floor Shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy + 18, 22, 8, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Slate Ornate Planter with Bronze Rim
      const potW = 28;
      const potH = 20;
      const potX = cx - 14;
      const potY = cy;
      this.ctx.fillStyle = '#1e293b';
      this.ctx.beginPath();
      this.ctx.roundRect(potX, potY, potW, potH, [2, 2, 5, 5]);
      this.ctx.fill();
      this.ctx.fillStyle = '#d97706';
      this.ctx.fillRect(potX - 2, potY - 1, potW + 4, 3);
      this.ctx.fillStyle = '#3f1c07';
      this.ctx.fillRect(potX + 2, potY + 1, potW - 4, 3);

      // Strong Wooden Trunk & Branches
      this.ctx.strokeStyle = '#78350f';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy + 2);
      this.ctx.lineTo(cx, cy - 8);
      this.ctx.stroke();

      // Broad Grand Canopy (reaching up)
      this.ctx.fillStyle = '#064e3b';
      this.ctx.beginPath();
      this.ctx.arc(cx - 12, cy - 12, 12, 0, Math.PI * 2);
      this.ctx.arc(cx + 12, cy - 11, 12, 0, Math.PI * 2);
      this.ctx.arc(cx, cy - 16, 14, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#047857';
      this.ctx.beginPath();
      this.ctx.arc(cx - 7, cy - 14, 10, 0, Math.PI * 2);
      this.ctx.arc(cx + 7, cy - 13, 10, 0, Math.PI * 2);
      this.ctx.arc(cx, cy - 20, 11, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#10b981';
      this.ctx.beginPath();
      this.ctx.arc(cx - 4, cy - 16, 6, 0, Math.PI * 2);
      this.ctx.arc(cx + 5, cy - 15, 6, 0, Math.PI * 2);
      this.ctx.fill();

      // Hanging Vine Strands
      this.ctx.strokeStyle = '#34d399';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.moveTo(cx - 10, cy - 8);
      this.ctx.lineTo(cx - 10, cy - 2);
      this.ctx.moveTo(cx + 11, cy - 7);
      this.ctx.lineTo(cx + 11, cy - 1);
      this.ctx.stroke();

      // Badge
      const bText2 = isTeacher ? `🌳 거대 생명수 (${waterCount}/3,000 💧)` : '🌳 거대 생명수';
      this.drawSharpLabel(cx, py - 26, bText2, {
        bgColor: 'rgba(6, 78, 59, 0.95)',
        borderColor: '#10b981',
        textColor: '#a7f3d0',
        fontSize: 12,
        paddingX: 9,
        height: 21
      });
    }

    // =========================================================================
    // STAGE 3: 3000+ WATER (3차 최종 성장 - 숭실 생명의 만개목 🌸)
    // =========================================================================
    else {
      const now = Date.now();
      const pulse = Math.sin(now / 350) * 3;

      // Magical Pulsing Radial Aura
      const auraGrad = this.ctx.createRadialGradient(cx, cy - 14, 6, cx, cy - 14, 34 + pulse);
      auraGrad.addColorStop(0, 'rgba(251, 113, 133, 0.45)');
      auraGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.25)');
      auraGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
      this.ctx.fillStyle = auraGrad;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy - 14, 34 + pulse, 0, Math.PI * 2);
      this.ctx.fill();

      // Floor Shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy + 18, 25, 9, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Imperial Gold Rim Royal Pot
      const potW = 32;
      const potH = 22;
      const potX = cx - 16;
      const potY = cy;
      this.ctx.fillStyle = '#312e81'; // Royal indigo pot
      this.ctx.beginPath();
      this.ctx.roundRect(potX, potY, potW, potH, [3, 3, 6, 6]);
      this.ctx.fill();
      this.ctx.fillStyle = '#f59e0b'; // Gold rim
      this.ctx.fillRect(potX - 2, potY - 2, potW + 4, 4);
      this.ctx.fillStyle = '#fb7185'; // Ruby jewel
      this.ctx.beginPath();
      this.ctx.arc(cx, potY + 8, 3, 0, Math.PI * 2);
      this.ctx.fill();

      // Sacred Golden Trunk
      this.ctx.strokeStyle = '#92400e';
      this.ctx.lineWidth = 5;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy + 2);
      this.ctx.lineTo(cx, cy - 10);
      this.ctx.stroke();

      // Majestic Flowering Canopy
      this.ctx.fillStyle = '#065f46';
      this.ctx.beginPath();
      this.ctx.arc(cx - 14, cy - 14, 13, 0, Math.PI * 2);
      this.ctx.arc(cx + 14, cy - 13, 13, 0, Math.PI * 2);
      this.ctx.arc(cx, cy - 19, 16, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#10b981';
      this.ctx.beginPath();
      this.ctx.arc(cx - 8, cy - 16, 11, 0, Math.PI * 2);
      this.ctx.arc(cx + 8, cy - 15, 11, 0, Math.PI * 2);
      this.ctx.arc(cx, cy - 22, 13, 0, Math.PI * 2);
      this.ctx.fill();

      // Blooming Flowers (🌸 Pink & Gold Cherry / Lotus Blossoms)
      const flowers = [
        { x: cx - 14, y: cy - 16, r: 4 },
        { x: cx + 13, y: cy - 15, r: 4 },
        { x: cx, y: cy - 28, r: 5 },
        { x: cx - 6, y: cy - 23, r: 4 },
        { x: cx + 6, y: cy - 22, r: 4 },
        { x: cx - 8, y: cy - 8, r: 3.5 },
        { x: cx + 8, y: cy - 7, r: 3.5 }
      ];

      for (const f of flowers) {
        // Petals
        this.ctx.fillStyle = '#f43f5e';
        this.ctx.beginPath();
        this.ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#fbcfe8';
        this.ctx.beginPath();
        this.ctx.arc(f.x, f.y, f.r * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
        // Golden Stamen Center
        this.ctx.fillStyle = '#fef08a';
        this.ctx.beginPath();
        this.ctx.arc(f.x, f.y, 1.2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Floating Magic Sparkles
      const sp1 = (now / 200) % 20;
      this.ctx.fillStyle = '#fef08a';
      this.ctx.fillRect(cx - 16 + Math.sin(now / 300) * 8, cy - 30 - (sp1 % 10), 2, 2);
      this.ctx.fillRect(cx + 14 + Math.cos(now / 300) * 8, cy - 28 - ((sp1 + 5) % 10), 2, 2);

      // Grand Badge
      const bText3 = '🌸 만개목';
      this.drawSharpLabel(cx, py - 32, bText3, {
        bgColor: 'rgba(88, 28, 135, 0.95)',
        borderColor: '#f43f5e',
        textColor: '#fef08a',
        fontSize: 12.5,
        paddingX: 10,
        height: 22
      });
    }

    this.ctx.restore();
  }

  // Peaceful Standby Chamber when boss raid is inactive
  drawPeacefulBossChamber(cr) {
    this.ctx.save();
    const bx = 15 * 32;
    const by = 8 * 32;

    const time = Date.now() / 1000;
    const pulse = 0.5 + 0.5 * Math.sin(time * 2);

    // Soft pulsing standby rune circle
    this.ctx.strokeStyle = `rgba(59, 130, 246, ${0.35 + 0.25 * pulse})`;
    this.ctx.lineWidth = 2.5;
    this.ctx.setLineDash([8, 6]);
    this.ctx.beginPath();
    this.ctx.arc(bx + 16, by + 16, 52, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Outer faint rune ring
    this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(bx + 16, by + 16, 68, 0, Math.PI * 2);
    this.ctx.stroke();

    // Central stand-by pedestal
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    this.ctx.beginPath();
    this.ctx.ellipse(bx + 16, by + 24, 38, 14, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Standby crystal
    const floatY = Math.sin(time * 3) * 3;
    this.ctx.fillStyle = `rgba(147, 197, 253, ${0.7 + 0.3 * pulse})`;
    this.ctx.beginPath();
    this.ctx.moveTo(bx + 16, by + 4 + floatY);
    this.ctx.lineTo(bx + 24, by + 16 + floatY);
    this.ctx.lineTo(bx + 16, by + 28 + floatY);
    this.ctx.lineTo(bx + 8, by + 16 + floatY);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.strokeStyle = '#93c5fd';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // Floating Standby Text
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 13px sans-serif';
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.shadowColor = 'rgba(0,0,0,0.85)';
    this.ctx.shadowBlur = 6;
    this.ctx.fillText('⚔️ [보스 레이드 대기실]', bx + 16, by - 36);

    this.ctx.font = '11px sans-serif';
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText('현재 출현한 보스가 없습니다', bx + 16, by - 18);
    this.ctx.fillText('(교사의 레이드 소환 대기 중)', bx + 16, by - 4);

    this.ctx.restore();
  }

  // High-Res Hallway Fallen Developer Note (떨어진 개발자노트 제1편 - 정수기와 거울 사이)
  drawHighResDevNote(px, py, labelText = '📜 떨어진 개발자노트 (제1편)') {
    this.ctx.save();
    const time = Date.now() / 1000;
    const pulse = 0.5 + 0.5 * Math.sin(time * 3);

    // 1. Shimmering Golden Aura on Floor
    this.ctx.fillStyle = `rgba(245, 158, 11, ${0.25 + 0.2 * pulse})`;
    this.ctx.beginPath();
    this.ctx.ellipse(px + 16, py + 24, 16 + pulse * 2, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Leather-bound vintage developer notebook (slightly tilted on ground)
    this.ctx.save();
    this.ctx.translate(px + 16, py + 14);
    this.ctx.rotate(-0.08);

    // Book Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.fillRect(-12, -4, 25, 18);

    // Leather Cover (Navy / Midnight Blue)
    this.ctx.fillStyle = '#1e1b4b';
    this.ctx.fillRect(-14, -10, 28, 20);
    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.lineWidth = 1.2;
    this.ctx.strokeRect(-14, -10, 28, 20);

    // Golden Spine & Corners
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(-14, -10, 4, 20);
    this.ctx.fillRect(11, -10, 3, 3);
    this.ctx.fillRect(11, 7, 3, 3);

    // Parchment Pages (Cream / Antique White)
    this.ctx.fillStyle = '#fef3c7';
    this.ctx.fillRect(-10, -8, 22, 16);

    // Handwritten Code / Note Lines
    this.ctx.fillStyle = '#92400e';
    this.ctx.fillRect(-8, -5, 12, 1.2);
    this.ctx.fillRect(-8, -2, 16, 1.2);
    this.ctx.fillRect(-8, 1, 14, 1.2);
    this.ctx.fillRect(-8, 4, 10, 1.2);

    // Red Bookmark Ribbon hanging out
    this.ctx.fillStyle = '#dc2626';
    this.ctx.beginPath();
    this.ctx.moveTo(0, 7);
    this.ctx.lineTo(3, 14);
    this.ctx.lineTo(0, 13);
    this.ctx.lineTo(-3, 14);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();

    // 3. Magical Sparkles (fixed to world coordinates)
    const sp1X = px + 16 + Math.cos(time * 2) * 14;
    const sp1Y = py + 12 + Math.sin(time * 2) * 8;
    this.ctx.fillStyle = '#fef08a';
    this.ctx.beginPath();
    this.ctx.arc(sp1X, sp1Y, 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    const sp2X = px + 16 + Math.sin(time * 2.7) * 12;
    const sp2Y = py + 14 + Math.cos(time * 2.7) * 9;
    this.ctx.fillStyle = '#fde047';
    this.ctx.beginPath();
    this.ctx.arc(sp2X, sp2Y, 1.2, 0, Math.PI * 2);
    this.ctx.fill();

    // 4. Sharp Badge Label (aligned to camera & world coordinates)
    this.drawSharpLabel(px + 16, py - 18, labelText, {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#f59e0b',
      textColor: '#fef08a',
      fontSize: 11,
      paddingX: 7,
      height: 19
    });

    this.ctx.restore();
  }

  // ========================================================
  // 🏛️ 숭실역사관: 고품격 박물관 & 4티어 몬스터 필드 렌더링
  // ========================================================

  // High-Res Polished Marble Checkerboard Floor Tile
  drawHighResMarbleFloor(tx, ty) {
    const px = tx * 32;
    const py = ty * 32;
    const isDark = (tx + ty) % 2 === 0;

    // High-polish marble stone base
    this.ctx.fillStyle = isDark ? '#1e293b' : '#334155';
    this.ctx.fillRect(px, py, 32, 32);

    // Marble subtle veining
    this.ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.14)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 4, py + 8);
    this.ctx.lineTo(px + 18, py + 22);
    this.ctx.lineTo(px + 28, py + 16);
    this.ctx.stroke();

    // Subtle edge bevel
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    this.ctx.fillRect(px, py, 32, 1);
    this.ctx.fillRect(px, py, 1, 32);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    this.ctx.fillRect(px, py + 31, 32, 1);
    this.ctx.fillRect(px + 31, py, 1, 32);
  }

  renderHistoryMuseum(cr) {
    const app = window.MainApp;
    let clues = [false, false, false, false];
    if (app && app.playerData) {
      if (Array.isArray(app.playerData.historyVitrines)) clues = app.playerData.historyVitrines;
      else if (Array.isArray(app.playerData.historyClues)) clues = app.playerData.historyClues;
    }
    const solvedCount = clues.filter(Boolean).length;
    const now = Date.now();

    // 1. Central Plush Red Velvet Runner (from exit door at 15, 17 to altar at 15, 5)
    this.ctx.fillStyle = '#881337'; // rich royal burgundy
    this.ctx.fillRect(13.8 * 32, 4.8 * 32, 2.4 * 32, 12.4 * 32);
    this.ctx.strokeStyle = '#f59e0b'; // golden border
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(13.8 * 32, 4.8 * 32, 2.4 * 32, 12.4 * 32);

    // Velvet gold fringe trims
    this.ctx.fillStyle = '#fbbf24';
    for (let gy = 5.2 * 32; gy < 17 * 32; gy += 16) {
      this.ctx.fillRect(13.8 * 32 - 1, gy, 2, 4);
      this.ctx.fillRect(16.2 * 32 - 1, gy, 2, 4);
    }

    // 2. Gilded Wall Portraits on North Wall (x: 8 Baird, x: 22 Jo Man-sik & Yun Dong-ju)
    this.drawMuseumPortrait(8 * 32, 2 * 32 - 4, '베어드 박사 (Baird)', '🏛️');
    this.drawMuseumPortrait(22 * 32, 2 * 32 - 4, '조만식 선생 & 윤동주', '🌟');

    // 3. Central Grand Mission Blackboard & History Banner
    const hw = 18 * 32;
    const hx = Math.round((15 * 32) - (hw / 2));
    this.drawSharpLabel(15 * 32, 1.8 * 32, '🏛️ [숭실역사관] 1897년 평양에서 시작된 127년 역사와 사명', {
      bgColor: 'rgba(15, 23, 42, 0.96)',
      borderColor: '#f59e0b',
      borderWidth: 2,
      textColor: '#fef08a',
      fontSize: 13,
      paddingX: 16,
      height: 26
    });

    // 4. Draw 4 Glass Display Vitrines (전시관 쇼케이스)
    // Vitrine 1 (x: 6, y: 7) - 1897 평양 창립관
    this.drawMuseumVitrine(6 * 32, 7 * 32, 1, '1897 평양 창립관', '📜', clues[0]);

    // Vitrine 2 (x: 6, y: 13) - 1938 민족신앙 수호관
    this.drawMuseumVitrine(6 * 32, 13 * 32, 2, '1938 민족신앙 수호관', '🕊️', clues[1]);

    // Vitrine 3 (x: 24, y: 7) - 1954 서울 재건관
    this.drawMuseumVitrine(24 * 32, 7 * 32, 3, '1954 서울 재건관', '🧱', clues[2]);

    // Vitrine 4 (x: 24, y: 13) - 숭실의 위인관
    this.drawMuseumVitrine(24 * 32, 13 * 32, 4, '숭실의 위인관', '✒️', clues[3]);

    // 5. Draw 4-Tier Heritage Weapon Crafting Altar (x: 15, y: 4)
    this.drawHeritageCraftAltar(15 * 32, 4.2 * 32, solvedCount >= 4);

    // 6. Render History Monsters (시간의 수호석상, 불멸의 파수병, 기록관 골렘, 사명의 기사)
    this.renderHistoryMonsters();

    // 7. Far Left Wall Secret Room Easter Egg Doorway (x: 1, y: 10)
    this.drawHistorySecretDoor(1 * 32, 10 * 32);

    // 8. Library Missing Book (숭실역사관 전시실 고문서 도록: x: 10, y: 5)
    if (!window.MainApp || typeof window.MainApp.isQuestLibBookHiCollected !== 'function' || !window.MainApp.isQuestLibBookHiCollected()) {
      this.drawQuestLibraryBook(10 * 32, 5 * 32, 'red');
    }
  }

  // Far Left Wall Secret Room Easter Egg Doorway in History Hall
  drawHistorySecretDoor(dx, dy) {
    const ctx = this.ctx;
    ctx.save();

    const app = window.MainApp;
    const isUnlocked = !!(app && app.playerData && app.playerData.secretHistoryRoomUnlocked);
    const time = Date.now() / 300;
    const pulse = 0.5 + 0.5 * Math.sin(time);

    // 1. Secret stone archway shadow and carved opening into left wall
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.roundRect(dx - 12, dy - 20, 36, 56, [14, 14, 0, 0]);
    ctx.fill();

    // 2. Subtle ancient golden or cyan rune outline
    ctx.strokeStyle = isUnlocked
      ? `rgba(56, 189, 248, ${0.6 + 0.4 * pulse})`
      : `rgba(245, 158, 11, ${0.4 + 0.4 * pulse})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Shimmering mystical particle glow inside the portal
    ctx.fillStyle = isUnlocked
      ? `rgba(56, 189, 248, ${0.2 + 0.2 * pulse})`
      : `rgba(251, 191, 36, ${0.15 + 0.15 * pulse})`;
    ctx.beginPath();
    ctx.roundRect(dx - 8, dy - 16, 28, 48, [12, 12, 0, 0]);
    ctx.fill();

    // 4. Floating ancient key icon
    const bob = Math.sin(time * 2) * 3;
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isUnlocked ? '✨' : '🗝️', dx + 6, dy + bob);

    // 5. Secret Easter egg archway - text label hidden as requested
    // (Player can interact naturally via SPACE prompt)

    ctx.restore();
  }

  // ========================================================
  // SCENE RENDERING: SECRET HISTORY ARCHIVE (역사관 절반 크기 비밀의 방)
  // ========================================================
  renderSecretHistoryRoom(cr) {
    const curW = this.getMapWidth(); // 16
    const curH = this.getMapHeight(); // 20

    // 1. Ancient Gilded Sanctuary Floor & Wall Bounds
    for (let tx = 0; tx < curW; tx++) {
      for (let ty = 0; ty < curH; ty++) {
        if (ty <= 2 || tx === 0 || tx === curW - 1 || ty >= curH - 2) {
          this.drawHighResWall(tx, ty, true);
        } else {
          // Dark royal slate marble floor tiles with subtle rune borders
          const isAlt = (tx + ty) % 2 === 0;
          this.ctx.fillStyle = isAlt ? '#0f172a' : '#1e293b';
          this.ctx.fillRect(tx * 32, ty * 32, 32, 32);
          this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(tx * 32, ty * 32, 32, 32);
        }
      }
    }

    // 2. Central Plush Crimson Velvet Runner (from door at x: 8, y: 17 to chest at x: 8, y: 5)
    this.ctx.fillStyle = '#881337'; // royal burgundy
    this.ctx.fillRect(7 * 32 + 2, 5 * 32, 2 * 32 - 4, 12 * 32);
    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(7 * 32 + 2, 5 * 32, 2 * 32 - 4, 12 * 32);

    // Velvet gold fringe trims
    this.ctx.fillStyle = '#fbbf24';
    for (let gy = 5.2 * 32; gy < 17 * 32; gy += 16) {
      this.ctx.fillRect(7 * 32 + 1, gy, 2, 4);
      this.ctx.fillRect(9 * 32 - 3, gy, 2, 4);
    }

    // 3. Wall Banner
    this.drawSharpLabel(8 * 32, 1.8 * 32, '🗝️ [숭실 비밀의 서고]', {
      bgColor: 'rgba(15, 23, 42, 0.96)',
      borderColor: '#fbbf24',
      borderWidth: 2,
      textColor: '#fef08a',
      fontSize: 12,
      paddingX: 14,
      height: 24
    });

    // 4. Wall Torches on North Wall
    this.drawWallTorch(4 * 32, 2 * 32 + 8);
    this.drawWallTorch(12 * 32, 2 * 32 + 8);

    // 5. Secret Treasure Chest (x: 8, y: 5)
    this.drawSecretTreasureChest(8 * 32, 5 * 32);

    // 6. Ancient Secret Bookshelves on Left & Right
    this.drawSecretBookshelf(3 * 32, 6 * 32, '📚 독립운동 비화록 (평양편)');
    this.drawSecretBookshelf(12 * 32, 6 * 32, '📚 127년 사명록 (서울편)');

    // 7. Exit Door Archway (x: 8, y: 17)
    this.drawSecretRoomExitDoor(8 * 32, 17 * 32);
  }

  // Draw Wall Torch / Sconce with animated flame
  drawWallTorch(x, y) {
    const ctx = this.ctx;
    ctx.save();
    // Iron bracket
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 14, y + 10, 4, 12);
    ctx.fillRect(x + 11, y + 8, 10, 4);
    // Torch cup
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 12, y + 5, 8, 4);
    // Animated flickering flame
    const flicker = Math.sin(Date.now() / 80 + x) * 2;
    const flameH = 10 + Math.sin(Date.now() / 110 + y) * 3;
    // Outer glow
    ctx.fillStyle = 'rgba(249, 115, 22, 0.2)';
    ctx.beginPath();
    ctx.arc(x + 16, y - 2, 14, 0, Math.PI * 2);
    ctx.fill();
    // Flame
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(x + 16 + flicker, y - 2, 5, flameH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.ellipse(x + 16 + flicker * 0.5, y - 1, 2.5, flameH / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw Ancient Secret Bookshelf
  drawSecretBookshelf(x, y, label) {
    const ctx = this.ctx;
    ctx.save();
    // Mahogany wood frame
    ctx.fillStyle = '#3b1706';
    ctx.fillRect(x, y, 44, 52);
    ctx.fillStyle = '#54230b';
    ctx.fillRect(x + 3, y + 3, 38, 46);
    // Shelf divider
    ctx.fillStyle = '#3b1706';
    ctx.fillRect(x + 3, y + 25, 38, 4);
    // Leather book spines
    const bookColors = ['#991b1b', '#1e3a8a', '#15803d', '#b45309', '#581c87', '#0f766e'];
    for (let bx = x + 5; bx < x + 38; bx += 5) {
      ctx.fillStyle = bookColors[(bx * 7) % bookColors.length];
      ctx.fillRect(bx, y + 7, 4, 18);
      ctx.fillRect(bx, y + 29, 4, 18);
      // Gold foil ribbing
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(bx, y + 12, 4, 1.5);
      ctx.fillRect(bx, y + 34, 4, 1.5);
    }
    this.drawSharpLabel(x + 22, y + 54, label, {
      bgColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#fbbf24',
      borderWidth: 1.2,
      textColor: '#fef08a',
      fontSize: 10,
      paddingX: 6,
      height: 18
    });
    ctx.restore();
  }

  // Draw Secret Treasure Chest
  drawSecretTreasureChest(x, y) {
    const ctx = this.ctx;
    ctx.save();
    const app = window.MainApp;
    const isOpened = app && app.playerData && app.playerData.openedSecretHistoryChest;
    const time = Date.now() / 250;
    const bob = Math.sin(time) * 2;

    // Altar pedestal
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 8, y + 14, 48, 16);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 8, y + 14, 48, 16);

    // Glowing aura
    const pulse = 0.3 + 0.2 * Math.sin(time * 1.5);
    ctx.fillStyle = isOpened ? 'rgba(148, 163, 184, 0.2)' : `rgba(245, 158, 11, ${pulse})`;
    ctx.beginPath();
    ctx.arc(x + 16, y + 8 + bob, 22, 0, Math.PI * 2);
    ctx.fill();

    // Chest Body (Ancient Gilded Mahogany)
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2 + bob, 28, 18, 3);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Gold Straps
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x + 6, y + 2 + bob, 3, 18);
    ctx.fillRect(x + 23, y + 2 + bob, 3, 18);

    // Keyhole or Opened Glow
    if (isOpened) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + 16, y + 7 + bob, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(x + 16, y + 10 + bob, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x + 15, y + 10 + bob, 2, 4);
    }

    // Label
    const chestLabel = isOpened ? '✨ 숭실 고대 비전의 보물함 (개방됨)' : '✨ 숭실 고대 비전의 보물함';
    this.drawSharpLabel(x + 16, y + 28, chestLabel, {
      bgColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: isOpened ? '#94a3b8' : '#f59e0b',
      borderWidth: 1.5,
      textColor: isOpened ? '#94a3b8' : '#fef08a',
      fontSize: 11,
      paddingX: 8,
      height: 20
    });
    ctx.restore();
  }

  // Draw Secret Room Exit Door leading back to History Museum
  drawSecretRoomExitDoor(x, y) {
    const ctx = this.ctx;
    ctx.save();
    // Archway
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.roundRect(x - 20, y - 6, 72, 14, [4, 4, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // Draw Gilded Museum Oil Painting Portrait
  drawMuseumPortrait(px, py, title, icon) {
    this.ctx.save();
    // Gold Frame
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px - 14, py - 12, 28, 30);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(px - 12, py - 10, 24, 26);
    // Canvas
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px - 9, py - 7, 18, 20);

    // Icon
    this.ctx.font = '14px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(icon, px, py + 2);

    this.ctx.restore();
  }

  // Draw Museum Glass Vitrine Display Case
  drawMuseumVitrine(px, py, index, label, relicIcon, visited) {
    this.ctx.save();

    // 1. Ceiling Spotlight Beam
    this.ctx.fillStyle = visited ? 'rgba(250, 204, 21, 0.15)' : 'rgba(56, 189, 248, 0.12)';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 16, py - 40);
    this.ctx.lineTo(px - 12, py + 24);
    this.ctx.lineTo(px + 44, py + 24);
    this.ctx.closePath();
    this.ctx.fill();

    // 2. Mahogany Wood Plinth / Stand
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(px - 6, py + 12, 44, 18);
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px - 4, py + 14, 40, 14);

    // 3. Brass Plate with Vitrine Number
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillRect(px + 6, py + 18, 20, 6);

    // 4. Tempered Glass Vitrine Enclosure
    this.ctx.fillStyle = visited ? 'rgba(254, 240, 138, 0.18)' : 'rgba(224, 242, 254, 0.22)';
    this.ctx.fillRect(px - 2, py - 16, 36, 28);
    this.ctx.strokeStyle = visited ? '#fbbf24' : '#38bdf8';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(px - 2, py - 16, 36, 28);

    // Glass reflection diagonal glare
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 4, py - 14);
    this.ctx.lineTo(px + 28, py + 8);
    this.ctx.stroke();

    // 5. Floating Relic Artifact
    this.ctx.font = '16px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(relicIcon, px + 16, py - 2);

    // 6. Vitrine Pill Badge
    const badgeText = visited ? `✓ ${label}` : `🔍 ${label}`;
    this.drawSharpLabel(px + 16, py - 28, badgeText, {
      bgColor: visited ? 'rgba(20, 83, 45, 0.95)' : 'rgba(15, 23, 42, 0.95)',
      borderColor: visited ? '#4ade80' : '#38bdf8',
      textColor: visited ? '#86efac' : '#e0f2fe',
      fontSize: 11.5,
      paddingX: 8,
      height: 20
    });

    this.ctx.restore();
  }

  // Draw 4-Tier Heritage Weapon Crafting Altar
  drawHeritageCraftAltar(px, py, unlocked) {
    this.ctx.save();

    // Glowing Sacred Altar Base
    this.ctx.fillStyle = unlocked ? 'rgba(245, 158, 11, 0.25)' : 'rgba(100, 116, 139, 0.18)';
    this.ctx.beginPath();
    this.ctx.ellipse(px + 16, py + 18, 36, 14, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Granite Pedestal
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px - 14, py + 4, 60, 20);
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(px - 12, py + 6, 56, 16);

    // Golden Anvil / Weapon Forge Shrine
    this.ctx.fillStyle = unlocked ? '#d97706' : '#64748b';
    this.ctx.fillRect(px - 4, py - 8, 40, 12);
    this.ctx.fillStyle = unlocked ? '#fbbf24' : '#94a3b8';
    this.ctx.fillRect(px + 2, py - 12, 28, 4);

    // Sacred Sword Silhouette
    this.ctx.font = '20px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('⚔️', px + 16, py - 10);

    // Label
    const altarTitle = unlocked ? '✨ 숭실 역사관 신비한 제단' : '🔒 숭실 역사관 신비한 제단';
    this.drawSharpLabel(px + 16, py - 28, altarTitle, {
      bgColor: unlocked ? 'rgba(120, 53, 15, 0.95)' : 'rgba(30, 41, 59, 0.95)',
      borderColor: unlocked ? '#f59e0b' : '#64748b',
      textColor: unlocked ? '#fef08a' : '#cbd5e1',
      fontSize: 12,
      paddingX: 10,
      height: 22
    });

    this.ctx.restore();
  }

  // Roaming & Respawn Logic for Cafeteria Monsters (5마리 음식물 & 잔반 몬스터)
  updateCafeteriaMonsters() {
    if (!this.player || this.player.room !== 'room_cafeteria') return;
    const cr = this.getCurrentClassroomData();
    if (!cr || !cr.cafeteriaMonsters) return;

    const now = Date.now();
    for (const mob of cr.cafeteriaMonsters) {
      if (mob.defeated) {
        if (mob.respawnAt && now >= mob.respawnAt) {
          mob.defeated = false;
          mob.hp = mob.maxHp;
          if (mob.spawnX !== undefined && mob.spawnY !== undefined) {
            mob.x = mob.spawnX;
            mob.y = mob.spawnY;
          } else if (mob.id === 'caf_mob_kitchen_1') {
            mob.x = 5; mob.y = 6;
          } else if (mob.id === 'caf_mob_kitchen_2') {
            mob.x = 8; mob.y = 11;
          } else if (mob.id === 'caf_mob_teacher_1') {
            mob.x = 36; mob.y = 4;
          } else if (mob.id === 'caf_mob_teacher_2') {
            mob.x = 36; mob.y = 12;
          } else if (mob.zone === 'tray_return') {
            mob.x = 36; mob.y = 18;
          } else if (mob.id === 'caf_mob_table_1') {
            mob.x = 18; mob.y = 8;
          } else {
            mob.x = 24; mob.y = 11;
          }
          mob.targetX = mob.x;
          mob.targetY = mob.y;
        }
        continue;
      }

      if (mob.inBattle) continue;

      if (mob.roam) {
        if (mob.targetX === undefined || mob.targetY === undefined) {
          mob.targetX = mob.x;
          mob.targetY = mob.y;
          mob.nextMoveTime = now + 1000 + Math.random() * 2000;
        }

        const dx = mob.targetX - mob.x;
        const dy = mob.targetY - mob.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 0.1) {
          mob.x = mob.targetX;
          mob.y = mob.targetY;
          if (now >= (mob.nextMoveTime || 0)) {
            if (mob.id === 'caf_mob_kitchen_1') {
              mob.targetX = Math.round((4 + Math.random() * 3) * 10) / 10;
              mob.targetY = Math.round((5 + Math.random() * 2) * 10) / 10;
            } else if (mob.id === 'caf_mob_kitchen_2') {
              mob.targetX = Math.round((6 + Math.random() * 3) * 10) / 10;
              mob.targetY = Math.round((10 + Math.random() * 2) * 10) / 10;
            } else if (mob.id === 'caf_mob_teacher_1') {
              mob.targetX = Math.round((34 + Math.random() * 4) * 10) / 10;
              mob.targetY = Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
            } else if (mob.id === 'caf_mob_teacher_2') {
              mob.targetX = Math.round((34 + Math.random() * 4) * 10) / 10;
              mob.targetY = Math.round((11.5 + Math.random() * 1.5) * 10) / 10;
            } else if (mob.zone === 'tray_return') {
              mob.targetX = Math.round((34 + Math.random() * 4) * 10) / 10;
              mob.targetY = Math.round((17 + Math.random() * 3) * 10) / 10;
            } else if (mob.id === 'caf_mob_table_1') {
              mob.targetX = 18;
              mob.targetY = Math.round((6 + Math.random() * 7) * 10) / 10;
            } else {
              mob.targetX = 24;
              mob.targetY = Math.round((6 + Math.random() * 7) * 10) / 10;
            }
            mob.nextMoveTime = now + 2500 + Math.random() * 3500;
          }
        } else {
          const step = 0.015;
          mob.x += (dx / dist) * Math.min(step, dist);
          mob.y += (dy / dist) * Math.min(step, dist);
        }
      }
    }
  }

  renderCafeteriaMonsters() {
    const cr = this.getCurrentClassroomData();
    if (!cr || !cr.cafeteriaMonsters) return;

    const now = Date.now();
    for (const mob of cr.cafeteriaMonsters) {
      if (mob.defeated) continue;

      const floatY = Math.sin((now + mob.x * 200) / 200) * 3;
      const px = mob.x * 32;
      const py = mob.y * 32 + floatY;

      // Drop shadow on floor
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.beginPath();
      this.ctx.ellipse(px + 16, mob.y * 32 + 28, 14, 6, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Monster Sprite with Food/Waste Aura
      this.ctx.save();
      this.ctx.fillStyle = mob.zone === 'kitchen' ? 'rgba(234, 88, 12, 0.25)' :
                           (mob.zone === 'tray_return' ? 'rgba(161, 98, 7, 0.25)' :
                           (mob.zone === 'teacher_room' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(56, 189, 248, 0.25)'));
      this.ctx.beginPath();
      this.ctx.arc(px + 16, py + 12, 18, 0, Math.PI * 2);
      this.ctx.fill();

      // Main Icon
      this.ctx.font = '22px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(mob.icon, px + 16, py + 12);
      this.ctx.restore();

      // HP Bar
      const hpW = 42;
      const hpH = 6;
      const hpX = px + 16 - hpW / 2;
      const hpY = py - 14;
      const hpPct = Math.max(0, Math.min(1, mob.hp / mob.maxHp));

      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      this.ctx.fillRect(hpX - 1, hpY - 1, hpW + 2, hpH + 2);
      this.ctx.fillStyle = '#dc2626';
      this.ctx.fillRect(hpX, hpY, hpW, hpH);
      this.ctx.fillStyle = hpPct > 0.5 ? '#16a34a' : (hpPct > 0.25 ? '#f59e0b' : '#ef4444');
      this.ctx.fillRect(hpX, hpY, hpW * hpPct, hpH);

      // Name & Icon Label below
      this.drawSharpLabel(px + 16, py + 38, `${mob.icon} ${mob.name}`, {
        bgColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#10b981',
        textColor: '#a7f3d0',
        fontSize: 11,
        paddingX: 8,
        height: 20
      });
    }
  }

  // Roaming & Respawn Logic for History Museum Monsters
  updateHistoryMonsters() {
    if (!this.player || this.player.room !== 'room_history') return;
    const cr = this.getCurrentClassroomData();
    if (!cr || !cr.historyMonsters) return;

    const now = Date.now();
    for (const mob of cr.historyMonsters) {
      if (mob.defeated) {
        if (mob.respawnAt && now >= mob.respawnAt) {
          mob.defeated = false;
          mob.hp = mob.maxHp;
          mob.x = Math.round(8 + Math.random() * 14);
          mob.y = Math.round(7 + Math.random() * 8);
          mob.targetX = mob.x;
          mob.targetY = mob.y;
        }
        continue;
      }

      if (mob.inBattle) continue;

      if (mob.roam) {
        if (mob.targetX === undefined || mob.targetY === undefined) {
          mob.targetX = mob.x;
          mob.targetY = mob.y;
          mob.nextMoveTime = now + 1000 + Math.random() * 2000;
        }

        const dx = mob.targetX - mob.x;
        const dy = mob.targetY - mob.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 0.1) {
          mob.x = mob.targetX;
          mob.y = mob.targetY;
          if (now >= (mob.nextMoveTime || 0)) {
            // Pick new target in museum wings (x: 8 ~ 22, y: 7 ~ 15)
            mob.targetX = Math.round((8 + Math.random() * 14) * 10) / 10;
            mob.targetY = Math.round((7 + Math.random() * 8) * 10) / 10;
            mob.nextMoveTime = now + 2500 + Math.random() * 3500;
          }
        } else {
          const step = 0.015;
          mob.x += (dx / dist) * Math.min(step, dist);
          mob.y += (dy / dist) * Math.min(step, dist);
        }
      }
    }
  }

  renderHistoryMonsters() {
    const cr = this.getCurrentClassroomData();
    if (!cr || !cr.historyMonsters) return;

    const now = Date.now();
    for (const mob of cr.historyMonsters) {
      if (mob.defeated) continue;

      const floatY = Math.sin((now + mob.x * 200) / 200) * 3;
      const px = mob.x * 32;
      const py = mob.y * 32 + floatY;

      // Drop shadow on marble floor
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      this.ctx.beginPath();
      this.ctx.ellipse(px + 16, mob.y * 32 + 28, 14, 6, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Monster Sprite
      this.drawHistoryMonsterSprite(px, py, mob, now);

      // HP Bar
      const hpW = 42;
      const hpH = 6;
      const hpX = px + 16 - hpW / 2;
      const hpY = py - 14;
      const hpPct = Math.max(0, Math.min(1, mob.hp / mob.maxHp));

      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      this.ctx.fillRect(hpX - 1, hpY - 1, hpW + 2, hpH + 2);
      this.ctx.fillStyle = '#dc2626';
      this.ctx.fillRect(hpX, hpY, hpW, hpH);
      this.ctx.fillStyle = hpPct > 0.5 ? '#16a34a' : (hpPct > 0.25 ? '#f59e0b' : '#ef4444');
      this.ctx.fillRect(hpX, hpY, hpW * hpPct, hpH);

      // Name & Icon Label below
      this.drawSharpLabel(px + 16, py + 38, `${mob.icon} ${mob.name}`, {
        bgColor: 'rgba(30, 41, 59, 0.95)',
        borderColor: '#a855f7',
        textColor: '#e9d5ff',
        fontSize: 11.5,
        paddingX: 8,
        height: 20
      });
    }
  }

  // Draw History Guardian Monster Sprite
  drawHistoryMonsterSprite(px, py, mob, now) {
    this.ctx.save();

    // Sacred stone / ancient aura
    this.ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 12, 18, 0, Math.PI * 2);
    this.ctx.fill();

    // Main Icon / Sprite Body
    this.ctx.font = '22px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(mob.icon, px + 16, py + 12);

    this.ctx.restore();
  }

  // ========================================================
  // 1학년 5반 (연금과학 연구실) 전용 고해상도 렌더링
  // - 졍경슉 선생님의 신비한 연금술 & 마법 과학 실험실
  // - 흑요석/자수정 바닥 타일, 회전하는 연성 마법진
  // - 보글보글 끓어오르는 대형 연금술 솥과 신비한 불꽃
  // - 비전 시약 선반, 연금술 비전서, 정밀 과학 증류대, 룬 촉매 반응대
  // ========================================================

  drawHighResAlchemyFloor(tx, ty) {
    const px = tx * 32;
    const py = ty * 32;
    const isDark = (tx + ty) % 2 === 0;

    // Obsidian and Dark Amethyst stone foundation
    this.ctx.fillStyle = isDark ? '#120e24' : '#1c1538';
    this.ctx.fillRect(px, py, 32, 32);

    // Stone tile border bevel
    this.ctx.fillStyle = 'rgba(192, 132, 252, 0.08)';
    this.ctx.fillRect(px, py, 32, 1);
    this.ctx.fillRect(px, py, 1, 32);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.ctx.fillRect(px, py + 31, 32, 1);
    this.ctx.fillRect(px + 31, py, 1, 32);

    // Subtle alchemical rune geometric etching on specific tiles
    if ((tx * 7 + ty * 13) % 5 === 0) {
      this.ctx.strokeStyle = 'rgba(168, 85, 247, 0.14)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(px + 6, py + 6, 20, 20);
      this.ctx.beginPath();
      this.ctx.moveTo(px + 16, py + 6);
      this.ctx.lineTo(px + 16, py + 26);
      this.ctx.moveTo(px + 6, py + 16);
      this.ctx.lineTo(px + 26, py + 16);
      this.ctx.stroke();
    }
  }

  renderAlchemyLabClassroom(cr) {
    const now = Date.now();

    // 1. Velvet Alchemical Runner Carpet (From Door at 15, 17 up to Magic Circle border at y: 10)
    this.ctx.fillStyle = '#3b0764'; // Deep royal amethyst velvet
    this.ctx.fillRect(13.5 * 32, 10 * 32, 3 * 32, 7.2 * 32);
    this.ctx.strokeStyle = '#c084fc';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(13.5 * 32, 10 * 32, 3 * 32, 7.2 * 32);

    // Golden fringe trim along runner edges
    this.ctx.fillStyle = '#f59e0b';
    for (let gy = 10.2 * 32; gy < 17 * 32; gy += 16) {
      this.ctx.fillRect(13.5 * 32 - 1, gy, 2, 4);
      this.ctx.fillRect(16.5 * 32 - 1, gy, 2, 4);
    }

    // 2. Central Transmutation Magic Circle (Centered at Cauldron x: 15*32 + 16, y: 7*32 + 16)
    this.drawAlchemicalTransmutationCircle(15 * 32 + 16, 7 * 32 + 16, now);

    // 3. Left Wall & Shelf: 🧪 신비한 비전 시약 선반 (x: 7, y: 4)
    this.drawAlchemicalShelf(7 * 32, 4 * 32);

    // 4. Right Wall & Lectern: 📚 졍경슉 선생님의 연금술 비전서 (x: 23, y: 4)
    this.drawAlchemicalTome(23 * 32, 4 * 32, now);

    // 5. Left Distillation Workbench: 🔬 정밀 과학 증류 실험대 (x: 6, y: 11)
    this.drawDistillationWorkbench(6 * 32, 11 * 32, now);

    // 6. Right Runic Catalyst Workbench: ✨ 마법 룬 촉매 반응대 (x: 24, y: 11)
    this.drawRunicCatalystWorkbench(24 * 32, 11 * 32, now);

    // 7. Center: ⚗️ 끓어오르는 대형 연금술 가마솥 (x: 15, y: 7)
    this.drawAlchemicalCauldron(15 * 32 + 16, 7 * 32 + 16, now);

    // 8. Floating Ambient Mana Motes & Alchemical Sparkles
    this.drawAlchemyLabAtmosphere(now);
  }

  // Draw Glowing Transmutation Magic Circle on Floor
  drawAlchemicalTransmutationCircle(cx, cy, now) {
    this.ctx.save();

    // Pulsating ambient aura
    const pulse = 0.5 + 0.5 * Math.sin(now / 700);
    const grad = this.ctx.createRadialGradient(cx, cy, 10, cx, cy, 95);
    grad.addColorStop(0, `rgba(168, 85, 247, ${0.28 + pulse * 0.12})`);
    grad.addColorStop(0.6, `rgba(99, 102, 241, ${0.12 + pulse * 0.08})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 95, 0, Math.PI * 2);
    this.ctx.fill();

    // Outer & Inner concentric circles
    this.ctx.strokeStyle = `rgba(192, 132, 252, ${0.65 + pulse * 0.25})`;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 76, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    this.ctx.lineWidth = 1.2;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 68, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    this.ctx.stroke();

    // Rotating Runic Star (6-point Seal)
    const rot = (now / 4500) % (Math.PI * 2);
    this.ctx.translate(cx, cy);
    this.ctx.rotate(rot);

    this.ctx.strokeStyle = `rgba(192, 132, 252, ${0.5 + pulse * 0.3})`;
    this.ctx.lineWidth = 1.5;

    // Triangle 1
    this.ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI / 3) - Math.PI / 2;
      const x = Math.cos(angle) * 48;
      const y = Math.sin(angle) * 48;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.stroke();

    // Triangle 2 (inverted)
    this.ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI / 3) + Math.PI / 2;
      const x = Math.cos(angle) * 48;
      const y = Math.sin(angle) * 48;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.stroke();

    // Small glowing rune node dots
    for (let i = 0; i < 6; i++) {
      const angle = i * Math.PI / 3;
      const rx = Math.cos(angle) * 48;
      const ry = Math.sin(angle) * 48;
      this.ctx.fillStyle = '#fde047';
      this.ctx.beginPath();
      this.ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  // Draw The Great Alchemical Cauldron
  drawAlchemicalCauldron(cx, cy, now) {
    this.ctx.save();

    // 1. Drop shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy + 18, 28, 10, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Crackling Fire Pit beneath
    for (let f = -3; f <= 3; f++) {
      const flameH = 12 + Math.sin(now / 120 + f * 1.5) * 6;
      const fx = cx + f * 5;
      const fy = cy + 16;
      this.ctx.fillStyle = (f % 2 === 0) ? '#6366f1' : '#a855f7'; // mystical violet/blue flames
      this.ctx.beginPath();
      this.ctx.moveTo(fx - 4, fy);
      this.ctx.lineTo(fx, fy - flameH);
      this.ctx.lineTo(fx + 4, fy);
      this.ctx.closePath();
      this.ctx.fill();

      // Golden core
      this.ctx.fillStyle = '#fef08a';
      this.ctx.beginPath();
      this.ctx.moveTo(fx - 2, fy);
      this.ctx.lineTo(fx, fy - flameH * 0.6);
      this.ctx.lineTo(fx + 2, fy);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // 3. Tripod Iron Legs
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(cx - 20, cy + 8, 4, 12);
    this.ctx.fillRect(cx + 16, cy + 8, 4, 12);
    this.ctx.fillRect(cx - 2, cy + 10, 4, 10);

    // 4. Heavy Obsidian/Cast-Iron Cauldron Belly
    const bellyGrad = this.ctx.createRadialGradient(cx - 6, cy - 2, 4, cx, cy, 26);
    bellyGrad.addColorStop(0, '#475569');
    bellyGrad.addColorStop(0.5, '#1e293b');
    bellyGrad.addColorStop(1, '#090d16');
    this.ctx.fillStyle = bellyGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy + 4, 24, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // Cauldron Bronze Rivets & Belt
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(cx - 23, cy + 2, 46, 3);
    for (let r = -3; r <= 3; r++) {
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.beginPath();
      this.ctx.arc(cx + r * 6, cy + 3.5, 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Side Brass Rings / Handles
    this.ctx.strokeStyle = '#d97706';
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeRect(cx - 28, cy - 2, 5, 8);
    this.ctx.strokeRect(cx + 23, cy - 2, 5, 8);

    // 5. Cauldron Rim & Boiling Magical Potion
    this.ctx.fillStyle = '#334155';
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy - 12, 22, 9, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Boiling Glowing Liquid (Luminescent Emerald & Violet Swirl)
    const liquidGrad = this.ctx.createLinearGradient(cx - 20, cy - 12, cx + 20, cy - 12);
    liquidGrad.addColorStop(0, '#10b981');
    liquidGrad.addColorStop(0.5, '#a855f7');
    liquidGrad.addColorStop(1, '#06b6d4');
    this.ctx.fillStyle = liquidGrad;
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy - 12, 19, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Rising Bubbles & Pops
    for (let b = 0; b < 5; b++) {
      const bProgress = ((now + b * 260) % 1200) / 1200;
      const bx = cx - 12 + ((b * 7) % 24);
      const by = (cy - 12) - (bProgress * 22);
      const bRad = 1.5 + (1 - bProgress) * 2;
      this.ctx.fillStyle = `rgba(254, 240, 138, ${1 - bProgress})`;
      this.ctx.beginPath();
      this.ctx.arc(bx, by, bRad, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Swirling Ethereal Vapor
    const vaporOffset = Math.sin(now / 350) * 8;
    this.ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(cx - 6, cy - 18);
    this.ctx.quadraticCurveTo(cx + vaporOffset, cy - 30, cx - 4, cy - 44);
    this.ctx.stroke();

    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    this.ctx.beginPath();
    this.ctx.moveTo(cx + 8, cy - 18);
    this.ctx.quadraticCurveTo(cx - vaporOffset, cy - 32, cx + 6, cy - 46);
    this.ctx.stroke();

    // Sharp Label
    this.drawSharpLabel(cx, cy - 36, '⚗️ 끓어오르는 연금술 가마솥', {
      bgColor: 'rgba(59, 7, 100, 0.94)',
      borderColor: '#c084fc',
      textColor: '#fef08a',
      fontSize: 11.5,
      paddingX: 10,
      height: 22
    });

    this.ctx.restore();
  }

  // Draw Alchemical Potion & Reagent Shelf
  drawAlchemicalShelf(cx, cy) {
    this.ctx.save();

    // 2-Story Dark Mahogany Cabinet
    this.ctx.fillStyle = '#27170a';
    this.ctx.fillRect(cx - 16, cy - 24, 64, 52);
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(cx - 14, cy - 22, 60, 48);

    // Shelves
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(cx - 14, cy - 4, 60, 4);
    this.ctx.fillRect(cx - 14, cy + 18, 60, 4);

    // Upper Shelf Potion Bottles
    const bottleColors = ['#22c55e', '#06b6d4', '#ec4899', '#f59e0b', '#a855f7'];
    for (let i = 0; i < 5; i++) {
      const bx = cx - 10 + i * 11;
      const by = cy - 18;
      // Glass bottle
      this.ctx.fillStyle = bottleColors[i];
      this.ctx.fillRect(bx, by + 4, 8, 10);
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.fillRect(bx + 2, by, 4, 4);
      // Cork
      this.ctx.fillStyle = '#b45309';
      this.ctx.fillRect(bx + 2, by - 2, 4, 2);
    }

    // Lower Shelf: Grimoires and Crystal Cluster
    this.ctx.fillStyle = '#1e1b4b'; // Book 1
    this.ctx.fillRect(cx - 10, cy, 7, 18);
    this.ctx.fillStyle = '#831843'; // Book 2
    this.ctx.fillRect(cx - 2, cy + 2, 8, 16);
    this.ctx.fillStyle = '#065f46'; // Book 3
    this.ctx.fillRect(cx + 7, cy, 7, 18);

    // Amethyst cluster in jar
    this.ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
    this.ctx.fillRect(cx + 18, cy + 2, 14, 16);
    this.ctx.fillStyle = '#c084fc';
    this.ctx.beginPath();
    this.ctx.moveTo(cx + 25, cy + 4);
    this.ctx.lineTo(cx + 29, cy + 15);
    this.ctx.lineTo(cx + 21, cy + 15);
    this.ctx.closePath();
    this.ctx.fill();

    // Sharp Label
    this.drawSharpLabel(cx + 16, cy - 32, '🧪 신비한 비전 시약 선반', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#38bdf8',
      textColor: '#a7f3d0',
      fontSize: 11,
      paddingX: 8,
      height: 20
    });

    this.ctx.restore();
  }

  // Draw Alchemical Grimoire Lectern & Quill
  drawAlchemicalTome(cx, cy, now) {
    this.ctx.save();

    // Antique dark wood pedestal stand
    this.ctx.fillStyle = '#27170a';
    this.ctx.fillRect(cx + 12, cy + 10, 8, 20);
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(cx + 4, cy + 26, 24, 6);

    // Slanted book resting board
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(cx - 8, cy - 4, 48, 16);

    // Open Ancient Grimoire Pages
    this.ctx.fillStyle = '#fef3c7'; // Aged parchment
    this.ctx.fillRect(cx - 6, cy - 8, 20, 15);
    this.ctx.fillRect(cx + 16, cy - 8, 20, 15);
    this.ctx.fillStyle = '#78350f'; // Book spine
    this.ctx.fillRect(cx + 13, cy - 9, 4, 17);

    // Glowing Runic Text on Pages
    this.ctx.fillStyle = '#7c2d12';
    for (let line = 0; line < 3; line++) {
      this.ctx.fillRect(cx - 3, cy - 6 + line * 4, 14, 1.5);
      this.ctx.fillRect(cx + 19, cy - 6 + line * 4, 14, 1.5);
    }

    // Floating Magical Glyph above book
    const floatY = Math.sin(now / 300) * 3;
    this.ctx.fillStyle = '#fde047';
    this.ctx.font = 'bold 11px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('✨', cx + 15, cy - 14 + floatY);

    // Golden Feather Quill & Inkwell
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(cx + 34, cy + 6, 6, 6);
    this.ctx.strokeStyle = '#fbbf24';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(cx + 37, cy + 6);
    this.ctx.lineTo(cx + 44, cy - 6);
    this.ctx.stroke();

    // Sharp Label
    this.drawSharpLabel(cx + 16, cy - 32, '📚 졍경슉 선생님의 연금술 비전서', {
      bgColor: 'rgba(88, 28, 135, 0.94)',
      borderColor: '#f59e0b',
      textColor: '#fef08a',
      fontSize: 11,
      paddingX: 8,
      height: 20
    });

    this.ctx.restore();
  }

  // Draw High-Res Science Distillation Workbench
  drawDistillationWorkbench(cx, cy, now) {
    this.ctx.save();

    // Sturdy Science Wooden Workbench
    this.ctx.fillStyle = '#292524';
    this.ctx.fillRect(cx - 12, cy + 8, 56, 18);
    this.ctx.fillStyle = '#44403c';
    this.ctx.fillRect(cx - 10, cy + 6, 52, 16);
    this.ctx.fillStyle = '#78716c'; // Smooth stone tabletop
    this.ctx.fillRect(cx - 14, cy + 2, 60, 5);

    // Bunsen Burner & Stand (Left)
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(cx - 8, cy - 2, 12, 4);
    // Flickering Blue Flame
    const bFlameH = 5 + Math.sin(now / 100) * 2;
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.beginPath();
    this.ctx.moveTo(cx - 4, cy - 2);
    this.ctx.lineTo(cx - 2, cy - 2 - bFlameH);
    this.ctx.lineTo(cx, cy - 2);
    this.ctx.closePath();
    this.ctx.fill();

    // Boiling Flask above flame
    this.ctx.fillStyle = 'rgba(224, 242, 254, 0.4)';
    this.ctx.beginPath();
    this.ctx.arc(cx - 2, cy - 10, 7, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#f59e0b'; // Boiling amber liquid
    this.ctx.beginPath();
    this.ctx.arc(cx - 2, cy - 8, 5, 0, Math.PI);
    this.ctx.fill();

    // Glass Distillation Coil Tube
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(cx - 2, cy - 17);
    this.ctx.lineTo(cx + 8, cy - 17);
    this.ctx.lineTo(cx + 14, cy - 8);
    this.ctx.lineTo(cx + 20, cy - 4);
    this.ctx.stroke();

    // Collecting Beaker (Right)
    this.ctx.fillStyle = 'rgba(224, 242, 254, 0.4)';
    this.ctx.fillRect(cx + 17, cy - 6, 9, 9);
    this.ctx.fillStyle = '#10b981'; // Emerald distillate
    this.ctx.fillRect(cx + 18, cy - 1, 7, 4);

    // Test Tube Rack (Far Right)
    this.ctx.fillStyle = '#a8a29e';
    this.ctx.fillRect(cx + 30, cy - 2, 12, 5);
    const tubeColors = ['#ef4444', '#3b82f6', '#10b981'];
    for (let t = 0; t < 3; t++) {
      this.ctx.fillStyle = tubeColors[t];
      this.ctx.fillRect(cx + 31 + t * 4, cy - 10, 2.5, 9);
    }

    // Sharp Label
    this.drawSharpLabel(cx + 16, cy - 26, '🔬 정밀 과학 증류 실험대', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#10b981',
      textColor: '#a7f3d0',
      fontSize: 10.5,
      paddingX: 8,
      height: 20
    });

    this.ctx.restore();
  }

  // Draw Runic Catalyst Station Workbench
  drawRunicCatalystWorkbench(cx, cy, now) {
    this.ctx.save();

    // Sturdy Science Wooden Workbench
    this.ctx.fillStyle = '#292524';
    this.ctx.fillRect(cx - 12, cy + 8, 56, 18);
    this.ctx.fillStyle = '#44403c';
    this.ctx.fillRect(cx - 10, cy + 6, 52, 16);
    this.ctx.fillStyle = '#78716c'; // Smooth stone tabletop
    this.ctx.fillRect(cx - 14, cy + 2, 60, 5);

    // Left: Floating Amethyst Crystal Catalyst
    const floatY = Math.sin(now / 250) * 3;
    this.ctx.fillStyle = 'rgba(192, 132, 252, 0.35)'; // Crystal aura
    this.ctx.beginPath();
    this.ctx.arc(cx - 2, cy - 8 + floatY, 9, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#c084fc';
    this.ctx.beginPath();
    this.ctx.moveTo(cx - 2, cy - 16 + floatY);
    this.ctx.lineTo(cx + 4, cy - 7 + floatY);
    this.ctx.lineTo(cx - 2, cy - 1 + floatY);
    this.ctx.lineTo(cx - 8, cy - 7 + floatY);
    this.ctx.closePath();
    this.ctx.fill();

    // Center: Stone Mortar & Pestle with Sparkles
    this.ctx.fillStyle = '#334155';
    this.ctx.beginPath();
    this.ctx.arc(cx + 14, cy - 1, 6, 0, Math.PI);
    this.ctx.fill();
    this.ctx.fillStyle = '#fde047'; // Gold dust
    this.ctx.fillRect(cx + 11, cy - 3, 6, 2);
    this.ctx.strokeStyle = '#64748b'; // Pestle
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(cx + 14, cy - 2);
    this.ctx.lineTo(cx + 19, cy - 8);
    this.ctx.stroke();

    // Right: Brass Alchemy Balance Scale
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(cx + 28, cy - 10, 2, 12); // Pole
    this.ctx.fillRect(cx + 24, cy + 1, 10, 2); // Base
    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(cx + 23, cy - 9);
    this.ctx.lineTo(cx + 35, cy - 9); // Crossbar
    this.ctx.stroke();
    // Pans
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillRect(cx + 21, cy - 3, 5, 2);
    this.ctx.fillRect(cx + 33, cy - 3, 5, 2);

    // Sharp Label
    this.drawSharpLabel(cx + 16, cy - 26, '✨ 마법 룬 촉매 반응대', {
      bgColor: 'rgba(88, 28, 135, 0.94)',
      borderColor: '#c084fc',
      textColor: '#fef08a',
      fontSize: 10.5,
      paddingX: 8,
      height: 20
    });

    this.ctx.restore();
  }

  // Draw Floating Ambient Mana Motes
  drawAlchemyLabAtmosphere(now) {
    this.ctx.save();
    const sparkPositions = [
      { x: 8 * 32, y: 7 * 32, speed: 800, color: 'rgba(192, 132, 252, 0.65)' },
      { x: 22 * 32, y: 8 * 32, speed: 950, color: 'rgba(56, 189, 248, 0.65)' },
      { x: 11 * 32, y: 13 * 32, speed: 1100, color: 'rgba(250, 204, 21, 0.6)' },
      { x: 19 * 32, y: 13 * 32, speed: 750, color: 'rgba(52, 211, 153, 0.65)' },
      { x: 14 * 32, y: 5 * 32, speed: 850, color: 'rgba(244, 114, 182, 0.65)' },
      { x: 16 * 32, y: 5 * 32, speed: 900, color: 'rgba(192, 132, 252, 0.7)' }
    ];

    for (let i = 0; i < sparkPositions.length; i++) {
      const sp = sparkPositions[i];
      const offsetX = Math.sin((now + i * 400) / sp.speed) * 8;
      const offsetY = Math.cos((now + i * 500) / sp.speed) * 8;
      const px = sp.x + offsetX;
      const py = sp.y + offsetY;
      const rad = 1.5 + Math.sin((now + i * 200) / 300) * 0.8;

      this.ctx.fillStyle = sp.color;
      this.ctx.beginPath();
      this.ctx.arc(px, py, rad, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  // ========================================================
  // 6층 교무실 (Staff Office) 인테리어 바닥 · 벽면 · 가구 · 교1~25 좌석 시스템
  // - 맵 106 x 26 타일 / 좌측 앞문 · 우측 뒷문 2개 입구
  // - 하단 교사석 6개 분단 (분단 간 간격 약 10타일)
  // ========================================================

  getStaffOfficeLayout() {
    if (this._staffOfficeLayout) return this._staffOfficeLayout;
    this._staffOfficeLayout = {
      topClusterLeft: 66, // 31 · 32 · 33 T자 클러스터 (tx 66..69, ty 5..8)
      topClusterLabels: { top: '31', l: '32', r: '33' },
      counsel: { x1: 84, x2: 100, doorX1: 90, doorX2: 92 }, // 상담실
      clusters: [
        { type: 'five', left: 9, labels: { tl: '1', tr: '2', ml: '3', mr: '4', bottom: '5' } }, // 1분단: 5석 (Joshua: 3번 좌석)
        { type: 'five', left: 24, labels: { tl: '6', tr: '7', ml: '8', mr: '9', bottom: '10' } }, // 2분단: 5석
        { type: 'diamond', left: 39, labels: { top: '11', l: '12', r: '13', bottom: '14' } }, // 3분단: 1-2-1 4석
        { type: 'five', left: 56, labels: { tl: '15', tr: '16', ml: '17', mr: '18', bottom: '19' } }, // 4분단: 5석
        { type: 'five', left: 72, labels: { tl: '20', tr: '21', ml: '22', mr: '23', bottom: '24' } }, // 5분단: 5석
        { type: 'six', left: 87, labels: { tl: '25', tr: '26', ml: '27', mr: '28', bl: '29', br: '30' } } // 6분단: 6석 (3x2)
      ]
    };
    return this._staffOfficeLayout;
  }

  drawStaffOfficeFloorTile(tx, ty) {
    const px = tx * 32;
    const py = ty * 32;
    const L = this.getStaffOfficeLayout();

    // 1. 소회의실 (Small Conference Room, tx: 7..28, ty: 3..10)
    if (tx >= 7 && tx <= 28 && ty >= 3 && ty <= 10) {
      const isDark = (tx + ty) % 2 === 0;
      this.ctx.fillStyle = isDark ? '#78350f' : '#6b2f0e';
      this.ctx.fillRect(px, py, 32, 32);

      // 중앙 회의 테이블 아래 네이비 러그 (tx: 11..23, ty: 4..8)
      if (tx >= 11 && tx <= 23 && ty >= 4 && ty <= 8) {
        this.ctx.fillStyle = '#1e3a8a';
        this.ctx.fillRect(px, py, 32, 32);
      }
      return;
    }

    // 2. 탕비실 및 진입 통로 (tx: 29..35, ty: 3..10 & tx: 36..51, ty: 3..5)
    if ((tx >= 29 && tx <= 35 && ty >= 3 && ty <= 10) || (tx >= 36 && tx <= 51 && ty >= 3 && ty <= 5)) {
      const isCheck = (tx + ty) % 2 === 0;
      this.ctx.fillStyle = isCheck ? '#ffedd5' : '#fde4c8';
      this.ctx.fillRect(px, py, 32, 32);
      return;
    }

    // 3. 인쇄실 (Printing Room, tx: 36..52, ty: 6..10)
    if (tx >= 36 && tx <= 52 && ty >= 6 && ty <= 10) {
      const isEven = (tx + ty) % 2 === 0;
      this.ctx.fillStyle = isEven ? '#f8fafc' : '#eef2f7';
      this.ctx.fillRect(px, py, 32, 32);
      return;
    }

    // 4. 상담실 (Counseling Room)
    if (tx >= L.counsel.x1 && tx <= L.counsel.x2 && ty >= 3 && ty <= 10) {
      const isAlt = (tx + ty) % 2 === 0;
      this.ctx.fillStyle = isAlt ? '#ede0d4' : '#e6d3bf';
      this.ctx.fillRect(px, py, 32, 32);

      // 상담 테이블 아래 세이지 그린 러그
      if (tx >= L.counsel.x1 + 4 && tx <= L.counsel.x1 + 10 && ty >= 5 && ty <= 8) {
        this.ctx.fillStyle = '#d1fae5';
        this.ctx.fillRect(px, py, 32, 32);
      }
      return;
    }

    // 5. 중앙 가로 메인 통로 런너 (앞문 <---> 뒷문 : ty: 11..13)
    if (ty >= 11 && ty <= 13) {
      this.ctx.fillStyle = '#1e293b';
      this.ctx.fillRect(px, py, 32, 32);
      if (ty === 11) {
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.fillRect(px, py + 1, 32, 2);
      }
      if (ty === 13) {
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.fillRect(px, py + 29, 32, 2);
      }
      return;
    }

    // 6. 교무실 본실 교사 집무 구역 슬레이트 카페트
    const isDarkSlate = (tx + ty) % 2 === 0;
    this.ctx.fillStyle = isDarkSlate ? '#334155' : '#3a4a60';
    this.ctx.fillRect(px, py, 32, 32);
  }

  isCareerRoomWall(tileX, tileY) {
    // 5층 진로상담실 우측: 세로 배치 (상단: 1:1 상담실 1 / 하단: 1:1 상담실 2)
    // 가로 폭 14타일 (x: 43..57) & 서쪽(왼쪽) 출입문

    // [1:1 상담실 1 - 상단 (x: 43..57, y: 4..9)]
    // 1-A. 북쪽 벽 (y: 4, x: 43..57)
    if (tileY === 4 && tileX >= 43 && tileX <= 57) return true;
    // 1-B. 남쪽 벽 (y: 9, x: 43..57 - 아래쪽 완전 차단)
    if (tileY === 9 && tileX >= 43 && tileX <= 57) return true;
    // 1-C. 동쪽 벽 (x: 57, y: 4..9)
    if (tileX === 57 && tileY >= 4 && tileY <= 9) return true;
    // 1-D. 서쪽 벽 (x: 43, y: 4..9, 출입문: y 6..7 통행 가능)
    if (tileX === 43 && ((tileY >= 4 && tileY <= 5) || (tileY >= 8 && tileY <= 9))) return true;
    // 1-E. 상담 테이블 1 충돌 판정 (x: 50, y: 6..7)
    if ((tileY === 6 || tileY === 7) && tileX === 50) return true;
    // 1-F. 가장 구석 책상 위 진로 적성 검사 안내서 (x: 55, y: 5)
    if (tileY === 5 && tileX === 55) return true;

    // [1:1 상담실 2 - 하단 (x: 43..57, y: 11..16)]
    // 2-A. 북쪽 벽 (y: 11, x: 43..57)
    if (tileY === 11 && tileX >= 43 && tileX <= 57) return true;
    // 2-B. 남쪽 벽 (y: 16, x: 43..57 - 아래쪽 완전 차단)
    if (tileY === 16 && tileX >= 43 && tileX <= 57) return true;
    // 2-C. 동쪽 벽 (x: 57, y: 11..16)
    if (tileX === 57 && tileY >= 11 && tileY <= 16) return true;
    // 2-D. 서쪽 벽 (x: 43, y: 11..16, 출입문: y 13..14 통행 가능)
    if (tileX === 43 && ((tileY >= 11 && tileY <= 12) || (tileY >= 15 && tileY <= 16))) return true;
    // 2-E. 코칭 테이블 2 충돌 판정 (x: 50, y: 13..14)
    if ((tileY === 13 || tileY === 14) && tileX === 50) return true;

    return false;
  }

  isStaffOfficeWall(tx, ty) {
    const L = this.getStaffOfficeLayout();

    // 1. 소회의실 벽체 (좌 tx=7, 우 tx=28, 하 ty=10 / 우측 하단 문: tx 22..24)
    if ((tx === 7 || tx === 28) && ty >= 3 && ty <= 10) return true;
    if (ty === 10 && tx >= 7 && tx <= 28) {
      if (tx >= 22 && tx <= 24) return false;
      return true;
    }
    // 소회의실 회의 테이블
    if (tx >= 13 && tx <= 21 && ty >= 5 && ty <= 7) return true;

    // 2. 탕비실 조리대 · 냉장고 · 정수기 (tx: 36..50, ty: 3)
    if (ty === 3 && tx >= 36 && tx <= 50) return true;

    // 3. 탕비실 / 인쇄실 벽체
    if (ty === 6 && tx >= 36 && tx <= 52) return true;           // 인쇄실 상단벽
    if (tx === 36 && ty >= 6 && ty <= 10) return true;           // 인쇄실 좌측벽
    if (tx === 52 && ty >= 3 && ty <= 10) return true;           // 탕비실·인쇄실 우측벽
    if (ty === 10 && tx >= 36 && tx <= 52) {                     // 인쇄실 하단벽 (문: tx 43..45)
      if (tx >= 43 && tx <= 45) return false;
      return true;
    }
    // 인쇄실 복합기 · 작업대
    if (ty === 7 && tx >= 38 && tx <= 49) return true;

    // 4. 상담실 벽체
    const C = L.counsel;
    if ((tx === C.x1 || tx === C.x2) && ty >= 3 && ty <= 10) return true;
    if (ty === 10 && tx >= C.x1 && tx <= C.x2) {
      if (tx >= C.doorX1 && tx <= C.doorX2) return false;
      return true;
    }
    // 상담실 원형 테이블
    if (ty === 6 && tx >= C.x1 + 6 && tx <= C.x1 + 8) return true;

    // 5. 상단 1 · 2 · 3 클러스터
    const T = L.topClusterLeft;
    if (tx >= T && tx <= T + 3 && ty >= 5 && ty <= 8) return true;

    // 6. 하단 교사석 6개 분단
    for (const c of L.clusters) {
      const x = c.left;
      if (c.type === 'five' || c.type === 'six') {
        if (tx >= x && tx <= x + 4 && ty >= 15 && ty <= 21) return true;
      } else if (c.type === 'diamond') {
        if (tx >= x && tx <= x + 4 && ty >= 15 && ty <= 21) return true;
      }
    }

    return false;
  }

  renderStaffOffice(cr) {
    const L = this.getStaffOfficeLayout();
    const C = L.counsel;

    // 1. 상단 부속실 내부 가구 및 소품
    this.drawStaffOfficeRoomsInterior();

    // 2. 상단 부속실 벽체 — 열린 출입구 통로 (문 그래픽 없이 자유로운 통행)
    // 2-A. 소회의실
    this.drawStaffOfficeWallRun(7, 3, 7, 9);
    this.drawStaffOfficeWallRun(28, 3, 28, 9);
    this.drawStaffOfficeWallRun(7, 10, 21, 10);
    this.drawStaffOfficeWallRun(25, 10, 28, 10);

    // 2-B. 탕비실 · 인쇄실
    this.drawStaffOfficeWallRun(52, 3, 52, 10);
    this.drawStaffOfficeWallRun(36, 7, 36, 9);
    this.drawStaffOfficeWallRun(36, 6, 51, 6);
    this.drawStaffOfficeWallRun(36, 10, 42, 10);
    this.drawStaffOfficeWallRun(46, 10, 51, 10);

    // 2-C. 상담실
    this.drawStaffOfficeWallRun(C.x1, 3, C.x1, 9);
    this.drawStaffOfficeWallRun(C.x2, 3, C.x2, 9);
    this.drawStaffOfficeWallRun(C.x1, 10, C.doorX1 - 1, 10);
    this.drawStaffOfficeWallRun(C.doorX2 + 1, 10, C.x2, 10);

    // 3. 1 ~ 33번 교사 좌석 클러스터
    this.drawStaffOfficeAllTeacherClusters();

    // 4. 앞문 · 뒷문 입구
    this.drawStaffOfficeEntrances();

    // 5. 실 이름표
    this.drawStaffOfficeSignage();

    // 6. 상호작용 오브젝트 (예: 탕비실 안쪽 떨어진 개발자노트 제3편 및 Joshua의 단어 메모)
    if (cr && cr.interactive) {
      for (const obj of cr.interactive) {
        if (obj.type === 'dev_note_3') {
          this.drawHighResDevNote(obj.x * 32, obj.y * 32, obj.name || '📜 떨어진 개발자노트 (제3편)');
        } else if (obj.type === 'quest_memo') {
          this.drawStaffOfficeQuestMemo(obj.x * 32, obj.y * 32);
        } else if (obj.type === 'quest_okchohan_book') {
          this.drawStaffOfficeSocialBook(obj.x * 32, obj.y * 32);
        } else if (obj.type === 'quest_kimmijin_book') {
          this.drawStaffOfficeArtSketchbook(obj.x * 32, obj.y * 32);
        } else if (obj.type === 'quest_yosunyu_usb') {
          this.drawStaffOfficeUsb(obj.x * 32, obj.y * 32);
        } else if (obj.type === 'quest_career_book') {
          this.drawCareerQuestGuideBook(obj.x * 32, obj.y * 32);
        } else if (obj.type === 'quest_library_book_of') {
          if (!window.MainApp || typeof window.MainApp.isQuestLibBookOfCollected !== 'function' || !window.MainApp.isQuestLibBookOfCollected()) {
            this.drawQuestLibraryBook(obj.x * 32, obj.y * 32, 'green');
          }
        } else if (obj.type === 'cafeteria_key_safe') {
          this.drawStaffOfficeCafeteriaSafe(obj.x * 32, obj.y * 32);
        }
      }
    }
  }

  // 6층 교무실 소회의실 비밀 문서 보관함 (급식실 열쇠 보관함) 렌더링
  drawStaffOfficeCafeteriaSafe(px, py) {
    const ctx = this.ctx;
    ctx.save();

    const hasKey = (window.MainApp && typeof window.MainApp.hasItem === 'function' && window.MainApp.hasItem('item_cafeteria_key')) ||
      (window.MainApp && window.MainApp.playerData && window.MainApp.playerData.hasCafeteriaKey);

    const bob = Math.sin(Date.now() / 280) * 3;
    const pulse = (Math.sin(Date.now() / 320) + 1) / 2;

    // 1. 바닥 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(px + 16, py + 26, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. 보관함 본체 (앤틱 오크 목재 & 황동 금고)
    const sx = px + 2;
    const sy = py + 2;
    const sw = 28;
    const sh = 26;

    // 본체 외곽
    ctx.fillStyle = '#291404';
    ctx.fillRect(sx, sy, sw, sh);

    // 전면 플레이트
    ctx.fillStyle = '#451a03';
    ctx.fillRect(sx + 2, sy + 2, sw - 4, sh - 4);

    // 황동 테두리 및 코너 보강 리벳
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx + 1, sy + 1, sw - 2, sh - 2);

    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(sx + 3, sy + 3, 2, 2);
    ctx.fillRect(sx + sw - 5, sy + 3, 2, 2);
    ctx.fillRect(sx + 3, sy + sh - 5, 2, 2);
    ctx.fillRect(sx + sw - 5, sy + sh - 5, 2, 2);

    // 중앙 다이얼 / 1897 헤리티지 문양
    ctx.fillStyle = hasKey ? '#10b981' : '#d97706';
    ctx.beginPath();
    ctx.arc(px + 16, py + 15, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (hasKey) {
      // 열쇠 획득 완료 상태: 개방된 초록 잠금구
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(px + 15, py + 13, 2, 4);
    } else {
      // 열쇠 미획득: 황금빛 펄스 및 플로팅 황금 열쇠 아이콘
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(px + 15, py + 13, 2, 4);

      ctx.fillStyle = `rgba(245, 158, 11, ${0.25 + pulse * 0.35})`;
      ctx.beginPath();
      ctx.arc(px + 16, py - 6 + bob, 14 + pulse * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔑', px + 16, py - 6 + bob);
    }

    ctx.restore();
  }

  // 교무실 머리 위 플로팅 퀘스트 상태 마커 (! / ?)
  drawFloatingQuestMarker(cx, cy, status) {
    if (!status || status === 'done') return;
    const ctx = this.ctx;
    ctx.save();

    // 부드러운 상하 바운스 모션
    const bob = Math.sin(Date.now() / 240) * 3.5;
    const my = cy + bob;

    if (status === 'locked') {
      // 0. 자물쇠 [ 🔒 ] (레벨 부족 잠김)
      ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.arc(cx, my, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', cx, my);

    } else if (status === 'available') {
      // 1. 노란색 느낌표 [ ! ] + 빛나는 펄스 아우라
      const pulse = (Math.sin(Date.now() / 200) + 1) / 2;

      // 은은한 외곽 골드 글로우
      ctx.fillStyle = `rgba(234, 179, 8, ${0.25 + pulse * 0.3})`;
      ctx.beginPath();
      ctx.arc(cx, my, 14 + pulse * 3, 0, Math.PI * 2);
      ctx.fill();

      // 골드 서클 배지
      ctx.shadowColor = 'rgba(234, 179, 8, 0.9)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(cx, my, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // [ ! ] 느낌표 텍스트
      ctx.shadowBlur = 0;
      ctx.font = '900 15px "Pretendard", "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1e1b4b';
      ctx.fillText('!', cx, my);

    } else if (status === 'in_progress') {
      // 2. 회색 물음표 [ ? ] (진행 중)
      ctx.shadowColor = 'rgba(100, 116, 139, 0.6)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(cx, my, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.stroke();

      // [ ? ] 물음표 텍스트
      ctx.shadowBlur = 0;
      ctx.font = '900 14px "Pretendard", "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText('?', cx, my);

    } else if (status === 'completed') {
      // 3. 반짝이는 초록색 물음표 [ ? ] + 광휘 펄스 + 궤도 회전 반짝이 별 (✦)
      const pulse = (Math.sin(Date.now() / 180) + 1) / 2;

      // 에메랄드 광휘 아우라
      ctx.fillStyle = `rgba(16, 185, 129, ${0.3 + pulse * 0.35})`;
      ctx.beginPath();
      ctx.arc(cx, my, 16 + pulse * 4, 0, Math.PI * 2);
      ctx.fill();

      // 반짝이는 에메랄드 그린 배지
      ctx.shadowColor = 'rgba(16, 185, 129, 0.95)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(cx, my, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // [ ? ] 물음표 텍스트
      ctx.shadowBlur = 0;
      ctx.font = '900 15px "Pretendard", "Noto Sans KR", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('?', cx, my);

      // 주위를 공전하는 반짝이 별 (✦)
      const t = Date.now() / 320;
      const r = 16;
      const sparkles = [
        { angle: t, color: '#fef08a', size: 11 },
        { angle: t + (Math.PI * 2 / 3), color: '#ffffff', size: 9 },
        { angle: t + (Math.PI * 4 / 3), color: '#6ee7b7', size: 10 }
      ];

      for (const sp of sparkles) {
        const sx = cx + Math.cos(sp.angle) * r;
        const sy = my + Math.sin(sp.angle) * (r * 0.7);
        ctx.font = `bold ${sp.size}px sans-serif`;
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 8;
        ctx.fillText('✦', sx, sy);
      }
    }

    ctx.restore();
  }

  // 6층 교무실 인쇄실 근처 놓인 옥촣한 선생님의 사회 탐구 교재 렌더링
  drawStaffOfficeSocialBook(x, y) {
    if (window.MainApp && typeof window.MainApp.isQuestSocialBookCollected === 'function' && window.MainApp.isQuestSocialBookCollected()) {
      return;
    }
    const ctx = this.ctx;
    ctx.save();

    const bob = Math.sin(Date.now() / 200) * 2;
    const by = y + bob;

    // 바닥 부드러운 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 24, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 청색 빛나는 글로우 아우라
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.arc(x + 16, by + 12, 16, 0, Math.PI * 2);
    ctx.fill();

    // 파란색 고급 양장본 책 표지
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.roundRect(x + 6, by + 4, 20, 16, 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 책등(Spine)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 6, by + 4, 3.5, 16);

    // 책 속지(White pages edge)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 9.5, by + 5, 15, 14);

    // 표지 겉표면 & 황금 엠블럼
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x + 10.5, by + 5, 14, 14);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x + 17.5, by + 12, 3, 0, Math.PI * 2);
    ctx.fill();

    // 텍스트 라벨 (펄스)
    const labelOpacity = 0.85 + Math.sin(Date.now() / 250) * 0.15;
    ctx.globalAlpha = labelOpacity;
    this.drawSharpLabel(x + 16, by - 6, '📘 옥촣한의 사회 교재', {
      bgColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: '#38bdf8',
      textColor: '#7dd3fc',
      fontSize: 10,
      paddingX: 6,
      height: 16
    });

    ctx.restore();
  }

  // 6층 교무실 상담실 테이블에 놓인 김진믜 선생님의 풍경화 스케치북 렌더링
  drawStaffOfficeArtSketchbook(x, y) {
    if (window.MainApp && typeof window.MainApp.isQuestSketchbookCollected === 'function' && window.MainApp.isQuestSketchbookCollected()) {
      return;
    }
    const ctx = this.ctx;
    ctx.save();

    const bob = Math.sin(Date.now() / 200) * 2;
    const by = y + bob;

    // 바닥 부드러운 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 24, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 핑크/바이올렛 예술적 글로우 아우라
    ctx.fillStyle = 'rgba(244, 114, 182, 0.28)';
    ctx.beginPath();
    ctx.arc(x + 16, by + 12, 16, 0, Math.PI * 2);
    ctx.fill();

    // 스케치북 겉표지 (부드러운 크림 핑크 양장 스케치북)
    ctx.fillStyle = '#fdf2f8';
    ctx.beginPath();
    ctx.roundRect(x + 5, by + 3, 22, 17, 2);
    ctx.fill();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // 상단 와이어 스프링 제본 (Spiral Wire Binding)
    ctx.fillStyle = '#64748b';
    for (let sx = x + 7; sx <= x + 23; sx += 3.5) {
      ctx.fillRect(sx, by + 2, 2, 3);
    }

    // 스케치북 속 풍경화 미니 캔버스 (녹색 언덕 + 햇살 + 파란 하늘)
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(x + 8, by + 6, 16, 12);
    // 푸른 언덕
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(x + 14, by + 17, 7, Math.PI, 0);
    ctx.fill();
    // 노란 햇살
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x + 20, by + 9, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 미니 붓 (Wooden Brush)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 18, by + 14, 7, 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(x + 25, by + 13.5, 3, 3);

    // 텍스트 라벨 (펄스)
    const labelOpacity = 0.85 + Math.sin(Date.now() / 250) * 0.15;
    ctx.globalAlpha = labelOpacity;
    this.drawSharpLabel(x + 16, by - 6, '🎨 김진믜의 스케치북', {
      bgColor: 'rgba(30, 27, 75, 0.92)',
      borderColor: '#f472b6',
      textColor: '#fbcfe8',
      fontSize: 10,
      paddingX: 6,
      height: 16
    });

    ctx.restore();
  }

  // 5층 진로상담실 상담 데스크에 놓인 귐즨숑 선생님의 진로 적성 검사 안내서 렌더링
  drawCareerQuestGuideBook(x, y) {
    if (window.MainApp && typeof window.MainApp.isQuestCareerBookCollected === 'function' && window.MainApp.isQuestCareerBookCollected()) {
      return;
    }
    const ctx = this.ctx;
    ctx.save();

    // 1. 단정한 원목 상담 데스크 바닥 그림자 & 테이블
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 28, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 원목 테이블 상판 & 다리
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 4, y + 8, 40, 18);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x - 2, y + 10, 36, 14);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x, y + 24, 4, 6);
    ctx.fillRect(x + 28, y + 24, 4, 6);

    // 테이블 매트
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fillRect(x + 4, y + 11, 24, 12);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4, y + 11, 24, 12);

    const bob = Math.sin(Date.now() / 200) * 2;
    const by = y + bob - 4;

    // 희망찬 황금빛 & 스카이블루 아우라
    const glowPulse = 0.25 + Math.sin(Date.now() / 180) * 0.15;
    ctx.fillStyle = `rgba(56, 189, 248, ${glowPulse})`;
    ctx.beginPath();
    ctx.arc(x + 16, by + 12, 16, 0, Math.PI * 2);
    ctx.fill();

    // 감청색/사파이어 블루 진로 안내서 표지
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x + 6, by + 3, 20, 20, 3);
    } else {
      ctx.rect(x + 6, by + 3, 20, 20);
    }
    ctx.fill();
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 책 속지 (하얀색 내지)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 8, by + 5, 16, 16);

    // 표지 금박 별 문양 (진로의 별 🌟)
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x + 16, by + 13, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 책갈피 리본 (황금색)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 15, by + 17, 3, 7);

    // 플로팅 아이콘 및 텍스트 뱃지
    this.drawSharpLabel(x + 16, by - 6, '📘 진로 적성 검사 안내서', {
      bgColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: '#60a5fa',
      borderWidth: 1.5,
      textColor: '#fef08a',
      fontSize: 10,
      paddingX: 7,
      height: 18
    });

    ctx.restore();
  }

  // 6층 교무실 소회의실 대형 테이블에 놓인 요션유 선생님의 알고리즘 USB 렌더링
  drawStaffOfficeUsb(x, y) {
    if (window.MainApp && typeof window.MainApp.isQuestUsbCollected === 'function' && window.MainApp.isQuestUsbCollected()) {
      return;
    }
    const ctx = this.ctx;
    ctx.save();

    const bob = Math.sin(Date.now() / 200) * 2;
    const by = y + bob;

    // 바닥 부드러운 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 24, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 사이버틱 네온 사이언 글로우 아우라 (Cybernetic Blue/Cyan Glow)
    const glowPulse = 0.25 + Math.sin(Date.now() / 180) * 0.12;
    ctx.fillStyle = `rgba(6, 182, 212, ${glowPulse})`;
    ctx.beginPath();
    ctx.arc(x + 16, by + 12, 16, 0, Math.PI * 2);
    ctx.fill();

    // USB 본체 금속 케이스 (미드나잇 블루 & 딥 슬레이트 바디)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x + 9, by + 4, 14, 16, 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // USB 앞단 금색/실버 단자 (USB-A Connector)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + 12, by + 1, 8, 4);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 13.5, by + 2, 2, 2);
    ctx.fillRect(x + 16.5, by + 2, 2, 2);

    // USB 본체 중앙 미니 칩 라인
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 11, by + 7, 10, 8);

    // 깜빡이는 동작 LED (Blinking Cyan Activity LED)
    const ledOn = Math.sin(Date.now() / 150) > 0;
    ctx.fillStyle = ledOn ? '#06b6d4' : '#0e7490';
    ctx.beginPath();
    ctx.arc(x + 16, by + 11, 2, 0, Math.PI * 2);
    ctx.fill();

    // 고리 구멍 (Keyring Hole)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + 16, by + 17, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 텍스트 라벨 (펄스)
    const labelOpacity = 0.85 + Math.sin(Date.now() / 250) * 0.15;
    ctx.globalAlpha = labelOpacity;
    this.drawSharpLabel(x + 16, by - 6, '💾 요션유의 알고리즘 USB', {
      bgColor: 'rgba(8, 47, 73, 0.94)',
      borderColor: '#38bdf8',
      textColor: '#e0f2fe',
      fontSize: 10,
      paddingX: 6,
      height: 16
    });

    ctx.restore();
  }

  // 탕비실 구석 떨어진 Joshua의 단어 메모 오브젝트 그래픽
  drawStaffOfficeQuestMemo(px, py) {
    if (window.MainApp && typeof window.MainApp.isQuestMemoCollected === 'function' && window.MainApp.isQuestMemoCollected()) {
      return; // 이미 회수한 경우 바닥에 표시하지 않음
    }
    const ctx = this.ctx;
    ctx.save();

    const bob = Math.sin(Date.now() / 260) * 3;
    const pulse = (Math.sin(Date.now() / 300) + 1) / 2;

    // 바닥 골든 반사광
    ctx.fillStyle = `rgba(234, 179, 8, ${0.2 + pulse * 0.25})`;
    ctx.beginPath();
    ctx.ellipse(px + 16, py + 22, 16 + pulse * 4, 9 + pulse * 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 살짝 회전된 양피지 노트
    ctx.save();
    ctx.translate(px + 16, py + 14 + bob);
    ctx.rotate(0.08);

    ctx.fillStyle = '#fef9c3';
    ctx.fillRect(-11, -13, 22, 26);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-11, -13, 22, 26);

    // 노트 줄글 텍스처
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-8, -8, 16, 2);
    ctx.fillRect(-8, -3, 14, 2);
    ctx.fillRect(-8, 2, 16, 2);
    ctx.fillRect(-8, 7, 10, 2);

    // 상단 레드 북마크 탭
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(5, -15, 4, 6);

    ctx.restore();

    // 플로팅 라벨
    this.drawSharpLabel(px + 16, py + 36, '📝 Joshua의 단어 메모', {
      bgColor: 'rgba(120, 53, 15, 0.95)',
      borderColor: '#fbbf24',
      textColor: '#fef08a',
      fontSize: 11,
      paddingX: 7,
      height: 19
    });

    ctx.restore();
  }

  // 끊김 없는 단일 벽체 (타일마다 줄무늬가 생기지 않도록 한 번에 그림)
  drawStaffOfficeWallRun(tx1, ty1, tx2, ty2) {
    const ctx = this.ctx;
    const x = tx1 * 32;
    const y = ty1 * 32;
    const w = (tx2 - tx1 + 1) * 32;
    const h = (ty2 - ty1 + 1) * 32;
    const vertical = (tx1 === tx2) && (ty2 > ty1);

    ctx.save();
    // 바닥 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fillRect(x + 3, y + 4, w, h);

    if (vertical) {
      // 위에서 내려다본 세로 벽: 양옆 테두리 + 밝은 상판 한 줄
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(x + 5, y, w - 10, h);
    } else {
      // 가로 벽: 상판 캡 + 벽면 + 걸레받이
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(x, y, w, 9);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x, y + 9, w, h - 15);
      ctx.fillStyle = '#475569';
      ctx.fillRect(x, y + h - 6, w, 6);
    }

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5);
    ctx.restore();
  }

  // 가로 문 (문틀 기둥 2개 + 문턱 한 줄)
  drawStaffOfficeDoorRun(tx1, tx2, ty) {
    const ctx = this.ctx;
    const x = tx1 * 32;
    const y = ty * 32;
    const w = (tx2 - tx1 + 1) * 32;

    ctx.save();
    // 문턱 플레이트
    ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
    ctx.fillRect(x, y + 12, w, 8);
    // 문틀 기둥
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 2, y + 2, 6, 28);
    ctx.fillRect(x + w - 4, y + 2, 6, 28);
    ctx.restore();
  }

  drawStaffOfficeRoomsInterior() {
    const ctx = this.ctx;
    const C = this.getStaffOfficeLayout().counsel;

    // =========================================================
    // [1] 소회의실 (tx: 8..27, ty: 3..9)
    // =========================================================
    // 북측 벽면 화이트보드
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(13 * 32, 2 * 32 + 4, 9 * 32, 22);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(13 * 32, 2 * 32 + 4, 9 * 32, 22);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(14 * 32, 2 * 32 + 9, 7 * 32, 3);

    // 회의 테이블 (tx: 13..21, ty: 5..7)
    const confX = 13 * 32;
    const confY = 5 * 32;
    const confW = 9 * 32;
    const confH = 3 * 32;

    for (let cx = 14; cx <= 20; cx += 2) {
      this.drawStaffOfficeChair(cx * 32 + 16, 4 * 32 + 20, 'down');
      this.drawStaffOfficeChair(cx * 32 + 16, 8 * 32 + 12, 'up');
    }
    this.drawStaffOfficeChair(12 * 32 + 18, 6 * 32 + 16, 'right');
    this.drawStaffOfficeChair(22 * 32 + 14, 6 * 32 + 16, 'left');

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(confX + 4, confY + 6, confW, confH);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(confX, confY, confW, confH);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(confX + 4, confY + 4, confW - 8, confH - 8);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(confX + 8, confY + 8, confW - 16, confH - 16);

    for (let cx = 14; cx <= 20; cx += 2) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx * 32 + 8, confY + 10, 14, 10);
      ctx.fillRect(cx * 32 + 8, confY + confH - 20, 14, 10);
    }
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(17 * 32 + 4, confY + 36, 24, 18);

    // 사이드보드 & 화분
    ctx.fillStyle = '#57534e';
    ctx.fillRect(8 * 32 + 10, 5 * 32, 24, 64);
    this.drawOfficePlantPot(9 * 32 + 16, 3 * 32 + 20);
    this.drawOfficePlantPot(26 * 32 + 16, 3 * 32 + 20);

    // =========================================================
    // [2] 탕비실 (tx: 29..51, ty: 3..5)
    // =========================================================
    const panX = 36 * 32;
    const panY = 3 * 32;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(panX, panY, 12 * 32, 30);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(panX, panY + 26, 12 * 32, 4);

    // 싱크대
    ctx.fillStyle = '#64748b';
    ctx.fillRect(37 * 32 + 6, panY + 5, 44, 18);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(37 * 32 + 24, panY + 2, 6, 8);

    // 커피머신 & 전기포트
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(40 * 32 + 6, panY + 3, 28, 20);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(40 * 32 + 10, panY + 6, 6, 4);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(41 * 32 + 14, panY + 5, 18, 16);

    // 전자레인지
    ctx.fillStyle = '#334155';
    ctx.fillRect(44 * 32 + 4, panY + 4, 38, 20);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(44 * 32 + 8, panY + 7, 22, 14);

    // 냉장고
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(48 * 32 + 4, panY, 56, 32);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(48 * 32 + 4, panY, 56, 32);
    ctx.fillStyle = '#475569';
    ctx.fillRect(48 * 32 + 31, panY + 2, 2, 28);

    // 정수기
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(50 * 32 + 6, panY + 2, 20, 28);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(50 * 32 + 10, panY + 10, 4, 6);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(50 * 32 + 18, panY + 10, 4, 6);

    // 티테이블
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(32 * 32 + 16, 4 * 32 + 16, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // =========================================================
    // [3] 인쇄실 (tx: 37..51, ty: 7..9)
    // =========================================================
    const drawCopier = (bx, by) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(bx + 3, by + 4, 58, 30);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(bx, by, 58, 28);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, 58, 28);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bx + 6, by + 4, 30, 14);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(bx + 42, by + 6, 10, 6);
    };
    drawCopier(38 * 32, 7 * 32);
    drawCopier(47 * 32, 7 * 32);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(41 * 32 + 6, 7 * 32 + 2, 5 * 32 - 12, 26);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(41 * 32 + 6, 7 * 32 + 2, 5 * 32 - 12, 26);

    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#3b82f6';
    ctx.fillRect(37 * 32 + 8, 9 * 32 + 2, 24, 22);
    ctx.strokeRect(37 * 32 + 8, 9 * 32 + 2, 24, 22);
    ctx.fillRect(50 * 32 + 4, 9 * 32 + 2, 24, 22);
    ctx.strokeRect(50 * 32 + 4, 9 * 32 + 2, 24, 22);

    // =========================================================
    // [4] 상담실 (tx: C.x1+1 .. C.x2-1, ty: 3..9)
    // =========================================================
    const ox = C.x1; // 상담실 기준 좌표
    // 책장
    ctx.fillStyle = '#78350f';
    ctx.fillRect((ox + 10) * 32, 3 * 32 + 2, 3 * 32, 24);
    ctx.fillStyle = '#fde047';
    ctx.fillRect((ox + 10) * 32 + 8, 3 * 32 + 6, 20, 14);
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect((ox + 11) * 32 + 4, 3 * 32 + 6, 24, 14);
    this.drawOfficePlantPot((ox + 2) * 32 + 16, 3 * 32 + 20);
    this.drawOfficePlantPot((ox + 14) * 32 + 16, 8 * 32 + 20);

    // 소파
    ctx.fillStyle = '#0f766e';
    ctx.fillRect((ox + 1) * 32 + 10, 5 * 32, 28, 3 * 32);
    ctx.fillStyle = '#14b8a6';
    ctx.fillRect((ox + 1) * 32 + 16, 5 * 32 + 6, 20, 3 * 32 - 12);

    // 원형 상담 테이블 & 의자
    const tcx = (ox + 7) * 32 + 16;
    const tcy = 6 * 32 + 16;
    this.drawStaffOfficeChair(tcx - 60, tcy, 'right');
    this.drawStaffOfficeChair(tcx + 60, tcy, 'left');
    this.drawStaffOfficeChair(tcx, tcy - 42, 'down');

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.arc(tcx + 2, tcy + 2, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(tcx, tcy, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawOfficePlantPot(cx, cy) {
    const ctx = this.ctx;
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.arc(cx, cy, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 4, 7, 0, Math.PI * 2);
    ctx.arc(cx + 5, cy - 4, 7, 0, Math.PI * 2);
    ctx.arc(cx, cy - 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(cx, cy - 5, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawStaffOfficeChair(cx, cy, facing, customSeatColor, customBorderColor) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.arc(cx + 1, cy + 2, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = customSeatColor || '#1e293b';
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = customBorderColor || '#64748b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    if (facing === 'right') {
      ctx.fillRect(cx - 11, cy - 8, 5, 16);
    } else if (facing === 'left') {
      ctx.fillRect(cx + 6, cy - 8, 5, 16);
    } else if (facing === 'down') {
      ctx.fillRect(cx - 8, cy - 11, 16, 5);
    } else if (facing === 'up') {
      ctx.fillRect(cx - 8, cy + 6, 16, 5);
    }
    ctx.restore();
  }

  // 6층 교무실 11번 작업용 테이블 (의자 없는 대형 직사각형 작업대)
  drawStaffOfficeWorkTable(px, py, w, h, label = '중앙테이블') {
    const ctx = this.ctx;
    ctx.save();

    // 1. 바닥 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(px + 3, py + 4, w, h);

    // 2. 단단한 원목 작업대 상판
    ctx.fillStyle = '#78350f';
    ctx.fillRect(px, py, w, h);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(px + 2, py + 2, w - 4, h - 4);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(px + 3, py + 3, w - 6, h - 6);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px + 0.5, py + 0.5, w - 1, h - 1);

    // 3. 작업용 소품
    const propH = Math.min(h - 10, 26);
    const startY = py + Math.max(4, Math.floor((h - propH) / 2));

    // 3-A. 좌측 초록색 고무 커팅 매트 (Cutting Mat with grid)
    ctx.fillStyle = '#065f46';
    ctx.fillRect(px + 8, startY, 38, propH);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 8.5, startY + 0.5, 37, propH - 1);
    // 그리드 눈금선
    ctx.strokeStyle = 'rgba(110, 231, 183, 0.4)';
    ctx.beginPath();
    for (let gx = px + 16; gx < px + 44; gx += 8) {
      ctx.moveTo(gx, startY + 2);
      ctx.lineTo(gx, startY + propH - 2);
    }
    for (let gy = startY + 6; gy < startY + propH - 2; gy += 6) {
      ctx.moveTo(px + 9, gy);
      ctx.lineTo(px + 45, gy);
    }
    ctx.stroke();

    // 자 (Ruler) & 커터칼
    ctx.fillStyle = '#fde047';
    ctx.fillRect(px + 12, startY + 3, 28, 3);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(px + 18, startY + 11, 16, 4);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(px + 18, startY + 11, 8, 4);

    // 3-B. 우측 시험지 / 학습지 제본 묶음 & 스테이플러
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(px + w - 46, startY, 36, propH);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(px + w - 48, startY + 2, 36, propH - 2);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(px + w - 48, startY + 2, 36, propH - 2);
    // 시험지 텍스트 라인
    ctx.fillStyle = '#64748b';
    ctx.fillRect(px + w - 44, startY + 6, 28, 2);
    ctx.fillRect(px + w - 44, startY + 11, 22, 2);
    if (propH > 18) {
      ctx.fillRect(px + w - 44, startY + 16, 25, 2);
    }
    // 파란색 집게 클립
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(px + w - 38, startY, 8, 4);

    // 4. 중앙 명패 배지: 중앙테이블
    const cx = px + w / 2;
    const cy = py + h / 2;
    ctx.font = 'bold 10.5px "Pretendard", "Noto Sans KR", sans-serif';
    const text = '중앙테이블';
    const tw = Math.max(54, ctx.measureText(text).width + 12);
    const th = 18;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);

    ctx.fillStyle = '#a7f3d0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy + 0.5);

    ctx.restore();
  }

  drawStaffOfficeTeacherDesk(px, py, w, h, label, facing) {
    const ctx = this.ctx;
    ctx.save();

    const isCreatorDesk = (label === '26');
    const isSangdaeDesk = (label === '30');
    const isKyungsukDesk = (label === '23');
    const isHunihuniDesk = (label === '27');
    const isOyesookDesk = (label === '28');
    const isVicePrincipalDesk = (label === '14');
    const isHangangwooDesk = (label === '29');
    const isJoshuaDesk = (label === '3');
    const isOkchohanDesk = (label === '10');
    const isKimmijinDesk = (label === '15');
    const isYosunyuDesk = (label === '17');
    const isKwimjinsyongDesk = (label === '24');
    const now = Date.now();

    // 0. 제작자 갓준철 연구석: 황금빛 펄스 후광 글로우 (바닥 조명 및 배경 아우라)
    if (isCreatorDesk) {
      this.renderJuncheolDeskGoldenAuraBack(px, py, w, h, now);
    }

    // 1. 의자 (책상 바깥쪽)
    if (facing === 'right') {
      if (isHunihuniDesk) {
        this.drawStaffOfficeChair(px - 10, py + h / 2, 'right', '#450a0a', '#ef4444');
      } else if (isHangangwooDesk) {
        // 한강우 국어선생님: 기품 있는 짙은 밤나무 원목 의자 (#291508) & 차분한 딥그린 패브릭 (#065f46)
        this.drawStaffOfficeChair(px - 10, py + h / 2, 'right', '#291508', '#065f46');
      } else if (isYosunyuDesk) {
        // 요션유 정보선생님: 세련된 다크인디고 원목 (#1e1b4b) & 네온 퍼플 패브릭 (#a855f7)
        this.drawStaffOfficeChair(px - 10, py + h / 2, 'right', '#1e1b4b', '#a855f7');
      } else {
        this.drawStaffOfficeChair(px - 10, py + h / 2, 'right');
      }
    } else if (facing === 'left') {
      if (isCreatorDesk) {
        this.drawStaffOfficeChair(px + w + 10, py + h / 2, 'left', '#1e1b4b', '#fbbf24');
      } else if (isKyungsukDesk) {
        this.drawStaffOfficeChair(px + w + 10, py + h / 2, 'left', '#064e3b', '#34d399');
      } else if (isOyesookDesk) {
        // 오예슉 가정선생님: 우아한 로즈우드 원목 의자 (#881337) & 따뜻한 코랄 로즈 패브릭 (#fb7185)
        this.drawStaffOfficeChair(px + w + 10, py + h / 2, 'left', '#881337', '#fb7185');
      } else {
        this.drawStaffOfficeChair(px + w + 10, py + h / 2, 'left');
      }
    } else if (facing === 'down') {
      this.drawStaffOfficeChair(px + w / 2, py - 10, 'down');
    } else if (facing === 'up') {
      this.drawStaffOfficeChair(px + w / 2, py + h + 10, 'up');
    }

    // 2. 책상 상판
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.fillRect(px + 3, py + 4, w, h);

    if (isCreatorDesk) {
      // 제작자 갓준철 연구석 (26번): 딥 체리월넛 & 골드 테두리
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(px, py, w, h);
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(px + 2, py + 2, w - 4, h - 4);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 0.5, py + 0.5, w - 1, h - 1);
    } else {
      ctx.fillStyle = '#d97706';
      ctx.fillRect(px, py, w, h);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px + 2, py + 2, w - 4, h - 4);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 0.5, py + 0.5, w - 1, h - 1);
    }

    // 3. 모니터 & 서류 & 소품
    if (isCreatorDesk) {
      if (facing === 'left') {
        // [26번 좌석 전용 데코레이션 - 좌측 파티션, 우측 의자 배치]
        // 3-A. 듀얼 모니터 (좌측 파티션 벽면 배치, 화면은 우측 의자를 향함)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px + 4, py + 18, 10, 28);
        ctx.fillStyle = '#020617';
        ctx.fillRect(px + 13, py + 20, 3, 24);
        // IDE 코드 라인들
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(px + 14, py + 22, 2, 4);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(px + 14, py + 28, 2, 5);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(px + 14, py + 35, 2, 4);
        if (Math.floor(Date.now() / 350) % 2 === 0) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(px + 14, py + 41, 2, 2);
        }

        // 피벗 보조 모니터 (상단)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px + 4, py + 4, 10, 11);
        ctx.fillStyle = '#022c22';
        ctx.fillRect(px + 13, py + 5, 2, 9);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(px + 13, py + 6, 2, 2);
        ctx.fillRect(px + 13, py + 9, 2, 3);

        // 3-B. 기계식 키보드 & 마우스패드 (중앙 우측)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px + 26, py + 22, 16, 20);
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(px + 28, py + 24, 12, 16);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(px + 30, py + 26, 8, 12);

        // 3-C. 노란 포스트잇 메모지 더미 & 펜 (우측 상단)
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(px + w - 18, py + 6, 12, 11);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(px + w - 17, py + 7, 10, 2);
        ctx.fillRect(px + w - 17, py + 10, 8, 1);
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(px + w - 21, py + 7, 3, 10);

        // 3-D. 식지 않는 커피 텀블러 (우측 하단)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(px + w - 17, py + h - 18, 10, 12);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(px + w - 18, py + h - 20, 12, 2);
        const steamY = (Date.now() / 250) % 6;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillRect(px + w - 14, py + h - 22 - steamY, 2, 2);
        ctx.fillRect(px + w - 12, py + h - 24 - ((steamY + 2) % 6), 2, 2);
      } else {
        // facing === 'right' 등 기타 방향 호환
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px + w - 14, py + 18, 10, 28);
        ctx.fillStyle = '#020617';
        ctx.fillRect(px + w - 16, py + 20, 3, 24);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(px + w - 15, py + 22, 2, 4);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(px + w - 15, py + 28, 2, 5);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(px + w - 15, py + 35, 2, 4);
        if (Math.floor(Date.now() / 350) % 2 === 0) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(px + w - 15, py + 41, 2, 2);
        }

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px + w - 14, py + 4, 10, 11);
        ctx.fillStyle = '#022c22';
        ctx.fillRect(px + w - 15, py + 5, 2, 9);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(px + w - 15, py + 6, 2, 2);
        ctx.fillRect(px + w - 15, py + 9, 2, 3);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px + 22, py + 22, 16, 20);
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(px + 24, py + 24, 12, 16);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(px + 26, py + 26, 8, 12);

        ctx.fillStyle = '#fef08a';
        ctx.fillRect(px + 6, py + 6, 12, 11);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(px + 7, py + 7, 10, 2);
        ctx.fillRect(px + 7, py + 10, 8, 1);
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(px + 17, py + 7, 3, 10);

        ctx.fillStyle = '#0284c7';
        ctx.fillRect(px + 7, py + h - 18, 10, 12);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(px + 6, py + h - 20, 12, 2);
        const steamY = (Date.now() / 250) % 6;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillRect(px + 10, py + h - 22 - steamY, 2, 2);
        ctx.fillRect(px + 12, py + h - 24 - ((steamY + 2) % 6), 2, 2);
      }
    } else {
      ctx.fillStyle = '#1e293b';
      if (facing === 'right') {
        if (isHunihuniDesk) {
          // [27번 후니후니 도덕 & 드럼/락스피릿 선생님 전용 데스크 소품]
          // 모니터 (우측) - 오디오 사운드 파형 & 이퀄라이저 바
          ctx.fillRect(px + w - 14, py + h / 2 - 12, 8, 24);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px + w - 16, py + h / 2 - 10, 2, 20);
          // 이퀄라이저 비트 바 (초록/노랑/빨강)
          ctx.fillStyle = '#22c55e'; ctx.fillRect(px + w - 16, py + h / 2 + 4, 2, 4);
          ctx.fillStyle = '#eab308'; ctx.fillRect(px + w - 16, py + h / 2 - 2, 2, 4);
          ctx.fillStyle = '#ef4444'; ctx.fillRect(px + w - 16, py + h / 2 - 8, 2, 4);

          // 🥁 한 쌍의 원목 드럼스틱 (좌측 하단 대각선 교차)
          ctx.strokeStyle = '#fef3c7';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(px + 8, py + h - 10);
          ctx.lineTo(px + 24, py + h - 26);
          ctx.moveTo(px + 10, py + h - 26);
          ctx.lineTo(px + 24, py + h - 10);
          ctx.stroke();
          // 드럼스틱 흰색 팁
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(px + 24, py + h - 26, 1.8, 0, Math.PI * 2);
          ctx.arc(px + 24, py + h - 10, 1.8, 0, Math.PI * 2);
          ctx.fill();
          // 손잡이 그립
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(px + 7, py + h - 12, 4, 3);
          ctx.fillRect(px + 9, py + h - 27, 4, 3);

          // 📖 붉은색 도덕 교재 및 바른생활 명언집 (좌측 상단)
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(px + 6, py + 8, 14, 16);
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(px + 8, py + 10, 12, 14);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(px + 9, py + 12, 10, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + 9, py + 16, 7, 1.5);

          // ⏱️ 클래식 아날로그 피라미드 메트로놈 (중앙 상단)
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.moveTo(px + 28, py + 8);
          ctx.lineTo(px + 35, py + 24);
          ctx.lineTo(px + 21, py + 24);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1;
          ctx.stroke();
          // 황동 진자 바늘
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(px + 28, py + 23);
          ctx.lineTo(px + 30, py + 10);
          ctx.stroke();

          // ☕ 락스피릿 블랙 & 레드 머그컵 (중앙 하단)
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px + 34, py + h - 20, 9, 11);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(px + 37, py + h - 17, 3, 5);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(px + 43, py + h - 18, 2, 7);
        } else if (isHangangwooDesk) {
          // [29번 한강우 국어선생님 전용 데스크 소품]
          // 1. 모니터 (우측) - 훈민정음 서문 & 한글 맞춤법 화면
          ctx.fillRect(px + w - 14, py + h / 2 - 12, 8, 24);
          ctx.fillStyle = '#065f46';
          ctx.fillRect(px + w - 16, py + h / 2 - 10, 2, 20);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(px + w - 16, py + h / 2 - 8, 2, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + w - 16, py + h / 2 - 2, 2, 5);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(px + w - 16, py + h / 2 + 5, 2, 3);

          // 2. 📚 두꺼운 한국 현대문학 전집 & 양장본 시집 더미 (좌측 상단)
          ctx.fillStyle = '#4c0519';
          ctx.fillRect(px + 8, py + 8, 16, 18);
          ctx.fillStyle = '#9f1239';
          ctx.fillRect(px + 10, py + 9, 12, 16);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(px + 9, py + 11, 14, 13);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(px + 11, py + 12, 10, 11);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(px + 9.5, py + 13, 2, 7);

          // 3. 📄 국어 학습 유인물 및 채점 시험지 (좌측 하단)
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(px + 8, py + h - 22, 16, 14);
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(px + 8, py + h - 22, 16, 14);
          // 빨간 채점 펜
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(px + 11, py + h - 18, 10, 2);
          ctx.fillRect(px + 13, py + h - 13, 7, 2);

          // 4. 🍵 단아한 청자 다도 찻잔 (녹차 & 모락모락 김) (중앙 하단)
          ctx.fillStyle = '#065f46';
          ctx.beginPath();
          ctx.arc(px + 32, py + h - 13, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = '#a7f3d0';
          ctx.beginPath();
          ctx.arc(px + 32, py + h - 13, 3, 0, Math.PI * 2);
          ctx.fill();
          const teaSteam = (Date.now() / 280) % 5;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.fillRect(px + 31, py + h - 20 - teaSteam, 1.5, 1.5);
          ctx.fillRect(px + 33, py + h - 22 - ((teaSteam + 2) % 5), 1.5, 1.5);
        } else if (isYosunyuDesk) {
          // [17번 요션유 정보선생님 전용 데스크 소품]
          // 1. 모니터 (우측) - 파이썬 코딩 터미널 & 네온 시안/그린 알고리즘 코드 화면
          ctx.fillRect(px + w - 14, py + h / 2 - 12, 8, 24);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px + w - 16, py + h / 2 - 10, 2, 20);
          // 코드 라인 (시안, 그린, 옐로우)
          ctx.fillStyle = '#38bdf8'; ctx.fillRect(px + w - 16, py + h / 2 - 8, 2, 3);
          ctx.fillStyle = '#4ade80'; ctx.fillRect(px + w - 16, py + h / 2 - 3, 2, 4);
          ctx.fillStyle = '#fde047'; ctx.fillRect(px + w - 16, py + h / 2 + 3, 2, 4);
          if (Math.floor(Date.now() / 350) % 2 === 0) {
            ctx.fillStyle = '#38bdf8'; ctx.fillRect(px + w - 16, py + h / 2 + 8, 2, 2);
          }

          // 2. 💻 슬림 테크 노트북 & 마우스패드 (좌측 상단)
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(px + 8, py + 8, 16, 14);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(px + 10, py + 10, 12, 10);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(px + 12, py + 12, 8, 6);

          // 3. 💾 요션유의 고속 알고리즘 USB (중앙 상단)
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(px + 28, py + 10, 6, 10);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(px + 29, py + 8, 4, 2);
          ctx.fillStyle = '#60a5fa';
          ctx.fillRect(px + 29, py + 12, 4, 4);

          // 4. 📚 두꺼운 파이썬 & 알고리즘 교재 더미 (좌측 하단)
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(px + 8, py + h - 22, 16, 14);
          ctx.fillStyle = '#2563eb';
          ctx.fillRect(px + 10, py + h - 20, 12, 12);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(px + 11, py + h - 18, 10, 2);

          // 5. ☕ 스마트 온도유지 테크 머그컵 (중앙 하단)
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(px + 32, py + h - 14, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(px + 32, py + h - 14, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(px + w - 14, py + h / 2 - 12, 8, 24);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(px + w - 16, py + h / 2 - 10, 2, 20);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(px + 8, py + 8, 14, 12);
        }
      } else if (facing === 'left') {
        if (isSangdaeDesk) {
          // [30번 이상대 수학선생님 전용 데스크 소품]
          // 모니터 (좌측)
          ctx.fillRect(px + 4, py + h / 2 - 12, 8, 24);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(px + 12, py + h / 2 - 10, 2, 20);

          // 📐 대형 아크릴 삼각자 (노란색/투명)
          ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
          ctx.beginPath();
          ctx.moveTo(px + 22, py + 10);
          ctx.lineTo(px + 40, py + 10);
          ctx.lineTo(px + 22, py + 28);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 1;
          ctx.stroke();

          // 삼각자 안쪽 타공
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(px + 25, py + 13);
          ctx.lineTo(px + 33, py + 13);
          ctx.lineTo(px + 25, py + 21);
          ctx.closePath();
          ctx.fill();

          // 🧮 공학용 계산기 (중앙 하단)
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(px + 18, py + 34, 14, 20);
          ctx.fillStyle = '#86efac';
          ctx.fillRect(px + 20, py + 36, 10, 5);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(px + 20, py + 43, 10, 8);

          // 📚 파란색 수학의 정석 / 시험지 묶음 (우측 상단)
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(px + w - 22, py + 8, 14, 16);
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(px + w - 20, py + 10, 12, 14);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(px + w - 19, py + 12, 10, 2);

          // ✏️ 빨간 채점용 색연필
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(px + w - 24, py + 28, 3, 16);
          ctx.fillStyle = '#fca5a5';
          ctx.fillRect(px + w - 24, py + 26, 3, 2);
        } else if (isKyungsukDesk) {
          // [23번 졍경슉 과학/연금술 선생님 전용 데스크 소품]
          // 모니터 (좌측) - 화학 분자 구조 / 에메랄드 화면
          ctx.fillRect(px + 4, py + h / 2 - 12, 8, 24);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(px + 12, py + h / 2 - 10, 2, 20);
          ctx.fillStyle = '#a7f3d0';
          ctx.fillRect(px + 12, py + h / 2 - 6, 2, 4);
          ctx.fillRect(px + 12, py + h / 2 + 2, 2, 3);

          // 🧪 에메랄드빛 삼각 플라스크 (중앙 상단)
          ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
          ctx.beginPath();
          ctx.moveTo(px + 24, py + 9);
          ctx.lineTo(px + 28, py + 9);
          ctx.lineTo(px + 32, py + 22);
          ctx.lineTo(px + 20, py + 22);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#6ee7b7';
          ctx.lineWidth = 1;
          ctx.stroke();
          // 플라스크 마개 & 기포
          ctx.fillStyle = '#78350f';
          ctx.fillRect(px + 24.5, py + 7, 3, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + 25, py + 15, 1.5, 1.5);

          // 🧬 3구 시험관 꽂이 (중앙 하단: 빨강, 파랑, 보라 시약)
          ctx.fillStyle = '#78350f';
          ctx.fillRect(px + 18, py + 38, 18, 6);
          // 3개 시험관
          ctx.fillStyle = '#ef4444'; ctx.fillRect(px + 19, py + 28, 3, 12);
          ctx.fillStyle = '#3b82f6'; ctx.fillRect(px + 25, py + 28, 3, 12);
          ctx.fillStyle = '#a855f7'; ctx.fillRect(px + 31, py + 28, 3, 12);
          ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.5;
          ctx.strokeRect(px + 19, py + 28, 3, 12);
          ctx.strokeRect(px + 25, py + 28, 3, 12);
          ctx.strokeRect(px + 31, py + 28, 3, 12);

          // 📚 두꺼운 초록색 과학 교재 / 실험 관찰 일지 (우측 상단)
          ctx.fillStyle = '#064e3b';
          ctx.fillRect(px + w - 22, py + 8, 14, 16);
          ctx.fillStyle = '#059669';
          ctx.fillRect(px + w - 20, py + 10, 12, 14);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(px + w - 19, py + 12, 10, 2);

          // 🔬 미니 정밀 현미경 (우측 하단)
          ctx.fillStyle = '#334155';
          ctx.fillRect(px + w - 20, py + 44, 10, 4);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(px + w - 17, py + 32, 4, 12);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(px + w - 19, py + 30, 8, 4);
        } else if (isOyesookDesk) {
          // [28번 1학년 3반 오예슉 가정선생님 전용 데스크 소품]
          // 1. 모니터 (좌측 파티션) - 따뜻한 피치 화면 & 영양 식단표 차트
          ctx.fillRect(px + 4, py + h / 2 - 12, 8, 24);
          ctx.fillStyle = '#fff1f2';
          ctx.fillRect(px + 12, py + h / 2 - 10, 2, 20);
          // 영양 그래프 (초록 비타민, 노랑 탄수화물, 빨강 단백질 영양소 바)
          ctx.fillStyle = '#22c55e'; ctx.fillRect(px + 12, py + h / 2 - 8, 2, 4);
          ctx.fillStyle = '#eab308'; ctx.fillRect(px + 12, py + h / 2 - 2, 2, 5);
          ctx.fillStyle = '#ef4444'; ctx.fillRect(px + 12, py + h / 2 + 5, 2, 4);

          // 2. 🧵 알록달록 실패 꽂이 & 토마토 바늘꽂이 (중앙 상단)
          // 실패 받침대
          ctx.fillStyle = '#78350f';
          ctx.fillRect(px + 20, py + 8, 18, 4);
          // 3색 실패 (빨강, 노랑, 민트)
          ctx.fillStyle = '#ef4444'; ctx.fillRect(px + 21, py + 12, 4, 7);
          ctx.fillStyle = '#facc15'; ctx.fillRect(px + 27, py + 12, 4, 7);
          ctx.fillStyle = '#34d399'; ctx.fillRect(px + 33, py + 12, 4, 7);
          // 🍅 앙증맞은 토마토 바늘꽂이
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(px + 28, py + 24, 5, 0, Math.PI * 2);
          ctx.fill();
          // 초록 꼭지 & 핀
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(px + 27, py + 19, 2, 2);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(px + 25, py + 22, 1.5, 1.5);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + 30, py + 25, 1.5, 1.5);

          // 3. 🧁 체크 냅킨 위의 수제 홈베이킹 컵케이크 & 달콤한 김 (중앙 하단)
          // 핑크 & 아이보리 체크 키친클로스
          ctx.fillStyle = '#ffe4e6';
          ctx.fillRect(px + 18, py + 36, 18, 16);
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 0.6;
          ctx.strokeRect(px + 18, py + 36, 18, 16);
          ctx.fillStyle = '#fda4af';
          ctx.fillRect(px + 20, py + 38, 6, 5);
          ctx.fillRect(px + 28, py + 45, 6, 5);
          // 미니 머핀 컵 & 딸기 크림
          ctx.fillStyle = '#b45309';
          ctx.fillRect(px + 23, py + 42, 8, 6);
          ctx.fillStyle = '#fb7185';
          ctx.beginPath();
          ctx.arc(px + 27, py + 42, 5, Math.PI, 0);
          ctx.fill();
          // 꼭대기 레드 체리
          ctx.fillStyle = '#e11d48';
          ctx.beginPath();
          ctx.arc(px + 27, py + 37, 2, 0, Math.PI * 2);
          ctx.fill();
          // 달콤한 온기
          const steam = (Date.now() / 260) % 5;
          ctx.fillStyle = 'rgba(251, 113, 133, 0.6)';
          ctx.fillRect(px + 26, py + 33 - steam, 1.5, 1.5);

          // 4. 📖 두꺼운 분홍색 [가정과 기술] 교재 & 레시피북 (우측 상단)
          ctx.fillStyle = '#9f1239';
          ctx.fillRect(px + w - 22, py + 8, 14, 16);
          ctx.fillStyle = '#fb7185';
          ctx.fillRect(px + w - 20, py + 10, 12, 14);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(px + w - 19, py + 12, 10, 2);
          // 노란 리본 가름끈
          ctx.fillStyle = '#facc15';
          ctx.fillRect(px + w - 15, py + 22, 2, 5);

          // 5. 🪡 아기자기한 미니 오븐장갑 & 파스텔 줄자 (우측 하단)
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(px + w - 16, py + 40, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(px + w - 18, py + 43, 6, 3);
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        } else {
          ctx.fillRect(px + 6, py + h / 2 - 12, 8, 24);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(px + 14, py + h / 2 - 10, 2, 20);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(px + w - 22, py + 8, 14, 12);
        }
      } else if (facing === 'down') {
        ctx.fillRect(px + w / 2 - 14, py + h - 12, 28, 7);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(px + w / 2 - 12, py + h - 14, 24, 2);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(px + 10, py + 6, 16, 12);
      } else if (facing === 'up') {
        ctx.fillRect(px + w / 2 - 14, py + 5, 28, 7);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(px + w / 2 - 12, py + 12, 24, 2);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(px + w - 28, py + h - 18, 16, 12);
      }
    }

    // 4. 좌석 번호 배지
    const cx = px + w / 2;
    const cy = py + h / 2;
    if (isCreatorDesk) {
      // 👑 갓준철 골드 명패
      ctx.font = 'bold 10px "Pretendard", "Noto Sans KR", sans-serif';
      const tw = Math.max(54, ctx.measureText('👑 갓준철').width + 10);
      const th = 18;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👑 갓준철', cx, cy + 0.5);
    } else {
      if (isSangdaeDesk) {
        // 📐 이상대 전용 명패 (번호 및 과목 삭제)
        ctx.font = 'bold 10.5px "Pretendard", "Noto Sans KR", sans-serif';
        const displayLabel = '📐 이상대';
        const tw = Math.max(48, ctx.measureText(displayLabel).width + 12);
        const th = 18;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.fillStyle = '#7dd3fc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayLabel, cx, cy + 0.5);
      } else if (isKyungsukDesk) {
        // 🧪 졍경슉 전용 명패 (번호 및 과목 삭제)
        ctx.font = 'bold 10.5px "Pretendard", "Noto Sans KR", sans-serif';
        const displayLabel = '🧪 졍경슉';
        const tw = Math.max(48, ctx.measureText(displayLabel).width + 12);
        const th = 18;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.fillStyle = '#6ee7b7';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayLabel, cx, cy + 0.5);
      } else if (isHunihuniDesk) {
        // 🥁 후니후니 전용 명패 (번호 및 과목 삭제)
        ctx.font = 'bold 10.5px "Pretendard", "Noto Sans KR", sans-serif';
        const displayLabel = '🥁 후니후니';
        const tw = Math.max(48, ctx.measureText(displayLabel).width + 12);
        const th = 18;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.fillStyle = '#fca5a5';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayLabel, cx, cy + 0.5);
      } else if (isVicePrincipalDesk) {
        // 🏫 교감선생님 전용 명패 (14번 번호 삭제)
        ctx.font = 'bold 10.5px "Pretendard", "Noto Sans KR", sans-serif';
        const displayLabel = '🏫 교감선생님';
        const tw = Math.max(68, ctx.measureText(displayLabel).width + 12);
        const th = 18;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayLabel, cx, cy + 0.5);
      } else if (isHangangwooDesk) {
        // 📖 한강우 전용 명패 (국어)
        ctx.font = 'bold 10.5px "Pretendard", "Noto Sans KR", sans-serif';
        const displayLabel = '📖 한강우';
        const tw = Math.max(48, ctx.measureText(displayLabel).width + 12);
        const th = 18;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.fillStyle = '#a7f3d0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayLabel, cx, cy + 0.5);
      } else if (isJoshuaDesk) {
        // 🇬🇧 Joshua 전용 명패 (3번 번호 삭제)
        ctx.font = 'bold 10.5px "Pretendard", "Noto Sans KR", sans-serif';
        const displayLabel = '🇬🇧 Joshua';
        const tw = Math.max(54, ctx.measureText(displayLabel).width + 12);
        const th = 18;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.fillStyle = '#93c5fd';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayLabel, cx, cy + 0.5);
      } else if (isOkchohanDesk) {
        // 🌏 옥촣한 전용 명패 (10번 번호 삭제)
        ctx.font = 'bold 10.5px "Pretendard", "Noto Sans KR", sans-serif';
        const displayLabel = '🌏 옥촣한';
        const tw = Math.max(48, ctx.measureText(displayLabel).width + 12);
        const th = 18;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.fillStyle = '#7dd3fc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayLabel, cx, cy + 0.5);
      } else if (isKimmijinDesk) {
        // 🎨 김진믜 전용 명패 (15번 번호 삭제)
        ctx.font = 'bold 10.5px "Pretendard", "Noto Sans KR", sans-serif';
        const displayLabel = '🎨 김진믜';
        const tw = Math.max(48, ctx.measureText(displayLabel).width + 12);
        const th = 18;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.fillStyle = '#fbcfe8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayLabel, cx, cy + 0.5);
      } else if (isYosunyuDesk) {
        // 💻 요션유 전용 명패 (17번 번호 삭제)
        ctx.font = 'bold 10.5px "Pretendard", "Noto Sans KR", sans-serif';
        const displayLabel = '💻 요션유';
        const tw = Math.max(48, ctx.measureText(displayLabel).width + 12);
        const th = 18;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.fillStyle = '#e9d5ff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayLabel, cx, cy + 0.5);
      } else if (isKwimjinsyongDesk) {
        // 🌟 귐즨숑 전용 명패 (24번 번호 삭제)
        ctx.font = 'bold 10.5px "Pretendard", "Noto Sans KR", sans-serif';
        const displayLabel = '🌟 귐즨숑';
        const tw = Math.max(48, ctx.measureText(displayLabel).width + 12);
        const th = 18;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayLabel, cx, cy + 0.5);
      } else if (isOyesookDesk) {
        // 🧵 오예슉 전용 명패 (1학년 3반 담임 / 가정)
        ctx.font = 'bold 10.5px "Pretendard", "Noto Sans KR", sans-serif';
        const displayLabel = '🧵 오예슉';
        const tw = Math.max(48, ctx.measureText(displayLabel).width + 12);
        const th = 18;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.fillStyle = '#fecdd3';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayLabel, cx, cy + 0.5);
      } else {
        ctx.font = 'bold 12px "Pretendard", "Noto Sans KR", sans-serif';
        const tw = Math.max(34, ctx.measureText(label).width + 14);
        const th = 20;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);

        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, cx, cy + 0.5);
      }
    }

    // 5. 제작자 갓준철 연구석: 전면 황금 십자별(✦) & 상승 글리터 파티클 (갓준철 캐릭터 아우라 동일 스타일)
    if (isCreatorDesk) {
      this.renderJuncheolDeskGoldenAuraFront(px, py, w, h, now);
    }

    ctx.restore();
  }

  // ========================================================
  // 👑 제작자 갓준철 책상 전용 황금빛 반짝이 아우라 렌더러
  // (갓준철 캐릭터 renderTeacherGoldenAura와 동일한 광휘 & 십자별 ✦)
  // ========================================================
  renderJuncheolDeskGoldenAuraBack(px, py, w, h, now) {
    const ctx = this.ctx;
    ctx.save();
    const cx = px + w / 2;
    const cy = py + h / 2;

    // 1. 은은하게 호흡하는 황금빛 펄스 후광 글로우 (바닥 조명 효과)
    const pulse = Math.sin(now / 360) * 5;
    const glowRadius = Math.max(w, h) * 0.72 + pulse;
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, glowRadius);
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.65)'); // 화사한 골드빛
    grad.addColorStop(0.45, 'rgba(245, 158, 11, 0.38)'); // 따뜻한 앰버 골드
    grad.addColorStop(0.8, 'rgba(217, 119, 6, 0.15)');
    grad.addColorStop(1, 'rgba(217, 119, 6, 0)');        // 자연스러운 페이드아웃
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. 책상 주변 부드러운 골드 오라 테두리
    const auraPulse = 0.25 + 0.15 * Math.sin(now / 280);
    ctx.fillStyle = `rgba(251, 191, 36, ${auraPulse})`;
    ctx.fillRect(px - 4, py - 4, w + 8, h + 8);

    ctx.restore();
  }

  renderJuncheolDeskGoldenAuraFront(px, py, w, h, now) {
    const ctx = this.ctx;
    ctx.save();
    const cx = px + w / 2;
    const cy = py + h / 2;

    // 1. 반짝반짝 회전하는 황금 십자별 파티클 (Twinkling Sparkle Starbursts ✦)
    // 외곽 궤도 공전 6개 + 책상 위 2개 = 총 8개
    const starCount = 8;
    for (let i = 0; i < starCount; i++) {
      let sx, sy;
      if (i < 6) {
        const angle = (now / 1400) + (i * Math.PI * 2 / 6);
        const rx = (w / 2 + 5) + Math.sin(now / 450 + i * 2) * 5;
        const ry = (h / 2 + 5) + Math.cos(now / 550 + i * 2) * 5;
        sx = cx + Math.cos(angle) * rx;
        sy = cy + Math.sin(angle) * ry;
      } else if (i === 6) {
        sx = px + 16 + Math.sin(now / 600) * 4;
        sy = py + 16 + Math.cos(now / 700) * 4;
      } else {
        sx = px + w - 16 + Math.cos(now / 650) * 4;
        sy = py + h - 16 + Math.sin(now / 550) * 4;
      }

      // 트윙클 애니메이션 (크기 & 투명도 숨쉬기)
      const twinkle = Math.sin(now / 220 + i * 1.8);
      const alpha = Math.max(0.28, 0.65 + twinkle * 0.35);
      const size = 3.5 + Math.abs(twinkle) * 3.8;

      // 4포인트 십자 반짝이 (✦)
      ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(sx, sy - size);
      ctx.lineTo(sx + size * 0.35, sy);
      ctx.lineTo(sx, sy + size);
      ctx.lineTo(sx - size * 0.35, sy);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(sx - size, sy);
      ctx.lineTo(sx, sy + size * 0.35);
      ctx.lineTo(sx + size, sy);
      ctx.lineTo(sx, sy - size * 0.35);
      ctx.closePath();
      ctx.fill();

      // 별 중심부 반짝이는 화이트 보석 코어
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(sx - 1, sy - 1, 2, 2);
    }

    // 2. 위로 솟아오르는 황금 미세 글리터 입자 (Upward Rising Gold Glitters)
    for (let j = 0; j < 7; j++) {
      const phase = ((now * 0.045 + j * 48) % 100) / 100;
      const gx = px + 8 + ((j * 11 + Math.sin(now / 380 + j) * 8 + 30) % (w - 16));
      const gy = (py + h + 2) - phase * (h + 18);
      const gAlpha = Math.sin(phase * Math.PI) * 0.85;
      ctx.fillStyle = `rgba(253, 224, 71, ${gAlpha})`;
      ctx.fillRect(gx, gy, 2, 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${gAlpha * 0.9})`;
      ctx.fillRect(gx + 0.5, gy + 0.5, 1, 1);
    }

    // 3. 👑 갓준철 골드 명패의 빛나는 황금 하이라이트 림
    const badgeTw = Math.max(54, ctx.measureText('👑 갓준철').width + 10);
    const badgeTh = 18;
    const rimAlpha = 0.5 + 0.5 * Math.sin(now / 200);
    ctx.strokeStyle = `rgba(254, 240, 138, ${rimAlpha})`;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(cx - badgeTw / 2, cy - badgeTh / 2, badgeTw, badgeTh);

    ctx.restore();
  }

  // 책상 사이 칸막이 (단색 · 깔끔한 라인)
  drawPartitionLine(x1, y1, x2, y2) {
    const ctx = this.ctx;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  drawStaffOfficeAllTeacherClusters() {
    const L = this.getStaffOfficeLayout();

    // [상단] 31 · 32 · 33 (T자형)
    const T = L.topClusterLeft;
    const topLb = L.topClusterLabels || { top: '31', l: '32', r: '33' };
    this.drawStaffOfficeTeacherDesk(T * 32, 5 * 32, 4 * 32, 32, topLb.top, 'down');
    this.drawStaffOfficeTeacherDesk(T * 32, 6 * 32 + 4, 2 * 32 - 2, 3 * 32 - 4, topLb.l, 'right');
    this.drawStaffOfficeTeacherDesk((T + 2) * 32 + 2, 6 * 32 + 4, 2 * 32 - 2, 3 * 32 - 4, topLb.r, 'left');
    this.drawPartitionLine(T * 32 - 4, 6 * 32 + 2, (T + 4) * 32 + 4, 6 * 32 + 2);
    this.drawPartitionLine((T + 2) * 32, 6 * 32 + 2, (T + 2) * 32, 9 * 32 + 2);

    // [하단] 6개 분단
    for (const c of L.clusters) {
      const x = c.left;
      const lb = c.labels;
      if (c.type === 'five') {
        // 좌/우 2열 x 2행 + 하단 가로석 (5인 모둠)
        this.drawStaffOfficeTeacherDesk(x * 32, 15 * 32, 64, 64, lb.tl, 'right');
        this.drawStaffOfficeTeacherDesk((x + 3) * 32, 15 * 32, 64, 64, lb.tr, 'left');
        this.drawStaffOfficeTeacherDesk(x * 32, 17 * 32 + 4, 64, 64, lb.ml, 'right');
        this.drawStaffOfficeTeacherDesk((x + 3) * 32, 17 * 32 + 4, 64, 64, lb.mr, 'left');
        this.drawStaffOfficeTeacherDesk(x * 32, 20 * 32, 5 * 32, 36, lb.bottom, 'up');
        this.drawPartitionLine((x + 2.5) * 32, 14.8 * 32, (x + 2.5) * 32, 19.3 * 32);
        this.drawPartitionLine(x * 32 - 4, 17 * 32 + 2, (x + 5) * 32 + 4, 17 * 32 + 2);
        this.drawPartitionLine(x * 32 - 6, 19.7 * 32, (x + 5) * 32 + 6, 19.7 * 32);
      } else if (c.type === 'diamond') {
        // 1 - 2 - 1 자리 (11번 중앙테이블 및 14번 테이블을 10번 테이블과 동일한 5타일 폭 사이즈로 확장, 12·13번 좌우 대칭 정렬)
        this.drawStaffOfficeWorkTable(x * 32, 15 * 32, 5 * 32, 36, '중앙테이블');
        this.drawStaffOfficeTeacherDesk(x * 32, 17 * 32 + 4, 64, 64, lb.l, 'right');
        this.drawStaffOfficeTeacherDesk((x + 3) * 32, 17 * 32 + 4, 64, 64, lb.r, 'left');
        this.drawStaffOfficeTeacherDesk(x * 32, 20 * 32, 5 * 32, 36, lb.bottom, 'up');
        this.drawPartitionLine(x * 32 - 4, 17 * 32 + 2, (x + 5) * 32 + 4, 17 * 32 + 2);
        this.drawPartitionLine((x + 2.5) * 32, 17 * 32 + 2, (x + 2.5) * 32, 19.8 * 32);
        this.drawPartitionLine(x * 32 - 4, 19.8 * 32, (x + 5) * 32 + 4, 19.8 * 32);
      } else if (c.type === 'six') {
        // 좌/우 2열 x 3행 마주보기 (6인 모둠)
        this.drawStaffOfficeTeacherDesk(x * 32, 15 * 32, 64, 64, lb.tl, 'right');
        this.drawStaffOfficeTeacherDesk((x + 3) * 32, 15 * 32, 64, 64, lb.tr, 'left');
        this.drawStaffOfficeTeacherDesk(x * 32, 17 * 32 + 4, 64, 64, lb.ml, 'right');
        this.drawStaffOfficeTeacherDesk((x + 3) * 32, 17 * 32 + 4, 64, 64, lb.mr, 'left');
        this.drawStaffOfficeTeacherDesk(x * 32, 19 * 32 + 8, 64, 64, lb.bl, 'right');
        this.drawStaffOfficeTeacherDesk((x + 3) * 32, 19 * 32 + 8, 64, 64, lb.br, 'left');
        this.drawPartitionLine((x + 2.5) * 32, 14.8 * 32, (x + 2.5) * 32, 21.6 * 32);
        this.drawPartitionLine(x * 32 - 4, 17 * 32 + 2, (x + 5) * 32 + 4, 17 * 32 + 2);
        this.drawPartitionLine(x * 32 - 4, 19 * 32 + 6, (x + 5) * 32 + 4, 19 * 32 + 6);
      }
    }
  }

  drawStaffOfficeEntrances() {
    const ctx = this.ctx;
    const mapW = this.getMapWidth();

    // 1. 좌측 앞문 (tx: 1..2, ty: 11..13)
    const wx = 1 * 32;
    const wy = 11 * 32;
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(wx + 2, wy + 4, 60, 3 * 32 - 8);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(wx + 4, wy + 6, 56, 3 * 32 - 12);

    this.drawSharpLabel(5 * 32, wy + 48, '🚪 ◀ 앞문 (복도로 나가기)', {
      bgColor: '#7f1d1d',
      borderColor: '#fef08a',
      textColor: '#ffffff',
      fontSize: 12,
      paddingX: 10,
      height: 22
    });

    // 2. 우측 뒷문 (tx: mapW-3..mapW-2, ty: 11..13)
    const ex = (mapW - 3) * 32;
    const ey = 11 * 32;
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(ex + 2, ey + 4, 60, 3 * 32 - 8);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(ex + 4, ey + 6, 56, 3 * 32 - 12);

    this.drawSharpLabel((mapW - 5) * 32, ey + 48, '🚪 뒷문 (복도로 나가기) ▶', {
      bgColor: '#7f1d1d',
      borderColor: '#fef08a',
      textColor: '#ffffff',
      fontSize: 12,
      paddingX: 10,
      height: 22
    });
  }

  drawStaffOfficeSignage() {
    const C = this.getStaffOfficeLayout().counsel;
    this.ctx.save();
    this.ctx.font = 'bold 12px "Pretendard", "Noto Sans KR", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const counselCenter = ((C.x1 + C.x2) / 2 + 0.5) * 32;
    const counselDoorCenter = ((C.doorX1 + C.doorX2) / 2 + 0.5) * 32;

    const plaques = [
      { text: '📋 소회의실', x: 17.5 * 32, y: 4 * 32 + 12, bg: '#1e3a8a', border: '#fbbf24', color: '#fef08a' },
      { text: '☕ 탕비실', x: 33 * 32, y: 6.5 * 32, bg: '#7c2d12', border: '#fdba74', color: '#ffedd5' },
      { text: '🖨️ 인쇄실', x: 44 * 32, y: 8.4 * 32, bg: '#0f172a', border: '#94a3b8', color: '#f8fafc' },
      { text: '💬 상담실', x: counselCenter, y: 4 * 32 + 12, bg: '#065f46', border: '#6ee7b7', color: '#ecfdf5' }
    ];

    for (const p of plaques) {
      const textWidth = this.ctx.measureText(p.text).width;
      const boxW = textWidth + 16;
      const boxH = 22;

      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      this.ctx.fillRect(p.x - boxW / 2 + 1, p.y - boxH / 2 + 1, boxW, boxH);

      this.ctx.fillStyle = p.bg;
      this.ctx.fillRect(p.x - boxW / 2, p.y - boxH / 2, boxW, boxH);

      this.ctx.strokeStyle = p.border;
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(p.x - boxW / 2, p.y - boxH / 2, boxW, boxH);

      this.ctx.fillStyle = p.color;
      this.ctx.fillText(p.text, p.x, p.y + 0.5);
    }

    this.ctx.restore();
  }


  // ========================================================
  // 🚗 축구장 서쪽: 숭실 체육관 & 주차장 진입 게이트 (차단기 & 보행로)
  // ========================================================
  drawHighResGymGate(px, py) {
    this.ctx.save();

    // 1. Asphalt Road Connection branching off West from Tartan Track (tx: 0..3.6, ty: 47..51)
    // 세로로 2배 확장 (기존 72 -> 144, 현재 상단에서 아래방향으로만 확장)
    const roadX = 0;
    const roadW = Math.max(3.6 * 32, px + 24);
    const roadY = py - 36;
    const roadH = 144;

    this.ctx.fillStyle = '#1e293b'; // dark asphalt
    this.ctx.fillRect(roadX, roadY, roadW, roadH);

    // White safety lane lines & curbs
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(roadX, roadY, roadW, 3);
    this.ctx.fillRect(roadX, roadY + roadH - 3, roadW, 3);

    // 2. Yellow Zebra Pedestrian Crosswalk stripes (세로 2배로 확장된 도로 전체로 신장)
    const stripeCount = 4;
    for (let i = 0; i < stripeCount; i++) {
      const zx = roadX + 10 + i * 22;
      this.ctx.fillStyle = '#fef08a';
      this.ctx.fillRect(zx, roadY + 6, 12, roadH - 12);
    }

    // 가운데 ~~교직원 전용 글씨는 요청에 따라 완전 삭제됨

    // 3. Boom Barrier / Parking Gate (차단기) on North curb
    const bx = roadX + roadW - 18;
    const by = roadY - 14;

    // Heavy yellow steel housing post
    this.ctx.fillStyle = '#eab308';
    this.ctx.fillRect(bx, by, 12, 34);
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(bx + 2, by + 4, 8, 7); // control box window
    this.ctx.fillRect(bx + 2, by + 16, 8, 3);
    this.ctx.fillRect(bx + 2, by + 23, 8, 3);

    // Flashing Red LED Beacon on top
    const now = Date.now();
    const flashAlpha = 0.5 + Math.sin(now / 180) * 0.45;
    this.ctx.fillStyle = 'rgba(239, 68, 68, ' + flashAlpha + ')';
    this.ctx.beginPath();
    this.ctx.arc(bx + 6, by - 4, 5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(bx + 4, by - 2, 4, 3);

    // Horizontal barrier arm (차단봉) extending across road
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(bx - 32, by + 16, 32, 4);
    // Red stripes on arm
    this.ctx.fillStyle = '#dc2626';
    for (let rx = bx - 30; rx < bx; rx += 9) {
      this.ctx.fillRect(rx, by + 16, 4, 4);
    }

    // 4. Direction Signpost (방향 표지판) - cleanly placed ABOVE road on sand
    const signY = roadY - 42;
    // Signpost pole
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(px + 18, signY + 10, 4, roadY - (signY + 10));

    this.drawSharpLabel(px + 20, signY, '🚗 [체육관 & 주차장]', {
      bgColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#f59e0b',
      borderWidth: 2,
      textColor: '#fef08a',
      fontSize: 11,
      paddingX: 10,
      height: 20
    });

    this.ctx.restore();
  }

  // ========================================================
  // 🏛️ 숭실 7층 종합 체육관 & 지상 주차장 광장 렌더러 (설계도 완전 반영)
  // ========================================================
  renderGymPlaza() {
    const mapW = this.getMapWidth();
    const mapH = this.getMapHeight();

    // 1. Dark Aggregate Asphalt Pavement Base (주차장 아스팔트 베이스)
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(0, 0, mapW * 32, mapH * 32);

    // Micro asphalt speckle texture
    this.ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
    for (let ax = 0; ax < mapW; ax += 2) {
      for (let ay = 0; ay < mapH; ay += 2) {
        this.ctx.fillRect(ax * 32 + 8, ay * 32 + 6, 1.5, 1.5);
        this.ctx.fillRect(ax * 32 + 20, ay * 32 + 18, 1, 1);
      }
    }

    // 2. West Edge (tx: 0..8): 언덕길 (Uphill Hillside Road & Retaining Wall)
    this.drawHighResHillsideRoad(mapH);

    // 3. North Area (tx: 9..55, ty: 0..11): 7-Story Gymnasium Building Facade
    this.drawHighResGymBuildingFacade(mapW);

    // 4. Upper-Middle Area (ty: 12..19): [교직원 주차 구역] 6구역
    this.drawSixParkingBays();

    // 5. Far Right (tx: 52..54.6, ty: 13..19): 🚌 숭실 25인승 노란색 스쿨버스 |(오른쪽 벽에 바짝 붙임)
    this.drawVerticalSchoolBus(52 * 32, 13 * 32);

    // 5-B. 🏃 숭실고 체육선생님 (주차장 1분 체력장: tx: 44, ty: 15)
    this.drawHighResPETeacher(44 * 32, 15 * 32);

    // 6. Middle Promenade (ty: 20..25): 보도블록 보행로 (보라색 화단, 황동 가로등, 볼라드 & 소나무 가로수 🌲)
    this.drawPromenadeAndLandscaping(mapW);

    // 7. Bottom Driving Aisles (ty: 26..35): 아스팔트 주행 차로 & 방향 화살표
    this.drawDrivingAisles(mapW, mapH);

    // 8. Main Gate Barrier is rendered at the start of Uphill Road (tx: 0..8, ty: 31..33)
    // 8-B. 👮 배움터 지킴이 선생님 (숭실중학교 정문 오른쪽: tx: 10, ty: 33)
    this.drawHighResGuardTeacher(10 * 32, 33 * 32);

    // 8-C. 📜 떨어진 개발자노트 제4편 (tx: 31, ty: 33 - 갓준철 선생님 자리)
    const gymDevNote4 = (WORLD_DATA.playground_gym && WORLD_DATA.playground_gym.devNote4) || { x: 31, y: 33 };
    this.drawHighResDevNote(gymDevNote4.x * 32, gymDevNote4.y * 32, '📜 떨어진 개발자노트 (제4편)');

    // 9. East Exit Gate to Soccer Field (tx: 50..55, ty: 28..32)
    const exitX = 51 * 32;
    const exitY = 28 * 32;
    const exitW = 5 * 32;
    const exitH = 4.5 * 32;

    // Crosswalk Zebra Stripes
    for (let i = 0; i < 5; i++) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(exitX + i * 26 + 10, exitY + 8, 14, exitH - 16);
    }

    // Direction Signpost to Soccer Field
    this.drawSharpLabel(exitX + 64, exitY - 14, '[운동장 ➡️]', {
      bgColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#22c55e',
      borderWidth: 2,
      textColor: '#86efac',
      fontSize: 11.5,
      paddingX: 12,
      height: 22
    });
  }

  // ========================================================
  // [언덕길 & 정문 차단기] 서쪽 급경사 언덕길 & 옹벽 (tx: 0..8, ty: 0..35)
  // ========================================================
  drawHighResHillsideRoad(mapH) {
    const ctx = this.ctx;
    ctx.save();

    const roadW = 8.5 * 32;
    const roadH = mapH * 32;

    // 1. Asphalt Road Surface with uphill gradient shading
    const grad = ctx.createLinearGradient(0, roadH, 0, 0);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e293b');
    grad.addColorStop(1, '#334155');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, roadW, roadH);

    // 2. Concrete Retaining Wall along West edge (x: 0..20)
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 20, roadH);
    ctx.fillStyle = '#334155';
    ctx.fillRect(18, 0, 2, roadH);
    // Expansion joints every 48px
    ctx.fillStyle = '#1e293b';
    for (let y = 0; y < roadH; y += 48) {
      ctx.fillRect(0, y, 20, 2);
    }

    // 3. Double Solid Yellow Center Dividing Line
    ctx.fillStyle = '#eab308';
    ctx.fillRect(roadW / 2 - 4, 0, 3, roadH);
    ctx.fillRect(roadW / 2 + 1, 0, 3, roadH);

    // 4. White Road Shoulder lines
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(24, 0, 3, roadH);
    ctx.fillRect(roadW - 16, 0, 3, roadH);

    // 5. Clean Uphill Road Chevron Lines (바닥 텍스트 글씨 완전 삭제)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    for (let y = 140; y < roadH - 180; y += 220) {
      ctx.beginPath();
      ctx.moveTo(roadW * 0.3, y + 10);
      ctx.lineTo(roadW * 0.3, y);
      ctx.lineTo(roadW * 0.3 - 8, y + 8);
      ctx.moveTo(roadW * 0.3, y);
      ctx.lineTo(roadW * 0.3 + 8, y + 8);
      ctx.stroke();
    }

    // 6. East Guardrail & Curb separating Hillside from Parking/Plaza
    ctx.fillStyle = '#64748b';
    ctx.fillRect(roadW - 10, 0, 10, roadH);
    // Yellow/Black diagonal hazard stripes on curb
    for (let y = 0; y < roadH; y += 32) {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(roadW - 10, y, 10, 16);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(roadW - 10, y + 16, 10, 16);
    }

    // Steel guardrail posts
    ctx.fillStyle = '#cbd5e1';
    for (let y = 16; y < roadH - 140; y += 48) {
      ctx.fillRect(roadW - 6, y, 4, 18);
    }

    // 7. 🏛️ 숭실 정문 & 교직원 차량 차단기 (언덕길 시작부분: 차단이자 정문)
    const gateY = roadH - 96;
    const bx = roadW - 14;

    // Small Security Booth on the Island Curb
    ctx.fillStyle = '#334155';
    ctx.fillRect(bx - 6, gateY - 32, 22, 54);
    ctx.fillStyle = '#991b1b'; // canopy roof
    ctx.fillRect(bx - 9, gateY - 36, 28, 6);
    // Security booth window
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.fillRect(bx - 3, gateY - 24, 16, 16);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx - 3, gateY - 24, 16, 16);

    // Boom barrier housing (yellow steel post)
    ctx.fillStyle = '#eab308';
    ctx.fillRect(bx - 14, gateY + 6, 12, 32);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx - 12, gateY + 10, 8, 6);

    // Flashing Red LED Beacon on top
    const now = Date.now();
    const flashAlpha = 0.5 + Math.sin(now / 150) * 0.45;
    ctx.fillStyle = 'rgba(239, 68, 68, ' + flashAlpha + ')';
    ctx.beginPath();
    ctx.arc(bx - 8, gateY + 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Horizontal barrier arm extending across the uphill road
    const armW = roadW - 46;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx - 14 - armW, gateY + 18, armW, 5);
    // Red diagonal hazard stripes on arm
    ctx.fillStyle = '#dc2626';
    for (let rx = bx - 14 - armW + 6; rx < bx - 14; rx += 16) {
      ctx.fillRect(rx, gateY + 18, 8, 5);
    }

    // Main Gate Illuminated Signboard Badge
    this.drawSharpLabel(roadW * 0.5, gateY - 50, '🏛️ [숭실중학교 정문]', {
      bgColor: 'rgba(15, 23, 42, 0.98)',
      borderColor: '#f59e0b',
      borderWidth: 2,
      textColor: '#fef08a',
      fontSize: 10.5,
      paddingX: 12,
      height: 22
    });

    ctx.restore();
  }

  // ========================================================
  // 7층 높이 웅장한 체육관 파사드 연출 (tx: 9..55, ty: 0..11)
  // ========================================================
  drawHighResGymBuildingFacade(mapW) {
    const ctx = this.ctx;
    ctx.save();

    const startX = 8.5 * 32;
    const facadeW = mapW * 32 - startX;

    // 1. Towering Skyward Perspective Upper Layer (ty: 0..3)
    const gradSky = ctx.createLinearGradient(0, 0, 0, 3 * 32);
    gradSky.addColorStop(0, '#020617');
    gradSky.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradSky;
    ctx.fillRect(startX, 0, facadeW, 3 * 32);

    // Towering Vertical Architectural Louvers (7층으로 뻗어 올라가는 원근 투영)
    ctx.fillStyle = '#1e293b';
    for (let lx = startX + 16; lx < mapW * 32; lx += 32) {
      ctx.fillRect(lx, 0, 6, 3 * 32);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.fillRect(lx + 6, 0, 2, 3 * 32);
      ctx.fillStyle = '#1e293b';
    }

    // Upper Parapet Embossed Architectural Title
    ctx.font = '900 13px "Pretendard", sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.textAlign = 'center';
    ctx.fillText('SOONGSIL MULTI-PURPOSE GYMNASIUM · SINCE 1897', startX + facadeW / 2, 1.4 * 32);

    // 2. 2nd Floor High Glass Curtain Wall (ty: 3..7)
    const floor2Y = 3 * 32;
    const floor2H = 4 * 32;

    // Dark Tinted Glass Backing
    const glassGrad = ctx.createLinearGradient(0, floor2Y, 0, floor2Y + floor2H);
    glassGrad.addColorStop(0, '#0f172a');
    glassGrad.addColorStop(0.5, '#1e3a5f');
    glassGrad.addColorStop(1, '#0f2744');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(startX, floor2Y, facadeW, floor2H);

    // Diagonal Glass Specular Sheen Reflections
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    for (let gx = startX; gx < mapW * 32; gx += 96) {
      ctx.beginPath();
      ctx.moveTo(gx, floor2Y + floor2H);
      ctx.lineTo(gx + 36, floor2Y);
      ctx.lineTo(gx + 64, floor2Y);
      ctx.lineTo(gx + 28, floor2Y + floor2H);
      ctx.closePath();
      ctx.fill();
    }

    // Heavy Aluminum Mullion Grids
    ctx.fillStyle = '#334155';
    for (let mx = startX; mx < mapW * 32; mx += 48) {
      ctx.fillRect(mx, floor2Y, 4, floor2H);
    }
    ctx.fillRect(startX, floor2Y + floor2H / 2, facadeW, 4);

    // Interior Silhouettes: High Ceiling Trusses & Basketball Hoops
    ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
    for (let hx of [16 * 32, 28 * 32, 40 * 32, 50 * 32]) {
      // Warm stadium halogen floodlight glow
      ctx.beginPath();
      ctx.arc(hx, floor2Y + 24, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    // Basketball hoop & net silhouettes
    for (let bx of [20 * 32, 44 * 32]) {
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx - 12, floor2Y + 40, 24, 16);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(bx - 8, floor2Y + 56, 16, 2);
    }

    // 3. 1st Floor Architectural Granite Building Wall & Windows (ty: 7..11, y: 224..352)
    const floor1Y = 7 * 32;
    const floor1H = 4 * 32;

    // 3-A. Architectural Granite Stone Wall Cladding (#475569)
    ctx.fillStyle = '#475569';
    ctx.fillRect(startX, floor1Y, facadeW, floor1H);

    // Ashlar Granite Masonry Joint Seams (가로 및 세로 석재 메지 라인)
    ctx.fillStyle = '#334155';
    for (let my = floor1Y + 32; my < floor1Y + floor1H; my += 32) {
      ctx.fillRect(startX, my, facadeW, 1.5);
    }
    for (let mx = startX + 32; mx < startX + facadeW; mx += 64) {
      ctx.fillRect(mx, floor1Y, 1.5, floor1H);
    }

    // Top Architectural Cornice & Spandrel Frieze
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(startX, floor1Y, facadeW, 8);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(startX, floor1Y + 2, facadeW, 4);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(startX, floor1Y + 6, facadeW, 2);

    // 3-B. 1st Floor Panoramic Ground View Windows (1층 대형 로비 전망창: 건물이 확실히 보이도록 배치)
    // Left & Center window banks between startX and the entrance portico
    const winLeft = startX + 24;
    const winRight = 41.5 * 32 - 16;
    const winY = floor1Y + 20;
    const winH = floor1H - 34; // 94px high
    const winW = winRight - winLeft;

    if (winW > 100) {
      // Dark window frame casing
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(winLeft - 4, winY - 4, winW + 8, winH + 8);

      // Deep cyan/navy tinted glass with warm indoor lobby lighting
      const winGrad = ctx.createLinearGradient(0, winY, 0, winY + winH);
      winGrad.addColorStop(0, '#0f2744');
      winGrad.addColorStop(0.5, '#1e3a5f');
      winGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = winGrad;
      ctx.fillRect(winLeft, winY, winW, winH);

      // Warm interior lobby glow radiating from inside
      ctx.fillStyle = 'rgba(254, 240, 138, 0.18)';
      ctx.fillRect(winLeft, winY, winW, winH);

      // Diagonal specular glass sheen reflections
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let gx = winLeft; gx < winRight; gx += 80) {
        ctx.beginPath();
        ctx.moveTo(gx, winY + winH);
        ctx.lineTo(gx + 24, winY);
        ctx.lineTo(gx + 44, winY);
        ctx.lineTo(gx + 20, winY + winH);
        ctx.closePath();
        ctx.fill();
      }

      // Aluminum window mullions
      ctx.fillStyle = '#334155';
      for (let mx = winLeft + 48; mx < winRight; mx += 48) {
        ctx.fillRect(mx, winY, 3, winH);
      }
      ctx.fillRect(winLeft, winY + winH * 0.45, winW, 3); // horizontal transom

      // Indoor Silhouettes: Lobby plants, reception lights, gym equipment
      ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
      for (let hx = winLeft + 48; hx < winRight; hx += 96) {
        ctx.beginPath();
        ctx.arc(hx, winY + 16, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      // Heavy granite windowsill
      ctx.fillStyle = '#64748b';
      ctx.fillRect(winLeft - 6, winY + winH, winW + 12, 5);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(winLeft - 6, winY + winH + 3, winW + 12, 2);
    }

    // 3-C. Architectural LED Up/Down Wall Sconces along piers
    for (let lx of [startX + 18, 20 * 32, 32 * 32, 40 * 32]) {
      // Light cones
      const sconceY = floor1Y + 36;
      ctx.fillStyle = 'rgba(254, 240, 138, 0.12)';
      ctx.beginPath();
      ctx.moveTo(lx, sconceY);
      ctx.lineTo(lx - 16, floor1Y + 6);
      ctx.lineTo(lx + 16, floor1Y + 6);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(lx, sconceY);
      ctx.lineTo(lx - 20, floor1Y + floor1H - 8);
      ctx.lineTo(lx + 20, floor1Y + floor1H - 8);
      ctx.closePath();
      ctx.fill();

      // Sconce fixture
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(lx - 3, sconceY - 6, 6, 12);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(lx - 2, sconceY - 1, 4, 2);
    }

    // 3-D. Heavy Foundation Plinth Baseboard (건물 바닥 석재 기단)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(startX, floor1Y + floor1H - 8, facadeW, 8);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(startX, floor1Y + floor1H - 8, facadeW, 2);

    // 3-E. Deep Ambient Drop Shadow cast onto the asphalt ground (건물 외벽이 수직으로 서 있음을 명확히 보여주는 그림자)
    const shadowGrad = ctx.createLinearGradient(0, floor1Y + floor1H, 0, floor1Y + floor1H + 16);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(startX, floor1Y + floor1H, facadeW, 16);

    // 4. Polished Approach Plaza leading from promenade to Entrance (tx: 41..51, ty: 12..19)
    const entryPlazaX = 41.5 * 32;
    const entryPlazaW = 10 * 32;
    const entryPlazaY = 12 * 32;
    const entryPlazaH = 8 * 32;

    // Elegant Light Granite Pavers entryway
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(entryPlazaX, entryPlazaY, entryPlazaW, entryPlazaH);
    ctx.fillStyle = '#94a3b8';
    for (let px = entryPlazaX; px < entryPlazaX + entryPlazaW; px += 24) {
      for (let py = entryPlazaY; py < entryPlazaY + entryPlazaH; py += 16) {
        ctx.fillRect(px, py, 22, 14);
      }
    }
    // Subtle walkway border curbs
    ctx.fillStyle = '#64748b';
    ctx.fillRect(entryPlazaX - 2, entryPlazaY, 2, entryPlazaH);
    ctx.fillRect(entryPlazaX + entryPlazaW, entryPlazaY, 2, entryPlazaH);

    // 5. Grand Entrance Portico located between EV Charger & School Bus (centerX = 46.5 * 32)
    const centerX = 46.5 * 32;
    const pX = 42.5 * 32;
    const pW = 8 * 32;
    const pY = 8 * 32;

    // Polished Light Marble Steps (3 tiers)
    for (let s = 0; s < 3; s++) {
      ctx.fillStyle = s % 2 === 0 ? '#cbd5e1' : '#94a3b8';
      ctx.fillRect(pX - s * 6, pY + s * 10, pW + s * 12, 10);
    }

    // Four Massive Grand Cylindrical Granite Columns (flanking the entrance at tx: 42.5, 44, 49, 50.5)
    for (const cx of [42.5, 44.2, 48.8, 50.5]) {
      const colX = cx * 32;
      const colY = floor1Y + 6;
      const colH = floor1H - 6;

      // 3D Cylindrical gradient
      const colGrad = ctx.createLinearGradient(colX - 8, 0, colX + 16, 0);
      colGrad.addColorStop(0, '#64748b');
      colGrad.addColorStop(0.35, '#f8fafc');
      colGrad.addColorStop(0.7, '#cbd5e1');
      colGrad.addColorStop(1, '#475569');
      ctx.fillStyle = colGrad;
      ctx.fillRect(colX - 8, colY, 20, colH);

      // Capital & Plinth
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(colX - 10, colY, 24, 6);
      ctx.fillRect(colX - 10, colY + colH - 6, 24, 6);
    }

    // Grand Automatic Sliding Glass Doors (tx: 45..48, ty: 9..11)
    const dW = 3.2 * 32;
    const dH = 2 * 32;
    const dX = centerX - dW / 2;
    const dY = 9 * 32;

    // Dark Lobby Interior Glow
    ctx.fillStyle = '#020617';
    ctx.fillRect(dX, dY, dW, dH);
    ctx.fillStyle = 'rgba(254, 240, 138, 0.28)';
    ctx.fillRect(dX, dY, dW, dH);

    // Cyan Tinted Glass Doors
    ctx.fillStyle = 'rgba(56, 189, 248, 0.38)';
    ctx.fillRect(dX + 4, dY + 4, dW / 2 - 6, dH - 4);
    ctx.fillRect(dX + dW / 2 + 2, dY + 4, dW / 2 - 6, dH - 4);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(dX + 4, dY + 4, dW / 2 - 6, dH - 4);
    ctx.strokeRect(dX + dW / 2 + 2, dY + 4, dW / 2 - 6, dH - 4);

    // Automatic Sensor Bar & LED
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(dX + dW / 2 - 12, dY - 4, 24, 4);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(dX + dW / 2 - 3, dY - 3, 6, 2);

    // 6. Monumental Embossed Golden Signboard above Entrance (Centered at 46.5 * 32)
    this.drawSharpLabel(centerX, 7.6 * 32, '🏛️ 숭실 체육관 · SOONGSIL GYMNASIUM', {
      bgColor: 'rgba(15, 23, 42, 0.98)',
      borderColor: '#fbbf24',
      borderWidth: 2.5,
      textColor: '#fef08a',
      fontSize: 13,
      paddingX: 16,
      height: 28
    });

    // (하단 설명 배지 및 스포츠헤리티지관·트로피관 삭제 완료 - 정돈된 화강암 파사드)

    ctx.restore();
  }

  // Trophy Showcase Display Window
  drawTrophyDisplayWindow(x, y, label) {
    const ctx = this.ctx;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 32, y, 64, 42);
    ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
    ctx.fillRect(x - 30, y + 2, 60, 38);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 32, y, 64, 42);

    this.drawSharpLabel(x, y - 10, label, {
      bgColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#f59e0b',
      borderWidth: 1,
      textColor: '#fef08a',
      fontSize: 9.5,
      paddingX: 6,
      height: 16
    });
  }

  // ========================================================
  // [교직원 주차 구역] 총 6구역 주차 공간 & 차량들 (ty: 12..19)
  // ========================================================
  drawSixParkingBays() {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;

    const bayY = 12 * 32;
    const bayH = 7 * 32;

    // 6 Parking Bays: tx: 11.5, 16.5, 21.5, 26.5, 31.5, 36.5
    const bayXs = [11.5, 16.5, 21.5, 26.5, 31.5, 36.5];
    const bayLabels = [
      '[교직원 전용] 1',
      '[교직원 전용] 2',
      '[교직원 전용] 3',
      '[교직원 전용] 4',
      '[교직원 전용] 5',
      '⚡ EV ONLY 6'
    ];

    for (let i = 0; i < bayXs.length; i++) {
      const bx = bayXs[i] * 32;
      const bw = 4.2 * 32;

      // Stall white outline
      ctx.strokeRect(bx, bayY, bw, bayH);

      // Yellow wheel stoppers (카스토퍼)
      ctx.fillStyle = '#eab308';
      ctx.fillRect(bx + 12, bayY + 12, bw - 24, 6);
      ctx.fillStyle = '#0f172a';
      for (let sx = bx + 16; sx < bx + bw - 16; sx += 14) {
        ctx.fillRect(sx, bayY + 12, 6, 6);
      }

      // Asphalt Stencil Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '700 9.5px "Pretendard", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bayLabels[i], bx + bw / 2, bayY + bayH - 10);
    }

    // 1. Bay 1: 🚘 교장선생님 럭셔리 블랙 세단
    this.drawHighResParkedCar(11.8 * 32, 13.5 * 32, '#0f172a', 'sedan');

    // 2. Bay 2: 🚙 체육부장 메탈릭 네이비 SUV
    this.drawHighResParkedCar(16.8 * 32, 13.5 * 32, '#1e3a5f', 'suv');

    // 3. Bay 3: 🤍 교무부장 펄 화이트 세단
    this.drawHighResParkedCar(21.8 * 32, 13.5 * 32, '#f8fafc', 'sedan');

    // 4. Bay 4: 🩶 진로진학부장 모던 실버 세단
    this.drawHighResParkedCar(26.8 * 32, 13.5 * 32, '#94a3b8', 'sedan');

    // 5. Bay 5: 🍷 음악선생님 크림슨 레드 해치백
    this.drawHighResParkedCar(31.8 * 32, 13.5 * 32, '#991b1b', 'sedan');

    // 6. Bay 6: ⚡ EV 급속 충전 스테이션 & 🩵 블루 전기차
    this.drawHighResEVCharger(36.8 * 32, 13 * 32);

    ctx.restore();
  }

  // ========================================================
  // 🚌 숭실 25인승 노란색 스쿨버스 |(세로 배치) (tx: 44..48, ty: 13..19)
  // ========================================================
  drawVerticalSchoolBus(x, y) {
    const ctx = this.ctx;
    ctx.save();

    const w = 2.6 * 32; // 83px width
    const h = 5.5 * 32; // 176px length

    // Bus Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2 + 4, w / 2 + 8, h / 2 + 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Rubber Tires protruding on sides (Front and Rear Axles)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 5, y + 24, 7, 24); // Front Left
    ctx.fillRect(x + w - 2, y + 24, 7, 24); // Front Right
    ctx.fillRect(x - 5, y + h - 48, 7, 26); // Rear Left
    ctx.fillRect(x + w - 2, y + h - 48, 7, 26); // Rear Right

    // School Bus Yellow Body (#f59e0b / #eab308)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Black Rubber Bumpers (Top and Bottom)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 4, y, w - 8, 8); // Top bumper
    ctx.fillRect(x + 4, y + h - 8, w - 8, 8); // Bottom bumper

    // Front Windshield (Bottom facing)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x + 6, y + h - 34, w - 12, 22, 6);
    ctx.fill();

    // Windshield reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + h - 14);
    ctx.lineTo(x + 22, y + h - 32);
    ctx.lineTo(x + 30, y + h - 32);
    ctx.lineTo(x + 16, y + h - 14);
    ctx.closePath();
    ctx.fill();

    // Headlights (Bottom corners)
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(x + 12, y + h - 4, 4, 0, Math.PI * 2);
    ctx.arc(x + w - 12, y + h - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Turn indicator amber lights
    ctx.fillStyle = '#f97316';
    ctx.fillRect(x + 4, y + h - 6, 4, 3);
    ctx.fillRect(x + w - 8, y + h - 6, 4, 3);

    // Rear Window (Top facing)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x + 8, y + 10, w - 16, 12, 4);
    ctx.fill();

    // Side Passenger Windows (along left & right)
    ctx.fillStyle = '#1e293b';
    for (let wy = y + 30; wy < y + h - 42; wy += 20) {
      ctx.fillRect(x + 4, wy, 8, 14);
      ctx.fillRect(x + w - 12, wy, 8, 14);
    }

    // Roof Center Air Conditioner Unit & Emergency Hatch
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(x + w / 2 - 12, y + 42, 24, 28, 4);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + w / 2 - 9, y + 48, 18, 3);
    ctx.fillRect(x + w / 2 - 9, y + 56, 18, 3);

    // Emergency Roof Hatch (EXIT)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(x + w / 2 - 13, y + 78, 26, 17, 3);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 8.5px "Pretendard", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', x + w / 2, y + 90);

    // Yellow Roof Beacon Lights (4 corners - separate paths to prevent diagonal polygon overlap)
    ctx.fillStyle = '#eab308';
    ctx.beginPath(); ctx.arc(x + 8, y + 6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + w - 8, y + 6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 8, y + h - 8, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + w - 8, y + h - 8, 3, 0, Math.PI * 2); ctx.fill();

    this.drawSharpLabel(x + w / 2, y - 10, '🚌 숭실 축구부 버스', {
      bgColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: '#f59e0b',
      borderWidth: 1.5,
      textColor: '#fef08a',
      fontSize: 10,
      paddingX: 8,
      height: 18
    });

    // Bus Horn Sound Wave Animation (이스터에그 발동 시 빵! 빵~!)
    if (this.busHornEffectUntil && Date.now() < this.busHornEffectUntil) {
      const pulseTime = Math.max(0, (this.busHornEffectUntil - Date.now()) / 1400);
      const ringRadius = 24 + (1 - pulseTime) * 48;
      ctx.strokeStyle = `rgba(250, 204, 21, ${pulseTime * 0.9})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h - 14, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(245, 158, 11, ${pulseTime * 0.6})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h - 14, ringRadius + 18, 0, Math.PI * 2);
      ctx.stroke();

      this.drawSharpLabel(x + w / 2, y + h / 2, '📢 빵! 빵~~!! (HONK!)', {
        bgColor: 'rgba(234, 88, 12, 0.95)',
        borderColor: '#fde047',
        borderWidth: 2,
        textColor: '#ffffff',
        fontSize: 12,
        paddingX: 12,
        height: 24
      });
    }

    ctx.restore();
  }

  // 🚘 Parked Sedans / SUVs
  drawHighResParkedCar(x, y, color, model = 'sedan') {
    const ctx = this.ctx;
    ctx.save();
    const w = 3.6 * 32;
    const h = 4.8 * 32;

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2 + 4, h / 2 + 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Car Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x + 6, y + 10, w - 12, h - 20, 10);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Windshield & Rear glass
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x + 12, y + 24, w - 24, 18, 4); // Rear glass
    ctx.roundRect(x + 12, y + h - 46, w - 24, 20, 4); // Windshield
    ctx.fill();

    // Sunroof or roof panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + 16, y + 50, w - 32, 34);

    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 10, y + h - 14, 8, 4);
    ctx.fillRect(x + w - 18, y + h - 14, 8, 4);

    // Tail lights
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 10, y + 10, 8, 4);
    ctx.fillRect(x + w - 18, y + 10, 8, 4);

    // Wheels on sides
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 2, y + 24, 5, 18);
    ctx.fillRect(x + w - 7, y + 24, 5, 18);
    ctx.fillRect(x + 2, y + h - 44, 5, 18);
    ctx.fillRect(x + w - 7, y + h - 44, 5, 18);

    const tag = model === 'suv' ? '🚙 교직원 SUV' : (color === '#f8fafc' ? '🤍 교직원 세단' : (color === '#991b1b' ? '🍷 음악선생님 해치백' : (color === '#2563eb' ? '⚡ 친환경 전기차 (충전 중)' : '🚘 교직원 럭셔리 세단')));
    this.drawSharpLabel(x + w / 2, y - 8, tag, {
      bgColor: 'rgba(15, 23, 42, 0.88)',
      borderColor: '#94a3b8',
      borderWidth: 1,
      textColor: '#f8fafc',
      fontSize: 9.5,
      paddingX: 6,
      height: 18
    });

    ctx.restore();
  }

  // ⚡ EV Fast Charger & Charging Car
  drawHighResEVCharger(x, y) {
    const ctx = this.ctx;
    ctx.save();

    // Vivid Green Epoxy EV Bay Base
    ctx.fillStyle = 'rgba(5, 150, 105, 0.22)';
    ctx.fillRect(x - 4, y, 4 * 32, 6 * 32);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 4, y, 4 * 32, 6 * 32);

    // EV Charger Pedestal (기둥)
    const px = x + 8;
    const py = y + 8;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px, py, 16, 36);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(px + 2, py + 2, 12, 8); // screen
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(px + 3, py + 14, 10, 3); // LED light

    // Parked Blue Electric Car
    this.drawHighResParkedCar(x + 6, y + 42, '#2563eb', 'sedan');

    // Charging Cable
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(px + 12, py + 24);
    ctx.bezierCurveTo(px + 24, py + 40, px + 28, py + 50, x + 34, y + 60);
    ctx.stroke();

    this.drawSharpLabel(x + 2 * 32, y - 10, '⚡ 100kW DC 전기차 급속 충전소', {
      bgColor: 'rgba(6, 78, 59, 0.95)',
      borderColor: '#34d399',
      borderWidth: 1.5,
      textColor: '#a7f3d0',
      fontSize: 9.5,
      paddingX: 8,
      height: 18
    });

    // Electric Zap Shockwave & Sparks Animation (이스터에그 발동 시 찌릿찌릿 감전!)
    if (this.electricZapEffectUntil && Date.now() < this.electricZapEffectUntil) {
      const zapTime = Math.max(0, (this.electricZapEffectUntil - Date.now()) / 1400);
      const zapR = 20 + (1 - zapTime) * 45;
      ctx.strokeStyle = `rgba(56, 189, 248, ${zapTime * 0.9})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(px + 12, py + 24, zapR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = '700 15px sans-serif';
      ctx.textAlign = 'center';
      const offsets = [[-20, -16], [22, -10], [-16, 26], [20, 24]];
      for (const [ox, oy] of offsets) {
        ctx.fillText('⚡', px + 12 + ox, py + 24 + oy);
      }

      this.drawSharpLabel(px + 12, py - 26, '⚡ 찌릿찌릿!! (초강력 정전기 감전!)', {
        bgColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#38bdf8',
        borderWidth: 2,
        textColor: '#7dd3fc',
        fontSize: 11.5,
        paddingX: 12,
        height: 22
      });
    }

    ctx.restore();
  }

  // ========================================================
  // [보행로 & 조경] 보도블록 보행로, 보라색 화단, 황동 가로등, 볼라드, 소나무 (ty: 20..25)
  // ========================================================
  drawPromenadeAndLandscaping(mapW) {
    const ctx = this.ctx;
    ctx.save();

    const startX = 8.5 * 32;
    const walkY = 20 * 32;
    const walkW = mapW * 32 - startX;
    const walkH = 5 * 32;

    // 1. Interlocking Concrete Paver Base (보도블록 바닥)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(startX, walkY, walkW, walkH);

    // Distinct paver block pattern
    ctx.fillStyle = '#cbd5e1';
    for (let px = startX; px < mapW * 32; px += 24) {
      for (let py = walkY; py < walkY + walkH; py += 16) {
        ctx.fillRect(px, py, 22, 14);
      }
    }

    // Granite Curbs (Top and Bottom)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(startX, walkY, walkW, 4);
    ctx.fillRect(startX, walkY + walkH - 4, walkW, 4);

    // 2. 보라색 화단 (Purple Flower Beds)
    for (let tx of [13, 25, 37]) {
      this.drawPurpleFlowerBed(tx * 32, walkY + 1.2 * 32);
    }

    // 3. 황동 가로등 (Brass Street Lamps)
    for (let tx of [19, 31, 43]) {
      this.drawBrassStreetLamp(tx * 32, walkY + 1.5 * 32);
    }

    // 4. 소나무 가로수 🌲 (Pine Trees on the right promenade)
    for (let tx of [47, 52]) {
      this.drawPineTree(tx * 32, walkY + 2.2 * 32);
    }

    // 5. Stainless Steel & Red Reflective Safety Bollards along bottom curb
    for (let bx = startX + 24; bx < mapW * 32 - 160; bx += 40) {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(bx, walkY + walkH - 12, 6, 10);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bx, walkY + walkH - 9, 6, 2); // reflective stripe
    }

    ctx.restore();
  }

  // 🌸 보라색 화단 (Purple Flower Bed)
  drawPurpleFlowerBed(x, y) {
    const ctx = this.ctx;
    const w = 2.4 * 32;
    const h = 1.3 * 32;

    // Granite curbing frame
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();

    // Dark fertile garden soil
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 3, w - 6, h - 6, 4);
    ctx.fill();

    // Lush green foliage base
    ctx.fillStyle = '#16a34a';
    for (let fx = x + 8; fx < x + w - 8; fx += 10) {
      ctx.fillRect(fx, y + 8, 8, h - 14);
    }

    // Vibrant Purple / Violet Blooming Petals (Lavender / Salvia)
    const petals = ['#8b5cf6', '#a855f7', '#c084fc', '#7c3aed', '#6d28d9'];
    for (let i = 0; i < 18; i++) {
      const px = x + 6 + (i * 13) % (w - 12);
      const py = y + 6 + ((i * 7) % (h - 12));
      ctx.fillStyle = petals[i % petals.length];
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 💡 황동 가로등 (Brass Street Lamp)
  drawBrassStreetLamp(x, y) {
    const ctx = this.ctx;
    // Ambient warm ground glow
    const glow = ctx.createRadialGradient(x, y + 36, 4, x, y + 36, 42);
    glow.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
    glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y + 36, 42, 0, Math.PI * 2);
    ctx.fill();

    // Classical Antique Brass Pole (#b45309, #d97706, #f59e0b)
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x - 2, y, 4, 38);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x - 5, y + 34, 10, 4); // base pedestal

    // Ornamental Curved Arm Bracket
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x - 8, y + 2, 16, 3);

    // Hexagonal Brass Lantern Head
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(x, y - 6);
    ctx.lineTo(x + 7, y);
    ctx.lineTo(x + 5, y + 10);
    ctx.lineTo(x - 5, y + 10);
    ctx.lineTo(x - 7, y);
    ctx.closePath();
    ctx.fill();

    // Glowing Lantern Core
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(x, y + 4, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 🌲 소나무 가로수 (Korean Red Pine)
  drawPineTree(x, y) {
    const ctx = this.ctx;
    // Gnarled Red-Brown Pine Trunk
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 4, y - 10, 8, 38);
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(x - 2, y - 8, 4, 34);

    // Multi-tiered umbrella pine needle canopies
    const pineTiers = [
      { yOff: -34, r: 24, c: '#14532d' },
      { yOff: -22, r: 28, c: '#166534' },
      { yOff: -10, r: 32, c: '#15803d' }
    ];

    for (let t of pineTiers) {
      ctx.fillStyle = t.c;
      ctx.beginPath();
      ctx.arc(x, y + t.yOff, t.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ========================================================
  // [주행 차로 & 방향 화살표] (ty: 26..35)
  // ========================================================
  drawDrivingAisles(mapW, mapH) {
    const ctx = this.ctx;
    ctx.save();

    const startX = 8.5 * 32;
    const laneY = 26 * 32;
    const laneW = mapW * 32 - startX;
    const laneH = (mapH - 26) * 32;

    // Solid white shoulder line
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(startX, laneY + 4, laneW, 3);
    ctx.fillRect(startX, laneY + laneH - 6, laneW, 3);

    // Yellow dashed center divider
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([16, 12]);
    ctx.beginPath();
    ctx.moveTo(startX, laneY + laneH * 0.5);
    ctx.lineTo(mapW * 32 - 120, laneY + laneH * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    // (바닥 글씨: 서문언덕길, 축구장방면, 20 삭제 완료 - 깨끗한 아스팔트 주행 차로)

    ctx.restore();
  }

  // 🛡️ Security / Parking Control Booth
  drawHighResSecurityBooth(x, y) {
    const ctx = this.ctx;
    ctx.save();

    const w = 4 * 32;
    const h = 3.4 * 32;

    // Booth building base
    ctx.fillStyle = '#334155';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#991b1b'; // red roof canopy
    ctx.fillRect(x - 4, y - 6, w + 8, 8);

    // Large glass observation window
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.fillRect(x + 8, y + 10, w - 16, 26);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 8, y + 10, w - 16, 26);

    // Guard silhouette & console
    ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
    ctx.fillRect(x + 12, y + 14, w - 24, 20);

    // Boom barrier housing
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x - 12, y + h - 22, 10, 22);

    // Flashing beacon
    const now = Date.now();
    const flashAlpha = 0.5 + Math.sin(now / 150) * 0.45;
    ctx.fillStyle = 'rgba(239, 68, 68, ' + flashAlpha + ')';
    ctx.beginPath();
    ctx.arc(x - 7, y + h - 26, 4, 0, Math.PI * 2);
    ctx.fill();

    // Horizontal barrier arm
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 44, y + h - 14, 32, 4);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x - 38, y + h - 14, 6, 4);
    ctx.fillRect(x - 22, y + h - 14, 6, 4);

    this.drawSharpLabel(x + w / 2, y - 14, '🛡️ 주차 관리실 & 차단기', {
      bgColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: '#94a3b8',
      borderWidth: 1,
      textColor: '#f8fafc',
      fontSize: 10,
      paddingX: 8,
      height: 18
    });

    ctx.restore();
  }


  drawHighResTimeCapsule(cx, cy) {
    const ctx = this.ctx;
    ctx.save();

    const t = Date.now() / 1000;
    const pulse = Math.sin(t * 3) * 0.15 + 0.85;

    // Outer soft glow
    const glowGrad = ctx.createRadialGradient(cx, cy, 6, cx, cy, 28);
    glowGrad.addColorStop(0, 'rgba(245, 158, 11, ' + (0.4 * pulse) + ')');
    glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fill();

    // Shadow underneath
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 12, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Capsule Body (Horizontal Heavy Antique Brass Capsule)
    const capW = 28;
    const capH = 16;
    const rx = cx - capW / 2;
    const ry = cy - capH / 2 + 2;

    // Body Gradient
    const bodyGrad = ctx.createLinearGradient(rx, ry, rx, ry + capH);
    bodyGrad.addColorStop(0, '#fef08a');
    bodyGrad.addColorStop(0.3, '#d97706');
    bodyGrad.addColorStop(0.7, '#b45309');
    bodyGrad.addColorStop(1, '#78350f');

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rx, ry, capW, capH, [8, 8, 8, 8]);
    ctx.fill();
    ctx.stroke();

    // Metallic reinforcement steel straps & rivets
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(rx + 6, ry, 3, capH);
    ctx.fillRect(rx + capW - 9, ry, 3, capH);

    // Rivets
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(rx + 7.5, ry + 3, 1, 0, Math.PI * 2);
    ctx.arc(rx + 7.5, ry + capH - 3, 1, 0, Math.PI * 2);
    ctx.arc(rx + capW - 7.5, ry + 3, 1, 0, Math.PI * 2);
    ctx.arc(rx + capW - 7.5, ry + capH - 3, 1, 0, Math.PI * 2);
    ctx.fill();

    // Center Padlock & Plate
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Antique Dial Lock Shackle
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy - 3, 3.5, Math.PI, 0, false);
    ctx.stroke();

    // Dial Lock Golden Body
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx - 4, cy - 1, 8, 8, 2);
    ctx.fill();
    ctx.stroke();

    // 2004 Inscribed year text
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('2004', cx, ry - 3);

    // Sparkles
    const spX = cx + Math.cos(t * 2) * 12;
    const spY = cy + Math.sin(t * 2) * 7;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(spX, spY, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawHighResCapsuleNote(cx, cy, index, name) {
    const ctx = this.ctx;
    ctx.save();

    const t = Date.now() / 1000;
    const bob = Math.sin(t * 2.5 + index * 1.2) * 2;
    const drawY = cy + bob;

    // Small shadow on bleacher wood
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Note paper background (Antique folded parchment)
    const pW = 18;
    const pH = 20;
    const px = cx - pW / 2;
    const py = drawY - pH / 2;

    const paperGrad = ctx.createLinearGradient(px, py, px + pW, py + pH);
    paperGrad.addColorStop(0, '#fef9c3');
    paperGrad.addColorStop(0.7, '#fef08a');
    paperGrad.addColorStop(1, '#fde047');

    ctx.fillStyle = paperGrad;
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(px, py, pW, pH, 3);
    ctx.fill();
    ctx.stroke();

    // Dog-eared corner fold
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.moveTo(px + pW - 5, py);
    ctx.lineTo(px + pW, py + 5);
    ctx.lineTo(px + pW - 5, py + 5);
    ctx.closePath();
    ctx.fill();

    // Clue Index Badge (1, 2, 3, 4)
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#b45309';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('#' + index, cx, drawY - 2);

    // Decorative clue lines
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 4, drawY + 4);
    ctx.lineTo(px + pW - 4, drawY + 4);
    ctx.moveTo(px + 4, drawY + 7);
    ctx.lineTo(px + pW - 6, drawY + 7);
    ctx.stroke();

    // Sparkle
    const spX = cx + Math.sin(t * 3 + index) * 8;
    const spY = drawY - 9 + Math.cos(t * 3 + index) * 4;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(spX, spY, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 🏥 3층 보건실 & 🕊️ Wee클래스 전용 렌더러
  // =========================================================================

  // 보건실 바닥 타일: 청결하고 차분한 파스텔 민트/세이지 격자 세라믹
  drawHealthRoomFloorTile(tx, ty) {
    const isAlt = (tx + ty) % 2 === 0;
    this.ctx.fillStyle = isAlt ? '#ecfdf5' : '#f0fdf4';
    this.ctx.fillRect(tx * 32, ty * 32, 32, 32);

    this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(tx * 32, ty * 32, 32, 32);
  }

  // Wee클래스 바닥 타일: 포근하고 따뜻한 피치/허니 파켓 원목
  drawWeeRoomFloorTile(tx, ty) {
    const isAlt = (tx + ty) % 2 === 0;
    this.ctx.fillStyle = isAlt ? '#fef3c7' : '#fffbeb';
    this.ctx.fillRect(tx * 32, ty * 32, 32, 32);

    this.ctx.strokeStyle = 'rgba(217, 119, 6, 0.12)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(tx * 32, ty * 32, 32, 32);
  }

  // 🏥 3층 보건실 실내 전체 렌더링 (도서관 규격 20 x 20 독립공간)
  renderHealthRoom(cr) {
    const ctx = this.ctx;
    ctx.save();

    // 1. 중앙 힐링 민트 러너 & 보건 십자가 엠블럼 (x: 8.5~11.5, y: 5..17)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
    ctx.fillRect(8.5 * 32, 5 * 32, 3 * 32, 12 * 32);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(8.5 * 32, 5 * 32, 3 * 32, 12 * 32);

    // 중앙 바닥 그린 크로스 심볼 (Green Cross at cx: 10, cy: 10)
    const cx = 10 * 32;
    const cy = 10 * 32;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.fillRect(cx - 6, cy - 18, 12, 36);
    ctx.fillRect(cx - 18, cy - 6, 36, 12);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 6, cy - 18, 12, 36);
    ctx.strokeRect(cx - 18, cy - 6, 36, 12);

    // 2. 보건 선생님 진료 데스크 (x: 6, y: 6)
    this.drawHighResNurseDesk(6 * 32, 6 * 32);

    // 3. 회복 침대 2조 (x: 15, y: 6 / x: 15, y: 11)
    this.drawHighResHealthBed(15 * 32, 6 * 32, '🛏️ 회복 침대 1번', 1);
    this.drawHighResHealthBed(15 * 32, 11 * 32, '🛏️ 회복 침대 2번', 2);

    // 4. 응급 구급약 & 약초 캐비닛 (x: 10, y: 4)
    this.drawHighResMedicalCabinet(10 * 32, 4 * 32);

    // 5. 자동 신장·체중 측정기 (x: 3, y: 6)
    this.drawHighResHealthScale(3 * 32, 6 * 32);

    // 6. 한미 시력 검사표 (x: 3, y: 11)
    this.drawHighResEyeChart(3 * 32, 11 * 32);

    // 7. 실내 관엽 식물 (산세베리아 / 스파티필름)
    this.drawHighResHealthPlant(2 * 32, 4 * 32);
    this.drawHighResHealthPlant(17 * 32, 4 * 32);

    ctx.restore();
  }

  // 보건실 진료 데스크
  drawHighResNurseDesk(dx, dy) {
    const ctx = this.ctx;
    // 우드/화이트 메디컬 데스크
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(dx - 18, dy - 8, 48, 28);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(dx - 18, dy - 8, 48, 28);

    // 모니터 & 키보드
    ctx.fillStyle = '#334155';
    ctx.fillRect(dx - 12, dy - 6, 14, 10);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(dx - 10, dy - 4, 10, 6);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(dx - 12, dy + 6, 14, 4);

    // 청진기 (Stethoscope)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(dx + 12, dy - 1, 5, 0, Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(dx + 12, dy + 6, 3, 0, Math.PI * 2);
    ctx.fill();

    // 진료 차트 클립보드
    ctx.fillStyle = '#b45309';
    ctx.fillRect(dx + 18, dy - 4, 9, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(dx + 19, dy - 3, 7, 10);
  }

  // 보건실 회복 침대
  drawHighResHealthBed(bx, by, label, bedIdx) {
    const ctx = this.ctx;
    const now = Date.now();
    const bob = Math.sin((now + bedIdx * 300) / 250) * 1.5;

    // 침대 프레임 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(bx + 16, by + 32, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 우드 헤드보드
    ctx.fillStyle = '#78350f';
    ctx.fillRect(bx - 12, by - 12, 56, 10);

    // 침대 본체 프레임
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(bx - 10, by - 4, 52, 38);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx - 10, by - 4, 52, 38);

    // 푹신한 베개
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx - 6, by - 2, 44, 10);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx - 6, by - 2, 44, 10);

    // 포근한 민트색 이불 (Folded Mint Blanket)
    ctx.fillStyle = '#a7f3d0';
    ctx.fillRect(bx - 8, by + 10, 48, 22);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx - 8, by + 10, 48, 22);

    // 이불 위 귀여운 하트 스티치
    ctx.fillStyle = '#059669';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💚', bx + 16, by + 23);

    // 머리 위 떠다니는 회복 안내 뱃지
    this.drawSharpLabel(bx + 16, by - 22 + bob, label, {
      bgColor: 'rgba(6, 78, 59, 0.95)',
      borderColor: '#34d399',
      textColor: '#ecfdf5',
      fontSize: 10.5,
      paddingX: 8,
      height: 20
    });
  }

  // 응급 구급약 & 약초 캐비닛
  drawHighResMedicalCabinet(cx, cy) {
    const ctx = this.ctx;
    // 벽면 약장 캐비닛 본체
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(cx - 18, cy - 14, 36, 28);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 18, cy - 14, 36, 28);

    // 선반 2단
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy);
    ctx.lineTo(cx + 16, cy);
    ctx.stroke();

    // 상단: 적십자 마크
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx - 2, cy - 12, 4, 10);
    ctx.fillRect(cx - 5, cy - 9, 10, 4);

    // 하단: 형형색색 포션병 & 붕대
    ctx.fillStyle = '#ef4444'; // 빨간 물약
    ctx.fillRect(cx - 12, cy + 3, 5, 8);
    ctx.fillStyle = '#10b981'; // 허브 오일
    ctx.fillRect(cx - 4, cy + 2, 5, 9);
    ctx.fillStyle = '#38bdf8'; // 소독약
    ctx.fillRect(cx + 4, cy + 3, 5, 8);
    ctx.fillStyle = '#ffffff'; // 붕대 롤
    ctx.beginPath();
    ctx.arc(cx + 12, cy + 7, 4, 0, Math.PI * 2);
    ctx.fill();

    this.drawSharpLabel(cx, cy + 22, '💊 응급 구급약장', {
      bgColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: '#38bdf8',
      textColor: '#ffffff',
      fontSize: 10,
      paddingX: 6,
      height: 18
    });
  }

  // 자동 신장·체중 측정기
  drawHighResHealthScale(sx, sy) {
    const ctx = this.ctx;
    // 발판
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(sx - 12, sy + 14, 24, 8);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx - 12, sy + 14, 24, 8);

    // 발바닥 모양
    ctx.fillStyle = '#334155';
    ctx.fillRect(sx - 8, sy + 16, 5, 4);
    ctx.fillRect(sx + 3, sy + 16, 5, 4);

    // 측정 바 (Height Ruler)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(sx - 2, sy - 18, 4, 32);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx - 2, sy - 18, 4, 32);

    // 디지털 LCD 화면
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(sx - 8, sy - 8, 16, 8);
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('172.5', sx, sy - 2);

    // 머리 접촉 바
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(sx - 8, sy - 18, 16, 3);
  }

  // 한미 시력 검사표
  drawHighResEyeChart(ex, ey) {
    const ctx = this.ctx;
    // 화이트 보드
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ex - 10, ey - 18, 20, 36);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ex - 10, ey - 18, 20, 36);

    // 0.1 ~ 2.0 시력 검사 문자들 (E 글자 크기별)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('E', ex, ey - 9);

    ctx.font = 'bold 6.5px sans-serif';
    ctx.fillText('Ǝ  E', ex, ey - 2);

    ctx.font = 'bold 4.5px sans-serif';
    ctx.fillText('E  m  Ǝ', ex, ey + 4);

    // 적/녹 시력 판별 라인
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(ex - 8, ey + 9, 7, 2);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(ex + 1, ey + 9, 7, 2);
  }

  // 실내 힐링 화분
  drawHighResHealthPlant(px, py) {
    const ctx = this.ctx;
    // 화분
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(px + 4, py + 12);
    ctx.lineTo(px + 28, py + 12);
    ctx.lineTo(px + 24, py + 26);
    ctx.lineTo(px + 8, py + 26);
    ctx.closePath();
    ctx.fill();

    // 싱싱한 잎사귀
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.ellipse(px + 16, py + 6, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.ellipse(px + 12, py + 4, 8, 12, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 🕊️ 3층 Wee클래스 실내 전체 렌더링 (도서관 규격 20 x 20 독립공간)
  renderWeeClassRoom(cr) {
    const ctx = this.ctx;
    ctx.save();

    // 1. 포근한 라벤더 & 피치 원형 카페트 2개
    // 상담석 라벤더 카펫 (x: 6, y: 6)
    ctx.fillStyle = 'rgba(167, 139, 250, 0.22)';
    ctx.beginPath();
    ctx.ellipse(6 * 32 + 6, 7 * 32, 46, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 힐링 라운지 피치 카펫 (x: 15, y: 9)
    ctx.fillStyle = 'rgba(251, 146, 60, 0.22)';
    ctx.beginPath();
    ctx.ellipse(15 * 32, 9 * 32 + 16, 54, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. 전문상담 선생님 상담 데스크 (x: 6, y: 6)
    this.drawHighResWeeDesk(6 * 32, 6 * 32);

    // 3. 토닥토닥 힐링 쿠션 & 빈백 라운지 (x: 15, y: 6)
    this.drawHighResWeeLounge(15 * 32, 6 * 32);

    // 4. 따뜻한 캐모마일 허브차 테이블 (x: 15, y: 11)
    this.drawHighResWeeTeaTable(15 * 32, 11 * 32);

    // 5. 익명 고민 & 따뜻한 응원 우체통 (x: 3, y: 6)
    this.drawHighResWeeMailbox(3 * 32, 6 * 32);

    // 6. 오늘 나의 감정 날씨판 (x: 3, y: 11)
    this.drawHighResEmotionBoard(3 * 32, 11 * 32);

    // 7. 실내 따뜻한 화분
    this.drawHighResHealthPlant(2 * 32, 4 * 32);
    this.drawHighResHealthPlant(17 * 32, 4 * 32);

    ctx.restore();
  }

  // Wee클래스 전문상담 데스크
  drawHighResWeeDesk(dx, dy) {
    const ctx = this.ctx;
    // 따뜻한 오크 원목 책상
    ctx.fillStyle = '#78350f';
    ctx.fillRect(dx - 18, dy - 8, 48, 28);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(dx - 16, dy - 6, 44, 24);

    // 상담 기록 일지 노란 노트
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(dx - 10, dy - 2, 12, 16);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.strokeRect(dx - 10, dy - 2, 12, 16);

    // 작은 다육이 화분
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(dx + 12, dy - 2, 8, 8);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(dx + 16, dy - 4, 5, 0, Math.PI * 2);
    ctx.fill();

    // 따뜻한 스탠드 조명
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(dx + 22, dy + 10, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 토닥토닥 힐링 쿠션 & 대형 빈백 라운지
  drawHighResWeeLounge(lx, ly) {
    const ctx = this.ctx;
    const now = Date.now();

    // 1. 대형 푹신한 오렌지/핑크 빈백 소파 (Beanbag)
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(lx - 12, ly + 4, 20, 16, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#db2777';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(lx + 14, ly + 6, 18, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. 귀여운 곰인형 (Teddy Bear Plushie)
    ctx.fillStyle = '#92400e';
    // 몸통
    ctx.beginPath();
    ctx.ellipse(lx, ly + 2, 9, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    // 머리
    ctx.beginPath();
    ctx.arc(lx, ly - 8, 8, 0, Math.PI * 2);
    ctx.fill();
    // 귀
    ctx.beginPath();
    ctx.arc(lx - 6, ly - 14, 3.5, 0, Math.PI * 2);
    ctx.arc(lx + 6, ly - 14, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // 눈과 코
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(lx - 3, ly - 9, 2, 2);
    ctx.fillRect(lx + 1, ly - 9, 2, 2);
    ctx.fillRect(lx - 1.5, ly - 6, 3, 2);
    // 빨간 리본
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(lx - 3, ly - 2, 6, 3);

    // 3. 은은하게 떠오르는 사랑 하트 이펙트 (Heart particles)
    const heartFloat = (now / 200) % 20;
    const heartAlpha = Math.max(0, 1 - heartFloat / 20);
    ctx.fillStyle = `rgba(244, 63, 94, ${heartAlpha})`;
    ctx.font = '12px sans-serif';
    ctx.fillText('💖', lx + 12, ly - 16 - heartFloat);

    this.drawSharpLabel(lx, ly - 26, '🧸 토닥토닥 힐링 라운지', {
      bgColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: '#f472b6',
      textColor: '#fdf2f8',
      fontSize: 10.5,
      paddingX: 8,
      height: 20
    });
  }

  // 따뜻한 캐모마일 허브차 테이블
  drawHighResWeeTeaTable(tx, ty) {
    const ctx = this.ctx;
    // 원형 티 테이블
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(tx, ty, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 레이스 테이블보
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tx, ty, 15, 0, Math.PI * 2);
    ctx.stroke();

    // 도자기 주전자 (Teapot)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(tx - 3, ty - 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 찻잔 2개 & 김 모락모락
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(tx + 6, ty - 4, 6, 5);
    ctx.fillRect(tx - 12, ty + 4, 6, 5);
    ctx.fillStyle = '#ca8a04'; // 향긋한 노란 차
    ctx.fillRect(tx + 7, ty - 3, 4, 2);
    ctx.fillRect(tx - 11, ty + 5, 4, 2);

    this.drawSharpLabel(tx, ty + 28, '🫖 따뜻한 허브차 테이블', {
      bgColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: '#f59e0b',
      textColor: '#ffffff',
      fontSize: 10,
      paddingX: 6,
      height: 18
    });
  }

  // 익명 고민 & 따뜻한 응원 우체통
  drawHighResWeeMailbox(mx, my) {
    const ctx = this.ctx;
    // 나무 기둥
    ctx.fillStyle = '#78350f';
    ctx.fillRect(mx - 3, my + 6, 6, 16);

    // 빨간 우체통 몸체
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(mx - 12, my - 16, 24, 22, [6, 6, 2, 2]);
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 편지 투입구
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(mx - 8, my - 10, 16, 3);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1;
    ctx.strokeRect(mx - 8, my - 10, 16, 3);

    // 하트 심볼
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💌', mx, my - 1);

    this.drawSharpLabel(mx, my - 24, '📬 마음 우체통', {
      bgColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: '#ef4444',
      textColor: '#ffffff',
      fontSize: 10,
      paddingX: 6,
      height: 18
    });
  }

  // 오늘 나의 감정 날씨판
  drawHighResEmotionBoard(bx, by) {
    const ctx = this.ctx;
    // 우드 프레임 코르크 게시판
    ctx.fillStyle = '#b45309';
    ctx.fillRect(bx - 12, by - 16, 24, 34);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(bx - 10, by - 14, 20, 30);

    // 4가지 날씨 뱃지 (☀️ ⛅ 🌧️ 🌈)
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☀️', bx - 4, by - 6);
    ctx.fillText('⛅', bx + 4, by - 6);
    ctx.fillText('🌧️', bx - 4, by + 4);
    ctx.fillText('🌈', bx + 4, by + 4);

    // 알록달록 포스트잇 메모들
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(bx - 6, by + 8, 4, 4);
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(bx + 2, by + 8, 4, 4);

    this.drawSharpLabel(bx, by - 24, '🌈 감정 날씨판', {
      bgColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: '#fbbf24',
      textColor: '#ffffff',
      fontSize: 10,
      paddingX: 6,
      height: 18
    });
  }

  // ========================================================
  // SCENE RENDERING: STUDENT CAFETERIA (학생 급식실)
  // 5대 구역: 조리실(좌측 상단), 급식배부대(좌측 하단), 급식지도석(하단 중앙좌측),
  //           학생급식좌석(중앙/상단 3열 세로 식탁, 칸막이X),
  //           교사급식실(우측 상단, 일반식탁, 커피머신X, 원목X),
  //           퇴식구/잔반(우측 하단), 출입구(하단 중앙우측)
  // ========================================================
  drawCafeteriaFloorTile(tx, ty) {
    const ctx = this.ctx;
    // 1. 조리실 구역 (tx: 1..10, ty: 3..14) - 위생 테라코타 논슬립 타일
    if (tx >= 1 && tx <= 10 && ty >= 3 && ty <= 14) {
      const isAlt = (tx + ty) % 2 === 0;
      ctx.fillStyle = isAlt ? '#7f1d1d' : '#991b1b';
      ctx.fillRect(tx * 32, ty * 32, 32, 32);
      ctx.strokeStyle = 'rgba(69, 10, 10, 0.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(tx * 32, ty * 32, 32, 32);
      return;
    }

    // 2. 출입구 논슬립 매트 (tx: 23..25, ty: 21..22)
    if (tx >= 23 && tx <= 25 && ty >= 21) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(tx * 32, ty * 32, 32, 32);
      ctx.fillStyle = '#334155';
      for (let ry = 2; ry < 32; ry += 6) {
        ctx.fillRect(tx * 32 + 2, ty * 32 + ry, 28, 2);
      }
      return;
    }

    // 3. 잔반 퇴식구 배수 발판 매트 (tx: 31..40, ty: 15..21)
    if (tx >= 31 && tx <= 40 && ty >= 15 && ty <= 21) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(tx * 32, ty * 32, 32, 32);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(tx * 32, ty * 32, 32, 32);
      ctx.fillStyle = '#1e293b';
      for (let ox = 8; ox < 32; ox += 12) {
        for (let oy = 8; oy < 32; oy += 12) {
          ctx.beginPath();
          ctx.arc(tx * 32 + ox, ty * 32 + oy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      return;
    }

    // 4. 일반 식당 및 교사식당 구역 - 밝고 청결한 테라조 유광 타일
    const isAlt = (tx + ty) % 2 === 0;
    ctx.fillStyle = isAlt ? '#f8fafc' : '#f1f5f9';
    ctx.fillRect(tx * 32, ty * 32, 32, 32);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(tx * 32, ty * 32, 32, 32);

    // 미세한 테라조 천연 골재 무늬
    ctx.fillStyle = 'rgba(148, 163, 184, 0.18)';
    ctx.fillRect(tx * 32 + 6, ty * 32 + 8, 2, 2);
    ctx.fillRect(tx * 32 + 22, ty * 32 + 14, 2, 1.5);
    ctx.fillRect(tx * 32 + 14, ty * 32 + 24, 1.5, 2);
  }

  checkCafeteriaCollision(tx, ty) {
    // 1. 조리실 외벽
    // 조리실 동쪽 벽 (tx: 11, ty: 3..14) - 출입문(ty: 8..9) 개방
    if (tx === 11 && ty >= 3 && ty <= 14) {
      if (ty >= 8 && ty <= 9) return false;
      return true;
    }
    // 조리실 남쪽 벽 (ty: 15, tx: 1..11) - 배식창/출입구(tx: 5..6) 개방
    if (ty === 15 && tx >= 1 && tx <= 11) {
      if (tx >= 5 && tx <= 6) return false;
      return true;
    }

    // 조리실 내부 조리기구
    // 대형 회전식 국솥 & 화구 레인지 (tx: 2..5, ty: 4..5)
    if (tx >= 2 && tx <= 5 && (ty === 4 || ty === 5)) return true;
    // 중앙 스테인리스 조리 작업대 (tx: 3..8, ty: 8..9)
    if (tx >= 3 && tx <= 8 && (ty === 8 || ty === 9)) return true;
    // 세척 싱크대 (tx: 2..4, ty: 12..13)
    if (tx >= 2 && tx <= 4 && (ty === 12 || ty === 13)) return true;

    // 2. 급식 배부대 라인 (tx: 2..10, ty: 16..17)
    if (tx >= 2 && tx <= 10 && (ty === 16 || ty === 17)) return true;

    // 3. 급식 지도석 / 영양사 책상 (tx: 13..15, ty: 18..19)
    if (tx >= 13 && tx <= 15 && (ty === 18 || ty === 19)) return true;

    // 4. 학생 급식 테이블 (세로로 긴 식탁 3열, tx: 14..15, 20..21, 26..27, ty: 5..14, 칸막이 없음)
    const isCol1 = (tx === 14 || tx === 15);
    const isCol2 = (tx === 20 || tx === 21);
    const isCol3 = (tx === 26 || tx === 27);
    if ((isCol1 || isCol2 || isCol3) && (ty >= 5 && ty <= 14)) {
      return true;
    }

    // 5. 교사 급식실 분리벽
    // 서쪽 벽 (tx: 31, ty: 3..13) - 출입문(ty: 8..9) 개방
    if (tx === 31 && ty >= 3 && ty <= 13) {
      if (ty >= 8 && ty <= 9) return false;
      return true;
    }
    // 남쪽 분리벽 (교사식당과 퇴식구 사이: ty: 14, tx: 31..40)
    if (ty === 14 && tx >= 31 && tx <= 40) return true;

    // 교사 급식실 식탁 (학생 식탁과 완전히 동일한 규격 - ty: 5..6 및 ty: 9..10)
    if (tx >= 33 && tx <= 38 && (ty === 5 || ty === 6)) return true;
    if (tx >= 33 && tx <= 38 && (ty === 9 || ty === 10)) return true;

    // 6. 퇴식구 구역
    // 서쪽 벽 (tx: 31, ty: 15..21) - 출입구(ty: 17..19) 개방
    if (tx === 31 && ty >= 15 && ty <= 21) {
      if (ty >= 17 && ty <= 19) return false;
      return true;
    }
    // 식판 반납 롤러 컨베이어 카운터 (tx: 33..38, ty: 16)
    if (tx >= 33 && tx <= 38 && ty === 16) return true;
    // 잔반 및 국물 수거통 (tx: 33..38, ty: 19)
    if (tx >= 33 && tx <= 38 && ty === 19) return true;

    return false;
  }

  renderCafeteria(cr) {
    const ctx = this.ctx;
    ctx.save();

    // 1. 🍳 조리실 (Kitchen Zone: 좌측 상단 tx: 1..10, ty: 3..14)
    this.drawCafeteriaKitchenZone();

    // 2. 🍱 급식 배부대 (Serving Counter Line: 좌측 하단 tx: 2..10, ty: 16..17)
    this.drawCafeteriaServingCounter();

    // 3. 📋 급식 지도석 / 영양사 책상 (하단 중앙좌측 tx: 13..15, ty: 18..19)
    this.drawCafeteriaNutritionistDesk();

    // 4. 🪑 학생 급식좌석 (Student Dining Tables: 중앙/상단 세로 식탁 3열, 칸막이 없이!)
    this.drawCafeteriaStudentDiningTables();

    // 5. 📋 교사 급식실 (Faculty Dining: 우측 상단 tx: 31..40, ty: 3..13, 커피머신X, 원목X, 동일식탁O)
    this.drawCafeteriaTeacherDining();

    // 6. 🥣 퇴식구 & 잔반버리는 곳 (Tray Return: 우측 하단 tx: 31..40, ty: 15..21)
    this.drawCafeteriaTrayReturn();

    // 7. 🚪 출입문 (Entrance Door: 하단 중앙우측 tx: 23..25, ty: 22)
    this.drawCafeteriaEntranceDoor();

    ctx.restore();
  }

  // 1. 조리실 구역 렌더링 (좌측 상단 tx: 1..10, ty: 3..14)
  drawCafeteriaKitchenZone() {
    const ctx = this.ctx;

    // 조리실 동쪽 벽 (tx: 11, ty: 3..14 / 출입문 ty: 8..9)
    ctx.fillStyle = '#475569';
    ctx.fillRect(11 * 32 + 20, 3 * 32, 12, 5 * 32); // ty: 3..8
    ctx.fillRect(11 * 32 + 20, 10 * 32, 12, 5 * 32); // ty: 10..15
    ctx.fillStyle = '#64748b';
    ctx.fillRect(11 * 32 + 18, 3 * 32, 2, 5 * 32);
    ctx.fillRect(11 * 32 + 18, 10 * 32, 2, 5 * 32);

    // 조리실 남쪽 벽 (ty: 15, tx: 1..11 / 배식 통로 tx: 5..6)
    ctx.fillStyle = '#475569';
    ctx.fillRect(1 * 32, 15 * 32, 4 * 32, 10);
    ctx.fillRect(7 * 32, 15 * 32, 4 * 32 + 20, 10);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(1 * 32, 15 * 32 + 10, 4 * 32, 3);
    ctx.fillRect(7 * 32, 15 * 32 + 10, 4 * 32 + 20, 3);

    // 대형 환기 후드 (tx: 2..8, ty: 3)
    ctx.fillStyle = '#334155';
    ctx.fillRect(2 * 32, 3 * 32, 6 * 32, 20);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(2 * 32 + 2, 3 * 32 + 2, 6 * 32 - 4, 4);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(2 * 32, 3 * 32, 6 * 32, 20);

    // 대형 회전식 국솥 & 상업용 가스레인지 (tx: 2..5, ty: 4..5)
    for (let cx = 2; cx <= 5; cx++) {
      const kx = cx * 32;
      const ky = 4.2 * 32;
      // 가스레인지 버너 베이스
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(kx + 2, ky, 28, 28);
      ctx.strokeStyle = '#64748b';
      ctx.strokeRect(kx + 2, ky, 28, 28);

      if (cx === 2 || cx === 4) {
        // 대형 스테인리스 회전식 국솥 (원형 솥 & 회전 밸브 핸들)
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(kx + 16, ky + 14, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(kx + 16, ky + 14, 4, 0, Math.PI * 2);
        ctx.fill();

        // 솥 회전 핸들
        ctx.fillStyle = '#334155';
        ctx.fillRect(kx + 1, ky + 12, 3, 4);
        ctx.fillRect(kx + 28, ky + 12, 3, 4);
      } else {
        // 고화력 삼발이 화구
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(kx + 16, ky + 14, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(kx + 16, ky + 14, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 중앙 대형 스테인리스 조리 작업대 (tx: 3..8, ty: 8..9)
    const px = 3.2 * 32;
    const py = 8.2 * 32;
    const pw = 5.6 * 32;
    const ph = 1.4 * 32;
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px, py, pw, ph);

    // 작업대 위 조리 도구 (원목 도마, 스테인리스 믹싱볼)
    ctx.fillStyle = '#d97706'; // 원목 도마
    ctx.fillRect(px + 14, py + 8, 26, 16);
    ctx.fillStyle = '#94a3b8'; // 믹싱볼
    ctx.beginPath();
    ctx.arc(px + 70, py + 18, 9, 0, Math.PI * 2);
    ctx.fill();

    // 2조 세척 싱크대 (tx: 2..4, ty: 12..13)
    const sx = 2 * 32;
    const sy = 12 * 32;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(sx, sy, 2.8 * 32, 1.8 * 32);
    ctx.fillStyle = '#475569';
    ctx.fillRect(sx + 4, sy + 6, 36, 42);
    ctx.fillRect(sx + 46, sy + 6, 36, 42);
    // 수전
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(sx + 41, sy + 2, 6, 8);

    // 조리실 명판
    this.drawSharpLabel(6 * 32, 3.5 * 32, '🍳 조리실 (Kitchen)', {
      bgColor: '#7f1d1d',
      borderColor: '#fca5a5',
      textColor: '#ffffff',
      fontSize: 10.5,
      paddingX: 7,
      height: 19
    });
  }

  // 2. 급식 배부대 구역 렌더링 (좌측 하단 tx: 2..10, ty: 16..17)
  drawCafeteriaServingCounter() {
    const ctx = this.ctx;
    const sx = 2 * 32;
    const sy = 16 * 32;
    const sw = 8.5 * 32;
    const sh = 1.5 * 32;

    // 온장 배식대 카운터 본체 (스테인리스 스틸)
    ctx.fillStyle = '#334155';
    ctx.fillRect(sx - 2, sy + 2, sw + 4, sh + 8);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx, sy, sw, sh);

    // 하단 식판 슬라이드 레일 (2줄 크롬 파이프)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(sx, sy + sh + 2, sw, 3);
    ctx.fillRect(sx, sy + sh + 7, sw, 3);

    // 배식 바트 5구 (밥, 국, 메인찬, 보조찬, 후식)
    const foodVats = [
      { name: '🍚 밥', color: '#f8fafc', sub: '#e2e8f0' },
      { name: '🍲 국', color: '#b45309', sub: '#d97706' },
      { name: '🥩 메인', color: '#7c2d12', sub: '#b91c1c' },
      { name: '🥗 반찬', color: '#15803d', sub: '#22c55e' },
      { name: '🍎 과일', color: '#dc2626', sub: '#f87171' }
    ];

    const startVx = sx + 2.2 * 32;
    foodVats.forEach((vat, idx) => {
      const vx = startVx + idx * 1.25 * 32;
      const vy = sy + 6;
      const vw = 34;
      const vh = 28;

      ctx.fillStyle = '#64748b';
      ctx.fillRect(vx - 1, vy - 1, vw + 2, vh + 2);
      ctx.fillStyle = vat.color;
      ctx.fillRect(vx, vy, vw, vh);
      ctx.fillStyle = vat.sub;
      ctx.fillRect(vx + 3, vy + 3, vw - 6, vh - 6);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 8.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(vat.name, vx + vw / 2, vy + 18);
    });

    // 시작 지점: 식판 스택 및 수저 보관함
    const tx = sx + 6;
    const ty = sy + 4;
    for (let s = 0; s < 3; s++) {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(tx + s * 2, ty + 10 - s * 3, 24, 18);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(tx + s * 2, ty + 10 - s * 3, 24, 18);
    }
    // 수저통
    ctx.fillStyle = '#475569';
    ctx.fillRect(tx + 32, ty + 2, 18, 24);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(tx + 34, ty + 5, 3, 18);
    ctx.fillRect(tx + 40, ty + 5, 2, 18);

    // 투명 비말 차단 글라스 쉴드 (Sneeze Guard)
    ctx.fillStyle = 'rgba(224, 242, 254, 0.4)';
    ctx.fillRect(sx, sy - 8, sw, 8);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy - 8, sw, 8);

    // 배부대 명판
    this.drawSharpLabel(sx + sw / 2, sy - 18, '🍱 급식 배부대 (Serving Line)', {
      bgColor: '#0369a1',
      borderColor: '#38bdf8',
      textColor: '#ffffff',
      fontSize: 10.5,
      paddingX: 7,
      height: 19
    });
  }

  // 3. 급식 지도석 / 영양사 책상 렌더링 (하단 중앙좌측 tx: 13..15, ty: 18..19)
  drawCafeteriaNutritionistDesk() {
    const ctx = this.ctx;
    // 중심축을 선생님 스프라이트 중심(px + 16 = 14 * 32 + 16 = 464)에 정확히 일치
    const centerX = 464;
    const dw = 80; // 2.5 타일 너비
    const dh = 40; // 1.25 타일 높이
    const dx = centerX - dw / 2; // 424
    const dy = 18.0 * 32; // 576 ~ 616

    // 책상 본체
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(dx + 2, dy + 4, dw, dh);
    ctx.fillStyle = '#334155';
    ctx.fillRect(dx, dy, dw, dh);
    ctx.fillStyle = '#475569';
    ctx.fillRect(dx + 2, dy + 2, dw - 4, dh - 4);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(dx, dy, dw, dh);

    // PC 모니터 (좌측)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(dx + 8, dy + 5, 22, 16);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(dx + 10, dy + 7, 18, 12);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(dx + 17, dy + 21, 4, 6); // 받침대
    ctx.fillRect(dx + 13, dy + 26, 12, 2);

    // 급식 점검 일지 & 식단표 클립보드 (우측)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(dx + 48, dy + 6, 20, 24);
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(dx + 50, dy + 8, 16, 20);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(dx + 52, dy + 11, 12, 2);
    ctx.fillRect(dx + 52, dy + 15, 12, 2);
    ctx.fillRect(dx + 52, dy + 19, 10, 2);

    // 교직원 회전 의자 (선생님 y: 19.3 의 몸통 중심 464, 638에 완벽 밀착)
    const chairY = 19.3 * 32 + 20; // 637.6
    ctx.fillStyle = '#334155'; // 5발 휠 베이스
    ctx.beginPath();
    ctx.arc(centerX, chairY, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b'; // 회전 시트 쿠션
    ctx.beginPath();
    ctx.arc(centerX, chairY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 지도석 명판 (책상 상단 여백)
    this.drawSharpLabel(centerX, dy - 12, '📋 급식 지도석', {
      bgColor: '#0f766e',
      borderColor: '#2dd4bf',
      textColor: '#ffffff',
      fontSize: 10,
      paddingX: 6,
      height: 18
    });
  }

  // 4. 학생 급식좌석 렌더링 (세로로 긴 식탁 3열, 칸막이 없이!)
  drawCafeteriaStudentDiningTables() {
    const ctx = this.ctx;
    const colStarts = [14, 20, 26];

    colStarts.forEach((cx, colIdx) => {
      const tx = cx * 32;
      const ty = 5.2 * 32;
      const tw = 1.8 * 32;
      const th = 9.2 * 32;

      // 세로 식탁 양옆 부착형 원형 의자 (좌우 각 6개 = 12인석)
      for (let s = 0; s < 6; s++) {
        const sy = ty + 18 + s * 45;

        // 좌측 부착형 원형 의자
        ctx.fillStyle = '#64748b';
        ctx.fillRect(tx - 12, sy - 2, 12, 4); // 연결 파이프
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(tx - 12, sy, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 우측 부착형 원형 의자
        ctx.fillStyle = '#64748b';
        ctx.fillRect(tx + tw, sy - 2, 12, 4); // 연결 파이프
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(tx + tw + 12, sy, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 세로로 긴 스테인리스 식탁 본체 (칸막이 없는 깨끗한 평면!)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(tx + 2, ty + 4, tw, th);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(tx, ty, tw, th);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(tx + 2, ty + 2, tw - 4, th - 4);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(tx, ty, tw, th);

      // 식탁 위 사실적인 식판과 우유팩 장식
      for (let s = 0; s < 6; s += 2) {
        const trayY = ty + 14 + s * 45;
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(tx + 8, trayY, 32, 18);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx + 8, trayY, 32, 18);

        // 우유팩
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(tx + 12, trayY + 22, 8, 10);
      }
    });

    // 학생 식당 안내 명판 (중앙 상단)
    this.drawSharpLabel(21 * 32, 4.2 * 32, '🍽️ 학생 급식좌석 (Dining Hall)', {
      bgColor: '#1e3a8a',
      borderColor: '#60a5fa',
      textColor: '#ffffff',
      fontSize: 11,
      paddingX: 8,
      height: 20
    });
  }

  // 5. 교사 급식실 렌더링 (커피머신 제거, 원목테이블 대신 학생과 똑같은 식탁 적용!)
  drawCafeteriaTeacherDining() {
    const ctx = this.ctx;

    // 서쪽 분리벽 (tx: 31, ty: 3..13 / 출입문 ty: 8..9)
    ctx.fillStyle = '#475569';
    ctx.fillRect(31 * 32 + 20, 3 * 32, 12, 5 * 32); // ty: 3..8
    ctx.fillRect(31 * 32 + 20, 10 * 32, 12, 4 * 32); // ty: 10..14
    ctx.fillStyle = '#64748b';
    ctx.fillRect(31 * 32 + 18, 3 * 32, 2, 5 * 32);
    ctx.fillRect(31 * 32 + 18, 10 * 32, 2, 4 * 32);

    // 남쪽 분리벽 (교사식당과 퇴식구 사이: ty: 14, tx: 31..40)
    ctx.fillStyle = '#475569';
    ctx.fillRect(31 * 32 + 20, 14 * 32, 9 * 32 + 12, 10);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(31 * 32 + 20, 14 * 32 + 10, 9 * 32 + 12, 2);

    // 교사 식탁 2개 (원목 대신 학생 식탁과 완전히 동일한 규격의 스테인리스 식탁!)
    const teacherRows = [5.4, 9.8];
    teacherRows.forEach((tyRow) => {
      const tx = 33.5 * 32;
      const ty = tyRow * 32;
      const tw = 5.5 * 32;
      const th = 1.35 * 32;

      // 상/하단 원형 의자
      for (let s = 0; s < 4; s++) {
        const sx = tx + 18 + s * 40;
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(sx, ty - 6, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(sx, ty + th + 6, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.stroke();
      }

      // 학생 식당과 동일한 스테인리스 식탁 (칸막이 없음)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(tx + 2, ty + 4, tw, th);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(tx, ty, tw, th);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(tx + 2, ty + 2, tw - 4, th - 4);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(tx, ty, tw, th);
    });

    // 교사 급식실 명판
    this.drawSharpLabel(36.2 * 32, 3.8 * 32, '📋 교사 급식실', {
      bgColor: '#1e3a8a',
      borderColor: '#fbbf24',
      textColor: '#fef08a',
      fontSize: 10.5,
      paddingX: 7,
      height: 19
    });
  }

  // 6. 퇴식구 & 잔반버리는 곳 렌더링 (우측 하단 tx: 31..40, ty: 15..21)
  drawCafeteriaTrayReturn() {
    const ctx = this.ctx;
    const rx = 33 * 32;
    const ry = 16 * 32;

    // 서쪽 분리벽 (tx: 31, ty: 15..21 / 출입구 ty: 17..19)
    ctx.fillStyle = '#475569';
    ctx.fillRect(31 * 32 + 20, 14 * 32 + 10, 12, 3 * 32 - 10); // ty: 14..17
    ctx.fillRect(31 * 32 + 20, 20 * 32, 12, 2 * 32); // ty: 20..22
    ctx.fillStyle = '#64748b';
    ctx.fillRect(31 * 32 + 18, 14 * 32 + 10, 2, 3 * 32 - 10);
    ctx.fillRect(31 * 32 + 18, 20 * 32, 2, 2 * 32);

    // 안전 경고 구역 빗금 테두리 (노랑/검정)
    ctx.fillStyle = '#eab308';
    ctx.fillRect(rx - 6, ry - 6, 6.5 * 32, 4.5 * 32);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(rx - 2, ry - 2, 6.5 * 32 - 8, 4.5 * 32 - 8);

    // 퇴식 롤러 컨베이어 선반 (tx: 33..38, ty: 16)
    ctx.fillStyle = '#334155';
    ctx.fillRect(rx, ry, 5.8 * 32, 24);
    ctx.fillStyle = '#94a3b8';
    for (let lx = 6; lx < 5.8 * 32 - 6; lx += 12) {
      ctx.fillRect(rx + lx, ry + 3, 5, 18);
    }

    // 잔반 수거통 (초록 음식물통, 파랑 국물 버리는 통, 회색 수저 침적통)
    const by = ry + 42;
    // 1. 잔반 수거통 (Green)
    const gbx = rx + 10;
    ctx.fillStyle = '#166534';
    ctx.fillRect(gbx, by, 38, 44);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(gbx + 2, by + 2, 34, 8); // 뚜껑
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('잔반', gbx + 19, by + 30);

    // 2. 국물 분리통 (Blue)
    const bbx = rx + 62;
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(bbx, by, 38, 44);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(bbx + 2, by + 2, 34, 8); // 뚜껑
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('국물', bbx + 19, by + 30);

    // 3. 수저 침적통 (Gray)
    const sbx = rx + 114;
    ctx.fillStyle = '#475569';
    ctx.fillRect(sbx, by + 6, 42, 38);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(sbx + 2, by + 8, 38, 6);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('수저', sbx + 21, by + 28);

    // 퇴식구 명판
    this.drawSharpLabel(rx + 2.8 * 32, ry - 14, '🥣 퇴식구 & 잔반 버리는 곳', {
      bgColor: '#713f12',
      borderColor: '#facc15',
      textColor: '#ffffff',
      fontSize: 10,
      paddingX: 7,
      height: 19
    });
  }

  // 7. 출입문 바닥 프레임 (하단 중앙우측 tx: 23..25, ty: 22)
  drawCafeteriaEntranceDoor() {
    const ctx = this.ctx;
    const dx = 24 * 32;
    const dy = 22 * 32;

    // 출입구 유리문 바닥 프레임
    ctx.fillStyle = '#334155';
    ctx.fillRect(dx - 32, dy, 3 * 32, 14);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(dx - 28, dy + 2, 1.4 * 32, 10);
    ctx.fillRect(dx + 4, dy + 2, 1.4 * 32, 10);
  }
}

if (typeof window !== 'undefined') window.GameEngine = GameEngine;
if (typeof globalThis !== 'undefined') globalThis.GameEngine = GameEngine;
