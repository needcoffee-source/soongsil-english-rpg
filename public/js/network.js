/**
 * Network Manager for Soongsil Open World RPG
 * Socket.IO Multiplayer Sync, Chat Bubbles, 1:1 Trade, and Teacher Moderation
 */

class NetworkManager {
  constructor(engine) {
    this.engine = engine;
    this.socket = null;
    this.activeTradePartnerId = null;

    // Chat DOM
    this.chatMessagesEl = document.getElementById('chat-messages');
    this.chatInput = document.getElementById('chat-input');
    this.btnSendChat = document.getElementById('btn-send-chat');

    // Announcement Banner
    this.announcementBanner = document.getElementById('announcement-banner');
    this.announcementText = document.getElementById('announcement-text');

    // Trade DOM
    this.modalTrade = document.getElementById('modal-trade');
    this.tradeMyName = document.getElementById('trade-my-name');
    this.tradePartnerName = document.getElementById('trade-partner-name');
    this.tradeMyBox = document.getElementById('trade-my-box');
    this.tradePartnerBox = document.getElementById('trade-partner-box');
    this.tradeMyGoldInput = document.getElementById('trade-my-gold');
    this.tradePartnerGoldDisplay = document.getElementById('trade-partner-gold');
    this.btnConfirmTrade = document.getElementById('btn-confirm-trade');
    this.btnCancelTrade = document.getElementById('btn-cancel-trade');
    this.btnCloseTradeX = document.getElementById('btn-close-trade-x');

    this.initChatEvents();
    this.initTradeEvents();
  }

  connect(userData) {
    this.socket = io();

    this.socket.on('connect', () => {
      console.log('[Network] Connected to server! Socket ID:', this.socket.id);
      this.socket.emit('player_join', userData);
    });

    this.socket.on('init_self', (selfData) => {
      console.log('[Network] Self initialized:', selfData);
      this.engine.player.x = selfData.x;
      this.engine.player.y = selfData.y;
      this.engine.player.floor = selfData.floor;
      this.engine.player.room = selfData.room;
      this.engine.player.name = selfData.name;
      if (selfData.isTeacher !== undefined) {
        this.engine.player.isTeacher = selfData.isTeacher;
      }
    });

    this.socket.on('current_room_players', (playersList) => {
      this.engine.otherPlayers = {};
      playersList.forEach(p => {
        this.engine.otherPlayers[p.id] = p;
      });
    });

    this.socket.on('player_joined', (p) => {
      this.engine.otherPlayers[p.id] = p;
      this.addSystemChat(`[입장] ${p.name} 님이 들어왔습니다.`);
    });

    this.socket.on('player_moved', (data) => {
      const p = this.engine.otherPlayers[data.id];
      if (p) {
        p.x = data.x;
        p.y = data.y;
        p.direction = data.direction;
      }
    });

    this.socket.on('player_left', (socketId) => {
      const p = this.engine.otherPlayers[socketId];
      if (p) {
        this.addSystemChat(`[퇴장] ${p.name} 님이 나갔습니다.`);
        delete this.engine.otherPlayers[socketId];
      }
    });

    // Chat
    this.socket.on('new_chat', (chatItem) => {
      this.renderChat(chatItem);

      // Attach speech bubble over player
      if (chatItem.senderId === this.socket.id) {
        this.engine.player.chatBubble = chatItem.text;
        this.engine.player.chatBubbleExpires = Date.now() + 4000;
      } else if (this.engine.otherPlayers[chatItem.senderId]) {
        this.engine.otherPlayers[chatItem.senderId].chatBubble = chatItem.text;
        this.engine.otherPlayers[chatItem.senderId].chatBubbleExpires = Date.now() + 4000;
      }
    });

    this.socket.on('chat_deleted', ({ chatId }) => {
      const el = document.getElementById(chatId);
      if (el) el.remove();
    });

    this.socket.on('chat_muted', ({ message }) => {
      alert(`⚠️ ${message}`);
    });

    // Teacher Announcements
    this.socket.on('teacher_announcement_popup', ({ message }) => {
      this.announcementText.innerText = message;
      this.announcementBanner.classList.remove('hidden');
      setTimeout(() => {
        this.announcementBanner.classList.add('hidden');
      }, 7000);
    });

    this.socket.on('teacher_action_alert', ({ message }) => {
      this.addSystemChat(message);
    });

    this.socket.on('player_kicked', ({ message }) => {
      alert(`⛔ ${message || '선생님에 의해 서버에서 강퇴되었습니다.'}`);
      window.location.reload();
    });

    this.socket.on('teacher_student_list', (list) => {
      if (window.MainApp && window.MainApp.renderTeacherStudentList) {
        window.MainApp.renderTeacherStudentList(list);
      }
    });

    // Boss Raid Event Sync
    this.socket.on('boss_raid_state', (state) => {
      if (window.MainApp && window.MainApp.onBossRaidStateUpdate) {
        window.MainApp.onBossRaidStateUpdate(state);
      }
    });

    this.socket.on('boss_raid_hp_sync', (data) => {
      if (window.MainApp && window.MainApp.onBossRaidHpSync) {
        window.MainApp.onBossRaidHpSync(data);
      }
    });

    this.socket.on('boss_raid_force_warp', ({ floor, room }) => {
      if (this.engine) {
        this.engine.teleportTo(floor || 7, room || 'room_702');
      }
    });

    this.socket.on('boss_raid_cleared', (data) => {
      if (window.MainApp && window.MainApp.onBossRaidCleared) {
        window.MainApp.onBossRaidCleared(data);
      }
    });

    this.socket.on('player_status_updated', (data) => {
      if (this.engine.otherPlayers[data.id]) {
        this.engine.otherPlayers[data.id].isFallen = data.isFallen;
      }
    });

    this.socket.on('player_revive_offered', (data) => {
      if (window.MainApp && window.MainApp.onPlayerReviveOffered) {
        window.MainApp.onPlayerReviveOffered(data);
      }
    });

    this.socket.on('player_revived_event', (data) => {
      if (window.MainApp && window.MainApp.onPlayerReviveOffered) {
        window.MainApp.onPlayerReviveOffered(data);
      } else if (window.MainApp && window.MainApp.onPlayerRevived) {
        window.MainApp.onPlayerRevived(data);
      }
    });

    // Item granted by Teacher
    this.socket.on('item_granted', (data) => {
      if (window.MainApp && window.MainApp.onItemGranted) {
        window.MainApp.onItemGranted(data);
      }
    });

    // 1:1 Trade (Disabled)
    this.socket.on('trade_requested', ({ requesterId, requesterName }) => {
      alert(`[알림] '${requesterName}' 학생이 교환을 시도했으나 현재 학생 간 교환은 비활성화 상태입니다.`);
    });

    this.socket.on('trade_started', ({ partnerId, partnerName }) => {
      this.activeTradePartnerId = partnerId;
      this.openTradeModal(partnerName);
    });

    this.socket.on('trade_partner_offer', (offer) => {
      this.tradePartnerGoldDisplay.innerText = `${offer.gold || 0} G`;
      this.tradePartnerBox.innerHTML = '';
      if (offer.items && offer.items.length > 0) {
        offer.items.forEach(i => {
          const itemEl = document.createElement('div');
          itemEl.innerText = `${i.name} x${i.count}`;
          this.tradePartnerBox.appendChild(itemEl);
        });
      } else {
        this.tradePartnerBox.innerHTML = '<p>등록된 아이템 없음</p>';
      }
    });

    this.socket.on('trade_complete', ({ newGold }) => {
      alert('🎉 1:1 친구 교환이 성공적으로 완료되었습니다!');
      if (window.MainApp && newGold !== undefined) {
        window.MainApp.setGold(newGold);
      }
      this.closeTradeModal();
    });
  }

  sendMove(data) {
    if (this.socket) {
      this.socket.emit('player_move', data);
    }
  }

  changeLocation(data) {
    if (this.socket) {
      this.socket.emit('change_location', data);
    }
  }

  initChatEvents() {
    this.btnSendChat.addEventListener('click', () => this.sendChatMessage());
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.sendChatMessage();
    });

    // Quick Phrases
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-text');
        if (text && this.socket) {
          this.socket.emit('send_chat', text);
        }
      });
    });
  }

  sendChatMessage() {
    const text = this.chatInput.value.trim();
    if (!text || !this.socket) return;
    this.socket.emit('send_chat', text);
    this.chatInput.value = '';
  }

  renderChat(item) {
    const row = document.createElement('div');
    row.className = 'chat-bubble-row';
    row.id = item.id;
    const isTeacher = item.isTeacher || item.senderName === '교사';
    const senderTag = isTeacher 
      ? `<span class="chat-sender" style="color:#f59e0b; font-weight:bold;">[교사]:</span>`
      : `<span class="chat-sender">[${item.senderName}]:</span>`;
    row.innerHTML = `${senderTag} <span class="chat-text">${item.text}</span>`;
    this.chatMessagesEl.appendChild(row);
    this.chatMessagesEl.scrollTop = this.chatMessagesEl.scrollHeight;
  }

  addSystemChat(text) {
    const row = document.createElement('div');
    row.className = 'chat-bubble-row';
    row.style.color = '#fbbf24';
    row.style.fontStyle = 'italic';
    row.innerText = text;
    this.chatMessagesEl.appendChild(row);
    this.chatMessagesEl.scrollTop = this.chatMessagesEl.scrollHeight;
  }

  // 1:1 Trade Methods (Disabled per teacher policy)
  requestTrade(targetId, targetName) {
    alert('🤝 학생 간 1:1 교환 기능은 현재 비활성화되어 있습니다.\n아이템이나 골드가 필요하면 선생님께 요청하세요!');
    return;
  }

  initTradeEvents() {
    this.btnConfirmTrade.addEventListener('click', () => {
      const myGold = parseInt(this.tradeMyGoldInput.value) || 0;
      if (this.socket && this.activeTradePartnerId) {
        this.socket.emit('trade_execute', {
          targetId: this.activeTradePartnerId,
          myOffer: { gold: myGold, items: [] },
          partnerOffer: { gold: 0, items: [] }
        });
      }
    });

    this.tradeMyGoldInput.addEventListener('input', () => {
      const myGold = parseInt(this.tradeMyGoldInput.value) || 0;
      if (this.socket && this.activeTradePartnerId) {
        this.socket.emit('trade_offer_update', {
          targetId: this.activeTradePartnerId,
          offer: { gold: myGold, items: [] }
        });
      }
    });

    this.btnCancelTrade.addEventListener('click', () => this.closeTradeModal());
    this.btnCloseTradeX.addEventListener('click', () => this.closeTradeModal());
  }

  openTradeModal(partnerName) {
    this.tradeMyName.innerText = this.engine.player.name || '나';
    this.tradePartnerName.innerText = partnerName || '친구';
    this.tradeMyGoldInput.value = '0';
    this.tradePartnerGoldDisplay.innerText = '0 G';
    this.modalTrade.classList.remove('hidden');
  }

  closeTradeModal() {
    this.modalTrade.classList.add('hidden');
    this.activeTradePartnerId = null;
  }
}

window.NetworkManager = NetworkManager;
