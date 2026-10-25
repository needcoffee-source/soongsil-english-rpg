const http = require('http');

function postJson(urlPath, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
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

function getJson(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, res => {
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
  console.log('🧪 [TEST 1] GET /api/admin/all-students-progress');
  const res1 = await getJson('/api/admin/all-students-progress');
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
  const res4 = await postJson('/api/admin/delete-student-progress', { studentId: '99999' });
  console.log('Result 4:', res4.status, res4.data);

  console.log('\n🧪 [TEST 5] GET /api/load-progress?studentId=99999 (Verify deleted with tombstone)');
  const res5 = await getJson('/api/load-progress?studentId=99999');
  console.log('Result 5:', res5.status, 'progress:', res5.data.progress, 'deletedAt:', res5.data.deletedAt);
  if (res5.data.progress !== null || !res5.data.deletedAt) {
    throw new Error('Delete verification failed!');
  }

  console.log('\n🎉 ALL TEACHER ADMIN STUDENT PROGRESS TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
