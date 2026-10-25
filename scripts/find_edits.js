const fs = require('fs');
const readline = require('readline');

async function findFutsalEdits() {
  const fileStream = fs.createReadStream('C:/Users/user/.gemini/antigravity/brain/1521d4be-6d08-469b-97d0-1103792861b4/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const edits = [];
  for await (const line of rl) {
    if (line.includes('drawHighResFutsalGoalPost') || line.includes('futsalMonsters')) {
      try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
          obj.tool_calls.forEach(tc => {
            if (tc.name === 'edit_file' && tc.args.Path.includes('engine.js')) {
              edits.push(tc.args);
            }
          });
        }
      } catch (e) {}
    }
  }
  fs.writeFileSync('scripts/extracted_futsal_edits.json', JSON.stringify(edits, null, 2), 'utf8');
  console.log(`Found ${edits.length} edits for engine.js`);
}

findFutsalEdits();
