
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Shield, Star } from "lucide-react";

interface DashboardSubscriptionProps {
  isCompact?: boolean;
}

const DashboardSubscription = ({ isCompact = false }: DashboardSubscriptionProps) => {
  const currentPlan = "Pro"; // This would come from user data
  const usagePercentage = 68; // This would come from actual usage data

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader className={isCompact ? "pb-2" : "pb-3"}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={`text-white flex items-center space-x-2 ${isCompact ? 'text-sm' : 'text-sm md:text-base'}`}>
              <Crown className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} text-yellow-400`} />
              <span>Subscription</span>
            </CardTitle>
            <CardDescription className={`text-purple-200 ${isCompact ? 'text-xs' : 'text-xs md:text-sm'}`}>
              {currentPlan} Plan
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
            <Star className={`${isCompact ? 'w-2 h-2' : 'w-3 h-3'} mr-1`} />
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={`space-y-3 ${isCompact ? 'space-y-2' : ''}`}>
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-white/80 ${isCompact ? 'text-xs' : 'text-sm'}`}>
              Usage this month
            </span>
            <span className={`text-white font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>
              {usagePercentage}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>

        {!isCompact && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-lg p-2">
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-blue-400" />
                <span className="text-white/60 text-xs">Batches</span>
              </div>
              <div className="text-white text-sm font-medium">47/100</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-green-400" />
                <span className="text-white/60 text-xs">API Calls</span>
              </div>
              <div className="text-white text-sm font-medium">2.1k/5k</div>
            </div>
          </div>
        )}

        <Button 
          className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg ${isCompact ? 'h-8 text-xs' : 'h-9'}`}
        >
          {isCompact ? 'Manage' : 'Manage Plan'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardSubscription;
