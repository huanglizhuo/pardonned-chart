import { useState, useMemo } from 'react';
import { usePardonData } from '../hooks/usePardonData';
import { ADMIN_LABELS } from '../types';

interface Props {
  categoryFilter?: string | null;
}

export default function PardonTable({ categoryFilter }: Props) {
  const { data, loading } = usePardonData();
  const [search, setSearch] = useState('');
  const [admin, setAdmin] = useState('');
  const [category, setCategory] = useState('');
  const [clemency, setClemency] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const activeCategory = categoryFilter ?? category;

  const categories = useMemo(() => [...new Set(data.map((r) => r.category))].sort(), [data]);
  const admins = useMemo(() => [...new Set(data.map((r) => r.administrationSlug))], [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !r.offense.toLowerCase().includes(q)) return false;
      if (admin && r.administrationSlug !== admin) return false;
      if (activeCategory && r.category !== activeCategory) return false;
      if (clemency && r.clemencyType !== clemency) return false;
      return true;
    });
  }, [data, search, admin, activeCategory, clemency]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleAdmin = (v: string) => { setAdmin(v); setPage(1); };
  const handleCategory = (v: string) => { setCategory(v); setPage(1); };
  const handleClemency = (v: string) => { setClemency(v); setPage(1); };

  return (
    <section className="rounded-xl bg-slate-800 p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-white">All Grants</h2>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search name or offense…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={admin}
          onChange={(e) => handleAdmin(e.target.value)}
          className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Admins</option>
          {admins.map((a) => (
            <option key={a} value={a}>{ADMIN_LABELS[a as keyof typeof ADMIN_LABELS] ?? a}</option>
          ))}
        </select>
        <select
          value={activeCategory}
          onChange={(e) => handleCategory(e.target.value)}
          className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={clemency}
          onChange={(e) => handleClemency(e.target.value)}
          className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Types</option>
          <option value="pardon">Pardon</option>
          <option value="commutation">Commutation</option>
        </select>
      </div>

      <p className="mb-2 text-xs text-slate-400">
        {loading ? 'Loading…' : `${filtered.length.toLocaleString()} records`}
        {categoryFilter && <span className="ml-2 text-indigo-400">· filtered by chart: {categoryFilter}</span>}
      </p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="pb-2 pr-4 font-medium">Name</th>
              <th className="pb-2 pr-4 font-medium">Date</th>
              <th className="pb-2 pr-4 font-medium">Type</th>
              <th className="pb-2 pr-4 font-medium">Category</th>
              <th className="pb-2 pr-4 font-medium">Offense</th>
              <th className="pb-2 pr-4 font-medium">District</th>
              <th className="pb-2 font-medium">Admin</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="py-2 pr-4 font-medium text-white">{r.name}</td>
                <td className="py-2 pr-4 text-slate-300 whitespace-nowrap">{r.date}</td>
                <td className="py-2 pr-4">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                    r.clemencyType === 'pardon'
                      ? 'bg-purple-900/60 text-purple-300'
                      : 'bg-cyan-900/60 text-cyan-300'
                  }`}>
                    {r.clemencyType}
                  </span>
                </td>
                <td className="py-2 pr-4 text-slate-300">{r.category}</td>
                <td className="py-2 pr-4 text-slate-300 max-w-[260px] truncate" title={r.offense}>{r.offense}</td>
                <td className="py-2 pr-4 text-slate-300 max-w-[160px] truncate" title={r.district}>{r.district}</td>
                <td className="py-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
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
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded px-3 py-1 hover:bg-slate-700 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded px-3 py-1 hover:bg-slate-700 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}
