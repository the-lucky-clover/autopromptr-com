
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ConnectionStatus } from "@/components/ConnectionStatus";

const DashboardHeader = () => {
  return (
    <div className="mb-6">
      {/* Header Content */}
      <div className="flex items-center justify-between h-20 px-4">
        <div className="flex items-center space-x-4 min-w-0 relative">
          <SidebarTrigger className="text-white hover:text-cyan-200 rounded-xl flex-shrink-0 z-30 relative" />
        </div>
        
        <div className="flex items-center space-x-3 relative z-30">
          <ConnectionStatus />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
