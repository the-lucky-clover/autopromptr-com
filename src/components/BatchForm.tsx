
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="rounded-t-2xl">
          <CardTitle className="text-white">Create New Batch</CardTitle>
          <CardDescription className="text-white/70">Enter batch details, platform, and initial prompt for automation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch-name" className="text-white">Batch Name *</Label>
              <Input
                id="batch-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter batch name"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-url" className="text-white">Target URL *</Label>
              <Input
                id="target-url"
                value={formData.targetUrl}
                onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
                placeholder="https://example.com"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-white">Automation Platform</Label>
              <Select 
                value={formData.platform} 
                onValueChange={(value) => setFormData({...formData, platform: value})}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                  <SelectValue placeholder="Select platform..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800/90 backdrop-blur-sm border-gray-700 rounded-xl">
                  {platforms.map(platform => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wait-for-idle" className="text-white">Wait for Idle State</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="wait-for-idle"
                  checked={formData.waitForIdle}
                  onCheckedChange={(checked) => setFormData({...formData, waitForIdle: checked})}
                />
                <span className="text-sm text-white/70">
                  {formData.waitForIdle ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="retries" className="text-white">Max Retries</Label>
              <Input
                id="retries"
                type="number"
                value={formData.maxRetries}
                onChange={(e) => setFormData({...formData, maxRetries: parseInt(e.target.value)})}
                min="0"
                max="5"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description (Optional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of this batch"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="initial-prompt" className="text-white">Initial Text Prompt *</Label>
            <Textarea
              id="initial-prompt"
              value={formData.initialPrompt}
              onChange={(e) => setFormData({...formData, initialPrompt: e.target.value})}
              placeholder="Enter your first prompt for this batch"
              rows={3}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl resize-none"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 rounded-xl">
              Create Batch
            </Button>
            <Button variant="outline" onClick={onCancel} className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchForm;
