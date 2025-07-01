
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Screenshots from "./pages/Screenshots";
import Settings from "./pages/Settings";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BatchProcessorDashboard from "./pages/BatchProcessorDashboard";
import BatchExtractorDashboard from "./pages/BatchExtractorDashboard";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./pages/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { WindowManagerProvider } from "./contexts/WindowManagerContext";
import CookieBanner from "./components/CookieBanner";

const queryClient = new QueryClient();

function App() {
  const { user, isEmailVerified } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <WindowManagerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={user && isEmailVerified ? <Navigate to="/dashboard" replace /> : <Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/layout" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/batch-processor" 
                element={
                  <ProtectedRoute>
                    <BatchProcessorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/batch-extractor" 
                element={
                  <ProtectedRoute>
                    <BatchExtractorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/screenshots" 
                element={
                  <ProtectedRoute>
                    <Screenshots />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/admin" 
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <CookieBanner />
        </TooltipProvider>
      </WindowManagerProvider>
    </QueryClientProvider>
  );
}

export default App;
