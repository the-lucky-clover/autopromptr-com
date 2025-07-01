
import React, { useState, useCallback, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useDashboardModules } from "@/hooks/useDashboardModules";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import SystemLogsPanel from "@/components/SystemLogsPanel";
import HealthStatusDashboardWrapper from "@/components/HealthStatusDashboardWrapper";
import DashboardSubscription from "@/components/DashboardSubscription";
import DashboardStatsModule from "@/components/DashboardStatsModule";
import AnalyticsModule from "@/components/AnalyticsModule";
import ConsoleMonitorModule from "@/components/ConsoleMonitorModule";
import RecentActivity from "@/components/RecentActivity";
import EnhancedBrandLogo from "@/components/EnhancedBrandLogo";
import VideoBackground from "@/components/VideoBackground";
import OverviewDashboardLayout from "@/components/dashboard/OverviewDashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import ErrorBoundary from "@/components/ErrorBoundary";
import { getRandomGreeting } from "@/services/greetingService";

const Dashboard = () => {
  const { user } = useAuth();
  const { visibleModules, updateModuleState, reorderModules } = useDashboardModules();
  
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    completedBatches: 0,
    totalPrompts: 0
  });
  
  const [batches, setBatches] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentGreeting, setCurrentGreeting] = useState<any>(null);
  const [videoSettings, setVideoSettings] = useState({
    enabled: true,
    videoUrl: 'https://videos.pexels.com/video-files/3130284/3130284-uhd_2560_1440_25fps.mp4',
    showAttribution: true,
    opacity: 85,
    blendMode: 'multiply'
  });

  // Load user profile and video settings
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
          const greeting = getRandomGreeting(
            profile.name || user.email?.split('@')[0] || 'there',
            (profile as any).preferred_language || 'en'
          );
          setCurrentGreeting(greeting);
          
          // Load video settings from profile - safely access new columns
          const videoProfile = profile as any;
          setVideoSettings(prev => ({
            ...prev,
            enabled: videoProfile.video_background_enabled ?? true,
            opacity: videoProfile.video_background_opacity || 85,
            blendMode: videoProfile.video_background_blend_mode || 'multiply'
          }));
        }
      }
    };

    loadUserData();
  }, [user]);

  // Rotate greeting every 30 seconds
  useEffect(() => {
    if (!userProfile) return;
    
    const interval = setInterval(() => {
      const greeting = getRandomGreeting(
        userProfile.name || user?.email?.split('@')[0] || 'there',
        (userProfile as any).preferred_language || 'en'
      );
      setCurrentGreeting(greeting);
    }, 30000);

    return () => clearInterval(interval);
  }, [userProfile, user]);

  const handleStatsUpdate = useCallback((newStats: typeof stats) => {
    setStats(newStats);
  }, []);

  const handleBatchesUpdate = useCallback((newBatches: any[]) => {
    setBatches(newBatches);
  }, []);

  const hasActiveBatch = batches.some(batch => batch.status === 'running');

  // Filter out batch manager and extractor modules for overview
  const overviewModules = visibleModules.filter(module => 
    module.id !== 'batch-processor' && 
    module.id !== 'batch-extractor'
  );

  const renderModuleContent = (moduleId: string, componentName: string) => {
    try {
      switch (componentName) {
        case 'HealthStatusDashboard':
          return <HealthStatusDashboardWrapper isCompact={false} />;
        
        case 'SystemLogsPanel':
          return <SystemLogsPanel batches={batches} hasActiveBatch={hasActiveBatch} isCompact={false} />;
        
        case 'DashboardSubscription':
          return <DashboardSubscription isCompact={false} />;
        
        case 'DashboardStatsModule':
          return <DashboardStatsModule stats={stats} isCompact={false} />;

        case 'AnalyticsModule':
          return <AnalyticsModule isCompact={false} />;

        case 'ConsoleMonitorModule':
          return <ConsoleMonitorModule isCompact={false} />;
        
        default:
          return <div>Module content not found</div>;
      }
    } catch (error) {
      console.error(`Error rendering module ${moduleId}:`, error);
      return <div className="text-red-400">Error loading module</div>;
    }
  };

  return (
    <div className="min-h-screen relative">
      <VideoBackground
        enabled={videoSettings.enabled}
        videoUrl={videoSettings.videoUrl}
        showAttribution={videoSettings.showAttribution}
        opacity={videoSettings.opacity}
        blendMode={videoSettings.blendMode}
      />
      
      <div 
        className="min-h-screen relative z-10"
        style={{ 
          background: videoSettings.enabled 
            ? 'transparent' 
            : 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' 
        }}
      >
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <SidebarInset className="flex-1 relative">
              <ErrorBoundary>
                <DashboardHeader />
              </ErrorBoundary>
              
              <ErrorBoundary>
                <Card className={`m-6 mb-4 ${
                  videoSettings.enabled 
                    ? 'bg-black/40 backdrop-blur-md border-white/30' 
                    : 'bg-white/10 backdrop-blur-sm border-white/20'
                } rounded-xl relative overflow-hidden`}>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      <div className="lg:col-span-8">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <EnhancedBrandLogo 
                              size="large" 
                              variant="horizontal" 
                              id="dashboard-welcome"
                              showHoverAnimation={false}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            {currentGreeting && (
                              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                                {currentGreeting.text}
                              </h1>
                            )}
                            <p className="text-purple-200 text-lg">
                              Your intelligent automation dashboard - streamline workflows, maximize efficiency, generate revenue
                            </p>
                            {currentGreeting && currentGreeting.language !== 'en' && (
                              <p className="text-purple-300 text-sm font-medium">
                                🌍 {currentGreeting.languageName}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="lg:col-span-4 flex justify-end">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                          <div className="text-center space-y-3">
                            <div className="text-3xl">🚀</div>
                            <div className="text-white font-semibold">Ready to Automate</div>
                            <div className="text-purple-200 text-sm">
                              {stats.totalBatches} batches • {stats.activeBatches} active
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ErrorBoundary>

              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8">
                    <ErrorBoundary>
                      <OverviewDashboardLayout
                        visibleModules={overviewModules}
                        reorderModules={reorderModules}
                        renderModuleContent={renderModuleContent}
                      />
                    </ErrorBoundary>
                  </div>

                  <div className="lg:col-span-4">
                    <ErrorBoundary>
                      <RecentActivity />
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default Dashboard;
