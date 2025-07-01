
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, ExternalLink, Info, Wrench, CheckCircle } from 'lucide-react';
import { AutoPromtrError } from '@/services/autoPromptr/errors';

interface BackendErrorHandlerProps {
  error: AutoPromtrError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showTechnicalDetails?: boolean;
}

const BackendErrorHandler = ({ 
  error, 
  onRetry, 
  onDismiss, 
  showTechnicalDetails = false 
}: BackendErrorHandlerProps) => {
  const getErrorIcon = () => {
    switch (error.code) {
      case 'CHROME_NOT_FOUND':
        return <Wrench className="h-5 w-5 text-orange-500" />;
      case 'BROWSER_SERVICE_UNAVAILABLE':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'CONNECTION_REFUSED':
      case 'NETWORK_ERROR':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getErrorSeverity = () => {
    switch (error.code) {
      case 'CHROME_NOT_FOUND':
        return 'critical';
      case 'BROWSER_SERVICE_UNAVAILABLE':
      case 'CONNECTION_REFUSED':
        return 'high';
      case 'REQUEST_TIMEOUT':
      case 'RATE_LIMIT_EXCEEDED':
        return 'medium';
      default:
        return 'low';
    }
  };

  const getSeverityColor = () => {
    const severity = getErrorSeverity();
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRecommendedActions = () => {
    switch (error.code) {
      case 'CHROME_NOT_FOUND':
        return [
          'The backend needs Chrome browser installed',
          'This requires updating the deployment configuration',
          'Contact the system administrator for assistance'
        ];
      case 'BROWSER_SERVICE_UNAVAILABLE':
        return [
          'The browser automation service is temporarily down',
          'Try again in a few minutes',
          'If the issue persists, contact support'
        ];
      case 'CONNECTION_REFUSED':
      case 'NETWORK_ERROR':
        return [
          'Check your internet connection',
          'The backend service may be restarting',
          'Try again in a moment'
        ];
      case 'REQUEST_TIMEOUT':
        return [
          'The request took too long to complete',
          'Try with a smaller batch size',
          'Check if the target website is responsive'
        ];
      case 'RATE_LIMIT_EXCEEDED':
        return [
          'Too many requests sent recently',
          'Wait a few minutes before trying again',
          'Consider spreading out your automation requests'
        ];
      default:
        return [
          'An unexpected error occurred',
          'Try refreshing the page',
          'Contact support if the issue persists'
        ];
    }
  };

  return (
    <Card className="border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
          {getErrorIcon()}
          Backend Error Detected
          <Badge variant="outline" className={`${getSeverityColor()} text-white`}>
            {getErrorSeverity().toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-gray-700 dark:text-gray-300">
            <strong>User Message:</strong> {error.userMessage}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Recommended Actions:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {getRecommendedActions().map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        </div>

        {showTechnicalDetails && error.technicalDetails && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Technical Details:</h4>
            <code className="text-xs text-gray-600 dark:text-gray-400 break-all">
              {error.technicalDetails}
            </code>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            {error.retryable && onRetry && (
              <Button
                onClick={onRetry}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {error.code === 'CHROME_NOT_FOUND' && (
              <Button
                onClick={() => window.open('https://github.com/the-lucky-clover/autopromptr-backend', '_blank')}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Backend Config
              </Button>
            )}
          </div>
          
          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </Button>
          )}
        </div>

        {error.code === 'CHROME_NOT_FOUND' && (
          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                  Quick Fix for Developers:
                </p>
                <p className="text-orange-700 dark:text-orange-300 mb-2">
                  Add this to your backend's Dockerfile:
                </p>
                <code className="block p-2 bg-orange-100 dark:bg-orange-900/40 rounded text-xs">
                  RUN npx puppeteer browsers install chrome
                </code>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BackendErrorHandler;
