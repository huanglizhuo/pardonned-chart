import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { usePardonData } from '../hooks/usePardonData';
import { groupByDaysBeforeTermEnd, getAdmins } from '../utils/dataTransforms';
import { ADMIN_COLORS, ADMIN_LABELS } from '../types';

interface Props {
  onAdminClick?: (admin: string | null) => void;
  activeAdmin?: string | null;
}

export default function EndOfTermChart({ onAdminClick, activeAdmin }: Props) {
  const { data, loading } = usePardonData();
  if (loading) return <div className="h-[388px] animate-pulse rounded-xl bg-slate-800" />;

  const admins = getAdmins(data);
  const chartData = groupByDaysBeforeTermEnd(data, admins);

  return (
    <section className="rounded-xl bg-slate-800 p-6 shadow">
      <h2 className="mb-1 text-lg font-semibold text-white">End-of-Term Clemency Surge</h2>
      <p className="mb-4 text-xs text-slate-400">
        Grants by time remaining in term — the rush toward the final day is visible on the right
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            reversed
          />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
            formatter={(val: number, key: string) => [
              val,
              ADMIN_LABELS[key as keyof typeof ADMIN_LABELS] ?? key,
            ]}
          />
          <Legend
            formatter={(v) => ADMIN_LABELS[v as keyof typeof ADMIN_LABELS] ?? v}
            wrapperStyle={{ fontSize: 11 }}
            onClick={(e) => onAdminClick?.(
              activeAdmin === e.dataKey ? null : (e.dataKey as string)
            )}
          />
          {admins.map((admin) => (
            <Line
              key={admin}
              type="monotone"
              dataKey={admin}
              name={admin}
              stroke={ADMIN_COLORS[admin]}
              strokeWidth={activeAdmin && activeAdmin !== admin ? 1 : 2.5}
              opacity={activeAdmin && activeAdmin !== admin ? 0.25 : 1}
              dot={{ r: 4, fill: ADMIN_COLORS[admin] }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
