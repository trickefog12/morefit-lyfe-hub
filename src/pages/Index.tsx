import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";
import { CheckCircle, Star, TrendingUp, Users } from "lucide-react";
import heroDesktop from "@/assets/hero-desktop.jpg";
import heroMobile from "@/assets/hero-mobile.jpg";

const Index = () => {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source media="(min-width: 768px)" srcSet={heroDesktop} />
            <img
              src={heroMobile}
              alt="Δυναμική προπόνηση - Γυναίκα σε δράση"
              className="h-full w-full object-cover"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto px-4 lg:px-8 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              MoreFitLyfe
              <br />
              <span className="text-primary">Γίνε η καλύτερη έκδοση του εαυτού σου.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-xl">
              Προγράμματα δύναμης, εξατομικευμένα διαιτολόγια και υποστήριξη για πραγματική μεταμόρφωση.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/programs">
                <Button size="lg" className="bg-primary hover:bg-primary-glow text-lg px-8">
                  Αγόρασε τώρα
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-background/10 backdrop-blur-sm border-primary-foreground text-primary-foreground hover:bg-background/20">
                  Γίνε μέλος
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Γεια, είμαι η Stefania!</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Ως πιστοποιημένη προπονήτρια δύναμης και διατροφής, έχω βοηθήσει εκατοντάδες ανθρώπους να ανακαλύψουν τη δύναμή τους - όχι μόνο στο γυμναστήριο, αλλά και στη ζωή τους.
            </p>
            <p className="text-lg text-muted-foreground mb-4">
              Η φιλοσοφία μου είναι απλή: η δύναμη χτίζεται με συνέπεια, υποστήριξη και τη σωστή καθοδήγηση. Δεν πρόκειται για ακραίες δίαιτες ή απρόσιτους στόχους - πρόκειται για βιώσιμη μεταμόρφωση που διαρκεί.
            </p>
            <p className="text-lg text-muted-foreground">
              Ό,τι κι αν είναι ο στόχος σου - να χάσεις λίπος, να χτίσεις μυς, να γίνεις πιο δυνατός/ή - είμαι εδώ για να σε υποστηρίξω σε κάθε βήμα.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Δημοφιλή Προγράμματα</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Επέλεξε το πρόγραμμα που ταιριάζει στους στόχους σου και ξεκίνα τη μεταμόρφωσή σου σήμερα.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.sku} product={product} />
            ))}
          </div>
          <div className="text-center">
            <Link to="/programs">
              <Button size="lg" variant="outline">
                Δες Όλα τα Προγράμματα
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Πώς Λειτουργεί</h2>
            <p className="text-lg text-muted-foreground">
              Τρία απλά βήματα για να ξεκινήσεις το ταξίδι σου
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-12 pb-8">
                <div className="mb-6 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">1. Αξιολόγηση</h3>
                <p className="text-muted-foreground">
                  Επίλεξε το πρόγραμμα που ταιριάζει στους στόχους και το επίπεδό σου.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-12 pb-8">
                <div className="mb-6 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">2. Προπόνηση</h3>
                <p className="text-muted-foreground">
                  Ακολούθησε το δομημένο πρόγραμμα με σαφείς οδηγίες και υποστήριξη.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-12 pb-8">
                <div className="mb-6 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">3. Μεταμόρφωση</h3>
                <p className="text-muted-foreground">
                  Δες πραγματικά αποτελέσματα και γίνε η καλύτερη έκδοση του εαυτού σου.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Τι Λένε οι Πελάτες μου</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Το πρόγραμμα powerlifting με βοήθησε να πετύχω PR σε όλα τα lifts! Η Stefania ξέρει τι κάνει."
                </p>
                <p className="font-semibold">— Μαρία Κ.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Το transformation program άλλαξε τη ζωή μου. Έχασα 12 κιλά και αισθάνομαι απίστευτα!"
                </p>
                <p className="font-semibold">— Ελένη Π.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Καλύτερη επένδυση που έκανα! Τα προγράμματα είναι σαφή και αποτελεσματικά."
                </p>
                <p className="font-semibold">— Γιώργος Μ.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-glow">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Έτοιμος/η να Ξεκινήσεις;
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Μην περιμένεις άλλο. Το ταξίδι προς την καλύτερη έκδοση του εαυτού σου ξεκινά σήμερα.
          </p>
          <Link to="/programs">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Δες τα Προγράμματα
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
