
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ModuleLayout {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

const DEFAULT_LAYOUT: ModuleLayout[] = [
  { id: 'batch-processor', title: 'Batch Processor', visible: true, order: 0 },
  { id: 'system-logs', title: 'System Logs', visible: true, order: 1 },
  { id: 'backend-health', title: 'System Status', visible: true, order: 2 },
  { id: 'quick-actions', title: 'Quick Actions', visible: true, order: 3 },
  { id: 'subscription', title: 'Subscription', visible: true, order: 4 },
  { id: 'stats-cards', title: 'Statistics', visible: true, order: 5 },
];

const STORAGE_KEY = 'dashboard-overview-layout';

export const OverviewLayoutCard = () => {
  const [layout, setLayout] = useState<ModuleLayout[]>(DEFAULT_LAYOUT);
  const { toast } = useToast();

  // Load layout from localStorage on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem(STORAGE_KEY);
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        setLayout(parsedLayout);
      } catch (error) {
        console.error('Failed to parse saved overview layout:', error);
      }
    }
  }, []);

  // Save layout to localStorage whenever it changes
  const updateLayout = (newLayout: ModuleLayout[]) => {
    setLayout(newLayout);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
    toast({
      title: "Overview Layout Updated",
      description: "Your dashboard overview layout preferences have been saved.",
    });
  };

  const handleModuleToggle = (moduleId: string) => {
    const newLayout = layout.map(item =>
      item.id === moduleId ? { ...item, visible: !item.visible } : item
    );
    updateLayout(newLayout);
  };

  const moveModule = (moduleId: string, direction: 'up' | 'down') => {
    const currentIndex = layout.findIndex(m => m.id === moduleId);
    if (direction === 'up' && currentIndex > 0) {
      const newLayout = [...layout];
      [newLayout[currentIndex], newLayout[currentIndex - 1]] = [newLayout[currentIndex - 1], newLayout[currentIndex]];
      // Update order values
      newLayout.forEach((item, index) => {
        item.order = index;
      });
      updateLayout(newLayout);
    } else if (direction === 'down' && currentIndex < layout.length - 1) {
      const newLayout = [...layout];
      [newLayout[currentIndex], newLayout[currentIndex + 1]] = [newLayout[currentIndex + 1], newLayout[currentIndex]];
      // Update order values
      newLayout.forEach((item, index) => {
        item.order = index;
      });
      updateLayout(newLayout);
    }
  };

  const resetToDefault = () => {
    updateLayout(DEFAULT_LAYOUT);
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: "Overview Layout Reset",
      description: "Dashboard overview layout has been reset to default settings.",
    });
  };

  const visibleModules = layout.filter(m => m.visible);
  const hiddenModules = layout.filter(m => !m.visible);

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader>
        <CardTitle className="text-white">Overview Layout</CardTitle>
        <CardDescription className="text-purple-200">
          Control which modules are visible and their order on your dashboard overview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Modules */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Active Modules</h3>
          <div className="space-y-3">
            {visibleModules.map((module, index) => (
              <div key={module.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-3">
                  <span className="text-white font-medium">{module.title}</span>
                  <span className="text-white/60 text-sm">#{index + 1}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => moveModule(module.id, 'up')}
                    disabled={index === 0}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => moveModule(module.id, 'down')}
                    disabled={index === visibleModules.length - 1}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Switch
                    checked={module.visible}
                    onCheckedChange={() => handleModuleToggle(module.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Modules */}
        {hiddenModules.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Hidden Modules</h3>
            <div className="space-y-3">
              {hiddenModules.map((module) => (
                <div key={module.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 opacity-60">
                  <span className="text-white font-medium">{module.title}</span>
                  <Switch
                    checked={module.visible}
                    onCheckedChange={() => handleModuleToggle(module.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <Button
            onClick={resetToDefault}
            variant="outline"
            className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default Layout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
