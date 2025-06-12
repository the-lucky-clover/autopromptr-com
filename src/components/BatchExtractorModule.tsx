
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Upload, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BatchExtractorModuleProps {
  isCompact?: boolean;
}

const BatchExtractorModule = ({ isCompact = false }: BatchExtractorModuleProps) => {
  const [prompts, setPrompts] = useState('');
  const [batchName, setBatchName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const CHARACTER_LIMIT = 50000;
  const characterCount = prompts.length;
  const isOverLimit = characterCount > CHARACTER_LIMIT;

  const handleExtract = async () => {
    if (!prompts.trim()) {
      toast({
        title: "No content to extract",
        description: "Please enter some text or import a file to process.",
        variant: "destructive",
      });
      return;
    }

    if (isOverLimit) {
      toast({
        title: "Content too long",
        description: `Please reduce content to under ${CHARACTER_LIMIT.toLocaleString()} characters.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate intelligent prompt extraction
    setTimeout(() => {
      // Simple extraction logic - split by double newlines, filter empty lines
      const extractedPrompts = prompts
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 10) // Only keep prompts with reasonable length
        .slice(0, 100); // Limit to 100 prompts max

      if (extractedPrompts.length === 0) {
        toast({
          title: "No prompts found",
          description: "Could not extract any valid prompts from the text. Try formatting with clear separations.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      toast({
        title: "Extraction successful",
        description: `Extracted ${extractedPrompts.length} prompts and created batch "${batchName || 'Untitled'}".`,
      });
      setIsProcessing(false);
      setPrompts('');
      setBatchName('');
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'text/plain',
      'text/markdown', 
      'text/html',
      'text/csv',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validTypes.some(type => file.type === type || file.name.toLowerCase().endsWith(type.split('/')[1]))) {
      toast({
        title: "Invalid file type",
        description: "Please upload TXT, MD, HTML, CSV, PDF, or DOCX files only.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please upload files smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content.length > CHARACTER_LIMIT) {
        toast({
          title: "File content too long",
          description: `File content exceeds ${CHARACTER_LIMIT.toLocaleString()} character limit.`,
          variant: "destructive",
        });
        return;
      }
      setPrompts(content);
      setBatchName(file.name.replace(/\.[^/.]+$/, ""));
    };
    
    if (file.type.includes('pdf') || file.type.includes('docx')) {
      toast({
        title: "Processing file",
        description: "PDF and DOCX files require additional processing. This is a demo - text extraction not implemented.",
        variant: "default",
      });
    } else {
      reader.readAsText(file);
    }
  };

  const getCharacterCountColor = () => {
    if (isOverLimit) return 'text-red-400';
    if (characterCount > CHARACTER_LIMIT * 0.8) return 'text-yellow-400';
    return 'text-purple-300';
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="prompts" className={`text-white ${isCompact ? 'text-xs' : 'text-sm'}`}>
              Content to Extract From
            </Label>
            <div className={`${isCompact ? 'text-xs' : 'text-sm'} ${getCharacterCountColor()} flex items-center space-x-1`}>
              {isOverLimit && <AlertCircle className="w-3 h-3" />}
              <span>{characterCount.toLocaleString()} / {CHARACTER_LIMIT.toLocaleString()}</span>
            </div>
          </div>
          <Textarea
            id="prompts"
            value={prompts}
            onChange={(e) => setPrompts(e.target.value)}
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

        <div className={`grid grid-cols-1 ${isCompact ? 'gap-2' : 'gap-3'}`}>
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              accept=".txt,.md,.html,.csv,.pdf,.docx"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button
              variant="outline"
              className={`w-full bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl ${isCompact ? 'h-8 text-xs' : ''}`}
            >
              <Upload className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
              {isCompact ? 'Import File' : 'Import File (TXT, MD, HTML, CSV, PDF, DOCX)'}
            </Button>
          </div>

          <Button
            onClick={handleExtract}
            disabled={isProcessing || !prompts.trim() || isOverLimit}
            className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl ${isCompact ? 'h-8 text-xs' : ''}`}
          >
            <Zap className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
            {isProcessing ? 'Extracting...' : (isCompact ? 'Extract Prompts' : 'Extract & Create Batch')}
          </Button>
        </div>

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
