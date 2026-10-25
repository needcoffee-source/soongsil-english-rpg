const fs = require('fs');
let content = fs.readFileSync('public/css/style.css', 'utf8');
content = content.replace(/\r\n/g, '\n');

const extraCSS = `
/* ========================================================
   LEVEL UP CELEBRATION BANNER & TOAST UX
   ======================================================== */
.level-up-banner {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%) scale(1);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.96));
  border: 2px solid #facc15;
  border-radius: 16px;
  padding: 14px 28px;
  text-align: center;
  box-shadow: 0 0 35px rgba(250, 204, 21, 0.5), 0 10px 25px rgba(0, 0, 0, 0.6);
  z-index: 150;
  pointer-events: none;
  animation: levelUpPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.level-up-banner.fade-out {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px) scale(0.95);
}

@keyframes levelUpPop {
  0% { opacity: 0; transform: translateX(-50%) translateY(-30px) scale(0.7); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
}

.level-up-sparkle {
  font-size: 13px;
  font-weight: 700;
  color: #fde047;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.level-up-title {
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 0 12px rgba(250, 204, 21, 0.8);
  margin-bottom: 6px;
}

.level-up-stats {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
}

.level-up-stats .stat-boost {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 700;
  color: #86efac;
}

.game-toast {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.94);
  border: 1.5px solid #38bdf8;
  border-radius: 12px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  z-index: 140;
  pointer-events: none;
  animation: toastFadeIn 0.3s ease;
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.game-toast.toast-success {
  border-color: #4ade80;
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.35);
}

.game-toast.toast-info {
  border-color: #38bdf8;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
}

.game-toast.toast-warning {
  border-color: #f59e0b;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.35);
}

.game-toast.fade-out {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

@keyframes toastFadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(15px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
`;

fs.writeFileSync('public/css/style.css', content + extraCSS, 'utf8');
console.log('Appended level-up & toast styles to style.css');
