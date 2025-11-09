import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import logoIcon from "@/assets/logo-icon.png";
import logoText from "@/assets/logo-text.png";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoIcon} alt="MoreFitLyfe logo - Dynamic female figure" className="h-10 w-auto" />
          <img src={logoText} alt="MoreFitLyfe text logo" className="h-8 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            {t("home")}
          </Link>
          <Link to="/programs" className="text-sm font-medium transition-colors hover:text-primary">
            {t("programs")}
          </Link>
          <Link to="/meal-plans" className="text-sm font-medium transition-colors hover:text-primary">
            {t("nutrition")}
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="gap-2"
            aria-label="Toggle language"
          >
            <Languages className="h-4 w-4" />
            {language === "el" ? "EN" : "ΕΛ"}
          </Button>
          <Link to="/signup">
            <Button variant="default" size="sm" className="bg-primary hover:bg-primary-glow">
              {t("signup")}
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <nav className="container mx-auto flex flex-col gap-4 px-4 py-6">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("home")}
            </Link>
            <Link
              to="/programs"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("programs")}
            </Link>
            <Link
              to="/meal-plans"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nutrition")}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                toggleLanguage();
                setIsMenuOpen(false);
              }}
              className="gap-2 justify-start"
            >
              <Languages className="h-4 w-4" />
              {language === "el" ? "Switch to English" : "Αλλαγή σε Ελληνικά"}
            </Button>
            <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
              <Button variant="default" size="sm" className="w-full bg-primary hover:bg-primary-glow">
                {t("signup")}
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
