
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SystemStatusOverviewProps {
  systemStatus: {
    lovableSupabase: string;
    supabaseRender: string;
    renderTarget: string;
  };
}

const SystemStatusOverview = ({ systemStatus }: SystemStatusOverviewProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'tested':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'unknown':
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="outline" className="text-green-600 border-green-300">Connected</Badge>;
      case 'tested':
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Tested</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-300">Error</Badge>;
      default:
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Standby</Badge>;
    }
  };

  const statusItems = [
    {
      label: 'Lovable ↔ Supabase',
      status: systemStatus.lovableSupabase
    },
    {
      label: 'Supabase ↔ Render.com',
      status: systemStatus.supabaseRender
    },
    {
      label: 'Render ↔ Target URLs',
      status: systemStatus.renderTarget
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statusItems.map((item, index) => (
        <div key={index} className="bg-white/5 p-3 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-medium">{item.label}</span>
            {getStatusIcon(item.status)}
          </div>
          {getStatusBadge(item.status)}
        </div>
      ))}
    </div>
  );
};

export default SystemStatusOverview;
