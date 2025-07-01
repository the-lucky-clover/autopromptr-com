
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import EnhancedBrandLogo from "@/components/EnhancedBrandLogo";

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
    <Card className={`m-6 mb-4 ${
      videoSettings.enabled 
        ? 'bg-white/95 backdrop-blur-md border-gray-200' 
        : 'bg-white border-gray-200'
    } rounded-xl shadow-sm`}>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <EnhancedBrandLogo 
                  size="large" 
                  variant="horizontal" 
                  id="dashboard-welcome"
                  showHoverAnimation={false}
                />
              </div>
              
              <div className="space-y-2">
                {currentGreeting && (
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    {currentGreeting.text}
                  </h1>
                )}
                <p className="text-gray-600 text-lg">
                  Your intelligent automation dashboard - streamline workflows, maximize efficiency, generate revenue
                </p>
                {currentGreeting && currentGreeting.language !== 'en' && (
                  <p className="text-gray-500 text-sm font-medium">
                    🌍 {currentGreeting.languageName}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 flex justify-end">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="text-center space-y-3">
                <div className="text-3xl">🚀</div>
                <div className="text-gray-900 font-semibold">Ready to Automate</div>
                <div className="text-gray-600 text-sm">
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
