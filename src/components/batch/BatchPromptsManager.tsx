
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { TextPrompt } from "@/types/batch";

interface BatchPromptsManagerProps {
  prompts: TextPrompt[];
  errors: {[key: string]: string};
  onAddPrompt: () => void;
  onUpdatePrompt: (id: string, text: string) => void;
  onRemovePrompt: (id: string) => void;
}

const BatchPromptsManager = ({ 
  prompts, 
  errors, 
  onAddPrompt, 
  onUpdatePrompt, 
  onRemovePrompt 
}: BatchPromptsManagerProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-white">
          Automation Prompts ({prompts.length}/50)
        </h3>
        <Button
          type="button"
          onClick={onAddPrompt}
          disabled={prompts.length >= 50}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Prompt
        </Button>
      </div>
      
      {errors.prompts && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {errors.prompts}
        </div>
      )}

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {prompts.map((prompt, index) => (
          <div key={prompt.id} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/10">
            <span className="text-white/60 text-sm font-mono min-w-[2rem]">
              {index + 1}.
            </span>
            <Textarea
              value={prompt.text}
              onChange={(e) => onUpdatePrompt(prompt.id, e.target.value)}
              placeholder="Enter your automation instruction (e.g., 'Update the hero section text to be more engaging')"
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg resize-none"
              rows={2}
            />
            {prompts.length > 1 && (
              <Button
                type="button"
                onClick={() => onRemovePrompt(prompt.id)}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-500/20 rounded-lg p-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BatchPromptsManager;
