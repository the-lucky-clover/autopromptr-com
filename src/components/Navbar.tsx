
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PsychedelicBrandLogo from "@/components/PsychedelicBrandLogo";
import AnimatedAuthModal from "@/components/AnimatedAuthModal";

const Navbar = () => {
  const { user, isEmailVerified, isInitialized } = useAuth();
  const [showButtons, setShowButtons] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (isInitialized) {
      setShowButtons(true);
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-center pt-4 px-4">
          <div className="w-full max-w-7xl bg-background/10 backdrop-blur-2xl border border-white/20 rounded-full px-6 py-3">
            <div className="flex items-center justify-center h-12">
              <PsychedelicBrandLogo size="medium" animate={false} />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (user && isEmailVerified) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-center pt-4 px-4">
        <div className="
          w-full max-w-7xl
          bg-background/10 backdrop-blur-sm 
          border border-white/20
          rounded-full 
          shadow-glow-lg
          relative overflow-hidden
          glint-surface
        " style={{'--glint-delay': Math.random() * 5} as React.CSSProperties}>
          
          <div className="flex items-center justify-between px-6 sm:px-8 md:px-12 py-3 relative z-10">
            {/* Logo - Responsive Dynamic Sizing */}
            <div className="flex-shrink-0 cursor-pointer dopamine-trigger" onClick={handleLogoClick}>
              <div className="block md:hidden">
                <PsychedelicBrandLogo size="small" animate={false} variant="icon-only" />
              </div>
              <div className="hidden md:block lg:hidden">
                <PsychedelicBrandLogo size="small" animate={false} />
              </div>
              <div className="hidden lg:block">
                <PsychedelicBrandLogo size="medium" animate={false} />
              </div>
            </div>

            {/* Avatar Menu */}
            {showButtons && (
              <div className="flex items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="
                        w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0
                        bg-white/10 hover:bg-white/20
                        border border-white/30
                        dopamine-trigger award-button
                        glint-surface
                      "
                      style={{'--glint-delay': Math.random() * 3} as React.CSSProperties}
                    >
                      {user && isEmailVerified ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-psychedelic flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <svg
                          className="w-6 h-6 text-white/80"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="
                      w-64 p-0 
                      bg-background/98 backdrop-blur-2xl 
                      border border-white/30
                      rounded-3xl
                      animate-scale-in
                      shadow-2xl
                      glint-surface
                    " 
                    style={{'--glint-delay': 1} as React.CSSProperties}
                    align="end"
                  >
                    {user && isEmailVerified ? (
                      <div className="p-4 space-y-3">
                        <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
                          <div className="w-10 h-10 rounded-full bg-gradient-psychedelic flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {user.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {user.email?.split('@')[0]}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left dopamine-trigger text-base"
                          onClick={() => window.location.href = '/dashboard'}
                        >
                          Dashboard
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left dopamine-trigger text-base"
                          onClick={() => window.location.href = '/settings'}
                        >
                          Settings
                        </Button>
                        <div className="pt-2 border-t border-white/10">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left text-red-400 hover:text-red-300"
                            onClick={() => {
                              window.location.href = '/';
                            }}
                          >
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 space-y-3">
                        <Button
                          className="w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta text-background border-0 award-button text-base py-6 font-semibold shadow-[0_0_30px_rgba(0,255,255,0.5)] hover:shadow-[0_0_50px_rgba(0,255,255,0.8)] transition-all duration-300"
                          onClick={() => {
                            setAuthMode('signup');
                            setShowAuthModal(true);
                          }}
                        >
                          <span className="mr-2 text-xl">⭐︎</span>
                          Get&nbsp;Started
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-neon-cyan/50 bg-card/30 backdrop-blur-sm dopamine-trigger text-base py-6 hover:border-neon-cyan hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300"
                          onClick={() => {
                            setAuthMode('signin');
                            setShowAuthModal(true);
                          }}
                        >
                          Sign&nbsp;In
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Animated Auth Modal */}
      <AnimatedAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </nav>
  );
};

export default Navbar;