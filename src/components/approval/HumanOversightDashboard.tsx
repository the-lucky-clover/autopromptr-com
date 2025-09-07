import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  PlayCircle, 
  PauseCircle,
  Brain,
  Users,
  Activity
} from 'lucide-react';

interface ApprovalRequest {
  id: string;
  task_id: string;
  agent_id: string;
  action_type: string;
  description: string;
  context: any;
  confidence: number;
  confidence_level: string;
  status: string;
  created_at: string;
  screenshot_b64?: string;
}

interface ApprovalStats {
  total_requests: number;
  pending_requests: number;
  approval_rate: number;
  auto_approval_rate: number;
  average_response_time_seconds: number;
  timeout_rate: number;
}

const HumanOversightDashboard: React.FC = () => {
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [approvalStats, setApprovalStats] = useState<ApprovalStats | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [autoApprovalEnabled, setAutoApprovalEnabled] = useState(true);
  const [websocketConnected, setWebsocketConnected] = useState(false);
  const { toast } = useToast();

  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8765');
    
    ws.onopen = () => {
      setWebsocketConnected(true);
      // Subscribe to orchestrator events
      ws.send(JSON.stringify({
        type: 'subscribe',
        channels: ['orchestrator', 'approvals']
      }));
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'approval_request') {
        setPendingApprovals(prev => [...prev, message.data]);
        toast({
          title: "New Approval Request",
          description: `Agent requires approval for: ${message.data.action_type}`,
          variant: "default",
        });
      } else if (message.type === 'approval_response') {
        setPendingApprovals(prev => prev.filter(a => a.id !== message.data.id));
        loadApprovalStats();
      }
    };
    
    ws.onclose = () => {
      setWebsocketConnected(false);
    };
    
    return () => {
      ws.close();
    };
  }, [toast]);

  // Load pending approvals and stats
  useEffect(() => {
    loadPendingApprovals();
    loadApprovalStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadPendingApprovals();
      loadApprovalStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadPendingApprovals = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/approvals/pending');
      const data = await response.json();
      setPendingApprovals(data.pending_approvals || []);
    } catch (error) {
      console.error('Error loading pending approvals:', error);
    }
  };

  const loadApprovalStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/approval-service/stats');
      const data = await response.json();
      setApprovalStats(data);
    } catch (error) {
      console.error('Error loading approval stats:', error);
    }
  };

  const handleApprovalResponse = async (approvalId: string, decision: 'approve' | 'reject') => {
    try {
      const response = await fetch(`http://localhost:5000/api/approvals/${approvalId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision,
          reasoning,
          modifications: decision === 'approve' ? {} : undefined
        })
      });

      if (response.ok) {
        toast({
          title: "Response Sent",
          description: `Approval ${decision}d successfully`,
        });
        
        // Remove from pending list
        setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
        setSelectedApproval(null);
        setReasoning('');
        
        // Refresh stats
        loadApprovalStats();
      } else {
        throw new Error('Failed to respond to approval');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to respond to approval request",
        variant: "destructive",
      });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.5) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Human Oversight Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and approve AI agent actions in real-time
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${websocketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">
              {websocketConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={autoApprovalEnabled}
              onCheckedChange={setAutoApprovalEnabled}
            />
            <span className="text-sm">Auto-approval</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {approvalStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvalStats.total_requests}</div>
              <p className="text-xs text-muted-foreground">
                {approvalStats.pending_requests} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvalStats.approval_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Human decisions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Auto-Approval</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvalStats.auto_approval_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                High confidence actions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(approvalStats.average_response_time_seconds)}s
              </div>
              <p className="text-xs text-muted-foreground">
                Human review time
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Pending Approvals ({pendingApprovals.length})</span>
            </CardTitle>
            <CardDescription>
              AI agents waiting for human approval to proceed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending approvals</p>
                <p className="text-sm">All agents are operating autonomously</p>
              </div>
            ) : (
              pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedApproval?.id === approval.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50 hover:bg-primary/2'
                  }`}
                  onClick={() => setSelectedApproval(approval)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={getConfidenceBadgeVariant(approval.confidence)}>
                      {(approval.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                    <Badge variant="outline">
                      {approval.action_type}
                    </Badge>
                  </div>
                  
                  <h4 className="font-medium mb-1">{approval.description}</h4>
                  <p className="text-sm text-muted-foreground">
                    Agent: {approval.agent_id} • Task: {approval.task_id.substring(0, 8)}...
                  </p>
                  
                  <div className="mt-2">
                    <Progress 
                      value={approval.confidence * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Approval Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Approval Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedApproval ? (
              <div className="space-y-4">
                {/* Basic Info */}
                <div>
                  <h4 className="font-medium mb-2">Action Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Action Type:</span>
                      <Badge variant="outline">{selectedApproval.action_type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Agent ID:</span>
                      <span>{selectedApproval.agent_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className={getConfidenceColor(selectedApproval.confidence)}>
                        {(selectedApproval.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(selectedApproval.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApproval.description}
                  </p>
                </div>

                {/* Context */}
                {selectedApproval.context && (
                  <div>
                    <h4 className="font-medium mb-2">Context</h4>
                    <pre className="text-xs bg-muted p-2 rounded max-h-32 overflow-y-auto">
                      {JSON.stringify(selectedApproval.context, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Screenshot */}
                {selectedApproval.screenshot_b64 && (
                  <div>
                    <h4 className="font-medium mb-2">Screenshot</h4>
                    <img 
                      src={`data:image/png;base64,${selectedApproval.screenshot_b64}`}
                      alt="Action screenshot"
                      className="w-full rounded border"
                    />
                  </div>
                )}

                {/* Reasoning Input */}
                <div>
                  <h4 className="font-medium mb-2">Response Reasoning</h4>
                  <Textarea
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    placeholder="Provide reasoning for your decision..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleApprovalResponse(selectedApproval.id, 'approve')}
                    className="flex-1"
                    variant="default"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleApprovalResponse(selectedApproval.id, 'reject')}
                    className="flex-1"
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an approval request to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HumanOversightDashboard;