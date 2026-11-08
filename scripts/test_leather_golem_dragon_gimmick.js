const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: Leather Golem 1:1 Raid, Wood Set Gimmick & Bronze Dragon (v=233) ===\n');

global.window = global;

// 1. Check ALL_GAME_ITEMS in server.js and main.js
const serverJs = fs.readFileSync('server.js', 'utf8');
const mainJs = fs.readFileSync('public/js/main.js', 'utf8');
const worldJs = fs.readFileSync('public/js/world.js', 'utf8');
const engineJs = fs.readFileSync('public/js/engine.js', 'utf8');
const html = fs.readFileSync('public/index.html', 'utf8');

console.log('1. Verifying ALL_GAME_ITEMS synchronization...');
assert(serverJs.includes("'item_golem_weakness_scroll':"), "server.js must contain 'item_golem_weakness_scroll'");
assert(mainJs.includes("'item_golem_weakness_scroll':"), "main.js must contain 'item_golem_weakness_scroll'");

const sMatch = serverJs.match(/const ALL_GAME_ITEMS = \{([\s\S]*?)\};/);
const mMatch = mainJs.match(/const ALL_GAME_ITEMS = \{([\s\S]*?)\};/);
const sKeys = sMatch[1].match(/'[a-zA-Z0-9_]+':/g) || [];
const mKeys = mMatch[1].match(/'[a-zA-Z0-9_]+':/g) || [];
console.log(`  -> Server items count: ${sKeys.length}, Client items count: ${mKeys.length}`);
assert.strictEqual(sKeys.length, 46, "Server ALL_GAME_ITEMS must have exactly 46 items");
assert.strictEqual(mKeys.length, 46, "Client ALL_GAME_ITEMS must have exactly 46 items");
console.log('  [PASS] Item database synchronized at 46 items.');

// 2. Verifying 1-2 classroom_702 boss definition
console.log('\n2. Verifying 1-2 classroom_702 boss definition...');
eval(worldJs); // Loads window.WORLD_DATA into node global
assert(global.WORLD_DATA, "WORLD_DATA must be loaded");
const cr702 = global.WORLD_DATA.classroom_702;
assert(cr702, "classroom_702 must exist");
assert(cr702.boss, "classroom_702 must have boss");
assert.strictEqual(cr702.boss.id, "boss_leather_golem", "Boss ID must be 'boss_leather_golem'");
assert(cr702.boss.name.includes("가죽 골렘"), "Boss name must be '가죽 골렘'");
assert.strictEqual(cr702.boss.maxHp, 2000, "Boss default maxHp must be 2000");
console.log('  [PASS] 1-2 Leather Golem boss configured correctly.');

// 3. Verifying Playground Bronze Dragon boss definition
console.log('\n3. Verifying Playground Bronze Dragon boss definition...');
const pg = global.WORLD_DATA.playground;
assert(pg, "playground must exist");
assert(pg.boss, "playground.boss must exist");
assert.strictEqual(pg.boss.id, "boss_bronze_dragon", "Playground boss ID must be 'boss_bronze_dragon'");
assert(pg.boss.name.includes("청동 드래곤"), "Playground boss name must include '청동 드래곤'");
assert.strictEqual(pg.boss.x, 18, "Bronze dragon x must be 18 (soccer field)");
assert.strictEqual(pg.boss.y, 35, "Bronze dragon y must be 35 (soccer field)");
assert.strictEqual(pg.boss.maxHp, 5000, "Bronze dragon maxHp must be 5000");
console.log('  [PASS] Bronze Dragon configured on soccer field at (18, 35).');

// 4. Verifying Han Kang-woo NPC and wood set gimmick logic
console.log('\n4. Verifying Han Kang-woo NPC and wood set gimmick logic...');
const floor1Hallway = global.WORLD_DATA.floors[7];
const kangwooNpc = floor1Hallway.npcs.find(n => n.id === 'npc_teacher_kangwoo');
assert(kangwooNpc, "npc_teacher_kangwoo must exist in Floor 1 hallway");
assert.strictEqual(kangwooNpc.x, 22, "Han Kang-woo x must be 22");
assert.strictEqual(kangwooNpc.y, 5, "Han Kang-woo y must be 5");
assert(kangwooNpc.dialogue.includes("가죽 골렘"), "Dialogue must mention 가죽 골렘");
assert(kangwooNpc.dialogue.includes("나무 세트 3종"), "Dialogue must mention 나무 세트 3종");
assert(kangwooNpc.dialogue.includes("청동 드래곤"), "Dialogue must mention 청동 드래곤 축구장 이동");

// Mock MainApp to test gimmick execution
class MockApp {
  constructor() {
    this.playerData = {
      equipment: { weapon: null, helmet: null, armor: null, shoes: null, accessory: null },
      inventory: {},
      atk: 25,
      def: 10,
      hp: 100,
      maxHp: 100
    };
    this.bossState = {};
    this.engine = { player: { room: 'room_702' } };
  }
  isItemEquipped(id) {
    return Object.values(this.playerData.equipment || {}).some(eq => eq && eq.item === id);
  }
  hasItem(id) {
    return (this.playerData.inventory[id] && this.playerData.inventory[id] > 0);
  }
  addItem(id, name, count, icon, meta) {
    this.playerData.inventory[id] = (this.playerData.inventory[id] || 0) + count;
  }
  saveProgress() {}
}

// Extract handleTeacherKangwooInteraction from main.js
const kwMethodMatch = mainJs.match(/handleTeacherKangwooInteraction\(npc\)\s*\{([\s\S]*?)\n  \}/);
assert(kwMethodMatch, "handleTeacherKangwooInteraction must exist in main.js");
MockApp.prototype.handleTeacherKangwooInteraction = new Function('npc', kwMethodMatch[1]);

// Test 4A: Without wood set
const mock = new MockApp();
let dialogShown = null;
global.window = {
  RPGDialog: {
    show: (title, msg, icon) => { dialogShown = { title, msg, icon }; }
  },
  showItemToast: () => {},
  BOSS_CONFIG: { active: false, maxHp: 2000 }
};

mock.handleTeacherKangwooInteraction(kangwooNpc);
assert(dialogShown, "Dialog must be shown");
assert(!mock.hasItem('item_golem_weakness_scroll'), "Should NOT receive scroll without wood set");
assert(dialogShown.msg.includes("나무 세트 3종"), "Should prompt player about wood set 3 pieces");
console.log('  [PASS] 4A: Correctly rejects giving scroll without full wood set.');

// Test 4B: With only 2 wood pieces equipped
mock.playerData.equipment.weapon = { item: 'equip_wood_sword' };
mock.playerData.equipment.helmet = { item: 'equip_wood_helmet' };
dialogShown = null;
mock.handleTeacherKangwooInteraction(kangwooNpc);
assert(!mock.hasItem('item_golem_weakness_scroll'), "Should NOT receive scroll with partial wood set");
console.log('  [PASS] 4B: Correctly requires all 3 wood pieces (not 2).');

// Test 4C: With full wood set (sword, helmet, armor)
mock.playerData.equipment.armor = { item: 'equip_wood_armor' };
dialogShown = null;
mock.handleTeacherKangwooInteraction(kangwooNpc);
assert(mock.hasItem('item_golem_weakness_scroll'), "MUST receive 'item_golem_weakness_scroll' with full wood set!");
assert(dialogShown.msg.includes("골렘 연화 비책"), "Dialog must confirm receiving the scroll");
assert(dialogShown.msg.includes("절반(2,000 HP ➔ 1,000 HP)"), "Dialog must state HP reduction to 1000");
console.log('  [PASS] 4C: Correctly awards scroll with full wood set.');

// Test 4D: Talking again with scroll already owned
dialogShown = null;
mock.handleTeacherKangwooInteraction(kangwooNpc);
assert(dialogShown.msg.includes("이미 1-2반 가죽 골렘의 거친 기운을 절반"), "Should remind player of existing scroll");
console.log('  [PASS] 4D: Correctly handles repeat conversation with scroll.');

// 5. Verifying Solo Raid & 50% HP Cut Gimmick in openBossRaid
console.log('\n5. Verifying Solo Raid & 50% HP Cut Gimmick with Confirm Prompt in openBossRaid...');
// Extract openBossRaid logic snippet
const raidLogicMatch = mainJs.match(/openBossRaid\(bossData\)\s*\{([\s\S]*?)\n  \}/);
assert(raidLogicMatch, "openBossRaid must exist in main.js");

// Mock DOM elements required by openBossRaid
const mockDomElements = {
  'boss-raid-title': { innerText: '' },
  'boss-name-label': { innerText: '' },
  'boss-hp-text': { innerText: '' },
  'boss-hp-fill': { style: {} },
  'raid-player-name-label': { innerText: '' },
  'raid-player-hp': { innerText: '' },
  'raid-player-hp-fill': { style: {} },
  'raid-battle-log': { innerHTML: '' },
  'raid-quiz-question': { innerText: '' },
  'raid-quiz-options': { innerHTML: '' },
  'raid-weakness-alert-banner': {
    innerText: '',
    style: { display: 'none' },
    classList: {
      remove: (c) => {},
      add: (c) => {}
    }
  }
};

global.document = {
  getElementById: (id) => mockDomElements[id] || {
    innerText: '',
    innerHTML: '',
    style: {},
    classList: { remove: () => {}, add: () => {}, contains: () => false },
    querySelectorAll: () => []
  }
};
MockApp.prototype.recalcCombatStats = function() {};
MockApp.prototype.updateBossRaidUI = function() {};
MockApp.prototype.updateBossRaidTimerOnly = function() {};
MockApp.prototype.loadNextBossQuestion = function() {};
MockApp.prototype.modalBossRaid = { classList: { remove: () => {}, add: () => {}, contains: () => false } };
MockApp.prototype.openBossRaid = new Function('bossData', raidLogicMatch[1]);

// Test 5A: Without weakness scroll -> confirm is NOT called, Golem HP is 2,000, banner hidden, no extra guidance
const mockNormal = new MockApp();
let confirmCallCount = 0;
global.confirm = () => { confirmCallCount++; return true; };
global.window.BOSS_CONFIG = { active: false, mode: 'solo' };
mockNormal.openBossRaid(cr702.boss);
if (mockNormal.bossTimerInterval) clearInterval(mockNormal.bossTimerInterval);
assert.strictEqual(confirmCallCount, 0, "confirm popup must NOT be shown when player has no scroll");
assert.strictEqual(global.window.BOSS_CONFIG.maxHp, 2000, "Without scroll, Golem maxHp must remain 2000");
assert.strictEqual(mockNormal.bossState.maxHp, 2000, "Without scroll, bossState.maxHp must remain 2000");
assert.strictEqual(global.window.BOSS_CONFIG.isWeakened, false, "Without scroll, isWeakened must be false");
assert.strictEqual(mockDomElements['raid-weakness-alert-banner'].style.display, 'none', "Banner must be hidden without scroll");
assert(!mockDomElements['raid-battle-log'].innerHTML.includes('골렘 연화 비책 발동'), "Battle log must not contain gimmick text");
console.log('  [PASS] 5A: Without scroll, HP remains 2000 without popup, banner hidden, extra guidance omitted.');

// Test 5B: WITH weakness scroll -> confirm is called, if user confirms (true) -> HP 1000 (50% cut), banner lights up!
const mockScrollConfirm = new MockApp();
mockScrollConfirm.playerData.inventory['item_golem_weakness_scroll'] = 1;
confirmCallCount = 0;
let confirmMessage = '';
global.confirm = (msg) => { confirmCallCount++; confirmMessage = msg; return true; };
global.window.BOSS_CONFIG = { active: false, mode: 'solo' };
mockScrollConfirm.openBossRaid(cr702.boss);
if (mockScrollConfirm.bossTimerInterval) clearInterval(mockScrollConfirm.bossTimerInterval);
assert.strictEqual(confirmCallCount, 1, "confirm popup MUST be called when player has scroll");
assert(confirmMessage.includes("사용하시겠습니까"), "confirm message must ask if player wants to use the scroll");
assert.strictEqual(global.window.BOSS_CONFIG.maxHp, 1000, "WITH scroll confirmed, Golem maxHp must be 1000 (halved!)");
assert.strictEqual(mockScrollConfirm.bossState.maxHp, 1000, "WITH scroll confirmed, bossState.maxHp must be 1000 (halved!)");
assert.strictEqual(global.window.BOSS_CONFIG.isWeakened, true, "WITH scroll confirmed, isWeakened must be true");
assert.strictEqual(mockDomElements['raid-weakness-alert-banner'].style.display, 'block', "Banner must light up (display: block)");
assert.strictEqual(mockDomElements['raid-weakness-alert-banner'].innerText, '✨ [골렘 연화 비책 발동] 한강우 선생님의 비책으로 가죽 골렘의 체력이 50% 약화되었습니다! (HP 1,000)');
console.log('  [PASS] 5B: WITH scroll confirmed, HP halved to 1,000 and top alert banner lights up immediately!');

// Test 5C: WITH weakness scroll, but user cancels (false) in confirm popup -> HP remains 2000, banner hidden!
const mockScrollCancel = new MockApp();
mockScrollCancel.playerData.inventory['item_golem_weakness_scroll'] = 1;
confirmCallCount = 0;
global.confirm = (msg) => { confirmCallCount++; return false; };
global.window.BOSS_CONFIG = { active: false, mode: 'solo' };
mockScrollCancel.openBossRaid(cr702.boss);
if (mockScrollCancel.bossTimerInterval) clearInterval(mockScrollCancel.bossTimerInterval);
assert.strictEqual(confirmCallCount, 1, "confirm popup must be called when player has scroll");
assert.strictEqual(global.window.BOSS_CONFIG.maxHp, 2000, "If user cancels, Golem maxHp must stay 2000");
assert.strictEqual(mockScrollCancel.bossState.maxHp, 2000, "If user cancels, bossState.maxHp must stay 2000");
assert.strictEqual(global.window.BOSS_CONFIG.isWeakened, false, "If user cancels, isWeakened must be false");
assert.strictEqual(mockDomElements['raid-weakness-alert-banner'].style.display, 'none', "If user cancels, banner must be hidden");
console.log('  [PASS] 5C: If user cancels confirm popup, HP stays 2000 and banner is hidden.');

// Test 5D: Challenge Bronze Dragon on playground soccer field
const mockDragon = new MockApp();
mockDragon.engine.player.room = 'playground';
global.window.BOSS_CONFIG = { active: false, mode: 'solo' };
mockDragon.openBossRaid(pg.boss);
if (mockDragon.bossTimerInterval) clearInterval(mockDragon.bossTimerInterval);
assert.strictEqual(global.window.BOSS_CONFIG.name, '🐲 고대 청동 드래곤', "Dragon raid name must match");
assert.strictEqual(global.window.BOSS_CONFIG.maxHp, 5000, "Dragon maxHp must be 5000");
console.log('  [PASS] 5D: Bronze Dragon on soccer field is challengeable in solo mode.');

// 6. Verifying index.html banner structure
console.log('\n6. Verifying index.html raid-weakness-alert-banner...');
assert(html.includes('id="raid-weakness-alert-banner"'), "index.html must contain raid-weakness-alert-banner element");
assert(html.includes('✨ [골렘 연화 비책 발동] 한강우 선생님의 비책으로 가죽 골렘의 체력이 50% 약화되었습니다! (HP 1,000)'), "Banner must have exact alert text");
console.log('  [PASS] index.html banner element verified.');

// 7. Verifying HTML version tag
console.log('\n7. Verifying HTML cache buster v=233...');
assert(html.includes('v=233'), "index.html must use v=233");
assert(!html.includes('v=232'), "index.html must not contain legacy v=232");
console.log('  [PASS] Cache buster v=233 fully applied.');

console.log('\n======================================================');
console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! (Confirmed Gimmick Logic Verified)');
console.log('======================================================');
process.exit(0);
