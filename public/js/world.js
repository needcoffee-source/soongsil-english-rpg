/**
 * Soongsil World Map & Floor Data — Season 1
 * - 1학년 복도 (hallway): 제작
 * - 1학년 1반 (room_701): 채집 (목재=1단원, 허브=2단원, 개나리=3단원, 교목=4단원)
 * - 1학년 2반 (room_702): 보스 레이드
 */

const WORLD_DATA = {
  TILE_SIZE: 32,
  MAP_WIDTH: 30,
  HALLWAY_WIDTH: 60, // 1학년 복도 길이 2배 확장 (30타일 -> 60타일)
  MAP_HEIGHT: 20,

  floors: {
    7: {
      name: "1학년 복도",
      rooms: [
        { id: "room_701", name: "1학년 1반", doorX: 10, doorY: 5, targetX: 15, targetY: 14 },
        { id: "room_702", name: "1학년 2반", doorX: 20, doorY: 5, targetX: 15, targetY: 14 },
        { id: "room_703", name: "1학년 3반", doorX: 30, doorY: 5, targetX: 15, targetY: 14 }
      ],
      elevator: { x: 56, y: 3 },
      interactive: [
        { id: "board_leaderboard", type: "leaderboard", x: 3, y: 6, name: "랭킹보드", prompt: "랭킹보드 확인" },
        { id: "craft_equip_7", type: "craft", category: "equipment", x: 9, y: 14, name: "장비 제작대", prompt: "장비 제작하기" },
        { id: "craft_potion_7", type: "craft", category: "potion", x: 21, y: 14, name: "포션 제작대", prompt: "포션·주문서 제작하기" }
      ],
      npcs: [
        {
          id: "npc_g1_helper",
          name: "졸업생",
          x: 15,
          y: 9,
          avatar: "graduate",
          dialogue: "안녕! 숭실중 1학년 오픈월드(시즌1)에 온 후배들을 환영해! 🎓\n선배로서 모험을 위한 핵심 가이드를 알려줄게!\n\n📝 [1단계: 퀴즈 풀기 & 재료 모으기]\n• [1학년 1반] 교실로 들어가서 책상 앞에서 SPACE를 눌러봐.\n• 1~4단원 영어 문제를 풀면 단단한 목재, 허브, 개나리 꽃잎과 골드를 얻을 수 있어!\n• (주의: 오답을 고르면 1~2 HP의 패널티를 입으니 문제를 신중히 읽어봐!)\n\n🔨 [2단계: 장비 & 포션 제작]\n• [1학년 복도] 아래쪽의 '장비 제작대'와 '포션 제작대'를 찾아가 봐.\n• 영어 문장 퍼즐을 맞추고 재료와 골드로 무기, 방어구, 물약을 직접 만들 수 있어!\n\n🎒 [꿀팁 1: 장비 착용법]\n• 제작한 무기나 방어구는 우측 [가방(🎒)]에서 직접 터치해 '착용'해야 공격력(ATK)과 방어력(DEF), 체력(HP)이 올라가!\n\n❤️ [꿀팁 2: 체력 회복 & 부활]\n• 다쳤을 땐 언제든 [가방(🎒)]을 열어 빨간/주황 물약을 마실 수 있어!\n• 복도나 1반 교실에서 안전하게 쉬면 3초마다 1 HP씩 서서히 자연 회복돼!\n• 친구가 쓰러지면 [부활 주문서]를 사용해서 50% 체력으로 살려줄 수도 있어!\n\n✨ [선배의 조언]\n모든 장비 준비가 완료되면 1학년 2반 앞의 한강우 선생님에게 찾아가 봐!"
        },
        {
          id: "npc_teacher_kangwoo",
          name: "한강우 선생님",
          x: 22,
          y: 7,
          avatar: "teacher",
          dialogue: "안녕! 1학년 2반 담임 한강우 선생님이란다. 👨‍🏫\n\n👾 [보스 레이드 도전 안내]\n이 2반 문으로 들어가면 거대한 '고목 골렘' 혹은 전설의 '숭실 골드 드래곤' 보스가 기다리고 있단다!\n\n⚔️ [선생님의 레이드 조언]\n1. 복도에서 충분히 나무 장비를 제작하고 [가방(🎒)]에서 꼭 착용했는지 확인하렴! 방어력이 높아야 보스의 강력한 일격을 버틸 수 있단다.\n2. 보스의 일격에 대비해 빨간 물약과 주황 물약, 그리고 쓰러진 친구를 살려줄 부활 주문서를 넉넉히 챙겨오렴.\n3. 준비가 다 되었다면 2반 교실로 들어가 보스 앞에서 SPACE를 눌러 친구들과 함께 협동 레이드를 펼쳐보렴!"
        }
      ]
    }
  },

  // 1학년 1반
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
      name: "교실 교탁 (1~4단원 종합 모의고사)",
      prompt: "모의고사 풀기 (골드·EXP 2배!)"
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
        dropRate: 15
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
        dropRate: 20
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
        dropRate: 10
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
        dropRate: 7
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
      id: "boss_s1_treegolem",
      type: "boss_raid",
      x: 15,
      y: 8,
      name: "👾 고목 골렘",
      prompt: "보스 레이드",
      level: 10,
      maxHp: 1500,
      atk: 17,
      def: 8
    },
    desks: []
  },

  // 1학년 3반: 신규 오픈 교실 (콘텐츠 구성 준비 구역)
  classroom_703: {
    name: "1학년 3반",
    exitDoor: { x: 15, y: 17 },
    blackboard: {
      x: 15,
      y: 2,
      name: "3반 칠판 (새 공간)",
      prompt: "칠판 확인"
    },
    teacherDesk: {
      x: 15,
      y: 4,
      name: "3반 교탁 (1~4단원 종합 모의고사)",
      prompt: "모의고사 풀기 (골드·EXP 2배!)"
    },
    desks: [
      { x: 11, y: 8 }, { x: 15, y: 8 }, { x: 19, y: 8 },
      { x: 11, y: 11 }, { x: 15, y: 11 }, { x: 19, y: 11 }
    ]
  },

  classroom: {
    name: "교실 내부",
    exitDoor: { x: 15, y: 17 },
    blackboard: { x: 15, y: 2, name: "교실 칠판", prompt: "문제 풀기" },
    teacherDesk: {
      x: 15,
      y: 4,
      name: "3반 교탁 (1~4단원 종합 모의고사)",
      prompt: "모의고사 풀기 (골드·EXP 2배!)"
    },
    desks: [
      { x: 11, y: 8 }, { x: 15, y: 8 }, { x: 19, y: 8 },
      { x: 11, y: 11 }, { x: 15, y: 11 }, { x: 19, y: 11 }
    ]
  }
};
