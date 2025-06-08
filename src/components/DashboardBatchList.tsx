
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit2, Trash2, Play, Square, Pause, Rewind, Loader2 } from 'lucide-react';
import { Batch } from '@/types/batch';

interface DashboardBatchListProps {
  batches: Batch[];
  onEdit: (batch: Batch) => void;
  onDelete: (batchId: string) => void;
  onRun: (batch: Batch) => void;
  onStop?: (batch: Batch) => void;
  onPause?: (batch: Batch) => void;
  onRewind?: (batch: Batch) => void;
  selectedBatchId?: string | null;
  automationLoading?: boolean;
}

const DashboardBatchList = ({ 
  batches, 
  onEdit, 
  onDelete, 
  onRun, 
  onStop, 
  onPause,
  onRewind,
  selectedBatchId, 
  automationLoading 
}: DashboardBatchListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'running': return 'bg-blue-500 animate-pulse';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'paused': return 'bg-orange-500';
      case 'stopped': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'running': return 'Processing...';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      case 'paused': return 'Paused';
      case 'stopped': return 'Stopped';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-3">
      {batches.map((batch) => (
        <Card key={batch.id} className="bg-white/5 border-white/10">
          <CardContent className="p-3 md:p-4">
            <div className="space-y-3">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-white font-medium truncate">{batch.name}</h4>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(batch.status)}`} />
                      <span className="text-white/70 text-xs whitespace-nowrap">{getStatusText(batch.status)}</span>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm truncate">{batch.targetUrl}</p>
                  <p className="text-white/50 text-xs">
                    {batch.prompts.length} prompt{batch.prompts.length !== 1 ? 's' : ''}
                    {batch.platform && ` • Platform: ${batch.platform}`}
                  </p>
                </div>
                
                {/* Control Buttons - Horizontal on mobile, grouped on desktop */}
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  {/* Play Controls */}
                  <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1">
                    {/* Play Button - Show for pending and paused batches */}
                    {(batch.status === 'pending' || batch.status === 'paused') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRun(batch)}
                        disabled={automationLoading}
                        className="text-green-400 hover:text-green-300 hover:bg-green-400/20 disabled:opacity-50 h-8 w-8 p-0"
                        title={batch.status === 'paused' ? 'Resume' : 'Play'}
                      >
                        {automationLoading && selectedBatchId === batch.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    )}

                    {/* Pause Button - Show for running batches */}
                    {batch.status === 'running' && selectedBatchId === batch.id && onPause && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPause(batch)}
                        className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/20 h-8 w-8 p-0"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Stop Button - Show for running batches */}
                    {batch.status === 'running' && selectedBatchId === batch.id && onStop && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStop(batch)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/20 h-8 w-8 p-0"
                        title="Stop"
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Rewind Button - Show for completed, failed, stopped, and paused batches */}
                    {(['paused', 'completed', 'failed', 'stopped'].includes(batch.status)) && onRewind && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRewind(batch)}
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/20 h-8 w-8 p-0"
                        title="Rewind"
                      >
                        <Rewind className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Edit and Delete Controls */}
                  <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(batch)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/20 h-8 w-8 p-0"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/20 h-8 w-8 p-0"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Delete Batch</AlertDialogTitle>
                          <AlertDialogDescription className="text-white/70">
                            Are you sure you want to delete "{batch.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDelete(batch.id)}
                            className="bg-red-600/80 hover:bg-red-700/90 text-white rounded-xl backdrop-blur-sm"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>

              {/* Processing Status - Full width, no clipping */}
              {batch.status === 'running' && selectedBatchId === batch.id && (
                <div className="w-full">
                  <div className="flex items-center space-x-2 text-blue-400 mb-2">
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    <span className="text-sm font-medium">Processing prompts...</span>
                  </div>
                </div>
              )}

              {/* Batch Startup Progress Bar */}
              {automationLoading && selectedBatchId === batch.id && batch.status === 'pending' && (
                <div className="w-full p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <div className="flex items-center space-x-3 mb-2">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
                    <span className="text-blue-300 font-medium text-sm">Starting batch automation...</span>
                  </div>
                  <Progress value={75} className="h-2 bg-blue-900/30" />
                  <div className="text-blue-300/80 text-xs mt-2">
                    Initializing automation engine and preparing prompts for execution
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardBatchList;
