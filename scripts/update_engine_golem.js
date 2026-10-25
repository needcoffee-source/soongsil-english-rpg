const fs = require('fs');

let engineJs = fs.readFileSync('public/js/engine.js', 'utf8');

const targetGolemBody = `    // Boss Body (Massive Ancient Bark & Stone Golem)
    const by = py + bob;
    // Giant Shoulders & Torso
    this.ctx.fillStyle = '#3f2e21';
    this.ctx.fillRect(px - 28, by - 26, 56, 42);
    this.ctx.fillStyle = '#5c4033';
    this.ctx.fillRect(px - 24, by - 22, 48, 34);

    // Mossy Shoulder Pads
    this.ctx.fillStyle = '#15803d';
    this.ctx.fillRect(px - 32, by - 28, 18, 12);
    this.ctx.fillRect(px + 14, by - 28, 18, 12);

    // Golem Head & Crown
    this.ctx.fillStyle = '#291d12';
    this.ctx.fillRect(px - 16, by - 44, 32, 22);

    // Glowing Crimson Boss Eyes
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(px - 10, by - 36, 7, 5);
    this.ctx.fillRect(px + 3, by - 36, 7, 5);
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px - 8, by - 35, 3, 3);
    this.ctx.fillRect(px + 5, by - 35, 3, 3);

    // Glowing Rune Core on Chest
    this.ctx.fillStyle = '#dc2626';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 6, 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#fca5a5';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 6, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Massive Golem Fists
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(px - 42, by - 14, 14, 26);
    this.ctx.fillRect(px + 28, by - 14, 14, 26);
    this.ctx.restore();`;

const replaceGolemBody = `    // Boss Body (Toughened Stitched Leather Golem - 가죽 골렘)
    const by = py + bob;
    // Giant Tanned Leather Torso
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(px - 28, by - 26, 56, 42);
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px - 24, by - 22, 48, 34);

    // Stitched Heavy Leather Shoulder Pads
    this.ctx.fillStyle = '#92400e';
    this.ctx.fillRect(px - 32, by - 28, 18, 12);
    this.ctx.fillRect(px + 14, by - 28, 18, 12);
    // Leather Studs on Shoulders
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillRect(px - 30, by - 26, 3, 3);
    this.ctx.fillRect(px - 22, by - 26, 3, 3);
    this.ctx.fillRect(px + 17, by - 26, 3, 3);
    this.ctx.fillRect(px + 25, by - 26, 3, 3);

    // Thick Leather Harness Straps (X-Chest)
    this.ctx.strokeStyle = '#291d12';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(px - 20, by - 22);
    this.ctx.lineTo(px + 20, by + 12);
    this.ctx.moveTo(px + 20, by - 22);
    this.ctx.lineTo(px - 20, by + 12);
    this.ctx.stroke();

    // Stitched Leather Mask & Horns
    this.ctx.fillStyle = '#291d12';
    this.ctx.fillRect(px - 16, by - 44, 32, 22);
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(px - 14, by - 42, 28, 18);

    // Leather Seam Stitches
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px - 1, by - 42, 2, 4);
    this.ctx.fillRect(px - 1, by - 36, 2, 4);
    this.ctx.fillRect(px - 1, by - 30, 2, 4);

    // Glowing Crimson Boss Eyes
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(px - 10, by - 36, 7, 5);
    this.ctx.fillRect(px + 3, by - 36, 7, 5);
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(px - 8, by - 35, 3, 3);
    this.ctx.fillRect(px + 5, by - 35, 3, 3);

    // Glowing Rune Core on Chest
    this.ctx.fillStyle = '#dc2626';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 6, 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#fca5a5';
    this.ctx.beginPath();
    this.ctx.arc(px, by - 6, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Massive Leather Wrapped Fists
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(px - 42, by - 14, 14, 26);
    this.ctx.fillRect(px + 28, by - 14, 14, 26);
    this.ctx.fillStyle = '#92400e';
    this.ctx.fillRect(px - 40, by - 10, 10, 18);
    this.ctx.fillRect(px + 30, by - 10, 10, 18);
    this.ctx.restore();`;

if (!engineJs.includes(targetGolemBody)) {
  console.error('targetGolemBody not found in engine.js');
  process.exit(1);
}

engineJs = engineJs.replace(targetGolemBody, replaceGolemBody);

fs.writeFileSync('public/js/engine.js', engineJs, 'utf8');
console.log('engine.js leather golem styling updated!');
