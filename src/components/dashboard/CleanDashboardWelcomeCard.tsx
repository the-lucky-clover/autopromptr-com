
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import EnhancedRealTimeClock from '@/components/EnhancedRealTimeClock';
import { useDashboardGreeting } from '@/hooks/useDashboardGreeting';
import { useDashboardVideoSettings } from '@/hooks/useDashboardVideoSettings';
import { useAuth } from '@/hooks/useAuth';
import EnhancedWelcomeVideoBackground from './EnhancedWelcomeVideoBackground';

const CleanDashboardWelcomeCard = () => {
  const currentGreeting = useDashboardGreeting();
  const { user } = useAuth();
  const { videoSettings } = useDashboardVideoSettings(user);

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 relative overflow-hidden">
      <EnhancedWelcomeVideoBackground
        userVideoUrl={videoSettings.videoUrl}
        opacity={videoSettings.opacity}
        blendMode={videoSettings.blendMode}
        enabled={videoSettings.enabled}
      />
      
      <div className="absolute top-4 right-4 z-20">
        <EnhancedRealTimeClock />
      </div>
      
      <CardContent className="p-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[200px]">
          {/* Welcome Text - Lower Left with Professional Spacing */}
          <div className="lg:col-span-8 flex items-end">
            <div className="space-y-4">
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-lg">
                  {currentGreeting.greeting}{' '}
                  <span 
                    className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent drop-shadow-none"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #3B82F6, #EC4899)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    {currentGreeting.firstName}
                  </span>
                </h1>
                {/* Indented Subheading */}
                <div className="ml-8 pl-4 border-l-2 border-purple-400/50">
                  <p className="text-white/90 text-lg font-medium leading-relaxed drop-shadow-md">
                    {currentGreeting.encouragement}
                  </p>
                </div>
              </div>
              
              {/* System Ready Badge */}
              <div className="ml-8">
                <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 backdrop-blur-sm">
                  System Ready
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Connection Status - Right Side */}
          <div className="lg:col-span-4 flex justify-end items-end">
            <ConnectionStatus />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CleanDashboardWelcomeCard;
