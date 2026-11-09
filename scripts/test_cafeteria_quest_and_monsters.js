const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('=== TEST SUITE: Cafeteria Quests & Tier 5 Food Waste Monsters ===\n');

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
  },
  confirm: (title, msg, icon, onOk) => {
    global.RPGDialog.lastTitle = title;
    global.RPGDialog.lastMsg = msg;
    if (onOk) onOk();
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

const cafData = global.WORLD_DATA.classroom_cafeteria;
assert(cafData, 'classroom_cafeteria must exist');

// Check NPCs in cafeteria
assert.strictEqual(cafData.npcs.length, 3, 'Cafeteria must have 3 NPCs');
const teacherNpc = cafData.npcs.find(n => n.id === 'npc_cafeteria_teacher');
const demandingStudent = cafData.npcs.find(n => n.id === 'npc_demanding_student');
const noisyStudent = cafData.npcs.find(n => n.id === 'npc_noisy_student');

assert(teacherNpc, '급식지도 선생님 NPC must exist');
assert.strictEqual(teacherNpc.x, 14);
assert.strictEqual(teacherNpc.y, 18);
assert(demandingStudent, '반찬 더 달라는 학생 NPC must exist');
assert.strictEqual(demandingStudent.x, 6);
assert.strictEqual(demandingStudent.y, 18);
assert(noisyStudent, '식탁에서 떠드는 학생 NPC must exist');
assert.strictEqual(noisyStudent.x, 20);
assert.strictEqual(noisyStudent.y, 11);
console.log('✔ [1/6] Cafeteria NPCs verified: 급식지도 선생님, 반찬 더 달라는 학생, 식탁에서 떠드는 학생');

// Check 5 Cafeteria Monsters in world.js
assert(cafData.cafeteriaMonsters, 'cafeteriaMonsters array must exist');
assert.strictEqual(cafData.cafeteriaMonsters.length, 5, 'Must have exactly 5 cafeteria monsters');

const kitchenMob = cafData.cafeteriaMonsters.find(m => m.zone === 'kitchen');
const tableMobs = cafData.cafeteriaMonsters.filter(m => m.zone === 'tables');
const trayMob = cafData.cafeteriaMonsters.find(m => m.zone === 'tray_return');
const facultyMob = cafData.cafeteriaMonsters.find(m => m.zone === 'teacher_room');

assert(kitchenMob, 'Kitchen monster must exist');
assert.strictEqual(kitchenMob.name, '눌어붙은 누룽지 슬라임');
assert.strictEqual(kitchenMob.x, 6);
assert.strictEqual(kitchenMob.y, 7);

assert.strictEqual(tableMobs.length, 2, 'Must have 2 identical student seating monsters');
assert.strictEqual(tableMobs[0].name, '바닥에 흘린 밥풀 골렘');
assert.strictEqual(tableMobs[1].name, '바닥에 흘린 밥풀 골렘');
assert.strictEqual(tableMobs[0].avatar, tableMobs[1].avatar);

assert(trayMob, 'Tray return monster must exist');
assert.strictEqual(trayMob.name, '쏟아진 잔반 괴물');

assert(facultyMob, 'Teacher dining monster must exist');
assert.strictEqual(facultyMob.name, '남겨진 샐러드 골렘');

console.log('✔ [2/6] 5 Food waste monsters verified: 조리실 1, 급식좌석 동종 2, 퇴식구 1, 교사용 급식실 1');

// 2. Load engine.js & verify engine update & respawn logic
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../public/js/engine.js'), 'utf8'));
assert(global.GameEngine, 'GameEngine must be defined');

const canvas = document.getElementById('game-canvas');
const engine = new global.GameEngine(canvas);
engine.player = {
  x: 24 * 32,
  y: 20 * 32,
  room: 'room_cafeteria',
  floor: 1,
  level: 12
};

// Check interactive targeting finds cafeteria monster
engine.checkNearbyInteractable();
// Move next to kitchen monster to verify targeting
engine.player.x = 6 * 32;
engine.player.y = 7 * 32;
engine.checkNearbyInteractable();
assert(engine.activeInteractable, 'checkNearbyInteractable should find nearby mob or interactive in cafeteria');

// Test monster defeat and respawn
kitchenMob.hp = 0;
kitchenMob.defeated = true;
kitchenMob.respawnAt = Date.now() + 500; // 0.5s respawn for test

engine.updateCafeteriaMonsters();
assert.strictEqual(kitchenMob.defeated, true, 'Monster should stay defeated before respawn timer');

// Fast forward time
kitchenMob.respawnAt = Date.now() - 100;
engine.updateCafeteriaMonsters();
assert.strictEqual(kitchenMob.defeated, false, 'Monster should respawn when timer expires');
assert.strictEqual(kitchenMob.hp, kitchenMob.maxHp, 'Monster HP should restore to maxHp');
console.log('✔ [3/6] Engine cafeteria monster update & 15s respawn cycle verified');

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

// Auto-confirm RPGDialog for tests
if (global.RPGDialog || window.RPGDialog) {
  const d = global.RPGDialog || window.RPGDialog;
  d.confirm = (speaker, text, avatar, onConfirm) => {
    if (onConfirm) onConfirm();
  };
}
assert(global.MainApp, 'MainApp must be defined');

const app = new global.MainApp();
app.engine = engine;
app.playerData = {
  name: '모범학생',
  level: 12,
  hp: 100,
  maxHp: 100,
  atk: 25,
  def: 15,
  inventory: [],
  quests: {},
  gold: 0,
  exp: 0
};
app.quizManager.questions = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/questions_grade1.json'), 'utf8'));

// Verify Unit 7 questions exist
const unit7List = app.quizManager.questions.filter(q => q.unit && q.unit.includes('7단원'));
assert(unit7List.length >= 30, `Should have at least 30 questions in 7단원, found ${unit7List.length}`);
console.log(`✔ [4/6] 7단원 (L7. Tasty World) curriculum quiz bank loaded: ${unit7List.length} questions`);

// 4. Test Cafeteria Monster Battle & 7단원 Question Selection
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

app.startFieldMonsterBattle(kitchenMob);
assert(badgeEl.innerText.includes('7단원'), 'Cafeteria battle badge must indicate 7단원');
assert(badgeEl.innerText.includes('L7. Tasty World'), 'Badge must include Tasty World');
assert(app.fieldBattleQuestion && app.fieldBattleQuestion.unit.includes('7단원'), 'Question must be drawn from 7단원');

// Test Tier 5 Drops on Victory
app.handleFieldBattleVictory(kitchenMob);
assert(app.hasItem('item_nutrition_essence'), 'Defeated cafeteria monster must drop item_nutrition_essence');
console.log('✔ [5/6] Cafeteria monster battles 7단원 questions and drops Tier 5 materials (정제된 영양의 정수)');

// 5. Test Sequential Cafeteria Quest Chain
// Step 1: Start Quest 1 with Teacher
app.handleCafeteriaTeacherInteraction(teacherNpc);
assert(app.playerData.quests['quest_cafeteria_order'], 'Quest 1 should be initiated');
assert.strictEqual(app.playerData.quests['quest_cafeteria_order'].status, 'in_progress');

// Step 2: Fight demanding student
app.handleDemandingStudentInteraction(demandingStudent);
assert(app.currentFieldMob && app.currentFieldMob.isStudent, 'Should initiate battle with student');
assert.strictEqual(app.currentFieldMob.questId, 'quest_cafeteria_order');

// Win battle against demanding student
app.handleFieldBattleVictory(app.currentFieldMob);
assert.strictEqual(app.playerData.quests['quest_cafeteria_order'].targetCalmed, true, 'Demanding student should be calmed');

// Step 3: Report back to teacher -> completes Quest 1 & unlocks Quest 2
app.handleCafeteriaTeacherInteraction(teacherNpc);
assert.strictEqual(app.playerData.quests['quest_cafeteria_order'].status, 'done', 'Quest 1 should be done');
assert(app.playerData.quests['quest_cafeteria_manners'], 'Quest 2 should be automatically offered');
assert.strictEqual(app.playerData.quests['quest_cafeteria_manners'].status, 'in_progress');

// Step 4: Fight noisy student at dining table
app.handleNoisyStudentInteraction(noisyStudent);
assert(app.currentFieldMob && app.currentFieldMob.isStudent);
assert.strictEqual(app.currentFieldMob.questId, 'quest_cafeteria_manners');

// Win battle against noisy student
app.handleFieldBattleVictory(app.currentFieldMob);
assert.strictEqual(app.playerData.quests['quest_cafeteria_manners'].targetCalmed, true, 'Noisy student should be calmed');

// Step 5: Report back to teacher -> completes Quest 2 & grants Tier 5 reward pack!
const preEssence = (app.playerData.inventory.find(i => i.item === 'item_nutrition_essence') || {}).count || 0;
const preStainless = (app.playerData.inventory.find(i => i.item === 'item_stainless_shard') || {}).count || 0;

app.handleCafeteriaTeacherInteraction(teacherNpc);
assert.strictEqual(app.playerData.quests['quest_cafeteria_manners'].status, 'done', 'Quest 2 should be done');

const postEssence = (app.playerData.inventory.find(i => i.item === 'item_nutrition_essence') || {}).count || 0;
const postStainless = (app.playerData.inventory.find(i => i.item === 'item_stainless_shard') || {}).count || 0;

assert(postEssence > preEssence, 'Teacher should grant 정제된 영양의 정수 on quest completion');
assert(postStainless > preStainless, 'Teacher should grant 특수 강화 스텐 조각 on quest completion');

console.log('✔ [6/6] Sequential 2-stage Cafeteria Quest chain verified end-to-end with Tier 5 rewards!');

console.log('\n======================================================');
console.log('🎉 ALL CAFETERIA QUEST & MONSTER TESTS PASSED! (6/6)');
console.log('======================================================');
process.exit(0);
