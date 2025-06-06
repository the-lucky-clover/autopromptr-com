
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardStats from "@/components/DashboardStats";
import RecentPrompts from "@/components/RecentPrompts";
import ActivityChart from "@/components/ActivityChart";
import BatchManager from "@/components/BatchManager";
import { Button } from "@/components/ui/button";
import { Plus, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="text-gray-600 hover:text-gray-900" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening with your AI prompts.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 w-64 bg-white border-gray-200"
                />
              </div>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <Bell className="h-5 w-5" />
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Prompt
              </Button>
            </div>
          </div>

          <DashboardStats />

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="batches">Batch Manager</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RecentPrompts />
                </div>
                <div>
                  <ActivityChart />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="batches">
              <BatchManager />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
