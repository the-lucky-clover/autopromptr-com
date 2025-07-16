
import { useState } from 'react';
import { Plus, Play, Pause, Square, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EnhancedBatchForm } from './batch/EnhancedBatchForm';
import { useDashboardBatchManager } from '@/hooks/useDashboardBatchManager';

export const DashboardBatchManager = () => {
  const [showBatchForm, setShowBatchForm] = useState(false);
  const { 
    batches, 
    runBatch, 
    stopBatch, 
    pauseBatch, 
    rewindBatch, 
    deleteBatch,
    createBatch 
  } = useDashboardBatchManager();

  const handleCreateBatch = async (batchData: any) => {
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

      await createBatch(enhancedBatchData);
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
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Batch Manager</CardTitle>
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
                onSubmit={handleCreateBatch}
                onCancel={() => setShowBatchForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
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
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex-1">
                  <h3 className="text-white font-medium">{batch.name}</h3>
                  <p className="text-gray-400 text-sm">{batch.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="text-gray-500">Platform: {batch.platform}</span>
                    <span className={`${getStatusColor(batch.status)} capitalize`}>
                      {batch.status}
                    </span>
                    {batch.settings?.enhancedPrompting && (
                      <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full">
                        Enhanced AI
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {batch.status === 'idle' && (
                    <Button
                      size="sm"
                      onClick={() => runBatch(batch.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {batch.status === 'running' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => pauseBatch(batch.id)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => stopBatch(batch.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  
                  {batch.status === 'paused' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => runBatch(batch.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => rewindBatch(batch.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteBatch(batch.id)}
                    className="border-red-400/50 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
