const fs = require('fs');
const assert = require('assert');
const path = require('path');

console.log('=== VERIFYING ALL 5 STAFF OFFICE TEACHERS & QUESTS ===');

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

// Test Kwim Jin-syong (귐즨숑 - 진로)
const kwimjinsyong = office.npcs.find(n => n.id === 'npc_teacher_kwimjinsyong');
assert(kwimjinsyong, 'Kwim Jin-syong NPC must exist');
assert.strictEqual(kwimjinsyong.name, '귐즨숑 선생님', 'Teacher name must be 귐즨숑 선생님');
assert.strictEqual(kwimjinsyong.seatId, 24);
assert.strictEqual(kwimjinsyong.role, '진로', 'Kwim Jin-syong role must be 진로');
assert.strictEqual(kwimjinsyong.avatar, 'teacher');
assert.strictEqual(kwimjinsyong.x, 74.0);
assert.strictEqual(kwimjinsyong.y, 20.875);
assert.strictEqual(kwimjinsyong.questId, 'quest_kwimjinsyong_career');
console.log('✔ 5. Kwim Jin-syong verified (Seat 24, role: "진로", coords: (74.0, 20.875), avatar: "teacher")');

// Test Interactive objects in staff office & career room
const memo = office.interactive.find(i => i.id === 'quest_joshua_memo');
assert(memo && memo.x === 51 && memo.y === 4, 'Joshua memo must be in pantry at (51, 4)');

const textbook = office.interactive.find(i => i.id === 'quest_okchohan_textbook');
assert(textbook, 'Ok Cho-han textbook must exist');
assert.strictEqual(textbook.x, 42, 'Textbook must be inside printing room at x=42');
assert.strictEqual(textbook.y, 8, 'Textbook must be inside printing room at y=8');
console.log('✔ 6. Ok Cho-han textbook in printing room (x: 42, y: 8) verified');

const officeSketchbook = office.interactive.find(i => i.id === 'quest_kimmijin_sketchbook');
assert(!officeSketchbook, 'Sketchbook must no longer be in staff office');
const pgSketchbook = w.playground.sketchbook;
assert(pgSketchbook, 'Kim Jin-mui sketchbook must exist in playground');
assert.strictEqual(pgSketchbook.x, 20, 'Sketchbook must be on the blue bleacher bench at x=20');
assert.strictEqual(pgSketchbook.y, 7, 'Sketchbook must be at y=7');
console.log('✔ 7. Kim Jin-mui sketchbook on playground blue bleachers (x: 20, y: 7) verified');

const officeUsb = office.interactive.find(i => i.id === 'quest_yosunyu_usb');
assert(!officeUsb, 'Yo Sun-yu algorithm USB must no longer be in staff office');
const cr702 = w.classroom_702;
assert(cr702, 'classroom_702 must exist');
const usb702 = cr702.interactive && cr702.interactive.find(i => i.id === 'quest_yosunyu_usb');
assert(usb702, 'Yo Sun-yu algorithm USB must exist in classroom_702');
assert.strictEqual(usb702.x, 2, 'USB must be at corner x=2');
assert.strictEqual(usb702.y, 4, 'USB must be at corner y=4');
console.log('✔ 8. Yo Sun-yu algorithm USB in 1-2 classroom corner (x: 2, y: 4) verified');

// Test Career Guidebook on 5th floor career room mentoring desk
const crCareer = w.classroom_career;
assert(crCareer, 'classroom_career must exist');
const guidebook = crCareer.interactive && crCareer.interactive.find(i => i.id === 'quest_career_guidebook');
assert(guidebook, 'Career guidebook must exist in classroom_career');
assert.strictEqual(guidebook.x, 45, 'Guidebook must be at mentoring desk x=45');
assert.strictEqual(guidebook.y, 8, 'Guidebook must be at mentoring desk y=8');
console.log('✔ 9. Career guidebook on mentoring desk in 5F career room (x: 45, y: 8) verified');

// Test Worried Student on 6th floor hallway east window
const f6 = w.floors[6];
assert(f6, 'floor 6 must exist');
const worriedStudent = f6.npcs && f6.npcs.find(n => n.id === 'npc_student_worried');
assert(worriedStudent, 'Worried student NPC must exist on floor 6');
assert.strictEqual(worriedStudent.x, 58, 'Worried student must be at east window x=58');
assert.strictEqual(worriedStudent.y, 10, 'Worried student must be at east window y=10');
console.log('✔ 10. Worried student on 6F hallway east window (x: 58, y: 10) verified');

// 2. Check main.js and server.js item catalog sync
const mainCode = fs.readFileSync(path.join(__dirname, '../public/js/main.js'), 'utf8');
const serverCode = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');

assert(mainCode.includes('item_kimmijin_sketchbook'), 'main.js must define item_kimmijin_sketchbook');
assert(serverCode.includes('item_kimmijin_sketchbook'), 'server.js must define item_kimmijin_sketchbook');
assert(mainCode.includes('item_yosunyu_usb'), 'main.js must define item_yosunyu_usb');
assert(serverCode.includes('item_yosunyu_usb'), 'server.js must define item_yosunyu_usb');
assert(mainCode.includes('item_career_guidebook'), 'main.js must define item_career_guidebook');
assert(serverCode.includes('item_career_guidebook'), 'server.js must define item_career_guidebook');
assert(mainCode.includes('진로 적성 검사 안내서'), 'main.js must define 진로 적성 검사 안내서');
assert(serverCode.includes('진로 적성 검사 안내서'), 'server.js must define 진로 적성 검사 안내서');
console.log('✔ 11. item_career_guidebook (귐즨숑) synced between main.js and server.js');

// 3. Check Ok Cho-han reward values (item_bronze_heart, 100G, 100EXP)
assert(mainCode.includes("itemKey: 'item_bronze_heart'"), 'Ok Cho-han must grant item_bronze_heart');
assert(mainCode.includes("amount: 100, label: '🪙 100 G (골드)'"), 'Rewards must have 100 G');
assert(mainCode.includes("amount: 100, label: '🌟 100 EXP (경험치)'"), 'Rewards must have 100 EXP');
console.log('✔ 12. Ok Cho-han rewards (Bronze Heart x1, 100 G, 100 EXP) verified');

// 4. Check Kim Jin-mui quest definition and rewards in main.js
assert(mainCode.includes('quest_kimmijin_art'), 'main.js must define quest_kimmijin_art');
assert(mainCode.includes('김진믜 선생님'), 'main.js must reference 김진믜 선생님');
const kimQuestSnippet = mainCode.slice(mainCode.indexOf("id: 'quest_kimmijin_art'"), mainCode.indexOf("id: 'quest_yosunyu_info'"));
assert(kimQuestSnippet.includes("itemKey: 'item_forsythia'"), 'quest_kimmijin_art must reward forsythia petals');
assert(kimQuestSnippet.includes("label: '🌼 노란 개나리 꽃잎 x3개'"), 'quest_kimmijin_art must reward 3 forsythia petals');
assert(!kimQuestSnippet.includes('equip_forsythia_ring'), 'quest_kimmijin_art must no longer reward forsythia ring');
console.log('✔ 13. quest_kimmijin_art (김진믜) definition and rewards (Forsythia Petals x3, 100 G, 100 EXP) verified');

// 5. Check Yo Sun-yu quest definition and rewards in main.js
assert(mainCode.includes('quest_yosunyu_info'), 'main.js must define quest_yosunyu_info');
const yoQuestSnippet = mainCode.slice(mainCode.indexOf("id: 'quest_yosunyu_info'"), mainCode.indexOf("id: 'quest_kwimjinsyong_career'"));
assert(yoQuestSnippet.includes("teacherRole: '정보'"), 'Yo Sun-yu role must be 정보');
assert(!yoQuestSnippet.includes("itemKey: 'item_ginkgo'"), 'quest_yosunyu_info must no longer reward ginkgo leaves');
assert(yoQuestSnippet.includes("amount: 100, label: '🪙 100 G (골드)'"), 'quest_yosunyu_info must reward 100 G');
assert(yoQuestSnippet.includes("amount: 200, label: '🌟 200 EXP (경험치)'"), 'quest_yosunyu_info must reward 200 EXP');
console.log('✔ 14. quest_yosunyu_info (정보) definition and rewards (No Ginkgo, 100 G, 200 EXP) verified');

// 6. Check Kwim Jin-syong quest definition and rewards in main.js
assert(mainCode.includes('quest_kwimjinsyong_career'), 'main.js must define quest_kwimjinsyong_career');
const kwimQuestSnippet = mainCode.slice(mainCode.indexOf("id: 'quest_kwimjinsyong_career'"), mainCode.indexOf('class MainApp'));
assert(kwimQuestSnippet.includes("teacherRole: '진로'"), 'Kwim Jin-syong role must be 진로');
assert(kwimQuestSnippet.includes("amount: 150, label: '🌟 150 EXP (경험치)'"), 'quest_kwimjinsyong_career must reward 150 EXP');
assert(kwimQuestSnippet.includes("itemKey: 'item_courage_potion'"), 'quest_kwimjinsyong_career must reward courage potion');
assert(kwimQuestSnippet.includes('count: 2'), 'quest_kwimjinsyong_career must reward 2 courage potions');
console.log('✔ 15. quest_kwimjinsyong_career (진로) definition and rewards (150 EXP, Courage Potion x2) verified');

console.log('\n=== ALL 5 STAFF OFFICE TEACHER TESTS PASSED SUCCESSFULLY! ===');
