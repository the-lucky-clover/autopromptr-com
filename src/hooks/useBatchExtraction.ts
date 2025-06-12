import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePersistentBatches } from '@/hooks/usePersistentBatches';
import { Batch, TextPrompt } from '@/types/batch';
import { useNavigate } from 'react-router-dom';

export const useBatchExtraction = () => {
  const [prompts, setPrompts] = useState('');
  const [batchName, setBatchName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { setBatches, triggerBatchSync } = usePersistentBatches();
  const { toast } = useToast();
  const navigate = useNavigate();

  const CHARACTER_LIMIT = 50000;
  const characterCount = prompts.length;
  const isOverLimit = characterCount > CHARACTER_LIMIT;

  const getCharacterCountColor = () => {
    if (isOverLimit) return 'text-red-400';
    if (characterCount > CHARACTER_LIMIT * 0.8) return 'text-orange-400';
    return 'text-white/70';
  };

  const getEffectiveTargetUrl = () => {
    return targetUrl.trim() || 'https://lovable.dev';
  };

  const extractPrompts = (text: string): string[] => {
    if (!text.trim()) return [];

    // Split by common delimiters and clean up
    const lines = text
      .split(/[\n\r]+/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const prompts: string[] = [];
    let currentPrompt = '';

    for (const line of lines) {
      // Check if this line looks like a new prompt starter
      const isNewPrompt = 
        /^\d+[\.\)\-]\s/.test(line) || // Numbered lists (1. 2) 3-)
        /^[\-\*\+]\s/.test(line) ||    // Bullet points
        /^[A-Z][^\.!?]*[\.!?]\s*$/.test(line) || // Sentences ending with punctuation
        line.length > 20; // Longer lines likely to be prompts

      if (isNewPrompt && currentPrompt) {
        prompts.push(currentPrompt.trim());
        currentPrompt = line;
      } else {
        currentPrompt += (currentPrompt ? ' ' : '') + line;
      }
    }

    // Add the last prompt
    if (currentPrompt.trim()) {
      prompts.push(currentPrompt.trim());
    }

    // If we got very few prompts, try splitting by sentences instead
    if (prompts.length < 3) {
      const sentences = text
        .split(/[\.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);
      
      return sentences.length > prompts.length ? sentences : prompts;
    }

    return prompts.slice(0, 100); // Limit to 100 prompts
  };

  const handleExtract = async () => {
    if (!prompts.trim()) {
      toast({
        title: "No content to extract",
        description: "Please enter some content to extract prompts from.",
        variant: "destructive",
      });
      return;
    }

    if (!batchName.trim()) {
      toast({
        title: "Missing batch name",
        description: "Please enter a name for your batch.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const extractedPrompts = extractPrompts(prompts);
      
      if (extractedPrompts.length === 0) {
        toast({
          title: "No prompts found",
          description: "Unable to extract any prompts from the provided content.",
          variant: "destructive",
        });
        return;
      }

      const effectiveUrl = getEffectiveTargetUrl();

      // Create text prompts with proper structure
      const textPrompts: TextPrompt[] = extractedPrompts.map((prompt, index) => ({
        id: crypto.randomUUID(),
        text: prompt,
        order: index
      }));

      // Create new batch
      const newBatch: Batch = {
        id: crypto.randomUUID(),
        name: batchName,
        targetUrl: effectiveUrl,
        description: `Extracted from batch extractor with ${textPrompts.length} prompts`,
        prompts: textPrompts,
        status: 'pending',
        createdAt: new Date(),
        settings: {
          waitForIdle: true,
          maxRetries: 0
        }
      };

      console.log('Creating new batch from extraction:', newBatch);

      // Add to batches
      setBatches(prev => {
        const updated = [...prev, newBatch];
        console.log('Updated batches after extraction:', updated);
        return updated;
      });

      // Force sync across all components
      setTimeout(() => {
        triggerBatchSync();
      }, 100);

      // Clear form
      setPrompts('');
      setBatchName('');
      setTargetUrl('');

      // Show success message and navigate
      const isLovableDefault = effectiveUrl === 'https://lovable.dev';
      toast({
        title: "Batch created successfully!",
        description: isLovableDefault 
          ? `Extracted ${textPrompts.length} prompts for new Lovable project. You'll be prompted to update the project URL after automation starts.`
          : `Extracted ${textPrompts.length} prompts for "${batchName}". Navigating to dashboard...`,
      });

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

      console.log(`Successfully extracted ${textPrompts.length} prompts and created batch "${batchName}" with target URL: ${effectiveUrl}`);

    } catch (error) {
      console.error('Error during batch extraction:', error);
      toast({
        title: "Extraction failed",
        description: "An error occurred while creating the batch.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    prompts,
    setPrompts,
    batchName,
    setBatchName,
    targetUrl,
    setTargetUrl,
    isProcessing,
    CHARACTER_LIMIT,
    characterCount,
    isOverLimit,
    handleExtract,
    getCharacterCountColor,
    getEffectiveTargetUrl
  };
};
