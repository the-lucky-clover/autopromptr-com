
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, ExternalLink } from "lucide-react";
import { useSecureApiKeys } from "@/hooks/useSecureApiKeys";

export const APIConfigurationCard = () => {
  const { hasApiKey } = useSecureApiKeys();

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Key className="h-5 w-5 text-white" />
          <CardTitle className="text-white">API Configuration</CardTitle>
        </div>
        <CardDescription className="text-purple-200">
          Manage your API settings and webhooks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white font-medium">🔐 Secure API Keys</h4>
            {hasApiKey('openai_api_key') && (
              <span className="text-green-400 text-sm">✓ Keys Configured</span>
            )}
          </div>
          <p className="text-gray-300 text-sm mb-3">
            API keys are now managed through our secure encryption system above. 
            Your keys are encrypted with AES-256-GCM and stored safely in your browser.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-blue-500/20 text-blue-300 hover:bg-blue-500/10"
            onClick={() => {
              const element = document.querySelector('[data-component="SecureApiKeyManager"]');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Go to Secure API Manager
          </Button>
        </div>

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
