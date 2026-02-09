import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calculator, Package, Info, DollarSign, ChevronRight } from 'lucide-react';

type Unit = 'mm' | 'cm' | 'm';
type Mode = 'select' | 'calculate' | 'cost';

export default function CBMCalculator() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('select');
  const [unit, setUnit] = useState<Unit>('cm');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [cbmPrice, setCbmPrice] = useState<number>(100);
  const [cbmInput, setCbmInput] = useState('');

  useEffect(() => {
    fetchCBMPrice();
  }, []);

  const fetchCBMPrice = async () => {
    // Use the secure function to get public settings
    const { data, error } = await supabase.rpc('get_public_setting', {
      _key: 'cbm_price'
    });
    
    if (data) {
      setCbmPrice(parseFloat(data) || 100);
    }
  };

  // Convert to meters based on selected unit
  const toMeters = (value: number): number => {
    switch (unit) {
      case 'mm': return value / 1000;
      case 'cm': return value / 100;
      case 'm': return value;
      default: return value;
    }
  };

  // Calculate CBM from dimensions
  const calculateCBM = (): number => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;

    const lMeters = toMeters(l);
    const wMeters = toMeters(w);
    const hMeters = toMeters(h);

    return lMeters * wMeters * hMeters;
  };

  const cbm = calculateCBM();
  const estimatedCost = cbm * cbmPrice;

  // Calculate cost from CBM input
  const cbmInputValue = parseFloat(cbmInput) || 0;
  const costFromCbm = cbmInputValue * cbmPrice;


  const handleBack = () => {
    if (mode === 'select') {
      navigate('/home');
    } else {
      setMode('select');
    }
  };

  // Selection mode - show two options
  if (mode === 'select') {
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
                <h1 className="font-semibold text-foreground flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  {t('cbmCalculator')}
                </h1>
                <p className="text-xs text-muted-foreground">{t('cbmCalculatorDesc')}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-xl">
          <div className="space-y-3">
            {/* Calculate CBM Option */}
            <Card 
              className="card-clean hover-lift cursor-pointer animate-fade-in"
              onClick={() => setMode('calculate')}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{t('calculateCbm')}</h3>
                    <p className="text-sm text-muted-foreground">{t('calculateCbmDesc')}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Check Cost by CBM Option */}
            <Card 
              className="card-clean hover-lift cursor-pointer animate-fade-in"
              style={{ animationDelay: '0.1s' }}
              onClick={() => setMode('cost')}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{t('checkCostByCbm')}</h3>
                    <p className="text-sm text-muted-foreground">{t('checkCostByCbmDesc')}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Cost by CBM mode
  if (mode === 'cost') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
              <div>
                <h1 className="font-semibold text-foreground flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {t('checkCostByCbm')}
                </h1>
                <p className="text-xs text-muted-foreground">{t('checkCostByCbmDesc')}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-lg">
          {/* Input Card */}
          <Card className="mb-4 animate-fade-in card-clean">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <Calculator className="w-4 h-4" />
                {t('enterCbmValue')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('cbmValue')} (m³)</Label>
                <Input
                  type="number"
                  value={cbmInput}
                  onChange={(e) => setCbmInput(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              {/* Current CBM Price */}
              <div className="flex items-center gap-2 bg-secondary p-3 rounded-lg">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t('currentCbmPrice')}: <span className="font-medium text-primary">${cbmPrice} {t('perCBM')}</span>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="animate-fade-in card-clean" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <DollarSign className="w-4 h-4" />
                {t('results')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Estimated Cost */}
              <div className="bg-primary p-5 rounded-xl text-center">
                <p className="text-sm text-primary-foreground/80 mb-1">{t('estimatedCost')}</p>
                <p className="text-3xl font-bold text-primary-foreground">${costFromCbm.toFixed(2)}</p>
              </div>

              {/* Price Disclaimer */}
              <div className="flex items-start gap-2 bg-status-pending/10 border border-status-pending/20 p-3 rounded-lg">
                <Info className="w-4 h-4 text-status-pending mt-0.5 flex-shrink-0" />
                <p className="text-xs text-status-pending">{t('priceDisclaimer')}</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Calculate CBM mode (original calculator)
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <div>
              <h1 className="font-semibold text-foreground flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                {t('calculateCbm')}
              </h1>
              <p className="text-xs text-muted-foreground">{t('calculateCbmDesc')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Input Card */}
        <Card className="mb-4 animate-fade-in card-clean">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Package className="w-4 h-4" />
              {t('dimensions')}
            </CardTitle>
            <CardDescription>{t('enterDimensions')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Unit Selector */}
            <div className="space-y-2">
              <Label>{t('unitOfMeasurement')}</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mm">{t('millimeter')} (mm)</SelectItem>
                  <SelectItem value="cm">{t('centimeter')} (cm)</SelectItem>
                  <SelectItem value="m">{t('meter')} (m)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>{t('length')}</Label>
                <Input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('width')}</Label>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('height')}</Label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Results Card */}
        <Card className="animate-fade-in card-clean" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Calculator className="w-4 h-4" />
              {t('results')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Volume */}
            <div className="bg-primary p-4 rounded-xl text-center">
              <p className="text-sm text-primary-foreground/80 mb-1">{t('volume')}</p>
              <p className="text-2xl font-bold text-primary-foreground">{cbm.toFixed(4)} m³</p>
            </div>

            {/* Estimated Cost */}
            <div className="bg-secondary p-4 rounded-xl text-center">
              <p className="text-sm text-muted-foreground mb-1">{t('estimatedCost')}</p>
              <p className="text-xl font-bold text-foreground">${estimatedCost.toFixed(2)}</p>
            </div>

            {/* Price Disclaimer */}
            <div className="flex items-start gap-2 bg-status-pending/10 border border-status-pending/20 p-3 rounded-lg">
              <Info className="w-4 h-4 text-status-pending mt-0.5 flex-shrink-0" />
              <p className="text-xs text-status-pending">{t('priceDisclaimer')}</p>
            </div>

          </CardContent>
        </Card>
      </main>
    </div>
  );
}