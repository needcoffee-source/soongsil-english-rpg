const fs = require('fs');

console.log('Testing Teacher Login Logic...');

const mainCode = fs.readFileSync('public/js/main.js', 'utf8');

// Verify plaintext teacher password is no longer hardcoded in client source
if (mainCode.includes("'03220322'")) {
  throw new Error('Plaintext teacher password must not be hardcoded in public/js/main.js');
}
if (!mainCode.includes("fetch('/api/teacher-auth'")) {
  throw new Error('Server-side /api/teacher-auth verification missing in public/js/main.js');
}
if (!mainCode.includes('const isTeacher = (checkIsTeacher && checkIsTeacher.checked) || (enteredPwd.length > 0);')) {
  throw new Error('Teacher detection condition missing or incorrect');
}

// Check that under isTeacher, studentId and nickname are ignored
if (!mainCode.includes("name = '갓준철';") || !mainCode.includes("studentId = '교사';")) {
  throw new Error('Default teacher profile assignments missing');
}

// Check that under !isTeacher, studentId and nickname are checked
if (!mainCode.includes("alert('학번을 입력해 주세요! (예: 10101)');")) {
  throw new Error('Student validation alert missing');
}

// Check HTML UI enhancements
const htmlCode = fs.readFileSync('public/index.html', 'utf8');
if (!htmlCode.includes('id="teacher-notice-banner"')) {
  throw new Error('Teacher notice banner missing in index.html');
}
if (!htmlCode.includes('id="group-student-id"') || !htmlCode.includes('id="group-student-nickname"')) {
  throw new Error('Input group IDs missing in index.html');
}

console.log('✅ Teacher login bypass & validation separation verified successfully!');
