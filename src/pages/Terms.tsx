import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString('el-GR')}</p>
          
          <div className="space-y-8 prose prose-slate max-w-none">
            <section>
              <h2 className="text-2xl font-bold mb-4">Όροι Χρήσης</h2>
              <p className="text-muted-foreground">
                Καλώς ήρθατε στο MoreFitLyfe. Χρησιμοποιώντας την ιστοσελίδα και τις υπηρεσίες μας, 
                συμφωνείτε με τους παρακάτω όρους χρήσης. Παρακαλούμε διαβάστε τους προσεκτικά.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Υπηρεσίες</h2>
              <p className="text-muted-foreground mb-4">
                Το MoreFitLyfe προσφέρει ψηφιακά προγράμματα προπόνησης, διατροφικούς οδηγούς και υπηρεσίες coaching. 
                Όλα τα προϊόντα είναι ψηφιακά και παραδίδονται μέσω email ή μέσω της πλατφόρμας μας.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Αγορές και Πληρωμές</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Όλες οι τιμές είναι σε δολάρια ΗΠΑ (USD)</li>
                <li>Οι πληρωμές επεξεργάζονται ασφαλώς μέσω Stripe</li>
                <li>Θα λάβετε επιβεβαίωση αγοράς μέσω email</li>
                <li>Τα ψηφιακά προϊόντα παραδίδονται αμέσως μετά την επιτυχή πληρωμή</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Πολιτική Επιστροφών</h2>
              <p className="text-muted-foreground">
                Λόγω του ψηφιακού χαρακτήρα των προϊόντων μας, δεν μπορούμε να προσφέρουμε επιστροφές χρημάτων 
                μετά την παράδοση του περιεχομένου. Αν έχετε οποιοδήποτε πρόβλημα με την αγορά σας, 
                επικοινωνήστε μαζί μας εντός 48 ωρών στο morefitlyfe@gmail.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Πνευματική Ιδιοκτησία</h2>
              <p className="text-muted-foreground">
                Όλο το περιεχόμενο (προγράμματα, εικόνες, κείμενα, video) είναι πνευματική ιδιοκτησία του MoreFitLyfe 
                και προστατεύεται από τους νόμους περί πνευματικής ιδιοκτησίας. Απαγορεύεται η αναδημοσίευση, 
                αναπαραγωγή ή διανομή χωρίς γραπτή άδεια.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Αποποίηση Ευθύνης</h2>
              <p className="text-muted-foreground mb-4">
                Τα προγράμματα και οι συμβουλές που παρέχονται είναι για εκπαιδευτικούς σκοπούς. 
                Συνιστάται να συμβουλευτείτε γιατρό πριν ξεκινήσετε οποιοδήποτε πρόγραμμα άσκησης ή διατροφής.
              </p>
              <p className="text-muted-foreground">
                Το MoreFitLyfe δεν φέρει ευθύνη για τυχόν τραυματισμούς ή προβλήματα υγείας που μπορεί να προκύψουν 
                από τη χρήση των προγραμμάτων μας.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Λογαριασμός Χρήστη</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Είστε υπεύθυνοι για τη διατήρηση της ασφάλειας του λογαριασμού σας</li>
                <li>Δεν επιτρέπεται η κοινή χρήση του λογαριασμού σας</li>
                <li>Διατηρούμε το δικαίωμα να αναστείλουμε λογαριασμούς που παραβιάζουν τους όρους</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Τροποποιήσεις Όρων</h2>
              <p className="text-muted-foreground">
                Διατηρούμε το δικαίωμα να τροποποιήσουμε αυτούς τους όρους ανά πάσα στιγμή. 
                Οι αλλαγές θα δημοσιεύονται σε αυτή τη σελίδα και η συνεχιζόμενη χρήση των υπηρεσιών μας 
                συνιστά αποδοχή των τροποποιημένων όρων.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Επικοινωνία</h2>
              <p className="text-muted-foreground">
                Για ερωτήσεις σχετικά με τους όρους χρήσης, επικοινωνήστε μαζί μας στο:{" "}
                <a href="mailto:morefitlyfe@gmail.com" className="text-primary hover:underline">
                  morefitlyfe@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
