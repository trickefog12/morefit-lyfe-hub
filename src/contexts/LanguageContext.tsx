import { createContext, useContext, useState, ReactNode } from "react";

type Language = "el" | "en";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  el: {
    // Navigation
    home: "Αρχική",
    programs: "Προγράμματα",
    nutrition: "Διατροφή",
    signup: "Εγγραφή",
    
    // Hero Section
    hero_title: "MoreFitLyfe",
    hero_subtitle: "Γίνε η καλύτερη έκδοση του εαυτού σου.",
    hero_description: "Προγράμματα δύναμης, εξατομικευμένα διαιτολόγια και υποστήριξη για πραγματική μεταμόρφωση.",
    buy_now: "Αγόρασε τώρα",
    become_member: "Γίνε μέλος",
    
    // About Section
    about_title: "Γεια, είμαι η Stefania!",
    about_p1: "Ως πιστοποιημένη προπονήτρια δύναμης και διατροφής, έχω βοηθήσει εκατοντάδες ανθρώπους να ανακαλύψουν τη δύναμή τους - όχι μόνο στο γυμναστήριο, αλλά και στη ζωή τους.",
    about_p2: "Η φιλοσοφία μου είναι απλή: η δύναμη χτίζεται με συνέπεια, υποστήριξη και τη σωστή καθοδήγηση. Δεν πρόκειται για ακραίες δίαιτες ή απρόσιτους στόχους - πρόκειται για βιώσιμη μεταμόρφωση που διαρκεί.",
    about_p3: "Ό,τι κι αν είναι ο στόχος σου - να χάσεις λίπος, να χτίσεις μυς, να γίνεις πιο δυνατός/ή - είμαι εδώ για να σε υποστηρίξω σε κάθε βήμα.",
    
    // Featured Products
    featured_title: "Δημοφιλή Προγράμματα",
    featured_description: "Επέλεξε το πρόγραμμα που ταιριάζει στους στόχους σου και ξεκίνα τη μεταμόρφωσή σου σήμερα.",
    view_all_programs: "Δες Όλα τα Προγράμματα",
    
    // How It Works
    how_it_works: "Πώς Λειτουργεί",
    how_it_works_subtitle: "Τρία απλά βήματα για να ξεκινήσεις το ταξίδι σου",
    step1_title: "1. Αξιολόγηση",
    step1_description: "Επίλεξε το πρόγραμμα που ταιριάζει στους στόχους και το επίπεδό σου.",
    step2_title: "2. Προπόνηση",
    step2_description: "Ακολούθησε το δομημένο πρόγραμμα με σαφείς οδηγίες και υποστήριξη.",
    step3_title: "3. Μεταμόρφωση",
    step3_description: "Δες πραγματικά αποτελέσματα και γίνε η καλύτερη έκδοση του εαυτού σου.",
    
    // Testimonials
    testimonials_title: "Τι Λένε οι Πελάτες μου",
    testimonial1: "Το πρόγραμμα powerlifting με βοήθησε να πετύχω PR σε όλα τα lifts! Η Stefania ξέρει τι κάνει.",
    testimonial1_author: "— Μαρία Κ.",
    testimonial2: "Το transformation program άλλαξε τη ζωή μου. Έχασα 12 κιλά και αισθάνομαι απίστευτα!",
    testimonial2_author: "— Ελένη Π.",
    testimonial3: "Καλύτερη επένδυση που έκανα! Τα προγράμματα είναι σαφή και αποτελεσματικά.",
    testimonial3_author: "— Γιώργος Μ.",
    
    // CTA
    cta_title: "Έτοιμος/η να Ξεκινήσεις;",
    cta_description: "Μην περιμένεις άλλο. Το ταξίδι προς την καλύτερη έκδοση του εαυτού σου ξεκινά σήμερα.",
    view_programs: "Δες τα Προγράμματα",
    
    // Reviews Section
    loading_reviews: "Φόρτωση αξιολογήσεων...",
    no_reviews: "Δεν υπάρχουν ακόμα κριτικές.",
    submit_review: "Υποβολή Κριτικής",
    your_rating: "Η Αξιολόγησή σου",
    your_comment: "Το Σχόλιό σου",
    submit: "Υποβολή",
    submitting: "Υποβολή...",
    review_success: "Επιτυχία!",
    review_success_desc: "Η κριτική σου υποβλήθηκε με επιτυχία και θα αναρτηθεί μετά από έγκριση.",
    review_error: "Σφάλμα",
    review_error_desc: "Κάτι πήγε στραβά. Παρακαλώ δοκίμασε ξανά.",
    
    // Footer
    about: "Σχετικά",
    contact: "Επικοινωνία",
    all_rights: "Όλα τα δικαιώματα διατηρούνται.",
    privacy_policy: "Πολιτική Απορρήτου",
    terms_of_service: "Όροι Χρήσης",
    
    // Product Detail
    back_to_programs: "Επιστροφή στα Προγράμματα",
    whats_included: "Τι Περιλαμβάνεται",
    duration: "Διάρκεια",
    level: "Επίπεδο",
    format: "Μορφή",
    faq_title: "Συχνές Ερωτήσεις",
    faq_q1: "Πώς θα λάβω το πρόγραμμα;",
    faq_a1: "Μετά την αγορά, θα λάβεις άμεσα email με το πρόγραμμα σε μορφή PDF.",
    faq_q2: "Είναι κατάλληλο για αρχάριους;",
    faq_a2: "Κάθε πρόγραμμα έχει σαφείς οδηγίες και προσαρμόζεται στο επίπεδό σου. Αν είσαι αρχάριος/α, ξεκίνα με προγράμματα που συνιστώνται για αρχάριους.",
    faq_q3: "Μπορώ να ζητήσω επιστροφή χρημάτων;",
    faq_a3: "Λόγω της ψηφιακής φύσης των προϊόντων, δεν προσφέρουμε επιστροφές. Αν έχεις απορίες πριν την αγορά, μη διστάσεις να επικοινωνήσεις μαζί μου!",
    faq_q4: "Παίρνω επιπλέον υποστήριξη;",
    faq_a4: "Ναι! Μπορείς να στείλεις email στο morefitlyfe@gmail.com για γενικές ερωτήσεις. Για εξατομικευμένη υποστήριξη, κλείσε 1:1 coaching session.",
    what_clients_say: "Τι Λένε οι Πελάτες",
    
    // Meal Plans Coming Soon
    coming_soon: "Έρχεται Σύντομα",
    coming_soon_description: "Εξατομικευμένα διαιτολόγια θα είναι σύντομα διαθέσιμα. Μείνε συντονισμένος/η!",
  },
  en: {
    // Navigation
    home: "Home",
    programs: "Programs",
    nutrition: "Nutrition",
    signup: "Sign Up",
    
    // Hero Section
    hero_title: "MoreFitLyfe",
    hero_subtitle: "Become the best version of yourself.",
    hero_description: "Strength programs, personalized nutrition, and support for real transformation.",
    buy_now: "Buy Now",
    become_member: "Become a Member",
    
    // About Section
    about_title: "Hi, I'm Stefania!",
    about_p1: "As a certified strength and nutrition coach, I've helped hundreds of people discover their strength - not just in the gym, but in their lives.",
    about_p2: "My philosophy is simple: strength is built through consistency, support, and the right guidance. It's not about extreme diets or unrealistic goals - it's about sustainable transformation that lasts.",
    about_p3: "Whatever your goal - lose fat, build muscle, get stronger - I'm here to support you every step of the way.",
    
    // Featured Products
    featured_title: "Featured Programs",
    featured_description: "Choose the program that fits your goals and start your transformation today.",
    view_all_programs: "View All Programs",
    
    // How It Works
    how_it_works: "How It Works",
    how_it_works_subtitle: "Three simple steps to start your journey",
    step1_title: "1. Assessment",
    step1_description: "Choose the program that matches your goals and fitness level.",
    step2_title: "2. Train",
    step2_description: "Follow the structured program with clear instructions and support.",
    step3_title: "3. Transform",
    step3_description: "See real results and become the best version of yourself.",
    
    // Testimonials
    testimonials_title: "What My Clients Say",
    testimonial1: "The powerlifting program helped me achieve PRs in all my lifts! Stefania knows her stuff.",
    testimonial1_author: "— Maria K.",
    testimonial2: "The transformation program changed my life. I lost 12kg and feel amazing!",
    testimonial2_author: "— Helen P.",
    testimonial3: "Best investment I've made! The programs are clear and effective.",
    testimonial3_author: "— George M.",
    
    // CTA
    cta_title: "Ready to Get Started?",
    cta_description: "Don't wait any longer. Your journey to becoming your best self starts today.",
    view_programs: "View Programs",
    
    // Reviews Section
    loading_reviews: "Loading reviews...",
    no_reviews: "No reviews yet.",
    submit_review: "Submit Review",
    your_rating: "Your Rating",
    your_comment: "Your Comment",
    submit: "Submit",
    submitting: "Submitting...",
    review_success: "Success!",
    review_success_desc: "Your review has been submitted successfully and will be posted after approval.",
    review_error: "Error",
    review_error_desc: "Something went wrong. Please try again.",
    
    // Footer
    about: "About",
    contact: "Contact",
    all_rights: "All rights reserved.",
    privacy_policy: "Privacy Policy",
    terms_of_service: "Terms of Service",
    
    // Product Detail
    back_to_programs: "Back to Programs",
    whats_included: "What's Included",
    duration: "Duration",
    level: "Level",
    format: "Format",
    faq_title: "Frequently Asked Questions",
    faq_q1: "How will I receive the program?",
    faq_a1: "After purchase, you'll immediately receive an email with the program in PDF format.",
    faq_q2: "Is it suitable for beginners?",
    faq_a2: "Each program has clear instructions and adapts to your level. If you're a beginner, start with programs recommended for beginners.",
    faq_q3: "Can I request a refund?",
    faq_a3: "Due to the digital nature of the products, we don't offer refunds. If you have any questions before purchasing, don't hesitate to contact me!",
    faq_q4: "Do I get additional support?",
    faq_a4: "Yes! You can send an email to morefitlyfe@gmail.com for general questions. For personalized support, book a 1:1 coaching session.",
    what_clients_say: "What Clients Say",
    
    // Meal Plans Coming Soon
    coming_soon: "Coming Soon",
    coming_soon_description: "Personalized meal plans will be available soon. Stay tuned!",
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("el");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "el" ? "en" : "el"));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.el] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
