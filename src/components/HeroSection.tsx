import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle, Zap, Shield, Headphones } from "lucide-react";
import heroDesktopWebp from "@/assets/hero-desktop.webp";
import heroDesktopJpg from "@/assets/hero-desktop.jpg";
import heroMobileWebp from "@/assets/hero-mobile.webp";
import heroMobileJpg from "@/assets/hero-mobile.jpg";

export const HeroSection = () => {
  const { t } = useLanguage();

  const bullets = [
    t("hero_bullet1"),
    t("hero_bullet2"),
    t("hero_bullet3"),
  ];

  const trustItems = [
    { icon: Zap, text: t("hero_trust1") },
    { icon: Shield, text: t("hero_trust2") },
    { icon: Headphones, text: t("hero_trust3") },
  ];

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
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/70 to-foreground/30 md:to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="container relative z-10 mx-auto px-4 lg:px-8 py-16 md:py-20">
        <div className="max-w-2xl space-y-6">
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight tracking-tight">
            {t("hero_title")}
            <br />
            <span className="text-primary">{t("hero_subtitle")}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-lg text-primary-foreground/85 max-w-xl leading-relaxed">
            {t("hero_description")}
          </p>

          {/* Benefit Bullets */}
          <ul className="space-y-2.5">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2.5 text-primary-foreground/90">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm md:text-base">{bullet}</span>
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/programs">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary-glow text-lg px-8 font-semibold">
                {t("hero_cta1")}
              </Button>
            </Link>
            <Link to="/programs/MFL-COACH">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg px-8 bg-background/10 backdrop-blur-sm border-primary-foreground/60 text-primary-foreground hover:bg-background/20 font-semibold"
              >
                {t("hero_cta2")}
              </Button>
            </Link>
          </div>

          {/* Trust Strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-primary-foreground/15">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-primary-foreground/70">
                <item.icon className="h-4 w-4 text-primary/80" />
                <span className="text-xs md:text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
