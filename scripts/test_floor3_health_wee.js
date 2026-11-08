// scripts/test_floor3_health_wee.js
// Verification suite for Floor 3 (보건실 & Wee클래스)

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('======================================================');
console.log('🧪 TESTING FLOOR 3: HEALTH CARE ROOM & WEE CLASS (v=230)');
console.log('======================================================\n');

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

test('1. WORLD_DATA has floor 3 registered', () => {
  assert(WORLD_DATA.floors[3], 'WORLD_DATA.floors[3] should be defined');
  const f3 = WORLD_DATA.floors[3];
  assert(f3.name.includes('3층'), 'Name should mention 3층');
  assert(f3.name.includes('보건') && f3.name.includes('힐링'), 'Name should mention 보건 & 힐링');
});

test('2. Floor 3 hallway has doors to health room, wee class, and 3rd grade rooms', () => {
  const rooms = WORLD_DATA.floors[3].rooms;
  const healthDoor = rooms.find(d => d.id === 'room_health');
  assert(healthDoor, 'Health room door should exist');
  assert.strictEqual(healthDoor.doorX, 14);
  assert.strictEqual(healthDoor.doorY, 5);

  const weeDoor = rooms.find(d => d.id === 'room_wee');
  assert(weeDoor, 'Wee class door should exist');
  assert.strictEqual(weeDoor.doorX, 28);
  assert.strictEqual(weeDoor.doorY, 5);

  const room301 = rooms.find(d => d.id === 'room_301');
  const room302 = rooms.find(d => d.id === 'room_302');
  assert(room301 && room302, 'Locked 3rd grade doors should exist');
});

test('3. Floor 3 hallway has elevator and interactive hallway props', () => {
  const f3 = WORLD_DATA.floors[3];
  assert(f3.elevator, 'Elevator should exist on Floor 3');
  assert.strictEqual(f3.elevator.x, 56);
  assert.strictEqual(f3.elevator.y, 3);

  const props = f3.interactive;
  const hasHealthBoard = props.some(p => p.id === 'board_health_3');
  const hasWater = props.some(p => p.id === 'water_purifier_hallway_3');
  const hasMirror = props.some(p => p.id === 'mirror_hallway_3');
  const hasPlants = props.filter(p => p.id.startsWith('plant_hallway_3_')).length >= 2;
  const hasChargingBox = props.some(p => p.id === 'dibut_repair_box_3');

  assert(hasHealthBoard, 'Health bulletin board should exist in hallway');
  assert(hasWater, 'Water purifier should exist in hallway');
  assert(hasMirror, 'Mirror should exist in hallway');
  assert(hasPlants, 'At least 2 plants should exist in hallway');
  assert(hasChargingBox, 'Smart charging box should exist in hallway');
});

test('4. WORLD_DATA.classroom_health (보건실) is defined with all required entities', () => {
  assert(WORLD_DATA.classroom_health, 'classroom_health must be defined');
  const cr = WORLD_DATA.classroom_health;

  // Nurse NPC
  const nurse = cr.npcs.find(n => n.id === 'npc_nurse');
  assert(nurse, 'Nurse NPC should exist');
  assert(nurse.name.includes('보건 선생님') || nurse.name.includes('간호'));

  // Beds, Cabinet, Scale, Eye Chart
  const bed1 = cr.interactive.find(p => p.id === 'health_bed_1');
  const bed2 = cr.interactive.find(p => p.id === 'health_bed_2');
  const cabinet = cr.interactive.find(p => p.id === 'health_cabinet');
  const scale = cr.interactive.find(p => p.id === 'health_scale');
  const eyeChart = cr.interactive.find(p => p.id === 'health_eye_chart');

  assert(bed1 && bed2, 'Two recovery beds should exist');
  assert(cabinet, 'Medical cabinet should exist');
  assert(scale, 'Digital scale should exist');
  assert(eyeChart, 'Eye test chart should exist');

  // Exit door
  assert(cr.exitDoor && cr.exitDoor.x === 15 && cr.exitDoor.y === 17, 'Exit door to hallway must exist at (15, 17)');
});

test('5. WORLD_DATA.classroom_wee (Wee클래스) is defined with all required entities', () => {
  assert(WORLD_DATA.classroom_wee, 'classroom_wee must be defined');
  const cr = WORLD_DATA.classroom_wee;

  // Counselor NPC
  const counselor = cr.npcs.find(n => n.id === 'npc_counselor_wee');
  assert(counselor, 'Counselor NPC should exist');

  // Lounge, Tea Table, Mailbox, Emotion Board
  const lounge = cr.interactive.find(p => p.id === 'wee_cushion_lounge');
  const teaTable = cr.interactive.find(p => p.id === 'wee_tea_table');
  const mailbox = cr.interactive.find(p => p.id === 'wee_mailbox');
  const emotionBoard = cr.interactive.find(p => p.id === 'wee_emotion_board');

  assert(lounge, 'Cushion & Beanbag Lounge should exist');
  assert(teaTable, 'Herbal tea table should exist');
  assert(mailbox, 'Heart mailbox should exist');
  assert(emotionBoard, 'Emotion weather board should exist');

  // Exit door
  assert(cr.exitDoor && cr.exitDoor.x === 15 && cr.exitDoor.y === 17, 'Exit door to hallway must exist at (15, 17)');
});

// Load engine.js
eval(fs.readFileSync(path.join(__dirname, '../public/js/engine.js'), 'utf8'));

test('6. GameEngine correctly handles Floor 3 classroom mapping and teleportation', () => {
  const engine = new GameEngine(mockCanvas);
  // Bypass animation fade timer for unit testing
  engine.triggerFadeWarp = function(cb) { if (cb) cb(); };

  engine.player = { x: 100, y: 100, floor: 3, room: 'room_health' };

  const healthData = engine.getCurrentClassroomData();
  assert.strictEqual(healthData, WORLD_DATA.classroom_health, 'room_health maps to classroom_health');

  engine.player.room = 'room_wee';
  const weeData = engine.getCurrentClassroomData();
  assert.strictEqual(weeData, WORLD_DATA.classroom_wee, 'room_wee maps to classroom_wee');

  // Test teleportTo
  engine.teleportTo(3, 'hallway');
  assert.strictEqual(engine.player.floor, 3);
  assert.strictEqual(engine.player.room, 'hallway');

  engine.teleportTo(3, 'room_health');
  assert.strictEqual(engine.player.floor, 3);
  assert.strictEqual(engine.player.room, 'room_health');

  engine.teleportTo(3, 'room_wee');
  assert.strictEqual(engine.player.floor, 3);
  assert.strictEqual(engine.player.room, 'room_wee');
});

test('7. Collision detection respects obstacles in Health Room and Wee Class', () => {
  const engine = new GameEngine(mockCanvas);
  engine.player = { x: 0, y: 0, floor: 3, room: 'room_health' };

  // Bed 1 at tile (23, 6) -> (23*32, 6*32) -> (736, 192)
  assert(engine.checkCollision(736 + 10, 192 + 10), 'Inside Bed 1 should collide');
  // Walkway at tile (15, 12) -> (480, 384)
  assert(!engine.checkCollision(480, 384), 'Walkway in health room should be passable');

  // Wee Class: Counselor desk at tile (9, 6) -> (288, 192)
  engine.player.room = 'room_wee';
  assert(engine.checkCollision(288 + 10, 192 + 10), 'Counselor desk should collide');
  // Walkway at (15*32, 12*32) -> (480, 384)
  assert(!engine.checkCollision(480, 384), 'Walkway in wee class should be passable');
});

// Check main.js interaction handlers
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

test('11. All scripts in index.html are bumped to v=230', () => {
  const v230Matches = (indexHtml.match(/v=230/g) || []).length;
  const v229Matches = (indexHtml.match(/v=229/g) || []).length;
  assert(v230Matches >= 8, `Expected at least 8 v=230 tags, got ${v230Matches}`);
  assert.strictEqual(v229Matches, 0, `Expected 0 stale v=229 tags, got ${v229Matches}`);
});

console.log('\n------------------------------------------------------');
console.log(`Results: ${passedTests}/${totalTests} tests passed`);
console.log('------------------------------------------------------');

if (passedTests === totalTests) {
  console.log('🎉 ALL FLOOR 3 SUITE TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
} else {
  console.error(`💥 ${totalTests - passedTests} tests failed.`);
  process.exit(1);
}
