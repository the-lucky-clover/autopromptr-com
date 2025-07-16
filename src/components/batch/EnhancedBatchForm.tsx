
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Lightbulb, Settings, Sparkles } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface EnhancedBatchFormProps {
  onSubmit: (batchData: any) => void;
  onCancel: () => void;
}

export const EnhancedBatchForm = ({ onSubmit, onCancel }: EnhancedBatchFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platform: '',
    isNewProject: false,
    projectContext: {
      role: '',
      history: '',
      objectives: '',
      constraints: ''
    }
  });

  const [showProjectContext, setShowProjectContext] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleNewProjectToggle = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isNewProject: checked }));
    setShowProjectContext(checked);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Batch Configuration
          </CardTitle>
          <CardDescription className="text-gray-300">
            Configure your automation batch settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Batch Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter batch name..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this batch will accomplish..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="platform" className="text-white">Target Platform</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select target platform" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="lovable">Lovable.dev</SelectItem>
                <SelectItem value="v0">V0.dev</SelectItem>
                <SelectItem value="cursor">Cursor</SelectItem>
                <SelectItem value="windsurf">Windsurf</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="chatgpt">ChatGPT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Project Intelligence
          </CardTitle>
          <CardDescription className="text-gray-300">
            Help the AI understand your project better for more meaningful prompts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-white">This is a new project</Label>
              <p className="text-sm text-gray-400">
                Enable enhanced context gathering for better AI assistance
              </p>
            </div>
            <Switch
              checked={formData.isNewProject}
              onCheckedChange={handleNewProjectToggle}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>

          <Collapsible open={showProjectContext} onOpenChange={setShowProjectContext}>
            <CollapsibleContent className="space-y-4">
              <Separator className="bg-white/20" />
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <h4 className="text-blue-300 font-medium">Enhanced AI Context</h4>
                </div>
                <p className="text-blue-200 text-sm">
                  Providing context helps the AI generate more relevant, targeted prompts that align 
                  with your project goals and constraints.
                </p>
              </div>

              <div>
                <Label htmlFor="role" className="text-white">Project Role & Expertise</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  projectContext: { ...prev.projectContext, role: value }
                }))}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select your role in this project" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="full-stack-developer">Full Stack Developer</SelectItem>
                    <SelectItem value="frontend-developer">Frontend Developer</SelectItem>
                    <SelectItem value="backend-developer">Backend Developer</SelectItem>
                    <SelectItem value="ui-ux-designer">UI/UX Designer</SelectItem>
                    <SelectItem value="product-manager">Product Manager</SelectItem>
                    <SelectItem value="startup-founder">Startup Founder</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="student">Student/Learning</SelectItem>
                    <SelectItem value="hobbyist">Hobbyist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="history" className="text-white">Project History & Context</Label>
                <Textarea
                  id="history"
                  value={formData.projectContext.history}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    projectContext: { ...prev.projectContext, history: e.target.value }
                  }))}
                  placeholder="Describe the project background, previous work, or relevant context..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="objectives" className="text-white">Primary Objectives</Label>
                <Textarea
                  id="objectives"
                  value={formData.projectContext.objectives}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    projectContext: { ...prev.projectContext, objectives: e.target.value }
                  }))}
                  placeholder="What are you trying to achieve with this project?"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="constraints" className="text-white">Constraints & Requirements</Label>
                <Textarea
                  id="constraints"
                  value={formData.projectContext.constraints}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    projectContext: { ...prev.projectContext, constraints: e.target.value }
                  }))}
                  placeholder="Any technical constraints, deadlines, or specific requirements?"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  rows={2}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-white/20 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Create Batch
        </Button>
      </div>
    </form>
  );
};
