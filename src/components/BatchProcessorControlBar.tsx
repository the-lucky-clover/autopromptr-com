
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Globe, Sparkles, Target, RefreshCw, CheckCircle } from "lucide-react";

interface BatchProcessorControlBarProps {
  onRefresh?: () => void;
  onNewBatch?: () => void;
}

const BatchProcessorControlBar = ({ onRefresh }: BatchProcessorControlBarProps) => {
  const [targetUrlOverride, setTargetUrlOverride] = useState('');
  const [promptEnhancement, setPromptEnhancement] = useState(() => {
    return localStorage.getItem('promptEnhancement') === 'true';
  });

  const handlePromptEnhancementToggle = (enabled: boolean) => {
    setPromptEnhancement(enabled);
    localStorage.setItem('promptEnhancement', enabled.toString());
  };

  return (
    <div className="space-y-8">
      {/* Batch Controls Module */}
      <Card className="bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-indigo-900/30 backdrop-blur-sm border-white/20 text-white shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
        <CardContent className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <Settings className="h-6 w-6 text-purple-400" />
              Batch Controls
            </h2>
            <p className="text-purple-200 text-sm font-medium">Configure automation settings and batch processing options</p>
          </div>

          <div className="flex flex-col xl:flex-row items-start xl:items-center gap-8">
            {/* Left Section - Main Controls */}
            <div className="flex items-center gap-6">
              <Button
                onClick={onRefresh}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl px-6 py-3 font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </Button>

              {/* Ready Status Indicator */}
              <div className="flex items-center gap-4 bg-green-500/20 border border-green-500/30 rounded-xl px-6 py-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div className="text-center">
                  <div className="text-green-400 font-bold text-lg">Ready to Automate</div>
                  <div className="text-green-300/80 text-sm font-medium">System Online</div>
                </div>
              </div>
            </div>

            <Separator orientation="vertical" className="h-12 bg-white/20 hidden xl:block" />

            {/* Center Section - Target URL Override */}
            <div className="flex-1 max-w-lg">
              <div className="space-y-3">
                <Label htmlFor="target-override" className="text-base font-medium text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  Target URL Override
                </Label>
                <Input
                  id="target-override"
                  type="text"
                  value={targetUrlOverride}
                  onChange={(e) => setTargetUrlOverride(e.target.value)}
                  placeholder="Override target URL for all batches"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl py-3 px-4 text-base focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                />
              </div>
            </div>

            <Separator orientation="vertical" className="h-12 bg-white/20 hidden xl:block" />

            {/* Right Section - Prompt Enhancement Toggle */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <Sparkles className="h-6 w-6 text-purple-400" />
                <div className="flex items-center gap-3">
                  <Label htmlFor="prompt-enhancement-toggle" className="text-base font-medium text-white">
                    Prompt Enhancement
                  </Label>
                  <Switch
                    id="prompt-enhancement-toggle"
                    checked={promptEnhancement}
                    onCheckedChange={handlePromptEnhancementToggle}
                    className="data-[state=checked]:bg-purple-600 scale-110"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Status Indicators */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-300 text-base font-medium">
                    {targetUrlOverride ? `Override: ${targetUrlOverride}` : 'No URL override set'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${promptEnhancement ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span className="text-white/80 text-base font-medium">
                  Enhancement {promptEnhancement ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchProcessorControlBar;
