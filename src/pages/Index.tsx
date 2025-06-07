
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

const Index = () => {
  useScrollAnimation();

  return (
    <div className="min-h-screen">
      <Navbar />
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
