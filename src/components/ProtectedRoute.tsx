import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isEmailVerified, loading, resendVerificationEmail } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t("loading")}</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  // User is logged in but email not verified
  if (!isEmailVerified) {
    const handleResend = async () => {
      if (!user.email) return;
      setIsResending(true);
      try {
        const { error } = await resendVerificationEmail(user.email);
        if (!error) {
          toast({
            title: t("verification_sent"),
            description: t("verification_sent_desc"),
          });
        }
      } finally {
        setIsResending(false);
      }
    };

    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{t("email_not_verified")}</h1>
            <p className="text-muted-foreground mb-2">
              {t("email_not_verified_desc")}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {user.email}
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? t("resending") : t("resend_verification")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
