/**
 * Test Suite: 2층 도서관 (독립 전용층) 및 5대 구현 요구사항 종합 검증
 */

const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('========================================================');
console.log('🧪 TESTING 2ND FLOOR LIBRARY & 5 CORE FEATURES');
console.log('========================================================\n');

// 1. Setup mock environment
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};

const mockCtx = {
  save: () => {}, restore: () => {}, scale: () => {}, translate: () => {}, rotate: () => {},
  beginPath: () => {}, closePath: () => {}, moveTo: () => {}, lineTo: () => {},
  arc: () => {}, fill: () => {}, stroke: () => {}, fillRect: () => {}, strokeRect: () => {}, clearRect: () => {},
  fillText: () => {}, strokeText: () => {}, measureText: (txt) => ({ width: (txt || '').length * 8 }),
  ellipse: () => {}, roundRect: () => {}, rect: () => {}, setTransform: () => {}, resetTransform: () => {},
  createLinearGradient: () => ({ addColorStop: () => {} }),
  createRadialGradient: () => ({ addColorStop: () => {} }),
  setLineDash: () => {}, drawImage: () => {}
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
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.alert = () => {};

global.AudioManager = {
  playSelect: () => {},
  playFanfare: () => {},
  playCollect: () => {},
  playWrong: () => {},
  updateMuteButtonUI: () => {}
};
global.RPGDialog = {
  show: (title, text, avatar) => {}
};

// Load scripts
require('../public/js/world.js');
const WORLD_DATA = window.WORLD_DATA;
global.WORLD_DATA = WORLD_DATA;

// Test 1: WORLD_DATA Architecture
console.log('1. Checking WORLD_DATA 2nd Floor Library Architecture:');
assert(WORLD_DATA.LIBRARY_WIDTH === 20, 'LIBRARY_WIDTH is strictly 20 tiles');
assert(WORLD_DATA.LIBRARY_HEIGHT === 20, 'LIBRARY_HEIGHT is strictly 20 tiles');
assert(!!WORLD_DATA.floors[2], 'Floor 2 exists in WORLD_DATA.floors');
assert(WORLD_DATA.floors[2].name.includes('2층 도서관'), 'Floor 2 is named 2층 도서관');
assert(!WORLD_DATA.floors[2].name.includes('백마'), 'Floor 2 does NOT use "백마" title');
assert(WORLD_DATA.floors[2].elevator && WORLD_DATA.floors[2].elevator.x === 16 && WORLD_DATA.floors[2].elevator.y === 3, 'Floor 2 elevator at (16, 3)');

const floor2Interactives = WORLD_DATA.floors[2].interactive || [];
assert(floor2Interactives.some(i => i.id === 'wisdom_book'), 'Interactive wisdom_book exists in floor 2');
assert(floor2Interactives.some(i => i.id === 'bookshelf_lit'), 'Interactive bookshelf_lit exists in floor 2');
assert(floor2Interactives.some(i => i.id === 'bookshelf_sci'), 'Interactive bookshelf_sci exists in floor 2');
assert(floor2Interactives.some(i => i.id === 'bookshelf_eng'), 'Interactive bookshelf_eng exists in floor 2');
assert(floor2Interactives.some(i => i.id === 'library_dibut'), 'Interactive library_dibut exists in floor 2');

const floor2Npcs = WORLD_DATA.floors[2].npcs || [];
const librarianNpc = floor2Npcs.find(n => n.id === 'npc_librarian');
assert(!!librarianNpc, 'Librarian NPC exists in floor 2');
assert(librarianNpc && librarianNpc.avatar === 'teacher', 'Librarian NPC uses standard blue teacher avatar');
assert(librarianNpc && librarianNpc.questId === 'quest_library_missing_books', 'Librarian gives quest_library_missing_books');

// 3 Missing Books in World Data
assert(WORLD_DATA.playground && WORLD_DATA.playground.libraryBook && WORLD_DATA.playground.libraryBook.x === 23, 'Missing book 1 is on playground bleachers (x: 23, y: 7)');
const staffInteractive = WORLD_DATA.classroom_staff_office.interactive || [];
assert(staffInteractive.some(i => i.id === 'quest_library_book_office'), 'Missing book 2 is in staff office');
const histInteractive = WORLD_DATA.classroom_history.interactive || [];
assert(histInteractive.some(i => i.id === 'quest_library_book_history'), 'Missing book 3 is in history hall');

// Test 2: GameEngine Logic
console.log('\n2. Checking GameEngine Dimensions, Collision, and Easter Egg:');
require('../public/js/engine.js');
const mockCanvas = document.getElementById('game-canvas');
const engine = new window.GameEngine(mockCanvas);
engine.player.room = 'hallway';
engine.player.floor = 2;

assert(engine.getMapWidth() === 20, 'engine.getMapWidth() returns 20 on floor 2 hallway');
assert(engine.getMapHeight() === 20, 'engine.getMapHeight() returns 20 on floor 2 hallway');

// Collision test
assert(engine.checkLibraryFloor2Collision(0, 10) === true, 'West wall (tx: 0) is blocked');
assert(engine.checkLibraryFloor2Collision(19, 10) === true, 'East wall (tx: 19) is blocked');
assert(engine.checkLibraryFloor2Collision(10, 2) === true, 'North wall (ty: 2) is blocked');
assert(engine.checkLibraryFloor2Collision(16, 3) === false, 'Elevator entry at (16, 3) is passable');
assert(engine.checkLibraryFloor2Collision(16, 5) === false, 'Walkway south of elevator at (16, 5) is passable');
assert(engine.checkLibraryFloor2Collision(10, 10) === true, 'Central lectern at (10, 10) is blocked');
assert(engine.checkLibraryFloor2Collision(13, 5) === true, 'Librarian reception desk at (13, 5) is blocked');
assert(engine.checkLibraryFloor2Collision(3, 4) === true, 'Lit bookshelf at (3, 4) is blocked');
assert(engine.checkLibraryFloor2Collision(4, 15) === true, 'Smart dibut station at (4, 15) is blocked');

// Dash Easter Egg Test (5번 구현)
engine.setDashing(true);
assert(engine.player.isDashing === false, 'Dashing on floor 2 is immediately cancelled');
assert(engine.libraryShhTimer && engine.libraryShhTimer > Date.now(), 'Shh easter egg timer is triggered');

// Render method test
assert(typeof engine.renderLibraryFloor2 === 'function', 'renderLibraryFloor2 function exists');
assert(typeof engine.drawQuestLibraryBook === 'function', 'drawQuestLibraryBook function exists');
let renderThrew = false;
try {
  engine.renderLibraryFloor2();
  engine.drawQuestLibraryBook(100, 100, 'blue');
  engine.drawQuestLibraryBook(100, 100, 'green');
  engine.drawQuestLibraryBook(100, 100, 'red');
} catch (e) {
  renderThrew = true;
  console.error(e);
}
assert(!renderThrew, 'renderLibraryFloor2 and drawQuestLibraryBook execute without error');

// Test 3: MainApp & Quests
console.log('\n3. Checking MainApp Buff, Quests, and Interaction Handlers:');
require('../public/js/quiz.js');
require('../public/js/crafting.js');
require('../public/js/network.js');
require('../public/js/main.js');

const MainAppClass = window.MainAppClass || globalThis.MainApp;
const app = new MainAppClass();
app.playerData.quests = {};
app.playerData.inventory = [];
app.playerData.gold = 50;

// Test EXP Buff (1번 구현)
app.playerData.level = 2;
app.playerData.exp = 0;
app.addExp(50);
assert(app.playerData.exp === 50, 'Base addExp(50) adds 50 EXP');

app.handleWisdomBookInteraction();
assert(app.playerData.readingExpBuffUntil && app.playerData.readingExpBuffUntil > Date.now(), 'handleWisdomBookInteraction activates readingExpBuffUntil');

const expWithBuffBefore = app.playerData.exp;
app.addExp(50);
const expectedExp = Math.round(50 * 1.15);
assert(app.playerData.exp === expWithBuffBefore + expectedExp, `addExp(50) with reading buff grants ${expectedExp} EXP (+15%)`);

// Test Title Removal & Purge Verification (칭호 및 +5% 보너스 완전 삭제)
app.playerData.equippedTitle = '📚 지혜의 탐구자';
app.updatePlayerNameDisplay();
assert(app.playerData.equippedTitle === null, 'updatePlayerNameDisplay purges 📚 지혜의 탐구자 from equipped title');

// Test Missing Books Quest (3번 구현)
app.acceptQuest('quest_library_missing_books');
const q = app.playerData.quests['quest_library_missing_books'];
assert(q && q.status === 'in_progress', 'Quest quest_library_missing_books is in progress');

app.handleLibraryBookPickup('pg');
assert(app.isQuestLibBookPgCollected() === true, 'Book 1 (playground) collected');
assert(app.playerData.inventory.some(i => i.item === 'item_lib_book_pg'), 'item_lib_book_pg added to inventory');

app.handleLibraryBookPickup('of');
assert(app.isQuestLibBookOfCollected() === true, 'Book 2 (office) collected');
assert(app.playerData.inventory.some(i => i.item === 'item_lib_book_of'), 'item_lib_book_of added to inventory');

app.handleLibraryBookPickup('hi');
assert(app.isQuestLibBookHiCollected() === true, 'Book 3 (history) collected');
assert(app.playerData.inventory.some(i => i.item === 'item_lib_book_hi'), 'item_lib_book_hi added to inventory');

// Turn in quest
const goldBefore = app.playerData.gold;
app.completeQuest('quest_library_missing_books');
assert(q.status === 'done', 'Quest completed');
assert(app.playerData.gold === goldBefore + 100, '100 Gold reward granted');
assert(!app.playerData.titles || (!app.playerData.titles.includes('title_wisdom_seeker') && !app.playerData.titles.includes('📚 지혜의 탐구자')), 'title_wisdom_seeker is NOT granted on quest completion (permanently removed)');
assert(!app.playerData.inventory.some(i => i.item === 'item_lib_book_pg'), 'item_lib_book_pg removed on turn-in');
assert(!app.playerData.inventory.some(i => i.item === 'item_lib_book_of'), 'item_lib_book_of removed on turn-in');
assert(!app.playerData.inventory.some(i => i.item === 'item_lib_book_hi'), 'item_lib_book_hi removed on turn-in');

// Test Bookshelf Dialogs (2번 구현)
let shelfThrew = false;
try {
  app.handleBookshelfLitInteraction();
  app.handleBookshelfSciInteraction();
  app.handleBookshelfEngInteraction();
} catch (e) {
  shelfThrew = true;
  console.error(e);
}
assert(!shelfThrew, 'All 3 bookshelf handlers execute cleanly');

// Test Smart Dibut Station (4번 구현)
app.playerData.hp = 30;
app.handleLibraryDibutInteraction();
assert(app.playerData.hp === app.playerData.maxHp, 'handleLibraryDibutInteraction restores HP to 100%');

// Test Elevator HTML & Routing
const indexHtml = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
assert(indexHtml.includes('data-target="floor_2"'), 'floor_2 button exists in index.html elevator & teleport modal');

console.log('\n========================================================');
console.log(`📊 FINAL RESULT: ${passed} PASSED / FAILED: ${failed}`);
console.log('========================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
