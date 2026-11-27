// =========================================================================
// 📖 ITEM CODEX MASTER DATABASE (도감 및 획득처 사전)
// =========================================================================
var ITEM_CODEX_DATABASE = window.ITEM_CODEX_DATABASE = [
  // 1. Materials (재료 14종)
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
    source: '7층 1학년 1반 교실 동쪽 화분(실내 식물존) 1단원 퀴즈 정답 시 드랍',
    recipe: '7층 1-1 교실 화분 채집 파밍'
  },
  {
    id: 'item_forsythia',
    name: '노란 개나리 꽃잎',
    icon: '🌼',
    category: 'material',
    tierBadge: '교화 재료',
    tierColor: '#ca8a04',
    effect: '주홍 물약, 청동 장비, 성실의 개나리 반지 제작 재료',
    source: '7층 1학년 1반 교실 서쪽 개나리 화분 2단원 퀴즈 정답 시 드랍',
    recipe: '7층 1-1 교실 개나리 화분 채집 파밍'
  },
  {
    id: 'item_ginkgo',
    name: '황금 은행잎',
    icon: '🍂',
    category: 'material',
    tierBadge: '교목 재료',
    tierColor: '#d97706',
    effect: '부활 주문서 및 합심의 황금 은행잎 부적 제작 재료',
    source: '7층 1학년 1반 교실 중앙 교목 은행나무 3단원 퀴즈 정답 시 드랍',
    recipe: '7층 1-1 교실 은행나무 채집 파밍'
  },
  {
    id: 'item_boss_leather',
    name: '질긴 보스의 가죽',
    icon: '🥋',
    category: 'material',
    tierBadge: '보스 전리품',
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
    source: '운동장 청동 드래곤 레이드 / 6층 교무실 옥촣한 선생님 퀘스트',
    recipe: '보스 레이드 및 퀘스트 전리품'
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
    id: 'item_nutrition_essence',
    name: '정제된 영양의 정수',
    icon: '🍱',
    category: 'material',
    tierBadge: '야외 전리품',
    tierColor: '#059669',
    effect: '급식실 음식물 몬스터 전리품 · 5티어 최고급 장비 제작 필수 재료',
    source: '학생 급식실 바닥 음식물 몬스터 처치 시 획득',
    recipe: '급식실 몬스터 처치 전리품'
  },
  {
    id: 'item_stainless_shard',
    name: '특수 강화 스텐 조각',
    icon: '✨',
    category: 'material',
    tierBadge: '야외 전리품',
    tierColor: '#0284c7',
    effect: '급식실 음식물 몬스터 전리품 · 5티어 최고급 장비 제작 핵심 재료',
    source: '학생 급식실 바닥 음식물 몬스터 처치 시 드랍',
    recipe: '급식실 몬스터 전투 드랍'
  },
  {
    id: 'item_golden_laurel',
    name: '황금 월계수 잎',
    icon: '🏵️',
    category: 'material',
    tierBadge: '야외 전리품',
    tierColor: '#eab308',
    effect: '체육관 실내 농구장 몬스터 전리품 · [승리의 월계관 메달] 제작 핵심 재료',
    source: '체육관 실내 농구장 몬스터 처치 시 드랍',
    recipe: '체육관 실내 농구장 전투 드랍'
  },

  // 2. Consumables (소비품 10종 - craft_recipes.json 공식 레시피)
  {
    id: 'item_red_potion',
    name: '빨간 물약',
    icon: '🧪',
    category: 'consumable',
    tierBadge: '회복 물약',
    tierColor: '#e11d48',
    effect: '사용 시 체력(HP) +10 즉시 회복',
    source: '소비품 제작대(C) · 매점 구매(30G) · 역사관/급식실 드랍',
    recipe: '향긋한 허브 1개 + 5G'
  },
  {
    id: 'item_orange_potion',
    name: '주홍 물약',
    icon: '🧪',
    category: 'consumable',
    tierBadge: '중급 회복 물약',
    tierColor: '#ea580c',
    effect: '사용 시 체력(HP) +25 대폭 회복',
    source: '소비품 제작대(C, Lv.5+) · 매점 구매(80G, Lv.5+) · 역사관/급식실 드랍',
    recipe: '향긋한 허브 2개 + 노란 개나리 꽃잎 1개 + 10G'
  },
  {
    id: 'item_clear_potion',
    name: '맑은 물약',
    icon: '🧪',
    category: 'consumable',
    tierBadge: '고급 회복 물약',
    tierColor: '#06b6d4',
    effect: '사용 시 체력(HP) +40 대량 즉시 회복',
    source: '소비품 제작대(C, Lv.10+) · 매점 구매(150G, Lv.10+) · 급식실/체육관 드랍',
    recipe: '향긋한 허브 4개 + 노란 개나리 꽃잎 2개 + 30G'
  },
  {
    id: 'item_elixir',
    name: '엘릭서',
    icon: '⚗️',
    category: 'consumable',
    tierBadge: '최고급 회복 물약',
    tierColor: '#8b5cf6',
    effect: '사용 시 체력(HP) +80 초대량 즉시 회복',
    source: '소비품 제작대(C)에서 조제 (15레벨 이상)',
    recipe: '정제된 영양의 정수 1개 + 향긋한 허브 4개 + 노란 개나리 꽃잎 2개 + 50G'
  },
  {
    id: 'item_green_potion',
    name: '초록 물약',
    icon: '🧪',
    category: 'consumable',
    tierBadge: '특수 물약',
    tierColor: '#16a34a',
    effect: '사용 시 1분간 기본 이동속도 +10% 증가',
    source: '소비품 제작대(C) · 매점 구매(80G, Lv.5+)',
    recipe: '향긋한 허브 2개 + 단단한 목재 1개 + 15G'
  },
  {
    id: 'item_courage_potion',
    name: '용기의 물약',
    icon: '🧪',
    category: 'consumable',
    tierBadge: '특수 물약',
    tierColor: '#9333ea',
    effect: '사용 시 1분간 공격력(ATK) +5 증가',
    source: '소비품 제작대(C)에서 제작',
    recipe: '향긋한 허브 2개 + 단단한 목재 1개 + 20G'
  },
  {
    id: 'item_protection_potion',
    name: '수호의 물약',
    icon: '🧪',
    category: 'consumable',
    tierBadge: '특수 물약',
    tierColor: '#0284c7',
    effect: '사용 시 1분간 방어력(DEF) +3 증가',
    source: '소비품 제작대(C)에서 제작',
    recipe: '향긋한 허브 2개 + 단단한 목재 1개 + 20G'
  },
  {
    id: 'item_tiny_exp_potion',
    name: '초소형 경험치 물약',
    icon: '🧪',
    category: 'consumable',
    tierBadge: '경험치 물약',
    tierColor: '#f59e0b',
    effect: '사용 시 경험치(EXP) +50 즉시 상승',
    source: '퀘스트',
    recipe: '제작불가'
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
    effect: '사용 시 각 층 복도 및 운동장으로 즉시 순간이동',
    source: '소비품 제작대(C)에서 제작',
    recipe: '단단한 목재 1개 + 향긋한 허브 2개 + 50G'
  },

  // 3. Tier 1~4 Weapons & Armor (무기·갑옷 - 티어 및 부위 순 정렬)
  {
    id: 'equip_wood_sword',
    name: '나무검 (Wooden Sword)',
    icon: '🗡️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '1티어 무기',
    tierColor: '#854d0e',
    effect: '공격력(ATK) +15 증가',
    source: '장비 제작대(C)에서 제작',
    recipe: '단단한 목재 10개 + 20G'
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
    effect: '방어력(DEF) +12, 체력(HP) +15 증가',
    source: '장비 제작대(C)에서 제작',
    recipe: '단단한 목재 10개 + 15G'
  },
  {
    id: 'equip_leather_sword',
    name: '가죽손잡이 세이버 (Leather-Grip Saber)',
    icon: '🗡️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '2티어 무기',
    tierColor: '#b45309',
    effect: '공격력(ATK) +22 증가',
    source: '장비 제작대(C)에서 제작 (3레벨 이상)',
    recipe: '보스의 가죽 1개 + 농구공 가죽 10개 + 풋살공 가죽 10개 + 50G'
  },
  {
    id: 'equip_leather_helmet',
    name: '가죽투구 (Leather Helmet)',
    icon: '⛑️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '2티어 투구',
    tierColor: '#b45309',
    effect: '방어력(DEF) +12, 체력(HP) +28 증가',
    source: '장비 제작대(C)에서 제작 (3레벨 이상)',
    recipe: '보스의 가죽 1개 + 풋살공 가죽 15개 + 50G'
  },
  {
    id: 'equip_leather_armor',
    name: '가죽갑옷 (Leather Armor)',
    icon: '🥋',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '2티어 갑옷',
    tierColor: '#b45309',
    effect: '방어력(DEF) +15, 체력(HP) +20 증가',
    source: '장비 제작대(C)에서 제작 (3레벨 이상)',
    recipe: '보스의 가죽 1개 + 농구공 가죽 20개 + 50G'
  },
  {
    id: 'equip_bronze_sword',
    name: '청동검 (Bronze Sword)',
    icon: '⚔️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '3티어 무기',
    tierColor: '#047857',
    effect: '공격력(ATK) +30 증가',
    source: '장비 제작대(C)에서 제작 (5레벨 이상)',
    recipe: '청동 드래곤 심장 1개 + 개나리 꽃잎 20개 + 300G'
  },
  {
    id: 'equip_bronze_helmet',
    name: '청동투구 (Bronze Helmet)',
    icon: '🪖',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '3티어 투구',
    tierColor: '#047857',
    effect: '방어력(DEF) +14, 체력(HP) +35 증가',
    source: '장비 제작대(C)에서 제작 (5레벨 이상)',
    recipe: '청동 드래곤 심장 1개 + 개나리 꽃잎 10개 + 200G'
  },
  {
    id: 'equip_bronze_armor',
    name: '청동갑옷 (Bronze Armor)',
    icon: '🛡️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '3티어 갑옷',
    tierColor: '#047857',
    effect: '방어력(DEF) +20, 체력(HP) +25 증가',
    source: '장비 제작대(C)에서 제작 (5레벨 이상)',
    recipe: '청동 드래곤 심장 1개 + 개나리 꽃잎 15개 + 200G'
  },
  {
    id: 'equip_heritage_blade',
    name: '1897 숭실 헤리티지 소드',
    icon: '⚔️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '4티어 무기',
    tierColor: '#6366f1',
    effect: '공격력 +45, 체력 +35',
    source: '숭실역사관 신비한 제단(C)에서 제작 (10레벨 이상)',
    recipe: '숭실 역사의 정수 5개 + 꺾이지 않는 사명석 3개 + 800G'
  },
  {
    id: 'equip_heritage_helmet',
    name: '1897 숭실 헤리티지 투구',
    icon: '👑',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '4티어 투구',
    tierColor: '#6366f1',
    effect: '방어력 +20, 체력 +35',
    source: '숭실역사관 신비한 제단(C)에서 제작 (10레벨 이상)',
    recipe: '숭실 역사의 정수 4개 + 꺾이지 않는 사명석 2개 + 500G'
  },
  {
    id: 'equip_heritage_armor',
    name: '1897 숭실 헤리티지 갑옷',
    icon: '🛡️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '4티어 갑옷',
    tierColor: '#6366f1',
    effect: '방어력 +25, 체력 +35',
    source: '숭실역사관 신비한 제단(C)에서 제작 (10레벨 이상)',
    recipe: '숭실 역사의 정수 5개 + 꺾이지 않는 사명석 3개 + 500G'
  },
  {
    id: 'equip_omr_wand',
    name: '컴싸 마법봉 (OMR Magic Wand)',
    icon: '🖊️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '4티어 무기',
    tierColor: '#7e22ce',
    effect: '공격력(ATK) +45, 방어력(DEF) +5, 체력(HP) +30 증가 (Lv.10 이상)',
    source: '기말고사 파멸신 레이드 전리품 드랍',
    recipe: '제작 불가'
  },

  // 5티어 불멸세트 (12레벨 락 · 급식실 핵심 재료 + 목재·허브)
  {
    id: 'equip_immortal_blade',
    name: '불멸의 열정 대검',
    icon: '⚔️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '5티어 무기',
    tierColor: '#ef4444',
    effect: '공격력 +60, 체력 +35 (Lv.12 이상)',
    source: '숭실역사관 신비한 제단(C)에서 제작 (12레벨 이상)',
    recipe: '정제된 영양의 정수 8개 + 특수 강화 스텐 조각 5개 + 단단한 목재 15개 + 향긋한 허브 10개 + 1,200G'
  },
  {
    id: 'equip_immortal_helmet',
    name: '불멸의 열정 투구',
    icon: '👑',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '5티어 투구',
    tierColor: '#ef4444',
    effect: '방어력 +25, 체력 +35 (Lv.12 이상)',
    source: '숭실역사관 신비한 제단(C)에서 제작 (12레벨 이상)',
    recipe: '정제된 영양의 정수 6개 + 특수 강화 스텐 조각 4개 + 단단한 목재 10개 + 향긋한 허브 8개 + 700G'
  },
  {
    id: 'equip_immortal_armor',
    name: '불멸의 열정 갑옷',
    icon: '🛡️',
    category: 'weapon_armor', subCategory: 'weapon_armor',
    tierBadge: '5티어 갑옷',
    tierColor: '#ef4444',
    effect: '방어력 +30, 체력 +35 (Lv.12 이상)',
    source: '숭실역사관 신비한 제단(C)에서 제작 (12레벨 이상)',
    recipe: '정제된 영양의 정수 8개 + 특수 강화 스텐 조각 5개 + 단단한 목재 12개 + 향긋한 허브 10개 + 700G'
  },

  // 4. Shoes (신발 1~4티어 순 정렬)
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
    source: '농구장/풋살장 몬스터 토벌 시 드랍'
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
    id: 'equip_immortal_shoes',
    name: '불멸의 에어 농구화 (Immortal Air Shoes)',
    icon: '👟',
    category: 'shoes',
    subCategory: 'shoes',
    tierBadge: '5티어 신발',
    tierColor: '#ef4444',
    effect: '공격력 +8, 방어력 +6, 체력 +15',
    source: '체육관 실내 몬스터 토벌 시 드랍'
  },

  // 5. Special School Accessories (장신구)
  {
    id: 'equip_forsythia_ring',
    name: '성실의 개나리 반지 (Forsythia Ring)',
    icon: '🌼',
    category: 'accessory', subCategory: 'accessory',
    tierBadge: '교화 장신구',
    tierColor: '#ca8a04',
    effect: '공격력 +10, 방어력 +5, 체력 +20 증가',
    source: '복도 식물존 옆 악세서리 세공대에서 제작',
    recipe: '노란 개나리 꽃잎 20개 + 100G'
  },
  {
    id: 'equip_ginkgo_talisman',
    name: '합심의 황금 은행잎 부적 (Ginkgo Talisman)',
    icon: '🍂',
    category: 'accessory', subCategory: 'accessory',
    tierBadge: '교목 장신구',
    tierColor: '#d97706',
    effect: '공격력 +15, 방어력 +5, 체력 +30 증가',
    source: '복도 식물존 옆 악세서리 세공대에서 제작 (5레벨 이상)',
    recipe: '황금 은행잎 10개 + 500G',
    stats: { atk: 15, def: 5, hp: 30 }
  },
  {
    id: 'equip_victory_medal',
    name: '승리의 월계관 메달 (Victory Laurel Medal)',
    icon: '🏅',
    category: 'accessory', subCategory: 'accessory',
    tierBadge: '영광 장신구',
    tierColor: '#eab308',
    effect: '공격력 +20, 방어력 +5, 체력 +30 증가 (Lv.15 이상)',
    source: '복도 식물존 옆 악세서리 세공대에서 제작 (15레벨 이상)',
    recipe: '황금 월계수 잎 12개 + 1,000G',
    stats: { atk: 20, def: 5, hp: 30 }
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
  {
    id: 'equip_elevator_pass',
    name: '엘리베이터 작동권',
    icon: '🪪',
    category: 'quest',
    tierBadge: '퀘스트 인가증',
    tierColor: '#2563eb',
    effect: '🛗 중앙 엘리베이터 가동 필수 인가증 (소지 시 자동 작동)',
    source: '1학년 2반 가죽 골렘 토벌 시 획득',
    recipe: '가죽 골렘 토벌'
  },

  // 6. Special Quest Key
  {
    id: 'item_cafeteria_key',
    name: '급식실 열쇠',
    icon: '🔑',
    category: 'quest',
    tierBadge: '입장 열쇠',
    tierColor: '#f59e0b',
    effect: '급식실 정문 출입용 황금 열쇠',
    source: '6층 교무실'
  },
  {
    id: 'item_gym_key',
    name: '2학년 체육관 열쇠',
    icon: '🔑',
    category: 'quest',
    tierBadge: '입장 열쇠',
    tierColor: '#f59e0b',
    effect: '체육관 출입문 개방 및 2학년 체육선생님 전달용 열쇠',
    source: '6층 교무실 20번 자리 (Lv.12 이상)'
  }
];

/**
 * Shared crisp UI icon renderer for items whose OS emoji glyphs render poorly
 * (e.g., washed-out futsal ball on light backgrounds or black-legged elixir alembic).
 */
window.renderItemIconHtml = function renderItemIconHtml(itemId, fallbackIcon = '📦', extraClass = '') {
  if (itemId === 'item_futsal_leather') {
    const svg = `<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" style="display:inline-block; vertical-align:-0.15em; filter:drop-shadow(0 1px 1.5px rgba(15,23,42,0.28));"><circle cx="16" cy="16" r="14" fill="#ffffff" stroke="#0f172a" stroke-width="2.2"/><path d="M7.5 25 A14 14 0 0 0 26 9 A13.5 13.5 0 0 1 7.5 25 Z" fill="#cbd5e1"/><polygon points="16,9.5 22,13.8 19.7,20.8 12.3,20.8 10,13.8" fill="#0f172a"/><polygon points="16,2 19.4,4.2 12.6,4.2" fill="#0f172a"/><polygon points="28.8,10.5 29.5,14.5 26.2,13.5" fill="#0f172a"/><polygon points="3.2,10.5 5.8,13.5 2.5,14.5" fill="#0f172a"/><polygon points="24.8,26.2 21.8,28.5 20.5,25.2" fill="#0f172a"/><polygon points="7.2,26.2 11.5,25.2 10.2,28.5" fill="#0f172a"/><path d="M16 4V9.5M22 13.8L26.5 13M19.7 20.8L21.5 25.5M12.3 20.8L10.5 25.5M10 13.8L5.5 13" stroke="#0f172a" stroke-width="1.6" stroke-linecap="round"/></svg>`;
    return extraClass ? `<span class="${extraClass}">${svg}</span>` : svg;
  }
  if (itemId === 'item_elixir' || itemId === 'recipe_elixir') {
    const svg = `<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" style="display:inline-block; vertical-align:-0.15em; filter:drop-shadow(0 0 5px rgba(192,132,252,0.7));"><path d="M20.5 10.5 L25.8 5.2 L27.8 7.2 L22.5 12.5" fill="#bae6fd" stroke="#0284c7" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="26.8" cy="6.2" rx="2.1" ry="1.1" transform="rotate(45 26.8 6.2)" fill="#7dd3fc" stroke="#0369a1" stroke-width="1.3"/><circle cx="15" cy="18.5" r="10.2" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.8"/><path d="M6.2 19.5 C10 17.5, 13.5 21, 18 19 C21.2 17.6, 23.6 18.8, 24.4 20 A9.4 9.4 0 0 1 6.2 19.5 Z" fill="#22c55e"/><circle cx="12.5" cy="22" r="1.4" fill="#86efac"/><circle cx="17.5" cy="23.5" r="1.1" fill="#bbf7d0"/><circle cx="15.5" cy="20.8" r="0.9" fill="#dcfce7"/><path d="M9.5 14.5 A6.2 6.2 0 0 1 15 11.2" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg>`;
    return `<span class="icon-elixir ${extraClass}">${svg}</span>`;
  }
  if (itemId === 'item_tiny_exp_potion') {
    const svg = `<svg width="1em" height="1em" viewBox="0 0 32 32" aria-hidden="true" style="display:inline-block; vertical-align:-0.15em; filter:drop-shadow(0 0 4px rgba(245,158,11,0.65));"><rect x="13" y="4" width="6" height="4" rx="1.5" fill="#d97706" stroke="#78350f" stroke-width="1.3"/><path d="M13.5 8 L18.5 8 L19.5 12.5 L23.5 18.5 A7.5 7.5 0 1 1 8.5 18.5 L12.5 12.5 Z" fill="#fef3c7" stroke="#b45309" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.5 19.5 C12.5 18, 16 21, 22.5 19.2 A6.8 6.8 0 0 1 9.5 19.5 Z" fill="#f59e0b"/><circle cx="14" cy="22" r="1.3" fill="#fde047"/><circle cx="18" cy="23" r="1" fill="#fef08a"/><path d="M24.5 7 L25.5 9.5 L28 10.5 L25.5 11.5 L24.5 14 L23.5 11.5 L21 10.5 L23.5 9.5 Z" fill="#facc15"/></svg>`;
    return extraClass ? `<span class="${extraClass}">${svg}</span>` : svg;
  }
  return extraClass ? `<span class="${extraClass}">${fallbackIcon}</span>` : `<span>${fallbackIcon}</span>`;
};
