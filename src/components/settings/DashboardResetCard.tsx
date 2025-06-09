
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RotateCcw, Monitor, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DashboardResetCard = () => {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleResetDashboard = async () => {
    setIsResetting(true);
    
    try {
      // Clear dashboard layout from localStorage
      localStorage.removeItem('dashboard-layout');
      localStorage.removeItem('dashboard-modules');
      localStorage.removeItem('window-states');
      
      // Trigger a page reload to reset everything
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      toast({
        title: "Dashboard Reset",
        description: "Dashboard layout has been reset to default configuration. Page will reload momentarily.",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset dashboard layout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Monitor className="w-5 h-5 text-purple-400" />
          <CardTitle className="text-white">Dashboard Reset</CardTitle>
        </div>
        <CardDescription className="text-purple-200">
          Reset dashboard to default layout and window configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/5 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Settings className="w-4 h-4 text-purple-300" />
            <span className="text-white font-medium text-sm">Reset Options</span>
          </div>
          <ul className="text-xs text-purple-200 space-y-1 ml-6">
            <li>• Restore default module layout</li>
            <li>• Reset all window positions and sizes</li>
            <li>• Clear minimized/maximized states</li>
            <li>• Reopen all closed modules</li>
            <li>• Reset taskbar configuration</li>
          </ul>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30 rounded-xl"
              disabled={isResetting}
            >
              <RotateCcw className={`w-4 h-4 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
              {isResetting ? 'Resetting...' : 'Reset Dashboard'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700 rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Reset Dashboard Layout?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                This will reset your dashboard to the default configuration and reload the page. 
                All customized layouts, window positions, and module states will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-white border-white/20 hover:bg-white/10 rounded-xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleResetDashboard}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                Reset Dashboard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default DashboardResetCard;
