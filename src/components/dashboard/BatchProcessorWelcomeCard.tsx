
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Radiation } from 'lucide-react';
import { useDashboardVideoSettings } from '@/hooks/useDashboardVideoSettings';
import { useAuth } from '@/hooks/useAuth';
import EnhancedWelcomeVideoBackground from './EnhancedWelcomeVideoBackground';

const BatchProcessorWelcomeCard = () => {
  const { user } = useAuth();
  const { videoSettings } = useDashboardVideoSettings(user);

  const getCurrentDate = () => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    return `${dayName}, ${monthDay}`;
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 relative overflow-hidden mb-6 mx-6 rounded-xl">
      <EnhancedWelcomeVideoBackground
        userVideoUrl={videoSettings.videoUrl}
        opacity={videoSettings.opacity}
        blendMode={videoSettings.blendMode}
        enabled={videoSettings.enabled}
      />
      
      <CardContent className="p-0 relative z-10">
        <div className="min-h-[200px] flex items-end p-8 pb-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-lg">
              Batch Processor
            </h1>
            <div className="space-y-2">
              <p className="text-white/90 text-lg font-medium leading-relaxed drop-shadow-md">
                Create, manage, and execute automated prompt batches across multiple AI platforms.
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
      </CardContent>
    </Card>
  );
};

export default BatchProcessorWelcomeCard;
