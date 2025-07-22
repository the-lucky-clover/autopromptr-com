import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LargeTextInputModule = () => {
  const [text, setText] = useState('');
  const { toast } = useToast();
  
  // Liberal character limit - 50,000 characters
  const CHARACTER_LIMIT = 50000;
  
  const getWordCount = (text: string) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };
  
  const getCharacterCount = (text: string) => {
    return text.length;
  };
  
  const getCharacterCountColor = (count: number) => {
    const percentage = (count / CHARACTER_LIMIT) * 100;
    if (percentage < 70) return 'text-green-400';
    if (percentage < 90) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied successfully",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy text to clipboard",
        variant: "destructive",
      });
    }
  };
  
  const handleClear = () => {
    setText('');
    toast({
      title: "Text cleared",
      description: "Input field has been cleared",
    });
  };
  
  const wordCount = getWordCount(text);
  const characterCount = getCharacterCount(text);
  const characterCountColor = getCharacterCountColor(characterCount);

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-xl text-white">Large Text Input</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={text.length === 0}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={text.length === 0}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Text Input Area */}
        <div className="relative">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your large text content here. This field supports up to 50,000 characters and is perfect for pasting articles, documents, or any substantial text content that you want to process into prompt batches..."
            className="min-h-[400px] bg-white/5 border-white/20 text-white placeholder:text-gray-400 resize-y"
            maxLength={CHARACTER_LIMIT}
          />
        </div>
        
        {/* Counters */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Words:</span>
              <span className="text-blue-400 font-medium">{wordCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Characters:</span>
              <span className={`font-medium ${characterCountColor}`}>
                {characterCount.toLocaleString()} / {CHARACTER_LIMIT.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="text-gray-500 text-xs">
            {CHARACTER_LIMIT - characterCount > 0 
              ? `${(CHARACTER_LIMIT - characterCount).toLocaleString()} characters remaining`
              : 'Character limit reached'
            }
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              characterCount / CHARACTER_LIMIT < 0.7 
                ? 'bg-green-400' 
                : characterCount / CHARACTER_LIMIT < 0.9 
                ? 'bg-yellow-400' 
                : 'bg-red-400'
            }`}
            style={{ width: `${Math.min((characterCount / CHARACTER_LIMIT) * 100, 100)}%` }}
          />
        </div>
        
        {/* Helper Text */}
        <div className="text-xs text-gray-400 bg-white/5 rounded-lg p-3 border border-white/10">
          <p className="mb-2">
            <strong className="text-white">Usage Tips:</strong>
          </p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Paste large documents, articles, or any substantial text content</li>
            <li>Use this as a staging area before processing into prompt batches</li>
            <li>The field supports up to 50,000 characters for extensive content</li>
            <li>Copy button allows you to easily transfer processed content</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default LargeTextInputModule;