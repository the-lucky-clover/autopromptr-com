
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Home, Settings, LogOut, UserCog, Upload, Package } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BrandLogo from "@/components/BrandLogo";

const AppSidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isSysOp } = useUserRole();

  const baseMenuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Batches",
      url: "/dashboard/batches",
      icon: Package,
    },
    {
      title: "Upload/Import",
      url: "/dashboard/upload",
      icon: Upload,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  // Add Admin menu for SysOp users
  const menuItems = isSysOp 
    ? [
        ...baseMenuItems.slice(0, -1), // Insert before Settings
        {
          title: "Admin",
          url: "/dashboard/admin",
          icon: () => <span className="w-4 h-4 text-red-400 font-bold">∞</span>,
        },
        baseMenuItems[baseMenuItems.length - 1], // Settings at the end
      ]
    : baseMenuItems;

  const handleSignOut = async () => {
    await signOut();
  };

  // Get the first letter of the email for the avatar
  const getAvatarLetter = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <Sidebar className="border-r border-gray-700 bg-gray-900">
      <SidebarHeader className="p-6 flex items-center justify-center">
        <Link to="/" className="flex items-center justify-center">
          <BrandLogo size="medium" variant="horizontal" />
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="hover:bg-gray-800 data-[active=true]:bg-blue-600 data-[active=true]:text-white text-gray-300 rounded-xl"
                  >
                    <Link to={item.url}>
                      {typeof item.icon === 'function' ? <item.icon /> : <item.icon className="w-4 h-4" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4 border-t border-gray-700">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-3 h-auto hover:bg-gray-800 rounded-xl"
              >
                <div className="flex items-center space-x-3 w-full">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                      {getAvatarLetter()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {isSysOp ? 'SysOp' : 'Online'}
                    </p>
                  </div>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-56 bg-gray-900/95 backdrop-blur-xl border-gray-700 rounded-xl mb-4 ml-4"
              align="start"
              side="top"
            >
              <div className="space-y-2 p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:bg-gray-800 rounded-xl"
                  onClick={() => {
                    // TODO: Navigate to profile page or open profile modal
                    console.log('Update profile clicked');
                  }}
                >
                  <UserCog className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:bg-red-400/20 hover:text-red-300 rounded-xl"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export { AppSidebar };
