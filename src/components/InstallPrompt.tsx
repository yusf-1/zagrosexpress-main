import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Share, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if already dismissed
    const dismissed = localStorage.getItem('install_prompt_dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    
    // Show again after 7 days
    if (dismissed && daysSinceDismissed < 7) {
      return;
    }

    // Don't show if already installed
    if (standalone) {
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // For iOS, show prompt after a short delay
    if (iOS) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // For Android/Chrome, listen for beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('install_prompt_dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md mx-4 mb-8 bg-card rounded-2xl border border-border shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary/20 to-primary/10 p-6 pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <img src="/pwa-192x192.png" alt="ZAGROSS" className="w-12 h-12 rounded-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">ZAGROSS EXPRESS</h2>
              <p className="text-sm text-muted-foreground">{t('addToHomeScreen') || 'Add to Home Screen'}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-4">
          {isIOS ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('installIOSInstructions') || 'Install this app on your iPhone for quick access:'}
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Share className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">1. {t('tapShare') || 'Tap the Share button'}</p>
                    <p className="text-xs text-muted-foreground">{t('inSafari') || 'In Safari browser toolbar'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">2. {t('addToHome') || 'Add to Home Screen'}</p>
                    <p className="text-xs text-muted-foreground">{t('scrollAndTap') || 'Scroll down and tap'}</p>
                  </div>
                </div>
              </div>
              <Button onClick={handleDismiss} className="w-full mt-4">
                {t('gotIt') || 'Got it!'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('installAndroidInstructions') || 'Install this app on your device for quick access anytime.'}
              </p>
              <div className="flex gap-3">
                <Button onClick={handleDismiss} variant="outline" className="flex-1">
                  {t('notNow') || 'Not now'}
                </Button>
                <Button onClick={handleInstall} className="flex-1 gap-2">
                  <Download className="w-4 h-4" />
                  {t('install') || 'Install'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
