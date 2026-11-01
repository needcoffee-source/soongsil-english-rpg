const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log('   SOONGSIL RPG FULL SYNCHRONIZATION & CODE AUDIT   ');
console.log('====================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let errors = [];

function check(label, condition, errorMsg = '') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`[PASS] ${label}`);
  } else {
    console.error(`[FAIL] ${label} - ${errorMsg}`);
    errors.push(`${label}: ${errorMsg}`);
  }
}

// 1. Syntax Check on all JS files
console.log('--- 1. JS SYNTAX AUDIT ---');
const jsFiles = [
  'server.js',
  'public/js/audio.js',
  'public/js/dialog.js',
  'public/js/world.js',
  'public/js/engine.js',
  'public/js/quiz.js',
  'public/js/crafting.js',
  'public/js/network.js',
  'public/js/acid_rain.js',
  'public/js/main.js'
];

jsFiles.forEach(file => {
  try {
    const code = fs.readFileSync(file, 'utf8');
    new vm.Script(code, { filename: file });
    check(`Syntax check: ${file}`, true);
  } catch (e) {
    check(`Syntax check: ${file}`, false, e.message);
  }
});

// 2. JSON Validation
console.log('\n--- 2. JSON DATA AUDIT ---');
const jsonFiles = [
  'data/craft_recipes.json',
  'data/questions_grade1.json',
  'data/questions_grade2.json',
  'data/questions_grade3.json',
  'data/school_floors.json',
  'data/students_progress.json'
];

let craftRecipes = [];
jsonFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(content);
    if (file === 'data/craft_recipes.json') craftRecipes = parsed;
    check(`Valid JSON: ${file}`, true);
  } catch (e) {
    check(`Valid JSON: ${file}`, false, e.message);
  }
});

// 3. Item Synchronization Audit
console.log('\n--- 3. ITEM & STAT SYNCHRONIZATION AUDIT ---');
// Read server items
const serverCode = fs.readFileSync('server.js', 'utf8');
const mainCode = fs.readFileSync('public/js/main.js', 'utf8');

function extractObject(code, varName) {
  const startIdx = code.indexOf(`const ${varName} =`);
  if (startIdx === -1) return null;
  const openBrace = code.indexOf('{', startIdx);
  let depth = 0;
  let endIdx = -1;
  for (let i = openBrace; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') {
      depth--;
      if (depth === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }
  if (endIdx === -1) return null;
  const objCode = code.slice(openBrace, endIdx);
  // safe eval in sandbox
  const sandbox = {};
  return vm.runInNewContext('(' + objCode + ')', sandbox);
}

const serverItems = extractObject(serverCode, 'ALL_GAME_ITEMS');
const mainItems = extractObject(mainCode, 'ALL_GAME_ITEMS');

check('Server ALL_GAME_ITEMS parsed', !!serverItems);
check('Client ALL_GAME_ITEMS parsed', !!mainItems);

if (serverItems && mainItems) {
  const serverKeys = Object.keys(serverItems);
  const mainKeys = Object.keys(mainItems);
  check(`Item count match (Server: ${serverKeys.length}, Client: ${mainKeys.length})`, serverKeys.length === mainKeys.length);

  // Check missing keys
  const missingInClient = serverKeys.filter(k => !mainKeys.includes(k));
  const missingInServer = mainKeys.filter(k => !serverKeys.includes(k));
  check('No items missing in client', missingInClient.length === 0, `Missing: ${missingInClient.join(', ')}`);
  check('No items missing in server', missingInServer.length === 0, `Missing: ${missingInServer.join(', ')}`);

  // Check stat synchronization for equipment
  let statMismatches = [];
  serverKeys.forEach(key => {
    const sItem = serverItems[key];
    const cItem = mainItems[key];
    if (sItem && cItem && sItem.meta && cItem.meta) {
      if (sItem.meta.type === 'equipment' || cItem.meta.type === 'equipment') {
        const sStats = sItem.meta.stats || {};
        const cStats = cItem.meta.stats || {};
        const atkMatch = (sStats.atk || 0) === (cStats.atk || 0);
        const defMatch = (sStats.def || 0) === (cStats.def || 0);
        const hpMatch = (sStats.hp || 0) === (cStats.hp || 0);
        if (!atkMatch || !defMatch || !hpMatch) {
          statMismatches.push(`${key}: Server(ATK:${sStats.atk}, DEF:${sStats.def}, HP:${sStats.hp}) vs Client(ATK:${cStats.atk}, DEF:${cStats.def}, HP:${cStats.hp})`);
        }
      }
    }
  });
  check('Server & Client equipment stats match 100%', statMismatches.length === 0, statMismatches.join(' | '));
}

// Check Crafting Recipes vs Item Stats
if (craftRecipes && serverItems) {
  let recipeMismatches = [];
  craftRecipes.forEach(r => {
    const res = r.result;
    if (res && res.type === 'equipment' && res.stats) {
      const sItem = serverItems[res.item];
      if (sItem && sItem.meta && sItem.meta.stats) {
        const sStats = sItem.meta.stats;
        const rStats = res.stats;
        if ((sStats.atk || 0) !== (rStats.atk || 0) || (sStats.def || 0) !== (rStats.def || 0) || (sStats.hp || 0) !== (rStats.hp || 0)) {
          recipeMismatches.push(`${res.item}: Recipe(ATK:${rStats.atk}, DEF:${rStats.def}, HP:${rStats.hp}) vs Server(ATK:${sStats.atk}, DEF:${sStats.def}, HP:${sStats.hp})`);
        }
      }
    }
  });
  check('Craft recipes & Server equipment stats match 100%', recipeMismatches.length === 0, recipeMismatches.join(' | '));
}

// 4. World & Museum Naming Audit
console.log('\n--- 4. WORLD & MUSEUM NAMING AUDIT ---');
const worldCode = fs.readFileSync('public/js/world.js', 'utf8');
const engineCode = fs.readFileSync('public/js/engine.js', 'utf8');

check('Exhibit 2 in world.js is "1938 민족신앙 수호관"', worldCode.includes('1938 민족신앙 수호관'));
check('Exhibit 2 in engine.js is "1938 민족신앙 수호관"', engineCode.includes('1938 민족신앙 수호관'));
check('Exhibit 2 in main.js is "1938 민족신앙 수호관"', mainCode.includes('1938 민족신앙 수호관'));
check('No stale "자진폐교관" title in engine vitrine draw', !engineCode.includes("drawMuseumVitrine(6 * 32, 13 * 32, 2, '1938 신사참배 거부와 자진폐교관'"));

check('History Altar in world.js is "✨ 숭실 역사관 신비한 제단"', worldCode.includes('✨ 숭실 역사관 신비한 제단'));
check('History Altar in engine.js has correct unlock/lock titles', engineCode.includes("const altarTitle = unlocked ? '✨ 숭실 역사관 신비한 제단' : '🔒 숭실 역사관 신비한 제단 (4대 전시관 탐방 필요)';"));

check('Staff office plaque is "🏛️ 교무실"', engineCode.includes("const plaqueTitle = isStaffOffice ? '🏛️ 교무실' : '🌟 진로상담실 (Career Center)';"));
check('History hall entrance portal prompt is clean "🏛️ 숭실역사관"', !worldCode.includes('숭실역사관 입장 (SPACE)'));

// 5. Version Cache-Buster Consistency
console.log('\n--- 5. CACHE BUSTER CONSISTENCY AUDIT ---');
const indexHtml = fs.readFileSync('public/index.html', 'utf8');
const v95Matches = (indexHtml.match(/v=95/g) || []).length;
const v96Matches = (indexHtml.match(/v=96/g) || []).length;
check('No stale v=95 cache tags in index.html', v95Matches === 0, `Found ${v95Matches} stale tags`);
check('All assets use v=96 cache tags in index.html', v96Matches >= 8, `Found ${v96Matches} v=96 tags`);

console.log('\n====================================================');
console.log(` AUDIT RESULT: ${passedChecks} / ${totalChecks} PASSED`);
if (errors.length > 0) {
  console.log(` ERRORS FOUND (${errors.length}):`);
  errors.forEach(e => console.log('  ❌ ' + e));
} else {
  console.log(' ALL SYNCHRONIZATION & CODE CHECKS PASSED PERFECTLY!');
}
console.log('====================================================');
