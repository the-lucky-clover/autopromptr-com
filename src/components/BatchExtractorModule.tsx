
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap } from "lucide-react";
import { useBatchExtraction } from '@/hooks/useBatchExtraction';
import { usePlatforms } from '@/hooks/usePlatforms';
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
    targetUrl,
    setTargetUrl,
    selectedPlatform,
    setSelectedPlatform,
    isProcessing,
    CHARACTER_LIMIT,
    characterCount,
    isOverLimit,
    handleExtract,
    getCharacterCountColor,
    getEffectiveTargetDisplay
  } = useBatchExtraction();

  const { platforms } = usePlatforms();

  const handleFileContent = (content: string, filename: string) => {
    setPrompts(content);
    setBatchName(filename);
  };

  const showPlatformDropdown = !targetUrl.trim();

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl relative overflow-hidden">
      {/* BETA Banner - Centered */}
      <div className="absolute top-0 right-0 w-32 h-20 overflow-hidden">
        <div className="absolute top-4 right-[-32px] bg-orange-500/90 text-white text-xs font-mono font-bold px-12 py-1 transform rotate-45 shadow-lg flex items-center justify-center">
          beta
        </div>
      </div>
      
      <CardContent className={`space-y-4 pt-6 ${isCompact ? 'space-y-2' : ''}`}>
        <div className="space-y-2">
          <Input
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="Enter batch name..."
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl ${isCompact ? 'h-8 text-xs' : ''}`}
          />
        </div>

        {!isCompact && (
          <div className="space-y-2">
            <Label htmlFor="target-url-module" className="text-white text-xs font-medium">
              Project Target URL
            </Label>
            <Input
              id="target-url-module"
              value={targetUrl}
              onChange={(e) => {
                setTargetUrl(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedPlatform('');
                }
              }}
              placeholder="https://lovable.dev (or leave empty to select platform)"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl h-8 text-xs"
            />
          </div>
        )}

        {!isCompact && showPlatformDropdown && (
          <div className="space-y-2">
            <Label htmlFor="platform-select-module" className="text-white text-xs font-medium">
              Target Platform
            </Label>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl h-8">
                <SelectValue placeholder="Select platform..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800/95 backdrop-blur-sm border-gray-700 rounded-xl">
                {platforms.map(platform => (
                  <SelectItem key={platform.id} value={platform.id} className="text-white">
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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
              Target: <span className="text-white/80 font-mono text-xs">{getEffectiveTargetDisplay()}</span> • Max {CHARACTER_LIMIT.toLocaleString()} characters
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchExtractorModule;
