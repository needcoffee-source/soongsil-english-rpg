const fs = require('fs');

console.log('=== Applying Updates: Correct Answer Damage, Wood Armor Gold, Boss Drops ===');

// 1. data/craft_recipes.json
let recipes = JSON.parse(fs.readFileSync('data/craft_recipes.json', 'utf8'));
recipes.forEach(r => {
  if (r.id === 'recipe_wood_armor') {
    r.requiredGold = 15;
  }
});
fs.writeFileSync('data/craft_recipes.json', JSON.stringify(recipes, null, 2), 'utf8');
console.log('  [OK] craft_recipes.json: recipe_wood_armor requiredGold -> 15');

// 2. public/js/main.js
let mainJs = fs.readFileSync('public/js/main.js', 'utf8');

// Target 1: Golem drop removal of leather sword
const targetGolemDrop = `        const roll = Math.random() * 100;
        if (roll < 25) {
          const woodGears = [
            { item: 'equip_wood_sword', name: '나무검', icon: '🗡️', slot: 'weapon', stats: { atk: 15, def: 0, hp: 0 }, effect: '공격력 +15' },
            { item: 'equip_wood_helmet', name: '나무투구', icon: '🪖', slot: 'helmet', stats: { atk: 0, def: 8, hp: 25 }, effect: '방어력 +8, 체력 +25' },
            { item: 'equip_wood_armor', name: '나무갑옷', icon: '🛡️', slot: 'armor', stats: { atk: 0, def: 15, hp: 15 }, effect: '방어력 +15, 체력 +15' }
          ];
          const chosen = woodGears[Math.floor(Math.random() * woodGears.length)];
          this.addItem(chosen.item, chosen.name, 1, chosen.icon, { type: 'equipment', slot: chosen.slot, stats: chosen.stats, effect: chosen.effect });
          rewardItemsList.push(\`\${chosen.icon} \${chosen.name}\`);
        } else if (roll < 40) { // 15% 가죽손잡이 세이버 대박 완제품 드랍
          this.addItem('equip_leather_sword', '가죽손잡이 세이버', 1, '🗡️', {
            type: 'equipment', slot: 'weapon', stats: { atk: 20, def: 0, hp: 0 }, effect: '공격력 +20 (가죽 손잡이)'
          });
          rewardItemsList.push('🗡️ 가죽손잡이 세이버 (대박!)');
        }`;

const replaceGolemDrop = `        const roll = Math.random() * 100;
        if (roll < 25) {
          const woodGears = [
            { item: 'equip_wood_sword', name: '나무검', icon: '🗡️', slot: 'weapon', stats: { atk: 15, def: 0, hp: 0 }, effect: '공격력 +15' },
            { item: 'equip_wood_helmet', name: '나무투구', icon: '🪖', slot: 'helmet', stats: { atk: 0, def: 8, hp: 25 }, effect: '방어력 +8, 체력 +25' },
            { item: 'equip_wood_armor', name: '나무갑옷', icon: '🛡️', slot: 'armor', stats: { atk: 0, def: 15, hp: 15 }, effect: '방어력 +15, 체력 +15' }
          ];
          const chosen = woodGears[Math.floor(Math.random() * woodGears.length)];
          this.addItem(chosen.item, chosen.name, 1, chosen.icon, { type: 'equipment', slot: chosen.slot, stats: chosen.stats, effect: chosen.effect });
          rewardItemsList.push(\`\${chosen.icon} \${chosen.name}\`);
        }`;

if (!mainJs.includes(targetGolemDrop)) {
  console.error('targetGolemDrop not found in main.js');
  process.exit(1);
}
mainJs = mainJs.replace(targetGolemDrop, replaceGolemDrop);
console.log('  [OK] main.js: Removed leather sword drop from golem');

// Target 2: Bronze dragon drops leather gears instead of bronze gears
const targetDragonDrop = `        const roll = Math.random() * 100;
        if (roll < 20) {
          const bronzeGears = [
            { item: 'equip_bronze_sword', name: '청동검', icon: '⚔️', slot: 'weapon', stats: { atk: 25, def: 0, hp: 0 }, effect: '공격력 +25' },
            { item: 'equip_bronze_helmet', name: '청동투구', icon: '🪖', slot: 'helmet', stats: { atk: 0, def: 14, hp: 35 }, effect: '방어력 +14, 체력 +35' },
            { item: 'equip_bronze_armor', name: '청동갑옷', icon: '🛡️', slot: 'armor', stats: { atk: 0, def: 22, hp: 25 }, effect: '방어력 +22, 체력 +25' }
          ];
          const chosen = bronzeGears[Math.floor(Math.random() * bronzeGears.length)];
          this.addItem(chosen.item, chosen.name, 1, chosen.icon, { type: 'equipment', slot: chosen.slot, stats: chosen.stats, effect: chosen.effect });
          rewardItemsList.push(\`\${chosen.icon} \${chosen.name} (희귀 완제품!)\`);
        }`;

const replaceDragonDrop = `        // 2티어 가죽 장비 완제품 드랍 (20% 확률)
        const roll = Math.random() * 100;
        if (roll < 20) {
          const leatherGears = [
            { item: 'equip_leather_sword', name: '가죽손잡이 세이버', icon: '🗡️', slot: 'weapon', stats: { atk: 20, def: 0, hp: 0 }, effect: '공격력 +20' },
            { item: 'equip_leather_helmet', name: '가죽투구', icon: '⛑️', slot: 'helmet', stats: { atk: 0, def: 12, hp: 28 }, effect: '방어력 +12, 체력 +28' },
            { item: 'equip_leather_armor', name: '가죽갑옷', icon: '🥋', slot: 'armor', stats: { atk: 0, def: 17, hp: 20 }, effect: '방어력 +17, 체력 +20' }
          ];
          const chosen = leatherGears[Math.floor(Math.random() * leatherGears.length)];
          this.addItem(chosen.item, chosen.name, 1, chosen.icon, { type: 'equipment', slot: chosen.slot, stats: chosen.stats, effect: chosen.effect });
          rewardItemsList.push(\`\${chosen.icon} \${chosen.name} (완제품 드랍!)\`);
        }`;

if (!mainJs.includes(targetDragonDrop)) {
  console.error('targetDragonDrop not found in main.js');
  process.exit(1);
}
mainJs = mainJs.replace(targetDragonDrop, replaceDragonDrop);
console.log('  [OK] main.js: Dragon drops leather gears instead of bronze');

// Target 3: Correct answer incoming damage: Math.max(0, bossAtk - this.playerData.def)
const targetCorrectDmg = `      const incomingDmg = this.playerData.isTeacher ? 0 : Math.max(1, bossAtk - this.playerData.def);
      this.playerData.hp = Math.max(0, this.playerData.hp - incomingDmg);
      this.updateBossRaidUI();

      logEl.innerHTML = \`⚔️ 보스에게 <b>-\${myDmg} HP</b> 데미지! / 💥 보스 반격 <b>-\${incomingDmg} HP</b>\`;`;

const replaceCorrectDmg = `      // 정답 시: (보스 공격력 - 나의 방어력)만큼만 피격 (방어력이 높으면 0 피해)
      const incomingDmg = this.playerData.isTeacher ? 0 : Math.max(0, bossAtk - this.playerData.def);
      this.playerData.hp = Math.max(0, this.playerData.hp - incomingDmg);
      this.updateBossRaidUI();

      if (incomingDmg > 0) {
        logEl.innerHTML = \`⚔️ 보스에게 <b>-\${myDmg} HP</b> 데미지! / 💥 보스 반격 <b>-\${incomingDmg} HP</b>\`;
      } else {
        logEl.innerHTML = \`⚔️ 보스에게 <b>-\${myDmg} HP</b> 결정타! / 🛡️ 방어력(\${this.playerData.def})으로 보스 공격 완벽 방어 (피해 0)!\`;
      }`;

if (!mainJs.includes(targetCorrectDmg)) {
  console.error('targetCorrectDmg not found in main.js');
  process.exit(1);
}
mainJs = mainJs.replace(targetCorrectDmg, replaceCorrectDmg);
console.log('  [OK] main.js: Correct answer damage calculation updated (bossAtk - playerDef, min 0)');

fs.writeFileSync('public/js/main.js', mainJs, 'utf8');
console.log('=== Updates complete! ===');
