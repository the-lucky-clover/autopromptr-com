
import { useState, useEffect } from 'react';
import { SecureStorage } from '@/services/security/secureStorage';
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
      
      // Load common API keys
      const openaiKey = await SecureStorage.getApiKey('openai_api_key');
      
      setApiKeys({
        openai_api_key: openaiKey || '',
      });
    } catch (error) {
      console.error('Failed to load API keys:', error);
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
    try {
      if (!apiKey || apiKey.trim().length === 0) {
        throw new Error('API key cannot be empty');
      }

      // Basic validation for OpenAI keys
      if (keyName === 'openai_api_key' && !apiKey.startsWith('sk-')) {
        throw new Error('Invalid OpenAI API key format');
      }

      await SecureStorage.storeApiKey(keyName, apiKey.trim());
      
      setApiKeys(prev => ({
        ...prev,
        [keyName]: apiKey.trim()
      }));

      toast({
        title: "API key stored securely",
        description: `${keyName} has been encrypted and stored safely.`,
      });
    } catch (error) {
      console.error('Failed to store API key:', error);
      toast({
        title: "Failed to store API key",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const removeApiKey = (keyName: string) => {
    try {
      SecureStorage.removeApiKey(keyName);
      setApiKeys(prev => {
        const updated = { ...prev };
        delete updated[keyName];
        return updated;
      });

      toast({
        title: "API key removed",
        description: `${keyName} has been removed from secure storage.`,
      });
    } catch (error) {
      console.error('Failed to remove API key:', error);
      toast({
        title: "Failed to remove API key",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getApiKey = (keyName: string): string | null => {
    return apiKeys[keyName] || null;
  };

  const hasApiKey = (keyName: string): boolean => {
    return !!(apiKeys[keyName] && apiKeys[keyName].length > 0);
  };

  return {
    apiKeys,
    loading,
    storeApiKey,
    removeApiKey,
    getApiKey,
    hasApiKey,
    refreshApiKeys: loadApiKeys
  };
};
