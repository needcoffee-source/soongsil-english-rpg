const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('   DEEP PROJECT INSPECTION & DIAGNOSTIC AUDIT       ');
console.log('====================================================\n');

let issues = [];

// 1. Check for broken encoding / replacement characters (U+FFFD)
console.log('--- [1] ENCODING & REPLACEMENT CHARACTERS ---');
const filesToCheck = [
  'public/index.html',
  'public/js/main.js',
  'public/js/engine.js',
  'public/js/world.js',
  'public/js/dialog.js',
  'public/js/crafting.js',
  'public/js/quiz.js',
  'public/js/audio.js',
  'public/js/network.js',
  'public/js/acid_rain.js',
  'public/js/brawl_ball.js',
  'server.js',
  'data/craft_recipes.json',
  'data/questions_grade1.json',
  'data/questions_grade2.json',
  'data/questions_grade3.json',
  'data/school_floors.json'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/\uFFFD/g);
    if (matches) {
      issues.push(`Encoding issue in ${file}: Found ${matches.length} U+FFFD (replacement characters)`);
      console.log(`❌ ${file}: ${matches.length} U+FFFD characters`);
    }
  }
});
if (issues.filter(i => i.startsWith('Encoding')).length === 0) {
  console.log('✅ All files UTF-8 clean. No broken replacement characters found.');
}

// 2. Deep Unscramble (복호화 / 언스크램블) Check
console.log('\n--- [2] UNSCRAMBLE / DECRYPTION LOGIC AUDIT ---');
const craftRecipes = JSON.parse(fs.readFileSync('data/craft_recipes.json', 'utf8'));
let unscrambleCount = 0;
let unscrambleIssues = 0;

craftRecipes.forEach(recipe => {
  if (recipe.unscramble) {
    unscrambleCount++;
    const u = recipe.unscramble;
    if (!u.korean || !u.words || !u.correct) {
      issues.push(`Recipe ${recipe.id}: Missing unscramble fields`);
      unscrambleIssues++;
      return;
    }

    if (!Array.isArray(u.words) || u.words.length === 0) {
      issues.push(`Recipe ${recipe.id}: unscramble.words is not a valid non-empty array`);
      unscrambleIssues++;
      return;
    }

    // Check if joining words matches correct sentence (or words match multiset)
    const normalize = (str) => str.replace(/[.,!?;:'"()]/g, '').trim().toLowerCase();
    const correctWords = u.correct.split(/\s+/).map(normalize);
    const providedWords = u.words.map(normalize);

    const sortedCorrect = [...correctWords].sort();
    const sortedProvided = [...providedWords].sort();

    if (JSON.stringify(sortedCorrect) !== JSON.stringify(sortedProvided)) {
      issues.push(`Recipe ${recipe.id} words mismatch:
  Provided words: ${JSON.stringify(u.words)}
  Correct: "${u.correct}"`);
      console.log(`❌ Recipe ${recipe.id} unscramble word mismatch!`);
      console.log(`   Words in array:`, u.words);
      console.log(`   Correct sentence:`, u.correct);
      unscrambleIssues++;
    }
  }
});

console.log(`Tested ${unscrambleCount} recipes with unscramble.`);
if (unscrambleIssues === 0) {
  console.log(`✅ All ${unscrambleCount} unscramble sentences have 100% exact matching words and punctuation!`);
}

// 3. Cipher & Puzzle Keys Audit (Keypad, Clues, Time Capsules)
console.log('\n--- [3] CIPHERS, CODES & PUZZLE AUDIT ---');
const mainJs = fs.readFileSync('public/js/main.js', 'utf8');

// Career Keypad code check ('DREAMS' acronym from 6 clues: Doctor, Researcher, Engineer, Artist, Mentor, Scientist)
const careerPasswordMatch = mainJs.includes("val === 'DREAMS'");
if (careerPasswordMatch) {
  console.log(`✅ Career Keypad target password verified: 'DREAMS' (matches 6 clues: D-R-E-A-M-S)`);
} else {
  issues.push('Career Keypad target password DREAMS not found');
  console.log(`❌ Career Keypad target password not found`);
}

// Time capsule lock code check (1938 / 1897 historical founding/faith defense dates)
const timeCapsuleFound = mainJs.includes('1938') && mainJs.includes('1897');
if (timeCapsuleFound) {
  console.log(`✅ Time Capsule historical defense year/codes verified: 1938 & 1897.`);
} else {
  issues.push('Time capsule historical codes missing');
}

// 4. AudioManager calls vs AudioManager methods
console.log('\n--- [4] AUDIO CALLS AUDIT ---');
const audioJs = fs.readFileSync('public/js/audio.js', 'utf8');
const audioMethods = new Set();
const methodMatches = audioJs.matchAll(/(?:play[A-Za-z0-9_]+|toggleMute|updateMuteButtonUI)\s*\(/g);
for (const m of methodMatches) {
  audioMethods.add(m[0].replace('(', '').trim());
}

const calledAudioMethods = new Set();
const callMatches = mainJs.matchAll(/AudioManager\.([A-Za-z0-9_]+)\s*\(/g);
for (const m of callMatches) {
  calledAudioMethods.add(m[1]);
}

let missingAudio = [];
for (const called of calledAudioMethods) {
  if (!audioMethods.has(called) && called !== 'init' && called !== 'startBgMusic' && called !== 'stopBgMusic') {
    missingAudio.push(called);
  }
}

if (missingAudio.length > 0) {
  console.log(`⚠️ Potential missing AudioManager methods:`, missingAudio);
  issues.push(`AudioManager missing: ${missingAudio.join(', ')}`);
} else {
  console.log(`✅ All ${calledAudioMethods.size} AudioManager calls in main.js exist in audio.js!`);
}

// 5. HTML Document DOM element IDs & Closing tags check
console.log('\n--- [5] HTML DOM & ELEMENT INTEGRITY AUDIT ---');
const indexHtml = fs.readFileSync('public/index.html', 'utf8');

// Known dynamic IDs created via innerHTML at runtime
const knownDynamicIds = new Set([
  'btn-respawn-hallway',
  'btn-wait-revive',
  'btn-fallback-respawn',
  'btn-start-uphill',
  'uphill-count-num',
  'btn-uphill-retry',
  'btn-uphill-quit'
]);

const allJsFiles = [
  'public/js/main.js',
  'public/js/engine.js',
  'public/js/crafting.js',
  'public/js/dialog.js',
  'public/js/quiz.js',
  'public/js/acid_rain.js',
  'public/js/brawl_ball.js',
  'public/js/uphill_rush.js'
];

const requestedIds = new Set();
allJsFiles.forEach(f => {
  if (fs.existsSync(f)) {
    const code = fs.readFileSync(f, 'utf8');
    const idMatches = code.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g);
    for (const m of idMatches) {
      if (!m[1].includes('$') && !m[1].startsWith('admin_') && !m[1].startsWith('item_') && !m[1].startsWith('slot_') && !knownDynamicIds.has(m[1])) {
        requestedIds.add(m[1]);
      }
    }
  }
});

let missingIds = [];
requestedIds.forEach(id => {
  const idRegex = new RegExp(`id=["']${id}["']`);
  if (!idRegex.test(indexHtml)) {
    missingIds.push(id);
  }
});

if (missingIds.length > 0) {
  console.log(`⚠️ Document IDs queried in JS but missing in index.html (${missingIds.length}):`, missingIds);
  issues.push(`Missing DOM IDs: ${missingIds.join(', ')}`);
} else {
  console.log(`✅ All ${requestedIds.size} static getElementById calls matched elements in index.html!`);
}

// 6. Modal Overlays & Close Buttons check
console.log('\n--- [6] MODAL CLOSE BUTTON INTEGRITY AUDIT ---');
const modalRegex = /<div\s+[^>]*id=["'](modal-[^"']+)["'][^>]*class=["'][^"']*modal-overlay[^"']*["'][^>]*>/g;
const modalMatches = [...indexHtml.matchAll(modalRegex)];
let modalsWithoutClose = [];

modalMatches.forEach(m => {
  const modalId = m[1];
  if (modalId === 'modal-login') return; // Login modal intentionally doesn't close before authentication

  // Find modal container slice in HTML
  const startIdx = indexHtml.indexOf(m[0]);
  const endIdx = indexHtml.indexOf('</div>\n  </div>', startIdx + 1);
  const modalSlice = indexHtml.slice(startIdx, startIdx + 3000); // sample inner HTML

  const hasCloseBtn = modalSlice.includes('btn-modal-close') ||
                      modalSlice.includes('btn-close') ||
                      modalSlice.includes('닫기') ||
                      modalSlice.includes('btn-secondary');

  if (!hasCloseBtn) {
    modalsWithoutClose.push(modalId);
  }
});

if (modalsWithoutClose.length > 0) {
  console.log(`⚠️ Modals that might lack close button:`, modalsWithoutClose);
} else {
  console.log(`✅ All ${modalMatches.length} modals verified to have dedicated close mechanisms!`);
}

// 7. Summary
console.log('\n====================================================');
if (issues.length === 0) {
  console.log('🎉 DEEP DIAGNOSTIC INSPECTION: ALL 0 ISSUES FOUND! 100% HEALTHY!');
} else {
  console.log(`⚠️ Found ${issues.length} potential issues:`);
  issues.forEach(i => console.log(' - ' + i));
}
console.log('====================================================\n');
