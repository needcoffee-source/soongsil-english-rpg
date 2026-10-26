// Strict canvas runtime test: validates argument counts like a real browser (throws on missing args)
const fs = require('fs');

const REQUIRED = {
  ellipse: 7, arc: 5, arcTo: 5, fillRect: 4, strokeRect: 4, clearRect: 4, rect: 4, roundRect: 4,
  moveTo: 2, lineTo: 2, quadraticCurveTo: 4, bezierCurveTo: 6, fillText: 3, strokeText: 3,
  translate: 2, scale: 2, rotate: 1, setTransform: 6, createLinearGradient: 4, createRadialGradient: 6,
  measureText: 1, setLineDash: 1
};
const errors = new Set();
function makeCtx() {
  const ctx = { canvas: { width: 1200, height: 800 } };
  const noop = ['save', 'restore', 'beginPath', 'closePath', 'fill', 'stroke', 'clip', 'resetTransform'];
  noop.forEach(n => ctx[n] = () => {});
  Object.keys(REQUIRED).forEach(n => {
    ctx[n] = (...args) => {
      if (args.length < REQUIRED[n]) {
        const stack = new Error().stack.split('\n')[2].trim();
        const msg = `${n}() called with ${args.length} args (needs ${REQUIRED[n]}) ${stack}`;
        errors.add(msg);
        throw new TypeError(msg);
      }
      if (n === 'measureText') return { width: 50 };
      if (n.startsWith('create')) return { addColorStop: () => {} };
    };
  });
  ctx.drawImage = (...args) => {
    if (![3, 5, 9].includes(args.length)) throw new TypeError('drawImage bad arg count ' + args.length);
    if (!args[0]) throw new TypeError('drawImage null image');
  };
  return ctx;
}

global.window = {
  innerWidth: 1200, innerHeight: 800, devicePixelRatio: 2,
  addEventListener: () => {}, removeEventListener: () => {}, ALL_GAME_ITEMS: {},
  BOSS_CONFIG: { active: false, maxHp: 1000 }
};
global.document = {
  createElement: (tag) => tag === 'canvas'
    ? { width: 100, height: 100, getContext: () => makeCtx() }
    : { style: {}, classList: { add() {}, remove() {}, contains: () => false }, addEventListener() {} },
  getElementById: () => ({ style: {}, classList: { add() {}, remove() {}, contains: () => false, toggle() {} }, addEventListener() {}, innerText: '', innerHTML: '', textContent: '' }),
  querySelector: () => null
};
global.performance = { now: () => Date.now() };

const worldJs = fs.readFileSync('public/js/world.js', 'utf8');
eval(worldJs.replace('const WORLD_DATA', 'global.WORLD_DATA'));
const engineJs = fs.readFileSync('public/js/engine.js', 'utf8');
eval(engineJs.replace('class GameEngine', 'global.GameEngine = class GameEngine'));

const canvas = { width: 1200, height: 800, getContext: () => makeCtx(), getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 800 }), addEventListener: () => {} };
const engine = new GameEngine(canvas);

const rooms = ['hallway', 'playground', 'room_701', 'room_702', 'room_703', 'room_704', 'room_705', 'room_706'];
const variants = [
  { label: 'student', isTeacher: false, isFallen: false, gear: {} },
  { label: 'teacher', isTeacher: true, isFallen: false, gear: {}, noclip: true },
  { label: 'fallen', isTeacher: false, isFallen: true, gear: { weapon: 'equip_leather_sword', armor: 'equip_bronze_armor', helmet: 'equip_laurel_crown', accessory: 'equip_ginkgo_talisman' } }
];
const plantCounts = [0, 150, 1500, 3500];
let fail = 0;
for (const room of rooms) {
  for (const v of variants) {
    for (const wc of plantCounts) {
      Object.assign(engine.player, v, { room, floor: room === 'playground' ? 1 : 7 });
      engine.plantWaterCount = wc;
      engine.otherPlayers = { o1: { id: 'o1', name: '친구', x: 300, y: 300, direction: 'left', gear: v.gear, isFallen: v.isFallen } };
      try {
        engine.update();
        engine.render();
      } catch (e) {
        fail++;
        console.error(`FAIL room=${room} variant=${v.label} water=${wc}:`, e.message.split('\n')[0]);
      }
      // Try boss active state too
      if (room === 'room_702') {
        window.BOSS_CONFIG.active = true;
        try { engine.render(); } catch (e) { fail++; console.error(`FAIL boss-active room_702:`, e.message); }
        window.BOSS_CONFIG.active = false;
      }
    }
  }
}
if (errors.size) console.log('\nUnique canvas errors:\n' + [...errors].join('\n'));
console.log(fail === 0 ? '\n✅ ALL ROOMS/VARIANTS RENDER WITHOUT ERROR' : `\n❌ ${fail} failures`);
process.exit(fail ? 1 : 0);
