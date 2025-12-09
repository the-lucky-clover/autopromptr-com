import { useState, useCallback, useEffect } from 'react';
import { getBatchStats, getBatches, BatchStats } from '@/services/unifiedDatabase';
import { Batch } from '@/types/batch';

interface DashboardStats {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  runningBatches?: number;
  failedBatches?: number;
  pendingBatches?: number;
  totalPrompts: number;
  successRate?: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBatches: 0,
    activeBatches: 0,
    completedBatches: 0,
    runningBatches: 0,
    failedBatches: 0,
    pendingBatches: 0,
    totalPrompts: 0,
    successRate: 0
  });

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch stats on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch batches and stats in parallel
        const [batchesResult, statsResult] = await Promise.all([
          getBatches(),
          getBatchStats()
        ]);
        
        if (batchesResult.data) {
          setBatches(batchesResult.data);
        }
        
        if (statsResult.data) {
          const totalPrompts = batchesResult.data?.reduce(
            (sum, batch) => sum + (batch.prompts?.length || 0), 
            0
          ) || 0;
          
          setStats({
            totalBatches: statsResult.data.totalBatches,
            activeBatches: statsResult.data.runningBatches,
            completedBatches: statsResult.data.completedBatches,
            runningBatches: statsResult.data.runningBatches,
            failedBatches: statsResult.data.failedBatches,
            pendingBatches: statsResult.data.pendingBatches,
            totalPrompts,
            successRate: statsResult.data.successRate
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatsUpdate = useCallback((newStats: DashboardStats) => {
    setStats(newStats);
  }, []);

  const handleBatchesUpdate = useCallback((newBatches: Batch[]) => {
    setBatches(newBatches);
  }, []);

  const hasActiveBatch = batches.some(batch => batch.status === 'running');

  const refresh = useCallback(async () => {
    const [batchesResult, statsResult] = await Promise.all([
      getBatches(),
      getBatchStats()
    ]);
    
    if (batchesResult.data) setBatches(batchesResult.data);
    if (statsResult.data) {
      const totalPrompts = batchesResult.data?.reduce(
        (sum, batch) => sum + (batch.prompts?.length || 0), 
        0
      ) || 0;
      
      setStats({
        totalBatches: statsResult.data.totalBatches,
        activeBatches: statsResult.data.runningBatches,
        completedBatches: statsResult.data.completedBatches,
        runningBatches: statsResult.data.runningBatches,
        failedBatches: statsResult.data.failedBatches,
        pendingBatches: statsResult.data.pendingBatches,
        totalPrompts,
        successRate: statsResult.data.successRate
      });
    }
  }, []);

  return {
    stats,
    batches,
    hasActiveBatch,
    loading,
    handleStatsUpdate,
    handleBatchesUpdate,
    refresh
  };
};
