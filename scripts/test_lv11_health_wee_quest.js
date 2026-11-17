const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

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
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (_) { resolve({ status: res.statusCode, raw: body }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  const cwd = path.join(__dirname, '..');
  const serverJs = fs.readFileSync(path.join(cwd, 'server.js'), 'utf8');
  const mainJs = fs.readFileSync(path.join(cwd, 'public/js/main.js'), 'utf8');
  const worldJs = fs.readFileSync(path.join(cwd, 'public/js/world.js'), 'utf8');
  const engineJs = fs.readFileSync(path.join(cwd, 'public/js/engine.js'), 'utf8');

  // 1. Static parity verification
  for (const qid of ['quest_health_emergency', 'quest_wee_heart_signal', 'quest_wee_hope_broadcast']) {
    assert(serverJs.includes(`'${qid}'`), `server.js missing ${qid}`);
    assert(mainJs.includes(`'${qid}'`), `main.js missing ${qid}`);
  }
  assert(serverJs.includes("'equip_healing_brooch'") && mainJs.includes("'equip_healing_brooch'"), 'equip_healing_brooch must exist in server & client');
  assert(mainJs.includes("'title_heart_guardian'"), 'title_heart_guardian must exist in TITLE_DEFINITIONS');
  assert(worldJs.includes('questId: "quest_health_emergency"'), 'npc_nurse must have questId');
  assert(worldJs.includes('questId: "quest_wee_heart_signal"'), 'npc_counselor_wee must have questId');
  assert(engineJs.includes("'npc_nurse', 'npc_counselor_wee'"), 'engine.js must lookup chained NPC quest status');
  console.log('✓ Static quest/item/title/NPC parity verified');

  // 2. Live authoritative /api/quest/complete progression test
  const dataDir = path.join(cwd, 'data');
  const progressPath = path.join(dataDir, 'students_progress.json');
  const deletedPath = path.join(dataDir, 'deleted_students.json');
  const backups = {
    progress: fs.existsSync(progressPath) ? fs.readFileSync(progressPath, 'utf8') : null,
    deleted: fs.existsSync(deletedPath) ? fs.readFileSync(deletedPath, 'utf8') : null
  };

  let proc = null;
  const testPort = 3457;
  try {
    proc = spawn(process.execPath, ['server.js'], {
      cwd,
      env: { ...process.env, PORT: String(testPort) },
      stdio: 'ignore'
    });
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const ping = await reqJson(testPort, 'GET', '/api/health');
        if (ping.status === 200) break;
      } catch (_) {}
    }

    const sid = '11999';
    const loginRes = await reqJson(testPort, 'POST', '/api/auth/student-login', {
      studentId: sid,
      name: '장편테스터',
      email: 'lv11test@senedu.kr',
      pin: '1111'
    });
    assert.strictEqual(loginRes.status, 200);
    const token = loginRes.data.studentAuthToken;
    const authHeaders = { 'X-Student-Token': token };

    // 2a. Lv.10 blocked on Lv.11 quest
    await reqJson(testPort, 'POST', '/api/save-progress', {
      studentId: sid,
      studentAuthToken: token,
      progress: {
        studentId: sid,
        name: '장편테스터',
        level: 10,
        exp: 0,
        gold: 50,
        inventory: [{ item: 'item_herb', name: '향긋한 허브', count: 5, icon: '🌿' }],
        quests: {
          quest_health_emergency: { status: 'in_progress', cabinetChecked: true, libRecipeFound: true }
        }
      }
    });
    const lv10Fail = await reqJson(testPort, 'POST', '/api/quest/complete', {
      studentId: sid,
      questId: 'quest_health_emergency'
    }, authHeaders);
    assert.strictEqual(lv10Fail.status, 403, 'Lv.10 student must not complete Lv.11 quest');

    // 2b. Raise to Lv.11, but try skipping Act 1 directly to Act 2 -> blocked by requiresDone
    await reqJson(testPort, 'POST', '/api/save-progress', {
      studentId: sid,
      studentAuthToken: token,
      progress: {
        studentId: sid,
        name: '장편테스터',
        level: 11,
        exp: 0,
        gold: 50,
        inventory: [{ item: 'item_herb', name: '향긋한 허브', count: 5, icon: '🌿' }],
        quests: {
          quest_health_emergency: { status: 'in_progress', cabinetChecked: true, libRecipeFound: false },
          quest_wee_heart_signal: { status: 'in_progress', mailboxChecked: true, storageClueFound: true, broadcastFixed: true }
        }
      }
    });
    const skipFail = await reqJson(testPort, 'POST', '/api/quest/complete', {
      studentId: sid,
      questId: 'quest_wee_heart_signal'
    }, authHeaders);
    assert.strictEqual(skipFail.status, 400, 'Must not skip Act 1 before Act 2');

    // Also cannot complete Act 1 while libRecipeFound is false
    const incompleteAct1 = await reqJson(testPort, 'POST', '/api/quest/complete', {
      studentId: sid,
      questId: 'quest_health_emergency'
    }, authHeaders);
    assert.strictEqual(incompleteAct1.status, 400);

    // 2c. Complete Act 1 cleanly
    await reqJson(testPort, 'POST', '/api/save-progress', {
      studentId: sid,
      studentAuthToken: token,
      progress: {
        studentId: sid,
        name: '장편테스터',
        level: 11,
        exp: 0,
        gold: 50,
        inventory: [{ item: 'item_herb', name: '향긋한 허브', count: 5, icon: '🌿' }],
        quests: {
          quest_health_emergency: { status: 'in_progress', cabinetChecked: true, libRecipeFound: true },
          quest_wee_heart_signal: { status: 'in_progress', mailboxChecked: true, storageClueFound: true, broadcastFixed: true },
          quest_wee_hope_broadcast: { status: 'in_progress', nurseCoopConfirmed: true, stageSpeechDone: true, teaCeremonyDone: true }
        }
      }
    });

    const act1Ok = await reqJson(testPort, 'POST', '/api/quest/complete', {
      studentId: sid,
      questId: 'quest_health_emergency'
    }, authHeaders);
    assert.strictEqual(act1Ok.status, 200, JSON.stringify(act1Ok));
    assert.strictEqual(act1Ok.data.gold, 200);
    assert(act1Ok.data.inventory.some(i => i.item === 'item_elixir' && i.count >= 2));

    // 2d. Complete Act 2 cleanly
    const act2Ok = await reqJson(testPort, 'POST', '/api/quest/complete', {
      studentId: sid,
      questId: 'quest_wee_heart_signal'
    }, authHeaders);
    assert.strictEqual(act2Ok.status, 200, JSON.stringify(act2Ok));
    assert.strictEqual(act2Ok.data.gold, 400);
    assert(act2Ok.data.inventory.some(i => i.item === 'item_courage_potion' && i.count >= 2));
    assert(act2Ok.data.inventory.some(i => i.item === 'item_protection_potion' && i.count >= 2));

    // 2e. Complete Act 3 Finale cleanly -> brooch + shard + title
    const act3Ok = await reqJson(testPort, 'POST', '/api/quest/complete', {
      studentId: sid,
      questId: 'quest_wee_hope_broadcast'
    }, authHeaders);
    assert.strictEqual(act3Ok.status, 200, JSON.stringify(act3Ok));
    assert.strictEqual(act3Ok.data.gold, 750);
    assert(act3Ok.data.inventory.some(i => i.item === 'equip_healing_brooch'), 'Must reward Lv.11 accessory equip_healing_brooch');
    assert(act3Ok.data.inventory.some(i => i.item === 'item_stainless_shard'), 'Must reward Tier 5 material');
    assert(Array.isArray(act3Ok.data.titles) && act3Ok.data.titles.includes('🩺🕊️ 숭실 심신 수호자'), 'Must unlock title');

    console.log('✅ Lv.11 3-Act Health Office & Wee Class Feature-Length Quest Suite PASSED!');
  } finally {
    if (proc) proc.kill();
    if (backups.progress !== null) fs.writeFileSync(progressPath, backups.progress, 'utf8');
    else if (fs.existsSync(progressPath)) fs.unlinkSync(progressPath);
    if (backups.deleted !== null) fs.writeFileSync(deletedPath, backups.deleted, 'utf8');
    else if (fs.existsSync(deletedPath)) fs.unlinkSync(deletedPath);
  }
}

runTests().catch(err => {
  console.error('❌ test_lv11_health_wee_quest FAILED:', err);
  process.exit(1);
});
