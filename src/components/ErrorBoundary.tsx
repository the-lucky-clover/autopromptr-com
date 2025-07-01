
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log specific error types for debugging
    if (error.message.includes('Invalid hook call')) {
      console.error('React Hook Error - likely caused by duplicate React contexts or hook usage outside component');
    }
    
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    // Clear error state
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: newRetryCount
    });

    // If this is a hook-related error, force a full page reload to reset React context
    if (this.state.error?.message?.includes('Invalid hook call') || newRetryCount >= 2) {
      console.log('Performing full page reload to reset React context');
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isHookError = this.state.error?.message?.includes('Invalid hook call');
      const errorMessage = isHookError 
        ? 'A React context error occurred. This usually happens when there are duplicate providers or hooks are used incorrectly.'
        : 'Something went wrong. The application encountered an unexpected error.';

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
          <div className="max-w-md w-full">
            <Alert className="border-red-500/50 bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-100 mt-2">
                <div className="space-y-4">
                  <p>{errorMessage}</p>
                  {this.state.retryCount > 0 && (
                    <p className="text-sm text-red-300">
                      Retry attempt {this.state.retryCount}. If this continues, the page will reload automatically.
                    </p>
                  )}
                  <Button 
                    onClick={this.handleReset}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {this.state.retryCount >= 1 ? 'Reload Page' : 'Try Again'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
