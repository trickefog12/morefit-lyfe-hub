import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ReviewsSkeleton } from "@/components/ReviewsSkeleton";

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer_name: string;
}

export const TestimonialCarousel = () => {
  const { t } = useLanguage();
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

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

  useEffect(() => {
    if (!carouselApi) return;

    const handleSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", handleSelect);
    handleSelect();

    return () => {
      carouselApi.off("select", handleSelect);
    };
  }, [carouselApi]);

  if (isLoading) {
    return <ReviewsSkeleton />;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center text-muted-foreground mb-16">
        {t("no_reviews_yet")}
      </div>
    );
  }

  const displayedReviews = reviews.slice(0, 9);

  return (
    <div className="max-w-5xl mx-auto mb-16 px-12">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[autoplayPlugin.current]}
        setApi={setCarouselApi}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {displayedReviews.map((review) => (
            <CarouselItem
              key={review.id}
              className="pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <Card className="h-full">
                <CardContent className="pt-8 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating
                            ? "fill-secondary text-secondary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 flex-grow line-clamp-4">
                    "{review.comment}"
                  </p>
                  <p className="font-semibold">
                    {review.reviewer_name || t("anonymous")}
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {displayedReviews.map((_, index) => (
          <button
            key={index}
            onClick={() => carouselApi?.scrollTo(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
