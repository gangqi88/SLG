export type NpcAllianceConfig = {
  id: string;
  name: string;
  colorHex: `#${string}`;
  flag: string;
};

const isHexColor = (v: string): v is `#${string}` => /^#[0-9a-fA-F]{6}$/.test(v);

const defineNpcAlliances = <T extends Record<string, Omit<NpcAllianceConfig, 'id'>>>(defs: T) => {
  const result: Record<string, NpcAllianceConfig> = {};
  Object.entries(defs).forEach(([id, cfg]) => {
    if (!cfg.name) throw new Error(`NPC alliance ${id} missing name`);
    if (!cfg.flag) throw new Error(`NPC alliance ${id} missing flag`);
    if (!isHexColor(cfg.colorHex)) throw new Error(`NPC alliance ${id} invalid colorHex`);
    result[id] = { id, ...cfg };
  });
  return result as { [K in keyof T]: NpcAllianceConfig & { id: K } };
};

const NPC_ALLIANCES = defineNpcAlliances({
  npc_enemy_1: { name: '敌盟', colorHex: '#f44336', flag: 'skull' },
} as const);

export type NpcAllianceId = keyof typeof NPC_ALLIANCES;

export const NPC_ENEMY_ALLIANCE_ID: NpcAllianceId = 'npc_enemy_1';

export const isNpcAllianceId = (id: string | null | undefined): id is NpcAllianceId => {
  return Boolean(id && (id as NpcAllianceId) in NPC_ALLIANCES);
};

export const getNpcAlliance = (id: NpcAllianceId) => {
  return NPC_ALLIANCES[id];
};

export const getNpcAllianceOrNull = (id: string | null | undefined) => {
  if (!isNpcAllianceId(id)) return null;
  return getNpcAlliance(id);
};

