
import { CardContent } from '@/components/ui/card';
import { WifiOff } from 'lucide-react';

interface HealthMetricsErrorProps {
  error: string;
}

const HealthMetricsError = ({ error }: HealthMetricsErrorProps) => {
  return (
    <CardContent className="pt-0">
      <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
        <div className="flex items-center space-x-3 text-red-300 mb-2">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium text-sm">Connection Failed</span>
        </div>
        <p className="text-red-200 text-xs break-words">{error}</p>
      </div>
    </CardContent>
  );
};

export default HealthMetricsError;
