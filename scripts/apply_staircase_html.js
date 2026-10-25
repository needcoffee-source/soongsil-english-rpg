const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Update admin boss preset
const targetBossPreset = `<select id="admin-boss-preset">
                  <option value="golem">👾 고목 골렘 (1학년 2반 · 10인 권장 · HP 1500 / ATK 17 / DEF 8)</option>
                  <option value="dragon">🐉 숭실 골드 드래곤 (중앙 엘리베이터 · 20인 권장 · HP 4000 / ATK 28 / DEF 10)</option>`;

const replaceBossPreset = `<select id="admin-boss-preset">
                  <option value="golem">👾 가죽 골렘 (1학년 2반 1차 · 10인 권장 · HP 1500 / ATK 17 / DEF 8)</option>
                  <option value="dragon">🐉 숭실 청동 드래곤 (1학년 2반 2차 · 20인 권장 · HP 4000 / ATK 28 / DEF 10)</option>`;

if (!html.includes(targetBossPreset)) {
  console.error('targetBossPreset not found in index.html');
  process.exit(1);
}
html = html.replace(targetBossPreset, replaceBossPreset);

// Update initial boss name input
const targetBossName = `<input type="text" id="admin-boss-name" value="👾 고목 골렘">`;
const replaceBossName = `<input type="text" id="admin-boss-name" value="👾 가죽 골렘">`;
if (html.includes(targetBossName)) {
  html = html.replace(targetBossName, replaceBossName);
}

// 2. Update popup reward item select
const targetPopReward = `<option value="item_golem_core">🟢 고목의 핵 (희귀 재료)</option>
                      <option value="item_dragon_heart">❤️‍🔥 용의 심장 (최상위 재료)</option>`;

const replacePopReward = `<option value="item_boss_leather">🟫 질긴 보스의 가죽 (가죽 골렘 전리품)</option>
                      <option value="item_bronze_heart">🥉 청동 드래곤의 심장 (청동 드래곤 전리품)</option>
                      <option value="equip_leather_sword">🗡️ 가죽손잡이 세이버 (공격력 +20)</option>
                      <option value="item_golem_core">🟢 고목의 핵 (희귀 재료)</option>
                      <option value="item_dragon_heart">❤️‍🔥 용의 심장 (최상위 재료)</option>`;

if (!html.includes(targetPopReward)) {
  console.error('targetPopReward not found in index.html');
  process.exit(1);
}
html = html.replace(targetPopReward, replacePopReward);

// 3. Update admin giveaway item select
const targetGrantBossItems = `<optgroup label="🟢 보스 전리품 (상위 제작 재료)">
                    <option value="item_golem_core">🟢 고목의 핵 (골렘 전리품)</option>
                    <option value="item_dragon_heart">❤️‍🔥 용의 심장 (드래곤 전리품)</option>
                  </optgroup>`;

const replaceGrantBossItems = `<optgroup label="🟢 보스 전리품 (상위 제작 재료)">
                    <option value="item_boss_leather">🟫 질긴 보스의 가죽 (가죽 골렘 전리품)</option>
                    <option value="item_bronze_heart">🥉 청동 드래곤의 심장 (청동 드래곤 전리품)</option>
                    <option value="item_golem_core">🟢 고목의 핵 (골렘 전리품)</option>
                    <option value="item_dragon_heart">❤️‍🔥 용의 심장 (드래곤 전리품)</option>
                  </optgroup>`;

if (!html.includes(targetGrantBossItems)) {
  console.error('targetGrantBossItems not found in index.html');
  process.exit(1);
}
html = html.replace(targetGrantBossItems, replaceGrantBossItems);

// 4. Update admin giveaway leather group
const targetLeatherGroup = `<optgroup label="🥋 스포츠 가죽 장비 (농구장 & 풋살장)">
                    <option value="item_basketball_leather">🏀 농구공 가죽 조각 (재료)</option>
                    <option value="item_futsal_leather">⚽ 탄력있는 풋살공 가죽 (재료)</option>
                    <option value="equip_leather_helmet">⛑️ 가죽투구 (DEF +12, HP +28)</option>
                    <option value="equip_leather_armor">🥋 가죽갑옷 (DEF +17, HP +25)</option>
                  </optgroup>`;

const replaceLeatherGroup = `<optgroup label="🥋 스포츠 가죽 장비 (농구장 & 풋살장)">
                    <option value="item_basketball_leather">🏀 농구공 가죽 조각 (재료)</option>
                    <option value="item_futsal_leather">⚽ 탄력있는 풋살공 가죽 (재료)</option>
                    <option value="equip_leather_sword">🗡️ 가죽손잡이 세이버 (ATK +20)</option>
                    <option value="equip_leather_helmet">⛑️ 가죽투구 (DEF +12, HP +28)</option>
                    <option value="equip_leather_armor">🥋 가죽갑옷 (DEF +17, HP +25)</option>
                  </optgroup>`;

if (!html.includes(targetLeatherGroup)) {
  console.error('targetLeatherGroup not found in index.html');
  process.exit(1);
}
html = html.replace(targetLeatherGroup, replaceLeatherGroup);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('index.html successfully updated!');
