export interface Product {
  sku: string;
  name: string;
  nameEn: string;
  price: number;
  description: string;
  descriptionEn: string;
  shortBenefit: string;
  shortBenefitEn: string;
  deliverables: string[];
  deliverablesEn: string[];
  targetAudience: string;
  targetAudienceEn: string;
  duration: string;
  format: "pdf" | "video" | "coach" | "custom";
  category: "strength" | "transformation" | "mobility" | "coaching";
  image: string;
}

export const products: Product[] = [
  {
    sku: "MFL-PL1",
    name: "Πρόγραμμα Powerlifting 3 Μηνών",
    nameEn: "3 Month Beginner & Intermediate Powerlifting Program",
    price: 40,
    shortBenefit: "Χτίσε δύναμη με επαγγελματική καθοδήγηση",
    shortBenefitEn: "Build serious strength with professional guidance",
    description: "Ένα ολοκληρωμένο 12-εβδομαδιαίο πρόγραμμα powerlifting σχεδιασμένο για αρχάριους και ενδιάμεσους αθλητές. Το πρόγραμμα εστιάζει στην ανάπτυξη τεχνικής και δύναμης στα τρία κύρια lifts: squat, bench press και deadlift. Περιλαμβάνει λεπτομερείς οδηγίες για κάθε άσκηση, προοδευτική υπερφόρτιση και στρατηγικές ανάρρωσης.",
    descriptionEn: "A comprehensive 12-week powerlifting program designed for beginner and intermediate athletes. The program focuses on developing technique and strength in the three main lifts: squat, bench press, and deadlift. Includes detailed instructions for each exercise, progressive overload, and recovery strategies.",
    deliverables: [
      "12 εβδομάδες δομημένης προπόνησης",
      "Λεπτομερείς οδηγίες για squat, bench press, deadlift",
      "Πρόγραμμα προοδευτικής υπερφόρτισης",
      "Οδηγίες τεχνικής και φόρμας",
      "Στρατηγικές ανάκαμψης",
      "PDF αρχείο για άμεση λήψη"
    ],
    deliverablesEn: [
      "12 weeks of structured training",
      "Detailed instructions for squat, bench press, deadlift",
      "Progressive overload programming",
      "Technique and form guidance",
      "Recovery strategies",
      "Downloadable PDF file"
    ],
    targetAudience: "Αρχάριοι και ενδιάμεσοι αθλητές που θέλουν να αναπτύξουν δύναμη και να βελτιώσουν την τεχνική τους στο powerlifting.",
    targetAudienceEn: "Beginner and intermediate athletes who want to develop strength and improve their powerlifting technique.",
    duration: "12 εβδομάδες / 12 weeks",
    format: "pdf",
    category: "strength",
    image: "/assets/program-strength.jpg"
  },
  {
    sku: "MFL-COACH",
    name: "1:1 Online Coaching Session",
    nameEn: "1:1 Online Coaching Session",
    price: 45,
    shortBenefit: "Προσωπική καθοδήγηση από έμπειρη coach",
    shortBenefitEn: "Personal guidance from experienced coach",
    description: "Μια ωριαία συνεδρία 1:1 coaching μαζί μου! Θα αναλύσουμε τους στόχους σου, θα δημιουργήσουμε στρατηγική, και θα απαντήσω σε όλες τις ερωτήσεις σου. Ιδανικό για εξατομικευμένη καθοδήγηση.",
    descriptionEn: "A one-hour 1:1 coaching session with me! We'll analyze your goals, create a strategy, and I'll answer all your questions. Perfect for personalized guidance.",
    deliverables: [
      "60 λεπτά live video call",
      "Ανάλυση στόχων και προκλήσεων",
      "Εξατομικευμένες συμβουλές",
      "Form check (αν χρειάζεται)",
      "Action plan",
      "Follow-up email με notes"
    ],
    deliverablesEn: [
      "60-minute live video call",
      "Goals and challenges analysis",
      "Personalized advice",
      "Form check (if needed)",
      "Action plan",
      "Follow-up email with notes"
    ],
    targetAudience: "Όποιος θέλει προσωπική καθοδήγηση για συγκεκριμένα ζητήματα.",
    targetAudienceEn: "Anyone wanting personal guidance for specific issues.",
    duration: "60 λεπτά / 60 minutes",
    format: "coach",
    category: "coaching",
    image: "/assets/coaching-session.jpg"
  },
  {
    sku: "MFL-PL2",
    name: "Πρόγραμμα Δύναμης & Υπερτροφίας 12 Εβδομάδων",
    nameEn: "12-Week Strength & Hypertrophy Program",
    price: 30,
    shortBenefit: "Χτίσε μυϊκή μάζα και δύναμη ταυτόχρονα",
    shortBenefitEn: "Build muscle mass and strength simultaneously",
    description: "Ένα ισορροπημένο πρόγραμμα που συνδυάζει προπόνηση δύναμης με υπερτροφία για να μεγιστοποιήσει τόσο τη μυϊκή ανάπτυξη όσο και τα κιλά που σηκώνεις. Ιδανικό για όσους θέλουν να δουν αποτελέσματα στον καθρέφτη και στη μπάρα.",
    descriptionEn: "A balanced program that combines strength training with hypertrophy to maximize both muscle development and lifting capacity. Perfect for those who want to see results in the mirror and on the bar.",
    deliverables: [
      "12 εβδομάδες εξειδικευμένης προπόνησης",
      "Συνδυασμός δύναμης και υπερτροφίας",
      "Λεπτομερή workout plans",
      "Καθοδήγηση για progressive overload",
      "Συμβουλές διατροφής για μυϊκή ανάπτυξη",
      "PDF με video links"
    ],
    deliverablesEn: [
      "12 weeks of specialized training",
      "Combination of strength and hypertrophy",
      "Detailed workout plans",
      "Progressive overload guidance",
      "Nutrition tips for muscle growth",
      "PDF with video links"
    ],
    targetAudience: "Αθλητές που θέλουν να αυξήσουν τη μυϊκή μάζα χωρίς να χάσουν τη δύναμή τους.",
    targetAudienceEn: "Athletes who want to increase muscle mass without losing their strength.",
    duration: "12 εβδομάδες / 12 weeks",
    format: "pdf",
    category: "strength",
    image: "/assets/program-strength.jpg"
  },
  {
    sku: "MFL-PDF1",
    name: "Προπονήσεις για Σπίτι ή On-the-Go",
    nameEn: "At-Home or On-the-Go Workouts",
    price: 15,
    shortBenefit: "Προπόνηση οπουδήποτε, χωρίς εξοπλισμό",
    shortBenefitEn: "Train anywhere, no equipment needed",
    description: "Ένα ευέλικτο πρόγραμμα προπόνησης που μπορείς να ακολουθήσεις στο σπίτι, στο πάρκο ή στο δωμάτιο του ξενοδοχείου. Δεν χρειάζεσαι εξοπλισμό - μόνο το βάρος του σώματός σου και τη θέλησή σου!",
    descriptionEn: "A flexible training program you can follow at home, in the park, or in your hotel room. No equipment needed - just your bodyweight and determination!",
    deliverables: [
      "20+ ασκήσεις με βάρος σώματος",
      "Προπονήσεις 20-45 λεπτών",
      "3 επίπεδα δυσκολίας",
      "Video demonstrations",
      "Οδηγίες για progression",
      "Άμεση λήψη PDF"
    ],
    deliverablesEn: [
      "20+ bodyweight exercises",
      "20-45 minute workouts",
      "3 difficulty levels",
      "Video demonstrations",
      "Progression guidelines",
      "Instant PDF download"
    ],
    targetAudience: "Ιδανικό για όσους ταξιδεύουν συχνά ή δεν έχουν πρόσβαση σε γυμναστήριο.",
    targetAudienceEn: "Perfect for frequent travelers or those without gym access.",
    duration: "Flexible / Ευέλικτο",
    format: "pdf",
    category: "strength",
    image: "/assets/program-strength.jpg"
  },
  {
    sku: "MFL-PDF2",
    name: "Πρόγραμμα Kettlebell",
    nameEn: "Kettlebell Program",
    price: 15,
    shortBenefit: "Ολοκληρωμένη προπόνηση με ένα kettlebell",
    shortBenefitEn: "Complete workout with just one kettlebell",
    description: "Ανακάλυψε τη δύναμη του kettlebell training! Αυτό το πρόγραμμα σου δείχνει πώς να χτίσεις δύναμη, αντοχή και λειτουργική φυσική κατάσταση με ένα απλό kettlebell.",
    descriptionEn: "Discover the power of kettlebell training! This program shows you how to build strength, endurance, and functional fitness with just one simple kettlebell.",
    deliverables: [
      "8 εβδομάδες προγράμματος kettlebell",
      "Τεχνική για 15+ ασκήσεις kettlebell",
      "Workouts για όλο το σώμα",
      "Video tutorials",
      "Οδηγίες ασφάλειας",
      "PDF με εικόνες και οδηγίες"
    ],
    deliverablesEn: [
      "8-week kettlebell program",
      "Technique for 15+ kettlebell exercises",
      "Full-body workouts",
      "Video tutorials",
      "Safety guidelines",
      "PDF with images and instructions"
    ],
    targetAudience: "Κατάλληλο για όλα τα επίπεδα που θέλουν να εξερευνήσουν το kettlebell training.",
    targetAudienceEn: "Suitable for all levels wanting to explore kettlebell training.",
    duration: "8 εβδομάδες / 8 weeks",
    format: "pdf",
    category: "strength",
    image: "/assets/program-strength.jpg"
  },
  {
    sku: "MFL-MOB",
    name: "Πρόγραμμα Κινητικότητας για Γραφειακούς",
    nameEn: "Mobility Program for Desk Workers",
    price: 15,
    shortBenefit: "Απαλλαγή από πόνους λόγω καθιστικής ζωής",
    shortBenefitEn: "Relief from sedentary lifestyle pains",
    description: "Ειδικά σχεδιασμένο για όσους περνούν πολλές ώρες καθιστοί. Βελτίωσε την κινητικότητα, μείωσε τους πόνους στην πλάτη και τον αυχένα, και αισθάνσου πιο ενεργός/ή κάθε μέρα.",
    descriptionEn: "Specially designed for those who spend many hours sitting. Improve mobility, reduce back and neck pain, and feel more energized every day.",
    deliverables: [
      "6 εβδομάδες mobility routines",
      "Ασκήσεις για γραφείο (5-10 λεπτά)",
      "Stretching routines",
      "Διορθωτικές ασκήσεις",
      "Video demonstrations",
      "Tips για καλύτερη στάση"
    ],
    deliverablesEn: [
      "6 weeks of mobility routines",
      "Office exercises (5-10 minutes)",
      "Stretching routines",
      "Corrective exercises",
      "Video demonstrations",
      "Posture improvement tips"
    ],
    targetAudience: "Γραφειακοί εργαζόμενοι και όποιος έχει καθιστική ζωή.",
    targetAudienceEn: "Office workers and anyone with a sedentary lifestyle.",
    duration: "6 εβδομάδες / 6 weeks",
    format: "pdf",
    category: "mobility",
    image: "/assets/program-strength.jpg"
  }
];
