
import { Button } from '@/components/ui/button';
import { Play, Square, Pause, RotateCcw } from 'lucide-react';
import { Batch } from '@/types/batch';

interface BatchControlPanelProps {
  batch: Batch;
  isSelected: boolean;
  isLoading: boolean;
  onRun: (batch: Batch) => void;
  onStop: (batch: Batch) => void;
  onPause: (batch: Batch) => void;
  onRewind: (batch: Batch) => void;
}

const BatchControlPanel = ({
  batch,
  isSelected,
  isLoading,
  onRun,
  onStop,
  onPause,
  onRewind
}: BatchControlPanelProps) => {
  const canRun = batch.status === 'pending' && !isLoading;
  const canStop = batch.status === 'running' && isSelected;
  const canPause = batch.status === 'running' && isSelected;
  const canRewind = ['completed', 'failed', 'stopped'].includes(batch.status) && !isLoading;

  return (
    <div className="flex items-center space-x-2">
      {canRun && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRun(batch)}
          disabled={isLoading}
          className="text-green-600 hover:text-green-700"
          title="Run batch"
        >
          <Play className="h-4 w-4" />
        </Button>
      )}
      
      {canStop && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStop(batch)}
          className="text-red-600 hover:text-red-700"
          title="Stop batch"
        >
          <Square className="h-4 w-4" />
        </Button>
      )}
      
      {canPause && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPause(batch)}
          className="text-orange-600 hover:text-orange-700"
          title="Pause batch"
        >
          <Pause className="h-4 w-4" />
        </Button>
      )}
      
      {canRewind && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRewind(batch)}
          className="text-blue-600 hover:text-blue-700"
          title="Reset batch"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default BatchControlPanel;
