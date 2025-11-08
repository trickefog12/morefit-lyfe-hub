import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { products } from "@/data/products";
import { ArrowLeft, CheckCircle, Star } from "lucide-react";
import programStrength from "@/assets/program-strength.jpg";
import mealGuide from "@/assets/meal-guide.jpg";
import coachingSession from "@/assets/coaching-session.jpg";

const getImageForProduct = (product: any) => {
  if (product.category === "transformation") return mealGuide;
  if (product.category === "coaching") return coachingSession;
  return programStrength;
};

const ProductDetail = () => {
  const { sku } = useParams();
  const product = products.find((p) => p.sku === sku);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Το προϊόν δεν βρέθηκε</h1>
            <Link to="/programs">
              <Button>Επιστροφή στα Προγράμματα</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <Link to="/programs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Πίσω στα Προγράμματα
          </Link>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={getImageForProduct(product)}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-4xl font-bold">{product.name}</h1>
                <Badge variant="secondary" className="text-2xl py-2 px-4">
                  ${product.price}
                </Badge>
              </div>
              
              <p className="text-xl text-muted-foreground mb-6">
                {product.shortBenefit}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Διάρκεια:</span>
                  <span className="text-muted-foreground">{product.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Μορφή:</span>
                  <Badge variant="outline">
                    {product.format === "pdf" && "PDF Download"}
                    {product.format === "video" && "Video Course"}
                    {product.format === "coach" && "1:1 Coaching"}
                    {product.format === "custom" && "Custom Program"}
                  </Badge>
                </div>
              </div>

              <Button size="lg" className="w-full md:w-auto bg-primary hover:bg-primary-glow text-lg px-12 mb-4">
                Αγόρασε Τώρα - ${product.price}
              </Button>

              <p className="text-sm text-muted-foreground">
                Ασφαλής πληρωμή μέσω Stripe • Άμεση παράδοση
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-6">Σχετικά με το Πρόγραμμα</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            <h3 className="text-2xl font-bold mb-4">Τι Περιλαμβάνεται:</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {product.deliverables.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Για ποιόν είναι αυτό το πρόγραμμα;</h3>
                <p className="text-muted-foreground">{product.targetAudience}</p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center">Συχνές Ερωτήσεις</h2>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Πώς θα λάβω το πρόγραμμα;</AccordionTrigger>
                <AccordionContent>
                  Αμέσως μετά την αγορά, θα λάβεις ένα email με link για να κατεβάσεις το πρόγραμμά σου. Μπορείς επίσης να το βρεις στην περιοχή "Οι Αγορές μου" στον λογαριασμό σου.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Χρειάζομαι προηγούμενη εμπειρία;</AccordionTrigger>
                <AccordionContent>
                  Κάθε πρόγραμμα έχει σαφείς οδηγίες και προσαρμόζεται στο επίπεδό σου. Αν είσαι αρχάριος/α, ξεκίνα με τα προγράμματα που προτείνονται για αρχάριους.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Μπορώ να ζητήσω επιστροφή χρημάτων;</AccordionTrigger>
                <AccordionContent>
                  Λόγω του ψηφιακού χαρακτήρα των προϊόντων, δεν προσφέρουμε επιστροφές. Αν έχεις οποιαδήποτε απορία πριν την αγορά, μη διστάσεις να επικοινωνήσεις μαζί μου!
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Έχω επιπλέον υποστήριξη;</AccordionTrigger>
                <AccordionContent>
                  Ναι! Μπορείς να στείλεις email στο morefitlyfe@gmail.com για γενικές ερωτήσεις. Για εξατομικευμένη υποστήριξη, κλείσε μια 1:1 coaching session.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Testimonials */}
          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Τι Λένε οι Πελάτες</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} className="h-4 w-4 fill-secondary text-secondary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      "Απίστευτο πρόγραμμα! Είδα αποτελέσματα μέσα σε λίγες εβδομάδες. Η Stefania ξέρει τι κάνει!"
                    </p>
                    <p className="text-sm font-semibold">— Χρήστης {i}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary">
            <CardContent className="pt-12 pb-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Έτοιμος/η να Ξεκινήσεις;</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Μην χάσεις την ευκαιρία να επενδύσεις στον εαυτό σου. Ξεκίνα το ταξίδι μεταμόρφωσης σήμερα!
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary-glow text-lg px-12">
                Αγόρασε Τώρα - ${product.price}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
