import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };
    checkSession();

    // Listen for auth state changes (user clicking email link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: t("error"),
          description: error.message,
        });
      } else {
        setIsSuccess(true);
        toast({
          title: t("password_updated"),
          description: t("password_updated_desc"),
        });
        // Redirect to home after a delay
        setTimeout(() => navigate("/"), 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  {isSuccess ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <KeyRound className="h-6 w-6 text-primary" />
                  )}
                </div>
                <CardTitle>
                  {isSuccess ? t("password_reset_success") : t("reset_password")}
                </CardTitle>
                <CardDescription>
                  {isSuccess ? t("password_reset_success_desc") : t("reset_password_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isValidSession ? (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("invalid_reset_link")}
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/forgot-password">{t("request_new_link")}</Link>
                    </Button>
                  </div>
                ) : isSuccess ? (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("redirecting_home")}
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/">{t("go_to_home")}</Link>
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("new_password")}</FormLabel>
                            <FormControl>
                              <PasswordInput placeholder="••••••••" {...field} />
                            </FormControl>
                            <PasswordStrengthIndicator password={field.value} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("confirm_password")}</FormLabel>
                            <FormControl>
                              <PasswordInput placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? t("updating") : t("update_password")}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
