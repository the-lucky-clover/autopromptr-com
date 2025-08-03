import { useState, useCallback } from 'react';
import { TextPrompt } from '@/types/batch';
import { useToast } from '@/hooks/use-toast';
import { arrayMove } from '@dnd-kit/sortable';

export interface PromptQueueManager {
  prompts: TextPrompt[];
  processingPromptId: string | null;
  completedPromptIds: Set<string>;
  failedPromptIds: Set<string>;
  addPrompt: () => void;
  updatePrompt: (promptId: string, text: string) => void;
  deletePrompt: (promptId: string) => void;
  duplicatePrompt: (promptId: string) => void;
  reorderPrompts: (oldIndex: number, newIndex: number) => void;
  movePromptUp: (promptId: string) => void;
  movePromptDown: (promptId: string) => void;
  clearAllPrompts: () => void;
  importPrompts: (texts: string[]) => void;
  setProcessingPromptId: (promptId: string | null) => void;
  markPromptCompleted: (promptId: string) => void;
  markPromptFailed: (promptId: string) => void;
  resetProcessingStates: () => void;
  getNextPromptToProcess: () => TextPrompt | null;
  getQueueStats: () => {
    total: number;
    completed: number;
    failed: number;
    pending: number;
    processing: number;
  };
}

export const usePromptQueueManager = (
  initialPrompts: TextPrompt[] = [],
  onPromptsChange?: (prompts: TextPrompt[]) => void
): PromptQueueManager => {
  const [prompts, setPrompts] = useState<TextPrompt[]>(initialPrompts);
  const [processingPromptId, setProcessingPromptId] = useState<string | null>(null);
  const [completedPromptIds, setCompletedPromptIds] = useState<Set<string>>(new Set());
  const [failedPromptIds, setFailedPromptIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const updatePromptsWithCallback = useCallback((newPrompts: TextPrompt[]) => {
    setPrompts(newPrompts);
    onPromptsChange?.(newPrompts);
  }, [onPromptsChange]);

  const getNextOrder = useCallback(() => {
    return prompts.length > 0 ? Math.max(...prompts.map(p => p.order)) + 1 : 0;
  }, [prompts]);

  const addPrompt = useCallback(() => {
    const newPrompt: TextPrompt = {
      id: crypto.randomUUID(),
      text: '',
      order: getNextOrder()
    };
    updatePromptsWithCallback([...prompts, newPrompt]);
  }, [prompts, getNextOrder, updatePromptsWithCallback]);

  const updatePrompt = useCallback((promptId: string, text: string) => {
    const updatedPrompts = prompts.map(prompt =>
      prompt.id === promptId ? { ...prompt, text } : prompt
    );
    updatePromptsWithCallback(updatedPrompts);
  }, [prompts, updatePromptsWithCallback]);

  const deletePrompt = useCallback((promptId: string) => {
    if (prompts.length <= 1) {
      toast({
        title: "Cannot delete prompt",
        description: "At least one prompt is required in the batch.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedPrompts = prompts.filter(prompt => prompt.id !== promptId);
    // Reorder remaining prompts
    const reorderedPrompts = updatedPrompts.map((prompt, index) => ({
      ...prompt,
      order: index
    }));
    updatePromptsWithCallback(reorderedPrompts);
    
    // Clear processing states for deleted prompt
    setCompletedPromptIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(promptId);
      return newSet;
    });
    setFailedPromptIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(promptId);
      return newSet;
    });
    if (processingPromptId === promptId) {
      setProcessingPromptId(null);
    }
  }, [prompts, toast, processingPromptId, updatePromptsWithCallback]);

  const duplicatePrompt = useCallback((promptId: string) => {
    const promptToDuplicate = prompts.find(p => p.id === promptId);
    if (!promptToDuplicate) return;

    const duplicatedPrompt: TextPrompt = {
      id: crypto.randomUUID(),
      text: promptToDuplicate.text,
      order: getNextOrder()
    };
    
    updatePromptsWithCallback([...prompts, duplicatedPrompt]);
    
    toast({
      title: "Prompt duplicated",
      description: "A copy of the prompt has been added to the queue.",
    });
  }, [prompts, getNextOrder, toast, updatePromptsWithCallback]);

  const reorderPrompts = useCallback((oldIndex: number, newIndex: number) => {
    const reorderedPrompts = arrayMove(prompts, oldIndex, newIndex).map((prompt, index) => ({
      ...prompt,
      order: index
    }));
    updatePromptsWithCallback(reorderedPrompts);
  }, [prompts, updatePromptsWithCallback]);

  const movePromptUp = useCallback((promptId: string) => {
    const currentIndex = prompts.findIndex(p => p.id === promptId);
    if (currentIndex > 0) {
      reorderPrompts(currentIndex, currentIndex - 1);
    }
  }, [prompts, reorderPrompts]);

  const movePromptDown = useCallback((promptId: string) => {
    const currentIndex = prompts.findIndex(p => p.id === promptId);
    if (currentIndex < prompts.length - 1) {
      reorderPrompts(currentIndex, currentIndex + 1);
    }
  }, [prompts, reorderPrompts]);

  const clearAllPrompts = useCallback(() => {
    updatePromptsWithCallback([{
      id: crypto.randomUUID(),
      text: '',
      order: 0
    }]);
    setProcessingPromptId(null);
    setCompletedPromptIds(new Set());
    setFailedPromptIds(new Set());
    
    toast({
      title: "Queue cleared",
      description: "All prompts have been removed from the queue.",
    });
  }, [toast, updatePromptsWithCallback]);

  const importPrompts = useCallback((texts: string[]) => {
    const newPrompts: TextPrompt[] = texts
      .filter(text => text.trim())
      .map((text, index) => ({
        id: crypto.randomUUID(),
        text: text.trim(),
        order: prompts.length + index
      }));
    
    if (newPrompts.length === 0) {
      toast({
        title: "No valid prompts",
        description: "No non-empty prompts were found to import.",
        variant: "destructive",
      });
      return;
    }
    
    updatePromptsWithCallback([...prompts, ...newPrompts]);
    
    toast({
      title: "Prompts imported",
      description: `${newPrompts.length} prompts have been added to the queue.`,
    });
  }, [prompts, toast, updatePromptsWithCallback]);

  const markPromptCompleted = useCallback((promptId: string) => {
    setCompletedPromptIds(prev => new Set(prev).add(promptId));
    setFailedPromptIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(promptId);
      return newSet;
    });
    if (processingPromptId === promptId) {
      setProcessingPromptId(null);
    }
  }, [processingPromptId]);

  const markPromptFailed = useCallback((promptId: string) => {
    setFailedPromptIds(prev => new Set(prev).add(promptId));
    setCompletedPromptIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(promptId);
      return newSet;
    });
    if (processingPromptId === promptId) {
      setProcessingPromptId(null);
    }
  }, [processingPromptId]);

  const resetProcessingStates = useCallback(() => {
    setProcessingPromptId(null);
    setCompletedPromptIds(new Set());
    setFailedPromptIds(new Set());
  }, []);

  const getNextPromptToProcess = useCallback((): TextPrompt | null => {
    const sortedPrompts = [...prompts].sort((a, b) => a.order - b.order);
    return sortedPrompts.find(prompt => 
      !completedPromptIds.has(prompt.id) && 
      !failedPromptIds.has(prompt.id) &&
      processingPromptId !== prompt.id &&
      prompt.text.trim()
    ) || null;
  }, [prompts, completedPromptIds, failedPromptIds, processingPromptId]);

  const getQueueStats = useCallback(() => {
    const total = prompts.length;
    const completed = completedPromptIds.size;
    const failed = failedPromptIds.size;
    const processing = processingPromptId ? 1 : 0;
    const pending = total - completed - failed - processing;
    
    return { total, completed, failed, pending, processing };
  }, [prompts.length, completedPromptIds.size, failedPromptIds.size, processingPromptId]);

  return {
    prompts,
    processingPromptId,
    completedPromptIds,
    failedPromptIds,
    addPrompt,
    updatePrompt,
    deletePrompt,
    duplicatePrompt,
    reorderPrompts,
    movePromptUp,
    movePromptDown,
    clearAllPrompts,
    importPrompts,
    setProcessingPromptId,
    markPromptCompleted,
    markPromptFailed,
    resetProcessingStates,
    getNextPromptToProcess,
    getQueueStats
  };
};