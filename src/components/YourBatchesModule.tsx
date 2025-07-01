
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Database } from "lucide-react";
import DashboardBatchManager from './DashboardBatchManager';

interface YourBatchesModuleProps {
  onStatsUpdate?: (stats: {
    totalBatches: number;
    activeBatches: number;
    completedBatches: number;
    totalPrompts: number;
  }) => void;
  onBatchesUpdate?: (batches: any[]) => void;
  onNewBatchRequest?: () => void;
  refreshTrigger?: number;
}

const YourBatchesModule = ({ 
  onStatsUpdate, 
  onBatchesUpdate, 
  onNewBatchRequest,
  refreshTrigger 
}: YourBatchesModuleProps) => {
  return (
    <Card className="bg-gradient-to-r from-indigo-900/30 via-purple-900/30 to-pink-900/30 backdrop-blur-sm border-white/20 text-white shadow-2xl animate-shimmer hover:shadow-indigo-500/20 transition-all duration-300">
      <CardContent className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
            <Database className="h-6 w-6 text-indigo-400" />
            Your Batches
          </h2>
          <p className="text-indigo-200 text-sm">Manage and monitor your automation batch queue</p>
        </div>

        <div className="space-y-6">
          <DashboardBatchManager 
            onStatsUpdate={onStatsUpdate} 
            onBatchesUpdate={onBatchesUpdate}
            isCompact={false}
            onNewBatchRequest={onNewBatchRequest}
            key={refreshTrigger}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default YourBatchesModule;
