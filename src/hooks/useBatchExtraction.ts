import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePersistentBatches } from '@/hooks/usePersistentBatches';
import { Batch, TextPrompt } from '@/types/batch';
import { useNavigate } from 'react-router-dom';
import { detectPlatformFromUrl, getPlatformName } from '@/utils/platformDetection';

export const useBatchExtraction = () => {
  const [prompts, setPrompts] = useState('');
  const [batchName, setBatchName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { setBatches } = usePersistentBatches();
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

  const getPlatformUrl = (platformId: string): string => {
    const platformUrls: Record<string, string> = {
      'lovable': 'https://lovable.dev',
      'chatgpt': 'https://chat.openai.com',
      'claude': 'https://claude.ai',
      'gemini': 'https://gemini.google.com',
      'perplexity': 'https://perplexity.ai',
      'bolt': 'https://bolt.new',
      'v0': 'https://v0.dev',
      'replit': 'https://replit.com',
      'generic-web': 'https://example.com'
    };
    return platformUrls[platformId] || 'https://lovable.dev';
  };

  const getEffectiveTargetUrl = () => {
    if (targetUrl.trim()) {
      return targetUrl.trim();
    }
    if (selectedPlatform) {
      return getPlatformUrl(selectedPlatform);
    }
    return 'https://lovable.dev';
  };

  const getEffectiveTargetDisplay = () => {
    if (targetUrl.trim()) {
      return targetUrl.trim();
    }
    if (selectedPlatform) {
      const platformName = getPlatformName(selectedPlatform);
      return `${platformName} (${getPlatformUrl(selectedPlatform)})`;
    }
    return 'Lovable (https://lovable.dev)';
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

    // Only validate target URL/platform for processing, not for saving
    const hasTarget = targetUrl.trim() || selectedPlatform;
    
    if (!hasTarget) {
      toast({
        title: "Missing target for processing",
        description: "A target URL or platform is required to process batches. You can save the batch without a target, but it cannot be processed until a target is specified.",
        variant: "destructive",
      });
      // Allow saving but prevent processing
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

      const effectiveUrl = hasTarget ? getEffectiveTargetUrl() : '';
      const effectiveName = batchName.trim() || `Untitled Batch ${new Date().toLocaleDateString()}`;

      // Create text prompts with proper structure
      const textPrompts: TextPrompt[] = extractedPrompts.map((prompt, index) => ({
        id: crypto.randomUUID(),
        text: prompt,
        order: index
      }));

      // Create new batch
      const newBatch: Batch = {
        id: crypto.randomUUID(),
        name: effectiveName,
        targetUrl: effectiveUrl,
        description: `Extracted from batch extractor with ${textPrompts.length} prompts`,
        prompts: textPrompts,
        status: hasTarget ? 'pending' : 'draft', // Use draft status if no target
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

      // Clear form
      setPrompts('');
      setBatchName('');
      setTargetUrl('');
      setSelectedPlatform('');

      // Show success message and navigate
      const statusMessage = hasTarget 
        ? `Extracted ${textPrompts.length} prompts and saved as "${effectiveName}". Ready for processing.`
        : `Extracted ${textPrompts.length} prompts and saved as "${effectiveName}". Add a target URL to enable processing.`;
      
      toast({
        title: "Batch created successfully!",
        description: statusMessage,
      });

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

      console.log(`Successfully extracted ${textPrompts.length} prompts and created batch "${effectiveName}" with target URL: ${effectiveUrl || 'None (draft mode)'}`);

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
    selectedPlatform,
    setSelectedPlatform,
    isProcessing,
    CHARACTER_LIMIT,
    characterCount,
    isOverLimit,
    handleExtract,
    getCharacterCountColor,
    getEffectiveTargetUrl,
    getEffectiveTargetDisplay
  };
};
