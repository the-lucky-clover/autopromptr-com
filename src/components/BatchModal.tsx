
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, X } from "lucide-react";
import { Batch, TextPrompt } from "@/types/batch";

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch?: Batch | null;
  onSave: (batch: Omit<Batch, 'id' | 'createdAt'>) => void;
}

export default function BatchModal({ isOpen, onClose, batch, onSave }: BatchModalProps) {
  const [formData, setFormData] = useState({
    name: batch?.name || '',
    targetUrl: batch?.targetUrl || '',
    description: batch?.description || '',
    platform: batch?.platform || 'website',
    waitForIdle: batch?.settings?.waitForIdle ?? true,
    maxRetries: batch?.settings?.maxRetries || 3,
  });

  const [prompts, setPrompts] = useState<TextPrompt[]>(
    batch?.prompts || [{ id: '1', text: '', order: 0 }]
  );
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name,
        targetUrl: batch.targetUrl,
        description: batch.description || '',
        platform: batch.platform || 'website',
        waitForIdle: batch.settings?.waitForIdle ?? true,
        maxRetries: batch.settings?.maxRetries || 3,
      });
      setPrompts(batch.prompts);
    } else {
      // Reset form data when creating a new batch
      setFormData({
        name: '',
        targetUrl: '',
        description: '',
        platform: 'website',
        waitForIdle: true,
        maxRetries: 3,
      });
      setPrompts([{ id: '1', text: '', order: 0 }]);
      setErrors({});
    }
  }, [batch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, platform: value }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Batch name is required';
    }

    if (!formData.targetUrl.trim()) {
      newErrors.targetUrl = 'Target URL is required';
    }

    // Validate prompts
    const nonEmptyPrompts = prompts.filter(prompt => prompt.text.trim() !== '');
    
    if (nonEmptyPrompts.length === 0) {
      newErrors.prompts = 'At least one non-empty prompt is required';
    }

    if (prompts.length > 50) {
      newErrors.prompts = 'Maximum 50 prompts allowed per batch';
    }

    // Check for empty prompts
    const hasEmptyPrompts = prompts.some(prompt => prompt.text.trim() === '');
    if (hasEmptyPrompts) {
      newErrors.prompts = 'All prompts must contain text. Remove empty prompts before saving.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    
    if (!validateForm()) {
      return;
    }

    // Filter out empty prompts before saving
    const validPrompts = prompts.filter(prompt => prompt.text.trim() !== '');

    const batchData = {
      name: formData.name,
      targetUrl: formData.targetUrl,
      description: formData.description,
      prompts: validPrompts.map((prompt, index) => ({
        ...prompt,
        order: index
      })),
      status: 'pending' as const,
      platform: formData.platform,
      settings: {
        waitForIdle: formData.waitForIdle,
        maxRetries: parseInt(String(formData.maxRetries), 10),
        automationDelay: 1000,
        elementTimeout: 30000,
        debugLevel: 'standard' as const,
      },
    };

    onSave(batchData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-xl border-white/20 text-white">
        <div className="flex items-center justify-between">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              {batch ? 'Edit Batch' : 'Create New Batch'}
            </DialogTitle>
          </DialogHeader>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-base font-medium text-white">
              Batch Name
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter batch name"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="targetUrl" className="text-base font-medium text-white">
              Target URL
            </Label>
            <Input
              type="url"
              id="targetUrl"
              name="targetUrl"
              value={formData.targetUrl}
              onChange={handleInputChange}
              placeholder="Enter target URL"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg"
            />
            {errors.targetUrl && (
              <p className="text-red-400 text-sm mt-1">{errors.targetUrl}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="text-base font-medium text-white">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter batch description"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg resize-none"
            />
          </div>

          <div>
            <Label htmlFor="platform" className="text-base font-medium text-white">
              Platform
            </Label>
            <Select onValueChange={handleSelectChange} defaultValue={formData.platform}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg">
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent className="bg-black/70 backdrop-blur-md border-white/10 text-white">
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="desktop-app">Desktop App</SelectItem>
                <SelectItem value="mobile-app">Mobile App</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Text Prompts Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium text-white">
                Text Prompts ({prompts.length}/50)
              </Label>
              <Button
                type="button"
                onClick={addPrompt}
                disabled={prompts.length >= 50}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Prompt
              </Button>
            </div>
            
            {errors.prompts && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {errors.prompts}
              </div>
            )}

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {prompts.map((prompt, index) => (
                <div key={prompt.id} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/10">
                  <span className="text-white/60 text-sm font-mono min-w-[2rem]">
                    {index + 1}.
                  </span>
                  <Textarea
                    value={prompt.text}
                    onChange={(e) => updatePrompt(prompt.id, e.target.value)}
                    placeholder="Enter your automation prompt..."
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg resize-none"
                    rows={2}
                  />
                  {prompts.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removePrompt(prompt.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:bg-red-500/20 rounded-lg p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-2">
            <Label className="text-base font-medium text-white">
              Settings
            </Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="waitForIdle"
                name="waitForIdle"
                checked={formData.waitForIdle}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, waitForIdle: !!checked }))}
                className="bg-white/10 border-white/20 text-blue-500 rounded-md"
              />
              <Label htmlFor="waitForIdle" className="text-sm text-white">
                Wait For Idle
              </Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxRetries" className="text-sm text-white">
                  Max Retries
                </Label>
                <Input
                  type="number"
                  id="maxRetries"
                  name="maxRetries"
                  value={formData.maxRetries}
                  onChange={handleInputChange}
                  placeholder="Enter max retries"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg"
                />
              </div>
            </div>
          </div>

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
