import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { usePardonData } from '../hooks/usePardonData';
import { groupByCategoryAndAdmin, getAdmins } from '../utils/dataTransforms';
import { ADMIN_LABELS, CATEGORY_COLORS, CATEGORY_ORDER } from '../types';

interface SliceTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number }[];
}

function SliceTooltip({ active, payload }: SliceTooltipProps) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-xs shadow-lg">
      <span className="font-semibold text-white">{value.toLocaleString()}</span>
      <span className="text-slate-400"> {name}</span>
    </div>
  );
}

export default function AdminComparison() {
  const { data, loading } = usePardonData();
  if (loading) return <div className="h-[480px] animate-pulse rounded-xl bg-slate-800" />;

  const admins = getAdmins(data);
  const chartData = groupByCategoryAndAdmin(data);

  // Build per-admin slices
  const adminSlices = admins.map((admin) => ({
    admin,
    label: ADMIN_LABELS[admin as keyof typeof ADMIN_LABELS] ?? admin,
    slices: CATEGORY_ORDER.map((cat) => ({
      name: cat,
      value: (chartData.find((d) => d.category === cat) as Record<string, number> | undefined)?.[admin] ?? 0,
    })).filter((s) => s.value > 0),
  }));

  return (
    <section className="rounded-xl bg-slate-800 p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-white">Category by Administration</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {adminSlices.map(({ admin, label, slices }) => (
          <div key={admin} className="flex flex-col items-center">
            <span className="mb-1 text-xs font-medium text-slate-300">{label}</span>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={32}
                  outerRadius={58}
                  strokeWidth={0}
                >
                  {slices.map((s) => (
                    <Cell key={s.name} fill={CATEGORY_COLORS[s.name] ?? '#64748b'} />
                  ))}
                </Pie>
                <Tooltip content={<SliceTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Shared legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        {CATEGORY_ORDER.map((cat) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm shrink-0"
              style={{ background: CATEGORY_COLORS[cat] ?? '#64748b' }}
            />
            <span className="text-xs text-slate-400">{cat}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
