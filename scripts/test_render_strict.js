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

const rooms = ['hallway', 'playground', 'playground_gym', 'room_staff_office', 'room_career', 'room_history', 'room_701', 'room_702', 'room_703', 'room_704', 'room_705', 'room_706'];
const variants = [
  { label: 'student', isTeacher: false, isFallen: false, gear: {} },
  { label: 'teacher', isTeacher: true, isFallen: false, gear: {}, noclip: true },
  { label: 'fallen', isTeacher: false, isFallen: true, gear: { weapon: 'equip_leather_sword', armor: 'equip_bronze_armor', helmet: 'equip_heritage_helmet', accessory: 'equip_ginkgo_talisman' } }
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

// Also test BrawlBallManager full match lifecycle & strict rendering
const brawlJs = fs.readFileSync('public/js/brawl_ball.js', 'utf8');
eval(brawlJs.replace('class BrawlBallManager', 'global.BrawlBallManager = class BrawlBallManager'));

const emittedMoves = [];
const mockNetwork = {
  socket: { id: 'me_socket', connected: true },
  sendMove(dataOrX, y, direction) {
    const payload = (dataOrX && typeof dataOrX === 'object') ? dataOrX : { x: dataOrX, y, direction };
    if (typeof payload.x !== 'number' || typeof payload.y !== 'number') {
      throw new Error('sendMove received invalid coordinates: ' + JSON.stringify(payload));
    }
    emittedMoves.push(payload);
  },
  joinBrawlQueue() {},
  leaveBrawlQueue() {},
  startBrawlWithBots() {},
  sendBrawlKick() {},
  sendBrawlTackle() {},
  sendBrawlTackleHit() {},
  sendBrawlSuperShot() {},
  sendBrawlMegaTackle() {},
  sendBrawlObstacleBreak() {},
  sendBrawlPowerupCollected() {},
  sendBrawlBallSync() {},
  notifyBrawlGoal() {}
};

try {
  const bb = new BrawlBallManager(engine, mockNetwork);
  bb.init(engine, mockNetwork);
  window.BrawlBall = bb;
  engine.player.room = 'playground';
  engine.player.floor = 1;
  engine.otherPlayers = {
    o1: { id: 'o1', name: '라이벌', x: 500, y: 500, direction: 'down', gear: {} }
  };

  // 1. Start match
  bb.onMatchStarted({
    matchId: 'test_match',
    status: 'playing',
    kickoffUntil: Date.now() - 100,
    timeRemaining: 140,
    score: { blue: 0, red: 0 },
    powerups: [{ id: 'pw_1', type: 'speed', x: 36 * 32, y: 29 * 32 }],
    teams: {
      blue: [
        { socketId: 'me_socket', name: '갓준철', team: 'blue', spawnX: 43 * 32, spawnY: 44 * 32, x: 43 * 32, y: 44 * 32, isBot: false },
        { socketId: 'bot_1', name: '🤖 골든 키커', team: 'blue', spawnX: 38 * 32, spawnY: 42 * 32, x: 38 * 32, y: 42 * 32, isBot: true },
        { socketId: 'bot_2', name: '🤖 철벽 수비수', team: 'blue', spawnX: 48 * 32, spawnY: 42 * 32, x: 48 * 32, y: 42 * 32, isBot: true }
      ],
      red: [
        { socketId: 'o1', name: '라이벌', team: 'red', spawnX: 43 * 32, spawnY: 26 * 32, x: 43 * 32, y: 26 * 32, isBot: false },
        { socketId: 'bot_3', name: '🤖 불꽃 태클러', team: 'red', spawnX: 38 * 32, spawnY: 28 * 32, x: 38 * 32, y: 28 * 32, isBot: true },
        { socketId: 'bot_4', name: '🤖 번개 드리블러', team: 'red', spawnX: 48 * 32, spawnY: 28 * 32, x: 48 * 32, y: 28 * 32, isBot: true }
      ]
    },
    ball: { x: 43 * 32, y: 35 * 32, vx: 0, vy: 0, carrierId: 'me_socket', carrierName: '갓준철', carrierTeam: 'blue' }
  });

  // Verify remote player o1 snapped to spawnX/spawnY
  if (engine.otherPlayers.o1.x !== 43 * 32 || engine.otherPlayers.o1.y !== 26 * 32) {
    throw new Error('Remote player o1 did not snap to kickoff spawn coordinates');
  }

  // 2. Render & update with active carrier, tackle, super shot, and stun
  engine.update();
  engine.render();

  bb.tryTackle();
  bb.superGauge = 100;
  bb.trySuper();
  engine.update();
  engine.render();

  // 3. Test stun during engine.update() — ensure BrawlBall.update still runs and decrements floatingTexts
  bb.stunnedUntil = Date.now() + 1200;
  const beforeLife = bb.floatingTexts[0] ? bb.floatingTexts[0].life : 0;
  engine.update();
  engine.render();
  const afterLife = bb.floatingTexts[0] ? bb.floatingTexts[0].life : 0;
  if (beforeLife > 0 && afterLife >= beforeLife) {
    throw new Error('BrawlBall.update() was skipped while local player was stunned!');
  }

  // 4. Test goal & ball reset
  bb.onGoalScored({ team: 'blue', scorerName: '갓준철', score: { blue: 1, red: 0 } });
  bb.onBallReset({ x: 43 * 32, y: 35 * 32 }, Date.now() + 3000);
  engine.update();
  engine.render();

  // 5. Test match end
  bb.onMatchEnded({ winnerTeam: 'blue', score: { blue: 2, red: 0 }, reason: '승리' });
  engine.update();
  engine.render();
} catch (e) {
  fail++;
  console.error('FAIL BrawlBall simulation:', e.stack || e.message);
}

if (errors.size) console.log('\nUnique canvas errors:\n' + [...errors].join('\n'));
console.log(fail === 0 ? '\n✅ ALL ROOMS/VARIANTS RENDER WITHOUT ERROR' : `\n❌ ${fail} failures`);
process.exit(fail ? 1 : 0);
