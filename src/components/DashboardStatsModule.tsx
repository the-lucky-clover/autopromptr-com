
import DashboardStatsCards from './DashboardStatsCards';

interface DashboardStatsModuleProps {
  stats: {
    totalBatches: number;
    activeBatches: number;
    completedBatches: number;
    totalPrompts: number;
  };
}

const DashboardStatsModule = ({ stats }: DashboardStatsModuleProps) => {
  return <DashboardStatsCards stats={stats} />;
};

export default DashboardStatsModule;
