import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Loader2, Lock, Phone } from "lucide-react";
import { toast } from "sonner";
import { error as logError } from "@/lib/logger";

// Generate or retrieve unique device ID
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem("wholesale_device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("wholesale_device_id", deviceId);
  }
  return deviceId;
};

// Get stored session token
const getSessionToken = (): string | null => {
  return localStorage.getItem("wholesale_session_token");
};

// Store session token
const setSessionToken = (token: string): void => {
  localStorage.setItem("wholesale_session_token", token);
  localStorage.setItem("wholesale_authenticated", "true");
};

export default function WholesaleProducts() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const token = getSessionToken();
    if (token) {
      // Validate the session server-side
      const { data, error } = await supabase.rpc('validate_wholesale_session', {
        _session_token: token
      });
      
      if (data === true) {
        setIsAuthenticated(true);
        // Auto-redirect to products
        navigate("/wholesale-products/with-price");
      } else {
        // Session expired or invalid, clear it
        localStorage.removeItem("wholesale_session_token");
        localStorage.removeItem("wholesale_authenticated");
      }
    }
    setCheckingAuth(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const deviceId = getDeviceId();
    const enteredPassword = passwordInput.trim();
    
    // Use secure server-side session creation
    const { data, error } = await supabase.rpc('create_wholesale_session', {
      _password: enteredPassword,
      _device_id: deviceId
    });
    
    if (error) {
      logError('Session creation error:', error);
      toast.error(t("incorrectPassword"));
      setSubmitting(false);
      return;
    }
    
    const result = data?.[0];
    
    if (result?.success && result?.session_token) {
      // Store the session token
      setSessionToken(result.session_token);
      setIsAuthenticated(true);
      toast.success(t("accessGranted"));
      // Auto-redirect to products
      navigate("/wholesale-products/with-price");
    } else if (result?.error_message) {
      if (result.error_message.includes('device')) {
        toast.error(t("passwordUsedByOther"));
      } else {
        toast.error(t("incorrectPassword"));
      }
    } else {
      toast.error(t("incorrectPassword"));
    }
    
    setSubmitting(false);
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
              <BackIcon className="h-5 w-5" />
              </Button>
              <h1 className="font-semibold text-foreground">{t("wholesaleProducts")}</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-md">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("passwordRequired")}</h2>
              <p className="text-muted-foreground text-sm">{t("enterYourPassword")}</p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={submitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {t("enter")}
              </Button>
            </form>

            {/* Contact section for customers without password */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-4">{t("noPasswordContact")}</p>
                <div className="space-y-2">
                  <a 
                    href="tel:+964751235751" 
                    className="flex items-center justify-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    <span dir="ltr">+964 751 235 751</span>
                  </a>
                  <a 
                    href="tel:+9647704471086" 
                    className="flex items-center justify-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    <span dir="ltr">+964 770 447 1086</span>
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // Authenticated - will auto-redirect, show loading
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}