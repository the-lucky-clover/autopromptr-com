import { useState, useCallback } from 'react';
import { dockerApiClient } from '@/services/dockerApiClient';
import { toast } from 'sonner';

interface PlatformDetectionResult {
  platform: string;
  confidence: number;
  detectionMethod: string;
  supportedFeatures: string[];
  chatInterface?: {
    inputSelector: string;
    submitSelector: string;
    responseSelector: string;
  };
}

interface DetectionOptions {
  url?: string;
  screenshot?: string;
  domAnalysis?: boolean;
  aiAnalysis?: boolean;
}

export function useUniversalPlatformDetection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<PlatformDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectPlatform = useCallback(async (options: DetectionOptions) => {
    setIsDetecting(true);
    setError(null);
    
    try {
      const result = await dockerApiClient.detectPlatform(options.url || window.location.href);
      setDetectionResult(result);
      
      if (result.confidence > 0.8) {
        toast.success(`Detected ${result.platform} with ${Math.round(result.confidence * 100)}% confidence`);
      } else {
        toast.warning(`Low confidence detection: ${result.platform} (${Math.round(result.confidence * 100)}%)`);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Platform detection failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const clearDetection = useCallback(() => {
    setDetectionResult(null);
    setError(null);
  }, []);

  return {
    detectPlatform,
    clearDetection,
    isDetecting,
    detectionResult,
    error,
    // Convenience methods for common platforms
    detectCurrentPage: () => detectPlatform({ url: window.location.href }),
    detectWithScreenshot: (screenshot: string) => detectPlatform({ screenshot, aiAnalysis: true }),
    detectWithDomAnalysis: () => detectPlatform({ domAnalysis: true })
  };
}