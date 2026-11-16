const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function postJson(urlPath, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, raw: body }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getJson(urlPath, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:3000${urlPath}`, { headers }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, raw: body }); }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  const deletedPath = path.join(__dirname, '..', 'data', 'deleted_students.json');
  const backupDeleted = fs.existsSync(deletedPath) ? fs.readFileSync(deletedPath, 'utf8') : null;
  let serverProcess = null;
  try {
    await getJson('/');
  } catch (e) {
    console.log('[INFO] Starting ephemeral server for test_student_admin_api...');
    serverProcess = spawn(process.execPath, ['server.js'], { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 250));
      try {
        await getJson('/');
        break;
      } catch (err) {}
    }
  }

  try {
    console.log('🧪 [TEST 0] Unauthenticated /api/admin/all-students-progress check & POST /api/teacher-auth');
    const unauthRes = await getJson('/api/admin/all-students-progress');
    if (unauthRes.status !== 401) {
      throw new Error(`Expected HTTP 401 for unauthenticated admin request, got ${unauthRes.status}`);
    }
    const authRes = await postJson('/api/teacher-auth', { password: process.env.TEACHER_PASSWORD || '03220322' });
    if (authRes.status !== 200 || !authRes.data || !authRes.data.token) {
      throw new Error(`Teacher auth failed: ${authRes.status}`);
    }
    const authHeaders = { 'X-Teacher-Token': authRes.data.token };

    console.log('\n🧪 [TEST 1] GET /api/admin/all-students-progress');
  const res1 = await getJson('/api/admin/all-students-progress', authHeaders);
  if (res1.status !== 200 || !res1.data || !res1.data.students) {
    throw new Error(`TEST 1 failed: HTTP ${res1.status}`);
  }
  console.log('Result 1:', res1.status, Object.keys(res1.data.students || {}));

  console.log('\n🧪 [TEST 2] POST /api/save-progress (Create / Update student 99999)');
  const testStudent = {
    name: '테스트학생',
    studentId: '99999',
    grade: 1,
    level: 5,
    exp: 250,
    gold: 500,
    hasReceivedSoongsilGift: true,
    hasOpenedSecretLocker: true,
    hasClearedFirstBoss: true,
    hasClearedDragonRaid: false,
    hasClearedCerberusRaid: false,
    updatedAt: Date.now()
  };
  const res2 = await postJson('/api/save-progress', { studentId: '99999', progress: testStudent });
  console.log('Result 2:', res2.status, res2.data);

  console.log('\n🧪 [TEST 3] GET /api/load-progress?studentId=99999 (Verify saved student)');
  const res3 = await getJson('/api/load-progress?studentId=99999');
  console.log('Result 3:', res3.status, res3.data.progress ? `Lv.${res3.data.progress.level}, ${res3.data.progress.gold}G, ${res3.data.progress.name}` : 'null');
  if (res3.data.progress.gold !== 500 || res3.data.progress.level !== 5) {
    throw new Error('Save verification failed!');
  }

  console.log('\n🧪 [TEST 4] POST /api/admin/delete-student-progress (Delete student 99999)');
  const res4 = await postJson('/api/admin/delete-student-progress', { studentId: '99999' }, authHeaders);
  if (res4.status !== 200) {
    throw new Error(`TEST 4 failed: HTTP ${res4.status}`);
  }
  console.log('Result 4:', res4.status, res4.data);

  console.log('\n🧪 [TEST 5] GET /api/load-progress?studentId=99999 (Verify deleted with tombstone)');
  const res5 = await getJson('/api/load-progress?studentId=99999');
  console.log('Result 5:', res5.status, 'progress:', res5.data.progress, 'deletedAt:', res5.data.deletedAt);
  if (res5.data.progress !== null || !res5.data.deletedAt) {
    throw new Error('Delete verification failed!');
  }

  console.log('\n🎉 ALL TEACHER ADMIN STUDENT PROGRESS TESTS PASSED SUCCESSFULLY!');
  } finally {
    if (backupDeleted !== null) {
      try { fs.writeFileSync(deletedPath, backupDeleted, 'utf8'); } catch (e) {}
    }
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
