
import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";
import DashboardWelcomeModule from "@/components/dashboard/DashboardWelcomeModule";

const Results = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['automation-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div 
      className="min-h-screen relative animate-shimmer"
      style={{ 
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)' 
      }}
    >
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 relative">
            <DashboardWelcomeModule
              title="Results"
              subtitle="View and analyze the results of your automated prompt processing sessions."
              clockColor="#10B981" // Green for results dashboard
            />
            
            <div className="px-6 pb-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Automation Results</CardTitle>
                  <CardDescription className="text-gray-400">
                    Recent automation logs and processing results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : logs && logs.length > 0 ? (
                    <div className="space-y-4">
                      {logs.map((log) => (
                        <div key={log.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.success_status || 'pending')}
                              <span className="text-white font-medium">
                                {log.target_url || 'Unknown Platform'}
                              </span>
                              <Badge className={getStatusColor(log.success_status || 'pending')}>
                                {log.success_status || 'pending'}
                              </Badge>
                            </div>
                            <span className="text-gray-400 text-sm">
                              {new Date(log.timestamp || '').toLocaleString()}
                            </span>
                          </div>
                          
                          {log.prompt_text && (
                            <div className="mb-2">
                              <p className="text-gray-300 text-sm">
                                <span className="font-medium">Prompt:</span> {log.prompt_text.substring(0, 100)}
                                {log.prompt_text.length > 100 ? '...' : ''}
                              </p>
                            </div>
                          )}
                          
                          {log.time_saved_seconds && (
                            <div className="text-green-400 text-sm">
                              Time saved: {log.time_saved_seconds} seconds
                            </div>
                          )}
                          
                          {log.metadata && typeof log.metadata === 'object' && (
                            <div className="mt-2 text-xs text-gray-500">
                              <details>
                                <summary className="cursor-pointer">View metadata</summary>
                                <pre className="mt-2 bg-gray-900 p-2 rounded text-xs overflow-auto">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </details>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No automation results yet</p>
                      <p className="text-gray-500 text-sm">
                        Results will appear here after running batch automations
                      </p>
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
