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

  setDashing(isDashing) {
    if (this.player.isTeacher) {
      this.player.isDashing = isDashing;
      this.player.speed = isDashing ? 7.6 : 4.0; // 교사: 기본 이동속도 4.0, Shift 누르면 7.6
      return;
    }
    const isSpeedJob = (window.MainApp && window.MainApp.playerData && (window.MainApp.playerData.job === 'engineer' || window.MainApp.playerData.job === 'runner'));
    const runnerMult = isSpeedJob ? 1.15 : 1.0;

    // 초록 물약 버프: 1분간 질주 속도 10% 증가
    const hasSpeedBuff = !!(window.MainApp && window.MainApp.isBuffActive && window.MainApp.isBuffActive('speed_boost'));
    const speedBuffMult = hasSpeedBuff ? 1.10 : 1.0;

    if (!this.player.hasRunningShoes) {
      this.player.isDashing = false;
      this.player.speed = 3.8 * runnerMult;
      return;
    }
    this.player.isDashing = isDashing;
    // 신발 종류 확인: 날렵한 가죽 농구화 착용 시 실내화(4.37, +15%)보다 소폭 빠른 고속 질주(4.75, +25%) 적용
    const equippedShoes = window.MainApp && window.MainApp.playerData && window.MainApp.playerData.equipment && window.MainApp.playerData.equipment.shoes;
    const isBasketballShoes = !!(equippedShoes && (equippedShoes.item === 'equip_leather_shoes'));
    const dashSpeed = (isBasketballShoes ? 4.75 : 4.37) * speedBuffMult;
    this.player.speed = (isDashing ? dashSpeed : 3.8) * runnerMult;
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
    const isBrawlStunned = !!(window.BrawlBall && Date.now() < window.BrawlBall.stunnedUntil);
    const isBrawlKickoffWait = !!(window.BrawlBall && window.BrawlBall.match && window.BrawlBall.myTeam && window.BrawlBall.kickoffUntil && Date.now() < window.BrawlBall.kickoffUntil);
    const isMovementLocked = !!(this.player.isFallen || isBrawlStunned || isBrawlKickoffWait);
    if (this.player.isFallen || isBrawlStunned) {
      this.keys.up = false;
      this.keys.down = false;
      this.keys.left = false;
      this.keys.right = false;
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

    // 3v3 Brawl Ball Logic Update
    if (window.BrawlBall) {
      window.BrawlBall.update(0.016);
    }

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
    if (this.player && this.player.room === 'hallway') {
      return WORLD_DATA.HALLWAY_WIDTH || 60;
    }
    if (this.player && this.player.room === 'room_staff_office') {
      return WORLD_DATA.STAFF_OFFICE_WIDTH || 90;
    }
    if (this.player && this.player.room === 'room_career') {
      return WORLD_DATA.CAREER_WIDTH || 60;
    }
    return WORLD_DATA.MAP_WIDTH || 30;
  }

  getMapHeight() {
    if (this.player && this.player.room === 'playground') {
      return WORLD_DATA.PLAYGROUND_HEIGHT || 28;
    }
    if (this.player && this.player.room === 'room_staff_office') {
      return WORLD_DATA.STAFF_OFFICE_HEIGHT || 26;
    }
    return WORLD_DATA.MAP_HEIGHT || 20;
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
    // Active Brawl Ball match boundaries & crates apply even when Teacher Noclip is enabled
    if (this.player.room === 'playground' && window.BrawlBall && window.BrawlBall.match && window.BrawlBall.myTeam) {
      if (window.BrawlBall.isCollisionBlocked(this.player.x, this.player.y, x, y)) return true;
    }

    // Teacher Noclip (공간돌파 무적 벽통과)
    if (this.player.noclip) return false;

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

    if (this.player.room === 'hallway') {
      if (tileY >= curMapHeight - 1) return true;
      // Top wall boundary except doors
      if (tileY <= 4) {
        const floorData = WORLD_DATA.floors[this.player.floor];
        if (floorData) {
          const isDoor = floorData.rooms.some(r => ((r.id === "room_career" || r.id === "room_staff_office") ? (tileX >= r.doorX - 1 && tileX <= r.doorX + 2) : r.doorX === tileX) && r.doorY === tileY);
          if (!isDoor) return true;
        }
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
        if (this.isStaffOfficeWall(tileX, tileY)) return true;
        return false;
      }

      // Exit Door area is ALWAYS passable
      if (Math.abs(tileX - cr.exitDoor.x) <= 1 && tileY >= cr.exitDoor.y) {
        return false;
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
    if (this.player.room === 'room_history' && WORLD_DATA.classroom_history) return WORLD_DATA.classroom_history;
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
    } else if (this.player.room === 'playground' || (this.player.room && this.player.room.startsWith('playground_'))) {
      // 운동장 내부: 출구 도어 워프 없음 (축구장/농구장/풋살장 전 구역 자유 보행 가능)
      return;
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
        if (Math.abs(tileX - exit.x) <= 1 && tileY >= exit.y) {
          this.triggerFadeWarp(() => {
            this.exitClassroom();
          });
        }
      } else {
        const cr = this.getCurrentClassroomData();
        const exit = (cr && cr.exitDoor) || WORLD_DATA.classroom.exitDoor;
        if (Math.abs(tileX - exit.x) <= 1 && tileY >= exit.y) {
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
    if (this.player.room === 'room_history') {
      this._lastHistoryHallExitTime = Date.now() + 1500;
      this.warpToRoom('playground', '숭실 운동장', 87 * 32, 51 * 32);
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
    else if (roomId === 'room_career') this.player.floor = 5;
    else if (roomId === 'room_staff_office') this.player.floor = 6;
    else if (roomId === 'room_history') this.player.floor = 0;
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
      } else if (room === 'playground') {
        this.player.room = 'playground';
        this.player.roomName = '숭실 운동장';
        this.player.x = 80 * 32;
        this.player.y = 5 * 32;
      } else if (room === 'hallway') {
        this.player.room = 'hallway';
        this.player.x = 15 * 32;
        this.player.y = 10 * 32;
        this.player.roomName = WORLD_DATA.floors[this.player.floor] ? WORLD_DATA.floors[this.player.floor].name : `${this.player.floor}층 복도`;
      } else if (room === 'room_career') {
        this.player.floor = 5;
        this.player.room = 'room_career';
        this.player.x = 30 * 32;
        this.player.y = 15 * 32;
        this.player.roomName = '🌟 진로실 (Career Center)';
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
      else if (this.player.room === 'room_history') this.player.floor = 0;
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
    let minDist = 56;

    if (this.player.room === 'hallway') {
      const floorData = WORLD_DATA.floors[this.player.floor];
      if (floorData) {
        // NPCs
        if (floorData.npcs) {
          for (const npc of floorData.npcs) {
            const dist = Math.hypot(npc.x * 32 - this.player.x, npc.y * 32 - this.player.y);
            if (dist < minDist) {
              closest = { type: 'npc', data: npc, name: npc.name, prompt: `대화하기 (${npc.name})` };
              minDist = dist;
            }
          }
        }
        // Objects
        if (floorData.interactive) {
          for (const obj of floorData.interactive) {
            const dist = Math.hypot(obj.x * 32 - this.player.x, obj.y * 32 - this.player.y);
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
        // School Mascot Puppy (숭실이 - 조작법 가이드)
        if (this.mascots) {
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
          if (bDist < 72 && bDist < minDist) {
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
            ? window.MainApp.getTeacherQuestStatus(npc.id || npc.questId)
            : null;
          let prompt = `대화하기 (${npc.name})`;
          if (qStatus === 'available') {
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
      if ((this.player.room === 'room_career' || this.player.room === 'room_staff_office') && cr.interactive) {
        for (const item of cr.interactive) {
          if (item.type === 'quest_memo') {
            if (window.MainApp && typeof window.MainApp.isQuestMemoCollected === 'function' && window.MainApp.isQuestMemoCollected()) {
              continue;
            }
          }
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
        const isRaidActive = !!(window.BOSS_CONFIG && window.BOSS_CONFIG.active);
        if (isRaidActive) {
          const bossDist = Math.hypot(cr.boss.x * 32 - this.player.x, cr.boss.y * 32 - this.player.y);
          if (bossDist < 96) {
            const bossObj = {
              ...cr.boss,
              name: window.BOSS_CONFIG.name || cr.boss.name,
              maxHp: window.BOSS_CONFIG.maxHp || cr.boss.maxHp,
              atk: window.BOSS_CONFIG.atk || cr.boss.atk,
              def: window.BOSS_CONFIG.def || cr.boss.def
            };
            closest = { type: 'boss_raid', data: bossObj, name: bossObj.name, prompt: bossObj.prompt || '보스 레이드' };
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
        closest = { type: 'exit', name: '복도 출구', prompt: '복도로 나가기 (SPACE)' };
        minDist = exitDist;
      }
    }

    this.activeInteractable = closest;
    const promptEl = document.getElementById('interaction-prompt');
    const promptText = document.getElementById('prompt-text');
    if (closest) {
      promptEl.classList.remove('hidden');
      promptText.innerText = closest.prompt || '조사하기';
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
        if (soccerBossObj && Math.hypot(soccerBossObj.x * 32 - x, (soccerBossObj.y + 0.5) * 32 - y) < 64) {
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
            if (Math.hypot((item.x + 0.5) * 32 - x, (item.y + 0.5) * 32 - y) < 48) {
              return { type: item.type, data: item, name: item.name };
            }
          }
        }
      }
      if ((this.player.room === 'room_career' || this.player.room === 'room_staff_office') && cr.interactive) {
        for (const item of cr.interactive) {
          if (item.type === 'quest_memo') {
            if (window.MainApp && typeof window.MainApp.isQuestMemoCollected === 'function' && window.MainApp.isQuestMemoCollected()) {
              continue;
            }
          }
          if (Math.hypot((item.x + 0.5) * 32 - x, (item.y + 0.5) * 32 - y) < 48) {
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
        const isRaidActive = !!(window.BOSS_CONFIG && window.BOSS_CONFIG.active);
        if (isRaidActive && Math.hypot(cr.boss.x * 32 - x, cr.boss.y * 32 - y) < 76) {
          const bossObj = {
            ...cr.boss,
            name: window.BOSS_CONFIG.name || cr.boss.name,
            maxHp: window.BOSS_CONFIG.maxHp || cr.boss.maxHp,
            atk: window.BOSS_CONFIG.atk || cr.boss.atk,
            def: window.BOSS_CONFIG.def || cr.boss.def
          };
          return { type: 'boss_raid', data: bossObj, name: bossObj.name };
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

    // Render Local Player
    this.renderPlayer(this.player, true);

    // Render deferred World, NPC, Material, and Guidance Labels ON TOP of characters!
    if (this.deferredWorldLabels && this.deferredWorldLabels.length > 0) {
      const activeName = (this.activeInteractable && this.activeInteractable.name) ? this.activeInteractable.name : null;
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

    // 1. Zone Carpets / Mats
    // Clue 1: Aptitude PC (x: 10, y: 7) - Cyan carpet
    this.ctx.fillStyle = 'rgba(6, 182, 212, 0.16)';
    this.ctx.fillRect(8.5 * 32, 5.8 * 32, 3.5 * 32, 2.8 * 32);
    this.ctx.strokeStyle = '#0891b2';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(8.5 * 32, 5.8 * 32, 3.5 * 32, 2.8 * 32);

    // Clue 2: Science Lab (x: 20, y: 7) - Emerald carpet
    this.ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
    this.ctx.fillRect(18.5 * 32, 5.8 * 32, 3.5 * 32, 2.8 * 32);
    this.ctx.strokeStyle = '#059669';
    this.ctx.strokeRect(18.5 * 32, 5.8 * 32, 3.5 * 32, 2.8 * 32);

    // Clue 3: IT Coding Desk (x: 15, y: 12) - Violet carpet
    this.ctx.fillStyle = 'rgba(139, 92, 246, 0.16)';
    this.ctx.fillRect(13.5 * 32, 10.8 * 32, 3.5 * 32, 2.8 * 32);
    this.ctx.strokeStyle = '#7c3aed';
    this.ctx.strokeRect(13.5 * 32, 10.8 * 32, 3.5 * 32, 2.8 * 32);

    // Clue 4: Art Easel (x: 40, y: 12) - Amber carpet
    this.ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
    this.ctx.fillRect(38.5 * 32, 10.8 * 32, 3.5 * 32, 2.8 * 32);
    this.ctx.strokeStyle = '#d97706';
    this.ctx.strokeRect(38.5 * 32, 10.8 * 32, 3.5 * 32, 2.8 * 32);

    // Clue 5: Mentoring Desk (x: 45, y: 7) - Blue carpet
    this.ctx.fillStyle = 'rgba(59, 130, 246, 0.16)';
    this.ctx.fillRect(43.5 * 32, 5.8 * 32, 3.5 * 32, 2.8 * 32);
    this.ctx.strokeStyle = '#2563eb';
    this.ctx.strokeRect(43.5 * 32, 5.8 * 32, 3.5 * 32, 2.8 * 32);

    // Clue 6: Astronomy Lab (x: 52, y: 7) - Indigo carpet
    this.ctx.fillStyle = 'rgba(99, 102, 241, 0.16)';
    this.ctx.fillRect(50.5 * 32, 5.8 * 32, 3.5 * 32, 2.8 * 32);
    this.ctx.strokeStyle = '#4f46e5';
    this.ctx.strokeRect(50.5 * 32, 5.8 * 32, 3.5 * 32, 2.8 * 32);

    // Central Exit Carpet Runner at Doorlock (x: 28.5 ~ 31.5, y: 5.2 ~ 7.0)
    this.ctx.fillStyle = hasEscaped ? 'rgba(34, 197, 94, 0.22)' : 'rgba(239, 68, 68, 0.22)';
    this.ctx.fillRect(28.5 * 32, 5.2 * 32, 3 * 32, 1.8 * 32);
    this.ctx.strokeStyle = hasEscaped ? '#22c55e' : '#ef4444';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(28.5 * 32, 5.2 * 32, 3 * 32, 1.8 * 32);

    // 2. Draw Station 1: 🏥 Aptitude PC (x: 10, y: 7)
    this.drawCareerStationPC(10 * 32, 7 * 32);
    this.drawCareerClueLabel(10 * 32 + 16, 7 * 32 - 18, 1, '적성검사 PC', 'D', clues[0]);

    // 3. Draw Station 2: 🔬 Science Lab (x: 20, y: 7)
    this.drawCareerStationLab(20 * 32, 7 * 32);
    this.drawCareerClueLabel(20 * 32 + 16, 7 * 32 - 18, 2, '과학 연구대', 'R', clues[1]);

    // 4. Draw Station 3: 💻 Engineering / IT Desk (x: 15, y: 12)
    this.drawCareerStationTech(15 * 32, 12 * 32);
    this.drawCareerClueLabel(15 * 32 + 16, 12 * 32 - 18, 3, '공학 작업대', 'E', clues[2]);

    // 5. Draw Station 4: 🎨 Art Easel (x: 40, y: 12)
    this.drawCareerStationArt(40 * 32, 12 * 32);
    this.drawCareerClueLabel(40 * 32 + 16, 12 * 32 - 18, 4, '예술 이젤', 'A', clues[3]);

    // 6. Draw Station 5: 🤝 Mentoring Desk (x: 45, y: 7)
    this.drawCareerStationMentor(45 * 32, 7 * 32);
    this.drawCareerClueLabel(45 * 32 + 16, 7 * 32 - 18, 5, '멘토링 데스크', 'M', clues[4]);

    // 7. Draw Station 6: 🔭 Astronomy Lab (x: 52, y: 7)
    this.drawCareerStationSpace(52 * 32, 7 * 32);
    this.drawCareerClueLabel(52 * 32 + 16, 7 * 32 - 18, 6, '우주 탐구관', 'S', clues[5]);

    // 8. Draw Decoy Clue Station 7: 💼 Vintage Briefcase (x: 23, y: 12)
    this.drawCareerStationDecoy(23 * 32, 12 * 32);
    this.drawCareerClueLabel(23 * 32 + 16, 12 * 32 - 18, 7, '골동품 서류가방', 'P', clues[6]);

    // 9. Draw Fallen Developer Note #2 (가장 왼쪽 아래편: x: 4, y: 16)
    this.drawHighResDevNote(4 * 32, 16 * 32, '📜 떨어진 개발자노트 (제2편)');

    // 10. Draw Digital Escape Keypad (x: 30, y: 6)
    this.drawCareerKeypadStation(30 * 32, 6 * 32, hasEscaped, solvedCount);

    // 9. Chalkboard Mission Header on the Top Wall (x: 30, y: 2)
    this.drawCareerBlackboardBanner(clues, solvedCount, hasEscaped);
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

    // Boss Nameplate (교사 이벤트 시작 여부에 따른 상태 표시)
    const isRaidActive = !!(window.BOSS_CONFIG && window.BOSS_CONFIG.active);
    const bName = isRaidActive ? (window.BOSS_CONFIG.name || boss.name) : (boss.name || '👾 가죽 골렘');
    const bMaxHp = isRaidActive ? (window.BOSS_CONFIG.maxHp || 2000) : (boss.maxHp || 2000);
    const bCurHp = isRaidActive ? (window.BOSS_CONFIG.currentHp ?? bMaxHp) : bMaxHp;
    const labelText = isRaidActive
      ? `🔥 ${bName} (HP ${bCurHp}/${bMaxHp})`
      : `⏳ [1차 관문 보스] ${bName} (HP ${bMaxHp})`;

    this.drawSharpLabel(px, py - 58, labelText, {
      bgColor: isRaidActive ? 'rgba(127, 29, 29, 0.96)' : 'rgba(30, 41, 59, 0.94)',
      borderColor: isRaidActive ? '#f87171' : '#94a3b8',
      textColor: isRaidActive ? '#fef08a' : '#e2e8f0',
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
      : `⏳ [2차 관문 보스] ${bName} (HP ${bMaxHp})`;

    this.drawSharpLabel(px, py - 66, labelText, {
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
      : `⏳ [축구장 보스] ${bName} (HP ${bMaxHp})`;

    this.drawSharpLabel(px, py - 66, labelText, {
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
      : `⏳ [최종보스] ${bName} (HP ${bMaxHp})`;

    this.drawSharpLabel(px, py - 72, labelText, {
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
    const windowCols = [3, 6, 14, 16, 24, 27, 33, 36, 42, 45, 50, 52];
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
    this.drawSharpLabel(15 * 32 + 16, 26, '🏫 교훈: 참과 사랑에 사는 사명인', {
      bgColor: '#1e1b4b',
      borderColor: '#f59e0b',
      textColor: '#fef08a',
      fontSize: 12.5,
      paddingX: 14,
      height: 22
    });

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
        } else if (this.player.room === 'room_staff_office') {
          this.drawStaffOfficeFloorTile(tx, ty);
        } else if (this.player.room === 'room_history') {
          this.drawHighResMarbleFloor(tx, ty);
        } else if (this.player.room === 'room_705') {
          this.drawHighResAlchemyFloor(tx, ty);
        } else {
          this.drawHighResWoodPlankFloor(tx, ty);
        }
      }
    }

    // 2. High-Res Classroom Blackboard & School Motto
    const isCareerRoom = (this.player.room === 'room_career');
    const isStaffOffice = (this.player.room === 'room_staff_office');
    const centerTileX = isStaffOffice ? 45 : (isCareerRoom ? 30 : 15);
    if (!isStaffOffice) {
      this.drawHighResBlackboard(cr, centerTileX);
    }

    // 3. Wall Clock above Blackboard (Center Top)
    this.drawHighResWallClock(centerTileX * 32, 16);

    // 4. Back Wall Student Lockers (Row of Lockers along Back Wall)
    if (isStaffOffice) {
      // 교무실: 학생용 사물함 대신 파티션 및 회의실 전용 인테리어 적용
    } else if (isCareerRoom) {
      this.drawHighResLockers(4, 17, 6);
      this.drawHighResLockers(50, 17, 6);
    } else if (this.player.room === 'room_history' || this.player.room === 'room_705') {
      // Museum and Alchemy Lab have custom atmospheric layouts without standard school lockers
    } else {
      this.drawHighResLockers(3, 17, 5);
      this.drawHighResLockers(22, 17, 5);
    }

    if (isBossRoom) {
      const isRaidActive = !!(window.BOSS_CONFIG && window.BOSS_CONFIG.active);
      if (isRaidActive) {
        // === 1학년 2반: 시즌1 보스 레이드 전용 연출 (진행 중) ===
        // Red Raid Carpet Runner from Door to Boss
        this.ctx.fillStyle = 'rgba(153, 27, 27, 0.45)';
        this.ctx.fillRect(13 * 32, 6 * 32, 4 * 32, 11 * 32);
        this.ctx.strokeStyle = '#f59e0b';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(13 * 32, 6 * 32, 4 * 32, 11 * 32);

        if (cr.boss) {
          const bName = ((window.BOSS_CONFIG.name || cr.boss.name || '').toLowerCase());
          const effectiveBoss = {
            ...cr.boss,
            name: window.BOSS_CONFIG.name || cr.boss.name,
            maxHp: window.BOSS_CONFIG.maxHp || cr.boss.maxHp,
            atk: window.BOSS_CONFIG.atk || cr.boss.atk,
            def: window.BOSS_CONFIG.def || cr.boss.def
          };

          if (bName.includes('골드') || bName.includes('드래곤') || bName.includes('dragon') || bName.includes('용')) {
            this.drawHighResBossDragon(effectiveBoss);
          } else if (bName.includes('대마왕') || bName.includes('중간고사') || bName.includes('demon') || bName.includes('마왕')) {
            this.drawHighResBossDemon(effectiveBoss);
          } else if (bName.includes('케르베로스') || bName.includes('수행평가') || bName.includes('cerberus')) {
            this.drawHighResBossCerberus(effectiveBoss);
          } else if (bName.includes('파멸신') || bName.includes('기말고사') || bName.includes('final')) {
            this.drawHighResBossFinalGod(effectiveBoss);
          } else if (bName.includes('나태') || bName.includes('거인') || bName.includes('sloth')) {
            this.drawHighResBossSlothTitan(effectiveBoss);
          } else {
            this.drawHighResBossGolem(effectiveBoss);
          }
        }
      } else {
        // 교사가 레이드 종료 버튼을 누르면 보스가 사라지고 대기 상태로 전환
        this.drawPeacefulBossChamber(cr);
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
    } else if (this.player.room === 'room_staff_office') {
      this.renderStaffOffice(cr);
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

    // 8-C. Classroom NPCs (e.g. 1학년 3반 김영훈 선생님, 1학년 5반 졍경슉 선생님)
    if (cr.npcs && cr.npcs.length > 0) {
      for (const npc of cr.npcs) {
        const px = npc.x * 32;
        const py = npc.y * 32;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(px + 16, py + 26, 12, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();

        const isKyungsook = (npc.id === 'npc_teacher_kyungsook' || (npc.name && (npc.name.includes('졍경슉') || npc.name.includes('정경숙'))));
        const isJoshua = (npc.id === 'npc_teacher_joshua' || (npc.name && npc.name.includes('Joshua')));
        const isTeacherNpc = (npc.avatar === 'teacher' || npc.avatar === 'teacher_joshua' || npc.name.includes('선생님'));

        if (isJoshua) {
          // 3학년 영어 Joshua 선생님 (블랙맨투맨, 청바지, 짧은 머리, 안경없는 훈남 영어 교사)
          // 1. 머리 및 피부 베이스
          this.ctx.fillStyle = '#fed7aa';
          this.ctx.beginPath();
          this.ctx.arc(px + 16, py + 12, 10, 0, Math.PI * 2);
          this.ctx.fill();

          // 2. 짧고 깔끔한 다크 브라운 크롭/댄디 헤어스타일 (짧은 머리)
          this.ctx.fillStyle = '#292524';
          this.ctx.beginPath();
          this.ctx.arc(px + 16, py + 8.5, 9.5, Math.PI * 0.95, Math.PI * 2.05);
          this.ctx.fill();
          this.ctx.fillRect(px + 9, py + 5, 14, 4); // 앞머리
          this.ctx.fillRect(px + 7, py + 7, 3, 5);  // 짧은 구렛나루 좌
          this.ctx.fillRect(px + 22, py + 7, 3, 5); // 짧은 구렛나루 우

          // 3. 눈 & 눈썹 (안경 없음)
          this.ctx.fillStyle = '#292524';
          this.ctx.fillRect(px + 11, py + 10, 3.5, 1.2); // 눈썹 좌
          this.ctx.fillRect(px + 17.5, py + 10, 3.5, 1.2); // 눈썹 우
          this.ctx.fillStyle = '#1e293b';
          this.ctx.fillRect(px + 11.5, py + 12, 2.5, 2.5); // 눈동자 좌
          this.ctx.fillRect(px + 18, py + 12, 2.5, 2.5);   // 눈동자 우
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillRect(px + 12, py + 12, 1, 1);       // 눈 하이라이트 좌
          this.ctx.fillRect(px + 18.5, py + 12, 1, 1);     // 눈 하이라이트 우

          // 미소 입
          this.ctx.strokeStyle = '#c2410c';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(px + 14.5, py + 16);
          this.ctx.lineTo(px + 17.5, py + 16);
          this.ctx.stroke();

          // 4. 블랙맨투맨 (Black Sweatshirt / Crewneck)
          this.ctx.fillStyle = '#18181b';
          this.ctx.fillRect(px + 8, py + 18, 16, 9); // 몸통
          this.ctx.fillRect(px + 5, py + 18, 3, 8);  // 소매 좌
          this.ctx.fillRect(px + 24, py + 18, 3, 8); // 소매 우

          // 맨투맨 크루넥 넥라인 밴딩
          this.ctx.fillStyle = '#27272a';
          this.ctx.fillRect(px + 12, py + 18, 8, 2);

          // 손 (피부톤)
          this.ctx.fillStyle = '#fed7aa';
          this.ctx.fillRect(px + 5, py + 26, 3, 2);
          this.ctx.fillRect(px + 24, py + 26, 3, 2);

          // 5. 청바지 (Blue Denim Jeans)
          this.ctx.fillStyle = '#2563eb';
          this.ctx.fillRect(px + 8, py + 27, 16, 4.5);
          // 청바지 중앙 봉제선
          this.ctx.fillStyle = '#1d4ed8';
          this.ctx.fillRect(px + 15.5, py + 27, 1, 4.5);

          // 깔끔한 화이트 스니커즈 (신발)
          this.ctx.fillStyle = '#f8fafc';
          this.ctx.fillRect(px + 8, py + 31.5, 6, 2.5);
          this.ctx.fillRect(px + 18, py + 31.5, 6, 2.5);
        } else {
          this.ctx.fillStyle = isKyungsook ? '#581c87' : (isTeacherNpc ? '#1e3a8a' : '#047857');
          this.ctx.beginPath();
          this.ctx.arc(px + 16, py + 12, 10, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillRect(px + 8, py + 18, 16, 14);

          // 연금술사 졍경슉 선생님 전용 신비한 룬 장식 펜던트
          if (isKyungsook) {
            this.ctx.fillStyle = '#f59e0b';
            this.ctx.fillRect(px + 14, py + 22, 4, 4);
          }
        }

        const labelText = isJoshua ? '👨‍🏫 Joshua 선생님 (3학년 영어)' : `${isKyungsook ? '⚗️' : (isTeacherNpc ? '👨‍🏫' : '💬')} ${npc.name}`;
        this.drawSharpLabel(px + 16, py + 38, labelText, {
          bgColor: isJoshua ? 'rgba(30, 41, 59, 0.95)' : (isKyungsook ? 'rgba(88, 28, 135, 0.95)' : (isTeacherNpc ? 'rgba(30, 58, 138, 0.95)' : 'rgba(6, 78, 59, 0.95)')),
          borderColor: isJoshua ? '#fbbf24' : (isKyungsook ? '#c084fc' : (isTeacherNpc ? '#60a5fa' : '#34d399')),
          textColor: '#fef08a',
          fontSize: 12,
          paddingX: 8,
          height: 20
        });

        // 8-C-1. 머리 위 플로팅 퀘스트 상태 마커 (! / ?)
        if (npc.questId || isJoshua) {
          const qStatus = (window.MainApp && typeof window.MainApp.getTeacherQuestStatus === 'function')
            ? window.MainApp.getTeacherQuestStatus(npc.id || npc.questId)
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

      this.drawSharpLabel(ex + 16, ey + 16, '🚪 ▼ 복도로 나가기 (EXIT)', {
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
    // 7. NEW BOSS RAID ARENA: 서쪽 골대 앞 신규 보스 레이드 전장 (x: 13, y: 35)
    // ========================================================
    const pg = WORLD_DATA.playground;
    const isSoccerRaid = !!(window.BOSS_CONFIG && window.BOSS_CONFIG.active &&
      (window.BOSS_CONFIG.name.includes('대마왕') || window.BOSS_CONFIG.name.includes('케르베로스') ||
       window.BOSS_CONFIG.name.includes('파멸신') || window.BOSS_CONFIG.name.includes('나태')));
    const soccerBossObj = (pg && pg.boss) || (isSoccerRaid ? {
      id: 'boss_soccer_raid',
      type: 'boss_raid',
      x: 13,
      y: 35,
      name: window.BOSS_CONFIG.name,
      prompt: '보스 레이드'
    } : null);
    if (soccerBossObj) {
      this.drawSoccerBossArena(13 * 32, 35 * 32, soccerBossObj);
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
    if (this.player.room !== 'hallway') return;

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

    // Chat speech bubble if active
    if (p.chatBubble && Date.now() < p.chatBubbleExpires) {
      this.renderChatBubble(px + 12, plateY - 16, p.chatBubble);
    }
  }

  renderOtherPlayer(p) {
    this.renderPlayer(p, false);
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

    // Sacred Magic Circle
    this.ctx.save();
    this.ctx.translate(bx, by);

    this.ctx.strokeStyle = `rgba(250, 204, 21, ${pulse})`;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 72, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(234, 88, 12, 0.18)';
    this.ctx.fill();

    this.ctx.rotate(rot);
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    for (let r = 0; r < 8; r++) {
      const ang = (r * Math.PI) / 4;
      this.ctx.moveTo(Math.cos(ang) * 45, Math.sin(ang) * 45);
      this.ctx.lineTo(Math.cos(ang) * 68, Math.sin(ang) * 68);
    }
    this.ctx.stroke();

    for (let r = 0; r < 6; r++) {
      const ang = (r * Math.PI) / 3;
      this.ctx.fillStyle = '#fef08a';
      this.ctx.beginPath();
      this.ctx.arc(Math.cos(ang) * 56, Math.sin(ang) * 56, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();

    // Draw Active Boss Sprite
    const bCfg = window.BOSS_CONFIG || boss;
    const bName = ((bCfg && bCfg.name) || boss.name || '').toLowerCase();

    if (bName.includes('대마왕') || bName.includes('중간고사') || bName.includes('demon') || bName.includes('마왕')) {
      this.drawHighResBossDemon(boss);
    } else if (bName.includes('케르베로스') || bName.includes('수행평가') || bName.includes('cerberus')) {
      this.drawHighResBossCerberus(boss);
    } else if (bName.includes('파멸신') || bName.includes('기말고사') || bName.includes('final')) {
      this.drawHighResBossFinalGod(boss);
    } else if (bName.includes('나태') || bName.includes('거인') || bName.includes('sloth')) {
      this.drawHighResBossSlothTitan(boss);
    } else if (bName.includes('드래곤') || bName.includes('dragon') || bName.includes('용')) {
      this.drawHighResBossDragon(boss);
    } else {
      this.drawHighResBossDemon(boss);
    }

    this.drawSharpLabel(bx, by + 46, '⚔️ [SPACE: 보스 레이드 도전]', {
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
      const bText3 = isTeacher ? `🌸 숭실 생명의 만개목 (3,000회 만개! ✨)` : '🌸 숭실 생명의 만개목';
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
    const clues = (app && app.playerData && Array.isArray(app.playerData.historyClues)) ? app.playerData.historyClues : [false, false, false, false];
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
        if (tx >= x && tx <= x + 4 && ty >= 15 && ty <= 20) return true;
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
        }
      }
    }
  }

  // 교무실 머리 위 플로팅 퀘스트 상태 마커 (! / ?)
  drawFloatingQuestMarker(cx, cy, status) {
    if (!status || status === 'done') return;
    const ctx = this.ctx;
    ctx.save();

    // 부드러운 상하 바운스 모션
    const bob = Math.sin(Date.now() / 240) * 3.5;
    const my = cy + bob;

    if (status === 'available') {
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

  drawStaffOfficeTeacherDesk(px, py, w, h, label, facing) {
    const ctx = this.ctx;
    ctx.save();

    const isCreatorDesk = (label === '26');
    const now = Date.now();

    // 0. 제작자 갓준철 연구석: 황금빛 펄스 후광 글로우 (바닥 조명 및 배경 아우라)
    if (isCreatorDesk) {
      this.renderJuncheolDeskGoldenAuraBack(px, py, w, h, now);
    }

    // 1. 의자 (책상 바깥쪽)
    if (facing === 'right') {
      this.drawStaffOfficeChair(px - 10, py + h / 2, 'right');
    } else if (facing === 'left') {
      if (isCreatorDesk) {
        this.drawStaffOfficeChair(px + w + 10, py + h / 2, 'left', '#1e1b4b', '#fbbf24');
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
        ctx.fillRect(px + w - 14, py + h / 2 - 12, 8, 24);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(px + w - 16, py + h / 2 - 10, 2, 20);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(px + 8, py + 8, 14, 12);
      } else if (facing === 'left') {
        ctx.fillRect(px + 6, py + h / 2 - 12, 8, 24);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(px + 14, py + h / 2 - 10, 2, 20);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(px + w - 22, py + 8, 14, 12);
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
      // 👑 26 갓준철 골드 명패
      ctx.font = 'bold 10px "Pretendard", "Noto Sans KR", sans-serif';
      const tw = Math.max(54, ctx.measureText('👑 26 갓준철').width + 10);
      const th = 18;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👑 26 갓준철', cx, cy + 0.5);
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

    // 3. 👑 26 갓준철 골드 명패의 빛나는 황금 하이라이트 림
    const badgeTw = Math.max(54, ctx.measureText('👑 26 갓준철').width + 10);
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
        // 1 - 2 - 1 자리 테이블 (총 4석)
        this.drawStaffOfficeTeacherDesk((x + 0.5) * 32, 15 * 32, 4 * 32, 34, lb.top, 'down');
        this.drawStaffOfficeTeacherDesk(x * 32, 16 * 32 + 10, 64, 64, lb.l, 'right');
        this.drawStaffOfficeTeacherDesk((x + 3) * 32, 16 * 32 + 10, 64, 64, lb.r, 'left');
        this.drawStaffOfficeTeacherDesk((x + 0.5) * 32, 19 * 32, 4 * 32, 34, lb.bottom, 'up');
        this.drawPartitionLine(x * 32 - 2, 16 * 32 + 6, (x + 5) * 32 + 2, 16 * 32 + 6);
        this.drawPartitionLine((x + 2.5) * 32, 16 * 32 + 6, (x + 2.5) * 32, 18 * 32 + 26);
        this.drawPartitionLine(x * 32 - 2, 18 * 32 + 26, (x + 5) * 32 + 2, 18 * 32 + 26);
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

}
