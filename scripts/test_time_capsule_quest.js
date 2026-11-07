const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('========================================================');
console.log('🧪 TESTING 2004 ALUMNI SECRET TIME CAPSULE QUEST (v=209)');
console.log('========================================================\n');

let passed = 0;
let failed = 0;

global.window = global;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

// 1. World Data Checks
test('WORLD_DATA.playground.timeCapsule exists at (27, 7)', () => {
  const worldCode = fs.readFileSync('public/js/world.js', 'utf8');
  eval(worldCode);
  assert(WORLD_DATA.playground.timeCapsule, 'timeCapsule not defined');
  assert.strictEqual(WORLD_DATA.playground.timeCapsule.x, 27);
  assert.strictEqual(WORLD_DATA.playground.timeCapsule.y, 7);
  assert.strictEqual(WORLD_DATA.playground.timeCapsule.type, 'time_capsule');
  assert(WORLD_DATA.playground.timeCapsule.name.includes('선배들의 비밀 타임캡슐'));
});

test('WORLD_DATA.playground has 4 capsule clues with correct positions', () => {
  const worldCode = fs.readFileSync('public/js/world.js', 'utf8');
  eval(worldCode);
  const pg = WORLD_DATA.playground;
  assert(pg.capsuleClue1 && pg.capsuleClue1.x === 10 && pg.capsuleClue1.y === 9 && pg.capsuleClue1.clueIndex === 1);
  assert(pg.capsuleClue2 && pg.capsuleClue2.x === 21 && pg.capsuleClue2.y === 9 && pg.capsuleClue2.clueIndex === 2);
  assert(pg.capsuleClue3 && pg.capsuleClue3.x === 33 && pg.capsuleClue3.y === 9 && pg.capsuleClue3.clueIndex === 3);
  assert(pg.capsuleClue4 && pg.capsuleClue4.x === 44 && pg.capsuleClue4.y === 9 && pg.capsuleClue4.clueIndex === 4);
});

test('Bleachers elements spacing: no overlapping items', () => {
  const worldCode = fs.readFileSync('public/js/world.js', 'utf8');
  eval(worldCode);
  const pg = WORLD_DATA.playground;
  const bleacherItems = [
    { name: 'clue1', x: pg.capsuleClue1.x, y: pg.capsuleClue1.y },
    { name: 'sketchbook', x: pg.sketchbook.x, y: pg.sketchbook.y },
    { name: 'clue2', x: pg.capsuleClue2.x, y: pg.capsuleClue2.y },
    { name: 'timeCapsule', x: pg.timeCapsule.x, y: pg.timeCapsule.y },
    { name: 'clue3', x: pg.capsuleClue3.x, y: pg.capsuleClue3.y },
    { name: 'libraryBook', x: pg.libraryBook.x, y: pg.libraryBook.y },
    { name: 'clue4', x: pg.capsuleClue4.x, y: pg.capsuleClue4.y }
  ];

  for (let i = 0; i < bleacherItems.length; i++) {
    for (let j = i + 1; j < bleacherItems.length; j++) {
      const a = bleacherItems[i];
      const b = bleacherItems[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      assert(dist >= 4, `Items ${a.name} and ${b.name} too close: dist=${dist}`);
    }
  }
});

// 2. Engine Checks
test('engine.js includes time_capsule & capsule_clue interaction routing', () => {
  const engineCode = fs.readFileSync('public/js/engine.js', 'utf8');
  assert(engineCode.includes("type: 'time_capsule'"));
  assert(engineCode.includes("type: 'capsule_clue'"));
  assert(engineCode.includes('drawHighResTimeCapsule'));
  assert(engineCode.includes('drawHighResCapsuleNote'));
});

// 3. MainApp & Quest Checks
test('main.js handles time_capsule & capsule_clue interaction targets', () => {
  const mainCode = fs.readFileSync('public/js/main.js', 'utf8');
  assert(mainCode.includes("target.type === 'time_capsule'"));
  assert(mainCode.includes("target.type === 'capsule_clue'"));
  assert(mainCode.includes('handleCapsuleClue(clueData)'));
  assert(mainCode.includes('handleTimeCapsuleInteraction()'));
  assert(mainCode.includes('openTimeCapsuleLockModal()'));
  assert(mainCode.includes('claimTimeCapsuleSuccess()'));
  assert(mainCode.includes('openTimeCapsuleOpenedModal('));
});

test('Password deduction matches 3 - 5 - 0 - 4 in code', () => {
  const mainCode = fs.readFileSync('public/js/main.js', 'utf8');
  assert(mainCode.includes('dials[0] === 3 && dials[1] === 5 && dials[2] === 0 && dials[3] === 4'));
});

test('Reward item, title and stats defined accurately', () => {
  const serverCode = fs.readFileSync('server.js', 'utf8');
  const mainCode = fs.readFileSync('public/js/main.js', 'utf8');

  assert(serverCode.includes("'equip_vintage_armband'"));
  assert(mainCode.includes("'equip_vintage_armband'"));
  assert(mainCode.includes("'title_time_connector'"));
  assert(mainCode.includes('🕰️ 시간을 잇는 자'));

  // Stat checks: atk: 3, def: 3, hp: 3
  assert(serverCode.includes('stats: { atk: 3, def: 3, hp: 3 }'));
  assert(mainCode.includes('stats: { atk: 3, def: 3, hp: 3 }'));
  assert(mainCode.includes("'equip_vintage_armband': 50"));
});

test('Inscription text strictly matches user requirement', () => {
  const indexHtml = fs.readFileSync('public/index.html', 'utf8');
  const expectedQuote = '2004년 가을, 축구대회 우승과 졸업을 앞두고 3학년 5반 녀석들이 묻다. 후배들아, 20년 뒤에 열어봐라!';
  assert(indexHtml.includes(expectedQuote), 'Exact inscription quote missing in index.html');
});

test('Modals and rolling paper elements exist in index.html', () => {
  const indexHtml = fs.readFileSync('public/index.html', 'utf8');
  const requiredIds = [
    'modal-time-capsule-lock',
    'btn-close-capsule-lock-x',
    'capsule-clue-badge-1',
    'capsule-clue-badge-2',
    'capsule-clue-badge-3',
    'capsule-clue-badge-4',
    'capsule-dial-1',
    'capsule-dial-2',
    'capsule-dial-3',
    'capsule-dial-4',
    'btn-capsule-up-1',
    'btn-capsule-dn-1',
    'btn-capsule-up-2',
    'btn-capsule-dn-2',
    'btn-capsule-up-3',
    'btn-capsule-dn-3',
    'btn-capsule-up-4',
    'btn-capsule-dn-4',
    'btn-capsule-unlock',
    'modal-time-capsule-open',
    'btn-close-capsule-open-x',
    'btn-close-capsule-open-bottom',
    'input-capsule-msg',
    'btn-submit-capsule-msg',
    'capsule-notes-list'
  ];

  requiredIds.forEach(id => {
    assert(indexHtml.includes(`id="${id}"`), `Element ID ${id} missing in index.html`);
  });
});

test('Cache-buster tag v=209 is cleanly applied in index.html', () => {
  const indexHtml = fs.readFileSync('public/index.html', 'utf8');
  const matches = (indexHtml.match(/v=209/g) || []).length;
  assert(matches >= 8, `Expected at least 8 v=209 tags, found ${matches}`);
  assert(!indexHtml.includes('v=208'), 'Found stale v=208 tag in index.html');
});

console.log(`\n========================================================`);
console.log(`📊 FINAL RESULT: ${passed} PASSED / FAILED: ${failed}`);
console.log(`========================================================\n`);

if (failed > 0) process.exit(1);
