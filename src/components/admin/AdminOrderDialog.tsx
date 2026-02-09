import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Truck, DollarSign, Package, Plane, Ship } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { error as logError } from '@/lib/logger';

async function sendOrderPush(orderId: string, status: string) {
  try {
    const { error } = await supabase.functions.invoke('send-order-push', {
      body: { order_id: orderId, status },
    });
    if (error) {
      logError('Push invoke failed:', error);
    }
  } catch (err) {
    logError('Push invoke exception:', err);
  }
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
  shipping_cost_air: number | null;
  shipping_cost_sea: number | null;
  product_price: number | null;
  pickup_address: string | null;
  receipt_url: string | null;
  tracking_number: string | null;
  admin_benefit: number | null;
  transfer_fee?: number | null;
  amount_paid?: number | null;
  payment_notes?: string | null;
  created_at: string;
}

interface AdminOrderDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Removed 'accepted' from workflow - go directly to buying
const statusOptions = [
  { value: 'pending', label: 'Pending Review' },
  { value: 'quoted', label: 'Price Quoted' },
  { value: 'buying', label: 'Buying' },
  { value: 'received_china', label: 'Received in China' },
  { value: 'on_the_way', label: 'On the Way' },
  { value: 'ready_pickup', label: 'Ready for Pickup' },
  { value: 'completed', label: 'Completed' },
];

export function AdminOrderDialog({ order, open, onOpenChange, onSuccess }: AdminOrderDialogProps) {
  const [adminResponse, setAdminResponse] = useState('');
  const [shippingCostAir, setShippingCostAir] = useState('');
  const [shippingCostSea, setShippingCostSea] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminBenefit, setAdminBenefit] = useState('');
  const [transferFee, setTransferFee] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [loading, setLoading] = useState(false);
  // New: Selected shipping method when customer chose from "both"
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<'air' | 'sea' | ''>('');

  useEffect(() => {
    if (order) {
      setAdminResponse(order.admin_response || '');
      const airVal = order.shipping_cost_air ?? (order.shipping_method === 'air' ? order.shipping_cost : null);
      const seaVal = order.shipping_cost_sea ?? (order.shipping_method === 'sea' ? order.shipping_cost : null);
      setShippingCostAir(airVal != null ? airVal.toString() : '');
      setShippingCostSea(seaVal != null ? seaVal.toString() : '');
      setProductPrice(order.product_price?.toString() || '');
      setNewStatus(order.status);
      setPickupAddress(order.pickup_address || '');
      setReceiptUrl(order.receipt_url || '');
      setTrackingNumber(order.tracking_number || '');
      setAdminBenefit(order.admin_benefit?.toString() || '');
      setTransferFee(order.transfer_fee?.toString() || '');
      setAmountPaid(order.amount_paid?.toString() || '0');
      setPaymentNotes(order.payment_notes || '');
      // Reset selected shipping method
      setSelectedShippingMethod(order.shipping_method === 'both' ? '' : order.shipping_method);
    }
  }, [order]);

  // Calculate total and remaining
  const totalCost = useMemo(() => {
    const price = parseFloat(productPrice) || 0;
    const shipping = selectedShippingMethod === 'air' 
      ? (parseFloat(shippingCostAir) || 0)
      : selectedShippingMethod === 'sea'
        ? (parseFloat(shippingCostSea) || 0)
        : (parseFloat(shippingCostAir) || 0);
    const transfer = parseFloat(transferFee) || 0;
    return price + shipping + transfer;
  }, [productPrice, shippingCostAir, shippingCostSea, transferFee, selectedShippingMethod]);

  const amountRemaining = useMemo(() => {
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, totalCost - paid);
  }, [totalCost, amountPaid]);

  const handleQuote = async () => {
    if (!order) return;
    setLoading(true);

    const priceVal = parseFloat(productPrice) || null;
    const airVal = parseFloat(shippingCostAir) || null;
    const seaVal = parseFloat(shippingCostSea) || null;
    const transferVal = priceVal && priceVal > 30 && transferFee ? parseFloat(transferFee) : null;

    let shippingCostValue: number | null = null;
    if (order.shipping_method === 'both') {
      shippingCostValue = seaVal || airVal || 0;
    } else if (order.shipping_method === 'air') {
      shippingCostValue = airVal || null;
    } else {
      shippingCostValue = seaVal || null;
    }

    const resp = adminResponse && adminResponse.trim() ? adminResponse.trim() : null;

    const { error } = await supabase
      .from('orders')
      .update({
        admin_response: resp,
        shipping_cost_air: airVal,
        shipping_cost_sea: seaVal,
        shipping_cost: shippingCostValue,
        product_price: priceVal,
        admin_benefit: adminBenefit ? parseFloat(adminBenefit) : null,
        transfer_fee: transferVal,
        status: 'quoted',
      })
      .eq('id', order.id);

    setLoading(false);
    if (error) {
      toast.error('Failed to send quote');
    } else {
      toast.success('Quote sent successfully!');
      await sendOrderPush(order.id, 'quoted');
      onOpenChange(false);
      onSuccess();
    }
  };

  const handleStatusUpdate = async () => {
    if (!order || !newStatus) return;
    
    // Validate: If original was "both" and moving to buying, must select method
    if (order.shipping_method === 'both' && order.status === 'quoted' && newStatus === 'buying' && !selectedShippingMethod) {
      toast.error('Please select shipping method (Air or Sea)');
      return;
    }

    setLoading(true);

    const updateData: Record<string, unknown> = { status: newStatus };
    
    // Handle shipping method change for "both" orders
    if (order.shipping_method === 'both' && selectedShippingMethod) {
      updateData.shipping_method = selectedShippingMethod;
      const airVal = parseFloat(shippingCostAir) || null;
      const seaVal = parseFloat(shippingCostSea) || null;
      updateData.shipping_cost_air = airVal;
      updateData.shipping_cost_sea = seaVal;
      if (selectedShippingMethod === 'air') {
        updateData.shipping_cost = airVal || 0;
      } else {
        updateData.shipping_cost = seaVal || 0;
      }
    } else if (order.shipping_method === 'air' && shippingCostAir) {
      const airVal = parseFloat(shippingCostAir);
      updateData.shipping_cost = airVal;
      updateData.shipping_cost_air = airVal;
    } else if (order.shipping_method === 'sea' && shippingCostSea) {
      const seaVal = parseFloat(shippingCostSea);
      updateData.shipping_cost = seaVal;
      updateData.shipping_cost_sea = seaVal;
    }
    
    if (['buying', 'received_china', 'on_the_way', 'ready_pickup'].includes(newStatus) && trackingNumber) {
      updateData.tracking_number = trackingNumber;
    }
    
    if (newStatus === 'ready_pickup') {
      updateData.pickup_address = pickupAddress;
      updateData.receipt_url = receiptUrl;
    }
    
    updateData.amount_paid = parseFloat(amountPaid) || 0;
    if (paymentNotes) {
      updateData.payment_notes = paymentNotes;
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order.id);

    setLoading(false);
    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated!');
      await sendOrderPush(order.id, newStatus);
      onOpenChange(false);
      onSuccess();
    }
  };

  if (!order) return null;

  const isPending = order.status === 'pending';
  const isQuoted = order.status === 'quoted';
  const showShippingMethodChoice = order.shipping_method === 'both' && isQuoted;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {isPending ? 'Send Quote' : 'Update Order'}
          </DialogTitle>
          <DialogDescription>
            Order #{order.id.slice(0, 8)} • {order.shipping_method === 'air' ? '✈️ Air' : order.shipping_method === 'sea' ? '🚢 Sea' : '✈️🚢 Both'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isPending ? (
            <>
              <div className="space-y-2">
                <Label>Response Message</Label>
                <Textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Enter your response..."
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label>🏷️ Product Price ($)</Label>
                <Input
                  type="number"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              {order.shipping_method === 'both' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>✈️ Air ($)</Label>
                    <Input
                      type="number"
                      value={shippingCostAir}
                      onChange={(e) => setShippingCostAir(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>🚢 Sea ($)</Label>
                    <Input
                      type="number"
                      value={shippingCostSea}
                      onChange={(e) => setShippingCostSea(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ) : order.shipping_method === 'air' ? (
                <div className="space-y-2">
                  <Label>✈️ Air Shipping ($)</Label>
                  <Input
                    type="number"
                    value={shippingCostAir}
                    onChange={(e) => setShippingCostAir(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>🚢 Sea Shipping ($)</Label>
                  <Input
                    type="number"
                    value={shippingCostSea}
                    onChange={(e) => setShippingCostSea(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              )}
              
              <div className="space-y-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                <Label className="text-emerald-600">💰 Your Benefit ($)</Label>
                <Input
                  type="number"
                  value={adminBenefit}
                  onChange={(e) => setAdminBenefit(e.target.value)}
                  placeholder="0.00"
                  className="border-emerald-500/30"
                />
              </div>
              
              {parseFloat(productPrice) > 30 && (
                <div className="space-y-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <Label className="text-amber-600">💸 Transfer Fee ($)</Label>
                  <Input
                    type="number"
                    value={transferFee}
                    onChange={(e) => setTransferFee(e.target.value)}
                    placeholder="0.00"
                    className="border-amber-500/30"
                  />
                </div>
              )}
              
              <Button className="w-full" onClick={handleQuote} disabled={loading}>
                <Send className="w-4 h-4 mr-2" />
                Send Quote
              </Button>
            </>
          ) : (
            <>
              {/* Shipping Method Selection for "both" orders in quoted status */}
              {showShippingMethodChoice && (
                <div className="space-y-2 p-3 bg-primary/10 rounded-lg border border-primary/30">
                  <Label className="text-primary font-medium">🚚 Customer chose which shipping?</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      type="button"
                      variant={selectedShippingMethod === 'air' ? 'default' : 'outline'}
                      className="flex items-center gap-2"
                      onClick={() => setSelectedShippingMethod('air')}
                    >
                      <Plane className="w-4 h-4" />
                      Air ✈️
                    </Button>
                    <Button
                      type="button"
                      variant={selectedShippingMethod === 'sea' ? 'default' : 'outline'}
                      className="flex items-center gap-2"
                      onClick={() => setSelectedShippingMethod('sea')}
                    >
                      <Ship className="w-4 h-4" />
                      Sea 🚢
                    </Button>
                  </div>
                  {selectedShippingMethod && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected: <span className="font-medium text-foreground">{selectedShippingMethod === 'air' ? 'Air ✈️' : 'Sea 🚢'}</span>
                      {' • '}Shipping: ${selectedShippingMethod === 'air' ? shippingCostAir || '0' : shippingCostSea || '0'}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Show shipping costs for editing - only for non-both orders or after method is selected */}
              {order.shipping_method !== 'both' && (
                order.shipping_method === 'air' ? (
                  <div className="space-y-2">
                    <Label>✈️ Air ($)</Label>
                    <Input
                      type="number"
                      value={shippingCostAir}
                      onChange={(e) => setShippingCostAir(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>🚢 Sea ($)</Label>
                    <Input
                      type="number"
                      value={shippingCostSea}
                      onChange={(e) => setShippingCostSea(e.target.value)}
                    />
                  </div>
                )
              )}

              {['buying', 'received_china', 'on_the_way', 'ready_pickup'].includes(newStatus) && (
                <div className="space-y-2">
                  <Label>📦 Tracking Number</Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number..."
                  />
                </div>
              )}

              {newStatus === 'ready_pickup' && (
                <>
                  <div className="space-y-2">
                    <Label>📍 Pickup Address</Label>
                    <Textarea
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="Enter pickup address..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>🧾 Receipt URL</Label>
                    <Input
                      value={receiptUrl}
                      onChange={(e) => setReceiptUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}

              {/* Payment Tracking Section */}
              <div className="space-y-3 p-3 bg-sky-500/10 rounded-lg border border-sky-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-600 font-medium text-sm">
                    <DollarSign className="w-4 h-4" />
                    Payment Tracking
                  </div>
                  {totalCost > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Total: <span className="font-semibold text-foreground">${totalCost.toFixed(2)}</span>
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">💵 Paid ($)</Label>
                    <Input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0.00"
                      className="border-sky-500/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">⏳ Remaining ($)</Label>
                    <div className={`h-9 px-3 flex items-center rounded-md border text-sm font-medium ${
                      amountRemaining > 0 ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                    }`}>
                      ${amountRemaining.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">📝 Payment Notes</Label>
                  <Input
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="e.g. First payment via FIB..."
                    className="border-sky-500/30"
                  />
                </div>
              </div>

              <Button className="w-full" onClick={handleStatusUpdate} disabled={loading}>
                <Truck className="w-4 h-4 mr-2" />
                {isQuoted && newStatus === 'buying' ? 'Move to Buying' : 'Update Status'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
