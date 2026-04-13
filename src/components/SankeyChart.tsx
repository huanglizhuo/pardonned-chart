import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';
import { usePardonData } from '../hooks/usePardonData';
import { buildSankeyData } from '../utils/dataTransforms';
import { ADMIN_COLORS, ADMIN_LABELS, CATEGORY_COLORS } from '../types';

const CLEMENCY_COLORS: Record<string, string> = {
  pardon: '#a855f7',
  commutation: '#22d3ee',
};

interface SankeyNode {
  name: string;
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  depth?: number;
}

interface NodeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  payload?: SankeyNode;
  containerWidth?: number;
}

function CustomNode({ x = 0, y = 0, width = 10, height = 0, payload, containerWidth = 800 }: NodeProps) {
  const name = payload?.name ?? '';
  const fill =
    ADMIN_COLORS[name as keyof typeof ADMIN_COLORS] ??
    CATEGORY_COLORS[name] ??
    CLEMENCY_COLORS[name] ??
    '#64748b';

  const label = ADMIN_LABELS[name as keyof typeof ADMIN_LABELS] ?? name;
  const isRight = (x ?? 0) + width > (containerWidth ?? 800) / 2;
  const labelX = isRight ? x - 6 : x + width + 6;
  const anchor = isRight ? 'end' : 'start';

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={2} />
      <text
        x={labelX}
        y={y + height / 2}
        textAnchor={anchor}
        dominantBaseline="middle"
        fill="#cbd5e1"
        fontSize={11}
      >
        {label}
      </text>
    </g>
  );
}

interface LinkTooltipProps {
  active?: boolean;
  payload?: { payload: { source: SankeyNode; target: SankeyNode; value: number } }[];
}

function LinkTooltip({ active, payload }: LinkTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  // Node hover: payload has no source/target — skip silently
  if (!item?.source || !item?.target || item.value == null) return null;
  const { source, target, value } = item;
  const srcLabel = ADMIN_LABELS[source.name as keyof typeof ADMIN_LABELS] ?? source.name;
  const tgtLabel = ADMIN_LABELS[target.name as keyof typeof ADMIN_LABELS] ?? target.name;
  return (
    <div className="rounded-lg bg-slate-900 p-2 text-xs border border-slate-700 shadow-lg">
      <span className="text-white font-semibold">{value.toLocaleString()}</span>
      <span className="text-slate-400"> grants: {srcLabel} → {tgtLabel}</span>
    </div>
  );
}

export default function SankeyChart() {
  const { data, loading } = usePardonData();
  if (loading) return <div className="h-[564px] animate-pulse rounded-xl bg-slate-800" />;

  const sankeyData = buildSankeyData(data);

  return (
    <section className="rounded-xl bg-slate-800 p-6 shadow">
      <h2 className="mb-1 text-lg font-semibold text-white">Clemency Pipeline</h2>
      <p className="mb-4 text-xs text-slate-400">
        Flow: Administration → Offense Category → Clemency Type. Width = grant count.
      </p>
      <ResponsiveContainer width="100%" height={500}>
        <Sankey
          data={sankeyData}
          node={<CustomNode />}
          nodePadding={8}
          nodeWidth={12}
          margin={{ top: 8, right: 160, bottom: 8, left: 160 }}
          link={{ stroke: '#334155', strokeOpacity: 0.5 }}
        >
          <Tooltip content={<LinkTooltip />} />
        </Sankey>
      </ResponsiveContainer>
    </section>
  );
}
