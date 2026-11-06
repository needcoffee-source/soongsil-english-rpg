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

global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.alert = () => {};

global.document = {
  addEventListener: () => {},
  removeEventListener: () => {},
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
    getContext: () => mockCtx
  }),
  createElement: (tag) => {
    if (tag === 'canvas') {
      return {
        width: 100, height: 100,
        getContext: () => mockCtx,
        toDataURL: () => ''
      };
    }
    return {
      style: {}, classList: { add: () => {}, remove: () => {}, contains: () => false },
      addEventListener: () => {}, appendChild: () => {}, innerText: '', innerHTML: ''
    };
  },
  body: { appendChild: () => {} },
  documentElement: { style: {} }
};

// Load World Data
const worldCode = fs.readFileSync(path.join(__dirname, '../public/js/world.js'), 'utf8');
eval(worldCode);

// Load Engine
const engineCode = fs.readFileSync(path.join(__dirname, '../public/js/engine.js'), 'utf8');
eval(engineCode);

require('../public/js/quiz.js');
require('../public/js/crafting.js');
require('../public/js/network.js');
require('../public/js/main.js');

// Load Uphill Rush
require('../public/js/uphill_rush.js');

console.log('========================================================');
console.log('🧪 TESTING TEACHER TELEPORT, GUARD TEACHER & UPHILL MINI-GAME');
console.log('========================================================\n');

// 1. Teacher 2nd Floor Library Teleport Test
console.log('1. Checking Teacher 2nd Floor Library Teleportation:');
const indexHtml = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
assert(indexHtml.includes('value="2_hallway"'), 'select-gm-warp contains option 2_hallway for teachers');
assert(indexHtml.includes('📚 2층 도서관 (독립 전용층)'), 'select-gm-warp has correct 2층 도서관 label');

const mockCanvas = document.getElementById('game-canvas');
const engine = new GameEngine(mockCanvas);
engine.player = {
  x: 50 * 32,
  y: 30 * 32,
  floor: 1,
  room: 'playground_gym',
  isTeacher: true,
  speed: 4.0,
  isDashing: false
};

engine.teleportTo(2, 'hallway');
if (engine.fade && engine.fade.onMidpoint) engine.fade.onMidpoint();
assert(engine.player.floor === 2, 'teleportTo(2, "hallway") sets floor to 2');
assert(engine.player.room === 'hallway', 'teleportTo(2, "hallway") sets room to hallway');
assert(engine.player.x === 16 * 32, 'teleportTo(2, "hallway") lands in front of elevator at x: 16*32');
assert(engine.player.y === 5 * 32, 'teleportTo(2, "hallway") lands in front of elevator at y: 5*32');
assert(engine.player.roomName && engine.player.roomName.includes('2층 도서관'), 'teleportTo sets roomName to 2층 도서관');

// 2. 배움터 지킴이 선생님 (Guard Teacher NPC) Test
console.log('\n2. Checking 배움터 지킴이 선생님 (Guard Teacher NPC):');
const gymData = WORLD_DATA.playground_gym;
assert(!!gymData, 'playground_gym exists in WORLD_DATA');
assert(!!gymData.guardTeacher, 'gymData.guardTeacher exists in playground_gym');
assert(gymData.guardTeacher.x === 10, 'guardTeacher is placed at x: 10 (right of main gate)');
assert(gymData.guardTeacher.y === 33, 'guardTeacher is placed at y: 33 (beside main gate)');
assert(gymData.guardTeacher.avatar === 'teacher', 'guardTeacher uses teacher avatar ("형태는 교사와 동일")');
assert(gymData.guardTeacher.name.includes('배움터 지킴이'), 'guardTeacher name includes 배움터 지킴이');

// Check Collision
engine.player.room = 'playground_gym';
engine.player.noclip = false;
assert(engine.checkCollision(10 * 32 + 16, 33 * 32 + 16) === true, 'Tile (10, 33) occupied by guardTeacher is blocked');
assert(engine.checkCollision(10 * 32 + 16, 32 * 32 + 16) === false, 'Tile north of guard (10, 32) is passable');
assert(engine.checkCollision(10 * 32 + 16, 34 * 32 + 16) === false, 'Tile south of guard (10, 34) is passable');
assert(engine.checkCollision(11 * 32 + 16, 33 * 32 + 16) === false, 'Tile east of guard (11, 33) is passable');

// Check Interactive Target Detection
engine.player.x = 10 * 32;
engine.player.y = 32 * 32;
engine.checkNearbyInteractable();
const target = engine.activeInteractable;
assert(!!target, 'Interactive target detected near guard teacher');
assert(target.type === 'gym_guard_teacher', 'Target type is gym_guard_teacher');
assert(target.name.includes('배움터 지킴이'), 'Target name is 배움터 지킴이');

// Check Mouse / Click Target Detection
const clickTarget = engine.getInteractableAt(10 * 32 + 10, 33 * 32 + 10);
assert(!!clickTarget, 'Click target detected at guard teacher coordinates');
assert(clickTarget.type === 'gym_guard_teacher', 'Click target type is gym_guard_teacher');

// Check Render Method
assert(typeof engine.drawHighResGuardTeacher === 'function', 'drawHighResGuardTeacher method exists');
let renderThrew = false;
try {
  engine.drawHighResGuardTeacher(10 * 32, 33 * 32);
} catch (e) {
  renderThrew = true;
  console.error(e);
}
assert(!renderThrew, 'drawHighResGuardTeacher executes cleanly without errors');

// 3. 언덕길 질주 미니게임 (Uphill Rush Game) Test
console.log('\n3. Checking 숭실 언덕길 질주 미니게임 (Uphill Rush Game):');
assert(typeof window.UphillRushGame === 'function', 'UphillRushGame class exists');
const game = new window.UphillRushGame();
assert(game.totalDistance === 500, 'Game total distance is 500m');
assert(game.hearts === 3, 'Game starts with 3 hearts');

// Test Obstacle Spawning
assert(game.obstacles.length === 0, 'Obstacles empty on start');
for (let i = 0; i < 20; i++) {
  game.spawnObstacle();
}
assert(game.obstacles.length === 20, '20 obstacles successfully spawned');
const obsTypes = new Set(game.obstacles.map(o => o.type));
assert(obsTypes.has('soccer') || obsTypes.has('basketball') || obsTypes.has('barrel'), 'Obstacles contain soccer, basketball or barrel');

// Test Hit Collision
const initialHearts = game.hearts;
game.handlePlayerHit({ type: 'soccer' });
assert(game.hearts === initialHearts - 1, 'Player loses 1 heart on obstacle hit');
assert(game.invincibleUntil > Date.now(), 'Player gains invincibility period after hit');

// Test App Integration & Title
const app = new MainApp();
app.playerData = {
  exp: 0,
  gold: 0,
  titles: [],
  uphillBestTime: null
};
window.MainApp = app;

// Test S-Rank Finish
game.elapsedMs = 21500; // 21.5 seconds -> S-Rank (< 23s)
game.traveled = 500;
game.finishGame();

assert(app.playerData.exp === 150, 'Clearing uphill rush awards 150 EXP');
assert(app.playerData.gold === 100, 'Clearing uphill rush awards 100 Gold');
assert(app.playerData.uphillBestTime === 21500, 'Best time is saved as 21500ms');
assert(app.playerData.titles.includes('title_uphill_master') || app.playerData.titles.includes('🏃 폭풍의 언덕 질주왕'), 'S-Rank awards title [🏃 폭풍의 언덕 질주왕]');

// Check TITLES list
assert(app.TITLE_DEFINITIONS.some(t => t.id === 'title_uphill_master'), 'title_uphill_master is registered in TITLE_DEFINITIONS');

// Check Guard Teacher interaction in MainApp
assert(typeof app.handleGuardTeacherInteraction === 'function', 'handleGuardTeacherInteraction exists on MainApp');

console.log('\n========================================================');
console.log(`📊 FINAL RESULT: ${passed} PASSED / FAILED: ${failed}`);
console.log('========================================================');

if (failed > 0) process.exit(1);
