const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));
app.use(express.text({ type: ['text/plain', 'text/*'], limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Data files
const DATA_DIR = path.join(__dirname, 'data');
const g1Questions = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'questions_grade1.json'), 'utf8'));
const g2Questions = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'questions_grade2.json'), 'utf8'));
const g3Questions = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'questions_grade3.json'), 'utf8'));
const craftRecipes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'craft_recipes.json'), 'utf8'));
const schoolFloors = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'school_floors.json'), 'utf8'));

// Grade Question Pool (No cumulative mixing across grades)
function getQuestionsForGrade(grade) {
  const g = [1, 2, 3].includes(grade) ? grade : 1;
  const list = JSON.parse(fs.readFileSync(path.join(DATA_DIR, `questions_grade${g}.json`), 'utf8'));
  if (!list || list.length === 0) {
    // 2·3학년 문항 미구현 시 검증된 1학년 문항 풀(295문항)을 안전하게 fallback 제공
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'questions_grade1.json'), 'utf8'));
  }
  return list;
}

// REST APIs
app.get('/api/floors', (req, res) => {
  res.json(schoolFloors);
});

app.get('/api/quiz', (req, res) => {
  const grade = parseInt(req.query.grade) || 1;
  const questions = getQuestionsForGrade(grade);
  res.json(questions);
});

app.get('/api/craft-recipes', (req, res) => {
  const grade = parseInt(req.query.grade) || 1;
  const latestRecipes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'craft_recipes.json'), 'utf8'));
  const filtered = latestRecipes.filter(r => r.gradeLevel <= grade);
  res.json(filtered);
});

// Teacher Question Addition / Update API
app.post('/api/admin/questions', (req, res) => {
  const { grade, questionData } = req.body;
  if (!grade || !questionData) return res.status(400).json({ error: 'Invalid data' });

  let targetFile = `questions_grade${grade}.json`;
  let targetPath = path.join(DATA_DIR, targetFile);
  let questions = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

  questionData.id = `q_custom_${Date.now()}`;
  questions.push(questionData);

  fs.writeFileSync(targetPath, JSON.stringify(questions, null, 2), 'utf8');
  res.json({ success: true, question: questionData });
});

// ========================================================
// PERSISTENT STUDENT PROGRESS STORAGE (2-Month Curriculum)
// ========================================================
const PROGRESS_FILE = path.join(DATA_DIR, 'students_progress.json');
const DELETED_FILE = path.join(DATA_DIR, 'deleted_students.json');
const PLANT_FILE = path.join(DATA_DIR, 'plant_progress.json');
const SERVER_STATE_FILE = path.join(DATA_DIR, 'server_state.json');

// 🔒 Teacher Server Gate State (Persistent)
let serverGateState = {
  isOpen: true,
  closedMessage: "지금은 서버 점검 및 수업 준비 중입니다.\n선생님께서 서버를 개방하실 때까지 잠시 대기해주세요!",
  updatedAt: Date.now(),
  updatedBy: "교사"
};

if (fs.existsSync(SERVER_STATE_FILE)) {
  try {
    const sData = JSON.parse(fs.readFileSync(SERVER_STATE_FILE, 'utf8'));
    if (typeof sData.isOpen === 'boolean') serverGateState.isOpen = sData.isOpen;
    if (sData.closedMessage) serverGateState.closedMessage = sData.closedMessage;
    if (sData.updatedAt) serverGateState.updatedAt = sData.updatedAt;
    if (sData.updatedBy) serverGateState.updatedBy = sData.updatedBy;
  } catch (e) {
    console.error('[Server State Load Error]', e);
  }
}

function saveServerGateState() {
  try {
    fs.writeFileSync(SERVER_STATE_FILE, JSON.stringify(serverGateState, null, 2), 'utf8');
  } catch (e) {
    console.error('[Server State Save Error]', e);
  }
}

let plantWaterCount = 0;
if (fs.existsSync(PLANT_FILE)) {
  try {
    const pData = JSON.parse(fs.readFileSync(PLANT_FILE, 'utf8'));
    plantWaterCount = pData.waterCount || 0;
  } catch (e) {}
}

function savePlantProgress() {
  try {
    fs.writeFileSync(PLANT_FILE, JSON.stringify({ waterCount: plantWaterCount }, null, 2), 'utf8');
  } catch (e) {
    console.error('[Plant Progress Save Error]', e);
  }
}

if (!fs.existsSync(PROGRESS_FILE)) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({}), 'utf8');
}
if (!fs.existsSync(DELETED_FILE)) {
  fs.writeFileSync(DELETED_FILE, JSON.stringify({}), 'utf8');
}

let studentsProgressCache = null;
let saveProgressTimer = null;

function getStudentsProgress() {
  if (!studentsProgressCache) {
    try {
      if (fs.existsSync(PROGRESS_FILE)) {
        studentsProgressCache = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      } else {
        studentsProgressCache = {};
      }
    } catch (e) {
      console.error('[Progress Load Error]', e);
      studentsProgressCache = {};
    }
  }
  return studentsProgressCache;
}

function saveStudentsProgress(allData, immediate = false) {
  studentsProgressCache = allData;
  if (immediate) {
    if (saveProgressTimer) {
      clearTimeout(saveProgressTimer);
      saveProgressTimer = null;
    }
    try {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(studentsProgressCache, null, 2), 'utf8');
    } catch (e) {
      console.error('[Progress Save Sync Error]', e);
    }
    return;
  }

  if (!saveProgressTimer) {
    saveProgressTimer = setTimeout(() => {
      saveProgressTimer = null;
      fs.writeFile(PROGRESS_FILE, JSON.stringify(studentsProgressCache, null, 2), 'utf8', (err) => {
        if (err) console.error('[Progress Save Async Error]', err);
      });
    }, 1000); // 1초 배치 비동기 디바운스
  }
}

function flushProgressOnExit() {
  if (studentsProgressCache) {
    try {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(studentsProgressCache, null, 2), 'utf8');
    } catch (e) {}
  }
}
process.on('SIGINT', () => { flushProgressOnExit(); process.exit(0); });
process.on('SIGTERM', () => { flushProgressOnExit(); process.exit(0); });

function getDeletedStudents() {
  try {
    if (fs.existsSync(DELETED_FILE)) {
      return JSON.parse(fs.readFileSync(DELETED_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

function saveDeletedStudents(data) {
  try {
    fs.writeFileSync(DELETED_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('[Deleted Save Error]', e);
  }
}

app.get('/api/load-progress', (req, res) => {
  const studentId = (req.query.studentId || '').trim();
  if (!studentId) return res.status(400).json({ error: 'Missing studentId' });
  const all = getStudentsProgress();
  const deletedMap = getDeletedStudents();
  res.json({
    success: true,
    progress: all[studentId] || null,
    deletedAt: deletedMap[studentId] || 0
  });
});

app.post('/api/save-progress', (req, res) => {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {}
  }
  const { studentId, progress } = body || {};
  if (!studentId || !progress) return res.status(400).json({ error: 'Invalid data' });
  const all = getStudentsProgress();
  all[studentId] = {
    ...progress,
    studentId: studentId,
    updatedAt: progress.updatedAt || Date.now()
  };
  saveStudentsProgress(all);

  // If this student was previously deleted, remove from deleted map now that fresh data exists
  const deletedMap = getDeletedStudents();
  if (deletedMap[studentId]) {
    delete deletedMap[studentId];
    saveDeletedStudents(deletedMap);
  }

  // Real-time synchronization to active connected student
  const activeStudent = Object.values(players).find(p => p.studentId === studentId);
  if (activeStudent) {
    if (progress.level !== undefined) activeStudent.level = progress.level;
    if (progress.gold !== undefined) activeStudent.gold = progress.gold;
    if (progress.exp !== undefined) activeStudent.exp = progress.exp;
    if (progress.name) activeStudent.name = progress.name;
    if (progress.hp !== undefined) activeStudent.hp = progress.hp;
    if (progress.maxHp !== undefined) activeStudent.maxHp = progress.maxHp;
    if (progress.isFallen !== undefined) activeStudent.isFallen = progress.isFallen;
    // 관리자(교사)의 직접 수정일 때만 학생에게 알림 동기화 전송 (학생 자신의 저장은 알림 미전송)
    if (body.fromAdmin) {
      io.to(activeStudent.id).emit('student_progress_sync_from_admin', { ...all[studentId], studentId });
    }
    broadcastStudentList();
  }

  res.json({ success: true });
});

app.get('/api/admin/export-progress', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename=students_progress_backup.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(fs.readFileSync(PROGRESS_FILE, 'utf8'));
});

// Download Complete Item Drop Table & Acquisition Routes Excel (.xlsx)
app.get('/api/admin/download-item-drops-excel', (req, res) => {
  const excelPath = path.join(__dirname, 'public', 'downloads', 'soongsil_rpg_item_drops_catalog.xlsx');
  const filename = encodeURIComponent('숭실중_영어RPG_아이템획득경로_드랍테이블.xlsx');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${filename}`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  if (fs.existsSync(excelPath)) {
    return res.sendFile(excelPath);
  }
  try {
    const { buildItemDropWorkbook } = require('./scripts/generate_item_excel.js');
    const XLSX = require('xlsx');
    const wb = buildItemDropWorkbook();
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return res.send(buf);
  } catch (err) {
    console.error('[Excel Generation Error]', err);
    return res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

app.post('/api/admin/restore-progress', (req, res) => {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }
  const allData = (body && body.allData) || body;
  if (!allData || typeof allData !== 'object' || Array.isArray(allData)) {
    return res.status(400).json({ error: '올바른 백업 JSON 형식이 아닙니다.' });
  }
  saveStudentsProgress(allData, true);
  res.json({ success: true, count: Object.keys(allData).length });
});

app.get('/api/server-status', (req, res) => {
  res.json({
    isOpen: serverGateState.isOpen,
    closedMessage: serverGateState.closedMessage,
    updatedAt: serverGateState.updatedAt,
    updatedBy: serverGateState.updatedBy
  });
});

app.get('/api/admin/all-students-progress', (req, res) => {
  res.json({ success: true, students: getStudentsProgress() });
});

app.post('/api/admin/clear-all-students-progress', (req, res) => {
  studentsProgressCache = {};
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({}, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to clear students_progress.json:', e);
  }
  Object.values(players).forEach(p => {
    if (!p.isTeacher) {
      p.level = 1;
      p.exp = 0;
      p.gold = 10;
      p.inventory = [];
      p.equipment = { weapon: null, helmet: null, armor: null, shoes: null, accessory: null, accessory2: null };
      p.isAccessory2Unlocked = false;
      io.to(p.id).emit('student_progress_reset_by_admin', { studentId: p.studentId });
    }
  });
  broadcastStudentList();
  res.json({ success: true });
});

app.post('/api/admin/delete-student-progress', (req, res) => {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }
  const studentId = (body && body.studentId || '').trim();
  if (!studentId) return res.status(400).json({ error: 'Missing studentId' });
  const all = getStudentsProgress();
  if (all[studentId]) {
    delete all[studentId];
    saveStudentsProgress(all, true);
  }

  // Record deleted timestamp so student client cannot resurrect from browser localStorage
  const deletedMap = getDeletedStudents();
  deletedMap[studentId] = Date.now();
  saveDeletedStudents(deletedMap);

  // If student is currently online, notify their client immediately to clear and reset
  const activeStudent = Object.values(players).find(p => p.studentId === studentId);
  if (activeStudent) {
    io.to(activeStudent.id).emit('student_progress_reset_by_admin', { studentId });
    activeStudent.level = 1;
    activeStudent.exp = 0;
    activeStudent.gold = 10;
    broadcastStudentList();
  }

  res.json({ success: true });
});

// Game State
const players = {}; // socketId -> player data
const mutedStudents = new Set(); // student names or socket IDs
const chatLogs = []; // for teacher review

// ========================================================
// 1학년 3반 컴퓨터실 산성비 4석 동시 플레이 제한 (Active Seats - 전역 공유)
// ========================================================
const activeAcidRainPlayers = new Map(); // socket.id -> { studentId, name, seatIndex, joinedAt }

function broadcastAcidRainSeats() {
  const list = Array.from(activeAcidRainPlayers.values());
  io.emit('acid_rain_seats_update', {
    activeCount: list.length,
    maxSeats: 4,
    players: list.map(p => ({ name: p.name, seatIndex: p.seatIndex }))
  });
}

// ========================================================
// 숭실 3v3 브롤볼 (Brawl Ball) 실시간 큐 & 매칭 상태
// ========================================================
let brawlQueue = []; // array of { socketId, studentId, name, avatar, joinedAt }
let brawlMatch = null;
let brawlTimerInterval = null;

const BRAWL_BOT_PRESETS = [
  { name: '번개 슈터', avatar: 'boy_blue', role: 'striker' },
  { name: '철벽 수비수', avatar: 'girl_yellow', role: 'defender' },
  { name: '스피드 윙어', avatar: 'boy_green', role: 'winger' },
  { name: '골든 키커', avatar: 'girl_pink', role: 'striker' },
  { name: '불꽃 태클러', avatar: 'boy_purple', role: 'defender' },
  { name: '바람 패서', avatar: 'girl_orange', role: 'midfielder' }
];

function broadcastBrawlQueue() {
  io.emit('brawl_queue_updated', {
    queue: brawlQueue.map(p => ({
      socketId: p.socketId,
      name: p.name,
      studentId: p.studentId,
      avatar: p.avatar
    })),
    count: brawlQueue.length,
    maxCount: 6,
    activeMatch: brawlMatch ? {
      matchId: brawlMatch.matchId,
      status: brawlMatch.status,
      score: brawlMatch.score,
      timeRemaining: brawlMatch.timeRemaining
    } : null
  });
}

function startBrawlMatchFromQueue(forceBots = false) {
  if (brawlMatch && brawlMatch.status === 'playing') return;

  let candidates = [...brawlQueue];
  if (candidates.length < 6 && forceBots) {
    let botIdx = 0;
    while (candidates.length < 6) {
      const preset = BRAWL_BOT_PRESETS[botIdx % BRAWL_BOT_PRESETS.length];
      candidates.push({
        socketId: 'bot_' + Math.random().toString(36).substring(2, 8),
        studentId: 'bot_' + (botIdx + 1),
        name: `🤖 ${preset.name}`,
        avatar: preset.avatar,
        role: preset.role,
        isBot: true
      });
      botIdx++;
    }
  }

  if (candidates.length < 6) return;

  // Select 6 players and remove real players from queue
  const matchPlayers = candidates.slice(0, 6);
  const matchedSocketIds = new Set(matchPlayers.filter(p => !p.isBot).map(p => p.socketId));
  brawlQueue = brawlQueue.filter(p => !matchedSocketIds.has(p.socketId));

  // Fisher-Yates random shuffle for 3:3 random team assignment
  for (let i = matchPlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [matchPlayers[i], matchPlayers[j]] = [matchPlayers[j], matchPlayers[i]];
  }

  // Blue Team (South, attacks North goal)
  const blueTeam = matchPlayers.slice(0, 3).map((p, idx) => {
    const spawns = [
      { x: 43 * 32, y: 44 * 32 },
      { x: 38 * 32, y: 42 * 32 },
      { x: 48 * 32, y: 42 * 32 }
    ];
    return {
      ...p,
      team: 'blue',
      teamIdx: idx,
      spawnX: spawns[idx].x,
      spawnY: spawns[idx].y,
      x: spawns[idx].x,
      y: spawns[idx].y
    };
  });

  // Red Team (North, attacks South goal)
  const redTeam = matchPlayers.slice(3, 6).map((p, idx) => {
    const spawns = [
      { x: 43 * 32, y: 26 * 32 },
      { x: 38 * 32, y: 28 * 32 },
      { x: 48 * 32, y: 28 * 32 }
    ];
    return {
      ...p,
      team: 'red',
      teamIdx: idx,
      spawnX: spawns[idx].x,
      spawnY: spawns[idx].y,
      x: spawns[idx].x,
      y: spawns[idx].y
    };
  });

  brawlMatch = {
    matchId: 'brawl_' + Date.now(),
    status: 'playing',
    startedAt: Date.now(),
    kickoffUntil: Date.now() + 3000,
    timeRemaining: 150, // 2분 30초
    score: { blue: 0, red: 0 },
    teams: { blue: blueTeam, red: redTeam },
    powerups: [],
    ball: {
      x: 43 * 32,
      y: 35 * 32,
      vx: 0,
      vy: 0,
      carrierId: null,
      carrierName: '',
      carrierTeam: null
    }
  };

  clearInterval(brawlTimerInterval);
  brawlTimerInterval = setInterval(() => {
    if (!brawlMatch || brawlMatch.status === 'ended') {
      clearInterval(brawlTimerInterval);
      return;
    }
    if (brawlMatch.status !== 'playing') {
      return; // Pause countdown during goal celebration
    }
    if (brawlMatch.kickoffUntil && Date.now() < brawlMatch.kickoffUntil) {
      return; // Pause match timer during 3-2-1 kickoff countdown
    }
    brawlMatch.timeRemaining--;
    io.emit('brawl_match_tick', {
      timeRemaining: brawlMatch.timeRemaining,
      score: brawlMatch.score
    });

    // Server-synchronized field power-up drink spawn (every 14s, starting at 142s remaining)
    if (
      brawlMatch.timeRemaining > 0 &&
      brawlMatch.timeRemaining <= 142 &&
      (142 - brawlMatch.timeRemaining) % 14 === 0 &&
      Array.isArray(brawlMatch.powerups) &&
      brawlMatch.powerups.length < 2
    ) {
      const spawnPoints = [
        { x: 36 * 32, y: 29 * 32 },
        { x: 50 * 32, y: 29 * 32 },
        { x: 36 * 32, y: 41 * 32 },
        { x: 50 * 32, y: 41 * 32 }
      ];
      const available = spawnPoints.filter(sp => !brawlMatch.powerups.some(pw => Math.hypot(pw.x - sp.x, pw.y - sp.y) < 20));
      if (available.length > 0) {
        const spot = available[Math.floor(Math.random() * available.length)];
        const newDrink = {
          id: 'pw_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          type: Math.random() < 0.5 ? 'speed' : 'shield',
          x: spot.x,
          y: spot.y
        };
        brawlMatch.powerups.push(newDrink);
        io.emit('brawl_powerup_spawned_event', newDrink);
      }
    }

    if (brawlMatch.timeRemaining <= 0) {
      clearInterval(brawlTimerInterval);
      let winner = 'draw';
      if (brawlMatch.score.blue > brawlMatch.score.red) winner = 'blue';
      else if (brawlMatch.score.red > brawlMatch.score.blue) winner = 'red';
      endBrawlMatch(winner, '⏱️ 경기 시간 종료!');
    }
  }, 1000);

  // Sync server-side human player positions to their kickoff spawn points
  const allMatched = [...blueTeam, ...redTeam];
  for (const m of allMatched) {
    if (!m.isBot && m.socketId && players[m.socketId]) {
      const p = players[m.socketId];
      p.x = m.spawnX;
      p.y = m.spawnY;
      p.direction = (m.team === 'blue') ? 'up' : 'down';
      const roomName = `server_${p.grade}_f${p.floor}_${p.room}`;
      io.to(roomName).emit('player_moved', {
        id: p.id,
        x: p.x,
        y: p.y,
        direction: p.direction
      });
    }
  }

  // Broadcast match start
  io.emit('brawl_match_started', {
    match: brawlMatch
  });

  broadcastBrawlQueue();
}

function endBrawlMatch(winnerTeam, reason = '경기 종료') {
  if (!brawlMatch) return;
  clearInterval(brawlTimerInterval);
  brawlMatch.status = 'ended';

  const finalScore = { ...brawlMatch.score };

  io.emit('brawl_match_ended', {
    winnerTeam,
    score: finalScore,
    reason
  });

  const resetDelay = (winnerTeam === 'aborted') ? 2500 : 4000;
  setTimeout(() => {
    brawlMatch = null;
    broadcastBrawlQueue();
  }, resetDelay);
}

// Boss Raid Event State (Teacher Controlled)
let bossRaidEvent = {
  active: false,
  name: '👾 가죽 골렘',
  level: 10,
  mode: 'coop',       // 'coop' (협동 공유 체력) or 'solo' (개인별 레이드)
  unitFilter: 'ALL',  // 'ALL', 'L1', 'L2', 'L3', 'L4'
  maxHp: 2000,
  currentHp: 2000,
  atk: 30,
  def: 14,
  rewardGold: 50,
  rewardExp: 100,
  duration: 180,      // 3분 제한 시간
  startedAt: 0,
  expiresAt: 0,
  participants: {}
};

// Global Defeated Field Monsters (농구장 & 풋살장 몬스터 글로벌 리스폰 동기화)
const defeatedFieldMobs = {};

// Master Item Catalog for Teacher Grant & Game Systems
const ALL_GAME_ITEMS = {
  // 1. Materials
  'item_wood': { name: '단단한 목재', icon: '🪵', meta: { type: 'material', effect: '장비 제작 기본 재료' } },
  'item_herb': { name: '향긋한 허브', icon: '🌿', meta: { type: 'material', effect: '물약 및 주문서 제작 재료' } },
  'item_forsythia': { name: '노란 개나리 꽃잎', icon: '🌼', meta: { type: 'material', effect: '교화 개나리 장신구 및 주홍 물약 재료' } },
  'item_ginkgo': { name: '황금 은행잎', icon: '🍂', meta: { type: 'material', effect: '교목 은행나무 부적 및 부활 주문서 재료' } },
  'item_boss_leather': { name: '질긴 보스의 가죽', icon: '🥋', meta: { type: 'material', effect: '가죽 골렘 전리품 · 2티어 가죽 장비 필수 재료' } },
    'item_history_essence': { name: '🏛️ 숭실 역사의 정수', icon: '🏛️', meta: { type: 'material', effect: '역사관 몬스터 전리품 · 4티어 헤리티지 무기 필수 재료' } },
  'item_unyielding_stone': { name: '💎 꺾이지 않는 사명석', icon: '💎', meta: { type: 'material', effect: '역사관 몬스터 전리품 · 4티어 헤리티지 무기 핵심 재료' } },
  'equip_heritage_blade': { name: '⚔️ 1897 숭실 헤리티지 소드', icon: '⚔️', meta: { type: 'equipment', slot: 'weapon', stats: { atk: 45, def: 0, hp: 35 }, effect: '4티어 무기 · 공격력 +45, 체력 +35' } },
  'equip_heritage_helmet': { name: '👑 1897 숭실 헤리티지 투구', icon: '👑', meta: { type: 'equipment', slot: 'helmet', stats: { atk: 0, def: 20, hp: 35 }, effect: '4티어 투구 · 방어력 +20, 체력 +35' } },
  'equip_heritage_armor': { name: '🛡️ 1897 숭실 헤리티지 갑옷', icon: '🛡️', meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 30, hp: 45 }, effect: '4티어 갑옷 · 방어력 +30, 체력 +45' } },
  'equip_heritage_boots': { name: '👑 1897 숭실 헤리티지 부츠', icon: '👟', meta: { type: 'equipment', slot: 'shoes', stats: { atk: 6, def: 6, hp: 15 }, effect: '4티어 신발' } },
  'equip_bronze_shoes': { name: '🥉 청동 스파이크', icon: '👟', meta: { type: 'equipment', slot: 'shoes', stats: { atk: 5, def: 5, hp: 10 }, effect: '3티어 신발 · 숭실 역사관 보물' } },
  'item_bronze_heart': { name: '청동 드래곤의 심장', icon: '❤️‍🔥', meta: { type: 'material', effect: '청동 드래곤 전리품 · 3티어 청동 장비 필수 재료' } },
  'item_golem_weakness_scroll': { name: '📜 한강우의 골렘 연화 비책', icon: '📜', meta: { type: 'quest', effect: '나무 세트 3종 착용 제자에게 전수된 비책 · 가죽 골렘 1:1 레이드 시 골렘 체력 50% 반감 (2,000 HP ➔ 1,000 HP)' } },
  'item_cafeteria_key': { name: '급식실 열쇠', icon: '🔑', meta: { type: 'quest', effect: '12레벨 이상 급식실 정문 출입용 황금 열쇠' } },
  'equip_shoes_samdidas': { name: '👟 삼디다스 실내화', icon: '👟', meta: { type: 'equipment', slot: 'shoes', stats: { atk: 2, def: 2, hp: 10 }, effect: '누구나 한 번쯤 사 신어봤다는 전설의 국민 실내화. 뒤축을 살짝 꺾어 신으면 복도 끝까지 쏜살같이 질주할 수 있을 것만 같다. [특수 효과] Shift 키를 누르면 질주가 가능합니다.' } },
  'item_basketball_leather': { name: '농구공 가죽 조각', icon: '🏀', meta: { type: 'material', effect: '농구장 몬스터 전리품 · 가죽 장비 제작 재료' } },
  'item_futsal_leather': { name: '탄력있는 풋살공 가죽', icon: '⚽', meta: { type: 'material', effect: '풋살장 몬스터 전리품 · 고급 방어구 및 장비 재료' } },
  'item_perfect_exam': { name: '💯 백점만점 시험지', icon: '💯', meta: { type: 'material', effect: '중간고사 대마왕 토벌 전리품 · 📚 시험의 제왕 호칭 교환 재료' } },
  'item_nutrition_essence': { name: '정제된 영양의 정수', icon: '🍱', meta: { type: 'material', effect: '급식실 몬스터 전리품 · 5티어 최고급 장비 제작 필수 재료' } },
  'item_stainless_shard': { name: '특수 강화 스텐 조각', icon: '✨', meta: { type: 'material', effect: '급식실 몬스터 전리품 · 5티어 최고급 장비 제작 핵심 재료' } },

  // 2. Potions & Scrolls
  'item_red_potion': { name: '빨간 물약', icon: '🧪', meta: { type: 'consumable', slot: 'consumable', heal: 10, effect: '체력 +10 회복' } },
  'item_orange_potion': { name: '주홍 물약', icon: '🧪', meta: { type: 'consumable', slot: 'consumable', heal: 25, effect: '체력 +25 회복' } },
  'item_clear_potion': { name: '맑은 물약', icon: '🧪', meta: { type: 'consumable', slot: 'consumable', heal: 40, effect: '사용 시 체력(HP) +40 대량 즉시 회복' } },
  'item_elixir': { name: '엘릭서', icon: '⚗️', meta: { type: 'consumable', slot: 'consumable', heal: 60, effect: '사용 시 체력(HP) +60 초대량 즉시 회복' } },
  'item_green_potion': { name: '초록 물약', icon: '🧪', meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '1분간 기본 이동속도 +10% 증가' } },
  'item_courage_potion': { name: '용기의 물약', icon: '🧪', meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '1분간 공격력(ATK) +5 증가' } },
  'item_protection_potion': { name: '수호의 물약', icon: '🧪', meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '1분간 방어력(DEF) +3 증가' } },
  'item_revive_scroll': { name: '부활 주문서', icon: '📜', meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '쓰러진 친구를 50% 체력으로 부활' } },
  'item_return_scroll': { name: '귀환 주문서', icon: '📜', meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '사용 시 모든 장소에서 7층 복도로 즉시 공간 이동' } },
  'item_teleport_scroll': { name: '순간이동 주문서', icon: '📜', meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '사용 시 각 층 복도 및 운동장으로 즉시 순간이동' } },

  // 3. Equipment
  'equip_wood_sword': { name: '나무검', icon: '🗡️', meta: { type: 'equipment', slot: 'weapon', stats: { atk: 15, def: 0, hp: 0 }, effect: '공격력 +15' } },
  'equip_wood_helmet': { name: '나무투구', icon: '🪖', meta: { type: 'equipment', slot: 'helmet', stats: { atk: 0, def: 8, hp: 25 }, effect: '방어력 +8, 체력 +25' } },
  'equip_wood_armor': { name: '나무갑옷', icon: '🛡️', meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 15, hp: 15 }, effect: '방어력 +15, 체력 +15' } },
  'equip_leather_sword': { name: '가죽손잡이 세이버', icon: '🗡️', meta: { type: 'equipment', slot: 'weapon', stats: { atk: 22, def: 0, hp: 0 }, effect: '공격력 +22' } },
  'equip_leather_helmet': { name: '가죽투구', icon: '⛑️', meta: { type: 'equipment', slot: 'helmet', stats: { atk: 0, def: 12, hp: 28 }, effect: '방어력 +12, 체력 +28' } },
  'equip_leather_armor': { name: '가죽갑옷', icon: '🥋', meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 17, hp: 20 }, effect: '방어력 +17, 체력 +20' } },
  'equip_leather_shoes': { name: '날렵한 가죽 운동화', icon: '👟', meta: { type: 'equipment', slot: 'shoes', stats: { atk: 3, def: 3, hp: 10 }, effect: '2티어 고급 신발' } },
  'equip_forsythia_ring': { name: '성실의 개나리 반지', icon: '🌼', meta: { type: 'equipment', slot: 'accessory', stats: { atk: 10, def: 10, hp: 20 }, effect: '공격력 +10, 방어력 +10, 체력 +20' } },
  'equip_ginkgo_talisman': { name: '합심의 황금 은행잎 부적', icon: '🍂', meta: { type: 'equipment', slot: 'accessory', stats: { atk: 15, def: 10, hp: 30 }, effect: '공격력 +15, 방어력 +10, 체력 +30' } },
  'equip_bronze_sword': { name: '청동검', icon: '⚔️', meta: { type: 'equipment', slot: 'weapon', stats: { atk: 30, def: 0, hp: 0 }, effect: '공격력 +30' } },
  'equip_bronze_helmet': { name: '청동투구', icon: '🪖', meta: { type: 'equipment', slot: 'helmet', stats: { atk: 0, def: 14, hp: 35 }, effect: '방어력 +14, 체력 +35' } },
  'equip_bronze_armor': { name: '청동갑옷', icon: '🛡️', meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 22, hp: 25 }, effect: '방어력 +22, 체력 +25' } },
  'item_eval_paper': { name: 'A+ 만점 수행평가지', icon: '📜', meta: { type: 'material', effect: '케르베로스 전리품 · 수행평가 만점의 증표' } },
  'equip_omr_wand': { name: '컴싸 마법봉', icon: '🖊️', meta: { type: 'equipment', slot: 'weapon', stats: { atk: 45, def: 5, hp: 30 }, effect: '기말고사 파멸신 전리품 · 공격력 +45, 방어력 +5' } },
  'equip_immortal_blade': { name: '불멸의 열정 대검', icon: '⚔️', meta: { type: 'equipment', slot: 'weapon', requiredLevel: 13, stats: { atk: 60, def: 0, hp: 35 }, effect: '5티어 무기 · 공격력 +60, 체력 +35 (Lv.13 이상)' } },
  'equip_immortal_helmet': { name: '불멸의 열정 투구', icon: '👑', meta: { type: 'equipment', slot: 'helmet', requiredLevel: 13, stats: { atk: 0, def: 25, hp: 35 }, effect: '5티어 투구 · 방어력 +25, 체력 +35 (Lv.13 이상)' } },
  'equip_immortal_armor': { name: '불멸의 열정 갑옷', icon: '🛡️', meta: { type: 'equipment', slot: 'armor', requiredLevel: 13, stats: { atk: 0, def: 35, hp: 35 }, effect: '5티어 갑옷 · 방어력 +35, 체력 +35 (Lv.13 이상)' } },
  'equip_elevator_pass': { name: '엘리베이터 작동권', icon: '🪪', meta: { type: 'equipment', slot: 'accessory', isQuestItem: true, stats: { atk: 0, def: 0, hp: 0 }, effect: '🛗 중앙 엘리베이터 가동 인가증' } },
  'item_joshua_memo': { name: 'Joshua의 단어 메모', icon: '📝', meta: { type: 'quest', effect: 'Joshua 선생님이 탕비실에 떨어뜨린 3학년 영어 핵심 단어장 메모' } },
  'item_okchohan_textbook': { name: '옥촣한의 사회 탐구 교재', icon: '📘', meta: { type: 'quest', effect: '사회 옥촣한 선생님의 핵심 사회 탐구 수업 교재' } },
  'item_kimmijin_sketchbook': { name: '김진믜의 풍경화 스케치북', icon: '🎨', meta: { type: 'quest', effect: '미술 김진믜 선생님의 섬세한 풍경화 스케치북' } },
  'item_yosunyu_usb': { name: '요션유의 알고리즘 USB', icon: '💾', meta: { type: 'quest', effect: '정보 요션유 선생님의 파이썬 코딩과 알고리즘 강의 자료가 담긴 고속 USB' } },
  'item_career_guidebook': { name: '진로 적성 검사 안내서', icon: '📘', meta: { type: 'quest', effect: '진로 귐즨숑 선생님의 진로 적성 검사 안내서' } },
  'equip_vintage_armband': { name: '선배의 낡은 승리 완장', icon: '🎗️', meta: { type: 'equipment', slot: 'accessory', isQuestItem: true, stats: { atk: 3, def: 3 }, effect: '공격력 +3, 방어력 +3, [특수] 모든 획득 경험치(EXP) +10% 증가 (매각 불가)' } },

};

// Simple Korean/English Bad Words Filter
const BAD_WORDS = ['바보', '멍청', '시발', '새끼', '지랄', '병신', 'fuck', 'shit', 'idiot', 'damn'];
function filterBadWords(text) {
  let filtered = text;
  for (const word of BAD_WORDS) {
    const reg = new RegExp(word, 'gi');
    filtered = filtered.replace(reg, '*'.repeat(word.length));
  }
  return filtered;
}

// Helper to broadcast active student roster to teachers
function broadcastStudentList() {
  const studentList = Object.values(players)
    .filter(p => !p.isTeacher)
    .map(p => ({
      id: p.id,
      name: p.name,
      studentId: p.studentId,
      grade: p.grade,
      floor: p.floor,
      room: p.room,
      isMuted: mutedStudents.has(p.name) || mutedStudents.has(p.studentId) || mutedStudents.has(p.id)
    }));
  io.emit('teacher_student_list', studentList);
}

// Only allow known equipment ids for character visuals (착용 장비 외형 검증)
function sanitizeGear(g) {
  const out = { weapon: null, helmet: null, armor: null, shoes: null, accessory: null, accessory2: null };
  if (!g || typeof g !== 'object') return out;
  Object.keys(out).forEach(slot => {
    const v = g[slot];
    if (typeof v === 'string' && /^equip_[a-z_]{1,40}$/.test(v)) out[slot] = v;
  });
  return out;
}

// Normalize floor for singleton rooms (playground, career, staff_office, history)
function normalizeSingletonRoomFloor(room, floor) {
  if (room === 'playground' || room === 'playground_gym' || room === 'room_cafeteria') return 1;
  if (room === 'room_career') return 5;
  if (room === 'room_staff_office') return 6;
  if (room === 'room_history') return 0;
  return floor;
}

io.on('connection', (socket) => {
  console.log(`[Connect] Socket ID: ${socket.id}`);

  // 🔒 Send current server gate state immediately to new connection
  socket.emit('server_state_sync', {
    isOpen: serverGateState.isOpen,
    closedMessage: serverGateState.closedMessage
  });

  // Player Login
  socket.on('player_join', (data) => {
    const { name, grade, studentId, avatar, isTeacher, teacherPwd } = data;
    const isVerifiedTeacher = !!isTeacher && teacherPwd === '03220322';

    // 🔒 Teacher Gate Enforcement: If server is closed and not a verified teacher, reject entry
    if (!serverGateState.isOpen && !isVerifiedTeacher) {
      socket.emit('server_entry_rejected', {
        reason: 'server_closed',
        message: serverGateState.closedMessage || "지금은 서버 점검 및 수업 준비 중입니다.\n선생님께서 서버를 개방하실 때까지 잠시 대기해주세요!"
      });
      return;
    }
    const resolvedName = isVerifiedTeacher ? ((name && name !== '교사') ? name : '갓준철') : (name || '학생_' + socket.id.substr(0, 4));
    const initRoom = data.room || 'hallway';
    const initFloor = normalizeSingletonRoomFloor(initRoom, (data.floor !== undefined) ? parseInt(data.floor) : 7);
    players[socket.id] = {
      id: socket.id,
      name: resolvedName,
      studentId: isVerifiedTeacher ? '교사' : (studentId || '10101'),
      grade: parseInt(grade) || 1,
      avatar: avatar || 'student_m1',
      isTeacher: isVerifiedTeacher,
      hp: isVerifiedTeacher ? 9999 : 100,
      maxHp: isVerifiedTeacher ? 9999 : 100,
      atk: isVerifiedTeacher ? 9999 : 10,
      def: isVerifiedTeacher ? 9999 : 2,
      floor: initFloor,
      room: initRoom,
      x: (data.x !== undefined) ? parseInt(data.x) : 14 * 32,
      y: (data.y !== undefined) ? parseInt(data.y) : 11 * 32,
      direction: data.direction || 'down',
      gold: data.gold !== undefined ? data.gold : 10,
      level: data.level || 1,
      exp: data.exp || 0,
      hairColor: ['black', 'brown', 'blonde'].includes(data.hairColor) ? data.hairColor : 'black',
      outfitColor: ['red', 'blue', 'green'].includes(data.outfitColor) ? data.outfitColor : 'red',
      gear: sanitizeGear(data.gear),
      equippedTitle: data.equippedTitle || null,
      inventory: []
    };

    const currentRoom = `server_${players[socket.id].grade}_f${players[socket.id].floor}_${players[socket.id].room}`;
    socket.join(currentRoom);

    // Send initial self data & current Boss Raid state
    socket.emit('init_self', players[socket.id]);
    socket.emit('boss_raid_state', bossRaidEvent);
    socket.emit('plant_water_sync', { waterCount: plantWaterCount });
    socket.emit('field_monsters_state', defeatedFieldMobs);
    socket.emit('brawl_queue_updated', {
      queue: brawlQueue,
      activeMatch: brawlMatch ? { score: brawlMatch.score, timeRemaining: brawlMatch.timeRemaining } : null
    });

    // Broadcast new player to room
    socket.to(currentRoom).emit('player_joined', players[socket.id]);

    // Send existing players in the same room
    const roomPlayers = Object.values(players).filter(p => 
      p.id !== socket.id &&
      p.grade === players[socket.id].grade &&
      p.floor === players[socket.id].floor &&
      p.room === players[socket.id].room
    );
    socket.emit('current_room_players', roomPlayers);
    broadcastStudentList();
  });

  // Movement & Location sync
  socket.on('player_move', (data) => {
    const player = players[socket.id];
    if (!player || !data || typeof data.x !== 'number' || typeof data.y !== 'number') return;

    player.x = data.x;
    player.y = data.y;
    if (data.direction) player.direction = data.direction;

    const currentRoom = `server_${player.grade}_f${player.floor}_${player.room}`;
    socket.to(currentRoom).emit('player_moved', {
      id: socket.id,
      x: player.x,
      y: player.y,
      direction: player.direction
    });
  });

  // Equipped gear visual sync (착용 장비 외형 동기화)
  socket.on('player_gear_update', (gear) => {
    const player = players[socket.id];
    if (!player) return;
    player.gear = sanitizeGear(gear);
    const currentRoom = `server_${player.grade}_f${player.floor}_${player.room}`;
    socket.to(currentRoom).emit('player_gear_updated', { id: socket.id, gear: player.gear });
  });

  // Plant Watering System (100, 1000, 3000 Milestone Growth)
  socket.on('water_plant', (amt) => {
    const increment = (typeof amt === 'number' && amt > 0 && amt <= 100) ? Math.floor(amt) : 1;
    const prevCount = plantWaterCount;
    plantWaterCount += increment;
    savePlantProgress();
    io.emit('plant_water_sync', { waterCount: plantWaterCount, added: increment });

    // Milestones check
    if (prevCount < 100 && plantWaterCount >= 100) {
      io.emit('chat_message', { system: true, message: '🌱 [식물존 1단계 성장] 1학년 복도 식물존이 정성 어린 보살핌으로 건강한 1단계로 자라났습니다! 🌿' });
    } else if (prevCount < 1000 && plantWaterCount >= 1000) {
      io.emit('chat_message', { system: true, message: '🌳 [식물존 2단계 성장] 1학년 복도 식물존이 울창하고 거대한 2단계 대형 식물로 성장했습니다! 🌲' });
    } else if (prevCount < 3000 && plantWaterCount >= 3000) {
      io.emit('chat_message', { system: true, message: '🌸 [식물존 최종 성장] 1학년 복도 식물존에 아름다운 꽃이 활짝 만개했습니다! ✨' });
    }
  });

  socket.on('teacher_set_plant_water', ({ count }) => {
    if (typeof count === 'number' && count >= 0) {
      plantWaterCount = Math.floor(count);
      savePlantProgress();
      io.emit('plant_water_sync', { waterCount: plantWaterCount });
    }
  });

  // Equipped title sync (호칭 착용 동기화)
  socket.on('player_title_update', (title) => {
    const player = players[socket.id];
    if (!player) return;
    player.equippedTitle = typeof title === 'string' ? title.slice(0, 30) : null;
    const currentRoom = `server_${player.grade}_f${player.floor}_${player.room}`;
    socket.to(currentRoom).emit('player_title_updated', { id: socket.id, equippedTitle: player.equippedTitle });
  });

  // Room / Floor Change (Pokemon-style warp)
  socket.on('change_location', (data) => {
    const player = players[socket.id];
    if (!player) return;

    const oldRoom = `server_${player.grade}_f${player.floor}_${player.room}`;
    socket.leave(oldRoom);
    socket.to(oldRoom).emit('player_left', socket.id);

    const nextRoom = data.room || 'hallway';
    const nextFloor = normalizeSingletonRoomFloor(nextRoom, data.floor !== undefined ? data.floor : player.floor);
    player.floor = nextFloor;
    player.room = nextRoom;
    player.x = (typeof data.x === 'number') ? data.x : (data.x || 400);
    player.y = (typeof data.y === 'number') ? data.y : (data.y || 300);

    if (player.room !== 'playground') {
      const bqIdx = brawlQueue.findIndex(p => p.socketId === socket.id);
      if (bqIdx !== -1) {
        brawlQueue.splice(bqIdx, 1);
        broadcastBrawlQueue();
      }
      if (brawlMatch && brawlMatch.status !== 'ended') {
        const allMatchPlayers = [...(brawlMatch.teams.blue || []), ...(brawlMatch.teams.red || [])];
        const leaver = allMatchPlayers.find(p => !p.isBot && p.socketId === socket.id);
        if (leaver) {
          endBrawlMatch('aborted', `⚠️ 참가자(${leaver.name || '선수'}) 이탈로 경기가 종료되었습니다.`);
        }
      }
    }

    const newRoom = `server_${player.grade}_f${player.floor}_${player.room}`;
    socket.join(newRoom);

    // Notify others in new room
    socket.to(newRoom).emit('player_joined', player);

    // Get all others in new room
    const others = Object.values(players).filter(p =>
      p.id !== socket.id &&
      p.grade === player.grade &&
      p.floor === player.floor &&
      p.room === player.room
    );
    socket.emit('current_room_players', others);
  });

  // Chat message
  socket.on('send_chat', (text) => {
    const player = players[socket.id];
    if (!player) return;

    if (mutedStudents.has(player.name) || mutedStudents.has(player.studentId) || mutedStudents.has(socket.id)) {
      socket.emit('chat_muted', { message: '선생님에 의해 채팅이 제한된 상태입니다.' });
      return;
    }

    const cleanText = player.isTeacher ? text : filterBadWords(text);
    const chatItem = {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      senderId: socket.id,
      senderName: player.name,
      studentId: player.studentId,
      grade: player.grade,
      floor: player.floor,
      room: player.room,
      isTeacher: player.isTeacher || false,
      text: cleanText,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    chatLogs.push(chatItem);
    if (chatLogs.length > 200) chatLogs.shift();

    // Broadcast to same floor/server
    const currentRoom = `server_${player.grade}_f${player.floor}_${player.room}`;
    io.to(currentRoom).emit('new_chat', chatItem);

    // Also push to teacher monitoring stream
    io.emit('teacher_chat_log', chatItem);
  });

  // 1:1 Trade System (Disabled per teacher policy - teacher grants items directly)
  socket.on('trade_request', ({ targetId }) => {
    socket.emit('teacher_action_alert', {
      message: '🤝 현재 학생 간 1:1 교환 기능은 비활성화되어 있습니다. (선생님께 요청하세요!)'
    });
  });
  socket.on('trade_offer_update', () => {});
  socket.on('trade_execute', () => {});

  // Teacher Item & Gold Grant System
  socket.on('teacher_grant_item', ({ pwd, targetSocketId, itemKey, count, reason }) => {
    if (pwd !== '03220322') {
      socket.emit('teacher_action_alert', { message: '🔒 교사 암호 인증에 실패했습니다.' });
      return;
    }

    const qty = Math.max(1, parseInt(count) || 1);
    const itemInfo = itemKey === 'gold' 
      ? { name: '골드', icon: '🪙', meta: { type: 'currency' } }
      : ALL_GAME_ITEMS[itemKey];

    if (!itemInfo) {
      socket.emit('teacher_action_alert', { message: '⚠️ 유효하지 않은 아이템 항목입니다.' });
      return;
    }

    const payload = {
      itemKey,
      name: itemInfo.name,
      icon: itemInfo.icon,
      count: qty,
      meta: itemInfo.meta || {},
      reason: reason || ''
    };

    if (targetSocketId === 'ALL') {
      // Grant to all connected students
      io.emit('item_granted', payload);
      io.emit('teacher_announcement_popup', {
        message: `🎁 [선생님 전체 선물] 전교생에게 [${itemInfo.icon} ${itemInfo.name} x${qty}개]가 지급되었습니다!${reason ? ' (' + reason + ')' : ''}`
      });
      socket.emit('teacher_action_alert', {
        message: `✅ [지급 완료] 접속 중인 모든 학생에게 [${itemInfo.icon} ${itemInfo.name} x${qty}개]를 일괄 지급했습니다.`
      });
    } else {
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      const targetPlayer = players[targetSocketId];
      if (targetSocket && targetPlayer) {
        targetSocket.emit('item_granted', payload);
        targetSocket.emit('teacher_announcement_popup', {
          message: `🎁 [선생님 특별 보상] [${itemInfo.icon} ${itemInfo.name} x${qty}개]가 지급되었습니다!${reason ? ' (' + reason + ')' : ''}`
        });
        socket.emit('teacher_action_alert', {
          message: `✅ [지급 완료] '${targetPlayer.name}' 학생에게 [${itemInfo.icon} ${itemInfo.name} x${qty}개]를 정상 지급했습니다.`
        });
      } else {
        socket.emit('teacher_action_alert', { message: '⚠️ 대상 학생이 접속 중이지 않습니다.' });
      }
    }
  });

  // 🔒 Teacher Server Open/Close Toggle (수업 시작 / 종료 제어)
  socket.on('teacher_toggle_server_state', ({ isOpen, message, pwd }) => {
    const isTeacher = socket.isTeacher || (players[socket.id] && players[socket.id].isTeacher) || (pwd === '03220322');
    if (!isTeacher) {
      socket.emit('teacher_action_alert', { message: '⚠️ 교사 권한이 없어 서버 상태를 변경할 수 없습니다.' });
      return;
    }

    serverGateState.isOpen = !!isOpen;
    if (message) serverGateState.closedMessage = message;
    serverGateState.updatedAt = Date.now();
    serverGateState.updatedBy = (players[socket.id] && players[socket.id].name) || '교사';
    saveServerGateState();

    // Broadcast state change to all clients
    io.emit('server_state_changed', {
      isOpen: serverGateState.isOpen,
      closedMessage: serverGateState.closedMessage,
      updatedBy: serverGateState.updatedBy
    });

    // When closing server, safely save & exit all current student players
    if (!serverGateState.isOpen) {
      const studentIds = Object.keys(players).filter(id => !players[id].isTeacher);
      for (const sId of studentIds) {
        const studentSocket = io.sockets.sockets.get(sId);
        if (studentSocket) {
          studentSocket.emit('force_save_and_exit', {
            message: '선생님께서 수업을 종료하여 서버를 닫았습니다.\n지금까지의 모든 진행 상황이 안전하게 저장되었습니다.'
          });
        }
        delete players[sId];
      }
      broadcastStudentList();
    }

    const statusText = serverGateState.isOpen ? '🟢 서버 개방 (수업 시작)' : '🔴 서버 닫힘 (수업 종료)';
    io.emit('teacher_action_alert', { message: `[알림] 선생님에 의해 ${statusText} 상태로 전환되었습니다.` });
  });

  // Teacher Moderation Tools
  socket.on('teacher_mute', ({ studentName, durationMinutes }) => {
    mutedStudents.add(studentName);
    io.emit('teacher_action_alert', { message: `[알림] 학생 '${studentName}'의 채팅이 ${durationMinutes || 10}분간 금지되었습니다.` });
    broadcastStudentList();
  });

  socket.on('teacher_unmute', ({ studentName }) => {
    mutedStudents.delete(studentName);
    io.emit('teacher_action_alert', { message: `[알림] 학생 '${studentName}'의 채팅 금지가 해제되었습니다.` });
    broadcastStudentList();
  });

  socket.on('teacher_kick_player', ({ targetSocketId, studentName }) => {
    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) {
      targetSocket.emit('player_kicked', { message: '선생님에 의해 서버에서 퇴장(강퇴) 조치되었습니다.' });
      targetSocket.disconnect(true);
      io.emit('teacher_action_alert', { message: `[알림] '${studentName || '학생'}'이(가) 선생님에 의해 서버에서 강제 퇴장(강퇴)되었습니다.` });
      delete players[targetSocketId];
      broadcastStudentList();
    }
  });

  socket.on('teacher_get_students', () => {
    broadcastStudentList();
  });

  socket.on('teacher_delete_message', ({ chatId }) => {
    io.emit('chat_deleted', { chatId });
  });

  socket.on('teacher_broadcast', ({ message }) => {
    io.emit('teacher_announcement_popup', { message });
  });

  socket.on('teacher_summon_all_to_me', ({ floor, room, x, y, message }) => {
    const p = players[socket.id];
    if (!p || !p.isTeacher) return;

    const teacherPos = {
      floor: floor || p.floor || 7,
      room: room || p.room || 'hallway',
      x: x !== undefined ? x : p.x,
      y: y !== undefined ? y : p.y,
      teacherName: p.name || '선생님'
    };

    io.emit('teacher_summon_all', teacherPos);

    if (message) {
      io.emit('teacher_announcement_popup', { message });
    }
  });

  // Boss Raid Event Controls (Teacher)
  socket.on('teacher_start_boss_raid', (opts = {}) => {
    const maxHp = Math.max(50, parseInt(opts.maxHp) || 2000);
    const duration = 180; // 3분 제한 시간
    const now = Date.now();
    bossRaidEvent = {
      active: true,
      name: opts.name || '👾 가죽 골렘',
      level: parseInt(opts.level) || 10,
      mode: opts.mode || 'coop',
      unitFilter: opts.unitFilter || 'ALL',
      maxHp: maxHp,
      currentHp: maxHp,
      atk: Math.max(1, parseInt(opts.atk) || 30),
      def: Math.max(0, parseInt(opts.def) || 14),
      rewardGold: Math.max(0, parseInt(opts.rewardGold) || 50),
      rewardExp: Math.max(0, parseInt(opts.rewardExp) || 100),
      duration: duration,
      startedAt: now,
      expiresAt: now + duration * 1000,
      participants: {}
    };

    io.emit('boss_raid_state', bossRaidEvent);

    const bName = bossRaidEvent.name || '';
    const isSoccerBoss = bName.includes('케르베로스') || bName.includes('파멸신') || bName.includes('나태') || bName.includes('대마왕') || bName.includes('드래곤') || bName.includes('dragon');
    const locText = isSoccerBoss ? '숭실 운동장(천연잔디 축구장)' : '1학년 2반';

    if (opts.announce !== false) {
      io.emit('teacher_announcement_popup', {
        message: `🔥 [보스레이드 시작] ${locText}에 '${bossRaidEvent.name}'(HP ${bossRaidEvent.maxHp})이(가) 출현했습니다! (제한시간 3분)`
      });
    }

    if (opts.summonAll) {
      if (isSoccerBoss) {
        io.emit('boss_raid_force_warp', { floor: 1, room: 'playground', x: 18 * 32, y: 35 * 32 });
      } else {
        io.emit('boss_raid_force_warp', { floor: 7, room: 'room_702' });
      }
    }
  });

  socket.on('teacher_stop_boss_raid', () => {
    bossRaidEvent.active = false;
    bossRaidEvent.expiresAt = 0;
    io.emit('boss_raid_state', bossRaidEvent);
    io.emit('teacher_action_alert', {
      message: '⏹️ [알림] 교사에 의해 보스레이드 이벤트가 종료되었습니다.'
    });
  });

// ========================================================
// BOSS RAID SERVER MONITOR (3분 제한시간 및 파티 전멸 Wipe 실시간 감지)
// ========================================================
setInterval(() => {
  const now = Date.now();

  // 0. Field Monsters Expired Respawn Cleanup (농구장 & 풋살장 리스폰 완료 몬스터 제거)
  for (const mId in defeatedFieldMobs) {
    if (now >= defeatedFieldMobs[mId]) {
      delete defeatedFieldMobs[mId];
    }
  }

  if (!bossRaidEvent.active || bossRaidEvent.mode !== 'coop') return;

  // 1. 3분(180초) 타임오버 감지
  if (bossRaidEvent.expiresAt && now >= bossRaidEvent.expiresAt) {
    if (bossRaidEvent.currentHp > 0) {
      bossRaidEvent.active = false;
      bossRaidEvent.currentHp = bossRaidEvent.maxHp;
      bossRaidEvent.participants = {};
      io.emit('boss_raid_timeout', {
        message: '⏰ [레이드 시간 초과] 3분 제한 시간이 초과되었습니다! 보스가 광폭화하여 체력을 완전히 회복하고 모두를 복도로 밀어냈습니다!'
      });
      io.emit('boss_raid_state', bossRaidEvent);
      io.emit('boss_raid_force_warp_hallway');
      return;
    }
  }

  // 2. 보스방 파티 전멸(Wipe) 감지 (전투 중 보스방 안의 생존자가 0명일 때)
  if (bossRaidEvent.currentHp < bossRaidEvent.maxHp && bossRaidEvent.currentHp > 0) {
    const bName = bossRaidEvent.name || '';
    const isSoccerBoss = bName.includes('케르베로스') || bName.includes('파멸신') || bName.includes('나태') || bName.includes('대마왕');
    const targetRoom = isSoccerBoss ? 'playground' : 'room_702';

    const studentsInRoom = Object.values(players).filter(p => !p.isTeacher && p.room === targetRoom);
    const aliveStudents = studentsInRoom.filter(p => !p.isFallen);

    if (aliveStudents.length === 0) {
      const reason = studentsInRoom.length === 0 ? '도전자 전원 후퇴/이탈' : '전원 기절로 파티 전멸';
      bossRaidEvent.currentHp = bossRaidEvent.maxHp;
      bossRaidEvent.participants = {};
      // 전멸 시 3분 타이머도 3분으로 리셋
      bossRaidEvent.startedAt = now;
      bossRaidEvent.expiresAt = now + (bossRaidEvent.duration || 180) * 1000;

      io.emit('boss_raid_wiped', {
        message: `💀 [파티 전멸] ${reason}! 보스가 체력을 완전히 회복했습니다 (HP 100%)!`
      });
      io.emit('boss_raid_hp_sync', {
        currentHp: bossRaidEvent.maxHp,
        maxHp: bossRaidEvent.maxHp
      });
      io.emit('boss_raid_state', bossRaidEvent);
    }
  }
}, 1000);

  // ========================================================
  // TEACHER POP QUIZ & REWARD BROADCAST
  // ========================================================
  socket.on('teacher_start_pop_quiz', (quizData) => {
    io.emit('pop_quiz_started', quizData);
    io.emit('teacher_action_alert', {
      message: `📢 [돌발 퀴즈] 선생님이 전교생 돌발 퀴즈를 출제했습니다! (제한시간 ${quizData.duration || 30}초)`
    });
  });

  socket.on('pop_quiz_solved', ({ studentName, rewardText }) => {
    io.emit('teacher_action_alert', {
      message: `🎉 [돌발 퀴즈 정답] '${studentName || '학생'}'이(가) 정답을 맞혀 [${rewardText || '특별 보상'}]을(를) 획득했습니다!`
    });
  });

  // ========================================================
  // REAL-TIME LEADERBOARD & STATS SYNC
  // ========================================================
  socket.on('get_leaderboard', () => {
    const list = Object.values(players)
      .filter(p => !p.isTeacher && p.name)
      .map(p => ({
        id: p.id,
        name: p.name,
        studentId: p.studentId,
        level: p.level || 1,
        exp: p.exp || 0,
        gold: p.gold || 0
      }))
      .sort((a, b) => (b.level - a.level) || (b.exp - a.exp) || (b.gold - a.gold))
      .slice(0, 5);
    socket.emit('leaderboard_data', list);
  });

  socket.on('player_stats_sync', (stats) => {
    const p = players[socket.id];
    if (p && stats) {
      if (stats.level !== undefined) p.level = stats.level;
      if (stats.exp !== undefined) p.exp = stats.exp;
      if (stats.gold !== undefined) p.gold = stats.gold;
    }
  });

  socket.on('boss_raid_attack', ({ damage }) => {
    if (!bossRaidEvent.active || bossRaidEvent.mode !== 'coop') return;
    const attacker = players[socket.id];
    const dmg = Math.max(1, parseInt(damage) || 5);
    bossRaidEvent.currentHp = Math.max(0, bossRaidEvent.currentHp - dmg);

    const pName = attacker ? attacker.name : '학생';
    const pStudentId = attacker ? attacker.studentId : null;
    if (!bossRaidEvent.participants[socket.id]) {
      bossRaidEvent.participants[socket.id] = { name: pName, damage: 0, studentId: pStudentId };
    }
    bossRaidEvent.participants[socket.id].damage += dmg;

    io.emit('boss_raid_hp_sync', {
      currentHp: bossRaidEvent.currentHp,
      maxHp: bossRaidEvent.maxHp,
      attackerName: pName,
      damage: dmg
    });

    if (bossRaidEvent.currentHp <= 0) {
      bossRaidEvent.active = false;
      const list = Object.values(bossRaidEvent.participants).sort((a, b) => b.damage - a.damage);
      const mvp = list.length > 0 ? list[0] : { name: pName, damage: dmg };

      // 가죽 골렘 토벌 시: 실제 참가하여 공격한 학생들의 영구 세이브에 hasClearedFirstBoss = true 자동 저장
      if (bossRaidEvent.name.includes('골렘') || bossRaidEvent.name.includes('golem')) {
        const all = getStudentsProgress();
        Object.values(bossRaidEvent.participants).forEach(part => {
          if (part.studentId && all[part.studentId]) {
            all[part.studentId].hasClearedFirstBoss = true;
          }
        });
        saveStudentsProgress(all);
      }

      io.emit('boss_raid_cleared', {
        bossName: bossRaidEvent.name,
        rewardGold: bossRaidEvent.rewardGold,
        rewardExp: bossRaidEvent.rewardExp,
        mvp,
        participantIds: Object.keys(bossRaidEvent.participants),
        participantStudentIds: Object.values(bossRaidEvent.participants).map(p => p.studentId).filter(Boolean)
      });
      io.emit('boss_raid_state', bossRaidEvent);
    }
  });

  // Boss Raid Knockout & Revival Sync
  socket.on('player_fallen', ({ name }) => {
    const p = players[socket.id];
    if (p) p.isFallen = true;
    const currentRoom = p ? `server_${p.grade}_f${p.floor}_${p.room}` : null;
    if (currentRoom) {
      io.to(currentRoom).emit('player_status_updated', { id: socket.id, isFallen: true, name: name || (p ? p.name : '학생') });
    }
  });

  socket.on('use_revive_scroll', ({ targetSocketId, targetName }) => {
    const sender = players[socket.id];
    const target = players[targetSocketId];
    const currentRoom = sender ? `server_${sender.grade}_f${sender.floor}_${sender.room}` : null;
    if (currentRoom) {
      io.to(currentRoom).emit('teacher_action_alert', {
        message: `📜 [부활 주문서] ${sender ? sender.name : '친구'} 학생이 ${targetName} 친구에게 부활 주문서를 보냈습니다!`
      });
    }
    const payload = { revivedBy: sender ? sender.name : '친구', senderId: socket.id };
    io.to(targetSocketId).emit('player_revive_offered', payload);
    io.to(targetSocketId).emit('player_revived_event', payload);
  });

  socket.on('player_revive_accepted', ({ name }) => {
    const p = players[socket.id];
    if (p) {
      p.isFallen = false;
    }
    const currentRoom = p ? `server_${p.grade}_f${p.floor}_${p.room}` : null;
    if (currentRoom) {
      io.to(currentRoom).emit('player_status_updated', { id: socket.id, isFallen: false, name: name || (p ? p.name : '학생') });
      io.to(currentRoom).emit('teacher_action_alert', {
        message: `✨ [전투 복귀] ${name || (p ? p.name : '학생')} 학생이 부활을 수락하고 전장으로 복귀했습니다!`
      });
    }
  });

  socket.on('player_respawn_hallway', () => {
    const p = players[socket.id];
    if (!p) return;

    const oldRoom = `server_${p.grade}_f${p.floor}_${p.room}`;
    socket.leave(oldRoom);
    socket.to(oldRoom).emit('player_left', socket.id);

    p.isFallen = false;
    p.room = 'hallway';
    p.x = 15 * 32;
    p.y = 10 * 32;

    const newRoom = `server_${p.grade}_f${p.floor}_${p.room}`;
    socket.join(newRoom);
    socket.to(newRoom).emit('player_joined', p);
    io.to(newRoom).emit('player_status_updated', { id: socket.id, isFallen: false, name: p.name || '학생' });

    // Sync other players in hallway to the respawned player
    const others = Object.values(players).filter(other =>
      other.id !== socket.id &&
      other.grade === p.grade &&
      other.floor === p.floor &&
      other.room === p.room
    );
    socket.emit('current_room_players', others);
  });

  socket.on('field_monster_defeat', ({ mobId, respawnSec }) => {
    if (!mobId) return;
    const respawnAt = Date.now() + (parseInt(respawnSec) || 15) * 1000;
    defeatedFieldMobs[mobId] = respawnAt;
    const killer = players[socket.id];
    const killerName = killer ? killer.name : '동료';
    io.emit('field_monster_defeated_sync', {
      mobId,
      respawnAt,
      defeatedBy: killerName
    });
  });

  // ========================================================
  // 1학년 3반 컴퓨터실 산성비 4석 동시 플레이 핸들러
  // ========================================================
  socket.on('request_acid_rain_seat', (data = {}, callback) => {
    const isTeacher = socket.isTeacher || (data && data.isTeacher);
    const studentId = data.studentId || (socket.player && socket.player.studentId) || 'unknown';
    const name = data.name || (socket.player && socket.player.name) || '학생';

    if (activeAcidRainPlayers.has(socket.id)) {
      if (typeof callback === 'function') {
        callback({ allowed: true, seatIndex: activeAcidRainPlayers.get(socket.id).seatIndex });
      }
      return;
    }

    if (!isTeacher && activeAcidRainPlayers.size >= 4) {
      if (typeof callback === 'function') {
        callback({
          allowed: false,
          message: '🖥️ [컴퓨터실 이용 안내]\n\n현재 1학년 3반 컴퓨터실의 모든 좌석(4석)에서 친구들이 산성비 타자 연습을 진행 중입니다!\n\n다른 친구가 게임을 마칠 때까지 잠시만 기다려주세요!'
        });
      }
      return;
    }

    const usedSeats = new Set(Array.from(activeAcidRainPlayers.values()).map(p => p.seatIndex));
    let freeSeat = 0;
    for (let i = 0; i < 4; i++) {
      if (!usedSeats.has(i)) {
        freeSeat = i;
        break;
      }
    }

    activeAcidRainPlayers.set(socket.id, {
      studentId,
      name,
      seatIndex: freeSeat,
      joinedAt: Date.now()
    });

    if (typeof callback === 'function') {
      callback({ allowed: true, seatIndex: freeSeat });
    }

    broadcastAcidRainSeats();
  });

  socket.on('leave_acid_rain_seat', () => {
    if (activeAcidRainPlayers.has(socket.id)) {
      activeAcidRainPlayers.delete(socket.id);
      broadcastAcidRainSeats();
    }
  });


  // ========================================================
  // 숭실 3v3 브롤볼 (Brawl Ball) 소켓 핸들러
  // ========================================================
  socket.on('brawl_queue_join', (data = {}) => {
    const studentId = data.studentId || (socket.player && socket.player.studentId) || 'player_' + socket.id.substring(0, 5);
    const name = data.name || (socket.player && socket.player.name) || '학생';
    const avatar = data.avatar || (socket.player && socket.player.avatar) || 'boy_blue';

    if (!brawlQueue.some(p => p.socketId === socket.id)) {
      brawlQueue.push({
        socketId: socket.id,
        studentId,
        name,
        avatar,
        joinedAt: Date.now()
      });
    }
    broadcastBrawlQueue();

    if (brawlQueue.length >= 6) {
      startBrawlMatchFromQueue(false);
    }
  });

  socket.on('brawl_queue_leave', () => {
    const idx = brawlQueue.findIndex(p => p.socketId === socket.id);
    if (idx !== -1) {
      brawlQueue.splice(idx, 1);
      broadcastBrawlQueue();
    }
  });

  socket.on('brawl_queue_start_test', (data = {}) => {
    const p = players[socket.id];
    if (!p || !p.isTeacher) return;

    if (brawlQueue.length === 0) {
      const studentId = data.studentId || p.studentId || 'teacher';
      const name = data.name || p.name || '선생님';
      const avatar = data.avatar || p.avatar || 'teacher';

      brawlQueue.push({
        socketId: socket.id,
        studentId,
        name,
        avatar,
        joinedAt: Date.now()
      });
    }
    startBrawlMatchFromQueue(true);
  });

  socket.on('brawl_ball_kick', (data) => {
    io.emit('brawl_ball_kicked', data);
  });

  socket.on('brawl_player_tackle', (data) => {
    io.emit('brawl_player_tackled', data);
  });

  socket.on('brawl_tackle_hit', (data) => {
    io.emit('brawl_tackle_hit_event', data);
  });

  socket.on('brawl_super_shot', (data) => {
    io.emit('brawl_super_shot_event', data);
  });

  socket.on('brawl_mega_tackle', (data) => {
    io.emit('brawl_mega_tackle_event', data);
  });

  socket.on('brawl_obstacle_break', (data) => {
    io.emit('brawl_obstacle_break_event', data);
  });

  socket.on('brawl_powerup_collected', (data) => {
    if (!data || !data.id) return;
    if (brawlMatch && Array.isArray(brawlMatch.powerups)) {
      const idx = brawlMatch.powerups.findIndex(pw => pw.id === data.id);
      if (idx === -1) return;
      brawlMatch.powerups.splice(idx, 1);
    }
    io.emit('brawl_powerup_collected_event', data);
  });

  socket.on('brawl_ball_sync', (data) => {
    if (brawlMatch) {
      brawlMatch.ball = { ...brawlMatch.ball, ...data };
    }
    socket.broadcast.emit('brawl_ball_synced', data);
  });

  socket.on('brawl_goal_scored', (data) => {
    if (!brawlMatch || brawlMatch.status !== 'playing') return;
    const scoringTeam = data.team;
    if (scoringTeam === 'blue' || scoringTeam === 'red') {
      brawlMatch.status = 'goal_celebration';
      brawlMatch.score[scoringTeam]++;
      io.emit('brawl_goal_scored_event', {
        team: scoringTeam,
        scorerName: data.scorerName || '선수',
        score: brawlMatch.score
      });

      if (brawlMatch.score[scoringTeam] >= 2) {
        endBrawlMatch(scoringTeam, '🔥 2골 선승 달성! 승리!');
      } else {
        setTimeout(() => {
          if (brawlMatch && brawlMatch.status !== 'ended') {
            brawlMatch.status = 'playing';
            brawlMatch.kickoffUntil = Date.now() + 3000;
            brawlMatch.ball = {
              x: 43 * 32,
              y: 35 * 32,
              vx: 0,
              vy: 0,
              carrierId: null,
              carrierName: '',
              carrierTeam: null
            };
            const allMatched = [...(brawlMatch.teams.blue || []), ...(brawlMatch.teams.red || [])];
            for (const m of allMatched) {
              if (m.spawnX !== undefined && m.spawnY !== undefined) {
                m.x = m.spawnX;
                m.y = m.spawnY;
              }
              if (!m.isBot && m.socketId && players[m.socketId]) {
                const p = players[m.socketId];
                p.x = m.spawnX;
                p.y = m.spawnY;
                p.direction = (m.team === 'blue') ? 'up' : 'down';
                const roomName = `server_${p.grade}_f${p.floor}_${p.room}`;
                io.to(roomName).emit('player_moved', {
                  id: p.id,
                  x: p.x,
                  y: p.y,
                  direction: p.direction
                });
              }
            }
            io.emit('brawl_ball_reset', {
              ball: brawlMatch.ball,
              status: 'playing',
              kickoffUntil: brawlMatch.kickoffUntil
            });
          }
        }, 2500);
      }
    }
  });

  socket.on('disconnect', () => {
    const bqIdx = brawlQueue.findIndex(p => p.socketId === socket.id);
    if (bqIdx !== -1) {
      brawlQueue.splice(bqIdx, 1);
      broadcastBrawlQueue();
    }
    if (brawlMatch && brawlMatch.status !== 'ended') {
      const allMatchPlayers = [...(brawlMatch.teams.blue || []), ...(brawlMatch.teams.red || [])];
      const leaver = allMatchPlayers.find(p => !p.isBot && p.socketId === socket.id);
      if (leaver) {
        endBrawlMatch('aborted', `⚠️ 참가자(${leaver.name || '선수'}) 이탈로 경기가 종료되었습니다.`);
      }
    }
    if (activeAcidRainPlayers.has(socket.id)) {
      activeAcidRainPlayers.delete(socket.id);
      broadcastAcidRainSeats();
    }

    const player = players[socket.id];
    if (player) {
      const room = `server_${player.grade}_f${player.floor}_${player.room}`;
      socket.to(room).emit('player_left', socket.id);
      delete players[socket.id];
      broadcastStudentList();
    }
    console.log(`[Disconnect] Socket ID: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🏫 Soongsil Middle School English RPG Server Running!`);
  console.log(`👉 Access URL: http://localhost:${PORT}`);
  console.log(`===================================================`);
});
