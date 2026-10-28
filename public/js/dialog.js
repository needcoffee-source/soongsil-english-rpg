/**
 * Retro GBC In-Game Dialogue Box Manager for Soongsil Open World RPG
 * Replaces intrusive browser alert() & confirm() with an authentic Pokemon/GBC style dialogue box
 */

class RPGDialogManager {
  constructor() {
    this.overlay = null;
    this.box = null;
    this.avatarEl = null;
    this.speakerEl = null;
    this.textEl = null;
    this.indicatorEl = null;
    this.btnClose = null;
    this.choicesEl = null;
    this.btnConfirm = null;
    this.btnCancel = null;

    this.isOpen = false;
    this.isTyping = false;
    this.fullText = '';
    this.typewriterTimer = null;
    this.currentCallback = null;

    // Confirm mode support
    this.isConfirmMode = false;
    this.onConfirmCallback = null;
    this.onCancelCallback = null;

    // Anti-spam & duplicate prevention
    this.queue = [];
    this.lastShownText = '';
    this.lastShownTime = 0;

    // Bind DOM when loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initDOM());
    } else {
      this.initDOM();
    }
  }

  initDOM() {
    this.overlay = document.getElementById('rpg-dialog-overlay');
    this.box = document.querySelector('.rpg-dialog-box');
    this.avatarEl = document.getElementById('rpg-dialog-avatar');
    this.speakerEl = document.getElementById('rpg-dialog-speaker');
    this.textEl = document.getElementById('rpg-dialog-text');
    this.indicatorEl = document.querySelector('.rpg-dialog-indicator');
    this.btnClose = document.getElementById('btn-close-rpg-dialog');
    this.choicesEl = document.getElementById('rpg-dialog-choices');
    this.btnConfirm = document.getElementById('btn-rpg-confirm');
    this.btnCancel = document.getElementById('btn-rpg-cancel');

    if (!this.overlay) return;

    // Advance / Dismiss on click (unless in confirm mode waiting for choice)
    this.overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.isConfirmMode) {
        if (this.isTyping) {
          this.finishTypewriter();
        }
        return;
      }
      this.advance();
    });

    // Choices
    if (this.btnConfirm) {
      this.btnConfirm.addEventListener('click', (e) => {
        e.stopPropagation();
        this.resolveChoice(true);
      });
    }

    if (this.btnCancel) {
      this.btnCancel.addEventListener('click', (e) => {
        e.stopPropagation();
        this.resolveChoice(false);
      });
    }

    // Explicit 'X' button: Dismiss AND empty queue to prevent repeated alert loops
    if (this.btnClose) {
      this.btnClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.queue = []; // Clear queue so repeated alerts never pop up again!
        if (this.isConfirmMode) {
          this.resolveChoice(false);
        } else {
          this.close();
        }
      });
    }

    // Keyboard support (Space, Enter, Escape)
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (this.isConfirmMode) {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          this.resolveChoice(true);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          this.resolveChoice(false);
        } else if (e.key === ' ' && this.isTyping) {
          e.preventDefault();
          e.stopPropagation();
          this.finishTypewriter();
        }
        return;
      }

      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.advance();
      }
    }, true);
  }

  /**
   * Main Dialogue Display
   */
  show(speaker = '안내', text = '', avatar = '💬', callback = null) {
    const cleanText = (text || '').trim();

    // 1. Debounce rapid duplicate messages (e.g., player standing on trigger or rapid tap)
    const now = Date.now();
    if (this.lastShownText === cleanText && (now - this.lastShownTime) < 1000) {
      return;
    }

    if (this.isOpen) {
      // If currently showing identical text, ignore
      if (this.fullText.trim() === cleanText) {
        return;
      }
      // If queue already contains this message, ignore
      if (this.queue.some(q => (q.text || '').trim() === cleanText)) {
        return;
      }
      // Prevent queue bloat
      if (this.queue.length >= 2) {
        return;
      }
      // Queue next message
      this.queue.push({ speaker, text, avatar, callback, isConfirm: false });
      return;
    }

    this.isOpen = true;
    this.isConfirmMode = false;
    this.currentCallback = callback;
    this.fullText = text || '';
    this.lastShownText = cleanText;
    this.lastShownTime = now;

    if (this.choicesEl) this.choicesEl.classList.add('hidden');
    if (this.avatarEl) this.avatarEl.innerText = avatar || '💬';
    if (this.speakerEl) this.speakerEl.innerText = speaker || '안내';
    if (this.textEl) this.textEl.innerText = '';
    if (this.indicatorEl) this.indicatorEl.classList.add('hidden');

    if (this.overlay) {
      this.overlay.classList.remove('hidden');
    }

    // Audio cue
    if (window.AudioManager) {
      if (text.includes('제작 완료') || text.includes('토벌') || text.includes('선물')) {
        window.AudioManager.playFanfare();
      } else if (text.includes('마셨습니다') || text.includes('물약')) {
        window.AudioManager.playPotion();
      } else {
        window.AudioManager.playDialogOpen();
      }
    }

    this.startTypewriter();
  }

  /**
   * In-Game Confirmation Dialog (No native browser confirm -> NEVER drops fullscreen)
   */
  confirm(speaker = '안내', text = '', avatar = '❓', onConfirm = null, onCancel = null, confirmText = '확인', cancelText = '취소') {
    const cleanText = (text || '').trim();
    const now = Date.now();

    if (this.lastShownText === cleanText && (now - this.lastShownTime) < 1000) {
      return;
    }

    if (this.isOpen) {
      if (this.fullText.trim() === cleanText || this.queue.some(q => (q.text || '').trim() === cleanText)) {
        return;
      }
      if (this.queue.length >= 2) return;
      this.queue.push({
        speaker,
        text,
        avatar,
        onConfirm,
        onCancel,
        confirmText,
        cancelText,
        isConfirm: true
      });
      return;
    }

    this.isOpen = true;
    this.isConfirmMode = true;
    this.onConfirmCallback = onConfirm;
    this.onCancelCallback = onCancel;
    this.currentCallback = null;
    this.fullText = text || '';
    this.lastShownText = cleanText;
    this.lastShownTime = now;

    if (this.avatarEl) this.avatarEl.innerText = avatar || '❓';
    if (this.speakerEl) this.speakerEl.innerText = speaker || '안내';
    if (this.textEl) this.textEl.innerText = '';
    if (this.indicatorEl) this.indicatorEl.classList.add('hidden');

    if (this.btnConfirm) this.btnConfirm.innerText = confirmText;
    if (this.btnCancel) this.btnCancel.innerText = cancelText;
    if (this.choicesEl) this.choicesEl.classList.remove('hidden');

    if (this.overlay) {
      this.overlay.classList.remove('hidden');
    }

    if (window.AudioManager) {
      window.AudioManager.playDialogOpen();
    }

    this.startTypewriter();
  }

  resolveChoice(accepted) {
    if (window.AudioManager) window.AudioManager.playSelect();

    const onConf = this.onConfirmCallback;
    const onCanc = this.onCancelCallback;
    this.onConfirmCallback = null;
    this.onCancelCallback = null;
    this.isConfirmMode = false;

    if (this.choicesEl) this.choicesEl.classList.add('hidden');

    this.close();

    if (accepted && typeof onConf === 'function') {
      try { onConf(); } catch (e) { console.error(e); }
    } else if (!accepted && typeof onCanc === 'function') {
      try { onCanc(); } catch (e) { console.error(e); }
    }
  }

  startTypewriter() {
    this.isTyping = true;
    let charIdx = 0;
    clearInterval(this.typewriterTimer);

    // Fast, responsive retro typewriter speed (14ms per char)
    this.typewriterTimer = setInterval(() => {
      if (charIdx < this.fullText.length) {
        const nextChar = this.fullText[charIdx];
        this.textEl.innerText += nextChar;
        charIdx++;

        // Chirp sound every 3 characters to avoid sound saturation
        if (charIdx % 3 === 0 && nextChar.trim() !== '' && window.AudioManager) {
          window.AudioManager.playTextBlip();
        }
      } else {
        this.finishTypewriter();
      }
    }, 14);
  }

  finishTypewriter() {
    clearInterval(this.typewriterTimer);
    this.isTyping = false;
    if (this.textEl) this.textEl.innerText = this.fullText;
    if (!this.isConfirmMode && this.indicatorEl) {
      this.indicatorEl.classList.remove('hidden');
    }
    if (this.isConfirmMode && this.choicesEl) {
      this.choicesEl.classList.remove('hidden');
    }
  }

  advance() {
    if (this.isTyping) {
      // Fast forward to full text immediately
      this.finishTypewriter();
    } else {
      // Close or next message
      this.close();
    }
  }

  close() {
    clearInterval(this.typewriterTimer);
    this.isTyping = false;
    this.isOpen = false;
    this.isConfirmMode = false;

    if (this.choicesEl) {
      this.choicesEl.classList.add('hidden');
    }

    if (this.overlay) {
      this.overlay.classList.add('hidden');
    }

    if (window.AudioManager) {
      window.AudioManager.playSelect();
    }

    const cb = this.currentCallback;
    this.currentCallback = null;
    if (typeof cb === 'function') {
      try { cb(); } catch (e) {}
    }

    // Process queued message if any
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      setTimeout(() => {
        if (next.isConfirm) {
          this.confirm(
            next.speaker,
            next.text,
            next.avatar,
            next.onConfirm,
            next.onCancel,
            next.confirmText,
            next.cancelText
          );
        } else {
          this.show(next.speaker, next.text, next.avatar, next.callback);
        }
      }, 100);
    }
  }

  /**
   * Helper to parse legacy string messages
   */
  parseAlertMessage(msg) {
    if (typeof msg !== 'string') msg = String(msg);

    let speaker = '숭실 알림';
    let avatar = '🏫';
    let body = msg;

    const matchWithSpeaker = msg.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\uD83C-\uD83E][\uDF00-\uDFFF]|[\u{1F300}-\u{1F9FF}])?\s*\[([^\]]{1,25})\]\s*\n*([\s\S]*)$/u);
    if (matchWithSpeaker) {
      if (matchWithSpeaker[1]) avatar = matchWithSpeaker[1].trim();
      if (matchWithSpeaker[2]) speaker = matchWithSpeaker[2].trim();
      if (matchWithSpeaker[3] !== undefined) body = matchWithSpeaker[3].trim();
    } else {
      const matchLeadingEmoji = msg.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\uD83C-\uD83E][\uDF00-\uDFFF]|[\u{1F300}-\u{1F9FF}])\s*([\s\S]+)$/u);
      if (matchLeadingEmoji) {
        avatar = matchLeadingEmoji[1];
        body = matchLeadingEmoji[2].trim();
        speaker = '숭실 알림';
      } else if (msg.includes('멘토')) {
        speaker = '1학년 멘토';
        avatar = '🎓';
      } else if (msg.includes('숭실이')) {
        speaker = '마스코트 숭실이';
        avatar = '🐶';
      } else if (msg.includes('물약') || msg.includes('포션')) {
        speaker = '포션 알림';
        avatar = '🧪';
      } else if (msg.includes('제작')) {
        speaker = '제작대';
        avatar = '🔨';
      } else if (msg.includes('선물')) {
        speaker = '선생님 선물';
        avatar = '🎁';
      } else if (msg.includes('엘리베이터')) {
        speaker = '중앙 엘리베이터';
        avatar = '🛗';
      }
    }

    if (body.startsWith('"') && body.endsWith('"') && body.length > 2) {
      body = body.slice(1, -1);
    }

    return { speaker, body, avatar };
  }

  showFromAlert(msg, callback = null) {
    const parsed = this.parseAlertMessage(msg);
    this.show(parsed.speaker, parsed.body, parsed.avatar, callback);
  }

  confirmFromAlert(msg, onConfirm, onCancel, confirmText = '확인', cancelText = '취소') {
    const parsed = this.parseAlertMessage(msg);
    this.confirm(parsed.speaker, parsed.body, parsed.avatar, onConfirm, onCancel, confirmText, cancelText);
  }
}

window.RPGDialog = new RPGDialogManager();

// =========================================================================
// REPLACE BROWSER alert() SEAMLESSLY ACROSS ENTIRE CODEBASE
// =========================================================================
window.alert = function(message) {
  if (window.RPGDialog) {
    window.RPGDialog.showFromAlert(message);
  } else {
    console.log('[RPG Dialog Fallback]', message);
  }
};
