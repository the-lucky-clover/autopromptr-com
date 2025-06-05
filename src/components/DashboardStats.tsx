
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Zap, FileText, Users } from "lucide-react";

const DashboardStats = () => {
  const stats = [
    {
      title: "Total Prompts",
      value: "2,847",
      change: "+12%",
      trend: "up",
      icon: FileText,
      description: "from last month"
    },
    {
      title: "Active Workflows",
      value: "156",
      change: "+8%",
      trend: "up",
      icon: Zap,
      description: "currently running"
    },
    {
      title: "API Calls",
      value: "89.2K",
      change: "+23%",
      trend: "up",
      icon: Activity,
      description: "this month"
    },
    {
      title: "Team Members",
      value: "12",
      change: "+2",
      trend: "up",
      icon: Users,
      description: "active users"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="flex items-center text-xs">
              {stat.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={`font-medium ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                {stat.change}
              </span>
              <span className="text-gray-500 ml-1">{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
