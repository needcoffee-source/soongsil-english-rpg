/**
 * Retro GBC In-Game Dialogue Box Manager for Soongsil Open World RPG
 * Replaces intrusive browser alert() with an authentic Pokemon/GBC style dialogue box
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

    this.isOpen = false;
    this.isTyping = false;
    this.fullText = '';
    this.typewriterTimer = null;
    this.currentCallback = null;

    this.queue = [];

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

    if (!this.overlay) return;

    // Advance / Dismiss on click
    this.overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      this.advance();
    });

    if (this.btnClose) {
      this.btnClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
      });
    }

    // Keyboard support (Space, Enter, Escape)
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
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
    if (this.isOpen) {
      // Queue next message
      this.queue.push({ speaker, text, avatar, callback });
      return;
    }

    this.isOpen = true;
    this.currentCallback = callback;
    this.fullText = text || '';

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

  startTypewriter() {
    this.isTyping = true;
    let charIdx = 0;
    clearInterval(this.typewriterTimer);

    // Fast, responsive retro typewriter speed (16ms per char)
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
    }, 16);
  }

  finishTypewriter() {
    clearInterval(this.typewriterTimer);
    this.isTyping = false;
    if (this.textEl) this.textEl.innerText = this.fullText;
    if (this.indicatorEl) this.indicatorEl.classList.remove('hidden');
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
        this.show(next.speaker, next.text, next.avatar, next.callback);
      }, 80);
    }
  }

  /**
   * Parse legacy alert() strings to extract Speaker, Avatar, and Body
   */
  showFromAlert(msg, callback = null) {
    if (typeof msg !== 'string') msg = String(msg);

    let speaker = '숭실 알림';
    let avatar = '🏫';
    let body = msg;

    // Pattern 1: Emoji at start e.g. "🐶 [마스코트 숭실이]..."
    const match = msg.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\uD83C-\uD83E][\uDF00-\uDFFF]|[^\[\n]+)?\s*\[([^\]]+)\]\s*\n*([\s\S]*)$/);
    if (match) {
      if (match[1] && match[1].trim()) avatar = match[1].trim();
      if (match[2]) speaker = match[2].trim();
      if (match[3] !== undefined) body = match[3].trim();
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
    }

    // Clean leading/trailing quotes if wrapped
    if (body.startsWith('"') && body.endsWith('"') && body.length > 2) {
      body = body.slice(1, -1);
    }

    this.show(speaker, body, avatar, callback);
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
