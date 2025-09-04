import { useState, useRef, useCallback } from 'react';
import { AutonomousAgentOrchestrator, AgentState, AgentTask, AgentDecision } from '@/services/agents/AutonomousAgentOrchestrator';
import { Batch } from '@/types/batch';
import { useToast } from '@/hooks/use-toast';

export interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  idleAgents: number;
  busyAgents: number;
  totalTasksCompleted: number;
  averageSuccessRate: number;
}

export function useAutonomousAgents() {
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [activeTasks, setActiveTasks] = useState<AgentTask[]>([]);
  const [taskQueue, setTaskQueue] = useState<AgentTask[]>([]);
  const [decisions, setDecisions] = useState<AgentDecision[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [stats, setStats] = useState<AgentStats>({
    totalAgents: 0,
    activeAgents: 0,
    idleAgents: 0,
    busyAgents: 0,
    totalTasksCompleted: 0,
    averageSuccessRate: 0
  });

  const orchestratorRef = useRef<AutonomousAgentOrchestrator | null>(null);
  const { toast } = useToast();

  const initializeOrchestrator = useCallback(() => {
    if (!orchestratorRef.current) {
      orchestratorRef.current = new AutonomousAgentOrchestrator();
      console.log('🤖 Agent orchestrator initialized');
    }
    updateAgentStates();
  }, []);

  const updateAgentStates = useCallback(() => {
    if (!orchestratorRef.current) return;

    const currentAgents = orchestratorRef.current.getAgentStates();
    const currentTasks = orchestratorRef.current.getActiveTasks();
    const currentQueue = orchestratorRef.current.getTaskQueue();
    const currentDecisions = orchestratorRef.current.getDecisionHistory();

    setAgents(currentAgents);
    setActiveTasks(currentTasks);
    setTaskQueue(currentQueue);
    setDecisions(currentDecisions);

    // Calculate stats
    const totalAgents = currentAgents.length;
    const activeAgents = currentAgents.filter(a => a.status === 'active').length;
    const idleAgents = currentAgents.filter(a => a.status === 'idle').length;
    const busyAgents = currentAgents.filter(a => a.status === 'busy').length;
    const totalTasksCompleted = currentAgents.reduce((sum, agent) => sum + agent.performance.tasksCompleted, 0);
    const averageSuccessRate = totalAgents > 0 
      ? currentAgents.reduce((sum, agent) => sum + agent.performance.successRate, 0) / totalAgents 
      : 0;

    setStats({
      totalAgents,
      activeAgents,
      idleAgents,
      busyAgents,
      totalTasksCompleted,
      averageSuccessRate
    });
  }, []);

  const executeBatch = useCallback(async (batch: Batch) => {
    if (!batch || !batch.prompts || batch.prompts.length === 0) {
      toast({
        title: 'Invalid Batch',
        description: 'Batch must contain at least one prompt',
        variant: 'destructive'
      });
      return;
    }

    if (!orchestratorRef.current) {
      initializeOrchestrator();
    }

    setIsExecuting(true);

    try {
      console.log('🚀 Starting autonomous batch execution:', batch.name);
      
      toast({
        title: 'Autonomous Execution Started',
        description: `AI agents are now processing "${batch.name}" with ${batch.prompts.length} prompts`
      });

      // Start monitoring updates
      const updateInterval = setInterval(updateAgentStates, 1000);

      await orchestratorRef.current!.executeBatch(batch);

      clearInterval(updateInterval);
      updateAgentStates();

      toast({
        title: 'Batch Execution Complete',
        description: `Successfully processed "${batch.name}" using autonomous AI agents`
      });

    } catch (error) {
      console.error('❌ Autonomous batch execution failed:', error);
      
      toast({
        title: 'Execution Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsExecuting(false);
    }
  }, [initializeOrchestrator, updateAgentStates, toast]);

  const stopExecution = useCallback(async () => {
    if (!orchestratorRef.current) return;

    try {
      await orchestratorRef.current.stopAllAgents();
      updateAgentStates();
      setIsExecuting(false);
      
      toast({
        title: 'Execution Stopped',
        description: 'All autonomous agents have been stopped'
      });
    } catch (error) {
      console.error('❌ Error stopping agents:', error);
      
      toast({
        title: 'Stop Failed',
        description: 'Error occurred while stopping agents',
        variant: 'destructive'
      });
    }
  }, [updateAgentStates, toast]);

  const getAgentById = useCallback((agentId: string): AgentState | undefined => {
    return agents.find(agent => agent.id === agentId);
  }, [agents]);

  const getTasksForAgent = useCallback((agentId: string): AgentTask[] => {
    return activeTasks.filter(task => task.assignedAgent === agentId);
  }, [activeTasks]);

  const getDecisionsForAgent = useCallback((agentId: string): AgentDecision[] => {
    return decisions.filter(decision => decision.agentId === agentId);
  }, [decisions]);

  return {
    // State
    agents,
    activeTasks,
    taskQueue,
    decisions,
    isExecuting,
    stats,

    // Actions
    initializeOrchestrator,
    executeBatch,
    stopExecution,
    updateAgentStates,

    // Utilities
    getAgentById,
    getTasksForAgent,
    getDecisionsForAgent
  };
}