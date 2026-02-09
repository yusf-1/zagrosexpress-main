import { useNavigate } from 'react-router-dom';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import zagrossLogo from '@/assets/zagross-express-logo.png';
import flagKurdistan from '@/assets/flag-kurdistan.png';
import flagEnglish from '@/assets/flag-english.png';
import flagIraq from '@/assets/flag-iraq.png';
import { Check } from 'lucide-react';

const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'ku', name: 'Kurdish', nativeName: 'کوردی', flag: flagKurdistan },
  { code: 'en', name: 'English', nativeName: 'English', flag: flagEnglish },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: flagIraq },
];

export default function LanguageSelect() {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <img src={zagrossLogo} alt="ZAGROSS EXPRESS" className="w-24 h-24 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-semibold text-foreground mb-1">ZAGROSS EXPRESS</h1>
          <p className="text-sm text-muted-foreground">CHINA IS NEIGHBOURHOOD</p>
        </div>

        {/* Language Selection */}
        <div className="space-y-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide text-center">
            {t('selectLanguage')}
          </h2>
          
          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                  language === lang.code 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border bg-card hover:border-primary/50 hover:bg-secondary/50'
                }`}
                onClick={() => setLanguage(lang.code)}
              >
                {/* Flag */}
                <div className="w-12 h-8 rounded overflow-hidden shadow-sm flex-shrink-0">
                  <img 
                    src={lang.flag} 
                    alt={`${lang.name} flag`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Language Names */}
                <div className="flex-1 text-start">
                  <p className={`font-medium text-foreground ${lang.code !== 'en' ? 'font-arabic' : ''}`}>{lang.name}</p>
                  <p className={`text-sm text-muted-foreground ${lang.code !== 'en' ? 'font-arabic font-semibold' : ''}`}>
                    {lang.nativeName}
                  </p>
                </div>
                
                {/* Check Icon */}
                {language === lang.code && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleContinue}
            className="w-full mt-6 h-14 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
          >
            {t('continue')}
            <svg 
              className={`w-5 h-5 ${language === 'ku' || language === 'ar' ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
