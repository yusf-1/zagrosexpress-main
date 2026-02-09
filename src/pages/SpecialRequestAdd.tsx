import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const SpecialRequestAdd = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: t('pleaseLoginFirst'), variant: "destructive" });
      return;
    }

    const cleanNumber = whatsappNumber.trim().replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 10) {
      toast({ title: t('enterValidWhatsApp') || 'Please enter a valid WhatsApp number', variant: "destructive" });
      return;
    }

    if (!details.trim()) {
      toast({ title: t('fillRequiredFields'), variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("special_requests").insert({
        user_id: user.id,
        whatsapp_number: cleanNumber,
        product_name: "Special Request",
        details: details.trim(),
      });

      if (error) throw error;

      toast({ title: t('requestSentSuccess') });
      setWhatsappNumber("");
      setDetails("");
      navigate("/special-request");
    } catch (error: any) {
      toast({ title: error.message || t('failedToSendRequest'), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/special-request")}>
            <ArrowLeft className={`h-5 w-5 ${isRTL ? "rotate-180" : ""}`} />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{t('addRequest') || 'Add Request'}</h1>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto space-y-4">
        <Alert className="bg-primary/10 border-primary/30">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            {t('specialRequestInfo') || 'Please provide your WhatsApp number and describe what you need.'}
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">{t('whatsappNumber') || 'WhatsApp Number'} *</Label>
                <Input
                  id="whatsappNumber"
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder={t('enterWhatsAppNumber') || 'e.g., 9647701234567'}
                  required
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">
                  {t('whatsappHint') || 'Enter your number with country code (e.g., 964 for Iraq)'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">{t('detailsAndRequirements') || 'Details'} *</Label>
                <Textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={t('detailsPlaceholder') || 'Describe what you need...'}
                  className="min-h-[200px] resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting || !whatsappNumber.trim() || !details.trim()}
              >
                {submitting ? (
                  <>{t('sending') || 'Sending...'}</>
                ) : (
                  <>
                    <Send className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t('sendRequest') || 'Send Request'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpecialRequestAdd;
