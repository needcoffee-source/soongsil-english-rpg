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

    this.initTouchAndMouse();
  }

  resize() {
    this.canvas.width = this.width * this.renderScale;
    this.canvas.height = this.height * this.renderScale;
  }

  initTouchAndMouse() {
    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.fade.active) return; // ignore clicks during fade

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
    if (!this.player.hasRunningShoes) {
      this.player.isDashing = false;
      this.player.speed = 3.8;
      return;
    }
    this.player.isDashing = isDashing;
    this.player.speed = isDashing ? 7.6 : 3.8;
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

    let dx = 0;
    let dy = 0;

    if (this.keys.up) { dy -= 1; this.player.direction = 'up'; }
    if (this.keys.down) { dy += 1; this.player.direction = 'down'; }
    if (this.keys.left) { dx -= 1; this.player.direction = 'left'; }
    if (this.keys.right) { dx += 1; this.player.direction = 'right'; }

    this.player.isMoving = (dx !== 0 || dy !== 0);

    if (this.player.isMoving) {
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const nextX = this.player.x + dx * this.player.speed;
      const nextY = this.player.y + dy * this.player.speed;

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

      // Emit movement with throttling (~15 FPS / every 66ms) to eliminate network lag
      const now = performance.now();
      if (!this.lastMoveEmitTime || now - this.lastMoveEmitTime >= 66 || this.lastMoveDir !== this.player.direction) {
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
    return WORLD_DATA.MAP_WIDTH || 30;
  }

  getMapHeight() {
    if (this.player && this.player.room === 'playground') {
      return WORLD_DATA.PLAYGROUND_HEIGHT || 28;
    }
    return WORLD_DATA.MAP_HEIGHT || 20;
  }

  checkCollision(x, y) {
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
          const isDoor = floorData.rooms.some(r => r.doorX === tileX && r.doorY === tileY);
          if (!isDoor) return true;
        }
      }
    } else {
      // Inside Classroom (room_701 or room_702)
      const cr = this.getCurrentClassroomData();

      // Exit Door area is ALWAYS passable
      if (Math.abs(tileX - cr.exitDoor.x) <= 2 && tileY >= cr.exitDoor.y) {
        return false;
      }

      if (tileY >= cr.exitDoor.y + 1) return true; // bottom wall
      if (tileY <= 3) return true; // front blackboard & wall
      if (cr.teacherDesk && tileX === cr.teacherDesk.x && tileY === cr.teacherDesk.y) return true;

      for (const d of (cr.desks || [])) {
        if (tileX === d.x && tileY === d.y) return true;
      }
    }

    return false;
  }

  getCurrentClassroomData() {
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
        if (r.doorX === tileX && r.doorY === tileY) {
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
    } else if (this.player.room !== 'playground') {
      // Exit classroom when stepping on exit door area (Only inside classrooms)
      const cr = this.getCurrentClassroomData();
      const exit = (cr && cr.exitDoor) || WORLD_DATA.classroom.exitDoor;
      if (Math.abs(tileX - exit.x) <= 2 && tileY >= exit.y - 1) {
        this.triggerFadeWarp(() => {
          this.exitClassroom();
        });
      }
    }
  }

  exitClassroom() {
    const floorData = WORLD_DATA.floors[this.player.floor];
    const currentRoomInfo = floorData && floorData.rooms ? floorData.rooms.find(r => r.id === this.player.room) : null;
    const returnX = currentRoomInfo ? currentRoomInfo.doorX * 32 : 15 * 32;
    const returnY = currentRoomInfo ? (currentRoomInfo.doorY + 2) * 32 : 10 * 32;
    this.warpToRoom('hallway', floorData ? floorData.name : '복도', returnX, returnY);
  }

  warpToRoom(roomId, roomName, x, y) {
    this.player.room = roomId;
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
  teleportTo(floor, room) {
    this.triggerFadeWarp(() => {
      this.player.floor = parseInt(floor) || 7;
      if (this.player.isTeacher) {
        this.player.speed = this.player.isDashing ? 7.6 : 4.0; // 교사 기본 이동속도 4.0 유지 (Shift 시 7.6)
      }
      if (room === 'playground_soccer') {
        this.player.room = 'playground';
        this.player.roomName = '숭실 운동장 (축구장)';
        this.player.x = 31 * 32; // 천연잔디 축구장 센터서클
        this.player.y = 16 * 32;
      } else if (room === 'playground_basketball') {
        this.player.room = 'playground';
        this.player.roomName = '숭실 운동장 (농구장)';
        this.player.x = 74 * 32; // 우레탄 농구장 센터서클
        this.player.y = 16 * 32;
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
      } else {
        this.player.room = room || 'room_701';
        this.player.x = 15 * 32;
        this.player.y = 13 * 32;
        const fData = WORLD_DATA.floors[this.player.floor];
        const rData = fData && fData.rooms ? fData.rooms.find(r => r.id === this.player.room) : null;
        this.player.roomName = rData ? rData.name : '교실 내부';
      }
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
              closest = { type: obj.type, data: obj, name: obj.name, prompt: obj.prompt };
              minDist = dist;
            }
          }
        }
        // Central Elevator (지상 운동장 이동)
        if (floorData.elevator) {
          const eDist = Math.hypot(floorData.elevator.x * 32 - this.player.x, (floorData.elevator.y + 1.5) * 32 - this.player.y);
          if (eDist < minDist) {
            closest = { type: 'elevator', name: '중앙 엘리베이터', prompt: '운동장으로 이동 (50G)' };
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
      }
    } else if (this.player.room === 'playground') {
      const pg = WORLD_DATA.playground;
      if (pg) {
        // 1. Elevator back to 1F Hallway
        if (pg.elevator) {
          const eDist = Math.hypot(pg.elevator.x * 32 - this.player.x, (pg.elevator.y + 1.5) * 32 - this.player.y);
          if (eDist < minDist) {
            closest = { type: 'elevator', name: '중앙 엘리베이터', prompt: '1학년 복도로 올라가기' };
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
        // 3. Basketball Monsters (1:1 퀴즈 배틀)
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
      }
    } else {
      // Inside Classroom (room_701: 노가다 채집장 / room_702: 보스 레이드)
      const cr = this.getCurrentClassroomData();
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
            type: 'teacher_desk',
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
        const bossDist = Math.hypot(cr.boss.x * 32 - this.player.x, cr.boss.y * 32 - this.player.y);
        if (bossDist < 96) {
          closest = { type: 'boss_raid', data: cr.boss, name: cr.boss.name, prompt: cr.boss.prompt };
          minDist = bossDist;
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
      if (exitDist < 64) {
        closest = { type: 'exit', name: '복도 출구', prompt: '복도로 나가기 (SPACE)' };
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
          return { type: 'elevator', name: '중앙 엘리베이터', prompt: '운동장으로 이동 (50G)' };
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
        if (pg.basketballMonsters) {
          for (const mob of pg.basketballMonsters) {
            if (mob.defeated) continue;
            if (Math.hypot(mob.x * 32 - x, (mob.y + 0.5) * 32 - y) < 48) {
              return { type: 'field_monster', data: mob, name: `${mob.icon} ${mob.name}`, prompt: '1:1 퀴즈 배틀' };
            }
          }
        }
      }
    } else {
      const cr = this.getCurrentClassroomData();
      if (Math.hypot(cr.exitDoor.x * 32 - x, cr.exitDoor.y * 32 - y) < 48) {
        return { type: 'exit' };
      }
      if (cr.teacherDesk && Math.hypot(cr.teacherDesk.x * 32 - x, (cr.teacherDesk.y + 0.5) * 32 - y) < 48) {
        return { type: 'teacher_desk', data: cr.teacherDesk, name: cr.teacherDesk.name || '교탁(골드)' };
      }
      if (cr.blackboard && Math.hypot(cr.blackboard.x * 32 - x, cr.blackboard.y * 32 - y) < 60) {
        return { type: 'teacher_desk', data: cr.blackboard, name: cr.blackboard.name || '교탁(골드)' };
      }
      for (const spot of (cr.gatherSpots || [])) {
        if (Math.hypot(spot.x * 32 - x, spot.y * 32 - y) < 48) {
          return { type: spot.type, data: spot, name: spot.name };
        }
      }
      if (cr.boss && Math.hypot(cr.boss.x * 32 - x, cr.boss.y * 32 - y) < 76) {
        return { type: 'boss_raid', data: cr.boss, name: cr.boss.name };
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

    // Render other players
    for (const id in this.otherPlayers) {
      this.renderOtherPlayer(this.otherPlayers[id]);
    }

    // Render Local Player
    this.renderPlayer(this.player, true);

    this.ctx.restore();

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
    const {
      bgColor = 'rgba(15, 23, 42, 0.94)',
      borderColor = '#cbd5e1',
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
    this.ctx.lineWidth = 1.5;
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
    } else if (ty === 3 || (isClassroom && ty >= 18)) {
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
    const px = r.doorX * 32;
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
    this.drawSharpLabel(px + 16, py + 4, `🚪 ${r.name}`, {
      bgColor: '#1e1b4b',
      borderColor: '#f59e0b',
      textColor: '#fef08a',
      fontSize: 13,
      paddingX: 11,
      height: 22
    });
  }

  // 6. High-Res Classroom Blackboard with Aluminum Frame & School Motto
  drawHighResBlackboard(cr) {
    const bx = 8 * 32;
    const by = 10;
    const bw = 14 * 32;
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

    // Crisp Chalk Writing on Blackboard
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

    // Boss Body (Massive Ancient Bark & Stone Golem)
    const by = py + bob;
    // Giant Shoulders & Torso
    this.ctx.fillStyle = '#3f2e21';
    this.ctx.fillRect(px - 28, by - 26, 56, 42);
    this.ctx.fillStyle = '#5c4033';
    this.ctx.fillRect(px - 24, by - 22, 48, 34);

    // Mossy Shoulder Pads
    this.ctx.fillStyle = '#15803d';
    this.ctx.fillRect(px - 32, by - 28, 18, 12);
    this.ctx.fillRect(px + 14, by - 28, 18, 12);

    // Golem Head & Crown
    this.ctx.fillStyle = '#291d12';
    this.ctx.fillRect(px - 16, by - 44, 32, 22);

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

    // Massive Golem Fists
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(px - 42, by - 14, 14, 26);
    this.ctx.fillRect(px + 28, by - 14, 14, 26);
    this.ctx.restore();

    // Boss Nameplate (교사 이벤트 시작 여부에 따른 상태 표시)
    const bCfg = window.BOSS_CONFIG || boss;
    const isRaidActive = !!(bCfg && bCfg.active);
    const labelText = isRaidActive
      ? `🔥 ${bCfg.name || boss.name} (HP ${bCfg.currentHp ?? bCfg.maxHp}/${bCfg.maxHp})`
      : `⏳ [이벤트 대기중] ${bCfg.name || boss.name}`;

    this.drawSharpLabel(px, py - 58, labelText, {
      bgColor: isRaidActive ? 'rgba(127, 29, 29, 0.96)' : 'rgba(30, 41, 59, 0.94)',
      borderColor: isRaidActive ? '#f87171' : '#94a3b8',
      textColor: isRaidActive ? '#fef08a' : '#e2e8f0',
      fontSize: 13,
      paddingX: 12,
      height: 24
    });
  }

  // 11-E. High-Res Season 1 Boss: Royal Gold Dragon (1학년 2반 숭실 골드 드래곤 레이드)
  drawHighResBossDragon(boss) {
    const px = boss.x * 32 + 16;
    const py = boss.y * 32 + 16;
    const now = Date.now();
    const bob = Math.sin(now / 280) * 4;
    const wingFlap = Math.sin(now / 220) * 9;
    const tailSway = Math.sin(now / 340) * 8;

    this.ctx.save();

    // 1. Radiant Golden Raid Magic Circle on Floor
    this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 26, 60, 26, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(217, 119, 6, 0.22)';
    this.ctx.fill();

    // Inner Runed Ring
    this.ctx.strokeStyle = 'rgba(253, 224, 71, 0.6)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 26, 42, 18, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    // Draconic Magic Glyphs / 8-Ray Star on Floor
    for (let r = 0; r < 4; r++) {
      const angle = (Math.PI / 4) * r + (now / 3000);
      const rx = Math.cos(angle) * 38;
      const ry = Math.sin(angle) * 16;
      this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
      this.ctx.beginPath();
      this.ctx.moveTo(px - rx, py + 26 - ry);
      this.ctx.lineTo(px + rx, py + 26 + ry);
      this.ctx.stroke();
    }

    const by = py + bob;

    // 2. Dragon Tail (Curving behind body with spiked golden fin)
    this.ctx.fillStyle = '#92400e';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 10, by + 12);
    this.ctx.quadraticCurveTo(px + 36 + tailSway, by + 18, px + 44 + tailSway, by + 8);
    this.ctx.lineTo(px + 40 + tailSway, by + 3);
    this.ctx.quadraticCurveTo(px + 28 + tailSway * 0.7, by + 12, px + 8, by + 6);
    this.ctx.closePath();
    this.ctx.fill();

    // Spiked Golden Fin at Tail Tip
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 44 + tailSway, by + 8);
    this.ctx.lineTo(px + 56 + tailSway, by + 5);
    this.ctx.lineTo(px + 46 + tailSway, by - 2);
    this.ctx.closePath();
    this.ctx.fill();

    // 3. Massive Golden Dragon Wings (Left & Right Flapping)
    // Left Wing
    const lTipY = by - 36 + wingFlap;
    this.ctx.fillStyle = 'rgba(251, 191, 36, 0.85)'; // Membrane
    this.ctx.beginPath();
    this.ctx.moveTo(px - 14, by - 12);
    this.ctx.lineTo(px - 58, lTipY);
    this.ctx.quadraticCurveTo(px - 44, lTipY + 22, px - 34, by + 4);
    this.ctx.quadraticCurveTo(px - 22, by + 14, px - 12, by + 6);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = '#78350f'; // Main Wing Bone Spine
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.moveTo(px - 12, by - 10);
    this.ctx.lineTo(px - 36, lTipY - 6);
    this.ctx.lineTo(px - 58, lTipY);
    this.ctx.stroke();

    // Left Wing Claw Spur
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px - 37, lTipY - 8, 4, 4);

    // Right Wing
    const rTipY = by - 36 + wingFlap;
    this.ctx.fillStyle = 'rgba(251, 191, 36, 0.85)'; // Membrane
    this.ctx.beginPath();
    this.ctx.moveTo(px + 14, by - 12);
    this.ctx.lineTo(px + 58, rTipY);
    this.ctx.quadraticCurveTo(px + 44, rTipY + 22, px + 34, by + 4);
    this.ctx.quadraticCurveTo(px + 22, by + 14, px + 12, by + 6);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = '#78350f'; // Main Wing Bone Spine
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 12, by - 10);
    this.ctx.lineTo(px + 36, rTipY - 6);
    this.ctx.lineTo(px + 58, rTipY);
    this.ctx.stroke();

    // Right Wing Claw Spur
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px + 34, rTipY - 8, 4, 4);

    // 4. Dragon Hind Legs & Claws (Grounded)
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px - 28, by + 8, 14, 18);
    this.ctx.fillRect(px + 14, by + 8, 14, 18);
    // Dark Obsidian Talons
    this.ctx.fillStyle = '#1c1917';
    this.ctx.fillRect(px - 30, by + 24, 6, 4);
    this.ctx.fillRect(px - 22, by + 24, 6, 4);
    this.ctx.fillRect(px + 14, by + 24, 6, 4);
    this.ctx.fillRect(px + 22, by + 24, 6, 4);

    // 5. Scaled Gold Torso & Chest Plates
    this.ctx.fillStyle = '#d97706'; // Base scales
    this.ctx.fillRect(px - 18, by - 16, 36, 32);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(px - 15, by - 13, 30, 26);

    // Underbelly Armor Scales (Radiant Light Gold Plates)
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px - 8, by - 12, 16, 6);
    this.ctx.fillRect(px - 7, by - 4, 14, 6);
    this.ctx.fillRect(px - 6, by + 4, 12, 6);
    this.ctx.fillRect(px - 5, by + 12, 10, 5);

    // 6. Glowing Ruby Dragon Heart in Chest
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 3, 6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#fca5a5';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 3, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // 7. Powerful Front Forelegs & Claws
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(px - 22, by + 2, 9, 20);
    this.ctx.fillRect(px + 13, by + 2, 9, 20);
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px - 23, by + 20, 11, 4);
    this.ctx.fillRect(px + 12, by + 20, 11, 4);

    // 8. Long Scaled Neck & Head
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px - 10, by - 30, 20, 16);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(px - 8, by - 28, 16, 14);

    // Dragon Head & Jaws
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(px - 14, by - 46, 28, 20);
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillRect(px - 12, by - 44, 24, 16);

    // Sweeping Majestic Golden Horns
    this.ctx.fillStyle = '#78350f';
    // Left Horn
    this.ctx.beginPath();
    this.ctx.moveTo(px - 10, by - 46);
    this.ctx.lineTo(px - 24, by - 62);
    this.ctx.lineTo(px - 6, by - 46);
    this.ctx.closePath();
    this.ctx.fill();
    // Right Horn
    this.ctx.beginPath();
    this.ctx.moveTo(px + 10, by - 46);
    this.ctx.lineTo(px + 24, by - 62);
    this.ctx.lineTo(px + 6, by - 46);
    this.ctx.closePath();
    this.ctx.fill();

    // Horn Gold Highlights
    this.ctx.fillStyle = '#fde047';
    this.ctx.fillRect(px - 23, by - 61, 3, 6);
    this.ctx.fillRect(px + 21, by - 61, 3, 6);

    // Fierce Ruby-Red Dragon Eyes with Golden Gaze
    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(px - 9, by - 40, 6, 5);
    this.ctx.fillRect(px + 3, by - 40, 6, 5);
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px - 7, by - 39, 3, 3);
    this.ctx.fillRect(px + 5, by - 39, 3, 3);

    // Dragon Snout & Sharp Fangs
    this.ctx.fillStyle = '#92400e';
    this.ctx.fillRect(px - 8, by - 30, 16, 4); // mouth line
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px - 6, by - 28, 3, 3); // fangs
    this.ctx.fillRect(px + 3, by - 28, 3, 3);

    // Draconic Embers & Gold Sparkles drifting upward
    for (let i = 0; i < 4; i++) {
      const pOffset = (now / 350 + i * 1.5) % 4;
      const spX = px + Math.sin(now / 200 + i * 2) * 20;
      const spY = by - 30 - pOffset * 10;
      const spAlpha = Math.max(0, 1 - pOffset / 4);
      this.ctx.fillStyle = `rgba(254, 240, 138, ${spAlpha})`;
      this.ctx.fillRect(spX, spY, 3, 3);
    }

    this.ctx.restore();

    // Boss Nameplate (교사 이벤트 시작 여부에 따른 상태 표시)
    const bCfg = window.BOSS_CONFIG || boss;
    const isRaidActive = !!(bCfg && bCfg.active);
    const labelText = isRaidActive
      ? `🔥 ${bCfg.name || boss.name} (HP ${bCfg.currentHp ?? bCfg.maxHp}/${bCfg.maxHp})`
      : `⏳ [이벤트 대기중] ${bCfg.name || boss.name}`;

    this.drawSharpLabel(px, py - 66, labelText, {
      bgColor: isRaidActive ? 'rgba(120, 53, 15, 0.96)' : 'rgba(30, 41, 59, 0.94)',
      borderColor: isRaidActive ? '#fbbf24' : '#94a3b8',
      textColor: isRaidActive ? '#fef08a' : '#e2e8f0',
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

  isElevatorUnderMaintenance() {
    if (window.app && window.app.playerData) {
      if (window.app.playerData.isTeacher) return false;
      if (window.app.playerData.hasClearedDragonRaid) return false;
      const studentId = window.app.playerData.studentId || '';
      if (studentId && localStorage.getItem('soongsil_dragon_cleared_' + studentId) === 'true') return false;
      if (localStorage.getItem('soongsil_dragon_cleared_global') === 'true') return false;
    }
    return true;
  }

  // 14. High-Res Stainless Steel Elevator with Floor LED Indicator
  drawHighResElevator(el, currentFloor = 7) {
    const px = el.x * 32 - 4;
    const py = el.y * 32 - 12;
    const w = 40;
    const h = 44;

    const isHallway = (currentFloor === 7);
    const isMaintenance = isHallway && this.isElevatorUnderMaintenance();

    // Floor shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(px, py + h, w, 4);

    // Outer Stainless Steel Frame
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(px, py, w, h);
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(px + 2, py + 2, w - 4, h - 2);

    // Digital Floor Indicator Panel (Black glass with LED)
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(px + 8, py + 4, w - 16, 10);
    this.ctx.fillStyle = isMaintenance ? '#ef4444' : '#10b981';
    this.ctx.font = 'bold 9px monospace';
    this.ctx.textAlign = 'center';
    const ledText = isMaintenance ? `[ 7F 점검 ]` : (isHallway ? `[ 7F ▲▼ ]` : `[ 1F ▲ ]`);
    this.ctx.fillText(ledText, px + w / 2, py + 12);

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
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(px + w + 2, py + 20, 6, 12);
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px + w + 3, py + 22, 4, 3);
    this.ctx.fillRect(px + w + 3, py + 27, 4, 3);

    // Label placed at TOP (py - 12)
    if (isMaintenance) {
      this.drawSharpLabel(px + w / 2, py - 12, '🛗 엘리베이터 (점검 중)', {
        bgColor: 'rgba(15, 23, 42, 0.94)',
        borderColor: '#ef4444',
        textColor: '#fca5a5',
        fontSize: 11.5,
        paddingX: 9,
        height: 20
      });
    } else {
      this.drawSharpLabel(px + w / 2, py - 12, '🛗 중앙 엘리베이터', {
        bgColor: 'rgba(15, 23, 42, 0.94)',
        borderColor: '#38bdf8',
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
    for (let tx = 0; tx < WORLD_DATA.MAP_WIDTH; tx++) {
      for (let ty = 0; ty < WORLD_DATA.MAP_HEIGHT; ty++) {
        if (ty <= 2 || tx === 0 || tx === WORLD_DATA.MAP_WIDTH - 1 || ty >= 18) {
          this.drawHighResWall(tx, ty, true);
        } else {
          this.drawHighResWoodPlankFloor(tx, ty);
        }
      }
    }

    // 2. High-Res Classroom Blackboard & School Motto
    this.drawHighResBlackboard(cr);

    // 3. Wall Clock above Blackboard (Center Top)
    this.drawHighResWallClock(15 * 32, 16);

    // 4. Back Wall Student Lockers (Row of Lockers along Back Wall)
    this.drawHighResLockers(3, 17, 5);
    this.drawHighResLockers(22, 17, 5);

    if (isBossRoom) {
      // === 1학년 2반: 시즌1 보스 레이드 전용 연출 ===
      // Red Raid Carpet Runner from Door to Boss
      this.ctx.fillStyle = 'rgba(153, 27, 27, 0.45)';
      this.ctx.fillRect(13 * 32, 6 * 32, 4 * 32, 11 * 32);
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(13 * 32, 6 * 32, 4 * 32, 11 * 32);

      if (cr.boss) {
        const bCfg = window.BOSS_CONFIG || cr.boss;
        const bName = ((bCfg && bCfg.name) || cr.boss.name || '').toLowerCase();
        if (bName.includes('골드') || bName.includes('드래곤') || bName.includes('dragon') || bName.includes('용')) {
          this.drawHighResBossDragon(cr.boss);
        } else {
          this.drawHighResBossGolem(cr.boss);
        }
      }
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

    // 9. Classroom Exit Door & Plush Red Carpet
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

    // 5. Left & Center 2/3: SOCCER FIELD (축구장 & 우레탄 트랙)
    // 5-A. Tartan Red Running Track (우레탄 육상 트랙: x: 4 ~ 58, y: 6 ~ 26)
    const trackX = 4 * 32;
    const trackY = 6 * 32;
    const trackW = 54 * 32;
    const trackH = 20 * 32;

    this.ctx.fillStyle = '#991b1b'; // Red Tartan
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

    // 5-B. Lush Natural Grass Pitch (잔디 축구장: x: 7 ~ 55, y: 8 ~ 24)
    const pitchX = 7 * 32;
    const pitchY = 8 * 32;
    const pitchW = 48 * 32;
    const pitchH = 16 * 32;

    // Grass Turf Mowing Stripes (4-tile stripes)
    for (let sx = 0; sx < 48; sx += 4) {
      this.ctx.fillStyle = (sx / 4) % 2 === 0 ? '#15803d' : '#16a34a';
      this.ctx.fillRect(pitchX + sx * 32, pitchY, 4 * 32, pitchH);
    }

    // 5-C. Soccer Field Markings (Crisp Pure White Lines)
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

    // Center Circle (Radius: 100px) & Center Spot
    const midY = pitchY + pitchH / 2;
    this.ctx.beginPath();
    this.ctx.arc(midX, midY, 100, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(midX, midY, 5, 0, Math.PI * 2);
    this.ctx.fill();

    // Left Penalty Box (18-yard box: width 8 tiles, height 10 tiles)
    const penW = 8 * 32;
    const penH = 10 * 32;
    const penY = midY - penH / 2;
    this.ctx.strokeRect(pitchX, penY, penW, penH);

    // Left Goal Area (6-yard box: width 3.5 tiles, height 5 tiles)
    const gAreaW = 3.5 * 32;
    const gAreaH = 5 * 32;
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

    // Right Penalty Box (18-yard box)
    this.ctx.strokeRect(pitchX + pitchW - penW, penY, penW, penH);

    // Right Goal Area (6-yard box)
    this.ctx.strokeRect(pitchX + pitchW - gAreaW, gAreaY, gAreaW, gAreaH);

    // Right Penalty Spot & Arc
    const rSpotX = pitchX + pitchW - 5.5 * 32;
    this.ctx.beginPath();
    this.ctx.arc(rSpotX, midY, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(rSpotX, midY, 50, Math.PI - 0.9, Math.PI + 0.9);
    this.ctx.stroke();

    // 4 Corner Arcs & Checkered Corner Flags
    const cornerR = 14;
    // Top-Left
    this.ctx.beginPath(); this.ctx.arc(pitchX, pitchY, cornerR, 0, Math.PI / 2); this.ctx.stroke();
    // Bottom-Left
    this.ctx.beginPath(); this.ctx.arc(pitchX, pitchY + pitchH, cornerR, -Math.PI / 2, 0); this.ctx.stroke();
    // Top-Right
    this.ctx.beginPath(); this.ctx.arc(pitchX + pitchW, pitchY, cornerR, Math.PI / 2, Math.PI); this.ctx.stroke();
    // Bottom-Right
    this.ctx.beginPath(); this.ctx.arc(pitchX + pitchW, pitchY + pitchH, cornerR, Math.PI, Math.PI * 1.5); this.ctx.stroke();

    // Corner Flags
    this.drawCornerFlag(pitchX - 2, pitchY - 2);
    this.drawCornerFlag(pitchX - 2, pitchY + pitchH + 2);
    this.drawCornerFlag(pitchX + pitchW + 2, pitchY - 2);
    this.drawCornerFlag(pitchX + pitchW + 2, pitchY + pitchH + 2);

    // 5-D. High-Res Goalposts with 3D White Mesh Nets
    this.drawHighResGoalPost(pitchX, midY - 60, true);
    this.drawHighResGoalPost(pitchX + pitchW, midY - 60, false);

    // Soccer Field Center Label
    this.drawSharpLabel(midX, midY + 44, '⚽ 숭실 천연잔디 축구장', {
      bgColor: 'rgba(21, 128, 61, 0.94)',
      borderColor: '#86efac',
      textColor: '#ffffff',
      fontSize: 13,
      paddingX: 12,
      height: 24
    });

    // 6. Right 1/3: BASKETBALL COURT (우레탄 농구장: x: 61 ~ 87, y: 6 ~ 26)
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

    // Basketball Court Markings (Pure White 2.5px)
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

    // Center Jump Circle (Radius: 60px)
    this.ctx.fillStyle = '#0369a1';
    this.ctx.beginPath();
    this.ctx.arc(bMidX, bMidY, 60, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Left Key (Paint area in fiery orange)
    const bKeyW = 6.5 * 32;
    const bKeyH = 6 * 32;
    const bKeyY = bMidY - bKeyH / 2;
    this.ctx.fillStyle = '#ea580c';
    this.ctx.fillRect(bCourtX, bKeyY, bKeyW, bKeyH);
    this.ctx.strokeRect(bCourtX, bKeyY, bKeyW, bKeyH);

    // Left Free-Throw Circle
    this.ctx.beginPath();
    this.ctx.arc(bCourtX + bKeyW, bMidY, bKeyH / 2, -Math.PI / 2, Math.PI / 2);
    this.ctx.stroke();

    // Left 3-Point Arc
    this.ctx.beginPath();
    this.ctx.arc(bCourtX + 32, bMidY, 150, -1.0, 1.0);
    this.ctx.stroke();

    // Right Key (Paint area in fiery orange)
    this.ctx.fillStyle = '#ea580c';
    this.ctx.fillRect(bCourtX + bCourtW - bKeyW, bKeyY, bKeyW, bKeyH);
    this.ctx.strokeRect(bCourtX + bCourtW - bKeyW, bKeyY, bKeyW, bKeyH);

    // Right Free-Throw Circle
    this.ctx.beginPath();
    this.ctx.arc(bCourtX + bCourtW - bKeyW, bMidY, bKeyH / 2, Math.PI / 2, Math.PI * 1.5);
    this.ctx.stroke();

    // Right 3-Point Arc
    this.ctx.beginPath();
    this.ctx.arc(bCourtX + bCourtW - 32, bMidY, 150, Math.PI - 1.0, Math.PI + 1.0);
    this.ctx.stroke();

    // High-Res Basketball Hoops
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

    // 7. Team Benches, Water Fountain, and Trees along Sidelines
    // Wood Benches
    this.drawHighResBench(28 * 32, 5 * 32 + 6);
    this.drawHighResBench(34 * 32, 5 * 32 + 6);
    this.drawHighResBench(70 * 32, 5 * 32 + 6);
    this.drawHighResBench(76 * 32, 5 * 32 + 6);

    // Drinking Fountain between fields (x: 59, y: 5)
    this.drawHighResDrinkingFountain(59 * 32 + 16, 5 * 32 + 10);

    // Perimeter Fence along Bottom Edge (ty === 27)
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 27 * 32 + 16);
    this.ctx.lineTo(mapW * 32, 27 * 32 + 16);
    this.ctx.stroke();

    for (let fx = 0; fx < mapW * 32; fx += 64) {
      this.ctx.fillStyle = '#64748b';
      this.ctx.fillRect(fx, 27 * 32, 4, 28);
    }

    // 8. Basketball Monsters (1:1 필드 몬스터)
    this.renderBasketballMonsters();
  }

  // 8. Basketball Monsters Rendering
  renderBasketballMonsters() {
    const pg = WORLD_DATA.playground;
    if (!pg || !pg.basketballMonsters) return;

    const now = Date.now();
    for (const mob of pg.basketballMonsters) {
      if (mob.defeated) {
        if (mob.respawnAt && now >= mob.respawnAt) {
          mob.defeated = false;
          mob.hp = mob.maxHp;
        } else {
          continue; // still defeated
        }
      }

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
      bronze: { blade: '#f2c14e', hi: '#fff1b8', shade: '#c27c0e', guard: '#7c2d12', hilt: '#3b1a08' }
    };
    const A = {
      wood: { base: '#b7791f', hi: '#d69e2e', shade: '#7b4f12', dark: '#5c3d0e' },
      leather: { base: '#854d0e', hi: '#a16207', shade: '#713f12', dark: '#451a03' },
      bronze: { base: '#d97706', hi: '#fcd34d', shade: '#92400e', dark: '#78350f' }
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
      const h = A[gear.helmet];
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
      const w = W[gear.weapon];
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
        const a = A[gear.armor];
        r(5, 12, 6, 5, a.base); r(5, 12, 6, 1, a.hi); r(5, 16, 6, 1, a.shade);
        if (gear.armor === 'wood') r(5, 14, 6, 1, a.shade);
        else { r(6, 13, 1, 1, a.hi); r(9, 13, 1, 1, a.hi); r(7, 14, 2, 1, a.hi); }
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
        const a = A[gear.armor];
        if (gear.armor === 'bronze') {
          r(1, 11, 4, 2, a.base); r(1, 11, 4, 1, a.hi);
          r(11, 11, 4, 2, a.base); r(11, 11, 4, 1, a.hi);
        } else {
          r(2, 11, 3, 2, a.dark); r(2, 11, 3, 1, a.base);
          r(11, 11, 3, 2, a.dark); r(11, 11, 3, 1, a.base);
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
      const a = A[gear.armor];
      r(5, 12, 4, 5, a.base); r(5, 12, 4, 1, a.hi); r(5, 16, 4, 1, a.shade);
      if (gear.armor === 'wood') r(5, 14, 4, 1, a.shade);
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
      const a = A[gear.armor];
      if (gear.armor === 'bronze') { r(6, 11, 4, 2, a.base); r(6, 11, 4, 1, a.hi); }
      else { r(6, 11, 3, 2, a.dark); r(6, 11, 3, 1, a.base); }
    }

    // Weapon pointing forward (전방 겨누기)
    if (gear.weapon) {
      const w = W[gear.weapon];
      r(hx - 7, 16, 6, 1, w.hi); r(hx - 7, 17, 6, 1, w.blade);
      r(hx - 8, 17, 1, 1, w.blade); r(hx - 3, 17, 2, 1, w.shade);
      r(hx - 1, 15, 1, 4, w.guard);
      r(hx, 16, 2, 1, w.hilt); r(hx + 2, 17, 1, 1, w.guard);
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

    // 2배 크기 렌더링 (24x32 -> 48x64)
    const SCALE = 2.0;
    const drawW = Math.round(24 * SCALE);
    const drawH = Math.round(32 * SCALE);
    const drawX = Math.round(px + 12 - drawW / 2); // 가로 중앙 정렬
    const drawY = Math.round(py + 29 - 27 * SCALE); // 발끝 위치(py+29)에 정확히 착지

    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;
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
      this.ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
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

      this.ctx.drawImage(sprite, drawX, drawY, drawW, drawH);
    }
    this.ctx.restore();

    // Nameplate & Crown (2배 캐릭터 높이에 맞춰 머리 위로 배치)
    const name = p.name || '학생';
    const plateY = py - 32;
    const displayName = isFallen ? `💀 [기절] ${name}` : name;

    this.drawSharpLabel(px + 12, plateY, displayName, {
      bgColor: isFallen ? 'rgba(153, 27, 27, 0.96)' : (isTeacher ? 'rgba(180, 83, 9, 0.96)' : (isLocal ? 'rgba(185, 28, 28, 0.96)' : 'rgba(15, 23, 42, 0.92)')),
      borderColor: isFallen ? '#f87171' : (isTeacher ? '#fde047' : (isLocal ? '#fca5a5' : '#94a3b8')),
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
}

window.GameEngine = GameEngine;
