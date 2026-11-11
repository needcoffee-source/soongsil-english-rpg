// scripts/test_boss_scaling_and_floor3.js
// Verification suite for Boss Scaling (Bronze Dragon 1.5x, Final God 1.4x, Sloth 2.0x),
// Floor 3 Horizontally Long Hallway, and Golem Label ([1차 관문 보스] removed) (v=235)

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('======================================================================');
console.log('🧪 TESTING BOSS SCALING (1.5x, 1.4x, 2.0x), FLOOR 3 & GOLEM LABEL (v=235)');
console.log('======================================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.stack || err.message}`);
  }
}

// 1. Check world.js
const worldSrc = fs.readFileSync(path.join(__dirname, '../public/js/world.js'), 'utf8');
global.window = {};
eval(worldSrc);
const WORLD_DATA = window.WORLD_DATA;

test('1. Floor 3 is compact (width 30) and has well-spaced doors and elevator', () => {
  const f3 = WORLD_DATA.floors[3];
  assert(f3, 'floors[3] should exist');
  assert.strictEqual(f3.rooms.length, 2, 'Only 2 rooms on floor 3');
  
  const health = f3.rooms.find(r => r.id === 'room_health');
  assert(health, 'Health room should exist');
  assert.strictEqual(health.doorX, 8, 'Health room doorX should be 8');
  assert.strictEqual(health.doorY, 5, 'Health room doorY should be 5');

  const wee = f3.rooms.find(r => r.id === 'room_wee');
  assert(wee, 'Wee class should exist');
  assert.strictEqual(wee.doorX, 16, 'Wee class doorX should be 16');
  assert.strictEqual(wee.doorY, 5, 'Wee class doorY should be 5');

  assert.strictEqual(f3.elevator.x, 25, 'Floor 3 elevator should align at x: 25');
  assert.strictEqual(f3.elevator.y, 3, 'Floor 3 elevator y: 3');

  assert.strictEqual(f3.interactive.length, 1, 'Floor 3 water purifier exists');

  // Verify distance between doors
  assert(Math.abs(wee.doorX - health.doorX) >= 8, 'Doors should have 8 tiles spacing');
});

test('2. Independent 20x20 dimensions preserved for classroom_health and classroom_wee', () => {
  assert.strictEqual(WORLD_DATA.HEALTH_WEE_WIDTH, 20);
  assert.strictEqual(WORLD_DATA.HEALTH_WEE_HEIGHT, 20);
  assert(WORLD_DATA.classroom_health, 'classroom_health exists');
  assert(WORLD_DATA.classroom_wee, 'classroom_wee exists');
});

// 2. Check engine.js code directly
const engineSrc = fs.readFileSync(path.join(__dirname, '../public/js/engine.js'), 'utf8');

test('3. Floor 3 hallway width check returns default width 60 (FLOOR_3_HALLWAY_WIDTH override removed)', () => {
  assert(!engineSrc.includes('WORLD_DATA.FLOOR_3_HALLWAY_WIDTH'), 'FLOOR_3_HALLWAY_WIDTH override should be removed');
});

test('4. Floor 3 healing banner is completely removed from engine rendering', () => {
  assert(!engineSrc.includes('🏥 3층: 건강과 마음 힐링 구역 (Health & Healing)'), '3F banner must not be drawn');
});

test('5. Leather Golem nameplate has [1차 관문 보스] removed', () => {
  assert(!engineSrc.includes('[1차 관문 보스]'), 'Golem label must not contain [1차 관문 보스]');
  assert(!engineSrc.includes('⏳ [1차 관문 보스]'), 'Hourglass tag must not be on Golem');
  assert(engineSrc.includes('drawHighResBossGolem'), 'drawHighResBossGolem exists');
});

test('6. Ancient Bronze Dragon is scaled 1.5x in drawHighResBossDragon', () => {
  assert(engineSrc.includes('this.ctx.scale(1.5, 1.5)'), 'Dragon must have 1.5x scale');
  assert(engineSrc.includes('// 1.5x Scale for Ancient Bronze Dragon'), 'Dragon 1.5x comment present');
  assert(engineSrc.includes('py - 95'), 'Dragon nameplate shifted up to py - 95');
});

test('7. Final Exam God of Ruin is scaled 1.4x in drawHighResBossFinalGod', () => {
  assert(engineSrc.includes('this.ctx.scale(1.4, 1.4)'), 'Final God must have 1.4x scale');
  assert(engineSrc.includes('// 1.4x Scale for Final Exam God of Ruin'), 'Final God 1.4x comment present');
  assert(engineSrc.includes('py - 105'), 'Final God nameplate shifted up to py - 105');
});

test('8. Sloth Titan (나태신) is scaled 2.0x in drawHighResBossSlothTitan', () => {
  assert(engineSrc.includes('this.ctx.scale(2.0, 2.0)'), 'Sloth Titan must have 2.0x scale');
  assert(engineSrc.includes('// 2.0x Scale for God of Sloth / Sloth Titan'), 'Sloth 2.0x comment present');
  assert(engineSrc.includes('py - 66'), 'Sloth Titan nameplate positioned at py - 66');
});

test('9. drawSoccerBossArena dynamically scales magic circle and prompt offset', () => {
  assert(engineSrc.includes('arenaRadius = 126'), 'Sloth 2x arena radius 126');
  assert(engineSrc.includes('arenaRadius = 104'), 'Dragon 1.5x arena radius 104');
  assert(engineSrc.includes('arenaRadius = 96'), 'Final God 1.4x arena radius 96');
  assert(engineSrc.includes('promptOffsetY = 88'), 'Sloth prompt offset 88');
  assert(engineSrc.includes('promptOffsetY = 82'), 'Dragon prompt offset 82');
  assert(engineSrc.includes('promptOffsetY = 74'), 'Final God prompt offset 74');
});

test('10. Soccer boss interaction distance increased to 96 to match larger boss scales', () => {
  assert(engineSrc.includes('bDist < 96 && bDist < minDist'), 'Inspection distance < 96');
  assert(engineSrc.includes('Math.hypot(soccerBossObj.x * 32 - x, (soccerBossObj.y + 0.5) * 32 - y) < 96'), 'Interact distance < 96');
});

// 3. Check index.html and main.js
const htmlSrc = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
const mainSrc = fs.readFileSync(path.join(__dirname, '../public/js/main.js'), 'utf8');

test('11. Cache buster applied and elevator travels to x: 25 on floor 3', () => {
  assert(/\?v=\d+/.test(htmlSrc), 'Cache buster in index.html');
  assert(mainSrc.includes("25 * 32, 6 * 32"), 'Elevator warps to 25 * 32 on floor 3');
});

console.log(`\n======================================================================`);
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log(`======================================================================`);

if (passedTests !== totalTests) {
  process.exit(1);
}
