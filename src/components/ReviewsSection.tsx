import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SectionHeading } from "@/components/SectionHeading";

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer_name: string;
}

const ReviewCard = ({ review }: { review: Review }) => (
  <Card className="h-full border-border/60 hover:shadow-md transition-shadow">
    <CardContent className="pt-6 h-full flex flex-col gap-3">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < review.rating
                ? "fill-secondary text-secondary"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed flex-grow">
        «{review.comment}»
      </p>
      <p className="text-sm font-semibold text-foreground">
        {review.reviewer_name || "Ανώνυμος"}
      </p>
    </CardContent>
  </Card>
);

const EarlyAdopterCTA = ({ t }: { t: (key: string) => string }) => (
  <div className="max-w-2xl mx-auto text-center space-y-5 py-8">
    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
      <Sparkles className="h-4 w-4" />
      {t("social_proof_early_badge")}
    </div>
    <h3 className="text-xl md:text-2xl font-bold text-foreground">
      {t("social_proof_early_title")}
    </h3>
    <p className="text-muted-foreground">
      {t("social_proof_early_description")}
    </p>
    <Link to="/programs">
      <Button size="lg" className="bg-primary hover:bg-primary-glow text-lg px-8 font-semibold mt-2">
        {t("social_proof_early_cta")}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </Link>
  </div>
);

const ReviewsSection = () => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      import("@/hooks/useReviews")
        .then(({ fetchReviews }) => {
          fetchReviews()
            .then((data) => {
              setReviews(data || []);
              setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
        })
        .catch(() => setIsLoading(false));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const displayedReviews = reviews.slice(0, 6);
  const hasReviews = displayedReviews.length > 0;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <SectionHeading>{t("social_proof_title")}</SectionHeading>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            {t("social_proof_subtitle")}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-40 animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : hasReviews ? (
          <>
            {/* Testimonial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {displayedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* Disclaimer */}
            <p className="text-center text-xs text-muted-foreground mt-6">
              {t("social_proof_disclaimer")}
            </p>

            {/* CTA */}
            <div className="text-center mt-10">
              <Link to="/programs">
                <Button size="lg" className="bg-primary hover:bg-primary-glow text-lg px-8 font-semibold">
                  {t("social_proof_cta")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <EarlyAdopterCTA t={t} />
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
