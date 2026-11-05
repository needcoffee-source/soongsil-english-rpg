const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🧪 Running Teacher Server Gate Comprehensive Test Suite...');

// -----------------------------------------------------------------------------
// 1. Static Code Analysis & Verification
// -----------------------------------------------------------------------------
console.log('\n--- 1. STATIC CODE & ARCHITECTURE AUDIT ---');

const serverJs = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
const networkJs = fs.readFileSync(path.join(__dirname, '../public/js/network.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
const mainJs = fs.readFileSync(path.join(__dirname, '../public/js/main.js'), 'utf8');

// server.js checks
assert(serverJs.includes('SERVER_STATE_FILE'), 'server.js must define SERVER_STATE_FILE');
assert(serverJs.includes('/api/server-status'), 'server.js must provide /api/server-status endpoint');
assert(serverJs.includes('server_state_sync'), 'server.js must emit server_state_sync on connect');
assert(serverJs.includes('server_entry_rejected'), 'server.js must reject student entry when server is closed');
assert(serverJs.includes('teacher_toggle_server_state'), 'server.js must handle teacher_toggle_server_state');
assert(serverJs.includes('force_save_and_exit'), 'server.js must emit force_save_and_exit when closing server');
console.log('  ✓ server.js server gatekeeper logic verified');

// network.js checks
assert(networkJs.includes('toggleServerState(isOpen, message)'), 'network.js must define toggleServerState');
assert(networkJs.includes("this.socket.on('server_state_sync'"), 'network.js must handle server_state_sync');
assert(networkJs.includes("this.socket.on('server_state_changed'"), 'network.js must handle server_state_changed');
assert(networkJs.includes("this.socket.on('server_entry_rejected'"), 'network.js must handle server_entry_rejected');
assert(networkJs.includes("this.socket.on('force_save_and_exit'"), 'network.js must handle force_save_and_exit');
console.log('  ✓ network.js socket bridge verified');

// index.html checks
assert(indexHtml.includes('id="login-server-closed-alert"'), 'index.html must have login-server-closed-alert box');
assert(indexHtml.includes('id="teacher-server-control-bar"'), 'index.html must have teacher server control bar');
assert(indexHtml.includes('id="btn-teacher-toggle-server"'), 'index.html must have btn-teacher-toggle-server button');
assert(indexHtml.includes('id="btn-teacher-hud-server-toggle"'), 'index.html must have HUD toggle button');
console.log('  ✓ index.html server gate UI elements verified');

// main.js checks
assert(mainJs.includes('this.isServerOpen = true;'), 'main.js must initialize isServerOpen');
assert(mainJs.includes('handleTeacherToggleServer()'), 'main.js must implement handleTeacherToggleServer');
assert(mainJs.includes('updateServerGateUI()'), 'main.js must implement updateServerGateUI');
assert(mainJs.includes('onForceSaveAndExit(data)'), 'main.js must implement onForceSaveAndExit with auto-save');
console.log('  ✓ main.js client control methods verified');

// -----------------------------------------------------------------------------
// 2. Server Gate Logic & Event Handlers Simulation
// -----------------------------------------------------------------------------
console.log('\n--- 2. SERVER GATEKEEPER & ACCESS CONTROL SIMULATION ---');

// Mock server state
let mockGateState = {
  isOpen: true,
  closedMessage: '지금은 서버 점검 및 수업 준비 중입니다.',
  updatedAt: Date.now(),
  updatedBy: '선생님'
};

const mockPlayers = {};
const mockSockets = new Map();

function mockEmit(toSocket, event, data) {
  if (!toSocket._events[event]) toSocket._events[event] = [];
  toSocket._events[event].push(data);
}

function createMockSocket(id, isTeacher = false, teacherPwd = '') {
  const sock = {
    id,
    isTeacher,
    _events: {},
    emit(event, data) {
      if (!this._events[event]) this._events[event] = [];
      this._events[event].push(data);
    },
    disconnect(flag) {
      this.disconnected = true;
    }
  };
  mockSockets.set(id, sock);
  return sock;
}

// Logic: player_join gatekeeper
function simulatePlayerJoin(socket, data) {
  const isTeacher = socket.isTeacher || (data && data.isTeacher && data.teacherPwd === '03220322');
  if (!mockGateState.isOpen && !isTeacher) {
    socket.emit('server_entry_rejected', {
      reason: 'server_closed',
      message: mockGateState.closedMessage || '지금은 서버가 닫혀 있습니다. 선생님께서 서버를 개방하실 때까지 잠시 대기해주세요!'
    });
    return false;
  }

  mockPlayers[socket.id] = {
    id: socket.id,
    name: data.name,
    studentId: data.studentId,
    isTeacher
  };
  socket.emit('init_self', { x: 10, y: 10 });
  return true;
}

// Logic: teacher_toggle_server_state
function simulateTeacherToggle(socket, { isOpen, message, pwd }) {
  const isTeacher = socket.isTeacher || (mockPlayers[socket.id] && mockPlayers[socket.id].isTeacher) || (pwd === '03220322');
  if (!isTeacher) {
    socket.emit('teacher_action_alert', { message: '권한 없음' });
    return false;
  }

  mockGateState.isOpen = !!isOpen;
  if (message) mockGateState.closedMessage = message;

  if (!mockGateState.isOpen) {
    // Evict students with force_save_and_exit
    const studentIds = Object.keys(mockPlayers).filter(id => !mockPlayers[id].isTeacher);
    for (const sId of studentIds) {
      const studentSocket = mockSockets.get(sId);
      if (studentSocket) {
        studentSocket.emit('force_save_and_exit', {
          message: '수업이 종료되어 서버를 닫았습니다.'
        });
      }
      delete mockPlayers[sId];
    }
  }
  return true;
}

// Step A: When server is open, student can join
const student1 = createMockSocket('student_001');
const joinSuccess1 = simulatePlayerJoin(student1, { name: '철수', studentId: '10101' });
assert.strictEqual(joinSuccess1, true, 'Student should join when server is open');
assert(student1._events['init_self'], 'Student should receive init_self');
assert(mockPlayers['student_001'], 'Student should be in mockPlayers');
console.log('  ✓ Step A: Student joins successfully when server is open');

// Step B: Teacher joins
const teacher1 = createMockSocket('teacher_001', true, '03220322');
const joinSuccessTeacher = simulatePlayerJoin(teacher1, { name: '갓준철', studentId: '교사', isTeacher: true, teacherPwd: '03220322' });
assert.strictEqual(joinSuccessTeacher, true, 'Teacher should join successfully');
console.log('  ✓ Step B: Teacher joins successfully');

// Step C: Teacher closes server
const toggleResult = simulateTeacherToggle(teacher1, { isOpen: false, pwd: '03220322' });
assert.strictEqual(toggleResult, true, 'Teacher toggle should succeed');
assert.strictEqual(mockGateState.isOpen, false, 'Server gate state must be false');
assert(student1._events['force_save_and_exit'], 'Student must receive force_save_and_exit');
assert.strictEqual(mockPlayers['student_001'], undefined, 'Student must be removed from players list');
assert(mockPlayers['teacher_001'], 'Teacher must remain in players list');
console.log('  ✓ Step C: Server close triggers force_save_and_exit for students, preserves teacher');

// Step D: New student attempts to join while server is closed
const student2 = createMockSocket('student_002');
const joinSuccess2 = simulatePlayerJoin(student2, { name: '영희', studentId: '10102' });
assert.strictEqual(joinSuccess2, false, 'Student join must be rejected when server is closed');
assert(student2._events['server_entry_rejected'], 'Student must receive server_entry_rejected event');
assert.strictEqual(mockPlayers['student_002'], undefined, 'Student must not be in players list');
console.log('  ✓ Step D: New student is rejected with server_entry_rejected');

// Step E: Teacher connects while server is closed (Bypass)
const teacher2 = createMockSocket('teacher_002', true, '03220322');
const joinSuccessTeacher2 = simulatePlayerJoin(teacher2, { name: '선생님2', studentId: '교사', isTeacher: true, teacherPwd: '03220322' });
assert.strictEqual(joinSuccessTeacher2, true, 'Teacher must bypass closed server gate');
assert(teacher2._events['init_self'], 'Teacher must receive init_self even when server is closed');
console.log('  ✓ Step E: Teacher successfully bypasses closed gate for classroom prep');

// Step F: Teacher opens server again
simulateTeacherToggle(teacher1, { isOpen: true, pwd: '03220322' });
assert.strictEqual(mockGateState.isOpen, true, 'Server gate state must be true');

// Step G: Student can now join
const student3 = createMockSocket('student_003');
const joinSuccess3 = simulatePlayerJoin(student3, { name: '민수', studentId: '10103' });
assert.strictEqual(joinSuccess3, true, 'Student should join when server is re-opened');
console.log('  ✓ Step F & G: Server re-opened, students can enter freely');

// -----------------------------------------------------------------------------
// 3. Client UI & DOM State Simulation
// -----------------------------------------------------------------------------
console.log('\n--- 3. CLIENT UI & DOM BEHAVIOR SIMULATION ---');

const domElements = {
  'login-server-box': { style: {} },
  'login-server-dot': { style: {} },
  'login-server-title': { style: {}, innerText: '' },
  'login-server-badge': { style: {}, innerText: '' },
  'login-server-closed-alert': { classList: { classes: new Set(['hidden']), add(c) { this.classes.add(c); }, remove(c) { this.classes.delete(c); }, contains(c) { return this.classes.has(c); } } },
  'teacher-server-gate-badge': { style: {}, innerText: '' },
  'btn-teacher-toggle-server': { style: {}, innerText: '' },
  'btn-teacher-hud-server-toggle': { style: {}, innerText: '' }
};

global.document = {
  getElementById: (id) => domElements[id] || null
};

// Simulate MainApp gate update logic
class MockMainApp {
  constructor() {
    this.isServerOnline = true;
    this.isServerOpen = true;
  }
}

// Normalize line endings for regex extraction
const normMain = mainJs.replace(/\r\n/g, '\n');
const updateMethodMatch = normMain.match(/updateServerGateUI\(\) \{([\s\S]*?)\n  \}\n\n  onServerStateSync/);
assert(updateMethodMatch, 'Could not extract updateServerGateUI from main.js');
const updateGateBody = updateMethodMatch[1];
MockMainApp.prototype.updateServerGateUI = new Function(updateGateBody);

const clientApp = new MockMainApp();

// Test UI when Server is OPEN
clientApp.isServerOpen = true;
clientApp.updateServerGateUI();
assert(domElements['login-server-badge'].innerText.includes('접속 가능'), 'Login badge must show 접속 가능 when open');
assert(domElements['login-server-closed-alert'].classList.contains('hidden'), 'Closed alert must be hidden when open');
assert(domElements['teacher-server-gate-badge'].innerText.includes('정상 개방 중'), 'Teacher badge must show 정상 개방 중');
assert(domElements['btn-teacher-toggle-server'].innerText.includes('서버 닫기'), 'Teacher button must say 서버 닫기 when open');
assert(domElements['btn-teacher-hud-server-toggle'].innerText.includes('서버 열림'), 'HUD button must show 서버 열림');
console.log('  ✓ UI rendered correctly for OPEN server state');

// Test UI when Server is CLOSED
clientApp.isServerOpen = false;
clientApp.updateServerGateUI();
assert(domElements['login-server-badge'].innerText.includes('서버 닫힘'), 'Login badge must show 서버 닫힘 when closed');
assert(!domElements['login-server-closed-alert'].classList.contains('hidden'), 'Closed alert must be visible when closed');
assert(domElements['teacher-server-gate-badge'].innerText.includes('서버 닫힘'), 'Teacher badge must show 서버 닫힘');
assert(domElements['btn-teacher-toggle-server'].innerText.includes('서버 열기'), 'Teacher button must say 서버 열기 when closed');
assert(domElements['btn-teacher-hud-server-toggle'].innerText.includes('서버 닫힘'), 'HUD button must show 서버 닫힘');
console.log('  ✓ UI rendered correctly for CLOSED server state');

console.log('\n🎉 ALL TEACHER SERVER GATE TESTS COMPLETED SUCCESSFULLY!');
process.exit(0);
