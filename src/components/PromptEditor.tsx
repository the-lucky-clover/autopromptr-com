import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, Edit2, Save, X } from 'lucide-react';
import { TextPrompt } from '@/types/batch';

interface PromptEditorProps {
  prompts: TextPrompt[];
  onUpdatePrompt: (promptId: string, text: string) => void;
  onDeletePrompt: (promptId: string) => void;
  onAddPrompt: () => void;
  disabled?: boolean;
}

const PromptEditor = ({ prompts, onUpdatePrompt, onDeletePrompt, onAddPrompt, disabled = false }: PromptEditorProps) => {
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Text Prompts:</h4>
      {prompts.map((prompt, index) => (
        <div key={prompt.id} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
          <GripVertical className="h-4 w-4 text-gray-400 cursor-move mt-1" />
          <div className="flex-1">
            {editingPrompt === prompt.id ? (
              <div className="space-y-2">
                <Textarea
                  value={prompt.text}
                  onChange={(e) => onUpdatePrompt(prompt.id, e.target.value)}
                  rows={2}
                  className="w-full"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => setEditingPrompt(null)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingPrompt(null)}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="group">
                <p className="text-sm text-gray-700">{prompt.text || 'Empty prompt - click to edit'}</p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingPrompt(prompt.id)}
                    disabled={disabled}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeletePrompt(prompt.id)}
                    className="text-red-600 hover:text-red-700"
                    disabled={disabled}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={onAddPrompt}
        className="w-full"
        disabled={disabled}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Prompt
      </Button>
    </div>
  );
};

export default PromptEditor;
