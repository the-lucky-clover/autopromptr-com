
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Radiation } from 'lucide-react';
import { useDashboardVideoSettings } from '@/hooks/useDashboardVideoSettings';
import { useDashboardGreeting } from '@/hooks/useDashboardGreeting';
import { useAuth } from '@/hooks/useAuth';
import EnhancedWelcomeVideoBackground from './EnhancedWelcomeVideoBackground';
import DigitalClock from '@/components/DigitalClock';

interface UnifiedDashboardWelcomeModuleProps {
  title: string;
  subtitle: string;
  clockColor?: string;
  showPersonalizedGreeting?: boolean;
}

const UnifiedDashboardWelcomeModule = ({ 
  title, 
  subtitle, 
  clockColor = "#10B981",
  showPersonalizedGreeting = false 
}: UnifiedDashboardWelcomeModuleProps) => {
  const { user } = useAuth();
  const { videoSettings } = useDashboardVideoSettings(user);
  const currentGreeting = useDashboardGreeting();

  const getCurrentDateInfo = () => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const year = now.getFullYear();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return { dayName, monthDay, year, timezone };
  };

  const getUserName = () => {
    if (!user) return 'there';
    return user.user_metadata?.name?.split(' ')[0] || 
           user.email?.split('@')[0] || 
           'there';
  };

  const { dayName, monthDay, year, timezone } = getCurrentDateInfo();
  const userName = getUserName();

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 relative overflow-hidden mb-6 mx-6 rounded-xl">
      <EnhancedWelcomeVideoBackground
        userVideoUrl={videoSettings.videoUrl}
        opacity={videoSettings.opacity}
        blendMode={videoSettings.blendMode}
        enabled={videoSettings.enabled}
      />
      
      <CardContent className="p-0 relative z-10">
        <div className="min-h-[280px] grid grid-cols-12 gap-8 p-8">
          {/* Main content area - left side (lower positioning) */}
          <div className="col-span-12 lg:col-span-7 flex flex-col justify-end pb-4">
            {showPersonalizedGreeting ? (
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-lg">
                  {currentGreeting.greeting},{' '}
                  <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                    {userName}
                  </span>
                  !
                </h1>
                <div className="pl-6">
                  <p className="text-white/90 text-lg font-medium leading-relaxed drop-shadow-md">
                    {currentGreeting.encouragement}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-lg">
                  {title}
                </h1>
                <div className="pl-6">
                  <p className="text-white/90 text-lg font-medium leading-relaxed drop-shadow-md">
                    {subtitle}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right side with clock and status - 75% smaller, moved up 30px, closer to right 30px */}
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-start py-4" 
               style={{ 
                 transform: 'scale(0.4894) translateY(-30px) translateX(30px)',
                 transformOrigin: 'top right',
                 paddingRight: '20px'
               }}>
            {/* Digital Clock - Upper Area */}
            <div className="flex justify-end">
              <DigitalClock 
                clockColor={clockColor}
                showReactorStatus={false}
                showTimezone={true}
                showDate={true}
                size="dashboard"
              />
            </div>

            {/* Reactor Status and Attribution - Lower Area */}
            <div className="flex flex-col items-end space-y-4">
              {/* Reactor Status */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/80 font-medium">Sector 7-G</span>
                <span className="text-green-400 font-medium">//</span>
                <span className="text-white/80 font-medium">Reactor:</span>
                <span 
                  className="text-green-400 font-semibold"
                  style={{ 
                    textShadow: '0 0 8px rgba(34, 197, 94, 0.6)' 
                  }}
                >
                  Stable
                </span>
                <Radiation 
                  className="w-4 h-4 text-yellow-400 animate-[radioactive-pulse_3s_ease-in-out_infinite]"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.8))'
                  }}
                />
              </div>

              {/* Attribution */}
              <div className="text-white/60 text-base font-medium tracking-wide">
                AutoPromptr Systems
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedDashboardWelcomeModule;
