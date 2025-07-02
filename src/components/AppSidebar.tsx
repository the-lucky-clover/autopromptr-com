
import { Home, Zap, FileText, BarChart3, Camera, Settings, Mail, LogOut, User } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import ZapBrandLogo from "@/components/ZapBrandLogo"

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
import { Button } from "@/components/ui/button"

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
  const { user, signOut } = useAuth()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      })
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out.",
        variant: "destructive",
      })
    }
  }

  return (
    <Sidebar className="bg-gray-900 border-gray-800">
      <SidebarHeader className="p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center justify-center">
          <ZapBrandLogo size="medium" variant="horizontal" id="sidebar-logo" />
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 uppercase text-xs font-semibold tracking-wider px-6 py-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-4 space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-gray-800 data-[active=true]:text-white h-12 text-base font-medium px-4 py-3 rounded-lg transition-all duration-200"
                  >
                    <Link to={item.url} className="flex items-center gap-4">
                      <item.icon className="h-6 w-6" strokeWidth={1.5} />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-800 p-4">
        {user && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <User className="h-5 w-5" />
              <span className="truncate font-medium">{user.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-md p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
