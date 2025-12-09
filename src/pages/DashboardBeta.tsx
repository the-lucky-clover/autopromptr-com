import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDashboardGreeting } from '@/hooks/useDashboardGreeting';
import { 
  Home, Zap, FileText, BarChart3, Camera, Settings, 
  Menu, X, ChevronRight, Activity, Clock, TrendingUp,
  PlayCircle, Pause, Plus, Search, Bell, User, LogOut,
  Layers, Target, Sparkles, ArrowUpRight
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ErrorBoundary from '@/components/ErrorBoundary';
import ZapBrandLogo from '@/components/ZapBrandLogo';

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD BETA - MOBILE-PORTRAIT-FIRST UNIFIED EXPERIENCE
// Inspired by TBWA\Chiat\Day LA design principles:
// - Bold typography hierarchy
// - Generous white space (inverted for dark mode)
// - Clear visual hierarchy
// - Intuitive touch targets (min 44px)
// - Progressive disclosure
// ═══════════════════════════════════════════════════════════════════════════════

// Navigation items with proper touch target sizing
const navigationItems = [
  { id: 'overview', title: 'Overview', icon: Home, color: 'from-emerald-500 to-teal-500' },
  { id: 'automation', title: 'Automation', icon: Zap, color: 'from-amber-500 to-orange-500' },
  { id: 'extractor', title: 'Extractor', icon: FileText, color: 'from-cyan-500 to-blue-500' },
  { id: 'results', title: 'Results', icon: BarChart3, color: 'from-purple-500 to-pink-500' },
  { id: 'screenshots', title: 'Shots', icon: Camera, color: 'from-rose-500 to-red-500' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Bottom Navigation Component
// ─────────────────────────────────────────────────────────────────────────────
const MobileBottomNav = ({ 
  activeSection, 
  onSectionChange 
}: { 
  activeSection: string; 
  onSectionChange: (section: string) => void;
}) => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 safe-area-pb">
    <div className="flex justify-around items-center h-16 px-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`
              flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-2 px-3
              transition-all duration-300 rounded-xl
              ${isActive 
                ? `bg-gradient-to-t ${item.color} text-white shadow-lg shadow-black/20` 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
            `}
            aria-label={item.title}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
            <span className={`text-[10px] mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {item.title}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Header Component
// ─────────────────────────────────────────────────────────────────────────────
const MobileHeader = ({ 
  onMenuOpen, 
  userName 
}: { 
  onMenuOpen: () => void; 
  userName: string;
}) => (
  <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 safe-area-pt">
    <div className="flex items-center justify-between h-14 px-4">
      <ZapBrandLogo size="small" variant="icon-only" />
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-10 h-10 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
        >
          <Bell className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuOpen}
          className="w-10 h-10 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </div>
  </header>
);

// ─────────────────────────────────────────────────────────────────────────────
// Desktop Sidebar Component
// ─────────────────────────────────────────────────────────────────────────────
const DesktopSidebar = ({ 
  activeSection, 
  onSectionChange,
  onSignOut 
}: { 
  activeSection: string; 
  onSectionChange: (section: string) => void;
  onSignOut: () => void;
}) => (
  <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 lg:w-64 bg-gray-900/50 backdrop-blur-xl border-r border-white/10 flex-col z-40">
    {/* Logo */}
    <div className="h-16 flex items-center justify-center lg:justify-start px-4 border-b border-white/10">
      <div className="lg:hidden">
        <ZapBrandLogo size="small" variant="icon-only" />
      </div>
      <div className="hidden lg:block">
        <ZapBrandLogo size="small" variant="horizontal" />
      </div>
    </div>
    
    {/* Navigation */}
    <nav className="flex-1 py-4 px-3 overflow-y-auto">
      <div className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl
                transition-all duration-300 group
                ${isActive 
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110'} transition-transform`} />
              <span className="hidden lg:block font-medium truncate">{item.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
    
    {/* Footer Actions */}
    <div className="p-3 border-t border-white/10 space-y-1">
      <Link to="/settings">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
        >
          <Settings className="w-5 h-5" />
          <span className="hidden lg:block ml-3">Settings</span>
        </Button>
      </Link>
      <Button 
        variant="ghost" 
        onClick={onSignOut}
        className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-red-500/10"
      >
        <LogOut className="w-5 h-5" />
        <span className="hidden lg:block ml-3">Sign Out</span>
      </Button>
    </div>
  </aside>
);

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card Component (Mobile-First) - Enhanced Glassmorphism
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  color = 'from-purple-500 to-blue-500',
  animate = true
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  color?: string;
  animate?: boolean;
}) => (
  <Card className="
    bg-gradient-to-br from-white/[0.08] to-white/[0.02] 
    backdrop-blur-xl border-white/10 overflow-hidden group 
    hover:bg-white/[0.12] hover:border-white/20
    transition-all duration-500 ease-out
    hover:shadow-lg hover:shadow-purple-500/10
    hover:scale-[1.02] active:scale-[0.98]
    cursor-default
  ">
    <CardContent className="p-4 relative">
      {/* Subtle gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500`} />
      
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={`
          p-2.5 rounded-xl bg-gradient-to-br ${color} 
          shadow-lg shadow-black/20
          group-hover:shadow-xl group-hover:scale-110
          transition-all duration-300
        `}>
          <Icon className="w-5 h-5 text-white drop-shadow-sm" />
        </div>
        {trend && (
          <Badge 
            variant="secondary" 
            className={`
              text-xs font-semibold backdrop-blur-sm
              ${trend.positive 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }
            `}
          >
            <TrendingUp className={`w-3 h-3 mr-1 ${!trend.positive && 'rotate-180'}`} />
            {trend.positive ? '+' : ''}{trend.value}%
          </Badge>
        )}
      </div>
      <div className="space-y-1 relative z-10">
        <h3 className={`
          text-2xl md:text-3xl font-bold text-white tracking-tight
          ${animate ? 'animate-pulse-subtle' : ''}
        `}>
          {value}
        </h3>
        <p className="text-sm text-gray-400 font-medium group-hover:text-gray-300 transition-colors">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{subtitle}</p>}
      </div>
    </CardContent>
  </Card>
);

// ─────────────────────────────────────────────────────────────────────────────
// Quick Action Button Component - Enhanced with Micro-interactions
// ─────────────────────────────────────────────────────────────────────────────
const QuickActionButton = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  color,
  onClick 
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
}) => (
  <button 
    onClick={onClick}
    className={`
      w-full p-4 rounded-2xl bg-gradient-to-br ${color} 
      text-left transition-all duration-300 
      hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/30
      active:scale-[0.97] active:shadow-lg
      min-h-[100px] flex flex-col justify-between
      relative overflow-hidden group
      border border-white/10 hover:border-white/20
    `}
  >
    {/* Animated shine effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    
    <Icon className="w-8 h-8 text-white/90 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" />
    <div className="relative z-10">
      <h4 className="text-white font-semibold text-lg group-hover:text-white/100 transition-colors">{title}</h4>
      <p className="text-white/70 text-sm group-hover:text-white/80 transition-colors">{subtitle}</p>
    </div>
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// Overview Section
// ─────────────────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalBatches: number;
  activeBatches?: number;
  completedBatches: number;
  runningBatches?: number;
  failedBatches?: number;
  pendingBatches?: number;
  totalPrompts?: number;
  successRate?: number;
}

const OverviewSection = ({ stats, userName, greeting }: { stats: DashboardStats | null; userName: string; greeting: string }) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {greeting}, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{userName}</span>
        </h1>
        <p className="text-gray-400 text-base">Here's what's happening with your automations today.</p>
      </div>
      
      {/* Stats Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard 
          title="Total Batches" 
          value={stats?.totalBatches || 0} 
          icon={Layers}
          trend={{ value: 12, positive: true }}
          color="from-purple-500 to-indigo-500"
        />
        <StatCard 
          title="Completed" 
          value={stats?.completedBatches || 0} 
          icon={Target}
          color="from-emerald-500 to-teal-500"
        />
        <StatCard 
          title="Running" 
          value={stats?.runningBatches || 0} 
          icon={Activity}
          color="from-amber-500 to-orange-500"
        />
        <StatCard 
          title="Success Rate" 
          value={`${stats?.successRate || 0}%`} 
          icon={TrendingUp}
          trend={{ value: 5, positive: true }}
          color="from-cyan-500 to-blue-500"
        />
      </div>
      
      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickActionButton 
            title="New Batch"
            subtitle="Create automation"
            icon={Plus}
            color="from-purple-600 to-indigo-600"
            onClick={() => navigate('/dashboard/automation')}
          />
          <QuickActionButton 
            title="Extract Prompts"
            subtitle="From text content"
            icon={FileText}
            color="from-cyan-600 to-blue-600"
            onClick={() => navigate('/dashboard/extractor')}
          />
          <QuickActionButton 
            title="View Results"
            subtitle="Browse outputs"
            icon={BarChart3}
            color="from-emerald-600 to-teal-600"
            onClick={() => navigate('/results')}
          />
        </div>
      </div>
      
      {/* Recent Activity */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg flex items-center justify-between">
            Recent Activity
            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Activity items */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                i === 1 ? 'bg-emerald-500/20 text-emerald-400' :
                i === 2 ? 'bg-amber-500/20 text-amber-400' :
                'bg-purple-500/20 text-purple-400'
              }`}>
                {i === 1 ? <Target className="w-5 h-5" /> :
                 i === 2 ? <Activity className="w-5 h-5" /> :
                 <Sparkles className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {i === 1 ? 'Batch "Homepage Redesign" completed' :
                   i === 2 ? 'Running "API Documentation" batch' :
                   'New batch created: "Landing Pages"'}
                </p>
                <p className="text-gray-500 text-xs">{i * 5} minutes ago</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Automation Section
// ─────────────────────────────────────────────────────────────────────────────
const AutomationSection = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Automation</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your prompt batches</p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard/automation')}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" /> New Batch
        </Button>
      </div>
      
      {/* Batch Status Summary */}
      <div className="grid grid-cols-3 gap-3">
        {['Running', 'Queued', 'Completed'].map((status, i) => (
          <Card key={status} className="bg-white/5 border-white/10">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${
                i === 0 ? 'text-amber-400' : i === 1 ? 'text-blue-400' : 'text-emerald-400'
              }`}>
                {i === 0 ? '2' : i === 1 ? '5' : '47'}
              </div>
              <div className="text-gray-400 text-xs">{status}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Batch List Preview */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Active Batches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {['Homepage v2', 'API Docs', 'Marketing Copy'].map((name, i) => (
            <div key={name} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <div className={`w-3 h-3 rounded-full ${
                i === 0 ? 'bg-amber-400 animate-pulse' : i === 1 ? 'bg-blue-400' : 'bg-gray-400'
              }`} />
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{name}</p>
                <p className="text-gray-500 text-xs">{i === 0 ? 'Running' : i === 1 ? 'Queued' : 'Pending'} • {3 - i} prompts</p>
              </div>
              <Progress value={i === 0 ? 65 : i === 1 ? 0 : 0} className="w-20 h-2" />
            </div>
          ))}
          <Button 
            variant="outline" 
            className="w-full mt-2 border-white/20 text-white hover:bg-white/10"
            onClick={() => navigate('/dashboard/automation')}
          >
            View All Batches
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Extractor Section
// ─────────────────────────────────────────────────────────────────────────────
const ExtractorSection = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Prompt Extractor</h1>
        <p className="text-gray-400 text-sm mt-1">Convert text into actionable prompts</p>
      </div>
      
      {/* Quick Extract Card */}
      <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30">
        <CardContent className="p-6">
          <FileText className="w-12 h-12 text-cyan-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Quick Extract</h3>
          <p className="text-gray-300 text-sm mb-4">
            Paste your content and let AI extract prompts automatically.
          </p>
          <Button 
            onClick={() => navigate('/dashboard/extractor')}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            Start Extracting
          </Button>
        </CardContent>
      </Card>
      
      {/* Recent Extractions */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Recent Extractions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm text-center py-8">
            No recent extractions. Start by extracting prompts from your content.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Results Section
// ─────────────────────────────────────────────────────────────────────────────
const ResultsSection = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Results</h1>
        <p className="text-gray-400 text-sm mt-1">View your automation outputs</p>
      </div>
      
      {/* Results Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          title="Total Outputs" 
          value={128} 
          icon={Layers}
          color="from-purple-500 to-pink-500"
        />
        <StatCard 
          title="This Week" 
          value={23} 
          icon={Clock}
          color="from-emerald-500 to-teal-500"
        />
      </div>
      
      <Button 
        onClick={() => navigate('/results')}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        View All Results
      </Button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Screenshots Section
// ─────────────────────────────────────────────────────────────────────────────
const ScreenshotsSection = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Screenshots</h1>
        <p className="text-gray-400 text-sm mt-1">Visual captures from automations</p>
      </div>
      
      {/* Screenshot Grid Preview */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-video bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
            <Camera className="w-8 h-8 text-gray-600" />
          </div>
        ))}
      </div>
      
      <Button 
        onClick={() => navigate('/screenshots')}
        className="w-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600"
      >
        View All Screenshots
      </Button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD BETA COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const DashboardBeta = () => {
  const { user, signOut } = useAuth();
  const { stats } = useDashboardStats();
  const greeting = useDashboardGreeting();
  const navigate = useNavigate();
  
  const [activeSection, setActiveSection] = useState('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const userName = useMemo(() => {
    if (!user) return 'there';
    return user.user_metadata?.name?.split(' ')[0] || 
           user.email?.split('@')[0] || 
           'there';
  }, [user]);
  
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [signOut, navigate]);
  
  const renderSection = useCallback(() => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection stats={stats} userName={userName} greeting={greeting.greeting} />;
      case 'automation':
        return <AutomationSection />;
      case 'extractor':
        return <ExtractorSection />;
      case 'results':
        return <ResultsSection />;
      case 'screenshots':
        return <ScreenshotsSection />;
      default:
        return <OverviewSection stats={stats} userName={userName} greeting={greeting.greeting} />;
    }
  }, [activeSection, stats, userName, greeting]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Mobile Header */}
      <MobileHeader onMenuOpen={() => setIsMenuOpen(true)} userName={userName} />
      
      {/* Desktop Sidebar */}
      <DesktopSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        onSignOut={handleSignOut}
      />
      
      {/* Main Content */}
      <main className="
        pt-16 pb-20 px-4
        md:pt-0 md:pb-0 md:pl-20 lg:pl-64 md:pr-0
        min-h-screen
      ">
        <div className="max-w-6xl mx-auto py-6 md:py-8">
          <ErrorBoundary>
            {renderSection()}
          </ErrorBoundary>
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeSection={activeSection} onSectionChange={setActiveSection} />
      
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            className="fixed right-0 top-0 bottom-0 w-80 bg-gray-900 border-l border-white/10 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-400"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{userName}</p>
                <p className="text-gray-400 text-sm truncate max-w-[180px]">{user?.email}</p>
              </div>
            </div>
            
            {/* Menu Links */}
            <div className="space-y-2">
              <Link to="/settings" className="flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBeta;
