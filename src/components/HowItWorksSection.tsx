import { Card, CardContent } from "@/components/ui/card";
import { Search, CreditCard, Download, Dumbbell, Clock, Mail } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorksSection = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Search,
      step: 1,
      titleKey: "step1_title",
      descriptionKey: "step1_description",
    },
    {
      icon: CreditCard,
      step: 2,
      titleKey: "step2_title",
      descriptionKey: "step2_description",
    },
    {
      icon: Download,
      step: 3,
      titleKey: "step3_title",
      descriptionKey: "step3_description",
    },
    {
      icon: Dumbbell,
      step: 4,
      titleKey: "step4_title",
      descriptionKey: "step4_description",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <SectionHeading>{t("how_it_works")}</SectionHeading>
          <p className="text-lg text-muted-foreground">
            {t("how_it_works_subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.step} className="text-center relative overflow-hidden">
                <div className="absolute top-3 left-3 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
                <CardContent className="pt-14 pb-8 px-4">
                  <div className="mb-5 flex justify-center">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{t(step.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t(step.descriptionKey)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Time commitment + contact */}
        <div className="max-w-3xl mx-auto mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <span>{t("how_it_works_time")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary shrink-0" />
            <span>
              {t("how_it_works_contact")}{" "}
              <a
                href="mailto:morefitlyfe@gmail.com"
                className="text-primary hover:underline font-medium"
              >
                {t("how_it_works_contact_link")}
              </a>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
