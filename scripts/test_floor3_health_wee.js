// scripts/test_floor3_health_wee.js
// Verification suite for Floor 3 (보건실 & Wee클래스 - 12타일 콤팩트 복도 & 20x20 독립공간)

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('======================================================================');
console.log('🧪 TESTING FLOOR 3: 12-TILE CORRIDOR & 20x20 INDEPENDENT ROOMS (v=233)');
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

// Mock browser environment
const createMockCtx = () => ({
  save: () => {},
  restore: () => {},
  beginPath: () => {},
  closePath: () => {},
  arc: () => {},
  rect: () => {},
  fillRect: () => {},
  strokeRect: () => {},
  stroke: () => {},
  fill: () => {},
  moveTo: () => {},
  lineTo: () => {},
  measureText: () => ({ width: 40 }),
  fillText: () => {},
  setLineDash: () => {},
  createLinearGradient: () => ({ addColorStop: () => {} }),
  createRadialGradient: () => ({ addColorStop: () => {} }),
  quadraticCurveTo: () => {},
  bezierCurveTo: () => {},
  roundRect: () => {}
});

const mockCanvas = {
  width: 1024,
  height: 768,
  getContext: () => createMockCtx(),
  addEventListener: () => {},
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 1024, height: 768 }),
  style: {}
};

global.window = {};
global.document = {
  getElementById: () => mockCanvas,
  createElement: () => mockCanvas,
  addEventListener: () => {}
};

// Load world.js
eval(fs.readFileSync(path.join(__dirname, '../public/js/world.js'), 'utf8'));
const WORLD_DATA = window.WORLD_DATA;
global.WORLD_DATA = WORLD_DATA;

test('1. WORLD_DATA has floor 3 registered with 12-tile width and 20x20 room constants', () => {
  assert(WORLD_DATA.floors[3], 'WORLD_DATA.floors[3] should be defined');
  const f3 = WORLD_DATA.floors[3];
  assert(f3.name.includes('3층'), 'Name should mention 3층');
  assert(f3.name.includes('보건') && f3.name.includes('힐링'), 'Name should mention 보건 & 힐링');
  assert.strictEqual(WORLD_DATA.FLOOR_3_HALLWAY_WIDTH, 12, 'FLOOR_3_HALLWAY_WIDTH should be 12');
  assert.strictEqual(WORLD_DATA.HEALTH_WEE_WIDTH, 20, 'HEALTH_WEE_WIDTH should be 20');
  assert.strictEqual(WORLD_DATA.HEALTH_WEE_HEIGHT, 20, 'HEALTH_WEE_HEIGHT should be 20');
});

test('2. Floor 3 hallway has ONLY doors to health room and wee class (3학년 교실 삭제)', () => {
  const rooms = WORLD_DATA.floors[3].rooms;
  assert.strictEqual(rooms.length, 2, 'Only 2 rooms should exist on Floor 3');

  const healthDoor = rooms.find(d => d.id === 'room_health');
  assert(healthDoor, 'Health room door should exist');
  assert.strictEqual(healthDoor.doorX, 3, 'Health door should be at x: 3');
  assert.strictEqual(healthDoor.doorY, 5, 'Health door should be at y: 5');

  const weeDoor = rooms.find(d => d.id === 'room_wee');
  assert(weeDoor, 'Wee class door should exist');
  assert.strictEqual(weeDoor.doorX, 6, 'Wee class door should be at x: 6');
  assert.strictEqual(weeDoor.doorY, 5, 'Wee class door should be at y: 5');

  const room301 = rooms.find(d => d.id === 'room_301');
  const room302 = rooms.find(d => d.id === 'room_302');
  assert(!room301 && !room302, '3rd grade rooms must be completely deleted');
});

test('3. Floor 3 hallway has elevator at x: 9 and ONLY water purifier (other amenities deleted)', () => {
  const f3 = WORLD_DATA.floors[3];
  assert(f3.elevator, 'Elevator should exist on Floor 3');
  assert.strictEqual(f3.elevator.x, 9, 'Elevator should be at x: 9');
  assert.strictEqual(f3.elevator.y, 3, 'Elevator should be at y: 3');

  const props = f3.interactive;
  assert.strictEqual(props.length, 1, 'Only water purifier should remain in hallway');
  assert.strictEqual(props[0].id, 'water_purifier_hallway_3', 'Prop should be water purifier');
  assert.strictEqual(props[0].x, 1, 'Purifier should be at x: 1');
  assert.strictEqual(props[0].y, 7, 'Purifier should be at y: 7');
});

test('4. WORLD_DATA.classroom_health (보건실) is formatted as 20x20 independent room', () => {
  assert(WORLD_DATA.classroom_health, 'classroom_health must be defined');
  const cr = WORLD_DATA.classroom_health;

  // Nurse NPC at (6, 5), Desk at (6, 6)
  const nurse = cr.npcs.find(n => n.id === 'npc_nurse');
  assert(nurse && nurse.x === 6 && nurse.y === 5, 'Nurse NPC should be at (6, 5)');
  assert(cr.teacherDesk && cr.teacherDesk.x === 6 && cr.teacherDesk.y === 6, 'Teacher desk at (6, 6)');

  // Beds at (15, 6) and (15, 11)
  const bed1 = cr.interactive.find(p => p.id === 'health_bed_1');
  const bed2 = cr.interactive.find(p => p.id === 'health_bed_2');
  assert(bed1 && bed1.x === 15 && bed1.y === 6, 'Bed 1 at (15, 6)');
  assert(bed2 && bed2.x === 15 && bed2.y === 11, 'Bed 2 at (15, 11)');

  // Cabinet at (10, 4)
  const cabinet = cr.interactive.find(p => p.id === 'health_cabinet');
  assert(cabinet && cabinet.x === 10 && cabinet.y === 4, 'Cabinet at (10, 4)');

  // Scale and eye chart at x: 3
  const scale = cr.interactive.find(p => p.id === 'health_scale');
  const eyeChart = cr.interactive.find(p => p.id === 'health_eye_chart');
  assert(scale && scale.x === 3 && scale.y === 6, 'Scale at (3, 6)');
  assert(eyeChart && eyeChart.x === 3 && eyeChart.y === 11, 'Eye chart at (3, 11)');

  // Exit door at center (10, 17)
  assert(cr.exitDoor && cr.exitDoor.x === 10 && cr.exitDoor.y === 17, 'Exit door to hallway must be at (10, 17)');
});

test('5. WORLD_DATA.classroom_wee (Wee클래스) is formatted as 20x20 independent room', () => {
  assert(WORLD_DATA.classroom_wee, 'classroom_wee must be defined');
  const cr = WORLD_DATA.classroom_wee;

  // Counselor NPC at (6, 5), Desk at (6, 6)
  const counselor = cr.npcs.find(n => n.id === 'npc_counselor_wee');
  assert(counselor && counselor.x === 6 && counselor.y === 5, 'Counselor NPC at (6, 5)');
  assert(cr.teacherDesk && cr.teacherDesk.x === 6 && cr.teacherDesk.y === 6, 'Counselor desk at (6, 6)');

  // Lounge and tea table at x: 15
  const lounge = cr.interactive.find(p => p.id === 'wee_cushion_lounge');
  const teaTable = cr.interactive.find(p => p.id === 'wee_tea_table');
  assert(lounge && lounge.x === 15 && lounge.y === 6, 'Lounge at (15, 6)');
  assert(teaTable && teaTable.x === 15 && teaTable.y === 11, 'Tea table at (15, 11)');

  // Mailbox and emotion board at x: 3
  const mailbox = cr.interactive.find(p => p.id === 'wee_mailbox');
  const emotionBoard = cr.interactive.find(p => p.id === 'wee_emotion_board');
  assert(mailbox && mailbox.x === 3 && mailbox.y === 6, 'Mailbox at (3, 6)');
  assert(emotionBoard && emotionBoard.x === 3 && emotionBoard.y === 11, 'Emotion board at (3, 11)');

  // Exit door at center (10, 17)
  assert(cr.exitDoor && cr.exitDoor.x === 10 && cr.exitDoor.y === 17, 'Exit door to hallway must be at (10, 17)');
});

// Load engine.js
eval(fs.readFileSync(path.join(__dirname, '../public/js/engine.js'), 'utf8'));

test('6. GameEngine correctly handles 12-tile 3F hallway and 20x20 room dimensions', () => {
  const engine = new GameEngine(mockCanvas);
  engine.triggerFadeWarp = function(cb) { if (cb) cb(); };

  // 3F hallway dimensions
  engine.player = { x: 100, y: 100, floor: 3, room: 'hallway' };
  assert.strictEqual(engine.getMapWidth(), 12, '3F hallway width should be 12');
  assert.strictEqual(engine.getMapHeight(), 20, '3F hallway height should be 20');

  // Health room dimensions
  engine.player.room = 'room_health';
  assert.strictEqual(engine.getMapWidth(), 20, 'Health room width should be 20');
  assert.strictEqual(engine.getMapHeight(), 20, 'Health room height should be 20');

  // Wee class dimensions
  engine.player.room = 'room_wee';
  assert.strictEqual(engine.getMapWidth(), 20, 'Wee class width should be 20');
  assert.strictEqual(engine.getMapHeight(), 20, 'Wee class height should be 20');

  // Teleportation coordinates
  engine.teleportTo(3, 'hallway');
  assert.strictEqual(engine.player.floor, 3);
  assert.strictEqual(engine.player.x, 9 * 32, 'Hallway spawn in front of elevator at x: 9');
  assert.strictEqual(engine.player.y, 6 * 32, 'Hallway spawn in front of elevator at y: 6');

  engine.teleportTo(3, 'room_health');
  assert.strictEqual(engine.player.x, 10 * 32, 'Health room spawn at center x: 10');
  assert.strictEqual(engine.player.y, 15 * 32, 'Health room spawn above exit door at y: 15');

  engine.teleportTo(3, 'room_wee');
  assert.strictEqual(engine.player.x, 10 * 32, 'Wee class spawn at center x: 10');
  assert.strictEqual(engine.player.y, 15 * 32, 'Wee class spawn above exit door at y: 15');
});

test('7. Collision detection respects 12-tile hallway boundary, purifier, and 20x20 room obstacles', () => {
  const engine = new GameEngine(mockCanvas);
  engine.player = { x: 0, y: 0, floor: 3, room: 'hallway' };

  // Hallway bounds: tile 0 and tile 11 are solid walls
  assert(engine.checkCollision(0 * 32 + 10, 8 * 32 + 10), 'West wall at x: 0 should collide');
  assert(engine.checkCollision(11 * 32 + 10, 8 * 32 + 10), 'East wall at x: 11 should collide');
  assert(!engine.checkCollision(5 * 32 + 10, 8 * 32 + 10), 'Center hallway at x: 5 should be passable');

  // Purifier at (1, 7)
  assert(engine.checkCollision(1 * 32 + 10, 7 * 32 + 10), 'Purifier at (1, 7) should collide');

  // Health Room obstacles
  engine.player.room = 'room_health';
  assert(engine.checkCollision(15 * 32 + 10, 6 * 32 + 10), 'Bed 1 at (15, 6) should collide');
  assert(engine.checkCollision(6 * 32 + 10, 6 * 32 + 10), 'Nurse desk at (6, 6) should collide');
  assert(!engine.checkCollision(10 * 32 + 10, 10 * 32 + 10), 'Center aisle at (10, 10) should be passable');

  // Wee Class obstacles
  engine.player.room = 'room_wee';
  assert(engine.checkCollision(6 * 32 + 10, 6 * 32 + 10), 'Counselor desk at (6, 6) should collide');
  assert(engine.checkCollision(15 * 32 + 10, 6 * 32 + 10), 'Lounge at (15, 6) should collide');
  assert(!engine.checkCollision(10 * 32 + 10, 10 * 32 + 10), 'Center aisle at (10, 10) should be passable');
});

// Check main.js interaction handlers & routing
const mainJs = fs.readFileSync(path.join(__dirname, '../public/js/main.js'), 'utf8');

test('8. main.js defines all required interaction methods for Health Room and Wee Class', () => {
  const requiredMethods = [
    'handleHealthBedInteraction',
    'handleHealthCabinetInteraction',
    'handleHealthScaleInteraction',
    'handleHealthEyeChartInteraction',
    'handleHealthBoardInteraction',
    'handleNurseInteraction',
    'openNurseQuiz',
    'handleWeeCushionInteraction',
    'handleWeeTeaTableInteraction',
    'handleWeeMailboxInteraction',
    'handleWeeEmotionBoardInteraction',
    'handleWeeCounselorInteraction'
  ];

  requiredMethods.forEach(method => {
    assert(mainJs.includes(method), `main.js should contain ${method}`);
  });
});

test('9. Health bed restores 100% HP and cures fallen state', () => {
  assert(mainJs.includes('this.playerData.hp = this.playerData.maxHp;'), 'Bed sets hp to maxHp');
  assert(mainJs.includes('this.playerData.isFallen = false;'), 'Bed clears fallen state');
});

// Check index.html UI elements
const indexHtml = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');

test('10. index.html contains 3F elevator, teleport, and GM warp entries', () => {
  assert(indexHtml.includes('data-target="floor_3"'), 'Elevator/teleport floor_3 button must exist');
  assert(indexHtml.includes('🏥 3층 — 보건실 & Wee클래스'), 'Elevator 3F label must exist');
  assert(indexHtml.includes('🏥 3층 복도 (보건 & 힐링)'), 'Teleport 3F label must exist');
  assert(indexHtml.includes('value="3_hallway"'), 'GM warp 3_hallway option must exist');
  assert(indexHtml.includes('value="3_room_health"'), 'GM warp 3_room_health option must exist');
  assert(indexHtml.includes('value="3_room_wee"'), 'GM warp 3_room_wee option must exist');
});

test('11. All scripts in index.html are bumped to v=233', () => {
  const v231Matches = (indexHtml.match(/v=233/g) || []).length;
  const v230Matches = (indexHtml.match(/v=230/g) || []).length;
  assert(v231Matches >= 8, `Expected at least 8 v=233 tags, got ${v231Matches}`);
  assert.strictEqual(v230Matches, 0, `Expected 0 stale v=230 tags, got ${v230Matches}`);
});

console.log('\n----------------------------------------------------------------------');
console.log(`Results: ${passedTests}/${totalTests} tests passed`);
console.log('----------------------------------------------------------------------');

if (passedTests === totalTests) {
  console.log('🎉 ALL FLOOR 3 (12-TILE & 20x20) SUITE TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
} else {
  console.error(`💥 ${totalTests - passedTests} tests failed.`);
  process.exit(1);
}
