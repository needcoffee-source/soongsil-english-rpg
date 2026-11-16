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

  // In-memory Mock Apps Script Google Sheet Server (학생계정 + 진행백업 2-tab model)
  const mockSheetRows = new Map();
  const mockBackupRows = new Map();
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
          return res.end(JSON.stringify({ success: true, sheetName: '학생계정', backupSheetName: '진행백업' }));
        }
        if (action === 'getOne') {
          const sid = String(body.studentId || '').trim();
          const hit = mockSheetRows.get(sid) || null;
          const bk = mockBackupRows.get(sid);
          const rowOut = hit ? { ...hit, progressJson: (bk && bk.progressJson) || hit.progressJson || '' } : null;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, found: !!rowOut, row: rowOut }));
        }
        if (action === 'getAll') {
          const merged = Array.from(mockSheetRows.values()).map(r => {
            const bk = mockBackupRows.get(r.studentId);
            return { ...r, progressJson: (bk && bk.progressJson) || r.progressJson || '' };
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, rows: merged }));
        }
        if (action === 'upsertOne') {
          const r = body.row || {};
          const prev = mockSheetRows.get(r.studentId) || {};
          const { progressJson, ...accountCols } = r;
          mockSheetRows.set(r.studentId, {
            ...prev,
            ...accountCols,
            pin: r.clearPin ? '' : (r.pin || prev.pin || '')
          });
          if (progressJson) {
            mockBackupRows.set(r.studentId, { studentId: r.studentId, updatedAt: r.updatedAt || '', progressJson });
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, studentId: r.studentId }));
        }
        if (action === 'syncAll') {
          let updatedCount = 0;
          let appendedCount = 0;
          for (const r of (body.rows || [])) {
            const existed = mockSheetRows.has(r.studentId);
            const prev = mockSheetRows.get(r.studentId) || {};
            const { progressJson, ...accountCols } = r;
            mockSheetRows.set(r.studentId, { ...prev, ...accountCols, pin: r.pin || prev.pin || '' });
            if (progressJson) {
              mockBackupRows.set(r.studentId, { studentId: r.studentId, updatedAt: r.updatedAt || '', progressJson });
            }
            if (existed) updatedCount++;
            else appendedCount++;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, updatedCount, appendedCount }));
        }
        if (action === 'deleteOne') {
          const deleted = mockSheetRows.delete(body.studentId);
          mockBackupRows.delete(body.studentId);
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
    assert(cfgRes.data.codeGs.includes("const BACKUP_SHEET_NAME = '진행백업';"));
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

    // 7. Save full RPG progression (exp, inventory, equipment, quests, boss flags, titles) -> backed up in 진행백업
    const saveRes = await reqJson(3000, 'POST', '/api/save-progress', {
      studentId: '10888',
      studentAuthToken: newPinOk.data.studentAuthToken,
      progress: {
        name: '김시트',
        studentId: '10888',
        grade: 1,
        level: 10,
        exp: 420,
        gold: 777,
        hp: 150,
        maxHp: 150,
        inventory: [
          { item: 'equip_heritage_blade', name: '⚔️ 1897 숭실 헤리티지 소드', count: 1, icon: '⚔️' },
          { item: 'item_wood', name: '🪵 단단한 목재', count: 12, icon: '🪵' }
        ],
        equipment: {
          weapon: { item: 'equip_heritage_blade', name: '⚔️ 1897 숭실 헤리티지 소드' },
          helmet: null,
          armor: null,
          shoes: null,
          accessory: null,
          accessory2: null
        },
        quests: {
          quest_library_missing_books: { status: 'done', completedAt: 1700000000000 }
        },
        hasClearedFirstBoss: true,
        hasCafeteriaKey: true,
        titles: ['역사 수호자'],
        equippedTitle: '역사 수호자',
        updatedAt: Date.now()
      }
    });
    assert.strictEqual(saveRes.status, 200);
    await new Promise(r => setTimeout(r, 1800));

    const bk10888 = mockBackupRows.get('10888');
    assert(bk10888 && bk10888.progressJson, 'Full progress snapshot must be pushed to 진행백업 tab');
    const parsedBk = JSON.parse(bk10888.progressJson);
    assert.strictEqual(parsedBk.exp, 420);
    assert.strictEqual(parsedBk.hasClearedFirstBoss, true);
    assert.strictEqual(parsedBk.pinPlain, undefined, 'Snapshot JSON must never contain plaintext PIN');
    assert.strictEqual(parsedBk.pinHash, undefined, 'Snapshot JSON must never contain pinHash');

    // 8. Wipe local DB (simulate Render disk reset!) -> verify /api/admin/all-students-progress auto-restores full state!
    const wipeRes = await reqJson(3000, 'POST', '/api/admin/clear-all-students-progress', {}, adminHeaders);
    assert.strictEqual(wipeRes.status, 200);

    // Simulate teacher raising gold in 학생계정 sheet directly while Render disk is wiped
    const prevAcctRow = mockSheetRows.get('10888');
    mockSheetRows.set('10888', { ...prevAcctRow, gold: 888 });

    const autoAllRes = await reqJson(3000, 'GET', '/api/admin/all-students-progress', null, adminHeaders);
    assert.strictEqual(autoAllRes.status, 200);
    const restored10888 = autoAllRes.data.students['10888'];
    assert(restored10888, 'Wiped DB must auto-restore 10888 from Google Sheet + 진행백업');
    assert.strictEqual(restored10888.level, 10);
    assert.strictEqual(restored10888.exp, 420);
    assert.strictEqual(restored10888.gold, 888, 'Direct edit in 학생계정 sheet column must win on merge');
    assert.strictEqual(restored10888.equipment.weapon.item, 'equip_heritage_blade');
    assert.strictEqual(restored10888.inventory.find(i => i.item === 'item_wood').count, 12);
    assert.strictEqual(restored10888.hasClearedFirstBoss, true);
    assert.strictEqual(restored10888.hasCafeteriaKey, true);
    assert.strictEqual(restored10888.equippedTitle, '역사 수호자');
    assert.strictEqual(restored10888.quests.quest_library_missing_books.status, 'done');

    // 9. Wipe local DB again -> verify immediate student login (pullSingleStudentFromSheet) restores full RPG state cleanly!
    const wipeRes2 = await reqJson(3000, 'POST', '/api/admin/clear-all-students-progress', {}, adminHeaders);
    assert.strictEqual(wipeRes2.status, 200);

    const loginRestoreRes = await reqJson(3000, 'POST', '/api/auth/student-login', {
      studentId: '10888',
      name: '김시트',
      email: 's10888@senedu.kr',
      pin: '9876'
    });
    assert.strictEqual(loginRestoreRes.status, 200, JSON.stringify(loginRestoreRes));
    assert.strictEqual(loginRestoreRes.data.isNewAccount, false, 'Restored account should not look brand new');
    assert.strictEqual(loginRestoreRes.data.progress.pinPlain, undefined);
    assert.strictEqual(loginRestoreRes.data.progress.exp, 420);
    assert.strictEqual(loginRestoreRes.data.progress.gold, 888);
    assert.strictEqual(loginRestoreRes.data.progress.equipment.weapon.item, 'equip_heritage_blade');
    assert.strictEqual(loginRestoreRes.data.progress.hasClearedFirstBoss, true);

    console.log('✅ All Google Sheets bidirectional account + plaintext PIN + 진행백업 full snapshot tests PASSED!');
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
