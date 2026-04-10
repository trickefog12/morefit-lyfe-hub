import { Link } from "react-router-dom";
import { Instagram, Music } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="border-t border-border/40 bg-muted/30 mt-20">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-4">MoreFitLyfe</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("footer_description")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("footer_by")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t("quick_links")}</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("home")}
              </Link>
              <Link to="/programs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("programs")}
              </Link>
              <Link to="/meal-plans" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("nutrition")}
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("contact")}
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t("need_help_title")}</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/programs#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("faq")}
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("terms_of_service")}
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("privacy_policy")}
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("contact")}
              </Link>
            </nav>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t("contact")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Email:{" "}
              <a href="mailto:morefitlyfe@gmail.com" className="hover:text-primary transition-colors">
                morefitlyfe@gmail.com
              </a>
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/mariastefaniameraklis?igsh=eG93bjdjcDNoZGQ1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@maria.meraklis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="TikTok"
              >
                <Music className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MoreFitLyfe. {t("all_rights")}
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              {t("privacy_policy")}
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              {t("terms_of_service")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
