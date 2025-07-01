
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useDashboardGreeting } from '@/hooks/useDashboardGreeting';
import { useDashboardVideoSettings } from '@/hooks/useDashboardVideoSettings';
import { useAuth } from '@/hooks/useAuth';
import EnhancedWelcomeVideoBackground from './EnhancedWelcomeVideoBackground';

const CleanDashboardWelcomeCard = () => {
  const currentGreeting = useDashboardGreeting();
  const { user } = useAuth();
  const { videoSettings } = useDashboardVideoSettings(user);

  const handleMouseEnter = () => {
    window.dispatchEvent(new CustomEvent('welcomeModuleHover', { detail: { isHovered: true } }));
  };

  const handleMouseLeave = () => {
    window.dispatchEvent(new CustomEvent('welcomeModuleHover', { detail: { isHovered: false } }));
  };

  return (
    <Card 
      className="bg-white/10 backdrop-blur-sm border-white/20 relative overflow-hidden mb-6 mx-6 rounded-xl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      <EnhancedWelcomeVideoBackground
        userVideoUrl={videoSettings.videoUrl}
        opacity={videoSettings.opacity}
        blendMode={videoSettings.blendMode}
        enabled={videoSettings.enabled}
      />
      
      <CardContent className="p-8 relative z-10">
        <div className="min-h-[200px] flex items-center">
          <div className="space-y-6">
            <div className="space-y-4">
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
                  {currentGreeting.firstName}.
                </span>
              </h1>
              {/* Clean Professional Subheading */}
              <div className="ml-12">
                <p className="text-white/90 text-lg font-medium leading-relaxed drop-shadow-md">
                  {currentGreeting.encouragement}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CleanDashboardWelcomeCard;
