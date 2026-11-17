const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const cwd = path.join(__dirname, '..');
const recipes = JSON.parse(fs.readFileSync(path.join(cwd, 'data/craft_recipes.json'), 'utf8'));
const g1Questions = JSON.parse(fs.readFileSync(path.join(cwd, 'data/questions_grade1.json'), 'utf8'));
const worldJs = fs.readFileSync(path.join(cwd, 'public/js/world.js'), 'utf8');
const engineJs = fs.readFileSync(path.join(cwd, 'public/js/engine.js'), 'utf8');
const mainJs = fs.readFileSync(path.join(cwd, 'public/js/main.js'), 'utf8');
const serverJs = fs.readFileSync(path.join(cwd, 'server.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(cwd, 'public/index.html'), 'utf8');

// 1. Elixir HP +80 parity
const elixirRecipe = recipes.find(r => r.id === 'recipe_elixir');
assert(elixirRecipe && elixirRecipe.result.heal === 80, 'craft_recipes.json elixir heal must be 80');
assert(serverJs.includes("'item_elixir'") && serverJs.includes('heal: 80'), 'server.js item_elixir heal must be 80');
assert(mainJs.includes('체력 +80 초대량 즉시 회복') && mainJs.includes("label: '엘릭서 (+80)'"), 'main.js item_elixir must say +80');
assert(!mainJs.includes('엘릭서 (+60)') && !indexHtml.includes('엘릭서 (+60)'), 'No stale +60 elixir label may remain');
assert(indexHtml.includes('엘릭서 (+80) 0개'), 'index.html raid/battle elixir button must say +80');
console.log('✓ 1. Elixir +80 HP parity verified across craft_recipes, server, main, index.html.');

// 2. Act 3 Title updated (removed '숭실')
assert(mainJs.includes("title: '[장편 완결 3막] 희망의 종소리: 몸과 마음의 공명'"), 'Act 3 title updated without 숭실');
assert(!mainJs.includes('숭실 희망의 종소리'), 'No stale 숭실 희망의 종소리 string may remain');
console.log('✓ 2. Act 3 Quest title verified ([장편 완결 3막] 희망의 종소리: 몸과 마음의 공명).');

// 3. Indoor Gym Lv.15 Monsters + Engine runtime + Unit 8 battle test
const sandbox = {
  window: { BRAWL_ACTIVE: false },
  globalThis: {},
  document: {
    getElementById: () => ({
      classList: { add: () => {}, remove: () => {} },
      innerText: '',
      getContext: () => ({}),
      width: 800,
      height: 600
    })
  },
  navigator: { userAgent: 'node' },
  Date,
  Math
};
vm.runInNewContext(worldJs + '\n' + engineJs, sandbox);
const WD = sandbox.window.WORLD_DATA;
const Gym = WD.classroom_gym;
assert(Array.isArray(Gym.gymMonsters) && Gym.gymMonsters.length >= 4, 'classroom_gym must have >= 4 Lv.15 monsters');

for (const mob of Gym.gymMonsters) {
  assert.strictEqual(mob.court, 'gym', `${mob.id} court must be gym`);
  assert(mob.hp >= 420 && mob.def >= 26 && mob.counterDmg >= 58, `${mob.id} must have Lv.15 high stats (hp>=420, def>=26, counterDmg>=58)`);
  assert(mob.x >= 18 && mob.x <= 40 && mob.y >= 6 && mob.y <= 21, `${mob.id} must spawn inside indoor basketball court`);
}
const elite = Gym.gymMonsters.find(m => m.type === 'elite');
assert(elite && elite.hp >= 580 && elite.def >= 34 && elite.counterDmg >= 75, 'Indoor gym must have tough Lv.15 Elite boss monster');

// Simulate GameEngine inside room_gym
const ctxStub = new Proxy({}, {
  get: (_, prop) => {
    if (prop === 'fillStyle' || prop === 'strokeStyle' || prop === 'font' || prop === 'textAlign' || prop === 'textBaseline' || prop === 'lineWidth') return '';
    return () => ({ width: 50 });
  },
  set: () => true
});
const canvasStub = {
  getContext: () => ctxStub,
  addEventListener: () => {},
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 640 }),
  width: 960,
  height: 640
};
const engine = new sandbox.window.GameEngine(canvasStub);
engine.player.room = 'room_gym';
engine.player.floor = 1;
const sampleMob = Gym.gymMonsters[0];
engine.player.x = sampleMob.x * 32;
engine.player.y = (sampleMob.y + 0.5) * 32;

// Must NOT throw (e.g. from stray x/y ref) and must detect field_monster
engine.checkNearbyInteractable();
assert(engine.activeInteractable && engine.activeInteractable.type === 'field_monster', 'Nearby check inside room_gym must detect Lv.15 gym monster');
const hovered = engine.getInteractableAt(sampleMob.x * 32, (sampleMob.y + 0.5) * 32);
assert(hovered && hovered.type === 'field_monster', 'Hover/click check inside room_gym must detect Lv.15 gym monster');

engine.updateGymMonsters();
engine.renderGymMonsters();

// Check Unit 8 question pool availability & battle filter
const u8 = g1Questions.filter(q => String(q.unit || '').includes('8단원'));
assert(u8.length >= 20, `questions_grade1.json must have substantial 8단원 pool (got ${u8.length})`);
assert(mainJs.includes("const unitFilter = isGym\n      ? '8단원'") || mainJs.includes("const unitFilter = isGym\r\n      ? '8단원'"), 'loadNextFieldBattleQuestion must filter Unit 8 for Gym monsters');
assert(mainJs.includes("} else if (mob.court === 'gym') {"), 'handleFieldBattleVictory must reward Gym monster drops');

console.log(`✓ 3. Indoor Gym (${Gym.gymMonsters.length} Lv.15 monsters, Unit 8 pool ${u8.length} questions, runtime hooks) verified.`);
