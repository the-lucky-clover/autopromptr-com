
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import dashboardRealScreenshot from '@/assets/dashboard-real-cyberpunk.png';
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
      pt-32 md:pt-28 
      animate-fade-in
      w-full
    ">
      {/* Aurora Video Background - 100% opacity, positioned higher */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute -top-20 left-0 w-full h-[calc(100%+80px)] object-cover opacity-100 transition-opacity duration-[2000ms] ease-in-out"
        >
          <source src="https://videos.pexels.com/video-files/852435/852435-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
      </div>
      
      {/* Vertical gradient overlay - 100% to 0% opacity top to bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/100 via-black/50 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center max-w-5xl mx-auto">
          
        {/* Hero headline - Award-winning typography */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-4 animate-scale-in delay-300 text-center leading-[0.9] tracking-tight">
          <span className="block text-white/95 font-light mb-2">AI On</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 animate-gradient-x font-black">Autopilot</span>
        </h1>
          
        {/* Subheading - No orphans, dramatic hierarchy */}
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-100 mb-8 animate-fly-in delay-500 max-w-5xl mx-auto leading-relaxed font-light tracking-wide px-4">
          Stop babysitting your&nbsp;prompts. Democratize your coding experience whether local or&nbsp;online—we consolidate the process into one seamless, intelligent automation pipeline that scales with your&nbsp;ambitions.
        </p>
          
          {showButtons && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20 animate-slide-up delay-400">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="
                  bg-gradient-psychedelic 
                  text-primary-foreground 
                  text-xl sm:text-2xl px-10 sm:px-16 py-6 sm:py-8
                  font-bold 
                  award-button
                  dopamine-trigger
                  glint-surface
                  flex items-center justify-center gap-3
                  shadow-2xl
                  rounded-3xl
                  border-0
                "
                style={{'--glint-delay': 0.5} as React.CSSProperties}
              >
                <span className="text-2xl sm:text-3xl">⭐︎</span>
                Get&nbsp;Started
              </Button>
              <Button 
                size="lg" 
                onClick={handleSignIn}
                variant="outline"
                className="
                  text-xl sm:text-2xl px-10 sm:px-16 py-6 sm:py-8
                  font-bold 
                  dopamine-trigger
                  glint-surface
                  flex items-center justify-center gap-3
                  border-white/40
                  bg-card/20
                  backdrop-blur-md
                  hover:bg-card/40
                  shadow-xl
                  rounded-3xl
                  text-foreground
                  hover:text-primary
                "
                style={{'--glint-delay': 1.2} as React.CSSProperties}
              >
                Sign&nbsp;In
                <ArrowRight className="w-6 h-6" />
              </Button>
            </div>
          )}
          
          <div className="mt-20 sm:mt-28 relative animate-slide-up delay-600">
            <div className="relative mx-auto max-w-6xl z-10 px-4">
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-gradient-to-r from-transparent via-primary/60 to-transparent blur-2xl"></div>
              
              <div className="skeuomorphic-card elevation-3 rounded-3xl overflow-hidden glint-surface" style={{'--glint-delay': 2} as React.CSSProperties}>
          <img 
            src={dashboardRealScreenshot}
            alt="AutoPromptr Real Dashboard - Batch Processing in Action" 
            className="w-full h-auto rounded-3xl shadow-2xl border-2 border-primary/30 bg-card/20 backdrop-blur-sm animate-materialize delay-700"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Attribution - Anchored within hero in lower right with proper spacing */}
      <div className="absolute bottom-8 right-6 z-20 animate-fade-in delay-1000 p-2">
        <a 
          href="https://www.pexels.com/video/aurora-852435/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] text-white/40 hover:text-white/60 bg-black/20 px-3 py-2 rounded-md backdrop-blur-sm transition-colors duration-300"
        >
          Aurora by Pexels
        </a>
      </div>
    </section>
  );
};

export default Hero;
