
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlatforms } from '@/hooks/usePlatforms';
import ContentInputSection from './ContentInputSection';
import ExtractionControls from './ExtractionControls';

interface BatchExtractorPageContentProps {
  prompts: string;
  setPrompts: (value: string) => void;
  batchName: string;
  setBatchName: (value: string) => void;
  targetUrl: string;
  setTargetUrl: (value: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (value: string) => void;
  isProcessing: boolean;
  CHARACTER_LIMIT: number;
  characterCount: number;
  isOverLimit: boolean;
  handleExtract: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  getCharacterCountColor: () => string;
  getEffectiveTargetDisplay: () => string;
}

const BatchExtractorPageContent = ({
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
  handleFileUpload,
  getCharacterCountColor,
  getEffectiveTargetDisplay
}: BatchExtractorPageContentProps) => {
  const { platforms } = usePlatforms();

  const handleFileContent = (content: string, filename: string) => {
    setPrompts(content);
    setBatchName(filename);
  };

  const showPlatformDropdown = !targetUrl.trim();

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl relative overflow-hidden max-w-4xl">
      {/* BETA Banner - Wider and Centered */}
      <div className="absolute top-0 right-0 w-48 h-24 overflow-hidden pointer-events-none">
        <div className="absolute top-4 right-[-48px] bg-orange-500/90 text-white text-sm font-mono font-bold px-20 py-2 transform rotate-45 shadow-lg">
          BETA
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
            placeholder="Enter batch name (optional)..."
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
            onChange={(e) => {
              setTargetUrl(e.target.value);
              if (e.target.value.trim()) {
                setSelectedPlatform('');
              }
            }}
            placeholder="https://lovable.dev (optional - required for processing)"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl h-12 text-base"
          />
          <p className="text-white/60 text-xs">
            Enter a specific project URL, or leave empty to select a platform below. Target is required for processing but optional for saving.
          </p>
        </div>

        {showPlatformDropdown && (
          <div className="space-y-2">
            <Label htmlFor="platform-select" className="text-white text-sm font-medium">
              Target Platform
            </Label>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl h-12">
                <SelectValue placeholder="Select a platform for new projects..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800/95 backdrop-blur-sm border-gray-700 rounded-xl">
                {platforms.map(platform => (
                  <SelectItem key={platform.id} value={platform.id} className="text-white">
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-white/60 text-xs">
              Choose the platform where you want to start a new project. You'll be asked to update with the actual project URL after creation.
            </p>
          </div>
        )}

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
            Target: <span className="text-white/80 font-mono">{getEffectiveTargetDisplay()}</span> • 
            Max {CHARACTER_LIMIT.toLocaleString()} characters • Extracts up to 100 prompts • File size limit: 10MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchExtractorPageContent;
