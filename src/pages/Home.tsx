 import { useState, useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';
 import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Calculator, LogOut, Settings, Clock, ShoppingBag, Warehouse, Truck, MapPin, Check, ChevronRight, DollarSign, MessageSquarePlus, Store, User, MapPinned, FileText, Globe, Trash2, Shield } from 'lucide-react';
 import { FileQuestion, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import zagrossLogo from '@/assets/zagross-express-logo.png';
 import BottomNav from '@/components/BottomNav';
import { error as logError } from '@/lib/logger';

const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ku', name: 'Kurdish', nativeName: 'کوردی' },
];

export default function Home() {
  const { user, signOut, isAdmin } = useAuth();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
 
   const [orderStats, setOrderStats] = useState({
     pending: 0,
     quoted: 0,
     inProgress: 0,
     readyPickup: 0,
   });
   const [loadingStats, setLoadingStats] = useState(true);
 
   useEffect(() => {
     fetchOrderStats();
   }, [user?.id]);
 
   const fetchOrderStats = async () => {
     if (!user) return;
     
     const { data, error } = await supabase
       .from('orders')
       .select('status')
       .eq('user_id', user.id);
     
      if (!error && data) {
        const pending = data.filter(o => o.status === 'pending').length;
        const quoted = data.filter(o => o.status === 'quoted').length;
        const inProgress = data.filter(o => 
          ['buying', 'received_china', 'on_the_way'].includes(o.status || '')
        ).length;
        const readyPickup = data.filter(o => o.status === 'ready_pickup').length;
        
        setOrderStats({
          pending,
          quoted,
          inProgress,
          readyPickup,
        });
     }
     setLoadingStats(false);
   };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    const confirmMessage = t('deleteAccountConfirm') || 'Are you sure you want to delete your account? This cannot be undone.';
    if (!confirm(confirmMessage)) return;

    setDeletingAccount(true);
    try {
      const refreshResult = await supabase.auth.refreshSession();
      const token = refreshResult.data.session?.access_token;
      if (refreshResult.error || !token) {
        toast.error(t('deleteAccountFailed') || 'Please sign in again to delete your account.');
        await signOut();
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('delete-self', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error || data?.success === false) {
        let errMsg = data?.error || error?.message || 'Delete failed';
        try {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-self`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              'Content-Type': 'application/json',
            },
          });
          const raw = await response.text();
          if (raw) {
            errMsg = raw;
          } else if (!response.ok) {
            errMsg = `Delete failed (${response.status})`;
          }
        } catch (_) {
          // Keep original error message.
        }
        throw new Error(errMsg);
      }
      toast.success(t('deleteAccountSuccess') || 'Account deleted successfully.');
      await signOut();
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account.';
      logError('Delete account failed:', err);
      toast.error(message);
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLanguageOpen(false);
  };

  const statusGuide = [
    { key: 'pending', label: t('pending'), icon: Clock, color: 'bg-status-pending' },
    { key: 'quoted', label: t('quoted'), icon: Package, color: 'bg-status-quoted' },
    { key: 'buying', label: t('buying'), icon: ShoppingBag, color: 'bg-status-buying' },
    { key: 'received_china', label: t('receivedChina'), icon: Warehouse, color: 'bg-status-china' },
    { key: 'on_the_way', label: t('onTheWay'), icon: Truck, color: 'bg-status-shipping' },
    { key: 'ready_pickup', label: t('readyPickup'), icon: MapPin, color: 'bg-status-ready' },
  ];

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      {/* Header */}
      <header className="bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={zagrossLogo} alt="ZAGROSS EXPRESS" className="w-11 h-11 object-contain" />
              <div>
                <h1 className="font-semibold text-foreground">ZAGROSS EXPRESS</h1>
                <p className="text-xs text-muted-foreground">
                  {t('welcome')}, <span className="text-primary font-medium">{user?.user_metadata?.full_name || user?.user_metadata?.phone || 'Customer'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Admin panel is now web-only - removed from mobile app header */}

              <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <User className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side={isRTL ? "left" : "right"} className="w-80">
                  <SheetHeader>
                    <SheetTitle>{t('settings')}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => { setSettingsOpen(false); navigate('/personal-info'); }}
                    >
                      <User className="w-5 h-5" />
                      {t('personalInfo')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => { setSettingsOpen(false); navigate('/our-address'); }}
                    >
                      <MapPinned className="w-5 h-5" />
                      {t('ourAddress')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => { setSettingsOpen(false); navigate('/terms'); }}
                    >
                      <FileText className="w-5 h-5" />
                      {t('termsAndConditions')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => { setSettingsOpen(false); navigate('/privacy'); }}
                    >
                      <Shield className="w-5 h-5" />
                      {t('privacyPolicy')}
                    </Button>
                    <Sheet open={languageOpen} onOpenChange={setLanguageOpen}>
                      <SheetTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                          <Globe className="w-5 h-5" />
                          {t('changeLanguage')}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side={isRTL ? "left" : "right"} className="w-80">
                        <SheetHeader>
                          <SheetTitle>{t('selectLanguage')}</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 space-y-2">
                          {languages.map((lang) => (
                            <Button
                              key={lang.code}
                              variant={language === lang.code ? 'default' : 'ghost'}
                              className="w-full justify-between h-12"
                              onClick={() => handleLanguageChange(lang.code)}
                            >
                              <span>{lang.name}</span>
                              <div className="flex items-center gap-2">
                                <span className={lang.code !== 'en' ? 'font-arabic text-sm' : 'text-sm'}>{lang.nativeName}</span>
                                {language === lang.code && <Check className="w-4 h-4" />}
                              </div>
                            </Button>
                          ))}
                        </div>
                      </SheetContent>
                    </Sheet>
                    <div className="border-t border-border my-4" />
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => { setSettingsOpen(false); handleDeleteAccount(); }}
                      disabled={deletingAccount}
                    >
                      {deletingAccount ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                      {t('deleteAccount')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => { setSettingsOpen(false); handleSignOut(); }}
                    >
                      <LogOut className="w-5 h-5" />
                      {t('logout')}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-xl">
        {/* Order Stats Cards */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <button 
            onClick={() => navigate('/my-orders')}
            className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-2.5 text-white shadow-md shadow-amber-500/20 hover:shadow-lg transition-all"
          >
            <Clock className="w-4 h-4 mb-1 opacity-90 mx-auto" />
            <p className="text-xl font-bold text-center">{loadingStats ? '-' : orderStats.pending}</p>
            <p className="text-[10px] opacity-90 text-center leading-tight">{t('waitingPrice')}</p>
          </button>
          
          <button 
            onClick={() => navigate('/my-orders')}
            className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-2.5 text-white shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
          >
            <MessageCircle className="w-4 h-4 mb-1 opacity-90 mx-auto" />
            <p className="text-xl font-bold text-center">{loadingStats ? '-' : orderStats.quoted}</p>
            <p className="text-[10px] opacity-90 text-center leading-tight">{t('priceReady')}</p>
          </button>
          
          <button 
            onClick={() => navigate('/track-order')}
            className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl p-2.5 text-white shadow-md shadow-cyan-500/20 hover:shadow-lg transition-all"
          >
            <Truck className="w-4 h-4 mb-1 opacity-90 mx-auto" />
            <p className="text-xl font-bold text-center">{loadingStats ? '-' : orderStats.inProgress}</p>
            <p className="text-[10px] opacity-90 text-center leading-tight">{t('inProgress')}</p>
          </button>
          
          <button 
            onClick={() => navigate('/track-order')}
            className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-2.5 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all"
          >
            <MapPin className="w-4 h-4 mb-1 opacity-90 mx-auto" />
            <p className="text-xl font-bold text-center">{loadingStats ? '-' : orderStats.readyPickup}</p>
            <p className="text-[10px] opacity-90 text-center leading-tight">{t('readyPickup')}</p>
          </button>
        </div>

        {/* Action Cards */}
        <div className="space-y-3">
          {/* Wholesale Products */}
          <button
            onClick={() => navigate('/wholesale-products')}
            className="w-full bg-card rounded-2xl p-5 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 text-left border border-border/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Store className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-base">{t('wholesaleProducts')}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{t('wholesaleProductsDesc')}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>

          {/* Special Request */}
          <button
            onClick={() => navigate('/special-request')}
            className="w-full bg-card rounded-2xl p-5 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 text-left border border-border/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
                <MessageSquarePlus className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-base">{t('specialRequest')}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{t('specialRequestDesc')}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>

          {/* CBM Calculator */}
          <button
            onClick={() => navigate('/cbm-calculator')}
            className="w-full bg-card rounded-2xl p-5 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 text-left border border-border/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                <Calculator className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-base">{t('cbmCalculator')}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{t('cbmCalculatorDesc')}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>
        </div>
      </main>
       
      <BottomNav />
    </div>
  );
}
