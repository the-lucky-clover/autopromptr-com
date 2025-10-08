
import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProfileSettingsCard } from "@/components/settings/ProfileSettingsCard";
import { PreferencesCard } from "@/components/settings/PreferencesCard";
import { NotificationsCard } from "@/components/settings/NotificationsCard";
import { AutomationSettingsCard } from "@/components/settings/AutomationSettingsCard";
import { APIConfigurationCard } from "@/components/settings/APIConfigurationCard";
import { ThemeCustomizationCard } from "@/components/settings/ThemeCustomizationCard";
import { VideoBackgroundCard } from "@/components/settings/VideoBackgroundCard";
import UnifiedDashboardWelcomeModule from "@/components/dashboard/UnifiedDashboardWelcomeModule";

const Settings = () => {
  return (
    <div 
      className="min-h-screen relative animate-shimmer"
      style={{ 
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)' 
      }}
    >
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 relative">
            <UnifiedDashboardWelcomeModule
              title="Settings"
              subtitle="Configure your AutoPromptr application settings and preferences."
              clockColor="#EA580C"
              showPersonalizedGreeting={false}
            />
            
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProfileSettingsCard />
                <PreferencesCard />
                <NotificationsCard />
                <AutomationSettingsCard />
                <APIConfigurationCard />
                <ThemeCustomizationCard />
                <VideoBackgroundCard />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Settings;
