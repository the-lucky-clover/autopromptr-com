
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3 } from "lucide-react";
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
      <div className="min-h-screen flex w-full" style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' }}>
        <AppSidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="text-white hover:text-purple-200 rounded-xl" />
              <div>
                <h1 className="text-2xl font-semibold text-white">Welcome back!</h1>
                <p className="text-purple-200">Here's what's happening with your prompt batches today.</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Batch Processor */}
            <div className="lg:col-span-2">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-white">Batch Processor</CardTitle>
                  <CardDescription className="text-purple-200">
                    Create and manage your prompt batches
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <DashboardBatchManager onStatsUpdate={handleStatsUpdate} />
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Subscription */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-purple-200">
                    Get started with common tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className={`w-full justify-start text-left h-auto p-4 ${action.color} text-white rounded-xl`}
                    >
                      <action.icon className="w-5 h-5 mr-3" />
                      <div>
                        <div className="font-medium">{action.title}</div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Subscription */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-white">Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4 text-center">
                    <p className="text-green-300 font-medium mb-1">Plan</p>
                    <p className="text-white text-sm">Limited to 5 batches per month</p>
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
