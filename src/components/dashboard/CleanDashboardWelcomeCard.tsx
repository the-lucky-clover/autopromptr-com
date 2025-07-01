
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import EnhancedRealTimeClock from '@/components/EnhancedRealTimeClock';
import { useDashboardGreeting } from '@/hooks/useDashboardGreeting';
import { useDashboardVideoSettings } from '@/hooks/useDashboardVideoSettings';
import { useAuth } from '@/hooks/useAuth';
import WelcomeVideoBackground from './WelcomeVideoBackground';

const CleanDashboardWelcomeCard = () => {
  const currentGreeting = useDashboardGreeting();
  const { user } = useAuth();
  const { videoSettings } = useDashboardVideoSettings(user);

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 relative overflow-hidden">
      <WelcomeVideoBackground
        videoUrl={videoSettings.videoUrl}
        opacity={videoSettings.opacity}
        blendMode={videoSettings.blendMode}
        enabled={videoSettings.enabled}
        showAttribution={videoSettings.showAttribution}
      />
      
      <div className="absolute top-4 right-4 z-20">
        <EnhancedRealTimeClock />
      </div>
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg backdrop-blur-sm">
              <Zap className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <CardTitle className="text-white text-xl drop-shadow-lg">
                {currentGreeting.greeting} {currentGreeting.firstName}
              </CardTitle>
              <p className="text-purple-200 text-sm mt-1 drop-shadow-md">
                {currentGreeting.encouragement}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-white/90 text-sm drop-shadow-md">
              Ready to automate your workflow
            </p>
            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 backdrop-blur-sm">
              System Ready
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <ConnectionStatus />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CleanDashboardWelcomeCard;
