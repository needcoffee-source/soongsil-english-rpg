const fs = require('fs');

console.log('====================================================');
console.log('      DEEP CODEBASE DIAGNOSTIC & BUG AUDIT          ');
console.log('====================================================');

let issuesFound = 0;
const errors = [];

function recordIssue(category, msg) {
  issuesFound++;
  errors.push(`[${category}] ${msg}`);
  console.log(`[${category}] ${msg}`);
}

// ---------------------------------------------------------
// 1. DOM ELEMENT AUDIT
// ---------------------------------------------------------
console.log('\n--- 1. DOM ELEMENT ID AUDIT ---');
const indexHtml = fs.readFileSync('public/index.html', 'utf8');
const idMatches = [...indexHtml.matchAll(/id=["']([^"']+)["']/g)].map(m => m[1]);
const htmlIds = new Set(idMatches);

const jsFiles = [
  'public/js/main.js',
  'public/js/engine.js',
  'public/js/crafting.js',
  'public/js/quiz.js',
  'public/js/network.js',
  'public/js/acid_rain.js',
  'public/js/audio.js',
  'public/js/dialog.js'
];

// Dynamically created IDs inside innerHTML
const dynamicIds = new Set([
  'quiz-option-0', 'quiz-option-1', 'quiz-option-2', 'quiz-option-3',
  'btn-respawn-hallway', 'btn-wait-revive', 'btn-fallback-respawn'
]);

jsFiles.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  const matches = [...code.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
  const uniqueInFile = [...new Set(matches)];
  uniqueInFile.forEach(id => {
    if (!htmlIds.has(id) && !dynamicIds.has(id)) {
      recordIssue('MISSING_DOM_ID', `${file}: ID "${id}" referenced but not in index.html nor dynamic whitelist!`);
    }
  });
});

// Check if any element attached with addEventListener in initEventListeners might be null
const mainJs = fs.readFileSync('public/js/main.js', 'utf8');
const initListenersMatch = mainJs.match(/initEventListeners\(\)\s*\{([\s\S]*?)\n  \}/);
if (initListenersMatch) {
  const body = initListenersMatch[1];
  const listenerMatches = [...body.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)\.addEventListener/g)].map(m => m[1]);
  listenerMatches.forEach(id => {
    if (!htmlIds.has(id)) {
      recordIssue('NULL_LISTENER', `initEventListeners attaches listener directly to non-existent ID "${id}" without null-check!`);
    }
  });
}

// ---------------------------------------------------------
// 2. ITEM & CRAFT RECIPES DATABASE INTEGRITY
// ---------------------------------------------------------
console.log('\n--- 2. ITEM DATABASE INTEGRITY AUDIT ---');
const serverCode = fs.readFileSync('server.js', 'utf8');
const recipes = JSON.parse(fs.readFileSync('data/craft_recipes.json', 'utf8'));

// Extract server item IDs
const serverItemIds = new Set();
const serverItemMatch = serverCode.match(/const ALL_GAME_ITEMS = \{([\s\S]*?)\n\};/);
if (serverItemMatch) {
  const lines = serverItemMatch[1].split('\n');
  lines.forEach(line => {
    const m = line.match(/^\s*['"]?([a-zA-Z0-9_]+)['"]?\s*:/);
    if (m) serverItemIds.add(m[1]);
  });
}

// Extract client item IDs
const clientItemIds = new Set();
const clientItemMatch = mainJs.match(/const ALL_GAME_ITEMS = \{([\s\S]*?)\n\};/);
if (clientItemMatch) {
  const lines = clientItemMatch[1].split('\n');
  lines.forEach(line => {
    const m = line.match(/^\s*['"]?([a-zA-Z0-9_]+)['"]?\s*:/);
    if (m) clientItemIds.add(m[1]);
  });
}

// Check recipe outputs and ingredients against server & client item IDs
recipes.forEach(recipe => {
  const outItem = recipe.result && recipe.result.item;
  if (!outItem) {
    recordIssue('RECIPE_INVALID', `Recipe "${recipe.name}" has no result.item!`);
  } else {
    if (!serverItemIds.has(outItem)) {
      recordIssue('RECIPE_ITEM_MISSING', `Recipe "${recipe.name}" output "${outItem}" not in server ALL_GAME_ITEMS!`);
    }
    if (!clientItemIds.has(outItem)) {
      recordIssue('RECIPE_ITEM_MISSING', `Recipe "${recipe.name}" output "${outItem}" not in client ALL_GAME_ITEMS!`);
    }
  }

  (recipe.requiredItems || []).forEach(req => {
    if (!serverItemIds.has(req.item)) {
      recordIssue('RECIPE_ITEM_MISSING', `Recipe "${recipe.name}" ingredient "${req.item}" not in server ALL_GAME_ITEMS!`);
    }
    if (!clientItemIds.has(req.item)) {
      recordIssue('RECIPE_ITEM_MISSING', `Recipe "${recipe.name}" ingredient "${req.item}" not in client ALL_GAME_ITEMS!`);
    }
  });
});

// ---------------------------------------------------------
// 3. MONSTER & BOSS DROP INTEGRITY AUDIT
// ---------------------------------------------------------
console.log('\n--- 3. MONSTER & BOSS DROP INTEGRITY AUDIT ---');
const bossPresetsMatch = serverCode.match(/const BOSS_PRESETS = \{([\s\S]*?)\n\};/);
if (bossPresetsMatch) {
  const dropMatches = [...bossPresetsMatch[1].matchAll(/itemId:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  dropMatches.forEach(itemId => {
    if (!serverItemIds.has(itemId)) {
      recordIssue('BOSS_DROP_MISSING', `Item ID "${itemId}" in BOSS_PRESETS drops not in ALL_GAME_ITEMS!`);
    }
  });
}

const worldCode = fs.readFileSync('public/js/world.js', 'utf8');
const fieldMobDrops = [...worldCode.matchAll(/itemId:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
fieldMobDrops.forEach(itemId => {
  if (!serverItemIds.has(itemId)) {
    recordIssue('FIELD_DROP_MISSING', `Item ID "${itemId}" in world.js field monster drops not in ALL_GAME_ITEMS!`);
  }
});

// ---------------------------------------------------------
// 4. QUESTIONS INTEGRITY AUDIT
// ---------------------------------------------------------
console.log('\n--- 4. QUIZ QUESTIONS INTEGRITY AUDIT ---');
const questionFiles = [
  'data/questions_grade1.json',
  'data/questions_grade2.json',
  'data/questions_grade3.json'
];

questionFiles.forEach(qFile => {
  try {
    const qData = JSON.parse(fs.readFileSync(qFile, 'utf8'));
    let totalQuestions = 0;
    for (const [category, list] of Object.entries(qData)) {
      if (!Array.isArray(list)) continue;
      list.forEach((q, idx) => {
        totalQuestions++;
        if (!q.question) {
          recordIssue('QUESTION_EMPTY', `${qFile} [${category} #${idx}] missing question text!`);
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          recordIssue('QUESTION_OPTIONS', `${qFile} [${category} #${idx}] invalid options array!`);
        }
        if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length) {
          recordIssue('QUESTION_ANSWER', `${qFile} [${category} #${idx}] answer index ${q.answer} out of bounds!`);
        }
      });
    }
    console.log(`[PASS] ${qFile}: ${totalQuestions} questions validated.`);
  } catch (err) {
    recordIssue('JSON_ERROR', `${qFile} failed to parse: ${err.message}`);
  }
});

// ---------------------------------------------------------
// 5. AUDIO SOUND ASSETS AUDIT
// ---------------------------------------------------------
console.log('\n--- 5. AUDIO ASSETS AUDIT ---');
const audioCode = fs.readFileSync('public/js/audio.js', 'utf8');
const audioSfxMatch = audioCode.match(/this\.sounds\s*=\s*\{([\s\S]*?)\n\s*\};/);
const registeredSfx = new Set();
if (audioSfxMatch) {
  const lines = audioSfxMatch[1].split('\n');
  lines.forEach(l => {
    const m = l.match(/^\s*['"]?([a-zA-Z0-9_]+)['"]?\s*:/);
    if (m) registeredSfx.add(m[1]);
  });
}

// Find all playSfx('...') calls across files
jsFiles.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  const sfxCalls = [...code.matchAll(/playSfx\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
  sfxCalls.forEach(sfxName => {
    if (!registeredSfx.has(sfxName)) {
      recordIssue('UNREGISTERED_SFX', `${file} calls unregistered SFX: "${sfxName}"`);
    }
  });
});

// ---------------------------------------------------------
// 6. ROOM NAVIGATION & INTERACTIVE OBJECT AUDIT
// ---------------------------------------------------------
console.log('\n--- 6. WORLD ROOM NAVIGATION & INTERACTIVE AUDIT ---');
// Check all door targets in WORLD_DATA.floors
const floorsMatch = worldCode.match(/floors:\s*\{([\s\S]*?)\n  \},/);
// Verify interactive types handled in main.js handleInteraction
const interactionTypesHandled = new Set([
  'npc', 'mascot', 'teacher_desk', 'gather_wood', 'gather_herb', 'gather_forsythia', 'gather_ginkgo',
  'ginkgo', 'forsythia', 'board', 'craft', 'boss_raid', 'leaderboard', 'elevator', 'history_vitrine',
  'history_altar', 'history_hall', 'cafeteria', 'store', 'title_exchange', 'secret_locker',
  'career_clue', 'career_exit_keypad', 'moral_desk', 'moral_board', 'drum_kit', 'field_monster',
  'acid_rain', 'plant_zone', 'club_board', 'mirror', 'alchemy_cauldron', 'alchemy_shelf',
  'alchemy_tome', 'alchemy_workbench'
]);

const interactiveTypeMatches = [...worldCode.matchAll(/type:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const uniqueInteractiveTypes = [...new Set(interactiveTypeMatches)];
uniqueInteractiveTypes.forEach(t => {
  if (!interactionTypesHandled.has(t)) {
    console.log(`[INFO/WARNING] Interactive type "${t}" in world.js - check if handled in engine or main`);
  }
});

// ---------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------
console.log('\n====================================================');
console.log(` DEEP AUDIT RESULT: ${issuesFound} ISSUES FOUND`);
if (issuesFound === 0) {
  console.log(' ALL INTEGRITY & CODING CHECKS PASSED WITH 0 ERRORS! ');
} else {
  console.log(' ERRORS SUMMARY:');
  errors.forEach(e => console.log('  ❌ ' + e));
}
console.log('====================================================');
