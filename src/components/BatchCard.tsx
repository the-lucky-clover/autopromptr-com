import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Play, Square, Trash2 } from 'lucide-react';
import { Batch, Platform, BatchStatus } from '@/types/batch';
import ProgressDisplay from './ProgressDisplay';
import PromptQueueManagerComponent from './queue/PromptQueueManager';
import { usePromptQueueManager } from '@/hooks/usePromptQueueManager';

interface BatchCardProps {
  batch: Batch;
  platforms: Platform[];
  batchStatus?: BatchStatus | null;
  selectedBatchId?: string | null;
  automationLoading: boolean;
  onRun: (batch: Batch) => void;
  onStop: (batch: Batch) => void;
  onDelete: (batchId: string) => void;
  onUpdatePrompt: (batchId: string, promptId: string, text: string) => void;
  onDeletePrompt: (batchId: string, promptId: string) => void;
  onAddPrompt: (batchId: string) => void;
}

const BatchCard = ({
  batch,
  platforms,
  batchStatus,
  selectedBatchId,
  automationLoading,
  onRun,
  onStop,
  onDelete,
  onUpdatePrompt,
  onDeletePrompt,
  onAddPrompt
}: BatchCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'stopped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
            <div>
              <CardTitle className="text-lg">{batch.name}</CardTitle>
              <CardDescription>
                Target: {batch.targetUrl} • {batch.prompts.length} prompt(s)
                {batch.platform && ` • Platform: ${platforms.find(p => p.id === batch.platform)?.name || batch.platform}`}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
              {batch.status}
            </span>
            
            {batch.platform && batch.status === 'pending' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRun(batch)}
                disabled={automationLoading}
                className="text-green-600 hover:text-green-700"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            
            {batch.status === 'running' && selectedBatchId === batch.id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStop(batch)}
                className="text-orange-600 hover:text-orange-700"
              >
                <Square className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(batch.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedBatchId === batch.id && batchStatus && (
          <ProgressDisplay status={batchStatus} />
        )}

        {(() => {
          const queueManager = usePromptQueueManager(
            batch.prompts,
            (updatedPrompts) => {
              // Sync queue changes back to batch operations
              updatedPrompts.forEach((updatedPrompt) => {
                const existingPrompt = batch.prompts.find(p => p.id === updatedPrompt.id);
                if (existingPrompt && existingPrompt.text !== updatedPrompt.text) {
                  onUpdatePrompt(batch.id, updatedPrompt.id, updatedPrompt.text);
                }
              });
            }
          );

          return (
            <PromptQueueManagerComponent
              queueManager={queueManager}
              disabled={batch.status === 'running'}
              targetPlatform={batch.platform}
            />
          );
        })()}
      </CardContent>
    </Card>
  );
};

export default BatchCard;
