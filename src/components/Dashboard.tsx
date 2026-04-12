import { useState } from 'react';
import StatsBar from './StatsBar';
import TimelineChart from './TimelineChart';
import CategoryDonut from './CategoryDonut';
import AdminComparison from './AdminComparison';
import PardonVsCommutation from './PardonVsCommutation';
import TopDistricts from './TopDistricts';
import FinancialImpact from './FinancialImpact';
import PardonTable from './PardonTable';

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <StatsBar />

      {/* Timeline full width */}
      <TimelineChart />

      {/* Category + Admin side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CategoryDonut
          onCategoryClick={setActiveCategory}
          activeCategory={activeCategory}
        />
        <AdminComparison />
      </div>

      {/* Pardon vs Commutation + Financial */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PardonVsCommutation />
        <FinancialImpact />
      </div>

      {/* Top Districts full width */}
      <TopDistricts />

      {/* Table full width */}
      <PardonTable categoryFilter={activeCategory} />
    </div>
  );
}
