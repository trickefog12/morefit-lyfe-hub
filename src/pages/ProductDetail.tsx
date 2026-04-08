import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { products } from "@/data/products";
import {
  CheckCircle,
  Loader2,
  Clock,
  Dumbbell,
  CalendarDays,
  Truck,
  Headphones,
  BarChart3,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import programStrength from "@/assets/program-strength.jpg";
import programMobility from "@/assets/program-mobility.jpg";
import mealGuide from "@/assets/meal-guide.jpg";
import coachingSession from "@/assets/coaching-session.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const getImageForProduct = (product: any) => {
  if (product.category === "transformation") return mealGuide;
  if (product.category === "coaching") return coachingSession;
  if (product.category === "mobility") return programMobility;
  return programStrength;
};

const ProductDetail = () => {
  const { sku } = useParams();
  const { language, t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const product = products.find((p) => p.sku === sku);

  const handleBuyNow = async () => {
    if (!user) {
      toast.error(
        language === "el"
          ? "Πρέπει να συνδεθείτε για να αγοράσετε"
          : "You must be logged in to purchase"
      );
      navigate("/signup");
      return;
    }

    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        { body: { productSku: product?.sku } }
      );
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("[BuyNow] Checkout error:", error);
      toast.error(
        language === "el"
          ? "Σφάλμα κατά τη δημιουργία πληρωμής"
          : "Error creating checkout session"
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{t("product_not_found")}</h1>
            <Link to="/programs">
              <Button>{t("back_to_programs")}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isGreek = language === "el";
  const currencySymbol = "€";
  const productName = isGreek ? product.name : product.nameEn;
  const productBenefit = isGreek ? product.shortBenefit : product.shortBenefitEn;
  const productDescription = isGreek ? product.description : product.descriptionEn;
  const productDeliverables = isGreek ? product.deliverables : product.deliverablesEn;
  const productTarget = isGreek ? product.targetAudience : product.targetAudienceEn;
  const productLevel = isGreek ? product.level : product.levelEn;
  const productEquipment = isGreek ? product.equipment : product.equipmentEn;
  const productWorkoutTime = isGreek ? product.workoutTime : product.workoutTimeEn;
  const productDaysPerWeek = isGreek ? product.daysPerWeek : product.daysPerWeekEn;
  const productDuration = isGreek ? product.duration : product.durationEn;
  const productDelivery = isGreek ? product.delivery : product.deliveryEn;
  const productSupport = isGreek ? product.support : product.supportEn;

  const specs = [
    { icon: BarChart3, label: t("level_label"), value: productLevel },
    { icon: Clock, label: t("duration_label"), value: productDuration },
    { icon: Dumbbell, label: t("equipment_label"), value: productEquipment },
    { icon: Clock, label: t("workout_time_label"), value: productWorkoutTime },
    { icon: CalendarDays, label: t("days_per_week_label"), value: productDaysPerWeek },
    { icon: Truck, label: t("delivery_label"), value: productDelivery },
    { icon: Headphones, label: t("support_label"), value: productSupport },
  ];

  const faqItems = product.faq.map((item) => ({
    question: isGreek ? item.question : item.questionEn,
    answer: isGreek ? item.answer : item.answerEn,
  }));

  const formatLabels: Record<string, string> = {
    pdf: "PDF Download",
    video: "Video Course",
    coach: "1:1 Coaching",
    custom: "Custom Program",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-6">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">
              {t("breadcrumb_home")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/programs" className="hover:text-foreground transition-colors">
              {t("breadcrumb_programs")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {productName}
            </span>
          </nav>

          {/* Hero Grid */}
          <div className="grid md:grid-cols-2 gap-10 mb-16">
            {/* Image */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                <img
                  src={getImageForProduct(product)}
                  alt={productName}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <Badge variant="outline" className="w-fit mb-3 text-xs">
                {formatLabels[product.format]}
              </Badge>

              <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-tight">
                {productName}
              </h1>

              <p className="text-lg text-muted-foreground mb-4">
                {productBenefit}
              </p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-primary">
                  {currencySymbol}{product.price}
                </span>
              </div>

              {/* CTA */}
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary-glow text-lg px-8 font-semibold mb-3"
                onClick={handleBuyNow}
                disabled={isCheckingOut || authLoading}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isGreek ? "Φόρτωση..." : "Loading..."}
                  </>
                ) : (
                  <>
                    {t("buy_program_cta")} — {currencySymbol}{product.price}
                  </>
                )}
              </Button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <ShieldCheck className="h-4 w-4 text-primary/70" />
                <span>{t("secure_payment")}</span>
              </div>

              <Separator className="mb-6" />

              {/* Who is this for */}
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
                  {t("who_is_this_for")}
                </h3>
                <p className="text-sm text-foreground/80">{productTarget}</p>
              </div>
            </div>
          </div>

          {/* Specs Grid */}
          <section className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold mb-6">{t("program_specs")}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {specs.map((spec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-lg bg-muted/40"
                >
                  <spec.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {spec.label}
                    </p>
                    <p className="text-sm text-foreground">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* What's Included */}
          <section className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold mb-4">{t("whats_included")}</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {productDescription}
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {productDeliverables.map((item, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {t("faq_title_detail")}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="text-xs text-muted-foreground text-center mt-4">
              {t("refund_note")}{" "}
              <Link to="/terms" className="underline hover:text-foreground">
                {t("refund_link")}
              </Link>
            </p>
          </section>

          {/* Bottom CTA */}
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
            <CardContent className="py-10 text-center">
              <h2 className="text-2xl font-bold mb-2">{productName}</h2>
              <p className="text-4xl font-bold text-primary mb-6">
                {currencySymbol}{product.price}
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-glow text-lg px-12 font-semibold"
                onClick={handleBuyNow}
                disabled={isCheckingOut || authLoading}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isGreek ? "Φόρτωση..." : "Loading..."}
                  </>
                ) : (
                  t("buy_program_cta")
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
