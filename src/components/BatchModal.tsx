
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { Batch, TextPrompt } from '@/types/batch';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (batch: Batch) => Promise<void>;
  batch?: Batch | null;
}

const BatchModal = ({ isOpen, onClose, onSave, batch }: BatchModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    targetUrl: '',
    description: '',
    waitForIdle: true,
    maxRetries: 3
  });

  const [prompts, setPrompts] = useState<TextPrompt[]>([
    { id: crypto.randomUUID(), text: '', order: 0 }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name,
        targetUrl: batch.targetUrl,
        description: batch.description || '',
        waitForIdle: batch.settings?.waitForIdle ?? true,
        maxRetries: batch.settings?.maxRetries ?? 3
      });
      setPrompts(batch.prompts.length > 0 ? batch.prompts : [
        { id: crypto.randomUUID(), text: '', order: 0 }
      ]);
    } else {
      setFormData({
        name: '',
        targetUrl: '',
        description: '',
        waitForIdle: true,
        maxRetries: 3
      });
      setPrompts([{ id: crypto.randomUUID(), text: '', order: 0 }]);
    }
    setErrors({});
  }, [batch, isOpen]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addPrompt = () => {
    const newPrompt: TextPrompt = {
      id: crypto.randomUUID(),
      text: '',
      order: prompts.length
    };
    setPrompts(prev => [...prev, newPrompt]);
  };

  const updatePrompt = (id: string, text: string) => {
    setPrompts(prev => prev.map(prompt => 
      prompt.id === id ? { ...prompt, text } : prompt
    ));
  };

  const removePrompt = (id: string) => {
    if (prompts.length > 1) {
      setPrompts(prev => prev.filter(prompt => prompt.id !== id)
        .map((prompt, index) => ({ ...prompt, order: index })));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Batch name is required';
    }

    if (!formData.targetUrl.trim()) {
      newErrors.targetUrl = 'Target URL is required';
    }

    const nonEmptyPrompts = prompts.filter(p => p.text.trim());
    if (nonEmptyPrompts.length === 0) {
      newErrors.prompts = 'At least one prompt is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const detectedPlatform = detectPlatformFromUrl(formData.targetUrl);
      const validPrompts = prompts.filter(p => p.text.trim())
        .map((prompt, index) => ({
          id: prompt.id,
          text: prompt.text.trim(),
          order: index
        }));

      const batchData: Batch = {
        id: batch?.id || crypto.randomUUID(),
        name: formData.name.trim(),
        targetUrl: formData.targetUrl.trim(),
        description: formData.description.trim(),
        prompts: validPrompts,
        status: batch?.status || 'pending',
        createdAt: batch?.createdAt || new Date(),
        platform: detectedPlatform,
        settings: {
          waitForIdle: formData.waitForIdle,
          maxRetries: formData.maxRetries
        }
      };

      await onSave(batchData);
      onClose();
    } catch (error) {
      console.error('Failed to save batch:', error);
      setErrors({ submit: 'Failed to save batch. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const detectedPlatform = detectPlatformFromUrl(formData.targetUrl);
  const platformName = getPlatformName(detectedPlatform);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            {batch ? 'Edit Batch' : 'Create New Batch'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Batch Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter batch name"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
            />
            {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetUrl" className="text-white">Target URL *</Label>
            <Input
              id="targetUrl"
              type="url"
              value={formData.targetUrl}
              onChange={(e) => handleInputChange('targetUrl', e.target.value)}
              placeholder="https://example.com"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
            />
            {detectedPlatform && (
              <div className="text-sm text-blue-300">
                Detected platform: {platformName}
              </div>
            )}
            {errors.targetUrl && <p className="text-red-400 text-sm">{errors.targetUrl}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this batch will do"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">Prompts ({prompts.length})</Label>
              <Button
                type="button"
                onClick={addPrompt}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Prompt
              </Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {prompts.map((prompt, index) => (
                <div key={prompt.id} className="flex items-start space-x-3 bg-white/5 rounded-lg p-3">
                  <span className="text-white/60 text-sm font-mono min-w-[2rem] mt-2">
                    {index + 1}.
                  </span>
                  <Textarea
                    value={prompt.text}
                    onChange={(e) => updatePrompt(prompt.id, e.target.value)}
                    placeholder="Enter your automation instruction"
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    rows={2}
                  />
                  {prompts.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removePrompt(prompt.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {errors.prompts && <p className="text-red-400 text-sm">{errors.prompts}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="waitForIdle"
              checked={formData.waitForIdle}
              onCheckedChange={(checked) => handleInputChange('waitForIdle', checked)}
            />
            <Label htmlFor="waitForIdle" className="text-white">Wait for page idle</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxRetries" className="text-white">Max Retries</Label>
            <Input
              id="maxRetries"
              type="number"
              value={formData.maxRetries}
              onChange={(e) => handleInputChange('maxRetries', parseInt(e.target.value) || 0)}
              min="0"
              max="10"
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          {errors.submit && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {errors.submit}
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSubmitting ? 'Saving...' : (batch ? 'Update Batch' : 'Create Batch')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BatchModal;
