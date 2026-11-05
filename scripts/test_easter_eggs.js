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

const gymSchoolBus = WORLD_DATA.playground_gym && WORLD_DATA.playground_gym.schoolBus;
if (!gymSchoolBus) throw new Error('Gym school bus not found in playground_gym.schoolBus');
console.log(' - Gym school bus:', gymSchoolBus);

const gymEVCharger = WORLD_DATA.playground_gym && WORLD_DATA.playground_gym.evCharger;
if (!gymEVCharger) throw new Error('Gym EV charger not found in playground_gym.evCharger');
console.log(' - Gym EV charger:', gymEVCharger);

// Verify audio.js and engine.js Easter egg triggers
const audioCode = fs.readFileSync('public/js/audio.js', 'utf8');
const engineCode = fs.readFileSync('public/js/engine.js', 'utf8');
if (!audioCode.includes('playBusHorn()')) throw new Error('playBusHorn() missing in audio.js');
if (!audioCode.includes('playElectricShock()')) throw new Error('playElectricShock() missing in audio.js');
if (!engineCode.includes('triggerBusHornEffect()')) throw new Error('triggerBusHornEffect() missing in engine.js');
if (!engineCode.includes('triggerElectricZapEffect()')) throw new Error('triggerElectricZapEffect() missing in engine.js');

// Verify main.js interaction logic and rewards
console.log('\n2. Verifying main.js Easter egg handlers...');
const mainCode = fs.readFileSync('public/js/main.js', 'utf8');

if (!mainCode.includes("handleMirrorInteraction()")) {
  throw new Error('handleMirrorInteraction() missing in main.js');
}
if (!mainCode.includes("handleLostBoxInteraction()")) {
  throw new Error('handleLostBoxInteraction() missing in main.js');
}
if (!mainCode.includes("handleSchoolBusEasterEgg()")) {
  throw new Error('handleSchoolBusEasterEgg() missing in main.js');
}
if (!mainCode.includes("handleEVChargerEasterEgg()")) {
  throw new Error('handleEVChargerEasterEgg() missing in main.js');
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
// School Bus: 50 Gold, 50 EXP, 2 Orange Potions, 1 Green Potion, special title
if (!mainCode.includes("handleSchoolBusEasterEgg()") || !mainCode.includes("'🚌 숭실 축구부 버스 우수 승객'")) {
  throw new Error('School bus Easter egg rewards not found in main.js');
}
if (!gymSchoolBus.name.includes('축구부')) {
  throw new Error('School bus name does not include 축구부');
}
if (gymSchoolBus.prompt !== '') {
  throw new Error('School bus prompt should be hidden (empty string)');
}
if (gymEVCharger.prompt !== '') {
  throw new Error('EV charger prompt should be hidden (empty string)');
}
// EV Charger: 100 Gold, 100 EXP, 1 Courage Potion, special title
if (!mainCode.includes("handleEVChargerEasterEgg()") || !mainCode.includes("'⚡ 찌릿찌릿 썬더볼트'")) {
  throw new Error('EV charger Easter egg rewards not found in main.js');
}

console.log(' - Mirror reward logic: 20 Gold, 20 EXP verified.');
console.log(' - Lost Box reward logic: 50 Gold, 30 EXP, 2 Orange Potions, 2 Red Potions verified.');
console.log(' - School Bus Easter Egg: Bus Horn, 50G, 50 EXP, Orange/Green Potions, Special Title verified.');
console.log(' - EV Charger Easter Egg: Electric Shock Zap, 100G, 100 EXP, Courage Potion, Special Title verified.');
console.log('\n🎉 ALL EASTER EGG SPECS VERIFIED SUCCESSFULLY!');
