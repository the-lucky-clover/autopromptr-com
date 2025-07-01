
import { TextPrompt } from "@/types/batch";

export const detectPathType = (input: string) => {
  if (!input) return 'unknown';
  
  // Check for URLs (http/https)
  if (input.match(/^https?:\/\//)) return 'remote';
  
  // Check for local paths
  if (input.match(/^[A-Za-z]:\\/)) return 'local'; // Windows
  if (input.match(/^\//) || input.match(/^~\//)) return 'local'; // Unix/Mac
  if (input.match(/^\.\//)) return 'local'; // Relative path
  
  return 'unknown';
};

export const validateBatchForm = (
  formData: {
    name: string;
    targetProjectUrl: string;
  },
  prompts: TextPrompt[]
) => {
  const newErrors: {[key: string]: string} = {};

  if (!formData.name.trim()) {
    newErrors.name = 'Batch name is required';
  }

  if (!formData.targetProjectUrl.trim()) {
    newErrors.targetProjectUrl = 'Target Project URL or local path is required';
  } else {
    const pathType = detectPathType(formData.targetProjectUrl);
    if (pathType === 'unknown') {
      newErrors.targetProjectUrl = 'Please enter a valid URL (https://...) or local path (/path/to/project)';
    }
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

  return newErrors;
};
