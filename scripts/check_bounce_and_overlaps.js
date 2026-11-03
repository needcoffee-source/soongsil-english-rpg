const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== SYSTEMATIC BOUNCE & OVERLAP AUDIT ===');

const worldJs = fs.readFileSync(path.join(__dirname, '../public/js/world.js'), 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(worldJs, sandbox);
const w = sandbox.window.WORLD_DATA;

let bounceHazards = 0;
let overlapHazards = 0;

// 1. Check Door Bounce Hazards (Target spawn vs Exit Door)
console.log('\n--- 1. Checking Room Spawn vs Exit Door Distances ---');
Object.keys(w.floors).forEach(fKey => {
  const f = w.floors[fKey];
  (f.rooms || []).forEach(r => {
    const crKey = 'classroom_' + r.id.replace('room_', '');
    const cr = w[crKey] || w.classroom;
    if (cr && cr.exitDoor) {
      const dx = Math.abs(r.targetX - cr.exitDoor.x);
      const dy = Math.abs(r.targetY - cr.exitDoor.y);
      console.log(`Floor ${fKey} ${r.name} (${r.id}): target=(${r.targetX}, ${r.targetY}), exit=(${cr.exitDoor.x}, ${cr.exitDoor.y}) -> dx=${dx}, dy=${dy}`);
      if (dx <= 1 && dy <= 1) {
        console.warn(`  💥 [BOUNCE HAZARD] ${r.id} target is within 1 tile of exit! (Instant Bounce Trigger)`);
        bounceHazards++;
      } else if (dx <= 1 && dy <= 2) {
        console.warn(`  ⚠️ [CLOSE PROXIMITY] ${r.id} target is only 2 tiles away from exit!`);
      }
    }
  });
});

// 2. Check Classroom NPC vs Seats/Desks Overlaps
console.log('\n--- 2. Checking NPC Coordinate Overlaps ---');
Object.keys(w).forEach(k => {
  if (k.startsWith('classroom')) {
    const cr = w[k];
    if (cr.npcs && cr.npcs.length > 0) {
      cr.npcs.forEach(npc => {
        console.log(`Room [${k}] NPC: ${npc.name} at (${npc.x}, ${npc.y})`);
        // Check other NPCs in same room
        cr.npcs.forEach(other => {
          if (npc !== other) {
            const dist = Math.hypot(npc.x - other.x, npc.y - other.y);
            if (dist < 1.0) {
              console.warn(`  💥 [NPC OVERLAP] ${npc.name} and ${other.name} are overlapping at dist ${dist.toFixed(2)}!`);
              overlapHazards++;
            }
          }
        });
        // Check interactive items in same room
        (cr.interactive || []).forEach(item => {
          const dist = Math.hypot(npc.x - item.x, npc.y - item.y);
          if (dist < 1.0) {
            console.warn(`  ⚠️ [NPC & ITEM OVERLAP] NPC ${npc.name} and item ${item.name} at dist ${dist.toFixed(2)}`);
          }
        });
      });
    }
  }
});

// 3. Check Corridor NPCs and Interactive Overlaps
console.log('\n--- 3. Checking Floor/Hallway Overlaps ---');
Object.keys(w.floors).forEach(fKey => {
  const f = w.floors[fKey];
  const items = [...(f.interactive || []), ...(f.npcs || [])];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 1.0) {
        console.warn(`  💥 [FLOOR ${fKey} OVERLAP] ${a.name || a.id} and ${b.name || b.id} at dist ${dist.toFixed(2)}!`);
        overlapHazards++;
      }
    }
  }
});

console.log(`\nAudit Complete: ${bounceHazards} Bounce Hazards, ${overlapHazards} Overlap Hazards found.`);
