import { describe, it, expect } from 'vitest';
import { WorldMap } from '@/features/alliance/logic/WorldMap';

describe('WorldMap public api', () => {
  it('does not expose ensureMigrated', () => {
    expect((WorldMap as unknown as Record<string, unknown>).ensureMigrated).toBeUndefined();
  });
});

