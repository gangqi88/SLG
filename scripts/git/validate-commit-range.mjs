import { execSync } from 'node:child_process';
import { COMMIT_REGEX } from './commit-conventions.mjs';

const base = process.argv[2];
const head = process.argv[3];

if (!base || !head) {
  process.stderr.write('Usage: node scripts/git/validate-commit-range.mjs <baseSha> <headSha>\n');
  process.exit(2);
}

const run = (cmd) => execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' });
const list = run(`git log --format=%s ${base}..${head}`).trim().split(/\r?\n/).filter(Boolean);

const bad = list.filter((m) => !COMMIT_REGEX.test(m));
if (bad.length === 0) {
  process.exit(0);
}

process.stderr.write('发现不合规的 commit message：\n');
bad.forEach((m) => process.stderr.write(`- ${m}\n`));
process.stderr.write(`\n要求正则：${COMMIT_REGEX}\n`);
process.exit(1);

