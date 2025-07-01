
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import EnhancedRealTimeClock from '@/components/EnhancedRealTimeClock';
import { useDashboardGreeting } from '@/hooks/useDashboardGreeting';

const CleanDashboardWelcomeCard = () => {
  const greeting = useDashboardGreeting();

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <EnhancedRealTimeClock />
      </div>
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Zap className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">
                {greeting}
              </CardTitle>
              <p className="text-purple-200 text-sm mt-1">
                Welcome to your AutoPromptr dashboard
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-white/80 text-sm">
              Ready to automate your workflow
            </p>
            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
              System Ready
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <ConnectionStatus />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CleanDashboardWelcomeCard;
