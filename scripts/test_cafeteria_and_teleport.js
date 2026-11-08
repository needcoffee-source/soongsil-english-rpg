const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('=== TEST SUITE: Teleport Scroll, Meeting Room Barrier & Cafeteria Quest ===\n');

// Mock browser globals
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};

global.AudioManager = {
  playLevelUp: () => {},
  playSelect: () => {},
  playFanfare: () => {}
};
global.RPGDialog = {
  lastTitle: null,
  lastMsg: null,
  show: (title, msg) => {
    global.RPGDialog.lastTitle = title;
    global.RPGDialog.lastMsg = msg;
  }
};
const mockCtx = {
  save: () => {}, restore: () => {}, scale: () => {}, translate: () => {}, rotate: () => {},
  beginPath: () => {}, closePath: () => {}, moveTo: () => {}, lineTo: () => {},
  arc: () => {}, fill: () => {}, stroke: () => {}, fillRect: () => {}, strokeRect: () => {},
  fillText: () => {}, measureText: (txt) => ({ width: (txt || '').length * 8 }),
  ellipse: () => {}, setTransform: () => {}, resetTransform: () => {},
  createLinearGradient: () => ({ addColorStop: () => {} }),
  createRadialGradient: () => ({ addColorStop: () => {} }),
  drawImage: () => {}
};

global.document = {
  querySelector: () => ({
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    addEventListener: () => {},
    style: {},
    innerText: '',
    innerHTML: '',
    appendChild: () => {}
  }),
  querySelectorAll: () => [],
  getElementById: (id) => ({
    id,
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    },
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {},
    getContext: () => mockCtx,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
    width: 800,
    height: 600,
    style: {}
  }),
  addEventListener: () => {},
  createElement: () => ({ classList: { add: () => {} }, style: {}, appendChild: () => {}, addEventListener: () => {} }),
  body: { style: {} }
};
global.localStorage = {
  _store: {},
  getItem: (k) => global.localStorage._store[k] || null,
  setItem: (k, v) => { global.localStorage._store[k] = String(v); },
  removeItem: (k) => { delete global.localStorage._store[k]; }
};
global.alert = (msg) => { global._lastAlert = msg; };
global.confirm = () => true;

// 1. Load world.js
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../public/js/world.js'), 'utf8'));
assert(global.WORLD_DATA, 'WORLD_DATA must be defined');

// Verify safe_cafeteria_key in staff office interactive
const staffOffice = WORLD_DATA.classroom_staff_office;
assert(staffOffice, 'classroom_staff_office must exist');
const safeObj = staffOffice.interactive.find(i => i.type === 'cafeteria_key_safe');
assert(safeObj, 'safe_cafeteria_key must exist in classroom_staff_office.interactive');
assert.strictEqual(safeObj.x, 17, 'Safe x should be 17');
assert.strictEqual(safeObj.y, 6, 'Safe y should be 6 (center of conference table)');
console.log('✔ [1/5] WORLD_DATA interactive safe verified at (17, 6) in 소회의실');

// 2. Load engine.js
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../public/js/engine.js'), 'utf8'));
assert(global.GameEngine, 'GameEngine must be defined');

const canvas = document.getElementById('game-canvas');
const engine = new global.GameEngine(canvas);
engine.player = {
  x: 23 * 32,
  y: 12 * 32,
  room: 'room_staff_office',
  floor: 6,
  level: 5,
  isTeacher: false
};

// Test warpToRoom defensive mapping
engine.warpToRoom('playground_basketball', '농구장', 74 * 32, 16 * 32);
assert.strictEqual(engine.player.room, 'playground', 'warpToRoom should map playground_basketball to playground');
assert.strictEqual(engine.player.floor, 1, 'warpToRoom on playground should set floor to 1');
console.log('✔ [2/5] Engine warpToRoom defensive safeguard maps playground_* to playground');

// Test meeting room barrier in engine.js isCollision
engine.player.room = 'room_staff_office';
engine.player.x = 23 * 32;
engine.player.y = 12 * 32; // outside meeting room (y >= 11)
engine.player.level = 5; // Level < 12

// Attempt to step into meeting room (tx: 23, ty: 9)
const blockedForLowLevel = engine.checkCollision(23 * 32, 9 * 32);
assert.strictEqual(blockedForLowLevel, true, 'checkCollision should block Level 5 student from entering meeting room');

// Level 12 student stepping into meeting room
engine.player.level = 12;
const openForHighLevel = engine.checkCollision(23 * 32, 9 * 32);
assert.strictEqual(openForHighLevel, false, 'checkCollision should allow Level 12 student to enter meeting room doorway');

// Teacher stepping into meeting room even if level 1
engine.player.level = 1;
engine.player.isTeacher = true;
const openForTeacher = engine.checkCollision(23 * 32, 9 * 32);
assert.strictEqual(openForTeacher, false, 'checkCollision should allow teacher to enter meeting room');
console.log('✔ [3/5] Engine meeting room access control verified (Lv < 12 blocked, Lv >= 12 & Teacher allowed)');

// 3. Load other required scripts then main.js
const files = [
  'public/js/audio.js',
  'public/js/dialog.js',
  'public/js/quiz.js',
  'public/js/crafting.js',
  'public/js/network.js',
  'public/js/acid_rain.js',
  'public/js/brawl_ball.js',
  'public/js/main.js'
];
files.forEach(f => {
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../', f), 'utf8'));
});

// Spy on window.RPGDialog.show
if (window.RPGDialog && typeof window.RPGDialog.show === 'function') {
  const origShow = window.RPGDialog.show.bind(window.RPGDialog);
  window.RPGDialog.show = (title, msg, icon) => {
    window.RPGDialog.lastTitle = title;
    window.RPGDialog.lastMsg = msg;
    try { origShow(title, msg, icon); } catch (e) {}
  };
}

assert(ALL_GAME_ITEMS['item_cafeteria_key'], 'item_cafeteria_key must exist in main.js ALL_GAME_ITEMS');
assert(ITEM_CODEX_DATABASE.some(i => i.id === 'item_cafeteria_key'), 'item_cafeteria_key must exist in ITEM_CODEX_DATABASE');

const app = new MainApp();
app.engine = engine;
app.engine.triggerFadeWarp = (cb) => { if (cb) cb(); };
app.showToast = (msg, type) => { app._lastToast = { msg, type }; };
app.saveProgress = () => {};

// 4. Test Teleport Scroll executeTeleport
app.playerData.inventory = [
  { item: 'item_teleport_scroll', count: 5 }
];

// Test teleport to basketball court
app.executeTeleport('court_basketball');
assert.strictEqual(engine.player.room, 'playground', 'Basketball teleport must warp to room playground');
assert.strictEqual(engine.player.x, 74 * 32, 'Basketball x coordinate must be 74 * 32');
assert.strictEqual(engine.player.y, 16 * 32, 'Basketball y coordinate must be 16 * 32');

// Test teleport to futsal court
app.executeTeleport('court_futsal');
assert.strictEqual(engine.player.room, 'playground', 'Futsal teleport must warp to room playground');
assert.strictEqual(engine.player.x, 74 * 32, 'Futsal x coordinate must be 74 * 32');
assert.strictEqual(engine.player.y, 40 * 32, 'Futsal y coordinate must be 40 * 32');

// Test teleport to soccer field
app.executeTeleport('field_soccer');
assert.strictEqual(engine.player.room, 'playground', 'Soccer teleport must warp to room playground');
assert.strictEqual(engine.player.x, 31 * 32, 'Soccer x coordinate must be 31 * 32');
assert.strictEqual(engine.player.y, 35 * 32, 'Soccer y coordinate must be 35 * 32');

// Test teleport to 3rd floor hallway
app.executeTeleport('floor_3');
assert.strictEqual(engine.player.room, 'hallway', 'Floor 3 teleport must warp to room hallway');
assert.strictEqual(engine.player.floor, 3, 'Floor 3 teleport must set floor to 3');
assert.strictEqual(engine.player.x, 56 * 32, 'Floor 3 x coordinate must be 56 * 32 (elevator)');
assert.strictEqual(engine.player.y, 6 * 32, 'Floor 3 y coordinate must be 6 * 32');
assert(engine.player.roomName.includes('보건실 & Wee클래스'), 'Floor 3 roomName must include 보건실 & Wee클래스');

console.log('✔ [4/5] Teleport Scroll destinations verified (basketball, futsal, soccer, floor 3 hallway)');

// 5. Test 1897 Heritage Set Check & Cafeteria Key Safe Quest
app.playerData.level = 12;
app.playerData.isTeacher = false;
app.playerData.hasCafeteriaKey = false;
app.playerData.equipment = {
  helmet: null,
  armor: null,
  shoes: null,
  weapon: null,
  accessory: null
};

// Test when unequipped:
let check = app.is1897HeritageSetEquipped(true);
assert.strictEqual(check.isComplete, false, 'Un-equipped set should not be complete');

// Interaction with safe when not equipped
window.RPGDialog.lastMsg = null;
app.handleCafeteriaKeySafeInteraction();
assert(window.RPGDialog.lastMsg.includes('봉인된 문서 보관함'), 'Should show sealed safe prompt');
assert(!app.hasItem('item_cafeteria_key'), 'Should NOT grant key when unequipped');

// Equip standard 1897 set with sword
app.playerData.equipment.helmet = { item: 'equip_heritage_helmet' };
app.playerData.equipment.armor = { item: 'equip_heritage_armor' };
app.playerData.equipment.shoes = { item: 'equip_heritage_boots' };
app.playerData.equipment.weapon = { item: 'equip_heritage_blade' };

check = app.is1897HeritageSetEquipped(true);
assert.strictEqual(check.isComplete, true, '1897 blade set should be complete');
assert.strictEqual(check.weaponName, '1897 숭실 헤리티지 블레이드');

// Interact with safe with 1897 blade
app.handleCafeteriaKeySafeInteraction();
assert(app.hasItem('item_cafeteria_key'), 'Should grant item_cafeteria_key with full 1897 set');
assert.strictEqual(app.playerData.hasCafeteriaKey, true, 'hasCafeteriaKey flag should be set');
assert(window.RPGDialog.lastMsg.includes('결계 해제'), 'Should show seal broken success message');

// Test omr wand alternative weapon requirement
app.playerData.inventory = app.playerData.inventory.filter(i => i.item !== 'item_cafeteria_key');
app.playerData.hasCafeteriaKey = false;
app.playerData.equipment.weapon = { item: 'equip_omr_wand' }; // 대체 무기 컴싸봉!

check = app.is1897HeritageSetEquipped(true);
assert.strictEqual(check.isComplete, true, '1897 set with omr_wand should be complete');
assert.strictEqual(check.weaponName, '컴싸 마법봉');

app.handleCafeteriaKeySafeInteraction();
assert(app.hasItem('item_cafeteria_key'), 'Should grant item_cafeteria_key with omr_wand replacement weapon!');
assert(window.RPGDialog.lastMsg.includes('전설의 컴싸 마법봉'), 'Success message should mention 컴싸 마법봉');

// 6. Test Cafeteria Entrance
// Case A: Level < 12
app.playerData.level = 10;
window.RPGDialog.lastMsg = null;
app.handleCafeteriaEntranceInteraction();
assert(window.RPGDialog.lastMsg.includes('12레벨 이상부터 입장할 수 있습니다'), 'Should deny Level < 12');

// Case B: Level >= 12 but no key
app.playerData.level = 12;
app.playerData.inventory = app.playerData.inventory.filter(i => i.item !== 'item_cafeteria_key');
app.playerData.hasCafeteriaKey = false;
window.RPGDialog.lastMsg = null;
app.handleCafeteriaEntranceInteraction();
assert(window.RPGDialog.lastMsg.includes('급식실에 입장하려면 [🔑 급식실 열쇠]를 찾아야 합니다'), 'Should require cafeteria key with simple hint');
assert(!window.RPGDialog.lastMsg.includes('1897'), 'Should NOT spoil 1897 set requirements at the door');
assert(!window.RPGDialog.lastMsg.includes('소회의실'), 'Should NOT spoil meeting room safe location at the door');

// Case C: Level >= 12 AND has key
app.playerData.inventory.push({ item: 'item_cafeteria_key', count: 1 });
app.playerData.hasCafeteriaKey = true;
window.RPGDialog.lastMsg = null;
app.handleCafeteriaEntranceInteraction();
assert(window.RPGDialog.lastMsg.includes('정문 개방 성공'), 'Should open door when level >= 12 and key held');
assert(!window.RPGDialog.lastMsg.includes('대규모 급식 콘텐츠가 곧 오픈됩니다'), 'Should delete deprecated opening notice');

// Verify warp into cafeteria room
assert.strictEqual(engine.player.room, 'room_cafeteria', 'Opening cafeteria door should warp to room_cafeteria');
assert.strictEqual(engine.player.x, 21 * 32, 'X coord in cafeteria should be 21 * 32');
assert.strictEqual(engine.player.y, 20 * 32, 'Y coord in cafeteria should be 20 * 32');
assert.strictEqual(engine.getMapWidth(), 42, 'Cafeteria width should be 42');
assert.strictEqual(engine.getMapHeight(), 24, 'Cafeteria height should be 24');

// Verify collision in cafeteria
assert.strictEqual(engine.checkCafeteriaCollision(5, 12), true, 'Student dining table should block');
assert.strictEqual(engine.checkCafeteriaCollision(11, 12), false, 'Aisle between columns should be passable');
assert.strictEqual(engine.checkCafeteriaCollision(32, 12), false, 'Doorway to teacher dining should be passable');
assert.strictEqual(engine.checkCafeteriaCollision(32, 8), true, 'Wall to teacher dining should block');

// Verify exit door in cafeteria
engine.exitClassroom();
assert.strictEqual(engine.player.room, 'playground', 'Stepping on exit door in cafeteria should warp to playground');
assert.strictEqual(engine.player.x, 86 * 32, 'X coord should be 86 * 32 (playground cafeteria entrance)');
assert.strictEqual(engine.player.y, 5 * 32, 'Y coord should be 5 * 32');

console.log('✔ [5/6] Cafeteria key quest & interior space navigation verified flawlessly!');

// 7. Test Soongsil History Hall Monsters Question Unit (Lesson 6)
const historyMob = WORLD_DATA.classroom_history.historyMonsters[0];
assert(historyMob, 'History monster must exist');
app.playerData.hp = 100;
app.playerData.isFallen = false;

// Mock DOM elements for battle modal
document.getElementById('battle-monster-title');
const badgeEl = { innerText: '', style: {} };
const headerEl = { style: {} };
const cardEl = { style: {} };
const logEl = { innerHTML: '' };
const qEl = { innerText: '' };
const optEl = { innerHTML: '', appendChild: () => {} };

const origGetElementById = document.getElementById;
document.getElementById = (id) => {
  if (id === 'battle-quiz-unit-badge') return badgeEl;
  if (id === 'battle-modal-header') return headerEl;
  if (id === 'battle-modal-card') return cardEl;
  if (id === 'battle-action-log') return logEl;
  if (id === 'battle-quiz-question') return qEl;
  if (id === 'battle-quiz-options') return optEl;
  return origGetElementById(id);
};

// Ensure quiz manager has questions loaded
app.quizManager.questions = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/questions_grade1.json'), 'utf8'));

app.startFieldMonsterBattle(historyMob);
assert(badgeEl.innerText.includes('6단원'), 'History monster battle badge must indicate 6단원');
assert(badgeEl.innerText.includes('숭실 역사관'), 'History monster battle badge must mention 숭실 역사관');
assert(logEl.innerHTML.includes('6단원'), 'Action log must indicate 6단원');
assert(app.fieldBattleQuestion && app.fieldBattleQuestion.unit.includes('6단원'), 'Loaded question must be from 6단원 (The Beauty of Art)');
console.log('✔ [6/6] Soongsil History Hall monsters verified to quiz 6단원 questions!');

console.log('\n========================================');
console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! (6/6)');
console.log('========================================');
process.exit(0);
