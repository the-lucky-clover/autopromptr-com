
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Star, Zap } from 'lucide-react';

interface DashboardSubscriptionProps {
  isCompact?: boolean;
}

const DashboardSubscription = ({ isCompact = false }: DashboardSubscriptionProps) => {
  // Mock subscription data
  const subscription = {
    plan: 'Pro',
    status: 'active',
    creditsUsed: 150,
    creditsTotal: 1000,
    nextBilling: '2024-02-15'
  };

  const creditPercentage = (subscription.creditsUsed / subscription.creditsTotal) * 100;

  if (isCompact) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4" />
              Subscription
            </CardTitle>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
              {subscription.plan}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs text-white/70">
            <span>Credits</span>
            <span>{subscription.creditsUsed}/{subscription.creditsTotal}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${creditPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription
          </CardTitle>
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            <Star className="w-3 h-3 mr-1" />
            {subscription.plan} Plan
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
            {subscription.creditsTotal - subscription.creditsUsed} credits remaining
          </p>
        </div>

        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl">
          <Zap className="w-4 h-4 mr-2" />
          Upgrade Plan
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardSubscription;
