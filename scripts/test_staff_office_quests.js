const fs = require('fs');
const assert = require('assert');
const path = require('path');

console.log('=== VERIFYING ALL 4 STAFF OFFICE TEACHERS & QUESTS ===');

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

// Test Kim Jin-mui (김진믜)
const kimjinmui = office.npcs.find(n => n.id === 'npc_teacher_kimmijin');
assert(kimjinmui, 'Kim Jin-mui NPC must exist');
assert.strictEqual(kimjinmui.name, '김진믜 선생님', 'Teacher name must be 김진믜 선생님');
assert.strictEqual(kimjinmui.seatId, 15);
assert.strictEqual(kimjinmui.role, '미술');
assert.strictEqual(kimjinmui.avatar, 'teacher');
assert.strictEqual(kimjinmui.x, 55.1875);
assert.strictEqual(kimjinmui.y, 15.4375);
assert.strictEqual(kimjinmui.questId, 'quest_kimmijin_art');
console.log('✔ 3. Kim Jin-mui verified (Seat 15, name: "김진믜 선생님", role: "미술", coords: (55.1875, 15.4375), avatar: "teacher")');

// Test Yo Sun-yu (요션유 - 정보)
const yosunyu = office.npcs.find(n => n.id === 'npc_teacher_yosunyu');
assert(yosunyu, 'Yo Sun-yu NPC must exist');
assert.strictEqual(yosunyu.seatId, 18);
assert.strictEqual(yosunyu.role, '정보', 'Yo Sun-yu role must be 정보');
assert.strictEqual(yosunyu.avatar, 'teacher');
assert.strictEqual(yosunyu.x, 61.3125);
assert.strictEqual(yosunyu.y, 17.5625);
assert.strictEqual(yosunyu.questId, 'quest_yosunyu_info');
console.log('✔ 4. Yo Sun-yu verified (Seat 18, role: "정보", coords: (61.3125, 17.5625), avatar: "teacher")');

// Test Interactive objects in staff office
const memo = office.interactive.find(i => i.id === 'quest_joshua_memo');
assert(memo && memo.x === 48 && memo.y === 4, 'Joshua memo must be in pantry at (48, 4)');

const textbook = office.interactive.find(i => i.id === 'quest_okchohan_textbook');
assert(textbook, 'Ok Cho-han textbook must exist');
assert.strictEqual(textbook.x, 42, 'Textbook must be inside printing room at x=42');
assert.strictEqual(textbook.y, 8, 'Textbook must be inside printing room at y=8');
console.log('✔ 5. Ok Cho-han textbook in printing room (x: 42, y: 8) verified');

const officeSketchbook = office.interactive.find(i => i.id === 'quest_kimmijin_sketchbook');
assert(!officeSketchbook, 'Sketchbook must no longer be in staff office');
const pgSketchbook = w.playground.sketchbook;
assert(pgSketchbook, 'Kim Jin-mui sketchbook must exist in playground');
assert.strictEqual(pgSketchbook.x, 24, 'Sketchbook must be to the left of the bench at x=24');
assert.strictEqual(pgSketchbook.y, 16, 'Sketchbook must be at y=16');
console.log('✔ 6. Kim Jin-mui sketchbook on playground bench left (x: 24, y: 16) verified');

const officeUsb = office.interactive.find(i => i.id === 'quest_yosunyu_usb');
assert(!officeUsb, 'Yo Sun-yu algorithm USB must no longer be in staff office');
const cr702 = w.classroom_702;
assert(cr702, 'classroom_702 must exist');
const usb702 = cr702.interactive && cr702.interactive.find(i => i.id === 'quest_yosunyu_usb');
assert(usb702, 'Yo Sun-yu algorithm USB must exist in classroom_702');
assert.strictEqual(usb702.x, 2, 'USB must be at corner x=2');
assert.strictEqual(usb702.y, 4, 'USB must be at corner y=4');
console.log('✔ 7. Yo Sun-yu algorithm USB in 1-2 classroom corner (x: 2, y: 4) verified');

// 2. Check main.js and server.js item catalog sync
const mainCode = fs.readFileSync(path.join(__dirname, '../public/js/main.js'), 'utf8');
const serverCode = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');

assert(mainCode.includes('item_kimmijin_sketchbook'), 'main.js must define item_kimmijin_sketchbook');
assert(serverCode.includes('item_kimmijin_sketchbook'), 'server.js must define item_kimmijin_sketchbook');
assert(mainCode.includes('김진믜의 풍경화 스케치북'), 'main.js must define 김진믜의 풍경화 스케치북');
assert(serverCode.includes('김진믜의 풍경화 스케치북'), 'server.js must define 김진믜의 풍경화 스케치북');
assert(mainCode.includes('item_yosunyu_usb'), 'main.js must define item_yosunyu_usb');
assert(serverCode.includes('item_yosunyu_usb'), 'server.js must define item_yosunyu_usb');
console.log('✔ 8. item_kimmijin_sketchbook (김진믜) & item_yosunyu_usb synced between main.js and server.js');

// 3. Check Ok Cho-han reward values (item_bronze_heart, 100G, 100EXP)
assert(mainCode.includes("itemKey: 'item_bronze_heart'"), 'Ok Cho-han must grant item_bronze_heart');
assert(mainCode.includes("amount: 100, label: '🪙 100 G (골드)'"), 'Rewards must have 100 G');
assert(mainCode.includes("amount: 100, label: '🌟 100 EXP (경험치)'"), 'Rewards must have 100 EXP');
console.log('✔ 9. Ok Cho-han rewards (Bronze Heart x1, 100 G, 100 EXP) verified');

// 4. Check Kim Jin-mui quest definition and rewards in main.js
assert(mainCode.includes('quest_kimmijin_art'), 'main.js must define quest_kimmijin_art');
assert(mainCode.includes('김진믜 선생님'), 'main.js must reference 김진믜 선생님');
const kimQuestSnippet = mainCode.slice(mainCode.indexOf("id: 'quest_kimmijin_art'"), mainCode.indexOf("id: 'quest_yosunyu_info'"));
assert(kimQuestSnippet.includes("itemKey: 'item_forsythia'"), 'quest_kimmijin_art must reward forsythia petals');
assert(kimQuestSnippet.includes("label: '🌼 노란 개나리 꽃잎 x3개'"), 'quest_kimmijin_art must reward 3 forsythia petals');
assert(!kimQuestSnippet.includes('equip_forsythia_ring'), 'quest_kimmijin_art must no longer reward forsythia ring');
console.log('✔ 10. quest_kimmijin_art (김진믜) definition and rewards (Forsythia Petals x3, 100 G, 100 EXP) verified');

// 5. Check Yo Sun-yu quest definition and rewards in main.js
assert(mainCode.includes('quest_yosunyu_info'), 'main.js must define quest_yosunyu_info');
const yoQuestSnippet = mainCode.slice(mainCode.indexOf("id: 'quest_yosunyu_info'"), mainCode.indexOf('class MainApp'));
assert(yoQuestSnippet.includes("teacherRole: '정보'"), 'Yo Sun-yu role must be 정보');
assert(!yoQuestSnippet.includes("itemKey: 'item_ginkgo'"), 'quest_yosunyu_info must no longer reward ginkgo leaves');
assert(yoQuestSnippet.includes("amount: 100, label: '🪙 100 G (골드)'"), 'quest_yosunyu_info must reward 100 G');
assert(yoQuestSnippet.includes("amount: 200, label: '🌟 200 EXP (경험치)'"), 'quest_yosunyu_info must reward 200 EXP');
console.log('✔ 11. quest_yosunyu_info (정보) definition and rewards (No Ginkgo, 100 G, 200 EXP) verified');

console.log('\n=== ALL STAFF OFFICE TEACHER TESTS PASSED SUCCESSFULLY! ===');
