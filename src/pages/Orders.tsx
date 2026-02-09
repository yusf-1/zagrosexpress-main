import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, MapPin, ShoppingCart, ArrowLeft, ChevronRight } from 'lucide-react';
import alibabaLogo from '@/assets/alibaba-logo.webp';
import taobaoLogo from '@/assets/taobao-logo.png';
import logo1688 from '@/assets/1688-logo.png';

export default function Orders() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/home')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">{t('orders')}</h1>
              <p className="text-xs text-muted-foreground">{t('ordersDesc')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="space-y-3">
          {/* Place Order Card */}
          <Card 
            className="card-clean hover-lift cursor-pointer animate-fade-in"
            onClick={() => navigate('/place-order')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img src={alibabaLogo} alt="Alibaba" className="h-12 w-12 object-contain rounded-xl" />
                  <img src={taobaoLogo} alt="Taobao" className="h-12 w-12 object-contain rounded-xl" />
                  <img src={logo1688} alt="1688" className="h-12 w-12 object-contain rounded-xl" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base text-foreground">{t('placeOrder')}</CardTitle>
                  <CardDescription className="text-sm">
                    {t('placeOrderDesc')}
                  </CardDescription>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>

          {/* My Orders Card */}
          <Card 
            className="card-clean hover-lift cursor-pointer animate-fade-in"
            style={{ animationDelay: '0.1s' }}
            onClick={() => navigate('/my-orders')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base text-foreground">{t('myOrders')}</CardTitle>
                  <CardDescription className="text-sm">
                    {t('myOrdersDesc')}
                  </CardDescription>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>

          {/* Where Is My Order Card */}
          <Card 
            className="card-clean hover-lift cursor-pointer animate-fade-in"
            style={{ animationDelay: '0.2s' }}
            onClick={() => navigate('/track-order')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-status-shipping/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-status-shipping" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base text-foreground">{t('whereIsMyOrder')}</CardTitle>
                  <CardDescription className="text-sm">
                    {t('trackOrderDesc')}
                  </CardDescription>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
