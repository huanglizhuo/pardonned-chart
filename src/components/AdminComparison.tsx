import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { usePardonData } from '../hooks/usePardonData';
import { groupByCategoryAndAdmin, getAdmins } from '../utils/dataTransforms';
import { ADMIN_COLORS, ADMIN_LABELS } from '../types';

export default function AdminComparison() {
  const { data, loading } = usePardonData();
  if (loading) return <div className="h-[332px] animate-pulse rounded-xl bg-slate-800" />;

  const admins = getAdmins(data);
  const chartData = groupByCategoryAndAdmin(data);

  return (
    <section className="rounded-xl bg-slate-800 p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-white">Category by Administration</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="category"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            angle={-30}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend formatter={(v) => ADMIN_LABELS[v as keyof typeof ADMIN_LABELS] ?? v} wrapperStyle={{ fontSize: 11 }} />
          {admins.map((admin) => (
            <Bar key={admin} dataKey={admin} name={admin} fill={ADMIN_COLORS[admin]} radius={[2, 2, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
