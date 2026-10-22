/**
 * Soongsil World Map & Floor Data — Season 1
 * - 1학년 복도 (hallway): 제작
 * - 1학년 1반 (room_701): 채집 (목재=1단원, 허브=2단원, 개나리=3단원, 교목=4단원)
 * - 1학년 2반 (room_702): 보스 레이드
 */

const WORLD_DATA = {
  TILE_SIZE: 32,
  MAP_WIDTH: 30,
  MAP_HEIGHT: 20,

  floors: {
    7: {
      name: "1학년 복도",
      rooms: [
        { id: "room_701", name: "1학년 1반", doorX: 10, doorY: 5, targetX: 15, targetY: 14 },
        { id: "room_702", name: "1학년 2반", doorX: 20, doorY: 5, targetX: 15, targetY: 14 }
      ],
      interactive: [
        { id: "craft_equip_7", type: "craft", category: "equipment", x: 9, y: 12, name: "장비 제작대", prompt: "장비 제작하기" },
        { id: "craft_potion_7", type: "craft", category: "potion", x: 21, y: 12, name: "포션 제작대", prompt: "포션·주문서 제작하기" }
      ],
      npcs: [
        {
          id: "npc_g1_helper",
          name: "1학년 멘토",
          x: 15,
          y: 9,
          avatar: "mentor",
          dialogue: "안녕! 숭실중 1학년 오픈월드(시즌1)에 온 걸 환영해! 🎓\n모험을 위한 핵심 가이드를 알려줄게!\n\n📝 [1단계: 퀴즈 풀기 & 재료 모으기]\n• [1학년 1반] 교실로 들어가서 책상 앞 A버튼을 눌러봐.\n• 1~4단원 영어 문제를 풀면 단단한 목재, 허브, 개나리 꽃잎과 골드를 얻을 수 있어!\n• (주의: 오답을 고르면 1~2 HP의 패널티를 입으니 문제를 신중히 읽어봐!)\n\n🔨 [2단계: 장비 & 포션 제작]\n• [1학년 복도] 좌우의 '장비 제작대'와 '포션 제작대'를 찾아가 봐.\n• 영어 문장 퍼즐을 맞추고 재료와 골드로 무기, 방어구, 물약을 직접 만들 수 있어!\n\n👾 [3단계: 보스 레이드 도전]\n• [1학년 2반] 교실로 가면 거대한 '고목 골렘' 보스가 있어!\n• 친구들과 힘을 합쳐 보스를 물리치고 최고급 희귀 전리품을 획득해 봐!\n\n🎒 [꿀팁 1: 장비 착용법]\n• 제작한 무기나 방어구는 우측 [가방(🎒)]에서 직접 클릭해 '착용'해야 공격력(ATK)과 방어력(DEF), 체력(HP)이 올라가!\n\n❤️ [꿀팁 2: 체력 회복 & 부활]\n• 보스전에서 다쳤을 땐 언제든 [가방(🎒)]을 열어 빨간/주황 물약을 마실 수 있어!\n• 복도나 1반 교실에서 안전하게 쉬면 3초마다 1 HP씩 서서히 자연 회복돼!\n• 친구가 쓰러지면 [부활 주문서]를 사용해서 50% 체력으로 살려줄 수도 있어!"
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
      prompt: "문제 풀기"
    },
    teacherDesk: { x: 15, y: 4, name: "교탁" },
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

  classroom: {
    name: "교실 내부",
    exitDoor: { x: 15, y: 17 },
    blackboard: { x: 15, y: 2, name: "교실 칠판", prompt: "문제 풀기" },
    teacherDesk: { x: 15, y: 4, name: "교탁" },
    desks: [
      { x: 11, y: 8 }, { x: 15, y: 8 }, { x: 19, y: 8 },
      { x: 11, y: 11 }, { x: 15, y: 11 }, { x: 19, y: 11 }
    ]
  }
};
