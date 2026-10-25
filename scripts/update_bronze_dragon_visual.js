const fs = require('fs');

let engineJs = fs.readFileSync('public/js/engine.js', 'utf8');

const targetFunction = `  // 11-E. High-Res Season 1 Boss: Royal Gold Dragon (1학년 2반 숭실 골드 드래곤 레이드)
  drawHighResBossDragon(boss) {
    const px = boss.x * 32 + 16;
    const py = boss.y * 32 + 16;
    const now = Date.now();
    const bob = Math.sin(now / 280) * 4;
    const wingFlap = Math.sin(now / 220) * 9;
    const tailSway = Math.sin(now / 340) * 8;

    this.ctx.save();

    // 1. Radiant Golden Raid Magic Circle on Floor
    this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 26, 60, 26, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(217, 119, 6, 0.22)';
    this.ctx.fill();

    // Inner Runed Ring
    this.ctx.strokeStyle = 'rgba(253, 224, 71, 0.6)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 26, 42, 18, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    // Draconic Magic Glyphs / 8-Ray Star on Floor
    for (let r = 0; r < 4; r++) {
      const angle = (Math.PI / 4) * r + (now / 3000);
      const rx = Math.cos(angle) * 38;
      const ry = Math.sin(angle) * 16;
      this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
      this.ctx.beginPath();
      this.ctx.moveTo(px - rx, py + 26 - ry);
      this.ctx.lineTo(px + rx, py + 26 + ry);
      this.ctx.stroke();
    }

    const by = py + bob;

    // 2. Dragon Tail (Curving behind body with spiked golden fin)
    this.ctx.fillStyle = '#92400e';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 10, by + 12);
    this.ctx.quadraticCurveTo(px + 36 + tailSway, by + 18, px + 44 + tailSway, by + 8);
    this.ctx.lineTo(px + 40 + tailSway, by + 3);
    this.ctx.quadraticCurveTo(px + 28 + tailSway * 0.7, by + 12, px + 8, by + 6);
    this.ctx.closePath();
    this.ctx.fill();

    // Spiked Golden Fin at Tail Tip
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 44 + tailSway, by + 8);
    this.ctx.lineTo(px + 56 + tailSway, by + 5);
    this.ctx.lineTo(px + 46 + tailSway, by - 2);
    this.ctx.closePath();
    this.ctx.fill();

    // 3. Massive Golden Dragon Wings (Left & Right Flapping)
    // Left Wing
    const lTipY = by - 36 + wingFlap;
    this.ctx.fillStyle = 'rgba(251, 191, 36, 0.85)'; // Membrane
    this.ctx.beginPath();
    this.ctx.moveTo(px - 14, by - 12);
    this.ctx.lineTo(px - 58, lTipY);
    this.ctx.quadraticCurveTo(px - 44, lTipY + 22, px - 34, by + 4);
    this.ctx.quadraticCurveTo(px - 22, by + 14, px - 12, by + 6);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = '#78350f'; // Main Wing Bone Spine
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.moveTo(px - 12, by - 10);
    this.ctx.lineTo(px - 36, lTipY - 6);
    this.ctx.lineTo(px - 58, lTipY);
    this.ctx.stroke();

    // Left Wing Claw Spur
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px - 37, lTipY - 8, 4, 4);

    // Right Wing
    const rTipY = by - 36 + wingFlap;
    this.ctx.fillStyle = 'rgba(251, 191, 36, 0.85)'; // Membrane
    this.ctx.beginPath();
    this.ctx.moveTo(px + 14, by - 12);
    this.ctx.lineTo(px + 58, rTipY);
    this.ctx.quadraticCurveTo(px + 44, rTipY + 22, px + 34, by + 4);
    this.ctx.quadraticCurveTo(px + 22, by + 14, px + 12, by + 6);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = '#78350f'; // Main Wing Bone Spine
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 12, by - 10);
    this.ctx.lineTo(px + 36, rTipY - 6);
    this.ctx.lineTo(px + 58, rTipY);
    this.ctx.stroke();

    // Right Wing Claw Spur
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px + 34, rTipY - 8, 4, 4);

    // 4. Dragon Hind Legs & Claws (Grounded)
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px - 28, by + 8, 14, 18);
    this.ctx.fillRect(px + 14, by + 8, 14, 18);
    // Dark Obsidian Talons
    this.ctx.fillStyle = '#1c1917';
    this.ctx.fillRect(px - 30, by + 24, 6, 4);
    this.ctx.fillRect(px - 22, by + 24, 6, 4);
    this.ctx.fillRect(px + 14, by + 24, 6, 4);
    this.ctx.fillRect(px + 22, by + 24, 6, 4);

    // 5. Scaled Gold Torso & Chest Plates
    this.ctx.fillStyle = '#d97706'; // Base scales
    this.ctx.fillRect(px - 18, by - 16, 36, 32);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(px - 15, by - 13, 30, 26);

    // Underbelly Armor Scales (Radiant Light Gold Plates)
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px - 8, by - 12, 16, 6);
    this.ctx.fillRect(px - 7, by - 4, 14, 6);
    this.ctx.fillRect(px - 6, by + 4, 12, 6);
    this.ctx.fillRect(px - 5, by + 12, 10, 5);

    // 6. Glowing Ruby Dragon Heart in Chest
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 3, 6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#fca5a5';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 3, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // 7. Powerful Front Forelegs & Claws
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(px - 22, by + 2, 9, 20);
    this.ctx.fillRect(px + 13, by + 2, 9, 20);
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px - 23, by + 20, 11, 4);
    this.ctx.fillRect(px + 12, by + 20, 11, 4);

    // 8. Long Scaled Neck & Head
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px - 10, by - 30, 20, 16);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(px - 8, by - 28, 16, 14);

    // Dragon Head & Jaws
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(px - 14, by - 46, 28, 20);
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillRect(px - 12, by - 44, 24, 16);

    // Sweeping Majestic Golden Horns
    this.ctx.fillStyle = '#78350f';
    // Left Horn
    this.ctx.beginPath();
    this.ctx.moveTo(px - 10, by - 46);
    this.ctx.lineTo(px - 24, by - 62);
    this.ctx.lineTo(px - 6, by - 46);
    this.ctx.closePath();
    this.ctx.fill();
    // Right Horn
    this.ctx.beginPath();
    this.ctx.moveTo(px + 10, by - 46);
    this.ctx.lineTo(px + 24, by - 62);
    this.ctx.lineTo(px + 6, by - 46);
    this.ctx.closePath();
    this.ctx.fill();

    // Horn Gold Highlights
    this.ctx.fillStyle = '#fde047';
    this.ctx.fillRect(px - 23, by - 61, 3, 6);
    this.ctx.fillRect(px + 21, by - 61, 3, 6);

    // Fierce Ruby-Red Dragon Eyes with Golden Gaze
    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(px - 9, by - 40, 6, 5);
    this.ctx.fillRect(px + 3, by - 40, 6, 5);
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px - 7, by - 39, 3, 3);
    this.ctx.fillRect(px + 5, by - 39, 3, 3);

    // Dragon Snout & Sharp Fangs
    this.ctx.fillStyle = '#92400e';
    this.ctx.fillRect(px - 8, by - 30, 16, 4); // mouth line
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px - 6, by - 28, 3, 3); // fangs
    this.ctx.fillRect(px + 3, by - 28, 3, 3);

    // Draconic Embers & Gold Sparkles drifting upward
    for (let i = 0; i < 4; i++) {
      const pOffset = (now / 350 + i * 1.5) % 4;
      const spX = px + Math.sin(now / 200 + i * 2) * 20;
      const spY = by - 30 - pOffset * 10;
      const spAlpha = Math.max(0, 1 - pOffset / 4);
      this.ctx.fillStyle = \`rgba(254, 240, 138, \${spAlpha})\`;
      this.ctx.fillRect(spX, spY, 3, 3);
    }

    this.ctx.restore();

    // Boss Nameplate (교사 이벤트 시작 여부에 따른 상태 표시)
    const bCfg = window.BOSS_CONFIG || boss;
    const isRaidActive = !!(bCfg && bCfg.active);
    const labelText = isRaidActive
      ? \`🔥 \${bCfg.name || boss.name} (HP \${bCfg.currentHp ?? bCfg.maxHp}/\${bCfg.maxHp})\`
      : \`⏳ [이벤트 대기중] \${bCfg.name || boss.name}\`;

    this.drawSharpLabel(px, py - 66, labelText, {
      bgColor: isRaidActive ? 'rgba(120, 53, 15, 0.96)' : 'rgba(30, 41, 59, 0.94)',
      borderColor: isRaidActive ? '#fbbf24' : '#94a3b8',
      textColor: isRaidActive ? '#fef08a' : '#e2e8f0',
      fontSize: 13,
      paddingX: 12,
      height: 24
    });
  }`;

const replacementFunction = `  // 11-E. High-Res Season 1 Boss: Ancient Bronze Dragon (1학년 2반 숭실 청동 드래곤 레이드)
  drawHighResBossDragon(boss) {
    const px = boss.x * 32 + 16;
    const py = boss.y * 32 + 16;
    const now = Date.now();
    const bob = Math.sin(now / 280) * 4;
    const wingFlap = Math.sin(now / 220) * 9;
    const tailSway = Math.sin(now / 340) * 8;

    this.ctx.save();

    // 1. Ancient Bronze & Verdigris (청동 녹청) Magic Circle on Floor
    this.ctx.strokeStyle = 'rgba(180, 83, 9, 0.92)'; // Deep Metallic Bronze
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 26, 60, 26, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(120, 53, 15, 0.28)';
    this.ctx.fill();

    // Inner Antique Verdigris (청동 녹빛 옥색) Runed Ring
    this.ctx.strokeStyle = 'rgba(20, 184, 166, 0.75)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.ellipse(px, py + 26, 42, 18, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    // Ancient Draconic Bronze Rune Lines
    for (let r = 0; r < 4; r++) {
      const angle = (Math.PI / 4) * r + (now / 3200);
      const rx = Math.cos(angle) * 38;
      const ry = Math.sin(angle) * 16;
      this.ctx.strokeStyle = (r % 2 === 0) ? 'rgba(217, 119, 6, 0.55)' : 'rgba(45, 212, 191, 0.55)';
      this.ctx.beginPath();
      this.ctx.moveTo(px - rx, py + 26 - ry);
      this.ctx.lineTo(px + rx, py + 26 + ry);
      this.ctx.stroke();
    }

    const by = py + bob;

    // 2. Heavy Bronze Dragon Tail (With Antiqued Bronze Spikes)
    this.ctx.fillStyle = '#5c2b09';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 10, by + 12);
    this.ctx.quadraticCurveTo(px + 36 + tailSway, by + 18, px + 44 + tailSway, by + 8);
    this.ctx.lineTo(px + 40 + tailSway, by + 3);
    this.ctx.quadraticCurveTo(px + 28 + tailSway * 0.7, by + 12, px + 8, by + 6);
    this.ctx.closePath();
    this.ctx.fill();

    // Spiked Bronze Fin at Tail Tip with Verdigris Spine
    this.ctx.fillStyle = '#b45309';
    this.ctx.beginPath();
    this.ctx.moveTo(px + 44 + tailSway, by + 8);
    this.ctx.lineTo(px + 56 + tailSway, by + 5);
    this.ctx.lineTo(px + 46 + tailSway, by - 2);
    this.ctx.closePath();
    this.ctx.fill();
    // Verdigris Patina Spine Highlight
    this.ctx.fillStyle = '#14b8a6';
    this.ctx.fillRect(px + 43 + tailSway, by + 3, 3, 4);

    // 3. Massive Armored Bronze Wings (Dark Cast Bronze Spines & Antique Copper Membranes)
    // Left Wing
    const lTipY = by - 36 + wingFlap;
    this.ctx.fillStyle = 'rgba(154, 52, 18, 0.88)'; // Antique Copper/Bronze Membrane
    this.ctx.beginPath();
    this.ctx.moveTo(px - 14, by - 12);
    this.ctx.lineTo(px - 58, lTipY);
    this.ctx.quadraticCurveTo(px - 44, lTipY + 22, px - 34, by + 4);
    this.ctx.quadraticCurveTo(px - 22, by + 14, px - 12, by + 6);
    this.ctx.closePath();
    this.ctx.fill();

    // Verdigris Patina Rib Veins on Wing
    this.ctx.strokeStyle = '#0d9488';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(px - 26, by - 2);
    this.ctx.lineTo(px - 46, lTipY + 12);
    this.ctx.moveTo(px - 18, by + 4);
    this.ctx.lineTo(px - 34, by + 10);
    this.ctx.stroke();

    // Cast Bronze Main Wing Bone Spine
    this.ctx.strokeStyle = '#451a03';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(px - 12, by - 10);
    this.ctx.lineTo(px - 36, lTipY - 6);
    this.ctx.lineTo(px - 58, lTipY);
    this.ctx.stroke();

    // Left Wing Bronze Claw Spur
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(px - 37, lTipY - 8, 5, 4);

    // Right Wing
    const rTipY = by - 36 + wingFlap;
    this.ctx.fillStyle = 'rgba(154, 52, 18, 0.88)'; // Antique Copper/Bronze Membrane
    this.ctx.beginPath();
    this.ctx.moveTo(px + 14, by - 12);
    this.ctx.lineTo(px + 58, rTipY);
    this.ctx.quadraticCurveTo(px + 44, rTipY + 22, px + 34, by + 4);
    this.ctx.quadraticCurveTo(px + 22, by + 14, px + 12, by + 6);
    this.ctx.closePath();
    this.ctx.fill();

    // Verdigris Patina Rib Veins on Right Wing
    this.ctx.strokeStyle = '#0d9488';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 26, by - 2);
    this.ctx.lineTo(px + 46, rTipY + 12);
    this.ctx.moveTo(px + 18, by + 4);
    this.ctx.lineTo(px + 34, by + 10);
    this.ctx.stroke();

    // Cast Bronze Main Wing Bone Spine
    this.ctx.strokeStyle = '#451a03';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(px + 12, by - 10);
    this.ctx.lineTo(px + 36, rTipY - 6);
    this.ctx.lineTo(px + 58, rTipY);
    this.ctx.stroke();

    // Right Wing Bronze Claw Spur
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(px + 33, rTipY - 8, 5, 4);

    // 4. Heavy Bronze Hind Legs & Grounded Talons
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px - 28, by + 8, 14, 18);
    this.ctx.fillRect(px + 14, by + 8, 14, 18);
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px - 26, by + 10, 10, 14);
    this.ctx.fillRect(px + 16, by + 10, 10, 14);

    // Heavy Dark Iron Talons
    this.ctx.fillStyle = '#1c1917';
    this.ctx.fillRect(px - 30, by + 24, 6, 4);
    this.ctx.fillRect(px - 22, by + 24, 6, 4);
    this.ctx.fillRect(px + 14, by + 24, 6, 4);
    this.ctx.fillRect(px + 22, by + 24, 6, 4);

    // 5. Scaled Heavy Bronze Torso & Metallic Armor Plates
    this.ctx.fillStyle = '#451a03'; // Deep shadow bronze
    this.ctx.fillRect(px - 18, by - 16, 36, 32);
    this.ctx.fillStyle = '#78350f'; // Mid bronze
    this.ctx.fillRect(px - 16, by - 14, 32, 28);
    this.ctx.fillStyle = '#b45309'; // Polished bronze plates
    this.ctx.fillRect(px - 14, by - 12, 28, 24);

    // Segmented Antiqued Underbelly Plates (Heavy Riveted Bronze)
    this.ctx.fillStyle = '#9a3412';
    this.ctx.fillRect(px - 8, by - 12, 16, 6);
    this.ctx.fillRect(px - 7, by - 4, 14, 6);
    this.ctx.fillRect(px - 6, by + 4, 12, 6);
    this.ctx.fillRect(px - 5, by + 12, 10, 5);

    // Verdigris Patina Edge on Belly Plates
    this.ctx.fillStyle = '#14b8a6';
    this.ctx.fillRect(px - 8, by - 7, 16, 1.5);
    this.ctx.fillRect(px - 7, by + 1, 14, 1.5);
    this.ctx.fillRect(px - 6, by + 9, 12, 1.5);

    // 6. Molten Bronze Draconic Core in Chest (청동 드래곤의 심장)
    this.ctx.fillStyle = '#ea580c';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 2, 7, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#f97316';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 2, 4.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#fed7aa';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 2, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // 7. Muscular Armored Forelegs & Bronze Gauntlets
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px - 22, by + 2, 9, 20);
    this.ctx.fillRect(px + 13, by + 2, 9, 20);
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px - 21, by + 4, 7, 16);
    this.ctx.fillRect(px + 14, by + 4, 7, 16);
    // Foreleg Talons
    this.ctx.fillStyle = '#1c1917';
    this.ctx.fillRect(px - 23, by + 20, 11, 4);
    this.ctx.fillRect(px + 12, by + 20, 11, 4);

    // 8. Long Plated Bronze Neck
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(px - 10, by - 30, 20, 16);
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px - 8, by - 28, 16, 14);
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px - 6, by - 26, 12, 10);

    // 9. Angular Armored Bronze Dragon Head
    this.ctx.fillStyle = '#5c2b09';
    this.ctx.fillRect(px - 14, by - 46, 28, 20);
    this.ctx.fillStyle = '#9a3412';
    this.ctx.fillRect(px - 12, by - 44, 24, 16);
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px - 10, by - 42, 20, 12);

    // Sweeping Heavy Ancient Bronze Horns (With Verdigris Ridges)
    this.ctx.fillStyle = '#451a03';
    // Left Horn
    this.ctx.beginPath();
    this.ctx.moveTo(px - 10, by - 46);
    this.ctx.lineTo(px - 26, by - 64);
    this.ctx.lineTo(px - 5, by - 46);
    this.ctx.closePath();
    this.ctx.fill();
    // Right Horn
    this.ctx.beginPath();
    this.ctx.moveTo(px + 10, by - 46);
    this.ctx.lineTo(px + 26, by - 64);
    this.ctx.lineTo(px + 5, by - 46);
    this.ctx.closePath();
    this.ctx.fill();

    // Horn Verdigris Patina & Bronze Highlights
    this.ctx.fillStyle = '#14b8a6'; // Verdigris Patina
    this.ctx.fillRect(px - 22, by - 61, 3, 5);
    this.ctx.fillRect(px + 20, by - 61, 3, 5);
    this.ctx.fillStyle = '#d97706'; // Polished bronze edge
    this.ctx.fillRect(px - 25, by - 63, 2, 4);
    this.ctx.fillRect(px + 24, by - 63, 2, 4);

    // Fierce Mystic Cyan/Turquoise Draconic Eyes (신비로운 청동 고대 안광)
    this.ctx.fillStyle = '#0f766e'; // Dark Teal Socket
    this.ctx.fillRect(px - 9, by - 40, 6, 5);
    this.ctx.fillRect(px + 3, by - 40, 6, 5);
    this.ctx.fillStyle = '#06b6d4'; // Bright Cyan Eye
    this.ctx.fillRect(px - 8, by - 39, 4, 3);
    this.ctx.fillRect(px + 4, by - 39, 4, 3);
    this.ctx.fillStyle = '#a5f3fc'; // Piercing Mystic Pupil
    this.ctx.fillRect(px - 7, by - 38, 2, 2);
    this.ctx.fillRect(px + 5, by - 38, 2, 2);

    // Snout & Armored Jaw with Sharp Ivory Fangs
    this.ctx.fillStyle = '#5c2b09';
    this.ctx.fillRect(px - 8, by - 30, 16, 4); // mouth line
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(px - 6, by - 28, 3, 3); // fangs
    this.ctx.fillRect(px + 3, by - 28, 3, 3);

    // Drifting Molten Bronze Embers & Mystic Verdigris Sparks
    for (let i = 0; i < 5; i++) {
      const pOffset = (now / 340 + i * 1.3) % 4;
      const spX = px + Math.sin(now / 220 + i * 1.8) * 22;
      const spY = by - 28 - pOffset * 10;
      const spAlpha = Math.max(0, 1 - pOffset / 4);
      this.ctx.fillStyle = (i % 2 === 0)
        ? \`rgba(249, 115, 22, \${spAlpha})\` // Molten Bronze Ember
        : \`rgba(45, 212, 191, \${spAlpha})\`; // Verdigris Mystic Sparkle
      this.ctx.fillRect(spX, spY, 3, 3);
    }

    this.ctx.restore();

    // Boss Nameplate (청동 & 청록 녹청 하이테크 네임플레이트)
    const bCfg = window.BOSS_CONFIG || boss;
    const isRaidActive = !!(bCfg && bCfg.active);
    const labelText = isRaidActive
      ? \`🔥 \${bCfg.name || boss.name} (HP \${bCfg.currentHp ?? bCfg.maxHp}/\${bCfg.maxHp})\`
      : \`⏳ [이벤트 대기중] \${bCfg.name || boss.name}\`;

    this.drawSharpLabel(px, py - 66, labelText, {
      bgColor: isRaidActive ? 'rgba(69, 26, 3, 0.96)' : 'rgba(30, 41, 59, 0.94)',
      borderColor: isRaidActive ? '#14b8a6' : '#94a3b8',
      textColor: isRaidActive ? '#fed7aa' : '#e2e8f0',
      fontSize: 13,
      paddingX: 12,
      height: 24
    });
  }`;

if (!engineJs.includes(targetFunction)) {
  console.error('targetFunction not found in engine.js');
  process.exit(1);
}

engineJs = engineJs.replace(targetFunction, replacementFunction);
fs.writeFileSync('public/js/engine.js', engineJs, 'utf8');
console.log('engine.js successfully updated with Bronze Dragon appearance!');
