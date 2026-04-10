import { Link } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const NeedHelpBlock = () => {
  const { t } = useLanguage();

  return (
    <section className="py-10">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-2xl mx-auto text-center rounded-lg border border-border/60 bg-muted/30 p-8">
          <HelpCircle className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-2">{t("need_help_title")}</h3>
          <p className="text-muted-foreground mb-4">{t("need_help_desc")}</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            {t("need_help_cta")} →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NeedHelpBlock;
