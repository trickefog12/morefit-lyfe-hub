import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { products } from "@/data/products";
import { ArrowLeft, CheckCircle, Star, Loader2 } from "lucide-react";
import programStrength from "@/assets/program-strength.jpg";
import mealGuide from "@/assets/meal-guide.jpg";
import coachingSession from "@/assets/coaching-session.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const getImageForProduct = (product: any) => {
  if (product.category === "transformation") return mealGuide;
  if (product.category === "coaching") return coachingSession;
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
    console.log("[BuyNow] Button clicked, user:", user?.id, "product:", product?.sku);
    
    if (!user) {
      console.log("[BuyNow] No user, redirecting to signup");
      toast.error(language === "el" ? "Πρέπει να συνδεθείτε για να αγοράσετε" : "You must be logged in to purchase");
      navigate("/signup");
      return;
    }

    setIsCheckingOut(true);
    console.log("[BuyNow] Starting checkout for product:", product?.sku);
    
    try {
      console.log("[BuyNow] Invoking create-checkout-session...");
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { productSku: product?.sku },
      });

      console.log("[BuyNow] Response:", { data, error });

      if (error) {
        console.error("[BuyNow] Error from function:", error);
        throw error;
      }

      if (data?.url) {
        console.log("[BuyNow] Opening checkout URL:", data.url);
        window.open(data.url, "_blank");
      } else {
        console.error("[BuyNow] No checkout URL returned");
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("[BuyNow] Checkout error:", error);
      toast.error(language === "el" ? "Σφάλμα κατά τη δημιουργία πληρωμής" : "Error creating checkout session");
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

  // Get language-specific content
  const currencySymbol = language === "el" ? "€" : "$";
  const productName = language === "en" ? product.nameEn : product.name;
  const productBenefit = language === "en" ? product.shortBenefitEn : product.shortBenefit;
  const productDescription = language === "en" ? product.descriptionEn : product.description;
  const productDeliverables = language === "en" ? product.deliverablesEn : product.deliverables;
  const productTargetAudience = language === "en" ? product.targetAudienceEn : product.targetAudience;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <Link to="/programs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            {t("back_to_programs_link")}
          </Link>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={getImageForProduct(product)}
                  alt={productName}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-4xl font-bold">{productName}</h1>
                <Badge variant="secondary" className="text-2xl py-2 px-4">
                  {currencySymbol}{product.price}
                </Badge>
              </div>
              
              <p className="text-xl text-muted-foreground mb-6">
                {productBenefit}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{t("duration_label")}</span>
                  <span className="text-muted-foreground">{product.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{t("format_label")}</span>
                  <Badge variant="outline">
                    {product.format === "pdf" && "PDF Download"}
                    {product.format === "video" && "Video Course"}
                    {product.format === "coach" && "1:1 Coaching"}
                    {product.format === "custom" && "Custom Program"}
                  </Badge>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full md:w-auto bg-primary hover:bg-primary-glow text-lg px-12 mb-4"
                onClick={handleBuyNow}
                disabled={isCheckingOut || authLoading}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === "el" ? "Φόρτωση..." : "Loading..."}
                  </>
                ) : (
                  <>{t("buy_now_price")} - {currencySymbol}{product.price}</>
                )}
              </Button>

              <p className="text-sm text-muted-foreground">
                {t("secure_payment")}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-6">{t("about_program")}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {productDescription}
            </p>

            <h3 className="text-2xl font-bold mb-4">{t("whats_included")}</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {productDeliverables.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">{t("who_is_this_for")}</h3>
                <p className="text-muted-foreground">{productTargetAudience}</p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center">{t("faq_title_detail")}</h2>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>{t("faq_detail_q1")}</AccordionTrigger>
                <AccordionContent>
                  {t("faq_detail_a1")}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>{t("faq_detail_q2")}</AccordionTrigger>
                <AccordionContent>
                  {t("faq_detail_a2")}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>{t("faq_detail_q3")}</AccordionTrigger>
                <AccordionContent>
                  {t("faq_detail_a3")}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>{t("faq_detail_q4")}</AccordionTrigger>
                <AccordionContent>
                  {t("faq_detail_a4")}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Testimonials */}
          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">{t("what_clients_say")}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} className="h-4 w-4 fill-secondary text-secondary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      "Απίστευτο πρόγραμμα! Είδα αποτελέσματα μέσα σε λίγες εβδομάδες. Η Stefania ξέρει τι κάνει!"
                    </p>
                    <p className="text-sm font-semibold">— Χρήστης {i}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary">
            <CardContent className="pt-12 pb-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                {language === "el" ? "Έτοιμος/η να Ξεκινήσεις;" : "Ready to Get Started?"}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                {language === "el" 
                  ? "Μην χάσεις την ευκαιρία να επενδύσεις στον εαυτό σου. Ξεκίνα το ταξίδι μεταμόρφωσης σήμερα!"
                  : "Don't miss the opportunity to invest in yourself. Start your transformation journey today!"}
              </p>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-glow text-lg px-12"
                onClick={handleBuyNow}
                disabled={isCheckingOut || authLoading}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === "el" ? "Φόρτωση..." : "Loading..."}
                  </>
                ) : (
                  <>{language === "el" ? "Αγόρασε Τώρα" : "Buy Now"} - {currencySymbol}{product.price}</>
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
