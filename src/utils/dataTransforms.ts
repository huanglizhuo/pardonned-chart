import type { PardonRecord, AdminSlug } from '../types';

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
