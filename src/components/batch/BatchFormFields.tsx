
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Folder } from "lucide-react";

interface BatchFormFieldsProps {
  formData: {
    name: string;
    targetProjectUrl: string;
    description: string;
    localAIAssistant: 'cursor' | 'windsurf' | 'github-copilot' | 'bolt-diy' | 'roocode';
  };
  errors: {[key: string]: string};
  pathType: string;
  isLocalPath: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLocalAIChange: (value: 'cursor' | 'windsurf' | 'github-copilot' | 'bolt-diy' | 'roocode') => void;
}

const BatchFormFields = ({ 
  formData, 
  errors, 
  pathType, 
  isLocalPath, 
  onInputChange,
  onLocalAIChange 
}: BatchFormFieldsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Enter batch name (e.g., 'Landing Page Updates')"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg"
        />
        {errors.name && (
          <p className="text-red-400 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <div className="relative">
          <Input
            type="text"
            id="targetProjectUrl"
            name="targetProjectUrl"
            value={formData.targetProjectUrl}
            onChange={onInputChange}
            placeholder="https://example.com or /path/to/project"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg pl-10"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {pathType === 'remote' && <Globe className="w-4 h-4 text-blue-400" />}
            {pathType === 'local' && <Folder className="w-4 h-4 text-green-400" />}
          </div>
        </div>
        {pathType !== 'unknown' && (
          <p className="text-blue-300 text-xs mt-1">
            Detected: {pathType === 'remote' ? 'Remote URL' : 'Local Path'}
          </p>
        )}
        {errors.targetProjectUrl && (
          <p className="text-red-400 text-sm mt-1">{errors.targetProjectUrl}</p>
        )}
      </div>

      {isLocalPath && (
        <div>
          <Select 
            onValueChange={onLocalAIChange}
            defaultValue={formData.localAIAssistant}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg">
              <SelectValue placeholder="Select AI coding assistant" />
            </SelectTrigger>
            <SelectContent className="bg-black/70 backdrop-blur-md border-white/10 text-white">
              <SelectItem value="cursor">Cursor</SelectItem>
              <SelectItem value="windsurf">Windsurf</SelectItem>
              <SelectItem value="github-copilot">GitHub Copilot</SelectItem>
              <SelectItem value="bolt-diy">Bolt.DIY</SelectItem>
              <SelectItem value="roocode">Roocode</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder="Describe what this batch will accomplish (optional)"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg resize-none"
        />
      </div>
    </div>
  );
};

export default BatchFormFields;
