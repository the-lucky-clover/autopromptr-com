
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const LocalSimulationCard = () => {
  const [simulationEnabled, setSimulationEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const enabled = localStorage.getItem('autopromptr_local_simulation') === 'true';
    setSimulationEnabled(enabled);
  }, []);

  const handleToggleSimulation = (enabled: boolean) => {
    setSimulationEnabled(enabled);
    localStorage.setItem('autopromptr_local_simulation', enabled.toString());
    
    toast({
      title: enabled ? "Local simulation enabled" : "Local simulation disabled",
      description: enabled 
        ? "Batch processing will now run in simulation mode for testing purposes."
        : "Batch processing will attempt to use the configured backend service.",
    });
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Play className="h-5 w-5 text-white" />
          <CardTitle className="text-white">Local Simulation Mode</CardTitle>
        </div>
        <CardDescription className="text-purple-200">
          Enable local simulation for testing batch processing without a backend service
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-white">Enable Simulation Mode</Label>
            <p className="text-sm text-purple-200">
              Process batches locally for testing and development
            </p>
          </div>
          <Switch 
            checked={simulationEnabled} 
            onCheckedChange={handleToggleSimulation}
          />
        </div>

        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-300 mt-0.5 flex-shrink-0" />
            <div className="text-blue-200 text-sm">
              <p className="font-medium mb-1">How Simulation Mode Works:</p>
              <ul className="space-y-1 text-xs">
                <li>• Batches run locally without connecting to external services</li>
                <li>• Simulates realistic processing times and responses</li>
                <li>• Perfect for testing your batch configurations</li>
                <li>• No actual prompts are sent to target platforms</li>
                <li>• Automatically enables when backend is unavailable</li>
              </ul>
            </div>
          </div>
        </div>

        {simulationEnabled && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
            <p className="text-green-200 text-sm font-medium">
              ✅ Simulation mode is active. Your batches will run locally for testing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
