
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface DashboardBatchHeaderProps {
  onNewBatch: () => void;
}

const DashboardBatchHeader = ({ onNewBatch }: DashboardBatchHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-white font-medium">Your Batches</h3>
      <Button 
        onClick={onNewBatch}
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
      >
        <Plus className="w-4 h-4 mr-2" />
        New Batch
      </Button>
    </div>
  );
};

export default DashboardBatchHeader;
