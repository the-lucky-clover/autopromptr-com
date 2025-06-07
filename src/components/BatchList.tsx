
import { Card, CardContent } from '@/components/ui/card';
import { Batch, Platform, BatchStatus } from '@/types/batch';
import BatchCard from './BatchCard';

interface BatchListProps {
  batches: Batch[];
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

const BatchList = ({
  batches,
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
}: BatchListProps) => {
  if (batches.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No batches created yet. Click "New Batch" to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {batches.map((batch) => (
        <BatchCard
          key={batch.id}
          batch={batch}
          platforms={platforms}
          batchStatus={selectedBatchId === batch.id ? batchStatus : null}
          selectedBatchId={selectedBatchId}
          automationLoading={automationLoading}
          onRun={onRun}
          onStop={onStop}
          onDelete={onDelete}
          onUpdatePrompt={onUpdatePrompt}
          onDeletePrompt={onDeletePrompt}
          onAddPrompt={onAddPrompt}
        />
      ))}
    </div>
  );
};

export default BatchList;
