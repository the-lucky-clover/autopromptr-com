
import { ConnectionStatus } from "@/components/ConnectionStatus";
import RealTimeClock from "@/components/RealTimeClock";

const DashboardHeader = () => {
  return (
    <div className="absolute top-4 right-6 z-20">
      <div className="flex items-center space-x-4">
        <RealTimeClock />
        <ConnectionStatus />
      </div>
    </div>
  );
};

export default DashboardHeader;
