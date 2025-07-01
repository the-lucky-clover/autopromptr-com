
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
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl relative overflow-hidden shadow-lg shadow-black/20">
      {/* BETA Banner - Wider and Centered */}
      <div className="absolute top-0 right-0 w-48 h-24 overflow-hidden">
        <div className="absolute top-4 right-[-48px] bg-orange-500/90 text-white text-sm font-mono font-bold px-20 py-2 transform rotate-45 shadow-lg flex items-center justify-center">
          BETA
        </div>
      </div>
      
      <CardContent className={`space-y-4 pt-6 ${isCompact ? 'space-y-3' : ''}`}>
        {/* Batch Name and Target URL on same row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white text-xs font-medium">Batch Name (Optional)</Label>
            <Input
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="Enter batch name (optional)..."
              className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl shadow-md ${isCompact ? 'h-8 text-xs' : 'h-10'}`}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white text-xs font-medium">Target URL</Label>
            <Input
              value={targetUrl}
              onChange={(e) => {
                setTargetUrl(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedPlatform('');
                }
              }}
              placeholder="https://lovable.dev"
              className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl shadow-md ${isCompact ? 'h-8 text-xs' : 'h-10'}`}
            />
          </div>
        </div>

        {!isCompact && showPlatformDropdown && (
          <div className="space-y-2">
            <Label htmlFor="platform-select-module" className="text-white text-xs font-medium">
              Target Platform
            </Label>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl h-10 shadow-md">
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
          <div className="pt-3 border-t border-white/10">
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
