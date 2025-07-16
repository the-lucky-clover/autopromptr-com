
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { X, Shield, BarChart3, Target, User, ChevronDown, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    essential: true,
    analytics: false,
    marketing: false,
    personalization: false
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

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const cookieCategories = [
    {
      id: 'essential',
      title: 'Strictly Necessary Cookies',
      icon: Shield,
      description: 'These cookies are essential for the website to function properly and cannot be disabled. They enable core functionality such as security, network management, and accessibility. Without these cookies, services you have asked for cannot be provided.',
      examples: ['Authentication tokens', 'Security settings', 'Session management', 'Load balancing'],
      vendors: ['AutoPromptr Core'],
      required: true,
      note: 'This preference is always active'
    },
    {
      id: 'analytics',
      title: 'Performance & Analytics Cookies',
      icon: BarChart3,
      description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They allow us to count visits and traffic sources so we can measure and improve the performance of our site.',
      examples: ['Page views and user journeys', 'Site performance metrics', 'Error reporting', 'Usage statistics'],
      vendors: ['Google Analytics', 'Supabase Analytics'],
      required: false
    },
    {
      id: 'marketing',
      title: 'Targeting & Advertising Cookies',
      icon: Target,
      description: 'These cookies track your online activity to help advertisers deliver more relevant advertising or to limit how many times you see an ad. They may be used by advertising partners to build a profile of your interests.',
      examples: ['Ad targeting and personalization', 'Conversion tracking', 'Social media integration', 'Retargeting campaigns'],
      vendors: ['Meta Pixel', 'Google Ads', 'LinkedIn Insight'],
      required: false
    },
    {
      id: 'personalization',
      title: 'Functional & Personalization Cookies',
      icon: User,
      description: 'These cookies enable enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages to remember your preferences and choices.',
      examples: ['User preferences and settings', 'Theme and language selection', 'Dashboard customizations', 'Saved configurations'],
      vendors: ['AutoPromptr Personalization Engine'],
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
              Privacy Preference Center
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="text-gray-300 text-sm mb-6 leading-relaxed">
          When you visit our website, we may collect information about you, your preferences, or your device. 
          This information is primarily used to make the site work as you expect it to. We respect your privacy 
          and give you control over your data preferences below.
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-2">
          {cookieCategories.map((category) => {
            const IconComponent = category.icon;
            const isEnabled = consent[category.id as keyof Omit<CookieConsent, 'timestamp'>];
            const isOpen = openSections[category.id];
            
            return (
              <div key={category.id} className="bg-white/5 rounded-lg border border-white/10">
                <Collapsible open={isOpen} onOpenChange={() => toggleSection(category.id)}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                        {category.required && (
                          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                            Always Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
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
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    
                    {category.note && (
                      <p className="text-xs text-purple-300 mb-2">{category.note}</p>
                    )}
                    
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  <CollapsibleContent className="px-4 pb-4">
                    <div className="grid md:grid-cols-2 gap-4 text-xs border-t border-white/10 pt-4">
                      <div>
                        <h4 className="text-gray-200 font-medium mb-2">What we collect:</h4>
                        <ul className="text-gray-400 space-y-1">
                          {category.examples.map((example, idx) => (
                            <li key={idx}>• {example}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-gray-200 font-medium mb-2">Service providers:</h4>
                        <ul className="text-gray-400 space-y-1">
                          {category.vendors.map((vendor, idx) => (
                            <li key={idx}>• {vendor}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </div>

        {/* Footer buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
          <Button onClick={handleAcceptAll} className="bg-purple-600 hover:bg-purple-700 text-white flex-1">
            Accept All Cookies
          </Button>
          <Button onClick={handleRejectAll} variant="outline" className="border-white/30 text-white hover:bg-white/10 flex-1">
            Reject Non-Essential
          </Button>
          <Button onClick={handleSave} variant="secondary" className="bg-white/10 text-white hover:bg-white/20 flex-1">
            Save My Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
