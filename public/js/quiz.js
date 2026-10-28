/**
 * Quiz Manager for Soongsil Open World RPG — Season 1
 * - 목재(gather_wood): 1단원(L1) 문제만 출제 (25문항 비복원 셔플 덱)
 * - 허브(gather_herb): 2단원(L2) 문제만 출제 (25문항 비복원 셔플 덱)
 * - 개나리(gather_forsythia): 3단원(L3) 문제만 출제 (25문항 비복원 셔플 덱)
 * - 교목 은행나무(gather_ginkgo): 4단원(L4) 문제만 출제 (25문항 비복원 셔플 덱)
 * - 객관식 4지선다 보기는 매 출제 시마다 Fisher-Yates 셔플로 무작위 배치
 * - 드랍 테이블 및 확률은 화면에 노출하지 않음
 */

window.ECONOMY_CONFIG = {
  minGold: 1,
  maxGold: 3,
  baseExp: 5,
  itemDropRatePercent: 15,
  dropAmount: 1,
  spotDropRates: {
    gather_wood: 35, // 35%로 대폭 상향!
    gather_herb: 25, // +5% 상향
    gather_forsythia: 10,
    gather_ginkgo: 7
  }
};

const ITEM_ICON_MAP = {
  item_wood: '🪵',
  item_herb: '🌿',
  item_forsythia: '🌼',
  item_ginkgo: '🍂',
  item_basketball_leather: '🏀',
  equip_leather_armor: '🥋',
  item_hp_potion: '🧪',
  item_red_potion: '🍷',
  item_orange_potion: '🧪',
  item_golem_core: '🟢',
  item_dragon_heart: '❤️‍🔥',
  item_revive_scroll: '📜'
};

const BASIC_GRIND_POOL = [
  { item: 'item_wood', name: '단단한 목재', icon: '🪵' },
  { item: 'item_herb', name: '향긋한 허브', icon: '🌿' },
  { item: 'item_forsythia', name: '노란 개나리 꽃잎', icon: '🌼' },
  { item: 'item_ginkgo', name: '황금 은행잎', icon: '🍂' }
];

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

class QuizManager {
  constructor() {
    this.questions = [];
    this.unitDecks = {};
    this.lastQuestionIdByDeck = {};
    this.currentQuestion = null;
    this.currentSourceName = '영어 문제';
    this.currentSourceType = 'board';
    this.currentSpotData = null;
    this.playerGrade = 1;

    // DOM Elements
    this.modal = document.getElementById('modal-quiz');
    this.titleEl = document.getElementById('quiz-title');
    this.unitEl = document.getElementById('quiz-unit');
    this.questionEl = document.getElementById('quiz-question');
    this.optionsGrid = document.getElementById('quiz-options');
    this.feedbackEl = document.getElementById('quiz-feedback');
    this.feedbackIcon = document.getElementById('feedback-icon');
    this.feedbackText = document.getElementById('feedback-text');
    this.feedbackExp = document.getElementById('feedback-explanation');
    this.btnClose = document.getElementById('btn-close-quiz');
    this.btnNext = document.getElementById('btn-next-quiz');
    this.btnCloseX = document.getElementById('btn-close-quiz-x');

    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => this.closeQuiz());
    }
    if (this.btnCloseX) {
      this.btnCloseX.addEventListener('click', () => this.closeQuiz());
    }
    if (this.btnNext) {
      this.btnNext.addEventListener('click', () => this.nextQuiz());
    }
  }

  async loadQuestions(grade) {
    this.playerGrade = grade || 1;
    try {
      const res = await fetch(`/api/quiz?grade=${this.playerGrade}`);
      this.questions = await res.json();
      this.unitDecks = {};
    } catch (e) {
      console.error('[Quiz] Failed to load questions', e);
    }
  }

  /**
   * 단원별 비복원 셔플 덱(Deck)에서 다음 문제를 꺼내어 같은 문제가 연속으로 나오지 않게 보장
   */
  getRandomQuestion(unitFilter = null) {
    if (!this.questions || this.questions.length === 0) return null;

    const deckKey = unitFilter || 'ALL';
    if (!this.unitDecks[deckKey] || this.unitDecks[deckKey].length === 0) {
      let pool = this.questions;
      if (unitFilter) {
        const filtered = this.questions.filter(q => q.unit && q.unit.includes(unitFilter));
        if (filtered.length > 0) pool = filtered;
      }
      let shuffled = shuffleArray(pool);
      // 덱을 새로 섞었을 때 직전 마지막 문제와 첫 문제가 겹치면 한 칸 뒤로 스왑
      if (shuffled.length > 1 && this.lastQuestionIdByDeck[deckKey] && shuffled[0].id === this.lastQuestionIdByDeck[deckKey]) {
        [shuffled[0], shuffled[shuffled.length - 1]] = [shuffled[shuffled.length - 1], shuffled[0]];
      }
      this.unitDecks[deckKey] = shuffled;
    }

    const rawQ = this.unitDecks[deckKey].shift();
    this.lastQuestionIdByDeck[deckKey] = rawQ.id;

    // 출제할 때마다 객관식 선지 4개를 다시 셔플해서 반환
    return {
      ...rawQ,
      options: shuffleArray(rawQ.options || [])
    };
  }

  getUnitFilterForSource(sourceType) {
    if (sourceType === 'gather_wood') return 'L1';
    if (sourceType === 'gather_herb') return 'L2';
    if (sourceType === 'gather_forsythia' || sourceType === 'forsythia') return 'L3';
    if (sourceType === 'gather_ginkgo' || sourceType === 'ginkgo') return 'L4';
    if (sourceType === 'basketball' || sourceType === 'basketball_monster') return 'L5';
    if (sourceType === 'futsal' || sourceType === 'futsal_monster') return 'L6';
    if (sourceType === 'field_monster') return Math.random() < 0.5 ? 'L5' : 'L6';
    return null; // 칠판/보스 레이드/기타는 L1~L6 전체 출제
  }

  nextQuiz() {
    this.triggerQuiz(this.currentSourceName, this.currentSourceType, this.currentSpotData);
  }

  triggerQuiz(sourceName, sourceType = 'board', spotData = null) {
    if (!this.questions || this.questions.length === 0) {
      alert('출제 가능한 문제가 없습니다.');
      return;
    }

    // 🛑 오답 쿨타임 (1초 광클 방지)
    if (this.wrongCooldownUntil && Date.now() < this.wrongCooldownUntil) {
      const remainMs = this.wrongCooldownUntil - Date.now();
      const remainSec = (remainMs / 1000).toFixed(1);
      if (window.MainApp && window.MainApp.showToast) {
        window.MainApp.showToast(`⏳ 오답 패널티: ${remainSec}초 후 다시 채집할 수 있습니다.`, 'warning');
      }
      return;
    }

    this.isHandlingAnswer = false;
    this.currentSourceName = sourceName || '영어 문제';
    this.currentSourceType = sourceType || 'board';
    this.currentSpotData = spotData || null;

    // 단원별 필터링 (목재=L1, 허브=L2, 개나리=L3, 교목=L4)
    const unitKey = this.getUnitFilterForSource(this.currentSourceType);
    const q = this.getRandomQuestion(unitKey);
    this.currentQuestion = q;

    // 드랍 테이블/확률은 절대 노출하지 않고 단원명과 제목만 깔끔하게 표시
    const isComprehensive = (this.currentSourceType === 'teacher_desk');
    this.titleEl.innerText = this.currentSourceName;
    this.unitEl.innerText = isComprehensive ? `전범위 모의고사 (${q.unit || 'L1~L4'})` : (q.unit || `Grade ${q.grade}`);
    this.questionEl.innerText = q.question;

    this.feedbackEl.classList.add('hidden');
    this.btnClose.classList.remove('hidden');
    this.btnClose.innerText = '나가기';
    if (this.btnNext) {
      this.btnNext.classList.remove('hidden');
      this.btnNext.disabled = false;
      this.btnNext.innerText = '다음 문제 ➔';
      this.btnNext.style.opacity = '1';
      this.btnNext.style.cursor = 'pointer';
    }
    this.optionsGrid.innerHTML = '';

    // 0.35초 입력 디바운스: 문제가 나타나자마자 화면 연타로 찍기 방지
    this.optionsClickable = false;
    setTimeout(() => {
      this.optionsClickable = true;
    }, 350);

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.innerText = opt;
      btn.addEventListener('click', () => {
        if (!this.optionsClickable) return;
        this.handleAnswer(opt, btn);
      });
      this.optionsGrid.appendChild(btn);
    });

    this.modal.classList.remove('hidden');
  }

  resolveTargetDropInfo() {
    const cfg = window.ECONOMY_CONFIG;
    if (this.currentSpotData && this.currentSpotData.dropItem) {
      return {
        item: this.currentSpotData.dropItem,
        name: this.currentSpotData.dropName,
        icon: this.currentSpotData.dropIcon || ITEM_ICON_MAP[this.currentSpotData.dropItem] || '📦',
        rate: cfg.spotDropRates[this.currentSourceType] || this.currentSpotData.dropRate || cfg.itemDropRatePercent
      };
    }

    if (this.currentSourceType === 'gather_wood') {
      return { item: 'item_wood', name: '단단한 목재', icon: '🪵', rate: cfg.spotDropRates.gather_wood || 20 };
    }
    if (this.currentSourceType === 'gather_herb') {
      return { item: 'item_herb', name: '향긋한 허브', icon: '🌿', rate: cfg.spotDropRates.gather_herb || 25 };
    }
    if (this.currentSourceType === 'gather_forsythia' || this.currentSourceType === 'forsythia') {
      return { item: 'item_forsythia', name: '노란 개나리 꽃잎', icon: '🌼', rate: cfg.spotDropRates.gather_forsythia || 10 };
    }
    if (this.currentSourceType === 'gather_ginkgo' || this.currentSourceType === 'ginkgo') {
      return { item: 'item_ginkgo', name: '황금 은행잎', icon: '🍂', rate: cfg.spotDropRates.gather_ginkgo || 7 };
    }

    const randMat = BASIC_GRIND_POOL[Math.floor(Math.random() * BASIC_GRIND_POOL.length)];
    return {
      item: randMat.item,
      name: randMat.name,
      icon: randMat.icon,
      rate: cfg.spotDropRates.board || cfg.itemDropRatePercent || 15
    };
  }

  handleAnswer(selectedOption, buttonEl) {
    if (!this.optionsClickable) return;
    if (this.isHandlingAnswer) return;
    this.isHandlingAnswer = true;

    const isCorrect = (selectedOption === this.currentQuestion.answer);

    const allBtns = this.optionsGrid.querySelectorAll('.quiz-opt-btn');
    allBtns.forEach(b => b.disabled = true);

    if (isCorrect) {
      this.wrongCooldownUntil = 0;
      if (window.AudioManager) window.AudioManager.playCorrect();
      buttonEl.classList.add('correct');

      const cfg = window.ECONOMY_CONFIG;
      const isComprehensive = (this.currentSourceType === 'teacher_desk');
      const multiplier = isComprehensive ? 2 : 1; // 💡 교탁 모의고사: 골드 2배 + EXP 2배 보너스!

      const rawGold = Math.floor(Math.random() * (cfg.maxGold - cfg.minGold + 1)) + cfg.minGold;
      const earnedGold = rawGold * multiplier;
      const earnedExp = cfg.baseExp * multiplier;

      const dropInfo = this.resolveTargetDropInfo();
      const roll = Math.random() * 100;
      const isItemDropped = roll < dropInfo.rate;

      if (window.MainApp) {
        window.MainApp.addGold(earnedGold);
        window.MainApp.addExp(earnedExp);
        if (isItemDropped) {
          window.MainApp.addItem(dropInfo.item, dropInfo.name, cfg.dropAmount, dropInfo.icon, {
            type: 'material'
          });
        }
      }

      let rewardMsg = isComprehensive
        ? `⭐ [1~4단원 전범위 모의고사 보너스: 골드 2배 & EXP 2배!]\n🪙 골드 +${earnedGold}G (2배), 경험치 +${earnedExp} EXP (2배)`
        : `🪙 골드 +${earnedGold}G, 경험치 +${earnedExp} EXP`;

      if (isItemDropped) {
        this.feedbackIcon.innerText = '🌟';
        this.feedbackText.innerText = isComprehensive ? '정답입니다! (모의고사 2배 보너스 + 아이템)' : '정답입니다! (아이템 획득)';
        this.feedbackEl.style.borderColor = '#eab308';
        rewardMsg += `\n🎁 아이템 획득: ${dropInfo.icon} ${dropInfo.name} x${cfg.dropAmount}`;
      } else {
        this.feedbackIcon.innerText = isComprehensive ? '🏆' : '🎉';
        this.feedbackText.innerText = isComprehensive ? '정답입니다! (골드·EXP 2배 보너스!)' : '정답입니다!';
        this.feedbackEl.style.borderColor = isComprehensive ? '#eab308' : '#16a34a';
      }

      this.feedbackExp.innerText = `${this.currentQuestion.explanation || ''}\n\n${rewardMsg}`;
    } else {
      const penalty = Math.floor(Math.random() * 2) + 1; // 1 or 2 HP penalty
      let currentHp = 100;
      let maxHp = 100;

      if (window.MainApp) {
        window.MainApp.takeQuizDamage(penalty);
        currentHp = window.MainApp.playerData.hp;
        maxHp = window.MainApp.playerData.maxHp;
      }

      if (window.AudioManager) {
        window.AudioManager.playWrong();
        setTimeout(() => {
          if (window.AudioManager) window.AudioManager.playHit();
        }, 120);
      }

      buttonEl.classList.add('wrong');
      this.feedbackIcon.innerText = '💔';
      this.feedbackText.innerText = `오답입니다! (체력 -${penalty} HP)`;
      this.feedbackEl.style.borderColor = '#dc2626';

      const expText = this.currentQuestion.explanation ? `\n해설: ${this.currentQuestion.explanation}` : '';
      this.feedbackExp.innerText = `정답: '${this.currentQuestion.answer}'${expText}\n\n⚠️ 오답 패널티: 체력 -${penalty} HP (현재 HP: ${currentHp} / ${maxHp})`;

      // 🛑 틀렸을 때 1초간 다음 문제 및 연속 입력 차단 (광클 방지)
      this.wrongCooldownUntil = Date.now() + 1000;
      if (this.btnNext) {
        this.btnNext.disabled = true;
        this.btnNext.style.opacity = '0.5';
        this.btnNext.style.cursor = 'not-allowed';
        this.btnNext.innerText = '⏳ 1초 대기 (오답 쿨타임)...';
        setTimeout(() => {
          if (this.btnNext && !this.modal.classList.contains('hidden')) {
            this.btnNext.disabled = false;
            this.btnNext.style.opacity = '1';
            this.btnNext.style.cursor = 'pointer';
            this.btnNext.innerText = '다음 문제 ➔';
          }
        }, 1000);
      }
    }

    this.feedbackEl.classList.remove('hidden');
    this.btnClose.classList.remove('hidden');
    this.btnClose.innerText = '나가기';
    if (this.btnNext) {
      this.btnNext.classList.remove('hidden');
    }
  }

  closeQuiz() {
    this.modal.classList.add('hidden');
    this.currentQuestion = null;
    this.isHandlingAnswer = false;
  }
}

window.QuizManager = QuizManager;
