
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBatchAutomation, AutoPromptr } from '@/services/autoPromptr';
import { Platform } from '@/types/batch';

interface BatchControlPanelProps {
  batchId: string;
}

export function BatchControlPanel({ batchId }: BatchControlPanelProps) {
  const { status, loading, error, runBatch, stopBatch } = useBatchAutomation(batchId);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [settings, setSettings] = useState({
    delay: 5000,
    maxRetries: 3
  });

  // Load platforms on mount
  useEffect(() => {
    const autoPromptr = new AutoPromptr();
    autoPromptr.getPlatforms()
      .then((data) => {
        setPlatforms(data.filter((p: Platform) => p.type === 'web'));
      })
      .catch(console.error);
  }, []);

  const handleRunBatch = async () => {
    if (!selectedPlatform) {
      alert('Please select a platform');
      return;
    }

    try {
      await runBatch(selectedPlatform, settings);
    } catch (err) {
      console.error('Failed to run batch:', err);
    }
  };

  const handleStopBatch = async () => {
    try {
      await stopBatch();
    } catch (err) {
      console.error('Failed to stop batch:', err);
    }
  };

  // Status indicator colors
  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      case 'stopped': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Batch Automation Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>Error: {error}</AlertDescription>
          </Alert>
        )}

        {/* Platform Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Platform:</label>
          <Select 
            value={selectedPlatform} 
            onValueChange={setSelectedPlatform}
            disabled={loading || status?.status === 'processing'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a platform..." />
            </SelectTrigger>
            <SelectContent>
              {platforms.map(platform => (
                <SelectItem key={platform.id} value={platform.id}>
                  {platform.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Delay between prompts (ms):</label>
            <Input
              type="number"
              value={settings.delay}
              onChange={(e) => setSettings({...settings, delay: parseInt(e.target.value)})}
              min="1000"
              max="60000"
              step="1000"
              disabled={loading || status?.status === 'processing'}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Max retries:</label>
            <Input
              type="number"
              value={settings.maxRetries}
              onChange={(e) => setSettings({...settings, maxRetries: parseInt(e.target.value)})}
              min="1"
              max="10"
              disabled={loading || status?.status === 'processing'}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-3">
          <Button 
            onClick={handleRunBatch}
            disabled={!selectedPlatform || loading || status?.status === 'processing'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Starting...' : 'Run Batch'}
          </Button>
          
          <Button 
            onClick={handleStopBatch}
            disabled={status?.status !== 'processing'}
            variant="destructive"
          >
            Stop Batch
          </Button>
        </div>

        {/* Status Display */}
        {status && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Batch Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`font-semibold ${getStatusColor(status.status)}`}>
                    {status.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Platform:</span> {status.platform}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress: {status.progress.completed}/{status.progress.total} prompts completed</span>
                  <span>{status.progress.percentage}%</span>
                </div>
                <Progress value={status.progress.percentage} className="w-full" />
              </div>

              {/* Detailed counts */}
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-green-600">✓ {status.progress.completed} completed</span>
                {status.progress.failed > 0 && (
                  <span className="text-red-600">✗ {status.progress.failed} failed</span>
                )}
                {status.progress.processing > 0 && (
                  <span className="text-blue-600">⟳ {status.progress.processing} processing</span>
                )}
                {status.progress.pending > 0 && (
                  <span className="text-gray-600">⏳ {status.progress.pending} pending</span>
                )}
              </div>

              {/* Recent logs */}
              {status.recent_logs && status.recent_logs.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium">Recent Activity</h5>
                  <ScrollArea className="h-32 w-full border rounded p-3 bg-gray-50">
                    {status.recent_logs.map((log: any, index: number) => (
                      <div key={index} className="text-xs mb-1">
                        <span className={`font-bold ${
                          log.level === 'error' ? 'text-red-600' : 
                          log.level === 'warning' ? 'text-orange-600' : 
                          'text-gray-600'
                        }`}>
                          {log.level.toUpperCase()}:
                        </span>{' '}
                        {log.message}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
