import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export function AdminSettings() {
  const { t } = useLanguage();
  const [cbmPrice, setCbmPrice] = useState('');
  const [cbmPriceLoading, setCbmPriceLoading] = useState(false);
  const [cbmLastUpdated, setCbmLastUpdated] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState('');
  const [exchangeRateLoading, setExchangeRateLoading] = useState(false);
  const [exchangeRateLastUpdated, setExchangeRateLastUpdated] = useState<string | null>(null);
  const [rmbExchangeRate, setRmbExchangeRate] = useState('');
  const [rmbExchangeRateLoading, setRmbExchangeRateLoading] = useState(false);
  const [rmbExchangeRateLastUpdated, setRmbExchangeRateLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const [cbmData, exchangeData, rmbData] = await Promise.all([
      supabase.from('settings').select('value, updated_at').eq('key', 'cbm_price').single(),
      supabase.from('settings').select('value, updated_at').eq('key', 'exchange_rate').maybeSingle(),
      supabase.from('settings').select('value, updated_at').eq('key', 'rmb_exchange_rate').maybeSingle(),
    ]);

    if (cbmData.data) {
      setCbmPrice(cbmData.data.value);
      setCbmLastUpdated(cbmData.data.updated_at);
    }
    if (exchangeData.data) {
      setExchangeRate(exchangeData.data.value);
      setExchangeRateLastUpdated(exchangeData.data.updated_at);
    }
    if (rmbData.data) {
      setRmbExchangeRate(rmbData.data.value);
      setRmbExchangeRateLastUpdated(rmbData.data.updated_at);
    }
  };

  const saveSetting = async (key: string, value: string, setLoading: (v: boolean) => void) => {
    if (!value) return;
    setLoading(true);

    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .eq('key', key)
      .maybeSingle();

    const operation = existing
      ? supabase.from('settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key)
      : supabase.from('settings').insert({ key, value });

    const { error } = await operation;
    setLoading(false);

    if (error) {
      toast.error('Failed to save');
    } else {
      toast.success('Saved successfully!');
      fetchSettings();
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* CBM Price */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {t('cbmPriceRate')}
          </CardTitle>
          <CardDescription className="text-xs">
            Price per cubic meter for shipping
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-muted-foreground">$</span>
            <Input
              type="number"
              value={cbmPrice}
              onChange={(e) => setCbmPrice(e.target.value)}
              placeholder="100"
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground">/CBM</span>
          </div>
          <Button 
            size="sm"
            className="w-full" 
            onClick={() => saveSetting('cbm_price', cbmPrice, setCbmPriceLoading)}
            disabled={cbmPriceLoading}
          >
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
          {cbmLastUpdated && (
            <p className="text-[10px] text-muted-foreground text-center">
              Updated: {new Date(cbmLastUpdated).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* USD to IQD */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            USD → IQD
          </CardTitle>
          <CardDescription className="text-xs">
            Exchange rate for customer display
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">1$ =</span>
            <Input
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              placeholder="1500"
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground">IQD</span>
          </div>
          <Button 
            size="sm"
            className="w-full" 
            onClick={() => saveSetting('exchange_rate', exchangeRate, setExchangeRateLoading)}
            disabled={exchangeRateLoading}
          >
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
          {exchangeRateLastUpdated && (
            <p className="text-[10px] text-muted-foreground text-center">
              Updated: {new Date(exchangeRateLastUpdated).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* RMB to USD */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            RMB → USD
          </CardTitle>
          <CardDescription className="text-xs">
            Chinese Yuan conversion rate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">1$ =</span>
            <Input
              type="number"
              value={rmbExchangeRate}
              onChange={(e) => setRmbExchangeRate(e.target.value)}
              placeholder="7"
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground">RMB</span>
          </div>
          <Button 
            size="sm"
            className="w-full" 
            onClick={() => saveSetting('rmb_exchange_rate', rmbExchangeRate, setRmbExchangeRateLoading)}
            disabled={rmbExchangeRateLoading}
          >
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
          {rmbExchangeRateLastUpdated && (
            <p className="text-[10px] text-muted-foreground text-center">
              Updated: {new Date(rmbExchangeRateLastUpdated).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
