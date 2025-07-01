
import React, { useState } from 'react';
import { AutoPromtrError } from '@/services/autoPromptr/errors';
import BackendErrorHandler from './BackendErrorHandler';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BatchErrorDisplayProps {
  error: AutoPromtrError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const BatchErrorDisplay = ({ error, onRetry, onDismiss }: BatchErrorDisplayProps) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!error) return null;

  return (
    <div className="space-y-4">
      <BackendErrorHandler
        error={error}
        onRetry={onRetry}
        onDismiss={onDismiss}
        showTechnicalDetails={showTechnicalDetails}
      />
      
      {error.technicalDetails && (
        <Card className="border-gray-200 bg-gray-50 dark:bg-gray-800/50">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full justify-between"
            >
              <span className="text-sm font-medium">Technical Details</span>
              {showTechnicalDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BatchErrorDisplay;
