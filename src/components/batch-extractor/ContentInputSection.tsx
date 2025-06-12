
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface ContentInputSectionProps {
  prompts: string;
  onPromptsChange: (value: string) => void;
  characterCount: number;
  characterLimit: number;
  isOverLimit: boolean;
  getCharacterCountColor: () => string;
  isCompact?: boolean;
}

const ContentInputSection = ({ 
  prompts, 
  onPromptsChange, 
  characterCount, 
  characterLimit, 
  isOverLimit, 
  getCharacterCountColor, 
  isCompact = false 
}: ContentInputSectionProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="prompts" className={`text-white ${isCompact ? 'text-xs' : 'text-sm'}`}>
          Content to Extract From
        </Label>
        <div className={`${isCompact ? 'text-xs' : 'text-sm'} ${getCharacterCountColor()} flex items-center space-x-1`}>
          {isOverLimit && <AlertCircle className="w-3 h-3" />}
          <span>{characterCount.toLocaleString()} / {characterLimit.toLocaleString()}</span>
        </div>
      </div>
      <Textarea
        id="prompts"
        value={prompts}
        onChange={(e) => onPromptsChange(e.target.value)}
        placeholder="Paste your content here, or use the import button below. The AI will intelligently extract individual prompts from your text..."
        className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl resize-none ${
          isCompact ? 'h-20 text-xs' : 'h-32'
        } ${isOverLimit ? 'border-red-400' : ''}`}
      />
      {isOverLimit && (
        <p className="text-red-400 text-xs flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Content exceeds character limit</span>
        </p>
      )}
    </div>
  );
};

export default ContentInputSection;
