const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const tests = [
  'check_all_syntax.js',
  'comprehensive_audit.js',
  'deep_audit.js',
  'audit_deep_scan.js',
  'debug_check.js',
  'check_bounce_and_overlaps.js',
  'mock_runtime_test.js',
  'test_all_features.js',
  'test_all_new_features.js',
  'test_easter_eggs.js',
  'test_engine_runtime.js',
  'test_joshua_quest.js',
  'test_staff_office_quests.js',
  'test_render_strict.js',
  'test_student_admin_api.js',
  'test_teacher_login.js',
  'test_secret_history_gatekeeper.js',
  'test_gym_plaza_gatekeeper.js',
  'test_teacher_noclip_brawl.js',
  'test_teacher_server_gate.js'
];

console.log('==============================================');
console.log('   RUNNING SUITE OF CODEBASE AUDITS & TESTS   ');
console.log('==============================================');

for (const t of tests) {
  const fullPath = path.join(__dirname, t);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ ${t} does not exist, skipping`);
    continue;
  }
  try {
    const res = execSync(`"${process.execPath}" "${fullPath}"`, { encoding: 'utf8', stdio: 'pipe' });
    const hasFail = res.includes('[FAIL]') || (res.includes('FAIL') && !res.includes('FAILED: 0'));
    if (hasFail) {
      console.log(`❌ ${t} FAILED:`);
      console.log(res);
    } else {
      console.log(`✅ ${t} PASSED`);
    }
  } catch (err) {
    console.log(`💥 ${t} EXCEPTION:`);
    if (err.stdout) console.log(err.stdout.slice(0, 1000));
    if (err.stderr) console.log(err.stderr.slice(0, 1000));
  }
}
