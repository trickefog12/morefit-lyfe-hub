import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle } from "lucide-react";
import mealGuide from "@/assets/meal-guide.jpg";

const MealPlans = () => {
  const [weight, setWeight] = useState<string>("");
  const [activity, setActivity] = useState<string>("");

  const getRecommendedPrice = () => {
    if (!weight || !activity) return null;
    
    // Simple pricing logic based on weight and activity
    const basePrice = weight === "light" ? 49 : weight === "medium" ? 59 : 69;
    const activityMultiplier = activity === "high" ? 1.2 : activity === "moderate" ? 1.1 : 1;
    return Math.round(basePrice * activityMultiplier);
  };

  const recommendedPrice = getRecommendedPrice();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={mealGuide}
              alt="Υγιεινές επιλογές γευμάτων"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 to-foreground/70" />
          </div>
          <div className="container relative z-10 mx-auto px-4 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Meal Plans & Διατροφή
              </h1>
              <p className="text-lg text-primary-foreground/90">
                Εξατομικευμένα διατροφολόγια βασισμένα στο βάρος και το επίπεδο δραστηριότητάς σου.
              </p>
            </div>
          </div>
        </section>

        {/* Meal Plan Selector */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Βρες το Ιδανικό σου Meal Plan</CardTitle>
                  <p className="text-muted-foreground">
                    Επέλεξε το βάρος και το επίπεδο δραστηριότητάς σου για να δεις το προτεινόμενο πλάνο και τιμή.
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Weight Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Βάρος Σώματος</Label>
                    <RadioGroup value={weight} onValueChange={setWeight}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light" />
                        <Label htmlFor="light" className="cursor-pointer">
                          Κάτω από 60kg
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium" className="cursor-pointer">
                          60-80kg
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="heavy" id="heavy" />
                        <Label htmlFor="heavy" className="cursor-pointer">
                          Πάνω από 80kg
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Activity Selection */}
                  <div className="space-y-4">
                    <Label htmlFor="activity" className="text-base font-semibold">
                      Επίπεδο Δραστηριότητας
                    </Label>
                    <Select value={activity} onValueChange={setActivity}>
                      <SelectTrigger id="activity">
                        <SelectValue placeholder="Επέλεξε επίπεδο δραστηριότητας" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Καθιστική (1-2 προπονήσεις/εβδ.)</SelectItem>
                        <SelectItem value="moderate">Μέτρια (3-4 προπονήσεις/εβδ.)</SelectItem>
                        <SelectItem value="high">Υψηλή (5+ προπονήσεις/εβδ.)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recommended Plan */}
                  {recommendedPrice && (
                    <div className="mt-8 p-6 bg-primary/10 rounded-lg border-2 border-primary">
                      <div className="flex items-start gap-3 mb-4">
                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-bold text-xl mb-2">Προτεινόμενο Πλάνο</h3>
                          <p className="text-muted-foreground mb-4">
                            Βάσει των επιλογών σου, προτείνουμε ένα εξατομικευμένο meal plan που περιλαμβάνει:
                          </p>
                          <ul className="space-y-2 mb-4">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-primary" />
                              <span>Καθημερινές θερμίδες & macros</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-primary" />
                              <span>Συνταγές και meal prep tips</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-primary" />
                              <span>Grocery lists</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-primary" />
                              <span>Εναλλακτικές επιλογές για κάθε γεύμα</span>
                            </li>
                          </ul>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Προτεινόμενη Τιμή</p>
                              <p className="text-3xl font-bold text-primary">${recommendedPrice}</p>
                            </div>
                            <Button size="lg" className="bg-primary hover:bg-primary-glow">
                              Αγόρασε Τώρα
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Transformation Program CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <Card className="max-w-4xl mx-auto border-secondary">
              <CardContent className="pt-8">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-4">
                      Ψάχνεις για Ολοκληρωμένο Πακέτο;
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Το <span className="font-semibold">12-Week Transformation Program</span> περιλαμβάνει ήδη εξατομικευμένο meal guide μαζί με το πλήρες πρόγραμμα προπόνησης και υποστήριξη!
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>12 εβδομάδες προπόνησης</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>Custom meal plan βάσει των στόχων σου</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>Monthly check-ins</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>Email support</span>
                      </li>
                    </ul>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-primary">$199</span>
                      <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                        Μάθε Περισσότερα
                      </Button>
                    </div>
                  </div>
                  <div className="w-full md:w-64 h-64 rounded-lg overflow-hidden">
                    <img
                      src={mealGuide}
                      alt="Transformation program meal guide"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MealPlans;
