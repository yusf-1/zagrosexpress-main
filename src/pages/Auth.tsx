import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User, ArrowLeft, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import zagrossLogo from '@/assets/zagross-express-logo.png';
import { lovable } from '@/integrations/lovable/index';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';


const signInSchema = z.object({
  whatsappNumber: z.string().min(10, 'Please enter a valid WhatsApp number').max(20),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  whatsappNumber: z.string().min(10, 'Please enter a valid WhatsApp number').max(20),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});



export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  // Remove OTP step, always show form
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'apple' | 'google' | null>(null);
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>();
  
  const { signIn, signUp, user } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);



  // Complete sign-up directly (no OTP)
  const completeSignUp = async () => {
    setLoading(true);
    try {
      const { error } = await signUp(whatsappNumber, password, fullName);
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This WhatsApp number is already registered. Please sign in.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Account created successfully!');
        navigate('/home');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isSignUp) {
        const result = signUpSchema.safeParse({ fullName, whatsappNumber, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        // Directly complete sign up (no OTP)
        await completeSignUp();
      } else {
        const result = signInSchema.safeParse({ whatsappNumber, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(whatsappNumber, password);
        if (error) {
          toast.error('Invalid WhatsApp number or password');
        } else {
          navigate('/home');
        }
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Back button */}
        <Button 
          variant="ghost" 
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{t('selectLanguage')}</span>
        </Button>

        {/* Logo */}
        <div className="text-center mb-8">
          <img src={zagrossLogo} alt="ZAGROSS EXPRESS" className="w-20 h-20 mx-auto mb-2 object-contain" />
          <h1 className="text-xl font-semibold text-foreground">ZAGROSS EXPRESS</h1>
        </div>

        {/* Auth Card */}
        <Card className="card-clean">
          {/* Only show form, no OTP step */}
          <>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg text-foreground">{isSignUp ? t('signUp') : t('signIn')}</CardTitle>
                <CardDescription>
                  {isSignUp ? 'Create your account to start ordering' : 'Welcome back! Sign in to continue'}
                </CardDescription>
              </CardHeader>
              <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('fullName')}</Label>
                  <div className="relative">
                    <User className={`absolute top-3 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`${isRTL ? 'pr-10' : 'pl-10'}`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors?.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">{t('whatsappNumber')}</Label>
                <div className="relative">
                  <Phone className={`absolute top-3 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className={`${isRTL ? 'pr-10' : 'pl-10'}`}
                    placeholder="+964 750 123 4567"
                    dir="ltr"
                  />
                </div>
                {errors?.whatsappNumber && <p className="text-sm text-destructive">{errors.whatsappNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Lock className={`absolute top-3 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${isRTL ? 'pr-10' : 'pl-10'}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors?.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Loading...' : isSignUp ? t('signUp') : t('signIn')}
              </Button>
            </form>

            <div className="my-4 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            {/* Social Sign In Buttons */}
            <div className="space-y-3">
              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                disabled={socialLoading !== null}
                onClick={async () => {
                  setSocialLoading('google');
                  try {
                    const { error } = await lovable.auth.signInWithOAuth('google', {
                      redirect_uri: window.location.origin,
                    });
                    if (error) {
                      toast.error(error.message || 'Failed to sign in with Google');
                    }
                  } catch (err) {
                    toast.error('Something went wrong. Please try again.');
                  } finally {
                    setSocialLoading(null);
                  }
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {socialLoading === 'google' ? 'Signing in...' : 'Continue with Google'}
              </Button>

              {/* Apple Sign In */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                disabled={socialLoading !== null}
                onClick={async () => {
                  setSocialLoading('apple');
                  try {
                    const { error } = await lovable.auth.signInWithOAuth('apple', {
                      redirect_uri: window.location.origin,
                    });
                    if (error) {
                      toast.error(error.message || 'Failed to sign in with Apple');
                    }
                  } catch (err) {
                    toast.error('Something went wrong. Please try again.');
                  } finally {
                    setSocialLoading(null);
                  }
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                {socialLoading === 'apple' ? 'Signing in...' : 'Continue with Apple'}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? t('haveAccount') : t('noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrors({});
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  {isSignUp ? t('signIn') : t('signUp')}
                </button>
              </p>
            </div>

              </CardContent>
            </>
        </Card>
      </div>
    </div>
  );
}
