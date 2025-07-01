
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Globe, Sparkles, Target, Play, RefreshCw } from "lucide-react";

interface BatchProcessorControlBarProps {
  onRefresh?: () => void;
  onNewBatch?: () => void;
}

const BatchProcessorControlBar = ({ onRefresh, onNewBatch }: BatchProcessorControlBarProps) => {
  const [targetUrlOverride, setTargetUrlOverride] = useState('');
  const [promptEnhancement, setPromptEnhancement] = useState(() => {
    return localStorage.getItem('promptEnhancement') === 'true';
  });

  const handlePromptEnhancementToggle = (enabled: boolean) => {
    setPromptEnhancement(enabled);
    localStorage.setItem('promptEnhancement', enabled.toString());
  };

  return (
    <Card className="bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm border-white/20 text-white shadow-2xl">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Left Section - Main Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-400" />
              <span className="font-semibold text-lg">Batch Controls</span>
            </div>
            
            <Separator orientation="vertical" className="h-8 bg-white/20" />
            
            <Button
              onClick={onNewBatch}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2 font-medium shadow-lg"
            >
              <Play className="w-4 h-4 mr-2" />
              New Batch
            </Button>
            
            <Button
              onClick={onRefresh}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl px-4 py-2"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Center Section - Target URL Override */}
          <div className="flex-1 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="target-override" className="text-sm font-medium text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400" />
                Target URL Override
              </Label>
              <Input
                id="target-override"
                type="text"
                value={targetUrlOverride}
                onChange={(e) => setTargetUrlOverride(e.target.value)}
                placeholder="Override target URL for all batches"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg"
              />
            </div>
          </div>

          {/* Right Section - Prompt Enhancement Toggle */}
          <div className="flex items-center gap-4">
            <Separator orientation="vertical" className="h-8 bg-white/20 hidden lg:block" />
            
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <div className="flex items-center gap-2">
                <Label htmlFor="prompt-enhancement-toggle" className="text-sm font-medium text-white">
                  Prompt Enhancement
                </Label>
                <Switch
                  id="prompt-enhancement-toggle"
                  checked={promptEnhancement}
                  onCheckedChange={handlePromptEnhancementToggle}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Status Indicators */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300">
                  {targetUrlOverride ? `Override: ${targetUrlOverride}` : 'No URL override set'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${promptEnhancement ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span className="text-white/80">
                Enhancement {promptEnhancement ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchProcessorControlBar;
