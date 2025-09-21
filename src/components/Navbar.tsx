
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import AuthModal from "@/components/AuthModal";
import PsychedelicBrandLogo from "@/components/PsychedelicBrandLogo";

const Navbar = () => {
  const { user, isEmailVerified, isInitialized } = useAuth();
  const [showButtons, setShowButtons] = useState(false);

  // Delay showing buttons until auth is fully initialized to prevent layout shifts
  useEffect(() => {
    if (isInitialized) {
      setShowButtons(true);
    }
  }, [isInitialized]);

  // Don't render auth-dependent UI until initialized
  if (!isInitialized) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-center pt-4">
          <div className="w-1/2 min-w-[320px] max-w-2xl bg-background/20 backdrop-blur-xl border border-white/30 rounded-full px-6 py-3">
            <div className="flex items-center justify-center h-12">
              <PsychedelicBrandLogo size="medium" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Don't render navbar for authenticated users (they should be redirected)
  if (user && isEmailVerified) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Glass Capsule Container - 50% width centered */}
      <div className="flex justify-center pt-4">
        <div className="
          w-1/2 min-w-[320px] max-w-2xl
          bg-background/20 backdrop-blur-xl 
          border border-white/30
          rounded-full px-6 py-3
          skeumorphic-glass-capsule
          shimmer-persistent
          shadow-glow-lg
        ">
          <div className="flex items-center justify-between h-12">
            {/* Logo - Smaller Size */}
            <div className="flex-shrink-0 relative">
              <div className="
                absolute -inset-2 
                bg-gradient-psychedelic/30
                rounded-full blur-sm
                animate-glow-pulse
                shimmer-45-stagger
              "></div>
              <PsychedelicBrandLogo size="small" />
            </div>

            {/* Avatar Menu */}
            {showButtons && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="
                      w-10 h-10 rounded-full p-0
                      bg-white/10 hover:bg-white/20
                      border border-white/30
                      shimmer-rare
                      transition-all duration-300
                      hover:scale-105
                    "
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
                    w-56 p-0 
                    bg-background/95 backdrop-blur-xl 
                    border border-white/20
                    rounded-2xl
                    animate-scale-in
                  " 
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
                        className="w-full justify-start text-left"
                        onClick={() => window.location.href = '/dashboard'}
                      >
                        Dashboard
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left"
                        onClick={() => window.location.href = '/settings'}
                      >
                        Settings
                      </Button>
                      <div className="pt-2 border-t border-white/10">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left text-red-400 hover:text-red-300"
                          onClick={() => {
                            // Add sign out logic here
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
                        className="w-full bg-gradient-psychedelic text-primary-foreground border-0"
                        onClick={() => window.location.href = '/auth'}
                      >
                        <span className="animate-glow-pulse mr-2">⭐︎</span>
                        Get Started
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-white/20 bg-white/5"
                        onClick={() => window.location.href = '/auth'}
                      >
                        Sign In
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
