
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
import CompactCookieBanner from "@/components/CompactCookieBanner";
import SpeedometerSection from "@/components/SpeedometerSection";
import { FloatingConsoleButton } from "@/components/admin/FloatingConsoleButton";
// Removed useScrollAnimation import - using pure CSS animations
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  console.log("Index page rendering...");
  
  const { user, isEmailVerified, isInitialized } = useAuth();
  const navigate = useNavigate();
  
  // Removed scroll animation hook - using pure CSS animations instead

  // Auto-redirect authenticated users to dashboard with a short delay
  useEffect(() => {
    if (isInitialized && user && isEmailVerified) {
      console.log("Authenticated user detected, redirecting to dashboard...");
      // Small delay to prevent jarring flash
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
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

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
        <div className="animate-slide-up delay-100">
          <SpeedometerSection />
        </div>
        <div className="animate-slide-up delay-200">
          <ProvenResults />
        </div>
        <div className="animate-slide-up delay-300">
          <Features />
        </div>
        <div className="animate-slide-up delay-400">
          <UseCases />
        </div>
        <div className="animate-slide-up delay-500">
          <SocialProof />
        </div>
        <div className="animate-slide-up delay-600">
          <TrustedBy />
        </div>
        <div className="animate-slide-up delay-700">
          <BlogPosts />
        </div>
        <div className="animate-slide-up delay-800">
          <NewsletterSignup />
        </div>
        <div className="animate-slide-up delay-900">
          <CTA />
        </div>
      <Footer />
      <FloatingConsoleButton />
      <CompactCookieBanner />
    </div>
  );
};

export default Index;
