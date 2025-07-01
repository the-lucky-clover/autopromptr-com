import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Terminal, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConsoleError {
  id: string;
  timestamp: Date;
  type: 'error' | 'warn' | 'info' | 'log';
  message: string;
  stack?: string;
}

interface ConsoleMonitorModuleProps {
  isCompact?: boolean;
}

const ConsoleMonitorModule = ({ isCompact = false }: ConsoleMonitorModuleProps) => {
  const [errors, setErrors] = useState<ConsoleError[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const { toast } = useToast();

  const addError = useCallback((type: ConsoleError['type'], message: string, stack?: string) => {
    const error: ConsoleError = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type,
      message,
      stack
    };
    
    setErrors(prev => [error, ...prev].slice(0, 100));
  }, []);

  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;
    const originalInfo = console.info;

    console.error = (...args) => {
      originalError.apply(console, args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      addError('error', message, args[0]?.stack);
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      addError('warn', message);
    };

    console.log = (...args) => {
      originalLog.apply(console, args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      addError('log', message);
    };

    console.info = (...args) => {
      originalInfo.apply(console, args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      addError('info', message);
    };

    const handleError = (event: ErrorEvent) => {
      addError('error', `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`, event.error?.stack);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addError('error', `Unhandled Promise Rejection: ${event.reason}`, event.reason?.stack);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
      console.info = originalInfo;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [addError]);

  const copyAllErrors = async () => {
    const filteredErrors = errors.filter(error => filter === 'all' || error.type === filter);
    const allErrorsText = filteredErrors.map(error => 
      `[${error.timestamp.toISOString()}] ${error.type.toUpperCase()}: ${error.message}`
    ).join('\n\n');
    
    try {
      await navigator.clipboard.writeText(allErrorsText);
      toast({
        title: "Console logs copied",
        description: `${filteredErrors.length} entries copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const clearErrors = () => {
    setErrors([]);
    toast({
      title: "Console cleared",
      description: "All console messages have been cleared",
    });
  };

  const getErrorIcon = (type: ConsoleError['type']) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-3 h-3 text-red-400" />;
      case 'warn': return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
      default: return <Info className="w-3 h-3 text-blue-400" />;
    }
  };

  const filteredErrors = errors.filter(error => filter === 'all' || error.type === filter);

  if (isCompact) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-sm">
              <Terminal className="w-4 h-4" />
              Console Monitor
            </CardTitle>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
              {filteredErrors.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex space-x-1">
            {['all', 'error', 'warn', 'info'].map((filterType) => (
              <Button
                key={filterType}
                onClick={() => setFilter(filterType as any)}
                size="sm"
                variant={filter === filterType ? 'default' : 'ghost'}
                className={`text-xs h-5 px-2 ${
                  filter === filterType 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {filterType}
              </Button>
            ))}
          </div>
          <div className="h-16 overflow-hidden">
            {filteredErrors.length === 0 ? (
              <p className="text-white/60 text-xs text-center py-2">No console messages</p>
            ) : (
              <div className="space-y-1">
                {filteredErrors.slice(0, 3).map((error) => (
                  <div key={error.id} className="flex items-center space-x-2 bg-white/5 rounded p-1">
                    {getErrorIcon(error.type)}
                    <span className="text-white text-xs truncate flex-1">{error.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Console Monitor
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              {filteredErrors.length} messages
            </Badge>
            <Button
              size="sm"
              onClick={copyAllErrors}
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button
              size="sm"
              onClick={clearErrors}
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          {['all', 'error', 'warn', 'info'].map((filterType) => (
            <Button
              key={filterType}
              onClick={() => setFilter(filterType as any)}
              size="sm"
              variant={filter === filterType ? 'default' : 'ghost'}
              className={`${
                filter === filterType 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              } rounded-xl capitalize`}
            >
              {filterType}
            </Button>
          ))}
        </div>

        <ScrollArea className="h-48">
          <div className="space-y-2">
            {filteredErrors.length === 0 ? (
              <p className="text-white/60 text-sm text-center py-4">No console messages captured</p>
            ) : (
              filteredErrors.map((error) => (
                <div key={error.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center space-x-2 mb-1">
                    {getErrorIcon(error.type)}
                    <Badge 
                      variant={error.type === 'error' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {error.type.toUpperCase()}
                    </Badge>
                    <span className="text-white/50 text-xs">
                      {error.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-white text-sm font-mono break-words">
                    {error.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ConsoleMonitorModule;
