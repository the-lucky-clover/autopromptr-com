import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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

interface HumanOversightStats {
  total_requests: number;
  pending_requests: number;
  approval_rate: number;
  auto_approval_rate: number;
  average_response_time_seconds: number;
  timeout_rate: number;
}

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  channel?: string;
}

interface HumanOversightHook {
  // State
  pendingApprovals: ApprovalRequest[];
  stats: HumanOversightStats | null;
  websocketConnected: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  loadPendingApprovals: () => Promise<void>;
  loadStats: () => Promise<void>;
  respondToApproval: (
    approvalId: string, 
    decision: 'approve' | 'reject', 
    reasoning?: string,
    modifications?: any
  ) => Promise<boolean>;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;

  // Real-time events
  onApprovalRequest: (callback: (approval: ApprovalRequest) => void) => void;
  onApprovalResponse: (callback: (approval: ApprovalRequest) => void) => void;
  onAutoApproval: (callback: (approval: ApprovalRequest) => void) => void;
}

export function useHumanOversight(
  baseUrl: string = 'http://localhost:5000',
  websocketUrl: string = 'ws://localhost:8765'
): HumanOversightHook {
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [stats, setStats] = useState<HumanOversightStats | null>(null);
  const [websocketConnected, setWebsocketConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  
  // Event callbacks
  const [onApprovalRequestCallbacks, setOnApprovalRequestCallbacks] = useState<((approval: ApprovalRequest) => void)[]>([]);
  const [onApprovalResponseCallbacks, setOnApprovalResponseCallbacks] = useState<((approval: ApprovalRequest) => void)[]>([]);
  const [onAutoApprovalCallbacks, setOnAutoApprovalCallbacks] = useState<((approval: ApprovalRequest) => void)[]>([]);
  
  const { toast } = useToast();

  const loadPendingApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${baseUrl}/api/approvals/pending`);
      
      if (!response.ok) {
        throw new Error('Failed to load pending approvals');
      }
      
      const data = await response.json();
      setPendingApprovals(data.pending_approvals || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error loading pending approvals:', err);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/api/approval-service/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to load approval stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error loading approval stats:', err);
    }
  }, [baseUrl]);

  const respondToApproval = useCallback(async (
    approvalId: string,
    decision: 'approve' | 'reject',
    reasoning: string = '',
    modifications: any = null
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${baseUrl}/api/approvals/${approvalId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision,
          reasoning,
          modifications
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Remove the approval from pending list
      setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
      
      // Refresh stats
      await loadStats();
      
      toast({
        title: "Response Sent",
        description: `Approval ${decision}d successfully`,
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: `Failed to respond to approval: ${errorMessage}`,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, loadStats, toast]);

  const connectWebSocket = useCallback(() => {
    if (websocket) {
      return; // Already connected
    }
    
    try {
      const ws = new WebSocket(websocketUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected to Human Oversight service');
        setWebsocketConnected(true);
        
        // Subscribe to approval channels
        ws.send(JSON.stringify({
          type: 'subscribe',
          channels: ['orchestrator', 'approvals']
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'approval_request':
              const newApproval = message.data as ApprovalRequest;
              setPendingApprovals(prev => [...prev, newApproval]);
              
              // Trigger callbacks
              onApprovalRequestCallbacks.forEach(callback => callback(newApproval));
              
              toast({
                title: "New Approval Request",
                description: `Agent requires approval for: ${newApproval.action_type}`,
              });
              break;
              
            case 'approval_response':
              const respondedApproval = message.data as ApprovalRequest;
              setPendingApprovals(prev => prev.filter(a => a.id !== respondedApproval.id));
              
              // Trigger callbacks
              onApprovalResponseCallbacks.forEach(callback => callback(respondedApproval));
              
              // Refresh stats
              loadStats();
              break;
              
            case 'auto_approval':
              const autoApproval = message.data as ApprovalRequest;
              
              // Trigger callbacks
              onAutoApprovalCallbacks.forEach(callback => callback(autoApproval));
              
              toast({
                title: "Auto-Approved",
                description: `High confidence action auto-approved: ${autoApproval.action_type}`,
                variant: "default",
              });
              break;
              
            case 'approval_timeout':
              const timeoutApproval = message.data as ApprovalRequest;
              setPendingApprovals(prev => prev.filter(a => a.id !== timeoutApproval.id));
              
              toast({
                title: "Approval Timeout",
                description: `Approval request timed out: ${timeoutApproval.action_type}`,
                variant: "destructive",
              });
              break;
              
            case 'connection_established':
              console.log('WebSocket connection confirmed:', message.data);
              break;
              
            case 'subscription_confirmed':
              console.log('WebSocket subscriptions confirmed:', message.data);
              break;
              
            default:
              console.log('Unhandled WebSocket message:', message);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setWebsocketConnected(false);
        setWebsocket(null);
        
        // Attempt to reconnect after a delay
        if (!event.wasClean) {
          setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connectWebSocket();
          }, 5000);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      };
      
      setWebsocket(ws);
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect to real-time updates');
    }
  }, [websocketUrl, onApprovalRequestCallbacks, onApprovalResponseCallbacks, onAutoApprovalCallbacks, loadStats, toast]);

  const disconnectWebSocket = useCallback(() => {
    if (websocket) {
      websocket.close();
      setWebsocket(null);
      setWebsocketConnected(false);
    }
  }, [websocket]);

  // Event subscription methods
  const onApprovalRequest = useCallback((callback: (approval: ApprovalRequest) => void) => {
    setOnApprovalRequestCallbacks(prev => [...prev, callback]);
  }, []);

  const onApprovalResponse = useCallback((callback: (approval: ApprovalRequest) => void) => {
    setOnApprovalResponseCallbacks(prev => [...prev, callback]);
  }, []);

  const onAutoApproval = useCallback((callback: (approval: ApprovalRequest) => void) => {
    setOnAutoApprovalCallbacks(prev => [...prev, callback]);
  }, []);

  // Auto-connect WebSocket on mount
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket]);

  // Load initial data
  useEffect(() => {
    loadPendingApprovals();
    loadStats();
  }, [loadPendingApprovals, loadStats]);

  return {
    // State
    pendingApprovals,
    stats,
    websocketConnected,
    loading,
    error,

    // Actions
    loadPendingApprovals,
    loadStats,
    respondToApproval,
    connectWebSocket,
    disconnectWebSocket,

    // Event subscriptions
    onApprovalRequest,
    onApprovalResponse,
    onAutoApproval,
  };
}