import { describe, expect, it } from 'vitest';
import { parseBattleMode } from '@/features/battle/types/battleMode';

describe('parseBattleMode', () => {
  it('returns pvp by default', () => {
    expect(parseBattleMode()).toBe('pvp');
    expect(parseBattleMode(null)).toBe('pvp');
    expect(parseBattleMode('')).toBe('pvp');
  });

  it('parses known battle modes', () => {
    expect(parseBattleMode('pvp')).toBe('pvp');
    expect(parseBattleMode('pve')).toBe('pve');
    expect(parseBattleMode('siege')).toBe('siege');
  });

  it('normalizes and validates mode values', () => {
    expect(parseBattleMode(' PVE ')).toBe('pve');
    expect(parseBattleMode('invalid')).toBe('pvp');
  });
});
