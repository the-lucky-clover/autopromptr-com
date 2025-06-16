import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Settings, Activity, Database, Shield, Zap, AlertTriangle } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SecurityStatus } from "@/components/security/SecurityStatus";

const AdminPanel = () => {
  const { isSysOp, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!roleLoading && !isSysOp) {
      navigate('/dashboard');
    }
  }, [isSysOp, roleLoading, navigate]);

  useEffect(() => {
    if (isSysOp) {
      fetchSecurityEvents();
    }
  }, [isSysOp]);

  const fetchSecurityEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching security events:', error);
      } else {
        setSecurityEvents(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch security events:', error);
    }
  };

  const mockUsers = [
    { id: 1, email: 'pounds1@gmail.com', role: 'sysop', status: 'active', batches: '∞', lastLogin: '2 mins ago' },
    { id: 2, email: 'user1@example.com', role: 'user', status: 'active', batches: 12, lastLogin: '1 hour ago' },
    { id: 3, email: 'user2@example.com', role: 'user', status: 'inactive', batches: 5, lastLogin: '3 days ago' },
    { id: 4, email: 'admin@example.com', role: 'admin', status: 'active', batches: 45, lastLogin: '30 mins ago' },
  ];

  const systemStats = [
    { title: 'Total Users', value: '1,247', icon: Users, color: 'text-blue-400' },
    { title: 'Active Batches', value: '89', icon: Zap, color: 'text-orange-400' },
    { title: 'Security Events', value: securityEvents.length.toString(), icon: Shield, color: 'text-red-400' },
    { title: 'System Health', value: '98.5%', icon: Database, color: 'text-green-400' },
  ];

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-900 via-blue-900 to-purple-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isSysOp) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' }}>
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="text-white hover:text-purple-200 rounded-xl" />
              <div>
                <h1 className="text-2xl font-semibold text-white">System Administration</h1>
                <p className="text-purple-200">Enhanced Security Control Panel</p>
              </div>
            </div>
            <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
              <Shield className="w-3 h-3 mr-1" />
              SysOp Access
            </Badge>
          </div>

          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {systemStats.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm">{stat.title}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6">
            {[
              { id: 'overview', label: 'Security Overview', icon: Shield },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'security', label: 'Security Events', icon: AlertTriangle },
              { id: 'system', label: 'System Config', icon: Settings },
              { id: 'database', label: 'Database', icon: Database },
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                className={`${
                  activeTab === tab.id 
                    ? 'bg-purple-600 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                } rounded-xl`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <SecurityStatus />
            </div>
          )}

          {activeTab === 'security' && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Security Events Monitor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={fetchSecurityEvents} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                  Refresh Events
                </Button>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {securityEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <span className="text-purple-300 text-sm font-mono">
                          {new Date(event.created_at).toLocaleTimeString()}
                        </span>
                        <span className="text-white/60 text-sm">{event.user_id ? 'User Event' : 'System Event'}</span>
                        <span className="text-white text-sm">{event.event_type}</span>
                      </div>
                      <Badge variant={
                        event.event_type.includes('failed') || event.event_type.includes('unauthorized') 
                          ? 'destructive' 
                          : event.event_type.includes('success') 
                          ? 'default' 
                          : 'secondary'
                      }>
                        {event.event_type}
                      </Badge>
                    </div>
                  ))}
                  {securityEvents.length === 0 && (
                    <div className="text-center text-white/60 py-8">
                      No security events found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-4 mb-4">
                  <Input 
                    placeholder="Search users..." 
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
                  />
                  <Select>
                    <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white rounded-xl">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="sysop">SysOp</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  {mockUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-white font-medium">{user.email}</p>
                          <p className="text-purple-200 text-sm">Last login: {user.lastLogin}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={user.role === 'sysop' ? 'destructive' : user.role === 'admin' ? 'secondary' : 'outline'}>
                          {user.role}
                        </Badge>
                        <span className="text-white/60 text-sm">{user.batches} batches</span>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                        <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-xl">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'system' && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
              <CardHeader>
                <CardTitle className="text-white">System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-medium">Batch Processing</h3>
                    <div className="space-y-2">
                      <label className="text-purple-200 text-sm">Max Concurrent Batches</label>
                      <Input defaultValue="10" className="bg-white/10 border-white/20 text-white rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-purple-200 text-sm">Batch Timeout (minutes)</label>
                      <Input defaultValue="30" className="bg-white/10 border-white/20 text-white rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-white font-medium">API Limits</h3>
                    <div className="space-y-2">
                      <label className="text-purple-200 text-sm">Rate Limit (req/min)</label>
                      <Input defaultValue="1000" className="bg-white/10 border-white/20 text-white rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-purple-200 text-sm">Max Prompts per Batch</label>
                      <Input defaultValue="100" className="bg-white/10 border-white/20 text-white rounded-xl" />
                    </div>
                  </div>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                  Save Configuration
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'activity' && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
              <CardHeader>
                <CardTitle className="text-white">System Activity Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { time: '14:23:45', user: 'pounds1@gmail.com', action: 'Admin panel accessed', type: 'info' },
                    { time: '14:22:01', user: 'user1@example.com', action: 'Batch created: Marketing Campaign', type: 'success' },
                    { time: '14:20:15', user: 'system', action: 'Database backup completed', type: 'info' },
                    { time: '14:18:32', user: 'user2@example.com', action: 'Failed login attempt', type: 'warning' },
                  ].map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <span className="text-purple-300 text-sm font-mono">{log.time}</span>
                        <span className="text-white/60 text-sm">{log.user}</span>
                        <span className="text-white text-sm">{log.action}</span>
                      </div>
                      <Badge variant={log.type === 'success' ? 'default' : log.type === 'warning' ? 'destructive' : 'secondary'}>
                        {log.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'database' && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
              <CardHeader>
                <CardTitle className="text-white">Database Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-auto p-4 flex flex-col">
                    <Database className="w-6 h-6 mb-2" />
                    <span>Backup Database</span>
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-auto p-4 flex flex-col">
                    <Shield className="w-6 h-6 mb-2" />
                    <span>Run Maintenance</span>
                  </Button>
                  <Button className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl h-auto p-4 flex flex-col">
                    <Activity className="w-6 h-6 mb-2" />
                    <span>Performance Stats</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminPanel;
