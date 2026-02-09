import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Privacy() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-2">{t('privacyPolicy')}</h1>
        <p className="text-muted-foreground mb-8">{t('privacyLastUpdated')}</p>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacyIntroTitle')}</h2>
            <p className="text-muted-foreground">{t('privacyIntroBody')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacyInfoCollectTitle')}</h2>
            <p className="text-muted-foreground mb-3">{t('privacyInfoCollectIntro')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>{t('privacyInfoCollectPersonal')}</li>
              <li>{t('privacyInfoCollectOrder')}</li>
              <li>{t('privacyInfoCollectDevice')}</li>
              <li>{t('privacyInfoCollectUsage')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacyUseInfoTitle')}</h2>
            <p className="text-muted-foreground mb-3">{t('privacyUseInfoIntro')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>{t('privacyUseInfo1')}</li>
              <li>{t('privacyUseInfo2')}</li>
              <li>{t('privacyUseInfo3')}</li>
              <li>{t('privacyUseInfo4')}</li>
              <li>{t('privacyUseInfo5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacySharingTitle')}</h2>
            <p className="text-muted-foreground mb-3">{t('privacySharingIntro')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>{t('privacySharingPartner')}</li>
              <li>{t('privacySharingProviders')}</li>
              <li>{t('privacySharingLegal')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacySecurityTitle')}</h2>
            <p className="text-muted-foreground">{t('privacySecurityBody')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacyRightsTitle')}</h2>
            <p className="text-muted-foreground mb-3">{t('privacyRightsIntro')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>{t('privacyRights1')}</li>
              <li>{t('privacyRights2')}</li>
              <li>{t('privacyRights3')}</li>
              <li>{t('privacyRights4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacyChildrenTitle')}</h2>
            <p className="text-muted-foreground">{t('privacyChildrenBody')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacyChangesTitle')}</h2>
            <p className="text-muted-foreground">{t('privacyChangesBody')}</p>
          </section>

          <section className="bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">{t('privacyContactTitle')}</h2>
            <p className="text-muted-foreground">
              {t('privacyContactIntro')}
            </p>
            <p className="text-muted-foreground mt-2">
              {t('privacyContactWhatsappLabel')} <a className="text-primary hover:underline" href="https://wa.me/9647512357541" target="_blank" rel="noopener noreferrer">+9647512357541</a>
            </p>
            <p className="text-muted-foreground">
              {t('privacyContactEmailLabel')} <a className="text-primary hover:underline" href="mailto:yusfzagros2@gmail.com">yusfzagros2@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
