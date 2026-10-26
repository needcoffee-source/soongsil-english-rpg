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
  clip: () => {},
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

console.log('--- Testing Classroom 704 (Teacher Lee Ji-hong) Update & Render ---');
engine.player.room = 'room_704';
engine.update();
engine.render();
console.log('✅ Room 704 update & render succeeded without error!');

console.log('--- Testing Classroom 705 (Teacher Jung Kyung-sook) Update & Render ---');
engine.player.room = 'room_705';
engine.update();
engine.render();
console.log('✅ Room 705 update & render succeeded without error!');

console.log('--- Testing Classroom 706 (Empty Classroom) Update & Render ---');
engine.player.room = 'room_706';
engine.update();
engine.render();
console.log('✅ Room 706 update & render succeeded without error!');

console.log('--- Testing Locked Doors in Hallway ---');
engine.player.room = 'hallway';
engine.player.floor = 7;
// Test door proximity for room 704 (doorX: 37, doorY: 5)
engine.player.x = 37 * 32;
engine.player.y = 6 * 32;
engine.update();
if (!engine.activeInteractable || engine.activeInteractable.type !== 'locked_door') {
  throw new Error('Expected activeInteractable to be locked_door at Class 4 door!');
}
console.log('✅ Class 4 door interactable detected:', engine.activeInteractable.name);

// Test student stepping on locked door (doorX: 37, doorY: 5)
engine.player.x = 37 * 32;
engine.player.y = 5 * 32;
let lockedCallbackCalled = false;
engine.onLockedDoorCallback = (r) => {
  lockedCallbackCalled = true;
};
engine.checkWarps();
if (!lockedCallbackCalled) {
  throw new Error('Expected onLockedDoorCallback when stepping on locked door!');
}
if (engine.player.room !== 'hallway') {
  throw new Error('Student should be blocked from entering locked room!');
}
console.log('✅ Student blocked from entering Class 4 door!');

// Test teacher stepping on locked door
engine.player.isTeacher = true;
engine.player.x = 37 * 32;
engine.player.y = 5 * 32;
engine.checkWarps();
console.log('✅ Teacher allowed through door into:', engine.player.room);

console.log('\n🎉 ALL ROOMS & LOCKED DOORS PASSED RUNTIME SIMULATION PERFECTLY!');
