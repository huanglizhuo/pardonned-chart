import { usePardonData } from '../hooks/usePardonData';
import { formatDollars } from '../utils/dataTransforms';

const stats = [
  {
    label: 'Total Grants',
    key: 'total' as const,
    borderColor: '#6366f1',
    bg: 'bg-indigo-500/10',
    color: 'text-indigo-400',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Pardons',
    key: 'pardons' as const,
    borderColor: '#a855f7',
    bg: 'bg-purple-500/10',
    color: 'text-purple-400',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Commutations',
    key: 'commutations' as const,
    borderColor: '#22d3ee',
    bg: 'bg-cyan-500/10',
    color: 'text-cyan-400',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Restitution Waived',
    key: 'restitution' as const,
    borderColor: '#f59e0b',
    bg: 'bg-amber-500/10',
    color: 'text-amber-400',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Fines Waived',
    key: 'fines' as const,
    borderColor: '#10b981',
    bg: 'bg-emerald-500/10',
    color: 'text-emerald-400',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3 1 1 0 102 0 5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
      </svg>
    ),
  },
] as const;

export default function StatsBar() {
  const { data, loading } = usePardonData();

  const totalRestitution = data.reduce((s, r) => s + (r.restitution ?? 0), 0);
  const totalFines = data.reduce((s, r) => s + (r.fine ?? 0), 0);
  const pardons = data.filter((r) => r.clemencyType === 'pardon').length;
  const commutations = data.filter((r) => r.clemencyType === 'commutation').length;

  const values: Record<typeof stats[number]['key'], string> = {
    total: loading ? '—' : data.length.toLocaleString(),
    pardons: loading ? '—' : pardons.toLocaleString(),
    commutations: loading ? '—' : commutations.toLocaleString(),
    restitution: loading ? '—' : formatDollars(totalRestitution),
    fines: loading ? '—' : formatDollars(totalFines),
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s) => (
        <div
          key={s.label}
          className="overflow-hidden rounded-xl bg-slate-800 shadow ring-1 ring-white/[0.06] border-l-[3px] p-5"
          style={{ borderLeftColor: s.borderColor }}
        >
          <div className={`mb-3 inline-flex rounded-lg p-2 ${s.bg} ${s.color}`}>
            {s.icon}
          </div>
          <div className="text-3xl font-bold tracking-tight text-white">{values[s.key]}</div>
          <div className="mt-1 text-xs font-medium text-slate-400">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
