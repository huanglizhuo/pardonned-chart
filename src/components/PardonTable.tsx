import { useState, useMemo, useRef } from 'react';
import { usePardonData } from '../hooks/usePardonData';
import { ADMIN_LABELS } from '../types';

interface TruncatedCellProps {
  text: string;
  className?: string;
}

function TruncatedCell({ text, className = '' }: TruncatedCellProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [popup, setPopup] = useState<{ x: number; y: number } | null>(null);

  function handleMouseEnter(e: React.MouseEvent) {
    const el = innerRef.current;
    if (el && el.scrollHeight > el.clientHeight + 2) {
      setPopup({ x: e.clientX, y: e.clientY });
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (popup) setPopup({ x: e.clientX, y: e.clientY });
  }

  function handleMouseLeave() {
    setPopup(null);
  }

  return (
    <td
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={innerRef} className="line-clamp-2">
        {text}
      </div>
      {popup && (
        <div
          className="fixed z-50 max-w-sm rounded-lg border border-white/[0.08] bg-[#0f172a] px-3 py-2 text-xs text-slate-200 shadow-2xl pointer-events-none leading-relaxed"
          style={{ left: popup.x + 12, top: popup.y + 16 }}
        >
          {text}
        </div>
      )}
    </td>
  );
}

interface Props {
  categoryFilter?: string | null;
  adminFilter?: string | null;
  stateFilter?: string | null;
}

const STATE_NAMES_SHORT: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
  Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS',
  Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA',
  Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT',
  Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND',
  Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI',
  'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX',
  Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV',
  Wisconsin: 'WI', Wyoming: 'WY', 'District of Columbia': 'DC',
};

function districtState(district: string): string | null {
  for (const [name, abbrev] of Object.entries(STATE_NAMES_SHORT)) {
    if (district.includes(name)) return abbrev;
  }
  return null;
}

export default function PardonTable({ categoryFilter, adminFilter, stateFilter }: Props) {
  const { data, loading } = usePardonData();
  const [search, setSearch] = useState('');
  const [admin, setAdmin] = useState('');
  const [category, setCategory] = useState('');
  const [clemency, setClemency] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const activeCategory = categoryFilter ?? category;
  const activeAdmin = adminFilter ?? admin;

  const categories = useMemo(() => [...new Set(data.map((r) => r.category))].sort(), [data]);
  const admins = useMemo(() => [...new Set(data.map((r) => r.administrationSlug))], [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !r.offense.toLowerCase().includes(q)) return false;
      if (activeAdmin && r.administrationSlug !== activeAdmin) return false;
      if (activeCategory && r.category !== activeCategory) return false;
      if (clemency && r.clemencyType !== clemency) return false;
      if (stateFilter && districtState(r.district ?? '') !== stateFilter) return false;
      return true;
    });
  }, [data, search, admin, activeCategory, clemency, stateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleAdmin = (v: string) => { setAdmin(v); setPage(1); };
  const handleCategory = (v: string) => { setCategory(v); setPage(1); };
  const handleClemency = (v: string) => { setClemency(v); setPage(1); };

  const hasExternalFilters = !!(categoryFilter || adminFilter || stateFilter);

  return (
    <section className="overflow-hidden rounded-xl bg-slate-800 shadow-lg ring-1 ring-white/5">
      <div className="h-[3px] bg-gradient-to-r from-slate-600 to-slate-500" />
      <div className="p-6">
        <h2 className="mb-1 text-lg font-semibold text-white">All Grants</h2>
        <p className="mb-5 text-xs text-slate-400">Full clemency record — search and filter across all grants</p>

        {/* Filter bar */}
        <div className="mb-5 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            {/* Search */}
            <div className="flex flex-1 min-w-[200px] flex-col gap-1">
              <label className="pl-0.5 text-xs font-medium text-slate-500">Search</label>
              <div className="relative">
                <svg className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  placeholder="Name or offense…"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={`w-full rounded-lg border bg-slate-700/60 pl-8 pr-8 py-2 text-sm text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${search ? 'border-indigo-500/50' : 'border-transparent'}`}
                />
                {search && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    aria-label="Clear search"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Administration */}
            <div className="flex flex-col gap-1">
              <label className="pl-0.5 text-xs font-medium text-slate-500">Administration</label>
              <select
                value={activeAdmin}
                onChange={(e) => handleAdmin(e.target.value)}
                className={`rounded-lg border bg-slate-700/60 px-3 py-2 text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${activeAdmin ? 'border-indigo-500/50' : 'border-transparent'}`}
              >
                <option value="">All Admins</option>
                {admins.map((a) => (
                  <option key={a} value={a}>{ADMIN_LABELS[a as keyof typeof ADMIN_LABELS] ?? a}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="pl-0.5 text-xs font-medium text-slate-500">Category</label>
              <select
                value={activeCategory}
                onChange={(e) => handleCategory(e.target.value)}
                className={`rounded-lg border bg-slate-700/60 px-3 py-2 text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${activeCategory ? 'border-indigo-500/50' : 'border-transparent'}`}
              >
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1">
              <label className="pl-0.5 text-xs font-medium text-slate-500">Type</label>
              <select
                value={clemency}
                onChange={(e) => handleClemency(e.target.value)}
                className={`rounded-lg border bg-slate-700/60 px-3 py-2 text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${clemency ? 'border-indigo-500/50' : 'border-transparent'}`}
              >
                <option value="">All Types</option>
                <option value="pardon">Pardon</option>
                <option value="commutation">Commutation</option>
              </select>
            </div>
          </div>

          {/* Active filter chips + record count */}
          <div className="flex flex-wrap items-center gap-2 min-h-[24px]">
            {categoryFilter && (
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
                Category: {categoryFilter}
              </span>
            )}
            {adminFilter && (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-300">
                Admin: {ADMIN_LABELS[adminFilter as keyof typeof ADMIN_LABELS] ?? adminFilter}
              </span>
            )}
            {stateFilter && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                State: {stateFilter}
              </span>
            )}
            <span className={`text-xs font-medium tabular-nums text-slate-400 ${hasExternalFilters ? 'ml-auto' : ''}`}>
              {loading ? 'Loading…' : `${filtered.length.toLocaleString()} records`}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/80 text-left">
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Offense</th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500">District</th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Admin</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.slug} className="border-b border-slate-700/40 transition-colors hover:bg-white/[0.03]">
                  <td className="py-2 pr-4 font-medium text-white">{r.name}</td>
                  <td className="py-2 pr-4 text-slate-300 whitespace-nowrap">{r.date}</td>
                  <td className="py-2 pr-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${
                      r.clemencyType === 'pardon'
                        ? 'bg-purple-900/60 text-purple-300'
                        : 'bg-cyan-900/60 text-cyan-300'
                    }`}>
                      {r.clemencyType}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-slate-300">{r.category}</td>
                  <TruncatedCell text={r.offense} className="py-2 pr-4 text-slate-300 max-w-[260px]" />
                  <TruncatedCell text={r.district} className="py-2 pr-4 text-slate-300 max-w-[160px]" />
                  <td className="py-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${
                      r.administrationSlug === 'trump-2'
                        ? 'bg-red-900/60 text-red-300'
                        : 'bg-blue-900/60 text-blue-300'
                    }`}>
                      {ADMIN_LABELS[r.administrationSlug] ?? r.administrationSlug}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No records match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-700/50 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-slate-500 hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Previous
            </button>
            <span className="text-xs font-medium text-slate-400 tabular-nums">
              Page <span className="text-white">{currentPage}</span> of {totalPages.toLocaleString()}
              <span className="mx-2 text-slate-600">·</span>
              {filtered.length.toLocaleString()} total
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-slate-500 hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
