const fs = require('fs');

console.log('=== Applying User Requested Balance Updates ===');

// 1. server.js
let serverJs = fs.readFileSync('server.js', 'utf8');

serverJs = serverJs.replace(
  `'equip_wood_armor': { name: '나무갑옷', icon: '🛡️', meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 15, hp: 50 }, effect: '방어력 +15, 체력 +50' } },`,
  `'equip_wood_armor': { name: '나무갑옷', icon: '🛡️', meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 15, hp: 15 }, effect: '방어력 +15, 체력 +15' } },`
);

serverJs = serverJs.replace(
  `'equip_leather_armor': { name: '가죽갑옷', icon: '🥋', meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 17, hp: 25 }, effect: '방어력 +17, 체력 +25' } },`,
  `'equip_leather_armor': { name: '가죽갑옷', icon: '🥋', meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 17, hp: 20 }, effect: '방어력 +17, 체력 +20' } },`
);

serverJs = serverJs.replace(
  `'equip_bronze_armor': { name: '청동갑옷', icon: '🛡️', meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 22, hp: 70 }, effect: '방어력 +22, 체력 +70' } },`,
  `'equip_bronze_armor': { name: '청동갑옷', icon: '🛡️', meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 22, hp: 25 }, effect: '방어력 +22, 체력 +25' } },`
);

fs.writeFileSync('server.js', serverJs, 'utf8');
console.log('  [OK] server.js updated');

// 2. public/js/main.js
let mainJs = fs.readFileSync('public/js/main.js', 'utf8');

mainJs = mainJs.replace(
  `'equip_wood_armor': { name: '나무갑옷', icon: '🛡️', count: 9999, meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 15, hp: 10 }, effect: '방어력 +15, 체력 +10' } },`,
  `'equip_wood_armor': { name: '나무갑옷', icon: '🛡️', count: 9999, meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 15, hp: 15 }, effect: '방어력 +15, 체력 +15' } },`
);

mainJs = mainJs.replace(
  `'equip_leather_armor': { name: '가죽갑옷', icon: '🥋', count: 9999, meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 17, hp: 25 }, effect: '방어력 +17, 체력 +25' } },`,
  `'equip_leather_armor': { name: '가죽갑옷', icon: '🥋', count: 9999, meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 17, hp: 20 }, effect: '방어력 +17, 체력 +20' } },`
);

mainJs = mainJs.replace(
  `'equip_bronze_armor': { name: '청동갑옷', icon: '🛡️', count: 9999, meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 22, hp: 70 }, effect: '방어력 +22, 체력 +70' } },`,
  `'equip_bronze_armor': { name: '청동갑옷', icon: '🛡️', count: 9999, meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 22, hp: 25 }, effect: '방어력 +22, 체력 +25' } },`
);

// puppy gift armor
mainJs = mainJs.replace(
  `meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 15, hp: 10 }, effect: '방어력 +15, 체력 +10' }`,
  `meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 15, hp: 15 }, effect: '방어력 +15, 체력 +15' }`
);

// onBossRaidCleared - 가죽 골렘 1~2개 가변 드랍 & 나무갑옷 스펙
const targetGolemDropBlock = `        // 확정 재료 드랍 (2티어 가죽 장비 제작 핵심)
        this.addItem('item_boss_leather', '질긴 보스의 가죽', 1, '🟫', { type: 'material', effect: '2티어 가죽 장비 핵심 제작 재료' });
        rewardItemsList.push('🟫 질긴 보스의 가죽');

        const roll = Math.random() * 100;
        if (roll < 25) {
          const woodGears = [
            { item: 'equip_wood_sword', name: '나무검', icon: '🗡️', slot: 'weapon', stats: { atk: 15, def: 0, hp: 0 }, effect: '공격력 +15' },
            { item: 'equip_wood_helmet', name: '나무투구', icon: '🪖', slot: 'helmet', stats: { atk: 0, def: 8, hp: 25 }, effect: '방어력 +8, 체력 +25' },
            { item: 'equip_wood_armor', name: '나무갑옷', icon: '🛡️', slot: 'armor', stats: { atk: 0, def: 15, hp: 10 }, effect: '방어력 +15, 체력 +10' }
          ];`;

const replaceGolemDropBlock = `        // 확정 재료 가변 드랍 (1~2개 가죽 장비 제작 핵심)
        const bossLeatherCount = Math.floor(Math.random() * 2) + 1; // 1 or 2개 가변
        this.addItem('item_boss_leather', '질긴 보스의 가죽', bossLeatherCount, '🟫', { type: 'material', effect: '2티어 가죽 장비 핵심 제작 재료' });
        rewardItemsList.push(\`🟫 질긴 보스의 가죽 x\${bossLeatherCount}\`);

        const roll = Math.random() * 100;
        if (roll < 25) {
          const woodGears = [
            { item: 'equip_wood_sword', name: '나무검', icon: '🗡️', slot: 'weapon', stats: { atk: 15, def: 0, hp: 0 }, effect: '공격력 +15' },
            { item: 'equip_wood_helmet', name: '나무투구', icon: '🪖', slot: 'helmet', stats: { atk: 0, def: 8, hp: 25 }, effect: '방어력 +8, 체력 +25' },
            { item: 'equip_wood_armor', name: '나무갑옷', icon: '🛡️', slot: 'armor', stats: { atk: 0, def: 15, hp: 15 }, effect: '방어력 +15, 체력 +15' }
          ];`;

if (!mainJs.includes(targetGolemDropBlock)) {
  console.error('targetGolemDropBlock not found in main.js');
  process.exit(1);
}
mainJs = mainJs.replace(targetGolemDropBlock, replaceGolemDropBlock);

// onBossRaidCleared - 청동 드래곤 청동갑옷 스펙
mainJs = mainJs.replace(
  `{ item: 'equip_bronze_armor', name: '청동갑옷', icon: '🛡️', slot: 'armor', stats: { atk: 0, def: 22, hp: 70 }, effect: '방어력 +22, 체력 +70' }`,
  `{ item: 'equip_bronze_armor', name: '청동갑옷', icon: '🛡️', slot: 'armor', stats: { atk: 0, def: 22, hp: 25 }, effect: '방어력 +22, 체력 +25' }`
);

// solo defeat in handleBossAttack
const targetSoloGolemDefeat = `          if (bName.includes('골렘') || bName.includes('golem')) {
            this.playerData.hasClearedFirstBoss = true;
            const studentId = this.playerData.studentId || '';
            if (studentId) {
              localStorage.setItem('soongsil_first_boss_cleared_' + studentId, 'true');
            }
            localStorage.setItem('soongsil_first_boss_cleared_global', 'true');
            this.addItem('item_boss_leather', '질긴 보스의 가죽', 1, '🟫', { type: 'material', effect: '2티어 가죽 장비 핵심 제작 재료' });
            clearNotice = '\\n\\n🎉 중앙 엘리베이터 점검이 완료되었습니다! 이제 엘리베이터를 타고 지상 운동장으로 이동할 수 있습니다!\\n📦 획득: [🟫 질긴 보스의 가죽]';
            this.saveProgress();
          }`;

const replaceSoloGolemDefeat = `          if (bName.includes('골렘') || bName.includes('golem')) {
            this.playerData.hasClearedFirstBoss = true;
            const studentId = this.playerData.studentId || '';
            if (studentId) {
              localStorage.setItem('soongsil_first_boss_cleared_' + studentId, 'true');
            }
            localStorage.setItem('soongsil_first_boss_cleared_global', 'true');
            const bossLeatherCount = Math.floor(Math.random() * 2) + 1; // 1 or 2개 가변
            this.addItem('item_boss_leather', '질긴 보스의 가죽', bossLeatherCount, '🟫', { type: 'material', effect: '2티어 가죽 장비 핵심 제작 재료' });
            clearNotice = \`\\n\\n🎉 중앙 엘리베이터 점검이 완료되었습니다! 이제 엘리베이터를 타고 지상 운동장으로 이동할 수 있습니다!\\n📦 획득: [🟫 질긴 보스의 가죽 x\${bossLeatherCount}개]\`;
            this.saveProgress();
          }`;

if (!mainJs.includes(targetSoloGolemDefeat)) {
  console.error('targetSoloGolemDefeat not found in main.js');
  process.exit(1);
}
mainJs = mainJs.replace(targetSoloGolemDefeat, replaceSoloGolemDefeat);

// field battle drop for leather armor (line 2253)
mainJs = mainJs.replace(
  `stats: { atk: 0, def: 17, hp: 25 },
          effect: '방어력 +17, 체력 +25'`,
  `stats: { atk: 0, def: 17, hp: 20 },
          effect: '방어력 +17, 체력 +20'`
);

fs.writeFileSync('public/js/main.js', mainJs, 'utf8');
console.log('  [OK] public/js/main.js updated');

// 3. public/js/quiz.js
let quizJs = fs.readFileSync('public/js/quiz.js', 'utf8');
quizJs = quizJs.replace(
  `gather_wood: 20, // +5% 상향`,
  `gather_wood: 35, // 35%로 대폭 상향!`
);
fs.writeFileSync('public/js/quiz.js', quizJs, 'utf8');
console.log('  [OK] public/js/quiz.js updated (wood drop rate -> 35%)');

// 4. data/craft_recipes.json
let recipes = JSON.parse(fs.readFileSync('data/craft_recipes.json', 'utf8'));

recipes.forEach(r => {
  // 나무갑옷: DEF +15, HP +15
  if (r.id === 'recipe_wood_armor') {
    r.result.stats = { atk: 0, def: 15, hp: 15 };
    r.result.effect = '방어력(DEF) +15, 최대체력(HP) +15';
  }

  // 가죽갑옷: DEF +17, HP +20
  if (r.id === 'recipe_leather_armor') {
    r.result.stats = { atk: 0, def: 17, hp: 20 };
    r.result.effect = '방어력(DEF) +17, 최대체력(HP) +20';
  }

  // 가죽손잡이 세이버: 보스가죽 1, 농구가죽 10, 풋살가죽 10
  if (r.id === 'recipe_leather_sword') {
    r.requiredItems = [
      { item: 'item_boss_leather', name: '질긴 보스의 가죽', count: 1 },
      { item: 'item_basketball_leather', name: '농구공 가죽 조각', count: 10 },
      { item: 'item_futsal_leather', name: '탄력있는 풋살공 가죽', count: 10 }
    ];
    r.description = '[2티어 무기] 질긴 보스의 가죽과 농구공·풋살공 가죽을 배합해 튼튼하게 감아쥔 2티어 가죽손잡이 세이버입니다.';
  }

  // 청동갑옷: 개나리꽃잎 요구량 15개로 하향, DEF +22, HP +25
  if (r.id === 'recipe_bronze_armor') {
    r.requiredItems = [
      { item: 'item_bronze_heart', name: '청동 드래곤의 심장', count: 1 },
      { item: 'item_forsythia', name: '노란 개나리 꽃잎', count: 15 }
    ];
    r.result.stats = { atk: 0, def: 22, hp: 25 };
    r.result.effect = '방어력(DEF) +22, 최대체력(HP) +25';
  }

  // 청동검: 목재 대신 개나리꽃잎 20개
  if (r.id === 'recipe_bronze_sword') {
    r.requiredItems = [
      { item: 'item_bronze_heart', name: '청동 드래곤의 심장', count: 1 },
      { item: 'item_forsythia', name: '노란 개나리 꽃잎', count: 20 }
    ];
    r.description = '[무기] 청동 드래곤의 심장과 노란 개나리 꽃잎으로 벼려낸 최상급 청동검입니다.';
  }

  // 개나리반지: 개나리꽃잎 20개로 상향
  if (r.id === 'recipe_forsythia_ring') {
    r.requiredItems = [
      { item: 'item_forsythia', name: '노란 개나리 꽃잎', count: 20 }
    ];
  }
});

fs.writeFileSync('data/craft_recipes.json', JSON.stringify(recipes, null, 2), 'utf8');
console.log('  [OK] data/craft_recipes.json updated');

// 5. public/index.html
let html = fs.readFileSync('public/index.html', 'utf8');

html = html.replace(
  `방어 +15 · HP +10`,
  `방어 +15 · HP +15`
);

html = html.replace(
  `<option value="equip_leather_armor">🥋 가죽갑옷 (DEF +17, HP +25)</option>`,
  `<option value="equip_leather_armor">🥋 가죽갑옷 (DEF +17, HP +20)</option>`
);

html = html.replace(
  `<option value="equip_wood_armor">🛡️ 나무갑옷 (DEF +15, HP +50)</option>`,
  `<option value="equip_wood_armor">🛡️ 나무갑옷 (DEF +15, HP +15)</option>`
);

html = html.replace(
  `<option value="equip_bronze_armor">🛡️ 청동갑옷 (DEF +22, HP +70)</option>`,
  `<option value="equip_bronze_armor">🛡️ 청동갑옷 (DEF +22, HP +25)</option>`
);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('  [OK] public/index.html updated');

console.log('=== All files updated successfully! ===');
