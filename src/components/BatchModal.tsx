
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Minus, GripVertical, Save } from 'lucide-react';
import { Batch, TextPrompt } from '@/types/batch';

interface BatchModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (batch: Batch | Omit<Batch, 'id' | 'createdAt'>) => Promise<void> | void;
  editingBatch?: Batch | null;
}

const BatchModal = ({ open, onClose, onSave, editingBatch }: BatchModalProps) => {
  const [name, setName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [prompts, setPrompts] = useState<TextPrompt[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);

  useEffect(() => {
    if (editingBatch) {
      setName(editingBatch.name);
      setTargetUrl(editingBatch.targetUrl);
      setPrompts(editingBatch.prompts);
    } else {
      setName('');
      setTargetUrl('');
      setPrompts([{ id: crypto.randomUUID(), text: '', order: 0 }]);
    }
  }, [editingBatch, open]);

  const handleAddPrompt = () => {
    const newPrompt: TextPrompt = {
      id: crypto.randomUUID(),
      text: '',
      order: prompts.length
    };
    setPrompts([...prompts, newPrompt]);
  };

  const handleRemovePrompt = (promptId: string) => {
    if (prompts.length === 1) return; // Don't allow removing the last prompt
    setDeletePromptId(promptId);
  };

  const confirmRemovePrompt = () => {
    if (deletePromptId) {
      setPrompts(prompts.filter(p => p.id !== deletePromptId));
      setDeletePromptId(null);
    }
  };

  const handlePromptChange = (promptId: string, text: string) => {
    setPrompts(prompts.map(p => 
      p.id === promptId ? { ...p, text } : p
    ));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null) return;
    
    const newPrompts = [...prompts];
    const draggedPrompt = newPrompts[draggedIndex];
    newPrompts.splice(draggedIndex, 1);
    newPrompts.splice(dropIndex, 0, draggedPrompt);
    
    // Update order indices
    const reorderedPrompts = newPrompts.map((prompt, index) => ({
      ...prompt,
      order: index
    }));
    
    setPrompts(reorderedPrompts);
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    if (!name.trim() || !targetUrl.trim() || prompts.some(p => !p.text.trim())) {
      return; // Don't save if required fields are empty
    }

    setIsSaving(true);
    setSaveProgress(0);

    // Simulate progress steps
    const progressSteps = [
      { step: 20, delay: 100, message: 'Validating batch data...' },
      { step: 40, delay: 200, message: 'Preparing prompts...' },
      { step: 60, delay: 150, message: 'Saving to database...' },
      { step: 80, delay: 200, message: 'Finalizing...' },
      { step: 100, delay: 100, message: 'Complete!' }
    ];

    try {
      // Animate progress
      for (const { step, delay } of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, delay));
        setSaveProgress(step);
      }

      const batchData = {
        name: name.trim(),
        targetUrl: targetUrl.trim(),
        prompts: prompts.filter(p => p.text.trim()),
        status: 'pending' as const,
        description: ''
      };

      if (editingBatch) {
        await onSave({
          ...editingBatch,
          ...batchData
        });
      } else {
        await onSave(batchData);
      }

      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error saving batch:', error);
    } finally {
      setIsSaving(false);
      setSaveProgress(0);
    }
  };

  const isValid = name.trim() && targetUrl.trim() && prompts.some(p => p.text.trim());

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl h-[95vh] max-h-[95vh] md:h-auto md:max-h-[85vh] rounded-3xl bg-white border-2 border-gray-300 shadow-2xl flex flex-col p-0">
          <DialogHeader className="text-left p-6 pb-4 flex-shrink-0">
            <DialogTitle className="text-2xl font-semibold text-left text-gray-900">
              {editingBatch ? 'Edit Batch' : 'Create New Batch'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 px-6">
              <div className="pb-6">
                {isSaving && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Save className="w-5 h-5 text-blue-600 animate-pulse" />
                      <span className="text-blue-900 font-medium">Saving batch...</span>
                    </div>
                    <Progress value={saveProgress} className="h-2" />
                    <div className="text-sm text-blue-700 mt-2">
                      {saveProgress < 20 && "Validating batch data..."}
                      {saveProgress >= 20 && saveProgress < 40 && "Preparing prompts..."}
                      {saveProgress >= 40 && saveProgress < 60 && "Saving to database..."}
                      {saveProgress >= 60 && saveProgress < 80 && "Finalizing..."}
                      {saveProgress >= 80 && saveProgress < 100 && "Almost done..."}
                      {saveProgress === 100 && "Complete!"}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Input
                      id="batch-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter a descriptive name for your batch (e.g., 'Product Research Q4 2024')"
                      className="text-base h-12 md:h-10 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      id="target-url"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="Enter your project URL where prompts will be executed (e.g., https://chat.openai.com)"
                      className="text-base h-12 md:h-10 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Prompts</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddPrompt}
                        className="h-10 md:h-8 rounded-xl border-gray-200 hover:bg-gray-50"
                        disabled={isSaving}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Prompt
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {prompts.map((prompt, index) => (
                        <div
                          key={prompt.id}
                          className="flex items-start space-x-3 p-4 border border-gray-200 rounded-xl bg-gray-50/50"
                          draggable={!isSaving}
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                        >
                          <GripVertical className="w-5 h-5 text-gray-400 cursor-move mt-3" />
                          <div className="flex-1">
                            <Textarea
                              value={prompt.text}
                              onChange={(e) => handlePromptChange(prompt.id, e.target.value)}
                              placeholder={`Enter your prompt here (e.g., "Analyze the following data and provide insights about customer behavior patterns")`}
                              rows={4}
                              className="w-full text-base min-h-[100px] rounded-xl bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                              disabled={isSaving}
                            />
                          </div>
                          {prompts.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePrompt(prompt.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl h-10 w-10 p-0 mt-2"
                              disabled={isSaving}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Mobile-optimized sticky footer */}
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200 bg-white rounded-b-3xl">
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  className="h-12 sm:h-10 rounded-xl border-gray-200 hover:bg-gray-50 order-2 sm:order-1"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!isValid || isSaving}
                  className="h-12 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 min-w-[120px] order-1 sm:order-2"
                >
                  {isSaving ? (
                    <div className="flex items-center space-x-2">
                      <Save className="w-4 h-4 animate-pulse" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Batch'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletePromptId} onOpenChange={() => setDeletePromptId(null)}>
        <AlertDialogContent className="rounded-xl bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Prompt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this prompt? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemovePrompt}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogFooter>
      </Dialog>
    </>
  );
};

export default BatchModal;
