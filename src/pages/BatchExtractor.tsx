import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useToast } from "@/hooks/use-toast";
import { useBatchExtraction } from '@/hooks/useBatchExtraction';
import BatchExtractorPageHeader from '@/components/batch-extractor/BatchExtractorPageHeader';
import BatchExtractorPageContent from '@/components/batch-extractor/BatchExtractorPageContent';

const BatchExtractor = () => {
  const { toast } = useToast();
  const {
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
    getCharacterCountColor,
    getEffectiveTargetUrl
  } = useBatchExtraction();

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

    if (file.size > 10 * 1024 * 1024) {
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <AppSidebar />
        <SidebarInset>
          <BatchExtractorPageHeader />
          
          <div className="p-6">
            <BatchExtractorPageContent
              prompts={prompts}
              setPrompts={setPrompts}
              batchName={batchName}
              setBatchName={setBatchName}
              targetUrl={targetUrl}
              setTargetUrl={setTargetUrl}
              isProcessing={isProcessing}
              CHARACTER_LIMIT={CHARACTER_LIMIT}
              characterCount={characterCount}
              isOverLimit={isOverLimit}
              handleExtract={handleExtract}
              handleFileUpload={handleFileUpload}
              getCharacterCountColor={getCharacterCountColor}
              getEffectiveTargetUrl={getEffectiveTargetUrl}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BatchExtractor;
