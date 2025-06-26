
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Terminal, AlertTriangle, Info, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConsoleError {
  id: string;
  timestamp: Date;
  type: 'error' | 'warn' | 'info' | 'log';
  message: string;
  stack?: string;
  source?: string;
}

interface ConsoleErrorDisplayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsoleErrorDisplay = ({ isOpen, onClose }: ConsoleErrorDisplayProps) => {
  const [errors, setErrors] = useState<ConsoleError[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const { toast } = useToast();

  const addError = useCallback((type: ConsoleError['type'], message: string, stack?: string) => {
    const error: ConsoleError = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type,
      message,
      stack,
      source: window.location.href
    };
    
    setErrors(prev => [error, ...prev].slice(0, 100)); // Keep only last 100 errors
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;
    const originalInfo = console.info;

    // Override console methods
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

    // Capture unhandled errors
    const handleError = (event: ErrorEvent) => {
      addError('error', `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`, event.error?.stack);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addError('error', `Unhandled Promise Rejection: ${event.reason}`, event.reason?.stack);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
      console.info = originalInfo;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isOpen, addError]);

  const copyToClipboard = async (error: ConsoleError) => {
    const errorText = `[${error.timestamp.toISOString()}] ${error.type.toUpperCase()}: ${error.message}${error.stack ? '\n' + error.stack : ''}`;
    
    try {
      await navigator.clipboard.writeText(errorText);
      toast({
        title: "Copied to clipboard",
        description: "Error message copied successfully",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const copyAllErrors = async () => {
    const filteredErrors = errors.filter(error => filter === 'all' || error.type === filter);
    const allErrorsText = filteredErrors.map(error => 
      `[${error.timestamp.toISOString()}] ${error.type.toUpperCase()}: ${error.message}${error.stack ? '\n' + error.stack : ''}`
    ).join('\n\n');
    
    try {
      await navigator.clipboard.writeText(allErrorsText);
      toast({
        title: "All errors copied",
        description: `${filteredErrors.length} errors copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy all errors to clipboard",
        variant: "destructive"
      });
    }
  };

  const clearErrors = () => {
    setErrors([]);
    toast({
      title: "Console cleared",
      description: "All error messages have been cleared",
    });
  };

  const getErrorIcon = (type: ConsoleError['type']) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getErrorBadgeVariant = (type: ConsoleError['type']) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warn': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredErrors = errors.filter(error => filter === 'all' || error.type === filter);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] bg-gray-900/95 backdrop-blur-xl border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-green-400" />
              <CardTitle className="text-white">Console Monitor</CardTitle>
              <Badge variant="secondary">{filteredErrors.length} messages</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm"
              >
                <option value="all">All</option>
                <option value="error">Errors</option>
                <option value="warn">Warnings</option>
                <option value="info">Info</option>
              </select>
              <Button size="sm" onClick={copyAllErrors} variant="outline" className="text-white border-gray-600">
                <Copy className="w-4 h-4 mr-1" />
                Copy All
              </Button>
              <Button size="sm" onClick={clearErrors} variant="outline" className="text-white border-gray-600">
                Clear
              </Button>
              <Button size="sm" onClick={onClose} variant="ghost" className="text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(80vh-120px)] px-6 pb-6">
            <div className="space-y-3">
              {filteredErrors.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No console messages captured yet
                </div>
              ) : (
                filteredErrors.map((error) => (
                  <div key={error.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getErrorIcon(error.type)}
                        <Badge variant={getErrorBadgeVariant(error.type)}>
                          {error.type.toUpperCase()}
                        </Badge>
                        <span className="text-gray-400 text-xs font-mono">
                          {error.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(error)}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <pre className="text-sm text-white whitespace-pre-wrap break-words font-mono bg-gray-900/50 rounded p-2 overflow-x-auto">
                      {error.message}
                    </pre>
                    {error.stack && (
                      <details className="mt-2">
                        <summary className="text-gray-400 text-xs cursor-pointer hover:text-white">
                          Stack trace
                        </summary>
                        <pre className="text-xs text-gray-300 mt-1 font-mono bg-gray-900/50 rounded p-2 overflow-x-auto">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
