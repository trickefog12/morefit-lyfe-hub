import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";

const Programs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Τα Προγράμματά μου
              </h1>
              <p className="text-lg text-muted-foreground">
                Επαγγελματικά σχεδιασμένα προγράμματα για κάθε επίπεδο και στόχο. 
                Από powerlifting και υπερτροφία μέχρι κινητικότητα και on-the-go workouts.
              </p>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.sku} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Συχνές Ερωτήσεις</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">Πώς λαμβάνω το πρόγραμμά μου;</h3>
                <p className="text-muted-foreground">
                  Αμέσως μετά την αγορά, θα λάβεις ένα email με link για να κατεβάσεις το πρόγραμμά σου. Τα αρχεία είναι σε PDF μορφή και μπορείς να τα έχεις πάντα μαζί σου.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Είμαι αρχάριος/α. Ποιο πρόγραμμα μου ταιριάζει;</h3>
                <p className="text-muted-foreground">
                  Το "Πρόγραμμα Powerlifting 3 Μηνών" και το "At-Home Workouts" είναι ιδανικά για αρχάριους. Εναλλακτικά, κλείσε μια 1:1 session για εξατομικευμένη καθοδήγηση!
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Μπορώ να ακολουθήσω πρόγραμμα στο σπίτι;</h3>
                <p className="text-muted-foreground">
                  Ναι! Το "At-Home or On-the-Go Workouts" και το "Kettlebell Program" μπορούν να γίνουν εξ ολοκλήρου στο σπίτι με μηδενικό ή ελάχιστο εξοπλισμό.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Τι περιλαμβάνει το Transformation Program;</h3>
                <p className="text-muted-foreground">
                  Το πρόγραμμα μεταμόρφωσης περιλαμβάνει 12 εβδομάδες προπόνησης, εξατομικευμένο meal plan, monthly check-ins και email υποστήριξη καθ' όλη τη διάρκεια.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Υπάρχει εγγύηση επιστροφής χρημάτων;</h3>
                <p className="text-muted-foreground">
                  Λόγω του ψηφιακού χαρακτήρα των προϊόντων, δεν προσφέρουμε επιστροφές. Ωστόσο, αν έχεις οποιαδήποτε απορία πριν την αγορά, στείλε μου email!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Programs;
