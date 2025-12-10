import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const VerificationSuccess = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState(5);
  const welcomeEmailSent = useRef(false);

  useEffect(() => {
    // Send welcome email once on mount
    const sendWelcomeEmail = async () => {
      if (welcomeEmailSent.current) return;
      welcomeEmailSent.current = true;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          await supabase.functions.invoke("send-welcome-email", {
            body: { userId: user.id },
          });
        }
      } catch (error) {
        console.error("Failed to send welcome email");
      }
    };

    sendWelcomeEmail();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/signup");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">{t("verification_success_title")}</CardTitle>
          <CardDescription className="text-base">
            {t("verification_success_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("redirecting_to_login")} ({countdown}s)
          </p>
          <Button onClick={() => navigate("/signup")} className="w-full">
            {t("go_to_login")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationSuccess;
