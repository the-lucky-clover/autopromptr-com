
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, FileText, Shield, Cookie } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms' | 'cookies';
}

export const LegalModal = ({ isOpen, onClose, type }: LegalModalProps) => {
  const getIcon = () => {
    switch (type) {
      case 'privacy': return Shield;
      case 'terms': return FileText;
      case 'cookies': return Cookie;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'privacy': return 'Privacy Policy';
      case 'terms': return 'Terms of Service';
      case 'cookies': return 'Cookie Policy';
    }
  };

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return (
          <div className="space-y-6 text-gray-200">
            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Information We Collect</h3>
              <p className="text-sm leading-relaxed">
                AutoPromptr collects information you provide directly to us, such as when you create an account, 
                use our automation services, or contact us for support. This includes your email address, account preferences, 
                usage data, and AI prompt automation activities to provide you with the best possible experience.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">How We Use Your Information</h3>
              <p className="text-sm leading-relaxed mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                <li>Provide, maintain, and improve our AI prompt automation services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and security alerts</li>
                <li>Respond to your comments, questions, and provide customer support</li>
                <li>Analyze usage patterns to enhance user experience and service reliability</li>
                <li>Protect against fraudulent or unauthorized access</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Data Security & Protection</h3>
              <p className="text-sm leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction. Your data is 
                encrypted in transit and at rest using industry-standard protocols. We regularly review and update 
                our security practices to ensure the highest level of protection.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Third-Party Integrations</h3>
              <p className="text-sm leading-relaxed">
                AutoPromptr integrates with various AI platforms (such as OpenAI, Anthropic) and development tools 
                (like Lovable.dev, V0.dev) to provide our automation capabilities. We may share necessary data with 
                these services to fulfill your requests, but we do not sell your personal information to third parties. 
                All integrations are secured and monitored for compliance.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Your Rights & Choices</h3>
              <p className="text-sm leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                <li>Access, update, or delete your personal information</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of marketing communications</li>
                <li>Control cookie preferences through our Privacy Center</li>
                <li>Request information about how your data is used</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Contact Us</h3>
              <p className="text-sm leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at 
                privacy@autopromptr.com or through our support channels. We're committed to addressing your 
                concerns promptly and transparently.
              </p>
            </section>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-6 text-gray-200">
            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Acceptance of Terms</h3>
              <p className="text-sm leading-relaxed">
                By accessing and using AutoPromptr, you accept and agree to be bound by these Terms of Service. 
                These terms govern your use of our AI prompt automation platform and related services. If you 
                do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Service Description</h3>
              <p className="text-sm leading-relaxed">
                AutoPromptr is an AI prompt automation platform that enables users to batch process, enhance, 
                and deploy prompts across various AI coding platforms including Lovable.dev, V0.dev, and local 
                development environments. Our service includes web-based tools, API integrations, and automated 
                workflow capabilities designed to streamline your development process.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">User Responsibilities</h3>
              <p className="text-sm leading-relaxed mb-3">As a user of AutoPromptr, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                <li>Use the service in compliance with all applicable laws and regulations</li>
                <li>Maintain the security and confidentiality of your account credentials</li>
                <li>Not attempt to interfere with, disrupt, or reverse engineer the service</li>
                <li>Respect the intellectual property rights of others</li>
                <li>Use the service only for legitimate business and personal purposes</li>
                <li>Not engage in any activities that could harm our systems or other users</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Open Source & MIT License</h3>
              <p className="text-sm leading-relaxed">
                AutoPromptr is proudly released under the MIT License, making the source code freely available 
                for use, modification, and distribution. While the code is open source, our branding, 
                documentation, and proprietary enhancements remain protected by applicable intellectual property laws. 
                You're encouraged to contribute to the project and build upon our work within the terms of the MIT License.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Service Availability & Support</h3>
              <p className="text-sm leading-relaxed">
                While we strive to maintain high availability and reliability, AutoPromptr is provided "as is" 
                without warranties of any kind. We do not guarantee uninterrupted service and may experience 
                downtime for maintenance or due to factors beyond our control. We provide community support 
                through our open source channels and documentation.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Limitation of Liability</h3>
              <p className="text-sm leading-relaxed">
                To the maximum extent permitted by law, AutoPromptr and its contributors shall not be liable 
                for any indirect, incidental, special, consequential, or punitive damages, or any loss of 
                profits or revenues, whether incurred directly or indirectly. Our liability is limited to 
                the maximum extent allowed by applicable law.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Contact Information</h3>
              <p className="text-sm leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at 
                legal@autopromptr.com or through our community support channels. We're here to help 
                and clarify any concerns you may have.
              </p>
            </section>
          </div>
        );

      case 'cookies':
        return (
          <div className="space-y-6 text-gray-200">
            <section>
              <h3 className="text-lg font-semibold text-white mb-3">What Are Cookies</h3>
              <p className="text-sm leading-relaxed">
                Cookies are small text files that are stored on your computer or mobile device when you visit 
                our website. They allow the website to recognize your device and store information about your 
                preferences or past actions to enhance your experience and improve our services.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Types of Cookies We Use</h3>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 border border-purple-500/30">
                  <h4 className="text-purple-300 font-semibold mb-2">Strictly Necessary Cookies</h4>
                  <p className="text-sm leading-relaxed">
                    Essential for the website to function properly. These enable core functionality such as 
                    security, network management, authentication, and accessibility. They cannot be disabled.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-blue-500/30">
                  <h4 className="text-blue-300 font-semibold mb-2">Performance & Analytics Cookies</h4>
                  <p className="text-sm leading-relaxed">
                    Help us understand how visitors interact with our website by collecting and reporting 
                    information anonymously. This helps us improve the user experience and optimize our 
                    AI automation tools.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-green-500/30">
                  <h4 className="text-green-300 font-semibold mb-2">Functional & Personalization</h4>
                  <p className="text-sm leading-relaxed">
                    Remember your preferences and settings to provide a personalized experience when you 
                    return to AutoPromptr. These enhance functionality but are not essential for basic operation.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-red-500/30">
                  <h4 className="text-red-300 font-semibold mb-2">Marketing & Targeting Cookies</h4>
                  <p className="text-sm leading-relaxed">
                    Track your online activity to help deliver more relevant advertising and measure the 
                    effectiveness of our marketing campaigns. These are used by our advertising partners.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Managing Your Cookie Preferences</h3>
              <p className="text-sm leading-relaxed">
                You have full control over your cookie preferences. You can customize your settings using our 
                Privacy Center, which allows you to enable or disable different types of cookies based on your 
                preferences. You can also manage cookies through your browser settings, though this may impact 
                your experience on our site.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Third-Party Cookie Partners</h3>
              <p className="text-sm leading-relaxed mb-3">
                AutoPromptr works with trusted third-party services that may set cookies on your device:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                <li>Google Analytics for website analytics and performance monitoring</li>
                <li>Supabase for authentication and secure data storage</li>
                <li>Social media platforms for sharing and integration functionality</li>
                <li>AI service providers for enhanced prompt processing capabilities</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Updates to This Policy</h3>
              <p className="text-sm leading-relaxed">
                We may update this Cookie Policy periodically to reflect changes in our practices or for 
                other operational, legal, or regulatory reasons. We will notify you of any material changes 
                by updating the policy on this page and updating the "last modified" date.
              </p>
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  const Icon = getIcon();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 border border-white/20">
        <DialogHeader className="pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-purple-400" />
            <DialogTitle className="text-2xl font-bold text-white">{getTitle()}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] pr-2">
          {getContent()}
          
          <div className="text-xs text-gray-400 mt-8 pt-4 border-t border-white/20">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button onClick={onClose} variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook for managing legal modals
export const useLegalModals = () => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'cookies' | null>(null);

  const openPrivacyPolicy = () => setActiveModal('privacy');
  const openTermsOfService = () => setActiveModal('terms');
  const openCookiePolicy = () => setActiveModal('cookies');
  const closeModal = () => setActiveModal(null);

  const LegalModals = () => (
    <>
      {activeModal && (
        <LegalModal
          isOpen={true}
          onClose={closeModal}
          type={activeModal}
        />
      )}
    </>
  );

  return {
    openPrivacyPolicy,
    openTermsOfService,
    openCookiePolicy,
    LegalModals
  };
};
