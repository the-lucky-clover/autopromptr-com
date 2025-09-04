import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Eye, Brain, Globe } from 'lucide-react';
import { useUniversalPlatformDetection } from '@/hooks/useUniversalPlatformDetection';

export function UniversalPlatformDetector() {
  const [targetUrl, setTargetUrl] = useState('');
  const { 
    detectPlatform, 
    clearDetection, 
    isDetecting, 
    detectionResult, 
    error,
    detectCurrentPage 
  } = useUniversalPlatformDetection();

  const handleDetectUrl = async () => {
    if (!targetUrl) return;
    await detectPlatform({ url: targetUrl });
  };

  const handleDetectCurrentPage = async () => {
    await detectCurrentPage();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-500';
    if (confidence >= 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Universal Platform Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={handleDetectCurrentPage}
            disabled={isDetecting}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Detect Current Page
          </Button>
          <Button
            onClick={clearDetection}
            variant="ghost"
            size="sm"
          >
            Clear
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Enter URL to detect platform..."
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            disabled={isDetecting}
          />
          <Button
            onClick={handleDetectUrl}
            disabled={isDetecting || !targetUrl}
          >
            {isDetecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 border border-red-200 rounded-lg bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {detectionResult && (
          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{detectionResult.platform}</h3>
              <div className="flex items-center gap-2">
                <div 
                  className={`w-3 h-3 rounded-full ${getConfidenceColor(detectionResult.confidence)}`}
                  title={`${Math.round(detectionResult.confidence * 100)}% confidence`}
                />
                <Badge variant="secondary">
                  {Math.round(detectionResult.confidence * 100)}% confident
                </Badge>
              </div>
            </div>

            <div className="grid gap-3">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Detection Method
                </h4>
                <Badge variant="outline">{detectionResult.detectionMethod}</Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Supported Features</h4>
                <div className="flex flex-wrap gap-1">
                  {detectionResult.supportedFeatures.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {detectionResult.chatInterface && (
                <div>
                  <h4 className="font-medium mb-2">Chat Interface</h4>
                  <div className="text-sm space-y-1 font-mono bg-muted p-2 rounded">
                    <div>Input: <code>{detectionResult.chatInterface.inputSelector}</code></div>
                    <div>Submit: <code>{detectionResult.chatInterface.submitSelector}</code></div>
                    <div>Response: <code>{detectionResult.chatInterface.responseSelector}</code></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}