// Automated Verification for Staff Office Desk 17 & Store Text Cleanup
const fs = require('fs');
const assert = require('assert');

console.log('🧪 Starting test_staff_office_desk17_store_clean.js...\n');

// 1. Verify index.html & main.js store tip
const indexHtml = fs.readFileSync('public/index.html', 'utf8');
const mainJs = fs.readFileSync('public/js/main.js', 'utf8');
const worldJs = fs.readFileSync('public/js/world.js', 'utf8');
const engineJs = fs.readFileSync('public/js/engine.js', 'utf8');
const serverJs = fs.readFileSync('server.js', 'utf8');
const craftRecipes = fs.readFileSync('data/craft_recipes.json', 'utf8');

// Check 1: Store tip in HTML and main.js
assert.ok(indexHtml.includes('💡 골드로 즉시 완제품 소비품을 구매합니다.</div>'), 'index.html store tip cleaned');
assert.ok(!indexHtml.includes('고급 편의성 골드 소모처'), 'No 고급 편의성 골드 소모처 in index.html');
assert.ok(mainJs.includes("tipText.innerText = '💡 골드로 즉시 완제품 소비품을 구매합니다.';"), 'main.js store tip cleaned');
assert.ok(!mainJs.includes('고급 편의성 골드 소모처'), 'No 고급 편의성 골드 소모처 in main.js');
console.log('✅ Check 1 Passed: Store tip banner cleaned of parenthetical text.');

// Check 2: Teleport scroll description
assert.ok(!mainJs.includes('(농구/풋살/축구장)'), 'No (농구/풋살/축구장) in main.js');
assert.ok(!serverJs.includes('(농구/풋살/축구장)'), 'No (농구/풋살/축구장) in server.js');
assert.ok(!craftRecipes.includes('(농구/풋살/축구장)'), 'No (농구/풋살/축구장) in craft_recipes.json');
assert.ok(mainJs.includes("desc: '사용 시 각 층 복도 및 운동장으로 즉시 순간이동'"), 'STORE_BUY_ITEMS scroll desc updated');
console.log('✅ Check 2 Passed: Teleport scroll description cleaned of (농구/풋살/축구장).');

// Check 3: Staff Office item moved to Seat 17
assert.ok(worldJs.includes('{ id: "quest_library_book_office", type: "quest_library_book_of", x: 57, y: 17.5'), 'quest_library_book_office placed at x: 57, y: 17.5');
assert.ok(!worldJs.includes('x: 73, y: 17.5'), 'Old seat 22 coordinates removed from world.js');
console.log('✅ Check 3 Passed: Staff Office item moved to Desk 17 (x: 57, y: 17.5).');

// Check 4: Quest text in main.js references 17번 연구석
assert.ok(mainJs.includes('6층 교무실 17번 연구석 책상 위에 놓여 있단다.'), 'Quest story references 17번 연구석');
assert.ok(mainJs.includes('6층 교무실 17번 연구석 (과학 잡지)'), 'In-progress story references 17번 연구석');
assert.ok(mainJs.includes("text: '6층 교무실 17번 연구석에서 [과학 잡지] 회수하기'"), 'Objective text references 17번 연구석');
assert.ok(mainJs.includes("placeName: '6층 교무실 17번 연구석'"), 'Book config placeName references 17번 연구석');
console.log('✅ Check 4 Passed: Library book quest narrative updated to Desk 17.');

// Check 5: Max interaction distance for library book
assert.ok(engineJs.includes("item.type === 'quest_library_book_of') ? 80 : 64;"), 'Library book interaction distance expanded to 80px');
console.log('✅ Check 5 Passed: Library book interaction range comfortable (80px).');

console.log('\n🎉 ALL STAFF OFFICE DESK 17 & STORE TEXT VERIFICATIONS PASSED!');
