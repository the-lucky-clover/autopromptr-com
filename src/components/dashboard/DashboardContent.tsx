
import React from 'react';
import DashboardBatchManager from "@/components/DashboardBatchManager";
import SystemLogsPanel from "@/components/SystemLogsPanel";
import HealthStatusDashboardWrapper from "@/components/HealthStatusDashboardWrapper";
import DashboardSubscription from "@/components/DashboardSubscription";
import DashboardStatsModule from "@/components/DashboardStatsModule";
import SystemReliabilityScore from "@/components/SystemReliabilityScore";
import BatchExtractorModule from "@/components/BatchExtractorModule";
import AnalyticsModule from "@/components/AnalyticsModule";
import { DashboardModule } from '@/hooks/useDashboardModules';

interface DashboardContentProps {
  visibleModules: DashboardModule[];
  stats: {
    totalBatches: number;
    activeBatches: number;
    completedBatches: number;
    totalPrompts: number;
  };
  batches: any[];
  hasActiveBatch: boolean;
  onStatsUpdate: (stats: any) => void;
  onBatchesUpdate: (batches: any[]) => void;
}

const DashboardContent = ({
  visibleModules,
  stats,
  batches,
  hasActiveBatch,
  onStatsUpdate,
  onBatchesUpdate
}: DashboardContentProps) => {
  const renderModuleContent = (moduleId: string, componentName: string, isMinimized: boolean) => {
    switch (componentName) {
      case 'DashboardBatchManager':
        return (
          <DashboardBatchManager 
            onStatsUpdate={onStatsUpdate} 
            onBatchesUpdate={onBatchesUpdate}
            isCompact={isMinimized}
          />
        );
      
      case 'HealthStatusDashboard':
        return <HealthStatusDashboardWrapper isCompact={isMinimized} />;
      
      case 'SystemLogsPanel':
        return <SystemLogsPanel batches={batches} hasActiveBatch={hasActiveBatch} isCompact={isMinimized} />;
      
      case 'DashboardSubscription':
        return <DashboardSubscription isCompact={isMinimized} />;
      
      case 'DashboardStatsModule':
        return <DashboardStatsModule stats={stats} isCompact={isMinimized} />;

      case 'SystemReliabilityScore':
        return <SystemReliabilityScore isCompact={isMinimized} />;

      case 'BatchExtractorModule':
        return <BatchExtractorModule isCompact={isMinimized} />;

      case 'AnalyticsModule':
        return <AnalyticsModule isCompact={isMinimized} />;
      
      default:
        return <div>Module content not found</div>;
    }
  };

  return { renderModuleContent };
};

export default DashboardContent;
