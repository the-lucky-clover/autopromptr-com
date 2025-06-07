import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBatchAutomation } from '@/hooks/useBatchAutomation';
import { AutoPromptr } from '@/services/autoPromptr';
import { Batch, Platform, BatchFormData, TextPrompt } from '@/types/batch';
import BatchForm from './BatchForm';
import BatchCard from './BatchCard';

const BatchManager = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [showNewBatchForm, setShowNewBatchForm] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const { toast } = useToast();
  const { status: batchStatus, loading: automationLoading, error: automationError, runBatch, stopBatch } = useBatchAutomation(selectedBatchId || undefined);

  // Load platforms on component mount
  useEffect(() => {
    const autoPromptr = new AutoPromptr();
    autoPromptr.getPlatforms()
      .then((data) => {
        setPlatforms(data.filter((p: Platform) => p.type === 'web'));
      })
      .catch((err) => {
        console.error('Failed to load platforms:', err);
        toast({
          title: "Warning",
          description: "Failed to load automation platforms. Manual batch creation is still available.",
          variant: "destructive",
        });
      });
  }, [toast]);

  // Update batch status when automation status changes
  useEffect(() => {
    if (selectedBatchId && batchStatus) {
      setBatches(prev => prev.map(batch => {
        if (batch.id === selectedBatchId) {
          return {
            ...batch,
            status: batchStatus.status === 'processing' ? 'running' : 
                   batchStatus.status === 'completed' ? 'completed' :
                   batchStatus.status === 'failed' ? 'failed' :
                   batchStatus.status === 'stopped' ? 'failed' : 'pending'
          };
        }
        return batch;
      }));
    }
  }, [selectedBatchId, batchStatus]);

  const createBatch = (formData: BatchFormData) => {
    const batch: Batch = {
      id: crypto.randomUUID(),
      name: formData.name,
      targetUrl: formData.targetUrl,
      description: formData.description,
      prompts: [{
        id: crypto.randomUUID(),
        text: formData.initialPrompt,
        order: 0
      }],
      status: 'pending',
      createdAt: new Date(),
      platform: formData.platform,
      settings: {
        delay: formData.delay,
        maxRetries: formData.maxRetries
      }
    };

    setBatches([...batches, batch]);
    setShowNewBatchForm(false);
    
    toast({
      title: "Batch created",
      description: `Batch "${batch.name}" has been created successfully.`,
    });
  };

  const deleteBatch = (batchId: string) => {
    setBatches(batches.filter(b => b.id !== batchId));
    if (selectedBatchId === batchId) {
      setSelectedBatchId(null);
    }
    toast({
      title: "Batch deleted",
      description: "Batch has been removed from the queue.",
    });
  };

  const handleRunBatch = async (batch: Batch) => {
    if (!batch.platform) {
      toast({
        title: "No platform selected",
        description: "Please edit the batch and select an automation platform.",
        variant: "destructive",
      });
      return;
    }

    setSelectedBatchId(batch.id);
    
    try {
      await runBatch(batch.platform, batch.settings);
      
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'running' } : b
      ));
      
      toast({
        title: "Batch started",
        description: `Automation started for "${batch.name}".`,
      });
    } catch (err) {
      toast({
        title: "Failed to start batch",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const handleStopBatch = async (batch: Batch) => {
    try {
      await stopBatch();
      
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { ...b, status: 'failed' } : b
      ));
      
      toast({
        title: "Batch stopped",
        description: `Automation stopped for "${batch.name}".`,
      });
    } catch (err) {
      toast({
        title: "Failed to stop batch",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const addPromptToBatch = (batchId: string) => {
    setBatches(batches.map(batch => {
      if (batch.id === batchId) {
        const newPrompt: TextPrompt = {
          id: crypto.randomUUID(),
          text: '',
          order: batch.prompts.length
        };
        return {
          ...batch,
          prompts: [...batch.prompts, newPrompt]
        };
      }
      return batch;
    }));
  };

  const updatePrompt = (batchId: string, promptId: string, text: string) => {
    setBatches(batches.map(batch => {
      if (batch.id === batchId) {
        return {
          ...batch,
          prompts: batch.prompts.map(prompt => 
            prompt.id === promptId ? { ...prompt, text } : prompt
          )
        };
      }
      return batch;
    }));
  };

  const deletePrompt = (batchId: string, promptId: string) => {
    setBatches(batches.map(batch => {
      if (batch.id === batchId) {
        return {
          ...batch,
          prompts: batch.prompts.filter(p => p.id !== promptId)
        };
      }
      return batch;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Batch Queue Manager</h2>
          <p className="text-gray-600">Create and manage automated batch requests with target URLs and prompts.</p>
        </div>
        <Button 
          onClick={() => setShowNewBatchForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Batch
        </Button>
      </div>

      {automationError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <p className="text-red-800">Automation Error: {automationError}</p>
          </CardContent>
        </Card>
      )}

      {showNewBatchForm && (
        <BatchForm
          onSubmit={createBatch}
          onCancel={() => setShowNewBatchForm(false)}
        />
      )}

      <div className="space-y-4">
        {batches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No batches created yet. Click "New Batch" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          batches.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              platforms={platforms}
              batchStatus={selectedBatchId === batch.id ? batchStatus : null}
              selectedBatchId={selectedBatchId}
              automationLoading={automationLoading}
              onRun={handleRunBatch}
              onStop={handleStopBatch}
              onDelete={deleteBatch}
              onUpdatePrompt={updatePrompt}
              onDeletePrompt={deletePrompt}
              onAddPrompt={addPromptToBatch}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default BatchManager;
