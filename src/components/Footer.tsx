import { Link } from "react-router-dom";
import { Instagram, Music } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-muted/30 mt-20">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-4">MoreFitLyfe</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Γίνε η καλύτερη έκδοση του εαυτού σου με προγράμματα δύναμης και εξατομικευμένη υποστήριξη.
            </p>
            <p className="text-sm text-muted-foreground">
              by M. Stefania Meraklis
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Γρήγοροι Σύνδεσμοι</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Αρχική
              </Link>
              <Link to="/programs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Προγράμματα
              </Link>
              <Link to="/meal-plans" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Διατροφή
              </Link>
              <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Εγγραφή
              </Link>
            </nav>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-bold text-lg mb-4">Επικοινωνία</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Email:{" "}
              <a href="mailto:morefitlyfe@gmail.com" className="hover:text-primary transition-colors">
                morefitlyfe@gmail.com
              </a>
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/mariastefaniameraklis"
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
            © {new Date().getFullYear()} MoreFitLyfe. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
