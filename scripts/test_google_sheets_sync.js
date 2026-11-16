const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const TEACHER_PWD = process.env.TEACHER_PASSWORD || '03220322';

function reqJson(port, method, urlPath, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : '';
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: urlPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
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
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  const cwd = path.join(__dirname, '..');
  const dataDir = path.join(cwd, 'data');
  const progressPath = path.join(dataDir, 'students_progress.json');
  const sheetsCfgPath = path.join(dataDir, 'google_sheets_config.json');
  const deletedPath = path.join(dataDir, 'deleted_students.json');

  const backups = {
    progress: fs.existsSync(progressPath) ? fs.readFileSync(progressPath, 'utf8') : null,
    sheets: fs.existsSync(sheetsCfgPath) ? fs.readFileSync(sheetsCfgPath, 'utf8') : null,
    deleted: fs.existsSync(deletedPath) ? fs.readFileSync(deletedPath, 'utf8') : null
  };

  // In-memory Mock Apps Script Google Sheet Server
  const mockSheetRows = new Map();
  let mockServer = null;
  let gameServer = null;
  let startedGameServer = false;

  try {
    mockServer = http.createServer((req, res) => {
      let raw = '';
      req.on('data', c => raw += c);
      req.on('end', () => {
        let body = {};
        try { body = JSON.parse(raw || '{}'); } catch (e) {}
        if (body.secret !== 'sec-test-123') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: '인증 비밀키 불일치' }));
        }
        const action = body.action;
        if (action === 'ping') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, sheetName: '학생계정' }));
        }
        if (action === 'getOne') {
          const hit = mockSheetRows.get(String(body.studentId || '').trim()) || null;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, found: !!hit, row: hit }));
        }
        if (action === 'getAll') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, rows: Array.from(mockSheetRows.values()) }));
        }
        if (action === 'upsertOne') {
          const r = body.row || {};
          const prev = mockSheetRows.get(r.studentId) || {};
          mockSheetRows.set(r.studentId, {
            ...prev,
            ...r,
            pin: r.clearPin ? '' : (r.pin || prev.pin || '')
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, studentId: r.studentId }));
        }
        if (action === 'syncAll') {
          let updatedCount = 0;
          let appendedCount = 0;
          for (const r of (body.rows || [])) {
            const existed = mockSheetRows.has(r.studentId);
            const prev = mockSheetRows.get(r.studentId) || {};
            mockSheetRows.set(r.studentId, { ...prev, ...r, pin: r.pin || prev.pin || '' });
            if (existed) updatedCount++;
            else appendedCount++;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, updatedCount, appendedCount }));
        }
        if (action === 'deleteOne') {
          const deleted = mockSheetRows.delete(body.studentId);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, deleted }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Unknown action' }));
      });
    });

    await new Promise(resolve => mockServer.listen(0, '127.0.0.1', resolve));
    const mockPort = mockServer.address().port;
    const mockUrl = `http://127.0.0.1:${mockPort}/exec`;

    try {
      await reqJson(3000, 'GET', '/');
    } catch (_) {
      startedGameServer = true;
      gameServer = spawn(process.execPath, ['server.js'], { cwd, stdio: 'ignore' });
      for (let i = 0; i < 25; i++) {
        await new Promise(r => setTimeout(r, 250));
        try {
          await reqJson(3000, 'GET', '/');
          break;
        } catch (e) {}
      }
    }

    const adminHeaders = { 'X-Teacher-Pwd': TEACHER_PWD };

    // 1. Configure Sheets Web App URL + verify customized Code.gs output
    const cfgRes = await reqJson(3000, 'POST', '/api/admin/sheets/config', {
      spreadsheetId: '1r-fa5wMoNLPLQX3j3dfo75UEzOkPPApaUD46yOtCwk4',
      sheetName: '학생계정',
      webAppUrl: mockUrl,
      syncSecret: 'sec-test-123',
      syncPinOnLogin: true,
      autoPushChanges: true
    }, adminHeaders);
    assert.strictEqual(cfgRes.status, 200);
    assert.strictEqual(cfgRes.data.config.isReady, true);
    assert(cfgRes.data.codeGs.includes("const SPREADSHEET_ID = '1r-fa5wMoNLPLQX3j3dfo75UEzOkPPApaUD46yOtCwk4';"));
    assert(cfgRes.data.codeGs.includes("const SYNC_SECRET = 'sec-test-123';"));

    // 2. Test Connection
    const testRes = await reqJson(3000, 'POST', '/api/admin/sheets/test', {}, adminHeaders);
    assert.strictEqual(testRes.status, 200);

    // 3. New student signs up -> pinPlain NOT leaked publicly, auto-pushed to sheet in plaintext ('0428')
    const joinRes = await reqJson(3000, 'POST', '/api/auth/student-login', {
      studentId: '10888',
      name: '김시트',
      email: 's10888@senedu.kr',
      pin: '0428'
    });
    assert.strictEqual(joinRes.status, 200, JSON.stringify(joinRes));
    assert.strictEqual(joinRes.data.progress.pinPlain, undefined, 'pinPlain must NEVER leak in public login response');

    const loadRes = await reqJson(3000, 'GET', '/api/load-progress?studentId=10888');
    assert.strictEqual(loadRes.status, 200);
    assert.strictEqual(loadRes.data.progress.pinPlain, undefined, 'pinPlain must NEVER leak in /api/load-progress');

    // Wait briefly for 1.5s debounced auto-push
    await new Promise(r => setTimeout(r, 1800));
    const sheetRec = mockSheetRows.get('10888');
    assert(sheetRec, 'Student row must be pushed to Google Sheet automatically');
    assert.strictEqual(sheetRec.pin, '0428', 'Plaintext PIN (including leading 0) must be stored in sheet');

    // 4. Teacher edits PIN directly in Google Sheet ('0428' -> '9876') -> student logs in immediately with '9876'!
    mockSheetRows.set('10888', { ...sheetRec, pin: '9876' });
    const oldPinFail = await reqJson(3000, 'POST', '/api/auth/student-login', {
      studentId: '10888',
      name: '김시트',
      email: 's10888@senedu.kr',
      pin: '0428'
    });
    assert.strictEqual(oldPinFail.status, 401);

    const newPinOk = await reqJson(3000, 'POST', '/api/auth/student-login', {
      studentId: '10888',
      name: '김시트',
      email: 's10888@senedu.kr',
      pin: '9876'
    });
    assert.strictEqual(newPinOk.status, 200, 'Student must log in immediately using new PIN edited in sheet');

    // 5. Teacher creates new student directly in Sheet ('10889', pin '0011') + runs sync-from-sheet
    mockSheetRows.set('10889', {
      studentId: '10889',
      name: '이신규',
      email: 's10889@senedu.kr',
      pin: '0011',
      level: 3,
      gold: 50
    });
    const pullRes = await reqJson(3000, 'POST', '/api/admin/sheets/sync-from-sheet', {}, adminHeaders);
    assert.strictEqual(pullRes.status, 200);
    assert(pullRes.data.createdCount >= 1);

    const createdLogin = await reqJson(3000, 'POST', '/api/auth/student-login', {
      studentId: '10889',
      name: '이신규',
      email: 's10889@senedu.kr',
      pin: '0011'
    });
    assert.strictEqual(createdLogin.status, 200, 'Account created from Google Sheet must authenticate cleanly');

    // 6. Push-all sync verification
    const pushRes = await reqJson(3000, 'POST', '/api/admin/sheets/push-all', {}, adminHeaders);
    assert.strictEqual(pushRes.status, 200);
    assert.strictEqual(mockSheetRows.get('10888').pin, '9876');
    assert.strictEqual(mockSheetRows.get('10889').pin, '0011');

    console.log('✅ All Google Sheets bidirectional account + plaintext PIN sync tests PASSED!');
  } finally {
    if (mockServer) mockServer.close();
    if (gameServer && startedGameServer) gameServer.kill();
    if (backups.progress !== null) fs.writeFileSync(progressPath, backups.progress, 'utf8');
    else if (fs.existsSync(progressPath)) fs.unlinkSync(progressPath);
    if (backups.sheets !== null) fs.writeFileSync(sheetsCfgPath, backups.sheets, 'utf8');
    else if (fs.existsSync(sheetsCfgPath)) fs.unlinkSync(sheetsCfgPath);
    if (backups.deleted !== null) fs.writeFileSync(deletedPath, backups.deleted, 'utf8');
    else if (fs.existsSync(deletedPath)) fs.unlinkSync(deletedPath);
  }
}

runTests().catch(err => {
  console.error('❌ test_google_sheets_sync FAILED:', err);
  process.exit(1);
});
