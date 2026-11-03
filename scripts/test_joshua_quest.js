const fs = require('fs');
const assert = require('assert');

console.log('=== VERIFYING JOSHUA TEACHER & QUEST SYSTEM ===');

// Setup globals like in mock_runtime_test.js
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};

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
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    addEventListener: () => {},
    style: {},
    innerText: '',
    innerHTML: '',
    value: '',
    disabled: false,
    appendChild: () => {},
    querySelectorAll: () => [],
    querySelector: () => null,
    getContext: () => mockCtx,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
    focus: () => {}
  }),
  createElement: (tag) => ({
    tagName: tag,
    classList: { add: () => {}, remove: () => {} },
    addEventListener: () => {},
    style: {},
    innerText: '',
    innerHTML: '',
    appendChild: () => {}
  }),
  addEventListener: () => {},
  body: { style: {} }
};

global.localStorage = {
  _store: {},
  getItem: (k) => global.localStorage._store[k] || null,
  setItem: (k, v) => { global.localStorage._store[k] = String(v); },
  removeItem: (k) => { delete global.localStorage._store[k]; }
};

global.alert = (msg) => {};
global.confirm = () => true;
global.prompt = () => 'test';

const vm = require('vm');

// Mock Canvas
const mockCanvas = {
  getContext: () => mockCtx,
  width: 800,
  height: 600,
  addEventListener: () => {}
};

// 1. Load world.js
vm.runInThisContext(fs.readFileSync('public/js/world.js', 'utf8'));

const office = global.WORLD_DATA.classroom_staff_office;
assert(office, 'classroom_staff_office must exist');
const joshuaNpc = office.npcs.find(n => n.id === 'npc_teacher_joshua');
assert(joshuaNpc, 'Joshua NPC must exist in classroom_staff_office.npcs');
assert.strictEqual(joshuaNpc.seatId, 5, 'Joshua must be assigned to seat 5 (교5)');
assert.strictEqual(joshuaNpc.questId, 'quest_joshua_intro', 'Joshua must have questId quest_joshua_intro');
console.log('✔ Joshua NPC and seatId: 5 verified');

const memoObj = office.interactive.find(i => i.id === 'quest_joshua_memo');
assert(memoObj, 'Dropped memo must exist in classroom_staff_office.interactive');
assert.strictEqual(memoObj.type, 'quest_memo', 'Dropped memo type must be quest_memo');
assert.strictEqual(memoObj.x, 48, 'Memo x must be 48');
assert.strictEqual(memoObj.y, 4, 'Memo y must be 4');
console.log('✔ Dropped memo in pantry (x:48, y:4) verified');

// 2. Load audio, dialog, engine, quiz, crafting, network, main
const files = [
  'public/js/audio.js',
  'public/js/dialog.js',
  'public/js/engine.js',
  'public/js/quiz.js',
  'public/js/crafting.js',
  'public/js/network.js',
  'public/js/acid_rain.js',
  'public/js/brawl_ball.js',
  'public/js/main.js'
];
files.forEach(f => {
  vm.runInThisContext(fs.readFileSync(f, 'utf8'));
});

const app = new MainApp();
assert(app, 'MainApp must be instantiated');

// Test Player Setup
app.playerData = {
  name: '테스트학생',
  studentId: '2026001',
  grade: 1,
  level: 1,
  exp: 0,
  gold: 50,
  baseHp: 100,
  hp: 100,
  maxHp: 100,
  baseAtk: 10,
  atk: 10,
  baseDef: 2,
  def: 2,
  inventory: [],
  equipment: {},
  titles: [],
  equippedTitle: null,
  quests: {}
};

// 3. Quest State Transitions
assert.strictEqual(app.getTeacherQuestStatus('npc_teacher_joshua'), 'available', 'Initial quest status must be available');
console.log('✔ Quest status: available verified');

// Accept Quest
app.acceptQuest('quest_joshua_intro');
assert.strictEqual(app.getTeacherQuestStatus('npc_teacher_joshua'), 'in_progress', 'Status must be in_progress after accept');
assert.strictEqual(app.playerData.quests['quest_joshua_intro'].quizCount, 0, 'Quiz count must start at 0');
assert.strictEqual(app.playerData.quests['quest_joshua_intro'].memoCollected, false, 'Memo must not be collected yet');
console.log('✔ Quest acceptance & state initialization verified');

// Objective 1: English Quiz in room_701
app.onQuizSolved('teacher_desk', 'room_702'); // Wrong room
assert.strictEqual(app.playerData.quests['quest_joshua_intro'].quizCount, 0, 'Quiz in room_702 should not count for Joshua');

app.onQuizSolved('teacher_desk', 'room_701'); // 1st quiz in 1-1
assert.strictEqual(app.playerData.quests['quest_joshua_intro'].quizCount, 1, 'Quiz 1 in room_701 must increment count to 1');

app.onQuizSolved('teacher_desk', 'room_701'); // 2nd quiz in 1-1
assert.strictEqual(app.playerData.quests['quest_joshua_intro'].quizCount, 2, 'Quiz 2 in room_701 must increment count to 2');
assert.strictEqual(app.getTeacherQuestStatus('npc_teacher_joshua'), 'in_progress', 'Should still be in_progress since memo is not yet collected');
console.log('✔ 1-1 classroom quiz progression verified');

// Objective 2: Collect memo in pantry
app.handleQuestMemoPickup(memoObj);
assert.strictEqual(app.playerData.quests['quest_joshua_intro'].memoCollected, true, 'memoCollected must be true');
const hasMemoItem = app.playerData.inventory.some(i => i.item === 'item_joshua_memo');
assert(hasMemoItem, 'Player must have item_joshua_memo in inventory');
console.log('✔ Memo pickup & inventory addition verified');

// Now both objectives are met
assert.strictEqual(app.getTeacherQuestStatus('npc_teacher_joshua'), 'completed', 'Status must be completed when both objectives are met');
console.log('✔ Quest completion readiness (completed status) verified');

// Complete Quest & Claim Rewards
const goldBefore = app.playerData.gold;
const levelBefore = app.playerData.level;
app.completeQuest('quest_joshua_intro');

assert.strictEqual(app.getTeacherQuestStatus('npc_teacher_joshua'), 'done', 'Status must be done after turning in');
assert.strictEqual(app.playerData.gold, goldBefore + 100, 'Gold must increase by 100');
assert.strictEqual(app.playerData.level, levelBefore + 1, 'Player must level up from Lv.1 to Lv.2 with 100 EXP');
assert(app.playerData.inventory.some(i => i.item === 'item_teleport_scroll'), 'Player must receive teleport scroll');
assert(!app.playerData.inventory.some(i => i.item === 'item_joshua_memo'), 'item_joshua_memo must be removed on turn in');
assert.strictEqual(app.playerData.titles.length, 0, 'No title should be awarded (title removed from reward)');
assert.strictEqual(app.playerData.equippedTitle, null, 'Equipped title should remain null');
console.log('✔ Reward delivery (100G, 100EXP, scroll, NO title) verified');

// Verify combat stats (no title bonus, only level up bonus +1 ATK at Lv.2)
app.recalcCombatStats();
const lvBonus = app.playerData.level - 1;
assert.strictEqual(app.playerData.atk, app.playerData.baseAtk + lvBonus, 'ATK must only have lvBonus, no title bonus');
assert.strictEqual(app.playerData.maxHp, app.playerData.baseHp, 'Max HP must have no title bonus');
console.log('✔ Combat stats verified (Lv.2 bonus only, no title bonus)');

console.log('\n====================================================');
console.log(' ALL JOSHUA TEACHER & QUEST TESTS PASSED 100%! ');
console.log('====================================================');
