
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { X, Shield, BarChart3, Target, User, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  timestamp: number;
}

interface PrivacyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (consent: CookieConsent) => void;
}

export const PrivacyCenterModal = ({ isOpen, onClose, onSave }: PrivacyCenterModalProps) => {
  const [consent, setConsent] = useState<CookieConsent>({
    essential: true,
    analytics: false,
    marketing: false,
    personalization: false,
    timestamp: Date.now()
  });

  useEffect(() => {
    if (isOpen) {
      // Load existing consent if available
      const existingConsent = localStorage.getItem('enhanced-cookie-consent');
      if (existingConsent) {
        try {
          const parsed = JSON.parse(existingConsent);
          setConsent(parsed);
        } catch (e) {
          console.warn('Failed to parse existing consent');
        }
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave({ ...consent, timestamp: Date.now() });
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true,
      timestamp: Date.now()
    };
    setConsent(allAccepted);
    onSave(allAccepted);
  };

  const handleRejectAll = () => {
    const allRejected = {
      essential: true, // Essential cannot be rejected
      analytics: false,
      marketing: false,
      personalization: false,
      timestamp: Date.now()
    };
    setConsent(allRejected);
    onSave(allRejected);
  };

  const cookieCategories = [
    {
      id: 'essential',
      title: 'Essential Cookies',
      icon: Shield,
      description: 'These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you which amount to a request for services.',
      examples: ['Authentication tokens', 'Security settings', 'Session management'],
      vendors: ['AutoPromptr Core'],
      required: true
    },
    {
      id: 'analytics',
      title: 'Analytics & Performance',
      icon: BarChart3,
      description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      examples: ['Page views', 'Click tracking', 'Performance metrics'],
      vendors: ['Google Analytics', 'Supabase Analytics'],
      required: false
    },
    {
      id: 'marketing',
      title: 'Marketing & Advertising',
      icon: Target,
      description: 'These cookies track your online activity to help advertisers deliver more relevant advertising or to limit how many times you see an ad.',
      examples: ['Ad targeting', 'Conversion tracking', 'Social media integration'],
      vendors: ['Facebook Pixel', 'Google Ads'],
      required: false
    },
    {
      id: 'personalization',
      title: 'Personalization',
      icon: User,
      description: 'These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.',
      examples: ['User preferences', 'Theme settings', 'Language selection'],
      vendors: ['AutoPromptr Personalization'],
      required: false
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 border border-white/20">
        <DialogHeader className="pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-6 h-6 text-purple-400" />
              Privacy Center
            </DialogTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="cookies" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="cookies" className="text-white data-[state=active]:bg-purple-600">
              Cookie Settings
            </TabsTrigger>
            <TabsTrigger value="rights" className="text-white data-[state=active]:bg-purple-600">
              Your Rights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cookies" className="mt-6 space-y-6 overflow-y-auto max-h-[60vh] pr-2">
            <div className="space-y-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                Manage your cookie preferences below. You can enable or disable different types of cookies. 
                Note that disabling some types of cookies may impact your experience of the site and the services we are able to offer.
              </p>

              {cookieCategories.map((category) => {
                const IconComponent = category.icon;
                const isEnabled = consent[category.id as keyof Omit<CookieConsent, 'timestamp'>];
                
                return (
                  <div key={category.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                        {category.required && (
                          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => {
                          if (!category.required) {
                            setConsent(prev => ({
                              ...prev,
                              [category.id]: checked
                            }));
                          }
                        }}
                        disabled={category.required}
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {category.description}
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <h4 className="text-gray-200 font-medium mb-2">Examples:</h4>
                        <ul className="text-gray-400 space-y-1">
                          {category.examples.map((example, idx) => (
                            <li key={idx}>• {example}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-gray-200 font-medium mb-2">Vendors:</h4>
                        <ul className="text-gray-400 space-y-1">
                          {category.vendors.map((vendor, idx) => (
                            <li key={idx}>• {vendor}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="rights" className="mt-6 space-y-6 overflow-y-auto max-h-[60vh] pr-2">
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Your Privacy Rights</h3>
                </div>
                
                <div className="space-y-4 text-sm text-gray-300">
                  <div>
                    <h4 className="text-white font-medium mb-2">Right to Access</h4>
                    <p>You have the right to request copies of your personal data.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Right to Rectification</h4>
                    <p>You have the right to request that we correct any information you believe is inaccurate.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Right to Erasure</h4>
                    <p>You have the right to request that we erase your personal data, under certain conditions.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Right to Data Portability</h4>
                    <p>You have the right to request that we transfer the data that we have collected to another organization.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
                <p className="text-gray-300 text-sm mb-4">
                  If you have any questions about your privacy rights or this Privacy Center, please contact us:
                </p>
                <div className="text-sm text-gray-400">
                  <p>Email: privacy@autopromptr.com</p>
                  <p>Address: Privacy Officer, AutoPromptr, MIT Licensed Open Source Project</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
          <Button onClick={handleAcceptAll} className="bg-purple-600 hover:bg-purple-700 text-white flex-1">
            Accept All
          </Button>
          <Button onClick={handleRejectAll} variant="outline" className="border-white/30 text-white hover:bg-white/10 flex-1">
            Reject All
          </Button>
          <Button onClick={handleSave} variant="secondary" className="bg-white/10 text-white hover:bg-white/20 flex-1">
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
