
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, Edit2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
}

const BatchManager = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showNewBatchForm, setShowNewBatchForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [newBatch, setNewBatch] = useState({
    name: '',
    targetUrl: '',
    description: '',
    initialPrompt: ''
  });
  const { toast } = useToast();

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
      createdAt: new Date()
    };

    setBatches([...batches, batch]);
    setNewBatch({ name: '', targetUrl: '', description: '', initialPrompt: '' });
    setShowNewBatchForm(false);
    
    toast({
      title: "Batch created",
      description: `Batch "${batch.name}" has been created successfully.`,
    });
  };

  const deleteBatch = (batchId: string) => {
    setBatches(batches.filter(b => b.id !== batchId));
    toast({
      title: "Batch deleted",
      description: "Batch has been removed from the queue.",
    });
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
          <p className="text-gray-600">Create and manage batch requests with target URLs and prompts.</p>
        </div>
        <Button 
          onClick={() => setShowNewBatchForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Batch
        </Button>
      </div>

      {showNewBatchForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Create New Batch</CardTitle>
            <CardDescription>Enter batch details and initial prompt</CardDescription>
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
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      batch.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      batch.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      batch.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {batch.status}
                    </span>
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
                              >
                                <Edit2 className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deletePrompt(batch.id, prompt.id)}
                                className="text-red-600 hover:text-red-700"
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
