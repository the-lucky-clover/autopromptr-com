
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useBatchOperations } from '@/hooks/useBatchOperations';

export const useBatchExtraction = () => {
  const [prompts, setPrompts] = useState('');
  const [batchName, setBatchName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { createBatch } = useBatchOperations();

  const CHARACTER_LIMIT = 50000;
  const characterCount = prompts.length;
  const isOverLimit = characterCount > CHARACTER_LIMIT;

  const extractPromptsFromText = (text: string): string[] => {
    // Split by double newlines, filter empty lines, and clean up
    const extractedPrompts = text
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 10) // Only keep prompts with reasonable length
      .slice(0, 100); // Limit to 100 prompts max

    return extractedPrompts;
  };

  const handleExtract = async () => {
    if (!prompts.trim()) {
      toast({
        title: "No content to extract",
        description: "Please enter some text or import a file to process.",
        variant: "destructive",
      });
      return;
    }

    if (isOverLimit) {
      toast({
        title: "Content too long",
        description: `Please reduce content to under ${CHARACTER_LIMIT.toLocaleString()} characters.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Extract prompts from the text
      const extractedPrompts = extractPromptsFromText(prompts);

      if (extractedPrompts.length === 0) {
        toast({
          title: "No prompts found",
          description: "Could not extract any valid prompts from the text. Try formatting with clear separations.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Create batch data
      const batchFormData = {
        name: batchName.trim() || 'Extracted Batch',
        targetUrl: 'https://lovable.dev', // Default to Lovable for extracted batches
        description: `Batch extracted from text content containing ${extractedPrompts.length} prompts`,
        initialPrompt: extractedPrompts[0], // First prompt as initial
        platform: 'lovable',
        waitForIdle: true,
        maxRetries: 0
      };

      // Create the batch using the batch operations
      createBatch(batchFormData);

      toast({
        title: "Extraction successful",
        description: `Extracted ${extractedPrompts.length} prompts and created batch "${batchFormData.name}". Note: Only the first prompt was added due to current system limitations.`,
      });

      // Clear the form
      setPrompts('');
      setBatchName('');

    } catch (error) {
      console.error('Failed to extract and create batch:', error);
      toast({
        title: "Failed to create batch",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCharacterCountColor = () => {
    if (isOverLimit) return 'text-red-400';
    if (characterCount > CHARACTER_LIMIT * 0.8) return 'text-yellow-400';
    return 'text-purple-300';
  };

  return {
    prompts,
    setPrompts,
    batchName,
    setBatchName,
    isProcessing,
    CHARACTER_LIMIT,
    characterCount,
    isOverLimit,
    handleExtract,
    getCharacterCountColor
  };
};
