const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== SOONGSIL OPEN WORLD RPG DEBUGGING HEALTH CHECK ===\n');

let pass = true;

// 1. Check all JS files syntax dynamically
const jsDirs = ['', 'public/js', 'scripts'];
const jsFiles = [];

jsDirs.forEach(d => {
  const dirPath = path.join(__dirname, '..', d);
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(f => {
      if (f.endsWith('.js') && !f.includes('node_modules')) {
        jsFiles.push(d ? `${d}/${f}` : f);
      }
    });
  }
});

console.log('1. Checking JavaScript Syntax (AST Parse)...');
jsFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  try {
    execSync(`"${process.execPath}" -c "${fullPath}"`);
    console.log(`  [OK] ${file}`);
  } catch (e) {
    console.error(`  [FAIL] ${file}: ${e.message}`);
    pass = false;
  }
});

// 2. Check JSON data integrity
console.log('\n2. Checking JSON Data Files...');
const jsonFiles = [
  'package.json',
  'data/craft_recipes.json'
];

// Check data/questions directory if any
const questionsDir = path.join(__dirname, '..', 'data', 'questions');
if (fs.existsSync(questionsDir)) {
  fs.readdirSync(questionsDir).forEach(f => {
    if (f.endsWith('.json')) jsonFiles.push(`data/questions/${f}`);
  });
}

jsonFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = JSON.parse(content);
    console.log(`  [OK] ${file} (parsed ${Array.isArray(parsed) ? parsed.length + ' items' : 'object'})`);
  } catch (e) {
    console.error(`  [FAIL] ${file}: ${e.message}`);
    pass = false;
  }
});

// 3. Item Consistency Check across Server and Client
console.log('\n3. Checking Item Catalog Consistency...');
try {
  const serverCode = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  const mainCode = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'main.js'), 'utf8');

  // Extract keys from server ALL_GAME_ITEMS
  const serverMatch = serverCode.match(/const ALL_GAME_ITEMS = \{([\s\S]*?)\n\};/);
  const clientMatch = mainCode.match(/const ALL_GAME_ITEMS = \{([\s\S]*?)\n\};/);

  if (serverMatch && clientMatch) {
    const serverKeys = [...serverMatch[1].matchAll(/'([^']+)':/g)].map(m => m[1]);
    const clientKeys = [...clientMatch[1].matchAll(/'([^']+)':/g)].map(m => m[1]);

    console.log(`  Server Item Keys (${serverKeys.length}): ${serverKeys.join(', ')}`);
    console.log(`  Client Item Keys (${clientKeys.length}): ${clientKeys.join(', ')}`);

    const missingInClient = serverKeys.filter(k => !clientKeys.includes(k));
    const missingInServer = clientKeys.filter(k => !serverKeys.includes(k));

    if (missingInClient.length > 0) {
      console.warn(`  [WARN] Items in server but missing in client: ${missingInClient.join(', ')}`);
      pass = false;
    } else {
      console.log('  [OK] All server items are present in client catalog.');
    }

    if (missingInServer.length > 0) {
      console.warn(`  [WARN] Items in client but missing in server: ${missingInServer.join(', ')}`);
      pass = false;
    } else {
      console.log('  [OK] All client items are present in server catalog.');
    }
  } else {
    console.warn('  [WARN] Could not parse ALL_GAME_ITEMS block regex');
  }
} catch (e) {
  console.error('  [FAIL] Item check error:', e.message);
  pass = false;
}

// 4. Check Craft Recipes output items
console.log('\n4. Checking Craft Recipes Results against Catalog...');
try {
  const recipes = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'craft_recipes.json'), 'utf8'));
  const serverCode = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  recipes.forEach(r => {
    const outItem = r.result && r.result.item;
    if (!serverCode.includes(`'${outItem}'`)) {
      console.warn(`  [WARN] Recipe result ${outItem} (${r.name}) not found in server.js`);
      pass = false;
    }
    // Check required items
    (r.requiredItems || []).forEach(req => {
      if (!serverCode.includes(`'${req.item}'`)) {
        console.warn(`  [WARN] Recipe required item ${req.item} (${req.name}) not found in server.js`);
        pass = false;
      }
    });
  });
  console.log(`  [OK] All ${recipes.length} craft recipes use valid catalog items.`);
} catch (e) {
  console.error('  [FAIL] Craft recipe check error:', e.message);
  pass = false;
}

// 5. Check Futsal and Basketball Monster Field drops
console.log('\n5. Checking Monster Drop Table Consistency...');
try {
  const worldCode = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'world.js'), 'utf8');
  const mainCode = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'main.js'), 'utf8');

  // Verify drop items referenced in handleFieldBattleVictory
  const requiredDrops = ['item_futsal_leather', 'item_orange_potion', 'equip_leather_helmet', 'item_basketball_leather', 'item_forsythia', 'equip_leather_armor'];
  requiredDrops.forEach(drop => {
    if (mainCode.includes(`'${drop}'`)) {
      console.log(`  [OK] Field battle drop handler includes ${drop}`);
    } else {
      console.warn(`  [FAIL] Field battle drop handler missing ${drop}`);
      pass = false;
    }
  });
} catch (e) {
  console.error('  [FAIL] Monster drop check error:', e.message);
  pass = false;
}

// 6. Check Excel Drop Catalog File
console.log('\n6. Checking Excel Drop Catalog File...');
const excelFiles = [
  '숭실중_영어RPG_아이템획득경로_드랍테이블.xlsx',
  'soongsil_rpg_item_drops_catalog.xlsx',
  'public/downloads/soongsil_rpg_item_drops_catalog.xlsx'
];
excelFiles.forEach(f => {
  const p = path.join(__dirname, '..', f);
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    console.log(`  [OK] ${f} exists (${Math.round(stat.size / 1024)} KB)`);
  } else {
    console.error(`  [FAIL] ${f} does not exist`);
    pass = false;
  }
});

// 7. Check script src references in public/index.html
console.log('\n7. Checking Script References in index.html...');
try {
  const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
  const scriptMatches = [...htmlContent.matchAll(/<script[^>]+src=["']([^"']+)["']/g)];
  scriptMatches.forEach(m => {
    const src = m[1];
    const cleanSrc = src.split('?')[0];
    if (cleanSrc.startsWith('http') || cleanSrc.startsWith('//')) {
      console.log(`  [EXTERNAL CDN] ${src}`);
    } else if (cleanSrc.startsWith('/socket.io/')) {
      console.log(`  [DYNAMIC SOCKET.IO] ${src}`);
    } else {
      const localPath = path.join(__dirname, '..', 'public', cleanSrc.replace(/^\//, ''));
      if (fs.existsSync(localPath)) {
        console.log(`  [OK] Local script exists: ${cleanSrc}`);
      } else {
        console.error(`  [FAIL] Missing script in index.html: ${src} -> ${localPath}`);
        pass = false;
      }
    }
  });
} catch (e) {
  console.error('  [FAIL] HTML check error:', e.message);
  pass = false;
}

// 8. Test Live Server HTTP Endpoints
console.log('\n8. Checking Live Server Endpoints (http://localhost:3000)...');
const http = require('http');

function testEndpoint(pathUrl) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${pathUrl}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, length: data.length, contentType: res.headers['content-type'] });
      });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

(async () => {
  const endpoints = [
    { url: '/', expectStatus: 200 },
    { url: '/api/quiz?grade=1', expectStatus: 200 },
    { url: '/api/admin/all-students-progress', expectStatus: 200 },
    { url: '/api/admin/download-item-drops-excel', expectStatus: 200 }
  ];

  for (const ep of endpoints) {
    const res = await testEndpoint(ep.url);
    if (res.status === ep.expectStatus) {
      console.log(`  [OK] ${ep.url} -> HTTP ${res.status} (${res.contentType || 'unknown'})`);
    } else {
      console.error(`  [FAIL] ${ep.url} -> ${res.error || 'HTTP ' + res.status}`);
      pass = false;
    }
  }

  console.log(`\n========================================================`);
  console.log(`=== OVERALL SYSTEM HEALTH: ${pass ? 'ALL PASSED (모든 시스템 정상 작동)' : 'ISSUES DETECTED (확인 필요)'} ===`);
  console.log(`========================================================\n`);
  process.exit(pass ? 0 : 1);
})();
