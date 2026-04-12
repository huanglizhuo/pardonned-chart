import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { usePardonData } from '../hooks/usePardonData';
import { groupClemencyByAdmin } from '../utils/dataTransforms';
import { ADMIN_LABELS } from '../types';

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
    <section className="rounded-xl bg-slate-800 p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-white">Pardon vs Commutation by Administration</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="admin" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend />
          <Bar dataKey="Pardon" fill="#a855f7" radius={[3, 3, 0, 0]} stackId="a" />
          <Bar dataKey="Commutation" fill="#22d3ee" radius={[3, 3, 0, 0]} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
