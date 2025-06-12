
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

interface HealthMetricsHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

const HealthMetricsHeader = ({ onRefresh, loading }: HealthMetricsHeaderProps) => {
  return (
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <CardTitle className="text-white text-base mb-1">Backend Health</CardTitle>
          <CardDescription className="text-purple-200 text-sm">
            Live backend monitoring
          </CardDescription>
        </div>
        <Button
          onClick={onRefresh}
          disabled={loading}
          size="sm"
          variant="ghost"
          className="text-white hover:text-purple-200 flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </CardHeader>
  );
};

export default HealthMetricsHeader;
