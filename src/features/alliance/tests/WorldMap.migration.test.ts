import { describe, it, expect, beforeEach } from 'vitest';
import { TestOnlyWorldMap } from '@/features/alliance/tests/TestOnlyWorldMap';

const STORAGE_KEY = 'slg_world_map_v1';

const setStorage = (value: unknown) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

describe('WorldMap migration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('writes version on load', async () => {
    setStorage({
      owners: {
        c1: { ownerAllianceId: null, ownerAllianceName: null },
      },
      defense: {
        c3: { max: 760, cur: 300, repairFromMs: null, repairToMs: null },
      },
    });

    TestOnlyWorldMap.ensureMigrated();

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string) as { version?: number; owners: unknown };
    expect(parsed.version).toBe(2);
  });

  it('normalizes npc owner name', async () => {
    setStorage({
      owners: {
        c3: { ownerAllianceId: 'npc_enemy_1', ownerAllianceName: null },
      },
    });
    const { WorldMap } = await import('@/features/alliance/logic/WorldMap');
    TestOnlyWorldMap.ensureMigrated();
    const city = WorldMap.getCityById('c3');
    expect(city?.ownerAllianceId).toBe('npc_enemy_1');
    expect(city?.ownerAllianceName).toBeTruthy();
  });

  it('keeps null owner and writes version', async () => {
    setStorage({ owners: { c2: { ownerAllianceId: null, ownerAllianceName: null } } });
    const { WorldMap } = await import('@/features/alliance/logic/WorldMap');
    TestOnlyWorldMap.ensureMigrated();
    const city = WorldMap.getCityById('c2');
    expect(city?.ownerAllianceId).toBeNull();
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) as string) as { version?: number };
    expect(parsed.version).toBe(2);
  });
});
