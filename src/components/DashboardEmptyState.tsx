
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface DashboardEmptyStateProps {
  onNewBatch: () => void;
}

const DashboardEmptyState = ({ onNewBatch }: DashboardEmptyStateProps) => {
  return (
    <div className="text-center py-8">
      <p className="text-white/70 mb-4">No batches found</p>
      <div className="space-y-2">
        <Button 
          onClick={onNewBatch}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Batch
        </Button>
      </div>
    </div>
  );
};

export default DashboardEmptyState;
