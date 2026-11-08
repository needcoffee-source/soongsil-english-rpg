const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('========================================================');
console.log('🧪 TESTING 2004 TIME CAPSULE & VIRTUES ACCESSORY 2 QUEST (v=226)');
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

// 2. 14번 교감선생님 NPC Check
test('WORLD_DATA staff office npcs contains 14번 교감선생님', () => {
  const worldCode = fs.readFileSync('public/js/world.js', 'utf8');
  eval(worldCode);
  const office = WORLD_DATA.classroom_staff_office || WORLD_DATA.staff_office;
  assert(office && office.npcs, 'staff office npcs not found');
  const npcs = office.npcs;
  const vp = npcs.find(n => n.id === 'npc_teacher_vice_principal');
  assert(vp, 'npc_teacher_vice_principal not found in staff_office');
  assert.strictEqual(vp.name, '교감선생님');
  assert.strictEqual(vp.seatId, 14);
  assert.strictEqual(vp.seatLabel, '14');
  assert.strictEqual(vp.avatar, 'teacher');
  assert.strictEqual(vp.x, 41.0);
  assert.strictEqual(vp.y, 20.875);
});

// 3. Engine Checks
test('engine.js includes time_capsule & capsule_clue routing and 14번 교감선생님 desk badge', () => {
  const engineCode = fs.readFileSync('public/js/engine.js', 'utf8');
  assert(engineCode.includes("type: 'time_capsule'"));
  assert(engineCode.includes("type: 'capsule_clue'"));
  assert(engineCode.includes('drawHighResTimeCapsule'));
  assert(engineCode.includes('drawHighResCapsuleNote'));
  assert(engineCode.includes('isVicePrincipalDesk'));
  assert(engineCode.includes('🏫 교감선생님'));
});

// 4. MainApp & Quest Checks
test('main.js handles time_capsule, capsule_clue, and vice principal routing', () => {
  const mainCode = fs.readFileSync('public/js/main.js', 'utf8');
  assert(mainCode.includes("target.type === 'time_capsule'"));
  assert(mainCode.includes("target.type === 'capsule_clue'"));
  assert(mainCode.includes("npc.id === 'npc_teacher_vice_principal'"));
  assert(mainCode.includes('handleVicePrincipalInteraction'));
  assert(mainCode.includes('openVicePrincipalCapsuleModal'));
  assert(mainCode.includes('claimTimeCapsuleFromVicePrincipal'));
  assert(mainCode.includes('renderVicePrincipalVirtuesQuest'));
});

test('Password deduction matches 3 - 5 - 0 - 4 in code', () => {
  const mainCode = fs.readFileSync('public/js/main.js', 'utf8');
  assert(mainCode.includes('dials[0] === 3 && dials[1] === 5 && dials[2] === 0 && dials[3] === 4'));
});

test('Reward item stats adjusted: atk: 3, def: 3 (no hp), sell price 0 (매각 불가)', () => {
  const serverCode = fs.readFileSync('server.js', 'utf8');
  const mainCode = fs.readFileSync('public/js/main.js', 'utf8');

  assert(serverCode.includes("'equip_vintage_armband'"));
  assert(mainCode.includes("'equip_vintage_armband'"));

  // Check stats strictly { atk: 3, def: 3 }
  assert(serverCode.includes('stats: { atk: 3, def: 3 }'), 'server stats must be atk: 3, def: 3');
  assert(mainCode.includes('stats: { atk: 3, def: 3 }'), 'client stats must be atk: 3, def: 3');
  assert(!serverCode.includes('stats: { atk: 3, def: 3, hp: 3 }'), 'server must not have hp in stats');
  assert(!mainCode.includes('stats: { atk: 3, def: 3, hp: 3 }'), 'client must not have hp in stats');

  // Check EXP +10% booster
  assert(mainCode.includes("hasVintageArmband"), 'main.js must implement hasVintageArmband in addExp');
  assert(mainCode.includes("모든 획득 경험치(EXP) +10% 증가"), 'effect description must state EXP +10% booster');

  // Check sell price is 0
  assert(mainCode.includes("'equip_vintage_armband': 0"), 'sell price must be 0 (매각 불가)');
  assert(mainCode.includes("invItem.item === 'equip_vintage_armband'"), 'store modal must block selling armband');
});

// 5. Follow-up Quest: Virtues & Accessory 2 Unlock Checks
test('Virtues Quest requires Level 10 and 1차 퀘스트 completion for 3 virtues (체, 덕, 지)', () => {
  const mainCode = fs.readFileSync('public/js/main.js', 'utf8');
  assert(mainCode.includes('pLevel >= 10'), 'level >= 10 check required');
  assert(mainCode.includes('this.playerData.timeCapsuleRewardClaimed && this.playerData.virtuePhysiqueDone'), 'physique virtue must require 1st quest completion');
  assert(mainCode.includes('this.playerData.timeCapsuleRewardClaimed && this.playerData.virtueMannerDone'), 'manner virtue must require 1st quest completion');
  assert(mainCode.includes('virtueWisdomLibrary') && mainCode.includes('virtueWisdomMuseum'), 'wisdom virtue check required');
});

test('Final History Quiz options: Q1 is Baird (Option 3), Q2 is Truth Reverence (Option 2) - neither is Option 1', () => {
  const indexHtml = fs.readFileSync('public/index.html', 'utf8');
  const mainCode = fs.readFileSync('public/js/main.js', 'utf8');

  // Verify questions text
  assert(indexHtml.includes('베어드(배위량) 박사'), 'Q1 option Baird must exist');
  assert(indexHtml.includes('진실을 숭상한다'), 'Q2 option Truth Reverence must exist');

  // Verify answer validation logic
  assert(mainCode.includes("q1Val === '3' && q2Val === '2'"), 'Q1 must be 3 and Q2 must be 2');
  assert(!mainCode.includes("q1Val === '1'"), 'Q1 answer must NOT be option 1');
  assert(!mainCode.includes("q2Val === '1'"), 'Q2 answer must NOT be option 1');

  // Verify reward unlocks isAccessory2Unlocked and +300 EXP (title removed)
  assert(mainCode.includes('this.playerData.isAccessory2Unlocked = true'));
  assert(mainCode.includes('this.addExp(300)'));
  assert(!mainCode.includes("title_soongsil_virtues_master'"), 'title_soongsil_virtues_master should be removed from rewards');
});

test('Modals and rolling paper elements exist in index.html for both bleachers and Vice Principal', () => {
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
    'btn-capsule-unlock',
    'modal-time-capsule-open',
    'btn-close-capsule-open-x',
    'btn-close-capsule-open-bottom',
    'modal-vice-principal-capsule',
    'btn-close-vp-modal-x',
    'btn-close-vp-modal-bottom',
    'vp-reward-action-section',
    'vp-reward-claimed-section',
    'input-vp-capsule-msg',
    'btn-submit-vp-capsule',
    'vp-capsule-notes-list',
    'vp-virtues-quest-section',
    'vp-virtues-level-badge',
    'vp-virtues-completed-view',
    'vp-virtues-inprogress-view',
    'vp-badge-physique',
    'vp-badge-virtue',
    'vp-badge-wisdom',
    'vp-virtues-lock-notice',
    'vp-virtues-quiz-box',
    'btn-submit-vp-quiz'
  ];

  requiredIds.forEach(id => {
    assert(indexHtml.includes(`id="${id}"`), `Element ID ${id} missing in index.html`);
  });
});

test('Cache-buster tag v=226 is cleanly applied in index.html', () => {
  const indexHtml = fs.readFileSync('public/index.html', 'utf8');
  const matches = (indexHtml.match(/v=226/g) || []).length;
  assert(matches >= 8, `Expected at least 8 v=226 tags, found ${matches}`);
  assert(!indexHtml.includes('v=210'), 'Found stale v=210 tag in index.html');
});

console.log(`\n========================================================`);
console.log(`📊 FINAL RESULT: ${passed} PASSED / FAILED: ${failed}`);
console.log(`========================================================\n`);

if (failed > 0) process.exit(1);
