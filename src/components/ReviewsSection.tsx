import { lazy, Suspense, Component, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { SectionHeading } from "@/components/SectionHeading";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";

// Error boundary to catch dynamic import failures (e.g. offline)
class LazyErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// Lazy load ReviewForm to defer loading of react-hook-form and zod
const ReviewForm = lazy(() =>
  import("@/components/ReviewForm").catch(() => ({
    default: () => <div className="text-center text-muted-foreground py-4">Unable to load review form. Please refresh the page.</div>,
  }))
);

const ReviewsSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <SectionHeading>{t("testimonials_title")}</SectionHeading>
        </div>
        
        <TestimonialCarousel />

        {/* Review Form */}
        <div className="max-w-2xl mx-auto">
          <SectionHeading level="h3" className="text-center">{t("leave_review")}</SectionHeading>
          <Card>
            <CardContent className="pt-6">
              <LazyErrorBoundary fallback={<div className="text-center text-muted-foreground py-4">Unable to load review form. Please refresh the page.</div>}>
                <Suspense fallback={<div className="text-center text-muted-foreground py-4">{t("loading_reviews")}</div>}>
                  <ReviewForm />
                </Suspense>
              </LazyErrorBoundary>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
