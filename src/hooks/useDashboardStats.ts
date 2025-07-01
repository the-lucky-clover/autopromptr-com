
import { useState, useCallback } from 'react';

interface DashboardStats {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  totalPrompts: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBatches: 0,
    activeBatches: 0,
    completedBatches: 0,
    totalPrompts: 0
  });

  const [batches, setBatches] = useState<any[]>([]);

  const handleStatsUpdate = useCallback((newStats: DashboardStats) => {
    setStats(newStats);
  }, []);

  const handleBatchesUpdate = useCallback((newBatches: any[]) => {
    setBatches(newBatches);
  }, []);

  const hasActiveBatch = batches.some(batch => batch.status === 'running');

  return {
    stats,
    batches,
    hasActiveBatch,
    handleStatsUpdate,
    handleBatchesUpdate
  };
};
