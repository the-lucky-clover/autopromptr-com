
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, PlayCircle, PauseCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: 'batch_created' | 'batch_completed' | 'batch_failed' | 'batch_started' | 'batch_paused';
  message: string;
  timestamp: Date;
  batchName?: string;
}

const RecentActivity = () => {
  // Mock data - in real app this would come from props or a hook
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'batch_created',
      message: 'New batch "Website Updates" created',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      batchName: 'Website Updates'
    },
    {
      id: '2',
      type: 'batch_started',
      message: 'Batch "UI Improvements" started processing',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      batchName: 'UI Improvements'
    },
    {
      id: '3',
      type: 'batch_completed',
      message: 'Batch "Bug Fixes" completed successfully',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      batchName: 'Bug Fixes'
    },
    {
      id: '4',
      type: 'batch_failed',
      message: 'Batch "API Integration" failed',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      batchName: 'API Integration'
    },
    {
      id: '5',
      type: 'batch_paused',
      message: 'Batch "Database Migration" paused',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      batchName: 'Database Migration'
    }
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'batch_created':
        return <PlayCircle className="w-4 h-4 text-blue-400" />;
      case 'batch_started':
        return <PlayCircle className="w-4 h-4 text-green-400" />;
      case 'batch_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'batch_failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'batch_paused':
        return <PauseCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'batch_created':
        return 'border-l-blue-400';
      case 'batch_started':
        return 'border-l-green-400';
      case 'batch_completed':
        return 'border-l-green-500';
      case 'batch_failed':
        return 'border-l-red-500';
      case 'batch_paused':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-400';
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-white/60 text-sm text-center py-4">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start gap-3 p-3 bg-white/5 rounded-lg border-l-2 ${getActivityColor(activity.type)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {activity.message}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
