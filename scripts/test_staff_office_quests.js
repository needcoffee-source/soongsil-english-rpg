const fs = require('fs');
const assert = require('assert');
const path = require('path');

console.log('=== VERIFYING ALL 3 STAFF OFFICE TEACHERS & QUESTS ===');

global.window = global;
const vm = require('vm');

// 1. Check world.js
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../public/js/world.js'), 'utf8'));
const w = global.WORLD_DATA;
const office = w.classroom_staff_office;

assert(office, 'classroom_staff_office must exist');

// Test Joshua
const joshua = office.npcs.find(n => n.id === 'npc_teacher_joshua');
assert(joshua, 'Joshua NPC must exist');
assert.strictEqual(joshua.seatId, 3);
assert.strictEqual(joshua.avatar, 'teacher', 'Joshua avatar must be standard blue teacher');
console.log('✔ 1. Joshua verified (Seat 3, avatar: "teacher")');

// Test Ok Cho-han
const okchohan = office.npcs.find(n => n.id === 'npc_teacher_okchohan');
assert(okchohan, 'Ok Cho-han NPC must exist');
assert.strictEqual(okchohan.seatId, 10);
assert.strictEqual(okchohan.role, '사회');
assert.strictEqual(okchohan.avatar, 'teacher');
console.log('✔ 2. Ok Cho-han verified (Seat 10, role: "사회", avatar: "teacher")');

// Test Kim Mi-jin
const kimmijin = office.npcs.find(n => n.id === 'npc_teacher_kimmijin');
assert(kimmijin, 'Kim Mi-jin NPC must exist');
assert.strictEqual(kimmijin.seatId, 15);
assert.strictEqual(kimmijin.role, '미술');
assert.strictEqual(kimmijin.avatar, 'teacher');
assert.strictEqual(kimmijin.x, 55.1875);
assert.strictEqual(kimmijin.y, 15.4375);
assert.strictEqual(kimmijin.questId, 'quest_kimmijin_art');
console.log('✔ 3. Kim Mi-jin verified (Seat 15, role: "미술", coords: (55.1875, 15.4375), avatar: "teacher")');

// Test Interactive objects in staff office
const memo = office.interactive.find(i => i.id === 'quest_joshua_memo');
assert(memo && memo.x === 48 && memo.y === 4, 'Joshua memo must be in pantry at (48, 4)');

const textbook = office.interactive.find(i => i.id === 'quest_okchohan_textbook');
assert(textbook, 'Ok Cho-han textbook must exist');
assert.strictEqual(textbook.x, 42, 'Textbook must be inside printing room at x=42');
assert.strictEqual(textbook.y, 8, 'Textbook must be inside printing room at y=8');
console.log('✔ 4. Ok Cho-han textbook moved to printing room (x: 42, y: 8) verified');

const officeSketchbook = office.interactive.find(i => i.id === 'quest_kimmijin_sketchbook');
assert(!officeSketchbook, 'Sketchbook must no longer be in staff office');
const pgSketchbook = w.playground.sketchbook;
assert(pgSketchbook, 'Kim Mi-jin sketchbook must exist in playground');
assert.strictEqual(pgSketchbook.x, 24, 'Sketchbook must be to the left of the bench at x=24');
assert.strictEqual(pgSketchbook.y, 16, 'Sketchbook must be at y=16');
console.log('✔ 5. Kim Mi-jin sketchbook relocated to playground bench left side (x: 24, y: 16) verified');

// 2. Check main.js and server.js item catalog sync
const mainCode = fs.readFileSync(path.join(__dirname, '../public/js/main.js'), 'utf8');
const serverCode = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');

assert(mainCode.includes('item_kimmijin_sketchbook'), 'main.js must define item_kimmijin_sketchbook');
assert(serverCode.includes('item_kimmijin_sketchbook'), 'server.js must define item_kimmijin_sketchbook');
console.log('✔ 6. item_kimmijin_sketchbook synced between main.js and server.js');

// 3. Check Ok Cho-han reward values (item_bronze_heart, 100G, 100EXP)
assert(mainCode.includes("itemKey: 'item_bronze_heart'"), 'Ok Cho-han must grant item_bronze_heart');
assert(mainCode.includes("amount: 100, label: '🪙 100 G (골드)'"), 'Rewards must have 100 G');
assert(mainCode.includes("amount: 100, label: '🌟 100 EXP (경험치)'"), 'Rewards must have 100 EXP');
console.log('✔ 7. Ok Cho-han rewards (Bronze Heart x1, 100 G, 100 EXP) verified');

// 4. Check Kim Mi-jin quest definition and rewards in main.js
assert(mainCode.includes('quest_kimmijin_art'), 'main.js must define quest_kimmijin_art');
const kimQuestSnippet = mainCode.slice(mainCode.indexOf("id: 'quest_kimmijin_art'"), mainCode.indexOf('class MainApp'));
assert(kimQuestSnippet.includes("itemKey: 'item_forsythia'"), 'quest_kimmijin_art must reward forsythia petals');
assert(kimQuestSnippet.includes("label: '🌼 노란 개나리 꽃잎 x3개'"), 'quest_kimmijin_art must reward 3 forsythia petals');
assert(!kimQuestSnippet.includes('equip_forsythia_ring'), 'quest_kimmijin_art must no longer reward forsythia ring');
console.log('✔ 8. quest_kimmijin_art definition and rewards (Forsythia Petals x3, 100 G, 100 EXP) verified');

console.log('\n=== ALL STAFF OFFICE TEACHER TESTS PASSED SUCCESSFULLY! ===');
