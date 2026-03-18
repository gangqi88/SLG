import { describe, it, expect, beforeEach } from 'vitest';

const STORAGE_KEY = 'slg_world_map_v1';

const setStorage = (value: unknown) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

describe('WorldMap migration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('migrates legacy a_enemy to npc_enemy_1 and writes version', async () => {
    setStorage({
      owners: {
        c3: { ownerAllianceId: 'a_enemy', ownerAllianceName: '敌盟' },
        c1: { ownerAllianceId: null, ownerAllianceName: null },
      },
      defense: {
        c3: { max: 760, cur: 300, repairFromMs: null, repairToMs: null },
      },
    });

    const { WorldMap, NPC_ENEMY_ALLIANCE_ID } = await import('@/features/alliance/logic/WorldMap');
    WorldMap.ensureMigrated();
    const city = WorldMap.getCityById('c3');
    expect(city?.ownerAllianceId).toBe(NPC_ENEMY_ALLIANCE_ID);

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string) as { version?: number; owners: unknown };
    expect(parsed.version).toBe(2);
  });

  it('keeps null owner and writes version', async () => {
    setStorage({ owners: { c2: { ownerAllianceId: null, ownerAllianceName: null } } });
    const { WorldMap } = await import('@/features/alliance/logic/WorldMap');
    WorldMap.ensureMigrated();
    const city = WorldMap.getCityById('c2');
    expect(city?.ownerAllianceId).toBeNull();
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) as string) as { version?: number };
    expect(parsed.version).toBe(2);
  });
});
