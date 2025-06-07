import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical, Edit2, Save, X, Play, Square, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBatchAutomation } from '@/hooks/useBatchAutomation';
import { AutoPromptr } from '@/services/autoPromptr';

interface TextPrompt {
  id: string;
  text: string;
  order: number;
}

interface Batch {
  id: string;
  name: string;
  targetUrl: string;
  description?: string;
  prompts: TextPrompt[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
  createdAt: Date;
  platform?: string;
  settings?: {
    delay: number;
    maxRetries: number;
  };
}

interface Platform {
  id: string;
  name: string;
  type: string;
}

const BatchManager = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [showNewBatchForm, setShowNewBatchForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [newBatch, setNewBatch] = useState({
    name: '',
    targetUrl: '',
    description: '',
    initialPrompt: '',
    platform: '',
    delay: 5000,
    maxRetries: 3
  });
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

  const createBatch = () => {
    if (!newBatch.name.trim() || !newBatch.targetUrl.trim() || !newBatch.initialPrompt.trim()) {
      toast({
        title: "Missing required fields",
        description: "Name, target URL, and at least one prompt are required.",
        variant: "destructive",
      });
      return;
    }

    const batch: Batch = {
      id: crypto.randomUUID(),
      name: newBatch.name,
      targetUrl: newBatch.targetUrl,
      description: newBatch.description,
      prompts: [{
        id: crypto.randomUUID(),
        text: newBatch.initialPrompt,
        order: 0
      }],
      status: 'pending',
      createdAt: new Date(),
      platform: newBatch.platform,
      settings: {
        delay: newBatch.delay,
        maxRetries: newBatch.maxRetries
      }
    };

    setBatches([...batches, batch]);
    setNewBatch({ 
      name: '', 
      targetUrl: '', 
      description: '', 
      initialPrompt: '', 
      platform: '', 
      delay: 5000, 
      maxRetries: 3 
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'stopped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Create New Batch</CardTitle>
            <CardDescription>Enter batch details, platform, and initial prompt for automation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch-name">Batch Name *</Label>
                <Input
                  id="batch-name"
                  value={newBatch.name}
                  onChange={(e) => setNewBatch({...newBatch, name: e.target.value})}
                  placeholder="Enter batch name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-url">Target URL *</Label>
                <Input
                  id="target-url"
                  value={newBatch.targetUrl}
                  onChange={(e) => setNewBatch({...newBatch, targetUrl: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Automation Platform</Label>
                <Select 
                  value={newBatch.platform} 
                  onValueChange={(value) => setNewBatch({...newBatch, platform: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform..." />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map(platform => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="delay">Delay (ms)</Label>
                <Input
                  id="delay"
                  type="number"
                  value={newBatch.delay}
                  onChange={(e) => setNewBatch({...newBatch, delay: parseInt(e.target.value)})}
                  min="1000"
                  max="60000"
                  step="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retries">Max Retries</Label>
                <Input
                  id="retries"
                  type="number"
                  value={newBatch.maxRetries}
                  onChange={(e) => setNewBatch({...newBatch, maxRetries: parseInt(e.target.value)})}
                  min="1"
                  max="10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={newBatch.description}
                onChange={(e) => setNewBatch({...newBatch, description: e.target.value})}
                placeholder="Brief description of this batch"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initial-prompt">Initial Text Prompt *</Label>
              <Textarea
                id="initial-prompt"
                value={newBatch.initialPrompt}
                onChange={(e) => setNewBatch({...newBatch, initialPrompt: e.target.value})}
                placeholder="Enter your first prompt for this batch"
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={createBatch} className="bg-green-600 hover:bg-green-700">
                Create Batch
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowNewBatchForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
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
            <Card key={batch.id} className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    <div>
                      <CardTitle className="text-lg">{batch.name}</CardTitle>
                      <CardDescription>
                        Target: {batch.targetUrl} • {batch.prompts.length} prompt(s)
                        {batch.platform && ` • Platform: ${platforms.find(p => p.id === batch.platform)?.name || batch.platform}`}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                      {batch.status}
                    </span>
                    
                    {batch.platform && batch.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRunBatch(batch)}
                        disabled={automationLoading}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {batch.status === 'running' && selectedBatchId === batch.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStopBatch(batch)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBatch(batch.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress display for running batches */}
                {selectedBatchId === batch.id && batchStatus && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Automation Progress</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {batchStatus.progress.completed}/{batchStatus.progress.total}</span>
                        <span>{batchStatus.progress.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{width: `${batchStatus.progress.percentage}%`}}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>✓ {batchStatus.progress.completed} completed</span>
                        {batchStatus.progress.failed > 0 && <span>✗ {batchStatus.progress.failed} failed</span>}
                        {batchStatus.progress.processing > 0 && <span>⟳ {batchStatus.progress.processing} processing</span>}
                        <span>⏳ {batchStatus.progress.pending} pending</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Text Prompts:</h4>
                  {batch.prompts.map((prompt, index) => (
                    <div key={prompt.id} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-move mt-1" />
                      <div className="flex-1">
                        {editingPrompt === prompt.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={prompt.text}
                              onChange={(e) => updatePrompt(batch.id, prompt.id, e.target.value)}
                              rows={2}
                              className="w-full"
                            />
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => setEditingPrompt(null)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingPrompt(null)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="group">
                            <p className="text-sm text-gray-700">{prompt.text || 'Empty prompt - click to edit'}</p>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingPrompt(prompt.id)}
                                disabled={batch.status === 'running'}
                              >
                                <Edit2 className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deletePrompt(batch.id, prompt.id)}
                                className="text-red-600 hover:text-red-700"
                                disabled={batch.status === 'running'}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addPromptToBatch(batch.id)}
                    className="w-full"
                    disabled={batch.status === 'running'}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Prompt
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BatchManager;
