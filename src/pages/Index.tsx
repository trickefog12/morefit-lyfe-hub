import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";
import { CheckCircle, Star, TrendingUp, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroDesktopWebp from "@/assets/hero-desktop.webp";
import heroDesktopJpg from "@/assets/hero-desktop.jpg";
import heroMobileWebp from "@/assets/hero-mobile.webp";
import heroMobileJpg from "@/assets/hero-mobile.jpg";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Lazy load ReviewForm to defer loading of react-hook-form and zod
const ReviewForm = lazy(() => import("@/components/ReviewForm"));
import { ReviewsSkeleton } from "@/components/ReviewsSkeleton";
import { ProductsSkeleton } from "@/components/ProductsSkeleton";

const Index = () => {
  const { t } = useLanguage();
  const featuredProducts = products.slice(0, 3);
  
  // Create autoplay plugin ref to avoid recreating on each render
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );
  
  // Defer reviews fetch until after initial render to improve TTI
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  useEffect(() => {
    // Delay the import to allow main thread to complete initial render
    const timer = setTimeout(() => {
      import("@/hooks/useReviews").then(({ fetchReviews }) => {
        fetchReviews().then(data => {
          setReviews(data || []);
          setIsLoading(false);
        }).catch(() => setIsLoading(false));
      });
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source media="(min-width: 768px)" srcSet={heroDesktopWebp} type="image/webp" />
            <source media="(min-width: 768px)" srcSet={heroDesktopJpg} type="image/jpeg" />
            <source srcSet={heroMobileWebp} type="image/webp" />
            <img
              src={heroMobileJpg}
              alt="Δυναμική προπόνηση - Γυναίκα σε δράση"
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto px-4 lg:px-8 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              {t("hero_title")}
              <br />
              <span className="text-primary">{t("hero_subtitle")}</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-xl">
              {t("hero_description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/programs">
                <Button size="lg" className="bg-primary hover:bg-primary-glow text-lg px-8">
                  {t("buy_now")}
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-background/10 backdrop-blur-sm border-primary-foreground text-primary-foreground hover:bg-background/20">
                  {t("become_member")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("featured_title")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("featured_description")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.sku} product={product} />
            ))}
          </div>
          <div className="text-center">
            <Link to="/programs">
              <Button size="lg" variant="outline">
                {t("view_all_programs")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("how_it_works")}</h2>
            <p className="text-lg text-muted-foreground">
              {t("how_it_works_subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-12 pb-8">
                <div className="mb-6 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{t("step1_title")}</h3>
                <p className="text-muted-foreground">
                  {t("step1_description")}
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-12 pb-8">
                <div className="mb-6 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{t("step2_title")}</h3>
                <p className="text-muted-foreground">
                  {t("step2_description")}
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-12 pb-8">
                <div className="mb-6 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{t("step3_title")}</h3>
                <p className="text-muted-foreground">
                  {t("step3_description")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("testimonials_title")}</h2>
          </div>
          
          {/* Display Reviews */}
          {isLoading ? (
            <ReviewsSkeleton />
          ) : reviews && reviews.length > 0 ? (
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
                  {reviews.slice(0, 9).map((review) => (
                    <CarouselItem key={review.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
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
                          <p className="text-muted-foreground mb-4 flex-grow line-clamp-4">"{review.comment}"</p>
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
                {reviews.slice(0, 9).map((_, index) => (
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
          ) : (
            <div className="text-center text-muted-foreground mb-16">
              {t("no_reviews_yet")}
            </div>
          )}

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
