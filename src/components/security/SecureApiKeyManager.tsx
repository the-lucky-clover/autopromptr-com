
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Key, Trash2, Save } from "lucide-react";
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';

export const SecureApiKeyManager = () => {
  const { apiKeys, loading, storeApiKey, removeApiKey, hasApiKey } = useSecureApiKeys();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [tempKeys, setTempKeys] = useState<Record<string, string>>({});

  const toggleShowKey = (keyName: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const handleKeyChange = (keyName: string, value: string) => {
    setTempKeys(prev => ({
      ...prev,
      [keyName]: value
    }));
  };

  const handleSaveKey = async (keyName: string) => {
    const value = tempKeys[keyName];
    if (value) {
      await storeApiKey(keyName, value);
      setTempKeys(prev => {
        const updated = { ...prev };
        delete updated[keyName];
        return updated;
      });
    }
  };

  const handleRemoveKey = (keyName: string) => {
    removeApiKey(keyName);
    setTempKeys(prev => {
      const updated = { ...prev };
      delete updated[keyName];
      return updated;
    });
  };

  const keyConfigs = [
    {
      name: 'openai_api_key',
      label: 'OpenAI API Key',
      placeholder: 'sk-...',
      description: 'Required for LangChain processing and AI features'
    }
  ];

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl" data-component="SecureApiKeyManager">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="h-5 w-5" />
            Loading API Keys...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl" data-component="SecureApiKeyManager">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Key className="h-5 w-5 text-white" />
          <CardTitle className="text-white">Secure API Key Manager</CardTitle>
        </div>
        <CardDescription className="text-purple-200">
          API keys are encrypted and stored securely in your browser
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {keyConfigs.map((config) => (
          <div key={config.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor={config.name} className="text-white font-medium">
                {config.label}
              </Label>
              {hasApiKey(config.name) && (
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-sm">✓ Stored</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveKey(config.name)}
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10 h-8 px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            
            <p className="text-gray-400 text-sm">{config.description}</p>
            
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  id={config.name}
                  type={showKeys[config.name] ? "text" : "password"}
                  value={tempKeys[config.name] || ''}
                  onChange={(e) => handleKeyChange(config.name, e.target.value)}
                  placeholder={hasApiKey(config.name) ? "Key stored securely" : config.placeholder}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleShowKey(config.name)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 h-auto"
                >
                  {showKeys[config.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {tempKeys[config.name] && (
                <Button
                  onClick={() => handleSaveKey(config.name)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              )}
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="text-white font-medium mb-2">🔒 Security Notes</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• API keys are encrypted using AES-256-GCM encryption</li>
            <li>• Keys are stored locally in your browser only</li>
            <li>• No keys are transmitted to our servers</li>
            <li>• Clear browser data will remove stored keys</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
