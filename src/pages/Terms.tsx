import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";

const LAST_UPDATED = "08/04/2025";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h1 className="text-4xl font-bold mb-2">Όροι Χρήσης</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Τελευταία ενημέρωση: {LAST_UPDATED}
          </p>

          <div className="space-y-10 text-foreground/90 leading-relaxed">
            {/* 1 — Εισαγωγή */}
            <section>
              <h2 className="text-xl font-bold mb-3">1. Γενικά</h2>
              <p className="text-sm">
                Οι παρόντες Όροι Χρήσης διέπουν τη σχέση σας με την ιστοσελίδα{" "}
                <strong>morefitlyfe.com</strong> και τα ψηφιακά προϊόντα που προσφέρονται μέσω αυτής. 
                Χρησιμοποιώντας την ιστοσελίδα ή αγοράζοντας προϊόντα, αποδέχεστε πλήρως τους παρόντες όρους.
              </p>
              <p className="text-sm mt-2">
                <strong>Πάροχος υπηρεσιών:</strong> [ΕΠΩΝΥΜΙΑ ΕΠΙΧΕΙΡΗΣΗΣ — π.χ. MoreFitLyfe / Ατομική Επιχείρηση Στεφανίας Μεράκλη]<br />
                <strong>Έδρα:</strong> [ΔΙΕΥΘΥΝΣΗ]<br />
                <strong>ΑΦΜ:</strong> [ΑΦΜ]<br />
                <strong>Email:</strong>{" "}
                <a href="mailto:morefitlyfe@gmail.com" className="text-primary hover:underline">
                  morefitlyfe@gmail.com
                </a>
              </p>
            </section>

            {/* 2 — Ψηφιακά Προϊόντα & Παράδοση */}
            <section>
              <h2 className="text-xl font-bold mb-3">2. Ψηφιακά Προϊόντα & Παράδοση</h2>
              <ul className="list-disc list-inside space-y-1.5 text-sm">
                <li>Όλα τα προϊόντα (προγράμματα προπόνησης, οδηγοί) παραδίδονται σε <strong>ψηφιακή μορφή (PDF)</strong>.</li>
                <li>Μετά την επιτυχή πληρωμή, λαμβάνετε <strong>αυτόματα</strong> email επιβεβαίωσης με link λήψης και πρόσβαση μέσω του λογαριασμού σας.</li>
                <li>Για υπηρεσίες <strong>1:1 Coaching</strong>, η κράτηση γίνεται μέσω email εντός 24 ωρών από την αγορά.</li>
                <li>Όλες οι τιμές αναγράφονται σε <strong>Ευρώ (€)</strong> και περιλαμβάνουν ΦΠΑ (αν ισχύει).</li>
                <li>Οι πληρωμές γίνονται μέσω <strong>Stripe</strong> με ασφαλή κρυπτογράφηση. Δεν αποθηκεύουμε στοιχεία κάρτας.</li>
              </ul>
            </section>

            {/* 3 — Άδεια Χρήσης */}
            <section>
              <h2 className="text-xl font-bold mb-3">3. Άδεια Χρήσης & Πνευματική Ιδιοκτησία</h2>
              <p className="text-sm mb-3">
                Με την αγορά ενός προϊόντος, λαμβάνετε <strong>μη αποκλειστική, μη μεταβιβάσιμη, προσωπική</strong> άδεια χρήσης. Αυτό σημαίνει:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-sm">
                <li>✅ Μπορείτε να χρησιμοποιήσετε το πρόγραμμα αποκλειστικά για <strong>προσωπική σας χρήση</strong></li>
                <li>❌ <strong>Απαγορεύεται</strong> η αντιγραφή, αναδιανομή, μεταπώληση ή δημόσια κοινοποίηση</li>
                <li>❌ <strong>Απαγορεύεται</strong> η κοινή χρήση λογαριασμού ή link λήψης με τρίτους</li>
              </ul>
              <p className="text-sm mt-3">
                Όλο το περιεχόμενο (κείμενα, εικόνες, σχεδιαστικά, PDF) αποτελεί πνευματική ιδιοκτησία του MoreFitLyfe 
                και προστατεύεται από τη νομοθεσία περί πνευματικής ιδιοκτησίας.
              </p>
            </section>

            {/* 4 — Αποποίηση Ιατρικής Ευθύνης */}
            <section>
              <h2 className="text-xl font-bold mb-3">4. Αποποίηση Ιατρικής Ευθύνης</h2>
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-sm">
                <p className="mb-2">
                  <strong>⚠️ Τα προγράμματα του MoreFitLyfe δεν αποτελούν ιατρική συμβουλή.</strong>
                </p>
                <p className="mb-2">
                  Το περιεχόμενο παρέχεται αποκλειστικά για εκπαιδευτικούς και ενημερωτικούς σκοπούς. 
                  Δεν αντικαθιστά τη συμβουλή γιατρού, διαιτολόγου ή άλλου επαγγελματία υγείας.
                </p>
                <p>
                  <strong>Συνιστάται ανεπιφύλακτα</strong> να συμβουλευτείτε γιατρό πριν ξεκινήσετε οποιοδήποτε 
                  πρόγραμμα άσκησης ή αλλαγής διατροφής, ειδικά αν έχετε υποκείμενα νοσήματα ή τραυματισμούς.
                </p>
              </div>
            </section>

            {/* 5 — Αποποίηση Αποτελεσμάτων */}
            <section>
              <h2 className="text-xl font-bold mb-3">5. Αποποίηση Αποτελεσμάτων</h2>
              <p className="text-sm">
                Τα αποτελέσματα διαφέρουν ανά άτομο και εξαρτώνται από πολλούς παράγοντες, όπως η συνέπεια, 
                η διατροφή, η γενετική, ο ύπνος και η γενική κατάσταση υγείας. Δεν εγγυόμαστε συγκεκριμένα 
                αποτελέσματα. Τυχόν testimonials ή case studies αντικατοπτρίζουν ατομικές εμπειρίες.
              </p>
            </section>

            {/* 6 — Πολιτική Επιστροφών */}
            <section>
              <h2 className="text-xl font-bold mb-3">6. Πολιτική Επιστροφών</h2>
              <p className="text-sm mb-3">
                Λόγω του <strong>ψηφιακού χαρακτήρα</strong> των προϊόντων, και σύμφωνα με το Άρθρο 16(ιγ) 
                της Οδηγίας 2011/83/ΕΕ:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-sm">
                <li>
                  <strong>Δεν παρέχεται δικαίωμα υπαναχώρησης</strong> μετά τη λήψη/πρόσβαση στο ψηφιακό περιεχόμενο, 
                  καθώς η εκτέλεση αρχίζει αμέσως με τη συγκατάθεσή σας.
                </li>
                <li>
                  Αν αντιμετωπίσετε τεχνικό πρόβλημα (π.χ. δεν λειτουργεί το link λήψης), 
                  επικοινωνήστε εντός <strong>48 ωρών</strong> στο{" "}
                  <a href="mailto:morefitlyfe@gmail.com" className="text-primary hover:underline">
                    morefitlyfe@gmail.com
                  </a>{" "}
                  και θα το λύσουμε.
                </li>
                <li>
                  Για <strong>1:1 Coaching sessions</strong>, μπορείτε να αλλάξετε ημερομηνία με ειδοποίηση 48 ωρών. 
                  Δεν γίνεται επιστροφή χρημάτων μετά την κράτηση.
                </li>
              </ul>
            </section>

            {/* 7 — Περιορισμός Ευθύνης */}
            <section>
              <h2 className="text-xl font-bold mb-3">7. Περιορισμός Ευθύνης</h2>
              <ul className="list-disc list-inside space-y-1.5 text-sm">
                <li>
                  Το MoreFitLyfe <strong>δεν φέρει ευθύνη</strong> για τραυματισμούς, ζημίες ή προβλήματα υγείας 
                  που μπορεί να προκύψουν από τη χρήση των προγραμμάτων.
                </li>
                <li>
                  Σε κάθε περίπτωση, η μέγιστη ευθύνη μας περιορίζεται στο ποσό που καταβάλατε για το 
                  συγκεκριμένο προϊόν.
                </li>
                <li>
                  Δεν φέρουμε ευθύνη για προσωρινή αδυναμία πρόσβασης λόγω τεχνικών προβλημάτων, 
                  συντήρησης ή ανωτέρας βίας.
                </li>
              </ul>
            </section>

            {/* 8 — Λογαριασμός Χρήστη */}
            <section>
              <h2 className="text-xl font-bold mb-3">8. Λογαριασμός Χρήστη</h2>
              <ul className="list-disc list-inside space-y-1.5 text-sm">
                <li>Είστε υπεύθυνοι για την ασφάλεια του κωδικού πρόσβασής σας.</li>
                <li>Δεν επιτρέπεται η κοινή χρήση λογαριασμού με τρίτους.</li>
                <li>Διατηρούμε το δικαίωμα αναστολής λογαριασμών που παραβιάζουν τους παρόντες όρους.</li>
              </ul>
            </section>

            {/* 9 — Υποστήριξη */}
            <section>
              <h2 className="text-xl font-bold mb-3">9. Υποστήριξη & Επικοινωνία</h2>
              <ul className="list-disc list-inside space-y-1.5 text-sm">
                <li>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:morefitlyfe@gmail.com" className="text-primary hover:underline">
                    morefitlyfe@gmail.com
                  </a>
                </li>
                <li>
                  <strong>Χρόνος απόκρισης:</strong> Εντός 48 εργάσιμων ωρών (Δευτέρα–Παρασκευή).
                </li>
                <li>
                  Για τεχνικά ζητήματα (λήψη αρχείων, πρόσβαση λογαριασμού), θα σας βοηθήσουμε 
                  με προτεραιότητα.
                </li>
              </ul>
            </section>

            {/* 10 — Εφαρμοστέο Δίκαιο */}
            <section>
              <h2 className="text-xl font-bold mb-3">10. Εφαρμοστέο Δίκαιο & Δικαιοδοσία</h2>
              <p className="text-sm">
                Οι παρόντες όροι διέπονται από το <strong>Ελληνικό Δίκαιο</strong>. 
                Για οποιαδήποτε διαφορά, αρμόδια είναι τα δικαστήρια [ΠΟΛΗ ΕΔΡΑΣ — π.χ. Αθηνών / Θεσσαλονίκης].
              </p>
              <p className="text-sm mt-2">
                Για εναλλακτική επίλυση διαφορών, μπορείτε να χρησιμοποιήσετε την πλατφόρμα ΗΕΔ της Ευρωπαϊκής Επιτροπής:{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ec.europa.eu/consumers/odr
                </a>
              </p>
            </section>

            {/* 11 — Τροποποιήσεις */}
            <section>
              <h2 className="text-xl font-bold mb-3">11. Τροποποιήσεις Όρων</h2>
              <p className="text-sm">
                Διατηρούμε το δικαίωμα τροποποίησης αυτών των όρων. Η τρέχουσα ημερομηνία ενημέρωσης 
                αναγράφεται στην κορυφή. Σε περίπτωση ουσιωδών αλλαγών, θα ειδοποιηθείτε μέσω email 
                ή ειδοποίησης στην ιστοσελίδα.
              </p>
            </section>

            {/* Σύνδεσμοι */}
            <section className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Δείτε επίσης:{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Πολιτική Απορρήτου
                </Link>
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
