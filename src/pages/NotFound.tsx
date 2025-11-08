import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Η Σελίδα δεν Βρέθηκε</h2>
        <p className="mb-8 text-muted-foreground">
          Λυπούμαστε, η σελίδα που ψάχνετε δεν υπάρχει ή έχει μετακινηθεί.
        </p>
        <a href="/">
          <Button size="lg" className="bg-primary hover:bg-primary-glow">
            Επιστροφή στην Αρχική
          </Button>
        </a>
      </div>
    </div>
  );
};

export default NotFound;
