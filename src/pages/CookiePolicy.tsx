
import { ArrowLeft, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CookiePolicy = () => {
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
            <div className="flex items-center gap-3 mb-8">
              <Cookie className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Cookie Policy</h1>
            </div>
            
            <div className="prose prose-invert prose-purple max-w-none text-gray-200 space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">What Are Cookies</h2>
                <p>
                  Cookies are small text files that are stored on your computer or mobile device when you visit a website. 
                  They allow the website to recognize your device and store some information about your preferences or past actions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">How We Use Cookies</h2>
                <p>AutoPromptr uses cookies for several purposes:</p>
                
                <div className="space-y-4 mt-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">Essential Cookies</h3>
                    <p className="text-sm">
                      These cookies are necessary for the website to function properly. They enable core functionality 
                      such as security, network management, and accessibility.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-blue-300 mb-2">Analytics Cookies</h3>
                    <p className="text-sm">
                      We use analytics cookies to understand how visitors interact with our website, helping us improve 
                      the user experience and optimize our AI prompt automation tools.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-green-300 mb-2">Personalization Cookies</h3>
                    <p className="text-sm">
                      These cookies remember your preferences and settings to provide a personalized experience 
                      when you return to AutoPromptr.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-red-300 mb-2">Marketing Cookies</h3>
                    <p className="text-sm">
                      Marketing cookies track your online activity to help deliver more relevant advertising 
                      and measure the effectiveness of our marketing campaigns.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Managing Your Cookie Preferences</h2>
                <p>
                  You can control and manage cookies in various ways. Please note that removing or blocking cookies 
                  can impact your user experience and parts of our website may no longer be fully accessible.
                </p>
                <p className="mt-4">
                  Most web browsers allow some control of cookies through the browser settings. You can also use our 
                  Privacy Center to customize your cookie preferences specifically for AutoPromptr.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Cookies</h2>
                <p>
                  AutoPromptr may use third-party services that set cookies on your device. These include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>Google Analytics for website analytics</li>
                  <li>Supabase for authentication and data storage</li>
                  <li>Social media platforms for sharing functionality</li>
                  <li>AI service providers for prompt processing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Updates to This Policy</h2>
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other 
                  operational, legal, or regulatory reasons. We will notify you of any material changes by posting the 
                  new policy on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
                <p>
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us at 
                  privacy@autopromptr.com.
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

export default CookiePolicy;
