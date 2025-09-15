
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
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut, isInitialized, isEmailVerified } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard event handling for mobile menu and auth modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isOpen) {
          setIsOpen(false);
        }
        if (authModalOpen) {
          setAuthModalOpen(false);
        }
      } else if (event.key === 'Enter' && isOpen) {
        // Handle Enter key in mobile menu
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          if (user) {
            signOut();
            setIsOpen(false);
          } else {
            handleGetStartedClick();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, authModalOpen, user]);

  const handleGetStartedClick = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
    setIsOpen(false);
  };

  const handleSignInClick = () => {
    setAuthMode('signin');
    setAuthModalOpen(true);
    setIsOpen(false);
  };

  // Don't render auth-dependent UI until initialized
  if (!isInitialized) {
    return (
      <nav className="fixed top-0 w-full z-40">
        <div className={`absolute top-0 left-0 right-0 h-20 transition-all duration-700 ease-out ${
          isScrolled 
            ? 'transform translate-y-0 opacity-100' 
            : 'transform -translate-y-20 opacity-0'
        } bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg rounded-b-2xl`} />
        
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center group">
              <div className="relative flex items-center justify-center">
                <PsychedelicBrandLogo size="small" variant="horizontal" id="navbar-loading" />
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded animate-pulse"></div>
            </div>

            <div className="md:hidden">
              <div className="w-8 h-8 bg-white/20 rounded animate-pulse"></div>
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
    <>
      <nav className="fixed top-0 w-full z-40 container-mobile-safe">
        {/* Glassmorphism background that slides down */}
        <div className={`absolute top-0 left-0 right-0 h-20 transition-all duration-700 ease-out ${
          isScrolled 
            ? 'transform translate-y-0 opacity-100' 
            : 'transform -translate-y-20 opacity-0'
        } bg-card/80 backdrop-blur-xl border-b border-border shadow-glow-lg rounded-b-2xl`} />
        
        {/* Navbar content - always visible with responsive padding */}
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Enhanced Logo with Psychedelic Effects */}
            <Link to="/" className="flex items-center group flex-shrink-0">
              <div className="relative flex items-center justify-center">
                <PsychedelicBrandLogo size="small" variant="horizontal" id="navbar-logo" />
              </div>
            </Link>
            
            {/* Desktop buttons - enhanced with new design system */}
            <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
              <Button 
                onClick={handleSignInClick}
                variant="ghost"
                size="sm"
                className="text-foreground hover:text-primary px-4 py-2 rounded-2xl font-medium smooth-transition hover:shadow-glow-sm"
              >
                Sign In
              </Button>
              <Button 
                onClick={handleGetStartedClick}
                size="sm"
                className="
                  bg-gradient-psychedelic 
                  hover:shadow-glow-md 
                  text-primary-foreground 
                  px-5 py-2 
                  rounded-2xl 
                  font-medium 
                  smooth-transition 
                  flex items-center gap-2 
                  shadow-glow-sm
                  animate-subtle-breathe
                  hover:scale-105
                  border-0
                "
              >
                <span className="animate-glow-pulse">⭐︎</span>
                Get Started
              </Button>
            </div>

            {/* Mobile hamburger menu - enhanced with new design */}
            <div className="md:hidden flex-shrink-0 ml-2">
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="
                      text-foreground 
                      hover:text-primary 
                      rounded-2xl p-2 
                      min-w-[44px] min-h-[44px] 
                      flex items-center justify-center
                      hover:shadow-glow-sm
                      smooth-transition
                    "
                  >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="
                    w-72 
                    bg-card/95 
                    backdrop-blur-xl 
                    border-border 
                    rounded-2xl 
                    mr-4 
                    shadow-glow-lg
                    z-50
                  "
                  align="end"
                  sideOffset={8}
                >
                  <div className="p-4 space-y-3">
                    <Button 
                      onClick={() => { handleSignInClick(); setIsOpen(false); }}
                      variant="ghost"
                      className="
                        w-full 
                        text-foreground 
                        hover:text-primary 
                        rounded-2xl
                        hover:shadow-glow-sm
                        smooth-transition
                      "
                    >
                      Sign In
                    </Button>
                    <Button 
                      onClick={() => { handleGetStartedClick(); setIsOpen(false); }}
                      className="
                        w-full 
                        bg-gradient-psychedelic 
                        hover:shadow-glow-md 
                        text-primary-foreground 
                        rounded-2xl 
                        flex items-center justify-center gap-2 
                        shadow-glow-sm
                        animate-subtle-breathe
                        smooth-transition
                      "
                    >
                      <span className="animate-glow-pulse">⭐︎</span>
                      Get Started
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Enhanced Auth Modal with Proper Background Blur and Darkening */}
      <Dialog open={authModalOpen && !isOpen} onOpenChange={setAuthModalOpen}>
        <DialogOverlay className="fixed inset-0 z-50 modal-blur-backdrop data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent className="fixed left-[50%] top-[45%] z-50 translate-x-[-50%] translate-y-[-50%] border-0 bg-transparent p-0 shadow-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <AuthModal mode={authMode} onClose={() => setAuthModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
