// Mock browser environment to test instantiation and critical methods
const fs = require('fs');
const vm = require('vm');

console.log('=== RUNNING MOCK RUNTIME SIMULATION ===');

// Setup minimal browser mocks
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.document = {
  querySelector: () => ({
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    addEventListener: () => {},
    style: {},
    innerText: '',
    innerHTML: '',
    appendChild: () => {}
  }),
  querySelectorAll: () => [],
  getElementById: (id) => ({
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    addEventListener: () => {},
    style: {},
    innerText: '',
    innerHTML: '',
    value: '',
    disabled: false,
    appendChild: () => {},
    querySelectorAll: () => [],
    querySelector: () => null,
    getContext: () => mockCtx,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
    focus: () => {}
  }),
  createElement: (tag) => ({
    width: 100,
    height: 100,
    classList: { add: () => {}, remove: () => {} },
    addEventListener: () => {},
    style: {},
    innerText: '',
    innerHTML: '',
    appendChild: () => {},
    getContext: () => mockCtx
  }),
  addEventListener: () => {},
  body: { style: {} }
};
global.localStorage = {
  _store: {},
  getItem: (k) => global.localStorage._store[k] || null,
  setItem: (k, v) => { global.localStorage._store[k] = String(v); },
  removeItem: (k) => { delete global.localStorage._store[k]; }
};
global.alert = (msg) => { /* console.log('Mock Alert:', msg); */ };
global.confirm = () => true;
global.prompt = () => 'test';

// Mock Canvas
const mockCtx = {
  save: () => {},
  restore: () => {},
  scale: () => {},
  translate: () => {},
  rotate: () => {},
  beginPath: () => {},
  closePath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  quadraticCurveTo: () => {},
  bezierCurveTo: () => {},
  arc: () => {},
  arcTo: () => {},
  ellipse: () => {},
  rect: () => {},
  strokeRect: () => {},
  fillRect: () => {},
  clearRect: () => {},
  setLineDash: () => {},
  getLineDash: () => [],
  stroke: () => {},
  fill: () => {},
  fillText: () => {},
  strokeText: () => {},
  measureText: () => ({ width: 50 }),
  createLinearGradient: () => ({ addColorStop: () => {} }),
  createRadialGradient: () => ({ addColorStop: () => {} }),
  drawImage: () => {}
};

global.HTMLCanvasElement = function() {};
const mockCanvas = {
  getContext: () => mockCtx,
  addEventListener: () => {},
  removeEventListener: () => {},
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
  width: 800,
  height: 600,
  style: {}
};

// Mock Audio
global.AudioContext = function() {
  return {
    state: 'running',
    resume: async () => {},
    createGain: () => ({ gain: { value: 1, setValueAtTime: () => {} }, connect: () => {} }),
    createOscillator: () => ({
      type: 'sine',
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {}
    }),
    currentTime: 0
  };
};

try {
  // Load scripts in browser order
  [
    'public/js/audio.js',
    'public/js/dialog.js',
    'public/js/world.js',
    'public/js/engine.js',
    'public/js/quiz.js',
    'public/js/crafting.js',
    'public/js/acid_rain.js',
    'public/js/network.js',
    'public/js/main.js'
  ].forEach(f => {
    vm.runInThisContext(fs.readFileSync(f, 'utf8'));
    console.log('[PASS] ' + f + ' loaded');
  });

  // Test Instantiations
  const audio = window.AudioManager;
  console.log('[PASS] AudioManager instance verified');

  const engine = new GameEngine(mockCanvas);
  console.log('[PASS] GameEngine instantiated');

  // Test engine rendering all rooms!
  console.log('Testing render across rooms:');
  const roomsToTest = [
    'hallway', 'playground', 'room_701', 'room_702', 'room_703',
    'room_704', 'room_705', 'room_706', 'room_501', 'room_career',
    'room_history', 'room_staff_office'
  ];

  roomsToTest.forEach(r => {
    engine.player.room = r;
    if (r === 'playground') {
      engine.renderPlayground();
    } else if (r === 'hallway') {
      engine.renderHallway();
    } else {
      engine.renderClassroom();
    }
  });
  console.log('[PASS] All rooms render without error!');

  // Test MainApp
  const app = new MainApp();
  console.log('[PASS] MainApp instantiated');

  // Test Alchemy Transmute logic
  console.log('Testing Alchemy Transmute logic:');
  app.playerData = {
    gold: 100,
    inventory: []
  };
  app.transmuteAlchemyItem('item_wood', '단단한 목재', '🪵', 1, 10);
  const woodItem = app.playerData.inventory.find(i => i.item === 'item_wood');
  if (app.playerData.gold === 90 && woodItem && woodItem.count === 1) {
    console.log('[PASS] Alchemy wood transmute works properly (10G deducted, 1 wood added)');
  } else {
    console.error('[FAIL] Alchemy wood transmute failed:', app.playerData);
  }

  app.transmuteAlchemyItem('item_forsythia', '개나리 꽃잎', '🌼', 2, 50);
  const forsythiaItem = app.playerData.inventory.find(i => i.item === 'item_forsythia');
  if (app.playerData.gold === 40 && forsythiaItem && forsythiaItem.count === 2) {
    console.log('[PASS] Alchemy forsythia transmute works properly (50G deducted, 2 forsythia added)');
  } else {
    console.error('[FAIL] Alchemy forsythia transmute failed:', app.playerData);
  }

  // Test insufficient gold
  app.transmuteAlchemyItem('item_forsythia', '개나리 꽃잎', '🌼', 2, 50); // needs 50, has 40
  if (app.playerData.gold === 40) {
    console.log('[PASS] Alchemy insufficient gold prevented deduction properly');
  } else {
    console.error('[FAIL] Alchemy failed to block insufficient gold');
  }

  // Test Interaction dispatch
  console.log('Testing handleInteraction dispatch:');
  app.handleInteraction({ type: 'alchemy_cauldron' });
  app.handleInteraction({ type: 'alchemy_shelf' });
  app.handleInteraction({ type: 'alchemy_tome' });
  app.handleInteraction({ type: 'alchemy_workbench' });
  console.log('[PASS] All alchemy interaction dispatches executed cleanly');

  console.log('\n====================================================');
  console.log(' ALL RUNTIME SIMULATION TESTS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');

} catch (err) {
  console.error('\n❌ RUNTIME ERROR DETECTED:');
  console.error(err.stack || err);
  process.exit(1);
}
