import { useLanguage } from "@/contexts/LanguageContext";

const AboutSection = () => {
  const { t } = useLanguage();

  return (
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
  );
};

export default AboutSection;
