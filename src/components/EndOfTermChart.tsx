import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { usePardonData } from '../hooks/usePardonData';
import { groupByDaysBeforeTermEnd, getAdmins } from '../utils/dataTransforms';
import { ADMIN_COLORS, ADMIN_LABELS, RECHARTS_TOOLTIP } from '../types';

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
    <section className="overflow-hidden rounded-xl bg-slate-800 shadow-lg ring-1 ring-white/5">
      <div className="h-[3px] bg-gradient-to-r from-amber-500 to-yellow-400" />
      <div className="p-6">
        <h2 className="mb-1 text-lg font-semibold text-white">End-of-Term Clemency Surge</h2>
        <p className="mb-4 text-xs text-slate-400">
          Grants by time remaining in term — the rush toward the final day is visible on the right
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              reversed
            />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              {...RECHARTS_TOOLTIP}
              formatter={(val: number, key: string) => [
                val,
                ADMIN_LABELS[key as keyof typeof ADMIN_LABELS] ?? key,
              ]}
            />
            <Legend
              formatter={(v) => ADMIN_LABELS[v as keyof typeof ADMIN_LABELS] ?? v}
              wrapperStyle={{ fontSize: 12 }}
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
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: ADMIN_COLORS[admin], fill: '#1e293b' }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
