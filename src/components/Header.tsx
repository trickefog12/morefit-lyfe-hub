import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Languages, LogOut, User, Shield, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import logoIcon from "@/assets/logo-icon.jpeg";
import logoText from "@/assets/logo-text.jpeg";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      setIsAdmin(data || false);
    };

    checkAdminStatus();
  }, [user]);

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-4">
          <img src={logoIcon} alt="MoreFitLyfe logo - Dynamic female figure" className="h-16 w-auto" />
          <img src={logoText} alt="MoreFitLyfe text logo" className="h-12 w-auto" />
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
          {user ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => navigate("/my-purchases")}
              >
                <ShoppingBag className="h-4 w-4" />
                My Purchases
              </Button>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => navigate("/admin")}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => navigate("/signup")}
              >
                <User className="h-4 w-4" />
                {user.email}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>{language === "el" ? "Switch to English" : "Αλλαγή σε Ελληνικά"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <>
              <Link to="/signup">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary-glow">
                  {t("signup")}
                </Button>
              </Link>
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>{language === "el" ? "Switch to English" : "Αλλαγή σε Ελληνικά"}</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
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
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate("/my-purchases");
                    setIsMenuOpen(false);
                  }}
                  className="gap-2 justify-start w-full"
                >
                  <ShoppingBag className="h-4 w-4" />
                  My Purchases
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigate("/admin");
                      setIsMenuOpen(false);
                    }}
                    className="gap-2 justify-start w-full"
                  >
                    <Shield className="h-4 w-4" />
                    Admin Dashboard
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate("/signup");
                    setIsMenuOpen(false);
                  }}
                  className="gap-2 justify-start"
                >
                  <User className="h-4 w-4" />
                  {user.email}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="gap-2 justify-start w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                <Button variant="default" size="sm" className="w-full bg-primary hover:bg-primary-glow">
                  {t("signup")}
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
      </header>
    </TooltipProvider>
  );
};
