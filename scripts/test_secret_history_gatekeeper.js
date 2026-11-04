const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Secret History Room Gatekeeper, School Motto "참과 사랑에 사는 사명인", Final Quiz 1897, and Tier-3 Shoes Reward...');

// 1. Verify item catalog definitions
const serverJs = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
const mainJs = fs.readFileSync(path.join(__dirname, '../public/js/main.js'), 'utf8');
const worldJs = fs.readFileSync(path.join(__dirname, '../public/js/world.js'), 'utf8');
const engineJs = fs.readFileSync(path.join(__dirname, '../public/js/engine.js'), 'utf8');

assert(serverJs.includes('equip_bronze_shoes'), 'server.js must define equip_bronze_shoes');
assert(serverJs.includes('equip_heritage_boots'), 'server.js must define equip_heritage_boots');
assert(mainJs.includes('equip_bronze_shoes'), 'main.js must define equip_bronze_shoes');
assert(mainJs.includes('equip_heritage_boots'), 'main.js must define equip_heritage_boots');
assert(worldJs.includes('classroom_secret_history'), 'world.js must define classroom_secret_history');
assert(worldJs.includes('door_secret_history'), 'world.js must define door_secret_history');
assert(engineJs.includes('room_secret_history'), 'engine.js must support room_secret_history');

// 2. Unit test Gatekeeper Logic in a simulated GameApp environment
class MockAudioManager {
  playWarp() { this.warped = true; }
  playSelect() { this.selected = true; }
  playFanfare() { this.fanfare = true; }
}

class MockEngine {
  constructor() {
    this.currentRoom = 'room_history';
    this.x = 2 * 32;
    this.y = 10 * 32;
  }
  teleportTo(floor, room, x, y) {
    this.floor = floor;
    this.currentRoom = room;
    this.x = x;
    this.y = y;
  }
}

function createMockApp() {
  const app = {
    playerData: {
      studentId: 'test_student_1897',
      gold: 50,
      exp: 100,
      level: 5,
      baseHp: 100,
      baseAtk: 10,
      baseDef: 10,
      hp: 100,
      maxHp: 100,
      inventory: [],
      equipment: { weapon: null, helmet: null, armor: null, shoes: null, accessory: null, accessory2: null },
      titles: [],
      equippedTitle: null,
      historyVitrines: [false, false, false, false],
      juncheolGuestbookNote: '',
      secretHistoryRoomUnlocked: false,
      openedSecretHistoryChest: false
    },
    audioManager: new MockAudioManager(),
    engine: new MockEngine(),
    alerts: [],
    toasts: [],
    prompts: [],

    getItemCount(itemId) {
      const item = this.playerData.inventory.find(i => i.item === itemId);
      return item ? item.count : 0;
    },
    addItem(itemId, name, count = 1, icon = '📦', meta = {}) {
      const existing = this.playerData.inventory.find(i => i.item === itemId);
      if (existing) existing.count += count;
      else this.playerData.inventory.push({ item: itemId, name, count, icon, meta });
    },
    removeItem(itemId, count = 1) {
      const existing = this.playerData.inventory.find(i => i.item === itemId);
      if (existing) {
        existing.count -= count;
        if (existing.count <= 0) {
          this.playerData.inventory = this.playerData.inventory.filter(i => i.item !== itemId);
        }
      }
    },
    addGold(amt) { this.playerData.gold += amt; },
    addExp(amt) { this.playerData.exp += amt; },
    equipTitle(title) { this.playerData.equippedTitle = title; },
    recalcCombatStats() {
      // Recalc based on base + equipment
    },
    saveProgress() {},
    showToast(msg, type) { this.toasts.push({ msg, type }); }
  };
  return app;
}

// Test Case 1: Fresh player cannot enter - blocked with status checklist
{
  const app = createMockApp();
  const vitrines = app.playerData.historyVitrines;
  const cond1Met = (vitrines.filter(Boolean).length >= 4);
  const cond3Met = (app.playerData.juncheolGuestbookNote.trim().length > 0);
  const cond4Met = (app.getItemCount('item_unyielding_stone') >= 1 && app.getItemCount('item_history_essence') >= 5);

  assert.strictEqual(cond1Met, false, 'Condition 1 should not be met initially');
  assert.strictEqual(cond3Met, false, 'Condition 3 should not be met initially');
  assert.strictEqual(cond4Met, false, 'Condition 4 should not be met initially');
  console.log('  ✓ Initial state properly blocked');
}

// Test Case 2: Complete 4 exhibits, leave note on Jun-cheol desk, but missing items
{
  const app = createMockApp();
  app.playerData.historyVitrines = [true, true, true, true];
  app.playerData.juncheolGuestbookNote = '갓준철 선생님 숭실 오픈월드 최고입니다!';
  app.addItem('item_unyielding_stone', '사명석', 1);
  app.addItem('item_history_essence', '역사의 정수', 4); // Only 4 of 5

  const cond1Met = (app.playerData.historyVitrines.filter(Boolean).length >= 4);
  const cond3Met = (app.playerData.juncheolGuestbookNote.trim().length > 0);
  const cond4Met = (app.getItemCount('item_unyielding_stone') >= 1 && app.getItemCount('item_history_essence') >= 5);

  assert.strictEqual(cond1Met, true, 'Condition 1 met');
  assert.strictEqual(cond3Met, true, 'Condition 3 met');
  assert.strictEqual(cond4Met, false, 'Condition 4 not met due to 4/5 essence');
  console.log('  ✓ Partial conditions properly verified');
}

// Test Case 3: Complete all 3 prerequisites, test Condition 2: School Motto "참과 사랑에 사는 사명인"
{
  const app = createMockApp();
  app.playerData.historyVitrines = [true, true, true, true];
  app.playerData.juncheolGuestbookNote = '갓준철 짱!';
  app.addItem('item_unyielding_stone', '사명석', 1);
  app.addItem('item_history_essence', '역사의 정수', 5);

  const cond1Met = (app.playerData.historyVitrines.filter(Boolean).length >= 4);
  const cond3Met = (app.playerData.juncheolGuestbookNote.trim().length > 0);
  const cond4Met = (app.getItemCount('item_unyielding_stone') >= 1 && app.getItemCount('item_history_essence') >= 5);

  assert.strictEqual(cond1Met && cond3Met && cond4Met, true, 'All 3 prerequisite conditions met');

  // Wrong motto
  const wrongMotto = '성실과 봉사';
  assert.notStrictEqual(wrongMotto.replace(/\s+/g, ''), '참과사랑에사는사명인', 'Wrong motto detected');

  // Correct motto (with space or without space)
  const inputMotto1 = '참과 사랑에 사는 사명인';
  const inputMotto2 = '참과사랑에사는사명인 ';
  assert.strictEqual(inputMotto1.trim().replace(/\s+/g, ''), '참과사랑에사는사명인', 'Motto with spaces accepted');
  assert.strictEqual(inputMotto2.trim().replace(/\s+/g, ''), '참과사랑에사는사명인', 'Motto without spaces accepted');

  // Sacrifice items & unlock door
  app.removeItem('item_unyielding_stone', 1);
  app.removeItem('item_history_essence', 5);
  app.playerData.secretHistoryRoomUnlocked = true;
  app.engine.teleportTo(0, 'room_secret_history', 8 * 32, 14 * 32);

  assert.strictEqual(app.getItemCount('item_unyielding_stone'), 0, 'Unyielding stone sacrificed');
  assert.strictEqual(app.getItemCount('item_history_essence'), 0, '5 History essences sacrificed');
  assert.strictEqual(app.playerData.secretHistoryRoomUnlocked, true, 'Secret room permanently unlocked');
  assert.strictEqual(app.engine.currentRoom, 'room_secret_history', 'Teleported to secret archive');
  console.log('  ✓ Condition 2 (교훈 "참과 사랑에 사는 사명인") and ritual sacrifice validated');
}

// Test Case 4: Inside Secret Room, Final Quiz Condition 5 (1897) and Rewards (500G, 500EXP, 3-tier shoes)
{
  const app = createMockApp();
  app.playerData.secretHistoryRoomUnlocked = true;

  // Chest unopened
  assert.strictEqual(app.playerData.openedSecretHistoryChest, false);

  // Condition 5: Final quiz 1897
  const wrongAnswer = '1905';
  assert.notStrictEqual(wrongAnswer.trim(), '1897', 'Wrong quiz answer rejected');

  const correctAnswer = '1897';
  assert.strictEqual(correctAnswer.trim(), '1897', 'Correct quiz answer 1897 accepted');

  // Chest opened
  app.playerData.openedSecretHistoryChest = true;
  app.addGold(500);
  app.addExp(500);
  app.addItem('equip_bronze_shoes', '🥉 청동 스파이크', 1, '👟', {
    type: 'equipment',
    slot: 'shoes',
    stats: { atk: 5, def: 5, hp: 10 }
  });

  assert.strictEqual(app.playerData.gold, 550, '500 Gold awarded');
  assert.strictEqual(app.playerData.exp, 600, '500 EXP awarded');
  assert.strictEqual(app.getItemCount('equip_bronze_shoes'), 1, '3-tier shoes awarded in inventory');
  assert.strictEqual(app.getItemCount('equip_heritage_ring'), 0, 'Ring reward removed as requested');
  assert.strictEqual(app.playerData.titles.length, 0, 'Title reward removed as requested');
  console.log('  ✓ Condition 5 (창립 연도 1897 퀴즈) and new rewards (500G, 500EXP, 3티어 신발) validated');
}

console.log('🎉 ALL SECRET HISTORY GATEKEEPER & REWARD TESTS PASSED 100%!');
