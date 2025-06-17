
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import SynthwaveBackground from "@/components/SynthwaveBackground";
import SynthwaveBrandLogo from "@/components/SynthwaveBrandLogo";

const DashboardHeader = () => {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl">
      {/* Synthwave Background Container - constrained to header area */}
      <div className="absolute inset-0 h-20">
        <SynthwaveBackground />
      </div>
      
      {/* Header Content */}
      <div className="relative z-20 flex items-center justify-between h-20 px-4">
        <div className="flex items-center space-x-4 min-w-0">
          <SidebarTrigger className="text-white hover:text-cyan-200 rounded-xl flex-shrink-0 z-30 relative" />
          
          {/* Synthwave Logo replacing the text title */}
          <div className="min-w-0 flex items-center">
            <SynthwaveBrandLogo size="medium" variant="horizontal" />
          </div>
        </div>
        
        <div className="flex items-center space-x-3 relative z-30">
          <ConnectionStatus />
        </div>
      </div>
      
      {/* Subtle gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none z-10" />
    </div>
  );
};

export default DashboardHeader;
