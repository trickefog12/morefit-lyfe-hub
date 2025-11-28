import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
    hero_subtitle: "Γίνε η καλύτερη εκδοχή του εαυτού σου.",
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
    footer_description: "Εξειδικευμένα προγράμματα προπόνησης και διατροφής για πραγματική μεταμόρφωση.",
    footer_by: "Από τη Stefania Meraklis",
    quick_links: "Γρήγοροι Σύνδεσμοι",
    about: "Σχετικά",
    contact: "Επικοινωνία",
    all_rights: "Όλα τα δικαιώματα διατηρούνται.",
    privacy_policy: "Πολιτική Απορρήτου",
    terms_of_service: "Όροι Χρήσης",
    
    // Programs Page
    programs_hero_title: "Τα Προγράμματά μου",
    programs_hero_subtitle: "Επαγγελματικά προγράμματα δύναμης και μεταμόρφωσης σχεδιασμένα για πραγματικά αποτελέσματα.",
    faq1_question: "Για ποιον είναι αυτά τα προγράμματα;",
    faq1_answer: "Τα προγράμματα είναι για όλους - από αρχάριους έως προχωρημένους αθλητές. Κάθε πρόγραμμα περιλαμβάνει σαφείς οδηγίες και μπορεί να προσαρμοστεί στο επίπεδό σου.",
    faq2_question: "Χρειάζομαι εξοπλισμό γυμναστηρίου;",
    faq2_answer: "Τα περισσότερα προγράμματα απαιτούν βασικό εξοπλισμό γυμναστηρίου (μπάρα, βάρη, καθιστικό). Αν έχεις ερωτήσεις για συγκεκριμένο εξοπλισμό, μη διστάσεις να ρωτήσεις!",
    faq3_question: "Πόσο καιρό διαρκεί κάθε πρόγραμμα;",
    faq3_answer: "Η διάρκεια κυμαίνεται από 4 έως 12 εβδομάδες ανάλογα με το πρόγραμμα. Κάθε προϊόν έχει λεπτομερείς πληροφορίες για τη διάρκεια και το περιεχόμενο.",
    faq4_question: "Μπορώ να πάρω προσωπική καθοδήγηση;",
    faq4_answer: "Ναι! Προσφέρω 1:1 online coaching sessions για εξατομικευμένη καθοδήγηση. Δες τα διαθέσιμα προγράμματα ή επικοινώνησε μαζί μου για περισσότερες πληροφορίες.",
    faq5_question: "Τι περιλαμβάνει το κόστος;",
    faq5_answer: "Το κόστος περιλαμβάνει πρόσβαση στο πλήρες πρόγραμμα σε μορφή PDF με σαφείς οδηγίες, προγράμματα προπονήσεων και όλα τα απαραίτητα υλικά για να ξεκινήσεις άμεσα.",
    
    // Meal Plans Page
    meal_plans_title: "Διατροφικά Προγράμματα",
    meal_plans_subtitle: "Εξατομικευμένα διαιτολόγια θα είναι σύντομα διαθέσιμα. Μείνε συντονισμένος/η!",
    coming_soon: "Έρχεται Σύντομα",
    coming_soon_description: "Εξατομικευμένα διαιτολόγια θα είναι σύντομα διαθέσιμα. Μείνε συντονισμένος/η!",
    find_ideal_plan: "Βρες το Ιδανικό Σου Πλάνο",
    find_ideal_plan_description: "Απάντησε σε λίγες ερωτήσεις για να βρούμε το κατάλληλο πρόγραμμα διατροφής για εσένα.",
    body_weight: "Σωματικό Βάρος",
    under_60kg: "Κάτω από 60kg",
    weight_60_80kg: "60-80kg",
    over_80kg: "Πάνω από 80kg",
    activity_level: "Επίπεδο Δραστηριότητας",
    select_activity: "Επίλεξε επίπεδο δραστηριότητας",
    sedentary: "Καθιστική ζωή (λίγη ή καθόλου άσκηση)",
    moderate: "Μέτρια δραστηριότητα (άσκηση 3-5 φορές την εβδομάδα)",
    high: "Υψηλή δραστηριότητα (άσκηση 6-7 φορές την εβδομάδα)",
    recommended_plan: "Συνιστώμενο Πρόγραμμα",
    recommended_plan_description: "Βασισμένο στα στοιχεία σου, αυτό το πλάνο θα σε βοηθήσει να πετύχεις τους στόχους σου.",
    daily_calories: "Εξατομικευμένη πρόσληψη θερμίδων",
    recipes_tips: "100+ συνταγές και συμβουλές μαγειρικής",
    grocery_lists: "Εβδομαδιαίες λίστες αγορών",
    meal_alternatives: "Εναλλακτικές επιλογές γεύματος",
    recommended_price: "Προτεινόμενη Τιμή",
    buy_now_btn: "Αγόρασε Τώρα",
    looking_for_package: "Ψάχνεις για Ολοκληρωμένο Πακέτο;",
    transformation_description: "Συνδύασε προπόνηση και διατροφή για μέγιστα αποτελέσματα με το Transformation Program μου.",
    weeks_training: "12 εβδομάδες δομημένης προπόνησης",
    custom_meal_plan: "Εξατομικευμένο πρόγραμμα διατροφής",
    monthly_checkins: "Μηνιαίοι έλεγχοι προόδου",
    email_support: "Υποστήριξη μέσω email",
    learn_more: "Μάθε Περισσότερα",
    
    // Product Detail
    back_to_programs: "Επιστροφή στα Προγράμματα",
    back_to_programs_link: "Επιστροφή στα Προγράμματα",
    whats_included: "Τι Περιλαμβάνεται",
    duration: "Διάρκεια",
    duration_label: "Διάρκεια:",
    level: "Επίπεδο",
    format: "Μορφή",
    format_label: "Μορφή:",
    buy_now_price: "Αγόρασε Τώρα",
    secure_payment: "Ασφαλής πληρωμή μέσω Stripe",
    about_program: "Σχετικά με το Πρόγραμμα",
    who_is_this_for: "Για Ποιον Είναι Αυτό;",
    faq_title: "Συχνές Ερωτήσεις",
    faq_title_detail: "Συχνές Ερωτήσεις",
    faq_detail_q1: "Πώς θα λάβω το πρόγραμμα;",
    faq_detail_a1: "Μετά την αγορά, θα λάβεις άμεσα email με το πρόγραμμα σε μορφή PDF.",
    faq_detail_q2: "Είναι κατάλληλο για αρχάριους;",
    faq_detail_a2: "Κάθε πρόγραμμα έχει σαφείς οδηγίες και προσαρμόζεται στο επίπεδό σου. Αν είσαι αρχάριος/α, ξεκίνα με προγράμματα που συνιστώνται για αρχάριους.",
    faq_detail_q3: "Μπορώ να ζητήσω επιστροφή χρημάτων;",
    faq_detail_a3: "Λόγω της ψηφιακής φύσης των προϊόντων, δεν προσφέρουμε επιστροφές. Αν έχεις απορίες πριν την αγορά, μη διστάσεις να επικοινωνήσεις μαζί μου!",
    faq_detail_q4: "Παίρνω επιπλέον υποστήριξη;",
    faq_detail_a4: "Ναι! Μπορείς να στείλεις email στο morefitlyfe@gmail.com για γενικές ερωτήσεις. Για εξατομικευμένη υποστήριξη, κλείσε 1:1 coaching session.",
    faq_q1: "Πώς θα λάβω το πρόγραμμα;",
    faq_a1: "Μετά την αγορά, θα λάβεις άμεσα email με το πρόγραμμα σε μορφή PDF.",
    faq_q2: "Είναι κατάλληλο για αρχάριους;",
    faq_a2: "Κάθε πρόγραμμα έχει σαφείς οδηγίες και προσαρμόζεται στο επίπεδό σου. Αν είσαι αρχάριος/α, ξεκίνα με προγράμματα που συνιστώνται για αρχάριους.",
    faq_q3: "Μπορώ να ζητήσω επιστροφή χρημάτων;",
    faq_a3: "Λόγω της ψηφιακής φύσης των προϊόντων, δεν προσφέρουμε επιστροφές. Αν έχεις απορίες πριν την αγορά, μη διστάσεις να επικοινωνήσεις μαζί μου!",
    faq_q4: "Παίρνω επιπλέον υποστήριξη;",
    faq_a4: "Ναι! Μπορείς να στείλεις email στο morefitlyfe@gmail.com για γενικές ερωτήσεις. Για εξατομικευμένη υποστήριξη, κλείσε 1:1 coaching session.",
    what_clients_say: "Τι Λένε οι Πελάτες",
    product_not_found: "Το προϊόν δεν βρέθηκε",
    anonymous: "Ανώνυμος",
    no_reviews_yet: "Δεν υπάρχουν κριτικές ακόμα",
    leave_review: "Αφήστε μια Κριτική",
    sign_in_to_review: "Συνδεθείτε για να αφήσετε μια κριτική",
    rating: "Αξιολόγηση",
    your_review: "Η Κριτική σας",
    share_experience: "Μοιραστείτε την εμπειρία σας..."
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
    footer_description: "Specialized training and nutrition programs for real transformation.",
    footer_by: "By Stefania Meraklis",
    quick_links: "Quick Links",
    about: "About",
    contact: "Contact",
    all_rights: "All rights reserved.",
    privacy_policy: "Privacy Policy",
    terms_of_service: "Terms of Service",
    
    // Programs Page
    programs_hero_title: "My Programs",
    programs_hero_subtitle: "Professional strength and transformation programs designed for real results.",
    faq1_question: "Who are these programs for?",
    faq1_answer: "The programs are for everyone - from beginners to advanced athletes. Each program includes clear instructions and can be adapted to your level.",
    faq2_question: "Do I need gym equipment?",
    faq2_answer: "Most programs require basic gym equipment (barbell, weights, bench). If you have questions about specific equipment, don't hesitate to ask!",
    faq3_question: "How long does each program last?",
    faq3_answer: "Duration ranges from 4 to 12 weeks depending on the program. Each product has detailed information about duration and content.",
    faq4_question: "Can I get personal guidance?",
    faq4_answer: "Yes! I offer 1:1 online coaching sessions for personalized guidance. Check the available programs or contact me for more information.",
    faq5_question: "What does the cost include?",
    faq5_answer: "The cost includes access to the complete program in PDF format with clear instructions, workout schedules, and all necessary materials to get started immediately.",
    
    // Meal Plans Page
    meal_plans_title: "Meal Plans",
    meal_plans_subtitle: "Customized meal plans will be available soon. Stay tuned!",
    coming_soon: "Coming Soon",
    coming_soon_description: "Customized meal plans will be available soon. Stay tuned!",
    find_ideal_plan: "Find Your Ideal Plan",
    find_ideal_plan_description: "Answer a few questions to find the right nutrition program for you.",
    body_weight: "Body Weight",
    under_60kg: "Under 60kg",
    weight_60_80kg: "60-80kg",
    over_80kg: "Over 80kg",
    activity_level: "Activity Level",
    select_activity: "Select activity level",
    sedentary: "Sedentary (little or no exercise)",
    moderate: "Moderate activity (exercise 3-5 times per week)",
    high: "High activity (exercise 6-7 times per week)",
    recommended_plan: "Recommended Plan",
    recommended_plan_description: "Based on your details, this plan will help you achieve your goals.",
    daily_calories: "Personalized calorie intake",
    recipes_tips: "100+ recipes and cooking tips",
    grocery_lists: "Weekly grocery lists",
    meal_alternatives: "Meal alternatives",
    recommended_price: "Recommended Price",
    buy_now_btn: "Buy Now",
    looking_for_package: "Looking for a Complete Package?",
    transformation_description: "Combine training and nutrition for maximum results with my Transformation Program.",
    weeks_training: "12 weeks of structured training",
    custom_meal_plan: "Custom meal plan",
    monthly_checkins: "Monthly progress check-ins",
    email_support: "Email support",
    learn_more: "Learn More",
    
    // Product Detail
    back_to_programs: "Back to Programs",
    back_to_programs_link: "Back to Programs",
    whats_included: "What's Included",
    duration: "Duration",
    duration_label: "Duration:",
    level: "Level",
    format: "Format",
    format_label: "Format:",
    buy_now_price: "Buy Now",
    secure_payment: "Secure payment via Stripe",
    about_program: "About the Program",
    who_is_this_for: "Who Is This For?",
    faq_title: "Frequently Asked Questions",
    faq_title_detail: "Frequently Asked Questions",
    faq_detail_q1: "How will I receive the program?",
    faq_detail_a1: "After purchase, you'll immediately receive an email with the program in PDF format.",
    faq_detail_q2: "Is it suitable for beginners?",
    faq_detail_a2: "Each program has clear instructions and adapts to your level. If you're a beginner, start with programs recommended for beginners.",
    faq_detail_q3: "Can I request a refund?",
    faq_detail_a3: "Due to the digital nature of the products, we don't offer refunds. If you have any questions before purchasing, don't hesitate to contact me!",
    faq_detail_q4: "Do I get additional support?",
    faq_detail_a4: "Yes! You can send an email to morefitlyfe@gmail.com for general questions. For personalized support, book a 1:1 coaching session.",
    faq_q1: "How will I receive the program?",
    faq_a1: "After purchase, you'll immediately receive an email with the program in PDF format.",
    faq_q2: "Is it suitable for beginners?",
    faq_a2: "Each program has clear instructions and adapts to your level. If you're a beginner, start with programs recommended for beginners.",
    faq_q3: "Can I request a refund?",
    faq_a3: "Due to the digital nature of the products, we don't offer refunds. If you have any questions before purchasing, don't hesitate to contact me!",
    faq_q4: "Do I get additional support?",
    faq_a4: "Yes! You can send an email to morefitlyfe@gmail.com for general questions. For personalized support, book a 1:1 coaching session.",
    what_clients_say: "What Clients Say",
    product_not_found: "Product Not Found",
    anonymous: "Anonymous",
    no_reviews_yet: "No reviews yet",
    leave_review: "Leave a Review",
    sign_in_to_review: "Sign in to leave a review",
    rating: "Rating",
    your_review: "Your Review",
    share_experience: "Share your experience..."
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("morefitlyfe-language");
    return (saved === "el" || saved === "en") ? saved : "el";
  });

  useEffect(() => {
    localStorage.setItem("morefitlyfe-language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "el" ? "en" : "el"));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.el] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      <div key={language} className="animate-fade-in">
        {children}
      </div>
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
