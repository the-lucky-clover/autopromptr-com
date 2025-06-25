
import { useState, useEffect } from 'react';
import { EnhancedSecureStorage } from '@/services/security/enhancedSecureStorage';
import { SecurityMonitor } from '@/services/security/securityMonitor';
import { useToast } from '@/hooks/use-toast';

export const useSecureApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      
      // Load common API keys using enhanced storage
      const openaiKey = await EnhancedSecureStorage.getApiKey('openai_api_key');
      
      setApiKeys({
        openai_api_key: openaiKey || '',
      });

      SecurityMonitor.logSecurityEvent(
        'api_key_access',
        'low',
        'API keys loaded from secure storage',
        { keyCount: openaiKey ? 1 : 0 }
      );
    } catch (error) {
      console.error('Failed to load API keys:', error);
      SecurityMonitor.logSecurityEvent(
        'api_key_access',
        'high',
        'Failed to load API keys from secure storage',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      
      toast({
        title: "Failed to load API keys",
        description: "Please re-enter your API keys for security.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const storeApiKey = async (keyName: string, apiKey: string) => {
    // Check rate limiting
    if (!SecurityMonitor.checkRateLimit(`api_key_store_${keyName}`, 10, 60000)) {
      toast({
        title: "Rate limit exceeded",
        description: "Too many API key operations. Please wait before trying again.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!apiKey || apiKey.trim().length === 0) {
        throw new Error('API key cannot be empty');
      }

      // Basic validation for OpenAI keys
      if (keyName === 'openai_api_key' && !apiKey.startsWith('sk-')) {
        throw new Error('Invalid OpenAI API key format');
      }

      // Additional security validation
      const validation = SecurityMonitor.validateInput(apiKey, `api_key_${keyName}`);
      if (!validation.isValid) {
        SecurityMonitor.logSecurityEvent(
          'suspicious_activity',
          'critical',
          `Attempted to store suspicious API key: ${keyName}`,
          { threats: validation.threats, keyName }
        );
        throw new Error('API key contains suspicious content');
      }

      await EnhancedSecureStorage.storeApiKey(keyName, apiKey.trim());
      
      setApiKeys(prev => ({
        ...prev,
        [keyName]: apiKey.trim()
      }));

      SecurityMonitor.logSecurityEvent(
        'api_key_access',
        'medium',
        `API key stored successfully: ${keyName}`,
        { keyName }
      );

      toast({
        title: "API key stored securely",
        description: `${keyName} has been encrypted and stored with enhanced security.`,
      });
    } catch (error) {
      console.error('Failed to store API key:', error);
      SecurityMonitor.logSecurityEvent(
        'api_key_access',
        'high',
        `Failed to store API key: ${keyName}`,
        { keyName, error: error instanceof Error ? error.message : 'Unknown error' }
      );
      
      toast({
        title: "Failed to store API key",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const removeApiKey = (keyName: string) => {
    try {
      EnhancedSecureStorage.removeApiKey(keyName);
      setApiKeys(prev => {
        const updated = { ...prev };
        delete updated[keyName];
        return updated;
      });

      SecurityMonitor.logSecurityEvent(
        'api_key_access',
        'medium',
        `API key removed: ${keyName}`,
        { keyName }
      );

      toast({
        title: "API key removed",
        description: `${keyName} has been removed from secure storage.`,
      });
    } catch (error) {
      console.error('Failed to remove API key:', error);
      SecurityMonitor.logSecurityEvent(
        'api_key_access',
        'high',
        `Failed to remove API key: ${keyName}`,
        { keyName, error: error instanceof Error ? error.message : 'Unknown error' }
      );
      
      toast({
        title: "Failed to remove API key",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getApiKey = (keyName: string): string | null => {
    SecurityMonitor.logSecurityEvent(
      'api_key_access',
      'low',
      `API key accessed: ${keyName}`,
      { keyName }
    );
    return apiKeys[keyName] || null;
  };

  const hasApiKey = (keyName: string): boolean => {
    return !!(apiKeys[keyName] && apiKeys[keyName].length > 0);
  };

  const getSecurityAudit = () => {
    return EnhancedSecureStorage.getSecurityAudit();
  };

  return {
    apiKeys,
    loading,
    storeApiKey,
    removeApiKey,
    getApiKey,
    hasApiKey,
    refreshApiKeys: loadApiKeys,
    getSecurityAudit
  };
};
