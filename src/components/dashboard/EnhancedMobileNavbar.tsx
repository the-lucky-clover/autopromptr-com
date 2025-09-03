import { useState } from 'react';
import { Menu, X, Home, Zap, FileText, BarChart3, Camera, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import ZapBrandLogo from "@/components/ZapBrandLogo";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Automation", url: "/dashboard/automation", icon: Zap },
  { title: "Extractor", url: "/dashboard/extractor", icon: FileText },
  { title: "Results", url: "/dashboard/results", icon: BarChart3 },
  { title: "Screenshots", url: "/screenshots", icon: Camera },
  { title: "Settings", url: "/settings", icon: Settings },
];

const EnhancedMobileNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Fixed Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-purple-900/80 to-gray-900 backdrop-blur-xl border-b border-purple-500/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="hover-lift">
            <ZapBrandLogo size="small" variant="horizontal" />
          </Link>
          
          <Button
            onClick={toggleMenu}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-purple-600/20 hover:text-purple-200 p-2 rounded-xl press-effect magnetic-hover"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 icon-bounce" />
            ) : (
              <Menu className="h-6 w-6 icon-bounce" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={closeMenu}
        >
          <div 
            className="fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-gray-900 via-purple-900/30 to-gray-900 border-l border-purple-500/30 shadow-2xl animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 pt-20">
              <div className="space-y-3">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url;
                  
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={closeMenu}
                      className={`
                        flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group hover-lift press-effect
                        ${isActive 
                          ? 'bg-gradient-to-r from-purple-600/40 to-blue-600/40 text-white shadow-lg' 
                          : 'text-gray-300 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 hover:text-white'
                        }
                        stagger-fade-in
                      `}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Icon className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-lg font-semibold">{item.title}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Menu Footer */}
              <div className="mt-8 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-500/30">
                <p className="text-purple-300 text-sm font-medium mb-2">🚀 AutoPromptr</p>
                <p className="text-gray-400 text-xs">AI-powered prompt automation at your fingertips</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="md:hidden h-16"></div>
    </>
  );
};

export default EnhancedMobileNavbar;