
import { ConnectionStatus } from "@/components/ConnectionStatus";

const BatchExtractorPageHeader = () => {
  return (
    <div className="flex justify-between items-center p-6 border-b border-white/10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Batch Extractor</h1>
      </div>
      <ConnectionStatus />
    </div>
  );
};

export default BatchExtractorPageHeader;
