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

app.use(express.json());
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
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `questions_grade${g}.json`), 'utf8'));
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

// Game State
const players = {}; // socketId -> player data
const mutedStudents = new Set(); // student names or socket IDs
const chatLogs = []; // for teacher review

// Boss Raid Event State (Teacher Controlled)
let bossRaidEvent = {
  active: false,
  name: '👾 고목 골렘',
  level: 10,
  mode: 'coop',       // 'coop' (협동 공유 체력) or 'solo' (개인별 레이드)
  unitFilter: 'ALL',  // 'ALL', 'L1', 'L2', 'L3', 'L4'
  maxHp: 3000,
  currentHp: 3000,
  atk: 18,
  def: 5,
  rewardGold: 100,
  rewardExp: 200,
  participants: {}
};

// Master Item Catalog for Teacher Grant & Game Systems
const ALL_GAME_ITEMS = {
  // 1. Materials
  'item_wood': { name: '단단한 목재', icon: '🪵', meta: { type: 'material', effect: '장비 제작 기본 재료' } },
  'item_herb': { name: '향긋한 허브', icon: '🌿', meta: { type: 'material', effect: '물약 및 주문서 제작 재료' } },
  'item_forsythia': { name: '노란 개나리 꽃잎', icon: '🌼', meta: { type: 'material', effect: '교화 개나리 장신구 및 주황 물약 재료' } },
  'item_ginkgo': { name: '황금 은행잎', icon: '🍂', meta: { type: 'material', effect: '교목 은행나무 부적 및 부활 주문서 재료' } },
  'item_golem_core': { name: '고목의 핵', icon: '🟢', meta: { type: 'material', effect: '골렘 보스 전리품 · 상위 제작 재료' } },
  'item_dragon_heart': { name: '용의 심장', icon: '❤️‍🔥', meta: { type: 'material', effect: '드래곤 보스 전리품 · 최상위 제작 재료' } },

  // 2. Potions & Scrolls
  'item_red_potion': { name: '빨간 물약', icon: '🍷', meta: { type: 'consumable', slot: 'consumable', heal: 10, effect: '체력 +10 회복' } },
  'item_orange_potion': { name: '주황 물약', icon: '🧪', meta: { type: 'consumable', slot: 'consumable', heal: 25, effect: '체력 +25 회복' } },
  'item_revive_scroll': { name: '부활 주문서', icon: '📜', meta: { type: 'consumable', slot: 'consumable', heal: 0, effect: '쓰러진 친구를 50% 체력으로 부활' } },

  // 3. Equipment
  'equip_wood_sword': { name: '나무검', icon: '🗡️', meta: { type: 'equipment', slot: 'weapon', stats: { atk: 15, def: 0, hp: 0 }, effect: '공격력 +15' } },
  'equip_wood_helmet': { name: '나무투구', icon: '🪖', meta: { type: 'equipment', slot: 'helmet', stats: { atk: 0, def: 8, hp: 20 }, effect: '방어력 +8, 체력 +20' } },
  'equip_wood_armor': { name: '나무갑옷', icon: '🛡️', meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 15, hp: 50 }, effect: '방어력 +15, 체력 +50' } },
  'equip_forsythia_ring': { name: '성실의 개나리 반지', icon: '🌼', meta: { type: 'equipment', slot: 'accessory', stats: { atk: 10, def: 10, hp: 20 }, effect: '공격력 +10, 방어력 +10, 체력 +20' } },
  'equip_ginkgo_talisman': { name: '합심의 황금 은행잎 부적', icon: '🍂', meta: { type: 'equipment', slot: 'accessory', stats: { atk: 20, def: 12, hp: 40 }, effect: '공격력 +20, 방어력 +12, 체력 +40' } },
  'equip_bronze_sword': { name: '청동검', icon: '⚔️', meta: { type: 'equipment', slot: 'weapon', stats: { atk: 25, def: 0, hp: 0 }, effect: '공격력 +25' } },
  'equip_bronze_helmet': { name: '청동투구', icon: '🪖', meta: { type: 'equipment', slot: 'helmet', stats: { atk: 0, def: 14, hp: 35 }, effect: '방어력 +14, 체력 +35' } },
  'equip_bronze_armor': { name: '청동갑옷', icon: '🛡️', meta: { type: 'equipment', slot: 'armor', stats: { atk: 0, def: 22, hp: 70 }, effect: '방어력 +22, 체력 +70' } }
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

io.on('connection', (socket) => {
  console.log(`[Connect] Socket ID: ${socket.id}`);

  // Player Login
  socket.on('player_join', (data) => {
    const { name, grade, studentId, avatar, isTeacher, teacherPwd } = data;
    const isVerifiedTeacher = !!isTeacher && teacherPwd === '0322';
    const resolvedName = isVerifiedTeacher ? '교사' : (name || '학생_' + socket.id.substr(0, 4));
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
      floor: 7, // Starts at 1학년 복도
      room: 'hallway',
      x: 14 * 32,
      y: 11 * 32,
      direction: 'down',
      gold: 10,
      level: 1,
      exp: 0,
      inventory: []
    };

    const currentRoom = `server_${players[socket.id].grade}_f${players[socket.id].floor}_${players[socket.id].room}`;
    socket.join(currentRoom);

    // Send initial self data & current Boss Raid state
    socket.emit('init_self', players[socket.id]);
    socket.emit('boss_raid_state', bossRaidEvent);

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
    if (!player) return;

    player.x = data.x;
    player.y = data.y;
    player.direction = data.direction;

    const currentRoom = `server_${player.grade}_f${player.floor}_${player.room}`;
    socket.to(currentRoom).emit('player_moved', {
      id: socket.id,
      x: data.x,
      y: data.y,
      direction: data.direction
    });
  });

  // Room / Floor Change (Pokemon-style warp)
  socket.on('change_location', (data) => {
    const player = players[socket.id];
    if (!player) return;

    const oldRoom = `server_${player.grade}_f${player.floor}_${player.room}`;
    socket.leave(oldRoom);
    socket.to(oldRoom).emit('player_left', socket.id);

    player.floor = data.floor !== undefined ? data.floor : player.floor;
    player.room = data.room || 'hallway';
    player.x = data.x || 400;
    player.y = data.y || 300;

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

  // Teacher Item & Gold Grant System
  socket.on('teacher_grant_item', ({ pwd, targetSocketId, itemKey, count, reason }) => {
    if (pwd !== '0322') {
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

  // Boss Raid Event Controls (Teacher)
  socket.on('teacher_start_boss_raid', (opts = {}) => {
    bossRaidEvent = {
      active: true,
      name: opts.name || '👾 고목 골렘',
      level: parseInt(opts.level) || 10,
      mode: opts.mode || 'coop',
      unitFilter: opts.unitFilter || 'ALL',
      maxHp: Math.max(50, parseInt(opts.maxHp) || 3000),
      currentHp: Math.max(50, parseInt(opts.maxHp) || 3000),
      atk: Math.max(1, parseInt(opts.atk) || 18),
      def: Math.max(0, parseInt(opts.def) || 5),
      rewardGold: Math.max(0, parseInt(opts.rewardGold) || 100),
      rewardExp: Math.max(0, parseInt(opts.rewardExp) || 200),
      participants: {}
    };

    io.emit('boss_raid_state', bossRaidEvent);

    if (opts.announce !== false) {
      io.emit('teacher_announcement_popup', {
        message: `🔥 [보스레이드 시작] 1학년 2반에 '${bossRaidEvent.name}'(HP ${bossRaidEvent.maxHp})이(가) 출현했습니다!`
      });
    }

    if (opts.summonAll) {
      io.emit('boss_raid_force_warp', { floor: 7, room: 'room_702' });
    }
  });

  socket.on('teacher_stop_boss_raid', () => {
    bossRaidEvent.active = false;
    io.emit('boss_raid_state', bossRaidEvent);
    io.emit('teacher_action_alert', {
      message: '⏹️ [알림] 교사에 의해 보스레이드 이벤트가 종료되었습니다.'
    });
  });

  socket.on('boss_raid_attack', ({ damage }) => {
    if (!bossRaidEvent.active || bossRaidEvent.mode !== 'coop') return;
    const attacker = players[socket.id];
    const dmg = Math.max(1, parseInt(damage) || 5);
    bossRaidEvent.currentHp = Math.max(0, bossRaidEvent.currentHp - dmg);

    const pName = attacker ? attacker.name : '학생';
    if (!bossRaidEvent.participants[socket.id]) {
      bossRaidEvent.participants[socket.id] = { name: pName, damage: 0 };
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

      io.emit('boss_raid_cleared', {
        bossName: bossRaidEvent.name,
        rewardGold: bossRaidEvent.rewardGold,
        rewardExp: bossRaidEvent.rewardExp,
        mvp,
        participantIds: Object.keys(bossRaidEvent.participants)
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
    if (p) {
      p.isFallen = false;
      p.room = 'hallway';
      p.x = 15 * 32;
      p.y = 10 * 32;
    }
    const currentRoom = p ? `server_${p.grade}_f${p.floor}_${p.room}` : null;
    if (currentRoom) {
      io.to(currentRoom).emit('player_status_updated', { id: socket.id, isFallen: false, name: p ? p.name : '학생' });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
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
