import { usePardonData } from '../hooks/usePardonData';
import { formatDollars } from '../utils/dataTransforms';

export default function StatsBar() {
  const { data, loading } = usePardonData();

  const totalRestitution = data.reduce((s, r) => s + (r.restitution ?? 0), 0);
  const totalFines = data.reduce((s, r) => s + (r.fine ?? 0), 0);
  const pardons = data.filter((r) => r.clemencyType === 'pardon').length;
  const commutations = data.filter((r) => r.clemencyType === 'commutation').length;

  const stats = [
    { label: 'Total Grants', value: loading ? '—' : data.length.toLocaleString() },
    { label: 'Pardons', value: loading ? '—' : pardons.toLocaleString() },
    { label: 'Commutations', value: loading ? '—' : commutations.toLocaleString() },
    { label: 'Restitution Waived', value: loading ? '—' : formatDollars(totalRestitution) },
    { label: 'Fines Waived', value: loading ? '—' : formatDollars(totalFines) },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl bg-slate-800 p-5 text-center shadow">
          <div className="text-2xl font-bold text-white">{s.value}</div>
          <div className="mt-1 text-sm text-slate-400">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
