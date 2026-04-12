import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { usePardonData } from '../hooks/usePardonData';
import { topDistricts } from '../utils/dataTransforms';

export default function TopDistricts() {
  const { data, loading } = usePardonData();
  if (loading) return <div className="h-[432px] animate-pulse rounded-xl bg-slate-800" />;

  const chartData = topDistricts(data, 15);

  return (
    <section className="rounded-xl bg-slate-800 p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-white">Top Federal Districts</h2>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="district"
            width={200}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Bar dataKey="count" fill="#6366f1" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
