import { lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";

// Lazy load ReviewForm to defer loading of react-hook-form and zod
const ReviewForm = lazy(() => import("@/components/ReviewForm"));

const ReviewsSection = () => {
  const { t } = useLanguage();

  return (
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
  );
};

export default ReviewsSection;
