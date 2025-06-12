
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RotateCcw } from 'lucide-react';
import { DashboardModule } from '@/hooks/useDashboardModules';

interface ModuleRestorePanelProps {
  closedModules: DashboardModule[];
  onRestoreModule: (moduleId: string) => void;
  onResetLayout: () => void;
}

const ModuleRestorePanel = ({
  closedModules,
  onRestoreModule,
  onResetLayout
}: ModuleRestorePanelProps) => {
  if (closedModules.length === 0) return null;

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center space-x-2">
          <Plus className="w-5 h-5 text-green-400" />
          <span>Add Modules</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {closedModules.map((module) => (
            <Button
              key={module.id}
              onClick={() => onRestoreModule(module.id)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-lg h-auto p-3 flex flex-col items-center space-y-1"
              variant="outline"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs text-center">{module.title}</span>
            </Button>
          ))}
        </div>
        
        <div className="pt-2 border-t border-white/10">
          <Button
            onClick={onResetLayout}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Layout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleRestorePanel;
