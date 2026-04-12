import ReactCalendarHeatmap, { type ReactCalendarHeatmapValue } from 'react-calendar-heatmap';
import { usePardonData } from '../hooks/usePardonData';
import { groupByDate } from '../utils/dataTransforms';
import 'react-calendar-heatmap/dist/styles.css';

type HeatmapValue = ReactCalendarHeatmapValue<string> & { count?: number };

function classForCount(count: number | undefined): string {
  if (!count) return 'fill-slate-800';
  if (count <= 5)  return 'fill-indigo-950';
  if (count <= 20) return 'fill-indigo-800';
  if (count <= 50) return 'fill-indigo-600';
  if (count <= 150) return 'fill-indigo-400';
  return 'fill-indigo-200';
}

// Split date range into yearly chunks for readability
function getYears(startYear: number, endYear: number): number[] {
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
}

export default function CalendarHeatmapChart() {
  const { data, loading } = usePardonData();

  if (loading) return <div className="h-[400px] animate-pulse rounded-xl bg-slate-800" />;

  const dateMap = new Map(groupByDate(data).map((d) => [d.date, d.count]));
  const years = getYears(1993, 2026);

  return (
    <section className="rounded-xl bg-slate-800 p-6 shadow">
      <h2 className="mb-1 text-lg font-semibold text-white">Daily Pardon Activity</h2>
      <p className="mb-4 text-xs text-slate-400">
        Each cell = one day. Hover for count. End-of-term bursts (Jan 19, Dec) are clearly visible.
      </p>

      <div className="overflow-x-auto">
        <div className="min-w-[900px] space-y-1">
          {years.map((year) => {
            const values = Array.from(dateMap.entries())
              .filter(([d]) => d.startsWith(String(year)))
              .map(([date, count]) => ({ date, count }));

            if (values.length === 0) return null;

            return (
              <div key={year} className="flex items-center gap-3">
                <span className="w-8 text-right text-xs text-slate-500 shrink-0">{year}</span>
                <div className="flex-1">
                  <ReactCalendarHeatmap
                    startDate={`${year}-01-01`}
                    endDate={`${year}-12-31`}
                    values={values}
                    classForValue={(v: HeatmapValue | undefined) => classForCount(v?.count)}
                    titleForValue={(v: HeatmapValue | undefined) =>
                      v?.count ? `${v.date}: ${v.count} grants` : ''
                    }
                    showWeekdayLabels={false}
                    showMonthLabels={year === years.find((y) => {
                      return Array.from(dateMap.keys()).some((d) => d.startsWith(String(y)));
                    })}
                    gutterSize={2}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
        <span>Less</span>
        {['fill-slate-800', 'fill-indigo-950', 'fill-indigo-800', 'fill-indigo-600', 'fill-indigo-400', 'fill-indigo-200'].map((cls) => (
          <svg key={cls} width={12} height={12}>
            <rect width={12} height={12} rx={2} className={cls} />
          </svg>
        ))}
        <span>More</span>
      </div>
    </section>
  );
}
