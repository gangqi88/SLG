const STORAGE_KEY = 'slg_claim_ledger_v1';
const MAX_ENTRIES = 200;

type Ledger = Record<string, number>;

const loadLedger = (): Ledger => {
  if (typeof localStorage === 'undefined') return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Ledger;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
};

const saveLedger = (ledger: Ledger) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ledger));
};

export const hasClaimed = (key: string) => {
  const ledger = loadLedger();
  return Boolean(ledger[key]);
};

export const markClaimed = (key: string) => {
  const ledger = loadLedger();
  ledger[key] = Date.now();

  const keys = Object.keys(ledger);
  if (keys.length > MAX_ENTRIES) {
    keys
      .sort((a, b) => (ledger[a] ?? 0) - (ledger[b] ?? 0))
      .slice(0, keys.length - MAX_ENTRIES)
      .forEach((k) => {
        delete ledger[k];
      });
  }

  saveLedger(ledger);
};

export const newClaimKey = (prefix: string) => {
  const r =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Math.random().toString(36).slice(2)}_${Date.now()}`;
  return `${prefix}:${r}`;
};

