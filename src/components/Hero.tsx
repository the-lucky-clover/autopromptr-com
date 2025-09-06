
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import HolographicFloor from "./HolographicFloor";

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-20">
      {/* Holographic dot grid background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/10 to-accent/20"></div>
      
      {/* Dot grid pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)`,
        backgroundSize: '24px 24px'
      }}></div>
      
      {/* Iridescent overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/30 to-secondary/20 animate-pulse"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Supercharge
            </span>{" "}
            <span className="text-foreground">Your AI</span>
            <br />
            <span className="text-foreground">Prompt Workflow</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto font-light">
            Intelligently batch process, enhance, and deploy prompts across all major AI coding 
            platforms, remote or local. Transform your development workflow with AutoPromptr's powerful automation 
            tools.
          </p>
          
          {showButtons && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="text-primary-foreground text-lg px-8 py-4 font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <span>⭐︎</span>
                Get Started
              </Button>
              <Button 
                size="lg" 
                onClick={handleSignIn}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground text-lg px-8 py-4 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                Sign In
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}
          
          <div className="mt-16 relative">
            {/* 3D Holographic Floor */}
            <div className="absolute inset-0 -top-20 -bottom-20 -left-20 -right-20">
              <HolographicFloor />
            </div>
            
            {/* Floating image container - macOS dock style */}
            <div className="relative mx-auto max-w-2xl z-10">
              {/* Ambient glow underneath */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-3/4 h-4 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-lg"></div>
              
              {/* Main floating image */}
              <div className="dock-float anime-glassmorphism intermittent-shimmer holographic-gleam">
                <img 
                  src="/lovable-uploads/a7664099-7c32-4d61-9848-0bab8389a73d.png" 
                  alt="AutoPromptr dashboard interface with system status, batch automation, and real-time activity monitoring"
                  className="relative mx-auto rounded-3xl shadow-2xl max-w-full h-auto border border-primary/20"
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
