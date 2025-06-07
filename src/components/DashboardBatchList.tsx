
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit2, Trash2, Play } from 'lucide-react';
import { Batch } from '@/types/batch';

interface DashboardBatchListProps {
  batches: Batch[];
  onEdit: (batch: Batch) => void;
  onDelete: (batchId: string) => void;
  onRun: (batch: Batch) => void;
}

const DashboardBatchList = ({ batches, onEdit, onDelete, onRun }: DashboardBatchListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-3">
      {batches.map((batch) => (
        <Card key={batch.id} className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="text-white font-medium">{batch.name}</h4>
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(batch.status)}`} />
                </div>
                <p className="text-white/60 text-sm mt-1">{batch.targetUrl}</p>
                <p className="text-white/50 text-xs mt-1">
                  {batch.prompts.length} prompt{batch.prompts.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {batch.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRun(batch)}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(batch)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Batch</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{batch.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDelete(batch.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardBatchList;
