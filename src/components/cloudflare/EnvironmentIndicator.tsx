
// Visual indicator showing which system is active
import { getActiveConfig, getEnvironment } from '@/services/cloudflare/config';
import { Badge } from '@/components/ui/badge';
import { Cloud, Zap, Wrench } from 'lucide-react';

export const EnvironmentIndicator = () => {
  const config = getActiveConfig();
  const environment = getEnvironment();

  const getIndicatorProps = () => {
    switch (environment) {
      case 'lovable':
        return {
          icon: <Zap className="w-3 h-3" />,
          label: 'Lovable',
          variant: 'default' as const,
          className: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'cloudflare-pages':
        return {
          icon: <Cloud className="w-3 h-3" />,
          label: 'Cloudflare',
          variant: 'secondary' as const,
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'development':
        return {
          icon: <Wrench className="w-3 h-3" />,
          label: 'Dev',
          variant: 'outline' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      default:
        return {
          icon: <Cloud className="w-3 h-3" />,
          label: 'Production',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
    }
  };

  const { icon, label, variant, className } = getIndicatorProps();

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <Badge variant={variant} className={`${className} flex items-center gap-1 px-2 py-1`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </Badge>
      
      {config.useCloudflare && config.useLovable && (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
          Parallel Mode
        </Badge>
      )}
    </div>
  );
};
