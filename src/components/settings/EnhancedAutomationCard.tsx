
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Target, Clock, Bug } from "lucide-react";
import { useState } from "react";

export const EnhancedAutomationCard = () => {
  const [enhancedDetection, setEnhancedDetection] = useState(true);
  const [multipleStrategies, setMultipleStrategies] = useState(true);
  const [adaptiveTiming, setAdaptiveTiming] = useState(true);
  const [enhancedRetries, setEnhancedRetries] = useState([5]);
  const [automationDelay, setAutomationDelay] = useState([3000]);
  const [elementTimeout, setElementTimeout] = useState([15000]);
  const [debugLevel, setDebugLevel] = useState('verbose');

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <CardTitle className="text-white">Enhanced Automation</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
            NEW
          </Badge>
        </div>
        <CardDescription className="text-purple-200">
          Advanced automation features with improved reliability for Lovable
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white flex items-center">
                <Target className="h-4 w-4 mr-1" />
                Enhanced Detection
              </Label>
              <p className="text-sm text-purple-200">Multiple element detection strategies</p>
            </div>
            <Switch 
              checked={enhancedDetection} 
              onCheckedChange={setEnhancedDetection}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white">Multiple Submission</Label>
              <p className="text-sm text-purple-200">Try different ways to submit</p>
            </div>
            <Switch 
              checked={multipleStrategies} 
              onCheckedChange={setMultipleStrategies}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Adaptive Timing
              </Label>
              <p className="text-sm text-purple-200">Smart delays based on page state</p>
            </div>
            <Switch 
              checked={adaptiveTiming} 
              onCheckedChange={setAdaptiveTiming}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white flex items-center">
              <Bug className="h-4 w-4 mr-1" />
              Debug Level
            </Label>
            <Select value={debugLevel} onValueChange={setDebugLevel}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="verbose">Verbose</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-0.5">
              <Label className="text-white">Enhanced Retries: {enhancedRetries[0]}</Label>
              <p className="text-sm text-purple-200">Number of retry attempts with progressive backoff</p>
            </div>
            <Slider
              value={enhancedRetries}
              onValueChange={setEnhancedRetries}
              max={10}
              min={3}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-0.5">
              <Label className="text-white">Automation Delay: {automationDelay[0]}ms</Label>
              <p className="text-sm text-purple-200">Initial delay before starting automation</p>
            </div>
            <Slider
              value={automationDelay}
              onValueChange={setAutomationDelay}
              max={10000}
              min={1000}
              step={500}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-0.5">
              <Label className="text-white">Element Timeout: {elementTimeout[0]}ms</Label>
              <p className="text-sm text-purple-200">How long to wait for elements to appear</p>
            </div>
            <Slider
              value={elementTimeout}
              onValueChange={setElementTimeout}
              max={30000}
              min={10000}
              step={2500}
              className="w-full"
            />
          </div>
        </div>

        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
          <h4 className="text-green-300 font-medium mb-2">Enhanced Features Active</h4>
          <ul className="text-green-200 text-sm space-y-1">
            <li>• Multi-strategy element detection (Direct, Visible, Focus)</li>
            <li>• Progressive retry backoff for reliability</li>
            <li>• Multiple submission methods (Enter, Click, Ctrl+Enter)</li>
            <li>• Lovable-specific page readiness detection</li>
            <li>• Enhanced error categorization and recovery</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
