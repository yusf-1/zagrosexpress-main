import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { error as logError } from '@/lib/logger';

interface OTPVerificationStepProps {
  phoneNumber: string;
  onVerified: () => void;
  onBack: () => void;
  isRTL: boolean;
}

export function OTPVerificationStep({ 
  phoneNumber, 
  onVerified, 
  onBack,
  isRTL 
}: OTPVerificationStepProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phoneNumber, otpCode: otp }
      });

      if (error) {
        logError('Verify OTP error:', error);
        toast.error('Failed to verify code. Please try again.');
        return;
      }

      if (data.success) {
        toast.success('Phone number verified!');
        onVerified();
      } else {
        toast.error(data.error || 'Invalid verification code');
        setOtp('');
      }
    } catch (err) {
      logError('Verification error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-otp', {
        body: { phoneNumber }
      });

      if (error) {
        logError('Resend OTP error:', error);
        toast.error('Failed to resend code. Please try again.');
        return;
      }

      if (data.success) {
        toast.success('New verification code sent!');
        setCountdown(60);
        setCanResend(false);
        setOtp('');
      } else {
        toast.error(data.error || 'Failed to send code');
      }
    } catch (err) {
      logError('Resend error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="text-muted-foreground hover:text-foreground p-0"
        onClick={onBack}
      >
        <ArrowLeft className={`w-4 h-4 mr-2 ${isRTL ? 'rotate-180' : ''}`} />
        Back
      </Button>

      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold">Verify your WhatsApp</h2>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to<br />
          <span className="font-medium text-foreground">{phoneNumber}</span>
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          disabled={loading}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button 
        onClick={handleVerify}
        className="w-full" 
        size="lg"
        disabled={loading || otp.length !== 6}
      >
        {loading ? 'Verifying...' : 'Verify'}
      </Button>

      <div className="text-center">
        {canResend ? (
          <Button
            variant="ghost"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-primary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${resendLoading ? 'animate-spin' : ''}`} />
            {resendLoading ? 'Sending...' : 'Resend code'}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Resend code in {countdown}s
          </p>
        )}
      </div>
    </div>
  );
}
