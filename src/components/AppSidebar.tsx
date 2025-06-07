
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
import { Home, FileText, BarChart3, Settings, User, Zap, Upload, Package, LogOut, UserCog } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const menuItems = [
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
    title: "Batch Extractor",
    url: "/dashboard/extractor",
    icon: Zap,
  },
  {
    title: "Upload/Import",
    url: "/dashboard/upload",
    icon: Upload,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className="border-r border-gray-700 bg-gray-900">
      <SidebarHeader className="p-6 flex items-center justify-center">
        <Link to="/" className="flex items-center space-x-3 group justify-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AutoPromptr
          </span>
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
                      <item.icon className="w-4 h-4" />
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
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user?.email || 'user@example.com'}</p>
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
                  className="w-full justify-start text-gray-300 hover:bg-gray-800 rounded-lg"
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
                  className="w-full justify-start text-red-400 hover:bg-red-400/20 hover:text-red-300 rounded-lg"
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
}
