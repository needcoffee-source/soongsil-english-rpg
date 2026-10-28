/**
 * Quiz Manager for Soongsil Open World RPG — Season 1
 * - 목재(gather_wood): 1~4단원(L1~L4) 통합 출제 (225문항 비복원 셔플 덱)
 * - 허브(gather_herb): 1단원(L1) 문제 출제 (60문항 비복원 셔플 덱)
 * - 개나리(gather_forsythia): 2단원(L2) 문제 출제 (55문항 비복원 셔플 덱)
 * - 교목 은행나무(gather_ginkgo): 3단원(L3) 문제 출제 (55문항 비복원 셔플 덱)
 * - 교탁(teacher_desk): 4단원(L4) 문제 출제 (55문항 비복원 셔플 덱, 골드 2배)
 * - 객관식 4지선다 보기는 매 출제 시마다 Fisher-Yates 셔플로 무작위 배치
 * - 드랍 테이블 및 확률은 화면에 노출하지 않음
 */

window.ECONOMY_CONFIG = {
  minGold: 1,
  maxGold: 3,
  baseExp: 5,
  itemDropRatePercent: 25, // 기본 드랍률: 15% -> 25% (+10% 상향)
  dropAmount: 1,
  spotDropRates: {
    gather_wood: 45, // 목재: 35% -> 45% (+10% 상향)
    gather_herb: 35, // 허브: 25% -> 35% (+10% 상향)
    gather_forsythia: 20, // 개나리: 10% -> 20% (+10% 상향)
    gather_ginkgo: 17 // 교목 은행나무: 7% -> 17% (+10% 상향)
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

// ========================================================
// 1학년 4반 후니후니 선생님의 도덕 & 비트 20문항 문제은행
// ========================================================
window.MORAL_DRUM_QUESTIONS = [
  {
    id: "q_moral_1",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "4단원 본문 이야기에서 백성들이 굶주리는데도 쌀을 곳간에 쌓아두고 나누지 않은 왕의 성격으로 알맞은 영어 단어는?\n\"Long ago, there lived a _______ king. He didn't share his rice with his people.\"",
    options: ["kind", "greedy", "honest", "polite"],
    answer: "greedy",
    explanation: "백성들에게 쌀을 나누지 않은 이기적인 왕이므로 '탐욕스러운, 욕심 많은'을 뜻하는 greedy가 알맞습니다."
  },
  {
    id: "q_moral_2",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "떨어진 쌀을 바구니에 담아 정직하게 왕에게 돌려준 라니에게 왕이 감탄하며 한 말입니다. 빈칸에 알맞은 말은?\n\"_______ honest you are! I want to reward you.\"",
    options: ["Where", "What", "How", "When"],
    answer: "How",
    explanation: "How + 형용사(honest) + 주어(you) + 동사(are)! 감탄문 공식입니다."
  },
  {
    id: "q_moral_3",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "지혜롭게 쌀 한 톨을 30일 동안 두 배씩 늘려 백성들을 구한 라니를 칭찬하는 감탄문입니다. 빈칸에 알맞은 말은?\n\"_______ a wise girl Rani was!\"",
    options: ["What", "How", "Why", "Who"],
    answer: "What",
    explanation: "What + a/an + 형용사(wise) + 명사(girl) + 주어 + 동사! 감탄문 공식입니다."
  },
  {
    id: "q_moral_4",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "자신의 욕심을 반성한 왕이 마침내 백성들과 쌀을 나누었습니다. 빈칸에 알맞은 과거형 동사는?\n\"The king learned a lesson and _______ his rice with everyone.\"",
    options: ["share", "shares", "shared", "sharing"],
    answer: "shared",
    explanation: "과거 사실을 서술하는 문맥이므로 규칙 과거형 동사 shared가 알맞습니다."
  },
  {
    id: "q_moral_5",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "라니의 이야기에서 우리가 배울 수 있는 도덕적 교훈으로 가장 알맞은 영어 속담은?",
    options: ["Sharing brings true happiness.", "Money is everything.", "Never trust anyone.", "Keep all things for yourself."],
    answer: "Sharing brings true happiness.",
    explanation: "4단원 본문이 전하는 핵심 도덕 가치는 나눔이 가져다주는 진정한 행복입니다."
  },
  {
    id: "q_moral_6",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "복도를 걷다가 친구가 실수로 교과서와 필통을 와르르 쏟았습니다. 도덕적으로 가장 올바른 나의 행동과 영어 표현은?",
    options: ["I will laugh at him loudly.", "I will help him pick up the books.", "I will run away fast.", "I will kick the pencil case."],
    answer: "I will help him pick up the books.",
    explanation: "곤경에 처한 친구를 따뜻하게 돕는 배려의 표현이 정답입니다."
  },
  {
    id: "q_moral_7",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "시험 시간, 옆자리 친구가 쪽지로 답을 알려달라고 합니다. 도덕적으로 정직하게 대처하는 올바른 말은?",
    options: ["I will say no and solve my test honestly.", "I will give him all the answers.", "I will ask the teacher for answers.", "I will tear up my test paper."],
    answer: "I will say no and solve my test honestly.",
    explanation: "정직(Honesty)은 부정행위를 거절하고 공정하게 임하는 태도입니다."
  },
  {
    id: "q_moral_8",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "운동장에서 주인이 없는 잃어버린 지갑을 발견했습니다. 도덕적으로 가장 올바른 행동은?",
    options: ["I will take the money inside.", "I will hide it under the grass.", "I will bring it to the teacher.", "I will throw it in the trash bin."],
    answer: "I will bring it to the teacher.",
    explanation: "습득물은 즉시 선생님이나 교무실로 전달하는 것이 바른 인성입니다."
  },
  {
    id: "q_moral_9",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "방과 후 교실에서 혼자 땀 흘리며 힘들게 청소하는 친구를 보았을 때, 도덕적으로 가장 알맞은 말은?",
    options: ["Let's clean the classroom together!", "Clean faster, my friend!", "It's not my job, bye!", "Make the floor dirty!"],
    answer: "Let's clean the classroom together!",
    explanation: "협동과 배려의 마음으로 함께 돕는 표현입니다."
  },
  {
    id: "q_moral_10",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "친구와 사소한 일로 오해가 생겨 다투었습니다. 화해를 위해 먼저 용기를 내어 할 수 있는 말은?",
    options: ["It's all your fault!", "I will never talk to you again.", "I'm sorry. Let's listen to each other.", "You must give me your snacks."],
    answer: "I'm sorry. Let's listen to each other.",
    explanation: "자신의 잘못을 인정하고 경청하며 평화롭게 화해하는 올바른 태도입니다."
  },
  {
    id: "q_moral_11",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "\"정직은 최고의 정책이다(가장 좋은 방책이다).\"라는 유명한 명언입니다. 빈칸에 알맞은 단어는?\n\"_______ is the best policy.\"",
    options: ["Anger", "Honesty", "Laziness", "Jealousy"],
    answer: "Honesty",
    explanation: "정직의 중요성을 강조하는 세계적인 명언 속 핵심 어휘는 Honesty입니다."
  },
  {
    id: "q_moral_12",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "선생님과 친구들을 서로 아끼고 '존중'해야 함을 나타내는 문장입니다. 빈칸에 알맞은 단어는?\n\"We should always _______ our teachers and friends.\"",
    options: ["respect", "ignore", "tease", "fight"],
    answer: "respect",
    explanation: "상대를 존중하고 공경함을 뜻하는 도덕 필수 어휘는 respect입니다."
  },
  {
    id: "q_moral_13",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "자신이 맡은 역할과 행동에 대해 '책임'을 져야 한다는 문장입니다. 빈칸에 알맞은 말은?\n\"Take _______ for your actions.\"",
    options: ["holiday", "responsibility", "excuse", "lie"],
    answer: "responsibility",
    explanation: "Take responsibility for ~는 '~에 책임을 지다'라는 표현입니다."
  },
  {
    id: "q_moral_14",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "작은 '친절' 하나도 결코 헛되지 않는다는 명언입니다. 빈칸에 알맞은 단어는?\n\"No act of _______, no matter how small, is ever wasted.\"",
    options: ["cruelty", "sadness", "kindness", "hurry"],
    answer: "kindness",
    explanation: "이솝 우화의 유명한 교훈으로 kindness(친절)가 정답입니다."
  },
  {
    id: "q_moral_15",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "모든 사람을 편견 없이 공평하고 '정의'롭게 대해야 함을 나타내는 단어는?\n\"A good society needs fairness and _______.\"",
    options: ["justice", "greed", "violence", "darkness"],
    answer: "justice",
    explanation: "사회적 미덕인 공정과 정의를 뜻하는 어휘는 justice입니다."
  },
  {
    id: "q_moral_16",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "남에게 대접받고 싶은 대로 남을 대하라는 도덕의 원칙인 '황금률(Golden Rule)' 명언의 빈칸은?\n\"Treat others as you want to be _______.\"",
    options: ["treated", "pushed", "blamed", "forgotten"],
    answer: "treated",
    explanation: "Treat others as you want to be treated는 도덕의 황금률입니다."
  },
  {
    id: "q_moral_17",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "말만 앞세우기보다 실천과 '행동'이 훨씬 더 중요하다는 4단원 지혜의 명언은?\n\"Actions speak _______ than words.\"",
    options: ["softer", "louder", "slower", "worse"],
    answer: "louder",
    explanation: "Actions speak louder than words 속담입니다."
  },
  {
    id: "q_moral_18",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "혼자 가면 빨리 가지만, 친구와 '함께' 가면 멀리 간다는 지혜 격언입니다. 빈칸에 알맞은 단어는?\n\"If you want to go fast, go alone. If you want to go far, go _______.\"",
    options: ["together", "back", "late", "nowhere"],
    answer: "together",
    explanation: "협동과 연대의 가치를 담은 명언으로 together가 알맞습니다."
  },
  {
    id: "q_moral_19",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "실패를 두려워하지 않고 배움으로 삼는 마음에 관한 명언입니다. 빈칸에 알맞은 단어는?\n\"Failure is simply the opportunity to begin again with more _______.\"",
    options: ["wisdom", "fear", "tears", "silence"],
    answer: "wisdom",
    explanation: "4단원 핵심 테마인 wisdom(지혜)을 배움의 과정과 연결한 명언입니다."
  },
  {
    id: "q_moral_20",
    grade: 1,
    unit: "4단원 (Words of Wisdom)",
    question: "1학년 4반 드럼 치는 도덕쌤이 학생들에게 강조하는 인생의 락스피릿 명언입니다! 빈칸에 알맞은 말은?\n\"Life is like rhythm. Live in _______ with everyone around you!\"",
    options: ["conflict", "harmony", "chaos", "noise"],
    answer: "harmony",
    explanation: "음악의 비트와 인성의 도덕을 관통하는 핵심 단어인 harmony(조화)가 정답입니다."
  }
];

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
   * unitFilter: 단일 문자열 ('1단원', 'L1') 또는 단원 배열 (['1단원', '2단원', '3단원', '4단원'])
   */
  getRandomQuestion(unitFilter = null) {
    if (!this.questions || this.questions.length === 0) return null;

    let deckKey = 'ALL';
    if (Array.isArray(unitFilter)) {
      deckKey = unitFilter.slice().sort().join(',');
    } else if (unitFilter) {
      deckKey = String(unitFilter);
    }

    if (!this.unitDecks[deckKey] || this.unitDecks[deckKey].length === 0) {
      let pool = this.questions;
      if (unitFilter) {
        if (Array.isArray(unitFilter)) {
          const filtered = this.questions.filter(q =>
            q.unit && unitFilter.some(u => q.unit.includes(u))
          );
          if (filtered.length > 0) pool = filtered;
        } else {
          const filtered = this.questions.filter(q => q.unit && q.unit.includes(unitFilter));
          if (filtered.length > 0) pool = filtered;
        }
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
    // 목재: 1~4단원
    if (sourceType === 'gather_wood') return ['1단원', '2단원', '3단원', '4단원'];
    // 허브: 1단원
    if (sourceType === 'gather_herb') return '1단원';
    // 개나리: 2단원
    if (sourceType === 'gather_forsythia' || sourceType === 'forsythia') return '2단원';
    // 은행나무: 3단원
    if (sourceType === 'gather_ginkgo' || sourceType === 'ginkgo') return '3단원';
    // 교탁(골드): 4단원
    if (sourceType === 'teacher_desk' || sourceType === 'board') return '4단원';
    // 필드 몬스터
    if (sourceType === 'basketball' || sourceType === 'basketball_monster') return '5단원';
    if (sourceType === 'futsal' || sourceType === 'futsal_monster') return '6단원';
    if (sourceType === 'field_monster') return Math.random() < 0.5 ? '5단원' : '6단원';
    return ['1단원', '2단원', '3단원', '4단원'];
  }

  nextQuiz() {
    if (this.currentSourceType === 'moral_drum') {
      const app = window.MainApp;
      const solvedIds = (app && app.playerData && app.playerData.solvedMoralQuestionIds) || [];
      if (solvedIds.length >= 20) {
        this.closeQuiz();
        if (app && typeof app.openMoralRewardModal === 'function') {
          app.openMoralRewardModal();
        }
        return;
      }
      this.startMoralDrumQuiz();
      return;
    }
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

    // 단원별 필터링
    const unitKey = this.getUnitFilterForSource(this.currentSourceType);
    const q = this.getRandomQuestion(unitKey);
    this.currentQuestion = q;

    // 단원명 및 제목 표시
    this.titleEl.innerText = this.currentSourceName;
    this.unitEl.innerText = q.unit || `Grade ${q.grade}`;
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

  startMoralDrumQuiz() {
    if (!window.MORAL_DRUM_QUESTIONS || window.MORAL_DRUM_QUESTIONS.length === 0) {
      alert('출제 가능한 1학년 4반 도덕 문제가 없습니다.');
      return;
    }

    const app = window.MainApp;
    if (!app || !app.playerData) return;

    if (app.playerData.hasClearedClass704) {
      if (window.RPGDialog) {
        window.RPGDialog.show(
          '🥁 후니후니 선생님',
          `"와우! [${app.playerData.name}] 학생! 넌 이미 20문제를 모두 마스터하고 [🥁 영혼의 드러머] 칭호를 획득했단다! 👏\n\n더 이상 시험을 치를 필요는 없으니 교실 뒤 드럼 세트를 치며 신나게 락스피릿을 즐기렴! 🤘"`,
          '🥁'
        );
      } else {
        alert('🥁 [후니후니 선생님]\n\n"와우! 넌 이미 20문제를 모두 마스터했단다! 언제든 드럼 세트를 치러 놀러오렴!"');
      }
      return;
    }

    const solvedIds = app.playerData.solvedMoralQuestionIds || [];
    const remaining = window.MORAL_DRUM_QUESTIONS.filter(q => !solvedIds.includes(q.id));

    if (remaining.length === 0 || solvedIds.length >= 20) {
      if (!app.playerData.hasClearedClass704) {
        if (typeof app.openMoralRewardModal === 'function') {
          app.openMoralRewardModal();
        }
      }
      return;
    }

    // 오답 쿨타임 체크 (1초)
    if (this.wrongCooldownUntil && Date.now() < this.wrongCooldownUntil) {
      const remainMs = this.wrongCooldownUntil - Date.now();
      const remainSec = (remainMs / 1000).toFixed(1);
      if (app.showToast) {
        app.showToast(`⏳ 오답 패널티: ${remainSec}초 후 다시 도전할 수 있습니다.`, 'warning');
      }
      return;
    }

    this.isHandlingAnswer = false;
    this.currentSourceName = '🥁 1학년 4반 도덕 & 비트 퀴즈';
    this.currentSourceType = 'moral_drum';
    this.currentSpotData = null;

    // 남은 문제 중 랜덤 1문항 선택
    const rawQ = remaining[Math.floor(Math.random() * remaining.length)];
    this.currentQuestion = {
      ...rawQ,
      options: shuffleArray(rawQ.options || [])
    };

    const solvedCount = solvedIds.length;
    this.titleEl.innerText = this.currentSourceName;
    this.unitEl.innerText = `진행도: ${solvedCount}/20 완파 (${20 - solvedCount}문제 남음) | ${rawQ.unit || '4단원 Words of Wisdom'}`;
    this.questionEl.innerText = rawQ.question;

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

    this.optionsClickable = false;
    setTimeout(() => {
      this.optionsClickable = true;
    }, 350);

    this.currentQuestion.options.forEach(opt => {
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
      return { item: 'item_wood', name: '단단한 목재', icon: '🪵', rate: cfg.spotDropRates.gather_wood || 45 };
    }
    if (this.currentSourceType === 'gather_herb') {
      return { item: 'item_herb', name: '향긋한 허브', icon: '🌿', rate: cfg.spotDropRates.gather_herb || 35 };
    }
    if (this.currentSourceType === 'gather_forsythia' || this.currentSourceType === 'forsythia') {
      return { item: 'item_forsythia', name: '노란 개나리 꽃잎', icon: '🌼', rate: cfg.spotDropRates.gather_forsythia || 20 };
    }
    if (this.currentSourceType === 'gather_ginkgo' || this.currentSourceType === 'ginkgo') {
      return { item: 'item_ginkgo', name: '황금 은행잎', icon: '🍂', rate: cfg.spotDropRates.gather_ginkgo || 17 };
    }

    const randMat = BASIC_GRIND_POOL[Math.floor(Math.random() * BASIC_GRIND_POOL.length)];
    return {
      item: randMat.item,
      name: randMat.name,
      icon: randMat.icon,
      rate: cfg.spotDropRates.board || cfg.itemDropRatePercent || 25
    };
  }

  handleAnswer(selectedOption, buttonEl) {
    if (!this.optionsClickable) return;
    if (this.isHandlingAnswer) return;
    this.isHandlingAnswer = true;

    const isCorrect = (selectedOption === this.currentQuestion.answer);

    const allBtns = this.optionsGrid.querySelectorAll('.quiz-opt-btn');
    allBtns.forEach(b => b.disabled = true);

    // 🥁 1학년 4반 도덕&비트 퀴즈 전용 정답/오답 및 20문제 소거 판정
    if (this.currentSourceType === 'moral_drum') {
      if (isCorrect) {
        this.wrongCooldownUntil = 0;
        if (window.AudioManager) {
          if (typeof window.AudioManager.playDrumBeat === 'function') {
            window.AudioManager.playDrumBeat();
          } else if (typeof window.AudioManager.playCorrect === 'function') {
            window.AudioManager.playCorrect();
          }
        }
        buttonEl.classList.add('correct');

        const app = window.MainApp;
        if (app && app.playerData) {
          if (!Array.isArray(app.playerData.solvedMoralQuestionIds)) {
            app.playerData.solvedMoralQuestionIds = [];
          }
          if (!app.playerData.solvedMoralQuestionIds.includes(this.currentQuestion.id)) {
            app.playerData.solvedMoralQuestionIds.push(this.currentQuestion.id);
          }
          app.addGold(50);
          app.addExp(30);
          app.saveProgress();
        }

        const solvedCount = (app && app.playerData && app.playerData.solvedMoralQuestionIds ? app.playerData.solvedMoralQuestionIds.length : 0);

        if (solvedCount >= 20) {
          this.feedbackIcon.innerText = '🥁';
          this.feedbackText.innerText = '🏆 20문항 전원 정답 달성! 영혼의 드러머 등극!';
          this.feedbackEl.style.borderColor = '#e11d48';
          this.feedbackExp.innerText = `${this.currentQuestion.explanation || ''}\n\n🎉 대단합니다! 후니후니 선생님의 도덕 & 비트 20문제를 모두 맞혔습니다!\n아래 [보상 재료 선택하기] 버튼을 눌러 특별 한정 호칭 [🥁 영혼의 드러머]와 핵심 재료 10개를 수령하세요!`;
          if (this.btnNext) {
            this.btnNext.innerText = '🎁 보상 재료 선택하기 ➔';
          }
        } else {
          this.feedbackIcon.innerText = '🥁';
          this.feedbackText.innerText = `정답입니다! 🥁 [진행도: ${solvedCount}/20 완파]`;
          this.feedbackEl.style.borderColor = '#16a34a';
          this.feedbackExp.innerText = `${this.currentQuestion.explanation || ''}\n\n🪙 골드 +50G, 경험치 +30 EXP 획득!\n(소거 완료: 앞으로 ${20 - solvedCount}문제 남았습니다!)`;
          if (this.btnNext) {
            this.btnNext.innerText = '다음 문제 ➔';
          }
        }
      } else {
        const penalty = Math.floor(Math.random() * 2) + 1;
        let currentHp = 100;
        let maxHp = 100;
        const app = window.MainApp;
        if (app) {
          app.takeQuizDamage(penalty);
          currentHp = app.playerData.hp;
          maxHp = app.playerData.maxHp;
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
        this.feedbackExp.innerText = `정답: '${this.currentQuestion.answer}'${expText}\n\n⚠️ 오답 패널티: 체력 -${penalty} HP (현재 HP: ${currentHp} / ${maxHp})\n(틀린 문제는 소거되지 않으며 다시 출제됩니다!)`;

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
      return;
    }

    if (isCorrect) {
      this.wrongCooldownUntil = 0;
      if (window.AudioManager) window.AudioManager.playCorrect();
      buttonEl.classList.add('correct');

      const cfg = window.ECONOMY_CONFIG;
      const isDesk = (this.currentSourceType === 'teacher_desk');
      const multiplier = isDesk ? 2 : 1; // 💡 교탁 퀴즈: 골드 2배 + EXP 2배 보너스!

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

      let rewardMsg = isDesk
        ? `⭐ [교탁 퀴즈 보너스: 골드 2배 & EXP 2배!]\n🪙 골드 +${earnedGold}G (2배), 경험치 +${earnedExp} EXP (2배)`
        : `🪙 골드 +${earnedGold}G, 경험치 +${earnedExp} EXP`;

      if (isItemDropped) {
        this.feedbackIcon.innerText = '🌟';
        this.feedbackText.innerText = isDesk ? '정답입니다! (교탁 2배 보너스 + 아이템)' : '정답입니다! (아이템 획득)';
        this.feedbackEl.style.borderColor = '#eab308';
        rewardMsg += `\n🎁 아이템 획득: ${dropInfo.icon} ${dropInfo.name} x${cfg.dropAmount}`;
      } else {
        this.feedbackIcon.innerText = isDesk ? '🏆' : '🎉';
        this.feedbackText.innerText = isDesk ? '정답입니다! (골드·EXP 2배 보너스!)' : '정답입니다!';
        this.feedbackEl.style.borderColor = isDesk ? '#eab308' : '#16a34a';
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
