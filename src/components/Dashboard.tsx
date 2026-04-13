import { useState } from 'react';
import StatsBar from './StatsBar';
import TimelineChart from './TimelineChart';
import CategoryDonut from './CategoryDonut';
import AdminComparison from './AdminComparison';
import PardonVsCommutation from './PardonVsCommutation';
import TopDistricts from './TopDistricts';
import FinancialImpact from './FinancialImpact';
import FinancialBubbles from './FinancialBubbles';
import PardonTable from './PardonTable';
import EndOfTermChart from './EndOfTermChart';
import SankeyChart from './SankeyChart';
import ChoroplethMap from './ChoroplethMap';

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeAdmin, setActiveAdmin] = useState<string | null>(null);
  const [activeState, setActiveState] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* ── Stats ── */}
      <StatsBar />

      {/* ── Yearly timeline ── */}
      <TimelineChart />

      {/* ── Geography ── */}
      <ChoroplethMap onStateClick={setActiveState} activeState={activeState} />

      {/* ── End-of-term surge ── */}
      <EndOfTermChart onAdminClick={setActiveAdmin} activeAdmin={activeAdmin} />

      {/* ── Category + Admin side by side ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CategoryDonut onCategoryClick={setActiveCategory} activeCategory={activeCategory} />
        <AdminComparison />
      </div>

      {/* ── Sankey pipeline ── */}
      <SankeyChart />

      {/* ── Pardon vs Commutation + Financial aggregates ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PardonVsCommutation />
        <FinancialImpact />
      </div>

      {/* ── Financial bubbles (individual) ── */}
      <FinancialBubbles />

      {/* ── Top Districts ── */}
      <TopDistricts />

      {/* ── Table (responds to category, admin, state filters) ── */}
      <PardonTable
        categoryFilter={activeCategory}
        adminFilter={activeAdmin}
        stateFilter={activeState}
      />
    </div>
  );
}
