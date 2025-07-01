
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Batch, TextPrompt } from "@/types/batch";
import BatchFormFields from './batch/BatchFormFields';
import BatchPromptsManager from './batch/BatchPromptsManager';
import BatchSettings from './batch/BatchSettings';
import { detectPathType, validateBatchForm } from './batch/BatchValidation';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch?: Batch | null;
  onSave: (batch: Omit<Batch, 'id' | 'createdAt'>) => void;
}

export default function BatchModal({ isOpen, onClose, batch, onSave }: BatchModalProps) {
  const [formData, setFormData] = useState({
    name: batch?.name || '',
    targetProjectUrl: batch?.targetUrl || '',
    description: batch?.description || '',
    waitForIdle: batch?.settings?.waitForIdle ?? true,
    maxRetries: batch?.settings?.maxRetries || 3,
    localAIAssistant: batch?.settings?.localAIAssistant || 'cursor' as const,
  });

  const [prompts, setPrompts] = useState<TextPrompt[]>(
    batch?.prompts || [{ id: '1', text: '', order: 0 }]
  );
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const pathType = detectPathType(formData.targetProjectUrl);
  const isLocalPath = pathType === 'local';

  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name,
        targetProjectUrl: batch.targetUrl,
        description: batch.description || '',
        waitForIdle: batch.settings?.waitForIdle ?? true,
        maxRetries: batch.settings?.maxRetries || 3,
        localAIAssistant: batch.settings?.localAIAssistant || 'cursor',
      });
      setPrompts(batch.prompts);
    } else {
      // Reset form data when creating a new batch
      setFormData({
        name: '',
        targetProjectUrl: '',
        description: '',
        waitForIdle: true,
        maxRetries: 3,
        localAIAssistant: 'cursor',
      });
      setPrompts([{ id: '1', text: '', order: 0 }]);
      setErrors({});
    }
  }, [batch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear related errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addPrompt = () => {
    if (prompts.length >= 50) {
      setErrors(prev => ({...prev, prompts: 'Maximum 50 prompts allowed per batch'}));
      return;
    }

    const newPrompt: TextPrompt = {
      id: Date.now().toString(),
      text: '',
      order: prompts.length
    };
    setPrompts([...prompts, newPrompt]);
    setErrors(prev => ({...prev, prompts: ''}));
  };

  const updatePrompt = (id: string, text: string) => {
    setPrompts(prompts.map(prompt =>
      prompt.id === id ? { ...prompt, text } : prompt
    ));
    // Clear errors when user starts typing
    if (text.trim() !== '') {
      setErrors(prev => ({...prev, prompts: ''}));
    }
  };

  const removePrompt = (id: string) => {
    if (prompts.length > 1) {
      setPrompts(prompts.filter(prompt => prompt.id !== id));
      setErrors(prev => ({...prev, prompts: ''}));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateBatchForm(formData, prompts);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Filter out empty prompts before saving
    const validPrompts = prompts.filter(prompt => prompt.text.trim() !== '');

    const batchData = {
      name: formData.name,
      targetUrl: formData.targetProjectUrl,
      description: formData.description,
      prompts: validPrompts.map((prompt, index) => ({
        ...prompt,
        order: index
      })),
      status: 'pending' as const,
      platform: isLocalPath ? 'local' : 'web',
      settings: {
        waitForIdle: formData.waitForIdle,
        maxRetries: parseInt(String(formData.maxRetries), 10),
        automationDelay: 1000,
        elementTimeout: 30000,
        debugLevel: 'standard' as const,
        isLocalPath,
        localAIAssistant: isLocalPath ? formData.localAIAssistant : undefined,
      },
    };

    onSave(batchData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-xl border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {batch ? 'Edit Batch' : 'Create New Batch'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <BatchFormFields
            formData={formData}
            errors={errors}
            pathType={pathType}
            isLocalPath={isLocalPath}
            onInputChange={handleInputChange}
            onLocalAIChange={(value) => setFormData(prev => ({ ...prev, localAIAssistant: value }))}
          />

          <BatchPromptsManager
            prompts={prompts}
            errors={errors}
            onAddPrompt={addPrompt}
            onUpdatePrompt={updatePrompt}
            onRemovePrompt={removePrompt}
          />

          <BatchSettings
            formData={formData}
            onInputChange={handleInputChange}
            onWaitForIdleChange={(checked) => setFormData(prev => ({ ...prev, waitForIdle: !!checked }))}
          />

          <div className="flex justify-end">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              {batch ? 'Update Batch' : 'Create Batch'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
