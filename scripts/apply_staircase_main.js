const fs = require('fs');

// 1. Update main.js
let mainJs = fs.readFileSync('public/js/main.js', 'utf8');

// Target 1: 이상대 선생님 dialogue in handleInteraction
const targetTeacherSangdae = `      // 1학년 복도 담임 이상대 선생님 (중앙 엘리베이터 안내 NPC)
      if (npc.id === 'npc_teacher_sangdae' || (npc.name && npc.name.includes('이상대'))) {
        if (!this.isDragonCleared()) {
          alert(\`💬 [이상대 선생님]\\n\\n"안녕! 1학년 1반 담임 이상대 선생님이다. 👨‍🏫\\n\\n⚠️ 지금은 중앙 엘리베이터가 고장나서 [점검 중]이라 지상 운동장으로 내려갈 수 없단다!\\n\\n1학년 2반 교실로 들어가 전설의 보스 [숭실 골드 드래곤]을 먼저 토벌해야 비로소 엘리베이터가 정상 가동될 게다.\\n\\n어서 2반 앞의 한강우 선생님을 찾아가 보스 레이드를 준비해보렴!"\`);
          return;
        } else {
          alert(\`💬 [이상대 선생님]\\n\\n"안녕! 1학년 1반 담임 이상대 선생님이다. 👨‍🏫\\n\\n🎉 오오! 전설의 골드 드래곤을 멋지게 토벌했구나! 대단하다! 👏\\n덕분에 고장났던 중앙 엘리베이터 점검이 모두 완료되었단다.\\n\\n⚠️ [엘리베이터 이용 및 운동장 경고]\\n이 중앙 엘리베이터를 타고 지상 운동장으로 내려가려면 통행료 50G(골드)가 소모된단다.\\n\\n또한 아래 운동장은 아주 넓고 거친 몬스터들이 있으니, 장비와 물약을 단단히 준비하지 않고 내려갔다가는 큰 코 다칠 게다!\\n\\n골드가 충분히 모이고 모든 준비를 마쳤다면 엘리베이터 앞에서 SPACE를 눌러보렴."\`);
          return;
        }
      }`;

const replaceTeacherSangdae = `      // 1학년 복도 담임 이상대 선생님 (중앙 엘리베이터 안내 NPC)
      if (npc.id === 'npc_teacher_sangdae' || (npc.name && npc.name.includes('이상대'))) {
        if (!this.isElevatorUnlocked()) {
          alert(\`💬 [이상대 선생님]\\n\\n"안녕! 1학년 1반 담임 이상대 선생님이다. 👨‍🏫\\n\\n⚠️ 지금은 중앙 엘리베이터가 고장나서 [점검 중]이라 지상 운동장으로 내려갈 수 없단다!\\n\\n1학년 2반 교실로 들어가 1차 관문 보스 [👾 가죽 골렘]을 먼저 토벌해야 비로소 엘리베이터 점검이 완료되어 운동장으로 내려갈 수 있단다.\\n\\n어서 2반 앞의 한강우 선생님을 찾아가 가죽 골렘 레이드를 준비해보렴!"\`);
          return;
        } else {
          alert(\`💬 [이상대 선생님]\\n\\n"안녕! 1학년 1반 담임 이상대 선생님이다. 👨‍🏫\\n\\n🎉 오오! 1차 관문 보스 [가죽 골렘]을 멋지게 토벌했구나! 대단하다! 👏\\n덕분에 고장났던 중앙 엘리베이터 점검이 모두 완료되었단다.\\n\\n⚠️ [엘리베이터 이용 및 운동장 경고]\\n이 중앙 엘리베이터를 타고 지상 운동장으로 내려가려면 통행료 50G(골드)가 소모된단다.\\n\\n운동장 농구장과 풋살장에서 거친 몬스터들을 물리쳐 농구가죽과 풋살가죽을 모으면 2티어 가죽 장비를 제작할 수 있단다!\\n\\n골드가 충분히 모이고 모든 준비를 마쳤다면 엘리베이터 앞에서 SPACE를 눌러보렴."\`);
          return;
        }
      }`;

if (!mainJs.includes(targetTeacherSangdae)) {
  console.error('targetTeacherSangdae not found in main.js');
  process.exit(1);
}
mainJs = mainJs.replace(targetTeacherSangdae, replaceTeacherSangdae);

// Target 2: isDragonCleared() -> isElevatorUnlocked() and isDragonCleared()
const targetIsDragonCleared = `  isDragonCleared() {
    if (this.playerData.hasClearedDragonRaid) return true;
    const studentId = this.playerData.studentId || '';
    if (studentId && localStorage.getItem('soongsil_dragon_cleared_' + studentId) === 'true') return true;
    if (localStorage.getItem('soongsil_dragon_cleared_global') === 'true') return true;
    return false;
  }`;

const replaceIsElevatorUnlocked = `  isElevatorUnlocked() {
    if (this.playerData.hasClearedFirstBoss || this.playerData.hasClearedDragonRaid) return true;
    const studentId = this.playerData.studentId || '';
    if (studentId && (localStorage.getItem('soongsil_first_boss_cleared_' + studentId) === 'true' || localStorage.getItem('soongsil_dragon_cleared_' + studentId) === 'true')) return true;
    if (localStorage.getItem('soongsil_first_boss_cleared_global') === 'true' || localStorage.getItem('soongsil_dragon_cleared_global') === 'true') return true;
    return false;
  }

  isDragonCleared() {
    return this.isElevatorUnlocked();
  }`;

if (!mainJs.includes(targetIsDragonCleared)) {
  console.error('targetIsDragonCleared not found in main.js');
  process.exit(1);
}
mainJs = mainJs.replace(targetIsDragonCleared, replaceIsElevatorUnlocked);

// Target 3: handleElevatorInteraction check
const targetElevatorCheck = `      // 1. 드래곤 레이드 클리어 여부 검사 (토벌 전까지는 점검 중)
      if (!this.isDragonCleared()) {
        alert(
          '⚠️ [엘리베이터 점검 중]\\n\\n"현재 중앙 엘리베이터는 [점검 중]이라 탑승할 수 없습니다!\\n\\n1학년 2반 교실로 들어가 전설의 보스 [숭실 골드 드래곤]을 먼저 토벌해야 엘리베이터 점검이 완료되어 운동장으로 내려갈 수 있습니다!"'
        );
        return;
      }`;

const replaceElevatorCheck = `      // 1. 1차 관문 보스(가죽 골렘) 토벌 여부 검사 (토벌 전까지는 점검 중)
      if (!this.isElevatorUnlocked()) {
        alert(
          '⚠️ [엘리베이터 점검 중]\\n\\n"현재 중앙 엘리베이터는 [점검 중]이라 탑승할 수 없습니다!\\n\\n1학년 2반 교실로 들어가 1차 관문 보스 [👾 가죽 골렘]을 먼저 토벌해야 엘리베이터 점검이 완료되어 운동장으로 내려갈 수 있습니다!"'
        );
        return;
      }`;

if (!mainJs.includes(targetElevatorCheck)) {
  console.error('targetElevatorCheck not found in main.js');
  process.exit(1);
}
mainJs = mainJs.replace(targetElevatorCheck, replaceElevatorCheck);

// Target 4: LocalStorage loading in login
const targetStorageLoad = `          this.playerData.hasClearedDragonRaid = !!(saved.hasClearedDragonRaid || (studentId && localStorage.getItem('soongsil_dragon_cleared_' + studentId) === 'true') || localStorage.getItem('soongsil_dragon_cleared_global') === 'true');
          console.log(\`[Storage] 학생(\${studentId}) 누적 영구 데이터 복구 완료: Lv.\${this.playerData.level}, \${this.playerData.gold}G, 인벤토리 \${this.playerData.inventory.length}종\`);
        } else {
          this.playerData.hasReceivedSoongsilGift = (studentId && localStorage.getItem('soongsil_gift_' + studentId) === 'true');
          this.playerData.hasOpenedSecretLocker = (studentId && localStorage.getItem('soongsil_secret_locker_' + studentId) === 'true');
          this.playerData.hasClearedDragonRaid = !!((studentId && localStorage.getItem('soongsil_dragon_cleared_' + studentId) === 'true') || localStorage.getItem('soongsil_dragon_cleared_global') === 'true');
        }`;

const replaceStorageLoad = `          this.playerData.hasClearedFirstBoss = !!(saved.hasClearedFirstBoss || (studentId && localStorage.getItem('soongsil_first_boss_cleared_' + studentId) === 'true') || localStorage.getItem('soongsil_first_boss_cleared_global') === 'true');
          this.playerData.hasClearedDragonRaid = !!(saved.hasClearedDragonRaid || (studentId && localStorage.getItem('soongsil_dragon_cleared_' + studentId) === 'true') || localStorage.getItem('soongsil_dragon_cleared_global') === 'true');
          console.log(\`[Storage] 학생(\${studentId}) 누적 영구 데이터 복구 완료: Lv.\${this.playerData.level}, \${this.playerData.gold}G, 인벤토리 \${this.playerData.inventory.length}종\`);
        } else {
          this.playerData.hasReceivedSoongsilGift = (studentId && localStorage.getItem('soongsil_gift_' + studentId) === 'true');
          this.playerData.hasOpenedSecretLocker = (studentId && localStorage.getItem('soongsil_secret_locker_' + studentId) === 'true');
          this.playerData.hasClearedFirstBoss = !!((studentId && localStorage.getItem('soongsil_first_boss_cleared_' + studentId) === 'true') || localStorage.getItem('soongsil_first_boss_cleared_global') === 'true');
          this.playerData.hasClearedDragonRaid = !!((studentId && localStorage.getItem('soongsil_dragon_cleared_' + studentId) === 'true') || localStorage.getItem('soongsil_dragon_cleared_global') === 'true');
        }`;

if (!mainJs.includes(targetStorageLoad)) {
  console.error('targetStorageLoad not found in main.js');
  process.exit(1);
}
mainJs = mainJs.replace(targetStorageLoad, replaceStorageLoad);

// Target 5: onBossRaidCleared boss logic
const targetRaidCleared = `    window.BOSS_CONFIG.active = false;
    const bName = data.bossName || window.BOSS_CONFIG.name || '';
    if (bName.includes('드래곤') || bName.includes('dragon')) {
      localStorage.setItem('soongsil_dragon_cleared_global', 'true');
    }`;

const replaceRaidCleared = `    window.BOSS_CONFIG.active = false;
    const bName = data.bossName || window.BOSS_CONFIG.name || '';
    if (bName.includes('골렘') || bName.includes('golem')) {
      localStorage.setItem('soongsil_first_boss_cleared_global', 'true');
    }
    if (bName.includes('드래곤') || bName.includes('dragon')) {
      localStorage.setItem('soongsil_dragon_cleared_global', 'true');
    }`;

if (!mainJs.includes(targetRaidCleared)) {
  console.error('targetRaidCleared not found in main.js');
  process.exit(1);
}
mainJs = mainJs.replace(targetRaidCleared, replaceRaidCleared);

// Target 6: Drops in onBossRaidCleared
const targetDrops = `      // 3. 고목골렘 전용 드랍 (나무장비 20%, 고목의 핵 15%, 청동장비 8%)
      if (bName.includes('골렘') || bName.includes('golem')) {
        const roll = Math.random() * 100;
        if (roll < 20) {
          const woodGears = [
            { item: 'equip_wood_sword', name: '나무검', icon: '🗡️', slot: 'weapon', stats: { atk: 15, def: 0, hp: 0 }, effect: '공격력 +15' },
            { item: 'equip_wood_helmet', name: '나무투구', icon: '🪖', slot: 'helmet', stats: { atk: 0, def: 8, hp: 25 }, effect: '방어력 +8, 체력 +25' },
            { item: 'equip_wood_armor', name: '나무갑옷', icon: '🛡️', slot: 'armor', stats: { atk: 0, def: 15, hp: 10 }, effect: '방어력 +15, 체력 +10' }
          ];
          const chosen = woodGears[Math.floor(Math.random() * woodGears.length)];
          this.addItem(chosen.item, chosen.name, 1, chosen.icon, { type: 'equipment', slot: chosen.slot, stats: chosen.stats, effect: chosen.effect });
          rewardItemsList.push(\`\${chosen.icon} \${chosen.name}\`);
        } else if (roll < 35) { // 15%
          this.addItem('item_golem_core', '고목의 핵', 1, '🟢', { type: 'material', effect: '상위 장비 제작 재료' });
          rewardItemsList.push('🟢 고목의 핵');
        } else if (roll < 43) { // 8%
          const bronzeGears = [
            { item: 'equip_bronze_sword', name: '청동검', icon: '⚔️', slot: 'weapon', stats: { atk: 25, def: 0, hp: 0 }, effect: '공격력 +25' },
            { item: 'equip_bronze_helmet', name: '청동투구', icon: '🪖', slot: 'helmet', stats: { atk: 0, def: 14, hp: 35 }, effect: '방어력 +14, 체력 +35' },
            { item: 'equip_bronze_armor', name: '청동갑옷', icon: '🛡️', slot: 'armor', stats: { atk: 0, def: 22, hp: 70 }, effect: '방어력 +22, 체력 +70' }
          ];
          const chosen = bronzeGears[Math.floor(Math.random() * bronzeGears.length)];
          this.addItem(chosen.item, chosen.name, 1, chosen.icon, { type: 'equipment', slot: chosen.slot, stats: chosen.stats, effect: chosen.effect });
          rewardItemsList.push(\`\${chosen.icon} \${chosen.name} (대박!)\`);
        }
      }

      // 4. 숭실 골드 드래곤 전용 드랍 및 엘리베이터 점검 해제 플래그
      if (bName.includes('드래곤') || bName.includes('dragon')) {
        this.playerData.hasClearedDragonRaid = true;
        const studentId = this.playerData.studentId || '';
        if (studentId) {
          localStorage.setItem('soongsil_dragon_cleared_' + studentId, 'true');
        }
        localStorage.setItem('soongsil_dragon_cleared_global', 'true');
        this.saveProgress();

        const roll = Math.random() * 100;
        if (roll < 20) {
          this.addItem('item_dragon_heart', '용의 심장', 1, '❤️‍🔥', { type: 'material', effect: '최상위 제작 재료' });
          rewardItemsList.push('❤️‍🔥 용의 심장');
        } else if (roll < 35) { // 15%
          const bronzeGears = [
            { item: 'equip_bronze_sword', name: '청동검', icon: '⚔️', slot: 'weapon', stats: { atk: 25, def: 0, hp: 0 }, effect: '공격력 +25' },
            { item: 'equip_bronze_helmet', name: '청동투구', icon: '🪖', slot: 'helmet', stats: { atk: 0, def: 14, hp: 35 }, effect: '방어력 +14, 체력 +35' },
            { item: 'equip_bronze_armor', name: '청동갑옷', icon: '🛡️', slot: 'armor', stats: { atk: 0, def: 22, hp: 70 }, effect: '방어력 +22, 체력 +70' }
          ];
          const chosen = bronzeGears[Math.floor(Math.random() * bronzeGears.length)];
          this.addItem(chosen.item, chosen.name, 1, chosen.icon, { type: 'equipment', slot: chosen.slot, stats: chosen.stats, effect: chosen.effect });
          rewardItemsList.push(\`\${chosen.icon} \${chosen.name} (희귀 드랍)\`);
        }
      }`;

const replaceDrops = `      // 3. 가죽 골렘 전용 드랍 (엘리베이터 해금, 100% 질긴 보스의 가죽, 25% 나무장비 1종, 15% 가죽손잡이 세이버)
      if (bName.includes('골렘') || bName.includes('golem')) {
        this.playerData.hasClearedFirstBoss = true;
        const studentId = this.playerData.studentId || '';
        if (studentId) {
          localStorage.setItem('soongsil_first_boss_cleared_' + studentId, 'true');
        }
        localStorage.setItem('soongsil_first_boss_cleared_global', 'true');
        this.saveProgress();

        // 확정 재료 드랍 (2티어 가죽 장비 제작 핵심)
        this.addItem('item_boss_leather', '질긴 보스의 가죽', 1, '🟫', { type: 'material', effect: '2티어 가죽 장비 핵심 제작 재료' });
        rewardItemsList.push('🟫 질긴 보스의 가죽');

        const roll = Math.random() * 100;
        if (roll < 25) {
          const woodGears = [
            { item: 'equip_wood_sword', name: '나무검', icon: '🗡️', slot: 'weapon', stats: { atk: 15, def: 0, hp: 0 }, effect: '공격력 +15' },
            { item: 'equip_wood_helmet', name: '나무투구', icon: '🪖', slot: 'helmet', stats: { atk: 0, def: 8, hp: 25 }, effect: '방어력 +8, 체력 +25' },
            { item: 'equip_wood_armor', name: '나무갑옷', icon: '🛡️', slot: 'armor', stats: { atk: 0, def: 15, hp: 10 }, effect: '방어력 +15, 체력 +10' }
          ];
          const chosen = woodGears[Math.floor(Math.random() * woodGears.length)];
          this.addItem(chosen.item, chosen.name, 1, chosen.icon, { type: 'equipment', slot: chosen.slot, stats: chosen.stats, effect: chosen.effect });
          rewardItemsList.push(\`\${chosen.icon} \${chosen.name}\`);
        } else if (roll < 40) { // 15% 가죽손잡이 세이버 대박 완제품 드랍
          this.addItem('equip_leather_sword', '가죽손잡이 세이버', 1, '🗡️', {
            type: 'equipment', slot: 'weapon', stats: { atk: 20, def: 0, hp: 0 }, effect: '공격력 +20 (가죽 손잡이)'
          });
          rewardItemsList.push('🗡️ 가죽손잡이 세이버 (대박!)');
        }
      }

      // 4. 숭실 청동 드래곤 전용 드랍 (100% 청동 드래곤의 심장, 20% 청동 장비 완제품)
      if (bName.includes('드래곤') || bName.includes('dragon')) {
        this.playerData.hasClearedDragonRaid = true;
        const studentId = this.playerData.studentId || '';
        if (studentId) {
          localStorage.setItem('soongsil_dragon_cleared_' + studentId, 'true');
        }
        localStorage.setItem('soongsil_dragon_cleared_global', 'true');
        this.saveProgress();

        // 확정 재료 드랍 (3티어 청동 장비 제작 핵심)
        this.addItem('item_bronze_heart', '청동 드래곤의 심장', 1, '🥉', { type: 'material', effect: '3티어 청동 장비 제작 핵심 재료' });
        rewardItemsList.push('🥉 청동 드래곤의 심장');

        const roll = Math.random() * 100;
        if (roll < 20) {
          const bronzeGears = [
            { item: 'equip_bronze_sword', name: '청동검', icon: '⚔️', slot: 'weapon', stats: { atk: 25, def: 0, hp: 0 }, effect: '공격력 +25' },
            { item: 'equip_bronze_helmet', name: '청동투구', icon: '🪖', slot: 'helmet', stats: { atk: 0, def: 14, hp: 35 }, effect: '방어력 +14, 체력 +35' },
            { item: 'equip_bronze_armor', name: '청동갑옷', icon: '🛡️', slot: 'armor', stats: { atk: 0, def: 22, hp: 70 }, effect: '방어력 +22, 체력 +70' }
          ];
          const chosen = bronzeGears[Math.floor(Math.random() * bronzeGears.length)];
          this.addItem(chosen.item, chosen.name, 1, chosen.icon, { type: 'equipment', slot: chosen.slot, stats: chosen.stats, effect: chosen.effect });
          rewardItemsList.push(\`\${chosen.icon} \${chosen.name} (희귀 완제품!)\`);
        }
      }`;

if (!mainJs.includes(targetDrops)) {
  console.error('targetDrops not found in main.js');
  process.exit(1);
}
mainJs = mainJs.replace(targetDrops, replaceDrops);

// Target 7: Solo raid defeat in handleBossAttack
const targetSoloDefeat = `        if (this.bossState.currentHp <= 0) {
          const bName = window.BOSS_CONFIG.name || '';
          if (bName.includes('드래곤') || bName.includes('dragon')) {
            this.playerData.hasClearedDragonRaid = true;
            const studentId = this.playerData.studentId || '';
            if (studentId) {
              localStorage.setItem('soongsil_dragon_cleared_' + studentId, 'true');
            }
            localStorage.setItem('soongsil_dragon_cleared_global', 'true');
            this.saveProgress();
          }
          this.updateBossRaidUI();
          this.addGold(window.BOSS_CONFIG.rewardGold);
          this.addExp(window.BOSS_CONFIG.rewardExp);
          const clearNotice = (bName.includes('드래곤') || bName.includes('dragon'))
            ? '\\n\\n🎉 중앙 엘리베이터 점검이 완료되었습니다! 이제 엘리베이터를 타고 지상 운동장으로 이동할 수 있습니다!'
            : '';
          alert(\`🏆 [\${window.BOSS_CONFIG.name}] 처치!\\n보상: 🪙 +\${window.BOSS_CONFIG.rewardGold}G, 🌟 +\${window.BOSS_CONFIG.rewardExp} EXP\${clearNotice}\`);
          this.bossState.currentHp = this.bossState.maxHp;
          this.modalBossRaid.classList.add('hidden');
          return;
        }`;

const replaceSoloDefeat = `        if (this.bossState.currentHp <= 0) {
          const bName = window.BOSS_CONFIG.name || '';
          let clearNotice = '';
          if (bName.includes('골렘') || bName.includes('golem')) {
            this.playerData.hasClearedFirstBoss = true;
            const studentId = this.playerData.studentId || '';
            if (studentId) {
              localStorage.setItem('soongsil_first_boss_cleared_' + studentId, 'true');
            }
            localStorage.setItem('soongsil_first_boss_cleared_global', 'true');
            this.addItem('item_boss_leather', '질긴 보스의 가죽', 1, '🟫', { type: 'material', effect: '2티어 가죽 장비 핵심 제작 재료' });
            clearNotice = '\\n\\n🎉 중앙 엘리베이터 점검이 완료되었습니다! 이제 엘리베이터를 타고 지상 운동장으로 이동할 수 있습니다!\\n📦 획득: [🟫 질긴 보스의 가죽]';
            this.saveProgress();
          } else if (bName.includes('드래곤') || bName.includes('dragon')) {
            this.playerData.hasClearedDragonRaid = true;
            const studentId = this.playerData.studentId || '';
            if (studentId) {
              localStorage.setItem('soongsil_dragon_cleared_' + studentId, 'true');
            }
            localStorage.setItem('soongsil_dragon_cleared_global', 'true');
            this.addItem('item_bronze_heart', '청동 드래곤의 심장', 1, '🥉', { type: 'material', effect: '3티어 청동 장비 핵심 재료' });
            clearNotice = '\\n\\n🏆 숭실 청동 드래곤 토벌 성공!\\n📦 획득: [🥉 청동 드래곤의 심장] (3티어 청동 장비 제작 재료)';
            this.saveProgress();
          }
          this.updateBossRaidUI();
          this.addGold(window.BOSS_CONFIG.rewardGold);
          this.addExp(window.BOSS_CONFIG.rewardExp);
          alert(\`🏆 [\${window.BOSS_CONFIG.name}] 처치!\\n보상: 🪙 +\${window.BOSS_CONFIG.rewardGold}G, 🌟 +\${window.BOSS_CONFIG.rewardExp} EXP\${clearNotice}\`);
          this.bossState.currentHp = this.bossState.maxHp;
          this.modalBossRaid.classList.add('hidden');
          return;
        }`;

if (!mainJs.includes(targetSoloDefeat)) {
  console.error('targetSoloDefeat not found in main.js');
  process.exit(1);
}
mainJs = mainJs.replace(targetSoloDefeat, replaceSoloDefeat);

fs.writeFileSync('public/js/main.js', mainJs, 'utf8');
console.log('main.js successfully updated!');
