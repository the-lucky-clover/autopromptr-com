
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { BatchFormData } from '@/types/batch';
import { InputValidationService } from '@/services/security/inputValidation';

interface BatchFormProps {
  onSubmit: (data: BatchFormData) => void;
  isSubmitting?: boolean;
}

const BatchForm: React.FC<BatchFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState<BatchFormData>({
    name: '',
    targetUrl: '',
    description: '',
    initialPrompt: '',
    platform: 'web',
    waitForIdle: true,
    maxRetries: 3,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate batch name
    const nameValidation = InputValidationService.validateBatchName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error || 'Invalid batch name';
    }

    // Validate URL
    const urlValidation = InputValidationService.validateUrl(formData.targetUrl);
    if (!urlValidation.isValid) {
      newErrors.targetUrl = urlValidation.error || 'Invalid URL';
    }

    // Validate prompt
    const promptValidation = InputValidationService.validatePromptText(formData.initialPrompt);
    if (!promptValidation.isValid) {
      newErrors.initialPrompt = promptValidation.error || 'Invalid prompt';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Sanitize form data before submission
    const sanitizedData: BatchFormData = {
      ...formData,
      name: InputValidationService.sanitizeInput(formData.name),
      targetUrl: InputValidationService.sanitizeInput(formData.targetUrl),
      description: InputValidationService.sanitizeInput(formData.description),
      initialPrompt: InputValidationService.sanitizeInput(formData.initialPrompt),
    };

    onSubmit(sanitizedData);
  };

  const handleInputChange = (field: keyof BatchFormData, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Batch
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="initialPrompt" className="text-white">Initial Prompt *</Label>
            <Textarea
              id="initialPrompt"
              value={formData.initialPrompt}
              onChange={(e) => handleInputChange('initialPrompt', e.target.value)}
              placeholder="Enter the initial prompt for automation"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              rows={4}
              required
            />
            {errors.initialPrompt && <p className="text-red-400 text-sm">{errors.initialPrompt}</p>}
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
              onChange={(e) => handleInputChange('maxRetries', parseInt(e.target.value) || 3)}
              min="1"
              max="10"
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
          >
            {isSubmitting ? 'Creating...' : 'Create Batch'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BatchForm;
