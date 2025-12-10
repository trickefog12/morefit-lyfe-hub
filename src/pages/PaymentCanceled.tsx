import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const PaymentCanceled = () => {
  const { language } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="pt-12 pb-8 px-8">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <XCircle className="h-16 w-16 text-destructive" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {language === "el" ? "Η πληρωμή ακυρώθηκε" : "Payment Canceled"}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6">
              {language === "el" 
                ? "Η πληρωμή σας δεν ολοκληρώθηκε. Δεν έχει χρεωθεί το λογαριασμό σας."
                : "Your payment was not completed. Your account has not been charged."}
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-8">
              <p className="text-sm text-muted-foreground">
                {language === "el"
                  ? "Αν αντιμετωπίζετε προβλήματα, επικοινωνήστε μαζί μας για βοήθεια."
                  : "If you're experiencing issues, please contact us for assistance."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/programs">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {language === "el" ? "Επιστροφή στα Προγράμματα" : "Back to Programs"}
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg">
                <Link to="/">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  {language === "el" ? "Αρχική Σελίδα" : "Home Page"}
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

export default PaymentCanceled;
