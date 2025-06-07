
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Minus, GripVertical } from 'lucide-react';
import { Batch, TextPrompt } from '@/types/batch';

interface BatchModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (batch: Batch | Omit<Batch, 'id' | 'createdAt'>) => void;
  editingBatch?: Batch | null;
}

const BatchModal = ({ open, onClose, onSave, editingBatch }: BatchModalProps) => {
  const [name, setName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [prompts, setPrompts] = useState<TextPrompt[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null);

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

  const handleSave = () => {
    if (!name.trim() || !targetUrl.trim() || prompts.some(p => !p.text.trim())) {
      return; // Don't save if required fields are empty
    }

    const batchData = {
      name: name.trim(),
      targetUrl: targetUrl.trim(),
      prompts: prompts.filter(p => p.text.trim()),
      status: 'pending' as const,
      description: ''
    };

    if (editingBatch) {
      onSave({
        ...editingBatch,
        ...batchData
      });
    } else {
      onSave(batchData);
    }
  };

  const isValid = name.trim() && targetUrl.trim() && prompts.some(p => p.text.trim());

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] rounded-2xl bg-white border border-gray-200 shadow-2xl">
          <DialogHeader className="text-left pb-4">
            <DialogTitle className="text-2xl font-semibold text-left text-gray-900">
              {editingBatch ? 'Edit Batch' : 'Create New Batch'}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[65vh] pr-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <Input
                  id="batch-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a descriptive name for your batch (e.g., 'Product Research Q4 2024')"
                  className="text-base rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Input
                  id="target-url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="Enter your project URL where prompts will be executed (e.g., https://chat.openai.com)"
                  className="text-base rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
                    className="rounded-xl border-gray-200 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Prompt
                  </Button>
                </div>

                <div className="space-y-3">
                  {prompts.map((prompt, index) => (
                    <div
                      key={prompt.id}
                      className="flex items-start space-x-3 p-4 border border-gray-200 rounded-xl bg-gray-50/50"
                      draggable
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
                          rows={3}
                          className="w-full text-base rounded-xl bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      {prompts.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePrompt(prompt.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} className="rounded-xl border-gray-200 hover:bg-gray-50">
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!isValid}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50"
            >
              Save Batch
            </Button>
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
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BatchModal;
