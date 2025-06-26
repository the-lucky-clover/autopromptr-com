
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  // Keyboard event handling
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisible(false);
      } else if (event.key === 'Enter') {
        // Enter key accepts all cookies (default action)
        acceptCookies();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full">
      <div 
        className="glass-cookie-banner text-white relative w-full"
        style={{
          backgroundColor: '#0a0e17',
          background: 'linear-gradient(135deg, rgba(10, 14, 23, 1.0) 0%, rgba(15, 20, 35, 0.98) 50%, rgba(30, 27, 75, 0.95) 100%)',
          backdropFilter: 'blur(25px) saturate(180%) brightness(95%)',
          WebkitBackdropFilter: 'blur(25px) saturate(180%) brightness(95%)',
          height: '80px'
        }}
      >
        {/* Close button positioned absolutely in upper right */}
        <Button 
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-4 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 w-8 h-8 p-0 z-10"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="container mx-auto px-6 py-3 h-full">
          {/* Mobile layout: text on top, icon and buttons below */}
          <div className="md:hidden flex flex-col h-full">
            {/* Text section - full width horizontal */}
            <div className="w-full mb-2">
              <h3 className="text-sm font-semibold mb-1 text-white">Cookie Notice</h3>
              <p className="text-gray-200 text-xs leading-relaxed">
                Intelligently batch process, enhance, and deploy prompts across all major AI coding platforms, local or remote.
              </p>
            </div>
            
            {/* Icon and buttons section */}
            <div className="flex items-center justify-between">
              <Cookie className="w-5 h-5 text-purple-300 flex-shrink-0" />
              <div className="flex gap-3 ml-4">
                <Button 
                  onClick={acceptCookies}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-xs px-3 py-1"
                >
                  Accept All
                </Button>
                <Button 
                  onClick={declineCookies}
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300 text-xs px-3 py-1"
                >
                  Decline
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop layout: original horizontal layout */}
          <div className="hidden md:flex items-center gap-4 h-full">
            <Cookie className="w-5 h-5 text-purple-300 flex-shrink-0" />
            <div className="flex-1 pr-12">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1 text-white">Cookie Notice</h3>
                  <p className="text-gray-200 text-xs leading-relaxed">
                    Intelligently batch process, enhance, and deploy prompts across all major AI coding platforms, local or remote.
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <Button 
                    onClick={acceptCookies}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-xs px-3 py-1"
                  >
                    Accept All
                  </Button>
                  <Button 
                    onClick={declineCookies}
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300 text-xs px-3 py-1"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
