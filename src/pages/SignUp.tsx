import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Sparkles } from "lucide-react";

const SignUp = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Γίνε Μέλος του MoreFitLyfe</h1>
              <p className="text-lg text-muted-foreground">
                Ξεκίνα το ταξίδι μεταμόρφωσής σου σήμερα
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Free Account */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Δωρεάν Λογαριασμός
                  </CardTitle>
                  <CardDescription>
                    Πρόσβαση σε βασικό περιεχόμενο και updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">Newsletter με tips & tricks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">Πρόσβαση σε δωρεάν resources</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">Early bird offers για νέα προγράμματα</span>
                    </li>
                  </ul>
                  <p className="text-2xl font-bold mb-4">$0/μήνα</p>
                </CardContent>
              </Card>

              {/* Premium Membership */}
              <Card className="border-primary border-2 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Premium Membership
                  </CardTitle>
                  <CardDescription>
                    Πλήρης πρόσβαση σε όλο το premium περιεχόμενο
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">Όλα τα benefits του δωρεάν</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">Αποκλειστικά video tutorials</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">Live Q&A sessions μηνιαία</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">Πρόσβαση σε members-only community</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">20% έκπτωση σε όλα τα προγράμματα</span>
                    </li>
                  </ul>
                  <p className="text-2xl font-bold mb-4">$29/μήνα</p>
                </CardContent>
              </Card>
            </div>

            {/* Sign Up Form */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Δημιούργησε Λογαριασμό</CardTitle>
                <CardDescription>
                  Συμπλήρωσε τα στοιχεία σου για να ξεκινήσεις
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="free" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="free">Δωρεάν</TabsTrigger>
                    <TabsTrigger value="premium">Premium</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="free">
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Όνομα *</Label>
                          <Input id="firstName" placeholder="Το όνομά σου" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Επώνυμο *</Label>
                          <Input id="lastName" placeholder="Το επώνυμό σου" required />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" placeholder="email@example.com" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Κωδικός *</Label>
                        <Input id="password" type="password" placeholder="••••••••" required />
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox id="gdpr" required />
                        <Label htmlFor="gdpr" className="text-sm leading-tight cursor-pointer">
                          Συμφωνώ με την επεξεργασία των προσωπικών μου δεδομένων σύμφωνα με το GDPR *
                        </Label>
                      </div>

                      <Button type="submit" className="w-full bg-primary hover:bg-primary-glow" size="lg">
                        Δημιουργία Δωρεάν Λογαριασμού
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="premium">
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName-premium">Όνομα *</Label>
                          <Input id="firstName-premium" placeholder="Το όνομά σου" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName-premium">Επώνυμο *</Label>
                          <Input id="lastName-premium" placeholder="Το επώνυμό σου" required />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email-premium">Email *</Label>
                        <Input id="email-premium" type="email" placeholder="email@example.com" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password-premium">Κωδικός *</Label>
                        <Input id="password-premium" type="password" placeholder="••••••••" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight">Βάρος (kg)</Label>
                        <Input id="weight" type="number" placeholder="70" />
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox id="gdpr-premium" required />
                        <Label htmlFor="gdpr-premium" className="text-sm leading-tight cursor-pointer">
                          Συμφωνώ με την επεξεργασία των προσωπικών μου δεδομένων σύμφωνα με το GDPR *
                        </Label>
                      </div>

                      <div className="p-4 bg-primary/10 rounded-lg border border-primary">
                        <p className="text-sm mb-2">
                          Θα χρεωθείς <span className="font-bold text-primary">$29/μήνα</span> μετά από δωρεάν δοκιμή 7 ημερών
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Μπορείς να ακυρώσεις ανά πάσα στιγμή από τις ρυθμίσεις του λογαριασμού σου
                        </p>
                      </div>

                      <Button type="submit" className="w-full bg-primary hover:bg-primary-glow" size="lg">
                        Ξεκίνα Δωρεάν Δοκιμή
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Έχεις ήδη λογαριασμό?{" "}
                  <a href="#" className="text-primary hover:underline">
                    Σύνδεση
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUp;
