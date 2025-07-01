
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProfileSettingsCard } from "@/components/settings/ProfileSettingsCard";
import { APIConfigurationCard } from "@/components/settings/APIConfigurationCard";
import { PreferencesCard } from "@/components/settings/PreferencesCard";
import { NotificationsCard } from "@/components/settings/NotificationsCard";
import { AutomationSettingsCard } from "@/components/settings/AutomationSettingsCard";
import { BackendConfigurationCard } from "@/components/settings/BackendConfigurationCard";
import { EnhancedAutomationCard } from "@/components/settings/EnhancedAutomationCard";
import DashboardResetCard from "@/components/settings/DashboardResetCard";
import { LayoutSettingsCard } from "@/components/settings/LayoutSettingsCard";
import { OverviewLayoutCard } from "@/components/settings/OverviewLayoutCard";
import { ThemeCustomizationCard } from "@/components/settings/ThemeCustomizationCard";
import { SecureApiKeyManager } from "@/components/security/SecureApiKeyManager";
import { LocalSimulationCard } from "@/components/settings/LocalSimulationCard";
import { VideoBackgroundCard } from "@/components/settings/VideoBackgroundCard";
import TimezoneSettingsCard from "@/components/settings/TimezoneSettingsCard";
import { SidebarInset } from "@/components/ui/sidebar";

const Settings = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="space-y-0.5">
              <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
              <p className="text-purple-200">
                Configure your AutoPromptr application settings and preferences.
              </p>
            </div>
            
            <div className="space-y-6">
              <BackendConfigurationCard />
              <OverviewLayoutCard />
              <TimezoneSettingsCard />
              <VideoBackgroundCard />
              <LocalSimulationCard />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
