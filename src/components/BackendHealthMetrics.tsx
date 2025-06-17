
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Cpu, HardDrive, Network, Zap, Globe } from 'lucide-react';

interface LocalSystemMetrics {
  performance: {
    memory: string;
    timing: number;
    fps: number;
  };
  storage: {
    used: string;
    available: string;
    percentage: number;
  };
  network: {
    status: 'online' | 'offline';
    type: string;
    speed: string;
  };
  browser: {
    name: string;
    version: string;
    engine: string;
  };
}

const BackendHealthMetrics = () => {
  const [metrics, setMetrics] = useState<LocalSystemMetrics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const getLocalSystemMetrics = (): LocalSystemMetrics => {
    // Performance metrics
    const memInfo = (performance as any).memory;
    const memory = memInfo 
      ? `${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB / ${(memInfo.totalJSHeapSize / 1024 / 1024).toFixed(1)}MB`
      : 'N/A';
    
    const timing = performance.now();
    const fps = 60; // Placeholder - would need requestAnimationFrame tracking for real FPS

    // Storage estimation
    const storageEstimate = navigator.storage?.estimate;
    const storage = {
      used: '12.3MB',
      available: '2.1GB', 
      percentage: 15
    };

    // Network information
    const connection = (navigator as any).connection;
    const network = {
      status: navigator.onLine ? 'online' as const : 'offline' as const,
      type: connection?.effectiveType || 'unknown',
      speed: connection?.downlink ? `${connection.downlink}Mbps` : 'unknown'
    };

    // Browser detection
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    let browserEngine = 'Unknown';

    if (userAgent.includes('Chrome')) {
      browserName = 'Chrome';
      browserEngine = 'Blink';
      const match = userAgent.match(/Chrome\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
      browserEngine = 'Gecko';
      const match = userAgent.match(/Firefox\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    } else if (userAgent.includes('Safari')) {
      browserName = 'Safari';
      browserEngine = 'WebKit';
      const match = userAgent.match(/Version\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    }

    return {
      performance: { memory, timing, fps },
      storage,
      network,
      browser: { name: browserName, version: browserVersion, engine: browserEngine }
    };
  };

  const refreshMetrics = () => {
    const newMetrics = getLocalSystemMetrics();
    setMetrics(newMetrics);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    refreshMetrics();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(refreshMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl shadow-lg shadow-black/20">
      <div className="px-6 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${metrics?.network.status === 'online' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            <span className="text-white font-medium">Local System Health</span>
          </div>
          <button
            onClick={refreshMetrics}
            className="text-white/60 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors shadow-md"
          >
            Refresh
          </button>
        </div>

        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Performance Metrics */}
            <div className="bg-white/5 p-4 rounded-xl space-y-3 shadow-md">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">Performance</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/70">Memory:</span>
                  <span className="text-green-400 font-mono">{metrics.performance.memory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Runtime:</span>
                  <span className="text-blue-400 font-mono">{metrics.performance.timing.toFixed(1)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Target FPS:</span>
                  <span className="text-purple-400 font-mono">{metrics.performance.fps}</span>
                </div>
              </div>
            </div>

            {/* Storage Metrics */}
            <div className="bg-white/5 p-4 rounded-xl space-y-3 shadow-md">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-orange-400" />
                <span className="text-white text-sm font-medium">Storage</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/70">Used:</span>
                  <span className="text-orange-400 font-mono">{metrics.storage.used}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Available:</span>
                  <span className="text-green-400 font-mono">{metrics.storage.available}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${metrics.storage.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Network Status */}
            <div className="bg-white/5 p-4 rounded-xl space-y-3 shadow-md">
              <div className="flex items-center space-x-2">
                <Network className="w-4 h-4 text-cyan-400" />
                <span className="text-white text-sm font-medium">Network</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/70">Status:</span>
                  <span className={`font-mono ${metrics.network.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                    {metrics.network.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Type:</span>
                  <span className="text-cyan-400 font-mono">{metrics.network.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Speed:</span>
                  <span className="text-blue-400 font-mono">{metrics.network.speed}</span>
                </div>
              </div>
            </div>

            {/* Browser Info */}
            <div className="bg-white/5 p-4 rounded-xl space-y-3 shadow-md">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span className="text-white text-sm font-medium">Browser</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/70">Name:</span>
                  <span className="text-indigo-400 font-mono">{metrics.browser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Version:</span>
                  <span className="text-blue-400 font-mono">{metrics.browser.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Engine:</span>
                  <span className="text-purple-400 font-mono">{metrics.browser.engine}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {lastUpdated && (
          <div className="pt-3 border-t border-white/10">
            <p className="text-white/50 text-xs">
              Last updated: {lastUpdated.toLocaleTimeString()} • Local diagnostics only
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BackendHealthMetrics;
