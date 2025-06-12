
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import ContentInputSection from './ContentInputSection';
import ExtractionControls from './ExtractionControls';

interface BatchExtractorPageContentProps {
  prompts: string;
  setPrompts: (value: string) => void;
  batchName: string;
  setBatchName: (value: string) => void;
  targetUrl: string;
  setTargetUrl: (value: string) => void;
  isProcessing: boolean;
  CHARACTER_LIMIT: number;
  characterCount: number;
  isOverLimit: boolean;
  handleExtract: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  getCharacterCountColor: () => string;
  getEffectiveTargetUrl: () => string;
}

const BatchExtractorPageContent = ({
  prompts,
  setPrompts,
  batchName,
  setBatchName,
  targetUrl,
  setTargetUrl,
  isProcessing,
  CHARACTER_LIMIT,
  characterCount,
  isOverLimit,
  handleExtract,
  handleFileUpload,
  getCharacterCountColor,
  getEffectiveTargetUrl
}: BatchExtractorPageContentProps) => {
  const handleFileContent = (content: string, filename: string) => {
    setPrompts(content);
    setBatchName(filename);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl relative overflow-hidden max-w-4xl">
      {/* BETA Banner */}
      <div className="absolute top-0 right-0 w-40 h-20 overflow-hidden pointer-events-none">
        <div className="absolute top-3 right-[-40px] bg-orange-500/90 text-white text-xs font-mono font-bold px-16 py-1 transform rotate-45 shadow-lg">
          beta
        </div>
      </div>
      
      <CardHeader className="pb-6">
        <CardDescription className="text-purple-200 text-left">
          Extract and process multiple prompts from large text blocks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Input
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="Enter batch name..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl h-12 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-url" className="text-white text-sm font-medium">
            Project Target URL
          </Label>
          <Input
            id="target-url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://lovable.dev (default for new projects)"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl h-12 text-base"
          />
          <p className="text-white/60 text-xs">
            Leave empty to start a new Lovable project. You'll be asked to update with the actual project URL after creation.
          </p>
        </div>

        <ContentInputSection
          prompts={prompts}
          onPromptsChange={setPrompts}
          characterCount={characterCount}
          characterLimit={CHARACTER_LIMIT}
          isOverLimit={isOverLimit}
          getCharacterCountColor={getCharacterCountColor}
          isCompact={false}
        />

        <ExtractionControls
          isProcessing={isProcessing}
          prompts={prompts}
          isOverLimit={isOverLimit}
          onExtract={handleExtract}
          onFileContent={handleFileContent}
          characterLimit={CHARACTER_LIMIT}
          isCompact={false}
        />

        <div className="pt-4 border-t border-white/10">
          <p className="text-white/60 text-sm">
            Target: <span className="text-white/80 font-mono">{getEffectiveTargetUrl()}</span> • 
            Max {CHARACTER_LIMIT.toLocaleString()} characters • Extracts up to 100 prompts • File size limit: 10MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchExtractorPageContent;
