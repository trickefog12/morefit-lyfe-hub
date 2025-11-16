import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, CreditCard, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Purchase {
  id: string;
  product_sku: string;
  amount_paid: number;
  status: string;
  purchased_at: string;
  download_token: string;
  products: {
    name_en: string;
    name_el: string;
    description_en: string;
    description_el: string;
    image_url: string;
  };
}

export default function MyPurchases() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view your purchases.",
        variant: "destructive",
      });
      navigate("/signup");
    }
  }, [user, authLoading, navigate, toast]);

  const { data: purchases, isLoading } = useQuery({
    queryKey: ["my-purchases", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("purchases")
        .select(`
          *,
          products!inner(
            name_en,
            name_el,
            description_en,
            description_el,
            image_url
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      return data as Purchase[];
    },
    enabled: !!user,
  });

  const handleDownload = async (token: string, productName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in again to download.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Preparing Download",
        description: "Your file is being retrieved...",
      });

      // Construct the download URL with auth token
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const downloadUrl = `${projectUrl}/functions/v1/download-file/${token}`;
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${productName}.pdf`;
      
      // Add authorization header by fetching the file
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          const retryAfterHours = Math.ceil((error.retryAfter || 86400) / 3600);
          throw new Error(`Rate limit exceeded. You can download again in ${retryAfterHours} hours.`);
        }
        
        throw new Error(error.message || 'Download failed');
      }

      // Create blob and trigger download
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast({
        title: "Download Complete",
        description: `${productName} has been downloaded successfully.`,
      });
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: error.message || "Unable to download file. Please contact support if the issue persists.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Purchases</h1>
            <p className="text-muted-foreground">
              Access all your purchased programs and download materials
            </p>
          </div>

          {/* Empty State */}
          {purchases && purchases.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Purchases Yet</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Start your fitness journey by purchasing one of our programs
                </p>
                <Button onClick={() => navigate("/programs")}>
                  Browse Programs
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Purchases Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {purchases?.map((purchase) => (
              <Card key={purchase.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden bg-muted">
                  {purchase.products.image_url ? (
                    <img
                      src={purchase.products.image_url}
                      alt={purchase.products.name_en}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  <Badge 
                    className="absolute top-4 right-4"
                    variant={purchase.status === "completed" ? "default" : "secondary"}
                  >
                    {purchase.status}
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl">
                    {purchase.products.name_en}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {purchase.products.description_en}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Purchase Details */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(purchase.purchased_at), "MMM dd, yyyy")}
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      €{purchase.amount_paid.toFixed(2)}
                    </div>
                  </div>

                  {/* Download Button */}
                  <Button 
                    className="w-full gap-2"
                    onClick={() => handleDownload(purchase.download_token, purchase.products.name_en)}
                  >
                    <Download className="h-4 w-4" />
                    Download Program
                  </Button>

                  {/* Download Token (for reference) */}
                  <div className="text-xs text-muted-foreground text-center">
                    Token: {purchase.download_token.slice(0, 8)}...
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Help Section */}
          {purchases && purchases.length > 0 && (
            <Card className="mt-8 border-primary/20 bg-primary/5">
              <CardContent className="py-6">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  If you're having trouble downloading your programs or have any questions,
                  please contact our support team. Your download links are permanent and you
                  can access them anytime.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
