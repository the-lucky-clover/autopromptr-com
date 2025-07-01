
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
  // Extract first name from greeting
  const getFirstName = (greetingText: string) => {
    const match = greetingText.match(/(?:Good \w+|¡Buen\w+|Bon\w+|Guten \w+|Buon\w+|おはよう\w*),?\s+([^,!]+)/);
    return match ? match[1].trim() : 'there';
  };

  const firstName = currentGreeting ? getFirstName(currentGreeting.text) : 'there';
  const restOfGreeting = currentGreeting 
    ? currentGreeting.text.replace(new RegExp(`(?:Good \\w+|¡Buen\\w+|Bon\\w+|Guten \\w+|Buon\\w+|おはよう\\w*),?\\s+${firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), '').trim()
    : 'Ready to automate your way to success? 💰';

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl border m-6 mb-4">
      <CardContent className="p-8 relative">
        {/* Clock in upper-right corner */}
        <div className="absolute top-6 right-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <RealTimeClock />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pr-32">
          <div className="lg:col-span-8">
            <div className="space-y-4">
              <div className="space-y-2">
                {currentGreeting && (
                  <div className="space-y-1">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                      <span 
                        className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent"
                        style={{
                          backgroundImage: 'linear-gradient(90deg, #3B82F6, #EC4899)',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        {firstName}
                      </span>
                      <br />
                      <span className="text-white">
                        {restOfGreeting}
                      </span>
                    </h1>
                  </div>
                )}
                <p className="text-white/60 text-lg">
                  Your intelligent automation dashboard - streamline workflows, maximize efficiency, generate revenue
                </p>
                {currentGreeting && currentGreeting.language !== 'en' && (
                  <p className="text-white/40 text-sm font-medium">
                    🌍 {currentGreeting.languageName}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 flex justify-end">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-16 border border-white/20 relative overflow-hidden">
              {/* Enhanced glassmorphism effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-2xl"></div>
              
              <div className="text-center space-y-8 relative z-10">
                <div className="text-8xl">🚀</div>
                <div className="text-white font-semibold text-2xl">Ready to Automate</div>
                <div className="text-white/60 text-lg">
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
