
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardBatchManager from "@/components/DashboardBatchManager";

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

  const statsData = [
    {
      title: "Total Batches",
      value: stats.totalBatches.toString(),
      icon: "📊",
      color: "bg-blue-500"
    },
    {
      title: "Active Batches", 
      value: stats.activeBatches.toString(),
      icon: "⚡",
      color: "bg-orange-500"
    },
    {
      title: "Completed",
      value: stats.completedBatches.toString(), 
      icon: "✅",
      color: "bg-green-500"
    },
    {
      title: "Total Prompts",
      value: stats.totalPrompts.toString(),
      icon: "🎯", 
      color: "bg-purple-500"
    }
  ];

  const quickActions = [
    {
      title: "Create New Batch",
      icon: Plus,
      color: "bg-blue-600 hover:bg-blue-700",
      description: "Get started with common tasks"
    },
    {
      title: "Use Batcher Tool", 
      icon: BarChart3,
      color: "bg-gray-800 hover:bg-gray-700",
      description: "Batch processing tool"
    },
    {
      title: "View Analytics",
      icon: BarChart3, 
      color: "bg-purple-600 hover:bg-purple-700",
      description: "View detailed analytics"
    }
  ];

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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            {statsData.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-purple-200 text-xs md:text-sm font-medium truncate">{stat.title}</p>
                      <p className="text-xl md:text-3xl font-bold text-white mt-1 md:mt-2">{stat.value}</p>
                    </div>
                    <div className={`w-8 h-8 md:w-12 md:h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-sm md:text-xl flex-shrink-0 ml-2`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
              {quickActions.map((action, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm md:text-base">Quick Actions</CardTitle>
                    <CardDescription className="text-purple-200 text-xs md:text-sm">
                      Get started with common tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      variant="ghost"
                      className={`w-full justify-start text-left h-auto p-3 md:p-4 ${action.color} text-white rounded-xl`}
                    >
                      <action.icon className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm md:text-base truncate">{action.title}</div>
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Backend Health Frame */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-white text-sm md:text-base">Backend Health</CardTitle>
                      <CardDescription className="text-purple-200 text-xs md:text-sm">
                        Live backend status check
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-purple-200 flex-shrink-0"
                      onClick={() => window.open('https://autopromptr-backend.onrender.com/health', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
                    <iframe
                      src="https://autopromptr-backend.onrender.com/health"
                      className="w-full h-32 md:h-48 border-0"
                      title="Backend Health Check"
                    />
                  </div>
                  <p className="text-xs text-purple-300 mt-2 break-all">
                    URL: https://autopromptr-backend.onrender.com/health
                  </p>
                </CardContent>
              </Card>

              {/* Render.com Logs Frame */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-white text-sm md:text-base">Render.com Logs</CardTitle>
                      <CardDescription className="text-purple-200 text-xs md:text-sm">
                        Live server logs dashboard
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-purple-200 flex-shrink-0"
                      onClick={() => window.open('https://dashboard.render.com/web/srv-d112caili9vc738aumtg/logs', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
                    <iframe
                      src="https://dashboard.render.com/web/srv-d112caili9vc738aumtg/logs"
                      className="w-full h-64 md:h-80 border-0"
                      title="Render.com Logs Dashboard"
                      sandbox="allow-same-origin allow-scripts allow-forms"
                    />
                  </div>
                  <p className="text-xs text-purple-300 mt-2 break-all">
                    URL: https://dashboard.render.com/web/srv-d112caili9vc738aumtg/logs
                  </p>
                </CardContent>
              </Card>

              {/* Subscription */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm md:text-base">Subscription</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-3 md:p-4 text-center">
                    <p className="text-green-300 font-medium mb-1 text-sm">Plan</p>
                    <p className="text-white text-xs md:text-sm">Limited to 5 batches per month</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
