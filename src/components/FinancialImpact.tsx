import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { usePardonData } from '../hooks/usePardonData';
import { financialByCategory, formatDollars } from '../utils/dataTransforms';
import { RECHARTS_TOOLTIP } from '../types';

export default function FinancialImpact() {
  const { data, loading } = usePardonData();
  if (loading) return <div className="h-[332px] animate-pulse rounded-xl bg-slate-800" />;

  const chartData = financialByCategory(data);
  if (chartData.length === 0) return null;

  return (
    <section className="rounded-xl bg-slate-800 shadow-lg ring-1 ring-white/5 p-6">
      <h2 className="mb-1 text-lg font-semibold text-white">Financial Impact by Category</h2>
      <p className="mb-4 text-xs text-slate-400">Aggregate restitution and fines waived per crime category</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 16, bottom: 48 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            angle={-30}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={formatDollars} />
          <Tooltip
            {...RECHARTS_TOOLTIP}
            formatter={(v: number) => formatDollars(v)}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="restitution" name="Restitution" fill="#f59e0b" radius={[5, 5, 0, 0]} />
          <Bar dataKey="fine" name="Fines" fill="#10b981" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
