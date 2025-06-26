import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardContent from "@/components/DashboardContent";
import { FloatingConsoleButton } from "@/components/admin/FloatingConsoleButton";

const Dashboard = () => {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' }}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <DashboardContent />
          </SidebarInset>
        </div>
      </SidebarProvider>
      <FloatingConsoleButton />
    </div>
  );
};

export default Dashboard;
