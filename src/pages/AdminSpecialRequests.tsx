import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, CheckCircle, Send, User, Calendar, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { error as logError } from "@/lib/logger";

interface SpecialRequest {
  id: string;
  user_id: string;
  whatsapp_number: string | null;
  product_name: string | null;
  details: string;
  attachment_url: string | null;
  attachment_signed_url?: string | null;
  status: string;
  admin_response: string | null;
  created_at: string;
  profiles?: {
    user_id: string;
    full_name: string | null;
    phone: string | null;
  } | null;
}

// Helper to extract storage path from attachment URL or path
const getStoragePath = (attachmentUrl: string): string | null => {
  if (!attachmentUrl) return null;
  // If it's already a path (starts with user ID folder pattern)
  if (attachmentUrl.match(/^[0-9a-f-]+\//)) {
    return attachmentUrl;
  }
  // If it's a full URL, extract the path after the bucket name
  const match = attachmentUrl.match(/request-attachments\/(.+)$/);
  return match ? match[1] : null;
};

const AdminSpecialRequests = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const isRTL = language === "ar" || language === "ku";

  const [requests, setRequests] = useState<SpecialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SpecialRequest | null>(null);
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translations: Record<string, Record<string, string>> = {
    en: {
      title: "Special Requests",
      noRequests: "No special requests",
      noRequestsDesc: "Customer requests will appear here.",
      pending: "Pending",
      responded: "Responded",
      respond: "Respond",
      customer: "Customer",
      date: "Date",
      details: "Details",
      yourResponse: "Your Response",
      responsePlaceholder: "Type your response to the customer...",
      send: "Send & Open WhatsApp",
      sending: "Sending...",
      successTitle: "Response Sent",
      successDesc: "Opening WhatsApp to notify customer.",
      errorTitle: "Error",
      back: "Back",
      viewAttachment: "View Attachment",
      whatsapp: "WhatsApp",
      openWhatsApp: "Open WhatsApp",
    },
    ar: {
      title: "الطلبات الخاصة",
      noRequests: "لا توجد طلبات خاصة",
      noRequestsDesc: "ستظهر طلبات العملاء هنا.",
      pending: "قيد الانتظار",
      responded: "تم الرد",
      respond: "الرد",
      customer: "العميل",
      date: "التاريخ",
      details: "التفاصيل",
      yourResponse: "ردك",
      responsePlaceholder: "اكتب ردك للعميل...",
      send: "إرسال وفتح واتساب",
      sending: "جاري الإرسال...",
      successTitle: "تم إرسال الرد",
      successDesc: "جاري فتح واتساب لإعلام العميل.",
      errorTitle: "خطأ",
      back: "رجوع",
      viewAttachment: "عرض المرفق",
      whatsapp: "واتساب",
      openWhatsApp: "فتح واتساب",
    },
    ku: {
      title: "داواکارییە تایبەتەکان",
      noRequests: "داواکاری تایبەت نییە",
      noRequestsDesc: "داواکارییەکانی کڕیار لێرە دەردەکەون.",
      pending: "چاوەڕوان",
      responded: "وەڵام درایەوە",
      respond: "وەڵام",
      customer: "کڕیار",
      date: "بەروار",
      details: "وردەکاری",
      yourResponse: "وەڵامەکەت",
      responsePlaceholder: "وەڵامەکەت بنووسە بۆ کڕیار...",
      send: "ناردن و کردنەوەی واتساب",
      sending: "دەنێردرێت...",
      successTitle: "وەڵام نێردرا",
      successDesc: "واتساب دەکرێتەوە بۆ ئاگادارکردنەوەی کڕیار.",
      errorTitle: "هەڵە",
      back: "گەڕانەوە",
      viewAttachment: "بینینی هاوپێچ",
      whatsapp: "واتساب",
      openWhatsApp: "کردنەوەی واتساب",
    },
  };

  const txt = translations[language] || translations.en;

  useEffect(() => {
    if (!isAdmin) {
      navigate("/home");
      return;
    }
    fetchRequests();
  }, [isAdmin, navigate]);

  const fetchRequests = async () => {
    setLoading(true);
    
    const { data: requestsData, error: requestsError } = await supabase
      .from("special_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (requestsError) {
      logError("Error fetching requests:", requestsError);
      toast({
        title: txt.errorTitle,
        description: requestsError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const userIds = [...new Set(requestsData?.map((r) => r.user_id) || [])];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name, phone")
      .in("user_id", userIds);

    // Generate signed URLs for attachments
    const requestsWithProfiles = await Promise.all(
      (requestsData || []).map(async (request) => {
        let signedUrl: string | null = null;
        
        if (request.attachment_url) {
          const storagePath = getStoragePath(request.attachment_url);
          if (storagePath) {
            const { data } = await supabase.storage
              .from("request-attachments")
              .createSignedUrl(storagePath, 3600); // 1 hour expiry
            signedUrl = data?.signedUrl || null;
          }
        }

        return {
          ...request,
          attachment_signed_url: signedUrl,
          profiles: profilesData?.find((p) => p.user_id === request.user_id) || null,
        };
      })
    );

    setRequests(requestsWithProfiles);
    setLoading(false);
  };

  const openWhatsApp = (phoneNumber: string, message?: string) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const encodedMessage = message ? encodeURIComponent(message) : '';
    const url = message 
      ? `https://wa.me/${cleanNumber}?text=${encodedMessage}`
      : `https://wa.me/${cleanNumber}`;
    window.open(url, "_blank");
  };

  const handleRespond = async () => {
    if (!selectedRequest || !response.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase
      .from("special_requests")
      .update({
        admin_response: response,
        status: "completed",
      })
      .eq("id", selectedRequest.id);

    if (error) {
      logError("Error updating request:", error);
      toast({
        title: txt.errorTitle,
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: txt.successTitle,
        description: txt.successDesc,
      });
      
      // Get the WhatsApp number and open WhatsApp
      const whatsappNum = selectedRequest.whatsapp_number || selectedRequest.profiles?.phone;
      if (whatsappNum) {
        openWhatsApp(whatsappNum, response);
      }
      
      setSelectedRequest(null);
      setResponse("");
      fetchRequests();
    }
    setIsSubmitting(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      language === "ar" ? "ar-EG" : language === "ku" ? "ku" : "en-US",
      { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    );
  };

  const openDialog = (request: SpecialRequest) => {
    setSelectedRequest(request);
    setResponse(request.admin_response || "");
  };

  const getCustomerWhatsApp = (request: SpecialRequest) => {
    return request.whatsapp_number || request.profiles?.phone || null;
  };

  const pendingRequests = requests.filter((r) => !r.admin_response);
  const respondedRequests = requests.filter((r) => r.admin_response);

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <main className="container max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">{txt.title}</h1>
          <Badge variant="secondary">
            {pendingRequests.length} {txt.pending}
          </Badge>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg">{txt.noRequests}</h3>
              <p className="text-sm text-muted-foreground mt-1">{txt.noRequestsDesc}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingRequests.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {txt.pending} ({pendingRequests.length})
                </h2>
                {pendingRequests.map((request) => {
                  const customerWhatsApp = getCustomerWhatsApp(request);
                  return (
                    <Card key={request.id} className="border-yellow-200 dark:border-yellow-900">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" />
                              {request.profiles?.full_name || "Customer"}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {customerWhatsApp && (
                                <button 
                                  onClick={() => openWhatsApp(customerWhatsApp)}
                                  className="flex items-center gap-1 text-green-600 hover:underline"
                                >
                                  <Phone className="h-3 w-3" />
                                  {customerWhatsApp}
                                </button>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(request.created_at)}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => openDialog(request)}>
                            {txt.respond}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{request.details}</p>
                        {request.attachment_signed_url && (
                          <a
                            href={request.attachment_signed_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-2 inline-block"
                          >
                            {txt.viewAttachment}
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {respondedRequests.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {txt.responded} ({respondedRequests.length})
                </h2>
                {respondedRequests.map((request) => {
                  const customerWhatsApp = getCustomerWhatsApp(request);
                  return (
                    <Card key={request.id} className="opacity-75">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {request.profiles?.full_name || "Customer"}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {customerWhatsApp && (
                                <button 
                                  onClick={() => openWhatsApp(customerWhatsApp)}
                                  className="flex items-center gap-1 text-green-600 hover:underline"
                                >
                                  <Phone className="h-3 w-3" />
                                  {customerWhatsApp}
                                </button>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(request.created_at)}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {customerWhatsApp && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 border-green-600"
                                onClick={() => openWhatsApp(customerWhatsApp)}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => openDialog(request)}>
                              {txt.respond}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">{request.details}</p>
                        {request.admin_response && (
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                              {txt.yourResponse}
                            </p>
                            <p className="text-sm">{request.admin_response}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedRequest?.profiles?.full_name || "Customer Request"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{selectedRequest?.profiles?.full_name || "Customer"}</span>
              </div>
              {selectedRequest && getCustomerWhatsApp(selectedRequest) && (
                <button 
                  onClick={() => openWhatsApp(getCustomerWhatsApp(selectedRequest)!)}
                  className="flex items-center gap-2 text-sm text-green-600 hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  <span>{getCustomerWhatsApp(selectedRequest)}</span>
                </button>
              )}
              <p className="text-sm">{selectedRequest?.details}</p>
              {selectedRequest?.attachment_signed_url && (
                <img
                  src={selectedRequest.attachment_signed_url}
                  alt="Attachment"
                  className="w-full max-h-48 object-cover rounded-lg"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{txt.yourResponse}</label>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder={txt.responsePlaceholder}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleRespond} disabled={!response.trim() || isSubmitting} className="bg-green-600 hover:bg-green-700">
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? txt.sending : txt.send}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSpecialRequests;
