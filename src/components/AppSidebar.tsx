
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Settings, 
  Camera, 
  Zap,
  User,
  LucideIcon,
  MessageCircle,
  BookOpen
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import BrandLogo from "@/components/BrandLogo";
import UserProfile from "@/components/UserProfile";
import SynthwaveBackground from "@/components/SynthwaveBackground";
import SynthwaveBrandLogo from "@/components/SynthwaveBrandLogo";

// Navigation items with proper typing
const items: Array<{
  title: string;
  url: string;
  icon: LucideIcon;
}> = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Batch Extractor",
    url: "/dashboard/batch-extractor",
    icon: Zap,
  },
  {
    title: "Screenshots",
    url: "/screenshots", 
    icon: Camera,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Contact",
    url: "/dashboard/contact",
    icon: MessageCircle,
  },
  {
    title: "User Guide",
    url: "/dashboard/user-guide",
    icon: BookOpen,
  },
];

// Admin items with proper typing
const adminItems: Array<{
  title: string;
  url: string;
  icon: LucideIcon;
}> = [
  {
    title: "Admin",
    url: "/dashboard/admin",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { isSysOp } = useUserRole();

  return (
    <Sidebar className="bg-white/5 backdrop-blur-sm border-white/10 shadow-2xl">
      <SidebarHeader className="p-4 border-b border-white/10 relative">
        {/* Synthwave Background Container - positioned behind the brand area */}
        <div className="absolute left-0 top-0 w-full h-24 overflow-hidden rounded-t-2xl">
          <SynthwaveBackground />
        </div>
        
        {/* Brand Logo floating above the background */}
        <div className="relative z-30 flex justify-center">
          <SynthwaveBrandLogo size="small" variant="horizontal" />
        </div>
        
        {/* Subtle gradient overlay for better text readability */}
        <div className="absolute left-0 top-0 w-full h-24 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none z-20 rounded-t-2xl" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      className={`text-white hover:bg-white/20 data-[state=open]:bg-white/20 transition-all duration-200 rounded-lg ${
                        isActive ? 'bg-gradient-to-r from-blue-600/70 to-purple-600/70 backdrop-blur-sm border border-blue-400/40 shadow-lg shadow-blue-500/25' : ''
                      }`}
                    >
                      <Link to={item.url}>
                        <IconComponent className={`h-4 w-4 ${isActive ? 'text-white' : ''}`} />
                        <span className={`${isActive ? 'font-medium text-white' : ''}`}>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isSysOp && (
          <SidebarGroup className="mt-0">
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        isActive={isActive}
                        className={`text-white hover:bg-white/20 data-[state=open]:bg-white/20 transition-all duration-200 rounded-lg ${
                          isActive ? 'bg-gradient-to-r from-blue-600/70 to-purple-600/70 backdrop-blur-sm border border-blue-400/40 shadow-lg shadow-blue-500/25' : ''
                        }`}
                      >
                        <Link to={item.url}>
                          <IconComponent className={`h-4 w-4 ${isActive ? 'text-white' : ''}`} />
                          <span className={`${isActive ? 'font-medium text-white' : ''}`}>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/10">
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
