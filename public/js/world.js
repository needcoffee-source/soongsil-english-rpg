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
          dialogue: "안녕! 숭실중 1학년 오픈월드(시즌1)에 온 걸 환영해!\n\n🔨 [1학년 복도]: 복도 좌우의 '장비 제작대'와 '포션 제작대'에서 직접 제작할 수 있어.\n🪵 [1학년 1반]: 4개 단원(1단원 목재, 2단원 허브, 3단원 개나리, 4단원 교목) 문제를 풀며 재료를 채집하는 곳이야.\n👾 [1학년 2반]: 친구들과 함께 도전하는 보스 레이드 장소야! 나무 장비를 단단히 갖춰 입고 포션을 챙겨서 도전해 봐!"
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
