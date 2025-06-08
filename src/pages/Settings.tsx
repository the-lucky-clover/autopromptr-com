
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProfileSettingsCard } from "@/components/settings/ProfileSettingsCard";
import { APIConfigurationCard } from "@/components/settings/APIConfigurationCard";
import { PreferencesCard } from "@/components/settings/PreferencesCard";
import { NotificationsCard } from "@/components/settings/NotificationsCard";
import { AutomationSettingsCard } from "@/components/settings/AutomationSettingsCard";

const Settings = () => {
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
                <h1 className="text-2xl font-semibold text-white">Settings</h1>
                <p className="text-purple-200">Manage your account and application preferences</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfileSettingsCard />
            <APIConfigurationCard />
            <PreferencesCard />
            <NotificationsCard />
            <AutomationSettingsCard />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
