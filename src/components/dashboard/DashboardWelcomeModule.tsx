
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import AnalogueClockComponent from "@/components/clock/AnalogueClockComponent";

interface DashboardWelcomeModuleProps {
  title: string;
  subtitle: string;
  clockColor?: string;
}

const DashboardWelcomeModule: React.FC<DashboardWelcomeModuleProps> = ({
  title,
  subtitle,
  clockColor = "#10B981" // Default green
}) => {
  return (
    <div className="animate-shimmer-delayed mb-8 mx-8">
      <Card className="bg-gray-800/30 backdrop-blur-md border-gray-700/50 min-h-[220px]">
        <CardContent className="p-10">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 pr-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                {title}
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            </div>
            
            {/* Analogue Clock - Right Aligned with Professional Spacing */}
            <div className="flex-shrink-0 flex flex-col items-end">
              <AnalogueClockComponent 
                clockColor={clockColor}
                isMeltdownAvailable={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardWelcomeModule;
