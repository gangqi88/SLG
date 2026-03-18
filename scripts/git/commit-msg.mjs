import fs from 'node:fs';
import { COMMIT_REGEX, validateCommitMessage } from './commit-conventions.mjs';

const file = process.argv[2];
if (!file) {
  process.exit(0);
}

let content = '';
try {
  content = fs.readFileSync(file, 'utf8');
} catch {
  process.exit(0);
}

const firstLine = content.split(/\r?\n/)[0].trim();
if (validateCommitMessage(firstLine)) {
  process.exit(0);
}

process.stderr.write('\n提交信息不符合规范，将阻断提交。\n');
process.stderr.write(`要求正则：${COMMIT_REGEX}\n`);
process.stderr.write('示例：refactor(alliance): 将 ensureMigrated 方法移至测试专用模块\n\n');
process.exit(1);

