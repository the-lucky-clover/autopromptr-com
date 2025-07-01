
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PromptEnhancementButtonProps {
  promptText: string;
  onEnhanced: (enhancedText: string) => void;
  size?: 'sm' | 'default';
}

const PromptEnhancementButton = ({ promptText, onEnhanced, size = 'sm' }: PromptEnhancementButtonProps) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();

  const handleEnhance = async () => {
    if (!promptText.trim()) {
      toast({
        title: "No text to enhance",
        description: "Please enter some text first before enhancing.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('enhance-prompt', {
        body: { prompt: promptText }
      });

      if (error) {
        throw error;
      }

      if (data?.enhancedPrompt) {
        onEnhanced(data.enhancedPrompt);
        toast({
          title: "Prompt enhanced!",
          description: "Your prompt has been improved using AI.",
        });
      } else {
        throw new Error('No enhanced prompt received');
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "Failed to enhance prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleEnhance}
      disabled={isEnhancing || !promptText.trim()}
      size={size}
      variant="ghost"
      className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-lg px-3 py-1"
    >
      {isEnhancing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      {size !== 'sm' && (
        <span className="ml-2">
          {isEnhancing ? 'Enhancing...' : 'Enhance'}
        </span>
      )}
    </Button>
  );
};

export default PromptEnhancementButton;
