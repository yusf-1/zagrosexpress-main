import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [dismissedMobileWarning, setDismissedMobileWarning] = useState(false);

  useEffect(() => {
    // Check if it's a mobile device
    const checkMobile = () => {
      const isMobile = window.innerWidth < 1024 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobileDevice(isMobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!loading) {
      // If not logged in, redirect to auth
      if (!user) {
        navigate("/auth");
        return;
      }
      // If logged in but not admin, redirect to home
      if (!isAdmin) {
        navigate("/home");
      }
    }
  }, [isAdmin, loading, navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Not logged in - show nothing while redirecting
  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  // Show mobile warning
  if (isMobileDevice && !dismissedMobileWarning) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Monitor className="w-10 h-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Admin Panel - Desktop Only
            </h1>
            <p className="text-muted-foreground">
              The admin panel is optimized for desktop browsers. For the best experience, please open this page on a computer.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
            <p className="text-sm font-medium text-foreground">Access URL:</p>
            <code className="block p-3 bg-card rounded border text-sm break-all">
              {window.location.origin}/admin
            </code>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              onClick={() => setDismissedMobileWarning(true)}
              className="w-full"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Continue Anyway
            </Button>
            <Button 
              onClick={() => navigate('/home')}
              className="w-full"
            >
              Back to App
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          {/* Header with sidebar trigger */}
          <header className="flex items-center gap-3 p-4 border-b bg-card/50 sticky top-0 z-40 backdrop-blur-sm">
            <SidebarTrigger className="h-8 w-8" />
            <div className="flex-1">
              <span className="font-semibold text-foreground">ZAGROSS EXPRESS</span>
              <span className="text-muted-foreground ml-2 text-sm">Admin Panel</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <Monitor className="w-4 h-4" />
              <span>Desktop View</span>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
