const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

function reqHttp(port, method, urlPath, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const raw = typeof body === 'string' ? body : (body ? JSON.stringify(body) : '');
    const isJson = typeof body !== 'string';
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: urlPath,
      method,
      headers: {
        ...(isJson ? { 'Content-Type': 'application/json' } : { 'Content-Type': 'text/plain;charset=UTF-8' }),
        ...(raw ? { 'Content-Length': Buffer.byteLength(raw) } : {}),
        ...headers
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (_) {}
        resolve({ status: res.statusCode, data: parsed, raw: data });
      });
    });
    req.on('error', reject);
    if (raw) req.write(raw);
    req.end();
  });
}

async function waitForHealth(port) {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 150));
    try {
      const r = await reqHttp(port, 'GET', '/api/server-status');
      if (r.status === 200) return;
    } catch (_) {}
  }
  throw new Error('Server failed to start on port ' + port);
}

async function eioConnectAndJoin(port, joinPayload) {
  const hs = await reqHttp(port, 'GET', '/socket.io/?EIO=4&transport=polling');
  const sidMatch = hs.raw.match(/"sid":"([^"]+)"/);
  assert(sidMatch, 'Engine.IO handshake must return sid: ' + hs.raw);
  const sid = sidMatch[1];

  await reqHttp(port, 'POST', `/socket.io/?EIO=4&transport=polling&sid=${sid}`, '40');
  await reqHttp(port, 'GET', `/socket.io/?EIO=4&transport=polling&sid=${sid}`);
  await reqHttp(port, 'POST', `/socket.io/?EIO=4&transport=polling&sid=${sid}`, '42' + JSON.stringify(['player_join', joinPayload]));

  const events = [];
  for (let i = 0; i < 4; i++) {
    const poll = await reqHttp(port, 'GET', `/socket.io/?EIO=4&transport=polling&sid=${sid}`);
    if (poll.raw.includes('init_self') || poll.raw.includes('server_entry_rejected')) {
      events.push(poll.raw);
      break;
    }
    await new Promise(r => setTimeout(r, 100));
  }
  return { sid, rawEvents: events.join('\n') };
}

async function eioDisconnect(port, sid) {
  await reqHttp(port, 'POST', `/socket.io/?EIO=4&transport=polling&sid=${sid}`, '41');
}

async function runTests() {
  const cwd = path.join(__dirname, '..');
  const dataDir = path.join(cwd, 'data');
  const statePath = path.join(dataDir, 'server_state.json');
  const progressPath = path.join(dataDir, 'students_progress.json');
  const deletedPath = path.join(dataDir, 'deleted_students.json');

  const backups = {
    state: fs.existsSync(statePath) ? fs.readFileSync(statePath, 'utf8') : null,
    progress: fs.existsSync(progressPath) ? fs.readFileSync(progressPath, 'utf8') : null,
    deleted: fs.existsSync(deletedPath) ? fs.readFileSync(deletedPath, 'utf8') : null
  };

  let proc = null;
  const port = 3459;

  const spawnServer = async (extraEnv = {}) => {
    const child = spawn(process.execPath, ['server.js'], {
      cwd,
      env: { ...process.env, PORT: String(port), ...extraEnv },
      stdio: 'ignore'
    });
    await waitForHealth(port);
    return child;
  };

  const stopServer = async (child) => {
    if (!child) return;
    try { child.kill(); } catch (_) {}
    await new Promise(r => setTimeout(r, 300));
  };

  try {
    // 1. Start server #1 with long idle threshold -> login teacher & student -> get tokens
    proc = await spawnServer({ IDLE_AUTO_CLOSE_MS: '60000' });

    const teacherAuth = await reqHttp(port, 'POST', '/api/teacher-auth', { password: process.env.TEACHER_PASSWORD || '03220322' });
    assert.strictEqual(teacherAuth.status, 200);
    const teacherToken = teacherAuth.data.token;
    assert(teacherToken && teacherToken.includes('.'), 'Teacher token must be signed HMAC token');

    // Ensure server is open
    const openRes = await reqHttp(port, 'POST', '/api/admin/server-gate', { isOpen: true }, { 'x-teacher-token': teacherToken });
    assert.strictEqual(openRes.status, 200);
    assert.strictEqual(openRes.data.isOpen, true);

    const loginRes = await reqHttp(port, 'POST', '/api/auth/student-login', {
      studentId: '13999',
      name: '세션테스터',
      email: 'session_test@senedu.kr',
      pin: '1234'
    });
    assert.strictEqual(loginRes.status, 200);
    const studentToken = loginRes.data.studentAuthToken;
    assert(studentToken && studentToken.includes('.'), 'Student token must be signed HMAC token');

    // Give student a potion for post-restart authenticated API test
    await reqHttp(port, 'POST', '/api/save-progress', {
      studentId: '13999',
      studentAuthToken: studentToken,
      progress: {
        studentId: '13999',
        name: '세션테스터',
        level: 5,
        exp: 0,
        gold: 0,
        inventory: [{ item: 'item_tiny_exp_potion', name: '초소형 경험치 물약', count: 1, icon: '🧪', type: 'consumable' }]
      }
    });

    // Wait for 1s server progress batch write before restart simulation
    await new Promise(r => setTimeout(r, 1200));

    // Restart server #1 -> #2 to verify tokens & open state survive restarts!
    await stopServer(proc);
    proc = await spawnServer({ IDLE_AUTO_CLOSE_MS: '1500' });

    const statusAfterRestart = await reqHttp(port, 'GET', '/api/server-status');
    assert.strictEqual(statusAfterRestart.data.isOpen, true, 'Server must stay open across restart if opened by teacher');

    // Teacher & student tokens issued before restart must STILL work on HTTP & Socket.IO!
    const useAfterRestart = await reqHttp(port, 'POST', '/api/item/use-exp-potion', {
      studentId: '13999',
      itemId: 'item_tiny_exp_potion'
    }, { 'X-Student-Token': studentToken });
    assert.strictEqual(useAfterRestart.status, 200, 'Student HMAC token must remain valid after server restart');
    assert.strictEqual(useAfterRestart.data.exp, 50);

    const sockConn = await eioConnectAndJoin(port, {
      studentId: '13999',
      name: '세션테스터',
      studentAuthToken: studentToken
    });
    assert(sockConn.rawEvents.includes('init_self'), 'Student Socket.IO reconnect with pre-restart token must succeed: ' + sockConn.rawEvents);
    console.log('✓ 1. Pre-restart student & teacher HMAC tokens survived server restart without pin_auth_required.');

    // 2. While student IS connected (standing idle), server must NOT auto-close past IDLE_AUTO_CLOSE_MS (1500ms)
    await new Promise(r => setTimeout(r, 2000));
    const statusWhileOccupied = await reqHttp(port, 'GET', '/api/server-status');
    assert.strictEqual(statusWhileOccupied.data.isOpen, true, 'Server must remain OPEN while player is connected & idle');
    console.log('✓ 2. Server remained OPEN while idle player was connected (did not auto-close).');

    // 3. Disconnect the last player -> server should auto-close after IDLE_AUTO_CLOSE_MS (1500ms)
    await eioDisconnect(port, sockConn.sid);
    let closedByIdle = false;
    for (let i = 0; i < 12; i++) {
      await new Promise(r => setTimeout(r, 350));
      const s = await reqHttp(port, 'GET', '/api/server-status');
      if (!s.data.isOpen) {
        closedByIdle = true;
        assert(s.data.updatedBy.includes('20분 미접속'), 'Idle close updatedBy should indicate 20m auto-close: ' + s.data.updatedBy);
        break;
      }
    }
    assert(closedByIdle, 'Empty server must auto-close after IDLE_AUTO_CLOSE_MS');
    console.log('✓ 3. Empty server auto-closed cleanly after IDLE_AUTO_CLOSE_MS with 0 players.');

    // 4. Restart server again -> closed state must stay CLOSED until teacher opens it
    await stopServer(proc);
    proc = await spawnServer({ IDLE_AUTO_CLOSE_MS: '60000' });
    const statusStillClosed = await reqHttp(port, 'GET', '/api/server-status');
    assert.strictEqual(statusStillClosed.data.isOpen, false, 'Server must remain CLOSED across restarts until teacher opens');

    // Pre-restart teacher token opens it back up
    const reopenRes = await reqHttp(port, 'POST', '/api/admin/server-gate', { isOpen: true }, { 'x-teacher-token': teacherToken });
    assert.strictEqual(reopenRes.status, 200);
    assert.strictEqual(reopenRes.data.isOpen, true);
    console.log('✓ 4. Closed state persisted across restart, and pre-restart teacher token reopened server.');
  } finally {
    await stopServer(proc);
    if (backups.state !== null) fs.writeFileSync(statePath, backups.state, 'utf8');
    if (backups.progress !== null) fs.writeFileSync(progressPath, backups.progress, 'utf8');
    if (backups.deleted !== null) fs.writeFileSync(deletedPath, backups.deleted, 'utf8');
  }
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
