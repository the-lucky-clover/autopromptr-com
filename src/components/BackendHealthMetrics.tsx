
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
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
        <HealthMetricsHeader onRefresh={fetchHealthData} loading={loading} />
        <HealthMetricsError error={error} />
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <HealthMetricsHeader onRefresh={fetchHealthData} loading={loading} />
      <div className="px-6 pb-6 space-y-4">
        <HealthMetricsStatus healthData={healthData} loading={loading} />
        {healthData && (
          <HealthMetricsGrid healthData={healthData} lastUpdated={lastUpdated} />
        )}
      </div>
    </Card>
  );
};

export default BackendHealthMetrics;
