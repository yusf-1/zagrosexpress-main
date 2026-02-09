import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, Loader2, Key, User, Smartphone, Copy, RefreshCw, Users, Search, Phone } from "lucide-react";
import { toast } from "sonner";

interface CustomerPassword {
  id: string;
  password: string;
  customer_name: string;
  device_id: string | null;
  is_active: boolean;
  is_shared: boolean;
  used_at: string | null;
  created_at: string;
}

interface RegisteredCustomer {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
}

// Generate a random password
const generatePassword = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export default function AdminCustomerPasswords() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { t, isRTL } = useLanguage();
  
  const [passwords, setPasswords] = useState<CustomerPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isShared, setIsShared] = useState(false);
  
  // Customer search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RegisteredCustomer[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<RegisteredCustomer | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/home");
      return;
    }
    fetchPasswords();
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (dialogOpen) {
      setGeneratedPassword(generatePassword());
      setCustomerName("");
      setIsShared(false);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedCustomer(null);
    }
  }, [dialogOpen]);

  const searchCustomers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, phone")
      .or(`phone.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10);
    
    setSearchResults(data || []);
    setSearchLoading(false);
  };

  const handleSelectCustomer = (customer: RegisteredCustomer) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.full_name || customer.phone || "");
    setSearchQuery("");
    setSearchResults([]);
  };

  const fetchPasswords = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("customer_passwords")
      .select("*")
      .order("created_at", { ascending: false });
    setPasswords(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    // For shared passwords, customer name is optional (use default)
    const finalCustomerName = isShared 
      ? (customerName.trim() || t("promoPassword"))
      : customerName.trim();
    
    if (!isShared && !customerName.trim()) {
      toast.error(t("customerNameRequired"));
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("customer_passwords")
      .insert({
        password: generatedPassword,
        customer_name: finalCustomerName,
        is_shared: isShared,
      });

    if (error) {
      if (error.code === "23505") {
        // Duplicate password - generate new one and retry
        setGeneratedPassword(generatePassword());
        toast.error(t("passwordExists"));
      } else {
        toast.error(t("failedToCreatePassword"));
      }
    } else {
      toast.success(t("passwordCreated"));
      setDialogOpen(false);
      fetchPasswords();
    }

    setSaving(false);
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("customer_passwords")
      .update({ is_active: !currentState })
      .eq("id", id);

    if (error) {
      toast.error(t("failedToUpdate"));
    } else {
      fetchPasswords();
    }
  };

  const handleResetDevice = async (id: string) => {
    if (!confirm(t("confirmResetDevice"))) return;

    const { error } = await supabase
      .from("customer_passwords")
      .update({ device_id: null, used_at: null })
      .eq("id", id);

    if (error) {
      toast.error(t("failedToReset"));
    } else {
      toast.success(t("deviceReset"));
      fetchPasswords();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;

    const { error } = await supabase
      .from("customer_passwords")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(t("failedToDelete"));
    } else {
      toast.success(t("deletedSuccessfully"));
      fetchPasswords();
    }
  };

  const copyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    toast.success(t("copied"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t("customerPasswords")}</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  {t("createPassword")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("createPassword")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{t("sharedPassword")}</p>
                        <p className="text-xs text-muted-foreground">{t("sharedPasswordDesc")}</p>
                      </div>
                    </div>
                    <Switch
                      checked={isShared}
                      onCheckedChange={setIsShared}
                    />
                  </div>
                  {!isShared && (
                    <div className="space-y-3">
                      {/* Search for registered customer */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          {t("searchCustomer")}
                        </Label>
                        <div className="relative">
                          <Input
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              searchCustomers(e.target.value);
                            }}
                            placeholder={t("searchByPhone")}
                          />
                          {searchLoading && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                        
                        {/* Search results dropdown */}
                        {searchResults.length > 0 && (
                          <div className="border rounded-lg bg-card shadow-lg max-h-40 overflow-y-auto">
                            {searchResults.map((customer) => (
                              <button
                                key={customer.id}
                                type="button"
                                onClick={() => handleSelectCustomer(customer)}
                                className="w-full px-3 py-2 text-left hover:bg-secondary/50 flex items-center gap-2 border-b last:border-b-0"
                              >
                                <User className="w-4 h-4 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{customer.full_name || t("noName")}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {customer.phone || t("noPhone")}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selected customer display */}
                      {selectedCustomer && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {selectedCustomer.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {selectedCustomer.phone}
                          </p>
                        </div>
                      )}
                      
                      {/* Manual customer name input */}
                      <div className="space-y-2">
                        <Label>{t("customerName")}</Label>
                        <Input
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder={t("enterCustomerName")}
                        />
                        <p className="text-xs text-muted-foreground">{t("orEnterManually")}</p>
                      </div>
                    </div>
                  )}
                  {isShared && (
                    <div className="space-y-2">
                      <Label>{t("passwordLabel")} ({t("optional")})</Label>
                      <Input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={t("promoPassword")}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>{t("generatedPassword")}</Label>
                    <div className="flex gap-2">
                      <Input
                        value={generatedPassword}
                        readOnly
                        className="font-mono text-lg tracking-wider"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setGeneratedPassword(generatePassword())}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyPassword(generatedPassword)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleCreate}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {t("createPassword")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {passwords.length === 0 ? (
              <div className="text-center py-8">
                <Key className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">{t("noPasswordsYet")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {passwords.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border ${item.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{item.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Key className="w-4 h-4 text-muted-foreground" />
                          <code className="text-sm bg-secondary px-2 py-0.5 rounded font-mono">
                            {item.password}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyPassword(item.password)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          {item.is_shared ? (
                            <span className="flex items-center gap-1 text-blue-600">
                              <Users className="w-3 h-3" />
                              {t("sharedPassword")}
                            </span>
                          ) : item.device_id ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <Smartphone className="w-3 h-3" />
                              {t("deviceLinked")}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Smartphone className="w-3 h-3" />
                              {t("notUsedYet")}
                            </span>
                          )}
                          {item.used_at && (
                            <span>
                              {t("usedAt")}: {new Date(item.used_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={() => handleToggleActive(item.id, item.is_active)}
                        />
                        {item.device_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResetDevice(item.id)}
                            title={t("resetDevice")}
                          >
                            <RefreshCw className="w-4 h-4 text-orange-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
