import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { usePardonData } from '../hooks/usePardonData';
import { groupByYear, getAdmins } from '../utils/dataTransforms';
import { ADMIN_COLORS, ADMIN_LABELS, RECHARTS_TOOLTIP } from '../types';

export default function TimelineChart() {
  const { data, loading } = usePardonData();
  if (loading) return <ChartSkeleton />;

  const admins = getAdmins(data);
  const chartData = groupByYear(data);

  return (
    <section className="overflow-hidden rounded-xl bg-slate-800 shadow-lg ring-1 ring-white/5">
      <div className="h-[3px] bg-gradient-to-r from-slate-500 to-slate-400" />
      <div className="p-6">
        <h2 className="mb-1 text-lg font-semibold text-white">Grants by Year</h2>
        <p className="mb-4 text-xs text-slate-400">Total clemency grants per year by administration</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              {...RECHARTS_TOOLTIP}
              formatter={(v, key) => [v, ADMIN_LABELS[key as keyof typeof ADMIN_LABELS] ?? key]}
            />
            <Legend formatter={(v) => ADMIN_LABELS[v as keyof typeof ADMIN_LABELS] ?? v} wrapperStyle={{ fontSize: 12 }} />
            {admins.map((admin, i) => (
              <Bar
                key={admin}
                dataKey={admin}
                name={admin}
                stackId="a"
                fill={ADMIN_COLORS[admin]}
                radius={i === admins.length - 1 ? [5, 5, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function ChartSkeleton() {
  return <div className="h-[388px] animate-pulse rounded-xl bg-slate-800" />;
}
