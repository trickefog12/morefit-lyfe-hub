import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Mail, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mealGuide from "@/assets/meal-guide.jpg";

const MealPlans = () => {
  const { language, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isGreek = language === "el";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error(isGreek ? "Παρακαλώ εισάγετε ένα έγκυρο email." : "Please enter a valid email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("meal_plan_waitlist" as any)
        .insert({ email: trimmed, goal: goal || null } as any);

      if (error) {
        if (error.code === "23505") {
          // Duplicate — still treat as success
          setSubmitted(true);
          return;
        }
        throw error;
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Waitlist error:", err);
      toast.error(isGreek ? "Κάτι πήγε στραβά. Δοκίμασε ξανά." : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const bullets = isGreek
    ? [
        "Εξατομικευμένο πρόγραμμα διατροφής βασισμένο στους στόχους σου",
        "Εβδομαδιαίες λίστες αγορών και εύκολες συνταγές",
        "Καθοδήγηση μακροθρεπτικών συστατικών ανά γεύμα",
        "Εναλλακτικές επιλογές για αλλεργίες και προτιμήσεις",
      ]
    : [
        "Personalized nutrition plan based on your goals",
        "Weekly grocery lists and easy recipes",
        "Macronutrient guidance per meal",
        "Alternative options for allergies and preferences",
      ];

  const goalOptions = isGreek
    ? [
        { value: "fat_loss", label: "Απώλεια λίπους" },
        { value: "muscle_gain", label: "Μυϊκή ανάπτυξη" },
        { value: "maintenance", label: "Διατήρηση βάρους" },
        { value: "performance", label: "Αθλητική απόδοση" },
      ]
    : [
        { value: "fat_loss", label: "Fat loss" },
        { value: "muscle_gain", label: "Muscle gain" },
        { value: "maintenance", label: "Weight maintenance" },
        { value: "performance", label: "Athletic performance" },
      ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={mealGuide}
              alt={isGreek ? "Υγιεινά γεύματα" : "Healthy meals"}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 to-foreground/70" />
          </div>
          <div className="container relative z-10 mx-auto px-4 lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                {isGreek ? "Σύντομα Διαθέσιμο" : "Coming Soon"}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                {isGreek ? "Εξατομικευμένα Διαιτολόγια" : "Personalized Meal Plans"}
              </h1>
              <p className="text-lg text-primary-foreground/90">
                {isGreek
                  ? "Ετοιμάζουμε κάτι ειδικό για εσένα. Γράψου στη λίστα και θα ειδοποιηθείς πρώτος/η."
                  : "We're preparing something special for you. Join the waitlist and be the first to know."}
              </p>
            </div>
          </div>
        </section>

        {/* Waitlist Form */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-lg mx-auto">
              {submitted ? (
                <Card className="border-primary/30">
                  <CardContent className="py-12 text-center space-y-4">
                    <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">
                      {isGreek ? "Είσαι στη λίστα!" : "You're on the list!"}
                    </h2>
                    <p className="text-muted-foreground">
                      {isGreek
                        ? "Θα ειδοποιηθείς πρώτος/η όταν ανοίξουν τα εξατομικευμένα διαιτολόγια."
                        : "You'll be the first to know when personalized meal plans launch."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-8 pb-8 space-y-6">
                    <div className="text-center space-y-2">
                      <Mail className="h-8 w-8 text-primary mx-auto" />
                      <h2 className="text-xl font-bold">
                        {isGreek ? "Γράψου στη Λίστα Αναμονής" : "Join the Waitlist"}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {isGreek
                          ? "Θα ειδοποιηθείς πρώτος/η όταν ανοίξουν τα εξατομικευμένα διαιτολόγια."
                          : "You'll be the first to know when personalized meal plans launch."}
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="waitlist-email">Email *</Label>
                        <Input
                          id="waitlist-email"
                          type="email"
                          required
                          maxLength={255}
                          placeholder={isGreek ? "to-email-sou@example.com" : "your-email@example.com"}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="waitlist-goal">
                          {isGreek ? "Στόχος (προαιρετικό)" : "Goal (optional)"}
                        </Label>
                        <Select value={goal} onValueChange={setGoal}>
                          <SelectTrigger id="waitlist-goal">
                            <SelectValue
                              placeholder={isGreek ? "Επέλεξε στόχο" : "Select a goal"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {goalOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-glow font-semibold"
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? isGreek
                            ? "Αποστολή..."
                            : "Submitting..."
                          : isGreek
                          ? "Θέλω να ειδοποιηθώ"
                          : "Notify Me"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* What Will Be Included */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">
                {isGreek ? "Τι θα περιλαμβάνει" : "What Will Be Included"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {isGreek
                  ? "Η τελική μορφή μπορεί να αλλάξει — αυτά είναι τα σχέδιά μας."
                  : "The final format may change — here's what we're planning."}
              </p>
            </div>
            <div className="max-w-lg mx-auto space-y-3">
              {bullets.map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MealPlans;
