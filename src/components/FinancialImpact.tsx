import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { usePardonData } from '../hooks/usePardonData';
import { financialByCategory, formatDollars } from '../utils/dataTransforms';

export default function FinancialImpact() {
  const { data, loading } = usePardonData();
  if (loading) return <div className="h-[332px] animate-pulse rounded-xl bg-slate-800" />;

  const chartData = financialByCategory(data);
  if (chartData.length === 0) return null;

  return (
    <section className="rounded-xl bg-slate-800 p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-white">Financial Impact by Category</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 16, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="category"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            angle={-30}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatDollars} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(v: number) => formatDollars(v)}
          />
          <Legend />
          <Bar dataKey="restitution" name="Restitution" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          <Bar dataKey="fine" name="Fines" fill="#10b981" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
