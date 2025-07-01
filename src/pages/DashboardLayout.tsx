
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import { useDashboardModules } from "@/hooks/useDashboardModules";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ErrorBoundary from "@/components/ErrorBoundary";

const DashboardLayout = () => {
  const { 
    visibleModules, 
    closedModules,
    updateModuleState,
    reorderModules,
    resetToDefaults,
    restoreModule
  } = useDashboardModules();

  const moveModule = (moduleId: string, direction: 'up' | 'down') => {
    const currentIndex = visibleModules.findIndex(m => m.id === moduleId);
    if (direction === 'up' && currentIndex > 0) {
      const targetModule = visibleModules[currentIndex - 1];
      reorderModules(moduleId, targetModule.id);
    } else if (direction === 'down' && currentIndex < visibleModules.length - 1) {
      const targetModule = visibleModules[currentIndex + 1];
      reorderModules(moduleId, targetModule.id);
    }
  };

  return (
    <div className="min-h-screen relative bg-gray-50">
      <div 
        className="min-h-screen relative z-10"
        style={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)' 
        }}
      >
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <SidebarInset className="flex-1 relative">
              <ErrorBoundary>
                <DashboardHeader />
              </ErrorBoundary>
              
              <div className="p-6">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      Dashboard Layout Customization
                      <Button
                        onClick={resetToDefaults}
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset to Default
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Active Modules */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Active Modules</h3>
                      <div className="space-y-3">
                        {visibleModules.map((module, index) => (
                          <div key={module.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center space-x-3">
                              <span className="text-white font-medium">{module.title}</span>
                              <span className="text-white/60 text-sm">#{index + 1}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => moveModule(module.id, 'up')}
                                disabled={index === 0}
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20 disabled:opacity-50"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => moveModule(module.id, 'down')}
                                disabled={index === visibleModules.length - 1}
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20 disabled:opacity-50"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => updateModuleState(module.id, 'closed')}
                                variant="outline"
                                size="sm"
                                className="bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/30"
                              >
                                Hide
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hidden Modules */}
                    {closedModules.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Hidden Modules</h3>
                        <div className="space-y-3">
                          {closedModules.map((module) => (
                            <div key={module.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 opacity-60">
                              <span className="text-white font-medium">{module.title}</span>
                              <Button
                                onClick={() => restoreModule(module.id)}
                                variant="outline"
                                size="sm"
                                className="bg-green-500/20 border-green-400/30 text-green-300 hover:bg-green-500/30"
                              >
                                Show
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default DashboardLayout;
