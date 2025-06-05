
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AuthModal } from "@/components/AuthModal";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass-navbar shadow-lg' : 'glass-navbar'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <Zap className="w-8 h-8 text-purple-400 group-hover:text-blue-400 transition-colors duration-300" 
                 style={{
                   background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                   WebkitBackgroundClip: 'text',
                   WebkitTextFillColor: 'transparent',
                   backgroundClip: 'text'
                 }} />
            <span className="text-xl font-bold gradient-text">AutoPromptr</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/dashboard" 
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link 
              to="/blog" 
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Blog
            </Link>
            <a 
              href="#features" 
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Features
            </a>
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Pricing
            </a>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">Welcome back!</span>
                <Button 
                  onClick={signOut}
                  variant="outline" 
                  size="sm"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Popover open={authModalOpen && authMode === 'signin'} onOpenChange={(open) => !open && setAuthModalOpen(false)}>
                  <PopoverTrigger asChild>
                    <Button 
                      onClick={() => handleAuthClick('signin')}
                      variant="outline" 
                      size="sm"
                      className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                    >
                      Sign In
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 glass-effect border-purple-500/30">
                    <AuthModal mode="signin" onClose={() => setAuthModalOpen(false)} />
                  </PopoverContent>
                </Popover>
                
                <Popover open={authModalOpen && authMode === 'signup'} onOpenChange={(open) => !open && setAuthModalOpen(false)}>
                  <PopoverTrigger asChild>
                    <Button 
                      onClick={() => handleAuthClick('signup')}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    >
                      Get Started
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 glass-effect border-purple-500/30">
                    <AuthModal mode="signup" onClose={() => setAuthModalOpen(false)} />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-purple-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass-effect border-t border-white/10 mt-2 rounded-lg">
              <Link
                to="/dashboard"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/blog"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              <a
                href="#features"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Features
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </a>
              
              {user ? (
                <div className="pt-2 space-y-2">
                  <div className="px-3 py-2 text-sm text-gray-300">Welcome back!</div>
                  <Button 
                    onClick={() => { signOut(); setIsOpen(false); }}
                    variant="outline" 
                    size="sm"
                    className="mx-3 border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="pt-2 space-y-2">
                  <Button 
                    onClick={() => { handleAuthClick('signin'); setIsOpen(false); }}
                    variant="outline" 
                    size="sm" 
                    className="w-full mx-3 border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => { handleAuthClick('signup'); setIsOpen(false); }}
                    size="sm" 
                    className="w-full mx-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
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
