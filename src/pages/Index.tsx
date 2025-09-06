
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import ProvenResults from "@/components/ProvenResults";
import NewsletterSignup from "@/components/NewsletterSignup";
import UseCases from "@/components/UseCases";
import SocialProof from "@/components/SocialProof";
import TrustedBy from "@/components/TrustedBy";
import BlogPosts from "@/components/BlogPosts";
import Footer from "@/components/Footer";
import EnhancedCookieBanner from "@/components/EnhancedCookieBanner";
import { FloatingConsoleButton } from "@/components/admin/FloatingConsoleButton";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  console.log("Index page rendering...");
  
  const { user, isEmailVerified, isInitialized } = useAuth();
  const navigate = useNavigate();
  
  useScrollAnimation();

  // Auto-redirect authenticated users to dashboard immediately
  useEffect(() => {
    if (isInitialized && user && isEmailVerified) {
      console.log("Authenticated user detected, redirecting to dashboard...");
      navigate('/dashboard', { replace: true });
    }
  }, [isInitialized, user, isEmailVerified, navigate]);

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-900 via-blue-900 to-purple-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render landing page content for authenticated users
  if (user && isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-900 via-blue-900 to-purple-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <div className="animate-on-scroll">
        <ProvenResults />
      </div>
      <div className="animate-on-scroll">
        <Features />
      </div>
      <div className="animate-on-scroll">
        <UseCases />
      </div>
      <div className="animate-on-scroll">
        <SocialProof />
      </div>
      <div className="animate-on-scroll">
        <TrustedBy />
      </div>
      <div className="animate-on-scroll">
        <BlogPosts />
      </div>
      <div className="animate-on-scroll">
        <NewsletterSignup />
      </div>
      <div className="animate-on-scroll">
        <CTA />
      </div>
      <Footer />
      <FloatingConsoleButton />
      <EnhancedCookieBanner />
    </div>
  );
};

export default Index;
