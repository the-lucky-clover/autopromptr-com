
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Batch } from '@/types/batch';

interface BatchStatusControlsProps {
  batch: Batch;
  onMarkAsFailed: (batchId: string) => void;
  onReset: (batchId: string) => void;
  isUpdating: boolean;
}

const BatchStatusControls = ({ batch, onMarkAsFailed, onReset, isUpdating }: BatchStatusControlsProps) => {
  const canMarkAsFailed = batch.status === 'pending' || batch.status === 'running';
  const canReset = batch.status === 'failed' || batch.status === 'completed';

  return (
    <div className="flex items-center space-x-1">
      {canMarkAsFailed && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/20 h-8 w-8 p-0"
              title="Mark as Failed"
              disabled={isUpdating}
            >
              <AlertTriangle className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Mark Batch as Failed</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                Are you sure you want to mark "{batch.name}" as failed? This will stop any ongoing processing and flag it as a failed batch.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onMarkAsFailed(batch.id)}
                className="bg-orange-600/80 hover:bg-orange-700/90 text-white rounded-xl backdrop-blur-sm"
              >
                Mark as Failed
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {canReset && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/20 h-8 w-8 p-0"
              title="Reset Status"
              disabled={isUpdating}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Reset Batch Status</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                Are you sure you want to reset "{batch.name}" back to pending status? This will allow you to run the batch again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onReset(batch.id)}
                className="bg-blue-600/80 hover:bg-blue-700/90 text-white rounded-xl backdrop-blur-sm"
              >
                Reset Status
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default BatchStatusControls;
