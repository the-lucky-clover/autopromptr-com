import { BatchStatus } from '@/types/batch';

interface ProgressDisplayProps {
  status: BatchStatus;
}

const ProgressDisplay = ({ status }: ProgressDisplayProps) => {
  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-2">Automation Progress</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress: {status.progress.completed}/{status.progress.total}</span>
          <span>{status.progress.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{width: `${status.progress.percentage}%`}}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>✓ {status.progress.completed} completed</span>
          {status.progress.failed > 0 && <span>✗ {status.progress.failed} failed</span>}
          {status.progress.processing > 0 && <span>⟳ {status.progress.processing} processing</span>}
          <span>⏳ {status.progress.pending} pending</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressDisplay;
