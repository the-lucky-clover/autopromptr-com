import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, PlayCircle, PauseCircle, Activity, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { fetchRecentActivity, subscribeToActivityUpdates, RealActivityItem } from "@/services/realActivityService";
import { toast } from "sonner";

const CompactRecentActivity = () => {
  const [activities, setActivities] = useState<RealActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      const data = await fetchRecentActivity(6); // Fewer items for compact view
      setActivities(data);
      setLoading(false);
    };

    loadActivities();
    const unsubscribe = subscribeToActivityUpdates(setActivities);
    return unsubscribe;
  }, []);

  const handleClearAll = () => {
    setActivities([]);
    toast.success("Recent activity cleared", {
      description: "All activity history has been removed",
      duration: 2000
    });
  };

  const getActivityIcon = (type: RealActivityItem['type']) => {
    switch (type) {
      case 'batch_created':
        return <PlayCircle className="w-3 h-3 text-blue-400" />;
      case 'batch_started':
        return <PlayCircle className="w-3 h-3 text-green-400" />;
      case 'batch_completed':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'batch_failed':
        return <XCircle className="w-3 h-3 text-red-500" />;
      case 'batch_paused':
        return <PauseCircle className="w-3 h-3 text-yellow-500" />;
      case 'system_event':
        return <Activity className="w-3 h-3 text-cyan-400" />;
      default:
        return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const getActivityColor = (type: RealActivityItem['type']) => {
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
      case 'system_event':
        return 'border-l-cyan-400';
      default:
        return 'border-l-gray-400';
    }
  };

  if (loading) {
    return (
      <Card className="h-[650px] flex flex-col bg-white/5 backdrop-blur-sm border-white/20 rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Activity
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-2 p-2 bg-white/5 rounded-md animate-pulse">
              <div className="w-3 h-3 bg-white/20 rounded mt-0.5"></div>
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-white/20 rounded w-3/4"></div>
                <div className="h-2 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[650px] flex flex-col bg-white/5 backdrop-blur-sm border-white/20 rounded-xl hover:bg-white/10 transition-all duration-300">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-white flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </div>
          {activities.length > 0 && (
            <Button
              onClick={handleClearAll}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1 h-auto"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-1.5 p-3 pt-0">
        {activities.length === 0 ? (
          <div className="text-center py-4">
            <Activity className="w-8 h-8 text-white/30 mx-auto mb-2" />
            <p className="text-white/60 text-xs">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start gap-2 p-2 bg-white/5 rounded-md border-l-2 ${getActivityColor(activity.type)} hover:bg-white/10 transition-all duration-200 animate-fade-in`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-medium truncate leading-tight">
                    {activity.message}
                  </p>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <p className="text-white/60 text-xs">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                    {activity.batchName && (
                      <p className="text-purple-300 text-xs font-medium truncate">
                        🔄 {activity.batchName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompactRecentActivity;
