import { describe, it, expect } from 'vitest';
import { getNpcAlliance, getNpcAllianceOrNull, isNpcAllianceId, NPC_ENEMY_ALLIANCE_ID } from '@/features/alliance/config/npcAlliances';

describe('npcAlliances', () => {
  it('exposes stable enemy npc id', () => {
    expect(isNpcAllianceId(NPC_ENEMY_ALLIANCE_ID)).toBe(true);
    expect(getNpcAlliance(NPC_ENEMY_ALLIANCE_ID).name).toBeTruthy();
  });

  it('returns null for unknown id', () => {
    expect(getNpcAllianceOrNull('unknown')).toBeNull();
    expect(isNpcAllianceId('unknown')).toBe(false);
  });
});

