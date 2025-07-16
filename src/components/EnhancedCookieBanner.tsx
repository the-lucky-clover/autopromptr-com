
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie, Settings } from 'lucide-react';
import { PrivacyCenterModal } from './PrivacyCenterModal';

interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  timestamp: number;
}

const EnhancedCookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPrivacyCenter, setShowPrivacyCenter] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('enhanced-cookie-consent');
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
        acceptAllCookies();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const acceptAllCookies = () => {
    const consent: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true,
      timestamp: Date.now()
    };
    localStorage.setItem('enhanced-cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const rejectAllCookies = () => {
    const consent: CookieConsent = {
      essential: true, // Essential cookies cannot be rejected
      analytics: false,
      marketing: false,
      personalization: false,
      timestamp: Date.now()
    };
    localStorage.setItem('enhanced-cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const handlePrivacyCenterSave = (consent: CookieConsent) => {
    localStorage.setItem('enhanced-cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
    setShowPrivacyCenter(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 w-full">
        <div 
          className="glass-cookie-banner text-white relative w-full px-6 py-6"
          style={{
            backgroundColor: '#0a0e17',
            background: 'linear-gradient(135deg, rgba(10, 14, 23, 1.0) 0%, rgba(15, 20, 35, 0.98) 50%, rgba(30, 27, 75, 0.95) 100%)',
            backdropFilter: 'blur(25px) saturate(180%) brightness(95%)',
            WebkitBackdropFilter: 'blur(25px) saturate(180%) brightness(95%)',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.6), 0 -2px 16px rgba(139, 92, 246, 0.1)',
          }}
        >
          {/* Close button positioned absolutely in upper right */}
          <Button 
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 w-8 h-8 p-0 z-10"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="max-w-7xl mx-auto">
            {/* Main content layout */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-6 pr-12">
              {/* Content section */}
              <div className="flex-1 lg:flex-[2]">
                <div className="flex items-start gap-4">
                  <Cookie className="w-8 h-8 text-purple-300 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-3 text-white">We Value Your Privacy</h3>
                    <p className="text-gray-200 text-sm leading-relaxed mb-4">
                      AutoPromptr uses cookies and similar technologies to enhance your experience, analyze site usage, 
                      and assist with our marketing efforts. We work with trusted partners who may also use these 
                      technologies in connection with our services.
                    </p>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      By clicking "Accept All", you consent to our use of cookies for essential site functions, 
                      analytics, personalization, and marketing. You can customize your preferences in our Privacy Center 
                      or reject non-essential cookies. Your choices can be updated anytime.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Buttons section - Swapped order: Reject All, Privacy Center, Accept All */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:flex-shrink-0 lg:ml-8 lg:min-w-[200px]">
                <Button 
                  onClick={acceptAllCookies}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 font-semibold"
                >
                  Accept All
                </Button>
                
                <Button 
                  onClick={() => setShowPrivacyCenter(true)}
                  variant="outline"
                  size="sm"
                  className="border-purple-400/50 text-purple-200 hover:bg-purple-500/20 hover:border-purple-300 backdrop-blur-sm transition-all duration-300 px-6 py-3 font-medium flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Privacy Center
                </Button>
                
                <Button 
                  onClick={rejectAllCookies}
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 px-6 py-3 font-medium"
                >
                  Reject Non-Essential
                </Button>
              </div>
            </div>

            {/* Legal links */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                <a href="/privacy-policy" className="hover:text-purple-300 transition-colors underline">
                  Privacy Policy
                </a>
                <a href="/cookie-policy" className="hover:text-purple-300 transition-colors underline">
                  Cookie Policy
                </a>
                <a href="/terms-of-service" className="hover:text-purple-300 transition-colors underline">
                  Terms of Service
                </a>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">
                  MIT Licensed Open Source
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Center Modal */}
      <PrivacyCenterModal 
        isOpen={showPrivacyCenter}
        onClose={() => setShowPrivacyCenter(false)}
        onSave={handlePrivacyCenterSave}
      />
    </>
  );
};

export default EnhancedCookieBanner;
