
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, Zap, FileText, BarChart3, Camera, Settings, Mail } from 'lucide-react';
import ZapBrandLogo from '@/components/ZapBrandLogo';
import { Button } from '@/components/ui/button';

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Automation", url: "/dashboard/automation", icon: Zap },
  { title: "Extractor", url: "/dashboard/extractor", icon: FileText },
  { title: "Results", url: "/dashboard/results", icon: BarChart3 },
  { title: "Screenshots", url: "/screenshots", icon: Camera },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Contact", url: "/contact", icon: Mail },
];

const MobileDashboardNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Mobile Navbar - only visible on mobile */}
      <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 relative z-50">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <ZapBrandLogo size="small" variant="horizontal" />
          </Link>
          
          {/* Hamburger Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="text-gray-300 hover:text-white hover:bg-gray-800 p-2"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={closeMenu}
          />
          <div className="md:hidden fixed top-16 right-0 w-80 h-full bg-gray-900 border-l border-gray-800 z-50 transform transition-transform duration-300">
            <div className="p-6">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-base font-medium">{item.title}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileDashboardNavbar;
