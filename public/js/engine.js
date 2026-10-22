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
    if (!this.player.hasRunningShoes) {
      this.player.isDashing = false;
      this.player.speed = 3.8;
      return;
    }
    this.player.isDashing = isDashing;
    this.player.speed = isDashing ? 5.8 : 3.8;
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
    this.camera.x = Math.max(0, Math.min(WORLD_DATA.MAP_WIDTH * 32 - this.width, this.player.x - this.width / 2));
    this.camera.y = Math.max(0, Math.min(WORLD_DATA.MAP_HEIGHT * 32 - this.height, this.player.y - this.height / 2));
  }

  checkCollision(x, y) {
    // Teacher Noclip (공간돌파 무적 벽통과)
    if (this.player.noclip) return false;

    const tileX = Math.floor(x / 32);
    const tileY = Math.floor(y / 32);

    // Map bounds
    if (tileX < 1 || tileX >= WORLD_DATA.MAP_WIDTH - 1) return true;
    if (tileY < 1) return true;

    if (this.player.room === 'hallway') {
      if (tileY >= WORLD_DATA.MAP_HEIGHT - 1) return true;
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
    } else {
      // Exit classroom when stepping on exit door area
      const exit = WORLD_DATA.classroom.exitDoor;
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
      this.player.room = room || 'hallway';
      if (this.player.room === 'hallway') {
        this.player.x = 15 * 32;
        this.player.y = 10 * 32;
        this.player.roomName = WORLD_DATA.floors[this.player.floor] ? WORLD_DATA.floors[this.player.floor].name : `${this.player.floor}층 복도`;
      } else {
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
        // Central Elevator
        if (floorData.elevator) {
          const eDist = Math.hypot(floorData.elevator.x * 32 - this.player.x, floorData.elevator.y * 32 - this.player.y);
          if (eDist < minDist) {
            closest = { type: 'elevator', name: '중앙 엘리베이터', prompt: '엘리베이터 타기 (A 버튼)' };
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
    } else {
      // Inside Classroom (room_701: 노가다 채집장 / room_702: 보스 레이드)
      const cr = this.getCurrentClassroomData();
      if (cr.blackboard) {
        const bDist = Math.hypot(cr.blackboard.x * 32 - this.player.x, cr.blackboard.y * 32 - this.player.y);
        if (bDist < 72) {
          closest = { type: 'board', data: cr.blackboard, name: cr.blackboard.name, prompt: cr.blackboard.prompt };
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
        closest = { type: 'exit', name: '복도 출구', prompt: '복도로 나가기 (A 버튼)' };
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
        if (floorData.elevator && Math.hypot(floorData.elevator.x * 32 - x, floorData.elevator.y * 32 - y) < 40) {
          return { type: 'elevator', name: '중앙 엘리베이터' };
        }
      }
    } else {
      const cr = this.getCurrentClassroomData();
      if (Math.hypot(cr.exitDoor.x * 32 - x, cr.exitDoor.y * 32 - y) < 48) {
        return { type: 'exit' };
      }
      if (cr.blackboard && Math.hypot(cr.blackboard.x * 32 - x, cr.blackboard.y * 32 - y) < 60) {
        return { type: 'board', data: cr.blackboard, name: cr.blackboard.name };
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
    }
    return null;
  }

  interact() {
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
    this.drawSharpLabel(dx + dw / 2, dy + 22, '교탁', {
      bgColor: 'rgba(28, 25, 23, 0.92)',
      borderColor: '#f59e0b',
      textColor: '#ffffff',
      fontSize: 11.5,
      paddingX: 8,
      height: 18
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

    // Trophy Icon & Gold Header
    this.ctx.font = '16px sans-serif';
    this.ctx.fillText('🏆', px + 9, py + 26);

    this.ctx.fillStyle = '#fef08a';
    this.ctx.font = 'bold 10px "Noto Sans KR", sans-serif';
    this.ctx.fillText('TOP 5', px + 28, py + 18);

    this.ctx.fillStyle = '#a7f3d0';
    this.ctx.font = 'bold 8px "Noto Sans KR", sans-serif';
    this.ctx.fillText('RANKING', px + 26, py + 29);

    // Chalk tray with chalk sticks
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(px + 4, py + h - 4, w - 8, 4);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px + 12, py + h - 3, 6, 2);
    this.ctx.fillStyle = '#fde047';
    this.ctx.fillRect(px + 22, py + h - 3, 5, 2);

    this.drawSharpLabel(px + w / 2, py + h + 16, '🏆 실시간 랭킹보드', {
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

  // 14. High-Res Stainless Steel Elevator with Floor LED Indicator
  drawHighResElevator(el, currentFloor = 7) {
    const px = el.x * 32 - 4;
    const py = el.y * 32 - 12;
    const w = 40;
    const h = 44;

    // Floor shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(px, py + h, w, 4);

    // Outer Stainless Steel Frame
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(px, py, w, h);
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(px + 2, py + 2, w - 4, h - 2);

    // Digital Floor Indicator Panel (Black glass with red LED)
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(px + 8, py + 4, w - 16, 10);
    this.ctx.fillStyle = '#ef4444';
    this.ctx.font = 'bold 9px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`[ ${currentFloor}F ▲ ]`, px + w / 2, py + 12);

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

    // Label
    this.drawSharpLabel(px + w / 2, py + h + 14, '🛗 엘리베이터', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#94a3b8',
      textColor: '#ffffff',
      fontSize: 11.5,
      paddingX: 9,
      height: 20
    });
  }

  // ========================================================
  // SCENE RENDERING: HALLWAY (복도)
  // ========================================================
  renderHallway() {
    const fData = WORLD_DATA.floors[this.player.floor];

    // 1. Base Flooring & Walls
    for (let tx = 0; tx < WORLD_DATA.MAP_WIDTH; tx++) {
      for (let ty = 0; ty < WORLD_DATA.MAP_HEIGHT; ty++) {
        if (ty <= 3 || tx === 0 || tx === WORLD_DATA.MAP_WIDTH - 1 || ty === WORLD_DATA.MAP_HEIGHT - 1) {
          this.drawHighResWall(tx, ty, false);
        } else {
          this.drawHighResHallwayTile(tx, ty);
        }
      }
    }

    // 2. Sunny Windows along Top Wall (between classroom doors)
    const windowCols = [3, 6, 14, 16, 24, 27];
    windowCols.forEach(col => {
      // Don't draw window if there is a classroom door at this position
      const hasDoor = fData && fData.rooms && fData.rooms.some(r => Math.abs(r.doorX - col) <= 2);
      if (!hasDoor && col > 0 && col < WORLD_DATA.MAP_WIDTH - 1) {
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
        this.drawHighResBossGolem(cr.boss);
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

      this.ctx.fillStyle = npc.avatar === 'baird' ? '#854d0e' : (npc.avatar === 'teacher' ? '#1e3a8a' : '#047857');
      this.ctx.beginPath();
      this.ctx.arc(px + 16, py + 12, 10, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillRect(px + 8, py + 18, 16, 14);

      this.drawSharpLabel(px + 16, py - 11, `💬 ${npc.name}`, {
        bgColor: 'rgba(6, 78, 59, 0.95)',
        borderColor: '#34d399',
        textColor: '#fef08a',
        fontSize: 12.5,
        paddingX: 10,
        height: 21
      });
    }
  }

  // Draw Authentic Pokemon Red/Gold Trainer Sprite (Image 3)
  renderPlayer(p, isLocal = false) {
    const px = p.x;
    const py = p.y;
    const isTeacher = !!p.isTeacher;
    const isFallen = !!p.isFallen;

    this.ctx.save();
    if (isFallen) {
      this.ctx.globalAlpha = 0.55;
    }

    // Teacher Noclip Glowing Aura (Green pulse when 공간돌파 is active)
    if (isTeacher && p.noclip) {
      this.ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
      this.ctx.beginPath();
      this.ctx.arc(px + 12, py + 16, 22, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#34d399';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    }

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.beginPath();
    this.ctx.ellipse(px + 12, py + 27, 11, 5, 0, 0, Math.PI * 2);
    this.ctx.fill();

    const legOffset = (p.isMoving && p.animFrame % 2 === 1) ? 2 : 0;

    // Cap (Student: Red Cap, Teacher: Navy/Gold Academic Cap)
    this.ctx.fillStyle = isTeacher ? '#312e81' : '#dc2626';
    this.ctx.beginPath();
    this.ctx.arc(px + 12, py + 8, 8, Math.PI, 0, false);
    this.ctx.fill();

    // Cap visor
    this.ctx.fillStyle = isTeacher ? '#fbbf24' : '#ffffff';
    if (p.direction === 'down') {
      this.ctx.fillRect(px + 7, py + 7, 10, 3);
    } else if (p.direction === 'left') {
      this.ctx.fillRect(px + 4, py + 7, 7, 3);
    } else if (p.direction === 'right') {
      this.ctx.fillRect(px + 13, py + 7, 7, 3);
    } else {
      this.ctx.fillStyle = isTeacher ? '#1e1b4b' : '#b91c1c';
      this.ctx.fillRect(px + 8, py + 6, 8, 3);
    }

    // Black Hair
    this.ctx.fillStyle = '#1c1917';
    this.ctx.fillRect(px + 7, py + 10, 10, 4);

    // Trainer Jacket (Student: Red, Teacher: Elegant Indigo/Navy suit)
    this.ctx.fillStyle = isTeacher ? '#1e1b4b' : '#ef4444';
    this.ctx.fillRect(px + 6, py + 14, 12, 10);

    // Teacher Gold Necktie / Trim
    if (isTeacher) {
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.fillRect(px + 11, py + 14, 2, 8);
    }

    // Yellow Backpack (Teacher: Leather Satchel)
    this.ctx.fillStyle = isTeacher ? '#78350f' : '#eab308';
    if (p.direction === 'left') {
      this.ctx.fillRect(px + 16, py + 15, 4, 8);
    } else if (p.direction === 'right') {
      this.ctx.fillRect(px + 4, py + 15, 4, 8);
    } else if (p.direction === 'up') {
      this.ctx.fillRect(px + 8, py + 15, 8, 7);
    }

    // Blue Pants / Slacks
    this.ctx.fillStyle = isTeacher ? '#0f172a' : '#1e3a8a';
    this.ctx.fillRect(px + 7, py + 23, 4, 5 - legOffset);
    this.ctx.fillRect(px + 13, py + 23, 4, 5 + legOffset);

    // Shoes (Student: Red Sneakers, Teacher: Brown Leather Dress Shoes)
    this.ctx.fillStyle = isTeacher ? '#451a03' : '#dc2626';
    this.ctx.fillRect(px + 6, py + 27 - legOffset, 5, 3);
    this.ctx.fillRect(px + 13, py + 27 + legOffset, 5, 3);

    this.ctx.restore(); // restore alpha if fallen

    // Nameplate & Crown
    const name = p.name || '학생';
    const plateY = py - 12;
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
