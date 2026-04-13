import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { usePardonData } from '../hooks/usePardonData';
import { groupByCategoryAndAdmin, getAdmins } from '../utils/dataTransforms';
import { ADMIN_COLORS, ADMIN_LABELS, CATEGORY_COLORS, CATEGORY_ORDER } from '../types';

interface SliceTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number }[];
}

function SliceTooltip({ active, payload }: SliceTooltipProps) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg bg-[#0f172a] border border-white/[0.08] px-3 py-2 text-xs shadow-2xl">
      <span className="font-semibold text-white">{value.toLocaleString()}</span>
      <span className="text-slate-400"> {name}</span>
    </div>
  );
}

export default function AdminComparison() {
  const { data, loading } = usePardonData();
  if (loading) return <div className="h-[520px] animate-pulse rounded-xl bg-slate-800" />;

  const admins = getAdmins(data);
  const chartData = groupByCategoryAndAdmin(data);

  const adminSlices = admins.map((admin) => {
    const slices = CATEGORY_ORDER.map((cat) => ({
      name: cat,
      value: (chartData.find((d) => d.category === cat) as Record<string, number> | undefined)?.[admin] ?? 0,
    })).filter((s) => s.value > 0);
    const total = slices.reduce((sum, s) => sum + s.value, 0);
    return {
      admin,
      label: ADMIN_LABELS[admin as keyof typeof ADMIN_LABELS] ?? admin,
      slices,
      total,
    };
  });

  return (
    <section className="rounded-xl bg-slate-800 shadow-lg ring-1 ring-white/5 p-6">
      <h2 className="mb-1 text-lg font-semibold text-white">Category by Administration</h2>
      <p className="mb-4 text-xs text-slate-400">Category breakdown per administration</p>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-4">
        {adminSlices.map(({ admin, label, slices, total }) => (
          <div key={admin} className="flex flex-col items-center">
            <div className="mb-1 flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full shrink-0"
                style={{ background: ADMIN_COLORS[admin as keyof typeof ADMIN_COLORS] ?? '#64748b' }}
              />
              <span className="text-xs font-semibold text-slate-200">{label}</span>
            </div>
            <div className="relative w-full">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={78}
                    strokeWidth={0}
                    paddingAngle={1}
                  >
                    {slices.map((s) => (
                      <Cell key={s.name} fill={CATEGORY_COLORS[s.name] ?? '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip content={<SliceTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-white leading-none">{total.toLocaleString()}</span>
                <span className="mt-0.5 text-[10px] text-slate-500">grants</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
        {CATEGORY_ORDER.map((cat) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-sm shrink-0"
              style={{ background: CATEGORY_COLORS[cat] ?? '#64748b' }}
            />
            <span className="text-xs text-slate-400 truncate">{cat}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
