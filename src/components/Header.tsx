import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Languages, LogOut, User, Shield, ShoppingBag, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useHaptics } from "@/hooks/useHaptics";
import { supabase } from "@/integrations/supabase/client";
import logoIcon from "@/assets/logo-icon.jpeg";
import logoText from "@/assets/logo-text.jpeg";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const haptics = useHaptics();
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Open shortcuts help modal with '?'
      if (event.shiftKey && event.key === '?') {
        event.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      // Navigation shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'h':
            event.preventDefault();
            haptics.light();
            navigate('/');
            toast({
              title: language === "el" ? "Αρχική σελίδα" : "Home",
              description: language === "el" ? "Μετάβαση στην αρχική σελίδα" : "Navigating to home page",
              duration: 1500,
            });
            break;
          case 'p':
            event.preventDefault();
            haptics.light();
            navigate('/programs');
            toast({
              title: language === "el" ? "Προγράμματα" : "Programs",
              description: language === "el" ? "Μετάβαση στα προγράμματα" : "Navigating to programs",
              duration: 1500,
            });
            break;
          case 'm':
            event.preventDefault();
            haptics.light();
            navigate('/meal-plans');
            toast({
              title: language === "el" ? "Διατροφή" : "Meal Plans",
              description: language === "el" ? "Μετάβαση στη διατροφή" : "Navigating to meal plans",
              duration: 1500,
            });
            break;
          case 'l':
            event.preventDefault();
            haptics.light();
            toggleLanguage();
            
            // Show toast notification
            const newLanguage = language === "el" ? "en" : "el";
            toast({
              title: newLanguage === "el" ? "Γλώσσα άλλαξε" : "Language changed",
              description: newLanguage === "el" ? "Ελληνικά ενεργοποιήθηκαν" : "English activated",
              duration: 2000,
            });
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLanguage, language, toast, navigate, haptics]);

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
                onClick={() => navigate("/settings")}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
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
                    onClick={() => {
                      haptics.light();
                      toggleLanguage();
                    }}
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
                    onClick={() => {
                      haptics.light();
                      toggleLanguage();
                    }}
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
                haptics.light();
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
                    navigate("/settings");
                    setIsMenuOpen(false);
                  }}
                  className="gap-2 justify-start w-full"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
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

      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === "el" ? "Συντομεύσεις Πληκτρολογίου" : "Keyboard Shortcuts"}
            </DialogTitle>
            <DialogDescription>
              {language === "el" 
                ? "Χρησιμοποιήστε αυτές τις συντομεύσεις για γρήγορη πλοήγηση" 
                : "Use these shortcuts for quick navigation"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">
                {language === "el" ? "Αρχική σελίδα" : "Go to home"}
              </span>
              <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                {navigator.platform.toUpperCase().includes('MAC') ? "⌘ + H" : "Ctrl + H"}
              </kbd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">
                {language === "el" ? "Προγράμματα" : "Go to programs"}
              </span>
              <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                {navigator.platform.toUpperCase().includes('MAC') ? "⌘ + P" : "Ctrl + P"}
              </kbd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">
                {language === "el" ? "Διατροφή" : "Go to meal plans"}
              </span>
              <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                {navigator.platform.toUpperCase().includes('MAC') ? "⌘ + M" : "Ctrl + M"}
              </kbd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">
                {language === "el" ? "Εναλλαγή γλώσσας" : "Toggle language"}
              </span>
              <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                {navigator.platform.toUpperCase().includes('MAC') ? "⌘ + L" : "Ctrl + L"}
              </kbd>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">
                {language === "el" ? "Εμφάνιση συντομεύσεων" : "Show shortcuts"}
              </span>
              <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                ?
              </kbd>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
