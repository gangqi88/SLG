import { describe, it, expect } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { LEGACY_ENEMY_ALLIANCE_ID, LEGACY_SELF_ALLIANCE_ID } from '@/features/alliance/tests/legacyAllianceIds';

const walk = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  await Promise.all(
    entries.map(async (e) => {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === 'dist') return;
        out.push(...(await walk(p)));
        return;
      }
      out.push(p);
    }),
  );
  return out;
};

describe('alliance string policy', () => {
  it('keeps legacy ids in test-only module', () => {
    expect(LEGACY_SELF_ALLIANCE_ID).toBe('a_self');
    expect(LEGACY_ENEMY_ALLIANCE_ID).toBe('a_enemy');
  });

  it('forbids legacy and npc literals in runtime code', async () => {
    const root = path.join(process.cwd(), 'src');
    const files = (await walk(root)).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));
    const allow = new Set<string>([
      path.join(process.cwd(), 'src', 'features', 'alliance', 'config', 'npcAlliances.ts'),
    ]);
    const forbidden = [/(\ba_self\b)/, /(\ba_enemy\b)/, /(npc_enemy_1)/, /(敌盟)/];
    const testDir = path.join(process.cwd(), 'src', 'features', 'alliance', 'tests') + path.sep;

    for (const file of files) {
      if (file.startsWith(testDir)) continue;
      if (allow.has(file)) continue;
      const txt = await fs.readFile(file, 'utf8');
      forbidden.forEach((re) => {
        expect(txt, `${path.relative(process.cwd(), file)} contains forbidden literal ${re}`).not.toMatch(re);
      });
      expect(txt, `${path.relative(process.cwd(), file)} imports legacyAllianceIds`).not.toMatch(/legacyAllianceIds/);
      expect(txt, `${path.relative(process.cwd(), file)} imports TestOnlyWorldMap`).not.toMatch(/TestOnlyWorldMap/);
    }
  });
});
