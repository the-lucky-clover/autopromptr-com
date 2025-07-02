
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Radiation } from 'lucide-react';
import { useDashboardVideoSettings } from '@/hooks/useDashboardVideoSettings';
import { useDashboardGreeting } from '@/hooks/useDashboardGreeting';
import { useAuth } from '@/hooks/useAuth';
import EnhancedWelcomeVideoBackground from './EnhancedWelcomeVideoBackground';
import AnalogueDropdownClock from '@/components/AnalogueDropdownClock';

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
    return { dayName, monthDay, year };
  };

  const getUserName = () => {
    if (!user) return 'there';
    return user.user_metadata?.name?.split(' ')[0] || 
           user.email?.split('@')[0] || 
           'there';
  };

  const { dayName, monthDay, year } = getCurrentDateInfo();
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
        <div className="min-h-[200px] grid grid-cols-12 gap-4 items-center p-8">
          {/* Main content area - left side */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {showPersonalizedGreeting ? (
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-lg">
                  {currentGreeting.greeting},{' '}
                  <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                    {userName}
                  </span>
                  !
                </h1>
                <p className="text-white/90 text-lg font-medium leading-relaxed drop-shadow-md">
                  {currentGreeting.encouragement}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-lg">
                  {title}
                </h1>
                <p className="text-white/90 text-lg font-medium leading-relaxed drop-shadow-md">
                  {subtitle}
                </p>
              </div>
            )}
          </div>

          {/* Clock and date area - right side */}
          <div className="col-span-12 lg:col-span-4 flex flex-col items-end space-y-2">
            <div className="flex justify-end">
              <AnalogueDropdownClock 
                enableEasterEgg={true} 
                clockColor={clockColor}
              />
            </div>
            
            <div className="text-right space-y-1">
              <div className="text-white/80 text-base font-medium">
                {dayName}, {monthDay} {year}
              </div>
              <div className="flex items-center justify-end gap-2 text-white/70 text-sm">
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
      </CardContent>
    </Card>
  );
};

export default UnifiedDashboardWelcomeModule;
