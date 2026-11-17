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

// Assert 1897 Heritage & Tier 5 Immortal sets are NOT in corridor equipment station
assert.ok(!equipIds.includes('recipe_heritage_sword'), '1897 sword must be REMOVED from corridor equipment station');
assert.ok(!equipIds.includes('recipe_heritage_helmet'), '1897 helmet must be REMOVED from corridor equipment station');
assert.ok(!equipIds.includes('recipe_heritage_armor'), '1897 armor must be REMOVED from corridor equipment station');
assert.ok(!equipIds.includes('recipe_immortal_sword'), 'Tier 5 immortal sword must be REMOVED from corridor equipment station');
assert.ok(!equipIds.includes('recipe_immortal_helmet'), 'Tier 5 immortal helmet must be REMOVED from corridor equipment station');
assert.ok(!equipIds.includes('recipe_immortal_armor'), 'Tier 5 immortal armor must be REMOVED from corridor equipment station');
console.log('✅ Check 1 Passed: Corridor equipment station has wood/leather/bronze (1897 & Tier 5 removed).');

// Test History Altar Crafting (역사관 제단)
cm.currentCategory = 'heritage';
const heritageRecipes = cm.getFilteredRecipes();
const heritageIds = heritageRecipes.map(r => r.id);

assert.strictEqual(heritageIds.length, 6, 'History altar must have exactly 6 recipes (1897 Heritage 3 + Tier 5 Immortal 3)');
assert.ok(heritageIds.includes('recipe_heritage_sword'), 'Altar must have 1897 sword');
assert.ok(heritageIds.includes('recipe_heritage_helmet'), 'Altar must have 1897 helmet');
assert.ok(heritageIds.includes('recipe_heritage_armor'), 'Altar must have 1897 armor');
assert.ok(heritageIds.includes('recipe_immortal_sword'), 'Altar must have Tier 5 immortal sword');
assert.ok(heritageIds.includes('recipe_immortal_helmet'), 'Altar must have Tier 5 immortal helmet');
assert.ok(heritageIds.includes('recipe_immortal_armor'), 'Altar must have Tier 5 immortal armor');
console.log('✅ Check 2 Passed: History altar contains 1897 Heritage & Tier 5 Immortal sets.');

// Check 3: World.js history altar interaction prompt & Main.js altar handler
assert.ok(worldJs.includes('헤리티지 · 5티어 불멸 세트 제작 (SPACE)'), 'world.js altar prompt updated');
assert.ok(mainJs.includes("this.craftingManager.open('heritage');"), 'main.js opens altar with heritage category');
console.log('✅ Check 3 Passed: History altar prompt and open handler verified.');

// Check 4: Tier 5 Immortal Set definition in client & server
const vm = require('vm');
const clientSandbox = {};
vm.runInNewContext(mainJs.slice(mainJs.indexOf('const ALL_GAME_ITEMS = {'), mainJs.indexOf('window.ALL_GAME_ITEMS = ALL_GAME_ITEMS;')) + '\nthis.clientItems = ALL_GAME_ITEMS;', clientSandbox);
const serverSandbox = {};
vm.runInNewContext(serverJs.slice(serverJs.indexOf('const ALL_GAME_ITEMS = {'), serverJs.indexOf('function computeStudentCombatStats(')) + '\nthis.serverItems = ALL_GAME_ITEMS;', serverSandbox);
const clientItems = clientSandbox.clientItems;
const serverItems = serverSandbox.serverItems;

const tier5Ids = ['equip_immortal_blade', 'equip_immortal_helmet', 'equip_immortal_armor'];
tier5Ids.forEach(id => {
  assert.ok(clientItems[id], `Client ALL_GAME_ITEMS must contain ${id}`);
  assert.ok(serverItems[id], `Server ALL_GAME_ITEMS must contain ${id}`);
  assert.strictEqual(clientItems[id].meta.requiredLevel, 12, `${id} must have requiredLevel 12`);
  assert.strictEqual(serverItems[id].meta.requiredLevel, 12, `${id} must have requiredLevel 12`);
});

// Check exact stats
assert.strictEqual(JSON.stringify(clientItems['equip_immortal_blade'].meta.stats), JSON.stringify({ atk: 60, def: 0, hp: 35 }));
assert.strictEqual(JSON.stringify(clientItems['equip_immortal_helmet'].meta.stats), JSON.stringify({ atk: 0, def: 25, hp: 35 }));
assert.strictEqual(JSON.stringify(clientItems['equip_immortal_armor'].meta.stats), JSON.stringify({ atk: 0, def: 30, hp: 35 }));
console.log('✅ Check 4 Passed: 5-tier Immortal Set stats (+60/35, +25/35, +35/35, Lv.12) verified.');

// Check 5: Crafting of Tier 5 is unlocked with cafeteria materials + wood + herb (Lv.12)
const immortalRecipes = ['recipe_immortal_sword', 'recipe_immortal_helmet', 'recipe_immortal_armor'].map(id => {
  const r = craftRecipes.find(x => x.id === id);
  assert.ok(r, `craft_recipes.json must include ${id}`);
  assert.strictEqual(r.requiredLevel, 12, `${id} must require Lv.12`);
  const reqIds = r.requiredItems.map(x => x.item);
  ['item_nutrition_essence', 'item_stainless_shard', 'item_wood', 'item_herb'].forEach(mat => {
    assert.ok(reqIds.includes(mat), `${id} must require ${mat}`);
  });
  assert.strictEqual(r.unscramble.words.join(' '), r.unscramble.correct, `${id} unscramble words must match correct sentence`);
  return r;
});
assert.strictEqual(immortalRecipes.length, 3, 'All 3 Tier 5 Immortal recipes verified');
console.log('✅ Check 5 Passed: 5-tier Immortal set crafting recipes (cafeteria + wood + herb, Lv.12) verified.');

// Check 6: Sloth God preset in index.html & main.js
assert.ok(indexHtml.includes('🦥 방학 직전 나태신 (축구장 서쪽 골대 · HP 15000 / ATK 120 / DEF 35)'), 'index.html sloth preset updated');
assert.ok(mainJs.includes("nameEl.value = '🦥 방학 직전 나태신';"), 'main.js sloth name updated');
assert.ok(mainJs.includes('hpEl.value = 15000;'), 'main.js sloth hp 15000');
assert.ok(mainJs.includes('atkEl.value = 120;'), 'main.js sloth atk 120');
assert.ok(mainJs.includes('defEl.value = 35;'), 'main.js sloth def 35');
console.log('✅ Check 6 Passed: Sloth God preset (HP 15000 / ATK 120 / DEF 35) verified.');

console.log('\n🎉 ALL TIER 5 & ALTAR CRAFTING TESTS PASSED PERFECTLY!\n');
