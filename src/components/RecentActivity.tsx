
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, PlayCircle, PauseCircle, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { fetchRecentActivity, subscribeToActivityUpdates, RealActivityItem } from "@/services/realActivityService";

const RecentActivity = () => {
  const [activities, setActivities] = useState<RealActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    const loadActivities = async () => {
      setLoading(true);
      const data = await fetchRecentActivity(8);
      setActivities(data);
      setLoading(false);
    };

    loadActivities();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToActivityUpdates(setActivities);

    return unsubscribe;
  }, []);

  const getActivityIcon = (type: RealActivityItem['type']) => {
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
      case 'system_event':
        return <Activity className="w-4 h-4 text-cyan-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
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
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg animate-pulse">
              <div className="w-4 h-4 bg-white/20 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

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
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60 text-sm">No recent activity</p>
            <p className="text-white/40 text-xs mt-1">Start creating batches to see activity here</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start gap-3 p-3 bg-white/5 rounded-lg border-l-2 ${getActivityColor(activity.type)} hover:bg-white/10 transition-colors`}
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
                {activity.batchName && (
                  <p className="text-purple-300 text-xs mt-1 font-medium">
                    🔄 {activity.batchName}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
