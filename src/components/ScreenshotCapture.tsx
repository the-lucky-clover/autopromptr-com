
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useScreenshots } from '@/hooks/useScreenshots';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ScreenshotCapture = () => {
  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => `session-${Date.now()}`);
  const [corsError, setCorsError] = useState(false);
  const { saveScreenshot } = useScreenshots();
  const { toast } = useToast();

  const captureScreenshot = async () => {
    if (!url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a URL to capture",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setCorsError(false);
    
    try {
      // Call your Puppeteer backend
      const response = await fetch('https://puppeteer-backend-da0o.onrender.com/api/run-puppeteer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          prompt: prompt.trim() || undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.screenshot) {
        // Save screenshot using our hook
        await saveScreenshot(
          sessionId,
          data.screenshot,
          url.trim(),
          prompt.trim() || undefined,
          {
            capturedAt: new Date().toISOString(),
            backendResponse: data
          }
        );

        // Clear form
        setPrompt('');
        
        toast({
          title: "Screenshot captured",
          description: "Screenshot has been captured and saved successfully",
        });
      } else {
        throw new Error('No screenshot returned from backend');
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      
      // Check if it's a CORS error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('CORS') || errorMessage.includes('fetch')) {
        setCorsError(true);
        toast({
          title: "CORS Configuration Required",
          description: "The backend needs to be configured to allow requests from this domain.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Capture failed",
          description: "Failed to capture screenshot. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Capture Screenshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {corsError && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>CORS Configuration Required:</strong> The Puppeteer backend needs to allow requests from this domain. 
              Add the following header to your backend:
              <code className="block mt-2 p-2 bg-gray-100 rounded text-sm">
                Access-Control-Allow-Origin: https://1fec766e-41d8-4e0e-9e5c-277ce2efbe11.lovableproject.com
              </code>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="session-id">Session ID</Label>
          <Input
            id="session-id"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Enter session ID"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">Target URL</Label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt (Optional)</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter any prompt or description for this capture..."
            rows={3}
          />
        </div>

        <Button 
          onClick={captureScreenshot} 
          disabled={loading || !url.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Capturing...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Capture Screenshot
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ScreenshotCapture;
