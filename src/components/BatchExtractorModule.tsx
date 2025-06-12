
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Upload, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BatchExtractorModuleProps {
  isCompact?: boolean;
}

const BatchExtractorModule = ({ isCompact = false }: BatchExtractorModuleProps) => {
  const [prompts, setPrompts] = useState('');
  const [batchName, setBatchName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleExtract = async () => {
    if (!prompts.trim()) {
      toast({
        title: "No prompts to extract",
        description: "Please enter some prompts to process.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      const promptCount = prompts.split('\n').filter(p => p.trim()).length;
      toast({
        title: "Batch created successfully",
        description: `Created batch "${batchName || 'Untitled'}" with ${promptCount} prompts.`,
      });
      setIsProcessing(false);
      setPrompts('');
      setBatchName('');
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPrompts(content);
        setBatchName(file.name.replace(/\.[^/.]+$/, ""));
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader className={isCompact ? "pb-2" : "pb-3"}>
        <CardTitle className={`text-white flex items-center space-x-2 ${isCompact ? 'text-sm' : 'text-sm md:text-base'}`}>
          <Zap className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} text-blue-400`} />
          <span>Batch Extractor</span>
        </CardTitle>
        <CardDescription className={`text-purple-200 ${isCompact ? 'text-xs' : 'text-xs md:text-sm'}`}>
          Extract and process multiple prompts into batches
        </CardDescription>
      </CardHeader>
      <CardContent className={`space-y-4 ${isCompact ? 'space-y-2' : ''}`}>
        <div className="space-y-2">
          <Label htmlFor="batch-name" className={`text-white ${isCompact ? 'text-xs' : 'text-sm'}`}>
            Batch Name (Optional)
          </Label>
          <Input
            id="batch-name"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="Enter batch name..."
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl ${isCompact ? 'h-8 text-xs' : ''}`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompts" className={`text-white ${isCompact ? 'text-xs' : 'text-sm'}`}>
            Prompts (one per line)
          </Label>
          <Textarea
            id="prompts"
            value={prompts}
            onChange={(e) => setPrompts(e.target.value)}
            placeholder="Enter your prompts here, one per line..."
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl resize-none ${isCompact ? 'h-20 text-xs' : 'h-32'}`}
          />
        </div>

        <div className={`grid grid-cols-1 ${isCompact ? 'gap-2' : 'gap-3'}`}>
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button
              variant="outline"
              className={`w-full bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl ${isCompact ? 'h-8 text-xs' : ''}`}
            >
              <Upload className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
              {isCompact ? 'Upload' : 'Upload/Import File'}
            </Button>
          </div>

          <Button
            onClick={handleExtract}
            disabled={isProcessing || !prompts.trim()}
            className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl ${isCompact ? 'h-8 text-xs' : ''}`}
          >
            <Zap className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
            {isProcessing ? 'Processing...' : (isCompact ? 'Extract' : 'Extract Batch')}
          </Button>
        </div>

        {!isCompact && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-white/60 text-xs">
              Supported formats: TXT, CSV • Max 1000 prompts per batch
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchExtractorModule;
