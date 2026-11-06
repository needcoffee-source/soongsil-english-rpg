const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log('     DEEP CODEBASE COMPREHENSIVE SCAN & AUDIT       ');
console.log('====================================================\n');

let issues = 0;
function warn(msg) {
  issues++;
  console.warn('⚠️  [ISSUE]', msg);
}
function pass(msg) {
  console.log('✅ [PASS]', msg);
}

// ---------------------------------------------------------------------
// 1. DATA DIRECTORY & STUDENTS_PROGRESS.JSON AUDIT
// ---------------------------------------------------------------------
console.log('--- 1. Checking data/ directory & students_progress.json ---');
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  warn('data/ directory does not exist!');
} else {
  const jsonFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  jsonFiles.forEach(f => {
    try {
      const raw = fs.readFileSync(path.join(dataDir, f), 'utf8');
      const parsed = JSON.parse(raw);
      pass(`data/${f} valid JSON (${Array.isArray(parsed) ? parsed.length + ' items' : Object.keys(parsed).length + ' keys'}).`);
    } catch (e) {
      warn(`data/${f} JSON error: ${e.message}`);
    }
  });

  const studentsPath = path.join(dataDir, 'students_progress.json');
  if (fs.existsSync(studentsPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
      pass(`students_progress.json contains ${Object.keys(data).length} student records.`);
    } catch (e) {
      warn(`Failed to parse students_progress.json: ${e.message}`);
    }
  }
}

// ---------------------------------------------------------------------
// 2. WORLD_DATA INTEGRITY AUDIT
// ---------------------------------------------------------------------
console.log('\n--- 2. Checking WORLD_DATA (public/js/world.js) ---');
const worldJs = fs.readFileSync(path.join(__dirname, '../public/js/world.js'), 'utf8');
const worldSandbox = { window: {} };
vm.createContext(worldSandbox);
try {
  vm.runInContext(worldJs, worldSandbox);
  const w = worldSandbox.window.WORLD_DATA;
  pass('WORLD_DATA loaded successfully.');

  // Check unique IDs across all interactive and NPCs
  const idSet = new Map();
  function registerId(id, type, location) {
    if (!id) {
      warn(`Empty ID found for ${type} in ${location}`);
      return;
    }
    if (idSet.has(id)) {
      const prev = idSet.get(id);
      // It's acceptable for staff office door or shared quest item across classrooms if intentional
      if (prev.type === type && (id === 'room_staff_office' || id === 'quest_yosunyu_usb')) {
        // intentional multi-door / duplicate quest item in multiple rooms
      } else {
        warn(`Duplicate ID '${id}' found in ${location} (previously in ${prev.location})`);
      }
    } else {
      idSet.set(id, { type, location });
    }
  }

  // Check floors
  Object.keys(w.floors).forEach(fNum => {
    const f = w.floors[fNum];
    (f.rooms || []).forEach(r => registerId(r.id, 'room', `Floor ${fNum}`));
    (f.interactive || []).forEach(i => registerId(i.id, i.type, `Floor ${fNum}`));
    (f.npcs || []).forEach(n => registerId(n.id, 'npc', `Floor ${fNum}`));
  });

  // Check classrooms
  Object.keys(w).forEach(key => {
    if (key.startsWith('classroom')) {
      const cr = w[key];
      (cr.interactive || []).forEach(i => registerId(i.id, i.type, key));
      (cr.npcs || []).forEach(n => registerId(n.id, 'npc', key));
    }
  });

  pass(`Checked ${idSet.size} unique IDs across rooms, interactives, and NPCs.`);

} catch (err) {
  warn(`WORLD_DATA evaluation error: ${err.message}`);
}

// ---------------------------------------------------------------------
// 3. SERVER.JS ROUTE & EVENT INTEGRITY
// ---------------------------------------------------------------------
console.log('\n--- 3. Checking server.js Routes & Socket.io Handlers ---');
const serverJs = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');

// Check Express routes
const routes = [];
const routeRegex = /app\.(get|post|put|delete)\(['"]([^'"]+)['"]/g;
let rm;
while ((rm = routeRegex.exec(serverJs)) !== null) {
  routes.push(`${rm[1].toUpperCase()} ${rm[2]}`);
}
pass(`Found ${routes.length} Express HTTP endpoints in server.js.`);

// Check Socket.io on(...) handlers in server.js
const serverSocketEvents = new Set();
const srvSockRegex = /socket\.on\(['"]([^'"]+)['"]/g;
while ((rm = srvSockRegex.exec(serverJs)) !== null) {
  serverSocketEvents.add(rm[1]);
}
pass(`Found ${serverSocketEvents.size} socket.on events in server.js.`);

// Check client socket emits in main.js & network.js
const clientSocketEmits = new Set();
['main.js', 'network.js', 'brawl_ball.js'].forEach(fn => {
  const code = fs.readFileSync(path.join(__dirname, '../public/js/' + fn), 'utf8');
  const emitRegex = /(?:socket|this\.socket)\.emit\(['"]([^'"]+)['"]/g;
  while ((rm = emitRegex.exec(code)) !== null) {
    clientSocketEmits.add(rm[1]);
  }
});
pass(`Found ${clientSocketEmits.size} socket.emit events in client code.`);

// Verify client emits have corresponding server listeners
clientSocketEmits.forEach(evt => {
  // socket.io internal events like 'disconnect' can be skipped
  if (!serverSocketEvents.has(evt)) {
    warn(`Client emits '${evt}' but server has no socket.on('${evt}') handler!`);
  }
});
pass('Cross-checked client socket.emit vs server socket.on listeners.');

// ---------------------------------------------------------------------
// 4. STYLE.CSS BRACE INTEGRITY
// ---------------------------------------------------------------------
console.log('\n--- 4. Checking public/css/style.css Syntax ---');
const styleCss = fs.readFileSync(path.join(__dirname, '../public/css/style.css'), 'utf8');
let openBraces = 0;
let closeBraces = 0;
for (let i = 0; i < styleCss.length; i++) {
  if (styleCss[i] === '{') openBraces++;
  if (styleCss[i] === '}') closeBraces++;
}
if (openBraces !== closeBraces) {
  warn(`style.css brace mismatch! { = ${openBraces}, } = ${closeBraces}`);
} else {
  pass(`style.css balanced: ${openBraces} open/close braces.`);
}

// ---------------------------------------------------------------------
// 5. CACHE BUSTER CONSISTENCY
// ---------------------------------------------------------------------
console.log('\n--- 5. Checking Cache Buster Consistency ---');
const indexHtml = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
const cacheTagRegex = /(?:src|href)=["'][^"']+\?v=(\d+)["']/g;
const versionCounts = {};
while ((rm = cacheTagRegex.exec(indexHtml)) !== null) {
  const v = rm[1];
  versionCounts[v] = (versionCounts[v] || 0) + 1;
}
console.log('Cache versions in index.html:', versionCounts);
const versions = Object.keys(versionCounts);
if (versions.length > 1) {
  warn(`Multiple cache versions found in index.html: ${JSON.stringify(versionCounts)}`);
} else {
  pass(`Unified cache version v=${versions[0]} across all ${versionCounts[versions[0]]} assets in index.html.`);
}

// ---------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------
console.log('\n====================================================');
if (issues === 0) {
  console.log('🎉 AUDIT COMPLETE: 0 ISSUES DETECTED! ALL SYSTEMS HEALTHY!');
} else {
  console.log(`⚠️ AUDIT COMPLETE: ${issues} POTENTIAL ISSUES FOUND.`);
}
console.log('====================================================');
