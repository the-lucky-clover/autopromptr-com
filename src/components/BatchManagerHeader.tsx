
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BatchManagerHeaderProps {
  onNewBatch: () => void;
}

const BatchManagerHeader = ({ onNewBatch }: BatchManagerHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Batch Queue Manager</h2>
        <p className="text-gray-600">Create and manage automated batch requests with target URLs and prompts.</p>
      </div>
      <Button 
        onClick={onNewBatch}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Batch
      </Button>
    </div>
  );
};

export default BatchManagerHeader;
