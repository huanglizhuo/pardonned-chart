import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { usePardonData } from '../hooks/usePardonData';
import { financialBubbles, formatDollars, getAdmins } from '../utils/dataTransforms';
import { ADMIN_COLORS, ADMIN_LABELS, CATEGORY_ORDER } from '../types';

function formatYear(ts: number) {
  return new Date(ts).getFullYear().toString();
}

interface BubbleTooltipProps {
  active?: boolean;
  payload?: { payload: ReturnType<typeof financialBubbles>[number] }[];
}

function BubbleTooltip({ active, payload }: BubbleTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg bg-[#0f172a] border border-white/[0.08] p-3 text-xs shadow-2xl max-w-[260px]">
      <p className="font-semibold text-white mb-1">{d.name}</p>
      <p className="text-slate-400 mb-1 leading-snug">{d.offense?.slice(0, 80)}{(d.offense?.length ?? 0) > 80 ? '…' : ''}</p>
      <p className="text-slate-300">{ADMIN_LABELS[d.admin as keyof typeof ADMIN_LABELS]} · {d.grantDate}</p>
      {d.restitution > 0 && <p className="text-amber-400">Restitution: {formatDollars(d.restitution)}</p>}
      {d.fine > 0 && <p className="text-emerald-400">Fine: {formatDollars(d.fine)}</p>}
      <p className="text-white font-semibold mt-1">Total: {formatDollars(d.total)}</p>
    </div>
  );
}

export default function FinancialBubbles() {
  const { data, loading } = usePardonData();
  if (loading) return <div className="h-[464px] animate-pulse rounded-xl bg-slate-800" />;

  const bubbles = financialBubbles(data);
  const admins = getAdmins(data);

  const byAdmin = admins.map((admin) => ({
    admin,
    points: bubbles.filter((b) => b.admin === admin),
  }));

  const yTicks = CATEGORY_ORDER.map((_, i) => i);
  const yTickFormatter = (i: number) => CATEGORY_ORDER[i] ?? '';

  return (
    <section className="overflow-hidden rounded-xl bg-slate-800 shadow-lg ring-1 ring-white/5">
      <div className="h-[3px] bg-gradient-to-r from-emerald-500 to-teal-400" />
      <div className="p-6">
        <h2 className="mb-1 text-lg font-semibold text-white">Financial Relief — Individual Grants</h2>
        <p className="mb-4 text-xs text-slate-400">
          Bubble size = total relief (restitution + fines). Only {bubbles.length} grants had financial impact.
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 8, right: 24, left: 16, bottom: 8 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" vertical={false} />
            <XAxis
              type="number"
              dataKey="date"
              name="Date"
              tickFormatter={formatYear}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              type="number"
              dataKey="categoryIndex"
              name="Category"
              ticks={yTicks}
              tickFormatter={yTickFormatter}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              width={110}
              domain={[-0.5, CATEGORY_ORDER.length - 0.5]}
            />
            <ZAxis type="number" dataKey="total" range={[40, 2200]} name="Total" />
            <Tooltip content={<BubbleTooltip />} />
            <Legend
              formatter={(v) => ADMIN_LABELS[v as keyof typeof ADMIN_LABELS] ?? v}
              wrapperStyle={{ fontSize: 12 }}
            />
            {byAdmin.map(({ admin, points }) => (
              <Scatter
                key={admin}
                name={admin}
                data={points}
                fill={ADMIN_COLORS[admin]}
                fillOpacity={0.75}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
