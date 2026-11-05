const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let checkedCount = 0;

function checkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (f.name !== 'node_modules' && f.name !== '.git' && f.name !== '.gemini') {
        checkDir(full);
      }
    } else if (f.isFile() && f.name.endsWith('.js')) {
      try {
        execSync(`"${process.execPath}" --check "${full}"`);
        checkedCount++;
      } catch (err) {
        console.error(`SYNTAX ERROR in ${full}:`, err.message);
        process.exit(1);
      }
    }
  }
}

checkDir('public/js');
checkDir('scripts');
checkDir('services');
if (fs.existsSync('server.js')) {
  execSync(`"${process.execPath}" --check "server.js"`);
  checkedCount++;
}

console.log(`✅ ALL ${checkedCount} JS FILES SYNTAX VERIFIED CLEAN!`);
