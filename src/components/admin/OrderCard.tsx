import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, ExternalLink, Send, Truck, Clock, CheckCircle } from 'lucide-react';

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
  created_at: string;
  profiles?: OrderProfile;
}

interface OrderCardProps {
  order: Order;
  onAction: (order: Order) => void;
  actionLabel?: string;
  actionIcon?: 'send' | 'truck' | 'check';
  showPrices?: boolean;
  showTracking?: boolean;
  compact?: boolean;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  quoted: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  buying: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
  received_china: 'bg-cyan-500/20 text-cyan-600 border-cyan-500/30',
  on_the_way: 'bg-indigo-500/20 text-indigo-600 border-indigo-500/30',
  ready_pickup: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
  completed: 'bg-green-500/20 text-green-600 border-green-500/30',
};

const statusBorderColors: Record<string, string> = {
  pending: 'border-l-amber-500',
  quoted: 'border-l-blue-500',
  buying: 'border-l-purple-500',
  received_china: 'border-l-cyan-500',
  on_the_way: 'border-l-indigo-500',
  ready_pickup: 'border-l-emerald-500',
  completed: 'border-l-green-500',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  quoted: 'Quoted',
  buying: 'Buying',
  received_china: 'In China',
  on_the_way: 'On Way',
  ready_pickup: 'Ready',
  completed: 'Completed',
};

const formatShippingMethod = (method: string) => {
  const methods: Record<string, string> = {
    sea: '🚢 Sea',
    air: '✈️ Air',
    both: '🚢✈️ Both',
  };
  return methods[method] || method;
};

export function OrderCard({ 
  order, 
  onAction, 
  actionLabel = 'Update',
  actionIcon = 'truck',
  showPrices = false,
  showTracking = false,
  compact = false 
}: OrderCardProps) {
  const ActionIcon = actionIcon === 'send' ? Send : actionIcon === 'check' ? CheckCircle : Truck;

  return (
    <Card className={`hover:shadow-md transition-shadow border-l-4 ${statusBorderColors[order.status] || 'border-l-primary'}`}>
      <CardHeader className={compact ? 'pb-2 pt-3 px-4' : 'pb-3'}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 flex-wrap">
              <span className="font-mono text-muted-foreground">#{order.id.slice(0, 8)}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[order.status]}`}>
                {statusLabels[order.status]}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatShippingMethod(order.shipping_method)}
              </span>
            </CardTitle>
            <CardDescription className="mt-1 space-y-0.5">
              <span className="flex items-center gap-1.5 text-foreground font-medium">
                <User className="w-3 h-3" />
                {order.profiles?.full_name || 'Unknown'}
              </span>
              {order.profiles?.phone && (
                <a 
                  href={`https://wa.me/${order.profiles.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:underline text-xs"
                >
                  <Phone className="w-3 h-3" />
                  {order.profiles.phone}
                </a>
              )}
            </CardDescription>
          </div>
          <div className="text-right text-xs text-muted-foreground shrink-0">
            <Clock className="w-3 h-3 inline mr-1" />
            {new Date(order.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={compact ? 'pt-0 px-4 pb-3' : 'space-y-3'}>
        {/* Product Details */}
        <div className="bg-muted/50 rounded-lg p-2.5">
          <p className="text-xs text-muted-foreground mb-1">Product Details</p>
          <p className="text-sm text-foreground line-clamp-2">{order.product_details}</p>
          {order.product_url && (
            <a 
              href={order.product_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
            >
              View Product <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Prices */}
        {showPrices && (order.product_price || order.shipping_cost) && (
          <div className="flex gap-3 text-sm">
            {order.product_price && (
              <span className="text-foreground">
                <span className="text-muted-foreground">Price:</span> ${order.product_price}
              </span>
            )}
            {order.shipping_cost && (
              <span className="text-foreground">
                <span className="text-muted-foreground">Shipping:</span> ${order.shipping_cost}
              </span>
            )}
          </div>
        )}

        {/* Tracking */}
        {showTracking && order.tracking_number && (
          <div className="text-sm">
            <span className="text-muted-foreground">📦 Tracking:</span>{' '}
            <span className="font-mono text-foreground">{order.tracking_number}</span>
          </div>
        )}

        {/* Action Button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAction(order)}
          className="w-full mt-2"
        >
          <ActionIcon className="w-4 h-4 mr-1" />
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
