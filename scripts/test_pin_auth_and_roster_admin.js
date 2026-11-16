const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3138;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ROOT = path.join(__dirname, '..');
const PROGRESS_FILE = path.join(ROOT, 'data', 'students_progress.json');
const SERVER_STATE_FILE = path.join(ROOT, 'data', 'server_state.json');
const ROSTER_FILE = path.join(ROOT, 'data', 'student_roster.json');
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD || '03220322';

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForServerReady(timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) return;
    } catch (e) {}
    await wait(250);
  }
  throw new Error('Server failed to become ready within timeout');
}

async function jsonPost(urlPath, body, headers = {}) {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {}
  return { status: res.status, data };
}

async function jsonGet(urlPath, headers = {}) {
  const res = await fetch(`${BASE_URL}${urlPath}`, { method: 'GET', headers });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {}
  return { status: res.status, data };
}

async function run() {
  const SHEETS_CFG_FILE = path.join(ROOT, 'data', 'google_sheets_config.json');
  const origProgress = fs.existsSync(PROGRESS_FILE) ? fs.readFileSync(PROGRESS_FILE, 'utf8') : null;
  const origState = fs.existsSync(SERVER_STATE_FILE) ? fs.readFileSync(SERVER_STATE_FILE, 'utf8') : null;
  const origRoster = fs.existsSync(ROSTER_FILE) ? fs.readFileSync(ROSTER_FILE, 'utf8') : null;
  const origSheetsCfg = fs.existsSync(SHEETS_CFG_FILE) ? fs.readFileSync(SHEETS_CFG_FILE, 'utf8') : null;
  if (origSheetsCfg !== null) {
    try {
      const cfgParsed = JSON.parse(origSheetsCfg);
      fs.writeFileSync(SHEETS_CFG_FILE, JSON.stringify({ ...cfgParsed, webAppUrl: '' }, null, 2), 'utf8');
    } catch (e) {}
  }

  const child = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  try {
    await waitForServerReady();

    // 1. Auth config defaults (Option 2: email+PIN required, emergency false, whitelist false)
    const cfg = await jsonGet('/api/auth-config');
    assert.strictEqual(cfg.status, 200);
    assert.strictEqual(cfg.data.allowedDomain, 'senedu.kr');
    assert.strictEqual(cfg.data.requireRosterWhitelist, false);
    assert.strictEqual(cfg.data.allowEmergencyStudentLogin, false);

    // 2. Teacher login for admin API token
    const tAuth = await jsonPost('/api/teacher-auth', { password: TEACHER_PASSWORD });
    assert.strictEqual(tAuth.status, 200);
    assert.strictEqual(tAuth.data.success, true);
    assert.ok(tAuth.data.token, 'Teacher token must be issued');
    const teacherHeaders = { 'X-Teacher-Token': tAuth.data.token };

    // Ensure emergency & roster whitelist are reset for clean test assertions
    const initSettings = await jsonPost('/api/admin/auth-settings', {
      allowEmergencyStudentLogin: false,
      requireRosterWhitelist: false
    }, teacherHeaders);
    assert.strictEqual(initSettings.status, 200);

    // 3. Reject non-@senedu.kr email & non-4-digit PIN
    const badEmail = await jsonPost('/api/auth/student-login', {
      studentId: '10191',
      name: '김테스트',
      email: 'test@gmail.com',
      pin: '1234'
    });
    assert.strictEqual(badEmail.status, 400);

    const badPin = await jsonPost('/api/auth/student-login', {
      studentId: '10191',
      name: '김테스트',
      email: 'test10191@senedu.kr',
      pin: '12ab'
    });
    assert.strictEqual(badPin.status, 400);

    // 4. Reject emergency login when emergency mode is OFF
    const blockedEm = await jsonPost('/api/auth/emergency-student', {
      studentId: '10191',
      name: '김테스트'
    });
    assert.strictEqual(blockedEm.status, 403);

    // 5. First-time student registration (@senedu.kr + studentId + name + 4-digit PIN)
    const reg = await jsonPost('/api/auth/student-login', {
      studentId: '10191',
      name: '김테스트',
      email: 'test10191@senedu.kr',
      pin: '0428',
      hairColor: 'brown',
      outfitColor: 'blue'
    });
    assert.strictEqual(reg.status, 200, JSON.stringify(reg.data));
    assert.strictEqual(reg.data.isNewAccount, true);
    assert.ok(reg.data.studentAuthToken);

    // 6. Privacy check: /api/load-progress & /api/leaderboard must NOT expose email, pinHash, or pinSalt
    const pub = await jsonGet('/api/load-progress?studentId=10191');
    assert.strictEqual(pub.status, 200);
    assert.strictEqual(pub.data.progress.hasPinSet, true);
    assert.strictEqual(pub.data.progress.hasEmailSet, true);
    assert.strictEqual(pub.data.progress.email, undefined);
    assert.strictEqual(pub.data.progress.pinHash, undefined);
    assert.strictEqual(pub.data.progress.pinSalt, undefined);

    // 7. Re-login checks: wrong PIN (401), wrong name (409), email reuse across IDs (409), valid login (200)
    const wrongPin = await jsonPost('/api/auth/student-login', {
      studentId: '10191',
      name: '김테스트',
      email: 'test10191@senedu.kr',
      pin: '9999'
    });
    assert.strictEqual(wrongPin.status, 401);

    const wrongName = await jsonPost('/api/auth/student-login', {
      studentId: '10191',
      name: '다른이름',
      email: 'test10191@senedu.kr',
      pin: '0428'
    });
    assert.strictEqual(wrongName.status, 409);

    const dupEmail = await jsonPost('/api/auth/student-login', {
      studentId: '10192',
      name: '박중복',
      email: 'test10191@senedu.kr',
      pin: '1111'
    });
    assert.strictEqual(dupEmail.status, 409);

    const okLogin = await jsonPost('/api/auth/student-login', {
      studentId: '10191',
      name: '김테스트',
      email: 'test10191@senedu.kr',
      pin: '0428'
    });
    assert.strictEqual(okLogin.status, 200);
    assert.strictEqual(okLogin.data.isNewAccount, false);

    // 8. Save progress (level 7, gold 500) -> verify pinHash/pinSalt are preserved!
    const saveRes = await jsonPost('/api/save-progress', {
      studentId: '10191',
      progress: {
        studentId: '10191',
        name: '김테스트',
        level: 7,
        exp: 42,
        gold: 500
      }
    });
    assert.strictEqual(saveRes.status, 200);

    const afterSaveWrongPin = await jsonPost('/api/auth/student-login', {
      studentId: '10191',
      name: '김테스트',
      email: 'test10191@senedu.kr',
      pin: '0000'
    });
    assert.strictEqual(afterSaveWrongPin.status, 401, 'Saving progress must preserve PIN hash');

    // 9. Teacher PIN reset (clear) -> student picks a brand-new PIN without losing level/gold!
    const resetClear = await jsonPost('/api/admin/reset-student-pin', {
      studentId: '10191',
      newPin: ''
    }, teacherHeaders);
    assert.strictEqual(resetClear.status, 200);
    assert.strictEqual(resetClear.data.hasPinSet, false);

    const pubReset = await jsonGet('/api/load-progress?studentId=10191');
    assert.strictEqual(pubReset.data.progress.hasPinSet, false);

    const reEnrollPin = await jsonPost('/api/auth/student-login', {
      studentId: '10191',
      name: '김테스트',
      email: 'test10191@senedu.kr',
      pin: '7777'
    });
    assert.strictEqual(reEnrollPin.status, 200);
    assert.strictEqual(reEnrollPin.data.pinWasReset, true);
    assert.strictEqual(reEnrollPin.data.progress.level, 7);
    assert.strictEqual(reEnrollPin.data.progress.gold, 500);

    // Teacher direct PIN assignment
    const directAssign = await jsonPost('/api/admin/reset-student-pin', {
      studentId: '10191',
      newPin: '2468'
    }, teacherHeaders);
    assert.strictEqual(directAssign.status, 200);
    assert.strictEqual(directAssign.data.hasPinSet, true);

    const directLogin = await jsonPost('/api/auth/student-login', {
      studentId: '10191',
      name: '김테스트',
      email: 'test10191@senedu.kr',
      pin: '2468'
    });
    assert.strictEqual(directLogin.status, 200);

    // 10. Teacher Roster Whitelist Upload + Enforcement
    const rosterUpload = await jsonPost('/api/admin/roster', {
      replace: true,
      csvText: '학번,이름,이메일\n10191,김테스트,test10191@senedu.kr\n20191,이승급,prom20191@senedu.kr'
    }, teacherHeaders);
    assert.strictEqual(rosterUpload.status, 200);
    assert.strictEqual(rosterUpload.data.count, 2);

    const rosterToggleOn = await jsonPost('/api/admin/auth-settings', {
      requireRosterWhitelist: true
    }, teacherHeaders);
    assert.strictEqual(rosterToggleOn.status, 200);
    assert.strictEqual(rosterToggleOn.data.requireRosterWhitelist, true);

    const blockedByRoster = await jsonPost('/api/auth/student-login', {
      studentId: '10999',
      name: '외부인',
      email: 'outsider@senedu.kr',
      pin: '1111'
    });
    assert.strictEqual(blockedByRoster.status, 403);

    const allowedByRoster = await jsonPost('/api/auth/student-login', {
      studentId: '20191',
      name: '이승급',
      email: 'prom20191@senedu.kr',
      pin: '5555'
    });
    assert.strictEqual(allowedByRoster.status, 200);
    assert.strictEqual(allowedByRoster.data.isNewAccount, true);

    // 11. Grade promotion (10191 -> 20192) keeps PIN & level/gold, then grade bulk delete
    await jsonPost('/api/admin/auth-settings', {
      requireRosterWhitelist: false
    }, teacherHeaders);

    const promote = await jsonPost('/api/admin/rename-student-id', {
      oldStudentId: '10191',
      newStudentId: '20192',
      newName: '김테스트'
    }, teacherHeaders);
    assert.strictEqual(promote.status, 200);

    const loginPromoted = await jsonPost('/api/auth/student-login', {
      studentId: '20192',
      name: '김테스트',
      email: 'test10191@senedu.kr',
      pin: '2468'
    });
    assert.strictEqual(loginPromoted.status, 200);
    assert.strictEqual(loginPromoted.data.progress.level, 7);

    // Create grade-3 graduate test record & delete grade 2+3 in bulk
    await jsonPost('/api/auth/student-login', {
      studentId: '30199',
      name: '박졸업',
      email: 'grad30199@senedu.kr',
      pin: '1234'
    });

    const delG2 = await jsonPost('/api/admin/delete-students-by-grade', { gradePrefix: '2' }, teacherHeaders);
    assert.strictEqual(delG2.status, 200);
    assert.ok(delG2.data.deletedCount >= 2);

    const delG3 = await jsonPost('/api/admin/delete-students-by-grade', { gradePrefix: '3' }, teacherHeaders);
    assert.strictEqual(delG3.status, 200);
    assert.ok(delG3.data.deletedCount >= 1);

    // 12. Toggle emergency mode ON and test emergency login, then turn OFF
    const emOn = await jsonPost('/api/admin/auth-settings', {
      allowEmergencyStudentLogin: true
    }, teacherHeaders);
    assert.strictEqual(emOn.status, 200);
    assert.strictEqual(emOn.data.allowEmergencyStudentLogin, true);

    const emLogin = await jsonPost('/api/auth/student-login', {
      studentId: '10195',
      name: '비상학생'
    });
    assert.strictEqual(emLogin.status, 200);
    assert.strictEqual(emLogin.data.emergencyUsed, true);

    console.log('✅ All Option 2 (@senedu.kr + 4-digit PIN + Roster Whitelist + Teacher Admin) tests PASSED!');
  } finally {
    child.kill('SIGTERM');
    await wait(400);
    // Restore clean disk state
    if (origProgress !== null) fs.writeFileSync(PROGRESS_FILE, origProgress, 'utf8');
    if (origState !== null) {
      fs.writeFileSync(SERVER_STATE_FILE, origState, 'utf8');
    } else if (fs.existsSync(SERVER_STATE_FILE)) {
      fs.unlinkSync(SERVER_STATE_FILE);
    }
    if (origRoster !== null) {
      fs.writeFileSync(ROSTER_FILE, origRoster, 'utf8');
    } else if (fs.existsSync(ROSTER_FILE)) {
      fs.unlinkSync(ROSTER_FILE);
    }
    if (origSheetsCfg !== null) {
      fs.writeFileSync(SHEETS_CFG_FILE, origSheetsCfg, 'utf8');
    }
  }
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
