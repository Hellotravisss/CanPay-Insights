// Merge-conflict markers left in a committed file (2026-10-11: a PR merge
// committed public/llms.txt with <<<<<<< / >>>>>>> in it; caught only by luck).
import { execFileSync } from 'node:child_process';
let out = '';
try { out = execFileSync('git', ['grep', '-n', '-I', '-E', '^(<<<<<<<|>>>>>>>)( |$)', '--', '.', ':!node_modules'], { encoding: 'utf8' }); }
catch (e) { if (e.status !== 1) throw e; } // 1 = no match
if (out.trim()) { console.log(`CONFLICT AUDIT FAIL — merge markers committed:\n${out}`); process.exit(1); }
console.log('CONFLICT AUDIT PASS — no merge markers in tracked files.');
