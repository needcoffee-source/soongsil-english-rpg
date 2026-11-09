const assert = require('assert');
const fs = require('fs');

console.log('🧪 Starting test_store_and_floor3.js...\n');

// 1. Test public/index.html
const indexHtml = fs.readFileSync('public/index.html', 'utf8');
assert(!indexHtml.includes('(Career Center)'), 'index.html should not contain (Career Center)');
assert(!indexHtml.includes('(Health & Wee)'), 'index.html should not contain (Health & Wee)');
assert(!indexHtml.includes('(Library)'), 'index.html should not contain (Library)');
assert(indexHtml.includes('🌟 5층 — 진로상담실'), 'index.html should contain 🌟 5층 — 진로상담실');
assert(indexHtml.includes('🏥 3층 — 보건실 & Wee클래스'), 'index.html should contain 🏥 3층 — 보건실 & Wee클래스');
assert(indexHtml.includes('📚 2층 — 도서관'), 'index.html should contain 📚 2층 — 도서관');
assert(indexHtml.includes('id="btn-store-mode-buy"'), 'index.html should contain #btn-store-mode-buy');
assert(indexHtml.includes('id="btn-store-mode-sell"'), 'index.html should contain #btn-store-mode-sell');
console.log('✅ Test 1: index.html elevator labels & store modal markup verified.');

// 2. Test world.js
// Mock window
global.window = {};
require('../public/js/world.js');
const WORLD_DATA = global.window.WORLD_DATA;

assert.strictEqual(WORLD_DATA.HALLWAY_FLOOR_3_WIDTH, 30, 'HALLWAY_FLOOR_3_WIDTH should be 30');
const f3 = WORLD_DATA.floors[3];
assert(f3, 'floor 3 data exists');
assert.strictEqual(f3.rooms[0].doorX, 8, 'room_health doorX should be 8');
assert.strictEqual(f3.rooms[1].doorX, 16, 'room_wee doorX should be 16');
assert.strictEqual(f3.elevator.x, 25, 'elevator x should be 25');
assert.strictEqual(f3.interactive[0].x, 21, 'water purifier x should be 21');
assert.strictEqual(f3.interactive[0].y, 12, 'water purifier y should be 12');
console.log('✅ Test 2: world.js Floor 3 width (30 tiles) & coordinates verified.');

// 3. Test main.js
const mainJs = fs.readFileSync('public/js/main.js', 'utf8');
assert(mainJs.includes("id: 'item_nutrition_essence'"), 'item_nutrition_essence exists');
assert(mainJs.includes("id: 'item_stainless_shard'"), 'item_stainless_shard exists');

// Verify tierBadge
const essenceMatch = mainJs.match(/id:\s*'item_nutrition_essence'[\s\S]*?tierBadge:\s*'([^']+)'/);
assert(essenceMatch && essenceMatch[1] === '야외 전리품', `item_nutrition_essence tierBadge should be '야외 전리품', got ${essenceMatch?.[1]}`);

const shardMatch = mainJs.match(/id:\s*'item_stainless_shard'[\s\S]*?tierBadge:\s*'([^']+)'/);
assert(shardMatch && shardMatch[1] === '야외 전리품', `item_stainless_shard tierBadge should be '야외 전리품', got ${shardMatch?.[1]}`);

// Verify STORE_BUY_ITEMS prices
const storeBuyBlock = mainJs.slice(mainJs.indexOf('const STORE_BUY_ITEMS = ['), mainJs.indexOf('window.STORE_BUY_ITEMS = STORE_BUY_ITEMS;'));
const expectedPrices = {
  item_red_potion: 30,
  item_orange_potion: 75,
  item_green_potion: 75,
  item_courage_potion: 75,
  item_revive_scroll: 100,
  item_return_scroll: 100,
  item_teleport_scroll: 300
};

for (const [id, price] of Object.entries(expectedPrices)) {
  const itemRegex = new RegExp(`id:\\s*'${id}'[\\s\\S]*?price:\\s*(\\d+)`);
  const match = storeBuyBlock.match(itemRegex);
  assert(match && parseInt(match[1]) === price, `Item ${id} price should be ${price}, got ${match?.[1]}`);
}
console.log('✅ Test 3: main.js tierBadge (야외 전리품) and Store Buy prices verified.');

// Verify floor 3 warps
assert(mainJs.includes("this.engine.warpToRoom('hallway', '3층 복도 (보건실 & Wee클래스)', 25 * 32, 6 * 32);"), 'Floor 3 warp to 25*32');
assert(!mainJs.includes("'3층 복도 (보건실 & Wee클래스)', 56 * 32"), 'Floor 3 old warp 56*32 should be removed');
console.log('✅ Test 4: Floor 3 warps updated to tile (25, 6).');

console.log('\n🎉 ALL STORE & FLOOR 3 TESTS PASSED PERFECTLY!\n');
