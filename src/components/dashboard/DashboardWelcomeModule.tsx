
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardVideoSettings } from '@/hooks/useDashboardVideoSettings';
import EnhancedWelcomeVideoBackground from './EnhancedWelcomeVideoBackground';

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
      className="bg-white/10 backdrop-blur-sm border-white/20 relative overflow-hidden mb-6 mx-6 rounded-xl hover:shadow-indigo-500/20 transition-all duration-300"
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
                <span 
                  className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent drop-shadow-none"
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
              {/* Clean Professional Subheading */}
              <div className="ml-12">
                <p className="text-purple-200/90 text-lg font-medium leading-relaxed drop-shadow-md">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardWelcomeModule;
