
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import AnimatedDropdownClock from '@/components/AnimatedDropdownClock';
import { useDashboardGreeting } from '@/hooks/useDashboardGreeting';
import { useDashboardVideoSettings } from '@/hooks/useDashboardVideoSettings';
import { useAuth } from '@/hooks/useAuth';
import EnhancedWelcomeVideoBackground from './EnhancedWelcomeVideoBackground';

const CleanDashboardWelcomeCard = () => {
  const currentGreeting = useDashboardGreeting();
  const { user } = useAuth();
  const { videoSettings } = useDashboardVideoSettings(user);

  return (
    <>
      {/* New Animated Clock Component */}
      <AnimatedDropdownClock />
      
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 relative overflow-hidden -mt-6 mb-6 mx-6 rounded-t-none rounded-b-xl">
        <EnhancedWelcomeVideoBackground
          userVideoUrl={videoSettings.videoUrl}
          opacity={videoSettings.opacity}
          blendMode={videoSettings.blendMode}
          enabled={videoSettings.enabled}
        />
        
        <CardContent className="p-8 pt-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[200px]">
            {/* Welcome Text - Lower Left with Clean Professional Spacing */}
            <div className="lg:col-span-8 flex items-end">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-lg font-sans">
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
                      {currentGreeting.firstName}.
                    </span>
                  </h1>
                  {/* Clean Subheading without border */}
                  <div className="ml-12">
                    <p className="text-white/90 text-lg font-medium leading-relaxed drop-shadow-md font-sans">
                      {currentGreeting.encouragement}
                    </p>
                  </div>
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
    </>
  );
};

export default CleanDashboardWelcomeCard;
