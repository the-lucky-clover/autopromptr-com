import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import Bento3DCard from "@/components/Bento3DCard";

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
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      {/* Cyberpunk Rain Effect */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-cyan/5 via-background to-background" />
      
      <Navbar />
      
      <main className="relative z-10">
        {/* Hero with 3D Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Hero />
        </motion.div>

        {/* Bento Box Grid Layout */}
        <div className="container mx-auto px-4 py-20 space-y-8">
          <Bento3DCard delay={0.2} neonColor="cyan">
            <Features />
          </Bento3DCard>
          
          <Bento3DCard delay={0.4} neonColor="magenta">
            <UseCases />
          </Bento3DCard>
          
          <Bento3DCard delay={0.6} neonColor="purple">
            <ProvenResults />
          </Bento3DCard>
          
          <Bento3DCard delay={0.8} neonColor="yellow">
            <TrustedBy />
          </Bento3DCard>
          
          <Bento3DCard delay={1.0} neonColor="orange">
            <SocialProof />
          </Bento3DCard>
          
          <Bento3DCard delay={1.2} neonColor="cyan">
            <BlogPosts />
          </Bento3DCard>
          
          <Bento3DCard delay={1.4} neonColor="magenta">
            <DownloadableResources />
          </Bento3DCard>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            <CTA />
          </motion.div>
        </div>
      </main>
      
      <Footer />
      <EnhancedCookieBanner />
    </div>
  );
};

export default Index;