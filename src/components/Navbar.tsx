
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AuthModal from "@/components/AuthModal";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStartedClick = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  return (
    <nav className="fixed top-0 w-full z-40">
      {/* Glassmorphism background that slides down */}
      <div className={`absolute top-0 left-0 right-0 h-20 transition-all duration-700 ease-out ${
        isScrolled 
          ? 'transform translate-y-0 opacity-100' 
          : 'transform -translate-y-20 opacity-0'
      } bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg rounded-b-2xl`} />
      
      {/* Navbar content - always visible */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-0.5 group">
            <Zap className="w-9 h-9 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text" strokeWidth={1.5} style={{ color: 'transparent', stroke: 'url(#gradient)' }} />
            <svg width="0" height="0">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AutoPromptr
            </span>
          </Link>
          
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
              <Button 
                onClick={handleGetStartedClick}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-2xl font-semibold transition-all duration-200"
              >
                Sign In / Register
              </Button>
            )}
          </div>

          {/* Mobile menu - now uses popover */}
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
                    <AuthModal 
                      mode={authMode} 
                      onClose={() => setIsOpen(false)}
                      isMobile={true}
                    />
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
