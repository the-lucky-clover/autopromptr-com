
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Upload, FileText, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardQuickActions = () => {
  const quickActions = [
    {
      title: "Batch Extractor",
      description: "Extract and process multiple prompts",
      icon: Zap,
      href: "/dashboard/extractor",
      color: "text-blue-400 hover:text-blue-300"
    },
    {
      title: "Upload/Import", 
      description: "Import prompt batches from files",
      icon: Upload,
      href: "/dashboard/upload",
      color: "text-green-400 hover:text-green-300"
    },
    {
      title: "Analytics",
      description: "View batch performance metrics",
      icon: BarChart3,
      href: "/dashboard/analytics", 
      color: "text-purple-400 hover:text-purple-300"
    }
  ];

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm md:text-base">Quick Actions</CardTitle>
        <CardDescription className="text-purple-200 text-xs md:text-sm">
          Shortcuts to common tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {quickActions.map((action) => (
          <Button
            key={action.title}
            asChild
            variant="ghost"
            className="w-full justify-start h-auto p-3 bg-white/5 hover:bg-white/10 border-none rounded-xl"
          >
            <Link to={action.href}>
              <div className="flex items-center space-x-3 w-full">
                <action.icon className={`w-4 h-4 flex-shrink-0 ${action.color}`} />
                <div className="flex-1 text-left min-w-0">
                  <div className="text-white font-medium text-sm">{action.title}</div>
                  <div className="text-white/60 text-xs truncate">{action.description}</div>
                </div>
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default DashboardQuickActions;
