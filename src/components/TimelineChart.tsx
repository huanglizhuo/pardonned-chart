import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { usePardonData } from '../hooks/usePardonData';
import { groupByYear, getAdmins } from '../utils/dataTransforms';
import { ADMIN_COLORS, ADMIN_LABELS } from '../types';

export default function TimelineChart() {
  const { data, loading } = usePardonData();
  if (loading) return <ChartSkeleton />;

  const admins = getAdmins(data);
  const chartData = groupByYear(data);

  return (
    <section className="rounded-xl bg-slate-800 p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-white">Grants by Year</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend formatter={(v) => ADMIN_LABELS[v as keyof typeof ADMIN_LABELS] ?? v} wrapperStyle={{ fontSize: 11 }} />
          {admins.map((admin) => (
            <Bar
              key={admin}
              dataKey={admin}
              name={admin}
              stackId="a"
              fill={ADMIN_COLORS[admin]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

function ChartSkeleton() {
  return <div className="h-[364px] animate-pulse rounded-xl bg-slate-800" />;
}
