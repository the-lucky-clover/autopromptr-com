
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Plus } from "lucide-react";
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
    <Card className="bg-gradient-to-r from-indigo-900/30 via-purple-900/30 to-pink-900/30 backdrop-blur-sm border-white/20 text-white shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300">
      <CardContent className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Database className="h-7 w-7 text-indigo-400" />
              Your Batches
            </h2>
            <p className="text-indigo-200/80 text-base font-medium">
              Manage and monitor your automation batch queue
            </p>
          </div>
          
          {/* New Batch Button - Enhanced styling */}
          <Button
            onClick={onNewBatchRequest}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-8 py-4 font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-3" />
            New Batch
          </Button>
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
