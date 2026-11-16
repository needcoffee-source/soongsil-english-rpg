const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

function requestJson(method, urlPath, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const reqHeaders = { ...headers };
    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: urlPath,
      method,
      headers: reqHeaders
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  const deletedPath = path.join(__dirname, '..', 'data', 'deleted_students.json');
  const backupDeleted = fs.existsSync(deletedPath) ? fs.readFileSync(deletedPath, 'utf8') : null;
  let serverProcess = null;

  try {
    await requestJson('GET', '/');
  } catch (e) {
    serverProcess = spawn(process.execPath, ['server.js'], { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        await requestJson('GET', '/');
        break;
      } catch (err) {}
    }
  }

  const testIds = [];
  let authHeaders = {};

  try {
    const authRes = await requestJson('POST', '/api/teacher-auth', { password: process.env.TEACHER_PASSWORD || '03220322' });
    assert.strictEqual(authRes.status, 200, 'Teacher auth must succeed');
    authHeaders = { 'X-Teacher-Token': authRes.data.token };

    // 1. Seed 12 offline students across levels 1..15 (including gear without precomputed atk/def)
    for (let i = 1; i <= 12; i++) {
      const sid = `980${String(i).padStart(2, '0')}`;
      testIds.push(sid);
      const level = i === 12 ? 15 : i;
      const equipment = i === 12
        ? {
            weapon: { item: 'equip_bronze_sword', name: '청동검' }, // +30 ATK
            armor: { item: 'equip_bronze_armor', name: '청동갑옷' } // +20 DEF
          }
        : {};
      const saveRes = await requestJson('POST', '/api/save-progress', {
        studentId: sid,
        progress: {
          name: `랭킹테스터${i}`,
          studentId: sid,
          grade: 1,
          level,
          exp: i * 10,
          gold: i * 100,
          baseAtk: 10,
          baseDef: 2,
          equipment
        }
      });
      assert.strictEqual(saveRes.status, 200, `Save ${sid} failed`);
    }

    // 2. Verify GET /api/leaderboard returns max 10 sorted by level DESC, includes offline & ATK/DEF
    const lb1 = await requestJson('GET', '/api/leaderboard?studentId=98001');
    assert.strictEqual(lb1.status, 200);
    assert.strictEqual(lb1.data.list.length, 10, 'Leaderboard must cap at 10 entries');
    assert.ok(lb1.data.totalCount >= 12, 'Total ranked count must include all saved students');
    assert.strictEqual(lb1.data.list[0].studentId, '98012', 'Lv.15 student must rank #1');
    assert.strictEqual(lb1.data.list[0].isOnline, false, 'Saved offline student must show offline status');
    assert.strictEqual(lb1.data.list[0].atk, 54, 'Rank #1 ATK must be 10 + 14(lv) + 30(sword) = 54');
    assert.strictEqual(lb1.data.list[0].def, 36, 'Rank #1 DEF must be 2 + 14(lv) + 20(armor) = 36');
    for (let idx = 1; idx < lb1.data.list.length; idx++) {
      assert.ok(
        lb1.data.list[idx - 1].level >= lb1.data.list[idx].level,
        'Leaderboard entries must be ordered by level descending'
      );
    }
    assert.ok(lb1.data.myRank >= 11, `Student Lv.1 rank should be outside top 10 (got ${lb1.data.myRank})`);

    // 3. Verify client rendering code includes TOP 10 icons, offline/online pills, ATK & DEF pills
    const mainJs = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'main.js'), 'utf8');
    const htmlCode = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
    assert.ok(mainJs.includes("'🔟'"), 'main.js must include rank 10 badge icon');
    assert.ok(mainJs.includes('leaderboard-atk-pill') && mainJs.includes('leaderboard-def-pill'), 'main.js must render ATK/DEF pills');
    assert.ok(mainJs.includes('비접속') && mainJs.includes('접속'), 'main.js must display online/offline badges');
    assert.ok(htmlCode.includes('my-rank-combat'), 'index.html must show user combat stats in leaderboard footer');

    console.log('✅ TOP 10 Leaderboard (Online+Offline, Level Sort, ATK/DEF Display) ALL PASSED!');
  } finally {
    for (const sid of testIds) {
      try {
        await requestJson('POST', '/api/admin/delete-student-progress', { studentId: sid }, authHeaders);
      } catch (e) {}
    }
    if (backupDeleted !== null) {
      try { fs.writeFileSync(deletedPath, backupDeleted, 'utf8'); } catch (e) {}
    }
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

runTests().catch(err => {
  console.error('❌ Leaderboard test failed:', err);
  process.exit(1);
});
