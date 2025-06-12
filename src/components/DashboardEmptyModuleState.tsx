
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Layout } from 'lucide-react';

interface DashboardEmptyModuleStateProps {
  onResetLayout: () => void;
}

const DashboardEmptyModuleState = ({ onResetLayout }: DashboardEmptyModuleStateProps) => {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardContent className="p-12 text-center space-y-6">
        <div className="space-y-4">
          <Layout className="w-16 h-16 text-purple-400 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-white text-xl font-semibold">No Modules Active</h3>
            <p className="text-purple-200 text-sm max-w-md mx-auto">
              All dashboard modules have been closed. Restore the default layout or use the sidebar navigation to access your tools.
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={onResetLayout}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-3"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Restore All Modules
          </Button>
          <p className="text-purple-300 text-xs">
            Or use the Settings → Layout menu in the sidebar to customize your dashboard
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardEmptyModuleState;
