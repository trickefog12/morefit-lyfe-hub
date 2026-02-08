import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

const CallToActionSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary-glow">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <SectionHeading className="text-primary-foreground">{t("cta_title")}</SectionHeading>
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
  );
};

export default CallToActionSection;
