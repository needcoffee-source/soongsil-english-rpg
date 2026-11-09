// Automated Verification for 1-3 Classroom Teacher Oh Ye-sook
const fs = require('fs');
const assert = require('assert');

console.log('🧪 Starting test_classroom_703_oyesook.js...\n');

const worldJs = fs.readFileSync('public/js/world.js', 'utf8');
const engineJs = fs.readFileSync('public/js/engine.js', 'utf8');
const mainJs = fs.readFileSync('public/js/main.js', 'utf8');

// 1. world.js checks
assert.ok(worldJs.includes('name: "오예슉 선생님"'), '1-3 NPC teacher name is 오예슉 선생님');
assert.ok(worldJs.includes('role: "1학년 3반 담임 / 가정"'), '1-3 NPC teacher role is 1학년 3반 담임 / 가정');
assert.ok(worldJs.includes('1학년 3반 담임이자 가정을 가르치는 오예슉 선생님이란다.'), '1-3 NPC teacher dialogue updated');
assert.ok(worldJs.includes('name: "1학년 3반 전광판"'), '1-3 blackboard renamed to 1학년 3반 전광판');
console.log('✅ Check 1 Passed: world.js 1-3 classroom teacher & blackboard verified.');

// 2. engine.js checks
assert.ok(engineJs.includes("const isOyesook = (npc.id === 'npc_teacher_computer' || (npc.name && (npc.name.includes('오예슉') || npc.name.includes('오예숙'))));"), 'engine.js detects isOyesook');
assert.ok(engineJs.includes('// 🧵 가정 오예슉 선생님 전용 코랄 로즈 & 에이프런 스프라이트'), 'engine.js renders dedicated coral rose & apron sprite');
assert.ok(engineJs.includes("isOyesook ? '👩‍🏫' :"), 'engine.js renders 👩‍🏫 badge icon for isOyesook');
console.log('✅ Check 2 Passed: engine.js renders dedicated sprite & badge for Teacher Oh Ye-sook.');

// 3. main.js checks
assert.ok(mainJs.includes('• 담임교사: 오예슉 선생님 (가정) 👩‍🏫'), 'main.js 1-3 blackboard dialog updated');
assert.ok(mainJs.includes('"오예슉 선생님 교탁 옆 전산망 관리 시스템입니다.'), 'main.js 1-3 server dialog updated');
assert.ok(mainJs.includes('RPGDialog.show'), 'main.js uses RPGDialog.show for NPC and object interactions');
console.log('✅ Check 3 Passed: main.js in-game descriptions and dialogs verified.');

console.log('\n🎉 ALL 1-3 CLASSROOM TEACHER OH YE-SOOK TESTS PASSED!');
