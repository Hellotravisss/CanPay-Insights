import data from '../public/data/rankings/north-america-2026.json';

/**
 * The North America ranking as the page reads it. Every figure comes from the
 * published file, which `audit:ranking` (here) and USAPay's post-deploy check
 * recompute against both engines — the page adds no number of its own.
 */
export type Row = { code: string; country: 'CA' | 'US'; name: string; gross: number; net: number; keptPct: number; rank: number };
export type Tier = { usd: number; cad: number; rows: Row[] };

export const ranking = data as unknown as {
  updated: string;
  persona: string;
  method: Record<string, string>;
  fx: { usdcad: number; days: number; from: string; to: string };
  engines: { canada: string; us: { package: string; version: string; commit: string } };
  tiers: Tier[];
  medians: { note: string; CA: { source: string; rows: Row[] }; US: { source: string; rows: Row[] } };
  scopeNotes: Record<string, string[]>;
};

export const DATA_PATH = '/data/rankings/north-america-2026.json';

/**
 * Tile cartogram: one square per jurisdiction, [column, row]. The US block is
 * the common "statebins" layout; Canada sits on top of it with Alaska moved up
 * beside Yukon. Neighbours stay neighbours where they can; areas are not to
 * scale on purpose — Nunavut and Rhode Island get the same square.
 */
export const TILE: Record<string, [number, number]> = {
  AK: [0, 0], YT: [1, 0], NT: [2, 0], NU: [3, 0], NL: [8, 0],
  BC: [1, 1], AB: [2, 1], SK: [3, 1], MB: [4, 1], ON: [5, 1], QC: [6, 1], NB: [7, 1], PE: [8, 1], NS: [9, 1], ME: [10, 1],
  WI: [5, 2], VT: [9, 2], NH: [10, 2],
  WA: [0, 3], ID: [1, 3], MT: [2, 3], ND: [3, 3], MN: [4, 3], IL: [5, 3], MI: [6, 3], NY: [8, 3], MA: [9, 3],
  OR: [0, 4], NV: [1, 4], WY: [2, 4], SD: [3, 4], IA: [4, 4], IN: [5, 4], OH: [6, 4], PA: [7, 4], NJ: [8, 4], CT: [9, 4], RI: [10, 4],
  CA: [0, 5], UT: [1, 5], CO: [2, 5], NE: [3, 5], MO: [4, 5], KY: [5, 5], WV: [6, 5], VA: [7, 5], MD: [8, 5], DE: [9, 5],
  AZ: [1, 6], NM: [2, 6], KS: [3, 6], AR: [4, 6], TN: [5, 6], NC: [6, 6], SC: [7, 6], DC: [8, 6],
  OK: [3, 7], LA: [4, 7], MS: [5, 7], AL: [6, 7], GA: [7, 7],
  HI: [0, 8], TX: [3, 8], FL: [8, 8],
};
export const GRID = { cols: 11, rows: 9 };

/** Rows sharing the top (or bottom) rank — ties are the rule at the top, not the exception. */
export const firstPlace = (t: Tier) => t.rows.filter((r) => r.rank === 1);
export const lastPlace = (t: Tier) => t.rows.filter((r) => r.rank === t.rows[t.rows.length - 1].rank);
export const bestOf = (t: Tier, country: 'CA' | 'US') => t.rows.find((r) => r.country === country)!;
