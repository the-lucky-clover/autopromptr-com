import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useFlaskBackend } from '@/hooks/useFlaskBackend';
import { FlaskBatchJob } from '@/services/flaskBackend';
import { Play, Square, RefreshCw, TestTube, Zap, Activity } from 'lucide-react';

interface FlaskBackendDashboardProps {
  className?: string;
}

export function FlaskBackendDashboard({ className = "" }: FlaskBackendDashboardProps) {
  const {
    loading,
    error,
    connected,
    testConnection,
    createBatch,
    runBatch,
    getBatchStatus,
    stopBatch,
    listBatches,
    testGemini,
    clearError
  } = useFlaskBackend();

  const [jobs, setJobs] = useState<{
    active_jobs: FlaskBatchJob[];
    job_history: FlaskBatchJob[];
  }>({ active_jobs: [], job_history: [] });

  const [selectedJob, setSelectedJob] = useState<FlaskBatchJob | null>(null);
  const [geminiTest, setGeminiTest] = useState<any>(null);

  useEffect(() => {
    if (connected) {
      loadJobs();
    }
  }, [connected]);

  const loadJobs = async () => {
    try {
      const jobsData = await listBatches();
      setJobs(jobsData);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const handleCreateTestBatch = async () => {
    try {
      const result = await createBatch(
        'AI Test Batch',
        [
          { text: 'Create a beautiful gradient button component', platform: 'lovable' },
          { text: 'Add hover animations to the navigation', platform: 'lovable' },
          { text: 'Implement responsive design for mobile', platform: 'lovable' }
        ],
        'Test batch for AI orchestration system'
      );
      
      await loadJobs();
    } catch (error) {
      console.error('Failed to create test batch:', error);
    }
  };

  const handleRunJob = async (jobId: string) => {
    try {
      await runBatch(jobId);
      await loadJobs();
    } catch (error) {
      console.error('Failed to run job:', error);
    }
  };

  const handleStopJob = async (jobId: string) => {
    try {
      await stopBatch(jobId);
      await loadJobs();
    } catch (error) {
      console.error('Failed to stop job:', error);
    }
  };

  const handleTestGemini = async () => {
    try {
      const result = await testGemini('Create a React component that displays animated statistics');
      setGeminiTest(result);
    } catch (error) {
      console.error('Gemini test failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': case 'processing': return 'bg-blue-500';
      case 'failed': case 'error': return 'bg-red-500';
      case 'stopped': return 'bg-yellow-500';
      case 'queued': case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const calculateProgress = (job: FlaskBatchJob) => {
    const total = job.tasks.length;
    const completed = job.tasks.filter(t => t.status === 'completed').length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Flask AI Backend</h2>
          <p className="text-muted-foreground">
            AI orchestration with Gemini + Playwright automation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={connected ? "default" : "destructive"}>
            {connected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
            Test Connection
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Create Test Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCreateTestBatch}
              disabled={!connected || loading}
              className="w-full"
            >
              <Zap className="h-4 w-4 mr-2" />
              Create Batch
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Test Gemini AI</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleTestGemini}
              disabled={!connected || loading}
              variant="outline"
              className="w-full"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test Gemini
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Refresh Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={loadJobs}
              disabled={!connected || loading}
              variant="secondary"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Gemini Test Results */}
      {geminiTest && (
        <Card>
          <CardHeader>
            <CardTitle>Gemini Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant={geminiTest.success ? "default" : "destructive"}>
                {geminiTest.success ? 'Success' : 'Failed'}
              </Badge>
              {geminiTest.success ? (
                <p className="text-sm text-muted-foreground">
                  Response: {geminiTest.response?.substring(0, 200)}...
                </p>
              ) : (
                <p className="text-sm text-destructive">
                  Error: {geminiTest.error}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Jobs */}
      {jobs.active_jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Jobs</CardTitle>
            <CardDescription>Currently running batch jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.active_jobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{job.name}</h4>
                      <p className="text-sm text-muted-foreground">{job.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      {job.status === 'running' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStopJob(job.id)}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      ) : job.status === 'queued' && (
                        <Button
                          size="sm"
                          onClick={() => handleRunJob(job.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{job.tasks.filter(t => t.status === 'completed').length} / {job.tasks.length}</span>
                    </div>
                    <Progress value={calculateProgress(job)} />
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <br />
                      {new Date(job.created_at).toLocaleString()}
                    </div>
                    {job.started_at && (
                      <div>
                        <span className="text-muted-foreground">Started:</span>
                        <br />
                        {new Date(job.started_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job History */}
      {jobs.job_history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Job History</CardTitle>
            <CardDescription>Last 10 completed jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobs.job_history.map((job) => (
                <div key={job.id} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <h5 className="font-medium">{job.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      {job.tasks.filter(t => t.status === 'completed').length} / {job.tasks.length} completed
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                    {job.completed_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(job.completed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!connected && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Connect to Flask backend to manage AI batch processing
            </p>
            <Button onClick={testConnection} disabled={loading}>
              Connect Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}