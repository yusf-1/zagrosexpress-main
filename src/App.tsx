import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "@/integrations/supabase/client";
import { log, error } from "@/lib/logger";
async function upsertPushToken(token: string, userId: string) {
  const platform = Capacitor.getPlatform ? Capacitor.getPlatform() : "unknown";
  const now = new Date().toISOString();
  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: userId,
      token,
      platform,
      last_seen: now,
      updated_at: now,
    },
    { onConflict: "user_id,token" }
  );
  if (error) {
    error("Failed to save push token:", error);
  }
}

// Register push notifications for native platforms
function usePushNotifications(userId?: string) {
  useEffect(() => {
    if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
      const platform = Capacitor.getPlatform ? Capacitor.getPlatform() : 'unknown';
      const requestAndRegister = () => {
        PushNotifications.requestPermissions().then(result => {
          if (result.receive === 'granted') {
            PushNotifications.register();
          }
        });
      };

      if (platform === 'android') {
        PushNotifications.checkPermissions().then(status => {
          if (status.receive === 'granted') {
            PushNotifications.register();
            return null;
          }
          return PushNotifications.requestPermissions();
        }).then(result => {
          if (result && result.receive === 'granted') {
            PushNotifications.register();
          }
        });
      } else {
        requestAndRegister();
      }

      PushNotifications.addListener('registration', async token => {
        log('Push registration success, token:', token.value);
        localStorage.setItem('last_push_token', token.value);
        const { data } = await supabase.auth.getSession();
        const uid = data.session?.user.id;
        if (uid) {
          await upsertPushToken(token.value, uid);
          localStorage.removeItem('pending_push_token');
        } else {
          localStorage.setItem('pending_push_token', token.value);
        }
      });

      PushNotifications.addListener('registrationError', err => {
        error('Push registration error:', err);
      });

      PushNotifications.addListener('pushNotificationReceived', notification => {
        log('Push received:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', notification => {
        log('Push action performed:', notification);
      });
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const pending = localStorage.getItem('pending_push_token');
    if (pending) {
      upsertPushToken(pending, userId).then(() => {
        localStorage.removeItem('pending_push_token');
      });
    }
  }, [userId]);
}
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import SplashScreen from "@/components/ui/SplashScreen";
import InstallPrompt from "@/components/InstallPrompt";
import { isNativePlatform } from "@/lib/isNativePlatform";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import Home from "./pages/Home";
import PlaceOrder from "./pages/PlaceOrder";
import TrackOrder from "./pages/TrackOrder";
import MyOrders from "./pages/MyOrders";
import Admin from "./pages/Admin";
import AdminFinances from "./pages/AdminFinances";
import AdminProducts from "./pages/AdminProducts";
import AdminCustomerPasswords from "./pages/AdminCustomerPasswords";
import AdminAddOrder from "./pages/AdminAddOrder";
import Auth from "./pages/Auth";
import LanguageSelect from "./pages/LanguageSelect";
import CBMCalculator from "./pages/CBMCalculator";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import Orders from "./pages/Orders";
import SpecialRequest from "./pages/SpecialRequest";
import SpecialRequestAdd from "./pages/SpecialRequestAdd";
import SpecialRequestList from "./pages/SpecialRequestList";
import WholesaleProducts from "./pages/WholesaleProducts";
import WholesaleWithPrice from "./pages/WholesaleWithPrice";
import AdminSpecialRequests from "./pages/AdminSpecialRequests";
import OrderDetails from "./pages/OrderDetails";
import PersonalInfo from "./pages/PersonalInfo";
import Privacy from "./pages/Privacy";

const queryClient = new QueryClient();

// Check if we're in admin route - skip splash for admin
const isAdminRoute = () => {
  return window.location.pathname.startsWith('/admin');
};

const AppContent = () => {
  const { session } = useAuth();
  usePushNotifications(session?.user?.id);
  const [showSplash, setShowSplash] = useState(() => !isAdminRoute());

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <>
      <Toaster />
      <Sonner />
      {/* Don't show install prompt on admin routes or native builds */}
      {!isAdminRoute() && !(isNativePlatform && isNativePlatform()) && <InstallPrompt />}
      <BrowserRouter>
        <OrderRedirector />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Navigate to="/language" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/order/:orderId" element={<OrderDetails />} />
          <Route path="/orders" element={<Orders />} />
          
          {/* Admin routes - Desktop Web Only */}
          <Route path="/admin" element={<AdminLayout><Admin /></AdminLayout>} />
          <Route path="/admin-finances" element={<AdminLayout><AdminFinances /></AdminLayout>} />
          <Route path="/admin-products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
          <Route path="/admin-customer-passwords" element={<AdminLayout><AdminCustomerPasswords /></AdminLayout>} />
          <Route path="/admin-add-order" element={<AdminLayout><AdminAddOrder /></AdminLayout>} />
          <Route path="/admin-special-requests" element={<AdminLayout><AdminSpecialRequests /></AdminLayout>} />
          
          <Route path="/auth" element={<Auth />} />
          <Route path="/language" element={<LanguageSelect />} />
          <Route path="/cbm-calculator" element={<CBMCalculator />} />
          <Route path="/install" element={<Install />} />
          <Route path="/special-request" element={<SpecialRequest />} />
          <Route path="/special-request/add" element={<SpecialRequestAdd />} />
          <Route path="/special-request/my-requests" element={<SpecialRequestList />} />
          <Route path="/wholesale-products" element={<WholesaleProducts />} />
          <Route path="/wholesale-products/with-price" element={<WholesaleWithPrice />} />
          <Route path="/wholesale-products/with-price/:categoryId" element={<WholesaleWithPrice />} />
          <Route path="/wholesale-products/with-price/:categoryId/shop/:shopId" element={<WholesaleWithPrice />} />
          <Route path="/personal-info" element={<PersonalInfo />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const OrderRedirector = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const trackStatuses = ['buying', 'received_china', 'on_the_way', 'ready_pickup'];

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('orders-redirect')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const nextStatus = payload.new?.status;
          if (nextStatus && trackStatuses.includes(nextStatus) && location.pathname !== '/track-order') {
            navigate('/track-order');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, navigate, location.pathname]);

  return null;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
