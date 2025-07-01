
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit2, Trash2, Play, Square, Pause, Rewind, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Batch } from '@/types/batch';
import BatchStatusControls from './BatchStatusControls';
import { useBatchStatusManager } from '@/hooks/useBatchStatusManager';

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
  const { markBatchAsFailed, resetBatchStatus, isUpdating } = useBatchStatusManager();

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

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="space-y-4">
      {batches.map((batch) => (
        <Card key={batch.id} className="bg-white/5 border-white/10 hover:bg-white/8 transition-all duration-300">
          <CardContent className="p-6">
            <div className="space-y-5">
              {/* Header Section with improved spacing */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Title and Status Row */}
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-semibold text-lg truncate">{batch.name}</h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`w-3 h-3 rounded-full ${getStatusColor(batch.status)} flex-shrink-0`} />
                      <span className="text-white/80 text-sm font-medium whitespace-nowrap">
                        {getStatusText(batch.status)}
                      </span>
                      {batch.status === 'failed' && (
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  
                  {/* URL Section with better formatting */}
                  <div className="flex items-center gap-2 text-white/70">
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-mono bg-white/10 px-2 py-1 rounded">
                      {formatUrl(batch.targetUrl)}
                    </span>
                  </div>
                  
                  {/* Metadata Section with improved layout */}
                  <div className="flex items-center gap-4 text-white/60 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{batch.prompts.length}</span>
                      <span>prompt{batch.prompts.length !== 1 ? 's' : ''}</span>
                    </div>
                    {batch.platform && (
                      <>
                        <span className="text-white/30">•</span>
                        <div className="flex items-center gap-1">
                          <span>Platform:</span>
                          <span className="text-blue-300 font-medium capitalize">{batch.platform}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Error Message Display with better styling */}
                  {batch.status === 'failed' && (batch as any).errorMessage && (
                    <div className="mt-3 p-3 bg-red-500/15 border border-red-500/25 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-red-300 text-sm leading-relaxed">{(batch as any).errorMessage}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Control Buttons with improved grouping */}
                <div className="flex items-start gap-3 flex-shrink-0">
                  {/* Play Controls Group */}
                  <div className="flex items-center bg-white/8 rounded-xl p-1.5 gap-1">
                    {/* Rewind Button */}
                    {(['paused', 'completed', 'failed', 'stopped'].includes(batch.status)) && onRewind && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRewind(batch)}
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/20 h-9 w-9 p-0 rounded-lg transition-all duration-200"
                        title="Rewind to start"
                      >
                        <Rewind className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Play/Resume Button */}
                    {(batch.status === 'pending' || batch.status === 'paused') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRun(batch)}
                        disabled={automationLoading}
                        className="text-green-400 hover:text-green-300 hover:bg-green-400/20 disabled:opacity-50 h-9 w-9 p-0 rounded-lg transition-all duration-200"
                        title={batch.status === 'paused' ? 'Resume batch' : 'Start batch'}
                      >
                        {automationLoading && selectedBatchId === batch.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    )}

                    {/* Pause Button */}
                    {batch.status === 'running' && selectedBatchId === batch.id && onPause && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPause(batch)}
                        className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/20 h-9 w-9 p-0 rounded-lg transition-all duration-200"
                        title="Pause batch"
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Stop Button */}
                    {batch.status === 'running' && selectedBatchId === batch.id && onStop && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStop(batch)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/20 h-9 w-9 p-0 rounded-lg transition-all duration-200"
                        title="Stop batch"
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Status Management Controls */}
                  <BatchStatusControls
                    batch={batch}
                    onMarkAsFailed={markBatchAsFailed}
                    onReset={resetBatchStatus}
                    isUpdating={isUpdating}
                  />
                  
                  {/* Edit and Delete Controls */}
                  <div className="flex items-center bg-white/8 rounded-xl p-1.5 gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(batch)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/20 h-9 w-9 p-0 rounded-lg transition-all duration-200"
                      title="Edit batch"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/20 h-9 w-9 p-0 rounded-lg transition-all duration-200"
                          title="Delete batch"
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

              {/* Processing Status - Improved styling */}
              {batch.status === 'running' && selectedBatchId === batch.id && (
                <div className="bg-blue-500/15 border border-blue-500/25 rounded-xl p-4">
                  <div className="flex items-center gap-3 text-blue-300 mb-3">
                    <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                    <span className="font-medium">Processing prompts...</span>
                  </div>
                </div>
              )}

              {/* Batch Startup Progress - Enhanced styling */}
              {automationLoading && selectedBatchId === batch.id && batch.status === 'pending' && (
                <div className="bg-blue-500/15 border border-blue-500/25 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
                    <span className="text-blue-300 font-semibold">Starting batch automation...</span>
                  </div>
                  <Progress value={75} className="h-2.5 bg-blue-900/30 mb-3" />
                  <div className="text-blue-300/80 text-sm leading-relaxed">
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
