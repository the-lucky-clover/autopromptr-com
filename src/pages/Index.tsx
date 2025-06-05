
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import AnimatedStats from "@/components/AnimatedStats";
import SpeedometerSection from "@/components/SpeedometerSection";
import NewsletterSignup from "@/components/NewsletterSignup";
import UseCases from "@/components/UseCases";
import SocialProof from "@/components/SocialProof";
import BlogPosts from "@/components/BlogPosts";
import Footer from "@/components/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Index = () => {
  useScrollAnimation();

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <AnimatedStats />
      <SpeedometerSection />
      <Features />
      <UseCases />
      <SocialProof />
      <BlogPosts />
      <NewsletterSignup />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
