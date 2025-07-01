
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Zap, Sparkles } from "lucide-react";

const PromptEnhancementCard = () => {
  const [promptEnhancement, setPromptEnhancement] = React.useState(() => {
    return localStorage.getItem('promptEnhancement') === 'true';
  });

  const handleToggle = (enabled: boolean) => {
    setPromptEnhancement(enabled);
    localStorage.setItem('promptEnhancement', enabled.toString());
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          Prompt Enhancement
        </CardTitle>
        <CardDescription className="text-purple-200">
          Automatically enhance your prompts using AI to improve automation results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="prompt-enhancement" className="text-white font-medium">
              Enable Prompt Enhancement
            </Label>
            <p className="text-sm text-purple-200">
              AI will optimize your prompts for better automation performance
            </p>
          </div>
          <Switch
            id="prompt-enhancement"
            checked={promptEnhancement}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>

        {promptEnhancement && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-300">Enhancement Active</h4>
                <p className="text-sm text-purple-200 mt-1">
                  Your prompts will be automatically optimized before processing. This may slightly increase processing time but can significantly improve results.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromptEnhancementCard;
