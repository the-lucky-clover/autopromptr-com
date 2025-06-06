
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-900 to-purple-600"></div>
      
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-blue-500/10 to-purple-500/20"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Supercharge
            </span>{" "}
            <span className="text-white">Your AI</span>
            <br />
            <span className="text-white">Prompt Workflow</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto font-light">
            Intelligently batch process, enhance, and deploy prompts across all major AI coding 
            platforms. Transform your development workflow with AutoPromptr's powerful automation 
            tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              Watch Demo
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="mt-16">
            <div className="relative mx-auto max-w-4xl">
              <img 
                src="/lovable-uploads/0376b92f-80f8-4432-ae09-ddea8d0a9bd3.png" 
                alt="ChatGPT Interface showing prompt automation" 
                className="mx-auto rounded-2xl shadow-2xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
