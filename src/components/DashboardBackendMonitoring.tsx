
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

const DashboardBackendMonitoring = () => {
  return (
    <>
      {/* Backend Health Frame */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-white text-sm md:text-base">Backend Health</CardTitle>
              <CardDescription className="text-purple-200 text-xs md:text-sm">
                Live backend status check
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-purple-200 flex-shrink-0"
              onClick={() => window.open('https://autopromptr-backend.onrender.com/health', '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
            <iframe
              src="https://autopromptr-backend.onrender.com/health"
              className="w-full h-32 md:h-48 border-0"
              title="Backend Health Check"
            />
          </div>
          <p className="text-xs text-purple-300 mt-2 break-all">
            URL: https://autopromptr-backend.onrender.com/health
          </p>
        </CardContent>
      </Card>

      {/* Render.com Logs Frame */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-white text-sm md:text-base">Render.com Logs</CardTitle>
              <CardDescription className="text-purple-200 text-xs md:text-sm">
                Live server logs dashboard
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-purple-200 flex-shrink-0"
              onClick={() => window.open('https://dashboard.render.com/web/srv-d112caili9vc738aumtg/logs', '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
            <iframe
              src="https://dashboard.render.com/web/srv-d112caili9vc738aumtg/logs"
              className="w-full h-64 md:h-80 border-0"
              title="Render.com Logs Dashboard"
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          </div>
          <p className="text-xs text-purple-300 mt-2 break-all">
            URL: https://dashboard.render.com/web/srv-d112caili9vc738aumtg/logs
          </p>
        </CardContent>
      </Card>
    </>
  );
};

export default DashboardBackendMonitoring;
