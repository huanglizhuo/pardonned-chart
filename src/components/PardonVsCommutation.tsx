import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { usePardonData } from '../hooks/usePardonData';
import { groupClemencyByAdmin } from '../utils/dataTransforms';
import { ADMIN_LABELS, RECHARTS_TOOLTIP } from '../types';

export default function PardonVsCommutation() {
  const { data, loading } = usePardonData();
  if (loading) return <div className="h-[332px] animate-pulse rounded-xl bg-slate-800" />;

  const raw = groupClemencyByAdmin(data);
  const chartData = raw.map((r) => ({
    admin: ADMIN_LABELS[r.admin as keyof typeof ADMIN_LABELS] ?? r.admin,
    Pardon: r.pardon,
    Commutation: r.commutation,
  }));

  return (
    <section className="rounded-xl bg-slate-800 shadow-lg ring-1 ring-white/5 p-6">
      <h2 className="mb-1 text-lg font-semibold text-white">Pardon vs Commutation by Administration</h2>
      <p className="mb-4 text-xs text-slate-400">Stacked by clemency type across administrations</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 56 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="admin" tick={{ fill: '#94a3b8', fontSize: 12 }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Tooltip {...RECHARTS_TOOLTIP} />
          <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 12, fontSize: 12 }} />
          <Bar dataKey="Pardon" fill="#a855f7" radius={[0, 0, 0, 0]} stackId="a" />
          <Bar dataKey="Commutation" fill="#22d3ee" radius={[5, 5, 0, 0]} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
