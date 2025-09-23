import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { localCompanionService, LocalCompanionInfo } from '@/services/localCompanionService';
import { useToast } from '@/hooks/use-toast';

export const LocalCompanionStatus = () => {
  const [companionInfo, setCompanionInfo] = useState<LocalCompanionInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkCompanionStatus = async () => {
    setIsChecking(true);
    try {
      const info = await localCompanionService.checkCompanionAvailability();
      setCompanionInfo(info);
      
      if (info.available) {
        toast({
          title: "Local Companion Connected",
          description: `Version ${info.version} on ${info.platform}`,
        });
      }
    } catch (error) {
      console.error('Failed to check companion status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkCompanionStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkCompanionStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadCompanion = () => {
    // This would link to the download page for the companion app
    toast({
      title: "Download Companion App",
      description: "Check the GitHub releases for the latest AutoPromptr Companion app",
    });
    window.open('https://github.com/your-repo/autopromptr-companion/releases', '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Local Companion
          </CardTitle>
          <CardDescription>
            Desktop app for local IDE integration
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkCompanionStatus}
            disabled={isChecking}
          >
            <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={companionInfo?.available ? 'default' : 'secondary'}>
              {companionInfo?.available ? 'Connected' : 'Not Available'}
            </Badge>
          </div>
          
          {companionInfo?.available ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm">{companionInfo.version}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Platform</span>
                <span className="text-sm capitalize">{companionInfo.platform}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Endpoint</span>
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  {companionInfo.url}
                </code>
              </div>

              {companionInfo.tools && companionInfo.tools.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Available Tools</span>
                  <div className="grid grid-cols-2 gap-2">
                    {companionInfo.tools.map((tool, index) => (
                      <Badge 
                        key={index} 
                        variant={tool.available ? 'default' : 'outline'}
                        className="justify-center"
                      >
                        {tool.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The AutoPromptr Companion app enables direct integration with local IDEs like Cursor, Windsurf, and VS Code.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleDownloadCompanion}
              >
                <Download className="h-3 w-3 mr-1" />
                Download Companion App
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};