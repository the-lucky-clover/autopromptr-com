
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BatchFormData } from '@/types/batch';
import { InputValidationService } from '@/services/security/inputValidation';
import { AlertCircle, Shield } from 'lucide-react';

interface BatchFormProps {
  onSubmit: (data: BatchFormData) => void;
  onCancel: () => void;
}

const BatchForm: React.FC<BatchFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<BatchFormData>({
    name: '',
    targetUrl: '',
    description: '',
    initialPrompt: '',
    waitForIdle: true,
    maxRetries: 2
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate batch name
    const nameValidation = InputValidationService.validateBatchName(formData.name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.error || 'Invalid batch name';
    }

    // Validate URL
    if (!InputValidationService.validateUrl(formData.targetUrl)) {
      errors.targetUrl = 'Please enter a valid HTTP or HTTPS URL';
    }

    // Validate prompt
    const promptValidation = InputValidationService.validatePromptText(formData.initialPrompt);
    if (!promptValidation.isValid) {
      errors.initialPrompt = promptValidation.error || 'Invalid prompt text';
    }

    // Validate max retries
    if (formData.maxRetries < 0 || formData.maxRetries > 5) {
      errors.maxRetries = 'Max retries must be between 0 and 5';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Sanitize form data before submission
      const sanitizedData: BatchFormData = {
        name: InputValidationService.sanitizeInput(formData.name),
        targetUrl: formData.targetUrl, // URLs don't need sanitization, already validated
        description: formData.description ? InputValidationService.sanitizeInput(formData.description) : '',
        initialPrompt: InputValidationService.sanitizeInput(formData.initialPrompt),
        waitForIdle: formData.waitForIdle,
        maxRetries: Math.min(Math.max(formData.maxRetries, 0), 5) // Enforce limits
      };

      onSubmit(sanitizedData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BatchFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          Create New Batch
        </CardTitle>
        <CardDescription>
          All inputs are validated and sanitized for security
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Batch Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter batch name (3-100 characters)"
              className={validationErrors.name ? 'border-red-500' : ''}
              maxLength={100}
            />
            {validationErrors.name && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.name}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetUrl">Target URL *</Label>
            <Input
              id="targetUrl"
              type="url"
              value={formData.targetUrl}
              onChange={(e) => handleInputChange('targetUrl', e.target.value)}
              placeholder="https://example.com"
              className={validationErrors.targetUrl ? 'border-red-500' : ''}
            />
            {validationErrors.targetUrl && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.targetUrl}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description of the batch"
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialPrompt">Initial Prompt *</Label>
            <Textarea
              id="initialPrompt"
              value={formData.initialPrompt}
              onChange={(e) => handleInputChange('initialPrompt', e.target.value)}
              placeholder="Enter the initial prompt for automation"
              className={validationErrors.initialPrompt ? 'border-red-500' : ''}
              maxLength={5000}
              rows={4}
            />
            {validationErrors.initialPrompt && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.initialPrompt}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="waitForIdle">Wait for Page Idle</Label>
                <p className="text-sm text-gray-500">
                  Wait for page to be idle before processing
                </p>
              </div>
              <Switch
                id="waitForIdle"
                checked={formData.waitForIdle}
                onCheckedChange={(checked) => handleInputChange('waitForIdle', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxRetries">Max Retries (0-5)</Label>
              <Input
                id="maxRetries"
                type="number"
                min="0"
                max="5"
                value={formData.maxRetries}
                onChange={(e) => handleInputChange('maxRetries', parseInt(e.target.value) || 0)}
                className={validationErrors.maxRetries ? 'border-red-500' : ''}
              />
              {validationErrors.maxRetries && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.maxRetries}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create Batch'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BatchForm;
