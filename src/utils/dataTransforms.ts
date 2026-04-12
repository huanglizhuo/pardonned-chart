import type { PardonRecord, AdminSlug } from '../types';
import { CATEGORY_ORDER } from '../types';

/** Returns all unique admin slugs present in the data, ordered chronologically */
export function getAdmins(records: PardonRecord[]): AdminSlug[] {
  const order: AdminSlug[] = [
    'clinton-1', 'clinton-2',
    'bush-jr-1', 'bush-jr-2',
    'obama-1', 'obama-2',
    'trump-1',
    'biden-1',
    'trump-2',
  ];
  const present = new Set(records.map((r) => r.administrationSlug));
  return order.filter((a) => present.has(a));
}

/** Group by year — each entry has a count per administration slug */
export function groupByYear(records: PardonRecord[]): Record<string, number | string>[] {
  const admins = getAdmins(records);
  const map = new Map<string, Record<string, number>>();
  for (const r of records) {
    const year = r.grantDate.slice(0, 4);
    if (!map.has(year)) {
      const init: Record<string, number> = {};
      for (const a of admins) init[a] = 0;
      map.set(year, init);
    }
    map.get(year)![r.administrationSlug]++;
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, counts]) => ({ year, ...counts }));
}

export function groupByCategory(records: PardonRecord[]) {
  const map = new Map<string, number>();
  for (const r of records) {
    map.set(r.category, (map.get(r.category) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));
}

export function groupByCategoryAndAdmin(records: PardonRecord[]) {
  const admins = getAdmins(records);
  const categories = [...new Set(records.map((r) => r.category))];
  return categories.map((cat) => {
    const sub = records.filter((r) => r.category === cat);
    const entry: Record<string, string | number> = { category: cat };
    for (const a of admins) {
      entry[a] = sub.filter((r) => r.administrationSlug === a).length;
    }
    return entry;
  });
}

export function groupClemencyByAdmin(records: PardonRecord[]) {
  const admins = getAdmins(records);
  return admins.map((admin) => {
    const sub = records.filter((r) => r.administrationSlug === admin);
    return {
      admin,
      pardon: sub.filter((r) => r.clemencyType === 'pardon').length,
      commutation: sub.filter((r) => r.clemencyType === 'commutation').length,
    };
  });
}

export function topDistricts(records: PardonRecord[], n = 15) {
  const map = new Map<string, number>();
  for (const r of records) {
    const d = r.district || 'Unknown';
    map.set(d, (map.get(d) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([district, count]) => ({ district, count }));
}

export function financialByCategory(records: PardonRecord[]) {
  const map = new Map<string, { restitution: number; fine: number }>();
  for (const r of records) {
    if (!map.has(r.category)) map.set(r.category, { restitution: 0, fine: 0 });
    const entry = map.get(r.category)!;
    entry.restitution += r.restitution ?? 0;
    entry.fine += r.fine ?? 0;
  }
  return Array.from(map.entries())
    .map(([category, vals]) => ({ category, ...vals }))
    .filter((d) => d.restitution > 0 || d.fine > 0)
    .sort((a, b) => b.restitution + b.fine - (a.restitution + a.fine));
}

export function formatDollars(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

// ─── Phase 2: New transforms ──────────────────────────────────────────────────

/** Term end dates for each administration (Jan 20 of transition year) */
const TERM_END: Record<AdminSlug, number> = {
  'clinton-1': Date.parse('1997-01-20'),
  'clinton-2': Date.parse('2001-01-20'),
  'bush-jr-1': Date.parse('2005-01-20'),
  'bush-jr-2': Date.parse('2009-01-20'),
  'obama-1':   Date.parse('2013-01-20'),
  'obama-2':   Date.parse('2017-01-20'),
  'trump-1':   Date.parse('2021-01-20'),
  'biden-1':   Date.parse('2025-01-20'),
  'trump-2':   Date.parse('2029-01-20'),
};

const SURGE_BUCKETS = [
  { label: 'Last day',   max: 1 },
  { label: 'Last week',  max: 7 },
  { label: 'Last month', max: 30 },
  { label: 'Last 3mo',   max: 90 },
  { label: 'Last 6mo',   max: 180 },
  { label: 'Last year',  max: 365 },
  { label: 'Earlier',    max: Infinity },
];

export function groupByDaysBeforeTermEnd(records: PardonRecord[], admins: AdminSlug[]) {
  // Initialize buckets
  const buckets = SURGE_BUCKETS.map((b) => {
    const entry: Record<string, string | number> = { label: b.label };
    for (const a of admins) entry[a] = 0;
    return entry;
  });

  for (const r of records) {
    const termEnd = TERM_END[r.administrationSlug];
    if (!termEnd) continue;
    const grantMs = Date.parse(r.grantDate);
    const daysRemaining = Math.max(0, (termEnd - grantMs) / 86_400_000);

    let prev = 0;
    for (let i = 0; i < SURGE_BUCKETS.length; i++) {
      const { max } = SURGE_BUCKETS[i];
      if (daysRemaining >= prev && daysRemaining < max) {
        (buckets[i][r.administrationSlug] as number)++;
        break;
      }
      prev = max;
    }
  }
  return buckets;
}

/** Build Sankey nodes + links: Admin → Category → ClemencyType */
export function buildSankeyData(records: PardonRecord[]) {
  const admins = getAdmins(records);
  const categories = [...new Set(records.map((r) => r.category))];
  const clemTypes = ['pardon', 'commutation'] as const;

  const nodes: { name: string }[] = [
    ...admins.map((a) => ({ name: a })),
    ...categories.map((c) => ({ name: c })),
    ...clemTypes.map((t) => ({ name: t })),
  ];

  const adminIdx = (a: string) => admins.indexOf(a as AdminSlug);
  const catIdx   = (c: string) => admins.length + categories.indexOf(c);
  const typeIdx  = (t: string) => admins.length + categories.length + clemTypes.indexOf(t as 'pardon' | 'commutation');

  // Admin → Category links
  const ac = new Map<string, number>();
  for (const r of records) {
    const key = `${r.administrationSlug}|${r.category}`;
    ac.set(key, (ac.get(key) ?? 0) + 1);
  }
  // Category → ClemencyType links
  const ct = new Map<string, number>();
  for (const r of records) {
    const key = `${r.category}|${r.clemencyType}`;
    ct.set(key, (ct.get(key) ?? 0) + 1);
  }

  const links = [
    ...Array.from(ac.entries()).map(([key, value]) => {
      const [a, c] = key.split('|');
      return { source: adminIdx(a), target: catIdx(c), value };
    }),
    ...Array.from(ct.entries()).map(([key, value]) => {
      const [c, t] = key.split('|');
      return { source: catIdx(c), target: typeIdx(t), value };
    }),
  ];

  return { nodes, links };
}

/** District string → US state abbreviation */
const STATE_NAMES: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR',
  California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE',
  Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID',
  Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS',
  Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS',
  Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM',
  'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND',
  Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA',
  'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD',
  Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
  Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV',
  Wisconsin: 'WI', Wyoming: 'WY',
  'District of Columbia': 'DC',
};

function districtToStateAbbrev(district: string): string | null {
  for (const [state, abbrev] of Object.entries(STATE_NAMES)) {
    if (district.includes(state)) return abbrev;
  }
  return null;
}

export function groupByState(records: PardonRecord[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of records) {
    const abbrev = districtToStateAbbrev(r.district ?? '');
    if (abbrev) map.set(abbrev, (map.get(abbrev) ?? 0) + 1);
  }
  return map;
}

export function topCategoryByState(records: PardonRecord[]): Map<string, string> {
  const map = new Map<string, Map<string, number>>();
  for (const r of records) {
    const abbrev = districtToStateAbbrev(r.district ?? '');
    if (!abbrev) continue;
    if (!map.has(abbrev)) map.set(abbrev, new Map());
    const inner = map.get(abbrev)!;
    inner.set(r.category, (inner.get(r.category) ?? 0) + 1);
  }
  const result = new Map<string, string>();
  for (const [state, cats] of map.entries()) {
    const top = Array.from(cats.entries()).sort(([, a], [, b]) => b - a)[0];
    if (top) result.set(state, top[0]);
  }
  return result;
}

/** Count grants per calendar date */
export function groupByDate(records: PardonRecord[]): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of records) {
    map.set(r.grantDate, (map.get(r.grantDate) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

/** Records with non-zero financial impact, ready for bubble/scatter chart */
export function financialBubbles(records: PardonRecord[]) {
  return records
    .filter((r) => (r.restitution ?? 0) + (r.fine ?? 0) > 0)
    .map((r) => ({
      name: r.name,
      date: Date.parse(r.grantDate),
      categoryIndex: CATEGORY_ORDER.indexOf(r.category as typeof CATEGORY_ORDER[number]),
      category: r.category,
      total: (r.restitution ?? 0) + (r.fine ?? 0),
      restitution: r.restitution ?? 0,
      fine: r.fine ?? 0,
      admin: r.administrationSlug,
      offense: r.offense,
      grantDate: r.grantDate,
    }));
}
