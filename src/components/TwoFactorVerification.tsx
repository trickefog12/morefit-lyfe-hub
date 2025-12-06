import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2 } from 'lucide-react';
import { useTwoFactorAuth } from '@/hooks/useTwoFactorAuth';
import { useLanguage } from '@/contexts/LanguageContext';

interface TwoFactorVerificationProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TwoFactorVerification({ open, onSuccess, onCancel }: TwoFactorVerificationProps) {
  const { t } = useLanguage();
  const { verify } = useTwoFactorAuth();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) return;
    
    setIsVerifying(true);
    const success = await verify(code);
    setIsVerifying(false);
    
    if (success) {
      setCode('');
      onSuccess();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerify();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <DialogTitle>{t('2fa_verification_title')}</DialogTitle>
          </div>
          <DialogDescription>
            {t('2fa_verification_description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="2fa-code">{t('2fa_enter_code')}</Label>
            <Input
              id="2fa-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={handleKeyDown}
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleVerify}
              disabled={code.length !== 6 || isVerifying}
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('2fa_verifying')}
                </>
              ) : (
                t('2fa_verify')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
