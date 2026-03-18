import type { ResourceNeedKey } from '@/shared/components/ResourceWays';

export type ResourceDeficit = {
  key: ResourceNeedKey;
  need: number;
  have: number;
};

export const pickMostDeficient = (items: ResourceDeficit[]) => {
  const valid = items
    .filter((i) => i.need > 0)
    .map((i) => ({
      ...i,
      deficit: Math.max(0, i.need - i.have),
      ratio: i.need > 0 ? Math.max(0, i.need - i.have) / i.need : 0,
    }))
    .filter((i) => i.deficit > 0);
  if (valid.length === 0) return null;
  valid.sort((a, b) => {
    if (b.ratio !== a.ratio) return b.ratio - a.ratio;
    if (b.deficit !== a.deficit) return b.deficit - a.deficit;
    return 0;
  });
  return { key: valid[0].key, deficit: valid[0].deficit };
};

