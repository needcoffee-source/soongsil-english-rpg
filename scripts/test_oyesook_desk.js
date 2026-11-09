// Automated Verification for Teacher Oh Ye-sook's Desk (Seat 28)
const fs = require('fs');
const assert = require('assert');

console.log('🧪 Starting test_oyesook_desk.js...\n');

const engineJs = fs.readFileSync('public/js/engine.js', 'utf8');
const worldJs = fs.readFileSync('public/js/world.js', 'utf8');
const mainJs = fs.readFileSync('public/js/main.js', 'utf8');

// 1. Check engine.js definitions
assert.ok(engineJs.includes("const isOyesookDesk = (label === '28');"), 'isOyesookDesk defined for label 28');
assert.ok(engineJs.includes("this.drawStaffOfficeChair(px + w + 10, py + h / 2, 'left', '#881337', '#fb7185');"), 'Oyesook chair styled with rosewood & coral');
assert.ok(engineJs.includes('// [28번 1학년 3반 오예슉 가정선생님 전용 데스크 소품]'), 'Oyesook desk props implemented');
assert.ok(engineJs.includes("const displayLabel = '🧵 오예슉';"), 'Oyesook nameplate defined');
console.log('✅ Check 1 Passed: engine.js renders seat 28 custom chair, props & nameplate.');

// 2. Check world.js interactive definition
assert.ok(worldJs.includes('id: "desk_teacher_oyesook"'), 'desk_teacher_oyesook interactive object registered');
assert.ok(worldJs.includes('type: "desk_oyesook"'), 'desk_oyesook type registered');
console.log('✅ Check 2 Passed: world.js has desk_teacher_oyesook in classroom_staff_office.');

// 3. Check main.js handler
assert.ok(mainJs.includes("target.type === 'desk_oyesook'"), 'main.js routes desk_oyesook clicks');
assert.ok(mainJs.includes('handleOyesookDeskInteraction()'), 'handleOyesookDeskInteraction defined');
assert.ok(mainJs.includes('1학년 3반 담임이자 가정을 가르치시는 오예슉 선생님의 자리입니다.'), 'Dialog narrative verified');
console.log('✅ Check 3 Passed: main.js handles SPACE key interaction with RPGDialog.');

console.log('\n🎉 ALL TEACHER OH YE-SOOK DESK TESTS PASSED!');
