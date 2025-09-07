
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
// import AnimatedPatternBackground from "./AnimatedPatternBackground"; // Temporarily disabled
import { BatchAutomationTest } from "./BatchAutomationTest";
import SimpleErrorBoundary from "./SimpleErrorBoundary";

const Hero = () => {
  const { user, isEmailVerified, isInitialized } = useAuth();
  const [showButtons, setShowButtons] = useState(false);

  // Delay showing buttons until auth is fully initialized to prevent layout shifts
  useEffect(() => {
    if (isInitialized) {
      setShowButtons(true);
    }
  }, [isInitialized]);

  const handleGetStarted = () => {
    if (user && isEmailVerified) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/auth';
    }
  };

  const handleSignIn = () => {
    window.location.href = '/auth';
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-20 animate-fade-in">
      {/* Simple gradient background instead of 3D animation for stability */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-transparent to-background/60"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight animate-slide-up">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
              <span className="block sm:inline">Supercharge</span>
              <span className="block sm:inline"> Your AI</span>
            </span>
            <br />
            <span className="text-foreground skeuomorphic-heading">
              <span className="block sm:inline">Prompt</span>
              <span className="block sm:inline"> Workflow</span>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto font-light animate-slide-up delay-200 skeuomorphic-text">
            Intelligently batch process, enhance, and deploy prompts across all major AI coding 
            platforms, remote or local. Transform your development workflow with AutoPromptr's powerful automation 
            tools.
          </p>
          
          {showButtons && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up delay-400">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="text-primary-foreground text-lg px-8 py-4 font-semibold transition-all duration-200 flex items-center justify-center gap-2 skeuomorphic-button hover-elevate"
              >
                <span>⭐︎</span>
                Get Started
              </Button>
              <Button 
                size="lg" 
                onClick={handleSignIn}
                className="text-lg px-8 py-4 font-semibold transition-all duration-200 flex items-center justify-center gap-2 skeuomorphic-button-outline hover-elevate"
              >
                Sign In
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}
          
          <div className="mt-16 relative animate-slide-up delay-600">
            {/* Test Component - Temporary for validation */}
            <SimpleErrorBoundary>
              <div className="mb-8">
                <BatchAutomationTest />
              </div>
            </SimpleErrorBoundary>
            
            {/* Floating image container - macOS dock style */}
            <div className="relative mx-auto max-w-xl z-10">
              {/* Ambient glow underneath */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-2/3 h-3 bg-gradient-to-r from-transparent via-primary/40 to-transparent blur-md"></div>
              
              {/* Main floating image */}
              <div className="skeuomorphic-card elevation-3 hover-elevate">
                <img 
                  src="/lovable-uploads/a7664099-7c32-4d61-9848-0bab8389a73d.png" 
                  alt="AutoPromptr dashboard interface with system status, batch automation, and real-time activity monitoring"
                  className="relative mx-auto rounded-2xl max-w-full h-auto"
                  onError={(e) => {
                    console.warn('Hero image failed to load, using fallback');
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMUUyOTNDIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjI1IiBmaWxsPSIjNjM2NjZBIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiPkFJIEF1dG9tYXRpb24gRGFzaGJvYXJkPC90ZXh0Pgo8L3N2Zz4=';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
