import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Settings } from 'lucide-react';
import { PrivacyCenterModal } from './PrivacyCenterModal';

interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  timestamp: number;
}

const CompactCookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPrivacyCenter, setShowPrivacyCenter] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('enhanced-cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

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
      essential: true,
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
      <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
        <div className="skeuomorphic-card bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-elegant relative">
          <Button 
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 w-6 h-6 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="flex items-start gap-3 mb-4 pr-6">
            {/* Photorealistic Cookie Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 shadow-inner relative overflow-hidden">
                {/* Cookie base */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/90 to-amber-900/90 rounded-full"></div>
                {/* Chocolate chips */}
                <div className="absolute top-2 left-2 w-2 h-2 bg-amber-900 rounded-full shadow-inner"></div>
                <div className="absolute top-6 left-7 w-1.5 h-1.5 bg-amber-800 rounded-full shadow-inner"></div>
                <div className="absolute top-3 right-2 w-1.5 h-1.5 bg-amber-900 rounded-full shadow-inner"></div>
                <div className="absolute bottom-2 left-4 w-2 h-2 bg-amber-800 rounded-full shadow-inner"></div>
                <div className="absolute bottom-3 right-3 w-1 h-1 bg-amber-900 rounded-full shadow-inner"></div>
                {/* Surface texture */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-400/20 to-amber-200/30 rounded-full"></div>
                {/* Highlight */}
                <div className="absolute top-1 left-2 w-3 h-1.5 bg-amber-200/60 rounded-full blur-sm"></div>
              </div>
              {/* Cookie crumbs */}
              <div className="absolute -bottom-1 -right-1 w-1 h-1 bg-amber-700 rounded-full opacity-70"></div>
              <div className="absolute -bottom-0.5 right-2 w-0.5 h-0.5 bg-amber-600 rounded-full opacity-60"></div>
              <div className="absolute bottom-0.5 -left-1 w-0.5 h-0.5 bg-amber-800 rounded-full opacity-50"></div>
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-sm text-foreground mb-1">We use cookies</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Essential for site functionality, with optional analytics and personalization.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={acceptAllCookies}
              size="sm"
              className="flex-1 h-8 text-xs font-medium skeuomorphic-button"
            >
              Accept
            </Button>
            <Button 
              onClick={() => setShowPrivacyCenter(true)}
              variant="outline"
              size="sm"
              className="h-8 px-2 skeuomorphic-button-outline"
            >
              <Settings className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      <PrivacyCenterModal 
        isOpen={showPrivacyCenter}
        onClose={() => setShowPrivacyCenter(false)}
        onSave={handlePrivacyCenterSave}
      />
    </>
  );
};

export default CompactCookieBanner;