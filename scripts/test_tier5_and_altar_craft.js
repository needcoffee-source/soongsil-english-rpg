// Automated Verification for Tier 5 Immortal Set, History Altar Crafting, and Sloth God Balance
const fs = require('fs');
const assert = require('assert');

console.log('🧪 Starting test_tier5_and_altar_craft.js...\n');

// 1. Check craft_recipes.json & crafting.js separation
const craftRecipes = JSON.parse(fs.readFileSync('data/craft_recipes.json', 'utf8'));
const craftingJs = fs.readFileSync('public/js/crafting.js', 'utf8');
const mainJs = fs.readFileSync('public/js/main.js', 'utf8');
const serverJs = fs.readFileSync('server.js', 'utf8');
const worldJs = fs.readFileSync('public/js/world.js', 'utf8');
const indexHtml = fs.readFileSync('public/index.html', 'utf8');

// Load CraftingManager class
global.document = {
  getElementById: (id) => ({
    addEventListener: () => {},
    querySelector: () => ({ innerHTML: '' }),
    innerHTML: '',
    classList: { add: () => {}, remove: () => {} }
  })
};
global.window = {};

eval(craftingJs);
const cm = new global.window.CraftingManager();
cm.recipes = craftRecipes;

// Test Equipment Crafting (복도 장비 제작대)
cm.currentCategory = 'equipment';
const equipRecipes = cm.getFilteredRecipes();
const equipIds = equipRecipes.map(r => r.id);

assert.ok(equipIds.includes('recipe_wood_sword'), 'Equipment station must have wood sword');
assert.ok(equipIds.includes('recipe_wood_helmet'), 'Equipment station must have wood helmet');
assert.ok(equipIds.includes('recipe_wood_armor'), 'Equipment station must have wood armor');
assert.ok(equipIds.includes('recipe_leather_sword'), 'Equipment station must have leather sword');
assert.ok(equipIds.includes('recipe_leather_helmet'), 'Equipment station must have leather helmet');
assert.ok(equipIds.includes('recipe_leather_armor'), 'Equipment station must have leather armor');
assert.ok(equipIds.includes('recipe_bronze_sword'), 'Equipment station must have bronze sword');
assert.ok(equipIds.includes('recipe_bronze_helmet'), 'Equipment station must have bronze helmet');
assert.ok(equipIds.includes('recipe_bronze_armor'), 'Equipment station must have bronze armor');

// Assert 1897 Heritage set is NOT in equipment station
assert.ok(!equipIds.includes('recipe_heritage_sword'), '1897 sword must be REMOVED from corridor equipment station');
assert.ok(!equipIds.includes('recipe_heritage_helmet'), '1897 helmet must be REMOVED from corridor equipment station');
assert.ok(!equipIds.includes('recipe_heritage_armor'), '1897 armor must be REMOVED from corridor equipment station');
console.log('✅ Check 1 Passed: Corridor equipment station has wood/leather/bronze only (1897 removed).');

// Test History Altar Crafting (역사관 제단)
cm.currentCategory = 'heritage';
const heritageRecipes = cm.getFilteredRecipes();
const heritageIds = heritageRecipes.map(r => r.id);

assert.strictEqual(heritageIds.length, 3, 'History altar must have exactly 3 recipes (1897 set only)');
assert.ok(heritageIds.includes('recipe_heritage_sword'), 'Altar must have 1897 sword');
assert.ok(heritageIds.includes('recipe_heritage_helmet'), 'Altar must have 1897 helmet');
assert.ok(heritageIds.includes('recipe_heritage_armor'), 'Altar must have 1897 armor');
console.log('✅ Check 2 Passed: History altar contains 1897 Heritage set exclusively.');

// Check 3: World.js history altar interaction prompt & Main.js altar handler
assert.ok(worldJs.includes('1897 헤리티지 세트 제작 (SPACE)'), 'world.js altar prompt updated');
assert.ok(mainJs.includes("this.craftingManager.open('heritage');"), 'main.js opens altar with heritage category');
console.log('✅ Check 3 Passed: History altar prompt and open handler verified.');

// Check 4: Tier 5 Immortal Set definition in client & server
const vm = require('vm');
const clientSandbox = {};
vm.runInNewContext(mainJs.slice(mainJs.indexOf('const ALL_GAME_ITEMS = {'), mainJs.indexOf('window.ALL_GAME_ITEMS = ALL_GAME_ITEMS;')) + '\nthis.clientItems = ALL_GAME_ITEMS;', clientSandbox);
const serverSandbox = {};
vm.runInNewContext(serverJs.slice(serverJs.indexOf('const ALL_GAME_ITEMS = {'), serverJs.indexOf('const BAD_WORDS =')) + '\nthis.serverItems = ALL_GAME_ITEMS;', serverSandbox);
const clientItems = clientSandbox.clientItems;
const serverItems = serverSandbox.serverItems;

const tier5Ids = ['equip_immortal_blade', 'equip_immortal_helmet', 'equip_immortal_armor'];
tier5Ids.forEach(id => {
  assert.ok(clientItems[id], `Client ALL_GAME_ITEMS must contain ${id}`);
  assert.ok(serverItems[id], `Server ALL_GAME_ITEMS must contain ${id}`);
  assert.strictEqual(clientItems[id].meta.requiredLevel, 13, `${id} must have requiredLevel 13`);
  assert.strictEqual(serverItems[id].meta.requiredLevel, 13, `${id} must have requiredLevel 13`);
});

// Check exact stats
assert.strictEqual(JSON.stringify(clientItems['equip_immortal_blade'].meta.stats), JSON.stringify({ atk: 60, def: 0, hp: 35 }));
assert.strictEqual(JSON.stringify(clientItems['equip_immortal_helmet'].meta.stats), JSON.stringify({ atk: 0, def: 25, hp: 35 }));
assert.strictEqual(JSON.stringify(clientItems['equip_immortal_armor'].meta.stats), JSON.stringify({ atk: 0, def: 35, hp: 35 }));
console.log('✅ Check 4 Passed: 5-tier Immortal Set stats (+60/35, +25/35, +35/35, Lv.13) verified.');

// Check 5: Crafting of Tier 5 is currently disabled (not in craft_recipes.json)
assert.ok(!craftRecipes.some(r => r.id.includes('immortal')), '5-tier Immortal set must NOT be craftable yet in craft_recipes.json');
console.log('✅ Check 5 Passed: 5-tier Immortal set is not in recipes (crafting locked).');

// Check 6: Sloth God preset in index.html & main.js
assert.ok(indexHtml.includes('🦥 방학 직전 나태신 (축구장 서쪽 골대 · HP 15000 / ATK 120 / DEF 35)'), 'index.html sloth preset updated');
assert.ok(mainJs.includes("nameEl.value = '🦥 방학 직전 나태신';"), 'main.js sloth name updated');
assert.ok(mainJs.includes('hpEl.value = 15000;'), 'main.js sloth hp 15000');
assert.ok(mainJs.includes('atkEl.value = 120;'), 'main.js sloth atk 120');
assert.ok(mainJs.includes('defEl.value = 35;'), 'main.js sloth def 35');
console.log('✅ Check 6 Passed: Sloth God preset (HP 15000 / ATK 120 / DEF 35) verified.');

console.log('\n🎉 ALL TIER 5 & ALTAR CRAFTING TESTS PASSED PERFECTLY!\n');
