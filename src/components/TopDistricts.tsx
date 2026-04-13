import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { usePardonData } from '../hooks/usePardonData';
import { topDistricts } from '../utils/dataTransforms';
import { RECHARTS_TOOLTIP } from '../types';

export default function TopDistricts() {
  const { data, loading } = usePardonData();
  if (loading) return <div className="h-[432px] animate-pulse rounded-xl bg-slate-800" />;

  const chartData = topDistricts(data, 15);

  return (
    <section className="overflow-hidden rounded-xl bg-slate-800 shadow-lg ring-1 ring-white/5">
      <div className="h-[3px] bg-gradient-to-r from-indigo-500 to-indigo-400" />
      <div className="p-6">
        <h2 className="mb-1 text-lg font-semibold text-white">Top Federal Districts</h2>
        <p className="mb-4 text-xs text-slate-400">Top 15 federal districts by grant count</p>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="district"
              width={200}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip {...RECHARTS_TOOLTIP} />
            <Bar dataKey="count" fill="#6366f1" radius={[0, 5, 5, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
