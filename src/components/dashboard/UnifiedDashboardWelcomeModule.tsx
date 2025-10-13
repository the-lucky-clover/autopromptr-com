
import React, { useState, useEffect } from 'react';
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

const illuminatedQuotes = [
  "The wisest mind has something yet to learn - George Santayana",
  "What we achieve inwardly will change outer reality - Plutarch", 
  "Excellence is never an accident, always the result of high intention - Aristotle",
  "The way to get started is to quit talking and begin doing - Walt Disney",
  "Innovation distinguishes between a leader and a follower - Steve Jobs",
  "The only impossible journey is the one you never begin - Tony Robbins",
  "Success is not final, failure is not fatal, it is the courage to continue that counts - Winston Churchill",
  "The future belongs to those who believe in the beauty of their dreams - Eleanor Roosevelt"
];

const UnifiedDashboardWelcomeModule = ({ 
  title, 
  subtitle, 
  clockColor = "#10B981",
  showPersonalizedGreeting = false 
}: UnifiedDashboardWelcomeModuleProps) => {
  const { user } = useAuth();
  const { videoSettings } = useDashboardVideoSettings(user);
  const currentGreeting = useDashboardGreeting();
  const [currentQuote, setCurrentQuote] = useState(illuminatedQuotes[0]);

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

  // Set random quote on page load
  useEffect(() => {
    const randomQuote = illuminatedQuotes[Math.floor(Math.random() * illuminatedQuotes.length)];
    setCurrentQuote(randomQuote);
  }, []);

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 relative overflow-hidden mb-6 mx-6 rounded-xl">
      <EnhancedWelcomeVideoBackground
        userVideoUrl={videoSettings.videoUrl}
        opacity={videoSettings.opacity}
        blendMode={videoSettings.blendMode}
        enabled={videoSettings.enabled}
      />
      
      <CardContent className="p-0 relative z-10">
        <div className="min-h-[280px] grid grid-cols-12 gap-4 p-8">
          {/* Main content area - expanded width for better text flow */}
          <div className="col-span-12 lg:col-span-9 flex flex-col justify-end pb-4 pr-8">
            {showPersonalizedGreeting ? (
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-lg">
                  <span className="inline-block">{currentGreeting.greeting},</span>{' '}
                  <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent inline-block">
                    {userName}
                  </span>
                  <span className="inline-block">!</span>
                </h1>
                <div className="pl-6 space-y-2">
                  <blockquote className="text-white/75 text-sm font-normal italic leading-relaxed drop-shadow-sm">
                    "{currentQuote.split(' - ')[0]}" - {currentQuote.split(' - ')[1]}
                  </blockquote>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-lg">
                  {title}
                </h1>
                <div className="pl-6 space-y-2">
                  <p className="text-white/90 text-lg font-medium leading-relaxed drop-shadow-md">
                    {subtitle}
                  </p>
                  <blockquote className="text-white/75 text-sm font-normal italic leading-relaxed drop-shadow-sm">
                    "{currentQuote.split(' - ')[0]}" - {currentQuote.split(' - ')[1]}
                  </blockquote>
                </div>
              </div>
            )}
          </div>

          {/* Right side with clock and status - compact size, aligned right */}
          <div className="col-span-12 lg:col-span-3 flex flex-col justify-start py-4" 
               style={{ 
                 transform: 'scale(0.6) translateY(-20px)',
                 transformOrigin: 'top right'
               }}>
            {/* Digital Clock with Reactor Status */}
            <div className="flex justify-end">
              <DigitalClock 
                clockColor={clockColor}
                showReactorStatus={true}
                showTimezone={true}
                showDate={true}
                size="dashboard"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(UnifiedDashboardWelcomeModule);
