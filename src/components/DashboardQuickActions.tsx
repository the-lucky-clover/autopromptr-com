
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BarChart3 } from "lucide-react";

const DashboardQuickActions = () => {
  const quickActions = [
    {
      title: "Create New Batch",
      icon: Plus,
      color: "bg-blue-600 hover:bg-blue-700",
      description: "Get started with common tasks"
    },
    {
      title: "Use Batcher Tool", 
      icon: BarChart3,
      color: "bg-gray-800 hover:bg-gray-700",
      description: "Batch processing tool"
    },
    {
      title: "View Analytics",
      icon: BarChart3, 
      color: "bg-purple-600 hover:bg-purple-700",
      description: "View detailed analytics"
    }
  ];

  return (
    <>
      {quickActions.map((action, index) => (
        <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm md:text-base">Quick Actions</CardTitle>
            <CardDescription className="text-purple-200 text-xs md:text-sm">
              Get started with common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant="ghost"
              className={`w-full justify-start text-left h-auto p-3 md:p-4 ${action.color} text-white rounded-xl`}
            >
              <action.icon className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium text-sm md:text-base truncate">{action.title}</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default DashboardQuickActions;
