import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  PlayCircle, 
  PauseCircle, 
  StopCircle, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Brain,
  Users,
  Settings
} from 'lucide-react';

interface BatchJobWithOversight {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  human_oversight_enabled: boolean;
  step_by_step_mode: boolean;
  auto_approval_threshold: number;
  tasks: any[];
}

interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  processing: number;
  pending: number;
}

interface ApprovalStats {
  total_approvals: number;
  human_interventions: number;
  average_confidence: number;
}

interface BatchOversightPanelProps {
  batchId?: string;
  onBatchSelected?: (batchId: string) => void;
}

const BatchOversightPanel: React.FC<BatchOversightPanelProps> = ({ 
  batchId, 
  onBatchSelected 
}) => {
  const [activeBatches, setActiveBatches] = useState<BatchJobWithOversight[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchJobWithOversight | null>(null);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const [approvalStats, setApprovalStats] = useState<ApprovalStats | null>(null);
  const [oversightSettings, setOversightSettings] = useState({
    humanOversightEnabled: true,
    stepByStepMode: false,
    autoApprovalThreshold: 0.8
  });
  const { toast } = useToast();

  useEffect(() => {
    loadActiveBatches();
    
    const interval = setInterval(loadActiveBatches, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (batchId && activeBatches.length > 0) {
      const batch = activeBatches.find(b => b.id === batchId);
      if (batch) {
        setSelectedBatch(batch);
        loadBatchDetails(batchId);
      }
    }
  }, [batchId, activeBatches]);

  const loadActiveBatches = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/batches');
      const data = await response.json();
      setActiveBatches(data.active_jobs || []);
    } catch (error) {
      console.error('Error loading active batches:', error);
    }
  };

  const loadBatchDetails = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/batches/${id}/status`);
      const data = await response.json();
      
      setBatchProgress(data.progress);
      setApprovalStats(data.approval_stats);
      
      // Update selected batch with latest data
      if (data.job) {
        setSelectedBatch(data.job);
      }
    } catch (error) {
      console.error('Error loading batch details:', error);
    }
  };

  const handleBatchAction = async (action: 'pause' | 'resume' | 'stop', id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${id}/${action}`, {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: "Action Successful",
          description: `Batch ${action}d successfully`,
        });
        
        // Refresh data
        loadActiveBatches();
        if (selectedBatch?.id === id) {
          loadBatchDetails(id);
        }
      } else {
        throw new Error(`Failed to ${action} batch`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} batch`,
        variant: "destructive",
      });
    }
  };

  const createOversightBatch = async (batchData: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/run-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batch: batchData,
          platform: 'web',
          options: {
            human_oversight_enabled: oversightSettings.humanOversightEnabled,
            step_by_step_mode: oversightSettings.stepByStepMode,
            auto_approval_threshold: oversightSettings.autoApprovalThreshold
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Batch Created",
          description: `Batch created with human oversight: ${result.job_id}`,
        });
        
        loadActiveBatches();
        return result;
      } else {
        throw new Error('Failed to create oversight batch');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create oversight batch",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600';
      case 'paused': return 'text-yellow-600';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'stopped': return 'text-gray-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <PlayCircle className="h-4 w-4" />;
      case 'paused': return <PauseCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      case 'stopped': return <StopCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Batch Oversight Panel</h3>
          <p className="text-muted-foreground">
            Monitor and control batch jobs with human oversight
          </p>
        </div>
        
        {/* Oversight Settings */}
        <Card className="w-80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Settings className="h-4 w-4" />
              <span>Oversight Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Human Oversight</span>
              <Switch
                checked={oversightSettings.humanOversightEnabled}
                onCheckedChange={(checked) => 
                  setOversightSettings(prev => ({...prev, humanOversightEnabled: checked}))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Step-by-Step Mode</span>
              <Switch
                checked={oversightSettings.stepByStepMode}
                onCheckedChange={(checked) => 
                  setOversightSettings(prev => ({...prev, stepByStepMode: checked}))
                }
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-approval Threshold</span>
                <span className="text-sm font-medium">
                  {Math.round(oversightSettings.autoApprovalThreshold * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={oversightSettings.autoApprovalThreshold}
                onChange={(e) => 
                  setOversightSettings(prev => ({
                    ...prev, 
                    autoApprovalThreshold: parseFloat(e.target.value)
                  }))
                }
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Batches List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Active Batches ({activeBatches.length})</span>
            </CardTitle>
            <CardDescription>
              Batches currently running with human oversight
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeBatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active batches</p>
                <p className="text-sm">Create a new batch to start automation</p>
              </div>
            ) : (
              activeBatches.map((batch) => (
                <div
                  key={batch.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedBatch?.id === batch.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50 hover:bg-primary/2'
                  }`}
                  onClick={() => {
                    setSelectedBatch(batch);
                    loadBatchDetails(batch.id);
                    onBatchSelected?.(batch.id);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`flex items-center space-x-2 ${getStatusColor(batch.status)}`}>
                      {getStatusIcon(batch.status)}
                      <Badge variant={batch.status === 'running' ? 'default' : 'secondary'}>
                        {batch.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {batch.human_oversight_enabled && (
                        <Badge variant="outline" className="text-xs">
                          Oversight
                        </Badge>
                      )}
                      {batch.step_by_step_mode && (
                        <Badge variant="outline" className="text-xs">
                          Step-by-step
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-medium mb-1">{batch.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {batch.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{batch.tasks?.length || 0} tasks</span>
                    <span>
                      Created: {new Date(batch.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Batch Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Batch Details</span>
              </div>
              
              {selectedBatch && (
                <div className="flex space-x-2">
                  {selectedBatch.status === 'running' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBatchAction('pause', selectedBatch.id)}
                    >
                      <PauseCircle className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  
                  {selectedBatch.status === 'paused' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBatchAction('resume', selectedBatch.id)}
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  )}
                  
                  {['running', 'paused'].includes(selectedBatch.status) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBatchAction('stop', selectedBatch.id)}
                    >
                      <StopCircle className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  )}
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedBatch ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-medium mb-3">Batch Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{selectedBatch.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <div className={`flex items-center space-x-1 ${getStatusColor(selectedBatch.status)}`}>
                        {getStatusIcon(selectedBatch.status)}
                        <span>{selectedBatch.status}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Human Oversight:</span>
                      <Badge variant={selectedBatch.human_oversight_enabled ? 'default' : 'secondary'}>
                        {selectedBatch.human_oversight_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Step-by-step:</span>
                      <Badge variant={selectedBatch.step_by_step_mode ? 'default' : 'secondary'}>
                        {selectedBatch.step_by_step_mode ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                {batchProgress && (
                  <div>
                    <h4 className="font-medium mb-3">Progress</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span>{Math.round((batchProgress.completed / batchProgress.total) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(batchProgress.completed / batchProgress.total) * 100} 
                        className="h-2"
                      />
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Completed:</span>
                            <span className="text-green-600">{batchProgress.completed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Processing:</span>
                            <span className="text-blue-600">{batchProgress.processing}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pending:</span>
                            <span className="text-gray-600">{batchProgress.pending}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Failed:</span>
                            <span className="text-red-600">{batchProgress.failed}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Approval Stats */}
                {approvalStats && (
                  <div>
                    <h4 className="font-medium mb-3">Human Oversight Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Approvals:</span>
                        <span>{approvalStats.total_approvals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Human Interventions:</span>
                        <span>{approvalStats.human_interventions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Confidence:</span>
                        <span>{Math.round(approvalStats.average_confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a batch to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BatchOversightPanel;