import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { usePardonData } from '../hooks/usePardonData';
import { groupByCategory } from '../utils/dataTransforms';
import { CATEGORY_COLORS, RECHARTS_TOOLTIP } from '../types';

interface Props {
  onCategoryClick?: (category: string | null) => void;
  activeCategory?: string | null;
}

export default function CategoryDonut({ onCategoryClick, activeCategory }: Props) {
  const { data, loading } = usePardonData();
  if (loading) return <div className="h-[332px] animate-pulse rounded-xl bg-slate-800" />;

  const chartData = groupByCategory(data);

  return (
    <section className="rounded-xl bg-slate-800 shadow-lg ring-1 ring-white/5 p-6">
      <h2 className="mb-1 text-lg font-semibold text-white">By Category</h2>
      <p className="mb-4 text-xs text-slate-400">Click a segment to filter the table</p>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            onClick={(entry) => {
              if (!onCategoryClick) return;
              onCategoryClick(activeCategory === entry.name ? null : entry.name);
            }}
            cursor="pointer"
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={CATEGORY_COLORS[entry.name] ?? '#94a3b8'}
                opacity={!activeCategory || activeCategory === entry.name ? 1 : 0.35}
                stroke={activeCategory === entry.name ? '#fff' : 'transparent'}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            {...RECHARTS_TOOLTIP}
            formatter={(val: number) => [val, 'grants']}
          />
          <Legend
            formatter={(v) => <span className="text-xs text-slate-300">{v}</span>}
            wrapperStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </section>
  );
}
