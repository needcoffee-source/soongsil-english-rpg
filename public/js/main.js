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
  'item_forsythia': { name: '노란 개나리 꽃잎', icon: '🌼', count: 9999, meta: { type: 'material', effect: '교화 개나리 장신구 및 주황 물약 재료' } },
  'item_ginkgo': { name: '황금 은행잎', icon: '🍂', count: 9999, meta: { type: 'material', effect: '교목 은행나무 부적 및 부활 주문서 재료' } },
  'item_golem_core': { name: '고목의 핵', icon: '🟢', count: 9999, meta: { type: 'material', effect: '골렘 보스 전리품 · 상위 제작 재료' } },
  'item_dragon_heart': { name: '용의 심장', icon: '❤️‍🔥', count: 9999, meta: { type: 'material', effect: '드래곤 보스 전리품 · 최상위 제작 재료' } },

  // 2. Potions & Scrolls
  'item_red_potion': { name: '빨간 물약', icon: '🍷', count: 9999, meta: { type: 'consumable', slot: 'consumable', heal: 10, effect: '체력 +10 회복' } },
  'item_orange_potion': { name: '주황 물약', icon: '🧪', count: 9999, meta: { type: 'consumable', slot: 'consumable', heal: 25, effect: '체력 +25 회복' } },
  'item_revive_scroll': { name: '부활 주문서', icon: '📜', count: 9999, meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '쓰러진 친구를 50% 체력으로 부활' } },

  // 3. 1st Grade Wooden Equipment
  'equip_wood_sword': { name: '나무검', icon: '🗡️', count: 9999, meta: { type: 'equipment', slot: 'weapon', stats: { atk: 15, def: 0, hp: 0 }, effect: '공격력 +15' } },
  'equip_wood_helmet': { name: '나무투구', icon: '🪖', count: 9999, meta: { type: 'equipment', slot: 'helmet', stats: { atk: 0, def: 8, hp: 20 }, effect: '방어력 +8, 체력 +20' } },
  'equip_wood_armor': { name: '나무갑옷', icon: '🛡️', count: 9999, meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 15, hp: 50 }, effect: '방어력 +15, 체력 +50' } },
  'equip_forsythia_ring': { name: '성실의 개나리 반지', icon: '🌼', count: 9999, meta: { type: 'equipment', slot: 'accessory', stats: { atk: 10, def: 10, hp: 20 }, effect: '공격력 +10, 방어력 +10, 체력 +20' } },
  'equip_ginkgo_talisman': { name: '합심의 황금 은행잎 부적', icon: '🍂', count: 9999, meta: { type: 'equipment', slot: 'accessory', stats: { atk: 20, def: 12, hp: 40 }, effect: '공격력 +20, 방어력 +12, 체력 +40' } },

  // 4. Bronze Equipment (Boss Rare Drops)
  'equip_bronze_sword': { name: '청동검', icon: '⚔️', count: 9999, meta: { type: 'equipment', slot: 'weapon', stats: { atk: 25, def: 0, hp: 0 }, effect: '공격력 +25' } },
  'equip_bronze_helmet': { name: '청동투구', icon: '🪖', count: 9999, meta: { type: 'equipment', slot: 'helmet', stats: { atk: 0, def: 14, hp: 35 }, effect: '방어력 +14, 체력 +35' } },
  'equip_bronze_armor': { name: '청동갑옷', icon: '🛡️', count: 9999, meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 22, hp: 70 }, effect: '방어력 +22, 체력 +70' } }
};

window.BOSS_CONFIG = {
  active: false,
  name: '👾 고목 골렘',
  level: 10,
  mode: 'coop',
  unitFilter: 'ALL',
  maxHp: 3000,
  currentHp: 3000,
  atk: 18,
  def: 5,
  rewardGold: 100,
  rewardExp: 200
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
        accessory: null
      },
      inventory: []
    };

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
    this.modalTeacher = document.getElementById('modal-teacher');

    this.invGoldDisplay = document.getElementById('inv-gold-display');
    this.invAtkDisplay = document.getElementById('inv-atk-display');
    this.invDefDisplay = document.getElementById('inv-def-display');
    this.invGrid = document.getElementById('inv-items-grid');

    this.initControls();
    this.initModals();
    this.initTeacherAdmin();
    this.recalcCombatStats();
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
      if (!this.engine.player.hasRunningShoes) {
        alert('👟 [달리기 잠김]\n\n특별한 신발을 얻어야 달릴 수 있습니다!\n(현재는 기본 속도로 걷습니다. 추후 제작소에서 신발을 제작해 보세요!)');
        return;
      }
      this.engine.setDashing(true);
    });
    btnB.addEventListener('pointerup', (e) => {
      e.preventDefault();
      if (this.engine.player.hasRunningShoes) {
        this.engine.setDashing(false);
      }
    });
    btnB.addEventListener('pointercancel', (e) => {
      e.preventDefault();
      if (this.engine.player.hasRunningShoes) {
        this.engine.setDashing(false);
      }
    });

    window.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.engine.setDirectionInput('up', true);
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.engine.setDirectionInput('down', true);
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.engine.setDirectionInput('left', true);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.engine.setDirectionInput('right', true);
      if (e.key === 'Shift') {
        if (this.engine.player.hasRunningShoes) {
          this.engine.setDashing(true);
        }
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
      if (e.key === 'Shift') {
        if (this.engine.player.hasRunningShoes) {
          this.engine.setDashing(false);
        }
      }
    });

    this.engine.onMoveCallback = (pos) => {
      this.networkManager.sendMove(pos);
    };

    this.engine.onLocationChangeCallback = (loc) => {
      this.hudLocation.innerText = loc.roomName;
      this.floorTag.innerText = '시즌1';
      this.networkManager.changeLocation(loc);
    };

    this.engine.onInteractCallback = (target) => {
      this.handleInteraction(target);
    };

    window.addEventListener('resize', () => this.engine.resize());
  }

  handleInteraction(target) {
    if (target.type === 'npc') {
      const npc = target.data;
      alert(`💬 [${npc.name}]\n\n"${npc.dialogue}"`);
    } else if (target.type === 'mascot') {
      alert(`🐶 [마스코트 숭실이 - 조작법 가이드]\n\n"멍멍! 안녕! 나는 숭실중 마스코트 숭실이야! 🐾\n기본 조작법을 알려줄게!\n\n🎮 [이동 방법]\n• 키보드: WASD 키 또는 방향키\n• 태블릿: 화면 왼쪽 아래의 반투명 조이스틱 패드\n\n🟢 [상호작용 / 대화 / 입장]\n• 화면 우측 초록색 [A] 버튼 터치!\n• 또는 키보드 Spacebar / Enter 키\n• 문, 책상, 게시판, 친구, 선생님 앞에서 A버튼을 눌러봐!"`);
    } else if (
      target.type === 'board' ||
      target.type === 'gather_wood' ||
      target.type === 'gather_herb' ||
      target.type === 'gather_forsythia' ||
      target.type === 'gather_ginkgo' ||
      target.type === 'ginkgo' ||
      target.type === 'forsythia'
    ) {
      this.quizManager.triggerQuiz(target.name, target.type, target.data);
    } else if (target.type === 'craft') {
      const cat = (target.data && target.data.category) || target.category || (target.name && target.name.includes('포션') ? 'potion' : 'equipment');
      this.craftingManager.open(cat);
    } else if (target.type === 'boss_raid') {
      this.openBossRaid(target.data);
    } else if (target.type === 'leaderboard') {
      this.openLeaderboard();
    }
  }

  initModals() {
    const checkIsTeacher = document.getElementById('check-is-teacher');
    const teacherPwdField = document.getElementById('teacher-pwd-field');
    if (checkIsTeacher && teacherPwdField) {
      checkIsTeacher.addEventListener('change', () => {
        if (checkIsTeacher.checked) {
          teacherPwdField.classList.remove('hidden');
        } else {
          teacherPwdField.classList.add('hidden');
        }
      });
    }

    // 학생 마지막 학번 및 세이브 데이터 자동 완성 (새로고침 대응)
    try {
      const lastStudentId = localStorage.getItem('soongsil_last_student_id');
      if (lastStudentId) {
        const studentIdInput = document.getElementById('input-student-id');
        if (studentIdInput) studentIdInput.value = lastStudentId;
        const saved = this.loadProgress(lastStudentId);
        if (saved && saved.name) {
          const nicknameInput = document.getElementById('input-nickname');
          if (nicknameInput) nicknameInput.value = saved.name;
        }
      }
    } catch (e) {
      console.warn('LocalStorage access warning:', e);
    }

    document.getElementById('btn-start-game').addEventListener('click', () => {
      const isTeacher = checkIsTeacher && checkIsTeacher.checked;
      let name = document.getElementById('input-nickname').value.trim();
      const studentId = document.getElementById('input-student-id').value.trim();
      const grade = parseInt(document.querySelector('input[name="server-grade"]:checked').value) || 1;

      if (!isTeacher) {
        if (!studentId) {
          alert('학번을 입력해 주세요! (예: 10101)');
          document.getElementById('input-student-id').focus();
          return;
        }
        if (!name) {
          alert('이름(닉네임)을 입력해 주세요! (예: 홍길동)');
          document.getElementById('input-nickname').focus();
          return;
        }
      }

      if (isTeacher) {
        const pwd = (document.getElementById('input-teacher-pwd').value || '').trim();
        if (pwd !== '0322') {
          alert('🔒 교사 인증 암호가 일치하지 않습니다.');
          return;
        }

        // 교사 계정은 입력한 이름과 상관없이 무조건 '교사' / 공·방·체 9999 통일
        name = '교사';
        this.playerData.isTeacher = true;
        this.playerData.teacherPwd = pwd;
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
        this.engine.player.name = '교사';

        const gmPanel = document.getElementById('gm-panel');
        if (gmPanel) gmPanel.classList.remove('hidden');
      } else {
        this.playerData.isTeacher = false;
        this.playerData.teacherPwd = '';
        this.engine.player.isTeacher = false;
        const gmPanel = document.getElementById('gm-panel');
        if (gmPanel) gmPanel.classList.add('hidden');

        // 학생 세이브 데이터 복구 (새로고침 시 아이템/레벨/골드 유지)
        const saved = this.loadProgress(studentId);
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
          this.playerData.equipment = saved.equipment || { weapon: null, helmet: null, armor: null, accessory: null };
          console.log(`[Storage] 학생(${studentId}) 데이터 복구 완료: Lv.${this.playerData.level}, ${this.playerData.gold}G, 인벤토리 ${this.playerData.inventory.length}종`);
        }
        try {
          localStorage.setItem('soongsil_last_student_id', studentId);
        } catch (e) {}
      }

      this.playerData.name = name;
      this.playerData.studentId = isTeacher ? '교사' : studentId;
      this.playerData.grade = grade;
      this.playerData.avatar = 'student_m1';

      this.hudName.innerText = name;
      this.hudLevel.innerText = `Lv.${this.playerData.level}`;
      this.hudGold.innerText = this.playerData.gold;
      const studentIdEl = document.getElementById('side-student-id');
      if (studentIdEl) studentIdEl.innerText = isTeacher ? '교사' : studentId;
      this.recalcCombatStats();
      this.updateExpBar();

      this.quizManager.loadQuestions(grade);
      this.craftingManager.loadRecipes(grade);

      this.networkManager.connect(this.playerData);
      this.modalLogin.classList.add('hidden');
      this.startLoop();
      this.initAutoHpRegen();
    });

    // Sound Toggle Button
    const btnToggleSound = document.getElementById('btn-toggle-sound');
    if (btnToggleSound && window.AudioManager) {
      window.AudioManager.updateMuteButtonUI();
      btnToggleSound.addEventListener('click', () => {
        window.AudioManager.toggleMute();
      });
    }

    // Inventory Modal
    document.getElementById('btn-inventory').addEventListener('click', () => {
      if (window.AudioManager) window.AudioManager.playSelect();
      this.openInventory();
    });
    document.getElementById('btn-close-inv-x').addEventListener('click', () => this.modalInventory.classList.add('hidden'));

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

    const btnGmBossEvent = document.getElementById('btn-gm-boss-event');
    if (btnGmBossEvent) {
      btnGmBossEvent.addEventListener('click', () => {
        this.openTeacherTab('tab-boss-raid');
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
            pwd: this.playerData.teacherPwd || '0322',
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

    const lvBonus = Math.max(0, (this.playerData.level || 1) - 1);
    let bonusAtk = 0;
    let bonusDef = 0;
    let bonusHp = 0;

    Object.values(this.playerData.equipment).forEach(eq => {
      if (eq && eq.stats) {
        bonusAtk += (eq.stats.atk || 0);
        bonusDef += (eq.stats.def || 0);
        bonusHp += (eq.stats.hp || 0);
      }
    });

    this.playerData.atk = this.playerData.baseAtk + lvBonus + bonusAtk;
    this.playerData.def = this.playerData.baseDef + lvBonus + bonusDef;
    this.playerData.maxHp = this.playerData.baseHp + lvBonus + bonusHp;
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

    const slot = invItem.slot || 'weapon';
    if (this.playerData.equipment[slot] && this.playerData.equipment[slot].item === itemId) {
      this.unequipSlot(slot);
      return;
    }

    this.playerData.equipment[slot] = {
      item: invItem.item,
      name: invItem.name,
      icon: invItem.icon || '🗡️',
      slot: slot,
      stats: invItem.stats || { atk: 5, def: 0, hp: 0 },
      effect: invItem.effect || ''
    };

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

    if (this.playerData.inventory.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.style.gridColumn = '1 / -1';
      emptyMsg.style.padding = '32px 12px';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.color = '#94a3b8';
      emptyMsg.style.fontWeight = '700';
      emptyMsg.innerText = '비어 있음';
      this.invGrid.appendChild(emptyMsg);
    }

    this.playerData.inventory.forEach(item => {
      const isEquip = (item.type === 'equipment' || item.item.startsWith('equip_'));
      const isPotion = (item.type === 'consumable' || item.item.includes('potion') || item.item.includes('scroll'));
      const equippedNow = isEquip && this.isItemEquipped(item.item);

      const card = document.createElement('div');
      card.className = 'mat-badge';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.alignItems = 'center';
      card.style.justifyContent = 'space-between';
      card.style.padding = '12px 10px';
      card.style.background = equippedNow ? 'rgba(37, 99, 235, 0.22)' : '#27272a';
      card.style.border = equippedNow ? '2px solid #60a5fa' : '1.5px solid #3f3f46';
      card.style.borderRadius = '10px';
      if (isEquip || isPotion) {
        card.style.cursor = 'pointer';
      }

      card.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center;">
          <span style="font-size:28px;">${item.icon || '📦'}</span>
          <span style="font-weight:800; font-size:13.5px; margin-top:4px; color:#fff;">${item.name}</span>
          <span style="color:#93c5fd; font-size:12px;">x${item.count}</span>
        </div>
      `;

      if (isEquip) {
        const btn = document.createElement('button');
        btn.className = 'btn-item-action ' + (equippedNow ? 'btn-equip-off' : 'btn-equip-on');
        btn.innerText = equippedNow ? '해제' : '착용';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.equipItem(item.item);
        });
        card.addEventListener('click', () => this.equipItem(item.item));
        card.appendChild(btn);
      } else if (isPotion) {
        const isScroll = item.item === 'item_revive_scroll';
        const btn = document.createElement('button');
        btn.className = 'btn-item-action btn-use-potion';
        btn.innerText = isScroll ? '사용' : '마시기';
        btn.style.background = isScroll ? '#7c3aed' : '#059669';
        btn.style.borderColor = isScroll ? '#8b5cf6' : '#10b981';
        btn.style.color = '#ffffff';
        btn.title = isScroll ? '쓰러진 친구 부활' : '체력 즉시 회복';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (isScroll) {
            this.attemptUseReviveScroll();
          } else {
            this.usePotion(item.item);
          }
        });
        card.addEventListener('click', () => {
          if (isScroll) {
            this.attemptUseReviveScroll();
          } else {
            this.usePotion(item.item);
          }
        });
        card.appendChild(btn);
      }

      this.invGrid.appendChild(card);
    });

    this.modalInventory.classList.remove('hidden');
  }

  openEquipmentModal() {
    this.recalcCombatStats();
    document.getElementById('equip-total-hp').innerText = `${this.playerData.hp} / ${this.playerData.maxHp}`;
    document.getElementById('equip-total-atk').innerText = this.playerData.atk;
    document.getElementById('equip-total-def').innerText = this.playerData.def;

    const container = document.getElementById('equip-slots-container');
    container.innerHTML = '';

    const slotDefinitions = [
      { key: 'helmet', title: '🪖 투구', emptyIcon: '🪖' },
      { key: 'armor', title: '🛡️ 갑옷', emptyIcon: '🛡️' },
      { key: 'weapon', title: '🗡️ 무기', emptyIcon: '🗡️' },
      { key: 'accessory', title: '💍 장신구', emptyIcon: '💍' }
    ];

    slotDefinitions.forEach(sDef => {
      const equipped = this.playerData.equipment[sDef.key];
      const card = document.createElement('div');
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
        card.innerHTML = `
          <div class="equip-slot-header">
            <span>${sDef.title}</span>
            <span style="color:#71717a;">비어 있음</span>
          </div>
          <div class="equip-slot-body">
            <span class="equip-slot-icon" style="opacity:0.3;">${sDef.emptyIcon}</span>
            <div class="equip-slot-info">
              <span class="equip-slot-name" style="color:#64748b;">없음</span>
            </div>
          </div>
        `;
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
    const isModalOpen = !this.modalBossRaid.classList.contains('hidden');
    const isInBossRoom = this.engine && this.engine.player && this.engine.player.room === 'room_702';

    if (isModalOpen || isInBossRoom) {
      this.addGold(data.rewardGold || 100);
      this.addExp(data.rewardExp || 200);

      // 1. 체력회복 포션 (2~3개 확정 드랍: 빨간물약/주황물약 랜덤 조합)
      const potCount = Math.floor(Math.random() * 2) + 2; // 2 or 3
      let droppedRed = 0, droppedOrange = 0;
      for (let i = 0; i < potCount; i++) {
        if (Math.random() < 0.5) {
          droppedRed++;
          this.addItem('item_red_potion', '빨간 물약', 1, '🍷', { type: 'consumable', heal: 10, effect: '체력 +10 회복' });
        } else {
          droppedOrange++;
          this.addItem('item_orange_potion', '주황 물약', 1, '🧪', { type: 'consumable', heal: 25, effect: '체력 +25 회복' });
        }
      }

      const rewardItemsList = [];
      if (droppedRed > 0) rewardItemsList.push(`🍷 빨간 물약 x${droppedRed}`);
      if (droppedOrange > 0) rewardItemsList.push(`🧪 주황 물약 x${droppedOrange}`);

      // 2. 개나리 반지 (5% 확률)
      if (Math.random() * 100 < 5) {
        this.addItem('equip_forsythia_ring', '성실의 개나리 반지', 1, '🌼', {
          type: 'equipment', slot: 'accessory', stats: { atk: 10, def: 10, hp: 20 }, effect: '공격력 +10, 방어력 +10, 체력 +20'
        });
        rewardItemsList.push('🌼 성실의 개나리 반지');
      }

      const bName = data.bossName || window.BOSS_CONFIG.name || '';

      // 3. 고목골렘 전용 드랍 (나무장비 20%, 고목의 핵 15%, 청동장비 8%)
      if (bName.includes('골렘') || bName.includes('golem')) {
        const roll = Math.random() * 100;
        if (roll < 20) {
          const woodGears = [
            { item: 'equip_wood_sword', name: '나무검', icon: '🗡️', slot: 'weapon', stats: { atk: 15, def: 0, hp: 0 }, effect: '공격력 +15' },
            { item: 'equip_wood_helmet', name: '나무투구', icon: '🪖', slot: 'helmet', stats: { atk: 0, def: 8, hp: 20 }, effect: '방어력 +8, 체력 +20' },
            { item: 'equip_wood_armor', name: '나무갑옷', icon: '🛡️', slot: 'armor', stats: { atk: 0, def: 15, hp: 50 }, effect: '방어력 +15, 체력 +50' }
          ];
          const chosen = woodGears[Math.floor(Math.random() * woodGears.length)];
          this.addItem(chosen.item, chosen.name, 1, chosen.icon, { type: 'equipment', slot: chosen.slot, stats: chosen.stats, effect: chosen.effect });
          rewardItemsList.push(`${chosen.icon} ${chosen.name}`);
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
          rewardItemsList.push(`${chosen.icon} ${chosen.name} (대박!)`);
        }
      }

      // 4. 숭실 골드 드래곤 전용 드랍 (용의 심장 20%, 청동장비 15%)
      if (bName.includes('드래곤') || bName.includes('dragon')) {
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
          rewardItemsList.push(`${chosen.icon} ${chosen.name} (희귀 드랍)`);
        }
      }

      const dropText = rewardItemsList.length > 0 ? `\n🎁 획득 아이템:\n• ${rewardItemsList.join('\n• ')}` : '';
      const mvpText = data.mvp ? `\n\n👑 최고 기여(MVP): ${data.mvp.name} (누적 데미지 ${data.mvp.damage})` : '';

      alert(`🏆 [${data.bossName}] 협동 토벌 성공!\n\n🪙 골드 +${data.rewardGold}G, 🌟 경험치 +${data.rewardExp} EXP${dropText}${mvpText}`);
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
      btnOrange.innerText = `🧪 주황 물약 (+25) ${orangeCount}개`;
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
    const uFilter = (window.BOSS_CONFIG.unitFilter && window.BOSS_CONFIG.unitFilter !== 'ALL')
      ? window.BOSS_CONFIG.unitFilter
      : null;
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

      if (window.BOSS_CONFIG.active && window.BOSS_CONFIG.mode === 'coop' && this.networkManager.socket) {
        // 협동 레이드: 서버로 데미지 전송하여 전교생 보스 HP 공유 차감
        this.networkManager.socket.emit('boss_raid_attack', { damage: myDmg });
      } else {
        this.bossState.currentHp = Math.max(0, this.bossState.currentHp - myDmg);
        if (this.bossState.currentHp <= 0) {
          this.updateBossRaidUI();
          this.addGold(window.BOSS_CONFIG.rewardGold);
          this.addExp(window.BOSS_CONFIG.rewardExp);
          alert(`🏆 [${window.BOSS_CONFIG.name}] 처치!\n보상: 🪙 +${window.BOSS_CONFIG.rewardGold}G, 🌟 +${window.BOSS_CONFIG.rewardExp} EXP`);
          this.bossState.currentHp = this.bossState.maxHp;
          this.modalBossRaid.classList.add('hidden');
          return;
        }
      }

      const incomingDmg = this.playerData.isTeacher ? 0 : Math.max(1, bossAtk - this.playerData.def);
      this.playerData.hp = Math.max(0, this.playerData.hp - incomingDmg);
      this.updateBossRaidUI();

      logEl.innerHTML = `⚔️ 보스에게 <b>-${myDmg} HP</b> 데미지! / 💥 보스 반격 <b>-${incomingDmg} HP</b>`;
    } else {
      btnEl.classList.add('wrong');
      if (window.AudioManager) window.AudioManager.playWrong();
      const incomingDmg = this.playerData.isTeacher ? 0 : Math.max(2, Math.floor(bossAtk * 1.2) - this.playerData.def);
      this.playerData.hp = Math.max(0, this.playerData.hp - incomingDmg);
      this.updateBossRaidUI();

      logEl.innerHTML = `😢 오답 (정답: ${q.answer}) / 💥 보스 공격 <b>-${incomingDmg} HP</b>`;
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
  // TEACHER ADMIN CONTROLS (보스레이드 이벤트 / 채팅 / 공지 / 문제 / 경제)
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

        if (tabId === 'tab-students') {
          this.requestStudentList();
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
          nameEl.value = '👾 고목 골렘';
          hpEl.value = 1500;
          atkEl.value = 17;
          defEl.value = 8;
          goldEl.value = 50;
          expEl.value = 100;
        } else if (val === 'dragon') {
          nameEl.value = '🐉 숭실 골드 드래곤';
          hpEl.value = 4000;
          atkEl.value = 28;
          defEl.value = 10;
          goldEl.value = 120;
          expEl.value = 250;
        } else if (val === 'demon') {
          nameEl.value = '👹 중간고사 대마왕';
          hpEl.value = 999999;
          atkEl.value = 150;
          defEl.value = 50;
          goldEl.value = 0;
          expEl.value = 0;
        }
      });
    }

    // 보스레이드 이벤트 시작 버튼
    const btnStartBoss = document.getElementById('btn-start-boss-event');
    if (btnStartBoss) {
      btnStartBoss.addEventListener('click', () => {
        const opts = {
          name: document.getElementById('admin-boss-name').value.trim() || '👾 고목 골렘',
          mode: document.getElementById('admin-boss-mode').value || 'coop',
          unitFilter: document.getElementById('admin-boss-unit').value || 'ALL',
          maxHp: Math.max(50, parseInt(document.getElementById('admin-boss-hp').value) || 1500),
          atk: Math.max(1, parseInt(document.getElementById('admin-boss-atk').value) || 17),
          def: Math.max(0, parseInt(document.getElementById('admin-boss-def').value) || 8),
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

    document.getElementById('btn-send-broadcast').addEventListener('click', () => {
      const input = document.getElementById('input-broadcast');
      const msg = input.value.trim();
      if (!msg) return;
      if (this.networkManager.socket) {
        this.networkManager.socket.emit('teacher_broadcast', { message: msg });
        alert(`전교생에게 공지사항이 전송되었습니다:\n"${msg}"`);
        input.value = '';
      }
    });

    document.getElementById('btn-save-new-quiz').addEventListener('click', async () => {
      const grade = document.getElementById('admin-q-grade').value;
      const unit = document.getElementById('admin-q-unit').value || '교과서 단원';
      const question = document.getElementById('admin-q-question').value;
      const opt1 = document.getElementById('admin-q-opt1').value;
      const opt2 = document.getElementById('admin-q-opt2').value;
      const opt3 = document.getElementById('admin-q-opt3').value;
      const opt4 = document.getElementById('admin-q-opt4').value;
      const answer = document.getElementById('admin-q-answer').value;
      const explanation = document.getElementById('admin-q-exp').value;

      if (!question || !answer || !opt1 || !opt2) {
        alert('문제, 보기, 정답을 모두 입력해주세요.');
        return;
      }

      const qData = {
        grade: parseInt(grade),
        unit,
        category: 'vocabulary',
        question,
        options: [opt1, opt2, opt3, opt4].filter(o => o.trim().length > 0),
        answer,
        explanation
      };

      try {
        const res = await fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grade, questionData: qData })
        });
        const result = await res.json();
        if (result.success) {
          alert('새 퀴즈가 성공적으로 데이터베이스에 추가되었습니다!');
          this.quizManager.loadQuestions(this.playerData.grade);
        }
      } catch (e) {
        alert('저장에 실패했습니다.');
      }
    });

    const btnSaveEconomy = document.getElementById('btn-save-economy');
    if (btnSaveEconomy) {
      btnSaveEconomy.addEventListener('click', () => {
        const minG = Math.max(0, parseInt(document.getElementById('admin-eco-min-gold').value) || 1);
        const maxG = Math.max(minG, parseInt(document.getElementById('admin-eco-max-gold').value) || 3);
        const dropRate = Math.max(1, Math.min(100, parseFloat(document.getElementById('admin-eco-drop-rate').value) || 20));
        const baseExp = Math.max(1, parseInt(document.getElementById('admin-eco-exp').value) || 5);

        window.ECONOMY_CONFIG.minGold = minG;
        window.ECONOMY_CONFIG.maxGold = maxG;
        window.ECONOMY_CONFIG.itemDropRatePercent = dropRate;
        window.ECONOMY_CONFIG.spotDropRates = {
          gather_wood: dropRate,
          gather_herb: dropRate,
          gather_forsythia: dropRate,
          gather_ginkgo: dropRate,
          board: dropRate
        };
        window.ECONOMY_CONFIG.baseExp = baseExp;

        alert(`🎲 [경제/드랍율 설정 적용 완료]\n• 골드 보상: ${minG}G ~ ${maxG}G\n• 기본 드랍 확률: ${dropRate}%\n• 기본 경험치: +${baseExp} EXP`);
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
        const loc = std.room === 'hallway' ? '복도' : (std.room === 'room_701' ? '1반' : '2반');
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

      const locName = std.room === 'hallway' ? '1학년 복도' : (std.room === 'room_701' ? '1학년 1반' : '1학년 2반');
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

  // Lv.1 ~ Lv.100 성장 (1레벨당 체력 +1, 공격력 +1, 방어력 +1 증가)
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
      this.playerData.hp = Math.min(this.playerData.maxHp, this.playerData.hp + 1);
      this.updateHpBar();
      alert(`🌟 Lv.${this.playerData.level} 달성! (체력 +1, 공격력 +1, 방어력 +1)`);
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
  // PERSISTENCE (새로고침 방지: LocalStorage 자동 저장 및 복원)
  // =========================================================================
  saveProgress() {
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
        updatedAt: Date.now()
      };
      localStorage.setItem('soongsil_save_' + this.playerData.studentId, JSON.stringify(saveData));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
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

  startLoop() {
    const loop = () => {
      this.engine.update();
      this.engine.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.MainApp = new MainApp();
});
