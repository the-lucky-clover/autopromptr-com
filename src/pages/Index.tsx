
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
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  console.log("Index page rendering...");
  
  const { user, isEmailVerified, isInitialized } = useAuth();
  
  useScrollAnimation();

  // Move any potential state updates to useEffect to prevent render-time updates
  useEffect(() => {
    if (isInitialized && user && isEmailVerified) {
      console.log("User is authenticated and email verified");
    }
  }, [isInitialized, user, isEmailVerified]);

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return null; // Let AuthProvider handle the loading UI
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Show welcome message for authenticated users */}
      {user && isEmailVerified && (
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-purple-500/30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-purple-100">
                Welcome back! Ready to supercharge your AI workflow?
              </p>
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                size="sm"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <Hero />
      <ProvenResults />
      <Features />
      <UseCases />
      <SocialProof />
      <TrustedBy />
      <BlogPosts />
      <NewsletterSignup />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
