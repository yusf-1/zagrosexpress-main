import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Package, ShoppingBag, Warehouse, Truck, MapPin, Check, ExternalLink, Ship, Plane, ChevronRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
 import BottomNav from '@/components/BottomNav';
import { log } from '@/lib/logger';

interface Order {
  id: string;
  product_url: string;
  product_details: string;
  shipping_method: 'sea' | 'air' | 'both';
  status: 'pending' | 'quoted' | 'accepted' | 'buying' | 'received_china' | 'on_the_way' | 'ready_pickup' | 'completed';
  admin_response: string | null;
  shipping_cost: number | null;
  product_price: number | null;
  amount_paid: number | null;
  pickup_address: string | null;
  receipt_url: string | null;
  created_at: string;
}

interface Step {
  key: string;
  label: string;
  icon: LucideIcon;
}

const getTrackingSteps = (t: (key: string) => string): Step[] => [
  { key: 'buying', label: t('buying'), icon: ShoppingBag },
  { key: 'received_china', label: t('receivedChina'), icon: Warehouse },
  { key: 'on_the_way', label: t('onTheWay'), icon: Truck },
  { key: 'ready_pickup', label: t('readyPickup'), icon: MapPin },
];

const statusOrder = ['accepted', 'buying', 'received_china', 'on_the_way', 'ready_pickup', 'completed'];

export default function TrackOrder() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('tracking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          log('🚚 Tracking updated!', payload);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .not('status', 'in', '("pending","quoted")')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  const getStepIndex = (status: string) => {
    return statusOrder.indexOf(status);
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
              <h1 className="font-semibold text-foreground">{t('whereIsMyOrder')}</h1>
              <p className="text-xs text-muted-foreground">{t('trackYourShipments')}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="max-w-sm mx-auto text-center animate-fade-in card-clean">
            <CardContent className="py-12">
              <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-base font-semibold text-foreground mb-2">{t('noOrdersToTrack')}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t('onceOrderAccepted')}
              </p>
              <Button onClick={() => navigate('/my-orders')}>
                {t('myOrders')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 max-w-lg mx-auto">
            {orders.map((order, index) => {
              const trackingSteps = getTrackingSteps(t);
              const rawStepIndex = getStepIndex(order.status);
              const isFinalCompleted = order.status === 'completed';
              const currentStepIndex = rawStepIndex < 0
                ? -1
                : Math.min(rawStepIndex, trackingSteps.length - 1);
              const progressWidth = isFinalCompleted
                ? 100
                : (currentStepIndex >= 0
                  ? (currentStepIndex / (trackingSteps.length - 1)) * 100
                  : 0);
              
              return (
                <Card 
                  key={order.id} 
                  className="animate-fade-in overflow-hidden card-clean cursor-pointer hover:bg-secondary/30 transition-colors"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/order/${order.id}`, { state: { from: 'track' } })}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm text-foreground">Order #{order.id.slice(0, 8)}</CardTitle>
                        <CardDescription>
                          {new Date(order.created_at).toLocaleDateString()} • {formatShippingMethod(order.shipping_method)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.shipping_method === 'sea' ? (
                          <Ship className="w-5 h-5 text-blue-500" />
                        ) : order.shipping_method === 'air' ? (
                          <Plane className="w-5 h-5 text-purple-500" />
                        ) : (
                          <div className="flex items-center gap-1">
                            <Plane className="w-4 h-4 text-purple-500" />
                            <Ship className="w-4 h-4 text-blue-500" />
                          </div>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Tracking Progress */}
                    <div className="relative">
                      {/* Progress Line */}
                      <div className="absolute top-4 left-4 right-4 h-0.5 bg-border rounded-full">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ 
                            width: `${progressWidth}%` 
                          }}
                        />
                      </div>
                      
                      {/* Steps */}
                      <div className="relative flex justify-between">
                        {trackingSteps.map((step, stepIndex) => {
                          const isCompleted = isFinalCompleted
                            ? stepIndex <= trackingSteps.length - 1
                            : stepIndex < currentStepIndex;
                          const isCurrent = isFinalCompleted ? false : stepIndex === currentStepIndex;
                          const Icon = step.icon;

                          return (
                            <div key={step.key} className="flex flex-col items-center">
                              <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  isCompleted 
                                    ? 'bg-primary text-primary-foreground'
                                    : isCurrent
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-muted-foreground'
                                }`}
                              >
                                {isCompleted ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Icon className="w-4 h-4" />
                                )}
                              </div>
                              <span className={`text-[10px] mt-1.5 text-center max-w-[60px] ${
                                isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Payment Info - Show for all orders */}
                    {order.product_price != null && order.shipping_cost != null && (
                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-muted-foreground">{t('total')}</span>
                          <span className="text-sm font-medium text-foreground">
                            ${(order.product_price + order.shipping_cost).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-muted-foreground">{t('amountPaid')}</span>
                          <span className="text-sm font-medium text-status-ready">
                            ${(order.amount_paid || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t border-border pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-foreground">{t('amountRemaining')}</span>
                            <span className={`text-base font-bold ${((order.product_price + order.shipping_cost) - (order.amount_paid || 0)) <= 0 ? 'text-status-ready' : 'text-primary'}`}>
                              {((order.product_price + order.shipping_cost) - (order.amount_paid || 0)) <= 0 
                                ? t('fullyPaid') 
                                : `$${((order.product_price + order.shipping_cost) - (order.amount_paid || 0)).toFixed(2)}`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ready for Pickup Info */}
                    {order.status === 'ready_pickup' && (
                      <div className="bg-status-ready/10 rounded-lg p-4 border border-status-ready/20">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="w-4 h-4 text-status-ready" />
                          <span className="font-medium text-foreground text-sm">{t('readyPickup')}!</span>
                        </div>
                        
                        {order.pickup_address && (
                          <div className="mb-3">
                            <p className="text-xs text-muted-foreground mb-1">{t('pickupAddress')}</p>
                            <p className="text-sm text-foreground">{order.pickup_address}</p>
                          </div>
                        )}

                        {order.receipt_url && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                            className="border-status-ready/30 text-status-ready hover:bg-status-ready/10"
                          >
                            <a href={order.receipt_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                              {t('viewReceipt')}
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
