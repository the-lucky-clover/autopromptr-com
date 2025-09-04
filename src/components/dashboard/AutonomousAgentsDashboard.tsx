import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAutonomousAgents } from '@/hooks/useAutonomousAgents';
import { Brain, Cpu, Activity, Zap, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface AutonomousAgentsDashboardProps {
  isMinimized?: boolean;
}

const AutonomousAgentsDashboard: React.FC<AutonomousAgentsDashboardProps> = ({ 
  isMinimized = false 
}) => {
  const {
    agents,
    activeTasks,
    taskQueue,
    decisions,
    isExecuting,
    stats,
    initializeOrchestrator,
    stopExecution,
    updateAgentStates
  } = useAutonomousAgents();

  useEffect(() => {
    initializeOrchestrator();
    const interval = setInterval(updateAgentStates, 2000);
    return () => clearInterval(interval);
  }, [initializeOrchestrator, updateAgentStates]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500'; 
      case 'idle': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'browser': return Brain;
      case 'code': return Cpu;
      case 'research': return Activity;
      case 'orchestrator': return Zap;
      default: return Users;
    }
  };

  if (isMinimized) {
    return (
      <div className="space-y-4">
        {/* Compact Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalAgents}</div>
            <div className="text-sm text-muted-foreground">Agents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{stats.totalTasksCompleted}</div>
            <div className="text-sm text-muted-foreground">Tasks Done</div>
          </div>
        </div>

        {/* Active Agents */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Active Agents</h4>
          {agents.slice(0, 3).map((agent) => {
            const IconComponent = getAgentTypeIcon(agent.type);
            return (
              <div key={agent.id} className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                <IconComponent className="w-4 h-4" />
                <span className="truncate">{agent.id}</span>
                <Badge variant="outline" className="text-xs">
                  {agent.status}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Execution Control */}
        {isExecuting && (
          <Button 
            onClick={stopExecution} 
            variant="destructive" 
            size="sm" 
            className="w-full"
          >
            Stop All Agents
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalAgents}</div>
                <div className="text-sm text-muted-foreground">Total Agents</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.busyAgents}</div>
                <div className="text-sm text-muted-foreground">Busy Agents</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalTasksCompleted}</div>
                <div className="text-sm text-muted-foreground">Tasks Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{Math.round(stats.averageSuccessRate)}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Agent Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Autonomous Agents
            </CardTitle>
            <CardDescription>
              Real-time status of all AI agents in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {agents.map((agent) => {
                  const IconComponent = getAgentTypeIcon(agent.type);
                  return (
                    <div key={agent.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          <span className="font-medium">{agent.id}</span>
                        </div>
                        <Badge variant={agent.status === 'busy' ? 'default' : 'secondary'}>
                          {agent.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        Type: {agent.type} | Tasks: {agent.performance.tasksCompleted}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <span>Success Rate:</span>
                        <Progress 
                          value={agent.performance.successRate} 
                          className="flex-1 h-2" 
                        />
                        <span>{Math.round(agent.performance.successRate)}%</span>
                      </div>
                      
                      {agent.currentTask && (
                        <div className="mt-2 text-xs text-blue-600">
                          Current: {agent.currentTask}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Task Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Task Management
            </CardTitle>
            <CardDescription>
              Active tasks and queue status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Active Tasks */}
              <div>
                <h4 className="font-medium mb-2">Active Tasks ({activeTasks.length})</h4>
                <ScrollArea className="h-32">
                  {activeTasks.length > 0 ? (
                    <div className="space-y-2">
                      {activeTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between text-sm border rounded p-2">
                          <span className="truncate">{task.type}: {task.id}</span>
                          <Badge variant="outline">{task.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No active tasks
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Queue */}
              <div>
                <h4 className="font-medium mb-2">Queue ({taskQueue.length})</h4>
                <ScrollArea className="h-32">
                  {taskQueue.length > 0 ? (
                    <div className="space-y-2">
                      {taskQueue.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center justify-between text-sm border rounded p-2">
                          <span className="truncate">{task.type}: {task.id}</span>
                          <Badge variant="secondary">{task.priority}</Badge>
                        </div>
                      ))}
                      {taskQueue.length > 5 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{taskQueue.length - 5} more tasks
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Queue empty
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Decisions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            AI Decision Log
          </CardTitle>
          <CardDescription>
            Recent autonomous decisions made by agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            {decisions.length > 0 ? (
              <div className="space-y-3">
                {decisions.slice(-10).reverse().map((decision, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{decision.agentId}</span>
                      <Badge variant="outline">{Math.round(decision.confidence * 100)}% confidence</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Task: {decision.taskId}
                    </div>
                    <div className="text-sm">{decision.decision}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {decision.reasoning}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No decisions recorded yet
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Control Panel */}
      {isExecuting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Execution Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Agents are currently executing tasks</div>
                <div className="text-sm text-muted-foreground">
                  {stats.busyAgents} agents busy, {activeTasks.length} tasks active
                </div>
              </div>
              <Button onClick={stopExecution} variant="destructive">
                Stop All Agents
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutonomousAgentsDashboard;