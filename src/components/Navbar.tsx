
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AuthModal from "@/components/AuthModal";
import BrandLogo from "@/components/BrandLogo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut, isInitialized } = useAuth();

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
        
        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center group">
              <BrandLogo size="medium" variant="horizontal" />
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

  return (
    <nav className="fixed top-0 w-full z-40">
      {/* Glassmorphism background that slides down */}
      <div className={`absolute top-0 left-0 right-0 h-20 transition-all duration-700 ease-out ${
        isScrolled 
          ? 'transform translate-y-0 opacity-100' 
          : 'transform -translate-y-20 opacity-0'
      } bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg rounded-b-2xl`} />
      
      {/* Navbar content - always visible */}
      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center group">
            <BrandLogo size="medium" variant="horizontal" />
          </Link>
          
          {/* Desktop buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">Welcome back!</span>
                <Button 
                  onClick={signOut}
                  variant="ghost" 
                  className="text-white hover:text-gray-300 px-4 py-2 rounded-2xl"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={handleSignInClick}
                  variant="ghost"
                  className="text-white hover:text-purple-300 px-4 py-2 rounded-2xl font-semibold transition-all duration-200"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={handleGetStartedClick}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-2xl font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  <span>⭐︎</span>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="md:hidden">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-purple-300 rounded-2xl"
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-80 bg-gray-900/95 backdrop-blur-xl border-gray-700 rounded-2xl mr-4"
                align="end"
                sideOffset={8}
              >
                <div className="p-4">
                  {user ? (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-300 text-center">Welcome back!</div>
                      <Button 
                        onClick={() => { signOut(); setIsOpen(false); }}
                        variant="ghost" 
                        className="w-full text-white hover:text-gray-300 rounded-2xl"
                      >
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        onClick={() => { handleSignInClick(); setIsOpen(false); }}
                        variant="ghost"
                        className="w-full text-white hover:text-purple-300 rounded-2xl"
                      >
                        Sign In
                      </Button>
                      <Button 
                        onClick={() => { handleGetStartedClick(); setIsOpen(false); }}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl flex items-center justify-center gap-2"
                      >
                        <span>⭐︎</span>
                        Get Started
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      {/* Desktop auth modal */}
      <Popover open={authModalOpen && !isOpen} onOpenChange={setAuthModalOpen}>
        <PopoverTrigger asChild>
          <div className="hidden" />
        </PopoverTrigger>
        <PopoverContent className="w-96 bg-gray-900/95 backdrop-blur-xl border-gray-700 rounded-2xl">
          <AuthModal mode={authMode} onClose={() => setAuthModalOpen(false)} />
        </PopoverContent>
      </Popover>
    </nav>
  );
};

export default Navbar;
