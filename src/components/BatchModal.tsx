
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {editingBatch ? 'Edit Batch' : 'Create New Batch'}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batch-name">Batch Name *</Label>
                <Input
                  id="batch-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter batch name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-url">Project Target URL *</Label>
                <Input
                  id="target-url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Text Prompts *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPrompt}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Prompt
                  </Button>
                </div>

                <div className="space-y-2">
                  {prompts.map((prompt, index) => (
                    <div
                      key={prompt.id}
                      className="flex items-start space-x-2 p-3 border rounded-lg bg-gray-50"
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move mt-2" />
                      <div className="flex-1">
                        <Textarea
                          value={prompt.text}
                          onChange={(e) => handlePromptChange(prompt.id, e.target.value)}
                          placeholder={`Prompt ${index + 1}`}
                          rows={2}
                          className="w-full"
                        />
                      </div>
                      {prompts.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePrompt(prompt.id)}
                          className="text-red-600 hover:text-red-700"
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

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!isValid}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Batch
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletePromptId} onOpenChange={() => setDeletePromptId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Prompt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this prompt? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemovePrompt}
              className="bg-red-600 hover:bg-red-700"
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
