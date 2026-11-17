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
  const worldJs = fs.readFileSync(path.join(cwd, 'public/js/world.js'), 'utf8');
  const engineJs = fs.readFileSync(path.join(cwd, 'public/js/engine.js'), 'utf8');
  const mainJs = fs.readFileSync(path.join(cwd, 'public/js/main.js'), 'utf8');
  const serverJs = fs.readFileSync(path.join(cwd, 'server.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(cwd, 'public/index.html'), 'utf8');

  // 1. Static parity checks across Cafeteria students, Hallway Note 4, Gym Key, PE Teacher, and Tiny EXP Potion
  const vm = require('vm');
  const worldSandbox = { window: {} };
  vm.runInNewContext(worldJs, worldSandbox);
  const WD = worldSandbox.window.WORLD_DATA;

  const eatingStudents = (WD.classroom_cafeteria.npcs || []).filter(n => n.id && n.id.startsWith('npc_eating_student_'));
  assert(eatingStudents.length >= 6, 'At least 6 eating students must exist in Cafeteria Dining Hall');
  eatingStudents.forEach(st => {
    assert.strictEqual(st.noNameplate, true, `${st.id} must have noNameplate: true`);
  });
  assert(engineJs.includes('if (!npc.noNameplate)'), 'engine.js must skip nameplate rendering when npc.noNameplate is true');

  const f3DevNote4 = (WD.floors[3].interactive || []).find(i => i.type === 'dev_note_4');
  assert(f3DevNote4 && f3DevNote4.x === 2 && f3DevNote4.y === 13, 'dev_note_4 must be in floors[3].interactive at (2, 13)');
  assert(!WD.playground_gym.devNote4, 'playground_gym.devNote4 must be removed');
  assert(engineJs.includes("obj.type === 'dev_note_4'"), 'engine.js renderHallway must draw dev_note_4');

  const gymKeyObj = (WD.classroom_staff_office.interactive || []).find(i => i.type === 'quest_gym_key');
  assert(gymKeyObj && gymKeyObj.x === 73 && gymKeyObj.y === 15.5, 'quest_gym_key must be placed on Staff Office Seat 20 (x:73)');
  const seat20 = (WD.classroom_staff_office.seats || []).find(s => s.id === 20);
  assert(seat20 && seat20.x === 73, 'Staff Office seat 20 must match x:73');

  const gymPeTeacher = (WD.classroom_gym.npcs || []).find(n => n.id === 'npc_teacher_pe_grade2');
  assert(gymPeTeacher && gymPeTeacher.questId === 'quest_pe_errand', '2학년 체육선생님 must stand inside Gym stage with quest_pe_errand');
  assert(gymPeTeacher.x >= 1 && gymPeTeacher.x <= 13 && gymPeTeacher.y >= 10 && gymPeTeacher.y <= 16, '2학년 체육선생님 must be on Gym stage');

  assert(serverJs.includes("'item_tiny_exp_potion'") && mainJs.includes("'item_tiny_exp_potion'"), 'item_tiny_exp_potion registered on client & server');
  assert(serverJs.includes("'quest_pe_errand'") && mainJs.includes("'quest_pe_errand'"), 'quest_pe_errand registered on client & server');
  assert(indexHtml.includes('value="item_tiny_exp_potion"'), 'Admin grant dropdown includes item_tiny_exp_potion');
  assert(mainJs.includes('handleStaffGymKeyInteraction') && mainJs.includes("hasItem('item_gym_key')"), 'Gym key pickup & door lock check exist');
  console.log('✓ Static checks passed (Cafeteria eating students, 3F Dev Note 4, Seat 20 Key, Gym PE Teacher, Tiny EXP Potion).');

  // 2. Live Server Tests for quest_pe_errand & /api/item/use-exp-potion
  const dataDir = path.join(cwd, 'data');
  const progressPath = path.join(dataDir, 'students_progress.json');
  const deletedPath = path.join(dataDir, 'deleted_students.json');
  const backups = {
    progress: fs.existsSync(progressPath) ? fs.readFileSync(progressPath, 'utf8') : null,
    deleted: fs.existsSync(deletedPath) ? fs.readFileSync(deletedPath, 'utf8') : null
  };

  let proc = null;
  const testPort = 3458;
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

    const sid = '12999';
    const loginRes = await reqJson(testPort, 'POST', '/api/auth/student-login', {
      studentId: sid,
      name: '체육심부름테스터',
      email: 'pe_errand_test@senedu.kr',
      pin: '1111'
    });
    assert.strictEqual(loginRes.status, 200);
    const token = loginRes.data.studentAuthToken;
    const authHeaders = { 'X-Student-Token': token };

    // 2a. Lv.11 cannot complete quest_pe_errand
    await reqJson(testPort, 'POST', '/api/save-progress', {
      studentId: sid,
      studentAuthToken: token,
      progress: {
        studentId: sid,
        name: '체육심부름테스터',
        level: 11,
        exp: 0,
        gold: 0,
        inventory: [{ item: 'item_gym_key', name: '2학년 체육관 열쇠', count: 1, icon: '🔑', type: 'quest' }],
        quests: {
          quest_pe_errand: { status: 'in_progress', keyCollected: true }
        }
      }
    });
    const lv11Fail = await reqJson(testPort, 'POST', '/api/quest/complete', {
      studentId: sid,
      questId: 'quest_pe_errand'
    }, authHeaders);
    assert.strictEqual(lv11Fail.status, 403, 'Lv.11 must not complete Lv.12 PE errand quest');

    // 2b. Lv.12 completes quest_pe_errand -> 100G + 3x item_tiny_exp_potion, item_gym_key cleaned up
    await reqJson(testPort, 'POST', '/api/save-progress', {
      studentId: sid,
      studentAuthToken: token,
      progress: {
        studentId: sid,
        name: '체육심부름테스터',
        level: 12,
        exp: 1195,
        gold: 0,
        inventory: [{ item: 'item_gym_key', name: '2학년 체육관 열쇠', count: 1, icon: '🔑', type: 'quest' }],
        quests: {
          quest_pe_errand: { status: 'in_progress', keyCollected: true }
        }
      }
    });
    const errandOk = await reqJson(testPort, 'POST', '/api/quest/complete', {
      studentId: sid,
      questId: 'quest_pe_errand'
    }, authHeaders);
    assert.strictEqual(errandOk.status, 200);
    assert.strictEqual(errandOk.data.quests.quest_pe_errand.status, 'done');
    assert.strictEqual(errandOk.data.gold, 100);
    const keyAfter = (errandOk.data.inventory || []).find(i => i.item === 'item_gym_key');
    assert(!keyAfter, 'item_gym_key must be consumed upon delivering to PE teacher');
    const expPotAfter = (errandOk.data.inventory || []).find(i => i.item === 'item_tiny_exp_potion');
    assert(expPotAfter && expPotAfter.count === 3, 'quest_pe_errand must reward 3x item_tiny_exp_potion');
    console.log('✓ Live PE Errand Quest Lv.12 gate + completion rewards (100G + 3x Tiny EXP Potion) passed.');

    // 2c. Use Tiny EXP Potion -> +50 EXP triggers level up 12 (1195/1200) -> Lv.13 (exp: 45) and consumes 1 potion
    const usePotRes = await reqJson(testPort, 'POST', '/api/item/use-exp-potion', {
      studentId: sid,
      itemId: 'item_tiny_exp_potion'
    }, authHeaders);
    assert.strictEqual(usePotRes.status, 200);
    assert.strictEqual(usePotRes.data.expGained, 50);
    assert.strictEqual(usePotRes.data.level, 13, '1195 + 50 = 1245 EXP at Lv.12 must level up to Lv.13');
    assert.strictEqual(usePotRes.data.exp, 45, 'Remaining EXP after Lv.12->13 rollover must be 45');
    const expPotRemaining = (usePotRes.data.inventory || []).find(i => i.item === 'item_tiny_exp_potion');
    assert(expPotRemaining && expPotRemaining.count === 2, 'Using 1 Tiny EXP Potion must leave 2 in inventory');
    console.log('✓ Live /api/item/use-exp-potion (+50 EXP + level-up + inventory consumption) passed.');
  } finally {
    if (proc) {
      try { proc.kill(); } catch (_) {}
      await new Promise(r => setTimeout(r, 300));
    }
    if (backups.progress !== null) fs.writeFileSync(progressPath, backups.progress, 'utf8');
    if (backups.deleted !== null) fs.writeFileSync(deletedPath, backups.deleted, 'utf8');
  }
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
