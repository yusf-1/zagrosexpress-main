import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Package, MessageSquare, ExternalLink, Ship, Plane, Clock } from 'lucide-react';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';
import { log } from '@/lib/logger';

interface Order {
  id: string;
  product_url: string;
  product_details: string;
  shipping_method: 'sea' | 'air' | 'both';
  status: 'pending' | 'quoted' | 'accepted' | 'buying' | 'received_china' | 'on_the_way' | 'ready_pickup';
  admin_response: string | null;
  shipping_cost: number | null;
  shipping_cost_air: number | null;
  shipping_cost_sea: number | null;
  product_price: number | null;
  transfer_fee: number | null;
  amount_paid: number | null;
  payment_notes: string | null;
  created_at: string;
}
const statusColors: Record<string, string> = {
  pending: 'bg-status-pending/10 text-status-pending border-status-pending/20',
  quoted: 'bg-status-quoted/10 text-status-quoted border-status-quoted/20',
  accepted: 'bg-status-accepted/10 text-status-accepted border-status-accepted/20',
  buying: 'bg-status-buying/10 text-status-buying border-status-buying/20',
  received_china: 'bg-status-china/10 text-status-china border-status-china/20',
  on_the_way: 'bg-status-shipping/10 text-status-shipping border-status-shipping/20',
  ready_pickup: 'bg-status-ready/10 text-status-ready border-status-ready/20'
};
export default function OrderDetails() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    user
  } = useAuth();
  const {
    t,
    isRTL
  } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    orderId
  } = useParams<{
    orderId: string;
  }>();
  useEffect(() => {
    fetchOrder();

    // Subscribe to real-time updates for this specific order
    const channel = supabase
      .channel('order-details-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        () => {
          log('Order updated, refetching...');
          fetchOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, user?.id]);
  const fetchOrder = async () => {
    if (!user || !orderId) return;
    const {
      data,
      error
    } = await supabase.from('orders').select('*').eq('id', orderId).eq('user_id', user.id).single();
    if (!error && data) {
      setOrder(data as Order);
    }
    setLoading(false);
  };
  const handleContactWhatsApp = () => {
    const orderNumber = order?.id.slice(0, 8) || '';
    const message = `${t('whatsappOrderMessage')}${orderNumber}`;
    toast.success(t('openingWhatsApp'));
    window.open(`https://wa.me/9647512357541?text=${encodeURIComponent(message)}`, '_blank');
  };
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: t('pending'),
      quoted: t('quoted'),
      accepted: t('accepted'),
      buying: t('buying'),
      received_china: t('receivedChina'),
      on_the_way: t('onTheWay'),
      ready_pickup: t('readyPickup')
    };
    return labels[status] || status;
  };
  const formatShippingMethod = (method: string) => {
    const methods: Record<string, string> = {
      sea: t('bySea'),
      air: t('byAir'),
      both: t('both')
    };
    return methods[method] || method;
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
       </div>;
  }
  const handleBack = () => {
    if (location.state && (location.state as { from?: string }).from === 'track') {
      navigate('/track-order');
      return;
    }
    navigate('/my-orders');
  };

  if (!order) {
    return <div className="min-h-screen bg-background">
         <header className="bg-card border-b border-border sticky top-0 z-50">
           <div className="container mx-auto px-4 py-4">
             <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" onClick={handleBack} className="text-muted-foreground hover:text-foreground">
                 <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
               </Button>
               <h1 className="font-semibold text-foreground">{t('orderDetails')}</h1>
             </div>
           </div>
         </header>
         <main className="container mx-auto px-4 py-8">
           <Card className="max-w-sm mx-auto text-center">
             <CardContent className="py-12">
               <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
               <h3 className="text-base font-semibold text-foreground mb-2">{t('orderNotFound')}</h3>
             </CardContent>
           </Card>
         </main>
       </div>;
  }
  return <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="bg-card border-b border-border sticky top-0 z-50">
         <div className="container mx-auto px-4 py-4">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack} className="text-muted-foreground hover:text-foreground">
               <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
             </Button>
             <div>
               <h1 className="font-semibold text-foreground">#{order.id.slice(0, 8)}</h1>
               <p className="text-xs text-muted-foreground">{t('orderDetails')}</p>
             </div>
           </div>
         </div>
       </header>
 
       <main className="container mx-auto px-4 py-6 pb-24">
         <div className="max-w-lg mx-auto space-y-4">
          {/* Contact WhatsApp for Payment - Prominent at top */}
          {order.status === 'quoted' && <Card className="card-clean border-0 bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-white/90 flex-1">
                      {t('contactAdminForPayment')}
                  </p>
                  <button 
                    onClick={handleContactWhatsApp}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors shrink-0"
                  >
                    <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </button>
                </div>
              </CardContent>
            </Card>}

           {/* Status Card */}
           <Card className="card-clean">
            <CardContent className="p-4 space-y-4">
              {/* Header */}
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center ${order.shipping_method === 'sea' ? 'bg-blue-500/10 text-blue-500' : order.shipping_method === 'air' ? 'bg-purple-500/10 text-purple-500' : 'bg-gradient-to-br from-blue-500/10 to-purple-500/10'}`}>
                    {order.shipping_method === 'sea' ? <Ship className="w-6 h-6" /> : order.shipping_method === 'air' ? <Plane className="w-6 h-6" /> : <div className="flex flex-col items-center gap-0.5">
                        <Plane className="w-4 h-4 text-purple-500" />
                        <Ship className="w-4 h-4 text-blue-500" />
                      </div>}
                   </div>
                   <div>
                     <p className="text-sm font-medium text-foreground">{formatShippingMethod(order.shipping_method)}</p>
                     <p className="text-xs text-muted-foreground flex items-center gap-1">
                       <Clock className="w-3 h-3" />
                       {new Date(order.created_at).toLocaleDateString()}
                     </p>
                   </div>
                 </div>
                 <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                   {getStatusLabel(order.status)}
                 </span>
               </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Product Link */}
               <div className="flex items-center justify-between">
                 <p className="text-xs text-muted-foreground">{t('productLink')}</p>
                 <a href={order.product_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
                   <ExternalLink className="w-4 h-4" />
                 </a>
               </div>
 
              {/* Divider */}
              <div className="border-t border-border" />

              {/* Product Details */}
               <p className="text-xs text-muted-foreground mb-2">{t('details')}</p>
               <p className="text-sm text-foreground">{order.product_details}</p>
 
              {/* Admin Response */}
              {order.admin_response && order.admin_response.trim() && <>
                  <div className="border-t border-border" />
                 <div className="flex items-center gap-2 mb-3">
                   <MessageSquare className="w-4 h-4 text-primary" />
                   <p className="text-xs font-medium text-foreground">{t('adminResponse')}</p>
                 </div>
                 <p className="text-sm text-foreground mb-4">{order.admin_response}</p>
                </>}
              
              {/* Price Breakdown - Show independently when prices exist */}
              {(order.product_price || order.shipping_cost) && <>
                  <div className="border-t border-border" />
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                     {order.product_price && <div className="flex justify-between text-sm">
                         <span className="text-muted-foreground">{t('productPrice')}:</span>
                         <span className="font-medium text-foreground">${order.product_price}</span>
                       </div>}
                     {order.shipping_cost && <div className="flex justify-between text-sm">
                         <span className="text-muted-foreground">{t('shippingCost')}:</span>
                        {order.shipping_method === 'both' ? <div className="text-right space-y-1">
                            {order.shipping_cost_air != null && <div className="flex items-center gap-1 justify-end">
                                <span className="text-xs">✈️</span>
                                <span className="font-medium text-foreground">${order.shipping_cost_air}</span>
                              </div>}
                            {order.shipping_cost_sea != null && <div className="flex items-center gap-1 justify-end">
                                <span className="text-xs">🚢</span>
                                <span className="font-medium text-foreground">${order.shipping_cost_sea}</span>
                              </div>}
                          </div> : <span className="font-medium text-foreground">${order.shipping_cost}</span>}
                       </div>}
                      {/* Transfer Fee - Free if product <= $30, otherwise show fee */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('transferFee')}:</span>
                        {order.product_price && order.product_price <= 30 ? <span className="font-medium text-green-600">{t('free')}</span> : order.transfer_fee ? <span className="font-medium text-foreground">${order.transfer_fee}</span> : <span className="font-medium text-green-600">{t('free')}</span>}
                      </div>
                     {order.product_price && order.shipping_cost && <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2">
                        {order.shipping_method === 'both' ? <>
                            <span className="text-foreground">{t('total')}:</span>
                            <div className="text-right space-y-1">
                              {(() => {
                        const transferFee = order.transfer_fee || 0;
                        return <>
                                    {order.shipping_cost_air != null && <div className="flex items-center gap-1 justify-end">
                                        <span className="text-xs">✈️</span>
                                        <span className="text-primary">${(order.product_price + order.shipping_cost_air + transferFee).toFixed(2)}</span>
                                      </div>}
                                    {order.shipping_cost_sea != null && <div className="flex items-center gap-1 justify-end">
                                        <span className="text-xs">🚢</span>
                                        <span className="text-primary">${(order.product_price + order.shipping_cost_sea + transferFee).toFixed(2)}</span>
                                      </div>}
                                  </>;
                      })()}
                            </div>
                          </> : <>
                            <span className="text-foreground">{t('total')}:</span>
                            <span className="text-primary">${(order.product_price + order.shipping_cost + (order.transfer_fee || 0)).toFixed(2)}</span>
                          </>}
                       </div>}
                  </div>
                </>}
            </CardContent>
          </Card>
         </div>
       </main>
        
       <BottomNav />
     </div>;
}