
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto bg-gray-900/95 backdrop-blur-xl border-gray-700 text-white">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Cookie className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Cookie Notice</h3>
              <p className="text-gray-300 text-sm mb-4">
                We use essential cookies to ensure our website works properly and analytical cookies to improve your experience. 
                By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or decline non-essential cookies.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={acceptCookies}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Accept All
                </Button>
                <Button 
                  onClick={declineCookies}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Decline Non-Essential
                </Button>
                <Button 
                  onClick={() => setIsVisible(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white ml-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieBanner;
