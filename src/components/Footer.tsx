
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import { useLegalModals } from "./LegalModals";
import PsychedelicBrandLogo from "./PsychedelicBrandLogo";

const Footer = () => {
  const { openPrivacyPolicy, openTermsOfService, openCookiePolicy, LegalModals } = useLegalModals();

  return (
    <>
      <footer className="
        bg-gradient-psychedelic 
        animate-psychedelic-flow 
        text-foreground 
        py-16 
        relative 
        overflow-hidden
        w-full
      ">
        {/* Glowing overlay */}
        <div className="absolute inset-0 bg-card/60 backdrop-blur-sm"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <PsychedelicBrandLogo size="small" variant="horizontal" id="footer-logo" animate={true} />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Streamline your AI workflow with intelligent batch processing and automation tools.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="
                  hover:text-primary 
                  smooth-transition 
                  hover:shadow-glow-sm 
                  rounded-full p-2
                  hover:bg-primary/10
                ">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="
                  hover:text-primary 
                  smooth-transition 
                  hover:shadow-glow-sm 
                  rounded-full p-2
                  hover:bg-primary/10
                ">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="
                  hover:text-primary 
                  smooth-transition 
                  hover:shadow-glow-sm 
                  rounded-full p-2
                  hover:bg-primary/10
                ">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="
                  hover:text-primary 
                  smooth-transition 
                  hover:shadow-glow-sm 
                  rounded-full p-2
                  hover:bg-primary/10
                ">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-primary glow-effect">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground smooth-transition hover:glow-effect">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground smooth-transition hover:glow-effect">Pricing</a></li>
                <li><a href="/screenshots" className="hover:text-foreground smooth-transition hover:glow-effect">Screenshots</a></li>
                <li><a href="/results" className="hover:text-foreground smooth-transition hover:glow-effect">Results</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-primary glow-effect">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="/blog" className="hover:text-foreground smooth-transition hover:glow-effect">Blog</a></li>
                <li><a href="/contact" className="hover:text-foreground smooth-transition hover:glow-effect">Contact</a></li>
                <li><a href="#" className="hover:text-foreground smooth-transition hover:glow-effect">About</a></li>
                <li><a href="#" className="hover:text-foreground smooth-transition hover:glow-effect">Careers</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-primary glow-effect">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <button 
                    onClick={openPrivacyPolicy}
                    className="hover:text-foreground smooth-transition text-left hover:glow-effect"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={openTermsOfService}
                    className="hover:text-foreground smooth-transition text-left hover:glow-effect"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    onClick={openCookiePolicy}
                    className="hover:text-foreground smooth-transition text-left hover:glow-effect"
                  >
                    Cookie Policy
                  </button>
                </li>
                <li><a href="#" className="hover:text-foreground smooth-transition hover:glow-effect">MIT License</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/30 mt-12 pt-8 text-center text-muted-foreground">
            <p className="animate-glow-pulse">
              &copy; 2024 AutoPromptr. All rights reserved. 
              <span className="text-primary ml-2">Open source under MIT License.</span>
            </p>
          </div>
        </div>
      </footer>
      
      <LegalModals />
    </>
  );
};

export default Footer;
