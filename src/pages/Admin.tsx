import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  MessageSquare, 
  ShoppingBag, 
  Warehouse, 
  Truck, 
  MapPin, 
  CheckCircle,
  Search,
  Settings,
  Package
} from 'lucide-react';
import { OrderCard } from '@/components/admin/OrderCard';
import { AdminOrderDialog } from '@/components/admin/AdminOrderDialog';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { log } from '@/lib/logger';

interface OrderProfile {
  full_name: string | null;
  phone: string | null;
}

interface Order {
  id: string;
  user_id: string;
  product_url: string;
  product_details: string;
  shipping_method: 'sea' | 'air' | 'both';
  status: string;
  admin_response: string | null;
  shipping_cost: number | null;
  product_price: number | null;
  pickup_address: string | null;
  receipt_url: string | null;
  tracking_number: string | null;
  admin_benefit: number | null;
  transfer_fee?: number | null;
  amount_paid?: number | null;
  payment_notes?: string | null;
  created_at: string;
  profiles?: OrderProfile;
}

const statusTabs = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-500' },
  { value: 'quoted', label: 'Quoted', icon: MessageSquare, color: 'text-blue-500' },
  { value: 'buying', label: 'Buying', icon: ShoppingBag, color: 'text-purple-500' },
  { value: 'received_china', label: 'China', icon: Warehouse, color: 'text-cyan-500' },
  { value: 'on_the_way', label: 'On Way', icon: Truck, color: 'text-indigo-500' },
  { value: 'ready_pickup', label: 'Ready', icon: MapPin, color: 'text-emerald-500' },
  { value: 'completed', label: 'Done', icon: CheckCircle, color: 'text-green-500' },
  { value: 'settings', label: 'Settings', icon: Settings, color: 'text-muted-foreground' },
];

export default function Admin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const { isAdmin, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to finish loading before checking admin status
    if (authLoading) return;
    
    if (!isAdmin) {
      log('Not admin, redirecting to home');
      navigate('/home');
      return;
    }
    
    log('Admin confirmed, fetching orders');
    fetchOrders();

    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, authLoading, navigate]);

  const fetchOrders = async () => {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError || !ordersData) {
      setLoading(false);
      return;
    }

    const userIds = [...new Set(ordersData.map(o => o.user_id))];

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, full_name, phone')
      .in('user_id', userIds);

    const ordersWithProfiles = ordersData.map(order => ({
      ...order,
      profiles: profilesData?.find(p => p.user_id === order.user_id) || null
    }));

    setOrders(ordersWithProfiles as Order[]);
    setLoading(false);
  };

  const filterBySearch = (order: Order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(query) ||
      order.product_details.toLowerCase().includes(query) ||
      order.product_url.toLowerCase().includes(query) ||
      order.profiles?.full_name?.toLowerCase().includes(query) ||
      order.profiles?.phone?.toLowerCase().includes(query)
    );
  };

  const getOrdersByStatus = (status: string) => {
    return orders.filter(o => o.status === status && filterBySearch(o));
  };

  const getStatusCount = (status: string) => {
    return orders.filter(o => o.status === status).length;
  };

  const openOrderDialog = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const renderOrderList = (status: string) => {
    const statusOrders = getOrdersByStatus(status);
    
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    if (statusOrders.length === 0) {
      const statusTab = statusTabs.find(t => t.value === status);
      const Icon = statusTab?.icon || Package;
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className={`w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4`}>
            <Icon className={`w-8 h-8 ${statusTab?.color || 'text-muted-foreground'}`} />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No Orders</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? 'No orders match your search' : `No ${statusTab?.label.toLowerCase()} orders`}
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statusOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onAction={openOrderDialog}
            actionLabel={status === 'pending' ? 'Send Quote' : 'Update'}
            actionIcon={status === 'pending' ? 'send' : 'truck'}
            showPrices={status !== 'pending'}
            showTracking={['buying', 'received_china', 'on_the_way', 'ready_pickup', 'completed'].includes(status)}
          />
        ))}
      </div>
    );
  };

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="p-4 md:p-6 space-y-4">
        {/* Search */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-2 -mb-2">
            <TabsList className="inline-flex h-auto p-1 bg-card border rounded-lg gap-1 min-w-max">
              {statusTabs.map((tab) => {
                const count = tab.value === 'settings' ? null : getStatusCount(tab.value);
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-1.5 px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md whitespace-nowrap"
                  >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.value ? '' : tab.color}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {count !== null && count > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-background/20">
                        {count}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Contents */}
          {statusTabs.filter(t => t.value !== 'settings').map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              {renderOrderList(tab.value)}
            </TabsContent>
          ))}

          <TabsContent value="settings" className="mt-4">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Dialog */}
      <AdminOrderDialog
        order={selectedOrder}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchOrders}
      />
    </div>
  );
}
