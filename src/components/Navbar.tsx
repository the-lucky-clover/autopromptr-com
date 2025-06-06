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

  const handleAuthClick = () => {
    setAuthMode('signin');
    setAuthModalOpen(true);
  };

  const handleGetStartedClick = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all duration-500 ease-in-out ${
      isScrolled 
        ? 'transform translate-y-0 glass-navbar-scrolled' 
        : 'transform -translate-y-full glass-navbar-hidden'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <Zap className="w-8 h-8 text-white" strokeWidth={1.5} />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
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
                  className="text-white hover:text-gray-300 px-4 py-2 rounded-lg"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Popover open={authModalOpen} onOpenChange={setAuthModalOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      onClick={handleAuthClick}
                      variant="ghost"
                      className="text-white hover:text-gray-300 px-4 py-2 font-medium rounded-lg"
                    >
                      Login
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 glass-effect border-purple-500/30 rounded-xl">
                    <AuthModal mode={authMode} onClose={() => setAuthModalOpen(false)} />
                  </PopoverContent>
                </Popover>
                
                <Button 
                  onClick={handleGetStartedClick}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-purple-300 rounded-lg"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass-effect border-t border-white/10 mt-2 rounded-lg">
              {user ? (
                <div className="pt-2 space-y-2">
                  <div className="px-3 py-2 text-sm text-gray-300">Welcome back!</div>
                  <Button 
                    onClick={() => { signOut(); setIsOpen(false); }}
                    variant="ghost" 
                    className="mx-3 text-white hover:text-gray-300 rounded-lg"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="pt-2 space-y-3">
                  <Button 
                    onClick={() => { handleAuthClick(); setIsOpen(false); }}
                    variant="ghost" 
                    className="w-full mx-3 text-white hover:text-gray-300 justify-start rounded-lg"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => { handleGetStartedClick(); setIsOpen(false); }}
                    className="w-full mx-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
