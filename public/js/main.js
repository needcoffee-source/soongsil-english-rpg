
const SOONGSIL_HISTORY_VITRINES = [
  {
    index: 1,
    id: 'hist_vitrine_1',
    title: '🏛️ [제1전시관] 1897 평양 숭실학당 창립관',
    era: '1897년 ~ 1900년대',
    heading: '평양에서 타오른 근대 교육의 첫 불꽃',
    story: '1897년 10월 10일, 미국인 선교사 윌리엄 M. 베어드(배위량) 박사가 평양 신양동 사택에서 13명의 학생으로 숭실학당을 설립했습니다.\n\n"실력 있는 기독교 인재를 양성하여 민족을 깨우치자!"\n\n숭실은 한국 최초로 영어, 과학, 서양 문물을 가르치며 한국 근대 대학의 모태가 되었습니다.',
    relic: '📜 배위량 박사의 초기 영문 타자기와 성경 원본'
  },
  {
    index: 2,
    id: 'hist_vitrine_2',
    title: '🕊️ [제2전시관] 1938 민족신앙 수호관',
    era: '1930년대 ~ 1938년',
    heading: '신앙과 민족의 지조를 지킨 눈물의 자진 폐교',
    story: '일제강점기 말기, 일제는 학생들에게 신사참배를 강요하며 민족정신을 말살하려 했습니다.\n\n숭실은 불의와의 타협을 거부하고 당당히 외쳤습니다:\n"신앙의 양심을 버리고 일제에 굴복하느니, 차라리 학교 문을 닫겠다!"\n\n1938년 3월, 숭실은 민족의 절개와 신념을 지키기 위해 스스로 폐교의 길을 택했습니다.',
    relic: '🕊️ 1938년 자진폐교 결의서와 눈물의 졸업식 사진'
  },
  {
    index: 3,
    id: 'hist_vitrine_3',
    title: '🌱 [제3전시관] 1954 서울 재건과 상도동 캠퍼스관',
    era: '1945년 해방 ~ 1954년 서울 재건',
    heading: '전쟁의 폐허 속에서 다시 피어난 배움의 전당',
    story: '해방과 6.25 전쟁의 참화 속에서도 숭실의 등불은 결코 꺼지지 않았습니다.\n\n피란 시절 부산에서 숭실의 재건을 결의한 동문과 교수진은, 1954년 서울 상도동 언덕에 숭실의 새로운 터전을 일구어냈습니다.\n\n학생들은 손수 벽돌을 나르고 천막 교실에서 공부하며 오늘날 찬란한 숭실 캠퍼스를 완성했습니다.',
    relic: '🧱 상도동 캠퍼스 첫 주춧돌과 피란 천막 교실 기록'
  },
  {
    index: 4,
    id: 'hist_vitrine_4',
    title: '🌟 [제4전시관] 숭실의 위인관 (인물과 문학)',
    era: '숭실을 빛낸 자랑스러운 스승과 선배들',
    heading: '시대를 비추는 등불이 된 숭실의 거인들',
    story: '민족의 지도자이자 평양 숭실의 학장이었던 "조만식 선생",\n\n어둠의 일제 치하에서 별을 노래하며 조국의 독립을 갈망했던 숭실중학 출신의 민족시인 "윤동주",\n\n한국 순수문학의 거장 "황순원 작가".\n\n이 위대한 인물들이 모두 숭실의 교정에서 사명과 진리를 배웠습니다.',
    relic: '✒️ 윤동주 시인의 유고 시집 <하늘과 바람과 별과 시> & 조만식 선생의 유묵'
  }
];


// =========================================================================
// 📖 ITEM CODEX MASTER DATABASE (도감 및 획득처 사전)
// =========================================================================
window.ITEM_CODEX_DATABASE = [
  // 1. Materials (재료 10종)
  {
    id: 'item_wood',
    name: '단단한 목재',
    icon: '🪵',
    category: 'material',
    tierBadge: '기본 재료',
    tierColor: '#78350f',
    effect: '1티어 나무 장비(나무검·투구·갑옷) 제작 핵심 기본 재료',
    source: '7층 1학년 1반 책상·사물함·교탁 및 1~4단원 채집 퀴즈 정답 시 드랍',
    recipe: '1학년 1반 및 교내 채집 파밍'
  },
  {
    id: 'item_herb',
    name: '향긋한 허브',
    icon: '🌿',
    category: 'material',
    tierBadge: '약초 재료',
    tierColor: '#166534',
    effect: '빨간 물약, 주홍 물약, 부활 주문서 조제 필수 재료',
    source: '7층 1학년 복도 동쪽 화분(실내 식물존) 1단원 퀴즈 정답 시 드랍',
    recipe: '7층 복도 화분 채집 파밍'
  },
  {
    id: 'item_forsythia',
    name: '노란 개나리 꽃잎',
    icon: '🌼',
    category: 'material',
    tierBadge: '교화 재료',
    tierColor: '#ca8a04',
    effect: '주홍 물약, 청동 장비, 성실의 개나리 반지 제작 재료',
    source: '7층 1학년 복도 서쪽 개나리 화분 2단원 퀴즈 정답 시 드랍',
    recipe: '7층 복도 개나리 화분 채집 파밍'
  },
  {
    id: 'item_ginkgo',
    name: '황금 은행잎',
    icon: '🍂',
    category: 'material',
    tierBadge: '교목 재료',
    tierColor: '#d97706',
    effect: '부활 주문서 및 합심의 황금 은행잎 부적 제작 재료',
    source: '7층 1학년 복도 중앙 교목 은행나무 3단원 퀴즈 정답 시 드랍',
    recipe: '7층 복도 은행나무 채집 파밍'
  },
  {
    id: 'item_boss_leather',
    name: '질긴 보스의 가죽',
    icon: '🥋',
    category: 'material',
    tierBadge: '보스 가죽',
    tierColor: '#b45309',
    effect: '2티어 고급 가죽 방어구(세이버·투구·갑옷) 제작 핵심 재료',
    source: '1학년 2반 가죽 골렘 보스 처치 시 획득',
    recipe: '1-2 보스 처치 전리품'
  },
  {
    id: 'item_basketball_leather',
    name: '농구공 가죽 조각',
    icon: '🏀',
    category: 'material',
    tierBadge: '야외 전리품',
    tierColor: '#c2410c',
    effect: '2티어 가죽손잡이 세이버 및 가죽갑옷 제작 재료',
    source: '야외 농구장 체육 몬스터 퀴즈 사냥 시 드랍',
    recipe: '농구장 몬스터 사냥'
  },
  {
    id: 'item_futsal_leather',
    name: '탄력있는 풋살공 가죽',
    icon: '⚽',
    category: 'material',
    tierBadge: '야외 전리품',
    tierColor: '#15803d',
    effect: '2티어 가죽투구 및 가죽손잡이 세이버 제작 재료',
    source: '야외 풋살장 체육 몬스터 퀴즈 사냥 시 드랍',
    recipe: '풋살장 몬스터 사냥'
  },
  {
    id: 'item_bronze_heart',
    name: '청동 드래곤의 심장',
    icon: '❤️‍🔥',
    category: 'material',
    tierBadge: '보스 전리품',
    tierColor: '#dc2626',
    effect: '3티어 청동 장비(청동검·투구·갑옷) 제작 필수 재료',
    source: '퀘스트',
    recipe: '퀘스트'
  },
  {
    id: 'item_perfect_exam',
    name: '백점만점 시험지',
    icon: '💯',
    category: 'material',
    tierBadge: '명예 증표',
    tierColor: '#4338ca',
    effect: '숭실 최고의 지성 증표 · [📚 시험의 제왕] 호칭 및 [👟 삼디다스 실내화] 교환권',
    source: '운동장 축구장 중간고사 대마왕 보스 격파 시 획득',
    recipe: '중간고사 대마왕 처치 전리품'
  },
  {
    id: 'item_eval_paper',
    name: 'A+ 만점 수행평가지',
    icon: '📜',
    category: 'material',
    tierBadge: '보스 전리품',
    tierColor: '#0d9488',
    effect: '케르베로스 토벌 증표 · [👟 삼디다스 실내화] 특별 교환권',
    source: '운동장 축구장 수행평가 3두마수 케르베로스 보스 격파 시 획득',
    recipe: '케르베로스 보스 처치 전리품'
  },

  // 2. Consumables (소비품 6종 - craft_recipes.json 공식 레시피)
  {
    id: 'item_red_potion',
    name: '빨간 물약',
    icon: '🧪',
    category: 'consumable',
    tierBadge: '회복 물약',
    tierColor: '#e11d48',
    effect: '사용 시 체력(HP) +10 즉시 회복',
    source: '소비품 제작대(C)에서 조제 / 보스 레이드 전리품',
    recipe: '향긋한 허브 1개 + 5G'
  },
  {
    id: 'item_orange_potion',
    name: '주홍 물약',
    icon: '🧪',
    category: 'consumable',
    tierBadge: '고급 회복 물약',
    tierColor: '#ea580c',
    effect: '사용 시 체력(HP) +25 대폭 회복',
    source: '소비품 제작대(C)에서 조제 / 보스 레이드 전리품',
    recipe: '향긋한 허브 2개 + 노란 개나리 꽃잎 1개 + 10G'
  },
  {
    id: 'item_green_potion',
    name: '초록 물약',
    icon: '🧪',
    category: 'consumable',
    tierBadge: '특수 물약',
    tierColor: '#16a34a',
    effect: '사용 시 1분간 질주(대시) 속도 +10% 증가',
    source: '소비품 제작대(C)에서 제작',
    recipe: '향긋한 허브 2개 + 단단한 목재 1개 + 15G'
  },
  {
    id: 'item_courage_potion',
    name: '용기의 물약',
    icon: '🧪',
    category: 'consumable',
    tierBadge: '특수 물약',
    tierColor: '#9333ea',
    effect: '사용 시 3분간 공격력(ATK) +5 증가',
    source: '소비품 제작대(C)에서 제작',
    recipe: '향긋한 허브 2개 + 단단한 목재 1개 + 20G'
  },
  {
    id: 'item_revive_scroll',
    name: '부활 주문서',
    icon: '📜',
    category: 'consumable',
    tierBadge: '주문서',
    tierColor: '#7c3aed',
    effect: '사용 시 쓰러진 동료를 50% 체력으로 즉시 부활',
    source: '소비품 제작대(C)에서 제작',
    recipe: '향긋한 허브 3개 + 황금 은행잎 1개 + 10G'
  },
  {
    id: 'item_return_scroll',
    name: '귀환 주문서',
    icon: '📜',
    category: 'consumable',
    tierBadge: '주문서',
    tierColor: '#0284c7',
    effect: '사용 시 어디서든 안전한 7층 복도로 즉시 공간 이동',
    source: '소비품 제작대(C)에서 제작',
    recipe: '단단한 목재 1개 + 향긋한 허브 2개 + 15G'
  },
  {
    id: 'item_teleport_scroll',
    name: '순간이동 주문서',
    icon: '📜',
    category: 'consumable',
    tierBadge: '주문서',
    tierColor: '#9333ea',
    effect: '사용 시 각 층 복도 및 운동장(농구/풋살/축구장)으로 즉시 순간이동',
    source: '소비품 제작대(C)에서 제작',
    recipe: '단단한 목재 1개 + 향긋한 허브 2개 + 50G'
  },
  {
    id: 'item_cafeteria_key',
    name: '급식실 열쇠',
    icon: '🔑',
    category: 'quest',
    tierBadge: '입장 열쇠',
    tierColor: '#f59e0b',
    effect: '12레벨 이상 모범 학생 급식실 정문 출입용 황금 열쇠',
    source: '6층 교무실 소회의실 보관함'
  },

  // 3. Tier 1 Wood Equipment (1티어 나무 장비 - craft_recipes.json 공식 레시피)
  {
    id: 'equip_wood_sword',
    name: '나무검 (Wooden Sword)',
    icon: '🗡️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '1티어 무기',
    tierColor: '#854d0e',
    effect: '공격력(ATK) +15 증가',
    source: '장비 제작대(C)에서 제작',
    recipe: '단단한 목재 10개 + 15G'
  },
  {
    id: 'equip_wood_helmet',
    name: '나무투구 (Wooden Helmet)',
    icon: '🪖',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '1티어 투구',
    tierColor: '#854d0e',
    effect: '방어력(DEF) +8, 체력(HP) +25 증가',
    source: '장비 제작대(C)에서 제작',
    recipe: '단단한 목재 10개 + 15G'
  },
  {
    id: 'equip_wood_armor',
    name: '나무갑옷 (Wooden Armor)',
    icon: '🛡️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '1티어 갑옷',
    tierColor: '#854d0e',
    effect: '방어력(DEF) +15, 체력(HP) +15 증가',
    source: '장비 제작대(C)에서 제작',
    recipe: '단단한 목재 10개 + 15G'
  },

  // 4. Tier 2 Leather Equipment (2티어 가죽 장비 - craft_recipes.json 공식 레시피)
  {
    id: 'equip_leather_sword',
    name: '가죽손잡이 세이버 (Leather-Grip Saber)',
    icon: '🗡️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '2티어 무기',
    tierColor: '#b45309',
    effect: '공격력(ATK) +22 증가',
    source: '장비 제작대(C)에서 제작',
    recipe: '보스의 가죽 1개 + 농구공 가죽 10개 + 풋살공 가죽 10개 + 35G'
  },
  {
    id: 'equip_leather_helmet',
    name: '가죽투구 (Leather Helmet)',
    icon: '⛑️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '2티어 투구',
    tierColor: '#b45309',
    effect: '방어력(DEF) +12, 체력(HP) +28 증가',
    source: '장비 제작대(C)에서 제작',
    recipe: '보스의 가죽 1개 + 풋살공 가죽 20개 + 40G'
  },
  {
    id: 'equip_leather_armor',
    name: '가죽갑옷 (Leather Armor)',
    icon: '🥋',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '2티어 갑옷',
    tierColor: '#b45309',
    effect: '방어력(DEF) +17, 체력(HP) +20 증가',
    source: '장비 제작대(C)에서 제작',
    recipe: '보스의 가죽 1개 + 농구공 가죽 30개 + 50G'
  },
  {
    id: 'equip_shoes_samdidas',
    name: '삼디다스 실내화',
    icon: '👟',
    category: 'shoes',
    subCategory: 'shoes',
    tierBadge: '1티어 신발',
    tierColor: '#059669',
    effect: '공격력 +2, 방어력 +2, 체력 +10',
    source: '🏅 호칭 교환소 특별 교환'
  },
  {
    id: 'equip_leather_shoes',
    name: '날렵한 가죽 운동화 (Leather Sneakers)',
    icon: '👟',
    category: 'shoes',
    subCategory: 'shoes',
    tierBadge: '2티어 신발',
    tierColor: '#b45309',
    effect: '공격력 +3, 방어력 +3, 체력 +10',
    source: '농구장/풋살장 엘리트 몬스터 토벌 시 드랍'
  },

  // 5. Tier 3 Bronze Equipment (3티어 청동 장비 - craft_recipes.json 공식 레시피)
  {
    id: 'equip_bronze_sword',
    name: '청동검 (Bronze Sword)',
    icon: '⚔️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '3티어 무기',
    tierColor: '#047857',
    effect: '공격력(ATK) +30 증가',
    source: '장비 제작대(C)에서 제작',
    recipe: '청동 드래곤 심장 1개 + 개나리 꽃잎 20개 + 50G'
  },
  {
    id: 'equip_bronze_helmet',
    name: '청동투구 (Bronze Helmet)',
    icon: '🪖',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '3티어 투구',
    tierColor: '#047857',
    effect: '방어력(DEF) +14, 체력(HP) +35 증가',
    source: '장비 제작대(C)에서 제작',
    recipe: '청동 드래곤 심장 1개 + 개나리 꽃잎 10개 + 50G'
  },
  {
    id: 'equip_bronze_armor',
    name: '청동갑옷 (Bronze Armor)',
    icon: '🛡️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '3티어 갑옷',
    tierColor: '#047857',
    effect: '방어력(DEF) +22, 체력(HP) +25 증가',
    source: '장비 제작대(C)에서 제작',
    recipe: '청동 드래곤 심장 1개 + 개나리 꽃잎 15개 + 70G'
  },

  // 6. Special School Accessories (교화/교목 장신구 - craft_recipes.json 공식 레시피)
  {
    id: 'equip_forsythia_ring',
    name: '성실의 개나리 반지 (Forsythia Ring)',
    icon: '🌼',
    category: 'accessory', subCategory: 'accessory',
    tierBadge: '교화 장신구',
    tierColor: '#ca8a04',
    effect: '공격력 +10, 방어력 +10, 체력 +20 증가',
    source: '복도 식물존 옆 악세서리 세공대에서 제작',
    recipe: '노란 개나리 꽃잎 20개 + 30G'
  },
  {
    id: 'equip_ginkgo_talisman',
    name: '합심의 황금 은행잎 부적 (Ginkgo Talisman)',
    icon: '🍂',
    category: 'accessory', subCategory: 'accessory',
    tierBadge: '교목 장신구',
    tierColor: '#d97706',
    effect: '공격력 +15, 방어력 +10, 체력 +30 증가',
    source: '복도 식물존 옆 악세서리 세공대에서 제작',
    recipe: '황금 은행잎 10개 + 50G',
    stats: { atk: 15, def: 10, hp: 30 }
  },
  {
    id: 'equip_elevator_pass',
    name: '엘리베이터 작동권',
    icon: '🪪',
    category: 'accessory', subCategory: 'accessory',
    tierBadge: '퀘스트 인가증',
    tierColor: '#2563eb',
    effect: '🛗 중앙 엘리베이터 가동 필수 인가증',
    source: '1학년 2반 가죽 골렘 토벌 시 획득',
    recipe: '가죽 골렘 토벌'
  },
  {
    id: 'equip_vintage_armband',
    name: '선배의 낡은 승리 완장',
    icon: '🎗️',
    category: 'accessory', subCategory: 'accessory',
    tierBadge: '유물 장신구',
    tierColor: '#f59e0b',
    effect: '공격력 +3, 방어력 +3, [특수] 모든 획득 경험치(EXP) +10% 증가 (매각 불가)',
    source: '히든 퀘스트',
    recipe: '히든 퀘스트 보상',
    stats: { atk: 3, def: 3 }
  },

  // 7. Tier 4 Heritage Equipment & Materials (4티어 숭실 헤리티지 세트)
  {
    id: 'item_history_essence',
    name: '숭실 역사의 정수',
    icon: '🏛️',
    category: 'material',
    tierBadge: '야외 전리품',
    tierColor: '#4f46e5',
    effect: '4대 역사관 탐구와 시련을 통해 정제된 영광의 숨결 (4티어 헤리티지 무기·방어구 필수 재료)',
    source: '숭실역사관 몬스터(일제 순사 등) 토벌 시 드랍',
    recipe: '역사관 몬스터 전투 드랍'
  },
  {
    id: 'item_unyielding_stone',
    name: '꺾이지 않는 사명석',
    icon: '💎',
    category: 'material',
    tierBadge: '야외 전리품',
    tierColor: '#0284c7',
    effect: '1938 신사참배 거부와 폐교의 아픔을 견뎌낸 굳은 의지 (4티어 헤리티지 무기·방어구 핵심 재료)',
    source: '숭실역사관 몬스터 토벌 시 드랍',
    recipe: '역사관 몬스터 전투 드랍'
  },
  {
    id: 'equip_heritage_blade',
    name: '1897 숭실 헤리티지 소드',
    icon: '⚔️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '4티어 무기',
    tierColor: '#6366f1',
    effect: '공격력 +45, 체력 +35',
    source: '숭실역사관 제단(C)에서 제작',
    recipe: '숭실 역사의 정수 5개 + 꺾이지 않는 사명석 3개 + 150G'
  },
  {
    id: 'equip_heritage_helmet',
    name: '1897 숭실 헤리티지 투구',
    icon: '👑',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '4티어 투구',
    tierColor: '#6366f1',
    effect: '방어력 +20, 체력 +35',
    source: '숭실역사관 제단(C)에서 제작',
    recipe: '숭실 역사의 정수 4개 + 꺾이지 않는 사명석 2개 + 120G'
  },
  {
    id: 'equip_heritage_armor',
    name: '1897 숭실 헤리티지 갑옷',
    icon: '🛡️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '4티어 갑옷',
    tierColor: '#6366f1',
    effect: '방어력 +30, 체력 +45',
    source: '숭실역사관 제단(C)에서 제작',
    recipe: '숭실 역사의 정수 5개 + 꺾이지 않는 사명석 3개 + 140G'
  },
  {
    id: 'equip_bronze_shoes',
    name: '청동 스파이크 (Bronze Spikes)',
    icon: '👟',
    category: 'shoes',
    subCategory: 'shoes',
    tierBadge: '3티어 신발',
    tierColor: '#047857',
    effect: '공격력 +5, 방어력 +5, 체력 +10',
    source: '숭실역사관 고대 비전의 보물함'
  },
  {
    id: 'equip_heritage_boots',
    name: '1897 숭실 헤리티지 부츠 (1897 Heritage Boots)',
    icon: '👟',
    category: 'shoes',
    subCategory: 'shoes',
    tierBadge: '4티어 신발',
    tierColor: '#6366f1',
    effect: '공격력 +6, 방어력 +6, 체력 +15',
    source: '기말고사 파멸신 레이드 토벌 시 드랍'
  },
  {
    id: 'equip_omr_wand',
    name: '컴싸 마법봉 (OMR Magic Wand)',
    icon: '🖊️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '4티어 무기',
    tierColor: '#7e22ce',
    effect: '공격력(ATK) +45, 방어력(DEF) +5, 체력(HP) +30 증가',
    source: '기말고사 파멸신 레이드 전리품 드랍',
    recipe: '제작 불가'
  }
];

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
  'item_boss_leather': { name: '질긴 보스의 가죽', icon: '🥋', count: 9999, meta: { type: 'material', effect: '가죽 골렘 전리품 · 2티어 가죽 장비 필수 재료' } },
  'item_bronze_heart': { name: '청동 드래곤의 심장', icon: '❤️‍🔥', count: 9999, meta: { type: 'material', effect: '청동 드래곤 전리품 · 3티어 청동 장비 필수 재료' } },
  'item_golem_weakness_scroll': { name: '📜 한강우의 골렘 연화 비책', icon: '📜', count: 1, meta: { type: 'quest', effect: '나무 세트 3종 착용 제자에게 전수된 비책 · 가죽 골렘 1:1 레이드 시 골렘 체력 50% 반감 (2,000 HP ➔ 1,000 HP)' } },
  'item_cafeteria_key': { name: '급식실 열쇠', icon: '🔑', count: 1, meta: { type: 'quest', effect: '12레벨 이상 모범 학생 급식실 정문 출입용 황금 열쇠' } },
  'item_basketball_leather': { name: '농구공 가죽 조각', icon: '🏀', count: 9999, meta: { type: 'material', effect: '농구장 몬스터 전리품 · 가죽 장비 제작 재료' } },
  'item_futsal_leather': { name: '탄력있는 풋살공 가죽', icon: '⚽', count: 9999, meta: { type: 'material', effect: '풋살장 몬스터 전리품 · 고급 방어구 및 장비 재료' } },
  'item_history_essence': { name: '🏛️ 숭실 역사의 정수', icon: '🏛️', count: 9999, meta: { type: 'material', effect: '역사관 몬스터 전리품 · 4티어 헤리티지 무기 필수 재료' } },
  'item_unyielding_stone': { name: '💎 꺾이지 않는 사명석', icon: '💎', count: 9999, meta: { type: 'material', effect: '역사관 몬스터 전리품 · 4티어 헤리티지 무기 핵심 재료' } },

  // 2. Potions & Scrolls
  'item_red_potion': { name: '빨간 물약', icon: '🧪', count: 9999, meta: { type: 'consumable', slot: 'consumable', heal: 10, effect: '체력 +10 회복' } },
  'item_orange_potion': { name: '주홍 물약', icon: '🧪', count: 9999, meta: { type: 'consumable', slot: 'consumable', heal: 25, effect: '체력 +25 회복' } },
  'item_green_potion': { name: '초록 물약', icon: '🧪', count: 9999, meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '1분간 기본 이동속도 +10% 증가' } },
  'item_courage_potion': { name: '용기의 물약', icon: '🧪', count: 9999, meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '3분간 공격력(ATK) +5 증가' } },
  'item_revive_scroll': { name: '부활 주문서', icon: '📜', count: 9999, meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '쓰러진 친구를 50% 체력으로 부활' } },
  'item_return_scroll': { name: '귀환 주문서', icon: '📜', count: 9999, meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '사용 시 모든 장소에서 7층 복도로 즉시 공간 이동' } },
  'item_teleport_scroll': { name: '순간이동 주문서', icon: '📜', count: 9999, meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '사용 시 각 층 복도 및 운동장(농구/풋살/축구장)으로 즉시 공간 이동' } },

  // 3. 1st Grade Wooden & Leather Equipment
  'equip_wood_sword': { name: '나무검', icon: '🗡️', count: 9999, meta: { type: 'equipment', slot: 'weapon', stats: { atk: 15, def: 0, hp: 0 }, effect: '공격력 +15' } },
  'equip_wood_helmet': { name: '나무투구', icon: '🪖', count: 9999, meta: { type: 'equipment', slot: 'helmet', stats: { atk: 0, def: 8, hp: 25 }, effect: '방어력 +8, 체력 +25' } },
  'equip_wood_armor': { name: '나무갑옷', icon: '🛡️', count: 9999, meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 15, hp: 15 }, effect: '방어력 +15, 체력 +15' } },
  'equip_leather_armor': { name: '가죽갑옷', icon: '🥋', count: 9999, meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 17, hp: 20 }, effect: '방어력 +17, 체력 +20' } },
  'equip_leather_helmet': { name: '가죽투구', icon: '⛑️', count: 9999, meta: { type: 'equipment', slot: 'helmet', stats: { atk: 0, def: 12, hp: 28 }, effect: '방어력 +12, 체력 +28' } },
  'equip_leather_shoes': { name: '날렵한 가죽 운동화', icon: '👟', count: 9999, meta: { type: 'equipment', slot: 'shoes', stats: { atk: 3, def: 3, hp: 10 }, effect: '2티어 고급 신발' } },
  'equip_leather_sword': { name: '가죽손잡이 세이버', icon: '🗡️', count: 9999, meta: { type: 'equipment', slot: 'weapon', stats: { atk: 22, def: 0, hp: 0 }, effect: '공격력 +22' } },
  'equip_forsythia_ring': { name: '성실의 개나리 반지', icon: '🌼', count: 9999, meta: { type: 'equipment', slot: 'accessory', stats: { atk: 10, def: 10, hp: 20 }, effect: '공격력 +10, 방어력 +10, 체력 +20' } },
  'equip_ginkgo_talisman': { name: '합심의 황금 은행잎 부적', icon: '🍂', count: 9999, meta: { type: 'equipment', slot: 'accessory', stats: { atk: 15, def: 10, hp: 30 }, effect: '공격력 +15, 방어력 +10, 체력 +30' } },
  'equip_elevator_pass': { name: '엘리베이터 작동권', icon: '🪪', count: 1, meta: { type: 'equipment', slot: 'accessory', isQuestItem: true, stats: { atk: 0, def: 0, hp: 0 }, effect: '🛗 중앙 엘리베이터 가동 인가증' } },

  // 4. Bronze Equipment (Boss Rare Drops)
  'equip_bronze_sword': { name: '청동검', icon: '⚔️', count: 9999, meta: { type: 'equipment', slot: 'weapon', stats: { atk: 30, def: 0, hp: 0 }, effect: '공격력 +30' } },
  'equip_bronze_helmet': { name: '청동투구', icon: '🪖', count: 9999, meta: { type: 'equipment', slot: 'helmet', stats: { atk: 0, def: 14, hp: 35 }, effect: '방어력 +14, 체력 +35' } },
  'equip_bronze_armor': { name: '청동갑옷', icon: '🛡️', count: 9999, meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 22, hp: 25 }, effect: '방어력 +22, 체력 +25' } },

  // 5. Tier 4 Heritage Equipment
  'equip_heritage_blade': { name: '⚔️ 1897 숭실 헤리티지 소드', icon: '⚔️', count: 9999, meta: { type: 'equipment', slot: 'weapon', stats: { atk: 45, def: 0, hp: 35 }, effect: '4티어 무기 · 공격력 +45, 체력 +35' } },
  'equip_heritage_helmet': { name: '👑 1897 숭실 헤리티지 투구', icon: '👑', count: 9999, meta: { type: 'equipment', slot: 'helmet', stats: { atk: 0, def: 20, hp: 35 }, effect: '4티어 투구 · 방어력 +20, 체력 +35' } },
  'equip_heritage_armor': { name: '🛡️ 1897 숭실 헤리티지 갑옷', icon: '🛡️', count: 9999, meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 30, hp: 45 }, effect: '4티어 갑옷 · 방어력 +30, 체력 +45' } },
  'equip_bronze_shoes': { name: '🥉 청동 스파이크', icon: '👟', count: 1, meta: { type: 'equipment', slot: 'shoes', stats: { atk: 5, def: 5, hp: 10 }, effect: '3티어 신발 · 숭실 역사관 보물' } },
  'equip_heritage_boots': { name: '👑 1897 숭실 헤리티지 부츠', icon: '👟', count: 1, meta: { type: 'equipment', slot: 'shoes', stats: { atk: 6, def: 6, hp: 15 }, effect: '4티어 신발' } },
  'equip_shoes_samdidas': { name: '👟 삼디다스 실내화', icon: '👟', count: 1, meta: { type: 'equipment', slot: 'shoes', stats: { atk: 2, def: 2, hp: 10 }, effect: '누구나 한 번쯤 사 신어봤다는 전설의 국민 실내화. 뒤축을 살짝 꺾어 신으면 복도 끝까지 쏜살같이 질주할 수 있을 것만 같다. [특수 효과] Shift 키를 누르면 질주가 가능합니다.' } },

  // 6. Legendary Season Boss Artifacts & Rewards
  'item_perfect_exam': { name: '💯 백점만점 시험지', icon: '💯', count: 9999, meta: { type: 'material', effect: '중간고사 대마왕 토벌 전리품 · 📚 시험의 제왕 호칭 교환 재료' } },
  'item_eval_paper': { name: 'A+ 만점 수행평가지', icon: '📜', count: 9999, meta: { type: 'material', effect: '케르베로스 전리품 · 수행평가 만점의 증표' } },
  'equip_omr_wand': { name: '컴싸 마법봉', icon: '🖊️', count: 9999, meta: { type: 'equipment', slot: 'weapon', stats: { atk: 45, def: 5, hp: 30 }, effect: '기말고사 파멸신 전리품 · 공격력 +45, 방어력 +5' } },
  'item_joshua_memo': { name: 'Joshua의 단어 메모', icon: '📝', count: 1, meta: { type: 'quest', effect: 'Joshua 선생님이 탕비실에 떨어뜨린 3학년 영어 핵심 단어장 메모' } },
  'item_okchohan_textbook': { name: '옥촣한의 사회 탐구 교재', icon: '📘', count: 1, meta: { type: 'quest', effect: '사회 옥촣한 선생님의 핵심 사회 탐구 수업 교재' } },
  'item_kimmijin_sketchbook': { name: '김진믜의 풍경화 스케치북', icon: '🎨', count: 1, meta: { type: 'quest', effect: '미술 김진믜 선생님의 섬세한 풍경화 스케치북' } },
  'item_yosunyu_usb': { name: '요션유의 알고리즘 USB', icon: '💾', count: 1, meta: { type: 'quest', effect: '정보 요션유 선생님의 파이썬 코딩과 알고리즘 강의 자료가 담긴 고속 USB' } },
  'item_career_guidebook': { name: '진로 적성 검사 안내서', icon: '📘', count: 1, meta: { type: 'quest', effect: '진로 귐즨숑 선생님의 진로 적성 검사 안내서' } },
  'equip_vintage_armband': { name: '선배의 낡은 승리 완장', icon: '🎗️', count: 1, meta: { type: 'equipment', slot: 'accessory', stats: { atk: 3, def: 3 }, effect: '공격력 +3, 방어력 +3, [특수] 모든 획득 경험치(EXP) +10% 증가 (매각 불가)' } }

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
  'equip_leather_shoes': 8, // 제작비 40G -> 20% = 8G
  'equip_forsythia_ring': 6, // 제작비 30G -> 20% = 6G

  // 5. 3티어 청동 / 은행잎 장비 (제작비의 20% 환급)
  'equip_bronze_sword': 10, // 제작비 50G -> 20% = 10G
  'equip_bronze_helmet': 10, // 제작비 50G -> 20% = 10G
  'equip_bronze_armor': 14, // 제작비 70G -> 20% = 14G
  'equip_ginkgo_talisman': 10, // 제작비 50G -> 20% = 10G

  // 6. 4티어 헤리티지 장비 및 역사관 재료 (제작비의 20% 환급)
  'item_history_essence': 5,
  'item_unyielding_stone': 10,
  'equip_heritage_blade': 30, // 제작비 150G -> 20% = 30G
  'equip_heritage_helmet': 24, // 제작비 120G -> 20% = 24G
  'equip_heritage_armor': 28, // 제작비 140G -> 20% = 28G
  'equip_bronze_shoes': 16, // 3티어 청동 신발 매각가
  'equip_heritage_boots': 30, // 4티어 헤리티지 신발 매각가

  // 7. 최상위 엔드 레이드 전리품
  'equip_omr_wand': 20,
  'equip_vintage_armband': 0, // 2004년 유물 장신구 (매각 불가)
    'equip_elevator_pass': 0 // 작동권 매점 판매 불가 (퀘스트 핵심 아이템)
};

// 호칭 교환소 4대 명예 호칭 정의 (목재 30개 -> 벌목왕, 허브 30개 -> 치유사, 골드 50 -> 숭실 부자, 백점만점 시험지 -> 시험의 제왕)
// =========================================================================
// 🌟 5층 진로 아카데미: 6대 직업 및 고유 패시브 스킬 정의
// =========================================================================
const JOB_PASSIVE_DEFINITIONS = [
  {
    id: 'medic',
    legacyId: 'doctor',
    name: '메딕 (Medic)',
    title: '🩺 수호의 메딕',
    icon: '👨‍⚕️',
    skillName: '치유의 손길 (Healing Touch)',
    effect: '3초당 자동 자연 치유량 3배 (3 HP 회복) & 퀴즈 오답 체력 데미지 10% 감소',
    desc: '환자를 보살피고 동료의 상처를 치유하는 숭실의 힐러!',
    stats: { hpRegen: 3, penaltyReduction: 0.10 }
  },
  {
    id: 'runner',
    legacyId: 'engineer',
    name: '러너 (Runner)',
    title: '⚡ 질주의 러너',
    icon: '🏃‍♂️',
    skillName: '쾌속 질주 (Swift Sprint)',
    effect: '기본 걷기 속도 +10% 상시 증가',
    desc: '지치지 않는 체력과 빠른 스피드로 숭실을 누비는 육상 스타!',
    stats: { speedBonus: 0.10 }
  },
  {
    id: 'scholar',
    legacyId: 'researcher',
    name: '스칼라 (Scholar)',
    title: '📚 지혜의 스칼라',
    icon: '🧙‍♂️',
    skillName: '지식의 탐구자 (Deep Knowledge)',
    effect: '모든 퀴즈 및 전투 정답 시 경험치(EXP) +15% 추가 획득',
    desc: '끊임없는 학구열과 지혜로 초고속 성장을 달성하는 학자!',
    stats: { expBonus: 0.15 }
  },
  {
    id: 'banker',
    legacyId: 'scientist',
    name: '뱅커 (Banker)',
    title: '🪙 황금의 뱅커',
    icon: '💼',
    skillName: '스마트 투자 (Smart Investment)',
    effect: '모든 골드(Gold) 획득량 +10% 추가 획득',
    desc: '밝은 경제 감각과 재테크 지혜로 부를 일구는 숭실 자산가!',
    stats: { goldBonus: 0.10 }
  },
  {
    id: 'fighter',
    legacyId: 'wrestler',
    altLegacyId: 'guardian',
    name: '파이터 (Fighter)',
    title: '🥊 불패의 파이터',
    icon: '🥊',
    skillName: '결정타 (Finishing Blow)',
    effect: '필드 몬스터 및 보스 레이드 공격 데미지 +10% 상승',
    desc: '강인한 피지컬과 날카로운 타격으로 몬스터를 제압하는 숭실의 격투가!',
    stats: { damageBonus: 0.10 }
  }
];

const CAREER_ESCAPE_CLUES = [
  {
    index: 1,
    id: 'career_clue_1',
    title: '🏥 적성검사 PC (의료/생명)',
    letter: 'D',
    stationName: '적성검사 컴퓨터',
    question: '환자의 아픔을 치료하고 생명을 살리는 고귀한 직업은 무엇일까요?\n\n💡 힌트: 영어 철자 D로 시작하는 6글자 단어입니다!',
    options: ['Dancer (무용수)', 'Driver (운전기사)', 'Doctor (의사)', 'Dentist (치과의사)'],
    answer: 'Doctor (의사)',
    clueReveal: '알파벳 [ D ]를 획득했습니다!'
  },
  {
    index: 2,
    id: 'career_clue_2',
    title: '🔬 과학 연구대 (학술/탐구)',
    letter: 'R',
    stationName: '과학 연구 실험대',
    question: '새로운 지식과 과학 기술을 깊이 탐색하고 발견하는 \'연구원\'을 뜻하는 영어 단어는?\n\n💡 힌트: R로 시작하며 research(연구하다)를 하는 전문가입니다!',
    options: ['Reader (독서가)', 'Researcher (연구원)', 'Runner (달리기 선수)', 'Reporter (기자)'],
    answer: 'Researcher (연구원)',
    clueReveal: '알파벳 [ R ]를 획득했습니다!'
  },
  {
    index: 3,
    id: 'career_clue_3',
    title: '💻 공학 작업대 (IT/기술)',
    letter: 'E',
    stationName: '공학 코딩석',
    question: '소프트웨어, 인공지능, 첨단 기계를 설계하고 만드는 \'공학자·엔지니어\'는?\n\n💡 힌트: E로 시작하며 엔진(engine)과 기술을 다루는 사람입니다!',
    options: ['Explorer (탐험가)', 'Editor (편집자)', 'Economist (경제학자)', 'Engineer (엔지니어)'],
    answer: 'Engineer (엔지니어)',
    clueReveal: '알파벳 [ E ]를 획득했습니다!'
  },
  {
    index: 4,
    id: 'career_clue_4',
    title: '🎨 예술 이젤 (문화/창작)',
    letter: 'A',
    stationName: '예술 창작 이젤',
    question: '풍부한 상상력과 아름다움을 그림, 조각, 음악으로 표현하는 \'예술가\'는?\n\n💡 힌트: A로 시작하며 art(예술)를 창작하는 사람입니다!',
    options: ['Actor (배우)', 'Artist (예술가)', 'Athlete (운동선수)', 'Author (작가)'],
    answer: 'Artist (예술가)',
    clueReveal: '알파벳 [ A ]를 획득했습니다!'
  },
  {
    index: 5,
    id: 'career_clue_5',
    title: '🤝 멘토링 데스크 (교육/리더십)',
    letter: 'M',
    stationName: '멘토링 데스크',
    question: '사람들에게 지혜와 꿈을 전하고 든든한 길잡이가 되어주는 \'조언자·멘토\'는?\n\n💡 힌트: M으로 시작하는 6글자 단어입니다!',
    options: ['Musician (음악가)', 'Magician (마술사)', 'Mechanic (정비사)', 'Mentor (멘토/조언자)'],
    answer: 'Mentor (멘토/조언자)',
    clueReveal: '알파벳 [ M ]를 획득했습니다!'
  },
  {
    index: 6,
    id: 'career_clue_6',
    title: '🔭 우주 탐구관 (자연/천문)',
    letter: 'S',
    stationName: '우주 탐구관',
    question: '자연의 법칙과 우주의 신비를 탐구하는 \'과학자\'를 뜻하는 영어 단어는?\n\n💡 힌트: S로 시작하며 science(과학)를 연구하는 학자입니다!',
    options: ['Sailor (항해사)', 'Soldier (군인)', 'Scientist (과학자)', 'Singer (가수)'],
    answer: 'Scientist (과학자)',
    clueReveal: '알파벳 [ S ]를 획득했습니다!'
  },
  {
    index: 7,
    id: 'career_clue_7',
    isDecoy: true,
    title: '💼 골동품 서류가방 (미지의 단서)',
    letter: 'P',
    stationName: '골동품 가죽 서류가방',
    question: '빛바랜 서류가방 틈새에서 수수께끼 쪽지가 발견되었습니다!\n\n\"모든 단서가 정답으로 이어지는 것은 아니다...\n어둠 속에서 반짝이는 것은 모두 금이 아니다. (All that glitters is not gold.)\"\n\n이 가방에 새겨진 악기 단어는 무엇일까요?\n💡 힌트: P로 시작하는 5글자 건반 악기입니다!',
    options: ['Violin (바이올린)', 'Guitar (기타)', 'Piano (피아노)', 'Drum (드럼)'],
    answer: 'Piano (피아노)',
    clueReveal: '알파벳 [ P ]를 발견했습니다! ...어라? 🤔 칠판의 6자리 비밀 암호(D-R-E-A-M-S) 어디에도 \'P\'가 들어갈 자리가 없는 것 같습니다!\n\n💡 [주의]: 탈출 정답과 관련 없는 낚시 단서인 것 같습니다! 🎣'
  },
  {
    index: 8,
    id: 'career_clue_8',
    isDecoy: true,
    title: '🎙️ 방송 마이크 부스 (미디어/음향)',
    letter: 'K',
    stationName: '방송 마이크 부스',
    question: '스튜디오 마이크 콘솔에서 수상한 오디오 대본 쪽지가 발견되었습니다!\n\n"마이크를 켜고 방송을 시작하지만, 이 주파수는 탈출구로 연결되지 않는다...\n빛나는 무대 뒤에는 언제나 또 다른 함정이 도사리고 있다."\n\n임금이나 국왕을 뜻하는 영어 단어는 무엇일까요?\n💡 힌트: K로 시작하는 4글자 단어입니다!',
    options: ['Queen (여왕)', 'Prince (왕자)', 'King (국왕)', 'Knight (기사)'],
    answer: 'King (국왕)',
    clueReveal: '알파벳 [ K ]를 발견했습니다! ...어라? 🤔 칠판의 6자리 비밀 암호(D-R-E-A-M-S) 어디에도 \'K\'가 들어갈 자리가 없습니다!\n\n💡 [주의]: 탈출 정답과 관련 없는 낚시 단서인 것 같습니다! 🎣'
  }
];

const TITLE_DEFINITIONS = [
  {
    id: 'title_history_bearer',
    name: '🏛️ 역사를 기억하는 자',
    desc: '숭실역사관 4대 전시관을 모두 탐방하고 127년의 역사와 사명을 마음에 새긴 숭실의 후예! (공격력 +10, 체력 +30, 파멸신 피해 +15%)',
    costType: 'quest',
    costAmount: 0
  },
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
  },
  { id: 'title_job_medic', name: '🩺 수호의 메딕', desc: '5층 진로상담실 방탈출을 통과하고 메딕(Medic)으로 전직한 숭실의 힐러!', costType: 'quest', costAmount: 0 },
  { id: 'title_job_runner', name: '⚡ 질주의 러너', desc: '5층 진로상담실 방탈출을 통과하고 러너(Runner)로 전직한 육상 스타!', costType: 'quest', costAmount: 0 },
  { id: 'title_job_scholar', name: '📚 지혜의 스칼라', desc: '5층 진로상담실 방탈출을 통과하고 스칼라(Scholar)로 전직한 지혜의 학자!', costType: 'quest', costAmount: 0 },
  { id: 'title_job_banker', name: '🪙 황금의 뱅커', desc: '5층 진로상담실 방탈출을 통과하고 뱅커(Banker)로 전직한 숭실 자산가!', costType: 'quest', costAmount: 0 },
  { id: 'title_job_fighter', name: '🥊 불패의 파이터', desc: '5층 진로상담실 방탈출을 통과하고 파이터(Fighter)로 전직한 불패의 격투가!', costType: 'quest', costAmount: 0 },
  {
    id: 'title_drummer',
    name: '🥁 영혼의 드러머',
    desc: '1학년 4반 후니후니 선생님의 20문제 도덕 비트를 모두 완벽하게 정복한 드러머!',
    costType: 'quest',
    costAmount: 0
  },
  {
    id: 'title_avid_reader',
    name: '📖 다독왕',
    desc: '2층 숭실 도서관의 7대 테마 서가(문학, 자연과학, 어학, 역사, 예술·체육, 정기간행물, 교양만화)를 모두 탐독한 열정적인 독서가!',
    costType: 'quest',
    costAmount: 0
  },
  {
    id: 'title_uphill_master',
    name: '🏃 폭풍의 지각생',
    desc: '숭실중학교 정문 급경사 2,500m 언덕길을 지각 위기에서 폭풍처럼 질주하여 S랭크로 주파한 전설의 러너!',
    costType: 'quest',
    costAmount: 0
  },
  {
    id: 'title_recycle_king',
    name: '♻️ 분리수거왕',
    desc: '6층 복도 분리수거함에서 환경과 지구를 지키는 올바른 분리배출 퀴즈를 완벽하게 통과한 환경 지킴이!',
    costType: 'quest',
    costAmount: 0
  },
  {
    id: 'title_time_connector',
    name: '🕰️ 시간을 잇는 자',
    desc: '야외 스탠드 관람석 틈새에 숨겨진 2004년 선배들의 타임캡슐 4단계 추리 퍼즐을 모두 풀고 감동의 편지를 발굴한 모험가!',
    costType: 'quest',
    costAmount: 0
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

// =========================================================================
// 🏛️ 6층 교무실 교사 퀘스트 정의 (RPG Quest Dispatch System)
// =========================================================================
window.QUEST_DEFINITIONS = QUEST_DEFINITIONS = {
  'quest_joshua_intro': {
    id: 'quest_joshua_intro',
    minLevel: 1,
    teacherId: 'npc_teacher_joshua',
    teacherName: 'Joshua 선생님',
    teacherRole: '3학년 영어',
    teacherSeat: '3번',
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
    minLevel: 9,
    teacherId: 'npc_teacher_okchohan',
    teacherName: '옥촣한 선생님',
    teacherRole: '사회',
    teacherSeat: '10번',
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

언제나 성실하게 활약하는 자네가 자랑스럽구나! 사회에 대해 궁금한 점이 있다면 언제든 10번 자리로 찾아오렴! 👍`,
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
      { type: 'item', itemKey: 'item_bronze_heart', itemName: '청동 드래곤의 심장', count: 1, icon: '🥉', meta: { type: 'material', effect: '3티어 청동 장비 제작 핵심 재료' }, label: '🥉 청동 드래곤의 심장 x1개' },
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
    teacherSeat: '15번',
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

언제든 미술에 대해 이야기를 나누고 싶거나 영감을 얻고 싶다면 15번 자리로 편하게 찾아오렴! 🎨✨`,
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
    teacherSeat: '18번',
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

언제든 코딩이나 컴퓨터, 알고리즘에 대해 궁금한 점이 있다면 18번 자리로 편하게 찾아오렴! 💻✨`,
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
        text: '6층 1-2교실 가장 구석에서 [요션유의 알고리즘 USB] 회수하기',
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
    teacherSeat: '24번',
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

언제든 꿈과 진로가 고민된다면 24번 자리로 찾아오렴! 🌟✨`,
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
      { type: 'item', itemKey: 'item_courage_potion', itemName: '용기 포션', count: 2, icon: '🧪', meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '3분간 공격력(ATK) +5 증가' }, label: '🧪 용기 포션 x2 (새로운 길을 나아갈 용기! 3분간 공격력 +5)' }
    ]
  },
  'quest_library_missing_books': {
    id: 'quest_library_missing_books',
    minLevel: 4,
    teacherId: 'npc_librarian',
    teacherName: '사서 선생님',
    teacherRole: '2층 도서관',
    teacherSeat: '도서관 안내석',
    teacherAvatar: '👩‍🏫',
    category: '📚 도서관 특별 의뢰 (Library Quest)',
    title: '[도서관] 사서 선생님의 긴급 의뢰: 흩어진 3권의 도서 회수',
    story: `안녕, 학생! 2층 도서관에 온 것을 환영한단다. 📚

하지만 지금 정말 큰일이란다... 며칠 전 대출되었던 소중한 학교 도서 3권이 제때 반납되지 않고 학교 곳곳에 흩어져 버렸어!

1. 📘 [세계문학 전집]: 운동장 관람석 스탠드 벤치에 누군가 두고 갔다는 제보가 있어.
2. 📗 [최신 과학 잡지]: 6층 교무실 과학 졍경슉 선생님 연구석 주변에 꽂혀 있단다.
3. 📕 [숭실 역사 고문서 도록]: 1897 숭실역사관 안쪽 전시실에 놓여 있어.

학교 곳곳을 탐험하며 이 3권의 도서를 모두 찾아 도서관으로 회수해 줄 수 있겠니?
모두 회수해 오면 풍성한 경험치와 골드를 보상으로 줄게!`,
    inProgressStory: `어서 오렴! 아직 분실된 도서 3권을 모두 찾지 못했더구나!

1. 📘 운동장 관람석 스탠드 (소설책)
2. 📗 6층 교무실 과학 연구석 (과학 잡지)
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
        text: '6층 교무실 과학 연구석에서 [과학 잡지] 회수하기',
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
  }
};
window.QUEST_DEFINITIONS = QUEST_DEFINITIONS;

class MainApp {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.engine = new GameEngine(this.canvas);
    this.quizManager = new QuizManager();
    this.craftingManager = new CraftingManager();
    this.networkManager = new NetworkManager(this.engine);

    window.NetworkManager = this.networkManager;

    if (window.BrawlBall) {
      window.BrawlBall.init(this.engine, this.networkManager);
    }

    this.isServerOpen = true;
    this.serverClosedMessage = '';

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
      hasCheckedSchoolBus: false,
      hasShockedEVCharger: false,
      hasClearedDragonRaid: false,
      hasClearedCerberusRaid: false,
      hasClearedClass704: false,
      solvedMoralQuestionIds: [],
      job: null,
      hasEscapedCareerRoom: false,
      careerClues: [false, false, false, false, false, false],
      titles: [],
      equippedTitle: null,
      quests: {},
      juncheolGuestbookNote: '',
      secretHistoryRoomUnlocked: false,
      openedSecretHistoryChest: false,
      hiddenQuestCareer1: null,
      hasHangangwooBookmark: false,
      hiddenQuestCareer2: null,
      inventory: []
    };

    this.ITEM_SELL_PRICES = ITEM_SELL_PRICES;
    this.TITLE_DEFINITIONS = TITLE_DEFINITIONS;
    this.JOB_PASSIVE_DEFINITIONS = JOB_PASSIVE_DEFINITIONS;
    this.CAREER_ESCAPE_CLUES = CAREER_ESCAPE_CLUES;

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

    this.activeBuffs = {};
    this.buffInterval = null;

    this.initControls();
    this.initModals();
    this.initTeacherAdmin();
    this.initQuestTracker();
    this.initServerStatusMonitor();
    this.recalcCombatStats();
  }

  setServerStatus(isOnline) {
    this.isServerOnline = isOnline;
    this.updateServerGateUI();
  }

  initServerStatusMonitor() {
    this.isServerOnline = true;
    // 실시간 서버 상태는 NetworkManager의 Socket.IO 연결/해제 이벤트(connect/disconnect)로 동기화됩니다.
    // 최초 1회 경량 헬스체크만 수행하여 불필요한 전체 학생 데이터 폴링 부하를 제거합니다.
    fetch('/api/health', { method: 'GET', cache: 'no-store' })
      .then(res => {
        this.isServerOnline = res.ok;
        this.updateServerGateUI();
      })
      .catch(() => {
        this.isServerOnline = false;
        this.updateServerGateUI();
      });

    fetch('/api/server-status', { method: 'GET', cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data && typeof data.isOpen === 'boolean') {
          this.onServerStateSync(data);
        }
      })
      .catch(() => {});
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

      // 3v3 Brawl Ball Sliding Tackle
      if (window.BrawlBall && !this.engine.player.noclip && this.engine.player.room === 'playground' && window.BrawlBall.isPlayerInCourt(this.engine.player.x, this.engine.player.y)) {
        window.BrawlBall.tryTackle();
      }

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
      const peModal = document.getElementById('modal-pe-jump-challenge');
      if (peModal && !peModal.classList.contains('hidden')) return;
      if (window.RPGDialog && window.RPGDialog.isOpen) {
        window.RPGDialog.advance();
        return;
      }
      if (window.BrawlBall && window.BrawlBall.tryKick()) {
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

    // Mobile On-Screen Floating A / B Buttons
    const mobileBtnA = document.getElementById('btn-mobile-a');
    const mobileBtnB = document.getElementById('btn-mobile-b');

    if (mobileBtnA) {
      mobileBtnA.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (window.AudioManager) window.AudioManager.playSelect();
        const peModal = document.getElementById('modal-pe-jump-challenge');
        if (peModal && !peModal.classList.contains('hidden')) return;
        if (window.RPGDialog && window.RPGDialog.isOpen) {
          window.RPGDialog.advance();
          return;
        }
        if (window.BrawlBall && window.BrawlBall.tryKick()) {
          return;
        }
        this.engine.interact();
      });
    }

    if (mobileBtnB) {
      mobileBtnB.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.startDash();
      });
      mobileBtnB.addEventListener('pointerup', (e) => {
        e.preventDefault();
        this.stopDash();
      });
      mobileBtnB.addEventListener('pointercancel', (e) => {
        e.preventDefault();
        this.stopDash();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      const arModal = document.getElementById('modal-acid-rain');
      if (arModal && !arModal.classList.contains('hidden')) return;
      const peModal = document.getElementById('modal-pe-jump-challenge');
      if (peModal && !peModal.classList.contains('hidden')) return;
      const uphillModal = document.getElementById('modal-uphill-rush');
      if (uphillModal && !uphillModal.classList.contains('hidden')) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.engine.setDirectionInput('up', true);
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.engine.setDirectionInput('down', true);
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.engine.setDirectionInput('left', true);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.engine.setDirectionInput('right', true);
      if (e.key === 'Shift' || e.key === 'b' || e.key === 'B') {
        this.startDash();
      }
      if (e.key === 'q' || e.key === 'Q') {
        if (window.BrawlBall && this.engine && this.engine.player && this.engine.player.room === 'playground') {
          window.BrawlBall.trySuper();
        }
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (window.RPGDialog && window.RPGDialog.isOpen) {
          window.RPGDialog.advance();
          return;
        }
        if (window.BrawlBall && window.BrawlBall.tryKick()) {
          return;
        }
        this.engine.interact();
      }
    });

    window.addEventListener('keyup', (e) => {
      const uphillModal = document.getElementById('modal-uphill-rush');
      if (uphillModal && !uphillModal.classList.contains('hidden')) return;
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
      this.floorTag.innerText = (loc.floor === 5) ? '5층 (테스트)' : '시즌 1 (v2.0)';
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
    const peModal = document.getElementById('modal-pe-jump-challenge');
    if (peModal && !peModal.classList.contains('hidden')) return;
    const uphillModal = document.getElementById('modal-uphill-rush');
    if (uphillModal && !uphillModal.classList.contains('hidden')) return;
    if (this.playerData && (this.playerData.isFallen || this.playerData.hp <= 0)) {
      this.showToast('💀 기절한 상태에서는 상호작용이나 채집을 할 수 없습니다!', 'error');
      return;
    }
    if (target.type === 'npc') {
      const npc = target.data;
      if (!npc) return;

      // 3층 보건실 보건 선생님
      // 1학년 2반 담임 한강우 선생님 (가죽 골렘 1:1 레이드 & 나무 세트 3종 연화 비책 기믹)
      if (npc.id === 'npc_teacher_kangwoo' || (npc.name && npc.name.includes('한강우'))) {
        this.handleTeacherKangwooInteraction(npc);
        return;
      }

      if (npc.id === 'npc_nurse' || (npc.name && npc.name.includes('보건'))) {
        this.handleNurseInteraction(npc);
        return;
      }

      // 3층 Wee클래스 전문상담 선생님
      if (npc.id === 'npc_counselor_wee' || (npc.name && (npc.name.includes('Wee') || npc.name.includes('상담')))) {
        this.handleWeeCounselorInteraction(npc);
        return;
      }

      // 6층 교무실 14번 좌석 교감선생님 (타임캡슐 2004년 스토리 & 롤링페이퍼 최종 보상)
      if (npc.id === 'npc_teacher_vice_principal' || (npc.name && npc.name.includes('교감'))) {
        this.handleVicePrincipalInteraction(npc);
        return;
      }

      // 6층 복도 동쪽 창가: 진로를 고민하는 학생 (귐즨숑 선생님 연계 NPC)
      if (npc.id === 'npc_student_worried' || (npc.name && npc.name.includes('진로를 고민하는 학생'))) {
        this.handleWorriedStudentInteraction(npc);
        return;
      }

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

      // 1학년 4반 담임 후니후니 선생님
      if (npc.id === 'npc_teacher_moral_drum' || (npc.name && npc.name.includes('후니후니'))) {
        if (window.RPGDialog) {
          window.RPGDialog.show('🥁 후니후니 선생님', npc.dialogue, '🥁');
        } else {
          alert(`💬 [${npc.name}]\n\n"${npc.dialogue}"`);
        }
        return;
      }

      // 1학년 5반 담임 졍경슉 선생님 (신비한 연금술 연구실)
      if (npc.id === 'npc_teacher_kyungsook' || (npc.name && (npc.name.includes('졍경슉') || npc.name.includes('정경숙')))) {
        this.openAlchemyModal();
        return;
      }

      // 6층 교무실 3학년 영어 Joshua 선생님 (입문 퀘스트)
      if (npc.id === 'npc_teacher_joshua' || npc.questId || (npc.name && npc.name.includes('Joshua'))) {
        this.openQuestDispatchModal(npc.questId || 'quest_joshua_intro');
        return;
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
        this.onComputerServerInspected();
        alert('🎛️ [컴퓨터실 메인 서버]\n\n"숭실 인트라넷 전산망 및 정보 실습 시스템이 정상 가동 중입니다. (PING 1ms / 상태: 최적)"');
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
    } else if (target.type === 'history_vitrine') {
      this.handleHistoryVitrineInteraction(target.data || target);
    } else if (target.type === 'history_altar') {
      this.handleHistoryAltarInteraction();
    } else if (target.type === 'history_hall') {
      this.engine.triggerFadeWarp(() => {
        this.engine.warpToRoom('room_history', '🏛️ 숭실역사관 (History Hall)', 15 * 32, 13 * 32);
      });
        } else if (target.type === 'gym_gate') {
      if (!this.playerData.isTeacher) {
        alert('🚫 [교직원 전용 시설 관리 구역]\n\n"🚗 숭실 체육관 및 주차장 구역은 현재 교직원 전용 관리 구역입니다.\n(교사 계정으로 로그인 후 출입할 수 있습니다.)"');
        return;
      }
      this.engine.triggerFadeWarp(() => {
        this.engine.warpToRoom('playground_gym', '🏛️ 숭실 체육관 & 주차장', 50 * 32, 30 * 32);
      });
    } else if (target.type === 'gym_exit_gate') {
      this.engine.triggerFadeWarp(() => {
        this.engine.warpToRoom('playground', '숭실 운동장', 4 * 32, 48 * 32);
      });
    } else if (target.type === 'gym_entrance') {
      if (window.RPGDialog) {
        window.RPGDialog.show('숭실 체육관', '현재 실내 코트는 다음 시즌 업데이트를 위해 시설 정비 중입니다!', '🏛️');
      } else {
        alert('🏛️ [숭실 체육관]\n\n현재 실내 코트는 다음 시즌 업데이트를 위해 시설 정비 중입니다!');
      }
    } else if (target.type === 'gym_pe_teacher') {
      this.handlePETeacherInteraction();
    } else if (target.type === 'gym_guard_teacher') {
      this.handleGuardTeacherInteraction();
    } else if (target.type === 'gym_teacher_car') {
      this.handleTeacherCarEasterEgg();
    } else if (target.type === 'gym_school_bus') {
      this.handleSchoolBusEasterEgg();
    } else if (target.type === 'gym_ev_charger') {
      this.handleEVChargerEasterEgg();
    } else if (target.type === 'cafeteria') {
      this.handleCafeteriaEntranceInteraction();
    } else if (target.type === 'cafeteria_key_safe') {
      this.handleCafeteriaKeySafeInteraction();
    } else if (target.type === 'alchemy_cauldron') {
      this.openAlchemyModal();
    } else if (target.type === 'alchemy_shelf') {
      if (window.RPGDialog) {
        window.RPGDialog.show('🧪 비전 시약 선반', '졍경슉 선생님이 엄선한 신비로운 연금술 시약들이 가지런히 정돈되어 있습니다.\n\n골드의 마력 파동과 공명하여 목재, 허브, 개나리 꽃잎을 완벽하게 재구성할 수 있는 비전 촉매가 푸른빛으로 은은하게 빛납니다.', '🧪');
      } else {
        alert('🧪 [비전 시약 선반]\n\n"졍경슉 선생님이 엄선한 신비로운 연금술 시약들이 보관되어 있습니다. 골드를 목재, 허브, 개나리로 연성할 때 필수적인 촉매들이 은은하게 빛납니다."');
      }
    } else if (target.type === 'alchemy_tome') {
      if (window.RPGDialog) {
        window.RPGDialog.show('📚 연금술 비전서', '『골드는 단순한 재물이 아니라 자연 만물의 근원적인 힘과 연결되어 있다. 순수한 마력의 도가니 속에서 골드는 굳건한 목재가 되고, 싱그러운 생명의 허브가 되며, 영원한 숭실의 개나리 꽃잎으로 승화된다.』\n\n- 1학년 5반 담임 연금술사 졍경슉 선생님 집필 -', '📚');
      } else {
        alert('📚 [연금술 비전서]\n\n"『골드는 자연의 힘과 공명하여 굳건한 목재가 되고, 생명의 허브가 되며, 영원한 개나리 꽃잎이 된다.』\n\n- 1학년 5반 담임 졍경슉 선생님 -');
      }
    } else if (target.type === 'alchemy_workbench') {
      if (window.RPGDialog) {
        window.RPGDialog.show('🔬 정밀 연금술 실험대', '다채로운 화학 유리 플라스크와 증류관, 보랏빛 룬 마력 수정구가 정밀하게 연결되어 있습니다.\n\n불꽃 위에서 보글보글 거품을 내며 순수한 황금 파편이 자연 원소로 분해·재조합되는 신비한 연금과학의 현장입니다.', '🔬');
      } else {
        alert('🔬 [정밀 연금술 실험대]\n\n"유리 플라스크와 증류관, 보랏빛 룬 수정구가 반응하며 순수한 황금이 자연의 원소로 연성되는 과학 실험대입니다."');
      }
    } else if (target.type === 'store') {
      this.openStoreModal();
    } else if (target.type === 'title_exchange') {
      this.openTitleExchangeModal();
    } else if (target.type === 'secret_locker') {
      this.handleSecretLocker();
    } else if (target.type === 'career_clue') {
      this.handleCareerClueInteraction(target.data);
    } else if (target.type === 'career_exit_keypad') {
      this.openCareerKeypadModal();
    } else if (target.type === 'brawl_coach') {
      if (window.BrawlBall) {
        window.BrawlBall.openQueueModal();
      }
    } else if (target.type === 'moral_desk' || target.type === 'moral_board') {
      this.handleMoralClassroomInteraction();
    } else if (target.type === 'drum_kit') {
      this.handleDrumKitInteraction(target);
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
    } else if (target.type === 'recycle_bin') {
      this.handleRecycleBinInteraction();
    } else if (target.type === 'time_capsule') {
      this.handleTimeCapsuleInteraction();
    } else if (target.type === 'capsule_clue') {
      this.handleCapsuleClue(target.data || target);
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
    } else if (target.type === 'dev_note_2') {
      this.handleDevNote2Interaction();
    } else if (target.type === 'dev_note_3') {
      this.handleDevNote3Interaction();
    } else if (target.type === 'dev_note_4') {
      this.handleDevNote4Interaction();
    } else if (target.type === 'quest_memo') {
      this.handleQuestMemoPickup(target.data || target);
    } else if (target.type === 'quest_okchohan_book') {
      this.handleQuestSocialBookPickup(target.data || target);
    } else if (target.type === 'quest_kimmijin_book') {
      this.handleQuestSketchbookPickup(target.data || target);
    } else if (target.type === 'quest_yosunyu_usb') {
      this.handleQuestUsbPickup(target.data || target);
    } else if (target.type === 'quest_career_book') {
      this.handleQuestCareerBookPickup(target.data || target);
    } else if (target.type === 'desk_juncheol') {
      this.handleJuncheolDeskInteraction();
    } else if (target.type === 'desk_sangdae') {
      this.handleSangdaeDeskInteraction();
    } else if (target.type === 'desk_hangangwoo') {
      this.handleHangangwooDeskInteraction();
    } else if (target.type === 'desk_career_counsel_1') {
      this.handleCareerCounsel1Interaction();
    } else if (target.type === 'desk_career_counsel_2') {
      this.handleCareerCounsel2Interaction();
    } else if (target.type === 'desk_kyungsuk') {
      this.handleKyungsukDeskInteraction();
    } else if (target.type === 'desk_hunihuni') {
      this.handleHunihuniDeskInteraction();
    } else if (target.type === 'wisdom_book') {
      this.handleWisdomBookInteraction();
    } else if (target.type === 'library_reading_desk') {
      this.handleLibraryReadingDeskInteraction();
    } else if (target.type === 'library_pc') {
      this.handleLibraryPcInteraction();
    } else if (target.type === 'bookshelf_lit') {
      this.handleBookshelfLitInteraction();
    } else if (target.type === 'bookshelf_sci') {
      this.handleBookshelfSciInteraction();
    } else if (target.type === 'bookshelf_eng') {
      this.handleBookshelfEngInteraction();
    } else if (target.type === 'bookshelf_his') {
      this.handleBookshelfHisInteraction();
    } else if (target.type === 'bookshelf_art') {
      this.handleBookshelfArtInteraction();
    } else if (target.type === 'bookshelf_mag') {
      this.handleBookshelfMagInteraction();
    } else if (target.type === 'bookshelf_comic') {
      this.handleBookshelfComicInteraction();
    } else if (target.type === 'library_dibut') {
      this.handleLibraryDibutInteraction();
    } else if (target.type === 'quest_library_book_pg') {
      this.handleLibraryBookPickup('pg');
    } else if (target.type === 'quest_library_book_of') {
      this.handleLibraryBookPickup('of');
    } else if (target.type === 'quest_library_book_hi') {
      this.handleLibraryBookPickup('hi');
    } else if (target.type === 'door_secret_history') {
      this.handleSecretHistoryDoor();
    } else if (target.type === 'chest_secret_history') {
      this.handleSecretHistoryChest();
    } else if (target.type === 'secret_history_book') {
      this.handleSecretHistoryBook(target.data || target);
    } else if (target.type === 'health_bed') {
      this.handleHealthBedInteraction(target.data || target);
    } else if (target.type === 'health_cabinet') {
      this.handleHealthCabinetInteraction();
    } else if (target.type === 'health_scale') {
      this.handleHealthScaleInteraction();
    } else if (target.type === 'health_eye_chart') {
      this.handleHealthEyeChartInteraction();
    } else if (target.type === 'health_board') {
      this.handleHealthBoardInteraction();
    } else if (target.type === 'wee_cushion_lounge') {
      this.handleWeeCushionInteraction();
    } else if (target.type === 'wee_tea_table') {
      this.handleWeeTeaTableInteraction();
    } else if (target.type === 'wee_mailbox') {
      this.handleWeeMailboxInteraction();
    } else if (target.type === 'wee_emotion_board') {
      this.handleWeeEmotionBoardInteraction();
    }
  }

  // =========================================================================
  // 🏥 3층 보건실 & 🕊️ Wee클래스 상호작용
  // =========================================================================

  // 1. 보건실 회복 침대 (HP 100% 완전 회복)
  handleHealthBedInteraction(target) {
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }
    const maxHp = this.playerData.maxHp || 100;
    const wasFull = (this.playerData.hp >= maxHp);

    this.playerData.hp = maxHp;
    this.playerData.isFallen = false;
    this.saveProgress();
    this.updateHUD();

    if (window.AudioManager && typeof window.AudioManager.playLevelUp === 'function') {
      window.AudioManager.playLevelUp();
    }

    if (this.engine && typeof this.engine.addFloatingText === 'function') {
      this.engine.addFloatingText('❤️ HP 100% FULL RECOVERY! ✨', this.engine.player.x, this.engine.player.y - 25, '#22c55e');
    }

    if (wasFull) {
      this.showToast('🛏️ 보건실 포근한 침대에서 잠시 눈을 붙였습니다. 컨디션 최고! ✨', 'info');
    } else {
      this.showToast('🛏️ 보건실 침대에서 푹 쉬어 체력이 100% 완전 회복되었습니다! (HP 완충) ❤️', 'success');
    }
  }

  // 2. 응급 구급약 & 약초 캐비닛 (비상 물약/허브 지급)
  handleHealthCabinetInteraction() {
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }

    if (!this.playerData.healthCabinetClaimed) {
      this.playerData.healthCabinetClaimed = true;
      this.addItem('item_red_potion', '빨간 물약', 1, '🧪', { type: 'consumable', effect: 'HP +10 회복' });
      this.addItem('item_herb', '향긋한 허브', 2, '🌿', { type: 'material', effect: '물약 및 허브티 제작 재료' });
      this.saveProgress();

      if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
        window.AudioManager.playFanfare();
      }

      const msg = "💊 [응급 구급약 & 약초 캐비닛]\n\n소독약, 멸균 붕대, 해열 진통제와 깨끗하게 건조된 약초들이 가지런히 정리되어 있습니다.\n\n비상 응급용으로 [🧪 빨간 물약 1개]와 [🌿 향긋한 허브 2개]를 챙겼습니다!\n\n(가방(🎒)에 안전하게 보관되었습니다.)";
      if (window.RPGDialog) {
        window.RPGDialog.show('💊 보건실 구급약장', msg, '💊');
      } else {
        alert(msg);
      }
    } else {
      const msg = "💊 [응급 구급약 & 약초 캐비닛]\n\n상처 소독약, 멸균 거즈, 체온계와 비상약들이 상시 구비되어 있습니다.\n\n\"몸이 아프거나 다쳤을 때는 언제든 보건 선생님께 말씀드리세요!\"";
      if (window.RPGDialog) {
        window.RPGDialog.show('💊 보건실 구급약장', msg, '💊');
      } else {
        alert(msg);
      }
    }
  }

  // 3. 자동 신장·체중 측정기
  handleHealthScaleInteraction() {
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }
    const msg = "⚖️ [자동 신장·체중 측정기]\n\n삑-! 측정이 정확하게 완료되었습니다.\n\n• 신장(키): 173.5 cm\n• 체중: 58.6 kg\n• 체질량 지수(BMI): 19.5 (정상/건강 표준 체형)\n• 신체 활력도: 최상 (S등급)\n\n💡 보건 팁: '청소년기 규칙적인 스트레칭과 균형 잡힌 학교 급식은 건강한 성장의 지름길입니다!'";
    if (window.RPGDialog) {
      window.RPGDialog.show('⚖️ 신체 검사 측정기', msg, '⚖️');
    } else {
      alert(msg);
    }
  }

  // 4. 한미 시력 검사표
  handleHealthEyeChartInteraction() {
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }
    const msg = "👁️ [한미 시력 검사표]\n\n숟가락 가리개로 한쪽 눈을 가리고 측정합니다...\n\n• 좌안(왼쪽 눈): 1.5 🟢\n• 우안(오른쪽 눈): 1.5 🟢\n• 판정: 맑고 선명한 독수리의 눈빛! 🦅\n\n💡 눈 건강 팁: '스마트폰이나 디벗 화면을 50분 본 뒤에는 창밖의 먼 산이나 푸른 나무를 1분간 바라보며 눈 근육을 풀어주세요!'";
    if (window.RPGDialog) {
      window.RPGDialog.show('👁️ 시력 검사표', msg, '👁️');
    } else {
      alert(msg);
    }
  }

  // 5. 3층 건강·마음 힐링 게시판
  handleHealthBoardInteraction() {
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }
    const msg = "📋 [3층 건강 증진 & 마음 힐링 게시판]\n\n1. 올바른 손 씻기 6단계: 흐르는 물에 비누로 30초 이상 뽀득뽀득!\n2. 기침 예절: 기침할 땐 손이 아닌 옷소매 안쪽으로 가리기\n3. 하루 수분 섭취: 복도 정수기 물 8잔(1.5L) 이상 마시기\n4. 마음 건강: 힘든 고민이 있을 땐 혼자 끙끙 앓지 말고 Wee클래스 문을 두드리세요. 💖";
    if (window.RPGDialog) {
      window.RPGDialog.show('📋 3층 힐링 게시판', msg, '📋');
    } else {
      alert(msg);
    }
  }

  // 1학년 2반 담임 한강우 선생님 (가죽 골렘 1:1 상시 레이드 안내 & 나무 세트 3종 연화 비책 기믹)
  handleTeacherKangwooInteraction(npc) {
    const isWoodSwordEquipped = this.isItemEquipped('equip_wood_sword');
    const isWoodHelmetEquipped = this.isItemEquipped('equip_wood_helmet');
    const isWoodArmorEquipped = this.isItemEquipped('equip_wood_armor');
    const isFullWoodSet = isWoodSwordEquipped && isWoodHelmetEquipped && isWoodArmorEquipped;

    const hasScroll = this.hasItem('item_golem_weakness_scroll') || (this.playerData && this.playerData.inventory && this.playerData.inventory['item_golem_weakness_scroll'] > 0);

    if (isFullWoodSet) {
      if (!hasScroll) {
        this.addItem('item_golem_weakness_scroll', '📜 한강우의 골렘 연화 비책', 1, '📜', {
          type: 'quest',
          effect: '나무 세트 3종 착용 제자에게 전수된 비책 · 가죽 골렘 1:1 레이드 시 골렘 체력 50% 반감 (2,000 HP ➔ 1,000 HP)'
        });
        this.saveProgress(true);

        const title = '👨‍🏫 한강우 선생님';
        const msg = `오! 자네는 1-1반에서 직접 목재를 수집해 목검, 목제 투구, 목제 흉갑까지 [나무 세트 3종]을 완벽하게 착용했군! 👏\n\n기본기를 충실히 닦은 자만이 거목의 영혼과 공명할 수 있는 법이지. 옛 고서에서 전해 내려오는 이 [📜 골렘 연화 비책]을 자네에게 전수하겠네!\n\n✨ [비책 효과]\n이 비책을 품고 1-2반으로 들어가 [🪵 가죽 골렘]과 1:1 결투를 치르면, 골렘의 거친 외피가 부드럽게 연화되어 최대 체력이 절반(2,000 HP ➔ 1,000 HP)으로 대폭 줄어든단다!\n\n어서 2반 문을 열고 들어가 1:1 레이드에서 승리를 쟁취해보렴!`;
        if (window.RPGDialog) {
          window.RPGDialog.show(title, msg, '👨‍🏫');
        } else {
          alert(`💬 [${title}]\n\n${msg}`);
        }
        if (typeof this.showItemToast === 'function') {
          this.showItemToast('📜 [한강우의 골렘 연화 비책] 획득! (가죽 골렘 체력 50% 반감)');
        }
      } else {
        const title = '👨‍🏫 한강우 선생님';
        const msg = `자네가 품고 있는 [📜 한강우의 골렘 연화 비책]이 이미 1-2반 가죽 골렘의 거친 기운을 절반(1,000 HP)으로 약화시키고 있단다!\n\n나무 세트 3종을 갖춘 자네의 실력이라면 충분히 승리할 수 있을 걸세. 1-2반 교실로 들어가 당당하게 1:1 레이드에 도전해보렴!`;
        if (window.RPGDialog) {
          window.RPGDialog.show(title, msg, '👨‍🏫');
        } else {
          alert(`💬 [${title}]\n\n${msg}`);
        }
      }
      return;
    }

    // Wood set is NOT fully equipped:
    const hasSwordInInv = this.hasItem('equip_wood_sword');
    const hasHelmetInInv = this.hasItem('equip_wood_helmet');
    const hasArmorInInv = this.hasItem('equip_wood_armor');
    const ownsAllThree = hasSwordInInv && hasHelmetInInv && hasArmorInInv;

    const title = '👨‍🏫 한강우 선생님';
    let msg = `안녕! 1학년 2반 담임 한강우 선생님이란다. 👨‍🏫\n\n🪵 [1-2반 1:1 가죽 골렘 레이드 상시 개방]\n이 2반 문으로 들어가면 1차 관문 보스 '가죽 골렘'과 언제든 1:1 단판 승부를 겨룰 수 있단다!\n\n`;

    if (ownsAllThree) {
      msg += `💡 [선생님의 조언: 장비 착용 필요!]\n가방을 보니 나무검, 나무투구, 나무갑옷을 모두 제작해 두었구나!\n하지만 아직 직접 몸에 [착용]하지 않았단다.\n\n우측 가방(🎒)을 열어 3개 장비를 모두 착용한 상태로 나에게 다시 말을 걸면, 골렘의 체력을 절반으로 깎아주는 특수 비책을 전수해주마!`;
    } else {
      msg += `⚔️ [특별 공략 기믹: 골렘 연화 비책]\n가죽 골렘의 체력(2,000 HP)이 너무 단단해 버겁다면... 1-1반 교실 화단과 복도에서 목재를 모아 [나무검], [나무투구], [나무갑옷] (나무 세트 3종)을 모두 제작하여 직접 [착용]한 뒤 나를 찾아오렴!\n골렘의 체력을 50% 줄여주는 [📜 골렘 연화 비책]을 전수해 주겠네!\n\n🐲 [청동 드래곤 출현]\n참고로 2차 보스인 '고대 청동 드래곤'은 운동장 넓은 천연잔디 축구장으로 이동했단다! 골렘을 쓰러뜨리고 엘리베이터를 개방해 축구장으로 진출해보렴!`;
    }

    if (window.RPGDialog) {
      window.RPGDialog.show(title, msg, '👨‍🏫');
    } else {
      alert(`💬 [${title}]\n\n${msg}`);
    }
  }

  // 1897 헤리티지 세트 착용 검증 (무기는 컴싸봉으로 대체 가능)
  is1897HeritageSetEquipped(allowOmrWand = true) {
    const isHelm = this.isItemEquipped('equip_heritage_helmet');
    const isArmor = this.isItemEquipped('equip_heritage_armor');
    const isBoots = this.isItemEquipped('equip_heritage_boots');
    const isBlade = this.isItemEquipped('equip_heritage_blade');
    const isOmr = !!(allowOmrWand && this.isItemEquipped('equip_omr_wand'));
    const isWep = isBlade || isOmr;
    const isComplete = isHelm && isArmor && isBoots && isWep;
    const weaponName = isOmr ? '컴싸 마법봉' : (isBlade ? '1897 숭실 헤리티지 블레이드' : null);
    return { isComplete, isHelm, isArmor, isBoots, isWep, isOmr, isBlade, weaponName };
  }

  // 6층 교무실 소회의실: 급식실 열쇠 획득 퀘스트 보관함 상호작용
  handleCafeteriaKeySafeInteraction() {
    const pLevel = (this.playerData && this.playerData.level) || 1;
    const isTeacher = !!(this.playerData && this.playerData.isTeacher);

    // 1. 레벨 12 미만 차단
    if (pLevel < 12 && !isTeacher) {
      const msg = `🚫 [소회의실 비밀 보관함 - 접근 제한]\n\n"이 고대 보관함은 12레벨 이상의 모범 학생 전용입니다!\n\n• 현재 레벨: Lv.${pLevel}\n• 필요 레벨: Lv.12 이상\n\n모험을 더 진행하여 12레벨을 달성한 뒤 다시 조사해주세요."`;
      if (window.RPGDialog) {
        window.RPGDialog.show('🚫 접근 제한', msg, '🔒');
      } else {
        alert(msg);
      }
      return;
    }

    // 2. 이미 열쇠 획득 여부
    const hasKey = this.hasItem('item_cafeteria_key') || (this.playerData && this.playerData.hasCafeteriaKey);
    if (hasKey) {
      const msg = `🗝️ [소회의실 비밀 보관함]\n\n"보관함 안쪽은 이미 비어 있습니다.\n\n획득하신 [🔑 급식실 열쇠]를 소지하고 운동장 북동쪽의 [학생 급식실] 정문으로 이동하세요!"`;
      if (window.RPGDialog) {
        window.RPGDialog.show('🗝️ 소회의실 문서 보관함', msg, '🔑');
      } else {
        alert(msg);
      }
      return;
    }

    // 3. 1897 세트 착용 검증 (무기는 컴싸봉 대체 가능)
    const check = this.is1897HeritageSetEquipped(true);

    if (!check.isComplete) {
      const statusLines = [
        `• 투구: ${check.isHelm ? '✅ [착용 중] 1897 숭실 헤리티지 투구' : '❌ [미착용] 1897 숭실 헤리티지 투구 필요'}`,
        `• 갑옷: ${check.isArmor ? '✅ [착용 중] 1897 숭실 헤리티지 갑옷' : '❌ [미착용] 1897 숭실 헤리티지 갑옷 필요'}`,
        `• 신발: ${check.isBoots ? '✅ [착용 중] 1897 숭실 헤리티지 부츠' : '❌ [미착용] 1897 숭실 헤리티지 부츠 필요'}`,
        `• 무기: ${check.isWep ? `✅ [착용 중] ${check.weaponName}` : '❌ [미착용] 1897 숭실 헤리티지 블레이드 또는 컴싸 마법봉 필요'}`
      ].join('\n');

      const msg = `🔒 [봉인된 문서 보관함 - 1897 숭실의 문양]\n\n보관함 전면에 1897년 평양 숭실학당의 고대 문양이 마법 결계로 붉게 빛나고 있습니다!\n\n"오직 숭실의 역사와 사명을 온전히 계승한 자(1897 헤리티지 4종 풀세트 착용자)만이 이 보관함을 열 수 있다."\n(※ 무기는 전설의 '컴싸 마법봉'으로 대체 가능합니다!)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 [현재 1897 장비 착용 검증]:\n${statusLines}\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n💡 힌트: 역사관 제단 제작 및 보스 레이드에서 획득한 1897 장비를 가방(I)에서 모두 [착용]한 후 다시 조사하세요!`;

      if (window.RPGDialog) {
        window.RPGDialog.show('🔒 봉인된 문서 보관함', msg, '🔒');
      } else {
        alert(msg);
      }
      return;
    }

    // 4. 모든 조건 충족: 급식실 열쇠 획득!
    this.playerData.hasCafeteriaKey = true;
    this.addItem('item_cafeteria_key', '급식실 열쇠', 1, '🔑', {
      type: 'quest',
      effect: '12레벨 이상 모범 학생 급식실 정문 출입용 황금 열쇠'
    });
    this.saveProgress(true);

    if (window.AudioManager) {
      if (typeof window.AudioManager.playFanfare === 'function') {
        window.AudioManager.playFanfare();
      } else if (typeof window.AudioManager.playLevelUp === 'function') {
        window.AudioManager.playLevelUp();
      }
    }

    const usedWep = check.isOmr ? '전설의 컴싸 마법봉' : '1897 숭실 헤리티지 블레이드';
    const successMsg = `✨ [1897 숭실 헤리티지 결계 해제!]\n\n착용 중인 1897 헤리티지 장비(투구·갑옷·부츠 및 ${usedWep})가 보관함의 고대 문양과 장엄하게 공명합니다!\n\n"철컥! 찰칵!"\n\n육중한 잠금장치가 해제되며, 안쪽에서 찬란하게 빛나는 [🔑 급식실 열쇠]를 발견했습니다!\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n🔑 [획득 아이템] 급식실 열쇠 x1\n• 용도: 12레벨 이상 학생 급식실 정문 개방\n• 위치: 야외 운동장 북동쪽 (중앙 엘리베이터 우측)\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"숭실의 진정한 용사여, 이제 운동장의 학생 급식실로 당당히 나아가세요!"`;

    if (window.RPGDialog) {
      window.RPGDialog.show('✨ 급식실 열쇠 획득!', successMsg, '🔑');
    } else {
      alert(successMsg);
    }
    this.showToast('✨ [입장 퀘스트 완료] 1897 세트 공명으로 [급식실 열쇠]를 획득했습니다!', 'success');
  }

  // 야외 운동장: 학생 급식실 정문 상호작용 (12레벨 이상 & 급식실 열쇠 검증)
  handleCafeteriaEntranceInteraction() {
    const pLevel = (this.playerData && this.playerData.level) || 1;
    const isTeacher = !!(this.playerData && this.playerData.isTeacher);
    const hasKey = this.hasItem('item_cafeteria_key') || (this.playerData && this.playerData.hasCafeteriaKey);

    // 1. 레벨 12 미만인 경우
    if (pLevel < 12 && !isTeacher) {
      const msg = `🚫 [학생 급식실 - 12레벨 출입 제한]\n\n"학생 급식실은 철저한 위생 관리와 영양 관리를 위해 12레벨 이상의 모범 학생만 입장할 수 있습니다!\n\n• 현재 레벨: Lv.${pLevel}\n• 필요 레벨: Lv.12 이상\n\n더 많은 퀘스트와 몬스터 토벌을 통해 12레벨을 달성하고 다시 찾아오세요!"`;
      if (window.RPGDialog) {
        window.RPGDialog.show('🚫 학생 급식실 입장 불가', msg, '🍱');
      } else {
        alert(msg);
      }
      return;
    }

    // 2. 12레벨 이상이지만 열쇠가 없는 경우
    if (!hasKey && !isTeacher) {
      const msg = `🔒 [학생 급식실 - 정문 잠김]\n\n"철컥... 급식실 정문이 굳게 잠겨 있습니다!\n\n출입하려면 전용 [🔑 급식실 열쇠]가 필요합니다.\n\n📜 [입장 퀘스트 힌트]:\n6층 교무실 서쪽의 [소회의실(Lv.12+)]에 봉인된 비밀 보관함이 있습니다.\n1897 헤리티지 세트(무기는 컴싸 마법봉 대체 가능)를 풀착용하고 조사하면 급식실 열쇠를 획득할 수 있습니다!"`;
      if (window.RPGDialog) {
        window.RPGDialog.show('🔒 급식실 열쇠 필요', msg, '🔑');
      } else {
        alert(msg);
      }
      return;
    }

    // 3. 12레벨 이상이며 열쇠 보유 완료!
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }
    const welcomeMsg = `🍱 [학생 급식실 - 정문 개방 성공!]\n\n"철컥! 🔑 [급식실 열쇠]가 자물쇠에 꼭 들어맞으며 육중한 자동문이 경쾌한 멜로디와 함께 활짝 열립니다!"\n\n따끈따끈하고 맛있는 점심 식사의 고소한 냄새가 코끝을 스칩니다.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎉 12레벨 급식실 입장 퀘스트 완료!\n✨ 학생 급식실 내부 공간 및 대규모 급식 콘텐츠가 곧 오픈됩니다!\n━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    if (window.RPGDialog) {
      window.RPGDialog.show('🍱 학생 급식실 입장 성공!', welcomeMsg, '🎉');
    } else {
      alert(welcomeMsg);
    }
    this.showToast('🍱 [급식실 열쇠 사용!] 학생 급식실 정문이 활짝 열렸습니다!', 'success');
  }

  // 6. 보건 선생님 대화 & 퀴즈
  handleNurseInteraction(npc) {
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }

    const curHp = this.playerData.hp || 0;
    const maxHp = this.playerData.maxHp || 100;

    let greeting = `"안녕 학생! 어디 다치거나 아픈 곳은 없니? 🩺\n\n숭실의 교정을 탐험할 때도 건강과 안전이 언제나 최우선이란다!\n\n`;
    if (curHp < maxHp) {
      greeting += `지금 체력이 ${curHp}/${maxHp}로 지쳐 보이는구나. 보건실 침대에 누워 잠시 쉬면 체력이 100% 완전 회복된단다!\n\n`;
    }
    greeting += `간단한 건강 영단어 퀴즈를 풀어볼래? 맞히면 응급 물약을 선물로 줄게!"`;

    const dialog = window.RPGDialog;
    if (dialog) {
      dialog.confirm(
        '🩺 보건 선생님',
        greeting,
        '🩺',
        () => {
          this.openNurseQuiz();
        },
        () => {},
        '🩺 건강 영단어 퀴즈 풀기',
        '다음에 하기'
      );
    } else {
      if (confirm(greeting)) {
        this.openNurseQuiz();
      }
    }
  }

  openNurseQuiz() {
    const q = {
      title: '🩺 보건 상식 영어 퀴즈',
      question: '상처가 났을 때 감염을 막고 지혈하기 위해 환부에 감는 \'붕대\'를 뜻하는 영어 단어는 무엇일까요?\n\n💡 힌트: B로 시작하는 7글자 의료 용품입니다!',
      options: ['Blanket (담요)', 'Bridge (다리)', 'Bandage (붕대)', 'Basket (바구니)'],
      answer: 'Bandage (붕대)'
    };

    const promptText = `${q.question}\n\n1. ${q.options[0]}\n2. ${q.options[1]}\n3. ${q.options[2]}\n4. ${q.options[3]}`;
    const ans = prompt(promptText, '3');
    if (ans === '3' || (ans && ans.toLowerCase().includes('bandage'))) {
      if (window.AudioManager && typeof window.AudioManager.playCorrect === 'function') {
        window.AudioManager.playCorrect();
      }
      this.addItem('item_red_potion', '빨간 물약', 2, '🧪', { type: 'consumable', effect: 'HP +10 회복' });
      this.addExp(80);
      this.saveProgress();
      this.showToast('🎉 정답입니다! [🧪 빨간 물약 2개]와 80 EXP를 획득했습니다!', 'success');
    } else if (ans !== null) {
      if (window.AudioManager && typeof window.AudioManager.playWrong === 'function') {
        window.AudioManager.playWrong();
      }
      this.showToast('아쉽네요! 정답은 Bandage (붕대)였습니다. 다음에 다시 도전해보세요!', 'warning');
    }
  }

  // 7. Wee클래스 토닥토닥 힐링 쿠션 & 빈백 라운지
  handleWeeCushionInteraction() {
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }
    const maxHp = this.playerData.maxHp || 100;
    this.playerData.hp = Math.min(maxHp, this.playerData.hp + 20);
    this.saveProgress();
    this.updateHUD();

    if (this.engine && typeof this.engine.addFloatingText === 'function') {
      this.engine.addFloatingText('💖 마음의 평온 (+20 HP) ✨', this.engine.player.x, this.engine.player.y - 25, '#f472b6');
    }

    const msg = "🧸 [토닥토닥 힐링 쿠션 & 빈백 라운지]\n\n폭신하고 큼직한 빈백 쿠션에 온몸을 깊숙이 파묻고 곰인형을 안은 채 눈을 감습니다.\n(3초간 깊게 심호흡... 들이마시고... 내쉬고...)\n\n가슴속을 짓누르던 스트레스와 긴장감이 봄눈 녹듯 사르르 풀려납니다... ☁️💖\n\n[효과]: 마음의 평온 상태 달성! (체력 +20 회복!)";
    if (window.RPGDialog) {
      window.RPGDialog.show('🧸 토닥토닥 힐링 라운지', msg, '🧸');
    } else {
      alert(msg);
    }
  }

  // 8. 따뜻한 캐모마일 허브차 테이블
  handleWeeTeaTableInteraction() {
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }
    const maxHp = this.playerData.maxHp || 100;
    this.playerData.hp = Math.min(maxHp, this.playerData.hp + 15);
    this.saveProgress();
    this.updateHUD();

    if (this.engine && typeof this.engine.addFloatingText === 'function') {
      this.engine.addFloatingText('🫖 따뜻한 차 한 모금 (+15 HP) 🍵', this.engine.player.x, this.engine.player.y - 25, '#f59e0b');
    }

    const msg = "🫖 [따뜻한 캐모마일 허브차]\n\n상담 선생님께서 은은한 사과 향이 감도는 따뜻한 캐모마일 차를 찻잔에 따라주셨습니다.\n\n조심스레 한 모금 마시자 향긋한 온기가 온몸 구석구석 퍼져나갑니다. 🍵\n\n\"몸도 마음도 따뜻해졌으니, 남은 하루도 힘차게 보낼 수 있을 것 같습니다!\"\n(체력 +15 회복)";
    if (window.RPGDialog) {
      window.RPGDialog.show('🫖 따뜻한 허브차 테이블', msg, '🫖');
    } else {
      alert(msg);
    }
  }

  // 9. 익명 고민 & 따뜻한 응원 우체통
  handleWeeMailboxInteraction() {
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }
    const notes = [
      "💌 \"시험 점수가 조금 아쉽더라도 너무 자책하지 마. 네가 흘린 땀방울과 노력은 절대 사라지지 않고 더 큰 너를 만드는 밑거름이 될 거야!\" - 3학년 선배가",
      "💌 \"친구와 다퉈서 마음이 무거웠는데, 먼저 솔직하게 '미안해'라고 말했더니 더 단단한 우정이 되었어. 용기를 내봐!\" - 2학년 친구가",
      "💌 \"내가 어떤 사람이 될지 아직 몰라도 괜찮아. 지금 매일 성실하게 배우고 성장하는 너의 모습 그 자체로 이미 충분히 빛나고 있어. 🌟\" - 숭실 교직원 일동"
    ];
    const chosenNote = notes[Math.floor(Math.random() * notes.length)];
    const msg = `📬 [익명 고민 & 따뜻한 응원 우체통]\n\n우체통 안에서 숭실 친구들과 선배들이 남긴 따뜻한 손편지 하나를 꺼내 읽었습니다.\n\n${chosenNote}\n\n(마음 한구석이 뭉클해지며 새로운 용기가 솟아납니다!)`;
    if (window.RPGDialog) {
      window.RPGDialog.show('📬 마음 우체통', msg, '📬');
    } else {
      alert(msg);
    }
  }

  // 10. 오늘 나의 감정 날씨판
  handleWeeEmotionBoardInteraction() {
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }
    const dialog = window.RPGDialog;
    const msg = "🌈 [오늘 나의 감정 날씨판]\n\n오늘 당신의 마음 날씨는 어떤가요?\n현재 자신의 감정을 들여다보고 스스로를 다독여주세요.\n\n1. ☀️ 맑음 (에너지 넘치고 활기참!)\n2. ⛅ 구름 (차분하고 생각이 많음)\n3. 🌧️ 비 (조금 지치고 위로가 필요함)\n4. 🌈 무지개 (희망차고 가슴 설렘!)";

    const promptAns = prompt(`${msg}\n\n번호(1~4)를 입력하세요:`, '1');
    if (!promptAns) return;

    let response = "";
    if (promptAns.trim() === '1') {
      response = "☀️ [오늘의 마음 날씨: 맑음!]\n\n반짝이는 햇살처럼 긍정적인 에너지가 가득하군요! 오늘 만나는 친구들에게도 당신의 밝은 미소를 나누어주세요! 😊✨";
    } else if (promptAns.trim() === '2') {
      response = "⛅ [오늘의 마음 날씨: 구름]\n\n구름이 낀 날은 나 자신을 차분하게 돌아보기에 가장 좋은 날이랍니다. 조급해하지 말고 나만의 페이스대로 걸어가세요! 🌿";
    } else if (promptAns.trim() === '3') {
      response = "🌧️ [오늘의 마음 날씨: 비]\n\n비가 내리는 날이 있어야 메마른 땅에 꽃이 피어난답니다. 오늘 하루 고생 많았어요. 잠시 쉬어가도 괜찮아요, 토닥토닥... 💖";
    } else {
      response = "🌈 [오늘의 마음 날씨: 무지개]\n\n비 온 뒤에 뜨는 영롱한 무지개처럼 기분 좋은 설렘이 가득하네요! 당신의 소중한 꿈을 향해 멋지게 도약해보세요! 🚀";
    }

    if (dialog) {
      dialog.show('🌈 감정 날씨판', response, '🌈');
    } else {
      alert(response);
    }
  }

  // 11. Wee클래스 전문상담 선생님
  handleWeeCounselorInteraction(npc) {
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }
    const msg = `"안녕 학생! Wee클래스에 잘 왔단다. 🕊️\n\n학교생활을 하다 보면 학업, 교우 관계, 진로 때문에 마음이 무겁고 지칠 때가 있지.\n\n언제든 기댈 곳이 필요하거나 따뜻한 대화가 고플 땐 주저 말고 찾아오렴. 너의 이야기는 항상 비밀이 보장되고, 온 마음을 다해 들어줄게.\n\n폭신한 빈백에 기대어 잠시 쉬어가거나 따뜻한 허브차 한 잔 마시고 가렴! 💖"`;
    if (window.RPGDialog) {
      window.RPGDialog.show('🕊️ Wee클래스 전문상담 선생님', msg, '🕊️');
    } else {
      alert(msg);
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

  // =========================================================================
  // 🌟 5층 진로 방탈출 시스템 & 6대 직업 패시브 아카데미
  // =========================================================================
  handleCareerClueInteraction(clueData) {
    if (!clueData) return;
    const clueIndex = clueData.clueIndex || 1;
    const clue = this.CAREER_ESCAPE_CLUES.find(c => c.index === clueIndex) || this.CAREER_ESCAPE_CLUES[0];
    const isAlreadyFound = !!(this.playerData.careerClues && this.playerData.careerClues[clueIndex - 1]);

    const modal = document.getElementById('modal-career-clue');
    if (!modal) return;

    const titleEl = document.getElementById('career-clue-title');
    const descEl = document.getElementById('career-clue-desc');
    const optsEl = document.getElementById('career-clue-options');
    const feedEl = document.getElementById('career-clue-feedback');
    const feedTextEl = document.getElementById('career-clue-feedback-text');
    const btnConfirm = document.getElementById('btn-confirm-career-clue');
    const btnCloseX = document.getElementById('btn-close-career-clue-x');

    if (titleEl) titleEl.innerText = clue.title;
    if (descEl) descEl.innerHTML = clue.question.replace(/\n/g, '<br>');
    if (feedEl) feedEl.classList.add('hidden');

    if (btnCloseX && !btnCloseX._bound) {
      btnCloseX._bound = true;
      btnCloseX.addEventListener('click', () => modal.classList.add('hidden'));
    }
    if (btnConfirm && !btnConfirm._bound) {
      btnConfirm._bound = true;
      btnConfirm.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (optsEl) {
      optsEl.innerHTML = '';
      if (isAlreadyFound) {
        if (feedEl && feedTextEl) {
          feedEl.classList.remove('hidden');
          feedEl.style.borderColor = '#22c55e';
          feedEl.style.background = '#f0fdf4';
          feedTextEl.innerHTML = `✨ <b>[해독 완료]</b> 이미 이 단서를 완벽하게 풀었습니다!<br><span style="font-size:16px; color:#15803d; font-weight:900;">획득한 알파벳: [ ${clue.letter} ]</span>`;
        }
      } else {
        clue.options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'btn-primary';
          btn.style.cssText = 'width: 100%; font-size: 13px; font-weight: 800; padding: 10px 4px; background: #0284c7; border-color: #0369a1; text-align: center;';
          btn.innerText = opt;
          btn.addEventListener('click', () => {
            const isCorrect = (opt === clue.answer);
            if (isCorrect) {
              if (window.AudioManager && typeof window.AudioManager.playCorrect === 'function') {
                window.AudioManager.playCorrect();
              }
              if (!Array.isArray(this.playerData.careerClues)) {
                this.playerData.careerClues = [false, false, false, false, false, false, false, false];
              }
              this.playerData.careerClues[clueIndex - 1] = true;
              this.saveProgress();

              const solvedCount = this.playerData.careerClues.slice(0, 6).filter(Boolean).length;

              if (feedEl && feedTextEl) {
                feedEl.classList.remove('hidden');
                feedEl.style.borderColor = '#22c55e';
                feedEl.style.background = '#f0fdf4';
                feedTextEl.innerHTML = `🎉 <b>정답입니다!</b> 훌륭해요!<br><span style="font-size:15px; color:#15803d; font-weight:900;">${clue.clueReveal}</span><br><span style="font-size:12px; color:#64748b;">(현재 수집한 단서: ${solvedCount} / 6개)</span>`;
              }
              btn.style.background = '#16a34a';
              btn.style.borderColor = '#15803d';

              if (solvedCount >= 6) {
                setTimeout(() => {
                  if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
                    window.AudioManager.playFanfare();
                  }
                  this.showToast('🎉 6개 단서를 모두 모았습니다! 탈출 도어락(DREAMS)을 해제하세요!', 'success');
                }, 400);
              }
            } else {
              if (window.AudioManager && typeof window.AudioManager.playWrong === 'function') {
                window.AudioManager.playWrong();
              }
              if (feedEl && feedTextEl) {
                feedEl.classList.remove('hidden');
                feedEl.style.borderColor = '#ef4444';
                feedEl.style.background = '#fef2f2';
                feedTextEl.innerHTML = `💔 아쉽네요! 다시 한번 힌트를 읽고 정답을 찾아보세요! 😊<br><span style="font-size:12px; color:#dc2626;">(패널티 0: 친절한 방탈출입니다)</span>`;
              }
            }
          });
          optsEl.appendChild(btn);
        });
      }
    }

    modal.classList.remove('hidden');
  }

  openCareerKeypadModal() {
    const modal = document.getElementById('modal-career-keypad');
    if (!modal) return;

    if (!Array.isArray(this.playerData.careerClues)) {
      this.playerData.careerClues = [false, false, false, false, false, false];
    }
    const clues = this.playerData.careerClues;
    const letters = ['D', 'R', 'E', 'A', 'M', 'S'];
    const solvedCount = clues.slice(0, 6).filter(Boolean).length;
    const allSolved = clues.slice(0, 6).every(Boolean);
    const hasEscaped = !!this.playerData.hasEscapedCareerRoom;

    for (let i = 1; i <= 6; i++) {
      const txtEl = document.getElementById('txt-clue-' + i);
      const slotEl = document.getElementById('slot-clue-' + i);
      const isFound = !!clues[i - 1];
      if (txtEl) {
        txtEl.innerText = isFound ? letters[i - 1] : '?';
        txtEl.style.color = isFound ? '#15803d' : '#94a3b8';
      }
      if (slotEl) {
        slotEl.style.borderColor = isFound ? '#22c55e' : '#64748b';
        slotEl.style.background = isFound ? '#f0fdf4' : '#f8fafc';
      }
    }

    const unlockBanner = document.getElementById('keypad-all-unlocked-banner');
    const manualBox = document.getElementById('keypad-manual-input-box');
    const hintText = document.getElementById('keypad-hint-text');
    const inputPwd = document.getElementById('input-career-password');
    const btnSubmit = document.getElementById('btn-submit-career-password');

    if (hasEscaped) {
      if (unlockBanner) {
        unlockBanner.classList.remove('hidden');
        unlockBanner.innerHTML = `
          <p style="font-size: 14px; font-weight: 900; color: #15803d; margin: 0 0 6px;">
            🎉 탈출 도어락이 열려 있습니다!
          </p>
          <p style="font-size: 12px; color: #475569; margin: 0 0 10px;">
            6대 직업 중 원하는 직업을 선택하여 고유 패시브 스킬을 습득/변경하세요!
          </p>
          <button id="btn-open-job-select" class="btn-primary" style="width: 100%; font-size: 14px; font-weight: 900; padding: 10px 0; background: linear-gradient(135deg, #16a34a, #15803d); border-color: #14532d;">
            🔓 6대 직업 전직하기 ➔
          </button>
        `;
        const btnOpenJob = document.getElementById('btn-open-job-select');
        if (btnOpenJob) {
          btnOpenJob.addEventListener('click', () => {
            modal.classList.add('hidden');
            this.openCareerJobSelectModal();
          });
        }
      }
      if (manualBox) manualBox.classList.add('hidden');
    } else {
      if (unlockBanner) unlockBanner.classList.add('hidden');
      if (manualBox) manualBox.classList.remove('hidden');

      if (allSolved) {
        if (hintText) {
          hintText.innerHTML = '🎉 <b>6개의 직업 단서를 모두 발견했습니다!</b><br>단서들의 첫 글자를 조합한 6자리 최종 탈출 암호를 입력하세요:';
          hintText.style.color = '#15803d';
        }
        if (inputPwd) {
          inputPwd.disabled = false;
          inputPwd.placeholder = '6자리 영단어 입력 (대소문자 무관)';
          setTimeout(() => inputPwd.focus(), 100);
        }
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.style.opacity = '1.0';
          btnSubmit.innerText = '탈출 암호 입력 ➔';
        }
      } else {
        if (hintText) {
          hintText.innerHTML = `🔒 <b>아직 6개 단서를 모두 모으지 못했습니다! (현재 발견: ${solvedCount} / 6개)</b><br>진로실 안 6개의 직업 가구를 모두 조사해야 암호를 입력할 수 있습니다!`;
          hintText.style.color = '#b91c1c';
        }
        if (inputPwd) {
          inputPwd.disabled = true;
          inputPwd.value = '';
          inputPwd.placeholder = `단서 ${6 - solvedCount}개 더 수집 필요`;
        }
        if (btnSubmit) {
          btnSubmit.disabled = true;
          btnSubmit.style.opacity = '0.5';
          btnSubmit.innerText = `단서 수집 중 (${solvedCount}/6)`;
        }
      }
    }

    if (!this._careerKeypadInitialized) {
      this._careerKeypadInitialized = true;
      const btnCloseX = document.getElementById('btn-close-career-keypad-x');
      if (btnCloseX) btnCloseX.addEventListener('click', () => modal.classList.add('hidden'));

      if (btnSubmit && inputPwd) {
        btnSubmit.addEventListener('click', () => {
          const curClues = this.playerData.careerClues || [];
          const curSolved = curClues.filter(Boolean).length;
          if (curSolved < 6) {
            alert(`🔒 아직 6개의 직업 단서를 모두 찾지 못했습니다! (현재 발견: ${curSolved} / 6개)\n방 안의 가구들을 조사하여 부족한 단서를 먼저 모아오세요!`);
            return;
          }

          const val = (inputPwd.value || '').trim().toUpperCase();
          if (val === 'DREAMS') {
            modal.classList.add('hidden');
            this.playerData.hasEscapedCareerRoom = true;
            this.saveProgress(true);
            this.showToast('🔓 비밀번호 DREAMS 일치! 탈출 도어락이 열렸습니다!', 'success');
            if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
              window.AudioManager.playFanfare();
            }
            setTimeout(() => this.openCareerJobSelectModal(), 300);
          } else {
            alert('🔒 비밀번호가 일치하지 않습니다!\n방 안에서 찾은 6가지 직업 단서(Doctor, Researcher, Engineer, Artist, Mentor, Scientist)의 첫 글자를 조합해보세요!');
          }
        });

        inputPwd.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            btnSubmit.click();
          }
        });
      }
    }

    modal.classList.remove('hidden');
  }

  openCareerJobSelectModal() {
    const modal = document.getElementById('modal-career-job-select');
    if (!modal) return;

    const grid = document.getElementById('grid-career-jobs');
    if (grid) {
      grid.innerHTML = '';
      this.JOB_PASSIVE_DEFINITIONS.forEach(job => {
        const isCurrentJob = (this.playerData.job === job.id || this.playerData.job === job.legacyId);
        const card = document.createElement('div');
        card.style.cssText = `
          background: ${isCurrentJob ? '#f0fdf4' : '#ffffff'};
          border: 2.5px solid ${isCurrentJob ? '#22c55e' : '#cbd5e1'};
          border-radius: 12px;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        `;

        card.innerHTML = `
          <div>
            <div style="font-size: 34px; margin-bottom: 4px;">${job.icon}</div>
            <div style="font-size: 14px; font-weight: 900; color: #0f172a;">${job.name}</div>
            <div style="font-size: 11.5px; font-weight: 800; color: #4338ca; margin: 2px 0 6px;">${job.title}</div>
            <div style="font-size: 12px; font-weight: 800; color: #166534; background: #dcfce7; border-radius: 6px; padding: 4px; margin-bottom: 6px;">
              ⚡ ${job.skillName}
            </div>
            <div style="font-size: 11px; color: #475569; line-height: 1.4; margin-bottom: 8px;">
              ${job.effect}
            </div>
          </div>
          <button class="btn-primary btn-select-this-job" style="width: 100%; font-size: 12px; font-weight: 800; padding: 7px 0; background: ${isCurrentJob ? '#15803d' : '#4338ca'}; border-color: ${isCurrentJob ? '#14532d' : '#3730a3'};">
            ${isCurrentJob ? '✅ 현재 전직 중' : '전직하기 ➔'}
          </button>
        `;

        const btn = card.querySelector('.btn-select-this-job');
        if (btn) {
          btn.addEventListener('click', () => {
            if (isCurrentJob) {
              this.showToast(`이미 [${job.name}] 직업을 장착 중입니다!`, 'info');
              return;
            }
            if (window.RPGDialog) {
              window.RPGDialog.confirm(
                '🌟 진로 전직 선택',
                `[${job.icon} ${job.name}] 직업으로 전직하시겠습니까?\n\n고유 패시브 스킬: [${job.skillName}]\n효과: ${job.effect}`,
                job.icon,
                () => {
                  this.selectCareerJob(job.id);
                  modal.classList.add('hidden');
                },
                null,
                '전직하기',
                '취소'
              );
            } else {
              if (confirm(`[${job.name}] 직업으로 전직하시겠습니까?`)) {
                this.selectCareerJob(job.id);
                modal.classList.add('hidden');
              }
            }
          });
        }
        grid.appendChild(card);
      });
    }

    if (!this._careerJobModalInitialized) {
      this._careerJobModalInitialized = true;
      const btnCloseX = document.getElementById('btn-close-career-job-x');
      if (btnCloseX) btnCloseX.addEventListener('click', () => modal.classList.add('hidden'));
    }

    modal.classList.remove('hidden');
  }

  resetCareerEscapeProgress() {
    if (!this.playerData) return;
    if (this.playerData.hasEscapedCareerRoom) return; // 이미 방탈출 및 전직 완료한 학생은 진행도 보존
    this.playerData.careerClues = [false, false, false, false, false, false];
    this.saveProgress(true);
  }

  selectCareerJob(jobId) {
    const job = this.JOB_PASSIVE_DEFINITIONS.find(j => j.id === jobId);
    if (!job) return;

    this.playerData.job = job.id;
    this.playerData.hasEscapedCareerRoom = true;

    // 호칭 자동 등록 및 장착
    if (!Array.isArray(this.playerData.titles)) {
      this.playerData.titles = [];
    }
    if (!this.playerData.titles.includes(job.title)) {
      this.playerData.titles.push(job.title);
    }
    this.playerData.equippedTitle = job.title;

    this.recalcCombatStats();
    this.updatePlayerNameDisplay();
    this.saveProgress(true);

    if (this.networkManager && this.networkManager.sendTitleUpdate) {
      this.networkManager.sendTitleUpdate(job.title);
    }

    if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
      window.AudioManager.playFanfare();
    }

    if (window.RPGDialog) {
      window.RPGDialog.show(
        '🌟 진로 선생님',
        `"축하한다! 5층 진로 방탈출을 완파하고 너만의 멋진 꿈인 [${job.icon} ${job.name}]에 당당히 전직했단다! 👏\n\n고유 패시브 스킬 [${job.skillName}]이 항상 너를 든든하게 보호해줄 거야!\n\n(언제든 진로실에 오면 다른 직업의 스킬을 경험해볼 수 있단다! 🌟)"`,
        job.icon
      );
    } else {
      alert(`🎉 축하합니다! [${job.name}] 직업에 전직하고 패시브 스킬 [${job.skillName}]을 습득했습니다!`);
    }
  }

  // 🥁 1학년 4반 후니후니 선생님 & 학생 의자 상호작용 (20문항 도덕 비트 퀴즈)
  handleMoralClassroomInteraction() {
    if (this.playerData && (this.playerData.isFallen || this.playerData.hp <= 0)) {
      this.showToast('💀 기절 상태에서는 상호작용할 수 없습니다!', 'error');
      return;
    }

    if (this.playerData.hasClearedClass704) {
      if (window.RPGDialog) {
        window.RPGDialog.show(
          '🥁 후니후니 선생님',
          `"오! [${this.playerData.name}] 학생이구나! 👏\n\n넌 이미 1학년 4반의 20문제 도덕 비트를 모두 마스터하고 [🥁 영혼의 드러머] 칭호를 획득했단다!\n\n더 이상 시험을 치를 필요는 없으니 교실 뒤 드럼 세트를 치며 신나게 락스피릿을 즐기렴! 🤘"`,
          '🥁'
        );
      } else {
        alert(`🥁 [후니후니 선생님]\n\n"와우! 넌 이미 20문제를 모두 마스터했단다! 언제든 드럼 세트를 치러 놀러오렴!"`);
      }
      return;
    }

    const solvedIds = this.playerData.solvedMoralQuestionIds || [];
    const solvedCount = solvedIds.length;

    if (solvedCount >= 20) {
      this.openMoralRewardModal();
      return;
    }

    const msg = `"안녕! 1학년 4반 담임이자 드럼 치는 도덕쌤 후니후니 선생님이다! 🥁🎸\n\n우리 반에서는 영어 지혜 명언과 바른 인성을 다루는 [20문제 도덕 비트 퀴즈]를 수련한단다.\n\n정답을 맞힌 문제는 다시 나오지 않으며, 20문제를 모두 맞히면 특별한 호칭과 핵심 재료 보상을 선물로 준단다!\n\n현재 수련 진행도: [ ${solvedCount} / 20 문제 ]\n\n지금 도덕 비트 퀴즈에 도전해볼래?"`;

    if (window.RPGDialog) {
      window.RPGDialog.confirm(
        '🥁 후니후니 선생님',
        msg,
        '🥁',
        () => {
          if (this.quizManager) {
            this.quizManager.startMoralDrumQuiz();
          }
        },
        null,
        '도전하기 ➔',
        '다음에 하기'
      );
    } else {
      if (confirm('🥁 1학년 4반 후니후니 선생님의 도덕 비트 퀴즈(20문항)에 도전하시겠습니까?')) {
        if (this.quizManager) {
          this.quizManager.startMoralDrumQuiz();
        }
      }
    }
  }

  // 🎁 1학년 4반 20문항 완파 1회성 보상 수령 모달 (호칭 자동지급 + 재료 10개 선택)
  openMoralRewardModal() {
    const modal = document.getElementById('modal-moral-reward');
    if (!modal) return;

    if (this.playerData.hasClearedClass704) {
      this.showToast('이미 1학년 4반 도덕 수련 보상을 수령하셨습니다!', 'info');
      return;
    }

    modal.classList.remove('hidden');

    if (!this._moralRewardModalInitialized) {
      this._moralRewardModalInitialized = true;

      const btnCloseX = document.getElementById('btn-close-moral-reward-x');
      if (btnCloseX) {
        btnCloseX.addEventListener('click', () => {
          modal.classList.add('hidden');
        });
      }

      const claimReward = (itemKey, itemName, icon) => {
        if (this.playerData.hasClearedClass704) return;
        this.playerData.hasClearedClass704 = true;

        // 1. 재료 10개 지급
        this.addItem(itemKey, itemName, 10, icon, { type: 'material' });

        // 2. 호칭 지급 및 자동 장착
        const titleName = '🥁 영혼의 드러머';
        if (!Array.isArray(this.playerData.titles)) {
          this.playerData.titles = [];
        }
        if (!this.playerData.titles.includes(titleName)) {
          this.playerData.titles.push(titleName);
        }
        this.playerData.equippedTitle = titleName;
        this.updatePlayerNameDisplay();
        if (this.networkManager && this.networkManager.sendTitleUpdate) {
          this.networkManager.sendTitleUpdate(titleName);
        }

        // 3. 영구 저장
        const studentId = this.playerData.studentId;
        if (studentId && studentId !== '교사') {
          try {
            localStorage.setItem('soongsil_class704_cleared_' + studentId, 'true');
          } catch (e) {}
        }
        this.saveProgress(true);

        // 4. 모달 닫기
        modal.classList.add('hidden');

        // 5. 팡파레 & 축하 대사
        if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
          window.AudioManager.playFanfare();
        }

        if (window.RPGDialog) {
          window.RPGDialog.show(
            '🥁 후니후니 선생님',
            `"축하한다! 20문제를 완벽하게 마스터하고 [${titleName}] 호칭과 [${icon} ${itemName} 10개]를 획득했단다! 👏\n\n너의 멋진 도덕적 인성과 비트 감각이 앞으로의 숭실 모험을 더욱 빛나게 해줄 거야!\n\n이제 1학년 4반의 모든 수련을 마쳤으니 더 이상 시험을 치르러 오지 않아도 된단다. 드럼 치러 언제든 편하게 놀러오렴! 🥁"`,
            '🥁'
          );
        } else {
          alert(`🥁 [후니후니 선생님]\n\n"축하한다! [${titleName}] 호칭과 [${icon} ${itemName} 10개]를 획득했단다!"`);
        }
      };

      const btnWood = document.getElementById('btn-claim-moral-wood');
      if (btnWood) btnWood.addEventListener('click', () => claimReward('item_wood', '단단한 목재', '🪵'));

      const btnHerb = document.getElementById('btn-claim-moral-herb');
      if (btnHerb) btnHerb.addEventListener('click', () => claimReward('item_herb', '향긋한 허브', '🌿'));

      const btnBasket = document.getElementById('btn-claim-moral-basket');
      if (btnBasket) btnBasket.addEventListener('click', () => claimReward('item_basketball_leather', '농구공 겉가죽', '🏀'));

      const btnFutsal = document.getElementById('btn-claim-moral-futsal');
      if (btnFutsal) btnFutsal.addEventListener('click', () => claimReward('item_futsal_leather', '탄력있는 풋살공 가죽', '⚽'));
    }
  }

  // 🥁 1학년 4반 도덕&락앤롤 드럼 세트 연주 (신디사이저 비트 사운드 + 멘탈 회복)
  handleDrumKitInteraction(target) {
    if (window.AudioManager && typeof window.AudioManager.playDrumBeat === 'function') {
      window.AudioManager.playDrumBeat();
    }

    const curHp = this.playerData.hp || 0;
    const maxHp = this.playerData.maxHp || 100;
    let healed = 0;
    if (curHp < maxHp) {
      healed = Math.min(maxHp - curHp, 15);
      this.playerData.hp += healed;
      this.updateHpBar();
      this.saveProgress();
    }

    const healMsg = healed > 0 ? ` (🎵 신나는 드럼 비트로 멘탈 회복! HP +${healed})` : '';
    this.showToast(`🥁 쿵-치-따-치! 1학년 4반 도덕쌤의 락스피릿이 온몸에 울려 퍼집니다!${healMsg}`, 'success');
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

    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
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
      if (window.RPGDialog) {
        window.RPGDialog.confirm(
          room.name,
          `"${msg}"\n\n(교사 권한으로 교실 내부에 입장하시겠습니까?)`,
          '🚪',
          () => {
            this.engine.triggerFadeWarp(() => {
              this.engine.warpToRoom(room.id, room.name, room.targetX * 32, room.targetY * 32);
            });
          }
        );
      } else if (confirm(`🚪 [${room.name}]\n\n"${msg}"\n\n(교사 권한으로 교실 내부에 입장하시겠습니까?)`)) {
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
    this.addItem('item_red_potion', '빨간 물약', 2, '🧪', { type: 'consumable', slot: 'consumable', heal: 10, effect: '체력 +10 회복' });
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
      `• 🧪 빨간 물약 x2개 획득! (HP +10 회복)\n\n` +
      `(우측 상단 가방(🎒)을 열어 획득한 물약을 확인할 수 있습니다.)`
    );
  }

  // 👮 숭실 정문 배움터 지킴이 선생님 (언덕길 등교 챌린지)
  handleGuardTeacherInteraction() {
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }

    let topRecs = (this.playerData && Array.isArray(this.playerData.uphillTopRecords)) ? this.playerData.uphillTopRecords : [];
    if (topRecs.length === 0 && this.playerData && this.playerData.uphillBestTime) {
      topRecs = [this.playerData.uphillBestTime];
    }
    const rec1 = topRecs[0] ? `${(topRecs[0] / 1000).toFixed(2)}초` : '기록 없음';
    const rec2 = topRecs[1] ? `${(topRecs[1] / 1000).toFixed(2)}초` : '-';
    const rec3 = topRecs[2] ? `${(topRecs[2] / 1000).toFixed(2)}초` : '-';

    const dialogText = `"허허, 안녕 학생! 여기가 바로 숭실중학교의 명물, '전설의 등교 언덕길'이란다!\n\n지각 위기일 때 전력으로 뛰어 올라가던 선배들의 기상을 이어받아, 위에서 쏟아지는 장애물을 요리조리 피해서 언덕길 꼭대기까지 가장 빠른 시간 안에 주파해 보겠니?\n\n📊 [개인 최고 기록 TOP 3]:\n• 🥇 1위: ${rec1}\n• 🥈 2위: ${rec2}\n• 🥉 3위: ${rec3}\n\n💡 조작법: [A / D] 좌우 이동, [W / Space] 전력 질주\n⚡ 팁: 도로 위 초록빛 부스터 패드를 밟으면 초음속으로 질주하고, 하트(💖)를 먹으면 체력이 회복된단다!"`;

    if (window.RPGDialog) {
      window.RPGDialog.confirm(
        '👮 배움터 지킴이 선생님 (언덕길 등교 챌린지)',
        dialogText,
        '👮',
        () => {
          const game = window.UphillRush || window.UphillRushGame;
          if (game && typeof game.open === 'function') {
            game.open();
          }
        },
        () => {},
        '🏃 언덕길 등교 챌린지 도전! (Enter)',
        '다음에 하기 (ESC)'
      );
    } else {
      if (confirm(dialogText)) {
        const game = window.UphillRush || window.UphillRushGame;
        if (game && typeof game.open === 'function') game.open();
      }
    }
  }

  // 🚗 교직원 럭셔리 세단 이스터에그 (감히 선생님 차에 손을 대다니! 1초 마비 + HP -20)
  // ========================================================
  // 🏃 숭실고 체육선생님 "주차장 1분 체력장" (제자리 점프 5회)
  // ========================================================
  handlePETeacherInteraction() {
    const dialogText = `"어이 학생! 실내 코트가 수리 중이라고 기초 체력 단련을 쉴 순 없지! 나와 함께 제자리 점프 5회 도전해볼 텐가?"`;

    if (window.RPGDialog) {
      window.RPGDialog.confirm(
        '👨‍🏫 숭실고 체육선생님',
        dialogText,
        '👨‍🏫',
        () => {
          this.openPEJumpMiniGameModal();
        },
        () => {},
        '도전하기 (Enter)',
        '다음에 하기 (ESC)'
      );
    } else {
      this.openPEJumpMiniGameModal();
    }
  }

  openPEJumpMiniGameModal() {
    const modal = document.getElementById('modal-pe-jump-challenge');
    if (!modal) return;

    const btnCloseX = document.getElementById('btn-close-pe-jump-x');
    const btnTrigger = document.getElementById('btn-pe-jump-trigger');
    const btnComplete = document.getElementById('btn-pe-jump-complete');
    const victoryOverlay = document.getElementById('pe-jump-victory-overlay');
    const dotsContainer = document.getElementById('pe-jump-dots');
    const speechEl = document.getElementById('pe-teacher-speech');
    const judgmentEl = document.getElementById('pe-jump-judgment');
    const stageTeacher = document.getElementById('pe-stage-teacher');
    const stagePlayer = document.getElementById('pe-stage-player');
    const trackEl = document.getElementById('pe-rhythm-track');
    const indicatorEl = document.getElementById('pe-rhythm-indicator');

    // Reset overlay
    if (victoryOverlay) victoryOverlay.classList.add('hidden');

    let jumpCount = 0;
    const maxJumps = 5;
    let animFrameId = null;
    let isJumpingCooldown = false;
    let isGameOver = false;

    // Speeds for 5 rounds (gets slightly faster and more exciting each round!)
    const roundSpeeds = [1900, 1650, 1450, 1250, 1050];
    const roundSpeeches = [
      "어이 학생! 호흡 가다듬고... 하나, 둘, 점프!!",
      "좋아! 첫 번째 점프 완벽해! 다음 점프 준비!",
      "헛둘! 무릎을 부드럽게 굽히고 리듬을 타라!",
      "오호라! 체력이 제법인데? 4번째 점프 간다!",
      "마지막 파이널 점프!! 온 힘을 다해 높게 뛰어올라라!!"
    ];

    const updateDots = () => {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      for (let i = 0; i < maxJumps; i++) {
        const dot = document.createElement('span');
        dot.style.display = 'inline-flex';
        dot.style.alignItems = 'center';
        dot.style.justifyContent = 'center';
        dot.style.width = '24px';
        dot.style.height = '24px';
        dot.style.borderRadius = '50%';
        dot.style.fontSize = '12px';
        dot.style.fontWeight = '900';
        if (i < jumpCount) {
          dot.style.background = '#22c55e';
          dot.style.color = '#ffffff';
          dot.style.border = '1.5px solid #86efac';
          dot.innerText = '✓';
        } else if (i === jumpCount) {
          dot.style.background = '#2563eb';
          dot.style.color = '#ffffff';
          dot.style.border = '2px solid #60a5fa';
          dot.style.boxShadow = '0 0 8px #38bdf8';
          dot.innerText = (i + 1);
        } else {
          dot.style.background = '#334155';
          dot.style.color = '#94a3b8';
          dot.style.border = '1px solid #475569';
          dot.innerText = (i + 1);
        }
        dotsContainer.appendChild(dot);
      }
    };

    updateDots();
    if (speechEl) speechEl.innerText = roundSpeeches[0];

    // Rhythm animation loop
    let startTime = performance.now();
    let currentLeftPercent = 0; // 0 to 100

    const renderLoop = (now) => {
      if (isGameOver) return;
      const speed = roundSpeeds[Math.min(jumpCount, roundSpeeds.length - 1)];
      const elapsed = now - startTime;
      const cycle = (elapsed % speed) / speed;
      // Ping-pong between 0 and 1
      const t = Math.abs((cycle * 2) - 1);
      currentLeftPercent = t * 100;

      if (trackEl && indicatorEl) {
        const trackW = trackEl.clientWidth || 400;
        const indW = 28;
        const maxPx = Math.max(0, trackW - indW);
        const px = (t * maxPx);
        indicatorEl.style.transform = `translateX(${px}px)`;
      }

      animFrameId = requestAnimationFrame(renderLoop);
    };

    animFrameId = requestAnimationFrame(renderLoop);

    // Jump trigger handler
    const doJump = () => {
      if (isJumpingCooldown || isGameOver) return;
      isJumpingCooldown = true;
      setTimeout(() => { isJumpingCooldown = false; }, 260);

      // Perfect zone reduced to 1/3 size (centered between 44.5% and 55.5%)
      const isHit = (currentLeftPercent >= 44.5 && currentLeftPercent <= 55.5);

      if (isHit) {
        if (window.AudioManager && typeof window.AudioManager.playWhistle === 'function') {
          window.AudioManager.playWhistle();
        }

        // Animate Jump on sprites
        if (stageTeacher) stageTeacher.style.transform = 'translateY(-26px) scale(1.1)';
        if (stagePlayer) stagePlayer.style.transform = 'translateY(-26px) scale(1.1)';
        setTimeout(() => {
          if (stageTeacher) stageTeacher.style.transform = 'translateY(0) scale(1)';
          if (stagePlayer) stagePlayer.style.transform = 'translateY(0) scale(1)';
        }, 220);

        // Flash judgment
        if (judgmentEl) {
          judgmentEl.innerText = `✨ PERFECT JUMP! (${jumpCount + 1}/${maxJumps})`;
          judgmentEl.style.color = '#fef08a';
          judgmentEl.style.opacity = '1';
          judgmentEl.style.transform = 'scale(1.15)';
          setTimeout(() => {
            judgmentEl.style.opacity = '0';
            judgmentEl.style.transform = 'scale(0.7)';
          }, 320);
        }

        jumpCount++;
        updateDots();

        if (jumpCount >= maxJumps) {
          // Victory!
          isGameOver = true;
          cancelAnimationFrame(animFrameId);
          if (speechEl) speechEl.innerText = "와하하! 5회 완주 대성공이다! 훌륭하군!";

          if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
            window.AudioManager.playFanfare();
          }

          setTimeout(() => {
            if (victoryOverlay) victoryOverlay.classList.remove('hidden');
          }, 350);
        } else {
          if (speechEl) speechEl.innerText = roundSpeeches[jumpCount];
        }
      } else {
        // Missed timing: reset progress to 0!
        if (window.AudioManager && typeof window.AudioManager.playTextBlip === 'function') {
          window.AudioManager.playTextBlip();
        }

        jumpCount = 0;
        updateDots();

        if (judgmentEl) {
          judgmentEl.innerText = '💦 타이밍 실패! 0회로 리셋!';
          judgmentEl.style.color = '#f87171';
          judgmentEl.style.opacity = '1';
          judgmentEl.style.transform = 'scale(0.95)';
          setTimeout(() => {
            judgmentEl.style.opacity = '0';
            judgmentEl.style.transform = 'scale(0.7)';
          }, 350);
        }

        if (stagePlayer) {
          stagePlayer.style.transform = 'translateX(-8px) scale(0.95)';
          setTimeout(() => {
            if (stagePlayer) stagePlayer.style.transform = 'translateX(8px) scale(0.95)';
            setTimeout(() => {
              if (stagePlayer) stagePlayer.style.transform = 'translateX(0) scale(1)';
            }, 80);
          }, 80);
        }

        if (speechEl) {
          speechEl.innerText = "아깝다! 박자가 빗나가서 처음(0회)부터 다시 도전이다! 집중해라, 학생!";
        }
      }
    };

    // Button click
    btnTrigger.onclick = (e) => {
      e.preventDefault();
      doJump();
    };

    // Keyboard listener for Space/Enter and ESC (capture phase + stopImmediatePropagation)
    const keyHandler = (e) => {
      if (modal.classList.contains('hidden')) return;
      if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (isGameOver) {
          if (btnComplete) btnComplete.click();
        } else {
          doJump();
        }
      } else if (e.code === 'Escape' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        closeModal();
      }
    };

    window.addEventListener('keydown', keyHandler, true);

    const closeModal = () => {
      isGameOver = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      window.removeEventListener('keydown', keyHandler, true);
      modal.classList.add('hidden');
    };

    if (btnCloseX) {
      btnCloseX.onclick = closeModal;
    }

    if (btnComplete) {
      btnComplete.onclick = () => {
        closeModal();

        // Award 빨간회복물약 10개
        this.addItem('item_red_potion', '빨간 물약', 10, '🧪', {
          type: 'consumable',
          slot: 'consumable',
          heal: 10,
          effect: '체력 +10 회복'
        });

        this.playerData.hasClearedPEJump = true;
        this.saveProgress(true);

        this.showToast('🧪 숭실고 체육선생님께 빨간회복물약 10개를 받았습니다!', 'success');
      };
    }

    modal.classList.remove('hidden');
  }

  handleTeacherCarEasterEgg() {
    if (this.playerData.isTeacher) {
      if (window.RPGDialog) {
        window.RPGDialog.show(
          '🚗 교직원 럭셔리 세단',
          `"삑-삑- 🎵 스마트키 인식 완료!"\n\n『교직원 전용 스마트키가 정상 감지되었습니다.\n오늘도 학생들을 위해 열정 넘치는 하루 보내십시오, 선생님!』`,
          '🚗'
        );
      } else {
        alert('🚗 [교직원 럭셔리 세단]\n\n"삑-삑- 🎵 스마트키 인식 완료!\n오늘도 안전운전 하십시오, 선생님!"');
      }
      return;
    }

    if (window.AudioManager && typeof window.AudioManager.playElectricShock === 'function') {
      window.AudioManager.playElectricShock();
    }

    if (this.engine) {
      if (typeof this.engine.triggerElectricZapEffect === 'function') {
        this.engine.triggerElectricZapEffect();
      }
      this.engine.player.stunnedUntil = Date.now() + 1000;
    }

    const prevHp = this.playerData.hp;
    this.playerData.hp = Math.max(1, this.playerData.hp - 20);
    const damageDealt = prevHp - this.playerData.hp;
    this.updateHUD();
    this.saveProgress(true);

    if (window.RPGDialog) {
      window.RPGDialog.show(
        '🚨 교직원 전용 차량 보안 경보',
        `"삐요- 삐요- 삐요-!! 📢⚡"\n\n『감히 선생님의 차에 손을 대다니!!』\n\n최첨단 방범 전기 충격 장치가 격렬하게 작동했습니다!\n\n⚡ [패널티 발동]\n• ⚡ 1초간 온몸이 마비되어 움직일 수 없습니다!\n• 💔 체력(HP) -${damageDealt} 감소 (${this.playerData.hp}/${this.playerData.maxHp})`,
        '🚨'
      );
    } else {
      alert(`🚨 [보안 경보 발동!]\n\n"감히 선생님의 차에 손을 대다니!!"\n1초간 마비되며 HP가 ${damageDealt} 감소했습니다!`);
    }
  }

  // 🚌 숭실 축구부 버스 이스터에그 (클랙슨 빵빵! & 축구부 기사님의 달콤한 믹스커피)
  handleSchoolBusEasterEgg() {
    const studentId = this.playerData.studentId || 'default';
    const busKey = 'soongsil_bus_egg_' + studentId;
    const alreadyFound = !!(this.playerData.hasCheckedSchoolBus || (studentId && localStorage.getItem(busKey) === 'true'));

    if (window.AudioManager && typeof window.AudioManager.playBusHorn === 'function') {
      window.AudioManager.playBusHorn();
    }

    if (this.engine && typeof this.engine.triggerBusHornEffect === 'function') {
      this.engine.triggerBusHornEffect();
    }

    if (alreadyFound && !this.playerData.isTeacher) {
      if (window.RPGDialog) {
        window.RPGDialog.show(
          '🚌 숭실 축구부 버스',
          `"🚨 빵! 빵~~!!"\n\n친절한 기사님이 창문을 내리고 껄껄 웃으시며 손을 흔드십니다.\n\n"하하! 우리 숭실 학생이구나! 믹스커피는 맛있게 마셨니?\n숭실 축구부 선수들 태우고 원정 경기 가기 전에 점검 중이란다. 언제든 비상문 쪽 조심해서 안전하게 학교생활 하렴~ (빵빵!)"`,
          '🚌'
        );
      } else {
        alert(`🚌 [숭실 축구부 버스]\n\n"🚨 빵! 빵~~!!"\n\n"하하! 우리 숭실 학생이구나! 오늘도 안전하게 학교생활 잘하렴~!"`);
      }
      return;
    }

    // 최초 1회 보상: 50 Gold, 50 EXP, 주황 포션 2개, 초록 포션 1개
    this.playerData.hasCheckedSchoolBus = true;
    try {
      localStorage.setItem(busKey, 'true');
    } catch (e) {}

    this.addGold(50);
    this.addExp(50);
    this.addItem('item_orange_potion', '주황 포션', 2, '🧪', { type: 'consumable', slot: 'consumable', heal: 25, effect: '체력 +25 회복' });
    this.addItem('item_green_potion', '초록 포션', 1, '🧪', { type: 'consumable', slot: 'consumable', heal: 0, effect: '1분간 기본 이동속도 +10% 증가' });
    this.saveProgress(true);

    if (window.RPGDialog) {
      window.RPGDialog.show(
        '🚌 숭실 축구부 버스 (비상탈출문)',
        `숭실 축구부 버스 뒤편의 빨간색 비상탈출문(EXIT) 손잡이를 살짝 만졌더니...\n\n"🚨 빵! 빵~~!!"\n우렁찬 클랙슨 경적이 온 주차장에 울려 퍼집니다!\n\n운전석 창문 너머로 친절한 축구부 버스 기사님이 껄껄 웃으시며 손을 흔드십니다.\n"하하! 비상문 점검 중이었니? 우리 숭실 학생, 오늘도 수고가 많다!\n숭실 축구부 선수들의 원정과 훈련을 책임지는 25인승 버스란다.\n이거 기사님이 아껴둔 비장의 달달한 믹스커피(신속 초록 포션)인데 마시고 힘내렴~!"\n\n🎁 [이스터에그 보상 획득!]\n• 🪙 골드 +50G & 🌟 경험치 +50 EXP\n• 🧪 주황 포션 x2 (체력 +25 회복)\n• 🧪 초록 포션 x1 (1분간 이동속도 +10%)`,
        '🚌'
      );
    } else {
      alert(`🚌 [숭실 축구부 버스 비상문 이스터에그 발견!]\n\n"🚨 빵! 빵~~!!"\n\n축구부 버스 기사님이 달달한 믹스커피(물약들)와 50G, 50 EXP를 선물해주셨습니다!`);
    }
  }

  // ⚡ 100kW DC 전기차 급속 충전기 이스터에그 (짜릿한 정전기 감전 & 번개 스파크)
  handleEVChargerEasterEgg() {
    const studentId = this.playerData.studentId || 'default';
    const evKey = 'soongsil_ev_egg_' + studentId;
    const alreadyShocked = !!(this.playerData.hasShockedEVCharger || (studentId && localStorage.getItem(evKey) === 'true'));

    if (window.AudioManager && typeof window.AudioManager.playElectricShock === 'function') {
      window.AudioManager.playElectricShock();
    }

    if (this.engine && typeof this.engine.triggerElectricZapEffect === 'function') {
      this.engine.triggerElectricZapEffect();
    }

    if (alreadyShocked && !this.playerData.isTeacher) {
      if (window.RPGDialog) {
        window.RPGDialog.show(
          '⚡ 100kW DC 초급속 충전기',
          `"찌릿! ⚡⚡"\n\n손끝에서 작은 정전기 스파크가 파지직 튀었습니다!\n\n[⚠️ 고전압 주의]\n"한 번 감전되었던 짜릿한 전율이 손끝에 아직 남아있습니다. 손잡이를 조심해서 다루세요!"`,
          '⚡'
        );
      } else {
        alert(`⚡ [초급속 충전기]\n\n"찌릿! ⚡⚡"\n\n손끝에서 파란 정전기 스파크가 파지직 튀었습니다!`);
      }
      return;
    }

    // 최초 1회 보상: 100 Gold, 100 EXP, 용기 포션 1개
    this.playerData.hasShockedEVCharger = true;
    try {
      localStorage.setItem(evKey, 'true');
    } catch (e) {}

    this.addGold(100);
    this.addExp(100);
    this.addItem('item_courage_potion', '용기 포션', 1, '🧪', { type: 'consumable', slot: 'consumable', heal: 0, effect: '3분간 공격력(ATK) +5 증가' });
    this.saveProgress(true);

    if (window.RPGDialog) {
      window.RPGDialog.show(
        '⚡ 100kW DC 초급속 충전기',
        `충전 건 손잡이에 손을 대자마자 강력한 고압 정전기가 온몸으로 흘렀습니다!\n\n"⚡⚡ 지지직!! 파지직~~!!" ⚡⚡\n머리카락이 쭈뼛 곤두서고 손가락 끝에서 푸른 번개 스파크가 튀었습니다!\n\n[⚠️ 겨울철 초급속 충전소 안전 주의]\n"100kW 초급속 충전 중에는 고전압 유도 전류로 정전기가 튈 수 있습니다!"\n\n...하지만 온몸에 짜릿한 전율이 감돌며 온몸의 마나와 용기가 가득 차올랐습니다!\n\n🎁 [이스터에그 보상 획득!]\n• 🪙 골드 +100G & 🌟 경험치 +100 EXP\n• 🧪 용기 포션 x1 (3분간 공격력 +5)`,
        '⚡'
      );
    } else {
      alert(`⚡ [전기차 충전소 이스터에그 발견!]\n\n"⚡⚡ 지지직!! 파지직~~!!" ⚡⚡\n\n짜릿한 정전기 감전과 함께 100G, 100 EXP, 용기 포션을 획득했습니다!`);
    }
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

  // 🛗 중앙 엘리베이터 층 선택 모달
  openElevatorModal() {
    const modal = document.getElementById('modal-elevator');
    if (!modal) return;

    modal.classList.remove('hidden');

    const curFloor = this.engine.player.floor;
    const curRoom = this.engine.player.room;

    const floorButtons = modal.querySelectorAll('.btn-elevator-floor');
    floorButtons.forEach(btn => {
      const target = btn.dataset.target;
      const tag = btn.querySelector('.elevator-tag');

      let isCurrent = false;
      if (target === 'floor_6' && curRoom === 'hallway' && curFloor === 6) isCurrent = true;
      if (target === 'floor_5' && curRoom === 'hallway' && curFloor === 5) isCurrent = true;
      if (target === 'floor_3' && curRoom === 'hallway' && curFloor === 3) isCurrent = true;
      if (target === 'floor_2' && curRoom === 'hallway' && curFloor === 2) isCurrent = true;
      if ((target === 'floor_7' || target === 'floor_1') && curRoom === 'hallway' && curFloor === 7) isCurrent = true;
      if (target === 'playground' && curRoom === 'playground') isCurrent = true;

      if (isCurrent) {
        btn.style.opacity = '0.55';
        btn.style.pointerEvents = 'none';
        if (tag) {
          tag.innerText = '현재 위치';
          tag.style.background = '#334155';
          tag.style.color = '#94a3b8';
        }
      } else {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        if (tag) {
          tag.innerText = (this.playerData && this.playerData.isTeacher) ? '이동 (무료)' : '10G 소모 ➔';
        }
      }

      // Rebind click
      if (!btn._bound) {
        btn._bound = true;
        btn.addEventListener('click', () => {
          modal.classList.add('hidden');
          const target = btn.getAttribute('data-target') || btn.dataset.target;
          this.travelToElevatorFloor(target);
        });
      }
    });

    const btnClose = document.getElementById('btn-close-elevator-modal');
    if (btnClose && !btnClose._bound) {
      btnClose._bound = true;
      btnClose.addEventListener('click', () => modal.classList.add('hidden'));
    }
  }

  travelToElevatorFloor(target) {
    if (this._isElevatorTraveling) return;
    this._isElevatorTraveling = true;
    setTimeout(() => { this._isElevatorTraveling = false; }, 800);

    // 엘리베이터 이용료 (무조건 1회 이용 시 10G 지출, 교사는 무료)
    if (!this.playerData.isTeacher) {
      if (this.playerData.gold < 10) {
        alert(`❌ [엘리베이터 이용료 부족]\n\n엘리베이터를 이용하려면 10G(골드)가 필요합니다!\n(현재 보유 골드: ${this.playerData.gold}G)`);
        return;
      }
      this.addGold(-10);
      this.showToast('🛗 엘리베이터 이용료 10G를 지불했습니다.', 'info');
    }

    if (this.engine && this.engine.fade && this.engine.fade.phase === 'none') {
      this.engine.fade.active = false;
    }

    if (target === 'floor_7' || target === 'floor_1') {
      if (window.AudioManager) window.AudioManager.playSelect();
      this.engine.triggerFadeWarp(() => {
        this.engine.player.floor = 7;
        this.engine.warpToRoom('hallway', '7층 복도 (1학년 구역)', 56 * 32, 6 * 32);
        this.saveProgress();
      });
    } else if (target === 'floor_6') {
      if (window.AudioManager) window.AudioManager.playSelect();
      this.engine.triggerFadeWarp(() => {
        this.engine.player.floor = 6;
        this.engine.warpToRoom('hallway', '6층 복도 (교무실 & 2학년 구역)', 56 * 32, 6 * 32);
        this.saveProgress();
      });
    } else if (target === 'floor_5') {
      if (window.AudioManager) window.AudioManager.playSelect();
      this.engine.triggerFadeWarp(() => {
        this.engine.player.floor = 5;
        this.engine.warpToRoom('hallway', '5층 복도 (진로 & 선배 구역)', 56 * 32, 6 * 32);
        this.saveProgress();
      });
    } else if (target === 'floor_3') {
      if (window.AudioManager) window.AudioManager.playSelect();
      this.engine.triggerFadeWarp(() => {
        this.engine.player.floor = 3;
        this.engine.warpToRoom('hallway', '3층 복도 (보건실 & Wee클래스)', 56 * 32, 6 * 32);
        this.saveProgress();
      });
    } else if (target === 'floor_2') {
      if (window.AudioManager) window.AudioManager.playSelect();
      this.engine.triggerFadeWarp(() => {
        this.engine.player.floor = 2;
        this.engine.warpToRoom('hallway', '2층 도서관', 16 * 32, 5 * 32);
        this.saveProgress();
      });
    } else if (target === 'playground') {
      if (window.AudioManager) window.AudioManager.playSelect();
      this.engine.triggerFadeWarp(() => {
        this.engine.player.floor = 1;
        this.engine.warpToRoom('playground', '숭실 운동장', 80 * 32, 6 * 32);
        this.saveProgress();
      });
    }
  }

  handleElevatorInteraction() {
    // 1. Anti-spam & interaction debounce (prevents double triggers on mobile/spacebar)
    if (this._elevatorCooldown && Date.now() - this._elevatorCooldown < 1500) {
      return;
    }
    this._elevatorCooldown = Date.now();

    const dialog = window.RPGDialog;

    // 교사는 통행권 및 퀘스트 검사 없이 즉시 전 층 엘리베이터 모달 오픈
    if (this.playerData && this.playerData.isTeacher) {
      this.openElevatorModal();
      return;
    }

    // 1. 1차 관문 보스(가죽 골렘) 토벌 여부 검사 (운동장이나 복도 어디서든)
    if (!this.isElevatorUnlocked()) {
      alert(
        '⚠️ [엘리베이터 점검 중]\n\n"현재 중앙 엘리베이터는 [점검 중]이라 탑승할 수 없습니다!\n\n1학년 2반 교실로 들어가 1차 관문 보스 [👾 가죽 골렘]을 먼저 토벌하고 [🪪 엘리베이터 작동권]을 획득해야 엘리베이터를 가동할 수 있습니다!"'
      );
      return;
    }

    // 2. 엘리베이터 작동권 장착 여부 검사
    if (!this.isElevatorPassEquipped()) {
      if (this.hasItem('equip_elevator_pass')) {
        if (dialog) {
          dialog.confirm(
            '엘리베이터 키 미인식',
            '가방에 [🪪 엘리베이터 작동권]이 있지만 장신구 슬롯에 장착되지 않았습니다!\n\n지금 바로 [🪪 엘리베이터 작동권]을 장착하고 엘리베이터를 가동하시겠습니까?',
            '🛗',
            () => {
              this.equipItem('equip_elevator_pass');
              this.showToast('🪪 엘리베이터 작동권을 장착했습니다!', 'success');
              this.openElevatorModal();
            }
          );
        } else {
          if (confirm('🛗 [엘리베이터 키 미인식]\n\n가방에 [🪪 엘리베이터 작동권]이 있지만 장신구 슬롯에 장착되지 않았습니다!\n\n지금 바로 장착하시겠습니까?')) {
            this.equipItem('equip_elevator_pass');
            this.showToast('🪪 엘리베이터 작동권을 장착했습니다!', 'success');
            this.openElevatorModal();
          }
        }
        return;
      } else {
        this.addItem('equip_elevator_pass', '엘리베이터 작동권', 1, '🪪', {
          type: 'equipment',
          slot: 'accessory',
          isQuestItem: true,
          stats: { atk: 0, def: 0, hp: 0 },
          effect: '🛗 중앙 엘리베이터 가동 인가증'
        });
        if (dialog) {
          dialog.confirm(
            '작동권 발급',
            '골렘 토벌 기록이 확인되어 [🪪 엘리베이터 작동권]이 지급되었습니다!\n\n지금 바로 장착하고 엘리베이터를 가동하시겠습니까?',
            '🎉',
            () => {
              this.equipItem('equip_elevator_pass');
              this.showToast('🪪 엘리베이터 작동권을 장착했습니다!', 'success');
              this.openElevatorModal();
            }
          );
        } else {
          if (confirm('🎉 [작동권 발급]\n\n골렘 토벌 기록이 확인되어 작동권이 지급되었습니다! 지금 바로 장착하시겠습니까?')) {
            this.equipItem('equip_elevator_pass');
            this.showToast('🪪 엘리베이터 작동권을 장착했습니다!', 'success');
            this.openElevatorModal();
          }
        }
        return;
      }
    }

    // 3. 전 층 선택 모달 오픈
    this.openElevatorModal();
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
      `🤫 [비밀의 철제 사물함 발견!]\n\n누군가 1학년 2반 구석 사물함에 깜빡 두고 간\n[${chosen.icon} ${chosen.name} x${count}개]를 찾았습니다!\n\n(가방에 안전하게 보관되었습니다.)`
    );
  }

  // 🏛️ 숭실역사관 4대 전시관 상호작용 및 특별 칭호 지급
  handleHistoryVitrineInteraction(target) {
    if (!target) return;
    const idx = parseInt(target.vitrineIndex) || 1;
    this.playerData.historyVitrines = this.playerData.historyVitrines || [false, false, false, false];

    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }

    const exhibits = [
      {
        title: '🏛️ [제1전시관] 1897 평양 창립관',
        desc: '1897년 10월 10일, 미국 선교사 윌리엄 베어드(W. M. Baird, 배위량) 박사가 평양 신양동 사택에서 13명의 학생으로 숭실학당을 설립했습니다.\n\n• 건학 이념: \'진리와 봉사 (Truth and Service)\'\n• 한국 근대 교육의 요람이자 최초의 근대 대학 교육의 출발점입니다.'
      },
      {
        title: '🕊️ [제2전시관] 1938 민족신앙 수호관',
        desc: '1938년 일제의 강압적인 신사참배 요구에 끝까지 굴복하지 않고, 기독교 신앙과 민족의 자주정기를 지키기 위해 숭실은 스스로 학교 문을 닫는 \'자진 폐교\'를 결단했습니다.\n\n• 신사참배 거부: 일제의 우상숭배 강요를 단호히 배격한 숭고한 신앙의 절개\n• 자진 폐교의 결단: 불의에 타협하지 않고 학교 문을 닫는 비장한 결단을 내렸으나, 숭실의 굳은 신념은 1954년 서울 재건으로 부활했습니다.'
      },
      {
        title: '🌱 [제3전시관] 1954 서울 재건관',
        desc: '광복 후 1954년 서울 용산구 청파동에서 숭실대학을 재건하고, 은평구 신사동 교정으로 터를 옮겨 숭실중·고등학교가 새롭게 웅비했습니다.\n\n• 민족의 폐허 속에서 다시 일어선 불굴의 부활과 도약의 역사입니다.'
      },
      {
        title: '🌟 [제4전시관] 숭실의 위인관',
        desc: '민족의 시인 윤동주, 독립운동가 조만식 선생, 애국가를 작곡한 안익태 등 수많은 겨레의 등불들이 숭실의 교정에서 꿈을 키웠습니다.\n\n• \'죽는 날까지 하늘을 우러러 한 점 부끄럼이 없기를...\' 숭실의 선배들이 남긴 고귀한 뜻이 오늘날 우리 가슴에 살아 숨쉽니다.'
      }
    ];

    const currentExhibit = exhibits[idx - 1] || exhibits[0];
    const wasExplored = !!this.playerData.historyVitrines[idx - 1];
    this.playerData.historyVitrines[idx - 1] = true;
    this.playerData.visitedMuseumHistory = true;

    // 1차 퀘스트 완료 후 2차 퀘스트 [지(智)] 역사관 덕목 진행 인정
    if (this.playerData.timeCapsuleRewardClaimed) {
      this.playerData.virtueWisdomMuseum = true;
      if (this.playerData.virtueWisdomLibrary) {
        if (!this.playerData.virtueWisdomDone) {
          this.playerData.virtueWisdomDone = true;
          this.showToast('📚 [숭실 3대 덕목 - 지(智)] 도서관 & 역사관 사료 열람 완료! 지혜 증명 완료!', 'success');
        }
      } else {
        this.showToast('🏛️ [숭실 3대 덕목 - 지(智)] 4층 숭실 역사관 열람 완료! (2층 도서관 역사 서가도 방문하세요)', 'info');
      }
    }

    const totalExplored = this.playerData.historyVitrines.filter(Boolean).length;
    this.saveProgress();

    const titleName = '🏛️ 역사를 기억하는 자';
    this.playerData.titles = this.playerData.titles || [];
    const alreadyHasTitle = this.playerData.titles.includes(titleName);

    if (totalExplored >= 4 && !alreadyHasTitle) {
      this.playerData.titles.push(titleName);
      this.equipTitle(titleName);
      if (window.AudioManager && window.AudioManager.playFanfare) {
        window.AudioManager.playFanfare();
      }
      alert(
        `${currentExhibit.title}\n\n"${currentExhibit.desc}"\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎉 [숭실역사관 4대 전시관 완벽 답사 달성!]\n` +
        `숭실 127년의 유구한 역사와 숭고한 정신을 모두 마음에 새겼습니다!\n\n` +
        `🏛️ 특별 한정 칭호 [${titleName}]를 획득 및 자동 착용했습니다!\n` +
        `• 칭호 효과: 공격력 +10, 체력 +30 및 기말고사 파멸신 추가 타격 혜택!`
      );
      return;
    }

    if (!wasExplored) {
      alert(
        `${currentExhibit.title}\n\n"${currentExhibit.desc}"\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🏛️ [전시관 답사 기록 완료]\n` +
        `(현재 답사 현황: ${totalExplored} / 4개)\n` +
        `💡 4대 전시관을 모두 조사하면 특별 칭호 [${titleName}]를 획득할 수 있습니다!`
      );
    } else {
      alert(
        `${currentExhibit.title}\n\n"${currentExhibit.desc}"\n\n` +
        `(현재 답사 현황: ${totalExplored} / 4개)`
      );
    }
  }

  // 🗝️ 숭실역사관 서쪽 비밀의 방 결계 봉인 해제 시스템
  handleSecretHistoryDoor() {
    if (!this.playerData) return;

    // 이미 영구 해제된 경우: 즉시 자유 입장
    if (this.playerData.secretHistoryRoomUnlocked) {
      if (window.AudioManager && typeof window.AudioManager.playWarp === 'function') {
        window.AudioManager.playWarp();
      }
      this.showToast('🗝️ [숭실 비밀의 서고] 127년 역사의 비전이 잠든 비밀의 방으로 입장합니다.', 'success');
      this.engine.teleportTo(0, 'room_secret_history', 8 * 32, 14 * 32);
      return;
    }

    // 4가지 조건 검증:
    // 조건 1. 4대 전시관 모두 조사
    const vitrines = Array.isArray(this.playerData.historyVitrines)
      ? this.playerData.historyVitrines
      : (Array.isArray(this.playerData.historyClues) ? this.playerData.historyClues : [false, false, false, false]);
    const vitrinesCount = vitrines.filter(Boolean).length;
    const cond1Met = (vitrinesCount >= 4);

    // 조건 3. 갓준철에게 메시지 남기기 (6층 교무실 26번 책상 방명록)
    const studentId = this.playerData.studentId || '';
    let localJuncheolNote = '';
    if (studentId) {
      try {
        localJuncheolNote = localStorage.getItem('soongsil_juncheol_guestbook_' + studentId) || '';
      } catch (e) {}
    }
    const currentNote = (this.playerData && this.playerData.juncheolGuestbookNote) || localJuncheolNote || '';
    const cond3Met = (typeof currentNote === 'string' && currentNote.trim().length > 0);

    // 조건 4. 사명석 1개와 역사의 정수 5개 바치기
    const stoneCount = this.getItemCount('item_unyielding_stone');
    const essenceCount = this.getItemCount('item_history_essence');
    const cond4Met = (stoneCount >= 1 && essenceCount >= 5);

    // 사전 조건(조건 1, 3, 4) 미충족 시 현황 안내창 출력
    if (!cond1Met || !cond3Met || !cond4Met) {
      if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
        window.AudioManager.playSelect();
      }
      const status1 = cond1Met ? '✅ 완수 (4/4개 완료)' : `❌ 미완수 (${vitrinesCount}/4개 조사됨)`;
      const status2 = '🔒 봉인 중 (조건 1, 3, 4 충족 시 교훈 암호 입력 가능)';
      const status3 = cond3Met ? '✅ 완수' : '❌ 미완수';
      const status4 = cond4Met
        ? `✅ 완수 (사명석 ${stoneCount}/1개, 정수 ${essenceCount}/5개 보유)`
        : `❌ 미완수 (사명석 ${stoneCount}/1개, 정수 ${essenceCount}/5개 보유 중)`;

      alert(
        `🔒 [숭실역사관 비밀의 방 결계 봉인]\n\n` +
        `단단한 서쪽 석벽 틈새에 고대 룬 결계가 서려 있습니다.\n` +
        `비밀의 방에 입장하려면 아래 4가지 사명의 조건을 모두 완수해야 합니다!\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `[조건 1] 🏛️ 4대 전시관 모두 조사: ${status1}\n` +
        `[조건 2] 📜 숭실 교훈 암호 입력: ${status2}\n` +
        `[조건 3] ✍️ 가장 존경하는 선생님에게 메시지 남기기: ${status3}\n` +
        `[조건 4] 💎 결계 봉인 제물 바치기: ${status4}\n` +
        `   • 💎 꺾이지 않는 사명석 1개 (${stoneCount}/1)\n` +
        `   • 🏛️ 숭실 역사의 정수 5개 (${essenceCount}/5)`
      );
      return;
    }

    // 조건 1, 3, 4 충족 완료 -> 조건 2. 숭실 교훈 입력 프롬프트
    const inputPw = prompt(
      `✨ [숭실역사관 비밀의 방 결계 해제 의식]\n\n` +
      `4대 전시관 완벽 답사, 가장 존경하는 선생님 응원 메시지, 그리고 봉인 제물(사명석 1개, 역사의 정수 5개)이 모두 갖추어졌습니다!\n\n` +
      `비밀의 문을 열기 위해 숭실의 숭고한 교훈 문구를 입력하세요:\n\n` +
      `⚠️ [주의] 결계 해제 시 사명석 1개와 역사의 정수 5개가 제단에 바쳐집니다.\n` +
      `💡 힌트: 역사관 칠판 상단 교훈 액자 ("참과 사랑에 사는 사명인")`
    );

    if (inputPw === null) {
      return; // 취소 버튼 클릭 시 종료
    }

    const cleanInput = (inputPw || '').trim().replace(/\s+/g, '');
    if (cleanInput !== '참과사랑에사는사명인') {
      alert(
        `❌ [결계 봉인 해제 실패]\n\n` +
        `입력하신 교훈 문구가 일치하지 않습니다.\n\n` +
        `💡 힌트: 역사관 칠판 상단에 걸린 숭실의 교훈 액자를 확인해보세요!\n` +
        `("참과 사랑에 사는 사명인")`
      );
      return;
    }

    // 4가지 조건 모두 최종 달성!
    // 제물 공양 (아이템 소모)
    this.removeItem('item_unyielding_stone', 1);
    this.removeItem('item_history_essence', 5);

    // 영구 개방 플래그 저장
    this.playerData.secretHistoryRoomUnlocked = true;
    if (studentId) {
      try {
        localStorage.setItem('soongsil_secret_history_unlocked_' + studentId, 'true');
      } catch (e) {}
    }
    this.saveProgress(true);

    if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
      window.AudioManager.playFanfare();
    }

    alert(
      `🎉 [숭실역사관 비밀의 방 결계 전면 해제!]\n\n` +
      `"참과 사랑에 사는 사명인의 정신과 선생님을 향한 진심이 공명하며,\n` +
      `굳게 닫혀 있던 서쪽 석벽이 열리고 비밀의 통로가 드러났습니다!"\n\n` +
      `💎 꺾이지 않는 사명석 1개와 🏛️ 숭실 역사의 정수 5개가 결계에 바쳐졌습니다.\n` +
      `이제부터 비밀의 방을 언제든 자유롭게 드나들 수 있습니다!`
    );

    this.showToast('🗝️ [이스터에그 봉인 해제!] 숭실 127년 비밀의 서고에 입장합니다!', 'success');
    this.engine.teleportTo(0, 'room_secret_history', 8 * 32, 14 * 32);
  }

  handleSecretHistoryChest() {
    if (!this.playerData) return;
    if (this.playerData.openedSecretHistoryChest) {
      alert('✨ [숭실 고대 비전의 보물함]\n\n"이미 127년 역사의 비전이 담긴 전설의 보물을 모두 획득했습니다. 사명을 가슴에 품고 전진하세요!"');
      return;
    }

    // 비밀의 방에서 보상 획득을 위한 마지막 퀴즈 조건 5: 1897
    const quizAnswer = prompt(
      `✨ [숭실 고대 비전의 보물함 개방 퀴즈 (마지막 관문)]\n\n` +
      `비밀의 보물함을 열기 위한 마지막 5번째 조건입니다!\n\n` +
      `"1897년 평양 신양리에서 윌리엄 M. 베어드 박사에 의해 시작된 숭실학당!\n` +
      `숭실이 처음 창립된 역사적인 연도(4자리 숫자)를 입력하세요:"`
    );

    if (quizAnswer === null) return;

    if (quizAnswer.trim() !== '1897') {
      alert(
        `❌ [보물함 봉인 해제 실패]\n\n` +
        `입력하신 연도 [${quizAnswer.trim()}]는 올바르지 않습니다.\n\n` +
        `숭실의 창립 연도 4자리를 다시 확인해보세요!`
      );
      return;
    }

    this.playerData.openedSecretHistoryChest = true;
    const studentId = this.playerData.studentId;
    if (studentId) {
      try {
        localStorage.setItem('soongsil_secret_history_chest_' + studentId, 'true');
      } catch (e) {}
    }

    // 보상 1: 골드 500 G
    this.addGold(500);

    // 보상 2: 경험치 500 EXP
    this.addExp(500);

    // 보상 3: 3티어 신발 획득 (🥉 청동 스파이크: 공+5, 방+5, 체+10, 질주 4.75)
    this.addItem('equip_bronze_shoes', '🥉 청동 스파이크', 1, '👟', {
      type: 'equipment',
      slot: 'shoes',
      stats: { atk: 5, def: 5, hp: 10 },
      effect: '3티어 신발 · 숭실 역사관 보물'
    });

    this.recalcCombatStats();
    this.saveProgress(true);

    if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
      window.AudioManager.playFanfare();
    }

    alert(
      `🎉 [비밀의 방 최종 관문 통과! 고대 보물함 개방]\n\n` +
      `"1897년 평양 창립의 역사를 증명하고 마침내 숭실 127년 역사의 비전을 손에 넣었습니다!"\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🪙 +500 G (골드 획득)\n` +
      `🌟 +500 EXP (경험치 획득)\n` +
      `👟 [3티어 신발] 🥉 청동 스파이크 획득!\n` +
      `   • 능력치: 공격력 +5, 방어력 +5, 체력 +10\n` +
      `   • 특수 효과: 고속 질주(속도 4.75, +25%) 활성화!\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`
    );
    this.showToast('🎉 [보물함 개방!] 500 G, 500 EXP, 3티어 청동 스파이크를 획득했습니다!', 'success');
  }

  handleSecretHistoryBook(target) {
    const isFirst = (target && target.bookIndex === 1);
    if (isFirst) {
      alert('📜 [숭실 독립운동 비화록 (평양편)]\n\n"1897년 평양 신양리에서 윌리엄 M. 베어드(W. M. Baird) 박사에 의해 설립된 숭실학당.\n일제의 신사참배 강요에 맞서 1938년 자진 폐교를 선택하며 민족의 신앙과 자주성을 지켜낸 불멸의 사명과 역사가 여기에 기록되어 있다."');
    } else {
      alert(`📜 [숭실 127년 비전 사명록 (서울편)]\n\n"1954년 서울 상도동 언덕에서 재건되어 오늘에 이르기까지, 수많은 민족의 지도자와 애국지사를 배출한 숭실.\n\n'진리와 봉사(Truth & Service)'의 교훈 아래 배움과 모험을 이어가는 후배들을 축복하노라!"`);
    }
  }

  handleHistoryAltarInteraction() {
    if (this.craftingManager) {
      this.craftingManager.open('equipment');
    }
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
      `🎉 [숭실이의 입학 축하 선물 지급 완료!]\n\n숭실이가 준 [${chosenItem.icon} ${chosenItem.name}]을(를) 받았습니다!\n\n🎒 가방을 열어 터치하면 즉시 장착하여 전투력(공격력/방어력)을 올릴 수 있어 멍!`
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
      try {
        if (!previewCanvas || !this.engine) return;
        const ctx = previewCanvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        // Soft round shadow at the feet
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        if (ctx.ellipse) {
          ctx.ellipse(28, 67, 18, 5, 0, 0, Math.PI * 2);
        } else {
          ctx.arc(28, 67, 12, 0, Math.PI * 2);
        }
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
        if (spr) {
          ctx.drawImage(spr, 4, 5);
        }
      } catch (err) {
        console.warn('Character preview render warning:', err);
      }
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

    // 초기 캐릭터 실시간 미리보기 렌더링 (안정적인 렌더링을 위해 즉시 및 지연 렌더링 보장)
    updatePreview();
    setTimeout(updatePreview, 60);
    setTimeout(updatePreview, 250);

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

    // 🚀 버전 갱신에 따른 1회성 자동 로컬스토리지 정리 (학생 데이터 일괄 초기화 요청 반영)
    try {
      const PURGE_KEY = 'soongsil_storage_purge_v215';
      if (!localStorage.getItem(PURGE_KEY)) {
        const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('soongsil_'));
        keysToRemove.forEach(k => localStorage.removeItem(k));
        localStorage.setItem(PURGE_KEY, 'done');
        console.log('[Storage] Automatically purged old local student data for clean v215 start.');
      }
    } catch (e) {}

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

      // 🔒 Server Gate Check: Block students when server is closed
      if (!this.isServerOpen && !isTeacher) {
        const msg = '⚠️ [서버 점검 및 수업 대기 안내]\n\n' + (this.serverClosedMessage || '지금은 서버 점검 및 수업 준비 중입니다.\n선생님께서 서버를 개방하실 때까지 잠시 대기해주세요!');
        alert(msg);
        return;
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
          if (saved.hp !== undefined && saved.hp !== null) {
            this.playerData.hp = Math.max(0, Math.min(saved.maxHp || 9999, saved.hp));
          } else {
            this.playerData.hp = saved.baseHp || 100;
          }
          this.playerData.isFallen = !!(saved.isFallen || this.playerData.hp <= 0);
          if (this.engine && this.engine.player) {
            this.engine.player.isFallen = this.playerData.isFallen;
          }
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

          // Filter out deleted items (용의 심장, 아이스 물약, 백호 수호 부적, 고목의 핵, 종강의 황금 월계관)
          const DELETED_IDS = ['item_dragon_heart', 'item_ice_potion', 'equip_tiger_amulet', 'item_golem_core', 'equip_laurel_crown'];
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
          this.playerData.hasReadDevNote = !!(saved.hasReadDevNote || (studentId && localStorage.getItem('soongsil_dev_note_1_' + studentId) === 'true'));
          this.playerData.hasReadDevNote2 = !!(saved.hasReadDevNote2 || (studentId && localStorage.getItem('soongsil_dev_note_2_' + studentId) === 'true'));
          this.playerData.hasClearedFirstBoss = !!(saved.hasClearedFirstBoss || (studentId && localStorage.getItem('soongsil_first_boss_cleared_' + studentId) === 'true'));
          this.playerData.hasClearedDragonRaid = !!(saved.hasClearedDragonRaid || (studentId && localStorage.getItem('soongsil_dragon_cleared_' + studentId) === 'true'));
          this.playerData.hasClearedCerberusRaid = !!(saved.hasClearedCerberusRaid || (studentId && localStorage.getItem('soongsil_cerberus_cleared_' + studentId) === 'true'));
          this.playerData.hasClearedClass704 = !!(saved.hasClearedClass704 || (studentId && localStorage.getItem('soongsil_class704_cleared_' + studentId) === 'true'));
          this.playerData.job = saved.job || (studentId ? localStorage.getItem('soongsil_job_' + studentId) : null) || null;
          if (this.playerData.job === 'wrestler' || this.playerData.job === 'guardian' || this.playerData.job === 'mentor') {
            this.playerData.job = 'fighter';
          } else if (this.playerData.job === 'scout' || this.playerData.job === 'artist') {
            this.playerData.job = null;
          }
          this.playerData.hasEscapedCareerRoom = !!(saved.hasEscapedCareerRoom || (studentId && localStorage.getItem('soongsil_career_escaped_' + studentId) === 'true'));
          this.playerData.careerClues = Array.isArray(saved.careerClues) ? saved.careerClues : [false, false, false, false, false, false];
          if (!this.playerData.careerClues.some(Boolean) && studentId) {
            try {
              const localClues = localStorage.getItem('soongsil_career_clues_' + studentId);
              if (localClues) this.playerData.careerClues = JSON.parse(localClues);
            } catch (e) {}
          }
          this.playerData.historyVitrines = Array.isArray(saved.historyVitrines) ? saved.historyVitrines : [false, false, false, false];
          this.playerData.solvedMoralQuestionIds = Array.isArray(saved.solvedMoralQuestionIds) ? saved.solvedMoralQuestionIds : [];
          if (this.playerData.solvedMoralQuestionIds.length === 0 && studentId) {
            try {
              const localSolved = localStorage.getItem('soongsil_class704_solved_' + studentId);
              if (localSolved) this.playerData.solvedMoralQuestionIds = JSON.parse(localSolved);
            } catch (e) {}
          }
          const LEGACY_TITLE_MAP = {
            '🩺 생명을 살리는 의사': '🩺 수호의 메딕',
            '💻 미래를 코딩하는 엔지니어': '⚡ 질주의 러너',
            '🔬 진리를 밝히는 연구원': '📚 지혜의 스칼라',
            '🔭 미래를 여는 과학자': '🪙 황금의 뱅커',
            '🎨 영감을 주는 디자이너': null,
            '🍀 행운의 스카우트': null,
            '🤝 마음을 보듬는 멘토': '🥊 불패의 파이터',
            '🛡️ 철벽의 가디언': '🥊 불패의 파이터',
            '🤼 투지의 레슬러': '🥊 불패의 파이터'
          };
          this.playerData.titles = Array.isArray(saved.titles)
            ? [...new Set(saved.titles.map(t => (t in LEGACY_TITLE_MAP ? LEGACY_TITLE_MAP[t] : t)).filter(Boolean))]
            : [];
          this.playerData.equippedTitle = saved.equippedTitle
            ? (saved.equippedTitle in LEGACY_TITLE_MAP ? LEGACY_TITLE_MAP[saved.equippedTitle] : saved.equippedTitle)
            : null;
          this.playerData.quests = (saved.quests && typeof saved.quests === 'object') ? saved.quests : {};
          if (Object.keys(this.playerData.quests).length === 0 && studentId) {
            try {
              const localQuests = localStorage.getItem('soongsil_quests_' + studentId);
              if (localQuests) this.playerData.quests = JSON.parse(localQuests);
            } catch (e) {}
          }
          this.playerData.secretHistoryRoomUnlocked = !!saved.secretHistoryRoomUnlocked;
          if (!this.playerData.secretHistoryRoomUnlocked && studentId) {
            this.playerData.secretHistoryRoomUnlocked = (localStorage.getItem('soongsil_secret_history_unlocked_' + studentId) === 'true');
          }
          this.playerData.openedSecretHistoryChest = !!saved.openedSecretHistoryChest;
          if (!this.playerData.openedSecretHistoryChest && studentId) {
            this.playerData.openedSecretHistoryChest = (localStorage.getItem('soongsil_secret_history_chest_' + studentId) === 'true');
          }
          this.playerData.hiddenQuestCareer1 = saved.hiddenQuestCareer1 || (studentId ? localStorage.getItem('soongsil_hidden_career_1_' + studentId) : null) || null;
          this.playerData.hasHangangwooBookmark = !!(saved.hasHangangwooBookmark || (studentId && localStorage.getItem('soongsil_hangangwoo_bookmark_' + studentId) === 'true'));
          this.playerData.hiddenQuestCareer2 = saved.hiddenQuestCareer2 || (studentId ? localStorage.getItem('soongsil_hidden_career_2_' + studentId) : null) || null;
          console.log(`[Storage] 학생(${studentId}) 누적 영구 데이터 복구 완료: Lv.${this.playerData.level}, ${this.playerData.gold}G, 인벤토리 ${this.playerData.inventory.length}종, 호칭: ${this.playerData.equippedTitle || '없음'}, 1차골렘클리어: ${this.playerData.hasClearedFirstBoss}, 704클리어: ${this.playerData.hasClearedClass704}`);
        } else {
          this.playerData.hasReceivedSoongsilGift = (studentId && localStorage.getItem('soongsil_gift_' + studentId) === 'true');
          this.playerData.hasOpenedSecretLocker = (studentId && localStorage.getItem('soongsil_secret_locker_' + studentId) === 'true');
          this.playerData.hasCheckedMirror = (studentId && localStorage.getItem('soongsil_mirror_' + studentId) === 'true');
          this.playerData.hasOpenedLostBox = (studentId && localStorage.getItem('soongsil_lost_box_' + studentId) === 'true');
          this.playerData.hasReadDevNote = (studentId && localStorage.getItem('soongsil_dev_note_1_' + studentId) === 'true');
          this.playerData.hasReadDevNote2 = (studentId && localStorage.getItem('soongsil_dev_note_2_' + studentId) === 'true');
          this.playerData.hasClearedFirstBoss = !!(studentId && localStorage.getItem('soongsil_first_boss_cleared_' + studentId) === 'true');
          this.playerData.hasClearedDragonRaid = !!(studentId && localStorage.getItem('soongsil_dragon_cleared_' + studentId) === 'true');
          this.playerData.hasClearedCerberusRaid = !!(studentId && localStorage.getItem('soongsil_cerberus_cleared_' + studentId) === 'true');
          this.playerData.hasClearedClass704 = !!(studentId && localStorage.getItem('soongsil_class704_cleared_' + studentId) === 'true');
          this.playerData.job = studentId ? localStorage.getItem('soongsil_job_' + studentId) : null;
          this.playerData.hasEscapedCareerRoom = !!(studentId && localStorage.getItem('soongsil_career_escaped_' + studentId) === 'true');
          this.playerData.careerClues = [false, false, false, false, false, false];
          if (studentId) {
            try {
              const localClues = localStorage.getItem('soongsil_career_clues_' + studentId);
              if (localClues) this.playerData.careerClues = JSON.parse(localClues);
            } catch (e) {}
          }
          this.playerData.historyVitrines = [false, false, false, false];
          this.playerData.solvedMoralQuestionIds = [];
          if (studentId) {
            try {
              const localSolved = localStorage.getItem('soongsil_class704_solved_' + studentId);
              if (localSolved) this.playerData.solvedMoralQuestionIds = JSON.parse(localSolved);
            } catch (e) {}
          }
          this.playerData.titles = [];
          this.playerData.equippedTitle = null;
          this.playerData.secretHistoryRoomUnlocked = (studentId && localStorage.getItem('soongsil_secret_history_unlocked_' + studentId) === 'true');
          this.playerData.openedSecretHistoryChest = (studentId && localStorage.getItem('soongsil_secret_history_chest_' + studentId) === 'true');
          this.playerData.hiddenQuestCareer1 = studentId ? localStorage.getItem('soongsil_hidden_career_1_' + studentId) : null;
          this.playerData.hasHangangwooBookmark = !!(studentId && localStorage.getItem('soongsil_hangangwoo_bookmark_' + studentId) === 'true');
          this.playerData.hiddenQuestCareer2 = studentId ? localStorage.getItem('soongsil_hidden_career_2_' + studentId) : null;
          this.playerData.quests = {};
          if (studentId) {
            try {
              const localQuests = localStorage.getItem('soongsil_quests_' + studentId);
              if (localQuests) this.playerData.quests = JSON.parse(localQuests);
            } catch (e) {}
          }
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
      this.engine.player.hp = this.playerData.hp;
      this.engine.player.maxHp = this.playerData.maxHp;

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
              hp: (this.playerData.hp !== undefined && this.playerData.hp !== null) ? this.playerData.hp : 100,
              maxHp: this.playerData.maxHp || 100,
              isFallen: !!this.playerData.isFallen,
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
              hasReadDevNote: !!this.playerData.hasReadDevNote,
              hasReadDevNote2: !!this.playerData.hasReadDevNote2,
              hasClearedFirstBoss: !!this.playerData.hasClearedFirstBoss,
              hasClearedDragonRaid: !!this.playerData.hasClearedDragonRaid,
              hasClearedCerberusRaid: !!this.playerData.hasClearedCerberusRaid,
              hasClearedClass704: !!this.playerData.hasClearedClass704,
              job: this.playerData.job || null,
              hasEscapedCareerRoom: !!this.playerData.hasEscapedCareerRoom,
              careerClues: Array.isArray(this.playerData.careerClues) ? this.playerData.careerClues : [false, false, false, false, false, false],
              historyVitrines: Array.isArray(this.playerData.historyVitrines) ? this.playerData.historyVitrines : [false, false, false, false],
              solvedMoralQuestionIds: Array.isArray(this.playerData.solvedMoralQuestionIds) ? this.playerData.solvedMoralQuestionIds : [],
              titles: this.playerData.titles || [],
              equippedTitle: this.playerData.equippedTitle || null,
              secretHistoryRoomUnlocked: !!this.playerData.secretHistoryRoomUnlocked,
              openedSecretHistoryChest: !!this.playerData.openedSecretHistoryChest,
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

    // 🧭 Roadmap & 📖 Codex Top Quick Buttons
    const btnRoadmap = document.getElementById('btn-open-roadmap');
    if (btnRoadmap) {
      btnRoadmap.addEventListener('click', () => this.openRoadmapModal());
    }
    const btnCodex = document.getElementById('btn-open-codex');
    if (btnCodex) {
      btnCodex.addEventListener('click', () => this.openCodexModal());
    }

    // Sound Toggle Button
    const btnToggleSound = document.getElementById('btn-toggle-sound');
    if (btnToggleSound && window.AudioManager) {
      window.AudioManager.updateMuteButtonUI();
      btnToggleSound.addEventListener('click', () => {
        window.AudioManager.toggleMute();
      });
    }

    // Mobile Virtual Gamepad (D-Pad + Action Buttons) Toggle Button
    const btnToggleGamepad = document.getElementById('btn-toggle-gamepad');
    const updateGamepadUI = (enabled) => {
      const container = document.getElementById('canvas-wrapper');
      if (container) {
        if (enabled) {
          container.classList.remove('gamepad-hidden');
        } else {
          container.classList.add('gamepad-hidden');
        }
      }
      if (btnToggleGamepad) {
        if (enabled) {
          btnToggleGamepad.classList.add('gamepad-active');
          btnToggleGamepad.title = '가상 게임패드 끄기 (D-패드 & A/B 버튼 숨김)';
        } else {
          btnToggleGamepad.classList.remove('gamepad-active');
          btnToggleGamepad.title = '가상 게임패드 켜기 (D-패드 & A/B 버튼 표시)';
        }
      }
    };

    const isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768);
    const savedGamepad = localStorage.getItem('soongsil_virtual_gamepad');
    let gamepadEnabled = savedGamepad !== null ? (savedGamepad === 'true') : isTouchDevice;
    updateGamepadUI(gamepadEnabled);

    if (btnToggleGamepad) {
      btnToggleGamepad.addEventListener('click', () => {
        gamepadEnabled = !gamepadEnabled;
        localStorage.setItem('soongsil_virtual_gamepad', gamepadEnabled ? 'true' : 'false');
        updateGamepadUI(gamepadEnabled);
        if (window.AudioManager) window.AudioManager.playSelect();
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
      btnCloseBossX.addEventListener('click', () => {
        this.modalBossRaid.classList.add('hidden');
        if (this.bossTimerInterval) {
          clearInterval(this.bossTimerInterval);
          this.bossTimerInterval = null;
        }
        this.updateFallenBannerUI();
      });
    }

    const btnBannerRespawn = document.getElementById('btn-banner-respawn');
    if (btnBannerRespawn) {
      btnBannerRespawn.addEventListener('click', () => {
        this.respawnAtHallway();
      });
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
        if (this.loadSavedStudentsForEditor) {
          this.loadSavedStudentsForEditor();
        }
      });
    }

    // 🔒 Teacher Server Gate buttons
    const btnToggleServer = document.getElementById('btn-teacher-toggle-server');
    if (btnToggleServer) {
      btnToggleServer.addEventListener('click', () => this.handleTeacherToggleServer());
    }
    const btnHudServerToggle = document.getElementById('btn-teacher-hud-server-toggle');
    if (btnHudServerToggle) {
      btnHudServerToggle.addEventListener('click', () => this.handleTeacherToggleServer());
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
      this.engine.setDashing(!!this.engine.player.isDashing);
    }

    const lvBonus = Math.max(0, (this.playerData.level || 1) - 1);
    let bonusAtk = 0;
    let bonusDef = 0;
    let bonusHp = 0;

    if (this.playerData.equipment) {
      // 장신구 1, 2 동일 아이템 중복 착용 방지 안전 정리
      if (this.playerData.equipment.accessory && this.playerData.equipment.accessory2) {
        if (this.playerData.equipment.accessory.item === this.playerData.equipment.accessory2.item) {
          this.playerData.equipment.accessory2 = null;
        }
      }
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

        // 🌟 진로 직업 패시브 스킬 스탯 보너스 (각 직업은 고유 특수 기능만 적용)

    // 🏛️ 역사관 특별 칭호 보너스
    if (this.playerData.equippedTitle === '🏛️ 역사를 기억하는 자') {
      bonusAtk += 10;
      bonusHp += 30;
    }

    // 🔥 용기의 물약 버프 (공격력 +5 증가)
    if (this.isBuffActive && this.isBuffActive('courage_boost')) {
      bonusAtk += 5;
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
    if (this.engine && this.engine.player) {
      this.engine.player.hp = this.playerData.hp;
      this.engine.player.maxHp = this.playerData.maxHp;
    }
    const pct = Math.max(0, Math.min(100, Math.floor((this.playerData.hp / this.playerData.maxHp) * 100)));
    const txt = document.getElementById('side-hp-text');
    const fill = document.getElementById('side-hp-fill');
    if (txt) txt.innerText = `${this.playerData.hp} / ${this.playerData.maxHp}`;
    if (fill) fill.style.width = `${pct}%`;
    this.updateFallenBannerUI();
  }

  updateFallenBannerUI() {
    const banner = document.getElementById('fallen-respawn-banner');
    if (!banner) return;
    const isFallen = !!(this.playerData && (this.playerData.isFallen || this.playerData.hp <= 0));
    if (isFallen) {
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
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

    // 5. 체력 자연 회복 및 UI 동기화 (메딕 직업은 3초당 3 HP 회복)
    const regenAmount = (this.playerData.job === 'doctor' || this.playerData.job === 'medic') ? 3 : 1;
    this.playerData.hp = Math.min(this.playerData.maxHp, this.playerData.hp + regenAmount);
    this.updateHpBar();

    const equipHp = document.getElementById('equip-total-hp');
    if (equipHp && this.modalEquipment && !this.modalEquipment.classList.contains('hidden')) {
      equipHp.innerText = `${this.playerData.hp} / ${this.playerData.maxHp}`;
    }

    // 체력 감소 즉시 영구 저장 (새로고침으로 피 채우는 편법 차단)
    this.saveProgress(true);
  }

  takeQuizDamage(amount) {
    if (!this.playerData || this.playerData.hp <= 0 || this.playerData.isFallen) return 0;

    let penalty = Math.max(1, amount || 1);
    // 🩺 메딕 직업: 퀴즈 오답 체력 데미지 10% 감소
    if (this.playerData.job === 'medic' || this.playerData.job === 'doctor') {
      penalty = Math.max(1, Math.round(penalty * 0.9));
    }
    this.playerData.hp = Math.max(0, this.playerData.hp - penalty);
    this.updateHpBar();

    const equipHp = document.getElementById('equip-total-hp');
    if (equipHp && this.modalEquipment && !this.modalEquipment.classList.contains('hidden')) {
      equipHp.innerText = `${this.playerData.hp} / ${this.playerData.maxHp}`;
    }

    // 체력 감소 즉시 영구 저장 (새로고침으로 피 채우는 편법 차단)
    this.saveProgress(true);

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

      // 동일한 장신구 중복 착용 차단 검사 (같은 장신구 2개 동시 착용 불가)
      const otherSlot = (slot === 'accessory') ? 'accessory2' : 'accessory';
      if (this.playerData.equipment[otherSlot] && this.playerData.equipment[otherSlot].item === itemId) {
        if (window.AudioManager && window.AudioManager.playDeny) window.AudioManager.playDeny();
        this.showToast('⚠️ 동일한 장신구는 동시에 중복 착용할 수 없습니다!', 'warning');
        return;
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
    if (this.playerData && (this.playerData.isFallen || this.playerData.hp <= 0)) {
      alert('💀 기절한 상태에서는 스스로 물약을 마실 수 없습니다!\n동료의 [부활 주문서]를 받거나 복도에서 부활하세요.');
      return false;
    }

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
        const isReturnScroll = (item.item === 'item_return_scroll');
        const isTeleportScroll = (item.item === 'item_teleport_scroll');
        const isGreenPotion = (item.item === 'item_green_potion');
        const isCouragePotion = (item.item === 'item_courage_potion');
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
          if (isTeleportScroll) {
            statBadgeHtml = `<span class="inv-item-stat-badge potion" style="color:#c084fc;">🌀 복도 및 운동장 구역으로 공간 이동</span>`;
          } else if (isReturnScroll) {
            statBadgeHtml = `<span class="inv-item-stat-badge potion" style="color:#38bdf8;">🌀 7층 복도로 즉시 공간 이동</span>`;
          } else if (isScroll) {
            statBadgeHtml = `<span class="inv-item-stat-badge potion" style="color:#c084fc;">💫 쓰러진 친구 50% 체력 부활</span>`;
          } else if (isGreenPotion) {
            statBadgeHtml = `<span class="inv-item-stat-badge potion" style="color:#4ade80;">⚡ 1분간 기본 이동속도 +10%</span>`;
          } else if (isCouragePotion) {
            statBadgeHtml = `<span class="inv-item-stat-badge potion" style="color:#c084fc;"><span class="icon-purple-potion">🧪</span> 3분간 공격력(ATK) +5</span>`;
          } else {
            const healAmount = heal || 10;
            statBadgeHtml = `<span class="inv-item-stat-badge potion">🧪 체력 +${healAmount} 즉시 회복</span>`;
          }
        } else {
          // Material
          const matDesc = effect || '장비 제작 및 상위 합성 재료';
          statBadgeHtml = `<span class="inv-item-stat-badge material">📦 ${matDesc}</span>`;
        }

        const iconHtml = isCouragePotion
          ? `<span class="icon-purple-potion">${item.icon || '🧪'}</span>`
          : `<span>${item.icon || '📦'}</span>`;

        card.innerHTML = `
          <div class="inv-item-icon-box">
            ${iconHtml}
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
          let btnClass = 'btn-inv-potion';
          let btnText = '마시기';

          if (isTeleportScroll) {
            btnClass = 'btn-inv-teleport';
            btnText = '순간이동';
          } else if (isReturnScroll) {
            btnClass = 'btn-inv-return';
            btnText = '귀환';
          } else if (isScroll) {
            btnClass = 'btn-inv-scroll';
            btnText = '사용';
          } else if (isCouragePotion) {
            btnClass = 'btn-inv-courage';
            btnText = '마시기';
          }

          btn.className = 'btn-inv-action ' + btnClass;
          btn.innerText = btnText;

          const handleUse = () => {
            if (isTeleportScroll) this.useTeleportScroll();
            else if (isReturnScroll) this.useReturnScroll();
            else if (isScroll) this.attemptUseReviveScroll();
            else if (isGreenPotion) this.useGreenPotion();
            else if (isCouragePotion) this.useCouragePotion();
            else this.usePotion(item.item);
          };

          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleUse();
          });
          card.style.cursor = 'pointer';
          card.addEventListener('click', () => {
            handleUse();
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
        lockMsg: '퀘스트로 해금'
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
          alert('🔒 장신구 2번 슬롯은 현재 잠겨 있습니다.\n\n6층 교무실 교감선생님의 [숭실 3대 덕목 검증: 지·덕·체 모범 학생 인증] 퀘스트를 완료하면 영구 해금됩니다!');
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

    const isLeatherGolemRaid = (
      (this.engine && this.engine.player && this.engine.player.room === 'room_702') ||
      (bossData && (bossData.id === 'boss_leather_golem' || bossData.id === 'boss_s1_treegolem' || (bossData.name && bossData.name.includes('골렘'))))
    );

    // ========================================================
    // 🪵 1학년 2반: 가죽 골렘 1:1 솔로 상시 토벌 (교사 협동 레이드와 완전 분리)
    // ========================================================
    if (isLeatherGolemRaid) {
      let useWeaknessScroll = false;
      const hasWeaknessScroll = this.hasItem('item_golem_weakness_scroll') || (this.playerData && this.playerData.inventory && this.playerData.inventory['item_golem_weakness_scroll'] > 0);
      if (hasWeaknessScroll) {
        const confirmUse = confirm(
          "📜 [골렘 연화 비책 사용]\n\n가방에 '📜 한강우의 골렘 연화 비책'을 소지하고 있습니다.\n가죽 골렘의 체력을 50% 약화시키는 비책을 사용하시겠습니까?\n\n[확인]: 비책 사용 (가죽 골렘 체력 50% 반감 ➔ HP 1,000)\n[취소]: 비책을 사용하지 않고 도전 (HP 2,000 유지)"
        );
        if (confirmUse) {
          useWeaknessScroll = true;
        }
      }

      const finalHp = useWeaknessScroll ? 1000 : 2000;
      window.BOSS_CONFIG = {
        ...window.BOSS_CONFIG,
        name: '🪵 가죽 골렘',
        title: '1-2반 1:1 솔로 상시 토벌',
        level: 10,
        mode: 'solo', // 무조건 1:1 솔로 레이드로 고정
        unitFilter: 'ALL',
        maxHp: finalHp,
        currentHp: finalHp,
        atk: 30,
        def: 14,
        rewardGold: 100,
        rewardExp: 200,
        isWeakened: useWeaknessScroll,
        expiresAt: Date.now() + 180 * 1000
      };

      this.bossState.currentHp = finalHp;
      this.bossState.maxHp = finalHp;
      this.bossState.hasAttacked = false;
      this.bossState.damageDealt = 0;

      document.getElementById('boss-raid-title').innerText = '🪵 가죽 골렘 [1:1 솔로 상시 토벌]';
      document.getElementById('boss-name-label').innerText = '🪵 가죽 골렘';

      const weaknessBanner = document.getElementById('raid-weakness-alert-banner');
      if (weaknessBanner) {
        if (useWeaknessScroll) {
          weaknessBanner.style.display = 'block';
          weaknessBanner.classList.remove('hidden');
          weaknessBanner.innerText = '✨ [골렘 연화 비책 발동] 한강우 선생님의 비책으로 가죽 골렘의 체력이 50% 약화되었습니다! (HP 1,000)';
        } else {
          weaknessBanner.style.display = 'none';
          weaknessBanner.classList.add('hidden');
        }
      }

      if (useWeaknessScroll) {
        document.getElementById('raid-battle-log').innerHTML = `<span style="color:#22c55e; font-weight:bold;">✨ [골렘 연화 비책 발동] 한강우 선생님의 비책으로 가죽 골렘의 체력이 50% 약화되었습니다! (HP 1,000)</span><br>⚔️ 문제를 맞히면 내 공격력(${this.playerData.atk})으로 공격합니다.`;
      } else {
        document.getElementById('raid-battle-log').innerHTML = `⚔️ 문제를 맞히면 내 공격력(${this.playerData.atk})으로 공격합니다.`;
      }

      this.updateBossRaidUI();
      this.loadNextBossQuestion();
      this.modalBossRaid.classList.remove('hidden');

      if (this.bossTimerInterval) clearInterval(this.bossTimerInterval);
      this.bossTimerInterval = setInterval(() => {
        if (this.modalBossRaid && !this.modalBossRaid.classList.contains('hidden')) {
          this.updateBossRaidTimerOnly();
        } else {
          clearInterval(this.bossTimerInterval);
          this.bossTimerInterval = null;
        }
      }, 500);
      return;
    }

    // ========================================================
    // 🏟️ 운동장/외부 보스 레이드 (교사 협동 레이드 또는 청동 드래곤 솔로)
    // ========================================================
    const isDragonRaid = (
      (this.engine && this.engine.player && this.engine.player.room === 'playground' && bossData && (bossData.id === 'boss_bronze_dragon' || (bossData.name && bossData.name.includes('드래곤')))) ||
      (bossData && bossData.id === 'boss_bronze_dragon')
    );

    const isSoloRaid = (!window.BOSS_CONFIG.active && isDragonRaid);

    if (!window.BOSS_CONFIG.active && !isSoloRaid) {
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

    if (isSoloRaid && isDragonRaid) {
      const baseHp = (bossData && bossData.maxHp) || 5000;
      window.BOSS_CONFIG = {
        ...window.BOSS_CONFIG,
        name: '🐲 고대 청동 드래곤',
        level: (bossData && bossData.level) || 15,
        mode: 'solo',
        unitFilter: 'ALL',
        maxHp: baseHp,
        currentHp: baseHp,
        atk: (bossData && bossData.atk) || 45,
        def: (bossData && bossData.def) || 20,
        rewardGold: 250,
        rewardExp: 400,
        isWeakened: false,
        expiresAt: Date.now() + 180 * 1000
      };
    }

    if (this.bossState.currentHp <= 0 || isSoloRaid) {
      this.bossState.currentHp = window.BOSS_CONFIG.maxHp;
    }
    this.bossState.maxHp = window.BOSS_CONFIG.maxHp;
    this.bossState.hasAttacked = false;
    this.bossState.damageDealt = 0;

    const modeTag = window.BOSS_CONFIG.mode === 'coop' ? '협동 레이드' : '1:1 솔로 레이드';
    document.getElementById('boss-raid-title').innerText = `${window.BOSS_CONFIG.name} [${modeTag}]`;
    document.getElementById('boss-name-label').innerText = window.BOSS_CONFIG.name;

    // 전투창 상단 비책 발동 점등 알림
    const weaknessBanner = document.getElementById('raid-weakness-alert-banner');
    if (weaknessBanner) {
      if (window.BOSS_CONFIG.isWeakened) {
        weaknessBanner.style.display = 'block';
        weaknessBanner.classList.remove('hidden');
        weaknessBanner.innerText = '✨ [골렘 연화 비책 발동] 한강우 선생님의 비책으로 가죽 골렘의 체력이 50% 약화되었습니다! (HP 1,000)';
      } else {
        weaknessBanner.style.display = 'none';
        weaknessBanner.classList.add('hidden');
      }
    }

    if (window.BOSS_CONFIG.isWeakened) {
      document.getElementById('raid-battle-log').innerHTML = `<span style="color:#22c55e; font-weight:bold;">✨ [골렘 연화 비책 발동] 한강우 선생님의 비책으로 가죽 골렘의 체력이 50% 약화되었습니다! (HP 1,000)</span><br>⚔️ 문제를 맞히면 내 공격력(${this.playerData.atk})으로 공격합니다.`;
    } else {
      document.getElementById('raid-battle-log').innerHTML = `⚔️ 문제를 맞히면 내 공격력(${this.playerData.atk})으로 공격합니다.`;
    }

    this.updateBossRaidUI();
    this.loadNextBossQuestion();
    this.modalBossRaid.classList.remove('hidden');

    if (this.bossTimerInterval) clearInterval(this.bossTimerInterval);
    this.bossTimerInterval = setInterval(() => {
      if (this.modalBossRaid && !this.modalBossRaid.classList.contains('hidden')) {
        this.updateBossRaidTimerOnly();
      } else {
        clearInterval(this.bossTimerInterval);
        this.bossTimerInterval = null;
      }
    }, 500);
  }

  updateBossRaidTimerOnly() {
    const timerText = document.getElementById('boss-raid-timer-text');
    const timerBar = document.getElementById('boss-raid-timer-bar');
    if (!timerText) return;
    if (window.BOSS_CONFIG && window.BOSS_CONFIG.expiresAt) {
      const remainingMs = Math.max(0, window.BOSS_CONFIG.expiresAt - Date.now());
      const totalSec = Math.floor(remainingMs / 1000);
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;
      timerText.innerText = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
      if (timerBar) {
        if (totalSec <= 30) {
          timerBar.classList.add('urgent');
        } else {
          timerBar.classList.remove('urgent');
        }
      }
    } else {
      timerText.innerText = '03:00';
      if (timerBar) timerBar.classList.remove('urgent');
    }
  }

  onBossRaidTimeout(data) {
    if (this.modalBossRaid) {
      this.modalBossRaid.classList.add('hidden');
    }
    if (this.bossTimerInterval) {
      clearInterval(this.bossTimerInterval);
      this.bossTimerInterval = null;
    }
    if (window.AudioManager) {
      window.AudioManager.playHit();
    }
    alert(data && data.message ? data.message : '⏳ [레이드 시간 초과] 3분 제한시간이 초과되어 보스가 격노하고 학생들을 복도로 밀어냈습니다!');
  }

  onBossRaidWiped(data) {
    if (window.AudioManager) {
      window.AudioManager.playHit();
    }
    this.bossState.currentHp = this.bossState.maxHp;
    this.updateBossRaidUI();
    const logEl = document.getElementById('raid-battle-log');
    if (logEl) {
      logEl.innerHTML = `<span style="color:#ef4444; font-weight:bold;">💀 [전원 기절 전멸] 보스가 체력을 100% 회복했습니다!</span>`;
    }
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

// 1학년 2반은 가죽 골렘 상시 토벌로 완전 분리 유지 (교사 협동 레이드와 비연동)

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
    if (this.bossTimerInterval) {
      clearInterval(this.bossTimerInterval);
      this.bossTimerInterval = null;
    }
    if (!data || !data.isSoloClear) {
      window.BOSS_CONFIG.active = false;
    }
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
          this.addItem('item_red_potion', '빨간 물약', 1, '🧪', { type: 'consumable', heal: 10, effect: '체력 +10 회복' });
        } else {
          droppedOrange++;
          this.addItem('item_orange_potion', '주홍 물약', 1, '🧪', { type: 'consumable', heal: 25, effect: '체력 +25 회복' });
        }
      }

      const rewardItemsList = [];
      if (droppedRed > 0) rewardItemsList.push(`🧪 빨간 물약 x${droppedRed}`);
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
            { item: 'equip_leather_sword', name: '가죽손잡이 세이버', icon: '🗡️', slot: 'weapon', stats: { atk: 22, def: 0, hp: 0 }, effect: '공격력 +22' },
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
            { item: 'equip_bronze_sword', name: '청동검', icon: '⚔️', slot: 'weapon', stats: { atk: 30, def: 0, hp: 0 }, effect: '공격력 +30' },
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

      // 7. 기말고사 파멸신 전용 드랍 테이블:
      // • 순간이동 주문서 1개 (100% 확정 고정 드랍)
      // • 4티어 헤리티지 부츠 (20% 확률)
      // • 컴싸 마법봉 (40% 확률)
      // • 합심의 황금 은행잎 부적 (1% 확률)
      if (bName.includes('파멸신') || bName.includes('기말고사')) {
        // 순간이동 주문서 1개 고정 드랍 (100%)
        this.addItem('item_teleport_scroll', '순간이동 주문서', 1, '📜', {
          type: 'consumable',
          effect: '등록된 주요 장소로 즉시 공간이동'
        });
        rewardItemsList.push('📜 순간이동 주문서 1개 (확정 전리품)');

        // 4티어 헤리티지 부츠 (20% 확률)
        if (Math.random() * 100 < 20) {
          this.addItem('equip_heritage_boots', '👑 1897 숭실 헤리티지 부츠', 1, '👟', {
            type: 'equipment',
            slot: 'shoes',
            stats: { atk: 6, def: 6, hp: 15 },
            effect: '4티어 신발'
          });
          rewardItemsList.push('👟 👑 1897 숭실 헤리티지 부츠 (4티어 전설 신발 득템 - 20% 확률!)');
        }

        // 컴싸 마법봉 (40% 확률)
        if (Math.random() * 100 < 40) {
          this.addItem('equip_omr_wand', '컴싸 마법봉', 1, '🖊️', {
            type: 'equipment',
            slot: 'weapon',
            stats: { atk: 45, def: 5, hp: 30 },
            effect: '기말고사 파멸신 전리품 · 공격력 +45, 방어력 +5'
          });
          rewardItemsList.push('🖊️ 컴싸 마법봉 (40% 희귀 무기 드랍!)');
        }

        // 합심의 황금 은행잎 부적 (1% 대박 드랍)
        if (Math.random() * 100 < 1) {
          this.addItem('equip_ginkgo_talisman', '합심의 황금 은행잎 부적', 1, '🍂', {
            type: 'equipment',
            slot: 'accessory',
            stats: { atk: 15, def: 10, hp: 30 },
            effect: '공격력 +15, 방어력 +10, 체력 +30'
          });
          rewardItemsList.push('🍂 합심의 황금 은행잎 부적 (1% 초특급 대박 장신구 득템!)');
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
    if (bossHpText) bossHpText.innerText = `HP ${this.bossState.currentHp.toLocaleString()} / ${this.bossState.maxHp.toLocaleString()}`;

    const weaknessBanner = document.getElementById('raid-weakness-alert-banner');
    if (weaknessBanner) {
      if (window.BOSS_CONFIG && window.BOSS_CONFIG.isWeakened) {
        weaknessBanner.style.display = 'block';
        weaknessBanner.classList.remove('hidden');
        weaknessBanner.innerText = '✨ [골렘 연화 비책 발동] 한강우 선생님의 비책으로 가죽 골렘의 체력이 50% 약화되었습니다! (HP 1,000)';
      } else {
        weaknessBanner.style.display = 'none';
        weaknessBanner.classList.add('hidden');
      }
    }
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
      btnRed.innerHTML = `<span class="icon-red-potion">🧪</span> 빨간 물약 (+10) ${redCount}개`;
      btnRed.disabled = (redCount <= 0 || this.playerData.hp >= this.playerData.maxHp || this.playerData.isFallen);
    }

    const orangePot = this.playerData.inventory.find(i => i.item === 'item_orange_potion');
    const orangeCount = orangePot ? orangePot.count : 0;
    const btnOrange = document.getElementById('btn-raid-use-orange-potion');
    if (btnOrange) {
      btnOrange.innerHTML = `<span class="icon-orange-potion">🧪</span> 주홍 물약 (+25) ${orangeCount}개`;
      btnOrange.disabled = (orangeCount <= 0 || this.playerData.hp >= this.playerData.maxHp || this.playerData.isFallen);
    }

    const scroll = this.playerData.inventory.find(i => i.item === 'item_revive_scroll');
    const scrollCount = scroll ? scroll.count : 0;
    const btnScroll = document.getElementById('btn-raid-use-revive-scroll');
    if (btnScroll) {
      btnScroll.innerText = `📜 부활 주문서 (${scrollCount}개)`;
      btnScroll.disabled = (scrollCount <= 0 || this.playerData.isFallen);
    }

    this.updateBossRaidTimerOnly();
  }

  loadNextBossQuestion() {
    let uFilter = (window.BOSS_CONFIG.unitFilter && window.BOSS_CONFIG.unitFilter !== 'ALL' && window.BOSS_CONFIG.unitFilter !== 'AUTO')
      ? window.BOSS_CONFIG.unitFilter
      : null;

    if (!uFilter) {
      const bName = (window.BOSS_CONFIG.name || '').toLowerCase();
      if (bName.includes('골렘') || bName.includes('golem') || bName.includes('드래곤') || bName.includes('dragon')) {
        // 골렘, 드래곤: 1~4단원 출제
        uFilter = ['1단원', '2단원', '3단원', '4단원'];
      } else if (bName.includes('대마왕') || bName.includes('중간고사') || bName.includes('demon')) {
        // 중간고사 대마왕: 1~5단원 출제
        uFilter = ['1단원', '2단원', '3단원', '4단원', '5단원'];
      } else if (bName.includes('케르베로스') || bName.includes('cerberus') || bName.includes('수행평가')) {
        // 케르베로스: 1~6단원 출제
        uFilter = ['1단원', '2단원', '3단원', '4단원', '5단원', '6단원'];
      } else {
        uFilter = ['1단원', '2단원', '3단원', '4단원'];
      }
    } else if (uFilter === '1~4') {
      uFilter = ['1단원', '2단원', '3단원', '4단원'];
    } else if (uFilter === '1~5') {
      uFilter = ['1단원', '2단원', '3단원', '4단원', '5단원'];
    } else if (uFilter === '1~6') {
      uFilter = ['1단원', '2단원', '3단원', '4단원', '5단원', '6단원'];
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
      let myDmg = Math.max(5, this.playerData.atk - bossDef);
      const bNameCheck = window.BOSS_CONFIG.name || '';
      if (this.playerData.equippedTitle === '🏛️ 역사를 기억하는 자' && (bNameCheck.includes('파멸신') || bNameCheck.includes('기말고사'))) {
        myDmg = Math.round(myDmg * 1.15);
      }
      // 🥊 파이터 직업: 보스 레이드 공격 데미지 +10% 상승
      if (this.playerData && (this.playerData.job === 'fighter' || this.playerData.job === 'wrestler')) {
        myDmg = Math.round(myDmg * 1.10);
      }
      this.bossState.hasAttacked = true;
      this.bossState.damageDealt = (this.bossState.damageDealt || 0) + myDmg;

      if (window.BOSS_CONFIG.active && window.BOSS_CONFIG.mode === 'coop' && this.networkManager.socket) {
        // 협동 레이드: 서버로 데미지 전송하여 전교생 보스 HP 공유 차감
        this.networkManager.socket.emit('boss_raid_attack', { damage: myDmg });
      } else {
        this.bossState.currentHp = Math.max(0, this.bossState.currentHp - myDmg);
        if (this.bossState.currentHp <= 0) {
          this.updateBossRaidUI();
          this.bossState.currentHp = this.bossState.maxHp;
          this.onBossRaidCleared({
            bossName: window.BOSS_CONFIG.name,
            rewardGold: window.BOSS_CONFIG.rewardGold,
            rewardExp: window.BOSS_CONFIG.rewardExp,
            isSoloClear: true,
            participantIds: (this.networkManager && this.networkManager.socket) ? [this.networkManager.socket.id] : [],
            participantStudentIds: this.playerData.studentId ? [this.playerData.studentId] : []
          });
          return;
        }
      }

      // 정답 시: (보스 공격력 - 나의 방어력)만큼만 피격 (방어력이 높으면 0 피해)
      const incomingDmg = this.playerData.isTeacher ? 0 : Math.max(0, bossAtk - this.playerData.def);
      this.playerData.hp = Math.max(0, this.playerData.hp - incomingDmg);
      this.updateBossRaidUI();
      this.saveProgress(true);

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
      this.saveProgress(true);

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

    const nextBtn = document.getElementById('btn-raid-next-turn');
    if (nextBtn) {
      nextBtn.classList.remove('hidden');
      if (!isCorrect) {
        nextBtn.disabled = true;
        nextBtn.innerText = '⏳ 1초 대기 (오답 쿨타임)...';
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
        setTimeout(() => {
          if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.innerText = '다음 턴 ➔';
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
          }
        }, 1000);
      } else {
        nextBtn.disabled = false;
        nextBtn.innerText = '다음 턴 ➔';
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
      }
    }
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
      btnRed.innerHTML = `<span class="icon-red-potion">🧪</span> 빨간 물약 (+10) ${redCount}개`;
      btnRed.disabled = (redCount <= 0 || this.playerData.hp >= this.playerData.maxHp || this.playerData.isFallen);
    }

    const orangePot = this.playerData.inventory.find(i => i.item === 'item_orange_potion');
    const orangeCount = orangePot ? orangePot.count : 0;
    const btnOrange = document.getElementById('btn-battle-use-orange-potion');
    if (btnOrange) {
      btnOrange.innerHTML = `<span class="icon-orange-potion">🧪</span> 주홍 물약 (+25) ${orangeCount}개`;
      btnOrange.disabled = (orangeCount <= 0 || this.playerData.hp >= this.playerData.maxHp || this.playerData.isFallen);
    }

    const isHistory = (mob.court === 'history');
    const isFutsal = (mob.court === 'futsal');
    const unitName = (isHistory || isFutsal) ? '6단원 (The Beauty of Art)' : '5단원 (Walk into Korea)';
    const logEl = document.getElementById('battle-action-log');
    if (logEl) {
      logEl.innerHTML = `⚔️ <b>${unitName}</b> 영어 문제를 맞히면 공격하고, 틀리면 <b>풀HP의 20% 피해</b>를 입습니다!`;
    }
  }

  loadNextFieldBattleQuestion() {
    const isHistory = (this.currentFieldMob && this.currentFieldMob.court === 'history');
    const isFutsal = (this.currentFieldMob && this.currentFieldMob.court === 'futsal');
    const unitFilter = (isHistory || isFutsal) ? '6단원' : '5단원';

    const q = this.quizManager.getRandomQuestion(unitFilter);
    if (!q) {
      alert(`출제할 ${unitFilter} 영어 문제가 없습니다.`);
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

      let myDmg = Math.max(8, this.playerData.atk - mob.def);
      // 🥊 파이터 직업: 필드 몬스터 공격 데미지 +10% 상승
      if (this.playerData && (this.playerData.job === 'fighter' || this.playerData.job === 'wrestler')) {
        myDmg = Math.round(myDmg * 1.10);
      }
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
      this.saveProgress(true);

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
          this.closeFieldBattleModal();
          if (window.RPGDialog) {
            window.RPGDialog.confirm(
              '😵 전투 패배',
              `${mob.name}의 강력한 일격에 쓰러졌습니다!\n\n1학년 복도(보건실)로 안전하게 귀환하시겠습니까?\n(취소 시 가방의 물약을 사용하여 회복할 수 있습니다)`,
              '💀',
              () => {
                this.respawnAtHallway();
              },
              null,
              '귀환하기',
              '현 위치 대기'
            );
          } else {
            const respawn = confirm(
              `😵 [전투 패배]\n\n${mob.name}의 강력한 일격에 쓰러졌습니다!\n\n1학년 복도(보건실)로 안전하게 귀환하시겠습니까?\n(취소 시 가방의 물약을 사용하여 회복할 수 있습니다)`
            );
            if (respawn) {
              this.respawnAtHallway();
            }
          }
        }, 500);
        return;
      }

      const btnNext = document.getElementById('btn-battle-next-turn');
      if (btnNext) {
        btnNext.classList.remove('hidden');
        btnNext.disabled = true;
        btnNext.innerText = '⏳ 1초 대기 (오답 쿨타임)...';
        btnNext.style.opacity = '0.5';
        btnNext.style.cursor = 'not-allowed';
        setTimeout(() => {
          if (btnNext) {
            btnNext.disabled = false;
            btnNext.innerText = '다음 턴 ➔';
            btnNext.style.opacity = '1';
            btnNext.style.cursor = 'pointer';
          }
        }, 1000);
      }
    }
  }

  handleFieldBattleVictory(mob) {
    mob.defeated = true;
    mob.respawnAt = Date.now() + (mob.respawnSec || 15) * 1000;

    // 다른 모든 플레이어에게 몬스터 처치 및 사라짐 실시간 동기화 브로드캐스트
    if (this.networkManager && this.networkManager.socket) {
      this.networkManager.socket.emit('field_monster_defeat', {
        mobId: mob.id,
        respawnSec: mob.respawnSec || 15
      });
    }

    // 1. Gold & EXP (직업 패시브 보너스 반영)
    let finalGold = mob.goldReward || 10;
    let finalExp = mob.expReward || 20;
    if (this.playerData && (this.playerData.job === 'scholar' || this.playerData.job === 'researcher')) {
      finalExp += Math.round(finalExp * 0.15); // 스칼라: 경험치 +15%
    }
    if (this.playerData && (this.playerData.job === 'banker' || this.playerData.job === 'scientist')) {
      finalGold += Math.round(finalGold * 0.10); // 뱅커: 모든 골드 +10%
    }
    const scoutDropBonus = 0; // 스카우트 삭제

    this.addGold(finalGold);
    this.addExp(finalExp);

    const dropsList = [];

    // 2. Drops based on field court
    if (mob.court === 'history') {
      const essenceCount = Math.floor(Math.random() * 2) + 1; // 1~2개
      this.addItem('item_history_essence', '🏛️ 숭실 역사의 정수', essenceCount, '🏛️', {
        type: 'material',
        effect: '역사관 몬스터 전리품 · 4티어 헤리티지 무기 필수 재료'
      });
      dropsList.push(`🏛️ 숭실 역사의 정수 x${essenceCount}개`);

      // 35% chance to drop unyielding stone (+20%p for Scout)
      if (Math.random() * 100 < (35 + scoutDropBonus)) {
        this.addItem('item_unyielding_stone', '💎 꺾이지 않는 사명석', 1, '💎', {
          type: 'material',
          effect: '역사관 몬스터 전리품 · 4티어 헤리티지 무기 핵심 재료'
        });
        dropsList.push('💎 꺾이지 않는 사명석 1개 (35% 행운 드랍!)');
      }
    } else if (mob.court === 'futsal') {
      const fLeatherCount = Math.floor(Math.random() * ((mob.leatherMax || 3) - (mob.leatherMin || 1) + 1)) + (mob.leatherMin || 1);
      this.addItem('item_futsal_leather', '탄력있는 풋살공 가죽', fLeatherCount, '⚽', {
        type: 'material',
        effect: '풋살장 몬스터 전리품 · 고급 방어구 및 장비 재료'
      });
      dropsList.push(`⚽ 탄력있는 풋살공 가죽 x${fLeatherCount}개`);

      // Forsythia Petal (15% drop rate for futsal monsters, +20%p for Scout)
      if (Math.random() * 100 < (15 + scoutDropBonus)) {
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
          stats: { atk: 22, def: 0, hp: 0 },
          effect: '공격력 +22'
        });
        dropsList.push('🗡️ 가죽손잡이 세이버 (5% 대박 완제품 드랍!)');
      }

      // Elite 2-Tier Leather Shoes Drop (거미손 골키퍼 등 풋살장 엘리트 10% 완제품 드랍!)
      if (mob.type === 'elite' && Math.random() * 100 < 10) {
        this.addItem('equip_leather_shoes', '날렵한 가죽 운동화', 1, '👟', {
          type: 'equipment',
          slot: 'shoes',
          stats: { atk: 3, def: 3, hp: 10 },
          effect: '2티어 고급 신발'
        });
        dropsList.push('👟 날렵한 가죽 운동화 (2티어 신발 엘리트 10% 완제품 드랍!)');
      }
    } else {
      // Basketball Court Standard Drops
      const leatherCount = Math.floor(Math.random() * ((mob.leatherMax || 2) - (mob.leatherMin || 1) + 1)) + (mob.leatherMin || 1);
      this.addItem('item_basketball_leather', '농구공 가죽 조각', leatherCount, '🏀', {
        type: 'material',
        effect: '농구장 몬스터 전리품 · 가죽 장비 제작 재료'
      });
      dropsList.push(`🏀 농구공 가죽 조각 x${leatherCount}개`);

      // Forsythia Petal (15% drop rate for basketball monsters, +20%p for Scout)
      if (Math.random() * 100 < (15 + scoutDropBonus)) {
        this.addItem('item_forsythia', '노란 개나리 꽃잎', 1, '🌼', {
          type: 'material',
          effect: '개나리 반지 및 주홍 물약 재료'
        });
        dropsList.push('🌼 노란 개나리 꽃잎 1개 (15% 행운 드랍!)');
      }

      // Elite 2-Tier Leather Shoes Drop (림 가디언 등 농구장 엘리트 10% 완제품 드랍!)
      if (mob.type === 'elite' && Math.random() * 100 < 10) {
        this.addItem('equip_leather_shoes', '날렵한 가죽 운동화', 1, '👟', {
          type: 'equipment',
          slot: 'shoes',
          stats: { atk: 3, def: 3, hp: 10 },
          effect: '2티어 고급 신발'
        });
        dropsList.push('👟 날렵한 가죽 운동화 (2티어 신발 엘리트 10% 완제품 드랍!)');
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
      `🏆 [${mob.name}] 1:1 대결 승리!\n\n🪙 골드 +${finalGold}G, 🌟 경험치 +${finalExp} EXP\n\n🎁 획득 아이템:\n• ${dropsList.join('\n• ')}\n\n${craftGuide}`
    );
  }

  onFieldMonstersState(state) {
    if (!state || !window.WORLD_DATA || !WORLD_DATA.playground) return;
    const now = Date.now();
    const allMobs = [
      ...(WORLD_DATA.playground.basketballMonsters || []),
      ...(WORLD_DATA.playground.futsalMonsters || [])
    ];
    allMobs.forEach(m => {
      if (state[m.id] && now < state[m.id]) {
        m.defeated = true;
        m.respawnAt = state[m.id];
      }
    });
  }

  onFieldMonsterDefeatedSync(data) {
    if (!data || !data.mobId || !window.WORLD_DATA || !WORLD_DATA.playground) return;
    const allMobs = [
      ...(WORLD_DATA.playground.basketballMonsters || []),
      ...(WORLD_DATA.playground.futsalMonsters || [])
    ];
    const targetMob = allMobs.find(m => m.id === data.mobId);
    if (targetMob) {
      targetMob.defeated = true;
      targetMob.respawnAt = data.respawnAt || (Date.now() + 15000);
      targetMob.hp = targetMob.maxHp;
    }

    // 만약 내가 지금 이 몬스터와 대결 중이었다면, 다른 친구가 먼저 잡았으므로 배틀 모달 닫기
    if (this.currentFieldMob && this.currentFieldMob.id === data.mobId) {
      this.closeFieldBattleModal();
      if (window.AudioManager && window.AudioManager.playHit) {
        window.AudioManager.playHit();
      }
      this.showToast(`💨 ${data.defeatedBy || '다른 친구'}가 몬스터를 먼저 처치했습니다!`, 'info');
    }
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
    if (this.bossTimerInterval) {
      clearInterval(this.bossTimerInterval);
      this.bossTimerInterval = null;
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
      alert('📜 보유 중인 부활 주문서가 없습니다.\n소비품 제작대에서 제작할 수 있습니다.');
      return;
    }

    // 현재 보스방/전투방에서 쓰러진 다른 플레이어 찾기
    const curRoom = (this.engine && this.engine.player && this.engine.player.room) || 'room_702';
    const fallenOthers = Object.values(this.engine.otherPlayers).filter(p => p.isFallen && p.room === curRoom);
    if (fallenOthers.length === 0) {
      alert('현재 위치한 전장에 쓰러진 친구가 없습니다.');
      return;
    }

    const target = fallenOthers[0];
    const sendRevive = () => {
      this.removeItem('item_revive_scroll', 1);
      if (this.networkManager.socket) {
        this.networkManager.socket.emit('use_revive_scroll', {
          targetSocketId: target.id,
          targetName: target.name
        });
      }
      this.updateBossRaidUI();
    };

    if (window.RPGDialog) {
      window.RPGDialog.confirm(
        '📜 부활 주문서',
        `'${target.name}' 친구에게 부활 주문서를 전달하시겠습니까?\n(상대방이 수락 시 즉시 HP 50% 상태로 전장에 복귀합니다!)`,
        '✨',
        () => sendRevive(),
        null,
        '주문서 전달',
        '취소'
      );
    } else if (confirm(`'${target.name}' 친구에게 부활 주문서를 전달하시겠습니까? (상대방이 수락 시 HP 50% 복귀)`)) {
      sendRevive();
    }
  }

  useReturnScroll() {
    if (this.playerData && (this.playerData.isFallen || this.playerData.hp <= 0)) {
      alert('💀 기절한 상태에서는 귀환 주문서를 사용할 수 없습니다!\n동료의 [부활 주문서]를 받거나 [복도 부활]을 이용해주세요.');
      return;
    }

    const scroll = this.playerData.inventory.find(i => i.item === 'item_return_scroll');
    if (!scroll || scroll.count <= 0) {
      alert('📜 보유 중인 귀환 주문서가 없습니다.\n소비품 제작대에서 제작할 수 있습니다.');
      return;
    }

    const executeReturn = () => {
      this.removeItem('item_return_scroll', 1);

      // Close inventory modal
      if (this.modalInventory) {
        this.modalInventory.classList.add('hidden');
      }
      // Close active field battle modal if in combat
      if (this.closeFieldBattleModal) {
        this.closeFieldBattleModal();
      }
      // Close active boss raid modal if in raid
      if (this.modalBossRaid) {
        this.modalBossRaid.classList.add('hidden');
      }
      if (this.bossTimerInterval) {
        clearInterval(this.bossTimerInterval);
        this.bossTimerInterval = null;
      }

      // Play teleport sound
      if (window.AudioManager) {
        if (window.AudioManager.playRevive) {
          window.AudioManager.playRevive();
        } else if (window.AudioManager.playSelect) {
          window.AudioManager.playSelect();
        }
      }

      // Warp player to 7th floor hallway (center: 15 * 32, 10 * 32)
      if (this.engine) {
        this.engine.triggerFadeWarp(() => {
          this.engine.warpToFloor(7, 15 * 32, 10 * 32);
        });
      }

      this.saveProgress();

      if (window.RPGDialog) {
        window.RPGDialog.show(
          '📜 귀환 주문서',
          '🌀 귀환 주문서의 마력이 발동하여\n안전한 7층 본관 복도로 즉시 공간 이동했습니다!',
          '✨'
        );
      } else {
        alert('🌀 안전한 7층 복도로 귀환했습니다!');
      }

      this.showToast('🌀 안전한 7층 복도로 즉시 귀환했습니다!', 'success');
    };

    if (window.RPGDialog) {
      window.RPGDialog.confirm(
        '📜 귀환 주문서 사용',
        '귀환 주문서를 사용하여 안전한 7층 복도로 즉시 공간 이동하시겠습니까?',
        '🌀',
        () => executeReturn(),
        null,
        '귀환하기',
        '취소'
      );
    } else if (confirm('귀환 주문서를 사용하여 7층 복도로 즉시 공간 이동하시겠습니까?')) {
      executeReturn();
    }
  }

  // 🌀 순간이동 주문서 사용 (목적지 선택 모달 오픈)
  useTeleportScroll() {
    if (this.playerData && (this.playerData.isFallen || this.playerData.hp <= 0)) {
      alert('💀 기절한 상태에서는 순간이동 주문서를 사용할 수 없습니다!\n동료의 [부활 주문서]를 받거나 [복도 부활]을 이용해주세요.');
      return;
    }

    const scroll = this.playerData.inventory.find(i => i.item === 'item_teleport_scroll');
    if (!scroll || scroll.count <= 0) {
      alert('📜 보유 중인 순간이동 주문서가 없습니다.\n소비품 제작대에서 제작할 수 있습니다.');
      return;
    }

    this.openTeleportModal();
  }

  openTeleportModal() {
    const modal = document.getElementById('modal-teleport');
    if (!modal) return;

    modal.classList.remove('hidden');

    const destButtons = modal.querySelectorAll('.btn-teleport-dest');
    destButtons.forEach(btn => {
      if (!btn._bound) {
        btn._bound = true;
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-target');
          if (target) this.executeTeleport(target);
        });
      }
    });

    const btnClose = document.getElementById('btn-close-teleport-modal');
    if (btnClose && !btnClose._bound) {
      btnClose._bound = true;
      btnClose.addEventListener('click', () => this.closeTeleportModal());
    }

    if (!modal._bgBound) {
      modal._bgBound = true;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeTeleportModal();
      });
    }
  }

  closeTeleportModal() {
    const modal = document.getElementById('modal-teleport');
    if (modal) modal.classList.add('hidden');
  }

  executeTeleport(target) {
    if (this.playerData && (this.playerData.isFallen || this.playerData.hp <= 0)) {
      alert('💀 기절한 상태에서는 순간이동 주문서를 사용할 수 없습니다!');
      this.closeTeleportModal();
      return;
    }

    const scroll = this.playerData.inventory.find(i => i.item === 'item_teleport_scroll');
    if (!scroll || scroll.count <= 0) {
      alert('📜 보유 중인 순간이동 주문서가 없습니다.\n소비품 제작대에서 제작할 수 있습니다.');
      this.closeTeleportModal();
      return;
    }

    // 1장 차감
    this.removeItem('item_teleport_scroll', 1);

    // 모달창 닫기
    this.closeTeleportModal();
    if (this.modalInventory) this.modalInventory.classList.add('hidden');
    if (this.closeFieldBattleModal) this.closeFieldBattleModal();
    if (this.modalBossRaid) this.modalBossRaid.classList.add('hidden');
    if (this.bossTimerInterval) {
      clearInterval(this.bossTimerInterval);
      this.bossTimerInterval = null;
    }

    // 사운드
    if (window.AudioManager) {
      if (window.AudioManager.playLevelUp) {
        window.AudioManager.playLevelUp();
      } else if (window.AudioManager.playSelect) {
        window.AudioManager.playSelect();
      }
    }

    let targetName = '목적지';
    if (target === 'floor_7') {
      targetName = '🏫 7층 복도';
      this.engine.triggerFadeWarp(() => {
        this.engine.player.floor = 7;
        this.engine.warpToRoom('hallway', '7층 복도', 56 * 32, 6 * 32);
      });
    } else if (target === 'floor_6') {
      targetName = '🏛️ 6층 복도';
      this.engine.triggerFadeWarp(() => {
        this.engine.player.floor = 6;
        this.engine.warpToRoom('hallway', '6층 복도 (교무실 & 2학년 구역)', 56 * 32, 6 * 32);
      });
    } else if (target === 'floor_5') {
      targetName = '🌟 5층 복도';
      this.engine.triggerFadeWarp(() => {
        this.engine.player.floor = 5;
        this.engine.warpToRoom('hallway', '5층 복도 (진로 & 선배 구역)', 56 * 32, 6 * 32);
      });
    } else if (target === 'floor_3') {
      targetName = '🏥 3층 복도';
      this.engine.triggerFadeWarp(() => {
        this.engine.player.floor = 3;
        this.engine.warpToRoom('hallway', '3층 복도 (보건실 & Wee클래스)', 56 * 32, 6 * 32);
      });
    } else if (target === 'floor_2') {
      targetName = '📚 2층 도서관';
      this.engine.triggerFadeWarp(() => {
        this.engine.player.floor = 2;
        this.engine.warpToRoom('hallway', '2층 도서관', 16 * 32, 5 * 32);
      });
    } else if (target === 'court_basketball') {
      targetName = '🏀 농구장';
      this.engine.triggerFadeWarp(() => {
        this.engine.player.floor = 1;
        this.engine.warpToRoom('playground', '숭실 운동장 (농구장)', 74 * 32, 16 * 32);
      });
    } else if (target === 'court_futsal') {
      targetName = '⚽ 풋살장';
      this.engine.triggerFadeWarp(() => {
        this.engine.player.floor = 1;
        this.engine.warpToRoom('playground', '숭실 운동장 (풋살장)', 74 * 32, 40 * 32);
      });
    } else if (target === 'field_soccer') {
      targetName = '🏟️ 축구장';
      this.engine.triggerFadeWarp(() => {
        this.engine.player.floor = 1;
        this.engine.warpToRoom('playground', '숭실 운동장 (축구장)', 31 * 32, 35 * 32);
      });
    }

    this.saveProgress();
    this.showToast(`🌀 순간이동 주문서 발동! ${targetName}(으)로 즉시 공간 이동했습니다.`, 'success');
  }

  isBuffActive(buffKey) {
    if (!this.activeBuffs || !this.activeBuffs[buffKey]) return false;
    if (Date.now() > this.activeBuffs[buffKey].expireAt) {
      delete this.activeBuffs[buffKey];
      this.recalcCombatStats();
      if (this.engine && this.engine.player) {
        this.engine.setDashing(this.engine.player.isDashing);
      }
      this.updateBuffBar();
      return false;
    }
    return true;
  }

  getBuffRemainingSec(buffKey) {
    if (!this.isBuffActive(buffKey)) return 0;
    return Math.max(0, Math.ceil((this.activeBuffs[buffKey].expireAt - Date.now()) / 1000));
  }

  applyBuff(buffKey, durationMs, buffName, icon = '✨') {
    if (!this.activeBuffs) this.activeBuffs = {};
    this.activeBuffs[buffKey] = {
      name: buffName,
      icon: icon,
      expireAt: Date.now() + durationMs
    };

    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }

    const durationSec = Math.round(durationMs / 1000);
    this.showToast(`${icon} [${buffName}] 효과 발동! (${durationSec}초 지속)`, 'success');

    this.recalcCombatStats();
    if (this.engine && this.engine.player) {
      this.engine.setDashing(this.engine.player.isDashing);
    }
    this.updateBuffBar();

    if (!this.buffInterval) {
      this.buffInterval = setInterval(() => {
        this.tickBuffs();
      }, 1000);
    }
  }

  tickBuffs() {
    if (!this.activeBuffs) return;
    const keys = Object.keys(this.activeBuffs);
    if (keys.length === 0) {
      if (this.buffInterval) {
        clearInterval(this.buffInterval);
        this.buffInterval = null;
      }
      this.updateBuffBar();
      return;
    }

    let changed = false;
    keys.forEach(k => {
      if (Date.now() > this.activeBuffs[k].expireAt) {
        const b = this.activeBuffs[k];
        delete this.activeBuffs[k];
        changed = true;
        this.showToast(`⌛ [${b.name}] 지속시간이 만료되었습니다.`, 'info');
      }
    });

    if (changed) {
      this.recalcCombatStats();
      if (this.engine && this.engine.player) {
        this.engine.setDashing(this.engine.player.isDashing);
      }
    }
    this.updateBuffBar();
  }

  updateBuffBar() {
    const el = document.getElementById('hud-active-buffs');
    if (!el) return;
    if (!this.activeBuffs || Object.keys(this.activeBuffs).length === 0) {
      el.innerHTML = '';
      el.style.display = 'none';
      return;
    }

    el.style.display = 'flex';
    el.innerHTML = '';
    Object.keys(this.activeBuffs).forEach(k => {
      const b = this.activeBuffs[k];
      const remSec = Math.max(0, Math.ceil((b.expireAt - Date.now()) / 1000));
      const badge = document.createElement('span');
      badge.className = 'hud-buff-pill';
      badge.style.cssText = 'font-size:11px; font-weight:800; padding:2px 7px; border-radius:10px; background:rgba(30,41,59,0.9); border:1px solid #38bdf8; color:#38bdf8; display:inline-flex; align-items:center; gap:3px;';
      if (k === 'speed_boost') {
        badge.style.borderColor = '#4ade80';
        badge.style.color = '#4ade80';
      } else if (k === 'courage_boost') {
        badge.style.borderColor = '#c084fc';
        badge.style.color = '#c084fc';
      }
      const iconHtml = (k === 'courage_boost')
        ? `<span class="icon-purple-potion">🧪</span>`
        : b.icon;
      badge.innerHTML = `${iconHtml} ${b.name} ${remSec}s`;
      el.appendChild(badge);
    });
  }

  useGreenPotion() {
    if (this.playerData && (this.playerData.isFallen || this.playerData.hp <= 0)) {
      alert('💀 기절한 상태에서는 물약을 마실 수 없습니다!');
      return false;
    }
    const pot = this.playerData.inventory.find(i => i.item === 'item_green_potion');
    if (!pot || pot.count <= 0) {
      alert('보유 중인 초록 물약이 없습니다.');
      return false;
    }
    this.removeItem('item_green_potion', 1);
    this.applyBuff('speed_boost', 60000, '기본 이속 (+10%)', '⚡');
    this.saveProgress();
    if (!this.modalInventory.classList.contains('hidden')) {
      this.openInventory();
    }
    return true;
  }

  useCouragePotion() {
    if (this.playerData && (this.playerData.isFallen || this.playerData.hp <= 0)) {
      alert('💀 기절한 상태에서는 물약을 마실 수 없습니다!');
      return false;
    }
    const pot = this.playerData.inventory.find(i => i.item === 'item_courage_potion');
    if (!pot || pot.count <= 0) {
      alert('보유 중인 용기의 물약이 없습니다.');
      return false;
    }
    this.removeItem('item_courage_potion', 1);
    this.applyBuff('courage_boost', 180000, '용기의 투지 (+5 ATK)', '🧪');
    this.saveProgress();
    if (!this.modalInventory.classList.contains('hidden')) {
      this.openInventory();
    }
    this.updateBossRaidUI();
    this.updateFieldBattleUI();
    return true;
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
          nameEl.value = '🐲 고대 청동 드래곤';
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
          hpEl.value = 10000;
          atkEl.value = 95;
          defEl.value = 35;
          goldEl.value = 400;
          expEl.value = 800;
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
      const lostBoxEl = document.getElementById('admin-edit-lostbox');
      if (lostBoxEl) lostBoxEl.checked = !!s.hasOpenedLostBox;
      const mirrorEl = document.getElementById('admin-edit-mirror');
      if (mirrorEl) mirrorEl.checked = !!s.hasCheckedMirror;
      const devNoteEl = document.getElementById('admin-edit-devnote');
      if (devNoteEl) devNoteEl.checked = !!s.hasReadDevNote;
      const golemEl = document.getElementById('admin-edit-golem');
      if (golemEl) golemEl.checked = !!s.hasClearedFirstBoss;
      const dragonEl = document.getElementById('admin-edit-dragon');
      if (dragonEl) dragonEl.checked = !!s.hasClearedDragonRaid;
      const cerberusEl = document.getElementById('admin-edit-cerberus');
      if (cerberusEl) cerberusEl.checked = !!s.hasClearedCerberusRaid;
    };

    this.renderSavedStudentsTable = (filterText = '') => {
      const tableBody = document.getElementById('admin-saved-students-table-body');
      const badgeCount = document.getElementById('admin-saved-student-count-badge');
      if (!tableBody) return;

      const all = this._allSavedStudentsData || {};
      const ids = Object.keys(all).sort();

      if (badgeCount) {
        badgeCount.innerText = `저장 ${ids.length}명`;
      }

      if (ids.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:18px; color:#64748b;">서버에 저장된 학생 데이터가 없습니다.</td></tr>';
        return;
      }

      const lowerFilter = filterText.trim().toLowerCase();
      const filteredIds = ids.filter(id => {
        if (!lowerFilter) return true;
        const s = all[id];
        const name = (s.name || '').toLowerCase();
        return id.toLowerCase().includes(lowerFilter) || name.includes(lowerFilter);
      });

      if (filteredIds.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:18px; color:#64748b;">검색 조건과 일치하는 학생이 없습니다.</td></tr>';
        return;
      }

      tableBody.innerHTML = '';
      filteredIds.forEach(id => {
        const s = all[id];
        const name = s.name || '무명';
        const lv = s.level || 1;
        const exp = s.exp !== undefined ? s.exp : 0;
        const gold = s.gold !== undefined ? s.gold : 0;
        let dateStr = '-';
        if (s.updatedAt) {
          try {
            const d = new Date(s.updatedAt);
            dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          } catch(e) {}
        }

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #1e293b';
        tr.style.transition = 'background 0.15s';
        tr.onmouseenter = () => { tr.style.background = '#1e293b'; };
        tr.onmouseleave = () => { tr.style.background = 'transparent'; };

        tr.innerHTML = `
          <td style="padding:7px 10px; font-weight:800; color:#38bdf8;">${id}</td>
          <td style="padding:7px 10px; font-weight:700; color:#ffffff;">${name}</td>
          <td style="padding:7px 10px; color:#fde047; font-weight:700;">Lv.${lv} <span style="font-size:10.5px; color:#94a3b8; font-weight:normal;">(${exp} EXP)</span></td>
          <td style="padding:7px 10px; color:#fbbf24; font-weight:800;">🪙 ${gold}G</td>
          <td style="padding:7px 10px; color:#94a3b8; font-size:11px;">${dateStr}</td>
          <td style="padding:7px 10px; text-align:center;">
            <button type="button" style="background:#0284c7; color:#fff; border:none; padding:3px 8px; border-radius:4px; font-size:11px; font-weight:700; cursor:pointer; margin-right:4px;" onclick="window.MainApp.selectStudentForEdit('${id}')">✏️ 상세조회</button>
            <button type="button" style="background:#dc2626; color:#fff; border:none; padding:3px 6px; border-radius:4px; font-size:11px; font-weight:700; cursor:pointer;" onclick="window.MainApp.quickDeleteStudent('${id}', '${name}')">🗑️</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    };

    const searchInput = document.getElementById('admin-saved-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderSavedStudentsTable(e.target.value);
      });
    }

    this.loadSavedStudentsForEditor = async (selectedIdToKeep = null) => {
      if (selectEditStudent) {
        selectEditStudent.innerHTML = '<option value="">-- 불러오는 중... --</option>';
      }
      try {
        const res = await fetch('/api/admin/all-students-progress');
        const data = await res.json();
        const all = (data && data.students) || {};
        this._allSavedStudentsData = all;

        // Render saved students table
        const searchVal = searchInput ? searchInput.value : '';
        this.renderSavedStudentsTable(searchVal);

        const ids = Object.keys(all).sort();
        if (selectEditStudent) {
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
        }
      } catch (err) {
        if (selectEditStudent) {
          selectEditStudent.innerHTML = '<option value="">(목록 로딩 실패)</option>';
        }
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
        const lostBoxEl = document.getElementById('admin-edit-lostbox');
        const newLostBox = lostBoxEl ? lostBoxEl.checked : !!prev.hasOpenedLostBox;
        const mirrorEl = document.getElementById('admin-edit-mirror');
        const newMirror = mirrorEl ? mirrorEl.checked : !!prev.hasCheckedMirror;
        const devNoteEl = document.getElementById('admin-edit-devnote');
        const newDevNote = devNoteEl ? devNoteEl.checked : !!prev.hasReadDevNote;
        const golemEl = document.getElementById('admin-edit-golem');
        const newGolem = golemEl ? golemEl.checked : !!prev.hasClearedFirstBoss;
        const dragonEl = document.getElementById('admin-edit-dragon');
        const newDragon = dragonEl ? dragonEl.checked : !!prev.hasClearedDragonRaid;
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
          hasOpenedLostBox: newLostBox,
          hasCheckedMirror: newMirror,
          hasReadDevNote: newDevNote,
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
              progress: updatedProgress,
              fromAdmin: true
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

    // 관제탑: 이 기기 로컬 데이터 초기화
    const btnAdminClearDevice = document.getElementById('btn-admin-clear-device-storage');
    if (btnAdminClearDevice) {
      btnAdminClearDevice.addEventListener('click', () => {
        if (confirm('🧹 [이 기기 로컬 데이터 초기화]\n\n현재 이 PC/브라우저에 저장된 모든 학생 플레이 기록과 로컬 데이터를 초기화(삭제)하시겠습니까?\n\n초기화 후 브라우저가 새로고침되며 초기 상태로 시작합니다.')) {
          try {
            const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('soongsil_'));
            keysToRemove.forEach(k => localStorage.removeItem(k));
            localStorage.setItem('soongsil_storage_purge_v216', 'done');
          } catch (e) {}
          location.reload();
        }
      });
    }

    // 관제탑: 전교생 서버 데이터 일괄 초기화
    const btnAdminWipeAll = document.getElementById('btn-admin-wipe-all-students');
    if (btnAdminWipeAll) {
      btnAdminWipeAll.addEventListener('click', async () => {
        if (!confirm('⚠️ [전교생 데이터 전체 일괄 초기화 - 위험]\n\n정말로 서버에 누적 저장된 모든 학생의 플레이 데이터(레벨, 골드, 인벤토리 등)를 완전히 삭제하시겠습니까?\n\n이 작업은 절대 되돌릴 수 없습니다!')) {
          return;
        }
        const confirmText = prompt('정말 전교생 데이터를 초기화하려면 확인란에 "초기화"를 정확히 입력해 주세요:');
        if (confirmText !== '초기화') {
          alert('초기화가 취소되었습니다.');
          return;
        }
        try {
          const res = await fetch('/api/admin/clear-all-students-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await res.json();
          if (data && data.success) {
            alert('✅ 서버의 전교생 플레이 데이터가 성공적으로 전체 초기화되었습니다.');
            if (typeof this.loadSavedStudentsForEditor === 'function') {
              this.loadSavedStudentsForEditor();
            }
          } else {
            alert('전체 초기화 실패: 서버 오류');
          }
        } catch (e) {
          alert('초기화 요청 중 오류: ' + e.message);
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
        if (rewardItemKey !== 'none' && ALL_GAME_ITEMS[rewardItemKey]) {
          rewardItemName = ALL_GAME_ITEMS[rewardItemKey].name;
          rewardItemIcon = ALL_GAME_ITEMS[rewardItemKey].icon || '🎁';
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

  selectStudentForEdit(studentId) {
    const select = document.getElementById('admin-edit-student-select');
    if (select) {
      select.value = studentId;
      this.populateEditStudentForm(studentId);
      const form = document.getElementById('admin-edit-student-form');
      if (form) {
        form.classList.remove('hidden');
        form.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  quickDeleteStudent(studentId, name) {
    if (confirm(`⚠️ 정말로 학번 [${studentId}] '${name}' 학생의 저장 데이터를 영구 삭제(초기화)하시겠습니까?`)) {
      fetch('/api/admin/delete-student-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          this.showToast(`🗑️ [${studentId}] ${name} 학생 데이터가 삭제되었습니다.`, 'success');
          if (this.loadSavedStudentsForEditor) {
            this.loadSavedStudentsForEditor();
          }
        } else {
          alert('삭제 실패: ' + (data.error || '알 수 없는 오류'));
        }
      })
      .catch(err => alert('삭제 요청 중 오류가 발생했습니다.'));
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

    let finalAmount = amount;
    // 1번 구현: 도서관 '오늘의 지혜 명언' 독서 버프 (경험치 +15%)
    if ((this.playerData.readingExpBuffUntil && Date.now() < this.playerData.readingExpBuffUntil) || (this.isBuffActive && this.isBuffActive('reading_exp'))) {
      finalAmount = Math.max(1, Math.round(finalAmount * 1.15));
    }

    // 🎗️ 선배의 낡은 승리 완장 장착 효과: 폭풍 성장 부스터 (모든 획득 경험치 +10% 보너스)
    const hasVintageArmband = this.playerData.equipment && (
      (this.playerData.equipment.accessory && this.playerData.equipment.accessory.item === 'equip_vintage_armband') ||
      (this.playerData.equipment.accessory2 && this.playerData.equipment.accessory2.item === 'equip_vintage_armband')
    );
    if (hasVintageArmband && amount > 0) {
      finalAmount += Math.max(1, Math.round(amount * 0.10));
    }

    this.playerData.exp += finalAmount;
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

  getItemCount(itemId) {
    if (!this.playerData || !this.playerData.inventory) return 0;
    const existing = this.playerData.inventory.find(i => i.item === itemId);
    return existing ? (existing.count || 0) : 0;
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
    if (itemId === 'item_forsythia' && this.playerData && this.playerData.quests && this.playerData.quests['quest_kimmijin_art']) {
      const q = this.playerData.quests['quest_kimmijin_art'];
      if (q.status === 'in_progress') {
        const curFlowers = this.getItemCount('item_forsythia');
        if (curFlowers >= 3) {
          if (q.sketchbookCollected) {
            setTimeout(() => {
              if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
                window.AudioManager.playFanfare();
              }
              this.showToast('🎉 [김진믜 선생님의 미술 프로젝트] 모든 목표 달성! 김진믜 선생님께 돌아가 의뢰를 완료하세요!', 'success');
            }, 500);
          } else {
            this.showToast('🌼 [김진믜 선생님의 미술 프로젝트] 개나리 꽃잎 3송이 수집 완료! (스케치북 회수 필요)', 'info');
          }
        }
      }
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
  // ========================================================
  // 📚 2층 도서관 (독립 전용층) 상호작용 및 퀘스트 시스템
  // ========================================================

  isQuestLibBookPgCollected() {
    if (!this.playerData || !this.playerData.quests) return false;
    const q = this.playerData.quests['quest_library_missing_books'];
    return !!(q && q.bookPgCollected);
  }

  isQuestLibBookOfCollected() {
    if (!this.playerData || !this.playerData.quests) return false;
    const q = this.playerData.quests['quest_library_missing_books'];
    return !!(q && q.bookOfCollected);
  }

  isQuestLibBookHiCollected() {
    if (!this.playerData || !this.playerData.quests) return false;
    const q = this.playerData.quests['quest_library_missing_books'];
    return !!(q && q.bookHiCollected);
  }

  // 1번 구현: '오늘의 지혜 명언' 독서대 (일일 명언 감상 및 30분간 경험치 +15% 버프 활성화)
  handleWisdomBookInteraction() {
    if (this._wisdomBookCooldown && Date.now() - this._wisdomBookCooldown < 1500) return;
    this._wisdomBookCooldown = Date.now();

    const quotes = [
      {
        quote: "별을 노래하는 마음으로 모든 죽어가는 것을 사랑해야지. 그리고 나한테 주어진 길을 걸어가야겠다.",
        author: "윤동주 시인, <서시>",
        context: "일제강점기 숭실의 맑고 순결한 민족시인 윤동주의 영혼이 깃든 불멸의 명문장"
      },
      {
        quote: "내가 남들보다 조금 더 멀리 볼 수 있었다면, 그것은 거인들의 어깨 위에 올라서 있었기 때문이다.",
        author: "아이작 뉴턴 (Isaac Newton)",
        context: "앞선 탐구자들의 지식과 진리에 대한 겸손과 끊임없는 지적 호기심"
      },
      {
        quote: "성찰하지 않는 삶은 살 가치가 없다. 너 자신을 알라.",
        author: "소크라테스 (Socrates)",
        context: "지혜의 시작은 내가 모른다는 것을 인정하고 성찰의 질문을 던지는 것"
      },
      {
        quote: "진리는 반드시 따르는 자가 있고, 정의는 반드시 이루는 날이 있다. 낙심치 말고 굳세게 나아가라.",
        author: "도산 안창호 선생",
        context: "숭실의 민족 지도자 안창호 선생이 이 나라 청년들에게 전하는 불멸의 희망"
      },
      {
        quote: "책 없는 방은 영혼이 없는 육체와 같다.",
        author: "키케로 (Cicero)",
        context: "독서는 영혼을 깨우고 생각의 지평을 넓히는 가장 위대한 여행"
      },
      {
        quote: "배우고 때로 익히면 또한 기쁘지 아니한가. 벗이 먼 곳에서 찾아오면 또한 즐겁지 아니한가.",
        author: "공자 (Confucius), <논어>",
        context: "새로운 앎을 깨닫는 배움의 순수한 희열과 함께 성장하는 벗의 소중함"
      }
    ];

    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % quotes.length;
    const q = quotes[dayIndex] || quotes[0];

    // 5분 경험치 버프 발동 (+15%)
    this.applyBuff('reading_exp', 5 * 60 * 1000, '오늘의 지혜 (경험치 +15%)', '📖');
    this.playerData.readingExpBuffUntil = Date.now() + 5 * 60 * 1000;
    this.saveProgress();

    if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
      window.AudioManager.playFanfare();
    }

    const story = `📜 《오늘의 지혜 명언 독서대》\n\n"${q.quote}"\n\n— ${q.author} —\n\n💡 [사색의 길잡이]:\n${q.context}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n✨ [오늘의 독서 축복 버프 활성화!]\n• 📖 [오늘의 지혜 버프]: 앞으로 5분 동안 모든 경험치(EXP) 획득량 +15% 증가!\n• 🌟 가슴속에 깊은 영감과 지혜의 빛이 환하게 피어오릅니다!`;

    if (window.RPGDialog) {
      window.RPGDialog.show('📖 오늘의 지혜 명언 독서대', story, '📖');
    } else {
      alert(story);
    }
  }

  // 중앙 독서 열람석 (책상 & 의자 - 착석 및 독서 사색)
  handleLibraryReadingDeskInteraction() {
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }

    // 의자 방향에 맞춰 플레이어 시선 테이블을 향하도록 정렬
    if (this.engine && this.engine.player) {
      this.engine.player.direction = (this.engine.player.y > 11 * 32) ? 'up' : 'down';
    }

    const story = `🪑 《도서관 중앙 독서 열람석》\n\n"고풍스러운 오크 원목 책상과 편안한 앤틱 의자에 몸을 기댑니다.\n\n책상 위 은은한 초록빛 뱅커스 램프 아래에서 책장을 조용히 넘깁니다. 도서관 특유의 고요한 침묵과 차분한 종이 내음이 마음을 편안하게 감싸 안습니다.\n\n바쁜 학교 일상에서 잠시 벗어나 활자 속 깊은 지혜와 마주하자, 머리가 맑아지고 마음속에 깊은 안정과 집중력이 깃듭니다."\n\n✨ [독서의 평온함]: 마음에 평화로운 사색의 여유가 가득합니다.`;

    if (window.RPGDialog) {
      window.RPGDialog.show('🪑 중앙 독서 열람석', story, '📖');
    } else {
      alert(story);
    }
  }

  // 도서 검색기 컴퓨터 (종합 도서 자료 검색대)
  handleLibraryPcInteraction() {
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }

    const story = `🖥️ 《숭실 도서관 종합 도서 검색 시스템 (OPAC)》\n\n"도서관 디지털 학습존(디벗 단말기 옆) 자료 검색 단말기가 부드러운 블루스크린 불빛을 비추고 있습니다."\n\n📊 [실시간 소장 도서 현황]:\n• 총 보유 도서: 25,480권 (대출 가능: 23,120권)\n\n📂 [주요 분류별 서가 위치 안내]:\n• 📚 문학·철학 (000/100): 북서쪽 서가 (윤동주 전집, 세계문학)\n• 🔬 자연과학·기술 (400/500): 북쪽 서가 (과학 비전서, 상대성이론)\n• 🇬🇧 외국어·어학 (700): 서쪽 통로 1열 (Joshua 영단어 비법전서)\n• 📜 역사·사회 (300/900): 서쪽 통로 2열 (1897 숭실 독립운동사)\n• 🎨 예술·체육 (600): 서남쪽 서가 (세계 명화 도록, 스포츠 교본)\n• 📰 정기간행물 (050): 동쪽 벽면 서가 (과학동아, 최신 시사 잡지)\n• 💬 교양 그래픽노블: 동남쪽 서가 (Why? 시리즈, 세계 역사 만화)\n\n🔍 [분실 도서 긴급 회수 수배 안내]:\n• 📘 [세계문학 전집]: 운동장 관람석 스탠드 벤치 제보\n• 📗 [최신 과학 잡지]: 6층 교무실 과학 졍경슉 선생님 연구석 제보\n• 📕 [숭실 역사 고문서]: 1897 숭실역사관 안쪽 전시실 제보`;

    if (window.RPGDialog) {
      window.RPGDialog.show('🖥️ 도서 검색용 컴퓨터', story, '🖥️');
    } else {
      alert(story);
    }
  }

  // 📚 도서관 7대 테마 서가 완독 기록 및 [📖 다독왕] 칭호 지급
  recordBookshelfVisit(shelfId) {
    if (!this.playerData) return;
    if (!this.playerData.visitedBookshelves) {
      this.playerData.visitedBookshelves = [];
    }

    const allShelves = [
      'bookshelf_lit',
      'bookshelf_sci',
      'bookshelf_eng',
      'bookshelf_his',
      'bookshelf_art',
      'bookshelf_mag',
      'bookshelf_comic'
    ];

    const isNew = !this.playerData.visitedBookshelves.includes(shelfId);
    if (isNew) {
      this.playerData.visitedBookshelves.push(shelfId);
      this.saveProgress();
    }

    const visitedCount = allShelves.filter(s => this.playerData.visitedBookshelves.includes(s)).length;

    const titleName = '📖 다독왕';
    const titleId = 'title_avid_reader';
    if (!this.playerData.titles) this.playerData.titles = [];

    const alreadyHasTitle = this.playerData.titles.includes(titleId) || this.playerData.titles.includes(titleName);

    if (visitedCount >= 7 && !alreadyHasTitle) {
      this.playerData.titles.push(titleId);
      this.playerData.titles.push(titleName);
      this.saveProgress();

      if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
        window.AudioManager.playFanfare();
      }

      this.showToast('🏅 [도서관 대업적 완수!] 7대 테마 서가를 모두 완독하여 칭호 [📖 다독왕]을 획득했습니다!', 'success');
    } else if (isNew && visitedCount < 7) {
      this.showToast(`📚 [서가 탐독 기록]: ${visitedCount}/7 서가 완독! (7곳 완독 시 '다독왕' 칭호 획득)`, 'info');
    }
  }

  // 2번 구현-A: 문학·철학 서가 (윤동주 시집 & 고전문학)
  handleBookshelfLitInteraction() {
    this.recordBookshelfVisit('bookshelf_lit');
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }

    const story = `📚 [문학·철학 대형 서가]\n\n"서가 중앙에 숭실의 자랑이자 민족시인인 윤동주의 유고 시집 <하늘과 바람과 별과 시>가 단정히 놓여 있습니다.\n\n조심스레 책장을 넘기자, '별 헤는 밤', '자화상', '서시' 등 시대를 뛰어넘는 서정적인 문장들이 가슴을 뭉클하게 적십니다.\n그 곁으로 김소월의 <진달래꽃>, 헤르만 헤세의 <데미안> 등 시대를 밝힌 동서양 명작들이 가지런히 꽂혀 있습니다."\n\n✨ [숭실 문학의 향기]:\n"책장을 덮자 맑고 고결한 시인의 마음이 마음속에 온화하게 머뭅니다."`;

    if (window.RPGDialog) {
      window.RPGDialog.show('📚 [문학·철학 서가] 윤동주 시집 & 고전문학', story, '📚');
    } else {
      alert(story);
    }
  }

  // 2번 구현-B: 자연과학·연금 서가 (졍경슉 비전서 & 실험일지)
  handleBookshelfSciInteraction() {
    this.recordBookshelfVisit('bookshelf_sci');
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }

    const story = `🔬 [자연과학·연금 대형 서가]\n\n"1학년 5반 과학 졍경슉 선생님께서 정성껏 작성하신 <신비한 과학 실험 비전서>와 두툼한 백과사전들이 꽂혀 있습니다!\n\n손글씨로 적힌 연구 일지에는 주홍 물약과 용기 물약의 핵심 촉매 반응비, 화학 주기율표의 비밀, 그리고 중간고사 과학 시험에 꼭 출제될 주요 실험 법칙들이 흥미진진하게 정리되어 있습니다!"\n\n🧪 [과학 선생님의 비전 메모]:\n'관찰하고 의문을 품어라! 과학은 자연이 들려주는 가장 아름다운 규칙이란다. - 졍경슉 선생님'`;

    if (window.RPGDialog) {
      window.RPGDialog.show('🔬 [자연과학·연금 서가] 졍경슉 비전서 & 실험일지', story, '🔬');
    } else {
      alert(story);
    }
  }

  // 2번 구현-C: 외국어·어학 서가 (Joshua 영단어 비법전서)
  handleBookshelfEngInteraction() {
    this.recordBookshelfVisit('bookshelf_eng');
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }

    const story = `🇬🇧 [외국어·어학 대형 서가]\n\n"3학년 영어 Joshua 선생님의 특급 비법이 담긴 <초강력 영단어 암기 비전서>와 원서 소설들이 서가를 채우고 있습니다!\n\n'접두사(Prefix)와 어근(Root)만 알면 모르는 단어도 한눈에 뜻이 보인다!'\n외국어 공부를 두려워하지 않고 세계와 소통하는 글로벌 숭실인이 되기 위한 꿀팁들이 빼곡합니다!"\n\n👨‍🏫 [Joshua 선생님의 응원 한마디]:\n"Don't be afraid to make mistakes! Practice makes perfect! Keep going, my student!"`;

    if (window.RPGDialog) {
      window.RPGDialog.show('🇬🇧 [외국어·어학 서가] Joshua 영단어 비법전서', story, '🇬🇧');
    } else {
      alert(story);
    }
  }

  // 추가 서가-D: 역사·사회 서가 (1897 숭실 독립사 & 인문고전)
  handleBookshelfHisInteraction() {
    this.recordBookshelfVisit('bookshelf_his');
    this.playerData.visitedLibraryHistory = true;

    // 1차 퀘스트 완료 후 2차 퀘스트 [지(智)] 도서관 역사 서가 덕목 진행 인정
    if (this.playerData.timeCapsuleRewardClaimed) {
      this.playerData.virtueWisdomLibrary = true;
      if (this.playerData.virtueWisdomMuseum) {
        if (!this.playerData.virtueWisdomDone) {
          this.playerData.virtueWisdomDone = true;
          this.showToast('📚 [숭실 3대 덕목 - 지(智)] 도서관 & 역사관 사료 열람 완료! 지혜 증명 완료!', 'success');
        }
      } else {
        this.showToast('📖 [숭실 3대 덕목 - 지(智)] 2층 도서관 역사 서가 열람 완료! (4층 역사관도 방문하세요)', 'info');
      }
    }
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }

    const story = `📜 [역사·사회 대형 서가]\n\n"1897년 평양에서 시작된 숭실학당의 웅장한 역사와 일제강점기 신사참배 거부 및 자진 폐교의 결의를 담은 독립운동 사료들이 보존되어 있습니다.\n\n민족의 수난기 속에서도 신앙과 민족혼을 지켜낸 숭실 선배들의 의로운 발자취와 근현대 인문사회학 명저들이 깊은 울림을 전해줍니다."\n\n🏛️ [숭실의 역사 정신]:\n'진리와 봉사(Truth and Service) — 어둠을 밝히는 등불이 되리라.'`;

    if (window.RPGDialog) {
      window.RPGDialog.show('📜 [역사·사회 서가] 1897 숭실 역사 & 인문고전', story, '📜');
    } else {
      alert(story);
    }
  }

  // 추가 서가-E: 예술·체육 대형 서가 (명화 도록 & 스포츠 교본)
  handleBookshelfArtInteraction() {
    this.recordBookshelfVisit('bookshelf_art');
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }

    const story = `🎨 [예술·체육 대형 서가]\n\n"르네상스 명화부터 현대 미술에 이르는 대형 미술 도록과 바흐, 모차르트, 베토벤의 클래식 명곡 악보 전집이 정갈하게 꽂혀 있습니다.\n\n그 곁으로는 축구, 농구, 배구, 육상, 수영 등 다양한 종목의 스포츠 경기 규칙 가이드와 기초 체력 단련, 스포츠 과학을 다룬 건강 운동 교본들이 가지런히 진열되어 있습니다."\n\n🏃 [건전한 신체와 풍요로운 감성]:\n"아름다운 예술은 영혼을 풍요롭게 하고, 땀방울이 깃든 건강한 체육 활동은 활기찬 삶의 원동력이 됩니다!"`;

    if (window.RPGDialog) {
      window.RPGDialog.show('🎨 [예술·체육 서가] 명화 도록 & 스포츠 교본', story, '🎨');
    } else {
      alert(story);
    }
  }

  // 추가 서가-F: 정기간행물 서가 (최신 과학 잡지 & 시사 교지)
  handleBookshelfMagInteraction() {
    this.recordBookshelfVisit('bookshelf_mag');
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }

    const story = `📰 [정기간행물·잡지 서가]\n\n"최신호 <과학동아>, <내셔널 지오그래픽>, 시사 월간지, 그리고 학생들이 직접 엮은 숭실 교지들이 깔끔하게 진열되어 있습니다.\n\n인공지능과 우주 탐사의 최신 트렌드부터 이번 달 학교 소식까지 다채롭고 생생한 지식이 가득합니다."\n\n💡 [세상을 보는 창]:\n"매달 새롭게 쏟아지는 지식의 파도를 타고 넓은 세상으로 시야를 넓힙니다."`;

    if (window.RPGDialog) {
      window.RPGDialog.show('📰 [정기간행물 서가] 과학동아 & 최신 잡지', story, '📰');
    } else {
      alert(story);
    }
  }

  // 추가 서가-G: 교양만화 서가 (세계 역사 & 과학 그래픽노블)
  handleBookshelfComicInteraction() {
    this.recordBookshelfVisit('bookshelf_comic');
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }

    const story = `💬 [청소년 교양만화 서가]\n\n"손때 묻은 <먼나라 이웃나라>, <그리스 로마 신화>, <Why? 인공지능과 미래과학>, <만화 조선왕조실록> 전권이 서가에 빼곡합니다!\n\n어려운 역사와 과학 개념도 재미있는 그림과 연출로 머리에 쏙쏙 들어와, 쉬는 시간마다 학생들의 손길이 끊이지 않는 인기 만점 구역입니다!"\n\n😄 [즐거운 상상력]:\n"만화책을 넘기며 상상력의 날개를 활짝 폅니다!"`;

    if (window.RPGDialog) {
      window.RPGDialog.show('💬 [교양만화 서가] 세계 역사 & 과학 그래픽노블', story, '💬');
    } else {
      alert(story);
    }
  }

  // 4번 구현: 스마트 디벗 거치대 존 (디지털 학습 단말기 - 체력회복 기능 제거됨)
  handleLibraryDibutInteraction() {
    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }

    const story = `📱 [도서관 스마트 디벗 단말기 존]\n\n"책상 위에 은은한 충전 불빛과 함께 5대의 최신 디벗(Dibut) 태블릿이 가지런히 정렬되어 있습니다.\n숭실 e-Library 및 전자도서관 디지털 시스템에 상시 연결되어 있습니다."\n\n💡 [디지털 학습 리소스]:\n• 🔍 숭실 소장 도서 25,000권 e-Book 전자책 열람 지원\n• 📖 이번 주 추천 전자책:\n  1위: <하늘과 바람과 별과 시> (윤동주)\n  2위: <코스모스> (칼 세이건)\n  3위: <데미안> (헤르만 헤세)\n• 🌐 디지털 교과서 및 교과 연계 멀티미디어 탐구 자료 상시 이용 가능!`;

    if (window.RPGDialog) {
      window.RPGDialog.show('📱 스마트 디벗 학습 단말기', story, '📱');
    } else {
      alert(story);
    }
  }

  // 3번 구현: 분실된 대출도서 3권 회수 핸들러
  handleLibraryBookPickup(bookType) {
    if (!this.playerData.quests) this.playerData.quests = {};
    const quest = this.playerData.quests['quest_library_missing_books'];

    const bookConfig = {
      pg: {
        flag: 'bookPgCollected',
        itemKey: 'item_lib_book_pg',
        itemName: '소설책 (세계문학 전집)',
        icon: '📘',
        desc: '운동장 관람석 스탠드에 떨어져 있던 도서관 대출도서',
        placeName: '운동장 관람석 스탠드'
      },
      of: {
        flag: 'bookOfCollected',
        itemKey: 'item_lib_book_of',
        itemName: '과학 잡지 (최신 뉴턴 매거진)',
        icon: '📗',
        desc: '6층 교무실 과학 선생님 연구석 주변에 꽂혀 있던 도서관 대출도서',
        placeName: '6층 교무실 과학 연구석'
      },
      hi: {
        flag: 'bookHiCollected',
        itemKey: 'item_lib_book_hi',
        itemName: '역사 고문서 도록 (1897 숭실)',
        icon: '📕',
        desc: '숭실역사관 전시실에 놓여 있던 귀중한 역사 도록 대출도서',
        placeName: '숭실역사관 전시실'
      }
    };

    const cfg = bookConfig[bookType];
    if (!cfg) return;

    if (!quest || quest.status !== 'in_progress') {
      const msg = `${cfg.icon} [바닥에 놓인 대출도서: ${cfg.itemName}]\n\n"2층 도서관 사서 선생님이 애타게 찾으시던 분실도서 같습니다.\n2층 도서관 사서 선생님을 먼저 찾아가 의뢰를 수락하세요!"`;
      if (window.RPGDialog) {
        window.RPGDialog.show(`${cfg.icon} ${cfg.itemName}`, msg, cfg.icon);
      } else {
        alert(msg);
      }
      return;
    }

    if (quest[cfg.flag]) {
      this.showToast(`이미 ${cfg.itemName}을(를) 회수했습니다.`, 'info');
      return;
    }

    quest[cfg.flag] = true;
    this.addItem(cfg.itemKey, cfg.itemName, 1, cfg.icon, {
      type: 'quest',
      effect: cfg.desc
    });
    this.saveProgress();
    this.updateQuestTracker();

    if (window.AudioManager && typeof window.AudioManager.playCollect === 'function') {
      window.AudioManager.playCollect();
    }

    this.showToast(`${cfg.icon} ${cfg.placeName}에서 [${cfg.itemName}]을(를) 회수했습니다!`, 'success');

    if (quest.bookPgCollected && quest.bookOfCollected && quest.bookHiCollected) {
      setTimeout(() => {
        if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
          window.AudioManager.playFanfare();
        }
        this.showToast('🎉 [도서관 의뢰] 3권의 도서를 모두 회수했습니다! 2층 도서관 사서 선생님께 돌아가 의뢰를 완료하세요!', 'success');
      }, 500);
    }
  }

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
        hp: (this.playerData.hp !== undefined && this.playerData.hp !== null) ? this.playerData.hp : 100,
        maxHp: this.playerData.maxHp || 100,
        isFallen: !!this.playerData.isFallen,
        baseHp: this.playerData.baseHp,
        baseAtk: this.playerData.baseAtk,
        baseDef: this.playerData.baseDef,
        inventory: this.playerData.inventory,
        equipment: this.playerData.equipment,
        isAccessory2Unlocked: !!this.playerData.isAccessory2Unlocked,
        hairColor: this.playerData.hairColor,
        outfitColor: this.playerData.outfitColor,
        hasReceivedSoongsilGift: !!this.playerData.hasReceivedSoongsilGift,
        hasOpenedSecretLocker: !!this.playerData.hasOpenedSecretLocker,
        hasCheckedMirror: !!this.playerData.hasCheckedMirror,
        hasOpenedLostBox: !!this.playerData.hasOpenedLostBox,
        hasReadDevNote: !!this.playerData.hasReadDevNote,
        hasReadDevNote2: !!this.playerData.hasReadDevNote2,
        hasClearedFirstBoss: !!this.playerData.hasClearedFirstBoss,
        hasClearedDragonRaid: !!this.playerData.hasClearedDragonRaid,
        hasClearedCerberusRaid: !!this.playerData.hasClearedCerberusRaid,
        hasClearedClass704: !!this.playerData.hasClearedClass704,
        job: this.playerData.job || null,
        hasEscapedCareerRoom: !!this.playerData.hasEscapedCareerRoom,
        careerClues: Array.isArray(this.playerData.careerClues) ? this.playerData.careerClues : [false, false, false, false, false, false],
        historyVitrines: Array.isArray(this.playerData.historyVitrines) ? this.playerData.historyVitrines : [false, false, false, false],
        solvedMoralQuestionIds: Array.isArray(this.playerData.solvedMoralQuestionIds) ? this.playerData.solvedMoralQuestionIds : [],
        titles: this.playerData.titles || [],
        equippedTitle: this.playerData.equippedTitle || null,
        quests: this.playerData.quests || {},
        secretHistoryRoomUnlocked: !!this.playerData.secretHistoryRoomUnlocked,
        openedSecretHistoryChest: !!this.playerData.openedSecretHistoryChest,
        hiddenQuestCareer1: this.playerData.hiddenQuestCareer1 || null,
        hasHangangwooBookmark: !!this.playerData.hasHangangwooBookmark,
        hiddenQuestCareer2: this.playerData.hiddenQuestCareer2 || null,
        updatedAt: Date.now()
      };
      localStorage.setItem('soongsil_save_' + this.playerData.studentId, JSON.stringify(saveData));
      if (this.playerData.quests) {
        try { localStorage.setItem('soongsil_quests_' + this.playerData.studentId, JSON.stringify(this.playerData.quests)); } catch (e) {}
      }
      if (this.playerData.hasClearedClass704) {
        try { localStorage.setItem('soongsil_class704_cleared_' + this.playerData.studentId, 'true'); } catch (e) {}
      }
      if (this.playerData.job) {
        try { localStorage.setItem('soongsil_job_' + this.playerData.studentId, this.playerData.job); } catch (e) {}
      }
      if (this.playerData.hasEscapedCareerRoom) {
        try { localStorage.setItem('soongsil_career_escaped_' + this.playerData.studentId, 'true'); } catch (e) {}
      }
      if (Array.isArray(this.playerData.careerClues)) {
        try { localStorage.setItem('soongsil_career_clues_' + this.playerData.studentId, JSON.stringify(this.playerData.careerClues)); } catch (e) {}
      }
      if (Array.isArray(this.playerData.solvedMoralQuestionIds)) {
        try { localStorage.setItem('soongsil_class704_solved_' + this.playerData.studentId, JSON.stringify(this.playerData.solvedMoralQuestionIds)); } catch (e) {}
      }
      if (this.playerData.secretHistoryRoomUnlocked) {
        try { localStorage.setItem('soongsil_secret_history_unlocked_' + this.playerData.studentId, 'true'); } catch (e) {}
      }
      if (this.playerData.openedSecretHistoryChest) {
        try { localStorage.setItem('soongsil_secret_history_chest_' + this.playerData.studentId, 'true'); } catch (e) {}
      }

      // 무료 서버 트래픽 최소화: 데이터 변경 감지 (Dirty Check)
      // 학생이 아무런 아이템/골드/경험치/장비 변동 없이 단순 이동/대기 중일 때는 서버 POST 요청을 100% 생략!
      const dataHash = `${saveData.level}_${saveData.exp}_${saveData.gold}_${saveData.hp}_${saveData.isFallen}_${saveData.inventory.length}_${JSON.stringify(saveData.equipment)}_${saveData.hasReceivedSoongsilGift}_${saveData.hasOpenedSecretLocker}_${saveData.hasCheckedMirror}_${saveData.hasOpenedLostBox}_${saveData.hasReadDevNote}_${saveData.hasReadDevNote2}_${saveData.hasClearedFirstBoss}_${saveData.hasClearedDragonRaid}_${saveData.hasClearedClass704}_${(saveData.solvedMoralQuestionIds || []).length}_${saveData.job}_${saveData.hasEscapedCareerRoom}_${(saveData.careerClues || []).join(',')}_${(saveData.historyVitrines || []).join(',')}_${(saveData.titles || []).join(',')}_${saveData.equippedTitle}_${saveData.secretHistoryRoomUnlocked}_${saveData.openedSecretHistoryChest}`;
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
      localStorage.removeItem('soongsil_bus_egg_' + studentId);
      localStorage.removeItem('soongsil_ev_egg_' + studentId);
      localStorage.removeItem('soongsil_dev_note_1_' + studentId);
      localStorage.removeItem('soongsil_first_boss_cleared_' + studentId);
      localStorage.removeItem('soongsil_dragon_cleared_' + studentId);
      localStorage.removeItem('soongsil_cerberus_cleared_' + studentId);
      localStorage.removeItem('soongsil_class704_cleared_' + studentId);
      localStorage.removeItem('soongsil_class704_solved_' + studentId);
      localStorage.removeItem('soongsil_job_' + studentId);
      localStorage.removeItem('soongsil_career_escaped_' + studentId);
      localStorage.removeItem('soongsil_career_clues_' + studentId);
      console.log(`[Storage] 학생(${studentId}) 로컬 브라우저 세이브 초기화 완료`);
    } catch (e) {
      console.warn('Failed to clear local student data', e);
    }
  }

  onAdminProgressSynced(updatedProgress) {
    if (!this.playerData || !updatedProgress) return;
    const incomingStudentId = updatedProgress.studentId || this.playerData.studentId;
    if (this.playerData.studentId && incomingStudentId !== this.playerData.studentId) return;
    this.playerData.level = updatedProgress.level || this.playerData.level;
    this.playerData.gold = updatedProgress.gold !== undefined ? updatedProgress.gold : this.playerData.gold;
    this.playerData.exp = updatedProgress.exp !== undefined ? updatedProgress.exp : this.playerData.exp;
    this.playerData.name = updatedProgress.name || this.playerData.name;
    this.playerData.hasReceivedSoongsilGift = !!updatedProgress.hasReceivedSoongsilGift;
    this.playerData.hasOpenedSecretLocker = !!updatedProgress.hasOpenedSecretLocker;
    this.playerData.hasCheckedMirror = !!updatedProgress.hasCheckedMirror;
    this.playerData.hasOpenedLostBox = !!updatedProgress.hasOpenedLostBox;
    this.playerData.hasCheckedSchoolBus = !!updatedProgress.hasCheckedSchoolBus;
    this.playerData.hasShockedEVCharger = !!updatedProgress.hasShockedEVCharger;
    this.playerData.hasCheckedSchoolBus = !!updatedProgress.hasCheckedSchoolBus;
    this.playerData.hasShockedEVCharger = !!updatedProgress.hasShockedEVCharger;
    this.playerData.hasReadDevNote = !!updatedProgress.hasReadDevNote;
    this.playerData.hasClearedFirstBoss = !!updatedProgress.hasClearedFirstBoss;
    this.playerData.hasClearedDragonRaid = !!updatedProgress.hasClearedDragonRaid;
    this.playerData.hasClearedCerberusRaid = !!updatedProgress.hasClearedCerberusRaid;

    const sId = this.playerData.studentId;
    if (sId) {
      if (this.playerData.hasReceivedSoongsilGift) localStorage.setItem('soongsil_gift_' + sId, 'true'); else localStorage.removeItem('soongsil_gift_' + sId);
      if (this.playerData.hasOpenedSecretLocker) localStorage.setItem('soongsil_secret_locker_' + sId, 'true'); else localStorage.removeItem('soongsil_secret_locker_' + sId);
      if (this.playerData.hasCheckedMirror) localStorage.setItem('soongsil_mirror_' + sId, 'true'); else localStorage.removeItem('soongsil_mirror_' + sId);
      if (this.playerData.hasOpenedLostBox) localStorage.setItem('soongsil_lost_box_' + sId, 'true'); else localStorage.removeItem('soongsil_lost_box_' + sId);
      if (this.playerData.hasCheckedSchoolBus) localStorage.setItem('soongsil_bus_egg_' + sId, 'true'); else localStorage.removeItem('soongsil_bus_egg_' + sId);
      if (this.playerData.hasShockedEVCharger) localStorage.setItem('soongsil_ev_egg_' + sId, 'true'); else localStorage.removeItem('soongsil_ev_egg_' + sId);
      if (this.playerData.hasReadDevNote) localStorage.setItem('soongsil_dev_note_1_' + sId, 'true'); else localStorage.removeItem('soongsil_dev_note_1_' + sId);
      if (this.playerData.hasClearedFirstBoss) localStorage.setItem('soongsil_first_boss_cleared_' + sId, 'true'); else localStorage.removeItem('soongsil_first_boss_cleared_' + sId);
      if (this.playerData.hasClearedDragonRaid) localStorage.setItem('soongsil_dragon_cleared_' + sId, 'true'); else localStorage.removeItem('soongsil_dragon_cleared_' + sId);
      if (this.playerData.hasClearedCerberusRaid) localStorage.setItem('soongsil_cerberus_cleared_' + sId, 'true'); else localStorage.removeItem('soongsil_cerberus_cleared_' + sId);
    }
    try {
      localStorage.setItem('soongsil_save_' + this.playerData.studentId, JSON.stringify(updatedProgress));
    } catch (e) {}
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
    const removedEggTitles = ['🚌 숭실 축구부 버스 우수 승객', '🚌 숭실 통학버스 우수 승객', '⚡ 찌릿찌릿 썬더볼트', '📚 지혜의 탐구자', 'title_wisdom_seeker'];
    if (removedEggTitles.includes(this.playerData.equippedTitle)) {
      this.playerData.equippedTitle = null;
    }
    if (Array.isArray(this.playerData.titles)) {
      this.playerData.titles = this.playerData.titles.filter(t => !removedEggTitles.includes(t));
    }
    const title = this.playerData.equippedTitle;
    const name = this.playerData.name || '학생';
    const fullDisplayName = title ? `[${title}] ${name}` : name;
        const jobBadge = document.getElementById('hud-job-badge');
    if (jobBadge) {
      if (this.playerData.job) {
        const jobDef = this.JOB_PASSIVE_DEFINITIONS ? this.JOB_PASSIVE_DEFINITIONS.find(j => j.id === this.playerData.job || j.legacyId === this.playerData.job) : null;
        jobBadge.style.display = 'inline-block';
        jobBadge.innerText = jobDef ? `${jobDef.icon} ${jobDef.name}` : `직업: ${this.playerData.job}`;
      } else {
        jobBadge.style.display = 'none';
      }
    }
    if (this.hudName) {
      this.hudName.innerText = fullDisplayName;
    }
    if (this.engine && this.engine.player) {
      this.engine.player.name = name;
      this.engine.player.equippedTitle = title;
    }
    this.updateQuestTracker();
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
    let basePrice = 1;
    if (this.ITEM_SELL_PRICES && this.ITEM_SELL_PRICES[itemId] !== undefined) {
      basePrice = this.ITEM_SELL_PRICES[itemId];
    } else if (itemId.startsWith('equip_bronze')) basePrice = 10;
    else if (itemId.startsWith('equip_leather')) basePrice = 8;
    else if (itemId.startsWith('equip_wood')) basePrice = 3;
    else if (itemId.startsWith('item_')) basePrice = 2;

    return basePrice;
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
      if (type === 'consumable' || invItem.item.includes('potion') || invItem.item.includes('scroll') || invItem.item === 'equip_elevator_pass' || invItem.item === 'equip_vintage_armband' || def.meta?.isQuestItem || this.getItemSellPrice(invItem.item) <= 0) {
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
    if (itemId === 'equip_vintage_armband' || itemId === 'equip_elevator_pass' || this.getItemSellPrice(itemId) <= 0) {
      this.showToast('이 유물/특수 아이템은 매점에서 매각할 수 없습니다!', 'warning');
      return;
    }
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
    if (modalInv && !modalInv.classList.contains('hidden')) {
      this.openInventory();
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

    
    // [특별 이벤트] 숭실 삼디다스 실내화 교환 카드 (호칭 카드와 100% 동일한 좌우 정렬 UI 구조)
    const hasShoes = (this.playerData.inventory || []).some(i => i && i.item === 'equip_shoes_samdidas') ||
                    (this.playerData.equipment && this.playerData.equipment.shoes && this.playerData.equipment.shoes.item === 'equip_shoes_samdidas');
    const examItem = (this.playerData.inventory || []).find(i => i && i.item === 'item_perfect_exam');
    const examCount = examItem ? examItem.count : 0;
    const evalItem = (this.playerData.inventory || []).find(i => i && i.item === 'item_eval_paper');
    const evalCount = evalItem ? evalItem.count : 0;
    const canAffordShoes = !hasShoes && (examCount >= 1 || evalCount >= 1);

    const eventCard = document.createElement('div');
    eventCard.style.cssText = `
      background: ${hasShoes ? 'rgba(30, 41, 59, 0.7)' : '#1e293b'};
      border: 2px solid ${hasShoes ? '#10b981' : '#334155'};
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    `;

    eventCard.innerHTML = `
      <div style="flex: 1;">
        <div style="display:flex; align-items:center; gap: 8px;">
          <span style="font-size: 16px; font-weight: 900; color: #fef08a;">👟 삼디다스 실내화</span>
          ${hasShoes ? '<span style="font-size:11px; font-weight:800; background:#059669; color:#fff; padding:2px 8px; border-radius:12px;">보유/착용 중</span>' : '<span style="font-size:11px; font-weight:800; background:#0284c7; color:#fff; padding:2px 8px; border-radius:12px;">이벤트 장비</span>'}
        </div>
        <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">
          누구나 한 번쯤 사 신어봤다는 전설의 국민 실내화.<br>뒤축을 살짝 꺾어 신으면 복도 끝까지 쏜살같이 질주할 수 있을 것만 같다.<br><span style="color:#67e8f9; font-weight:bold;">[특수 효과] Shift 키를 누르면 3초간 약한 질주(속도 15% 증가)가 가능합니다.</span>
        </div>
        ${!hasShoes ? `
          <div style="font-size: 11.5px; margin-top: 6px; color: ${canAffordShoes ? '#4ade80' : '#f87171'}; font-weight: 700;">
            필요: 💯 백점만점 시험지 1개 또는 📜 A+ 만점 수행평가지 1개 <span style="font-weight:400; color:#94a3b8;">(보유: 백점만점 시험지 ${examCount}개, A+ 만점 수행평가지 ${evalCount}개)</span>
          </div>
        ` : ''}
      </div>
      <div style="flex-shrink: 0;">
        ${hasShoes ? `
          <button class="btn-primary" disabled style="font-size: 12px; padding: 7px 16px; font-weight:800; background:#334155; border-color:#475569; color:#64748b; cursor:default;">
            보유 중
          </button>
        ` : `
          <button class="btn-exchange-shoes btn-primary" ${!canAffordShoes ? 'disabled' : ''} style="font-size: 12px; padding: 7px 16px; font-weight:800; ${!canAffordShoes ? 'background:#334155; border-color:#475569; color:#64748b; cursor:not-allowed;' : 'background:#d97706; border-color:#b45309; cursor:pointer;'}">
            교환하기
          </button>
        `}
      </div>
    `;

    const btnExchangeShoes = eventCard.querySelector('.btn-exchange-shoes');
    if (btnExchangeShoes && canAffordShoes) {
      btnExchangeShoes.addEventListener('click', () => {
        const useExam = (examCount >= 1);
        const costItemId = useExam ? 'item_perfect_exam' : 'item_eval_paper';
        const costItemName = useExam ? '💯 백점만점 시험지' : '📜 A+ 만점 수행평가지';
        
        const doExchange = () => {
          this.removeItem(costItemId, 1);
          this.addItem('equip_shoes_samdidas', '👟 삼디다스 실내화', 1, '👟', {
            type: 'equipment',
            slot: 'shoes',
            stats: { atk: 2, def: 2, hp: 10 },
            effect: '누구나 한 번쯤 사 신어봤다는 전설의 국민 실내화. 뒤축을 살짝 꺾어 신으면 복도 끝까지 쏜살같이 질주할 수 있을 것만 같다. [특수 효과] Shift 키를 누르면 질주가 가능합니다.'
          });
          this.equipItem('equip_shoes_samdidas');
          this.updateDashButtonUI();
          if (window.AudioManager && window.AudioManager.playFanfare) {
            window.AudioManager.playFanfare();
          }
          alert('🎉 [이벤트 신발 교환 완료!]\n\n[👟 삼디다스 실내화]를 획득하여 장착했습니다!\n이제 Shift 키를 누르면 가볍게 질주할 수 있습니다! 🏃💨');
          this.renderTitleExchangeModal();
        };

        if (window.RPGDialog) {
          window.RPGDialog.confirm(
            '신발 교환',
            `[${costItemName}] 1개를 소모하여 [👟 삼디다스 실내화]를 교환하시겠습니까?`,
            '👟',
            doExchange
          );
        } else if (confirm(`👟 [${costItemName}] 1개를 소모하여 [👟 삼디다스 실내화]를 교환하시겠습니까?`)) {
          doExchange();
        }
      });
    }
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
      } else if (t.costType === 'quest') {
        canAfford = false;
        costText = '특별 퀘스트 달성 필요';
        if (t.id === 'title_history_bearer') {
          progressText = '(숭실역사관 4대 전시관 답사)';
        } else if (t.id === 'title_drummer') {
          progressText = '(1학년 4반 도덕 비트 20문제 완파)';
        } else if (t.id === 'title_avid_reader') {
          const visitedCount = (this.playerData.visitedBookshelves || []).length;
          progressText = `(도서관 7대 서가 완독: ${visitedCount}/7)`;
        } else if (t.id && t.id.startsWith('title_job_')) {
          progressText = '(5층 진로상담실 방탈출 & 전직)';
        } else {
          progressText = '(특별 퀘스트 달성 시 자동 지급)';
        }
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

  // =========================================================================
  // ⚗️ 졍경슉 선생님의 연금술 연구실 (1학년 5반) - 골드로 기초 재료 연성
  // =========================================================================
  openAlchemyModal() {
    const modal = document.getElementById('modal-alchemy');
    if (!modal) return;

    this.renderAlchemyModal();
    modal.classList.remove('hidden');

    if (!this._alchemyInitialized) {
      this._alchemyInitialized = true;
      const btnCloseX = document.getElementById('btn-close-alchemy-x');
      if (btnCloseX) btnCloseX.addEventListener('click', () => modal.classList.add('hidden'));
      const btnClose = document.getElementById('btn-close-alchemy');
      if (btnClose) btnClose.addEventListener('click', () => modal.classList.add('hidden'));

      modal.querySelectorAll('.btn-alchemy-transmute').forEach(btn => {
        btn.addEventListener('click', () => {
          const itemKey = btn.dataset.item;
          const itemName = btn.dataset.name;
          const icon = btn.dataset.icon;
          const count = parseInt(btn.dataset.count) || 1;
          const cost = parseInt(btn.dataset.cost) || 0;
          this.transmuteAlchemyItem(itemKey, itemName, icon, count, cost);
        });
      });
    }
  }

  renderAlchemyModal() {
    const goldDisplay = document.getElementById('alchemy-player-gold');
    if (goldDisplay) goldDisplay.innerText = `${this.playerData.gold || 0} G`;

    const getInvCount = (k) => {
      const it = (this.playerData.inventory || []).find(i => i.item === k);
      return it ? it.count : 0;
    };

    const woodEl = document.getElementById('alchemy-count-wood');
    if (woodEl) woodEl.innerText = getInvCount('item_wood');

    const herbEl = document.getElementById('alchemy-count-herb');
    if (herbEl) herbEl.innerText = getInvCount('item_herb');

    const forsythiaEl = document.getElementById('alchemy-count-forsythia');
    if (forsythiaEl) forsythiaEl.innerText = getInvCount('item_forsythia');
  }

  transmuteAlchemyItem(itemKey, itemName, icon, count, cost) {
    if ((this.playerData.gold || 0) < cost) {
      this.showToast(`골드가 부족합니다! (필요: ${cost}G / 보유: ${this.playerData.gold || 0}G)`, 'error');
      if (window.AudioManager && window.AudioManager.playWrong) window.AudioManager.playWrong();
      return;
    }

    this.playerData.gold -= cost;
    if (this.hudGold) this.hudGold.innerText = this.playerData.gold;

    let meta = { type: 'material' };
    if (itemKey === 'item_wood') meta.effect = '단단한 목재 · 기본 장비 제작 재료';
    else if (itemKey === 'item_herb') meta.effect = '향긋한 허브 · 포션 조제 재료';
    else if (itemKey === 'item_forsythia') meta.effect = '노란 개나리 꽃잎 · 개나리 반지 및 주홍 물약 재료';

    this.addItem(itemKey, itemName, count, icon, meta);
    this.saveProgress();
    this.renderAlchemyModal();

    if (window.AudioManager && window.AudioManager.playCollect) {
      window.AudioManager.playCollect();
    }
    this.showToast(`⚗️ [연금술 성공] 졍경슉 선생님의 연금술로 [${icon} ${itemName} x${count}개]를 연성했습니다! (-${cost}G)`, 'success');
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
    const mobileBtnB = document.getElementById('btn-mobile-b');
    const canDash = this.engine && this.engine.player && (this.engine.player.hasRunningShoes || this.engine.player.isTeacher);
    if (canDash) {
      if (btnB) {
        btnB.classList.remove('btn-b-locked');
        btnB.title = '달리기 (Shift를 누른 채 이동)';
        const sub = btnB.querySelector('.btn-sub');
        if (sub) sub.textContent = '달리기';
      }
      if (mobileBtnB) {
        mobileBtnB.classList.remove('btn-b-locked');
        mobileBtnB.title = '질주 (SHIFT)';
        const label = mobileBtnB.querySelector('.mobile-btn-label');
        if (label) label.textContent = '질주';
      }
    } else {
      if (btnB) {
        btnB.classList.add('btn-b-locked');
        btnB.title = '특별한 신발을 얻어야 달릴 수 있습니다';
        const sub = btnB.querySelector('.btn-sub');
        if (sub) sub.textContent = '🔒 달리기 (잠김)';
      }
      if (mobileBtnB) {
        mobileBtnB.classList.add('btn-b-locked');
        mobileBtnB.title = '특별한 신발을 얻어야 달릴 수 있습니다';
        const label = mobileBtnB.querySelector('.mobile-btn-label');
        if (label) label.textContent = '🔒';
      }
    }
  }

  // 📜 교무실 탕비실 떨어진 개발자노트 이스터에그 (제3편)
  handleDevNote3Interaction() {
    const studentId = (this.playerData && this.playerData.studentId) || 'default';
    const noteKey = 'soongsil_dev_note_3_' + studentId;
    let alreadyRead = false;
    try {
      alreadyRead = !!(studentId && localStorage.getItem(noteKey) === 'true');
    } catch (e) {}

    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }

    const noteStory =
      "📜 [떨어진 개발자노트 — 제3편: 소회의실의 따뜻한 아침 온기]\n\n" +
      "\"이른 아침 고요한 교무실 소회의실. 은은하게 퍼지는 커피 향기 속에\n" +
      "선생님들이 아이들을 맞이하기 위해 분주히 수업을 준비하던 모습이 떠오릅니다.\n\n" +
      "단어 암기와 문법 공부가 지루했던 아이들이 게임 속에서 활짝 웃으며 뛰놀 수 있도록,\n" +
      "복도와 교실, 소회의실 구석구석에 비밀스런 이스터에그와 따뜻한 애정을 숨겨두었습니다.\n\n" +
      "숭실의 모든 꿈들이 교무실의 불빛처럼 언제나 밝고 따스하게 빛나기를 바랍니다.\n\n" +
      "— 소회의실 커피 한 잔의 온기를 전하며, 개발자 갓준철 올림 ☕✨—\"";

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
        "🎁 [개발자노트 제3편 감상 보너스]\n" +
        "• 갓준철 선생님의 따스한 커피 한 잔 같은 온기가 전해집니다!\n" +
        "• 🪙 골드 +50G 획득!\n" +
        "• 🌟 경험치 +50 EXP 획득!"
      );
    } else {
      alert(noteStory);
    }
  }

  // ♻️ 6층 복도 분리수거함 퀴즈 시스템 (분리수거왕 칭호 획득)
  handleRecycleBinInteraction() {
    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }

    const modal = document.getElementById('modal-recycle-quiz');
    if (!modal) return;

    const qEl = document.getElementById('recycle-quiz-question');
    const optsEl = document.getElementById('recycle-quiz-options');
    const feedEl = document.getElementById('recycle-quiz-feedback');
    const feedTitle = document.getElementById('recycle-quiz-feedback-title');
    const feedDesc = document.getElementById('recycle-quiz-feedback-desc');
    const btnRetry = document.getElementById('btn-recycle-quiz-retry');
    const btnClose = document.getElementById('btn-recycle-quiz-close');
    const btnCloseX = document.getElementById('btn-close-recycle-quiz-x');

    const RECYCLE_QUESTIONS = [
      {
        question: "🍜 라면 국물이 배어 빨갛게 물든 스티로폼 컵라면 용기는 어떻게 분리배출해야 할까요?",
        options: [
          "깨끗이 씻기지 않고 이물질 얼룩이 남았다면 종량제 일반쓰레기로 배출한다.",
          "빨간 얼룩이 있어도 무조건 스티로폼 수거함에 넣는다.",
          "비닐류 수거함에 구겨서 버린다.",
          "플라스틱 수거함에 다른 플라스틱과 겹쳐서 버린다."
        ],
        answer: 0,
        explanation: "음식물로 오염되어 색이나 기름기가 지워지지 않는 스티로폼은 재활용 공정에서 불량을 일으키므로 종량제 일반쓰레기로 배출해야 합니다!"
      },
      {
        question: "🥤 생수나 음료를 다 마신 '투명 페트병'의 올바른 분리배출 3단계 순서는?",
        options: [
          "내용물 비우기 → 라벨 제거 → 찌그러뜨려 뚜껑 닫고 투명 페트병 전용함에 배출",
          "음료가 남아있어도 라벨만 떼서 바로 배출한다.",
          "비닐 라벨을 붙인 채로 발로 밟아 플라스틱함에 배출한다.",
          "가위로 조각조각 잘라서 종량제 봉투에 버린다."
        ],
        answer: 0,
        explanation: "투명 페트병은 고품질 재생 섬유의 원료가 됩니다! 라벨을 뜯고 속을 비운 뒤 찌그러뜨려 뚜껑을 닫아 배출하는 것이 올바른 방법입니다."
      },
      {
        question: "📦 택배 종이 상자를 분리수거할 때 반드시 떼어내서 제거해야 하는 것은?",
        options: [
          "상자에 붙은 비닐 테이프와 택배 송장 스티커",
          "상자의 네 모서리 부분",
          "상자에 적힌 브랜드 로고 인쇄면",
          "상자 겉면의 얇은 펄프 표면"
        ],
        answer: 0,
        explanation: "종이박스에 붙은 비닐 테이프와 택배 송장은 재활용을 방해하는 대표적인 이물질이므로 반드시 떼어내고 상자를 납작하게 접어서 배출해야 합니다!"
      },
      {
        question: "🔨 실수로 바닥에 떨어뜨려 와장창 깨진 유리병은 어떻게 처리해야 할까요?",
        options: [
          "신문지에 싸서 수거원이 다치지 않게 종량제 봉투나 특수규격 마대에 배출한다.",
          "깨진 조각을 유리병 분리수거함에 그대로 쏟아 붓는다.",
          "플라스틱 수거함 안쪽에 몰래 숨겨서 버린다.",
          "물에 깨끗이 씻어서 투명 비닐봉투에 담아 버린다."
        ],
        answer: 0,
        explanation: "깨진 유리는 재활용이 불가능하며 수거 작업자의 안전을 위협할 수 있습니다. 신문지 등으로 여러 겹 감싸 안전하게 종량제 봉투나 불연성 마대에 배출해야 합니다."
      },
      {
        question: "📓 다 쓴 철제 스프링 공책(노트)을 올바르게 분리배출하는 방법은?",
        options: [
          "철제 스프링을 종이와 분리하여 스프링은 고철류, 종이는 종이류에 배출한다.",
          "스프링이 달린 채로 통째로 종이류 수거함에 버린다.",
          "통째로 고철류 수거함에 버린다.",
          "분리하기 귀찮으니 무조건 일반쓰레기 종량제 봉투에 버린다."
        ],
        answer: 0,
        explanation: "서로 다른 재질(철과 종이)이 결합된 물품은 반드시 재질별로 분리해서 각각 고철류와 종이류에 배출해야 재활용할 수 있습니다!"
      }
    ];

    const loadQuestion = () => {
      feedEl.classList.add('hidden');
      btnRetry.classList.add('hidden');

      const q = RECYCLE_QUESTIONS[Math.floor(Math.random() * RECYCLE_QUESTIONS.length)];
      qEl.innerText = q.question;
      optsEl.innerHTML = '';

      // Shuffle options while keeping correct answer flag
      const list = q.options.map((opt, idx) => ({ text: opt, isCorrect: idx === q.answer }));
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }

      const numEmojis = ['①', '②', '③', '④'];
      list.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.style.cssText = 'width: 100%; text-align: left; padding: 12px 14px; background: rgba(30, 41, 59, 0.85); border: 1.5px solid #334155; border-radius: 9px; color: #f8fafc; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: all 0.18s; line-height: 1.45; display: flex; align-items: flex-start; gap: 8px;';
        btn.innerHTML = '<span style="color:#38bdf8; font-weight:800; font-size:15px; line-height:1;">' + (numEmojis[index] || (index + 1)) + '</span> <span>' + item.text + '</span>';

        btn.onmouseover = () => { btn.style.background = '#1e3a8a'; btn.style.borderColor = '#60a5fa'; };
        btn.onmouseout = () => {
          if (!btn.disabled) {
            btn.style.background = 'rgba(30, 41, 59, 0.85)';
            btn.style.borderColor = '#334155';
          }
        };

        btn.onclick = () => {
          // Disable all choice buttons
          Array.from(optsEl.children).forEach(b => {
            b.disabled = true;
            b.style.cursor = 'default';
          });

          if (item.isCorrect) {
            btn.style.background = '#065f46';
            btn.style.borderColor = '#34d399';

            if (window.AudioManager && window.AudioManager.playFanfare) {
              window.AudioManager.playFanfare();
            }

            if (!this.playerData.titles) this.playerData.titles = [];
            const tId = 'title_recycle_king';
            const tName = '♻️ 분리수거왕';
            const isFirst = !this.playerData.titles.includes(tId) && !this.playerData.titles.includes(tName);

            if (!this.playerData.titles.includes(tId)) this.playerData.titles.push(tId);
            if (!this.playerData.titles.includes(tName)) this.playerData.titles.push(tName);
            this.playerData.recycleQuizCleared = true;

            // 1차 퀘스트 완료 후 2차 퀘스트 [덕(德)] 분리수거 품성 덕목 진행 인정
            if (this.playerData.timeCapsuleRewardClaimed) {
              if (!this.playerData.virtueMannerDone) {
                this.playerData.virtueMannerDone = true;
                this.showToast('♻️ [숭실 3대 덕목 - 덕(德)] 6층 분리수거 퀴즈 통과! 품성 증명 완료!', 'success');
              }
            }

            let bonusText = '';
            if (isFirst) {
              this.addGold(30);
              this.addExp(30);
              bonusText = '<br><br>━━━━━━━━━━━━━━━━━━━━<br>🎁 <b>[분리수거왕 보너스 달성!]</b><br>• 칭호: <b>[♻️ 분리수거왕]</b> 획득!<br>• 🪙 골드 +30G 획득!<br>• 🌟 경험치 +30 EXP 획득!';
              this.showToast('🎉 [♻️ 분리수거왕] 칭호를 획득했습니다! (+30G, +30 EXP)', 'success');
            } else {
              bonusText = '<br><br><i>(이미 [♻️ 분리수거왕] 칭호를 획득하셨습니다! 에코 환경 지킴이 최고! 👍)</i>';
            }

            this.saveProgress();
            if (typeof this.renderTitles === 'function') this.renderTitles();

            feedEl.classList.remove('hidden');
            feedEl.style.borderColor = '#22c55e';
            feedEl.style.background = 'rgba(6, 78, 59, 0.4)';
            feedTitle.innerHTML = '🎉 딩동댕! 정답입니다!';
            feedTitle.style.color = '#4ade80';
            feedDesc.innerHTML = '💡 <b>[올바른 분리배출 상식]</b><br>' + q.explanation + bonusText;
            btnRetry.classList.add('hidden');
          } else {
            btn.style.background = '#7f1d1d';
            btn.style.borderColor = '#f87171';

            if (window.AudioManager && window.AudioManager.playSelect) {
              window.AudioManager.playSelect();
            }

            feedEl.classList.remove('hidden');
            feedEl.style.borderColor = '#ef4444';
            feedEl.style.background = 'rgba(127, 29, 29, 0.4)';
            feedTitle.innerHTML = '❌ 앗, 아쉽게 틀렸습니다!';
            feedTitle.style.color = '#f87171';
            feedDesc.innerHTML = '💡 <b>[다시 생각해보기]</b><br>' + q.explanation + '<br><br>다시 도전하여 <b>[♻️ 분리수거왕]</b> 칭호를 획득해보세요!';
            btnRetry.classList.remove('hidden');
          }
        };

        optsEl.appendChild(btn);
      });
    };

    if (btnCloseX && !btnCloseX._bound) {
      btnCloseX._bound = true;
      btnCloseX.addEventListener('click', () => modal.classList.add('hidden'));
    }
    if (btnClose && !btnClose._bound) {
      btnClose._bound = true;
      btnClose.addEventListener('click', () => modal.classList.add('hidden'));
    }
    if (btnRetry && !btnRetry._bound) {
      btnRetry._bound = true;
      btnRetry.addEventListener('click', () => loadQuestion());
    }

    loadQuestion();
    modal.classList.remove('hidden');
  }

  // 📜 정문 앞 도로 떨어진 개발자노트 이스터에그 (제4편)
  handleDevNote4Interaction() {
    const studentId = (this.playerData && this.playerData.studentId) || 'default';
    const noteKey = 'soongsil_dev_note_4_' + studentId;
    let alreadyRead = false;
    try {
      alreadyRead = !!(studentId && localStorage.getItem(noteKey) === 'true');
    } catch (e) {}

    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }

    const noteStory =
      "📜 [떨어진 개발자노트 — 제4편: 헐떡이는 숨소리와 전설의 등교 언덕길]\n\n" +
      "\"매일 아침 숭실 정문 급경사 언덕길을 올려다보며,\n" +
      "가방을 질끈 메고 전력으로 질주하던 우리 학생들의 거친 숨소리가 떠오릅니다.\n\n" +
      "8시 20분, 종소리가 울리고 온 힘을 다해 몸을 날리던 그 순간의 심장 박동!\n" +
      "힘들고 가파른 오르막길 같았던 수많은 시험과 고민들도,\n" +
      "친구와 어깨를 나란히 하고 뛰다 보면 어느새 정상의 교문에 도달해 있던 것처럼 말입니다.\n\n" +
      "넘어져도 다시 털고 일어나는 이 언덕길의 뜀박질이,\n" +
      "먼 훗날 여러분이 마주할 더 큰 세상의 오르막에서도 지치지 않는 튼튼한 날개가 되어주길 바랍니다.\n\n" +
      "— 등굣길 언덕 바람을 함께 맞으며, 개발자 갓준철 올림 🏃‍♂️✨—\"";

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
        "🎁 [개발자노트 제4편 감상 보너스]\n" +
        "• 갓준철 선생님의 따뜻한 응원의 메시지가 마음에 와닿습니다!\n" +
        "• 🪙 골드 +50G 획득!\n" +
        "• 🌟 경험치 +50 EXP 획득!"
      );
    } else {
      alert(noteStory);
    }
  }

  
  // =========================================================================
  // 👑 6층 교무실 갓준철 선생님 연구 책상 (26번 좌석) 인터랙션 시스템
  // =========================================================================
  // 📐 6층 교무실 30번 좌석 이상대 수학선생님 연구석 인터랙션
  // 💬 5층 진로상담실 [1:1 상담실 1] 진로 심층 상담석 & 히든 퀘스트: 10년 전 선배의 진로 고민
  handleCareerCounsel1Interaction() {
    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }

    const quest1State = this.playerData ? this.playerData.hiddenQuestCareer1 : null;
    const hasBookmark = !!(this.playerData && this.playerData.hasHangangwooBookmark);

    // 1. 이미 히든 퀘스트 완료
    if (quest1State === 'completed') {
      const msg = '10년 전 선배의 고민 편지와 한강우 국어선생님의 격려 책갈피가 파일철에 나란히 보관되어 있습니다.\n\n' +
        '📝 [보관된 답장]\n"어떤 꿈이든 진심을 다해 쓴 글은 누군가의 어두운 밤을 비추는 등불이 된단다. 네 꿈을 결코 의심하지 마라. - 국어교사 한강우"\n\n' +
        '꿈을 향해 걸어갈 수 있는 따뜻한 온기가 마음 깊이 전해집니다. (히든 퀘스트 완료됨)';
      if (window.RPGDialog) {
        window.RPGDialog.show('💬 [1:1 상담실 1] 진로 심층 상담석', msg, '🍂');
      } else {
        alert(msg);
      }
      return;
    }

    // 2. 한강우 선생님 연구석에서 격려 책갈피를 찾아온 경우 -> 퀘스트 완료!
    if (hasBookmark) {
      const completeMsg = '한강우 국어선생님 연구석에서 찾은 [격려의 책갈피]를 10년 전 선배의 고민 편지 옆에 소중히 꽂았습니다!\n\n' +
        '📝 [에필로그]\n놀랍게도 편지 속 10년 전 학생은 훗날 아름다운 시집을 펴낸 작가가 되어, 모교 숭실의 후배들에게 따뜻한 응원을 보내고 있습니다!\n\n' +
        '시간을 넘어 맺어진 사제 간의 마음에 깊은 감동이 차오릅니다.\n\n' +
        '🎁 [보상 획득]\n🍂 황금 은행잎 1개를 획득했습니다!';

      if (window.AudioManager && window.AudioManager.playFanfare) {
        window.AudioManager.playFanfare();
      }

      this.addItem('item_ginkgo', '황금 은행잎', 1, '🍂', {
        type: 'material',
        effect: '부활 주문서 및 합심의 황금 은행잎 부적 제작 재료'
      });
      this.playerData.hiddenQuestCareer1 = 'completed';
      const studentId = this.playerData.studentId;
      if (studentId) {
        try {
          localStorage.setItem('soongsil_hidden_career_1_' + studentId, 'completed');
        } catch (e) {}
      }
      this.saveProgress(true);

      if (window.RPGDialog) {
        window.RPGDialog.show('🎉 [히든 퀘스트 완료] 10년 전 선배의 고민', completeMsg, '🍂');
      } else {
        alert(completeMsg);
      }
      this.showToast('🎉 [히든 퀘스트 완료] 10년 전 선배의 고민 해결! 보상: 🍂 황금 은행잎 1개 획득!', 'success');
      return;
    }

    // 3. 퀘스트 진행 중 (책갈피를 아직 못 찾음)
    if (quest1State === 'in_progress') {
      const hintMsg = '파일철 사이에 끼워진 10년 전 선배의 빛바랜 고민 편지입니다.\n\n' +
        '"선생님, 저는 글을 쓰고 시를 읽는 것이 가장 행복하지만... 문학으로는 살아가기 힘들다는 말에 가슴이 무너집니다. 제 꿈을 믿고 가도 될까요? - 10년 전 어느 학생"\n\n' +
        '🔍 [추적 힌트]\n쪽지 뒤편 메모: "교무실 한강우 국어선생님 자리에 제 소중한 시집과 메모를 두고 온 것 같아요..."\n\n' +
        '6층 교무실 한강우 선생님 연구석을 확인해보세요!';
      if (window.RPGDialog) {
        window.RPGDialog.show('💬 [1:1 상담실 1] 10년 전 선배의 고민 쪽지', hintMsg, '📜');
      } else {
        alert(hintMsg);
      }
      return;
    }

    // 4. 최초 발견 -> 퀘스트 시작!
    const startMsg = '맞춤형 진로 파일철을 넘기던 중, 맨 뒷장에 끼워진 낡고 바랜 양면 편지 한 장을 발견했습니다!\n\n' +
      '📜 [10년 전 숭실 선배의 편지]\n"선생님, 저는 글을 쓰고 시를 읽는 것이 세상에서 가장 행복하지만... 제 꿈을 믿고 계속 걸어가도 될까요? 문학으로는 성공하기 어렵다는 말에 밤마다 눈물이 납니다."\n\n' +
      '쪽지 뒷면에 작은 손글씨가 적혀 있습니다:\n"추신: 교무실 한강우 국어선생님 자리에 제 소중한 시집과 메모를 두고 온 것 같아요..."\n\n' +
      '✨ [히든 퀘스트 시작!] 6층 교무실 한강우 선생님 연구석을 확인해보자!';

    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }

    this.playerData.hiddenQuestCareer1 = 'in_progress';
    const sId = this.playerData.studentId;
    if (sId) {
      try {
        localStorage.setItem('soongsil_hidden_career_1_' + sId, 'in_progress');
      } catch (e) {}
    }
    this.saveProgress(true);

    if (window.RPGDialog) {
      window.RPGDialog.show('✨ [히든 퀘스트 발견] 10년 전 선배의 진로 고민', startMsg, '📜');
    } else {
      alert(startMsg);
    }
    this.showToast('✨ [히든 퀘스트] 10년 전 선배의 고민 발견! 6층 교무실 한강우 선생님 자리를 확인하세요.', 'info');
  }

  // 💬 5층 진로상담실 [1:1 상담실 2] 학습·진학 코칭석 & 히든 퀘스트: 마음 치유의 특제 허브티
  handleCareerCounsel2Interaction() {
    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }

    const quest2State = this.playerData ? this.playerData.hiddenQuestCareer2 : null;

    // 1. 이미 완료한 경우
    if (quest2State === 'completed') {
      const msg = '향긋한 개나리와 약초 허브티 향기가 방 안에 은은하게 감돌고 있습니다.\n\n' +
        '📝 [코칭 포스트잇]\n"마음이 지칠 때는 잠시 따뜻한 차 한 잔과 함께 숨을 고르자. 포기하지 않고 걸어가는 모든 걸음이 너의 찬란한 미래가 될 거야!"\n\n' +
        '머릿속이 맑아지고 마음이 한결 차분해집니다. (히든 퀘스트 완료됨)';
      if (window.RPGDialog) {
        window.RPGDialog.show('💬 [1:1 상담실 2] 학습·진학 코칭석', msg, '🍵');
      } else {
        alert(msg);
      }
      return;
    }

    // 2. 퀘스트 진행 중인 경우 -> 재료 확인 및 달이기
    if (quest2State === 'in_progress') {
      const herbCount = (typeof this.getItemCount === 'function' ? this.getItemCount('item_herb') : 0) || 0;
      const forsythiaCount = (typeof this.getItemCount === 'function' ? this.getItemCount('item_forsythia') : 0) || 0;

      // 재료 충족: 향긋한 허브 5개 + 노란 개나리 꽃잎 2개
      if (herbCount >= 5 && forsythiaCount >= 2) {
        this.removeItem('item_herb', 5);
        this.removeItem('item_forsythia', 2);

        const completeMsg = '모아온 [향긋한 허브 5개]와 [노란 개나리 꽃잎 2개]를 찻주전자에 넣고 따뜻한 온수를 부었습니다!\n\n' +
          '은은한 황금빛 김과 함께 달콤하고 향긋한 허브티가 완성되었습니다.\n' +
          '한 모금 마시자 가슴을 짓누르던 시험 스트레스와 불안감이 눈 녹듯 사르르 풀려납니다.\n\n' +
          '찻잔 받침대 아래에 감사의 징표로 반짝이는 황금 은행잎이 놓여 있습니다.\n\n' +
          '🎁 [보상 획득]\n🍂 황금 은행잎 1개를 획득했습니다!';

        if (window.AudioManager && window.AudioManager.playFanfare) {
          window.AudioManager.playFanfare();
        }

        this.addItem('item_ginkgo', '황금 은행잎', 1, '🍂', {
          type: 'material',
          effect: '부활 주문서 및 합심의 황금 은행잎 부적 제작 재료'
        });
        this.playerData.hiddenQuestCareer2 = 'completed';
        const studentId = this.playerData.studentId;
        if (studentId) {
          try {
            localStorage.setItem('soongsil_hidden_career_2_' + studentId, 'completed');
          } catch (e) {}
        }
        this.saveProgress(true);

        if (window.RPGDialog) {
          window.RPGDialog.show('🎉 [히든 퀘스트 완료] 마음 치유의 특제 허브티', completeMsg, '🍂');
        } else {
          alert(completeMsg);
        }
        this.showToast('🎉 [히든 퀘스트 완료] 특제 허브티 달이기 성공! 보상: 🍂 황금 은행잎 1개 획득!', 'success');
        return;
      }

      // 재료 부족 안내
      const needMsg = '따뜻한 찻잔 옆에 찻주전자가 정갈하게 준비되어 있습니다.\n\n' +
        '📜 [허브티에 필요한 재료]\n' +
        `• 🌿 향긋한 허브: ${herbCount} / 5개\n` +
        `• 🌼 노란 개나리 꽃잎: ${forsythiaCount} / 2개\n\n` +
        '향긋한 허브 5개와 노란 개나리 꽃잎 2개를 모아오면 따뜻한 허브티를 달일 수 있습니다.';
      if (window.RPGDialog) {
        window.RPGDialog.show('🍵 [1:1 상담실 2] 특제 허브티 재료 준비 중', needMsg, '🌿');
      } else {
        alert(needMsg);
      }
      return;
    }

    // 3. 최초 발견 -> 퀘스트 시작!
    const startMsg = '자기주도학습 플래너를 살펴보던 중, 뒤표지에 손글씨로 적힌 특별한 메모를 발견했습니다!\n\n' +
      '📜 [마음 치유의 특제 허브티 레시피]\n"시험과 진로에 대한 불안감으로 마음이 턱 막힐 때는, [향긋한 허브 5개]와 [노란 개나리 꽃잎 2개]를 달여 마셔보렴. 굳었던 마음이 사르르 녹아내린단다."\n\n' +
      '✨ [히든 퀘스트 시작!] 향긋한 허브 5개와 노란 개나리 꽃잎 2개를 모아와 따뜻한 허브티를 달여보자!';

    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }

    this.playerData.hiddenQuestCareer2 = 'in_progress';
    const sId = this.playerData.studentId;
    if (sId) {
      try {
        localStorage.setItem('soongsil_hidden_career_2_' + sId, 'in_progress');
      } catch (e) {}
    }
    this.saveProgress(true);

    if (window.RPGDialog) {
      window.RPGDialog.show('✨ [히든 퀘스트 발견] 마음 치유의 특제 허브티', startMsg, '🍵');
    } else {
      alert(startMsg);
    }
    this.showToast('✨ [히든 퀘스트] 특제 허브티 레시피 발견! 향긋한 허브 5개와 노란 개나리 꽃잎 2개를 모아오세요.', 'info');
  }

  handleHangangwooDeskInteraction() {
    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }

    // 히든 퀘스트 1 진행 중이고 책갈피를 아직 얻지 않은 경우
    if (this.playerData && this.playerData.hiddenQuestCareer1 === 'in_progress' && !this.playerData.hasHangangwooBookmark) {
      const bookmarkMsg = '한강우 선생님 책상 위 두꺼운 한국 현대 문학 전집을 살펴보던 중, 책장 사이에 단정하게 꽂힌 원목 책갈피를 발견했습니다!\n\n' +
        '🔖 [한강우 선생님의 답장 책갈피]\n"어떤 꿈이든 진심을 다해 쓴 글은 누군가의 어두운 밤을 비추는 등불이 된단다. 네 꿈을 결코 의심하지 마라. - 국어교사 한강우"\n\n' +
        '10년 전 방황하던 제자에게 건네려 했던 따뜻한 격려의 말씀입니다.\n\n' +
        '이 책갈피를 가지고 5층 [1:1 상담실 1]로 돌아가자!';

      this.playerData.hasHangangwooBookmark = true;
      const sId = this.playerData.studentId;
      if (sId) {
        try {
          localStorage.setItem('soongsil_hangangwoo_bookmark_' + sId, 'true');
        } catch (e) {}
      }
      this.saveProgress(true);

      if (window.AudioManager && window.AudioManager.playCollect) {
        window.AudioManager.playCollect();
      }

      if (window.RPGDialog) {
        window.RPGDialog.show('📖 한강우 선생님 연구석 - 숨겨진 책갈피', bookmarkMsg, '🔖');
      } else {
        alert(bookmarkMsg);
      }
      this.showToast('🔖 [단서 획득] 한강우 선생님의 격려 책갈피를 찾았습니다! 5층 1:1 상담실 1로 돌아가세요.', 'success');
      return;
    }

    if (window.RPGDialog) {
      window.RPGDialog.show(
        '📖 한강우 선생님 연구석',
        '국어를 가르치시는 한강우 선생님의 자리입니다.\n\n' +
        '책상 위에 두꺼운 국어 교재와 한국 현대 문학 전집, 단정한 국어 학습 유인물, 그리고 따뜻한 차 한 잔이 가지런히 놓여 있습니다.\n\n' +
        '📝 [모니터 포스트잇]\n"말과 글은 그 사람의 얼과 품격을 담는 그릇이다. 아름다운 우리말을 사랑하고 가꾸자. (국어 한강우)"',
        '👨‍🏫'
      );
    } else {
      alert('📖 [한강우 선생님 연구석]\n\n국어를 가르치시는 한강우 선생님의 자리입니다.\n책상 위에 국어 교재와 현대 문학 전집, 따뜻한 차 한 잔이 가지런히 정돈되어 있습니다.');
    }
  }

  handleSangdaeDeskInteraction() {
    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }
    if (window.RPGDialog) {
      window.RPGDialog.show(
        '📐 이상대 선생님 연구석',
        '1학년 1반 담임이자 수학을 가르치시는 이상대 선생님의 자리입니다.\n\n' +
        '책상 위에 커다란 노란색 아크릴 삼각자와 각도기, 공학용 계산기, 두꺼운 수학 교재 더미가 자로 잰 듯 반듯하게 정돈되어 있습니다.\n\n' +
        '📝 [모니터 포스트잇]\n"수학은 단순 공식 암기가 아니라 생각의 길을 찾는 아름다운 학문이다! (1-1 학생들 파이팅!)"',
        '👨‍🏫'
      );
    } else {
      alert('📐 [이상대 선생님 연구석]\n\n1학년 1반 담임 이상대 수학선생님의 자리입니다.\n책상 위에 삼각자와 계산기, 수학 교재가 반듯하게 놓여 있습니다.');
    }
  }

  // 🧪 6층 교무실 23번 좌석 졍경슉 과학/연금술선생님 연구석 인터랙션
  handleKyungsukDeskInteraction() {
    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }
    if (window.RPGDialog) {
      window.RPGDialog.show(
        '🧪 졍경슉 선생님 연구석',
        '1학년 5반 담임이자 과학과 신비한 연금을 가르치시는 졍경슉 선생님의 자리입니다.\n\n' +
        '책상 위에 에메랄드빛 삼각 플라스크와 3구 시험관 꽂이, 미니 정밀 현미경, 초록색 과학 관찰 일지가 가지런히 놓여 있습니다.\n\n' +
        '📝 [모니터 메모]\n"자연의 원리를 탐구하고 새로운 물질을 창조하는 호기심이 세상을 바꾼다! 🧪✨"',
        '👩‍🔬'
      );
    } else {
      alert('🧪 [졍경슉 선생님 연구석]\n\n1학년 5반 담임 졍경슉 과학선생님의 자리입니다.\n책상 위에 플라스크와 시험관, 현미경이 놓여 있습니다.');
    }
  }

  // 🥁 6층 교무실 27번 좌석 후니후니 도덕선생님 연구석 인터랙션
  handleHunihuniDeskInteraction() {
    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }
    if (window.RPGDialog) {
      window.RPGDialog.show(
        '🥁 후니후니 선생님 연구석',
        '1학년 4반 담임이자 도덕과 바른 인성을 가르치시는 후니후니 선생님의 자리입니다.\n\n' +
        '책상 위에 붉은색 윤리/도덕 교재와 한 쌍의 원목 드럼스틱, 클래식 템포 메트로놈, 락앤롤 머그컵이 놓여 있습니다.\n\n' +
        '📝 [모니터 메모]\n"인생은 멋진 리듬이고, 도덕은 세상과 맞추는 최고의 하모니다! 🥁🤘"',
        '👨‍🏫'
      );
    } else {
      alert('🥁 [후니후니 선생님 연구석]\n\n1학년 4반 담임 후니후니 도덕선생님의 자리입니다.\n책상 위에 드럼스틱과 도덕 교재, 메트로놈이 놓여 있습니다.');
    }
  }

  handleJuncheolDeskInteraction() {
    const modal = document.getElementById('modal-juncheol-desk');
    if (!modal) return;

    if (!this._juncheolDeskModalInitialized) {
      this._juncheolDeskModalInitialized = true;

      // 닫기 버튼들
      const btnCloseX = document.getElementById('btn-close-juncheol-desk-x');
      if (btnCloseX) btnCloseX.addEventListener('click', () => this.closeJuncheolDeskModal());

      const btnCloseBottom = document.getElementById('btn-close-juncheol-desk-bottom');
      if (btnCloseBottom) btnCloseBottom.addEventListener('click', () => this.closeJuncheolDeskModal());

      const btnCloseGuestBottom = document.getElementById('btn-close-juncheol-guestbook-bottom');
      if (btnCloseGuestBottom) btnCloseGuestBottom.addEventListener('click', () => this.closeJuncheolDeskModal());

      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeJuncheolDeskModal();
      });

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
          this.closeJuncheolDeskModal();
        }
      });

      // 탭 전환 (둘러보기 vs 방명록 남기기)
      const tabInspect = document.getElementById('btn-tab-juncheol-inspect');
      if (tabInspect) tabInspect.addEventListener('click', () => this.switchJuncheolDeskTab('inspect'));

      const tabGuestbook = document.getElementById('btn-tab-juncheol-guestbook');
      if (tabGuestbook) tabGuestbook.addEventListener('click', () => this.switchJuncheolDeskTab('guestbook'));

      const btnGotoGuestbook = document.getElementById('btn-goto-guestbook-from-inspect');
      if (btnGotoGuestbook) btnGotoGuestbook.addEventListener('click', () => this.switchJuncheolDeskTab('guestbook'));

      const btnGotoInspect = document.getElementById('btn-goto-inspect-from-guestbook');
      if (btnGotoInspect) btnGotoInspect.addEventListener('click', () => this.switchJuncheolDeskTab('inspect'));

      // 추천 응원 쪽지 버튼 클릭
      const presetButtons = modal.querySelectorAll('.btn-preset-note');
      presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const note = btn.getAttribute('data-note');
          if (note) this.saveJuncheolGuestbookNote(note);
        });
      });

      // 직접 응원 메시지 적기
      const btnSubmitCustom = document.getElementById('btn-submit-juncheol-custom-note');
      const inputCustom = document.getElementById('input-juncheol-custom-note');
      if (btnSubmitCustom && inputCustom) {
        btnSubmitCustom.addEventListener('click', () => {
          const text = inputCustom.value.trim();
          if (!text) {
            this.showToast('메시지를 입력해주세요!', 'warning');
            return;
          }
          this.saveJuncheolGuestbookNote(text);
          inputCustom.value = '';
        });
        inputCustom.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            btnSubmitCustom.click();
          }
        });
      }
    }

    // UI에 현재 남겨둔 쪽지 반영
    this.refreshJuncheolDeskNoteDisplay();

    // 기본 둘러보기 탭으로 오픈
    this.switchJuncheolDeskTab('inspect');

    modal.classList.remove('hidden');

    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }
  }

  closeJuncheolDeskModal() {
    const modal = document.getElementById('modal-juncheol-desk');
    if (modal) modal.classList.add('hidden');
  }

  switchJuncheolDeskTab(tab) {
    const viewInspect = document.getElementById('juncheol-desk-view-inspect');
    const viewGuestbook = document.getElementById('juncheol-desk-view-guestbook');
    const tabInspect = document.getElementById('btn-tab-juncheol-inspect');
    const tabGuestbook = document.getElementById('btn-tab-juncheol-guestbook');

    if (tab === 'guestbook') {
      if (viewInspect) viewInspect.style.display = 'none';
      if (viewGuestbook) viewGuestbook.style.display = 'block';

      if (tabGuestbook) {
        tabGuestbook.style.background = 'linear-gradient(135deg, #b45309, #d97706)';
        tabGuestbook.style.color = '#ffffff';
        tabGuestbook.style.borderColor = '#f59e0b';
      }
      if (tabInspect) {
        tabInspect.style.background = '#1e293b';
        tabInspect.style.color = '#94a3b8';
        tabInspect.style.borderColor = '#475569';
      }
    } else {
      if (viewInspect) viewInspect.style.display = 'block';
      if (viewGuestbook) viewGuestbook.style.display = 'none';

      if (tabInspect) {
        tabInspect.style.background = 'linear-gradient(135deg, #b45309, #d97706)';
        tabInspect.style.color = '#ffffff';
        tabInspect.style.borderColor = '#f59e0b';
      }
      if (tabGuestbook) {
        tabGuestbook.style.background = '#1e293b';
        tabGuestbook.style.color = '#94a3b8';
        tabGuestbook.style.borderColor = '#475569';
      }
    }

    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }
  }

  refreshJuncheolDeskNoteDisplay() {
    const studentId = (this.playerData && this.playerData.studentId) || 'default';
    let currentNote = (this.playerData && this.playerData.juncheolGuestbookNote) || '';
    if (!currentNote && studentId) {
      try {
        currentNote = localStorage.getItem('soongsil_juncheol_guestbook_' + studentId) || '';
      } catch (e) {}
    }

    const inspectContainer = document.getElementById('juncheol-inspect-current-note-container');
    const inspectText = document.getElementById('juncheol-inspect-current-note-text');
    const guestbookText = document.getElementById('juncheol-guestbook-my-note-text');

    if (currentNote) {
      if (inspectContainer) inspectContainer.style.display = 'block';
      if (inspectText) inspectText.innerText = '"' + currentNote + '"';
      if (guestbookText) guestbookText.innerText = '"' + currentNote + '"';
    } else {
      if (inspectContainer) inspectContainer.style.display = 'none';
      if (guestbookText) guestbookText.innerText = '아직 남긴 쪽지가 없습니다. 아래에서 쪽지를 골라보세요!';
    }
  }

  saveJuncheolGuestbookNote(noteText) {
    if (!this.playerData) return;
    const cleanNote = (noteText || '').trim();
    if (!cleanNote) return;

    const studentId = this.playerData.studentId || 'default';
    this.playerData.juncheolGuestbookNote = cleanNote;

    try {
      localStorage.setItem('soongsil_juncheol_guestbook_' + studentId, cleanNote);
    } catch (e) {}

    this.saveProgress();
    this.refreshJuncheolDeskNoteDisplay();

    if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
      window.AudioManager.playFanfare();
    } else if (window.AudioManager && typeof window.AudioManager.playCollect === 'function') {
      window.AudioManager.playCollect();
    }

    this.showToast('💖 갓준철 선생님 책상에 [' + cleanNote + '] 쪽지를 살포시 붙였습니다!', 'success');
  }

// 📜 진로실 떨어진 개발자노트 이스터에그 (제2편)
  handleDevNote2Interaction() {
    const studentId = (this.playerData && this.playerData.studentId) || 'default';
    const noteKey = 'soongsil_dev_note_2_' + studentId;
    let alreadyRead = false;
    try {
      alreadyRead = !!(studentId && localStorage.getItem(noteKey) === 'true');
    } catch (e) {}

    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }

    const noteStory =
      "📜 [떨어진 개발자노트 — 제2편: 저마다의 별을 향하여]\n\n" +
      "\"새벽 3시의 교정. 교실 창밖으로 고요한 별빛들이 쏟아지고 있었다.\n" +
      "진로실의 텅 빈 의자들을 바라보며, 문득 우리 아이들의 꿈을 떠올렸다.\n\n" +
      "의사, 과학자, 공학자, 디자이너, 멘토...\n" +
      "너희가 꿈꾸는 미래의 모습은 저마다 다르겠지만, 그 어떤 꿈도 결코 작거나 가볍지 않단다.\n\n" +
      "비록 지금은 서툴고 실수를 하더라도 괜찮아.\n" +
      "이곳에서의 모험이 언젠가 너희가 마주할 진짜 세상에서 가장 든든한 날개가 되어줄 테니까.\n\n" +
      "너희의 찬란한 모든 꿈을 온 마음으로 응원한다.\n\n" +
      "— 진로실 밤하늘을 올려다보며, 개발자 갓준철 올림 —\"";

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
        "🎁 [개발자노트 제2편 감상 보너스]\n" +
        "• 갓준철 선생님의 따뜻한 응원이 가슴을 뭉클하게 채웁니다!\n" +
        "• 🪙 골드 +50G 획득!\n" +
        "• 🌟 경험치 +50 EXP 획득!"
      );
    } else {
      alert(noteStory);
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


// =========================================================================
  // 🧭 PROGRESSION ROADMAP MODAL (진행 매뉴얼)
  // =========================================================================
  openRoadmapModal() {
    const modal = document.getElementById('modal-roadmap');
    if (!modal) return;
    modal.classList.remove('hidden');

    this.currentRoadmapStep = this.currentRoadmapStep || 1;
    this.showRoadmapStep(this.currentRoadmapStep);

    if (!this._roadmapModalInitialized) {
      this._roadmapModalInitialized = true;
      const btnCloseX = document.getElementById('btn-close-roadmap-x');
      if (btnCloseX) btnCloseX.addEventListener('click', () => modal.classList.add('hidden'));
      const btnClose = document.getElementById('btn-close-roadmap');
      if (btnClose) btnClose.addEventListener('click', () => modal.classList.add('hidden'));

      // Next / Prev button listeners
      const btnPrev = document.getElementById('btn-roadmap-prev');
      const btnNext = document.getElementById('btn-roadmap-next');
      if (btnPrev) {
        btnPrev.addEventListener('click', () => {
          if (this.currentRoadmapStep > 1) {
            this.showRoadmapStep(this.currentRoadmapStep - 1);
          }
        });
      }
      if (btnNext) {
        btnNext.addEventListener('click', () => {
          if (this.currentRoadmapStep < 5) {
            this.showRoadmapStep(this.currentRoadmapStep + 1);
          } else {
            modal.classList.add('hidden');
          }
        });
      }

      // Step pills click
      document.querySelectorAll('.roadmap-step-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          const step = parseInt(pill.dataset.step) || 1;
          this.showRoadmapStep(step);
        });
      });

      // Flow arrows click
      document.querySelectorAll('.roadmap-arrow-click').forEach(arrow => {
        arrow.addEventListener('click', () => {
          const targetStep = parseInt(arrow.dataset.target) || 1;
          this.showRoadmapStep(targetStep);
        });
      });
    }
  }

  showRoadmapStep(step) {
    this.currentRoadmapStep = Math.max(1, Math.min(5, step));

    // Toggle card visibility
    for (let i = 1; i <= 5; i++) {
      const card = document.getElementById('roadmap-card-' + i);
      if (card) {
        card.style.display = (i === this.currentRoadmapStep) ? 'block' : 'none';
      }
    }

    // Update step indicator
    const indicator = document.getElementById('roadmap-step-indicator');
    if (indicator) {
      indicator.innerText = `STEP ${this.currentRoadmapStep} / 5`;
    }

    // Update Prev / Next buttons
    const btnPrev = document.getElementById('btn-roadmap-prev');
    const btnNext = document.getElementById('btn-roadmap-next');
    if (btnPrev) {
      btnPrev.style.visibility = (this.currentRoadmapStep === 1) ? 'hidden' : 'visible';
    }
    if (btnNext) {
      btnNext.innerHTML = (this.currentRoadmapStep === 5) ? '확인 완료 ➔' : '다음 단계 ▶';
      btnNext.style.background = (this.currentRoadmapStep === 5) ? '#15803d' : '#0284c7';
      btnNext.style.borderColor = (this.currentRoadmapStep === 5) ? '#166534' : '#0369a1';
    }

    // Update top flow pills & arrows styling
    const pillColors = {
      1: '#0284c7',
      2: '#be185d',
      3: '#4338ca',
      4: '#15803d',
      5: '#d97706'
    };

    document.querySelectorAll('.roadmap-step-pill').forEach(pill => {
      const pStep = parseInt(pill.dataset.step) || 1;
      const isActive = (pStep === this.currentRoadmapStep);
      const isPast = (pStep < this.currentRoadmapStep);
      
      pill.style.background = isActive ? (pillColors[pStep] || '#0284c7') : (isPast ? '#334155' : '#1e293b');
      pill.style.borderColor = isActive ? '#38bdf8' : (isPast ? '#64748b' : '#334155');
      pill.style.color = isActive ? '#ffffff' : (isPast ? '#94a3b8' : '#64748b');
      pill.style.transform = isActive ? 'scale(1.05)' : 'scale(1.0)';
      pill.style.boxShadow = isActive ? '0 0 8px rgba(56, 189, 248, 0.4)' : 'none';
    });

    document.querySelectorAll('.roadmap-arrow-click').forEach(arrow => {
      const aTarget = parseInt(arrow.dataset.target) || 1;
      const isHighlighted = (aTarget <= this.currentRoadmapStep);
      arrow.style.color = isHighlighted ? '#38bdf8' : '#475569';
    });
  }

  // =========================================================================
  // 📖 ITEM CODEX MODAL (아이템 도감)
  // =========================================================================
  openCodexModal() {
    const modal = document.getElementById('modal-codex');
    if (!modal) return;

    this.currentCodexTab = this.currentCodexTab || 'all';
    this.renderCodexItems();
    modal.classList.remove('hidden');

    if (!this._codexModalInitialized) {
      this._codexModalInitialized = true;
      const btnCloseX = document.getElementById('btn-close-codex-x');
      if (btnCloseX) btnCloseX.addEventListener('click', () => modal.classList.add('hidden'));
      const btnClose = document.getElementById('btn-close-codex');
      if (btnClose) btnClose.addEventListener('click', () => modal.classList.add('hidden'));

      const tabContainer = document.getElementById('codex-tab-container');
      if (tabContainer) {
        tabContainer.querySelectorAll('.codex-tab-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            tabContainer.querySelectorAll('.codex-tab-btn').forEach(b => {
              b.classList.remove('active');
            });
            btn.classList.add('active');
            this.currentCodexTab = btn.dataset.tab;
            this.renderCodexItems();
          });
        });
      }
    }
  }

  renderCodexItems() {
    const grid = document.getElementById('grid-codex-items');
    if (!grid) return;
    grid.innerHTML = '';

    const db = window.ITEM_CODEX_DATABASE || [];
    const inv = (this.playerData && this.playerData.inventory) ? this.playerData.inventory : [];
    const equip = (this.playerData && this.playerData.equipment) ? this.playerData.equipment : {};

    const checkInInv = (itemId) => {
      if (Array.isArray(inv)) {
        return inv.some(i => i && (i.item === itemId || i.id === itemId) && i.count > 0);
      }
      return !!(inv[itemId] && inv[itemId].count > 0);
    };
    const checkIsEquipped = (itemId) => {
      return Object.values(equip).some(eq => eq && (eq.item === itemId || eq.id === itemId));
    };

    // Count collected items
    let collectedCount = 0;
    db.forEach(item => {
      const inInv = checkInInv(item.id);
      const isEquipped = checkIsEquipped(item.id);
      if (inInv || isEquipped) collectedCount++;
    });

    const pct = db.length > 0 ? Math.round((collectedCount / db.length) * 100) : 0;
    const countEl = document.getElementById('codex-collect-count');
    const fillEl = document.getElementById('codex-progress-fill');
    const pctEl = document.getElementById('codex-percent-text');
    if (countEl) countEl.innerText = `${collectedCount} / ${db.length}종`;
    if (fillEl) fillEl.style.width = `${pct}%`;
    if (pctEl) pctEl.innerText = `${pct}%`;

    // Filter by tab (전체 / 무기·방어구 / 신발 / 장신구 / 재료 / 소비품)
    const tab = this.currentCodexTab || 'all';
    let filtered = db;
    if (tab === 'all') {
      filtered = db;
    } else if (tab === 'weapon_armor') {
      filtered = db.filter(item => item.category === 'weapon_armor' || item.subCategory === 'weapon_armor' || (item.category === 'equip' && !item.id.includes('shoes') && !item.id.includes('boots') && !item.id.includes('ring') && !item.id.includes('talisman') && !item.id.includes('pass')));
    } else if (tab === 'shoes') {
      filtered = db.filter(item => item.category === 'shoes' || item.subCategory === 'shoes' || item.id.includes('shoes') || item.id.includes('boots'));
      const shoeOrder = ['equip_shoes_samdidas', 'equip_leather_shoes', 'equip_bronze_shoes', 'equip_heritage_boots'];
      filtered.sort((a, b) => {
        const idxA = shoeOrder.indexOf(a.id);
        const idxB = shoeOrder.indexOf(b.id);
        return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
      });
    } else if (tab === 'accessory') {
      filtered = db.filter(item => item.category === 'accessory' || item.subCategory === 'accessory' || item.id.includes('ring') || item.id.includes('talisman') || item.id.includes('pass'));
    } else if (tab === 'equip') {
      filtered = db.filter(item => item.category === 'equip' || ['weapon_armor', 'shoes', 'accessory'].includes(item.category));
    } else if (tab === 'material') {
      filtered = db.filter(item => item.category === 'material');
    } else if (tab === 'consumable') {
      filtered = db.filter(item => item.category === 'consumable');
    } else {
      filtered = db.filter(item => item.category === tab);
    }

    filtered.forEach(item => {
      const inInv = checkInInv(item.id);
      const isEquipped = checkIsEquipped(item.id);
      const isOwned = inInv || isEquipped;

      const card = document.createElement('div');
      card.style.cssText = `
        background: ${isOwned ? '#ffffff' : '#f1f5f9'};
        border: 2px solid ${isOwned ? '#22c55e' : '#cbd5e1'};
        border-radius: 10px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: ${isOwned ? '0 4px 6px -1px rgba(16, 185, 129, 0.1)' : 'none'};
        opacity: ${isOwned ? '1.0' : '0.82'};
        position: relative;
      `;

      const isCourage = (item.id === 'item_courage_potion');
      const isOrange = (item.id === 'item_orange_potion');
      const isRed = (item.id === 'item_red_potion');
      const isGreen = (item.id === 'item_green_potion');
      let iconDisplay = item.icon;
      if (isCourage) {
        iconDisplay = `<span class="icon-purple-potion">${item.icon}</span>`;
      } else if (isOrange) {
        iconDisplay = `<span class="icon-orange-potion">${item.icon}</span>`;
      } else if (isRed) {
        iconDisplay = `<span class="icon-red-potion">${item.icon}</span>`;
      } else if (isGreen) {
        iconDisplay = `<span class="icon-green-potion">${item.icon}</span>`;
      }

      card.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <div style="font-size: 28px; line-height: 1;">${iconDisplay}</div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 3px;">
              <span style="font-size: 10px; font-weight: 800; background: ${item.tierColor}15; color: ${item.tierColor}; border: 1px solid ${item.tierColor}40; border-radius: 4px; padding: 1px 5px;">
                ${item.tierBadge}
              </span>
              <span style="font-size: 10px; font-weight: 800; color: ${isOwned ? '#16a34a' : '#64748b'};">
                ${isOwned ? '✅ 보유 중' : '🔒 미보유'}
              </span>
            </div>
          </div>

          <div style="font-size: 13.5px; font-weight: 900; color: ${isOwned ? '#0f172a' : '#475569'}; margin-bottom: 4px;">
            ${item.name}
          </div>

          <div style="font-size: 11px; font-weight: 800; color: #0284c7; background: #e0f2fe; padding: 4px 6px; border-radius: 5px; margin-bottom: 6px;">
            ⚡ ${item.effect}
          </div>

          <div style="font-size: 11px; color: #334155; line-height: 1.4; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; margin-bottom: 4px;">
            <div style="font-weight: 800; color: #475569; margin-bottom: 2px;">📍 획득 경로:</div>
            <div>${item.source}</div>
          </div>
        </div>

        ${item.recipe ? `
        <div style="font-size: 10.5px; color: #64748b; text-align: right; margin-top: 4px;">
          제작: <span style="font-weight: 700; color: #0f172a;">${item.recipe}</span>
        </div>` : ''}
      `;

      grid.appendChild(card);
    });
  }

  // =========================================================================
  // 🔒 교사 전용 서버 개방/차단 게이트 시스템 (Server Gate System)
  // =========================================================================
  handleTeacherToggleServer() {
    if (this.isServerOpen) {
      const confirmClose = confirm("🔴 정말로 서버를 닫고 수업을 종료하시겠습니까?\n\n• 현재 접속 중인 모든 학생의 경험치/아이템/진행도가 안전하게 저장됩니다.\n• 학생들은 대기 화면으로 이동되며 추가 입장이 차단됩니다.\n• 교사는 계속 서버에 남아 맵 점검 및 수업 준비를 진행할 수 있습니다.");
      if (confirmClose) {
        this.networkManager.toggleServerState(false);
      }
    } else {
      const confirmOpen = confirm("🟢 서버를 개방하고 수업을 시작하시겠습니까?\n\n• 대기 중인 모든 학생이 즉시 입장할 수 있게 됩니다.");
      if (confirmOpen) {
        this.networkManager.toggleServerState(true);
      }
    }
  }

  updateServerGateUI() {
    // 1. Update Login Modal Server Box & Badge
    const box = document.getElementById('login-server-box');
    const dot = document.getElementById('login-server-dot');
    const title = document.getElementById('login-server-title');
    const badge = document.getElementById('login-server-badge');
    const alertBox = document.getElementById('login-server-closed-alert');

    if (!this.isServerOnline) {
      if (box) {
        box.style.borderColor = '#ef4444';
        box.style.background = 'rgba(239, 68, 68, 0.1)';
      }
      if (dot) {
        dot.style.background = '#ef4444';
        dot.style.boxShadow = '0 0 8px #ef4444';
      }
      if (title) {
        title.innerText = '🌱 1학년 서버 (오프라인)';
        title.style.color = '#f87171';
      }
      if (badge) {
        badge.innerText = '접속 불가';
        badge.style.color = '#ef4444';
        badge.style.background = 'rgba(239, 68, 68, 0.2)';
        badge.style.borderColor = '#ef4444';
      }
      if (alertBox) alertBox.classList.add('hidden');
    } else if (!this.isServerOpen) {
      if (box) {
        box.style.borderColor = '#ef4444';
        box.style.background = 'rgba(239, 68, 68, 0.12)';
      }
      if (dot) {
        dot.style.background = '#ef4444';
        dot.style.boxShadow = '0 0 8px #ef4444';
      }
      if (title) {
        title.innerText = '🔒 1학년 서버 (수업 대기 중)';
        title.style.color = '#f87171';
      }
      if (badge) {
        badge.innerText = '서버 닫힘 🔴';
        badge.style.color = '#ef4444';
        badge.style.background = 'rgba(239, 68, 68, 0.2)';
        badge.style.borderColor = '#ef4444';
      }
      if (alertBox) alertBox.classList.remove('hidden');
    } else {
      if (box) {
        box.style.borderColor = '#22c55e';
        box.style.background = 'rgba(34, 197, 94, 0.1)';
      }
      if (dot) {
        dot.style.background = '#22c55e';
        dot.style.boxShadow = '0 0 8px #22c55e';
      }
      if (title) {
        title.innerText = '🌱 1학년 서버 (1~6단원)';
        title.style.color = '#4ade80';
      }
      if (badge) {
        badge.innerText = '접속 가능 🟢';
        badge.style.color = '#22c55e';
        badge.style.background = 'rgba(34, 197, 94, 0.2)';
        badge.style.borderColor = '#22c55e';
      }
      if (alertBox) alertBox.classList.add('hidden');
    }

    // 2. Update Teacher Modal Controller Bar & HUD Button
    const teacherBadge = document.getElementById('teacher-server-gate-badge');
    const teacherBtn = document.getElementById('btn-teacher-toggle-server');
    const hudBtn = document.getElementById('btn-teacher-hud-server-toggle');

    if (this.isServerOpen) {
      if (teacherBadge) {
        teacherBadge.innerText = '🟢 서버 정상 개방 중';
        teacherBadge.style.background = 'rgba(34, 197, 94, 0.2)';
        teacherBadge.style.borderColor = '#22c55e';
        teacherBadge.style.color = '#4ade80';
      }
      if (teacherBtn) {
        teacherBtn.innerText = '🔴 서버 닫기 (수업 종료)';
        teacherBtn.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
        teacherBtn.style.borderColor = '#f87171';
      }
      if (hudBtn) {
        hudBtn.innerText = '🟢 서버 열림';
        hudBtn.style.background = '#15803d';
        hudBtn.style.borderColor = '#4ade80';
      }
    } else {
      if (teacherBadge) {
        teacherBadge.innerText = '🔴 서버 닫힘 (교사 전용)';
        teacherBadge.style.background = 'rgba(239, 68, 68, 0.2)';
        teacherBadge.style.borderColor = '#ef4444';
        teacherBadge.style.color = '#f87171';
      }
      if (teacherBtn) {
        teacherBtn.innerText = '🟢 서버 열기 (수업 시작)';
        teacherBtn.style.background = 'linear-gradient(135deg, #15803d, #16a34a)';
        teacherBtn.style.borderColor = '#86efac';
      }
      if (hudBtn) {
        hudBtn.innerText = '🔴 서버 닫힘';
        hudBtn.style.background = '#991b1b';
        hudBtn.style.borderColor = '#f87171';
      }
    }
  }

  onServerStateSync(data) {
    if (!data) return;
    this.isServerOpen = !!data.isOpen;
    if (data.closedMessage) this.serverClosedMessage = data.closedMessage;
    this.updateServerGateUI();
  }

  onServerStateChanged(data) {
    if (!data) return;
    this.isServerOpen = !!data.isOpen;
    if (data.closedMessage) this.serverClosedMessage = data.closedMessage;
    this.updateServerGateUI();
    const text = data.isOpen ? '🟢 선생님께서 서버를 개방했습니다! (수업 시작)' : '🔴 선생님께서 서버를 닫았습니다. (수업 종료/점검)';
    if (this.showToast) {
      this.showToast(text, data.isOpen ? 'success' : 'warning');
    }
  }

  onServerEntryRejected(data) {
    const msg = (data && data.message) ? data.message : '현재 서버가 닫혀 있습니다.';
    alert('🔒 [서버 닫힘 안내]\n\n' + msg);
    if (this.modalLogin) this.modalLogin.classList.remove('hidden');
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.innerText = '숭실 오픈월드 입장하기 🚀';
    }
  }

  onForceSaveAndExit(data) {
    this.saveProgress();
    const msg = (data && data.message) ? data.message : '선생님께서 수업을 종료하여 서버를 닫았습니다.\n모든 진행 상황이 안전하게 저장되었습니다.';
    alert('📢 [수업 종료 안내]\n\n' + msg);
    window.location.reload();
  }

  // =========================================================================
  // 🏛️ 6층 교무실 교사 퀘스트 시스템 & 의뢰서 모달 메서드
  // =========================================================================
  getTeacherQuestStatus(id) {
    let questId = id;
    if (id === 'npc_teacher_joshua') questId = 'quest_joshua_intro';
    if (id === 'npc_teacher_okchohan') questId = 'quest_okchohan_social';
    if (id === 'npc_teacher_kimmijin') questId = 'quest_kimmijin_art';
    if (id === 'npc_teacher_yosunyu') questId = 'quest_yosunyu_info';
    if (id === 'npc_teacher_kwimjinsyong') questId = 'quest_kwimjinsyong_career';
    if (id === 'npc_librarian') questId = 'quest_library_missing_books';
    if (!QUEST_DEFINITIONS[questId]) {
      const found = Object.values(QUEST_DEFINITIONS).find(q => q.teacherId === id);
      if (found) questId = found.id;
    }
    const qDef = QUEST_DEFINITIONS[questId];
    if (!qDef) return null;

    if (!this.playerData.quests) this.playerData.quests = {};
    const quest = this.playerData.quests[questId];

    if (!quest) {
      const pLevel = (this.playerData && this.playerData.level) || 1;
      const minLevel = qDef.minLevel || 1;
      if (pLevel < minLevel) return 'locked';
      return 'available';
    }
    if (quest.status === 'done') return 'done';
    if (quest.status === 'completed') return 'completed';
    if (quest.status === 'in_progress') {
      const allDone = qDef.objectives.every(obj => obj.getCount(quest) >= obj.targetCount);
      if (allDone) {
        return 'completed';
      }
      return 'in_progress';
    }
    return 'available';
  }

  isQuestSocialBookCollected() {
    if (!this.playerData || !this.playerData.quests) return false;
    const q = this.playerData.quests['quest_okchohan_social'];
    if (!q) return false;
    return !!q.textbookCollected;
  }

  isQuestUsbCollected() {
    if (!this.playerData || !this.playerData.quests) return false;
    const q = this.playerData.quests['quest_yosunyu_info'];
    if (!q) return false;
    return !!q.usbCollected;
  }

  isQuestCareerBookCollected() {
    if (!this.playerData || !this.playerData.quests) return false;
    const q = this.playerData.quests['quest_kwimjinsyong_career'];
    if (!q) return false;
    return !!q.guidebookCollected;
  }

  handleQuestCareerBookPickup(itemData) {
    if (!this.playerData.quests) this.playerData.quests = {};
    const quest = this.playerData.quests['quest_kwimjinsyong_career'];
    if (!quest || quest.status !== 'in_progress') {
      const msg = '📘 [진로상담실 책상에 놓인 진로 적성 검사 안내서]\n\n"귐즨숑 선생님의 진로 적성 검사 안내서 같습니다."';
      if (window.RPGDialog) {
        window.RPGDialog.show('📘 진로 적성 검사 안내서', msg, '📘');
      } else {
        alert(msg);
      }
      return;
    }

    if (quest.guidebookCollected) {
      this.showToast('이미 진로 적성 검사 안내서를 회수했습니다.', 'info');
      return;
    }

    quest.guidebookCollected = true;
    this.addItem('item_career_guidebook', '진로 적성 검사 안내서', 1, '📘', {
      type: 'quest',
      effect: '24번 좌석 진로 귐즨숑 선생님의 진로 적성 검사 안내서'
    });
    this.saveProgress();
    this.updateQuestTracker();

    if (window.AudioManager && typeof window.AudioManager.playCollect === 'function') {
      window.AudioManager.playCollect();
    }

    this.showToast('📘 5층 1:1 상담실 1 구석에서 [진로 적성 검사 안내서]를 회수했습니다!', 'success');

    if (quest.studentComforted) {
      setTimeout(() => {
        if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
          window.AudioManager.playFanfare();
        }
        this.showToast('🎉 [귐즨숑 선생님의 진로 의뢰] 모든 목표 달성! 귐즨숑 선생님께 돌아가 의뢰를 완료하세요!', 'success');
      }, 500);
    }
  }

  handleWorriedStudentInteraction(npc) {
    const quest = (this.playerData && this.playerData.quests) ? this.playerData.quests['quest_kwimjinsyong_career'] : null;

    // Case 1: Quest is in progress and player has the guidebook
    if (quest && quest.status === 'in_progress' && quest.guidebookCollected && !quest.studentComforted) {
      const emotionalDialog = `"어...? 귐즨숑 선생님께서 나를 위해 이런 편지를...?!\n\n『누구나 처음부터 완벽한 길을 알 수는 없단다. 작은 호기심과 좋아하는 일부터 시작하면 그것이 너만의 멋진 길이 되는 거야. 선생님은 언제나 너의 가능성을 믿는단다.』\n\n...정말 고마워! 나만 뒤처진 것 같아 두려웠는데 큰 용기가 생겼어. 나도 용기를 내서 진로상담실에 가볼게!"`;

      if (window.RPGDialog) {
        window.RPGDialog.show('진로를 고민하는 학생', emotionalDialog, '✨');
      } else {
        alert(`💬 [진로를 고민하는 학생]\n\n${emotionalDialog}`);
      }

      quest.studentComforted = true;
      this.removeItem('item_career_guidebook', 1);
      this.saveProgress();
      this.updateQuestTracker();

      if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
        window.AudioManager.playFanfare();
      }

      setTimeout(() => {
        this.showToast('🎉 [진로를 고민하는 학생]에게 격려 편지와 안내서를 전달했습니다! 귐즨숑 선생님께 보고하세요!', 'success');
      }, 600);
      return;
    }

    // Case 2: Quest is in progress but hasn't collected guidebook yet
    if (quest && quest.status === 'in_progress' && !quest.guidebookCollected) {
      const text = `"하아... 다들 자기가 하고 싶은 게 뚜렷한 것 같은데... 난 내가 뭘 잘하는지, 앞으로 뭐가 되고 싶은지 정말 모르겠어... 😔\n\n(💡 5층 진로상담실 책상에서 [진로 적성 검사 안내서]를 먼저 회수해야 귐즨숑 선생님의 격려 편지와 함께 전달할 수 있습니다.)"`;
      if (window.RPGDialog) {
        window.RPGDialog.show('진로를 고민하는 학생', text, '😔');
      } else {
        alert(`💬 [진로를 고민하는 학생]\n\n${text}`);
      }
      return;
    }

    // Case 3: Already comforted or quest done
    if (quest && (quest.studentComforted || quest.status === 'done' || quest.status === 'completed')) {
      const text = `"귐즨숑 선생님의 편지 덕분에 큰 용기가 생겼어! 나도 용기를 내서 5층 진로상담실에 가볼 생각이야. 전해줘서 정말 고마워 친구야! 😊"`;
      if (window.RPGDialog) {
        window.RPGDialog.show('진로를 고민하는 학생', text, '😊');
      } else {
        alert(`💬 [진로를 고민하는 학생]\n\n${text}`);
      }
      return;
    }

    // Case 4: Default dialogue (quest not yet started)
    if (window.RPGDialog) {
      window.RPGDialog.show('진로를 고민하는 학생', npc.dialogue, '😔');
    } else {
      alert(`💬 [${npc.name}]\n\n"${npc.dialogue}"`);
    }
  }

  onComputerServerInspected() {
    if (!this.playerData || !this.playerData.quests) return;
    const quest = this.playerData.quests['quest_yosunyu_info'];
    if (!quest || quest.status !== 'in_progress') return;

    if (!quest.serverInspected) {
      quest.serverInspected = true;
      this.saveProgress();
      this.updateQuestTracker();
      this.showToast('💻 [요션유 선생님의 정보 과제] 1학년 3반 컴퓨터실 메인 서버 점검 완료! (1/1)', 'info');

      if (quest.usbCollected) {
        setTimeout(() => {
          if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
            window.AudioManager.playFanfare();
          }
          this.showToast('🎉 [요션유 선생님의 정보 과제] 모든 목표 달성! 요션유 선생님께 돌아가 의뢰를 완료하세요!', 'success');
        }, 500);
      }
    }
  }

  handleQuestUsbPickup(itemData) {
    if (!this.playerData.quests) this.playerData.quests = {};
    const quest = this.playerData.quests['quest_yosunyu_info'];
    if (!quest || quest.status !== 'in_progress') {
      const msg = '💾 [소회의실 대형 테이블에 놓인 고속 알고리즘 USB]\n\n"요션유 선생님의 파이썬 코딩 강의 자료가 담긴 USB 같습니다."';
      if (window.RPGDialog) {
        window.RPGDialog.show('💾 알고리즘 USB', msg, '💾');
      } else {
        alert(msg);
      }
      return;
    }

    if (quest.usbCollected) {
      this.showToast('이미 알고리즘 USB를 회수했습니다.', 'info');
      return;
    }

    quest.usbCollected = true;
    this.addItem('item_yosunyu_usb', '요션유의 알고리즘 USB', 1, '💾', {
      type: 'quest',
      effect: '정보 요션유 선생님의 파이썬 코딩과 알고리즘 강의 자료가 담긴 고속 USB'
    });
    this.saveProgress();
    this.updateQuestTracker();

    if (window.AudioManager && typeof window.AudioManager.playCollect === 'function') {
      window.AudioManager.playCollect();
    }

    this.showToast('💾 1-2교실 구석에서 [요션유의 알고리즘 USB]를 회수했습니다!', 'success');

    if (quest.serverInspected) {
      setTimeout(() => {
        if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
          window.AudioManager.playFanfare();
        }
        this.showToast('🎉 [요션유 선생님의 정보 과제] 모든 목표 달성! 요션유 선생님께 돌아가 의뢰를 완료하세요!', 'success');
      }, 500);
    }
  }

  isQuestSketchbookCollected() {
    if (!this.playerData || !this.playerData.quests) return false;
    const q = this.playerData.quests['quest_kimmijin_art'];
    if (!q) return false;
    return !!q.sketchbookCollected;
  }

  isQuestMemoCollected() {
    if (!this.playerData || !this.playerData.quests) return false;
    const q = this.playerData.quests['quest_joshua_intro'];
    if (!q) return false;
    return !!q.memoCollected;
  }

  openQuestDispatchModal(questId) {
    const qDef = QUEST_DEFINITIONS[questId] || QUEST_DEFINITIONS['quest_joshua_intro'];
    if (!qDef) return;

    const modal = document.getElementById('modal-quest-dispatch');
    if (!modal) return;

    const status = this.getTeacherQuestStatus(qDef.id);
    const quest = (this.playerData && this.playerData.quests) ? this.playerData.quests[qDef.id] : null;

    // Teacher Profile
    const avatarEl = document.getElementById('quest-teacher-avatar');
    if (avatarEl) avatarEl.innerText = qDef.teacherAvatar || '👨‍🏫';

    const roleEl = document.getElementById('quest-teacher-role');
    if (roleEl) roleEl.innerText = qDef.teacherRole || '교사';

    const seatEl = document.getElementById('quest-teacher-seat');
    if (seatEl) {
      const seat = qDef.teacherSeat || '';
      seatEl.innerText = seat ? (seat.endsWith('번') ? `${seat} 좌석` : `${seat}번 좌석`) : '';
    }

    const nameEl = document.getElementById('quest-teacher-name');
    if (nameEl) nameEl.innerText = qDef.teacherName;

    // Status Badge
    const badgeEl = document.getElementById('quest-status-badge');
    if (badgeEl) {
      if (status === 'locked') {
        badgeEl.style.background = '#fee2e2';
        badgeEl.style.color = '#dc2626';
        badgeEl.style.borderColor = '#f87171';
        badgeEl.innerText = '🔒 최소 Lv.' + (qDef.minLevel || 1) + ' 달성 필요';
      } else if (status === 'available') {
        badgeEl.style.background = '#fef08a';
        badgeEl.style.color = '#854d0e';
        badgeEl.style.borderColor = '#eab308';
        badgeEl.innerText = '⭐ 의뢰 가능';
      } else if (status === 'in_progress') {
        badgeEl.style.background = '#e2e8f0';
        badgeEl.style.color = '#334155';
        badgeEl.style.borderColor = '#94a3b8';
        badgeEl.innerText = '⏳ 진행 중';
      } else if (status === 'completed') {
        badgeEl.style.background = '#dcfce7';
        badgeEl.style.color = '#15803d';
        badgeEl.style.borderColor = '#22c55e';
        badgeEl.innerText = '🎉 의뢰 완수 (보고 가능)';
      } else if (status === 'done') {
        badgeEl.style.background = '#f1f5f9';
        badgeEl.style.color = '#64748b';
        badgeEl.style.borderColor = '#cbd5e1';
        badgeEl.innerText = '✅ 완료된 의뢰';
      }
    }

    // Quest Title
    const titleEl = document.getElementById('quest-modal-title');
    if (titleEl) titleEl.innerText = qDef.title;

    // Story Text
    const storyEl = document.getElementById('quest-modal-story');
    if (storyEl) {
      if (status === 'locked') {
        const pLevel = (this.playerData && this.playerData.level) || 1;
        storyEl.innerText = `반갑다! ${qDef.teacherName}이란다. 😊\n\n하지만 이 과제는 어느 정도 학교 생활과 모험에 익숙해진 학생에게 맡기고 싶단다.\n먼저 학교 곳곳을 모험하며 레벨 Lv.${qDef.minLevel} 이상을 달성한 뒤에 다시 나를 찾아와 주렴!\n\n(현재 나의 레벨: Lv.${pLevel} / 필요 레벨: Lv.${qDef.minLevel})`;
      } else if (status === 'available') storyEl.innerText = qDef.story;
      else if (status === 'in_progress') storyEl.innerText = qDef.inProgressStory;
      else if (status === 'completed') storyEl.innerText = qDef.completeStory;
      else if (status === 'done') storyEl.innerText = qDef.doneStory;
    }

    // Objectives List
    const objContainer = document.getElementById('quest-objectives-container');
    if (objContainer) {
      objContainer.innerHTML = '';
      qDef.objectives.forEach(obj => {
        const cur = obj.getCount(quest);
        const isDone = (status === 'done') || (cur >= obj.targetCount);
        const card = document.createElement('div');
        card.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 12px;
          border-radius: 8px;
          background: ${isDone ? '#f0fdf4' : '#fffbeb'};
          border: 1.5px solid ${isDone ? '#86efac' : '#fcd34d'};
          font-size: 13px;
        `;
        card.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">${isDone ? '✅' : '📌'}</span>
            <span style="font-weight: 700; color: ${isDone ? '#166534' : '#78350f'};">${obj.text}</span>
          </div>
          <div style="font-weight: 800; font-size: 12px; color: ${isDone ? '#15803d' : '#b45309'}; background: ${isDone ? '#dcfce7' : '#fef3c7'}; border: 1px solid ${isDone ? '#22c55e' : '#f59e0b'}; padding: 2px 8px; border-radius: 6px; white-space: nowrap;">
            ${isDone ? '완료' : `${cur.toLocaleString()} / ${obj.targetCount.toLocaleString()}${obj.unit || ''}`}
          </div>
        `;
        objContainer.appendChild(card);
      });
    }

    // Rewards List
    const rewContainer = document.getElementById('quest-rewards-container');
    if (rewContainer) {
      rewContainer.innerHTML = '';
      qDef.rewards.forEach(r => {
        const pill = document.createElement('div');
        pill.style.cssText = `
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #ffffff;
          border: 1.5px solid #f59e0b;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
          color: #78350f;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        `;
        pill.innerText = r.label;
        rewContainer.appendChild(pill);
      });
    }

    // Actions Buttons
    const actContainer = document.getElementById('quest-actions-container');
    if (actContainer) {
      actContainer.innerHTML = '';

      if (status === 'locked') {
        const pLevel = (this.playerData && this.playerData.level) || 1;
        const btnLocked = document.createElement('button');
        btnLocked.disabled = true;
        btnLocked.style.cssText = 'padding: 8px 20px; font-size: 13px; font-weight: 800; background: #64748b; color: #cbd5e1; border: 1.5px solid #475569; border-radius: 8px; cursor: not-allowed;';
        btnLocked.innerText = `🔒 Lv.${qDef.minLevel} 달성 후 수락 가능 (현재 Lv.${pLevel})`;
        actContainer.appendChild(btnLocked);

        const btnClose = document.createElement('button');
        btnClose.className = 'btn-secondary';
        btnClose.style.cssText = 'padding: 8px 18px; font-size: 13px; border-radius: 8px; cursor: pointer;';
        btnClose.innerText = '닫기';
        btnClose.addEventListener('click', () => this.closeQuestDispatchModal());
        actContainer.appendChild(btnClose);

      } else if (status === 'available') {
        const btnReject = document.createElement('button');
        btnReject.className = 'btn-secondary';
        btnReject.style.cssText = 'padding: 8px 18px; font-size: 13px; border-radius: 8px; cursor: pointer;';
        btnReject.innerText = '❌ 나중에 하기';
        btnReject.addEventListener('click', () => this.closeQuestDispatchModal());
        actContainer.appendChild(btnReject);

        const btnAccept = document.createElement('button');
        btnAccept.className = 'btn-primary';
        btnAccept.style.cssText = 'padding: 8px 22px; font-size: 13.5px; font-weight: 900; background: linear-gradient(135deg, #15803d, #16a34a); border: 2px solid #86efac; color: #fff; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3);';
        btnAccept.innerText = '📜 의뢰 수락하기 (Accept)';
        btnAccept.addEventListener('click', () => this.acceptQuest(qDef.id));
        actContainer.appendChild(btnAccept);

      } else if (status === 'in_progress') {
        const btnClose = document.createElement('button');
        btnClose.className = 'btn-primary';
        btnClose.style.cssText = 'padding: 8px 22px; font-size: 13.5px; font-weight: 900; background: linear-gradient(135deg, #0369a1, #0284c7); border: 2px solid #7dd3fc; color: #fff; border-radius: 8px; cursor: pointer;';
        btnClose.innerText = '🧭 1-1 교실과 탕비실 계속 탐색하기 (닫기)';
        btnClose.addEventListener('click', () => this.closeQuestDispatchModal());
        actContainer.appendChild(btnClose);

      } else if (status === 'completed') {
        const btnTurnIn = document.createElement('button');
        btnTurnIn.className = 'btn-primary';
        btnTurnIn.style.cssText = 'padding: 10px 24px; font-size: 14px; font-weight: 900; background: linear-gradient(135deg, #16a34a, #22c55e); border: 2px solid #bbf7d0; color: #fff; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.45); animation: pulse 1.5s infinite;';
        btnTurnIn.innerText = '🎁 의뢰 완료 보고 & 특별 보상 수령하기!';
        btnTurnIn.addEventListener('click', () => this.completeQuest(qDef.id));
        actContainer.appendChild(btnTurnIn);

      } else if (status === 'done') {
        const btnDone = document.createElement('button');
        btnDone.className = 'btn-secondary';
        btnDone.style.cssText = 'padding: 8px 20px; font-size: 13px; border-radius: 8px; cursor: pointer;';
        btnDone.innerText = '확인 (닫기)';
        btnDone.addEventListener('click', () => this.closeQuestDispatchModal());
        actContainer.appendChild(btnDone);
      }
    }

    modal.classList.remove('hidden');

    if (!this._questDispatchModalInitialized) {
      this._questDispatchModalInitialized = true;
      const btnCloseX = document.getElementById('btn-close-quest-dispatch-x');
      if (btnCloseX) btnCloseX.addEventListener('click', () => this.closeQuestDispatchModal());
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeQuestDispatchModal();
      });
    }

    if (window.AudioManager && typeof window.AudioManager.playSelect === 'function') {
      window.AudioManager.playSelect();
    }
  }

  closeQuestDispatchModal() {
    const modal = document.getElementById('modal-quest-dispatch');
    if (modal) modal.classList.add('hidden');
  }

  acceptQuest(questId) {
    const qDef = (typeof QUEST_DEFINITIONS !== 'undefined') ? QUEST_DEFINITIONS[questId] : null;
    if (qDef && qDef.minLevel) {
      const pLevel = (this.playerData && this.playerData.level) || 1;
      if (pLevel < qDef.minLevel) {
        if (window.AudioManager && window.AudioManager.playDeny) window.AudioManager.playDeny();
        this.showToast(`🔒 최소 레벨 Lv.${qDef.minLevel} 이상 필요합니다! (현재: Lv.${pLevel})`, 'warning');
        return;
      }
    }
    if (!this.playerData.quests) this.playerData.quests = {};
    this.playerData.quests[questId] = {
      status: 'in_progress',
      quizCount: 0,
      memoCollected: false,
      textbookCollected: false,
      acidRainScore: 0,
      sketchbookCollected: false,
      jumpSuccess: false,
      serverInspected: false,
      usbCollected: false,
      guidebookCollected: false,
      studentComforted: false,
      acceptedAt: Date.now()
    };
    this.saveProgress();
    this.updateQuestTracker();
    this.closeQuestDispatchModal();

    if (window.AudioManager && typeof window.AudioManager.playCollect === 'function') {
      window.AudioManager.playCollect();
    }

    if (questId === 'quest_joshua_intro') {
      this.showToast('📜 [Joshua 선생님의 특별 지령] 수락 완료! 1-1 교실 교탁(영어 퀴즈 2회)과 6층 탕비실(단어 메모)을 조사하세요.', 'success');
    } else if (questId === 'quest_okchohan_social') {
      this.showToast('📜 [옥촣한 선생님의 사회 과제] 수락 완료! 1-3 컴퓨터실(산성비 1,000점)과 교무실 인쇄실(사회 교재)을 확인하세요.', 'success');
    } else if (questId === 'quest_kimmijin_art') {
      this.showToast('🎨 [김진믜 선생님의 미술 프로젝트] 수락 완료! 운동장 스탠드 파란 벤치(스케치북)와 개나리 꽃잎(3송이)을 모아오세요.', 'success');
    } else if (questId === 'quest_yosunyu_info') {
      this.showToast('💻 [요션유 선생님의 정보 과제] 수락 완료! 1-3 컴퓨터실(메인 서버 점검)과 1-2 교실 구석(알고리즘 USB)을 확인하세요.', 'success');
    } else if (questId === 'quest_kwimjinsyong_career') {
      this.showToast('🌟 [귐즨숑 선생님의 진로 의뢰] 수락 완료! 5층 진로상담실(안내서 회수) 후 6층 창가의 학생에게 전달하세요.', 'success');
    } else if (questId === 'quest_library_missing_books') {
      this.showToast('📚 [사서 선생님의 의뢰] 수락 완료! 운동장 스탠드, 교무실, 역사관의 분실도서 3권을 찾아오세요.', 'success');
    } else {
      this.showToast(`📜 [${(qDef && qDef.title) ? qDef.title : '의뢰'}] 수락 완료!`, 'success');
    }
  }

  completeQuest(questId) {
    const qDef = QUEST_DEFINITIONS[questId];
    if (!qDef) return;
    const quest = this.playerData.quests && this.playerData.quests[questId];
    if (!quest || (quest.status !== 'in_progress' && quest.status !== 'completed')) return;

    const allDone = qDef.objectives.every(obj => obj.getCount(quest) >= obj.targetCount);
    if (!allDone) {
      this.showToast('⚠️ 아직 의뢰 목표를 모두 달성하지 못했습니다!', 'warning');
      return;
    }

    quest.status = 'done';
    quest.completedAt = Date.now();

    // Grant configured rewards
    if (Array.isArray(qDef.rewards)) {
      qDef.rewards.forEach(r => {
        if (r.type === 'gold') this.addGold(r.amount);
        else if (r.type === 'exp') this.addExp(r.amount);
        else if (r.type === 'item') {
          this.addItem(r.itemKey, r.itemName, r.count || 1, r.icon || '📦', r.meta || { type: 'material' });
        }
      });
    }

    // Cleanup turn-in quest items
    if (qDef.cleanupItem) {
      this.removeItem(qDef.cleanupItem, 1);
    } else if (questId === 'quest_joshua_intro') {
      this.removeItem('item_joshua_memo', 1);
    } else if (questId === 'quest_library_missing_books') {
      this.removeItem('item_lib_book_pg', 1);
      this.removeItem('item_lib_book_of', 1);
      this.removeItem('item_lib_book_hi', 1);
      this.showToast('📚 [도서관 의뢰 완료] 분실도서 3권을 모두 반납하고 보상을 획득했습니다!', 'success');
    }

    this.recalcCombatStats();
    this.updatePlayerNameDisplay();

    this.saveProgress();
    this.updateQuestTracker();
    this.closeQuestDispatchModal();

    if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
      window.AudioManager.playFanfare();
    }
    this.showToast(`🎉 [${qDef.title}] 완료! 특별 보상을 획득했습니다!`, 'success');
  }

  handleQuestSocialBookPickup(itemData) {
    if (!this.playerData.quests) this.playerData.quests = {};
    const quest = this.playerData.quests['quest_okchohan_social'];
    if (!quest || quest.status !== 'in_progress') {
      const msg = '📘 [바닥에 놓인 사회 탐구 교재]\n\n"옥촣한 선생님의 사회 탐구 교재 같습니다."';
      if (window.RPGDialog) {
        window.RPGDialog.show('📘 사회 탐구 교재', msg, '📘');
      } else {
        alert(msg);
      }
      return;
    }

    if (quest.textbookCollected) {
      this.showToast('이미 사회 교재를 회수했습니다.', 'info');
      return;
    }

    quest.textbookCollected = true;
    this.addItem('item_okchohan_textbook', '옥촣한의 사회 탐구 교재', 1, '📘', {
      type: 'quest',
      effect: '사회 옥촣한 선생님의 핵심 사회 탐구 수업 교재'
    });
    this.saveProgress();
    this.updateQuestTracker();

    if (window.AudioManager && typeof window.AudioManager.playCollect === 'function') {
      window.AudioManager.playCollect();
    }

    this.showToast('📘 교무실 인쇄실 근처에서 [옥촣한의 사회 탐구 교재]를 회수했습니다!', 'success');

    if ((quest.acidRainScore || 0) >= 1000) {
      setTimeout(() => {
        if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
          window.AudioManager.playFanfare();
        }
        this.showToast('🎉 [옥촣한 선생님의 사회 과제] 모든 목표 달성! 옥촣한 선생님께 돌아가 의뢰를 완료하세요!', 'success');
      }, 500);
    }
  }

  handleQuestSketchbookPickup(itemData) {
    if (!this.playerData.quests) this.playerData.quests = {};
    const quest = this.playerData.quests['quest_kimmijin_art'];
    if (!quest || quest.status !== 'in_progress') {
      const msg = '🎨 [운동장 스탠드 파란색 벤치에 놓인 풍경화 스케치북]\n\n"김진믜 선생님의 풍경화 스케치북 같습니다."';
      if (window.RPGDialog) {
        window.RPGDialog.show('🎨 풍경화 스케치북', msg, '🎨');
      } else {
        alert(msg);
      }
      return;
    }

    if (quest.sketchbookCollected) {
      this.showToast('이미 스케치북을 회수했습니다.', 'info');
      return;
    }

    quest.sketchbookCollected = true;
    this.addItem('item_kimmijin_sketchbook', '김진믜의 풍경화 스케치북', 1, '🎨', {
      type: 'quest',
      effect: '미술 김진믜 선생님의 섬세한 풍경화 스케치북'
    });
    this.saveProgress();
    this.updateQuestTracker();

    if (window.AudioManager && typeof window.AudioManager.playCollect === 'function') {
      window.AudioManager.playCollect();
    }

    this.showToast('🎨 운동장 스탠드 파란색 벤치에서 [김진믜의 풍경화 스케치북]을 회수했습니다!', 'success');

    const curFlowers = (this.getItemCount('item_forsythia') || 0);
    if (curFlowers >= 3) {
      setTimeout(() => {
        if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
          window.AudioManager.playFanfare();
        }
        this.showToast('🎉 [김진믜 선생님의 미술 프로젝트] 모든 목표 달성! 김진믜 선생님께 돌아가 의뢰를 완료하세요!', 'success');
      }, 500);
    }
  }

  handleQuestMemoPickup(itemData) {
    if (!this.playerData.quests) this.playerData.quests = {};
    const quest = this.playerData.quests['quest_joshua_intro'];
    if (!quest || quest.status !== 'in_progress') {
      const msg = '📝 [바닥에 떨어진 영단어 메모]\n\n"Joshua 선생님의 핵심 영단어 시험 필기 메모 같습니다."';
      if (window.RPGDialog) {
        window.RPGDialog.show('📝 영단어 메모', msg, '📝');
      } else {
        alert(msg);
      }
      return;
    }

    if (quest.memoCollected) {
      this.showToast('이미 단어 메모를 회수했습니다.', 'info');
      return;
    }

    quest.memoCollected = true;
    this.addItem('item_joshua_memo', 'Joshua의 단어 메모', 1, '📝', {
      type: 'quest',
      effect: 'Joshua 선생님이 탕비실에 떨어뜨린 3학년 영어 핵심 단어장 메모'
    });
    this.saveProgress();
    this.updateQuestTracker();

    if (window.AudioManager && typeof window.AudioManager.playCollect === 'function') {
      window.AudioManager.playCollect();
    }

    this.showToast('📝 탕비실 구석에서 [Joshua의 단어 메모]를 회수했습니다!', 'success');

    if ((quest.quizCount || 0) >= 2) {
      setTimeout(() => {
        if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
          window.AudioManager.playFanfare();
        }
        this.showToast('🎉 [Joshua의 특별 지령] 모든 목표 달성! 6층 교무실 Joshua 선생님께 돌아가 의뢰를 완료하세요!', 'success');
      }, 500);
    }
  }

  onQuizSolved(sourceType, room) {
    if (!this.playerData || !this.playerData.quests) return;

    // 1. Joshua 퀘스트 진행도 체크 (1-1 교실)
    const questJoshua = this.playerData.quests['quest_joshua_intro'];
    if (questJoshua && questJoshua.status === 'in_progress' && room === 'room_701') {
      const prevCount = questJoshua.quizCount || 0;
      if (prevCount < 2) {
        questJoshua.quizCount = prevCount + 1;
        this.saveProgress();
        this.updateQuestTracker();
        this.showToast(`📜 [Joshua의 특별 지령] 1학년 1반 영어 퀴즈 완수! (${questJoshua.quizCount}/2)`, 'info');

        if (questJoshua.quizCount >= 2 && questJoshua.memoCollected) {
          setTimeout(() => {
            if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
              window.AudioManager.playFanfare();
            }
            this.showToast('🎉 [Joshua의 특별 지령] 모든 목표 달성! 6층 교무실 Joshua 선생님께 돌아가 의뢰를 완료하세요!', 'success');
          }, 600);
        }
      }
    }
  }

  onAcidRainScore(score) {
    if (!this.playerData || !this.playerData.quests) return;
    const quest = this.playerData.quests['quest_okchohan_social'];
    if (!quest || quest.status !== 'in_progress') return;

    const prevScore = quest.acidRainScore || 0;
    if (score > prevScore) {
      quest.acidRainScore = score;
      this.saveProgress();
      this.updateQuestTracker();

      if (score >= 1000 && prevScore < 1000) {
        if (window.AudioManager && typeof window.AudioManager.playFanfare === 'function') {
          window.AudioManager.playFanfare();
        }
        this.showToast(`🎉 [옥촣한 선생님의 사회 과제] 산성비 타자 ${score.toLocaleString()}점 달성! (1,000점 돌파!)`, 'success');

        if (quest.textbookCollected) {
          setTimeout(() => {
            this.showToast('🎉 [옥촣한 선생님의 사회 과제] 모든 목표 달성! 옥촣한 선생님께 돌아가 의뢰를 완료하세요!', 'success');
          }, 600);
        }
      }
    }
  }

  // =========================================================================
  // 📜 TOP-LEFT FLOATING QUEST TRACKER HUD
  // =========================================================================
  initQuestTracker() {
    const trackerEl = document.getElementById('quest-tracker-hud');
    if (!trackerEl) return;

    const header = document.getElementById('quest-tracker-header');
    const toggleBtn = document.getElementById('btn-toggle-quest-tracker');
    if (header) {
      header.addEventListener('click', (e) => {
        trackerEl.classList.toggle('collapsed');
        if (toggleBtn) {
          toggleBtn.innerText = trackerEl.classList.contains('collapsed') ? '▲' : '▼';
        }
      });
    }

    const body = document.getElementById('quest-tracker-body');
    if (body) {
      body.addEventListener('click', () => {
        const active = this.getActiveQuest();
        if (active) {
          this.openQuestDispatchModal(active.id);
        }
      });
    }

    this.updateQuestTracker();
  }

  getActiveQuest() {
    if (!this.playerData || !this.playerData.quests) return null;
    for (const qId of Object.keys(this.playerData.quests)) {
      const q = this.playerData.quests[qId];
      if (q && (q.status === 'in_progress' || q.status === 'completed')) {
        const qDef = QUEST_DEFINITIONS[qId];
        if (qDef) return { id: qId, def: qDef, data: q };
      }
    }
    return null;
  }

  updateQuestTracker() {
    const trackerEl = document.getElementById('quest-tracker-hud');
    if (!trackerEl) return;

    const active = this.getActiveQuest();
    if (!active) {
      trackerEl.classList.add('hidden');
      return;
    }

    const { id, def, data } = active;
    trackerEl.classList.remove('hidden');

    // Check completion of all objectives
    let allDone = true;
    for (const obj of def.objectives) {
      const cur = obj.getCount ? obj.getCount(data) : 0;
      if (cur < obj.targetCount) {
        allDone = false;
        break;
      }
    }

    if (allDone && data.status === 'in_progress') {
      data.status = 'completed';
    }

    // Badge
    const badgeEl = document.getElementById('quest-tracker-badge');
    if (badgeEl) {
      if (allDone) {
        badgeEl.innerText = '완수 가능! 🎁';
        badgeEl.className = 'quest-tracker-badge completed';
      } else {
        badgeEl.innerText = '진행 중';
        badgeEl.className = 'quest-tracker-badge in-progress';
      }
    }

    // Quest Name
    const nameEl = document.getElementById('quest-tracker-quest-name');
    if (nameEl) nameEl.innerText = def.title;

    // Meta (Teacher Role & Seat)
    const metaEl = document.getElementById('quest-tracker-meta');
    if (metaEl) {
      const seatText = def.teacherSeat ? (def.teacherSeat.endsWith('번') ? `${def.teacherSeat} 좌석` : `${def.teacherSeat}번 좌석`) : '';
      metaEl.innerText = `의뢰인: ${def.teacherName}${seatText ? ` (${seatText})` : ''}`;
    }

    // Objectives List
    const objListEl = document.getElementById('quest-tracker-objectives');
    if (objListEl) {
      objListEl.innerHTML = '';
      def.objectives.forEach(obj => {
        const cur = obj.getCount ? obj.getCount(data) : 0;
        const isDone = cur >= obj.targetCount;
        const row = document.createElement('div');
        row.className = `quest-tracker-obj-item ${isDone ? 'done' : ''}`;
        row.innerHTML = `
          <div style="display:flex; align-items:center; gap:6px; overflow:hidden;">
            <span style="font-size:11px;">${isDone ? '✅' : '📌'}</span>
            <span style="font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:165px; font-weight:${isDone ? '700' : '500'};">${obj.text}</span>
          </div>
          <span style="font-size:10px; font-weight:800; padding:1px 5px; border-radius:4px; margin-left:4px; white-space:nowrap; ${isDone ? 'background:#dcfce7; color:#15803d;' : 'background:#fef3c7; color:#b45309;'}">
            ${isDone ? '완료' : `${cur}/${obj.targetCount}`}
          </span>
        `;
        objListEl.appendChild(row);
      });
    }

    // Hint
    const hintEl = document.getElementById('quest-tracker-hint');
    if (hintEl) {
      if (allDone) {
        hintEl.innerHTML = `🎁 <b>모든 목표 완수!</b> 6층 교무실 <b>${def.teacherName}</b>께 돌아가 보상을 받으세요!`;
        hintEl.style.background = 'rgba(22, 101, 52, 0.25)';
        hintEl.style.borderColor = 'rgba(34, 197, 94, 0.4)';
        hintEl.style.color = '#bbf7d0';
      } else {
        hintEl.innerHTML = `💡 1-1 교실 교탁과 6층 탕비실 안쪽을 조사하세요.`;
        hintEl.style.background = 'rgba(245, 158, 11, 0.12)';
        hintEl.style.borderColor = 'rgba(245, 158, 11, 0.25)';
        hintEl.style.color = '#fbbf24';
      }
    }
  }

// =========================================================================
  // 🕰️ 야외 스탠드 [2004년 선배들의 비밀 타임캡슐] 4단계 추리 퀘스트 시스템
  // =========================================================================

  handleCapsuleClue(clueData) {
    if (!clueData) return;
    const clueIndex = clueData.clueIndex || 1;

    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }

    if (!this.playerData.timeCapsuleClues) {
      this.playerData.timeCapsuleClues = [false, false, false, false];
    }
    const isFirstFind = !this.playerData.timeCapsuleClues[clueIndex - 1];
    this.playerData.timeCapsuleClues[clueIndex - 1] = true;
    this.saveProgress();

    const CLUE_STORIES = [
      {
        title: '📜 [단서 1] 찢어진 스탠드 쪽지 (서쪽 축구 골대 뷰)',
        icon: '⚽',
        text: '우리가 구령대 앞 결승전에서 마지막 휘슬이 울릴 때까지 온 힘을 다해 몰아쳤던 그날!\n전광판에 새겨진 우리 숭실의 최종 득점 수... 바로 그 승리의 골 수가 [첫 번째 비밀번호]다!\n\n(💡 힌트: 축구대회 결승전 3:1 역전승의 숭실 득점 수 ➔ 첫 번째 자리: 3)'
      },
      {
        title: '📜 [단서 2] 빛바랜 응원 일기 (중앙 시계탑 뷰)',
        icon: '📣',
        text: '체육대회 응원전 때 스탠드가 떠나가라 목청껏 교가를 부르며 단합했던 우리 반!\n담임선생님이 매점 아이스크림 30개를 쏘셨던 전설의 우리 학급 번호가 [두 번째 비밀번호]다!\n\n(💡 힌트: 타임캡슐 표시에 적힌 학급 ➔ 3학년 5반의 5 ➔ 두 번째 자리: 5)'
      },
      {
        title: '📜 [단서 3] 낡은 졸업 사진 쪽지 (나무 그늘 아래)',
        icon: '🎓',
        text: '우리가 스탠드에서 교복 단추를 던지며 눈물과 웃음으로 졸업했던 해, 2004년!\n4자리 연도에서 \'십의 자리\' 숫자가 [세 번째 비밀번호]다!\n\n(💡 힌트: 2004년의 십의 자리 ➔ 세 번째 자리: 0)'
      },
      {
        title: '📜 [단서 4] 약속의 맹세 쪽지 (언덕길 바람 통로)',
        icon: '🤝',
        text: '20년 뒤 어른이 되어 다시 이 언덕길 스탠드에서 만나자고 손가락 걸었던 그 약속!\n2004년 연도의 마지막 \'일의 자리\' 숫자가 [네 번째 비밀번호]다!\n\n(💡 힌트: 2004년의 일의 자리 ➔ 네 번째 자리: 4)'
      }
    ];

    const c = CLUE_STORIES[clueIndex - 1] || CLUE_STORIES[0];

    if (window.RPGDialog) {
      window.RPGDialog.show(c.title, c.text, c.icon);
    } else {
      alert(`[${c.title}]\n\n${c.text}`);
    }

    if (isFirstFind) {
      const foundCount = this.playerData.timeCapsuleClues.filter(Boolean).length;
      this.showToast(`💡 [타임캡슐 단서 ${foundCount}/4] 발견! (단서 수첩에 기록되었습니다)`, 'success');
    }
  }

  handleTimeCapsuleInteraction() {
    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }

    if (!this.playerData.timeCapsuleClues) {
      this.playerData.timeCapsuleClues = [false, false, false, false];
    }

    // 이미 타임캡슐을 열었다면 바로 개봉 편지 & 롤링페이퍼 모달 오픈
    if (this.playerData.hasOpenedTimeCapsule) {
      this.openTimeCapsuleOpenedModal();
      return;
    }

    // 아직 자물쇠를 풀지 않았다면 다이얼 자물쇠 모달 오픈
    this.openTimeCapsuleLockModal();
  }

  openTimeCapsuleLockModal() {
    const modal = document.getElementById('modal-time-capsule-lock');
    if (!modal) return;

    const clueBadges = [
      document.getElementById('capsule-clue-badge-1'),
      document.getElementById('capsule-clue-badge-2'),
      document.getElementById('capsule-clue-badge-3'),
      document.getElementById('capsule-clue-badge-4')
    ];

    const clueTexts = ['1번: 골 수 (3)', '2번: 학급 (5)', '3번: 십의자리 (0)', '4번: 일의자리 (4)'];
    clueBadges.forEach((b, idx) => {
      if (!b) return;
      const isFound = !!(this.playerData.timeCapsuleClues && this.playerData.timeCapsuleClues[idx]);
      if (isFound) {
        b.style.borderColor = '#10b981';
        b.style.background = 'rgba(16, 185, 129, 0.2)';
        b.style.color = '#34d399';
        b.innerHTML = '✅ ' + clueTexts[idx];
      } else {
        b.style.borderColor = '#475569';
        b.style.background = 'rgba(30, 41, 59, 0.5)';
        b.style.color = '#94a3b8';
        b.innerHTML = '🔒 단서 ' + (idx + 1) + '번 미발견';
      }
    });

    const dials = [0, 0, 0, 0];
    const dialEls = [
      document.getElementById('capsule-dial-1'),
      document.getElementById('capsule-dial-2'),
      document.getElementById('capsule-dial-3'),
      document.getElementById('capsule-dial-4')
    ];

    dialEls.forEach((el, idx) => {
      if (el) el.innerText = dials[idx];
    });

    const bindDialBtn = (btnId, dialIdx, delta) => {
      const btn = document.getElementById(btnId);
      if (btn && !btn._bound) {
        btn._bound = true;
        btn.addEventListener('click', () => {
          if (window.AudioManager && window.AudioManager.playSelect) window.AudioManager.playSelect();
          dials[dialIdx] = (dials[dialIdx] + delta + 10) % 10;
          if (dialEls[dialIdx]) dialEls[dialIdx].innerText = dials[dialIdx];
        });
      }
    };

    bindDialBtn('btn-capsule-up-1', 0, 1);
    bindDialBtn('btn-capsule-dn-1', 0, -1);
    bindDialBtn('btn-capsule-up-2', 1, 1);
    bindDialBtn('btn-capsule-dn-2', 1, -1);
    bindDialBtn('btn-capsule-up-3', 2, 1);
    bindDialBtn('btn-capsule-dn-3', 2, -1);
    bindDialBtn('btn-capsule-up-4', 3, 1);
    bindDialBtn('btn-capsule-dn-4', 3, -1);

    const btnCloseX = document.getElementById('btn-close-capsule-lock-x');
    if (btnCloseX && !btnCloseX._bound) {
      btnCloseX._bound = true;
      btnCloseX.addEventListener('click', () => modal.classList.add('hidden'));
    }

    const btnUnlock = document.getElementById('btn-capsule-unlock');
    if (btnUnlock && !btnUnlock._bound) {
      btnUnlock._bound = true;
      btnUnlock.addEventListener('click', () => {
        // 정답 비밀번호: 3 - 5 - 0 - 4
        if (dials[0] === 3 && dials[1] === 5 && dials[2] === 0 && dials[3] === 4) {
          modal.classList.add('hidden');
          if (!this.playerData.timeCapsuleUnlocked) {
            this.playerData.timeCapsuleUnlocked = true;
            this.playerData.hasOpenedTimeCapsule = true;
            this.saveProgress();
          }
          if (window.AudioManager && window.AudioManager.playFanfare) {
            window.AudioManager.playFanfare();
          }
          this.showToast('🎉 [2004년 타임캡슐] 해금 성공! 6층 교무실 교감선생님께 발굴 소식을 전하세요!', 'success');
          this.openTimeCapsuleOpenedModal(true);
        } else {
          if (window.AudioManager && window.AudioManager.playWrong) window.AudioManager.playWrong();
          const lockCard = modal.querySelector('.modal-card');
          if (lockCard) {
            lockCard.classList.add('shake-anim');
            setTimeout(() => lockCard.classList.remove('shake-anim'), 400);
          }
          this.showToast('⚠️ 자물쇠가 열리지 않습니다! 번호를 다시 확인해보세요. (힌트: 3-5-0-4)', 'error');
        }
      });
    }

    modal.classList.remove('hidden');
  }

  claimTimeCapsuleSuccess() {
    this.playerData.hasOpenedTimeCapsule = true;

    if (!this.playerData.titles) this.playerData.titles = [];
    const tId = 'title_time_connector';
    const tName = '🕰️ 시간을 잇는 자';
    if (!this.playerData.titles.includes(tId)) this.playerData.titles.push(tId);
    if (!this.playerData.titles.includes(tName)) this.playerData.titles.push(tName);

    // 유물 장비: 선배의 낡은 승리 완장 (장신구 / 공+3, 방+3)
    this.addItem('equip_vintage_armband', '선배의 낡은 승리 완장', 1, '🎗️', {
      type: 'equipment',
      slot: 'accessory',
      stats: { atk: 3, def: 3 },
      effect: '2004년 축구 우승 선배들의 땀과 혼이 깃든 완장 · 공격력 +3, 방어력 +3 (매각 불가)'
    });

    // 골드 & 경험치 보상
    this.addGold(100);
    this.addExp(100);
    this.saveProgress();

    if (typeof this.renderTitles === 'function') this.renderTitles();
    if (window.AudioManager && window.AudioManager.playFanfare) {
      window.AudioManager.playFanfare();
    }

    this.showToast('🎉 [2004년 타임캡슐] 해금 성공! [🕰️ 시간을 잇는 자] 칭호와 유물 완장을 획득했습니다!', 'success');
    this.openTimeCapsuleOpenedModal(true);
  }

  openTimeCapsuleOpenedModal(isJustUnlocked = false) {
    const modal = document.getElementById('modal-time-capsule-open');
    if (!modal) return;

    const btnCloseX = document.getElementById('btn-close-capsule-open-x');
    const btnCloseBottom = document.getElementById('btn-close-capsule-open-bottom');

    if (btnCloseX && !btnCloseX._bound) {
      btnCloseX._bound = true;
      btnCloseX.addEventListener('click', () => modal.classList.add('hidden'));
    }
    if (btnCloseBottom && !btnCloseBottom._bound) {
      btnCloseBottom._bound = true;
      btnCloseBottom.addEventListener('click', () => modal.classList.add('hidden'));
    }

    this.renderCapsuleGuestbook();

    const btnSubmit = document.getElementById('btn-submit-capsule-msg');
    const inputMsg = document.getElementById('input-capsule-msg');
    if (btnSubmit && !btnSubmit._bound) {
      btnSubmit._bound = true;
      btnSubmit.addEventListener('click', () => {
        const text = (inputMsg && inputMsg.value.trim()) || '';
        if (!text) {
          this.showToast('후배들에게 남길 메시지를 입력해주세요!', 'warning');
          return;
        }

        const authorName = (this.playerData && this.playerData.name) || '숭실 후배';
        let notes = [];
        try {
          notes = JSON.parse(localStorage.getItem('soongsil_capsule_notes') || '[]');
        } catch(e) {}

        notes.unshift({
          author: authorName,
          date: new Date().toLocaleDateString('ko-KR'),
          text: text
        });

        try {
          localStorage.setItem('soongsil_capsule_notes', JSON.stringify(notes.slice(0, 30)));
        } catch(e) {}

        if (inputMsg) inputMsg.value = '';
        if (window.AudioManager && window.AudioManager.playSelect) window.AudioManager.playSelect();
        this.showToast('💌 타임캡슐에 당신의 따뜻한 편지가 보관되었습니다!', 'success');
        this.renderCapsuleGuestbook();
      });
    }

    modal.classList.remove('hidden');
  }

  renderCapsuleGuestbook() {
    const listEl = document.getElementById('capsule-notes-list');
    if (!listEl) return;

    let notes = [];
    try {
      notes = JSON.parse(localStorage.getItem('soongsil_capsule_notes') || '[]');
    } catch(e) {}

    const defaultNotes = [
      { author: '2004년 3-5 반장 민호', date: '2004.10.15', text: '우리가 묻은 이 편지를 20년 뒤 누군가 읽는다면... 숭실의 교정은 여전히 푸르고 활기차겠지?' },
      { author: '2004년 3-5 등번호 10번 성진', date: '2004.10.15', text: '결승골 넣고 스탠드로 뛰어올라가 다 같이 얼싸안았던 순간을 평생 잊지 못할 거야. 후배들아 사랑한다!' },
      { author: '2004년 3-5 정훈', date: '2004.10.15', text: '선생님들 말씀 잘 듣고, 친구들이랑 좋은 추억 많이 만들어라 후배들아! 숭실 파이팅!' }
    ];

    const allNotes = [...notes, ...defaultNotes];
    listEl.innerHTML = '';

    allNotes.forEach(n => {
      const card = document.createElement('div');
      card.style.cssText = 'background: rgba(30, 41, 59, 0.7); border: 1px solid #3b82f6; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; text-align: left;';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-weight: 800; font-size: 13px; color: #93c5fd;">✉️ ${n.author}</span>
          <span style="font-size: 11px; color: #94a3b8;">${n.date}</span>
        </div>
        <div style="font-size: 13px; color: #f8fafc; line-height: 1.45;">${n.text}</div>
      `;
      listEl.appendChild(card);
    });
  }

  handleVicePrincipalInteraction(npc) {
    if (window.AudioManager && window.AudioManager.playSelect) {
      window.AudioManager.playSelect();
    }

    if (!this.playerData.timeCapsuleUnlocked && !this.playerData.hasOpenedTimeCapsule) {
      const introMsg = '허허, 어서 오렴! 숭실의 교감선생님이란다. 🏫\n\n운동장 야외 스탠드 관람석 틈새에 아주 오래전 선배들이 묻어둔 [비밀 타임캡슐]이 있다는 전설을 알고 있니?\n\n스탠드 주변에 흩어진 4개의 단서 쪽지를 찾아 자물쇠 비밀번호를 풀면 20년 전 우리 학교의 뜨거운 감동과 마주할 수 있을 거란다.\n\n캡슐의 자물쇠를 열게 되거든 꼭 내게 찾아와 그 소식을 전해주렴!';
      if (window.RPGDialog) {
        window.RPGDialog.show('🏫 교감선생님', introMsg, '👨‍🏫');
      } else {
        alert('💬 [교감선생님]\n\n' + introMsg);
      }
      return;
    }

    this.openVicePrincipalCapsuleModal();
  }

  openVicePrincipalCapsuleModal() {
    const modal = document.getElementById('modal-vice-principal-capsule');
    if (!modal) return;

    const isRewardClaimed = !!(this.playerData && this.playerData.timeCapsuleRewardClaimed);
    const isAcc2Unlocked = !!(this.playerData && this.playerData.isAccessory2Unlocked);

    const btnCloseX = document.getElementById('btn-close-vp-modal-x');
    const btnCloseBottom = document.getElementById('btn-close-vp-modal-bottom');

    if (btnCloseX && !btnCloseX._bound) {
      btnCloseX._bound = true;
      btnCloseX.addEventListener('click', () => modal.classList.add('hidden'));
    }
    if (btnCloseBottom && !btnCloseBottom._bound) {
      btnCloseBottom._bound = true;
      btnCloseBottom.addEventListener('click', () => modal.classList.add('hidden'));
    }

    const rewardSection = document.getElementById('vp-reward-action-section');
    const claimedSection = document.getElementById('vp-reward-claimed-section');

    if (rewardSection && claimedSection) {
      if (isRewardClaimed) {
        rewardSection.style.display = 'none';
        claimedSection.style.display = 'block';
      } else {
        rewardSection.style.display = 'block';
        claimedSection.style.display = 'none';
      }
    }

    this.updateVicePrincipalDialogue();
    this.renderVicePrincipalGuestbook();
    this.renderVicePrincipalVirtuesQuest();

    const btnSubmit = document.getElementById('btn-submit-vp-capsule');
    const inputMsg = document.getElementById('input-vp-capsule-msg');
    if (btnSubmit && !btnSubmit._bound) {
      btnSubmit._bound = true;
      btnSubmit.addEventListener('click', () => {
        const text = (inputMsg && inputMsg.value.trim()) || '';
        if (!text) {
          this.showToast('미래의 후배들에게 남길 따뜻한 한마디를 입력해주세요!', 'warning');
          return;
        }

        const authorName = (this.playerData && this.playerData.name) || '숭실 후배';
        let notes = [];
        try {
          notes = JSON.parse(localStorage.getItem('soongsil_capsule_notes') || '[]');
        } catch(e) {}

        notes.unshift({
          author: authorName,
          date: new Date().toLocaleDateString('ko-KR'),
          text: text
        });

        try {
          localStorage.setItem('soongsil_capsule_notes', JSON.stringify(notes.slice(0, 30)));
        } catch(e) {}

        if (inputMsg) inputMsg.value = '';

        // 최종 보상 지급
        this.claimTimeCapsuleFromVicePrincipal();
        this.renderVicePrincipalGuestbook();

        if (rewardSection && claimedSection) {
          rewardSection.style.display = 'none';
          claimedSection.style.display = 'block';
        }

        // 후속 퀘스트 (3대 덕목 검증) 렌더링 및 대화문 전환
        this.updateVicePrincipalDialogue();
        this.renderVicePrincipalVirtuesQuest();
        this.showToast('📜 [후속 퀘스트 오픈!] 교감선생님의 [숭실 3대 덕목 인증] 퀘스트가 해금되었습니다!', 'info');
      });
    }

    modal.classList.remove('hidden');
  }

  updateVicePrincipalDialogue() {
    const dialogueEl = document.getElementById('vp-dialogue-content');
    if (!dialogueEl) return;

    const isRewardClaimed = !!(this.playerData && this.playerData.timeCapsuleRewardClaimed);
    const isAcc2Unlocked = !!(this.playerData && this.playerData.isAccessory2Unlocked);

    if (isAcc2Unlocked) {
      dialogueEl.innerHTML = `
        <p style="margin: 0 0 10px 0; color: #a78bfa; font-weight: 700;">
          "허허, 어서 오게나! 지·덕·체(智·德·體)를 모두 완벽히 겸비한 우리 숭실의 진정한 모범 학생! 🌟"
        </p>
        <p style="margin: 0 0 10px 0;">
          2004년 선배들의 땀이 어린 승리 완장과 함께 자네가 보여준 체력, 품성, 지혜는 후배들에게도 크나큰 귀감이 될 걸세.
        </p>
        <p style="margin: 0;">
          두 개의 장신구를 당당히 착용하고, 숭실의 넓은 배움터를 종횡무진 활약하길 교감선생님이 언제나 힘차게 응원하마! 👍
        </p>
      `;
    } else if (isRewardClaimed) {
      dialogueEl.innerHTML = `
        <p style="margin: 0 0 10px 0; color: #c4b5fd; font-weight: 700;">
          "어서 오게나! 2004년 선배들의 뜻을 아름답게 이어받은 자랑스러운 학생이로군. 🏫"
        </p>
        <p style="margin: 0 0 10px 0;">
          방금 수여한 [선배의 낡은 승리 완장]은 숭실의 긍지가 담긴 귀한 유물 장신구란다.
          하지만 우리 학교에서는 <b>3대 덕목(지·덕·체)</b>을 몸소 증명하고 <b>레벨 10</b>에 도달한 모범 학생에게만 <b>[💍 장신구 2중 착용 자격]</b>을 정식으로 인가하고 있지!
        </p>
        <p style="margin: 0;">
          체력(언덕길 등교 챌린지), 품성(분리수거 상식), 지혜(도서관 & 역사관 열람)를 모두 증명하고 나의 역사 구술 시험에 통과해보렴. 자네의 도전을 기다리마!
        </p>
      `;
    } else {
      dialogueEl.innerHTML = `
        <p style="margin: 0 0 10px 0; color: #fef08a; font-weight: 700;">
          "오오, 자네가 운동장 스탠드 틈새의 그 타임캡슐을 풀고 편지를 찾아냈단 말인가! 정말 감격스럽구나...!"
        </p>
        <p style="margin: 0 0 10px 0;">
          2004년 그해 가을은 우리 숭실의 역사에 영원히 남을 눈부신 계절이었단다.
          교내 축구대회 결승전 날, 스탠드가 떠나가라 울려 퍼지던 전교생의 함성과 교가 소리... 3:1로 역전승을 거두고 마지막 휘슬이 울렸을 때, 아이들과 선생님들이 서로 얼싸안고 눈물을 흘렸지!
        </p>
        <p style="margin: 0;">
          졸업을 앞둔 3학년 5반 학생들이 자신들의 청춘과 승리의 기쁨, 그리고 주장의 승리 완장을 캡슐에 넣으며 <i>'20년 뒤 후배들아, 지치지 말고 힘차게 날아올라라!'</i>라고 다짐했던 그 순간이 지금도 눈앞에 선하구나.
          자네가 20년 만에 그 약속을 이어받았어. 정말 고맙고 자랑스럽구나!
        </p>
      `;
    }
  }

  claimTimeCapsuleFromVicePrincipal() {
    this.playerData.timeCapsuleRewardClaimed = true;

    if (!this.playerData.titles) this.playerData.titles = [];
    const tId = 'title_time_connector';
    const tName = '🕰️ 시간을 잇는 자';
    if (!this.playerData.titles.includes(tId)) this.playerData.titles.push(tId);
    if (!this.playerData.titles.includes(tName)) this.playerData.titles.push(tName);

    // 유물 장비: 선배의 낡은 승리 완장 (장신구 / 공격력 +3, 방어력 +3, 매각 불가)
    this.addItem('equip_vintage_armband', '선배의 낡은 승리 완장', 1, '🎗️', {
      type: 'equipment',
      slot: 'accessory',
      stats: { atk: 3, def: 3 },
      effect: '2004년 축구 우승 선배들의 땀과 혼이 깃든 완장 · 공격력 +3, 방어력 +3 (매각 불가)'
    });

    // 골드 & 경험치 보상
    this.addGold(100);
    this.addExp(100);
    this.saveProgress();

    if (typeof this.renderTitles === 'function') this.renderTitles();
    if (window.AudioManager && window.AudioManager.playFanfare) {
      window.AudioManager.playFanfare();
    }

    this.showToast('🎉 [타임캡슐 최종 완료] 교감선생님께 칭호 [🕰️ 시간을 잇는 자]와 선배의 낡은 승리 완장을 수령했습니다!', 'success');
  }

  renderVicePrincipalGuestbook() {
    const listEl = document.getElementById('vp-capsule-notes-list');
    if (!listEl) return;

    let notes = [];
    try {
      notes = JSON.parse(localStorage.getItem('soongsil_capsule_notes') || '[]');
    } catch(e) {}

    const defaultNotes = [
      { author: '2004년 3-5 반장 민호', date: '2004.10.15', text: '우리가 묻은 이 편지를 20년 뒤 누군가 읽는다면... 숭실의 교정은 여전히 푸르고 활기차겠지?' },
      { author: '2004년 3-5 등번호 10번 성진', date: '2004.10.15', text: '결승골 넣고 스탠드로 뛰어올라가 다 같이 얼싸안았던 순간을 평생 잊지 못할 거야. 후배들아 사랑한다!' },
      { author: '2004년 3-5 정훈', date: '2004.10.15', text: '선생님들 말씀 잘 듣고, 친구들이랑 좋은 추억 많이 만들어라 후배들아! 숭실 파이팅!' }
    ];

    const allNotes = [...notes, ...defaultNotes];
    listEl.innerHTML = '';

    allNotes.forEach(n => {
      const card = document.createElement('div');
      card.style.cssText = 'background: rgba(15, 23, 42, 0.7); border: 1px solid #3b82f6; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; text-align: left;';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-weight: 800; font-size: 13px; color: #93c5fd;">✉️ ${n.author}</span>
          <span style="font-size: 11px; color: #94a3b8;">${n.date}</span>
        </div>
        <div style="font-size: 13px; color: #f8fafc; line-height: 1.45;">${n.text}</div>
      `;
      listEl.appendChild(card);
    });
  }

  renderVicePrincipalVirtuesQuest() {
    const isTimeCapsuleClaimed = !!(this.playerData && this.playerData.timeCapsuleRewardClaimed);
    const section = document.getElementById('vp-virtues-quest-section');
    if (!section) return;

    if (!isTimeCapsuleClaimed) {
      section.style.display = 'none';
      return;
    }
    section.style.display = 'block';

    const pLevel = (this.playerData && this.playerData.level) || 1;
    const isLevel10 = pLevel >= 10;
    const isAcc2Unlocked = !!(this.playerData && this.playerData.isAccessory2Unlocked);

    const completedView = document.getElementById('vp-virtues-completed-view');
    const inProgressView = document.getElementById('vp-virtues-inprogress-view');

    if (isAcc2Unlocked) {
      if (completedView) completedView.style.display = 'block';
      if (inProgressView) inProgressView.style.display = 'none';
      return;
    }

    if (completedView) completedView.style.display = 'none';
    if (inProgressView) inProgressView.style.display = 'block';

    // Level badge
    const levelEl = document.getElementById('vp-virtues-level-badge');
    if (levelEl) {
      if (isLevel10) {
        levelEl.innerHTML = '✅ 레벨 조건 달성 (Lv.' + pLevel + ' / 최소 필요: Lv.10)';
        levelEl.style.borderColor = '#10b981';
        levelEl.style.color = '#34d399';
        levelEl.style.background = 'rgba(16, 185, 129, 0.15)';
      } else {
        levelEl.innerHTML = '🔒 레벨 부족 (Lv.' + pLevel + ' / 최소 필요: Lv.10)';
        levelEl.style.borderColor = '#ef4444';
        levelEl.style.color = '#f87171';
        levelEl.style.background = 'rgba(239, 68, 68, 0.15)';
      }
    }

    // 3대 덕목 상태 확인 (1차 퀘스트를 완료해야만 2차 퀘스트가 진행 및 인정됨)
    const isPhysiqueDone = Boolean(this.playerData.timeCapsuleRewardClaimed && this.playerData.virtuePhysiqueDone);
    const isVirtueDone = Boolean(this.playerData.timeCapsuleRewardClaimed && this.playerData.virtueMannerDone);
    const isWisdomDone = Boolean(
      this.playerData.timeCapsuleRewardClaimed &&
      (this.playerData.virtueWisdomDone || (this.playerData.virtueWisdomLibrary && this.playerData.virtueWisdomMuseum))
    );

    const badgePhysique = document.getElementById('vp-badge-physique');
    if (badgePhysique) {
      if (isPhysiqueDone) {
        badgePhysique.innerHTML = '✅ 완주 완료 (체력 증명)';
        badgePhysique.style.color = '#34d399';
        badgePhysique.style.borderColor = '#10b981';
        badgePhysique.style.background = 'rgba(16, 185, 129, 0.2)';
      } else {
        badgePhysique.innerHTML = '🔒 미완료 (정문 언덕길 챌린지)';
        badgePhysique.style.color = '#f87171';
        badgePhysique.style.borderColor = '#ef4444';
        badgePhysique.style.background = 'rgba(239, 68, 68, 0.15)';
      }
    }

    const badgeVirtue = document.getElementById('vp-badge-virtue');
    if (badgeVirtue) {
      if (isVirtueDone) {
        badgeVirtue.innerHTML = '✅ 통과 완료 (품성 증명)';
        badgeVirtue.style.color = '#34d399';
        badgeVirtue.style.borderColor = '#10b981';
        badgeVirtue.style.background = 'rgba(16, 185, 129, 0.2)';
      } else {
        badgeVirtue.innerHTML = '🔒 미완료 (6층 분리수거 퀴즈)';
        badgeVirtue.style.color = '#f87171';
        badgeVirtue.style.borderColor = '#ef4444';
        badgeVirtue.style.background = 'rgba(239, 68, 68, 0.15)';
      }
    }

    const badgeWisdom = document.getElementById('vp-badge-wisdom');
    if (badgeWisdom) {
      if (isWisdomDone) {
        badgeWisdom.innerHTML = '✅ 열람 완료 (지혜 증명)';
        badgeWisdom.style.color = '#34d399';
        badgeWisdom.style.borderColor = '#10b981';
        badgeWisdom.style.background = 'rgba(16, 185, 129, 0.2)';
      } else {
        badgeWisdom.innerHTML = '🔒 미완료 (도서관 & 역사관)';
        badgeWisdom.style.color = '#f87171';
        badgeWisdom.style.borderColor = '#ef4444';
        badgeWisdom.style.background = 'rgba(239, 68, 68, 0.15)';
      }
    }

    const allVirtuesDone = isLevel10 && isPhysiqueDone && isVirtueDone && isWisdomDone;

    const quizBox = document.getElementById('vp-virtues-quiz-box');
    const lockNotice = document.getElementById('vp-virtues-lock-notice');

    if (allVirtuesDone) {
      if (quizBox) quizBox.style.display = 'block';
      if (lockNotice) lockNotice.style.display = 'none';
    } else {
      if (quizBox) quizBox.style.display = 'none';
      if (lockNotice) {
        lockNotice.style.display = 'block';
        if (!isLevel10) {
          lockNotice.innerHTML = '⚠️ <b>최소 레벨 10 이상</b> 달성해야 교감선생님의 최종 역사 시험에 응시할 수 있습니다. (현재: Lv.' + pLevel + ')';
        } else {
          lockNotice.innerHTML = '⚠️ <b>[체(體) · 덕(德) · 지(智)]</b> 3대 덕목을 모두 완수하면 교감선생님의 역사 시험이 해금됩니다.';
        }
      }
    }

    // Bind Quiz submit button
    const btnSubmitQuiz = document.getElementById('btn-submit-vp-quiz');
    if (btnSubmitQuiz && !btnSubmitQuiz._bound) {
      btnSubmitQuiz._bound = true;
      btnSubmitQuiz.addEventListener('click', () => {
        if (!this.playerData || !this.playerData.timeCapsuleRewardClaimed) {
          this.showToast('1차 퀘스트(타임캡슐 롤링페이퍼 및 선배 완장 수령)를 먼저 완료해야 2차 퀘스트를 진행할 수 있습니다!', 'warning');
          return;
        }

        const q1Val = (document.querySelector('input[name="vp-q1"]:checked') || {}).value;
        const q2Val = (document.querySelector('input[name="vp-q2"]:checked') || {}).value;

        if (!q1Val || !q2Val) {
          this.showToast('1번과 2번 문제의 정답을 모두 선택해주세요!', 'warning');
          return;
        }

        // Q1 정답: 3번 (베어드 박사), Q2 정답: 2번 (진실을 숭상한다)
        // 두 문제 모두 정답이 1번이 아님!
        if (q1Val === '3' && q2Val === '2') {
          // 정답 통과!
          this.playerData.isAccessory2Unlocked = true;
          this.playerData.virtuesQuestCompleted = true;

          // [지·덕·체 모범생] 칭호 및 골드 보상은 요청에 따라 삭제 (EXP +300만 지급)

          this.addExp(300);
          this.saveProgress();

          if (typeof this.renderTitles === 'function') this.renderTitles();
          if (typeof this.renderInventory === 'function') this.renderInventory();
          if (window.AudioManager && window.AudioManager.playFanfare) {
            window.AudioManager.playFanfare();
          }

          this.showToast('🎉 [지·덕·체 인증 성공!] 💍 장신구 2 슬롯이 영구 해금되었습니다! (+300 EXP)', 'success');
          this.updateVicePrincipalDialogue();
          this.renderVicePrincipalVirtuesQuest();
        } else {
          if (window.AudioManager && window.AudioManager.playWrong) {
            window.AudioManager.playWrong();
          }
          let wrongMsg = '⚠️ 오답이 있습니다! 교감선생님의 질문과 도서관·역사관 자료를 다시 확인해보세요.\n\n';
          if (q1Val !== '3') wrongMsg += '• 1번 문제 (설립자) 오답\n';
          if (q2Val !== '2') wrongMsg += '• 2번 문제 (숭실의 의미) 오답\n';
          alert(wrongMsg);
        }
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  

  window.MainApp = new MainApp();
});


if (typeof window !== 'undefined') {
  window.MainAppClass = MainApp;
}
if (typeof globalThis !== 'undefined') {
  globalThis.MainApp = MainApp;
}
