
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Radiation } from 'lucide-react';
import DigitalClock from "@/components/DigitalClock";

interface DashboardWelcomeModuleProps {
  title: string;
  subtitle: string;
  clockColor?: string;
}

const DashboardWelcomeModule: React.FC<DashboardWelcomeModuleProps> = ({
  title,
  subtitle,
  clockColor = "#10B981"
}) => {
  const getCurrentDate = () => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    return `${dayName}, ${monthDay}`;
  };

  return (
    <div className="animate-shimmer-delayed mb-8 mx-8">
      <Card className="bg-gray-800/30 backdrop-blur-md border-gray-700/50 min-h-[220px]">
        <CardContent className="p-0">
          <div className="grid grid-cols-12 h-full min-h-[220px]">
            {/* Clock positioned in upper-right - cols 9-12 */}
            <div className="col-span-3 flex items-start justify-end p-6 pt-8">
              <DigitalClock 
                clockColor={clockColor}
                showReactorStatus={true}
                showTimezone={true}
                showDate={true}
                size="md"
              />
            </div>
            
            {/* Typography positioned in lower-left - cols 1-8 */}
            <div className="col-span-9 flex items-end p-10 pb-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-white leading-tight">
                  {title}
                </h1>
                <div className="space-y-2">
                  <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                    {subtitle}
                  </p>
                  <div className="flex items-center gap-4 text-gray-400 text-sm">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardWelcomeModule;
