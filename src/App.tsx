import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Settings from "./pages/Settings";
import BatchExtractor from "./pages/BatchExtractor";
import BatchProcessorDashboard from "./pages/BatchProcessorDashboard";
import BatchExtractorDashboard from "./pages/BatchExtractorDashboard";
import Screenshots from "./pages/Screenshots";
import PromptLibrary from "./pages/PromptLibrary";
import Results from "./pages/Results";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import TermsOfService from "./pages/TermsOfService";
import ProtectedRoute from "./components/ProtectedRoute";
import MigrationDashboard from "./pages/MigrationDashboard";
import BackendTest from "./pages/BackendTest";
import BackendHealthDashboard from "./pages/BackendHealthDashboard";
import SongGenerationTest from "./pages/SongGenerationTest";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            
            {/* Migration Dashboard - accessible without auth for testing */}
            <Route path="/migration" element={<MigrationDashboard />} />
            
            {/* Backend Testing - accessible without auth for testing */}
            <Route path="/backend-test" element={<BackendTest />} />
          <Route path="/backend-health" element={<BackendHealthDashboard />} />
          <Route path="/song-test" element={<SongGenerationTest />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/batch-extractor" element={
              <ProtectedRoute>
                <BatchExtractor />
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
            <Route path="/batch-extractor-dashboard" element={
              <ProtectedRoute>
                <BatchExtractorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/screenshots" element={
              <ProtectedRoute>
                <Screenshots />
              </ProtectedRoute>
            } />
            <Route path="/library" element={
              <ProtectedRoute>
                <PromptLibrary />
              </ProtectedRoute>
            } />
            <Route path="/results" element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
);

export default App;
