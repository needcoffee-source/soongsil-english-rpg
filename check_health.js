const fs = require('fs');
const path = require('path');

console.log('=== SOONGSIL RPG CODEBASE HEALTH CHECK ===\n');

// 1. Check index.html DOM IDs against JS references
const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
const htmlIds = new Set();
const idRegex = /id=["']([^"']+)["']/g;
let match;
while ((match = idRegex.exec(html)) !== null) {
  htmlIds.add(match[1]);
}
console.log(`[HTML] Found ${htmlIds.size} unique DOM IDs in index.html`);

const jsFiles = ['main.js', 'quiz.js', 'crafting.js', 'dialog.js', 'engine.js'];
let missingCount = 0;

for (const jsFile of jsFiles) {
  const content = fs.readFileSync(path.join(__dirname, 'public', 'js', jsFile), 'utf8');
  const getElRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
  const queriedIds = new Set();
  while ((match = getElRegex.exec(content)) !== null) {
    queriedIds.add(match[1]);
  }
  
  for (const qId of queriedIds) {
    if (!htmlIds.has(qId)) {
      // Check if it's dynamically created in js (e.g. popups or dialogs)
      console.warn(`⚠️ Warning: ID '${qId}' queried in ${jsFile} not found in index.html!`);
      missingCount++;
    }
  }
}

if (missingCount === 0) {
  console.log('✅ DOM Integrity: 100% of queried getElementById references match index.html elements!');
} else {
  console.log(`⚠️ DOM Integrity: ${missingCount} IDs may be missing or dynamically injected.`);
}

// 2. Check questions.json
try {
  const qPath = path.join(__dirname, 'public', 'data', 'questions.json');
  if (fs.existsSync(qPath)) {
    const qData = JSON.parse(fs.readFileSync(qPath, 'utf8'));
    const totalQ = Array.isArray(qData) ? qData.length : Object.keys(qData).reduce((acc, k) => acc + (qData[k].length || 0), 0);
    console.log(`✅ Question Bank: questions.json loaded successfully with ${totalQ} questions.`);
  } else {
    console.log('ℹ️ Question Bank: questions.json not present as standalone file (may be bundled in quiz.js).');
  }
} catch (e) {
  console.error('❌ Question Bank Error:', e.message);
}

// 3. Check students_progress.json
try {
  const progPath = path.join(__dirname, 'students_progress.json');
  if (fs.existsSync(progPath)) {
    const progData = JSON.parse(fs.readFileSync(progPath, 'utf8'));
    console.log(`✅ Student Database: students_progress.json is valid JSON with ${Object.keys(progData).length} registered student(s).`);
  } else {
    console.log('ℹ️ Student Database: students_progress.json will be auto-created on first save.');
  }
} catch (e) {
  console.error('❌ Student Database Error:', e.message);
}

console.log('\n=== HEALTH CHECK COMPLETED ===');
