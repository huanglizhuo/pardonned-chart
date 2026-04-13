export interface PardonRecord {
  slug: string;
  name: string;
  clemencyType: 'pardon' | 'commutation';
  category: string;
  offense: string;
  district: string;
  sentence: string;
  grantDate: string; // YYYY-MM-DD
  date: string;      // human-readable
  restitution: number;
  fine: number;
  administrationSlug: AdminSlug;
}

export type AdminSlug =
  | 'trump-2' | 'trump-1'
  | 'biden-1'
  | 'obama-2' | 'obama-1'
  | 'bush-jr-2' | 'bush-jr-1'
  | 'clinton-2' | 'clinton-1';

export const ADMIN_LABELS: Record<AdminSlug, string> = {
  'trump-2':   'Trump (2nd)',
  'trump-1':   'Trump (1st)',
  'biden-1':   'Biden',
  'obama-2':   'Obama (2nd)',
  'obama-1':   'Obama (1st)',
  'bush-jr-2': 'Bush (2nd)',
  'bush-jr-1': 'Bush (1st)',
  'clinton-2': 'Clinton (2nd)',
  'clinton-1': 'Clinton (1st)',
};

export const ADMIN_COLORS: Record<AdminSlug, string> = {
  'trump-2':   '#ef4444',
  'trump-1':   '#f87171',
  'biden-1':   '#3b82f6',
  'obama-2':   '#60a5fa',
  'obama-1':   '#93c5fd',
  'bush-jr-2': '#f97316',
  'bush-jr-1': '#fb923c',
  'clinton-2': '#a855f7',
  'clinton-1': '#c084fc',
};

export const CATEGORY_ORDER = [
  'drug offense',
  'fraud',
  'financial crime',
  'violent crime',
  'firearms',
  'FACE act',
  'immigration',
  'other',
] as const;

export const RECHARTS_TOOLTIP = {
  contentStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    padding: '8px 12px',
    fontSize: 12,
  },
  labelStyle: { color: '#e2e8f0', fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: '#cbd5e1' },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
};

export const CATEGORY_COLORS: Record<string, string> = {
  'drug offense':    '#a855f7',
  'fraud':           '#f97316',
  'financial crime': '#eab308',
  'violent crime':   '#ef4444',
  'firearms':        '#6b7280',
  'FACE act':        '#14b8a6',
  'immigration':     '#f43f5e',
  'other':           '#94a3b8',
};
