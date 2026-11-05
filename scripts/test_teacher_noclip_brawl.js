const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Teacher Noclip Brawl Ball Pass-Through & Non-Interference...');

// 1. Verify File Definitions & Logic
const engineJs = fs.readFileSync(path.join(__dirname, '../public/js/engine.js'), 'utf8');
const brawlBallJs = fs.readFileSync(path.join(__dirname, '../public/js/brawl_ball.js'), 'utf8');
const mainJs = fs.readFileSync(path.join(__dirname, '../public/js/main.js'), 'utf8');

// Check that noclip in engine.checkCollision is evaluated before Brawl Ball collisions
assert(engineJs.indexOf('if (this.player.noclip) return false;') < engineJs.indexOf('window.BrawlBall.isCollisionBlocked'), 'Teacher noclip must be checked before Brawl Ball collision block in engine.js');

// Check brawl_ball.js methods have noclip non-interference guards
assert(brawlBallJs.includes('if (this.engine && this.engine.player && this.engine.player.noclip)'), 'isCollisionBlocked must allow noclip players');
assert(brawlBallJs.includes('const isTeacherNoclip = !!(this.engine.player.isTeacher && this.engine.player.noclip);'), 'update loop must identify isTeacherNoclip');
assert(brawlBallJs.includes('!isTeacherNoclip && (!this.match || !this.myTeam) && this.isInsideCourtBox'), 'isTeacherNoclip must not be teleported out');
assert(brawlBallJs.includes('const canPickupMatch = !isTeacherNoclip && this.myTeam'), 'isTeacherNoclip or spectator must not pickup the ball');
assert(brawlBallJs.includes('if (p.noclip || !this.myTeam) return false;'), 'tryKick and trySuper must reject noclip or non-team users');
assert(brawlBallJs.includes('if (p.noclip || !this.myTeam) return;'), 'tryTackle and updatePowerupSpawns must reject noclip or non-team users');
console.log('  ✓ Static code logic validated');

// 2. Mock Runtime Simulation
global.window = {};
global.document = {
  activeElement: { tagName: 'BODY' },
  getElementById: () => null
};

// Evaluate BrawlBallManager
eval(brawlBallJs.replace('class BrawlBallManager', 'global.BrawlBallManager = class BrawlBallManager').replace('window.BrawlBall = new BrawlBallManager();', ''));

const mockEngine = {
  width: 860,
  player: {
    x: 43 * 32,
    y: 35 * 32, // inside court
    room: 'playground',
    isTeacher: true,
    noclip: true,
    direction: 'down',
    name: '갓준철'
  }
};

const brawl = new BrawlBallManager();
brawl.init(mockEngine, null);

// Test A: isCollisionBlocked returns false when noclip is true
assert.strictEqual(brawl.isCollisionBlocked(30 * 32, 35 * 32, 32 * 32, 35 * 32), false, 'Noclip player should not be blocked entering court');

// Test B: update(dt) does NOT teleport teacher when noclip is true
brawl.match = null;
brawl.myTeam = null;
brawl.update(0.016);
assert.strictEqual(mockEngine.player.x, 43 * 32, 'Teacher with noclip must remain inside court');
assert.strictEqual(mockEngine.player.y, 35 * 32, 'Teacher with noclip must remain inside court');

// Test C: tryKick, tryTackle, trySuper return false/early and don't affect ball
assert.strictEqual(brawl.tryKick(), false, 'Teacher in noclip cannot kick');
assert.strictEqual(brawl.trySuper(), false, 'Teacher in noclip cannot super');

// Test D: Powerup drinks cannot be collected by teacher in noclip
brawl.powerups = [{ id: 'pw1', x: 43 * 32, y: 35 * 32, type: 'speed' }];
brawl.updatePowerupSpawns();
assert.strictEqual(brawl.powerups.length, 1, 'Powerup must remain uncollected');

// Test E: When noclip is disabled, player outside of match is safely escorted out of court
mockEngine.player.noclip = false;
brawl.update(0.016);
assert.strictEqual(mockEngine.player.y, 20 * 32, 'Non-noclip player without match must be placed outside court');

console.log('🎉 ALL TEACHER NOCLIP BRAWL TESTS PASSED 100%!');
