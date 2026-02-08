import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { HeroSection } from "@/components/HeroSection";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";

// Lazy load ReviewForm to defer loading of react-hook-form and zod
const ReviewForm = lazy(() => import("@/components/ReviewForm"));

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <HeroSection />

      {/* About Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("about_title")}</h2>
            <p className="text-lg text-muted-foreground mb-4">
              {t("about_p1")}
            </p>
            <p className="text-lg text-muted-foreground mb-4">
              {t("about_p2")}
            </p>
            <p className="text-lg text-muted-foreground">
              {t("about_p3")}
            </p>
          </div>
        </div>
      </section>

      <FeaturedProductsSection />

      <HowItWorksSection />

      {/* Customer Reviews */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("testimonials_title")}</h2>
          </div>
          
          <TestimonialCarousel />

          {/* Review Form */}
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">{t("leave_review")}</h3>
            <Card>
              <CardContent className="pt-6">
                <Suspense fallback={<div className="text-center text-muted-foreground py-4">{t("loading_reviews")}</div>}>
                  <ReviewForm />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-glow">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            {t("cta_title")}
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            {t("cta_description")}
          </p>
          <Link to="/programs">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              {t("view_programs")}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
