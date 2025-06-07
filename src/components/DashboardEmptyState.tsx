
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { usePersistentBatches } from '@/hooks/usePersistentBatches';
import { useToast } from '@/hooks/use-toast';

interface DashboardEmptyStateProps {
  onNewBatch: () => void;
}

const DashboardEmptyState = ({ onNewBatch }: DashboardEmptyStateProps) => {
  const { searchForLostBatches } = usePersistentBatches();
  const { toast } = useToast();

  const handleSearchForLostData = () => {
    searchForLostBatches();
    toast({
      title: "Search completed",
      description: "Check the browser console (F12) for detailed search results.",
    });
  };

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
        <div className="flex gap-2 justify-center">
          <Button 
            onClick={handleSearchForLostData}
            variant="outline"
            size="sm"
            className="text-white/70 border-white/20 hover:bg-white/10"
          >
            <Search className="w-4 h-4 mr-2" />
            Search for Lost Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardEmptyState;
