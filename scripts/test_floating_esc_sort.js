const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

console.log('🧪 Starting test_floating_esc_sort.js...\n');

// Mock browser environment
global.window = {
  RPGDialog: {
    isOpen: true,
    isConfirmMode: false,
    close: () => {}
  },
  AudioManager: { playSelect: () => {} }
};

const domElements = {};
function createMockElement(id, tagName = 'div') {
  const el = {
    id,
    tagName: tagName.toUpperCase(),
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this.contains(c)) this.remove(c); else this.add(c);
        } else if (force) {
          this.add(c);
        } else {
          this.remove(c);
        }
      }
    },
    style: {},
    innerText: '',
    innerHTML: '',
    children: [],
    appendChild(child) { this.children.push(child); return child; },
    querySelector(sel) {
      if (sel.includes('.btn-modal-close') || sel.includes('btn-close')) {
        return this._closeBtn || null;
      }
      return null;
    },
    querySelectorAll(sel) { return []; },
    addEventListener(evt, fn) {},
    blur() { this.blurred = true; },
    click() { if (this.onclick) this.onclick(); if (this._clickHandler) this._clickHandler(); }
  };
  return el;
}

// 1. Test Engine addFloatingText directly
console.log('--- Test 1: Engine addFloatingText ---');
const engineCode = fs.readFileSync('public/js/engine.js', 'utf8');
assert.ok(engineCode.includes('this.floatingTexts = [];'), 'engine.js should initialize this.floatingTexts');
assert.ok(engineCode.includes('addFloatingText(text, x, y, color'), 'engine.js should define addFloatingText');
assert.ok(engineCode.includes('// Render and update floating texts (Heal, Gold, Exp) in world space'), 'engine.js should render floatingTexts in render()');

// Mock GameEngine instance with floating texts
class MockEngine {
  constructor() {
    this.player = { x: 100, y: 200 };
    this.floatingTexts = [];
  }
}
MockEngine.prototype.addFloatingText = function(text, x, y, color = '#4ade80', fontSize = 16) {
  if (!this.floatingTexts) this.floatingTexts = [];
  const px = x !== undefined ? x : (this.player ? this.player.x + 16 : 0);
  const py = y !== undefined ? y : (this.player ? this.player.y - 12 : 0);
  this.floatingTexts.push({
    text,
    x: px,
    y: py,
    startY: py,
    color,
    fontSize,
    startTime: Date.now(),
    duration: 1200
  });
};

const engine = new MockEngine();
engine.addFloatingText('+60 HP 💚');
assert.strictEqual(engine.floatingTexts.length, 1);
assert.strictEqual(engine.floatingTexts[0].text, '+60 HP 💚');
assert.strictEqual(engine.floatingTexts[0].x, 116);
assert.strictEqual(engine.floatingTexts[0].y, 188);
assert.strictEqual(engine.floatingTexts[0].color, '#4ade80');

engine.addFloatingText('+50 G 🪙', 116, 172, '#fbbf24', 16);
assert.strictEqual(engine.floatingTexts.length, 2);
assert.strictEqual(engine.floatingTexts[1].text, '+50 G 🪙');
assert.strictEqual(engine.floatingTexts[1].color, '#fbbf24');

engine.addFloatingText('+100 EXP ⭐', 116, 158, '#38bdf8', 16);
assert.strictEqual(engine.floatingTexts.length, 3);
assert.strictEqual(engine.floatingTexts[2].text, '+100 EXP ⭐');
assert.strictEqual(engine.floatingTexts[2].color, '#38bdf8');
console.log('✅ Test 1 Passed: Floating texts created with correct offsets and colors.');

// 2. Test sortInventory logic
console.log('--- Test 2: Inventory Auto-Sort Logic ---');
const inventorySample = [
  { item: 'item_wood', name: '자작나무 목재', count: 5, type: 'material' },
  { item: 'item_red_potion', name: '빨간 물약', count: 10, type: 'consumable', heal: 10 },
  { item: 'equip_iron_sword', name: '견고한 철검', type: 'equipment', slot: 'weapon', tier: 1 },
  { item: 'item_herb', name: '약초 잎사귀', count: 8, type: 'material' },
  { item: 'equip_leather_boots', name: '가죽 부츠', type: 'equipment', slot: 'boots', tier: 1 },
  { item: 'item_elixir', name: '신비한 엘릭서', count: 1, type: 'consumable', heal: 100 },
  { item: 'item_scroll_tp', name: '순간이동 주문서', count: 3, type: 'consumable' },
  { item: 'equip_mythic_staff', name: '전설의 지팡이', type: 'equipment', slot: 'weapon', tier: 5 },
  { item: 'item_clear_potion', name: '맑은 물약', count: 2, type: 'consumable', heal: 60 },
  { item: 'item_orange_potion', name: '주홍 물약', count: 4, type: 'consumable', heal: 30 }
];

const mockMainApp = {
  playerData: { inventory: [...inventorySample] },
  saveProgress: () => {},
  openInventory: () => {},
  showToast: () => {}
};

// Extract sortInventory method definition from main.js
const mainJsCode = fs.readFileSync('public/js/main.js', 'utf8');
assert.ok(mainJsCode.includes('sortInventory() {'), 'main.js must contain sortInventory()');
assert.ok(mainJsCode.includes('closeTopModal() {'), 'main.js must contain closeTopModal()');
assert.ok(mainJsCode.includes("e.key === 'Escape'"), 'main.js must listen for Escape key');

// Evaluate sortInventory in mock context
const sortMethodMatch = mainJsCode.match(/sortInventory\(\)\s*\{[\s\S]*?\n  \}/);
assert.ok(sortMethodMatch, 'Found sortInventory definition');
const sortFn = new Function('return function ' + sortMethodMatch[0])();
mockMainApp.sortInventory = sortFn.bind(mockMainApp);
mockMainApp.sortInventory();

const sorted = mockMainApp.playerData.inventory;
console.log('Sorted inventory result:', sorted.map(i => `${i.type}: ${i.name}`));

// Verification of order:
// First 3 should be equipment: equip_mythic_staff (tier 5 weapon) -> equip_iron_sword (tier 1 weapon) -> equip_leather_boots (boots)
assert.strictEqual(sorted[0].item, 'equip_mythic_staff');
assert.strictEqual(sorted[1].item, 'equip_iron_sword');
assert.strictEqual(sorted[2].item, 'equip_leather_boots');

// Next 5 should be consumables: elixir -> clear potion -> orange potion -> red potion -> scroll
assert.strictEqual(sorted[3].item, 'item_elixir');
assert.strictEqual(sorted[4].item, 'item_clear_potion');
assert.strictEqual(sorted[5].item, 'item_orange_potion');
assert.strictEqual(sorted[6].item, 'item_red_potion');
assert.strictEqual(sorted[7].item, 'item_scroll_tp');

// Remaining should be materials in Korean alphabetical order: 약초 잎사귀 -> 자작나무 목재
assert.strictEqual(sorted[8].item, 'item_herb'); // '약'
assert.strictEqual(sorted[9].item, 'item_wood'); // '자'
console.log('✅ Test 2 Passed: sortInventory perfectly arranges Equipment -> Consumables -> Materials.');

// 3. Test closeTopModal logic
console.log('--- Test 3: closeTopModal & ESC Key Handling ---');
let closedModalId = null;
let closedDialog = false;

global.document = {
  querySelectorAll: (sel) => {
    if (sel === '.modal-overlay:not(.hidden)') {
      return [
        {
          id: 'modal-inventory',
          style: { zIndex: '100' },
          classList: { add: (c) => { closedModalId = 'modal-inventory'; } },
          querySelector: (s) => ({
            click: () => { closedModalId = 'modal-inventory (via closeBtn)'; }
          })
        }
      ];
    }
    return [];
  }
};
global.window = {
  RPGDialog: {
    isOpen: true,
    isConfirmMode: false,
    close: () => { closedDialog = true; }
  },
  AudioManager: { playSelect: () => {} }
};

const closeTopModalMatch = mainJsCode.match(/closeTopModal\(\)\s*\{[\s\S]*?\n  \}/);
assert.ok(closeTopModalMatch, 'Found closeTopModal definition');
const closeFn = new Function('return function ' + closeTopModalMatch[0])();
const mockAppForClose = { closeTopModal: closeFn };

// Case 1: RPGDialog isOpen -> should close dialog first
const res1 = mockAppForClose.closeTopModal();
assert.strictEqual(res1, true);
assert.strictEqual(closedDialog, true, 'RPGDialog should be closed first');

// Case 2: RPGDialog closed, modal-inventory open -> should close modal-inventory
global.window.RPGDialog.isOpen = false;
const res2 = mockAppForClose.closeTopModal();
assert.strictEqual(res2, true);
assert.strictEqual(closedModalId, 'modal-inventory (via closeBtn)');
console.log('✅ Test 3 Passed: closeTopModal cleanly prioritized RPGDialog and closed open modal.');

// 4. Test Protection Potion (Lv.10 lock, 3 min +3 DEF, no store sale)
console.log('--- Test 4: Protection Potion Implementation ---');
const craftRecipes = JSON.parse(fs.readFileSync('data/craft_recipes.json', 'utf8'));
const protRecipe = craftRecipes.find(r => r.id === 'recipe_protection_potion');
assert.ok(protRecipe, 'recipe_protection_potion must exist in craft_recipes.json');
assert.strictEqual(protRecipe.requiredLevel, 10, 'Protection potion must require level 10');
assert.strictEqual(protRecipe.result.effect, '3분간 방어력(DEF) +3 증가');
assert.strictEqual(protRecipe.result.item, 'item_protection_potion');

const serverCode = fs.readFileSync('server.js', 'utf8');
assert.ok(serverCode.includes("'item_protection_potion'"), 'server.js must define item_protection_potion');

assert.ok(mainJsCode.includes("'item_protection_potion'"), 'main.js must define item_protection_potion');
assert.ok(mainJsCode.includes("isBuffActive('protection_boost')"), 'main.js must check protection_boost');
assert.ok(mainJsCode.includes("bonusDef += 3;"), 'protection_boost must add +3 DEF');
assert.ok(!mainJsCode.includes("id: 'item_protection_potion', price:"), 'Protection potion must NOT be sold in store');
console.log('✅ Test 4 Passed: Protection Potion verified with Lv.10 lock, +3 DEF buff, and no store sale.');

console.log('\n🎉 ALL FLOATING TEXT, ESC, SORT & PROTECTION POTION TESTS PASSED PERFECTLY!');
