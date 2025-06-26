
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
        className="glass-cookie-banner text-white relative w-full px-6 py-4"
        style={{
          backgroundColor: '#0a0e17',
          background: 'linear-gradient(135deg, rgba(10, 14, 23, 1.0) 0%, rgba(15, 20, 35, 0.98) 50%, rgba(30, 27, 75, 0.95) 100%)',
          backdropFilter: 'blur(25px) saturate(180%) brightness(95%)',
          WebkitBackdropFilter: 'blur(25px) saturate(180%) brightness(95%)',
          minHeight: '100px'
        }}
      >
        {/* Close button positioned absolutely in upper right */}
        <Button 
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="sm"
          className="absolute top-3 right-4 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 w-8 h-8 p-0 z-10"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="max-w-7xl mx-auto">
          {/* Horizontal layout: wider text on left, buttons on right */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 pr-12">
            {/* Text section - wider block taking more space */}
            <div className="flex-1 md:flex-[3]">
              <div className="flex items-start gap-3">
                <Cookie className="w-6 h-6 text-purple-300 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 text-white">Cookie Notice</h3>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    We use cookies to enhance your experience and analyze site usage. By continuing, you consent to our use of cookies.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Buttons section - positioned on right side with spacing */}
            <div className="flex gap-4 md:flex-shrink-0 md:ml-8">
              <Button 
                onClick={acceptCookies}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2"
              >
                Accept All
              </Button>
              <Button 
                onClick={declineCookies}
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300 px-6 py-2"
              >
                Decline Non Essential
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
