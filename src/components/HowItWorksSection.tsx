import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, TrendingUp, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorksSection = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: TrendingUp,
      titleKey: "step1_title",
      descriptionKey: "step1_description",
    },
    {
      icon: Users,
      titleKey: "step2_title",
      descriptionKey: "step2_description",
    },
    {
      icon: CheckCircle,
      titleKey: "step3_title",
      descriptionKey: "step3_description",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("how_it_works")}</h2>
          <p className="text-lg text-muted-foreground">
            {t("how_it_works_subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-12 pb-8">
                  <div className="mb-6 flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{t(step.titleKey)}</h3>
                  <p className="text-muted-foreground">
                    {t(step.descriptionKey)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
