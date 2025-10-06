import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import UseCases from "@/components/UseCases";
import ProvenResults from "@/components/ProvenResults";
import TrustedBy from "@/components/TrustedBy";
import SocialProof from "@/components/SocialProof";
import BlogPosts from "@/components/BlogPosts";
import DownloadableResources from "@/components/DownloadableResources";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import EnhancedCookieBanner from "@/components/EnhancedCookieBanner";

const Index = () => {
  console.log("Index page rendering...");
  
  const { user, isEmailVerified, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && user && isEmailVerified) {
      console.log("Authenticated user detected, redirecting to dashboard...");
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    }
  }, [isInitialized, user, isEmailVerified, navigate]);

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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main className="relative">
        <Hero />
        <div className="glint-surface awwward-transition" style={{'--glint-delay': 3} as React.CSSProperties}>
          <Features />
        </div>
        <div className="glint-surface awwward-transition" style={{'--glint-delay': 5} as React.CSSProperties}>
          <UseCases />
        </div>
        <ProvenResults />
        <TrustedBy />
        <div className="glint-surface awwward-transition" style={{'--glint-delay': 7} as React.CSSProperties}>
          <SocialProof />
        </div>
        <BlogPosts />
        <DownloadableResources />
        <CTA />
      </main>
      <Footer />
      <EnhancedCookieBanner />
    </div>
  );
};

export default Index;