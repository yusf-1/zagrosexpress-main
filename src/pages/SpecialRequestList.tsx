import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Clock, CheckCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface SpecialRequestData {
  id: string;
  whatsapp_number: string | null;
  details: string;
  status: string;
  admin_response: string | null;
  created_at: string;
}

const ADMIN_WHATSAPP = "9647838282522";

const SpecialRequestList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();

  const [requests, setRequests] = useState<SpecialRequestData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("special_requests")
        .select("id, whatsapp_number, details, status, admin_response, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({ title: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    const url = `https://wa.me/${ADMIN_WHATSAPP}`;
    window.open(url, "_blank");
  };

  const getStatusBadge = (status: string, hasResponse: boolean) => {
    if (hasResponse) {
      return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t('answered')}</Badge>;
    }
    return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{t('pending')}</Badge>;
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/special-request")}>
            <ArrowLeft className={`h-5 w-5 ${isRTL ? "rotate-180" : ""}`} />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{t('myRequests')}</h1>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('loading')}
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('noRequestsYet')}</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{request.details}</p>
                  {getStatusBadge(request.status, !!request.admin_response)}
                </div>

                <p className="text-xs text-muted-foreground">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>

                {request.admin_response && (
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg space-y-3">
                    <div>
                      <p className="text-xs font-medium text-green-600 mb-1">
                        {t('adminResponse')}:
                      </p>
                      <p className="text-sm text-foreground">{request.admin_response}</p>
                    </div>
                    <Button 
                      onClick={openWhatsApp}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {t('contactOnWhatsApp')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SpecialRequestList;
