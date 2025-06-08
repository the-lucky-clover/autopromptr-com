
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { AutoPromptr } from '@/services/autoPromptr';
import { Platform, BatchFormData } from '@/types/batch';

interface BatchFormProps {
  onSubmit: (data: BatchFormData) => void;
  onCancel: () => void;
}

const BatchForm = ({ onSubmit, onCancel }: BatchFormProps) => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [formData, setFormData] = useState<BatchFormData>({
    name: '',
    targetUrl: '',
    description: '',
    initialPrompt: '',
    platform: '',
    waitForIdle: true,
    maxRetries: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    const autoPromptr = new AutoPromptr();
    autoPromptr.getPlatforms()
      .then((platformArray) => {
        // platformArray is now correctly an array
        setPlatforms(platformArray.filter((p: Platform) => p.type === 'web'));
      })
      .catch((err) => {
        console.error('Failed to load platforms:', err);
        toast({
          title: "Warning",
          description: "Failed to load automation platforms. Manual batch creation is still available.",
          variant: "destructive",
        });
      });
  }, [toast]);

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.targetUrl.trim() || !formData.initialPrompt.trim()) {
      toast({
        title: "Missing required fields",
        description: "Name, target URL, and at least one prompt are required.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
    setFormData({
      name: '',
      targetUrl: '',
      description: '',
      initialPrompt: '',
      platform: '',
      waitForIdle: true,
      maxRetries: 0
    });
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle>Create New Batch</CardTitle>
        <CardDescription>Enter batch details, platform, and initial prompt for automation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="batch-name">Batch Name *</Label>
            <Input
              id="batch-name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter batch name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-url">Target URL *</Label>
            <Input
              id="target-url"
              value={formData.targetUrl}
              onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
              placeholder="https://example.com"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Automation Platform</Label>
            <Select 
              value={formData.platform} 
              onValueChange={(value) => setFormData({...formData, platform: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform..." />
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
          <div className="space-y-2">
            <Label htmlFor="wait-for-idle">Wait for Idle State</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="wait-for-idle"
                checked={formData.waitForIdle}
                onCheckedChange={(checked) => setFormData({...formData, waitForIdle: checked})}
              />
              <span className="text-sm text-gray-600">
                {formData.waitForIdle ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="retries">Max Retries</Label>
            <Input
              id="retries"
              type="number"
              value={formData.maxRetries}
              onChange={(e) => setFormData({...formData, maxRetries: parseInt(e.target.value)})}
              min="0"
              max="5"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Brief description of this batch"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="initial-prompt">Initial Text Prompt *</Label>
          <Textarea
            id="initial-prompt"
            value={formData.initialPrompt}
            onChange={(e) => setFormData({...formData, initialPrompt: e.target.value})}
            placeholder="Enter your first prompt for this batch"
            rows={3}
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            Create Batch
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchForm;
