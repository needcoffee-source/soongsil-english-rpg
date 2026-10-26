const fs = require('fs');
const vm = require('vm');

// Setup mock browser environment
const mockCtx = {
  save: () => {},
  restore: () => {},
  translate: () => {},
  scale: () => {},
  rotate: () => {},
  beginPath: () => {},
  closePath: () => {},
  arc: () => {},
  ellipse: () => {},
  roundRect: () => {},
  rect: () => {},
  fillRect: () => {},
  strokeRect: () => {},
  stroke: () => {},
  fill: () => {},
  moveTo: () => {},
  lineTo: () => {},
  quadraticCurveTo: () => {},
  bezierCurveTo: () => {},
  measureText: () => ({ width: 50 }),
  fillText: () => {},
  strokeText: () => {},
  drawImage: () => {},
  clearRect: () => {},
  createLinearGradient: () => ({ addColorStop: () => {} }),
  createRadialGradient: () => ({ addColorStop: () => {} }),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  font: '',
  textAlign: '',
  textBaseline: ''
};

const mockCanvas = {
  getContext: () => mockCtx,
  width: 800,
  height: 600,
  style: {},
  addEventListener: () => {}
};

const mockDocument = {
  createElement: () => ({ getContext: () => mockCtx, width: 32, height: 32 }),
  getElementById: (id) => ({
    innerText: '',
    style: {},
    classList: { add: () => {}, remove: () => {} }
  }),
  addEventListener: () => {}
};

const sandbox = {
  window: {},
  document: mockDocument,
  console: console,
  Math: Math,
  Date: Date,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  requestAnimationFrame: () => {},
  WORLD_DATA: null,
  GameEngine: null
};

// Load world.js
const worldCode = fs.readFileSync('public/js/world.js', 'utf8');
vm.runInNewContext(worldCode, sandbox);

// Load engine.js
const engineCode = fs.readFileSync('public/js/engine.js', 'utf8');
vm.runInNewContext(engineCode, sandbox);

const engine = new (sandbox.window.GameEngine || sandbox.GameEngine)(mockCanvas);

console.log('--- Testing Hallway Update & Render ---');
engine.player.room = 'hallway';
engine.player.floor = 7;
engine.update();
engine.render();
console.log('✅ Hallway update & render succeeded without error!');

console.log('--- Testing Playground Update & Render ---');
engine.player.room = 'playground';
engine.update();
engine.render();
console.log('✅ Playground update & render succeeded without error!');

console.log('--- Testing Classroom 701 Update & Render ---');
engine.player.room = 'room_701';
engine.update();
engine.render();
console.log('✅ Room 701 update & render succeeded without error!');

console.log('--- Testing Classroom 702 (Boss) Update & Render ---');
engine.player.room = 'room_702';
engine.update();
engine.render();
console.log('✅ Room 702 update & render succeeded without error!');

console.log('--- Testing Classroom 703 (Acid Rain Computer Lab) Update & Render ---');
engine.player.room = 'room_703';
engine.update();
engine.render();
console.log('✅ Room 703 update & render succeeded without error!');

console.log('\n🎉 ALL ROOMS PASSED RUNTIME SIMULATION PERFECTLY!');
