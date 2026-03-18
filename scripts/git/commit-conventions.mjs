import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

export const COMMIT_REGEX = /^(feat|fix|refactor|docs|style|test|chore)\([a-z0-9-]+\):\s.{1,50}$/;

export const validateCommitMessage = (message) => {
  const firstLine = String(message ?? '').split(/\r?\n/)[0].trim();
  return COMMIT_REGEX.test(firstLine);
};

const runGit = (args) => {
  return execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
};

export const getBranchName = () => {
  try {
    return runGit('rev-parse --abbrev-ref HEAD');
  } catch {
    return '';
  }
};

export const getStagedFiles = () => {
  try {
    const out = runGit('diff --cached --name-only');
    return out ? out.split(/\r?\n/).filter(Boolean) : [];
  } catch {
    return [];
  }
};

const uniq = (arr) => Array.from(new Set(arr));

export const inferTypeFromFiles = (files) => {
  if (files.length === 0) return null;
  const allDocs = files.every((f) => f.startsWith('docs/') || f.endsWith('.md'));
  if (allDocs) return 'docs';
  const allTests = files.every((f) => /(\btest\b|__tests__|\.test\.)/.test(f));
  if (allTests) return 'test';
  const allStyle = files.every((f) => f.endsWith('.css') || f.endsWith('.scss') || f.endsWith('.less'));
  if (allStyle) return 'style';
  if (files.some((f) => f.startsWith('scripts/') || f.startsWith('.github/'))) return 'chore';
  if (files.some((f) => f.startsWith('docs/'))) return 'docs';
  if (files.some((f) => /(\btest\b|__tests__|\.test\.)/.test(f))) return 'test';
  if (files.some((f) => f.endsWith('.css') || f.endsWith('.scss') || f.endsWith('.less'))) return 'style';
  if (files.some((f) => f.startsWith('src/'))) return 'feat';
  return 'chore';
};

export const scopeFromPath = (file) => {
  const m = file.match(/^src\/features\/([^/]+)/);
  if (m) return m[1];
  if (file.startsWith('src/shared/')) return 'shared';
  if (file.startsWith('docs/')) return 'docs';
  if (file.startsWith('scripts/')) return 'build';
  if (file.startsWith('.github/')) return 'ci';
  return null;
};

export const inferScopeFromFiles = (files) => {
  const scopes = uniq(files.map(scopeFromPath).filter(Boolean));
  if (scopes.length === 1) return scopes[0];
  return null;
};

const normalizeScope = (scope) => String(scope ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

const promptSelect = async (question, options) => {
  const rl = createInterface({ input, output });
  const ask = (q) => new Promise((res) => rl.question(q, res));
  try {
    output.write(`${question}\n`);
    options.forEach((o, i) => output.write(`  ${i + 1}) ${o}\n`));
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const ans = String(await ask('请选择序号: ')).trim();
      const n = Number(ans);
      if (Number.isFinite(n) && n >= 1 && n <= options.length) return options[n - 1];
    }
  } finally {
    rl.close();
  }
};

export const generateCommitTemplate = async (args) => {
  const { interactive } = args;
  const files = getStagedFiles();
  const type = inferTypeFromFiles(files);
  const scope = inferScopeFromFiles(files);

  const finalType =
    type ??
    (interactive
      ? await promptSelect('无法推断变更类型，请选择 type：', ['feat', 'fix', 'refactor', 'docs', 'style', 'test', 'chore'])
      : 'chore');

  const finalScope =
    normalizeScope(scope) ||
    (interactive
      ? normalizeScope(await promptSelect('无法推断 scope，请选择 scope：', ['alliance', 'battle', 'city', 'gacha', 'hero', 'shared', 'docs', 'build', 'ci']))
      : 'misc');

  const branch = getBranchName();
  const subject = `更新 ${branch || '改动'}`.slice(0, 50);
  return `${finalType}(${finalScope}): ${subject}`;
};
