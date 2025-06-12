
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ConnectionStatus } from "@/components/ConnectionStatus";

const DashboardHeader = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4 min-w-0">
        <SidebarTrigger className="text-white hover:text-purple-200 rounded-xl flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-xl lg:text-2xl font-semibold text-white truncate">Prompt Engineering Lab</h1>
          <p className="text-purple-200 text-sm lg:text-base mt-1">Transform ideas into reality with AI-powered automation</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <ConnectionStatus />
      </div>
    </div>
  );
};

export default DashboardHeader;
