import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const SpecialRequest = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
            <ArrowLeft className={`h-5 w-5 ${isRTL ? "rotate-180" : ""}`} />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{t('specialRequest')}</h1>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto">
        <div className="grid gap-4">
          <Card 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate("/special-request/add")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-foreground">
                  {t('addRequest') || 'Add Request'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('submitNewRequest') || 'Submit a new special request'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate("/special-request/my-requests")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-foreground">
                  {t('myRequests') || 'My Requests'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('viewMyRequests') || 'View your requests and responses'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpecialRequest;
