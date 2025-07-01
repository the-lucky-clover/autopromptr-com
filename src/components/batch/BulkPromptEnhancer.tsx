
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BulkPromptEnhancerProps {
  prompts: string[];
  onPromptsEnhanced: (enhancedPrompts: string[]) => void;
  targetPlatform?: string;
}

interface EnhancementProgress {
  total: number;
  completed: number;
  failed: number;
  currentPrompt: string;
}

const BulkPromptEnhancer = ({ prompts, onPromptsEnhanced, targetPlatform }: BulkPromptEnhancerProps) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [progress, setProgress] = useState<EnhancementProgress>({ total: 0, completed: 0, failed: 0, currentPrompt: '' });
  const [results, setResults] = useState<{ original: string; enhanced: string; quality: number }[]>([]);
  const { toast } = useToast();

  const enhanceAllPrompts = async () => {
    if (prompts.length === 0) {
      toast({
        title: "No prompts to enhance",
        description: "Please provide prompts to enhance.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    setProgress({ total: prompts.length, completed: 0, failed: 0, currentPrompt: '' });
    setResults([]);

    const enhancedPrompts: string[] = [];
    const enhancementResults: { original: string; enhanced: string; quality: number }[] = [];

    try {
      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        setProgress(prev => ({ ...prev, currentPrompt: prompt.substring(0, 50) + '...' }));

        try {
          const { data, error } = await supabase.functions.invoke('enhance-prompt', {
            body: { 
              prompt,
              targetPlatform,
              enhancementType: 'batch',
              batchContext: prompts.filter(p => p !== prompt).slice(0, 3)
            }
          });

          if (error) throw error;

          if (data?.enhancedPrompt) {
            enhancedPrompts.push(data.enhancedPrompt);
            enhancementResults.push({
              original: prompt,
              enhanced: data.enhancedPrompt,
              quality: data.qualityScore || 0
            });
            setProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
          } else {
            enhancedPrompts.push(prompt);
            setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
          }
        } catch (error) {
          console.error(`Failed to enhance prompt ${i + 1}:`, error);
          enhancedPrompts.push(prompt);
          setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
        }

        // Small delay to prevent rate limiting
        if (i < prompts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setResults(enhancementResults);
      onPromptsEnhanced(enhancedPrompts);

      const avgQuality = enhancementResults.length > 0 
        ? Math.round(enhancementResults.reduce((sum, r) => sum + r.quality, 0) / enhancementResults.length)
        : 0;

      toast({
        title: "Bulk enhancement completed!",
        description: `Enhanced ${progress.completed} of ${prompts.length} prompts (Avg Quality: ${avgQuality}%)`,
      });

    } catch (error) {
      console.error('Bulk enhancement error:', error);
      toast({
        title: "Bulk enhancement failed",
        description: "An error occurred during bulk enhancement.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
      setProgress(prev => ({ ...prev, currentPrompt: '' }));
    }
  };

  const progressPercentage = progress.total > 0 ? (progress.completed + progress.failed) / progress.total * 100 : 0;

  return (
    <Card className="bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-pink-900/30 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-400" />
          Bulk Prompt Enhancement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">
            {prompts.length} prompts ready for enhancement
            {targetPlatform && (
              <Badge variant="outline" className="ml-2">
                Target: {targetPlatform}
              </Badge>
            )}
          </div>
          <Button
            onClick={enhanceAllPrompts}
            disabled={isEnhancing || prompts.length === 0}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isEnhancing ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Enhancing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Enhance All Prompts
              </>
            )}
          </Button>
        </div>

        {isEnhancing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Enhancement Progress</span>
              <span className="text-white">
                {progress.completed + progress.failed} / {progress.total}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {progress.currentPrompt && (
              <p className="text-xs text-gray-400 truncate">
                Currently enhancing: {progress.currentPrompt}
              </p>
            )}
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-3 h-3" />
                Enhanced: {progress.completed}
              </div>
              <div className="flex items-center gap-1 text-red-400">
                <AlertCircle className="w-3 h-3" />
                Failed: {progress.failed}
              </div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white">Enhancement Summary</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-green-500/20 rounded">
                <div className="text-green-400 font-medium">{results.length}</div>
                <div className="text-green-300">Enhanced</div>
              </div>
              <div className="text-center p-2 bg-blue-500/20 rounded">
                <div className="text-blue-400 font-medium">
                  {Math.round(results.reduce((sum, r) => sum + r.quality, 0) / results.length)}%
                </div>
                <div className="text-blue-300">Avg Quality</div>
              </div>
              <div className="text-center p-2 bg-purple-500/20 rounded">
                <div className="text-purple-400 font-medium">
                  {Math.round(results.reduce((sum, r) => sum + r.enhanced.length, 0) / results.length)}
                </div>
                <div className="text-purple-300">Avg Length</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkPromptEnhancer;
