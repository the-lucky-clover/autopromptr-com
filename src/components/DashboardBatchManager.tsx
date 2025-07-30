
import { useState } from 'react';
import { Plus, Play, Pause, Square, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EnhancedBatchForm } from './batch/EnhancedBatchForm';
import { useDashboardBatchManager } from '@/hooks/useDashboardBatchManager';
import BatchConnectionTester from './BatchConnectionTester';

interface DashboardBatchManagerProps {
  onStatsUpdate?: (stats: any) => void;
  onBatchesUpdate?: (batches: any[]) => void;
  isCompact?: boolean;
  onNewBatchRequest?: () => void;
}

export const DashboardBatchManager = ({ 
  onStatsUpdate, 
  onBatchesUpdate, 
  isCompact = false, 
  onNewBatchRequest 
}: DashboardBatchManagerProps = {}) => {
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showConnectionTester, setShowConnectionTester] = useState(false);
  const { 
    batches, 
    handleRunBatch, 
    handleStopBatch, 
    handlePauseBatch, 
    handleRewindBatch, 
    handleDeleteBatch,
    handleCreateBatch,
    lastError
  } = useDashboardBatchManager();

  const handleMarkAsFailed = (batch: any) => {
    // Mark batch as failed functionality
    console.log('Marking batch as failed:', batch.id);
  };

  const handleCreateBatchWithEnhancement = async (batchData: any) => {
    try {
      // Enhanced batch creation with project context
      const enhancedBatchData = {
        ...batchData,
        settings: {
          ...batchData.settings,
          projectContext: batchData.isNewProject ? batchData.projectContext : null,
          enhancedPrompting: batchData.isNewProject
        }
      };

      await handleCreateBatch(enhancedBatchData);
      setShowBatchForm(false);
    } catch (error) {
      console.error('Failed to create batch:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Batch Processor</CardTitle>
            <CardDescription className="text-purple-200">
              Create and manage your automation batches
            </CardDescription>
          </div>
          <Dialog open={showBatchForm} onOpenChange={setShowBatchForm}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 border border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Create New Automation Batch</DialogTitle>
              </DialogHeader>
              <EnhancedBatchForm
                onSubmit={handleCreateBatchWithEnhancement}
                onCancel={() => setShowBatchForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {lastError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="text-red-400 text-sm font-medium">Last Error:</div>
            <div className="text-red-300 text-sm">{lastError.message}</div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConnectionTester(true)}
              className="mt-2 border-red-400/50 text-red-400 hover:bg-red-500/20"
            >
              Test Connection
            </Button>
          </div>
        )}

        {showConnectionTester && (
          <div className="mb-4">
            <BatchConnectionTester />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowConnectionTester(false)}
              className="mt-2 text-gray-400"
            >
              Hide Connection Tester
            </Button>
          </div>
        )}

        {batches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No batches created yet</p>
            <Button 
              onClick={() => setShowBatchForm(true)}
              variant="outline"
              className="border-purple-400/50 text-purple-200 hover:bg-purple-500/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Batch
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {batches.map((batch) => (
              <div 
                key={batch.id} 
                className="relative overflow-hidden p-4 bg-white/5 rounded-lg border border-white/10"
              >
                {/* Animated Progress Bar */}
                {batch.status === 'running' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-green-500 animate-pulse">
                    <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[slide-in-right_2s_ease-in-out_infinite]"></div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{batch.name}</h3>
                    <p className="text-gray-400 text-sm">{batch.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-gray-500">Platform: {batch.platform}</span>
                      <span className={`${getStatusColor(batch.status)} capitalize font-medium`}>
                        {batch.status}
                        {batch.status === 'running' && (
                          <span className="ml-2 inline-flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="ml-1 text-green-400">Processing...</span>
                          </span>
                        )}
                      </span>
                      {batch.settings?.promptEnhancement && (
                        <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full">
                          Enhanced AI
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Glossy Skeuomorphic Control Buttons */}
                  <div className="flex items-center gap-3">
                    {/* Play/Pause Button */}
                    {(batch.status === 'pending' || batch.status === 'paused') && (
                      <button
                        onClick={() => handleRunBatch(batch)}
                        className="relative w-10 h-10 rounded-full bg-gradient-to-b from-green-400 to-green-600 shadow-lg border border-green-300/30 hover:from-green-300 hover:to-green-500 active:scale-95 transition-all duration-200 group"
                        title="Run Batch"
                      >
                        <div className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white/20 to-transparent"></div>
                        <div className="absolute inset-0 rounded-full shadow-inner shadow-black/20"></div>
                        <Play className="w-5 h-5 text-white relative z-10 ml-0.5 group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                    {batch.status === 'running' && (
                      <button
                        onClick={() => handlePauseBatch(batch)}
                        className="relative w-10 h-10 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-lg border border-yellow-300/30 hover:from-yellow-300 hover:to-yellow-500 active:scale-95 transition-all duration-200 group"
                        title="Pause Batch"
                      >
                        <div className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white/20 to-transparent"></div>
                        <div className="absolute inset-0 rounded-full shadow-inner shadow-black/20"></div>
                        <Pause className="w-5 h-5 text-white relative z-10 group-hover:scale-110 transition-transform" />
                      </button>
                    )}

                    {/* Stop Button */}
                    {batch.status === 'running' && (
                      <button
                        onClick={() => handleStopBatch(batch)}
                        className="relative w-10 h-10 rounded-full bg-gradient-to-b from-red-400 to-red-600 shadow-lg border border-red-300/30 hover:from-red-300 hover:to-red-500 active:scale-95 transition-all duration-200 group"
                        title="Stop Batch"
                      >
                        <div className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white/20 to-transparent"></div>
                        <div className="absolute inset-0 rounded-full shadow-inner shadow-black/20"></div>
                        <Square className="w-4 h-4 text-white relative z-10 group-hover:scale-110 transition-transform" />
                      </button>
                    )}

                    {/* Rewind Button */}
                    {(batch.status === 'paused' || batch.status === 'completed' || batch.status === 'failed') && (
                      <button
                        onClick={() => handleRewindBatch(batch)}
                        className="relative w-10 h-10 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 shadow-lg border border-blue-300/30 hover:from-blue-300 hover:to-blue-500 active:scale-95 transition-all duration-200 group"
                        title="Rewind Batch"
                      >
                        <div className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white/20 to-transparent"></div>
                        <div className="absolute inset-0 rounded-full shadow-inner shadow-black/20"></div>
                        <RotateCcw className="w-4 h-4 text-white relative z-10 group-hover:scale-110 transition-transform" />
                      </button>
                    )}

                    {/* Mark as Failed Button */}
                    {(batch.status === 'running' || batch.status === 'paused') && (
                      <button
                        onClick={() => handleMarkAsFailed(batch)}
                        className="relative w-10 h-10 rounded-full bg-gradient-to-b from-orange-400 to-orange-600 shadow-lg border border-orange-300/30 hover:from-orange-300 hover:to-orange-500 active:scale-95 transition-all duration-200 group"
                        title="Mark as Failed"
                      >
                        <div className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white/20 to-transparent"></div>
                        <div className="absolute inset-0 rounded-full shadow-inner shadow-black/20"></div>
                        <AlertTriangle className="w-4 h-4 text-white relative z-10 group-hover:scale-110 transition-transform" />
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteBatch(batch.id)}
                      className="relative w-10 h-10 rounded-full bg-gradient-to-b from-gray-400 to-gray-600 shadow-lg border border-gray-300/30 hover:from-red-400 hover:to-red-600 hover:border-red-300/30 active:scale-95 transition-all duration-200 group"
                      title="Delete Batch"
                    >
                      <div className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white/20 to-transparent"></div>
                      <div className="absolute inset-0 rounded-full shadow-inner shadow-black/20"></div>
                      <Trash2 className="w-4 h-4 text-white relative z-10 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardBatchManager;
