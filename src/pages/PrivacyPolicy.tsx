
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-900 via-blue-900 to-purple-600">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => navigate(-1)}
            variant="ghost" 
            className="text-white hover:bg-white/10 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
            
            <div className="prose prose-invert prose-purple max-w-none text-gray-200 space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
                <p>
                  AutoPromptr collects information you provide directly to us, such as when you create an account, 
                  use our services, or contact us for support. This includes your email address, account preferences, 
                  and usage data related to your AI prompt automation activities.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, maintain, and improve our AI prompt automation services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices, updates, and security alerts</li>
                  <li>Respond to your comments and questions</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Data Security</h2>
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction. Your data is 
                  encrypted in transit and at rest using industry-standard protocols.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Services</h2>
                <p>
                  AutoPromptr integrates with various AI platforms and services to provide our automation capabilities. 
                  We may share necessary data with these services to fulfill your requests, but we do not sell your 
                  personal information to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">MIT License & Open Source</h2>
                <p>
                  This project is released under the MIT License, making it freely available for use, modification, 
                  and distribution. While the code is open source, user data and privacy are still protected under 
                  this privacy policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at privacy@autopromptr.com 
                  or through our support channels.
                </p>
              </section>

              <div className="text-sm text-gray-400 mt-8 pt-4 border-t border-white/20">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
