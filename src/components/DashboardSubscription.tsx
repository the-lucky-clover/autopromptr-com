
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Shield, Star } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

interface DashboardSubscriptionProps {
  isCompact?: boolean;
}

const DashboardSubscription = ({ isCompact = false }: DashboardSubscriptionProps) => {
  const { isSysOp } = useUserRole();
  
  const currentPlan = isSysOp ? "SysOp" : "Pro";
  const usagePercentage = isSysOp ? 0 : 68;

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl relative">
      {/* Beta Badge - Centered */}
      <div className="absolute -top-2 -right-2 z-10">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-bold transform rotate-12 shadow-lg">
          <div className="flex items-center justify-center">
            BETA
          </div>
        </div>
      </div>
      
      <CardHeader className={isCompact ? "pb-2" : "pb-3"}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={`text-white flex items-center space-x-2 ${isCompact ? 'text-sm' : 'text-sm md:text-base'}`}>
              <Crown className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} ${isSysOp ? 'text-red-400' : 'text-yellow-400'}`} />
              <span>{currentPlan} Plan</span>
            </CardTitle>
          </div>
          <Badge variant="outline" className={`${isSysOp ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'}`}>
            <Star className={`${isCompact ? 'w-2 h-2' : 'w-3 h-3'} mr-1`} />
            {isSysOp ? 'UNLIMITED' : 'Active'}
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
              {isSysOp ? '∞' : `${usagePercentage}%`}
            </span>
          </div>
          {!isSysOp && (
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          )}
          {isSysOp && (
            <div className="text-center py-2">
              <span className="text-red-300 font-medium">Unlimited Access</span>
            </div>
          )}
        </div>

        {!isCompact && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-xl p-2">
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-blue-400" />
                <span className="text-white/60 text-xs">Batches</span>
              </div>
              <div className="text-white text-sm font-medium">
                {isSysOp ? '∞' : '47/100'}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-2">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-green-400" />
                <span className="text-white/60 text-xs">API Calls</span>
              </div>
              <div className="text-white text-sm font-medium">
                {isSysOp ? '∞' : '2.1k/5k'}
              </div>
            </div>
          </div>
        )}

        <Button 
          className={`w-full btn-with-shadow ${
            isSysOp 
              ? 'bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          } text-white rounded-xl ${isCompact ? 'h-8 text-xs' : 'h-9'}`}
        >
          {isCompact ? 'Manage' : (isSysOp ? 'System Control' : 'Manage Plan')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardSubscription;
