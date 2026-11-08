// scripts/test_golem_separation_and_gym_gate.js
// Verification suite for:
// 1. Complete separation of 1-2 Leather Golem 1:1 solo raid from teacher boss raids (HP 2000/2000)
// 2. Removal of stencil text on playground gym gate road
// 3. 2x vertical downward expansion of gym gate entrance (roadH = 144) (v=235)

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('======================================================================');
console.log('🧪 TESTING GOLEM ISOLATION (HP 2000/2000) & GYM GATE 2X ENTRANCE (v=235)');
console.log('======================================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.stack || err.message}`);
  }
}

// Mock DOM & Canvas
const labelsDrawn = [];
const textDrawn = [];
const createMockCtx = () => ({
  save: () => {},
  restore: () => {},
  beginPath: () => {},
  closePath: () => {},
  arc: () => {},
  rect: () => {},
  fillRect: () => {},
  strokeRect: () => {},
  stroke: () => {},
  fill: () => {},
  moveTo: () => {},
  lineTo: () => {},
  measureText: (txt) => ({ width: (txt || '').length * 8 }),
  fillText: (t, x, y) => { textDrawn.push(t); },
  strokeText: () => {},
  setLineDash: () => {},
  createLinearGradient: () => ({ addColorStop: () => {} }),
  createRadialGradient: () => ({ addColorStop: () => {} }),
  quadraticCurveTo: () => {},
  bezierCurveTo: () => {},
  roundRect: () => {},
  ellipse: () => {},
  translate: () => {},
  scale: () => {},
  rotate: () => {}
});

const mockCanvas = {
  width: 1024,
  height: 768,
  getContext: () => createMockCtx(),
  addEventListener: () => {},
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 1024, height: 768 }),
  style: {}
};

const mockElements = {
  'game-canvas': mockCanvas
};
global.window = {
  addEventListener: () => {},
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  }
};
global.document = {
  getElementById: (id) => {
    if (id === 'game-canvas') return mockCanvas;
    if (!mockElements[id]) {
      mockElements[id] = {
        id,
        innerText: '',
        innerHTML: '',
        style: {},
        classList: {
          add: () => {},
          remove: () => {},
          contains: () => false
        }
      };
    }
    return mockElements[id];
  },
  createElement: () => mockCanvas,
  addEventListener: () => {}
};

// Load world.js & engine.js
eval(fs.readFileSync(path.join(__dirname, '../public/js/world.js'), 'utf8'));
const WORLD_DATA = window.WORLD_DATA;
global.WORLD_DATA = WORLD_DATA;

eval(fs.readFileSync(path.join(__dirname, '../public/js/engine.js'), 'utf8'));

test('1. drawHighResBossGolem ALWAYS renders 🪵 가죽 골렘 (HP 2000/2000) regardless of window.BOSS_CONFIG', () => {
  const engine = new GameEngine(mockCanvas);
  
  // Track labels rendered via drawSharpLabel
  const labels = [];
  engine.drawSharpLabel = (x, y, text, opts) => {
    labels.push({ x, y, text, opts });
  };

  // Simulate active dragon raid in BOSS_CONFIG
  window.BOSS_CONFIG = {
    active: true,
    name: '🐲 고대 청동 드래곤',
    maxHp: 5000,
    currentHp: 5000,
    mode: 'coop'
  };

  // Draw Golem with standard boss object
  const golemBoss = { x: 15, y: 8, name: '🪵 가죽 골렘', maxHp: 2000, currentHp: 2000 };
  engine.drawHighResBossGolem(golemBoss);

  assert.strictEqual(labels.length, 1, 'Exactly one label should be drawn');
  assert.strictEqual(labels[0].text, '🪵 가죽 골렘 (HP 2000/2000)', 'Label MUST be 🪵 가죽 골렘 (HP 2000/2000)');
  assert(!labels[0].text.includes('드래곤'), 'Label must NEVER contain 드래곤');
  assert(!labels[0].text.includes('5000'), 'Label must NEVER contain 5000');
  assert(!labels[0].text.includes('[1차 관문 보스]'), 'Label must not contain [1차 관문 보스]');
});

test('2. In classroom_702, boss rendered is strictly Leather Golem with 2000/2000 HP even during active Dragon raid', () => {
  const engine = new GameEngine(mockCanvas);
  engine.player.room = 'room_702';
  engine.player.floor = 7;

  let capturedBoss = null;
  engine.drawHighResBossGolem = (boss) => {
    capturedBoss = boss;
  };

  // Dragon raid active on server
  window.BOSS_CONFIG = {
    active: true,
    name: '🐲 고대 청동 드래곤',
    maxHp: 5000,
    currentHp: 4200,
    mode: 'coop'
  };

  engine.renderClassroom();

  assert(capturedBoss, 'drawHighResBossGolem should be called in classroom_702');
  assert.strictEqual(capturedBoss.name, '🪵 가죽 골렘', 'Captured boss name must be 🪵 가죽 골렘');
  assert.strictEqual(capturedBoss.maxHp, 2000, 'Captured boss maxHp must be 2000');
  assert.strictEqual(capturedBoss.currentHp, 2000, 'Captured boss currentHp must be 2000');
});

test('3. Gym gate entrance has roadH = 144 (2x vertical downward extension) and no text on road surface', () => {
  const engineSrc = fs.readFileSync(path.join(__dirname, '../public/js/engine.js'), 'utf8');

  // Verify road stencil text deleted
  assert(!engineSrc.includes('⬅️ 체육관·주차장 [교직원 전용]'), 'Road stencil text must be completely removed');

  // Verify road height is 144 (2x)
  assert(engineSrc.includes('const roadH = 144;'), 'roadH must be 144');
  assert(engineSrc.includes('const roadY = py - 36;'), 'roadY must remain py - 36 so it expands downward only');

  // Verify stepping zone tileY >= 47 && tileY <= 51
  assert(engineSrc.includes('tileY >= 47 && tileY <= 51'), 'Stepping zone should cover expanded 2x height down to tile 51');
});

test('4. main.js onBossRaidStateUpdate NEVER mutates WORLD_DATA.classroom_702.boss', () => {
  const mainSrc = fs.readFileSync(path.join(__dirname, '../public/js/main.js'), 'utf8');
  assert(!mainSrc.includes('WORLD_DATA.classroom_702.boss.name = state.name'), 'Must NOT overwrite 1-2 boss name with state.name');
});

test('5. openBossRaid in 1-2반 starts 1:1 Solo Leather Golem raid even when coop Dragon raid is active', () => {
  const mainSrc = fs.readFileSync(path.join(__dirname, '../public/js/main.js'), 'utf8');
  const raidLogicMatch = mainSrc.match(/openBossRaid\(bossData\)\s*\{([\s\S]*?)\n  \}/);
  assert(raidLogicMatch, 'openBossRaid must exist in main.js');

  const fn = new Function('bossData', raidLogicMatch[1]);

  const mockApp = {
    recalcCombatStats: () => {},
    engine: { player: { room: 'room_702' } },
    playerData: { atk: 10, inventory: {} },
    hasItem: () => false,
    bossState: {},
    modalBossRaid: { classList: { remove: () => {}, contains: () => false } },
    updateBossRaidUI: () => {},
    loadNextBossQuestion: () => {},
    updateBossRaidTimerOnly: () => {}
  };

  // Active teacher coop dragon raid
  window.BOSS_CONFIG = {
    active: true,
    name: '🐲 고대 청동 드래곤',
    maxHp: 5000,
    currentHp: 5000,
    mode: 'coop'
  };

  fn.call(mockApp, { id: 'boss_leather_golem' });
  if (mockApp.bossTimerInterval) clearInterval(mockApp.bossTimerInterval);

  assert.strictEqual(window.BOSS_CONFIG.name, '🪵 가죽 골렘', 'BOSS_CONFIG name must be 🪵 가죽 골렘');
  assert.strictEqual(window.BOSS_CONFIG.mode, 'solo', 'Must be solo mode');
  assert.strictEqual(window.BOSS_CONFIG.maxHp, 2000, 'MaxHp must be 2000');
  assert.strictEqual(window.BOSS_CONFIG.currentHp, 2000, 'CurrentHp must be 2000');
  assert.strictEqual(document.getElementById('boss-name-label').innerText, '🪵 가죽 골렘');
});

console.log(`\n======================================================================`);
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log(`======================================================================`);

if (passedTests !== totalTests) {
  process.exit(1);
}
