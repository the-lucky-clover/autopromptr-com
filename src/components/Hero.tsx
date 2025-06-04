
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-effect mb-6">
            <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-gray-300">AI-Powered Prompt Automation</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Automate Your{" "}
            <span className="gradient-text">AI Workflows</span>{" "}
            with Smart Prompts
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-8 leading-relaxed">
            Create, manage, and deploy intelligent AI prompts that scale with your business. 
            Streamline your AI operations and boost productivity by 10x.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg px-8 py-4 animate-glow"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 text-lg px-8 py-4"
            >
              Watch Demo
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl font-bold text-purple-400 mb-2">99.9%</div>
              <div className="text-gray-400">Uptime Guarantee</div>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-3xl font-bold text-blue-400 mb-2">10x</div>
              <div className="text-gray-400">Faster Deployment</div>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-400">Expert Support</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
    </section>
  );
};

export default Hero;
