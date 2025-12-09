
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, GripVertical, Edit2, Save, X, Sparkles, Zap, Target } from 'lucide-react';
import { TextPrompt } from '@/types/batch';
import { cloudflare } from "@/integrations/cloudflare/client";
import { useToast } from "@/hooks/use-toast";

interface EnhancedPromptEditorProps {
  prompts: TextPrompt[];
  onUpdatePrompt: (promptId: string, text: string) => void;
  onDeletePrompt: (promptId: string) => void;
  onAddPrompt: () => void;
  disabled?: boolean;
  targetPlatform?: string;
}

interface EnhancementResult {
  enhancedPrompt: string;
  suggestions: string[];
  qualityScore: number;
  processingMethod: 'mistral' | 'google' | 'fallback';
}

const EnhancedPromptEditor = ({ 
  prompts, 
  onUpdatePrompt, 
  onDeletePrompt, 
  onAddPrompt, 
  disabled = false,
  targetPlatform 
}: EnhancedPromptEditorProps) => {
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [enhancingPrompts, setEnhancingPrompts] = useState<Set<string>>(new Set());
  const [enhancingAll, setEnhancingAll] = useState(false);
  const [enhancementResults, setEnhancementResults] = useState<Record<string, EnhancementResult>>({});
  const { toast } = useToast();

  const handleStartEdit = (prompt: TextPrompt) => {
    setEditingPrompt(prompt.id);
    setEditingText(prompt.text);
  };

  const handleSaveEdit = (promptId: string) => {
    onUpdatePrompt(promptId, editingText);
    setEditingPrompt(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingPrompt(null);
    setEditingText('');
  };

  const enhanceIndividualPrompt = async (prompt: TextPrompt) => {
    if (!prompt.text.trim()) {
      toast({
        title: "No text to enhance",
        description: "Please enter some text first before enhancing.",
        variant: "destructive",
      });
      return;
    }

    setEnhancingPrompts(prev => new Set(prev).add(prompt.id));
    
    try {
      const { data, error } = await cloudflare.functions.invoke('enhance-prompt', {
        body: { 
          prompt: prompt.text,
          targetPlatform,
          enhancementType: 'individual'
        }
      });

      if (error) throw error;

      if (data?.enhancedPrompt) {
        onUpdatePrompt(prompt.id, data.enhancedPrompt);
        setEnhancementResults(prev => ({
          ...prev,
          [prompt.id]: data
        }));
        
        toast({
          title: "Prompt enhanced successfully!",
          description: `Enhanced using ${data.processingMethod === 'mistral' ? 'Mistral AI' : 'Google Flash 2.5'} (Quality: ${data.qualityScore}%)`,
        });
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "Failed to enhance prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnhancingPrompts(prev => {
        const newSet = new Set(prev);
        newSet.delete(prompt.id);
        return newSet;
      });
    }
  };

  const enhanceAllPrompts = async () => {
    const validPrompts = prompts.filter(p => p.text.trim());
    if (validPrompts.length === 0) {
      toast({
        title: "No prompts to enhance",
        description: "Please add some prompts first.",
        variant: "destructive",
      });
      return;
    }

    setEnhancingAll(true);
    const batchContext = validPrompts.map(p => p.text);
    
    try {
      const enhancementPromises = validPrompts.map(async (prompt) => {
        const { data, error } = await cloudflare.functions.invoke('enhance-prompt', {
          body: { 
            prompt: prompt.text,
            targetPlatform,
            enhancementType: 'batch',
            batchContext: batchContext.filter(text => text !== prompt.text)
          }
        });

        if (error) throw error;
        return { promptId: prompt.id, result: data };
      });

      const results = await Promise.allSettled(enhancementPromises);
      let successCount = 0;
      let totalQuality = 0;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.result?.enhancedPrompt) {
          const { promptId, result: data } = result.value;
          onUpdatePrompt(promptId, data.enhancedPrompt);
          setEnhancementResults(prev => ({
            ...prev,
            [promptId]: data
          }));
          successCount++;
          totalQuality += data.qualityScore;
        }
      });

      const avgQuality = successCount > 0 ? Math.round(totalQuality / successCount) : 0;
      
      toast({
        title: "Batch enhancement completed!",
        description: `Enhanced ${successCount}/${validPrompts.length} prompts (Avg Quality: ${avgQuality}%)`,
      });
      
    } catch (error) {
      console.error('Batch enhancement error:', error);
      toast({
        title: "Batch enhancement failed",
        description: "Some prompts couldn't be enhanced. Please try individual enhancement.",
        variant: "destructive",
      });
    } finally {
      setEnhancingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-white flex items-center gap-2">
          <Target className="h-4 w-4" />
          Enhanced Text Prompts
        </h4>
        <div className="flex gap-2">
          <Button
            onClick={enhanceAllPrompts}
            disabled={disabled || enhancingAll || prompts.length === 0}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {enhancingAll ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Enhancing All...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Enhance All ({prompts.length})
              </>
            )}
          </Button>
        </div>
      </div>

      {prompts.map((prompt, index) => (
        <Card key={prompt.id} className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                <CardTitle className="text-sm text-gray-300">Prompt {index + 1}</CardTitle>
                {enhancementResults[prompt.id] && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {enhancementResults[prompt.id].processingMethod === 'mistral' ? 'Mistral AI' : 'Google Flash'}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Progress 
                        value={enhancementResults[prompt.id].qualityScore} 
                        className="w-12 h-2" 
                      />
                      <span className="text-xs text-gray-400">
                        {enhancementResults[prompt.id].qualityScore}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => enhanceIndividualPrompt(prompt)}
                  disabled={disabled || enhancingPrompts.has(prompt.id) || !prompt.text.trim()}
                  size="sm"
                  variant="ghost"
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30"
                >
                  {enhancingPrompts.has(prompt.id) ? (
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeletePrompt(prompt.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  disabled={disabled}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {editingPrompt === prompt.id ? (
              <div className="space-y-3">
                <Textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-900/50 border-gray-600 text-white"
                  placeholder="Enter your automation prompt..."
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleSaveEdit(prompt.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="group cursor-pointer" onClick={() => handleStartEdit(prompt)}>
                <p className="text-sm text-gray-300 min-h-[40px] p-2 rounded bg-gray-900/30 border border-gray-700">
                  {prompt.text || 'Click to add prompt text...'}
                </p>
                {enhancementResults[prompt.id]?.suggestions && (
                  <div className="mt-2 space-y-1">
                    {enhancementResults[prompt.id].suggestions.map((suggestion, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit Prompt
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={onAddPrompt}
        className="w-full border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-500"
        disabled={disabled}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Prompt
      </Button>
    </div>
  );
};

export default EnhancedPromptEditor;
