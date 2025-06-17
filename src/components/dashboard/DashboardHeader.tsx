
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import SynthwaveBackground from "@/components/SynthwaveBackground";
import SynthwaveBrandLogo from "@/components/SynthwaveBrandLogo";

const DashboardHeader = () => {
  return (
    <div className="mb-6">
      {/* Header Content */}
      <div className="flex items-center justify-between h-20 px-4">
        <div className="flex items-center space-x-4 min-w-0 relative">
          {/* Synthwave Background Container - positioned behind the brand area only */}
          <div className="absolute left-0 top-0 w-80 h-20 overflow-hidden rounded-2xl">
            <SynthwaveBackground />
          </div>
          
          <SidebarTrigger className="text-white hover:text-cyan-200 rounded-xl flex-shrink-0 z-30 relative" />
          
          {/* Synthwave Logo floating above the background */}
          <div className="min-w-0 flex items-center relative z-30">
            <SynthwaveBrandLogo size="medium" variant="horizontal" />
          </div>
          
          {/* Subtle gradient overlay for better text readability */}
          <div className="absolute left-0 top-0 w-80 h-20 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none z-20 rounded-2xl" />
        </div>
        
        <div className="flex items-center space-x-3 relative z-30">
          <ConnectionStatus />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
