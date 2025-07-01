
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { useAuth } from "@/hooks/useAuth";
import BrandLogo from "@/components/BrandLogo";

const DashboardHeader = () => {
  const { user } = useAuth();

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between h-20 px-4">
        <div className="flex items-center space-x-4 min-w-0 relative">
          <SidebarTrigger className="text-white hover:text-cyan-200 rounded-xl flex-shrink-0 z-30 relative" />
          
          <BrandLogo size="small" variant="horizontal" id="dashboard-header" />
          
          <div className="flex flex-col ml-4">
            <h1 className="text-2xl font-bold text-white">Prompt Automation</h1>
            <p className="text-white/70 text-sm">
              {getTimeBasedGreeting()}, {user?.email || 'there'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 relative z-30">
          <ConnectionStatus />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
