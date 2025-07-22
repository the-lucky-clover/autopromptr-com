
import { Home, Zap, FileText, BarChart3, Camera, Settings, Mail } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import ZapBrandLogo from "@/components/ZapBrandLogo"
import EnhancedUserProfile from "@/components/EnhancedUserProfile"

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

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar className="bg-gray-900 border-gray-800 w-80">
      <SidebarHeader className="p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center justify-center">
          <ZapBrandLogo size="medium" variant="horizontal" id="sidebar-logo" />
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
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-800 p-4">
        <div className="flex items-center justify-center">
          <EnhancedUserProfile />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
