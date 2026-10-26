/**
 * Main Application Orchestrator for Soongsil English Open World RPG — Season 1
 * - Lv.1 ~ Lv.100 성장 (1레벨당 체력 +1, 공격력 +1, 방어력 +1)
 * - 가방 직접 클릭 착용/해제 및 장비창 확인
 */

const MAX_LEVEL = 100;

// Master Catalog of all items implemented in Season 1
const ALL_GAME_ITEMS = {
  // 1. Materials
  'item_wood': { name: '단단한 목재', icon: '🪵', count: 9999, meta: { type: 'material', effect: '장비 제작 기본 재료' } },
  'item_herb': { name: '향긋한 허브', icon: '🌿', count: 9999, meta: { type: 'material', effect: '물약 및 주문서 제작 재료' } },
  'item_forsythia': { name: '노란 개나리 꽃잎', icon: '🌼', count: 9999, meta: { type: 'material', effect: '교화 개나리 장신구 및 주홍 물약 재료' } },
  'item_ginkgo': { name: '황금 은행잎', icon: '🍂', count: 9999, meta: { type: 'material', effect: '교목 은행나무 부적 및 부활 주문서 재료' } },
  'item_golem_core': { name: '고목의 핵', icon: '🟢', count: 9999, meta: { type: 'material', effect: '골렘 보스 전리품 · 상위 제작 재료' } },
  'item_boss_leather': { name: '질긴 보스의 가죽', icon: '🥋', count: 9999, meta: { type: 'material', effect: '가죽 골렘 전리품 · 2티어 가죽 장비 필수 재료' } },
  'item_bronze_heart': { name: '청동 드래곤의 심장', icon: '❤️‍🔥', count: 9999, meta: { type: 'material', effect: '청동 드래곤 전리품 · 3티어 청동 장비 필수 재료' } },
  'item_basketball_leather': { name: '농구공 가죽 조각', icon: '🏀', count: 9999, meta: { type: 'material', effect: '농구장 몬스터 전리품 · 가죽 장비 제작 재료' } },
  'item_futsal_leather': { name: '탄력있는 풋살공 가죽', icon: '⚽', count: 9999, meta: { type: 'material', effect: '풋살장 몬스터 전리품 · 고급 방어구 및 장비 재료' } },

  // 2. Potions & Scrolls
  'item_red_potion': { name: '빨간 물약', icon: '🍷', count: 9999, meta: { type: 'consumable', slot: 'consumable', heal: 10, effect: '체력 +10 회복' } },
  'item_orange_potion': { name: '주홍 물약', icon: '🧪', count: 9999, meta: { type: 'consumable', slot: 'consumable', heal: 25, effect: '체력 +25 회복' } },
  'item_revive_scroll': { name: '부활 주문서', icon: '📜', count: 9999, meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '쓰러진 친구를 50% 체력으로 부활' } },

  // 3. 1st Grade Wooden & Leather Equipment
  'equip_wood_sword': { name: '나무검', icon: '🗡️', count: 9999, meta: { type: 'equipment', slot: 'weapon', stats: { atk: 15, def: 0, hp: 0 }, effect: '공격력 +15' } },
  'equip_wood_helmet': { name: '나무투구', icon: '🪖', count: 9999, meta: { type: 'equipment', slot: 'helmet', stats: { atk: 0, def: 8, hp: 25 }, effect: '방어력 +8, 체력 +25' } },
  'equip_wood_armor': { name: '나무갑옷', icon: '🛡️', count: 9999, meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 15, hp: 15 }, effect: '방어력 +15, 체력 +15' } },
  'equip_leather_armor': { name: '가죽갑옷', icon: '🥋', count: 9999, meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 17, hp: 20 }, effect: '방어력 +17, 체력 +20' } },
  'equip_leather_helmet': { name: '가죽투구', icon: '⛑️', count: 9999, meta: { type: 'equipment', slot: 'helmet', stats: { atk: 0, def: 12, hp: 28 }, effect: '방어력 +12, 체력 +28' } },
  'equip_leather_sword': { name: '가죽손잡이 세이버', icon: '🗡️', count: 9999, meta: { type: 'equipment', slot: 'weapon', stats: { atk: 20, def: 0, hp: 0 }, effect: '공격력 +20' } },
  'equip_forsythia_ring': { name: '성실의 개나리 반지', icon: '🌼', count: 9999, meta: { type: 'equipment', slot: 'accessory', stats: { atk: 10, def: 10, hp: 20 }, effect: '공격력 +10, 방어력 +10, 체력 +20' } },
  'equip_ginkgo_talisman': { name: '합심의 황금 은행잎 부적', icon: '🍂', count: 9999, meta: { type: 'equipment', slot: 'accessory', stats: { atk: 20, def: 12, hp: 40 }, effect: '공격력 +20, 방어력 +12, 체력 +40' } },
  'equip_elevator_pass': { name: '엘리베이터 작동권', icon: '🪪', count: 1, meta: { type: 'equipment', slot: 'accessory', isQuestItem: true, stats: { atk: 0, def: 0, hp: 0 }, effect: '🛗 중앙 엘리베이터 가동 인가증' } },

  // 4. Bronze Equipment (Boss Rare Drops)
  'equip_bronze_sword': { name: '청동검', icon: '⚔️', count: 9999, meta: { type: 'equipment', slot: 'weapon', stats: { atk: 25, def: 0, hp: 0 }, effect: '공격력 +25' } },
  'equip_bronze_helmet': { name: '청동투구', icon: '🪖', count: 9999, meta: { type: 'equipment', slot: 'helmet', stats: { atk: 0, def: 14, hp: 35 }, effect: '방어력 +14, 체력 +35' } },
  'equip_bronze_armor': { name: '청동갑옷', icon: '🛡️', count: 9999, meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 22, hp: 25 }, effect: '방어력 +22, 체력 +25' } },

  // 5. Legendary Season Boss Artifacts & Rewards
  'item_perfect_exam': { name: '💯 백점만점 시험지', icon: '💯', count: 9999, meta: { type: 'material', effect: '중간고사 대마왕 토벌 전리품 · 📚 시험의 제왕 호칭 교환 재료' } },
  'item_eval_paper': { name: 'A+ 만점 수행평가지', icon: '📜', count: 9999, meta: { type: 'material', effect: '케르베로스 전리품 · 수행평가 만점의 증표' } },
  'equip_laurel_crown': { name: '종강의 황금 월계관', icon: '👑', count: 9999, meta: { type: 'equipment', slot: 'helmet', stats: { atk: 15, def: 25, hp: 80 }, effect: '기말고사 파멸신 전리품 · 공격력 +15, 방어력 +25, 체력 +80' } },
  'equip_omr_wand': { name: '컴싸 마법봉', icon: '🖊️', count: 9999, meta: { type: 'equipment', slot: 'weapon', stats: { atk: 45, def: 10, hp: 30 }, effect: '기말고사 파멸신 전리품 · 공격력 +45, 방어력 +10' } },

};

window.ALL_GAME_ITEMS = ALL_GAME_ITEMS;

// 매점 아이템 판매 가격 테이블 (소비품 판매 금지 / 장비 제작비 20% 환급 적용)
const ITEM_SELL_PRICES = {
  // 1. 기초 채집 재료
  'item_wood': 1, // 단단한 목재 (호칭교환 30개 = 30G 가치)
  'item_herb': 1, // 향긋한 허브 (호칭교환 30개 = 30G 가치)
  'item_forsythia': 2, // 노란 개나리 꽃잎 (15% 드랍)
  'item_ginkgo': 3, // 황금 은행잎 (부적 재료)

  // 2. 몬스터 / 보스 전리품
  'item_basketball_leather': 2, // 농구공 가죽 조각
  'item_futsal_leather': 2, // 탄력있는 풋살공 가죽 (유저 확정: 2G)
  'item_golem_core': 10, // 고목의 핵
  'item_boss_leather': 15, // 질긴 보스의 가죽
  'item_bronze_heart': 30, // 청동 드래곤의 심장
  'equip_shoes_samdidas': 20,
    'item_perfect_exam': 50, // 💯 백점만점 시험지 (매점 매각 시 50G)
  'item_eval_paper': 25, // A+ 만점 수행평가지

  // 3. 1티어 나무 장비 (제작비 15G의 20% = 3G 환급)
  'equip_wood_sword': 3,
  'equip_wood_helmet': 3,
  'equip_wood_armor': 3,

  // 4. 2티어 가죽 / 개나리 장비 (제작비의 20% 환급)
  'equip_leather_sword': 7, // 제작비 35G -> 20% = 7G
  'equip_leather_helmet': 8, // 제작비 40G -> 20% = 8G
  'equip_leather_armor': 10, // 제작비 50G -> 20% = 10G
  'equip_forsythia_ring': 6, // 제작비 30G -> 20% = 6G

  // 5. 3티어 청동 / 은행잎 장비 (제작비의 20% 환급)
  'equip_bronze_sword': 10, // 제작비 50G -> 20% = 10G
  'equip_bronze_helmet': 10, // 제작비 50G -> 20% = 10G
  'equip_bronze_armor': 14, // 제작비 70G -> 20% = 14G
  'equip_ginkgo_talisman': 10, // 제작비 50G -> 20% = 10G

  // 6. 최상위 엔드 레이드 전리품
  'equip_laurel_crown': 20,
  'equip_omr_wand': 20,
    'equip_elevator_pass': 0 // 작동권 매점 판매 불가 (퀘스트 핵심 아이템)
};

// 호칭 교환소 4대 명예 호칭 정의 (목재 30개 -> 벌목왕, 허브 30개 -> 치유사, 골드 50 -> 숭실 부자, 백점만점 시험지 -> 시험의 제왕)
const TITLE_DEFINITIONS = [
  {
    id: 'title_wood_king',
    name: '🪵 숭실 벌목왕',
    desc: '수많은 영어 문제를 풀고 학교 나무를 가꾼 진정한 벌목의 달인!',
    costType: 'item',
    costItem: 'item_wood',
    costItemName: '단단한 목재',
    costAmount: 30
  },
  {
    id: 'title_forest_healer',
    name: '🌿 숲의 치유사',
    desc: '자연의 향기로운 약초를 모아 동료들의 생명을 보살피는 숭실의 힐러!',
    costType: 'item',
    costItem: 'item_herb',
    costItemName: '향긋한 허브',
    costAmount: 30
  },
  {
    id: 'title_soongsil_rich',
    name: '🪙 숭실 부자',
    desc: '꾸준한 퀴즈와 근면한 상거래로 황금 200골드를 당당히 보유한 자산가!',
    costType: 'gold',
    costAmount: 200
  },
  {
    id: 'title_exam_lord',
    name: '📚 시험의 제왕',
    desc: '중간고사 대마왕을 격파하고 백점만점 시험지를 획득한 숭실 최고의 지성!',
    costType: 'item',
    costItem: 'item_perfect_exam',
    costItemName: '💯 백점만점 시험지',
    costAmount: 1
  }
];

window.BOSS_CONFIG = {
  active: false,
  name: '👾 가죽 골렘',
  level: 10,
  mode: 'coop',
  unitFilter: 'ALL',
  maxHp: 2000,
  currentHp: 2000,
  atk: 30,
  def: 14,
  rewardGold: 50,
  rewardExp: 100
};

class MainApp {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.engine = new GameEngine(this.canvas);
    this.quizManager = new QuizManager();
    this.craftingManager = new CraftingManager();
    this.networkManager = new NetworkManager(this.engine);

    window.NetworkManager = this.networkManager;

    this.playerData = {
      name: '',
      studentId: '',
      grade: 1,
      avatar: 'student_m1',
      level: 1,
      exp: 0,
      gold: 10,
      baseHp: 100,
      hp: 100,
      maxHp: 100,
      baseAtk: 10,
      atk: 10,
      baseDef: 2,
      def: 2,
      equipment: {
        helmet: null,
        armor: null,
        weapon: null,
        shoes: null,
        accessory: null,
        accessory2: null
      },
      isAccessory2Unlocked: false,
      hasReceivedSoongsilGift: false,
      hasOpenedSecretLocker: false,
      hasCheckedMirror: false,
      hasOpenedLostBox: false,
      hasClearedDragonRaid: false,
      hasClearedCerberusRaid: false,
      titles: [],
      equippedTitle: null,
      inventory: []
    };

    this.ITEM_SELL_PRICES = ITEM_SELL_PRICES;
    this.TITLE_DEFINITIONS = TITLE_DEFINITIONS;

    this.bossState = {
      currentHp: window.BOSS_CONFIG.maxHp,
      maxHp: window.BOSS_CONFIG.maxHp,
      currentQuestion: null
    };

    // DOM Elements
    this.hudName = document.getElementById('hud-name');
    this.hudLevel = document.getElementById('hud-level');
    this.hudGold = document.getElementById('hud-gold');
    this.hudAtk = document.getElementById('hud-atk');
    this.hudDef = document.getElementById('hud-def');
    this.hudLocation = document.getElementById('hud-location');
    this.floorTag = document.getElementById('current-floor-tag');

    // Modals
    this.modalLogin = document.getElementById('modal-login');
    this.modalInventory = document.getElementById('modal-inventory');
    this.modalEquipment = document.getElementById('modal-equipment');
    this.modalBossRaid = document.getElementById('modal-boss-raid');
    this.modalFieldBattle = document.getElementById('modal-field-battle');
    this.modalTeacher = document.getElementById('modal-teacher');
    this.currentFieldMob = null;
    this.fieldBattleQuestion = null;

    this.invGoldDisplay = document.getElementById('inv-gold-display');
    this.invAtkDisplay = document.getElementById('inv-atk-display');
    this.invDefDisplay = document.getElementById('inv-def-display');
    this.invGrid = document.getElementById('inv-items-grid');

    this.initControls();
    this.initModals();
    this.initTeacherAdmin();
    this.initServerStatusMonitor();
    this.recalcCombatStats();
  }

  setServerStatus(isOnline) {
    this.isServerOnline = isOnline;
    const box = document.getElementById('login-server-box');
    const dot = document.getElementById('login-server-dot');
    const title = document.getElementById('login-server-title');
    const badge = document.getElementById('login-server-badge');
    if (!box || !dot || !title || !badge) return;

    if (isOnline) {
      box.style.borderColor = '#22c55e';
      box.style.background = 'rgba(34, 197, 94, 0.1)';
      dot.style.background = '#22c55e';
      dot.style.boxShadow = '0 0 8px #22c55e';
      title.style.color = '#4ade80';
      badge.style.color = '#22c55e';
      badge.style.borderColor = '#22c55e';
      badge.style.background = 'rgba(34, 197, 94, 0.2)';
      badge.innerText = '접속 가능';
    } else {
      box.style.borderColor = '#ef4444';
      box.style.background = 'rgba(239, 68, 68, 0.1)';
      dot.style.background = '#ef4444';
      dot.style.boxShadow = '0 0 8px #ef4444';
      title.style.color = '#f87171';
      badge.style.color = '#ef4444';
      badge.style.borderColor = '#ef4444';
      badge.style.background = 'rgba(239, 68, 68, 0.2)';
      badge.innerText = '접속 불가';
    }
  }

  initServerStatusMonitor() {
    this.isServerOnline = true;
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/admin/all-students-progress', { method: 'GET', cache: 'no-store' });
        this.setServerStatus(res.ok);
      } catch (e) {
        this.setServerStatus(false);
      }
    };
    checkHealth();
    setInterval(checkHealth, 6000);
  }

  initControls() {
    document.querySelectorAll('.dpad-btn').forEach(btn => {
      const dir = btn.getAttribute('data-dir');
      if (!dir) return;

      const handlePress = (e) => {
        e.preventDefault();
        this.engine.setDirectionInput(dir, true);
      };
      const handleRelease = (e) => {
        e.preventDefault();
        this.engine.setDirectionInput(dir, false);
      };

      btn.addEventListener('pointerdown', handlePress);
      btn.addEventListener('pointerup', handleRelease);
      btn.addEventListener('pointerleave', handleRelease);
      btn.addEventListener('pointercancel', handleRelease);
    });

    const btnA = document.getElementById('btn-action-a');
    const btnB = document.getElementById('btn-action-b');

    // Dashing state and cooldown management (3s sprint duration, 5s cooldown)
    this.dashState = {
      isDashing: false,
      startTime: 0,
      durationMs: 3000,
      cooldownMs: 5000,
      cooldownEndTime: 0,
      animInterval: null,
      durationTimeout: null
    };

    this.startDash = () => {
      if (!this.engine || !this.engine.player) return;
      const isTeacher = !!this.engine.player.isTeacher;
      const hasShoes = !!this.engine.player.hasRunningShoes;

      if (!hasShoes && !isTeacher) {
        // 신발 미착용 시 아무 알림 없이 조용히 무시 (사용자 요청)
        return;
      }

      const now = Date.now();
      if (!isTeacher && now < this.dashState.cooldownEndTime) {
        const remainingSec = ((this.dashState.cooldownEndTime - now) / 1000).toFixed(1);
        this.showToast(`⏳ [숨고르기] 달리기 쿨타임 중입니다... (${remainingSec}초)`, 'warning');
        return;
      }

      if (this.dashState.isDashing) return;

      this.dashState.isDashing = true;
      this.dashState.startTime = now;
      this.engine.setDashing(true);

      if (!isTeacher) {
        clearTimeout(this.dashState.durationTimeout);
        this.dashState.durationTimeout = setTimeout(() => {
          if (this.dashState.isDashing) {
            this.stopDash(true);
          }
        }, this.dashState.durationMs);
      }
    };

    this.stopDash = (fromTimeout = false) => {
      if (!this.engine || !this.engine.player) return;
      if (!this.dashState.isDashing) return;

      this.dashState.isDashing = false;
      clearTimeout(this.dashState.durationTimeout);
      this.engine.setDashing(false);

      if (!this.engine.player.isTeacher) {
        this.triggerDashCooldown(this.dashState.cooldownMs);
      }
    };

    this.triggerDashCooldown = (cooldownMs) => {
      this.dashState.cooldownEndTime = Date.now() + cooldownMs;
      const overlay = document.getElementById('btn-b-cooldown-overlay');
      const dial = document.getElementById('btn-b-clock-dial');
      const hand = document.getElementById('btn-b-clock-hand');
      const secText = document.getElementById('btn-b-cooldown-sec');
      const btnBEl = document.getElementById('btn-action-b');

      if (!overlay || !secText) return;
      overlay.classList.remove('hidden');
      if (btnBEl) btnBEl.style.cursor = 'not-allowed';

      clearInterval(this.dashState.animInterval);
      this.dashState.animInterval = setInterval(() => {
        const remaining = Math.max(0, this.dashState.cooldownEndTime - Date.now());
        const progress = 1 - (remaining / cooldownMs);
        const deg = Math.floor(progress * 360);

        if (dial) dial.style.setProperty('--cd-pct', `${deg}deg`);
        if (hand) hand.style.setProperty('--cd-deg', `${deg}deg`);
        secText.innerText = `${(remaining / 1000).toFixed(1)}s`;

        if (remaining <= 0) {
          clearInterval(this.dashState.animInterval);
          overlay.classList.add('hidden');
          if (btnBEl) btnBEl.style.cursor = 'pointer';
        }
      }, 40);
    };

    btnA.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (window.AudioManager) window.AudioManager.playSelect();
      if (window.RPGDialog && window.RPGDialog.isOpen) {
        window.RPGDialog.advance();
        return;
      }
      this.engine.interact();
    });

    btnB.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.startDash();
    });
    btnB.addEventListener('pointerup', (e) => {
      e.preventDefault();
      this.stopDash();
    });
    btnB.addEventListener('pointercancel', (e) => {
      e.preventDefault();
      this.stopDash();
    });

    window.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      const arModal = document.getElementById('modal-acid-rain');
      if (arModal && !arModal.classList.contains('hidden')) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.engine.setDirectionInput('up', true);
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.engine.setDirectionInput('down', true);
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.engine.setDirectionInput('left', true);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.engine.setDirectionInput('right', true);
      if (e.key === 'Shift' || e.key === 'b' || e.key === 'B') {
        this.startDash();
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (window.RPGDialog && window.RPGDialog.isOpen) {
          window.RPGDialog.advance();
          return;
        }
        this.engine.interact();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.engine.setDirectionInput('up', false);
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.engine.setDirectionInput('down', false);
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.engine.setDirectionInput('left', false);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.engine.setDirectionInput('right', false);
      if (e.key === 'Shift' || e.key === 'b' || e.key === 'B') {
        this.stopDash();
      }
    });

    this.engine.onMoveCallback = (pos) => {
      this.networkManager.sendMove(pos);
    };

    this.engine.onLocationChangeCallback = (loc) => {
      this.hudLocation.innerText = loc.roomName;
      this.floorTag.innerText = '시즌 1 (v1.28)';
      this.networkManager.changeLocation(loc);
    };

    this.engine.onInteractCallback = (target) => {
      this.handleInteraction(target);
    };

    this.engine.onLockedDoorCallback = (room) => {
      this.handleLockedDoor(room);
    };

    window.addEventListener('resize', () => this.engine.resize());
  }

  handleInteraction(target) {
    if (target.type === 'npc') {
      const npc = target.data;
      if (!npc) return;

      // 1학년 복도 담임 이상대 선생님 (중앙 엘리베이터 안내 NPC)
      if (npc.id === 'npc_teacher_sangdae' || (npc.name && npc.name.includes('이상대'))) {
        if (!this.isElevatorUnlocked()) {
          alert(`💬 [이상대 선생님]\n\n"안녕! 1학년 1반 담임 이상대 선생님이다. 👨‍🏫\n\n⚠️ 지금은 중앙 엘리베이터가 고장나서 [점검 중]이라 지상 운동장으로 내려갈 수 없단다!\n\n1학년 2반 교실로 들어가 1차 관문 보스 [👾 가죽 골렘]을 먼저 토벌해야 비로소 [🪪 엘리베이터 작동권]을 얻어 운동장으로 내려갈 수 있단다.\n\n어서 2반 앞의 한강우 선생님을 찾아가 가죽 골렘 레이드를 준비해보렴!"`);
          return;
        } else {
          alert(`💬 [이상대 선생님]\n\n"안녕! 1학년 1반 담임 이상대 선생님이다. 👨‍🏫\n\n🎉 오오! 1차 관문 보스 [가죽 골렘]을 멋지게 토벌하고 [🪪 엘리베이터 작동권]을 얻었구나! 대단하다! 👏\n덕분에 고장났던 중앙 엘리베이터를 다시 가동할 수 있게 되었단다.\n\n⚠️ [엘리베이터 이용 및 운동장 경고]\n인벤토리(I) 장신구 슬롯에 [🪪 엘리베이터 작동권]을 장착한 후 통행료 10G(골드)를 지불하면 운동장으로 내려갈 수 있단다.\n\n운동장 농구장과 풋살장에서 거친 몬스터들을 물리쳐 농구가죽과 풋살가죽을 모으면 2티어 가죽 장비를 제작할 수 있단다!\n\n골드가 충분히 모이고 작동권을 착용했다면 엘리베이터 앞에서 SPACE를 눌러보렴."`);
          return;
        }
      }

      if (!npc.dialogue) return; // 대사 없는 NPC (오예숙 선생님 등)
      alert(`💬 [${npc.name}]\n\n"${npc.dialogue}"`);
    } else if (target.type === 'mascot') {
      this.handleMascotInteraction();
    } else if (
      target.type === 'teacher_desk' ||
      target.type === 'gather_wood' ||
      target.type === 'gather_herb' ||
      target.type === 'gather_forsythia' ||
      target.type === 'gather_ginkgo' ||
      target.type === 'ginkgo' ||
      target.type === 'forsythia'
    ) {
      if (target.name && target.name.includes('전광판')) {
        alert('🖥️ [컴퓨터실 전광판]\n\n"1학년 3반 영어 타자 훈련실!\n중앙의 산성비 타자 컴퓨터 앞에서 SPACE를 누르면 하늘에서 떨어지는 영단어 방어전이 시작됩니다.\n\n정확한 타이핑으로 방화벽을 지키고 골드와 경험치를 획득하세요!"');
        return;
      }
      if (target.name && target.name.includes('서버')) {
        alert('🎛️ [컴퓨터실 메인 서버]\n\n"숭실 영어 타자 훈련 시스템 네트워크가 정상 가동 중입니다. (PING 1ms / 안정적)"');
        return;
      }
      this.quizManager.triggerQuiz(target.name, target.type, target.data);
    } else if (target.type === 'board') {
      alert('📋 [복도 게시판]\n\n"숭실중학교 학생 공지사항이 게시되어 있습니다."');
    } else if (target.type === 'craft') {
      const cat = (target.data && target.data.category) || target.category || (target.name && target.name.includes('포션') ? 'potion' : 'equipment');
      this.craftingManager.open(cat);
    } else if (target.type === 'boss_raid') {
      this.openBossRaid(target.data);
    } else if (target.type === 'leaderboard') {
      this.openLeaderboard();
    } else if (target.type === 'elevator') {
      this.handleElevatorInteraction();
    } else if (target.type === 'cafeteria') {
      alert('🍽️ [학생 급식실 (조리실)]\n\n"영양사 선생님과 조리사님들이 오늘의 맛있는 점심 식사를 준비 중입니다!\n(장소는 다음 시즌 업데이트 오픈 예정)"');
    } else if (target.type === 'store') {
      this.openStoreModal();
    } else if (target.type === 'title_exchange') {
      this.openTitleExchangeModal();
    } else if (target.type === 'secret_locker') {
      this.handleSecretLocker();
    } else if (target.type === 'field_monster') {
      this.startFieldMonsterBattle(target.data);
    } else if (target.type === 'acid_rain') {
      if (!this.networkManager) {
        if (window.AcidRain) window.AcidRain.open();
        return;
      }
      this.networkManager.requestAcidRainSeat(
        {
          studentId: this.playerData.studentId,
          name: this.playerData.name,
          isTeacher: !!this.playerData.isTeacher
        },
        (res) => {
          if (!res || !res.allowed) {
            alert(res && res.message ? res.message : '🖥️ [컴퓨터실 이용 안내]\n\n현재 1학년 3반 컴퓨터실의 모든 좌석(4석)에서 친구들이 산성비 타자 연습을 진행 중입니다!\n\n다른 친구가 게임을 마칠 때까지 잠시만 기다려주세요!');
            return;
          }
          if (window.AcidRain) {
            window.AcidRain.open();
          }
        }
      );
    } else if (target.type === 'water_purifier') {
      this.handleWaterPurifier();
    } else if (target.type === 'mirror') {
      this.handleMirrorInteraction();
    } else if (target.type === 'lost_box') {
      this.handleLostBoxInteraction();
    } else if (target.type === 'locked_door') {
      this.handleLockedDoor(target.data);
    } else if (target.type === 'club_board') {
      this.handleClubBoardInteraction();
    } else if (target.type === 'plant_zone') {
      this.handlePlantZoneInteraction(target);
    } else if (target.type === 'dev_note') {
      this.handleDevNoteInteraction();
    }
  }

  handleWaterPurifier() {
    this.waterPurifierCooldown = this.waterPurifierCooldown || 0;
    const now = Date.now();
    if (now < this.waterPurifierCooldown) {
      const remainingSec = Math.ceil((this.waterPurifierCooldown - now) / 1000);
      this.showToast(`⏳ 복도 정수기 냉수 충전 중입니다... (${remainingSec}초 후 사용 가능)`, 'warning');
      return;
    }

    if (this.playerData.hp >= this.playerData.maxHp) {
      this.showToast('🚰 이미 체력이 100% 가득 차 있어 물을 마실 필요가 없습니다!', 'info');
      return;
    }

    const healAmount = Math.max(1, Math.floor(this.playerData.maxHp * 0.5));
    const prevHp = this.playerData.hp;
    this.playerData.hp = Math.min(this.playerData.maxHp, this.playerData.hp + healAmount);
    const actualHealed = this.playerData.hp - prevHp;
    this.waterPurifierCooldown = now + 90000; // 90초 (1분 30초 쿨타임)

    this.updateHpBar();
    this.saveProgress();

    if (window.AudioManager) {
      window.AudioManager.playRevive();
    }

    this.showToast(`🚰 시원한 정수기 냉수를 마셨습니다! HP +${actualHealed} 회복 (${this.playerData.hp}/${this.playerData.maxHp}) [쿨타임: 1분 30초]`, 'success');
  }

  // 🪞 복도 전신 거울 이스터에그 (최초 1회 골드 20, 경험치 20)
  handleMirrorInteraction() {
    const studentId = this.playerData.studentId || 'default';
    const mirrorKey = 'soongsil_mirror_' + studentId;
    const alreadyChecked = !!(this.playerData.hasCheckedMirror || (studentId && localStorage.getItem(mirrorKey) === 'true'));

    if (alreadyChecked && !this.playerData.isTeacher) {
      if (window.AudioManager) window.AudioManager.playSelect();
      const mirrorPhrases = [
        `"✨ 흠... 오늘따라 교복 핏과 헤어스타일이 완벽한걸? 거울을 보며 찡긋 윙크를 지어봅니다."`,
        `"🌟 '공부도, 퀴즈 배틀도 1등! 숭실 최고의 모험가가 바로 나야!' 거울 속 나와 하이파이브를 나눕니다."`,
        `"😎 '티끌 하나 없는 완벽한 옷매무새!' 거울을 보고 나니 자신감이 200% 충전됩니다."`,
        `"🍀 '오늘 왠지 좋은 일만 가득 일어날 것 같아!' 거울에 비친 미소가 눈부시게 빛납니다."`,
        `"💪 '어떤 어려운 영어 문제나 보스 레이드도 두렵지 않아!' 거울 속 나에게 당당하게 파이팅을 외칩니다."`
      ];
      const randomMsg = mirrorPhrases[Math.floor(Math.random() * mirrorPhrases.length)];
      alert(`🪞 [복도 전신 거울]\n\n${randomMsg}`);
      return;
    }

    // 최초 1회 보상: 20G, 20 EXP
    this.playerData.hasCheckedMirror = true;
    try {
      localStorage.setItem(mirrorKey, 'true');
    } catch (e) {}

    this.addGold(20);
    this.addExp(20);
    this.saveProgress();

    if (window.AudioManager) {
      window.AudioManager.playFanfare();
    }

    alert(
      `🪞 [복도 전신 거울 - 용모 단정 체크!]\n\n` +
      `"거울 속에 비친 단정하고 늠름한 숭실중 1학년 학생의 모습!\n` +
      `카라를 바로잡고 옷매무새를 가다듬으니 자신감이 샘솟습니다! ✨"\n\n` +
      `🎁 [최초 1회 용모 단정 보너스]\n` +
      `• 🪙 골드 +20G 획득!\n` +
      `• 🌟 경험치 +20 EXP 획득!\n\n` +
      `"오늘도 활기차고 당당하게 숭실 모험을 시작하자!"`
    );
  }

  // 📦 운동장 비밀 분실물 상자 (최초 1회 50골드, 30경험치, 주홍물약 2개, 빨간물약 2개)
  handleClubBoardInteraction() {
    alert("🎸 [숭실 동아리 홍보 게시판]\n\n\"2026학년도 1학년 동아리 신입 부원 대모집!\"\n\n🥁 [스쿨 밴드부 '소리마루']\n• 드럼, 전자기타, 베이스, 보컬 등 열정 가득한 1학년 대환영!\n\n⚽ [축구 & 풋살 동아리]\n• 점심시간 지상 운동장을 함께 누빌 미래의 숭실 에이스 모집!\n\n💻 [코딩 & 영어 RPG 개발부]\n• 게임 속 버그를 잡고 숭실 월드를 함께 만들어갈 모험가 환영!\n\n🎨 [웹툰 & 일러스트 창작부]\n• 나만의 개성 넘치는 캐릭터와 숭실 만화를 그릴 부원 모집!");
  }

  handlePlantZoneInteraction(target) {
    const curCount = (this.engine && this.engine.plantWaterCount) || 0;
    const curGoal = this.engine ? this.engine.getNextPlantWaterGoal() : { current: curCount, target: 100, stage: 0, name: '🌱 아기 새싹' };

    // Teacher shortcut for rapid testing of all 3 growth stages
    if (this.playerData && this.playerData.isTeacher) {
      const input = prompt(
        "💧 [교사 권한: 식물존 물주기 & 성장 관리]\n\n" +
        "현재 누적 물주기: " + curCount + "회 (" + curGoal.name + ")\n\n" +
        "• 원하는 물주기 횟수를 입력하여 즉시 특정 성장 단계로 변경할 수 있습니다.\n" +
        "  - 0 ~ 99: 0단계 아기 새싹\n" +
        "  - 100 ~ 999: 1단계 무럭무럭 식물 (1차 성장)\n" +
        "  - 1000 ~ 2999: 2단계 거대 생명수 (2차 성장)\n" +
        "  - 3000 이상: 3단계 최종 만개목 (3차 만개 성장)\n\n" +
        "• 일반 물주기(+1회)를 하려면 빈칸으로 [확인]을 누르세요:",
        curCount
      );

      if (input !== null) {
        const trimmed = input.trim();
        if (trimmed !== '' && !isNaN(Number(trimmed))) {
          const setCount = Math.max(0, parseInt(trimmed, 10));
          if (this.engine) this.engine.setPlantWaterCount(setCount);
          if (this.networkManager && this.networkManager.setPlantWaterCountTeacher) {
            this.networkManager.setPlantWaterCountTeacher(setCount);
          }
          const newG = this.engine ? this.engine.getNextPlantWaterGoal() : { name: '' };
          this.showToast("💧 식물존 물주기가 " + setCount + "회 (" + newG.name + ")로 설정되었습니다!", "success");
          return;
        }
      } else {
        return; // cancelled
      }
    }

    // 10분 쿨타임 검사 (학생 대상, 현실시간 기준 10분 = 600,000ms)
    const now = Date.now();
    const studentId = (this.playerData && this.playerData.studentId) || 'default';
    const waterCooldownKey = 'soongsil_plant_water_time_' + studentId;
    const cooldownMs = 10 * 60 * 1000;

    if (!this.playerData || !this.playerData.isTeacher) {
      let lastWaterTime = 0;
      try {
        lastWaterTime = parseInt(localStorage.getItem(waterCooldownKey) || '0', 10);
      } catch (e) {}

      if (now - lastWaterTime < cooldownMs) {
        const remainingMs = cooldownMs - (now - lastWaterTime);
        const remMin = Math.floor(remainingMs / 60000);
        const remSec = Math.ceil((remainingMs % 60000) / 1000);
        const timeStr = remMin > 0 ? (remMin + '분 ' + remSec + '초') : (remSec + '초');
        this.showToast('💧 화분의 흙이 아직 촉촉합니다! (' + timeStr + ' 뒤에 다시 물을 줄 수 있습니다.)', 'warning');
        return;
      }
    }

    try {
      localStorage.setItem(waterCooldownKey, String(now));
    } catch (e) {}

    // Normal student watering interaction (+1)
    const prevCount = curCount;
    const newCount = prevCount + 1;
    if (this.engine) {
      this.engine.setPlantWaterCount(newCount);
    }
    if (this.networkManager && this.networkManager.waterPlant) {
      this.networkManager.waterPlant(1);
    }

    if (this.audio && this.audio.playSelect) {
      this.audio.playSelect();
    }

    // Check Milestone Celebrations
    if (prevCount < 100 && newCount >= 100) {
      alert("🎉 [식물존 1단계 성장 달성! (1/3)]\n\n모두가 정성껏 물을 준 덕분에 식물이 [🌿 1단계 무럭무럭 식물]로 자라났습니다! 🌱✨");
    } else if (prevCount < 1000 && newCount >= 1000) {
      alert("🎉 [식물존 2단계 성장 달성! (2/3)]\n\n식물이 거대하고 울창한 [🌳 2단계 거대 생명수]로 크게 성장했습니다! 🌲✨");
    } else if (prevCount < 3000 && newCount >= 3000) {
      alert("🌟 [식물존 최종 3단계 만개 달성! (3/3)]\n\n식물이 황금빛 꽃을 활짝 피운 [🌸 3단계 숭실 생명의 만개목]으로 최종 진화했습니다! 🌸✨");
    } else {
      const nextG = this.engine ? this.engine.getNextPlantWaterGoal() : { target: 100 };
      const targetText = nextG.max ? "만개 완료!" : nextG.target + "회";
      if (this.playerData && this.playerData.isTeacher) {
        this.showToast("💧 [교사 확인] 물주기 완료! (누적: " + newCount + "회 / 다음: " + targetText + ")", "info");
      } else {
        this.showToast("💧 식물에 정성껏 맑은 물을 주었습니다! 촉촉하게 자라납니다. 🌱", "success");
      }
    }
  }

  handleLockedDoor(room) {
    if (!room) return;
    const msg = room.lockMessage || "지금은 스포츠(체육) 시간입니다. 타반 학생은 출입금지입니다! ⚽";
    if (this.playerData && this.playerData.isTeacher) {
      if (confirm(`🚪 [${room.name}]\n\n"${msg}"\n\n(교사 권한으로 교실 내부에 입장하시겠습니까?)`)) {
        this.engine.triggerFadeWarp(() => {
          this.engine.warpToRoom(room.id, room.name, room.targetX * 32, room.targetY * 32);
        });
      }
    } else {
      alert(`🚪 [${room.name}]\n\n"${msg}"`);
    }
  }

  handleLostBoxInteraction() {
    const studentId = this.playerData.studentId || 'default';
    const boxKey = 'soongsil_lost_box_' + studentId;
    const alreadyOpened = !!(this.playerData.hasOpenedLostBox || (studentId && localStorage.getItem(boxKey) === 'true'));

    if (alreadyOpened && !this.playerData.isTeacher) {
      if (window.AudioManager) window.AudioManager.playSelect();
      alert(
        `📦 [낡은 철제 분실물 상자]\n\n` +
        `"상자 안은 비어 있지만, 뚜껑 안쪽에 새겨진 선배의 따뜻한 글귀가 은은하게 남아있습니다.\n\n` +
        `'포기하지 않고 끝까지 달리는 자에게 승리의 영광이 있으리라! 🏃‍♂️'"`
      );
      return;
    }

    // 최초 1회 보상: 50G, 30 EXP, 주홍물약 x2, 빨간물약 x2
    this.playerData.hasOpenedLostBox = true;
    try {
      localStorage.setItem(boxKey, 'true');
    } catch (e) {}

    this.addGold(50);
    this.addExp(30);
    this.addItem('item_orange_potion', '주홍 물약', 2, '🧪', { type: 'consumable', slot: 'consumable', heal: 25, effect: '체력 +25 회복' });
    this.addItem('item_red_potion', '빨간 물약', 2, '🍷', { type: 'consumable', slot: 'consumable', heal: 10, effect: '체력 +10 회복' });
    this.saveProgress();

    if (window.AudioManager) {
      window.AudioManager.playFanfare();
    }

    alert(
      `📦 [스탠드 구석 비밀 분실물 상자 발견!]\n\n` +
      `"관람석 스탠드 구석, 덤불 사이에 조심스레 숨겨져 있던 낡은 철제 분실물 상자의 자물쇠를 풀었습니다!\n` +
      `안에는 누군가 남겨둔 따뜻한 응원의 손편지와 비상 물품들이 가지런히 놓여 있습니다."\n\n` +
      `📜 [선배의 비밀 쪽지]:\n` +
      `'숭실 운동장에서 땀 흘리며 달리는 후배들아!\n` +
      `지치고 힘들 때 이 비상 물약과 용돈을 쓰고 힘내라! - 숭실 졸업생 선배가'\n\n` +
      `🎁 [최초 1회 보상 획득!]\n` +
      `• 🪙 골드 +50G 획득!\n` +
      `• 🌟 경험치 +30 EXP 획득!\n` +
      `• 🧪 주홍 물약 x2개 획득! (HP +25 회복)\n` +
      `• 🍷 빨간 물약 x2개 획득! (HP +10 회복)\n\n` +
      `(우측 상단 가방(🎒)을 열어 획득한 물약을 확인할 수 있습니다.)`
    );
  }

  hasItem(itemId) {
    return (this.playerData.inventory || []).some(i => i.item === itemId && (i.count === undefined || i.count > 0));
  }

  isElevatorUnlocked() {
    if (this.playerData.isTeacher) return true;
    if (this.playerData.hasClearedFirstBoss) return true;
    const studentId = this.playerData.studentId || '';
    if (studentId && localStorage.getItem('soongsil_first_boss_cleared_' + studentId) === 'true') {
      this.playerData.hasClearedFirstBoss = true;
      return true;
    }
    return false;
  }

  isElevatorPassEquipped() {
    if (this.playerData.isTeacher) return true;
    return this.isItemEquipped('equip_elevator_pass');
  }

  isDragonCleared() {
    return this.isElevatorUnlocked();
  }

  handleElevatorInteraction() {
    if (this.playerData.isTeacher) {
      if (this.engine.player.room === 'playground') {
        const goUp = confirm('🛗 [교사 전용 프리패스]\n\n1학년 복도로 이동하시겠습니까?');
        if (goUp) {
          this.engine.triggerFadeWarp(() => {
            this.engine.warpToRoom('hallway', '1학년 복도', 56 * 32, 5 * 32);
          });
        }
      } else {
        const goDown = confirm('🛗 [교사 전용 프리패스]\n\n숭실 운동장으로 이동하시겠습니까? (교사는 골드 무료)');
        if (goDown) {
          this.engine.triggerFadeWarp(() => {
            this.engine.warpToRoom('playground', '숭실 운동장', 80 * 32, 5 * 32);
          });
        }
      }
      return;
    }

    if (this.engine.player.room === 'playground') {
      const goUp = confirm('🛗 [중앙 엘리베이터 탑승]\n\n1학년 복도로 올라가시겠습니까?');
      if (goUp) {
        if (window.AudioManager) window.AudioManager.playSelect();
        this.engine.triggerFadeWarp(() => {
          this.engine.warpToRoom('hallway', '1학년 복도', 56 * 32, 5 * 32);
        });
      }
    } else {
      // 1. 1차 관문 보스(가죽 골렘) 토벌 여부 검사 (토벌 전까지는 점검 중)
      if (!this.isElevatorUnlocked()) {
        alert(
          '⚠️ [엘리베이터 점검 중]\n\n"현재 중앙 엘리베이터는 [점검 중]이라 탑승할 수 없습니다!\n\n1학년 2반 교실로 들어가 1차 관문 보스 [👾 가죽 골렘]을 먼저 토벌하고 [🪪 엘리베이터 작동권]을 획득해야 엘리베이터를 가동할 수 있습니다!"'
        );
        return;
      }

      // 2. 엘리베이터 작동권 장착 여부 검사
      if (!this.isElevatorPassEquipped()) {
        if (this.hasItem('equip_elevator_pass')) {
          const equipNow = confirm(
            '🛗 [엘리베이터 키 미인식]\n\n가방에 [🪪 엘리베이터 작동권]이 있지만 장신구 슬롯에 장착되지 않았습니다!\n\n지금 바로 [🪪 엘리베이터 작동권]을 장착하고 엘리베이터를 가동하시겠습니까?'
          );
          if (equipNow) {
            this.equipItem('equip_elevator_pass');
            this.showToast('🪪 엘리베이터 작동권을 장착했습니다!', 'success');
          } else {
            return;
          }
        } else {
          // 혹시 골렘은 잡았는데 작동권이 인벤토리에 없는 경우 (소급 자동 지급)
          this.addItem('equip_elevator_pass', '엘리베이터 작동권', 1, '🪪', {
            type: 'equipment',
            slot: 'accessory',
            isQuestItem: true,
            stats: { atk: 0, def: 0, hp: 0 },
            effect: '🛗 중앙 엘리베이터 가동 인가증'
          });
          const equipNow = confirm(
            '🎉 [작동권 발급]\n\n골렘 토벌 기록이 확인되어 [🪪 엘리베이터 작동권]이 지급되었습니다!\n\n지금 바로 장착하고 엘리베이터를 가동하시겠습니까?'
          );
          if (equipNow) {
            this.equipItem('equip_elevator_pass');
            this.showToast('🪪 엘리베이터 작동권을 장착했습니다!', 'success');
          } else {
            return;
          }
        }
      }

      // 3. 1학년 복도 -> 운동장 (10G 소모)
      if (this.playerData.gold < 10) {
        alert(
          `❌ [엘리베이터 통행료 부족]\n\n운동장으로 내려가려면 10G(골드)가 필요합니다!\n(현재 보유 골드: ${this.playerData.gold}G)\n\n교탁(골드)이나 교실에서 퀴즈를 풀어 골드를 모아보세요!`
        );
        return;
      }

      const goDown = confirm(
        `🛗 [중앙 엘리베이터 가동]\n\n10G를 지불하고 숭실 운동장으로 내려가시겠습니까?\n(현재 보유 골드: ${this.playerData.gold}G ➔ 지불 후: ${this.playerData.gold - 10}G)`
      );
      if (goDown) {
        this.addGold(-10);
        if (window.AudioManager) window.AudioManager.playSelect();
        this.engine.triggerFadeWarp(() => {
          this.engine.warpToRoom('playground', '숭실 운동장', 80 * 32, 5 * 32);
        });
      }
    }
  }

  handleSecretLocker() {
    const lockerKey = 'soongsil_secret_locker_' + (this.playerData.studentId || 'default');
    const alreadyFound = !!(this.playerData.hasOpenedSecretLocker || localStorage.getItem(lockerKey) === 'true');

    if (alreadyFound && !this.playerData.isTeacher) {
      alert('🤫 [철제 사물함]\n\n사물함 구석이 텅 비어 있습니다.');
      return;
    }

    // 4대 학교 기본 제작 재료 아이템 풀
    const materials = [
      { id: 'item_wood', name: '단단한 목재', icon: '🪵', meta: { type: 'material', effect: '장비 제작 기본 재료' } },
      { id: 'item_herb', name: '향긋한 허브', icon: '🌿', meta: { type: 'material', effect: '물약 및 주문서 제작 재료' } },
      { id: 'item_forsythia', name: '노란 개나리 꽃잎', icon: '🌼', meta: { type: 'material', effect: '교화 개나리 장신구 및 주홍 물약 재료' } },
      { id: 'item_ginkgo', name: '황금 은행잎', icon: '🍂', meta: { type: 'material', effect: '교목 은행나무 부적 및 부활 주문서 재료' } }
    ];

    const chosen = materials[Math.floor(Math.random() * materials.length)];
    const count = Math.floor(Math.random() * 5) + 1; // 1~5개

    this.addItem(chosen.id, chosen.name, count, chosen.icon, chosen.meta);
    this.playerData.hasOpenedSecretLocker = true;
    try {
      localStorage.setItem(lockerKey, 'true');
    } catch (e) {}
    this.saveProgress();

    if (window.AudioManager) window.AudioManager.playFanfare();

    alert(
      `🤫 [비밀의 철제 사물함 발견!]\n\n누군가 1학년 2반 구석 사물함에 깜빡 두고 간\n[${chosen.icon} ${chosen.name} x${count}개]를 찾았습니다!\n\n(가방(B)에 안전하게 보관되었습니다.)`
    );
  }

  // 마스코트 숭실이 첫 대화 입학 축하 선물 이벤트
  handleMascotInteraction() {
    const giftKey = 'soongsil_gift_' + (this.playerData.studentId || 'default');
    const alreadyReceived = !!(this.playerData.hasReceivedSoongsilGift || localStorage.getItem(giftKey) === 'true');

    if (!alreadyReceived && !this.playerData.isTeacher) {
      this.openSoongsilGiftModal();
    } else {
      alert(
        `🐶 [마스코트 숭실이 - 조작법 가이드]\n\n"멍멍! 안녕! 나는 숭실중 마스코트 숭실이야! 🐾\n기본 조작법을 알려줄게!\n\n🎮 [이동 방법]\n• 키보드: WASD 키 또는 방향키\n• 태블릿: 화면 왼쪽 아래의 반투명 조이스틱 패드\n\n🟢 [상호작용 / 대화 / 입장]\n• 화면 우측 초록색 [SPACE] 버튼 터치!\n• 또는 키보드 Spacebar / Enter 키\n• 문, 책상, 게시판, 친구, 선생님 앞에서 SPACE를 눌러봐!"`
      );
    }
  }

  openSoongsilGiftModal() {
    const modal = document.getElementById('modal-soongsil-gift');
    if (modal) modal.classList.remove('hidden');
  }

  claimSoongsilGift(type) {
    let chosenItem = null;
    if (type === 'sword') {
      chosenItem = {
        id: 'equip_wood_sword',
        name: '나무검',
        icon: '🗡️',
        meta: { type: 'equipment', slot: 'weapon', stats: { atk: 15, def: 0, hp: 0 }, effect: '공격력 +15' }
      };
    } else if (type === 'armor') {
      chosenItem = {
        id: 'equip_wood_armor',
        name: '나무갑옷',
        icon: '🛡️',
        meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 15, hp: 15 }, effect: '방어력 +15, 체력 +15' }
      };
    } else if (type === 'helmet') {
      chosenItem = {
        id: 'equip_wood_helmet',
        name: '나무투구',
        icon: '🪖',
        meta: { type: 'equipment', slot: 'helmet', stats: { atk: 0, def: 8, hp: 25 }, effect: '방어력 +8, 체력 +25' }
      };
    }

    if (!chosenItem) return;

    this.addItem(chosenItem.id, chosenItem.name, 1, chosenItem.icon, chosenItem.meta);
    this.playerData.hasReceivedSoongsilGift = true;
    try {
      localStorage.setItem('soongsil_gift_' + (this.playerData.studentId || 'default'), 'true');
    } catch (e) {}
    this.saveProgress();

    const modal = document.getElementById('modal-soongsil-gift');
    if (modal) modal.classList.add('hidden');

    if (window.AudioManager) window.AudioManager.playFanfare();

    alert(
      `🎉 [숭실이의 입학 축하 선물 지급 완료!]\n\n숭실이가 준 [${chosenItem.icon} ${chosenItem.name}]을(를) 받았습니다!\n\n🎒 가방(B 버튼)을 열어 터치하면 즉시 장착하여 전투력(공격력/방어력)을 올릴 수 있어 멍!`
    );
  }

  initModals() {
    const checkIsTeacher = document.getElementById('check-is-teacher');
    const teacherPwdField = document.getElementById('teacher-pwd-field');
    const studentCustomBox = document.getElementById('student-customization-box');
    const groupStudentId = document.getElementById('group-student-id');
    const groupStudentNickname = document.getElementById('group-student-nickname');
    const teacherNoticeBanner = document.getElementById('teacher-notice-banner');
    const teacherPwdInput = document.getElementById('input-teacher-pwd');

    if (checkIsTeacher && teacherPwdField) {
      checkIsTeacher.addEventListener('change', () => {
        if (checkIsTeacher.checked) {
          teacherPwdField.classList.remove('hidden');
          if (teacherNoticeBanner) teacherNoticeBanner.classList.remove('hidden');
          if (groupStudentId) groupStudentId.style.display = 'none';
          if (groupStudentNickname) groupStudentNickname.style.display = 'none';
          if (studentCustomBox) studentCustomBox.style.display = 'none';
          if (teacherPwdInput) {
            teacherPwdInput.focus();
            teacherPwdInput.select();
          }
        } else {
          teacherPwdField.classList.add('hidden');
          if (teacherNoticeBanner) teacherNoticeBanner.classList.add('hidden');
          if (groupStudentId) groupStudentId.style.display = 'block';
          if (groupStudentNickname) groupStudentNickname.style.display = 'block';
          if (studentCustomBox) studentCustomBox.style.display = 'block';
        }
      });
    }

    // Enter 키로 즉시 게임 시작
    const handleLoginEnter = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const startBtn = document.getElementById('btn-start-game');
        if (startBtn) startBtn.click();
      }
    };
    if (teacherPwdInput) teacherPwdInput.addEventListener('keydown', handleLoginEnter);

    // 캐릭터 커스터마이징 (머리색 3종, 옷 색상 3종 & 실시간 미리보기)
    let selectedHair = 'black';
    let selectedOutfit = 'red';

    const previewCanvas = document.getElementById('custom-char-preview');
    const updatePreview = () => {
      if (!previewCanvas || !this.engine) return;
      const ctx = previewCanvas.getContext('2d');
      ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      // Soft round shadow at the feet
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(28, 67, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw crisp character sprite (48x64)
      const spr = this.engine.getCharacterSprite({
        dir: 'down',
        frame: 0,
        teacher: false,
        hairColor: selectedHair,
        outfitColor: selectedOutfit,
        blink: false,
        ko: false,
        gear: {}
      });
      ctx.drawImage(spr, 4, 5);
    };

    const hairGroup = document.getElementById('hair-color-options');
    if (hairGroup) {
      hairGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-custom-pill');
        if (!btn) return;
        hairGroup.querySelectorAll('.btn-custom-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedHair = btn.dataset.hair || 'black';
        updatePreview();
      });
    }

    const outfitGroup = document.getElementById('outfit-color-options');
    if (outfitGroup) {
      outfitGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-custom-pill');
        if (!btn) return;
        outfitGroup.querySelectorAll('.btn-custom-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedOutfit = btn.dataset.outfit || 'red';
        updatePreview();
      });
    }

    // 학생 마지막 학번 및 세이브 데이터 자동 완성 (서버 + 로컬 동기화)
    const studentIdInput = document.getElementById('input-student-id');
    const syncBadge = document.getElementById('student-id-sync-badge');

    const syncStudentIdUI = async (sId) => {
      sId = (sId || '').trim();
      if (!sId || sId === '교사' || sId.length < 2) {
        if (syncBadge) syncBadge.innerHTML = '';
        return;
      }
      if (syncBadge) {
        syncBadge.innerHTML = `<span style="color:#94a3b8;">🔍 서버 연동 상태 확인 중...</span>`;
      }
      const saved = await this.getBestProgress(sId);
      if (saved) {
        if (saved.name) {
          const nicknameInput = document.getElementById('input-nickname');
          if (nicknameInput) nicknameInput.value = saved.name;
        }
        if (saved.hairColor && hairGroup) {
          selectedHair = saved.hairColor;
          hairGroup.querySelectorAll('.btn-custom-pill').forEach(b => {
            b.classList.toggle('active', b.dataset.hair === selectedHair);
          });
        }
        if (saved.outfitColor && outfitGroup) {
          selectedOutfit = saved.outfitColor;
          outfitGroup.querySelectorAll('.btn-custom-pill').forEach(b => {
            b.classList.toggle('active', b.dataset.outfit === selectedOutfit);
          });
        }
        updatePreview();
        if (syncBadge) {
          const saveDateStr = saved.updatedAt ? new Date(saved.updatedAt).toLocaleDateString() : '최근';
          syncBadge.innerHTML = `<span style="color:#4ade80; font-weight:700;">✨ [누적 세이브 확인] Lv.${saved.level || 1} ${saved.name || ''} · ${saved.gold || 0}G (${saveDateStr})</span>`;
        }
      } else {
        if (syncBadge) {
          syncBadge.innerHTML = `<span style="color:#60a5fa;">🌱 신규 모험가입니다. (이름을 입력하면 서버에 자동 저장됩니다)</span>`;
        }
      }
    };

    if (studentIdInput) {
      studentIdInput.addEventListener('blur', () => syncStudentIdUI(studentIdInput.value));
      studentIdInput.addEventListener('input', () => {
        const val = studentIdInput.value.trim();
        if (val.length >= 4) {
          syncStudentIdUI(val);
        }
      });
      studentIdInput.addEventListener('keydown', handleLoginEnter);
    }

    const nicknameInput = document.getElementById('input-nickname');
    if (nicknameInput) {
      nicknameInput.addEventListener('keydown', handleLoginEnter);
    }

    try {
      const lastStudentId = localStorage.getItem('soongsil_last_student_id');
      if (lastStudentId) {
        if (studentIdInput) studentIdInput.value = lastStudentId;
        syncStudentIdUI(lastStudentId);
      }
    } catch (e) {
      console.warn('LocalStorage access warning:', e);
    }

    // 초기 캐릭터 실시간 미리보기 렌더링
    updatePreview();

    // Tablet & Desktop Fullscreen Helper Functions
    const requestFullscreenSafe = () => {
      try {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          docEl.msRequestFullscreen();
        }
      } catch (e) {}
    };

    const exitFullscreenSafe = () => {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } catch (e) {}
    };

    document.getElementById('btn-start-game').addEventListener('click', async () => {
      const checkFs = document.getElementById('check-auto-fullscreen');
      if (checkFs && checkFs.checked) {
        requestFullscreenSafe();
      }

      const pwdInput = document.getElementById('input-teacher-pwd');
      const enteredPwd = (pwdInput ? pwdInput.value : '').trim();
      // 교사 체크박스가 활성화되었거나, 교사 암호 입력칸에 암호(03220322)가 입력된 경우 교사 접속 판정
      const isTeacher = (checkIsTeacher && checkIsTeacher.checked) || (enteredPwd === '03220322');
      let name = document.getElementById('input-nickname').value.trim();
      let studentId = document.getElementById('input-student-id').value.trim();
      const grade = parseInt(document.querySelector('input[name="server-grade"]:checked').value) || 1;

      if (!this.isServerOnline && !isTeacher) {
        const proceed = confirm('⚠️ 현재 서버 응답이 지연되거나 오프라인 상태입니다.\n\n계속 입장하시겠습니까?');
        if (!proceed) return;
      }

      if (isTeacher) {
        if (enteredPwd !== '03220322') {
          alert('🔒 교사 인증 암호가 일치하지 않습니다.');
          if (pwdInput) {
            pwdInput.focus();
            pwdInput.select();
          }
          return;
        }

        // 교사 계정 접속: 학번과 이름을 완전히 무시하고 마스터 프로필('교사', '갓준철') 적용
        name = '갓준철';
        studentId = '교사';

        this.playerData.isTeacher = true;
        this.playerData.teacherPwd = enteredPwd;
        this.playerData.baseHp = 9999;
        this.playerData.hp = 9999;
        this.playerData.maxHp = 9999;
        this.playerData.baseAtk = 9999;
        this.playerData.atk = 9999;
        this.playerData.baseDef = 9999;
        this.playerData.def = 9999;
        this.playerData.gold = 999999;

        // 교사에게 구현된 모든 아이템 9999개씩 지급!
        this.playerData.inventory = [];
        for (const [key, itemInfo] of Object.entries(ALL_GAME_ITEMS)) {
          this.addItem(key, itemInfo.name, 9999, itemInfo.icon, itemInfo.meta);
        }

        this.engine.player.isTeacher = true;
        this.engine.player.hasRunningShoes = true;
        this.engine.player.speed = 4.0; // 교사 기본 이동속도 4.0 (Shift 시 7.6)
        this.engine.player.name = name;

        const gmPanel = document.getElementById('gm-panel');
        if (gmPanel) gmPanel.classList.remove('hidden');
      } else {
        // 일반 학생 접속: 학번 및 이름 필수 검증
        if (!studentId) {
          alert('학번을 입력해 주세요! (예: 10101)');
          document.getElementById('input-student-id').focus();
          return;
        }
        if (!name) {
          alert('이름을 입력해 주세요! (예: 홍길동)');
          document.getElementById('input-nickname').focus();
          return;
        }
        this.playerData.isTeacher = false;
        this.playerData.teacherPwd = '';
        this.engine.player.isTeacher = false;
        const gmPanel = document.getElementById('gm-panel');
        if (gmPanel) gmPanel.classList.add('hidden');

        // 이전 테스트 잔여 글로벌 플래그 초기화 (학생별 개별 계정 검증 보장)
        try {
          localStorage.removeItem('soongsil_first_boss_cleared_global');
          localStorage.removeItem('soongsil_dragon_cleared_global');
          localStorage.removeItem('soongsil_cerberus_cleared_global');
        } catch (e) {}

        // 학생 세이브 데이터 복구 (서버 & 로컬 이중 동기화)
        const saved = await this.getBestProgress(studentId);
        if (saved) {
          name = saved.name || name;
          this.playerData.level = saved.level || 1;
          this.playerData.exp = saved.exp || 0;
          this.playerData.gold = saved.gold !== undefined ? saved.gold : 10;
          this.playerData.baseHp = saved.baseHp || 100;
          this.playerData.hp = saved.baseHp || 100;
          this.playerData.baseAtk = saved.baseAtk || 10;
          this.playerData.baseDef = saved.baseDef || 2;
          this.playerData.inventory = Array.isArray(saved.inventory) ? saved.inventory : [];
          this.playerData.equipment = saved.equipment || { weapon: null, helmet: null, armor: null, shoes: null, accessory: null, accessory2: null };
          if (!('shoes' in this.playerData.equipment)) {
            this.playerData.equipment.shoes = null;
          }
          if (!('accessory2' in this.playerData.equipment)) {
            this.playerData.equipment.accessory2 = null;
          }
          this.playerData.isAccessory2Unlocked = !!saved.isAccessory2Unlocked;

          // Filter out deleted items (용의 심장, 아이스 물약, 백호 수호 부적)
          const DELETED_IDS = ['item_dragon_heart', 'item_ice_potion', 'equip_tiger_amulet'];
          this.playerData.inventory = (this.playerData.inventory || []).filter(i => i && !DELETED_IDS.includes(i.item));
          if (this.playerData.equipment) {
            for (const sKey of Object.keys(this.playerData.equipment)) {
              if (this.playerData.equipment[sKey] && DELETED_IDS.includes(this.playerData.equipment[sKey].item)) {
                this.playerData.equipment[sKey] = null;
              }
            }
          }
          if (saved.hairColor) selectedHair = saved.hairColor;
          if (saved.outfitColor) selectedOutfit = saved.outfitColor;
          this.playerData.hasReceivedSoongsilGift = !!(saved.hasReceivedSoongsilGift || (studentId && localStorage.getItem('soongsil_gift_' + studentId) === 'true'));
          this.playerData.hasOpenedSecretLocker = !!(saved.hasOpenedSecretLocker || (studentId && localStorage.getItem('soongsil_secret_locker_' + studentId) === 'true'));
          this.playerData.hasCheckedMirror = !!(saved.hasCheckedMirror || (studentId && localStorage.getItem('soongsil_mirror_' + studentId) === 'true'));
          this.playerData.hasOpenedLostBox = !!(saved.hasOpenedLostBox || (studentId && localStorage.getItem('soongsil_lost_box_' + studentId) === 'true'));
          this.playerData.hasClearedFirstBoss = !!(saved.hasClearedFirstBoss || (studentId && localStorage.getItem('soongsil_first_boss_cleared_' + studentId) === 'true'));
          this.playerData.hasClearedDragonRaid = !!(saved.hasClearedDragonRaid || (studentId && localStorage.getItem('soongsil_dragon_cleared_' + studentId) === 'true'));
          this.playerData.hasClearedCerberusRaid = !!(saved.hasClearedCerberusRaid || (studentId && localStorage.getItem('soongsil_cerberus_cleared_' + studentId) === 'true'));
          this.playerData.titles = Array.isArray(saved.titles) ? saved.titles : [];
          this.playerData.equippedTitle = saved.equippedTitle || null;
          console.log(`[Storage] 학생(${studentId}) 누적 영구 데이터 복구 완료: Lv.${this.playerData.level}, ${this.playerData.gold}G, 인벤토리 ${this.playerData.inventory.length}종, 호칭: ${this.playerData.equippedTitle || '없음'}, 1차골렘클리어: ${this.playerData.hasClearedFirstBoss}`);
        } else {
          this.playerData.hasReceivedSoongsilGift = (studentId && localStorage.getItem('soongsil_gift_' + studentId) === 'true');
          this.playerData.hasOpenedSecretLocker = (studentId && localStorage.getItem('soongsil_secret_locker_' + studentId) === 'true');
          this.playerData.hasCheckedMirror = (studentId && localStorage.getItem('soongsil_mirror_' + studentId) === 'true');
          this.playerData.hasOpenedLostBox = (studentId && localStorage.getItem('soongsil_lost_box_' + studentId) === 'true');
          this.playerData.hasClearedFirstBoss = !!(studentId && localStorage.getItem('soongsil_first_boss_cleared_' + studentId) === 'true');
          this.playerData.hasClearedDragonRaid = !!(studentId && localStorage.getItem('soongsil_dragon_cleared_' + studentId) === 'true');
          this.playerData.hasClearedCerberusRaid = !!(studentId && localStorage.getItem('soongsil_cerberus_cleared_' + studentId) === 'true');
          this.playerData.titles = [];
          this.playerData.equippedTitle = null;
        }
        try {
          localStorage.setItem('soongsil_last_student_id', studentId);
        } catch (e) {}

        // 골렘 클리어 학생 엘리베이터 작동권 소급 보장
        if (this.playerData.hasClearedFirstBoss && !this.hasItem('equip_elevator_pass') && !this.isItemEquipped('equip_elevator_pass')) {
          this.addItem('equip_elevator_pass', '엘리베이터 작동권', 1, '🪪', {
            type: 'equipment',
            slot: 'accessory',
            isQuestItem: true,
            stats: { atk: 0, def: 0, hp: 0 },
            effect: '🛗 중앙 엘리베이터 가동 인가증'
          });
        }
      }

      this.playerData.name = name;
      this.playerData.studentId = isTeacher ? '교사' : studentId;
      this.playerData.grade = grade;
      this.playerData.avatar = 'student_m1';
      this.playerData.hairColor = isTeacher ? 'teacher' : selectedHair;
      this.playerData.outfitColor = isTeacher ? 'gold' : selectedOutfit;
      this.engine.player.hairColor = this.playerData.hairColor;
      this.engine.player.outfitColor = this.playerData.outfitColor;

      this.updatePlayerNameDisplay();
      this.hudLevel.innerText = `Lv.${this.playerData.level}`;
      this.hudGold.innerText = this.playerData.gold;
      const studentIdEl = document.getElementById('side-student-id');
      if (studentIdEl) studentIdEl.innerText = isTeacher ? '교사' : studentId;
      this.recalcCombatStats();
      this.updateExpBar();

      // 시작 시점 프로필 즉시 영구 저장 동기화 (일반 학생만 저장)
      if (!isTeacher) {
        this.saveProgress();
      }

      this.quizManager.loadQuestions(grade);
      this.craftingManager.loadRecipes(grade);

      this.networkManager.connect(this.playerData);
      this.modalLogin.classList.add('hidden');
      this.updateDashButtonUI();
      this.startLoop();
      this.initAutoHpRegen();

      // 60초 주기 자동 저장 (서버 부하 최소화 스마트 감지) & 브라우저 닫기/새로고침 시 비콘 백업
      if (!this.autoSaveInterval) {
        this.autoSaveInterval = setInterval(() => this.saveProgress(), 60000);
      }
      if (!window.__soongsilBeforeUnloadBound) {
        window.__soongsilBeforeUnloadBound = true;
        window.addEventListener('beforeunload', () => {
          if (this.playerData && !this.playerData.isTeacher && this.playerData.studentId && this.playerData.studentId !== '교사') {
            const saveData = {
              name: this.playerData.name,
              studentId: this.playerData.studentId,
              grade: this.playerData.grade,
              level: this.playerData.level,
              exp: this.playerData.exp,
              gold: this.playerData.gold,
              baseHp: this.playerData.baseHp,
              baseAtk: this.playerData.baseAtk,
              baseDef: this.playerData.baseDef,
              inventory: this.playerData.inventory,
              equipment: this.playerData.equipment,
              isAccessory2Unlocked: this.playerData.isAccessory2Unlocked,
              hairColor: this.playerData.hairColor,
              outfitColor: this.playerData.outfitColor,
              hasReceivedSoongsilGift: !!this.playerData.hasReceivedSoongsilGift,
              hasOpenedSecretLocker: !!this.playerData.hasOpenedSecretLocker,
              hasCheckedMirror: !!this.playerData.hasCheckedMirror,
              hasOpenedLostBox: !!this.playerData.hasOpenedLostBox,
              hasClearedDragonRaid: !!this.playerData.hasClearedDragonRaid,
              hasClearedCerberusRaid: !!this.playerData.hasClearedCerberusRaid,
              updatedAt: Date.now()
            };
            try {
              localStorage.setItem('soongsil_save_' + this.playerData.studentId, JSON.stringify(saveData));
              if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/save-progress', JSON.stringify({ studentId: saveData.studentId, progress: saveData }));
              }
            } catch (e) {}
          }
        });
      }
    });

    // Sound Toggle Button
    const btnToggleSound = document.getElementById('btn-toggle-sound');
    if (btnToggleSound && window.AudioManager) {
      window.AudioManager.updateMuteButtonUI();
      btnToggleSound.addEventListener('click', () => {
        window.AudioManager.toggleMute();
      });
    }

    // Tablet & Desktop Fullscreen Toggle Button (상단 탭/주소창 숨기기)
    const btnToggleFs = document.getElementById('btn-toggle-fullscreen');
    const updateFsIcon = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
      if (btnToggleFs) {
        btnToggleFs.innerHTML = isFs ? '🗗' : '⛶';
        btnToggleFs.title = isFs ? '전체화면 종료' : '전체화면 (상단 탭/주소창 숨기기)';
      }
    };

    if (btnToggleFs) {
      btnToggleFs.addEventListener('click', () => {
        const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
        if (!isFs) {
          requestFullscreenSafe();
        } else {
          exitFullscreenSafe();
        }
      });
    }

    document.addEventListener('fullscreenchange', updateFsIcon);
    document.addEventListener('webkitfullscreenchange', updateFsIcon);

    // Inventory Modal
    this.currentInvTab = 'all';
    document.getElementById('btn-inventory').addEventListener('click', () => {
      if (window.AudioManager) window.AudioManager.playSelect();
      this.openInventory();
    });
    document.getElementById('btn-close-inv-x').addEventListener('click', () => this.modalInventory.classList.add('hidden'));

    // Inventory Category Filter Tabs
    const invTabContainer = document.getElementById('inv-tab-container');
    if (invTabContainer) {
      invTabContainer.querySelectorAll('.inv-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (window.AudioManager) window.AudioManager.playSelect();
          invTabContainer.querySelectorAll('.inv-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentInvTab = btn.getAttribute('data-tab') || 'all';
          this.openInventory();
        });
      });
    }

    // Switch between Inventory and Equipment Modals
    const btnSwitchToEquip = document.getElementById('btn-switch-to-equip');
    if (btnSwitchToEquip) {
      btnSwitchToEquip.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playSelect();
        this.modalInventory.classList.add('hidden');
        this.openEquipmentModal();
      });
    }
    const btnSwitchToInv = document.getElementById('btn-switch-to-inv');
    if (btnSwitchToInv) {
      btnSwitchToInv.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playSelect();
        this.modalEquipment.classList.add('hidden');
        this.openInventory();
      });
    }

    // Equipment Modal
    const btnEquipment = document.getElementById('btn-equipment');
    if (btnEquipment) {
      btnEquipment.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playSelect();
        this.openEquipmentModal();
      });
    }
    const btnCloseEquipX = document.getElementById('btn-close-equip-x');
    if (btnCloseEquipX) {
      btnCloseEquipX.addEventListener('click', () => this.modalEquipment.classList.add('hidden'));
    }

    // Soongsil Mascot Gift Modal
    const modalSoongsil = document.getElementById('modal-soongsil-gift');
    const btnCloseSoongsilX = document.getElementById('btn-close-soongsil-x');
    if (btnCloseSoongsilX && modalSoongsil) {
      btnCloseSoongsilX.addEventListener('click', () => modalSoongsil.classList.add('hidden'));
    }
    const btnClaimSword = document.getElementById('btn-claim-sword');
    if (btnClaimSword) {
      btnClaimSword.addEventListener('click', () => this.claimSoongsilGift('sword'));
    }
    const btnClaimArmor = document.getElementById('btn-claim-armor');
    if (btnClaimArmor) {
      btnClaimArmor.addEventListener('click', () => this.claimSoongsilGift('armor'));
    }
    const btnClaimHelmet = document.getElementById('btn-claim-helmet');
    if (btnClaimHelmet) {
      btnClaimHelmet.addEventListener('click', () => this.claimSoongsilGift('helmet'));
    }

    // Boss Raid Modal
    const btnCloseBossX = document.getElementById('btn-close-boss-x');
    if (btnCloseBossX) {
      btnCloseBossX.addEventListener('click', () => this.modalBossRaid.classList.add('hidden'));
    }
    const btnRaidNextTurn = document.getElementById('btn-raid-next-turn');
    if (btnRaidNextTurn) {
      btnRaidNextTurn.addEventListener('click', () => this.loadNextBossQuestion());
    }
    const btnRedPot = document.getElementById('btn-raid-use-red-potion');
    if (btnRedPot) {
      btnRedPot.addEventListener('click', () => {
        if (this.usePotion('item_red_potion')) {
          this.updateBossRaidUI();
        }
      });
    }
    const btnOrangePot = document.getElementById('btn-raid-use-orange-potion');
    if (btnOrangePot) {
      btnOrangePot.addEventListener('click', () => {
        if (this.usePotion('item_orange_potion')) {
          this.updateBossRaidUI();
        }
      });
    }

    const btnReviveScroll = document.getElementById('btn-raid-use-revive-scroll');
    if (btnReviveScroll) {
      btnReviveScroll.addEventListener('click', () => {
        this.attemptUseReviveScroll();
      });
    }

    // Revival Offer Modal buttons (부활 주문서 수락 / 대기 유지)
    const btnAcceptRevive = document.getElementById('btn-accept-revive');
    if (btnAcceptRevive) {
      btnAcceptRevive.addEventListener('click', () => this.acceptReviveOffer());
    }
    const btnDeclineRevive = document.getElementById('btn-decline-revive');
    if (btnDeclineRevive) {
      btnDeclineRevive.addEventListener('click', () => this.declineReviveOffer());
    }

    // 1:1 Field Monster Battle Modal buttons
    const btnCloseBattleX = document.getElementById('btn-close-battle-x');
    if (btnCloseBattleX && this.modalFieldBattle) {
      btnCloseBattleX.addEventListener('click', () => this.closeFieldBattleModal());
    }
    const btnBattleFlee = document.getElementById('btn-battle-flee');
    if (btnBattleFlee && this.modalFieldBattle) {
      btnBattleFlee.addEventListener('click', () => {
        const flee = confirm('🏃 [도망치기]\n\n몬스터와의 대결을 중단하고 농구장 코트로 돌아가시겠습니까?');
        if (flee) this.closeFieldBattleModal();
      });
    }
    const btnBattleNextTurn = document.getElementById('btn-battle-next-turn');
    if (btnBattleNextTurn) {
      btnBattleNextTurn.addEventListener('click', () => this.loadNextFieldBattleQuestion());
    }
    const btnBattleRedPot = document.getElementById('btn-battle-use-red-potion');
    if (btnBattleRedPot) {
      btnBattleRedPot.addEventListener('click', () => {
        if (this.usePotion('item_red_potion')) {
          this.updateFieldBattleUI();
        }
      });
    }
    const btnBattleOrangePot = document.getElementById('btn-battle-use-orange-potion');
    if (btnBattleOrangePot) {
      btnBattleOrangePot.addEventListener('click', () => {
        if (this.usePotion('item_orange_potion')) {
          this.updateFieldBattleUI();
        }
      });
    }

    // Leaderboard Modal Close
    const btnCloseLeaderboard = document.getElementById('btn-close-leaderboard');
    if (btnCloseLeaderboard) {
      btnCloseLeaderboard.addEventListener('click', () => {
        document.getElementById('modal-leaderboard').classList.add('hidden');
      });
    }
    const btnCloseLeaderboardX = document.getElementById('btn-close-leaderboard-x');
    if (btnCloseLeaderboardX) {
      btnCloseLeaderboardX.addEventListener('click', () => {
        document.getElementById('modal-leaderboard').classList.add('hidden');
      });
    }

    // Pop Quiz Modal Close
    const btnClosePopQuiz = document.getElementById('btn-close-pop-quiz');
    if (btnClosePopQuiz) {
      btnClosePopQuiz.addEventListener('click', () => {
        document.getElementById('modal-pop-quiz').classList.add('hidden');
      });
    }

    // Teacher GM Panel
    const btnNoclip = document.getElementById('btn-gm-noclip');
    if (btnNoclip) {
      btnNoclip.addEventListener('click', () => {
        this.engine.player.noclip = !this.engine.player.noclip;
        if (this.engine.player.noclip) {
          btnNoclip.innerText = '⚡ 공간돌파(벽통과): ON';
          btnNoclip.classList.add('active-noclip');
        } else {
          btnNoclip.innerText = '⚡ 공간돌파(벽통과): OFF';
          btnNoclip.classList.remove('active-noclip');
        }
      });
    }

    const selectWarp = document.getElementById('select-gm-warp');
    if (selectWarp) {
      selectWarp.addEventListener('change', (e) => {
        const val = e.target.value;
        if (!val) return;
        const parts = val.split('_');
        const floor = parseInt(parts[0]);
        const room = parts.slice(1).join('_');
        this.engine.teleportTo(floor, room);
        selectWarp.value = '';
      });
    }


    const btnTeacher = document.getElementById('btn-teacher');
    if (btnTeacher) {
      btnTeacher.addEventListener('click', () => {
        this.modalTeacher.classList.remove('hidden');
        this.requestStudentList();
      });
    }
    document.getElementById('btn-close-teacher-x').addEventListener('click', () => {
      this.modalTeacher.classList.add('hidden');
    });

    // Teacher Item & Gold Grant Button
    const btnGrant = document.getElementById('btn-admin-grant-item');
    if (btnGrant) {
      btnGrant.addEventListener('click', () => {
        const targetSocketId = document.getElementById('admin-grant-target').value;
        const itemKey = document.getElementById('admin-grant-item').value;
        const count = Math.max(1, parseInt(document.getElementById('admin-grant-count').value) || 1);
        const reason = (document.getElementById('admin-grant-reason').value || '').trim();

        if (this.networkManager.socket) {
          this.networkManager.socket.emit('teacher_grant_item', {
            pwd: this.playerData.teacherPwd || '03220322',
            targetSocketId,
            itemKey,
            count,
            reason
          });
        } else {
          alert('서버에 연결되어 있지 않습니다.');
        }
      });
    }
  }

  openTeacherTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => {
      if (b.getAttribute('data-tab') === tabId) b.classList.add('active');
      else b.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach(p => {
      if (p.id === tabId) p.classList.remove('hidden');
      else p.classList.add('hidden');
    });
    this.modalTeacher.classList.remove('hidden');
  }

  // =========================================================================
  // COMBAT STATS (Lv.1 ~ 100: Lv 1당 체력+1, 공격력+1, 방어력+1 / 교사는 9999 고정)
  // =========================================================================
  // =========================================================================
  // GEAR VISUAL SYNC (착용 장비를 캐릭터 외형에 반영 + 다른 학생에게 동기화)
  // =========================================================================
  syncGearVisual(force = false) {
    const eq = this.playerData.equipment || {};
    const gear = {
      weapon: eq.weapon ? eq.weapon.item : null,
      helmet: eq.helmet ? eq.helmet.item : null,
      armor: eq.armor ? eq.armor.item : null,
      accessory: eq.accessory ? eq.accessory.item : null
    };
    this.playerData.gear = gear;
    if (this.engine && this.engine.player) this.engine.player.gear = gear;

    const sig = JSON.stringify(gear);
    if (!force && sig === this._lastGearSig) return;
    this._lastGearSig = sig;

    const sock = this.networkManager && this.networkManager.socket;
    if (sock && sock.connected) sock.emit('player_gear_update', gear);
  }

  recalcCombatStats() {
    this.syncGearVisual();
    if (this.playerData.isTeacher) {
      this.playerData.atk = 9999;
      this.playerData.def = 9999;
      this.playerData.maxHp = 9999;
      this.playerData.hp = 9999;
      if (this.hudAtk) this.hudAtk.innerText = 9999;
      if (this.hudDef) this.hudDef.innerText = 9999;
      this.updateHpBar();
      return;
    }

    if (this.engine && this.engine.player) {
      this.engine.player.hasRunningShoes = !!(this.playerData.equipment && this.playerData.equipment.shoes) || !!this.playerData.isTeacher;
    }

    const lvBonus = Math.max(0, (this.playerData.level || 1) - 1);
    let bonusAtk = 0;
    let bonusDef = 0;
    let bonusHp = 0;

    if (this.playerData.equipment) {
      Object.values(this.playerData.equipment).forEach(eq => {
        if (eq) {
          if (eq.item && window.ALL_GAME_ITEMS && window.ALL_GAME_ITEMS[eq.item]?.meta?.stats) {
            eq.stats = window.ALL_GAME_ITEMS[eq.item].meta.stats;
            eq.effect = window.ALL_GAME_ITEMS[eq.item].meta.effect;
          }
          if (eq.stats) {
            bonusAtk += (eq.stats.atk || 0);
            bonusDef += (eq.stats.def || 0);
            bonusHp += (eq.stats.hp || 0);
          }
        }
      });
    }

    this.playerData.atk = this.playerData.baseAtk + lvBonus + bonusAtk;
    this.playerData.def = this.playerData.baseDef + lvBonus + bonusDef;
    this.playerData.maxHp = this.playerData.baseHp + bonusHp;
    if (this.playerData.hp > this.playerData.maxHp) {
      this.playerData.hp = this.playerData.maxHp;
    }

    if (this.hudAtk) this.hudAtk.innerText = this.playerData.atk;
    if (this.hudDef) this.hudDef.innerText = this.playerData.def;
    this.updateHpBar();
  }

  updateHpBar() {
    const pct = Math.max(0, Math.min(100, Math.floor((this.playerData.hp / this.playerData.maxHp) * 100)));
    const txt = document.getElementById('side-hp-text');
    const fill = document.getElementById('side-hp-fill');
    if (txt) txt.innerText = `${this.playerData.hp} / ${this.playerData.maxHp}`;
    if (fill) fill.style.width = `${pct}%`;
  }

  // =========================================================================
  // AUTOMATIC HP REGENERATION SYSTEM (평상시 3초당 1 HP 자연 치유)
  // =========================================================================
  initAutoHpRegen() {
    if (this.hpRegenInterval) {
      clearInterval(this.hpRegenInterval);
    }
    this.hpRegenInterval = setInterval(() => {
      this.tickAutoHpRegen();
    }, 3000);
  }

  tickAutoHpRegen() {
    // 1. 로그인 여부 확인
    if (!this.playerData || !this.playerData.name) return;

    // 2. 기절(체력 0 또는 쓰러짐) 상태면 자동 회복 불가
    if (this.playerData.isFallen || this.playerData.hp <= 0) return;

    // 3. 이미 최대 체력인 경우 회복 불필요
    if (this.playerData.hp >= this.playerData.maxHp) return;

    // 4. 보스전 중에는 시간끌기 꼼수 방지를 위해 회복 정지 (보스 레이드 창이 열려있거나 1학년 2반 보스 교실인 경우)
    const isBossRaidOpen = this.modalBossRaid && !this.modalBossRaid.classList.contains('hidden');
    const isInBossRoom = this.engine && this.engine.player && this.engine.player.room === 'room_702';
    if (isBossRaidOpen || isInBossRoom) return;

    // 5. 체력 +1 자연 회복 및 UI 동기화
    this.playerData.hp = Math.min(this.playerData.maxHp, this.playerData.hp + 1);
    this.updateHpBar();

    const equipHp = document.getElementById('equip-total-hp');
    if (equipHp && this.modalEquipment && !this.modalEquipment.classList.contains('hidden')) {
      equipHp.innerText = `${this.playerData.hp} / ${this.playerData.maxHp}`;
    }
  }

  takeQuizDamage(amount) {
    if (!this.playerData || this.playerData.hp <= 0 || this.playerData.isFallen) return 0;

    const penalty = Math.max(1, amount || 1);
    this.playerData.hp = Math.max(0, this.playerData.hp - penalty);
    this.updateHpBar();

    const equipHp = document.getElementById('equip-total-hp');
    if (equipHp && this.modalEquipment && !this.modalEquipment.classList.contains('hidden')) {
      equipHp.innerText = `${this.playerData.hp} / ${this.playerData.maxHp}`;
    }

    // 체력이 0이 되어 탈진한 경우 안전하게 복도로 귀환
    if (this.playerData.hp <= 0) {
      this.playerData.hp = 0;
      this.playerData.isFallen = true;
      this.engine.player.isFallen = true;
      this.updateHpBar();

      if (this.quizManager && this.quizManager.modal) {
        this.quizManager.closeQuiz();
      }

      if (this.networkManager.socket) {
        this.networkManager.socket.emit('player_fallen', { name: this.playerData.name });
      }

      if (window.RPGDialog) {
        window.RPGDialog.show(
          '💀 체력 소진 (탈진)',
          '오답 누적 패널티로 체력이 모두 소진되어 쓰러졌습니다!\n안전을 위해 복도로 이동하며 체력이 15% 회복됩니다.',
          '😵',
          () => {
            this.respawnAtHallway();
          }
        );
      } else {
        this.respawnAtHallway();
      }
    }

    return penalty;
  }

  isItemEquipped(itemId) {
    return Object.values(this.playerData.equipment).some(eq => eq && eq.item === itemId);
  }

  equipItem(itemId) {
    const invItem = this.playerData.inventory.find(i => i.item === itemId);
    if (!invItem) return;

    let slot = invItem.slot || 'weapon';
    if (slot === 'accessory') {
      if (this.playerData.equipment.accessory && this.playerData.equipment.accessory.item === itemId) {
        this.unequipSlot('accessory');
        return;
      }
      if (this.playerData.equipment.accessory2 && this.playerData.equipment.accessory2.item === itemId) {
        this.unequipSlot('accessory2');
        return;
      }
      if (!this.playerData.equipment.accessory) {
        slot = 'accessory';
      } else if (this.playerData.isAccessory2Unlocked && !this.playerData.equipment.accessory2) {
        slot = 'accessory2';
      } else {
        slot = 'accessory';
      }
    } else {
      if (this.playerData.equipment[slot] && this.playerData.equipment[slot].item === itemId) {
        this.unequipSlot(slot);
        return;
      }
    }

    this.playerData.equipment[slot] = {
      item: invItem.item,
      name: invItem.name,
      icon: invItem.icon || '🗡️',
      slot: slot,
      stats: invItem.stats || { atk: 5, def: 0, hp: 0 },
      effect: invItem.effect || ''
    };

    if (slot === 'shoes') {
      this.engine.player.hasRunningShoes = true;
      this.updateDashButtonUI();
    }

    const prevMaxHp = this.playerData.maxHp;
    this.recalcCombatStats();
    if (this.playerData.maxHp > prevMaxHp) {
      this.playerData.hp += (this.playerData.maxHp - prevMaxHp);
      this.updateHpBar();
    }
    this.saveProgress();
    this.openInventory();
  }

  unequipSlot(slotKey) {
    if (!this.playerData.equipment[slotKey]) return;
    this.playerData.equipment[slotKey] = null;
    if (slotKey === 'shoes') {
      this.engine.player.hasRunningShoes = false;
      this.updateDashButtonUI();
    }
    this.recalcCombatStats();
    this.saveProgress();
    if (!this.modalInventory.classList.contains('hidden')) {
      this.openInventory();
    }
    if (!this.modalEquipment.classList.contains('hidden')) {
      this.openEquipmentModal();
    }
  }

  usePotion(itemId = 'item_hp_potion') {
    const pot = this.playerData.inventory.find(i => i.item === itemId);
    if (!pot || pot.count <= 0) {
      alert('보유한 포션이 없습니다.');
      return false;
    }

    if (this.playerData.hp >= this.playerData.maxHp) {
      alert(`이미 체력이 최대치입니다! (현재 HP: ${this.playerData.hp} / ${this.playerData.maxHp})\n보스전에서 체력이 깎였을 때 아껴두었다가 마셔보세요!`);
      return false;
    }

    const healAmount = pot.heal || 10;
    this.removeItem(itemId, 1);
    const beforeHp = this.playerData.hp;
    this.playerData.hp = Math.min(this.playerData.maxHp, this.playerData.hp + healAmount);
    const actualHealed = this.playerData.hp - beforeHp;
    if (this.playerData.hp > 0) {
      this.playerData.isFallen = false;
      if (this.engine && this.engine.player) {
        this.engine.player.isFallen = false;
      }
    }
    this.updateHpBar();
    this.saveProgress();

    alert(`🧪 [${pot.name}]을(를) 꿀꺽 마셨습니다!\n체력이 +${actualHealed} 회복되었습니다. (현재 HP: ${this.playerData.hp} / ${this.playerData.maxHp})`);

    if (!this.modalInventory.classList.contains('hidden')) {
      this.openInventory();
    }
    return true;
  }

  openInventory() {
    this.recalcCombatStats();
    this.invGoldDisplay.innerText = `${this.playerData.gold} G`;
    if (this.invAtkDisplay) this.invAtkDisplay.innerText = this.playerData.atk;
    if (this.invDefDisplay) this.invDefDisplay.innerText = this.playerData.def;
    this.invGrid.innerHTML = '';

    const currentTab = this.currentInvTab || 'all';

    // Filter items based on current category tab
    const filteredItems = this.playerData.inventory.filter(item => {
      const isEquip = (item.type === 'equipment' || item.item.startsWith('equip_'));
      const isPotion = (item.type === 'consumable' || item.item.includes('potion') || item.item.includes('scroll'));
      const isMaterial = !isEquip && !isPotion;

      if (currentTab === 'equipment') return isEquip;
      if (currentTab === 'consumable') return isPotion;
      if (currentTab === 'material') return isMaterial;
      return true; // 'all'
    });

    if (filteredItems.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.style.padding = '42px 16px';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.color = '#94a3b8';
      emptyMsg.style.fontWeight = '700';
      emptyMsg.style.fontSize = '14.5px';
      let tabName = '아이템';
      if (currentTab === 'equipment') tabName = '장비 아이템';
      else if (currentTab === 'consumable') tabName = '소비 아이템';
      else if (currentTab === 'material') tabName = '재료 아이템';
      emptyMsg.innerText = `🎒 보유 중인 ${tabName}이 없습니다.`;
      this.invGrid.appendChild(emptyMsg);
    } else {
      filteredItems.forEach(item => {
        const isEquip = (item.type === 'equipment' || item.item.startsWith('equip_'));
        const isPotion = (item.type === 'consumable' || item.item.includes('potion') || item.item.includes('scroll'));
        const isScroll = (item.item === 'item_revive_scroll');
        const equippedNow = isEquip && this.isItemEquipped(item.item);

        const card = document.createElement('div');
        card.className = 'inv-item-row' + (equippedNow ? ' is-equipped' : '');

        // Determine item stats & effect text badge
        let statBadgeHtml = '';
        const catalogMeta = ALL_GAME_ITEMS[item.item]?.meta || {};
        const stats = item.stats || item.meta?.stats || catalogMeta.stats;
        const effect = item.effect || item.meta?.effect || catalogMeta.effect;
        const heal = item.heal || item.meta?.heal || catalogMeta.heal;

        if (isEquip) {
          const parts = [];
          if (stats) {
            if (stats.atk) parts.push(`⚔️ ATK +${stats.atk}`);
            if (stats.def) parts.push(`🛡️ DEF +${stats.def}`);
            if (stats.hp) parts.push(`❤️ HP +${stats.hp}`);
          }
          const statText = parts.length > 0 ? parts.join(' · ') : (effect || '능력치 상승');
          statBadgeHtml = `<span class="inv-item-stat-badge">${statText}</span>`;
        } else if (isPotion) {
          if (isScroll) {
            statBadgeHtml = `<span class="inv-item-stat-badge potion" style="color:#c084fc;">💫 쓰러진 친구 50% 체력 부활</span>`;
          } else {
            const healAmount = heal || 10;
            statBadgeHtml = `<span class="inv-item-stat-badge potion">🧪 체력 +${healAmount} 즉시 회복</span>`;
          }
        } else {
          // Material
          const matDesc = effect || '장비 제작 및 상위 합성 재료';
          statBadgeHtml = `<span class="inv-item-stat-badge material">📦 ${matDesc}</span>`;
        }

        card.innerHTML = `
          <div class="inv-item-icon-box">
            <span>${item.icon || '📦'}</span>
            <span class="inv-item-count-badge">x${item.count}</span>
          </div>
          <div class="inv-item-details">
            <div class="inv-item-title-row">
              <span class="inv-item-name">${item.name}</span>
              ${equippedNow ? '<span class="inv-equipped-pill">E 장착중</span>' : ''}
            </div>
            ${statBadgeHtml}
          </div>
          <div class="inv-item-action-area"></div>
        `;

        const actionArea = card.querySelector('.inv-item-action-area');

        if (isEquip) {
          const btn = document.createElement('button');
          btn.className = 'btn-inv-action ' + (equippedNow ? 'btn-inv-equip-off' : 'btn-inv-equip-on');
          btn.innerText = equippedNow ? '해제' : '장착';
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.AudioManager) window.AudioManager.playSelect();
            this.equipItem(item.item);
          });
          card.style.cursor = 'pointer';
          card.addEventListener('click', () => {
            if (window.AudioManager) window.AudioManager.playSelect();
            this.equipItem(item.item);
          });
          actionArea.appendChild(btn);
        } else if (isPotion) {
          const btn = document.createElement('button');
          btn.className = 'btn-inv-action ' + (isScroll ? 'btn-inv-scroll' : 'btn-inv-potion');
          btn.innerText = isScroll ? '사용' : '마시기';
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isScroll) {
              this.attemptUseReviveScroll();
            } else {
              this.usePotion(item.item);
            }
          });
          card.style.cursor = 'pointer';
          card.addEventListener('click', () => {
            if (isScroll) {
              this.attemptUseReviveScroll();
            } else {
              this.usePotion(item.item);
            }
          });
          actionArea.appendChild(btn);
        } else {
          const tag = document.createElement('span');
          tag.className = 'inv-material-tag';
          tag.innerText = '재료';
          actionArea.appendChild(tag);
        }

        this.invGrid.appendChild(card);
      });
    }

    this.modalInventory.classList.remove('hidden');
  }

  openEquipmentModal() {
    this.recalcCombatStats();
    document.getElementById('equip-total-hp').innerText = `${this.playerData.hp} / ${this.playerData.maxHp}`;
    document.getElementById('equip-total-atk').innerText = this.playerData.atk;
    document.getElementById('equip-total-def').innerText = this.playerData.def;

    const container = document.getElementById('equip-slots-container');
    container.innerHTML = '';

    const isAcc2Unlocked = !!this.playerData.isAccessory2Unlocked;

    const slotDefinitions = [
      { key: 'helmet', title: '🪖 투구', emptyIcon: '🪖' },
      { key: 'armor', title: '🛡️ 갑옷', emptyIcon: '🛡️' },
      { key: 'weapon', title: '🗡️ 무기', emptyIcon: '🗡️' },
      { key: 'shoes', title: '👟 신발', emptyIcon: '👟' },
      { key: 'accessory', title: '💍 장신구 1', emptyIcon: '💍' },
      { 
        key: 'accessory2', 
        title: '💍 장신구 2', 
        emptyIcon: isAcc2Unlocked ? '💍' : '🔒',
        isLocked: !isAcc2Unlocked,
        lockMsg: '추후 퀘스트로 해금 예정'
      }
    ];

    slotDefinitions.forEach(sDef => {
      const card = document.createElement('div');

      if (sDef.isLocked) {
        card.className = 'equip-slot-card locked';
        card.style.cursor = 'pointer';
        card.innerHTML = `
          <div class="equip-slot-header">
            <span>${sDef.title}</span>
            <span style="color:#f87171; font-size:11px; font-weight:800; background:rgba(239,68,68,0.15); padding:2px 6px; border-radius:4px; border:1px solid rgba(239,68,68,0.3);">🔒 잠김</span>
          </div>
          <div class="equip-slot-body">
            <span class="equip-slot-icon" style="opacity:0.35;">🔒</span>
            <div class="equip-slot-info">
              <span class="equip-slot-name" style="color:#94a3b8; font-size:14px;">잠긴 슬롯</span>
              <span class="equip-slot-effect" style="color:#f87171; font-size:11.5px;">🔒 ${sDef.lockMsg}</span>
            </div>
          </div>
        `;
        card.addEventListener('click', () => {
          if (window.AudioManager && window.AudioManager.playDeny) window.AudioManager.playDeny();
          alert('🔒 장신구 2번 슬롯은 현재 잠겨 있습니다.\n추후 퀘스트를 클리어하면 해금되어 착용할 수 있습니다!');
        });
        container.appendChild(card);
        return;
      }

      const equipped = this.playerData.equipment && this.playerData.equipment[sDef.key];
      card.className = 'equip-slot-card' + (equipped ? ' equipped' : '');

      if (equipped) {
        card.style.cursor = 'pointer';
        card.innerHTML = `
          <div class="equip-slot-header">
            <span>${sDef.title}</span>
            <span style="color:#4ade80;">장착중</span>
          </div>
          <div class="equip-slot-body">
            <span class="equip-slot-icon">${equipped.icon}</span>
            <div class="equip-slot-info">
              <span class="equip-slot-name">${equipped.name}</span>
              <span class="equip-slot-effect">${equipped.effect || ''}</span>
            </div>
          </div>
        `;
        const btnUnequip = document.createElement('button');
        btnUnequip.className = 'btn-item-action btn-equip-off';
        btnUnequip.innerText = '해제';
        btnUnequip.addEventListener('click', (e) => {
          e.stopPropagation();
          this.unequipSlot(sDef.key);
        });
        card.addEventListener('click', () => this.unequipSlot(sDef.key));
        card.appendChild(btnUnequip);
      } else {
        card.style.cursor = 'pointer';
        card.innerHTML = `
          <div class="equip-slot-header">
            <span>${sDef.title}</span>
            <span style="color:#60a5fa; font-size:11px; font-weight:700;">+ 착용하기</span>
          </div>
          <div class="equip-slot-body">
            <span class="equip-slot-icon" style="opacity:0.35;">${sDef.emptyIcon}</span>
            <div class="equip-slot-info">
              <span class="equip-slot-name" style="color:#64748b;">(비어 있음)</span>
              <span class="equip-slot-effect" style="color:#93c5fd; font-size:11.5px;">클릭하여 가방에서 장착</span>
            </div>
          </div>
        `;
        card.addEventListener('click', () => {
          if (window.AudioManager) window.AudioManager.playSelect();
          this.modalEquipment.classList.add('hidden');
          this.currentInvTab = 'equipment';
          const tabContainer = document.getElementById('inv-tab-container');
          if (tabContainer) {
            tabContainer.querySelectorAll('.inv-tab-btn').forEach(b => {
              b.classList.toggle('active', b.getAttribute('data-tab') === 'equipment');
            });
          }
          this.openInventory();
        });
      }

      container.appendChild(card);
    });

    this.modalEquipment.classList.remove('hidden');
  }

  // =========================================================================
  // SEASON 1 BOSS RAID SYSTEM (1학년 2반 보스 레이드 & 교사 이벤트 연동)
  // =========================================================================
  openBossRaid(bossData) {
    this.recalcCombatStats();

    if (!window.BOSS_CONFIG.active) {
      if (this.playerData.isTeacher) {
        const goSetup = confirm(
          '⏳ 현재 보스레이드 이벤트가 [대기 중]입니다.\n\n[확인]: 보스레이드 이벤트 시작/옵션 설정창 열기\n[취소]: 교사 계정으로 즉시 테스트 전투 입장'
        );
        if (goSetup) {
          this.openTeacherTab('tab-boss-raid');
          return;
        }
      } else {
        alert('⏳ 현재 진행 중인 보스레이드 이벤트가 없습니다.\n선생님이 보스레이드를 시작하면 입장할 수 있습니다!');
        return;
      }
    }

    if (this.bossState.currentHp <= 0) {
      this.bossState.currentHp = window.BOSS_CONFIG.maxHp;
    }
    this.bossState.maxHp = window.BOSS_CONFIG.maxHp;
    this.bossState.hasAttacked = false;
    this.bossState.damageDealt = 0;

    const modeTag = window.BOSS_CONFIG.mode === 'coop' ? '협동 레이드' : '개인 레이드';
    document.getElementById('boss-raid-title').innerText = `${window.BOSS_CONFIG.name} [${modeTag}]`;
    document.getElementById('boss-name-label').innerText = window.BOSS_CONFIG.name;
    document.getElementById('raid-battle-log').innerHTML = `⚔️ 문제를 맞히면 내 공격력(${this.playerData.atk})으로 공격합니다.`;

    this.updateBossRaidUI();
    this.loadNextBossQuestion();
    this.modalBossRaid.classList.remove('hidden');
  }

  onBossRaidStateUpdate(state) {
    if (!state) return;
    if (state.active) {
      this.bossState.hasAttacked = false;
      this.bossState.damageDealt = 0;
    }
    window.BOSS_CONFIG = {
      ...window.BOSS_CONFIG,
      ...state
    };
    this.bossState.maxHp = state.maxHp || 3000;
    this.bossState.currentHp = state.currentHp !== undefined ? state.currentHp : this.bossState.maxHp;

    // WORLD_DATA의 1학년 2반 보스 이름/스탯도 동기화
    if (window.WORLD_DATA && WORLD_DATA.classroom_702 && WORLD_DATA.classroom_702.boss) {
      WORLD_DATA.classroom_702.boss.name = state.name || '👾 고목 골렘';
      WORLD_DATA.classroom_702.boss.maxHp = state.maxHp || 3000;
      WORLD_DATA.classroom_702.boss.atk = state.atk || 18;
      WORLD_DATA.classroom_702.boss.def = state.def || 5;
    }

    const badge = document.getElementById('admin-boss-status-badge');
    if (badge) {
      if (state.active) {
        badge.style.background = '#991b1b';
        badge.style.color = '#fef08a';
        badge.innerText = `🔥 레이드 진행중 (HP ${this.bossState.currentHp} / ${this.bossState.maxHp})`;
      } else {
        badge.style.background = '#334155';
        badge.style.color = '#cbd5e1';
        badge.innerText = '⏳ 대기중 (비활성)';
      }
    }

    if (!this.modalBossRaid.classList.contains('hidden')) {
      if (!state.active) {
        this.modalBossRaid.classList.add('hidden');
      } else {
        this.updateBossRaidUI();
      }
    }
  }

  onBossRaidHpSync(data) {
    if (!data) return;
    window.BOSS_CONFIG.currentHp = data.currentHp;
    window.BOSS_CONFIG.maxHp = data.maxHp;
    this.bossState.currentHp = data.currentHp;
    this.bossState.maxHp = data.maxHp;

    const badge = document.getElementById('admin-boss-status-badge');
    if (badge && window.BOSS_CONFIG.active) {
      badge.innerText = `🔥 레이드 진행중 (HP ${this.bossState.currentHp} / ${this.bossState.maxHp})`;
    }

    if (!this.modalBossRaid.classList.contains('hidden')) {
      this.updateBossRaidUI();
    }
  }

  onBossRaidCleared(data) {
    window.BOSS_CONFIG.active = false;
    const bName = data.bossName || window.BOSS_CONFIG.name || '';
    const myId = (this.networkManager && this.networkManager.socket) ? this.networkManager.socket.id : null;
    const myStudentId = this.playerData ? this.playerData.studentId : null;

    // 참가 여부 판정 (실제로 데미지를 1회 이상 입혔거나 서버 참가자 목록에 등록된 학생)
    const hasParticipated = (
      (data.participantIds && myId && data.participantIds.includes(myId)) ||
      (data.participantStudentIds && myStudentId && data.participantStudentIds.includes(myStudentId)) ||
      (this.bossState && (this.bossState.damageDealt > 0 || this.bossState.hasAttacked))
    );

    const isModalOpen = !this.modalBossRaid.classList.contains('hidden');
    const isInBossRoom = this.engine && this.engine.player && this.engine.player.room === 'room_702';
    const isInPlayground = this.engine && this.engine.player && this.engine.player.room === 'playground';

    // 1차 관문 보스(가죽 골렘): 반드시 직접 레이드에 참가하여 유효 공격을 가한 학생만 엘리베이터 해금 & 보상 수령!
    if (bName.includes('골렘') || bName.includes('golem')) {
      if (!hasParticipated) {
        if (isModalOpen || isInBossRoom) {
          alert('👾 [가죽 골렘 토벌 알림]\n\n급우들이 1차 관문 보스 [가죽 골렘]을 격파했습니다!\n\n※ 직접 골렘 레이드에 참가하여 1회 이상 유효 타격을 입혀야 중앙 엘리베이터 점검이 완료되어 운동장으로 갈 수 있습니다.\n(참가하지 못한 학생은 1학년 2반에서 언제든 다시 골렘 레이드에 도전할 수 있습니다!)');
          this.modalBossRaid.classList.add('hidden');
        }
        return;
      }
    }

    if (hasParticipated || isModalOpen || isInBossRoom || isInPlayground) {
      this.addGold(data.rewardGold || 100);
      this.addExp(data.rewardExp || 200);

      // 1. 체력회복 포션 (2~3개 확정 드랍: 빨간물약/주홍물약 랜덤 조합)
      const potCount = Math.floor(Math.random() * 2) + 2; // 2 or 3
      let droppedRed = 0, droppedOrange = 0;
      for (let i = 0; i < potCount; i++) {
        if (Math.random() < 0.5) {
          droppedRed++;
          this.addItem('item_red_potion', '빨간 물약', 1, '🍷', { type: 'consumable', heal: 10, effect: '체력 +10 회복' });
        } else {
          droppedOrange++;
          this.addItem('item_orange_potion', '주홍 물약', 1, '🧪', { type: 'consumable', heal: 25, effect: '체력 +25 회복' });
        }
      }

      const rewardItemsList = [];
      if (droppedRed > 0) rewardItemsList.push(`🍷 빨간 물약 x${droppedRed}`);
      if (droppedOrange > 0) rewardItemsList.push(`🧪 주홍 물약 x${droppedOrange}`);

      // 2. 개나리 반지 (5% 확률)
      if (Math.random() * 100 < 5) {
        this.addItem('equip_forsythia_ring', '성실의 개나리 반지', 1, '🌼', {
          type: 'equipment', slot: 'accessory', stats: { atk: 10, def: 10, hp: 20 }, effect: '공격력 +10, 방어력 +10, 체력 +20'
        });
        rewardItemsList.push('🌼 성실의 개나리 반지');
      }

      // 3. 가죽 골렘 전용 드랍 (엘리베이터 해금, 100% 작동권 지급, 100% 질긴 보스의 가죽, 25% 나무장비 1종)
      if (bName.includes('골렘') || bName.includes('golem')) {
        this.playerData.hasClearedFirstBoss = true;
        const studentId = this.playerData.studentId || '';
        if (studentId) {
          localStorage.setItem('soongsil_first_boss_cleared_' + studentId, 'true');
        }
        this.saveProgress(true);

        // 100% 확정 엘리베이터 작동권 지급 (중복 미소지 시)
        if (!this.hasItem('equip_elevator_pass') && !this.isItemEquipped('equip_elevator_pass')) {
          this.addItem('equip_elevator_pass', '엘리베이터 작동권', 1, '🪪', {
            type: 'equipment',
            slot: 'accessory',
            isQuestItem: true,
            stats: { atk: 0, def: 0, hp: 0 },
            effect: '🛗 중앙 엘리베이터 가동 인가증'
          });
          rewardItemsList.push('🪪 엘리베이터 작동권 (중앙 엘리베이터 가동 필수 장비!)');
        }

        // 확정 재료 가변 드랍 (1~2개 가죽 장비 제작 핵심)
        const bossLeatherCount = Math.floor(Math.random() * 2) + 1; // 1 or 2개 가변
        this.addItem('item_boss_leather', '질긴 보스의 가죽', bossLeatherCount, '🟫', { type: 'material', effect: '2티어 가죽 장비 핵심 제작 재료' });
        rewardItemsList.push(`🟫 질긴 보스의 가죽 x${bossLeatherCount}`);

        const roll = Math.random() * 100;
        if (roll < 25) {
          const woodGears = [
            { item: 'equip_wood_sword', name: '나무검', icon: '🗡️', slot: 'weapon', stats: { atk: 15, def: 0, hp: 0 }, effect: '공격력 +15' },
            { item: 'equip_wood_helmet', name: '나무투구', icon: '🪖', slot: 'helmet', stats: { atk: 0, def: 8, hp: 25 }, effect: '방어력 +8, 체력 +25' },
            { item: 'equip_wood_armor', name: '나무갑옷', icon: '🛡️', slot: 'armor', stats: { atk: 0, def: 15, hp: 15 }, effect: '방어력 +15, 체력 +15' }
          ];
          const chosen = woodGears[Math.floor(Math.random() * woodGears.length)];
          this.addItem(chosen.item, chosen.name, 1, chosen.icon, { type: 'equipment', slot: chosen.slot, stats: chosen.stats, effect: chosen.effect });
          rewardItemsList.push(`${chosen.icon} ${chosen.name}`);
        }
      }

      // 4. 숭실 청동 드래곤 전용 드랍 (100% 청동 드래곤의 심장, 20% 청동 장비 완제품)
      if (bName.includes('드래곤') || bName.includes('dragon')) {
        this.playerData.hasClearedDragonRaid = true;
        const studentId = this.playerData.studentId || '';
        if (studentId) {
          localStorage.setItem('soongsil_dragon_cleared_' + studentId, 'true');
        }
        this.saveProgress(true);

        // 확정 재료 드랍 (3티어 청동 장비 제작 핵심)
        this.addItem('item_bronze_heart', '청동 드래곤의 심장', 1, '🥉', { type: 'material', effect: '3티어 청동 장비 제작 핵심 재료' });
        rewardItemsList.push('🥉 청동 드래곤의 심장');

        // 2티어 가죽 장비 완제품 드랍 (20% 확률)
        const roll = Math.random() * 100;
        if (roll < 20) {
          const leatherGears = [
            { item: 'equip_leather_sword', name: '가죽손잡이 세이버', icon: '🗡️', slot: 'weapon', stats: { atk: 20, def: 0, hp: 0 }, effect: '공격력 +20' },
            { item: 'equip_leather_helmet', name: '가죽투구', icon: '⛑️', slot: 'helmet', stats: { atk: 0, def: 12, hp: 28 }, effect: '방어력 +12, 체력 +28' },
            { item: 'equip_leather_armor', name: '가죽갑옷', icon: '🥋', slot: 'armor', stats: { atk: 0, def: 17, hp: 20 }, effect: '방어력 +17, 체력 +20' }
          ];
          const chosen = leatherGears[Math.floor(Math.random() * leatherGears.length)];
          this.addItem(chosen.item, chosen.name, 1, chosen.icon, { type: 'equipment', slot: chosen.slot, stats: chosen.stats, effect: chosen.effect });
          rewardItemsList.push(`${chosen.icon} ${chosen.name} (완제품 드랍!)`);
        }
      }

      // 5. 중간고사 대마왕 전용 드랍 (주홍물약 3개, 💯 백점만점 시험지 100% 확정 + 35% 확률로 청동 무기/방어구 중 1종 획득)
      if (bName.includes('대마왕') || bName.includes('demon') || bName.includes('중간고사')) {
        this.addItem('item_orange_potion', '주홍 물약', 3, '🧪', { type: 'consumable', slot: 'consumable', heal: 25, effect: '체력 +25 회복' });
        rewardItemsList.push('🧪 주홍 물약 x3');

        this.addItem('item_perfect_exam', '💯 백점만점 시험지', 1, '💯', { type: 'material', effect: '중간고사 대마왕 토벌 전리품 · 📚 시험의 제왕 호칭 교환 재료' });
        rewardItemsList.push('💯 백점만점 시험지 (호칭 교환소에서 📚 시험의 제왕 교환!)');

        // 청동 장비 (청동검, 청동투구, 청동갑옷 중 1종): 35% 확률 드랍
        const roll = Math.random() * 100;
        if (roll < 35) {
          const bronzeGears = [
            { item: 'equip_bronze_sword', name: '청동검', icon: '⚔️', slot: 'weapon', stats: { atk: 25, def: 0, hp: 0 }, effect: '공격력 +25' },
            { item: 'equip_bronze_helmet', name: '청동투구', icon: '🪖', slot: 'helmet', stats: { atk: 0, def: 14, hp: 35 }, effect: '방어력 +14, 체력 +35' },
            { item: 'equip_bronze_armor', name: '청동갑옷', icon: '🛡️', slot: 'armor', stats: { atk: 0, def: 22, hp: 25 }, effect: '방어력 +22, 체력 +25' }
          ];
          const chosen = bronzeGears[Math.floor(Math.random() * bronzeGears.length)];
          this.addItem(chosen.item, chosen.name, 1, chosen.icon, { type: 'equipment', slot: chosen.slot, stats: chosen.stats, effect: chosen.effect });
          rewardItemsList.push(`${chosen.icon} ${chosen.name} (3티어 청동 장비 득템 성공! [35%])`);
        } else {
          rewardItemsList.push('💨 청동 장비 획득 실패 (다음 레이드 또는 제작대 도전!)');
        }
      }

      // 6. 케르베로스 전용 드랍 & 다음 구역 해금
      if (bName.includes('케르베로스') || bName.includes('cerberus')) {
        this.playerData.hasClearedCerberusRaid = true;
        const studentId = this.playerData.studentId || '';
        if (studentId) {
          localStorage.setItem('soongsil_cerberus_cleared_' + studentId, 'true');
        }
        localStorage.setItem('soongsil_cerberus_cleared_global', 'true');
        this.saveProgress();

        this.addItem('item_eval_paper', 'A+ 만점 수행평가지', 1, '📜', { type: 'material', effect: '케르베로스 전리품 · 수행평가 만점의 증표' });
        rewardItemsList.push('📜 A+ 만점 수행평가지 (확정 전리품)');
      }

      // 7. 기말고사 파멸신 전용 드랍
      if (bName.includes('파멸신') || bName.includes('기말고사')) {
        if (Math.random() < 0.5) {
          this.addItem('equip_laurel_crown', '종강의 황금 월계관', 1, '👑', { type: 'equipment', slot: 'helmet', stats: { atk: 15, def: 25, hp: 80 }, effect: '방어력 +25, 체력 +80' });
          rewardItemsList.push('👑 종강의 황금 월계관 (대박 드랍!)');
        } else {
          this.addItem('equip_omr_wand', '컴싸 마법봉', 1, '🖊️', { type: 'equipment', slot: 'weapon', stats: { atk: 45, def: 10, hp: 30 }, effect: '공격력 +45, 방어력 +10' });
          rewardItemsList.push('🖊️ 컴싸 마법봉 (희귀 무기!)');
        }
      }

      // 8. 나태의 거인 전용 드랍
      if (bName.includes('나태') || bName.includes('거인')) {
        this.addItem('item_orange_potion', '주홍 물약', 2, '🧪', { type: 'consumable', slot: 'consumable', heal: 25, effect: '체력 +25 즉시 회복' });
      rewardItemsList.push('🧪 주홍 물약 x2');
      }

      // 9. 숭실 백호 성수 전용 드랍
      if (bName.includes('백호') || bName.includes('성수')) {
        this.addGold(100);
      rewardItemsList.push('🪙 특별 토벌 상금 +100G');
      }

      const dropText = rewardItemsList.length > 0 ? `\n🎁 획득 아이템:\n• ${rewardItemsList.join('\n• ')}` : '';
      const mvpText = data.mvp ? `\n\n👑 최고 기여(MVP): ${data.mvp.name} (누적 데미지 ${data.mvp.damage})` : '';

      let clearNotice = '';
      if (bName.includes('골렘') || bName.includes('golem')) {
        clearNotice = '\n\n🎉 1차 관문 보스 가죽 골렘을 토벌하여 [🪪 엘리베이터 작동권]을 획득했습니다! 인벤토리(I) 장신구 슬롯에 작동권을 장착하면 중앙 엘리베이터를 가동할 수 있습니다!';
      } else if (bName.includes('드래곤') || bName.includes('dragon')) {
        clearNotice = '\n\n🎉 숭실 청동 드래곤을 토벌하여 3티어 청동 장비의 핵심 재료를 획득했습니다!';
      } else if (bName.includes('케르베로스') || bName.includes('cerberus')) {
        clearNotice = '\n\n🎉 [신규 구역 해금] 3두마수 케르베로스를 토벌하여 다음 미지의 모험 구역으로 향하는 길이 열렸습니다!';
      }

      alert(`🏆 [${data.bossName}] 협동 토벌 성공!\n\n🪙 골드 +${data.rewardGold}G, 🌟 경험치 +${data.rewardExp} EXP${dropText}${mvpText}${clearNotice}`);
      this.modalBossRaid.classList.add('hidden');
    }
  }

  updateBossRaidUI() {
    this.recalcCombatStats();
    const bossPct = Math.max(0, Math.min(100, Math.floor((this.bossState.currentHp / this.bossState.maxHp) * 100)));
    const bossHpText = document.getElementById('boss-hp-text');
    if (bossHpText) bossHpText.innerText = `HP ${this.bossState.currentHp} / ${this.bossState.maxHp}`;
    const bossHpFill = document.getElementById('boss-hp-fill');
    if (bossHpFill) bossHpFill.style.width = `${bossPct}%`;

    const playerNameLabel = document.getElementById('raid-player-name-label');
    if (playerNameLabel) {
      playerNameLabel.innerText = this.playerData.name ? `${this.playerData.name} (내 체력)` : '내 체력';
    }

    const playerHpText = document.getElementById('raid-player-hp');
    if (playerHpText) playerHpText.innerText = `HP ${this.playerData.hp} / ${this.playerData.maxHp}`;

    const playerPct = Math.max(0, Math.min(100, Math.floor((this.playerData.hp / this.playerData.maxHp) * 100)));
    const playerHpFill = document.getElementById('raid-player-hp-fill');
    if (playerHpFill) {
      playerHpFill.style.width = `${playerPct}%`;
      if (playerPct > 50) {
        playerHpFill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
      } else if (playerPct > 20) {
        playerHpFill.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
      } else {
        playerHpFill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
      }
    }

    const playerAtkEl = document.getElementById('raid-player-atk');
    if (playerAtkEl) playerAtkEl.innerText = this.playerData.atk;
    const playerDefEl = document.getElementById('raid-player-def');
    if (playerDefEl) playerDefEl.innerText = this.playerData.def;

    const redPot = this.playerData.inventory.find(i => i.item === 'item_red_potion');
    const redCount = redPot ? redPot.count : 0;
    const btnRed = document.getElementById('btn-raid-use-red-potion');
    if (btnRed) {
      btnRed.innerText = `🍷 빨간 물약 (+10) ${redCount}개`;
      btnRed.disabled = (redCount <= 0 || this.playerData.hp >= this.playerData.maxHp || this.playerData.isFallen);
    }

    const orangePot = this.playerData.inventory.find(i => i.item === 'item_orange_potion');
    const orangeCount = orangePot ? orangePot.count : 0;
    const btnOrange = document.getElementById('btn-raid-use-orange-potion');
    if (btnOrange) {
      btnOrange.innerText = `🧪 주홍 물약 (+25) ${orangeCount}개`;
      btnOrange.disabled = (orangeCount <= 0 || this.playerData.hp >= this.playerData.maxHp || this.playerData.isFallen);
    }

    const scroll = this.playerData.inventory.find(i => i.item === 'item_revive_scroll');
    const scrollCount = scroll ? scroll.count : 0;
    const btnScroll = document.getElementById('btn-raid-use-revive-scroll');
    if (btnScroll) {
      btnScroll.innerText = `📜 부활 주문서 (${scrollCount}개)`;
      btnScroll.disabled = (scrollCount <= 0 || this.playerData.isFallen);
    }
  }

  loadNextBossQuestion() {
    let uFilter = (window.BOSS_CONFIG.unitFilter && window.BOSS_CONFIG.unitFilter !== 'ALL')
      ? window.BOSS_CONFIG.unitFilter
      : null;

    // 케르베로스는 5~6단원에서 집중 출제
    if (!uFilter && window.BOSS_CONFIG.name && (window.BOSS_CONFIG.name.includes('케르베로스') || window.BOSS_CONFIG.name.includes('cerberus'))) {
      uFilter = Math.random() < 0.5 ? '5단원' : '6단원';
    }

    const q = this.quizManager.getRandomQuestion(uFilter);
    if (!q) {
      alert('출제할 영어 문제가 없습니다.');
      return;
    }
    this.bossState.currentQuestion = q;

    document.getElementById('raid-quiz-question').innerText = q.question;
    const optionsEl = document.getElementById('raid-quiz-options');
    optionsEl.innerHTML = '';
    document.getElementById('btn-raid-next-turn').classList.add('hidden');

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.innerText = opt;
      btn.addEventListener('click', () => this.handleBossRaidAnswer(opt, btn));
      optionsEl.appendChild(btn);
    });
  }

  handleBossRaidAnswer(selectedOpt, btnEl) {
    const q = this.bossState.currentQuestion;
    const isCorrect = (selectedOpt === q.answer);
    const allBtns = document.getElementById('raid-quiz-options').querySelectorAll('.quiz-opt-btn');
    allBtns.forEach(b => b.disabled = true);

    const logEl = document.getElementById('raid-battle-log');
    const bossAtk = window.BOSS_CONFIG.atk;
    const bossDef = window.BOSS_CONFIG.def;

    if (isCorrect) {
      btnEl.classList.add('correct');
      if (window.AudioManager) window.AudioManager.playCorrect();
      const myDmg = Math.max(5, this.playerData.atk - bossDef);
      this.bossState.hasAttacked = true;
      this.bossState.damageDealt = (this.bossState.damageDealt || 0) + myDmg;

      if (window.BOSS_CONFIG.active && window.BOSS_CONFIG.mode === 'coop' && this.networkManager.socket) {
        // 협동 레이드: 서버로 데미지 전송하여 전교생 보스 HP 공유 차감
        this.networkManager.socket.emit('boss_raid_attack', { damage: myDmg });
      } else {
        this.bossState.currentHp = Math.max(0, this.bossState.currentHp - myDmg);
        if (this.bossState.currentHp <= 0) {
          const bName = window.BOSS_CONFIG.name || '';
          let clearNotice = '';
          if (bName.includes('골렘') || bName.includes('golem')) {
            this.playerData.hasClearedFirstBoss = true;
            const studentId = this.playerData.studentId || '';
            if (studentId) {
              localStorage.setItem('soongsil_first_boss_cleared_' + studentId, 'true');
            }
            const bossLeatherCount = Math.floor(Math.random() * 2) + 1; // 1 or 2개 가변
            this.addItem('item_boss_leather', '질긴 보스의 가죽', bossLeatherCount, '🟫', { type: 'material', effect: '2티어 가죽 장비 핵심 제작 재료' });
            clearNotice = `\n\n🎉 중앙 엘리베이터 점검이 완료되었습니다! 이제 엘리베이터를 타고 지상 운동장으로 이동할 수 있습니다!\n📦 획득: [🟫 질긴 보스의 가죽 x${bossLeatherCount}개]`;
            this.saveProgress(true);
          } else if (bName.includes('드래곤') || bName.includes('dragon')) {
            this.playerData.hasClearedDragonRaid = true;
            const studentId = this.playerData.studentId || '';
            if (studentId) {
              localStorage.setItem('soongsil_dragon_cleared_' + studentId, 'true');
            }
            localStorage.setItem('soongsil_dragon_cleared_global', 'true');
            this.addItem('item_bronze_heart', '청동 드래곤의 심장', 1, '🥉', { type: 'material', effect: '3티어 청동 장비 핵심 재료' });
            clearNotice = '\n\n🏆 숭실 청동 드래곤 토벌 성공!\n📦 획득: [🥉 청동 드래곤의 심장] (3티어 청동 장비 제작 재료)';
            this.saveProgress();
          }
          this.updateBossRaidUI();
          this.addGold(window.BOSS_CONFIG.rewardGold);
          this.addExp(window.BOSS_CONFIG.rewardExp);
          alert(`🏆 [${window.BOSS_CONFIG.name}] 처치!\n보상: 🪙 +${window.BOSS_CONFIG.rewardGold}G, 🌟 +${window.BOSS_CONFIG.rewardExp} EXP${clearNotice}`);
          this.bossState.currentHp = this.bossState.maxHp;
          this.modalBossRaid.classList.add('hidden');
          return;
        }
      }

      // 정답 시: (보스 공격력 - 나의 방어력)만큼만 피격 (방어력이 높으면 0 피해)
      const incomingDmg = this.playerData.isTeacher ? 0 : Math.max(0, bossAtk - this.playerData.def);
      this.playerData.hp = Math.max(0, this.playerData.hp - incomingDmg);
      this.updateBossRaidUI();

      if (incomingDmg > 0) {
        logEl.innerHTML = `⚔️ 보스에게 <b>-${myDmg} HP</b> 데미지! / 💥 보스 반격 <b>-${incomingDmg} HP</b>`;
      } else {
        logEl.innerHTML = `⚔️ 보스에게 <b>-${myDmg} HP</b> 결정타! / 🛡️ 방어력(${this.playerData.def})으로 보스 공격 완벽 방어 (피해 0)!`;
      }
    } else {
      btnEl.classList.add('wrong');
      if (window.AudioManager) window.AudioManager.playWrong();
      // 추천안 A: 오답 시 방어력을 무시하고 무조건 보스의 순수 공격력(bossAtk)만큼 직격 피해!
      const incomingDmg = this.playerData.isTeacher ? 0 : bossAtk;
      this.playerData.hp = Math.max(0, this.playerData.hp - incomingDmg);
      this.updateBossRaidUI();

      logEl.innerHTML = `😢 오답 (정답: ${q.answer}) / 🚨 <b>보스 강타 -${incomingDmg} HP</b> (방어력 무시)`;
    }

    if (this.playerData.hp <= 0) {
      this.playerData.hp = 0;
      this.playerData.isFallen = true;
      this.engine.player.isFallen = true;
      this.updateHpBar();
      this.updateBossRaidUI();

      if (this.networkManager.socket) {
        this.networkManager.socket.emit('player_fallen', { name: this.playerData.name });
      }

      if (window.AudioManager) {
        window.AudioManager.playHit();
      }

      logEl.innerHTML = `<b style="color:#ef4444; font-size:14px;">💀 쓰러졌습니다!</b><br><span style="color:#fde047; font-size:12px;">부활 방식을 선택하세요: 복도에서 부활(15%)하거나, 교실에서 친구의 부활 주문서(50%)를 기다릴 수 있습니다.</span>`;
      document.getElementById('raid-quiz-question').innerText = '💀 전투 불능 상태입니다. 부활 방식을 선택해 주세요.';

      const optionsEl = document.getElementById('raid-quiz-options');
      optionsEl.innerHTML = `
        <div class="respawn-choice-container">
          <button id="btn-respawn-hallway" class="btn-respawn-choice btn-respawn-hallway">
            🏛️ 복도(출발지) 부활
            <span style="font-size:11.5px; opacity:0.9; font-weight:normal; margin-top:3px;">(체력 15% 회복 · 로비 귀환)</span>
          </button>
          <button id="btn-wait-revive" class="btn-respawn-choice btn-wait-revive">
            ⏳ 교실에서 대기하기
            <span style="font-size:11.5px; opacity:0.9; font-weight:normal; margin-top:3px;">(주문서 사용 시 체력 50% 복귀)</span>
          </button>
        </div>
      `;

      document.getElementById('btn-raid-next-turn').classList.add('hidden');

      const btnRespawn = document.getElementById('btn-respawn-hallway');
      if (btnRespawn) {
        btnRespawn.addEventListener('click', () => this.respawnAtHallway());
      }

      const btnWait = document.getElementById('btn-wait-revive');
      if (btnWait) {
        btnWait.addEventListener('click', () => this.showWaitingReviveState());
      }

      return;
    }

    document.getElementById('btn-raid-next-turn').classList.remove('hidden');
  }

  // ========================================================
  // 1:1 FIELD MONSTER BATTLE (농구장 1:1 퀴즈 대결)
  // ========================================================
  startFieldMonsterBattle(mob) {
    if (!mob) return;
    if (this.playerData.hp <= 0 || this.playerData.isFallen) {
      alert('😵 [체력 고갈]\n\n현재 체력이 0입니다! 가방(🎒)에서 물약을 마시거나 안전한 곳에서 휴식을 취한 뒤 도전하세요!');
      return;
    }
    this.currentFieldMob = mob;
    mob.inBattle = true;
    this.modalFieldBattle.classList.remove('hidden');
    this.updateFieldBattleUI();
    this.loadNextFieldBattleQuestion();
  }

  closeFieldBattleModal() {
    if (this.currentFieldMob) {
      this.currentFieldMob.inBattle = false;
      this.currentFieldMob = null;
    }
    if (this.modalFieldBattle) {
      this.modalFieldBattle.classList.add('hidden');
    }
  }

  updateFieldBattleUI() {
    if (!this.currentFieldMob) return;
    this.recalcCombatStats();

    const mob = this.currentFieldMob;
    const mobPct = Math.max(0, Math.min(100, Math.floor((mob.hp / mob.maxHp) * 100)));
    const titleEl = document.getElementById('battle-monster-title');
    if (titleEl) titleEl.innerText = `${mob.icon} ${mob.name} [1:1 배틀]`;

    const mobLabel = document.getElementById('battle-mob-name-label');
    if (mobLabel) mobLabel.innerText = `${mob.icon} ${mob.name}`;

    const mobHpText = document.getElementById('battle-mob-hp-text');
    if (mobHpText) mobHpText.innerText = `HP ${mob.hp} / ${mob.maxHp}`;

    const mobHpFill = document.getElementById('battle-mob-hp-fill');
    if (mobHpFill) mobHpFill.style.width = `${mobPct}%`;

    const pName = document.getElementById('battle-player-name-label');
    if (pName) pName.innerText = this.playerData.name ? `${this.playerData.name} (내 체력)` : '내 체력';

    const pAtk = document.getElementById('battle-player-atk');
    if (pAtk) pAtk.innerText = this.playerData.atk;

    const pDef = document.getElementById('battle-player-def');
    if (pDef) pDef.innerText = this.playerData.def;

    const pHpText = document.getElementById('battle-player-hp');
    if (pHpText) pHpText.innerText = `HP ${this.playerData.hp} / ${this.playerData.maxHp}`;

    const pPct = Math.max(0, Math.min(100, Math.floor((this.playerData.hp / this.playerData.maxHp) * 100)));
    const pHpFill = document.getElementById('battle-player-hp-fill');
    if (pHpFill) {
      pHpFill.style.width = `${pPct}%`;
      if (pPct > 50) pHpFill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
      else if (pPct > 20) pHpFill.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
      else pHpFill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
    }

    const redPot = this.playerData.inventory.find(i => i.item === 'item_red_potion');
    const redCount = redPot ? redPot.count : 0;
    const btnRed = document.getElementById('btn-battle-use-red-potion');
    if (btnRed) {
      btnRed.innerText = `🍷 빨간 물약 (+10) ${redCount}개`;
      btnRed.disabled = (redCount <= 0 || this.playerData.hp >= this.playerData.maxHp || this.playerData.isFallen);
    }

    const orangePot = this.playerData.inventory.find(i => i.item === 'item_orange_potion');
    const orangeCount = orangePot ? orangePot.count : 0;
    const btnOrange = document.getElementById('btn-battle-use-orange-potion');
    if (btnOrange) {
      btnOrange.innerText = `🧪 주홍 물약 (+25) ${orangeCount}개`;
      btnOrange.disabled = (orangeCount <= 0 || this.playerData.hp >= this.playerData.maxHp || this.playerData.isFallen);
    }

    const isFutsal = (mob.court === 'futsal');
    const logEl = document.getElementById('battle-action-log');
    if (logEl) {
      logEl.innerHTML = `⚔️ <b>${isFutsal ? '6단원 (The Beauty of Art)' : '5단원 (Walk into Korea)'}</b> 영어 문제를 맞히면 공격하고, 틀리면 <b>풀HP의 20% 피해</b>를 입습니다!`;
    }
  }

  loadNextFieldBattleQuestion() {
    const isFutsal = (this.currentFieldMob && this.currentFieldMob.court === 'futsal');
    const unitFilter = isFutsal ? '6단원' : '5단원';
    const q = this.quizManager.getRandomQuestion(unitFilter);
    if (!q) {
      alert(`출제할 ${isFutsal ? '6단원' : '5단원'} 영어 문제가 없습니다.`);
      return;
    }
    this.fieldBattleQuestion = q;

    const qEl = document.getElementById('battle-quiz-question');
    if (qEl) qEl.innerText = q.question;

    const optEl = document.getElementById('battle-quiz-options');
    if (!optEl) return;
    optEl.innerHTML = '';

    const btnNext = document.getElementById('btn-battle-next-turn');
    if (btnNext) btnNext.classList.add('hidden');

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.innerText = opt;
      btn.addEventListener('click', () => this.handleFieldBattleAnswer(opt, btn));
      optEl.appendChild(btn);
    });
  }

  handleFieldBattleAnswer(selectedOpt, btnEl) {
    const q = this.fieldBattleQuestion;
    const mob = this.currentFieldMob;
    if (!q || !mob) return;

    const isCorrect = (selectedOpt === q.answer);
    const allBtns = document.getElementById('battle-quiz-options').querySelectorAll('.quiz-opt-btn');
    allBtns.forEach(b => b.disabled = true);

    const logEl = document.getElementById('battle-action-log');

    if (isCorrect) {
      btnEl.classList.add('correct');
      if (window.AudioManager) window.AudioManager.playCorrect();

      const myDmg = Math.max(8, this.playerData.atk - mob.def);
      mob.hp = Math.max(0, mob.hp - myDmg);
      this.updateFieldBattleUI();

      if (mob.hp <= 0) {
        if (logEl) logEl.innerHTML = `⚔️ 정답! <b>${mob.name}</b>에게 <b>-${myDmg} HP</b> 결정타를 날려 승리했습니다!`;
        setTimeout(() => this.handleFieldBattleVictory(mob), 400);
        return;
      }

      if (logEl) logEl.innerHTML = `⚔️ <b>정답!</b> <b>${mob.name}</b>에게 <b>-${myDmg} HP</b> 피해를 입혔습니다! (남은 HP: ${mob.hp})`;
      const btnNext = document.getElementById('btn-battle-next-turn');
      if (btnNext) btnNext.classList.remove('hidden');
    } else {
      btnEl.classList.add('wrong');
      allBtns.forEach(b => {
        if (b.innerText === q.answer) b.classList.add('correct');
      });
      if (window.AudioManager) window.AudioManager.playWrong();

      // 풀HP의 20% 상당의 피격 피해 (풀피 135 기준 ~27 HP)
      const counterDmg = mob.counterDmg || Math.round(this.playerData.maxHp * 0.20);
      this.playerData.hp = Math.max(0, this.playerData.hp - counterDmg);
      this.updateFieldBattleUI();
      this.updateHpBar();

      if (logEl) {
        logEl.innerHTML = `💥 <b>오답!</b> 정답은 [<b>${q.answer}</b>]입니다.<br>🚨 <b>${mob.name}</b>의 반격으로 <b>-${counterDmg} HP (풀피의 20% 피해)</b>를 입었습니다!`;
      }

      if (this.playerData.hp <= 0) {
        this.playerData.isFallen = true;
        if (this.engine && this.engine.player) {
          this.engine.player.isFallen = true;
        }
        this.saveProgress();
        setTimeout(() => {
          const respawn = confirm(
            `😵 [전투 패배]\n\n${mob.name}의 강력한 일격에 쓰러졌습니다!\n\n1학년 복도(보건실)로 안전하게 귀환하시겠습니까?\n(취소 시 가방의 물약을 사용하여 회복할 수 있습니다)`
          );
          this.closeFieldBattleModal();
          if (respawn) {
            this.respawnAtHallway();
          }
        }, 500);
        return;
      }

      const btnNext = document.getElementById('btn-battle-next-turn');
      if (btnNext) btnNext.classList.remove('hidden');
    }
  }

  handleFieldBattleVictory(mob) {
    mob.defeated = true;
    mob.respawnAt = Date.now() + (mob.respawnSec || 15) * 1000;

    // 1. Gold & EXP
    this.addGold(mob.goldReward || 10);
    this.addExp(mob.expReward || 20);

    const dropsList = [];

    // 2. Drops based on field court
    if (mob.court === 'futsal') {
      const fLeatherCount = Math.floor(Math.random() * ((mob.leatherMax || 3) - (mob.leatherMin || 1) + 1)) + (mob.leatherMin || 1);
      this.addItem('item_futsal_leather', '탄력있는 풋살공 가죽', fLeatherCount, '⚽', {
        type: 'material',
        effect: '풋살장 몬스터 전리품 · 고급 방어구 및 장비 재료'
      });
      dropsList.push(`⚽ 탄력있는 풋살공 가죽 x${fLeatherCount}개`);

      // Forsythia Petal (15% drop rate for futsal monsters)
      if (Math.random() * 100 < 15) {
        this.addItem('item_forsythia', '노란 개나리 꽃잎', 1, '🌼', {
          type: 'material',
          effect: '개나리 반지 및 주홍 물약 재료'
        });
        dropsList.push('🌼 노란 개나리 꽃잎 1개 (15% 행운 드랍!)');
      }

      // Elite Leather Helmet Drop (8% 대박 완제품 드랍!)
      if (mob.armorDropRate && Math.random() * 100 < mob.armorDropRate) {
        this.addItem('equip_leather_helmet', '가죽투구', 1, '⛑️', {
          type: 'equipment',
          slot: 'helmet',
          stats: { atk: 0, def: 12, hp: 28 },
          effect: '방어력 +12, 체력 +28'
        });
        dropsList.push('⛑️ 가죽투구 (8% 대박 완제품 드랍!)');
      }

      // Elite 2-Tier Leather Saber Drop (거미손 골키퍼 전용 5% 대박 완제품 드랍!)
      if (mob.type === 'elite' && Math.random() * 100 < 5) {
        this.addItem('equip_leather_sword', '가죽손잡이 세이버', 1, '🗡️', {
          type: 'equipment',
          slot: 'weapon',
          stats: { atk: 20, def: 0, hp: 0 },
          effect: '공격력 +20'
        });
        dropsList.push('🗡️ 가죽손잡이 세이버 (5% 대박 완제품 드랍!)');
      }
    } else {
      // Basketball Court Standard Drops
      const leatherCount = Math.floor(Math.random() * ((mob.leatherMax || 2) - (mob.leatherMin || 1) + 1)) + (mob.leatherMin || 1);
      this.addItem('item_basketball_leather', '농구공 가죽 조각', leatherCount, '🏀', {
        type: 'material',
        effect: '농구장 몬스터 전리품 · 가죽 장비 제작 재료'
      });
      dropsList.push(`🏀 농구공 가죽 조각 x${leatherCount}개`);

      // Forsythia Petal (15% drop rate for basketball monsters)
      if (Math.random() * 100 < 15) {
        this.addItem('item_forsythia', '노란 개나리 꽃잎', 1, '🌼', {
          type: 'material',
          effect: '개나리 반지 및 주홍 물약 재료'
        });
        dropsList.push('🌼 노란 개나리 꽃잎 1개 (15% 행운 드랍!)');
      }

      if (mob.armorDropRate && Math.random() * 100 < mob.armorDropRate) {
        this.addItem('equip_leather_armor', '가죽갑옷', 1, '🥋', {
          type: 'equipment',
          slot: 'armor',
          stats: { atk: 0, def: 17, hp: 20 },
          effect: '방어력 +17, 체력 +20'
        });
        dropsList.push('🥋 가죽갑옷 (8% 대박 완제품 드랍!)');
      }
    }

    if (window.AudioManager) window.AudioManager.playFanfare();

    this.saveProgress();
    this.closeFieldBattleModal();

    const craftGuide = (mob.court === 'futsal')
      ? '(탄력있는 풋살공 가죽과 보스가죽을 모아 복도 장비 제작대에서 ⛑️ 가죽투구와 🗡️ 가죽손잡이 세이버를 제작할 수 있습니다!)'
      : '(농구공 가죽 조각과 보스가죽을 모아 복도 장비 제작대에서 🥋 가죽갑옷과 🗡️ 가죽손잡이 세이버를 제작할 수 있습니다!)';

    alert(
      `🏆 [${mob.name}] 1:1 대결 승리!\n\n🪙 골드 +${mob.goldReward}G, 🌟 경험치 +${mob.expReward} EXP\n\n🎁 획득 아이템:\n• ${dropsList.join('\n• ')}\n\n${craftGuide}`
    );
  }

  respawnAtHallway() {
    this.playerData.isFallen = false;
    this.engine.player.isFallen = false;
    this.playerData.hp = Math.max(1, Math.floor(this.playerData.maxHp * 0.15));
    this.updateHpBar();
    this.updateBossRaidUI();

    // Close Boss Raid Modal
    if (this.modalBossRaid) {
      this.modalBossRaid.classList.add('hidden');
    }

    // Warp player to hallway center (15*32, 10*32)
    if (this.engine) {
      this.engine.triggerFadeWarp(() => {
        this.engine.warpToRoom('hallway', '1학년 복도', 15 * 32, 10 * 32);
      });
    }

    if (this.networkManager.socket) {
      this.networkManager.socket.emit('player_respawn_hallway');
    }

    if (window.AudioManager) {
      window.AudioManager.playRevive();
    }

    if (window.RPGDialog) {
      window.RPGDialog.show('🏛️ 복도 부활', '안전하게 1학년 복도로 귀환했습니다.\n(현재 체력 15% 상태이므로 물약을 마시거나 재정비 후 다시 도전해보세요!)', '✨');
    }
  }

  showWaitingReviveState() {
    const logEl = document.getElementById('raid-battle-log');
    if (logEl) {
      logEl.innerHTML = `<b style="color:#fbbf24; font-size:14px;">⏳ 친구의 부활 주문서를 기다리는 중...</b><br><span style="color:#cbd5e1; font-size:12px;">파티원이 부활 주문서를 사용하면 [부활 수락] 알림창이 나타납니다.</span>`;
    }
    const qEl = document.getElementById('raid-quiz-question');
    if (qEl) {
      qEl.innerText = '💀 1학년 2반에서 대기 중입니다.';
    }
    const optionsEl = document.getElementById('raid-quiz-options');
    if (optionsEl) {
      optionsEl.innerHTML = `
        <div class="waiting-revive-box">
          <div style="font-size:32px;">⏳💫</div>
          <p style="color:#fde047; font-size:14px; font-weight:800; margin:0;">
            동료의 [📜 부활 주문서] 사용을 기다리고 있습니다
          </p>
          <p style="color:#cbd5e1; font-size:12px; margin:0; line-height:1.5;">
            친구가 주문서를 써주면 <b>[부활 수락]</b> 버튼이 화면에 즉시 나타납니다.
          </p>
          <button id="btn-fallback-respawn" class="btn-respawn-choice btn-respawn-hallway" style="padding:10px 16px; font-size:13px; margin-top:8px; width:auto;">
            🏛️ 기다리지 않고 복도에서 부활하기 (체력 15%)
          </button>
        </div>
      `;
      const btnFallback = document.getElementById('btn-fallback-respawn');
      if (btnFallback) {
        btnFallback.addEventListener('click', () => this.respawnAtHallway());
      }
    }
  }

  attemptUseReviveScroll() {
    const scroll = this.playerData.inventory.find(i => i.item === 'item_revive_scroll');
    if (!scroll || scroll.count <= 0) {
      alert('📜 보유 중인 부활 주문서가 없습니다.\n포션 제작대에서 제작할 수 있습니다.');
      return;
    }

    // 1학년 2반에서 쓰러진 다른 플레이어 찾기
    const fallenOthers = Object.values(this.engine.otherPlayers).filter(p => p.isFallen && p.room === 'room_702');
    if (fallenOthers.length === 0) {
      alert('현재 1학년 2반에 쓰러진 친구가 없습니다.');
      return;
    }

    const target = fallenOthers[0];
    if (confirm(`'${target.name}' 친구에게 부활 주문서를 전달하시겠습니까? (상대방이 수락 시 HP 50% 복귀)`)) {
      this.removeItem('item_revive_scroll', 1);
      if (this.networkManager.socket) {
        this.networkManager.socket.emit('use_revive_scroll', {
          targetSocketId: target.id,
          targetName: target.name
        });
      }
      this.updateBossRaidUI();
    }
  }

  onPlayerReviveOffered(data) {
    const senderName = (data && data.revivedBy) ? data.revivedBy : '친구';
    const senderEl = document.getElementById('revive-offer-sender');
    if (senderEl) {
      senderEl.innerText = senderName;
    }
    const modal = document.getElementById('modal-revive-offer');
    if (modal) {
      modal.classList.remove('hidden');
    }
    if (window.AudioManager) {
      window.AudioManager.playFanfare();
    }
  }

  onPlayerRevived(data) {
    this.onPlayerReviveOffered(data);
  }

  acceptReviveOffer() {
    const modal = document.getElementById('modal-revive-offer');
    if (modal) {
      modal.classList.add('hidden');
    }

    this.playerData.isFallen = false;
    this.engine.player.isFallen = false;
    this.playerData.hp = Math.max(1, Math.floor(this.playerData.maxHp * 0.5));
    this.updateHpBar();
    this.updateBossRaidUI();

    if (this.networkManager.socket) {
      this.networkManager.socket.emit('player_revive_accepted', {
        name: this.playerData.name
      });
    }

    if (window.AudioManager) {
      window.AudioManager.playRevive();
    }

    if (window.RPGDialog) {
      window.RPGDialog.show('✨ 부활 수락 완료!', '동료의 부활 주문서를 수락하여 체력 50%로 전투에 복귀했습니다!\n힘을 합쳐 보스를 공략해보세요!', '💫');
    }

    // Ensure boss raid window is open and load next turn
    if (window.BOSS_CONFIG && window.BOSS_CONFIG.active) {
      if (this.modalBossRaid) {
        this.modalBossRaid.classList.remove('hidden');
      }
      this.loadNextBossQuestion();
    }
  }

  declineReviveOffer() {
    const modal = document.getElementById('modal-revive-offer');
    if (modal) {
      modal.classList.add('hidden');
    }
    if (window.RPGDialog) {
      window.RPGDialog.show('대기 유지', '부활을 보류하고 대기 상태를 유지합니다.\n언제든 복도 부활을 선택할 수 있습니다.', '⏳');
    }
  }

  // =========================================================================
  // TEACHER ADMIN CONTROLS (보스레이드 이벤트 / 돌발 퀴즈 / 학생 관리 / 채팅 / 공지 / 문제 관리)
  // =========================================================================
  initTeacherAdmin() {
    const chatLogContainer = document.getElementById('admin-chat-logs');

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));

        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        const pane = document.getElementById(tabId);
        if (pane) pane.classList.remove('hidden');

        if (tabId === 'tab-students' || tabId === 'tab-item-grant') {
          this.requestStudentList();
          if (tabId === 'tab-students' && this.loadSavedStudentsForEditor) {
            this.loadSavedStudentsForEditor();
          }
        }
      });
    });

    // 보스 프리셋 자동 입력
    const presetSelect = document.getElementById('admin-boss-preset');
    if (presetSelect) {
      presetSelect.addEventListener('change', () => {
        const val = presetSelect.value;
        const nameEl = document.getElementById('admin-boss-name');
        const hpEl = document.getElementById('admin-boss-hp');
        const atkEl = document.getElementById('admin-boss-atk');
        const defEl = document.getElementById('admin-boss-def');
        const goldEl = document.getElementById('admin-boss-gold');
        const expEl = document.getElementById('admin-boss-exp');

        if (val === 'golem') {
          nameEl.value = '👾 가죽 골렘';
          hpEl.value = 2000;
          atkEl.value = 30;
          defEl.value = 14;
          goldEl.value = 50;
          expEl.value = 100;
        } else if (val === 'dragon') {
          nameEl.value = '🐉 숭실 청동 드래곤';
          hpEl.value = 5000;
          atkEl.value = 50;
          defEl.value = 20;
          goldEl.value = 120;
          expEl.value = 250;
        } else if (val === 'demon') {
          nameEl.value = '😈 중간고사 대마왕';
          hpEl.value = 7500;
          atkEl.value = 86;
          defEl.value = 28;
          goldEl.value = 300;
          expEl.value = 600;
        } else if (val === 'cerberus') {
          nameEl.value = '🐕 수행평가 3두마수 케르베로스';
          hpEl.value = 8000;
          atkEl.value = 90;
          defEl.value = 28;
          goldEl.value = 200;
          expEl.value = 400;
        } else if (val === 'final_god') {
          nameEl.value = '💀 기말고사 파멸신';
          hpEl.value = 99999;
          atkEl.value = 9999;
          defEl.value = 9999;
          goldEl.value = 0;
          expEl.value = 0;
        } else if (val === 'sloth_titan') {
          nameEl.value = '🦥 방학 직전 나태의 거인';
          hpEl.value = 99999;
          atkEl.value = 9999;
          defEl.value = 9999;
          goldEl.value = 0;
          expEl.value = 0;
        } else if (val === 'custom') {
          nameEl.value = '⚙️ 커스텀 보스';
        }

        const summonLabel = document.getElementById('admin-boss-summon-label');
        if (summonLabel) {
          if (val === 'golem' || val === 'dragon') {
            summonLabel.innerText = '🚀 접속 중인 학생 전원 1학년 2반으로 즉시 소환';
          } else {
            summonLabel.innerText = '🚀 접속 중인 학생 전원 축구장 서쪽 골대로 즉시 소환';
          }
        }

        if (window.BOSS_CONFIG) {
          window.BOSS_CONFIG.name = nameEl.value;
          window.BOSS_CONFIG.maxHp = parseInt(hpEl.value) || 1500;
          window.BOSS_CONFIG.currentHp = parseInt(hpEl.value) || 1500;
        }
      });

      const nameEl = document.getElementById('admin-boss-name');
      if (nameEl) {
        nameEl.addEventListener('input', () => {
          if (window.BOSS_CONFIG) window.BOSS_CONFIG.name = nameEl.value;
        });
      }
    }

    // 보스레이드 이벤트 시작 버튼
    const btnStartBoss = document.getElementById('btn-start-boss-event');
    if (btnStartBoss) {
      btnStartBoss.addEventListener('click', () => {
        const opts = {
          name: document.getElementById('admin-boss-name').value.trim() || '👾 가죽 골렘',
          mode: document.getElementById('admin-boss-mode').value || 'coop',
          unitFilter: document.getElementById('admin-boss-unit').value || 'ALL',
          maxHp: Math.max(50, parseInt(document.getElementById('admin-boss-hp').value) || 2000),
          atk: Math.max(1, parseInt(document.getElementById('admin-boss-atk').value) || 30),
          def: Math.max(0, parseInt(document.getElementById('admin-boss-def').value) || 14),
          rewardGold: Math.max(0, parseInt(document.getElementById('admin-boss-gold').value) || 50),
          rewardExp: Math.max(0, parseInt(document.getElementById('admin-boss-exp').value) || 100),
          announce: document.getElementById('admin-boss-announce').checked,
          summonAll: document.getElementById('admin-boss-summon').checked
        };

        if (this.networkManager.socket) {
          this.networkManager.socket.emit('teacher_start_boss_raid', opts);
        } else {
          this.onBossRaidStateUpdate({ ...opts, active: true, currentHp: opts.maxHp });
        }

        alert(`🔥 [보스레이드 이벤트 개시]\n• 보스: ${opts.name}\n• 체력: ${opts.maxHp} HP (ATK ${opts.atk} / DEF ${opts.def})\n• 출제 범위: ${opts.unitFilter === 'ALL' ? '전체 단원' : opts.unitFilter}`);
      });
    }

    // 보스레이드 이벤트 종료 버튼
    const btnStopBoss = document.getElementById('btn-stop-boss-event');
    if (btnStopBoss) {
      btnStopBoss.addEventListener('click', () => {
        if (this.networkManager.socket) {
          this.networkManager.socket.emit('teacher_stop_boss_raid');
        } else {
          this.onBossRaidStateUpdate({ ...window.BOSS_CONFIG, active: false });
        }
        alert('⏹️ 보스레이드 이벤트를 종료(대기 상태 전환)했습니다.');
      });
    }

    if (this.networkManager.socket) {
      this.networkManager.socket.on('teacher_chat_log', (item) => {
        const row = document.createElement('div');
        row.className = 'admin-chat-item';
        row.id = `admin_${item.id}`;
        row.innerHTML = `
          <div>
            <span style="color:#60a5fa; font-weight:bold;">[${item.grade}학년 / ${item.floor}F]</span>
            <b>${item.senderName} (${item.studentId})</b>: ${item.text}
            <small style="color:#71717a; margin-left:6px;">${item.time}</small>
          </div>
          <div class="admin-action-btns">
            <button class="btn-del" onclick="window.MainApp.deleteChat('${item.id}')">삭제</button>
            <button class="btn-mute" onclick="window.MainApp.muteStudent('${item.senderName}')">채금</button>
            <button class="btn-kick" style="background:#dc2626; color:#fff; border:none; padding:2px 6px; border-radius:4px; font-size:11px; cursor:pointer;" onclick="window.MainApp.kickStudent('${item.senderId}', '${item.senderName}')">강퇴</button>
          </div>
        `;
        chatLogContainer.appendChild(row);
        chatLogContainer.scrollTop = chatLogContainer.scrollHeight;
      });
    }

    const btnSendBroadcast = document.getElementById('btn-send-broadcast');
    if (btnSendBroadcast) {
      btnSendBroadcast.addEventListener('click', () => {
        const input = document.getElementById('input-broadcast');
        const msg = input ? input.value.trim() : '';

        if (!msg) {
          alert('전송할 공지 내용을 입력해 주세요.');
          return;
        }

        if (this.networkManager && this.networkManager.socket) {
          this.networkManager.socket.emit('teacher_broadcast', { message: msg });
          alert(`📢 [공지 전송 완료]\n전교생에게 긴급 공지사항이 전송되었습니다:\n\n"${msg}"`);
          input.value = '';
        }
      });
    }

    const btnSummonNow = document.getElementById('btn-summon-all-now');
    if (btnSummonNow) {
      btnSummonNow.addEventListener('click', () => {
        const roomName = this.engine.player.roomName || '현재 위치';
        const floor = this.engine.player.floor || 7;
        const input = document.getElementById('input-broadcast');
        const customMsg = input ? input.value.trim() : '';

        const confirmMsg = customMsg
          ? `🌀 현재 교사 위치 (${floor}층 ${roomName})로 접속 중인 모든 학생을 소환하시겠습니까?\n\n📢 함께 전달할 공지:\n"${customMsg}"`
          : `🌀 현재 교사 위치 (${floor}층 ${roomName})로 접속 중인 모든 학생을 즉시 소환하시겠습니까?`;

        if (!confirm(confirmMsg)) {
          return;
        }

        if (this.networkManager && this.networkManager.socket) {
          const summonMsg = customMsg || '선생님께서 여러분을 현재 위치로 소환하셨습니다!';
          this.networkManager.socket.emit('teacher_summon_all_to_me', {
            floor: this.engine.player.floor,
            room: this.engine.player.room,
            x: this.engine.player.x,
            y: this.engine.player.y,
            message: summonMsg
          });
          alert(`🌀 [전원 소환 완료]\n접속 중인 모든 학생을 현재 교사 위치(${floor}층 ${roomName})로 소환했습니다!${customMsg ? `\n(공지 내용: "${customMsg}")` : ''}`);
        }
      });
    }

    // 학생 누적 백업 JSON 파일 복원 (업로드)
    const btnRestore = document.getElementById('btn-trigger-restore-progress');
    const inputRestore = document.getElementById('input-restore-progress');
    if (btnRestore && inputRestore) {
      btnRestore.addEventListener('click', () => inputRestore.click());
      inputRestore.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!confirm(`선택한 백업 파일("${file.name}")로 서버의 모든 학생 데이터를 복원하시겠습니까?`)) {
          inputRestore.value = '';
          return;
        }
        try {
          const text = await file.text();
          const parsed = JSON.parse(text);
          const res = await fetch('/api/admin/restore-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ allData: parsed })
          });
          const data = await res.json();
          if (data && data.success) {
            alert(`✅ 성공! 총 ${data.count}명 학생의 데이터가 서버에 안전하게 복원되었습니다.`);
          } else {
            alert('복원 실패: 올바른 백업 파일 형식이 아닙니다.');
          }
        } catch (err) {
          alert('복원 중 오류 발생: ' + err.message);
        }
        inputRestore.value = '';
      });
    }

    // ========================================================
    // TEACHER DIRECT STUDENT DATA EDITOR (학생 데이터 직접 조정기)
    // ========================================================
    const selectEditStudent = document.getElementById('admin-edit-student-select');
    const formEditStudent = document.getElementById('admin-edit-student-form');
    const btnRefreshSaved = document.getElementById('btn-refresh-saved-students');
    const btnSaveEdit = document.getElementById('btn-save-student-progress-edit');
    const btnDeleteStudent = document.getElementById('btn-delete-student-progress');

    this.populateEditStudentForm = (sId) => {
      if (!sId || !this._allSavedStudentsData || !this._allSavedStudentsData[sId]) {
        if (formEditStudent) formEditStudent.classList.add('hidden');
        return;
      }
      const s = this._allSavedStudentsData[sId];
      if (formEditStudent) formEditStudent.classList.remove('hidden');

      document.getElementById('admin-edit-student-id').value = sId;
      document.getElementById('admin-edit-student-name').value = s.name || '';
      document.getElementById('admin-edit-student-level').value = s.level || 1;
      document.getElementById('admin-edit-student-gold').value = s.gold !== undefined ? s.gold : 10;
      document.getElementById('admin-edit-student-exp').value = s.exp || 0;
      document.getElementById('admin-edit-gift').checked = !!s.hasReceivedSoongsilGift;
      document.getElementById('admin-edit-locker').checked = !!s.hasOpenedSecretLocker;
      const golemEl = document.getElementById('admin-edit-golem');
      if (golemEl) golemEl.checked = !!s.hasClearedFirstBoss;
      document.getElementById('admin-edit-dragon').checked = !!s.hasClearedDragonRaid;
      const cerberusEl = document.getElementById('admin-edit-cerberus');
      if (cerberusEl) cerberusEl.checked = !!s.hasClearedCerberusRaid;
    };

    this.loadSavedStudentsForEditor = async (selectedIdToKeep = null) => {
      if (!selectEditStudent) return;
      selectEditStudent.innerHTML = '<option value="">-- 불러오는 중... --</option>';
      try {
        const res = await fetch('/api/admin/all-students-progress');
        const data = await res.json();
        const all = (data && data.students) || {};
        this._allSavedStudentsData = all;

        const ids = Object.keys(all).sort();
        if (ids.length === 0) {
          selectEditStudent.innerHTML = '<option value="">(서버에 등록된 학생 기록이 없습니다)</option>';
          if (formEditStudent) formEditStudent.classList.add('hidden');
          return;
        }

        let html = '<option value="">-- 학생을 선택하세요 (' + ids.length + '명 등록됨) --</option>';
        ids.forEach(id => {
          const s = all[id];
          const name = s.name || '무명';
          const lv = s.level || 1;
          const g = s.gold !== undefined ? s.gold : 0;
          html += `<option value="${id}">${id} - ${name} (Lv.${lv} · ${g}G)</option>`;
        });
        selectEditStudent.innerHTML = html;

        if (selectedIdToKeep && all[selectedIdToKeep]) {
          selectEditStudent.value = selectedIdToKeep;
          this.populateEditStudentForm(selectedIdToKeep);
        } else if (!selectEditStudent.value && formEditStudent) {
          formEditStudent.classList.add('hidden');
        }
      } catch (err) {
        selectEditStudent.innerHTML = '<option value="">(목록 로딩 실패)</option>';
      }
    };

    if (btnRefreshSaved) {
      btnRefreshSaved.addEventListener('click', () => {
        this.loadSavedStudentsForEditor(selectEditStudent ? selectEditStudent.value : null);
      });
    }

    if (selectEditStudent) {
      selectEditStudent.addEventListener('change', () => {
        const sId = selectEditStudent.value;
        this.populateEditStudentForm(sId);
      });
    }

    if (btnSaveEdit) {
      btnSaveEdit.addEventListener('click', async () => {
        const sId = document.getElementById('admin-edit-student-id').value;
        if (!sId || !this._allSavedStudentsData || !this._allSavedStudentsData[sId]) {
          alert('수정할 학생을 먼저 선택해 주세요.');
          return;
        }
        const prev = this._allSavedStudentsData[sId];
        const newName = document.getElementById('admin-edit-student-name').value.trim() || prev.name || '학생';
        const newLevel = Math.max(1, parseInt(document.getElementById('admin-edit-student-level').value) || 1);
        const newGold = Math.max(0, parseInt(document.getElementById('admin-edit-student-gold').value) || 0);
        const newExp = Math.max(0, parseInt(document.getElementById('admin-edit-student-exp').value) || 0);
        const newGift = document.getElementById('admin-edit-gift').checked;
        const newLocker = document.getElementById('admin-edit-locker').checked;
        const golemEl = document.getElementById('admin-edit-golem');
        const newGolem = golemEl ? golemEl.checked : !!prev.hasClearedFirstBoss;
        const newDragon = document.getElementById('admin-edit-dragon').checked;
        const cerberusEl = document.getElementById('admin-edit-cerberus');
        const newCerberus = cerberusEl ? cerberusEl.checked : !!prev.hasClearedCerberusRaid;

        const updatedProgress = {
          ...prev,
          name: newName,
          level: newLevel,
          gold: newGold,
          exp: newExp,
          hasReceivedSoongsilGift: newGift,
          hasOpenedSecretLocker: newLocker,
          hasClearedFirstBoss: newGolem,
          hasClearedDragonRaid: newDragon,
          hasClearedCerberusRaid: newCerberus,
          updatedAt: Date.now()
        };

        try {
          const res = await fetch('/api/save-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentId: sId,
              progress: updatedProgress
            })
          });
          const data = await res.json();
          if (data && data.success) {
            this._allSavedStudentsData[sId] = updatedProgress;
            alert(`✅ [${sId} ${newName}] 학생의 정보가 서버에 성공적으로 저장되었습니다!\n(Lv.${newLevel}, ${newGold}G)`);
            this.loadSavedStudentsForEditor(sId);
          } else {
            alert('저장 실패: 서버 응답 오류');
          }
        } catch (e) {
          alert('저장 중 오류: ' + e.message);
        }
      });
    }

    if (btnDeleteStudent) {
      btnDeleteStudent.addEventListener('click', async () => {
        const sId = document.getElementById('admin-edit-student-id').value;
        if (!sId) return;
        if (!confirm(`⚠️ 정말로 [${sId}] 학생의 영구 세이브 기록을 서버에서 완전히 삭제(초기화)하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
          return;
        }
        try {
          const res = await fetch('/api/admin/delete-student-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: sId })
          });
          const data = await res.json();
          if (data && data.success) {
            alert(`🗑️ [${sId}] 학생의 데이터가 서버에서 삭제되었습니다.`);
            if (this._allSavedStudentsData) delete this._allSavedStudentsData[sId];
            if (formEditStudent) formEditStudent.classList.add('hidden');
            this.loadSavedStudentsForEditor();
          } else {
            alert('삭제 실패: 서버 오류');
          }
        } catch (e) {
          alert('삭제 중 오류: ' + e.message);
        }
      });
    }

    // ========================================================
    // TEACHER POP QUIZ CONTROLS (돌발 퀴즈 발령)
    // ========================================================
    const btnLoadRandomQuiz = document.getElementById('btn-admin-load-random-quiz');
    if (btnLoadRandomQuiz) {
      btnLoadRandomQuiz.addEventListener('click', () => {
        const q = this.quizManager.getRandomQuestion();
        if (q) {
          const qEl = document.getElementById('admin-pop-question');
          if (qEl) qEl.value = q.question;
          const opts = q.options || [];
          const o1 = document.getElementById('admin-pop-opt-1'); if (o1) o1.value = opts[0] || '';
          const o2 = document.getElementById('admin-pop-opt-2'); if (o2) o2.value = opts[1] || '';
          const o3 = document.getElementById('admin-pop-opt-3'); if (o3) o3.value = opts[2] || '';
          const o4 = document.getElementById('admin-pop-opt-4'); if (o4) o4.value = opts[3] || '';
          const correctIdx = opts.indexOf(q.answer) + 1;
          const aIdx = document.getElementById('admin-pop-answer-index');
          if (aIdx) aIdx.value = correctIdx > 0 ? String(correctIdx) : '1';
          const expEl = document.getElementById('admin-pop-explanation');
          if (expEl) expEl.value = q.explanation || '';
          alert('🎲 기존 단원 퀴즈가 자동으로 입력되었습니다!\n보상 설정과 제한시간을 확인한 뒤 [발령]을 누르세요.');
        } else {
          alert('불러올 수 있는 퀴즈가 없습니다.');
        }
      });
    }

    const btnBroadcastPopQuiz = document.getElementById('btn-admin-broadcast-pop-quiz');
    if (btnBroadcastPopQuiz) {
      btnBroadcastPopQuiz.addEventListener('click', () => {
        const question = (document.getElementById('admin-pop-question').value || '').trim();
        const opt1 = (document.getElementById('admin-pop-opt-1').value || '').trim();
        const opt2 = (document.getElementById('admin-pop-opt-2').value || '').trim();
        const opt3 = (document.getElementById('admin-pop-opt-3').value || '').trim();
        const opt4 = (document.getElementById('admin-pop-opt-4').value || '').trim();
        const answerIdx = parseInt(document.getElementById('admin-pop-answer-index').value) || 1;
        const duration = parseInt(document.getElementById('admin-pop-duration').value) || 30;
        const explanation = (document.getElementById('admin-pop-explanation').value || '').trim();

        if (!question || !opt1 || !opt2) {
          alert('문제 내용과 최소 2개 이상의 보기를 입력해 주세요.');
          return;
        }

        const options = [opt1, opt2, opt3, opt4].filter(Boolean);
        const answer = options[answerIdx - 1] || options[0];

        const rewardItemKey = document.getElementById('admin-pop-reward-item').value;
        const rewardQty = parseInt(document.getElementById('admin-pop-reward-qty').value) || 1;
        const rewardGold = parseInt(document.getElementById('admin-pop-reward-gold').value) || 0;
        const rewardExp = parseInt(document.getElementById('admin-pop-reward-exp').value) || 0;

        let rewardItemName = '';
        let rewardItemIcon = '🎁';
        if (rewardItemKey !== 'none' && ITEM_DEFINITIONS[rewardItemKey]) {
          rewardItemName = ITEM_DEFINITIONS[rewardItemKey].name;
          rewardItemIcon = ITEM_DEFINITIONS[rewardItemKey].icon || '🎁';
        }

        const quizData = {
          question,
          options,
          answer,
          explanation,
          duration,
          rewardItemKey,
          rewardItemName,
          rewardItemIcon,
          rewardQty,
          rewardGold,
          rewardExp
        };

        if (this.networkManager.socket) {
          this.networkManager.socket.emit('teacher_start_pop_quiz', quizData);
        }

        alert(`📢 전교생 돌발 퀴즈가 성공적으로 발령되었습니다!\n(제한시간: ${duration}초)`);
      });
    }
  }

  requestStudentList() {
    if (this.networkManager.socket) {
      this.networkManager.socket.emit('teacher_get_students');
    }
  }

  renderTeacherStudentList(list = []) {
    const container = document.getElementById('admin-student-list');
    const badge = document.getElementById('admin-student-count-badge');
    const grantTargetSelect = document.getElementById('admin-grant-target');

    // Update grant target select options
    if (grantTargetSelect) {
      const prevVal = grantTargetSelect.value;
      grantTargetSelect.innerHTML = '<option value="ALL">📢 [전체 학생] 접속 중인 모든 학생에게 일괄 지급</option>';
      list.forEach(std => {
        const opt = document.createElement('option');
        opt.value = std.id;
        const loc = std.room === 'hallway' ? '복도' : (std.room === 'room_701' ? '1반' : (std.room === 'room_702' ? '2반' : (std.room === 'room_703' ? '3반' : (std.room === 'room_704' ? '4반' : (std.room === 'room_705' ? '5반' : (std.room === 'room_706' ? '6반' : std.room))))));
        opt.innerText = `👤 [${std.studentId}] ${std.name} (${loc})`;
        grantTargetSelect.appendChild(opt);
      });
      if (prevVal) grantTargetSelect.value = prevVal;
    }

    if (!container) return;

    if (badge) {
      badge.innerText = `접속자 ${list.length}명`;
    }

    if (list.length === 0) {
      container.innerHTML = '<p style="color:#64748b; font-size:12px; text-align:center; padding:15px;">현재 접속 중인 학생이 없습니다.</p>';
      return;
    }

    container.innerHTML = '';
    list.forEach(std => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.padding = '8px 12px';
      row.style.background = '#18181b';
      row.style.border = '1px solid #27272a';
      row.style.borderRadius = '6px';

      const locName = std.room === 'hallway' ? '1학년 복도' : (std.room === 'room_701' ? '1학년 1반' : (std.room === 'room_702' ? '1학년 2반' : (std.room === 'room_703' ? '1학년 3반' : (std.room === 'room_704' ? '1학년 4반' : (std.room === 'room_705' ? '1학년 5반' : (std.room === 'room_706' ? '1학년 6반' : std.room))))));
      const muteStatus = std.isMuted
        ? '<span style="color:#ef4444; font-size:11px; font-weight:bold; margin-left:6px;">[채팅금지중]</span>'
        : '<span style="color:#22c55e; font-size:11px; margin-left:6px;">[정상]</span>';

      row.innerHTML = `
        <div>
          <span style="color:#60a5fa; font-weight:bold;">[${std.studentId}]</span>
          <b style="color:#fff; margin-left:4px;">${std.name}</b>
          <span style="color:#a1a1aa; font-size:11.5px; margin-left:6px;">(${locName})</span>
          ${muteStatus}
        </div>
        <div style="display:flex; gap:6px;">
          <button style="background:#0284c7; color:#fff; font-weight:bold; border:none; padding:3px 8px; border-radius:4px; font-size:11.5px; cursor:pointer;" onclick="window.MainApp.selectGrantTarget('${std.id}')">🎁 지급</button>
          ${std.isMuted 
            ? `<button style="background:#059669; color:#fff; border:none; padding:3px 8px; border-radius:4px; font-size:11.5px; cursor:pointer;" onclick="window.MainApp.unmuteStudent('${std.name}')">채금 해제</button>`
            : `<button style="background:#eab308; color:#000; font-weight:bold; border:none; padding:3px 8px; border-radius:4px; font-size:11.5px; cursor:pointer;" onclick="window.MainApp.muteStudent('${std.name}')">채팅 금지</button>`
          }
          <button style="background:#dc2626; color:#fff; font-weight:bold; border:none; padding:3px 8px; border-radius:4px; font-size:11.5px; cursor:pointer;" onclick="window.MainApp.kickStudent('${std.id}', '${std.name}')">서버 강퇴</button>
        </div>
      `;
      container.appendChild(row);
    });
  }

  deleteChat(chatId) {
    if (this.networkManager.socket) {
      this.networkManager.socket.emit('teacher_delete_message', { chatId });
      const el = document.getElementById(`admin_${chatId}`);
      if (el) el.remove();
    }
  }

  muteStudent(studentName) {
    if (confirm(`'${studentName}' 학생의 채팅을 10분간 금지하시겠습니까?`)) {
      if (this.networkManager.socket) {
        this.networkManager.socket.emit('teacher_mute', { studentName, durationMinutes: 10 });
      }
    }
  }

  unmuteStudent(studentName) {
    if (confirm(`'${studentName}' 학생의 채팅 금지를 해제하시겠습니까?`)) {
      if (this.networkManager.socket) {
        this.networkManager.socket.emit('teacher_unmute', { studentName });
      }
    }
  }

  kickStudent(socketId, studentName) {
    if (confirm(`⚠️ 정말로 '${studentName}' 학생을 서버에서 강제 퇴장(강퇴)시키겠습니까?`)) {
      if (this.networkManager.socket) {
        this.networkManager.socket.emit('teacher_kick_player', { targetSocketId: socketId, studentName });
      }
    }
  }

  getInventory() {
    return this.playerData.inventory;
  }

  addGold(amount) {
    this.playerData.gold += amount;
    this.hudGold.innerText = this.playerData.gold;
    this.saveProgress();
    if (this.networkManager && this.networkManager.socket) {
      this.networkManager.socket.emit('player_stats_sync', {
        level: this.playerData.level,
        exp: this.playerData.exp,
        gold: this.playerData.gold
      });
    }
  }

  setGold(amount) {
    this.playerData.gold = amount;
    this.hudGold.innerText = this.playerData.gold;
    this.saveProgress();
  }

  // Lv.1 ~ Lv.100 성장 (1레벨당 공격력 +1, 방어력 +1 증가 - HP 상승 삭제)
  addExp(amount) {
    if (this.playerData.level >= MAX_LEVEL) {
      this.playerData.exp = 0;
      this.updateExpBar();
      return;
    }

    this.playerData.exp += amount;
    let leveledUp = false;

    while (this.playerData.level < MAX_LEVEL && this.playerData.exp >= this.playerData.level * 100) {
      this.playerData.exp -= this.playerData.level * 100;
      this.playerData.level++;
      leveledUp = true;
    }

    if (this.playerData.level >= MAX_LEVEL) {
      this.playerData.exp = 0;
    }

    if (leveledUp) {
      this.hudLevel.innerText = `Lv.${this.playerData.level}`;
      this.recalcCombatStats();
      this.updateHpBar();
      this.showLevelUpBanner(this.playerData.level);
    }

    this.saveProgress();
    this.updateExpBar();

    if (this.networkManager && this.networkManager.socket) {
      this.networkManager.socket.emit('player_stats_sync', {
        level: this.playerData.level,
        exp: this.playerData.exp,
        gold: this.playerData.gold
      });
    }
  }

  updateExpBar() {
    if (this.playerData.level >= MAX_LEVEL) {
      const txt = document.getElementById('side-exp-text');
      const fill = document.getElementById('side-exp-fill');
      if (txt) txt.innerText = 'MAX (Lv.100)';
      if (fill) fill.style.width = '100%';
      return;
    }
    const maxExp = this.playerData.level * 100;
    const pct = Math.min(100, Math.floor((this.playerData.exp / maxExp) * 100));
    const txt = document.getElementById('side-exp-text');
    const fill = document.getElementById('side-exp-fill');
    if (txt) txt.innerText = `${this.playerData.exp} / ${maxExp}`;
    if (fill) fill.style.width = `${pct}%`;
  }

  showLevelUpBanner(level) {
    const banner = document.getElementById('level-up-banner');
    const title = document.getElementById('level-up-title');
    if (!banner) return;

    if (title) title.innerText = `Lv.${level} 달성!`;
    if (window.AudioManager) window.AudioManager.playFanfare();

    if (this._levelUpTimer) clearTimeout(this._levelUpTimer);
    if (this._levelUpFadeTimer) clearTimeout(this._levelUpFadeTimer);

    banner.classList.remove('hidden', 'fade-out');

    this._levelUpFadeTimer = setTimeout(() => {
      banner.classList.add('fade-out');
    }, 3200);

    this._levelUpTimer = setTimeout(() => {
      banner.classList.add('hidden');
      banner.classList.remove('fade-out');
    }, 3700);
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('game-toast');
    const toastText = document.getElementById('game-toast-text');
    const toastIcon = document.getElementById('game-toast-icon');
    if (!toast || !toastText) {
      console.log(`[Toast] ${message}`);
      return;
    }

    if (this._toastTimer) clearTimeout(this._toastTimer);
    if (this._toastFadeTimer) clearTimeout(this._toastFadeTimer);

    toast.className = `game-toast toast-${type}`;
    if (toastIcon) {
      if (type === 'success') toastIcon.innerText = '✨';
      else if (type === 'warning') toastIcon.innerText = '⏳';
      else toastIcon.innerText = '🚰';
    }
    toastText.innerText = message;
    toast.classList.remove('hidden', 'fade-out');

    this._toastFadeTimer = setTimeout(() => {
      toast.classList.add('fade-out');
    }, 2800);

    this._toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
      toast.classList.remove('fade-out');
    }, 3200);
  }

  addItem(itemId, name, count = 1, icon = '📦', meta = {}) {
    const existing = this.playerData.inventory.find(i => i.item === itemId);
    if (existing) {
      existing.count += count;
    } else {
      this.playerData.inventory.push({
        item: itemId,
        name,
        count,
        icon,
        type: meta.type || (itemId.startsWith('equip_') ? 'equipment' : 'material'),
        slot: meta.slot || null,
        stats: meta.stats || null,
        heal: meta.heal || 0,
        effect: meta.effect || ''
      });
    }
    this.saveProgress();
  }

  removeItem(itemId, count = 1) {
    const existing = this.playerData.inventory.find(i => i.item === itemId);
    if (existing) {
      existing.count -= count;
      if (existing.count <= 0) {
        Object.keys(this.playerData.equipment).forEach(slot => {
          if (this.playerData.equipment[slot] && this.playerData.equipment[slot].item === itemId) {
            this.playerData.equipment[slot] = null;
          }
        });
        this.playerData.inventory = this.playerData.inventory.filter(i => i.item !== itemId);
        this.recalcCombatStats();
      }
    }
    this.saveProgress();
  }

  // =========================================================================
  // PERSISTENCE (LocalStorage + 서버 영구 저장 이중화)
  // =========================================================================
  saveProgress(forceServerSync = false) {
    if (!this.playerData || this.playerData.isTeacher) return;
    if (!this.playerData.studentId || this.playerData.studentId === '교사') return;

    try {
      const saveData = {
        name: this.playerData.name,
        studentId: this.playerData.studentId,
        grade: this.playerData.grade,
        level: this.playerData.level,
        exp: this.playerData.exp,
        gold: this.playerData.gold,
        baseHp: this.playerData.baseHp,
        baseAtk: this.playerData.baseAtk,
        baseDef: this.playerData.baseDef,
        inventory: this.playerData.inventory,
        equipment: this.playerData.equipment,
        hairColor: this.playerData.hairColor,
        outfitColor: this.playerData.outfitColor,
        hasReceivedSoongsilGift: !!this.playerData.hasReceivedSoongsilGift,
        hasOpenedSecretLocker: !!this.playerData.hasOpenedSecretLocker,
        hasCheckedMirror: !!this.playerData.hasCheckedMirror,
        hasOpenedLostBox: !!this.playerData.hasOpenedLostBox,
        hasClearedFirstBoss: !!this.playerData.hasClearedFirstBoss,
        hasClearedDragonRaid: !!this.playerData.hasClearedDragonRaid,
        hasClearedCerberusRaid: !!this.playerData.hasClearedCerberusRaid,
        titles: this.playerData.titles || [],
        equippedTitle: this.playerData.equippedTitle || null,
        updatedAt: Date.now()
      };
      localStorage.setItem('soongsil_save_' + this.playerData.studentId, JSON.stringify(saveData));

      // 무료 서버 트래픽 최소화: 데이터 변경 감지 (Dirty Check)
      // 학생이 아무런 아이템/골드/경험치/장비 변동 없이 단순 이동/대기 중일 때는 서버 POST 요청을 100% 생략!
      const dataHash = `${saveData.level}_${saveData.exp}_${saveData.gold}_${saveData.inventory.length}_${JSON.stringify(saveData.equipment)}_${saveData.hasReceivedSoongsilGift}_${saveData.hasOpenedSecretLocker}_${saveData.hasCheckedMirror}_${saveData.hasOpenedLostBox}_${saveData.hasClearedFirstBoss}_${saveData.hasClearedDragonRaid}_${(saveData.titles || []).join(',')}_${saveData.equippedTitle}`;
      if (!forceServerSync && this._lastSavedDataHash === dataHash) {
        return;
      }
      this._lastSavedDataHash = dataHash;

      this.syncProgressToServer(saveData);
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  async syncProgressToServer(saveData) {
    if (!saveData || !saveData.studentId || saveData.studentId === '교사') return;
    try {
      await fetch('/api/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: saveData.studentId,
          progress: saveData
        })
      });
    } catch (err) {
      console.warn('[Sync] Server progress sync failed:', err);
    }
  }

  loadProgress(studentId) {
    if (!studentId || studentId === '교사') return null;
    try {
      const raw = localStorage.getItem('soongsil_save_' + studentId);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    }
    return null;
  }

  async fetchProgressFromServer(studentId) {
    if (!studentId || studentId === '교사') return null;
    try {
      const res = await fetch(`/api/load-progress?studentId=${encodeURIComponent(studentId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.progress) {
          return data.progress;
        }
      }
    } catch (e) {
      console.warn('[Storage] Server progress fetch failed:', e);
    }
    return null;
  }

  clearLocalStudentData(studentId) {
    if (!studentId || studentId === '교사') return;
    try {
      localStorage.removeItem('soongsil_save_' + studentId);
      localStorage.removeItem('soongsil_gift_' + studentId);
      localStorage.removeItem('soongsil_secret_locker_' + studentId);
      localStorage.removeItem('soongsil_mirror_' + studentId);
      localStorage.removeItem('soongsil_lost_box_' + studentId);
      localStorage.removeItem('soongsil_first_boss_cleared_' + studentId);
      localStorage.removeItem('soongsil_dragon_cleared_' + studentId);
      localStorage.removeItem('soongsil_cerberus_cleared_' + studentId);
      console.log(`[Storage] 학생(${studentId}) 로컬 브라우저 세이브 초기화 완료`);
    } catch (e) {
      console.warn('Failed to clear local student data', e);
    }
  }

  onAdminProgressSynced(updatedProgress) {
    if (!this.playerData || this.playerData.studentId !== updatedProgress.studentId) return;
    this.playerData.level = updatedProgress.level || this.playerData.level;
    this.playerData.gold = updatedProgress.gold !== undefined ? updatedProgress.gold : this.playerData.gold;
    this.playerData.exp = updatedProgress.exp !== undefined ? updatedProgress.exp : this.playerData.exp;
    this.playerData.name = updatedProgress.name || this.playerData.name;
    this.playerData.hasReceivedSoongsilGift = !!updatedProgress.hasReceivedSoongsilGift;
    this.playerData.hasOpenedSecretLocker = !!updatedProgress.hasOpenedSecretLocker;
    this.playerData.hasCheckedMirror = !!updatedProgress.hasCheckedMirror;
    this.playerData.hasOpenedLostBox = !!updatedProgress.hasOpenedLostBox;
    this.playerData.hasClearedFirstBoss = !!updatedProgress.hasClearedFirstBoss;
    this.playerData.hasClearedDragonRaid = !!updatedProgress.hasClearedDragonRaid;
    this.playerData.hasClearedCerberusRaid = !!updatedProgress.hasClearedCerberusRaid;
    this.saveProgress(true);
    this.recalcCombatStats();
    this.updateExpBar();
    this.updatePlayerNameDisplay();
    this.showToast(`선생님께서 학생 정보를 갱신하셨습니다! (Lv.${this.playerData.level}, ${this.playerData.gold}G)`, 'info');
  }

  onAdminProgressReset(data) {
    if (this.playerData && this.playerData.studentId === data.studentId) {
      this.clearLocalStudentData(data.studentId);
      alert('⚠️ 선생님에 의해 플레이 세이브 데이터가 완전히 초기화(삭제)되었습니다.\n처음 화면으로 돌아갑니다.');
      window.location.reload();
    }
  }

  async getBestProgress(studentId) {
    if (!studentId || studentId === '교사') return null;
    const local = this.loadProgress(studentId);
    let server = null;
    let deletedAt = 0;
    try {
      const res = await fetch(`/api/load-progress?studentId=${encodeURIComponent(studentId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          server = data.progress;
          deletedAt = data.deletedAt || 0;
        }
      }
    } catch (e) {
      console.warn('[Storage] Server progress fetch failed:', e);
    }

    // 교사가 서버에서 삭제(초기화)한 경우: 브라우저 localStorage의 옛날 데이터로 부활하지 못하도록 영구 제거
    if (deletedAt > 0) {
      const localTime = (local && local.updatedAt) || 0;
      if (deletedAt >= localTime) {
        console.log(`[Storage] 학생(${studentId}) 데이터가 교사에 의해 삭제(초기화)되었습니다. 로컬 세이브를 클리어합니다.`);
        this.clearLocalStudentData(studentId);
        return null;
      }
    }

    if (server && local) {
      const serverTime = server.updatedAt || 0;
      const localTime = local.updatedAt || 0;
      if (serverTime >= localTime) {
        try { localStorage.setItem('soongsil_save_' + studentId, JSON.stringify(server)); } catch (e) {}
        return server;
      } else {
        this.syncProgressToServer(local);
        return local;
      }
    }
    if (server) {
      try { localStorage.setItem('soongsil_save_' + studentId, JSON.stringify(server)); } catch (e) {}
      return server;
    }
    if (local) {
      this.syncProgressToServer(local);
      return local;
    }
    return null;
  }

  // =========================================================================
  // TEACHER ITEM GRANT & HANDLERS
  // =========================================================================
  onItemGranted(data) {
    if (!data) return;
    if (data.itemKey === 'gold') {
      this.addGold(data.count || 1);
    } else {
      this.addItem(data.itemKey, data.name, data.count, data.icon, data.meta);
    }
    if (!this.modalInventory.classList.contains('hidden')) {
      this.openInventory();
    }
    this.saveProgress();

    const reasonText = data.reason ? `\n\n💡 선생님 말씀: "${data.reason}"` : '';
    alert(`🎁 [선생님 특별 선물 도착!]\n\n선생님께서 [${data.icon || '🎁'} ${data.name} x${data.count}개]를 지급해 주셨습니다!${reasonText}`);
  }

  setGrantCount(n) {
    const el = document.getElementById('admin-grant-count');
    if (el) el.value = n;
  }

  addGrantCount(n) {
    const el = document.getElementById('admin-grant-count');
    if (el) {
      const cur = parseInt(el.value) || 0;
      el.value = Math.max(1, Math.min(9999, cur + n));
    }
  }

  // ========================================================
  // REAL-TIME LEADERBOARD TOP 5 (실시간 랭킹보드)
  // ========================================================
  openLeaderboard() {
    const modal = document.getElementById('modal-leaderboard');
    if (!modal) return;

    if (window.AudioManager) window.AudioManager.playSelect();

    const listEl = document.getElementById('leaderboard-list-container');
    listEl.innerHTML = '<div style="text-align:center; padding:20px; color:#94a3b8;">⏳ 실시간 랭킹 데이터를 불러오는 중...</div>';

    document.getElementById('my-rank-position').innerText = '-위';
    document.getElementById('my-rank-level').innerText = `Lv.${this.playerData.level || 1}`;

    if (this.networkManager && this.networkManager.socket) {
      this.networkManager.socket.emit('player_stats_sync', {
        level: this.playerData.level,
        exp: this.playerData.exp,
        gold: this.playerData.gold
      });
      this.networkManager.socket.emit('get_leaderboard');
    } else {
      this.onLeaderboardData([{
        name: this.playerData.name,
        studentId: this.playerData.studentId,
        level: this.playerData.level,
        exp: this.playerData.exp,
        gold: this.playerData.gold
      }]);
    }

    modal.classList.remove('hidden');
  }

  onLeaderboardData(list) {
    const listEl = document.getElementById('leaderboard-list-container');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (!Array.isArray(list) || list.length === 0) {
      listEl.innerHTML = '<div style="text-align:center; padding:20px; color:#94a3b8;">현재 등록된 랭킹 데이터가 없습니다.</div>';
      return;
    }

    const rankIcons = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

    let myRank = -1;
    list.forEach((entry, idx) => {
      const isMe = (entry.name === this.playerData.name || entry.studentId === this.playerData.studentId);
      if (isMe) myRank = idx + 1;

      const row = document.createElement('div');
      row.className = `leaderboard-item rank-${idx + 1}`;
      if (isMe) {
        row.style.borderColor = '#3b82f6';
        row.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.4)';
      }

      const icon = rankIcons[idx] || `${idx + 1}위`;
      row.innerHTML = `
        <div class="leaderboard-left">
          <span class="leaderboard-rank-badge">${icon}</span>
          <div style="display:flex; align-items:center; min-width:0; overflow:hidden;">
            <span class="leaderboard-student-name">${entry.name || '학생'}</span>
            <span class="leaderboard-student-id">(${entry.studentId || ''})</span>
            ${isMe ? '<span style="font-size:10px; background:#2563eb; color:#fff; padding:1px 5px; border-radius:4px; margin-left:5px; font-weight:800; flex-shrink:0;">나</span>' : ''}
          </div>
        </div>
        <div class="leaderboard-right">
          <span class="leaderboard-level-pill">Lv.${entry.level || 1}</span>
          <span class="leaderboard-exp-pill">🪙 ${entry.gold || 0}G</span>
        </div>
      `;
      listEl.appendChild(row);
    });

    const myRankEl = document.getElementById('my-rank-position');
    if (myRankEl) {
      myRankEl.innerText = myRank > 0 ? `${myRank}위` : '순위권 밖';
    }
    const myLevelEl = document.getElementById('my-rank-level');
    if (myLevelEl) {
      myLevelEl.innerText = `Lv.${this.playerData.level || 1}`;
    }
  }

  // ========================================================
  // TEACHER POP QUIZ CLIENT HANDLER (돌발 퀴즈 모달 & 타이머)
  // ========================================================
  onPopQuizStarted(data) {
    if (!data) return;

    const modal = document.getElementById('modal-pop-quiz');
    if (!modal) return;

    if (window.AudioManager) {
      window.AudioManager.playFanfare();
    }

    // Set reward description
    const rewardDescEl = document.getElementById('pop-quiz-reward-desc');
    const rewardParts = [];
    if (data.rewardItemKey && data.rewardItemKey !== 'none' && data.rewardItemName) {
      rewardParts.push(`${data.rewardItemIcon || '🎁'} ${data.rewardItemName} x${data.rewardQty || 1}개`);
    }
    if (data.rewardGold > 0) rewardParts.push(`🪙 ${data.rewardGold}G`);
    if (data.rewardExp > 0) rewardParts.push(`🌟 ${data.rewardExp} EXP`);
    const rewardSummary = rewardParts.length > 0 ? rewardParts.join(' + ') : '명예의 영광';
    if (rewardDescEl) rewardDescEl.innerText = rewardSummary;

    // Set question
    document.getElementById('pop-quiz-question').innerText = data.question;

    // Reset feedback & close button
    const feedbackBox = document.getElementById('pop-quiz-feedback');
    feedbackBox.classList.add('hidden');
    const btnClose = document.getElementById('btn-close-pop-quiz');
    btnClose.classList.add('hidden');

    const optionsGrid = document.getElementById('pop-quiz-options');
    optionsGrid.innerHTML = '';

    const timerText = document.getElementById('pop-quiz-timer-text');
    const timerFill = document.getElementById('pop-quiz-timer-fill');

    let timeLeft = data.duration || 30;
    const totalTime = timeLeft;
    if (timerText) timerText.innerText = timeLeft;
    if (timerFill) timerFill.style.width = '100%';

    let answered = false;

    if (this.popQuizTimer) clearInterval(this.popQuizTimer);

    const allButtons = [];

    this.popQuizTimer = setInterval(() => {
      timeLeft--;
      if (timerText) timerText.innerText = Math.max(0, timeLeft);
      if (timerFill) {
        const pct = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
        timerFill.style.width = `${pct}%`;
      }

      if (timeLeft <= 0) {
        clearInterval(this.popQuizTimer);
        if (!answered) {
          answered = true;
          allButtons.forEach(b => b.disabled = true);
          if (window.AudioManager) window.AudioManager.playWrong();
          feedbackBox.classList.remove('hidden');
          document.getElementById('pop-quiz-feedback-icon').innerText = '⏰';
          document.getElementById('pop-quiz-feedback-text').innerText = '제한시간 초과!';
          document.getElementById('pop-quiz-feedback-exp').innerText = `정답: '${data.answer}'\n${data.explanation || ''}`;
          btnClose.classList.remove('hidden');
        }
      }
    }, 1000);

    data.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.innerText = opt;
      allButtons.push(btn);

      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        clearInterval(this.popQuizTimer);
        allButtons.forEach(b => b.disabled = true);

        const isCorrect = (opt === data.answer);
        if (isCorrect) {
          btn.classList.add('correct');
          if (window.AudioManager) {
            window.AudioManager.playCorrect();
            setTimeout(() => { if (window.AudioManager) window.AudioManager.playFanfare(); }, 120);
          }

          // Grant Rewards!
          if (data.rewardItemKey && data.rewardItemKey !== 'none' && data.rewardItemName) {
            this.addItem(data.rewardItemKey, data.rewardItemName, data.rewardQty || 1, data.rewardItemIcon || '🎁');
          }
          if (data.rewardGold > 0) this.addGold(data.rewardGold);
          if (data.rewardExp > 0) this.addExp(data.rewardExp);

          if (this.networkManager.socket) {
            this.networkManager.socket.emit('pop_quiz_solved', {
              studentName: this.playerData.name,
              rewardText: rewardSummary
            });
          }

          feedbackBox.classList.remove('hidden');
          document.getElementById('pop-quiz-feedback-icon').innerText = '🎉';
          document.getElementById('pop-quiz-feedback-text').innerText = '정답입니다! 특별 보상 획득!';
          document.getElementById('pop-quiz-feedback-exp').innerText = `${data.explanation || ''}\n\n🎁 획득 보상: ${rewardSummary}`;
        } else {
          btn.classList.add('wrong');
          if (window.AudioManager) window.AudioManager.playWrong();
          feedbackBox.classList.remove('hidden');
          document.getElementById('pop-quiz-feedback-icon').innerText = '😢';
          document.getElementById('pop-quiz-feedback-text').innerText = '오답입니다!';
          document.getElementById('pop-quiz-feedback-exp').innerText = `정답: '${data.answer}'\n${data.explanation || ''}`;
        }

        btnClose.classList.remove('hidden');
      });

      optionsGrid.appendChild(btn);
    });

    modal.classList.remove('hidden');
  }

  selectGrantTarget(socketId) {
    const sel = document.getElementById('admin-grant-target');
    if (sel) {
      sel.value = socketId;
      sel.focus();
    }
    const reasonInput = document.getElementById('admin-grant-reason');
    if (reasonInput) reasonInput.focus();
  }

  // =========================================================================
  // 🏷️ PLAYER NAME & TITLE DISPLAY HELPER
  // =========================================================================
  updatePlayerNameDisplay() {
    const title = this.playerData.equippedTitle;
    const name = this.playerData.name || '학생';
    const fullDisplayName = title ? `[${title}] ${name}` : name;
    if (this.hudName) {
      this.hudName.innerText = fullDisplayName;
    }
    if (this.engine && this.engine.player) {
      this.engine.player.name = name;
      this.engine.player.equippedTitle = title;
    }
  }

  // =========================================================================
  // 🏪 매점 (CANTEEN STORE) - 아이템 및 장비 매각 시스템
  // =========================================================================
  openStoreModal() {
    const modal = document.getElementById('modal-store');
    if (!modal) return;

    this.currentStoreTab = this.currentStoreTab || 'all';
    this.renderStoreModal();
    modal.classList.remove('hidden');

    if (!this._storeTabsInitialized) {
      this._storeTabsInitialized = true;
      const tabContainer = document.getElementById('store-tab-container');
      if (tabContainer) {
        tabContainer.querySelectorAll('.inv-tab-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            tabContainer.querySelectorAll('.inv-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.currentStoreTab = btn.dataset.tab;
            this.renderStoreModal();
          });
        });
      }
      const btnCloseX = document.getElementById('btn-close-store-x');
      if (btnCloseX) btnCloseX.addEventListener('click', () => modal.classList.add('hidden'));
      const btnClose = document.getElementById('btn-close-store');
      if (btnClose) btnClose.addEventListener('click', () => modal.classList.add('hidden'));
    }
  }

  getItemSellPrice(itemId) {
    if (this.ITEM_SELL_PRICES && this.ITEM_SELL_PRICES[itemId] !== undefined) {
      return this.ITEM_SELL_PRICES[itemId];
    }
    if (itemId.startsWith('equip_bronze')) return 10;
    if (itemId.startsWith('equip_leather')) return 8;
    if (itemId.startsWith('equip_wood')) return 3;
    if (itemId.startsWith('item_')) return 2;
    return 1;
  }

  renderStoreModal() {
    const goldDisplay = document.getElementById('store-gold-display');
    if (goldDisplay) goldDisplay.innerText = `${this.playerData.gold} G`;

    const listContainer = document.getElementById('store-items-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const inv = this.playerData.inventory || [];
    const equippedItemIds = new Set(
      Object.values(this.playerData.equipment || {})
        .filter(eq => eq && eq.item)
        .map(eq => eq.item)
    );

    const filtered = inv.filter(invItem => {
      const def = (window.ALL_GAME_ITEMS && window.ALL_GAME_ITEMS[invItem.item]) || {};
      const type = (def.meta && def.meta.type) || (invItem.item.startsWith('equip_') ? 'equipment' : 'material');

      // 소비품(물약, 주문서 등) 및 작동권/퀘스트 아이템은 매점 매각 금지
      if (type === 'consumable' || invItem.item.includes('potion') || invItem.item.includes('scroll') || invItem.item === 'equip_elevator_pass' || def.meta?.isQuestItem) {
        return false;
      }

      if (this.currentStoreTab === 'all') return true;
      if (this.currentStoreTab === 'equipment') return type === 'equipment' || invItem.item.startsWith('equip_');
      if (this.currentStoreTab === 'material') return type === 'material' || (!invItem.item.startsWith('equip_'));
      return true;
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align:center; padding: 36px 12px; color: #64748b;">
          <div style="font-size: 32px; margin-bottom: 6px;">📦</div>
          <div style="font-size: 13.5px; font-weight:700;">해당 분류에 판매 가능한 아이템이 없습니다.</div>
          <div style="font-size: 11.5px; margin-top: 4px;">퀴즈를 풀거나 몬스터를 사냥하여 재료와 장비를 획득해보세요!</div>
        </div>
      `;
      return;
    }

    filtered.forEach(invItem => {
      const def = (window.ALL_GAME_ITEMS && window.ALL_GAME_ITEMS[invItem.item]) || {};
      const icon = def.icon || invItem.icon || '📦';
      const name = def.name || invItem.name || invItem.item;
      const isEquipped = equippedItemIds.has(invItem.item);
      const unitPrice = this.getItemSellPrice(invItem.item);
      const count = invItem.count || 1;
      const isStackable = count > 1;

      const itemCard = document.createElement('div');
      itemCard.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: ${isEquipped ? 'rgba(30, 41, 59, 0.5)' : '#1e293b'};
        border: 1.5px solid ${isEquipped ? '#475569' : '#334155'};
        border-radius: 8px;
        padding: 8px 12px;
        transition: border-color 0.15s;
      `;

      itemCard.innerHTML = `
        <div style="display:flex; align-items:center; gap: 10px;">
          <div style="font-size: 26px; line-height: 1;">${icon}</div>
          <div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-weight: 800; font-size: 13.5px; color: ${isEquipped ? '#94a3b8' : '#f8fafc'};">${name}</span>
              ${isEquipped ? '<span style="font-size:10.5px; font-weight:700; background:#0284c7; color:#fff; padding:2px 6px; border-radius:4px;">🛡️ 착용 중</span>' : ''}
              <span style="font-size: 12px; color: #38bdf8; font-weight: 700;">x${count}</span>
            </div>
            <div style="font-size: 11.5px; color: #fbbf24; margin-top: 2px;">
              개당 판매가: <b>${unitPrice} G</b> ${isStackable ? `<span style="color:#94a3b8;">(전체: ${unitPrice * count} G)</span>` : ''}
            </div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap: 6px;">
          ${isEquipped ? `
            <button disabled style="padding: 6px 12px; font-size: 11.5px; font-weight: 700; background: #334155; color: #64748b; border: 1px solid #475569; border-radius: 6px; cursor: not-allowed;">
              착용 중
            </button>
          ` : `
            ${isStackable ? `
              <button class="btn-sell-one btn-secondary" style="padding: 5px 10px; font-size: 11.5px; font-weight: 700; border-color: #f59e0b; color: #fef08a;">
                1개 판매 (+${unitPrice}G)
              </button>
              <button class="btn-sell-all btn-primary" style="padding: 5px 10px; font-size: 11.5px; font-weight: 800; background: #d97706; border-color: #b45309;">
                전체 판매 (+${unitPrice * count}G)
              </button>
            ` : `
              <button class="btn-sell-one btn-primary" style="padding: 6px 12px; font-size: 12px; font-weight: 800; background: #d97706; border-color: #b45309;">
                판매 (+${unitPrice}G)
              </button>
            `}
          `}
        </div>
      `;

      if (!isEquipped) {
        const btnOne = itemCard.querySelector('.btn-sell-one');
        if (btnOne) {
          btnOne.addEventListener('click', () => {
            this.sellItem(invItem.item, 1, name, unitPrice);
          });
        }
        const btnAll = itemCard.querySelector('.btn-sell-all');
        if (btnAll) {
          btnAll.addEventListener('click', () => {
            this.sellItem(invItem.item, count, name, unitPrice * count);
          });
        }
      }

      listContainer.appendChild(itemCard);
    });
  }

  sellItem(itemId, count, itemName, totalGold) {
    const def = (window.ALL_GAME_ITEMS && window.ALL_GAME_ITEMS[itemId]) || {};
    const type = (def.meta && def.meta.type) || '';
    if (type === 'consumable' || itemId.includes('potion') || itemId.includes('scroll')) {
      this.showToast('소비품(물약 및 주문서)은 매점에서 매각할 수 없습니다!', 'warning');
      return;
    }

    const existing = (this.playerData.inventory || []).find(i => i.item === itemId);
    if (!existing || existing.count < count) {
      this.showToast('보유 수량이 부족합니다.', 'error');
      return;
    }

    const equippedItemIds = new Set(
      Object.values(this.playerData.equipment || {})
        .filter(eq => eq && eq.item)
        .map(eq => eq.item)
    );
    if (equippedItemIds.has(itemId)) {
      this.showToast('착용 중인 장비는 판매할 수 없습니다!', 'warning');
      return;
    }

    this.removeItem(itemId, count);
    this.playerData.gold = (this.playerData.gold || 0) + totalGold;
    if (this.hudGold) this.hudGold.innerText = this.playerData.gold;
    const invGoldDisplay = document.getElementById('inv-gold-display');
    if (invGoldDisplay) invGoldDisplay.innerText = `${this.playerData.gold} G`;

    this.showToast(`🪙 ${itemName} x${count}개 매각 완료! (+${totalGold} G)`, 'success');
    this.saveProgress();
    this.renderStoreModal();

    const modalInv = document.getElementById('modal-inventory');
    if (modalInv && !modalInv.classList.contains('hidden') && this.renderInventory) {
      this.renderInventory();
    }
  }

  // =========================================================================
  // 🏅 호칭 교환소 (TITLE EXCHANGE)
  // =========================================================================
  openTitleExchangeModal() {
    const modal = document.getElementById('modal-title-exchange');
    if (!modal) return;

    this.renderTitleExchangeModal();
    modal.classList.remove('hidden');

    if (!this._titleExchangeInitialized) {
      this._titleExchangeInitialized = true;
      const btnCloseX = document.getElementById('btn-close-title-x');
      if (btnCloseX) btnCloseX.addEventListener('click', () => modal.classList.add('hidden'));
      const btnClose = document.getElementById('btn-close-title');
      if (btnClose) btnClose.addEventListener('click', () => modal.classList.add('hidden'));
      const btnUnequip = document.getElementById('btn-unequip-title');
      if (btnUnequip) {
        btnUnequip.addEventListener('click', () => {
          this.unequipTitle();
        });
      }
    }
  }

  renderTitleExchangeModal() {
    const badge = document.getElementById('current-equipped-title-badge');
    const btnUnequip = document.getElementById('btn-unequip-title');
    const equipped = this.playerData.equippedTitle;

    if (badge) {
      badge.innerText = equipped ? `[${equipped}]` : '없음';
      badge.style.color = equipped ? '#fef08a' : '#94a3b8';
    }
    if (btnUnequip) {
      btnUnequip.style.display = equipped ? 'inline-block' : 'none';
    }

    const listContainer = document.getElementById('title-exchange-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const titles = this.TITLE_DEFINITIONS || [];
    const ownedTitles = this.playerData.titles || [];

    
    // [특별 이벤트] 숭실 삼디다스 실내화 교환 카드
    const hasShoes = (this.playerData.inventory || []).some(i => i.item === 'equip_shoes_samdidas') ||
                    (this.playerData.equipment && this.playerData.equipment.shoes && this.playerData.equipment.shoes.item === 'equip_shoes_samdidas');
    const examItem = (this.playerData.inventory || []).find(i => i.item === 'item_perfect_exam');
    const examCount = examItem ? examItem.count : 0;
    const evalItem = (this.playerData.inventory || []).find(i => i.item === 'item_eval_paper');
    const evalCount = evalItem ? evalItem.count : 0;

    const eventCard = document.createElement('div');
    eventCard.className = 'title-card';
    eventCard.style.borderColor = hasShoes ? '#22c55e' : '#38bdf8';
    eventCard.style.background = 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.95) 100%)';
    eventCard.innerHTML = `
      <div class="title-card-header">
        <b style="color:#67e8f9; font-size:14px;">👟 숭실 삼디다스 실내화 (이벤트 교환)</b>
        <span style="font-size:11px; font-weight:700; color:${hasShoes ? '#4ade80' : '#f59e0b'};">
          ${hasShoes ? '보유/장착중' : '교환 가능'}
        </span>
      </div>
      <p style="color:#cbd5e1; font-size:12px; margin:4px 0 6px;">
        1티어 입문 신발! 착용 시 달리기 질주(Shift)가 가능합니다. (이동속도 27% 증가)
      </p>
      <div style="font-size:11.5px; color:#94a3b8; margin-bottom:6px;">
        교환 조건: <b>💯 백점만점 시험지 1개</b> 또는 <b>📜 A+ 만점 수행평가지 1개</b>
        <br><span style="color:#fef08a;">(보유: 시험지 ${examCount}개 / 수행평가지 ${evalCount}개)</span>
      </div>
    `;

    const btnExchangeEvent = document.createElement('button');
    btnExchangeEvent.className = 'btn-title-action';
    if (hasShoes) {
      btnExchangeEvent.innerText = '보유중';
      btnExchangeEvent.disabled = true;
      btnExchangeEvent.style.opacity = '0.6';
    } else if (examCount >= 1 || evalCount >= 1) {
      btnExchangeEvent.innerText = examCount >= 1 ? '💯 시험지로 교환' : '📜 수행평가지로 교환';
      btnExchangeEvent.style.background = '#2563eb';
      btnExchangeEvent.style.color = '#fff';
      btnExchangeEvent.addEventListener('click', () => {
        const useExam = (examCount >= 1);
        const costItemId = useExam ? 'item_perfect_exam' : 'item_eval_paper';
        const costItemName = useExam ? '💯 백점만점 시험지' : '📜 A+ 만점 수행평가지';
        
        if (confirm(`👟 [${costItemName}] 1개를 소모하여 [👟 숭실 삼디다스 실내화]를 교환하시겠습니까?`)) {
          this.removeItem(costItemId, 1);
          this.addItem('equip_shoes_samdidas', '👟 숭실 삼디다스 실내화', 1, '👟', {
            type: 'equipment',
            slot: 'shoes',
            stats: { atk: 2, def: 2, hp: 10 },
            effect: '1티어 실내화 · 달리기 질주(Shift) 가능 (속도 27% 증가)'
          });
          this.equipItem('equip_shoes_samdidas');
          this.updateDashButtonUI();
          if (window.AudioManager && window.AudioManager.playFanfare) {
            window.AudioManager.playFanfare();
          }
          alert('🎉 [이벤트 신발 교환 완료!]\n\n[👟 숭실 삼디다스 실내화]를 획득하여 장착했습니다!\n이제 Shift 키를 누르면 경쾌하게 달릴 수 있습니다! 🏃💨');
          this.renderTitleExchangeModal();
        }
      });
    } else {
      btnExchangeEvent.innerText = '재료 부족';
      btnExchangeEvent.disabled = true;
      btnExchangeEvent.style.opacity = '0.5';
    }
    eventCard.appendChild(btnExchangeEvent);
    listContainer.appendChild(eventCard);

    titles.forEach(t => {
      const isOwned = ownedTitles.includes(t.name);
      const isEquipped = (this.playerData.equippedTitle === t.name);

      let canAfford = false;
      let costText = '';
      let progressText = '';

      if (t.costType === 'item') {
        const myItem = (this.playerData.inventory || []).find(i => i.item === t.costItem);
        const myCount = myItem ? myItem.count : 0;
        canAfford = (myCount >= t.costAmount);
        costText = `${t.costItemName} ${t.costAmount}개`;
        progressText = `(보유: ${myCount} / ${t.costAmount})`;
      } else if (t.costType === 'gold') {
        const myGold = this.playerData.gold || 0;
        canAfford = (myGold >= t.costAmount);
        costText = `황금 ${t.costAmount} G`;
        progressText = `(보유: ${myGold} / ${t.costAmount} G)`;
      }

      const card = document.createElement('div');
      card.style.cssText = `
        background: ${isEquipped ? 'rgba(56, 189, 248, 0.12)' : (isOwned ? 'rgba(30, 41, 59, 0.7)' : '#1e293b')};
        border: 2px solid ${isEquipped ? '#38bdf8' : (isOwned ? '#10b981' : '#334155')};
        border-radius: 10px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      `;

      card.innerHTML = `
        <div style="flex: 1;">
          <div style="display:flex; align-items:center; gap: 8px;">
            <span style="font-size: 16px; font-weight: 900; color: #fef08a;">${t.name}</span>
            ${isEquipped ? '<span style="font-size:11px; font-weight:800; background:#0284c7; color:#fff; padding:2px 8px; border-radius:12px;">착용 중</span>' : ''}
            ${isOwned && !isEquipped ? '<span style="font-size:11px; font-weight:800; background:#059669; color:#fff; padding:2px 8px; border-radius:12px;">보유 중</span>' : ''}
          </div>
          <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">${t.desc}</div>
          ${!isOwned ? `
            <div style="font-size: 11.5px; margin-top: 6px; color: ${canAfford ? '#4ade80' : '#f87171'}; font-weight: 700;">
              필요: ${costText} <span style="font-weight:400; color:#94a3b8;">${progressText}</span>
            </div>
          ` : ''}
        </div>
        <div style="flex-shrink: 0;">
          ${isEquipped ? `
            <button class="btn-unequip-card btn-secondary" style="font-size: 12px; padding: 7px 14px; font-weight:700;">
              해제하기
            </button>
          ` : (isOwned ? `
            <button class="btn-equip-card btn-primary" style="font-size: 12px; padding: 7px 16px; font-weight:800; background:#0284c7; border-color:#0369a1;">
              착용하기
            </button>
          ` : `
            <button class="btn-exchange-card btn-primary" ${!canAfford ? 'disabled' : ''} style="font-size: 12px; padding: 7px 16px; font-weight:800; ${!canAfford ? 'background:#334155; border-color:#475569; color:#64748b; cursor:not-allowed;' : 'background:#d97706; border-color:#b45309;'}">
              교환하기
            </button>
          `)}
        </div>
      `;

      const btnEquip = card.querySelector('.btn-equip-card');
      if (btnEquip) {
        btnEquip.addEventListener('click', () => {
          this.equipTitle(t.name);
        });
      }
      const btnUnequipCard = card.querySelector('.btn-unequip-card');
      if (btnUnequipCard) {
        btnUnequipCard.addEventListener('click', () => {
          this.unequipTitle();
        });
      }
      const btnExchange = card.querySelector('.btn-exchange-card');
      if (btnExchange && canAfford) {
        btnExchange.addEventListener('click', () => {
          this.exchangeTitle(t);
        });
      }

      listContainer.appendChild(card);
    });
  }

  exchangeTitle(titleDef) {
    if (!titleDef) return;
    this.playerData.titles = this.playerData.titles || [];
    if (this.playerData.titles.includes(titleDef.name)) {
      this.showToast('이미 보유한 호칭입니다!', 'info');
      return;
    }

    if (titleDef.costType === 'item') {
      const myItem = (this.playerData.inventory || []).find(i => i.item === titleDef.costItem);
      if (!myItem || myItem.count < titleDef.costAmount) {
        this.showToast(`${titleDef.costItemName}이(가) 부족합니다!`, 'error');
        return;
      }
      this.removeItem(titleDef.costItem, titleDef.costAmount);
    } else if (titleDef.costType === 'gold') {
      if ((this.playerData.gold || 0) < titleDef.costAmount) {
        this.showToast('골드가 부족합니다!', 'error');
        return;
      }
      this.playerData.gold -= titleDef.costAmount;
      if (this.hudGold) this.hudGold.innerText = this.playerData.gold;
    }

    this.playerData.titles.push(titleDef.name);
    this.equipTitle(titleDef.name);
    this.showToast(`🎉 새로운 호칭 [${titleDef.name}] 획득 및 착용 완료!`, 'success');
    this.saveProgress();
    this.renderTitleExchangeModal();
  }

  equipTitle(titleName) {
    this.playerData.equippedTitle = titleName;
    this.updatePlayerNameDisplay();
    if (this.networkManager && this.networkManager.sendTitleUpdate) {
      this.networkManager.sendTitleUpdate(titleName);
    }
    this.showToast(`🏷️ [${titleName}] 호칭을 착용했습니다!`, 'info');
    this.saveProgress();
    this.renderTitleExchangeModal();
  }

  unequipTitle() {
    this.playerData.equippedTitle = null;
    this.updatePlayerNameDisplay();
    if (this.networkManager && this.networkManager.sendTitleUpdate) {
      this.networkManager.sendTitleUpdate(null);
    }
    this.showToast('호칭을 해제했습니다.', 'info');
    this.saveProgress();
    this.renderTitleExchangeModal();
  }

  startLoop() {
    // 한 프레임에서 오류가 나도 게임 루프가 멈추지 않도록 보호 (검은 화면/캐릭터 사라짐 방지)
    let lastErrLog = 0;
    const loop = () => {
      try {
        this.engine.update();
      } catch (err) {
        if (Date.now() - lastErrLog > 3000) { lastErrLog = Date.now(); console.error('[Loop] update error:', err); }
      }
      try {
        this.engine.render();
      } catch (err) {
        if (Date.now() - lastErrLog > 3000) { lastErrLog = Date.now(); console.error('[Loop] render error:', err); }
        // 렌더 도중 중단되어 쌓인 save()/transform 상태 초기화
        try {
          const c = this.engine.ctx;
          if (c) {
            for (let i = 0; i < 20; i++) c.restore();
            c.setTransform(1, 0, 0, 1, 0, 0);
          }
        } catch (_) { /* ignore */ }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  updateDashButtonUI() {
    const btnB = document.getElementById('btn-action-b');
    if (!btnB) return;
    const canDash = this.engine && this.engine.player && (this.engine.player.hasRunningShoes || this.engine.player.isTeacher);
    if (canDash) {
      btnB.classList.remove('btn-b-locked');
      btnB.title = '달리기 (Shift 또는 B를 누른 채 이동)';
      const sub = btnB.querySelector('.btn-sub');
      if (sub) sub.textContent = '달리기 (Shift)';
    } else {
      btnB.classList.add('btn-b-locked');
      btnB.title = '특별한 신발을 얻어야 달릴 수 있습니다';
      const sub = btnB.querySelector('.btn-sub');
      if (sub) sub.textContent = '🔒 달리기 (신발 필요)';
    }
  }

  // 📜 복도 떨어진 개발자노트 이스터에그 (제1편)
  handleDevNoteInteraction() {
    const studentId = (this.playerData && this.playerData.studentId) || 'default';
    const noteKey = 'soongsil_dev_note_1_' + studentId;
    let alreadyRead = false;
    try {
      alreadyRead = !!(studentId && localStorage.getItem(noteKey) === 'true');
    } catch (e) {}

    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }

    const noteStory =
      "📜 [떨어진 개발자노트 — 제1편: 교무실의 불이 꺼지지 않던 밤]\n\n" +
      "\"밤 11시 42분. 모두가 퇴근하고 칠흑같이 어두워진 교무실,\n" +
      "오직 모니터 푸른 불빛 하나만이 낡은 책상을 비추고 있었다.\n" +
      "책상 위에는 차갑게 식어버린 믹스커피 종이컵, 그리고 끝없이 이어지는 자바스크립트 코드와 타일 좌표들...\n\n" +
      "'선생님, 영어 단어 외우는 거 너무 지루하고 딱딱해요...'\n" +
      "낮에 교실 복도 뒤편에서 무심코 들려왔던 제자의 한마디가 가슴 한구석을 쿵 하고 울렸다.\n\n" +
      "'어떻게 하면 우리 숭실 아이들이 책상에 억지로 묶여있지 않고,\n" +
      "모험을 떠나는 용사가 되어 신나게 웃으며 영어를 배울 수 있을까?'\n\n" +
      "그 질문 하나가 머릿속을 떠나지 않아 밤낮을 잊은 채 키보드를 두드리기 시작했다.\n" +
      "복도 타일 한 장, 교실 문 하나, 몬스터의 스탯과 보상 테이블까지...\n" +
      "마우스를 쥔 손가락 끝마디가 뻐근하고 눈이 시려왔지만,\n" +
      "내일 아침 교실 문을 열며 눈을 반짝일 아이들의 얼굴을 떠올리면 피로 따윈 아무것도 아니었다.\n\n" +
      "'얘들아, 이 세상은 너희를 위한 모험의 무대란다.\n" +
      "어려운 영어도, 거대한 보스도 결코 너희를 꺾을 수 없어.\n" +
      "너희가 쓰러질 때마다 언제든 다시 일어설 수 있도록 내가 이 세계를 든든하게 지켜줄게.'\n\n" +
      "— 숭실의 밤을 지새우며, 개발자 갓준철 올림 —\n" +
      "(※ 빛바랜 양피지 귀퉁이에 적힌 글귀... 제2편으로 이어집니다.)\"";

    if (!alreadyRead && (!this.playerData || !this.playerData.isTeacher)) {
      try {
        localStorage.setItem(noteKey, 'true');
      } catch (e) {}

      this.addGold(50);
      this.addExp(50);
      this.saveProgress();

      if (window.AudioManager && window.AudioManager.playFanfare) {
        window.AudioManager.playFanfare();
      }

      alert(
        noteStory + "\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "🎁 [개발자노트 제1편 감상 보너스]\n" +
        "• 갓준철 선생님의 뜨거운 열정이 가슴 깊이 전해집니다!\n" +
        "• 🪙 골드 +50G 획득!\n" +
        "• 🌟 경험치 +50 EXP 획득!"
      );
    } else {
      alert(noteStory);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.MainApp = new MainApp();
});
