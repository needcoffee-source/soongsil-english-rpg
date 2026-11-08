/**
 * Soongsil World Map & Floor Data — Season 1
 * - 1학년 복도 (hallway): 제작
 * - 1학년 1반 (room_701): 채집 (목재=1단원, 허브=2단원, 개나리=3단원, 교목=4단원)
 * - 1학년 2반 (room_702): 보스 레이드
 */

const WORLD_DATA = {
  TILE_SIZE: 32,
  MAP_WIDTH: 30,
  HALLWAY_WIDTH: 60,
  CAREER_WIDTH: 60,
  CAREER_HEIGHT: 20,
  SECRET_HISTORY_WIDTH: 16, // 역사관 절반 사이즈 비밀의 방 (16 x 20 타일)
  SECRET_HISTORY_HEIGHT: 20,
  LIBRARY_WIDTH: 20, // 2층 도서관 (독립 전용층, 7층 복도의 1/3인 20 x 20 타일)
  LIBRARY_HEIGHT: 20,
  HEALTH_WEE_WIDTH: 20, // 3층 보건실 & Wee클래스 독립공간 (도서관 규격과 동일한 20 x 20 타일)
  HEALTH_WEE_HEIGHT: 20,
  STAFF_OFFICE_WIDTH: 106, // 교실 3.5개 사이즈 대형 본관 교무실 (106 x 26 타일)
  STAFF_OFFICE_HEIGHT: 26, // 상단 부속실(소회의실·탕비실·인쇄실·교1~3·상담실) + 중앙 통로 + 하단 교4~25 6분단 수용
  PLAYGROUND_WIDTH: 90, // 복도 면적의 2배가 넘는 대형 숭실 야외 운동장 (90 x 54 타일)
  PLAYGROUND_HEIGHT: 54,
  GYM_PLAZA_WIDTH: 56, // 숭실 7층 체육관 & 주차장 광장 (56 x 36 타일)
  GYM_PLAZA_HEIGHT: 36, // 농구장 아래 동일 규격(26x20타일) 인조잔디 풋살장 수용 확장
  CAFETERIA_WIDTH: 42, // 학생 급식실 대형 식음 공간 (42 x 24 타일)
  CAFETERIA_HEIGHT: 24,
  MAP_HEIGHT: 20,

  floors: {
    // 2층: 숭실 도서관 (독립 전용층: 20 x 20 타일)
    2: {
      name: "2층 도서관 (독립 전용층)",
      rooms: [],
      elevator: { x: 16, y: 3 },
      interactive: [
        { id: "wisdom_book", type: "wisdom_book", x: 10, y: 8, name: "📖 오늘의 지혜 명언 독서대", prompt: "지혜의 명언 읽기 (SPACE)" },
        { id: "library_reading_desk", type: "library_reading_desk", x: 10, y: 11, name: "🪑 중앙 독서 열람석", prompt: "자리에 앉아 독서하기 (SPACE)" },
        { id: "library_pc", type: "library_pc", x: 8, y: 17, name: "🖥️ 도서 검색기", prompt: "도서 및 자료 검색하기 (SPACE)" },
        { id: "bookshelf_lit", type: "bookshelf_lit", x: 3, y: 4, name: "📚 [문학·철학 서가] 윤동주 시집 & 고전문학", prompt: "서가 둘러보기 (SPACE)" },
        { id: "bookshelf_sci", type: "bookshelf_sci", x: 8, y: 4, name: "🔬 [자연과학·연금 서가] 졍경슉 비전서 & 실험일지", prompt: "서가 둘러보기 (SPACE)" },
        { id: "bookshelf_eng", type: "bookshelf_eng", x: 2, y: 9, name: "🇬🇧 [외국어·어학 서가] Joshua 영단어 비법전서", prompt: "서가 둘러보기 (SPACE)" },
        { id: "bookshelf_his", type: "bookshelf_his", x: 5, y: 9, name: "📜 [역사·사회 서가] 1897 숭실 독립사 & 인문고전", prompt: "서가 둘러보기 (SPACE)" },
        { id: "bookshelf_art", type: "bookshelf_art", x: 3, y: 14, name: "🎨 [예술·체육 서가] 명화 도록 & 스포츠 교본", prompt: "서가 둘러보기 (SPACE)" },
        { id: "bookshelf_mag", type: "bookshelf_mag", x: 17, y: 10, name: "📰 [정기간행물 서가] 최신 과학 잡지 & 시사 교지", prompt: "잡지 읽기 (SPACE)" },
        { id: "bookshelf_comic", type: "bookshelf_comic", x: 17, y: 14, name: "💬 [교양만화 서가] 세계 역사 & 과학 그래픽노블", prompt: "만화책 넘겨보기 (SPACE)" },
        { id: "library_dibut", type: "library_dibut", x: 4, y: 17, name: "📱 도서관 스마트 디벗 단말기 (디지털 학습존)", prompt: "디벗 단말기 확인 (SPACE)" }
      ],
      npcs: [
        {
          id: "npc_librarian",
          name: "사서 선생님",
          role: "2층 도서관",
          x: 13,
          y: 4,
          avatar: "teacher",
          questId: "quest_library_missing_books",
          dialogue: "쉿! 도서관에선 정숙해야 한단다. 📚 학교 곳곳에 흩어진 분실도서 3권을 찾아주면 도서관 보상을 선물할게!"
        }
      ]
    },

    // 3층: 보건실 & Wee클래스 (가로형 복도, 독립 힐링 구역)
    3: {
      name: "3층 복도 (보건실 & Wee클래스)",
      rooms: [
        { id: "room_health", name: "🏥 보건실", doorX: 18, doorY: 5, targetX: 10, targetY: 15, locked: false },
        { id: "room_wee", name: "🕊️ Wee클래스", doorX: 36, doorY: 5, targetX: 10, targetY: 15, locked: false }
      ],
      elevator: { x: 56, y: 3 },
      interactive: [
        { id: "water_purifier_hallway_3", type: "water_purifier", x: 48, y: 6, name: "🚰 복도 정수기", prompt: "시원한 물 마시기 (체력 50% 회복)" }
      ],
      npcs: []
    },

    // 5층: 테스트 구역 (교실 제외한 순수 복도 공간)
    5: {
      name: "5층 복도 (진로 & 선배 구역)",
      rooms: [
        { id: "room_career", name: "🌟 진로상담실", doorX: 13, doorY: 5, targetX: 30, targetY: 13, locked: false },
        { id: "room_501", name: "2학년 1반", doorX: 25, doorY: 5, targetX: 15, targetY: 14, locked: true, lockMessage: "지금은 2학년 1반 자율학습 시간입니다. (현재 준비 중 🚧)" },
        { id: "room_502", name: "2학년 2반", doorX: 32, doorY: 5, targetX: 15, targetY: 14, locked: true, lockMessage: "지금은 2학년 2반 수업 시간입니다. (현재 준비 중 🚧)" },
        { id: "room_503", name: "2학년 3반", doorX: 39, doorY: 5, targetX: 15, targetY: 14, locked: true, lockMessage: "지금은 2학년 3반 수업 시간입니다. (현재 준비 중 🚧)" },
        { id: "room_505", name: "3학년 5반", doorX: 46, doorY: 5, targetX: 15, targetY: 14, locked: true, lockMessage: "3학년 5반 선배들의 심화 입시 수업 중입니다. (현재 준비 중 🚧)" },
        { id: "room_506", name: "3학년 6반", doorX: 51, doorY: 5, targetX: 15, targetY: 14, locked: true, lockMessage: "3학년 6반 선배들의 심화 입시 수업 중입니다. (현재 준비 중 🚧)" }
      ],
      elevator: { x: 56, y: 3 },
      interactive: [
        { id: "board_leaderboard_5", type: "leaderboard", x: 3, y: 6, name: "랭킹보드", prompt: "랭킹보드 확인" },
        { id: "mirror_hallway_5", type: "mirror", x: 56, y: 16, name: "🪞 복도 전신 거울", prompt: "외모 단정 체크 (SPACE)" },
        { id: "water_purifier_hallway_5", type: "water_purifier", x: 43, y: 17, name: "🚰 복도 정수기", prompt: "시원한 물 마시기 (체력 50% 회복)" },
        { id: "board_club_5", type: "club_board", x: 27, y: 17, name: "🎸 동아리 홍보 게시판", prompt: "동아리 공지 확인 (SPACE)" },
        { id: "plant_hallway_5_1", type: "plant_zone", subType: "monstera", x: 35, y: 17, name: "🪴 복도 식물존", prompt: "물 주기 (SPACE) 💧" },
        { id: "plant_hallway_5_2", type: "plant_zone", subType: "areca", x: 38, y: 17, name: "🪴 복도 식물존", prompt: "물 주기 (SPACE) 💧" }
      ],
      npcs: []
    },

    // 6층: 교무실 및 2학년 구역
    6: {
      name: "6층 복도 (교무실 & 2학년 구역)",
      rooms: [
        { id: "room_staff_office", doorId: "west", name: "🏛️ 교무실", plaqueName: "🏛️ 교무실 (앞문)", doorX: 9, doorY: 5, targetX: 6, targetY: 12, locked: false },
        { id: "room_staff_office", doorId: "east", name: "🏛️ 교무실", plaqueName: "🏛️ 교무실 (뒷문)", doorX: 20, doorY: 5, targetX: 99, targetY: 12, locked: false },
        { id: "room_204", name: "2학년 4반", doorX: 30, doorY: 5, targetX: 15, targetY: 14, locked: true, lockMessage: "지금은 2학년 4반 수업 시간입니다. (현재 준비 중 🚧)" },
        { id: "room_205", name: "2학년 5반", doorX: 38, doorY: 5, targetX: 15, targetY: 14, locked: true, lockMessage: "지금은 2학년 5반 수업 시간입니다. (현재 준비 중 🚧)" },
        { id: "room_206", name: "2학년 6반", doorX: 46, doorY: 5, targetX: 15, targetY: 14, locked: true, lockMessage: "지금은 2학년 6반 수업 시간입니다. (현재 준비 중 🚧)" }
      ],
      elevator: { x: 56, y: 3 },
      interactive: [
        { id: "board_leaderboard_6", type: "leaderboard", x: 3, y: 6, name: "랭킹보드", prompt: "랭킹보드 확인" },
        { id: "dibut_repair_box_6", type: "dibut_repair_box", x: 8, y: 16, name: "📱 디벗 수리함", noInteract: true },
        { id: "recycle_bin_6", type: "recycle_bin", x: 14, y: 16, name: "♻️ 분리수거함", prompt: "분리수거 퀴즈 풀기 (SPACE)" },
        { id: "mirror_hallway_6", type: "mirror", x: 56, y: 16, name: "🪞 복도 전신 거울", prompt: "외모 단정 체크 (SPACE)" },
        { id: "water_purifier_hallway_6", type: "water_purifier", x: 43, y: 17, name: "🚰 복도 정수기", prompt: "시원한 물 마시기 (체력 50% 회복)" }
      ],
      npcs: [
        {
          id: "npc_student_worried",
          name: "진로를 고민하는 학생",
          x: 58,
          y: 10,
          avatar: "student_m1",
          dialogue: "하아... 다들 자기가 하고 싶은 게 뚜렷한 것 같은데... 난 내가 뭘 잘하는지, 앞으로 뭐가 되고 싶은지 정말 모르겠어... 😔"
        }
      ]
    },

    7: {
      name: "7층 복도 (1학년 구역)",
      rooms: [
        { id: "room_701", name: "1학년 1반", doorX: 10, doorY: 5, targetX: 15, targetY: 14 },
        { id: "room_702", name: "1학년 2반", doorX: 20, doorY: 5, targetX: 15, targetY: 14 },
        { id: "room_703", name: "1학년 3반", doorX: 30, doorY: 5, targetX: 15, targetY: 14 },
        { id: "room_704", name: "1학년 4반", doorX: 37, doorY: 5, targetX: 15, targetY: 14, locked: false },
        { id: "room_705", name: "1학년 5반", doorX: 43, doorY: 5, targetX: 15, targetY: 14, locked: false },
        { id: "room_706", name: "1학년 6반", doorX: 49, doorY: 5, targetX: 15, targetY: 14, locked: true, lockMessage: "지금은 스포츠(체육) 시간입니다. 타반 학생은 출입금지입니다! ⚽" }
      ],
      elevator: { x: 56, y: 3 },
      interactive: [
        { id: "board_leaderboard", type: "leaderboard", x: 3, y: 6, name: "랭킹보드", prompt: "랭킹보드 확인" },
        { id: "mirror_hallway", type: "mirror", x: 56, y: 16, name: "🪞 복도 전신 거울", prompt: "외모 단정 체크 (SPACE)" },
        { id: "craft_equip_7", type: "craft", category: "equipment", x: 9, y: 14, name: "장비 제작대", prompt: "장비 제작하기" },
        { id: "craft_potion_7", type: "craft", category: "potion", x: 21, y: 14, name: "소비품 제작대", prompt: "소비품(포션·주문서) 제작하기" },
        { id: "craft_accessory_7", type: "craft", category: "accessory", x: 35, y: 14, name: "장신구 세공대", prompt: "장신구 세공하기" },
        { id: "board_club", type: "club_board", x: 27, y: 17, name: "🎸 동아리 홍보 게시판", prompt: "동아리 공지 확인 (SPACE)" },
        { id: "plant_hallway_1", type: "plant_zone", subType: "monstera", x: 33, y: 17, name: "🪴 복도 식물존", prompt: "물 주기 (SPACE) 💧" },
        { id: "plant_hallway_2", type: "plant_zone", subType: "areca", x: 38, y: 17, name: "🪴 복도 식물존", prompt: "물 주기 (SPACE) 💧" },
        { id: "water_purifier_hallway", type: "water_purifier", x: 43, y: 17, name: "🚰 복도 정수기", prompt: "시원한 물 마시기 (체력 50% 회복)" },
        { id: "note_developer_hallway", type: "dev_note", x: 50, y: 17, name: "📜 떨어진 개발자노트 (제1편)", prompt: "개발자노트 읽기 (SPACE)" }
      ],
      npcs: [
        {
          id: "npc_g1_helper",
          name: "졸업생",
          x: 14,
          y: 9,
          avatar: "graduate",
          dialogue: "안녕! 숭실중 1학년 영어 RPG(시즌1)에 온 후배들을 환영해! 🎓\n선배로서 모험을 위한 핵심 가이드를 알려줄게!\n\n📝 [1단계: 퀴즈 풀기 & 재료 모으기]\n• [1학년 1반] 교실로 들어가서 책상 앞에서 SPACE를 눌러봐.\n• 1~4단원 영어 문제를 풀면 단단한 목재, 허브, 개나리 꽃잎과 골드를 얻을 수 있어!\n• (주의: 오답을 고르면 1~2 HP의 패널티를 입으니 문제를 신중히 읽어봐!)\n\n🔨 [2단계: 장비 & 포션 제작]\n• [1학년 복도] 아래쪽의 '장비 제작대'와 '소비품 제작대'를 찾아가 봐.\n• 영어 문장 퍼즐을 맞추고 재료와 골드로 무기, 방어구, 물약을 직접 만들 수 있어!\n\n🎒 [꿀팁 1: 장비 착용법]\n• 제작한 무기나 방어구는 우측 [가방(🎒)]에서 직접 터치해 '착용'해야 공격력(ATK)과 방어력(DEF), 체력(HP)이 올라가!\n\n❤️ [꿀팁 2: 체력 회복 & 부활]\n• 다쳤을 땐 언제든 [가방(🎒)]을 열어 빨간/주홍 물약을 마실 수 있어!\n• 복도나 1반 교실에서 안전하게 쉬면 3초마다 1 HP씩 서서히 자연 회복돼!\n• 친구가 쓰러지면 [부활 주문서]를 사용해서 50% 체력으로 살려줄 수도 있어!\n\n✨ [선배의 조언]\n모든 장비 준비가 완료되면 1학년 2반 앞의 한강우 선생님에게 찾아가 봐!"
        },
        {
          id: "npc_teacher_kangwoo",
          name: "한강우 선생님",
          x: 22,
          y: 5,
          avatar: "teacher",
          dialogue: "안녕! 1학년 2반 담임 한강우 선생님이란다. 👨‍🏫\n\n🪵 [1-2반 가죽 골렘 1:1 레이드 상시 개방]\n이 2반 문으로 들어가면 1차 관문 수호 거수 '가죽 골렘'이 기다리고 있단다!\n\n⚔️ [선생님의 공략 비책 전수 기믹]\n가죽 골렘의 두터운 외피를 연화시키고 싶다면, 1-1반 화단과 나무에서 재료를 모아 [나무검], [나무투구], [나무갑옷] (나무 세트 3종)을 모두 제작하여 직접 [착용]한 뒤 나에게 말을 걸어보렴. 골렘의 체력을 절반으로 줄여주는 특별한 비책을 전수해 주마!\n\n🐲 [청동 드래곤 출현지]\n참고로 2차 보스인 '고대 청동 드래곤'은 지상 운동장 넓은 천연잔디 축구장으로 이동하여 학생들의 도전을 기다리고 있단다!"
        },
        {
          id: "npc_teacher_sangdae",
          name: "이상대 선생님",
          x: 54,
          y: 5,
          avatar: "teacher",
          dialogue: "안녕! 1학년 1반 담임 이상대 선생님이다. 👨‍🏫\n\n⚠️ [엘리베이터 점검 안내]\n지금은 엘리베이터 점검 중이라 지상 운동장으로 내려갈 수 없단다!\n1학년 2반 교실의 1차 관문 보스 [가죽 골렘]을 토벌해야 점검이 완료되어 운동장으로 갈 수 있단다."
        }
      ]
    }
  },

  // 5층 대형 진로상담실 (진로 방탈출 6대 단서 & 직업 패시브 아카데미)
  classroom_career: {
    name: "🌟 진로상담실",
    exitDoor: { x: 30, y: 17 },
    blackboard: {
      x: 30,
      y: 2,
      name: "🌟 진로 비전 보드 (Vision Board)",
      prompt: "비전 보드 확인 (SPACE)"
    },
    teacherDesk: null,
    gatherSpots: [],
    desks: [],
    npcs: [],
    interactive: [
      // === 좌측: 진로 방탈출 6대 단서 & 2대 페이크 단서 ===
      { id: "career_clue_1", type: "career_clue", clueIndex: 1, letter: "D", x: 6, y: 6, name: "🏥 적성검사 PC (의료/생명)", prompt: "단서 조사 (SPACE)" },
      { id: "career_clue_2", type: "career_clue", clueIndex: 2, letter: "R", x: 14, y: 6, name: "🔬 과학 연구대 (학술/탐구)", prompt: "단서 조사 (SPACE)" },
      { id: "career_clue_5", type: "career_clue", clueIndex: 5, letter: "M", x: 22, y: 6, name: "🤝 멘토링 데스크 (교육/리더십)", prompt: "단서 조사 (SPACE)" },
      { id: "career_clue_3", type: "career_clue", clueIndex: 3, letter: "E", x: 6, y: 10, name: "💻 공학 작업대 (IT/기술)", prompt: "단서 조사 (SPACE)" },
      { id: "career_clue_4", type: "career_clue", clueIndex: 4, letter: "A", x: 14, y: 10, name: "🎨 예술 이젤 (문화/창작)", prompt: "단서 조사 (SPACE)" },
      { id: "career_clue_6", type: "career_clue", clueIndex: 6, letter: "S", x: 22, y: 10, name: "🔭 우주 탐구관 (자연/천문)", prompt: "단서 조사 (SPACE)" },
      { id: "career_clue_7", type: "career_clue", clueIndex: 7, isDecoy: true, letter: "P", x: 10, y: 14, name: "💼 골동품 서류가방 (미지의 단서)", prompt: "단서 조사 (SPACE)" },
      { id: "career_clue_8", type: "career_clue", clueIndex: 8, isDecoy: true, letter: "K", x: 18, y: 14, name: "🎙️ 방송 마이크 부스 (미디어/음향)", prompt: "단서 조사 (SPACE)" },
      { id: "career_exit_keypad", type: "career_exit_keypad", x: 30, y: 6, name: "🔐 진로실 탈출 도어락", prompt: "탈출 도어락 조작 (SPACE)" },
      { id: "note_developer_career", type: "dev_note_2", x: 4, y: 16, name: "📜 떨어진 개발자노트 (제2편)", prompt: "개발자노트 2편 읽기 (SPACE)" },
      // === 우측: 1:1 상담실 1 & 1:1 상담실 2 전용 상담석 (가로 14타일 중심: x: 50) ===
      { id: "desk_career_counsel_1", type: "desk_career_counsel_1", x: 50, y: 6, name: "💬 [1:1 상담실 1] 진로 심층 상담석", prompt: "1:1 심층 상담석 살펴보기 (SPACE)" },
      { id: "quest_career_guidebook", type: "quest_career_book", x: 55, y: 5, name: "📘 진로 적성 검사 안내서", prompt: "진로 적성 검사 안내서 회수하기 (SPACE)" },
      { id: "desk_career_counsel_2", type: "desk_career_counsel_2", x: 50, y: 13, name: "💬 [1:1 상담실 2] 학습·진학 코칭석", prompt: "1:1 코칭 상담석 살펴보기 (SPACE)" }
    ]
  },

  // 🏥 보건실 (Health Care Room - 30 x 20)
  classroom_health: {
    name: "🏥 보건실 (Health Care)",
    exitDoor: { x: 10, y: 17 },
    blackboard: {
      x: 10,
      y: 2,
      name: "🏥 숭실 건강 증진 게시판",
      prompt: "보건 게시판 확인 (SPACE)"
    },
    teacherDesk: {
      x: 6,
      y: 6,
      name: "🩺 보건 선생님 진료석",
      prompt: "건강 상담 및 진료 (SPACE)"
    },
    gatherSpots: [],
    desks: [],
    npcs: [
      {
        id: "npc_nurse",
        name: "보건 선생님",
        role: "보건실",
        x: 6,
        y: 5,
        avatar: "teacher",
        dialogue: "어디 아픈 곳은 없니? 숭실의 모험도 건강이 최우선이란다! 아프거나 지쳤을 땐 언제든 보건실 침대에서 쉬어가렴. (침대에서 휴식 시 HP 100% 완전 회복!)"
      }
    ],
    interactive: [
      { id: "health_bed_1", type: "health_bed", bedIndex: 1, x: 15, y: 6, name: "🛏️ 보건실 회복 침대 1번", prompt: "침대에 누워 휴식하기 (HP 100% 회복) (SPACE)" },
      { id: "health_bed_2", type: "health_bed", bedIndex: 2, x: 15, y: 11, name: "🛏️ 보건실 회복 침대 2번", prompt: "침대에 누워 휴식하기 (HP 100% 회복) (SPACE)" },
      { id: "health_cabinet", type: "health_cabinet", x: 10, y: 4, name: "💊 응급 구급약 & 약초 캐비닛", prompt: "구급약품 살펴보기 (SPACE)" },
      { id: "health_scale", type: "health_scale", x: 3, y: 6, name: "⚖️ 자동 신장·체중 측정기", prompt: "신체 검사 측정하기 (SPACE)" },
      { id: "health_eye_chart", type: "health_eye_chart", x: 3, y: 11, name: "👁️ 한미 시력 검사표", prompt: "시력 검사하기 (SPACE)" }
    ]
  },

  // 🕊️ Wee클래스 (Student Counseling & Healing Room - 도서관 규격 20 x 20 독립공간)
  classroom_wee: {
    name: "🕊️ Wee클래스 (상담실)",
    exitDoor: { x: 10, y: 17 },
    blackboard: {
      x: 10,
      y: 2,
      name: "🕊️ Wee클래스 따뜻한 마음 나눔터",
      prompt: "마음 나눔 보드 확인 (SPACE)"
    },
    teacherDesk: {
      x: 6,
      y: 6,
      name: "💬 전문상담 선생님 상담석",
      prompt: "마음 고민 상담하기 (SPACE)"
    },
    gatherSpots: [],
    desks: [],
    npcs: [
      {
        id: "npc_counselor_wee",
        name: "Wee클래스 전문상담 선생님",
        role: "Wee클래스",
        x: 6,
        y: 5,
        avatar: "teacher",
        dialogue: "안녕! 마음에 무거운 짐이나 걱정거리가 있다면 언제든 편하게 털어놓으렴. 너는 이미 존재 자체로 소중하고 빛나는 사람이란다. ✨"
      }
    ],
    interactive: [
      { id: "wee_cushion_lounge", type: "wee_cushion_lounge", x: 15, y: 6, name: "🧸 토닥토닥 힐링 쿠션 & 빈백 라운지", prompt: "폭신한 쿠션에 기대어 쉬기 (SPACE)" },
      { id: "wee_tea_table", type: "wee_tea_table", x: 15, y: 11, name: "🫖 따뜻한 캐모마일 허브차 테이블", prompt: "따뜻한 차 마시기 (SPACE)" },
      { id: "wee_mailbox", type: "wee_mailbox", x: 3, y: 6, name: "📬 익명 고민 & 따뜻한 응원 우체통", prompt: "마음 우체통 열어보기 (SPACE)" },
      { id: "wee_emotion_board", type: "wee_emotion_board", x: 3, y: 11, name: "🌈 오늘 나의 감정 날씨판", prompt: "오늘의 마음 날씨 체크 (SPACE)" }
    ]
  },

  // 🏛️ 숭실역사관 (Soongsil History Museum - 1-1반 크기: 30 x 20)
  classroom_history: {
    name: "🏛️ 숭실역사관 (History Hall)",
    exitDoor: { x: 15, y: 17 },
    blackboard: {
      x: 15,
      y: 2,
      name: "🏛️ 숭실역사관 기념관",
      prompt: ""
    },
    teacherDesk: null,
    gatherSpots: [],
    desks: [],
    npcs: [],
    interactive: [
      { id: "door_secret_history", type: "door_secret_history", x: 1, y: 10, name: "", prompt: "비밀의 방 들어가기 (SPACE)" },
      { id: "hist_vitrine_1", type: "history_vitrine", vitrineIndex: 1, x: 6, y: 7, name: "🏛️ [제1전시관] 1897 평양 창립관", prompt: "전시관 관람 (SPACE)" },
      { id: "hist_vitrine_2", type: "history_vitrine", vitrineIndex: 2, x: 6, y: 13, name: "🕊️ [제2전시관] 1938 민족신앙 수호관", prompt: "전시관 관람 (SPACE)" },
      { id: "hist_vitrine_3", type: "history_vitrine", vitrineIndex: 3, x: 24, y: 7, name: "🌱 [제3전시관] 1954 서울 재건관", prompt: "전시관 관람 (SPACE)" },
      { id: "hist_vitrine_4", type: "history_vitrine", vitrineIndex: 4, x: 24, y: 13, name: "🌟 [제4전시관] 숭실의 위인관", prompt: "전시관 관람 (SPACE)" },
      { id: "hist_craft_altar", type: "history_altar", x: 15, y: 4, name: "✨ 숭실 역사관 신비한 제단", prompt: "장비 제작 (SPACE)" },
      { id: "quest_library_book_history", type: "quest_library_book_hi", x: 10, y: 5, name: "📕 [대출도서] 숭실역사관에 놓인 고문서 도록", prompt: "고문서 도록 회수하기 (SPACE)" }
    ],
    historyMonsters: [
      {
        id: "hist_mob_1",
        name: "시간의 수호석상",
        court: "history",
        type: "regular",
        avatar: "history_guardian",
        icon: "🏛️",
        x: 10,
        y: 8,
        roam: true,
        hp: 120,
        maxHp: 120,
        atk: 18,
        def: 5,
        counterDmg: 25,
        goldReward: 16,
        expReward: 35,
        respawnSec: 15
      },
      {
        id: "hist_mob_2",
        name: "불멸의 파수병",
        court: "history",
        type: "regular",
        avatar: "history_sentinel",
        icon: "🕊️",
        x: 20,
        y: 8,
        roam: true,
        hp: 120,
        maxHp: 120,
        atk: 18,
        def: 5,
        counterDmg: 25,
        goldReward: 16,
        expReward: 35,
        respawnSec: 15
      },
      {
        id: "hist_mob_3",
        name: "기록관 골렘",
        court: "history",
        type: "regular",
        avatar: "archive_golem",
        icon: "📜",
        x: 10,
        y: 14,
        roam: true,
        hp: 130,
        maxHp: 130,
        atk: 19,
        def: 6,
        counterDmg: 26,
        goldReward: 18,
        expReward: 40,
        respawnSec: 15
      },
      {
        id: "hist_mob_4",
        name: "사명의 기사",
        court: "history",
        type: "regular",
        avatar: "mission_knight",
        icon: "⚔️",
        x: 20,
        y: 14,
        roam: true,
        hp: 130,
        maxHp: 130,
        atk: 19,
        def: 6,
        counterDmg: 26,
        goldReward: 18,
        expReward: 40,
        respawnSec: 15
      }
    ]
  },

  // 🗝️ 숭실역사관 서쪽 비밀의 방 (이스터에그 - 역사관 절반 사이즈: 16 x 20)
  classroom_secret_history: {
    name: "🗝️ 숭실 비밀의 서고 (Secret Archive)",
    exitDoor: { x: 8, y: 17 },
    blackboard: null,
    teacherDesk: null,
    gatherSpots: [],
    desks: [],
    npcs: [],
    interactive: [
      {
        id: "chest_secret_history",
        type: "chest_secret_history",
        x: 8,
        y: 5,
        name: "✨ 숭실 고대 비전의 보물함",
        prompt: "비밀 보물함 열기 (SPACE)"
      },
      {
        id: "bookshelf_secret_1",
        type: "secret_history_book",
        bookIndex: 1,
        x: 3,
        y: 6,
        name: "📚 숭실 독립운동 비화록 (평양편)",
        prompt: "고문서 읽기 (SPACE)"
      },
      {
        id: "bookshelf_secret_2",
        type: "secret_history_book",
        bookIndex: 2,
        x: 12,
        y: 6,
        name: "📚 숭실 127년 비전 사명록 (서울편)",
        prompt: "고문서 읽기 (SPACE)"
      }
    ]
  },

  // 6층 대형 교무실 (106 x 26) & 2학년 교실
  classroom_staff_office: {
    name: "🏛️ 교무실",
    exitDoor: { x: 2, y: 12 },
    exitDoorEast: { x: 103, y: 12 },
    blackboard: null,
    teacherDesk: null,
    gatherSpots: [],
    desks: [],
    npcs: [
      {
        id: "npc_teacher_joshua",
        name: "Joshua 선생님",
        role: "3학년 영어",
        seatId: 3,
        seatLabel: "3",
        x: 8.1875,
        y: 17.6,
        avatar: "teacher",
        questId: "quest_joshua_intro",
        dialogue: "Hello! 3학년 영어를 담당하는 Joshua 선생님이란다. 👨‍🏫"
      },
      {
        id: "npc_teacher_okchohan",
        name: "옥촣한 선생님",
        role: "사회",
        seatId: 10,
        seatLabel: "10",
        x: 26.0,
        y: 20.875,
        avatar: "teacher",
        questId: "quest_okchohan_social",
        dialogue: "반갑다! 사회를 가르치는 옥촣한 선생님이란다. 👨‍🏫"
      },
      {
        id: "npc_teacher_kimmijin",
        name: "김진믜 선생님",
        role: "미술",
        seatId: 15,
        seatLabel: "15",
        x: 55.1875,
        y: 15.4375,
        avatar: "teacher",
        questId: "quest_kimmijin_art",
        dialogue: "반갑다! 미술을 가르치는 김진믜 선생님이란다. 🎨"
      },
      {
        id: "npc_teacher_yosunyu",
        name: "요션유 선생님",
        role: "정보",
        seatId: 18,
        seatLabel: "18",
        x: 61.3125,
        y: 17.5625,
        avatar: "teacher",
        questId: "quest_yosunyu_info",
        dialogue: "반갑다! 미래를 여는 코딩과 알고리즘을 가르치는 정보 요션유 선생님이란다. 💻"
      },
      {
        id: "npc_teacher_kwimjinsyong",
        name: "귐즨숑 선생님",
        role: "진로",
        seatId: 24,
        seatLabel: "24",
        x: 74.0,
        y: 20.875,
        avatar: "teacher",
        questId: "quest_kwimjinsyong_career",
        dialogue: "반갑다! 숭실 학생들의 꿈과 진로를 밝혀주는 진로 귐즨숑 선생님이란다. 🌟"
      },
      {
        id: "npc_teacher_vice_principal",
        name: "교감선생님",
        role: "교감",
        seatId: 14,
        seatLabel: "14",
        x: 41.0,
        y: 20.875,
        avatar: "teacher",
        dialogue: "허허, 어서 오렴! 숭실의 교감선생님이란다. 🏫"
      }
    ],
    interactive: [
      { id: "safe_cafeteria_key", type: "cafeteria_key_safe", x: 17, y: 6, name: "🗝️ 소회의실 비밀 보관함 (급식실 열쇠)", prompt: "문서 보관함 조사하기 (SPACE)" },
      { id: "note_developer_staff_office", type: "dev_note_3", x: 8, y: 3, name: "📜 떨어진 개발자노트 (제3편)", prompt: "개발자노트 3편 읽기 (SPACE)" },
      { id: "quest_joshua_memo", type: "quest_memo", x: 51, y: 4, name: "📝 Joshua의 영단어 메모", prompt: "단어 메모 회수하기 (SPACE)" },
      { id: "quest_okchohan_textbook", type: "quest_okchohan_book", x: 42, y: 8, name: "📘 옥촣한의 사회 탐구 교재", prompt: "사회 교재 회수하기 (SPACE)" },
      { id: "desk_developer_juncheol", type: "desk_juncheol", x: 91, y: 15, name: "👑 갓준철의 연구 책상", prompt: "갓준철 선생님 책상 (SPACE)" },
      { id: "desk_teacher_sangdae", type: "desk_sangdae", x: 90, y: 19.5, name: "📐 이상대 선생님 연구석", prompt: "수학 연구석 살펴보기 (SPACE)" },
      { id: "desk_teacher_hangangwoo", type: "desk_hangangwoo", x: 88, y: 19.5, name: "📖 한강우 선생님 연구석", prompt: "국어 연구석 살펴보기 (SPACE)" },
      { id: "desk_teacher_kyungsuk", type: "desk_kyungsuk", x: 75, y: 17.5, name: "🧪 졍경슉 선생님 연구석", prompt: "과학 연구석 살펴보기 (SPACE)" },
      { id: "desk_teacher_hunihuni", type: "desk_hunihuni", x: 88, y: 17.5, name: "🥁 후니후니 선생님 연구석", prompt: "도덕 연구석 살펴보기 (SPACE)" },
      { id: "quest_library_book_office", type: "quest_library_book_of", x: 73, y: 17.5, name: "📗 [대출도서] 교무실에 꽂혀있던 과학 잡지", prompt: "과학 잡지 회수하기 (SPACE)" }
    ],
    // 1 ~ 33번 좌석 정의 (교사 NPC 배치용 - 좌측 1번부터 우측 33번까지 순차 정리)
    seats: [
      { id: 1, label: "1", x: 10, y: 15, facing: "right", group: "cluster_1" },
      { id: 2, label: "2", x: 13, y: 15, facing: "left", group: "cluster_1" },
      { id: 3, label: "3", x: 10, y: 18, facing: "right", group: "cluster_1" },
      { id: 4, label: "4", x: 13, y: 18, facing: "left", group: "cluster_1" },
      { id: 5, label: "5", x: 12, y: 21, facing: "up", group: "cluster_1" },

      { id: 6, label: "6", x: 25, y: 15, facing: "right", group: "cluster_2" },
      { id: 7, label: "7", x: 28, y: 15, facing: "left", group: "cluster_2" },
      { id: 8, label: "8", x: 25, y: 18, facing: "right", group: "cluster_2" },
      { id: 9, label: "9", x: 28, y: 18, facing: "left", group: "cluster_2" },
      { id: 10, label: "10", x: 27, y: 21, facing: "up", group: "cluster_2" },

      { id: 11, label: "11", x: 41, y: 15, facing: "down", group: "cluster_3" },
      { id: 12, label: "12", x: 40, y: 17, facing: "right", group: "cluster_3" },
      { id: 13, label: "13", x: 43, y: 17, facing: "left", group: "cluster_3" },
      { id: 14, label: "14", x: 41, y: 20, facing: "up", group: "cluster_3" },

      { id: 15, label: "15", x: 57, y: 15, facing: "right", group: "cluster_4" },
      { id: 16, label: "16", x: 60, y: 15, facing: "left", group: "cluster_4" },
      { id: 17, label: "17", x: 57, y: 18, facing: "right", group: "cluster_4" },
      { id: 18, label: "18", x: 60, y: 18, facing: "left", group: "cluster_4" },
      { id: 19, label: "19", x: 59, y: 21, facing: "up", group: "cluster_4" },

      { id: 20, label: "20", x: 73, y: 15, facing: "right", group: "cluster_5" },
      { id: 21, label: "21", x: 76, y: 15, facing: "left", group: "cluster_5" },
      { id: 22, label: "22", x: 73, y: 18, facing: "right", group: "cluster_5" },
      { id: 23, label: "23", x: 76, y: 18, facing: "left", group: "cluster_5" },
      { id: 24, label: "24", x: 75, y: 21, facing: "up", group: "cluster_5" },

      { id: 25, label: "25", x: 88, y: 15, facing: "right", group: "cluster_6" },
      { id: 26, label: "26", x: 91, y: 15, facing: "left", group: "cluster_6" },
      { id: 27, label: "27", x: 88, y: 18, facing: "right", group: "cluster_6" },
      { id: 28, label: "28", x: 91, y: 18, facing: "left", group: "cluster_6" },
      { id: 29, label: "29", x: 88, y: 20, facing: "right", group: "cluster_6" },
      { id: 30, label: "30", x: 91, y: 20, facing: "left", group: "cluster_6" },

      { id: 31, label: "31", x: 67, y: 5, facing: "down", group: "top" },
      { id: 32, label: "32", x: 66, y: 7, facing: "right", group: "top" },
      { id: 33, label: "33", x: 68, y: 7, facing: "left", group: "top" }
    ]
  },

  // 🍱 학생 급식실 (Cafeteria - 42 x 24 타일 대형 식당 공간)
  classroom_cafeteria: {
    name: "🍱 학생 급식실 (Cafeteria)",
    width: 42,
    height: 24,
    exitDoor: { x: 21, y: 22, name: "🚪 운동장 출구", prompt: "운동장으로 나가기 (SPACE)" },
    blackboard: null,
    teacherDesk: null,
    gatherSpots: [],
    desks: [],
    npcs: [],
    interactive: [
      { id: "cafeteria_serving_counter", type: "cafeteria_serving", x: 22, y: 7, name: "🍱 급식 배부대", prompt: "급식 배부대 둘러보기 (SPACE)" },
      { id: "cafeteria_tray_return", type: "cafeteria_tray_return", x: 4, y: 19, name: "🥣 퇴식구 & 잔반 버리는 곳", prompt: "퇴식구 둘러보기 (SPACE)" },
      { id: "cafeteria_kitchen_door", type: "cafeteria_kitchen", x: 8, y: 6, name: "🍳 조리실", prompt: "조리실 둘러보기 (SPACE)" },
      { id: "cafeteria_teacher_dining", type: "cafeteria_teacher_room", x: 36, y: 11, name: "📋 교사 급식실", prompt: "교사 급식실 둘러보기 (SPACE)" },
      { id: "cafeteria_water_dispenser", type: "cafeteria_water", x: 30, y: 12, name: "🚰 급식실 음수대", prompt: "시원한 물 마시기 (SPACE)" }
    ]
  },
  classroom_204: { name: "2학년 4반", exitDoor: { x: 15, y: 17 }, blackboard: { x: 15, y: 2, name: "칠판", prompt: "" }, teacherDesk: null, gatherSpots: [], desks: [], npcs: [], interactive: [] },
  classroom_205: { name: "2학년 5반", exitDoor: { x: 15, y: 17 }, blackboard: { x: 15, y: 2, name: "칠판", prompt: "" }, teacherDesk: null, gatherSpots: [], desks: [], npcs: [], interactive: [] },
  classroom_206: { name: "2학년 6반", exitDoor: { x: 15, y: 17 }, blackboard: { x: 15, y: 2, name: "칠판", prompt: "" }, teacherDesk: null, gatherSpots: [], desks: [], npcs: [], interactive: [] },

  // 5층 잠김 교실 (내부 비어있음)
  classroom_501: { name: "2학년 1반", exitDoor: { x: 15, y: 17 }, blackboard: { x: 15, y: 2, name: "칠판", prompt: "" }, teacherDesk: null, gatherSpots: [], desks: [], npcs: [], interactive: [] },
  classroom_502: { name: "2학년 2반", exitDoor: { x: 15, y: 17 }, blackboard: { x: 15, y: 2, name: "칠판", prompt: "" }, teacherDesk: null, gatherSpots: [], desks: [], npcs: [], interactive: [] },
  classroom_503: { name: "2학년 3반", exitDoor: { x: 15, y: 17 }, blackboard: { x: 15, y: 2, name: "칠판", prompt: "" }, teacherDesk: null, gatherSpots: [], desks: [], npcs: [], interactive: [] },
  classroom_505: { name: "3학년 5반", exitDoor: { x: 15, y: 17 }, blackboard: { x: 15, y: 2, name: "칠판", prompt: "" }, teacherDesk: null, gatherSpots: [], desks: [], npcs: [], interactive: [] },
  classroom_506: { name: "3학년 6반", exitDoor: { x: 15, y: 17 }, blackboard: { x: 15, y: 2, name: "칠판", prompt: "" }, teacherDesk: null, gatherSpots: [], desks: [], npcs: [], interactive: [] },

  classroom_701: {
    name: "1학년 1반",
    exitDoor: { x: 15, y: 17 },
    blackboard: {
      x: 15,
      y: 2,
      name: "교실 칠판",
      prompt: "칠판 확인"
    },
    teacherDesk: {
      x: 15,
      y: 4,
      name: "교탁(골드)",
      prompt: "골드 문제 풀기"
    },
    gatherSpots: [
      {
        id: "spot_wood_1",
        type: "gather_wood",
        x: 6,
        y: 6,
        name: "🪵 목재",
        prompt: "문제 풀기",
        dropItem: "item_wood",
        dropName: "단단한 목재",
        dropIcon: "🪵",
        dropRate: 45
      },
      {
        id: "spot_herb_1",
        type: "gather_herb",
        x: 24,
        y: 6,
        name: "🌿 허브",
        prompt: "문제 풀기",
        dropItem: "item_herb",
        dropName: "향긋한 허브",
        dropIcon: "🌿",
        dropRate: 35
      },
      {
        id: "spot_forsythia_1",
        type: "gather_forsythia",
        x: 6,
        y: 12,
        name: "🌼 개나리",
        prompt: "문제 풀기",
        dropItem: "item_forsythia",
        dropName: "노란 개나리 꽃잎",
        dropIcon: "🌼",
        dropRate: 20
      },
      {
        id: "spot_ginkgo_1",
        type: "gather_ginkgo",
        x: 24,
        y: 12,
        name: "🍂 교목 은행나무",
        prompt: "문제 풀기",
        dropItem: "item_ginkgo",
        dropName: "황금 은행잎",
        dropIcon: "🍂",
        dropRate: 17
      }
    ],
    desks: [
      { x: 11, y: 8 }, { x: 15, y: 8 }, { x: 19, y: 8 },
      { x: 11, y: 11 }, { x: 15, y: 11 }, { x: 19, y: 11 }
    ]
  },

  // 1학년 2반: 보스 레이드
  classroom_702: {
    name: "1학년 2반",
    exitDoor: { x: 15, y: 17 },
    boss: {
      id: "boss_leather_golem",
      type: "boss_raid",
      x: 15,
      y: 8,
      name: "🪵 가죽 골렘",
      title: "1-2반 1:1 솔로 레이드 수호 거수",
      prompt: "1:1 가죽 골렘 레이드 도전 (SPACE)",
      level: 10,
      maxHp: 2000,
      atk: 30,
      def: 14
    },
    desks: [],
    interactive: [
      { id: "quest_yosunyu_usb", type: "quest_yosunyu_usb", x: 2, y: 4, name: "💾 요션유의 알고리즘 USB", prompt: "알고리즘 USB 회수하기 (SPACE)" }
    ]
  },

  // 1학년 3반: 영어 타자 컴퓨터실 (산성비 단어 방어전)
  classroom_703: {
    name: "1학년 3반",
    exitDoor: { x: 15, y: 17 },
    blackboard: {
      x: 15,
      y: 2,
      name: "컴퓨터실 전광판",
      prompt: "컴퓨터실 규칙 확인"
    },
    acidRain: {
      id: "acid_rain_terminal",
      type: "acid_rain",
      x: 15,
      y: 5,
      name: "🖥️ 산성비 타자 컴퓨터",
      prompt: "산성비 게임 시작"
    },
    teacherDesk: {
      x: 8,
      y: 4,
      name: "선생님 메인 서버",
      prompt: "서버 확인"
    },
    desks: [
      { x: 11, y: 9 }, { x: 19, y: 9 },
      { x: 11, y: 13 }, { x: 19, y: 13 }
    ],
    npcs: [
      {
        id: "npc_teacher_computer",
        name: "오예숙 선생님",
        x: 11,
        y: 5,
        avatar: "teacher",
        dialogue: "안녕! 1학년 3반 담임 오예숙 선생님이란다. 👩‍🏫\n\n이곳은 하늘에서 떨어지는 영어 단어를 타이핑으로 막아내는 [산성비 영어 타자 방어전] 훈련장이란다!\n\n단어를 빠르고 정확하게 타이핑하면 타자 속도도 빨라지고 1학년 영어 교과서 핵심 어휘도 쏙쏙 외워진단다!\n\n초급(1~4단원), 중급(5~6단원), 고급(전범위) 난이도가 준비되어 있으니 자유롭게 자리에 앉아 산성비 게임을 시작해보렴!\n\n✨ [선생님의 특별 보너스]\n산성비 게임에서 고득점을 돌파하면 귀한 선물을 준단다!"
      }
    ]
  },

  // 1학년 4반: 후니후니 선생님의 도덕 & 락스피릿 교실 (가로 의자 4개)
  classroom_704: {
    name: "1학년 4반",
    exitDoor: { x: 15, y: 17 },
    blackboard: {
      x: 15,
      y: 2,
      name: "도덕 명언 칠판 (Words of Wisdom)",
      prompt: "도덕 명언 확인 (SPACE)"
    },
    drumKit: {
      x: 19,
      y: 5,
      name: "🥁 숭실 락앤롤 드럼 세트",
      prompt: "드럼 연주하기 (SPACE)"
    },
    desks: [
      { x: 9, y: 10, seatIndex: 1 },
      { x: 13, y: 10, seatIndex: 2 },
      { x: 17, y: 10, seatIndex: 3 },
      { x: 21, y: 10, seatIndex: 4 }
    ],
    npcs: [
      {
        id: "npc_teacher_moral_drum",
        name: "후니후니 선생님",
        x: 12,
        y: 5,
        avatar: "teacher",
        dialogue: "안녕! 1학년 4반 담임이자 드럼 치는 후니후니 선생님이란다! 🥁👨‍🏫\n\n'인생은 리듬이고, 도덕은 세상과 맞추는 하모니다!'\n\n교실 의자에 앉아 20문제를 모두 맞히면 특별한 호칭과 핵심 재료 보상을 선물로 준단다! ✨"
      }
    ]
  },

  // 1학년 5반: 연금술 연구실 (담임: 졍경슉 선생님)
  classroom_705: {
    name: "1학년 5반",
    exitDoor: { x: 15, y: 17 },
    blackboard: {
      x: 15,
      y: 2,
      name: "⚗️ 연금술 비전 레시피 칠판",
      prompt: "칠판 확인"
    },
    desks: [],
    interactive: [
      { id: "alch_cauldron", type: "alchemy_cauldron", x: 15, y: 7, name: "⚗️ 끓어오르는 연금술 가마솥", prompt: "골드로 재료 연성하기 (SPACE)" },
      { id: "alch_shelf", type: "alchemy_shelf", x: 7, y: 4, name: "🧪 신비한 비전 시약 선반", prompt: "시약 관찰하기 (SPACE)" },
      { id: "alch_tome", type: "alchemy_tome", x: 23, y: 4, name: "📚 졍경슉 선생님의 연금술 비전서", prompt: "비전서 읽기 (SPACE)" },
      { id: "alch_workbench_left", type: "alchemy_workbench", x: 6, y: 11, name: "🔬 정밀 과학 증류 실험대", prompt: "실험대 살펴보기 (SPACE)" },
      { id: "alch_workbench_right", type: "alchemy_workbench", x: 24, y: 11, name: "✨ 마법 룬 촉매 반응대", prompt: "반응대 살펴보기 (SPACE)" }
    ],
    npcs: [
      {
        id: "npc_teacher_kyungsook",
        name: "졍경슉 선생님",
        x: 19,
        y: 7,
        avatar: "teacher",
        prompt: "연금술 재료 연성하기 (SPACE)",
        dialogue: "어머, 안녕! 1학년 5반 담임이자 신비한 연금술을 연구하는 졍경슉 선생님이란다! ⚗️✨\n\n모험 중에 목재, 허브, 개나리 꽃잎이 부족하면 언제든 선생님의 연금술 솥에서 골드로 연성해 가렴!"
      }
    ]
  },

  // 1학년 6반: 스포츠 시간 출입제한 (NPC 없음)
  classroom_706: {
    name: "1학년 6반",
    exitDoor: { x: 15, y: 17 },
    blackboard: {
      x: 15,
      y: 2,
      name: "교실 칠판",
      prompt: "칠판 확인"
    },
    desks: [],
    npcs: []
  },

  classroom: {
    name: "교실 내부",
    exitDoor: { x: 15, y: 17 },
    blackboard: { x: 15, y: 2, name: "교실 칠판", prompt: "문제 풀기" },
    teacherDesk: {
      x: 15,
      y: 4,
      name: "교탁(골드)",
      prompt: "골드 문제 풀기"
    },
    desks: [
      { x: 11, y: 8 }, { x: 15, y: 8 }, { x: 19, y: 8 },
      { x: 11, y: 11 }, { x: 15, y: 11 }, { x: 19, y: 11 }
    ]
  },

  // 숭실 야외 종합 체육공간 (축구장, 농구장, 신규 인조잔디 풋살장, 관람석 스탠드)
    // 🏛️ 숭실 7층 종합 체육관 & 지상 주차장 광장 (56 x 36 타일)
  playground_gym: {
    name: "숭실 체육관 & 주차장",
    width: 56,
    height: 36,
    exitGate: {
      id: "gym_exit_gate",
      type: "gym_exit_gate",
      x: 53,
      y: 30,
      name: "[운동장 ➡️]",
      prompt: "운동장으로 나가기"
    },
    gymEntrance: {
      id: "gym_entrance",
      type: "gym_entrance",
      x: 46.5,
      y: 10,
      name: "🏛️ 숭실 체육관 메인 로비",
      prompt: "체육관 입장 (개관 준비 중)"
    },
    teacherCar: {
      id: "gym_teacher_car",
      type: "gym_teacher_car",
      x: 13,
      y: 16,
      name: "🚗 교직원 럭셔리 세단",
      prompt: ""
    },
    schoolBus: {
      id: "gym_school_bus",
      type: "gym_school_bus",
      x: 53.2,
      y: 16,
      name: "🚌 숭실 축구부 버스",
      prompt: ""
    },
    evCharger: {
      id: "gym_ev_charger",
      type: "gym_ev_charger",
      x: 38,
      y: 16,
      name: "⚡ 전기차 급속 충전소",
      prompt: ""
    },
    peTeacher: {
      id: "gym_pe_teacher",
      type: "gym_pe_teacher",
      x: 44,
      y: 15,
      name: "👨‍🏫 숭실고 체육선생님",
      prompt: "체력 단련 도전하기 (SPACE)"
    },
    guardTeacher: {
      id: "gym_guard_teacher",
      type: "gym_guard_teacher",
      x: 10,
      y: 33,
      name: "👮 배움터 지킴이 선생님",
      role: "숭실 정문 지킴이",
      avatar: "teacher",
      prompt: "언덕길 오르기 (SPACE)"
    },
    devNote4: {
      id: "note_developer_uphill",
      type: "dev_note_4",
      x: 31,
      y: 33,
      name: "📜 떨어진 개발자노트 (제4편)",
      prompt: "개발자노트 4편 읽기 (SPACE)"
    }
  },
  playground: {
    name: "숭실 운동장",
    width: 90,
    height: 54,
    boss: {
      id: "boss_bronze_dragon",
      type: "boss_raid",
      x: 18,
      y: 35,
      name: "🐲 고대 청동 드래곤",
      title: "숭실 운동장 천연잔디 축구장 수호룡",
      prompt: "청동 드래곤 레이드 (SPACE)",
      level: 15,
      maxHp: 5000,
      atk: 45,
      def: 20
    },
    elevator: { x: 80, y: 3 },
    cafeteria: { x: 86, y: 3, name: "학생 급식실", prompt: "급식실 입장" },
    historyHall: {
      id: "entrance_history_hall",
      type: "history_hall",
      x: 87,
      y: 52,
      name: "🏛️ 숭실역사관",
      prompt: "🏛️ 숭실역사관"
    },
    gymGate: {
      id: "gym_gate",
      type: "gym_gate",
      x: 2,
      y: 48,
      name: "🚗 체육관 & 주차장 진입 게이트",
      prompt: "체육관 & 주차장 진입"
    },
    store: {
      id: "store_canteen",
      type: "store",
      x: 72,
      y: 4,
      name: "매점",
      prompt: "매점 이용하기 (물품 매각)"
    },
    titleExchange: {
      id: "title_exchange",
      type: "title_exchange",
      x: 30,
      y: 15,
      name: "🏅 호칭 교환소",
      prompt: "호칭 교환소 이용하기"
    },
    brawlCoach: {
      id: "npc_brawl_ball_coach",
      type: "brawl_coach",
      x: 43,
      y: 19,
      name: "⚽ 브롤볼 코치",
      prompt: "3v3 브롤볼 참가 신청 (SPACE)",
      dialogue: "안녕! 이곳은 숭실 3v3 브롤볼 전용 하프코트란다! ⚽🔥\n\n공을 몰고 상대 골대에 슛을 꽂아 넣거나, B키로 시원한 슬라이딩 태클을 날려 공을 빼앗아보렴!\n\n6명이 모이면 3명씩 블루/레드팀으로 랜덤 배정되어 2골 선승제 경기가 시작된단다!"
    },
    lostBox: {
      id: "lost_found_box",
      type: "lost_box",
      x: 4,
      y: 6
    },
    sketchbook: {
      id: "quest_kimmijin_sketchbook",
      type: "quest_kimmijin_book",
      x: 16,
      y: 7,
      name: "🎨 김진미의 풍경화 스케치북",
      prompt: "스케치북 회수하기 (SPACE)"
    },
    libraryBook: {
      id: "quest_library_book_playground",
      type: "quest_library_book_pg",
      x: 38,
      y: 7,
      name: "📘 [대출도서] 운동장 스탠드에 떨어진 소설책",
      prompt: "소설책 회수하기 (SPACE)"
    },
    timeCapsule: {
      id: "time_capsule_bleachers",
      type: "time_capsule",
      x: 27,
      y: 7,
      name: "🕰️ [2004년] 선배들의 비밀 타임캡슐",
      prompt: "타임캡슐 조사 (SPACE)"
    },
    capsuleClue1: {
      id: "capsule_clue_1",
      type: "capsule_clue",
      clueIndex: 1,
      x: 10,
      y: 9,
      name: "📜 [단서 1] 찢어진 스탠드 쪽지",
      prompt: "단서 쪽지 읽기 (SPACE)"
    },
    capsuleClue2: {
      id: "capsule_clue_2",
      type: "capsule_clue",
      clueIndex: 2,
      x: 21,
      y: 9,
      name: "📜 [단서 2] 빛바랜 응원 일기",
      prompt: "단서 쪽지 읽기 (SPACE)"
    },
    capsuleClue3: {
      id: "capsule_clue_3",
      type: "capsule_clue",
      clueIndex: 3,
      x: 33,
      y: 9,
      name: "📜 [단서 3] 낡은 졸업 사진 쪽지",
      prompt: "단서 쪽지 읽기 (SPACE)"
    },
    capsuleClue4: {
      id: "capsule_clue_4",
      type: "capsule_clue",
      clueIndex: 4,
      x: 44,
      y: 9,
      name: "📜 [단서 4] 약속의 맹세 쪽지",
      prompt: "단서 쪽지 읽기 (SPACE)"
    },
    basketballMonsters: [
      {
        id: "bb_mob_1",
        name: "덩크 고블린",
        type: "regular",
        avatar: "dunk_goblin",
        icon: "🏀",
        x: 67,
        y: 11,
        roam: true,
        hp: 60,
        maxHp: 60,
        atk: 11,
        def: 2,
        counterDmg: 20, // 오답 시 피해량 (~15%)
        goldReward: 8,
        expReward: 15,
        leatherMin: 1,
        leatherMax: 2,
        respawnSec: 15
      },
      {
        id: "bb_mob_2",
        name: "덩크 고블린",
        type: "regular",
        avatar: "dunk_goblin",
        icon: "🏀",
        x: 81,
        y: 12,
        roam: true,
        hp: 60,
        maxHp: 60,
        atk: 11,
        def: 2,
        counterDmg: 20,
        goldReward: 8,
        expReward: 15,
        leatherMin: 1,
        leatherMax: 2,
        respawnSec: 15
      },
      {
        id: "bb_mob_3",
        name: "덩크 고블린",
        type: "regular",
        avatar: "dunk_goblin",
        icon: "🏀",
        x: 68,
        y: 22,
        roam: true,
        hp: 60,
        maxHp: 60,
        atk: 11,
        def: 2,
        counterDmg: 20,
        goldReward: 8,
        expReward: 15,
        leatherMin: 1,
        leatherMax: 2,
        respawnSec: 15
      },
      {
        id: "bb_mob_4",
        name: "덩크 고블린",
        type: "regular",
        avatar: "dunk_goblin",
        icon: "🏀",
        x: 82,
        y: 21,
        roam: true,
        hp: 60,
        maxHp: 60,
        atk: 11,
        def: 2,
        counterDmg: 20,
        goldReward: 8,
        expReward: 15,
        leatherMin: 1,
        leatherMax: 2,
        respawnSec: 15
      },
      {
        id: "bb_mob_5",
        name: "불꽃 드리블러",
        type: "mid",
        avatar: "flame_dribbler",
        icon: "🔥",
        x: 73,
        y: 10,
        roam: true,
        hp: 90,
        maxHp: 90,
        atk: 14,
        def: 3,
        counterDmg: 27, // 오답 시 피해량 (풀피 135의 정확히 20%!)
        goldReward: 15,
        expReward: 25,
        leatherMin: 1,
        leatherMax: 2,
        respawnSec: 20
      },
      {
        id: "bb_mob_6",
        name: "불꽃 드리블러",
        type: "mid",
        avatar: "flame_dribbler",
        icon: "🔥",
        x: 76,
        y: 23,
        roam: true,
        hp: 90,
        maxHp: 90,
        atk: 14,
        def: 3,
        counterDmg: 27,
        goldReward: 15,
        expReward: 25,
        leatherMin: 1,
        leatherMax: 2,
        respawnSec: 20
      },
      {
        id: "bb_mob_7",
        name: "림 가디언",
        type: "elite",
        avatar: "rim_guardian",
        icon: "👑",
        x: 63,
        y: 16,
        fixed: true, // 사진 속 왼쪽 농구대 옆 고정 수호신!
        hp: 160,
        maxHp: 160,
        atk: 18,
        def: 5,
        counterDmg: 35, // 오답 시 피해량 (~26%)
        goldReward: 35,
        expReward: 50,
        leatherMin: 3,
        leatherMax: 5,
        armorDropRate: 8, // 8% 가죽갑옷 완제품 드랍
        respawnSec: 45
      }
    ],
    futsalMonsters: [
      {
        id: "ft_mob_1",
        name: "태클 고블린",
        court: "futsal",
        type: "regular",
        avatar: "tackle_goblin",
        icon: "⚽",
        x: 67,
        y: 35,
        roam: true,
        hp: 95,
        maxHp: 95,
        atk: 16,
        def: 4,
        counterDmg: 24,
        goldReward: 14,
        expReward: 28,
        leatherMin: 1,
        leatherMax: 3,
        respawnSec: 15
      },
      {
        id: "ft_mob_2",
        name: "태클 고블린",
        court: "futsal",
        type: "regular",
        avatar: "tackle_goblin",
        icon: "⚽",
        x: 81,
        y: 36,
        roam: true,
        hp: 95,
        maxHp: 95,
        atk: 16,
        def: 4,
        counterDmg: 24,
        goldReward: 14,
        expReward: 28,
        leatherMin: 1,
        leatherMax: 3,
        respawnSec: 15
      },
      {
        id: "ft_mob_3",
        name: "태클 고블린",
        court: "futsal",
        type: "regular",
        avatar: "tackle_goblin",
        icon: "⚽",
        x: 68,
        y: 45,
        roam: true,
        hp: 95,
        maxHp: 95,
        atk: 16,
        def: 4,
        counterDmg: 24,
        goldReward: 14,
        expReward: 28,
        leatherMin: 1,
        leatherMax: 3,
        respawnSec: 15
      },
      {
        id: "ft_mob_4",
        name: "태클 고블린",
        court: "futsal",
        type: "regular",
        avatar: "tackle_goblin",
        icon: "⚽",
        x: 82,
        y: 44,
        roam: true,
        hp: 95,
        maxHp: 95,
        atk: 16,
        def: 4,
        counterDmg: 24,
        goldReward: 14,
        expReward: 28,
        leatherMin: 1,
        leatherMax: 3,
        respawnSec: 15
      },
      {
        id: "ft_mob_5",
        name: "불꽃 스트라이커",
        court: "futsal",
        type: "mid",
        avatar: "flame_striker",
        icon: "🔥",
        x: 73,
        y: 34,
        roam: true,
        hp: 120,
        maxHp: 120,
        atk: 22,
        def: 6,
        counterDmg: 32,
        goldReward: 24,
        expReward: 42,
        leatherMin: 2,
        leatherMax: 4,
        respawnSec: 20
      },
      {
        id: "ft_mob_6",
        name: "불꽃 스트라이커",
        court: "futsal",
        type: "mid",
        avatar: "flame_striker",
        icon: "🔥",
        x: 77,
        y: 46,
        roam: true,
        hp: 120,
        maxHp: 120,
        atk: 22,
        def: 6,
        counterDmg: 32,
        goldReward: 24,
        expReward: 42,
        leatherMin: 2,
        leatherMax: 4,
        respawnSec: 20
      },
      {
        id: "ft_mob_7",
        name: "거미손 골키퍼",
        court: "futsal",
        type: "elite",
        avatar: "spider_keeper",
        icon: "🧤",
        x: 63,
        y: 40,
        fixed: true,
        hp: 190,
        maxHp: 190,
        atk: 28,
        def: 8,
        counterDmg: 42,
        goldReward: 50,
        expReward: 80,
        leatherMin: 4,
        leatherMax: 6,
        armorDropRate: 8,
        respawnSec: 45
      }
    ]
  }
};

window.WORLD_DATA = WORLD_DATA;
