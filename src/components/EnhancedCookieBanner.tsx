import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function EnhancedCookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay to allow page to fully load before showing banner
      setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`
        fixed bottom-4 left-4 right-4 md:left-6 md:right-6 z-50 
        transition-all duration-500 ease-out
        ${isAnimating ? 'animate-slide-up opacity-100' : 'translate-y-full opacity-0'}
      `}
    >
      <div className="skeumorphic-glass glass-cookie-banner border border-primary/20 p-4 md:p-6 max-w-md mx-auto md:max-w-2xl shimmer-rare rounded-2xl">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-start gap-3">
          <Cookie className="h-6 w-6 text-primary mt-1 animate-glow-pulse" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2 animate-fade-in skeumorphic-text">
              We use cookies
            </h3>
            <p className="text-sm text-muted-foreground mb-4 animate-fade-in delay-100">
              We use cookies to enhance your experience, analyze site traffic, and personalize content. 
              Your privacy matters to us.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleAccept}
                size="sm" 
                className="skeumorphic-button animate-scale-in delay-200 shimmer-45-rare"
              >
                Accept All
              </Button>
              <Button 
                onClick={handleReject}
                variant="outline" 
                size="sm"
                className="animate-scale-in delay-300 border-primary/30 bg-card/20 hover:bg-card/40"
              >
                Reject All
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="animate-scale-in delay-400 hover:bg-card/30"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="skeumorphic-glass max-w-md shimmer-staggered">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 skeumorphic-text">
                      <Settings className="h-5 w-5" />
                      Cookie Preferences
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium skeumorphic-text">Essential Cookies</h4>
                      <p className="text-sm text-muted-foreground">Required for basic site functionality</p>
                    </div>
                    <div>
                      <h4 className="font-medium skeumorphic-text">Analytics Cookies</h4>
                      <p className="text-sm text-muted-foreground">Help us understand how you use our site</p>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAccept} size="sm" className="flex-1 skeumorphic-button">
                        Accept All
                      </Button>
                      <Button onClick={handleReject} variant="outline" size="sm" className="flex-1 border-primary/30">
                        Reject All
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}