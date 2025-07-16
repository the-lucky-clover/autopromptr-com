
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import { useLegalModals } from "./LegalModals";

const Footer = () => {
  const { openPrivacyPolicy, openTermsOfService, openCookiePolicy, LegalModals } = useLegalModals();

  return (
    <>
      <footer className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">AutoPromptr</h3>
              <p className="text-gray-300 text-sm">
                Streamline your AI workflow with intelligent batch processing and automation tools.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-purple-300 transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-purple-300 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-purple-300 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-purple-300 transition-colors">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/screenshots" className="hover:text-white transition-colors">Screenshots</a></li>
                <li><a href="/results" className="hover:text-white transition-colors">Results</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <button 
                    onClick={openPrivacyPolicy}
                    className="hover:text-white transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={openTermsOfService}
                    className="hover:text-white transition-colors text-left"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    onClick={openCookiePolicy}
                    className="hover:text-white transition-colors text-left"
                  >
                    Cookie Policy
                  </button>
                </li>
                <li><a href="#" className="hover:text-white transition-colors">MIT License</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-12 pt-8 text-center text-gray-300">
            <p>&copy; 2024 AutoPromptr. All rights reserved. Open source under MIT License.</p>
          </div>
        </div>
      </footer>
      
      <LegalModals />
    </>
  );
};

export default Footer;
