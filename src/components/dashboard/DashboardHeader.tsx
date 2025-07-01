
import { ConnectionStatus } from "@/components/ConnectionStatus";
import RealTimeClock from "@/components/RealTimeClock";

const DashboardHeader = () => {
  return (
    <div className="absolute top-4 right-6 z-20">
      <div className="flex items-center space-x-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200 shadow-sm">
        <RealTimeClock />
        <div className="w-px h-4 bg-gray-300"></div>
        <ConnectionStatus />
      </div>
    </div>
  );
};

export default DashboardHeader;
