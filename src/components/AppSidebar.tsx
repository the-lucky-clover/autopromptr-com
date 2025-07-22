
import { Home, Zap, FileText, BarChart3, Camera, Settings, Mail, Shield, Users, Database } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import ZapBrandLogo from "@/components/ZapBrandLogo"
import EnhancedUserProfile from "@/components/EnhancedUserProfile"
import { useUserRole } from "@/hooks/useUserRole"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Automation",
    url: "/dashboard/automation",
    icon: Zap,
  },
  {
    title: "Extractor",
    url: "/dashboard/extractor",
    icon: FileText,
  },
  {
    title: "Results",
    url: "/dashboard/results",
    icon: BarChart3,
  },
  {
    title: "Screenshots",
    url: "/screenshots",
    icon: Camera,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Contact",
    url: "/contact",
    icon: Mail,
  },
]

// Admin menu items (only visible to super users)
const adminItems = [
  {
    title: "Admin Panel",
    url: "/admin",
    icon: Shield,
  },
  {
    title: "User Management",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "System Logs",
    url: "/admin/logs",
    icon: Database,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { role, isSysOp } = useUserRole()

  return (
    <Sidebar className="bg-gray-900 border-gray-800 w-64">{/* Reduced from w-80 to w-64 */}
      <SidebarHeader className="p-4 border-b border-gray-800">
        <Link to="/" className="flex items-center justify-center">
          <ZapBrandLogo size="small" variant="horizontal" id="sidebar-logo" />
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 uppercase text-xs font-semibold tracking-wider px-3 py-1.5">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-0">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-gray-800 data-[active=true]:text-white h-9 text-sm font-medium px-2.5 py-1.5 rounded-md transition-all duration-200"
                  >
                    <Link to={item.url} className="flex items-center gap-2.5">
                      <item.icon className="h-4 w-4" strokeWidth={1.5} />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Menu - Only visible to super users */}
        {isSysOp && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-orange-400 uppercase text-xs font-semibold tracking-wider px-3 py-1.5">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="px-2 space-y-0">
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={location.pathname === item.url}
                      className="text-orange-300 hover:text-orange-100 hover:bg-orange-900/30 data-[active=true]:bg-orange-900/50 data-[active=true]:text-orange-100 h-9 text-sm font-medium px-2.5 py-1.5 rounded-md transition-all duration-200"
                    >
                      <Link to={item.url} className="flex items-center gap-2.5">
                        <item.icon className="h-4 w-4" strokeWidth={1.5} />
                        <span className="text-sm font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-800 p-4">
        <div className="flex items-center justify-center">
          <EnhancedUserProfile />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
