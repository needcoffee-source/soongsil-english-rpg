const express = require('express');
const http = require('http');
const https = require('https');
const tls = require('tls');
const { Server } = require('socket.io');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD || '03220322';
const ALLOWED_EMAIL_DOMAIN = (process.env.ALLOWED_EMAIL_DOMAIN || 'senedu.kr').trim().toLowerCase();
const activeTeacherTokens = new Set();
const activeStudentSessions = new Map(); // token -> { studentId, email, name, expiresAt }
const revokedStudentBefore = new Map(); // studentId -> timestamp
const SESSION_HMAC_SECRET = crypto.createHash('sha256')
  .update(String(process.env.AUTH_SECRET || TEACHER_PASSWORD) + ':soongsil-session-v1')
  .digest();
const IDLE_AUTO_CLOSE_MS = Math.max(1000, Number(process.env.IDLE_AUTO_CLOSE_MS) || (20 * 60 * 1000));
let lastOccupiedAt = Date.now();

function signSessionPayload(payloadObj) {
  const encoded = Buffer.from(JSON.stringify(payloadObj), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_HMAC_SECRET).update(encoded).digest('hex');
  return `${encoded}.${sig}`;
}

function verifySessionPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) return null;
  const encoded = token.slice(0, dotIdx);
  const sigHex = token.slice(dotIdx + 1);
  if (!encoded || !sigHex) return null;
  try {
    const expectedHex = crypto.createHmac('sha256', SESSION_HMAC_SECRET).update(encoded).digest('hex');
    const a = Buffer.from(sigHex, 'hex');
    const b = Buffer.from(expectedHex, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload || typeof payload !== 'object' || !payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch (_) {
    return null;
  }
}

function issueTeacherToken() {
  const exp = Date.now() + 24 * 3600 * 1000;
  const token = signSessionPayload({
    k: 'teacher',
    exp,
    n: crypto.randomBytes(8).toString('hex')
  });
  if (activeTeacherTokens.size >= 32) {
    const oldest = activeTeacherTokens.values().next().value;
    activeTeacherTokens.delete(oldest);
  }
  activeTeacherTokens.add(token);
  return token;
}

function isValidTeacherToken(token) {
  if (!token || typeof token !== 'string') return false;
  if (activeTeacherTokens.has(token)) return true;
  const payload = verifySessionPayload(token);
  if (payload && payload.k === 'teacher') {
    activeTeacherTokens.add(token);
    return true;
  }
  return false;
}

function isAuthorizedTeacherHttp(req) {
  const token = req.headers['x-teacher-token'] || (req.query && req.query.token);
  const pwd = req.headers['x-teacher-pwd'];
  return !!(
    isValidTeacherToken(token) ||
    (typeof pwd === 'string' && pwd === TEACHER_PASSWORD)
  );
}

function requireTeacherHttp(req, res, next) {
  if (!isAuthorizedTeacherHttp(req)) {
    return res.status(401).json({ success: false, error: '🔒 교사 인증이 필요합니다.' });
  }
  return next();
}

function isSoccerFieldBoss(name = '') {
  const bName = String(name || '');
  return (
    bName.includes('케르베로스') ||
    bName.includes('파멸신') ||
    bName.includes('기말고사') ||
    bName.includes('나태') ||
    bName.includes('대마왕') ||
    bName.includes('중간고사') ||
    bName.includes('드래곤') ||
    bName.includes('dragon') ||
    bName.includes('cerberus') ||
    bName.includes('final_god') ||
    bName.includes('sloth')
  );
}

app.use(express.json({ limit: '2mb' }));
app.use(express.text({ type: ['text/plain', 'text/*'], limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Data files
const DATA_DIR = path.join(__dirname, 'data');
const g1Questions = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'questions_grade1.json'), 'utf8'));
const g2Questions = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'questions_grade2.json'), 'utf8'));
const g3Questions = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'questions_grade3.json'), 'utf8'));
const craftRecipes = loadCraftRecipesSafe([]);
const schoolFloors = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'school_floors.json'), 'utf8'));

function loadCraftRecipesSafe(fallback = null) {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, 'craft_recipes.json'), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    console.error('[Craft Recipes Load Error]', e.message);
    return fallback;
  }
}

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
  const latestRecipes = loadCraftRecipesSafe(craftRecipes) || [];
  const filtered = latestRecipes.filter(r => r.gradeLevel <= grade);
  res.json(filtered);
});

// Teacher Authentication API
app.post('/api/teacher-auth', (req, res) => {
  const body = (typeof req.body === 'string') ? (() => { try { return JSON.parse(req.body); } catch (e) { return {}; } })() : (req.body || {});
  const entered = String(body.password || '').trim();
  if (entered !== TEACHER_PASSWORD) {
    return res.status(401).json({ success: false, error: '🔒 교사 인증 암호가 일치하지 않습니다.' });
  }
  const token = issueTeacherToken();
  return res.json({ success: true, token });
});

// Teacher Question Addition / Update API
app.post('/api/admin/questions', requireTeacherHttp, (req, res) => {
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
const ROSTER_FILE = path.join(DATA_DIR, 'student_roster.json');
const SHEETS_CONFIG_FILE = path.join(DATA_DIR, 'google_sheets_config.json');
const DEFAULT_SPREADSHEET_ID = '1r-fa5wMoNLPLQX3j3dfo75UEzOkPPApaUD46yOtCwk4';

let googleSheetsConfig = {
  spreadsheetId: DEFAULT_SPREADSHEET_ID,
  sheetName: '학생계정',
  webAppUrl: '',
  syncSecret: '',
  syncPinOnLogin: true,
  autoPushChanges: true,
  lastSyncAt: 0,
  lastSyncMessage: ''
};

if (fs.existsSync(SHEETS_CONFIG_FILE)) {
  try {
    const parsedCfg = JSON.parse(fs.readFileSync(SHEETS_CONFIG_FILE, 'utf8'));
    if (parsedCfg && typeof parsedCfg === 'object') {
      googleSheetsConfig = { ...googleSheetsConfig, ...parsedCfg };
    }
  } catch (e) {
    console.error('[Google Sheets Config Load Error]', e);
  }
} else {
  try {
    fs.writeFileSync(SHEETS_CONFIG_FILE, JSON.stringify(googleSheetsConfig, null, 2), 'utf8');
  } catch (e) {}
}

function saveGoogleSheetsConfig() {
  try {
    fs.writeFileSync(SHEETS_CONFIG_FILE, JSON.stringify(googleSheetsConfig, null, 2), 'utf8');
  } catch (e) {
    console.error('[Google Sheets Config Save Error]', e);
  }
}

function isGoogleSheetsReady() {
  return !!(googleSheetsConfig.webAppUrl && /^https?:\/\//i.test(String(googleSheetsConfig.webAppUrl).trim()));
}

function formatSheetTimestamp(ts) {
  if (!ts) return '';
  try {
    return new Date(Number(ts)).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false });
  } catch (e) {
    return '';
  }
}

const SHEET_SNAPSHOT_EXCLUDED_KEYS = new Set([
  'pinHash',
  'pinSalt',
  'pinPlain',
  'studentAuthToken'
]);

function extractProgressSnapshotFromRecord(rec = {}) {
  if (!rec || typeof rec !== 'object' || Array.isArray(rec)) return '';
  const snap = {};
  for (const [k, v] of Object.entries(rec)) {
    if (SHEET_SNAPSHOT_EXCLUDED_KEYS.has(k) || k.startsWith('_') || v === undefined) continue;
    snap[k] = v;
  }
  try {
    const json = JSON.stringify(snap);
    return json.length <= 49000 ? json : '';
  } catch (e) {
    return '';
  }
}

function parseProgressSnapshotJson(rawJson) {
  if (!rawJson || typeof rawJson !== 'string') return null;
  const trimmed = rawJson.trim();
  if (!trimmed || trimmed[0] !== '{') return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    for (const badKey of SHEET_SNAPSHOT_EXCLUDED_KEYS) {
      delete parsed[badKey];
    }
    delete parsed.studentId;
    return parsed;
  } catch (e) {
    return null;
  }
}

function hasSubstantialRpgProgress(rec = {}) {
  if (!rec || typeof rec !== 'object') return false;
  if (Array.isArray(rec.inventory) && rec.inventory.length > 0) return true;
  if ((Number(rec.exp) || 0) > 0) return true;
  if ((Number(rec.level) || 1) > 1) return true;
  if (rec.hasClearedFirstBoss || rec.hasClearedDragonRaid || rec.hasClearedCerberusRaid || rec.hasClearedClass704 || rec.hasCafeteriaKey) return true;
  if (rec.quests && typeof rec.quests === 'object' && Object.keys(rec.quests).length > 0) return true;
  if (rec.equipment && typeof rec.equipment === 'object' && Object.values(rec.equipment).some(v => v && v.item)) return true;
  return false;
}

function mergeSnapshotIntoExistingRecord(rec, snap) {
  if (!rec || !snap) return false;
  const localTs = Number(rec.updatedAt) || 0;
  const snapTs = Number(snap.updatedAt) || 0;
  const shouldRestore =
    (!hasSubstantialRpgProgress(rec) && hasSubstantialRpgProgress(snap)) ||
    (snapTs > 0 && snapTs > localTs);
  if (!shouldRestore) return false;

  const preservedAuth = {
    ...(rec.pinHash ? { pinHash: rec.pinHash } : {}),
    ...(rec.pinSalt ? { pinSalt: rec.pinSalt } : {}),
    ...(rec.pinPlain ? { pinPlain: rec.pinPlain } : {}),
    ...(rec.authProvider ? { authProvider: rec.authProvider } : {})
  };
  Object.assign(rec, snap, preservedAuth);
  return true;
}

function buildSheetRowFromRecord(studentId, rec = {}, opts = {}) {
  const plainPin = /^\d{4}$/.test(String(rec.pinPlain || '').trim())
    ? String(rec.pinPlain).trim()
    : '';
  return {
    studentId: String(studentId || '').trim(),
    name: String(rec.name || '').trim(),
    email: String(rec.email || '').trim().toLowerCase(),
    pin: plainPin,
    clearPin: !!opts.clearPin,
    level: Math.max(1, Number(rec.level) || 1),
    gold: Math.max(0, Number(rec.gold) || 0),
    registeredAt: formatSheetTimestamp(rec.registeredAt),
    updatedAt: formatSheetTimestamp(rec.updatedAt || Date.now()),
    progressJson: extractProgressSnapshotFromRecord(rec)
  };
}

let _cachedSystemCaBundle = null;
function getCombinedSystemCaCertificates() {
  if (_cachedSystemCaBundle) return _cachedSystemCaBundle;
  try {
    if (typeof tls.getCACertificates === 'function') {
      const merged = new Set([
        ...tls.getCACertificates('default'),
        ...tls.getCACertificates('system')
      ]);
      _cachedSystemCaBundle = Array.from(merged);
      return _cachedSystemCaBundle;
    }
  } catch (e) {}
  _cachedSystemCaBundle = [...tls.rootCertificates];
  return _cachedSystemCaBundle;
}

function requestHttpWithRedirects(targetUrl, method = 'POST', bodyStr = '', timeoutMs = 6000, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch (e) {
      return reject(new Error('올바르지 않은 URL입니다.'));
    }
    const isHttps = parsedUrl.protocol === 'https:';
    const lib = isHttps ? https : http;
    const reqOpts = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      method,
      headers: (method === 'POST' || method === 'PUT')
        ? {
            'Content-Type': 'text/plain;charset=utf-8',
            'Content-Length': Buffer.byteLength(bodyStr || '')
          }
        : {},
      timeout: timeoutMs,
      ...(isHttps ? { ca: getCombinedSystemCaCertificates() } : {})
    };
    const req = lib.request(reqOpts, (res) => {
      const code = res.statusCode || 0;
      if ([301, 302, 303, 307, 308].includes(code) && res.headers.location && redirectsLeft > 0) {
        res.resume();
        const nextUrl = new URL(res.headers.location, targetUrl).toString();
        const nextMethod = (code === 307 || code === 308) ? method : 'GET';
        const nextBody = (nextMethod === 'GET') ? '' : bodyStr;
        return requestHttpWithRedirects(nextUrl, nextMethod, nextBody, timeoutMs, redirectsLeft - 1)
          .then(resolve, reject);
      }
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => resolve({ status: code, text: raw }));
    });
    req.on('timeout', () => {
      req.destroy(new Error(`요청 시간 초과 (${timeoutMs}ms)`));
    });
    req.on('error', reject);
    if (bodyStr && (method === 'POST' || method === 'PUT')) {
      req.write(bodyStr);
    }
    req.end();
  });
}

async function callGoogleAppsScript(payload = {}, timeoutMs = 8000) {
  if (!isGoogleSheetsReady()) {
    throw new Error('구글 Apps Script 웹 앱 URL이 설정되어 있지 않습니다.');
  }
  const bodyObj = {
    ...payload,
    secret: googleSheetsConfig.syncSecret || ''
  };
  const { status, text } = await requestHttpWithRedirects(
    String(googleSheetsConfig.webAppUrl).trim(),
    'POST',
    JSON.stringify(bodyObj),
    timeoutMs
  );
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    if (text.includes('<!DOCTYPE') || text.includes('accounts.google.com')) {
      throw new Error('구글 로그인 화면이 반환되었습니다. Apps Script [배포 -> 웹 앱]에서 액세스 권한을 "모든 사용자"로 설정하고 /exec 주소를 입력해 주세요.');
    }
    throw new Error(`Apps Script 응답 파싱 실패 (HTTP ${status})`);
  }
  if (status < 200 || status >= 300 || !parsed || !parsed.success) {
    throw new Error((parsed && parsed.error) || `Apps Script 요청 실패 (HTTP ${status})`);
  }
  return parsed;
}

async function pullSingleStudentFromSheet(studentId) {
  if (!isGoogleSheetsReady()) return null;
  try {
    const res = await callGoogleAppsScript({ action: 'getOne', studentId }, 3500);
    return (res && res.found && res.row) ? res.row : null;
  } catch (e) {
    console.warn('[Sheets Pull One Warning]', studentId, e.message);
    return null;
  }
}

async function pushSingleStudentToSheet(studentId, opts = {}) {
  if (pendingSheetSyncTimers.has(studentId)) {
    clearTimeout(pendingSheetSyncTimers.get(studentId));
    pendingSheetSyncTimers.delete(studentId);
  }
  if (!isGoogleSheetsReady()) return false;
  const all = getStudentsProgress() || {};
  const rec = all[studentId];
  if (!rec) return false;
  try {
    await callGoogleAppsScript({
      action: 'upsertOne',
      row: buildSheetRowFromRecord(studentId, rec, opts)
    }, 4500);
    googleSheetsConfig.lastSyncAt = Date.now();
    googleSheetsConfig.lastSyncMessage = `[자동 반영] ${studentId} 동기화 완료`;
    saveGoogleSheetsConfig();
    return true;
  } catch (e) {
    console.warn('[Sheets Push One Warning]', studentId, e.message);
    googleSheetsConfig.lastSyncMessage = `[자동 반영 실패] ${e.message}`;
    return false;
  }
}

const pendingSheetSyncTimers = new Map();
function scheduleSheetStudentSync(studentId, opts = {}) {
  if (!isGoogleSheetsReady() || !googleSheetsConfig.autoPushChanges || !studentId || studentId === '교사') return;
  if (pendingSheetSyncTimers.has(studentId)) {
    clearTimeout(pendingSheetSyncTimers.get(studentId));
  }
  const t = setTimeout(() => {
    pendingSheetSyncTimers.delete(studentId);
    pushSingleStudentToSheet(studentId, opts).catch(() => {});
  }, 1500);
  pendingSheetSyncTimers.set(studentId, t);
}

function buildCustomizedAppsScriptCode() {
  const templatePath = path.join(__dirname, 'google_apps_script', '학생계정_연동_Code.gs');
  let raw = '';
  try {
    raw = fs.readFileSync(templatePath, 'utf8');
  } catch (e) {
    return '// 템플릿 파일을 찾을 수 없습니다.';
  }
  const sid = String(googleSheetsConfig.spreadsheetId || DEFAULT_SPREADSHEET_ID).trim();
  const sName = String(googleSheetsConfig.sheetName || '학생계정').trim() || '학생계정';
  const secret = String(googleSheetsConfig.syncSecret || '').trim();
  return raw
    .replace(/const SPREADSHEET_ID = '[^']*';/, `const SPREADSHEET_ID = '${sid.replace(/'/g, "\\'")}';`)
    .replace(/const SHEET_NAME = '[^']*';/, `const SHEET_NAME = '${sName.replace(/'/g, "\\'")}';`)
    .replace(/const SYNC_SECRET = '[^']*';/, `const SYNC_SECRET = '${secret.replace(/'/g, "\\'")}';`);
}

// 🔒 Teacher Server Gate & Auth Mode State (Persistent)
let serverGateState = {
  isOpen: true,
  closedMessage: "지금은 서버 점검 및 수업 준비 중입니다.\n선생님께서 서버를 개방하실 때까지 잠시 대기해주세요!",
  allowEmergencyStudentLogin: false,
  requireRosterWhitelist: false,
  updatedAt: Date.now(),
  updatedBy: "교사"
};

if (fs.existsSync(SERVER_STATE_FILE)) {
  try {
    const sData = JSON.parse(fs.readFileSync(SERVER_STATE_FILE, 'utf8'));
    if (typeof sData.isOpen === 'boolean') serverGateState.isOpen = sData.isOpen;
    if (sData.closedMessage) serverGateState.closedMessage = sData.closedMessage;
    if (typeof sData.allowEmergencyStudentLogin === 'boolean') {
      serverGateState.allowEmergencyStudentLogin = sData.allowEmergencyStudentLogin;
    }
    if (typeof sData.requireRosterWhitelist === 'boolean') {
      serverGateState.requireRosterWhitelist = sData.requireRosterWhitelist;
    }
    if (sData.updatedAt) serverGateState.updatedAt = sData.updatedAt;
    if (sData.updatedBy) serverGateState.updatedBy = sData.updatedBy;
  } catch (e) {
    console.error('[Server State Load Error]', e);
  }
}

function getStudentRoster() {
  try {
    if (fs.existsSync(ROSTER_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(ROSTER_FILE, 'utf8'));
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('[Roster Load Error]', e);
  }
  return {};
}

function saveStudentRoster(rosterMap) {
  try {
    fs.writeFileSync(ROSTER_FILE, JSON.stringify(rosterMap || {}, null, 2), 'utf8');
  } catch (e) {
    console.error('[Roster Save Error]', e);
  }
}

function getPublicServerGatePayload() {
  return {
    isOpen: serverGateState.isOpen,
    closedMessage: serverGateState.closedMessage,
    allowEmergencyStudentLogin: !!serverGateState.allowEmergencyStudentLogin,
    requireRosterWhitelist: !!serverGateState.requireRosterWhitelist,
    allowedEmailDomain: ALLOWED_EMAIL_DOMAIN,
    updatedAt: serverGateState.updatedAt,
    updatedBy: serverGateState.updatedBy
  };
}

function saveServerGateState() {
  try {
    fs.writeFileSync(SERVER_STATE_FILE, JSON.stringify(serverGateState, null, 2), 'utf8');
  } catch (e) {
    console.error('[Server State Save Error]', e);
  }
}

function applyServerGateStateChange(isOpen, message = '', updatedBy = '교사') {
  serverGateState.isOpen = !!isOpen;
  if (message) serverGateState.closedMessage = message;
  serverGateState.updatedAt = Date.now();
  serverGateState.updatedBy = updatedBy || '교사';
  if (serverGateState.isOpen) {
    lastOccupiedAt = Date.now();
  }
  saveServerGateState();

  io.emit('server_state_changed', getPublicServerGatePayload());

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
  return getPublicServerGatePayload();
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

function sanitizeStudentProgressForPublic(record) {
  if (!record || typeof record !== 'object') return null;
  const { email, googleSub, pinHash, pinSalt, pinPlain, ...safeRecord } = record;
  return {
    ...safeRecord,
    hasEmailSet: !!email,
    hasPinSet: !!(pinHash && pinSalt)
  };
}

function hashStudentPin(pin, saltHex = null) {
  const salt = saltHex || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(pin), salt, 32).toString('hex');
  return { salt, hash };
}

function verifyStudentPin(pin, saltHex, expectedHashHex) {
  if (!pin || !saltHex || !expectedHashHex) return false;
  try {
    const derived = crypto.scryptSync(String(pin), saltHex, 32);
    const expected = Buffer.from(expectedHashHex, 'hex');
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch (e) {
    return false;
  }
}

function issueTimedToken(storeMap, data, ttlMs) {
  const iat = Date.now();
  const expiresAt = iat + ttlMs;
  let pv = '';
  if (data && data.studentId) {
    const allRecs = getStudentsProgress() || {};
    const rec = allRecs[data.studentId];
    if (rec && rec.pinHash) {
      pv = String(rec.pinHash).slice(0, 8);
    }
  }
  const token = (data && data.studentId)
    ? signSessionPayload({
        k: 'student',
        studentId: data.studentId,
        email: data.email || '',
        name: data.name || '',
        pv,
        iat,
        exp: expiresAt
      })
    : crypto.randomBytes(24).toString('hex');
  if (storeMap.size >= 500) {
    const oldest = storeMap.keys().next().value;
    storeMap.delete(oldest);
  }
  storeMap.set(token, { ...data, expiresAt });
  return token;
}

function consumeValidToken(storeMap, token, remove = false) {
  if (!token || typeof token !== 'string') return null;
  let entry = storeMap.get(token);
  if (!entry) {
    const payload = verifySessionPayload(token);
    if (!payload || payload.k !== 'student' || !payload.studentId) return null;
    const revokedAt = revokedStudentBefore.get(payload.studentId) || 0;
    if (payload.iat && payload.iat < revokedAt) return null;
    if (payload.pv) {
      const rec = (getStudentsProgress() || {})[payload.studentId];
      if (!rec || String(rec.pinHash || '').slice(0, 8) !== payload.pv) return null;
    }
    entry = {
      studentId: payload.studentId,
      email: payload.email || '',
      name: payload.name || '',
      expiresAt: payload.exp
    };
    if (!remove) storeMap.set(token, entry);
  }
  if (Date.now() > entry.expiresAt) {
    storeMap.delete(token);
    return null;
  }
  if (remove) storeMap.delete(token);
  return entry;
}

function parseJsonBody(rawBody) {
  if (typeof rawBody === 'string') {
    try { return JSON.parse(rawBody); } catch (e) { return {}; }
  }
  return rawBody || {};
}

function normalizeAndValidateStudentEmail(rawEmail) {
  const email = String(rawEmail || '').trim().toLowerCase();
  if (!email) return { valid: false, error: `@${ALLOWED_EMAIL_DOMAIN} 이메일을 입력해 주세요.` };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: '올바른 이메일 주소 형식이 아닙니다.' };
  }
  if (!email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
    return { valid: false, error: `🏫 @${ALLOWED_EMAIL_DOMAIN} 학교 이메일만 사용할 수 있습니다.` };
  }
  return { valid: true, email };
}

app.get('/api/auth-config', (req, res) => {
  res.json({
    allowedDomain: ALLOWED_EMAIL_DOMAIN,
    allowEmergencyStudentLogin: !!serverGateState.allowEmergencyStudentLogin,
    requireRosterWhitelist: !!serverGateState.requireRosterWhitelist
  });
});

app.post('/api/auth/student-login', async (req, res) => {
  if (!serverGateState.isOpen) {
    const closedMsg = serverGateState.closedMessage || '지금은 서버 점검 및 수업 준비 중입니다.\n선생님께서 서버를 개방하실 때까지 잠시 대기해주세요!';
    return res.status(403).json({
      success: false,
      serverClosed: true,
      error: `🔒 [서버 닫힘 안내]\n\n${closedMsg}`
    });
  }
  const body = parseJsonBody(req.body);
  const studentId = String(body.studentId || '').trim();
  const name = String(body.name || '').trim();
  const rawEmail = String(body.email || '').trim().toLowerCase();
  const rawPin = String(body.pin || '').trim();

  if (!studentId || studentId === '교사' || studentId.length < 2) {
    return res.status(400).json({ success: false, error: '학번을 올바르게 입력해 주세요. (예: 10101)' });
  }
  if (!name) {
    return res.status(400).json({ success: false, error: '이름을 입력해 주세요. (예: 홍길동)' });
  }

  // Optional Teacher Whitelist Roster check
  if (serverGateState.requireRosterWhitelist) {
    const roster = getStudentRoster();
    const rEntry = roster[studentId];
    if (!rEntry) {
      return res.status(403).json({
        success: false,
        error: `📋 선생님이 등록한 학생 명단에 없는 학번([${studentId}])입니다.\n학번을 확인하거나 선생님께 명단 등록을 요청해 주세요.`
      });
    }
    if (rEntry.name && rEntry.name.trim() !== name) {
      return res.status(403).json({
        success: false,
        error: `📋 등록된 명단의 이름과 일치하지 않습니다. 본인 이름인지 확인해 주세요.`
      });
    }
    if (rEntry.email && rawEmail && rEntry.email.toLowerCase() !== rawEmail) {
      return res.status(403).json({
        success: false,
        error: `📋 명단에 등록된 @${ALLOWED_EMAIL_DOMAIN} 이메일과 일치하지 않습니다.`
      });
    }
  }

  const all = getStudentsProgress() || {};
  let existing = all[studentId];

  // 📊 Google Sheets 실시간 PIN · 계정 · 진행상태 동기화
  let sheetRow = null;
  if (isGoogleSheetsReady() && (googleSheetsConfig.syncPinOnLogin || !existing)) {
    sheetRow = await pullSingleStudentFromSheet(studentId);
    if (sheetRow) {
      const sheetPinRaw = String(sheetRow.pin || '').trim();
      const isSheetPinValid4 = /^\d{4}$/.test(sheetPinRaw);
      const isSheetResetCmd = /^(초기화|reset)$/i.test(sheetPinRaw);
      const sheetSnap = parseProgressSnapshotJson(sheetRow.progressJson);
      if (existing) {
        let touched = false;
        if (mergeSnapshotIntoExistingRecord(existing, sheetSnap)) {
          touched = true;
        }
        if (isSheetPinValid4 && existing.pinPlain !== sheetPinRaw) {
          const { salt, hash } = hashStudentPin(sheetPinRaw);
          existing = {
            ...existing,
            pinSalt: salt,
            pinHash: hash,
            pinPlain: sheetPinRaw,
            authProvider: 'pin',
            updatedAt: Date.now()
          };
          touched = true;
        } else if (isSheetResetCmd) {
          delete existing.pinHash;
          delete existing.pinSalt;
          delete existing.pinPlain;
          touched = true;
        }
        if (touched) {
          all[studentId] = existing;
          saveStudentsProgress(all, true);
        }
      }
    }
  }

  // Emergency mode shortcut (when enabled by teacher and student omits email/pin)
  if (serverGateState.allowEmergencyStudentLogin && (!rawEmail || !rawPin)) {
    if (existing && existing.name && existing.name.trim() !== name) {
      return res.status(409).json({
        success: false,
        error: `⚠️ 학번 [${studentId}]에 이미 등록된 이름과 다릅니다. 본인 학번인지 확인해 주세요.`
      });
    }
    const studentAuthToken = issueTimedToken(activeStudentSessions, {
      studentId,
      email: (existing && existing.email) || rawEmail || '',
      name
    }, 24 * 3600 * 1000);
    return res.json({
      success: true,
      emergencyUsed: true,
      isNewAccount: !existing,
      studentId,
      name: (existing && existing.name) || name,
      progress: sanitizeStudentProgressForPublic(existing),
      studentAuthToken
    });
  }

  // Standard Option 2: @senedu.kr Email + 4-digit PIN verification/registration
  const emailCheck = normalizeAndValidateStudentEmail(rawEmail);
  if (!emailCheck.valid) {
    return res.status(400).json({ success: false, error: emailCheck.error });
  }
  const email = emailCheck.email;

  if (!/^\d{4}$/.test(rawPin)) {
    return res.status(400).json({ success: false, error: '🔢 4자리 숫자 PIN(비밀번호)을 입력해 주세요! (예: 0322)' });
  }

  // Prevent reusing the same email on a different studentId
  for (const [otherId, rec] of Object.entries(all)) {
    if (otherId !== studentId && rec && rec.email && rec.email.toLowerCase() === email) {
      return res.status(409).json({
        success: false,
        error: `⚠️ 이메일 [${email}]은(는) 이미 다른 학번([${otherId}]) 계정에 등록되어 있습니다.`
      });
    }
  }

  const now = Date.now();
  let isNewAccount = false;
  let pinWasReset = false;

  if (existing) {
    if (existing.name && existing.name.trim() !== name) {
      return res.status(409).json({
        success: false,
        error: `⚠️ 학번 [${studentId}]에 등록된 이름과 다릅니다. 본인 계정이 맞는지 확인해 주세요.`
      });
    }
    if (existing.email && existing.email.toLowerCase() !== email) {
      return res.status(409).json({
        success: false,
        error: `⚠️ 학번 [${studentId}]에 등록된 @${ALLOWED_EMAIL_DOMAIN} 이메일과 다릅니다.\n수정이 필요하면 선생님께 요청하세요.`
      });
    }

    if (existing.pinHash && existing.pinSalt) {
      if (!verifyStudentPin(rawPin, existing.pinSalt, existing.pinHash)) {
        return res.status(401).json({
          success: false,
          error: '🔒 4자리 PIN이 일치하지 않습니다!\nPIN을 잊어버렸다면 선생님께 [PIN 초기화]를 요청해 주세요.'
        });
      }
      if (!existing.email || existing.pinPlain !== rawPin) {
        all[studentId] = {
          ...existing,
          email: existing.email || email,
          pinPlain: rawPin,
          updatedAt: existing.updatedAt || now
        };
        saveStudentsProgress(all, true);
      }
    } else {
      // Teacher cleared PIN or student had no PIN yet -> set new PIN cleanly
      const { salt, hash } = hashStudentPin(rawPin);
      all[studentId] = {
        ...existing,
        email: existing.email || email,
        pinSalt: salt,
        pinHash: hash,
        pinPlain: rawPin,
        authProvider: 'pin',
        updatedAt: existing.updatedAt || now
      };
      saveStudentsProgress(all, true);
      pinWasReset = true;
    }
  } else {
    // If pre-registered in Google Sheet with a 4-digit PIN, enforce matching PIN on first login
    if (sheetRow) {
      const sheetName = String(sheetRow.name || '').trim();
      const sheetEmail = String(sheetRow.email || '').trim().toLowerCase();
      const sheetPinRaw = String(sheetRow.pin || '').trim();
      if (sheetName && sheetName !== name) {
        return res.status(409).json({
          success: false,
          error: `⚠️ 구글 시트에 등록된 이름([${sheetName}])과 다릅니다. 본인 이름인지 확인해 주세요.`
        });
      }
      if (sheetEmail && sheetEmail !== email) {
        return res.status(409).json({
          success: false,
          error: `⚠️ 구글 시트에 등록된 이메일과 다릅니다.`
        });
      }
      if (/^\d{4}$/.test(sheetPinRaw) && sheetPinRaw !== rawPin) {
        return res.status(401).json({
          success: false,
          error: '🔒 구글 시트에 설정된 4자리 PIN과 일치하지 않습니다! 선생님께 PIN을 확인해 주세요.'
        });
      }
    }
    const sheetSnap = sheetRow ? parseProgressSnapshotJson(sheetRow.progressJson) : null;
    isNewAccount = !(sheetRow && sheetSnap);
    const { salt, hash } = hashStudentPin(rawPin);
    all[studentId] = {
      ...(sheetSnap || {}),
      name: (sheetRow && sheetRow.name) || name,
      studentId,
      grade: (sheetSnap && Number(sheetSnap.grade)) || 1,
      level: (sheetRow && Number(sheetRow.level)) || (sheetSnap && Number(sheetSnap.level)) || 1,
      exp: (sheetSnap && Number.isFinite(Number(sheetSnap.exp))) ? Number(sheetSnap.exp) : 0,
      gold: (sheetRow && sheetRow.gold !== undefined && sheetRow.gold !== '')
        ? Number(sheetRow.gold)
        : ((sheetSnap && sheetSnap.gold !== undefined) ? Number(sheetSnap.gold) : 10),
      hairColor: (sheetSnap && sheetSnap.hairColor) || (['black', 'brown', 'blonde'].includes(body.hairColor) ? body.hairColor : 'black'),
      outfitColor: (sheetSnap && sheetSnap.outfitColor) || (['red', 'blue', 'green'].includes(body.outfitColor) ? body.outfitColor : 'red'),
      email,
      pinSalt: salt,
      pinHash: hash,
      pinPlain: rawPin,
      authProvider: 'pin',
      registeredAt: (sheetSnap && Number(sheetSnap.registeredAt)) || now,
      updatedAt: Math.max(now, Number(sheetSnap && sheetSnap.updatedAt) || 0)
    };
    saveStudentsProgress(all, true);

    const deletedMap = getDeletedStudents();
    if (deletedMap[studentId]) {
      delete deletedMap[studentId];
      saveDeletedStudents(deletedMap);
    }
  }

  scheduleSheetStudentSync(studentId);

  const studentAuthToken = issueTimedToken(activeStudentSessions, {
    studentId,
    email,
    name: all[studentId].name
  }, 24 * 3600 * 1000);

  return res.json({
    success: true,
    isNewAccount,
    pinWasReset,
    studentId,
    name: all[studentId].name,
    progress: sanitizeStudentProgressForPublic(all[studentId]),
    studentAuthToken
  });
});

app.post('/api/auth/emergency-student', (req, res) => {
  if (!serverGateState.isOpen) {
    const closedMsg = serverGateState.closedMessage || '지금은 서버 점검 및 수업 준비 중입니다.\n선생님께서 서버를 개방하실 때까지 잠시 대기해주세요!';
    return res.status(403).json({
      success: false,
      serverClosed: true,
      error: `🔒 [서버 닫힘 안내]\n\n${closedMsg}`
    });
  }
  if (!serverGateState.allowEmergencyStudentLogin) {
    return res.status(403).json({
      success: false,
      error: `🔒 현재 선생님이 [@${ALLOWED_EMAIL_DOMAIN} 이메일 + 4자리 PIN 전용 모드]를 적용 중입니다.`
    });
  }
  const body = parseJsonBody(req.body);
  const studentId = String(body.studentId || '').trim();
  const name = String(body.name || '').trim();
  if (!studentId || studentId === '교사' || !name) {
    return res.status(400).json({ success: false, error: '학번과 이름을 모두 입력해 주세요.' });
  }
  const all = getStudentsProgress() || {};
  const existing = all[studentId];
  if (existing && existing.name && existing.name.trim() !== name) {
    return res.status(409).json({
      success: false,
      error: `⚠️ 학번 [${studentId}]에 이미 등록된 이름과 다릅니다. 본인 학번인지 확인해 주세요.`
    });
  }
  const studentAuthToken = issueTimedToken(activeStudentSessions, {
    studentId,
    email: (existing && existing.email) || '',
    name
  }, 24 * 3600 * 1000);
  return res.json({ success: true, studentAuthToken });
});

app.get('/api/load-progress', (req, res) => {
  const studentId = (req.query.studentId || '').trim();
  if (!studentId) return res.status(400).json({ error: 'Missing studentId' });
  const all = getStudentsProgress();
  const deletedMap = getDeletedStudents();
  res.json({
    success: true,
    progress: sanitizeStudentProgressForPublic(all[studentId]),
    deletedAt: deletedMap[studentId] || 0
  });
});

app.post('/api/save-progress', (req, res) => {
  const body = parseJsonBody(req.body);
  const { studentId, progress } = body || {};
  if (!studentId || !progress) return res.status(400).json({ error: 'Invalid data' });
  if (body && body.fromAdmin && !isAuthorizedTeacherHttp(req)) {
    return res.status(401).json({ success: false, error: '🔒 교사 관리자 권한이 필요합니다.' });
  }
  const providedStudentToken = req.headers['x-student-token'] || body.studentAuthToken;
  if (providedStudentToken && !isAuthorizedTeacherHttp(req)) {
    const sess = consumeValidToken(activeStudentSessions, providedStudentToken, false);
    if (!sess || sess.studentId !== studentId) {
      return res.status(401).json({ success: false, error: '🔒 학생 세션 토큰이 유효하지 않습니다.' });
    }
  }
  const all = getStudentsProgress();
  const existingRecord = (all[studentId] && typeof all[studentId] === 'object') ? all[studentId] : {};
  const adminUpdatedEmail = (body && body.fromAdmin && typeof progress.email === 'string')
    ? progress.email.trim().toLowerCase()
    : undefined;

  const isTeacherRecord = !!(progress.isTeacher || studentId === '교사');
  const nextLevel = Math.max(1, Number(progress.level) || 1);
  let sanitizedEquipment = progress.equipment;
  if (!isTeacherRecord && sanitizedEquipment && typeof sanitizedEquipment === 'object') {
    sanitizedEquipment = { ...sanitizedEquipment };
    for (const [slotKey, eq] of Object.entries(sanitizedEquipment)) {
      if (!eq || !eq.item) continue;
      if (eq.item === 'equip_elevator_pass') {
        sanitizedEquipment[slotKey] = null;
        continue;
      }
      const canonReqLv = ALL_GAME_ITEMS[eq.item] && ALL_GAME_ITEMS[eq.item].meta && ALL_GAME_ITEMS[eq.item].meta.requiredLevel;
      if (canonReqLv && nextLevel < canonReqLv) {
        sanitizedEquipment[slotKey] = null;
      }
    }
  }

  all[studentId] = {
    ...progress,
    ...(sanitizedEquipment ? { equipment: sanitizedEquipment } : {}),
    ...(existingRecord.email ? { email: existingRecord.email } : {}),
    ...(adminUpdatedEmail !== undefined ? (adminUpdatedEmail ? { email: adminUpdatedEmail } : {}) : {}),
    ...(existingRecord.pinHash ? { pinHash: existingRecord.pinHash } : {}),
    ...(existingRecord.pinSalt ? { pinSalt: existingRecord.pinSalt } : {}),
    ...(existingRecord.pinPlain ? { pinPlain: existingRecord.pinPlain } : {}),
    ...(existingRecord.authProvider ? { authProvider: existingRecord.authProvider } : {}),
    ...(existingRecord.registeredAt ? { registeredAt: existingRecord.registeredAt } : {}),
    studentId: studentId,
    updatedAt: progress.updatedAt || Date.now()
  };
  if (adminUpdatedEmail === '') {
    delete all[studentId].email;
  }
  saveStudentsProgress(all);
  scheduleSheetStudentSync(studentId);

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
    if (progress.baseAtk !== undefined) activeStudent.baseAtk = progress.baseAtk;
    if (progress.baseDef !== undefined) activeStudent.baseDef = progress.baseDef;
    if (progress.equipment && typeof progress.equipment === 'object') {
      activeStudent.equipment = progress.equipment;
    }
    const syncedCombat = computeStudentCombatStats({
      ...activeStudent,
      atk: progress.atk,
      def: progress.def
    });
    activeStudent.atk = syncedCombat.atk;
    activeStudent.def = syncedCombat.def;
    if (progress.isFallen !== undefined) activeStudent.isFallen = progress.isFallen;
    // 관리자(교사)의 직접 수정일 때만 학생에게 알림 동기화 전송 (학생 자신의 저장은 알림 미전송)
    if (body.fromAdmin) {
      io.to(activeStudent.id).emit('student_progress_sync_from_admin', { ...all[studentId], studentId });
    }
    broadcastStudentList();
  }

  res.json({ success: true });
});

app.get('/api/admin/export-progress', requireTeacherHttp, (req, res) => {
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

app.post('/api/admin/restore-progress', requireTeacherHttp, (req, res) => {
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
  res.json(getPublicServerGatePayload());
});

app.post('/api/admin/server-gate', requireTeacherHttp, (req, res) => {
  const body = parseJsonBody(req.body);
  if (typeof body.isOpen !== 'boolean') {
    return res.status(400).json({ success: false, error: 'isOpen 값이 필요합니다.' });
  }
  const payload = applyServerGateStateChange(body.isOpen, body.message || '', '교사');
  return res.json({ success: true, ...payload });
});

app.post('/api/admin/auth-settings', requireTeacherHttp, (req, res) => {
  const body = parseJsonBody(req.body);
  if (typeof body.allowEmergencyStudentLogin === 'boolean') {
    serverGateState.allowEmergencyStudentLogin = body.allowEmergencyStudentLogin;
  }
  if (typeof body.requireRosterWhitelist === 'boolean') {
    serverGateState.requireRosterWhitelist = body.requireRosterWhitelist;
  }
  serverGateState.updatedAt = Date.now();
  serverGateState.updatedBy = '교사';
  saveServerGateState();

  io.emit('server_state_changed', getPublicServerGatePayload());
  return res.json({ success: true, ...getPublicServerGatePayload() });
});

app.post('/api/admin/rename-student-id', requireTeacherHttp, (req, res) => {
  const body = parseJsonBody(req.body);
  const oldStudentId = String(body.oldStudentId || '').trim();
  const newStudentId = String(body.newStudentId || '').trim();
  const newName = String(body.newName || '').trim();
  if (!oldStudentId || !newStudentId || newStudentId === '교사') {
    return res.status(400).json({ success: false, error: '기존 학번과 새 학번을 올바르게 입력해 주세요.' });
  }

  const all = getStudentsProgress();
  if (!all[oldStudentId]) {
    return res.status(404).json({ success: false, error: '기존 학번의 저장 데이터를 찾을 수 없습니다.' });
  }
  if (oldStudentId !== newStudentId && all[newStudentId]) {
    return res.status(409).json({ success: false, error: `이미 [${newStudentId}] 학번 데이터가 존재합니다.` });
  }

  const record = {
    ...all[oldStudentId],
    studentId: newStudentId,
    ...(newName ? { name: newName } : {}),
    updatedAt: Date.now()
  };
  if (oldStudentId !== newStudentId) {
    delete all[oldStudentId];
  }
  all[newStudentId] = record;
  saveStudentsProgress(all, true);
  scheduleSheetStudentSync(newStudentId);
  if (oldStudentId !== newStudentId && isGoogleSheetsReady() && googleSheetsConfig.autoPushChanges) {
    callGoogleAppsScript({ action: 'deleteOne', studentId: oldStudentId }, 4000).catch(() => {});
  }

  const deletedMap = getDeletedStudents();
  if (deletedMap[newStudentId]) {
    delete deletedMap[newStudentId];
    saveDeletedStudents(deletedMap);
  }

  const activeStudent = Object.values(players).find(p => p.studentId === oldStudentId);
  if (activeStudent) {
    activeStudent.studentId = newStudentId;
    if (newName) activeStudent.name = newName;
    io.to(activeStudent.id).emit('student_progress_sync_from_admin', { ...record, studentId: newStudentId });
    broadcastStudentList();
  }

  return res.json({ success: true, studentId: newStudentId, progress: record });
});

app.post('/api/admin/reset-student-pin', requireTeacherHttp, async (req, res) => {
  const body = parseJsonBody(req.body);
  const studentId = String(body.studentId || '').trim();
  const newPin = body.newPin !== undefined && body.newPin !== null ? String(body.newPin).trim() : '';
  if (!studentId) return res.status(400).json({ success: false, error: 'Missing studentId' });

  const all = getStudentsProgress();
  if (!all[studentId]) {
    return res.status(404).json({ success: false, error: '학생 데이터를 찾을 수 없습니다.' });
  }

  if (newPin) {
    if (!/^\d{4}$/.test(newPin)) {
      return res.status(400).json({ success: false, error: '새 PIN은 숫자 4자리여야 합니다.' });
    }
    const { salt, hash } = hashStudentPin(newPin);
    all[studentId].pinSalt = salt;
    all[studentId].pinHash = hash;
    all[studentId].pinPlain = newPin;
    all[studentId].authProvider = 'pin';
  } else {
    delete all[studentId].pinHash;
    delete all[studentId].pinSalt;
    delete all[studentId].pinPlain;
  }
  all[studentId].updatedAt = Date.now();
  saveStudentsProgress(all, true);
  if (isGoogleSheetsReady()) {
    await pushSingleStudentToSheet(studentId, { clearPin: !newPin });
  }

  revokedStudentBefore.set(studentId, Date.now());
  for (const [tok, sess] of activeStudentSessions.entries()) {
    if (sess.studentId === studentId) activeStudentSessions.delete(tok);
  }

  return res.json({
    success: true,
    studentId,
    hasPinSet: !!newPin,
    pinPlain: newPin || ''
  });
});

app.get('/api/admin/roster', requireTeacherHttp, (req, res) => {
  const roster = getStudentRoster();
  const list = Object.values(roster).sort((a, b) => String(a.studentId).localeCompare(String(b.studentId)));
  return res.json({
    success: true,
    count: list.length,
    requireRosterWhitelist: !!serverGateState.requireRosterWhitelist,
    students: list
  });
});

app.post('/api/admin/roster', requireTeacherHttp, (req, res) => {
  const body = parseJsonBody(req.body);
  const roster = body.replace ? {} : getStudentRoster();
  let added = 0;

  const addRosterRow = (sidRaw, nameRaw, emailRaw) => {
    const sid = String(sidRaw || '').trim();
    const name = String(nameRaw || '').trim();
    const email = String(emailRaw || '').trim().toLowerCase();
    if (!sid || sid === '학번' || sid === 'studentId' || sid.length < 2) return;
    roster[sid] = {
      studentId: sid,
      name,
      email
    };
    added++;
  };

  if (Array.isArray(body.entries)) {
    body.entries.forEach(item => {
      if (item && typeof item === 'object') {
        addRosterRow(item.studentId, item.name, item.email);
      }
    });
  }

  if (typeof body.csvText === 'string' && body.csvText.trim()) {
    const lines = body.csvText.split(/\r?\n/);
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const parts = trimmed.split(/[,\t;/|]+/).map(p => p.trim());
      if (parts.length >= 2) {
        addRosterRow(parts[0], parts[1], parts[2] || '');
      }
    });
  }

  if (typeof body.fileBase64 === 'string' && body.fileBase64.trim()) {
    try {
      const XLSX = require('xlsx');
      const buf = Buffer.from(body.fileBase64, 'base64');
      const wb = XLSX.read(buf, { type: 'buffer' });
      const firstSheet = wb.SheetNames[0];
      if (firstSheet) {
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[firstSheet], { header: 1, defval: '' });
        rows.forEach(r => {
          if (Array.isArray(r) && r.length >= 2) {
            addRosterRow(r[0], r[1], r[2] || '');
          }
        });
      }
    } catch (xlsxErr) {
      return res.status(400).json({ success: false, error: '엑셀/CSV 파일 파싱 오류: ' + xlsxErr.message });
    }
  }

  saveStudentRoster(roster);
  const totalCount = Object.keys(roster).length;
  return res.json({ success: true, added, count: totalCount });
});

app.post('/api/admin/roster-clear', requireTeacherHttp, (req, res) => {
  saveStudentRoster({});
  return res.json({ success: true, count: 0 });
});

app.get('/api/admin/sheets/config', requireTeacherHttp, (req, res) => {
  return res.json({
    success: true,
    config: {
      ...googleSheetsConfig,
      isReady: isGoogleSheetsReady()
    },
    codeGs: buildCustomizedAppsScriptCode()
  });
});

app.post('/api/admin/sheets/config', requireTeacherHttp, (req, res) => {
  const body = parseJsonBody(req.body);
  let rawWebAppUrl = typeof body.webAppUrl === 'string' ? body.webAppUrl.trim() : undefined;
  if (typeof body.spreadsheetId === 'string' && body.spreadsheetId.trim()) {
    const rawId = body.spreadsheetId.trim();
    if (/script\.google\.com\/macros\//i.test(rawId)) {
      if (!rawWebAppUrl) rawWebAppUrl = rawId;
    } else {
      const matchUrl = rawId.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
      googleSheetsConfig.spreadsheetId = matchUrl ? matchUrl[1] : rawId;
    }
  }
  if (typeof body.sheetName === 'string' && body.sheetName.trim()) {
    googleSheetsConfig.sheetName = body.sheetName.trim();
  }
  if (rawWebAppUrl !== undefined) {
    if (rawWebAppUrl && !/^https?:\/\/.+/i.test(rawWebAppUrl)) {
      return res.status(400).json({ success: false, error: '올바른 http/https 웹 앱 URL을 입력해 주세요.' });
    }
    googleSheetsConfig.webAppUrl = rawWebAppUrl;
  }
  if (typeof body.syncSecret === 'string') {
    googleSheetsConfig.syncSecret = body.syncSecret.trim();
  }
  if (typeof body.syncPinOnLogin === 'boolean') {
    googleSheetsConfig.syncPinOnLogin = body.syncPinOnLogin;
  }
  if (typeof body.autoPushChanges === 'boolean') {
    googleSheetsConfig.autoPushChanges = body.autoPushChanges;
  }
  saveGoogleSheetsConfig();
  return res.json({
    success: true,
    config: { ...googleSheetsConfig, isReady: isGoogleSheetsReady() },
    codeGs: buildCustomizedAppsScriptCode()
  });
});

app.post('/api/admin/sheets/test', requireTeacherHttp, async (req, res) => {
  try {
    const result = await callGoogleAppsScript({ action: 'ping' }, 5000);
    googleSheetsConfig.lastSyncAt = Date.now();
    googleSheetsConfig.lastSyncMessage = '연결 테스트 성공';
    saveGoogleSheetsConfig();
    return res.json({ success: true, result });
  } catch (err) {
    googleSheetsConfig.lastSyncMessage = `연결 실패: ${err.message}`;
    saveGoogleSheetsConfig();
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/sheets/push-all', requireTeacherHttp, async (req, res) => {
  try {
    const all = getStudentsProgress() || {};
    const rows = Object.keys(all)
      .filter(sid => sid && sid !== '교사')
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map(sid => buildSheetRowFromRecord(sid, all[sid]));

    const result = await callGoogleAppsScript({ action: 'syncAll', rows }, 10000);
    googleSheetsConfig.lastSyncAt = Date.now();
    googleSheetsConfig.lastSyncMessage = `전체 ${rows.length}명 시트 반영 완료`;
    saveGoogleSheetsConfig();
    return res.json({
      success: true,
      pushedCount: rows.length,
      updatedCount: result.updatedCount || 0,
      appendedCount: result.appendedCount || 0
    });
  } catch (err) {
    googleSheetsConfig.lastSyncMessage = `내보내기 실패: ${err.message}`;
    saveGoogleSheetsConfig();
    return res.status(400).json({ success: false, error: err.message });
  }
});

async function syncAllFromGoogleSheet({ quiet = false } = {}) {
  const result = await callGoogleAppsScript({ action: 'getAll' }, 8000);
  const sheetRows = Array.isArray(result.rows) ? result.rows : [];
  const all = getStudentsProgress() || {};
  const now = Date.now();

  let createdCount = 0;
  let updatedCount = 0;
  let pinUpdatedCount = 0;
  let pinClearedCount = 0;
  let snapshotRestoredCount = 0;
  let skippedInvalidPinCount = 0;

  for (const row of sheetRows) {
    const sid = String((row && row.studentId) || '').trim();
    if (!sid || sid === '교사' || sid === '학번' || sid.length < 2) continue;

    const sName = String((row && row.name) || '').trim();
    const sEmail = String((row && row.email) || '').trim().toLowerCase();
    const sPin = String((row && row.pin) || '').trim();
    const snap = parseProgressSnapshotJson(row && row.progressJson);
    const isPin4 = /^\d{4}$/.test(sPin);
    const isResetCmd = /^(초기화|reset)$/i.test(sPin);
    if (sPin && !isPin4 && !isResetCmd) {
      skippedInvalidPinCount++;
    }

    const revokeStudentSessions = () => {
      for (const [tok, sess] of activeStudentSessions.entries()) {
        if (sess.studentId === sid) activeStudentSessions.delete(tok);
      }
    };

    if (all[sid]) {
      const rec = { ...all[sid] };
      let changed = false;
      if (mergeSnapshotIntoExistingRecord(rec, snap)) {
        snapshotRestoredCount++;
        changed = true;
      }
      if (sName && rec.name !== sName) {
        rec.name = sName;
        changed = true;
      }
      if (sEmail && rec.email !== sEmail) {
        rec.email = sEmail;
        changed = true;
      }
      const sLv = Number(row && row.level);
      if (Number.isFinite(sLv) && sLv >= 1 && rec.level !== Math.floor(sLv)) {
        rec.level = Math.floor(sLv);
        changed = true;
      }
      const sGold = (row && row.gold !== undefined && row.gold !== '') ? Number(row.gold) : NaN;
      if (Number.isFinite(sGold) && sGold >= 0 && rec.gold !== Math.floor(sGold)) {
        rec.gold = Math.floor(sGold);
        changed = true;
      }
      if (isPin4 && rec.pinPlain !== sPin) {
        const { salt, hash } = hashStudentPin(sPin);
        rec.pinSalt = salt;
        rec.pinHash = hash;
        rec.pinPlain = sPin;
        rec.authProvider = 'pin';
        revokeStudentSessions();
        pinUpdatedCount++;
        changed = true;
      } else if (isResetCmd && (rec.pinHash || rec.pinPlain)) {
        delete rec.pinHash;
        delete rec.pinSalt;
        delete rec.pinPlain;
        revokeStudentSessions();
        pinClearedCount++;
        changed = true;
      }
      if (changed) {
        rec.updatedAt = Math.max(now, Number(snap && snap.updatedAt) || 0);
        all[sid] = rec;
        updatedCount++;
      }
    } else {
      const newRec = {
        ...(snap || {}),
        name: sName || (snap && snap.name) || `학생_${sid}`,
        studentId: sid,
        grade: (snap && Number(snap.grade)) || (/^[123]/.test(sid) ? Number(sid[0]) : 1),
        level: Math.max(1, Number(row.level) || (snap && Number(snap.level)) || 1),
        exp: (snap && Number.isFinite(Number(snap.exp))) ? Number(snap.exp) : 0,
        gold: row.gold !== undefined && row.gold !== ''
          ? Math.max(0, Number(row.gold) || 0)
          : ((snap && snap.gold !== undefined) ? Math.max(0, Number(snap.gold) || 0) : 10),
        email: sEmail || (snap && snap.email) || '',
        authProvider: 'pin',
        registeredAt: (snap && Number(snap.registeredAt)) || now,
        updatedAt: Math.max(now, Number(snap && snap.updatedAt) || 0)
      };
      if (snap) snapshotRestoredCount++;
      if (isPin4) {
        const { salt, hash } = hashStudentPin(sPin);
        newRec.pinSalt = salt;
        newRec.pinHash = hash;
        newRec.pinPlain = sPin;
        pinUpdatedCount++;
      }
      all[sid] = newRec;
      createdCount++;
    }
  }

  if (createdCount > 0 || updatedCount > 0) {
    saveStudentsProgress(all, true);
  }
  googleSheetsConfig.lastSyncAt = Date.now();
  googleSheetsConfig.lastSyncMessage = `시트 가져오기 완료 (신규 ${createdCount}, 갱신 ${updatedCount}, 상태복원 ${snapshotRestoredCount}, PIN 변경 ${pinUpdatedCount})`;
  saveGoogleSheetsConfig();
  if (!quiet || createdCount > 0 || updatedCount > 0) {
    console.log(`[Google Sheets Sync] rows=${sheetRows.length}, created=${createdCount}, updated=${updatedCount}, snapshotRestored=${snapshotRestoredCount}, pinUpdated=${pinUpdatedCount}`);
  }
  return {
    totalRows: sheetRows.length,
    createdCount,
    updatedCount,
    snapshotRestoredCount,
    pinUpdatedCount,
    pinClearedCount,
    skippedInvalidPinCount
  };
}

app.post('/api/admin/sheets/sync-from-sheet', requireTeacherHttp, async (req, res) => {
  try {
    const summary = await syncAllFromGoogleSheet({ quiet: false });
    return res.json({ success: true, ...summary });
  } catch (err) {
    googleSheetsConfig.lastSyncMessage = `가져오기 실패: ${err.message}`;
    saveGoogleSheetsConfig();
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/delete-students-by-grade', requireTeacherHttp, (req, res) => {
  const body = parseJsonBody(req.body);
  const gradePrefix = String(body.gradePrefix || '').trim();
  if (!['1', '2', '3'].includes(gradePrefix)) {
    return res.status(400).json({ success: false, error: '학년 구분(1, 2, 3)이 올바르지 않습니다.' });
  }
  const all = getStudentsProgress();
  const deletedMap = getDeletedStudents();
  const deletedIds = [];

  for (const sid of Object.keys(all)) {
    if (sid.startsWith(gradePrefix)) {
      deletedIds.push(sid);
      delete all[sid];
      deletedMap[sid] = Date.now();
    }
  }

  if (deletedIds.length > 0) {
    saveStudentsProgress(all, true);
    saveDeletedStudents(deletedMap);
    for (const p of Object.values(players)) {
      if (!p.isTeacher && deletedIds.includes(p.studentId)) {
        io.to(p.id).emit('student_progress_reset_by_admin', { studentId: p.studentId });
        p.level = 1;
        p.exp = 0;
        p.gold = 10;
      }
    }
    broadcastStudentList();
  }

  return res.json({ success: true, deletedCount: deletedIds.length, deletedIds });
});

app.get('/api/admin/all-students-progress', requireTeacherHttp, async (req, res) => {
  let all = getStudentsProgress() || {};
  if (Object.keys(all).length === 0 && isGoogleSheetsReady()) {
    try {
      await syncAllFromGoogleSheet({ quiet: true });
      all = getStudentsProgress() || {};
    } catch (e) {}
  }
  res.json({ success: true, students: all });
});

app.post('/api/admin/clear-all-students-progress', requireTeacherHttp, (req, res) => {
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

app.post('/api/admin/delete-student-progress', requireTeacherHttp, (req, res) => {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }
  const studentId = (body && body.studentId || '').trim();
  if (!studentId) return res.status(400).json({ error: 'Missing studentId' });
  const all = getStudentsProgress();
  if (pendingSheetSyncTimers.has(studentId)) {
    clearTimeout(pendingSheetSyncTimers.get(studentId));
    pendingSheetSyncTimers.delete(studentId);
  }
  if (all[studentId]) {
    delete all[studentId];
    saveStudentsProgress(all, true);
  }
  revokedStudentBefore.set(studentId, Date.now());
  for (const [tok, sess] of activeStudentSessions.entries()) {
    if (sess.studentId === studentId) activeStudentSessions.delete(tok);
  }
  if (isGoogleSheetsReady() && googleSheetsConfig.autoPushChanges) {
    callGoogleAppsScript({ action: 'deleteOne', studentId }, 4000).catch(() => {});
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
  'equip_heritage_blade': { name: '⚔️ 1897 숭실 헤리티지 소드', icon: '⚔️', meta: { type: 'equipment', slot: 'weapon', requiredLevel: 10, stats: { atk: 45, def: 0, hp: 35 }, effect: '4티어 무기 · 공격력 +45, 체력 +35 (Lv.10 이상)' } },
  'equip_heritage_helmet': { name: '👑 1897 숭실 헤리티지 투구', icon: '👑', meta: { type: 'equipment', slot: 'helmet', requiredLevel: 10, stats: { atk: 0, def: 20, hp: 35 }, effect: '4티어 투구 · 방어력 +20, 체력 +35 (Lv.10 이상)' } },
  'equip_heritage_armor': { name: '🛡️ 1897 숭실 헤리티지 갑옷', icon: '🛡️', meta: { type: 'equipment', slot: 'armor', requiredLevel: 10, stats: { atk: 0, def: 25, hp: 35 }, effect: '4티어 갑옷 · 방어력 +25, 체력 +35 (Lv.10 이상)' } },
  'equip_heritage_boots': { name: '👑 1897 숭실 헤리티지 부츠', icon: '👟', meta: { type: 'equipment', slot: 'shoes', stats: { atk: 6, def: 6, hp: 15 }, effect: '4티어 신발' } },
  'equip_bronze_shoes': { name: '🥉 청동 스파이크', icon: '👟', meta: { type: 'equipment', slot: 'shoes', stats: { atk: 5, def: 5, hp: 10 }, effect: '3티어 신발 · 숭실 역사관 보물' } },
  'item_bronze_heart': { name: '청동 드래곤의 심장', icon: '❤️‍🔥', meta: { type: 'material', effect: '청동 드래곤 전리품 · 3티어 청동 장비 필수 재료' } },
  'item_golem_weakness_scroll': { name: '📜 한강우의 골렘 연화 비책', icon: '📜', meta: { type: 'quest', effect: '나무 세트 3종 착용 제자에게 전수된 비책 · 가죽 골렘 1:1 레이드 시 골렘 약화 (HP 2,000 ➔ 200, DEF 14 ➔ 5)' } },
  'item_cafeteria_key': { name: '급식실 열쇠', icon: '🔑', meta: { type: 'quest', effect: '급식실 정문 출입용 황금 열쇠' } },
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
  'equip_wood_armor': { name: '나무갑옷', icon: '🛡️', meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 12, hp: 15 }, effect: '방어력 +12, 체력 +15' } },
  'equip_leather_sword': { name: '가죽손잡이 세이버', icon: '🗡️', meta: { type: 'equipment', slot: 'weapon', requiredLevel: 3, stats: { atk: 22, def: 0, hp: 0 }, effect: '공격력 +22 (Lv.3 이상)' } },
  'equip_leather_helmet': { name: '가죽투구', icon: '⛑️', meta: { type: 'equipment', slot: 'helmet', requiredLevel: 3, stats: { atk: 0, def: 12, hp: 28 }, effect: '방어력 +12, 체력 +28 (Lv.3 이상)' } },
  'equip_leather_armor': { name: '가죽갑옷', icon: '🥋', meta: { type: 'equipment', slot: 'armor', requiredLevel: 3, stats: { atk: 0, def: 15, hp: 20 }, effect: '방어력 +15, 체력 +20 (Lv.3 이상)' } },
  'equip_leather_shoes': { name: '날렵한 가죽 운동화', icon: '👟', meta: { type: 'equipment', slot: 'shoes', stats: { atk: 3, def: 3, hp: 10 }, effect: '2티어 고급 신발' } },
  'equip_forsythia_ring': { name: '성실의 개나리 반지', icon: '🌼', meta: { type: 'equipment', slot: 'accessory', stats: { atk: 10, def: 5, hp: 20 }, effect: '공격력 +10, 방어력 +5, 체력 +20' } },
  'equip_ginkgo_talisman': { name: '합심의 황금 은행잎 부적', icon: '🍂', meta: { type: 'equipment', slot: 'accessory', requiredLevel: 5, stats: { atk: 15, def: 5, hp: 30 }, effect: '공격력 +15, 방어력 +5, 체력 +30 (Lv.5 이상)' } },
  'equip_bronze_sword': { name: '청동검', icon: '⚔️', meta: { type: 'equipment', slot: 'weapon', requiredLevel: 5, stats: { atk: 30, def: 0, hp: 0 }, effect: '공격력 +30 (Lv.5 이상)' } },
  'equip_bronze_helmet': { name: '청동투구', icon: '🪖', meta: { type: 'equipment', slot: 'helmet', requiredLevel: 5, stats: { atk: 0, def: 14, hp: 35 }, effect: '방어력 +14, 체력 +35 (Lv.5 이상)' } },
  'equip_bronze_armor': { name: '청동갑옷', icon: '🛡️', meta: { type: 'equipment', slot: 'armor', requiredLevel: 5, stats: { atk: 0, def: 20, hp: 25 }, effect: '방어력 +20, 체력 +25 (Lv.5 이상)' } },
  'item_eval_paper': { name: 'A+ 만점 수행평가지', icon: '📜', meta: { type: 'material', effect: '케르베로스 전리품 · 수행평가 만점의 증표' } },
  'equip_omr_wand': { name: '컴싸 마법봉', icon: '🖊️', meta: { type: 'equipment', slot: 'weapon', stats: { atk: 45, def: 5, hp: 30 }, effect: '기말고사 파멸신 전리품 · 공격력 +45, 방어력 +5' } },
  'equip_immortal_blade': { name: '불멸의 열정 대검', icon: '⚔️', meta: { type: 'equipment', slot: 'weapon', requiredLevel: 12, stats: { atk: 60, def: 0, hp: 35 }, effect: '5티어 무기 · 공격력 +60, 체력 +35 (Lv.12 이상)' } },
  'equip_immortal_helmet': { name: '불멸의 열정 투구', icon: '👑', meta: { type: 'equipment', slot: 'helmet', requiredLevel: 12, stats: { atk: 0, def: 25, hp: 35 }, effect: '5티어 투구 · 방어력 +25, 체력 +35 (Lv.12 이상)' } },
  'equip_immortal_armor': { name: '불멸의 열정 갑옷', icon: '🛡️', meta: { type: 'equipment', slot: 'armor', requiredLevel: 12, stats: { atk: 0, def: 30, hp: 35 }, effect: '5티어 갑옷 · 방어력 +30, 체력 +35 (Lv.12 이상)' } },
  'equip_elevator_pass': { name: '엘리베이터 작동권', icon: '🪪', meta: { type: 'quest', isQuestItem: true, effect: '🛗 중앙 엘리베이터 가동 인가증 (소지 시 자동 작동)' } },
  'item_joshua_memo': { name: 'Joshua의 단어 메모', icon: '📝', meta: { type: 'quest', effect: 'Joshua 선생님이 탕비실에 떨어뜨린 3학년 영어 핵심 단어장 메모' } },
  'item_okchohan_textbook': { name: '옥촣한의 사회 탐구 교재', icon: '📘', meta: { type: 'quest', effect: '사회 옥촣한 선생님의 핵심 사회 탐구 수업 교재' } },
  'item_kimmijin_sketchbook': { name: '김진믜의 풍경화 스케치북', icon: '🎨', meta: { type: 'quest', effect: '미술 김진믜 선생님의 섬세한 풍경화 스케치북' } },
  'item_yosunyu_usb': { name: '요션유의 알고리즘 USB', icon: '💾', meta: { type: 'quest', effect: '정보 요션유 선생님의 파이썬 코딩과 알고리즘 강의 자료가 담긴 고속 USB' } },
  'item_career_guidebook': { name: '진로 적성 검사 안내서', icon: '📘', meta: { type: 'quest', effect: '진로 귐즨숑 선생님의 진로 적성 검사 안내서' } },
  'equip_vintage_armband': { name: '선배의 낡은 승리 완장', icon: '🎗️', meta: { type: 'equipment', slot: 'accessory', isQuestItem: true, stats: { atk: 3, def: 3 }, effect: '공격력 +3, 방어력 +3, [특수] 모든 획득 경험치(EXP) +10% 증가 (매각 불가)' } },
  'item_tiny_exp_potion': { name: '초소형 경험치 물약', icon: '🧪', meta: { type: 'consumable', slot: 'consumable', expGain: 50, effect: '사용 시 경험치(EXP) +50 상승' } },
  'item_gym_key': { name: '2학년 체육관 열쇠', icon: '🔑', meta: { type: 'quest', isQuestItem: true, effect: '교무실 20번 자리에서 찾은 2학년 체육선생님의 체육관 열쇠' } }
};

function computeStudentCombatStats(record = {}) {
  if (record.isTeacher || record.studentId === '교사') {
    return { atk: 9999, def: 9999 };
  }
  const level = Math.max(1, Number(record.level) || 1);
  const lvBonus = Math.max(0, level - 1);
  const baseAtk = (record.baseAtk !== undefined && Number.isFinite(Number(record.baseAtk)) && Number(record.baseAtk) > 0)
    ? Number(record.baseAtk)
    : 10;
  const baseDef = (record.baseDef !== undefined && Number.isFinite(Number(record.baseDef)) && Number(record.baseDef) >= 0)
    ? Number(record.baseDef)
    : 2;

  let bonusAtk = 0;
  let bonusDef = 0;
  const eqMap = (record.equipment && typeof record.equipment === 'object') ? record.equipment : null;
  if (eqMap) {
    const firstAccItem = (eqMap.accessory && eqMap.accessory.item) ? eqMap.accessory.item : null;
    for (const [slot, eq] of Object.entries(eqMap)) {
      if (!eq) continue;
      if (slot === 'accessory2' && firstAccItem && eq.item === firstAccItem) continue;
      const canonStats = (eq.item && ALL_GAME_ITEMS[eq.item] && ALL_GAME_ITEMS[eq.item].meta && ALL_GAME_ITEMS[eq.item].meta.stats)
        ? ALL_GAME_ITEMS[eq.item].meta.stats
        : eq.stats;
      if (canonStats) {
        bonusAtk += Number(canonStats.atk) || 0;
        bonusDef += Number(canonStats.def) || 0;
      }
    }
  }

  const computedAtk = baseAtk + lvBonus + bonusAtk;
  const computedDef = baseDef + lvBonus + bonusDef;
  const rawAtk = Number(record.atk);
  const rawDef = Number(record.def);
  return {
    atk: Number.isFinite(rawAtk) ? Math.max(computedAtk, Math.min(computedAtk + 20, Math.round(rawAtk))) : computedAtk,
    def: Number.isFinite(rawDef) ? Math.max(computedDef, Math.min(computedDef + 20, Math.round(rawDef))) : computedDef
  };
}

function buildLeaderboardPayload(requesterStudentId = '', requesterSocketId = '') {
  const merged = new Map();
  const savedAll = getStudentsProgress() || {};

  for (const [sidKey, saved] of Object.entries(savedAll)) {
    if (!saved || typeof saved !== 'object') continue;
    const sid = String(saved.studentId || sidKey || '').trim();
    if (!sid || sid === '교사' || saved.isTeacher || !saved.name) continue;
    const stats = computeStudentCombatStats(saved);
    merged.set(sid, {
      id: `offline_${sid}`,
      name: String(saved.name),
      studentId: sid,
      level: Math.max(1, Number(saved.level) || 1),
      exp: Math.max(0, Number(saved.exp) || 0),
      gold: Math.max(0, Number(saved.gold) || 0),
      atk: stats.atk,
      def: stats.def,
      isOnline: false,
      equipment: saved.equipment || null,
      baseAtk: saved.baseAtk,
      baseDef: saved.baseDef
    });
  }

  for (const p of Object.values(players)) {
    if (!p || p.isTeacher || p.studentId === '교사' || !p.name) continue;
    const sid = String(p.studentId || p.id || '').trim();
    if (!sid) continue;
    const prev = merged.get(sid);
    const combined = {
      ...(prev || {}),
      ...p,
      studentId: sid,
      equipment: p.equipment || (prev && prev.equipment) || null,
      baseAtk: p.baseAtk !== undefined ? p.baseAtk : (prev && prev.baseAtk),
      baseDef: p.baseDef !== undefined ? p.baseDef : (prev && prev.baseDef)
    };
    const stats = computeStudentCombatStats(combined);
    merged.set(sid, {
      id: p.id,
      name: String(p.name),
      studentId: sid,
      level: Math.max(1, Number(p.level) || 1),
      exp: Math.max(0, Number(p.exp) || 0),
      gold: Math.max(0, Number(p.gold) || 0),
      atk: stats.atk,
      def: stats.def,
      isOnline: true
    });
  }

  const sorted = Array.from(merged.values())
    .map(({ equipment, baseAtk, baseDef, ...entry }) => entry)
    .sort((a, b) =>
      (b.level - a.level) ||
      (b.exp - a.exp) ||
      (b.atk - a.atk) ||
      (b.def - a.def) ||
      (b.gold - a.gold)
    );

  const reqSid = String(requesterStudentId || '').trim();
  let myRank = -1;
  if (reqSid || requesterSocketId) {
    myRank = sorted.findIndex(e =>
      (reqSid && e.studentId === reqSid) ||
      (requesterSocketId && e.id === requesterSocketId)
    );
    if (myRank >= 0) myRank += 1;
  }

  return {
    list: sorted.slice(0, 10),
    myRank,
    totalCount: sorted.length
  };
}

app.get('/api/leaderboard', (req, res) => {
  const sid = (req.query.studentId || '').trim();
  res.json({ success: true, ...buildLeaderboardPayload(sid) });
});

// =========================================================================
// 🔒 Server-Authoritative Economy / Crafting / Quest / Safe APIs
// =========================================================================
const SERVER_MAX_LEVEL = 100;

const SERVER_STORE_BUY_ITEMS = {
  'item_red_potion': { id: 'item_red_potion', name: '빨간 물약', icon: '🧪', price: 30, meta: { type: 'consumable', slot: 'consumable', heal: 10, effect: '체력 +10 회복' } },
  'item_orange_potion': { id: 'item_orange_potion', name: '주홍 물약', icon: '🧪', price: 75, meta: { type: 'consumable', slot: 'consumable', heal: 25, effect: '체력 +25 회복' } },
  'item_green_potion': { id: 'item_green_potion', name: '초록 물약', icon: '🧪', price: 75, meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '1분간 기본 이동속도 +10% 증가' } },
  'item_revive_scroll': { id: 'item_revive_scroll', name: '부활 주문서', icon: '📜', price: 100, meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '쓰러진 친구를 50% 체력으로 부활' } },
  'item_return_scroll': { id: 'item_return_scroll', name: '귀환 주문서', icon: '📜', price: 100, meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '사용 시 모든 장소에서 7층 복도로 즉시 공간 이동' } },
  'item_teleport_scroll': { id: 'item_teleport_scroll', name: '순간이동 주문서', icon: '📜', price: 300, meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '사용 시 각 층 복도 및 운동장으로 즉시 공간 이동' } }
};

const SERVER_ITEM_SELL_PRICES = {
  'item_wood': 1, 'item_herb': 1, 'item_forsythia': 2, 'item_ginkgo': 3,
  'item_basketball_leather': 2, 'item_futsal_leather': 2, 'item_boss_leather': 15, 'item_bronze_heart': 30,
  'equip_shoes_samdidas': 20, 'item_perfect_exam': 50, 'item_eval_paper': 25,
  'equip_wood_sword': 4, 'equip_wood_helmet': 3, 'equip_wood_armor': 3,
  'equip_leather_sword': 10, 'equip_leather_helmet': 10, 'equip_leather_armor': 10, 'equip_leather_shoes': 10, 'equip_forsythia_ring': 20,
  'equip_bronze_sword': 100, 'equip_bronze_helmet': 60, 'equip_bronze_armor': 60, 'equip_ginkgo_talisman': 100,
  'item_history_essence': 5, 'item_unyielding_stone': 10,
  'equip_heritage_blade': 160, 'equip_heritage_helmet': 100, 'equip_heritage_armor': 100, 'equip_bronze_shoes': 16, 'equip_heritage_boots': 30,
  'equip_omr_wand': 20, 'equip_vintage_armband': 0, 'equip_elevator_pass': 0
};

function getServerItemSellPrice(itemId) {
  if (Object.prototype.hasOwnProperty.call(SERVER_ITEM_SELL_PRICES, itemId)) {
    return SERVER_ITEM_SELL_PRICES[itemId];
  }
  if (itemId.startsWith('equip_bronze')) return 10;
  if (itemId.startsWith('equip_leather')) return 8;
  if (itemId.startsWith('equip_wood')) return 3;
  if (itemId.startsWith('item_')) return 2;
  return 1;
}

function getServerInventoryCount(inv, itemId) {
  if (!Array.isArray(inv)) return 0;
  const entry = inv.find(i => i && i.item === itemId);
  return entry ? (Number(entry.count) || 0) : 0;
}

const SERVER_QUEST_DEFINITIONS = {
  'quest_joshua_intro': {
    minLevel: 1,
    isComplete: (q) => ((q.quizCount || 0) >= 2 && !!q.memoCollected),
    cleanupItems: ['item_joshua_memo'],
    rewards: [
      { type: 'gold', amount: 100 },
      { type: 'exp', amount: 100 },
      { type: 'item', itemKey: 'item_teleport_scroll', itemName: '순간이동 주문서', count: 1, icon: '📜' }
    ]
  },
  'quest_okchohan_social': {
    minLevel: 4,
    isComplete: (q) => ((q.acidRainScore || 0) >= 1000 && !!q.textbookCollected),
    cleanupItems: ['item_okchohan_textbook'],
    rewards: [
      { type: 'item', itemKey: 'item_bronze_heart', itemName: '청동 드래곤의 심장', count: 1, icon: '❤️‍🔥' },
      { type: 'gold', amount: 100 },
      { type: 'exp', amount: 100 }
    ]
  },
  'quest_kimmijin_art': {
    minLevel: 3,
    isComplete: (q, inv) => (Math.max(getServerInventoryCount(inv, 'item_forsythia'), q.forsythiaCount || 0) >= 3 && !!q.sketchbookCollected),
    cleanupItems: ['item_kimmijin_sketchbook'],
    rewards: [
      { type: 'item', itemKey: 'item_forsythia', itemName: '노란 개나리 꽃잎', count: 3, icon: '🌼' },
      { type: 'exp', amount: 100 }
    ]
  },
  'quest_yosunyu_info': {
    minLevel: 5,
    isComplete: (q) => (!!q.serverInspected && !!q.usbCollected),
    cleanupItems: ['item_yosunyu_usb'],
    rewards: [
      { type: 'item', itemKey: 'item_boss_leather', itemName: '보스의 가죽', count: 1, icon: '🥋' },
      { type: 'exp', amount: 200 }
    ]
  },
  'quest_kwimjinsyong_career': {
    minLevel: 7,
    isComplete: (q) => (!!q.guidebookCollected && !!q.studentComforted),
    cleanupItems: ['item_career_guidebook'],
    rewards: [
      { type: 'exp', amount: 150 },
      { type: 'item', itemKey: 'item_courage_potion', itemName: '용기 포션', count: 2, icon: '🧪', meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '1분간 공격력(ATK) +5 증가' } }
    ]
  },
  'quest_library_missing_books': {
    minLevel: 8,
    isComplete: (q) => (!!q.bookPgCollected && !!q.bookOfCollected && !!q.bookHiCollected),
    cleanupItems: ['item_lib_book_pg', 'item_lib_book_of', 'item_lib_book_hi'],
    rewards: [
      { type: 'gold', amount: 100 },
      { type: 'exp', amount: 150 }
    ]
  },
  'quest_cafeteria_order': {
    minLevel: 10,
    isComplete: (q) => !!q.targetCalmed,
    cleanupItems: [],
    rewards: [
      { type: 'gold', amount: 150 },
      { type: 'exp', amount: 200 }
    ]
  },
  'quest_cafeteria_manners': {
    minLevel: 10,
    isComplete: (q) => !!q.targetCalmed,
    cleanupItems: [],
    rewards: [
      { type: 'gold', amount: 100 },
      { type: 'exp', amount: 200 },
      { type: 'item', itemKey: 'item_nutrition_essence', itemName: '정제된 영양의 정수', count: 2, icon: '🍱' },
      { type: 'item', itemKey: 'item_stainless_shard', itemName: '특수 강화 스텐 조각', count: 1, icon: '✨' }
    ]
  },
  'quest_health_emergency': {
    minLevel: 11,
    isComplete: (q, inv) => (!!q.cabinetChecked && !!q.libRecipeFound && Math.max(getServerInventoryCount(inv, 'item_herb'), Number(q.herbCount) || 0) >= 5),
    cleanupItems: [],
    rewards: [
      { type: 'item', itemKey: 'item_orange_potion', itemName: '주홍 물약', count: 2, icon: '🧪', meta: { type: 'consumable', slot: 'consumable', heal: 25, effect: '체력 +25 회복' } }
    ]
  },
  'quest_wee_heart_signal': {
    minLevel: 12,
    requiresDone: 'quest_health_emergency',
    isComplete: (q) => (!!q.mailboxChecked && !!q.storageClueFound && !!q.broadcastFixed),
    cleanupItems: [],
    rewards: [
      { type: 'exp', amount: 350 },
      { type: 'item', itemKey: 'item_courage_potion', itemName: '용기의 물약', count: 1, icon: '🧪', meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '1분간 공격력(ATK) +5 증가' } },
      { type: 'item', itemKey: 'item_protection_potion', itemName: '수호의 물약', count: 1, icon: '🧪', meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '1분간 방어력(DEF) +3 증가' } }
    ]
  },
  'quest_wee_hope_broadcast': {
    minLevel: 12,
    requiresDone: 'quest_wee_heart_signal',
    isComplete: (q) => (!!q.nurseCoopConfirmed && !!q.stageSpeechDone && !!q.teaCeremonyDone),
    cleanupItems: [],
    rewards: [
      { type: 'exp', amount: 300 },
      { type: 'gold', amount: 200 },
      { type: 'item', itemKey: 'item_stainless_shard', itemName: '특수 강화 스텐 조각', count: 2, icon: '✨', meta: { type: 'material', effect: '급식실 몬스터 전리품 · 5티어 최고급 장비 제작 핵심 재료' } },
      { type: 'item', itemKey: 'item_nutrition_essence', itemName: '정제된 영양의 정수', count: 4, icon: '🍱', meta: { type: 'material', effect: '급식실 몬스터 전리품 · 5티어 최고급 장비 제작 필수 재료' } }
    ]
  },
  'quest_pe_errand': {
    minLevel: 12,
    isComplete: (q, inv) => (!!q.keyCollected || getServerInventoryCount(inv, 'item_gym_key') >= 1),
    cleanupItems: ['item_gym_key'],
    rewards: [
      { type: 'gold', amount: 100 },
      { type: 'item', itemKey: 'item_tiny_exp_potion', itemName: '초소형 경험치 물약', count: 3, icon: '🧪', meta: { type: 'consumable', slot: 'consumable', expGain: 50, effect: '사용 시 경험치(EXP) +50 상승' } }
    ]
  }
};

function authorizeStudentAction(req, res, targetStudentId) {
  const sid = String(targetStudentId || '').trim();
  if (!sid || sid === '교사') {
    res.status(400).json({ success: false, error: '유효한 학번이 필요합니다.' });
    return null;
  }
  if (isAuthorizedTeacherHttp(req)) {
    return { studentId: sid, isTeacher: true };
  }
  const token = req.headers['x-student-token'] || (req.body && req.body.studentAuthToken);
  const sess = consumeValidToken(activeStudentSessions, token, false);
  if (!sess || sess.studentId !== sid) {
    res.status(401).json({ success: false, error: '🔒 학생 세션 인증이 만료되었거나 유효하지 않습니다. 다시 로그인해 주세요.' });
    return null;
  }
  return { studentId: sid, isTeacher: false, session: sess };
}

function addServerInventoryItem(inv, itemId, name, count = 1, icon = '📦', meta = {}) {
  const canon = ALL_GAME_ITEMS[itemId] || null;
  const canonMeta = (canon && canon.meta) ? canon.meta : {};
  const resolvedStats = canonMeta.stats || meta.stats || null;
  const resolvedEffect = canonMeta.effect || meta.effect || '';
  const existing = inv.find(i => i && i.item === itemId);
  if (existing) {
    existing.count = (Number(existing.count) || 0) + count;
    if (resolvedStats) existing.stats = resolvedStats;
    if (resolvedEffect) existing.effect = resolvedEffect;
  } else {
    inv.push({
      item: itemId,
      name: (canon && canon.name) || name,
      count,
      icon: (canon && canon.icon) || icon,
      type: canonMeta.type || meta.type || (itemId.startsWith('equip_') ? 'equipment' : 'material'),
      slot: canonMeta.slot || meta.slot || null,
      stats: resolvedStats,
      heal: canonMeta.heal || meta.heal || 0,
      effect: resolvedEffect
    });
  }
}

function removeServerInventoryItem(inv, equipment, itemId, count = 1) {
  const idx = inv.findIndex(i => i && i.item === itemId);
  if (idx === -1) return inv;
  inv[idx].count = (Number(inv[idx].count) || 0) - count;
  if (inv[idx].count <= 0) {
    if (equipment && typeof equipment === 'object') {
      for (const slot of Object.keys(equipment)) {
        if (equipment[slot] && equipment[slot].item === itemId) {
          equipment[slot] = null;
        }
      }
    }
    return inv.filter(i => i && i.item !== itemId);
  }
  return inv;
}

function applyServerExpAndLevelUp(record, baseAmount) {
  const curLv = Math.max(1, Number(record.level) || 1);
  if (curLv >= SERVER_MAX_LEVEL) {
    record.level = SERVER_MAX_LEVEL;
    record.exp = 0;
    return 0;
  }
  let finalAmount = Number(baseAmount) || 0;
  const eq = record.equipment || {};
  const hasVintageArmband = (
    (eq.accessory && eq.accessory.item === 'equip_vintage_armband') ||
    (eq.accessory2 && eq.accessory2.item === 'equip_vintage_armband')
  );
  if (hasVintageArmband && baseAmount > 0) {
    finalAmount += Math.max(1, Math.round(baseAmount * 0.10));
  }
  record.exp = (Number(record.exp) || 0) + finalAmount;
  record.level = curLv;
  while (record.level < SERVER_MAX_LEVEL && record.exp >= record.level * 100) {
    record.exp -= record.level * 100;
    record.level++;
  }
  if (record.level >= SERVER_MAX_LEVEL) {
    record.exp = 0;
  }
  return finalAmount;
}

function syncActivePlayerAfterMutation(studentId, record) {
  scheduleSheetStudentSync(studentId);
  const activeStudent = Object.values(players).find(p => p.studentId === studentId);
  if (!activeStudent) return;
  activeStudent.level = record.level;
  activeStudent.gold = record.gold;
  activeStudent.exp = record.exp;
  if (record.equipment && typeof record.equipment === 'object') {
    activeStudent.equipment = record.equipment;
  }
  const computed = computeStudentCombatStats({
    ...activeStudent,
    atk: record.atk,
    def: record.def
  });
  activeStudent.atk = computed.atk;
  activeStudent.def = computed.def;
  broadcastStudentList();
}

app.post('/api/craft', (req, res) => {
  const body = parseJsonBody(req.body);
  const auth = authorizeStudentAction(req, res, body.studentId);
  if (!auth) return;

  const recipeId = String(body.recipeId || '').trim();
  const multiplier = Number(body.multiplier || 1);
  const assembled = String(body.assembled || '').trim();

  if (!Number.isInteger(multiplier) || multiplier < 1 || multiplier > 20) {
    return res.status(400).json({ success: false, error: '유효하지 않은 제작 수량입니다. (1~20)' });
  }

  const latestRecipes = loadCraftRecipesSafe(null);
  if (!latestRecipes) {
    return res.status(500).json({ success: false, error: '제작 레시피 데이터를 불러오지 못했습니다.' });
  }
  const recipe = latestRecipes.find(r => r.id === recipeId);
  if (!recipe) {
    return res.status(404).json({ success: false, error: '존재하지 않는 제작 레시피입니다.' });
  }

  const all = getStudentsProgress() || {};
  const record = all[auth.studentId];
  if (!record) {
    return res.status(404).json({ success: false, error: '학생 진행 데이터를 찾을 수 없습니다.' });
  }

  const pLevel = Math.max(1, Number(record.level) || 1);
  const pGrade = Math.max(1, Number(record.grade) || 1);
  if (!auth.isTeacher && recipe.gradeLevel && pGrade < recipe.gradeLevel) {
    return res.status(403).json({ success: false, error: '해당 학년에서는 제작할 수 없는 레시피입니다.' });
  }
  if (!auth.isTeacher && recipe.requiredLevel && pLevel < recipe.requiredLevel) {
    return res.status(403).json({ success: false, error: `레벨이 부족합니다! (필요: Lv.${recipe.requiredLevel}, 현재: Lv.${pLevel})` });
  }

  const expectedSentence = recipe.unscramble && recipe.unscramble.correct;
  if (expectedSentence && assembled !== expectedSentence) {
    return res.status(400).json({ success: false, error: '영어 문장 어순이 올바르지 않습니다!' });
  }

  record.inventory = Array.isArray(record.inventory) ? [...record.inventory] : [];
  record.equipment = (record.equipment && typeof record.equipment === 'object') ? { ...record.equipment } : {};

  for (const reqItem of (recipe.requiredItems || [])) {
    const needCount = reqItem.count * multiplier;
    const haveCount = getServerInventoryCount(record.inventory, reqItem.item);
    if (haveCount < needCount) {
      return res.status(400).json({ success: false, error: `재료 '${reqItem.name}'이(가) 부족합니다. (필요: ${needCount}, 보유: ${haveCount})` });
    }
  }

  const needGold = (recipe.requiredGold || 0) * multiplier;
  const haveGold = Number(record.gold) || 0;
  if (haveGold < needGold) {
    return res.status(400).json({ success: false, error: `골드가 부족합니다. (필요: ${needGold}G, 보유: ${haveGold}G)` });
  }

  for (const reqItem of (recipe.requiredItems || [])) {
    record.inventory = removeServerInventoryItem(record.inventory, record.equipment, reqItem.item, reqItem.count * multiplier);
  }
  record.gold = haveGold - needGold;

  const resultDef = recipe.result;
  addServerInventoryItem(record.inventory, resultDef.item, resultDef.name, multiplier, resultDef.icon || recipe.icon, {
    type: resultDef.type || 'equipment',
    slot: resultDef.slot || 'accessory',
    stats: resultDef.stats || { atk: 0, def: 0, hp: 0 },
    heal: resultDef.heal || 0,
    effect: resultDef.effect || ''
  });
  const expGained = applyServerExpAndLevelUp(record, 50 * multiplier);
  record.updatedAt = Date.now();
  all[auth.studentId] = record;
  saveStudentsProgress(all, true);
  syncActivePlayerAfterMutation(auth.studentId, record);

  return res.json({
    success: true,
    level: record.level,
    exp: record.exp,
    gold: record.gold,
    inventory: record.inventory,
    expGained,
    craftedItem: resultDef
  });
});

app.post('/api/store/buy', (req, res) => {
  const body = parseJsonBody(req.body);
  const auth = authorizeStudentAction(req, res, body.studentId);
  if (!auth) return;

  const itemId = String(body.itemId || '').trim();
  const quantity = Number(body.quantity || 1);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return res.status(400).json({ success: false, error: '유효하지 않은 구매 수량입니다.' });
  }
  const storeItem = SERVER_STORE_BUY_ITEMS[itemId];
  if (!storeItem) {
    return res.status(404).json({ success: false, error: '매점에서 판매하지 않는 상품입니다.' });
  }

  const all = getStudentsProgress() || {};
  const record = all[auth.studentId];
  if (!record) {
    return res.status(404).json({ success: false, error: '학생 진행 데이터를 찾을 수 없습니다.' });
  }

  const totalCost = storeItem.price * quantity;
  const currentGold = Number(record.gold) || 0;
  if (currentGold < totalCost) {
    return res.status(400).json({ success: false, error: `골드가 부족합니다! (필요: ${totalCost} G / 보유: ${currentGold} G)` });
  }

  record.gold = currentGold - totalCost;
  record.inventory = Array.isArray(record.inventory) ? [...record.inventory] : [];
  addServerInventoryItem(record.inventory, storeItem.id, storeItem.name, quantity, storeItem.icon, storeItem.meta || {});
  record.updatedAt = Date.now();
  all[auth.studentId] = record;
  saveStudentsProgress(all, true);
  syncActivePlayerAfterMutation(auth.studentId, record);

  return res.json({
    success: true,
    gold: record.gold,
    inventory: record.inventory,
    totalCost
  });
});

app.post('/api/store/sell', (req, res) => {
  const body = parseJsonBody(req.body);
  const auth = authorizeStudentAction(req, res, body.studentId);
  if (!auth) return;

  const itemId = String(body.itemId || '').trim();
  const count = Number(body.count || 1);
  if (!Number.isInteger(count) || count < 1) {
    return res.status(400).json({ success: false, error: '유효하지 않은 판매 수량입니다.' });
  }

  const def = ALL_GAME_ITEMS[itemId] || {};
  const type = (def.meta && def.meta.type) || '';
  const unitPrice = getServerItemSellPrice(itemId);
  if (itemId === 'equip_vintage_armband' || itemId === 'equip_elevator_pass' || (def.meta && def.meta.isQuestItem) || unitPrice <= 0) {
    return res.status(400).json({ success: false, error: '이 유물/특수 아이템은 매점에서 매각할 수 없습니다!' });
  }
  if (type === 'consumable' || itemId.includes('potion') || itemId.includes('scroll') || itemId.includes('elixir')) {
    return res.status(400).json({ success: false, error: '소비품(물약 및 주문서)은 매점에서 매각할 수 없습니다!' });
  }

  const all = getStudentsProgress() || {};
  const record = all[auth.studentId];
  if (!record) {
    return res.status(404).json({ success: false, error: '학생 진행 데이터를 찾을 수 없습니다.' });
  }

  record.inventory = Array.isArray(record.inventory) ? [...record.inventory] : [];
  record.equipment = (record.equipment && typeof record.equipment === 'object') ? { ...record.equipment } : {};

  const equippedIds = new Set(Object.values(record.equipment).filter(e => e && e.item).map(e => e.item));
  if (equippedIds.has(itemId)) {
    return res.status(400).json({ success: false, error: '착용 중인 장비는 판매할 수 없습니다!' });
  }

  const existing = record.inventory.find(i => i && i.item === itemId);
  if (!existing || (Number(existing.count) || 0) < count) {
    return res.status(400).json({ success: false, error: '보유 수량이 부족합니다.' });
  }

  const earnedGold = unitPrice * count;
  record.inventory = removeServerInventoryItem(record.inventory, record.equipment, itemId, count);
  record.gold = (Number(record.gold) || 0) + earnedGold;
  record.updatedAt = Date.now();
  all[auth.studentId] = record;
  saveStudentsProgress(all, true);
  syncActivePlayerAfterMutation(auth.studentId, record);

  return res.json({
    success: true,
    gold: record.gold,
    inventory: record.inventory,
    soldCount: count,
    earnedGold
  });
});

app.post('/api/quest/complete', (req, res) => {
  const body = parseJsonBody(req.body);
  const auth = authorizeStudentAction(req, res, body.studentId);
  if (!auth) return;

  const questId = String(body.questId || '').trim();
  const qDef = SERVER_QUEST_DEFINITIONS[questId];
  if (!qDef) {
    return res.status(404).json({ success: false, error: '존재하지 않는 퀘스트입니다.' });
  }

  const all = getStudentsProgress() || {};
  const record = all[auth.studentId];
  if (!record) {
    return res.status(404).json({ success: false, error: '학생 진행 데이터를 찾을 수 없습니다.' });
  }

  record.quests = (record.quests && typeof record.quests === 'object') ? { ...record.quests } : {};
  const quest = record.quests[questId];
  if (!quest || (quest.status !== 'in_progress' && quest.status !== 'completed')) {
    return res.status(400).json({ success: false, error: '수락하여 진행 중인 퀘스트만 완료할 수 있습니다.' });
  }

  const pLevel = Math.max(1, Number(record.level) || 1);
  if (!auth.isTeacher && qDef.minLevel && pLevel < qDef.minLevel) {
    return res.status(403).json({ success: false, error: `최소 레벨 Lv.${qDef.minLevel} 이상이 필요합니다.` });
  }
  if (qDef.requiresDone) {
    const prereq = record.quests[qDef.requiresDone];
    if (!prereq || prereq.status !== 'done') {
      return res.status(400).json({ success: false, error: '이전 연계 퀘스트를 먼저 완료해야 합니다.' });
    }
  }

  record.inventory = Array.isArray(record.inventory) ? [...record.inventory] : [];
  record.equipment = (record.equipment && typeof record.equipment === 'object') ? { ...record.equipment } : {};

  if (!qDef.isComplete(quest, record.inventory)) {
    return res.status(400).json({ success: false, error: '아직 의뢰 목표를 모두 달성하지 못했습니다!' });
  }

  record.quests[questId] = { ...quest, status: 'done', completedAt: Date.now() };
  for (const r of qDef.rewards) {
    if (r.type === 'gold') {
      record.gold = (Number(record.gold) || 0) + r.amount;
    } else if (r.type === 'exp') {
      applyServerExpAndLevelUp(record, r.amount);
    } else if (r.type === 'item') {
      addServerInventoryItem(record.inventory, r.itemKey, r.itemName, r.count || 1, r.icon || '📦', r.meta || { type: 'material' });
    }
  }
  if (qDef.unlockTitle) {
    record.titles = Array.isArray(record.titles) ? [...record.titles] : [];
    if (!record.titles.includes(qDef.unlockTitle)) {
      record.titles.push(qDef.unlockTitle);
    }
  }
  for (const cleanupId of (qDef.cleanupItems || [])) {
    record.inventory = removeServerInventoryItem(record.inventory, record.equipment, cleanupId, 1);
  }

  record.updatedAt = Date.now();
  all[auth.studentId] = record;
  saveStudentsProgress(all, true);
  syncActivePlayerAfterMutation(auth.studentId, record);

  return res.json({
    success: true,
    level: record.level,
    exp: record.exp,
    gold: record.gold,
    inventory: record.inventory,
    quests: record.quests,
    titles: record.titles
  });
});

app.post('/api/item/use-exp-potion', (req, res) => {
  const body = parseJsonBody(req.body);
  const auth = authorizeStudentAction(req, res, body.studentId);
  if (!auth) return;

  const itemId = String(body.itemId || 'item_tiny_exp_potion').trim();
  const EXP_POTION_VALUES = {
    'item_tiny_exp_potion': 50
  };
  const expGainBase = EXP_POTION_VALUES[itemId];
  if (!expGainBase) {
    return res.status(400).json({ success: false, error: '유효하지 않은 경험치 물약입니다.' });
  }

  const all = getStudentsProgress() || {};
  const record = all[auth.studentId];
  if (!record) {
    return res.status(404).json({ success: false, error: '학생 진행 데이터를 찾을 수 없습니다.' });
  }

  const curLv = Math.max(1, Number(record.level) || 1);
  if (curLv >= SERVER_MAX_LEVEL) {
    return res.status(400).json({ success: false, error: `이미 최고 레벨(Lv.${SERVER_MAX_LEVEL})에 도달하여 경험치 물약을 사용할 수 없습니다!` });
  }

  record.inventory = Array.isArray(record.inventory) ? [...record.inventory] : [];
  record.equipment = (record.equipment && typeof record.equipment === 'object') ? { ...record.equipment } : {};

  if (getServerInventoryCount(record.inventory, itemId) < 1) {
    return res.status(400).json({ success: false, error: '인벤토리에 해당 경험치 물약이 없습니다.' });
  }

  record.inventory = removeServerInventoryItem(record.inventory, record.equipment, itemId, 1);
  const expGained = applyServerExpAndLevelUp(record, expGainBase);
  record.updatedAt = Date.now();
  all[auth.studentId] = record;
  saveStudentsProgress(all, true);
  syncActivePlayerAfterMutation(auth.studentId, record);

  return res.json({
    success: true,
    level: record.level,
    exp: record.exp,
    expGained,
    gold: record.gold,
    inventory: record.inventory
  });
});

app.post('/api/safe/cafeteria-key', (req, res) => {
  const body = parseJsonBody(req.body);
  const auth = authorizeStudentAction(req, res, body.studentId);
  if (!auth) return;

  const all = getStudentsProgress() || {};
  const record = all[auth.studentId];
  if (!record) {
    return res.status(404).json({ success: false, error: '학생 진행 데이터를 찾을 수 없습니다.' });
  }

  const pLevel = Math.max(1, Number(record.level) || 1);
  if (!auth.isTeacher && pLevel < 10) {
    return res.status(403).json({ success: false, error: `10레벨 이상부터 조사할 수 있습니다. (현재: Lv.${pLevel})` });
  }

  record.inventory = Array.isArray(record.inventory) ? [...record.inventory] : [];
  record.equipment = (record.equipment && typeof record.equipment === 'object') ? { ...record.equipment } : {};

  if (record.hasCafeteriaKey || getServerInventoryCount(record.inventory, 'item_cafeteria_key') > 0) {
    return res.json({ success: true, alreadyUnlocked: true, hasCafeteriaKey: true, inventory: record.inventory });
  }

  const eq = record.equipment;
  const isHelm = eq.helmet && eq.helmet.item === 'equip_heritage_helmet';
  const isArmor = eq.armor && eq.armor.item === 'equip_heritage_armor';
  const wepItem = eq.weapon && eq.weapon.item;
  const isWep = (wepItem === 'equip_heritage_blade' || wepItem === 'equip_omr_wand');
  if (!auth.isTeacher && !(isHelm && isArmor && isWep)) {
    return res.status(400).json({ success: false, error: '1897 헤리티지 3종 세트(투구·갑옷·무기/컴싸 마법봉)를 착용해야 보관함을 열 수 있습니다.' });
  }

  record.hasCafeteriaKey = true;
  addServerInventoryItem(record.inventory, 'item_cafeteria_key', '급식실 열쇠', 1, '🔑', {
    type: 'quest',
    effect: '급식실 정문 출입용 황금 열쇠'
  });
  record.updatedAt = Date.now();
  all[auth.studentId] = record;
  saveStudentsProgress(all, true);
  scheduleSheetStudentSync(auth.studentId);

  return res.json({
    success: true,
    hasCafeteriaKey: true,
    inventory: record.inventory
  });
});

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
  if (room === 'playground' || room === 'playground_gym' || room === 'room_cafeteria' || room === 'room_gym') return 1;
  if (room === 'room_career') return 5;
  if (room === 'room_staff_office') return 6;
  if (room === 'room_history') return 0;
  return floor;
}

function isAuthorizedTeacherSocket(socket, payload = {}) {
  const player = players[socket.id];
  const token = payload && (payload.token || payload.teacherToken);
  const pwd = payload && (payload.pwd || payload.teacherPwd);
  return !!(
    socket.isTeacher ||
    (player && player.isTeacher) ||
    isValidTeacherToken(token) ||
    (typeof pwd === 'string' && pwd === TEACHER_PASSWORD)
  );
}

function rejectUnauthorizedTeacherSocket(socket, msg = '🔒 교사 권한이 필요합니다.') {
  socket.emit('teacher_action_alert', { message: msg });
}

io.on('connection', (socket) => {
  console.log(`[Connect] Socket ID: ${socket.id}`);

  // 🔒 Send current server gate state immediately to new connection
  socket.emit('server_state_sync', getPublicServerGatePayload());

  // Player Login
  socket.on('player_join', (data) => {
    const { name, grade, studentId, avatar, isTeacher, teacherPwd, teacherToken, studentAuthToken } = data || {};
    const isVerifiedTeacher = !!isTeacher && (
      isValidTeacherToken(teacherToken) ||
      teacherPwd === TEACHER_PASSWORD
    );
    socket.isTeacher = isVerifiedTeacher;
    if (isVerifiedTeacher) {
      socket.teacherToken = isValidTeacherToken(teacherToken)
        ? teacherToken
        : issueTeacherToken();
    } else {
      socket.teacherToken = null;
    }

    // 🔒 Teacher Gate Enforcement: If server is closed and not a verified teacher, reject entry
    if (!serverGateState.isOpen && !isVerifiedTeacher) {
      socket.emit('server_entry_rejected', {
        reason: 'server_closed',
        message: serverGateState.closedMessage || "지금은 서버 점검 및 수업 준비 중입니다.\n선생님께서 서버를 개방하실 때까지 잠시 대기해주세요!"
      });
      setTimeout(() => { try { socket.disconnect(true); } catch (_) {} }, 150);
      return;
    }

    // 🔐 Enforce @senedu.kr Email + 4-digit PIN session when emergency login is disabled
    if (!isVerifiedTeacher && !serverGateState.allowEmergencyStudentLogin) {
      const sess = consumeValidToken(activeStudentSessions, studentAuthToken, false);
      if (!sess || (studentId && sess.studentId !== String(studentId).trim())) {
        socket.emit('server_entry_rejected', {
          reason: 'pin_auth_required',
          message: `🔒 @${ALLOWED_EMAIL_DOMAIN} 이메일과 4자리 PIN 인증이 필요합니다.\n로그인 화면에서 이메일과 PIN을 입력해 주세요!`
        });
        return;
      }
    }
    const resolvedName = isVerifiedTeacher ? ((name && name !== '교사') ? name : '갓준철') : (name || '학생_' + socket.id.substr(0, 4));
    const initRoom = data.room || 'hallway';
    const initFloor = normalizeSingletonRoomFloor(initRoom, (data.floor !== undefined) ? parseInt(data.floor) : 7);
    const joinedStats = isVerifiedTeacher
      ? { atk: 9999, def: 9999 }
      : computeStudentCombatStats({
          level: data.level || 1,
          baseAtk: data.baseAtk,
          baseDef: data.baseDef,
          equipment: data.equipment,
          atk: data.atk,
          def: data.def
        });
    players[socket.id] = {
      id: socket.id,
      name: resolvedName,
      studentId: isVerifiedTeacher ? '교사' : (studentId || '10101'),
      grade: parseInt(grade) || 1,
      avatar: avatar || 'student_m1',
      isTeacher: isVerifiedTeacher,
      hp: isVerifiedTeacher ? 9999 : 100,
      maxHp: isVerifiedTeacher ? 9999 : 100,
      baseAtk: isVerifiedTeacher ? 9999 : (Number(data.baseAtk) || 10),
      baseDef: isVerifiedTeacher ? 9999 : (Number(data.baseDef) >= 0 ? Number(data.baseDef) : 2),
      atk: joinedStats.atk,
      def: joinedStats.def,
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
    lastOccupiedAt = Date.now();

    const currentRoom = `server_${players[socket.id].grade}_f${players[socket.id].floor}_${players[socket.id].room}`;
    socket.join(currentRoom);

    // Send initial self data & current Boss Raid state (teacherToken is ONLY sent to the verified teacher's own socket)
    socket.emit('init_self', isVerifiedTeacher
      ? { ...players[socket.id], teacherToken: socket.teacherToken }
      : players[socket.id]);
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

  socket.on('teacher_set_plant_water', (payload = {}) => {
    if (!isAuthorizedTeacherSocket(socket, payload)) {
      return rejectUnauthorizedTeacherSocket(socket);
    }
    const { count } = payload;
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
  socket.on('teacher_grant_item', (reqData = {}) => {
    if (!isAuthorizedTeacherSocket(socket, reqData)) {
      socket.emit('teacher_action_alert', { message: '🔒 교사 암호 인증에 실패했습니다.' });
      return;
    }
    const { targetSocketId, itemKey, count, reason } = reqData;

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
  socket.on('teacher_toggle_server_state', (payload = {}) => {
    if (!isAuthorizedTeacherSocket(socket, payload)) {
      socket.emit('teacher_action_alert', { message: '⚠️ 교사 권한이 없어 서버 상태를 변경할 수 없습니다. (새로고침 후 재로그인 필요)' });
      return;
    }
    const { isOpen, message } = payload;
    const actor = (players[socket.id] && players[socket.id].name) || '교사';
    applyServerGateStateChange(!!isOpen, message || '', actor);
  });

  // Teacher Moderation Tools
  socket.on('teacher_mute', (payload = {}) => {
    if (!isAuthorizedTeacherSocket(socket, payload)) return rejectUnauthorizedTeacherSocket(socket);
    const { studentName, durationMinutes } = payload;
    mutedStudents.add(studentName);
    io.emit('teacher_action_alert', { message: `[알림] 학생 '${studentName}'의 채팅이 ${durationMinutes || 10}분간 금지되었습니다.` });
    broadcastStudentList();
  });

  socket.on('teacher_unmute', (payload = {}) => {
    if (!isAuthorizedTeacherSocket(socket, payload)) return rejectUnauthorizedTeacherSocket(socket);
    const { studentName } = payload;
    mutedStudents.delete(studentName);
    io.emit('teacher_action_alert', { message: `[알림] 학생 '${studentName}'의 채팅 금지가 해제되었습니다.` });
    broadcastStudentList();
  });

  socket.on('teacher_kick_player', (payload = {}) => {
    if (!isAuthorizedTeacherSocket(socket, payload)) return rejectUnauthorizedTeacherSocket(socket);
    const { targetSocketId, studentName } = payload;
    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) {
      targetSocket.emit('player_kicked', { message: '선생님에 의해 서버에서 퇴장(강퇴) 조치되었습니다.' });
      targetSocket.disconnect(true);
      io.emit('teacher_action_alert', { message: `[알림] '${studentName || '학생'}'이(가) 선생님에 의해 서버에서 강제 퇴장(강퇴)되었습니다.` });
      delete players[targetSocketId];
      broadcastStudentList();
    }
  });

  socket.on('teacher_get_students', (payload = {}) => {
    if (!isAuthorizedTeacherSocket(socket, payload)) return;
    broadcastStudentList();
  });

  socket.on('teacher_delete_message', (payload = {}) => {
    if (!isAuthorizedTeacherSocket(socket, payload)) return rejectUnauthorizedTeacherSocket(socket);
    io.emit('chat_deleted', { chatId: payload.chatId });
  });

  socket.on('teacher_broadcast', (payload = {}) => {
    if (!isAuthorizedTeacherSocket(socket, payload)) return rejectUnauthorizedTeacherSocket(socket);
    io.emit('teacher_announcement_popup', { message: payload.message });
  });

  socket.on('teacher_summon_all_to_me', (payload = {}) => {
    if (!isAuthorizedTeacherSocket(socket, payload)) return rejectUnauthorizedTeacherSocket(socket);
    const { floor, room, x, y, message } = payload;
    const p = players[socket.id] || {};

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
    if (!isAuthorizedTeacherSocket(socket, opts)) return rejectUnauthorizedTeacherSocket(socket);
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
      stoppedByTeacher: false,
      participants: {}
    };

    io.emit('boss_raid_state', bossRaidEvent);

    const isSoccerBoss = isSoccerFieldBoss(bossRaidEvent.name);
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

  socket.on('teacher_stop_boss_raid', (payload = {}) => {
    if (!isAuthorizedTeacherSocket(socket, payload)) return rejectUnauthorizedTeacherSocket(socket);
    bossRaidEvent.active = false;
    bossRaidEvent.stoppedByTeacher = true;
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
    const isSoccerBoss = isSoccerFieldBoss(bossRaidEvent.name);
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
  // REAL-TIME LEADERBOARD TOP 10 (ONLINE + OFFLINE) & STATS SYNC
  // ========================================================
  socket.on('get_leaderboard', () => {
    const p = players[socket.id];
    const payload = buildLeaderboardPayload(p ? p.studentId : '', socket.id);
    socket.emit('leaderboard_data', payload);
  });

  socket.on('player_stats_sync', (stats) => {
    const p = players[socket.id];
    if (p && stats) {
      if (stats.level !== undefined) p.level = Math.max(1, Number(stats.level) || 1);
      if (stats.exp !== undefined) p.exp = Math.max(0, Number(stats.exp) || 0);
      if (stats.gold !== undefined) p.gold = Math.max(0, Number(stats.gold) || 0);
      if (stats.baseAtk !== undefined && Number.isFinite(Number(stats.baseAtk))) p.baseAtk = Number(stats.baseAtk);
      if (stats.baseDef !== undefined && Number.isFinite(Number(stats.baseDef))) p.baseDef = Number(stats.baseDef);
      if (stats.equipment && typeof stats.equipment === 'object') p.equipment = stats.equipment;
      if (!p.isTeacher) {
        const computed = computeStudentCombatStats({
          ...p,
          atk: stats.atk !== undefined ? stats.atk : p.atk,
          def: stats.def !== undefined ? stats.def : p.def
        });
        p.atk = computed.atk;
        p.def = computed.def;
      }
    }
  });

  socket.on('boss_raid_attack', ({ damage } = {}) => {
    if (!bossRaidEvent.active || bossRaidEvent.mode !== 'coop') return;
    const attacker = players[socket.id];
    const now = Date.now();
    if ((!attacker || !attacker.isTeacher) && socket.lastBossAttackAt && (now - socket.lastBossAttackAt) < 650) {
      return; // 과도한 연속 패킷(매크로/스팸) 방지
    }
    socket.lastBossAttackAt = now;
    const maxAllowedDmg = (attacker && attacker.isTeacher)
      ? 99999
      : Math.max(100, Math.min(2000, ((attacker && attacker.level) || 1) * 20 + 250));
    const rawDmg = parseInt(damage, 10) || 5;
    const dmg = Math.max(1, Math.min(maxAllowedDmg, rawDmg));
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
            scheduleSheetStudentSync(part.studentId);
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
      if (Object.keys(players).length === 0) {
        lastOccupiedAt = Date.now();
      }
      broadcastStudentList();
    }
    console.log(`[Disconnect] Socket ID: ${socket.id}`);
  });
});

function checkIdleServerAutoClose() {
  if (Object.keys(players).length > 0) {
    lastOccupiedAt = Date.now();
    return false;
  }
  if (!serverGateState.isOpen) return false;
  if (Date.now() - lastOccupiedAt >= IDLE_AUTO_CLOSE_MS) {
    applyServerGateStateChange(
      false,
      '장시간(20분 이상) 접속자가 없어 서버가 자동으로 닫혔습니다.\n선생님께서 다시 서버를 열어주실 때까지 잠시 대기해주세요!',
      '시스템(20분 미접속 자동닫힘)'
    );
    console.log(`[Server Gate] Auto-closed after ${Math.round(IDLE_AUTO_CLOSE_MS / 1000)}s with 0 connected players.`);
    return true;
  }
  return false;
}

const idleAutoCloseTimer = setInterval(
  checkIdleServerAutoClose,
  Math.min(60000, Math.max(200, Math.floor(IDLE_AUTO_CLOSE_MS / 4)))
);
if (typeof idleAutoCloseTimer.unref === 'function') {
  idleAutoCloseTimer.unref();
}

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🏫 Soongsil Middle School English RPG Server Running!`);
  console.log(`👉 Access URL: http://localhost:${PORT}`);
  console.log(`===================================================`);
  if (isGoogleSheetsReady()) {
    syncAllFromGoogleSheet({ quiet: true }).catch((err) => {
      console.warn('[Google Sheets Startup Sync Warning]', err && err.message ? err.message : err);
    });
  }
});
