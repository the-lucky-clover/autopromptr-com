
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import dashboardMockup from '@/assets/dashboard-mockup-cyberpunk.png';
import { useEffect, useState } from 'react';

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
      {/* Aurora Video Background */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-100"
          style={{ filter: 'blur(1px)' }}
        >
          <source src="https://videos.pexels.com/video-files/852435/852435-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
        
        {/* Vertical gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/100 via-background/50 to-background/0" />
        
        {/* 3D Vignette Effect */}
        <div className="absolute inset-0 bg-radial-vignette" />
      </div>
      
      {/* Psychedelic Background Animation */}
      <div className="absolute inset-0 bg-gradient-psychedelic animate-psychedelic-flow opacity-50 mix-blend-multiply"></div>
      
      {/* Vertical Gradient Overlay - 100% to 0% opacity top to bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-transparent"></div>
      
      {/* Vignette Effect */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.4) 100%)'
      }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center max-w-5xl mx-auto">
          
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 animate-scale-in delay-300 text-center">
          <span className="animate-gradient-hero skeumorphic-text">AI On Autopilot</span>
        </h1>
          
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 animate-fly-in delay-500 max-w-4xl mx-auto leading-relaxed">
          Streamline your AI workflows with intelligent automation. Deploy, monitor, and scale your prompt-based operations 
          <span className="text-gradient-rainbow font-semibold"> with enterprise-grade reliability</span> and precision.
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
            src="/src/assets/dashboard-mockup-cyberpunk.png" 
            alt="AutoPromptr Cyberpunk Dashboard Interface" 
            className="w-full h-auto rounded-2xl shadow-elegant border border-primary/20 bg-card/10 backdrop-blur-sm animate-materialize delay-700 skeumorphic-surface shimmer-rare"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
              </div>
            </div>
          </div>
          
      {/* Video Attribution - Smaller and positioned in lower right */}
      <div className="fixed bottom-2 right-2 z-10 animate-fade-in delay-1000">
        <a 
          href="https://www.pexels.com/video/aurora-852435/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors glass-capsule px-1.5 py-0.5 rounded-md"
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
