
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FloatingConsoleButton } from "@/components/admin/FloatingConsoleButton";
import BatchExtractorModule from "@/components/BatchExtractorModule";
import AnimatedDropdownClock from "@/components/AnimatedDropdownClock";

const BatchExtractorDashboard = () => {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' }}>
      <AnimatedDropdownClock enableEasterEgg={false} />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex justify-between items-center p-8 border-b border-white/10">
              <div>
                <h1 className="text-4xl font-bold text-white mb-3">Extractor</h1>
                <p className="text-purple-200 text-lg">Extract and process multiple prompts from large text blocks</p>
              </div>
            </div>
            
            <div className="p-8">
              <div className="max-w-full">
                <BatchExtractorModule isCompact={false} />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <FloatingConsoleButton />
    </div>
  );
};

export default BatchExtractorDashboard;
