
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadSectionProps {
  onFileContent: (content: string, filename: string) => void;
  isCompact?: boolean;
  characterLimit: number;
}

const FileUploadSection = ({ onFileContent, isCompact = false, characterLimit }: FileUploadSectionProps) => {
  const { toast } = useToast();

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
      if (content.length > characterLimit) {
        toast({
          title: "File content too long",
          description: `File content exceeds ${characterLimit.toLocaleString()} character limit.`,
          variant: "destructive",
        });
        return;
      }
      onFileContent(content, file.name.replace(/\.[^/.]+$/, ""));
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
  );
};

export default FileUploadSection;
