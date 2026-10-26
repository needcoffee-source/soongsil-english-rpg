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
  PLAYGROUND_WIDTH: 90, // 복도 면적의 2배가 넘는 대형 숭실 야외 운동장 (90 x 54 타일)
  PLAYGROUND_HEIGHT: 54, // 농구장 아래 동일 규격(26x20타일) 인조잔디 풋살장 수용 확장
  MAP_HEIGHT: 20,

  floors: {
    7: {
      name: "1학년 복도",
      rooms: [
        { id: "room_701", name: "1학년 1반", doorX: 10, doorY: 5, targetX: 15, targetY: 14 },
        { id: "room_702", name: "1학년 2반", doorX: 20, doorY: 5, targetX: 15, targetY: 14 },
        { id: "room_703", name: "1학년 3반", doorX: 30, doorY: 5, targetX: 15, targetY: 14 },
        { id: "room_704", name: "1학년 4반", doorX: 37, doorY: 5, targetX: 15, targetY: 14, locked: true, lockMessage: "지금은 스포츠(체육) 시간입니다. 타반 학생은 출입금지입니다! ⚽" },
        { id: "room_705", name: "1학년 5반", doorX: 43, doorY: 5, targetX: 15, targetY: 14, locked: true, lockMessage: "지금은 스포츠(체육) 시간입니다. 타반 학생은 출입금지입니다! ⚽" },
        { id: "room_706", name: "1학년 6반", doorX: 49, doorY: 5, targetX: 15, targetY: 14, locked: true, lockMessage: "지금은 스포츠(체육) 시간입니다. 타반 학생은 출입금지입니다! ⚽" }
      ],
      elevator: { x: 56, y: 3 },
      interactive: [
        { id: "board_leaderboard", type: "leaderboard", x: 3, y: 6, name: "랭킹보드", prompt: "랭킹보드 확인" },
        { id: "mirror_hallway", type: "mirror", x: 56, y: 16, name: "🪞 복도 전신 거울", prompt: "외모 단정 체크 (SPACE)" },
        { id: "craft_equip_7", type: "craft", category: "equipment", x: 9, y: 14, name: "장비 제작대", prompt: "장비 제작하기" },
        { id: "craft_potion_7", type: "craft", category: "potion", x: 21, y: 14, name: "포션 제작대", prompt: "포션·주문서 제작하기" },
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
          dialogue: "안녕! 숭실중 1학년 오픈월드(시즌1)에 온 후배들을 환영해! 🎓\n선배로서 모험을 위한 핵심 가이드를 알려줄게!\n\n📝 [1단계: 퀴즈 풀기 & 재료 모으기]\n• [1학년 1반] 교실로 들어가서 책상 앞에서 SPACE를 눌러봐.\n• 1~4단원 영어 문제를 풀면 단단한 목재, 허브, 개나리 꽃잎과 골드를 얻을 수 있어!\n• (주의: 오답을 고르면 1~2 HP의 패널티를 입으니 문제를 신중히 읽어봐!)\n\n🔨 [2단계: 장비 & 포션 제작]\n• [1학년 복도] 아래쪽의 '장비 제작대'와 '포션 제작대'를 찾아가 봐.\n• 영어 문장 퍼즐을 맞추고 재료와 골드로 무기, 방어구, 물약을 직접 만들 수 있어!\n\n🎒 [꿀팁 1: 장비 착용법]\n• 제작한 무기나 방어구는 우측 [가방(🎒)]에서 직접 터치해 '착용'해야 공격력(ATK)과 방어력(DEF), 체력(HP)이 올라가!\n\n❤️ [꿀팁 2: 체력 회복 & 부활]\n• 다쳤을 땐 언제든 [가방(🎒)]을 열어 빨간/주홍 물약을 마실 수 있어!\n• 복도나 1반 교실에서 안전하게 쉬면 3초마다 1 HP씩 서서히 자연 회복돼!\n• 친구가 쓰러지면 [부활 주문서]를 사용해서 50% 체력으로 살려줄 수도 있어!\n\n✨ [선배의 조언]\n모든 장비 준비가 완료되면 1학년 2반 앞의 한강우 선생님에게 찾아가 봐!"
        },
        {
          id: "npc_teacher_kangwoo",
          name: "한강우 선생님",
          x: 22,
          y: 5,
          avatar: "teacher",
          dialogue: "안녕! 1학년 2반 담임 한강우 선생님이란다. 👨‍🏫\n\n👾 [보스 레이드 도전 안내]\n이 2반 문으로 들어가면 1차 관문 보스 '가죽 골렘' 혹은 2차 졸업 보스인 '숭실 청동 드래곤'이 기다리고 있단다!\n\n⚔️ [선생님의 레이드 조언]\n1. 1반에서 나무 장비를 제작하고 1차 관문인 가죽 골렘을 먼저 쓰러뜨리렴! 가죽 골렘을 토벌하면 지상 운동장 엘리베이터가 즉시 개방된단다.\n2. 운동장(농구/풋살장)에서 2티어 가죽 풀세트를 맞춘 뒤 2차 보스인 청동 드래곤에게 도전해보렴!"
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
        dropRate: 20
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
        dropRate: 25
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
      name: "👾 가죽 골렘",
      prompt: "보스 레이드",
      level: 10,
      maxHp: 2000,
      atk: 30,
      def: 14
    },
    desks: []
  },

  // 1학년 3반: 영어 타자 컴퓨터실 (산성비 단어 방어전)
  classroom_703: {
    name: "1학년 3반 (영어 타자 컴퓨터실)",
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

  // 1학년 4반: 스포츠 시간 출입제한 (담임: 후니후니선생님)
  classroom_704: {
    name: "1학년 4반",
    exitDoor: { x: 15, y: 17 },
    blackboard: {
      x: 15,
      y: 2,
      name: "교실 칠판",
      prompt: "칠판 확인"
    },
    desks: [],
    npcs: [
      {
        id: "npc_teacher_jihong",
        name: "후니후니선생님",
        x: 15,
        y: 8,
        avatar: "teacher",
        dialogue: "안녕! 1학년 4반 담임 후니후니선생님이란다. 👨‍🏫\n\n지금은 스포츠(체육) 시간이라 교실 수업이 없단다!\n타반 학생은 출입금지이니 어서 지상 운동장으로 가보렴! ⚽"
      }
    ]
  },

  // 1학년 5반: 스포츠 시간 출입제한 (담임: 졍경슉 선생님)
  classroom_705: {
    name: "1학년 5반",
    exitDoor: { x: 15, y: 17 },
    blackboard: {
      x: 15,
      y: 2,
      name: "교실 칠판",
      prompt: "칠판 확인"
    },
    desks: [],
    npcs: [
      {
        id: "npc_teacher_kyungsook",
        name: "졍경슉 선생님",
        x: 15,
        y: 8,
        avatar: "teacher",
        dialogue: "안녕! 1학년 5반 담임 졍경슉 선생님이란다. 👩‍🏫\n\n지금은 스포츠(체육) 시간이라 교실 수업이 없단다!\n타반 학생은 출입금지이니 어서 지상 운동장으로 가보렴! ⚽"
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
  playground: {
    name: "숭실 운동장",
    width: 90,
    height: 54,
    elevator: { x: 80, y: 3 },
    cafeteria: { x: 86, y: 3, name: "학생 급식실", prompt: "급식실 입장" },
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
    lostBox: {
      id: "lost_found_box",
      type: "lost_box",
      x: 4,
      y: 6
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
