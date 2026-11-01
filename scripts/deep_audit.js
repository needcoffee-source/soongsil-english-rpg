const fs = require('fs');
const vm = require('vm');
const path = require('path');

console.log('=== SOONGSIL RPG DEEP AUDIT ===');

const files = [
  'server.js',
  'public/js/audio.js',
  'public/js/dialog.js',
  'public/js/world.js',
  'public/js/quiz.js',
  'public/js/crafting.js',
  'public/js/engine.js',
  'public/js/network.js',
  'public/js/acid_rain.js',
  'public/js/main.js'
];

let syntaxErrors = 0;
for (const file of files) {
  try {
    const code = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    new vm.Script(code, { filename: file });
    console.log(`[PASS] Syntax check: ${file}`);
  } catch (err) {
    console.error(`[FAIL] Syntax error in ${file}:`, err.message);
    syntaxErrors++;
  }
}

if (syntaxErrors > 0) {
  process.exit(1);
}

// Now simulate a browser environment loading world.js, engine.js, main.js
const mockWindow = {
  location: { search: '' },
  addEventListener: () => {},
  removeEventListener: () => {},
  document: {
    getElementById: (id) => ({
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      addEventListener: () => {},
      getContext: () => ({
        fillRect: () => {},
        clearRect: () => {},
        drawImage: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {}
      }),
      style: {},
      value: '',
      innerText: '',
      innerHTML: ''
    }),
    querySelectorAll: () => [],
    createElement: () => ({
      classList: { add: () => {}, remove: () => {} },
      appendChild: () => {},
      style: {}
    }),
    activeElement: { tagName: 'BODY' },
    body: { classList: { add: () => {}, remove: () => {} } }
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  requestAnimationFrame: () => {},
  Audio: class { play() {} pause() {} },
  navigator: { userAgent: 'MockBrowser' }
};
mockWindow.window = mockWindow;

const ctx = vm.createContext(mockWindow);

try {
  const worldCode = fs.readFileSync(path.join(__dirname, '..', 'public/js/world.js'), 'utf8');
  vm.runInContext(worldCode, ctx);
  console.log('[PASS] Executed world.js');
} catch (e) {
  console.error('[FAIL] world.js execution error:', e);
}

try {
  const engineCode = fs.readFileSync(path.join(__dirname, '..', 'public/js/engine.js'), 'utf8');
  vm.runInContext(engineCode, ctx);
  console.log('[PASS] Executed engine.js');
} catch (e) {
  console.error('[FAIL] engine.js execution error:', e);
}

// Check Floor 6
const worldData = ctx.WORLD_DATA;
if (!worldData) {
  console.error('[FAIL] WORLD_DATA is undefined');
} else {
  console.log('WORLD_DATA floors present:', Object.keys(worldData.floors));
  if (!worldData.floors[6]) {
    console.error('[DISCREPANCY] Floor 6 is missing from WORLD_DATA.floors!');
  } else {
    console.log('[PASS] Floor 6 is defined in WORLD_DATA.floors');
  }
}

// Check items consistency between server.js and main.js
const serverCode = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
const mainCode = fs.readFileSync(path.join(__dirname, '..', 'public/js/main.js'), 'utf8');

// Extract ALL_GAME_ITEMS from server.js
const serverItemsMatch = serverCode.match(/const ALL_GAME_ITEMS = \{([\s\S]*?)\n\};/);
const mainItemsMatch = mainCode.match(/const ALL_GAME_ITEMS = \{([\s\S]*?)\n\};/);

if (serverItemsMatch && mainItemsMatch) {
  const parseKeys = (str) => {
    const keys = [];
    const re = /['"]?([a-zA-Z0-9_]+)['"]?\s*:\s*\{/g;
    let m;
    while ((m = re.exec(str)) !== null) {
      keys.push(m[1]);
    }
    return keys;
  };

  const serverKeys = parseKeys(serverItemsMatch[1]);
  const mainKeys = parseKeys(mainItemsMatch[1]);

  console.log(`Server items count: ${serverKeys.length}, Main items count: ${mainKeys.length}`);
  const inServerNotMain = serverKeys.filter(k => !mainKeys.includes(k));
  const inMainNotServer = mainKeys.filter(k => !serverKeys.includes(k));

  if (inServerNotMain.length > 0) {
    console.log('[DISCREPANCY] Items in server.js but not in main.js ALL_GAME_ITEMS:', inServerNotMain);
  }
  if (inMainNotServer.length > 0) {
    console.log('[DISCREPANCY] Items in main.js but not in server.js ALL_GAME_ITEMS:', inMainNotServer);
  }
}

// Check recipes in craft_recipes.json
const recipes = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data/craft_recipes.json'), 'utf8'));
console.log(`Craft recipes count: ${recipes.length}`);
const recipeResults = recipes.map(r => r.result && r.result.item);
console.log('Craft recipe results:', recipeResults);

console.log('=== AUDIT COMPLETE ===');
