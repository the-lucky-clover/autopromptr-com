
import { Home, Zap, FileText, BarChart3, Camera, Settings, Mail, Shield, Users, Database } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import PsychedelicBrandLogo from "@/components/PsychedelicBrandLogo"
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

interface AppSidebarProps {
  width?: number;
}

export function AppSidebar({ width = 256 }: AppSidebarProps) {
  const location = useLocation()
  const { role, isAdmin } = useUserRole()

  return (
    <Sidebar 
      className="
        bg-card/60 
        border-border/30 
        backdrop-blur-xl 
        shadow-glow-lg
      " 
      style={{ width: `${width}px` }}
    >
      <SidebarHeader className="p-4 border-b border-border/30 bg-card/20 backdrop-blur-sm">
        <Link to="/" className="flex items-center justify-center group">
          <PsychedelicBrandLogo size="small" variant="horizontal" id="sidebar-logo" animate={false} />
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="flex-1 overflow-y-auto bg-card/10 backdrop-blur-sm">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="
                      text-muted-foreground 
                      hover:text-foreground 
                      hover:bg-primary/20 
                      hover:backdrop-blur-sm 
                      data-[active=true]:bg-primary/30 
                      data-[active=true]:text-primary-foreground
                      data-[active=true]:shadow-glow-sm
                      h-10 text-sm font-semibold 
                      px-3 py-2 rounded-xl 
                      smooth-transition 
                      hover:scale-105 
                      hover:shadow-glow-sm 
                      group
                      border border-transparent
                      data-[active=true]:border-primary/50
                    "
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 glow-transition" strokeWidth={2} />
                      <span className="text-sm font-semibold">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Menu - Enhanced with new design system */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="px-2 space-y-1">
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={location.pathname === item.url}
                      className="
                        text-pastel-peach 
                        hover:text-glow-mint 
                        hover:bg-accent/30
                        hover:shadow-glow-sm
                        data-[active=true]:bg-accent/50 
                        data-[active=true]:text-accent-foreground
                        data-[active=true]:shadow-glow-md
                        h-8 text-xs font-medium 
                        px-2 py-1 rounded-md 
                        smooth-transition
                        border border-transparent
                        data-[active=true]:border-accent/50
                      "
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                        <span className="text-xs font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="
        border-t border-border/30 
        p-2 
        bg-card/20 
        backdrop-blur-sm
      ">
        <div className="flex items-center justify-center">
          <EnhancedUserProfile />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
