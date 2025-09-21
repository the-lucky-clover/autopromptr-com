
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
            {/* Logo with Enhanced Capsule Background */}
            <div className="flex-shrink-0 relative">
              <div className="
                absolute -inset-4 
                bg-gradient-psychedelic/30
                rounded-full blur-sm
                animate-glow-pulse
                shimmer-45-stagger
              "></div>
              <PsychedelicBrandLogo size="medium" />
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <a
                href="#features"
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium shimmer-rare"
              >
                Features
              </a>
              <a
                href="#results"
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium shimmer-rare"
              >
                Results
              </a>
              <a
                href="/blog"
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium shimmer-rare"
              >
                Blog
              </a>
            </div>

            {/* Auth Buttons */}
            {showButtons && (
              <div className="flex items-center space-x-3">
                {user && isEmailVerified ? (
                  <Button
                    onClick={() => window.location.href = '/dashboard'}
                    className="
                      bg-gradient-psychedelic text-primary-foreground 
                      hover:opacity-90 transition-all duration-300
                      skeumorphic-button shimmer-45-rare
                      border-0 rounded-full px-6
                    "
                  >
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => window.location.href = '/auth'}
                      className="
                        text-white hover:text-primary 
                        bg-white/10 hover:bg-white/20
                        border border-white/30
                        rounded-full px-4
                        shimmer-rare
                      "
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => window.location.href = '/auth'}
                      className="
                        bg-gradient-psychedelic text-primary-foreground 
                        hover:opacity-90 transition-all duration-300
                        skeumorphic-button shimmer-45-rare
                        border-0 rounded-full px-6
                      "
                    >
                      <span className="animate-glow-pulse">⭐︎</span>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
