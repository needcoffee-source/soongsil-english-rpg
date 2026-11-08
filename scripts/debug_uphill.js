const fs = require('fs');

global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

const mockCtx = {
  save: () => {}, restore: () => {}, scale: () => {}, translate: () => {}, rotate: () => {},
  beginPath: () => {}, closePath: () => {}, moveTo: () => {}, lineTo: () => {},
  arc: () => {}, fill: () => {}, stroke: () => {}, fillRect: () => {}, strokeRect: () => {}, clearRect: () => {},
  fillText: () => {}, strokeText: () => {}, measureText: () => ({ width: 10 }),
  ellipse: () => {}, roundRect: () => {}, rect: () => {}
};

global.document = {
  readyState: 'complete',
  addEventListener: () => {},
  getElementById: (id) => ({
    id,
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    addEventListener: () => {},
    style: {},
    innerText: '',
    innerHTML: '',
    getContext: () => mockCtx,
    width: 480,
    height: 500
  })
};

global.performance = { now: () => Date.now() };
global.requestAnimationFrame = (cb) => {
  // simulate rAF
};

require('../public/js/uphill_rush.js');
const game = window.UphillRush;

console.log('--- TEST 1: Normal 100 frames ---');
game.startGame();
for (let i = 0; i < 100; i++) {
  game.update(0.016);
  game.render();
}
console.log('Passed 100 frames. Traveled:', game.traveled);

console.log('--- TEST 2: Jump and Steer ---');
game.triggerJump();
game.keys.left = true;
game.keys.boost = true;
for (let i = 0; i < 50; i++) {
  game.update(0.016);
  game.render();
}
game.keys.left = false;
game.keys.right = true;
for (let i = 0; i < 50; i++) {
  game.update(0.016);
  game.render();
}
console.log('Passed Jump and Steer.');

console.log('--- TEST 3: Obstacle hits and game over ---');
game.handlePlayerHit({ type: 'barrel' });
game.handlePlayerHit({ type: 'tire' });
game.handlePlayerHit({ type: 'soccer' });
console.log('Passed Game Over.');

console.log('--- TEST 4: Finish line (2500m) ---');
game.startGame();
game.traveled = 2480;
for (let i = 0; i < 30; i++) {
  game.update(0.016);
  game.render();
}
console.log('Passed finishGame. isRunning:', game.isRunning);
console.log('ALL TESTS COMPLETED WITHOUT ERROR!');
