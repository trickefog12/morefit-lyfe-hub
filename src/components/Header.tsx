import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoIcon from "@/assets/logo-icon.jpeg";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoIcon} alt="MoreFitLyfe logo - Δυναμική γυναικεία φιγούρα" className="h-10 w-auto" />
          <span className="text-xl font-bold tracking-tight">MoreFitLyfe</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            Αρχική
          </Link>
          <Link to="/programs" className="text-sm font-medium transition-colors hover:text-primary">
            Προγράμματα
          </Link>
          <Link to="/meal-plans" className="text-sm font-medium transition-colors hover:text-primary">
            Διατροφή
          </Link>
          <Link to="/signup">
            <Button variant="default" size="sm" className="bg-primary hover:bg-primary-glow">
              Εγγραφή
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
              Αρχική
            </Link>
            <Link
              to="/programs"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Προγράμματα
            </Link>
            <Link
              to="/meal-plans"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Διατροφή
            </Link>
            <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
              <Button variant="default" size="sm" className="w-full bg-primary hover:bg-primary-glow">
                Εγγραφή
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
