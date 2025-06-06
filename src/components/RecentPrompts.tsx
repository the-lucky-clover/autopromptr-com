
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
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "paused":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "draft":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <Card className="glass-effect border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white">Recent Prompts</CardTitle>
        <CardDescription className="text-gray-300">
          Your most recently used AI prompts and workflows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="flex items-center justify-between p-4 rounded-lg glass-effect border-purple-500/20 hover:border-purple-500/40 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <h4 className="font-medium text-white">{prompt.name}</h4>
                  <Badge className={getStatusColor(prompt.status)}>
                    {prompt.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-300 mb-2">{prompt.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>Last run: {prompt.lastRun}</span>
                  <span>•</span>
                  <span>{prompt.executions} executions</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {prompt.status === "active" && (
                  <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300 hover:bg-green-500/10">
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-300">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-effect border-purple-500/30">
                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-500/10">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
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
