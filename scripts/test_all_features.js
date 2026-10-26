const fs = require('fs');
const vm = require('vm');

console.log('--- TEST: Verifying All New Implementations ---');

// 1. Check WORLD_DATA in world.js
const worldCode = fs.readFileSync('public/js/world.js', 'utf8');
const worldCtx = { window: {} };
vm.createContext(worldCtx);
vm.runInContext(worldCode + '; window.WORLD_DATA = WORLD_DATA;', worldCtx);

const fl7 = worldCtx.window.WORLD_DATA.floors[7];
const devNote = fl7.interactive.find(i => i.id === 'note_developer_hallway');
const purifier = fl7.interactive.find(i => i.id === 'water_purifier_hallway');
const mirror = fl7.interactive.find(i => i.id === 'mirror_hallway');

console.log('1. world.js interactive objects:');
console.log('   - Purifier at x:', purifier ? purifier.x : 'missing', 'y:', purifier ? purifier.y : '');
console.log('   - Dev Note at x:', devNote ? devNote.x : 'missing', 'y:', devNote ? devNote.y : '');
console.log('   - Mirror at x:', mirror ? mirror.x : 'missing', 'y:', mirror ? mirror.y : '');

if (!devNote || devNote.x !== 50 || devNote.y !== 17) {
  throw new Error('note_developer_hallway is missing or invalid position!');
}
if (!(purifier.x < devNote.x && devNote.x < mirror.x)) {
  throw new Error('devNote is not between purifier and mirror!');
}
console.log('   => Dev note correctly positioned between purifier and mirror!');

// 2. Check engine.js syntax and key methods
const engineCode = fs.readFileSync('public/js/engine.js', 'utf8');
new vm.Script(engineCode); // check syntax
console.log('2. engine.js syntax is valid.');

if (!engineCode.includes('drawPeacefulBossChamber')) {
  throw new Error('drawPeacefulBossChamber missing in engine.js');
}
if (!engineCode.includes('drawHighResDevNote')) {
  throw new Error('drawHighResDevNote missing in engine.js');
}
if (!engineCode.includes("obj.type === 'dev_note'")) {
  throw new Error("obj.type === 'dev_note' missing in renderFloor");
}
console.log('   => engine.js boss toggle and dev_note rendering verified!');

// 3. Check main.js syntax and key handlers
const mainCode = fs.readFileSync('public/js/main.js', 'utf8');
new vm.Script(mainCode); // check syntax
console.log('3. main.js syntax is valid.');

if (!mainCode.includes('handleDevNoteInteraction')) {
  throw new Error('handleDevNoteInteraction missing in main.js');
}
if (!mainCode.includes('cooldownMs = 10 * 60 * 1000')) {
  throw new Error('10-minute cooldown logic missing in main.js');
}
if (!mainCode.includes("e.key === 'Shift' || e.key === 'b' || e.key === 'B'")) {
  throw new Error('Shift & B dash keys missing in main.js');
}
console.log('   => main.js 10-minute cooldown and dev note handler verified!');

// 4. Check index.html and style.css
const html = fs.readFileSync('public/index.html', 'utf8');
if (!html.includes('<span class="btn-letter">SHIFT</span>')) {
  throw new Error('SHIFT label missing in index.html');
}
if (!html.includes('v=45')) {
  throw new Error('Cache version v=45 missing in index.html');
}
console.log('4. index.html SHIFT button and v=45 cache bump verified!');

const css = fs.readFileSync('public/css/style.css', 'utf8');
if (!css.includes('.btn-b .btn-letter')) {
  throw new Error('.btn-b .btn-letter missing in style.css');
}
console.log('5. style.css .btn-b .btn-letter styling verified!');

console.log('\n🌟 ALL 4 USER REQUIREMENTS VERIFIED SUCCESSFULLY!');
