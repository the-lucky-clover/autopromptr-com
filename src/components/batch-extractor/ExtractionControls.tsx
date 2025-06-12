
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import FileUploadSection from './FileUploadSection';

interface ExtractionControlsProps {
  isProcessing: boolean;
  prompts: string;
  isOverLimit: boolean;
  onExtract: () => void;
  onFileContent: (content: string, filename: string) => void;
  characterLimit: number;
  isCompact?: boolean;
}

const ExtractionControls = ({ 
  isProcessing, 
  prompts, 
  isOverLimit, 
  onExtract, 
  onFileContent, 
  characterLimit, 
  isCompact = false 
}: ExtractionControlsProps) => {
  return (
    <div className={`grid grid-cols-1 ${isCompact ? 'gap-2' : 'gap-3'}`}>
      <FileUploadSection 
        onFileContent={onFileContent}
        isCompact={isCompact}
        characterLimit={characterLimit}
      />

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
