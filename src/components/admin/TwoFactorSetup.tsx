import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, ShieldCheck, ShieldOff, Loader2, Copy, Check } from 'lucide-react';
import { useTwoFactorAuth, EnrollmentData } from '@/hooks/useTwoFactorAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

export function TwoFactorSetup() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { 
    isEnrolled, 
    factors, 
    loading, 
    enroll, 
    verifyEnrollment, 
    unenroll 
  } = useTwoFactorAuth();

  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const handleStartEnrollment = async () => {
    setIsEnrolling(true);
    const data = await enroll();
    if (data) {
      setEnrollmentData(data);
    }
    setIsEnrolling(false);
  };

  const handleVerifyEnrollment = async () => {
    if (!enrollmentData || verificationCode.length !== 6) return;
    
    setIsVerifying(true);
    const success = await verifyEnrollment(enrollmentData.id, verificationCode);
    if (success) {
      setEnrollmentData(null);
      setVerificationCode('');
    }
    setIsVerifying(false);
  };

  const handleCancelEnrollment = () => {
    setEnrollmentData(null);
    setVerificationCode('');
  };

  const handleDisable2FA = async () => {
    if (factors.length === 0) return;
    
    setIsDisabling(true);
    await unenroll(factors[0].id);
    setIsDisabling(false);
  };

  const copySecret = () => {
    if (enrollmentData?.totp.secret) {
      navigator.clipboard.writeText(enrollmentData.totp.secret);
      setCopiedSecret(true);
      toast({
        title: t('2fa_secret_copied'),
        description: t('2fa_secret_copied_desc'),
      });
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>{t('2fa_title')}</CardTitle>
          </div>
          {isEnrolled ? (
            <Badge variant="default" className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              {t('2fa_enabled')}
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <ShieldOff className="h-3 w-3" />
              {t('2fa_disabled')}
            </Badge>
          )}
        </div>
        <CardDescription>
          {t('2fa_description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {enrollmentData ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {t('2fa_scan_qr')}
            </div>
            
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <img 
                src={enrollmentData.totp.qr_code} 
                alt="QR Code" 
                className="w-48 h-48"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                {t('2fa_manual_entry')}
              </Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                  {enrollmentData.totp.secret}
                </code>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={copySecret}
                >
                  {copiedSecret ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-code">{t('2fa_enter_code')}</Label>
              <Input
                id="verification-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleCancelEnrollment}
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button 
                onClick={handleVerifyEnrollment}
                disabled={verificationCode.length !== 6 || isVerifying}
                className="flex-1"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('2fa_verifying')}
                  </>
                ) : (
                  t('2fa_verify_enable')
                )}
              </Button>
            </div>
          </div>
        ) : isEnrolled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-lg">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm">{t('2fa_active_message')}</span>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <ShieldOff className="h-4 w-4" />
                  {t('2fa_disable')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('2fa_disable_confirm_title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('2fa_disable_confirm_desc')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDisable2FA}
                    disabled={isDisabling}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDisabling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('2fa_disabling')}
                      </>
                    ) : (
                      t('2fa_disable')
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {t('2fa_not_enabled_message')}
            </div>
            <Button 
              onClick={handleStartEnrollment}
              disabled={isEnrolling}
              className="w-full gap-2"
            >
              {isEnrolling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('2fa_setting_up')}
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  {t('2fa_enable')}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
