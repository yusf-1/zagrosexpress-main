import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link as LinkIcon, FileText, Ship, Plane, Package, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
 import BottomNav from '@/components/BottomNav';
import alibabaLogo from '@/assets/alibaba-logo.webp';
import taobaoLogo from '@/assets/taobao-logo.png';
import logo1688 from '@/assets/1688-logo.png';

const orderSchema = z.object({
  productUrl: z.string().url('Please enter a valid URL').max(2000),
  productDetails: z.string().min(10, 'Please provide more details').max(2000),
  shippingMethod: z.enum(['sea', 'air', 'both'])
});
type ShippingMethod = 'sea' | 'air' | 'both';
export default function PlaceOrder() {
  const [productUrl, setProductUrl] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [quantity, setQuantity] = useState('');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const {
    user
  } = useAuth();
  const {
    t,
    isRTL
  } = useLanguage();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!shippingMethod) {
      setErrors({
        shippingMethod: 'Please select a shipping method'
      });
      return;
    }
    const result = orderSchema.safeParse({
      productUrl,
      productDetails,
      shippingMethod
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      // Include quantity in product details if provided
      const detailsWithQuantity = quantity 
        ? `${t('quantity')}: ${quantity} pcs\n\n${productDetails}`
        : productDetails;
      
      const {
        error
      } = await supabase.from('orders').insert({
        user_id: user?.id,
        product_url: productUrl,
        product_details: detailsWithQuantity,
        shipping_method: shippingMethod,
        status: 'pending'
      });
      if (error) throw error;
      toast.success(t('orderSubmitted'));
      navigate('/my-orders');
    } catch (err) {
      toast.error('Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const shippingOptions = [{
    value: 'sea' as const,
    label: t('bySea'),
    icon: Ship,
    description: 'Slower but cheaper'
  }, {
    value: 'air' as const,
    label: t('byAir'),
    icon: Plane,
    description: 'Faster delivery'
  }, {
    value: 'both' as const,
    label: t('both'),
    icon: Package,
    description: 'We recommend'
  }];
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            <img src={alibabaLogo} alt="Alibaba" className="h-12 w-12 object-contain rounded-lg" />
            <img src={taobaoLogo} alt="Taobao" className="h-12 w-12 object-contain rounded-lg" />
            <img src={logo1688} alt="1688" className="h-12 w-12 object-contain rounded-lg" />
          </div>
        </div>
      </header>

       <main className="container mx-auto px-4 pt-4 pb-24">
         <Card className="max-w-lg mx-auto animate-fade-in card-clean">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">{t('placeOrder')}</CardTitle>
            <CardDescription>تکایە لینکی بابەتەکەت بنێرە ، وە لە خوارەوەش وردەکاریەکان بنووسە بۆ ئەوەی بزانین چ رەنگێکە یاخود چ قیاسێکە دەتەوێ داوای بکەی</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product URL */}
              <div className="space-y-2">
                <Label htmlFor="productUrl">{t('productUrl')}</Label>
                <div className="relative">
                  <LinkIcon className={`absolute top-3 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input id="productUrl" type="url" value={productUrl} onChange={e => setProductUrl(e.target.value)} className={`${isRTL ? 'pr-10' : 'pl-10'}`} placeholder="https://..." />
                </div>
                {errors.productUrl && <p className="text-sm text-destructive">{errors.productUrl}</p>}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">{t('quantity')}</Label>
                <div className="relative">
                  <Hash className={`absolute top-3 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input 
                    id="quantity" 
                    type="number" 
                    min="1"
                    value={quantity} 
                    onChange={e => setQuantity(e.target.value)} 
                    className={`${isRTL ? 'pr-10' : 'pl-10'}`} 
                    placeholder={t('howManyPcs')} 
                  />
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-2">
                <Label htmlFor="productDetails">{t('productDetails')}</Label>
                <div className="relative">
                  <FileText className={`absolute top-3 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Textarea id="productDetails" value={productDetails} onChange={e => setProductDetails(e.target.value)} className={`min-h-[100px] ${isRTL ? 'pr-10' : 'pl-10'}`} placeholder="Describe what you want: size, color, quantity, etc..." />
                </div>
                {errors.productDetails && <p className="text-sm text-destructive">{errors.productDetails}</p>}
              </div>

              {/* Shipping Method */}
              <div className="space-y-3">
                <Label>{t('shippingMethod')}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {shippingOptions.map(option => <button key={option.value} type="button" onClick={() => setShippingMethod(option.value)} className={`p-3 rounded-lg border-2 transition-all ${shippingMethod === option.value ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'}`}>
                      <option.icon className={`w-5 h-5 mx-auto mb-1.5 ${shippingMethod === option.value ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className={`text-xs font-medium ${shippingMethod === option.value ? 'text-primary' : 'text-foreground'}`}>
                        {option.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{option.description}</p>
                    </button>)}
                </div>
                {errors.shippingMethod && <p className="text-sm text-destructive">{errors.shippingMethod}</p>}
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : t('submitOrder')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
       
       <BottomNav />
     </div>;
}