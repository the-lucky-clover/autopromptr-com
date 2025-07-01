
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Radiation } from 'lucide-react';
import { useDashboardGreeting } from '@/hooks/useDashboardGreeting';
import { useDashboardVideoSettings } from '@/hooks/useDashboardVideoSettings';
import { useAuth } from '@/hooks/useAuth';
import EnhancedWelcomeVideoBackground from './EnhancedWelcomeVideoBackground';
import AnalogueClockComponent from '../clock/AnalogueClockComponent';

const CleanDashboardWelcomeCard = () => {
  const currentGreeting = useDashboardGreeting();
  const { user } = useAuth();
  const { videoSettings } = useDashboardVideoSettings(user);

  const getCurrentDate = () => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    return `${dayName}, ${monthDay}`;
  };

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
      
      <CardContent className="p-0 relative z-10">
        <div className="grid grid-cols-12 min-h-[200px]">
          {/* Clock positioned in upper-right - cols 10-12 */}
          <div className="col-span-3 flex items-start justify-end p-6 pt-8">
            <AnalogueClockComponent 
              clockColor="#10B981" 
              isMeltdownAvailable={true}
              hideDigitalDisplay={true}
            />
          </div>
          
          {/* Typography positioned in lower-left - cols 1-9 */}
          <div className="col-span-9 flex items-end p-8 pb-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                <span className="text-white drop-shadow-lg">
                  {currentGreeting.greeting}{' '}
                </span>
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
              <div className="space-y-2">
                <p className="text-white/90 text-lg font-medium leading-relaxed drop-shadow-md">
                  {currentGreeting.encouragement}
                </p>
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <span className="font-medium">{getCurrentDate()}</span>
                  <div className="flex items-center gap-2">
                    <Radiation className="w-4 h-4 text-green-400" style={{ 
                      filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.6))',
                      animation: 'pulse 2s infinite' 
                    }} />
                    <span className="text-green-400 font-medium" style={{ 
                      textShadow: '0 0 8px rgba(34, 197, 94, 0.4)' 
                    }}>
                      Sector 7-G • Reactor: Stable
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CleanDashboardWelcomeCard;
