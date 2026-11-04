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
  'public/js/brawl_ball.js',
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
check('History Altar in engine.js has correct unlock/lock titles', engineCode.includes("const altarTitle = unlocked ? '✨ 숭실 역사관 신비한 제단' : '🔒 숭실 역사관 신비한 제단';"));

check('Staff office plaque is "🏛️ 교무실"', engineCode.includes("const plaqueTitle = r.plaqueName || (isStaffOffice ? '🏛️ 교무실' : '🌟 진로상담실');"));
check('History hall entrance portal prompt is clean "🏛️ 숭실역사관"', !worldCode.includes('숭실역사관 입장 (SPACE)'));

// 5. Version Cache-Buster Consistency
console.log('\n--- 5. CACHE BUSTER CONSISTENCY AUDIT ---');
const indexHtml = fs.readFileSync('public/index.html', 'utf8');
const vOldMatches = (indexHtml.match(/v=137/g) || []).length;
const vCurMatches = (indexHtml.match(/v=153/g) || []).length;
check('No stale v=137 cache tags in index.html', vOldMatches === 0, `Found ${vOldMatches} stale tags`);
check('All assets use v=153 cache tags in index.html', vCurMatches >= 8, `Found ${vCurMatches} v=153 tags`);

// 6. DOM Element ID Integrity Audit
console.log('\n--- 6. DOM ELEMENT ID INTEGRITY AUDIT ---');
const htmlIdMatches = [...indexHtml.matchAll(/id=["']([^"']+)["']/g)].map(m => m[1]);
const htmlIds = new Set(htmlIdMatches);
const dynamicIds = new Set([
  'quiz-option-0', 'quiz-option-1', 'quiz-option-2', 'quiz-option-3',
  'btn-respawn-hallway', 'btn-wait-revive', 'btn-fallback-respawn'
]);

let missingDomIds = [];
jsFiles.forEach(file => {
  if (file === 'server.js') return;
  const code = fs.readFileSync(file, 'utf8');
  const matches = [...code.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
  const uniqueInFile = [...new Set(matches)];
  uniqueInFile.forEach(id => {
    if (!htmlIds.has(id) && !dynamicIds.has(id)) {
      missingDomIds.push(`${file} -> #${id}`);
    }
  });
});
check('All client document.getElementById targets exist in index.html', missingDomIds.length === 0, `Missing: ${missingDomIds.join(', ')}`);

// 7. Craft Recipes Item Reference Integrity
console.log('\n--- 7. RECIPES & INVENTORY ITEM INTEGRITY AUDIT ---');
let missingRecipeItems = [];
if (craftRecipes && serverItems) {
  craftRecipes.forEach(r => {
    const outItem = r.result && r.result.item;
    if (!outItem || !serverItems[outItem]) {
      missingRecipeItems.push(`Recipe ${r.name} output: ${outItem}`);
    }
    (r.requiredItems || []).forEach(req => {
      if (!serverItems[req.item]) {
        missingRecipeItems.push(`Recipe ${r.name} ingredient: ${req.item}`);
      }
    });
  });
}
check('All craft recipe outputs & ingredients exist in ALL_GAME_ITEMS', missingRecipeItems.length === 0, missingRecipeItems.join(' | '));

// 8. Boss & Monster Drops Integrity
console.log('\n--- 8. MONSTER & BOSS DROP INTEGRITY AUDIT ---');
let missingDropItems = [];
const bossPresetsMatch = serverCode.match(/const BOSS_PRESETS = \{([\s\S]*?)\n\};/);
if (bossPresetsMatch && serverItems) {
  const dropMatches = [...bossPresetsMatch[1].matchAll(/itemId:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  dropMatches.forEach(itemId => {
    if (!serverItems[itemId]) missingDropItems.push(`Boss drop: ${itemId}`);
  });
}
const fieldMobDrops = [...worldCode.matchAll(/itemId:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
if (serverItems) {
  fieldMobDrops.forEach(itemId => {
    if (!serverItems[itemId]) missingDropItems.push(`Field mob drop: ${itemId}`);
  });
}
check('All boss and field monster drop items exist in ALL_GAME_ITEMS', missingDropItems.length === 0, missingDropItems.join(' | '));

// 9. Quiz Questions Integrity Audit
console.log('\n--- 9. QUIZ QUESTIONS & ANSWERS AUDIT ---');
let questionErrors = [];
let totalQuestionsChecked = 0;
['questions_grade1.json', 'questions_grade2.json', 'questions_grade3.json'].forEach(qFile => {
  const qList = JSON.parse(fs.readFileSync('data/' + qFile, 'utf8'));
  qList.forEach((q, idx) => {
    totalQuestionsChecked++;
    if (!q.question || !Array.isArray(q.options) || q.options.length < 2) {
      questionErrors.push(`${qFile}[#${idx}] invalid structure`);
    } else if (!q.options.includes(q.answer)) {
      questionErrors.push(`${qFile}[#${idx}] answer "${q.answer}" not in options`);
    }
  });
});
check(`All curriculum quiz questions (${totalQuestionsChecked} Qs) have valid answers matching options`, questionErrors.length === 0, questionErrors.join(' | '));

// 10. Brawl Ball & Multiplayer Sync Integrity Audit
console.log('\n--- 10. BRAWL BALL & MULTIPLAYER SYNC INTEGRITY AUDIT ---');
const brawlCode = fs.readFileSync('public/js/brawl_ball.js', 'utf8');
const networkCode = fs.readFileSync('public/js/network.js', 'utf8');
check('network.sendMove supports object & positional args safely', networkCode.includes('sendMove(dataOrX, y, direction)'));
check('server.js normalizes singleton room floors (playground -> 1)', serverCode.includes('function normalizeSingletonRoomFloor'));
check('engine.update does not early-return before BrawlBall.update when stunned', engineCode.includes('const isMovementLocked = !!(this.player.isFallen || isBrawlStunned || isBrawlKickoffWait);'));
check('brawl_ball.js defines getEntityVisualPos and getPlayerTeam', brawlCode.includes('getEntityVisualPos(entity)') && brawlCode.includes('getPlayerTeam(p, isLocal'));
check('brawl_ball.js defines isMatchHost() to prevent duplicate goal/bot packets', brawlCode.includes('isMatchHost()'));

console.log('\n====================================================');
console.log(` AUDIT RESULT: ${passedChecks} / ${totalChecks} PASSED`);
if (errors.length > 0) {
  console.log(` ERRORS FOUND (${errors.length}):`);
  errors.forEach(e => console.log('  ❌ ' + e));
} else {
  console.log(' ALL SYNCHRONIZATION & CODE CHECKS PASSED PERFECTLY!');
}
console.log('====================================================');
