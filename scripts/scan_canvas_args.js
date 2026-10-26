// Static scan: count arguments of canvas calls across all client JS files
const fs = require('fs');
const path = require('path');
const REQ = { ellipse: 7, arc: 5, fillRect: 4, strokeRect: 4, clearRect: 4, quadraticCurveTo: 4, bezierCurveTo: 6, createRadialGradient: 6, createLinearGradient: 4, arcTo: 5 };
const dir = 'public/js';
let problems = 0;
for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.js'))) {
  const src = fs.readFileSync(path.join(dir, f), 'utf8');
  for (const [fn, need] of Object.entries(REQ)) {
    const re = new RegExp('\\.' + fn + '\\(', 'g');
    let m;
    while ((m = re.exec(src))) {
      // extract balanced argument list
      let i = m.index + m[0].length, depth = 1, args = 1, start = i, inStr = null;
      for (; i < src.length && depth > 0; i++) {
        const c = src[i];
        if (inStr) { if (c === inStr && src[i - 1] !== '\\') inStr = null; continue; }
        if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === ',' && depth === 1) args++;
      }
      const body = src.slice(start, i - 1).trim();
      if (body.includes('...')) continue; // spread, can't count
      if (args < need) {
        problems++;
        const line = src.slice(0, m.index).split('\n').length;
        console.log(`❌ ${f}:${line}  ${fn}(${body})  -> ${args} args, needs ${need}`);
      }
    }
  }
}
console.log(problems ? `\n${problems} problem(s) found` : '✅ No canvas argument-count problems in any client file');
