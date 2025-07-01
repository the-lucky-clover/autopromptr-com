
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Star, Zap, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

interface DashboardSubscriptionProps {
  isCompact?: boolean;
}

const DashboardSubscription = ({ isCompact = false }: DashboardSubscriptionProps) => {
  const { user } = useAuth();
  const { isSysOp } = useUserRole();

  // Mock subscription data - enhanced for super users
  const subscription = {
    plan: isSysOp ? 'God Account' : 'Pro',
    status: 'active',
    creditsUsed: isSysOp ? 0 : 150,
    creditsTotal: isSysOp ? '∞' : 1000,
    nextBilling: isSysOp ? 'Never' : '2024-02-15'
  };

  const creditPercentage = isSysOp ? 0 : (subscription.creditsUsed / (subscription.creditsTotal as number)) * 100;

  if (isCompact) {
    return (
      <Card className={`backdrop-blur-sm border-white/20 rounded-xl ${
        isSysOp 
          ? 'bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-yellow-600/20 border-yellow-400/30' 
          : 'bg-white/10'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-sm">
              {isSysOp ? <Crown className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
              Subscription
            </CardTitle>
            <Badge className={`text-xs ${
              isSysOp 
                ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-yellow-300 border-yellow-400/40' 
                : 'bg-green-500/20 text-green-300 border-green-500/30'
            }`}>
              {isSysOp && <Sparkles className="w-3 h-3 mr-1" />}
              {subscription.plan}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs text-white/70">
            <span>Credits</span>
            <span>{subscription.creditsUsed}/{subscription.creditsTotal}</span>
          </div>
          {!isSysOp && (
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${creditPercentage}%` }}
              />
            </div>
          )}
          {isSysOp && (
            <div className="text-center py-2">
              <div className="text-yellow-300 text-xs font-mono animate-pulse">
                ∞ UNLIMITED POWER ∞
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`backdrop-blur-sm border-white/20 rounded-xl ${
      isSysOp 
        ? 'bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-yellow-600/20 border-yellow-400/30' 
        : 'bg-white/10'
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            {isSysOp ? <Crown className="w-5 h-5 text-yellow-400" /> : <CreditCard className="w-5 h-5" />}
            Subscription
          </CardTitle>
          <Badge className={`${
            isSysOp 
              ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-yellow-300 border-yellow-400/40' 
              : 'bg-green-500/20 text-green-300 border-green-500/30'
          }`}>
            {isSysOp ? (
              <>
                <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                {subscription.plan}
              </>
            ) : (
              <>
                <Star className="w-3 h-3 mr-1" />
                {subscription.plan} Plan
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/60 text-sm">Status</p>
            <p className="text-white font-medium capitalize">{subscription.status}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/60 text-sm">Next Billing</p>
            <p className="text-white font-medium">{subscription.nextBilling}</p>
          </div>
        </div>

        {isSysOp ? (
          <div className="space-y-2">
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-yellow-400/30">
              <div className="text-center space-y-2">
                <Crown className="w-8 h-8 text-yellow-400 mx-auto animate-pulse" />
                <div className="text-yellow-300 font-bold text-lg">GOD ACCOUNT</div>
                <div className="text-white/80 text-sm">Unlimited access to all features</div>
                <div className="text-yellow-400 text-xs font-mono animate-pulse">
                  SYSTEM ADMINISTRATOR PRIVILEGES
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Credits Used</span>
              <span className="text-white font-medium">{subscription.creditsUsed}/{subscription.creditsTotal}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${creditPercentage}%` }}
              />
            </div>
            <p className="text-white/60 text-xs">
              {(subscription.creditsTotal as number) - subscription.creditsUsed} credits remaining
            </p>
          </div>
        )}

        {!isSysOp && (
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl">
            <Zap className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardSubscription;
