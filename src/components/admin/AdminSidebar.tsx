import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Package,
  Store,
  Key,
  DollarSign,
  MessageSquare,
  UserPlus,
  ExternalLink,
  LogOut,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import zagrossLogo from "@/assets/zagross-express-logo.png";

const adminNavItems = [
  { path: "/admin", icon: LayoutDashboard, labelKey: "adminPanel", label: "Orders Dashboard" },
  { path: "/admin-add-order", icon: UserPlus, labelKey: "addOrderForCustomer", label: "Add Order" },
  { path: "/admin-products", icon: Store, labelKey: "products", label: "Products" },
  { path: "/admin-customer-passwords", icon: Key, labelKey: "customerPasswords", label: "Customer Passwords" },
  { path: "/admin-special-requests", icon: MessageSquare, labelKey: "specialRequests", label: "Special Requests" },
  { path: "/admin-finances", icon: DollarSign, labelKey: "finances", label: "Finances" },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signOut, user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const openCustomerApp = () => {
    window.open(window.location.origin + "/home", "_blank");
  };

  return (
    <Sidebar 
      className={cn(
        "border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-72"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b bg-primary/5">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <img 
            src={zagrossLogo} 
            alt="ZAGROSS EXPRESS" 
            className="w-10 h-10 object-contain flex-shrink-0" 
          />
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="font-bold text-foreground truncate">
                ZAGROSS EXPRESS
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                Admin Control Panel
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-xs uppercase tracking-wider text-muted-foreground", collapsed && "sr-only")}>
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {adminNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      tooltip={collapsed ? item.label : undefined}
                      className={cn(
                        "w-full justify-start gap-3 h-12 px-3 rounded-lg transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5 flex-shrink-0")} />
                      {!collapsed && (
                        <span className="truncate font-medium">
                          {item.label}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t space-y-2 bg-muted/30">
        {/* Admin info */}
        {!collapsed && (
          <div className="px-2 py-2 mb-2">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-medium text-foreground truncate">
              {user?.user_metadata?.full_name || user?.email || 'Admin'}
            </p>
          </div>
        )}
        
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-3 h-11",
            collapsed && "justify-center px-0"
          )}
          onClick={openCustomerApp}
        >
          <ExternalLink className="w-4 h-4" />
          {!collapsed && <span>Open Customer App</span>}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-11 text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-0"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
