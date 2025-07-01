
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FloatingConsoleButton } from "@/components/admin/FloatingConsoleButton";
import BatchExtractorModule from "@/components/BatchExtractorModule";
import DashboardWelcomeModule from "@/components/dashboard/DashboardWelcomeModule";

const BatchExtractorDashboard = () => {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' }}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <DashboardWelcomeModule 
              title="Extractor" 
              subtitle="Extract and process multiple prompts from large text blocks"
            />
            
            <div className="px-8 pb-8">
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
