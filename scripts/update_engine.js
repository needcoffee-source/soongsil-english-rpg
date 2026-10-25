const fs = require('fs');

let content = fs.readFileSync('public/js/engine.js', 'utf8');

// 1. Add updateFutsalMonsters() call right after this.updateBasketballMonsters();
if (!content.includes('this.updateFutsalMonsters();')) {
  content = content.replace(
    'this.updateBasketballMonsters();',
    'this.updateBasketballMonsters();\n    this.updateFutsalMonsters();'
  );
}

// 2. Add water_purifier check in renderInteractive / floorData.interactive loop
if (!content.includes("obj.type === 'water_purifier'")) {
  content = content.replace(
    "} else if (obj.type === 'forsythia') {\n          this.drawHighResForsythiaPot(obj);\n        }",
    "} else if (obj.type === 'forsythia') {\n          this.drawHighResForsythiaPot(obj);\n        } else if (obj.type === 'water_purifier') {\n          this.drawHighResWaterPurifier(obj.x * 32, obj.y * 32);\n        }"
  );
}

// 3. Replace renderPlayground() and related playground rendering
const oldPlaygroundStart = 'renderPlayground() {';
const oldPlaygroundEnd = '  // Corner Pennant Flag';

const startIdx = content.indexOf(oldPlaygroundStart);
const endIdx = content.indexOf(oldPlaygroundEnd);

if (startIdx !== -1 && endIdx !== -1) {
  const newPlaygroundCode = `renderPlayground() {
    const mapW = this.getMapWidth();
    const mapH = this.getMapHeight();

    // 1. Sandy Clay Ground Foundation (운동장 마사토 흙바닥 베이스)
    this.ctx.fillStyle = '#dfd5c5';
    this.ctx.fillRect(0, 0, mapW * 32, mapH * 32);

    // Fine Playground Gravel Dots (흙바닥 질감)
    this.ctx.fillStyle = 'rgba(120, 113, 108, 0.2)';
    for (let gx = 0; gx < mapW; gx += 3) {
      for (let gy = 0; gy < mapH; gy += 3) {
        this.ctx.fillRect(gx * 32 + 10, gy * 32 + 8, 2, 2);
        this.ctx.fillRect(gx * 32 + 22, gy * 32 + 20, 1.5, 1.5);
      }
    }

    // 2. School South Building Annex Wall (Top Border: ty <= 2)
    for (let tx = 0; tx < mapW; tx++) {
      // Red Brick Facade
      this.ctx.fillStyle = '#991b1b';
      this.ctx.fillRect(tx * 32, 0, 32, 2 * 32);
      this.ctx.fillStyle = '#7f1d1d';
      this.ctx.fillRect(tx * 32, 0, 32, 4); // brick trim
      // Mortar Lines
      this.ctx.fillStyle = '#78350f';
      this.ctx.fillRect(tx * 32, 16, 32, 1);
      this.ctx.fillRect(tx * 32, 32, 32, 1);
      this.ctx.fillRect(tx * 32, 48, 32, 1);
      // Concrete Foundation Base
      this.ctx.fillStyle = '#475569';
      this.ctx.fillRect(tx * 32, 2 * 32, 32, 14);
      this.ctx.fillStyle = '#64748b';
      this.ctx.fillRect(tx * 32, 2 * 32, 32, 3);
    }

    // 3. Central Elevator (Ground Station at right end: x: 80, y: 3)
    const pgEl = (WORLD_DATA.playground && WORLD_DATA.playground.elevator) || { x: 80, y: 3 };
    this.drawHighResElevator(pgEl, 0);

    // 4. Cafeteria Entrance (Right next to elevator: x: 86, y: 3)
    const pgCaf = (WORLD_DATA.playground && WORLD_DATA.playground.cafeteria) || { x: 86, y: 3 };
    this.drawHighResCafeteriaEntrance(pgCaf.x * 32, pgCaf.y * 32);

    // ========================================================
    // 5. TOP: OUTDOOR SPECTATOR BLEACHERS (야외 스탠드 관람석)
    // 위치: x: 6 ~ 54, y: 5 ~ 15 (관람석과 축구장 위치 맞바꿈 / 야외 체력단련장 삭제)
    // ========================================================
    this.drawHighResBleachers(6 * 32, 5 * 32, 48 * 32, 11 * 32);

    // ========================================================
    // 6. BOTTOM: SOCCER FIELD (축구장 & 우레탄 트랙)
    // 위치: x: 4 ~ 58, y: 19 ~ 51 (서쪽 골대 앞 신규 보스 레이드 전장)
    // ========================================================
    const trackX = 4 * 32;
    const trackY = 19 * 32;
    const trackW = 54 * 32;
    const trackH = 32 * 32;

    // Tartan Red Running Track
    this.ctx.fillStyle = '#991b1b';
    this.ctx.beginPath();
    this.ctx.roundRect(trackX, trackY, trackW, trackH, 48);
    this.ctx.fill();

    // White Running Lane Lines (3 lanes)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    this.ctx.lineWidth = 2;
    for (let lane = 0; lane < 3; lane++) {
      const inset = lane * 18 + 6;
      this.ctx.beginPath();
      this.ctx.roundRect(trackX + inset, trackY + inset, trackW - inset * 2, trackH - inset * 2, 42 - lane * 6);
      this.ctx.stroke();
    }

    // Lush Natural Grass Pitch (잔디 축구장: x: 7 ~ 55, y: 22 ~ 48)
    const pitchX = 7 * 32;
    const pitchY = 22 * 32;
    const pitchW = 48 * 32;
    const pitchH = 26 * 32;

    // Grass Turf Mowing Stripes (4-tile stripes)
    for (let sx = 0; sx < 48; sx += 4) {
      this.ctx.fillStyle = (sx / 4) % 2 === 0 ? '#15803d' : '#16a34a';
      this.ctx.fillRect(pitchX + sx * 32, pitchY, 4 * 32, pitchH);
    }

    // Soccer Field Markings (Crisp Pure White Lines)
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2.5;

    // Touchlines (Outer border)
    this.ctx.strokeRect(pitchX, pitchY, pitchW, pitchH);

    // Halfway Line
    const midX = pitchX + pitchW / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(midX, pitchY);
    this.ctx.lineTo(midX, pitchY + pitchH);
    this.ctx.stroke();

    // Center Circle (Radius: 100px) & Center Spot (중앙선 y = 35 * 32)
    const midY = pitchY + pitchH / 2; // EXACTLY 35 * 32
    this.ctx.beginPath();
    this.ctx.arc(midX, midY, 100, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(midX, midY, 5, 0, Math.PI * 2);
    this.ctx.fill();

    // Left Penalty Box (West 18-yard box)
    const penW = 8 * 32;
    const penH = 12 * 32;
    const penY = midY - penH / 2;
    this.ctx.strokeRect(pitchX, penY, penW, penH);

    // Left Goal Area (West 6-yard box)
    const gAreaW = 3.5 * 32;
    const gAreaH = 6 * 32;
    const gAreaY = midY - gAreaH / 2;
    this.ctx.strokeRect(pitchX, gAreaY, gAreaW, gAreaH);

    // Left Penalty Spot & Arc
    const lSpotX = pitchX + 5.5 * 32;
    this.ctx.beginPath();
    this.ctx.arc(lSpotX, midY, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(lSpotX, midY, 50, -0.9, 0.9);
    this.ctx.stroke();

    // Right Penalty Box (East 18-yard box)
    this.ctx.strokeRect(pitchX + pitchW - penW, penY, penW, penH);

    // Right Goal Area (East 6-yard box)
    this.ctx.strokeRect(pitchX + pitchW - gAreaW, gAreaY, gAreaW, gAreaH);

    // Right Penalty Spot & Arc
    const rSpotX = pitchX + pitchW - 5.5 * 32;
    this.ctx.beginPath();
    this.ctx.arc(rSpotX, midY, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(rSpotX, midY, 50, Math.PI - 0.9, Math.PI + 0.9);
    this.ctx.stroke();

    // 4 Corner Arcs & Checkered Corner Flags
    const cornerR = 14;
    this.ctx.beginPath(); this.ctx.arc(pitchX, pitchY, cornerR, 0, Math.PI / 2); this.ctx.stroke();
    this.ctx.beginPath(); this.ctx.arc(pitchX, pitchY + pitchH, cornerR, -Math.PI / 2, 0); this.ctx.stroke();
    this.ctx.beginPath(); this.ctx.arc(pitchX + pitchW, pitchY, cornerR, Math.PI / 2, Math.PI); this.ctx.stroke();
    this.ctx.beginPath(); this.ctx.arc(pitchX + pitchW, pitchY + pitchH, cornerR, Math.PI, Math.PI * 1.5); this.ctx.stroke();

    this.drawCornerFlag(pitchX - 2, pitchY - 2);
    this.drawCornerFlag(pitchX - 2, pitchY + pitchH + 2);
    this.drawCornerFlag(pitchX + pitchW + 2, pitchY - 2);
    this.drawCornerFlag(pitchX + pitchW + 2, pitchY + pitchH + 2);

    // High-Res Goalposts (West & East)
    this.drawHighResGoalPost(pitchX, midY - 60, true);
    this.drawHighResGoalPost(pitchX + pitchW, midY - 60, false);

    // Soccer Field Center Label
    this.drawSharpLabel(midX, midY + 54, '⚽ 숭실 천연잔디 축구장', {
      bgColor: 'rgba(21, 128, 61, 0.94)',
      borderColor: '#86efac',
      textColor: '#ffffff',
      fontSize: 13,
      paddingX: 12,
      height: 24
    });

    // ========================================================
    // 7. NEW BOSS RAID ARENA: 서쪽 골대 앞 신규 보스 레이드 전장 (x: 13, y: 35)
    // ========================================================
    const pg = WORLD_DATA.playground;
    if (pg && pg.boss) {
      this.drawSoccerBossArena(13 * 32, 35 * 32, pg.boss);
    }

    // ========================================================
    // 8. RIGHT TOP: BASKETBALL COURT (우레탄 농구장: x: 61 ~ 87, y: 6 ~ 26)
    // ========================================================
    const bCourtX = 61 * 32;
    const bCourtY = 6 * 32;
    const bCourtW = 26 * 32;
    const bCourtH = 20 * 32;

    // Navy Border Buffer
    this.ctx.fillStyle = '#1e3a8a';
    this.ctx.fillRect(bCourtX - 10, bCourtY - 8, bCourtW + 20, bCourtH + 16);

    // Olympic Acrylic Blue Court Surface
    this.ctx.fillStyle = '#0284c7';
    this.ctx.fillRect(bCourtX, bCourtY, bCourtW, bCourtH);

    // Basketball Court Markings
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeRect(bCourtX, bCourtY, bCourtW, bCourtH);

    // Halfcourt Line & Jump Circle
    const bMidX = bCourtX + bCourtW / 2;
    const bMidY = bCourtY + bCourtH / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(bMidX, bCourtY);
    this.ctx.lineTo(bMidX, bCourtY + bCourtH);
    this.ctx.stroke();

    this.ctx.fillStyle = '#0369a1';
    this.ctx.beginPath();
    this.ctx.arc(bMidX, bMidY, 60, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Left Key & 3-pt
    const bKeyW = 6.5 * 32;
    const bKeyH = 6 * 32;
    const bKeyY = bMidY - bKeyH / 2;
    this.ctx.fillStyle = '#ea580c';
    this.ctx.fillRect(bCourtX, bKeyY, bKeyW, bKeyH);
    this.ctx.strokeRect(bCourtX, bKeyY, bKeyW, bKeyH);
    this.ctx.beginPath();
    this.ctx.arc(bCourtX + bKeyW, bMidY, bKeyH / 2, -Math.PI / 2, Math.PI / 2);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(bCourtX + 32, bMidY, 150, -1.0, 1.0);
    this.ctx.stroke();

    // Right Key & 3-pt
    this.ctx.fillStyle = '#ea580c';
    this.ctx.fillRect(bCourtX + bCourtW - bKeyW, bKeyY, bKeyW, bKeyH);
    this.ctx.strokeRect(bCourtX + bCourtW - bKeyW, bKeyY, bKeyW, bKeyH);
    this.ctx.beginPath();
    this.ctx.arc(bCourtX + bCourtW - bKeyW, bMidY, bKeyH / 2, Math.PI / 2, Math.PI * 1.5);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(bCourtX + bCourtW - 32, bMidY, 150, Math.PI - 1.0, Math.PI + 1.0);
    this.ctx.stroke();

    // Basketball Hoops
    this.drawHighResBasketballHoop(bCourtX + 28, bMidY, true);
    this.drawHighResBasketballHoop(bCourtX + bCourtW - 28, bMidY, false);

    // Basketball Court Center Label
    this.drawSharpLabel(bMidX, bMidY + 44, '🏀 숭실 야외 농구장', {
      bgColor: 'rgba(2, 132, 199, 0.94)',
      borderColor: '#7dd3fc',
      textColor: '#ffffff',
      fontSize: 13,
      paddingX: 12,
      height: 24
    });

    // ========================================================
    // 9. RIGHT BOTTOM: FUTSAL COURT (신규 인조잔디 풋살장: x: 61 ~ 87, y: 30 ~ 50)
    // ========================================================
    this.drawHighResFutsalCourt(61 * 32, 30 * 32, 26 * 32, 20 * 32);

    // ========================================================
    // 10. Sidelines, Benches, Water Fountain, and Perimeter Fences
    // ========================================================
    this.drawHighResBench(26 * 32, 16 * 32 + 6);
    this.drawHighResBench(34 * 32, 16 * 32 + 6);
    this.drawHighResBench(70 * 32, 5 * 32 + 6);
    this.drawHighResBench(76 * 32, 5 * 32 + 6);
    this.drawHighResBench(70 * 32, 28 * 32 + 6);
    this.drawHighResBench(76 * 32, 28 * 32 + 6);

    // Drinking Fountain between fields (x: 59, y: 5)
    this.drawHighResDrinkingFountain(59 * 32 + 16, 5 * 32 + 10);

    // Perimeter Fence along Bottom Edge (ty === 53)
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 53 * 32 + 16);
    this.ctx.lineTo(mapW * 32, 53 * 32 + 16);
    this.ctx.stroke();

    for (let fx = 0; fx < mapW * 32; fx += 64) {
      this.ctx.fillStyle = '#64748b';
      this.ctx.fillRect(fx, 53 * 32, 4, 28);
    }

    // 11. Render Playground Field Monsters
    this.renderBasketballMonsters();
    this.renderFutsalMonsters();
  }

  // ========================================================
  // OUTDOOR SPECTATOR BLEACHERS RENDERING (야외 스탠드 관람석)
  // ========================================================
  drawHighResBleachers(sx, sy, sw, sh) {
    this.ctx.save();

    // Bleacher Concrete Base Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    this.ctx.fillRect(sx - 4, sy - 2, sw + 8, sh + 8);

    // 5 Tiered Concrete Stadium Steps
    const tiers = 5;
    const tierH = sh / (tiers + 1);

    const stepColors = ['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];
    const seatColors = ['#1e3a8a', '#1d4ed8', '#15803d', '#16a34a', '#b45309'];

    for (let i = 0; i < tiers; i++) {
      const ty = sy + i * tierH;
      // Concrete Step Surface
      this.ctx.fillStyle = stepColors[i % stepColors.length];
      this.ctx.fillRect(sx, ty, sw, tierH);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.fillRect(sx, ty, sw, 2); // bevel

      // Plastic / Wood Seat Slats
      const seatY = ty + 4;
      const seatH = tierH - 8;
      for (let bx = sx + 16; bx < sx + sw - 16; bx += 36) {
        // Leave aisle space in center (walkways)
        if (Math.abs(bx - (sx + sw / 2)) < 50) continue;
        if (Math.abs(bx - (sx + sw / 4)) < 24) continue;
        if (Math.abs(bx - (sx + (sw * 3) / 4)) < 24) continue;

        this.ctx.fillStyle = seatColors[i % seatColors.length];
        this.ctx.beginPath();
        this.ctx.roundRect(bx, seatY, 28, seatH, 4);
        this.ctx.fill();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(bx + 2, seatY + 1, 24, 2);
      }
    }

    // Center Grandstand Canopy / Awning (차양막 지붕)
    const canopyW = 20 * 32;
    const canopyH = 6 * 32;
    const canopyX = sx + (sw - canopyW) / 2;
    const canopyY = sy - 14;

    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.ctx.beginPath();
    this.ctx.roundRect(canopyX, canopyY, canopyW, canopyH, 8);
    this.ctx.fill();
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Steel Truss Pillars
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(canopyX + 10, canopyY + canopyH, 6, sh - canopyH);
    this.ctx.fillRect(canopyX + canopyW - 16, canopyY + canopyH, 6, sh - canopyH);

    // Grandstand Center Banner
    this.drawSharpLabel(sx + sw / 2, sy + sh + 24, '🏫 숭실 야외 스탠드 관람석', {
      bgColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#fbbf24',
      textColor: '#fef08a',
      fontSize: 13,
      paddingX: 14,
      height: 24
    });

    this.ctx.restore();
  }

  // ========================================================
  // SOCCER BOSS RAID ARENA (축구장 서쪽 골대 앞 신규 보스 레이드 장소)
  // ========================================================
  drawSoccerBossArena(bx, by, boss) {
    this.ctx.save();
    const now = Date.now();
    const pulse = 0.7 + Math.sin(now / 180) * 0.3;
    const rot = now / 1200;

    // 1. Glowing Sacred Raid Magic Circle on Grass
    this.ctx.save();
    this.ctx.translate(bx, by);

    // Outer Aura Ring
    this.ctx.strokeStyle = \`rgba(250, 204, 21, \${pulse})\`;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 72, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(234, 88, 12, 0.18)';
    this.ctx.fill();

    // Rotating Runes & Star Rays
    this.ctx.rotate(rot);
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    for (let r = 0; r < 8; r++) {
      const ang = (r * Math.PI) / 4;
      this.ctx.moveTo(Math.cos(ang) * 45, Math.sin(ang) * 45);
      this.ctx.lineTo(Math.cos(ang) * 68, Math.sin(ang) * 68);
    }
    this.ctx.stroke();

    // Sacred Runes
    for (let r = 0; r < 6; r++) {
      const ang = (r * Math.PI) / 3;
      this.ctx.fillStyle = '#fef08a';
      this.ctx.beginPath();
      this.ctx.arc(Math.cos(ang) * 56, Math.sin(ang) * 56, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();

    // 2. Draw Active Boss Sprite
    const bCfg = window.BOSS_CONFIG || boss;
    const bName = ((bCfg && bCfg.name) || boss.name || '').toLowerCase();

    if (bName.includes('백호') || bName.includes('성수') || bName.includes('tiger')) {
      this.drawHighResBossWhiteTiger(boss);
    } else if (bName.includes('케르베로스') || bName.includes('수행평가') || bName.includes('cerberus')) {
      this.drawHighResBossCerberus(boss);
    } else if (bName.includes('파멸신') || bName.includes('기말고사') || bName.includes('final')) {
      this.drawHighResBossFinalGod(boss);
    } else if (bName.includes('나태') || bName.includes('거인') || bName.includes('sloth')) {
      this.drawHighResBossSlothTitan(boss);
    } else if (bName.includes('골드') || bName.includes('드래곤') || bName.includes('dragon')) {
      this.drawHighResBossDragon(boss);
    } else if (bName.includes('대마왕') || bName.includes('demon')) {
      this.drawHighResBossDemon(boss);
    } else {
      this.drawHighResBossWhiteTiger(boss);
    }

    // 3. Boss Raid Status Nameplate
    const bossDisplayName = (bCfg && bCfg.name) || boss.name || '🐯 숭실 백호 성수';
    this.drawSharpLabel(bx, by - 68, \`\${bossDisplayName} (Lv.40)\`, {
      bgColor: 'rgba(127, 29, 29, 0.96)',
      borderColor: '#fbbf24',
      textColor: '#fef08a',
      fontSize: 12.5,
      paddingX: 12,
      height: 22
    });

    this.drawSharpLabel(bx, by + 46, '⚔️ [SPACE: 보스 레이드 도전]', {
      bgColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: '#ef4444',
      textColor: '#ffffff',
      fontSize: 11,
      paddingX: 10,
      height: 20
    });

    this.ctx.restore();
  }

  // ========================================================
  // NEW FUTSAL COURT RENDERING (신규 인조잔디 풋살장)
  // 위치: x: 61 ~ 87, y: 30 ~ 50 (농구장 아래 동일 규격 26x20타일)
  // ========================================================
  drawHighResFutsalCourt(fx, fy, fw, fh) {
    this.ctx.save();

    // Dark Forest Green Border Buffer
    this.ctx.fillStyle = '#064e3b';
    this.ctx.fillRect(fx - 10, fy - 8, fw + 20, fh + 16);

    // Emerald Green Artificial Turf Base
    this.ctx.fillStyle = '#059669';
    this.ctx.fillRect(fx, fy, fw, fh);

    // Mowing Turf Alternating Bands
    for (let s = 0; s < fw; s += 64) {
      this.ctx.fillStyle = ((s / 64) % 2 === 0) ? '#047857' : '#10b981';
      this.ctx.fillRect(fx + s, fy, 64, fh);
    }

    // Futsal White Boundary Lines (2.5px)
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeRect(fx, fy, fw, fh);

    // Halfway Line & Center Circle (Radius: 50px)
    const fMidX = fx + fw / 2;
    const fMidY = fy + fh / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(fMidX, fy);
    this.ctx.lineTo(fMidX, fy + fh);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(fMidX, fMidY, 50, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(fMidX, fMidY, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Left Penalty Semi-Circle Arc (Radius: 6m ~ 90px)
    this.ctx.beginPath();
    this.ctx.arc(fx, fMidY, 90, -Math.PI / 2, Math.PI / 2);
    this.ctx.stroke();

    // Right Penalty Semi-Circle Arc
    this.ctx.beginPath();
    this.ctx.arc(fx + fw, fMidY, 90, Math.PI / 2, Math.PI * 1.5);
    this.ctx.stroke();

    // Futsal Goals (Yellow / White Tubular Steel)
    this.drawHighResGoalPost(fx, fMidY - 45, true);
    this.drawHighResGoalPost(fx + fw, fMidY - 45, false);

    // Futsal Court Center Label
    this.drawSharpLabel(fMidX, fMidY + 44, '⚽ 숭실 인조잔디 풋살장', {
      bgColor: 'rgba(5, 150, 105, 0.94)',
      borderColor: '#6ee7b7',
      textColor: '#ffffff',
      fontSize: 13,
      paddingX: 12,
      height: 24
    });

    this.ctx.restore();
  }

  // ========================================================
  // FUTSAL MONSTERS ROAMING & RENDERING LOGIC
  // ========================================================
  updateFutsalMonsters() {
    if (!this.player || this.player.room !== 'playground') return;
    const pg = WORLD_DATA.playground;
    if (!pg || !pg.futsalMonsters) return;

    const now = Date.now();
    for (const mob of pg.futsalMonsters) {
      if (mob.defeated) {
        if (mob.respawnAt && now >= mob.respawnAt) {
          mob.defeated = false;
          mob.hp = mob.maxHp;
          if (mob.fixed) {
            mob.x = 63;
            mob.y = 40;
          } else {
            mob.x = Math.round(66 + Math.random() * 18);
            mob.y = Math.round(33 + Math.random() * 14);
            mob.targetX = mob.x;
            mob.targetY = mob.y;
          }
        }
        continue;
      }

      if (mob.inBattle) continue;

      // Spider Keeper stands firmly guarding the left futsal goal
      if (mob.fixed) {
        mob.x = 63;
        mob.y = 40;
        continue;
      }

      // Roaming monsters wander inside futsal court (x: 66 ~ 84, y: 32 ~ 48)
      if (mob.roam) {
        if (mob.targetX === undefined || mob.targetY === undefined) {
          mob.targetX = mob.x;
          mob.targetY = mob.y;
          mob.nextMoveTime = now + 1000 + Math.random() * 2000;
        }

        const dx = mob.targetX - mob.x;
        const dy = mob.targetY - mob.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 0.1) {
          mob.x = mob.targetX;
          mob.y = mob.targetY;
          if (now >= (mob.nextMoveTime || 0)) {
            mob.targetX = Math.round((66 + Math.random() * 18) * 10) / 10;
            mob.targetY = Math.round((33 + Math.random() * 14) * 10) / 10;
            mob.nextMoveTime = now + 2500 + Math.random() * 3500;
          }
        } else {
          const step = 0.014;
          mob.x += (dx / dist) * Math.min(dist, step);
          mob.y += (dy / dist) * Math.min(dist, step);
        }
      }
    }
  }

  renderFutsalMonsters() {
    const pg = WORLD_DATA.playground;
    if (!pg || !pg.futsalMonsters) return;

    const now = Date.now();
    for (const mob of pg.futsalMonsters) {
      if (mob.defeated) continue;

      const floatY = Math.sin((now + mob.x * 200) / 200) * 3;
      const px = mob.x * 32;
      const py = mob.y * 32 + floatY;

      // Drop shadow on turf
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      this.ctx.beginPath();
      this.ctx.ellipse(px + 16, mob.y * 32 + 28, 14, 6, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Monster Sprite
      if (mob.avatar === 'tackle_goblin') {
        this.drawTackleGoblin(px, py, now);
      } else if (mob.avatar === 'flame_striker') {
        this.drawFlameStriker(px, py, now);
      } else if (mob.avatar === 'spider_keeper') {
        this.drawSpiderKeeper(px, py, now);
      }

      // HP Bar above monster
      const hpW = 42;
      const hpH = 6;
      const hpX = px + 16 - hpW / 2;
      const hpY = py - 14;
      const hpPct = Math.max(0, Math.min(1, mob.hp / mob.maxHp));

      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      this.ctx.fillRect(hpX - 1, hpY - 1, hpW + 2, hpH + 2);
      this.ctx.fillStyle = '#dc2626';
      this.ctx.fillRect(hpX, hpY, hpW, hpH);
      this.ctx.fillStyle = hpPct > 0.5 ? '#16a34a' : (hpPct > 0.25 ? '#f59e0b' : '#ef4444');
      this.ctx.fillRect(hpX, hpY, hpW * hpPct, hpH);

      // Name & Icon Label below monster
      const isElite = (mob.type === 'elite');
      this.drawSharpLabel(px + 16, mob.y * 32 + 40, \`\${mob.icon} \${mob.name}\`, {
        bgColor: isElite ? 'rgba(127, 29, 29, 0.95)' : 'rgba(30, 41, 59, 0.92)',
        borderColor: isElite ? '#f59e0b' : '#34d399',
        textColor: isElite ? '#fef08a' : '#ffffff',
        fontSize: isElite ? 11.5 : 10.5,
        paddingX: 8,
        height: 20
      });
    }
  }

  // Futsal: Tackle Goblin (축구 유니폼 태클 고블린)
  drawTackleGoblin(px, py, now) {
    this.ctx.save();
    // Green Goblin Head
    this.ctx.fillStyle = '#16a34a';
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 10, 8, 0, Math.PI * 2);
    this.ctx.fill();
    // Pointy Ears
    this.ctx.beginPath();
    this.ctx.moveTo(px + 8, py + 10);
    this.ctx.lineTo(px + 2, py + 6);
    this.ctx.lineTo(px + 8, py + 14);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.moveTo(px + 24, py + 10);
    this.ctx.lineTo(px + 30, py + 6);
    this.ctx.lineTo(px + 24, py + 14);
    this.ctx.fill();

    // Red Headband
    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(px + 9, py + 6, 14, 3);

    // Glowing Yellow Eyes
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px + 12, py + 9, 2.5, 2.5);
    this.ctx.fillRect(px + 17, py + 9, 2.5, 2.5);

    // Soccer Jersey (Blue #10)
    this.ctx.fillStyle = '#2563eb';
    this.ctx.fillRect(px + 10, py + 18, 12, 10);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 7px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('10', px + 16, py + 25);

    // Shorts & Cleats
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px + 11, py + 27, 4, 4);
    this.ctx.fillRect(px + 17, py + 27, 4, 4);
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px + 10, py + 30, 5, 2);
    this.ctx.fillRect(px + 17, py + 30, 5, 2);

    // Soccer Ball at foot
    const ballX = px + 26;
    const ballY = py + 24 + Math.sin(now / 150) * 3;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(ballX - 1.5, ballY - 1.5, 3, 3);
    this.ctx.restore();
  }

  // Futsal: Flame Striker (불꽃 스트라이커)
  drawFlameStriker(px, py, now) {
    this.ctx.save();
    // Swirling Fiery Vortex
    const flicker = Math.sin(now / 80) * 3;
    this.ctx.fillStyle = '#ea580c';
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 16 + flicker, 15, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#f59e0b';
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 16, 11, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#fef08a';
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 15, 7, 0, Math.PI * 2);
    this.ctx.fill();

    // Glowing Eyes
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px + 12, py + 13, 3, 2);
    this.ctx.fillRect(px + 17, py + 13, 3, 2);

    // Orbiting Flaming Soccer Ball
    const rot = now / 140;
    const fbX = px + 16 + Math.cos(rot) * 18;
    const fbY = py + 20 + Math.sin(rot) * 8;
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(fbX, fbY, 7, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#fef08a';
    this.ctx.beginPath();
    this.ctx.arc(fbX, fbY, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  // Futsal: Spider Keeper (거미손 골키퍼)
  drawSpiderKeeper(px, py, now) {
    this.ctx.save();
    // Massive Titan Body (Steel Gray)
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px + 3, py + 8, 26, 22);
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(px + 5, py + 10, 22, 18);

    // Golden Spider Web Aura behind shoulders
    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(px + 16, py + 16, 20, 0, Math.PI * 2);
    this.ctx.stroke();

    // Spider Web Lines
    for (let w = 0; w < 4; w++) {
      const wAng = (w * Math.PI) / 4;
      this.ctx.beginPath();
      this.ctx.moveTo(px + 16 - Math.cos(wAng) * 20, py + 16 - Math.sin(wAng) * 20);
      this.ctx.lineTo(px + 16 + Math.cos(wAng) * 20, py + 16 + Math.sin(wAng) * 20);
      this.ctx.stroke();
    }

    // Giant Golden Goalkeeper Gloves (🧤)
    const gloveWave = Math.sin(now / 150) * 2;
    this.ctx.fillStyle = '#facc15';
    // Left Glove
    this.ctx.fillRect(px - 4, py + 12 + gloveWave, 8, 12);
    this.ctx.strokeStyle = '#d97706';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(px - 4, py + 12 + gloveWave, 8, 12);
    // Right Glove
    this.ctx.fillStyle = '#facc15';
    this.ctx.fillRect(px + 28, py + 12 - gloveWave, 8, 12);
    this.ctx.strokeRect(px + 28, py + 12 - gloveWave, 8, 12);

    // Glowing Red Visor / Runed Eyes
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(px + 9, py + 14, 14, 3);
    this.ctx.restore();
  }

  // ========================================================
  // HIGH-RES INDOOR WATER PURIFIER (복도 정수기)
  // ========================================================
  drawHighResWaterPurifier(px, py) {
    this.ctx.save();
    // Drop shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.beginPath();
    this.ctx.ellipse(px + 16, py + 30, 16, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    const bx = px + 4;
    const by = py - 4;
    const bw = 24;
    const bh = 34;

    // Body
    this.ctx.fillStyle = '#f1f5f9';
    this.ctx.fillRect(bx, by, bw, bh);
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(bx, by, bw, bh);

    // Side Accent
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.fillRect(bx + 1, by + 1, 4, bh - 2);

    // Water Carboy (Blue Dome)
    const tankY = by - 10;
    this.ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
    this.ctx.beginPath();
    this.ctx.roundRect(bx + 3, tankY, bw - 6, 12, [6, 6, 2, 2]);
    this.ctx.fill();
    this.ctx.strokeStyle = '#0284c7';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Water bubbles
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.fillRect(bx + 5, tankY + 2, 3, 7);
    this.ctx.fillRect(bx + 14, tankY + 4, 2, 2);

    // Dispenser Alcove
    const alcoveX = bx + 4;
    const alcoveY = by + 7;
    const alcoveW = bw - 8;
    const alcoveH = 14;
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(alcoveX, alcoveY, alcoveW, alcoveH);

    // Cold / Hot Taps
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillRect(alcoveX + 3, alcoveY + 1, 3, 5);
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(alcoveX + alcoveW - 6, alcoveY + 1, 3, 5);

    // Drip Tray
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(alcoveX + 1, alcoveY + alcoveH - 3, alcoveW - 2, 3);

    // LED Lights
    this.ctx.fillStyle = '#4ade80';
    this.ctx.beginPath();
    this.ctx.arc(bx + 8, by + 4, 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#38bdf8';
    this.ctx.beginPath();
    this.ctx.arc(bx + 16, by + 4, 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Sharp Label
    this.drawSharpLabel(px + 16, py - 22, '🚰 복도 정수기', {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      borderColor: '#38bdf8',
      textColor: '#e0f2fe',
      fontSize: 11.5,
      paddingX: 8,
      height: 20
    });

    this.ctx.restore();
  }

`;

  content = content.slice(0, startIdx) + newPlaygroundCode + content.slice(endIdx);
  fs.writeFileSync('public/js/engine.js', content, 'utf8');
  console.log('Successfully updated engine.js with new Playground layout, bleachers, soccer boss, futsal court, and water purifier!');
} else {
  console.error('Could not find playground start/end in engine.js');
}
