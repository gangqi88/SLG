export const BATTLE_MODES = ['pvp', 'pve', 'siege'] as const;

export type BattleMode = (typeof BATTLE_MODES)[number];

const BATTLE_MODE_SET = new Set<string>(BATTLE_MODES);

export const parseBattleMode = (value?: string | null): BattleMode => {
  if (!value) {
    return 'pvp';
  }
  const normalized = value.trim().toLowerCase();
  if (BATTLE_MODE_SET.has(normalized)) {
    return normalized as BattleMode;
  }
  return 'pvp';
};
