
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardVideoSettings } from '@/hooks/useDashboardVideoSettings';
import EnhancedWelcomeVideoBackground from './EnhancedWelcomeVideoBackground';
import UniversalSectorClock from '../UniversalSectorClock';

interface DashboardWelcomeModuleProps {
  title: string;
  subtitle: string;
}

const DashboardWelcomeModule = ({ title, subtitle }: DashboardWelcomeModuleProps) => {
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
      className="bg-white/10 backdrop-blur-sm border-white/20 relative overflow-hidden mb-8 mx-8 rounded-xl hover:shadow-indigo-500/20 transition-all duration-300 hover-shimmer-card"
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
      
      <CardContent className="p-10 relative z-10">
        <div className="min-h-[220px] flex items-center relative">
          {/* Clock positioned in upper-right corner with better spacing */}
          <div className="absolute top-0 right-0 z-20">
            <UniversalSectorClock />
          </div>
          
          <div className="space-y-8 flex-1 pr-48">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-white drop-shadow-lg">
                <span 
                  className="hover-shimmer-text bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent drop-shadow-none"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #3B82F6, #EC4899)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {title}
                </span>
              </h1>
              {/* Professional Subheading with improved spacing */}
              <div className="ml-16 space-y-2">
                <p className="text-purple-200/90 text-xl font-semibold leading-relaxed drop-shadow-md">
                  {subtitle}
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardWelcomeModule;
