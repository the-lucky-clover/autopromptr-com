
import DashboardStatsCards from './DashboardStatsCards';

interface DashboardStatsModuleProps {
  stats: {
    totalBatches: number;
    activeBatches: number;
    completedBatches: number;
    totalPrompts: number;
  };
  isCompact?: boolean;
}

const DashboardStatsModule = ({ stats, isCompact = false }: DashboardStatsModuleProps) => {
  return <DashboardStatsCards stats={stats} isCompact={isCompact} />;
};

export default DashboardStatsModule;
