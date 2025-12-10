import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signupSchema, loginSchema, type SignupInput, type LoginInput } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";

const SignUp = () => {
  const navigate = useNavigate();
  const { user, signUp, signIn, loading } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signupForm = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      gdprConsent: false,
    },
  });

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const onSignup = async (data: SignupInput) => {
    setIsSubmitting(true);
    try {
      const { error } = await signUp(data.email, data.password, data.fullName);
      if (!error) {
        navigate("/");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onLogin = async (data: LoginInput) => {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (!error) {
        navigate("/");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">{t("join_morefitlyfe")}</h1>
              <p className="text-lg text-muted-foreground">
                {t("start_transformation")}
              </p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <Tabs defaultValue="signup" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signup">{t("sign_up")}</TabsTrigger>
                    <TabsTrigger value="login">{t("log_in")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signup">
                    <Form {...signupForm}>
                      <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                        <FormField
                          control={signupForm.control}
                          name="fullName"
                          render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("full_name")}</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("email")}</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("password")}</FormLabel>
                            <FormControl>
                              <PasswordInput placeholder="••••••••" {...field} />
                            </FormControl>
                            <PasswordStrengthIndicator password={field.value} />
                            <FormMessage />
                          </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="gdprConsent"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm text-muted-foreground font-normal">
                                {t("i_agree_to")}{" "}
                                <Link to="/privacy" className="text-primary hover:underline">
                                  {t("privacy_policy")}
                                </Link>{" "}
                                {t("and")}{" "}
                                <Link to="/terms" className="text-primary hover:underline">
                                  {t("terms_of_service")}
                                </Link>
                              </FormLabel>
                              <FormMessage />
                            </div>
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                          {isSubmitting ? t("creating_account") : t("create_account")}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("email")}</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>{t("password")}</FormLabel>
                                <Link
                                  to="/forgot-password"
                                  className="text-xs text-primary hover:underline"
                                >
                                  {t("forgot_password")}
                                </Link>
                              </div>
                              <FormControl>
                                <PasswordInput placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                          {isSubmitting ? t("logging_in") : t("log_in")}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  <Link to="/" className="text-primary hover:underline font-medium">
                    {t("back_to_home")}
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUp;
