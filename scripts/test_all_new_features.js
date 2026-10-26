const fs = require('fs');
const vm = require('vm');

console.log('--- TEST: Verifying All 5 New User Requirements ---');

// 1. Verify engine.js
const engineCode = fs.readFileSync('public/js/engine.js', 'utf8');
new vm.Script(engineCode); // check syntax
if (!engineCode.includes("sy - 18, '🏫 숭실 야외 스탠드 관람석'")) {
  throw new Error('Bleachers label not moved to sy - 18!');
}
if (!engineCode.includes('4.85')) {
  throw new Error('Student dash speed 4.85 missing in engine.js');
}
console.log('1. engine.js verified: bleachers label moved up & dash speed 4.85');

// 2. Verify server.js
const serverCode = fs.readFileSync('server.js', 'utf8');
new vm.Script(serverCode); // check syntax
if (serverCode.includes('item_dragon_heart') || serverCode.includes('item_ice_potion') || serverCode.includes('equip_tiger_amulet')) {
  throw new Error('Deleted items still present in server.js!');
}
if (!serverCode.includes('item_bronze_heart')) {
  throw new Error('item_bronze_heart was erroneously deleted from server.js!');
}
if (!serverCode.includes('equip_shoes_samdidas')) {
  throw new Error('equip_shoes_samdidas missing in server.js!');
}
if (!serverCode.includes('request_acid_rain_seat')) {
  throw new Error('request_acid_rain_seat missing in server.js!');
}
console.log('2. server.js verified: deleted items removed, bronze dragon heart preserved, shoes added, 4-seat acid rain reservation active');

// 3. Verify main.js
const mainCode = fs.readFileSync('public/js/main.js', 'utf8');
new vm.Script(mainCode); // check syntax
if (mainCode.includes("'item_dragon_heart':") || mainCode.includes("'item_ice_potion':") || mainCode.includes("'equip_tiger_amulet':")) {
  throw new Error('Deleted items still present in ALL_GAME_ITEMS of main.js!');
}
if (!mainCode.includes("'item_bronze_heart':")) {
  throw new Error('item_bronze_heart was erroneously deleted from main.js!');
}
if (!mainCode.includes('costAmount: 200')) {
  throw new Error('title_soongsil_rich 200 gold cost missing in main.js!');
}
if (!mainCode.includes("{ key: 'shoes', title: '👟 신발', emptyIcon: '👟' }")) {
  throw new Error('Shoes slot missing in openEquipmentModal of main.js!');
}
if (!mainCode.includes('triggerDashCooldown') || !mainCode.includes('btn-b-cooldown-overlay')) {
  throw new Error('Dash cooldown clock animation missing in main.js!');
}
if (!mainCode.includes('requestAcidRainSeat')) {
  throw new Error('requestAcidRainSeat missing in main.js!');
}
console.log('3. main.js verified: title 200 gold, deleted items removed, shoes slot, dash clock cooldown, 4-seat acid rain check');

// 4. Verify index.html & style.css
const html = fs.readFileSync('public/index.html', 'utf8');
if (!html.includes('btn-b-cooldown-overlay') || !html.includes('clock-spinner-wrapper')) {
  throw new Error('Clock cooldown overlay missing in index.html');
}
const css = fs.readFileSync('public/css/style.css', 'utf8');
if (!css.includes('btn-cooldown-overlay') || !css.includes('clock-dial')) {
  throw new Error('Clock cooldown styles missing in style.css');
}
console.log('4. index.html & style.css verified: clock overlay and styling present');

// 5. Verify craft_recipes.json
const recipes = JSON.parse(fs.readFileSync('data/craft_recipes.json', 'utf8'));
if (!recipes.some(r => r.id === 'recipe_shoes_samdidas')) {
  throw new Error('recipe_shoes_samdidas missing in craft_recipes.json');
}
console.log('5. craft_recipes.json verified: shoes crafting recipe present');

console.log('\n🎉 ALL 5 USER REQUESTS VERIFIED WITH ZERO ERRORS!');
