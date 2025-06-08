
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Cog } from "lucide-react";
import { useState } from "react";

export const AutomationSettingsCard = () => {
  const [waitForIdle, setWaitForIdle] = useState(true);
  const [maxRetries, setMaxRetries] = useState([3]); // Default to 3 retries instead of 0
  const [automationDelay, setAutomationDelay] = useState([2000]); // 2 second delay
  const [elementTimeout, setElementTimeout] = useState([10000]); // 10 second timeout

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Cog className="h-5 w-5 text-white" />
          <CardTitle className="text-white">Automation Settings</CardTitle>
        </div>
        <CardDescription className="text-purple-200">
          Configure automation behavior and timing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-white">Wait for Page Idle</Label>
            <p className="text-sm text-purple-200">Wait for page to finish loading before automation</p>
          </div>
          <Switch 
            checked={waitForIdle} 
            onCheckedChange={setWaitForIdle}
          />
        </div>

        <div className="space-y-3">
          <div className="space-y-0.5">
            <Label className="text-white">Max Retries: {maxRetries[0]}</Label>
            <p className="text-sm text-purple-200">Number of retry attempts if automation fails</p>
          </div>
          <Slider
            value={maxRetries}
            onValueChange={setMaxRetries}
            max={10}
            min={0}
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
            min={500}
            step={500}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="space-y-0.5">
            <Label className="text-white">Element Wait Timeout: {elementTimeout[0]}ms</Label>
            <p className="text-sm text-purple-200">How long to wait for elements to appear</p>
          </div>
          <Slider
            value={elementTimeout}
            onValueChange={setElementTimeout}
            max={30000}
            min={5000}
            step={1000}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Debug Level</Label>
          <Select defaultValue="detailed">
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="minimal">Minimal Logging</SelectItem>
              <SelectItem value="standard">Standard Logging</SelectItem>
              <SelectItem value="detailed">Detailed Logging</SelectItem>
              <SelectItem value="verbose">Verbose Logging</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
          <h4 className="text-blue-300 font-medium mb-2">Recommended Settings for Lovable</h4>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Wait for Idle: ON (pages load dynamically)</li>
            <li>• Max Retries: 3-5 (handles timing issues)</li>
            <li>• Automation Delay: 2-3 seconds</li>
            <li>• Element Timeout: 10+ seconds</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
