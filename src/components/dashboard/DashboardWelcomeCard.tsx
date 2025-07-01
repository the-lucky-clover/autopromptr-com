
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import RealTimeClock from "@/components/RealTimeClock";

interface DashboardWelcomeCardProps {
  currentGreeting: any;
  stats: {
    totalBatches: number;
    activeBatches: number;
    completedBatches: number;
    totalPrompts: number;
  };
  videoSettings: {
    enabled: boolean;
    videoUrl: string;
    showAttribution: boolean;
    opacity: number;
    blendMode: string;
  };
}

const DashboardWelcomeCard = ({ currentGreeting, stats, videoSettings }: DashboardWelcomeCardProps) => {
  return (
    <Card className="bg-gray-900/50 backdrop-blur-sm border-white/20 rounded-xl border m-6 mb-4">
      <CardContent className="p-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 flex items-center min-h-[120px]">
            <div className="space-y-4">
              {currentGreeting && (
                <div className="space-y-3">
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    <span className="text-white">
                      {currentGreeting.greeting}{' '}
                    </span>
                    <span 
                      className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent"
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
                  <p className="text-white/80 text-lg font-medium">
                    {currentGreeting.encouragement}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-4 flex flex-col items-end space-y-4">
            {/* Clock positioned higher without background card */}
            <div className="mb-4">
              <RealTimeClock />
            </div>

            {/* Ready to Automate Badge - Cleaned up */}
            <div className="bg-gray-800/40 backdrop-blur-md rounded-xl p-6 border border-white/20 relative overflow-hidden">
              <div className="text-center space-y-3 relative z-10">
                <div className="text-4xl">🚀</div>
                <div className="text-white font-semibold text-lg">Ready to Automate</div>
                <div className="text-white/60 text-sm">
                  {stats.totalBatches} batches • {stats.activeBatches} active
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardWelcomeCard;
