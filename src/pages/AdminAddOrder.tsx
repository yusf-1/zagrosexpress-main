 import { useState, useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '@/contexts/AuthContext';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { supabase } from '@/integrations/supabase/client';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { ArrowLeft, Search, User, Link as LinkIcon, FileText, Ship, Plane, Package, Loader2, CheckCircle } from 'lucide-react';
 import { toast } from 'sonner';
 
 interface CustomerProfile {
   user_id: string;
   full_name: string | null;
   phone: string | null;
 }
 
 type ShippingMethod = 'sea' | 'air' | 'both';
 
 export default function AdminAddOrder() {
   const [searchPhone, setSearchPhone] = useState('');
   const [searching, setSearching] = useState(false);
   const [customer, setCustomer] = useState<CustomerProfile | null>(null);
   const [notFound, setNotFound] = useState(false);
   
   // Order form
   const [productUrl, setProductUrl] = useState('');
   const [productDetails, setProductDetails] = useState('');
   const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null);
   const [loading, setLoading] = useState(false);
   
   const { isAdmin } = useAuth();
   const { t, isRTL } = useLanguage();
   const navigate = useNavigate();
 
   useEffect(() => {
     if (!isAdmin) {
       navigate('/home');
     }
   }, [isAdmin, navigate]);
 
   const handleSearchCustomer = async () => {
     if (!searchPhone.trim()) return;
     
     setSearching(true);
     setCustomer(null);
     setNotFound(false);
     
     // Normalize phone number - remove spaces and leading zeros
     const normalizedPhone = searchPhone.trim().replace(/\s/g, '');
     
     const { data, error } = await supabase
       .from('profiles')
       .select('user_id, full_name, phone')
       .or(`phone.ilike.%${normalizedPhone}%,phone.ilike.%${normalizedPhone.replace(/^0+/, '')}%`)
       .limit(1);
     
     if (error || !data || data.length === 0) {
       setNotFound(true);
     } else {
       setCustomer(data[0]);
     }
     
     setSearching(false);
   };
 
   const handleSubmitOrder = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!customer) {
       toast.error(t('selectCustomerFirst') || 'Please search and select a customer first');
       return;
     }
     
    if (!shippingMethod) {
      toast.error(t('selectShippingMethod') || 'Please select a shipping method');
       return;
     }
     
     setLoading(true);
     
     try {
       const { error } = await supabase.from('orders').insert({
         user_id: customer.user_id,
        product_url: productUrl.trim() || '-',
        product_details: productDetails.trim() || '-',
         shipping_method: shippingMethod,
         status: 'pending'
       });
       
       if (error) throw error;
       
       toast.success(t('orderCreatedForCustomer') || 'Order created for customer!');
       navigate('/admin');
     } catch (err) {
       toast.error(t('failedToAdd') || 'Failed to create order');
     } finally {
       setLoading(false);
     }
   };
 
   const shippingOptions = [
     { value: 'sea' as const, label: t('bySea'), icon: Ship, description: 'Slower but cheaper' },
     { value: 'air' as const, label: t('byAir'), icon: Plane, description: 'Faster delivery' },
     { value: 'both' as const, label: t('both'), icon: Package, description: 'We recommend' }
   ];
 
   const clearCustomer = () => {
     setCustomer(null);
     setNotFound(false);
     setSearchPhone('');
   };
 
    return (
      <div className="min-h-screen bg-gradient-hero">
        <main className="container mx-auto px-4 py-6 max-w-lg">
          <h1 className="font-bold text-foreground text-xl mb-2">{t('addOrderForCustomer') || 'Add Order for Customer'}</h1>
          <p className="text-sm text-muted-foreground mb-6">{t('createOrderOnBehalf') || 'Create order on behalf of WhatsApp customer'}</p>
         {/* Customer Search */}
         <Card className="mb-6">
           <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2">
               <User className="w-5 h-5" />
               {t('findCustomer') || 'Find Customer'}
             </CardTitle>
             <CardDescription>
               {t('searchByWhatsApp') || 'Search by WhatsApp number'}
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="flex gap-2">
               <Input
                 type="tel"
                 placeholder={t('enterWhatsAppNumber') || 'Enter WhatsApp number...'}
                 value={searchPhone}
                 onChange={(e) => setSearchPhone(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSearchCustomer()}
               />
               <Button onClick={handleSearchCustomer} disabled={searching || !searchPhone.trim()}>
                 {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
               </Button>
             </div>
             
             {/* Customer Found */}
             {customer && (
               <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                 <div className="flex items-center gap-3">
                   <CheckCircle className="w-5 h-5 text-green-500" />
                   <div>
                     <p className="font-medium text-foreground">{customer.full_name || 'Unknown'}</p>
                     <p className="text-sm text-muted-foreground">{customer.phone}</p>
                   </div>
                 </div>
                 <Button variant="ghost" size="sm" onClick={clearCustomer}>
                   {t('change') || 'Change'}
                 </Button>
               </div>
             )}
             
             {/* Not Found */}
             {notFound && (
               <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
                 <p className="text-sm text-destructive">{t('customerNotFound') || 'Customer not found with this number'}</p>
               </div>
             )}
           </CardContent>
         </Card>
 
         {/* Order Form - Only show when customer is selected */}
         {customer && (
           <Card className="animate-fade-in">
             <CardHeader>
               <CardTitle className="text-lg">{t('orderDetails') || 'Order Details'}</CardTitle>
               <CardDescription>
                 {t('enterOrderInfo') || 'Enter the order information'}
               </CardDescription>
             </CardHeader>
             <CardContent>
               <form onSubmit={handleSubmitOrder} className="space-y-5">
                 {/* Product URL */}
                 <div className="space-y-2">
                   <Label htmlFor="productUrl">{t('productUrl')}</Label>
                   <div className="relative">
                     <LinkIcon className={`absolute top-3 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                     <Input
                       id="productUrl"
                       type="url"
                       value={productUrl}
                       onChange={(e) => setProductUrl(e.target.value)}
                       className={`${isRTL ? 'pr-10' : 'pl-10'}`}
                       placeholder="https://..."
                     />
                   </div>
                 </div>
 
                 {/* Product Details */}
                 <div className="space-y-2">
                   <Label htmlFor="productDetails">{t('productDetails')}</Label>
                   <div className="relative">
                     <FileText className={`absolute top-3 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                     <Textarea
                       id="productDetails"
                       value={productDetails}
                       onChange={(e) => setProductDetails(e.target.value)}
                       className={`min-h-[100px] ${isRTL ? 'pr-10' : 'pl-10'}`}
                       placeholder="Size, color, quantity, etc..."
                     />
                   </div>
                 </div>
 
                 {/* Shipping Method */}
                 <div className="space-y-3">
                   <Label>{t('shippingMethod')}</Label>
                   <div className="grid grid-cols-3 gap-2">
                     {shippingOptions.map((option) => (
                       <button
                         key={option.value}
                         type="button"
                         onClick={() => setShippingMethod(option.value)}
                         className={`p-3 rounded-lg border-2 transition-all ${
                           shippingMethod === option.value
                             ? 'border-primary bg-primary/5'
                             : 'border-border bg-card hover:border-primary/50'
                         }`}
                       >
                         <option.icon
                           className={`w-5 h-5 mx-auto mb-1.5 ${
                             shippingMethod === option.value ? 'text-primary' : 'text-muted-foreground'
                           }`}
                         />
                         <p className={`text-xs font-medium ${shippingMethod === option.value ? 'text-primary' : 'text-foreground'}`}>
                           {option.label}
                         </p>
                         <p className="text-[10px] text-muted-foreground mt-0.5">{option.description}</p>
                       </button>
                     ))}
                   </div>
                 </div>
 
                 <Button type="submit" size="lg" className="w-full" disabled={loading}>
                   {loading ? (
                     <>
                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                       {t('creating') || 'Creating...'}
                     </>
                   ) : (
                     t('createOrder') || 'Create Order'
                   )}
                 </Button>
               </form>
             </CardContent>
           </Card>
         )}
       </main>
     </div>
   );
 }