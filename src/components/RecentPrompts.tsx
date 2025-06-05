
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const RecentPrompts = () => {
  const prompts = [
    {
      id: 1,
      name: "Content Generation",
      description: "Generate blog posts and articles",
      status: "active",
      lastRun: "2 hours ago",
      executions: 1247
    },
    {
      id: 2,
      name: "Email Automation", 
      description: "Automated email responses",
      status: "active",
      lastRun: "5 minutes ago",
      executions: 856
    },
    {
      id: 3,
      name: "Data Analysis",
      description: "Analyze customer feedback",
      status: "paused",
      lastRun: "1 day ago",
      executions: 432
    },
    {
      id: 4,
      name: "Code Review",
      description: "Automated code analysis", 
      status: "active",
      lastRun: "30 minutes ago",
      executions: 289
    },
    {
      id: 5,
      name: "Social Media",
      description: "Generate social media posts",
      status: "draft",
      lastRun: "Never",
      executions: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900">Recent Prompts</CardTitle>
        <CardDescription className="text-gray-600">
          Your most recently used AI prompts and workflows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <h4 className="font-medium text-gray-900">{prompt.name}</h4>
                  <Badge className={getStatusColor(prompt.status)}>
                    {prompt.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{prompt.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Last run: {prompt.lastRun}</span>
                  <span>•</span>
                  <span>{prompt.executions} executions</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {prompt.status === "active" && (
                  <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border border-gray-200">
                    <DropdownMenuItem className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentPrompts;
