
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HealthDataService, HealthMetrics } from '@/services/healthDataService';
import HealthMetricsHeader from './health/HealthMetricsHeader';
import HealthMetricsError from './health/HealthMetricsError';
import HealthMetricsStatus from './health/HealthMetricsStatus';
import HealthMetricsGrid from './health/HealthMetricsGrid';

const BackendHealthMetrics = () => {
  const [healthData, setHealthData] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const healthService = new HealthDataService();

  const fetchHealthData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await healthService.fetchHealthData();
      setHealthData(data);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch health data';
      setError(errorMessage);
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
        <HealthMetricsError error={error} />
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${healthData ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            <span className="text-white font-medium">Backend Health</span>
          </div>
          <button
            onClick={fetchHealthData}
            disabled={loading}
            className="text-white/60 hover:text-white text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        <HealthMetricsStatus healthData={healthData} loading={loading} />
        {healthData && (
          <HealthMetricsGrid healthData={healthData} lastUpdated={lastUpdated} />
        )}
      </div>
    </Card>
  );
};

export default BackendHealthMetrics;
