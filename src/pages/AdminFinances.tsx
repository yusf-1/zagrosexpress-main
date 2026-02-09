import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, TrendingUp, TrendingDown, DollarSign, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface Finance {
  id: string;
  type: 'income' | 'cost';
  amount: number;
  description: string;
  category: string | null;
  created_at: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AdminFinances = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  
  const [finances, setFinances] = useState<Finance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<'income' | 'cost'>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    checkAdminAndLoadData();
  }, [user]);

  const checkAdminAndLoadData = async () => {
    if (!user) return;
    
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (!roleData) {
      navigate('/home');
      return;
    }
    
    setIsAdmin(true);
    loadFinances();
  };

  const loadFinances = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('finances')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: "Error loading finances", variant: "destructive" });
    } else {
      setFinances((data || []) as Finance[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !amount || !description) return;
    
    const { error } = await supabase.from('finances').insert({
      type,
      amount: parseFloat(amount),
      description,
      category: category || null,
      created_by: user.id
    });
    
    if (error) {
      toast({ title: "Error adding record", variant: "destructive" });
    } else {
      toast({ title: "Record added successfully" });
      setShowForm(false);
      setAmount('');
      setDescription('');
      setCategory('');
      loadFinances();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('finances').delete().eq('id', id);
    
    if (error) {
      toast({ title: "Error deleting record", variant: "destructive" });
    } else {
      toast({ title: "Record deleted" });
      loadFinances();
    }
  };

  // Filter finances by selected month
  const filteredFinances = useMemo(() => {
    return finances.filter(f => {
      const date = new Date(f.created_at);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
  }, [finances, selectedMonth, selectedYear]);

  const totalIncome = filteredFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + Number(f.amount), 0);
  const totalCosts = filteredFinances.filter(f => f.type === 'cost').reduce((sum, f) => sum + Number(f.amount), 0);
  const netProfit = totalIncome - totalCosts;

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-4">Financial Management</h1>
        {/* Month Selector */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-center">
                <h2 className="text-lg font-bold text-foreground">{MONTHS[selectedMonth]}</h2>
                <p className="text-sm text-muted-foreground">{selectedYear}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-500/10 border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-500">${totalIncome.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="bg-red-500/10 border-red-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Total Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-500">${totalCosts.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className={`${netProfit >= 0 ? 'bg-primary/10 border-primary/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className={`h-4 w-4 ${netProfit >= 0 ? 'text-primary' : 'text-orange-500'}`} />
                Net Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-orange-500'}`}>
                ${netProfit.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Button */}
        <Button onClick={() => setShowForm(!showForm)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New Record
        </Button>

        {/* Add Form */}
        {showForm && (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={type} onValueChange={(v: 'income' | 'cost') => setType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="cost">Cost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Category (optional)</Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Shipping, Supplies, Sales"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this transaction..."
                    required
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Records List */}
        <div className="space-y-2">
          <h2 className="font-semibold text-foreground">{MONTHS[selectedMonth]} {selectedYear} Records</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredFinances.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No records for {MONTHS[selectedMonth]} {selectedYear}. Add your first income or cost.
              </CardContent>
            </Card>
          ) : (
            filteredFinances.map((finance) => (
              <Card key={finance.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${finance.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {finance.type === 'income' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{finance.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {finance.category && `${finance.category} • `}
                          {new Date(finance.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${finance.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {finance.type === 'income' ? '+' : '-'}${Number(finance.amount).toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(finance.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFinances;
