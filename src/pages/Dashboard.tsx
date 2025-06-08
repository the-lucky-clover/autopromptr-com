
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardBatchManager from "@/components/DashboardBatchManager";
import DashboardStatsCards from "@/components/DashboardStatsCards";
import DashboardQuickActions from "@/components/DashboardQuickActions";
import DashboardBackendMonitoring from "@/components/DashboardBackendMonitoring";
import DashboardSubscription from "@/components/DashboardSubscription";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    completedBatches: 0,
    totalPrompts: 0
  });

  const handleStatsUpdate = (newStats: typeof stats) => {
    setStats(newStats);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' }}>
        <AppSidebar />
        <main className="flex-1 p-4 md:p-8 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center space-x-4 min-w-0">
              <SidebarTrigger className="text-white hover:text-purple-200 rounded-xl flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-semibold text-white truncate">Welcome back!</h1>
                <p className="text-purple-200 text-sm md:text-base">Here's what's happening with your prompt batches today.</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <DashboardStatsCards stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Batch Processor */}
            <div className="lg:col-span-2 min-w-0">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-white">Batch Processor</CardTitle>
                  <CardDescription className="text-purple-200">
                    Create and manage your prompt batches
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 md:p-6">
                  <DashboardBatchManager onStatsUpdate={handleStatsUpdate} />
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Backend Health */}
            <div className="space-y-4 md:space-y-6 min-w-0">
              {/* Quick Actions */}
              <DashboardQuickActions />

              {/* Backend Monitoring */}
              <DashboardBackendMonitoring />

              {/* Subscription */}
              <DashboardSubscription />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
