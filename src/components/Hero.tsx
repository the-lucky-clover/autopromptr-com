
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import VideoBackground from "./VideoBackground";
import { useTimeBasedVideo } from "@/hooks/useTimeBasedVideo";
import { BatchAutomationTest } from "./BatchAutomationTest";
import SimpleErrorBoundary from "./SimpleErrorBoundary";

const Hero = () => {
  const { user, isEmailVerified, isInitialized } = useAuth();
  const [showButtons, setShowButtons] = useState(false);
  
  // Use aurora video for hero background
  const heroVideo = {
    url: 'https://videos.pexels.com/video-files/852435/852435-hd_1920_1080_30fps.mp4',
    attribution: 'https://www.pexels.com/video/time-lapse-video-of-aurora-borealis-852435/'
  };

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
    <section className="
      relative 
      min-h-screen 
      flex items-center justify-center 
      overflow-hidden 
      pt-24 md:pt-20 
      animate-fade-in
      w-full
    ">
      {/* Video Background - Limited to Hero Section */}
      <VideoBackground
        enabled={true}
        videoUrl={heroVideo.url}
        showAttribution={true}
        opacity={45}
        blendMode="multiply"
      />
      
      {/* Psychedelic Background Animation */}
      <div className="absolute inset-0 bg-gradient-psychedelic animate-psychedelic-flow opacity-60"></div>
      
      {/* Vertical Gradient Overlay - 100% to 0% opacity top to bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-transparent"></div>
      
      {/* Vignette Effect */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.4) 100%)'
      }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center max-w-5xl mx-auto">
          
            <h1 className="
              text-5xl md:text-7xl lg:text-8xl 
              font-bold mb-8 
              leading-tight 
              animate-slide-up 
              font-orbitron
              skeumorphic-text
              shimmer-staggered
            ">
            <span className="
              bg-gradient-rainbow-flow 
              bg-clip-text 
              text-transparent 
              animate-rainbow-shift
              glow-effect
              drop-shadow-glow
            " style={{ backgroundSize: '400% 400%' }}>
              AI On Autopilot
            </span>
          </h1>
          
          <p className="
            text-xl md:text-2xl 
            text-muted-foreground 
            mb-12 
            leading-relaxed 
            max-w-4xl 
            mx-auto 
            font-light 
            animate-slide-up 
            delay-200
            glow-effect
            skeumorphic-text
            shimmer-staggered-delay
          ">
            Stop babysitting your prompts. Let them transcend dimensions while you architect the impossible—batch processing through hyperspace, where every iteration dissolves into pure creative flow across infinite AI realms.
          </p>
          
          {showButtons && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up delay-400">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="
                  bg-gradient-psychedelic 
                  text-primary-foreground 
                  text-lg px-8 py-4 
                  font-semibold 
                  smooth-transition 
                  flex items-center justify-center gap-2 
                  shadow-glow-md
                  hover:shadow-glow-lg
                  animate-subtle-breathe
                  hover:scale-105
                  rounded-2xl
                  border-0
                "
              >
                <span className="animate-glow-pulse">⭐︎</span>
                Get Started
              </Button>
              <Button 
                size="lg" 
                onClick={handleSignIn}
                variant="outline"
                className="
                  text-lg px-8 py-4 
                  font-semibold 
                  smooth-transition 
                  flex items-center justify-center gap-2 
                  border-border/50
                  bg-card/30
                  backdrop-blur-sm
                  hover:bg-card/50
                  hover:shadow-glow-sm
                  rounded-2xl
                  text-foreground
                  hover:text-primary
                "
              >
                Sign In
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}
          
          <div className="mt-16 relative animate-slide-up delay-600">
            {/* Floating image container - macOS dock style - 50% bigger */}
            <div className="relative mx-auto max-w-3xl z-10">
              {/* Ambient glow underneath */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-2/3 h-3 bg-gradient-to-r from-transparent via-primary/40 to-transparent blur-md"></div>
              
              {/* Main floating image */}
              <div className="skeuomorphic-card elevation-3 rounded-2xl overflow-hidden">
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
          
          {/* Video Attribution - Lower Right */}
          <div className="absolute bottom-8 right-8 z-20">
            <a
              href={heroVideo.attribution}
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-xs text-white/70 hover:text-white/90 
                bg-black/30 px-3 py-2 rounded-full 
                backdrop-blur-md transition-all duration-300
                border border-white/20
                hover:bg-black/50 hover:border-white/30
                skeumorphic-glass
                shimmer-rare
              "
            >
              Aurora by Pexels
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
