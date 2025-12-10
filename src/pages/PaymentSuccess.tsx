import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

const PaymentSuccess = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="pt-12 pb-8 px-8">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle className="h-16 w-16 text-primary" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {language === "el" ? "Ευχαριστούμε!" : "Thank You!"}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6">
              {language === "el" 
                ? "Η πληρωμή σας ολοκληρώθηκε με επιτυχία. Θα λάβετε email επιβεβαίωσης σύντομα."
                : "Your payment was successful. You will receive a confirmation email shortly."}
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-8">
              <p className="text-sm text-muted-foreground">
                {language === "el"
                  ? "Μπορείτε να κατεβάσετε τα αρχεία σας από τη σελίδα 'Οι Αγορές Μου'."
                  : "You can download your files from the 'My Purchases' page."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/my-purchases">
                  <Download className="mr-2 h-4 w-4" />
                  {language === "el" ? "Οι Αγορές Μου" : "My Purchases"}
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg">
                <Link to="/programs">
                  {language === "el" ? "Συνέχεια Αγορών" : "Continue Shopping"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
