
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Server, Check, X, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { AutoPromptr } from "@/services/autoPromptr";
import { useToast } from "@/hooks/use-toast";

export const BackendConfigurationCard = () => {
  const [backendUrl, setBackendUrl] = useState('https://autopromptr-backend.onrender.com');
  const [apiKey, setApiKey] = useState('');
  const [enhancedMode, setEnhancedMode] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const testConnection = async () => {
    setTesting(true);
    try {
      const autoPromptr = new AutoPromptr(backendUrl);
      await autoPromptr.healthCheck();
      setConnectionStatus('connected');
      toast({
        title: "Connection successful",
        description: "Backend is responding correctly.",
      });
    } catch (err) {
      setConnectionStatus('failed');
      toast({
        title: "Connection failed",
        description: err instanceof Error ? err.message : 'Unable to connect to backend',
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const saveConfiguration = () => {
    localStorage.setItem('autopromptr_backend_url', backendUrl);
    localStorage.setItem('autopromptr_api_key', apiKey);
    localStorage.setItem('autopromptr_enhanced_mode', enhancedMode.toString());
    
    toast({
      title: "Configuration saved",
      description: "Backend settings have been updated.",
    });
  };

  // Load saved configuration
  useEffect(() => {
    const savedUrl = localStorage.getItem('autopromptr_backend_url');
    const savedKey = localStorage.getItem('autopromptr_api_key');
    const savedEnhanced = localStorage.getItem('autopromptr_enhanced_mode');
    
    if (savedUrl) setBackendUrl(savedUrl);
    if (savedKey) setApiKey(savedKey);
    if (savedEnhanced) setEnhancedMode(savedEnhanced === 'true');
  }, []);

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-white" />
            <CardTitle className="text-white">Backend Configuration</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                <Check className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
            {connectionStatus === 'failed' && (
              <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
                <X className="h-3 w-3 mr-1" />
                Failed
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-purple-200">
          Configure your AutoPromptr backend connection and API settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-white">Backend URL</Label>
          <Input
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="https://your-backend.com"
            className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
          />
          <p className="text-sm text-purple-200">
            URL of your AutoPromptr backend service
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-white">API Key (Optional)</Label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
          />
          <p className="text-sm text-purple-200">
            Authentication key for secured backend endpoints
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-white">Enhanced Mode</Label>
            <p className="text-sm text-purple-200">Use enhanced automation with better element detection</p>
          </div>
          <Switch 
            checked={enhancedMode} 
            onCheckedChange={setEnhancedMode}
          />
        </div>

        <div className="flex space-x-3">
          <Button 
            onClick={testConnection}
            disabled={testing}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Settings className="h-4 w-4 mr-2" />
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          
          <Button 
            onClick={saveConfiguration}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Save Configuration
          </Button>
        </div>

        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
          <h4 className="text-blue-300 font-medium mb-2">Backend Improvements</h4>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Enhanced element detection for Lovable chat interfaces</li>
            <li>• Multiple submission strategies (Enter, buttons, shortcuts)</li>
            <li>• Improved timing and page load detection</li>
            <li>• Better error logging and retry mechanisms</li>
            <li>• Authentication fixes for status polling</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
