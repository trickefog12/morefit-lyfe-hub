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
    featured_title: "Δημοφιλά Προγράμματα",
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
    
    // Programs Page
    programs_hero_title: "Τα Προγράμματά μου",
    programs_hero_subtitle: "Επαγγελματικά σχεδιασμένα προγράμματα για κάθε επίπεδο και στόχο. Από powerlifting και υπερτροφία μέχρι κινητικότητα και on-the-go workouts.",
    
    // FAQ
    faq_title: "Συχνές Ερωτήσεις",
    faq1_question: "Πώς λαμβάνω το πρόγραμμά μου;",
    faq1_answer: "Αμέσως μετά την αγορά, θα λάβεις ένα email με link για να κατεβάσεις το πρόγραμμά σου. Τα αρχεία είναι σε PDF μορφή και μπορείς να τα έχεις πάντα μαζί σου.",
    faq2_question: "Είμαι αρχάριος/α. Ποιο πρόγραμμα μου ταιριάζει;",
    faq2_answer: "Το \"Πρόγραμμα Powerlifting 3 Μηνών\" και το \"At-Home Workouts\" είναι ιδανικά για αρχάριους. Εναλλακτικά, κλείσε μια 1:1 session για εξατομικευμένη καθοδήγηση!",
    faq3_question: "Μπορώ να ακολουθήσω πρόγραμμα στο σπίτι;",
    faq3_answer: "Ναι! Το \"At-Home or On-the-Go Workouts\" και το \"Kettlebell Program\" μπορούν να γίνουν εξ ολοκλήρου στο σπίτι με μηδενικό ή ελάχιστο εξοπλισμό.",
    faq4_question: "Τι περιλαμβάνει το Transformation Program;",
    faq4_answer: "Το πρόγραμμα μεταμόρφωσης περιλαμβάνει 12 εβδομάδες προπόνησης, εξατομικευμένο meal plan, monthly check-ins και email υποστήριξη καθ' όλη τη διάρκεια.",
    faq5_question: "Υπάρχει εγγύηση επιστροφής χρημάτων;",
    faq5_answer: "Λόγω του ψηφιακού χαρακτήρα των προϊόντων, δεν προσφέρουμε επιστροφές. Ωστόσο, αν έχεις οποιαδήποτε απορία πριν την αγορά, στείλε μου email!",
    
    // Meal Plans
    meal_plans_title: "Meal Plans & Διατροφή",
    meal_plans_subtitle: "Εξατομικευμένα διατροφολόγια βασισμένα στο βάρος και το επίπεδο δραστηριότητάς σου.",
    find_ideal_plan: "Βρες το Ιδανικό σου Meal Plan",
    find_ideal_plan_description: "Επέλεξε το βάρος και το επίπεδο δραστηριότητάς σου για να δεις το προτεινόμενο πλάνο και τιμή.",
    body_weight: "Βάρος Σώματος",
    under_60kg: "Κάτω από 60kg",
    weight_60_80kg: "60-80kg",
    over_80kg: "Πάνω από 80kg",
    activity_level: "Επίπεδο Δραστηριότητας",
    select_activity: "Επέλεξε επίπεδο δραστηριότητας",
    sedentary: "Καθιστική (1-2 προπονήσεις/εβδ.)",
    moderate: "Μέτρια (3-4 προπονήσεις/εβδ.)",
    high: "Υψηλή (5+ προπονήσεις/εβδ.)",
    recommended_plan: "Προτεινόμενο Πλάνο",
    recommended_plan_description: "Βάσει των επιλογών σου, προτείνουμε ένα εξατομικευμένο meal plan που περιλαμβάνει:",
    daily_calories: "Καθημερινές θερμίδες & macros",
    recipes_tips: "Συνταγές και meal prep tips",
    grocery_lists: "Grocery lists",
    meal_alternatives: "Εναλλακτικές επιλογές για κάθε γεύμα",
    recommended_price: "Προτεινόμενη Τιμή",
    buy_now_btn: "Αγόρασε Τώρα",
    looking_for_package: "Ψάχνεις για Ολοκληρωμένο Πακέτο;",
    transformation_description: "Το 12-Week Transformation Program περιλαμβάνει ήδη εξατομικευμένο meal guide μαζί με το πλήρες πρόγραμμα προπόνησης και υποστήριξη!",
    weeks_training: "12 εβδομάδες προπόνησης",
    custom_meal_plan: "Custom meal plan βάσει των στόχων σου",
    monthly_checkins: "Monthly check-ins",
    email_support: "Email support",
    learn_more: "Μάθε Περισσότερα",
    
    // Footer
    footer_description: "Γίνε η καλύτερη έκδοση του εαυτού σου με προγράμματα δύναμης και εξατομικευμένη υποστήριξη.",
    footer_by: "by M. Stefania Meraklis",
    quick_links: "Γρήγοροι Σύνδεσμοι",
    contact: "Επικοινωνία",
    all_rights: "All rights reserved.",
    privacy_policy: "Privacy Policy",
    terms_of_service: "Terms of Service",
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
    hero_description: "Strength programs, personalized meal plans, and support for real transformation.",
    buy_now: "Buy Now",
    become_member: "Become a Member",
    
    // About Section
    about_title: "Hi, I'm Stefania!",
    about_p1: "As a certified strength and nutrition coach, I've helped hundreds of people discover their strength - not just in the gym, but in their lives.",
    about_p2: "My philosophy is simple: strength is built with consistency, support, and the right guidance. It's not about extreme diets or unrealistic goals - it's about sustainable transformation that lasts.",
    about_p3: "Whatever your goal - losing fat, building muscle, getting stronger - I'm here to support you every step of the way.",
    
    // Featured Products
    featured_title: "Popular Programs",
    featured_description: "Choose the program that fits your goals and start your transformation today.",
    view_all_programs: "View All Programs",
    
    // How It Works
    how_it_works: "How It Works",
    how_it_works_subtitle: "Three simple steps to start your journey",
    step1_title: "1. Assessment",
    step1_description: "Choose the program that fits your goals and level.",
    step2_title: "2. Training",
    step2_description: "Follow the structured program with clear instructions and support.",
    step3_title: "3. Transformation",
    step3_description: "See real results and become the best version of yourself.",
    
    // Testimonials
    testimonials_title: "What My Clients Say",
    testimonial1: "The powerlifting program helped me achieve PRs in all lifts! Stefania knows what she's doing.",
    testimonial1_author: "— Maria K.",
    testimonial2: "The transformation program changed my life. I lost 12kg and feel amazing!",
    testimonial2_author: "— Eleni P.",
    testimonial3: "Best investment I made! The programs are clear and effective.",
    testimonial3_author: "— George M.",
    
    // CTA
    cta_title: "Ready to Start?",
    cta_description: "Don't wait any longer. Your journey to becoming the best version of yourself starts today.",
    view_programs: "View Programs",
    
    // Programs Page
    programs_hero_title: "My Programs",
    programs_hero_subtitle: "Professionally designed programs for every level and goal. From powerlifting and hypertrophy to mobility and on-the-go workouts.",
    
    // FAQ
    faq_title: "Frequently Asked Questions",
    faq1_question: "How do I receive my program?",
    faq1_answer: "Right after purchase, you'll receive an email with a link to download your program. Files are in PDF format and you can always have them with you.",
    faq2_question: "I'm a beginner. Which program suits me?",
    faq2_answer: "The \"3-Month Powerlifting Program\" and \"At-Home Workouts\" are ideal for beginners. Alternatively, book a 1:1 session for personalized guidance!",
    faq3_question: "Can I follow a program at home?",
    faq3_answer: "Yes! The \"At-Home or On-the-Go Workouts\" and \"Kettlebell Program\" can be done entirely at home with zero or minimal equipment.",
    faq4_question: "What does the Transformation Program include?",
    faq4_answer: "The transformation program includes 12 weeks of training, a personalized meal plan, monthly check-ins, and email support throughout.",
    faq5_question: "Is there a money-back guarantee?",
    faq5_answer: "Due to the digital nature of the products, we don't offer refunds. However, if you have any questions before purchasing, send me an email!",
    
    // Meal Plans
    meal_plans_title: "Meal Plans & Nutrition",
    meal_plans_subtitle: "Personalized meal plans based on your weight and activity level.",
    find_ideal_plan: "Find Your Ideal Meal Plan",
    find_ideal_plan_description: "Select your weight and activity level to see the recommended plan and price.",
    body_weight: "Body Weight",
    under_60kg: "Under 60kg",
    weight_60_80kg: "60-80kg",
    over_80kg: "Over 80kg",
    activity_level: "Activity Level",
    select_activity: "Select activity level",
    sedentary: "Sedentary (1-2 workouts/week)",
    moderate: "Moderate (3-4 workouts/week)",
    high: "High (5+ workouts/week)",
    recommended_plan: "Recommended Plan",
    recommended_plan_description: "Based on your selections, we recommend a personalized meal plan that includes:",
    daily_calories: "Daily calories & macros",
    recipes_tips: "Recipes and meal prep tips",
    grocery_lists: "Grocery lists",
    meal_alternatives: "Alternative options for each meal",
    recommended_price: "Recommended Price",
    buy_now_btn: "Buy Now",
    looking_for_package: "Looking for a Complete Package?",
    transformation_description: "The 12-Week Transformation Program already includes a personalized meal guide along with the full training program and support!",
    weeks_training: "12 weeks of training",
    custom_meal_plan: "Custom meal plan based on your goals",
    monthly_checkins: "Monthly check-ins",
    email_support: "Email support",
    learn_more: "Learn More",
    
    // Footer
    footer_description: "Become the best version of yourself with strength programs and personalized support.",
    footer_by: "by M. Stefania Meraklis",
    quick_links: "Quick Links",
    contact: "Contact",
    all_rights: "All rights reserved.",
    privacy_policy: "Privacy Policy",
    terms_of_service: "Terms of Service",
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
