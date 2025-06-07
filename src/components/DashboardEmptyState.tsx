
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { usePersistentBatches } from '@/hooks/usePersistentBatches';
import { useToast } from '@/hooks/use-toast';

interface DashboardEmptyStateProps {
  onNewBatch: () => void;
}

const DashboardEmptyState = ({ onNewBatch }: DashboardEmptyStateProps) => {
  const { recoverFromBackup } = usePersistentBatches();
  const { toast } = useToast();

  const handleRecoverData = () => {
    const recovered = recoverFromBackup();
    if (recovered) {
      toast({
        title: "Data recovered",
        description: "Your batches have been restored from backup.",
      });
    } else {
      toast({
        title: "No backup found",
        description: "No backup data was found to recover.",
        variant: "destructive",
      });
    }
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
        <div>
          <Button 
            onClick={handleRecoverData}
            variant="outline"
            size="sm"
            className="text-white/70 border-white/20 hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recover Lost Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardEmptyState;
