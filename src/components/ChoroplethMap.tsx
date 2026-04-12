import { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { usePardonData } from '../hooks/usePardonData';
import { groupByState, topCategoryByState } from '../utils/dataTransforms';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

// FIPS code → state abbreviation (used by us-atlas TopoJSON)
const FIPS_TO_ABBREV: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO',
  '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI',
  '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY',
  '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN',
  '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH',
  '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD',
  '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA',
  '54': 'WV', '55': 'WI', '56': 'WY',
};

function interpolateColor(t: number): string {
  // 0 → slate-800, 1 → red-500
  const r = Math.round(30 + t * (239 - 30));
  const g = Math.round(41 + t * (68 - 41));
  const b = Math.round(59 + t * (68 - 59));
  return `rgb(${r},${g},${b})`;
}

interface Props {
  onStateClick?: (stateAbbrev: string | null) => void;
  activeState?: string | null;
}

export default function ChoroplethMap({ onStateClick, activeState }: Props) {
  const { data, loading } = usePardonData();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; state: string; count: number; topCat: string } | null>(null);

  const stateCounts = useMemo(() => groupByState(data), [data]);
  const topCats = useMemo(() => topCategoryByState(data), [data]);
  const maxCount = useMemo(() => Math.max(...stateCounts.values(), 1), [stateCounts]);

  if (loading) return <div className="h-[464px] animate-pulse rounded-xl bg-slate-800" />;

  return (
    <section className="rounded-xl bg-slate-800 p-6 shadow">
      <h2 className="mb-1 text-lg font-semibold text-white">Grants by State</h2>
      <p className="mb-2 text-xs text-slate-400">
        Based on federal district of offense. Click a state to filter the table.
        {activeState && (
          <button
            onClick={() => onStateClick?.(null)}
            className="ml-2 text-indigo-400 hover:underline"
          >
            Clear filter ({activeState})
          </button>
        )}
      </p>

      <div className="relative">
        <ComposableMap
          projection="geoAlbersUsa"
          style={{ width: '100%', height: 'auto' }}
          projectionConfig={{ scale: 900 }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const fips = geo.id as string;
                const abbrev = FIPS_TO_ABBREV[fips] ?? null;
                const count = abbrev ? (stateCounts.get(abbrev) ?? 0) : 0;
                const t = count / maxCount;
                const fill = count === 0 ? '#1e293b' : interpolateColor(Math.sqrt(t));
                const isActive = activeState === abbrev;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke={isActive ? '#fff' : '#334155'}
                    strokeWidth={isActive ? 2 : 0.5}
                    style={{
                      default: { outline: 'none', cursor: abbrev ? 'pointer' : 'default' },
                      hover: { outline: 'none', fill: abbrev ? '#6366f1' : fill },
                      pressed: { outline: 'none' },
                    }}
                    onClick={() => {
                      if (!abbrev) return;
                      onStateClick?.(activeState === abbrev ? null : abbrev);
                    }}
                    onMouseEnter={(e) => {
                      if (!abbrev || count === 0) return;
                      setTooltip({
                        x: e.clientX,
                        y: e.clientY,
                        state: abbrev,
                        count,
                        topCat: topCats.get(abbrev) ?? 'unknown',
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {tooltip && (
          <div
            className="pointer-events-none fixed z-50 rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs shadow-lg"
            style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
          >
            <p className="font-semibold text-white">{tooltip.state}</p>
            <p className="text-slate-300">{tooltip.count.toLocaleString()} grants</p>
            <p className="text-slate-400">Top: {tooltip.topCat}</p>
          </div>
        )}
      </div>

      {/* Color legend */}
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
        <span>0</span>
        <div className="flex h-3 flex-1 rounded overflow-hidden">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} style={{ flex: 1, background: interpolateColor(Math.sqrt(i / 19)) }} />
          ))}
        </div>
        <span>{maxCount.toLocaleString()}</span>
      </div>
    </section>
  );
}
