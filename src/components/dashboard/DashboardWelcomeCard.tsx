
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className={`m-6 mb-4 ${
      videoSettings.enabled 
        ? 'bg-white/10 backdrop-blur-sm border-white/20' 
        : 'bg-white/10 backdrop-blur-sm border-white/20'
    } rounded-xl border`}>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
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
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 relative overflow-hidden">
              {/* Glassmorphism effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-2xl"></div>
              
              <div className="text-center space-y-6 relative z-10">
                <div className="text-6xl">🚀</div>
                <div className="text-white font-semibold text-xl">Ready to Automate</div>
                <div className="text-white/60 text-base">
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
