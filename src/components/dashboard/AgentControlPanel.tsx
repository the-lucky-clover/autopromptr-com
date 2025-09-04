import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAutonomousAgents } from '@/hooks/useAutonomousAgents';
import { useDashboardBatchManager } from '@/hooks/useDashboardBatchManager';
import { Play, Square, Brain, Zap, Activity } from 'lucide-react';

interface AgentControlPanelProps {
  isMinimized?: boolean;
}

const AgentControlPanel: React.FC<AgentControlPanelProps> = ({ isMinimized = false }) => {
  const { 
    stats, 
    isExecuting, 
    agents, 
    executeBatch, 
    stopExecution 
  } = useAutonomousAgents();
  
  const { batches } = useDashboardBatchManager();

  const handleExecuteBatch = async (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (batch) {
      await executeBatch(batch);
    }
  };

  const activeAgents = agents.filter(a => a.status === 'busy').length;

  if (isMinimized) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <span className="font-medium">AI Agents</span>
          </div>
          <Badge variant={isExecuting ? "default" : "secondary"}>
            {isExecuting ? 'Active' : 'Idle'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center">
            <div className="font-bold text-lg">{stats.totalAgents}</div>
            <div className="text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-green-500">{activeAgents}</div>
            <div className="text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-blue-500">{stats.totalTasksCompleted}</div>
            <div className="text-muted-foreground">Done</div>
          </div>
        </div>

        {isExecuting && (
          <Button 
            onClick={stopExecution} 
            variant="destructive" 
            size="sm" 
            className="w-full"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Agents
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Autonomous Agent Control
        </CardTitle>
        <CardDescription>
          Deploy and manage AI agents for autonomous batch processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agent Status Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">Total Agents</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-green-500" />
              <span className="font-medium">Active</span>
            </div>
            <div className="text-2xl font-bold text-green-500">{activeAgents}</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">
              {Math.round(stats.averageSuccessRate)}%
            </div>
          </div>
        </div>

        {/* Execution Status */}
        {isExecuting ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <div className="font-medium">Agents are executing tasks</div>
                  <div className="text-sm text-muted-foreground">
                    {activeAgents} agents active, {stats.totalTasksCompleted} tasks completed
                  </div>
                </div>
              </div>
              <Button onClick={stopExecution} variant="destructive" size="sm">
                <Square className="w-4 h-4 mr-2" />
                Stop All
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <div className="font-medium text-gray-700">AI Agents Ready</div>
              <div className="text-sm text-gray-500">
                Select a batch to begin autonomous processing
              </div>
            </div>

            {/* Quick Batch Selection */}
            {batches.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Quick Deploy</h4>
                {batches.slice(0, 3).map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{batch.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {batch.prompts.length} prompts
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleExecuteBatch(batch.id)} 
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Deploy Agents
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Agent Performance Metrics */}
        <div className="space-y-2">
          <h4 className="font-medium">Performance Metrics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>Tasks Completed:</span>
              <span className="font-medium">{stats.totalTasksCompleted}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Success:</span>
              <span className="font-medium">{Math.round(stats.averageSuccessRate)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentControlPanel;