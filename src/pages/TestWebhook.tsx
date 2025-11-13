import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function TestWebhook() {
  const [loading, setLoading] = useState(false);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<any[]>([]);

  const createTestCheckout = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in first to test checkout");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          productSku: 'strength-program',
          successUrl: `${window.location.origin}/test-webhook?success=true`,
          cancelUrl: `${window.location.origin}/test-webhook?canceled=true`,
        }
      });

      if (error) throw error;

      setSessionUrl(data.url);
      toast.success("Checkout session created! Opening Stripe...");
      
      // Open in new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      toast.error(error.message || "Failed to create checkout session");
    } finally {
      setLoading(false);
    }
  };

  const checkPurchases = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to check purchases");
        return;
      }

      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPurchases(data || []);
      toast.success(`Found ${data?.length || 0} purchases`);
    } catch (error: any) {
      console.error("Error fetching purchases:", error);
      toast.error(error.message || "Failed to fetch purchases");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Webhook Test</CardTitle>
              <CardDescription>
                Test the webhook handler by creating a test payment. Use Stripe's test card: 4242 4242 4242 4242
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Test Steps:</strong>
                  <ol className="list-decimal ml-4 mt-2 space-y-1">
                    <li>Click "Create Test Checkout" below</li>
                    <li>Complete the payment with test card: 4242 4242 4242 4242</li>
                    <li>Any future expiry date and any CVC</li>
                    <li>After payment, click "Check Purchases" to verify</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button 
                  onClick={createTestCheckout} 
                  disabled={loading}
                  size="lg"
                >
                  {loading ? "Creating..." : "Create Test Checkout"}
                </Button>

                <Button 
                  onClick={checkPurchases} 
                  variant="outline"
                  size="lg"
                >
                  Check Purchases
                </Button>
              </div>

              {sessionUrl && (
                <Alert>
                  <AlertDescription>
                    Checkout session created! The Stripe checkout should open in a new tab.
                    If not, <a href={sessionUrl} target="_blank" rel="noopener noreferrer" className="underline">click here</a>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {purchases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Purchases</CardTitle>
                <CardDescription>Purchases created by webhook</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">Product: {purchase.product_sku}</p>
                          <p className="text-sm text-muted-foreground">
                            Amount: €{purchase.amount_paid}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Status: <span className={purchase.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
                              {purchase.status}
                            </span>
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{new Date(purchase.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      {purchase.download_token && (
                        <p className="text-xs text-muted-foreground">
                          Token: {purchase.download_token.substring(0, 20)}...
                        </p>
                      )}
                      {purchase.stripe_payment_intent_id && (
                        <p className="text-xs text-muted-foreground">
                          Payment Intent: {purchase.stripe_payment_intent_id}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
