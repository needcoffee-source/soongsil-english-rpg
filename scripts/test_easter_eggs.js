const fs = require('fs');

// Verify world.js definitions
const worldCode = fs.readFileSync('public/js/world.js', 'utf8');
const vm = require('vm');
const sandbox = { window: {}, console: console };
vm.createContext(sandbox);
vm.runInContext(worldCode, sandbox);

const WORLD_DATA = vm.runInContext('(typeof WORLD_DATA !== "undefined" ? WORLD_DATA : window.WORLD_DATA)', sandbox);

console.log('1. Verifying WORLD_DATA definitions...');
const hallwayMirror = WORLD_DATA.floors[7].interactive.find(i => i.type === 'mirror');
if (!hallwayMirror) throw new Error('Hallway mirror not found in floors[7].interactive');
if (hallwayMirror.x !== 56 || hallwayMirror.y !== 16) {
  throw new Error(`Mirror position unexpected: expected (56, 16), got (${hallwayMirror.x}, ${hallwayMirror.y})`);
}
console.log(' - Hallway mirror (at 56, 16):', hallwayMirror);

const pgLostBox = WORLD_DATA.playground.lostBox;
if (!pgLostBox) throw new Error('Playground lost box not found in playground.lostBox');
console.log(' - Playground lost box:', pgLostBox);

// Verify main.js interaction logic and rewards
console.log('\n2. Verifying main.js Easter egg handlers...');
const mainCode = fs.readFileSync('public/js/main.js', 'utf8');

if (!mainCode.includes("handleMirrorInteraction()")) {
  throw new Error('handleMirrorInteraction() missing in main.js');
}
if (!mainCode.includes("handleLostBoxInteraction()")) {
  throw new Error('handleLostBoxInteraction() missing in main.js');
}

// Check rewards
// Mirror: 20G, 20 EXP
if (!mainCode.includes("this.addGold(20)") || !mainCode.includes("this.addExp(20)")) {
  throw new Error('Mirror rewards (20G, 20 EXP) not found in main.js');
}
// Lost box: 50G, 30 EXP, 2 orange, 2 red
if (!mainCode.includes("this.addGold(50)") || !mainCode.includes("this.addExp(30)")) {
  throw new Error('Lost box gold/exp rewards (50G, 30 EXP) not found in main.js');
}
if (!mainCode.includes("'item_orange_potion', '주홍 물약', 2") || !mainCode.includes("'item_red_potion', '빨간 물약', 2")) {
  throw new Error('Lost box potion rewards (2 orange, 2 red) not found in main.js');
}

console.log(' - Mirror reward logic: 20 Gold, 20 EXP verified.');
console.log(' - Lost Box reward logic: 50 Gold, 30 EXP, 2 Orange Potions, 2 Red Potions verified.');
console.log('\n🎉 ALL EASTER EGG SPECS VERIFIED SUCCESSFULLY!');
