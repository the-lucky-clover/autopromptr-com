
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
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-cookie-banner text-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-start gap-4">
            <Cookie className="w-6 h-6 text-purple-300 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 text-white">Cookie Notice</h3>
              <p className="text-gray-200 text-sm mb-4 leading-relaxed">
                We use essential cookies to ensure our website works properly and analytical cookies to improve your experience. 
                By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or decline non-essential cookies.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={acceptCookies}
                  className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Accept All
                </Button>
                <Button 
                  onClick={declineCookies}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300"
                >
                  Decline Non-Essential
                </Button>
                <Button 
                  onClick={() => setIsVisible(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-white/10 ml-auto transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
