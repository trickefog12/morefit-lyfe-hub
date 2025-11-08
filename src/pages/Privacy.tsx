import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString('el-GR')}</p>
          
          <div className="space-y-8 prose prose-slate max-w-none">
            <section>
              <h2 className="text-2xl font-bold mb-4">Πολιτική Απορρήτου</h2>
              <p className="text-muted-foreground">
                Στο MoreFitLyfe, σεβόμαστε το απόρρητό σας και δεσμευόμαστε να προστατεύουμε τα προσωπικά σας δεδομένα. 
                Αυτή η πολιτική απορρήτου εξηγεί πώς συλλέγουμε, χρησιμοποιούμε και προστατεύουμε τις πληροφορίες σας.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Δεδομένα που Συλλέγουμε</h2>
              <p className="text-muted-foreground mb-4">Συλλέγουμε τα ακόλουθα δεδομένα:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Όνομα και στοιχεία επικοινωνίας (email)</li>
                <li>Πληροφορίες πληρωμής (μέσω ασφαλούς πλατφόρμας Stripe)</li>
                <li>Πληροφορίες χρήσης της ιστοσελίδας</li>
                <li>Cookies για βελτίωση της εμπειρίας χρήστη</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Πώς Χρησιμοποιούμε τα Δεδομένα σας</h2>
              <p className="text-muted-foreground mb-4">Χρησιμοποιούμε τα δεδομένα σας για:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Επεξεργασία των παραγγελιών σας</li>
                <li>Επικοινωνία σχετικά με τις υπηρεσίες μας</li>
                <li>Αποστολή newsletter (με τη συγκατάθεσή σας)</li>
                <li>Βελτίωση των υπηρεσιών μας</li>
                <li>Συμμόρφωση με νομικές υποχρεώσεις</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Τα Δικαιώματά σας (GDPR)</h2>
              <p className="text-muted-foreground mb-4">Σύμφωνα με το GDPR, έχετε το δικαίωμα:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Πρόσβασης στα προσωπικά σας δεδομένα</li>
                <li>Διόρθωσης ανακριβών δεδομένων</li>
                <li>Διαγραφής των δεδομένων σας</li>
                <li>Περιορισμού της επεξεργασίας</li>
                <li>Φορητότητας των δεδομένων</li>
                <li>Εναντίωσης στην επεξεργασία</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Ασφάλεια Δεδομένων</h2>
              <p className="text-muted-foreground">
                Λαμβάνουμε κατάλληλα τεχνικά και οργανωτικά μέτρα για την προστασία των προσωπικών σας δεδομένων. 
                Οι πληρωμές επεξεργάζονται μέσω ασφαλούς πλατφόρμας (Stripe) και δεν αποθηκεύουμε στοιχεία πιστωτικών καρτών.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Cookies</h2>
              <p className="text-muted-foreground">
                Χρησιμοποιούμε cookies για τη βελτίωση της εμπειρίας σας στην ιστοσελίδα μας. 
                Μπορείτε να διαχειριστείτε τις προτιμήσεις cookies στις ρυθμίσεις του προγράμματος περιήγησής σας.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Επικοινωνία</h2>
              <p className="text-muted-foreground">
                Για οποιεσδήποτε ερωτήσεις σχετικά με την πολιτική απορρήτου ή τα δικαιώματά σας, 
                επικοινωνήστε μαζί μας στο:{" "}
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

export default Privacy;
