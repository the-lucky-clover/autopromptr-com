
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WindowManagerProvider } from "@/contexts/WindowManagerContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import BatchProcessorDashboard from "./pages/BatchProcessorDashboard";
import BatchExtractorDashboard from "./pages/BatchExtractorDashboard";
import Results from "./pages/Results";
import Screenshots from "./pages/Screenshots";
import Settings from "./pages/Settings";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WindowManagerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/automation" element={
                <ProtectedRoute>
                  <BatchProcessorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/extractor" element={
                <ProtectedRoute>
                  <BatchExtractorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/results" element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              } />
              <Route path="/screenshots" element={
                <ProtectedRoute>
                  <Screenshots />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WindowManagerProvider>
    </QueryClientProvider>
  );
}

export default App;
