import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import heroDesktopWebp from "@/assets/hero-desktop.webp";
import heroDesktopJpg from "@/assets/hero-desktop.jpg";
import heroMobileWebp from "@/assets/hero-mobile.webp";
import heroMobileJpg from "@/assets/hero-mobile.jpg";

export const HeroSection = () => {
  const { t } = useLanguage();

  return (
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
            loading="eager"
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
  );
};
