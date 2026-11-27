// =========================================================================
// 🏛️ 6층 교무실 교사 퀘스트 정의 (RPG Quest Dispatch System)
// =========================================================================
var QUEST_DEFINITIONS = window.QUEST_DEFINITIONS = {
  'quest_joshua_intro': {
    id: 'quest_joshua_intro',
    minLevel: 1,
    teacherId: 'npc_teacher_joshua',
    teacherName: 'Joshua 선생님',
    teacherRole: '3학년 영어',
    teacherSeat: '교무실',
    returnLocation: '6층 교무실',
    progressHint: '1-1 교실 교탁과 6층 탕비실 안쪽을 조사하세요.',
    teacherAvatar: '👨‍🏫',
    category: '⭐ 입문 퀘스트 (Introductory Quest)',
    title: '[3학년 영어] Joshua 선생님의 특별 지령: 흩어진 단어장',
    story: `Hello, student! 나는 3학년 영어를 가르치고 있는 Joshua 선생님이란다. 👨‍🏫

이번 3학년 단어 평가를 앞두고 핵심 영단어 메모를 검토하던 중, 그만 6층 탕비실에서 커피를 타다가 바닥 구석에 떨어뜨리고 말았지 뭐니!

게다가 자네가 3학년 영어를 배울 기본기가 튼튼한지도 한번 점검해보고 싶군.

1-1 교실 교탁에서 영어 퀴즈 2문제를 멋지게 맞히고, 6층 교무실 탕비실 안쪽 싱크대 근처에 떨어진 내 [Joshua의 단어 메모]를 찾아와 주겠나?

성공하면 든든한 골드와 경험치, 그리고 순간이동 주문서를 보상으로 지급하겠네!`,
    inProgressStory: `어서 오게나! 아직 임무가 완료되지 않았더군!

1-1 교실 교탁에서 영어 퀴즈 2문제를 풀고, 6층 교무실 탕비실 안쪽 구석에 떨어진 내 단어 메모를 찾아와 주게나!`,
    completeStory: `Oh, brilliant! Wonderful work! 👏

자네 덕분에 3학년 영어 단어장 메모를 무사히 되찾았고, 1학년 1반 영어 퀴즈도 멋지게 통과했더군!

약속했던 골드와 경험치, 그리고 유용한 순간이동 주문서를 지급하겠네! 앞으로도 숭실을 위해 힘써주게!`,
    doneStory: `Hello, student! 자네 덕분에 이번 3학년 영어 수업 준비가 아주 순조롭다네.

언제나 성실하게 활약하는 자네가 자랑스럽군! 궁금한 점이 있으면 언제든 교무실로 찾아오게나! 👍`,
    objectives: [
      {
        id: 'quiz',
        text: '1-1 교실 교탁 영어 퀴즈 2회 정답',
        targetCount: 2,
        getCount: (quest) => (quest ? (quest.quizCount || 0) : 0)
      },
      {
        id: 'memo',
        text: '6층 교무실 탕비실 안쪽에서 [Joshua의 단어 메모] 회수하기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.memoCollected ? 1 : 0)
      }
    ],
    rewards: [
      { type: 'gold', amount: 100, label: '🪙 100 G (골드)' },
      { type: 'exp', amount: 100, label: '🌟 100 EXP (경험치)' },
      { type: 'item', itemKey: 'item_teleport_scroll', itemName: '순간이동 주문서', count: 1, icon: '📜', label: '📜 순간이동 주문서 x1' }
    ]
  },
  'quest_okchohan_social': {
    id: 'quest_okchohan_social',
    minLevel: 4,
    teacherId: 'npc_teacher_okchohan',
    teacherName: '옥촣한 선생님',
    teacherRole: '사회',
    teacherSeat: '교무실',
    returnLocation: '6층 교무실',
    progressHint: '1-3 컴퓨터실 산성비 1,000점 & 교무실 인쇄실 교재를 찾으세요.',
    teacherAvatar: '👨‍🏫',
    category: '🏛️ 사회 탐구 퀘스트 (Social Studies Quest)',
    title: '[사회] 옥촣한 선생님의 특별 과제: 숭실 사회 탐구',
    cleanupItem: 'item_okchohan_textbook',
    story: `반갑다! 숭실중학교에서 사회를 가르치는 옥촣한 선생님이란다. 👨‍🏫

사회를 배운다는 것은 빠른 정보 습득력과 민주시민의 순발력을 기르는 것이기도 하지!

이번 사회 수업 연구 과제를 준비하던 중, 교무실 안쪽 인쇄기 근처에 내 [옥촣한의 사회 탐구 교재]를 두고 왔지 뭐니!

1학년 3반 컴퓨터실에서 [산성비 단어 타자 게임 1,000점 이상 달성]하고, 교무실 인쇄실 근처에 놓인 내 사회 교재를 찾아와 주겠니?

과제를 성실히 마친 학생에게는 전설의 장비 제작 핵심 재료인 [청동 드래곤의 심장]을 선물로 주마!`,
    inProgressStory: `어서 오렴! 아직 사회 탐구 과제가 완료되지 않았더구나!

1학년 3반 컴퓨터실에서 산성비 타자 게임 1,000점 이상을 달성하고, 교무실 안쪽 인쇄실 근처에 있는 내 사회 교재를 찾아오렴!`,
    completeStory: `오, 훌륭하구나! 멋지게 과제를 완수했어! 👏

덕분에 사회 탐구 교재도 무사히 되찾았고, 산성비 타자 게임도 1,000점을 넘겨 순발력을 증명했더구나!

약속했던 특별 보상으로 [청동 드래곤의 심장]을 수여하마! 앞으로도 숭실의 모범 시민으로 성장해주길 바란다!`,
    doneStory: `자네 덕분에 이번 사회 수업 준비가 아주 순조롭단다.

언제나 성실하게 활약하는 자네가 자랑스럽구나! 사회에 대해 궁금한 점이 있다면 언제든 편하게 찾아오렴! 👍`,
    objectives: [
      {
        id: 'acid_rain',
        text: '1학년 3반 컴퓨터실에서 산성비 타자 게임 1,000점 이상 달성하기',
        targetCount: 1000,
        unit: '점',
        getCount: (quest) => (quest ? (quest.acidRainScore || 0) : 0)
      },
      {
        id: 'textbook',
        text: '6층 교무실 인쇄실 근처에서 [옥촣한의 사회 탐구 교재] 회수하기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.textbookCollected ? 1 : 0)
      }
    ],
    rewards: [
      { type: 'item', itemKey: 'item_bronze_heart', itemName: '청동 드래곤의 심장', count: 1, icon: '❤️‍🔥', meta: { type: 'material', effect: '3티어 청동 장비 제작 핵심 재료' }, label: '❤️‍🔥 청동 드래곤의 심장 x1개' },
      { type: 'gold', amount: 100, label: '🪙 100 G (골드)' },
      { type: 'exp', amount: 100, label: '🌟 100 EXP (경험치)' }
    ]
  },
  'quest_kimmijin_art': {
    id: 'quest_kimmijin_art',
    minLevel: 3,
    teacherId: 'npc_teacher_kimmijin',
    teacherName: '김진믜 선생님',
    teacherRole: '미술',
    teacherSeat: '교무실',
    returnLocation: '6층 교무실',
    progressHint: '노란 개나리 꽃잎 3송이 & 운동장 스탠드 파란 벤치의 스케치북을 찾으세요.',
    teacherAvatar: '🎨',
    category: '🎨 숭실 예술 프로젝트 (Fine Arts Quest)',
    title: '[미술] 김진믜 선생님의 예술 프로젝트: 숭실의 색채',
    cleanupItem: 'item_kimmijin_sketchbook',
    story: `반갑다! 숭실중학교에서 미술을 가르치는 김진믜 선생님이란다. 🎨

미술은 우리 주변의 아름다운 색채를 관찰하고 표현하는 예술이란다!

이번에 교내 미술전에 출품할 숭실 풍경화를 준비하고 있는데, 두 가지 도움이 필요하단다.

첫째, 풍경화에 화사한 봄빛을 입힐 천연 안료 재료로 [노란 개나리 꽃잎] 3송이가 필요하단다. (1학년 1반 채집장이나 가방에서 마련할 수 있단다!)

둘째, 지난번 운동장 스탠드에서 교내 풍경을 스케치하다가 위쪽 파란색 벤치(좌석)에 내 [김진믜의 풍경화 스케치북]을 깜빡 두고 왔지 뭐니!

운동장 스탠드 파란색 벤치에서 내 스케치북을 찾아와 주면, 고마운 마음을 담아 향긋한 [노란 개나리 꽃잎] 3개와 경험치를 선물로 줄게!`,
    inProgressStory: `어서 오렴! 아직 미술 프로젝트 준비물이 모두 모이지 않았더구나!

풍경화 채색용 [노란 개나리 꽃잎 3송이]와 운동장 스탠드 파란색 벤치에 놓인 [김진믜의 풍경화 스케치북]을 찾아와 주렴! 🎨`,
    completeStory: `어머나, 정말 고마워! 완벽하게 구해왔구나! 👏

덕분에 운동장 스탠드 파란색 벤치에 떨어져 있던 소중한 스케치북을 되찾았고, 아름다운 풍경화를 완성할 수 있게 되었단다!

약속했던 보상으로 싱싱한 [노란 개나리 꽃잎 3개]와 경험치를 선물로 줄게! 너의 따뜻한 예술적 감성을 응원한다!`,
    doneStory: `너 덕분에 이번 숭실 미술전 작품이 멋지게 완성될 것 같구나!

언제든 미술에 대해 이야기를 나누고 싶거나 영감을 얻고 싶다면 언제든 편하게 찾아오렴! 🎨✨`,
    objectives: [
      {
        id: 'forsythia',
        text: '풍경화 채색용 천연 안료 [노란 개나리 꽃잎] 3송이 수집하기',
        targetCount: 3,
        unit: '송이',
        getCount: (quest) => {
          const invCount = (window.MainApp && typeof window.MainApp.getItemCount === 'function') ? window.MainApp.getItemCount('item_forsythia') : 0;
          return Math.max(invCount, quest ? (quest.forsythiaCount || 0) : 0);
        }
      },
      {
        id: 'sketchbook',
        text: '운동장 스탠드 파란색 벤치에서 [김진믜의 풍경화 스케치북] 회수하기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.sketchbookCollected ? 1 : 0)
      }
    ],
    rewards: [
      { type: 'item', itemKey: 'item_forsythia', itemName: '노란 개나리 꽃잎', count: 3, icon: '🌼', meta: { type: 'material', effect: '개나리 반지 및 주홍 물약 재료' }, label: '🌼 노란 개나리 꽃잎 x3개' },
      { type: 'exp', amount: 100, label: '🌟 100 EXP (경험치)' }
    ]
  },
  quest_yosunyu_info: {
    id: 'quest_yosunyu_info',
    minLevel: 5,
    teacherId: 'npc_teacher_yosunyu',
    teacherName: '요션유 선생님',
    teacherRole: '정보',
    teacherSeat: '교무실',
    returnLocation: '6층 교무실',
    progressHint: '1-3 컴퓨터실 메인 서버 점검 & 1-2 교실 구석의 USB를 찾으세요.',
    teacherAvatar: '💻',
    category: '💻 숭실 정보·알고리즘 프로젝트 (Informatics Quest)',
    title: '[정보] 요션유 선생님의 알고리즘 과제: 디지털 숭실',
    cleanupItem: 'item_yosunyu_usb',
    story: `반갑다! 숭실중학교에서 정보를 가르치는 요션유 선생님이란다. 💻

정보 수업은 컴퓨터의 원리와 코딩, 논리적인 알고리즘적 사고력을 기르는 미래의 핵심 과목이란다!

이번에 교내 프로그래밍 실습과 알고리즘 과제를 준비하고 있는데, 두 가지 도움이 필요하단다.

첫째, 1학년 3반 컴퓨터실에 있는 [선생님 메인 서버]가 잘 작동하고 있는지 직접 가서 시스템을 1회 점검(확인)해 주렴! (학교 전산망이 정상이어야 코딩 실습을 원활히 진행할 수 있단다!)

둘째, 1-2교실(1학년 2반) 가장 구석에 내 [요션유의 알고리즘 USB]를 깜빡 두고 왔지 뭐니! (전교생 정보 수업 코딩 예제와 실습 슬라이드가 모두 담겨있단다!)

컴퓨터실 메인 서버를 점검하고 1-2교실 구석에서 내 알고리즘 USB를 찾아와 주면, 고마운 마음을 담아 귀중한 [보스의 가죽] 1장과 200 경험치를 선물로 줄게!`,
    inProgressStory: `어서 오렴! 아직 정보 프로젝트 준비물이 모두 모이지 않았더구나!

1학년 3반 컴퓨터실의 [선생님 메인 서버 점검]과 1-2교실 가장 구석에 놓인 [요션유의 알고리즘 USB]를 찾아와 주렴! 💻`,
    completeStory: `어머나, 정말 훌륭하구나! 완벽하게 처리해 주었어! 👏

컴퓨터실 메인 서버도 이상 없이 잘 가동 중이고, 중요한 코딩 강의 자료가 담긴 알고리즘 USB도 무사히 되찾았단다!

약속했던 보상으로 [보스의 가죽 1장]과 200 경험치를 선물로 줄게! 너의 뛰어난 디지털 정보 감각과 논리적 사고력을 응원한다!`,
    doneStory: `너 덕분에 이번 숭실 정보 알고리즘 실습이 완벽하게 진행될 수 있겠구나!

언제든 코딩이나 컴퓨터, 알고리즘에 대해 궁금한 점이 있다면 언제든 편하게 찾아오렴! 💻✨`,
    objectives: [
      {
        id: 'server',
        text: '1학년 3반 컴퓨터실에서 [선생님 메인 서버] 1회 점검하기',
        targetCount: 1,
        unit: '회',
        getCount: (quest) => (quest && quest.serverInspected ? 1 : 0)
      },
      {
        id: 'usb',
        text: '1학년 2반(1-2교실) 가장 구석에서 [요션유의 알고리즘 USB] 회수하기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.usbCollected ? 1 : 0)
      }
    ],
    rewards: [
      { type: 'item', itemKey: 'item_boss_leather', itemName: '보스의 가죽', count: 1, icon: '🥋', meta: { type: 'material', effect: '가죽 골렘 전리품 및 2티어 가죽 장비 필수 재료' }, label: '🥋 보스의 가죽 x1장' },
      { type: 'exp', amount: 200, label: '🌟 200 EXP (경험치)' }
    ]
  },
  quest_kwimjinsyong_career: {
    id: 'quest_kwimjinsyong_career',
    minLevel: 7,
    teacherId: 'npc_teacher_kwimjinsyong',
    teacherName: '귐즨숑 선생님',
    teacherRole: '진로',
    teacherSeat: '교무실',
    returnLocation: '6층 교무실',
    progressHint: '5층 진로상담실 안내서를 챙겨 6층 복도 동쪽 창가의 고민 학생에게 전달하세요.',
    teacherAvatar: '🌟',
    category: '🌟 숭실 진로·적성 멘토링 프로젝트 (Career Quest)',
    title: '[진로] 귐즨숑 선생님의 진로 격려: 빛나는 재능의 씨앗',
    cleanupItem: 'item_career_guidebook',
    story: `안녕! 숭실의 미래를 밝혀줄 친구구나. 여기까지 찾아와 주어 고맙단다.

최근 6층 복도 창가에서 한 학생이 자신이 무엇을 잘하는지 몰라 깊은 한숨을 쉬며 낙담해 있더구나.

모든 사람은 저마다 빛나는 재능의 씨앗을 품고 있는데 스스로를 믿지 못하는 모습이 참 안타까웠어.

내가 정성껏 쓴 [귐즨숑의 진로 격려 편지]와 함께, 5층 진로상담실 책상에 놓인 [진로 적성 검사 안내서]를 챙겨서 전해주겠니?`,
    inProgressStory: `어서 오렴! 5층 진로상담실 책상 위의 [진로 적성 검사 안내서]를 챙겨서 6층 복도 동쪽 창가의 [진로를 고민하는 학생]에게 나의 격려 편지와 함께 전해주렴! 🌟`,
    completeStory: `친구의 표정이 한결 밝아졌다고 하니 정말 다행이구나. 타인의 꿈을 응원해주는 너의 따뜻한 마음씨야말로 가장 훌륭한 재능이란다!

약속했던 경험치와 앞으로의 여정에 큰 힘이 되어줄 용기 포션을 선물로 줄게! 너의 빛나는 앞날을 언제나 축복한단다!`,
    doneStory: `그 친구가 진로상담실을 찾아와서 함께 즐겁게 상담을 나누었단다. 너의 따뜻한 관심이 한 친구의 미래를 활짝 열어주었어!

언제든 꿈과 진로가 고민된다면 언제든 편하게 찾아오렴! 🌟✨`,
    objectives: [
      {
        id: 'guidebook',
        text: '5층 진로상담실에 들러 책상 위의 [진로 적성 검사 안내서] 1부 회수',
        targetCount: 1,
        unit: '부',
        getCount: (quest) => (quest && quest.guidebookCollected ? 1 : 0)
      },
      {
        id: 'deliver',
        text: '6층 복도 동쪽 창가에 서 있는 [진로를 고민하는 학생]에게 편지와 안내서 전달',
        targetCount: 1,
        unit: '명',
        getCount: (quest) => (quest && quest.studentComforted ? 1 : 0)
      }
    ],
    rewards: [
      { type: 'exp', amount: 150, label: '🌟 150 EXP (경험치)' },
      { type: 'item', itemKey: 'item_courage_potion', itemName: '용기 포션', count: 2, icon: '🧪', meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '1분간 공격력(ATK) +5 증가' }, label: '🧪 용기 포션 x2 (새로운 길을 나아갈 용기! 1분간 공격력 +5)' }
    ]
  },
  'quest_library_missing_books': {
    id: 'quest_library_missing_books',
    minLevel: 8,
    teacherId: 'npc_librarian',
    teacherName: '사서 선생님',
    teacherRole: '2층 도서관',
    teacherSeat: '도서관 안내석',
    returnLocation: '2층 도서관',
    progressHint: '운동장 스탠드·6층 교무실·숭실역사관에서 분실도서 3권을 회수하세요.',
    teacherAvatar: '👩‍🏫',
    category: '📚 도서관 특별 의뢰 (Library Quest)',
    title: '[도서관] 사서 선생님의 긴급 의뢰: 흩어진 3권의 도서 회수',
    story: `안녕, 학생! 2층 도서관에 온 것을 환영한단다. 📚

하지만 지금 정말 큰일이란다... 며칠 전 대출되었던 소중한 학교 도서 3권이 제때 반납되지 않고 학교 곳곳에 흩어져 버렸어!

1. 📘 [세계문학 전집]: 운동장 관람석 스탠드 벤치에 누군가 두고 갔다는 제보가 있어.
2. 📗 [최신 과학 잡지]: 6층 교무실 연구석 책상 위에 놓여 있단다.
3. 📕 [숭실 역사 고문서 도록]: 1897 숭실역사관 안쪽 전시실에 놓여 있어.

학교 곳곳을 탐험하며 이 3권의 도서를 모두 찾아 도서관으로 회수해 줄 수 있겠니?
모두 회수해 오면 풍성한 경험치와 골드를 보상으로 줄게!`,
    inProgressStory: `어서 오렴! 아직 분실된 도서 3권을 모두 찾지 못했더구나!

1. 📘 운동장 관람석 스탠드 (소설책)
2. 📗 6층 교무실 연구석 (과학 잡지)
3. 📕 숭실역사관 전시실 (역사 고문서 도록)

모두 찾아오면 풍성한 보상을 지급하마!`,
    completeStory: `어머나, 3권의 도서를 모두 안전하게 찾아왔구나! 정말 고마워! 👏✨

덕분에 숭실 도서관의 소중한 지식들이 모두 제자리를 찾게 되었단다.
약속했던 골드와 경험치 보상을 수여하마! 앞으로도 도서관을 자주 찾아주렴!`,
    doneStory: `안녕! 자네 덕분에 도서관 서가가 다시 풍성해졌단다.
오늘의 지혜 명언 독서대에서 책도 읽고, 스마트 디벗도 편하게 이용하렴! 👍`,
    objectives: [
      {
        id: 'book_pg',
        text: '운동장 관람석 스탠드에서 [소설책] 회수하기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.bookPgCollected ? 1 : 0)
      },
      {
        id: 'book_of',
        text: '6층 교무실 연구석에서 [과학 잡지] 회수하기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.bookOfCollected ? 1 : 0)
      },
      {
        id: 'book_hi',
        text: '숭실역사관 전시실에서 [고문서 도록] 회수하기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.bookHiCollected ? 1 : 0)
      }
    ],
    rewards: [
      { type: 'gold', amount: 100, label: '🪙 100 G (골드)' },
      { type: 'exp', amount: 150, label: '🌟 150 EXP (경험치)' }
    ]
  },
  'quest_cafeteria_order': {
    id: 'quest_cafeteria_order',
    minLevel: 10,
    teacherId: 'npc_cafeteria_teacher',
    teacherName: '급식지도 선생님',
    teacherRole: '영양 및 급식지도',
    teacherSeat: '급식지도석',
    returnLocation: '학생 급식실',
    progressHint: '배부대 앞 [반찬 더 달라는 학생]과 1:1 퀴즈 대결을 진행하세요.',
    teacherAvatar: '👨‍🏫',
    category: '🍱 급식실 질서 퀘스트 (1단계)',
    title: '[급식실] 반찬 더 달라고 조르는 학생 진정시키기',
    story: `반가워요, 학생! 마침 도움이 절실하던 참이었어요. 🍱

배식대 쪽을 좀 보세요. 정량 배식이 급식실 규칙인데, 몇몇 학생들이 맛있는 소시지와 고기반찬만 잔뜩 더 달라고 떼를 쓰며 배식 줄을 멈춰 세우고 있어요!

배식대 앞에 서 있는 [🍖 반찬 더 달라는 학생]에게 가서, 1:1 영어 퀴즈 대결로 정량 배식과 양보의 미덕을 일깨워주고 진정시켜 줄 수 있나요?`,
    inProgressStory: `아직 [🍖 반찬 더 달라는 학생]이 배식대 앞에서 떼를 쓰고 있어요!
배부대 앞으로 가서 1:1 영어 퀴즈 대결을 펼쳐 학생을 진정시켜 주세요!`,
    completeStory: `오! 학생 덕분에 배식대 앞이 다시 질서정연해졌어요! 👏
규칙을 지키며 사이좋게 식판을 들고 가는 모습을 보니 정말 안심이네요.
수고비로 골드와 경험치를 지급할게요!`,
    doneStory: `배식대 앞이 아주 평화로워졌어요. 규칙을 지켜준 학생이 자랑스럽네요! 👍`,
    objectives: [
      {
        id: 'calm_demanding',
        text: '급식배부대의 [반찬 더 달라는 학생] 1:1 퀴즈로 진정시키기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.targetCalmed ? 1 : 0)
      }
    ],
    rewards: [
      { type: 'gold', amount: 150, label: '🪙 150 G (골드)' },
      { type: 'exp', amount: 200, label: '🌟 200 EXP (경험치)' }
    ]
  },
  'quest_cafeteria_manners': {
    id: 'quest_cafeteria_manners',
    minLevel: 10,
    teacherId: 'npc_cafeteria_teacher',
    teacherName: '급식지도 선생님',
    teacherRole: '영양 및 급식지도',
    teacherSeat: '급식지도석',
    returnLocation: '학생 급식실',
    progressHint: '우측 식탁 좌석 [식탁에서 떠드는 학생]을 1:1 퀴즈로 진정시키세요.',
    teacherAvatar: '👨‍🏫',
    category: '🍽️ 급식실 예절 퀘스트 (2단계)',
    title: '[급식실] 식탁에서 떠들며 먹는 학생들 진정시키기',
    story: `배식대는 정돈되었는데 이번엔 학생 식당 좌석 쪽이 문제예요!

밥을 입에 물고 큰 소리로 떠들며 장난치는 학생들이 있어요. 음식물이 튀거나 기도로 넘어가면 큰 사고로 이어질 수 있거든요.

우측 구석 식탁 좌석에 있는 [🗣️ 식탁에서 떠드는 학생]에게 가서, 1:1 영어 퀴즈 대결로 올바른 식사 예절을 일깨워주고 진정시켜 주세요!`,
    inProgressStory: `우측 구석 식탁 좌석에서 [🗣️ 식탁에서 떠드는 학생]이 아직도 시끄럽게 장난치고 있어요!
어서 가서 1:1 영어 퀴즈 대결로 조용히 식사하도록 지도해 주세요!`,
    completeStory: `와! 정말 대단해요, 학생! 🎉

학생들이 자리에 조용히 앉아 친구들과 배려하며 맛있게 식사하고 있어요!
우리 숭실 급식실의 평화와 질서를 되찾아 준 훌륭한 학생에게, 영양교사가 특별히 준비한 최고급 5티어 제작 재료와 보상을 선물할게요!`,
    doneStory: `학생 덕분에 우리 숭실 급식실이 전교에서 가장 질서 있고 모범적인 식당이 되었답니다! 👍`,
    objectives: [
      {
        id: 'calm_noisy',
        text: '학생 식탁 좌석의 [식탁에서 떠드는 학생] 1:1 퀴즈로 진정시키기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.targetCalmed ? 1 : 0)
      }
    ],
    rewards: [
      { type: 'gold', amount: 100, label: '🪙 100 G (골드)' },
      { type: 'exp', amount: 200, label: '🌟 200 EXP (경험치)' },
      { type: 'item', itemKey: 'item_nutrition_essence', itemName: '정제된 영양의 정수', count: 2, icon: '🍱', label: '🍱 정제된 영양의 정수 x2' },
      { type: 'item', itemKey: 'item_stainless_shard', itemName: '특수 강화 스텐 조각', count: 1, icon: '✨', label: '✨ 특수 강화 스텐 조각 x1' }
    ]
  },
  'quest_health_emergency': {
    id: 'quest_health_emergency',
    minLevel: 11,
    teacherId: 'npc_nurse',
    teacherName: '보건 선생님',
    teacherRole: '3층 보건실',
    teacherSeat: '보건실 진료석',
    returnLocation: '3층 보건실',
    progressHint: '보건실 캐비닛·2층 도서관 자연과학 서가·향긋한 허브 5개를 모으세요.',
    teacherAvatar: '🩺',
    category: '🩺 장편 모험 제1막 (Lv.11)',
    title: '[장편 1막] 보건실 긴급 처방: 사라진 활력의 비약',
    story: `어서 오렴, Lv.11 이상의 든든한 숭실 탐험가여! 🩺✨

사실 최근 수행평가와 시험 시즌이 겹치며 교내 학생들 사이에 원인 모를 '무기력 졸음 바이러스' 징후가 번지고 있단다.
임시 처방이 아니라 몸과 마음의 활력을 되살릴 특제 비약을 만들어야 하는데, 3가지 핵심 준비물이 학교 곳곳에 흩어져 있어!

1. 💊 보건실 [응급 구급약 & 약초 캐비닛]에서 오래된 약초 처방 암호 해독하기
2. 🔬 2층 도서관 [자연과학·연금 서가]에서 '고대 활력 비약 조제법' 찾아내기
3. 🌿 가방에 [향긋한 허브] 5개 모아오기 (1학년 1반 채집 가능)

준비되면 바로 수락하고 학교를 탐험해 다오! (이 모험은 맞은편 Wee클래스로 이어지는 대장정의 시작이란다!)`,
    inProgressStory: `아직 활력의 비약 재료와 단서가 다 모이지 않았구나!

1. 💊 보건실 [응급 구급약 & 약초 캐비닛] 조사 & 처방전 해독
2. 🔬 2층 도서관 [자연과학·연금 서가] 조사 & 조제법 해독
3. 🌿 [향긋한 허브] 5개 이상 소지

모두 준비되면 나에게 다시 보고하렴! 🩺`,
    completeStory: `대단하구나! 오래된 처방전과 도서관의 비전 조제법, 신선한 허브까지 모두 완벽하게 모았어! 👏✨

덕분에 신체 활력 비약의 기본 토대가 완성되었단다!
하지만... 진짜 원인은 단순한 피로가 아니라 시험 압박에 지친 학생들의 '마음' 속에 있는 것 같아.

복도 맞은편 🕊️ [3층 Wee클래스 전문상담 선생님]께 가서 이 진단서를 전하고 [장편 2막] 모험을 이어가 주렴!`,
    doneStory: `네가 찾아낸 조제법 덕분에 학생들의 건강 수치가 쑥쑥 올라가고 있단다! 🩺
언제든 체력이 떨어지면 보건실 회복 침대에서 100% 쉬어가렴!`,
    objectives: [
      {
        id: 'cabinet_check',
        text: '3층 보건실 [응급 구급약 & 약초 캐비닛] 조사 & 처방 해독',
        targetCount: 1,
        getCount: (quest) => (quest && quest.cabinetChecked ? 1 : 0)
      },
      {
        id: 'lib_recipe',
        text: '2층 도서관 [자연과학·연금 서가]에서 고대 조제법 찾기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.libRecipeFound ? 1 : 0)
      },
      {
        id: 'collect_herbs',
        text: '가방에 [🌿 향긋한 허브] 5개 이상 모으기 (1-1반 채집)',
        targetCount: 5,
        unit: '개',
        getCount: (quest) => {
          const invCount = (window.MainApp && typeof window.MainApp.getItemCount === 'function')
            ? window.MainApp.getItemCount('item_herb')
            : 0;
          return Math.min(5, Math.max(invCount, (quest && quest.herbCount) || 0));
        }
      }
    ],
    rewards: [
      { type: 'item', itemKey: 'item_orange_potion', itemName: '주홍 물약', count: 2, icon: '🧪', meta: { type: 'consumable', slot: 'consumable', heal: 25, effect: '체력 +25 회복' }, label: '🧪 주홍 물약 x2개' }
    ]
  },
  'quest_wee_heart_signal': {
    id: 'quest_wee_heart_signal',
    minLevel: 12,
    requiresDone: 'quest_health_emergency',
    teacherId: 'npc_counselor_wee',
    teacherName: 'Wee클래스 전문상담 선생님',
    teacherRole: '3층 Wee클래스',
    teacherSeat: '상담실',
    returnLocation: '3층 Wee클래스',
    progressHint: 'Wee클래스 우체통·체육관 창고·체육관 방송실 콘솔을 차례로 확인하세요.',
    teacherAvatar: '🕊️',
    category: '🕊️ 장편 모험 제2막 (Lv.12)',
    title: '[장편 2막] Wee클래스의 비밀 쪽지와 체육관의 신호',
    story: `보건 선생님 소개로 왔구나! 정말 반갑단다. 🕊️💖

보건실에서 물리적 피로를 막아주었지만, 오늘 아침 Wee클래스 익명 우체통에서 마음이 꺾여버린 친구의 찢어진 비밀 편지 조각을 발견했어.
편지에는 "체육관 창고 구석에 포기한 꿈을 두고 왔다... 방송실 소리마저 끊겼네"라는 슬픈 단서가 적혀 있더구나!

함께 체육관 안쪽으로 모험을 떠나 친구들의 용기를 되살릴 단서를 찾아줄 수 있겠니?

1. 📬 3층 Wee클래스 [우체통]을 열어 비밀 편지 단서 확인하기
2. 📦 야외 체육관 [창고]을 조사해 잃어버린 꿈의 메모 찾기
3. 🎛️ 야외 체육관 [체육관 방송실] 콘솔을 수리해 희망 주파수 복구하기`,
    inProgressStory: `아직 체육관과 상담실의 마음 단서가 모두 모이지 않았어! 🕊️

1. 📬 3층 Wee클래스 [익명 응원 우체통] 단서 읽기
2. 📦 체육관 [창고] 조사 & 용기 암호 풀기
3. 🎛️ 체육관 [체육관 방송실] 콘솔 주파수 복구하기

세 곳의 탐험을 모두 마치면 나에게 돌아와 보고해 주렴!`,
    completeStory: `해냈구나! 체육관 창고 깊숙한 곳의 잃어버린 꿈과, 방송실의 희망 주파수까지 모두 복구했어! 🎉🕊️

이제 마지막 피날레 단계만 남았단다.
보건 선생님의 신체 활력 비약과 우리 Wee클래스의 희망 스피치를 전교생에게 울려 퍼지게 할 [장편 완결 3막] 준비가 되었니?`,
    doneStory: `자네가 되살려 놓은 체육관 방송실의 주파수에서 지금도 잔잔한 희망의 음률이 흐르고 있단다! 🎛️✨`,
    objectives: [
      {
        id: 'wee_mailbox',
        text: '3층 Wee클래스 [📬 우체통]에서 찢어진 비밀 편지 확인',
        targetCount: 1,
        getCount: (quest) => (quest && quest.mailboxChecked ? 1 : 0)
      },
      {
        id: 'gym_storage',
        text: '체육관 내부 [📦 창고]에서 잃어버린 꿈의 메모 해독',
        targetCount: 1,
        getCount: (quest) => (quest && quest.storageClueFound ? 1 : 0)
      },
      {
        id: 'gym_broadcast',
        text: '체육관 내부 [🎛️ 체육관 방송실] 콘솔 주파수 수리하기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.broadcastFixed ? 1 : 0)
      }
    ],
    rewards: [
      { type: 'exp', amount: 350, label: '🌟 350 EXP (경험치)' },
      { type: 'item', itemKey: 'item_courage_potion', itemName: '용기의 물약', count: 1, icon: '🧪', meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '1분간 공격력(ATK) +5 증가' }, label: '🧪 용기의 물약 x1' },
      { type: 'item', itemKey: 'item_protection_potion', itemName: '수호의 물약', count: 1, icon: '🧪', meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '1분간 방어력(DEF) +3 증가' }, label: '🧪 수호의 물약 x1' }
    ]
  },
  'quest_wee_hope_broadcast': {
    id: 'quest_wee_hope_broadcast',
    minLevel: 12,
    requiresDone: 'quest_wee_heart_signal',
    teacherId: 'npc_counselor_wee',
    teacherName: 'Wee클래스 전문상담 선생님',
    teacherRole: '3층 Wee클래스 · 연합 완결',
    teacherSeat: '상담실',
    returnLocation: '3층 Wee클래스',
    progressHint: '3층 보건 선생님 인증 → 체육관 강연 무대 스피치 → Wee클래스 허브차 다과 순으로 진행하세요.',
    teacherAvatar: '💖',
    category: '💖 장편 모험 완결 3막 (Lv.12)',
    title: '[장편 완결 3막] 희망의 종소리: 몸과 마음의 공명',
    story: `드디어 장편 모험의 대단원, 제3막 피날레(Lv.12 이상)란다! 💖🌟

보건 선생님의 활력 비약과 우리가 복구한 체육관 방송 시스템을 하나로 연결해, 학교 전체에 희망의 종소리를 울려 퍼지게 할 시간이야!

1. 🩺 3층 보건실 [보건 선생님]께 1·2막 결과를 보고하고 [합동 치유 비약 결정] 인증받기
2. 🎤 체육관 [강연 무대] 단상에 올라 전교생에게 희망의 영어 스피치 선포하기
3. 🫖 3층 Wee클래스 [따뜻한 캐모마일 허브차 테이블]에서 평온의 다과 의식 마치기

모두 마치고 돌아오면 5티어 최고급 장비 제작에 쓰이는 [✨ 특수 강화 스텐 조각 x2]와 [🍱 정제된 영양의 정수 x4], 그리고 경험치·골드 보상을 수여하마!`,
    inProgressStory: `희망의 종소리 대작전이 한창 진행 중이란다! 💖

1. 🩺 3층 보건실 [보건 선생님]과 대화해 합동 치유 인증받기
2. 🎤 체육관 [강연 무대]에서 희망의 영어 스피치 성공하기
3. 🫖 Wee클래스 [캐모마일 허브차 테이블]에서 다과 의식 마무리하기

마지막 관문을 모두 완수해 보렴!`,
    completeStory: `와... 정말 경이롭구나!! 🎉💖🌟

체육관 강연 무대에서 울려 퍼진 너의 희망 스피치가 숭실중학교 온 교정과 학생들의 마음에 따뜻하게 스며들었단다!
몸의 건강(보건실)과 마음의 평온(Wee클래스)이 완벽하게 공명하는 순간이야!

약속대로 5티어 제작 핵심 재료 [✨ 특수 강화 스텐 조각 x2], [🍱 정제된 영양의 정수 x4], 그리고 골드·경험치를 선물하마!`,
    doneStory: `너 덕분에 숭실중학교 온 교정에 따뜻한 희망의 울림이 이어지고 있단다!
언제든 지치거나 따뜻한 차가 생각날 때면 보건실과 Wee클래스에 편히 놀러 오렴! 💖`,
    objectives: [
      {
        id: 'nurse_coop',
        text: '3층 보건실 [🩺 보건 선생님]에게 합동 치유 인증받기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.nurseCoopConfirmed ? 1 : 0)
      },
      {
        id: 'gym_stage',
        text: '체육관 [🎤 강연 무대]에서 희망의 영어 스피치 선포하기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.stageSpeechDone ? 1 : 0)
      },
      {
        id: 'wee_tea',
        text: '3층 Wee클래스 [🫖 허브차 테이블]에서 마음 마무리 다과 갖기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.teaCeremonyDone ? 1 : 0)
      }
    ],
    rewards: [
      { type: 'exp', amount: 300, label: '🌟 300 EXP (경험치)' },
      { type: 'gold', amount: 200, label: '🪙 200 G (골드)' },
      { type: 'item', itemKey: 'item_stainless_shard', itemName: '특수 강화 스텐 조각', count: 2, icon: '✨', meta: { type: 'material', effect: '5티어 불멸의 열정 장비 제작 핵심 재료' }, label: '✨ 특수 강화 스텐 조각 x2 (5티어 재료)' },
      { type: 'item', itemKey: 'item_nutrition_essence', itemName: '정제된 영양의 정수', count: 4, icon: '🍱', meta: { type: 'material', effect: '5티어 최고급 장비 제작 필수 재료' }, label: '🍱 정제된 영양의 정수 x4 (5티어 재료)' }
    ]
  },
  'quest_pe_errand': {
    id: 'quest_pe_errand',
    teacherId: 'npc_teacher_pe_grade2',
    teacherName: '리졍놤(2학년 체육)',
    teacherRole: '2학년 체육',
    teacherAvatar: '👨‍🏫',
    teacherSeat: '체육관 무대',
    returnLocation: '체육관 실내 무대',
    progressHint: '6층 교무실 20번 자리에서 🔑 [2학년 체육관 열쇠]를 찾아 체육관 무대로 전해드리세요.',
    minLevel: 12,
    cleanupItem: 'item_gym_key',
    title: '🔑 체육선생님의 심부름 (Gym Key Delivery)',
    story: '교무실 20번 자리(2학년 체육선생님 자리)에 선생님이 깜빡하고 두고 가신 체육관 열쇠를 발견했다!\n이 열쇠로 체육관 문을 열고 들어가, 체육관 안쪽 강연 무대 위에 계신 리졍놤(2학년 체육) 선생님께 직접 열쇠를 전해드리자!',
    inProgressStory: '아직 [🔑 2학년 체육관 열쇠]를 찾지 못했더구나! 6층 교무실 20번 자리에서 열쇠를 챙겨 체육관 안쪽 강연 무대로 가져오렴!',
    completeStory: '오오! 교무실 20번 자리에 두고 온 열쇠를 챙겨와 주었구나! 정말 고맙다!\n약속한 심부름 보상으로 [🪙 100 G]와 [🧪 초소형 경험치 물약 3개]를 주마!',
    doneStory: '네가 열쇠를 전해준 덕분에 체육관 문을 열 수 있었단다. 고맙다!',
    objectives: [
      {
        id: 'pe_key_collect',
        text: '교무실 20번 자리에서 🔑 [2학년 체육관 열쇠] 챙기기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.keyCollected ? 1 : 0)
      }
    ],
    rewards: [
      { type: 'gold', amount: 100, label: '🪙 100 G (골드)' },
      { type: 'item', itemKey: 'item_tiny_exp_potion', itemName: '초소형 경험치 물약', count: 3, icon: '🧪', meta: { type: 'consumable', slot: 'consumable', expGain: 50, effect: '사용 시 경험치(EXP) +50 상승' }, label: '🧪 초소형 경험치 물약 x3 (개당 EXP +50)' }
    ]
  },
  'quest_pe_court_clear': {
    id: 'quest_pe_court_clear',
    teacherId: 'npc_teacher_pe_grade2',
    teacherName: '리졍놤(2학년 체육)',
    teacherRole: '2학년 체육',
    teacherAvatar: '👨‍🏫',
    teacherSeat: '체육관 무대',
    returnLocation: '체육관 실내 무대',
    progressHint: '체육관 실내 농구장에서 8단원 배틀로 몬스터 3마리를 토벌하세요.',
    minLevel: 13,
    requiresDone: 'quest_pe_errand',
    title: '🏀 실내 농구장을 점거한 폭주 농구 몬스터 토벌 & 8단원 테스트',
    story: '덕분에 체육관 문을 열고 무사히 들어왔는데 큰일이란다!\n실내 농구 코트를 폭주 농구 몬스터들이 점거해버려서 2학년 체육 수업을 시작할 수가 없구나.\n\n실내 농구장에서 8단원 영어 퀴즈 배틀로 폭주 농구 몬스터 3마리를 토벌하고 실력을 증명해 주렴!',
    inProgressStory: '실내 농구 코트를 배회하는 폭주 농구 몬스터(불멸의 덩크 머신, 백보드 분쇄기, 심판 골렘, 실내 코트 제왕) 중 3마리를 8단원 퀴즈 대결로 토벌하고 돌아오렴!',
    completeStory: '오오! 그 강력한 실내 농구장 몬스터들을 8단원 실력으로 단숨에 제압하다니 정말 놀랍구나!\n덕분에 코트 질서가 완전히 회복되었단다. 약속한 특급 보상으로 [🧪 초소형 경험치 물약 30개]와 [🌟 300 EXP]를 수여하마!',
    doneStory: '덕분에 실내 농구 코트 질서가 완벽히 회복되었단다. 언제든 8단원 실력을 갈고닦아 보렴! 🏀',
    objectives: [
      {
        id: 'gym_mob_hunt',
        text: '체육관 실내 농구장 몬스터 3마리 토벌 & 8단원 테스트 통과',
        targetCount: 3,
        getCount: (quest) => Math.min(3, Number(quest && quest.gymKillCount) || 0)
      }
    ],
    rewards: [
      { type: 'exp', amount: 300, label: '🌟 300 EXP (경험치)' },
      { type: 'item', itemKey: 'item_tiny_exp_potion', itemName: '초소형 경험치 물약', count: 30, icon: '🧪', meta: { type: 'consumable', slot: 'consumable', expGain: 50, effect: '사용 시 경험치(EXP) +50 상승' }, label: '🧪 초소형 경험치 물약 x30 (개당 EXP +50)' }
    ]
  },
  'quest_jawsdong_cleanup': {
    id: 'quest_jawsdong_cleanup',
    teacherId: 'npc_teacher_pe_grade3',
    teacherName: '죠스동(3학년 체육)',
    teacherRole: '3학년 체육',
    teacherAvatar: '👨‍🏫',
    teacherSeat: '체육관 창고',
    returnLocation: '체육관 창고',
    progressHint: '버스 옆 농구공·관람석 팀 조끼 회수 후 창고 선반 8단원 퀴즈를 완료하세요.',
    minLevel: 14,
    title: '🏀 흩어진 체육 용구 회수 & 창고 재정비',
    story: '폭주 농구 몬스터들이 날뛰는 바람에 수업용 공과 팀 조끼, 라바콘이 체육관 안팎에 엉망으로 흩어졌단다!\n\n1. 체육관 야외 광장(축구부 버스 오른쪽)에 굴러간 🏀 [분실된 수업용 농구공] 주워오기\n2. 체육관 실내 코트 관람석(상단 스탠드 앞)에 흩어진 🦺 [땀에 젖은 팀 조끼 다발] 회수하기\n3. 공·체육복 창고 내부 [📦 창고 선반]과 상호작용해 8단원 퀴즈 1문제를 풀고 깔끔하게 분류·정돈하기\n\n모두 마치고 돌아오면 특급 경험치 물약과 월계수 잎, 골드·경험치를 선물하마!',
    inProgressStory: '아직 정돈이 끝나지 않았구나! 🏀🏐\n\n1. 야외 체육관 광장 축구부 버스 오른쪽에 굴러간 🏀 [분실된 수업용 농구공] 회수\n2. 실내 농구 코트 상단 관람석 앞 🦺 [땀에 젖은 팀 조끼 다발] 회수\n3. 이 창고 안쪽의 [📦 창고 선반]을 조사해 8단원 문제를 풀고 용구 분류·정돈하기\n\n세 가지를 모두 마친 뒤 나에게 보고해 주렴!',
    completeStory: '오오! 야외 광장 축구부 버스 옆까지 굴러간 농구공과 관람석의 팀 조끼까지 모두 찾아와 창고 선반에 완벽히 정돈했구나! 👏\n덕분에 3학년 체육 수업을 바로 시작할 수 있겠어. 고맙다! 약속한 정돈 보상을 수여하마!',
    doneStory: '체육관 용구 정돈 덕분에 3학년 체육 수업 준비가 완벽해졌다! 훌륭해! 👏',
    objectives: [
      {
        id: 'jawsdong_ball',
        text: '체육관 야외 광장(축구부 버스 오른쪽) 🏀 [분실된 수업용 농구공] 주워오기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.ballRecovered ? 1 : 0)
      },
      {
        id: 'jawsdong_vests',
        text: '체육관 실내 관람석 앞 🦺 [땀에 젖은 팀 조끼 다발] 회수하기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.vestsRecovered ? 1 : 0)
      },
      {
        id: 'jawsdong_sort',
        text: '공·체육복 창고 [📦 창고 선반]에서 8단원 퀴즈 풀고 분류·정돈하기',
        targetCount: 1,
        getCount: (quest) => (quest && quest.storageSorted ? 1 : 0)
      }
    ],
    rewards: [
      { type: 'exp', amount: 350, label: '🌟 350 EXP (경험치)' },
      { type: 'gold', amount: 200, label: '🪙 200 G (골드)' },
      { type: 'item', itemKey: 'item_tiny_exp_potion', itemName: '초소형 경험치 물약', count: 20, icon: '🧪', meta: { type: 'consumable', slot: 'consumable', expGain: 50, effect: '사용 시 경험치(EXP) +50 상승' }, label: '🧪 초소형 경험치 물약 x20 (개당 EXP +50)' },
      { type: 'item', itemKey: 'item_golden_laurel', itemName: '황금 월계수 잎', count: 1, icon: '🏵️', meta: { type: 'material', effect: 'Lv.15 승리의 월계관 메달 제작 핵심 재료' }, label: '🏵️ 황금 월계수 잎 x1 (Lv.15 장신구 재료)' }
    ]
  }
};
