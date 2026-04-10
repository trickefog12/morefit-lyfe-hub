import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";

const LAST_UPDATED = "08/04/2025";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h1 className="text-4xl font-bold mb-2">Πολιτική Απορρήτου</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Τελευταία ενημέρωση: {LAST_UPDATED}
          </p>

          <div className="space-y-10 text-foreground/90 leading-relaxed">
            {/* 1 — Υπεύθυνος Επεξεργασίας */}
            <section>
              <h2 className="text-xl font-bold mb-3">1. Υπεύθυνος Επεξεργασίας Δεδομένων</h2>
              <p>
                Υπεύθυνος επεξεργασίας των προσωπικών σας δεδομένων είναι:
              </p>
              <ul className="list-none mt-3 space-y-1 text-sm">
                <li><strong>Επωνυμία:</strong> [ΕΠΩΝΥΜΙΑ ΕΠΙΧΕΙΡΗΣΗΣ — π.χ. MoreFitLyfe / Ατομική Επιχείρηση Στεφανίας Μεράκλη]</li>
                <li><strong>Διεύθυνση:</strong> [ΔΙΕΥΘΥΝΣΗ ΕΔΡΑΣ]</li>
                <li><strong>ΑΦΜ:</strong> [ΑΦΜ]</li>
                <li><strong>Email επικοινωνίας:</strong>{" "}
                  <a href="mailto:morefitlyfe@gmail.com" className="text-primary hover:underline">
                    morefitlyfe@gmail.com
                  </a>
                </li>
              </ul>
            </section>

            {/* 2 — Ποια δεδομένα συλλέγουμε */}
            <section>
              <h2 className="text-xl font-bold mb-3">2. Ποια Δεδομένα Συλλέγουμε</h2>
              <p className="mb-3">
                Κατά τη χρήση της ιστοσελίδας <strong>morefitlyfe.com</strong> ενδέχεται να συλλέξουμε τα εξής:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-sm">
                <li><strong>Δεδομένα εγγραφής:</strong> ονοματεπώνυμο, διεύθυνση email</li>
                <li><strong>Δεδομένα αγορών:</strong> SKU προϊόντος, ποσό πληρωμής, κατάσταση πληρωμής (δεν αποθηκεύουμε στοιχεία κάρτας)</li>
                <li><strong>Δεδομένα waitlist:</strong> email, προαιρετικός στόχος (π.χ. «απώλεια λίπους»)</li>
                <li><strong>Δεδομένα αναλυτικών:</strong> σελίδες που επισκέπτεστε, τύπος συσκευής, referrer, session ID (ανωνυμοποιημένα)</li>
                <li><strong>Κριτικές:</strong> βαθμολογία, σχόλιο, ημερομηνία</li>
              </ul>
            </section>

            {/* 3 — Σκοπός & Νομική Βάση */}
            <section>
              <h2 className="text-xl font-bold mb-3">3. Σκοπός Επεξεργασίας & Νομική Βάση (GDPR)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-border rounded-lg mt-2">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-semibold">Σκοπός</th>
                      <th className="text-left p-3 font-semibold">Νομική Βάση</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-3">Εκτέλεση αγοράς & παράδοση ψηφιακών προϊόντων</td>
                      <td className="p-3">Εκτέλεση σύμβασης (Άρθρο 6§1β)</td>
                    </tr>
                    <tr>
                      <td className="p-3">Δημιουργία & διαχείριση λογαριασμού</td>
                      <td className="p-3">Εκτέλεση σύμβασης (Άρθρο 6§1β)</td>
                    </tr>
                    <tr>
                      <td className="p-3">Αποστολή email επιβεβαίωσης αγοράς</td>
                      <td className="p-3">Εκτέλεση σύμβασης (Άρθρο 6§1β)</td>
                    </tr>
                    <tr>
                      <td className="p-3">Waitlist ειδοποιήσεις</td>
                      <td className="p-3">Συγκατάθεση (Άρθρο 6§1α)</td>
                    </tr>
                    <tr>
                      <td className="p-3">Ανάλυση επισκεψιμότητας & βελτίωση υπηρεσιών</td>
                      <td className="p-3">Έννομο συμφέρον (Άρθρο 6§1στ)</td>
                    </tr>
                    <tr>
                      <td className="p-3">Συμμόρφωση με φορολογικές υποχρεώσεις</td>
                      <td className="p-3">Νομική υποχρέωση (Άρθρο 6§1γ)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4 — Διατήρηση Δεδομένων */}
            <section>
              <h2 className="text-xl font-bold mb-3">4. Χρόνος Διατήρησης Δεδομένων</h2>
              <ul className="list-disc list-inside space-y-1.5 text-sm">
                <li><strong>Δεδομένα λογαριασμού:</strong> Για όσο διατηρείτε τον λογαριασμό σας, και έως 30 ημέρες μετά τη διαγραφή</li>
                <li><strong>Δεδομένα αγορών:</strong> 5 έτη (φορολογική νομοθεσία)</li>
                <li><strong>Δεδομένα αναλυτικών:</strong> 90 ημέρες (αυτόματη διαγραφή)</li>
                <li><strong>Waitlist email:</strong> Έως τη λήξη της καμπάνιας ή μέχρι να ζητήσετε διαγραφή</li>
              </ul>
            </section>

            {/* 5 — Τρίτοι Πάροχοι */}
            <section>
              <h2 className="text-xl font-bold mb-3">5. Τρίτοι Πάροχοι Υπηρεσιών</h2>
              <p className="mb-3 text-sm">
                Μοιραζόμαστε δεδομένα μόνο με αξιόπιστους τρίτους παρόχους, αποκλειστικά για τους σκοπούς που περιγράφονται παραπάνω:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-sm">
                <li><strong>Stripe, Inc.</strong> — Επεξεργασία πληρωμών (ΕΕ/ΗΠΑ, <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">πολιτική απορρήτου</a>)</li>
                <li><strong>[ΠΑΡΟΧΟΣ HOSTING / ΒΑΣΗΣ ΔΕΔΟΜΕΝΩΝ]</strong> — Φιλοξενία εφαρμογής & αποθήκευση δεδομένων</li>
                <li><strong>[ΠΑΡΟΧΟΣ EMAIL — π.χ. Resend / Sendgrid]</strong> — Αποστολή transactional emails</li>
              </ul>
              <p className="text-sm mt-3">
                Δεν πωλούμε και δεν μοιραζόμαστε τα δεδομένα σας με τρίτους για σκοπούς μάρκετινγκ.
              </p>
            </section>

            {/* 6 — Δικαιώματα */}
            <section>
              <h2 className="text-xl font-bold mb-3">6. Τα Δικαιώματά σας (GDPR)</h2>
              <p className="mb-3 text-sm">
                Σύμφωνα με τον Γενικό Κανονισμό Προστασίας Δεδομένων (GDPR), έχετε τα εξής δικαιώματα:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-sm">
                <li><strong>Πρόσβαση</strong> — ζητήστε αντίγραφο των δεδομένων σας</li>
                <li><strong>Διόρθωση</strong> — ζητήστε τη διόρθωση ανακριβών δεδομένων</li>
                <li><strong>Διαγραφή</strong> — ζητήστε τη διαγραφή των δεδομένων σας («δικαίωμα στη λήθη»)</li>
                <li><strong>Περιορισμός</strong> — ζητήστε τον περιορισμό της επεξεργασίας</li>
                <li><strong>Φορητότητα</strong> — λάβετε τα δεδομένα σας σε δομημένη μορφή</li>
                <li><strong>Εναντίωση</strong> — αντιταχθείτε στην επεξεργασία για σκοπούς έννομου συμφέροντος</li>
                <li><strong>Ανάκληση συγκατάθεσης</strong> — ανά πάσα στιγμή, χωρίς να θίγεται η νομιμότητα προγενέστερης επεξεργασίας</li>
              </ul>
              <p className="text-sm mt-3">
                Για να ασκήσετε οποιοδήποτε δικαίωμα, στείλτε email στο{" "}
                <a href="mailto:morefitlyfe@gmail.com" className="text-primary hover:underline">
                  morefitlyfe@gmail.com
                </a>
                . Θα απαντήσουμε εντός 30 ημερών.
              </p>
              <p className="text-sm mt-2">
                Έχετε επίσης δικαίωμα καταγγελίας στην{" "}
                <strong>Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα (ΑΠΔΠΧ)</strong> — 
                <a href="https://www.dpa.gr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                  www.dpa.gr
                </a>
              </p>
            </section>

            {/* 7 — Cookies */}
            <section>
              <h2 className="text-xl font-bold mb-3">7. Cookies & Analytics</h2>
              <p className="text-sm mb-3">
                Η ιστοσελίδα χρησιμοποιεί:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-sm">
                <li><strong>Απαραίτητα cookies:</strong> Για τη λειτουργία της σύνδεσης και του καλαθιού αγορών</li>
                <li><strong>Cookies αναλυτικών:</strong> Ανώνυμη καταγραφή επισκεψιμότητας (session ID, σελίδες, τύπος συσκευής). Τα δεδομένα αναλυτικών διαγράφονται αυτόματα μετά από 90 ημέρες.</li>
              </ul>
              <p className="text-sm mt-3">
                Μπορείτε να απενεργοποιήσετε τα cookies μέσω των ρυθμίσεων του browser σας. Αυτό ενδέχεται να επηρεάσει κάποιες λειτουργίες.
              </p>
            </section>

            {/* 8 — Ασφάλεια */}
            <section>
              <h2 className="text-xl font-bold mb-3">8. Ασφάλεια Δεδομένων</h2>
              <p className="text-sm">
                Εφαρμόζουμε κατάλληλα τεχνικά και οργανωτικά μέτρα ασφαλείας, όπως κρυπτογράφηση SSL/TLS, 
                Row-Level Security στη βάση δεδομένων, και ασφαλή αυθεντικοποίηση. Οι πληρωμές επεξεργάζονται 
                αποκλειστικά μέσω Stripe — δεν αποθηκεύουμε αριθμούς καρτών.
              </p>
            </section>

            {/* 9 — Αλλαγές */}
            <section>
              <h2 className="text-xl font-bold mb-3">9. Αλλαγές στην Πολιτική</h2>
              <p className="text-sm">
                Ενδέχεται να ενημερώσουμε αυτή την πολιτική κατά καιρούς. Η τρέχουσα ημερομηνία ενημέρωσης αναγράφεται 
                στην αρχή της σελίδας. Σε περίπτωση ουσιαστικών αλλαγών, θα σας ειδοποιήσουμε μέσω email.
              </p>
            </section>

            {/* 10 — Επικοινωνία */}
            <section>
              <h2 className="text-xl font-bold mb-3">10. Επικοινωνία</h2>
              <p className="text-sm">
                Για ερωτήσεις σχετικά με τα προσωπικά σας δεδομένα ή αυτήν την πολιτική, επικοινωνήστε μαζί μας:
              </p>
              <p className="text-sm mt-2">
                📧{" "}
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
