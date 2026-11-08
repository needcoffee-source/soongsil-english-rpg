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

require('../public/js/audio.js');
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

assert(gymData.guardTeacher.prompt === "언덕길 오르기 (SPACE)", 'guardTeacher prompt is "언덕길 오르기 (SPACE)"');

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

// 3. 언덕길 등교 챌린지 (Uphill Rush Game) Test
console.log('\n3. Checking 언덕길 등교 챌린지 (Uphill Rush Game):');
assert(typeof window.UphillRushGame === 'function', 'UphillRushGame class exists');
const game = new window.UphillRushGame();
assert(game.totalDistance === 2500, 'Game total distance is 2500m');
assert(game.hearts === 3, 'Game starts with 3 hearts');
assert(game.maxHearts === 3, 'Game maxHearts is 3');

// Test Obstacle Spawning & Variety
assert(game.obstacles.length === 0, 'Obstacles empty on start');
for (let i = 0; i < 25; i++) {
  game.spawnObstacleWave();
}
assert(game.obstacles.length >= 25, 'Dense obstacles spawned (including multi-waves)');
const obsTypes = new Set(game.obstacles.map(o => o.type));
assert(obsTypes.has('soccer') || obsTypes.has('basketball') || obsTypes.has('barrel') || obsTypes.has('tire'), 'Obstacles contain varied hazards (soccer, basketball, barrel, tire)');

// Check Audio Jump & School Bell
assert(typeof window.AudioManager.playJump === 'function', 'AudioManager.playJump method exists');
assert(typeof window.AudioManager.playSchoolBell === 'function', 'AudioManager.playSchoolBell method exists');

// Check Jump Action
assert(!game.isJumping, 'Player starts grounded');
game.triggerJump();
assert(game.isJumping === true, 'triggerJump sets isJumping to true');
assert(game.playerVz > 0, 'triggerJump imparts upward velocity');

// Check Pseudo-3D Perspective
const persp = game.getPerspective(250);
assert(persp.roadWidth > 135 && persp.roadWidth < 400, 'getPerspective calculates road width in 3D perspective');
assert(persp.scale > 0.5 && persp.scale < 1.2, 'getPerspective calculates scale at depth');

// Check Rival Student NPC
assert(!!game.rival, 'Rival student NPC exists');
assert(typeof game.rival.laneRatio === 'number', 'Rival student has laneRatio');
assert(typeof game.rival.speed === 'number', 'Rival student has speed');

// Check Hit Collision
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
  uphillBestTime: null,
  uphillTopRecords: []
};
window.MainApp = app;

// Test S-Rank Finish (< 28.0s) & Top 3 Dashboard
game.elapsedMs = 26500; // 26.5 seconds -> S-Rank (< 28s)
game.traveled = 2500;
game.finishGame();

assert(app.playerData.exp === 250, 'Clearing 2500m uphill rush awards 250 EXP');
assert(app.playerData.gold === 150, 'Clearing 2500m uphill rush awards 150 Gold');
assert(app.playerData.uphillBestTime === 26500, 'Best time is saved as 26500ms');
assert(app.playerData.uphillTopRecords.length === 1 && app.playerData.uphillTopRecords[0] === 26500, 'Top 1 record recorded in uphillTopRecords');
assert(app.playerData.titles.includes('title_uphill_master') || app.playerData.titles.includes('🏃 폭풍의 지각생'), 'S-Rank awards title [🏃 폭풍의 지각생]');

// Add more runs to test top 3 dashboard ranking
game.elapsedMs = 24000;
game.finishGame();
game.elapsedMs = 30000;
game.finishGame();
game.elapsedMs = 28000; // 4th run -> should displace 30000
game.finishGame();

assert(app.playerData.uphillTopRecords.length === 3, 'Top records holds exactly top 3');
assert(app.playerData.uphillTopRecords[0] === 24000, '1st place is 24000ms');
assert(app.playerData.uphillTopRecords[1] === 26500, '2nd place is 26500ms');
assert(app.playerData.uphillTopRecords[2] === 28000, '3rd place is 28000ms (displaced 30000ms)');
assert(app.playerData.uphillBestTime === 24000, 'uphillBestTime matches top 1');

// Check Dashboard HTML generation
const dashboardHtml = game.formatDashboardHTML(app.playerData.uphillTopRecords);
assert(dashboardHtml.includes('🥇 1위'), 'Dashboard HTML includes 1st place');
assert(dashboardHtml.includes('🥈 2위'), 'Dashboard HTML includes 2nd place');
assert(dashboardHtml.includes('🥉 3위'), 'Dashboard HTML includes 3rd place');
assert(dashboardHtml.includes('24.00초'), 'Dashboard HTML displays formatted 24.00초 time');

// Check TITLES list for [🏃 폭풍의 지각생]
const titleDef = app.TITLE_DEFINITIONS.find(t => t.id === 'title_uphill_master');
assert(!!titleDef, 'title_uphill_master is registered in TITLE_DEFINITIONS');
assert(titleDef.name === '🏃 폭풍의 지각생', 'title name is 🏃 폭풍의 지각생');
assert(titleDef.desc.includes('2,500m'), 'title description mentions 2,500m');

// Check Guard Teacher interaction in MainApp
assert(typeof app.handleGuardTeacherInteraction === 'function', 'handleGuardTeacherInteraction exists on MainApp');

// 4. Checking Bleachers Items Spacing & Developer Note Part 4
console.log('\n4. Checking Bleachers Items Spacing & Developer Note Part 4:');
const pg = WORLD_DATA.playground;
assert(pg.sketchbook.x === 16, 'Sketchbook moved to x: 16 on bleachers');
assert(pg.libraryBook.x === 38, 'Library book moved to x: 38 on bleachers');
assert(Math.abs(pg.libraryBook.x - pg.sketchbook.x) >= 20, 'Items on bleachers are spaced far apart (>= 20 tiles)');

const gym = WORLD_DATA.playground_gym;
assert(!!gym.devNote4, 'devNote4 exists in playground_gym');
assert(gym.devNote4.x === 31 && gym.devNote4.y === 33, 'devNote4 placed at x: 31, y: 33 where 갓준철 stands');
assert(gym.devNote4.type === 'dev_note_4', 'devNote4 has type dev_note_4');
assert(typeof app.handleDevNote4Interaction === 'function', 'handleDevNote4Interaction exists on MainApp');
const mainSrc = fs.readFileSync('public/js/main.js', 'utf8');
assert(mainSrc.includes('매일 아침 숭실 정문 급경사 언덕길을 올려다보며'), 'Developer note 4 contains revised opening line');
assert(mainSrc.includes('8시 20분, 종소리가 울리고 온 힘을 다해 몸을 날리던 그 순간의 심장 박동!'), 'Developer note 4 contains revised bell chime line');
assert(!mainSrc.includes('2,500m 언덕길을 올려다보며'), 'Developer note 4 does not contain 2,500m in the opening');

console.log('\n5. Checking 6F Hallway Recycle Bin, Dibut Label, Student Label & Career Guidebook Separation:');
const f6 = WORLD_DATA.floors[6];
const dibut = f6.interactive.find(i => i.id === 'dibut_repair_box_6');
assert(dibut && dibut.name === '📱 디벗 수리함', 'dibut_repair_box_6 name updated to 📱 디벗 수리함 without (5단)');

const recycleBin = f6.interactive.find(i => i.id === 'recycle_bin_6');
assert(recycleBin && recycleBin.x === 14 && recycleBin.y === 16, 'recycle_bin_6 placed at x: 14, y: 16 where 갓준철 was standing');
assert(recycleBin.name === '♻️ 분리수거함', 'recycle_bin_6 name is ♻️ 분리수거함');
assert(recycleBin.type === 'recycle_bin', 'recycle_bin_6 has type recycle_bin');
assert(recycleBin.prompt && recycleBin.prompt.includes('SPACE'), 'recycle_bin_6 has SPACE interaction prompt');

engine.player.room = 'hallway';
engine.player.floor = 6;
assert(engine.checkCollision(14 * 32 + 16, 16 * 32 + 16) === true, 'Tile (14, 16) occupied by recycle bin is solid/blocked');
assert(engine.checkCollision(16 * 32 + 16, 16 * 32 + 16) === true, 'Tile (16, 16) occupied by 4x wide recycle bin is solid/blocked');
assert(engine.checkCollision(18 * 32 + 16, 16 * 32 + 16) === true, 'Tile (18, 16) occupied by 4x wide recycle bin is solid/blocked');
assert(engine.checkCollision(8 * 32 + 16, 16 * 32 + 16) === true, 'Tile (8, 16) occupied by dibut cabinet is solid/blocked');
assert(engine.checkCollision(14 * 32 + 16, 15 * 32 + 16) === false, 'Tile above recycle bin (14, 15) is passable');
assert(engine.checkCollision(16 * 32 + 16, 15 * 32 + 16) === false, 'Tile above recycle bin (16, 15) is passable');

assert(typeof engine.drawHighResRecycleBin === 'function', 'drawHighResRecycleBin method exists on GameEngine');
assert(typeof app.handleRecycleBinInteraction === 'function', 'handleRecycleBinInteraction method exists on MainApp');

const recycleTitle = (app.TITLE_DEFINITIONS || []).find(t => t.id === 'title_recycle_king');
assert(recycleTitle && recycleTitle.name === '♻️ 분리수거왕', 'title_recycle_king registered as ♻️ 분리수거왕 in TITLE_DEFINITIONS');

const crCareer = WORLD_DATA.classroom_career;
const guidebook = crCareer.interactive.find(i => i.id === 'quest_career_guidebook');
const mentorDesk = crCareer.interactive.find(i => i.id === 'career_clue_5');
assert(guidebook.x === 55 && guidebook.y === 5, 'Career guidebook moved to (55, 5)');
assert(Math.hypot(guidebook.x - mentorDesk.x, guidebook.y - mentorDesk.y) >= 5, 'Career guidebook separated from mentoring desk (>= 5 tiles)');

const engineSrc = fs.readFileSync('public/js/engine.js', 'utf8');
assert(engineSrc.includes("npc.id === 'npc_student_worried' || (npc.name && npc.name.includes('학생'))"), 'Student NPC name label is skipped in renderNPCs');
assert(engineSrc.includes("const w = 168;"), 'Recycle bin width expanded 4x to 168px');
assert(engineSrc.includes("'♻️ 분리수거함'"), 'Recycle bin draw label updated to ♻️ 분리수거함');
const indexHtmlContent = fs.readFileSync('public/index.html', 'utf8');
assert(indexHtmlContent.includes('id="modal-recycle-quiz"'), 'index.html contains modal-recycle-quiz');

console.log('\n========================================================');
console.log(`📊 FINAL RESULT: ${passed} PASSED / FAILED: ${failed}`);
console.log('========================================================');

if (failed > 0) process.exit(1);
