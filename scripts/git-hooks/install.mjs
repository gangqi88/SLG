import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
const hooksDir = path.join(root, '.git', 'hooks');
fs.mkdirSync(hooksDir, { recursive: true });

const sh = (lines) => `#!/bin/sh\n${lines.join('\n')}\n`;

const commitMsg = sh([
  'ROOT="$(git rev-parse --show-toplevel)"',
  'node "$ROOT/scripts/git/commit-msg.mjs" "$1"',
]);

const preCommit = sh([
  'ROOT="$(git rev-parse --show-toplevel)"',
  'if [ ! -f "$ROOT/.git/hooks/commit-msg" ]; then',
  '  echo "缺少 commit-msg hook，无法校验提交信息。请先运行: npm run hooks:install" >&2',
  '  exit 1',
  'fi',
  'echo "提交信息规范: $(node "$ROOT/scripts/git/commit-template.mjs" --non-interactive)"',
]);

fs.writeFileSync(path.join(hooksDir, 'commit-msg'), commitMsg, { mode: 0o755 });
fs.writeFileSync(path.join(hooksDir, 'pre-commit'), preCommit, { mode: 0o755 });

process.stdout.write('Git hooks installed: commit-msg, pre-commit\n');

