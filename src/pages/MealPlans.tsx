import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle } from "lucide-react";
import mealGuide from "@/assets/meal-guide.jpg";

const MealPlans = () => {
  const { t } = useLanguage();
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
                {t("meal_plans_title")}
              </h1>
              <p className="text-lg text-primary-foreground/90">
                {t("meal_plans_subtitle")}
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
                  <CardTitle className="text-2xl">{t("find_ideal_plan")}</CardTitle>
                  <p className="text-muted-foreground">
                    {t("find_ideal_plan_description")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Weight Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">{t("body_weight")}</Label>
                    <RadioGroup value={weight} onValueChange={setWeight}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light" />
                        <Label htmlFor="light" className="cursor-pointer">
                          {t("under_60kg")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium" className="cursor-pointer">
                          {t("weight_60_80kg")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="heavy" id="heavy" />
                        <Label htmlFor="heavy" className="cursor-pointer">
                          {t("over_80kg")}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Activity Selection */}
                  <div className="space-y-4">
                    <Label htmlFor="activity" className="text-base font-semibold">
                      {t("activity_level")}
                    </Label>
                    <Select value={activity} onValueChange={setActivity}>
                      <SelectTrigger id="activity">
                        <SelectValue placeholder={t("select_activity")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">{t("sedentary")}</SelectItem>
                        <SelectItem value="moderate">{t("moderate")}</SelectItem>
                        <SelectItem value="high">{t("high")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recommended Plan */}
                  {recommendedPrice && (
                    <div className="mt-8 p-6 bg-primary/10 rounded-lg border-2 border-primary">
                      <div className="flex items-start gap-3 mb-4">
                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-bold text-xl mb-2">{t("recommended_plan")}</h3>
                          <p className="text-muted-foreground mb-4">
                            {t("recommended_plan_description")}
                          </p>
                          <ul className="space-y-2 mb-4">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-primary" />
                              <span>{t("daily_calories")}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-primary" />
                              <span>{t("recipes_tips")}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-primary" />
                              <span>{t("grocery_lists")}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-primary" />
                              <span>{t("meal_alternatives")}</span>
                            </li>
                          </ul>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">{t("recommended_price")}</p>
                              <p className="text-3xl font-bold text-primary">${recommendedPrice}</p>
                            </div>
                            <Button size="lg" className="bg-primary hover:bg-primary-glow">
                              {t("buy_now_btn")}
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
                      {t("looking_for_package")}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {t("transformation_description")}
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{t("weeks_training")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{t("custom_meal_plan")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{t("monthly_checkins")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{t("email_support")}</span>
                      </li>
                    </ul>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-primary">$199</span>
                      <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                        {t("learn_more")}
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
