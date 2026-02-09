import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
 import { Package, Ship, Plane, ChevronRight } from 'lucide-react';
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
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-status-pending/10 text-status-pending border-status-pending/20',
  quoted: 'bg-status-quoted/10 text-status-quoted border-status-quoted/20',
  accepted: 'bg-status-accepted/10 text-status-accepted border-status-accepted/20',
  buying: 'bg-status-buying/10 text-status-buying border-status-buying/20',
  received_china: 'bg-status-china/10 text-status-china border-status-china/20',
  on_the_way: 'bg-status-shipping/10 text-status-shipping border-status-shipping/20',
  ready_pickup: 'bg-status-ready/10 text-status-ready border-status-ready/20',
};

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [trackingCount, setTrackingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const trackStatuses = ['buying', 'received_china', 'on_the_way', 'ready_pickup'];

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          log('🔔 Order updated!', payload);
          const nextStatus = payload.new?.status;
          if (nextStatus && trackStatuses.includes(nextStatus)) {
            navigate('/track-order');
            return;
          }
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!loading && orders.length === 0 && trackingCount > 0) {
      navigate('/track-order');
    }
  }, [loading, orders.length, trackingCount, navigate]);

  const fetchOrders = async () => {
    if (!user) return;

    const [{ data: pendingData, error: pendingError }, { data: trackingData, error: trackingError }] = await Promise.all([
      supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'quoted'])
        .order('created_at', { ascending: false }),
      supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .in('status', ['buying', 'received_china', 'on_the_way', 'ready_pickup']),
    ]);

    if (!pendingError && pendingData) {
      setOrders(pendingData as Order[]);
    }
    if (!trackingError && trackingData) {
      setTrackingCount(trackingData.length);
    }
    setLoading(false);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: t('pending'),
      quoted: t('quoted'),
      accepted: t('accepted'),
      buying: t('buying'),
      received_china: t('receivedChina'),
      on_the_way: t('onTheWay'),
      ready_pickup: t('readyPickup'),
    };
    return labels[status] || status;
  };

  const formatShippingMethod = (method: string) => {
    const methods: Record<string, string> = {
      sea: t('bySea'),
      air: t('byAir'),
      both: t('both'),
    };
    return methods[method] || method;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div>
              <h1 className="font-semibold text-foreground">{t('myOrders')}</h1>
              <p className="text-xs text-muted-foreground">View and manage your orders</p>
          </div>
        </div>
      </header>

       <main className="container mx-auto px-4 py-8 pb-24">
         {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="max-w-sm mx-auto text-center animate-fade-in card-clean">
            <CardContent className="py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-base font-semibold text-foreground mb-2">{t('noOrders')}</h3>
              <p className="text-sm text-muted-foreground mb-6">{t('noOrdersDesc')}</p>
              <Button onClick={() => navigate('/place-order')}>
                {t('placeOrder')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 max-w-lg mx-auto">
            {orders.map((order, index) => (
              <Card 
                key={order.id}
                className="animate-fade-in card-clean overflow-hidden cursor-pointer hover:bg-secondary/30 transition-colors"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => navigate(`/order/${order.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Shipping Method Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        order.shipping_method === 'sea' ? 'bg-blue-500/10 text-blue-500' :
                        order.shipping_method === 'air' ? 'bg-purple-500/10 text-purple-500' :
                        'bg-gradient-to-br from-blue-500/10 to-purple-500/10'
                      }`}>
                        {order.shipping_method === 'sea' ? (
                          <Ship className="w-5 h-5" />
                        ) : order.shipping_method === 'air' ? (
                          <Plane className="w-5 h-5" />
                        ) : (
                          <div className="flex flex-col items-center gap-0.5">
                            <Plane className="w-3 h-3 text-purple-500" />
                            <Ship className="w-3 h-3 text-blue-500" />
                          </div>
                        )}
                      </div>
                      
                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-foreground">#{order.id.slice(0, 8)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[order.status]}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(order.created_at).toLocaleDateString()} • {formatShippingMethod(order.shipping_method)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Price and Arrow */}
                    <div className="shrink-0 flex items-center gap-2">
                      {/* Show price for quoted orders */}
                      {order.status === 'quoted' && order.product_price && order.shipping_cost && (
                        <div className="text-right">
                          {order.shipping_method === 'both' ? (
                            (() => {
                              const transferFee = order.transfer_fee || 0;
                              return (
                                <div className="flex flex-col items-end gap-0.5">
                                  {order.shipping_cost_air != null && (
                                    <div className="flex items-center gap-1">
                                      <Plane className="w-3 h-3 text-purple-500" />
                                      <span className="text-sm font-bold text-primary">
                                        ${(order.product_price + order.shipping_cost_air + transferFee).toFixed(0)}
                                      </span>
                                    </div>
                                  )}
                                  {order.shipping_cost_sea != null && (
                                    <div className="flex items-center gap-1">
                                      <Ship className="w-3 h-3 text-blue-500" />
                                      <span className="text-sm font-bold text-primary">
                                        ${(order.product_price + order.shipping_cost_sea + transferFee).toFixed(0)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          ) : (
                            <span className="text-sm font-bold text-primary">
                              ${(order.product_price + order.shipping_cost + (order.transfer_fee || 0)).toFixed(0)}
                            </span>
                          )}
                        </div>
                      )}
                      <ChevronRight className={`w-5 h-5 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
       
       <BottomNav />
    </div>
  );
}
