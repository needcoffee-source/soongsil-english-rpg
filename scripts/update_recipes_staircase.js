const fs = require('fs');

const path = 'data/craft_recipes.json';
const recipes = JSON.parse(fs.readFileSync(path, 'utf8'));

recipes.forEach(r => {
  // 1. Leather Armor
  if (r.id === 'recipe_leather_armor') {
    r.description = '[2티어 갑옷] 질긴 보스의 가죽과 농구공 가죽을 엮어 만든 유연하고 튼튼한 2티어 가죽 갑옷입니다.';
    r.requiredItems = [
      { item: 'item_boss_leather', name: '질긴 보스의 가죽', count: 1 },
      { item: 'item_basketball_leather', name: '농구공 가죽 조각', count: 30 }
    ];
  }
  // 2. Leather Helmet
  if (r.id === 'recipe_leather_helmet') {
    r.description = '[2티어 투구] 질긴 보스의 가죽과 풋살공 가죽으로 제작하여 머리를 안전하게 감싸는 2티어 가죽 헤드기어입니다.';
    r.requiredItems = [
      { item: 'item_boss_leather', name: '질긴 보스의 가죽', count: 1 },
      { item: 'item_futsal_leather', name: '탄력있는 풋살공 가죽', count: 20 }
    ];
  }
  // 3. Leather Sword
  if (r.id === 'recipe_leather_sword') {
    r.description = '[2티어 무기] 질긴 보스의 가죽과 풋살공 가죽으로 손잡이를 감싸 충격을 흡수하고 날을 예리하게 세운 2티어 실전 검입니다.';
    r.requiredItems = [
      { item: 'item_boss_leather', name: '질긴 보스의 가죽', count: 1 },
      { item: 'item_futsal_leather', name: '탄력있는 풋살공 가죽', count: 15 }
    ];
  }
  // 4. Bronze Sword
  if (r.id === 'recipe_bronze_sword') {
    r.description = '[3티어 무기] 청동 드래곤의 심장과 단단한 목재의 힘을 벼려낸 강력한 3티어 청동 검입니다.';
    r.requiredItems = [
      { item: 'item_bronze_heart', name: '청동 드래곤의 심장', count: 1 },
      { item: 'item_wood', name: '단단한 목재', count: 15 }
    ];
  }
  // 5. Bronze Helmet
  if (r.id === 'recipe_bronze_helmet') {
    r.description = '[3티어 투구] 청동 드래곤의 심장과 노란 개나리 꽃잎의 생명력을 담아 벼려낸 단단한 3티어 청동 투구입니다.';
    r.requiredItems = [
      { item: 'item_bronze_heart', name: '청동 드래곤의 심장', count: 1 },
      { item: 'item_forsythia', name: '노란 개나리 꽃잎', count: 10 }
    ];
  }
  // 6. Bronze Armor
  if (r.id === 'recipe_bronze_armor') {
    r.description = '[3티어 갑옷] 청동 드래곤의 심장과 노란 개나리 꽃잎을 엮어 만든 무적의 3티어 청동 갑옷입니다.';
    r.requiredItems = [
      { item: 'item_bronze_heart', name: '청동 드래곤의 심장', count: 1 },
      { item: 'item_forsythia', name: '노란 개나리 꽃잎', count: 20 }
    ];
  }
});

fs.writeFileSync(path, JSON.stringify(recipes, null, 2), 'utf8');
console.log('Successfully updated craft_recipes.json for staircase progression!');
