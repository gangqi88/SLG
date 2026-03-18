import { describe, it, expect } from 'vitest';
import {
  COMMIT_REGEX,
  validateCommitMessage,
  inferTypeFromFiles,
  inferScopeFromFiles,
  scopeFromPath,
} from '../../../scripts/git/commit-conventions.mjs';

describe('commit conventions', () => {
  it('validates message with regex', () => {
    expect(COMMIT_REGEX.test('refactor(alliance): 将 ensureMigrated 方法移至测试专用模块')).toBe(true);
    expect(validateCommitMessage('feat(alliance): x')).toBe(true);
    expect(validateCommitMessage('feat(alliance): ' + 'x'.repeat(50))).toBe(true);
    expect(validateCommitMessage('feat(alliance): ' + 'x'.repeat(51))).toBe(false);
    expect(validateCommitMessage('feat(alliance) x')).toBe(false);
    expect(validateCommitMessage('foo(alliance): x')).toBe(false);
  });

  it('infers type from files', () => {
    expect(inferTypeFromFiles(['docs/a.md'])).toBe('docs');
    expect(inferTypeFromFiles(['src/a.test.ts'])).toBe('test');
    expect(inferTypeFromFiles(['src/a.css'])).toBe('style');
    expect(inferTypeFromFiles(['scripts/x.mjs'])).toBe('chore');
    expect(inferTypeFromFiles(['src/features/alliance/x.ts'])).toBe('feat');
  });

  it('infers scope from path', () => {
    expect(scopeFromPath('src/features/alliance/x.ts')).toBe('alliance');
    expect(scopeFromPath('src/shared/logic/x.ts')).toBe('shared');
    expect(scopeFromPath('docs/a.md')).toBe('docs');
    expect(scopeFromPath('scripts/git/x.mjs')).toBe('build');
    expect(scopeFromPath('.github/workflows/ci.yml')).toBe('ci');
  });

  it('infers single scope from multiple files', () => {
    expect(inferScopeFromFiles(['src/features/alliance/a.ts', 'src/features/alliance/b.ts'])).toBe('alliance');
    expect(inferScopeFromFiles(['src/features/alliance/a.ts', 'src/features/battle/b.ts'])).toBeNull();
  });
});

