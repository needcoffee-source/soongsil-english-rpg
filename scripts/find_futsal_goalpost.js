const fs = require('fs');

const fullText = fs.readFileSync('C:/Users/user/.gemini/antigravity/brain/1521d4be-6d08-469b-97d0-1103792861b4/.system_generated/logs/transcript_full.jsonl', 'utf8');

const key = 'drawHighResFutsalGoalPost(x, y, isLeft) {';
const idx = fullText.indexOf(key);
if (idx >= 0) {
  const snippet = fullText.slice(idx - 50, idx + 2500).replace(/\\n/g, '\n').replace(/\\"/g, '"');
  fs.writeFileSync('scripts/futsal_goalpost_def.txt', snippet, 'utf8');
  console.log('Found definition! Length:', snippet.length);
} else {
  console.log('Not found key');
}
