
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Filter, Clock, CheckCircle, XCircle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, formatDistanceToNow } from "date-fns";
import DashboardWelcomeModule from "@/components/dashboard/DashboardWelcomeModule";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface AutomationLog {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  batch_id: string | null;
  prompt_sent_at: string | null;
  response_received_at: string | null;
  time_saved_seconds: number | null;
  target_url: string | null;
  ai_assistant_type: string | null;
  success_status: string;
  prompt_text: string | null;
  response_text: string | null;
}

interface ProductivityMetrics {
  total_prompts_processed: number;
  total_time_saved_seconds: number;
  successful_prompts: number;
  failed_prompts: number;
  platforms_used: string[];
}

const Results = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [metrics, setMetrics] = useState<ProductivityMetrics>({
    total_prompts_processed: 0,
    total_time_saved_seconds: 0,
    successful_prompts: 0,
    failed_prompts: 0,
    platforms_used: []
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  useEffect(() => {
    if (user) {
      fetchLogs();
      fetchMetrics();
    }
  }, [user, filter]);

  const fetchLogs = async () => {
    try {
      let query = supabase
        .from('automation_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('success_status', filter === 'success' ? 'completed' : 'failed');
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: "Error fetching logs",
        description: "Unable to load automation logs",
        variant: "destructive",
      });
    }
  };

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('productivity_metrics')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;

      // Aggregate metrics from last 30 days
      const aggregated = (data || []).reduce((acc, day) => ({
        total_prompts_processed: acc.total_prompts_processed + day.total_prompts_processed,
        total_time_saved_seconds: acc.total_time_saved_seconds + day.total_time_saved_seconds,
        successful_prompts: acc.successful_prompts + day.successful_prompts,
        failed_prompts: acc.failed_prompts + day.failed_prompts,
        platforms_used: [...new Set([...acc.platforms_used, ...day.platforms_used])]
      }), {
        total_prompts_processed: 0,
        total_time_saved_seconds: 0,
        successful_prompts: 0,
        failed_prompts: 0,
        platforms_used: []
      });

      setMetrics(aggregated);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('automation_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      setLogs(prev => prev.filter(log => log.id !== logId));
      toast({
        title: "Log deleted",
        description: "Automation log has been permanently deleted.",
      });
    } catch (error) {
      console.error('Error deleting log:', error);
      toast({
        title: "Error deleting log",
        description: "Unable to delete the automation log",
        variant: "destructive",
      });
    }
  };

  const handleClearAllLogs = async () => {
    try {
      const { error } = await supabase
        .from('automation_logs')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;

      setLogs([]);
      toast({
        title: "All logs cleared",
        description: "All automation logs have been permanently deleted.",
      });
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast({
        title: "Error clearing logs",
        description: "Unable to clear automation logs",
        variant: "destructive",
      });
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Status', 'Platform', 'Time Saved (seconds)', 'Prompt', 'Response'].join(','),
      ...logs.map(log => [
        log.timestamp,
        log.success_status,
        log.ai_assistant_type || 'Unknown',
        log.time_saved_seconds || 0,
        `"${(log.prompt_text || '').replace(/"/g, '""')}"`,
        `"${(log.response_text || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automation-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTimeSaved = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      failed: "destructive",
      pending: "secondary"
    };
    
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen relative animate-shimmer" style={{ background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)' }}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 relative">
            <DashboardWelcomeModule 
              title="Results Dashboard"
              subtitle="Track automation performance and productivity metrics"
              clockColor="#8B5CF6" // Purple theme for results
            />
            
            <div className="px-6 pb-6">
              {/* Metrics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Total Prompts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{metrics.total_prompts_processed}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Time Saved</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-400">
                      {formatTimeSaved(metrics.total_time_saved_seconds)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-400">
                      {metrics.total_prompts_processed > 0 
                        ? Math.round((metrics.successful_prompts / metrics.total_prompts_processed) * 100)
                        : 0}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Platforms Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-400">{metrics.platforms_used.length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'success' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('success')}
                  >
                    Success
                  </Button>
                  <Button
                    variant={filter === 'failed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('failed')}
                  >
                    Failed
                  </Button>
                </div>

                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" size="sm" onClick={exportLogs}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear All Automation Logs</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. All automation logs will be permanently deleted 
                          and cannot be recovered. Consider exporting your data first.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAllLogs} className="bg-red-600 hover:bg-red-700">
                          Delete All Logs
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Logs Display */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Automation Logs</CardTitle>
                  <CardDescription className="text-gray-400">
                    Real-time activity feed of your automation sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-gray-400">Loading logs...</div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No automation logs found</div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg bg-gray-900/50 border border-gray-700">
                          <div className="flex-shrink-0 mt-1">
                            {getStatusIcon(log.success_status)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusBadge(log.success_status)}
                              {log.ai_assistant_type && (
                                <Badge variant="outline" className="text-xs">
                                  {log.ai_assistant_type}
                                </Badge>
                              )}
                              {log.time_saved_seconds && (
                                <Badge variant="outline" className="text-xs text-green-400">
                                  <Zap className="h-3 w-3 mr-1" />
                                  {formatTimeSaved(log.time_saved_seconds)}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-white mb-1">{log.message}</p>
                            
                            {log.prompt_text && (
                              <p className="text-xs text-gray-400 mb-1 truncate">
                                Prompt: {log.prompt_text}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                              </span>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-red-400">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Automation Log</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This log entry will be permanently deleted and cannot be recovered.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteLog(log.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Results;
