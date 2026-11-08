// scripts/test_floor3_health_wee.js
// Verification suite for Floor 3 (보건실 & Wee클래스 - 가로형 복도 & 20x20 독립공간) (v=235)

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('======================================================================');
console.log('🧪 TESTING FLOOR 3: HORIZONTAL CORRIDOR & 20x20 INDEPENDENT ROOMS (v=235)');
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

test('1. WORLD_DATA has floor 3 registered with horizontal hallway (width 60) and 20x20 room constants', () => {
  assert(WORLD_DATA.floors[3], 'WORLD_DATA.floors[3] should be defined');
  const f3 = WORLD_DATA.floors[3];
  assert(f3.name.includes('3층'), 'Name should mention 3층');
  assert(f3.name.includes('보건실') && f3.name.includes('Wee클래스'), 'Name should mention 보건실 & Wee클래스');
  assert.strictEqual(WORLD_DATA.HALLWAY_WIDTH, 60, 'HALLWAY_WIDTH should be 60');
  assert.strictEqual(WORLD_DATA.HEALTH_WEE_WIDTH, 20, 'HEALTH_WEE_WIDTH should be 20');
  assert.strictEqual(WORLD_DATA.HEALTH_WEE_HEIGHT, 20, 'HEALTH_WEE_HEIGHT should be 20');
});

test('2. Floor 3 hallway has ONLY doors to health room and wee class with generous spacing', () => {
  const rooms = WORLD_DATA.floors[3].rooms;
  assert.strictEqual(rooms.length, 2, 'Only 2 rooms should exist on Floor 3');

  const healthDoor = rooms.find(d => d.id === 'room_health');
  assert(healthDoor, 'Health room door should exist');
  assert.strictEqual(healthDoor.doorX, 18, 'Health door should be at x: 18');
  assert.strictEqual(healthDoor.doorY, 5, 'Health door should be at y: 5');

  const weeDoor = rooms.find(d => d.id === 'room_wee');
  assert(weeDoor, 'Wee class door should exist');
  assert.strictEqual(weeDoor.doorX, 36, 'Wee class door should be at x: 36');
  assert.strictEqual(weeDoor.doorY, 5, 'Wee class door should be at y: 5');

  const room301 = rooms.find(d => d.id === 'room_301');
  const room302 = rooms.find(d => d.id === 'room_302');
  assert(!room301 && !room302, '3rd grade rooms must be completely deleted');
});

test('3. Floor 3 hallway has elevator at x: 56 and water purifier at x: 48', () => {
  const f3 = WORLD_DATA.floors[3];
  assert.strictEqual(f3.elevator.x, 56, 'Elevator should be at x: 56');
  assert.strictEqual(f3.elevator.y, 3, 'Elevator should be at y: 3');

  assert.strictEqual(f3.interactive.length, 1, 'Only water purifier should exist');
  const purifier = f3.interactive[0];
  assert.strictEqual(purifier.id, 'water_purifier_hallway_3');
  assert.strictEqual(purifier.x, 48, 'Water purifier should be at x: 48');
  assert.strictEqual(purifier.y, 6, 'Water purifier should be at y: 6');
});

test('4. WORLD_DATA.classroom_health (보건실) is formatted as 20x20 independent room', () => {
  const cr = WORLD_DATA.classroom_health;
  assert(cr, 'classroom_health should exist');
  assert(cr.name.includes('보건실'), 'Name should mention 보건실');
  assert.strictEqual(cr.exitDoor.x, 10, 'Exit door x: 10');
  assert.strictEqual(cr.exitDoor.y, 17, 'Exit door y: 17');
  assert(cr.teacherDesk, 'Doctor desk should exist');
  assert(cr.npcs.some(n => n.id === 'npc_nurse'), 'Nurse NPC should exist');

  const beds = cr.interactive.filter(i => i.type === 'health_bed');
  assert.strictEqual(beds.length, 2, '2 recovery beds should exist');
});

test('5. WORLD_DATA.classroom_wee (Wee클래스) is formatted as 20x20 independent room', () => {
  const cr = WORLD_DATA.classroom_wee;
  assert(cr, 'classroom_wee should exist');
  assert(cr.name.includes('Wee클래스'), 'Name should mention Wee클래스');
  assert.strictEqual(cr.exitDoor.x, 10, 'Exit door x: 10');
  assert.strictEqual(cr.exitDoor.y, 17, 'Exit door y: 17');
  assert(cr.teacherDesk, 'Counselor desk should exist');
  assert(cr.npcs.some(n => n.id === 'npc_counselor_wee'), 'Counselor NPC should exist');

  const cushion = cr.interactive.find(i => i.id === 'wee_cushion_lounge');
  const tea = cr.interactive.find(i => i.id === 'wee_tea_table');
  const mail = cr.interactive.find(i => i.id === 'wee_mailbox');
  assert(cushion && tea && mail, 'Healing furniture should exist');
});

// Load engine.js
const engineCode = fs.readFileSync(path.join(__dirname, '../public/js/engine.js'), 'utf8');
eval(engineCode);

test('6. GameEngine correctly handles horizontal 3F hallway and 20x20 room dimensions', () => {
  const engine = new GameEngine(mockCanvas);
  engine.player.room = 'hallway';
  engine.player.floor = 3;
  assert.strictEqual(engine.getMapWidth(), 60, '3F hallway width should be 60');

  engine.player.room = 'room_health';
  assert.strictEqual(engine.getMapWidth(), 20, 'Health room width should be 20');
  assert.strictEqual(engine.getMapHeight(), 20, 'Health room height should be 20');

  engine.player.room = 'room_wee';
  assert.strictEqual(engine.getMapWidth(), 20, 'Wee room width should be 20');
  assert.strictEqual(engine.getMapHeight(), 20, 'Wee room height should be 20');
});

test('7. Collision detection respects horizontal hallway boundary, purifier at x: 48, and 20x20 room obstacles', () => {
  const engine = new GameEngine(mockCanvas);
  engine.player.room = 'hallway';
  engine.player.floor = 3;

  // Horizontal hallway width is 60: x: 20 is walkable
  assert(!engine.checkCollision(20 * 32, 6 * 32), 'Center hallway at x: 20 should be walkable');

  // Purifier at x: 48, y: 6 collides
  assert(engine.checkCollision(48 * 32, 6 * 32), 'Purifier at x: 48, y: 6 should collide');

  // East wall at x: 59 collides
  assert(engine.checkCollision(59 * 32, 6 * 32), 'East wall should collide');

  // Inside health room (20x20): bed 1 at x: 15, y: 6 collides
  engine.player.room = 'room_health';
  assert(engine.checkCollision(15 * 32, 6 * 32), 'Bed 1 at x: 15, y: 6 should collide');
});

test('8. main.js defines all required interaction methods for Health Room and Wee Class', () => {
  const mainCode = fs.readFileSync(path.join(__dirname, '../public/js/main.js'), 'utf8');
  assert(mainCode.includes('handleHealthBedInteraction'), 'handleHealthBedInteraction should exist');
  assert(mainCode.includes('handleHealthCabinetInteraction'), 'handleHealthCabinetInteraction should exist');
  assert(mainCode.includes('handleHealthScaleInteraction'), 'handleHealthScaleInteraction should exist');
  assert(mainCode.includes('handleHealthEyeChartInteraction'), 'handleHealthEyeChartInteraction should exist');
  assert(mainCode.includes('handleWeeCushionInteraction'), 'handleWeeCushionInteraction should exist');
  assert(mainCode.includes('handleWeeTeaTableInteraction'), 'handleWeeTeaTableInteraction should exist');
  assert(mainCode.includes('handleWeeMailboxInteraction'), 'handleWeeMailboxInteraction should exist');
  assert(mainCode.includes('handleWeeEmotionBoardInteraction'), 'handleWeeEmotionBoardInteraction should exist');
});

test('9. index.html contains 3F elevator, teleport, and GM warp entries with v=235 cache buster', () => {
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  assert(html.includes('data-target="floor_3"'), 'Elevator floor 3 button should exist');
  assert(html.includes('3층 복도 (보건실 & Wee클래스)'), '3F elevator option should mention 보건실 & Wee클래스');
  const countV234 = (html.match(/v=235/g) || []).length;
  assert(countV234 >= 8, `Expected at least 8 v=235 tags, got ${countV234}`);
});

console.log(`\n----------------------------------------------------------------------`);
console.log(`Results: ${passedTests}/${totalTests} tests passed`);
console.log(`----------------------------------------------------------------------`);

if (passedTests !== totalTests) {
  process.exit(1);
}
