// Automated Verification for Recipe Order, English Removal, and Level Locks
const fs = require('fs');
const assert = require('assert');

console.log('🧪 Starting test_recipe_order_and_locks.js...\n');

const recipes = JSON.parse(fs.readFileSync('data/craft_recipes.json', 'utf8'));

// 1. Protection Potion name has NO English and is right below courage potion
const courageIdx = recipes.findIndex(r => r.id === 'recipe_courage_potion');
const protIdx = recipes.findIndex(r => r.id === 'recipe_protection_potion');

assert.strictEqual(protIdx, courageIdx + 1, 'Protection potion must be immediately after courage potion');
assert.strictEqual(recipes[protIdx].name, '수호의 물약', 'Protection potion name must be strictly "수호의 물약" (no English)');
console.log('✅ Check 1 Passed: 수호의 물약 position and Korean-only name verified.');

// 2. Bronze Set requiredLevel = 5
const bronzeIds = ['recipe_bronze_sword', 'recipe_bronze_helmet', 'recipe_bronze_armor'];
bronzeIds.forEach(id => {
  const r = recipes.find(x => x.id === id);
  assert.ok(r, 'Recipe ' + id + ' must exist');
  assert.strictEqual(r.requiredLevel, 5, id + ' must have requiredLevel = 5');
});
console.log('✅ Check 2 Passed: Bronze set requiredLevel 5 verified.');

// 3. Ginkgo Talisman requiredLevel = 5
const ginkgo = recipes.find(x => x.id === 'recipe_ginkgo_talisman');
assert.ok(ginkgo, 'Ginkgo talisman must exist');
assert.strictEqual(ginkgo.requiredLevel, 5, 'Ginkgo talisman must have requiredLevel = 5');
console.log('✅ Check 3 Passed: Ginkgo talisman requiredLevel 5 verified.');

// 4. 1897 Heritage Set requiredLevel = 10
const heritageIds = ['recipe_heritage_sword', 'recipe_heritage_helmet', 'recipe_heritage_armor'];
heritageIds.forEach(id => {
  const r = recipes.find(x => x.id === id);
  assert.ok(r, 'Recipe ' + id + ' must exist');
  assert.strictEqual(r.requiredLevel, 10, id + ' must have requiredLevel = 10');
});
console.log('✅ Check 4 Passed: 1897 Heritage set requiredLevel 10 verified.');

// 5. Leather Set requiredLevel = 3 & ordered Sword -> Helmet -> Armor
const leatherIds = ['recipe_leather_sword', 'recipe_leather_helmet', 'recipe_leather_armor'];
const leatherIndices = leatherIds.map(id => {
  const idx = recipes.findIndex(x => x.id === id);
  assert.ok(idx !== -1, 'Recipe ' + id + ' must exist');
  assert.strictEqual(recipes[idx].requiredLevel, 3, id + ' must have requiredLevel = 3');
  return idx;
});
assert.ok(leatherIndices[0] < leatherIndices[1] && leatherIndices[1] < leatherIndices[2], 'Leather set must be ordered Sword -> Helmet -> Armor');
console.log('✅ Check 5 Passed: Leather set requiredLevel 3 & Sword -> Helmet -> Armor order verified.');

// 6. Clear Potion & Elixir gradeLevel = 1, Korean-only names, and ordered right after Orange Potion
const orangeIdx = recipes.findIndex(r => r.id === 'recipe_orange_potion');
const clearIdx = recipes.findIndex(r => r.id === 'recipe_clear_potion');
const elixirIdx = recipes.findIndex(r => r.id === 'recipe_elixir');
assert.strictEqual(clearIdx, orangeIdx + 1, 'Clear potion must be immediately after orange potion');
assert.strictEqual(elixirIdx, clearIdx + 1, 'Elixir must be immediately after clear potion');
assert.strictEqual(recipes[clearIdx].name, '맑은 물약', 'Clear potion name must be Korean-only');
assert.strictEqual(recipes[elixirIdx].name, '엘릭서', 'Elixir name must be Korean-only');
assert.strictEqual(recipes[clearIdx].gradeLevel, 1, 'Clear potion must have gradeLevel = 1 so 1st grade students can see it');
assert.strictEqual(recipes[elixirIdx].gradeLevel, 1, 'Elixir must have gradeLevel = 1 so 1st grade students can see it');
console.log('✅ Check 6 Passed: Clear Potion & Elixir visibility (gradeLevel 1), order, and names verified.');

console.log('\n🎉 ALL RECIPE ORDER & LEVEL LOCK TESTS PASSED!');
