import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Cloud, Server, Rocket } from "lucide-react";
import { useState, useEffect } from "react";

export const BackendModeCard = () => {
  const [backendMode, setBackendMode] = useState<'lovable-cloud' | 'legacy-render'>('lovable-cloud');

  useEffect(() => {
    const saved = localStorage.getItem('autopromptr_backend_mode');
    if (saved) {
      setBackendMode(saved as any);
    }
  }, []);

  const handleModeChange = (value: string) => {
    setBackendMode(value as any);
    localStorage.setItem('autopromptr_backend_mode', value);
    window.location.reload(); // Reload to apply changes
  };

  return (
    <Card className="card-neo">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Backend Mode
            </CardTitle>
            <CardDescription>
              Choose between Lovable Cloud or legacy Render.com backend
            </CardDescription>
          </div>
          {backendMode === 'lovable-cloud' && (
            <Badge variant="default" className="bg-green-500">
              <Cloud className="h-3 w-3 mr-1" />
              Cloud Enabled
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={backendMode} onValueChange={handleModeChange}>
          <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer">
            <RadioGroupItem value="lovable-cloud" id="lovable-cloud" />
            <Label htmlFor="lovable-cloud" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-green-500" />
                <span className="font-medium">Lovable Cloud</span>
                <Badge variant="outline" className="text-xs">Recommended</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Serverless edge functions powered by Supabase. Faster, more reliable, and no external dependencies.
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">Free Tier</Badge>
                <Badge variant="secondary" className="text-xs">Global CDN</Badge>
                <Badge variant="secondary" className="text-xs">Auto-scaling</Badge>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer">
            <RadioGroupItem value="legacy-render" id="legacy-render" />
            <Label htmlFor="legacy-render" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Legacy Render.com Backend</span>
                <Badge variant="outline" className="text-xs">Deprecated</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Original Flask backend on Render.com. Slower cold starts, requires external server.
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">Flask + Python</Badge>
                <Badge variant="secondary" className="text-xs">External Dependency</Badge>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {backendMode === 'lovable-cloud' && (
          <Alert className="bg-green-500/10 border-green-500/50">
            <Cloud className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-sm">
              <strong>Lovable Cloud is now active!</strong> All batch operations are powered by Supabase Edge Functions.
              Enjoy faster response times, global edge deployment, and unlimited scalability.
            </AlertDescription>
          </Alert>
        )}

        {backendMode === 'legacy-render' && (
          <Alert variant="destructive" className="bg-orange-500/10 border-orange-500/50">
            <Server className="h-4 w-4 text-orange-500" />
            <AlertDescription className="text-sm">
              <strong>Legacy mode enabled.</strong> You're using the deprecated Render.com backend.
              Consider migrating to Lovable Cloud for better performance and reliability.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
