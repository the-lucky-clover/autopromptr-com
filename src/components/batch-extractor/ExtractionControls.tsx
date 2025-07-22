
import { Button } from "@/components/ui/button";
import { Zap, Play } from "lucide-react";
import FileUploadSection from './FileUploadSection';

interface ExtractionControlsProps {
  isProcessing: boolean;
  isGeminiProcessing?: boolean;
  prompts: string;
  isOverLimit: boolean;
  onExtract: () => void;
  onGeminiExtract?: () => void;
  onFileContent: (content: string, filename: string) => void;
  characterLimit: number;
  isCompact?: boolean;
}

const ExtractionControls = ({ 
  isProcessing, 
  isGeminiProcessing = false,
  prompts, 
  isOverLimit, 
  onExtract, 
  onGeminiExtract,
  onFileContent, 
  characterLimit, 
  isCompact = false 
}: ExtractionControlsProps) => {
  return (
    <div className={`space-y-${isCompact ? '2' : '3'}`}>
      <FileUploadSection 
        onFileContent={onFileContent}
        isCompact={isCompact}
        characterLimit={characterLimit}
      />

      {/* Gemini AI Extraction Button */}
      {onGeminiExtract && (
        <Button
          onClick={onGeminiExtract}
          disabled={isGeminiProcessing || !prompts.trim() || isOverLimit}
          className={`w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl ${isCompact ? 'h-8 text-xs' : ''}`}
        >
          <Play className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
          {isGeminiProcessing ? 'AI Processing...' : (isCompact ? 'AI Extract' : 'AI Extract with Gemini Flash 2.0')}
        </Button>
      )}

      {/* Regular Extraction Button */}
      <Button
        onClick={onExtract}
        disabled={isProcessing || !prompts.trim() || isOverLimit}
        className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl ${isCompact ? 'h-8 text-xs' : ''}`}
      >
        <Zap className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
        {isProcessing ? 'Extracting...' : (isCompact ? 'Extract Prompts' : 'Extract & Create Batch')}
      </Button>
    </div>
  );
};

export default ExtractionControls;
