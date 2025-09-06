
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

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
          
          <div className="mt-16">
            {/* Image container with reflection */}
            <div className="relative mx-auto max-w-2xl group perspective-1000">
              {/* Holographic glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition-all duration-700 animate-pulse"></div>
              
              {/* Main image */}
              <div className="relative">
                <img 
                  src="/lovable-uploads/a7664099-7c32-4d61-9848-0bab8389a73d.png" 
                  alt="AutoPromptr dashboard interface with system status, batch automation, and real-time activity monitoring"
                  className="relative mx-auto rounded-3xl shadow-2xl max-w-full h-auto transform group-hover:scale-105 transition-all duration-500 border-2 border-primary/30 backdrop-blur-sm"
                  onError={(e) => {
                    console.warn('Hero image failed to load, using fallback');
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMUUyOTNDIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjI1IiBmaWxsPSIjNjM2NjZBIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiPkFJIEF1dG9tYXRpb24gRGFzaGJvYXJkPC90ZXh0Pgo8L3N2Zz4=';
                  }}
                />
                
                {/* Iridescent overlay on image */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-3xl pointer-events-none mix-blend-overlay"></div>
              </div>
              
              {/* Reflection effect */}
              <div className="relative mt-2 overflow-hidden rounded-3xl">
                <img 
                  src="/lovable-uploads/a7664099-7c32-4d61-9848-0bab8389a73d.png" 
                  alt=""
                  className="w-full transform scale-y-[-1] opacity-30 blur-sm"
                  style={{
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)'
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
