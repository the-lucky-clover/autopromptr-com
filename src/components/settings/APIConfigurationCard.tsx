
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Eye, EyeOff, Key } from "lucide-react";
import { useState } from "react";

export const APIConfigurationCard = () => {
  const [showApiKey, setShowApiKey] = useState(false);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText("sk-proj-1234567890abcdef...");
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Key className="h-5 w-5 text-white" />
          <CardTitle className="text-white">API Configuration</CardTitle>
        </div>
        <CardDescription className="text-purple-200">
          Manage your API keys and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey" className="text-white">API Key</Label>
          <div className="flex space-x-2">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              value="sk-proj-1234567890abcdef..."
              disabled
              className="bg-white/5 border-white/10 text-gray-400 flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowApiKey(!showApiKey)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyApiKey}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl">
          Generate New Key
        </Button>
        <div className="space-y-2">
          <Label htmlFor="webhookUrl" className="text-white">Webhook URL</Label>
          <Input
            id="webhookUrl"
            type="url"
            placeholder="https://your-webhook.com/endpoint"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rateLimitTier" className="text-white">Rate Limit Tier</Label>
          <Select defaultValue="standard">
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="basic">Basic - 100 req/min</SelectItem>
              <SelectItem value="standard">Standard - 500 req/min</SelectItem>
              <SelectItem value="premium">Premium - 1000 req/min</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
          Save API Settings
        </Button>
      </CardContent>
    </Card>
  );
};
