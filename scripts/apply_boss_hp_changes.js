const fs = require('fs');

console.log('=== Applying Boss HP Updates: Golem 2000, Dragon 5000 ===');

// 1. server.js
let serverJs = fs.readFileSync('server.js', 'utf8');
const targetServerBoss = `let bossRaidEvent = {
  active: false,
  name: '👾 고목 골렘',
  level: 10,
  mode: 'coop',       // 'coop' (협동 공유 체력) or 'solo' (개인별 레이드)
  unitFilter: 'ALL',  // 'ALL', 'L1', 'L2', 'L3', 'L4'
  maxHp: 3000,
  currentHp: 3000,
  atk: 18,
  def: 5,
  rewardGold: 100,
  rewardExp: 200,
  participants: {}
};`;

const replaceServerBoss = `let bossRaidEvent = {
  active: false,
  name: '👾 가죽 골렘',
  level: 10,
  mode: 'coop',       // 'coop' (협동 공유 체력) or 'solo' (개인별 레이드)
  unitFilter: 'ALL',  // 'ALL', 'L1', 'L2', 'L3', 'L4'
  maxHp: 2000,
  currentHp: 2000,
  atk: 17,
  def: 8,
  rewardGold: 50,
  rewardExp: 100,
  participants: {}
};`;

if (!serverJs.includes(targetServerBoss)) {
  console.error('targetServerBoss not found in server.js');
  process.exit(1);
}
serverJs = serverJs.replace(targetServerBoss, replaceServerBoss);
fs.writeFileSync('server.js', serverJs, 'utf8');
console.log('  [OK] server.js updated');

// 2. public/js/world.js
let worldJs = fs.readFileSync('public/js/world.js', 'utf8');
worldJs = worldJs.replace(
  `      level: 10,\n      maxHp: 1500,\n      atk: 17,`,
  `      level: 10,\n      maxHp: 2000,\n      atk: 17,`
);
fs.writeFileSync('public/js/world.js', worldJs, 'utf8');
console.log('  [OK] public/js/world.js updated');

// 3. public/js/main.js
let mainJs = fs.readFileSync('public/js/main.js', 'utf8');
const targetMainConfig = `window.BOSS_CONFIG = {
  active: false,
  name: '👾 가죽 골렘',
  level: 10,
  mode: 'coop',
  unitFilter: 'ALL',
  maxHp: 3000,
  currentHp: 3000,
  atk: 18,
  def: 5,
  rewardGold: 100,
  rewardExp: 200
};`;

const replaceMainConfig = `window.BOSS_CONFIG = {
  active: false,
  name: '👾 가죽 골렘',
  level: 10,
  mode: 'coop',
  unitFilter: 'ALL',
  maxHp: 2000,
  currentHp: 2000,
  atk: 17,
  def: 8,
  rewardGold: 50,
  rewardExp: 100
};`;

if (!mainJs.includes(targetMainConfig)) {
  console.error('targetMainConfig not found in main.js');
  process.exit(1);
}
mainJs = mainJs.replace(targetMainConfig, replaceMainConfig);

mainJs = mainJs.replace(
  `        if (val === 'golem') {
          nameEl.value = '👾 가죽 골렘';
          hpEl.value = 1500;`,
  `        if (val === 'golem') {
          nameEl.value = '👾 가죽 골렘';
          hpEl.value = 2000;`
);

mainJs = mainJs.replace(
  `        } else if (val === 'dragon') {
          nameEl.value = '🐉 숭실 청동 드래곤';
          hpEl.value = 4000;`,
  `        } else if (val === 'dragon') {
          nameEl.value = '🐉 숭실 청동 드래곤';
          hpEl.value = 5000;`
);

fs.writeFileSync('public/js/main.js', mainJs, 'utf8');
console.log('  [OK] public/js/main.js updated');

// 4. public/index.html
let html = fs.readFileSync('public/index.html', 'utf8');
html = html.replace(
  `<option value="golem">👾 가죽 골렘 (1학년 2반 1차 · 10인 권장 · HP 1500 / ATK 17 / DEF 8)</option>
                  <option value="dragon">🐉 숭실 청동 드래곤 (1학년 2반 2차 · 20인 권장 · HP 4000 / ATK 28 / DEF 10)</option>`,
  `<option value="golem">👾 가죽 골렘 (1학년 2반 1차 · 10인 권장 · HP 2000 / ATK 17 / DEF 8)</option>
                  <option value="dragon">🐉 숭실 청동 드래곤 (1학년 2반 2차 · 20인 권장 · HP 5000 / ATK 28 / DEF 10)</option>`
);

html = html.replace(
  `<input type="number" id="admin-boss-hp" value="1500" min="50" max="999999" step="100">`,
  `<input type="number" id="admin-boss-hp" value="2000" min="50" max="999999" step="100">`
);

html = html.replace(
  `<input type="number" id="admin-boss-gold" value="100" min="0" max="100000">`,
  `<input type="number" id="admin-boss-gold" value="50" min="0" max="100000">`
);

html = html.replace(
  `<input type="number" id="admin-boss-exp" value="200" min="0" max="100000">`,
  `<input type="number" id="admin-boss-exp" value="100" min="0" max="100000">`
);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('  [OK] public/index.html updated');

// 5. scripts/generate_item_excel.js
let excelGen = fs.readFileSync('scripts/generate_item_excel.js', 'utf8');
excelGen = excelGen.replace(
  `'HP 1500 / ATK 17 / DEF 8'`,
  `'HP 2000 / ATK 17 / DEF 8'`
);
excelGen = excelGen.replace(
  `'HP 4000 / ATK 28 / DEF 10'`,
  `'HP 5000 / ATK 28 / DEF 10'`
);
fs.writeFileSync('scripts/generate_item_excel.js', excelGen, 'utf8');
console.log('  [OK] scripts/generate_item_excel.js updated');

console.log('=== All files updated successfully! ===');
