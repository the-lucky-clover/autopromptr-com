
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Key, Trash2, Save, Shield, AlertTriangle } from "lucide-react";
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';
import { SecurityMonitor } from '@/services/security/securityMonitor';

export const SecureApiKeyManager = () => {
  const { apiKeys, loading, storeApiKey, removeApiKey, hasApiKey } = useSecureApiKeys();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [tempKeys, setTempKeys] = useState<Record<string, string>>({});

  const toggleShowKey = (keyName: string) => {
    SecurityMonitor.logSecurityEvent(
      'api_key_access',
      'low',
      `API key visibility toggled for ${keyName}`,
      { keyName, action: showKeys[keyName] ? 'hide' : 'show' }
    );
    
    setShowKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const handleKeyChange = (keyName: string, value: string) => {
    // Validate input for security threats
    const validation = SecurityMonitor.validateInput(value, `api_key_${keyName}`);
    
    if (!validation.isValid) {
      SecurityMonitor.logSecurityEvent(
        'suspicious_activity',
        'high',
        `Suspicious input detected in API key field: ${keyName}`,
        { threats: validation.threats, keyName }
      );
      return; // Don't update if suspicious
    }

    setTempKeys(prev => ({
      ...prev,
      [keyName]: value
    }));
  };

  const handleSaveKey = async (keyName: string) => {
    const value = tempKeys[keyName];
    if (value) {
      try {
        await storeApiKey(keyName, value);
        setTempKeys(prev => {
          const updated = { ...prev };
          delete updated[keyName];
          return updated;
        });
        
        SecurityMonitor.logSecurityEvent(
          'api_key_access',
          'medium',
          `API key stored securely: ${keyName}`,
          { keyName }
        );
      } catch (error) {
        SecurityMonitor.logSecurityEvent(
          'api_key_access',
          'high',
          `Failed to store API key: ${keyName}`,
          { keyName, error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    }
  };

  const handleRemoveKey = (keyName: string) => {
    SecurityMonitor.logSecurityEvent(
      'api_key_access',
      'medium',
      `API key removed: ${keyName}`,
      { keyName }
    );
    
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
          <Shield className="h-5 w-5 text-green-400" />
          <CardTitle className="text-white">Enhanced Secure API Key Manager</CardTitle>
        </div>
        <CardDescription className="text-purple-200">
          API keys are encrypted with AES-256-GCM and monitored for security threats
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
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Secured
                  </span>
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
        
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Enhanced Security Features
          </h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• AES-256-GCM encryption with PBKDF2 key derivation</li>
            <li>• Input validation against XSS and injection attacks</li>
            <li>• Security event monitoring and audit logging</li>
            <li>• Rate limiting on API key operations</li>
            <li>• Automatic migration from legacy storage formats</li>
            <li>• Metadata integrity verification</li>
          </ul>
        </div>

        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-400 font-medium text-sm">Security Notice</span>
          </div>
          <p className="text-gray-300 text-sm">
            All API key operations are monitored for security. Suspicious activity will be logged and may trigger additional security measures.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
