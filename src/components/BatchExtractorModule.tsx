
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Zap } from "lucide-react";
import { useBatchExtraction } from '@/hooks/useBatchExtraction';
import ContentInputSection from './batch-extractor/ContentInputSection';
import ExtractionControls from './batch-extractor/ExtractionControls';

interface BatchExtractorModuleProps {
  isCompact?: boolean;
}

const BatchExtractorModule = ({ isCompact = false }: BatchExtractorModuleProps) => {
  const {
    prompts,
    setPrompts,
    batchName,
    setBatchName,
    isProcessing,
    CHARACTER_LIMIT,
    characterCount,
    isOverLimit,
    handleExtract,
    getCharacterCountColor
  } = useBatchExtraction();

  const handleFileContent = (content: string, filename: string) => {
    setPrompts(content);
    setBatchName(filename);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl relative overflow-hidden">
      {/* BETA Banner */}
      <div className="absolute top-0 right-0 w-32 h-20 overflow-hidden">
        <div className="absolute top-3 right-[-32px] bg-orange-500/90 text-white text-xs font-mono font-bold px-12 py-1 transform rotate-45 shadow-lg">
          beta
        </div>
      </div>
      
      <CardHeader className={isCompact ? "pb-2" : "pb-3"}>
        <CardTitle className={`text-white flex items-center space-x-2 ${isCompact ? 'text-sm' : 'text-sm md:text-base'}`}>
          <Zap className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} text-blue-400`} />
          <span>Batch Extractor</span>
        </CardTitle>
        <CardDescription className={`text-purple-200 ${isCompact ? 'text-xs' : 'text-xs md:text-sm'}`}>
          Extract and process multiple prompts from large text blocks
        </CardDescription>
      </CardHeader>
      <CardContent className={`space-y-4 ${isCompact ? 'space-y-2' : ''}`}>
        <div className="space-y-2">
          <Input
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="Enter batch name..."
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl ${isCompact ? 'h-8 text-xs' : ''}`}
          />
        </div>

        <ContentInputSection
          prompts={prompts}
          onPromptsChange={setPrompts}
          characterCount={characterCount}
          characterLimit={CHARACTER_LIMIT}
          isOverLimit={isOverLimit}
          getCharacterCountColor={getCharacterCountColor}
          isCompact={isCompact}
        />

        <ExtractionControls
          isProcessing={isProcessing}
          prompts={prompts}
          isOverLimit={isOverLimit}
          onExtract={handleExtract}
          onFileContent={handleFileContent}
          characterLimit={CHARACTER_LIMIT}
          isCompact={isCompact}
        />

        {!isCompact && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-white/60 text-xs">
              Max {CHARACTER_LIMIT.toLocaleString()} characters • Extracts up to 100 prompts
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchExtractorModule;
