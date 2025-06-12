
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
  LucideIcon
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import BrandLogo from "@/components/BrandLogo";
import UserProfile from "@/components/UserProfile";

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
    <Sidebar className="bg-white/5 backdrop-blur-sm border-white/10">
      <SidebarHeader className="p-4 border-b border-white/10">
        <div className="flex justify-center">
          <BrandLogo size="small" variant="horizontal" />
        </div>
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
                      className={`text-white hover:bg-white/20 data-[state=open]:bg-white/20 transition-all duration-200 ${
                        isActive ? 'bg-gradient-to-r from-blue-600/50 to-purple-600/50 backdrop-blur-sm border border-blue-400/30 shadow-lg rounded-lg' : 'rounded-lg'
                      }`}
                    >
                      <Link to={item.url}>
                        <IconComponent className="h-4 w-4" />
                        <span className={isActive ? 'font-medium text-white' : ''}>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isSysOp && (
          <SidebarGroup>
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
                        className={`text-white hover:bg-white/20 data-[state=open]:bg-white/20 transition-all duration-200 ${
                          isActive ? 'bg-gradient-to-r from-blue-600/50 to-purple-600/50 backdrop-blur-sm border border-blue-400/30 shadow-lg rounded-lg' : 'rounded-lg'
                        }`}
                      >
                        <Link to={item.url}>
                          <IconComponent className="h-4 w-4" />
                          <span className={isActive ? 'font-medium text-white' : ''}>{item.title}</span>
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
