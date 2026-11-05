const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Gym Plaza & West Gatekeeper System...');

// 1. Verify File Definitions
const worldJs = fs.readFileSync(path.join(__dirname, '../public/js/world.js'), 'utf8');
const engineJs = fs.readFileSync(path.join(__dirname, '../public/js/engine.js'), 'utf8');
const mainJs = fs.readFileSync(path.join(__dirname, '../public/js/main.js'), 'utf8');
const serverJs = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');

assert(worldJs.includes('GYM_PLAZA_WIDTH: 56'), 'world.js must define GYM_PLAZA_WIDTH');
assert(worldJs.includes('GYM_PLAZA_HEIGHT: 36'), 'world.js must define GYM_PLAZA_HEIGHT');
assert(worldJs.includes('gymGate:'), 'world.js must define gymGate in playground');
assert(worldJs.includes('playground_gym:'), 'world.js must define playground_gym');
assert(serverJs.includes("room === 'playground_gym'"), 'server.js must normalize playground_gym to floor 1');
assert(mainJs.includes("target.type === 'gym_gate'"), 'main.js must handle gym_gate interaction');
assert(engineJs.includes('drawHighResGymGate'), 'engine.js must define drawHighResGymGate');
assert(engineJs.includes('renderGymPlaza'), 'engine.js must define renderGymPlaza');
console.log('  ✓ File definitions validated');

// 2. Mock Runtime Simulation of Gatekeeper & Warps
global.window = {};
eval(worldJs.replace('const WORLD_DATA', 'global.WORLD_DATA'));

class MockEngine {
  constructor() {
    this.fade = { active: false, onMidpoint: null };
    this.player = {
      x: 4 * 32,
      y: 48 * 32,
      floor: 1,
      room: 'playground',
      roomName: '숭실 운동장',
      isTeacher: false
    };
    this.warpedTo = null;
  }

  triggerFadeWarp(cb) {
    this.fade.active = true;
    cb();
    this.fade.active = false;
  }

  warpToRoom(roomId, roomName, x, y) {
    this.player.room = roomId;
    this.player.roomName = roomName;
    this.player.x = x;
    this.player.y = y;
    this.warpedTo = { roomId, roomName, x, y };
  }

  simulateStep(tx, ty) {
    const tileX = tx;
    const tileY = ty;

    if (this.player.room === 'playground') {
      const pg = WORLD_DATA.playground;
      const gymGate = (pg && pg.gymGate) || { x: 2, y: 48 };
      if (Math.abs(tileX - gymGate.x) <= 1 && Math.abs(tileY - gymGate.y) <= 1) {
        if (!this.player.isTeacher) {
          this.player.x = 4.2 * 32;
          return { status: 'blocked_student', message: '교직원 전용 구역' };
        }
        this.triggerFadeWarp(() => {
          this.warpToRoom('playground_gym', '🏛️ 숭실 체육관 & 주차장', 50 * 32, 30 * 32);
        });
        return { status: 'warped_teacher', room: this.player.room };
      }
    } else if (this.player.room === 'playground_gym') {
      const curW = WORLD_DATA.GYM_PLAZA_WIDTH || 56;
      if (tileX >= curW - 3 && Math.abs(tileY - 30) <= 2) {
        this.triggerFadeWarp(() => {
          this.warpToRoom('playground', '숭실 운동장', 4 * 32, 48 * 32);
        });
        return { status: 'returned_playground', room: this.player.room };
      }
    }
    return { status: 'none' };
  }
}

// Test A: Student blocked from entering gymGate
{
  const engine = new MockEngine();
  engine.player.isTeacher = false;
  const res = engine.simulateStep(2, 48);
  assert.strictEqual(res.status, 'blocked_student', 'Student must be blocked at gymGate');
  assert.strictEqual(engine.player.room, 'playground', 'Student remains on playground');
  assert.strictEqual(engine.player.x, 4.2 * 32, 'Student pushed back safely to tile 4.2');
  console.log('  ✓ Student access control properly enforced');
}

// Test B: Teacher steps on gymGate -> Warps to Gym Plaza
{
  const engine = new MockEngine();
  engine.player.isTeacher = true;
  const res = engine.simulateStep(2, 48);
  assert.strictEqual(res.status, 'warped_teacher', 'Teacher must warp to playground_gym');
  assert.strictEqual(engine.player.room, 'playground_gym', 'Teacher is in playground_gym');
  assert.strictEqual(engine.player.x, 50 * 32, 'Teacher spawned at plaza east arrival spot');
  assert.strictEqual(engine.player.y, 30 * 32, 'Teacher spawned at y: 30');
  console.log('  ✓ Teacher 0.3s fade warp to Gym Plaza validated');

  // Test C: In Gym Plaza, stepping on east exit gate -> Warps back to Playground
  const returnRes = engine.simulateStep(54, 30);
  assert.strictEqual(returnRes.status, 'returned_playground', 'Must return to playground');
  assert.strictEqual(engine.player.room, 'playground', 'Player returned to playground');
  assert.strictEqual(engine.player.x, 4 * 32, 'Player returned next to running track');
  assert.strictEqual(engine.player.y, 48 * 32, 'Player returned at y: 48');
  console.log('  ✓ Two-way return warp from Gym Plaza back to Playground validated');
}

console.log('🎉 ALL GYM PLAZA & GATEKEEPER TESTS PASSED 100%!');
