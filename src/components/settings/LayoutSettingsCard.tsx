
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ModuleSettings {
  'batch-processor': boolean;
  'backend-health': boolean;
  'system-logs': boolean;
  'quick-actions': boolean;
  'subscription': boolean;
  'stats-cards': boolean;
}

const DEFAULT_SETTINGS: ModuleSettings = {
  'batch-processor': true,
  'backend-health': true,
  'system-logs': true,
  'quick-actions': true,
  'subscription': true,
  'stats-cards': true,
};

const STORAGE_KEY = 'dashboard-module-settings';

export const LayoutSettingsCard = () => {
  const [moduleSettings, setModuleSettings] = useState<ModuleSettings>(DEFAULT_SETTINGS);
  const { toast } = useToast();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setModuleSettings(parsedSettings);
      } catch (error) {
        console.error('Failed to parse saved module settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  const updateSettings = (newSettings: ModuleSettings) => {
    setModuleSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    toast({
      title: "Layout Updated",
      description: "Your dashboard layout preferences have been saved.",
    });
  };

  const handleModuleToggle = (moduleId: keyof ModuleSettings) => {
    const newSettings = {
      ...moduleSettings,
      [moduleId]: !moduleSettings[moduleId]
    };
    updateSettings(newSettings);
  };

  const resetToDefault = () => {
    updateSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: "Layout Reset",
      description: "Dashboard layout has been reset to default settings.",
    });
  };

  const moduleLabels = {
    'batch-processor': 'Batch Processor',
    'backend-health': 'Backend Health',
    'system-logs': 'System Logs',
    'quick-actions': 'Quick Actions',
    'subscription': 'Subscription',
    'stats-cards': 'Statistics'
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader>
        <CardTitle className="text-white">Dashboard Layout</CardTitle>
        <CardDescription className="text-purple-200">
          Control which modules are visible on your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {Object.entries(moduleLabels).map(([moduleId, label]) => (
            <div key={moduleId} className="flex items-center justify-between">
              <Label htmlFor={moduleId} className="text-white">
                {label}
              </Label>
              <Switch
                id={moduleId}
                checked={moduleSettings[moduleId as keyof ModuleSettings]}
                onCheckedChange={() => handleModuleToggle(moduleId as keyof ModuleSettings)}
              />
            </div>
          ))}
        </div>

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
