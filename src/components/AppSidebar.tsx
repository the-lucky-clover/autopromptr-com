
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
  LucideIcon,
  MessageCircle,
  BookOpen,
  PlayCircle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import ZapBrandLogo from "@/components/ZapBrandLogo";
import UserProfile from "@/components/UserProfile";

const items: Array<{
  title: string;
  url: string;
  icon: LucideIcon;
}> = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Automation",
    url: "/dashboard/batch-processor",
    icon: PlayCircle,
  },
  {
    title: "Extractor",
    url: "/dashboard/batch-extractor",
    icon: Zap,
  },
  {
    title: "Screenshots",
    url: "/screenshots", 
    icon: Camera,
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
    <Sidebar className="bg-gray-900/60 backdrop-blur-sm border-white/10 shadow-2xl animate-shimmer">
      <SidebarHeader className="p-6 border-b border-white/10 animate-shimmer-delayed">
        <div className="flex justify-center items-center">
          <ZapBrandLogo size="small" variant="horizontal" className="items-center" showHoverAnimation={false} />
        </div>
      </SidebarHeader>

      <SidebarContent className="mt-8 px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {items.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      className={`text-white hover:bg-white/20 data-[state=open]:bg-white/20 transition-all duration-700 ease-out rounded-xl text-xl px-6 py-5 my-2 transform hover:scale-105 animate-shimmer ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-sm border border-blue-400/50 shadow-xl shadow-blue-500/30 scale-105 animate-shimmer-delayed' 
                          : 'hover:shadow-lg hover:shadow-purple-500/20'
                      }`}
                      style={{
                        transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <Link to={item.url} className="w-full">
                        <IconComponent className={`h-7 w-7 mr-5 transition-all duration-500 ${
                          isActive ? 'text-white drop-shadow-lg' : 'text-white/80'
                        }`} />
                        <span className={`text-xl font-medium transition-all duration-500 ${
                          isActive ? 'text-white drop-shadow-sm' : 'text-white/90'
                        }`}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isSysOp && (
          <SidebarGroup className="mt-8">
            <SidebarGroupContent>
              <SidebarMenu className="space-y-4">
                {adminItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        isActive={isActive}
                        className={`text-white hover:bg-white/20 data-[state=open]:bg-white/20 transition-all duration-700 ease-out rounded-xl text-xl px-6 py-5 my-2 transform hover:scale-105 animate-shimmer ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-sm border border-blue-400/50 shadow-xl shadow-blue-500/30 scale-105 animate-shimmer-delayed' 
                            : 'hover:shadow-lg hover:shadow-purple-500/20'
                        }`}
                        style={{
                          transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <Link to={item.url} className="w-full">
                          <IconComponent className={`h-7 w-7 mr-5 transition-all duration-500 ${
                            isActive ? 'text-white drop-shadow-lg' : 'text-white/80'
                          }`} />
                          <span className={`text-xl font-medium transition-all duration-500 ${
                            isActive ? 'text-white drop-shadow-sm' : 'text-white/90'
                          }`}>
                            {item.title}
                          </span>
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

      <SidebarFooter className="p-6 border-t border-white/10 animate-shimmer">
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
